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

## Privacy and safety

Refused from chrome facts alone, before any capture, with a toast saying why:
private windows, sensitive sites (the shared `isSensitiveHost` list: banking,
health, government sign-ins…), non-web pages, Chromium tabs (not yet).
The facts are checked again after drawing and again at the copy click; a
navigation, tab switch or close in between discards the capture. Nothing is
written to disk, sent to a provider, or offered to the agent bridge. The page
is never asked anything. Password fields render masked in the image, as on
screen.

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
