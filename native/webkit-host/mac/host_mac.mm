// SCAFFOLD (EXPERIMENTAL / NOT_VERIFIED as a product path). macOS WebKit host behind the
// same engine-neutral core (stream_core.hpp) as the Linux WPE host. See
// docs/adr/004-webkit-engine.md "macOS plan".
//
// This scaffold renders a WKWebView in an offscreen, never-shown, borderless window of
// this helper process and delivers CPU snapshots (takeSnapshotWithConfiguration) as AXCF
// BGRA frames. That is a stepping stone only: the target design hands IOSurfaces to Zen
// over engine-surface-v1 (Mach), and the window is an implementation detail that is
// never ordered on screen nor presented to the user. Page devicePixelRatio follows the
// display the window would be on; frames are resampled to the requested physical size.
//
// usage: AxioWebKitMacHost --stream <private-profile-dir> <evidence-dir>
#include "../stream_core.hpp"

#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>

#include <atomic>
#include <csignal>

using namespace axio;
using namespace axio::stream;

namespace { class MacView; Host* currentHost = nullptr; std::atomic<bool> pumpScheduled{false}; WKContentRuleList* ruleList = nil; uint64_t nextNativeId = 1; }

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

class MacView final : public EngineView {
public:
  MacView(Host& host, Tab& tab) : host_(host), tab_(tab), id_(std::to_string(nextNativeId++)) {}
  ~MacView() override { detach(); }
  bool create(int width, int height, double scale) {
    width_ = width; height_ = height; scale_ = scale;
    WKWebViewConfiguration* config = [WKWebViewConfiguration new];
    // Per-instance, in-memory data store: nothing shared with Safari, Gecko or CEF.
    config.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
    config.preferences.javaScriptCanOpenWindowsAutomatically = NO;
    if (ruleList) [config.userContentController addContentRuleList:ruleList];
    window_ = [[NSWindow alloc] initWithContentRect:NSMakeRect(-30000, -30000, width, height)
                                          styleMask:NSWindowStyleMaskBorderless backing:NSBackingStoreBuffered defer:NO];
    window_.releasedWhenClosed = NO;
    web_ = [[WKWebView alloc] initWithFrame:NSMakeRect(0, 0, width, height) configuration:config];
    delegate_ = [AXWebKitDelegate new];
    delegate_.owner = this;
    web_.navigationDelegate = delegate_;
    web_.UIDelegate = delegate_;
    window_.contentView = web_;
    for (NSString* key in @[@"title", @"URL", @"loading"]) [web_ addObserver:delegate_ forKeyPath:key options:0 context:nullptr];
    return true;
  }
  std::string nativeId() const override { return id_; }
  void load(const std::string& url) override {
    [web_ loadRequest:[NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithUTF8String:url.c_str()]]]];
  }
  bool canGoBack() override { return web_.canGoBack; }
  bool canGoForward() override { return web_.canGoForward; }
  void goBack() override { [web_ goBack]; }
  void goForward() override { [web_ goForward]; }
  void reload() override { [web_ reload]; }
  void stop() override { [web_ stopLoading]; }
  void resize(int width, int height, double scale) override {
    width_ = width; height_ = height; scale_ = scale;
    [window_ setContentSize:NSMakeSize(width, height)];
    web_.frame = NSMakeRect(0, 0, width, height);
    snapshotSoon();
  }
  void setFocus(bool focused) override { [window_ makeFirstResponder:focused ? web_ : nil]; }
  void setVisible(bool visible) override { visible_ = visible; if (visible) snapshotSoon(); }
  void setFrameRate(int) override {}
  void key(const KeyInput& key) override {
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
    snapshotSoon();
  }
  void mouse(const MouseInput& mouse) override {
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
    snapshotSoon();
  }
  void wheel(const WheelInput& wheel) override {
    CGEventRef cg = CGEventCreateScrollWheelEvent(nullptr, kCGScrollEventUnitPixel, 2, int32_t(wheel.deltaY), int32_t(wheel.deltaX));
    NSPoint origin = window_.frame.origin;
    CGEventSetLocation(cg, CGPointMake(origin.x + wheel.x, NSScreen.screens.firstObject.frame.size.height - (origin.y + height_ - wheel.y)));
    NSEvent* event = [NSEvent eventWithCGEvent:cg];
    CFRelease(cg);
    [web_ scrollWheel:event];
    snapshotSoon(); snapshotLater(0.3);
  }
  void commitText(const std::string& text) override {
    // WKWebView is the NSTextInputClient an input method commits into.
    [(id<NSTextInputClient>)web_ insertText:[NSString stringWithUTF8String:text.c_str()] replacementRange:NSMakeRange(NSNotFound, 0)];
    snapshotSoon();
  }
  bool edit(const std::string& action) override {
    SEL selector = action == "copy" ? @selector(copy:) : action == "cut" ? @selector(cut:) : action == "paste" ? @selector(paste:)
                   : action == "select_all" ? @selector(selectAll:) : action == "undo" ? NSSelectorFromString(@"undo:") : NSSelectorFromString(@"redo:");
    return [NSApp sendAction:selector to:nil from:web_];
  }
  void close() override { detach(); host_.viewClosed(&tab_); }

  // Delegate entry points.
  void observed(NSString* key) {
    if ([key isEqual:@"title"]) host_.titleChanged(&tab_, web_.title.UTF8String ?: "");
    else if ([key isEqual:@"URL"]) host_.urlChanged(&tab_, web_.URL.absoluteString.UTF8String ?: "");
    else host_.loadingChanged(&tab_, web_.loading);
    snapshotSoon();
  }
  bool policy(WKNavigationAction* action) {
    if (!action.targetFrame) { host_.denied(&tab_, "popup_denied"); return false; }
    if (!action.targetFrame.isMainFrame) return host_.allowedURL(action.request.URL.absoluteString.UTF8String ?: "", true);
    return host_.navigationPolicy(&tab_, action.request.URL.absoluteString.UTF8String ?: "", action.request.HTTPMethod.UTF8String ?: "GET");
  }
  void response(WKNavigationResponse* response) {
    if (response.forMainFrame) status_ = [response.response isKindOfClass:NSHTTPURLResponse.class] ? int(((NSHTTPURLResponse*)response.response).statusCode) : 0;
  }
  void committed() { pendingStatus_ = status_; host_.loadCommitted(&tab_, web_.URL.absoluteString.UTF8String ?: ""); }
  void finished() { host_.loadFinished(&tab_, web_.URL.absoluteString.UTF8String ?: "", pendingStatus_); snapshotSoon(); }
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
  std::string id_, downText_;
  WKWebView* web_ = nil;
  NSWindow* window_ = nil;
  AXWebKitDelegate* delegate_ = nil;
  int width_ = 900, height_ = 650, status_ = 0, pendingStatus_ = 0; double scale_ = 2;
  bool visible_ = true, pressed_ = false, snapshotting_ = false, again_ = false, detached_ = false;

  void detach() {
    if (detached_) return;
    detached_ = true;
    for (NSString* key in @[@"title", @"URL", @"loading"]) [web_ removeObserver:delegate_ forKeyPath:key];
    delegate_.owner = nullptr;
    web_.navigationDelegate = nil; web_.UIDelegate = nil;
    [web_ stopLoading];
    [web_ removeFromSuperview];
    [window_ close];
    web_ = nil; window_ = nil;
  }
  void snapshotLater(double seconds) {
    MacView* self = this; std::string key = tab_.key;
    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, int64_t(seconds * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
      if (currentHost && currentHost->tabByKey(key) == &self->tab_ && !self->detached_) self->snapshotSoon();
    });
  }
  // One snapshot in flight; requests during it coalesce into one more.
  void snapshotSoon() {
    if (detached_ || !visible_) return;
    if (snapshotting_) { again_ = true; return; }
    snapshotting_ = true;
    WKSnapshotConfiguration* config = [WKSnapshotConfiguration new];
    config.snapshotWidth = @(width_);
    MacView* self = this; std::string key = tab_.key;
    int w = int(std::ceil(width_ * scale_)), h = int(std::ceil(height_ * scale_));
    [web_ takeSnapshotWithConfiguration:config completionHandler:^(NSImage* image, NSError*) {
      if (!currentHost || currentHost->tabByKey(key) != &self->tab_ || self->detached_) return;
      self->snapshotting_ = false;
      CGImageRef cg = image ? [image CGImageForProposedRect:nullptr context:nil hints:nil] : nullptr;
      if (cg) {
        std::vector<uint8_t> pixels(size_t(w) * size_t(h) * 4);
        CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
        CGContextRef context = CGBitmapContextCreate(pixels.data(), size_t(w), size_t(h), 8, size_t(w) * 4, space,
                                                     uint32_t(kCGImageAlphaPremultipliedFirst) | uint32_t(kCGBitmapByteOrder32Little));
        CGContextSetInterpolationQuality(context, kCGInterpolationHigh);
        CGContextDrawImage(context, CGRectMake(0, 0, w, h), cg);
        CGContextRelease(context); CGColorSpaceRelease(space);
        currentHost->frame(&self->tab_, pixels.data(), w, h, size_t(w) * 4, PixelFormat::BGRA8Premultiplied);
      }
      if (self->again_) { self->again_ = false; self->snapshotSoon(); }
    }];
  }
};

class MacEngine final : public Engine {
public:
  void setHost(Host& host) { host_ = &host; }
  std::unique_ptr<EngineView> createView(Tab& tab, int width, int height, double scale, int) override {
    auto view = std::make_unique<MacView>(*host_, tab);
    if (!view->create(width, height, scale)) return nullptr;
    return view;
  }
  Object readyFields() override {
    NSString* version = [NSBundle bundleForClass:WKWebView.class].infoDictionary[@"CFBundleVersion"] ?: @"unknown";
    NSOperatingSystemVersion os = NSProcessInfo.processInfo.operatingSystemVersion;
    char platform[64]; snprintf(platform, sizeof platform, "macos-%ld.%ld-arm64", long(os.majorVersion), long(os.minorVersion));
    return Object{{"engine", "webkit"}, {"webkit_port", "wkwebview"}, {"webkit", version.UTF8String}, {"runtime_webkit", version.UTF8String},
                  {"platform", platform}, {"sandbox_configured", true}, {"sandbox", "macos-webkit-xpc"},
                  {"process_model", "multi-process"}, {"render_path", "wkwebview-snapshot-bgra"}, {"scaffold", true}};
  }
  // No cursor source in the scaffold (WKWebView sets NSCursor itself); phases are dropped.
  Object capabilities() override { return Object{{"wheel_phases", false}, {"cursor", false}}; }
  std::string engineName() override { return "webkit"; }
private:
  Host* host_ = nullptr;
};
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
    [NSApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyProhibited];
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
    hostPointer->ready();
    while (!hostPointer->tick()) {
      @autoreleasepool {
        NSEvent* event = [NSApp nextEventMatchingMask:NSEventMaskAny untilDate:[NSDate dateWithTimeIntervalSinceNow:0.01] inMode:NSDefaultRunLoopMode dequeue:YES];
        if (event) [NSApp sendEvent:event];
      }
    }
    hostPointer->tick();
    int code = hostPointer->finish();
    currentHost = nullptr;
    return code;
  }
}
