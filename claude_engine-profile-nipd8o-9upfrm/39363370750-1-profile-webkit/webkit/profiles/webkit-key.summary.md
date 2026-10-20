### webkit key (profile pass)

**parent pid 7188** — 772 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 410 | 11.2 | Idle 200, JavaScript 75, Graphics 41, Other 33 | 9 / 115 / 287 | ipc 409, poll_wait 237, paint_layout 79, gc_cc 78 |
| DOM Worker | 209 | 5.7 | JavaScript 202, Profiler 4, Other 3 | 0 / 0 / 209 | subprocess_pipe_io 209, worker_messaging 209, ipc 209, js_ctypes 195 |
| Renderer | 51 | 1.4 | Idle 26, Graphics 25, Other 0 | 0 / 0 / 51 | ipc 51, poll_wait 27, webrender_render 25, webrender_sw_raster 20 |
| SwComposite | 40 | 1.1 | Other 40 | 0 / 0 / 40 | webrender_render 40, poll_wait 23, webrender_sw_raster 16, memcpy_memset 4 |
| Timer | 26 | 0.7 | Other 26, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 26, memcpy_memset 0 |
| Compositor | 14 | 0.4 | Idle 13, Other 0 | 0 / 0 / 14 | ipc 14, poll_wait 13, webrender_render 0, memcpy_memset 0 |
| WRRenderBackend#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_render 0 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 | webrender_scene 7, paint_layout 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 209; `[unknown]` 12; `[axiosozo-dev]` 8; `__memmove_evex_unaligned_erms [libc.so.6]` 7; `__memcmp_evex_movbe [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 5; `__memset_evex_unaligned_erms [libc.so.6]` 4; `g_mutex_lock [libglib-2.0.so.0]` 4

**tab pid 7285** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 6, Profiler 0, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla::ProfileB` 0; `mozilla::dom::TryToOuterize(JS::MutableHandle<JS::Value>) [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 7345** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `XRE_IsContentProcess() [libxul.so]` 0

**tab pid 7367** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

