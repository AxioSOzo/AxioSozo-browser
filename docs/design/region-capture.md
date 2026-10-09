# Capture an area for an agent

Status: experimental, branch `ux/overnight-zen-agent`. Unit tested with
synthetic fakes and exercised in a synthetic profile of the custom build
(synthesized mouse input under Marionette). Real trackpad, Ctrl-click and
native-menu behaviour on hardware still need a manual pass. Nothing here is
READY.

## What it does

You see something on a page that your agent should look at: a broken layout,
an error banner, a chart that looks wrong. Hold the right mouse button and
drag over it. Let go, and the area is captured:

1. The area stays highlighted and freezes, so what you see is exactly what
   is copied. The rest of the tab dims.
2. A small bar under the area shows the image size and the project (or the
   site), an optional one-line note, and two buttons:
   - **Copy for agent** (Return): the picture plus a short plain-text note
     with the page title, address, project and your note.
   - **Copy image**: just the picture.
3. A Zen toast confirms the copy. Paste into Claude Code, Codex or any chat.

A plain right-click (no drag) opens the normal context menu, at the same
spot, exactly as before. The menu also has **Capture Area for Agent…**,
which enters a select mode for mouse or trackpad users: drag over an area,
or click once to take the whole visible page. Escape cancels at any point;
clicking outside the bar or switching tabs discards a capture.

No composer is forced on you: the note is optional and focus starts on
**Copy for agent**, so drag, release, Return is the whole gesture.

## Why this shape

- **Role.** AxioSozo is where you work while your agents work. It hands work
  off with context; it does not run the agent. The capture ends in your own
  clipboard after your own click, the same boundary as Send to Agent.
- **Zen.** Nothing is injected into the page. The selection and bar are
  chrome, drawn over the tab's browser stack, styled with Zen tokens (dialog
  background, Zen button tokens, squircle-compensated radii, Zen-like toast)
  in light and dark, with reduced motion and forced colours handled.
- **No surprise.** Right-click keeps working. A page that handles right-click
  itself (it cancels the context menu) keeps its own right-drag: AxioSozo
  only starts a selection when Firefox's own menu was about to open.

## How it works

`apps/browser/chrome/RegionCapture.sys.mjs`, installed per normal window by
`AxioSozoStartup.mjs`, styles in `region-capture.css`.

- On macOS Gecko asks for the context menu on mousedown. While the right
  button is down, the `popupshowing` of `#contentAreaContextMenu` is held
  back (window capture listener) and its `nsContextMenu.contentData` kept.
  A release before the pointer travels 8 CSS px reopens it with
  `openPopupAtScreen` at the original point. A drag past 8 px starts the
  selection; `mousemove` is then not forwarded to the page.
- The image is `WindowGlobalParent.drawSnapshot(rect, dpr × zoom, white,
  { drawView: true })` of the tab's top window global: the visible view at
  device resolution, page zoom divided out, longest side at most 2560 px.
  It is encoded to PNG on a chrome canvas and kept in memory only.
- The clipboard item carries `application/x-moz-nativeimage` (a real PNG on
  macOS, as `BrowserUtils.copyImageToClipboard`) and, for Copy for agent,
  `text/plain`.

## Adding to the bar (extensions)

Lab experiments add to the bar without forking it, through one documented
extension point in `RegionCapture.sys.mjs`:

```js
import { registerCaptureExtension } from "chrome://browser/content/axiosozo/RegionCapture.sys.mjs";

const unregister = registerCaptureExtension(window, {
  id: "capture-ai",            // lowercase words with dashes; the same id again replaces it
  order: 10,                   // lower renders first
  render(bar, capture) {       // once per capture, after the bar is built
    const section = bar.section({ label: "What your assistant noticed" });
    // …
    return () => { /* this capture ended */ };
  },
  dispose() {},                // once, when unregistered
});
```

`capture` is frozen: `png` (the PNG bytes in memory, a `Uint8Array`),
`type`, `width`, `height` (device px), `url`, `title`, `project`
(`{ id, name, root, environment }` or null), `note` (a getter: the field
now), `browser`, `selection` (CSS px of the browser) and `signal` (aborts
when this capture ends or the extension is unregistered).

`bar` is a small API, not the DOM:

| | |
|---|---|
| `section({ label })` | an element between the note and the buttons, in extension order (even when added later) |
| `action({ label, title, primary, onClick })` | a button right of Copy for agent; `primary` makes it the main action |
| `slot()` | an empty inline element there, for a composite control (a split button) |
| `setDefault(onEnter, { button })` → release | the main action: Return in the note runs it, `button` looks primary, Copy for agent becomes a plain button (it still copies) |
| `note`, `setNote(text)`, `focusNote()` | the note field |
| `choose(event, text)` | a proposal became the task: the note is set, then the latest `onChoose` handler runs; when none takes it, focus goes to the main action |
| `onChoose(handler, { verb })` → release, `chooseVerb` | who takes a chosen proposal ("Start", "Open") |
| `holdEscape(fn)` → release | Escape calls `fn` (close a menu) instead of discarding the capture |
| `stillValid()` | the page facts still hold (same address, not private, not sensitive); otherwise the capture ends with the usual refusal |
| `finish()`, `dismiss()`, `reposition()`, `isOpen`, `signal` | |

With nothing registered the bar is exactly as above (a test pins it).
Unregistering removes everything an extension added from an open bar and
gives Return back to Copy for agent. An extension that throws is logged
(`diagnostics().extension_failures`) and left out; the bar and Copy for
agent keep working. Extensions are per window. `region-capture.css` carries
the shared vocabulary they use: `axiosozo-region-section`, `-caption`
(`-caption-path` for a folder shown verbatim), `-status`, `-quiet`,
`-choices`/`-choice` (label, why, and a verb that shows on hover and focus),
`-split`, `-chevron`, `-menu` and `-menu-item` (radio items with a drawn
check).

Users today: the Lab families "What's wrong here?" (`lab/capture-ai/`) and
"Start the task" (`lab/start-task/`), see `docs/lab/experiments/`.

## Privacy and safety

Refused from chrome facts alone, before any capture, with a toast saying why:
private windows, sensitive sites (the shared `isSensitiveHost` list: banking,
health, government sign-ins…), non-web pages, Chromium tabs (not yet).
The facts are checked again after drawing and again at the copy click; a
navigation, tab switch or close in between discards the capture. Nothing is
written to disk, sent to a provider, or offered to the agent bridge. The page
is never asked anything. Password fields render masked in the image, as on
screen.

That is the bar on its own. A Lab experiment that extends it may send the
picture to the user's own AI or agent (through the Lab's `ctx.ai` and
`ctx.agents`, which check private windows, sensitive sites, the project root
and the user's click again); it must say in the bar what goes where while it
is sent, call `stillValid()` first, and stop when the capture's `signal`
aborts.

## Prefs

- `axiosozo.regionCapture.enabled` (default true): the whole feature.
- `axiosozo.regionCapture.rightDrag.enabled` (default true): the right-drag
  gesture. false leaves right-click entirely stock; the menu entry remains.

## Not yet / proposals for the integration lead

- **Contract.** `contracts/workstation-v1.md` §5.1 and
  `contracts/agent-channel-v1.md` §7.2 describe Send to Agent without a
  screenshot. This feature is separate from that path (no handoff JSON, no
  bridge), but the docs should name it once approved: "Capture area for
  agent: user-drawn rect, user click, clipboard only."
- **Chromium tabs.** CEF input is forwarded before chrome can hold it, and
  surface mode has no pixels in JS; this needs a `replayClick` and a readback
  on the engine-view endpoint (CEF workstream).
- **Send to Agent with an image.** Once the handoff contract allows a
  screenshot, the bar can offer "Send to Agent…" that opens the existing
  composer with this image attached.
- **Annotations.** A quick arrow/box on the frozen image before copying.
