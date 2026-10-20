#pragma once
// Engine-neutral host core for contracts/engine-stream-v1.md (fixture profile).
//
// This is a port of the fixture-mode command, target and generation state machine
// of native/chromium-host/stream.inc (cloud/integration a3ab14e) behind a small
// Engine/EngineView interface, so that WebKit (WPE on Linux today, WKWebView on
// macOS later) speaks exactly the AXCF wire protocol the Zen CEF adapter drives.
// All state is owned by the engine's UI thread; only Transport is synchronized.
// Nothing here knows WebKit: test_stream_core.cc drives it with a scripted engine.
#include "json.hpp"
#include "transport.hpp"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdio>
#include <cstring>
#include <functional>
#include <memory>
#include <set>
#include <string>
#include <vector>

namespace axio::stream {
using json::Object;
using json::Value;

constexpr uint64_t MaxGeneration = 9007199254740991ULL;
constexpr size_t MaxTabs = 32, MaxRequestIds = 100000, MaxDamageRects = 1;
constexpr int HeartbeatIntervalMs = 1000;
// §8.2 browser UI: open prompts per tab / per host (as cef-v1), text event chunks.
constexpr size_t MaxPromptsPerTab = 8, MaxPromptsPerHost = 64, TextChunkUnits = 1800, MaxTextChunks = 36;

// ---- Strict field checks (same rules as stream.inc) --------------------------------
inline bool integer(const Value* v, uint64_t maximum = MaxGeneration) {
  return v && v->isNumber() && std::isfinite(v->number) && v->number >= 0 && v->number <= double(maximum)
         && std::floor(v->number) == v->number;
}
inline bool signedInteger(const Value* v, double minimum, double maximum) {
  return v && v->isNumber() && std::isfinite(v->number) && v->number >= minimum && v->number <= maximum
         && std::floor(v->number) == v->number;
}
inline bool boolean(const Value* v) { return v && v->isBool(); }
inline bool text(const Value* v, size_t maxUtf16) { return v && v->isString() && json::utf16Length(v->string) <= maxUtf16; }
inline bool identifier(const Value* v) {
  if (!text(v, 128) || v->string.empty()) return false;
  for (char c : v->string)
    if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_' || c == ':' || c == '/' || c == '.' || c == '-')) return false;
  return true;
}
inline bool tokenValue(const Value* v) {
  if (!v || !v->isString() || v->string.size() != 64) return false;
  for (char c : v->string) if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'))) return false;
  return true;
}
inline bool exactKeys(const Value& v, const std::vector<std::string>& expected) {
  if (!v.isObject() || v.object->size() != expected.size()) return false;
  for (auto& key : expected) if (!v.object->count(key)) return false;
  return true;
}
inline bool constantTimeEqual(const std::string& a, const std::string& b) {
  if (a.size() != b.size()) return false;
  unsigned diff = 0;
  for (size_t i = 0; i < a.size(); ++i) diff |= unsigned(uint8_t(a[i]) ^ uint8_t(b[i]));
  return diff == 0;
}
// `http://127.0.0.1:<port>` exactly, port 1..65535 without leading zero.
inline bool fixtureOriginValue(const std::string& value) {
  static const std::string prefix = "http://127.0.0.1:";
  if (value.compare(0, prefix.size(), prefix) != 0) return false;
  std::string port = value.substr(prefix.size());
  if (port.empty() || port.size() > 5 || port[0] == '0') return false;
  for (char c : port) if (c < '0' || c > '9') return false;
  return std::stoul(port) <= 65535;
}

// ---- Engine interface ---------------------------------------------------------------
struct KeyInput { std::string type; uint32_t nativeKeyCode = 0, windowsKeyCode = 0, modifiers = 0; std::string text; };
struct MouseInput { std::string type, button; int x = 0, y = 0; uint32_t modifiers = 0; int clickCount = 1; bool leave = false; };
struct WheelInput { int x = 0, y = 0; uint32_t modifiers = 0; int deltaX = 0, deltaY = 0; bool phased = false, precise = false; std::string phase, momentumPhase; };
enum class PixelFormat { BGRA8Premultiplied, BGRX8 };  // little-endian ARGB8888 / XRGB8888

class EngineView {
public:
  virtual ~EngineView() = default;
  virtual std::string nativeId() const = 0;  // decimal string, unique per host
  virtual void load(const std::string& url) = 0;
  virtual bool canGoBack() = 0;
  virtual bool canGoForward() = 0;
  virtual void goBack() = 0;
  virtual void goForward() = 0;
  virtual void reload() = 0;
  virtual void stop() = 0;
  virtual void resize(int width, int height, double scale) = 0;
  virtual void setFocus(bool focused) = 0;
  virtual void setVisible(bool visible) = 0;
  virtual void setFrameRate(int rate) = 0;
  virtual void key(const KeyInput&) = 0;
  virtual void mouse(const MouseInput&) = 0;
  virtual void wheel(const WheelInput&) = 0;
  virtual void commitText(const std::string& text) = 0;
  virtual bool edit(const std::string& action) = 0;  // false: no focused editable frame
  // §8.2 browser UI (only when negotiated; engines without it keep the defaults).
  // A reply to prompt `id` (still open, kind-matched, target-checked by the core).
  virtual void promptReply(const std::string& /*id*/, const std::string& /*method*/, const Value& /*command*/) {}
  // The safe default for prompt `id` (timeout, navigation, close): cancel/deny/stay.
  virtual void promptDefault(const std::string& /*id*/) {}
  // find, stop_finding, zoom, paste_text, ime_set_composition, ime_cancel_composition,
  // ime_finish_composing. false: not possible now (completed unsupported).
  virtual bool uiCommand(const std::string& /*method*/, const Value& /*command*/) { return false; }
  // Starts closing. The engine must call Host::viewClosed() exactly once, possibly
  // synchronously from inside close(); the view object is destroyed later.
  virtual void close() = 0;
};

struct Tab;
class Engine {
public:
  virtual ~Engine() = default;
  // Synchronous creation without loading; nullptr = native creation failed.
  virtual std::unique_ptr<EngineView> createView(Tab& tab, int width, int height, double scale, int frameRate) = 0;
  // Engine identity for `ready` (engine, versions, platform, sandbox, render_path).
  virtual Object readyFields() = 0;
  // Engine-specific capability overrides merged over Host::baseCapabilities().
  virtual Object capabilities() = 0;
  virtual std::string engineName() = 0;  // the `engine` value of every BrowserTarget
  // §8.2: the engine can draw nothing itself but hands every UI request to Zen.
  virtual bool browserUI() { return false; }
};

struct Tab {
  std::string key;  // Zen tab_id; stable for this target's lifetime
  Value target;     // pending until created, then the complete BrowserTarget
  std::unique_ptr<EngineView> view;
  bool created = false, closing = false, visible = true, paintAllowed = false;
  int width = 900, height = 650; double scale = 2;
  std::string createRequest, closeRequest, navigationRequest;
  bool historyNavigation = false, commandNavigationInvalidated = false;
  // A page-initiated navigation the policy admitted, whose generation advances when its load
  // starts (WebKit asks beforeunload after the policy; "stay" must leave the document as it is).
  bool pageNavigationPending = false, provisional = false;
  std::string historyURL, committedDocumentURL, lastCursor;
  std::set<std::string> committedURLs;
  int supersededLoads = 0;
  // Latest engine pixels of the current document (BGRA8, tight stride).
  std::vector<uint8_t> latest; int latestWidth = 0, latestHeight = 0; bool latestValid = false;
  // Damage bookkeeping (frame_damage): pixels and damage of the last submitted frame.
  std::vector<uint8_t> sent; int sentWidth = 0, sentHeight = 0; bool sentValid = false;
  int lastDamage[4] = {0, 0, 0, 0};
  std::vector<uint8_t> payload;  // damage_payload: the rectangle's rows of the frame being sent
  // §8.2 open prompts: id -> kind, the target it was issued for, deadline.
  struct Prompt { std::string kind; Value target; std::chrono::steady_clock::time_point deadline; };
  std::map<std::string, Prompt> prompts;
};

struct Rect { int x = 0, y = 0, width = 0, height = 0; bool empty() const { return width <= 0 || height <= 0; } };
inline Rect unite(Rect a, Rect b) {
  if (a.empty()) return b;
  if (b.empty()) return a;
  int x0 = std::min(a.x, b.x), y0 = std::min(a.y, b.y);
  int x1 = std::max(a.x + a.width, b.x + b.width), y1 = std::max(a.y + a.height, b.y + b.height);
  return {x0, y0, x1 - x0, y1 - y0};
}
// Bounding box of changed pixels between two tight BGRA8 images of equal size.
inline Rect diffBounds(const uint8_t* a, const uint8_t* b, int width, int height) {
  size_t row = size_t(width) * 4;
  int top = -1, bottom = -1;
  for (int y = 0; y < height; ++y) if (memcmp(a + row * size_t(y), b + row * size_t(y), row)) { top = y; break; }
  if (top < 0) return {};
  for (int y = height - 1; y >= top; --y) if (memcmp(a + row * size_t(y), b + row * size_t(y), row)) { bottom = y; break; }
  int left = width, right = -1;
  for (int y = top; y <= bottom; ++y) {
    auto* pa = reinterpret_cast<const uint32_t*>(a + row * size_t(y));
    auto* pb = reinterpret_cast<const uint32_t*>(b + row * size_t(y));
    for (int x = 0; x < left; ++x) if (pa[x] != pb[x]) { left = x; break; }
    for (int x = width - 1; x > right; --x) if (pa[x] != pb[x]) { right = x; break; }
  }
  return {left, top, right - left + 1, bottom - top + 1};
}

class Host {
public:
  Host(Transport& transport, Engine& engine) : transport_(transport), engine_(engine) {}

  // ---- Authentication ------------------------------------------------------------
  // First stdin line. Fixture profile only: web browsing and Mach surfaces are not
  // offered by this host and their keys are protocol errors.
  bool handshake(std::chrono::milliseconds timeout) {
    auto deadline = std::chrono::steady_clock::now() + timeout;
    while (std::chrono::steady_clock::now() < deadline && !transport_.failed() && !transport_.eof()) {
      if (auto line = transport_.pop()) return acceptHello(*line);
      std::this_thread::sleep_for(std::chrono::milliseconds(5));
    }
    return false;
  }
  bool acceptHello(const std::string& line) {
    auto hello = json::parse(line);
    if (!hello || !hello->isObject()) return false;
    std::vector<std::string> fields{"version", "method", "token", "engine_instance", "fixture_origin"};
    if (hello->has("frame_rate")) fields.push_back("frame_rate");
    if (hello->has("frame_damage")) fields.push_back("frame_damage");
    if (hello->has("damage_payload")) fields.push_back("damage_payload");
    if (hello->has("frame_transport")) fields.push_back("frame_transport");
    if (hello->has("browser_ui")) fields.push_back("browser_ui");
    if (!exactKeys(*hello, fields) || !integer(hello->get("version"), 1) || hello->get("version")->number != 1) return false;
    if (!hello->get("method")->isString() || hello->get("method")->string != "hello" || !tokenValue(hello->get("token"))) return false;
    if (!identifier(hello->get("engine_instance")) || !text(hello->get("fixture_origin"), 128)
        || !fixtureOriginValue(hello->get("fixture_origin")->string)) return false;
    if (auto rate = hello->get("frame_rate")) {
      if (!integer(rate, 120) || (rate->number != 60 && rate->number != 120)) return false;
      frameRate_ = int(rate->number);
    }
    if (auto damage = hello->get("frame_damage")) { if (!boolean(damage)) return false; frameDamage_ = damage->boolean; }
    if (auto ui = hello->get("browser_ui")) { if (!boolean(ui)) return false; browserUIRequested_ = ui->boolean; }
    // Rectangle-only payloads (engine-stream-v1 §6.2) need damage.
    if (auto payload = hello->get("damage_payload")) {
      if (!boolean(payload) || (payload->boolean && !frameDamage_)) return false;
      damagePayload_ = payload->boolean;
    }
    // §6.3 frame_transport "memfd": pixels in a sealed memfd slot (Linux only).
    if (auto mode = hello->get("frame_transport")) {
      if (!mode->isString() || mode->string != "memfd" || transport_.enableMemfd(2, MaxFrame) < 0) return false;
    }
    token_ = hello->get("token")->string;
    instance_ = hello->get("engine_instance")->string;
    fixtureOrigin_ = hello->get("fixture_origin")->string;
    return true;
  }
  const std::string& fixtureOrigin() const { return fixtureOrigin_; }
  const std::string& instance() const { return instance_; }
  int frameRate() const { return frameRate_; }
  bool frameDamage() const { return frameDamage_; }
  bool damagePayload() const { return damagePayload_; }
  // §8.2: asked for in the hello and offered by the engine.
  bool browserUI() const { return browserUIRequested_ && engine_.browserUI(); }

  // Strict fixture policy: exactly the synthetic page and its GET navigation.
  bool allowedURL(const std::string& url, bool resource = false) const {
    if (url == fixtureOrigin_ + "/engine.html" || url == fixtureOrigin_ + "/engine.html?page=2") return true;
    return resource && url == fixtureOrigin_ + "/favicon.ico";
  }

  Object baseCapabilities() const {
    return Object{
      {"surface", false}, {"external_begin_frame", false}, {"frame_rate", frameRate_}, {"observe", true},
      {"navigate", true}, {"back", true}, {"forward", true}, {"reload", true}, {"stop", true}, {"close", true},
      {"input", true}, {"edit", true}, {"visibility", true}, {"cursor", true}, {"multi_target", true},
      {"max_targets", int(MaxTabs)}, {"persistent_profile", false}, {"open_in_tab", false}, {"devtools", false},
      {"ime", false}, {"ime_commit", true}, {"key_verdict", false}, {"wheel_phases", true}, {"pinch", false},
      {"frame_rate_command", true}, {"private_mode", false}, {"fixture_only", true}, {"permissions", false},
      {"downloads", false}, {"popups", false}, {"accessibility", false}, {"file_dialogs", false},
      {"javascript_dialogs", false}, {"heartbeat_interval_ms", HeartbeatIntervalMs}, {"context_menu", false},
      {"http_auth", false}, {"find", false}, {"zoom", false}, {"popup_blocked", false}, {"media_capture", false},
      {"favicon", false}, {"text_input", false}, {"frame_damage", frameDamage_},
      {"damage_payload", damagePayload_}, {"frame_transport", transport_.memfd() >= 0 ? "memfd" : "pipe"}};
  }
  void ready() {
    Object caps = baseCapabilities();
    for (auto& [key, value] : engine_.capabilities()) caps[key] = value;
    caps["browser_ui"] = browserUI();
    if (browserUI()) {
      // Every UI request becomes a prompt Zen draws; downloads, pop-ups and HTTP auth stay refused.
      for (const char* key : {"javascript_dialogs", "context_menu", "option_menu", "permissions", "file_dialogs",
                              "find", "zoom", "favicon", "clipboard", "ime", "text_input"}) caps[key] = true;
      caps["cursor_set"] = "css";
    }
    if (transport_.memfd() >= 0)
      caps["memfd"] = Value(Object{{"fd", transport_.memfd()}, {"slot_bytes", double(transport_.memfdSlotBytes())},
                                   {"slots", int(transport_.memfdSlots())}});
    Object fields = engine_.readyFields();
    fields["engine_instance"] = instance_;
    fields["capabilities"] = Value(std::move(caps));
    event("ready", std::move(fields));
    ready_ = true;
  }

  // ---- Command pump (UI thread) ----------------------------------------------------
  void pump() {
    if (!ready_) return;
    for (int count = 0; count < 32 && !closing_; ++count) {
      auto line = transport_.pop();
      if (!line) break;
      command(*line);
    }
  }
  // Called about every 10 ms on the UI thread. Returns true once the host may exit.
  bool tick() {
    graveyard_.clear();
    if (ready_ && !closing_) pump();
    if (transport_.failed() || transport_.eof()) closing_ = true;
    if (ready_ && !closing_ && !transport_.failed()) {
      auto now = std::chrono::steady_clock::now();
      if (nextHeartbeat_ == std::chrono::steady_clock::time_point{}) nextHeartbeat_ = now + std::chrono::milliseconds(HeartbeatIntervalMs);
      else if (now >= nextHeartbeat_) {
        event("heartbeat", Object{{"sequence", ++heartbeat_}});
        nextHeartbeat_ = now + std::chrono::milliseconds(HeartbeatIntervalMs);
      }
    }
    if (!closing_) expirePrompts();
    if (closing_) closeAll();
    if (closing_ && idle()) closed_ = true;
    return closed_;
  }
  bool closing() const { return closing_; }
  bool closed() const { return closed_; }
  bool idle() const { return tabs_.empty(); }
  void beginClosing() { closing_ = true; }
  // After the engine is gone: answer shutdown and drain events (bounded).
  int finish() {
    if (!shutdownRequest_.empty() && !transport_.failed()) complete(shutdownRequest_, "success");
    transport_.finishEvents(std::chrono::milliseconds(1000));
    return transport_.failed() ? 64 : 0;
  }
  void failProtocol() { transport_.reject(); closing_ = true; }

  // ---- Engine callbacks (UI thread) -------------------------------------------------
  // Navigation policy for a main-frame request. Denied loads never start.
  bool navigationPolicy(Tab* tab, const std::string& url, const std::string& method) {
    if (!live(tab)) return false;
    if (!allowedURL(url) || method != "GET") { tabEvent(tab, "error", Object{{"code", "navigation_denied"}}); return false; }
    if (!tab->commandNavigationInvalidated) {
      // §8.2 hosts defer to the load start (beforeunload runs in between); a redirect of a load
      // already started, and hosts without browser UI, advance at once as before.
      if (browserUI() && !tab->provisional) tab->pageNavigationPending = true;
      else invalidateNavigation(tab);
    }
    return !transport_.failed();
  }
  // The engine started (or announced) the load of an admitted page navigation: generations
  // advance now, before any event of the new document. Idempotent; called from every early signal.
  void navigationStarting(Tab* tab) {
    if (!live(tab)) return;
    tab->provisional = true;
    if (!tab->pageNavigationPending) return;
    tab->pageNavigationPending = false;
    if (!tab->commandNavigationInvalidated) invalidateNavigation(tab);
  }
  void loadCommitted(Tab* tab, const std::string& url) {
    if (!live(tab)) return;
    navigationStarting(tab);
    tab->provisional = false;
    tab->historyURL = tab->historyNavigation && !tab->navigationRequest.empty() && tab->committedURLs.count(url) ? url : "";
    tab->latestValid = false;  // pixels before commit belong to the previous document
    tabEvent(tab, "url", Object{{"url", urlValue(url)}});
  }
  void loadFinished(Tab* tab, const std::string& url, int status) {
    if (!live(tab)) return;
    tab->provisional = false;
    // A page restored from WebKit's back/forward cache reports its cached response
    // (200) or 0; only an explicit back/forward to a URL committed earlier with 200
    // may be labelled restored, as in cef-v1.
    bool restored = (status == 0 || status == 200) && tab->historyNavigation && !tab->navigationRequest.empty()
                    && tab->historyURL == url && tab->committedURLs.count(url) && allowedURL(url);
    bool committed = status == 200 && allowedURL(url);
    tab->paintAllowed = committed || restored;
    if (tab->paintAllowed) tab->committedDocumentURL = url;
    if (committed) { if (tab->committedURLs.size() >= 1024) tab->committedURLs.clear(); tab->committedURLs.insert(url); }
    tabEvent(tab, "load", Object{{"http_status", status}, {"restored_from_history", restored}});
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, tab->paintAllowed ? "success" : "failed"); tab->navigationRequest.clear(); }
    resetNavigation(tab); tab->supersededLoads = 0;
    flush(tab);
  }
  // `cancelled`: the engine aborted the load (superseded, stopped or policy-ignored).
  void loadFailed(Tab* tab, int nativeCode, bool cancelled, bool tls) {
    if (!live(tab)) return;
    tab->provisional = false; tab->pageNavigationPending = false;
    if (cancelled && tab->supersededLoads > 0) { tab->supersededLoads--; return; }
    if (tls) tabEvent(tab, "error", Object{{"code", "certificate_error"}, {"native_code", nativeCode}});
    if (cancelled) {
      resetNavigation(tab);
      tabEvent(tab, "error", Object{{"code", "navigation_cancelled"}, {"native_code", nativeCode}});
      if (!tab->navigationRequest.empty()) { unsupported(tab->navigationRequest, "NAVIGATION_CANCELLED"); tab->navigationRequest.clear(); }
      return;
    }
    tab->paintAllowed = false; resetNavigation(tab); tab->committedDocumentURL.clear();
    tabEvent(tab, "error", Object{{"code", "load_failed"}, {"native_code", nativeCode}});
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "failed"); tab->navigationRequest.clear(); }
  }
  void titleChanged(Tab* tab, const std::string& title) {
    if (live(tab)) tabEvent(tab, "title", Object{{"title", json::utf16Prefix(title, 1024)}});
  }
  void urlChanged(Tab* tab, const std::string& url) {
    if (!live(tab)) return;
    if (tab->pageNavigationPending) navigationStarting(tab);
    tabEvent(tab, "url", Object{{"url", urlValue(url)}});
  }
  void loadingChanged(Tab* tab, bool loading) {
    if (live(tab) && loading && tab->pageNavigationPending) navigationStarting(tab);
    if (live(tab)) tabEvent(tab, "loading", Object{{"loading", loading}, {"can_go_back", tab->view->canGoBack()}, {"can_go_forward", tab->view->canGoForward()}});
  }
  void cursorChanged(Tab* tab, const std::string& cursor) {
    if (!live(tab) || tab->lastCursor == cursor) return;
    tab->lastCursor = cursor; tabEvent(tab, "cursor", Object{{"cursor", cursor}});
  }
  void denied(Tab* tab, const std::string& code) { if (live(tab)) tabEvent(tab, "error", Object{{"code", code}}); }
  void processTerminated(Tab* tab, int nativeCode) {
    if (!live(tab)) return;
    invalidateNavigation(tab); resetNavigation(tab);
    tabEvent(tab, "error", Object{{"code", "render_process_terminated"}, {"native_code", nativeCode}});
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "failed"); tab->navigationRequest.clear(); }
  }
  // Engine pixels: copied at once, so the engine may release its buffer on return.
  void frame(Tab* tab, const uint8_t* pixels, int width, int height, size_t stride, PixelFormat format) {
    if (!tab || !tab->created || tab->closing || closing_ || !pixels) return;
    if (width <= 0 || height <= 0 || width > 4096 || height > 4096 || uint64_t(width) * uint64_t(height) * 4 > MaxFrame
        || stride < size_t(width) * 4) {
      tabEvent(tab, "error", Object{{"code", "unsupported_surface"}}); return;
    }
    // A queued old-size buffer can arrive after resize; never relabel it.
    if (std::fabs(width - tab->width * tab->scale) >= 1 || std::fabs(height - tab->height * tab->scale) >= 1) return;
    size_t row = size_t(width) * 4;
    tab->latest.resize(row * size_t(height));
    for (int y = 0; y < height; ++y) memcpy(tab->latest.data() + row * size_t(y), pixels + stride * size_t(y), row);
    if (format == PixelFormat::BGRX8) for (size_t i = 3; i < tab->latest.size(); i += 4) tab->latest[i] = 0xFF;
    tab->latestWidth = width; tab->latestHeight = height; tab->latestValid = true;
    flush(tab);
  }
  void viewClosed(Tab* tab) {
    auto found = tabs_.find(tab ? tab->key : std::string());
    if (found == tabs_.end() || found->second.get() != tab) return;
    tab->paintAllowed = false; transport_.invalidatePendingFrame(tab->key);
    if (tab->created) tabEvent(tab, "closed", Object{});
    if (!tab->closeRequest.empty()) { complete(tab->closeRequest, "success"); tab->closeRequest.clear(); }
    if (!tab->navigationRequest.empty()) { complete(tab->navigationRequest, "failed"); tab->navigationRequest.clear(); }
    graveyard_.push_back(std::move(found->second));  // destroyed on the next tick, never re-entrantly
    tabs_.erase(found);
    // A fixture host owns one target: its close ends the host (cef-v1).
    if (idle()) { closing_ = true; closed_ = true; }
  }
  Tab* tabByKey(const std::string& key) { auto f = tabs_.find(key); return f == tabs_.end() ? nullptr : f->second.get(); }

  // ---- §8.2 browser UI (UI thread) ---------------------------------------------------
  // Issues prompt-<n> for the tab's current target, or "" when the limits are reached
  // or the event would not fit (the engine then applies the safe default itself).
  std::string openPrompt(Tab* tab, const std::string& kind, Object details, int timeoutMs) {
    if (!browserUI() || !live(tab)) return "";
    if (tab->prompts.size() >= MaxPromptsPerTab || openPrompts() >= MaxPromptsPerHost) {
      tabEvent(tab, "error", Object{{"code", "prompt_limit"}}); return "";
    }
    std::string id = "prompt-" + std::to_string(++promptSequence_);
    Object fields{{"prompt_id", id}, {"kind", kind}, {"timeout_ms", timeoutMs}, {"details", Value(std::move(details))},
                  {"target", tab->target}, {"event", "prompt"}, {"version", 1}};
    std::string line = json::dump(Value(fields));
    if (line.size() > 8000) { tabEvent(tab, "error", Object{{"code", "prompt_too_large"}}); return ""; }
    tab->prompts[id] = Tab::Prompt{kind, tab->target, std::chrono::steady_clock::now() + std::chrono::milliseconds(timeoutMs)};
    transport_.event(std::move(line));
    return id;
  }
  // The engine withdrew a prompt itself (e.g. WebKit closed its option menu).
  void withdrawPrompt(Tab* tab, const std::string& id) { closePrompt(tab, id, "withdrawn"); }
  bool promptOpen(Tab* tab, const std::string& id) const { return tab && tab->prompts.count(id); }
  // Text for Zen's clipboard or the X11 PRIMARY selection, in bounded chunks (§8.2).
  void textEvent(Tab* tab, const std::string& kind, const std::string& text) {
    if (!browserUI() || !live(tab) || text.empty()) return;
    std::vector<std::string> parts;
    std::string rest = text;
    while (!rest.empty() && parts.size() < MaxTextChunks) {
      std::string part = json::utf16Prefix(rest, TextChunkUnits);
      if (part.empty()) break;
      rest = rest.substr(part.size()); parts.push_back(std::move(part));
    }
    if (!rest.empty()) { tabEvent(tab, "error", Object{{"code", "text_too_large"}}); return; }
    for (size_t i = 0; i < parts.size(); ++i)
      tabEvent(tab, kind, Object{{"text", parts[i]}, {"part", int(i + 1)}, {"parts", int(parts.size())}});
  }
  // Any other target event of the profile (find_result, favicon, text_input, ...).
  void uiEvent(Tab* tab, const std::string& kind, Object fields) { if (browserUI() && live(tab)) tabEvent(tab, kind, std::move(fields)); }

  void event(const std::string& kind, Object fields) {
    fields["event"] = kind; fields["version"] = 1;
    transport_.event(json::dump(Value(std::move(fields))));
  }

private:
  Transport& transport_;
  Engine& engine_;
  std::string token_, instance_, fixtureOrigin_, shutdownRequest_;
  int frameRate_ = 60; bool frameDamage_ = false, damagePayload_ = false, browserUIRequested_ = false;
  uint64_t promptSequence_ = 0;
  bool ready_ = false, closing_ = false, closed_ = false;
  uint64_t frameId_ = 0, heartbeat_ = 0;
  std::chrono::steady_clock::time_point nextHeartbeat_{};
  std::set<std::string> requestIds_;
  std::map<std::string, std::unique_ptr<Tab>> tabs_;
  std::vector<std::unique_ptr<Tab>> graveyard_;

  bool live(Tab* tab) const { return tab && tab->created && !tab->closing && !closing_; }
  size_t openPrompts() const { size_t n = 0; for (auto& item : tabs_) n += item.second->prompts.size(); return n; }
  void closePrompt(Tab* tab, const std::string& id, const std::string& reason) {
    if (!tab || !tab->prompts.erase(id)) return;
    if (tab->created) tabEvent(tab, "prompt_closed", Object{{"prompt_id", id}, {"reason", reason}});
  }
  // Safe default, then prompt_closed: timeout, navigation (before generations advance), close.
  void defaultPrompts(Tab* tab, const std::string& reason) {
    std::vector<std::string> ids;
    for (auto& item : tab->prompts) ids.push_back(item.first);
    for (auto& id : ids) {
      if (!tab->prompts.count(id)) continue;
      if (tab->view) tab->view->promptDefault(id);
      closePrompt(tab, id, reason);
    }
  }
  void expirePrompts() {
    auto now = std::chrono::steady_clock::now();
    for (auto& item : tabs_) {
      Tab* tab = item.second.get();
      std::vector<std::string> expired;
      for (auto& [id, prompt] : tab->prompts) if (now >= prompt.deadline) expired.push_back(id);
      for (auto& id : expired) { if (tab->view) tab->view->promptDefault(id); closePrompt(tab, id, "timeout"); }
    }
  }
  static Value urlValue(const std::string& url) { return url.size() <= 4096 ? Value(url) : Value(""); }
  void tabEvent(Tab* tab, const std::string& kind, Object fields) {
    if (tab->created && !fields.count("target")) fields["target"] = tab->target;
    event(kind, std::move(fields));
  }
  void complete(const std::string& request, const std::string& status) { event("completed", Object{{"request_id", request}, {"status", status}}); }
  void unsupported(const std::string& request, const std::string& reason) {
    event("completed", Object{{"request_id", request}, {"status", "unsupported"}, {"reason", reason}});
  }
  void error(const std::string& request, const std::string& code) { event("error", Object{{"request_id", request}, {"code", code}}); }
  void accepted(const std::string& request) { event("accepted", Object{{"request_id", request}}); }

  bool validTarget(const Value* value, bool pending) const {
    if (!value) return false;
    std::vector<std::string> wanted = pending
      ? std::vector<std::string>{"tab_id", "engine_instance", "identity", "document_generation", "navigation_generation", "private_mode"}
      : std::vector<std::string>{"tab_id", "engine", "engine_instance", "native_target_id", "identity", "document_generation", "navigation_generation", "private_mode"};
    if (!exactKeys(*value, wanted) || !identifier(value->get("tab_id")) || !identifier(value->get("engine_instance"))
        || value->get("engine_instance")->string != instance_) return false;
    auto identity = value->get("identity");
    if (!identity->isString() || identity->string != fixtureOrigin_) return false;
    if (!integer(value->get("document_generation")) || !integer(value->get("navigation_generation"))) return false;
    if (!boolean(value->get("private_mode")) || value->get("private_mode")->boolean) return false;
    if (pending) return true;
    auto engine = value->get("engine");
    return engine->isString() && engine->string == engine_.engineName() && identifier(value->get("native_target_id"));
  }
  static bool surface(const Value* w, const Value* h, const Value* scale) {
    if (!integer(w, 4096) || !integer(h, 4096) || !w->number || !h->number || !scale || !scale->isNumber()) return false;
    return std::isfinite(scale->number) && scale->number >= 1 && scale->number <= 4;
  }
  static bool fits(const Value* w, const Value* h, const Value* scale) {
    double pw = std::ceil(w->number * scale->number), ph = std::ceil(h->number * scale->number);
    return pw <= 4096 && ph <= 4096 && pw * ph * 4 <= double(MaxFrame);
  }
  void resetNavigation(Tab* tab) { tab->historyNavigation = false; tab->historyURL.clear(); tab->commandNavigationInvalidated = false; }
  void invalidateNavigation(Tab* tab) {
    defaultPrompts(tab, "navigation");
    auto document = uint64_t(tab->target.get("document_generation")->number);
    auto navigation = uint64_t(tab->target.get("navigation_generation")->number);
    if (document == MaxGeneration || navigation == MaxGeneration) { failProtocol(); return; }
    Value next = json::with(tab->target, "document_generation", document + 1);
    tab->target = json::with(next, "navigation_generation", navigation + 1);
    tab->paintAllowed = false; tab->latestValid = false; tab->sentValid = false;
    transport_.invalidatePendingFrame(tab->key);
    // Generation changes precede every observable event of the new document.
    tabEvent(tab, "navigation", Object{});
  }
  void flush(Tab* tab) {
    if (!tab->paintAllowed || !tab->visible || !tab->latestValid || tab->closing || closing_) return;
    int w = tab->latestWidth, h = tab->latestHeight;
    Object meta{{"version", 1}, {"target", tab->target}, {"width", w}, {"height", h}, {"stride", w * 4},
                {"device_scale", tab->scale}, {"format", "BGRA8"}};
    Rect damageRect{0, 0, w, h};
    if (frameDamage_) {
      Rect& damage = damageRect;
      if (tab->sentValid && tab->sentWidth == w && tab->sentHeight == h) {
        damage = diffBounds(tab->sent.data(), tab->latest.data(), w, h);
        // The undelivered frame this one replaces carried damage Zen never saw.
        if (transport_.pendingFrame(tab->key)) damage = unite(damage, Rect{tab->lastDamage[0], tab->lastDamage[1], tab->lastDamage[2], tab->lastDamage[3]});
        if (damage.empty()) return;  // identical pixels: nothing to present
      }
      meta["damage"] = Value(json::Array{Value(json::Array{damage.x, damage.y, damage.width, damage.height})});
      tab->sent = tab->latest; tab->sentWidth = w; tab->sentHeight = h; tab->sentValid = true;
      tab->lastDamage[0] = damage.x; tab->lastDamage[1] = damage.y; tab->lastDamage[2] = damage.width; tab->lastDamage[3] = damage.height;
    }
    if (frameId_ == MaxGeneration) { failProtocol(); return; }
    meta["frame_id"] = ++frameId_;
    if (damagePayload_ && (damageRect.x || damageRect.y || damageRect.width != w || damageRect.height != h)) {
      // §6.2: only the rectangle's rows; Zen patches them into the frame it already has.
      // A replaced pending frame's damage is already in damageRect (united above).
      size_t rowBytes = size_t(damageRect.width) * 4;
      tab->payload.resize(rowBytes * size_t(damageRect.height));
      for (int row = 0; row < damageRect.height; ++row)
        memcpy(tab->payload.data() + size_t(row) * rowBytes,
               tab->latest.data() + (size_t(damageRect.y + row) * size_t(w) + size_t(damageRect.x)) * 4, rowBytes);
      transport_.frame(tab->key, json::dump(Value(std::move(meta))), json::dump(tab->target), frameId_, tab->payload.data(), tab->payload.size());
      return;
    }
    transport_.frame(tab->key, json::dump(Value(std::move(meta))), json::dump(tab->target), frameId_, tab->latest.data(), tab->latest.size());
  }
  void closeTab(Tab* tab) {
    if (tab->closing) return;
    defaultPrompts(tab, "closed");
    tab->closing = true; tab->paintAllowed = false; transport_.invalidatePendingFrame(tab->key);
    if (tab->view) tab->view->close(); else viewClosed(tab);
  }
  void closeAll() {
    std::vector<Tab*> open;
    for (auto& item : tabs_) if (!item.second->closing) open.push_back(item.second.get());
    for (Tab* tab : open) closeTab(tab);  // a synchronous close erases from tabs_
  }

  void command(const std::string& line) {
    auto parsed = json::parse(line);
    if (!parsed || !parsed->isObject()) { failProtocol(); return; }
    const Value& c = *parsed;
    auto version = c.get("version"), token = c.get("token"), request = c.get("request_id"), methodValue = c.get("method");
    if (!integer(version, 1) || version->number != 1 || !tokenValue(token) || !constantTimeEqual(token->string, token_)
        || !identifier(request) || !text(methodValue, 32)) { failProtocol(); return; }
    const std::string requestId = request->string, method = methodValue->string;
    if (requestIds_.count(requestId) || requestIds_.size() >= MaxRequestIds) { failProtocol(); return; }
    requestIds_.insert(requestId);
    static const std::map<std::string, std::vector<std::string>> extra{
      {"create", {"url", "width", "height", "device_scale"}}, {"navigate", {"url"}}, {"back", {}}, {"forward", {}},
      {"reload", {}}, {"stop", {}}, {"resize", {"width", "height", "device_scale"}}, {"focus", {"focused"}},
      {"visibility", {"visible"}}, {"edit", {"action"}}, {"key", {"type", "native_key_code", "windows_key_code", "modifiers", "text"}},
      {"mouse", {"type", "x", "y", "modifiers", "button", "click_count", "mouse_leave"}},
      {"wheel", {"x", "y", "modifiers", "delta_x", "delta_y"}}, {"frame_ack", {"frame_id"}}, {"frame_rate", {"frame_rate"}},
      {"ime_commit_text", {"text"}}, {"close", {}}, {"shutdown", {}}, {"devtools", {}}};
    // §8.2 browser-UI methods exist only when negotiated; otherwise they are unknown (exit 64).
    static const std::map<std::string, std::vector<std::string>> ui{
      {"context_menu_command", {"prompt_id", "command", "index"}}, {"dialog_reply", {"prompt_id", "accept", "text"}},
      {"permission_reply", {"prompt_id", "decision"}}, {"file_dialog_reply", {"prompt_id", "paths"}},
      {"option_menu_reply", {"prompt_id", "index"}}, {"find", {"text", "forward", "match_case", "find_next"}},
      {"stop_finding", {"clear_selection"}}, {"zoom", {"level"}}, {"paste_text", {"text"}},
      {"ime_set_composition", {"text", "selection_start", "selection_end"}}, {"ime_cancel_composition", {}},
      {"ime_finish_composing", {}}};
    const std::vector<std::string>* spec = nullptr;
    if (auto found = extra.find(method); found != extra.end()) spec = &found->second;
    else if (auto found = ui.find(method); found != ui.end() && browserUI()) spec = &found->second;
    if (!spec) { failProtocol(); return; }
    std::vector<std::string> expected{"version", "method", "request_id", "token"};
    if (method != "shutdown") expected.push_back("target");
    expected.insert(expected.end(), spec->begin(), spec->end());
    if (method == "wheel" && (c.has("phase") || c.has("momentum_phase") || c.has("precise")))
      expected.insert(expected.end(), {"phase", "momentum_phase", "precise"});
    if (method == "paste_text" && (c.has("x") || c.has("y"))) expected.insert(expected.end(), {"x", "y"});
    if (!exactKeys(c, expected)) { failProtocol(); return; }
    if (method == "shutdown") { accepted(requestId); shutdownRequest_ = requestId; closing_ = true; return; }
    bool creating = method == "create";
    const Value* supplied = c.get("target");
    if (!validTarget(supplied, creating)) { failProtocol(); return; }
    if (method == "frame_ack") {
      // The exact outstanding target, even if stale: discarded frames release credit too.
      if (!integer(c.get("frame_id")) || !transport_.acknowledge(uint64_t(c.get("frame_id")->number), json::dump(*supplied))) failProtocol();
      return;
    }
    Tab* tab = tabByKey(supplied->get("tab_id")->string);
    if (creating) { create(tab, c, *supplied, requestId); return; }
    if (!tab || tab->target != *supplied) { error(requestId, "stale_target"); return; }
    if (!tab->view || tab->closing || closing_) { error(requestId, "closed_target"); return; }
    EngineView& view = *tab->view;
    if (method == "devtools") { unsupported(requestId, "devtools_not_integrated"); return; }
    if (method == "navigate" && !(c.get("url")->isString() && allowedURL(c.get("url")->string))) { failProtocol(); return; }
    if (method == "resize") {
      if (!surface(c.get("width"), c.get("height"), c.get("device_scale"))) { failProtocol(); return; }
      if (!fits(c.get("width"), c.get("height"), c.get("device_scale"))) { unsupported(requestId, "surface_limit"); return; }
    }
    if (method == "focus" && !boolean(c.get("focused"))) { failProtocol(); return; }
    if (method == "visibility" && !boolean(c.get("visible"))) { failProtocol(); return; }
    static const std::set<std::string> edits{"copy", "cut", "paste", "select_all", "undo", "redo"};
    if (method == "edit" && !(c.get("action")->isString() && edits.count(c.get("action")->string))) { failProtocol(); return; }
    if (method == "frame_rate" && (!integer(c.get("frame_rate"), 120) || (c.get("frame_rate")->number != 60 && c.get("frame_rate")->number != 120))) { failProtocol(); return; }
    if (method == "ime_commit_text" && !(text(c.get("text"), 1024) && !c.get("text")->string.empty())) { failProtocol(); return; }
    if (ui.count(method)) { uiCommand(tab, method, c, requestId); return; }
    if (method == "key") { keyCommand(tab, c, requestId); return; }
    if (method == "mouse") { mouseCommand(tab, c, requestId); return; }
    if (method == "wheel") { wheelCommand(tab, c, requestId); return; }
    bool navigation = method == "navigate" || method == "back" || method == "forward" || method == "reload";
    if ((method == "back" && !view.canGoBack()) || (method == "forward" && !view.canGoForward())) { unsupported(requestId, "history_boundary"); return; }
    if (navigation && !tab->navigationRequest.empty()) {
      // A newer explicit navigation replaces a slow one; nothing is replayed.
      unsupported(tab->navigationRequest, "NAVIGATION_SUPERSEDED"); tab->navigationRequest.clear(); resetNavigation(tab); tab->supersededLoads++;
    }
    accepted(requestId);
    if (navigation) {
      tab->navigationRequest = requestId; tab->historyNavigation = method == "back" || method == "forward"; tab->historyURL.clear();
      tab->pageNavigationPending = false;
      // Back/forward-cache restores may skip policy checks: revoke the old document first.
      invalidateNavigation(tab); tab->commandNavigationInvalidated = true;
      if (transport_.failed()) return;
    }
    if (method == "navigate") view.load(c.get("url")->string);
    else if (method == "back") view.goBack();
    else if (method == "forward") view.goForward();
    else if (method == "reload") view.reload();
    else if (method == "stop") view.stop();
    else if (method == "resize") {
      tab->width = int(c.get("width")->number); tab->height = int(c.get("height")->number); tab->scale = c.get("device_scale")->number;
      tab->latestValid = false; tab->sentValid = false; transport_.invalidatePendingFrame(tab->key);
      view.resize(tab->width, tab->height, tab->scale);
    }
    else if (method == "focus") view.setFocus(c.get("focused")->boolean);
    else if (method == "visibility") {
      tab->visible = c.get("visible")->boolean;
      if (!tab->visible) transport_.invalidatePendingFrame(tab->key);
      view.setVisible(tab->visible);
      if (tab->visible) { tab->sentValid = false; flush(tab); }
    }
    else if (method == "edit") { if (!view.edit(c.get("action")->string)) { unsupported(requestId, "no_focused_frame"); return; } }
    else if (method == "frame_rate") view.setFrameRate(int(c.get("frame_rate")->number));
    else if (method == "ime_commit_text") view.commitText(c.get("text")->string);
    else if (method == "close") { tab->closeRequest = requestId; closeTab(tab); return; }
    if (!navigation) complete(requestId, "success");
  }
  void create(Tab* existing, const Value& c, const Value& supplied, const std::string& requestId) {
    if (existing || !ready_ || closing_) { error(requestId, "invalid_lifecycle"); return; }
    if (tabs_.size() >= MaxTabs) { unsupported(requestId, "target_limit"); return; }
    if (!(c.get("url")->isString() && allowedURL(c.get("url")->string)) || !surface(c.get("width"), c.get("height"), c.get("device_scale"))) { failProtocol(); return; }
    if (!fits(c.get("width"), c.get("height"), c.get("device_scale"))) { unsupported(requestId, "surface_limit"); return; }
    auto owned = std::make_unique<Tab>();
    Tab* tab = owned.get();
    tab->key = supplied.get("tab_id")->string; tab->target = supplied; tab->createRequest = requestId;
    tab->width = int(c.get("width")->number); tab->height = int(c.get("height")->number); tab->scale = c.get("device_scale")->number;
    tabs_[tab->key] = std::move(owned);
    accepted(requestId);
    tab->view = engine_.createView(*tab, tab->width, tab->height, tab->scale, frameRate_);
    if (!tab->view) { complete(requestId, "failed"); tabs_.erase(tab->key); if (idle()) closing_ = true; return; }
    Value full = json::with(tab->target, "engine", engine_.engineName());
    tab->target = json::with(full, "native_target_id", tab->view->nativeId());
    tab->created = true;
    tabEvent(tab, "created", Object{{"request_id", requestId}});
    complete(requestId, "success"); tab->createRequest.clear();
    tab->view->load(c.get("url")->string);
  }
  // §8.2: strict fields (a malformed field is a protocol error), then the prompt rules of cef-v1.
  void uiCommand(Tab* tab, const std::string& method, const Value& c, const std::string& requestId) {
    static const std::map<std::string, std::string> replies{{"context_menu_command", "context_menu"},
      {"dialog_reply", "dialog"}, {"permission_reply", "permission"}, {"file_dialog_reply", "file_dialog"},
      {"option_menu_reply", "option_menu"}};
    auto number = [&](const char* key, double lo, double hi) { const Value* v = c.get(key); return signedInteger(v, lo, hi); };
    bool ok = true;
    if (replies.count(method)) {
      const Value* id = c.get("prompt_id");
      ok = text(id, 32) && id->string.rfind("prompt-", 0) == 0;
      if (method == "context_menu_command") {
        static const std::set<std::string> commands{"dismiss", "copy", "cut", "paste", "select_all", "undo", "redo",
          "copy_image", "save_image", "save_link", "spelling", "add_to_dictionary"};
        ok = ok && c.get("command")->isString() && commands.count(c.get("command")->string) && number("index", 0, 16);
      } else if (method == "dialog_reply") ok = ok && boolean(c.get("accept")) && text(c.get("text"), 4096);
      else if (method == "permission_reply") {
        const Value* d = c.get("decision");
        ok = ok && d->isString() && (d->string == "allow" || d->string == "deny" || d->string == "dismiss");
      } else if (method == "file_dialog_reply") {
        const Value* paths = c.get("paths");
        ok = ok && paths->isArray() && paths->array->size() <= 64;
        if (ok) for (auto& path : *paths->array) ok = ok && text(&path, 4096) && !path.string.empty() && path.string[0] == '/';
      } else if (method == "option_menu_reply") ok = ok && number("index", -1, 1023);
      if (!ok) { failProtocol(); return; }
      auto found = tab->prompts.find(id->string);
      // Timeouts race with the user: answering a closed prompt is not fatal (cef-v1).
      // beforeunload is answered with dialog_reply (accept = leave), as in cef-v1.
      bool kindMatches = found != tab->prompts.end() && (found->second.kind == replies.at(method)
                         || (method == "dialog_reply" && found->second.kind == "before_unload"));
      if (!kindMatches || found->second.target != tab->target) {
        error(requestId, "stale_prompt"); return;
      }
      accepted(requestId);
      std::string promptId = id->string;
      tab->view->promptReply(promptId, method, c);
      closePrompt(tab, promptId, "answered");
      complete(requestId, "success");
      return;
    }
    if (method == "find") ok = text(c.get("text"), 1024) && !c.get("text")->string.empty() && boolean(c.get("forward"))
                               && boolean(c.get("match_case")) && boolean(c.get("find_next"));
    else if (method == "stop_finding") ok = boolean(c.get("clear_selection"));
    else if (method == "zoom") ok = c.get("level")->isNumber() && std::isfinite(c.get("level")->number) && std::fabs(c.get("level")->number) <= 10;
    else if (method == "paste_text") ok = text(c.get("text"), 4096) && !c.get("text")->string.empty()
                               && (!c.has("x") || (integer(c.get("x"), uint64_t(tab->width)) && integer(c.get("y"), uint64_t(tab->height))));
    else if (method == "ime_set_composition") {
      const Value* t = c.get("text");
      ok = text(t, 1024);
      size_t length = ok ? json::utf16Length(t->string) : 0;
      ok = ok && integer(c.get("selection_start"), length) && integer(c.get("selection_end"), length)
           && c.get("selection_start")->number <= c.get("selection_end")->number;
    }
    if (!ok) { failProtocol(); return; }
    accepted(requestId);
    if (tab->view->uiCommand(method, c)) complete(requestId, "success");
    else unsupported(requestId, "not_available");
  }
  void keyCommand(Tab* tab, const Value& c, const std::string& requestId) {
    static const std::set<std::string> types{"down", "up", "char"};
    if (!(c.get("type")->isString() && types.count(c.get("type")->string)) || !integer(c.get("native_key_code"), 65535)
        || !integer(c.get("windows_key_code"), 255) || !integer(c.get("modifiers"), 131071) || !text(c.get("text"), 4)) { failProtocol(); return; }
    accepted(requestId);
    KeyInput key{c.get("type")->string, uint32_t(c.get("native_key_code")->number), uint32_t(c.get("windows_key_code")->number),
                 uint32_t(c.get("modifiers")->number), c.get("text")->string};
    tab->view->key(key);
    // No key verdict (capability key_verdict:false): `down` completes without a reason.
    complete(requestId, "success");
  }
  void mouseCommand(Tab* tab, const Value& c, const std::string& requestId) {
    static const std::set<std::string> types{"move", "down", "up"}, buttons{"left", "middle", "right"};
    if (!integer(c.get("x"), uint64_t(tab->width)) || !integer(c.get("y"), uint64_t(tab->height)) || !integer(c.get("modifiers"), 131071)
        || !(c.get("type")->isString() && types.count(c.get("type")->string)) || !(c.get("button")->isString() && buttons.count(c.get("button")->string))
        || !integer(c.get("click_count"), 3) || !c.get("click_count")->number || !boolean(c.get("mouse_leave"))) { failProtocol(); return; }
    accepted(requestId);
    MouseInput mouse{c.get("type")->string, c.get("button")->string, int(c.get("x")->number), int(c.get("y")->number),
                     uint32_t(c.get("modifiers")->number), int(c.get("click_count")->number), c.get("mouse_leave")->boolean};
    tab->view->mouse(mouse);
    complete(requestId, "success");
  }
  void wheelCommand(Tab* tab, const Value& c, const std::string& requestId) {
    static const std::set<std::string> phases{"none", "may_begin", "began", "changed", "stationary", "ended", "cancelled"};
    if (!integer(c.get("x"), uint64_t(tab->width)) || !integer(c.get("y"), uint64_t(tab->height)) || !integer(c.get("modifiers"), 131071)
        || !signedInteger(c.get("delta_x"), -4096, 4096) || !signedInteger(c.get("delta_y"), -4096, 4096)) { failProtocol(); return; }
    WheelInput wheel;
    wheel.x = int(c.get("x")->number); wheel.y = int(c.get("y")->number); wheel.modifiers = uint32_t(c.get("modifiers")->number);
    wheel.deltaX = int(c.get("delta_x")->number); wheel.deltaY = int(c.get("delta_y")->number);
    if (c.has("phase")) {
      if (!(c.get("phase")->isString() && phases.count(c.get("phase")->string)) || !(c.get("momentum_phase")->isString() && phases.count(c.get("momentum_phase")->string))
          || !boolean(c.get("precise"))) { failProtocol(); return; }
      wheel.phased = true; wheel.phase = c.get("phase")->string; wheel.momentumPhase = c.get("momentum_phase")->string; wheel.precise = c.get("precise")->boolean;
    }
    accepted(requestId);
    // Zero-delta boundary events carry no scroll (as in cef-v1).
    if (wheel.deltaX || wheel.deltaY) tab->view->wheel(wheel);
    complete(requestId, "success");
  }
};

}  // namespace axio::stream
