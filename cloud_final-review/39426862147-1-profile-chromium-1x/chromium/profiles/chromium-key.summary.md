### chromium key (profile pass)

**parent pid 3278** — 1233 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 453 | 12.2 | Idle 165, JavaScript 74, GC / CC 66, Layout 43 | 14 / 123 / 316 | ipc 453, poll_wait 200, gc_cc 158, paint_layout 84 |
| BgIOThreadPool #2 | 362 | 9.8 | Other 362, Idle 0 | 0 / 0 / 362 | ipc 362, poll_wait 0 |
| DOM Worker | 252 | 6.8 | JavaScript 245, Other 4, Profiler 3 | 0 / 0 / 252 | subprocess_pipe_io 252, worker_messaging 252, ipc 252, js_ctypes 237 |
| Renderer | 55 | 1.5 | Graphics 35, Idle 19 | 0 / 0 / 55 | ipc 55, webrender_render 35, webrender_sw_raster 35, poll_wait 20 |
| Timer | 35 | 1.0 | Other 35, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 35, memcpy_memset 0 |
| SwComposite | 17 | 0.5 | Other 17 | 0 / 0 / 17 | webrender_render 17, poll_wait 14, webrender_sw_raster 2, memcpy_memset 2 |
| Compositor | 16 | 0.4 | Idle 15, Other 1 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | memcpy_memset 0, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 166; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 17; `[axiosozo-dev]` 14; `[unknown]` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 8; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `write [libc.so.6]` 5; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 4

**tab pid 3368** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, Other 1, JavaScript 1 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<geckoprofile` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::dom::CallbackObject::Release() [libxul.so]` 0; `mozilla::ipc::MessageChannel::RunMessage(mozilla::ipc::ActorLifecycleP` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 0; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 0; `[unknown]` 0

**tab pid 3955** — 1 ms CPU in the window

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

**tab pid 3460** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

