### chromium key (profile pass)

**parent pid 3367** — 995 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 558 | 15.1 | Idle 213, JavaScript 105, GC / CC 73, Other 50 | 10 / 166 / 381 | ipc 557, poll_wait 259, gc_cc 184, paint_layout 94 |
| DOM Worker | 258 | 7.0 | JavaScript 252, Other 5, Profiler 1 | 0 / 0 / 258 | subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 243 |
| Renderer | 58 | 1.6 | Graphics 36, Idle 22 | 0 / 0 / 58 | ipc 58, webrender_render 36, webrender_sw_raster 33, poll_wait 23 |
| Timer | 40 | 1.1 | Other 40, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39 |
| Compositor | 19 | 0.5 | Idle 18, Other 1, Graphics 0 | 0 / 0 / 19 | ipc 19, poll_wait 18, memcpy_memset 1, webrender_render 0 |
| SwComposite | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 18, poll_wait 15, webrender_sw_raster 4, memcpy_memset 3 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 | memcpy_memset 0 |
| WRSceneBuilder#0 | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_scene 10 |

Main thread, top self: `poll [libc.so.6]` 215; `[axiosozo-dev]` 16; `[unknown]` 16; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 14; `write [libc.so.6]` 10; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 8; `__lll_lock_wait [libc.so.6]` 6; `recvmsg [libc.so.6]` 6

**tab pid 3464** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, Other 0, JavaScript 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 4039** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::ipc::NodeChannel::SendMessage(std::unique_ptr<IPC::Message, s` 0

**tab pid 4250** — 1 ms CPU in the window

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

