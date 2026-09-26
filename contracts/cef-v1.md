# Chromium native transport v1

This contract connects a trusted privileged Gecko adapter to an owned CEF OSR child.
It is never exposed to web content or a provider. This specification alone is not
runtime evidence; dated E0 and manual local-fixture E1/E2 results are recorded under
`docs/evidence/`, with full E1 acceptance still open.

## Process and authentication

The browser launches one native host per Chromium target using inherited stdin/stdout.
The first stdin message has keys `version:1`, `method:hello`, a browser-generated
256-bit hex `token`, an `engine_instance` and `fixture_origin`. An explicit
`browsing_mode:"web"` adds normal HTTP(S) browsing; omission retains the strict
fixture policy. In web mode `fixture_origin` is a stable process/session identity,
not the current website origin. Current page identity shown to the user comes
from the native navigation URL. No provider browser grants use this session label.
The secret is
delivered only through the private pipe, never argv, environment, files or logs.
All subsequent commands echo the token and carry a unique browser-issued `request_id`.
Their envelope is `{version,request_id,token,method,target,...methodFields}`;
`shutdown` omits target. The native host duplicates control pipes to CLOEXEC
descriptors and redirects inherited helper standard streams before CEF starts,
so sandboxed renderers cannot inherit the authenticated parent channel.
Unknown versions/keys, malformed input, missing hello, wrong tokens and overlong
lines close the channel. No TCP, WebSocket, debugging port or automatic reconnect.
The parent owns the child, drains stderr with a limit, and shuts it down on browser
window/target close. The native host exits on stdin EOF and closes its helpers.

## Input

Commands are UTF-8 JSON lines, at most 16 KiB including the newline. Native admission
and execution are distinct events. Commands are deduplicated; a crash or uncertain
outcome is never automatically replayed. Strict fixtures allow at most 100,000
unique requests. Web mode requires monotonically increasing `cef-<integer>` IDs,
from 1 through JavaScript's maximum safe integer; this rejects replay in constant
memory without expiring animated pages after an hour of frame acknowledgements.

`create` receives a pending browser-owned target: logical `tab_id`, `engine_instance`,
`identity`, `document_generation`, `navigation_generation` and `private_mode:false`.
CEF emits its actual `native_target_id` when the browser is created. Subsequent
commands bind the complete BrowserTarget from `ipc-v1.schema.json`, including
`engine:chromium`, and reject any stale field before native dispatch.

Commands: `create`, `navigate`, `back`, `forward`, `reload`, `resize`, `focus`, `key`,
`mouse`, `wheel`, `frame_ack`, `visibility`, `edit`, `close`, `shutdown`. The adapter declares capabilities
and returns `unsupported` for unavailable operations; `devtools` must not silently
succeed. Input coordinates use logical content points plus an explicit device scale.
Keyboard fields are `type:down|up|char`, `native_key_code`, `windows_key_code`,
`modifiers`, and `text`. Mouse fields are `type`, `x`, `y`, `modifiers`, `button`,
`click_count`, and `mouse_leave`. IME remains unsupported until the native
composition path is tested.

`visibility` carries `visible:boolean` and maps to native `was_hidden`. Hidden
tabs/windows stop presenting frames. `edit` accepts only `copy`, `cut`, `paste`,
`select_all`, `undo`, or `redo`, dispatched to the actual focused CEF frame from
trusted user keyboard actions. These commands retain full target validation.

The first integrated experiment allows only the explicitly passed loopback fixture
origin and GET navigations. Deny popups, external schemes, unapproved origins, file
URLs, downloads and permissions. Preserve certificate validation and CEF sandbox.
Private Chromium mode is unavailable until isolation is proven. These restrictions
must be visible in the development UI, not mistaken for general browsing support.

Web mode permits normal HTTP(S) URLs and subresources, plus an empty `about:blank`
start. Forms submitted inside Chromium remain Chromium operations. Switching
from Gecko never transfers cookies or silently resubmits a form: unsafe or
unverifiable navigation state starts Chromium blank and preserves the Gecko tab.
Certificate validation remains native and has no bypass command. Unsupported
permissions, downloads, new-window popups, file selectors and JavaScript dialogs
fail closed with explicit native diagnostics. OSR select/autocomplete popup pixels
are composited into the same frame stream; they are not external browser windows.
Web mode remains experimental while IME, accessibility and developer tools are
unavailable; adding HTTP(S) navigation is not full E1/E2 certification.

## Output

Each output item starts with exactly 16 bytes, all integers big-endian:

| Bytes | Field |
| --- | --- |
| 0–3 | ASCII `AXCF` |
| 4–5 | version = 1 (u16) |
| 6–7 | kind: 1 JSON event, 2 BGRA frame (u16) |
| 8–11 | UTF-8 JSON metadata length, 1..8192 (u32) |
| 12–15 | binary payload length, 0..33554432 (u32) |

The reader validates lengths before allocation, then reads exactly metadata and
payload bytes. A JSON event has zero binary payload. Frame metadata contains the
complete target, a monotonically increasing `frame_id`, physical `width`, `height`,
`stride`, `device_scale`, and `format:BGRA8`. Each dimension is 1..4096;
`stride == width*4` and `payload_length == stride*height <= 32 MiB`.
Oversized Retina surfaces use an explicitly reported bounded render scale while
retaining logical input coordinates, or return `unsupported` when no safe scale
fits. The UI exposes a scale cap; it is never mistaken for native Retina fidelity.
All generations are safe JSON integers (0..9007199254740991).

Events include `ready` with actual CEF/Chromium/platform/capabilities, `created`,
`accepted`, `completed`, `navigation`, `loading`, `title`, `url`, `closed`, `error`.
Generation changes precede observable navigation events. Frames/events for a stale
generation are discarded by the presenter and never applied to another target.
CEF engine identity comes from the pinned native runtime, not a spoofed user agent.

Every `load` event carries an integer `http_status` and a boolean
`restored_from_history`. A normal fixture load is successful only for HTTP 200.
Web mode accepts HTTP 200–599 so that normal server error pages can render; an
explicit `about:blank` start is the only new-page HTTP-0 exception. CEF can report
HTTP 0 when a previously committed page returns from its back-forward
cache. The native host may set `restored_from_history:true` only for a pending
back/forward command whose load-start and load-end URLs exactly match a fixture URL
previously committed with HTTP 200, with no intervening load error. The privileged
adapter checks that command and URL independently and waits for a subsequent frame
before considering the restored page ready. Other unsolicited HTTP 0 or a new
network URL never counts as a successful load.

## Backpressure and lifecycle

At most one frame is outstanding. The parent sends `frame_ack` only after consuming
or deliberately discarding that exact frame. An ACK matches the exact outstanding
`{frame_id,target}`, even when its generations have since become stale. This releases
transport credit only; it grants no native action. Unknown or duplicate ACKs fail.
The native UI thread never blocks on
pipe writes: an owned writer sends the current frame, with at most one pending newest
frame replacing older pending frames. Event queues and metadata are bounded too.
No frame is a screenshot of another application: payloads come directly from CEF's
native `OnPaint` callback and input returns to the same live CEF browser.

Resize invalidates stale-size frames. Close rejects further input, closes the CEF
browser, waits for the native closed callback, then ends the child. Engine switching
keeps the original Gecko tab until the Chromium candidate emits an admitted load
and actual frame; failure restores its original presentation with no cookie transfer.
Retained Gecko content is suspended while Chromium owns the visible tab, and its
state is restored on return. Background Chromium tabs are hidden natively; a
bounded number of Chromium hosts prevents unbounded per-tab process growth.
