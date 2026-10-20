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
#include <set>
#include <sys/stat.h>
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
// was byte-identical to page 1). So buffers are held until the new document, asked from
// an isolated script world the page cannot see, has rendered three animation frames.
constexpr const char* FenceWorld = "axiosozo-paint-fence";
constexpr const char* FenceFunction =
  "await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(r))));"
  "return location.href;";
constexpr int FenceTimeoutMs = 2000;  // pages where the script cannot run still present

// ---- Text commit path: a minimal WebKitInputMethodContext ---------------------------
// WebKit tells the context when an editable element gains or loses focus; Zen's text
// (`key` char, `ime_commit_text`) is committed through the `committed` signal, the
// same path a real input method uses. No preedit yet (capability `ime:false`).
// With browser UI (§8.2) Zen's IME composition arrives as preedit (ime_set_composition),
// shown by WebKit with an underline, and the editable's caret goes back as text_input.
class WpeView;
void imFocusChanged(WpeView* owner, WebKitInputMethodContext* context, bool focused);
void imCursorArea(WpeView* owner, int x, int y, int width, int height);
struct AxioIMContext {
  WebKitInputMethodContext parent_instance; gboolean focused;
  WpeView* owner; std::string* preedit; guint cursor;  // owner nulled on detach
};
struct AxioIMContextClass { WebKitInputMethodContextClass parent_class; };
G_DEFINE_TYPE(AxioIMContext, axio_im_context, WEBKIT_TYPE_INPUT_METHOD_CONTEXT)
void axio_im_context_init(AxioIMContext* self) { self->focused = FALSE; self->owner = nullptr; self->preedit = new std::string(); self->cursor = 0; }
void axio_im_context_class_init(AxioIMContextClass* klass) {
  auto* im = WEBKIT_INPUT_METHOD_CONTEXT_CLASS(klass);
  G_OBJECT_CLASS(klass)->finalize = [](GObject* object) {
    delete reinterpret_cast<AxioIMContext*>(object)->preedit;
    G_OBJECT_CLASS(axio_im_context_parent_class)->finalize(object);
  };
  im->get_preedit = [](WebKitInputMethodContext* c, gchar** text, GList** underlines, guint* cursor) {
    auto* self = reinterpret_cast<AxioIMContext*>(c);
    if (text) *text = g_strdup(self->preedit->c_str());
    if (underlines) {
      glong length = g_utf8_strlen(self->preedit->c_str(), -1);
      *underlines = length ? g_list_prepend(nullptr, webkit_input_method_underline_new(0, guint(length))) : nullptr;
    }
    if (cursor) *cursor = self->cursor;
  };
  im->filter_key_event = [](WebKitInputMethodContext*, gpointer) -> gboolean { return FALSE; };
  im->notify_focus_in = [](WebKitInputMethodContext* c) {
    auto* self = reinterpret_cast<AxioIMContext*>(c); self->focused = TRUE;
    if (self->owner) imFocusChanged(self->owner, c, true);
  };
  im->notify_focus_out = [](WebKitInputMethodContext* c) {
    auto* self = reinterpret_cast<AxioIMContext*>(c); self->focused = FALSE;
    if (self->owner) imFocusChanged(self->owner, c, false);
  };
  im->notify_cursor_area = [](WebKitInputMethodContext* c, int x, int y, int width, int height) {
    auto* self = reinterpret_cast<AxioIMContext*>(c);
    if (self->owner) imCursorArea(self->owner, x, y, width, height);
  };
  im->reset = [](WebKitInputMethodContext*) {};
}

// ---- Browser UI helpers (§8.2) ---------------------------------------------------------
// Small functions run in an isolated script world the page cannot see (as the paint fence);
// they read the selection, the CSS cursor and the declared icon, and never change page state
// except the selection itself (double/triple click on hosts whose WebKit does not do it).
constexpr const char* UiWorld = "axiosozo-browser-ui";
constexpr const char* SelectionFunction = R"JS(
const a = document.activeElement;
if (a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT')) {
  if (a.type === 'password') return JSON.stringify({text: '', editable: true, password: true});
  let text = '';
  try { if (typeof a.selectionStart === 'number') text = a.value.slice(a.selectionStart, a.selectionEnd); } catch {}
  return JSON.stringify({text, editable: !a.readOnly && !a.disabled});
}
return JSON.stringify({text: String(getSelection()), editable: !!(a && a.isContentEditable)});
)JS";
constexpr const char* PointerUpFunction = R"JS(
let via = 'engine';
const drag = window.__axioDrag;
window.__axioDrag = null;
// WebCore's release puts a caret at the pointer when it saw no drag: restore the dragged selection.
if (drag && drag.ours) { getSelection().setBaseAndExtent(drag.node, drag.offset, drag.focusNode, drag.focusOffset); via = 'drag-emulated'; }
const s = getSelection(), a = document.activeElement;
const field = a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT') && typeof a.selectionStart === 'number' ? a : null;
const collapsed = field ? a.selectionStart === a.selectionEnd : s.isCollapsed;
if (count >= 2 && collapsed) {
  via = 'emulated';
  if (field && document.elementFromPoint(x, y) === field) {
    const v = field.value, word = /[\p{L}\p{N}_]/u;
    let i = field.selectionStart, j = i;
    if (count >= 3) { i = 0; j = v.length; }
    else { while (i > 0 && word.test(v[i - 1])) i--; while (j < v.length && word.test(v[j])) j++; }
    if (j > i) field.setSelectionRange(i, j);
  } else if (!field) {
    const r = document.caretRangeFromPoint(x, y);
    if (r) {
      s.collapse(r.startContainer, r.startOffset);
      if (count >= 3) { s.modify('move', 'backward', 'paragraphboundary'); s.modify('extend', 'forward', 'paragraphboundary'); }
      else { s.modify('move', 'forward', 'word'); s.modify('extend', 'backward', 'word'); }
    }
  }
}
let text = '';
if (field) { if (field.type !== 'password') text = field.value.slice(field.selectionStart, field.selectionEnd); }
else text = String(getSelection());
return JSON.stringify({via, text});
)JS";
// Selection by dragging: WPE's libwpe event factory gives motion events no button, so WebCore
// never starts a selection drag. Anchored at the press, extended on each move, over page text
// only (fields, links and controls keep WebKit's own behaviour); WebKit's own selection wins.
constexpr const char* DragStartFunction = R"JS(
window.__axioDrag = null;
const e = document.elementFromPoint(x, y);
if (!e || e.closest('input,textarea,select,button,a[href],[draggable="true"]') || e.isContentEditable) return 'skip';
const r = document.caretRangeFromPoint(x, y);
if (!r) return 'skip';
// The press itself collapses the selection to a caret here (WebKit's own press may still be queued).
getSelection().collapse(r.startContainer, r.startOffset);
window.__axioDrag = {node: r.startContainer, offset: r.startOffset, ours: false};
return 'armed';
)JS";
constexpr const char* DragMoveFunction = R"JS(
const d = window.__axioDrag;
if (!d) return 'none';
const s = getSelection();
if (!d.ours && !s.isCollapsed) { window.__axioDrag = null; return 'engine'; }
const r = document.caretRangeFromPoint(x, y);
if (!r) return 'none';
s.setBaseAndExtent(d.node, d.offset, r.startContainer, r.startOffset);
d.ours = true; d.focusNode = r.startContainer; d.focusOffset = r.startOffset;
return 'emulated';
)JS";
constexpr const char* CursorFunction = R"JS(
const e = document.elementFromPoint(x, y);
if (!e) return 'default';
const value = getComputedStyle(e).cursor || 'auto';
const keyword = value.split(',').pop().trim();
if (keyword !== 'auto') return keyword;
if (e.closest('a[href],area[href]')) return 'pointer';
const textual = ['', 'text', 'search', 'url', 'tel', 'email', 'password', 'number', 'date', 'time'];
if (e.isContentEditable || e.tagName === 'TEXTAREA' || (e.tagName === 'INPUT' && textual.includes(e.getAttribute('type') || ''))) return 'text';
const r = document.caretRangeFromPoint(x, y);
if (r && r.startContainer.nodeType === 3) {
  const range = document.createRange(); range.selectNodeContents(r.startContainer);
  for (const b of range.getClientRects()) if (x >= b.left && x <= b.right && y >= b.top && y <= b.bottom) return 'text';
}
return 'default';
)JS";
constexpr const char* FaviconFunction = R"JS(
const link = document.querySelector('link[rel~="icon" i]');
const href = link ? link.href : location.origin + '/favicon.ico';
return await new Promise(resolve => {
  const image = new Image(), done = value => resolve(value);
  setTimeout(() => done(''), 3000);
  image.onload = () => {
    try { const c = document.createElement('canvas'); c.width = c.height = 32;
      c.getContext('2d').drawImage(image, 0, 0, 32, 32); done(c.toDataURL('image/png')); } catch { done(''); }
  };
  image.onerror = () => done('');
  image.src = href;
});
)JS";
constexpr const char* FocusAtFunction = R"JS(
const e = document.elementFromPoint(x, y);
const editable = e && (e.isContentEditable || e.tagName === 'TEXTAREA' || e.tagName === 'INPUT');
if (editable && document.activeElement !== e) e.focus();
return editable ? 'editable' : 'none';
)JS";
// WPE 2.48 shows no context menu for libwpe pointer input (no `context-menu` signal). This
// isolated-world listener notes the page's own (trusted) contextmenu event and whether the
// page cancelled it; ContextMenuFunction then runs the DOM event itself if WebKit did not,
// honours preventDefault, and reports what is under the pointer for Zen's menu.
constexpr const char* ContextWatchScript =
  "addEventListener('contextmenu', e => { if (!e.isTrusted) return; const t = performance.now();"
  " setTimeout(() => { window.__axioContextMenu = {t, prevented: e.defaultPrevented}; }, 0); }, true);";
constexpr const char* ContextMenuFunction = R"JS(
const seen = window.__axioContextMenu;
const e = document.elementFromPoint(x, y) || document.documentElement;
let prevented;
if (seen && performance.now() - seen.t < 1500) prevented = seen.prevented;
else prevented = !e.dispatchEvent(new MouseEvent('contextmenu', {bubbles: true, cancelable: true, composed: true,
  clientX: x, clientY: y, button: 2, buttons: 2, view: window}));
window.__axioContextMenu = null;
if (prevented) return JSON.stringify({prevented: true});
const link = e.closest('a[href],area[href]'), image = e.closest('img');
const a = document.activeElement;
let text = '', editable = !!(e.isContentEditable || e.closest('textarea,input'));
if (a && (a.tagName === 'TEXTAREA' || a.tagName === 'INPUT')) {
  if (a.type !== 'password') try { text = a.value.slice(a.selectionStart, a.selectionEnd); } catch {}
} else text = String(getSelection());
return JSON.stringify({prevented: false, link: link ? link.href : '', label: link ? link.textContent.trim().slice(0, 128) : '',
  image: image ? (image.currentSrc || image.src) : '', editable, text});
)JS";
const std::set<std::string>& cssCursors() {
  static const std::set<std::string> cursors{"default", "none", "context-menu", "help", "pointer", "progress", "wait", "cell",
    "crosshair", "text", "vertical-text", "alias", "copy", "move", "no-drop", "not-allowed", "grab", "grabbing", "e-resize",
    "n-resize", "ne-resize", "nw-resize", "s-resize", "se-resize", "sw-resize", "w-resize", "ew-resize", "ns-resize",
    "nesw-resize", "nwse-resize", "col-resize", "row-resize", "all-scroll", "zoom-in", "zoom-out"};
  return cursors;
}
bool webLink(const std::string& url) { return url.size() <= 2048 && (url.rfind("http://", 0) == 0 || url.rfind("https://", 0) == 0); }
bool resourceLink(const std::string& url) { return webLink(url) || ((url.rfind("data:", 0) == 0 || url.rfind("blob:", 0) == 0) && url.size() <= 2048); }

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
    // §8.2: WebKit's own pasteboard is private to this host; Zen's clipboard gets the text.
    if (host_.browserUI() && (action == "copy" || action == "cut")) {
      clipboardThen(action == "copy" ? WEBKIT_EDITING_COMMAND_COPY : WEBKIT_EDITING_COMMAND_CUT); return true;
    }
    static const std::map<std::string, const char*> commands{
      {"copy", WEBKIT_EDITING_COMMAND_COPY}, {"cut", WEBKIT_EDITING_COMMAND_CUT}, {"paste", WEBKIT_EDITING_COMMAND_PASTE},
      {"select_all", WEBKIT_EDITING_COMMAND_SELECT_ALL}, {"undo", WEBKIT_EDITING_COMMAND_UNDO}, {"redo", WEBKIT_EDITING_COMMAND_REDO}};
    webkit_web_view_execute_editing_command(view_, commands.at(action));
    if (host_.browserUI() && action == "select_all") selectionToPrimary(-1, -1, 0);
    return true;
  }
  void close() override { detach(); host_.viewClosed(&tab_); }
  // §8.2 browser UI.
  void promptReply(const std::string& id, const std::string& method, const Value& command) override;
  void promptDefault(const std::string& id) override;
  bool uiCommand(const std::string& method, const Value& command) override;
  bool scriptDialog(WebKitScriptDialog* dialog);
  void contextMenu(WebKitHitTestResult* hit);
  void contextMenuFallback(double x, double y);
  struct MenuInfo { std::string link, label, image, selection; bool editable = false; };
  void openContextMenu(const MenuInfo& info, double x, double y);
  bool optionMenu(WebKitOptionMenu* menu, WebKitRectangle* rectangle);
  bool permission(WebKitPermissionRequest* request);
  bool fileChooser(WebKitFileChooserRequest* request);
  void optionMenuClosed(WebKitOptionMenu* menu);
  void findResult(guint count, bool found);
  void countedMatches(guint count);
  void imFocus(WebKitInputMethodContext* context, bool focused);
  void imCursor(int x, int y, int width, int height);
  void hovered();
  void dragMove();

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
  struct FenceCall { WpeView* owner; };
  FenceCall* fenceCall_ = nullptr;  // in-flight fence query; detached on commit and close
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
  // §8.2 state. Async script answers reach the view only through `life_` (nulled on detach).
  struct Life { WpeView* view; };
  std::shared_ptr<Life> life_ = std::make_shared<Life>(Life{this});
  struct Native {
    std::string kind;
    WebKitScriptDialog* dialog = nullptr; WebKitOptionMenu* menu = nullptr; gulong menuClose = 0;
    WebKitPermissionRequest* permission = nullptr; WebKitFileChooserRequest* chooser = nullptr; bool multiple = false;
  };
  std::map<std::string, Native> natives_;
  double pointerX_ = 0, pointerY_ = 0, contextX_ = 0, contextY_ = 0;  // CSS px
  bool composing_ = false, cursorQuery_ = false, cursorDirty_ = false, contextSignaled_ = false;
  bool dragArmed_ = false, dragQuery_ = false, dragDirty_ = false;
  std::string lastSelection_;
  std::string findText_; guint findCount_ = 0, findActive_ = 0, findIdentifier_ = 0; bool findCounted_ = false, findFound_ = false;
  bool findPending_ = false, findForward_ = true;
  std::string textMode_ = "none"; int caret_[4] = {0, 0, 0, 0};
  using ScriptDone = std::function<void(WpeView&, const std::string&)>;
  void script(const char* body, GVariant* arguments, ScriptDone done);
  void later(int ms, std::function<void(WpeView&)> run);
  GVariant* point(double x, double y, int count = 0);
  void releaseNative(Native& native);
  void emitTextInput();
  void selectionToPrimary(double x, double y, int count);
  void clipboardThen(const char* command);
  void setPreedit(const std::string& text, guint cursor);
  void finishPreedit();

  void detach();
  void promptDefaultNative(Native& native);
  void scheduleFrameComplete();
  void commit(const std::string& text);
  void typeCodepoint(uint32_t codepoint, uint32_t modifiers);
  void connect();
  void present(const uint8_t* pixels, int width, int height, size_t stride, PixelFormat format);
public:
  void committed() {
    fenced_ = false; heldValid_ = false;
    if (fenceTimer_) { g_source_remove(fenceTimer_); fenceTimer_ = 0; }
    if (fenceCall_) { fenceCall_->owner = nullptr; fenceCall_ = nullptr; }
  }
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
  bool browserUI() override { return true; }

  WpeView* viewFor(WebKitWebView* view) { auto f = views_.find(view); return f == views_.end() ? nullptr : f->second; }
  void track(WebKitWebView* view, WpeView* owner) { if (owner) views_[view] = owner; else views_.erase(view); }
  WebKitWebContext* context() const { return context_; }
  WebKitNetworkSession* session() const { return session_; }
  WebKitSettings* settings() const { return settings_; }
  // One content manager per view, all sharing the origin filter.
  WebKitUserContentManager* newContentManager() const;
  Host& host() { return *host_; }

private:
  Host* host_ = nullptr;
  WebKitWebContext* context_ = nullptr;
  WebKitNetworkSession* session_ = nullptr;
  WebKitSettings* settings_ = nullptr;
  WebKitUserContentFilter* filter_ = nullptr;
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
  if (host_.browserUI()) {
    WebKitUserScript* watch = webkit_user_script_new_for_world(ContextWatchScript, WEBKIT_USER_CONTENT_INJECT_TOP_FRAME,
                                                               WEBKIT_USER_SCRIPT_INJECT_AT_DOCUMENT_START, UiWorld, nullptr, nullptr);
    webkit_user_content_manager_add_script(content_, watch);
    webkit_user_script_unref(watch);
  }
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
  im_->owner = this;
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
  if (fenceCall_) { fenceCall_->owner = nullptr; fenceCall_ = nullptr; }
  life_->view = nullptr;
  for (auto& item : natives_) { Native& native = item.second; promptDefaultNative(native); }
  natives_.clear();
  if (im_) im_->owner = nullptr;
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
  AXIO_TRACE("fence answer %s", href.c_str());
  const char* uri = view_ ? webkit_web_view_get_uri(view_) : nullptr;
  // Only the committed document opens its own fence.
  if (uri && href == uri) openFence("document");
  else AXIO_TRACE("fence ignored %s", href.c_str());
}

void WpeView::finished() {
  if (host_.browserUI() && view_) script(FaviconFunction, nullptr, [](WpeView& view, const std::string& icon) {
    // cef-v1 favicon rule: a 32 px PNG data URL of at most 5400 bytes, else "".
    bool png = icon.rfind("data:image/png;base64,", 0) == 0 && icon.size() <= 22 + 7200;
    view.host_.uiEvent(&view.tab_, "favicon", Object{{"icon", png ? icon : std::string()}});
  });
  if (fenced_ || fenceTimer_ || !view_) return;
  fenceCall_ = new FenceCall{this};
  webkit_web_view_call_async_javascript_function(view_, FenceFunction, -1, nullptr, FenceWorld, nullptr, nullptr,
                                                 [](GObject* source, GAsyncResult* result, gpointer data) {
    auto* call = static_cast<FenceCall*>(data);
    GError* error = nullptr;
    JSCValue* value = webkit_web_view_call_async_javascript_function_finish(WEBKIT_WEB_VIEW(source), result, &error);
    if (error) { AXIO_TRACE("fence query failed: %s", error->message); g_error_free(error); }
    if (WpeView* view = call->owner) {
      view->fenceCall_ = nullptr;
      char* href = value && jsc_value_is_string(value) ? jsc_value_to_string(value) : nullptr;
      if (href) view->fenceMessage(href);
      g_free(href);
    }
    if (value) g_object_unref(value);
    delete call;
  }, fenceCall_);
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
  if (im_ && im_->focused) {
    g_signal_emit_by_name(im_, "committed", text.c_str());
    if (composing_) finishPreedit();  // GTK input-method order: commit, empty preedit, preedit end
    return;
  }
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
  if (host_.browserUI() && !event.pressed && (key.modifiers & FlagShift)) selectionToPrimary(-1, -1, 0);
}

void WpeView::mouse(const MouseInput& mouse) {
  // libwpe buttons follow evdev order: 1 left, 2 right, 3 middle.
  uint32_t button = mouse.button == "left" ? 1 : mouse.button == "right" ? 2 : 3;
  uint32_t mask = button == 1 ? wpe_input_pointer_modifier_button1 : button == 2 ? wpe_input_pointer_modifier_button2 : wpe_input_pointer_modifier_button3;
  struct wpe_input_pointer_event event {};
  // cef-v1 coordinates are CSS (view) pixels; WebKit divides libwpe's by the device scale.
  event.time = nowMs(); event.x = int(std::lround(mouse.x * scale_)); event.y = int(std::lround(mouse.y * scale_));
  pointerX_ = mouse.x; pointerY_ = mouse.y;
  if (mouse.type == "down" && button == 2) { contextX_ = mouse.x; contextY_ = mouse.y; contextSignaled_ = false; }
  if (mouse.type == "move") {
    // Buttons held per cef-v1 flags or by an earlier `down` make this a drag.
    uint32_t held = buttons_;
    if (mouse.modifiers & FlagLeft) held |= wpe_input_pointer_modifier_button1;
    if (mouse.modifiers & FlagRight) held |= wpe_input_pointer_modifier_button2;
    if (mouse.modifiers & FlagMiddle) held |= wpe_input_pointer_modifier_button3;
    event.type = wpe_input_pointer_event_type_motion;
    event.modifiers = keyboardModifiers(mouse.modifiers) | held;
    // WPE's event factory takes the WebKit button from `button` for motion too: without it a
    // drag is a plain move to WebCore (no text selection by dragging).
    if (held & wpe_input_pointer_modifier_button1) event.button = 1;
    else if (held & wpe_input_pointer_modifier_button2) event.button = 2;
    else if (held & wpe_input_pointer_modifier_button3) event.button = 3;
  } else {
    bool pressed = mouse.type == "down";
    if (pressed) buttons_ |= mask; else buttons_ &= ~mask;
    event.type = wpe_input_pointer_event_type_button; event.button = button; event.state = pressed ? 1 : 0;
    event.modifiers = keyboardModifiers(mouse.modifiers) | buttons_;
  }
  wpe_view_backend_dispatch_pointer_event(backend_, &event);
  // WebKit reports a new hit test only when its context changes; the CSS cursor can change on any move.
  if (host_.browserUI() && mouse.type == "move") {
    hovered();
    if (dragArmed_ && (buttons_ & wpe_input_pointer_modifier_button1)) dragMove();
  }
  if (host_.browserUI() && button == 1 && mouse.type == "down" && mouse.clickCount == 1) {
    dragArmed_ = true;
    script(DragStartFunction, point(mouse.x, mouse.y), [](WpeView&, const std::string& answer) { AXIO_TRACE("drag %s", answer.c_str()); });
  }
  if (button == 1 && mouse.type == "up") dragArmed_ = false;
  // A finished left click or drag may have selected text: X11 PRIMARY (§8.2).
  if (host_.browserUI() && mouse.type == "up" && button == 1) selectionToPrimary(mouse.x, mouse.y, mouse.clickCount);
  // A right press opens the context menu (the engine's own signal if it fires, else the fallback).
  if (host_.browserUI() && mouse.type == "down" && button == 2) {
    double x = mouse.x, y = mouse.y;
    later(80, [x, y](WpeView& view) { if (!view.contextSignaled_) view.contextMenuFallback(x, y); });
  }
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
    if (event == WEBKIT_LOAD_STARTED) { view->loadFailed_ = false; view->tlsFailed_ = false; view->host_.navigationStarting(&view->tab_); }
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
    if (self(d)->host_.browserUI()) return self(d)->permission(request);
    webkit_permission_request_deny(request);
    self(d)->host_.denied(&self(d)->tab_, "permission_denied");
    return TRUE;
  }), this);
  g_signal_connect(view_, "script-dialog", G_CALLBACK(+[](WebKitWebView*, WebKitScriptDialog* dialog, gpointer d) -> gboolean {
    if (self(d)->host_.browserUI()) return self(d)->scriptDialog(dialog);
    self(d)->host_.denied(&self(d)->tab_, "javascript_dialog_unavailable");
    return TRUE;  // closed with its safe default (cancel / false / empty)
  }), this);
  g_signal_connect(view_, "run-file-chooser", G_CALLBACK(+[](WebKitWebView*, WebKitFileChooserRequest* request, gpointer d) -> gboolean {
    if (self(d)->host_.browserUI()) return self(d)->fileChooser(request);
    webkit_file_chooser_request_cancel(request);
    self(d)->host_.denied(&self(d)->tab_, "file_dialog_unavailable");
    return TRUE;
  }), this);
  g_signal_connect(view_, "show-option-menu", G_CALLBACK(+[](WebKitWebView*, WebKitOptionMenu* menu, WebKitRectangle* rectangle, gpointer d) -> gboolean {
    return self(d)->host_.browserUI() ? self(d)->optionMenu(menu, rectangle) : FALSE;
  }), this);
  WebKitFindController* finder = webkit_web_view_get_find_controller(view_);
  g_signal_connect(finder, "found-text", G_CALLBACK(+[](WebKitFindController*, guint count, gpointer d) { self(d)->findResult(count, true); }), this);
  g_signal_connect(finder, "failed-to-find-text", G_CALLBACK(+[](WebKitFindController*, gpointer d) { self(d)->findResult(0, false); }), this);
  g_signal_connect(finder, "counted-matches", G_CALLBACK(+[](WebKitFindController*, guint count, gpointer d) { self(d)->countedMatches(count); }), this);
  g_signal_connect(view_, "authenticate", G_CALLBACK(+[](WebKitWebView*, WebKitAuthenticationRequest* request, gpointer d) -> gboolean {
    webkit_authentication_request_cancel(request);
    self(d)->host_.denied(&self(d)->tab_, "http_auth_unavailable");
    return TRUE;
  }), this);
  g_signal_connect(view_, "context-menu", G_CALLBACK(+[](WebKitWebView*, WebKitContextMenu*, WebKitHitTestResult* hit, gpointer d) -> gboolean {
    if (self(d)->host_.browserUI()) self(d)->contextMenu(hit);
    return TRUE;  // WebKit never draws a menu; Zen does (§8.2)
  }), this);
  g_signal_connect(view_, "show-notification", G_CALLBACK(+[](WebKitWebView*, gpointer, gpointer) -> gboolean { return TRUE; }), this);
  g_signal_connect(view_, "enter-fullscreen", G_CALLBACK(+[](WebKitWebView*, gpointer) -> gboolean { return TRUE; }), this);
  g_signal_connect(view_, "mouse-target-changed", G_CALLBACK(+[](WebKitWebView*, WebKitHitTestResult* hit, guint, gpointer d) {
    // §8.2: the element's computed CSS cursor (full keyword set) from the isolated world.
    if (self(d)->host_.browserUI()) { self(d)->hovered(); return; }
    // WPE has no cursor callback: derive the CSS cursor from WebKit's hit test.
    const char* cursor = webkit_hit_test_result_context_is_link(hit) ? "pointer"
                         : webkit_hit_test_result_context_is_editable(hit) ? "text" : "default";
    self(d)->host_.cursorChanged(&self(d)->tab_, cursor);
  }), this);
  g_signal_connect(view_, "web-process-terminated", G_CALLBACK(+[](WebKitWebView*, WebKitWebProcessTerminationReason reason, gpointer d) {
    self(d)->host_.processTerminated(&self(d)->tab_, int(reason));
  }), this);
}


// ---- Browser UI (§8.2) ------------------------------------------------------------------
void imFocusChanged(WpeView* owner, WebKitInputMethodContext* context, bool focused) { owner->imFocus(context, focused); }
void imCursorArea(WpeView* owner, int x, int y, int width, int height) { owner->imCursor(x, y, width, height); }

void WpeView::script(const char* body, GVariant* arguments, ScriptDone done) {
  if (!view_) { if (arguments) g_variant_unref(g_variant_ref_sink(arguments)); return; }
  struct Call { std::shared_ptr<Life> life; ScriptDone done; };
  webkit_web_view_call_async_javascript_function(view_, body, -1, arguments, UiWorld, nullptr, nullptr,
                                                 [](GObject* source, GAsyncResult* result, gpointer data) {
    std::unique_ptr<Call> call(static_cast<Call*>(data));
    GError* error = nullptr;
    JSCValue* value = webkit_web_view_call_async_javascript_function_finish(WEBKIT_WEB_VIEW(source), result, &error);
    std::string text;
    if (error) { AXIO_TRACE("ui script failed: %s", error->message); g_error_free(error); }
    else if (value && jsc_value_is_string(value)) { char* raw = jsc_value_to_string(value); text = raw ? raw : ""; g_free(raw); }
    if (value) g_object_unref(value);
    if (WpeView* view = call->life->view) call->done(*view, text);
  }, new Call{life_, std::move(done)});
}

GVariant* WpeView::point(double x, double y, int count) {
  GVariantBuilder builder;
  g_variant_builder_init(&builder, G_VARIANT_TYPE_VARDICT);
  g_variant_builder_add(&builder, "{sv}", "x", g_variant_new_double(x));
  g_variant_builder_add(&builder, "{sv}", "y", g_variant_new_double(y));
  g_variant_builder_add(&builder, "{sv}", "count", g_variant_new_int32(count));
  return g_variant_builder_end(&builder);
}

void WpeView::selectionToPrimary(double x, double y, int count) {
  auto done = [](WpeView& view, const std::string& answer) {
    auto parsed = json::parse(answer);
    const Value* text = parsed ? parsed->get("text") : nullptr;
    if (parsed && parsed->get("via")) AXIO_TRACE("selection via %s", parsed->get("via")->string.c_str());
    if (!text || !text->isString() || text->string.empty() || text->string == view.lastSelection_) return;
    view.lastSelection_ = text->string;
    view.host_.textEvent(&view.tab_, "text_selection", text->string);
  };
  // Input events queue in WebKit's UI process while script calls do not: ask once the
  // release (and a double click's own selection) has reached the page.
  later(x < 0 ? 30 : 80, [x, y, count, done](WpeView& view) {
    if (x < 0) view.script(SelectionFunction, nullptr, done);
    else view.script(PointerUpFunction, view.point(x, y, count), done);
  });
}

void WpeView::later(int ms, std::function<void(WpeView&)> run) {
  struct Later { std::shared_ptr<Life> life; std::function<void(WpeView&)> run; };
  g_timeout_add(guint(ms), [](gpointer data) -> gboolean {
    std::unique_ptr<Later> pending(static_cast<Later*>(data));
    if (WpeView* view = pending->life->view) pending->run(*view);
    return G_SOURCE_REMOVE;
  }, new Later{life_, std::move(run)});
}

void WpeView::clipboardThen(const char* command) {
  std::string action = command;
  script(SelectionFunction, nullptr, [action](WpeView& view, const std::string& answer) {
    auto parsed = json::parse(answer);
    const Value* text = parsed ? parsed->get("text") : nullptr;
    if (text && text->isString() && !text->string.empty()) view.host_.textEvent(&view.tab_, "clipboard_text", text->string);
    if (view.view_) webkit_web_view_execute_editing_command(view.view_, action.c_str());
  });
}

void WpeView::hovered() {
  if (cursorQuery_) { cursorDirty_ = true; return; }
  cursorQuery_ = true; cursorDirty_ = false;
  script(CursorFunction, point(pointerX_, pointerY_), [](WpeView& view, const std::string& cursor) {
    view.cursorQuery_ = false;
    view.host_.cursorChanged(&view.tab_, cssCursors().count(cursor) ? cursor : "default");
    if (view.cursorDirty_) view.hovered();
  });
}

void WpeView::dragMove() {
  if (dragQuery_) { dragDirty_ = true; return; }
  dragQuery_ = true; dragDirty_ = false;
  script(DragMoveFunction, point(pointerX_, pointerY_), [](WpeView& view, const std::string&) {
    view.dragQuery_ = false;
    if (view.dragDirty_ && view.dragArmed_) view.dragMove();
  });
}

void WpeView::imFocus(WebKitInputMethodContext* context, bool focused) {
  if (!host_.browserUI()) return;
  if (!focused && composing_) finishPreedit();
  textMode_ = !focused ? "none" : webkit_input_method_context_get_input_purpose(context) == WEBKIT_INPUT_PURPOSE_PASSWORD ? "password" : "text";
  emitTextInput();
}
void WpeView::imCursor(int x, int y, int width, int height) {
  int next[4] = {std::max(0, x), std::max(0, y), std::max(0, width), std::max(1, height)};
  if (!memcmp(next, caret_, sizeof next)) return;
  memcpy(caret_, next, sizeof next);
  if (textMode_ != "none") emitTextInput();
}
void WpeView::emitTextInput() {
  host_.uiEvent(&tab_, "text_input", Object{{"mode", textMode_}, {"caret_x", caret_[0]}, {"caret_y", caret_[1]},
                                             {"caret_width", caret_[2]}, {"caret_height", caret_[3]}});
}
void WpeView::setPreedit(const std::string& text, guint cursor) {
  if (!im_) return;
  if (!composing_) { composing_ = true; g_signal_emit_by_name(im_, "preedit-started"); }
  *im_->preedit = text; im_->cursor = cursor;
  g_signal_emit_by_name(im_, "preedit-changed");
}
void WpeView::finishPreedit() {
  if (!im_ || !composing_) return;
  composing_ = false;
  im_->preedit->clear(); im_->cursor = 0;
  g_signal_emit_by_name(im_, "preedit-changed");
  g_signal_emit_by_name(im_, "preedit-finished");
}

bool WpeView::uiCommand(const std::string& method, const Value& c) {
  if (!view_) return false;
  if (method == "find") {
    const std::string& text = c.get("text")->string;
    bool forward = c.get("forward")->boolean, matchCase = c.get("match_case")->boolean;
    guint32 options = WEBKIT_FIND_OPTIONS_WRAP_AROUND | (matchCase ? 0 : WEBKIT_FIND_OPTIONS_CASE_INSENSITIVE)
                      | (forward ? 0 : WEBKIT_FIND_OPTIONS_BACKWARDS);
    WebKitFindController* finder = webkit_web_view_get_find_controller(view_);
    findForward_ = forward; findPending_ = true; findFound_ = false;
    ++findIdentifier_;
    if (c.get("find_next")->boolean && text == findText_ && findCounted_) {
      findFound_ = false;
      if (forward) { webkit_find_controller_search_next(finder); if (findCount_) findActive_ = findActive_ % findCount_ + 1; }
      else { webkit_find_controller_search_previous(finder); if (findCount_) findActive_ = findActive_ > 1 ? findActive_ - 1 : findCount_; }
      return true;
    }
    findText_ = text; findCounted_ = false; findCount_ = 0; findActive_ = 0;
    webkit_find_controller_count_matches(finder, text.c_str(), options, 1000);
    webkit_find_controller_search(finder, text.c_str(), options, 1000);
    return true;
  }
  if (method == "stop_finding") {
    webkit_find_controller_search_finish(webkit_web_view_get_find_controller(view_));
    findText_.clear(); findCounted_ = false; findPending_ = false;
    return true;
  }
  if (method == "zoom") {
    // cef-v1 zoom level: factor = 1.2 ^ level; Zen clamps to its own zoom values.
    double factor = std::clamp(std::pow(1.2, c.get("level")->number), 0.25, 5.0);
    webkit_web_view_set_zoom_level(view_, factor);
    return true;
  }
  if (method == "paste_text") {
    std::string text = c.get("text")->string;
    auto insert = [text](WpeView& view, const std::string&) {
      if (view.view_) webkit_web_view_execute_editing_command_with_argument(view.view_, "InsertText", text.c_str());
    };
    if (c.has("x")) { script(FocusAtFunction, point(c.get("x")->number, c.get("y")->number), insert); return true; }
    if (!im_ || !im_->focused) return false;
    insert(*this, "");
    return true;
  }
  if (method == "ime_set_composition") {
    if (!im_ || !im_->focused) return false;
    const std::string& text = c.get("text")->string;
    // selection_end is in UTF-16 units; WebKit's preedit cursor counts characters.
    size_t units = size_t(c.get("selection_end")->number), counted = 0; guint cursor = 0;
    for (uint32_t cp : json::codepoints(text)) { if (counted >= units) break; counted += cp > 0xFFFF ? 2 : 1; ++cursor; }
    if (text.empty()) { finishPreedit(); return true; }
    setPreedit(text, cursor);
    return true;
  }
  if (method == "ime_cancel_composition") { finishPreedit(); return true; }
  if (method == "ime_finish_composing") {
    if (!composing_ || !im_) return true;
    std::string text = *im_->preedit;
    if (text.empty()) finishPreedit(); else commit(text);
    return true;
  }
  return false;
}

void WpeView::findResult(guint count, bool found) {
  if (!findPending_) return;
  findFound_ = true;
  if (!found) { findCount_ = 0; findActive_ = 0; findCounted_ = true; }
  else if (!findActive_) findActive_ = findForward_ ? 1 : std::max<guint>(1, findCount_);
  (void)count;
  if (!findCounted_) return;  // counted-matches gives the total; both arrive for a new search
  findPending_ = false;
  host_.uiEvent(&tab_, "find_result", Object{{"identifier", findIdentifier_}, {"count", findCount_},
                                             {"active", findCount_ ? std::min(findActive_, findCount_) : 0u}, {"final", true}});
}
void WpeView::countedMatches(guint count) {
  findCount_ = count; findCounted_ = true;
  if (!findActive_ && count) findActive_ = findForward_ ? 1 : count;
  if (findPending_ && findFound_) { findFound_ = false; findResult(count, count > 0); }
}

bool WpeView::scriptDialog(WebKitScriptDialog* dialog) {
  WebKitScriptDialogType type = webkit_script_dialog_get_dialog_type(dialog);
  Object details;
  std::string kind = "dialog";
  if (type == WEBKIT_SCRIPT_DIALOG_BEFORE_UNLOAD_CONFIRM) {
    kind = "before_unload";
    details = Object{{"dialog_type", "beforeunload"}, {"is_reload", false}};
  } else {
    const char* names[] = {"alert", "confirm", "prompt"};
    const char* uri = webkit_web_view_get_uri(view_);
    std::string origin = uri && webLink(uri) ? uri : "";
    const char* message = webkit_script_dialog_get_message(dialog);
    const char* fallback = type == WEBKIT_SCRIPT_DIALOG_PROMPT ? webkit_script_dialog_prompt_get_default_text(dialog) : "";
    details = Object{{"dialog_type", names[std::min<int>(int(type), 2)]}, {"origin_url", origin},
                     {"message", json::utf16Prefix(message ? message : "", 3000)},
                     {"default_text", json::utf16Prefix(fallback ? fallback : "", 1024)}};
  }
  std::string id = host_.openPrompt(&tab_, kind, std::move(details), 300000);
  if (id.empty()) return TRUE;  // not shown: WebKit closes it with the safe default
  Native native; native.kind = kind; native.dialog = webkit_script_dialog_ref(dialog);
  natives_[id] = native;
  return TRUE;
}

void WpeView::contextMenu(WebKitHitTestResult* hit) {
  contextSignaled_ = true;
  auto info = std::make_shared<MenuInfo>();
  auto copy = [](const char* value) { return std::string(value ? value : ""); };
  if (webkit_hit_test_result_context_is_link(hit)) { info->link = copy(webkit_hit_test_result_get_link_uri(hit)); info->label = copy(webkit_hit_test_result_get_link_label(hit)); }
  if (webkit_hit_test_result_context_is_image(hit)) info->image = copy(webkit_hit_test_result_get_image_uri(hit));
  info->editable = webkit_hit_test_result_context_is_editable(hit);
  double x = contextX_, y = contextY_;
  script(SelectionFunction, nullptr, [info, x, y](WpeView& view, const std::string& answer) {
    auto parsed = json::parse(answer);
    info->selection = parsed && parsed->get("text") && parsed->get("text")->isString() ? parsed->get("text")->string : "";
    if (parsed && parsed->get("editable") && parsed->get("editable")->isBool() && parsed->get("editable")->boolean) info->editable = true;
    view.openContextMenu(*info, x, y);
  });
}

void WpeView::contextMenuFallback(double x, double y) {
  AXIO_TRACE("context menu fallback at %.0f,%.0f", x, y);
  script(ContextMenuFunction, point(x, y), [x, y](WpeView& view, const std::string& answer) {
    AXIO_TRACE("context menu fallback answer %s", answer.c_str());
    auto parsed = json::parse(answer);
    if (!parsed || !parsed->isObject() || view.contextSignaled_) return;
    const Value* prevented = parsed->get("prevented");
    if (!prevented || !prevented->isBool() || prevented->boolean) return;  // the page handles its own menu
    auto text = [&](const char* key) { const Value* v = parsed->get(key); return v && v->isString() ? v->string : std::string(); };
    MenuInfo info{text("link"), text("label"), text("image"), text("text"), false};
    if (const Value* editable = parsed->get("editable"); editable && editable->isBool()) info.editable = editable->boolean;
    view.openContextMenu(info, x, y);
  });
}

void WpeView::openContextMenu(const MenuInfo& info, double x, double y) {
  const std::string& selection = info.selection;
  bool editable = info.editable;
  bool link = !info.link.empty(), image = !info.image.empty() && resourceLink(info.image);
  int type = 1 | (link ? 4 : 0) | (image ? 8 : 0) | (!selection.empty() ? 16 : 0) | (editable ? 32 : 0);
  int flags = 64 | (!selection.empty() ? 8 : 0);
  if (editable) flags |= 1 | 2 | 16 | (!selection.empty() ? 4 | 32 : 0);
  const char* uri = view_ ? webkit_web_view_get_uri(view_) : nullptr;
  std::string frame = uri && webLink(uri) && strlen(uri) <= 1024 ? uri : "";
  Object details{{"x", int(std::clamp(x, 0.0, 16384.0))}, {"y", int(std::clamp(y, 0.0, 16384.0))}, {"type_flags", type},
    {"link_url", link && webLink(info.link) ? info.link : ""}, {"source_url", image ? info.image : ""}, {"frame_url", frame},
    {"selection_text", json::utf16Prefix(selection, 256)}, {"link_text", json::utf16Prefix(info.label, 128)},
    {"editable", editable}, {"edit_flags", flags}, {"media_type", image ? "image" : "none"}, {"media_flags", 0},
    {"misspelled_word", ""}, {"suggestions", json::Array{}}, {"spellcheck", false}};
  std::string id = host_.openPrompt(&tab_, "context_menu", std::move(details), 120000);
  if (!id.empty()) { Native native; native.kind = "context_menu"; natives_[id] = native; }
}

bool WpeView::optionMenu(WebKitOptionMenu* menu, WebKitRectangle* rectangle) {
  guint count = webkit_option_menu_get_n_items(menu);
  if (count > 512) return FALSE;
  json::Array items;
  for (guint i = 0; i < count; ++i) {
    WebKitOptionMenuItem* item = webkit_option_menu_get_item(menu, i);
    const char* label = webkit_option_menu_item_get_label(item);
    items.push_back(Value(Object{{"label", json::utf16Prefix(label ? label : "", 256)},
      {"group", bool(webkit_option_menu_item_is_group_label(item))}, {"child", bool(webkit_option_menu_item_is_group_child(item))},
      {"enabled", bool(webkit_option_menu_item_is_enabled(item))}, {"selected", bool(webkit_option_menu_item_is_selected(item))}}));
  }
  Object details{{"x", std::max(0, rectangle ? rectangle->x : 0)}, {"y", std::max(0, rectangle ? rectangle->y : 0)},
                 {"width", std::max(0, rectangle ? rectangle->width : 0)}, {"height", std::max(0, rectangle ? rectangle->height : 0)},
                 {"items", Value(std::move(items))}};
  std::string id = host_.openPrompt(&tab_, "option_menu", std::move(details), 120000);
  if (id.empty()) { webkit_option_menu_close(menu); return TRUE; }
  Native native; native.kind = "option_menu"; native.menu = WEBKIT_OPTION_MENU(g_object_ref(menu));
  native.menuClose = g_signal_connect(menu, "close", G_CALLBACK(+[](WebKitOptionMenu* closed, gpointer d) { self(d)->optionMenuClosed(closed); }), this);
  natives_[id] = native;
  return TRUE;
}
void WpeView::optionMenuClosed(WebKitOptionMenu* menu) {
  for (auto it = natives_.begin(); it != natives_.end(); ++it) if (it->second.menu == menu) {
    std::string id = it->first; Native native = it->second; natives_.erase(it);
    releaseNative(native);
    host_.withdrawPrompt(&tab_, id);
    return;
  }
}

bool WpeView::permission(WebKitPermissionRequest* request) {
  std::string name;
  if (WEBKIT_IS_GEOLOCATION_PERMISSION_REQUEST(request)) name = "geolocation";
  else if (WEBKIT_IS_NOTIFICATION_PERMISSION_REQUEST(request)) name = "notifications";
  else if (WEBKIT_IS_WEBSITE_DATA_ACCESS_PERMISSION_REQUEST(request)) name = "storage_access";
  if (name.empty()) {
    webkit_permission_request_deny(request);
    host_.denied(&tab_, WEBKIT_IS_USER_MEDIA_PERMISSION_REQUEST(request) ? "media_capture_unavailable" : "permission_denied");
    return TRUE;
  }
  std::string id = host_.openPrompt(&tab_, "permission", Object{{"origin", host_.fixtureOrigin()}, {"permissions", json::Array{Value(name)}}}, 300000);
  if (id.empty()) { webkit_permission_request_deny(request); return TRUE; }
  Native native; native.kind = "permission"; native.permission = WEBKIT_PERMISSION_REQUEST(g_object_ref(request));
  natives_[id] = native;
  return TRUE;
}

bool WpeView::fileChooser(WebKitFileChooserRequest* request) {
  json::Array filters;
  if (const gchar* const* types = webkit_file_chooser_request_get_mime_types(request))
    for (size_t i = 0; types[i] && filters.size() < 16; ++i)
      if (strlen(types[i]) <= 64 && *types[i])
        filters.push_back(Value(Object{{"filter", std::string(types[i])}, {"extensions", json::Array{}}, {"description", ""}}));
  bool multiple = webkit_file_chooser_request_get_select_multiple(request);
  std::string id = host_.openPrompt(&tab_, "file_dialog", Object{{"mode", multiple ? "open_multiple" : "open"}, {"title", ""},
                                                             {"default_name", ""}, {"filters", Value(std::move(filters))}}, 600000);
  if (id.empty()) { webkit_file_chooser_request_cancel(request); return TRUE; }
  Native native; native.kind = "file_dialog"; native.chooser = WEBKIT_FILE_CHOOSER_REQUEST(g_object_ref(request)); native.multiple = multiple;
  natives_[id] = native;
  return TRUE;
}

void WpeView::releaseNative(Native& native) {
  if (native.menu) { if (native.menuClose) g_signal_handler_disconnect(native.menu, native.menuClose); g_object_unref(native.menu); }
  if (native.dialog) webkit_script_dialog_unref(native.dialog);
  if (native.permission) g_object_unref(native.permission);
  if (native.chooser) g_object_unref(native.chooser);
  native = Native{};
}
void WpeView::promptDefaultNative(Native& native) {
  if (native.dialog) webkit_script_dialog_close(native.dialog);  // cancel / false / null / stay
  if (native.menu) { g_signal_handler_disconnect(native.menu, native.menuClose); native.menuClose = 0; webkit_option_menu_close(native.menu); }
  if (native.permission) webkit_permission_request_deny(native.permission);
  if (native.chooser) webkit_file_chooser_request_cancel(native.chooser);
  releaseNative(native);
}
void WpeView::promptDefault(const std::string& id) {
  auto found = natives_.find(id);
  if (found == natives_.end()) return;
  Native native = found->second; natives_.erase(found);
  promptDefaultNative(native);
}

void WpeView::promptReply(const std::string& id, const std::string& method, const Value& c) {
  auto found = natives_.find(id);
  if (found == natives_.end()) return;
  Native native = found->second; natives_.erase(found);
  if (method == "dialog_reply" && native.dialog) {
    bool accept = c.get("accept")->boolean;
    WebKitScriptDialogType type = webkit_script_dialog_get_dialog_type(native.dialog);
    if (type == WEBKIT_SCRIPT_DIALOG_CONFIRM || type == WEBKIT_SCRIPT_DIALOG_BEFORE_UNLOAD_CONFIRM) webkit_script_dialog_confirm_set_confirmed(native.dialog, accept);
    else if (type == WEBKIT_SCRIPT_DIALOG_PROMPT && accept) webkit_script_dialog_prompt_set_text(native.dialog, c.get("text")->string.c_str());
    webkit_script_dialog_close(native.dialog);
  } else if (method == "option_menu_reply" && native.menu) {
    int index = int(c.get("index")->number);
    g_signal_handler_disconnect(native.menu, native.menuClose); native.menuClose = 0;
    if (index >= 0 && guint(index) < webkit_option_menu_get_n_items(native.menu)) webkit_option_menu_activate_item(native.menu, guint(index));
    else webkit_option_menu_close(native.menu);
  } else if (method == "permission_reply" && native.permission) {
    if (c.get("decision")->string == "allow") webkit_permission_request_allow(native.permission);
    else webkit_permission_request_deny(native.permission);
  } else if (method == "file_dialog_reply" && native.chooser) {
    // Only existing regular files the user picked in Zen's own picker; no "..".
    std::vector<std::string> paths;
    for (auto& path : *c.get("paths")->array) {
      struct stat info {};
      if (path.string.find("/../") != std::string::npos || path.string.find("/./") != std::string::npos
          || stat(path.string.c_str(), &info) != 0 || !S_ISREG(info.st_mode)) { paths.clear(); break; }
      paths.push_back(path.string);
      if (!native.multiple) break;
    }
    if (paths.empty()) webkit_file_chooser_request_cancel(native.chooser);
    else {
      std::vector<const gchar*> raw;
      for (auto& path : paths) raw.push_back(path.c_str());
      raw.push_back(nullptr);
      webkit_file_chooser_request_select_files(native.chooser, raw.data());
    }
  } else if (method == "context_menu_command") {
    const std::string& command = c.get("command")->string;
    static const std::map<std::string, std::string> edits{{"copy", "copy"}, {"cut", "cut"}, {"paste", "paste"},
      {"select_all", "select_all"}, {"undo", "undo"}, {"redo", "redo"}};
    if (edits.count(command)) edit(edits.at(command));
    else if (command == "save_image" || command == "save_link") host_.denied(&tab_, "download_denied");
    else if (command != "dismiss") host_.denied(&tab_, "action_unavailable");
  }
  releaseNative(native);
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
  // WEB_BROWSER keeps the back/forward cache (DOCUMENT_VIEWER disables it, so back re-fetched
  // the page in CI run 39296774826). Caches live in this instance's private profile.
  webkit_web_context_set_cache_model(context_, WEBKIT_CACHE_MODEL_WEB_BROWSER);
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
  return true;
}

WebKitUserContentManager* WpeEngine::newContentManager() const {
  WebKitUserContentManager* content = webkit_user_content_manager_new();
  webkit_user_content_manager_add_filter(content, filter_);
  return content;
}

void WpeEngine::shutdown() {
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
