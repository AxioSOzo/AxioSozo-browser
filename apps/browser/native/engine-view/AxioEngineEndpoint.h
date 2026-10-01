/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_axio_AxioEngineEndpoint_h
#define mozilla_axio_AxioEngineEndpoint_h

// Included only by the Objective-C++ sources of this directory (dispatch
// object types differ between C++ and Objective-C++ translation units).

#include <dispatch/dispatch.h>
#include <mach/mach.h>
#include <mach/mach_time.h>

#include <algorithm>
#include <deque>
#include <map>
#include <vector>

#include "CFTypeRefPtr.h"
#include "mozilla/Atomics.h"
#include "mozilla/Maybe.h"
#include "mozilla/RefPtr.h"
#include "mozilla/TimeStamp.h"
#include "nsCOMPtr.h"
#include "nsIAxioEngineSurfaceService.h"
#include "nsIWeakReferenceUtils.h"
#include "nsString.h"
#include "nsTHashMap.h"

#include "engine_surface_v1.h"

struct __IOSurface;
typedef __IOSurface* IOSurfaceRef;
class MacIOSurface;

namespace mozilla::layers {
class ImageContainer;
}  // namespace mozilla::layers

namespace axio {

class EngineVsyncForwarder;
class EngineSurfaceCopier;

/**
 * One Mach endpoint for one engine host process (contracts/engine-surface-v1.md).
 *
 * Threading: every Mach right, the target table and all frame bookkeeping
 * live on mQueue (a private serial GCD queue). The main thread only creates
 * the endpoint, binds/unbinds canvases, forwards generations it learned from
 * the JSON pipe, and receives listener callbacks. The vsync thread only posts
 * ticks to mQueue. Frames go Mach -> mQueue -> ImageContainer::
 * SetCurrentImages -> ImageBridge thread -> compositor, never the main thread.
 */
class EngineEndpoint final : public nsIAxioEngineEndpoint {
 public:
  NS_DECL_THREADSAFE_ISUPPORTS
  NS_DECL_NSIAXIOENGINEENDPOINT

  // Main thread.
  static nsresult Create(bool aExternalBeginFrames, EngineEndpoint** aResult);

  // mQueue, from EngineVsyncForwarder.
  void OnVsyncOnQueue(uint64_t aFrameTimeTicks, uint64_t aIntervalNs);

 private:
  EngineEndpoint();
  ~EngineEndpoint();

  // A frame the compositor may read. Its host frame (zero-copy) or its pool
  // slot (copy mode) is recycled only after a later frame of the same
  // binding was composited and IOSurfaceIsInUse() turned false.
  struct Presented {
    uint64_t mHostFrameId = 0;  // 0: copy mode, host frame already released
    uint64_t mPresentedTicks = 0;  // mach_absolute_time of SetCurrentImages
    CFTypeRefPtr<IOSurfaceRef> mSurface;  // reference, no use count
    RefPtr<MacIOSurface> mUse;            // one use count while pinned
    mozilla::TimeStamp mUnpinnedAt;
    bool mCurrent = false;
  };

  // A frame of a newer generation than the one chrome JS has acknowledged:
  // held (not shown, not released) so page content never appears before the
  // address bar learned about the navigation.
  struct Held {
    axio_surface_frame_body_t mData;
    CFTypeRefPtr<IOSurfaceRef> mSurface;
  };

  // Last kSampleCount values of one per-frame duration (nanoseconds), for
  // percentiles in getTargetStats (E2 perf evidence).
  static constexpr size_t kSampleCount = 512;
  struct Samples {
    uint64_t mValues[kSampleCount] = {};
    size_t mNext = 0;
    size_t mCount = 0;
    void Add(uint64_t aValue) {
      mValues[mNext] = aValue;
      mNext = (mNext + 1) % kSampleCount;
      mCount = std::min(mCount + 1, kSampleCount);
    }
  };

  struct Stats {
    uint64_t mReceived = 0;
    uint64_t mPresented = 0;
    uint64_t mCopied = 0;
    uint64_t mZeroCopy = 0;           // presented the host's global surface directly
    uint64_t mGlobalLookupFailed = 0; // flag set on a surface not created global: copied
    uint64_t mLastCopyNs = 0;
    uint64_t mLastCopyGpuNs = 0;      // Metal GPUEndTime - GPUStartTime of our blit
    uint64_t mLastHostCopyNs = 0;     // FRAME send_time - paint_time (host blit + send)
    uint64_t mMaxHostFramesInFlight = 0;
    uint64_t mStale = 0;
    uint64_t mHeld = 0;
    uint64_t mRejected = 0;
    uint64_t mReleased = 0;
    uint64_t mForcedReleases = 0;
    uint64_t mBeginFramesSent = 0;
    uint64_t mBeginFramesDropped = 0;
    uint64_t mLastPaintToReceiveNs = 0;
    Samples mPresentInterval;  // successive SetCurrentImages of this target
    Samples mHostCopy;         // send_time - paint_time
    Samples mCopyGpu;          // copy mode only
    Samples mPaintToPresent;   // host paint_time -> SetCurrentImages
    Samples mReleaseDelay;     // zero-copy: SetCurrentImages -> RELEASE
    uint64_t mLastPresentTicks = 0;
  };

  struct Target {
    uint64_t mId = 0;
    RefPtr<mozilla::layers::ImageContainer> mContainer;  // null when unbound
    uint64_t mDocumentGeneration = 0;
    uint64_t mNavigationGeneration = 0;
    uint32_t mProducerId = 0;
    uint32_t mNextGeckoFrameId = 1;
    uint32_t mCurrentGeckoFrameId = 0;
    bool mVisible = false;
    bool mHasFirstFrame = false;
    uint64_t mBeginFrameSequence = 0;
    std::deque<Presented> mPresented;
    mozilla::Maybe<Held> mHeld;
    // Copy mode: Gecko-owned global IOSurfaces (MacIOSurface::CreateIOSurface).
    std::vector<CFTypeRefPtr<IOSurfaceRef>> mPool;
    uint32_t mWidth = 0, mHeight = 0, mLogicalWidth = 0, mLogicalHeight = 0;
    double mScale = 0;
    Stats mStats;
  };

  enum class Order { Stale, Current, Future };
  static Order Compare(const Target& aTarget,
                       const axio_surface_frame_body_t& aData);

  // --- mQueue ---
  void DrainOnQueue();
  void HandleMessageOnQueue(mach_msg_header_t* aHeader, pid_t aSenderPid);
  void HandleConnectOnQueue(mach_msg_header_t* aHeader, pid_t aSenderPid);
  void HandleFrameOnQueue(mach_msg_header_t* aHeader, pid_t aSenderPid);
  // False when copy mode found no free pool surface (the frame stays held).
  uint64_t Nanoseconds(uint64_t aTicks) const;
  bool TryPresentOnQueue(Target& aTarget,
                         const axio_surface_frame_body_t& aData,
                         const CFTypeRefPtr<IOSurfaceRef>& aSurface);
  CFTypeRefPtr<IOSurfaceRef> AcquirePoolSurfaceOnQueue(Target& aTarget,
                                                       uint32_t aWidth,
                                                       uint32_t aHeight);
  bool SendReleaseOnQueue(uint64_t aTargetId, uint64_t aFrameId);
  void PollReleasesOnQueue();
  void SchedulePollOnQueue();
  void UpdateVsyncOnQueue();
  bool WantsTicks(const Target& aTarget) const;
  void BindOnQueue(uint64_t aTargetId,
                   RefPtr<mozilla::layers::ImageContainer>&& aContainer,
                   uint64_t aDocumentGeneration, uint64_t aNavigationGeneration);
  void UnbindOnQueue(uint64_t aTargetId);
  void SetGenerationsOnQueue(uint64_t aTargetId, uint64_t aDocumentGeneration,
                             uint64_t aNavigationGeneration);
  void DropHeldOnQueue(Target& aTarget);
  void FailOnQueue(const nsACString& aReason);
  void CloseOnQueue(const nsACString& aReason);
  Target* FindTarget(uint64_t aId);

  // --- main thread ---
  void NotifyConnected(int32_t aPid);
  void NotifyGeometry(const Target& aTarget);
  void NotifyClosed(const nsACString& aReason);
  void ClearBindingsOnMain();

  dispatch_queue_t mQueue = nullptr;
  dispatch_source_t mSource = nullptr;  // MACH_RECV on mServicePort
  bool mExternalBeginFrames = false;
  // Pref axiosozo.engine_view.zero_copy (default true), read once at Create.
  // False forces copy mode even for AXIO_SURFACE_FLAG_GLOBAL_SURFACE frames.
  bool mZeroCopyAllowed = true;

  // Rights owned on mQueue after Create().
  mach_port_t mServicePort = MACH_PORT_NULL;  // receive right
  mach_port_t mHostPort = MACH_PORT_NULL;     // send right from CONNECT
  mozilla::Atomic<int32_t> mExpectedPid{0};
  pid_t mHostPid = 0;
  uint8_t mToken[AXIO_SURFACE_TOKEN_BYTES];
  bool mTokenConsumed = false;  // CONNECT accepted (or endpoint closed)
  uint64_t mLastHostFrameId = 0;
  bool mPollScheduled = false;
  mozilla::Atomic<uint32_t> mState{STATE_LISTENING};

  std::map<uint64_t, Target> mTargets;  // mQueue only
  RefPtr<EngineVsyncForwarder> mVsync;
  bool mVsyncObserving = false;
  RefPtr<EngineSurfaceCopier> mCopier;  // mQueue only, created lazily

  // Main thread only.
  nsCString mServiceName;
  nsCString mTokenHex;  // cleared by TakeToken()
  bool mTokenTaken = false;
  nsCOMPtr<nsIAxioEngineEndpointListener> mListener;
  nsTHashMap<uint64_t, nsWeakPtr> mBoundCanvases;
  bool mClosedNotified = false;

  mach_timebase_info_data_t mTimebase{};
};

}  // namespace axio

#endif  // mozilla_axio_AxioEngineEndpoint_h
