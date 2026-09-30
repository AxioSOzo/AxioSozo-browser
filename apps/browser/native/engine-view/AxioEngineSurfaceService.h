/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_axio_AxioEngineSurfaceService_h
#define mozilla_axio_AxioEngineSurfaceService_h

// Plain C++ (included by the generated StaticComponents.cpp).

#include "mozilla/AlreadyAddRefed.h"
#include "mozilla/UniquePtr.h"
#include "nsIAxioEngineSurfaceService.h"
#include "nsIObserver.h"
#include "nsTArray.h"
#include "nsTHashMap.h"

namespace mozilla {
class WidgetKeyboardEvent;
}  // namespace mozilla

namespace axio {

class EngineEndpoint;

/**
 * Parent-process singleton (components.conf: MAIN_PROCESS_ONLY). Creates
 * engine endpoints, owns the NSEvent side channel that keeps native scroll
 * and pinch phases, and implements the remote-tab style key reply for
 * engine views. Main thread only.
 */
class EngineSurfaceService final : public nsIAxioEngineSurfaceService,
                                   public nsIObserver {
 public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIAXIOENGINESURFACESERVICE
  NS_DECL_NSIOBSERVER

  static already_AddRefed<EngineSurfaceService> GetSingleton();

 private:
  EngineSurfaceService();
  ~EngineSurfaceService();

  void Init();
  void Shutdown();
  void InstallNativeMonitor();
  void RemoveNativeMonitor();

  nsTArray<RefPtr<EngineEndpoint>> mEndpoints;
  nsTHashMap<uint32_t, mozilla::UniquePtr<mozilla::WidgetKeyboardEvent>>
      mHeldKeys;
  uint32_t mNextTicket = 1;
  uint32_t mOldestTicket = 1;
  void* mNativeMonitor = nullptr;  // retained NSEvent local monitor
  bool mShutdown = false;
};

}  // namespace axio

#endif  // mozilla_axio_AxioEngineSurfaceService_h
