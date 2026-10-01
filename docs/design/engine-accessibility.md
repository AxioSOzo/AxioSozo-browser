# Accessibility for Chromium tabs (VoiceOver on the engine view)

Status: **EXPERIMENTAL, integrated, not READY.** The §8 hooks are applied; host and
Zen are built; and a real AXUIElement client has exercised the tree in the actual Zen
window. VoiceOver itself (§10) has not been run, so nothing here is E1/E2 evidence.

What was checked (2026-10-01; evidence
[a11y-2026-10-01/result.json](../evidence/a11y-2026-10-01/result.json)):

- Unit and stream tests:
  - `probe.py test-native` passes, including `a11y_core_test`.
  - `stream_test.py` passes with real CEF. Its new accessibility step checks that
    nothing flows before `accessibility {enabled:true}`. After enabling, it sees 26
    nodes in 2 acked batches, `ax_action press` changes the page, and `stale_node` and
    `accessibility_disabled` are refused.
  - `surface_test.py` and `web_stream_test.py` pass.
- Zen:
  - `zen.py setup` builds the patched `mozAccessible.mm` and `engine-view/a11y` with
    `-Werror`.
  - The engine-view xpcshell smoke passes, including the a11y contract, attach, patch,
    clear and detach checks.
- `node --test apps/browser/tests/*.test.mjs` passes, including the new adapter tests.
- Real AX client:
  - `apps/browser/native/engine-view/tests/ax_probe.swift` sets
    `AXEnhancedUserInterface` and walks to the canvas group. The web area appeared
    0.23 s after the first `AXChildren` query.
  - Roles, titles and values match the fixture: headings with levels, nav landmark,
    links with URLs, button, text field, `AXSecureTextField` with an empty value, and a
    list.
  - `AXPress` and setting `AXValue` act on the page. The typed password reached no
    event.
  - Without a client nothing is enabled. After the client leaves, the tab is disabled.
- Fixed during integration:
  - Zen preloads chrome modules per window, so `sharedChromiumAccessibility()` now
    delegates to the shared-global module instance.
  - A request refused while the tab is hidden, or while no client is active, re-arms
    the native one-shot request.

Owner: accessibility. Related documents:

- [ADR 003 §8](../adr/003-native-multi-engine.md) (Q5)
- [engine-view-gecko §10](engine-view-gecko.md) (design-only predecessor; replaced by this)
- [contracts/cef-v1.md](../../contracts/cef-v1.md)

Gecko citations are `path:line` in `/Volumes/AxioSozoBuild/zen/source/engine`
(Firefox 156, commit `f10846e`). CEF citations are at commit `062ebe433bf6`.

## 1. Decision

**Option (a): native NSAccessibility elements, spliced under the engine view's
canvas accessible.** The host streams Chromium's accessibility tree. Chrome JS
validates and models it. A new engine-view component exposes it as
`NSAccessibility` objects. One small hunk in `accessible/mac/mozAccessible.mm`
makes the canvas's Gecko accessible return the component's web-area root as
its child. That hunk also forwards hit tests and the focused element.

Why (a) and not (b), which maps the tree into Gecko's own accessible tree:

| | (a) NSAccessibility splice (chosen) | (b) synthetic `DocAccessibleParent` in Gecko's tree |
| --- | --- | --- |
| Gecko patch | 1 file, 4 hunks, about 45 lines (§8.2). No IPC or lifecycle change. | Large and spread out. `DocAccessibleParent` is an IPDL actor (`accessible/ipc/DocAccessibleParent.h:36`). Every action on a `RemoteAccessible` is an IPC send that needs a live channel: `SendDoActionAsync` (`RemoteAccessible.cpp:2278`), `SendTakeFocus` (`:2421`), `SendScrollToPoint` (`:1736`). `OuterDocAccessible::RemoteChildDoc` finds the child only through a `BrowserParent` (`OuterDocAccessible.cpp:215-222`). You would need a new outer-doc kind, an actor without a channel, action interception, and a Chromium-to-Gecko cache translation (roles, states, `CacheKey` text and line data). |
| Fragility | Hooks touch only the generic `mozAccessible` children, hit-test and focus paths. | It tracks Gecko's private cache keys and IPC shapes, which change between Firefox releases. |
| VoiceOver parity now | Elements, roles and landmarks, names and values, states, focus following, text-field editing echo, actions, live-region announcements. The rotor and quick navigation work through `AXUIElementsForSearchPredicate`. | The same, plus Gecko's text markers (character, word and line navigation across elements), tables and math. This only holds once the text cache is translated completely. |
| Gap left | No AXTextMarker ranges in v1, so VoiceOver reads element by element (§7.4). | None in principle; the cost is the patch. |
| Cross-platform | macOS only. | Would also serve UIA/ATK and the devtools inspector. |

(b) gives the best eventual parity but needs the largest and most fragile Gecko
patch. (a) gives most everyday VoiceOver behaviour with one guarded hunk.
Its main gap, text markers, can be added later inside the same component
without changing the protocol: inline text boxes are already in Chromium's
tree and are only dropped in v1 (§5.2).

Rejected as well:

- **(c) A hidden DOM mirror** (ARIA elements in a content `<browser>` over the
  canvas). VoiceOver focus would move DOM focus into the mirror, which steals
  keyboard focus from the engine. Text would be laid out a second time, so
  bounds would be wrong. Page text would also be copied into a second engine's
  process.
- **(d) `NSAccessibilityRemoteUIElement`** (Chromium's RemoteCocoa, WebKit). In
  OSR TreeOnly mode Chromium creates no `BrowserAccessibilityCocoa` tree, so
  there is nothing to export. This needs a source-built CEF (ADR 003 §8).

## 2. Data flow

```
renderer (sandboxed)  --AX updates-->  CEF browser process (host)
  CefAccessibilityHandler (per-target wrapper, a11y.inc)
  -> axio::ax::Mirror (a11y_core.hpp): flat ids, redaction, caps, coalescing, credits
  -> AXCF JSON events ax_tree_update / ax_location  (<= 8 KiB each, <= 4 unacked per target)
Zen parent process, main thread
  CEFEngineAdapter (validates, hook)  -> CEFPresenter #event (hook)
  -> ChromiumAccessibility.sys.mjs: ChromiumAXTree (staging, GC, flattening, notifications)
  -> nsIAxioEngineAccessibility.applyPatch(JSON)    and   ax_ack {seq} back to the host
  -> AxioEngineAccessibility.mm: element table per canvas
VoiceOver -> ChildView -> mozAccessible (canvas) --hunk--> web-area root -> elements
  element actions -> listener.onAction -> ax_action {node_id, action} -> host -> CEF input
```

## 3. Activation: only while an assistive client needs it

Renderer accessibility is expensive, so it is enabled per tab, and only when
all three of these hold:

1. **A platform client is active.** On macOS this is
   `mozilla::a11y::ShouldA11yBeEnabled()` (`accessible/mac/Platform.mm:37-43`).
   VoiceOver sets `AXEnhancedUserInterface` on `NSApp`
   (`Platform.mm:424-447`); Voice Control and other clients get it on their
   first role query (`Platform.mm:416-422`). The component exposes this as
   `nsIAxioEngineAccessibility.platformClientActive`.
   - The DevTools accessibility inspector starts the a11y service through XPCOM
     and fires `a11y-init-or-shutdown` "1" (`nsAccessibilityService.cpp:1737`),
     but it does not set this flag. It therefore never enables Chromium trees.
2. **The client asked for this canvas.** The first `AXChildren` query on a bound
   canvas (via the `moxUnignoredChildren` hook) dispatches
   `onAccessibilityRequested(targetId)`. Background tabs and other windows are
   never queried, so they never pay the cost.
3. **The tab is visible.** Hiding a tab sends `accessibility {enabled:false}`
   and clears the native table. VoiceOver's next query re-requests the tree,
   and the host then starts with a full reset batch.

Disable paths:

- `a11y-init-or-shutdown` "0" (`nsAccessibilityService.cpp:1816`).
- A 15 s poll that sees `platformClientActive` false; VoiceOver clears the flag
  on quit.
- Tab close (detach), or a host or tab failure.

On the host, `accessibility {enabled}` maps to `set_accessibility_state(ENABLED
or DISABLED)` for that browser only. For windowless browsers this is TreeOnly
(`kAXModeWebContentsOnly`, `cef_browser_capi.h:957-962`). Nothing is enabled
globally, and `--force-renderer-accessibility` is never used.

## 4. Canvas presentation

`ChromiumAccessibility.attach` sets the canvas to `role="group"` and replaces
the old "accessibility not available" label with "Chromium page". `setTitle`
then labels it "<title> (Chromium)". The group's only child is the web-area
root (`AXWebArea`, titled by the page). Until the tree arrives, VoiceOver sees
an empty labelled group. When the root appears or is replaced, the native
component posts `AXLayoutChanged` on the canvas accessible.

## 5. Host side (`native/chromium-host/a11y.inc`, `a11y_core.hpp`, `a11y_forward.inc`)

### 5.1 One handler per target

`CefAccessibilityHandler` callbacks receive no browser
(`cef_accessibility_handler_capi.h`). `get_accessibility_handler` receives none
either (`cef_render_handler_capi.h:72`). The host shares one `cef_client_t` for
every target, so one handler could not tell tabs apart.

`axClientFor(tab)` therefore builds a per-target wrapper. It copies the shared
client and render-handler callbacks (they all ignore `self`) and overrides only
`get_render_handler` and `get_accessibility_handler`. Its three CEF structs
share one reference count, and the last release frees the wrapper on the UI
thread. A tree change is routed only to its own target, which is also
required for split view.

### 5.2 Mirror semantics

These follow `osr_accessibility_util.cc` and Chromium's `AXTree`:

- **Ids.** Each `(ax_tree_id, node id)` becomes a wire id that is never reused
  within a target. Tree UUIDs never leave the host. Out-of-process iframes are
  joined in: a node with `childTreeId` gets the child tree's root appended to
  its `kids`.
- **Updates.**
  - `node_id_to_clear` removes a subtree. Clearing the root clears the whole
    tree.
  - Node data replaces the old data.
  - After each update, nodes no longer reachable from the tree root are
    deleted. This gives deletions and reparenting the `AXTree` way.
- **New documents.** A new main-frame tree (`tree_data` without
  `parent_tree_id`) replaces the old root tree and its child trees. The next
  batch is then `reset:true`. Late updates from a replaced tree are ignored for
  2 s. They are not ignored for longer, because a back/forward-cache restore
  brings the same tree id back.
- **Inline text boxes** are dropped. They are only useful for text markers
  (v1 has none) and they would add roughly 40 % volume.
- **Geometry stays relative:** `b` (bounds), `oc` (effective offset container:
  the offset container, else the tree root, else the iframe host node),
  `scroll`, and `tf` (2D affine part of `gfx::Transform::ToString()`; the exact
  string format is unverified).
  - Scrolling therefore changes one `scroll` record, not every descendant.
  - Resolution is `AXTree::RelativeToTreeBounds` (transform, plus container
    offset, minus container scroll, repeated). It is implemented three times,
    with the same algorithm in host, JS and native. The host uses it only for
    action points.
  - `px` reports whether resolved bounds are physical pixels: it compares the
    root width with view width × scale. This makes the units right whether or
    not the pinned Chromium puts a 1/dsf transform on the root (unverified).
    The E1 plan checks this.
- **Focus** is `tree_data.focus_id` of the tree named by the root tree's
  `focused_tree_id`.

### 5.3 Privacy and caps

- **Password fields.** A field is protected when it has state `protected` or
  `inputType=password`. Its record carries `redacted:true` and has no `value`,
  no `sel` and no `kids`. Its descendants are marked hidden and are never
  serialized. The secret never enters an event: the unit test asserts this
  over every emitted byte. JS redacts again in case a host misbehaves.
- **Everything else** is page content Chromium already exposes to any screen
  reader.
- **Not forwarded:** colours, fonts, image data URLs, DOM node ids and HTML
  attributes.
- **URLs** are http(s) only and are sent whole or not at all.
- **Text is clipped** by its escaped JSON size, never splitting a code point;
  a clipped string ends with "…".

| limit | value |
| --- | --- |
| nodes per target | 25 000 (beyond: `truncated:true`) |
| trees per target | 64 |
| children per node | 20 000 |
| `name` | 16 KiB total (1 KiB in the record, then 2 KiB `append` pieces) |
| `value` | 8 KiB total (same split) |
| description | 512 B |
| URL | 1 KiB |
| tokens (roles, enums) | 32 B, ASCII `[A-Za-z0-9 _-]` |
| renderer events per batch | 32 (allowlisted types) |
| `cef_value_t` nodes converted per callback | 2 000 000 (beyond: the update is dropped and `error {code:"accessibility_update_too_large"}` is sent) |

### 5.4 Coalescing and flow control

The AXCF transport fails the host when 512 events are queued
(`transport.hpp`, `event()`), and the JSON metadata cap is 8 KiB. Two rules
follow from that:

- **Coalescing.** Updates mark nodes dirty. A batch starts at most every
  100 ms; a reset batch starts at once. A batch sends the latest state of every
  dirty node, chunked into events of at most 8 064 bytes. Long `kids`, `name`
  and `value` continue in `append` records.
- **Flow control.** Each event carries a target-local `seq`. At most 4 are
  unacknowledged per target, so 32 targets account for at most 128 queued
  events.
  - Zen sends `ax_ack {seq}` after applying an event, also when its tree is
    off.
  - Like `frame_ack`, the ack names the exact target of the event it answers,
    which may predate a navigation, and only returns credit.
  - An ack for a seq never sent is a protocol error. An ack from before a
    reset is ignored.
- **Geometry-only changes** go out as `ax_location`, only between batches.

### 5.5 Actions, and their limits

The CEF 154 C API has no way to perform an `AXActionData` for an OSR browser.
The handler only receives data, and `cef_browser_host_t` has no accessibility
action entry point. Each action is therefore mapped to the input paths the host
already uses:

| action | mapping | limits |
| --- | --- | --- |
| `press` | Mouse move, then left down and up at the centre of the node's visible rect. Off screen: scroll first, then click 120 ms later if visible. | Trusted input, like a user click. Wrong target if another element covers the centre. |
| `show_menu` | The same with the right button. Chromium then raises the existing `context_menu` prompt, drawn by Zen. | As above. |
| `focus` | Editable nodes only: a click 3 px inside the start of the field. Already focused: success. | Links and buttons cannot be focused without activating them: `unsupported focus_unavailable`. VoiceOver's own cursor still moves; Tab navigation focuses natively. |
| `set_value` | Editables only: focus as above, then `select_all` on the focused frame, then `ime_commit_text(value)` (≤ 4096 UTF-16). | Fires input events as typing would. The value is never logged and its buffer is zeroed. |
| `scroll_to` | Wheel deltas (≤ 8 × 2000 px) over the nearest scrollable ancestor (else the page), placing the node about a third down. | Approximate. CSS scroll-snap and smooth scrolling apply. |
| `increment`, `decrement` | Arrow Up or Down key down and up, only when the node has focus. | Sliders that ignore keys do not move. |

Further rules:

- At most 20 actions per second per target.
- A stale node gets `unsupported stale_node`, and a disabled tree gets
  `accessibility_disabled`.
- **Not used:** DevTools Protocol `DOM.focus` or `DOM.scrollIntoViewIfNeeded`
  via `execute_dev_tools_method`. They would give exact focus and scrolling,
  but they need AX-id to `backendNodeId` mapping, which is unverified. They also
  attach a DevTools agent, and contract `devtools` is `false`. This is recorded
  as a v2 option.

## 6. Protocol additions (proposed section for contracts/cef-v1.md)

The contract is not edited here. Proposed text follows.

> **Accessibility** (`accessibility:true`, plus `ax_actions` listing the
> supported actions; web and fixture sessions alike).
>
> Commands, all bound to the current target unless noted:
>
> - `accessibility {enabled}` maps to `set_accessibility_state` for that
>   browser only, and completes `success`.
> - `ax_action {node_id, action, [value]}`:
>   - `action` is one of `press`, `focus`, `scroll_to`, `set_value`,
>     `show_menu`, `increment` or `decrement`.
>   - `value` (≤ 4096 UTF-16) is required for, and only allowed with,
>     `set_value`.
>   - It completes `success`, or `unsupported` with `stale_node`, `offscreen`,
>     `focus_unavailable`, `focus_required`, `not_editable`,
>     `accessibility_disabled`, `no_focused_frame` or `rate_limited`.
> - `ax_ack {seq}` names the exact target of the event it answers (it may
>   predate a navigation), like `frame_ack`. It gets no `accepted` or
>   `completed`. An unknown `seq` is a protocol error, and a pre-reset `seq` is
>   ignored.
>
> Events, at most 4 unacknowledged per target:
>
> - `ax_tree_update {seq, batch, reset, final, root, focus, px, events, truncated, nodes}`.
>   - Chunks with the same `batch` form one atomic update, applied when
>     `final:true` arrives. `reset:true` replaces the whole tree.
>   - `root` and `focus` are wire ids (0 = none). `px` is 1 or the device scale.
>   - `events` holds at most 32 `{type, id}` from the renderer's allowlist.
>   - `nodes` holds records `{id, role, b:[x,y,w,h], oc, kids, [states],
>     [actions], [scroll], [tf], [name], [value], [desc], [placeholder], [url],
>     [roledesc], [shortcuts], [lang], [level], [checked], [invalid],
>     [restriction], [popup], [setsize], [posinset], [sel], [range], [table],
>     [live], [relevant], [atomic], [busy], [selected], [modal], [current],
>     [input], [action], [tag], [activedesc], [linktarget], [redacted]}`, or
>     continuations `{id, append:"name"|"value", text}` /
>     `{id, append:"kids", kids}` of a record earlier in the same batch.
> - `ax_location {seq, nodes:[{id, b, oc, [tf]}]}`: geometry only, applied
>   immediately.
>
> Further rules:
>
> - Records describe Chromium's tree after host processing (§5.2–5.3 of
>   docs/design/engine-accessibility.md). Password fields carry
>   `redacted:true` and never a value, selection or children.
> - Every key is exact-checked. A malformed accessibility event ends that tab
>   (`INVALID_CEF_ACCESSIBILITY`).
> - The "Web mode remains experimental while accessibility … unavailable"
>   sentence changes to say the accessibility tree is exposed on macOS with the
>   limits in that design doc.

## 7. Zen side

### 7.1 `apps/browser/chrome/ChromiumAccessibility.sys.mjs`

- **Validators:** `validateAXTreeUpdate`, `validateAXLocation` and
  `validateAXCommand`. They are strict: exact keys, role and token regexes,
  allowlisted states and actions, http(s) URLs, numeric and length bounds.
- **`ChromiumAXTree`** stages chunks per `batch`; an unfinished batch is
  dropped when a new one starts. It joins `append` records and commits on
  `final`. On commit it:
  - replaces everything on reset;
  - collects nodes unreachable from the root;
  - redacts protected fields again;
  - caps the node count.
- **Native records.** `ChromiumAXTree` then computes records for every changed
  node and for the nearest exposed ancestor of every structural change.
  Ignored and invisible nodes are flattened into that ancestor, and geometry-only
  records are still sent for containers. Only records that differ from what was
  last sent are emitted.
- **Notifications:**
  - focus;
  - value: value, checked or range;
  - title;
  - selected text: focused node only;
  - expanded;
  - layout;
  - load: `loadComplete`;
  - announce: new or changed text inside a polite or assertive live region, or
    a new `alert`, ≤ 500 characters.
- **`macRole` / `nativeRecord`** map Chromium roles to AX roles and subroles,
  including landmarks, secure and search fields, and switches. They also place
  names into `AXTitle`, `AXDescription` or `AXValue` (static text), and set
  values: heading level, checked 0/1/2, range value, text. They also set
  `AXPress` and the other actions, and the settable flags.
- **`ChromiumAccessibility`** is the process-wide controller
  (`sharedChromiumAccessibility()`; the native listener is a singleton). It
  covers activation (§3), canvas attach and label, patch delivery, acks, and
  action relay. For actions it first focuses Zen's engine view, so key routing
  and Chromium's focused widget agree.
- **`toCanvasRect`.** View points are canvas CSS pixels, because the presenter
  draws the surface at the logical size anchored top-left
  (`CEFPresenter #geometry`). This helper snaps to device pixels and reports
  visibility.

### 7.2 `apps/browser/native/engine-view/a11y/` (own `moz.build`, IDL, `components.conf`)

- **`nsIAxioEngineAccessibility`** (contract
  `@axiosozo.nl/engine-accessibility;1`, main process only, `builtinclass`)
  offers `platformClientActive`, `listener`, `attach(canvas, targetId)`,
  `detach`, `applyPatch(targetId, json)` and `clear`. Listener calls are
  dispatched as runnables and never re-enter JS from an AppKit callback.
- **One `AxioEngineAXTable` per canvas.** It holds `AxioEngineAXElement`
  objects, which use the informal `NSAccessibility` protocol, as Gecko's
  `MOXAccessibleBase` and cefclient's `OsrAXNodeObject` do. Each element
  implements:
  - role, subrole and role description; title, description, value, help and
    placeholder;
  - enabled, focused (only while the canvas or its IME proxy has DOM focus),
    required, invalid, busy, live, expanded, selected, visited, URL, linked
    elements, set size and position, min and max value, and `AXLoaded` (root);
  - text-field ranges: number of characters, selected text and range, visible
    range, insertion line, string, attributed string, line, range and bounds
    for range;
  - `AXUIElementsForSearchPredicate` and its count, used by the VoiceOver rotor
    and quick navigation. Keys: any, heading and levels 1–6, link,
    visited/unvisited link, button, checkbox, radio group, text field, control,
    landmark, article, table, list, graphic, static text, keyboard-focusable,
    live region, same type. Search text and both directions are supported.
  - actions; settable `AXFocused` and `AXValue`; hit testing (deepest element,
    topmost child first); `AXUIElementDestroyed` for removed elements.
  - `hasRepresentedView`, `representedView` and `isAccessibilityElement`,
    because Gecko calls them on child arrays (`MOXAccessibleBase.mm:160-185`).
- **Frames** resolve lazily from the relative geometry, divided by `px`. They
  map through the canvas accessible's own `AXFrame`, so window moves, zoom and
  split view need no updates.
- **Notifications** map to `FocusedUIElementChanged` (only while the content
  is focused), `ValueChanged`, `TitleChanged`, `SelectedTextChanged`,
  `AXExpandedChanged`, `LayoutChanged`, `AXLoadComplete` and
  `AnnouncementRequested` (on the main window, high or medium priority).

### 7.3 Focus following

When DOM focus is on the canvas or on the presenter's aria-hidden IME proxy
editor beside it, the hunk asks the component for `moxFocusedUIElement`. The
component returns the element for the tree's `focus`, or the root.

- Gecko's own focus event for the canvas makes VoiceOver query this.
- Focus moves inside the page post `AXFocusedUIElementChanged` on the element.
- Typing echo comes from `ValueChanged` and `SelectedTextChanged` on the
  focused field, because keys keep flowing through Zen's existing key routing
  to the host.

### 7.4 Known gaps (v1)

- **No AXTextMarker support.**
  - VoiceOver reads element by element.
  - "Read all" walks elements.
  - Character, word and line navigation work inside text fields only.
  - Next step: keep inline text boxes for the focused or visible region, and
    implement `AXTextMarker*` in the component.
- **No table semantics.** No row, column or header attributes: `table` is
  forwarded but not exposed.
- **No math.**
- **Selection.** `AXSelectedTextRange` is only settable through `set_value`.
  The document selection (`sel_anchor` and `sel_focus` in tree data) is not
  exposed.
- **Actions** have the limits in §5.5. Focusing non-editables needs CDP or a
  CEF source change.
- **Pipe fallback.** In BGRA pipe mode (no engine-view component) there is no
  accessibility: `attach()` reports unavailable.

## 8. Integration hooks (for the integration lead, after the native agent finishes)

### 8.1 `native/chromium-host/stream.inc` (all verified together by the scratch syntax check)

1. After `static void streamCommand(const std::string& line);` (forward
   declarations), add:
   `#include "a11y_forward.inc"`
2. After `#include "input.inc"`, add:
   `#include "a11y.inc"`
3. Command table lookup. Replace
   `NSArray* fields=extra[method];if(!fields){failProtocol();return;}`
   with
   `NSArray* fields=extra[method]?:axCommandFields()[method];if(!fields){failProtocol();return;}`
4. Optional fields. After
   `for(NSString* name in optional)if(command[name])[expected addObject:name];`
   add
   `for(NSString* name in axOptionalFields(method))if(command[name])[expected addObject:name];`
5. `ax_ack` before the current-target lookup. Insert
   `if([method isEqual:@"ax_ack"]){if(!axAcknowledge(supplied,command))failProtocol();return;}`
   directly before `auto found=tabsByKey.find(keyOf(supplied[@"tab_id"]));`
   (after the `frame_ack` block).
6. Dispatch. After `if(inputCommand(tab,method,command,requestId))return;` add
   `if(axCommand(tab,method,command,requestId))return;`
7. Per-target client. In the `create` path, replace
   `p_cef_browser_host_create_browser(&wi,client.retain(),&url,…)` with
   `p_cef_browser_host_create_browser(&wi,axClientFor(tab),&url,…)`. In its
   failure branch, prefix `complete(requestId,@"failed");` with
   `axTabClosed(tab);`.
8. Close. In `lifespan.api.on_before_close`, after
   `closePromptsFor(tab,@"closed",false);cancelDownloadsFor(tab);finishKeyWaits(tab);`
   add `axTabClosed(tab);`
9. Ready. In `streamReadyEvent`, replace `@"accessibility":@NO,` with
   `@"accessibility":axCapability(),@"ax_actions":axActionNames(),`

### 8.2 `native/chromium-host/probe.py` and the Gecko patch

- **`probe.py` `fingerprint()`:** add `'a11y.inc'`, `'a11y_forward.inc'` and
  `'a11y_core.hpp'` to the hashed list (line 204).
- **`probe.py` `test-native`:** compile and run
  `native/chromium-host/tests/a11y_core_test.cc` like `crash_guard_test.cc`
  (`-std=c++20 -Wall -Wextra`; no CEF needed).
- **`apps/browser/native/engine-view/moz.build`:** add `DIRS += ["a11y"]`.
  `scripts/zen.py generated_native_moz_build` only generates `DIRS` for
  top-level native directories (`name.count('/') == 1`), so the subdirectory
  needs this line.
- **`patches/zen/firefox-native.json`:** append this record. Its before hash is
  from the clean pinned tree. The patched file passed `-fsyntax-only` with
  `accessible/mac`'s objdir flags.

```json
{
  "path": "accessible/mac/mozAccessible.mm",
  "before_sha256": "139337d8645c8b3bc43fdb76a7acde6563dddc92b7c8af8485d2b88153b6d37a",
  "after_sha256": "03c60b526443d771dd584126e8eefba48fe944908ee4df7e756e41860a0cdff9",
  "replacements": [
    [
      "using namespace mozilla;\nusing namespace mozilla::a11y;\n\n#pragma mark -\n",
      "using namespace mozilla;\nusing namespace mozilla::a11y;\n\n// AxioSozo engine-view: the chrome <canvas> of an out-of-process engine tab may\n// expose foreign NSAccessibility children, owned by the engine-view component\n// (zen/axiosozo-native/engine-view/a11y). Without a provider nothing changes.\nnamespace mozilla::a11y {\nstruct AxioForeignAXProvider {\n  NSArray* (*children)(id aOwner, nsIContent* aContent);\n  id (*hitTest)(id aOwner, nsIContent* aContent, NSPoint aPoint);\n  id (*focused)(id aOwner, mozilla::dom::Document* aDocument);\n};\nstatic const AxioForeignAXProvider* sAxioForeignAX = nullptr;\nvoid SetAxioForeignAXProvider(const AxioForeignAXProvider* aProvider) {\n  MOZ_RELEASE_ASSERT(NS_IsMainThread());\n  sAxioForeignAX = aProvider;\n}\nstatic nsIContent* AxioForeignContent(Accessible* aAcc) {\n  if (!sAxioForeignAX || !aAcc || !aAcc->IsLocal()) {\n    return nullptr;\n  }\n  nsIContent* content = aAcc->AsLocal()->GetContent();\n  return content && content->IsHTMLElement(nsGkAtoms::canvas) ? content\n                                                              : nullptr;\n}\n}  // namespace mozilla::a11y\n\n#pragma mark -\n"
    ],
    [
      "  mozAccessible* focusedChild =\n      GetNativeFromGeckoAccessible(doc->FocusedChild());\n\n  if ([focusedChild isAccessibilityElement]) {\n",
      "  mozAccessible* focusedChild =\n      GetNativeFromGeckoAccessible(doc->FocusedChild());\n\n  if (sAxioForeignAX && doc->IsLocal() && doc->AsLocal()->IsDoc()) {\n    if (id foreign = sAxioForeignAX->focused(\n            focusedChild, doc->AsLocal()->AsDoc()->DocumentNode())) {\n      return foreign;\n    }\n  }\n\n  if ([focusedChild isAccessibilityElement]) {\n"
    ],
    [
      "  if (child) {\n    mozAccessible* nativeChild = GetNativeFromGeckoAccessible(child);\n    return [nativeChild isAccessibilityElement]\n",
      "  if (child) {\n    mozAccessible* nativeChild = GetNativeFromGeckoAccessible(child);\n    if (nsIContent* content = AxioForeignContent(child)) {\n      if (id foreign = sAxioForeignAX->hitTest(nativeChild, content, point)) {\n        return foreign;\n      }\n    }\n    return [nativeChild isAccessibilityElement]\n"
    ],
    [
      "- (NSValue*)moxPosition {\n",
      "// AxioSozo engine-view: foreign children follow Gecko's own (see top of file).\n- (NSArray*)moxUnignoredChildren {\n  NSArray* children = [super moxUnignoredChildren];\n  if (nsIContent* content = AxioForeignContent(mGeckoAccessible)) {\n    if (NSArray* foreign = sAxioForeignAX->children(self, content)) {\n      return [children arrayByAddingObjectsFromArray:foreign];\n    }\n  }\n  return children;\n}\n\n- (NSValue*)moxPosition {\n"
    ]
  ]
}
```

What the hunks change:

- **`moxUnignoredChildren`** is the `AXChildren` getter
  (`MOXAccessibleProtocol.h:80-81`; base implementation
  `MOXAccessibleBase.mm:494-520`).
  - The override appends the foreign root after Gecko's own children, so
    Gecko's filtering never sees foreign objects.
  - Subclasses that override it call `super`
    (`mozTableAccessible.mm:234-240`).
- **`moxHitTest`** (`mozAccessible.mm:231-258`) asks the provider once the
  deepest Gecko child is a canvas.
- **`moxFocusedUIElement`** (`:203-218`) asks the provider with the document,
  and the provider checks DOM focus itself. Without a provider each hunk is one
  null check.
- **Link coupling.** The component calls `SetAxioForeignAXProvider`, so
  building `engine-view/a11y` requires this record.

### 8.3 Chrome JS

**`apps/browser/chrome/CEFEngineAdapter.sys.mjs`:**

- Import `validateAXTreeUpdate`, `validateAXLocation` and `validateAXCommand`
  from `./ChromiumAccessibility.sys.mjs`.
- `EVENT_FIELDS`: add
  `ax_tree_update: ["seq","batch","reset","final","root","focus","px","events","truncated","nodes"]`
  and `ax_location: ["seq","nodes"]`.
- Add both to the `MISSING_CEF_TARGET` list in `#read`.
- Add `"INVALID_CEF_ACCESSIBILITY"` to `READ_FAILURE_CODES`.
- `acceptEvent`: for these two events, require
  `this.#host.capabilities?.accessibility === true`, then validate, throwing
  `targetError("INVALID_CEF_ACCESSIBILITY")` on failure.
- `#acceptReady`: replace `capabilities?.accessibility !== false` with
  `typeof capabilities?.accessibility !== "boolean"`. When it is true, also
  require `Array.isArray(capabilities.ax_actions)`.
- New methods:
  - `accessibility(enabled)`: validate, then return `unsupported` when the
    capability is absent; otherwise `this.#request("accessibility", {enabled})`.
  - `axAction(node_id, action, value)`:
    `this.#request("ax_action", value === undefined ? {node_id, action} : {node_id, action, value})`.
  - `axAck(target, seq)`:
    `this.#host.request("ax_ack", {seq}, target, {acknowledge:true})`.

**`apps/browser/chrome/CEFPresenter.sys.mjs`:**

- Import `sharedChromiumAccessibility` and `surfaceTargetId`.
- After commit, in surface mode only, call
  `record.a11y = sharedChromiumAccessibility()` and
  `record.a11y.attach({ targetId: surfaceTargetId(target), canvas, focusContent: () => this.#focusContent(record), adapter: { accessibility: enabled => record.adapter.accessibility(enabled), axAction: (id, action, value) => record.adapter.axAction(id, action, value), axAck: (eventTarget, seq) => record.adapter.axAck(eventTarget, seq) } })`.
  If it returns false, keep today's label.
- `#event`: first line
  `if (record.a11y?.handleEvent(record.targetId, event)) return;`.
- On `title`, call `record.a11y?.setTitle(record.targetId, event.title)`.
- `#visibility`: call `setVisible(record.targetId, visible)`.
- `#geometry` and `#resize`: call
  `setViewport(record.targetId, { logicalWidth, logicalHeight, cssWidth: canvas.getBoundingClientRect().width, cssHeight: … })`.
- Remove and retry paths: call `detach(record.targetId)`.

**Optional:** `EngineProbeControls.sys.mjs` tooltips still say "native
accessibility" is unavailable (asserted in `engine-probe-controls.test.mjs:62,102`).
Update both together once E1 passes.

### 8.4 Docs

- `contracts/cef-v1.md`: add §6 as an "Accessibility" section.
- `docs/design/engine-view-gecko.md` §10: replace with a pointer here.
- ADR 003 §8: link this as the chosen near-term path.

## 9. Tests

**Present:**

- `apps/browser/tests/chromium-accessibility.test.mjs` (Node, 14 tests). It
  covers schema strictness, batch staging and reset, deletions and
  reparenting, ignored-node flattening, bounds resolution with
  offset/scroll/transform at `px` 2, device-pixel snapping, password
  redaction against a misbehaving host, size caps, continuations,
  notifications including live regions, role and value mapping, command
  validation, and controller activation, acks, hide, shutdown and action relay.
- `native/chromium-host/tests/a11y_core_test.cc` (standalone C++, not built
  yet). It covers:
  - the tree and redaction (the secret never appears in any byte);
  - deletion, reparenting and `node_id_to_clear`;
  - bounds and `px` detection with and without a root transform;
  - chunking: every event ≤ 8 KiB, 2 000 children and a 20 KB name joined back
    together;
  - credits and acks across epochs;
  - `ax_location`;
  - an OOPIF child tree, navigation reset and retired trees;
  - UTF-8 clipping and escaping, the node cap, and hostile roles and URLs.
- **To add at integration:**
  - `cef-adapter` tests for the new events and commands;
  - an xpcshell smoke for `@axiosozo.nl/engine-accessibility;1` (attach,
    applyPatch, clear on a chrome canvas, `platformClientActive` false
    headless);
  - `stream_test.py` coverage of `accessibility` / `ax_ack` framing.

## 10. E1 VoiceOver test plan (real macOS; required before any claim)

Evidence comes from actual runs only and is stored under
`docs/evidence/engine-a11y-<date>/`: VoiceOver caption-panel screenshots,
Accessibility Inspector screenshots, host stderr, and Zen console. Use
synthetic loopback fixtures only, never personal profiles or sites with
credentials.

**Setup:**

- A Zen build with §8 applied; the host rebuilt (`probe.py setup`, Keychain gate
  as in the contract).
- One fixture page served by the probe's loopback server. It contains:
  - h1–h3 headings;
  - main, nav and banner landmarks;
  - a list of 2 000 items;
  - links, a button, a checkbox, a radio group, a `<select>` and a slider;
  - text input, textarea and password fields;
  - an `aria-live="polite"` region updated by a button, and `role=alert`;
  - an out-of-process iframe (cross-origin loopback port) with a button;
  - a long scrolling section;
  - a transformed (`scale(1.5)`) box.

| # | Step | Pass when |
| --- | --- | --- |
| A1 | VoiceOver off. Open the fixture in a Chromium tab. Capture host events. | No `ax_tree_update` and no `accessibility` command (activation gate). |
| A2 | Turn VoiceOver on (Cmd-F5). Focus the tab. | One `accessibility {enabled:true}` for the visible tab only. VO announces "<title> (Chromium), group", then the web area. |
| A3 | VO-A (read all), VO-Right through the page. | All headings, links and text are spoken in document order. The VO cursor rectangle sits on each element: frames align (checks `px` and the root-transform assumption at 1× and 2× displays). |
| A4 | VO-U rotor: headings, links, landmarks, form controls. VO-Cmd-H / Ctrl-Opt-Cmd-L. | Lists are complete, levels are correct, and jumping moves to the element. |
| A5 | Tab through controls. | Each focused control is spoken with role and state. The VO cursor follows keyboard focus. |
| A6 | Type into the text field and the textarea; move by arrows; select with Shift. | Character echo, line and word reading in the field, and selection are spoken. |
| A7 | Type into the password field. Inspect with Accessibility Inspector and grep the captured host events. | Secure text field, value empty in the Inspector, and the typed string appears in no event or log. |
| A8 | VO-Space on link, button, checkbox, radio and select; VO-Shift-M on a link. | Action happens once; the select opens Zen's popup path; the context menu is Zen's own. |
| A9 | Slider: VO-Up/Down after focusing. | The value changes and is spoken. |
| A10 | Live region button and alert. | Polite text is announced after the current speech; the alert interrupts. |
| A11 | iframe button: navigate into it and press. | Reachable in order; frame is correct; the press works. |
| A12 | Scroll the page; VO-Right to an off-screen element; VO-Space on an off-screen link. | The cursor frame tracks after scrolling. The off-screen press scrolls, then clicks. |
| A13 | Mouse over elements with "VoiceOver cursor follows mouse". | The hit-tested element is spoken. |
| A14 | Navigate to a second page; Back. | The tree resets, the new page is read, and the old page is not read again. After Back (bfcache), the page is readable. |
| A15 | Switch tabs; split view with two Chromium tabs. | The hidden tab sends `enabled:false`. Both visible split tabs work independently (per-target handler). |
| A16 | Quit VoiceOver; wait 20 s. | `enabled:false` sent; no further `ax_*` events. |
| A17 | 2 000-item list page: time from VO-A to first speech; host CPU. | Recorded numbers. No host exit, no `transport` queue failure, and `truncated` stays false. |
| A18 | Zen chrome around the tab (URL bar, sidebar, tabs) with VO. | Unchanged Gecko behaviour (no regressions from the hunk). |

E1 passes only when A1–A18 pass on real macOS with evidence. E2 follows the
repository's acceptance definition.
