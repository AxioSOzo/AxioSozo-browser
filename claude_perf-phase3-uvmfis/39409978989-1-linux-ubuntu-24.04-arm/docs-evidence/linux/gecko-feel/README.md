# Gecko native feel on Linux: before / after

All from GitHub Actions run **39346931130** (`linux-gecko-feel.yml`, commit
6ea1bde, conclusion success): `before` = app artifact of run 39319467610
(cloud/linux-platform b0baccec, without this workstream), `after` = this
commit's own build in the same run (warm sccache, 1154 s). Real Linux Zen app,
Xvfb 1280×800 (2560×1600 at GDK_SCALE=2), metacity, `XDG_CURRENT_DESKTOP`
as a GNOME/KDE session sets it, WebRender software (llvmpipe). Every `after`
cell passed `scripts/gui_gecko_feel.py --strict`. Full logs, JSON and all
screenshots: `ci-results` branch, `cloud_gecko-linux-feel/39346931130-1-feel-*`.

| Pair | Before | After |
| --- | --- | --- |
| GNOME window (`before-/after-gnome-window.png`) | client-side decorations with no close/minimize/maximize anywhere; "Stored on this Mac only" | Zen's GTK buttons top right; "Stored on this computer only" |
| AI & keys (`*-about-ai.png`) | "this Mac", "macOS Keychain" | "this computer", "system keyring (Secret Service)" |
| After Zen's welcome (`*-after-welcome-1x.png`) | window left at Zen's 1200×757, floating | maximized, as Firefox's first window on a 1280×800 screen |
| Welcome at 2× without an H.264 decoder (`*-welcome-2x.png`) | white title on light grey, unreadable | deep-green backdrop; the video still covers it where it plays |

Also: `after-gtk-dark-about.png` (GTK_THEME=Adwaita:dark → chrome, about:axiosozo
and content dark; worked before too), `after-kde-window.png`
(XDG_CURRENT_DESKTOP=KDE), `AxioSozoDev.desktop` as rendered by
`scripts/linux_desktop.py` for the CI app (desktop-file-validate: pass),
`summary.json` (every cell's checks, scroll/tab/startup numbers).

Measured, not changed: wheel 114 px per notch before and after; smooth scroll
of 6000 px at a steady 60 fps (p95 frame 17.1 ms, 0 frames over 33 ms) before
and after; tab switch medians 54–77 ms and first paint 1.4–8.2 s vary with the
runner (one sample per cell), with no consistent difference between before
and after.
