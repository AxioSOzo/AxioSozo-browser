Status: PARTIAL

# webkit-feel handoff (20 Oct 2026)

PR: https://github.com/AxioSOzo/AxioSozo-browser/pull/15 (draft, `cloud/webkit-feel` → `cloud/integration`, mirrored to `claude/webkit-feel-ioahtj`).

WebKit tabs inside Zen on Linux now use Zen's own UI: dialogs, menus, the select popup, permission prompts, the file picker, findbar, zoom, notices, the indicator and the tab menu. Input, IME, clipboard and PRIMARY, wheel, cursors, HiDPI and shortcuts feel the same as Gecko's. All of this is verified end to end in the real Linux Zen app.

Why PARTIAL rather than DONE:
- `<datalist>` is NOT_VERIFIED: WPE 2.48 has no embedder hook for it.
- The context-menu and select-popup screenshots capture black under software WebRender, so their contents are asserted from the DOM, not seen in pixels.
- A real system IME daemon (IBus/Fcitx) is NOT_VERIFIED.
- The 2.54.1 upstream runtime does not yet pass the new browser-UI host suite.

Fixture page only and Linux only. Not READY.

## Machine resources

- **Cloud session:** a Linux container with 4 vCPU, 15 GiB RAM and no WPE `-dev` headers. It did unit tests, Python and shell syntax checks, edits and git. Nothing was built or run against WebKit locally.
- **GitHub Actions:** `ubuntu-24.04` runners with 4 vCPU and 16 GiB, using the pinned `debian:13` container (`IMAGE` in the workflows). Real WPE 2.48.3 is Debian's packages. The Zen app is linux-platform's build artifact 39337785340, chosen because it carries the SWGL backdrop-filter fix. Upstream WPE 2.54.1 was a source build: about 100 min warm, about 140 min with a partly warm ccache.
- Evidence lives on the `ci-results` branch at `cloud_webkit-feel/<run>-<attempt>-<job>/`. A curated copy is in `docs/evidence/linux/webkit-feel/` (16 PNGs, `result.json`, README).

## What changed

**Contract.** `contracts/engine-stream-v1.md` §8.2 "Browser UI" is optional and additive, negotiated by the hello key `browser_ui`:
- It adds a `prompt` event and replies. It reuses cef-v1's delegation schema: `prompt-N` ids, `prompt_closed` reasons, `stale_prompt`, at most 8 per tab and 64 per host, safe defaults.
- Prompt kinds: dialog, before_unload, permission, file_dialog, option_menu, context_menu.
- Commands: `find`, `stop_finding`, `zoom`, `paste_text`, and `ime_set_composition` / `ime_cancel_composition` / `ime_finish_composing`.
- Events: `favicon`, `text_input` (caret and mode), and chunked `clipboard_text` / `text_selection`.
- Hosts without `browser_ui` keep the old behaviour.

**WebKit host** (`native/webkit-host/`):
- `stream_core.hpp`: prompt bookkeeping, strict reply validation, navigation-deferred generations (beforeunload runs after the navigation policy, and Stay keeps the document), and prompt expiry.
- `host_wpe.cpp` implements, via WebKit's script-dialog, context-menu, option-menu, permission, file-chooser, find-controller and input-method APIs:
  - Zen-drawn dialogs, context menus (link, image and selection items), the select popup, permissions and the file chooser.
  - Downloads refused, `data:`/`blob:` navigations refused as `download_denied`, media capture refused.
  - Find and zoom, a favicon rendered as a 32 px PNG, the computed CSS cursor on every move, X11 PRIMARY, and IME preedit through a custom `WebKitInputMethodContext`.
- WPE workarounds:
  - no `context-menu` signal for libwpe input, so a fallback runs and the page's own `contextmenu` cancellation is honoured;
  - motion events carry no button, so drag selection is emulated in an isolated script world;
  - double and triple click are emulated where WebKit does not select;
  - an editing command right after a click waits for that click (fixes Ctrl+A racing it).
  - the input-method context is re-attached after a click or view refocus when WebKit left it unfocused (IME after returning to a tab).
- `ui_test.py` with `fixtures/ui.html` is a new real-WPE suite in `probe.py full_test`.
- `upstream/build.sh` registers the upstream prefix with `ldconfig`, so the sandboxed helper processes can load it.

**Zen side** (`apps/browser/chrome/`):
- `WebKitBrowserUI.sys.mjs` (new) wraps `ChromiumBrowserUI` for dialogs, context menu, permissions (fixture mode remembers nothing), file picker, findbar and zoom. It adds the XUL select popup with keyboard navigation, clipboard and PRIMARY, chunked text, and WebKit-specific notices.
- `WebKitPresenter.sys.mjs` (the pixel path is untouched):
  - Zen owns exactly the chords its keysets bind;
  - wheel notches ease like Gecko, precise deltas pass straight through;
  - Ctrl+wheel → FullZoom;
  - IME through a proxy editor;
  - middle-click PRIMARY paste;
  - favicon and title on the tab;
  - a crash notice with "Try again in WebKit";
  - diagnostics (`uiLog`).
- `WebKitEngineAdapter.sys.mjs`: browser-UI profile, validators, `reply()`.
- `WebKitEngineControls.sys.mjs`: the URL-bar "WebKit" indicator (replacing the dashed placeholder), failure reasons, and per-tab availability for the tab menu.
- Shared modules, additive only:
  - `EngineStreamClient`: profile hello, extension events, ordered extension input;
  - `EngineRegistry` / `EngineTabMenu`: an availability delegate and notes ("Experimental · test page only", or the reason it's unavailable).

**Tests and CI:**
- `apps/browser/tests/webkit-feel.test.mjs` (new, 8 tests).
- `scripts/webkit_feel_e2e.py` (new): 21 feel scenarios in the real Zen app. `webkit_zen_container.sh` runs it with `FEEL=1`.
- Workflows: cloud/webkit-feel is added to linux-webkit-host, linux-webkit-zen and linux-webkit-upstream (2.54.1 only on this branch). The temporary `linux-webkit-feel-api.yml` runs a fast compile check of `host_wpe.cpp` against the pinned headers; it can be dropped at integration.

**Docs:**
- ADR 004: upstream build results and the pin recommendation.
- `docs/CAPABILITY_MATRIX.md`: WebKit rows plus a "WebKit native-feel gates" table.

## Commands and run ids

| What | Run | Result |
| --- | --- | --- |
| Zen E2E: roundtrip + feel, final code cd54e4e6 | linux-webkit-zen **39384321863** | PASS: roundtrip/host_failure/three_engines PASS; all 21 feel scenarios PASS; gates PASS except datalist NOT_VERIFIED |
| Host suites, real WPE 2.48.3, incl. `ui_test.py`, cd54e4e6 | linux-webkit-host **39384321774** | PASS (`click_then_select_all` "", `text_input_after_refocus` "text") |
| Host compile check against the pinned headers | linux-webkit-feel-api 39384322060 | PASS |
| Zen E2E, merged head 911eb7ed; source of the curated screenshots | linux-webkit-zen 39376244911, host 39376244778 | PASS (all scenarios) |
| Zen E2E, 529d9d3f | linux-webkit-zen 39381493587 | FAIL: IME gate only (input method not re-announced after returning to a tab). Fixed in cd54e4e6 |
| Unit tests (local, `node --test apps/browser/tests/*.test.mjs`) | this session | 2937 pass, 5 fail. The 5 also fail on cloud/integration: secure-helper detection ×2, fake Node child ×3 |
| Earlier feel runs (history) | 39370679857, 39368134601, 39365113915 | FAIL at beforeunload / crash_retry / ime / shortcuts, each fixed afterwards (see commits) |
| Upstream WPE: first run | linux-webkit-upstream 39296934153 | 2.54.1 and 2.52.6 builds PASS; suites NOT_VERIFIED (setup) |
| Upstream WPE 2.54.1, re-run 1 | 39352196059 | build PASS; real-WPE suites FAIL: helpers could not load libWPEWebKit (fixed by ldconfig) |
| Upstream WPE 2.54.1, re-run 2 | 39370679848 | stream/input/security PASS against 2.54.1; `ui_test.py` FAIL at double-click → `text_selection` |

The final merge of `origin/cloud/integration` (3ac67b69) brings only engine-profile tooling and docs. `apps/`, `native/`, `scripts/`, `tests/`, `contracts/` and the WebKit workflows are identical to cd54e4e6, so runs 39384321863 and 39384321774 cover the shipped code.

## Verified vs NOT_VERIFIED

Verified (PASS in run 39384321863; measurements and inspected screenshots from run 39376244911):
- **Chrome and tabs:**
  - favicon + title;
  - the URL-bar indicator;
  - tab-menu engine labels;
  - crash → Gecko tab preserved + Zen notice → "Try again in WebKit" back to WebKit (`22-crash-notice.png`, `22-retried.png`).
- **Input and editing:**
  - typing;
  - drag, double and triple selection;
  - Ctrl+C/X/V across WebKit, Zen and Gecko;
  - PRIMARY and middle-click;
  - wheel notch (114 px in 9 steps over 139 ms; Gecko 114 px over 221 ms) vs precise (120 px in one event);
  - all CSS cursors;
  - IME preedit (underlined) and commit in an input and in a contenteditable;
  - shortcut ownership;
  - HiDPI 1×/2×.
- **Prompts and browser UI:**
  - the `<select>` popup (pointer, keyboard, Escape);
  - alert/confirm/prompt;
  - beforeunload Stay/Leave in Zen's "Are you sure?" dialog;
  - geolocation doorhanger;
  - GTK file picker;
  - download refused with a notice;
  - find (1→2 of 3);
  - zoom (Ctrl+=/0/−/wheel, 110 % button).
- **Context menu:** link, image and selection items, with Copy to the clipboard.

NOT_VERIFIED:
- `<datalist>` popup: WPE 2.48 has no hook.
- A system IME daemon: composition was driven by Gecko's nsITextInputProcessor on Zen's proxy editor.
- Pixel content of XUL popups: they capture black under SWGL.
- Ctrl+Z after cut, and Gecko middle-click pasting WebKit's PRIMARY: soft sub-checks, not observed.
- Camera/microphone refusal: code path only.
- The 2.54.1 runtime with `ui_test.py`.
- Real macOS E1/E2: no macOS work here; macOS paths are unchanged.

TEST-ONLY switches, which product builds can't enable; the evidence names them:
- Marionette `unhandledPromptBehavior=ignore`;
- `dom.disable_beforeunload=false`, which undoes Marionette's recommended pref;
- no Marionette session while a beforeunload prompt is open, because classic WebDriver auto-accepts it;
- `layout.css.devPixelsPerPx=2` for the HiDPI step;
- the WebKit enable pref in a throwaway profile.

TLS, sandboxes (bubblewrap) and origin isolation are untouched. No live provider calls were made.

## Blockers

- WPE 2.48's libwpe API has no `<datalist>` suggestion hook. It would need a newer WebKit API or the WPE Platform API.
- Moving the pin to 2.54.x first needs the `ui_test.py` double-click → `text_selection` failure diagnosed (run 39370679848, `runs/webkit-wpe-ui-*`), then the Zen E2E on 2.54.x.
- Under Xvfb with SWGL, XUL popups capture black. A GPU or other compositor runner would be needed for pixel evidence of menus.

## Interface and contract notes

- §8.2 is optional and additive: a host announces it only when the hello asks (`browser_ui: true`). `validateWebKitReady` refuses unrequested browser-UI capabilities. Downloads and HTTP auth stay off; a host asking for them is a protocol failure.
- Shared modules changed additively:
  - `EngineStreamClient` profile `hello`, `events`, `validateCommand` and `validateInput`;
  - `EngineRegistry.engineNote()`;
  - the `EngineTabMenu` `availability(tab, id)` delegate.
- Chromium files were not changed. `ChromiumBrowserUI` is reused through an import.
- The pixel path (frame convert, upload and transport) was not changed. Merge conflicts with perf-phase2's native receiver were resolved by keeping both: the memfd/worker transport plus the browser-UI profile in `launchWebKit`, and the union of the presenter imports.
- The host now orders an editing command after a click that came less than 80 ms earlier, and input sent meanwhile waits behind it.

## Next steps

1. Diagnose the 2.54.1 `ui_test.py` double-click step. Then run linux-webkit-zen with the 2.54.x runtime and switch `webkit.version` together with the Zen identity check (ADR 004).
2. `<datalist>`: evaluate the WPE Platform API or a WebKit patch for a suggestion hook.
3. Pixel evidence for popups on a GPU/compositor runner; a real IBus run if an IM daemon can be provisioned in CI.
4. Integration lead: drop or keep `linux-webkit-feel-api.yml`, a fast compile check that is TEMPORARY by its header.
