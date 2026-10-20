/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_axio_AxioFrameReceiver_h
#define mozilla_axio_AxioFrameReceiver_h

// Plain C++ (included by the generated StaticComponents.cpp).

#include "mozilla/RefPtr.h"
#include "nsIAxioFrameReceiver.h"
#include "nsIWeakReferenceUtils.h"

class nsISerialEventTarget;

namespace axio {

struct RingState;
struct SinkState;

/** nsIAxioFrameReceiverService (components.conf: MAIN_PROCESS_ONLY). */
class FrameReceiverService final : public nsIAxioFrameReceiverService {
 public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIAXIOFRAMERECEIVERSERVICE

  FrameReceiverService() = default;

 private:
  ~FrameReceiverService() = default;
};

/** A mapped host frame ring and its task queue. Main thread only. */
class FrameRing final : public nsIAxioFrameRing {
 public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIAXIOFRAMERING

  explicit FrameRing(RingState* aState);

 private:
  ~FrameRing();
  RefPtr<RingState> mState;
};

/** One target's whole frame and canvas binding. Main thread only. */
class FrameSink final : public nsIAxioFrameSink {
 public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIAXIOFRAMESINK

  explicit FrameSink(RingState* aRing);

 private:
  ~FrameSink();
  void Unbind();

  RefPtr<SinkState> mState;
  nsWeakPtr mCanvas;
  bool mClosed = false;
};

}  // namespace axio

#endif  // mozilla_axio_AxioFrameReceiver_h
