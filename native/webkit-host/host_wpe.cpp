// AxioSozo WebKit host (Linux, WPE WebKit). contracts/engine-stream-v1.md, fixture profile.
//
// One out-of-process host per Zen engine instance. Zen/Gecko stays the application:
// this process owns no window, presents nothing itself and renders WPE WebKit
// offscreen through libwpe + WPEBackend-fdo exportable SHM buffers (ARGB8888 in
// CPU memory). Every buffer is copied into the AXCF stream and released at once.
// WebKit keeps its own multi-process model (UI = this process, WPEWebProcess,
// WPENetworkProcess) and its bubblewrap sandbox; the host refuses to run when the
// sandbox-disabling environment variable is present.
//
// usage: AxioWebKitHost --stream <private-profile-dir> <evidence-dir>
#include "stream_core.hpp"

#include <wpe/webkit.h>
#include <wpe/fdo.h>
#include <wpe/unstable/fdo-shm.h>
#include <wayland-server.h>
#include <glib-unix.h>

#include <atomic>
#include <cmath>
#include <cerrno>
#include <csignal>
#include <cstdio>
#include <cstdlib>
#include <dirent.h>
#include <map>
#include <sys/prctl.h>
#include <sys/stat.h>
#include <sys/utsname.h>
#include <sys/wait.h>
#include <thread>
#include <unistd.h>

using namespace axio;
using namespace axio::stream;

namespace {

constexpr const char* SandboxKillSwitch = "WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS";

// ---- Paint fence ----------------------------------------------------------------------
// After a commit WebKit keeps re-rendering the previous document's frozen layer tree for
// a few frames (CI run 39296320523: the first buffer after page 2 committed and finished
// was byte-identical to page 1). So buffers are held until the new document reports, from
// an isolated script world the page cannot see or call, that it has shown and rendered
// three animation frames. pageshow also fires for back/forward-cache restores.
constexpr const char* FenceWorld = "axiosozo-paint-fence";
constexpr const char* FenceHandler = "axiosozoPaintFence";
constexpr const char* FenceSource =
  "window.webkit.messageHandlers.axiosozoPaintFence.postMessage('start:'+location.href);"
  "addEventListener('pageshow',()=>{const f=requestAnimationFrame;"
  "f(()=>f(()=>f(()=>window.webkit.messageHandlers.axiosozoPaintFence.postMessage(location.href)))));},true);";
constexpr int FenceTimeoutMs = 2000;  // pages where the script cannot run still present

// ---- Text commit path: a minimal WebKitInputMethodContext ---------------------------
// WebKit tells the context when an editable element gains or loses focus; Zen's text
// (`key` char, `ime_commit_text`) is committed through the `committed` signal, the
// same path a real input method uses. No preedit yet (capability `ime:false`).
struct AxioIMContext { WebKitInputMethodContext parent_instance; gboolean focused; };
struct AxioIMContextClass { WebKitInputMethodContextClass parent_class; };
G_DEFINE_TYPE(AxioIMContext, axio_im_context, WEBKIT_TYPE_INPUT_METHOD_CONTEXT)
void axio_im_context_init(AxioIMContext* self) { self->focused = FALSE; }
void axio_im_context_class_init(AxioIMContextClass* klass) {
  auto* im = WEBKIT_INPUT_METHOD_CONTEXT_CLASS(klass);
  im->get_preedit = [](WebKitInputMethodContext*, gchar** text, GList** underlines, guint* cursor) {
    if (text) *text = g_strdup("");
    if (underlines) *underlines = nullptr;
    if (cursor) *cursor = 0;
  };
  im->filter_key_event = [](WebKitInputMethodContext*, gpointer) -> gboolean { return FALSE; };
  im->notify_focus_in = [](WebKitInputMethodContext* c) { reinterpret_cast<AxioIMContext*>(c)->focused = TRUE; };
  im->notify_focus_out = [](WebKitInputMethodContext* c) { reinterpret_cast<AxioIMContext*>(c)->focused = FALSE; };
  im->reset = [](WebKitInputMethodContext*) {};
}

// cef-v1 EVENTFLAG bits carried by `modifiers`.
constexpr uint32_t FlagShift = 1u << 1, FlagControl = 1u << 2, FlagAlt = 1u << 3, FlagLeft = 1u << 4,
                   FlagMiddle = 1u << 5, FlagRight = 1u << 6, FlagCommand = 1u << 7;
uint32_t keyboardModifiers(uint32_t flags) {
  uint32_t m = 0;
  if (flags & FlagControl) m |= wpe_input_keyboard_modifier_control;
  if (flags & FlagShift) m |= wpe_input_keyboard_modifier_shift;
  if (flags & FlagAlt) m |= wpe_input_keyboard_modifier_alt;
  if (flags & FlagCommand) m |= wpe_input_keyboard_modifier_meta;
  return m;
}
// Windows virtual-key codes (cef-v1 `windows_key_code`) to XKB keysyms.
uint32_t keysymForVirtualKey(uint32_t vk, bool shift) {
  switch (vk) {
    case 8: return WPE_KEY_BackSpace; case 9: return WPE_KEY_Tab; case 13: return WPE_KEY_Return;
    case 16: return WPE_KEY_Shift_L; case 17: return WPE_KEY_Control_L; case 18: return WPE_KEY_Alt_L;
    case 20: return WPE_KEY_Caps_Lock; case 27: return WPE_KEY_Escape; case 32: return WPE_KEY_space;
    case 33: return WPE_KEY_Page_Up; case 34: return WPE_KEY_Next; case 35: return WPE_KEY_End; case 36: return WPE_KEY_Home;
    case 37: return WPE_KEY_Left; case 38: return WPE_KEY_Up; case 39: return WPE_KEY_Right; case 40: return WPE_KEY_Down;
    case 45: return WPE_KEY_Insert; case 46: return WPE_KEY_Delete; case 91: case 92: return WPE_KEY_Super_L;
    default: break;
  }
  if (vk >= 48 && vk <= 57) return vk;                          // '0'..'9'
  if (vk >= 65 && vk <= 90) return shift ? vk : vk + 32;        // 'A'..'Z' / 'a'..'z'
  if (vk >= 112 && vk <= 123) return WPE_KEY_F1 + (vk - 112);   // F1..F12
  switch (vk) {
    case 186: return ';'; case 187: return '='; case 188: return ','; case 189: return '-'; case 190: return '.';
    case 191: return '/'; case 192: return '`'; case 219: return '['; case 220: return '\\'; case 221: return ']'; case 222: return '\'';
    default: return 0;
  }
}
uint32_t nowMs() { return uint32_t(g_get_monotonic_time() / 1000); }
// Diagnostics only (AXIOSOZO_WEBKIT_TRACE=1): ordering of buffer exports and load events on stderr.
bool tracing() { static const bool on = getenv("AXIOSOZO_WEBKIT_TRACE") != nullptr; return on; }
#define AXIO_TRACE(...) do { if (tracing()) { fprintf(stderr, "AXIO_TRACE %lld ", (long long)(g_get_monotonic_time() / 1000)); fprintf(stderr, __VA_ARGS__); fputc('\n', stderr); } } while (0)

class WpeEngine;

// Callbacks from WPEBackend-fdo can outlive the view object (WebKit may finalize
// the backend later); they reach the view only through this box, nulled on close.
struct BackendBox;

class WpeView final : public EngineView {
public:
  WpeView(WpeEngine& engine, Host& host, Tab& tab) : engine_(engine), host_(host), tab_(tab) {}
  ~WpeView() override { detach(); }
  bool create(int width, int height, double scale, int frameRate);

  std::string nativeId() const override { return std::to_string(webkit_web_view_get_page_id(view_)); }
  void load(const std::string& url) override { webkit_web_view_load_uri(view_, url.c_str()); }
  bool canGoBack() override { return view_ && webkit_web_view_can_go_back(view_); }
  bool canGoForward() override { return view_ && webkit_web_view_can_go_forward(view_); }
  void goBack() override { webkit_web_view_go_back(view_); }
  void goForward() override { webkit_web_view_go_forward(view_); }
  void reload() override { webkit_web_view_reload(view_); }
  void stop() override { webkit_web_view_stop_loading(view_); }
  void resize(int width, int height, double scale) override {
    scale_ = scale;
    wpe_view_backend_dispatch_set_device_scale_factor(backend_, float(scale));
    wpe_view_backend_dispatch_set_size(backend_, uint32_t(width), uint32_t(height));
  }
  void setFocus(bool focused) override {
    if (focused) wpe_view_backend_add_activity_state(backend_, wpe_view_activity_state_focused);
    else wpe_view_backend_remove_activity_state(backend_, wpe_view_activity_state_focused);
  }
  void setVisible(bool visible) override {
    if (visible) wpe_view_backend_add_activity_state(backend_, wpe_view_activity_state_visible);
    else wpe_view_backend_remove_activity_state(backend_, wpe_view_activity_state_visible);
  }
  void setFrameRate(int rate) override { frameRate_ = rate; }
  void key(const KeyInput& key) override;
  void mouse(const MouseInput& mouse) override;
  void wheel(const WheelInput& wheel) override;
  void commitText(const std::string& text) override { commit(text); }
  bool edit(const std::string& action) override {
    static const std::map<std::string, const char*> commands{
      {"copy", WEBKIT_EDITING_COMMAND_COPY}, {"cut", WEBKIT_EDITING_COMMAND_CUT}, {"paste", WEBKIT_EDITING_COMMAND_PASTE},
      {"select_all", WEBKIT_EDITING_COMMAND_SELECT_ALL}, {"undo", WEBKIT_EDITING_COMMAND_UNDO}, {"redo", WEBKIT_EDITING_COMMAND_REDO}};
    webkit_web_view_execute_editing_command(view_, commands.at(action));
    return true;
  }
  void close() override { detach(); host_.viewClosed(&tab_); }

  // Called by the backend box on the UI thread.
  void exported(struct wpe_fdo_shm_exported_buffer* buffer);
  WebKitWebView* webView() const { return view_; }
  Tab& tab() { return tab_; }

private:
  WpeEngine& engine_;
  Host& host_;
  Tab& tab_;
  BackendBox* box_ = nullptr;
  struct wpe_view_backend_exportable_fdo* exportable_ = nullptr;
  struct wpe_view_backend* backend_ = nullptr;
  WebKitWebView* view_ = nullptr;
  AxioIMContext* im_ = nullptr;
  WebKitUserContentManager* content_ = nullptr;
  // Paint fence state: buffers exported since the last commit are held, not presented.
  bool fenced_ = false;
  guint fenceTimer_ = 0;
  std::vector<uint8_t> held_;
  int heldWidth_ = 0, heldHeight_ = 0; PixelFormat heldFormat_ = PixelFormat::BGRA8Premultiplied;
  bool heldValid_ = false;
  guint frameTimer_ = 0;
  gint64 lastComplete_ = 0;
  int frameRate_ = 60;
  double scale_ = 1;              // libwpe pointer/axis coordinates are device pixels
  uint32_t buttons_ = 0;          // wpe pointer button modifier mask while pressed
  std::string downText_;          // text the last keydown already inserted
  bool loadFailed_ = false, tlsFailed_ = false, detached_ = false;

  void detach();
  void scheduleFrameComplete();
  void commit(const std::string& text);
  void typeCodepoint(uint32_t codepoint, uint32_t modifiers);
  void connect();
  void present(const uint8_t* pixels, int width, int height, size_t stride, PixelFormat format);
public:
  void committed() { fenced_ = false; heldValid_ = false; if (fenceTimer_) { g_source_remove(fenceTimer_); fenceTimer_ = 0; } }
  void finished();
  void openFence(const char* reason);
  void fenceMessage(const std::string& href);
};

struct BackendBox {
  WpeView* owner = nullptr;
  struct wpe_view_backend_exportable_fdo* exportable = nullptr;
};

class WpeEngine final : public Engine {
public:
  bool initialize(Host& host, const std::string& profile);
  void shutdown();
  std::unique_ptr<EngineView> createView(Tab& tab, int width, int height, double scale, int frameRate) override {
    auto view = std::make_unique<WpeView>(*this, *host_, tab);
    if (!view->create(width, height, scale, frameRate)) return nullptr;
    return view;
  }
  Object readyFields() override {
    struct utsname name {};
    uname(&name);
    char webkit[32], wpe[32], fdo[32];
    snprintf(webkit, sizeof webkit, "%u.%u.%u", webkit_get_major_version(), webkit_get_minor_version(), webkit_get_micro_version());
    snprintf(wpe, sizeof wpe, "%u.%u.%u", wpe_get_major_version(), wpe_get_minor_version(), wpe_get_micro_version());
    snprintf(fdo, sizeof fdo, "%u.%u.%u", wpe_fdo_get_major_version(), wpe_fdo_get_minor_version(), wpe_fdo_get_micro_version());
    std::string machine = name.machine;
    return Object{{"engine", "webkit"}, {"webkit_port", "wpe"}, {"webkit", webkit}, {"runtime_webkit", webkit},
                  {"libwpe", wpe}, {"wpebackend_fdo", fdo}, {"platform", "linux-" + machine},
                  // WebKit 2.x API has no way to turn the sandbox off; only the
                  // environment variable can, and its presence makes this host refuse to start.
                  {"sandbox_configured", true}, {"sandbox", "bubblewrap"}, {"process_model", "multi-process"},
                  {"render_path", "wpe-fdo-shm-bgra"}};
  }
  Object capabilities() override { return Object{}; }
  std::string engineName() override { return "webkit"; }

  WpeView* viewFor(WebKitWebView* view) { auto f = views_.find(view); return f == views_.end() ? nullptr : f->second; }
  void track(WebKitWebView* view, WpeView* owner) { if (owner) views_[view] = owner; else views_.erase(view); }
  WebKitWebContext* context() const { return context_; }
  WebKitNetworkSession* session() const { return session_; }
  WebKitSettings* settings() const { return settings_; }
  // One content manager per view (the fence message must identify its view); all share
  // the origin filter and the isolated-world fence script.
  WebKitUserContentManager* newContentManager() const;
  Host& host() { return *host_; }

private:
  Host* host_ = nullptr;
  WebKitWebContext* context_ = nullptr;
  WebKitNetworkSession* session_ = nullptr;
  WebKitSettings* settings_ = nullptr;
  WebKitUserContentFilter* filter_ = nullptr;
  WebKitUserScript* fenceScript_ = nullptr;
  WebKitUserContentFilterStore* filters_ = nullptr;
  std::map<WebKitWebView*, WpeView*> views_;
};

// ---- View -------------------------------------------------------------------------
const struct wpe_view_backend_exportable_fdo_client exportClient = {
  nullptr,  // export_buffer_resource (EGL)
  nullptr,  // export_dmabuf_resource
  [](void* data, struct wpe_fdo_shm_exported_buffer* buffer) {
    auto* box = static_cast<BackendBox*>(data);
    if (box->owner) box->owner->exported(buffer);
    else wpe_view_backend_exportable_fdo_dispatch_release_shm_exported_buffer(box->exportable, buffer);
  },
  nullptr, nullptr};

bool WpeView::create(int width, int height, double scale, int frameRate) {
  frameRate_ = frameRate;
  scale_ = scale;
  box_ = new BackendBox();
  box_->owner = this;
  exportable_ = box_->exportable = wpe_view_backend_exportable_fdo_create(&exportClient, box_, uint32_t(width), uint32_t(height));
  if (!exportable_) { delete box_; box_ = nullptr; return false; }
  backend_ = wpe_view_backend_exportable_fdo_get_view_backend(exportable_);
  wpe_view_backend_dispatch_set_device_scale_factor(backend_, float(scale));
  // The WebKit view backend owns the exportable and the box from here on.
  auto* backend = webkit_web_view_backend_new(backend_, [](gpointer data) {
    auto* box = static_cast<BackendBox*>(data);
    wpe_view_backend_exportable_fdo_destroy(box->exportable);
    delete box;
  }, box_);
  content_ = engine_.newContentManager();
  g_signal_connect(content_, (std::string("script-message-received::") + FenceHandler).c_str(),
                   G_CALLBACK(+[](WebKitUserContentManager*, JSCValue* value, gpointer d) {
    char* href = jsc_value_is_string(value) ? jsc_value_to_string(value) : nullptr;
    static_cast<WpeView*>(d)->fenceMessage(href ? href : "");
    g_free(href);
  }), this);
  view_ = WEBKIT_WEB_VIEW(g_object_new(WEBKIT_TYPE_WEB_VIEW, "backend", backend, "web-context", engine_.context(),
                                       "network-session", engine_.session(), "settings", engine_.settings(),
                                       "user-content-manager", content_, nullptr));
  if (!view_) return false;
  // libwpe drops dispatches made before WebKit registered its backend client
  // (CI run 39294885122: the page saw devicePixelRatio 1), so apply scale and size now.
  wpe_view_backend_dispatch_set_device_scale_factor(backend_, float(scale));
  wpe_view_backend_dispatch_set_size(backend_, uint32_t(width), uint32_t(height));
  wpe_view_backend_add_activity_state(backend_, wpe_view_activity_state_visible | wpe_view_activity_state_in_window);
  im_ = static_cast<AxioIMContext*>(g_object_new(axio_im_context_get_type(), nullptr));
  webkit_web_view_set_input_method_context(view_, WEBKIT_INPUT_METHOD_CONTEXT(im_));
  engine_.track(view_, this);
  connect();
  return true;
}

void WpeView::detach() {
  if (detached_) return;
  detached_ = true;
  if (frameTimer_) { g_source_remove(frameTimer_); frameTimer_ = 0; }
  if (fenceTimer_) { g_source_remove(fenceTimer_); fenceTimer_ = 0; }
  if (box_) box_->owner = nullptr;  // late backend callbacks only release buffers
  if (view_) {
    engine_.track(view_, nullptr);
    g_signal_handlers_disconnect_by_data(view_, this);
    webkit_web_view_stop_loading(view_);
    g_object_unref(view_);
    view_ = nullptr;
  }
  if (im_) { g_object_unref(im_); im_ = nullptr; }
  if (content_) {
    g_signal_handlers_disconnect_by_data(content_, this);
    webkit_user_content_manager_unregister_script_message_handler(content_, FenceHandler, FenceWorld);
    g_object_unref(content_); content_ = nullptr;
  }
}

void WpeView::exported(struct wpe_fdo_shm_exported_buffer* buffer) {
  struct wl_shm_buffer* shm = wpe_fdo_shm_exported_buffer_get_shm_buffer(buffer);
  if (shm) {
    wl_shm_buffer_begin_access(shm);
    uint32_t format = wl_shm_buffer_get_format(shm);
    int width = wl_shm_buffer_get_width(shm), height = wl_shm_buffer_get_height(shm), stride = wl_shm_buffer_get_stride(shm);
    AXIO_TRACE("export %dx%d", width, height);
    auto* pixels = static_cast<const uint8_t*>(wl_shm_buffer_get_data(shm));
    if ((format == WL_SHM_FORMAT_ARGB8888 || format == WL_SHM_FORMAT_XRGB8888) && stride > 0)
      present(pixels, width, height, size_t(stride),
              format == WL_SHM_FORMAT_ARGB8888 ? PixelFormat::BGRA8Premultiplied : PixelFormat::BGRX8);
    else host_.denied(&tab_, "unsupported_surface_format");
    wl_shm_buffer_end_access(shm);
  }
  // The pixels are already copied: the buffer goes straight back to WebKit.
  wpe_view_backend_exportable_fdo_dispatch_release_shm_exported_buffer(exportable_, buffer);
  scheduleFrameComplete();
}

void WpeView::present(const uint8_t* pixels, int width, int height, size_t stride, PixelFormat format) {
  if (fenced_) { host_.frame(&tab_, pixels, width, height, stride, format); return; }
  // Before the fence: keep only the newest buffer, tightly packed.
  size_t row = size_t(width) * 4;
  held_.resize(row * size_t(height));
  for (int y = 0; y < height; ++y) memcpy(held_.data() + row * size_t(y), pixels + stride * size_t(y), row);
  heldWidth_ = width; heldHeight_ = height; heldFormat_ = format; heldValid_ = true;
  AXIO_TRACE("held %dx%d", width, height);
}

void WpeView::openFence(const char* reason) {
  if (fenced_ || detached_) return;
  fenced_ = true;
  if (fenceTimer_) { g_source_remove(fenceTimer_); fenceTimer_ = 0; }
  AXIO_TRACE("fence %s held=%d", reason, int(heldValid_));
  // WebKit renders at least one frame after the third animation frame; the newest held
  // buffer is also from the new document by then.
  if (heldValid_) { heldValid_ = false; host_.frame(&tab_, held_.data(), heldWidth_, heldHeight_, size_t(heldWidth_) * 4, heldFormat_); }
}

void WpeView::fenceMessage(const std::string& href) {
  AXIO_TRACE("fence message %s", href.c_str());
  if (href.rfind("start:", 0) == 0) return;  // diagnostics: the script runs
  const char* uri = view_ ? webkit_web_view_get_uri(view_) : nullptr;
  // Only the committed document opens its own fence.
  if (uri && href == uri) openFence("document");
  else AXIO_TRACE("fence ignored %s", href.c_str());
}

void WpeView::finished() {
  if (fenced_ || fenceTimer_) return;
  fenceTimer_ = g_timeout_add(FenceTimeoutMs, [](gpointer d) -> gboolean {
    auto* view = static_cast<WpeView*>(d);
    view->fenceTimer_ = 0;
    view->openFence("timeout");
    return G_SOURCE_REMOVE;
  }, this);
}

// frame_complete is WebKit's vsync: paced to the negotiated frame rate.
void WpeView::scheduleFrameComplete() {
  if (frameTimer_ || detached_) return;
  gint64 interval = 1000000 / std::max(1, frameRate_), now = g_get_monotonic_time();
  gint64 wait = lastComplete_ + interval - now;
  auto fire = [](gpointer data) -> gboolean {
    auto* self = static_cast<WpeView*>(data);
    self->frameTimer_ = 0;
    self->lastComplete_ = g_get_monotonic_time();
    wpe_view_backend_exportable_fdo_dispatch_frame_complete(self->exportable_);
    return G_SOURCE_REMOVE;
  };
  if (wait <= 0) { lastComplete_ = now; wpe_view_backend_exportable_fdo_dispatch_frame_complete(exportable_); return; }
  frameTimer_ = g_timeout_add(guint((wait + 999) / 1000), fire, this);
}

void WpeView::typeCodepoint(uint32_t codepoint, uint32_t modifiers) {
  struct wpe_input_keyboard_event event {};
  event.time = nowMs(); event.key_code = wpe_unicode_to_key_code(codepoint); event.hardware_key_code = 0;
  event.modifiers = modifiers; event.pressed = true;
  wpe_view_backend_dispatch_keyboard_event(backend_, &event);
  event.pressed = false; event.time = nowMs();
  wpe_view_backend_dispatch_keyboard_event(backend_, &event);
}

void WpeView::commit(const std::string& text) {
  if (im_ && im_->focused) { g_signal_emit_by_name(im_, "committed", text.c_str()); return; }
  // No focused editable: deliver the characters as key presses.
  for (uint32_t codepoint : json::codepoints(text)) typeCodepoint(codepoint, 0);
}

void WpeView::key(const KeyInput& key) {
  uint32_t modifiers = keyboardModifiers(key.modifiers);
  if (key.type == "char") {
    // CEF-style down/char/up: the keydown already inserted its own printable text.
    if (!downText_.empty() && key.text == downText_) { downText_.clear(); return; }
    downText_.clear();
    if (!key.text.empty()) commit(key.text);
    return;
  }
  bool shift = key.modifiers & FlagShift;
  uint32_t keysym = 0;
  if (!key.text.empty()) keysym = wpe_unicode_to_key_code(json::codepoints(key.text).front());
  if (!keysym) keysym = keysymForVirtualKey(key.windowsKeyCode, shift);
  struct wpe_input_keyboard_event event {};
  event.time = nowMs(); event.key_code = keysym; event.hardware_key_code = key.nativeKeyCode;
  event.pressed = key.type == "down"; event.modifiers = modifiers;
  if (event.pressed) {
    uint32_t produced = wpe_key_code_to_unicode(keysym);
    bool textual = produced >= 0x20 && produced != 0x7F && !(key.modifiers & (FlagControl | FlagAlt | FlagCommand));
    downText_.clear();
    if (textual) { char utf8[8] = {}; g_unichar_to_utf8(gunichar(produced), utf8); downText_ = utf8; }
  }
  wpe_view_backend_dispatch_keyboard_event(backend_, &event);
}

void WpeView::mouse(const MouseInput& mouse) {
  // libwpe buttons follow evdev order: 1 left, 2 right, 3 middle.
  uint32_t button = mouse.button == "left" ? 1 : mouse.button == "right" ? 2 : 3;
  uint32_t mask = button == 1 ? wpe_input_pointer_modifier_button1 : button == 2 ? wpe_input_pointer_modifier_button2 : wpe_input_pointer_modifier_button3;
  struct wpe_input_pointer_event event {};
  // cef-v1 coordinates are CSS (view) pixels; WebKit divides libwpe's by the device scale.
  event.time = nowMs(); event.x = int(std::lround(mouse.x * scale_)); event.y = int(std::lround(mouse.y * scale_));
  if (mouse.type == "move") {
    // Buttons held per cef-v1 flags or by an earlier `down` make this a drag.
    uint32_t held = buttons_;
    if (mouse.modifiers & FlagLeft) held |= wpe_input_pointer_modifier_button1;
    if (mouse.modifiers & FlagRight) held |= wpe_input_pointer_modifier_button2;
    if (mouse.modifiers & FlagMiddle) held |= wpe_input_pointer_modifier_button3;
    event.type = wpe_input_pointer_event_type_motion;
    event.modifiers = keyboardModifiers(mouse.modifiers) | held;
  } else {
    bool pressed = mouse.type == "down";
    if (pressed) buttons_ |= mask; else buttons_ &= ~mask;
    event.type = wpe_input_pointer_event_type_button; event.button = button; event.state = pressed ? 1 : 0;
    event.modifiers = keyboardModifiers(mouse.modifiers) | buttons_;
  }
  wpe_view_backend_dispatch_pointer_event(backend_, &event);
}

void WpeView::wheel(const WheelInput& wheel) {
  // Pixel deltas as a smooth 2D axis event. cef-v1 delta_y < 0 scrolls down. WebKit's WPE
  // event factory reports DOM deltaY = -y_axis / device_scale (measured, CI run 39295936869:
  // y_axis +400 at 2x gave deltaY -200), so the cef-v1 CSS-pixel delta is sent scaled, same sign.
  struct wpe_input_axis_2d_event event {};
  event.base.type = static_cast<wpe_input_axis_event_type>(wpe_input_axis_event_type_mask_2d | wpe_input_axis_event_type_motion_smooth);
  event.base.time = nowMs(); event.base.x = int(std::lround(wheel.x * scale_)); event.base.y = int(std::lround(wheel.y * scale_));
  event.base.modifiers = keyboardModifiers(wheel.modifiers) | buttons_;
  event.x_axis = double(wheel.deltaX) * scale_; event.y_axis = double(wheel.deltaY) * scale_;
  wpe_view_backend_dispatch_axis_event(backend_, &event.base);
}

WpeView* self(gpointer data) { return static_cast<WpeView*>(data); }

void WpeView::connect() {
  g_signal_connect(view_, "notify::title", G_CALLBACK(+[](WebKitWebView* v, GParamSpec*, gpointer d) {
    const char* title = webkit_web_view_get_title(v);
    self(d)->host_.titleChanged(&self(d)->tab_, title ? title : "");
  }), this);
  g_signal_connect(view_, "notify::uri", G_CALLBACK(+[](WebKitWebView* v, GParamSpec*, gpointer d) {
    const char* uri = webkit_web_view_get_uri(v);
    self(d)->host_.urlChanged(&self(d)->tab_, uri ? uri : "");
  }), this);
  g_signal_connect(view_, "notify::is-loading", G_CALLBACK(+[](WebKitWebView* v, GParamSpec*, gpointer d) {
    self(d)->host_.loadingChanged(&self(d)->tab_, webkit_web_view_is_loading(v));
  }), this);
  g_signal_connect(view_, "load-changed", G_CALLBACK(+[](WebKitWebView* v, WebKitLoadEvent event, gpointer d) {
    WpeView* view = self(d);
    const char* uri = webkit_web_view_get_uri(v);
    std::string url = uri ? uri : "";
    AXIO_TRACE("load-changed %d %s", int(event), url.c_str());
    if (event == WEBKIT_LOAD_STARTED) { view->loadFailed_ = false; view->tlsFailed_ = false; }
    else if (event == WEBKIT_LOAD_COMMITTED) { view->committed(); view->host_.loadCommitted(&view->tab_, url); }
    else if (event == WEBKIT_LOAD_FINISHED && !view->loadFailed_) {
      view->finished();
      int status = 0;
      if (WebKitWebResource* resource = webkit_web_view_get_main_resource(v))
        if (WebKitURIResponse* response = webkit_web_resource_get_response(resource)) status = int(webkit_uri_response_get_status_code(response));
      view->host_.loadFinished(&view->tab_, url, status);
    }
  }), this);
  g_signal_connect(view_, "load-failed-with-tls-errors", G_CALLBACK(+[](WebKitWebView*, char*, GTlsCertificate*, GTlsCertificateFlags, gpointer d) -> gboolean {
    self(d)->tlsFailed_ = true;
    return FALSE;  // unhandled: WebKit fails the load (TLS errors policy FAIL); no bypass exists
  }), this);
  g_signal_connect(view_, "load-failed", G_CALLBACK(+[](WebKitWebView*, WebKitLoadEvent, char*, GError* error, gpointer d) -> gboolean {
    WpeView* view = self(d);
    view->loadFailed_ = true;
    bool cancelled = g_error_matches(error, WEBKIT_NETWORK_ERROR, WEBKIT_NETWORK_ERROR_CANCELLED)
                     || g_error_matches(error, WEBKIT_POLICY_ERROR, WEBKIT_POLICY_ERROR_FRAME_LOAD_INTERRUPTED_BY_POLICY_CHANGE);
    view->host_.loadFailed(&view->tab_, error ? error->code : 0, cancelled, view->tlsFailed_);
    return TRUE;  // no WebKit error page: Zen renders failures itself
  }), this);
  g_signal_connect(view_, "decide-policy", G_CALLBACK(+[](WebKitWebView*, WebKitPolicyDecision* decision, WebKitPolicyDecisionType type, gpointer d) -> gboolean {
    WpeView* view = self(d);
    if (type == WEBKIT_POLICY_DECISION_TYPE_NEW_WINDOW_ACTION) {
      view->host_.denied(&view->tab_, "popup_denied"); webkit_policy_decision_ignore(decision); return TRUE;
    }
    if (type == WEBKIT_POLICY_DECISION_TYPE_RESPONSE) {
      auto* response = WEBKIT_RESPONSE_POLICY_DECISION(decision);
      if (!webkit_response_policy_decision_is_mime_type_supported(response)) {
        view->host_.denied(&view->tab_, "download_denied"); webkit_policy_decision_ignore(decision); return TRUE;
      }
      webkit_policy_decision_use(decision); return TRUE;
    }
    auto* action = webkit_navigation_policy_decision_get_navigation_action(WEBKIT_NAVIGATION_POLICY_DECISION(decision));
    WebKitURIRequest* request = webkit_navigation_action_get_request(action);
    const char* uri = webkit_uri_request_get_uri(request);
    const char* method = webkit_uri_request_get_http_method(request);
    // WebKit reports a null method for history loads of GET entries.
    std::string verb = method ? method : "GET";
    if (view->host_.navigationPolicy(&view->tab_, uri ? uri : "", verb)) webkit_policy_decision_use(decision);
    else webkit_policy_decision_ignore(decision);
    return TRUE;
  }), this);
  g_signal_connect(view_, "create", G_CALLBACK(+[](WebKitWebView*, WebKitNavigationAction*, gpointer d) -> WebKitWebView* {
    self(d)->host_.denied(&self(d)->tab_, "popup_denied");
    return nullptr;  // never a native window
  }), this);
  g_signal_connect(view_, "permission-request", G_CALLBACK(+[](WebKitWebView*, WebKitPermissionRequest* request, gpointer d) -> gboolean {
    webkit_permission_request_deny(request);
    self(d)->host_.denied(&self(d)->tab_, "permission_denied");
    return TRUE;
  }), this);
  g_signal_connect(view_, "script-dialog", G_CALLBACK(+[](WebKitWebView*, WebKitScriptDialog*, gpointer d) -> gboolean {
    self(d)->host_.denied(&self(d)->tab_, "javascript_dialog_unavailable");
    return TRUE;  // closed with its safe default (cancel / false / empty)
  }), this);
  g_signal_connect(view_, "run-file-chooser", G_CALLBACK(+[](WebKitWebView*, WebKitFileChooserRequest* request, gpointer d) -> gboolean {
    webkit_file_chooser_request_cancel(request);
    self(d)->host_.denied(&self(d)->tab_, "file_dialog_unavailable");
    return TRUE;
  }), this);
  g_signal_connect(view_, "authenticate", G_CALLBACK(+[](WebKitWebView*, WebKitAuthenticationRequest* request, gpointer d) -> gboolean {
    webkit_authentication_request_cancel(request);
    self(d)->host_.denied(&self(d)->tab_, "http_auth_unavailable");
    return TRUE;
  }), this);
  g_signal_connect(view_, "context-menu", G_CALLBACK(+[](WebKitWebView*, gpointer, gpointer, gpointer) -> gboolean { return TRUE; }), this);
  g_signal_connect(view_, "show-notification", G_CALLBACK(+[](WebKitWebView*, gpointer, gpointer) -> gboolean { return TRUE; }), this);
  g_signal_connect(view_, "enter-fullscreen", G_CALLBACK(+[](WebKitWebView*, gpointer) -> gboolean { return TRUE; }), this);
  g_signal_connect(view_, "mouse-target-changed", G_CALLBACK(+[](WebKitWebView*, WebKitHitTestResult* hit, guint, gpointer d) {
    // WPE has no cursor callback: derive the CSS cursor from WebKit's hit test.
    const char* cursor = webkit_hit_test_result_context_is_link(hit) ? "pointer"
                         : webkit_hit_test_result_context_is_editable(hit) ? "text" : "default";
    self(d)->host_.cursorChanged(&self(d)->tab_, cursor);
  }), this);
  g_signal_connect(view_, "web-process-terminated", G_CALLBACK(+[](WebKitWebView*, WebKitWebProcessTerminationReason reason, gpointer d) {
    self(d)->host_.processTerminated(&self(d)->tab_, int(reason));
  }), this);
}

// ---- Engine -----------------------------------------------------------------------
bool WpeEngine::initialize(Host& host, const std::string& profile) {
  host_ = &host;
  // The fdo backend, in shared-memory mode: no GPU, no EGL in this process.
  if (!wpe_loader_init("libWPEBackend-fdo-1.0.so.1") || !wpe_fdo_initialize_shm()) {
    fprintf(stderr, "AXIO_WEBKIT wpebackend-fdo SHM initialization failed\n");
    return false;
  }
  // Per-instance isolated storage: nothing is shared with Gecko, CEF or another host.
  std::string data = profile + "/webkit-data", cache = profile + "/webkit-cache";
  session_ = webkit_network_session_new(data.c_str(), cache.c_str());
  webkit_network_session_set_tls_errors_policy(session_, WEBKIT_TLS_ERRORS_POLICY_FAIL);
  g_signal_connect(session_, "download-started", G_CALLBACK(+[](WebKitNetworkSession*, WebKitDownload* download, gpointer d) {
    auto* engine = static_cast<WpeEngine*>(d);
    webkit_download_cancel(download);
    if (WpeView* view = engine->viewFor(webkit_download_get_web_view(download))) engine->host().denied(&view->tab(), "download_denied");
  }), this);
  context_ = webkit_web_context_new();
  webkit_web_context_set_cache_model(context_, WEBKIT_CACHE_MODEL_DOCUMENT_VIEWER);
  webkit_web_context_set_spell_checking_enabled(context_, FALSE);
  settings_ = webkit_settings_new();
  webkit_settings_set_enable_developer_extras(settings_, FALSE);
  webkit_settings_set_javascript_can_open_windows_automatically(settings_, FALSE);
  webkit_settings_set_enable_write_console_messages_to_stdout(settings_, FALSE);
  webkit_settings_set_allow_file_access_from_file_urls(settings_, FALSE);
  webkit_settings_set_allow_universal_access_from_file_urls(settings_, FALSE);
  webkit_settings_set_enable_media_stream(settings_, FALSE);
  webkit_settings_set_enable_webrtc(settings_, FALSE);
  webkit_settings_set_enable_page_cache(settings_, TRUE);
  // Subresource policy: WebKit's content blocker allows only the fixture origin.
  // Navigations are additionally checked path-exactly in decide-policy.
  std::string origin = host.fixtureOrigin(), escaped;
  for (char c : origin) { if (c == '.') escaped += "\\\\."; else escaped += c; }
  std::string rules = "[{\"trigger\":{\"url-filter\":\".*\"},\"action\":{\"type\":\"block\"}},"
                      "{\"trigger\":{\"url-filter\":\"^" + escaped + "/\"},\"action\":{\"type\":\"ignore-previous-rules\"}}]";
  std::string store = profile + "/webkit-content-filters";
  filters_ = webkit_user_content_filter_store_new(store.c_str());
  struct Pending { bool done = false; WebKitUserContentFilter* filter = nullptr; } pending;
  GBytes* bytes = g_bytes_new(rules.data(), rules.size());
  webkit_user_content_filter_store_save(filters_, "axiosozo-fixture-origin", bytes, nullptr, [](GObject* source, GAsyncResult* result, gpointer data) {
    auto* p = static_cast<Pending*>(data);
    GError* error = nullptr;
    p->filter = webkit_user_content_filter_store_save_finish(WEBKIT_USER_CONTENT_FILTER_STORE(source), result, &error);
    if (error) { fprintf(stderr, "AXIO_WEBKIT content filter: %s\n", error->message); g_error_free(error); }
    p->done = true;
  }, &pending);
  g_bytes_unref(bytes);
  gint64 deadline = g_get_monotonic_time() + 20 * G_USEC_PER_SEC;
  while (!pending.done && g_get_monotonic_time() < deadline) g_main_context_iteration(nullptr, TRUE);
  if (!pending.filter) return false;  // fail closed: no ready without the origin filter
  filter_ = pending.filter;
  fenceScript_ = webkit_user_script_new_for_world(FenceSource, WEBKIT_USER_CONTENT_INJECT_TOP_FRAME,
                                                  WEBKIT_USER_SCRIPT_INJECT_AT_DOCUMENT_START, FenceWorld, nullptr, nullptr);
  return true;
}

WebKitUserContentManager* WpeEngine::newContentManager() const {
  WebKitUserContentManager* content = webkit_user_content_manager_new();
  webkit_user_content_manager_add_filter(content, filter_);
  webkit_user_content_manager_add_script(content, fenceScript_);
  webkit_user_content_manager_register_script_message_handler(content, FenceHandler, FenceWorld);
  return content;
}

void WpeEngine::shutdown() {
  if (fenceScript_) { webkit_user_script_unref(fenceScript_); fenceScript_ = nullptr; }
  if (filter_) { webkit_user_content_filter_unref(filter_); filter_ = nullptr; }
  if (filters_) { g_object_unref(filters_); filters_ = nullptr; }
  if (settings_) { g_object_unref(settings_); settings_ = nullptr; }
  if (session_) { g_signal_handlers_disconnect_by_data(session_, this); g_object_unref(session_); session_ = nullptr; }
  if (context_) { g_object_unref(context_); context_ = nullptr; }
}

// ---- Process ownership --------------------------------------------------------------
// The host is a child subreaper: WebKit helpers (and bwrap) re-parent to it, so it
// can prove at exit that none of them outlives it.
std::vector<pid_t> children() {
  std::vector<pid_t> found;
  pid_t self = getpid();
  DIR* proc = opendir("/proc");
  if (!proc) return found;
  while (dirent* entry = readdir(proc)) {
    char* end = nullptr;
    long pid = strtol(entry->d_name, &end, 10);
    if (!end || *end || pid <= 0) continue;
    char path[64]; snprintf(path, sizeof path, "/proc/%ld/stat", pid);
    FILE* file = fopen(path, "re");
    if (!file) continue;
    char line[1024] = {};
    size_t n = fread(line, 1, sizeof line - 1, file);
    fclose(file);
    line[n] = 0;
    // Field 4 (ppid) follows the parenthesized command name, which may contain spaces.
    char* close = strrchr(line, ')');
    char state = 0; long parent = 0;
    if (close && sscanf(close + 1, " %c %ld", &state, &parent) == 2 && parent == self && state != 'Z') found.push_back(pid_t(pid));
  }
  closedir(proc);
  return found;
}
void reap() { while (waitpid(-1, nullptr, WNOHANG) > 0) {} }
void stopChildren(int graceMs) {
  auto until = [](int ms) { return g_get_monotonic_time() + gint64(ms) * 1000; };
  gint64 deadline = until(graceMs);
  while (!children().empty() && g_get_monotonic_time() < deadline) {
    g_main_context_iteration(nullptr, FALSE);  // let WebKit finish its IPC teardown
    reap(); std::this_thread::sleep_for(std::chrono::milliseconds(20));
  }
  for (int signal : {SIGTERM, SIGKILL}) {
    auto remaining = children();
    if (remaining.empty()) break;
    for (pid_t pid : remaining) kill(pid, signal);
    deadline = until(1000);
    while (!children().empty() && g_get_monotonic_time() < deadline) { reap(); std::this_thread::sleep_for(std::chrono::milliseconds(20)); }
  }
  reap();
}

std::atomic<bool> pumpScheduled{false};
Host* currentHost = nullptr;
GMainLoop* loop = nullptr;

bool privateDirectory(const std::string& path) {
  struct stat info {};
  return lstat(path.c_str(), &info) == 0 && S_ISDIR(info.st_mode) && info.st_uid == getuid() && (info.st_mode & 077) == 0;
}
bool ensurePrivate(const std::string& path) { return (mkdir(path.c_str(), 0700) == 0 || errno == EEXIST) && privateDirectory(path); }

}  // namespace

int main(int argc, char** argv) {
  if (argc != 4 || std::string(argv[1]) != "--stream") { fprintf(stderr, "usage: AxioWebKitHost --stream private-profile evidence-dir\n"); return 64; }
  signal(SIGPIPE, SIG_IGN);
  // Zen gone: the kernel ends this host, and our helpers with it (see stopChildren).
  prctl(PR_SET_PDEATHSIG, SIGTERM);
  prctl(PR_SET_CHILD_SUBREAPER, 1);
  if (getenv(SandboxKillSwitch)) {
    fprintf(stderr, "AXIO_WEBKIT refusing to start: %s is set; the WebKit sandbox is never disabled\n", SandboxKillSwitch);
    return 70;
  }
  std::string profile = argv[2];
  if (!privateDirectory(profile)) { fprintf(stderr, "AXIO_WEBKIT profile must be an owned 0700 directory\n"); return 64; }
  // Everything WebKit, Mesa or fontconfig would write per user goes into this instance.
  for (auto [name, sub] : {std::pair{"XDG_CACHE_HOME", "/xdg-cache"}, std::pair{"XDG_DATA_HOME", "/xdg-data"},
                           std::pair{"XDG_CONFIG_HOME", "/xdg-config"}, std::pair{"XDG_STATE_HOME", "/xdg-state"}}) {
    std::string dir = profile + sub;
    if (!ensurePrivate(dir)) return 64;
    setenv(name, dir.c_str(), 1);
  }
  if (!getenv("XDG_RUNTIME_DIR")) {
    std::string run = profile + "/xdg-run";
    if (!ensurePrivate(run)) return 64;
    setenv("XDG_RUNTIME_DIR", run.c_str(), 1);
  }

  Transport transport;
  // Reader thread -> GLib main context (thread-safe idle source), coalesced.
  if (!transport.start([] {
        if (pumpScheduled.exchange(true)) return;
        g_idle_add([](gpointer) -> gboolean { pumpScheduled = false; if (currentHost) currentHost->pump(); return G_SOURCE_REMOVE; }, nullptr);
      })) return 64;
  WpeEngine engine;
  Host host(transport, engine);
  if (!host.handshake(std::chrono::seconds(10))) return 64;
  if (!engine.initialize(host, profile)) {
    host.event("error", Object{{"code", "engine_initialization_failed"}});
    transport.finishEvents(std::chrono::milliseconds(1000));
    stopChildren(2000);
    return 70;
  }
  currentHost = &host;
  host.ready();
  loop = g_main_loop_new(nullptr, FALSE);
  g_unix_signal_add(SIGTERM, [](gpointer) -> gboolean { if (currentHost) currentHost->beginClosing(); return G_SOURCE_CONTINUE; }, nullptr);
  g_unix_signal_add(SIGINT, [](gpointer) -> gboolean { if (currentHost) currentHost->beginClosing(); return G_SOURCE_CONTINUE; }, nullptr);
  static bool watchdogArmed = false;
  g_timeout_add(10, [](gpointer) -> gboolean {
    bool done = currentHost->tick();
    if (currentHost->closing() && !watchdogArmed) {
      watchdogArmed = true;
      // Whatever teardown does, exit is bounded and leaves no helper behind.
      std::thread([] {
        std::this_thread::sleep_for(std::chrono::seconds(15));
        for (pid_t pid : children()) kill(pid, SIGKILL);
        _exit(76);
      }).detach();
    }
    if (done) { g_main_loop_quit(loop); return G_SOURCE_REMOVE; }
    return G_SOURCE_CONTINUE;
  }, nullptr);
  g_main_loop_run(loop);
  currentHost->tick();  // destroy closed views
  engine.shutdown();
  stopChildren(5000);
  int code = host.finish();
  currentHost = nullptr;
  if (!children().empty()) { fprintf(stderr, "AXIO_WEBKIT helper processes survived shutdown\n"); return 76; }
  return code;
}
