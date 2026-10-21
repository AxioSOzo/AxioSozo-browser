// macOS WebKit engine host (EXPERIMENTAL; component evidence only, never Zen E1/E2).
// System WebKit (WKWebView) behind the same engine-neutral core (stream_core.hpp) as the
// Linux WPE host, speaking engine-stream-v1 (WebKit profile, `webkit_port:"wkwebview"`).
// See docs/adr/004-webkit-engine.md "macOS".
//
// Rendering: each target is a WKWebView in an offscreen, borderless helper window of this
// process that is never shown to the user (it is not the browser; Zen presents the
// pixels in its own content area). Frames are WKWebView snapshots
// (takeSnapshotWithConfiguration, public API) taken on a frame-rate clock or on Zen's
// BEGIN_FRAME ticks, converted once to BGRA and
//   - surface mode (hello `surface_service`): written into a host-owned global IOSurface
//     ring and handed to Zen over engine-surface-v1 Mach messages (surface_host.mm), or
//   - pipe fallback: sent as AXCF BGRA frames with one-outstanding credit.
// WebKit keeps its own process model and sandbox: WebContent, Networking and GPU run as
// Apple's sandboxed XPC services; this process is the UI process. Private WebKit SPI is
// used only where named in kPrivateSPI (reported in `ready`), behind respondsToSelector.
//
// usage: AxioWebKitMacHost --stream <private-profile-dir> <evidence-dir>
#include "../stream_core.hpp"
#include "surface_host.hpp"

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import <objc/message.h>

#include <dispatch/dispatch.h>
#include <mach/mach.h>
#include <mach/mach_time.h>
#include <atomic>
#include <csignal>
#include <map>

using namespace axio;
using namespace axio::stream;

namespace {
class MacView;
Host* currentHost = nullptr;
std::atomic<bool> pumpScheduled{false};
WKContentRuleList* ruleList = nil;
uint64_t nextNativeId = 1;
bool surfaceMode = false, externalBeginFrames = false;
int frameRate = 60;
std::map<uint64_t, MacView*> viewsById;  // native target id -> live view (surface callbacks)
uint64_t highestFrameSent = 0;           // RELEASE for a closed target is valid up to this id
// Private WebKit SPI this host may call (respondsToSelector-guarded; none touches the
// sandbox or process model). Measured need: docs/adr/004-webkit-engine.md "macOS".
NSArray<NSString*>* const kPrivateSPI = @[@"_setWindowOcclusionDetectionEnabled:", @"_setOverrideDeviceScaleFactor:"];
std::vector<std::string> usedSPI;
void noteSPI(const char* name) { if (std::find(usedSPI.begin(), usedSPI.end(), name) == usedSPI.end()) usedSPI.push_back(name); }

// Idle back-off: after this many identical snapshots in a row, poll slowly until
// something changes or input/navigation arrives (WKWebView has no damage callback).
constexpr int IdleAfterIdenticalFrames = 30;
constexpr double IdlePollSeconds = 0.25;
constexpr int MaxSnapshotsInFlight = 2;
uint64_t directFrames = 0, convertedFrames = 0;  // snapshot conversion paths (stderr summary at exit)
uint64_t ticks(double seconds) {
  static mach_timebase_info_data_t timebase = [] { mach_timebase_info_data_t t; mach_timebase_info(&t); return t; }();
  return uint64_t(seconds * 1e9) * timebase.denom / timebase.numer;
}
}  // namespace

@interface AXWebKitDelegate : NSObject <WKNavigationDelegate, WKUIDelegate>
@property(nonatomic, assign) MacView* owner;
@end

namespace {
constexpr uint32_t FlagShift = 1u << 1, FlagControl = 1u << 2, FlagAlt = 1u << 3, FlagCommand = 1u << 7;
NSEventModifierFlags appKitModifiers(uint32_t flags) {
  NSEventModifierFlags m = 0;
  if (flags & FlagShift) m |= NSEventModifierFlagShift;
  if (flags & FlagControl) m |= NSEventModifierFlagControl;
  if (flags & FlagAlt) m |= NSEventModifierFlagOption;
  if (flags & FlagCommand) m |= NSEventModifierFlagCommand;
  return m;
}
// AppKit's [NSEvent characters] for common non-text keys (as in chromium-host/input.inc).
unichar appKitCharacter(uint32_t code) {
  switch (code) {
    case 0x24: return 0x0D; case 0x30: return 0x09; case 0x31: return 0x20; case 0x33: return 0x7F; case 0x35: return 0x1B;
    case 0x7B: return NSLeftArrowFunctionKey; case 0x7C: return NSRightArrowFunctionKey;
    case 0x7D: return NSDownArrowFunctionKey; case 0x7E: return NSUpArrowFunctionKey;
    default: return 0;
  }
}
template <class T> void callSPI(id object, const char* name, T value) {
  SEL selector = sel_registerName(name);
  if (![object respondsToSelector:selector]) return;
  ((void (*)(id, SEL, T))objc_msgSend)(object, selector, value);
  noteSPI(name);
}

class MacView final : public EngineView {
public:
  MacView(Host& host, Tab& tab) : host_(host), tab_(tab), numericId_(nextNativeId++), id_(std::to_string(numericId_)) {}
  ~MacView() override { detach(); }
  bool create(int width, int height, double scale) {
    width_ = width; height_ = height; scale_ = scale;
    WKWebViewConfiguration* config = [WKWebViewConfiguration new];
    // Per-instance, in-memory data store: nothing shared with Safari, Gecko, CEF or another host.
    config.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
    config.preferences.javaScriptCanOpenWindowsAutomatically = NO;
    config.preferences.elementFullscreenEnabled = NO;
    config.mediaTypesRequiringUserActionForPlayback = WKAudiovisualMediaTypeAll;
    if (ruleList) [config.userContentController addContentRuleList:ruleList];
    window_ = [[NSWindow alloc] initWithContentRect:NSMakeRect(-30000, -30000, width, height)
                                          styleMask:NSWindowStyleMaskBorderless backing:NSBackingStoreBuffered defer:NO];
    window_.releasedWhenClosed = NO;
    window_.ignoresMouseEvents = YES;
    window_.excludedFromWindowsMenu = YES;
    web_ = [[WKWebView alloc] initWithFrame:NSMakeRect(0, 0, width, height) configuration:config];
    delegate_ = [AXWebKitDelegate new];
    delegate_.owner = this;
    web_.navigationDelegate = delegate_;
    web_.UIDelegate = delegate_;
    window_.contentView = web_;
    // The helper window is never on screen, which WebKit would treat as occluded and
    // throttle (no rAF, hidden visibilityState). Visibility is Zen's `visibility` command.
    // Measured (capture bench): an unordered window, or an ordered one without this SPI,
    // stays `hidden` with 0 Hz rAF; ordered off every display plus this SPI runs at 60 Hz.
    callSPI<BOOL>(web_, "_setWindowOcclusionDetectionEnabled:", NO);
    applyScale();
    [window_ orderFrontRegardless];  // still off every display at (-30000, -30000)
    for (NSString* key in @[@"title", @"URL", @"loading"]) [web_ addObserver:delegate_ forKeyPath:key options:0 context:nullptr];
    if (surfaceMode) ring_ = wksurface::createRing();
    viewsById[numericId_] = this;
    return true;
  }
  std::string nativeId() const override { return id_; }
  uint64_t numericId() const { return numericId_; }
  wksurface::Ring* ring() const { return ring_; }
  uint64_t beginFrameSequence() const { return appliedSequence_; }
  Tab& tab() { return tab_; }
  void load(const std::string& url) override {
    wake();
    [web_ loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url.c_str()]]]];
  }
  bool canGoBack() override { return web_.canGoBack; }
  bool canGoForward() override { return web_.canGoForward; }
  void goBack() override { wake(); [web_ goBack]; }
  void goForward() override { wake(); [web_ goForward]; }
  void reload() override { wake(); [web_ reload]; }
  void stop() override { [web_ stopLoading]; }
  void resize(int width, int height, double scale) override {
    width_ = width; height_ = height; scale_ = scale;
    // Scale first: the page's resize event must already see the new devicePixelRatio.
    applyScale();
    [window_ setContentSize:NSMakeSize(width, height)];
    web_.frame = NSMakeRect(0, 0, width, height);
    epoch_++;  // a snapshot in flight has the old size
    wake();
  }
  void setFocus(bool focused) override { [window_ makeFirstResponder:focused ? web_ : nil]; wake(); }
  void setVisible(bool visible) override { visible_ = visible; if (visible) wake(); }
  void setFrameRate(int) override {}
  void key(const KeyInput& key) override {
    wake();
    if (key.type == "char") {
      if (!downText_.empty() && key.text == downText_) { downText_.clear(); return; }
      downText_.clear();
      commitText(key.text);
      return;
    }
    NSString* text = [NSString stringWithUTF8String:key.text.c_str()];
    if (!text.length) { unichar c = appKitCharacter(key.nativeKeyCode); text = c ? [NSString stringWithCharacters:&c length:1] : @""; }
    NSEvent* event = [NSEvent keyEventWithType:key.type == "down" ? NSEventTypeKeyDown : NSEventTypeKeyUp location:NSZeroPoint
                                 modifierFlags:appKitModifiers(key.modifiers) timestamp:NSProcessInfo.processInfo.systemUptime
                                  windowNumber:window_.windowNumber context:nil characters:text charactersIgnoringModifiers:text
                                     isARepeat:NO keyCode:(unsigned short)key.nativeKeyCode];
    if (key.type == "down") {
      downText_ = (!key.text.empty() && !(key.modifiers & (FlagControl | FlagAlt | FlagCommand))) ? key.text : "";
      [web_ keyDown:event];
    } else [web_ keyUp:event];
  }
  void mouse(const MouseInput& mouse) override {
    wake();
    NSPoint point = NSMakePoint(mouse.x, height_ - mouse.y);  // window coordinates are bottom-up
    bool right = mouse.button == "right";
    NSEventType type = mouse.type == "move" ? (pressed_ ? NSEventTypeLeftMouseDragged : NSEventTypeMouseMoved)
                       : mouse.type == "down" ? (right ? NSEventTypeRightMouseDown : NSEventTypeLeftMouseDown)
                                              : (right ? NSEventTypeRightMouseUp : NSEventTypeLeftMouseUp);
    if (mouse.type == "down" && !right) pressed_ = true;
    if (mouse.type == "up" && !right) pressed_ = false;
    NSEvent* event = [NSEvent mouseEventWithType:type location:point modifierFlags:appKitModifiers(mouse.modifiers)
                                       timestamp:NSProcessInfo.processInfo.systemUptime windowNumber:window_.windowNumber
                                         context:nil eventNumber:0 clickCount:mouse.clickCount pressure:mouse.type == "down" ? 1 : 0];
    switch (type) {
      case NSEventTypeLeftMouseDown: [web_ mouseDown:event]; break;
      case NSEventTypeLeftMouseUp: [web_ mouseUp:event]; break;
      case NSEventTypeRightMouseDown: [web_ rightMouseDown:event]; break;
      case NSEventTypeRightMouseUp: [web_ rightMouseUp:event]; break;
      case NSEventTypeLeftMouseDragged: [web_ mouseDragged:event]; break;
      default: [web_ mouseMoved:event]; break;
    }
  }
  void wheel(const WheelInput& wheel) override {
    wake();
    CGEventRef cg = CGEventCreateScrollWheelEvent(nullptr, kCGScrollEventUnitPixel, 2, int32_t(wheel.deltaY), int32_t(wheel.deltaX));
    NSPoint origin = window_.frame.origin;
    CGEventSetLocation(cg, CGPointMake(origin.x + wheel.x, NSScreen.screens.firstObject.frame.size.height - (origin.y + height_ - wheel.y)));
    NSEvent* event = [NSEvent eventWithCGEvent:cg];
    CFRelease(cg);
    [web_ scrollWheel:event];
  }
  void commitText(const std::string& text) override {
    wake();
    // WKWebView is the NSTextInputClient an input method commits into.
    [(id<NSTextInputClient>)web_ insertText:[NSString stringWithUTF8String:text.c_str()] replacementRange:NSMakeRange(NSNotFound, 0)];
  }
  bool edit(const std::string& action) override {
    wake();
    SEL selector = action == "copy" ? @selector(copy:) : action == "cut" ? @selector(cut:) : action == "paste" ? @selector(paste:)
                   : action == "select_all" ? @selector(selectAll:) : action == "undo" ? NSSelectorFromString(@"undo:") : NSSelectorFromString(@"redo:");
    return [NSApp sendAction:selector to:web_ from:web_];
  }
  void close() override { detach(); host_.viewClosed(&tab_); }

  // ---- Frame clock ---------------------------------------------------------------
  // Internal pacing: called at frame_rate. External pacing: called per BEGIN_FRAME.
  void tick(uint64_t sequence = 0) {
    if (detached_ || !visible_) return;
    if (sequence) pendingSequence_ = sequence;
    if (idle_ && !sequence && mach_absolute_time() < nextIdlePoll_) return;
    capture();
  }
  // BEGIN_FRAME sequences must strictly increase per target (engine-surface-v1).
  bool acceptBeginFrame(uint64_t sequence) {
    if (sequence <= lastSequence_) return false;
    lastSequence_ = sequence;
    tick(sequence);
    return true;
  }

  // Delegate entry points.
  void observed(NSString* key) {
    if ([key isEqual:@"title"]) host_.titleChanged(&tab_, web_.title.UTF8String ?: "");
    else if ([key isEqual:@"URL"]) host_.urlChanged(&tab_, web_.URL.absoluteString.UTF8String ?: "");
    else host_.loadingChanged(&tab_, web_.loading);
    wake();
  }
  bool policy(WKNavigationAction* action) {
    if (!action.targetFrame) { host_.denied(&tab_, "popup_denied"); return false; }
    if (!action.targetFrame.isMainFrame) return host_.allowedURL(action.request.URL.absoluteString.UTF8String ?: "", true);
    return host_.navigationPolicy(&tab_, action.request.URL.absoluteString.UTF8String ?: "", action.request.HTTPMethod.UTF8String ?: "GET");
  }
  void response(WKNavigationResponse* response) {
    if (response.forMainFrame) status_ = [response.response isKindOfClass:NSHTTPURLResponse.class] ? int(((NSHTTPURLResponse*)response.response).statusCode) : 0;
  }
  void committed() { epoch_++; pendingStatus_ = status_; host_.loadCommitted(&tab_, web_.URL.absoluteString.UTF8String ?: ""); }
  void finished() {
    // Snapshots requested before this point may show the previous document: never use them.
    epoch_++; freshAfterCommit_ = true;
    host_.loadFinished(&tab_, web_.URL.absoluteString.UTF8String ?: "", pendingStatus_);
    wake();
  }
  void failed(NSError* error) {
    bool cancelled = [error.domain isEqual:NSURLErrorDomain] && error.code == NSURLErrorCancelled;
    bool tls = [error.domain isEqual:NSURLErrorDomain] && error.code <= NSURLErrorSecureConnectionFailed && error.code >= NSURLErrorClientCertificateRequired;
    host_.loadFailed(&tab_, int(error.code), cancelled, tls);
  }
  void terminated() { host_.processTerminated(&tab_, 0); }
  void denied(const char* code) { host_.denied(&tab_, code); }

private:
  Host& host_;
  Tab& tab_;
  uint64_t numericId_;
  std::string id_, downText_;
  WKWebView* web_ = nil;
  NSWindow* window_ = nil;
  AXWebKitDelegate* delegate_ = nil;
  wksurface::Ring* ring_ = nullptr;
  int width_ = 900, height_ = 650, status_ = 0, pendingStatus_ = 0; double scale_ = 2;
  bool visible_ = true, pressed_ = false, detached_ = false, idle_ = false, freshAfterCommit_ = false, missedTick_ = false;
  uint64_t epoch_ = 0, lastSequence_ = 0, pendingSequence_ = 0, appliedSequence_ = 0, nextIdlePoll_ = 0, requested_ = 0, delivered_ = 0;
  int identical_ = 0, inFlight_ = 0;
  std::vector<uint8_t> pixels_, previous_;

  void applyScale() {
    // The page's devicePixelRatio must be the requested scale, not the (unknown,
    // offscreen) window's backing scale; frames are then 1:1 physical pixels.
    // Always set (also back to 1x): once overridden, the backing scale no longer applies.
    callSPI<CGFloat>(web_, "_setOverrideDeviceScaleFactor:", CGFloat(scale_));
  }
  void wake() { idle_ = false; identical_ = 0; }
  void detach() {
    if (detached_) return;
    detached_ = true;
    viewsById.erase(numericId_);
    for (NSString* key in @[@"title", @"URL", @"loading"]) [web_ removeObserver:delegate_ forKeyPath:key];
    delegate_.owner = nullptr;
    web_.navigationDelegate = nil; web_.UIDelegate = nil;
    [web_ stopLoading];
    [web_ removeFromSuperview];
    [window_ close];
    web_ = nil; window_ = nil;
    if (ring_) { wksurface::destroyRing(ring_); ring_ = nullptr; }
  }
  // Up to two snapshots in flight per view (a 2x snapshot takes about one frame interval,
  // capture bench run 39342162006); a tick that finds both busy is remembered and served
  // when one completes, so pacing does not halve. Results are delivered in request order.
  void capture() {
    if (inFlight_ >= MaxSnapshotsInFlight) { missedTick_ = true; return; }
    inFlight_++;
    missedTick_ = false;
    WKSnapshotConfiguration* config = [WKSnapshotConfiguration new];
    config.snapshotWidth = @(width_);
    // The first frame of a new document waits for WebKit's next presentation update.
    config.afterScreenUpdates = freshAfterCommit_;
    freshAfterCommit_ = false;
    MacView* self = this; std::string key = tab_.key;
    uint64_t epoch = epoch_, sequence = pendingSequence_, serial = ++requested_;
    int w = int(std::ceil(width_ * scale_)), h = int(std::ceil(height_ * scale_));
    [web_ takeSnapshotWithConfiguration:config completionHandler:^(NSImage* image, NSError*) {
      if (!currentHost || currentHost->tabByKey(key) != &self->tab_ || self->detached_) return;
      self->inFlight_--;
      // Navigation, resize or scale change while in flight, or a newer snapshot already shown.
      bool current = epoch == self->epoch_ && serial > self->delivered_;
      CGImageRef cg = current && image ? [image CGImageForProposedRect:nullptr context:nil hints:nil] : nullptr;
      if (cg && self->convert(cg, w, h)) {
        self->delivered_ = serial;
        bool same = self->previous_.size() == self->pixels_.size() && !memcmp(self->previous_.data(), self->pixels_.data(), self->pixels_.size());
        if (same) {
          if (++self->identical_ >= IdleAfterIdenticalFrames) self->idle_ = true;
          if (self->idle_) self->nextIdlePoll_ = mach_absolute_time() + ticks(IdlePollSeconds);
        } else self->wake();
        self->previous_.swap(self->pixels_);
        self->appliedSequence_ = sequence;
        // The core computes damage, drops identical frames and applies generations.
        currentHost->frame(&self->tab_, self->previous_.data(), w, h, size_t(w) * 4, PixelFormat::BGRA8Premultiplied);
      }
      if (self->missedTick_ && !self->detached_ && self->visible_) self->capture();
    }];
  }
  // Snapshot -> tight sRGB BGRA8 premultiplied at exactly w x h. When WebKit already
  // produced that format (sRGB, 32 bpp, premultiplied-first, little-endian, same size)
  // the rows are copied; otherwise Core Graphics converts and resamples.
  bool convert(CGImageRef cg, int w, int h) {
    pixels_.resize(size_t(w) * size_t(h) * 4);
    CGColorSpaceRef imageSpace = CGImageGetColorSpace(cg);
    CFStringRef name = imageSpace ? CGColorSpaceCopyName(imageSpace) : nullptr;
    bool srgb = name && CFEqual(name, kCGColorSpaceSRGB);
    if (name) CFRelease(name);
    CGBitmapInfo info = CGImageGetBitmapInfo(cg);
    CGImageAlphaInfo alpha = CGImageGetAlphaInfo(cg);
    bool direct = srgb && int(CGImageGetWidth(cg)) == w && int(CGImageGetHeight(cg)) == h && CGImageGetBitsPerPixel(cg) == 32
                  && CGImageGetBitsPerComponent(cg) == 8 && (info & kCGBitmapByteOrderMask) == kCGBitmapByteOrder32Little
                  && (alpha == kCGImageAlphaPremultipliedFirst || alpha == kCGImageAlphaNoneSkipFirst);
    if (direct) {
      CFDataRef data = CGDataProviderCopyData(CGImageGetDataProvider(cg));
      size_t stride = CGImageGetBytesPerRow(cg), row = size_t(w) * 4;
      if (data && size_t(CFDataGetLength(data)) >= stride * size_t(h - 1) + row) {
        const uint8_t* bytes = CFDataGetBytePtr(data);
        for (int y = 0; y < h; ++y) memcpy(pixels_.data() + row * size_t(y), bytes + stride * size_t(y), row);
        if (alpha == kCGImageAlphaNoneSkipFirst) for (size_t i = 3; i < pixels_.size(); i += 4) pixels_[i] = 0xFF;
        CFRelease(data);
        directFrames++;
        return true;
      }
      if (data) CFRelease(data);
    }
    std::fill(pixels_.begin(), pixels_.end(), 0);
    CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
    CGContextRef context = CGBitmapContextCreate(pixels_.data(), size_t(w), size_t(h), 8, size_t(w) * 4, space,
                                                 uint32_t(kCGImageAlphaPremultipliedFirst) | uint32_t(kCGBitmapByteOrder32Little));
    CGColorSpaceRelease(space);
    if (!context) return false;
    CGContextSetInterpolationQuality(context, kCGInterpolationHigh);
    CGContextDrawImage(context, CGRectMake(0, 0, w, h), cg);
    CGContextRelease(context);
    convertedFrames++;
    return true;
  }
};

// engine-surface-v1 frames out of the core (surface mode only).
class MacSurfaceSink final : public SurfaceSink {
public:
  SurfaceResult present(Tab& tab, const SurfaceFrame& frame) override {
    auto* view = static_cast<MacView*>(tab.view.get());
    if (!view || !view->ring()) return SurfaceResult::Failed;
    wksurface::FrameMeta meta;
    meta.target = frame.nativeTargetId; meta.documentGeneration = frame.documentGeneration;
    meta.navigationGeneration = frame.navigationGeneration; meta.frameId = frame.frameId;
    meta.beginFrameSequence = externalBeginFrames ? view->beginFrameSequence() : 0;
    meta.logicalWidth = uint32_t(frame.logicalWidth); meta.logicalHeight = uint32_t(frame.logicalHeight); meta.scale = frame.scale;
    meta.dirty = {frame.damage.x, frame.damage.y, frame.damage.width, frame.damage.height};
    switch (wksurface::present(view->ring(), frame.pixels, frame.width, frame.height, meta)) {
      case wksurface::Result::Sent: highestFrameSent = std::max(highestFrameSent, frame.frameId); return SurfaceResult::Sent;
      case wksurface::Result::NoFreeSlot: return SurfaceResult::NoFreeSlot;
      default: return SurfaceResult::Failed;
    }
  }
};

class MacEngine final : public Engine {
public:
  void setHost(Host& host) { host_ = &host; }
  bool surfaceSupported() override { return true; }
  std::unique_ptr<EngineView> createView(Tab& tab, int width, int height, double scale, int) override {
    auto view = std::make_unique<MacView>(*host_, tab);
    if (!view->create(width, height, scale)) return nullptr;
    return view;
  }
  Object readyFields() override {
    NSString* version = [NSBundle bundleForClass:WKWebView.class].infoDictionary[@"CFBundleVersion"] ?: @"unknown";
    NSOperatingSystemVersion os = NSProcessInfo.processInfo.operatingSystemVersion;
    char platform[64]; snprintf(platform, sizeof platform, "macos-%ld.%ld-arm64", long(os.majorVersion), long(os.minorVersion));
    json::Array spi;
    for (NSString* name in kPrivateSPI) spi.push_back(Value(std::string(name.UTF8String)));
    return Object{{"engine", "webkit"}, {"webkit_port", "wkwebview"}, {"webkit", version.UTF8String}, {"runtime_webkit", version.UTF8String},
                  {"platform", platform}, {"sandbox_configured", true}, {"sandbox", "macos-webkit-xpc"},
                  {"process_model", "multi-process"}, {"capture", "wkwebview-snapshot"}, {"private_spi", Value(std::move(spi))},
                  {"render_path", surfaceMode ? "wkwebview-snapshot-iosurface" : "wkwebview-snapshot-bgra"}};
  }
  // No cursor source (WKWebView sets NSCursor itself); wheel phases are dropped.
  Object capabilities() override { return Object{{"wheel_phases", false}, {"cursor", false}}; }
  std::string engineName() override { return "webkit"; }
private:
  Host* host_ = nullptr;
};

bool hexToken(const std::string& text, uint8_t (&out)[AXIO_SURFACE_TOKEN_BYTES]) {
  if (text.size() != AXIO_SURFACE_TOKEN_BYTES * 2) return false;
  auto nibble = [](char c) { return c >= '0' && c <= '9' ? c - '0' : c >= 'a' && c <= 'f' ? c - 'a' + 10 : c >= 'A' && c <= 'F' ? c - 'A' + 10 : -1; };
  for (size_t i = 0; i < AXIO_SURFACE_TOKEN_BYTES; ++i) {
    int hi = nibble(text[2 * i]), lo = nibble(text[2 * i + 1]);
    if (hi < 0 || lo < 0) return false;
    out[i] = uint8_t(hi << 4 | lo);
  }
  return true;
}

// Bounded exit (engine-surface-v1 "Host death and bounded exit"): once the host decides to
// end, it is gone within 25 s (requested shutdown) or 5 s (anything else).
std::atomic<bool> watchdogArmed{false};
void armWatchdog(int seconds, int code) {
  if (watchdogArmed.exchange(true)) return;
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, int64_t(seconds) * NSEC_PER_SEC),
                 dispatch_get_global_queue(QOS_CLASS_USER_INTERACTIVE, 0), ^{ _exit(code); });
}
}  // namespace

@implementation AXWebKitDelegate
- (void)observeValueForKeyPath:(NSString*)key ofObject:(id)object change:(NSDictionary*)change context:(void*)context {
  if (_owner) _owner->observed(key);
}
- (void)webView:(WKWebView*)webView decidePolicyForNavigationAction:(WKNavigationAction*)action decisionHandler:(void (^)(WKNavigationActionPolicy))handler {
  handler(_owner && _owner->policy(action) ? WKNavigationActionPolicyAllow : WKNavigationActionPolicyCancel);
}
- (void)webView:(WKWebView*)webView decidePolicyForNavigationResponse:(WKNavigationResponse*)response decisionHandler:(void (^)(WKNavigationResponsePolicy))handler {
  if (_owner) _owner->response(response);
  if (!response.canShowMIMEType) { if (_owner) _owner->denied("download_denied"); handler(WKNavigationResponsePolicyCancel); return; }
  handler(WKNavigationResponsePolicyAllow);
}
- (void)webView:(WKWebView*)webView navigationAction:(WKNavigationAction*)action didBecomeDownload:(WKDownload*)download {
  if (_owner) _owner->denied("download_denied");
  [download cancel:nil];
}
- (void)webView:(WKWebView*)webView navigationResponse:(WKNavigationResponse*)response didBecomeDownload:(WKDownload*)download {
  if (_owner) _owner->denied("download_denied");
  [download cancel:nil];
}
- (void)webView:(WKWebView*)webView didCommitNavigation:(WKNavigation*)navigation { if (_owner) _owner->committed(); }
- (void)webView:(WKWebView*)webView didFinishNavigation:(WKNavigation*)navigation { if (_owner) _owner->finished(); }
- (void)webView:(WKWebView*)webView didFailNavigation:(WKNavigation*)navigation withError:(NSError*)error { if (_owner) _owner->failed(error); }
- (void)webView:(WKWebView*)webView didFailProvisionalNavigation:(WKNavigation*)navigation withError:(NSError*)error { if (_owner) _owner->failed(error); }
- (void)webViewWebContentProcessDidTerminate:(WKWebView*)webView { if (_owner) _owner->terminated(); }
- (void)webView:(WKWebView*)webView didReceiveAuthenticationChallenge:(NSURLAuthenticationChallenge*)challenge
  completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential*))handler {
  // Server trust keeps the system's evaluation (fails closed); credentials are never supplied.
  if ([challenge.protectionSpace.authenticationMethod isEqual:NSURLAuthenticationMethodServerTrust]) handler(NSURLSessionAuthChallengePerformDefaultHandling, nil);
  else { if (_owner) _owner->denied("http_auth_unavailable"); handler(NSURLSessionAuthChallengeCancelAuthenticationChallenge, nil); }
}
- (WKWebView*)webView:(WKWebView*)webView createWebViewWithConfiguration:(WKWebViewConfiguration*)configuration
  forNavigationAction:(WKNavigationAction*)action windowFeatures:(WKWindowFeatures*)features {
  if (_owner) _owner->denied("popup_denied");
  return nil;
}
- (void)webView:(WKWebView*)webView runJavaScriptAlertPanelWithMessage:(NSString*)message initiatedByFrame:(WKFrameInfo*)frame completionHandler:(void (^)(void))handler {
  if (_owner) _owner->denied("javascript_dialog_unavailable");
  handler();
}
- (void)webView:(WKWebView*)webView runJavaScriptConfirmPanelWithMessage:(NSString*)message initiatedByFrame:(WKFrameInfo*)frame completionHandler:(void (^)(BOOL))handler {
  if (_owner) _owner->denied("javascript_dialog_unavailable");
  handler(NO);
}
- (void)webView:(WKWebView*)webView runJavaScriptTextInputPanelWithPrompt:(NSString*)prompt defaultText:(NSString*)text
  initiatedByFrame:(WKFrameInfo*)frame completionHandler:(void (^)(NSString*))handler {
  if (_owner) _owner->denied("javascript_dialog_unavailable");
  handler(nil);
}
- (void)webView:(WKWebView*)webView requestMediaCapturePermissionForOrigin:(WKSecurityOrigin*)origin initiatedByFrame:(WKFrameInfo*)frame
           type:(WKMediaCaptureType)type decisionHandler:(void (^)(WKPermissionDecision))handler {
  if (_owner) _owner->denied("permission_denied");
  handler(WKPermissionDecisionDeny);
}
- (void)webView:(WKWebView*)webView runOpenPanelWithParameters:(WKOpenPanelParameters*)parameters initiatedByFrame:(WKFrameInfo*)frame
  completionHandler:(void (^)(NSArray<NSURL*>*))handler {
  if (_owner) _owner->denied("file_dialog_unavailable");
  handler(nil);
}
@end

int main(int argc, char** argv) {
  @autoreleasepool {
    if (argc != 4 || std::string(argv[1]) != "--stream") { fprintf(stderr, "usage: AxioWebKitMacHost --stream profile evidence\n"); return 64; }
    signal(SIGPIPE, SIG_IGN);
    // A parent's crash handler must not park a faulting host (engine-surface-v1); WebKit's
    // XPC services are launched by launchd and do not inherit these ports anyway.
    task_set_exception_ports(mach_task_self(), EXC_MASK_ALL, MACH_PORT_NULL, EXCEPTION_DEFAULT, THREAD_STATE_NONE);
    Transport transport;
    if (!transport.start([] {
          if (pumpScheduled.exchange(true)) return;
          dispatch_async(dispatch_get_main_queue(), ^{ pumpScheduled = false; if (currentHost) currentHost->pump(); });
        })) return 64;
    MacEngine engine;
    Host core(transport, engine);
    engine.setHost(core);
    Host* hostPointer = &core;
    if (!hostPointer->handshake(std::chrono::seconds(10))) return 64;
    frameRate = hostPointer->frameRate();
    MacSurfaceSink sink;
    if (hostPointer->surfaceRequested()) {
      // Before WebKit starts: no CONNECTED from the spawning process = exit 64, no reconnect.
      uint8_t token[AXIO_SURFACE_TOKEN_BYTES];
      std::string error, text = hostPointer->takeSurfaceToken();
      bool ok = hexToken(text, token) && wksurface::connect(hostPointer->surfaceService(), token, 5000, error);
      memset(token, 0, sizeof token); std::fill(text.begin(), text.end(), '0');
      if (!ok) { fprintf(stderr, "AXIO_WEBKIT surface: %s\n", error.c_str()); return 64; }
      surfaceMode = true; externalBeginFrames = hostPointer->externalBeginFrames();
      hostPointer->setSurfaceSink(&sink);
      wksurface::start({
        [hostPointer](uint64_t target, uint64_t sequence) {
          if (!externalBeginFrames) { hostPointer->surfaceFailed("surface_unexpected_begin_frame"); return; }
          auto found = viewsById.find(target);
          if (found == viewsById.end()) return;  // unknown or closed target: ignored
          if (!found->second->acceptBeginFrame(sequence)) hostPointer->surfaceFailed("surface_begin_frame_not_increasing");
        },
        [hostPointer](uint64_t target, uint64_t frame) {
          auto found = viewsById.find(target);
          if (found == viewsById.end()) return frame <= highestFrameSent;  // already-closed target
          if (!wksurface::release(found->second->ring(), frame)) return false;
          hostPointer->surfaceSlotFreed(&found->second->tab());
          return true;
        },
        [hostPointer](const char* reason) { hostPointer->surfaceFailed(reason); },
      });
    }
    [NSApplication sharedApplication];
    // Accessory: no Dock icon, menu bar or app-switcher entry, but windows may be ordered
    // (Prohibited cannot order the helper windows WebKit needs to stay unthrottled).
    [NSApp setActivationPolicy:NSApplicationActivationPolicyAccessory];
    [NSApp finishLaunching];
    // The same origin-only content blocker as the WPE host.
    std::string origin = hostPointer->fixtureOrigin(), escaped;
    for (char c : origin) { if (c == '.') escaped += "\\\\."; else escaped += c; }
    std::string rules = "[{\"trigger\":{\"url-filter\":\".*\"},\"action\":{\"type\":\"block\"}},"
                        "{\"trigger\":{\"url-filter\":\"^" + escaped + "/\"},\"action\":{\"type\":\"ignore-previous-rules\"}}]";
    __block bool compiled = false;
    // Stored inside this instance's private profile, never in the user's WebKit data.
    NSURL* store = [NSURL fileURLWithPath:[NSString stringWithUTF8String:(std::string(argv[2]) + "/webkit-content-rules").c_str()] isDirectory:YES];
    [[NSFileManager defaultManager] createDirectoryAtURL:store withIntermediateDirectories:YES attributes:@{NSFilePosixPermissions: @0700} error:nil];
    WKContentRuleListStore* rulesStore = [WKContentRuleListStore storeWithURL:store];
    [rulesStore compileContentRuleListForIdentifier:@"axiosozo-fixture-origin"
        encodedContentRuleList:[NSString stringWithUTF8String:rules.c_str()] completionHandler:^(WKContentRuleList* list, NSError* error) {
          ruleList = list; compiled = true;
          if (error) fprintf(stderr, "AXIO_WEBKIT content rules: %s\n", error.localizedDescription.UTF8String);
        }];
    NSDate* deadline = [NSDate dateWithTimeIntervalSinceNow:20];
    while (!compiled && [deadline timeIntervalSinceNow] > 0) [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
    if (!ruleList) return 70;  // fail closed
    currentHost = hostPointer;

    // SIGTERM and parent death end the host like pipe EOF (bounded).
    signal(SIGTERM, SIG_IGN);
    dispatch_source_t term = dispatch_source_create(DISPATCH_SOURCE_TYPE_SIGNAL, SIGTERM, 0, dispatch_get_main_queue());
    dispatch_source_set_event_handler(term, ^{ hostPointer->beginClosing(); });
    dispatch_resume(term);
    pid_t parent = getppid();
    dispatch_source_t parentDeath = dispatch_source_create(DISPATCH_SOURCE_TYPE_PROC, uintptr_t(parent), DISPATCH_PROC_EXIT, dispatch_get_main_queue());
    dispatch_source_set_event_handler(parentDeath, ^{ hostPointer->beginClosing(); armWatchdog(5, 77); });
    dispatch_resume(parentDeath);
    if (getppid() != parent) { hostPointer->beginClosing(); armWatchdog(5, 77); }

    hostPointer->ready();
    // Internal pacing: one capture tick per frame interval for every visible target.
    dispatch_source_t clock = dispatch_source_create(DISPATCH_SOURCE_TYPE_TIMER, 0, 0, dispatch_get_main_queue());
    uint64_t interval = NSEC_PER_SEC / uint64_t(frameRate);
    dispatch_source_set_timer(clock, dispatch_time(DISPATCH_TIME_NOW, int64_t(interval)), interval, interval / 10);
    dispatch_source_set_event_handler(clock, ^{
      if (externalBeginFrames || hostPointer->closing()) return;
      std::vector<MacView*> views;
      for (auto& item : viewsById) views.push_back(item.second);
      for (MacView* view : views) view->tick();
    });
    dispatch_resume(clock);
    while (!hostPointer->tick()) {
      @autoreleasepool {
        NSEvent* event = [NSApp nextEventMatchingMask:NSEventMaskAny untilDate:[NSDate dateWithTimeIntervalSinceNow:0.005] inMode:NSDefaultRunLoopMode dequeue:YES];
        if (event) [NSApp sendEvent:event];
      }
      if (hostPointer->closing()) armWatchdog(5, 76);
    }
    dispatch_source_cancel(clock);
    hostPointer->tick();
    // Let WebKit tear down its XPC connections (WebContent/Networking/GPU exit with them).
    NSDate* drain = [NSDate dateWithTimeIntervalSinceNow:0.3];
    while ([drain timeIntervalSinceNow] > 0) [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.02]];
    int code = hostPointer->finish();
    fprintf(stderr, "AXIO_WEBKIT capture: direct_frames=%llu converted_frames=%llu\n", (unsigned long long)directFrames, (unsigned long long)convertedFrames);
    if (surfaceMode) wksurface::shutdown();
    currentHost = nullptr;
    return code;
  }
}
