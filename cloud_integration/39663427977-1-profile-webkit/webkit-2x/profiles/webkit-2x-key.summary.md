### webkit-2x key (profile pass)

**parent pid 8803** — 867 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 442 | 12.1 | Idle 216, JavaScript 87, Layout 35, Other 32 | 14 / 128 / 301 | ipc 440, poll_wait 245, gc_cc 102, worker_messaging 74 |
| DOM Worker | 179 | 4.9 | JavaScript 173, Other 5, Profiler 1 | 0 / 0 / 179 | subprocess_pipe_io 179, worker_messaging 179, ipc 179, js_ctypes 167 |
| Renderer | 90 | 2.5 | Graphics 66, Idle 25 | 0 / 0 / 90 | ipc 90, webrender_render 66, webrender_sw_raster 58, poll_wait 33 |
| SwComposite | 72 | 2.0 | Other 72 | 0 / 0 / 72 | webrender_render 72, webrender_sw_raster 39, memcpy_memset 38, poll_wait 33 |
| Timer | 25 | 0.7 | Other 25, Profiler 0 | 0 / 0 / 25 | ipc 25, poll_wait 25 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 0, array_buffer_copy 0 |
| Compositor | 14 | 0.4 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 14, memcpy_memset 0, paint_layout 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 8, Graphics 1 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 225; `[unknown]` 15; `[axiosozo-dev]` 8; `bool js::JSONPerHandlerParser<unsigned char, js::JSONFullParseHandler<` 7; `__lll_lock_wait [libc.so.6]` 5; `mozilla::dom::AbstractRange::Init(nsINode*) [libxul.so]` 4; `postMessage (resource://gre/modules/subprocess/subprocess_unix.sys.mjs` 4; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 3

**tab pid 8896** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, Other 0, DOM 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `nsPIDOMWindowInner::IsCurrentInnerWindow() const [libxul.so]` 0; `JSFunction::needsCallObject() const [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[6]` 0; `js::NewPlainObject(JSContext*, js::NewObjectOptions const&) [libxul.so` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message const&) [l` 0

**tab pid 8945** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::RunIdleMemoryCleanup(mozilla::TimeStamp, unsigned int) [libxu` 0

**tab pid 8986** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

