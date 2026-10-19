# Native-feel findings for follow-up sessions

Observed by the orchestrator in inspected CI screenshots (19 Oct 2026). Each item names
the evidence; later native-feel sessions should verify and fix.

## Chromium tabs (run 39337226571, `docs/evidence/linux/webkit-zen/run-39337226571-e2e/23-three-chromium.png`)
- Font mismatch: the small uppercase fixture heading renders in a serif fallback in Chromium,
  while Gecko/WebKit use the system UI sans font. The CEF host likely lacks the same
  fontconfig/`system-ui` resolution as Gecko (check CEF font settings and the runner's fonts).
- Classic (non-overlay) scrollbar in Chromium tabs; Gecko on GTK uses overlay scrollbars.
- The "Return to Gecko" badge is drawn over the page content next to the URL bar; it should
  live in Zen's toolbar/urlbar area without covering content.

## WebKit tabs (run 39325934205, `roundtrip/03-typed.png`)
- Generic blue-square favicon for WebKit tabs (Chromium tabs show the same).
- Engine indicator next to the URL bar renders as a dashed placeholder box.

## Gecko / app (run 39319467677, `docs/evidence/linux/linux-about-axiosozo.png`)
- Mac-only wording on Linux ("Stored on this Mac only", "A project is a folder on this Mac").
- The window does not fill the 1280×800 Xvfb screen (1152×720).

## Performance (in-Zen bench run 39330954155, docs/PERFORMANCE.md)
- Zen parent process uses 117–151 % CPU while a Chromium/WebKit tab animates, yet presenter
  drawing is only 1.5–2.6 ms/frame: profile the rest of the parent-side path (Subprocess pipe
  reads, buffer copies, ImageData/canvas compositing under software WebRender).
- Engine tab key→paint 28–33 ms vs Gecko 9 ms; Gecko→engine switch 385–479 ms.
