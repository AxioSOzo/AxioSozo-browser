/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "AxioEngineSurfaceService.h"

#import <AppKit/AppKit.h>

#include "AxioEngineEndpoint.h"
#include "gfxPlatform.h"
#include "js/PropertyAndElement.h"
#include "jsapi.h"
#include "mozilla/ClearOnShutdown.h"
#include "mozilla/EventDispatcher.h"
#include "mozilla/MouseEvents.h"
#include "mozilla/Services.h"
#include "mozilla/StaticPtr.h"
#include "mozilla/TextEvents.h"
#include "mozilla/VsyncDispatcher.h"
#include "mozilla/dom/Document.h"
#include "mozilla/dom/DocumentInlines.h"
#include "mozilla/dom/Element.h"
#include "mozilla/dom/Event.h"
#include "mozilla/dom/ToJSValue.h"
#include "mozilla/dom/UserActivation.h"
#include "nsCocoaUtils.h"
#include "nsContentUtils.h"
#include "nsDOMCSSDeclaration.h"
#include "nsIObserverService.h"
#include "nsIWidget.h"
#include "nsPresContext.h"
#include "nsStyledElement.h"
#include "nsXULAppAPI.h"

using mozilla::ErrorResult;
using mozilla::TimeStamp;
using mozilla::UniquePtr;
using mozilla::WidgetEvent;
using mozilla::WidgetKeyboardEvent;
using mozilla::WidgetMouseEvent;
using mozilla::WidgetWheelEvent;
using mozilla::dom::Element;
using mozilla::dom::Event;

namespace axio {

// ---------------------------------------------------------------------------
// NSEvent side channel. A local monitor sees every scroll/magnify NSEvent
// before -[NSApplication sendEvent:] dispatches it to ChildView, records the
// native phase data, and returns the event untouched (no routing decision is
// made natively: Gecko's own hit test decides the target, which keeps Zen
// overlays, glance and dialogs above the engine view in input z-order too).
// DOM wheel events carry the same TimeStamp: ChildView and the APZ
// conversions (widget/InputData.cpp PanGestureInput/PinchGestureInput::
// ToWidgetEvent) copy nsCocoaUtils::GetEventTimeStamp([event timestamp]).

namespace {

struct NativeGestureSample {
  TimeStamp mTime;
  NSEventType mType = NSEventTypeScrollWheel;
  NSEventPhase mPhase = NSEventPhaseNone;
  NSEventPhase mMomentumPhase = NSEventPhaseNone;
  double mDeltaX = 0;
  double mDeltaY = 0;
  double mMagnification = 0;
  bool mPrecise = false;
  bool mInverted = false;
};

constexpr size_t kSampleCount = 128;
NativeGestureSample sSamples[kSampleCount];
size_t sNextSample = 0;

void RecordSample(NSEvent* aEvent) {
  NativeGestureSample& s = sSamples[sNextSample++ % kSampleCount];
  s.mTime = nsCocoaUtils::GetEventTimeStamp([aEvent timestamp]);
  s.mType = [aEvent type];
  s.mPhase = [aEvent phase];
  if (s.mType == NSEventTypeScrollWheel) {
    s.mMomentumPhase = [aEvent momentumPhase];
    s.mDeltaX = [aEvent scrollingDeltaX];
    s.mDeltaY = [aEvent scrollingDeltaY];
    s.mPrecise = [aEvent hasPreciseScrollingDeltas];
    s.mInverted = [aEvent isDirectionInvertedFromDevice];
    s.mMagnification = 0;
  } else {
    s.mMomentumPhase = NSEventPhaseNone;
    s.mDeltaX = s.mDeltaY = 0;
    s.mPrecise = true;
    s.mInverted = false;
    s.mMagnification = [aEvent magnification];
  }
}

const NativeGestureSample* FindSample(const TimeStamp& aTime) {
  if (aTime.IsNull()) {
    return nullptr;
  }
  for (size_t i = 0; i < kSampleCount; ++i) {
    const NativeGestureSample& s =
        sSamples[(sNextSample + kSampleCount - 1 - i) % kSampleCount];
    if (s.mTime == aTime) {
      return &s;
    }
  }
  return nullptr;
}

const char* PhaseName(NSEventPhase aPhase) {
  if (aPhase & NSEventPhaseMayBegin) return "mayBegin";
  if (aPhase & NSEventPhaseBegan) return "began";
  if (aPhase & NSEventPhaseChanged) return "changed";
  if (aPhase & NSEventPhaseStationary) return "stationary";
  if (aPhase & NSEventPhaseEnded) return "ended";
  if (aPhase & NSEventPhaseCancelled) return "cancelled";
  return "none";
}

// CSS keyword cursors only: a host can never make chrome fetch a url().
const char* const kAllowedCursors[] = {
    "auto",        "default",     "none",        "context-menu", "help",
    "pointer",     "progress",    "wait",        "cell",         "crosshair",
    "text",        "vertical-text", "alias",     "copy",         "move",
    "no-drop",     "not-allowed", "grab",        "grabbing",     "e-resize",
    "n-resize",    "ne-resize",   "nw-resize",   "s-resize",     "se-resize",
    "sw-resize",   "w-resize",    "ew-resize",   "ns-resize",    "nesw-resize",
    "nwse-resize", "col-resize",  "row-resize",  "all-scroll",   "zoom-in",
    "zoom-out",
};

constexpr uint32_t kMaxHeldKeys = 256;

class JSObjectBuilder {
 public:
  explicit JSObjectBuilder(JSContext* aCx)
      : mCx(aCx), mObj(aCx, JS_NewPlainObject(aCx)) {}
  bool Ok() const { return mOk && mObj; }
  JSObject* Get() { return mObj; }

  void Number(const char* aName, double aValue) {
    mOk = mOk && mObj &&
          JS_DefineProperty(mCx, mObj, aName, aValue, JSPROP_ENUMERATE);
  }
  void Bool(const char* aName, bool aValue) {
    JS::Rooted<JS::Value> v(mCx, JS::BooleanValue(aValue));
    mOk = mOk && mObj && JS_DefineProperty(mCx, mObj, aName, v, JSPROP_ENUMERATE);
  }
  void String(const char* aName, const nsAString& aValue) {
    JS::Rooted<JS::Value> v(mCx);
    mOk = mOk && mObj && mozilla::dom::ToJSValue(mCx, aValue, &v) &&
          JS_DefineProperty(mCx, mObj, aName, v, JSPROP_ENUMERATE);
  }
  void Ascii(const char* aName, const char* aValue) {
    String(aName, NS_ConvertASCIItoUTF16(aValue));
  }

 private:
  JSContext* mCx;
  JS::Rooted<JSObject*> mObj;
  bool mOk = true;
};

mozilla::StaticRefPtr<EngineSurfaceService> sService;

}  // namespace

// ---------------------------------------------------------------------------

NS_IMPL_ISUPPORTS(EngineSurfaceService, nsIAxioEngineSurfaceService,
                  nsIObserver)

EngineSurfaceService::EngineSurfaceService() = default;
EngineSurfaceService::~EngineSurfaceService() { MOZ_ASSERT(!mNativeMonitor); }

/* static */
already_AddRefed<EngineSurfaceService> EngineSurfaceService::GetSingleton() {
  MOZ_RELEASE_ASSERT(NS_IsMainThread());
  MOZ_RELEASE_ASSERT(XRE_IsParentProcess());
  if (!sService) {
    sService = new EngineSurfaceService();
    sService->Init();
    mozilla::ClearOnShutdown(&sService);
  }
  return do_AddRef(sService);
}

void EngineSurfaceService::Init() {
  if (nsCOMPtr<nsIObserverService> obs = mozilla::services::GetObserverService()) {
    obs->AddObserver(this, "xpcom-will-shutdown", false);
  }
  InstallNativeMonitor();
}

void EngineSurfaceService::InstallNativeMonitor() {
  if (mNativeMonitor) {
    return;
  }
  id monitor = [NSEvent
      addLocalMonitorForEventsMatchingMask:(NSEventMaskScrollWheel |
                                            NSEventMaskMagnify)
                                   handler:^NSEvent*(NSEvent* aEvent) {
                                     RecordSample(aEvent);
                                     return aEvent;
                                   }];
  mNativeMonitor = [monitor retain];
}

void EngineSurfaceService::RemoveNativeMonitor() {
  if (!mNativeMonitor) {
    return;
  }
  id monitor = static_cast<id>(mNativeMonitor);
  [NSEvent removeMonitor:monitor];
  [monitor release];
  mNativeMonitor = nullptr;
}

void EngineSurfaceService::Shutdown() {
  if (mShutdown) {
    return;
  }
  mShutdown = true;
  for (auto& endpoint : mEndpoints) {
    endpoint->Close();
  }
  mEndpoints.Clear();
  mHeldKeys.Clear();
  RemoveNativeMonitor();
  if (nsCOMPtr<nsIObserverService> obs = mozilla::services::GetObserverService()) {
    obs->RemoveObserver(this, "xpcom-will-shutdown");
  }
}

NS_IMETHODIMP
EngineSurfaceService::Observe(nsISupports*, const char* aTopic,
                              const char16_t*) {
  if (!strcmp(aTopic, "xpcom-will-shutdown")) {
    Shutdown();
  }
  return NS_OK;
}

NS_IMETHODIMP
EngineSurfaceService::GetDisplayRefreshRate(double* aRate) {
  MOZ_ASSERT(NS_IsMainThread());
  RefPtr<mozilla::VsyncDispatcher> vsync =
      gfxPlatform::GetPlatform()->GetGlobalVsyncDispatcher();
  double ms = vsync ? vsync->GetVsyncRate().ToMilliseconds() : 0;
  *aRate = ms > 0 ? 1000.0 / ms : 60.0;
  return NS_OK;
}

NS_IMETHODIMP
EngineSurfaceService::CreateEndpoint(bool aExternalBeginFrames,
                                     nsIAxioEngineEndpoint** aResult) {
  MOZ_ASSERT(NS_IsMainThread());
  if (mShutdown) {
    return NS_ERROR_NOT_AVAILABLE;
  }
  mEndpoints.RemoveElementsBy([](const RefPtr<EngineEndpoint>& aEndpoint) {
    uint32_t state = 0;
    aEndpoint->GetState(&state);
    return state == nsIAxioEngineEndpoint::STATE_CLOSED;
  });
  RefPtr<EngineEndpoint> endpoint;
  nsresult rv =
      EngineEndpoint::Create(aExternalBeginFrames, getter_AddRefs(endpoint));
  NS_ENSURE_SUCCESS(rv, rv);
  mEndpoints.AppendElement(endpoint);
  endpoint.forget(aResult);
  return NS_OK;
}

NS_IMETHODIMP
EngineSurfaceService::SetCursor(Element* aElement, const nsACString& aCursor) {
  MOZ_ASSERT(NS_IsMainThread());
  if (!aElement || !nsContentUtils::IsChromeDoc(aElement->OwnerDoc())) {
    return NS_ERROR_INVALID_ARG;
  }
  bool allowed = false;
  for (const char* name : kAllowedCursors) {
    allowed |= aCursor.EqualsASCII(name);
  }
  auto* styled = nsStyledElement::FromNode(aElement);
  if (!allowed || !styled) {
    return NS_ERROR_INVALID_ARG;
  }
  ErrorResult rv;
  styled->Style()->SetProperty("cursor"_ns, aCursor, ""_ns, nullptr, rv);
  return rv.StealNSResult();
}

NS_IMETHODIMP
EngineSurfaceService::DescribeNativeEvent(Event* aEvent, JSContext* aCx,
                                          JS::MutableHandle<JS::Value> aResult) {
  MOZ_ASSERT(NS_IsMainThread());
  aResult.setNull();
  if (!aEvent || !aEvent->IsTrusted()) {
    return NS_OK;
  }
  WidgetEvent* event = aEvent->WidgetEventPtr();
  JSObjectBuilder out(aCx);

  if (WidgetKeyboardEvent* key = event->AsKeyboardEvent()) {
    // mNativeKeyEvent is the NSEvent only while the event is dispatched.
    NSEvent* native = event->mFlags.mIsBeingDispatched
                          ? static_cast<NSEvent*>(key->mNativeKeyEvent)
                          : nil;
    if (!native) {
      return NS_OK;
    }
    NSEventType type = [native type];
    if (type != NSEventTypeKeyDown && type != NSEventTypeKeyUp &&
        type != NSEventTypeFlagsChanged) {
      return NS_OK;
    }
    out.Ascii("kind", "key");
    out.Number("keyCode", [native keyCode]);
    out.Number("modifierFlags", double([native modifierFlags]));
    if (type != NSEventTypeFlagsChanged) {
      nsAutoString characters, unmodified;
      nsCocoaUtils::GetStringForNSString([native characters], characters);
      nsCocoaUtils::GetStringForNSString([native charactersIgnoringModifiers],
                                         unmodified);
      out.String("characters", characters);
      out.String("charactersIgnoringModifiers", unmodified);
      out.Bool("isRepeat", [native isARepeat]);
    }
    out.Bool("isComposing", key->mIsComposing);
  } else if (WidgetWheelEvent* wheel = event->AsWheelEvent()) {
    out.Ascii("kind", "wheel");
    out.Bool("isMomentum", wheel->mIsMomentum);
    out.Bool("mayHaveMomentum", wheel->mMayHaveMomentum);
    if (const NativeGestureSample* s = FindSample(wheel->mTimeStamp)) {
      bool magnify = s->mType == NSEventTypeMagnify;
      out.Ascii("native", magnify ? "magnify" : "scroll");
      out.Ascii("phase", PhaseName(s->mPhase));
      out.Ascii("momentumPhase", PhaseName(s->mMomentumPhase));
      out.Number("scrollingDeltaX", s->mDeltaX);
      out.Number("scrollingDeltaY", s->mDeltaY);
      out.Bool("precise", s->mPrecise);
      out.Bool("inverted", s->mInverted);
      out.Number("magnification", s->mMagnification);
    }
  } else if (WidgetMouseEvent* mouse = event->AsMouseEvent()) {
    out.Ascii("kind", "mouse");
    out.Number("clickCount", mouse->mClickCount);
    out.Number("pressure", mouse->mPressure);
    out.Number("inputSource", mouse->mInputSource);
  } else {
    return NS_OK;
  }
  if (!out.Ok()) {
    return NS_ERROR_FAILURE;
  }
  aResult.setObject(*out.Get());
  return NS_OK;
}

NS_IMETHODIMP
EngineSurfaceService::HoldKeyEvent(Event* aEvent, uint32_t* aTicket) {
  MOZ_ASSERT(NS_IsMainThread());
  *aTicket = 0;
  WidgetKeyboardEvent* key =
      aEvent ? aEvent->WidgetEventPtr()->AsKeyboardEvent() : nullptr;
  if (!key || !aEvent->IsTrusted() ||
      (key->mMessage != mozilla::eKeyDown &&
       key->mMessage != mozilla::eKeyPress &&
       key->mMessage != mozilla::eKeyUp)) {
    return NS_ERROR_INVALID_ARG;
  }
  // Reserved shortcuts (RootWindowGlobalKeyListener marks them during the
  // default-group capture phase, dom/events/GlobalKeyListener.cpp) stay with
  // chrome, as for a remote Gecko tab. A reply we re-dispatched is never
  // offered to the engine twice.
  if (key->IsReservedByChrome() || key->IsHandledInRemoteProcess()) {
    return NS_OK;
  }
  auto copy = mozilla::MakeUnique<WidgetKeyboardEvent>(true, key->mMessage,
                                                       key->mWidget.get());
  copy->AssignKeyEventData(*key, false);
  copy->AssignCommands(*key);
  copy->mFlags.mIsSynthesizedForTests = key->mFlags.mIsSynthesizedForTests;

  uint32_t ticket = mNextTicket++;
  if (!mNextTicket) {
    mNextTicket = 1;
  }
  while (mHeldKeys.Count() >= kMaxHeldKeys) {
    mHeldKeys.Remove(mOldestTicket++);
  }
  mHeldKeys.InsertOrUpdate(ticket, std::move(copy));
  *aTicket = ticket;
  return NS_OK;
}

NS_IMETHODIMP
EngineSurfaceService::FinishKeyEvent(uint32_t aTicket, bool aConsumedByEngine,
                                     Element* aTarget) {
  MOZ_ASSERT(NS_IsMainThread());
  auto held = mHeldKeys.Extract(aTicket);
  if (!held) {
    return NS_ERROR_INVALID_ARG;
  }
  if (aConsumedByEngine) {
    return NS_OK;
  }
  if (!aTarget || !nsContentUtils::IsChromeDoc(aTarget->OwnerDoc())) {
    return NS_ERROR_DOM_SECURITY_ERR;
  }
  // Mirrors BrowserParent::RecvReplyKeyEvent (dom/ipc/BrowserParent.cpp).
  UniquePtr<WidgetKeyboardEvent> event = std::move(*held);
  event->MarkAsHandledInRemoteProcess();
  RefPtr<nsPresContext> presContext = aTarget->OwnerDoc()->GetPresContext();
  if (!presContext) {
    return NS_OK;
  }
  mozilla::dom::AutoHandlingUserInputStatePusher userInput(event->IsTrusted(),
                                                           event.get());
  nsEventStatus status = nsEventStatus_eIgnore;
  RefPtr<Element> target = aTarget;
  mozilla::EventDispatcher::Dispatch(target, presContext, event.get(), nullptr,
                                     &status);
  if (!event->DefaultPrevented() && !event->mFlags.mIsSynthesizedForTests) {
    // Native menu key equivalents (nsCocoaWindow::PostHandleKeyEvent looks
    // the NSEvent up by mUniqueId in ChildView's native key event map).
    if (nsCOMPtr<nsIWidget> widget = event->mWidget) {
      widget->PostHandleKeyEvent(event.get());
    }
  }
  return NS_OK;
}

}  // namespace axio
