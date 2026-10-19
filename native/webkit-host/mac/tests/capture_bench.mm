// macOS WKWebView capture-path bench (ADR 004 "macOS"): which way of getting WebKit
// pixels out of a helper process keeps WebKit's process model and sandbox intact and
// is fastest. Not the host, not Zen, not E1/E2 evidence: a measurement tool.
//
// For each helper-window configuration it loads one synthetic animated page into a
// fresh WKWebView (non-persistent data store) and measures:
//   - the page's own requestAnimationFrame rate and visibilityState (is WebKit throttling?)
//   - snapshot:      -[WKWebView takeSnapshotWithConfiguration:] (public API), afterScreenUpdates NO/YES
//   - render_layer:  -[CALayer renderInContext:] of the web view's layer (public API)
//   - carenderer:    CARenderer into an IOSurface-backed Metal texture (public API)
//   - sck:           ScreenCaptureKit SCStream of the helper window (public API, needs TCC Screen Recording)
//   - input latency: keyDown -> probe colour visible in a snapshot
// CPU for this process and every com.apple.WebKit.* process is sampled per candidate.
//
// usage: capture_bench <evidence-dir>   (prints one JSON document on stdout)
#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
#import <QuartzCore/QuartzCore.h>
#import <Metal/Metal.h>
#import <IOSurface/IOSurface.h>
#import <ImageIO/ImageIO.h>
#import <UniformTypeIdentifiers/UniformTypeIdentifiers.h>
#import <ScreenCaptureKit/ScreenCaptureKit.h>
#import <CoreMedia/CoreMedia.h>
#import <objc/message.h>
#include <libproc.h>
#include <mach/mach_time.h>
#include <sys/resource.h>
#include <zlib.h>
#include <algorithm>
#include <functional>
#include <map>
#include <set>
#include <string>
#include <vector>

namespace {
mach_timebase_info_data_t timebase;
double nowMs() { return double(mach_absolute_time()) * timebase.numer / timebase.denom / 1e6; }
NSString* evidence;

// The page: a rAF-animated bar (continuous change), a probe block toggled by keydown.
NSString* const Page = @"<!doctype html><html><meta charset=utf-8><title>bench</title>"
  "<style>html,body{margin:0;background:#edf2f5;font:24px -apple-system}#probe{position:absolute;left:0;top:0;width:200px;height:200px;background:rgb(255,0,0)}"
  "#bar{position:absolute;left:0;top:260px;width:120px;height:120px;background:rgb(37,125,101);border-radius:16px}"
  "#count{position:absolute;left:40px;top:420px}h1{position:absolute;left:300px;top:20px;margin:0;font-size:34px}</style>"
  "<div id=probe></div><h1>WebKit capture bench</h1><div id=bar></div><p id=count>rAF 0</p>"
  "<script>window.__frames=0;let k=0;const bar=document.querySelector('#bar'),count=document.querySelector('#count'),probe=document.querySelector('#probe');"
  "function tick(t){__frames++;bar.style.transform=`translateX(${(t*0.4)%700}px)`;count.textContent=`rAF ${__frames}`;requestAnimationFrame(tick);}"
  "requestAnimationFrame(tick);addEventListener('keydown',e=>{k++;probe.style.background=k%2?'rgb(0,0,255)':'rgb(255,0,0)';});</script></html>";

void spin(double seconds, BOOL (^done)(void) = nil) {
  double end = nowMs() + seconds * 1000;
  while (nowMs() < end && !(done && done())) {
    @autoreleasepool {
      NSEvent* event = [NSApp nextEventMatchingMask:NSEventMaskAny untilDate:[NSDate dateWithTimeIntervalSinceNow:0.002]
                                             inMode:NSDefaultRunLoopMode dequeue:YES];
      if (event) [NSApp sendEvent:event];
    }
  }
}

// ---- CPU ------------------------------------------------------------------------
struct Cpu { double self = 0, webkit = 0; std::map<std::string, double> byName; };
double rusageFactor = 1;  // proc_pid_rusage units -> ms, calibrated against getrusage
double selfMs() {
  rusage usage{}; getrusage(RUSAGE_SELF, &usage);
  return (usage.ru_utime.tv_sec + usage.ru_stime.tv_sec) * 1e3 + (usage.ru_utime.tv_usec + usage.ru_stime.tv_usec) / 1e3;
}
double rawRusage(pid_t pid) {
  rusage_info_v2 info{};
  if (proc_pid_rusage(pid, RUSAGE_INFO_V2, (rusage_info_t*)&info)) return -1;
  return double(info.ri_user_time + info.ri_system_time);
}
Cpu cpu() {
  Cpu value; value.self = selfMs();
  std::vector<pid_t> pids(4096);
  int count = proc_listallpids(pids.data(), int(pids.size() * sizeof(pid_t)));
  for (int i = 0; i < count; ++i) {
    char name[256] = {};
    if (proc_name(pids[i], name, sizeof name) <= 0) continue;
    if (strncmp(name, "com.apple.WebKit", 16) && strncmp(name, "com.apple.Web", 13)) continue;
    double raw = rawRusage(pids[i]);
    if (raw < 0) continue;
    value.webkit += raw * rusageFactor; value.byName[name] += raw * rusageFactor;
  }
  return value;
}
NSDictionary* cpuDelta(const Cpu& a, const Cpu& b, double seconds) {
  NSMutableDictionary* names = [NSMutableDictionary dictionary];
  for (auto& [name, ms] : b.byName) names[@(name.c_str())] = @((ms - (a.byName.count(name) ? a.byName.at(name) : 0)) / seconds / 10);
  return @{@"self_percent": @((b.self - a.self) / seconds / 10), @"webkit_percent": @((b.webkit - a.webkit) / seconds / 10), @"webkit_by_process": names};
}

// ---- Pixels -----------------------------------------------------------------------
struct Image { std::vector<uint8_t> bgra; int width = 0, height = 0; };
Image toBGRA(CGImageRef cg) {
  Image out;
  if (!cg) return out;
  out.width = int(CGImageGetWidth(cg)); out.height = int(CGImageGetHeight(cg));
  out.bgra.resize(size_t(out.width) * out.height * 4);
  CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
  CGContextRef context = CGBitmapContextCreate(out.bgra.data(), out.width, out.height, 8, size_t(out.width) * 4, space,
                                               uint32_t(kCGImageAlphaPremultipliedFirst) | uint32_t(kCGBitmapByteOrder32Little));
  CGContextDrawImage(context, CGRectMake(0, 0, out.width, out.height), cg);
  CGContextRelease(context); CGColorSpaceRelease(space);
  return out;
}
struct Stats { double nonEmpty = 0; int colors = 0; bool bar = false; int probe = 0; };
Stats inspect(const Image& image, double scale) {
  Stats s; if (!image.width) return s;
  std::set<uint32_t> colors; size_t total = 0, nonZero = 0;
  for (int y = 0; y < image.height; y += 8) for (int x = 0; x < image.width; x += 8) {
    const uint8_t* p = &image.bgra[(size_t(y) * image.width + x) * 4];
    uint32_t v; memcpy(&v, p, 4); total++; nonZero += v != 0; if (colors.size() < 4096) colors.insert(v);
    if (abs(p[2] - 37) < 12 && abs(p[1] - 125) < 12 && abs(p[0] - 101) < 12) s.bar = true;
  }
  s.nonEmpty = total ? double(nonZero) / total : 0; s.colors = int(colors.size());
  int px = int(100 * scale), py = int(100 * scale);
  if (px < image.width && py < image.height) {
    const uint8_t* p = &image.bgra[(size_t(py) * image.width + px) * 4];
    s.probe = (p[2] > 200 && p[0] < 60) ? 1 : (p[0] > 200 && p[2] < 60) ? 2 : 0;
  }
  return s;
}
void writePNG(const Image& image, NSString* name) {
  if (!image.width) return;
  CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
  CGContextRef context = CGBitmapContextCreate((void*)image.bgra.data(), image.width, image.height, 8, size_t(image.width) * 4, space,
                                               uint32_t(kCGImageAlphaPremultipliedFirst) | uint32_t(kCGBitmapByteOrder32Little));
  CGImageRef cg = CGBitmapContextCreateImage(context);
  NSURL* url = [NSURL fileURLWithPath:[evidence stringByAppendingPathComponent:name]];
  CGImageDestinationRef destination = CGImageDestinationCreateWithURL((__bridge CFURLRef)url, (__bridge CFStringRef)UTTypePNG.identifier, 1, nullptr);
  if (destination) { CGImageDestinationAddImage(destination, cg, nullptr); CGImageDestinationFinalize(destination); CFRelease(destination); }
  CGImageRelease(cg); CGContextRelease(context); CGColorSpaceRelease(space);
}
NSDictionary* percentiles(std::vector<double> values) {
  if (values.empty()) return @{@"count": @0};
  std::sort(values.begin(), values.end());
  auto at = [&](double q) { return values[std::min(values.size() - 1, size_t(q * (values.size() - 1) + 0.5))]; };
  return @{@"count": @(values.size()), @"p50_ms": @(at(.5)), @"p95_ms": @(at(.95)), @"max_ms": @(values.back())};
}
NSDictionary* statsDict(const Stats& s) { return @{@"non_empty": @(s.nonEmpty), @"colors": @(s.colors), @"bar_visible": @(s.bar), @"probe": @(s.probe)}; }

// ---- Web view -----------------------------------------------------------------------
struct Config { NSString* name; bool ordered; bool onScreen; double alpha; bool occlusionOff; bool overrideScale; NSApplicationActivationPolicy policy; bool productEligible; };

struct View { NSWindow* window = nil; WKWebView* web = nil; };
View makeView(const Config& c, int width, int height) {
  [NSApp setActivationPolicy:c.policy];
  View v;
  NSRect frame = c.onScreen ? NSMakeRect(40, 40, width, height) : NSMakeRect(-30000, -30000, width, height);
  v.window = [[NSWindow alloc] initWithContentRect:frame styleMask:NSWindowStyleMaskBorderless backing:NSBackingStoreBuffered defer:NO];
  v.window.releasedWhenClosed = NO;
  v.window.alphaValue = c.alpha;
  v.window.ignoresMouseEvents = YES;
  v.window.excludedFromWindowsMenu = YES;
  WKWebViewConfiguration* config = [WKWebViewConfiguration new];
  config.websiteDataStore = [WKWebsiteDataStore nonPersistentDataStore];
  v.web = [[WKWebView alloc] initWithFrame:NSMakeRect(0, 0, width, height) configuration:config];
  v.window.contentView = v.web;
  if (c.occlusionOff) {
    SEL s = NSSelectorFromString(@"_setWindowOcclusionDetectionEnabled:");
    if ([v.web respondsToSelector:s]) ((void (*)(id, SEL, BOOL))objc_msgSend)(v.web, s, NO);
  }
  if (c.overrideScale) {
    SEL s = NSSelectorFromString(@"_setOverrideDeviceScaleFactor:");
    if ([v.web respondsToSelector:s]) ((void (*)(id, SEL, CGFloat))objc_msgSend)(v.web, s, 2.0);
  }
  if (c.ordered) [v.window orderFrontRegardless];
  return v;
}
id evaluate(WKWebView* web, NSString* script) {
  __block id result = nil; __block bool done = false;
  [web evaluateJavaScript:script completionHandler:^(id value, NSError*) { result = value; done = true; }];
  spin(5, ^BOOL { return done; });
  return result;
}

// One snapshot; returns BGRA and its latency.
Image snapshot(WKWebView* web, bool afterUpdates, double* latency) {
  WKSnapshotConfiguration* config = [WKSnapshotConfiguration new];
  config.afterScreenUpdates = afterUpdates;
  __block NSImage* image = nil; __block bool done = false;
  double start = nowMs();
  [web takeSnapshotWithConfiguration:config completionHandler:^(NSImage* value, NSError*) { image = value; done = true; }];
  spin(5, ^BOOL { return done; });
  Image out = toBGRA(image ? [image CGImageForProposedRect:nullptr context:nil hints:nil] : nullptr);
  if (latency) *latency = nowMs() - start;
  return out;
}

NSDictionary* snapshotLoop(WKWebView* web, bool afterUpdates, double seconds, double scale, NSString* png) {
  std::vector<double> latencies; std::set<uLong> crcs; Image last;
  Cpu a = cpu(); double start = nowMs(); int frames = 0;
  while (nowMs() - start < seconds * 1000) {
    double latency = 0;
    last = snapshot(web, afterUpdates, &latency);
    if (!last.width) break;
    frames++; latencies.push_back(latency);
    crcs.insert(crc32(0, last.bgra.data(), uInt(last.bgra.size())));
  }
  double elapsed = (nowMs() - start) / 1000;
  Cpu b = cpu();
  if (png) writePNG(last, png);
  return @{@"fps": @(frames / elapsed), @"frames": @(frames), @"distinct_frames": @(crcs.size()), @"latency": percentiles(latencies),
           @"pixel_size": @[@(last.width), @(last.height)], @"pixels": statsDict(inspect(last, double(last.width) / 900)),
           @"cpu": cpuDelta(a, b, elapsed)};
}

NSDictionary* renderLayer(WKWebView* web, int width, int height, NSString* png) {
  Image out; out.width = width; out.height = height; out.bgra.assign(size_t(width) * height * 4, 0);
  CGColorSpaceRef space = CGColorSpaceCreateWithName(kCGColorSpaceSRGB);
  CGContextRef context = CGBitmapContextCreate(out.bgra.data(), width, height, 8, size_t(width) * 4, space,
                                               uint32_t(kCGImageAlphaPremultipliedFirst) | uint32_t(kCGBitmapByteOrder32Little));
  double start = nowMs();
  CALayer* layer = web.layer;
  if (layer) { CGContextTranslateCTM(context, 0, height); CGContextScaleCTM(context, 1, -1); [layer renderInContext:context]; }
  double latency = nowMs() - start;
  CGContextRelease(context); CGColorSpaceRelease(space);
  writePNG(out, png);
  return @{@"has_layer": @(layer != nil), @"latency_ms": @(latency), @"pixels": statsDict(inspect(out, 1))};
}

NSDictionary* caRenderer(WKWebView* web, int width, int height, NSString* png) {
  id<MTLDevice> device = MTLCreateSystemDefaultDevice();
  if (!device || !web.layer) return @{@"error": @"no_device_or_layer"};
  NSDictionary* props = @{(id)kIOSurfaceWidth: @(width), (id)kIOSurfaceHeight: @(height), (id)kIOSurfaceBytesPerElement: @4,
                          (id)kIOSurfacePixelFormat: @((uint32_t)'BGRA')};
  IOSurfaceRef surface = IOSurfaceCreate((__bridge CFDictionaryRef)props);
  MTLTextureDescriptor* d = [MTLTextureDescriptor texture2DDescriptorWithPixelFormat:MTLPixelFormatBGRA8Unorm width:width height:height mipmapped:NO];
  d.usage = MTLTextureUsageRenderTarget | MTLTextureUsageShaderRead; d.storageMode = MTLStorageModeShared;
  id<MTLTexture> texture = [device newTextureWithDescriptor:d iosurface:surface plane:0];
  // CARenderer needs a root layer of its own: host the web view's layer tree under a
  // proxy root would reparent it, so render a presentation copy is impossible; we use
  // the real layer and put it back afterwards.
  CALayer* layer = web.layer; CALayer* parent = layer.superlayer;
  NSDictionary* result;
  @try {
    CARenderer* renderer = [CARenderer rendererWithMTLTexture:texture options:@{kCARendererColorSpace: (__bridge id)CGColorSpaceCreateWithName(kCGColorSpaceSRGB)}];
    double start = nowMs();
    [CATransaction begin]; [CATransaction setDisableActions:YES];
    [layer removeFromSuperlayer];
    renderer.layer = layer; renderer.bounds = CGRectMake(0, 0, width, height);
    [CATransaction commit];
    [renderer beginFrameAtTime:CACurrentMediaTime() timeStamp:nullptr];
    [renderer addUpdateRect:renderer.bounds];
    [renderer render];
    [renderer endFrame];
    id<MTLCommandQueue> q = [device newCommandQueue]; id<MTLCommandBuffer> b = [q commandBuffer]; [b commit]; [b waitUntilCompleted];
    double latency = nowMs() - start;
    renderer.layer = nil;
    [CATransaction begin]; [CATransaction setDisableActions:YES];
    if (parent) [parent addSublayer:layer];
    [CATransaction commit];
    Image out; out.width = width; out.height = height; out.bgra.resize(size_t(width) * height * 4);
    IOSurfaceLock(surface, kIOSurfaceLockReadOnly, nullptr);
    for (int y = 0; y < height; ++y) memcpy(&out.bgra[size_t(y) * width * 4], (uint8_t*)IOSurfaceGetBaseAddress(surface) + y * IOSurfaceGetBytesPerRow(surface), size_t(width) * 4);
    IOSurfaceUnlock(surface, kIOSurfaceLockReadOnly, nullptr);
    writePNG(out, png);
    result = @{@"latency_ms": @(latency), @"pixels": statsDict(inspect(out, 1))};
  } @catch (NSException* e) {
    result = @{@"error": e.reason ?: @"exception"};
  }
  CFRelease(surface);
  return result;
}
}  // namespace

@interface AXSCKOutput : NSObject <SCStreamOutput>
@property(atomic) int frames, complete, withSurface, withDirty;
@property(atomic) double first, last;
@end
@implementation AXSCKOutput
- (void)stream:(SCStream*)stream didOutputSampleBuffer:(CMSampleBufferRef)buffer ofType:(SCStreamOutputType)type {
  if (type != SCStreamOutputTypeScreen) return;
  self.frames++;
  CFArrayRef attachments = CMSampleBufferGetSampleAttachmentsArray(buffer, false);
  if (attachments && CFArrayGetCount(attachments)) {
    NSDictionary* info = (__bridge NSDictionary*)CFArrayGetValueAtIndex(attachments, 0);
    if ([info[SCStreamFrameInfoStatus] integerValue] == SCFrameStatusComplete) {
      self.complete++;
      if ([info[SCStreamFrameInfoDirtyRects] count]) self.withDirty++;
      double t = nowMs(); if (!self.first) self.first = t; self.last = t;
    }
  }
  CVImageBufferRef image = CMSampleBufferGetImageBuffer(buffer);
  if (image && CVPixelBufferGetIOSurface(image)) self.withSurface++;
}
@end

namespace {
NSDictionary* sck(NSWindow* window, int width, int height, double seconds) {
  __block SCShareableContent* content = nil; __block NSError* failure = nil; __block bool done = false;
  [SCShareableContent getShareableContentExcludingDesktopWindows:NO onScreenWindowsOnly:NO completionHandler:^(SCShareableContent* c, NSError* e) {
    content = c; failure = e; done = true;
  }];
  spin(10, ^BOOL { return done; });
  if (!done) return @{@"error": @"shareable_content_timeout"};
  if (failure) return @{@"error": [NSString stringWithFormat:@"%@ %ld: %@", failure.domain, long(failure.code), failure.localizedDescription]};
  SCWindow* found = nil;
  for (SCWindow* w in content.windows) if (w.windowID == CGWindowID(window.windowNumber)) found = w;
  if (!found) return @{@"error": @"window_not_shareable", @"windows": @(content.windows.count)};
  SCContentFilter* filter = [[SCContentFilter alloc] initWithDesktopIndependentWindow:found];
  SCStreamConfiguration* config = [SCStreamConfiguration new];
  config.width = size_t(width); config.height = size_t(height); config.pixelFormat = kCVPixelFormatType_32BGRA;
  config.minimumFrameInterval = CMTimeMake(1, 60); config.showsCursor = NO; config.queueDepth = 6;
  SCStream* stream = [[SCStream alloc] initWithFilter:filter configuration:config delegate:nil];
  AXSCKOutput* output = [AXSCKOutput new];
  NSError* addError = nil;
  [stream addStreamOutput:output type:SCStreamOutputTypeScreen sampleHandlerQueue:dispatch_queue_create("sck", DISPATCH_QUEUE_SERIAL) error:&addError];
  __block NSError* startError = nil; done = false;
  [stream startCaptureWithCompletionHandler:^(NSError* e) { startError = e; done = true; }];
  spin(10, ^BOOL { return done; });
  if (startError || addError) return @{@"error": [NSString stringWithFormat:@"start: %@", (startError ?: addError).localizedDescription]};
  Cpu a = cpu(); spin(seconds); Cpu b = cpu();
  done = false;
  [stream stopCaptureWithCompletionHandler:^(NSError*) { done = true; }];
  spin(5, ^BOOL { return done; });
  double span = (output.last - output.first) / 1000;
  return @{@"frames": @(output.frames), @"complete": @(output.complete), @"with_iosurface": @(output.withSurface),
           @"with_dirty_rects": @(output.withDirty), @"complete_fps": @(span > 0 ? (output.complete - 1) / span : 0),
           @"cpu": cpuDelta(a, b, seconds)};
}

NSDictionary* inputLatency(View& v, double scale) {
  std::vector<double> samples; int misses = 0;
  [v.window makeFirstResponder:v.web];
  for (int i = 0; i < 8; ++i) {
    int before = inspect(snapshot(v.web, false, nullptr), scale).probe;
    double start = nowMs();
    NSEvent* down = [NSEvent keyEventWithType:NSEventTypeKeyDown location:NSZeroPoint modifierFlags:0 timestamp:NSProcessInfo.processInfo.systemUptime
                                 windowNumber:v.window.windowNumber context:nil characters:@"a" charactersIgnoringModifiers:@"a" isARepeat:NO keyCode:0];
    NSEvent* up = [NSEvent keyEventWithType:NSEventTypeKeyUp location:NSZeroPoint modifierFlags:0 timestamp:NSProcessInfo.processInfo.systemUptime
                               windowNumber:v.window.windowNumber context:nil characters:@"a" charactersIgnoringModifiers:@"a" isARepeat:NO keyCode:0];
    [v.web keyDown:down]; [v.web keyUp:up];
    bool seen = false;
    while (nowMs() - start < 1500) {
      int now = inspect(snapshot(v.web, false, nullptr), scale).probe;
      if (now && now != before) { seen = true; break; }
    }
    if (seen) samples.push_back(nowMs() - start); else misses++;
    spin(0.1);
  }
  NSMutableDictionary* d = [percentiles(samples) mutableCopy]; d[@"misses"] = @(misses);
  return d;
}
}  // namespace

int main(int argc, char** argv) {
  @autoreleasepool {
    mach_timebase_info(&timebase);
    if (argc != 2) { fprintf(stderr, "usage: capture_bench <evidence-dir>\n"); return 64; }
    evidence = @(argv[1]);
    [NSApplication sharedApplication];
    [NSApp setActivationPolicy:NSApplicationActivationPolicyProhibited];
    [NSApp finishLaunching];
    {  // Calibrate proc_pid_rusage units against getrusage on our own process.
      double r0 = rawRusage(getpid()), s0 = selfMs(); double x = 0; for (int i = 0; i < 40000000; ++i) x += i * 1e-9;
      double r1 = rawRusage(getpid()), s1 = selfMs();
      rusageFactor = (r1 > r0) ? (s1 - s0) / (r1 - r0) : 1e-6; (void)x;
    }
    NSMutableDictionary* out = [NSMutableDictionary dictionary];
    NSOperatingSystemVersion os = NSProcessInfo.processInfo.operatingSystemVersion;
    out[@"macos"] = [NSString stringWithFormat:@"%ld.%ld.%ld", long(os.majorVersion), long(os.minorVersion), long(os.patchVersion)];
    out[@"webkit_bundle_version"] = [NSBundle bundleForClass:WKWebView.class].infoDictionary[@"CFBundleVersion"] ?: @"?";
    out[@"main_screen_scale"] = @(NSScreen.mainScreen.backingScaleFactor);
    out[@"main_screen_frame"] = NSStringFromRect(NSScreen.mainScreen.frame);
    out[@"rusage_factor_ms_per_unit"] = @(rusageFactor);
    const int W = 900, H = 650;
    std::vector<Config> configs = {
      {@"unordered-offscreen", false, false, 1, false, false, NSApplicationActivationPolicyProhibited, true},
      {@"ordered-offscreen", true, false, 1, false, false, NSApplicationActivationPolicyAccessory, true},
      {@"ordered-offscreen-no-occlusion-spi", true, false, 1, true, false, NSApplicationActivationPolicyAccessory, true},
      {@"unordered-no-occlusion-spi", false, false, 1, true, false, NSApplicationActivationPolicyProhibited, true},
      {@"unordered-no-occlusion-spi-scale2-spi", false, false, 1, true, true, NSApplicationActivationPolicyProhibited, true},
      {@"ordered-onscreen-alpha0", true, true, 0, false, false, NSApplicationActivationPolicyAccessory, false},
      {@"ordered-onscreen-visible-reference", true, true, 1, false, false, NSApplicationActivationPolicyAccessory, false},
    };
    NSMutableArray* results = [NSMutableArray array];
    for (auto& c : configs) {
      @autoreleasepool {
        NSMutableDictionary* r = [@{@"config": c.name, @"ordered": @(c.ordered), @"on_screen": @(c.onScreen), @"alpha": @(c.alpha),
                                    @"occlusion_detection_disabled_spi": @(c.occlusionOff), @"override_scale_spi": @(c.overrideScale),
                                    @"product_eligible_window": @(c.productEligible)} mutableCopy];
        View v = makeView(c, W, H);
        __block bool loaded = false;
        WKWebView* web = v.web;
        [v.web loadHTMLString:Page baseURL:nil];
        spin(15, ^BOOL { return !web.loading && web.URL != nil && (loaded = true); });
        spin(1.0);
        r[@"loaded"] = @(loaded);
        r[@"visibility_state"] = evaluate(v.web, @"document.visibilityState") ?: [NSNull null];
        r[@"device_pixel_ratio"] = evaluate(v.web, @"devicePixelRatio") ?: [NSNull null];
        r[@"window_backing_scale"] = @(v.window.backingScaleFactor);
        r[@"occlusion_visible"] = @((v.window.occlusionState & NSWindowOcclusionStateVisible) != 0);
        double f0 = [evaluate(v.web, @"__frames") doubleValue], t0 = nowMs();
        Cpu idle0 = cpu(); spin(2.0); Cpu idle1 = cpu();
        double f1 = [evaluate(v.web, @"__frames") doubleValue];
        r[@"raf_hz"] = @((f1 - f0) / ((nowMs() - t0) / 1000));
        r[@"cpu_idle_no_capture"] = cpuDelta(idle0, idle1, 2.0);
        r[@"snapshot"] = snapshotLoop(v.web, false, 3, 1, [c.name stringByAppendingString:@"-snapshot.png"]);
        r[@"snapshot_after_screen_updates"] = snapshotLoop(v.web, true, 3, 1, nil);
        r[@"render_layer"] = renderLayer(v.web, W, H, [c.name stringByAppendingString:@"-render-layer.png"]);
        r[@"input_to_snapshot"] = inputLatency(v, [r[@"snapshot"][@"pixel_size"][0] doubleValue] / W);
        if (c.ordered) r[@"sck"] = sck(v.window, W, H, 3);
        r[@"carenderer"] = caRenderer(v.web, W, H, [c.name stringByAppendingString:@"-carenderer.png"]);
        [results addObject:r];
        [v.window orderOut:nil]; [v.window close];
        v.web = nil; v.window = nil;
        spin(0.5);
      }
    }
    out[@"configs"] = results;
    NSData* data = [NSJSONSerialization dataWithJSONObject:out options:NSJSONWritingPrettyPrinted | NSJSONWritingSortedKeys error:nil];
    fwrite(data.bytes, 1, data.length, stdout); fputc('\n', stdout);
    return 0;
  }
}
