// Included by host_core.cc. Port of stream.inc "Browser UI delegation", page icons,
// open-in-tab and pop-up blocking (contracts/cef-v1.md "Browser UI delegation").
// Chromium never draws browser UI. Each CEF UI callback becomes a `prompt` event with
// a host-issued prompt_id; Zen renders it with Firefox UI and answers once. A reply
// must name that prompt_id, its kind and the exact current target; page prompts are
// also bound to the generations they were issued for. Replies are single use.
// Timeout, navigation, reset, close and shutdown answer with the safe default
// (cancel/deny/stay), then emit `prompt_closed`. Nothing here is reachable from
// page content: commands arrive only over the authenticated private pipe.

enum PromptKind { PromptContextMenu, PromptDialog, PromptBeforeUnload, PromptPermission, PromptFile, PromptDownload, PromptAuth };
struct Prompt {
  uint64_t id = 0;
  PromptKind kind = PromptDialog;
  Tab* tab = nullptr;
  Value target;
  bool pageBound = true;                       // cancelled by navigation (all but downloads)
  cef_base_ref_counted_t* callback = nullptr;  // one reference owned by this prompt
  cef_frame_t* frame = nullptr;                // context menu: the frame it was opened on
  std::string link, source, misspelled;
  std::vector<std::string> suggestions;
  int mediaType = 0;
  int fileMode = 0;
  uint32_t download = 0;
  uint64_t nativePrompt = 0;
};
static std::map<uint64_t, Prompt*> prompts;
static uint64_t lastPrompt = 0;
static constexpr size_t MaxPrompts = 64, MaxPromptsPerTab = 8;
struct ActiveDownload { Tab* tab = nullptr; bool accepted = false; cef_download_item_callback_t* control = nullptr; };
static std::map<uint32_t, ActiveDownload> activeDownloads;
static int pendingImageCopies = 0;
static Ref<cef_find_handler_t> finds;
static Ref<cef_download_image_callback_t> imageCopy;

static std::vector<std::string> listStrings(cef_string_list_t list, size_t maximum) {
  std::vector<std::string> result;
  if (!list) return result;
  size_t count = std::min(p_cef_string_list_size(list), maximum);
  for (size_t i = 0; i < count; i++) {
    cef_string_t value{};
    if (p_cef_string_list_value(list, i, &value)) {
      result.push_back(utf8(&value));
      if (value.dtor) value.dtor(value.str);
    } else result.push_back(std::string());
  }
  return result;
}
// Display text bounded in UTF-16 code units; never splits a surrogate pair. A clipped
// string is display text, never a URL.
static std::string clip(const std::string& value, size_t maximum) {
  if (json::utf16Length(value) <= maximum) return value;
  std::u16string wide = json::toUtf16(value);
  size_t end = std::min(maximum, wide.size());
  if (end > 0 && wide[end - 1] >= 0xD800 && wide[end - 1] <= 0xDBFF) end--;
  return json::fromUtf16(wide.data(), end) + "\xE2\x80\xA6";  // U+2026
}
// URLs are sent whole or not at all: a truncated URL would be a different address.
static std::string wholeURL(const std::string& value, size_t maximum) {
  return !value.empty() && json::utf16Length(value) <= maximum && allowedURL(value, true) ? value : std::string();
}
static std::string promptName(uint64_t id) { return "prompt-" + std::to_string(id); }
static const char* kindName(PromptKind kind) {
  switch (kind) {
    case PromptContextMenu: return "context_menu";
    case PromptDialog: return "dialog";
    case PromptBeforeUnload: return "before_unload";
    case PromptPermission: return "permission";
    case PromptFile: return "file_dialog";
    case PromptDownload: return "download";
    case PromptAuth: return "auth";
  }
  return "dialog";
}
static void stayOnPage(Tab* tab) {
  // The user (or a safe default) kept the page: the navigation that asked is cancelled.
  if (!tab->navigationRequest.empty()) {
    unsupported(tab->navigationRequest, "NAVIGATION_CANCELLED");
    tab->navigationRequest.clear();
    resetNavigation(tab);
  }
  if (tab->browser) restoreCancelledDocument(tab, tab->browser);
}
// Safe default for every kind: nothing is granted, selected, uploaded or saved.
static void denyPrompt(Prompt* p, bool userDismissed = false) {
  if (!p->callback) return;
  switch (p->kind) {
    case PromptContextMenu: { auto* c = reinterpret_cast<cef_run_context_menu_callback_t*>(p->callback); c->cancel(c); break; }
    case PromptDialog: { auto* c = reinterpret_cast<cef_jsdialog_callback_t*>(p->callback); c->cont(c, 0, nullptr); break; }
    case PromptBeforeUnload: {
      auto* c = reinterpret_cast<cef_jsdialog_callback_t*>(p->callback);
      bool leave = streamClosing || p->tab->closing;
      c->cont(c, leave ? 1 : 0, nullptr);
      if (!leave) stayOnPage(p->tab);
      break;
    }
    case PromptPermission: {
      auto* c = reinterpret_cast<cef_permission_prompt_callback_t*>(p->callback);
      c->cont(c, userDismissed ? CEF_PERMISSION_RESULT_DENY : CEF_PERMISSION_RESULT_DISMISS);
      break;
    }
    case PromptFile: { auto* c = reinterpret_cast<cef_file_dialog_callback_t*>(p->callback); c->cancel(c); break; }
    case PromptDownload: break;  // An unexecuted before-download callback cancels the download.
    case PromptAuth: { auto* c = reinterpret_cast<cef_auth_callback_t*>(p->callback); c->cancel(c); break; }
  }
}
static void releasePrompt(Prompt* p) {
  if (p->callback) p->callback->release(p->callback);
  if (p->frame) p->frame->base.release(&p->frame->base);
  if (p->kind == PromptDownload && !activeDownloads[p->download].accepted) activeDownloads.erase(p->download);
  prompts.erase(p->id);
  delete p;
}
// Answering or denying calls back into CEF, which can re-enter synchronously: a
// JS dialog's cont() runs Chromium's dialog reset, i.e. on_reset_dialog_state.
// A prompt therefore leaves `prompts` before any CEF call, so a re-entrant path
// never finds, answers or frees it a second time.
static Prompt* detachPrompt(uint64_t id) {
  auto found = prompts.find(id);
  if (found == prompts.end()) return nullptr;
  Prompt* p = found->second;
  prompts.erase(found);
  return p;
}
static void closePrompt(Prompt* p, const std::string& reason, bool deny = true) {
  prompts.erase(p->id);
  // Zen learns first (while the target still matches), then the page is released.
  tabEvent(p->tab, "prompt_closed", json::object({{"prompt_id", promptName(p->id)}, {"reason", reason}}));
  if (deny) denyPrompt(p);
  releasePrompt(p);
}
static void closePromptsFor(Tab* tab, const std::string& reason, bool pageOnly) {
  std::vector<uint64_t> matched;
  for (auto& item : prompts) if (item.second->tab == tab && (!pageOnly || item.second->pageBound)) matched.push_back(item.first);
  // Re-look each one up: closing one may already have closed another.
  for (uint64_t id : matched) if (Prompt* p = detachPrompt(id)) closePrompt(p, reason);
}
static Prompt* issuePrompt(Tab* tab, PromptKind kind, cef_base_ref_counted_t* callback, Value details, int seconds,
                           bool pageBound = true) {
  if (!webBrowsing || !tab || !tab->browser || tab->closing || streamClosing || !tab->live()) return nullptr;
  size_t perTab = 0;
  for (auto& item : prompts) if (item.second->tab == tab) perTab++;
  if (prompts.size() >= MaxPrompts || perTab >= MaxPromptsPerTab) {
    tabEvent(tab, "error", json::object({{"code", "prompt_limit"}}));
    return nullptr;
  }
  if (lastPrompt >= MaxGeneration) { failProtocol(); return nullptr; }
  uint64_t id = lastPrompt + 1;
  Value item = json::object({{"event", "prompt"}, {"version", 1}, {"target", tab->target}, {"prompt_id", promptName(id)},
                             {"kind", kindName(kind)}, {"details", std::move(details)}, {"timeout_ms", seconds * 1000}});
  std::string encoded = json::write(item);
  // A prompt that cannot be described within one bounded event is denied, not truncated.
  if (encoded.empty() || encoded.size() > axio::MaxMeta - 256) {
    tabEvent(tab, "error", json::object({{"code", "prompt_too_large"}}));
    return nullptr;
  }
  auto* p = new Prompt();
  p->id = lastPrompt = id;
  p->kind = kind;
  p->tab = tab;
  p->target = tab->target;
  p->pageBound = pageBound;
  p->callback = callback;
  callback->add_ref(callback);
  prompts[id] = p;
  transport.event(encoded);
  postUI([id] { auto found = prompts.find(id); if (found != prompts.end()) closePrompt(found->second, "timeout"); },
         int64_t(seconds) * 1000);
  return p;
}
static void cancelDownloadsFor(Tab* tab) {
  for (auto it = activeDownloads.begin(); it != activeDownloads.end();) {
    if (it->second.tab != tab) { ++it; continue; }
    if (it->second.control) {
      it->second.control->cancel(it->second.control);
      it->second.control->base.release(&it->second.control->base);
    }
    it = activeDownloads.erase(it);
  }
}
static const char* mediaName(int type) {
  switch (type) {
    case CM_MEDIATYPE_IMAGE: return "image";
    case CM_MEDIATYPE_VIDEO: return "video";
    case CM_MEDIATYPE_AUDIO: return "audio";
    case CM_MEDIATYPE_CANVAS: return "canvas";
    case CM_MEDIATYPE_FILE: return "file";
    case CM_MEDIATYPE_PLUGIN: return "plugin";
    default: return "none";
  }
}
// Permissions Zen may ask about. Capture (camera/mic/screen) is refused natively:
// the host has no capture path of its own (capabilities.media_capture:false);
// unknown kinds are denied rather than guessed. Returns false to deny.
static bool permissionNames(uint32_t requested, bool* capture, Value& names) {
  static const std::pair<uint32_t, const char*> known[] = {
      {CEF_PERMISSION_TYPE_GEOLOCATION, "geolocation"}, {CEF_PERMISSION_TYPE_NOTIFICATIONS, "notifications"},
      {CEF_PERMISSION_TYPE_CLIPBOARD, "clipboard"}, {CEF_PERMISSION_TYPE_STORAGE_ACCESS, "storage_access"},
      {CEF_PERMISSION_TYPE_TOP_LEVEL_STORAGE_ACCESS, "top_level_storage_access"},
      {CEF_PERMISSION_TYPE_DISK_QUOTA, "persistent_storage"}, {CEF_PERMISSION_TYPE_LOCAL_FONTS, "local_fonts"},
      {CEF_PERMISSION_TYPE_IDLE_DETECTION, "idle_detection"}, {CEF_PERMISSION_TYPE_MIDI_SYSEX, "midi_sysex"},
      {CEF_PERMISSION_TYPE_MULTIPLE_DOWNLOADS, "multiple_downloads"}, {CEF_PERMISSION_TYPE_KEYBOARD_LOCK, "keyboard_lock"},
      {CEF_PERMISSION_TYPE_POINTER_LOCK, "pointer_lock"}, {CEF_PERMISSION_TYPE_WINDOW_MANAGEMENT, "window_management"},
      {CEF_PERMISSION_TYPE_FILE_SYSTEM_ACCESS, "file_system_access"}, {CEF_PERMISSION_TYPE_SENSORS, "sensors"},
      {1u << 25, "local_network"},  // LOCAL_NETWORK_ACCESS (renamed across API versions)
      {CEF_PERMISSION_TYPE_LOCAL_NETWORK, "local_network"}, {CEF_PERMISSION_TYPE_LOOPBACK_NETWORK, "local_network"}};
  uint32_t media = CEF_PERMISSION_TYPE_CAMERA_STREAM | CEF_PERMISSION_TYPE_MIC_STREAM |
                   CEF_PERMISSION_TYPE_CAMERA_PAN_TILT_ZOOM | CEF_PERMISSION_TYPE_CAPTURED_SURFACE_CONTROL;
  *capture = (requested & media) != 0;
  if (*capture || !requested) return false;
  names = json::array();
  uint32_t covered = 0;
  for (const auto& item : known) {
    if (!(requested & item.first)) continue;
    covered |= item.first;
    Value name(item.second);
    if (std::find(names.items.begin(), names.items.end(), name) == names.items.end()) names.items.push_back(name);
  }
  return covered == requested;
}
static bool absolutePath(const Value* value) {
  if (!textValue(value, 4096) || value->text.empty() || value->text[0] != '/' || value->text.find('\0') != std::string::npos)
    return false;
  size_t start = 0;
  const std::string& path = value->text;
  while (start <= path.size()) {
    size_t slash = path.find('/', start);
    std::string part = path.substr(start, slash == std::string::npos ? std::string::npos : slash - start);
    if (part == "..") return false;
    if (slash == std::string::npos) break;
    start = slash + 1;
  }
  return true;
}
static bool fileExists(const std::string& path, bool* directory) {
  struct stat info {};
  if (stat(path.c_str(), &info) != 0) return false;
  *directory = S_ISDIR(info.st_mode);
  return true;
}
static void appendList(cef_string_list_t list, const std::string& value) {
  auto wide = json::toUtf16(value);
  auto item = view(wide);
  p_cef_string_list_append(list, &item);
}
// Reply commands. Returns false when `method` is not a delegation command.
static bool uiCommand(Tab* tab, const std::string& method, const Value& command, const std::string& requestId) {
  std::vector<PromptKind> kinds;
  if (method == "context_menu_command") kinds = {PromptContextMenu};
  else if (method == "dialog_reply") kinds = {PromptDialog, PromptBeforeUnload};
  else if (method == "permission_reply") kinds = {PromptPermission};
  else if (method == "file_dialog_reply") kinds = {PromptFile};
  else if (method == "download_reply") kinds = {PromptDownload};
  else if (method == "auth_reply") kinds = {PromptAuth};
  bool other = oneOf(method, {"download_control", "find", "stop_finding", "zoom"});
  if (kinds.empty() && !other) return false;
  if (!webBrowsing) { unsupported(requestId, "fixture_only"); return true; }
  cef_browser_t* current = tab->browser;
  if (other) {
    auto* host = current->get_host(current);
    bool ok = true;
    if (method == "find") {
      const Value* text = command.get("text");
      if (!textValue(text, 1024) || text->text.empty() || !boolean(command.get("forward")) ||
          !boolean(command.get("match_case")) || !boolean(command.get("find_next"))) {
        host->base.release(&host->base);
        failProtocol();
        return true;
      }
      event("accepted", json::object({{"request_id", requestId}}));
      auto value = json::toUtf16(text->text);
      auto searched = view(value);
      host->find(host, &searched, command.flag("forward"), command.flag("match_case"), command.flag("find_next"));
    } else if (method == "stop_finding") {
      if (!boolean(command.get("clear_selection"))) { host->base.release(&host->base); failProtocol(); return true; }
      event("accepted", json::object({{"request_id", requestId}}));
      host->stop_finding(host, command.flag("clear_selection"));
    } else if (method == "zoom") {
      const Value* level = command.get("level");
      if (!level || !level->isNumber() || !std::isfinite(level->number) || std::fabs(level->number) > 10) {
        host->base.release(&host->base);
        failProtocol();
        return true;
      }
      event("accepted", json::object({{"request_id", requestId}}));
      host->set_zoom_level(host, level->number);
    } else {
      const Value* action = command.get("action");
      if (!integer(command.get("download_id"), UINT32_MAX) || !action || !action->isString() ||
          !oneOf(action->text, {"cancel", "pause", "resume"})) {
        host->base.release(&host->base);
        failProtocol();
        return true;
      }
      auto found = activeDownloads.find(uint32_t(command.num("download_id")));
      ok = found != activeDownloads.end() && found->second.tab == tab && found->second.accepted && found->second.control;
      if (ok) {
        event("accepted", json::object({{"request_id", requestId}}));
        auto* control = found->second.control;
        if (action->text == "cancel") control->cancel(control);
        else if (action->text == "pause") control->pause(control);
        else control->resume(control);
      }
    }
    host->base.release(&host->base);
    if (ok) complete(requestId, "success");
    else event("error", json::object({{"request_id", requestId}, {"code", "stale_download"}}));
    return true;
  }
  const Value* nameValue = command.get("prompt_id");
  if (!identifier(nameValue) || nameValue->text.rfind("prompt-", 0) != 0) { failProtocol(); return true; }
  const std::string name = nameValue->text;
  uint64_t number = strtoull(name.c_str() + 7, nullptr, 10);
  auto found = prompts.find(number);
  Prompt* p = found == prompts.end() ? nullptr : found->second;
  // Unknown, answered, expired, foreign-tab, wrong-kind or stale-generation replies
  // do nothing. Timeouts race legitimately with the user, so this is not fatal.
  if (!p || promptName(number) != name || p->tab != tab ||
      std::find(kinds.begin(), kinds.end(), p->kind) == kinds.end() || (p->pageBound && p->target != tab->target)) {
    event("error", json::object({{"request_id", requestId}, {"code", "stale_prompt"}}));
    return true;
  }
  prompts.erase(found);  // before any CEF call (see detachPrompt)
  auto* host = current->get_host(current);
  bool valid = true;
  if (p->kind == PromptContextMenu) {
    const Value* actionValue = command.get("command");
    valid = textValue(actionValue, 32) &&
            oneOf(actionValue->text, {"dismiss", "copy", "cut", "paste", "select_all", "undo", "redo", "copy_image",
                                      "save_image", "save_link", "spelling", "add_to_dictionary"}) &&
            integer(command.get("index"), 16);
    if (valid) {
      event("accepted", json::object({{"request_id", requestId}}));
      const std::string& action = actionValue->text;
      cef_frame_t* frame = p->frame;
      int index = int(command.num("index"));
      if (frame && action == "copy") frame->copy(frame);
      else if (frame && action == "cut") frame->cut(frame);
      else if (frame && action == "paste") frame->paste(frame);
      else if (frame && action == "select_all") frame->select_all(frame);
      else if (frame && action == "undo") frame->undo(frame);
      else if (frame && action == "redo") frame->redo(frame);
      else if ((action == "save_image" || action == "copy_image") && !p->source.empty()) {
        auto value = json::toUtf16(p->source);
        auto address = view(value);
        // Both use Chromium's own network context, cookies and cache for this page.
        if (action == "save_image") host->start_download(host, &address);
        else if (p->mediaType == CM_MEDIATYPE_IMAGE && pendingImageCopies < 4) {
          pendingImageCopies++;
          host->download_image(host, &address, 0, 0, 0, imageCopy.retain());
        }
      } else if (action == "save_link" && !p->link.empty()) {
        auto value = json::toUtf16(p->link);
        auto address = view(value);
        host->start_download(host, &address);
      } else if (action == "spelling" && index < int(p->suggestions.size())) {
        auto value = json::toUtf16(p->suggestions[size_t(index)]);
        auto word = view(value);
        host->replace_misspelling(host, &word);
      } else if (action == "add_to_dictionary" && !p->misspelled.empty()) {
        auto value = json::toUtf16(p->misspelled);
        auto word = view(value);
        host->add_word_to_dictionary(host, &word);
      }
      denyPrompt(p);  // closes the native menu model; the chosen action already ran
    }
  } else if (p->kind == PromptDialog || p->kind == PromptBeforeUnload) {
    valid = boolean(command.get("accept")) && textValue(command.get("text"), 4096);
    if (valid) {
      event("accepted", json::object({{"request_id", requestId}}));
      bool accept = command.flag("accept");
      auto* c = reinterpret_cast<cef_jsdialog_callback_t*>(p->callback);
      auto value = json::toUtf16(command.str("text"));
      auto text = view(value);
      c->cont(c, accept ? 1 : 0, p->kind == PromptDialog ? &text : nullptr);
      if (p->kind == PromptBeforeUnload && !accept) stayOnPage(tab);
    }
  } else if (p->kind == PromptPermission) {
    const Value* decision = command.get("decision");
    valid = textValue(decision, 16) && oneOf(decision->text, {"allow", "deny", "dismiss"});
    if (valid) {
      event("accepted", json::object({{"request_id", requestId}}));
      auto* c = reinterpret_cast<cef_permission_prompt_callback_t*>(p->callback);
      c->cont(c, decision->text == "allow" ? CEF_PERMISSION_RESULT_ACCEPT
                                           : (decision->text == "deny" ? CEF_PERMISSION_RESULT_DENY : CEF_PERMISSION_RESULT_DISMISS));
    }
  } else if (p->kind == PromptFile) {
    const Value* paths = command.get("paths");
    valid = paths && paths->isArray() && paths->items.size() <= 64 &&
            (p->fileMode == FILE_DIALOG_OPEN_MULTIPLE || paths->items.size() <= 1);
    if (valid) {
      for (const auto& path : paths->items) {
        bool directory = false;
        bool exists = absolutePath(&path) && fileExists(path.text, &directory);
        if (p->fileMode == FILE_DIALOG_SAVE) {
          bool parentDirectory = false;
          valid = valid && absolutePath(&path) && fileExists(url::deletingLastPathComponent(path.text), &parentDirectory) &&
                  parentDirectory && !(exists && directory);
        } else valid = valid && exists && (p->fileMode == FILE_DIALOG_OPEN_FOLDER ? directory : !directory);
      }
    }
    if (valid) {
      event("accepted", json::object({{"request_id", requestId}}));
      auto* c = reinterpret_cast<cef_file_dialog_callback_t*>(p->callback);
      if (paths->items.empty()) c->cancel(c);
      else {
        cef_string_list_t list = p_cef_string_list_alloc();
        for (const auto& path : paths->items) appendList(list, path.text);
        c->cont(c, list);
        p_cef_string_list_free(list);
      }
    }
  } else if (p->kind == PromptDownload) {
    const Value* path = command.get("path");
    bool directory = false, parentDirectory = false;
    valid = textValue(path, 4096) &&
            (path->text.empty() ||
             (absolutePath(path) && fileExists(url::deletingLastPathComponent(path->text), &parentDirectory) && parentDirectory &&
              !(fileExists(path->text, &directory) && directory)));
    if (valid) {
      event("accepted", json::object({{"request_id", requestId}}));
      if (!path->text.empty()) {
        auto* c = reinterpret_cast<cef_before_download_callback_t*>(p->callback);
        auto value = json::toUtf16(path->text);
        auto destination = view(value);
        c->cont(c, &destination, 0);
        activeDownloads[p->download].accepted = true;
      }
    }
  } else if (p->kind == PromptAuth) {
    valid = boolean(command.get("accept")) && textValue(command.get("username"), 1024) && textValue(command.get("password"), 1024);
    if (valid) {
      event("accepted", json::object({{"request_id", requestId}}));
      auto* c = reinterpret_cast<cef_auth_callback_t*>(p->callback);
      if (command.flag("accept")) {
        auto user = json::toUtf16(command.str("username")), pass = json::toUtf16(command.str("password"));
        auto u = view(user), w = view(pass);
        c->cont(c, &u, &w);
        std::fill(pass.begin(), pass.end(), u'\0');
      } else c->cancel(c);
    }
  }
  host->base.release(&host->base);
  if (!valid) { denyPrompt(p); releasePrompt(p); failProtocol(); return true; }
  // Answered exactly once: the callback reference is dropped without a second call.
  tabEvent(tab, "prompt_closed", json::object({{"prompt_id", name}, {"reason", "answered"}}));
  releasePrompt(p);
  complete(requestId, "success");
  return true;
}

// ---- Page icon --------------------------------------------------------------
// Chromium downloads the page's declared icon (or its default /favicon.ico) with
// its own network context; cookies are neither sent nor stored for favicons.
// Zen receives only a small PNG data URL and never fetches the icon itself.
constexpr uint32_t IconPixels = 32;    // 16 pt tab icon at 2x
constexpr size_t MaxIconBytes = 5400;  // base64 + target stays within transport MaxMeta
static uint64_t iconRequests = 0;
static std::string base64(const uint8_t* data, size_t size) {
  static const char alphabet[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  std::string out;
  out.reserve((size + 2) / 3 * 4);
  for (size_t i = 0; i < size; i += 3) {
    uint32_t chunk = uint32_t(data[i]) << 16;
    if (i + 1 < size) chunk |= uint32_t(data[i + 1]) << 8;
    if (i + 2 < size) chunk |= uint32_t(data[i + 2]);
    out.push_back(alphabet[(chunk >> 18) & 63]);
    out.push_back(alphabet[(chunk >> 12) & 63]);
    out.push_back(i + 1 < size ? alphabet[(chunk >> 6) & 63] : '=');
    out.push_back(i + 2 < size ? alphabet[chunk & 63] : '=');
  }
  return out;
}
static void sendIcon(Tab* tab, const std::string& data) {
  tab->iconData = data; tab->hasIconData = true;
  if (!tab->live()) return;
  Value item = json::object({{"event", "favicon"}, {"version", 1}, {"icon", data}, {"target", tab->target}});
  std::string encoded = json::write(item);
  if (encoded.size() > axio::MaxMeta - 64) {
    tab->iconData.clear();
    item["icon"] = "";
    encoded = json::write(item);
  }
  transport.event(encoded);
}
static std::string iconDataURL(cef_image_t* image) {
  if (!image || image->is_empty(image)) return std::string();
  int w = 0, h = 0;
  cef_binary_value_t* png = image->get_as_png(image, 1.0f, 1, &w, &h);
  if (!png) return std::string();
  size_t size = png->get_size(png);
  std::string result;
  if (size && size <= MaxIconBytes && w > 0 && h > 0) {
    std::vector<uint8_t> data(size);
    png->get_data(png, data.data(), size, 0);
    result = "data:image/png;base64," + base64(data.data(), data.size());
  }
  png->base.release(&png->base);
  return result;
}
// One icon download. CEF owns the only reference; the last release frees it.
struct IconDownload {
  cef_download_image_callback_t api{};
  std::atomic<int> refs{1};
  std::string key;
  uint64_t request = 0;
  IconDownload() {
    api.base.size = sizeof(api);
    api.base.add_ref = [](cef_base_ref_counted_t* b) { reinterpret_cast<IconDownload*>(b)->refs++; };
    api.base.release = [](cef_base_ref_counted_t* b) {
      auto* p = reinterpret_cast<IconDownload*>(b);
      if (--p->refs == 0) { delete p; return 1; }
      return 0;
    };
    api.base.has_one_ref = [](cef_base_ref_counted_t* b) { return int(reinterpret_cast<IconDownload*>(b)->refs == 1); };
    api.base.has_at_least_one_ref = [](cef_base_ref_counted_t* b) { return int(reinterpret_cast<IconDownload*>(b)->refs > 0); };
    api.on_download_image_finished = [](cef_download_image_callback_t* self, const cef_string_t*, int, cef_image_t* image) {
      HOLD(image);
      auto* d = reinterpret_cast<IconDownload*>(self);
      auto found = tabsByKey.find(d->key);
      Tab* tab = found != tabsByKey.end() ? found->second : nullptr;
      // A newer icon, document or target replaced this request.
      if (!tab || tab->closing || tab->iconRequest != d->request) return;
      sendIcon(tab, iconDataURL(image));
    };
  }
};
static void requestIcon(Tab* tab, cef_browser_t* value, const std::string* address) {
  if (!address) {
    tab->hasIconURL = false; tab->iconURL.clear();
    tab->iconRequest = ++iconRequests;
    sendIcon(tab, std::string());
    return;
  }
  // The same icon for the next document: resend what Zen already showed.
  if (tab->hasIconURL && *address == tab->iconURL && tab->hasIconData) { sendIcon(tab, tab->iconData); return; }
  tab->iconURL = *address; tab->hasIconURL = true;
  tab->hasIconData = false; tab->iconData.clear();
  tab->iconRequest = ++iconRequests;
  auto* download = new IconDownload();
  download->key = tab->key;
  download->request = tab->iconRequest;
  auto text = json::toUtf16(*address);
  auto icon = view(text);
  auto* host = value->get_host(value);
  host->download_image(host, &icon, 1, IconPixels, 0, &download->api);
  host->base.release(&host->base);
}
static void configureDelegation() {
  client.api.get_find_handler = [](cef_client_t*) { return finds.retain(); };
  finds.api.on_find_result = [](cef_find_handler_t*, cef_browser_t* value, int identifier, int count, const cef_rect_t*,
                                int active, int final_) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab || !webBrowsing) return;
    tabEvent(tab, "find_result", json::object({{"identifier", std::max(0, identifier)}, {"count", std::max(0, count)},
                                               {"active", std::max(0, active)}, {"final", bool(final_)}}));
  };
  imageCopy.api.on_download_image_finished = [](cef_download_image_callback_t*, const cef_string_t*, int, cef_image_t* image) {
    HOLD(image);
    if (pendingImageCopies <= 0) return;
    pendingImageCopies--;
    if (!image) return;
    int w = 0, h = 0;
    cef_binary_value_t* png = image->get_as_png(image, 1.0f, 1, &w, &h);
    if (!png) return;
    size_t size = png->get_size(png);
    if (size && size <= 32 * 1024 * 1024) {
      std::vector<uint8_t> data(size);
      png->get_data(png, data.data(), size, 0);
      platform::copyImage(data.data(), data.size());
    }
    png->base.release(&png->base);
  };
}
static void openInTab(Tab* tab, const cef_string_t* value, bool background) {
  std::string address = utf8(value);
  // The new Zen tab starts its own Chromium target in this same profile. It is
  // never a native window, and non-web schemes remain denied.
  if (webBrowsing && allowedURL(address) && address != "about:blank")
    tabEvent(tab, "open_url", json::object({{"url", address}, {"background", background}}));
  else tabEvent(tab, "error", json::object({{"code", "popup_denied"}}));
}
// A pop-up without a user gesture never opens; Zen shows Firefox's pop-up blocked bar.
static void blockedPopup(Tab* tab, const cef_string_t* value) {
  std::string address = utf8(value);
  if (webBrowsing && json::utf16Length(address) <= 2048 && allowedURL(address) && address != "about:blank")
    tabEvent(tab, "popup_blocked", json::object({{"url", address}}));
  else tabEvent(tab, "error", json::object({{"code", "popup_denied"}}));
}
