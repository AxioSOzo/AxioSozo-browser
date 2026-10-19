// Included by host_core.cc. Port of stream.inc configureStream() (CEF callbacks of
// stream mode) and of host.mm's UI-thread tick (E0 exercise, heartbeat, bounded
// close). Every ref-counted CEF struct passed into a callback is released (HOLD).

static void configureStream() {
  render.api.get_view_rect = [](cef_render_handler_t*, cef_browser_t* value, cef_rect_t* r) {
    HOLD(value);
    Tab* tab = tabFor(value, true);
    *r = {0, 0, tab ? tab->width : 900, tab ? tab->height : 650};
  };
  render.api.get_screen_info = [](cef_render_handler_t*, cef_browser_t* value, cef_screen_info_t* i) {
    HOLD(value);
    Tab* tab = tabFor(value, true);
    int w = tab ? tab->width : 900, h = tab ? tab->height : 650;
    i->device_scale_factor = float(tab ? tab->scale : 2);
    i->depth = 32;
    i->depth_per_component = 8;
    i->rect = {0, 0, w, h};
    i->available_rect = i->rect;
    return 1;
  };
  render.api.on_paint = [](cef_render_handler_t*, cef_browser_t* value, cef_paint_element_type_t type, size_t dirtyCount,
                           const cef_rect_t* dirtyRects, const void* pixels, int w, int h) {
    HOLD(value);
    if (Tab* tab = tabFor(value)) streamPaint(tab, type, pixels, w, h, dirtyCount, dirtyRects);
  };
  render.api.on_popup_size = [](cef_render_handler_t*, cef_browser_t* value, const cef_rect_t* rect) {
    HOLD(value);
    if (Tab* tab = tabFor(value)) tab->popupRect = *rect;
  };
  render.api.on_popup_show = [](cef_render_handler_t*, cef_browser_t* value, int show) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab) return;
    clearPopup(tab);
    tab->popupVisible = show;
    invalidateView(value);
  };
  display.api.on_cursor_change = [](cef_display_handler_t*, cef_browser_t* value, cef_cursor_handle_t, cef_cursor_type_t type,
                                    const cef_cursor_info_t*) {
    HOLD(value);
    if (Tab* tab = tabFor(value)) tabEvent(tab, "cursor", json::object({{"cursor", cursorName(type)}}));
    return 1;
  };
  loading.api.on_load_start = [](cef_load_handler_t*, cef_browser_t* value, cef_frame_t* frame, cef_transition_type_t) {
    HOLD(value); HOLD(frame);
    Tab* tab = tabFor(value);
    if (!tab || !frame->is_main(frame)) return;
    std::string address = take(frame->get_url(frame));
    tab->hasHistoryURL = tab->historyNavigation && !tab->navigationRequest.empty() && tab->committedURLs.count(address);
    tab->historyURL = tab->hasHistoryURL ? address : std::string();
    tab->documentFrame = take(frame->get_identifier(frame));
    tab->hasDocumentFrame = true;
    tabEvent(tab, "url", json::object({{"url", address}}));
    resetInput(tab);  // a new document: the old editable and touch sequence end with it
  };
  lifespan.api.on_after_created = [](cef_life_span_handler_t*, cef_browser_t* value) {
    HOLD(value);
    Tab* tab = creating;
    creating = nullptr;
    if (!tab) { auto* h = value->get_host(value); h->close_browser(h, 1); h->base.release(&h->base); return; }
    tab->browser = value;
    value->base.add_ref(&value->base);
    tabsByBrowser[value->get_identifier(value)] = tab;
    tab->target["engine"] = "chromium";
    tab->target["native_target_id"] = std::to_string(value->get_identifier(value));
    tabEvent(tab, "created", json::object({{"request_id", tab->createRequest}}));
    complete(tab->createRequest, "success");
    tab->createRequest.clear();
    if (streamClosing || tab->closing) closeTab(tab);
  };
  lifespan.api.on_before_close = [](cef_life_span_handler_t*, cef_browser_t* value) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab || tab == creating) return;
    tab->paintAllowed = false;
    transport.invalidatePendingFrame(tab->key);
    closePromptsFor(tab, "closed", false);
    cancelDownloadsFor(tab);
    finishKeyWaits(tab);
    axTabClosed(tab);
    tabEvent(tab, "closed");
    if (!tab->closeRequest.empty()) { complete(tab->closeRequest, "success"); tab->closeRequest.clear(); }
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "failed"); tab->navigationRequest.clear(); }
    tabsByBrowser.erase(value->get_identifier(value));
    tabsByKey.erase(tab->key);
    tab->browser->base.release(&tab->browser->base);
    delete tab;
    // Fixture probes own one target: its close ends the host. A web host lives
    // until shutdown or its authenticated pipe closes.
    if (streamIdle() && (streamClosing || !webBrowsing)) closed = true;
  };
  lifespan.api.on_before_popup = [](cef_life_span_handler_t*, cef_browser_t* value, cef_frame_t* frame, int,
                                    const cef_string_t* address, const cef_string_t*, cef_window_open_disposition_t disposition,
                                    int gesture, const cef_popup_features_t*, cef_window_info_t*, cef_client_t**,
                                    cef_browser_settings_t*, cef_dictionary_value_t**, int*) {
    HOLD(value); HOLD(frame);
    Tab* tab = tabFor(value);
    if (!tab) return 1;
    if (gesture) openInTab(tab, address, disposition == CEF_WOD_NEW_BACKGROUND_TAB);
    else blockedPopup(tab, address);
    return 1;
  };
  request.api.on_before_browse = [](cef_request_handler_t*, cef_browser_t* value, cef_frame_t* frame, cef_request_t* candidate,
                                    int, int) {
    HOLD(value); HOLD(frame); HOLD(candidate);
    Tab* tab = tabFor(value);
    if (!tab) return 1;
    std::string address = take(candidate->get_url(candidate)), method = take(candidate->get_method(candidate));
    if (!allowedURL(address, !frame->is_main(frame)) || (!webBrowsing && method != "GET")) {
      tabEvent(tab, "error", json::object({{"code", "navigation_denied"}}));
      return 1;
    }
    if (frame->is_main(frame)) {
      tab->sameDocumentNavigation = tab->sameDocumentNavigation || fragmentNavigation(tab, address);
      if (!tab->commandNavigationInvalidated) invalidateNavigation(tab);
    }
    return transport.failed() ? 1 : 0;
  };
  request.api.on_open_urlfrom_tab = [](cef_request_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                       const cef_string_t* address, cef_window_open_disposition_t disposition, int gesture) {
    HOLD(value); HOLD(frame);
    Tab* tab = tabFor(value);
    if (!tab) return 1;
    if (webBrowsing && disposition == CEF_WOD_CURRENT_TAB && allowedURL(utf8(address))) return 0;
    if (gesture && (disposition == CEF_WOD_NEW_FOREGROUND_TAB || disposition == CEF_WOD_NEW_BACKGROUND_TAB))
      openInTab(tab, address, disposition == CEF_WOD_NEW_BACKGROUND_TAB);
    else if (!gesture && disposition != CEF_WOD_CURRENT_TAB) blockedPopup(tab, address);
    else tabEvent(tab, "error", json::object({{"code", "popup_denied"}}));
    return 1;
  };
  request.api.get_resource_request_handler = [](cef_request_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                                cef_request_t* candidate, int, int, const cef_string_t*, int*) {
    HOLD(value); HOLD(frame); HOLD(candidate);
    return resources.retain();
  };
  // Runs on the IO thread: only immutable session policy (allowedURL) is read here.
  resources.api.on_before_resource_load = [](cef_resource_request_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                             cef_request_t* candidate, cef_callback_t* callback) {
    HOLD(value); HOLD(frame); HOLD(candidate); HOLD(callback);
    std::string address = take(candidate->get_url(candidate)), method = take(candidate->get_method(candidate));
    return allowedURL(address, true) && (webBrowsing || method == "GET") ? RV_CONTINUE : RV_CANCEL;
  };
  resources.api.on_protocol_execution = [](cef_resource_request_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                           cef_request_t* candidate, int* allow) {
    HOLD(value); HOLD(frame); HOLD(candidate);
    *allow = 0;
  };
  request.api.on_certificate_error = [](cef_request_handler_t*, cef_browser_t* value, cef_errorcode_t code, const cef_string_t*,
                                        cef_sslinfo_t* info, cef_callback_t* callback) {
    HOLD(value); HOLD(info); HOLD(callback);
    if (Tab* tab = tabFor(value)) tabEvent(tab, "error", json::object({{"code", "certificate_error"}, {"native_code", int(code)}}));
    return 0;
  };
  // Credentials are asked for by Zen's own auth prompt and never logged. CEF calls
  // this on the IO thread; all prompt state is UI-thread owned, so hop to the UI thread.
  request.api.get_auth_credentials = [](cef_request_handler_t*, cef_browser_t* value, const cef_string_t* origin_, int proxy,
                                        const cef_string_t* host_, int port, const cef_string_t* realm_,
                                        const cef_string_t* scheme_, cef_auth_callback_t* callback) -> int {
    HOLD(value); HOLD(callback);
    if (!webBrowsing || !value || !callback) return 0;
    int browserId = value->get_identifier(value);
    std::string originText = utf8(origin_), hostText = utf8(host_), realm = clip(utf8(realm_), 150), scheme = clip(utf8(scheme_), 32);
    if (hostText.empty() || json::utf16Length(hostText) > 255 || port < 0 || port > 65535) return 0;
    callback->base.add_ref(&callback->base);
    bool posted = postUI([=] {
      auto found = tabsByBrowser.find(browserId);
      Tab* tab = found == tabsByBrowser.end() ? nullptr : found->second;
      Value details = json::object({{"origin", wholeURL(originText, 2048)}, {"host", hostText}, {"port", port},
                                    {"is_proxy", bool(proxy)}, {"realm", realm}, {"scheme", scheme}});
      if (!issuePrompt(tab, PromptAuth, &callback->base, details, 300)) callback->cancel(callback);
      callback->base.release(&callback->base);
    });
    if (!posted) { callback->cancel(callback); callback->base.release(&callback->base); }
    return 1;
  };
  request.api.on_select_client_certificate = [](cef_request_handler_t*, cef_browser_t* value, int, const cef_string_t*, int,
                                                size_t count, cef_x509_certificate_t* const* certificates,
                                                cef_select_client_certificate_callback_t* callback) {
    HOLD(value); HOLD(callback);
    for (size_t i = 0; i < count; i++) if (certificates[i]) certificates[i]->base.release(&certificates[i]->base);
    if (Tab* tab = tabFor(value)) tabEvent(tab, "error", json::object({{"code", "client_certificate_unavailable"}}));
    callback->select(callback, nullptr);
    return 1;
  };
  // getUserMedia/getDisplayMedia: denied with an explicit notice (see permissionNames).
  permissions.api.on_request_media_access_permission = [](cef_permission_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                                          const cef_string_t*, uint32_t, cef_media_access_callback_t* callback) {
    HOLD(value); HOLD(frame); HOLD(callback);
    if (Tab* tab = tabFor(value))
      tabEvent(tab, "error", json::object({{"code", webBrowsing ? "media_capture_unavailable" : "permission_denied"}}));
    callback->cancel(callback);
    return 1;
  };
  permissions.api.on_show_permission_prompt = [](cef_permission_handler_t*, cef_browser_t* value, uint64_t nativePrompt,
                                                 const cef_string_t* origin_, uint32_t requested,
                                                 cef_permission_prompt_callback_t* callback) {
    HOLD(value); HOLD(callback);
    Tab* tab = tabFor(value);
    bool capture = false;
    Value names;
    bool known = permissionNames(requested, &capture, names);
    std::string originText = utf8(origin_);
    if (webBrowsing && tab && known && webOrigin(originText)) {
      if (Prompt* p = issuePrompt(tab, PromptPermission, &callback->base,
                                  json::object({{"origin", originText}, {"permissions", names}}), 300)) {
        p->nativePrompt = nativePrompt;
        return 1;
      }
    }
    if (tab) tabEvent(tab, "error", json::object({{"code", capture && webBrowsing ? "media_capture_unavailable" : "permission_denied"}}));
    callback->cont(callback, CEF_PERMISSION_RESULT_DENY);
    return 1;
  };
  permissions.api.on_dismiss_permission_prompt = [](cef_permission_handler_t*, cef_browser_t* value, uint64_t nativePrompt,
                                                    cef_permission_request_result_t) {
    HOLD(value);
    // Chromium withdrew a still-open request (navigation, closure): close Zen's doorhanger.
    for (auto& item : prompts)
      if (item.second->kind == PromptPermission && item.second->nativePrompt == nativePrompt) {
        closePrompt(item.second, "withdrawn", false);
        break;
      }
  };
  client.api.get_download_handler = [](cef_client_t*) { return downloads.retain(); };
  downloads.api.can_download = [](cef_download_handler_t*, cef_browser_t* value, const cef_string_t* address, const cef_string_t*) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (webBrowsing && tab && allowedURL(utf8(address), true)) return 1;
    if (tab) tabEvent(tab, "error", json::object({{"code", "download_denied"}}));
    return 0;
  };
  downloads.api.on_before_download = [](cef_download_handler_t*, cef_browser_t* value, cef_download_item_t* item,
                                        const cef_string_t* suggested, cef_before_download_callback_t* callback) -> int {
    HOLD(value); HOLD(item); HOLD(callback);
    Tab* tab = tabFor(value);
    if (!webBrowsing || !tab) return 0;
    uint32_t id = item->get_id(item);
    if (activeDownloads.count(id)) return 0;
    std::string name = url::lastPathComponent(utf8(suggested));
    std::replace(name.begin(), name.end(), ':', '_');
    Value details = json::object({{"download_id", id}, {"suggested_name", clip(name.empty() ? std::string("download") : name, 255)},
                                  {"url", wholeURL(take(item->get_url(item)), 2048)},
                                  {"mime_type", clip(take(item->get_mime_type(item)), 128)},
                                  {"total_bytes", std::max<int64_t>(-1, item->get_total_bytes(item))}});
    activeDownloads[id] = ActiveDownload{tab, false, nullptr};
    // Where to save is Zen's decision; the download survives page navigation.
    Prompt* p = issuePrompt(tab, PromptDownload, &callback->base, details, 600, false);
    if (!p) { activeDownloads.erase(id); return 0; }
    p->download = id;
    return 1;
  };
  downloads.api.on_download_updated = [](cef_download_handler_t*, cef_browser_t* value, cef_download_item_t* item,
                                         cef_download_item_callback_t* callback) {
    HOLD(value); HOLD(item); HOLD(callback);
    Tab* tab = tabFor(value);
    if (!webBrowsing) { callback->cancel(callback); return; }
    auto found = activeDownloads.find(item->get_id(item));
    // Updates can precede on_before_download; until Zen accepts a save location
    // nothing is written, and on_before_download alone decides whether it may start.
    if (found == activeDownloads.end() || !found->second.accepted) return;
    if (!tab || found->second.tab != tab) { callback->cancel(callback); return; }
    if (found->second.control) found->second.control->base.release(&found->second.control->base);
    callback->base.add_ref(&callback->base);
    found->second.control = callback;
    const char* state = item->is_complete(item) ? "complete"
                        : (item->is_canceled(item) ? "canceled" : (item->is_interrupted(item) ? "interrupted" : "in_progress"));
    tabEvent(tab, "download_updated",
             json::object({{"download_id", found->first}, {"state", state},
                           {"received_bytes", std::max<int64_t>(0, item->get_received_bytes(item))},
                           {"total_bytes", std::max<int64_t>(-1, item->get_total_bytes(item))},
                           {"speed", std::max<int64_t>(0, item->get_current_speed(item))}, {"paused", bool(item->is_paused(item))}}));
    if (std::string(state) != "in_progress") {
      found->second.control->base.release(&found->second.control->base);
      activeDownloads.erase(found);
    }
  };
  client.api.get_context_menu_handler = [](cef_client_t*) { return contextMenu.retain(); };
  contextMenu.api.on_before_context_menu = [](cef_context_menu_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                              cef_context_menu_params_t* params, cef_menu_model_t* model) {
    HOLD(value); HOLD(frame); HOLD(params); HOLD(model);
    // Fixture sessions show no menu. Web sessions keep the model so CEF asks
    // run_context_menu, where Zen draws Firefox's own menu instead.
    if (!webBrowsing) { model->clear(model); return; }
    // CEF skips run_context_menu for an empty model (e.g. links/images in Alloy).
    // This inert item is never shown or executed; Zen builds the real menu.
    if (!model->get_count(model)) {
      auto label = json::toUtf16("AxioSozo");
      auto text = view(label);
      model->add_item(model, MENU_ID_USER_FIRST, &text);
    }
  };
  contextMenu.api.run_context_menu = [](cef_context_menu_handler_t*, cef_browser_t* value, cef_frame_t* frame,
                                        cef_context_menu_params_t* params, cef_menu_model_t* model,
                                        cef_run_context_menu_callback_t* callback) -> int {
    HOLD(value); HOLD(frame); HOLD(params); HOLD(model); HOLD(callback);
    Tab* tab = tabFor(value);
    if (!webBrowsing || !tab) { callback->cancel(callback); return 1; }
    std::string link = wholeURL(take(params->get_link_url(params)), 2048), source = wholeURL(take(params->get_source_url(params)), 2048);
    std::string frameURL = wholeURL(take(params->get_frame_url(params)), 1024),
                misspelled = clip(take(params->get_misspelled_word(params)), 64);
    cef_string_list_t list = p_cef_string_list_alloc();
    params->get_dictionary_suggestions(params, list);
    std::vector<std::string> suggestions;
    Value suggestionList = json::array();
    for (const auto& word : listStrings(list, 5))
      if (!word.empty() && json::utf16Length(word) <= 64) { suggestions.push_back(word); suggestionList.items.push_back(word); }
    p_cef_string_list_free(list);
    int media = params->get_media_type(params);
    Value details = json::object({{"x", std::max(0, params->get_xcoord(params))}, {"y", std::max(0, params->get_ycoord(params))},
                                  {"type_flags", int(params->get_type_flags(params)) & 63}, {"link_url", link},
                                  {"source_url", source}, {"frame_url", frameURL},
                                  {"selection_text", clip(take(params->get_selection_text(params)), 256)},
                                  {"link_text", clip(take(params->get_title_text(params)), 128)},
                                  {"editable", bool(params->is_editable(params))},
                                  {"edit_flags", int(params->get_edit_state_flags(params)) & 511}, {"media_type", mediaName(media)},
                                  {"media_flags", int(params->get_media_state_flags(params)) & 8191},
                                  {"misspelled_word", misspelled}, {"suggestions", suggestionList},
                                  {"spellcheck", bool(params->is_spell_check_enabled(params))}});
    Prompt* p = issuePrompt(tab, PromptContextMenu, &callback->base, details, 120);
    if (!p) { callback->cancel(callback); return 1; }
    p->frame = frame;
    frame->base.add_ref(&frame->base);
    p->link = link; p->source = source; p->misspelled = misspelled; p->suggestions = suggestions; p->mediaType = media;
    return 1;
  };
  client.api.get_dialog_handler = [](cef_client_t*) { return dialogs.retain(); };
  dialogs.api.on_file_dialog = [](cef_dialog_handler_t*, cef_browser_t* value, cef_file_dialog_mode_t mode,
                                  const cef_string_t* title, const cef_string_t* defaultPath, cef_string_list_t filters_,
                                  cef_string_list_t extensions_, cef_string_list_t descriptions_,
                                  cef_file_dialog_callback_t* callback) {
    HOLD(value); HOLD(callback);
    Tab* tab = tabFor(value);
    const char* modeName = mode == FILE_DIALOG_OPEN ? "open"
                           : (mode == FILE_DIALOG_OPEN_MULTIPLE ? "open_multiple"
                              : (mode == FILE_DIALOG_OPEN_FOLDER ? "open_folder" : (mode == FILE_DIALOG_SAVE ? "save" : nullptr)));
    if (webBrowsing && tab && modeName) {
      auto filters = listStrings(filters_, 16), extensions = listStrings(extensions_, 16), descriptions = listStrings(descriptions_, 16);
      Value accept = json::array();
      for (size_t i = 0; i < filters.size(); i++) {
        Value list = json::array();
        std::string joined = i < extensions.size() && !extensions[i].empty() ? extensions[i] : filters[i];
        size_t start = 0;
        while (start <= joined.size()) {
          size_t semicolon = joined.find(';', start);
          std::string part = joined.substr(start, semicolon == std::string::npos ? std::string::npos : semicolon - start);
          if (!part.empty() && part[0] == '.' && json::utf16Length(part) <= 16 && list.items.size() < 16) list.items.push_back(part);
          if (semicolon == std::string::npos) break;
          start = semicolon + 1;
        }
        accept.items.push_back(json::object({{"filter", clip(filters[i], 64)}, {"extensions", list},
                                             {"description", clip(i < descriptions.size() ? descriptions[i] : std::string(), 64)}}));
      }
      // Only the suggested file name reaches Zen; the picker opens in Zen's own directory.
      Value details = json::object({{"mode", modeName}, {"title", clip(utf8(title), 128)},
                                    {"default_name", clip(url::lastPathComponent(utf8(defaultPath)), 255)}, {"filters", accept}});
      if (Prompt* p = issuePrompt(tab, PromptFile, &callback->base, details, 600)) { p->fileMode = mode; return 1; }
    }
    if (tab) tabEvent(tab, "error", json::object({{"code", "file_dialog_unavailable"}}));
    callback->cancel(callback);
    return 1;
  };
  client.api.get_jsdialog_handler = [](cef_client_t*) { return jsDialogs.retain(); };
  jsDialogs.api.on_jsdialog = [](cef_jsdialog_handler_t*, cef_browser_t* value, const cef_string_t* originUrl,
                                 cef_jsdialog_type_t type, const cef_string_t* message, const cef_string_t* defaultText,
                                 cef_jsdialog_callback_t* callback, int* suppress) -> int {
    HOLD(value); HOLD(callback);
    Tab* tab = tabFor(value);
    const char* typeName = type == JSDIALOGTYPE_ALERT ? "alert"
                           : (type == JSDIALOGTYPE_CONFIRM ? "confirm" : (type == JSDIALOGTYPE_PROMPT ? "prompt" : nullptr));
    if (webBrowsing && tab && typeName) {
      Value details = json::object({{"dialog_type", typeName}, {"origin_url", wholeURL(utf8(originUrl), 2048)},
                                    {"message", clip(utf8(message), 3000)}, {"default_text", clip(utf8(defaultText), 1024)}});
      if (issuePrompt(tab, PromptDialog, &callback->base, details, 300)) return 1;
    }
    if (tab) tabEvent(tab, "error", json::object({{"code", "javascript_dialog_unavailable"}}));
    *suppress = 1;
    return 0;
  };
  jsDialogs.api.on_before_unload_dialog = [](cef_jsdialog_handler_t*, cef_browser_t* value, const cef_string_t*, int reload,
                                             cef_jsdialog_callback_t* callback) {
    HOLD(value); HOLD(callback);
    Tab* tab = tabFor(value);
    bool leave = streamClosing || (tab && tab->closing);
    // Closing the tab or the host never waits for the page. Pages cannot supply the text.
    if (!leave && tab &&
        issuePrompt(tab, PromptBeforeUnload, &callback->base,
                    json::object({{"dialog_type", "beforeunload"}, {"is_reload", bool(reload)}}), 300))
      return 1;
    if (tab && !leave) tabEvent(tab, "error", json::object({{"code", "before_unload_confirmation_unavailable"}}));
    callback->cont(callback, leave ? 1 : 0, nullptr);
    if (tab && !leave) restoreCancelledDocument(tab, value);
    return 1;
  };
  jsDialogs.api.on_reset_dialog_state = [](cef_jsdialog_handler_t*, cef_browser_t* value) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab) return;
    std::vector<uint64_t> matched;
    for (auto& item : prompts)
      if (item.second->tab == tab && (item.second->kind == PromptDialog || item.second->kind == PromptBeforeUnload))
        matched.push_back(item.first);
    // Chromium already abandoned these dialogs (e.g. navigation); answer "cancel"
    // without treating it as the user choosing to stay on the page. A prompt that
    // is being answered right now was detached first and is not touched here.
    for (uint64_t id : matched) {
      Prompt* p = detachPrompt(id);
      if (!p) continue;
      tabEvent(tab, "prompt_closed", json::object({{"prompt_id", promptName(p->id)}, {"reason", "reset"}}));
      auto* c = reinterpret_cast<cef_jsdialog_callback_t*>(p->callback);
      c->cont(c, 0, nullptr);
      releasePrompt(p);
    }
  };
  configureDelegation();
  configureInput();
  display.api.on_title_change = [](cef_display_handler_t*, cef_browser_t* value, const cef_string_t* title_) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab) return;
    std::u16string title = title_ && title_->str ? std::u16string(title_->str, title_->length) : std::u16string();
    size_t end = std::min<size_t>(title.size(), 1024);
    if (end < title.size() && end > 0 && title[end - 1] >= 0xD800 && title[end - 1] <= 0xDBFF) end--;
    tabEvent(tab, "title", json::object({{"title", json::fromUtf16(title.data(), end)}}));
  };
  display.api.on_favicon_urlchange = [](cef_display_handler_t*, cef_browser_t* value, cef_string_list_t icons) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab || tab->closing) return;
    // Chromium lists the declared icons in document order, else the default /favicon.ico.
    std::string chosen;
    bool found = false;
    for (const auto& address : listStrings(icons, 32))
      if (json::utf16Length(address) <= 4096 && allowedURL(address, true) && address != "about:blank") {
        chosen = address;
        found = true;
        break;
      }
    requestIcon(tab, value, found ? &chosen : nullptr);
  };
  display.api.on_address_change = [](cef_display_handler_t*, cef_browser_t* value, cef_frame_t* frame, const cef_string_t* address_) {
    HOLD(value); HOLD(frame);
    Tab* tab = tabFor(value);
    if (!tab || !frame->is_main(frame)) return;
    std::string address = utf8(address_);
    // CEF does not send load callbacks for pushState or fragment navigation.
    // Revoke the old target, then explicitly label this already-committed page.
    bool sameDocument = webBrowsing && allowedURL(address) && tab->hasCommittedDocument &&
                        (tab->sameDocumentNavigation || (tab->paintAllowed && address != tab->committedDocumentURL));
    if (sameDocument) {
      // The document (and its RenderFrameHost) is unchanged; only its target is revoked.
      if (!tab->sameDocumentNavigation) {
        std::string retained = tab->documentFrame;
        bool hadFrame = tab->hasDocumentFrame;
        invalidateNavigation(tab);
        tab->documentFrame = retained;
        tab->hasDocumentFrame = hadFrame;
      }
      tab->committedDocumentURL = address;
      tab->hasCommittedDocument = true;
      tab->paintAllowed = true;
      tabEvent(tab, "url", json::object({{"url", address}}));
      tabEvent(tab, "load", json::object({{"http_status", 0}, {"restored_from_history", false}, {"same_document", true}}));
      if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "success"); tab->navigationRequest.clear(); }
      resetNavigation(tab);
      invalidateView(value);
    } else tabEvent(tab, "url", json::object({{"url", address}}));
  };
  loading.api.on_loading_state_change = [](cef_load_handler_t*, cef_browser_t* value, int isLoading, int canBack, int canForward) {
    HOLD(value);
    if (Tab* tab = tabFor(value))
      tabEvent(tab, "loading", json::object({{"loading", bool(isLoading)}, {"can_go_back", bool(canBack)},
                                             {"can_go_forward", bool(canForward)}}));
  };
  loading.api.on_load_end = [](cef_load_handler_t*, cef_browser_t* value, cef_frame_t* frame, int status) {
    HOLD(value); HOLD(frame);
    Tab* tab = tabFor(value);
    if (!tab || !frame->is_main(frame)) return;
    // CEF commits (OnLoadStart) before it finishes (OnLoadEnd) every document it
    // loads, BFCache restores included. Error pages commit via OnLoadError only.
    if (!tab->hasDocumentFrame || take(frame->get_identifier(frame)) != tab->documentFrame) return;
    std::string address = take(frame->get_url(frame));
    bool restored = status == 0 && tab->historyNavigation && !tab->navigationRequest.empty() && tab->hasHistoryURL &&
                    tab->historyURL == address && tab->committedURLs.count(address) && allowedURL(address);
    bool committed = (webBrowsing ? (status >= 200 && status <= 599) : status == 200) && allowedURL(address);
    tab->paintAllowed = committed || restored || (webBrowsing && status == 0 && address == "about:blank");
    if (tab->paintAllowed) { tab->committedDocumentURL = address; tab->hasCommittedDocument = true; }
    if (committed) {
      if (tab->committedURLs.size() >= 1024) tab->committedURLs.clear();
      tab->committedURLs.insert(address);
    }
    tabEvent(tab, "load", json::object({{"http_status", status}, {"restored_from_history", restored}}));
    if (!tab->navigationRequest.empty()) {
      complete(tab->navigationRequest, tab->paintAllowed ? "success" : "failed");
      tab->navigationRequest.clear();
    }
    resetNavigation(tab);
    tab->supersededLoads = 0;
    invalidateView(value);
  };
  loading.api.on_load_error = [](cef_load_handler_t*, cef_browser_t* value, cef_frame_t* frame, cef_errorcode_t code,
                                 const cef_string_t*, const cef_string_t* failed) {
    HOLD(value); HOLD(frame);
    Tab* tab = tabFor(value);
    if (!tab || !frame->is_main(frame)) return;
    if (webBrowsing && code == ERR_ABORTED && tab->supersededLoads > 0 && (!tab->hasNavigateURL || utf8(failed) != tab->navigateURL)) {
      // The replaced load reports its own cancellation; the current request continues.
      tab->supersededLoads--;
      return;
    }
    if (webBrowsing && code == ERR_ABORTED) {
      // Chromium uses ABORTED for replaced navigations and denied downloads.
      // The replacement's callbacks establish its own success; never label a
      // cancellation as a renderer crash or replay its potentially unsafe POST.
      resetNavigation(tab);
      tabEvent(tab, "error", json::object({{"code", "navigation_cancelled"}, {"native_code", int(code)}}));
      if (!tab->navigationRequest.empty()) { unsupported(tab->navigationRequest, "NAVIGATION_CANCELLED"); tab->navigationRequest.clear(); }
      restoreCancelledDocument(tab, value);
      return;
    }
    tab->paintAllowed = false;
    resetNavigation(tab);
    tab->hasCommittedDocument = false; tab->committedDocumentURL.clear();
    tab->hasDocumentFrame = false; tab->documentFrame.clear();
    tabEvent(tab, "error", json::object({{"code", "load_failed"}, {"native_code", int(code)}}));
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "failed"); tab->navigationRequest.clear(); }
  };
  request.api.on_render_process_terminated = [](cef_request_handler_t*, cef_browser_t* value, cef_termination_status_t, int code,
                                                 const cef_string_t*) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab) return;
    invalidateNavigation(tab);
    resetNavigation(tab);
    tabEvent(tab, "error", json::object({{"code", "render_process_terminated"}, {"native_code", code}}));
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "failed"); tab->navigationRequest.clear(); }
    // Recovery is explicit reload/back/switch in Zen; never replay form submits.
  };
}

// ---- UI-thread tick (host.mm main loop) ---------------------------------------------------
static int exitStatus = 0;
static std::chrono::steady_clock::time_point startedAt = std::chrono::steady_clock::now();
static int stage = 0;
static bool closing = false;
static double firstLoadAt = -1;
static std::chrono::steady_clock::time_point closeStarted;
static uint64_t heartbeatSequence = 0;
static std::chrono::steady_clock::time_point nextHeartbeat{};
static bool scale1Frame = false, scale2Frame = false;

static void tick() {
  if (closed) { p_cef_quit_message_loop(); return; }
  auto now = std::chrono::steady_clock::now();
  double elapsed = std::chrono::duration<double>(now - startedAt).count();
  if (!streaming && loaded && firstLoadAt < 0) firstLoadAt = elapsed;
  double exerciseElapsed = firstLoadAt < 0 ? -1 : elapsed - firstLoadAt;
  if (streaming) {
    pumpCommands();
    if (interrupted || transport.failed() || transport.eof()) streamClosing = true;
    if (streamClosing && !closing) {
      closing = true;
      closeStarted = now;
      // Whatever teardown does (CEF shutdown, destructors), exit is bounded:
      // 25 s for a requested shutdown (10 s close + Chromium's own watchdogs),
      // 5 s after EOF, a protocol failure or a signal.
      bool requested = !shutdownRequest.empty();
      platform::armExitWatchdog(requested ? 25 : 5, 76, requested ? "shutdown" : "failure");
    }
    // cef-v1 liveness: emitted from this CEF UI-thread task (not a transport thread), so a
    // frozen or deadlocked UI thread stops it. Never while closing; no catch-up after a stall.
    if (streamReady && !closing && !streamClosing && !transport.failed()) {
      if (nextHeartbeat == std::chrono::steady_clock::time_point{}) nextHeartbeat = now + std::chrono::milliseconds(HeartbeatIntervalMs);
      else if (now >= nextHeartbeat) {
        event("heartbeat", json::object({{"sequence", ++heartbeatSequence}}));
        nextHeartbeat = now + std::chrono::milliseconds(HeartbeatIntervalMs);
      }
    }
    if (closing) { streamCloseAll(); if (streamIdle()) closed = true; }
    if (closing && std::chrono::duration<double>(now - closeStarted).count() > 10) {
      exitStatus = 75;
      p_cef_quit_message_loop();
      return;
    }
  }
  if (!streaming && browser && !closing) {
    auto* h = browser->get_host(browser);
    // Focus first, type one tick later: characters sent in the same task as the first
    // set_focus can reach the widget before it is focused and are dropped (seen on Linux).
    if (stage == 0 && loaded && exerciseElapsed > 1 && !e0Focused) {
      h->set_focus(h, 1);
      e0Focused = true;
    } else if (stage == 0 && loaded && exerciseElapsed > 2) {
      captureName = "cef-e0-input.png";
      h->set_focus(h, 1);
      for (char c : std::string("CEF")) {
        cef_key_event_t k{};
        k.size = sizeof(k);
        k.type = KEYEVENT_CHAR;
        k.character = char16_t(c);
        k.unmodified_character = char16_t(c);
        h->send_key_event(h, &k);
      }
      event("native_input_sent", json::object({{"text", "CEF"}}));
      stage++;
    } else if (stage == 1 && exerciseElapsed > 4) {
      width = 1000; height = 700;
      captureName = "cef-e0-retina-resize.png";
      h->was_resized(h);
      event("resize", json::object({{"widthDIP", width}, {"heightDIP", height}, {"deviceScale", deviceScale}}));
      stage++;
    } else if (stage == 2 && exerciseElapsed > 5) {
      // Device scale 1x: the same logical view, physical pixels halve.
      deviceScale = 1.0;
      captureName = "cef-e0-scale1.png";
      h->notify_screen_info_changed(h);
      h->was_resized(h);
      event("device_scale", json::object({{"deviceScale", deviceScale}}));
      stage++;
    } else if (stage == 3 && exerciseElapsed > 6) {
      deviceScale = 2.0;
      h->notify_screen_info_changed(h);
      h->was_resized(h);
      cef_mouse_event_t m{};
      m.x = 400; m.y = 500;
      h->send_mouse_wheel_event(h, &m, 0, -550);
      captureName = "cef-e0-scroll.png";
      event("native_scroll_sent", json::object({{"deviceScale", deviceScale}}));
      stage++;
    } else if (stage == 4 && exerciseElapsed > 8) {
      auto* f = browser->get_main_frame(browser);
      auto next = initialURL + u"?page=2";
      auto s = view(next);
      f->load_url(f, &s);
      f->base.release(&f->base);
      stage++;
    } else if (stage == 5 && exerciseElapsed > 10) {
      if (browser->can_go_back(browser)) { browser->go_back(browser); event("back"); }
      stage++;
    }
    h->base.release(&h->base);
  }
  if (!streaming && !closing && (interrupted || exerciseElapsed > 12 || elapsed > 60)) { closing = true; closeBrowser(); }
  if (!streaming && elapsed > 85) {
    event("timeout", json::object({{"stage", stage}}));
    exitStatus = 75;
    p_cef_quit_message_loop();
    return;
  }
  postUI(tick, 10);
}
static void runLoop() {
  startedAt = std::chrono::steady_clock::now();
  // The pipe reader wakes this thread through CEF tasks; the 10 ms tick remains the fallback.
  postUI(tick, 10);
  cef::p_cef_run_message_loop();
}
