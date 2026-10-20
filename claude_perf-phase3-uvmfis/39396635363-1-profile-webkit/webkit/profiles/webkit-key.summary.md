### webkit key (profile pass)

**parent pid 7188** — 820 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 470 | 12.9 | Idle 213, JavaScript 75, Other 37, Layout 36 | 10 / 127 / 333 | ipc 468, poll_wait 257, gc_cc 115, paint_layout 77 |
| DOM Worker | 186 | 5.1 | JavaScript 179, Profiler 5, Other 1 | 0 / 0 / 186 | subprocess_pipe_io 186, worker_messaging 186, ipc 186, js_ctypes 177 |
| Renderer | 54 | 1.5 | Idle 30, Graphics 24, Other 1 | 0 / 0 / 54 | ipc 54, poll_wait 30, webrender_render 24, webrender_sw_raster 20 |
| Timer | 27 | 0.7 | Other 27, Profiler 0 | 0 / 0 / 27 | ipc 27, poll_wait 27 |
| SwComposite | 27 | 0.7 | Other 27 | 0 / 0 / 27 | webrender_render 27, poll_wait 20, webrender_sw_raster 7, memcpy_memset 6 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 | memcpy_memset 0 |
| Compositor | 15 | 0.4 | Idle 15, Graphics 0, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, canvas_2d 0, webrender_render 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 8, Graphics 1 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 1, poll_wait 1, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 222; `[axiosozo-dev]` 13; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[libgtk-3.so.0]` 4; `mozilla::dom::FontFaceSetImpl::CheckLoadingFinished() [libxul.so]` 4

**tab pid 7278** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, Other 1, DOM 0 | 0 / 0 / 7 | ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `mojo::core::ports::Node::SendUserMessage(mojo::core::ports::PortRef co` 0; `mozilla::dom::StructuredCloneHolder::~StructuredCloneHolder() [libxul.` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::Handle<JS::` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 0; `js::ObjectWrapperMap::put(JSObject*, JSObject*) [libxul.so]` 0; `[unknown]` 0; `[]` 0

**tab pid 7335** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 7384** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

