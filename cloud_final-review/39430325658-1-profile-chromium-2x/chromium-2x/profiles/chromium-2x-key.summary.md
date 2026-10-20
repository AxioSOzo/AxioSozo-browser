### chromium-2x key (profile pass)

**parent pid 3348** — 943 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 430 | 11.6 | Idle 191, JavaScript 93, Layout 49, Other 35 | 15 / 145 / 270 | ipc 430, poll_wait 233, gc_cc 100, paint_layout 89 |
| DOM Worker | 232 | 6.3 | JavaScript 224, Other 5, Profiler 3 | 0 / 0 / 232 | subprocess_pipe_io 232, worker_messaging 232, ipc 232, js_ctypes 219 |
| Renderer | 123 | 3.3 | Graphics 109, Idle 15 | 0 / 0 / 123 | ipc 121, webrender_render 109, webrender_sw_raster 100, poll_wait 17 |
| SwComposite | 52 | 1.4 | Other 52 | 0 / 0 / 52 | webrender_render 52, poll_wait 28, webrender_sw_raster 24, memcpy_memset 20 |
| Timer | 36 | 1.0 | Other 36 | 0 / 0 / 36 | ipc 36, poll_wait 36 |
| WRRenderBackend#0 | 19 | 0.5 | Other 19 | 0 / 0 / 19 | webrender_render 0 |
| Compositor | 17 | 0.5 | Idle 17, Other 0 | 0 / 0 / 17 | ipc 17, poll_wait 17, canvas_2d 0, webrender_render 0 |
| WRSceneBuilder#0 | 9 | 0.3 | Other 8, Graphics 1 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 195; `[unknown]` 18; `recvmsg [libc.so.6]` 6; `[axiosozo-dev]` 6; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 5; `write [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 3; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 3

**tab pid 3455** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.2 | Idle 6, DOM 1, Other 0, JavaScript 0 | 0 / 1 / 7 | ipc 8, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::AdvanceAcrossSeg` 0; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, unsigned int` 0; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `[]` 0

**tab pid 3508** — 1 ms CPU in the window

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

**tab pid 3547** — 1 ms CPU in the window

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

