// engine-surface-v1 host side for the WKWebView host. See surface_host.hpp.
// connect(), drain() and the FRAME send are adapted from
// native/chromium-host/surface_transport.mm (cloud/integration 5f8b1d0); the CEF GPU
// copy of a pooled capture surface is replaced by a CPU write into the ring surface.
//
// Ring surfaces are global (AXIO_SURFACE_FLAG_GLOBAL_SURFACE) so Gecko's GPU process,
// which resolves IOSurfaces by ID, can composite them without a second copy. A slot is
// reused only after Zen's RELEASE *and* once IOSurfaceIsInUse() is false.
#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <IOSurface/IOSurface.h>
#include <bsm/libbsm.h>
#include <dispatch/dispatch.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <servers/bootstrap.h>
#include <unistd.h>
#include <array>
#include <cstring>
#include "surface_host.hpp"

namespace axio::wksurface {
namespace {

mach_port_t zenPort = MACH_PORT_NULL;    // send right to Zen's checked-in service
mach_port_t replyPort = MACH_PORT_NULL;  // our receive right; Zen holds its only send right
dispatch_source_t source = nil;
Callbacks callbacks;
bool isConnected = false, hasFailed = false;
uint64_t copyNanoseconds = 0;
mach_timebase_info_data_t timebase{};

uint64_t nanoseconds(uint64_t ticks) { return ticks * timebase.numer / timebase.denom; }

struct Received {
  union {
    mach_msg_header_t header;
    axio_surface_connected_msg_t connected;
    axio_surface_release_msg_t release;
    axio_surface_begin_frame_msg_t beginFrame;
    uint8_t bytes[256];
  };
  mach_msg_audit_trailer_t trailer;
};

void fail(const char* reason) {
  if (hasFailed) return;
  hasFailed = true;
  if (source) dispatch_source_cancel(source);
  if (callbacks.failed) callbacks.failed(reason);
}

mach_msg_return_t receive(Received& buffer, mach_msg_timeout_t timeout) {
  memset(&buffer, 0, sizeof(buffer));
  return mach_msg(&buffer.header,
                  MACH_RCV_MSG | MACH_RCV_TIMEOUT | MACH_RCV_TRAILER_TYPE(MACH_MSG_TRAILER_FORMAT_0) |
                      MACH_RCV_TRAILER_ELEMENTS(MACH_RCV_TRAILER_AUDIT),
                  0, sizeof(buffer), replyPort, timeout, MACH_PORT_NULL);
}

// Only the process that spawned this host may speak on the reply port.
bool fromParent(const Received& buffer) {
  const auto* trailer = reinterpret_cast<const mach_msg_audit_trailer_t*>(
      reinterpret_cast<const uint8_t*>(&buffer.header) + round_msg(buffer.header.msgh_size));
  if (reinterpret_cast<const uint8_t*>(trailer) + sizeof(*trailer) > reinterpret_cast<const uint8_t*>(&buffer) + sizeof(buffer)) return false;
  if (trailer->msgh_trailer_size < sizeof(mach_msg_audit_trailer_t)) return false;
  return audit_token_to_pid(trailer->msgh_audit) == getppid();
}

template <class T> bool simple(const Received& buffer) {
  const auto& h = buffer.header;
  if ((h.msgh_bits & MACH_MSGH_BITS_COMPLEX) || h.msgh_size != sizeof(T)) return false;
  const auto* value = reinterpret_cast<const T*>(&buffer.header);
  return value->magic == AXIO_SURFACE_MAGIC && value->version == AXIO_SURFACE_VERSION;
}

void drain() {
  for (int count = 0; count < 256 && !hasFailed; ++count) {
    Received buffer;
    mach_msg_return_t result = receive(buffer, 0);
    if (result == MACH_RCV_TIMED_OUT) return;
    if (result != MACH_MSG_SUCCESS) { fail("surface_receive_failed"); return; }
    if (buffer.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) {
      mach_msg_destroy(&buffer.header);  // never accept rights from Zen after connect
      fail("surface_unexpected_rights");
      return;
    }
    if (buffer.header.msgh_remote_port != MACH_PORT_NULL) {
      mach_msg_destroy(&buffer.header);
      fail("surface_unexpected_reply_right");
      return;
    }
    if (!fromParent(buffer)) { fail("surface_wrong_sender"); return; }
    if (buffer.header.msgh_id == AXIO_SURFACE_MSG_RELEASE && simple<axio_surface_release_msg_t>(buffer)) {
      const auto& value = buffer.release;
      if (!value.frame_id || !callbacks.release || !callbacks.release(value.native_target_id, value.frame_id)) {
        fail("surface_invalid_release");
        return;
      }
    } else if (buffer.header.msgh_id == AXIO_SURFACE_MSG_BEGIN_FRAME && simple<axio_surface_begin_frame_msg_t>(buffer)) {
      const auto& value = buffer.beginFrame;
      if (!value.sequence) { fail("surface_invalid_begin_frame"); return; }
      if (callbacks.beginFrame) callbacks.beginFrame(value.native_target_id, value.sequence);
    } else {
      fail("surface_unknown_message");
      return;
    }
  }
}

// kIOSurfaceIsGlobal is deprecated but still honoured; Gecko's MacIOSurface sets it too.
CFStringRef globalKey() {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
  return kIOSurfaceIsGlobal;
#pragma clang diagnostic pop
}

IOSurfaceRef createSurface(int width, int height) {
  size_t row = IOSurfaceAlignProperty(kIOSurfaceBytesPerRow, size_t(width) * 4);
  NSDictionary* properties = @{
    (id)kIOSurfaceWidth: @(width), (id)kIOSurfaceHeight: @(height),
    (id)kIOSurfaceBytesPerElement: @4, (id)kIOSurfaceBytesPerRow: @(row),
    (id)kIOSurfaceAllocSize: @(IOSurfaceAlignProperty(kIOSurfaceAllocSize, row * size_t(height))),
    (id)kIOSurfacePixelFormat: @((uint32_t)'BGRA'),
    // Gecko's GPU process looks surfaces up by ID; see engine-surface-v1 "Security".
    (__bridge id)globalKey(): @YES,
  };
  IOSurfaceRef surface = IOSurfaceCreate((__bridge CFDictionaryRef)properties);
  if (!surface) return nullptr;
  // WebKit snapshots are drawn into sRGB premultiplied BGRA by the host.
  CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
  if (CFPropertyListRef list = CGColorSpaceCopyPropertyList(space)) {
    IOSurfaceSetValue(surface, kIOSurfaceColorSpace, list);
    CFRelease(list);
  }
  CGColorSpaceRelease(space);
  return surface;
}

}  // namespace

struct Slot {
  IOSurfaceRef surface = nullptr;
  int width = 0, height = 0;
  bool inFlight = false;
  uint64_t frame = 0;
};

class Ring {
 public:
  std::array<Slot, AXIO_SURFACE_MAX_IN_FLIGHT> slots;
  ~Ring() { for (auto& slot : slots) if (slot.surface) CFRelease(slot.surface); }
  Slot* acquire(int width, int height) {
    Slot* chosen = nullptr;
    for (auto& slot : slots) {
      if (slot.inFlight) continue;
      // Released by Zen; a surface still in use by its compositor or WindowServer is skipped.
      if (slot.surface && IOSurfaceIsInUse(slot.surface)) continue;
      if (slot.width == width && slot.height == height) return &slot;
      if (!chosen) chosen = &slot;
    }
    if (!chosen) return nullptr;
    if (chosen->surface) CFRelease(chosen->surface);
    chosen->surface = createSurface(width, height);
    chosen->width = chosen->surface ? width : 0;
    chosen->height = chosen->surface ? height : 0;
    return chosen->surface ? chosen : nullptr;
  }
};

bool connect(const std::string& service, const uint8_t (&token)[AXIO_SURFACE_TOKEN_BYTES], int timeoutMs, std::string& error) {
  mach_timebase_info(&timebase);
  // The name arrived only through the authenticated private pipe.
  if (bootstrap_look_up(bootstrap_port, service.c_str(), &zenPort) != KERN_SUCCESS) {
    zenPort = MACH_PORT_NULL; error = "surface_service_not_found"; return false;
  }
  if (mach_port_allocate(mach_task_self(), MACH_PORT_RIGHT_RECEIVE, &replyPort) != KERN_SUCCESS) {
    error = "surface_port_allocation_failed"; return false;
  }
  mach_port_limits_t limits{MACH_PORT_QLIMIT_LARGE};
  mach_port_set_attributes(mach_task_self(), replyPort, MACH_PORT_LIMITS_INFO,
                           reinterpret_cast<mach_port_info_t>(&limits), MACH_PORT_LIMITS_INFO_COUNT);
  axio_surface_connect_msg_t message{};
  message.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, MACH_MSGH_BITS_COMPLEX);
  message.header.msgh_size = sizeof(message);
  message.header.msgh_remote_port = zenPort;
  message.header.msgh_id = AXIO_SURFACE_MSG_CONNECT;
  message.body.msgh_descriptor_count = 1;
  message.reply_port.name = replyPort;
  message.reply_port.disposition = MACH_MSG_TYPE_MAKE_SEND;
  message.reply_port.type = MACH_MSG_PORT_DESCRIPTOR;
  message.data.magic = AXIO_SURFACE_MAGIC;
  message.data.version = AXIO_SURFACE_VERSION;
  memcpy(message.data.token, token, AXIO_SURFACE_TOKEN_BYTES);
  message.data.host_pid = uint32_t(getpid());
  mach_msg_return_t sent = mach_msg(&message.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, sizeof(message), 0,
                                    MACH_PORT_NULL, mach_msg_timeout_t(timeoutMs), MACH_PORT_NULL);
  memset(&message.data.token, 0, sizeof(message.data.token));
  if (sent != MACH_MSG_SUCCESS) { error = "surface_connect_send_failed"; return false; }
  Received buffer;
  mach_msg_return_t received = receive(buffer, mach_msg_timeout_t(timeoutMs));
  if (received != MACH_MSG_SUCCESS) { error = "surface_connect_timeout"; return false; }
  if ((buffer.header.msgh_bits & MACH_MSGH_BITS_COMPLEX) || buffer.header.msgh_remote_port != MACH_PORT_NULL) {
    mach_msg_destroy(&buffer.header); error = "surface_connect_rights"; return false;
  }
  if (buffer.header.msgh_id != AXIO_SURFACE_MSG_CONNECTED || !simple<axio_surface_connected_msg_t>(buffer)) {
    error = "surface_connect_invalid"; return false;
  }
  if (!fromParent(buffer)) { error = "surface_connect_wrong_sender"; return false; }
  isConnected = true;
  return true;
}

void start(Callbacks value) {
  callbacks = std::move(value);
  source = dispatch_source_create(DISPATCH_SOURCE_TYPE_MACH_RECV, replyPort, 0, dispatch_get_main_queue());
  dispatch_source_set_event_handler(source, ^{ @autoreleasepool { drain(); } });
  dispatch_resume(source);
}

bool connected() { return isConnected && !hasFailed; }

void shutdown() {
  if (source) { dispatch_source_cancel(source); source = nil; }
  if (replyPort != MACH_PORT_NULL) { mach_port_mod_refs(mach_task_self(), replyPort, MACH_PORT_RIGHT_RECEIVE, -1); replyPort = MACH_PORT_NULL; }
  if (zenPort != MACH_PORT_NULL) { mach_port_deallocate(mach_task_self(), zenPort); zenPort = MACH_PORT_NULL; }
  isConnected = false;
}

Ring* createRing() { return new Ring(); }
void destroyRing(Ring* ring) { delete ring; }

Result present(Ring* ring, const uint8_t* pixels, int width, int height, const FrameMeta& meta) {
  uint64_t started = mach_absolute_time();
  if (!ring || !connected() || !pixels || width <= 0 || height <= 0 || width > 4096 || height > 4096) return Result::Failed;
  Slot* slot = ring->acquire(width, height);
  if (!slot) return Result::NoFreeSlot;
  // The slot is free (released and not in use), so a CPU write cannot tear a presented frame.
  if (IOSurfaceLock(slot->surface, 0, nullptr) != kIOReturnSuccess) return Result::Failed;
  auto* base = static_cast<uint8_t*>(IOSurfaceGetBaseAddress(slot->surface));
  size_t stride = IOSurfaceGetBytesPerRow(slot->surface), row = size_t(width) * 4;
  if (stride == row) memcpy(base, pixels, row * size_t(height));
  else for (int y = 0; y < height; ++y) memcpy(base + stride * size_t(y), pixels + row * size_t(y), row);
  IOSurfaceUnlock(slot->surface, 0, nullptr);

  mach_port_t port = IOSurfaceCreateMachPort(slot->surface);
  if (port == MACH_PORT_NULL) return Result::Failed;
  axio_surface_frame_msg_t message{};
  message.header.msgh_bits = MACH_MSGH_BITS_SET(MACH_MSG_TYPE_COPY_SEND, 0, 0, MACH_MSGH_BITS_COMPLEX);
  message.header.msgh_size = sizeof(message);
  message.header.msgh_remote_port = zenPort;
  message.header.msgh_id = AXIO_SURFACE_MSG_FRAME;
  message.body.msgh_descriptor_count = 1;
  message.surface.name = port;
  message.surface.disposition = MACH_MSG_TYPE_MOVE_SEND;
  message.surface.type = MACH_MSG_PORT_DESCRIPTOR;
  auto& data = message.data;
  data.magic = AXIO_SURFACE_MAGIC;
  data.version = AXIO_SURFACE_VERSION;
  data.native_target_id = meta.target;
  data.document_generation = meta.documentGeneration;
  data.navigation_generation = meta.navigationGeneration;
  data.frame_id = meta.frameId;
  data.paint_time = meta.paintTime ? meta.paintTime : started;
  data.begin_frame_sequence = meta.beginFrameSequence;
  data.width = uint32_t(width);
  data.height = uint32_t(height);
  data.logical_width = meta.logicalWidth;
  data.logical_height = meta.logicalHeight;
  data.device_scale = meta.scale;
  data.format = AXIO_SURFACE_FORMAT_BGRA8_PREMULTIPLIED_SRGB;
  data.surface_id = IOSurfaceGetID(slot->surface);
  data.flags = AXIO_SURFACE_FLAG_GLOBAL_SURFACE;
  if (meta.dirty.width > 0 && meta.dirty.height > 0) {
    data.dirty_count = 1;
    data.dirty[0] = {meta.dirty.x, meta.dirty.y, meta.dirty.width, meta.dirty.height};
  }
  // Record credit before sending: a release may be processed right after.
  slot->inFlight = true;
  slot->frame = meta.frameId;
  copyNanoseconds = nanoseconds(mach_absolute_time() - started);
  data.send_time = mach_absolute_time();
  // Zen's queue limit covers every frame in flight: a full queue is a protocol violation,
  // and the WebKit UI thread never blocks on Zen.
  mach_msg_return_t result = mach_msg(&message.header, MACH_SEND_MSG | MACH_SEND_TIMEOUT, sizeof(message), 0,
                                      MACH_PORT_NULL, 0, MACH_PORT_NULL);
  if (result != MACH_MSG_SUCCESS) {
    slot->inFlight = false;
    mach_port_deallocate(mach_task_self(), message.surface.name);
    fail(result == MACH_SEND_TIMED_OUT ? "surface_queue_full" : "surface_send_failed");
    return Result::Failed;
  }
  return Result::Sent;
}

bool release(Ring* ring, uint64_t frameId) {
  if (!ring) return false;
  for (auto& slot : ring->slots)
    if (slot.inFlight && slot.frame == frameId) { slot.inFlight = false; return true; }
  return false;
}

size_t inFlight(Ring* ring) {
  size_t count = 0;
  if (ring) for (auto& slot : ring->slots) count += slot.inFlight;
  return count;
}

uint64_t lastCopyNanoseconds() { return copyNanoseconds; }

}  // namespace axio::wksurface
