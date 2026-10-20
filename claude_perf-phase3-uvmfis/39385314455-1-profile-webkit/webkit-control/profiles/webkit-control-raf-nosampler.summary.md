### webkit-control raf-nosampler (profile pass)

**parent pid 9563** — 1056 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 235 | 7.8 | Idle 104, JavaScript 50, GC / CC 45, Other 22 | 4 / 52 / 179 | ipc 234, poll_wait 119, gc_cc 104, engine_stream_read 39 |
| DOM Worker | 225 | 7.5 | JavaScript 216, Profiler 6, Other 3 | 0 / 0 / 225 | subprocess_pipe_io 225, worker_messaging 225, ipc 225, js_ctypes 202 |
| Renderer | 218 | 7.2 | Graphics 114, Idle 102, Profiler 1, Other 0 | 0 / 0 / 218 | ipc 218, webrender_render 115, poll_wait 110, webrender_sw_raster 103 |
| SwComposite | 180 | 6.0 | Other 180 | 0 / 0 / 180 | webrender_render 180, poll_wait 101, webrender_sw_raster 77, memcpy_memset 10 |
| BackgroundThreadPool #2 | 82 | 2.7 | Idle 61, Other 19, Graphics 2, Profiler 0 | 0 / 0 / 82 | ipc 81, poll_wait 62, native_receiver 20, memcpy_memset 18 |
| WRRenderBackend#0 | 53 | 1.8 | Other 53 | 0 / 0 / 53 | webrender_scene 0, memcpy_memset 0, webrender_render 0 |
| Compositor | 35 | 1.2 | Idle 33, Other 1, Graphics 1, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 34, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 15 | 0.5 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, image_container 0, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 117; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `[unknown]` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 4; `[axiosozo-dev]` 4; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3

**tab pid 9749** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9708** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 9730** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

