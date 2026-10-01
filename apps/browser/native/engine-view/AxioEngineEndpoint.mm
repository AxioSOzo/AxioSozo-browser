/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Gecko side of contracts/engine-surface-v1.md. engine_surface_v1.h in this
// directory is a byte-identical copy of native/chromium-host/engine_surface_v1.h.
// Design, threading and security: docs/design/engine-view-gecko.md.

#include "AxioEngineEndpoint.h"

#import <Metal/Metal.h>

#include <CoreVideo/CVPixelBuffer.h>
#include <IOSurface/IOSurfaceRef.h>
#include <bsm/libbsm.h>
#include <libproc.h>
#include <mach/notify.h>
#include <servers/bootstrap.h>
#include <sys/proc_info.h>
#include <unistd.h>

#include <atomic>
#include <cmath>

#include "ImageContainer.h"
#include "MacIOSurfaceImage.h"
#include "gfxPlatform.h"
#include "js/Array.h"
#include "js/PropertyAndElement.h"
#include "jsapi.h"
#include "mozilla/Logging.h"
#include "mozilla/Mutex.h"
#include "mozilla/Preferences.h"
#include "mozilla/RandomNum.h"
#include "mozilla/VsyncDispatcher.h"
#include "mozilla/dom/Element.h"
#include "mozilla/dom/HTMLCanvasElement.h"
#include "mozilla/gfx/MacIOSurface.h"
#include "nsContentUtils.h"
#include "nsThreadUtils.h"
#include "nsXULAppAPI.h"

static mozilla::LazyLogModule sEngineViewLog("AxioEngineView");
#define EV_LOG(...) \
  MOZ_LOG(sEngineViewLog, mozilla::LogLevel::Debug, (__VA_ARGS__))

using mozilla::MutexAutoLock;
using mozilla::TimeStamp;
using mozilla::VsyncDispatcher;
using mozilla::VsyncEvent;
using mozilla::dom::Element;
using mozilla::dom::HTMLCanvasElement;
using mozilla::layers::ImageContainer;
using mozilla::layers::ImageUsageType;
using mozilla::layers::MacIOSurfaceImage;

namespace axio {

// Contract limits (engine-surface-v1: 1..4096 px per dimension, 32 targets).
static constexpr uint32_t kMaxDimension = 4096;
static constexpr uint32_t kMaxTargets = 32;
// engine-surface-v1 AXIO_SURFACE_FLAG_GLOBAL_SURFACE: the host created this
// ring surface with kIOSurfaceIsGlobal, so Gecko's GPU process can look it up
// by IOSurfaceID and the frame is composited zero-copy. Without it (or when
// the pref below is false) Gecko copies into its own global surface.
static constexpr uint32_t kFlagGlobalSurface = AXIO_SURFACE_FLAG_GLOBAL_SURFACE;
static constexpr const char* kZeroCopyPref = "axiosozo.engine_view.zero_copy";
// Gecko-owned copy targets per target (copy mode).
static constexpr size_t kMaxPoolSurfaces = 4;
static constexpr size_t kReceiveBufferSize = 2048;
// RELEASE / CONNECTED must not be lost: bounded blocking send. The host drains
// its reply port on its main queue.
static constexpr mach_msg_timeout_t kReliableSendTimeoutMs = 100;
// A superseded zero-copy surface that stays "in use" this long is released
// anyway (prevents a permanent stall if something pins the use count).
static constexpr double kMaxReleaseWaitMs = 1000.0;
static constexpr int64_t kPollIntervalNs = 4 * NSEC_PER_MSEC;

static_assert(sizeof(axio_surface_frame_body_t) == 232, "contract: 232 bytes");
static_assert(sizeof(axio_surface_frame_msg_t) +
                      sizeof(mach_msg_audit_trailer_t) <
                  kReceiveBufferSize,
              "receive buffer must hold a FRAME plus trailer");

// ------------------------------------------------------------------------
// Copy mode: one Metal blit from the host's ring surface into a Gecko-owned
// global IOSurface, on the endpoint queue. Apple silicon only (one GPU).

class EngineSurfaceCopier final {
 public:
  NS_INLINE_DECL_THREADSAFE_REFCOUNTING(EngineSurfaceCopier)

  static RefPtr<EngineSurfaceCopier> Create() {
    id<MTLDevice> device = MTLCreateSystemDefaultDevice();  // +1
    if (!device) {
      return nullptr;
    }
    id<MTLCommandQueue> queue = [device newCommandQueue];  // +1
    if (!queue) {
      [device release];
      return nullptr;
    }
    return new EngineSurfaceCopier(device, queue);
  }

  bool Copy(IOSurfaceRef aSource, IOSurfaceRef aDest, uint32_t aWidth,
            uint32_t aHeight, uint64_t* aGpuNs) {
    @autoreleasepool {
      MTLTextureDescriptor* desc = [MTLTextureDescriptor
          texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm
                                       width:aWidth
                                      height:aHeight
                                   mipmapped:NO];
      desc.storageMode = MTLStorageModeShared;
      desc.usage = MTLTextureUsageShaderRead;
      id<MTLTexture> src = [mDevice newTextureWithDescriptor:desc
                                                   iosurface:aSource
                                                       plane:0];
      id<MTLTexture> dst = [mDevice newTextureWithDescriptor:desc
                                                   iosurface:aDest
                                                       plane:0];
      bool ok = false;
      if (src && dst) {
        id<MTLCommandBuffer> buffer = [mQueue commandBuffer];
        id<MTLBlitCommandEncoder> blit = [buffer blitCommandEncoder];
        [blit copyFromTexture:src
                     sourceSlice:0
                     sourceLevel:0
                    sourceOrigin:MTLOriginMake(0, 0, 0)
                      sourceSize:MTLSizeMake(aWidth, aHeight, 1)
                       toTexture:dst
                destinationSlice:0
                destinationLevel:0
               destinationOrigin:MTLOriginMake(0, 0, 0)];
        [blit endEncoding];
        [buffer commit];
        // The host surface is released right after this returns, and the
        // compositor must never sample a half-written destination.
        [buffer waitUntilCompleted];
        ok = buffer.status == MTLCommandBufferStatusCompleted;
        CFTimeInterval gpu = buffer.GPUEndTime - buffer.GPUStartTime;
        *aGpuNs = ok && gpu > 0 ? uint64_t(gpu * 1e9) : 0;
      }
      [src release];
      [dst release];
      return ok;
    }
  }

 private:
  EngineSurfaceCopier(id<MTLDevice> aDevice, id<MTLCommandQueue> aQueue)
      : mDevice(aDevice), mQueue(aQueue) {}
  ~EngineSurfaceCopier() {
    [mQueue release];
    [mDevice release];
  }

  id<MTLDevice> mDevice;
  id<MTLCommandQueue> mQueue;
};

// ------------------------------------------------------------------------
// Vsync: runs on the hardware vsync thread (CVDisplayLink on macOS) and only
// posts to the endpoint's queue, coalescing ticks the queue has not consumed.

class EngineVsyncForwarder final : public mozilla::VsyncObserver {
 public:
  NS_INLINE_DECL_THREADSAFE_REFCOUNTING(EngineVsyncForwarder, override)

  EngineVsyncForwarder(EngineEndpoint* aEndpoint, dispatch_queue_t aQueue,
                       VsyncDispatcher* aDispatcher,
                       const mach_timebase_info_data_t& aTimebase)
      : mMutex("EngineVsyncForwarder"),
        mEndpoint(aEndpoint),
        mQueue(aQueue),
        mDispatcher(aDispatcher),
        mTimebase(aTimebase) {
    dispatch_retain(mQueue);
  }

  void NotifyVsync(const VsyncEvent& aVsync) override {
    RefPtr<EngineEndpoint> endpoint;
    {
      MutexAutoLock lock(mMutex);
      endpoint = mEndpoint;
    }
    if (!endpoint || mTickPending.exchange(true)) {
      return;
    }
    // TimeStamp on macOS is mach_absolute_time based
    // (widget/cocoa/nsCocoaUtils.mm GetEventTimeStamp); the wire carries
    // mach_absolute_time ticks.
    uint64_t ns = aVsync.mTime.RawMachAbsoluteTimeNanoseconds();
    uint64_t ticks = uint64_t((unsigned __int128)ns * mTimebase.denom /
                              mTimebase.numer);
    uint64_t intervalNs =
        uint64_t(mDispatcher->GetVsyncRate().ToMicroseconds() * 1000.0);
    RefPtr<EngineVsyncForwarder> self = this;
    dispatch_async(mQueue, ^{
      self->mTickPending = false;
      endpoint->OnVsyncOnQueue(ticks, intervalNs);
    });
  }

  VsyncDispatcher* Dispatcher() const { return mDispatcher; }

  void Disconnect() {
    MutexAutoLock lock(mMutex);
    mEndpoint = nullptr;
  }

 private:
  ~EngineVsyncForwarder() { dispatch_release(mQueue); }

  mozilla::Mutex mMutex;
  RefPtr<EngineEndpoint> mEndpoint MOZ_GUARDED_BY(mMutex);
  dispatch_queue_t mQueue;
  RefPtr<VsyncDispatcher> mDispatcher;
  mach_timebase_info_data_t mTimebase;
  std::atomic<bool> mTickPending{false};
};

// ------------------------------------------------------------------------

// Not optimised away (unlike a plain memset of a dying buffer).
static void SecureZero(void* aBuffer, size_t aLength) {
  volatile uint8_t* p = static_cast<volatile uint8_t*>(aBuffer);
  while (aLength--) {
    *p++ = 0;
  }
}

static bool ConstantTimeEqual(const uint8_t* aA, const uint8_t* aB,
                              size_t aLength) {
  uint8_t diff = 0;
  for (size_t i = 0; i < aLength; ++i) {
    diff |= aA[i] ^ aB[i];
  }
  return diff == 0;
}

static void HexEncode(const uint8_t* aBytes, size_t aLength, nsACString& aOut) {
  static const char kHex[] = "0123456789abcdef";
  aOut.Truncate();
  for (size_t i = 0; i < aLength; ++i) {
    aOut.Append(kHex[aBytes[i] >> 4]);
    aOut.Append(kHex[aBytes[i] & 0xf]);
  }
}

// The contract requires the CONNECT sender to be the child this process
// spawned (Subprocess -> IOUtils.launchProcess -> posix_spawnp in-process).
static bool IsOurChild(pid_t aPid) {
  struct proc_bsdinfo info;
  int size = proc_pidinfo(aPid, PROC_PIDTBSDINFO, 0, &info, sizeof(info));
  return size == int(sizeof(info)) && pid_t(info.pbi_ppid) == getpid();
}

static bool ValidateSurface(IOSurfaceRef aSurface,
                            const axio_surface_frame_body_t& aData) {
  size_t width = IOSurfaceGetWidth(aSurface);
  size_t height = IOSurfaceGetHeight(aSurface);
  return width == aData.width && height == aData.height &&
         IOSurfaceGetPixelFormat(aSurface) == kCVPixelFormatType_32BGRA &&
         IOSurfaceGetPlaneCount(aSurface) == 0 &&
         IOSurfaceGetBytesPerElement(aSurface) == 4 &&
         IOSurfaceGetBytesPerRow(aSurface) >= width * 4 &&
         IOSurfaceGetAllocSize(aSurface) >=
             IOSurfaceGetBytesPerRow(aSurface) * height &&
         IOSurfaceGetID(aSurface) == aData.surface_id;
}

// The GPU process resolves the frame by global ID (MacIOSurfaceTextureHostOGL
// -> IOSurfaceLookup), which fails for a non-global surface in any process that
// does not already hold it. IOSurfaceLookup in *this* process succeeds either
// way (we hold the surface), so it cannot verify the flag. Instead read the
// creation properties IOSurface records ("CreationProperties", observable via
// IOSurfaceCopyValue): when they are present and do not say global, the flag
// is wrong and the frame is copied (degrades to copy mode, never to a blank
// tab). When the key is absent the authenticated host's flag is trusted.
static bool CreatedGlobal(IOSurfaceRef aSurface) {
  CFTypeRef created = IOSurfaceCopyValue(aSurface, CFSTR("CreationProperties"));
  if (!created) {
    return true;
  }
  bool global = true;
  if (CFGetTypeID(created) == CFDictionaryGetTypeID()) {
    CFTypeRef value = CFDictionaryGetValue(static_cast<CFDictionaryRef>(created),
                                           CFSTR("IOSurfaceIsGlobal"));
    int number = 0;
    if (value && CFGetTypeID(value) == CFBooleanGetTypeID()) {
      global = CFBooleanGetValue(static_cast<CFBooleanRef>(value));
    } else {
      global = value && CFGetTypeID(value) == CFNumberGetTypeID() &&
               CFNumberGetValue(static_cast<CFNumberRef>(value),
                                kCFNumberIntType, &number) &&
               number != 0;
    }
  }
  CFRelease(created);
  return global;
}

// Percentile over the recorded ring (nearest rank), 0 when empty.
static double Percentile(const uint64_t* aValues, size_t aCount, double aQ) {
  if (!aCount) {
    return 0;
  }
  std::vector<uint64_t> sorted(aValues, aValues + aCount);
  std::sort(sorted.begin(), sorted.end());
  size_t rank = size_t(std::ceil(aQ * double(aCount)));
  return double(sorted[std::min(aCount - 1, rank ? rank - 1 : 0)]);
}

NS_IMPL_ISUPPORTS(EngineEndpoint, nsIAxioEngineEndpoint)

EngineEndpoint::EngineEndpoint() { SecureZero(mToken, sizeof(mToken)); }

EngineEndpoint::~EngineEndpoint() {
  // The MACH_RECV source's handler retains us, so we only get here after
  // CloseOnQueue cancelled and released it (or Create failed early).
  MOZ_ASSERT(!mSource);
  SecureZero(mToken, sizeof(mToken));
  if (mQueue) {
    dispatch_release(mQueue);
  }
}

/* static */
nsresult EngineEndpoint::Create(bool aExternalBeginFrames,
                                EngineEndpoint** aResult) {
  MOZ_RELEASE_ASSERT(NS_IsMainThread());
  MOZ_RELEASE_ASSERT(XRE_IsParentProcess());

  RefPtr<EngineEndpoint> ep = new EngineEndpoint();
  ep->mExternalBeginFrames = aExternalBeginFrames;
  ep->mZeroCopyAllowed = mozilla::Preferences::GetBool(kZeroCopyPref, true);

  uint8_t nameRandom[16];
  if (!mozilla::GenerateRandomBytesFromOS(nameRandom, sizeof(nameRandom)) ||
      !mozilla::GenerateRandomBytesFromOS(ep->mToken, sizeof(ep->mToken))) {
    return NS_ERROR_FAILURE;
  }
  nsAutoCString suffix;
  HexEncode(nameRandom, sizeof(nameRandom), suffix);
  // Contract: recommended "dev.axiosozo.surface.<32 hex>".
  ep->mServiceName = "dev.axiosozo.surface."_ns + suffix;
  HexEncode(ep->mToken, sizeof(ep->mToken), ep->mTokenHex);

  // Same mechanism Gecko uses for its own child processes
  // (ipc/glue/GeckoChildProcessHost.cpp, bootstrap_check_in of a fresh name).
  kern_return_t kr = bootstrap_check_in(bootstrap_port, ep->mServiceName.get(),
                                        &ep->mServicePort);
  if (kr != KERN_SUCCESS) {
    EV_LOG("bootstrap_check_in failed: %s", mach_error_string(kr));
    return NS_ERROR_FAILURE;
  }
  // Contract: queue limit >= 3 x max_targets + 1 (97); a full queue is fatal
  // for the host, which sends with a zero timeout.
  mach_port_limits_t limits = {MACH_PORT_QLIMIT_LARGE};
  kr = mach_port_set_attributes(mach_task_self(), ep->mServicePort,
                                MACH_PORT_LIMITS_INFO,
                                (mach_port_info_t)&limits,
                                MACH_PORT_LIMITS_INFO_COUNT);
  if (kr != KERN_SUCCESS) {
    mach_port_mod_refs(mach_task_self(), ep->mServicePort,
                       MACH_PORT_RIGHT_RECEIVE, -1);
    return NS_ERROR_FAILURE;
  }

  mach_timebase_info(&ep->mTimebase);
  dispatch_queue_attr_t attr = dispatch_queue_attr_make_with_qos_class(
      DISPATCH_QUEUE_SERIAL, QOS_CLASS_USER_INTERACTIVE, 0);
  ep->mQueue = dispatch_queue_create("dev.axiosozo.engine-view", attr);

  if (aExternalBeginFrames) {
    RefPtr<VsyncDispatcher> vsync =
        gfxPlatform::GetPlatform()->GetGlobalVsyncDispatcher();
    if (!vsync) {
      mach_port_mod_refs(mach_task_self(), ep->mServicePort,
                         MACH_PORT_RIGHT_RECEIVE, -1);
      return NS_ERROR_NOT_AVAILABLE;
    }
    ep->mVsync =
        new EngineVsyncForwarder(ep, ep->mQueue, vsync, ep->mTimebase);
  }

  mach_port_t port = ep->mServicePort;
  ep->mSource = dispatch_source_create(DISPATCH_SOURCE_TYPE_MACH_RECV, port, 0,
                                       ep->mQueue);
  RefPtr<EngineEndpoint> self = ep;
  dispatch_source_set_event_handler(ep->mSource, ^{
    self->DrainOnQueue();
  });
  dispatch_source_set_cancel_handler(ep->mSource, ^{
    // Destroying the receive right kills the bootstrap name for later
    // bootstrap_look_up callers and every send right the host still holds.
    mach_port_mod_refs(mach_task_self(), port, MACH_PORT_RIGHT_RECEIVE, -1);
  });
  dispatch_resume(ep->mSource);

  ep.forget(aResult);
  return NS_OK;
}

// ----------------------------------------------------------------- mQueue --

void EngineEndpoint::DrainOnQueue() {
  // Bounded per wakeup so vsync ticks and polls interleave with frames.
  for (int i = 0; i < 32 && mState != STATE_CLOSED; ++i) {
    alignas(16) uint8_t buffer[kReceiveBufferSize];
    auto* header = reinterpret_cast<mach_msg_header_t*>(buffer);
    kern_return_t kr = mach_msg(
        header,
        MACH_RCV_MSG | MACH_RCV_TIMEOUT |
            MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
            MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT),
        0, sizeof(buffer), mServicePort, 0, MACH_PORT_NULL);
    if (kr == MACH_RCV_TIMED_OUT) {
      return;
    }
    if (kr == MACH_RCV_TOO_LARGE) {
      continue;  // Without MACH_RCV_LARGE the kernel destroyed it.
    }
    if (kr != KERN_SUCCESS) {
      CloseOnQueue("protocol:receive"_ns);
      return;
    }
    auto* trailer = reinterpret_cast<mach_msg_audit_trailer_t*>(
        buffer + round_msg(header->msgh_size));
    pid_t sender = -1;
    if (trailer->msgh_trailer_type == MACH_MSG_TRAILER_FORMAT_0 &&
        trailer->msgh_trailer_size >= sizeof(mach_msg_audit_trailer_t)) {
      sender = audit_token_to_pid(trailer->msgh_audit);
    }
    HandleMessageOnQueue(header, sender);
  }
}

void EngineEndpoint::HandleMessageOnQueue(mach_msg_header_t* aHeader,
                                          pid_t aSenderPid) {
  switch (aHeader->msgh_id) {
    case MACH_NOTIFY_DEAD_NAME: {
      // Only the kernel (audit pid 0) sends notifications.
      if (aSenderPid != 0 ||
          aHeader->msgh_size <
              offsetof(mach_dead_name_notification_t, trailer)) {
        mach_msg_destroy(aHeader);
        return;
      }
      auto* note = reinterpret_cast<mach_dead_name_notification_t*>(aHeader);
      mach_port_name_t dead = note->not_port;
      // The notification carries one user reference on the dead name.
      mach_port_deallocate(mach_task_self(), dead);
      if (dead == mHostPort) {
        CloseOnQueue("host-died"_ns);
      }
      return;
    }
    case AXIO_SURFACE_MSG_CONNECT:
      HandleConnectOnQueue(aHeader, aSenderPid);
      return;
    case AXIO_SURFACE_MSG_FRAME:
      HandleFrameOnQueue(aHeader, aSenderPid);
      return;
    default:
      mach_msg_destroy(aHeader);
      if (mState == STATE_CONNECTED && aSenderPid == mHostPid) {
        CloseOnQueue("protocol:unknown-message"_ns);
      }
      return;
  }
}

void EngineEndpoint::HandleConnectOnQueue(mach_msg_header_t* aHeader,
                                          pid_t aSenderPid) {
  pid_t expected = mExpectedPid;
  if (mTokenConsumed || mState != STATE_LISTENING || expected <= 0 ||
      aSenderPid != expected || !IsOurChild(aSenderPid)) {
    // Anyone in the login session can look the name up: destroy and ignore
    // silently, so a third party can neither connect nor close us.
    mach_msg_destroy(aHeader);
    return;
  }
  auto* msg = reinterpret_cast<axio_surface_connect_msg_t*>(aHeader);
  bool wellFormed =
      (aHeader->msgh_bits & MACH_MSGH_BITS_COMPLEX) &&
      aHeader->msgh_size == sizeof(axio_surface_connect_msg_t) &&
      msg->body.msgh_descriptor_count == 1 &&
      msg->reply_port.type == MACH_MSG_PORT_DESCRIPTOR &&
      msg->reply_port.disposition == MACH_MSG_TYPE_PORT_SEND &&
      MACH_PORT_VALID(msg->reply_port.name) &&
      msg->data.magic == AXIO_SURFACE_MAGIC &&
      msg->data.version == AXIO_SURFACE_VERSION &&
      msg->data.host_pid == uint32_t(aSenderPid);
  if (!wellFormed ||
      !ConstantTimeEqual(msg->data.token, mToken, sizeof(mToken))) {
    // Contract: any other CONNECT is destroyed and ignored. The host then
    // times out waiting for CONNECTED and exits 64; the pipe reports it.
    mach_msg_destroy(aHeader);
    return;
  }

  mTokenConsumed = true;
  SecureZero(mToken, sizeof(mToken));
  mHostPort = msg->reply_port.name;
  mHostPid = aSenderPid;

  mach_port_t previous = MACH_PORT_NULL;
  kern_return_t kr = mach_port_request_notification(
      mach_task_self(), mHostPort, MACH_NOTIFY_DEAD_NAME, 0, mServicePort,
      MACH_MSG_TYPE_MAKE_SEND_ONCE, &previous);
  if (previous != MACH_PORT_NULL) {
    mach_port_deallocate(mach_task_self(), previous);
  }
  if (kr != KERN_SUCCESS) {
    CloseOnQueue("host-died"_ns);
    return;
  }

  axio_surface_connected_msg_t reply{};
  reply.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, 0);
  reply.header.msgh_size = sizeof(reply);
  reply.header.msgh_remote_port = mHostPort;
  reply.header.msgh_id = AXIO_SURFACE_MSG_CONNECTED;
  reply.magic = AXIO_SURFACE_MAGIC;
  reply.version = AXIO_SURFACE_VERSION;
  kr = mach_msg(&reply.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, sizeof(reply),
                0, MACH_PORT_NULL, kReliableSendTimeoutMs, MACH_PORT_NULL);
  if (kr != KERN_SUCCESS) {
    CloseOnQueue("host-unresponsive"_ns);
    return;
  }
  mState = STATE_CONNECTED;
  UpdateVsyncOnQueue();
  RefPtr<EngineEndpoint> self = this;
  int32_t pid = mHostPid;
  NS_DispatchToMainThread(NS_NewRunnableFunction(
      "EngineEndpoint::Connected", [self, pid] { self->NotifyConnected(pid); }));
}

/* static */
EngineEndpoint::Order EngineEndpoint::Compare(
    const Target& aTarget, const axio_surface_frame_body_t& aData) {
  if (aData.document_generation < aTarget.mDocumentGeneration ||
      aData.navigation_generation < aTarget.mNavigationGeneration) {
    return Order::Stale;
  }
  if (aData.document_generation > aTarget.mDocumentGeneration ||
      aData.navigation_generation > aTarget.mNavigationGeneration) {
    return Order::Future;
  }
  return Order::Current;
}

void EngineEndpoint::HandleFrameOnQueue(mach_msg_header_t* aHeader,
                                        pid_t aSenderPid) {
  if (mState != STATE_CONNECTED || aSenderPid != mHostPid) {
    mach_msg_destroy(aHeader);
    return;
  }
  auto* msg = reinterpret_cast<axio_surface_frame_msg_t*>(aHeader);
  bool wellFormed = (aHeader->msgh_bits & MACH_MSGH_BITS_COMPLEX) &&
                    aHeader->msgh_size == sizeof(axio_surface_frame_msg_t) &&
                    msg->body.msgh_descriptor_count == 1 &&
                    msg->surface.type == MACH_MSG_PORT_DESCRIPTOR &&
                    msg->surface.disposition == MACH_MSG_TYPE_PORT_SEND &&
                    MACH_PORT_VALID(msg->surface.name);
  if (!wellFormed) {
    mach_msg_destroy(aHeader);
    CloseOnQueue("protocol:frame-structure"_ns);
    return;
  }

  // Own the IOSurface, then deallocate the port right on every path
  // (IOSurfaceLookupFromMachPort does not consume it).
  mach_port_t port = msg->surface.name;
  CFTypeRefPtr<IOSurfaceRef> surface =
      CFTypeRefPtr<IOSurfaceRef>::WrapUnderCreateRule(
          IOSurfaceLookupFromMachPort(port));
  mach_port_deallocate(mach_task_self(), port);

  const axio_surface_frame_body_t data = msg->data;  // copy out of buffer
  bool headerOk =
      data.magic == AXIO_SURFACE_MAGIC &&
      data.version == AXIO_SURFACE_VERSION &&
      data.format == AXIO_SURFACE_FORMAT_BGRA8_PREMULTIPLIED_SRGB &&
      data.dirty_count <= AXIO_SURFACE_MAX_DIRTY && data.frame_id != 0 &&
      data.frame_id > mLastHostFrameId && data.width >= 1 &&
      data.height >= 1 && data.width <= kMaxDimension &&
      data.height <= kMaxDimension && data.logical_width >= 1 &&
      data.logical_height >= 1 && std::isfinite(data.device_scale) &&
      data.device_scale > 0 && data.device_scale <= 8.0;
  if (!headerOk || !surface) {
    CloseOnQueue(!surface ? "protocol:surface-lookup"_ns
                          : "protocol:frame-header"_ns);
    return;
  }
  mLastHostFrameId = data.frame_id;

  Target* target = FindTarget(data.native_target_id);
  if (!target || !target->mContainer) {
    // Closed or not (yet) bound: discard and release at once.
    SendReleaseOnQueue(data.native_target_id, data.frame_id);
    return;
  }
  Target& t = *target;
  t.mStats.mReceived++;
  uint64_t now = mach_absolute_time();
  if (data.paint_time && now > data.paint_time) {
    t.mStats.mLastPaintToReceiveNs = Nanoseconds(now - data.paint_time);
  }
  if (data.paint_time && data.send_time >= data.paint_time) {
    t.mStats.mLastHostCopyNs = Nanoseconds(data.send_time - data.paint_time);
    t.mStats.mHostCopy.Add(t.mStats.mLastHostCopyNs);
  }

  if (!ValidateSurface(surface.get(), data)) {
    t.mStats.mRejected++;
    SendReleaseOnQueue(t.mId, data.frame_id);
    return;
  }

  switch (Compare(t, data)) {
    case Order::Stale:
      t.mStats.mStale++;
      SendReleaseOnQueue(t.mId, data.frame_id);
      return;
    case Order::Future:
    case Order::Current:
      // A newer frame always supersedes a held one.
      DropHeldOnQueue(t);
      t.mHeld.emplace(Held{data, std::move(surface)});
      if (Compare(t, data) == Order::Future) {
        t.mStats.mHeld++;
      }
      PollReleasesOnQueue();  // presents the held frame when it may be shown
      return;
  }
}

void EngineEndpoint::DropHeldOnQueue(Target& aTarget) {
  if (aTarget.mHeld) {
    uint64_t frameId = aTarget.mHeld->mData.frame_id;
    aTarget.mHeld.reset();
    SendReleaseOnQueue(aTarget.mId, frameId);
  }
}

CFTypeRefPtr<IOSurfaceRef> EngineEndpoint::AcquirePoolSurfaceOnQueue(
    Target& aTarget, uint32_t aWidth, uint32_t aHeight) {
  auto referenced = [&](IOSurfaceRef aSurface) {
    for (const auto& p : aTarget.mPresented) {
      if (p.mSurface.get() == aSurface) {
        return true;
      }
    }
    return false;
  };
  CFTypeRefPtr<IOSurfaceRef> found;
  for (auto it = aTarget.mPool.begin(); it != aTarget.mPool.end();) {
    IOSurfaceRef s = it->get();
    bool busy = referenced(s) || IOSurfaceIsInUse(s);
    bool sameSize =
        IOSurfaceGetWidth(s) == aWidth && IOSurfaceGetHeight(s) == aHeight;
    if (!busy && !sameSize) {
      it = aTarget.mPool.erase(it);  // lazily drop old-size surfaces
      continue;
    }
    if (!busy && !found) {
      found = *it;
    }
    ++it;
  }
  if (found || aTarget.mPool.size() >= kMaxPoolSurfaces) {
    return found;
  }
  // Global, BGRA8, sRGB-tagged (gfx/2d/MacIOSurface.cpp CreateIOSurface):
  // Gecko's GPU process can look it up by ID.
  RefPtr<MacIOSurface> created = MacIOSurface::CreateIOSurface(
      int(aWidth), int(aHeight), MacIOSurface::AllowAlpha::Yes);
  if (!created) {
    return found;
  }
  CFTypeRefPtr<IOSurfaceRef> ref = created->GetIOSurfaceRef();
  created = nullptr;  // drop the constructor's use count
  aTarget.mPool.push_back(ref);
  return ref;
}

uint64_t EngineEndpoint::Nanoseconds(uint64_t aTicks) const {
  return uint64_t((unsigned __int128)aTicks * mTimebase.numer /
                  mTimebase.denom);
}

bool EngineEndpoint::TryPresentOnQueue(Target& aTarget,
                                       const axio_surface_frame_body_t& aData,
                                       const CFTypeRefPtr<IOSurfaceRef>& aSurface) {
  Target& t = aTarget;
  CFTypeRefPtr<IOSurfaceRef> shown = aSurface;
  uint64_t hostFrameId = aData.frame_id;

  bool zeroCopy = mZeroCopyAllowed && (aData.flags & kFlagGlobalSurface);
  if (zeroCopy && !CreatedGlobal(aSurface.get())) {
    t.mStats.mGlobalLookupFailed++;
    zeroCopy = false;
  }
  if (!zeroCopy) {
    // Copy mode: the host's ring surface is not global (or zero-copy is
    // disabled), so the GPU process could not look it up by ID. Blit into a
    // Gecko-owned global surface.
    CFTypeRefPtr<IOSurfaceRef> dest =
        AcquirePoolSurfaceOnQueue(t, aData.width, aData.height);
    if (!dest) {
      return false;  // stay held; retried when a pool surface frees up
    }
    if (!mCopier) {
      mCopier = EngineSurfaceCopier::Create();
    }
    TimeStamp start = TimeStamp::Now();
    uint64_t gpuNs = 0;
    bool copied = mCopier && mCopier->Copy(aSurface.get(), dest.get(),
                                           aData.width, aData.height, &gpuNs);
    // Nothing reads the host surface any more: release it right away.
    if (!SendReleaseOnQueue(t.mId, aData.frame_id)) {
      return true;
    }
    if (!copied) {
      t.mStats.mRejected++;
      return true;
    }
    t.mStats.mCopied++;
    t.mStats.mLastCopyNs =
        uint64_t((TimeStamp::Now() - start).ToMicroseconds() * 1000.0);
    t.mStats.mLastCopyGpuNs = gpuNs;
    t.mStats.mCopyGpu.Add(gpuNs);
    shown = dest;
    hostFrameId = 0;
  } else {
    t.mStats.mZeroCopy++;
  }

  // One MacIOSurface per presented frame: its constructor takes one IOSurface
  // use count that the ImageContainer, TextureClient and our bookkeeping
  // share. The GPU process looks the surface up by global ID
  // (gfx/layers/opengl/MacIOSurfaceTextureHostOGL.cpp), taking its own.
  RefPtr<MacIOSurface> mac = new MacIOSurface(
      shown, mozilla::gfx::YUVColorSpace::Identity,
      mozilla::gfx::TransferFunction::SRGB, MacIOSurface::AllowAlpha::Yes);
  RefPtr<mozilla::layers::Image> image = new MacIOSurfaceImage(mac);
  uint32_t geckoFrameId = t.mNextGeckoFrameId++;
  AutoTArray<ImageContainer::NonOwningImage, 1> images;
  images.AppendElement(ImageContainer::NonOwningImage(
      image, TimeStamp(), geckoFrameId, t.mProducerId));
  t.mContainer->SetCurrentImages(images);
  uint64_t presentedAt = mach_absolute_time();
  if (t.mStats.mLastPresentTicks) {
    t.mStats.mPresentInterval.Add(
        Nanoseconds(presentedAt - t.mStats.mLastPresentTicks));
  }
  t.mStats.mLastPresentTicks = presentedAt;
  if (aData.paint_time && presentedAt > aData.paint_time) {
    t.mStats.mPaintToPresent.Add(Nanoseconds(presentedAt - aData.paint_time));
  }

  for (auto& p : t.mPresented) {
    p.mCurrent = false;
  }
  Presented& p = t.mPresented.emplace_back();
  p.mHostFrameId = hostFrameId;
  p.mPresentedTicks = presentedAt;
  p.mSurface = shown;
  p.mUse = mac;
  p.mCurrent = true;
  t.mCurrentGeckoFrameId = geckoFrameId;
  t.mStats.mPresented++;
  uint64_t inFlight = t.mHeld ? 1 : 0;
  for (const auto& f : t.mPresented) {
    inFlight += f.mHostFrameId ? 1 : 0;
  }
  t.mStats.mMaxHostFramesInFlight =
      std::max(t.mStats.mMaxHostFramesInFlight, inFlight);

  if (!t.mHasFirstFrame) {
    t.mHasFirstFrame = true;
    UpdateVsyncOnQueue();
  }
  if (t.mWidth != aData.width || t.mHeight != aData.height ||
      t.mLogicalWidth != aData.logical_width ||
      t.mLogicalHeight != aData.logical_height ||
      t.mScale != aData.device_scale) {
    t.mWidth = aData.width;
    t.mHeight = aData.height;
    t.mLogicalWidth = aData.logical_width;
    t.mLogicalHeight = aData.logical_height;
    t.mScale = aData.device_scale;
    NotifyGeometry(t);
  }
  return true;
}

bool EngineEndpoint::SendReleaseOnQueue(uint64_t aTargetId, uint64_t aFrameId) {
  if (mState != STATE_CONNECTED) {
    return false;
  }
  axio_surface_release_msg_t msg{};
  msg.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, 0);
  msg.header.msgh_size = sizeof(msg);
  msg.header.msgh_remote_port = mHostPort;
  msg.header.msgh_id = AXIO_SURFACE_MSG_RELEASE;
  msg.magic = AXIO_SURFACE_MAGIC;
  msg.version = AXIO_SURFACE_VERSION;
  msg.native_target_id = aTargetId;
  msg.frame_id = aFrameId;
  kern_return_t kr =
      mach_msg(&msg.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, sizeof(msg), 0,
               MACH_PORT_NULL, kReliableSendTimeoutMs, MACH_PORT_NULL);
  if (kr != KERN_SUCCESS) {
    FailOnQueue(kr == MACH_SEND_INVALID_DEST ? "host-died"_ns
                                             : "host-unresponsive"_ns);
    return false;
  }
  return true;
}

void EngineEndpoint::PollReleasesOnQueue() {
  if (mState != STATE_CONNECTED) {
    return;
  }
  bool pending = false;
  TimeStamp now = TimeStamp::Now();
  for (auto it = mTargets.begin(); it != mTargets.end();) {
    Target& t = it->second;

    // Superseded frames stay pinned until a later frame was composited:
    // before that the GPU process may not even have looked them up.
    bool supersededSafe = !t.mVisible || !t.mContainer;
    if (!supersededSafe && t.mCurrentGeckoFrameId) {
      AutoTArray<ImageContainer::OwningImage, 2> current;
      t.mContainer->GetCurrentImages(&current);
      for (const auto& img : current) {
        if (img.mProducerID == t.mProducerId &&
            img.mFrameID == t.mCurrentGeckoFrameId && img.mComposited) {
          supersededSafe = true;
        }
      }
    }
    for (auto f = t.mPresented.begin(); f != t.mPresented.end();) {
      if (f->mCurrent && t.mContainer) {
        ++f;
        continue;
      }
      if (f->mUse) {
        if (!supersededSafe) {
          pending = true;
          ++f;
          continue;
        }
        f->mUse = nullptr;
        f->mUnpinnedAt = now;
      }
      if (!f->mHostFrameId) {
        f = t.mPresented.erase(f);  // copy mode: the pool checks IsInUse
        continue;
      }
      bool inUse = IOSurfaceIsInUse(f->mSurface.get());
      if (inUse && (now - f->mUnpinnedAt).ToMilliseconds() < kMaxReleaseWaitMs) {
        pending = true;
        ++f;
        continue;
      }
      if (inUse) {
        t.mStats.mForcedReleases++;
      }
      if (!SendReleaseOnQueue(t.mId, f->mHostFrameId)) {
        return;
      }
      t.mStats.mReleased++;
      if (f->mPresentedTicks) {
        t.mStats.mReleaseDelay.Add(
            Nanoseconds(mach_absolute_time() - f->mPresentedTicks));
      }
      f = t.mPresented.erase(f);
    }

    // Present a held frame once its generation is acknowledged and (copy
    // mode) a pool surface is free; drop it when it became stale.
    if (t.mHeld && t.mContainer) {
      Order order = Compare(t, t.mHeld->mData);
      if (order == Order::Stale) {
        t.mStats.mStale++;
        DropHeldOnQueue(t);
      } else if (order == Order::Current) {
        Held held = std::move(*t.mHeld);
        t.mHeld.reset();
        if (!TryPresentOnQueue(t, held.mData, held.mSurface)) {
          t.mHeld.emplace(std::move(held));
          pending = true;
        }
      }
      if (mState != STATE_CONNECTED) {
        return;
      }
    }

    if (!t.mContainer && t.mPresented.empty() && !t.mHeld) {
      it = mTargets.erase(it);
    } else {
      ++it;
    }
  }
  if (pending) {
    SchedulePollOnQueue();
  }
}

void EngineEndpoint::SchedulePollOnQueue() {
  if (mPollScheduled || mState != STATE_CONNECTED) {
    return;
  }
  mPollScheduled = true;
  RefPtr<EngineEndpoint> self = this;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, kPollIntervalNs), mQueue, ^{
    self->mPollScheduled = false;
    self->PollReleasesOnQueue();
  });
}

bool EngineEndpoint::WantsTicks(const Target& aTarget) const {
  // Contract: ticks for every target that is visible or still awaiting its
  // first frame; hidden targets get none.
  return mExternalBeginFrames && aTarget.mContainer &&
         (aTarget.mVisible || !aTarget.mHasFirstFrame);
}

void EngineEndpoint::OnVsyncOnQueue(uint64_t aFrameTimeTicks,
                                    uint64_t aIntervalNs) {
  if (mState != STATE_CONNECTED) {
    return;
  }
  for (auto& [id, t] : mTargets) {
    if (!WantsTicks(t)) {
      continue;
    }
    axio_surface_begin_frame_msg_t msg{};
    msg.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, 0);
    msg.header.msgh_size = sizeof(msg);
    msg.header.msgh_remote_port = mHostPort;
    msg.header.msgh_id = AXIO_SURFACE_MSG_BEGIN_FRAME;
    msg.magic = AXIO_SURFACE_MAGIC;
    msg.version = AXIO_SURFACE_VERSION;
    msg.native_target_id = id;
    msg.sequence = t.mBeginFrameSequence + 1;  // strictly increasing
    msg.frame_time = aFrameTimeTicks;
    msg.interval_ns = aIntervalNs;
    // Never block on a tick: a newer one follows next refresh.
    kern_return_t kr = mach_msg(&msg.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT,
                                sizeof(msg), 0, MACH_PORT_NULL, 0,
                                MACH_PORT_NULL);
    if (kr == KERN_SUCCESS) {
      t.mBeginFrameSequence = msg.sequence;
      t.mStats.mBeginFramesSent++;
    } else if (kr == MACH_SEND_INVALID_DEST) {
      FailOnQueue("host-died"_ns);
      return;
    } else {
      t.mStats.mBeginFramesDropped++;
    }
  }
  PollReleasesOnQueue();
}

void EngineEndpoint::UpdateVsyncOnQueue() {
  bool want = false;
  if (mState == STATE_CONNECTED) {
    for (auto& [id, t] : mTargets) {
      want |= WantsTicks(t);
    }
  }
  if (!mVsync || want == mVsyncObserving) {
    return;
  }
  // Add/RemoveVsyncObserver may be called from any thread
  // (widget/VsyncDispatcher.h). Hardware vsync only runs while observed.
  if (want) {
    mVsync->Dispatcher()->AddVsyncObserver(mVsync);
  } else {
    mVsync->Dispatcher()->RemoveVsyncObserver(mVsync);
  }
  mVsyncObserving = want;
}

EngineEndpoint::Target* EngineEndpoint::FindTarget(uint64_t aId) {
  auto it = mTargets.find(aId);
  return it == mTargets.end() ? nullptr : &it->second;
}

void EngineEndpoint::BindOnQueue(uint64_t aTargetId,
                                 RefPtr<ImageContainer>&& aContainer,
                                 uint64_t aDocumentGeneration,
                                 uint64_t aNavigationGeneration) {
  if (mState == STATE_CLOSED) {
    aContainer->ClearImagesInHost(mozilla::layers::ClearImagesType::All);
    return;
  }
  Target& t = mTargets[aTargetId];
  t.mId = aTargetId;
  if (t.mContainer) {
    t.mContainer->ClearImagesInHost(mozilla::layers::ClearImagesType::All);
  }
  t.mContainer = std::move(aContainer);
  t.mDocumentGeneration = std::max(t.mDocumentGeneration, aDocumentGeneration);
  t.mNavigationGeneration =
      std::max(t.mNavigationGeneration, aNavigationGeneration);
  t.mProducerId = ImageContainer::AllocateProducerID();
  t.mCurrentGeckoFrameId = 0;
  t.mHasFirstFrame = false;
  for (auto& p : t.mPresented) {
    p.mCurrent = false;  // frames of a previous binding are superseded
  }
  t.mWidth = t.mHeight = t.mLogicalWidth = t.mLogicalHeight = 0;
  t.mScale = 0;
  UpdateVsyncOnQueue();
  PollReleasesOnQueue();
}

void EngineEndpoint::UnbindOnQueue(uint64_t aTargetId) {
  Target* t = FindTarget(aTargetId);
  if (!t) {
    return;
  }
  DropHeldOnQueue(*t);
  if (t->mContainer) {
    t->mContainer->ClearImagesInHost(mozilla::layers::ClearImagesType::All);
    t->mContainer = nullptr;
  }
  t->mVisible = false;
  for (auto& p : t->mPresented) {
    p.mCurrent = false;
  }
  UpdateVsyncOnQueue();
  PollReleasesOnQueue();
}

void EngineEndpoint::SetGenerationsOnQueue(uint64_t aTargetId,
                                           uint64_t aDocumentGeneration,
                                           uint64_t aNavigationGeneration) {
  Target* t = FindTarget(aTargetId);
  if (!t || !t->mContainer) {
    return;
  }
  // Generations only move forward (cef-v1); ignore regressions.
  t->mDocumentGeneration = std::max(t->mDocumentGeneration, aDocumentGeneration);
  t->mNavigationGeneration =
      std::max(t->mNavigationGeneration, aNavigationGeneration);
  PollReleasesOnQueue();
}

void EngineEndpoint::FailOnQueue(const nsACString& aReason) {
  // Asynchronous: callers may be iterating mTargets.
  RefPtr<EngineEndpoint> self = this;
  nsCString reason(aReason);
  dispatch_async(mQueue, ^{
    self->CloseOnQueue(reason);
  });
}

void EngineEndpoint::CloseOnQueue(const nsACString& aReason) {
  if (mState == STATE_CLOSED) {
    return;
  }
  mState = STATE_CLOSED;
  EV_LOG("endpoint closed: %s", PromiseFlatCString(aReason).get());
  SecureZero(mToken, sizeof(mToken));
  mTokenConsumed = true;

  UpdateVsyncOnQueue();
  if (mVsync) {
    mVsync->Disconnect();
    mVsync = nullptr;
  }
  for (auto& [id, t] : mTargets) {
    if (t.mContainer) {
      t.mContainer->ClearImagesInHost(mozilla::layers::ClearImagesType::All);
    }
  }
  // No RELEASE can follow a close; the host process is going away.
  mTargets.clear();
  mCopier = nullptr;

  if (mHostPort != MACH_PORT_NULL) {
    mach_port_deallocate(mach_task_self(), mHostPort);
    mHostPort = MACH_PORT_NULL;
  }
  if (mSource) {
    dispatch_source_cancel(mSource);
    dispatch_release(mSource);  // releases the handler block's self ref
    mSource = nullptr;
  }

  RefPtr<EngineEndpoint> self = this;
  nsCString reason(aReason);
  NS_DispatchToMainThread(NS_NewRunnableFunction(
      "EngineEndpoint::Closed", [self, reason] { self->NotifyClosed(reason); }));
}

// ------------------------------------------------------------ main thread --

void EngineEndpoint::NotifyConnected(int32_t aPid) {
  MOZ_ASSERT(NS_IsMainThread());
  if (nsCOMPtr<nsIAxioEngineEndpointListener> listener = mListener) {
    listener->OnConnected(aPid);
  }
}

void EngineEndpoint::NotifyGeometry(const Target& aTarget) {
  RefPtr<EngineEndpoint> self = this;
  uint64_t id = aTarget.mId;
  uint32_t w = aTarget.mWidth, h = aTarget.mHeight;
  uint32_t lw = aTarget.mLogicalWidth, lh = aTarget.mLogicalHeight;
  double scale = aTarget.mScale;
  NS_DispatchToMainThread(NS_NewRunnableFunction(
      "EngineEndpoint::Geometry", [self, id, w, h, lw, lh, scale] {
        if (nsCOMPtr<nsIAxioEngineEndpointListener> listener =
                self->mListener) {
          listener->OnTargetGeometry(id, w, h, lw, lh, scale);
        }
      }));
}

void EngineEndpoint::NotifyClosed(const nsACString& aReason) {
  MOZ_ASSERT(NS_IsMainThread());
  ClearBindingsOnMain();
  if (mClosedNotified) {
    return;
  }
  mClosedNotified = true;
  nsCOMPtr<nsIAxioEngineEndpointListener> listener = std::move(mListener);
  if (listener) {
    listener->OnClosed(aReason);
  }
}

void EngineEndpoint::ClearBindingsOnMain() {
  MOZ_ASSERT(NS_IsMainThread());
  for (auto iter = mBoundCanvases.Iter(); !iter.Done(); iter.Next()) {
    nsCOMPtr<nsINode> node = do_QueryReferent(iter.Data());
    if (auto* canvas = HTMLCanvasElement::FromNodeOrNull(node.get())) {
      canvas->SetAxioExternalImageContainer(nullptr);
    }
  }
  mBoundCanvases.Clear();
}

NS_IMETHODIMP
EngineEndpoint::GetServiceName(nsACString& aName) {
  aName = mServiceName;
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::TakeToken(nsACString& aToken) {
  MOZ_ASSERT(NS_IsMainThread());
  if (mTokenTaken || mState == STATE_CLOSED) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  mTokenTaken = true;
  aToken = mTokenHex;
  mTokenHex.Truncate();  // best effort: the buffer may be shared with aToken
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::ExpectHostPid(int32_t aPid) {
  MOZ_ASSERT(NS_IsMainThread());
  if (aPid <= 0 || mExpectedPid != 0 || !IsOurChild(aPid)) {
    return NS_ERROR_INVALID_ARG;
  }
  mExpectedPid = aPid;
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::GetState(uint32_t* aState) {
  *aState = mState;
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::GetExternalBeginFrames(bool* aResult) {
  *aResult = mExternalBeginFrames;
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::GetListener(nsIAxioEngineEndpointListener** aListener) {
  nsCOMPtr<nsIAxioEngineEndpointListener> listener = mListener;
  listener.forget(aListener);
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::SetListener(nsIAxioEngineEndpointListener* aListener) {
  MOZ_ASSERT(NS_IsMainThread());
  mListener = aListener;
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::BindElement(Element* aCanvas, uint64_t aTargetId,
                            uint64_t aDocumentGeneration,
                            uint64_t aNavigationGeneration) {
  MOZ_ASSERT(NS_IsMainThread());
  if (mState == STATE_CLOSED) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  auto* canvas = HTMLCanvasElement::FromNodeOrNull(aCanvas);
  if (!canvas) {
    return NS_ERROR_INVALID_ARG;
  }
  if (!nsContentUtils::IsChromeDoc(canvas->OwnerDoc())) {
    return NS_ERROR_DOM_SECURITY_ERR;
  }
  if (canvas->GetCurrentContextType() !=
          mozilla::dom::CanvasContextType::NoContext ||
      canvas->IsOffscreen() || canvas->GetAxioExternalImageContainer()) {
    return NS_ERROR_DOM_INVALID_STATE_ERR;
  }
  if (mBoundCanvases.Contains(aTargetId)) {
    return NS_ERROR_ALREADY_INITIALIZED;
  }
  if (mBoundCanvases.Count() >= kMaxTargets) {
    return NS_ERROR_FAILURE;
  }
  RefPtr<ImageContainer> container = mozilla::MakeAndAddRef<ImageContainer>(
      ImageUsageType::OffscreenCanvas, ImageContainer::ASYNCHRONOUS);
  canvas->SetAxioExternalImageContainer(container);
  mBoundCanvases.InsertOrUpdate(aTargetId, do_GetWeakReference(aCanvas));

  RefPtr<EngineEndpoint> self = this;
  dispatch_async(mQueue, ^{
    RefPtr<ImageContainer> owned = container;
    self->BindOnQueue(aTargetId, std::move(owned), aDocumentGeneration,
                      aNavigationGeneration);
  });
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::SetTargetGenerations(uint64_t aTargetId,
                                     uint64_t aDocumentGeneration,
                                     uint64_t aNavigationGeneration) {
  MOZ_ASSERT(NS_IsMainThread());
  RefPtr<EngineEndpoint> self = this;
  dispatch_async(mQueue, ^{
    self->SetGenerationsOnQueue(aTargetId, aDocumentGeneration,
                                aNavigationGeneration);
  });
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::UnbindTarget(uint64_t aTargetId) {
  MOZ_ASSERT(NS_IsMainThread());
  if (auto entry = mBoundCanvases.Extract(aTargetId)) {
    nsCOMPtr<nsINode> node = do_QueryReferent(*entry);
    if (auto* canvas = HTMLCanvasElement::FromNodeOrNull(node.get())) {
      canvas->SetAxioExternalImageContainer(nullptr);
    }
  }
  RefPtr<EngineEndpoint> self = this;
  dispatch_async(mQueue, ^{
    self->UnbindOnQueue(aTargetId);
  });
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::SetTargetVisible(uint64_t aTargetId, bool aVisible) {
  MOZ_ASSERT(NS_IsMainThread());
  RefPtr<EngineEndpoint> self = this;
  dispatch_async(mQueue, ^{
    if (Target* t = self->FindTarget(aTargetId)) {
      t->mVisible = aVisible && !!t->mContainer;
      self->UpdateVsyncOnQueue();
      self->PollReleasesOnQueue();
    }
  });
  return NS_OK;
}

static bool DefineNumber(JSContext* aCx, JS::Handle<JSObject*> aObj,
                         const char* aName, double aValue) {
  return JS_DefineProperty(aCx, aObj, aName, aValue, JSPROP_ENUMERATE);
}

NS_IMETHODIMP
EngineEndpoint::GetTargetStats(uint64_t aTargetId, JSContext* aCx,
                               JS::MutableHandle<JS::Value> aResult) {
  MOZ_ASSERT(NS_IsMainThread());
  __block Stats stats;
  __block bool found = false;
  __block bool visible = false;
  __block uint32_t inFlight = 0;
  __block uint32_t poolSize = 0;
  __block uint32_t paintCount = 0;
  // Diagnostics for the zero-copy release protocol: every frame we still hold.
  struct HeldFrame {
    uint64_t hostFrameId;
    bool current, pinned, inUse;
    int32_t localUseCount;
    double ageMs;
  };
  __block std::vector<HeldFrame> heldFrames;
  EngineEndpoint* raw = this;
  // Short critical section; mQueue never waits on the main thread.
  dispatch_sync(mQueue, ^{
    if (Target* t = raw->FindTarget(aTargetId)) {
      found = true;
      stats = t->mStats;
      visible = t->mVisible;
      for (const auto& p : t->mPresented) {
        inFlight += p.mHostFrameId ? 1 : 0;
      }
      inFlight += t->mHeld ? 1 : 0;
      poolSize = uint32_t(t->mPool.size());
      uint64_t nowTicks = mach_absolute_time();
      for (const auto& p : t->mPresented) {
        heldFrames.push_back(
            {p.mHostFrameId, p.mCurrent, !!p.mUse,
             p.mSurface && IOSurfaceIsInUse(p.mSurface.get()),
             p.mSurface ? IOSurfaceGetUseCount(p.mSurface.get()) : -1,
             p.mPresentedTicks
                 ? double(raw->Nanoseconds(nowTicks - p.mPresentedTicks)) / 1e6
                 : -1});
      }
      paintCount = t->mContainer ? t->mContainer->GetPaintCount() : 0;
    }
  });
  if (!found) {
    aResult.setNull();
    return NS_OK;
  }
  JS::Rooted<JSObject*> obj(aCx, JS_NewPlainObject(aCx));
  if (!obj) {
    return NS_ERROR_OUT_OF_MEMORY;
  }
  JS::Rooted<JS::Value> visibleValue(aCx, JS::BooleanValue(visible));
  if (!DefineNumber(aCx, obj, "received", double(stats.mReceived)) ||
      !DefineNumber(aCx, obj, "presented", double(stats.mPresented)) ||
      !DefineNumber(aCx, obj, "composited", double(paintCount)) ||
      !DefineNumber(aCx, obj, "copied", double(stats.mCopied)) ||
      !DefineNumber(aCx, obj, "zeroCopy", double(stats.mZeroCopy)) ||
      !DefineNumber(aCx, obj, "globalLookupFailed",
                    double(stats.mGlobalLookupFailed)) ||
      !DefineNumber(aCx, obj, "zeroCopyAllowed", mZeroCopyAllowed ? 1 : 0) ||
      !DefineNumber(aCx, obj, "lastCopyNs", double(stats.mLastCopyNs)) ||
      !DefineNumber(aCx, obj, "lastCopyGpuNs", double(stats.mLastCopyGpuNs)) ||
      !DefineNumber(aCx, obj, "lastHostCopyNs", double(stats.mLastHostCopyNs)) ||
      !DefineNumber(aCx, obj, "maxHostFramesInFlight",
                    double(stats.mMaxHostFramesInFlight)) ||
      !DefineNumber(aCx, obj, "stale", double(stats.mStale)) ||
      !DefineNumber(aCx, obj, "held", double(stats.mHeld)) ||
      !DefineNumber(aCx, obj, "rejected", double(stats.mRejected)) ||
      !DefineNumber(aCx, obj, "released", double(stats.mReleased)) ||
      !DefineNumber(aCx, obj, "forcedReleases", double(stats.mForcedReleases)) ||
      !DefineNumber(aCx, obj, "beginFramesSent", double(stats.mBeginFramesSent)) ||
      !DefineNumber(aCx, obj, "beginFramesDropped",
                    double(stats.mBeginFramesDropped)) ||
      !DefineNumber(aCx, obj, "lastPaintToReceiveNs",
                    double(stats.mLastPaintToReceiveNs)) ||
      !DefineNumber(aCx, obj, "hostFramesInFlight", double(inFlight)) ||
      !DefineNumber(aCx, obj, "poolSurfaces", double(poolSize)) ||
      !JS_DefineProperty(aCx, obj, "visible", visibleValue, JSPROP_ENUMERATE)) {
    return NS_ERROR_FAILURE;
  }
  JS::Rooted<JSObject*> frames(aCx, JS::NewArrayObject(aCx, heldFrames.size()));
  if (!frames) {
    return NS_ERROR_OUT_OF_MEMORY;
  }
  for (size_t i = 0; i < heldFrames.size(); ++i) {
    const HeldFrame& f = heldFrames[i];
    JS::Rooted<JSObject*> item(aCx, JS_NewPlainObject(aCx));
    if (!item || !DefineNumber(aCx, item, "hostFrameId", double(f.hostFrameId)) ||
        !DefineNumber(aCx, item, "current", f.current ? 1 : 0) ||
        !DefineNumber(aCx, item, "pinned", f.pinned ? 1 : 0) ||
        !DefineNumber(aCx, item, "inUse", f.inUse ? 1 : 0) ||
        !DefineNumber(aCx, item, "localUseCount", double(f.localUseCount)) ||
        !DefineNumber(aCx, item, "ageMs", f.ageMs) ||
        !JS_DefineElement(aCx, frames, uint32_t(i), item, JSPROP_ENUMERATE)) {
      return NS_ERROR_FAILURE;
    }
  }
  if (!JS_DefineProperty(aCx, obj, "heldFrames", frames, JSPROP_ENUMERATE)) {
    return NS_ERROR_FAILURE;
  }
  // Distributions over the last kSampleCount frames: {count, p50, p95, p99,
  // max} in microseconds.
  const std::pair<const char*, const Samples*> distributions[] = {
      {"presentIntervalUs", &stats.mPresentInterval},
      {"hostCopyUs", &stats.mHostCopy},
      {"copyGpuUs", &stats.mCopyGpu},
      {"paintToPresentUs", &stats.mPaintToPresent},
      {"releaseDelayUs", &stats.mReleaseDelay},
  };
  for (const auto& [name, samples] : distributions) {
    JS::Rooted<JSObject*> dist(aCx, JS_NewPlainObject(aCx));
    if (!dist) {
      return NS_ERROR_OUT_OF_MEMORY;
    }
    size_t n = samples->mCount;
    if (!DefineNumber(aCx, dist, "count", double(n)) ||
        !DefineNumber(aCx, dist, "p50",
                      Percentile(samples->mValues, n, 0.50) / 1000.0) ||
        !DefineNumber(aCx, dist, "p95",
                      Percentile(samples->mValues, n, 0.95) / 1000.0) ||
        !DefineNumber(aCx, dist, "p99",
                      Percentile(samples->mValues, n, 0.99) / 1000.0) ||
        !DefineNumber(aCx, dist, "max",
                      Percentile(samples->mValues, n, 1.0) / 1000.0)) {
      return NS_ERROR_FAILURE;
    }
    JS::Rooted<JS::Value> value(aCx, JS::ObjectValue(*dist));
    if (!JS_DefineProperty(aCx, obj, name, value, JSPROP_ENUMERATE)) {
      return NS_ERROR_FAILURE;
    }
  }
  aResult.setObject(*obj);
  return NS_OK;
}

NS_IMETHODIMP
EngineEndpoint::Close() {
  MOZ_ASSERT(NS_IsMainThread());
  ClearBindingsOnMain();
  RefPtr<EngineEndpoint> self = this;
  dispatch_async(mQueue, ^{
    self->CloseOnQueue("closed"_ns);
  });
  return NS_OK;
}

}  // namespace axio
