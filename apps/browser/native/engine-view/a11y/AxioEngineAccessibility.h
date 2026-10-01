/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef mozilla_axio_AxioEngineAccessibility_h
#define mozilla_axio_AxioEngineAccessibility_h

// Plain C++ (included by the generated StaticComponents.cpp).

#include "mozilla/AlreadyAddRefed.h"
#include "mozilla/RefPtr.h"
#include "nsCOMPtr.h"
#include "nsIAxioEngineAccessibility.h"
#include "nsIObserver.h"
#include "nsTArray.h"

namespace mozilla::dom {
class Document;
class Element;
}  // namespace mozilla::dom
class nsIContent;

namespace axio {

/**
 * Parent-process singleton (components.conf: MAIN_PROCESS_ONLY). Owns one
 * native element table per attached engine view and answers the Gecko
 * accessible/mac hooks for those canvases. Main thread only.
 */
class EngineAccessibility final : public nsIAxioEngineAccessibility,
                                  public nsIObserver {
 public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSIAXIOENGINEACCESSIBILITY
  NS_DECL_NSIOBSERVER

  static already_AddRefed<EngineAccessibility> GetSingleton();

  // Gecko accessible/mac hooks (ids are Objective-C objects; void* keeps this
  // header plain C++).
  void* Children(void* aOwner, nsIContent* aContent);
  void* HitTest(void* aOwner, nsIContent* aContent, double aX, double aY);
  void* Focused(mozilla::dom::Document* aDocument);

  // From native elements.
  void RequestAction(uint64_t aTarget, uint32_t aNode, const char* aAction,
                     const nsAString& aValue);
  bool IsContentFocused(uint64_t aTarget) const;

 private:
  EngineAccessibility();
  ~EngineAccessibility();
  void Init();
  void Shutdown();

  struct View {
    uint64_t mTarget = 0;
    RefPtr<mozilla::dom::Element> mCanvas;
    void* mTable = nullptr;  // retained AxioEngineAXTable*
    bool mRequested = false;
  };
  View* Find(uint64_t aTarget);
  View* FindContent(nsIContent* aContent);
  void ReleaseView(View& aView);

  nsTArray<View> mViews;
  nsCOMPtr<nsIAxioEngineAccessibilityListener> mListener;
  bool mShutdown = false;
};

}  // namespace axio

#endif  // mozilla_axio_AxioEngineAccessibility_h
