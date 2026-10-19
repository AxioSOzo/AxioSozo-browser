// AxioSozo CEF OSR engine host, portable core. This is a component, never Zen
// embedding evidence. It is a line-by-line port of host.mm + stream.inc +
// input.inc + a11y.inc (macOS, Objective-C++) to C++: the protocol, limits,
// validation order and events are the same; NSJSONSerialization, NSURL and
// libdispatch are replaced by core/json.hpp, core/url.hpp and CEF UI-thread tasks.
// All state below is CEF-UI-thread owned unless stated otherwise.
#include "host_core.hpp"

#include <sys/stat.h>
#include <algorithm>
#include <atomic>
#include <chrono>
#include <climits>
#include <cmath>
#include <cstddef>
#include <cstdio>
#include <cstring>
#include <deque>
#include <functional>
#include <map>
#include <set>
#include <string>
#include <thread>
#include <unordered_set>
#include <vector>

#include "include/capi/cef_accessibility_handler_capi.h"
#include "include/capi/cef_values_capi.h"

#include "../a11y_core.hpp"
#include "../transport.hpp"
#include "cef_util.hpp"
#include "json.hpp"
#include "platform.hpp"
#include "png.hpp"
#include "url.hpp"

namespace axio::host {

volatile sig_atomic_t interrupted = 0;

using json::Value;
using cef::p_cef_browser_host_create_browser;
using cef::p_cef_quit_message_loop;
using cef::p_cef_request_context_create_context;
using cef::p_cef_string_list_alloc;
using cef::p_cef_string_list_append;
using cef::p_cef_string_list_free;
using cef::p_cef_string_list_size;
using cef::p_cef_string_list_value;
using cef::p_cef_version_info;
using cef::postUI;
using cef::Ref;
using cef::take;
using cef::utf8;
using cef::view;
#define HOLD AXIO_HOLD

static constexpr uint64_t MaxGeneration = 9007199254740991ULL;
static constexpr size_t MaxTabs = 32;
static constexpr int HeartbeatIntervalMs = 1000;  // announced as capabilities.heartbeat_interval_ms

static LaunchConfig config;
static std::u16string initialURL;
static cef_browser_t* browser = nullptr;  // E0 probe browser
static cef_request_context_t* isolatedContext = nullptr;
static bool closed = false, loaded = false, inputObserved = false, navigated = false;
static int width = 900, height = 650, frames = 0;
static double deviceScale = 2.0;
static bool streaming = false, streamReady = false, streamClosing = false;
static axio::Transport transport;
static std::string streamToken, streamInstance, fixtureOrigin;
static bool webBrowsing = false;
static std::unordered_set<std::string> requestIds;
static std::string shutdownRequest;
static uint64_t frameId = 0;
static uint64_t lastWebRequest = 0;
static int frameRate = 60;
static std::string captureName = "cef-e0-initial.png";

static uint64_t nowNs() { return platform::nowNs(); }
static double wallSeconds() {
  return std::chrono::duration<double>(std::chrono::system_clock::now().time_since_epoch()).count();
}

// ---- Events --------------------------------------------------------------------------------
static void event(const std::string& kind, Value fields = json::emptyObject()) {
  fields.type = Value::Type::Object;
  fields["event"] = kind;
  if (streaming) {
    fields["version"] = 1;
    transport.event(json::write(fields));
    return;
  }
  fields["component"] = "CEF_E0_ONLY";
  fields["timestamp"] = wallSeconds();
  std::string line = json::write(fields);
  line.push_back('\n');
  fwrite(line.data(), 1, line.size(), stdout);
  fflush(stdout);
}

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

static std::string joinPath(const std::string& directory, const std::string& name) {
  if (directory.empty() || directory.back() == '/') return directory + name;
  return directory + "/" + name;
}
static void saveFrame(const void* buffer, int w, int h) {
  if (captureName.empty() || w <= 0 || h <= 0 || w > 4096 || h > 4096 || w != int(std::ceil(width * deviceScale)) ||
      h != int(std::ceil(height * deviceScale)))
    return;
  std::string name = captureName;
  bool ok = png::writeFile(joinPath(config.evidence, name), png::encodeBGRA(buffer, w, h));
  event("native_frame", json::object({{"width", w}, {"height", h}, {"file", name}, {"written", ok}}));
  captureName.clear();
}
static void closeBrowser() {
  if (browser) { auto* h = browser->get_host(browser); h->close_browser(h, 0); h->base.release(&h->base); }
}

// ---- Validation (stream.inc helpers) -----------------------------------------------------------
static bool keys(const Value* value, const std::vector<std::string>& expected) {
  if (!value || !value->isObject() || value->fields.size() != expected.size()) return false;
  for (const auto& [key, item] : value->fields) {
    (void)item;
    if (std::find(expected.begin(), expected.end(), key) == expected.end()) return false;
  }
  return true;
}
static bool integer(const Value* value, uint64_t maximum = MaxGeneration) {
  if (!value || !value->isNumber()) return false;
  double number = value->number;
  return std::isfinite(number) && number >= 0 && number <= double(maximum) && std::floor(number) == number;
}
static bool signedInteger(const Value* value, int minimum, int maximum) {
  if (!value || !value->isNumber()) return false;
  double number = value->number;
  return std::isfinite(number) && number >= minimum && number <= maximum && std::floor(number) == number;
}
static bool boolean(const Value* value) { return value && value->isBool(); }
static bool textValue(const Value* value, size_t maximum) {
  return value && value->isString() && json::utf16Length(value->text) <= maximum;
}
static bool identifier(const Value* value) {
  if (!textValue(value, 128) || value->text.empty()) return false;
  for (char c : value->text) {
    bool ok = (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c == '_' || c == ':' ||
              c == '/' || c == '.' || c == '-';
    if (!ok) return false;
  }
  return true;
}
static bool hexText(const std::string& s) {
  for (char c : s) if (!((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'))) return false;
  return true;
}
static bool tokenValue(const Value* value) {
  return textValue(value, 64) && value->text.size() == 64 && hexText(value->text);
}
static bool equalToken(const Value* value) {
  if (!tokenValue(value) || streamToken.size() != 64) return false;
  unsigned difference = 0;
  for (size_t i = 0; i < 64; i++) difference |= unsigned(uint8_t(value->text[i]) ^ uint8_t(streamToken[i]));
  return difference == 0;
}
// NSCharacterSet.controlCharacterSet: Unicode Cc and Cf (bidi overrides, zero-width
// characters, soft hyphen, tags). Never part of a URL Zen or Chromium canonicalized.
static bool controlCharacter(uint32_t cp) {
  if (cp <= 0x1F || (cp >= 0x7F && cp <= 0x9F)) return true;
  static const uint32_t ranges[][2] = {
      {0x00AD, 0x00AD}, {0x0600, 0x0605}, {0x061C, 0x061C}, {0x06DD, 0x06DD}, {0x070F, 0x070F},
      {0x0890, 0x0891}, {0x08E2, 0x08E2}, {0x180E, 0x180E}, {0x200B, 0x200F}, {0x202A, 0x202E},
      {0x2060, 0x2064}, {0x2066, 0x206F}, {0xFEFF, 0xFEFF}, {0xFFF9, 0xFFFB}, {0x110BD, 0x110BD},
      {0x110CD, 0x110CD}, {0x13430, 0x1343F}, {0x1BCA0, 0x1BCA3}, {0x1D173, 0x1D17A}, {0xE0001, 0xE0001},
      {0xE0020, 0xE007F}};
  for (const auto& range : ranges) if (cp >= range[0] && cp <= range[1]) return true;
  return false;
}
static bool hasControlCharacter(const std::string& s) {
  for (size_t i = 0; i < s.size();) {
    uint32_t cp = 0;
    if (!json::decodeUtf8(s, i, cp)) return true;
    if (controlCharacter(cp)) return true;
  }
  return false;
}
static std::string origin(const url::Url& u) {
  if (u.scheme != "http" || u.host != "127.0.0.1" || !u.hasPort || u.port < 1 || u.port > 65535 || u.hasUserInfo)
    return std::string();
  return "http://127.0.0.1:" + std::to_string(u.port);
}
static bool webURL(const std::string& value, bool resource = false) {
  if (json::utf16Length(value) > (resource ? 65536u : 4096u) || value.empty()) return false;
  if (value == "about:blank") return true;
  if (hasControlCharacter(value)) return false;
  url::Url u;
  if (!url::parse(value, u)) return false;
  // Data/blob resources remain under Chromium's normal origin and CSP checks.
  // They are never an initial page, address-bar navigation or external protocol.
  if (resource && (u.scheme == "data" || u.scheme == "blob")) return true;
  return (u.scheme == "http" || u.scheme == "https") && u.hasAuthority && !u.host.empty() && !u.hasUserInfo &&
         (!u.hasPort || (u.port > 0 && u.port <= 65535));
}
static bool webOrigin(const std::string& value) {
  if (!webURL(value) || value == "about:blank") return false;
  url::Url u;
  return url::parse(value, u) && u.path.empty() && !u.hasQuery && !u.hasFragment;
}
static bool allowedURL(const std::string& value, bool resource = false) {
  if (webBrowsing) return webURL(value, resource);
  if (json::utf16Length(value) > 4096) return false;
  url::Url u;
  if (!url::parse(value, u)) return false;
  if (origin(u) != fixtureOrigin || fixtureOrigin.empty() || u.hasFragment) return false;
  return (u.path == "/engine.html" && (!u.hasQuery || u.query == "page=2")) ||
         (resource && u.path == "/favicon.ico" && !u.hasQuery);
}
static bool allowedURL(const Value* value, bool resource = false) {
  return value && value->isString() && allowedURL(value->text, resource);
}

bool validFixtureUrl(const std::string& value) {
  url::Url u;
  return url::parse(value, u) && u.scheme == "http" && u.host == "127.0.0.1" && u.path == "/engine.html" &&
         !u.hasUserInfo;
}

// ---- Tabs ----------------------------------------------------------------------------------------
struct Tab {
  std::string key;  // Zen tab_id; stable for this target's lifetime
  Value target;
  cef_browser_t* browser = nullptr;
  int width = 900, height = 650;
  double scale = 2;
  bool paintAllowed = false, closing = false;
  std::string createRequest, closeRequest, navigationRequest;
  bool historyNavigation = false, commandNavigationInvalidated = false, sameDocumentNavigation = false;
  std::string historyURL, committedDocumentURL;
  bool hasHistoryURL = false, hasCommittedDocument = false;
  // Main-frame RenderFrameHost whose OnLoadStart (commit) belongs to the current
  // navigation. OnLoadEnd from any other frame is a previous document finishing
  // late, e.g. the committed TLS interstitial of a load already failed by
  // OnLoadError; it never completes, authorizes or revokes the current load.
  std::string documentFrame;
  bool hasDocumentFrame = false;
  // Loads replaced by a newer command still report ERR_ABORTED; that report is
  // not about the current request. navigateURL is the current request's URL.
  int supersededLoads = 0;
  std::string navigateURL;
  bool hasNavigateURL = false;
  std::unordered_set<std::string> committedURLs;
  bool popupVisible = false;
  cef_rect_t popupRect{};
  int popupWidth = 0, popupHeight = 0, cachedWidth = 0, cachedHeight = 0;
  std::vector<uint8_t> popupPixels, cachedView;
  // Key verdicts (input): key `down` requests awaiting the renderer's answer.
  struct KeyWait { uint64_t seq = 0; std::string request; int nativeKeyCode = 0; int windowsKeyCode = 0; };
  std::deque<KeyWait> keyWaits;
  std::deque<uint64_t> probesInFlight;  // sequence of the keydown each probe follows
  uint64_t keySeq = 0, probeSent = 0, probeArrived = 0;
  // Text input state: 0 none, 1 text, 2 password; caret in logical points.
  int textMode = 0, sentMode = -1;
  double caret[4] = {0, 0, 0, 0}, sentCaret[4] = {0, 0, 0, 0};
  bool textInputScheduled = false;
  uint64_t textInputAt = 0;
  // Trackpad pinch synthesized as a two-point touch sequence.
  bool pinching = false;
  double pinchScale = 1, pinchSpan = 0, pinchX = 0, pinchY = 0;
  uint64_t pinchAt = 0;
  // Page icon: the chosen icon URL, its current download and the last data URL sent.
  std::string iconURL, iconData;
  bool hasIconURL = false, hasIconData = false;
  uint64_t iconRequest = 0;
  bool live() const { return target.has("native_target_id"); }
};
static std::map<std::string, Tab*> tabsByKey;
static std::map<int, Tab*> tabsByBrowser;
static Tab* creating = nullptr;  // CEF creation is asynchronous; one create at a time.

static Tab* tabFor(cef_browser_t* value, bool allowCreating = false) {
  if (!value) return nullptr;
  auto found = tabsByBrowser.find(value->get_identifier(value));
  // Only geometry queries arrive before OnAfterCreated for the target in creation.
  return found != tabsByBrowser.end() ? found->second : (allowCreating ? creating : nullptr);
}
static void clearPopup(Tab* tab) {
  tab->popupVisible = false;
  std::vector<uint8_t>().swap(tab->popupPixels);
  std::vector<uint8_t>().swap(tab->cachedView);
}
static bool validTarget(const Value* value, bool pending) {
  static const std::vector<std::string> pendingKeys = {"tab_id", "engine_instance", "identity", "document_generation",
                                                       "navigation_generation", "private_mode"};
  static const std::vector<std::string> fullKeys = {"tab_id", "engine_instance", "engine", "native_target_id", "identity",
                                                    "document_generation", "navigation_generation", "private_mode"};
  if (!keys(value, pending ? pendingKeys : fullKeys)) return false;
  const Value* identityValue = value->get("identity");
  // A web host serves many origins; each target names its own. Fixture targets
  // stay bound to the one synthetic origin supplied at the authenticated hello.
  bool identity = identityValue && identityValue->isString() &&
                  (webBrowsing ? webOrigin(identityValue->text) : identityValue->text == fixtureOrigin);
  const Value* privateMode = value->get("private_mode");
  return identifier(value->get("tab_id")) && identifier(value->get("engine_instance")) &&
         value->str("engine_instance") == streamInstance && identity && integer(value->get("document_generation")) &&
         integer(value->get("navigation_generation")) && boolean(privateMode) && !privateMode->boolean &&
         (pending || (value->str("engine") == "chromium" && identifier(value->get("native_target_id"))));
}
static void failProtocol() { transport.reject(); streamClosing = true; }
static void tabEvent(Tab* tab, const std::string& kind, Value fields = json::emptyObject()) {
  fields.type = Value::Type::Object;
  fields["event"] = kind;
  fields["version"] = 1;
  if (tab->live() && !fields.has("target")) fields["target"] = tab->target;
  transport.event(json::write(fields));
}
static void complete(const std::string& requestId, const std::string& status) {
  event("completed", json::object({{"request_id", requestId}, {"status", status}}));
}
static void unsupported(const std::string& requestId, const std::string& reason) {
  event("completed", json::object({{"request_id", requestId}, {"status", "unsupported"}, {"reason", reason}}));
}
static void streamCommand(const std::string& line);

// Forward declarations (accessibility bridge, input, delegation).
static cef_client_t* axClientFor(Tab* tab);
static void axTabClosed(Tab* tab);
static Value axActionNames();
static const std::vector<std::string>* axCommandFields(const std::string& method);
static std::vector<std::string> axOptionalFields(const std::string& method);
static bool axAcknowledge(const Value* supplied, const Value& command);
static bool axCommand(Tab* tab, const std::string& method, const Value& command, const std::string& requestId);
static void invalidateView(cef_browser_t* value);
static void closePromptsFor(Tab* tab, const std::string& reason, bool pageOnly);
static bool uiCommand(Tab* tab, const std::string& method, const Value& command, const std::string& requestId);
static bool inputCommand(Tab* tab, const std::string& method, const Value& command, const std::string& requestId);
static void sendKeyProbe(Tab* tab);
static void resetInput(Tab* tab);
static void cancelPinch(Tab* tab);
static void finishKeyWaits(Tab* tab);
static void configureDelegation();
static void configureInput();

static void pumpCommands() {
  for (int count = 0; count < 32 && !streamClosing; ++count) {
    auto line = transport.pop();
    if (!line) break;
    streamCommand(*line);
  }
}
static std::atomic<bool> pumpScheduled{false};
static std::atomic<bool> cefRunning{false};
// Reader thread -> CEF UI thread. Coalesced; the 10 ms tick remains as a fallback.
// Commands still execute only on the UI thread.
static void scheduleCommands() {
  if (!cefRunning || pumpScheduled.exchange(true)) return;
  if (!postUI([] { pumpScheduled = false; if (streamReady || streamClosing) pumpCommands(); })) pumpScheduled = false;
}

bool streamHandshake() {
  streaming = true;
  if (!transport.start(scheduleCommands)) return false;
  auto deadline = std::chrono::steady_clock::now() + std::chrono::seconds(10);
  while (std::chrono::steady_clock::now() < deadline && !transport.failed() && !transport.eof()) {
    if (auto line = transport.pop()) {
      Value hello;
      if (!json::parse(*line, hello) || !hello.isObject()) return false;
      bool web = hello.get("browsing_mode") && hello.get("browsing_mode")->isString() && hello.str("browsing_mode") == "web";
      std::vector<std::string> fields = {"version", "method", "token", "engine_instance", "fixture_origin"};
      if (web) fields.push_back("browsing_mode");
      // Optional fields are all-or-nothing per feature and still exact-key checked.
      // This platform has no Mach surface service: surface_* keys are not admitted.
      if (hello.has("frame_rate")) fields.push_back("frame_rate");
      if (!keys(&hello, fields) || !integer(hello.get("version"), 1) || hello.num("version") != 1 ||
          hello.str("method") != "hello" || !hello.get("method")->isString() || !tokenValue(hello.get("token")) ||
          !identifier(hello.get("engine_instance")) || !textValue(hello.get("fixture_origin"), web ? 4096 : 128))
        return false;
      const std::string& claimed = hello.str("fixture_origin");
      url::Url u;
      bool parsed = url::parse(claimed, u);
      if (web ? !webURL(claimed) : (!parsed || origin(u) != claimed)) return false;
      if (!parsed || !u.path.empty() || u.hasQuery || u.hasFragment || u.scheme == "about") return false;
      if (hello.has("frame_rate") && (!integer(hello.get("frame_rate"), 120) ||
                                      (hello.num("frame_rate") != 60 && hello.num("frame_rate") != 120)))
        return false;
      if (hello.has("frame_rate")) frameRate = int(hello.num("frame_rate"));
      streamToken = hello.str("token");
      streamInstance = hello.str("engine_instance");
      fixtureOrigin = claimed;
      webBrowsing = web;
      requestIds.clear();
      return true;
    }
    std::this_thread::sleep_for(std::chrono::milliseconds(10));
  }
  return false;
}

static void streamReadyEvent() {
  // These values are queried from the loaded runtime, not merely headers.
  char runtimeCEF[64], runtimeChromium[64];
  snprintf(runtimeCEF, sizeof(runtimeCEF), "%d.%d.%d", p_cef_version_info(0), p_cef_version_info(1), p_cef_version_info(2));
  snprintf(runtimeChromium, sizeof(runtimeChromium), "%d.%d.%d.%d", p_cef_version_info(4), p_cef_version_info(5),
           p_cef_version_info(6), p_cef_version_info(7));
  Value capabilities = json::object({
      {"surface", false}, {"external_begin_frame", false}, {"frame_rate", frameRate}, {"observe", true},
      {"navigate", true}, {"back", true}, {"forward", true}, {"reload", true}, {"stop", true}, {"close", true},
      {"input", true}, {"edit", true}, {"visibility", true}, {"cursor", true}, {"multi_target", true},
      {"max_targets", int(MaxTabs)}, {"persistent_profile", webBrowsing}, {"open_in_tab", webBrowsing},
      {"devtools", false}, {"ime", true}, {"key_verdict", true}, {"wheel_phases", true}, {"pinch", true},
      {"frame_rate_command", true}, {"private_mode", false}, {"fixture_only", !webBrowsing},
      {"permissions", webBrowsing}, {"downloads", webBrowsing}, {"popups", false}, {"accessibility", true},
      {"ax_actions", axActionNames()}, {"file_dialogs", webBrowsing}, {"javascript_dialogs", webBrowsing},
      {"heartbeat_interval_ms", HeartbeatIntervalMs}, {"context_menu", webBrowsing}, {"http_auth", webBrowsing},
      {"find", webBrowsing}, {"zoom", webBrowsing}, {"popup_blocked", webBrowsing}, {"media_capture", false}});
  event("ready", json::object({{"cef", CEF_VERSION}, {"chromium", runtimeChromium}, {"runtime_cef", runtimeCEF},
                               {"runtime_chromium", runtimeChromium}, {"platform", platform::name()},
                               {"sandbox_configured", true}, {"engine_instance", streamInstance},
                               {"render_path", "native-osr-bgra"}, {"capabilities", capabilities}}));
}

static bool surface(const Value* w, const Value* h, const Value* scale) {
  if (!integer(w, 4096) || !integer(h, 4096) || w->number == 0 || h->number == 0 || !scale || !scale->isNumber())
    return false;
  double d = scale->number;
  return std::isfinite(d) && d >= 1 && d <= 4;
}
static bool fitsSurface(const Value* w, const Value* h, const Value* scale) {
  double pw = std::ceil(w->number * scale->number), ph = std::ceil(h->number * scale->number);
  return pw <= 4096 && ph <= 4096 && pw * ph * 4 <= double(axio::MaxFrame);
}
static void streamFrame(Tab* tab, const void* pixels, int w, int h) {
  if (!tab->live() || !tab->paintAllowed || tab->closing || streamClosing) return;
  if (w <= 0 || h <= 0 || w > 4096 || h > 4096 || uint64_t(w) * uint64_t(h) * 4 > axio::MaxFrame) {
    tabEvent(tab, "error", json::object({{"code", "unsupported_surface"}}));
    tab->paintAllowed = false;
    return;
  }
  // A queued old-size paint can arrive after WasResized; do not relabel it.
  if (w != int(std::ceil(tab->width * tab->scale)) || h != int(std::ceil(tab->height * tab->scale))) return;
  if (frameId == MaxGeneration) { failProtocol(); return; }
  Value metadata = json::object({{"version", 1}, {"target", tab->target}, {"frame_id", ++frameId}, {"width", w},
                                 {"height", h}, {"stride", w * 4}, {"device_scale", tab->scale}, {"format", "BGRA8"}});
  transport.frame(tab->key, json::write(metadata), json::write(tab->target), frameId, pixels, size_t(w) * size_t(h) * 4);
}
static void compositePopup(Tab* tab) {
  if (tab->cachedView.empty() || tab->popupPixels.empty() || !tab->popupVisible) return;
  std::vector<uint8_t> composite = tab->cachedView;
  int left = int(std::round(tab->popupRect.x * tab->scale)), top = int(std::round(tab->popupRect.y * tab->scale));
  int startX = std::max(0, -left), startY = std::max(0, -top);
  int endX = std::min(tab->popupWidth, tab->cachedWidth - left), endY = std::min(tab->popupHeight, tab->cachedHeight - top);
  for (int y = startY; y < endY; y++)
    if (endX > startX)
      memcpy(composite.data() + (size_t(y + top) * size_t(tab->cachedWidth) + size_t(left + startX)) * 4,
             tab->popupPixels.data() + (size_t(y) * size_t(tab->popupWidth) + size_t(startX)) * 4, size_t(endX - startX) * 4);
  streamFrame(tab, composite.data(), tab->cachedWidth, tab->cachedHeight);
}
static void streamPaint(Tab* tab, cef_paint_element_type_t type, const void* pixels, int w, int h) {
  if (w <= 0 || h <= 0 || w > 4096 || h > 4096 || uint64_t(w) * uint64_t(h) * 4 > axio::MaxFrame) return;
  if (type == PET_VIEW) {
    if (!tab->popupVisible) { streamFrame(tab, pixels, w, h); return; }
    tab->cachedWidth = w; tab->cachedHeight = h;
    tab->cachedView.assign(static_cast<const uint8_t*>(pixels), static_cast<const uint8_t*>(pixels) + size_t(w) * size_t(h) * 4);
    if (tab->popupPixels.empty()) streamFrame(tab, pixels, w, h);
    else compositePopup(tab);
  } else if (type == PET_POPUP && tab->popupVisible && uint64_t(w) * uint64_t(h) * 4 <= 8 * 1024 * 1024) {
    tab->popupWidth = w; tab->popupHeight = h;
    tab->popupPixels.assign(static_cast<const uint8_t*>(pixels), static_cast<const uint8_t*>(pixels) + size_t(w) * size_t(h) * 4);
    compositePopup(tab);
  }
}
static Tab* tabForId(uint64_t id) {
  if (!id || id > uint64_t(INT_MAX)) return nullptr;
  auto found = tabsByBrowser.find(int(id));
  return found == tabsByBrowser.end() ? nullptr : found->second;
}
static void resetNavigation(Tab* tab) {
  tab->historyNavigation = false; tab->hasHistoryURL = false; tab->historyURL.clear();
  tab->commandNavigationInvalidated = false; tab->sameDocumentNavigation = false;
  tab->hasNavigateURL = false; tab->navigateURL.clear();
}
static void invalidateNavigation(Tab* tab) {
  uint64_t document = uint64_t(tab->target.num("document_generation")),
           navigation = uint64_t(tab->target.num("navigation_generation"));
  if (document == MaxGeneration || navigation == MaxGeneration) { failProtocol(); return; }
  // Page prompts belong to the document that asked; they close with its old target.
  closePromptsFor(tab, "navigation", true);
  tab->target["document_generation"] = document + 1;
  tab->target["navigation_generation"] = navigation + 1;
  tab->hasDocumentFrame = false; tab->documentFrame.clear();
  tab->paintAllowed = false;
  clearPopup(tab);
  transport.invalidatePendingFrame(tab->key);
  tabEvent(tab, "navigation");
}
static void invalidateView(cef_browser_t* value) {
  auto* host = value->get_host(value);
  host->invalidate(host, PET_VIEW);
  host->base.release(&host->base);
}
static void restoreCancelledDocument(Tab* tab, cef_browser_t* value) {
  if (!webBrowsing || !tab->hasCommittedDocument) return;
  auto* frame = value->get_main_frame(value);
  std::string actual = take(frame->get_url(frame)), actualFrame = take(frame->get_identifier(frame));
  frame->base.release(&frame->base);
  if (actual != tab->committedDocumentURL || !allowedURL(actual)) return;
  tab->documentFrame = actualFrame; tab->hasDocumentFrame = true;
  // The cancelled candidate never replaced this committed document. Its target
  // generation remains revoked, but the actual retained page can paint again.
  tab->paintAllowed = true;
  tabEvent(tab, "url", json::object({{"url", actual}}));
  tabEvent(tab, "load", json::object({{"http_status", 0}, {"restored_from_history", false}, {"same_document", true}}));
  invalidateView(value);
}
static void closeTab(Tab* tab) {
  tab->closing = true; tab->paintAllowed = false;
  transport.invalidatePendingFrame(tab->key);
  if (tab->browser) { auto* h = tab->browser->get_host(tab->browser); h->close_browser(h, 0); h->base.release(&h->base); }
}
// Called from the UI tick. Shutdown closes every target before the loop exits.
static void streamCloseAll() {
  std::vector<Tab*> open;
  for (auto& item : tabsByKey) if (!item.second->closing) open.push_back(item.second);
  for (Tab* tab : open) closeTab(tab);  // CEF may finish a close synchronously and erase it
}
static bool streamIdle() { return tabsByKey.empty() && !creating; }

static bool fragmentNavigation(Tab* tab, const std::string& value) {
  if (!webBrowsing || !tab->hasCommittedDocument || value == tab->committedDocumentURL) return false;
  return url::withoutFragment(value) == url::withoutFragment(tab->committedDocumentURL);
}

static const std::map<std::string, std::vector<std::string>>& commandFields() {
  static const std::map<std::string, std::vector<std::string>> table = {
      {"create", {"url", "width", "height", "device_scale"}}, {"navigate", {"url"}}, {"back", {}}, {"forward", {}},
      {"reload", {}}, {"stop", {}}, {"resize", {"width", "height", "device_scale"}}, {"focus", {"focused"}},
      {"visibility", {"visible"}}, {"edit", {"action"}},
      {"key", {"type", "native_key_code", "windows_key_code", "modifiers", "text"}},
      {"mouse", {"type", "x", "y", "modifiers", "button", "click_count", "mouse_leave"}},
      {"wheel", {"x", "y", "modifiers", "delta_x", "delta_y"}}, {"frame_ack", {"frame_id"}}, {"close", {}},
      {"shutdown", {}}, {"devtools", {}}, {"context_menu_command", {"prompt_id", "command", "index"}},
      {"dialog_reply", {"prompt_id", "accept", "text"}}, {"permission_reply", {"prompt_id", "decision"}},
      {"file_dialog_reply", {"prompt_id", "paths"}}, {"download_reply", {"prompt_id", "path"}},
      {"auth_reply", {"prompt_id", "accept", "username", "password"}}, {"download_control", {"download_id", "action"}},
      {"find", {"text", "forward", "match_case", "find_next"}}, {"stop_finding", {"clear_selection"}},
      {"zoom", {"level"}}, {"pinch", {"x", "y", "modifiers", "phase", "magnification"}},
      {"frame_rate", {"frame_rate"}}, {"ime_set_composition", {"text", "selection_start", "selection_end"}},
      {"ime_commit_text", {"text"}}, {"ime_finish_composing", {}}, {"ime_cancel_composition", {}}};
  return table;
}
static bool oneOf(const std::string& value, std::initializer_list<const char*> options) {
  for (const char* option : options) if (value == option) return true;
  return false;
}

static void streamCommand(const std::string& line) {
  Value command;
  if (!json::parse(line, command) || !command.isObject()) { failProtocol(); return; }
  const Value* methodValue = command.get("method");
  const Value* requestValue = command.get("request_id");
  if (!integer(command.get("version"), 1) || command.num("version") != 1 || !equalToken(command.get("token")) ||
      !identifier(requestValue) || !textValue(methodValue, 32)) {
    failProtocol();
    return;
  }
  const std::string method = methodValue->text, requestId = requestValue->text;
  if (webBrowsing) {
    // A long-lived 30 fps tab can send >100,000 ACKs per hour. Monotonic IDs
    // reject replay with constant memory and no short session lifetime limit.
    if (requestId.rfind("cef-", 0) != 0) { failProtocol(); return; }
    std::string digits = requestId.substr(4);
    if (digits.empty() || digits.size() > 16 || digits[0] == '0' ||
        digits.find_first_not_of("0123456789") != std::string::npos) {
      failProtocol();
      return;
    }
    uint64_t sequence = strtoull(digits.c_str(), nullptr, 10);
    if (sequence <= lastWebRequest || sequence > MaxGeneration) { failProtocol(); return; }
    lastWebRequest = sequence;
  } else {
    if (requestIds.count(requestId) || requestIds.size() >= 100000) { failProtocol(); return; }
    requestIds.insert(requestId);
  }
  const auto& table = commandFields();
  auto entry = table.find(method);
  const std::vector<std::string>* fields = entry != table.end() ? &entry->second : axCommandFields(method);
  if (!fields) { failProtocol(); return; }
  std::vector<std::string> expected = {"version", "method", "request_id", "token"};
  if (method != "shutdown") expected.push_back("target");
  expected.insert(expected.end(), fields->begin(), fields->end());
  // Optional fields stay exact-key checked: each is admitted only by name.
  // Wheel phases are one all-or-nothing group (`wheel_phases` capability).
  if (method == "wheel" && (command.has("phase") || command.has("momentum_phase") || command.has("precise"))) {
    expected.push_back("phase"); expected.push_back("momentum_phase"); expected.push_back("precise");
  }
  std::vector<std::string> optional;
  if (method == "ime_set_composition") optional = {"underlines", "replacement_range"};
  else if (method == "ime_commit_text") optional = {"replacement_range", "relative_cursor_pos"};
  else if (method == "ime_finish_composing") optional = {"keep_selection"};
  for (const auto& name : axOptionalFields(method)) optional.push_back(name);
  for (const auto& name : optional) if (command.has(name)) expected.push_back(name);
  if (!keys(&command, expected)) { failProtocol(); return; }
  if (method == "shutdown") {
    event("accepted", json::object({{"request_id", requestId}}));
    shutdownRequest = requestId;
    streamClosing = true;
    return;
  }
  bool creating_ = method == "create";
  const Value* supplied = command.get("target");
  if (!validTarget(supplied, creating_)) { failProtocol(); return; }
  if (method == "frame_ack") {
    // Exact outstanding target is intentionally used instead of current target:
    // discarded stale frames also need to release their one transport credit.
    if (!integer(command.get("frame_id")) ||
        !transport.acknowledge(uint64_t(command.num("frame_id")), json::write(*supplied))) {
      failProtocol();
    }
    return;
  }
  if (method == "ax_ack") { if (!axAcknowledge(supplied, command)) failProtocol(); return; }
  auto found = tabsByKey.find(supplied->str("tab_id"));
  Tab* tab = found == tabsByKey.end() ? nullptr : found->second;
  if (creating_) {
    if (tab || creating || !streamReady || streamClosing) {
      event("error", json::object({{"request_id", requestId}, {"code", "invalid_lifecycle"}}));
      return;
    }
    if (tabsByKey.size() >= MaxTabs) { unsupported(requestId, "target_limit"); return; }
    if (!allowedURL(command.get("url")) || !surface(command.get("width"), command.get("height"), command.get("device_scale"))) {
      failProtocol();
      return;
    }
    if (!fitsSurface(command.get("width"), command.get("height"), command.get("device_scale"))) {
      unsupported(requestId, "surface_limit");
      return;
    }
    tab = new Tab();
    tab->key = supplied->str("tab_id");
    tab->target = *supplied;
    tab->createRequest = requestId;
    tab->width = int(command.num("width")); tab->height = int(command.num("height"));
    tab->scale = command.num("device_scale");
    creating = tab;
    tabsByKey[tab->key] = tab;
    cef_window_info_t wi{};
    wi.size = sizeof(wi);
    wi.windowless_rendering_enabled = 1;
    wi.runtime_style = CEF_RUNTIME_STYLE_ALLOY;
    wi.shared_texture_enabled = 0;
    wi.external_begin_frame_enabled = 0;
    cef_browser_settings_t settings{};
    settings.size = sizeof(settings);
    settings.windowless_frame_rate = frameRate;
    auto value = json::toUtf16(command.str("url"));
    auto address = view(value);
    event("accepted", json::object({{"request_id", requestId}}));
    isolatedContext->base.base.add_ref(&isolatedContext->base.base);  // CEF takes this reference
    if (!p_cef_browser_host_create_browser(&wi, axClientFor(tab), &address, &settings, nullptr, isolatedContext)) {
      axTabClosed(tab);
      complete(requestId, "failed");
      creating = nullptr;
      tabsByKey.erase(tab->key);
      delete tab;
    }
    return;
  }
  if (!tab || tab->target != *supplied) {
    event("error", json::object({{"request_id", requestId}, {"code", "stale_target"}}));
    return;
  }
  if (!tab->browser || tab->closing || streamClosing) {
    event("error", json::object({{"request_id", requestId}, {"code", "closed_target"}}));
    return;
  }
  cef_browser_t* current = tab->browser;
  // A pending key-verdict probe goes out before any later command of this tab;
  // only the keydown's own `char` may precede it (see input).
  if (!(method == "key" && command.str("type") == "char")) sendKeyProbe(tab);
  if (method == "devtools") { unsupported(requestId, "devtools_not_integrated"); return; }
  if (inputCommand(tab, method, command, requestId)) return;
  if (axCommand(tab, method, command, requestId)) return;
  if (uiCommand(tab, method, command, requestId)) return;
  if (method == "navigate" && !allowedURL(command.get("url"))) { failProtocol(); return; }
  if (method == "resize") {
    if (!surface(command.get("width"), command.get("height"), command.get("device_scale"))) { failProtocol(); return; }
    if (!fitsSurface(command.get("width"), command.get("height"), command.get("device_scale"))) {
      unsupported(requestId, "surface_limit");
      return;
    }
  }
  if (method == "focus" && !boolean(command.get("focused"))) { failProtocol(); return; }
  if (method == "visibility" && !boolean(command.get("visible"))) { failProtocol(); return; }
  if (method == "edit" && !(command.get("action")->isString() &&
                            oneOf(command.str("action"), {"copy", "cut", "paste", "select_all", "undo", "redo"}))) {
    failProtocol();
    return;
  }
  if (method == "mouse") {
    if (!integer(command.get("x"), uint64_t(tab->width)) || !integer(command.get("y"), uint64_t(tab->height)) ||
        !integer(command.get("modifiers"), 131071)) {
      failProtocol();
      return;
    }
    if (!command.get("type")->isString() || !oneOf(command.str("type"), {"move", "down", "up"}) ||
        !command.get("button")->isString() || !oneOf(command.str("button"), {"left", "middle", "right"}) ||
        !integer(command.get("click_count"), 3) || command.num("click_count") == 0 || !boolean(command.get("mouse_leave"))) {
      failProtocol();
      return;
    }
  }
  bool navigation = oneOf(method, {"navigate", "back", "forward", "reload"});
  if ((method == "back" && !current->can_go_back(current)) || (method == "forward" && !current->can_go_forward(current))) {
    unsupported(requestId, "history_boundary");
    return;
  }
  if (navigation && !tab->navigationRequest.empty()) {
    // A newer explicit navigation replaces a slow one, as in any browser. The
    // replaced request completes without success; nothing is replayed.
    unsupported(tab->navigationRequest, "NAVIGATION_SUPERSEDED");
    tab->navigationRequest.clear();
    resetNavigation(tab);
    tab->supersededLoads++;
  }
  event("accepted", json::object({{"request_id", requestId}}));
  auto* host = current->get_host(current);
  if (navigation) {
    tab->navigationRequest = requestId;
    tab->historyNavigation = method == "back" || method == "forward";
    tab->hasHistoryURL = false; tab->historyURL.clear();
    tab->sameDocumentNavigation = method == "navigate" && fragmentNavigation(tab, command.str("url"));
    tab->hasNavigateURL = method == "navigate";
    tab->navigateURL = method == "navigate" ? command.str("url") : std::string();
    // BFCache restores can skip OnBeforeBrowse entirely. Revoke the previous
    // document before dispatching every accepted browser-issued navigation.
    invalidateNavigation(tab);
    tab->commandNavigationInvalidated = true;
    if (transport.failed()) { host->base.release(&host->base); return; }
  }
  if (method == "navigate") {
    auto* frame = current->get_main_frame(current);
    auto value = json::toUtf16(command.str("url"));
    auto address = view(value);
    frame->load_url(frame, &address);
    frame->base.release(&frame->base);
  } else if (method == "back") current->go_back(current);
  else if (method == "forward") current->go_forward(current);
  else if (method == "reload") current->reload(current);
  else if (method == "stop") current->stop_load(current);
  else if (method == "resize") {
    tab->width = int(command.num("width")); tab->height = int(command.num("height"));
    tab->scale = command.num("device_scale");
    transport.invalidatePendingFrame(tab->key);
    host->notify_screen_info_changed(host);
    host->was_resized(host);
  } else if (method == "focus") host->set_focus(host, command.flag("focused"));
  else if (method == "visibility") {
    bool visible = command.flag("visible");
    if (!visible) cancelPinch(tab);
    host->was_hidden(host, !visible);
    if (visible) host->invalidate(host, PET_VIEW);
    else transport.invalidatePendingFrame(tab->key);
  } else if (method == "edit") {
    auto* frame = current->get_focused_frame(current);
    if (!frame) { host->base.release(&host->base); unsupported(requestId, "no_focused_frame"); return; }
    const std::string& action = command.str("action");
    if (action == "copy") frame->copy(frame);
    else if (action == "cut") frame->cut(frame);
    else if (action == "paste") frame->paste(frame);
    else if (action == "select_all") frame->select_all(frame);
    else if (action == "undo") frame->undo(frame);
    else if (action == "redo") frame->redo(frame);
    frame->base.release(&frame->base);
  } else if (method == "mouse") {
    cef_mouse_event_t mouse{};
    mouse.x = int(command.num("x")); mouse.y = int(command.num("y"));
    mouse.modifiers = uint32_t(command.num("modifiers"));
    if (command.str("type") == "move") host->send_mouse_move_event(host, &mouse, command.flag("mouse_leave"));
    else {
      const std::string& name = command.str("button");
      cef_mouse_button_type_t button = name == "left" ? MBT_LEFT : (name == "right" ? MBT_RIGHT : MBT_MIDDLE);
      host->send_mouse_click_event(host, &mouse, button, command.str("type") == "up", int(command.num("click_count")));
    }
  } else if (method == "close") {
    tab->closeRequest = requestId;
    host->base.release(&host->base);
    closeTab(tab);
    return;
  }
  host->base.release(&host->base);
  if (!navigation) complete(requestId, "success");
}

static const char* cursorName(cef_cursor_type_t type) {
  switch (type) {
    case CT_HAND: return "pointer";
    case CT_IBEAM: return "text";
    case CT_VERTICALTEXT: return "vertical-text";
    case CT_WAIT: return "wait";
    case CT_PROGRESS: return "progress";
    case CT_HELP: return "help";
    case CT_CROSS: return "crosshair";
    case CT_MOVE: return "move";
    case CT_NOTALLOWED: case CT_NODROP: case CT_DND_NONE: return "not-allowed";
    case CT_GRAB: return "grab";
    case CT_GRABBING: return "grabbing";
    case CT_CONTEXTMENU: return "context-menu";
    case CT_CELL: return "cell";
    case CT_ALIAS: case CT_DND_LINK: return "alias";
    case CT_COPY: case CT_DND_COPY: return "copy";
    case CT_ZOOMIN: return "zoom-in";
    case CT_NONE: return "none";
    case CT_EASTRESIZE: case CT_WESTRESIZE: case CT_EASTWESTRESIZE: case CT_COLUMNRESIZE: return "ew-resize";
    case CT_NORTHRESIZE: case CT_SOUTHRESIZE: case CT_NORTHSOUTHRESIZE: case CT_ROWRESIZE: return "ns-resize";
    case CT_NORTHEASTRESIZE: case CT_SOUTHWESTRESIZE: case CT_NORTHEASTSOUTHWESTRESIZE: return "nesw-resize";
    case CT_NORTHWESTRESIZE: case CT_SOUTHEASTRESIZE: case CT_NORTHWESTSOUTHEASTRESIZE: return "nwse-resize";
    default: return "default";
  }
}

#include "delegation.inc"
#include "input.inc"
#include "a11y_bridge.inc"
#include "handlers.inc"

// ---- Browser process ---------------------------------------------------------------------------
static void configure() {
  app.api.get_browser_process_handler = [](cef_app_t*) { return processHandler.retain(); };
  app.api.on_before_command_line_processing = [](cef_app_t*, const cef_string_t* processType, cef_command_line_t* line) {
    AXIO_HOLD(line);
    // Browser process only; fixed platform policy, never caller-supplied switches.
    if (!line || (processType && processType->length)) return;
    for (const auto& item : config.switches) {
      size_t equals = item.find('=');
      auto name = json::toUtf16(item.substr(0, equals));
      auto cefName = view(name);
      if (equals == std::string::npos) line->append_switch(line, &cefName);
      else {
        auto value = json::toUtf16(item.substr(equals + 1));
        auto cefValue = view(value);
        line->append_switch_with_value(line, &cefName, &cefValue);
      }
    }
  };
  client.api.get_life_span_handler = [](cef_client_t*) { return lifespan.retain(); };
  client.api.get_render_handler = [](cef_client_t*) { return render.retain(); };
  client.api.get_display_handler = [](cef_client_t*) { return display.retain(); };
  client.api.get_load_handler = [](cef_client_t*) { return loading.retain(); };
  client.api.get_request_handler = [](cef_client_t*) { return request.retain(); };
  client.api.get_permission_handler = [](cef_client_t*) { return permissions.retain(); };
  processHandler.api.on_context_initialized = [](cef_browser_process_handler_t*) {
    // Fixture probes keep cookies/cache in memory. A web host owns exactly one
    // persistent Chromium profile beside its Zen profile, never Firefox data.
    static std::u16string persistentPath;
    cef_request_context_settings_t contextSettings{};
    contextSettings.size = sizeof(contextSettings);
    if (streaming && webBrowsing) {
      persistentPath = json::toUtf16(config.profile);
      contextSettings.cache_path = view(persistentPath);
    }
    isolatedContext = p_cef_request_context_create_context(&contextSettings, nullptr);
    if (!isolatedContext) { event("error", json::object({{"code", "isolated_context_failed"}})); streamClosing = true; return; }
    if (streaming) { streamReady = true; streamReadyEvent(); return; }
    cef_window_info_t wi{};
    wi.size = sizeof(wi);
    wi.windowless_rendering_enabled = 1;
    wi.runtime_style = CEF_RUNTIME_STYLE_ALLOY;
    cef_browser_settings_t settings{};
    settings.size = sizeof(settings);
    settings.windowless_frame_rate = 20;
    auto address = view(initialURL);
    // CEF takes one reference to each ref-counted argument.
    isolatedContext->base.base.add_ref(&isolatedContext->base.base);
    int accepted = p_cef_browser_host_create_browser(&wi, client.retain(), &address, &settings, nullptr, isolatedContext);
    event("create_accepted", json::object({{"accepted", accepted}}));
  };
  lifespan.api.on_after_created = [](cef_life_span_handler_t*, cef_browser_t* b) {
    browser = b;  // keeps CEF's reference until on_before_close
    event("created", json::object({{"nativeTargetId", b->get_identifier(b)}}));
  };
  lifespan.api.on_before_close = [](cef_life_span_handler_t*, cef_browser_t* b) {
    event("closed");
    closed = true;
    if (browser) browser->base.release(&browser->base);
    browser = nullptr;
    b->base.release(&b->base);
  };
  render.api.get_view_rect = [](cef_render_handler_t*, cef_browser_t* b, cef_rect_t* r) {
    HOLD(b);
    *r = {0, 0, width, height};
  };
  render.api.get_screen_info = [](cef_render_handler_t*, cef_browser_t* b, cef_screen_info_t* i) {
    HOLD(b);
    i->device_scale_factor = float(deviceScale); i->depth = 32; i->depth_per_component = 8;
    i->rect = {0, 0, width, height}; i->available_rect = i->rect;
    return 1;
  };
  // Stream mode replaces this handler. E0 frames at both device scales are part of the result.
  render.api.on_paint = [](cef_render_handler_t*, cef_browser_t* b, cef_paint_element_type_t type, size_t,
                           const cef_rect_t*, const void* buffer, int w, int h) {
    HOLD(b);
    if (type != PET_VIEW) return;
    frames++;
    if (deviceScale == 1.0 && w == width && h == height) scale1Frame = true;
    if (deviceScale == 2.0 && w == width * 2 && h == height * 2) scale2Frame = true;
    saveFrame(buffer, w, h);
  };
  display.api.on_title_change = [](cef_display_handler_t*, cef_browser_t* b, const cef_string_t* t) {
    HOLD(b);
    std::string title = utf8(t);
    event("title", json::object({{"title", title}}));
    if (title.find("input=CEF") != std::string::npos) { inputObserved = true; captureName = "cef-e0-input.png"; }
    if (title.find("page=2") != std::string::npos) navigated = true;
  };
  display.api.on_address_change = [](cef_display_handler_t*, cef_browser_t* b, cef_frame_t* f, const cef_string_t* u) {
    HOLD(b); HOLD(f);
    if (f->is_main(f)) event("url", json::object({{"url", utf8(u)}}));
  };
  loading.api.on_load_start = [](cef_load_handler_t*, cef_browser_t* b, cef_frame_t* f, cef_transition_type_t) {
    HOLD(b); HOLD(f);
    if (f->is_main(f)) event("load_start", json::object({{"url", take(f->get_url(f))}}));
  };
  loading.api.on_loading_state_change = [](cef_load_handler_t*, cef_browser_t* b, int active, int back, int forward) {
    HOLD(b);
    event("loading_state", json::object({{"loading", active}, {"canBack", back}, {"canForward", forward}}));
  };
  loading.api.on_load_end = [](cef_load_handler_t*, cef_browser_t* b, cef_frame_t* f, int status) {
    HOLD(b); HOLD(f);
    if (!f->is_main(f)) return;
    loaded = loaded || status == 200;
    std::string address = take(f->get_url(f));
    captureName = address.size() >= 7 && address.compare(address.size() - 7, 7, "?page=2") == 0 ? "cef-e0-page2.png"
                                                                                                 : "cef-e0-loaded.png";
    event("load", json::object({{"httpStatus", status}}));
  };
  loading.api.on_load_error = [](cef_load_handler_t*, cef_browser_t* b, cef_frame_t* f, cef_errorcode_t code,
                                 const cef_string_t* description, const cef_string_t* failed) {
    HOLD(b); HOLD(f);
    event("load_error", json::object({{"code", int(code)}, {"mainFrame", f->is_main(f)}, {"url", utf8(failed)},
                                      {"description", utf8(description)}}));
  };
  if (streaming) configureStream();
}

int runBrowser(int argc, char** argv, const LaunchConfig& launch) {
  (void)argc;
  config = launch;
  streaming = launch.streaming;
  if (!streaming) initialURL = json::toUtf16(launch.fixtureUrl);
  configure();
  cef_settings_t settings{};
  settings.size = sizeof(settings);
  settings.windowless_rendering_enabled = 1;
  settings.no_sandbox = 0;
  settings.command_line_args_disabled = 1;
  settings.remote_debugging_port = 0;
  auto profile = json::toUtf16(launch.profile);
  settings.root_cache_path = view(profile);
  auto logPath = json::toUtf16(joinPath(launch.evidence, "cef-runtime.log"));
  settings.log_file = view(logPath);
  settings.log_severity = LOGSEVERITY_WARNING;
  auto subprocess = json::toUtf16(launch.subprocessPath);
  if (!launch.subprocessPath.empty()) settings.browser_subprocess_path = view(subprocess);
  int cefArgc = 1;
  cef_main_args_t args{cefArgc, argv};
  if (!streaming) {
    char runtimeCEF[64], runtimeChromium[64], chromium[64];
    snprintf(chromium, sizeof(chromium), "%d.%d.%d.%d", CHROME_VERSION_MAJOR, CHROME_VERSION_MINOR, CHROME_VERSION_BUILD,
             CHROME_VERSION_PATCH);
    snprintf(runtimeCEF, sizeof(runtimeCEF), "%d.%d.%d", p_cef_version_info(0), p_cef_version_info(1), p_cef_version_info(2));
    snprintf(runtimeChromium, sizeof(runtimeChromium), "%d.%d.%d.%d", p_cef_version_info(4), p_cef_version_info(5),
             p_cef_version_info(6), p_cef_version_info(7));
    event("version", json::object({{"cef", CEF_VERSION}, {"chromium", chromium}, {"platform", platform::name()},
                                   {"sandboxConfigured", true}, {"runtimeChromiumMajor", p_cef_version_info(4)},
                                   {"runtimeCEF", runtimeCEF}, {"runtimeChromium", runtimeChromium},
                                   {"renderPath", "native-osr-bgra"}, {"deviceScaleFactor", 2},
                                   {"switches", [] { Value list = json::array(); for (const auto& s : config.switches) list.items.push_back(s); return list; }()}}));
  }
  if (!cef::p_cef_initialize(&args, &settings, app.retain(), nullptr)) {
    event("initialize_failed");
    return 70;
  }
  cefRunning = true;
  runLoop();
  cefRunning = false;
  if (!streaming) event("message_loop_returned", json::object({{"closed", closed}}));
  if (!closed) return exitStatus ? exitStatus : 75;  // the outer supervisor cleans only this process group
  if (isolatedContext) { isolatedContext->base.base.release(&isolatedContext->base.base); isolatedContext = nullptr; }
  cef::p_cef_shutdown();
  if (!streaming) event("shutdown_returned");
  if (exitStatus) return exitStatus;
  if (streaming) {
    if (!shutdownRequest.empty()) complete(shutdownRequest, "success");
    transport.finishEvents(std::chrono::milliseconds(1000));
    return transport.failed() ? 64 : 0;
  }
  bool pass = loaded && frames > 0 && inputObserved && navigated && scale1Frame && scale2Frame;
  event("result", json::object({{"E0", pass ? "PASS" : "FAIL"}, {"frames", frames}, {"inputObserved", inputObserved},
                                {"navigationObserved", navigated}, {"scale1FrameObserved", scale1Frame},
                                {"scale2FrameObserved", scale2Frame},
                                {"elapsedSeconds", std::chrono::duration<double>(std::chrono::steady_clock::now() - startedAt).count()},
                                {"E1", "BLOCKED_ENV"}, {"E2", "BLOCKED_ENV"}}));
  return pass ? 0 : 1;
}

}  // namespace axio::host
