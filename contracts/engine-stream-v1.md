# Engine stream transport v1 (engine-neutral AXCF)

This contract is the engine-neutral core of the private pipe between a trusted,
privileged Gecko adapter in Zen and an owned out-of-process engine host. Zen/Gecko
stays the application; the host draws nothing on screen and owns no browser UI.
[cef-v1](cef-v1.md) is the **Chromium profile** of this contract; the WebKit host
(`native/webkit-host`) implements the **WebKit fixture profile** defined below.
Frames may alternatively travel over [engine-surface-v1](engine-surface-v1.md)
(macOS Mach/IOSurface); this document covers the pipe and its AXCF frames.

A specification is not runtime evidence. Results are recorded under
`docs/evidence/` with their PASS / EXPERIMENTAL / BLOCKED_ENV / NOT_VERIFIED label.

## 1. Profiles

| Profile | Host | `target.engine` | Status |
| --- | --- | --- | --- |
| `cef-v1` | `native/chromium-host` (CEF 154, macOS arm64) | `chromium` | fixture + web mode; see cef-v1 |
| `webkit-fixture-v1` | `native/webkit-host` (WPE WebKit 2.48.3, Linux; system WKWebView, macOS arm64 §8.3) | `webkit` | fixture mode only; optional browser UI (§8.2, Linux) |

Everything in sections 2–7 is common to all profiles and is normative. A profile may
add methods, events, capabilities and hello keys only as announced capabilities;
it never changes framing, authentication, target binding, generations or credit.

## 2. Process and authentication

- Zen spawns the host with inherited stdin/stdout pipes and drains its stderr. The
  host is owned by Zen: no TCP, WebSocket, debugging port or reconnect.
- The first stdin line is `hello`: exactly `{version:1, method:"hello", token,
  engine_instance, fixture_origin}` plus optional, exact-name profile keys. `token`
  is 64 hex characters (256 bit), delivered only through the pipe (never argv,
  environment, files or logs). `fixture_origin` is exactly `http://127.0.0.1:<port>`
  in fixture mode.
- Before starting the engine the host duplicates both pipe ends to CLOEXEC
  descriptors and points fd 0/1 at `/dev/null`, so engine helper processes can
  neither read the authenticated channel nor corrupt its output.
- Every later command is one UTF-8 JSON line ≤ 16 KiB including `\n`, with envelope
  `{version:1, request_id, token, method, target, ...methodFields}` (`shutdown`
  omits `target`). Keys are exact; optional fields are admitted only by name.
- The token is compared in constant time. A wrong token, unknown version, unknown
  method or key, malformed JSON (including duplicate keys, invalid UTF-8 or lone
  surrogates), an overlong line, a missing hello or a replayed `request_id` is a
  protocol error: the host closes every target and exits with code 64.
- Fixture `request_id`s are identifiers (`[A-Za-z0-9_:/.-]{1,128}`), unique per host,
  at most 100,000 per host. (cef-v1 web mode uses monotonic `cef-<n>` instead.)
- The host exits on stdin EOF or `shutdown`, closing every target and its helpers.

Exit codes: `0` clean (EOF, `shutdown`, or the only fixture target closed); `64`
authentication/framing/protocol error; `70` engine initialization failed or the host
refused an unsafe environment; `75` timeout; `76` bounded-exit watchdog fired or
engine helper processes survived; `77` parent gone (CEF).

## 3. Targets and generations

`create` carries a pending target `{tab_id, engine_instance, identity,
document_generation, navigation_generation, private_mode:false}`; `identity` is the
fixture origin. On creation the host emits `created` with the complete BrowserTarget,
adding `engine` (profile value) and the host-issued decimal `native_target_id`.
Every later command must carry the exact current target; any difference (including
either generation) is answered with the non-fatal `error {request_id,
code:"stale_target"}` and nothing is dispatched. A command for a closing target gets
`error {code:"closed_target"}`. A host serves ≤ 32 targets and rejects a live `tab_id`
with `error {code:"invalid_lifecycle"}`.

Generations are safe JSON integers. Both increment by exactly one, together, when the
host admits a new document: an accepted `navigate`/`back`/`forward`/`reload` (before
the engine is asked) or a page-initiated main-frame navigation the policy allows
(once per policy decision). The host emits `navigation {target}` with the new target
before any event of the new document. Frames and events for an older generation are
never relabelled; the presenter discards them.

## 4. Commands

| Method | Fields | Result |
| --- | --- | --- |
| `create` | `url, width, height, device_scale` | `accepted`, `created`, `completed success` |
| `navigate` | `url` | `accepted`, then `completed` on load end/failure/supersession |
| `back`, `forward`, `reload` | — | as `navigate`; at a history end `completed unsupported history_boundary` |
| `stop` | — | `accepted`, `completed` |
| `resize` | `width, height, device_scale` | 1..4096 logical px, scale 1..4; physical ≤ 4096 px/side and ≤ 32 MiB, else `unsupported surface_limit` |
| `focus` | `focused` | |
| `visibility` | `visible` | hidden targets present no frames |
| `edit` | `action` ∈ copy, cut, paste, select_all, undo, redo | |
| `key` | `type` (down/up/char), `native_key_code`, `windows_key_code`, `modifiers`, `text` (≤ 4 UTF-16) | |
| `mouse` | `type` (move/down/up), `x, y` (logical, ≤ view size), `modifiers`, `button` (left/middle/right), `click_count` 1..3, `mouse_leave` | |
| `wheel` | `x, y, modifiers, delta_x, delta_y` (pixels, ±4096) [+ `phase, momentum_phase, precise` together] | zero deltas are not dispatched |
| `frame_rate` | `frame_rate` 60/120 | |
| `frame_ack` | `frame_id` | no reply; see §6 |
| `close` | — | `accepted`, `closed`, `completed success` |
| `shutdown` | — (no target) | `accepted`; `completed success` just before exit |
| `devtools` | — | always `completed unsupported devtools_not_integrated` |

Navigation replaced by a newer one completes `unsupported NAVIGATION_SUPERSEDED`.
Navigations have no parent-side deadline. Nothing is ever replayed.
`modifiers` uses the cef-v1 EVENTFLAG bits (shift 1<<1, control 1<<2, alt 1<<3, left/middle/right button 1<<4..1<<6, command 1<<7).

## 5. Output framing

Each item starts with 16 big-endian bytes: `AXCF`, version u16 = 1, kind u16
(1 JSON event, 2 BGRA frame), metadata length u32 (1..8192), payload length u32
(0..33554432). Readers validate lengths before allocating. Events have no payload.
Frame metadata is exactly `{version, target, frame_id, width, height, stride,
device_scale, format:"BGRA8"}` (plus `damage` when negotiated, §6.1) with physical
1..4096 px per side, `stride == width*4`, payload `stride*height`. `frame_id` is
strictly increasing per host. Pixels are premultiplied BGRA in memory order.

Common events: `ready`, `created`, `accepted`, `completed {request_id, status,
[reason]}`, `navigation`, `loading {loading, can_go_back, can_go_forward}`, `title
{title ≤ 1024 UTF-16}`, `url {url}` (≤ 4096 bytes, else `""`), `load {http_status,
restored_from_history}`, `cursor {cursor}` (CSS keyword), `closed`, `error {[request_id],
code, [native_code]}` and the host-level `heartbeat {sequence}` (from the engine UI
thread every `capabilities.heartbeat_interval_ms`, never while closing). Every
target event carries `target`.

`load.restored_from_history` may be `true` only for a pending `back`/`forward` whose
committed and finished URL equals a URL this target previously committed with HTTP
200. A fixture load is successful only for HTTP 200 or such a restore.

## 6. Backpressure

At most one frame is outstanding across the host. Each target keeps only its newest
undelivered frame (a newer frame replaces it) and delivery alternates between
targets. Zen acknowledges with `frame_ack {frame_id}` naming the exact target of that
frame, even if stale; this releases transport credit only. An unknown or duplicate
acknowledgement is a protocol error (exit 64). The engine UI thread never writes to
the pipe; an owned writer thread does. Resize, navigation and visibility drop the
pending frame. Event queues are bounded (512) like the input queue (256 lines).

### 6.1 Frame damage (optional)

`hello.frame_damage:true` (capability `frame_damage`) adds `damage: [[x, y, width,
height]]` (one rectangle, physical px) to every frame. Pixels outside it are
byte-identical to the previous frame delivered for the same target and size. A
frame that changes nothing is not sent. The first frame after creation, resize,
navigation or showing a hidden target is full-size. If a pending frame is replaced,
the new frame's damage includes the replaced frame's damage. Without the hello key
frames are byte-identical to cef-v1.

### 6.2 Damage payloads (optional, additive)

`hello.damage_payload:true` (only together with `frame_damage:true`; otherwise the hello is
malformed) makes `ready.capabilities.damage_payload` true. A frame's payload is then exactly
the rows of its damage rectangle, tight: `damage.width*damage.height*4` bytes (metadata keeps
the whole frame's `width`, `height` and `stride`). A whole-frame damage carries the whole frame.
Zen keeps the last whole frame per `native_target_id` and size and patches each payload into
it, presented or not, so §6.1's "previous frame delivered" stays the reference; a partial
payload without a whole frame of that target and size before it is a protocol error. A
replaced pending frame's payload is cut from the replacing frame's pixels with the merged
damage. `capabilities.damage_payload` is false (or absent from older hosts) without the key.
Zen negotiates it on Linux whenever it negotiates frame damage (docs/perf/pixel-path.md),
never on macOS.
Hosts enlarge their stdout pipe to 1 MiB on Linux (`F_SETPIPE_SZ`, best effort).

### 6.3 memfd frames (optional, additive, Linux; Zen's default on Linux)

`hello.frame_transport:"memfd"` asks the host to keep frame pixels out of the pipe. The host
creates one `memfd` (`MFD_CLOEXEC`, sealed `F_SEAL_SHRINK|F_SEAL_GROW|F_SEAL_SEAL`, so helpers
never inherit it and it cannot change size) of `slots × slot_bytes` and answers
`ready.capabilities.frame_transport:"memfd"` with `capabilities.memfd: {fd, slot_bytes, slots}`
(`fd` the host's descriptor number, `slot_bytes ≤ 33554432`, `1 ≤ slots ≤ 4`). Without the key,
or on another platform, `frame_transport` is `"pipe"` (absent from older hosts) and nothing
changes. A host that cannot create the ring rejects the hello.

Every frame is then an AXCF kind-2 item with **payload length 0** whose metadata adds
`slot` (integer < `slots`) and `payload_bytes`: exactly the bytes the pipe would have carried
(the whole frame, or the damage rectangle's rows with §6.2), at offset `slot × slot_bytes`.
Zen reads them with one positioned read of `/proc/<host pid>/fd/<fd>` (the host is Zen's own
direct child; the fd number comes only from its authenticated ready event) before it sends the
frame's `frame_ack`. One frame is in flight (§6), so the host rewrites a slot only after the
frame that used it was acknowledged; slots alternate. Everything else (metadata validation,
target binding, damage, coalescing) is unchanged. Zen negotiates it only with the pref
`axiosozo.engines.linux.memfd_frames` (default `MEMFD_FRAMES_DEFAULT` in
EngineFrameSurface.sys.mjs: true since the soak in docs/perf/pixel-path.md), only after listing the spawned host's `/proc/<pid>/fd` succeeded
(the same ptrace-read access a slot read needs), and never on macOS or in surface mode.

**Fallback.** When Zen cannot read a frame's slot (one retry), it drops that frame (never
presents it, forgets its target's assembled frame) and acknowledges it with
`frame_ack {frame_id, frame_transport:"pipe"}`. The host accepts that key only while memfd
frames are active, switches before the ack releases the credit, and from then on writes every
frame with its payload in the pipe (no `slot`/`payload_bytes`); each target's next frame names
the whole surface (pending damaged frames are made whole or re-sent) and the host repaints
every view so a static page is restored. The ring stays mapped until the host exits. Zen then
asks every later host of the session for the pipe. Any other value, or the key while memfd
frames are not active, is a protocol error.

### 6.4 Surface mode excludes the pipe frame features

§6.1–§6.3 describe AXCF frames. In surface mode ([engine-surface-v1](engine-surface-v1.md),
macOS) frames never use the pipe and carry their own dirty rectangles, so a hello with
`surface_service`/`surface_token` together with `frame_damage:true`, `damage_payload:true`
or any `frame_transport` is malformed (exit 64), and a host without surface support refuses
the surface keys themselves. Zen never builds such a hello (`INVALID_ENGINE_BOOTSTRAP`).
Consequently the §6.3 fallback never applies in surface mode: no memfd frames are active, so
`frame_ack` (with or without `frame_transport:"pipe"`) is itself a protocol error there, since
surface frames are released over Mach. Zen's surface-mode stream never starts a frame worker or
the native Linux receiver, and never asks `/proc` for memfd readability.

## 7. Fixture security policy (all profiles)

Only the hello's loopback origin, only `GET` and only the synthetic paths
(`/engine.html`, `/engine.html?page=2`; subresource `/favicon.ico`) may load. A
command `navigate`/`create` to any other URL is a protocol error; a page-initiated
navigation elsewhere is denied with `error navigation_denied`. Pop-ups, downloads,
permission requests, external schemes, file URLs, file choosers, JavaScript dialogs,
HTTP authentication and notifications are denied with explicit `error` codes. TLS
errors fail closed with no bypass. The engine sandbox stays enabled. Each host uses
fresh per-instance data and cache directories; nothing is shared with Gecko, another
engine or another host. Private mode is unavailable.

## 8. WebKit fixture profile (`webkit-fixture-v1`)

`ready`: `{engine:"webkit", webkit_port:"wpe", webkit, runtime_webkit, libwpe,
wpebackend_fdo, platform:"linux-<machine>", sandbox_configured:true,
sandbox:"bubblewrap", process_model:"multi-process", render_path:"wpe-fdo-shm-bgra",
engine_instance, capabilities}` with capabilities:

`surface:false, external_begin_frame:false, frame_rate, observe, navigate, back,
forward, reload, stop, close, input, edit, visibility, cursor, multi_target:true,
max_targets:32, persistent_profile:false, open_in_tab:false, devtools:false, ime:false,
ime_commit:true, key_verdict:false, wheel_phases:true, pinch:false,
frame_rate_command:true, private_mode:false, fixture_only:true, permissions:false,
downloads:false, popups:false, accessibility:false, file_dialogs:false,
javascript_dialogs:false, heartbeat_interval_ms:1000, context_menu:false,
http_auth:false, find:false, zoom:false, popup_blocked:false, media_capture:false,
favicon:false, text_input:false, frame_damage:<negotiated>`.

Additional method `ime_commit_text {text}` (1..1024 UTF-16, capability `ime_commit`):
commits text through WebKit's input-method context (the path a real IME uses) when an
editable element is focused, else as key presses.

### 8.1 Deltas against cef-v1 the Zen adapter must handle

(Rows describe the Linux WPE host; the macOS WKWebView host differs as listed in §8.3.)

| # | Area | cef-v1 | webkit-fixture-v1 |
| --- | --- | --- | --- |
| 1 | `ready` identity keys | `cef, chromium, runtime_cef, runtime_chromium, platform:"macosarm64", render_path:"native-osr-bgra"` | `engine, webkit_port, webkit, runtime_webkit, libwpe, wpebackend_fdo, platform:"linux-x86_64", sandbox, process_model, render_path:"wpe-fdo-shm-bgra"`; validate against the `webkit` entry of `upstreams.lock.json` |
| 2 | `target.engine` | `chromium` | `webkit`; `native_target_id` is WebKit's page id (decimal) |
| 3 | Browsing modes | fixture and `browsing_mode:"web"` | fixture only; `browsing_mode` in hello → exit 64 |
| 4 | Surface mode | `surface_service`/`surface_token` (Mach) | absent on Linux; those keys → exit 64. macOS: as cef-v1 (§8.3, §6.4) |
| 5 | Key verdicts | `down` completes with `key_consumed`/`key_not_consumed` | `key_verdict:false`: `down` completes `success` without `reason`; Zen must apply its own shortcuts without a verdict |
| 6 | Key codes | `native_key_code` is a macOS virtual key code | on Linux it is passed to WebKit as the XKB hardware keycode (e.g. 9 Escape, 113 Left, 23 Tab); the keysym comes from `text`, else from `windows_key_code`. Verified on WPE 2.48.3: the page sees `Escape`, `ArrowLeft`, `Tab` |
| 7 | Text | `char` sends CEF char events | `char` text goes through WebKit's input-method `committed` path; a `char` equal to the text its preceding `down` already inserted is dropped (no double insertion) |
| 8 | IME | `ime_set_composition`, `ime_commit_text` (+ optional ranges), `ime_finish_composing`, `ime_cancel_composition`, `text_input` events | `ime:false`; only `ime_commit_text {text}` (no optional fields); no `text_input` events |
| 9 | Pinch | `pinch` (synthesized touches) | `pinch:false`; method absent (exit 64 if sent) |
| 10 | Unannounced methods | UI-delegation replies answer `unsupported fixture_only` in fixtures | every method other than §4 and `ime_commit_text` is a protocol error (exit 64) |
| 11 | Cursor | from CEF cursor callback (full CSS set) | derived from WebKit hit tests: `pointer` (link), `text` (editable), `default` |
| 12 | History restore | `load {http_status:0, restored_from_history:true}` | `http_status` is 200 (WebKit reports the cached response) or 0; the same restore rule decides `restored_from_history` |
| 13 | Frame damage | none (surface mode has dirty rects) | optional `hello.frame_damage` adds `damage` (§6.1), computed by the host by diffing against the last delivered frame (WPEBackend-fdo SHM export carries no damage) |
| 14 | Pixel source | CEF `OnPaint` BGRA | WPEBackend-fdo SHM buffer (ARGB8888/XRGB8888 little-endian = BGRA memory order, X forced to 0xFF), copied then released |
| 15 | Accessibility | `accessibility`, `ax_action`, `ax_ack`, `ax_*` events | `accessibility:false`; methods absent |
| 16 | Favicon, find, zoom, downloads, prompts | web mode features | absent (`false`) |
| 17 | Exit codes | 64, 75, 76, 77 | 64, 70 (engine init failed, or `WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS` set), 76 (also: helpers survived); parent death is handled by `PR_SET_PDEATHSIG` |
| 18 | Mouse | `click_count` forwarded | `click_count` validated but WebKit derives clicks itself; `mouse_leave` has no WPE equivalent |
| 19 | Visibility/focus | `was_hidden`, `set_focus` | libwpe activity states `visible`/`focused` |
| 20 | Pointer/wheel coordinates | CSS px | same on the wire (CSS px); the host multiplies by `device_scale` because WebKit's WPE event factory divides libwpe coordinates by it |
| 21 | Wheel | pixel deltas, cef sign | `delta_x/delta_y` CSS px as a smooth 2-D libwpe axis event; verified: `delta_y:-400` at 2x gives one DOM `wheel` with `deltaY:400` and scrolls 400 CSS px |
| 22 | First frame of a document | CEF paints the new document | WebKit re-renders the previous document's frozen layer tree for a few frames after commit. The host holds buffers after every commit until the committed document (asked from an isolated script world) has rendered three animation frames; a 2 s fallback covers pages where that script cannot run. No wire change: Zen simply never receives old-document pixels under a new generation |
| 23 | Back/forward | CEF back/forward cache | WebKit's back/forward cache (cache model `web-browser`, in the private profile): `back` restores without a fetch; `load.http_status` is then 200; WebKit clears `autocomplete=off` fields on restore |

### 8.2 Browser UI (optional, additive; hello `browser_ui`)

`hello.browser_ui:true` makes a WebKit host hand every UI request to Zen. A host whose engine
cannot do this (the macOS WKWebView scaffold) answers `capabilities.browser_ui:false`, and then
everything above is unchanged. Without the key the host behaves exactly as §8 (denials with
`error` codes); its tests are unchanged. With it, `ready.capabilities` reports `browser_ui`,
`javascript_dialogs`, `context_menu`, `option_menu`, `permissions`, `file_dialogs`, `find`,
`zoom`, `favicon`, `clipboard`, `ime` and `text_input` as `true`, plus `cursor_set:"css"`.
`downloads`, `popups`, `http_auth`, `media_capture`, `accessibility` and `devtools` stay `false`,
and fixture mode (§7) is unchanged. The browser-UI methods below exist only when negotiated;
otherwise they are unknown methods (exit 64).

**Prompts** follow cef-v1 "Browser UI delegation" exactly: the same `prompt {prompt_id, kind,
timeout_ms, details}` and `prompt_closed {prompt_id, reason}` events, the same details schemas
and reply commands, single use and bound to the issuing target. A reply to a prompt that is
closed, kind-mismatched or issued for another target gets the non-fatal `error
{code:"stale_prompt"}`. Navigation (before the generations advance), tab close, shutdown and
timeouts answer with the safe default. The limits are 8 open prompts per tab and 64 per host;
a prompt whose event would not fit the metadata bound is declined (`error prompt_too_large`).

| kind | WebKit source | reply | timeout |
| --- | --- | --- | --- |
| `dialog` | `script-dialog` alert/confirm/prompt | `dialog_reply {accept, text}` | 300 s |
| `before_unload` | `script-dialog` BEFORE_UNLOAD_CONFIRM (`is_reload:false`) | `dialog_reply` (accept = leave) | 300 s |
| `context_menu` | `context-menu` signal + hit test + the selection (read in an isolated world) | `context_menu_command` | 120 s |
| `permission` | `permission-request` (geolocation → `geolocation`, notification → `notifications`, website data access → `storage_access`; user media → `error media_capture_unavailable`, others → `permission_denied`) | `permission_reply` | 300 s |
| `file_dialog` | `run-file-chooser` (`open`/`open_multiple`, MIME filters) | `file_dialog_reply {paths}`: existing regular files only, no `..` | 600 s |
| `option_menu` (WebKit only) | `show-option-menu`; details `{x, y, width, height, items[≤512] {label ≤256, group, child, enabled, selected}}` | `option_menu_reply {prompt_id, index}` (−1 = dismissed); WebKit's own close → `prompt_closed withdrawn` | 120 s |

Context-menu `save_link`/`save_image` answer `error download_denied`. `copy_image` and the
other actions with no fixture implementation answer `error action_unavailable`. `paste` is
done by Zen (`paste_text`).

**Commands** (bound to the current target, completed `success` or `unsupported not_available`):
`find {text, forward, match_case, find_next}` (WebKitFindController with wrap-around and
case-insensitive unless `match_case`; results `find_result {identifier, count, active, final}`,
with `active` counted by the host); `stop_finding {clear_selection}`; `zoom {level}`
(cef-v1 level, factor 1.2^level, set as WebKit's page zoom); `paste_text {text ≤4096 [, x, y]}`
(inserts into the focused editable, after focusing the editable at `x, y` if given: Zen's
clipboard and the X11 PRIMARY selection); `ime_set_composition {text ≤1024, selection_start,
selection_end}` (WebKitInputMethodContext preedit, shown underlined by WebKit),
`ime_cancel_composition {}`, `ime_finish_composing {}`, and `ime_commit_text` (§8) also ends a
composition.

**Events**:
- `clipboard_text` after a Zen `edit copy|cut` (WebKit's pasteboard is private to the sandboxed
  host).
- `text_selection` (the page's selection after a left-button release, a shifted key release or
  `select_all`; never for password fields; repeated text is not resent) for X11 PRIMARY.
- Both carry `{text ≤1800 UTF-16, part, parts ≤36}` chunks, reassembled in order by Zen.
- `text_input {mode, caret_x, caret_y, caret_width, caret_height}` (cef-v1 shape) on editable
  focus changes and caret moves.
- `favicon {icon}` after each load: the page's declared icon (else `/favicon.ico`), drawn at
  32 px in an isolated script world, as `data:image/png;base64,…` of at most 5400 bytes, or `""`.
- `cursor` carries the element's computed CSS cursor keyword (`auto` resolved like Gecko: link →
  `pointer`, editable or text → `text`, else `default`).

The host also emulates double/triple-click word/paragraph selection in an isolated world when
WebKit's libwpe input path left the selection collapsed.

### 8.3 macOS WKWebView host (`native/webkit-host/mac`, EXPERIMENTAL)

Same core (`stream_core.hpp`), same methods and fixture policy. `ready`: `{engine:"webkit",
webkit_port:"wkwebview", webkit, runtime_webkit (system WebKit bundle version, shape-checked,
not pinned), platform:"macos-<major>.<minor>-arm64", sandbox_configured:true,
sandbox:"macos-webkit-xpc", process_model:"multi-process", capture:"wkwebview-snapshot",
private_spi:[the two names in WEBKIT_MAC_PRIVATE_SPI], render_path:"wkwebview-snapshot-iosurface"
(surface) | "wkwebview-snapshot-bgra" (pipe fallback), engine_instance, capabilities}`;
capabilities as §8 except `surface`/`external_begin_frame` as negotiated, `cursor:false`,
`wheel_phases:false`, and `damage_payload:false`, `frame_transport:"pipe"` always (§6.4), and `browser_ui:false` (§8.2).
The host accepts the engine-surface-v1 hello keys (`surface_service`, `surface_token`,
optional `surface_begin_frames`, `frame_rate`); `native_target_id` is the decimal view id.
In surface mode a JSON `frame_ack` is a protocol error and the AXCF bound becomes 4096 px/side
without the 32 MiB cap; a fatal Mach error is `error {code:"surface_failed"}` then exit 64.
Without the engine-view component Zen uses the pipe fallback with `frame_damage` only.

## 9. Versioning

This is version 1. A profile change that a v1 reader cannot ignore must be announced
as a capability; a framing change requires AXCF version 2.
