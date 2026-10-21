### chromium-2x key (profile pass)

**parent pid 3450** — 884 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 394 | 10.7 | Idle 171, JavaScript 72, Layout 44, Other 36 | 12 / 131 / 251 | ipc 392, poll_wait 206, gc_cc 90, paint_layout 84 |
| DOM Worker | 222 | 6.0 | JavaScript 212, Profiler 6, Other 3 | 0 / 0 / 222 | subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 203 |
| Renderer | 120 | 3.2 | Graphics 102, Idle 17, Other 0 | 0 / 0 / 120 | ipc 118, webrender_render 102, webrender_sw_raster 95, poll_wait 17 |
| SwComposite | 50 | 1.4 | Other 50 | 0 / 0 / 50 | webrender_render 50, webrender_sw_raster 29, memcpy_memset 28, poll_wait 22 |
| Timer | 33 | 0.9 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 33 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 |  |
| Compositor | 16 | 0.4 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9, Graphics 0 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 0, poll_wait 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 171; `[unknown]` 16; `[axiosozo-dev]` 7; `write [libc.so.6]` 5; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::FramePrope` 5; `recvmsg [libc.so.6]` 4; `__memcmp_avx2_movbe [libc.so.6]` 4; `syscall [libc.so.6]` 3

**tab pid 3555** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, Other 0, DOM 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `RefPtr<mozilla::dom::JSExecutionManager>::~RefPtr() [libxul.so]` 0; `apply (self-hosted:2805:23)[3]` 0; `js::IsDeadProxyObject(JSObject const*) [libxul.so]` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `lazyGetter (resource://gre/modules/XPCOMUtils.sys.mjs:237:24)[7]` 0; `js::NewPlainObject(JSContext*, js::NewObjectOptions const&) [libxul.so` 0

**tab pid 3608** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::MainThreadIdlePeriod::GetIdlePeriodHint(mozilla::TimeStamp*) ` 0

**tab pid 4236** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

