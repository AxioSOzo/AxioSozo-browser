// AxioSozo CEF OSR component probe. This is E0, never Zen embedding evidence.
#import <Cocoa/Cocoa.h>
#include <dlfcn.h>
#include <mach/mach_time.h>
#include <signal.h>
#include <atomic>
#include <chrono>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <string>
#include <vector>
#include "transport.hpp"
#include "surface_transport.hpp"
#ifndef AXIO_CEF_HELPER
#include "crash_guard.hpp"
#endif
#include "include/capi/cef_app_capi.h"
#include "include/capi/cef_browser_capi.h"
#include "include/capi/cef_client_capi.h"
#include "include/cef_api_hash.h"
#include "include/cef_application_mac.h"
#include "include/cef_sandbox_mac.h"
#include "include/cef_version.h"
#include "include/cef_version_info.h"

#define IMPORT(name) static decltype(&name) p_##name
IMPORT(cef_initialize); IMPORT(cef_execute_process); IMPORT(cef_shutdown);
IMPORT(cef_run_message_loop); IMPORT(cef_quit_message_loop); IMPORT(cef_browser_host_create_browser);
IMPORT(cef_api_hash); IMPORT(cef_version_info);
IMPORT(cef_string_userfree_utf16_free);
IMPORT(cef_request_context_create_context);
static void* framework;
template<class T> static void symbol(T& out, const char* name) {
  out = reinterpret_cast<T>(dlsym(framework, name));
  if (!out) { fprintf(stderr,"missing CEF export: %s\n",name); exit(70); }
}
static void loadFramework(NSString* path) {
  framework = dlopen(path.fileSystemRepresentation, RTLD_LAZY|RTLD_LOCAL|RTLD_FIRST);
  if (!framework) { fprintf(stderr,"CEF dlopen: %s\n",dlerror()); exit(70); }
#define LOAD(name) symbol(p_##name,#name)
  LOAD(cef_initialize); LOAD(cef_execute_process); LOAD(cef_shutdown);
  LOAD(cef_run_message_loop); LOAD(cef_quit_message_loop); LOAD(cef_browser_host_create_browser); LOAD(cef_api_hash); LOAD(cef_version_info);
  LOAD(cef_string_userfree_utf16_free);
  LOAD(cef_request_context_create_context);
  const char* apiHash = p_cef_api_hash(CEF_API_VERSION, 0);
  if (!apiHash || strcmp(apiHash, CEF_API_HASH_PLATFORM) != 0 || p_cef_version_info(0)!=CEF_VERSION_MAJOR || p_cef_version_info(1)!=CEF_VERSION_MINOR || p_cef_version_info(2)!=CEF_VERSION_PATCH || p_cef_version_info(4)!=CHROME_VERSION_MAJOR || p_cef_version_info(5)!=CHROME_VERSION_MINOR || p_cef_version_info(6)!=CHROME_VERSION_BUILD || p_cef_version_info(7)!=CHROME_VERSION_PATCH) { fprintf(stderr,"CEF API version rejected\n"); exit(70); }
}
static std::u16string utf16(NSString* s) {
  std::u16string result(s.length,0); [s getCharacters:(unichar*)result.data() range:NSMakeRange(0,s.length)]; return result;
}
static cef_string_t view(const std::u16string& s) { return {(char16_t*)s.data(),s.size(),nullptr}; }
static NSString* ns(const cef_string_t* s) { return s ? [[NSString alloc] initWithCharacters:(unichar*)s->str length:s->length] : @""; }
static NSString* evidence;
static std::u16string initialURL;
static cef_browser_t* browser = nullptr;
static cef_request_context_t* isolatedContext = nullptr;
static bool closed=false, loaded=false, inputObserved=false, navigated=false;
static int width=900,height=650,frames=0;
static double deviceScale=2.0;
static bool streaming=false, streamReady=false, streamClosing=false, streamPaintAllowed=false;
static axio::Transport transport;
static NSDictionary* target;
static NSString* streamToken;
static NSString* streamInstance;
static NSString* fixtureOrigin;
static bool webBrowsing=false;
static NSMutableSet* requestIds;
static NSString* shutdownRequest;
static uint64_t frameId=0;
static const int HeartbeatIntervalMs=1000; // announced as capabilities.heartbeat_interval_ms
static NSString* captureName=@"cef-e0-initial.png";
static volatile sig_atomic_t interrupted=0;
static void stopSignal(int) { interrupted=1; }
static void event(NSString* kind, NSDictionary* fields) {
  NSMutableDictionary* item=[fields mutableCopy]; item[@"event"]=kind;
  if(streaming){
    item[@"version"]=@1;if(target[@"native_target_id"]&&!item[@"target"])item[@"target"]=target;
    NSData* data=[NSJSONSerialization dataWithJSONObject:item options:NSJSONWritingSortedKeys error:nil];
    transport.event(std::string((const char*)data.bytes,data.length));return;
  }
  item[@"component"]=@"CEF_E0_ONLY"; item[@"timestamp"] = @([[NSDate date] timeIntervalSince1970]);
  NSData* data=[NSJSONSerialization dataWithJSONObject:item options:NSJSONWritingSortedKeys error:nil];
  fwrite(data.bytes,1,data.length,stdout); fputc('\n',stdout); fflush(stdout);
}
// The owner holds one reference until after cef_shutdown. CEF owns every extra reference.
template<class T> struct Ref {
  T api{}; std::atomic<int> refs{1};
  Ref() {
    api.base.size=sizeof(T);
    api.base.add_ref=[](cef_base_ref_counted_t* b){ reinterpret_cast<Ref*>(b)->refs++; };
    api.base.release=[](cef_base_ref_counted_t* b){ auto* p=reinterpret_cast<Ref*>(b); p->refs--; return 0; };
    api.base.has_one_ref=[](cef_base_ref_counted_t* b){ return int(reinterpret_cast<Ref*>(b)->refs==1); };
    api.base.has_at_least_one_ref=[](cef_base_ref_counted_t* b){ return int(reinterpret_cast<Ref*>(b)->refs>0); };
  }
  T* retain(){api.base.add_ref(&api.base);return &api;}
};
static Ref<cef_app_t> app;
static Ref<cef_browser_process_handler_t> processHandler;
static Ref<cef_client_t> client;
static Ref<cef_life_span_handler_t> lifespan;
static Ref<cef_render_handler_t> render;
static Ref<cef_display_handler_t> display;
static Ref<cef_load_handler_t> loading;
static Ref<cef_request_handler_t> request;
static Ref<cef_permission_handler_t> permissions;
static Ref<cef_resource_request_handler_t> resources;
static Ref<cef_download_handler_t> downloads;
static Ref<cef_context_menu_handler_t> contextMenu;
static Ref<cef_dialog_handler_t> dialogs;
static Ref<cef_jsdialog_handler_t> jsDialogs;
static void saveFrame(const void* buffer,int w,int h) {
  if (!captureName || w<=0 || h<=0 || w>4096 || h>4096 || w!=int(ceil(width*deviceScale)) || h!=int(ceil(height*deviceScale))) return;
  NSBitmapImageRep* rep=[[NSBitmapImageRep alloc] initWithBitmapDataPlanes:nil pixelsWide:w pixelsHigh:h bitsPerSample:8 samplesPerPixel:4 hasAlpha:YES isPlanar:NO colorSpaceName:NSDeviceRGBColorSpace bytesPerRow:w*4 bitsPerPixel:32];
  auto* src=(const unsigned char*)buffer; auto* dst=rep.bitmapData;
  for (int i=0;i<w*h;i++){dst[i*4]=src[i*4+2];dst[i*4+1]=src[i*4+1];dst[i*4+2]=src[i*4];dst[i*4+3]=src[i*4+3];}
  NSString* target=[evidence stringByAppendingPathComponent:captureName];
  BOOL ok=[[rep representationUsingType:NSBitmapImageFileTypePNG properties:@{}] writeToFile:target atomically:YES];
  event(@"native_frame",@{@"width":@(w),@"height":@(h),@"file":captureName,@"written":@(ok)}); captureName=nil;
}
static void closeBrowser(){ if(browser){auto*h=browser->get_host(browser);h->close_browser(h,0);h->base.release(&h->base);} }
#include "stream.inc"
@interface AxioCEFApplication:NSApplication<CefAppProtocol>{BOOL sending;}
@end
@implementation AxioCEFApplication
-(BOOL)isHandlingSendEvent{return sending;}
-(void)setHandlingSendEvent:(BOOL)value{sending=value;}
-(void)sendEvent:(NSEvent*)event{CefScopedSendingEvent scoped;[super sendEvent:event];}
-(void)terminate:(id)sender{interrupted=1;}
@end
static void configure() {
  app.api.get_browser_process_handler=[](cef_app_t*){return processHandler.retain();};
  client.api.get_life_span_handler=[](cef_client_t*){return lifespan.retain();};
  client.api.get_render_handler=[](cef_client_t*){return render.retain();};
  client.api.get_display_handler=[](cef_client_t*){return display.retain();};
  client.api.get_load_handler=[](cef_client_t*){return loading.retain();};
  client.api.get_request_handler=[](cef_client_t*){return request.retain();};
  client.api.get_permission_handler=[](cef_client_t*){return permissions.retain();};
  processHandler.api.on_context_initialized=[](cef_browser_process_handler_t*){
    // Fixture probes keep cookies/cache in memory. A web host owns exactly one
    // persistent Chromium profile beside its Zen profile, never Firefox data.
    static std::u16string persistentPath;
    cef_request_context_settings_t contextSettings{};contextSettings.size=sizeof(contextSettings);
    if(streaming&&webBrowsing){persistentPath=utf16(profilePath);contextSettings.cache_path=view(persistentPath);}
    isolatedContext=p_cef_request_context_create_context(&contextSettings,nullptr);
    if(!isolatedContext){event(@"error",@{@"code":@"isolated_context_failed"});streamClosing=true;return;}
    if(streaming){streamReady=true;streamReadyEvent();return;}
    cef_window_info_t wi{};wi.size=sizeof(wi);wi.windowless_rendering_enabled=1;wi.runtime_style=CEF_RUNTIME_STYLE_ALLOY;
    cef_browser_settings_t settings{};settings.size=sizeof(settings);settings.windowless_frame_rate=20;
    auto url=view(initialURL);
    // CEF takes one reference to each ref-counted argument.
    isolatedContext->base.base.add_ref(&isolatedContext->base.base);
    int accepted=p_cef_browser_host_create_browser(&wi,client.retain(),&url,&settings,nullptr,isolatedContext);
    event(@"create_accepted",@{@"accepted":@(accepted)});
  };
  lifespan.api.on_after_created=[](cef_life_span_handler_t*,cef_browser_t*b){browser=b;b->base.add_ref(&b->base);event(@"created",@{@"nativeTargetId":@(b->get_identifier(b))});};
  lifespan.api.on_before_close=[](cef_life_span_handler_t*,cef_browser_t*){event(@"closed",@{});closed=true;browser->base.release(&browser->base);browser=nullptr;};
  render.api.get_view_rect=[](cef_render_handler_t*,cef_browser_t*,cef_rect_t*r){*r={0,0,width,height};};
  render.api.get_screen_info=[](cef_render_handler_t*,cef_browser_t*,cef_screen_info_t*i){i->device_scale_factor=deviceScale;i->depth=32;i->depth_per_component=8;i->rect={0,0,width,height};i->available_rect=i->rect;return 1;};
  render.api.on_paint=[](cef_render_handler_t*,cef_browser_t*,cef_paint_element_type_t type,size_t,const cef_rect_t*,const void*buf,int w,int h){if(type==PET_VIEW){frames++;saveFrame(buf,w,h);}}; // stream mode replaces this handler
  display.api.on_title_change=[](cef_display_handler_t*,cef_browser_t*,const cef_string_t*t){NSString*title=ns(t);event(@"title",@{@"title":title});if([title containsString:@"input=CEF"]){inputObserved=true;captureName=@"cef-e0-input.png";}if([title containsString:@"page=2"])navigated=true;};
  display.api.on_address_change=[](cef_display_handler_t*,cef_browser_t*,cef_frame_t*f,const cef_string_t*u){if(f->is_main(f))event(@"url",@{@"url":ns(u)});};
  loading.api.on_load_start=[](cef_load_handler_t*,cef_browser_t*,cef_frame_t*f,cef_transition_type_t){if(f->is_main(f))event(@"load_start",@{@"url":requestString(f->get_url(f))});};
  loading.api.on_loading_state_change=[](cef_load_handler_t*,cef_browser_t*,int active,int back,int forward){event(@"loading_state",@{@"loading":@(active),@"canBack":@(back),@"canForward":@(forward)});};
  loading.api.on_load_end=[](cef_load_handler_t*,cef_browser_t*,cef_frame_t*f,int status){if(f->is_main(f)){loaded=loaded||status==200;captureName=[requestString(f->get_url(f)) hasSuffix:@"?page=2"]?@"cef-e0-page2.png":@"cef-e0-loaded.png";event(@"load",@{@"httpStatus":@(status)});}};
  loading.api.on_load_error=[](cef_load_handler_t*,cef_browser_t*,cef_frame_t*f,cef_errorcode_t code,const cef_string_t*description,const cef_string_t*url){event(@"load_error",@{@"code":@(code),@"mainFrame":@(f->is_main(f)),@"url":ns(url),@"description":ns(description)});};
  if(streaming)configureStream();
}
int main(int argc,char**argv){@autoreleasepool{
  NSString* executable=[NSString stringWithUTF8String:argv[0]];
  NSString* folder=executable.stringByDeletingLastPathComponent;
#ifdef AXIO_CEF_HELPER
  CefScopedSandboxContext sandbox;
  if(!sandbox.Initialize(argc,argv)){fprintf(stderr,"CEF helper sandbox initialization failed\n");return 71;}
  NSString* lib=[folder stringByAppendingPathComponent:@"../../../Chromium Embedded Framework.framework/Chromium Embedded Framework"];
  loadFramework(lib);cef_main_args_t args{argc,argv};
  // Renderer helpers report focused-node kind/bounds for IME placement (input.inc).
  return p_cef_execute_process(&args,rendererApp(),nullptr);
#else
  if(argc!=4){fprintf(stderr,"usage: AxioCEFProbe local-fixture-url private-profile evidence-dir\n");return 64;}
  streaming=strcmp(argv[1],"--stream")==0;
  NSURL*u=streaming?nil:[NSURL URLWithString:[NSString stringWithUTF8String:argv[1]]];
  if(!streaming&&(![u.scheme isEqual:@"http"]||![u.host isEqual:@"127.0.0.1"]||![u.path isEqual:@"/engine.html"]||u.user||u.password)){fprintf(stderr,"only the synthetic local fixture is allowed\n");return 64;}
  evidence=[NSString stringWithUTF8String:argv[3]];if(!streaming)initialURL=utf16(u.absoluteString);
  profilePath=[NSString stringWithUTF8String:argv[2]];
  signal(SIGPIPE,SIG_IGN);
  // Before any CEF code or helper exists: drop exception ports inherited from Zen
  // (Breakpad ignores a foreign task's fault, which parked the faulting thread
  // forever), so a crash ends this process and its helpers at once.
  int inheritedPorts=axio::crash::clearInheritedExceptionPorts();
  fprintf(stderr,"AXIO_CEF_EXCEPTION_PORTS inherited=%d cleared=%s\n",inheritedPorts,inheritedPorts>=0?"yes":"no");
  // Zen gone (even while our main thread is stuck): bounded exit, helpers included.
  if(streaming)axio::crash::watchParent(5,77,^{interrupted=1;});
  if(streaming&&!streamHandshake())return 64;
  loadFramework([folder stringByAppendingPathComponent:@"../Frameworks/Chromium Embedded Framework.framework/Chromium Embedded Framework"]);
  [AxioCEFApplication sharedApplication];[NSApp setActivationPolicy:NSApplicationActivationPolicyProhibited];
  configure();signal(SIGINT,stopSignal);signal(SIGTERM,stopSignal);
  if(streaming)startSurface();
  cef_settings_t settings{};settings.size=sizeof(settings);settings.windowless_rendering_enabled=1;settings.no_sandbox=0;settings.command_line_args_disabled=1;settings.remote_debugging_port=0;
  auto profile=utf16([NSString stringWithUTF8String:argv[2]]);settings.root_cache_path=view(profile);
  auto logpath=utf16([evidence stringByAppendingPathComponent:@"cef-runtime.log"]);settings.log_file=view(logpath);settings.log_severity=LOGSEVERITY_WARNING;
  int cefArgc=1;cef_main_args_t args{cefArgc,argv};
  if(!streaming)event(@"version",@{@"cef":@CEF_VERSION,@"chromium":[NSString stringWithFormat:@"%d.%d.%d.%d",CHROME_VERSION_MAJOR,CHROME_VERSION_MINOR,CHROME_VERSION_BUILD,CHROME_VERSION_PATCH],@"platform":@"macosarm64",@"sandboxConfigured":@YES,@"runtimeChromiumMajor":@(p_cef_version_info(4)),@"runtimeCEF":[NSString stringWithFormat:@"%d.%d.%d",p_cef_version_info(0),p_cef_version_info(1),p_cef_version_info(2)],@"runtimeChromium":[NSString stringWithFormat:@"%d.%d.%d.%d",p_cef_version_info(4),p_cef_version_info(5),p_cef_version_info(6),p_cef_version_info(7)],@"renderPath":@"native-osr-bgra",@"deviceScaleFactor":@2});
  if(!p_cef_initialize(&args,&settings,&app.api,nullptr)){event(@"initialize_failed",@{});return 70;}
  const auto start=std::chrono::steady_clock::now();
  __block int stage=0, exitStatus=0;
  __block bool closing=false;
  __block double firstLoadAt=-1;
  __block auto closeStarted=start;
  __block uint64_t heartbeatSequence=0;
  __block auto nextHeartbeat=std::chrono::steady_clock::time_point{};
  // This separate native process can own CEF's official AppKit message loop.
  // A bounded timer handles our private pipe and synthetic input on its UI thread.
  NSTimer* tick=[NSTimer timerWithTimeInterval:.01 repeats:YES block:^(NSTimer*){
    @autoreleasepool{
      if(closed){p_cef_quit_message_loop();return;}
      double elapsed=std::chrono::duration<double>(std::chrono::steady_clock::now()-start).count();
      if(!streaming&&loaded&&firstLoadAt<0)firstLoadAt=elapsed;
      double exerciseElapsed=firstLoadAt<0?-1:elapsed-firstLoadAt;
      if(streaming){
        pumpCommands();
        if(interrupted||transport.failed()||transport.eof()||surfaceFailed)streamClosing=true;
        if(streamClosing&&!closing){
          closing=true;closeStarted=std::chrono::steady_clock::now();
          // Whatever teardown does (CEF shutdown, Keychain, destructors), exit is bounded:
          // 25 s for a requested shutdown (10 s close + Chromium's own 10 s watchdog),
          // 5 s after EOF, a protocol/surface failure or a signal.
          axio::crash::armExitWatchdog(shutdownRequest?25:5,76,shutdownRequest?"shutdown":"failure");
        }
        // cef-v1 liveness: emitted from this CEF UI-thread timer (not a transport thread), so a
        // frozen or deadlocked UI thread stops it. Never while closing; no catch-up after a stall.
        if(streamReady&&!closing&&!streamClosing&&!transport.failed()){
          auto now=std::chrono::steady_clock::now();
          if(nextHeartbeat==std::chrono::steady_clock::time_point{})nextHeartbeat=now+std::chrono::milliseconds(HeartbeatIntervalMs);
          else if(now>=nextHeartbeat){event(@"heartbeat",@{@"sequence":@(++heartbeatSequence)});nextHeartbeat=now+std::chrono::milliseconds(HeartbeatIntervalMs);}
        }
        if(closing){streamCloseAll();if(streamIdle())closed=true;}
        if(closing&&std::chrono::duration<double>(std::chrono::steady_clock::now()-closeStarted).count()>10){exitStatus=75;p_cef_quit_message_loop();return;}
      }
      if(!streaming&&browser&&!closing){
        auto*h=browser->get_host(browser);
        if(stage==0&&loaded&&exerciseElapsed>2){captureName=@"cef-e0-input.png";h->set_focus(h,1);for(char c:std::string("CEF")){cef_key_event_t k{};k.size=sizeof(k);k.type=KEYEVENT_CHAR;k.character=c;k.unmodified_character=c;h->send_key_event(h,&k);}event(@"native_input_sent",@{@"text":@"CEF"});stage++;}
        else if(stage==1&&exerciseElapsed>4){width=1000;height=700;captureName=@"cef-e0-retina-resize.png";h->was_resized(h);event(@"resize",@{@"widthDIP":@(width),@"heightDIP":@(height)});stage++;}
        else if(stage==2&&exerciseElapsed>6){cef_mouse_event_t m{};m.x=400;m.y=500;h->send_mouse_wheel_event(h,&m,0,-550);captureName=@"cef-e0-scroll.png";event(@"native_scroll_sent",@{});stage++;}
        else if(stage==3&&exerciseElapsed>8){auto*f=browser->get_main_frame(browser);auto next=initialURL+u"?page=2";auto s=view(next);f->load_url(f,&s);f->base.release(&f->base);stage++;}
        else if(stage==4&&exerciseElapsed>10){if(browser->can_go_back(browser)){browser->go_back(browser);event(@"back",@{});}stage++;}
        h->base.release(&h->base);
      }
      if(!streaming&&!closing&&(interrupted||exerciseElapsed>12||elapsed>60)){closing=true;closeBrowser();}
      if(!streaming&&elapsed>85){event(@"timeout",@{@"stage":@(stage)});exitStatus=75;p_cef_quit_message_loop();return;}
    }
  }];
  [[NSRunLoop mainRunLoop] addTimer:tick forMode:NSRunLoopCommonModes];
  p_cef_run_message_loop();
  [tick invalidate];
  if(!streaming)event(@"message_loop_returned",@{@"closed":@(closed)});
  if(!closed)return exitStatus?exitStatus:75; // Outer supervisor cleans only this process group.
  if(isolatedContext){isolatedContext->base.base.release(&isolatedContext->base.base);isolatedContext=nullptr;}
  p_cef_shutdown();
  if(!streaming)event(@"shutdown_returned",@{});
  if(exitStatus)return exitStatus;
  if(streaming){axio::surface::shutdown();if(shutdownRequest)complete(shutdownRequest,@"success");transport.finishEvents(std::chrono::milliseconds(1000));return transport.failed()||surfaceFailed?64:0;}
  event(@"result",@{@"E0":(loaded&&frames>0&&inputObserved&&navigated?@"PASS":@"FAIL"),@"frames":@(frames),@"inputObserved":@(inputObserved),@"navigationObserved":@(navigated),@"elapsedSeconds":@(std::chrono::duration<double>(std::chrono::steady_clock::now()-start).count()),@"E1":@"BLOCKED_ENV",@"E2":@"BLOCKED_ENV"});
  return loaded&&frames>0&&inputObserved&&navigated?0:1;
#endif
}}
