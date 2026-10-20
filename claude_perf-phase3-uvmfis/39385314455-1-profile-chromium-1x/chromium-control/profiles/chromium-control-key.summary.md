### chromium-control key (profile pass)

**parent pid 4455** — 787 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 395 | 10.7 | Idle 159, JavaScript 90, Other 44, Layout 40 | 10 / 135 / 251 | ipc 395, poll_wait 196, gc_cc 109, worker_messaging 81 |
| DOM Worker | 253 | 6.8 | JavaScript 247, Profiler 3, Other 3 | 0 / 0 / 253 | subprocess_pipe_io 253, worker_messaging 253, ipc 253, js_ctypes 242 |
| Timer | 37 | 1.0 | Other 37 | 0 / 0 / 37 | ipc 37, poll_wait 36 |
| Renderer | 30 | 0.8 | Idle 17, Graphics 13, Other 0 | 0 / 0 / 30 | ipc 30, poll_wait 17, webrender_render 13, webrender_sw_raster 13 |
| SwComposite | 22 | 0.6 | Other 22 | 0 / 0 / 22 | webrender_render 22, webrender_sw_raster 11, poll_wait 11, memcpy_memset 1 |
| Compositor | 15 | 0.4 | Idle 14, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, memcpy_memset 0, paint_layout 0 |
| WRRenderBackend#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, webrender_render 0, paint_layout 0 |

Main thread, top self: `poll [libc.so.6]` 161; `[unknown]` 16; `[axiosozo-dev]` 10; `write [libc.so.6]` 10; `recvmsg [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `[libX11.so.6]` 5; `mprotect [libc.so.6]` 4

**tab pid 4540** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 1, DOM 0, JavaScript 0 | 0 / 0 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[]` 0; `non-virtual thunk to nsGlobalWindowInner::AddRef() [libxul.so]` 0; `js::UnwrapOneCheckedDynamic(JS::Handle<JSObject*>, JSContext*, bool) [` 0; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxul.so]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[9` 0

**tab pid 5007** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 4610** — 1 ms CPU in the window

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

