# Overnight UX pass (branch `ux/overnight-zen-agent`)

A throwaway branch: keep what you like, delete the rest. Nothing here is
READY, nothing was pushed, and no provider was called.

## Try it

The branch is checked out in its own worktree with its own, already built,
app (build root `/Volumes/AxioSozoBuild/ux-overnight`, set in the worktree's
`.local/runtime.json`). Your `dev` checkout and its running app were not
touched.

```sh
cd /Volumes/T9/axiosozo/.local/worktrees/browser-ux-overnight
./dev                 # the built app, development profile of this worktree
./dev setup           # only after editing chrome files (about 70 s)
```

Then:

1. Open a web page (http/https; not the AxioSozo start page or a new tab).
   **Hold the right mouse button and drag** over part of it, or on a
   trackpad hold **Control**, press and drag. Release, press Return, paste
   into Claude Code or Codex. A plain right-click still opens the normal
   menu. Quick check that you are in this build: the page's right-click menu
   has **Capture Area for Agent…** (the other AxioSozo Dev app has the same
   name and icon).
2. Right-click → **Capture Area for Agent…** for the trackpad version
   (drag, or click once for the whole visible page).
3. Add a project (about:axiosozo → Add project…) and look at the sidebar
   rows next to your tabs, the project panel, Remove from space (Undo in
   the toast), Stop all.
4. Tools → **Ask AI…**, and about:axiosozo → AI & keys.

To throw it all away: `git worktree remove` the folder above, delete the
branch, and remove `/Volumes/AxioSozoBuild/ux-overnight`.

## What changed

- **Capture an area for an agent** (new): right-drag or the page menu,
  frozen selection, a small Zen bar with an optional note, Copy for agent
  (PNG + plain note with page, address, project) or Copy image, Zen toast.
  Clipboard only, after your click; refused in private windows, on sensitive
  sites, non-web pages and Chromium tabs. See
  [design/region-capture.md](design/region-capture.md).
- **Zen-native toasts** for actions that used to be silent: Remove from
  space (with Undo), Stop all, failed quick starts, captures.
- **Sidebar**: project rows on the same columns as Zen's tabs (mark, name,
  height), calmer tinted monograms, the row keeps its highlight under ▶,
  panel keeps scroll/focus/log while servers change, readable folder paths,
  round pills and dots under Zen's squircles, one primary button from Zen's
  tokens, Firefox's status colours, forced colours and reduced motion.
- **Address bar pill** describes only its own environment, red only when
  that server crashed, and gives the URL room in the narrow sidebar.
- **about:axiosozo**: stopped servers are a neutral "Not running", not red
  alarms; real space names; editor copy without the removed sidebar row;
  shorter family-filter card; one focus ring per field.
- **Ask AI** looks like Zen's floating address bar and keeps focus inside.
- **Send to Agent**: opt-ins start unticked; a copy that worked says Done
  and leaves by itself.
- **AI & keys window** uses the same tokens as about:axiosozo.

## How it was checked

- Unit tests: 2569 node tests, 2554 pass, 10 skipped; the 5 failures are the
  known environment-only ones (`project-reader.integration`,
  `understand-host-fixture` need the workstation temp folder). `test_bootstrap`
  passes.
- The custom build, rebuilt from this branch, on private synthetic profiles
  with three synthetic projects and a local fixture page, driven by
  Marionette (synthesized mouse and keys), light and dark. Window screenshots
  are in `/Volumes/AxioSozoBuild/ux-overnight/shots/after/`; native popups
  were drawn inline for review because window captures leave them out.
- The capture's clipboard was read back: a 2× PNG of exactly the selection
  and the note text.

## Not verified

- Real hardware input: right-drag with a mouse, Control-drag and two-finger
  trackpad drag. Synthesized right-drag, Control-drag, refusals and the
  plain right-click menu were checked with native macOS context menus on.
- VoiceOver.
- Chromium tabs (capture is refused there for now).

## Open notes for later

- `ProviderStatus.sys.mjs` (providers workstream) says a version mismatch
  twice on the AI & keys cards; one line would do.
- about:axiosozo shows "Local server not checked yet" for a server the
  sidebar already shows as running.
- Contract wording for capture is proposed in the design note, for the
  integration lead.
