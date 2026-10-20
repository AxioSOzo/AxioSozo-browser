### chromium-2x raf (profile pass)

**parent pid 3115** — 794 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 245 | 8.0 | Idle 184, JavaScript 34, Other 14, DOM 8 | 2 / 38 / 205 | ipc 245, poll_wait 191, gc_cc 36, engine_stream_read 17 |
| DOM Worker | 201 | 6.6 | JavaScript 194, Other 4, Profiler 3 | 0 / 0 / 201 | subprocess_pipe_io 201, worker_messaging 201, ipc 201, js_ctypes 185 |
| Renderer | 103 | 3.4 | Idle 73, Graphics 30, Other 0 | 0 / 0 / 103 | ipc 103, poll_wait 77, webrender_render 30, webrender_sw_raster 26 |
| SwComposite | 77 | 2.5 | Other 77 | 0 / 0 / 77 | webrender_render 77, poll_wait 69, webrender_sw_raster 7, memcpy_memset 6 |
| BackgroundThreadPool #1 | 74 | 2.4 | Idle 60, Other 13, Graphics 1 | 0 / 0 / 74 | ipc 74, poll_wait 60, native_receiver 12, memcpy_memset 10 |
| Compositor | 27 | 0.9 | Idle 26, Other 1, Graphics 0 | 0 / 0 / 27 | ipc 27, poll_wait 26, webrender_render 0, canvas_2d 0 |
| WRRenderBackend#0 | 26 | 0.9 | Other 26 | 0 / 0 / 26 |  |
| Timer | 23 | 0.7 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 183; `[unknown]` 7; `recvmsg [libc.so.6]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 1; `[axiosozo-dev]` 1

**tab pid 3772** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | GC / CC 2, Idle 1, Profiler 0, Other 0 | 0 / 0 / 4 | ipc 3, gc_cc 2, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `write [libc.so.6]` 0

**tab pid 3275** — 1 ms CPU in the window

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

**tab pid 3777** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ipc::PBackgroundChild::OnMessageReceived(IPC::Message const&)` 0; `mozilla::dom::Document::HasRecentlyStartedForegroundLoads() [libxul.so` 0

