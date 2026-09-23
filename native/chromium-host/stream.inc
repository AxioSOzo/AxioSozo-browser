// Included by host.mm after CEF/refcount helpers. All state below is UI-thread-owned
// except immutable fixtureOrigin and the bounded, synchronized transport itself.
static NSMutableSet* committedFixtureURLs;
static bool historyNavigation=false, commandNavigationInvalidated=false;
static NSString* historyURL;
static constexpr uint64_t MaxGeneration=9007199254740991ULL;
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
static bool allowedURL(NSString* value,bool resource=false){
  if(!textValue(value,4096))return false;
  NSURL* url=[NSURL URLWithString:value];
  if(![[origin(url) description] isEqual:fixtureOrigin]||url.fragment)return false;
  return ([url.path isEqual:@"/engine.html"]&&(!url.query||[url.query isEqual:@"page=2"]))||(resource&&[url.path isEqual:@"/favicon.ico"]&&!url.query);
}
static bool validTarget(NSDictionary* value,bool pending){
  NSArray* wanted=pending?@[@"tab_id",@"engine_instance",@"identity",@"document_generation",@"navigation_generation",@"private_mode"]:@[@"tab_id",@"engine",@"engine_instance",@"native_target_id",@"identity",@"document_generation",@"navigation_generation",@"private_mode"];
  return keys(value,wanted)&&identifier(value[@"tab_id"])&&identifier(value[@"engine_instance"])&&[value[@"engine_instance"] isEqual:streamInstance]&&[value[@"identity"] isEqual:fixtureOrigin]&&integer(value[@"document_generation"])&&integer(value[@"navigation_generation"])&&boolean(value[@"private_mode"])&&![value[@"private_mode"] boolValue]&&(pending||([value[@"engine"] isEqual:@"chromium"]&&identifier(value[@"native_target_id"])));
}
static void failProtocol(){transport.reject();streamClosing=true;}
static void complete(NSString* request,NSString* status){event(@"completed",@{@"request_id":request,@"status":status});}
static void unsupported(NSString* request,NSString* reason){event(@"completed",@{@"request_id":request,@"status":@"unsupported",@"reason":reason});}
static bool streamHandshake(){
  if(!transport.start())return false;
  auto deadline=std::chrono::steady_clock::now()+std::chrono::seconds(10);
  while(std::chrono::steady_clock::now()<deadline&&!transport.failed()&&!transport.eof()){
    if(auto line=transport.pop()){
      NSDictionary* hello=object(*line);
      if(!keys(hello,@[@"version",@"method",@"token",@"engine_instance",@"fixture_origin"])||!integer(hello[@"version"],1)||[hello[@"version"] intValue]!=1||![hello[@"method"] isEqual:@"hello"]||!tokenValue(hello[@"token"])||!identifier(hello[@"engine_instance"])||!textValue(hello[@"fixture_origin"],128))return false;
      NSURL* url=[NSURL URLWithString:hello[@"fixture_origin"]];
      if(![origin(url) isEqual:hello[@"fixture_origin"]]||url.path.length||url.query||url.fragment)return false;
      streamToken=hello[@"token"];streamInstance=hello[@"engine_instance"];fixtureOrigin=hello[@"fixture_origin"];requestIds=[NSMutableSet set];return true;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
  }
  return false;
}
static void streamReadyEvent(){
  // These values are queried from the loaded framework, not merely headers.
  NSString* runtimeCEF=[NSString stringWithFormat:@"%d.%d.%d",p_cef_version_info(0),p_cef_version_info(1),p_cef_version_info(2)];
  NSString* runtimeChromium=[NSString stringWithFormat:@"%d.%d.%d.%d",p_cef_version_info(4),p_cef_version_info(5),p_cef_version_info(6),p_cef_version_info(7)];
  event(@"ready",@{@"cef":@CEF_VERSION,@"chromium":runtimeChromium,@"runtime_cef":runtimeCEF,@"runtime_chromium":runtimeChromium,@"platform":@"macosarm64",@"sandbox_configured":@YES,@"engine_instance":streamInstance,@"render_path":@"native-osr-bgra",@"capabilities":@{@"observe":@YES,@"navigate":@YES,@"back":@YES,@"forward":@YES,@"reload":@YES,@"close":@YES,@"input":@YES,@"devtools":@NO,@"ime":@NO,@"private_mode":@NO,@"fixture_only":@YES}});
}
static bool surface(id w,id h,id scale){
  if(!integer(w,4096)||!integer(h,4096)||![w intValue]||![h intValue]||![scale isKindOfClass:NSNumber.class]||CFGetTypeID((__bridge CFTypeRef)scale)==CFBooleanGetTypeID())return false;
  double d=[scale doubleValue];return std::isfinite(d)&&d>=1&&d<=4;
}
static bool fitsSurface(id w,id h,id scale){
  double pw=std::ceil([w doubleValue]*[scale doubleValue]),ph=std::ceil([h doubleValue]*[scale doubleValue]);
  return pw<=4096&&ph<=4096&&pw*ph*4<=axio::MaxFrame;
}
static void streamFrame(const void* pixels,int w,int h){
  if(!target||!streamPaintAllowed||streamClosing)return;
  if(w<=0||h<=0||w>4096||h>4096||uint64_t(w)*h*4>axio::MaxFrame){event(@"error",@{@"code":@"unsupported_surface"});streamPaintAllowed=false;return;}
  // A queued old-size paint can arrive after WasResized; do not relabel it.
  if(w!=int(std::ceil(width*deviceScale))||h!=int(std::ceil(height*deviceScale)))return;
  if(frameId==MaxGeneration){failProtocol();return;}
  NSDictionary* metadata=@{@"version":@1,@"target":target,@"frame_id":@(++frameId),@"width":@(w),@"height":@(h),@"stride":@(w*4),@"device_scale":@(deviceScale),@"format":@"BGRA8"};
  transport.frame(json(metadata),json(target),frameId,pixels,size_t(w)*h*4);
}
static NSString* requestString(cef_string_userfree_t value){NSString* result=ns(value);p_cef_string_userfree_utf16_free(value);return result;}
static void invalidateNavigation(){
  uint64_t document=[target[@"document_generation"] unsignedLongLongValue],navigation=[target[@"navigation_generation"] unsignedLongLongValue];
  if(document==MaxGeneration||navigation==MaxGeneration){failProtocol();return;}
  NSMutableDictionary* next=[target mutableCopy];next[@"document_generation"]=@(document+1);next[@"navigation_generation"]=@(navigation+1);target=[next copy];
  streamPaintAllowed=false;transport.invalidatePendingFrame();event(@"navigation",@{});
}
static void streamCommand(const std::string& line){
  NSDictionary* command=object(line);NSString* method=command[@"method"],*requestId=command[@"request_id"];
  if(!integer(command[@"version"],1)||[command[@"version"] intValue]!=1||!equalToken(command[@"token"])||!identifier(requestId)||!textValue(method,32)||[requestIds containsObject:requestId]||requestIds.count>=100000){failProtocol();return;}
  [requestIds addObject:requestId];
  NSDictionary* extra=@{@"create":@[@"url",@"width",@"height",@"device_scale"],@"navigate":@[@"url"],@"back":@[],@"forward":@[],@"reload":@[],@"resize":@[@"width",@"height",@"device_scale"],@"focus":@[@"focused"],@"key":@[@"type",@"native_key_code",@"windows_key_code",@"modifiers",@"text"],@"mouse":@[@"type",@"x",@"y",@"modifiers",@"button",@"click_count",@"mouse_leave"],@"wheel":@[@"x",@"y",@"modifiers",@"delta_x",@"delta_y"],@"frame_ack":@[@"frame_id"],@"close":@[],@"shutdown":@[],@"devtools":@[]};
  NSArray* fields=extra[method];if(!fields){failProtocol();return;}
  NSMutableArray* expected=[@[@"version",@"method",@"request_id",@"token"] mutableCopy];
  if(![method isEqual:@"shutdown"])[expected addObject:@"target"];
  [expected addObjectsFromArray:fields];if(!keys(command,expected)){failProtocol();return;}
  if([method isEqual:@"shutdown"]){event(@"accepted",@{@"request_id":requestId});shutdownRequest=requestId;streamClosing=true;return;}
  bool creating=[method isEqual:@"create"];
  NSDictionary* supplied=command[@"target"];
  if(!validTarget(supplied,creating)){failProtocol();return;}
  if([method isEqual:@"frame_ack"]){
    // Exact outstanding target is intentionally used instead of current target:
    // discarded stale frames also need to release their one transport credit.
    if(!integer(command[@"frame_id"])||!transport.acknowledge([command[@"frame_id"] unsignedLongLongValue],json(supplied))){failProtocol();return;}
    return;
  }
  if(!creating&&(!target||![target isEqualToDictionary:supplied])){event(@"error",@{@"request_id":requestId,@"code":@"stale_target"});return;}
  if(creating){
    if(target||browser||createRequest||!streamReady){event(@"error",@{@"request_id":requestId,@"code":@"invalid_lifecycle"});return;}
    if(!allowedURL(command[@"url"])||!surface(command[@"width"],command[@"height"],command[@"device_scale"])){failProtocol();return;}
    if(!fitsSurface(command[@"width"],command[@"height"],command[@"device_scale"])){unsupported(requestId,@"surface_limit");return;}
    width=[command[@"width"] intValue];height=[command[@"height"] intValue];deviceScale=[command[@"device_scale"] doubleValue];
    target=[supplied copy];createRequest=requestId;
    cef_window_info_t wi{};wi.size=sizeof(wi);wi.windowless_rendering_enabled=1;wi.runtime_style=CEF_RUNTIME_STYLE_ALLOY;
    cef_browser_settings_t settings{};settings.size=sizeof(settings);settings.windowless_frame_rate=30;
    auto value=utf16(command[@"url"]);auto url=view(value);
    event(@"accepted",@{@"request_id":requestId});
    if(!p_cef_browser_host_create_browser(&wi,&client.api,&url,&settings,nullptr,nullptr)){complete(requestId,@"failed");createRequest=nil;target=nil;}
    return;
  }
  if(!browser||streamClosing){event(@"error",@{@"request_id":requestId,@"code":@"closed_target"});return;}
  if([method isEqual:@"devtools"]){unsupported(requestId,@"devtools_not_integrated");return;}
  if([method isEqual:@"navigate"]&&!allowedURL(command[@"url"])){failProtocol();return;}
  if([method isEqual:@"resize"]){
    if(!surface(command[@"width"],command[@"height"],command[@"device_scale"])){failProtocol();return;}
    if(!fitsSurface(command[@"width"],command[@"height"],command[@"device_scale"])){unsupported(requestId,@"surface_limit");return;}
  }
  if([method isEqual:@"focus"]&&!boolean(command[@"focused"])){failProtocol();return;}
  if([method isEqual:@"key"]&&(![@[@"down",@"up",@"char"] containsObject:command[@"type"]]||!integer(command[@"native_key_code"],65535)||!integer(command[@"windows_key_code"],255)||!integer(command[@"modifiers"],131071)||!textValue(command[@"text"],4))){failProtocol();return;}
  if([method isEqual:@"mouse"]||[method isEqual:@"wheel"]){
    if(!integer(command[@"x"],width)||!integer(command[@"y"],height)||!integer(command[@"modifiers"],131071)){failProtocol();return;}
    if([method isEqual:@"mouse"]&&(![@[@"move",@"down",@"up"] containsObject:command[@"type"]]||![@[@"left",@"middle",@"right"] containsObject:command[@"button"]]||!integer(command[@"click_count"],3)||![command[@"click_count"] intValue]||!boolean(command[@"mouse_leave"]))){failProtocol();return;}
    if([method isEqual:@"wheel"]&&(!signedInteger(command[@"delta_x"],-4096,4096)||!signedInteger(command[@"delta_y"],-4096,4096))){failProtocol();return;}
  }
  bool navigation=[@[@"navigate",@"back",@"forward",@"reload"] containsObject:method];
  if(navigation&&navigationRequest){event(@"error",@{@"request_id":requestId,@"code":@"navigation_in_progress"});return;}
  if(([method isEqual:@"back"]&&!browser->can_go_back(browser))||([method isEqual:@"forward"]&&!browser->can_go_forward(browser))){unsupported(requestId,@"history_boundary");return;}
  event(@"accepted",@{@"request_id":requestId});
  auto* host=browser->get_host(browser);
  if(navigation){
    navigationRequest=requestId;historyNavigation=[method isEqual:@"back"]||[method isEqual:@"forward"];historyURL=nil;
    // BFCache restores can skip OnBeforeBrowse entirely. Revoke the previous
    // document before dispatching every accepted browser-issued navigation.
    invalidateNavigation();commandNavigationInvalidated=true;
    if(transport.failed()){host->base.release(&host->base);return;}
  }
  if([method isEqual:@"navigate"]){auto* frame=browser->get_main_frame(browser);auto value=utf16(command[@"url"]);auto url=view(value);frame->load_url(frame,&url);frame->base.release(&frame->base);}
  else if([method isEqual:@"back"])browser->go_back(browser);
  else if([method isEqual:@"forward"])browser->go_forward(browser);
  else if([method isEqual:@"reload"])browser->reload(browser);
  else if([method isEqual:@"resize"]){width=[command[@"width"] intValue];height=[command[@"height"] intValue];deviceScale=[command[@"device_scale"] doubleValue];transport.invalidatePendingFrame();host->notify_screen_info_changed(host);host->was_resized(host);}
  else if([method isEqual:@"focus"])host->set_focus(host,[command[@"focused"] boolValue]);
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
  }else if([method isEqual:@"close"]){closeRequest=requestId;streamClosing=true;}
  host->base.release(&host->base);
  if(!navigation&&![method isEqual:@"close"])complete(requestId,@"success");
}
static void configureStream(){
  committedFixtureURLs=[NSMutableSet set];
  loading.api.on_load_start=[](cef_load_handler_t*,cef_browser_t*,cef_frame_t* frame,cef_transition_type_t){
    if(!frame->is_main(frame))return;NSString* url=requestString(frame->get_url(frame));
    historyURL=historyNavigation&&navigationRequest&&[committedFixtureURLs containsObject:url]?url:nil;
    event(@"url",@{@"url":url});
  };
  lifespan.api.on_after_created=[](cef_life_span_handler_t*,cef_browser_t* value){
    browser=value;value->base.add_ref(&value->base);
    NSMutableDictionary* full=[target mutableCopy];full[@"engine"]=@"chromium";full[@"native_target_id"]=[NSString stringWithFormat:@"%d",value->get_identifier(value)];target=[full copy];
    event(@"created",@{@"request_id":createRequest});complete(createRequest,@"success");createRequest=nil;
    if(streamClosing)closeBrowser();
  };
  lifespan.api.on_before_close=[](cef_life_span_handler_t*,cef_browser_t*){
    streamPaintAllowed=false;transport.invalidatePendingFrame();event(@"closed",@{});closed=true;
    if(closeRequest){complete(closeRequest,@"success");closeRequest=nil;}
    browser->base.release(&browser->base);browser=nullptr;
  };
  lifespan.api.on_before_popup=[](cef_life_span_handler_t*,cef_browser_t*,cef_frame_t*,int,const cef_string_t*,const cef_string_t*,cef_window_open_disposition_t,int,const cef_popup_features_t*,cef_window_info_t*,cef_client_t**,cef_browser_settings_t*,cef_dictionary_value_t**,int*){return 1;};
  request.api.on_before_browse=[](cef_request_handler_t*,cef_browser_t*,cef_frame_t* frame,cef_request_t* value,int,int){
    NSString* url=requestString(value->get_url(value)),*method=requestString(value->get_method(value));
    if(!allowedURL(url)||![method isEqual:@"GET"]){event(@"error",@{@"code":@"navigation_denied"});return 1;}
    if(frame->is_main(frame)){
      if(!commandNavigationInvalidated)invalidateNavigation();
    }return transport.failed()?1:0;
  };
  request.api.on_open_urlfrom_tab=[](cef_request_handler_t*,cef_browser_t*,cef_frame_t*,const cef_string_t*,cef_window_open_disposition_t,int){return 1;};
  request.api.get_resource_request_handler=[](cef_request_handler_t*,cef_browser_t*,cef_frame_t*,cef_request_t*,int,int,const cef_string_t*,int*){return resources.retain();};
  resources.api.on_before_resource_load=[](cef_resource_request_handler_t*,cef_browser_t*,cef_frame_t*,cef_request_t* value,cef_callback_t*){
    @autoreleasepool{NSString* url=requestString(value->get_url(value)),*method=requestString(value->get_method(value));return allowedURL(url,true)&&[method isEqual:@"GET"]?RV_CONTINUE:RV_CANCEL;}
  };
  request.api.on_certificate_error=[](cef_request_handler_t*,cef_browser_t*,cef_errorcode_t,const cef_string_t*,cef_sslinfo_t*,cef_callback_t*){return 0;};
  permissions.api.on_request_media_access_permission=[](cef_permission_handler_t*,cef_browser_t*,cef_frame_t*,const cef_string_t*,uint32_t,cef_media_access_callback_t* callback){callback->cancel(callback);return 1;};
  permissions.api.on_show_permission_prompt=[](cef_permission_handler_t*,cef_browser_t*,uint64_t,const cef_string_t*,uint32_t,cef_permission_prompt_callback_t* callback){callback->cont(callback,CEF_PERMISSION_RESULT_DENY);return 1;};
  client.api.get_download_handler=[](cef_client_t*){return downloads.retain();};
  downloads.api.can_download=[](cef_download_handler_t*,cef_browser_t*,const cef_string_t*,const cef_string_t*){return 0;};
  downloads.api.on_before_download=[](cef_download_handler_t*,cef_browser_t*,cef_download_item_t*,const cef_string_t*,cef_before_download_callback_t*){return 0;};
  downloads.api.on_download_updated=[](cef_download_handler_t*,cef_browser_t*,cef_download_item_t*,cef_download_item_callback_t* callback){callback->cancel(callback);};
  client.api.get_context_menu_handler=[](cef_client_t*){return contextMenu.retain();};
  contextMenu.api.on_before_context_menu=[](cef_context_menu_handler_t*,cef_browser_t*,cef_frame_t*,cef_context_menu_params_t*,cef_menu_model_t* model){model->clear(model);};
  display.api.on_title_change=[](cef_display_handler_t*,cef_browser_t*,const cef_string_t* value){NSString* title=ns(value);event(@"title",@{@"title":[title substringToIndex:MIN(title.length,1024)]});};
  display.api.on_address_change=[](cef_display_handler_t*,cef_browser_t*,cef_frame_t* frame,const cef_string_t* value){if(frame->is_main(frame))event(@"url",@{@"url":ns(value)});};
  loading.api.on_loading_state_change=[](cef_load_handler_t*,cef_browser_t* value,int isLoading,int canBack,int canForward){event(@"loading",@{@"loading":@(bool(isLoading)),@"can_go_back":@(bool(canBack)),@"can_go_forward":@(bool(canForward))});};
  loading.api.on_load_end=[](cef_load_handler_t*,cef_browser_t* value,cef_frame_t* frame,int status){
    if(!frame->is_main(frame))return;
    NSString* url=requestString(frame->get_url(frame));
    bool restored=status==0&&historyNavigation&&navigationRequest&&historyURL&&[historyURL isEqual:url]&&[committedFixtureURLs containsObject:url]&&allowedURL(url);
    streamPaintAllowed=(status==200&&allowedURL(url))||restored;
    if(status==200&&allowedURL(url))[committedFixtureURLs addObject:url];
    event(@"load",@{@"http_status":@(status),@"restored_from_history":@(restored)});
    if(navigationRequest){complete(navigationRequest,streamPaintAllowed?@"success":@"failed");navigationRequest=nil;}
    historyNavigation=false;historyURL=nil;commandNavigationInvalidated=false;
    auto* host=value->get_host(value);host->invalidate(host,PET_VIEW);host->base.release(&host->base);
  };
  loading.api.on_load_error=[](cef_load_handler_t*,cef_browser_t*,cef_frame_t* frame,cef_errorcode_t code,const cef_string_t*,const cef_string_t*){
    if(!frame->is_main(frame))return;streamPaintAllowed=false;historyNavigation=false;historyURL=nil;commandNavigationInvalidated=false;event(@"error",@{@"code":@"load_failed",@"native_code":@(code)});
    if(navigationRequest){complete(navigationRequest,@"failed");navigationRequest=nil;}
  };
}
