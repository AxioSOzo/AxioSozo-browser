### webkit key (profile pass)

**parent pid 7188** — 843 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 502 | 13.8 | Idle 220, JavaScript 75, GC / CC 63, Other 39 | 13 / 116 / 373 | ipc 500, poll_wait 259, gc_cc 142, paint_layout 80 |
| DOM Worker | 183 | 5.0 | JavaScript 177, Other 3, Profiler 2, GC / CC 1 | 0 / 0 / 183 | subprocess_pipe_io 183, worker_messaging 183, ipc 183, js_ctypes 174 |
| Renderer | 47 | 1.3 | Idle 25, Graphics 23 | 0 / 0 / 47 | ipc 47, poll_wait 25, webrender_render 23, webrender_sw_raster 18 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26 |
| SwComposite | 25 | 0.7 | Other 25 | 0 / 0 / 25 | webrender_render 25, poll_wait 13, webrender_sw_raster 11, memcpy_memset 11 |
| Compositor | 16 | 0.4 | Idle 14, Other 1 | 0 / 0 / 16 | ipc 15, poll_wait 14, memcpy_memset 1, paint_layout 0 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 |  |
| WRSceneBuilder#0 | 9 | 0.2 | Other 8, Graphics 1 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 1, poll_wait 1, webrender_render 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 229; `[unknown]` 18; `[axiosozo-dev]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3

**tab pid 7280** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, DOM 0, Other 0 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozilla::dom::JS` 0; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 0; `PR_GetCurrentThread [libnspr4.so]` 0

**tab pid 7379** — 1 ms CPU in the window

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

**tab pid 7338** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObject*) [libxu` 0

