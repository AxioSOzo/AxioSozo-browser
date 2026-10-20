/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Linux frame receiver: engine-stream-v1 §6.3 memfd frames straight into a
// chrome <canvas>'s async ImageContainer. docs/perf/pixel-path.md, "Native
// receiver". The JS presenters remain the fallback (no component, pref off,
// bind refused).
//
// Threads: the XPCOM objects are main-thread only. Pixels are touched only on
// the ring's background task queue (one per host, FIFO): ApplyFrame copies the
// slot's rows into the target's whole frame, Present copies the whole frame
// into a recycled B8G8R8X8 SharedRGBImage and sets it on the container (the
// ImageBridge forwards it to the compositor without the main thread). The
// ApplyFrame promise resolves on the main thread after the slot copy: chrome
// JS acknowledges the frame then, which is the slot's reuse barrier (§6).

#include "AxioFrameReceiver.h"

#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

#include <atomic>
#include <cstdio>
#include <cstring>
#include <vector>

#include "ImageContainer.h"
#include "js/ArrayBuffer.h"
#include "js/GCAPI.h"
#include "jsapi.h"
#include "mozilla/ErrorResult.h"
#include "mozilla/Mutex.h"
#include "mozilla/TimeStamp.h"
#include "mozilla/dom/Element.h"
#include "mozilla/dom/HTMLCanvasElement.h"
#include "mozilla/dom/Promise.h"
#include "mozilla/gfx/2D.h"
#include "mozilla/layers/SharedRGBImage.h"
#include "mozilla/layers/TextureClient.h"
#include "nsContentUtils.h"
#include "nsIGlobalObject.h"
#include "nsProxyRelease.h"
#include "nsThreadUtils.h"
#include "xpcpublic.h"

using mozilla::MutexAutoLock;
using mozilla::TimeStamp;
using mozilla::dom::Element;
using mozilla::dom::HTMLCanvasElement;
using mozilla::dom::Promise;
using mozilla::layers::ImageContainer;
using mozilla::layers::ImageUsageType;

namespace axio {

namespace {
constexpr uint32_t kMaxSide = 4096;
constexpr uint64_t kMaxSlotBytes = 33554432;  // engine-stream-v1 §6.3
constexpr uint32_t kMaxSlots = 4;
#ifndef F_GET_SEALS
constexpr int F_GET_SEALS = 1034;
constexpr int F_SEAL_SHRINK = 0x0002;
constexpr int F_SEAL_GROW = 0x0004;
#endif

// The pid's parent, from /proc/<pid>/stat (field 4, after the parenthesized comm).
pid_t ParentOf(int32_t aPid) {
  char path[64];
  snprintf(path, sizeof(path), "/proc/%d/stat", aPid);
  FILE* file = fopen(path, "re");
  if (!file) {
    return -1;
  }
  char buffer[1024];
  size_t length = fread(buffer, 1, sizeof(buffer) - 1, file);
  fclose(file);
  buffer[length] = '\0';
  const char* end = strrchr(buffer, ')');
  int parent = -1;
  char state = 0;
  if (!end || sscanf(end + 1, " %c %d", &state, &parent) != 2) {
    return -1;
  }
  return parent;
}
}  // namespace

// ---------------------------------------------------------------------------
// Shared state (thread-safe refcounted; never XPCOM).

struct RingState {
  NS_INLINE_DECL_THREADSAFE_REFCOUNTING(RingState)

  const uint8_t* mMap = nullptr;
  size_t mMapBytes = 0;
  uint32_t mSlotBytes = 0;
  uint32_t mSlots = 0;
  nsCOMPtr<nsISerialEventTarget> mQueue;

  const uint8_t* Slot(uint32_t aSlot) const {
    return mMap + size_t(aSlot) * mSlotBytes;
  }

 private:
  ~RingState() {
    if (mMap) {
      munmap(const_cast<uint8_t*>(mMap), mMapBytes);
    }
  }
};

struct SinkState {
  NS_INLINE_DECL_THREADSAFE_REFCOUNTING(SinkState)

  explicit SinkState(RingState* aRing) : mRing(aRing) {}

  RefPtr<RingState> mRing;
  // The whole frame: written by Apply (queue), read by Present (queue) and
  // CopyFrame (main thread).
  mozilla::Mutex mLock MOZ_UNANNOTATED{"AxioFrameSink::mLock"};
  std::vector<uint8_t> mFrame;
  uint32_t mWidth = 0, mHeight = 0;
  bool mValid = false;
  // Queue only.
  RefPtr<ImageContainer> mContainer;
  ImageContainer::ProducerID mProducerId = ImageContainer::AllocateProducerID();
  ImageContainer::FrameID mNextFrameId = 1;
  // Presents queued and not yet run: only the newest one copies.
  std::atomic<uint32_t> mPendingPresents{0};
  // Counters (relaxed; diagnostics).
  std::atomic<uint64_t> mApplied{0}, mPresented{0}, mSkipped{0}, mFailed{0};
  std::atomic<uint64_t> mApplyMicros{0}, mPresentMicros{0};
  std::atomic<uint64_t> mSharedImages{0}, mSurfaceImages{0};

  // Queue: slot rows -> whole frame. False when the payload does not fit.
  bool Apply(uint32_t aSlot, uint32_t aBytes, uint32_t aWidth, uint32_t aHeight,
             uint32_t aX, uint32_t aY, uint32_t aW, uint32_t aH) {
    TimeStamp start = TimeStamp::Now();
    const RingState& ring = *mRing;
    if (aSlot >= ring.mSlots || aBytes > ring.mSlotBytes || !aWidth ||
        !aHeight || aWidth > kMaxSide || aHeight > kMaxSide || !aW || !aH ||
        uint64_t(aX) + aW > aWidth || uint64_t(aY) + aH > aHeight ||
        uint64_t(aW) * aH * 4 != aBytes) {
      return false;
    }
    const uint8_t* source = ring.Slot(aSlot);
    bool whole = aX == 0 && aY == 0 && aW == aWidth && aH == aHeight;
    {
      MutexAutoLock lock(mLock);
      if (whole) {
        mFrame.resize(size_t(aBytes));
        memcpy(mFrame.data(), source, aBytes);
      } else {
        if (!mValid || mWidth != aWidth || mHeight != aHeight) {
          return false;
        }
        size_t rowBytes = size_t(aW) * 4;
        for (uint32_t row = 0; row < aH; ++row) {
          memcpy(mFrame.data() + (size_t(aY + row) * aWidth + aX) * 4,
                 source + row * rowBytes, rowBytes);
        }
      }
      mWidth = aWidth;
      mHeight = aHeight;
      mValid = true;
    }
    mApplied++;
    mApplyMicros += uint64_t((TimeStamp::Now() - start).ToMicroseconds());
    return true;
  }

  // Queue: the whole frame -> a new image on the container.
  void Present() {
    if (mPendingPresents.fetch_sub(1) > 1) {
      mSkipped++;  // a newer present is queued behind this one
      return;
    }
    if (!mContainer) {
      return;
    }
    TimeStamp start = TimeStamp::Now();
    RefPtr<mozilla::layers::Image> image;
    {
      MutexAutoLock lock(mLock);
      if (!mValid) {
        return;
      }
      mozilla::gfx::IntSize size(int32_t(mWidth), int32_t(mHeight));
      // BGRX: the engine frame is opaque (the 2D path's canvas is alpha:false too).
      RefPtr<mozilla::layers::SharedRGBImage> shared =
          mContainer->CreateSharedRGBImage();
      if (shared &&
          shared->Allocate(size, mozilla::gfx::SurfaceFormat::B8G8R8X8)) {
        if (mozilla::layers::TextureClient* texture =
                shared->GetTextureClient(nullptr)) {
          mozilla::layers::TextureClientAutoLock autoLock(
              texture, mozilla::layers::OpenMode::OPEN_WRITE_ONLY);
          mozilla::layers::MappedTextureData mapped;
          if (autoLock.Succeeded() && texture->BorrowMappedData(mapped) &&
              mapped.size == size && mapped.stride >= int32_t(mWidth * 4)) {
            CopyRows(mapped.data, size_t(mapped.stride));
            image = shared;
            mSharedImages++;
          }
        }
      }
      if (!image) {
        // No recycled texture: a plain surface, uploaded by the image client.
        RefPtr<mozilla::gfx::DataSourceSurface> surface =
            mozilla::gfx::Factory::CreateDataSourceSurface(
                size, mozilla::gfx::SurfaceFormat::B8G8R8X8);
        if (!surface) {
          mFailed++;
          return;
        }
        {
          mozilla::gfx::DataSourceSurface::ScopedMap map(
              surface, mozilla::gfx::DataSourceSurface::WRITE);
          if (!map.IsMapped()) {
            mFailed++;
            return;
          }
          CopyRows(map.GetData(), size_t(map.GetStride()));
        }
        image = new mozilla::layers::SourceSurfaceImage(size, surface);
        mSurfaceImages++;
      }
    }
    AutoTArray<ImageContainer::NonOwningImage, 1> images;
    images.AppendElement(ImageContainer::NonOwningImage(
        image, TimeStamp(), mNextFrameId++, mProducerId));
    mContainer->SetCurrentImages(images);
    mPresented++;
    mPresentMicros += uint64_t((TimeStamp::Now() - start).ToMicroseconds());
  }

  // Under mLock.
  void CopyRows(uint8_t* aTarget, size_t aStride) {
    size_t rowBytes = size_t(mWidth) * 4;
    if (aStride == rowBytes) {
      memcpy(aTarget, mFrame.data(), rowBytes * mHeight);
      return;
    }
    for (uint32_t row = 0; row < mHeight; ++row) {
      memcpy(aTarget + row * aStride, mFrame.data() + row * rowBytes, rowBytes);
    }
  }

 private:
  ~SinkState() {
    // The container's last reference goes away on the main thread.
    NS_ReleaseOnMainThread("AxioFrameSink::mContainer", mContainer.forget());
  }
};

// ---------------------------------------------------------------------------
// nsIAxioFrameReceiverService

NS_IMPL_ISUPPORTS(FrameReceiverService, nsIAxioFrameReceiverService)

NS_IMETHODIMP
FrameReceiverService::OpenRing(int32_t aHostPid, int32_t aFd,
                               uint32_t aSlotBytes, uint32_t aSlots,
                               nsIAxioFrameRing** aRing) {
  MOZ_ASSERT(NS_IsMainThread());
  if (aHostPid <= 1 || aFd < 3 || aFd > 65535 || !aSlotBytes ||
      aSlotBytes > kMaxSlotBytes || !aSlots || aSlots > kMaxSlots) {
    return NS_ERROR_INVALID_ARG;
  }
  // Only a host this process spawned (the same rule as the macOS endpoint's
  // expectHostPid): another process's descriptors are never opened.
  if (ParentOf(aHostPid) != getpid()) {
    return NS_ERROR_DOM_SECURITY_ERR;
  }
  char path[64];
  snprintf(path, sizeof(path), "/proc/%d/fd/%d", aHostPid, aFd);
  int fd = open(path, O_RDONLY | O_CLOEXEC);
  if (fd < 0) {
    return NS_ERROR_FILE_ACCESS_DENIED;
  }
  size_t bytes = size_t(aSlotBytes) * aSlots;
  struct stat info{};
  int seals = fcntl(fd, F_GET_SEALS);
  // Exactly the announced ring, sealed so it can never shrink under the map.
  if (fstat(fd, &info) != 0 || !S_ISREG(info.st_mode) ||
      uint64_t(info.st_size) != bytes || seals < 0 ||
      (seals & (F_SEAL_SHRINK | F_SEAL_GROW)) != (F_SEAL_SHRINK | F_SEAL_GROW)) {
    close(fd);
    return NS_ERROR_FILE_CORRUPTED;
  }
  void* map = mmap(nullptr, bytes, PROT_READ, MAP_SHARED, fd, 0);
  close(fd);
  if (map == MAP_FAILED) {
    return NS_ERROR_OUT_OF_MEMORY;
  }
  RefPtr<RingState> state = new RingState();
  state->mMap = static_cast<const uint8_t*>(map);
  state->mMapBytes = bytes;
  state->mSlotBytes = aSlotBytes;
  state->mSlots = aSlots;
  nsresult rv = NS_CreateBackgroundTaskQueue("AxioFrameRing",
                                             getter_AddRefs(state->mQueue));
  if (NS_FAILED(rv)) {
    return rv;
  }
  RefPtr<FrameRing> ring = new FrameRing(state);
  ring.forget(aRing);
  return NS_OK;
}

// ---------------------------------------------------------------------------
// nsIAxioFrameRing

NS_IMPL_ISUPPORTS(FrameRing, nsIAxioFrameRing)

FrameRing::FrameRing(RingState* aState) : mState(aState) {}

FrameRing::~FrameRing() = default;

NS_IMETHODIMP
FrameRing::CreateSink(nsIAxioFrameSink** aSink) {
  MOZ_ASSERT(NS_IsMainThread());
  if (!mState) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  RefPtr<FrameSink> sink = new FrameSink(mState);
  sink.forget(aSink);
  return NS_OK;
}

NS_IMETHODIMP
FrameRing::Close() {
  MOZ_ASSERT(NS_IsMainThread());
  // Sinks keep the mapping alive until their queued work is done.
  mState = nullptr;
  return NS_OK;
}

// ---------------------------------------------------------------------------
// nsIAxioFrameSink

NS_IMPL_ISUPPORTS(FrameSink, nsIAxioFrameSink)

FrameSink::FrameSink(RingState* aRing) : mState(new SinkState(aRing)) {}

FrameSink::~FrameSink() { Unbind(); }

void FrameSink::Unbind() {
  nsCOMPtr<nsINode> node = do_QueryReferent(mCanvas);
  if (auto* canvas = HTMLCanvasElement::FromNodeOrNull(node.get())) {
    canvas->SetAxioExternalImageContainer(nullptr);
  }
  mCanvas = nullptr;
  if (mState) {
    RefPtr<SinkState> state = mState;
    (void)state->mRing->mQueue->Dispatch(NS_NewRunnableFunction(
        "AxioFrameSink::Unbind", [state] {
          NS_ReleaseOnMainThread("AxioFrameSink::mContainer",
                                 state->mContainer.forget());
        }));
  }
}

NS_IMETHODIMP
FrameSink::BindCanvas(Element* aCanvas) {
  MOZ_ASSERT(NS_IsMainThread());
  if (mClosed) {
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
      canvas->IsOffscreen() || canvas->GetAxioExternalImageContainer() ||
      mCanvas) {
    return NS_ERROR_DOM_INVALID_STATE_ERR;
  }
  RefPtr<ImageContainer> container = mozilla::MakeAndAddRef<ImageContainer>(
      ImageUsageType::OffscreenCanvas, ImageContainer::ASYNCHRONOUS);
  canvas->SetAxioExternalImageContainer(container);
  mCanvas = do_GetWeakReference(aCanvas);
  RefPtr<SinkState> state = mState;
  // Queued before any present this binding serves.
  return state->mRing->mQueue->Dispatch(NS_NewRunnableFunction(
      "AxioFrameSink::BindCanvas",
      [state, container = std::move(container)]() mutable {
        NS_ReleaseOnMainThread("AxioFrameSink::mContainer",
                               state->mContainer.forget());
        state->mContainer = std::move(container);
      }));
}

NS_IMETHODIMP
FrameSink::ApplyFrame(uint32_t aSlot, uint32_t aPayloadBytes, uint32_t aWidth,
                      uint32_t aHeight, uint32_t aX, uint32_t aY, uint32_t aW,
                      uint32_t aH, JSContext* aCx, Promise** aPromise) {
  MOZ_ASSERT(NS_IsMainThread());
  if (mClosed) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  nsIGlobalObject* global = xpc::CurrentNativeGlobal(aCx);
  if (!global) {
    return NS_ERROR_UNEXPECTED;
  }
  mozilla::ErrorResult result;
  RefPtr<Promise> promise = Promise::Create(global, result);
  if (result.Failed()) {
    return result.StealNSResult();
  }
  nsMainThreadPtrHandle<Promise> holder(
      new nsMainThreadPtrHolder<Promise>("AxioFrameSink::ApplyFrame", promise));
  RefPtr<SinkState> state = mState;
  nsresult rv = state->mRing->mQueue->Dispatch(NS_NewRunnableFunction(
      "AxioFrameSink::ApplyFrame",
      [state, holder, aSlot, aPayloadBytes, aWidth, aHeight, aX, aY, aW, aH] {
        bool ok =
            state->Apply(aSlot, aPayloadBytes, aWidth, aHeight, aX, aY, aW, aH);
        (void)NS_DispatchToMainThread(NS_NewRunnableFunction(
            "AxioFrameSink::ApplyFrame resolve", [holder, ok] {
              if (ok) {
                holder->MaybeResolveWithUndefined();
              } else {
                holder->MaybeRejectWithOperationError("MEMFD_FRAME_REJECTED"_ns);
              }
            }));
      }));
  if (NS_FAILED(rv)) {
    return rv;
  }
  promise.forget(aPromise);
  return NS_OK;
}

NS_IMETHODIMP
FrameSink::Present(uint64_t aFrameId) {
  MOZ_ASSERT(NS_IsMainThread());
  (void)aFrameId;  // presents follow applies in queue order
  if (mClosed || !mCanvas) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  RefPtr<SinkState> state = mState;
  state->mPendingPresents++;
  return state->mRing->mQueue->Dispatch(NS_NewRunnableFunction(
      "AxioFrameSink::Present", [state] { state->Present(); }));
}

NS_IMETHODIMP
FrameSink::GetWidth(uint32_t* aWidth) {
  MutexAutoLock lock(mState->mLock);
  *aWidth = mState->mValid ? mState->mWidth : 0;
  return NS_OK;
}

NS_IMETHODIMP
FrameSink::GetHeight(uint32_t* aHeight) {
  MutexAutoLock lock(mState->mLock);
  *aHeight = mState->mValid ? mState->mHeight : 0;
  return NS_OK;
}

NS_IMETHODIMP
FrameSink::CopyFrame(JSContext* aCx, JS::MutableHandle<JS::Value> aResult) {
  MOZ_ASSERT(NS_IsMainThread());
  aResult.setNull();
  MutexAutoLock lock(mState->mLock);
  if (!mState->mValid) {
    return NS_OK;
  }
  size_t bytes = mState->mFrame.size();
  JS::Rooted<JSObject*> buffer(aCx, JS::NewArrayBuffer(aCx, bytes));
  if (!buffer) {
    return NS_ERROR_OUT_OF_MEMORY;
  }
  {
    JS::AutoCheckCannotGC nogc;
    bool shared = false;
    uint8_t* data = JS::GetArrayBufferData(buffer, &shared, nogc);
    if (!data) {
      return NS_ERROR_FAILURE;
    }
    memcpy(data, mState->mFrame.data(), bytes);
  }
  aResult.setObject(*buffer);
  return NS_OK;
}

NS_IMETHODIMP
FrameSink::GetStatsJSON(nsACString& aStats) {
  const SinkState& s = *mState;
  aStats.Truncate();
  aStats.AppendPrintf(
      "{\"applied\":%llu,\"presented\":%llu,\"skipped\":%llu,\"failed\":%llu,"
      "\"applyMicros\":%llu,\"presentMicros\":%llu,\"sharedImages\":%llu,"
      "\"surfaceImages\":%llu,\"bound\":%s}",
      (unsigned long long)s.mApplied.load(),
      (unsigned long long)s.mPresented.load(),
      (unsigned long long)s.mSkipped.load(),
      (unsigned long long)s.mFailed.load(),
      (unsigned long long)s.mApplyMicros.load(),
      (unsigned long long)s.mPresentMicros.load(),
      (unsigned long long)s.mSharedImages.load(),
      (unsigned long long)s.mSurfaceImages.load(), mCanvas ? "true" : "false");
  return NS_OK;
}

NS_IMETHODIMP
FrameSink::Close() {
  MOZ_ASSERT(NS_IsMainThread());
  if (mClosed) {
    return NS_OK;
  }
  mClosed = true;
  Unbind();
  RefPtr<SinkState> state = mState;
  (void)state->mRing->mQueue->Dispatch(NS_NewRunnableFunction(
      "AxioFrameSink::Close", [state] {
        MutexAutoLock lock(state->mLock);
        state->mValid = false;
        std::vector<uint8_t>().swap(state->mFrame);
      }));
  return NS_OK;
}

}  // namespace axio
