// Included by host_core.cc. Port of ../input.inc: keyboard verdicts, IME, wheel
// phases, pinch and frame-rate renegotiation (contracts/cef-v1.md "Input
// extensions"). All state is UI-thread owned. Nothing here blocks: verdicts
// complete from CEF callbacks or a timer.
//
// Key verdicts. Chromium acknowledges keyboard events strictly in order per widget
// and hands only unconsumed ones to CefKeyboardHandler::OnKeyEvent. A consumed
// keydown produces no callback, so after each keydown (and its own `char`) the host
// sends one inert probe: a KEYEVENT_CHAR that Blink reports "not handled" before any
// DOM dispatch because it is a system key (WebFrameWidgetImpl::HandleCharEvent).
// How the probe is marked and recognised is platform-specific (core/platform.hpp):
// macOS sets is_system_key, Linux holds Alt+Ctrl (CEF's Linux translator derives
// is_system_key from Alt; Ctrl keeps it out of Blink's Alt-only access keys). A
// keydown whose own unhandled report precedes its probe is `key_not_consumed`; one
// whose probe arrives first was consumed by the renderer. The probe is deferred
// until the keydown's `char` (or any later command) because a system-key char also
// clears Blink's "suppress next keypress" flag. No answer within
// KeyVerdictTimeoutMs, or a target that closes, completes `key_not_consumed` so
// Zen's shortcuts still run.
static constexpr int64_t KeyProbeDelayMs = 30, KeyVerdictTimeoutMs = 500;
static constexpr size_t MaxKeyWaits = 32, MaxProbesInFlight = 64;
static constexpr size_t ImeTextLimit = 1024, ImeUnderlineLimit = 16;
static constexpr int64_t ImeRangeLimit = INT32_MAX, ImeCursorLimit = 65536;
static constexpr uint64_t TextInputIntervalNs = 16000000;  // at most ~60 text_input events/s per tab

static void completeKey(const std::string& requestId, bool consumed) {
  event("completed", json::object({{"request_id", requestId}, {"status", "success"},
                                   {"reason", consumed ? "key_consumed" : "key_not_consumed"}}));
}
// Resolve every waiting keydown up to and including `seq`.
static void resolveKeysThrough(Tab* tab, uint64_t seq, bool consumed) {
  while (!tab->keyWaits.empty() && tab->keyWaits.front().seq <= seq) {
    std::string requestId = tab->keyWaits.front().request;
    tab->keyWaits.pop_front();
    completeKey(requestId, consumed);
  }
}
static void finishKeyWaits(Tab* tab) {
  while (!tab->keyWaits.empty()) {
    std::string requestId = tab->keyWaits.front().request;
    tab->keyWaits.pop_front();
    completeKey(requestId, false);
  }
  tab->probesInFlight.clear();
  tab->probeSent = tab->keySeq;
}
static void sendKeyProbe(Tab* tab) {
  if (tab->probeSent >= tab->keySeq) return;
  uint64_t seq = tab->keySeq;
  tab->probeSent = seq;
  if (!tab->browser || tab->closing) return;
  // An open <select>/date popup receives chars itself (HandleCharEvent's page
  // popup branch); without a probe the verdict comes from OnKeyEvent or the timer.
  if (tab->popupVisible) return;
  cef_key_event_t probe{};
  probe.size = sizeof(probe);
  platform::fillKeyProbe(probe, seq);
  if (tab->probesInFlight.size() >= MaxProbesInFlight) tab->probesInFlight.pop_front();
  tab->probesInFlight.push_back(seq);
  auto* host = tab->browser->get_host(tab->browser);
  host->send_key_event(host, &probe);
  host->base.release(&host->base);
}
static void scheduleKeyTimers(Tab* tab, uint64_t seq) {
  int browserId = tab->browser->get_identifier(tab->browser);
  postUI([browserId, seq] {
    Tab* current = tabForId(uint64_t(browserId));
    if (current && current->keySeq == seq) sendKeyProbe(current);
  }, KeyProbeDelayMs);
  postUI([browserId, seq] {
    Tab* current = tabForId(uint64_t(browserId));
    if (!current) return;
    for (auto it = current->keyWaits.begin(); it != current->keyWaits.end(); ++it)
      if (it->seq == seq) {
        std::string requestId = it->request;
        current->keyWaits.erase(it);
        completeKey(requestId, false);
        return;
      }
  }, KeyVerdictTimeoutMs);
}
// CefKeyboardHandler::OnKeyEvent: only events the renderer did not consume.
static void keyReport(Tab* tab, const cef_key_event_t* key) {
  uint64_t low = 0;
  if (platform::keyProbeReport(*key, low)) {
    while (!tab->probesInFlight.empty()) {
      uint64_t seq = tab->probesInFlight.front();
      tab->probesInFlight.pop_front();
      if ((seq & platform::KeyProbeMask) != low) continue;  // an earlier probe was lost (focus moved widget)
      tab->probeArrived = std::max(tab->probeArrived, seq);
      resolveKeysThrough(tab, seq, true);  // their unhandled reports would have come first
      return;
    }
    return;
  }
  if (key->type != KEYEVENT_RAWKEYDOWN || key->is_system_key) return;
  // The report belongs to the oldest keydown whose probe has not returned; the
  // key must match what that request sent.
  for (auto& wait : tab->keyWaits) {
    if (wait.seq <= tab->probeArrived) continue;
    if (!platform::sameKeydown(*key, wait.nativeKeyCode, wait.windowsKeyCode)) continue;
    uint64_t seq = wait.seq;
    if (seq > 0) resolveKeysThrough(tab, seq - 1, true);
    std::string requestId = tab->keyWaits.front().request;
    tab->keyWaits.pop_front();
    completeKey(requestId, false);
    return;
  }
}
static bool keyCommand(Tab* tab, const Value& command, const std::string& requestId) {
  const Value* type = command.get("type");
  const Value* text = command.get("text");
  if (!type || !type->isString() || !oneOf(type->text, {"down", "up", "char"}) || !integer(command.get("native_key_code"), 65535) ||
      !integer(command.get("windows_key_code"), 255) || !integer(command.get("modifiers"), 131071) || !textValue(text, 4)) {
    failProtocol();
    return true;
  }
  event("accepted", json::object({{"request_id", requestId}}));
  cef_key_event_t key{};
  key.size = sizeof(key);
  key.type = type->text == "char" ? KEYEVENT_CHAR : (type->text == "down" ? KEYEVENT_RAWKEYDOWN : KEYEVENT_KEYUP);
  key.native_key_code = int(command.num("native_key_code"));
  key.windows_key_code = int(command.num("windows_key_code"));
  key.modifiers = uint32_t(command.num("modifiers"));
  std::u16string units = json::toUtf16(text->text);
  auto* host = tab->browser->get_host(tab->browser);
  if (key.type == KEYEVENT_CHAR) {
    for (char16_t unit : units) { key.character = unit; key.unmodified_character = unit; host->send_key_event(host, &key); }
  } else {
    key.character = units.empty() ? platform::keyCharacter(key.native_key_code) : units[0];
    key.unmodified_character = key.character;
    host->send_key_event(host, &key);
  }
  host->base.release(&host->base);
  if (key.type == KEYEVENT_CHAR) { complete(requestId, "success"); sendKeyProbe(tab); return true; }
  if (key.type != KEYEVENT_RAWKEYDOWN) { complete(requestId, "success"); return true; }
  if (tab->keyWaits.size() >= MaxKeyWaits) {  // a stalled renderer: oldest verdict defaults
    std::string oldest = tab->keyWaits.front().request;
    tab->keyWaits.pop_front();
    completeKey(oldest, false);
  }
  uint64_t seq = ++tab->keySeq;
  tab->keyWaits.push_back(Tab::KeyWait{seq, requestId, key.native_key_code, key.windows_key_code});
  scheduleKeyTimers(tab, seq);
  return true;
}

// ---- Text input (IME proxy placement) ------------------------------------------
// The renderer helper reports focused-node changes (editable, password, element
// bounds) with one bounded process message, as cefclient's client_renderer does.
// The renderer is untrusted: the message is exact-schema checked, clamped to the
// view and coalesced. During composition Chromium's character bounds (view DIP,
// OnImeCompositionRangeChanged) refine the caret.
static const char* textModeName(int mode) { return mode == 2 ? "password" : (mode == 1 ? "text" : "none"); }
static void emitTextInput(Tab* tab) {
  tab->textInputScheduled = false;
  if (!tab->live() || tab->closing || streamClosing) return;
  if (tab->sentMode == tab->textMode && !memcmp(tab->sentCaret, tab->caret, sizeof(tab->caret))) return;
  tab->sentMode = tab->textMode;
  memcpy(tab->sentCaret, tab->caret, sizeof(tab->caret));
  tab->textInputAt = nowNs();
  tabEvent(tab, "text_input", json::object({{"mode", textModeName(tab->textMode)}, {"caret_x", tab->caret[0]},
                                            {"caret_y", tab->caret[1]}, {"caret_width", tab->caret[2]},
                                            {"caret_height", tab->caret[3]}}));
}
static void setTextInput(Tab* tab, int mode, double x, double y, double w, double h) {
  auto clampTo = [](double v, double hi) { return std::isfinite(v) ? std::round(std::min(std::max(v, 0.0), hi) * 100) / 100 : 0.0; };
  double viewWidth = tab->width, viewHeight = tab->height;
  tab->textMode = mode;
  if (mode) {
    tab->caret[0] = clampTo(x, viewWidth); tab->caret[1] = clampTo(y, viewHeight);
    tab->caret[2] = clampTo(w, viewWidth); tab->caret[3] = clampTo(h, viewHeight);
  } else std::fill(std::begin(tab->caret), std::end(tab->caret), 0.0);
  if (tab->textInputScheduled) return;
  uint64_t since = nowNs() - tab->textInputAt;
  if (since >= TextInputIntervalNs) { emitTextInput(tab); return; }
  tab->textInputScheduled = true;
  int browserId = tab->browser ? tab->browser->get_identifier(tab->browser) : 0;
  int64_t delayMs = std::max<int64_t>(1, int64_t((TextInputIntervalNs - since + 999999) / 1000000));
  postUI([browserId] { if (Tab* current = tabForId(uint64_t(browserId))) emitTextInput(current); }, delayMs);
}
static bool validRange(const Value* value) {
  if (!value || !value->isObject() || !keys(value, {"start", "end"})) return false;
  return integer(value->get("start"), ImeRangeLimit) && integer(value->get("end"), ImeRangeLimit) &&
         value->num("start") <= value->num("end");
}
static cef_range_t rangeOf(const Value* value) {
  // CefRange::InvalidRange(): Chromium uses the current composition or selection.
  if (!value) return cef_range_t{UINT32_MAX, UINT32_MAX};
  return cef_range_t{uint32_t(value->num("start")), uint32_t(value->num("end"))};
}
static bool imeCommand(Tab* tab, const std::string& method, const Value& command, const std::string& requestId) {
  const Value* text = command.get("text");
  if (text && !textValue(text, ImeTextLimit)) { failProtocol(); return true; }
  std::u16string units = text ? json::toUtf16(text->text) : std::u16string();
  size_t length = units.size();
  if (command.has("replacement_range") && !validRange(command.get("replacement_range"))) { failProtocol(); return true; }
  std::vector<cef_composition_underline_t> underlines;
  if (method == "ime_set_composition") {
    // UTF-16 offsets into `text`; the selection is the caret inside the composition.
    if (!integer(command.get("selection_start"), length) || !integer(command.get("selection_end"), length) ||
        command.num("selection_start") > command.num("selection_end")) {
      failProtocol();
      return true;
    }
    const Value* lines = command.get("underlines");
    if (lines && (!lines->isArray() || lines->items.size() > ImeUnderlineLimit)) { failProtocol(); return true; }
    if (lines) {
      for (const auto& line : lines->items) {
        if (!line.isObject() || !keys(&line, {"start", "end", "thick"}) || !integer(line.get("start"), length) ||
            !integer(line.get("end"), length) || line.num("start") > line.num("end") || !boolean(line.get("thick"))) {
          failProtocol();
          return true;
        }
        cef_composition_underline_t item{};
        item.size = sizeof(item);
        item.range = {uint32_t(line.num("start")), uint32_t(line.num("end"))};
        item.color = 0;
        item.background_color = 0;  // transparent: Blink draws in the text colour
        item.thick = line.flag("thick");
        item.style = CEF_CUS_SOLID;
        underlines.push_back(item);
      }
    }
    if (!lines && length) {
      cef_composition_underline_t item{};
      item.size = sizeof(item);
      item.range = {0, uint32_t(length)};
      item.style = CEF_CUS_SOLID;
      underlines.push_back(item);
    }
  }
  if (method == "ime_commit_text" && command.has("relative_cursor_pos") &&
      !signedInteger(command.get("relative_cursor_pos"), -int(ImeCursorLimit), int(ImeCursorLimit))) {
    failProtocol();
    return true;
  }
  if (method == "ime_finish_composing" && command.has("keep_selection") && !boolean(command.get("keep_selection"))) {
    failProtocol();
    return true;
  }
  event("accepted", json::object({{"request_id", requestId}}));
  auto* host = tab->browser->get_host(tab->browser);
  auto string = view(units);
  if (method == "ime_set_composition") {
    cef_range_t replacement = rangeOf(command.get("replacement_range"));
    cef_range_t selection{uint32_t(command.num("selection_start")), uint32_t(command.num("selection_end"))};
    host->ime_set_composition(host, &string, underlines.size(), underlines.empty() ? nullptr : underlines.data(),
                              &replacement, &selection);
  } else if (method == "ime_commit_text") {
    cef_range_t replacement = rangeOf(command.get("replacement_range"));
    host->ime_commit_text(host, &string, &replacement,
                          command.has("relative_cursor_pos") ? int(command.num("relative_cursor_pos")) : 0);
  } else if (method == "ime_finish_composing") host->ime_finish_composing_text(host, command.flag("keep_selection") ? 1 : 0);
  else host->ime_cancel_composition(host);
  host->base.release(&host->base);
  complete(requestId, "success");
  return true;
}

// ---- Wheel phases ----------------------------------------------------------------
// The pinned C API has no phase fields; the OSR view's MouseWheelPhaseHandler
// synthesizes Began/Changed/Ended itself. The host uses the phases only to drop
// zero-delta boundary events (may_begin, stationary, ended, cancelled), which would
// otherwise extend Chromium's latch by 500 ms. Deltas are pixels on every platform.
static bool wheelPhase(const Value* value) {
  return value && value->isString() &&
         oneOf(value->text, {"none", "may_begin", "began", "changed", "stationary", "ended", "cancelled"});
}
static bool wheelCommand(Tab* tab, const Value& command, const std::string& requestId) {
  if (!integer(command.get("x"), uint64_t(tab->width)) || !integer(command.get("y"), uint64_t(tab->height)) ||
      !integer(command.get("modifiers"), 131071) || !signedInteger(command.get("delta_x"), -4096, 4096) ||
      !signedInteger(command.get("delta_y"), -4096, 4096)) {
    failProtocol();
    return true;
  }
  bool phased = command.has("phase");
  if (phased && (!wheelPhase(command.get("phase")) || !wheelPhase(command.get("momentum_phase")) || !boolean(command.get("precise")))) {
    failProtocol();
    return true;
  }
  event("accepted", json::object({{"request_id", requestId}}));
  int dx = int(command.num("delta_x")), dy = int(command.num("delta_y"));
  if (dx || dy) {
    cef_mouse_event_t mouse{};
    mouse.x = int(command.num("x")); mouse.y = int(command.num("y"));
    mouse.modifiers = uint32_t(command.num("modifiers"));
    auto* host = tab->browser->get_host(tab->browser);
    host->send_mouse_wheel_event(host, &mouse, dx, dy);
    host->base.release(&host->base);
  }
  complete(requestId, "success");
  return true;
}

// ---- Pinch -----------------------------------------------------------------------
// CEF's OSR view has no pinch entry point; its touch path feeds Chromium's gesture
// provider, which turns two moving touch points into GesturePinchBegin/Update/End
// (pinch-zoom of the visual viewport). The page first receives the touch/pointer
// events and may cancel them. A pinch with no update for 1 s is cancelled.
static constexpr int PinchTouchA = 0x41584901, PinchTouchB = 0x41584902;
static void pinchTouch(Tab* tab, int id, double x, cef_touch_event_type_t type, uint32_t modifiers) {
  cef_touch_event_t touch{};
  touch.id = id;
  touch.x = float(x);
  touch.y = float(tab->pinchY);
  touch.type = type;
  touch.modifiers = modifiers;
  touch.pointer_type = CEF_POINTER_TYPE_TOUCH;
  auto* host = tab->browser->get_host(tab->browser);
  host->send_touch_event(host, &touch);
  host->base.release(&host->base);
}
static void cancelPinch(Tab* tab) {
  if (!tab->pinching) return;
  tab->pinching = false;
  if (!tab->browser || tab->closing) return;
  double half = tab->pinchSpan * tab->pinchScale / 2;
  pinchTouch(tab, PinchTouchA, tab->pinchX - half, CEF_TET_CANCELLED, 0);
  pinchTouch(tab, PinchTouchB, tab->pinchX + half, CEF_TET_CANCELLED, 0);
}
static void resetInput(Tab* tab) {
  cancelPinch(tab);
  if (tab->textMode || tab->sentMode > 0) setTextInput(tab, 0, 0, 0, 0, 0);
}
static bool pinchCommand(Tab* tab, const Value& command, const std::string& requestId) {
  const Value* magnification = command.get("magnification");
  if (!integer(command.get("x"), uint64_t(tab->width)) || !integer(command.get("y"), uint64_t(tab->height)) ||
      !integer(command.get("modifiers"), 131071) || !wheelPhase(command.get("phase")) || !magnification ||
      !magnification->isNumber() || !std::isfinite(magnification->number) || std::fabs(magnification->number) > 10) {
    failProtocol();
    return true;
  }
  event("accepted", json::object({{"request_id", requestId}}));
  const std::string& phase = command.str("phase");
  uint32_t modifiers = uint32_t(command.num("modifiers"));
  double m = magnification->number;
  if (phase == "ended" || phase == "cancelled") {
    if (tab->pinching) {
      double half = tab->pinchSpan * tab->pinchScale / 2;
      tab->pinching = false;
      auto type = phase == "ended" ? CEF_TET_RELEASED : CEF_TET_CANCELLED;
      pinchTouch(tab, PinchTouchA, tab->pinchX - half, type, modifiers);
      pinchTouch(tab, PinchTouchB, tab->pinchX + half, type, modifiers);
    }
    complete(requestId, "success");
    return true;
  }
  bool begin = phase == "began" || phase == "may_begin";
  if (begin && tab->pinching) cancelPinch(tab);
  if (!tab->pinching && (begin || phase == "changed" || m != 0)) {
    // Both points start inside the view and clear Chromium's minimum scaling span.
    double span = std::clamp(std::min(tab->width, tab->height) * 0.5, 160.0, 400.0);
    tab->pinchSpan = span;
    tab->pinchScale = 1;
    tab->pinchX = std::clamp(command.num("x"), span / 2, std::max(span / 2, tab->width - span / 2));
    tab->pinchY = command.num("y");
    tab->pinching = true;
    pinchTouch(tab, PinchTouchA, tab->pinchX - span / 2, CEF_TET_PRESSED, modifiers);
    pinchTouch(tab, PinchTouchB, tab->pinchX + span / 2, CEF_TET_PRESSED, modifiers);
  }
  if (tab->pinching && m != 0) {
    // The span never drops below Chromium's scaling threshold; zooming stops there.
    tab->pinchScale = std::clamp(tab->pinchScale * (1 + m), 140.0 / tab->pinchSpan, 12.0);
    double half = tab->pinchSpan * tab->pinchScale / 2;
    pinchTouch(tab, PinchTouchA, tab->pinchX - half, CEF_TET_MOVED, modifiers);
    pinchTouch(tab, PinchTouchB, tab->pinchX + half, CEF_TET_MOVED, modifiers);
  }
  if (tab->pinching) {
    uint64_t at = tab->pinchAt = nowNs();
    int browserId = tab->browser->get_identifier(tab->browser);
    postUI([browserId, at] {
      Tab* current = tabForId(uint64_t(browserId));
      if (current && current->pinching && current->pinchAt == at) cancelPinch(current);
    }, 1000);
  }
  complete(requestId, "success");
  return true;
}

// Returns false when `method` is not an input command handled here.
static bool inputCommand(Tab* tab, const std::string& method, const Value& command, const std::string& requestId) {
  if (method == "key") return keyCommand(tab, command, requestId);
  if (method == "wheel") return wheelCommand(tab, command, requestId);
  if (method == "pinch") return pinchCommand(tab, command, requestId);
  if (method.rfind("ime_", 0) == 0) return imeCommand(tab, method, command, requestId);
  if (method == "frame_rate") {
    // The window moved to a display with another refresh rate. CEF re-applies the
    // compositor v-sync interval and the capture rate live (UpdateFrameRate).
    if (!integer(command.get("frame_rate"), 120) || (command.num("frame_rate") != 60 && command.num("frame_rate") != 120)) {
      failProtocol();
      return true;
    }
    event("accepted", json::object({{"request_id", requestId}}));
    auto* host = tab->browser->get_host(tab->browser);
    host->set_windowless_frame_rate(host, int(command.num("frame_rate")));
    host->base.release(&host->base);
    complete(requestId, "success");
    return true;
  }
  return false;
}

static Ref<cef_keyboard_handler_t> keyboard;
static void configureInput() {
  client.api.get_keyboard_handler = [](cef_client_t*) { return keyboard.retain(); };
  keyboard.api.on_key_event = [](cef_keyboard_handler_t*, cef_browser_t* value, const cef_key_event_t* key,
                                 cef_event_handle_t) -> int {
    HOLD(value);
    if (Tab* tab = tabFor(value)) keyReport(tab, key);
    return 1;  // Zen owns every shortcut; the host has no menu of its own
  };
  render.api.on_ime_composition_range_changed = [](cef_render_handler_t*, cef_browser_t* value, const cef_range_t*,
                                                   size_t count, cef_rect_t const* bounds) {
    HOLD(value);
    Tab* tab = tabFor(value);
    if (!tab || !tab->textMode || !count || !bounds) return;
    count = std::min<size_t>(count, 1024);
    double left = bounds[0].x, top = bounds[0].y, right = left + bounds[0].width, bottom = top + bounds[0].height;
    for (size_t i = 1; i < count; i++) {
      top = std::min(top, double(bounds[i].y));
      right = std::max(right, double(bounds[i].x + bounds[i].width));
      bottom = std::max(bottom, double(bounds[i].y + bounds[i].height));
    }
    setTextInput(tab, tab->textMode, left, top, std::max(1.0, right - left), std::max(1.0, bottom - top));
  };
  client.api.on_process_message_received = [](cef_client_t*, cef_browser_t* value, cef_frame_t* frame,
                                              cef_process_id_t source, cef_process_message_t* message) -> int {
    HOLD(value); HOLD(frame); HOLD(message);
    if (source != PID_RENDERER || !message) return 0;
    if (take(message->get_name(message)) != "axio.text_input") return 0;
    Tab* tab = tabFor(value);
    if (!tab || tab->closing) return 1;
    cef_list_value_t* args = message->get_argument_list(message);
    if (!args) return 1;
    bool valid = args->get_size(args) == 5;
    int v[5] = {0, 0, 0, 0, 0};
    for (size_t i = 0; valid && i < 5; i++) {
      valid = args->get_type(args, i) == VTYPE_INT;
      if (valid) v[i] = args->get_int(args, i);
    }
    args->base.release(&args->base);
    if (!valid || v[0] < 0 || v[0] > 2) return 1;
    // Element bounds arrive in widget (physical) pixels; convert to logical points.
    double s = tab->scale > 0 ? tab->scale : 1, x = v[1] / s, y = v[2] / s, h = std::max(0, v[4]) / s;
    // Until composition reports real character bounds, place a one-line caret
    // at the start of the field (vertically centred in a single-line control).
    double line = std::clamp(h, 1.0, 32.0), top = h <= 64 ? y + (h - line) / 2 : y + 4;
    setTextInput(tab, v[0], x + 4, top, 1, line);
    return 1;
  };
}

// Renderer side of the text-input report. Runs in the sandboxed renderer helper and
// sends only the focused node's kind and bounds; no page text leaves the renderer.
static Ref<cef_app_t> helperApp;
static Ref<cef_render_process_handler_t> rendererHandler;
cef_app_t* rendererApp() {
  helperApp.api.get_render_process_handler = [](cef_app_t*) { return rendererHandler.retain(); };
  rendererHandler.api.on_focused_node_changed = [](cef_render_process_handler_t*, cef_browser_t* current,
                                                   cef_frame_t* frame, cef_domnode_t* node) {
    HOLD(current); HOLD(frame); HOLD(node);
    if (!frame) return;
    int mode = 0;
    cef_rect_t bounds{};
    if (node && node->is_element(node) && node->is_editable(node)) {
      mode = node->is_form_control_element(node) &&
                     node->get_form_control_element_type(node) == DOM_FORM_CONTROL_TYPE_INPUT_PASSWORD
                 ? 2
                 : 1;
      bounds = node->get_element_bounds(node);
    }
    auto name = json::toUtf16("axio.text_input");
    auto text = view(name);
    cef_process_message_t* message = cef::p_cef_process_message_create(&text);
    if (!message) return;
    cef_list_value_t* args = message->get_argument_list(message);
    int values[5] = {mode, bounds.x, bounds.y, bounds.width, bounds.height};
    for (size_t i = 0; i < 5; i++) args->set_int(args, i, values[i]);
    args->base.release(&args->base);
    frame->send_process_message(frame, PID_BROWSER, message);  // transfers our reference
  };
  return helperApp.retain();
}
