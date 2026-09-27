// Included by host.mm after CEF/refcount helpers. All state below is UI-thread-owned
// except immutable fixtureOrigin and the bounded, synchronized transport itself.
// One host serves every Chromium tab of one Zen profile; each tab owns one target.
#include <map>
static constexpr uint64_t MaxGeneration=9007199254740991ULL;
static constexpr size_t MaxTabs=32;
static uint64_t lastWebRequest=0;
static NSString* profilePath;
struct Tab {
  NSString* key=nil;               // Zen tab_id; stable for this target's lifetime
  NSDictionary* target=nil;
  cef_browser_t* browser=nullptr;
  int width=900,height=650; double scale=2;
  bool paintAllowed=false, closing=false;
  NSString *createRequest=nil,*closeRequest=nil,*navigationRequest=nil;
  bool historyNavigation=false, commandNavigationInvalidated=false, sameDocumentNavigation=false;
  NSString *historyURL=nil,*committedDocumentURL=nil;
  // Loads replaced by a newer command still report ERR_ABORTED; that report is
  // not about the current request. navigateURL is the current request's URL.
  int supersededLoads=0; NSString* navigateURL=nil;
  NSMutableSet* committedURLs=[NSMutableSet set];
  bool popupVisible=false; cef_rect_t popupRect{};
  int popupWidth=0,popupHeight=0,cachedWidth=0,cachedHeight=0;
  std::vector<uint8_t> popupPixels,cachedView;
};
static std::map<std::string,Tab*> tabsByKey;
static std::map<int,Tab*> tabsByBrowser;
static Tab* creating=nullptr;  // CEF creation is asynchronous; one create at a time.
// CEF adds one reference to every ref-counted struct it passes into a C callback;
// the callback owns and must release it. Passing a struct into CEF transfers one.
struct Held {
  cef_base_ref_counted_t* base;
  ~Held(){if(base)base->release(base);}
};
#define HOLD(value) Held held_##value{(value)?&(value)->base:nullptr}
static std::string keyOf(NSString* value){return std::string(value.UTF8String);}
static Tab* tabFor(cef_browser_t* value,bool allowCreating=false){
  if(!value)return nullptr;
  auto found=tabsByBrowser.find(value->get_identifier(value));
  // Only geometry queries arrive before OnAfterCreated for the target in creation.
  return found!=tabsByBrowser.end()?found->second:(allowCreating?creating:nullptr);
}
static void clearPopup(Tab* tab){tab->popupVisible=false;std::vector<uint8_t>().swap(tab->popupPixels);std::vector<uint8_t>().swap(tab->cachedView);}
static std::string json(NSDictionary* value){
  NSData* data=[NSJSONSerialization dataWithJSONObject:value options:NSJSONWritingSortedKeys error:nil];
  return data?std::string((const char*)data.bytes,data.length):std::string();
}
static NSDictionary* object(const std::string& line){
  NSData* data=[NSData dataWithBytes:line.data() length:line.size()];
  id value=[NSJSONSerialization JSONObjectWithData:data options:0 error:nil];
  return [value isKindOfClass:NSDictionary.class]?value:nil;
}
static bool keys(NSDictionary* value,NSArray* expected){
  if(![value isKindOfClass:NSDictionary.class]||value.count!=expected.count)return false;
  for(id key in value)if(![expected containsObject:key])return false;
  return true;
}
static bool integer(id value,uint64_t maximum=MaxGeneration){
  if(![value isKindOfClass:NSNumber.class]||CFGetTypeID((__bridge CFTypeRef)value)==CFBooleanGetTypeID())return false;
  double number=[value doubleValue];return std::isfinite(number)&&number>=0&&number<=maximum&&std::floor(number)==number;
}
static bool signedInteger(id value,int minimum,int maximum){
  if(![value isKindOfClass:NSNumber.class]||CFGetTypeID((__bridge CFTypeRef)value)==CFBooleanGetTypeID())return false;
  double number=[value doubleValue];return std::isfinite(number)&&number>=minimum&&number<=maximum&&std::floor(number)==number;
}
static bool boolean(id value){return value&&CFGetTypeID((__bridge CFTypeRef)value)==CFBooleanGetTypeID();}
static bool textValue(id value,NSUInteger maximum){return [value isKindOfClass:NSString.class]&&[value length]<=maximum;}
static bool identifier(id value){
  if(!textValue(value,128)||![value length])return false;
  return [value rangeOfCharacterFromSet:[[NSCharacterSet characterSetWithCharactersInString:@"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_:/.-"] invertedSet]].location==NSNotFound;
}
static bool tokenValue(id value){
  return textValue(value,64)&&[value length]==64&&[value rangeOfCharacterFromSet:[[NSCharacterSet characterSetWithCharactersInString:@"0123456789abcdefABCDEF"] invertedSet]].location==NSNotFound;
}
static bool equalToken(id value){
  if(!tokenValue(value))return false;
  unsigned difference=0;for(NSUInteger i=0;i<64;i++)difference|=[value characterAtIndex:i]^[streamToken characterAtIndex:i];return difference==0;
}
static NSString* origin(NSURL* url){
  if(![url.scheme isEqual:@"http"]||![url.host isEqual:@"127.0.0.1"]||!url.port||url.port.intValue<1||url.port.intValue>65535||url.user||url.password)return nil;
  return [NSString stringWithFormat:@"http://127.0.0.1:%d",url.port.intValue];
}
static bool webURL(NSString* value,bool resource=false){
  if(!textValue(value,resource?65536:4096)||![value length])return false;
  if([value isEqual:@"about:blank"])return true;
  if([value rangeOfCharacterFromSet:NSCharacterSet.controlCharacterSet].location!=NSNotFound)return false;
  NSURL* url=[NSURL URLWithString:value];
  // Data/blob resources remain under Chromium's normal origin and CSP checks.
  // They are never an initial page, address-bar navigation or external protocol.
  if(resource&&([url.scheme isEqual:@"data"]||[url.scheme isEqual:@"blob"]))return true;
  return ([@[@"http",@"https"] containsObject:url.scheme]&&url.host.length&&!url.user&&!url.password&&
    (!url.port||(url.port.intValue>0&&url.port.intValue<=65535)));
}
static bool webOrigin(NSString* value){
  if(!webURL(value)||[value isEqual:@"about:blank"])return false;
  NSURL* url=[NSURL URLWithString:value];return !url.path.length&&!url.query&&!url.fragment;
}
static bool allowedURL(NSString* value,bool resource=false){
  if(webBrowsing)return webURL(value,resource);
  if(!textValue(value,4096))return false;
  NSURL* url=[NSURL URLWithString:value];
  if(![[origin(url) description] isEqual:fixtureOrigin]||url.fragment)return false;
  return ([url.path isEqual:@"/engine.html"]&&(!url.query||[url.query isEqual:@"page=2"]))||(resource&&[url.path isEqual:@"/favicon.ico"]&&!url.query);
}
static bool fragmentNavigation(Tab* tab,NSString* value){
  if(!webBrowsing||!tab->committedDocumentURL||[value isEqual:tab->committedDocumentURL])return false;
  NSURLComponents* next=[NSURLComponents componentsWithString:value];
  NSURLComponents* previous=[NSURLComponents componentsWithString:tab->committedDocumentURL];
  next.fragment=nil;previous.fragment=nil;return [next.string isEqual:previous.string];
}
static bool validTarget(NSDictionary* value,bool pending){
  NSArray* wanted=pending?@[@"tab_id",@"engine_instance",@"identity",@"document_generation",@"navigation_generation",@"private_mode"]:@[@"tab_id",@"engine",@"engine_instance",@"native_target_id",@"identity",@"document_generation",@"navigation_generation",@"private_mode"];
  // A web host serves many origins; each target names its own. Fixture targets
  // stay bound to the one synthetic origin supplied at the authenticated hello.
  bool identity=webBrowsing?webOrigin(value[@"identity"]):[value[@"identity"] isEqual:fixtureOrigin];
  return keys(value,wanted)&&identifier(value[@"tab_id"])&&identifier(value[@"engine_instance"])&&[value[@"engine_instance"] isEqual:streamInstance]&&identity&&integer(value[@"document_generation"])&&integer(value[@"navigation_generation"])&&boolean(value[@"private_mode"])&&![value[@"private_mode"] boolValue]&&(pending||([value[@"engine"] isEqual:@"chromium"]&&identifier(value[@"native_target_id"])));
}
static void failProtocol(){transport.reject();streamClosing=true;}
static void tabEvent(Tab* tab,NSString* kind,NSDictionary* fields){
  NSMutableDictionary* item=[fields mutableCopy];item[@"event"]=kind;item[@"version"]=@1;
  if(tab->target[@"native_target_id"]&&!item[@"target"])item[@"target"]=tab->target;
  transport.event(json(item));
}
static void complete(NSString* request,NSString* status){event(@"completed",@{@"request_id":request,@"status":status});}
static void unsupported(NSString* request,NSString* reason){event(@"completed",@{@"request_id":request,@"status":@"unsupported",@"reason":reason});}
static bool streamHandshake(){
  if(!transport.start())return false;
  auto deadline=std::chrono::steady_clock::now()+std::chrono::seconds(10);
  while(std::chrono::steady_clock::now()<deadline&&!transport.failed()&&!transport.eof()){
    if(auto line=transport.pop()){
      NSDictionary* hello=object(*line);
      bool web=[hello[@"browsing_mode"] isEqual:@"web"];
      NSArray* fields=web?@[@"version",@"method",@"token",@"engine_instance",@"fixture_origin",@"browsing_mode"]:@[@"version",@"method",@"token",@"engine_instance",@"fixture_origin"];
      if(!keys(hello,fields)||!integer(hello[@"version"],1)||[hello[@"version"] intValue]!=1||![hello[@"method"] isEqual:@"hello"]||!tokenValue(hello[@"token"])||!identifier(hello[@"engine_instance"])||!textValue(hello[@"fixture_origin"],web?4096:128))return false;
      NSURL* url=[NSURL URLWithString:hello[@"fixture_origin"]];
      if((web?!webURL(hello[@"fixture_origin"]):![origin(url) isEqual:hello[@"fixture_origin"]])||url.path.length||url.query||url.fragment||[url.scheme isEqual:@"about"])return false;
      streamToken=hello[@"token"];streamInstance=hello[@"engine_instance"];fixtureOrigin=hello[@"fixture_origin"];webBrowsing=web;requestIds=[NSMutableSet set];return true;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
  }
  return false;
}
static void streamReadyEvent(){
  // These values are queried from the loaded framework, not merely headers.
  NSString* runtimeCEF=[NSString stringWithFormat:@"%d.%d.%d",p_cef_version_info(0),p_cef_version_info(1),p_cef_version_info(2)];
  NSString* runtimeChromium=[NSString stringWithFormat:@"%d.%d.%d.%d",p_cef_version_info(4),p_cef_version_info(5),p_cef_version_info(6),p_cef_version_info(7)];
  event(@"ready",@{@"cef":@CEF_VERSION,@"chromium":runtimeChromium,@"runtime_cef":runtimeCEF,@"runtime_chromium":runtimeChromium,@"platform":@"macosarm64",@"sandbox_configured":@YES,@"engine_instance":streamInstance,@"render_path":@"native-osr-bgra",@"capabilities":@{@"observe":@YES,@"navigate":@YES,@"back":@YES,@"forward":@YES,@"reload":@YES,@"stop":@YES,@"close":@YES,@"input":@YES,@"edit":@YES,@"visibility":@YES,@"cursor":@YES,@"multi_target":@YES,@"max_targets":@(MaxTabs),@"persistent_profile":@(webBrowsing),@"open_in_tab":@(webBrowsing),@"devtools":@NO,@"ime":@NO,@"private_mode":@NO,@"fixture_only":@(!webBrowsing),@"permissions":@NO,@"downloads":@NO,@"popups":@NO,@"accessibility":@NO,@"file_dialogs":@NO,@"javascript_dialogs":@NO}});
}
static bool surface(id w,id h,id scale){
  if(!integer(w,4096)||!integer(h,4096)||![w intValue]||![h intValue]||![scale isKindOfClass:NSNumber.class]||CFGetTypeID((__bridge CFTypeRef)scale)==CFBooleanGetTypeID())return false;
  double d=[scale doubleValue];return std::isfinite(d)&&d>=1&&d<=4;
}
static bool fitsSurface(id w,id h,id scale){
  double pw=std::ceil([w doubleValue]*[scale doubleValue]),ph=std::ceil([h doubleValue]*[scale doubleValue]);
  return pw<=4096&&ph<=4096&&pw*ph*4<=axio::MaxFrame;
}
static void streamFrame(Tab* tab,const void* pixels,int w,int h){
  if(!tab->target[@"native_target_id"]||!tab->paintAllowed||tab->closing||streamClosing)return;
  if(w<=0||h<=0||w>4096||h>4096||uint64_t(w)*h*4>axio::MaxFrame){tabEvent(tab,@"error",@{@"code":@"unsupported_surface"});tab->paintAllowed=false;return;}
  // A queued old-size paint can arrive after WasResized; do not relabel it.
  if(w!=int(std::ceil(tab->width*tab->scale))||h!=int(std::ceil(tab->height*tab->scale)))return;
  if(frameId==MaxGeneration){failProtocol();return;}
  NSDictionary* metadata=@{@"version":@1,@"target":tab->target,@"frame_id":@(++frameId),@"width":@(w),@"height":@(h),@"stride":@(w*4),@"device_scale":@(tab->scale),@"format":@"BGRA8"};
  transport.frame(keyOf(tab->key),json(metadata),json(tab->target),frameId,pixels,size_t(w)*h*4);
}
static void compositePopup(Tab* tab){
  if(tab->cachedView.empty()||tab->popupPixels.empty()||!tab->popupVisible)return;
  std::vector<uint8_t> composite=tab->cachedView;
  int left=int(std::round(tab->popupRect.x*tab->scale)),top=int(std::round(tab->popupRect.y*tab->scale));
  int startX=std::max(0,-left),startY=std::max(0,-top);
  int endX=std::min(tab->popupWidth,tab->cachedWidth-left),endY=std::min(tab->popupHeight,tab->cachedHeight-top);
  for(int y=startY;y<endY;y++)if(endX>startX)
    memcpy(composite.data()+(size_t(y+top)*tab->cachedWidth+left+startX)*4,
      tab->popupPixels.data()+(size_t(y)*tab->popupWidth+startX)*4,size_t(endX-startX)*4);
  streamFrame(tab,composite.data(),tab->cachedWidth,tab->cachedHeight);
}
static void streamSurfacePaint(Tab* tab,cef_paint_element_type_t type,const void* pixels,int w,int h){
  if(w<=0||h<=0||w>4096||h>4096||uint64_t(w)*h*4>axio::MaxFrame)return;
  if(type==PET_VIEW){
    if(!tab->popupVisible){streamFrame(tab,pixels,w,h);return;}
    tab->cachedWidth=w;tab->cachedHeight=h;tab->cachedView.assign((const uint8_t*)pixels,(const uint8_t*)pixels+size_t(w)*h*4);
    if(tab->popupPixels.empty())streamFrame(tab,pixels,w,h);else compositePopup(tab);
  }else if(type==PET_POPUP&&tab->popupVisible&&uint64_t(w)*h*4<=8*1024*1024){
    tab->popupWidth=w;tab->popupHeight=h;tab->popupPixels.assign((const uint8_t*)pixels,(const uint8_t*)pixels+size_t(w)*h*4);compositePopup(tab);
  }
}
static NSString* requestString(cef_string_userfree_t value){NSString* result=ns(value);p_cef_string_userfree_utf16_free(value);return result;}
static void resetNavigation(Tab* tab){tab->historyNavigation=false;tab->historyURL=nil;tab->commandNavigationInvalidated=false;tab->sameDocumentNavigation=false;tab->navigateURL=nil;}
static void invalidateNavigation(Tab* tab){
  uint64_t document=[tab->target[@"document_generation"] unsignedLongLongValue],navigation=[tab->target[@"navigation_generation"] unsignedLongLongValue];
  if(document==MaxGeneration||navigation==MaxGeneration){failProtocol();return;}
  NSMutableDictionary* next=[tab->target mutableCopy];next[@"document_generation"]=@(document+1);next[@"navigation_generation"]=@(navigation+1);tab->target=[next copy];
  tab->paintAllowed=false;clearPopup(tab);transport.invalidatePendingFrame(keyOf(tab->key));tabEvent(tab,@"navigation",@{});
}
static void invalidateView(cef_browser_t* value){auto* host=value->get_host(value);host->invalidate(host,PET_VIEW);host->base.release(&host->base);}
static void restoreCancelledDocument(Tab* tab,cef_browser_t* value){
  if(!webBrowsing||!tab->committedDocumentURL)return;
  auto* frame=value->get_main_frame(value);NSString* actual=requestString(frame->get_url(frame));frame->base.release(&frame->base);
  if(![actual isEqual:tab->committedDocumentURL]||!allowedURL(actual))return;
  // The cancelled candidate never replaced this committed document. Its target
  // generation remains revoked, but the actual retained page can paint again.
  tab->paintAllowed=true;tabEvent(tab,@"url",@{@"url":actual});
  tabEvent(tab,@"load",@{@"http_status":@0,@"restored_from_history":@NO,@"same_document":@YES});
  invalidateView(value);
}
static void closeTab(Tab* tab){
  tab->closing=true;tab->paintAllowed=false;transport.invalidatePendingFrame(keyOf(tab->key));
  if(tab->browser){auto*h=tab->browser->get_host(tab->browser);h->close_browser(h,0);h->base.release(&h->base);}
}
// Called from the UI tick. Shutdown closes every target before the loop exits.
static void streamCloseAll(){
  std::vector<Tab*> open;for(auto& item:tabsByKey)if(!item.second->closing)open.push_back(item.second);
  for(Tab* tab:open)closeTab(tab); // CEF may finish a close synchronously and erase it
}
static bool streamIdle(){return tabsByKey.empty()&&!creating;}
static void streamCommand(const std::string& line){
  NSDictionary* command=object(line);NSString* method=command[@"method"],*requestId=command[@"request_id"];
  if(!integer(command[@"version"],1)||[command[@"version"] intValue]!=1||!equalToken(command[@"token"])||!identifier(requestId)||!textValue(method,32)){failProtocol();return;}
  if(webBrowsing){
    // A long-lived 30 fps tab can send >100,000 ACKs per hour. Monotonic IDs
    // reject replay with constant memory and no short session lifetime limit.
    if(![requestId hasPrefix:@"cef-"]){failProtocol();return;}
    NSString* digits=[requestId substringFromIndex:4];
    if(!digits.length||digits.length>16||[digits hasPrefix:@"0"]||[digits rangeOfCharacterFromSet:[[NSCharacterSet decimalDigitCharacterSet] invertedSet]].location!=NSNotFound){failProtocol();return;}
    uint64_t sequence=strtoull(digits.UTF8String,nullptr,10);
    if(sequence<=lastWebRequest||sequence>MaxGeneration){failProtocol();return;}lastWebRequest=sequence;
  }else{
    if([requestIds containsObject:requestId]||requestIds.count>=100000){failProtocol();return;}[requestIds addObject:requestId];
  }
  NSDictionary* extra=@{@"create":@[@"url",@"width",@"height",@"device_scale"],@"navigate":@[@"url"],@"back":@[],@"forward":@[],@"reload":@[],@"stop":@[],@"resize":@[@"width",@"height",@"device_scale"],@"focus":@[@"focused"],@"visibility":@[@"visible"],@"edit":@[@"action"],@"key":@[@"type",@"native_key_code",@"windows_key_code",@"modifiers",@"text"],@"mouse":@[@"type",@"x",@"y",@"modifiers",@"button",@"click_count",@"mouse_leave"],@"wheel":@[@"x",@"y",@"modifiers",@"delta_x",@"delta_y"],@"frame_ack":@[@"frame_id"],@"close":@[],@"shutdown":@[],@"devtools":@[]};
  NSArray* fields=extra[method];if(!fields){failProtocol();return;}
  NSMutableArray* expected=[@[@"version",@"method",@"request_id",@"token"] mutableCopy];
  if(![method isEqual:@"shutdown"])[expected addObject:@"target"];
  [expected addObjectsFromArray:fields];if(!keys(command,expected)){failProtocol();return;}
  if([method isEqual:@"shutdown"]){event(@"accepted",@{@"request_id":requestId});shutdownRequest=requestId;streamClosing=true;return;}
  bool creating_=[method isEqual:@"create"];
  NSDictionary* supplied=command[@"target"];
  if(!validTarget(supplied,creating_)){failProtocol();return;}
  if([method isEqual:@"frame_ack"]){
    // Exact outstanding target is intentionally used instead of current target:
    // discarded stale frames also need to release their one transport credit.
    if(!integer(command[@"frame_id"])||!transport.acknowledge([command[@"frame_id"] unsignedLongLongValue],json(supplied))){failProtocol();return;}
    return;
  }
  auto found=tabsByKey.find(keyOf(supplied[@"tab_id"]));
  Tab* tab=found==tabsByKey.end()?nullptr:found->second;
  if(creating_){
    if(tab||creating||!streamReady||streamClosing){event(@"error",@{@"request_id":requestId,@"code":@"invalid_lifecycle"});return;}
    if(tabsByKey.size()>=MaxTabs){unsupported(requestId,@"target_limit");return;}
    if(!allowedURL(command[@"url"])||!surface(command[@"width"],command[@"height"],command[@"device_scale"])){failProtocol();return;}
    if(!fitsSurface(command[@"width"],command[@"height"],command[@"device_scale"])){unsupported(requestId,@"surface_limit");return;}
    tab=new Tab();tab->key=supplied[@"tab_id"];tab->target=[supplied copy];tab->createRequest=requestId;
    tab->width=[command[@"width"] intValue];tab->height=[command[@"height"] intValue];tab->scale=[command[@"device_scale"] doubleValue];
    creating=tab;tabsByKey[keyOf(tab->key)]=tab;
    cef_window_info_t wi{};wi.size=sizeof(wi);wi.windowless_rendering_enabled=1;wi.runtime_style=CEF_RUNTIME_STYLE_ALLOY;
    cef_browser_settings_t settings{};settings.size=sizeof(settings);settings.windowless_frame_rate=30;
    auto value=utf16(command[@"url"]);auto url=view(value);
    event(@"accepted",@{@"request_id":requestId});
    isolatedContext->base.base.add_ref(&isolatedContext->base.base); // CEF takes this reference
    if(!p_cef_browser_host_create_browser(&wi,client.retain(),&url,&settings,nullptr,isolatedContext)){
      complete(requestId,@"failed");creating=nullptr;tabsByKey.erase(keyOf(tab->key));delete tab;
    }
    return;
  }
  if(!tab||![tab->target isEqualToDictionary:supplied]){event(@"error",@{@"request_id":requestId,@"code":@"stale_target"});return;}
  if(!tab->browser||tab->closing||streamClosing){event(@"error",@{@"request_id":requestId,@"code":@"closed_target"});return;}
  cef_browser_t* browser=tab->browser;
  if([method isEqual:@"devtools"]){unsupported(requestId,@"devtools_not_integrated");return;}
  if([method isEqual:@"navigate"]&&!allowedURL(command[@"url"])){failProtocol();return;}
  if([method isEqual:@"resize"]){
    if(!surface(command[@"width"],command[@"height"],command[@"device_scale"])){failProtocol();return;}
    if(!fitsSurface(command[@"width"],command[@"height"],command[@"device_scale"])){unsupported(requestId,@"surface_limit");return;}
  }
  if([method isEqual:@"focus"]&&!boolean(command[@"focused"])){failProtocol();return;}
  if([method isEqual:@"visibility"]&&!boolean(command[@"visible"])){failProtocol();return;}
  if([method isEqual:@"edit"]&&![@[@"copy",@"cut",@"paste",@"select_all",@"undo",@"redo"] containsObject:command[@"action"]]){failProtocol();return;}
  if([method isEqual:@"key"]&&(![@[@"down",@"up",@"char"] containsObject:command[@"type"]]||!integer(command[@"native_key_code"],65535)||!integer(command[@"windows_key_code"],255)||!integer(command[@"modifiers"],131071)||!textValue(command[@"text"],4))){failProtocol();return;}
  if([method isEqual:@"mouse"]||[method isEqual:@"wheel"]){
    if(!integer(command[@"x"],tab->width)||!integer(command[@"y"],tab->height)||!integer(command[@"modifiers"],131071)){failProtocol();return;}
    if([method isEqual:@"mouse"]&&(![@[@"move",@"down",@"up"] containsObject:command[@"type"]]||![@[@"left",@"middle",@"right"] containsObject:command[@"button"]]||!integer(command[@"click_count"],3)||![command[@"click_count"] intValue]||!boolean(command[@"mouse_leave"]))){failProtocol();return;}
    if([method isEqual:@"wheel"]&&(!signedInteger(command[@"delta_x"],-4096,4096)||!signedInteger(command[@"delta_y"],-4096,4096))){failProtocol();return;}
  }
  bool navigation=[@[@"navigate",@"back",@"forward",@"reload"] containsObject:method];
  if(([method isEqual:@"back"]&&!browser->can_go_back(browser))||([method isEqual:@"forward"]&&!browser->can_go_forward(browser))){unsupported(requestId,@"history_boundary");return;}
  if(navigation&&tab->navigationRequest){
    // A newer explicit navigation replaces a slow one, as in any browser. The
    // replaced request completes without success; nothing is replayed.
    unsupported(tab->navigationRequest,@"NAVIGATION_SUPERSEDED");tab->navigationRequest=nil;resetNavigation(tab);tab->supersededLoads++;
  }
  event(@"accepted",@{@"request_id":requestId});
  auto* host=browser->get_host(browser);
  if(navigation){
    tab->navigationRequest=requestId;tab->historyNavigation=[method isEqual:@"back"]||[method isEqual:@"forward"];tab->historyURL=nil;
    tab->sameDocumentNavigation=[method isEqual:@"navigate"]&&fragmentNavigation(tab,command[@"url"]);
    tab->navigateURL=[method isEqual:@"navigate"]?command[@"url"]:nil;
    // BFCache restores can skip OnBeforeBrowse entirely. Revoke the previous
    // document before dispatching every accepted browser-issued navigation.
    invalidateNavigation(tab);tab->commandNavigationInvalidated=true;
    if(transport.failed()){host->base.release(&host->base);return;}
  }
  if([method isEqual:@"navigate"]){auto* frame=browser->get_main_frame(browser);auto value=utf16(command[@"url"]);auto url=view(value);frame->load_url(frame,&url);frame->base.release(&frame->base);}
  else if([method isEqual:@"back"])browser->go_back(browser);
  else if([method isEqual:@"forward"])browser->go_forward(browser);
  else if([method isEqual:@"reload"])browser->reload(browser);
  else if([method isEqual:@"stop"])browser->stop_load(browser);
  else if([method isEqual:@"resize"]){tab->width=[command[@"width"] intValue];tab->height=[command[@"height"] intValue];tab->scale=[command[@"device_scale"] doubleValue];transport.invalidatePendingFrame(keyOf(tab->key));host->notify_screen_info_changed(host);host->was_resized(host);}
  else if([method isEqual:@"focus"])host->set_focus(host,[command[@"focused"] boolValue]);
  else if([method isEqual:@"visibility"]){bool visible=[command[@"visible"] boolValue];host->was_hidden(host,!visible);if(visible)host->invalidate(host,PET_VIEW);else transport.invalidatePendingFrame(keyOf(tab->key));}
  else if([method isEqual:@"edit"]){
    auto* frame=browser->get_focused_frame(browser);
    if(!frame){host->base.release(&host->base);unsupported(requestId,@"no_focused_frame");return;}
    NSString* action=command[@"action"];
    if([action isEqual:@"copy"])frame->copy(frame);else if([action isEqual:@"cut"])frame->cut(frame);
    else if([action isEqual:@"paste"])frame->paste(frame);else if([action isEqual:@"select_all"])frame->select_all(frame);
    else if([action isEqual:@"undo"])frame->undo(frame);else if([action isEqual:@"redo"])frame->redo(frame);
    frame->base.release(&frame->base);
  }
  else if([method isEqual:@"key"]){
    cef_key_event_t key{};key.size=sizeof(key);NSString* type=command[@"type"],*text=command[@"text"];
    key.type=[type isEqual:@"char"]?KEYEVENT_CHAR:([type isEqual:@"down"]?KEYEVENT_RAWKEYDOWN:KEYEVENT_KEYUP);
    key.native_key_code=[command[@"native_key_code"] intValue];key.windows_key_code=[command[@"windows_key_code"] intValue];key.modifiers=[command[@"modifiers"] unsignedIntValue];
    if(key.type==KEYEVENT_CHAR){for(NSUInteger i=0;i<text.length;i++){key.character=[text characterAtIndex:i];key.unmodified_character=key.character;host->send_key_event(host,&key);}}
    else {if(text.length){key.character=[text characterAtIndex:0];key.unmodified_character=key.character;}host->send_key_event(host,&key);}
  }else if([method isEqual:@"mouse"]||[method isEqual:@"wheel"]){
    cef_mouse_event_t mouse{};mouse.x=[command[@"x"] intValue];mouse.y=[command[@"y"] intValue];mouse.modifiers=[command[@"modifiers"] unsignedIntValue];
    if([method isEqual:@"wheel"])host->send_mouse_wheel_event(host,&mouse,[command[@"delta_x"] intValue],[command[@"delta_y"] intValue]);
    else if([command[@"type"] isEqual:@"move"])host->send_mouse_move_event(host,&mouse,[command[@"mouse_leave"] boolValue]);
    else {cef_mouse_button_type_t button=[command[@"button"] isEqual:@"left"]?MBT_LEFT:([command[@"button"] isEqual:@"right"]?MBT_RIGHT:MBT_MIDDLE);host->send_mouse_click_event(host,&mouse,button,[command[@"type"] isEqual:@"up"],[command[@"click_count"] intValue]);}
  }else if([method isEqual:@"close"]){tab->closeRequest=requestId;host->base.release(&host->base);closeTab(tab);return;}
  host->base.release(&host->base);
  if(!navigation)complete(requestId,@"success");
}
static NSString* cursorName(cef_cursor_type_t type){
  switch(type){
    case CT_HAND:return @"pointer"; case CT_IBEAM:return @"text"; case CT_VERTICALTEXT:return @"vertical-text";
    case CT_WAIT:return @"wait"; case CT_PROGRESS:return @"progress"; case CT_HELP:return @"help";
    case CT_CROSS:return @"crosshair"; case CT_MOVE:return @"move"; case CT_NOTALLOWED:case CT_NODROP:case CT_DND_NONE:return @"not-allowed";
    case CT_GRAB:return @"grab"; case CT_GRABBING:return @"grabbing"; case CT_CONTEXTMENU:return @"context-menu";
    case CT_CELL:return @"cell"; case CT_ALIAS:case CT_DND_LINK:return @"alias"; case CT_COPY:case CT_DND_COPY:return @"copy";
    case CT_ZOOMIN:return @"zoom-in"; case CT_NONE:return @"none";
    case CT_EASTRESIZE:case CT_WESTRESIZE:case CT_EASTWESTRESIZE:case CT_COLUMNRESIZE:return @"ew-resize";
    case CT_NORTHRESIZE:case CT_SOUTHRESIZE:case CT_NORTHSOUTHRESIZE:case CT_ROWRESIZE:return @"ns-resize";
    case CT_NORTHEASTRESIZE:case CT_SOUTHWESTRESIZE:case CT_NORTHEASTSOUTHWESTRESIZE:return @"nesw-resize";
    case CT_NORTHWESTRESIZE:case CT_SOUTHEASTRESIZE:case CT_NORTHWESTSOUTHEASTRESIZE:return @"nwse-resize";
    default:return @"default";
  }
}
static void openInTab(Tab* tab,const cef_string_t* value,bool background){
  NSString* url=ns(value);
  // The new Zen tab starts its own Chromium target in this same profile. It is
  // never a native window, and non-web schemes remain denied.
  if(webBrowsing&&allowedURL(url)&&![url isEqual:@"about:blank"])tabEvent(tab,@"open_url",@{@"url":url,@"background":@(background)});
  else tabEvent(tab,@"error",@{@"code":@"popup_denied"});
}
static void configureStream(){
  render.api.get_view_rect=[](cef_render_handler_t*,cef_browser_t* value,cef_rect_t* r){HOLD(value);Tab* tab=tabFor(value,true);*r={0,0,tab?tab->width:900,tab?tab->height:650};};
  render.api.get_screen_info=[](cef_render_handler_t*,cef_browser_t* value,cef_screen_info_t* i){
    HOLD(value);Tab* tab=tabFor(value,true);int w=tab?tab->width:900,h=tab?tab->height:650;
    i->device_scale_factor=tab?tab->scale:2;i->depth=32;i->depth_per_component=8;i->rect={0,0,w,h};i->available_rect=i->rect;return 1;
  };
  render.api.on_paint=[](cef_render_handler_t*,cef_browser_t* value,cef_paint_element_type_t type,size_t,const cef_rect_t*,const void* pixels,int w,int h){HOLD(value);if(Tab* tab=tabFor(value))streamSurfacePaint(tab,type,pixels,w,h);};
  render.api.on_popup_size=[](cef_render_handler_t*,cef_browser_t* value,const cef_rect_t* rect){HOLD(value);if(Tab* tab=tabFor(value))tab->popupRect=*rect;};
  render.api.on_popup_show=[](cef_render_handler_t*,cef_browser_t* value,int show){
    HOLD(value);Tab* tab=tabFor(value);if(!tab)return;
    clearPopup(tab);tab->popupVisible=show;invalidateView(value);
  };
  display.api.on_cursor_change=[](cef_display_handler_t*,cef_browser_t* value,cef_cursor_handle_t,cef_cursor_type_t type,const cef_cursor_info_t*){
    HOLD(value);if(Tab* tab=tabFor(value))tabEvent(tab,@"cursor",@{@"cursor":cursorName(type)});
    return 1;
  };
  loading.api.on_load_start=[](cef_load_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_transition_type_t){
    HOLD(value);HOLD(frame);Tab* tab=tabFor(value);if(!tab||!frame->is_main(frame))return;NSString* url=requestString(frame->get_url(frame));
    tab->historyURL=tab->historyNavigation&&tab->navigationRequest&&[tab->committedURLs containsObject:url]?url:nil;
    tabEvent(tab,@"url",@{@"url":url});
  };
  lifespan.api.on_after_created=[](cef_life_span_handler_t*,cef_browser_t* value){
    HOLD(value);Tab* tab=creating;creating=nullptr;
    if(!tab){auto* h=value->get_host(value);h->close_browser(h,1);h->base.release(&h->base);return;}
    tab->browser=value;value->base.add_ref(&value->base);tabsByBrowser[value->get_identifier(value)]=tab;
    NSMutableDictionary* full=[tab->target mutableCopy];full[@"engine"]=@"chromium";full[@"native_target_id"]=[NSString stringWithFormat:@"%d",value->get_identifier(value)];tab->target=[full copy];
    tabEvent(tab,@"created",@{@"request_id":tab->createRequest});complete(tab->createRequest,@"success");tab->createRequest=nil;
    if(streamClosing||tab->closing)closeTab(tab);
  };
  lifespan.api.on_before_close=[](cef_life_span_handler_t*,cef_browser_t* value){
    HOLD(value);Tab* tab=tabFor(value);if(!tab||tab==creating)return;
    tab->paintAllowed=false;transport.invalidatePendingFrame(keyOf(tab->key));tabEvent(tab,@"closed",@{});
    if(tab->closeRequest){complete(tab->closeRequest,@"success");tab->closeRequest=nil;}
    if(tab->navigationRequest){complete(tab->navigationRequest,@"failed");tab->navigationRequest=nil;}
    tabsByBrowser.erase(value->get_identifier(value));tabsByKey.erase(keyOf(tab->key));
    tab->browser->base.release(&tab->browser->base);delete tab;
    // Fixture probes own one target: its close ends the host. A web host lives
    // until shutdown or its authenticated pipe closes.
    if(streamIdle()&&(streamClosing||!webBrowsing))closed=true;
  };
  lifespan.api.on_before_popup=[](cef_life_span_handler_t*,cef_browser_t* value,cef_frame_t* frame,int,const cef_string_t* url,const cef_string_t*,cef_window_open_disposition_t disposition,int gesture,const cef_popup_features_t*,cef_window_info_t*,cef_client_t**,cef_browser_settings_t*,cef_dictionary_value_t**,int*){
    HOLD(value);HOLD(frame);Tab* tab=tabFor(value);if(!tab)return 1;
    if(gesture)openInTab(tab,url,disposition==CEF_WOD_NEW_BACKGROUND_TAB);
    else tabEvent(tab,@"error",@{@"code":@"popup_denied"});
    return 1;
  };
  request.api.on_before_browse=[](cef_request_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_request_t* candidate,int,int){
    HOLD(value);HOLD(frame);HOLD(candidate);Tab* tab=tabFor(value);if(!tab)return 1;
    NSString* url=requestString(candidate->get_url(candidate)),*method=requestString(candidate->get_method(candidate));
    if(!allowedURL(url,!frame->is_main(frame))||(!webBrowsing&&![method isEqual:@"GET"])){tabEvent(tab,@"error",@{@"code":@"navigation_denied"});return 1;}
    if(frame->is_main(frame)){
      tab->sameDocumentNavigation=tab->sameDocumentNavigation||fragmentNavigation(tab,url);
      if(!tab->commandNavigationInvalidated)invalidateNavigation(tab);
    }return transport.failed()?1:0;
  };
  request.api.on_open_urlfrom_tab=[](cef_request_handler_t*,cef_browser_t* value,cef_frame_t* frame,const cef_string_t* url,cef_window_open_disposition_t disposition,int gesture){
    HOLD(value);HOLD(frame);Tab* tab=tabFor(value);if(!tab)return 1;
    if(webBrowsing&&disposition==CEF_WOD_CURRENT_TAB&&allowedURL(ns(url)))return 0;
    if(gesture&&(disposition==CEF_WOD_NEW_FOREGROUND_TAB||disposition==CEF_WOD_NEW_BACKGROUND_TAB))openInTab(tab,url,disposition==CEF_WOD_NEW_BACKGROUND_TAB);
    else tabEvent(tab,@"error",@{@"code":@"popup_denied"});
    return 1;
  };
  request.api.get_resource_request_handler=[](cef_request_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_request_t* candidate,int,int,const cef_string_t*,int*){
    HOLD(value);HOLD(frame);HOLD(candidate);return resources.retain();
  };
  resources.api.on_before_resource_load=[](cef_resource_request_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_request_t* candidate,cef_callback_t* callback){
    HOLD(value);HOLD(frame);HOLD(candidate);HOLD(callback);
    @autoreleasepool{NSString* url=requestString(candidate->get_url(candidate)),*method=requestString(candidate->get_method(candidate));return allowedURL(url,true)&&(webBrowsing||[method isEqual:@"GET"])?RV_CONTINUE:RV_CANCEL;}
  };
  resources.api.on_protocol_execution=[](cef_resource_request_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_request_t* candidate,int* allow){HOLD(value);HOLD(frame);HOLD(candidate);*allow=0;};
  request.api.on_certificate_error=[](cef_request_handler_t*,cef_browser_t* value,cef_errorcode_t code,const cef_string_t*,cef_sslinfo_t* info,cef_callback_t* callback){
    HOLD(value);HOLD(info);HOLD(callback);
    if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"certificate_error",@"native_code":@(code)});
    return 0;
  };
  // No native password/client-certificate selector may escape the Zen surface.
  // HTTP auth is canceled on the IO thread without logging credentials/realms.
  request.api.get_auth_credentials=[](cef_request_handler_t*,cef_browser_t* value,const cef_string_t*,int,const cef_string_t*,int,const cef_string_t*,const cef_string_t*,cef_auth_callback_t* callback){HOLD(value);HOLD(callback);return 0;};
  request.api.on_select_client_certificate=[](cef_request_handler_t*,cef_browser_t* value,int,const cef_string_t*,int,size_t count,cef_x509_certificate_t* const* certificates,cef_select_client_certificate_callback_t* callback){
    HOLD(value);HOLD(callback);
    for(size_t i=0;i<count;i++)if(certificates[i])certificates[i]->base.release(&certificates[i]->base);
    if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"client_certificate_unavailable"});
    callback->select(callback,nullptr);return 1;
  };
  permissions.api.on_request_media_access_permission=[](cef_permission_handler_t*,cef_browser_t* value,cef_frame_t* frame,const cef_string_t*,uint32_t,cef_media_access_callback_t* callback){
    HOLD(value);HOLD(frame);HOLD(callback);
    if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"permission_denied"});
    callback->cancel(callback);return 1;
  };
  permissions.api.on_show_permission_prompt=[](cef_permission_handler_t*,cef_browser_t* value,uint64_t,const cef_string_t*,uint32_t,cef_permission_prompt_callback_t* callback){
    HOLD(value);HOLD(callback);
    if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"permission_denied"});
    callback->cont(callback,CEF_PERMISSION_RESULT_DENY);return 1;
  };
  client.api.get_download_handler=[](cef_client_t*){return downloads.retain();};
  downloads.api.can_download=[](cef_download_handler_t*,cef_browser_t* value,const cef_string_t*,const cef_string_t*){
    HOLD(value);if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"download_denied"});
    return 0;
  };
  downloads.api.on_before_download=[](cef_download_handler_t*,cef_browser_t* value,cef_download_item_t* item,const cef_string_t*,cef_before_download_callback_t* callback){HOLD(value);HOLD(item);HOLD(callback);return 0;};
  downloads.api.on_download_updated=[](cef_download_handler_t*,cef_browser_t* value,cef_download_item_t* item,cef_download_item_callback_t* callback){HOLD(value);HOLD(item);HOLD(callback);callback->cancel(callback);};
  client.api.get_context_menu_handler=[](cef_client_t*){return contextMenu.retain();};
  contextMenu.api.on_before_context_menu=[](cef_context_menu_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_context_menu_params_t* params,cef_menu_model_t* model){HOLD(value);HOLD(frame);HOLD(params);HOLD(model);model->clear(model);};
  client.api.get_dialog_handler=[](cef_client_t*){return dialogs.retain();};
  dialogs.api.on_file_dialog=[](cef_dialog_handler_t*,cef_browser_t* value,cef_file_dialog_mode_t,const cef_string_t*,const cef_string_t*,cef_string_list_t,cef_string_list_t,cef_string_list_t,cef_file_dialog_callback_t* callback){
    HOLD(value);HOLD(callback);
    if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"file_dialog_unavailable"});
    callback->cancel(callback);return 1;
  };
  client.api.get_jsdialog_handler=[](cef_client_t*){return jsDialogs.retain();};
  jsDialogs.api.on_jsdialog=[](cef_jsdialog_handler_t*,cef_browser_t* value,const cef_string_t*,cef_jsdialog_type_t,const cef_string_t*,const cef_string_t*,cef_jsdialog_callback_t* callback,int* suppress){
    HOLD(value);HOLD(callback);
    if(Tab* tab=tabFor(value))tabEvent(tab,@"error",@{@"code":@"javascript_dialog_unavailable"});
    *suppress=1;return 0;
  };
  jsDialogs.api.on_before_unload_dialog=[](cef_jsdialog_handler_t*,cef_browser_t* value,const cef_string_t*,int,cef_jsdialog_callback_t* callback){
    HOLD(value);HOLD(callback);Tab* tab=tabFor(value);bool leave=streamClosing||(tab&&tab->closing);
    if(tab)tabEvent(tab,@"error",@{@"code":@"before_unload_confirmation_unavailable"});
    callback->cont(callback,leave?1:0,nullptr);if(tab&&!leave)restoreCancelledDocument(tab,value);return 1;
  };
  display.api.on_title_change=[](cef_display_handler_t*,cef_browser_t* value,const cef_string_t* title_){
    HOLD(value);Tab* tab=tabFor(value);if(!tab)return;NSString* title=ns(title_);
    tabEvent(tab,@"title",@{@"title":[title substringToIndex:MIN(title.length,1024)]});
  };
  display.api.on_address_change=[](cef_display_handler_t*,cef_browser_t* value,cef_frame_t* frame,const cef_string_t* address){
    HOLD(value);HOLD(frame);Tab* tab=tabFor(value);if(!tab||!frame->is_main(frame))return;NSString* url=ns(address);
    // CEF does not send load callbacks for pushState or fragment navigation.
    // Revoke the old target, then explicitly label this already-committed page.
    bool sameDocument=webBrowsing&&allowedURL(url)&&tab->committedDocumentURL&&
      (tab->sameDocumentNavigation||(tab->paintAllowed&&![url isEqual:tab->committedDocumentURL]));
    if(sameDocument){
      if(!tab->sameDocumentNavigation)invalidateNavigation(tab);
      tab->committedDocumentURL=url;tab->paintAllowed=true;
      tabEvent(tab,@"url",@{@"url":url});tabEvent(tab,@"load",@{@"http_status":@0,@"restored_from_history":@NO,@"same_document":@YES});
      if(tab->navigationRequest){complete(tab->navigationRequest,@"success");tab->navigationRequest=nil;}
      resetNavigation(tab);invalidateView(value);
    }else tabEvent(tab,@"url",@{@"url":url});
  };
  loading.api.on_loading_state_change=[](cef_load_handler_t*,cef_browser_t* value,int isLoading,int canBack,int canForward){
    HOLD(value);if(Tab* tab=tabFor(value))tabEvent(tab,@"loading",@{@"loading":@(bool(isLoading)),@"can_go_back":@(bool(canBack)),@"can_go_forward":@(bool(canForward))});
  };
  loading.api.on_load_end=[](cef_load_handler_t*,cef_browser_t* value,cef_frame_t* frame,int status){
    HOLD(value);HOLD(frame);Tab* tab=tabFor(value);if(!tab||!frame->is_main(frame))return;
    NSString* url=requestString(frame->get_url(frame));
    bool restored=status==0&&tab->historyNavigation&&tab->navigationRequest&&tab->historyURL&&[tab->historyURL isEqual:url]&&[tab->committedURLs containsObject:url]&&allowedURL(url);
    bool committed=(webBrowsing?(status>=200&&status<=599):status==200)&&allowedURL(url);
    tab->paintAllowed=committed||restored||(webBrowsing&&status==0&&[url isEqual:@"about:blank"]);
    if(tab->paintAllowed)tab->committedDocumentURL=url;
    if(committed){if(tab->committedURLs.count>=1024)[tab->committedURLs removeAllObjects];[tab->committedURLs addObject:url];}
    tabEvent(tab,@"load",@{@"http_status":@(status),@"restored_from_history":@(restored)});
    if(tab->navigationRequest){complete(tab->navigationRequest,tab->paintAllowed?@"success":@"failed");tab->navigationRequest=nil;}
    resetNavigation(tab);tab->supersededLoads=0;invalidateView(value);
  };
  loading.api.on_load_error=[](cef_load_handler_t*,cef_browser_t* value,cef_frame_t* frame,cef_errorcode_t code,const cef_string_t*,const cef_string_t* failed){
    HOLD(value);HOLD(frame);Tab* tab=tabFor(value);if(!tab||!frame->is_main(frame))return;
    if(webBrowsing&&code==ERR_ABORTED&&tab->supersededLoads>0&&(!tab->navigateURL||![ns(failed) isEqual:tab->navigateURL])){
      // The replaced load reports its own cancellation; the current request continues.
      tab->supersededLoads--;return;
    }
    if(webBrowsing&&code==ERR_ABORTED){
      // Chromium uses ABORTED for replaced navigations and denied downloads.
      // The replacement's callbacks establish its own success; never label a
      // cancellation as a renderer crash or replay its potentially unsafe POST.
      resetNavigation(tab);
      tabEvent(tab,@"error",@{@"code":@"navigation_cancelled",@"native_code":@(code)});
      if(tab->navigationRequest){unsupported(tab->navigationRequest,@"NAVIGATION_CANCELLED");tab->navigationRequest=nil;}
      restoreCancelledDocument(tab,value);return;
    }
    tab->paintAllowed=false;resetNavigation(tab);tab->committedDocumentURL=nil;tabEvent(tab,@"error",@{@"code":@"load_failed",@"native_code":@(code)});
    if(tab->navigationRequest){complete(tab->navigationRequest,@"failed");tab->navigationRequest=nil;}
  };
  request.api.on_render_process_terminated=[](cef_request_handler_t*,cef_browser_t* value,cef_termination_status_t,int code,const cef_string_t*){
    HOLD(value);Tab* tab=tabFor(value);if(!tab)return;
    invalidateNavigation(tab);resetNavigation(tab);
    tabEvent(tab,@"error",@{@"code":@"render_process_terminated",@"native_code":@(code)});
    if(tab->navigationRequest){complete(tab->navigationRequest,@"failed");tab->navigationRequest=nil;}
    // Recovery is explicit reload/back/switch in Zen; never replay form submits.
  };
}
