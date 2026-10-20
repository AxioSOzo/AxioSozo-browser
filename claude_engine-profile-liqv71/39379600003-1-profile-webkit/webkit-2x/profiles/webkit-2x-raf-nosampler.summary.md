### webkit-2x raf-nosampler (profile pass)

**parent pid 8750** — 1778 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 550 | 18.0 | Graphics 329, Idle 219, Other 3 | 0 / 0 / 550 | ipc 550, webrender_render 329, webrender_sw_raster 287, poll_wait 239 |
| SwComposite | 451 | 14.7 | Other 451 | 0 / 0 / 451 | webrender_render 451, poll_wait 238, webrender_sw_raster 214, memcpy_memset 46 |
| DOM Worker | 259 | 8.4 | JavaScript 249, Profiler 7, Other 3 | 0 / 0 / 259 | subprocess_pipe_io 259, worker_messaging 258, ipc 258, js_ctypes 226 |
| GeckoMain | 217 | 7.1 | Idle 141, JavaScript 40, Other 18, DOM 14 | 8 / 45 / 165 | ipc 216, poll_wait 152, gc_cc 57, engine_stream_read 38 |
| BackgroundThreadPool #5 | 169 | 5.5 | Idle 114, Other 51, Graphics 4, Profiler 0 | 0 / 0 / 169 | ipc 169, poll_wait 117, native_receiver 54, memcpy_memset 48 |
| WRRenderBackend#0 | 62 | 2.0 | Other 62 | 0 / 0 / 62 | webrender_render 0 |
| Compositor | 42 | 1.4 | Idle 40, Other 1, Graphics 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, webrender_render 1, canvas_2d 0 |
| ImageBridgeChld | 18 | 0.6 | Idle 17, Other 0, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 17, image_container 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 152; `[unknown]` 3; `mozilla::detail::HashTable<mozilla::Span<char, 18446744073709551615ul>` 3; `__lll_lock_wake [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `nsQueryInterfaceISupports::operator()(nsID const&, void**) const [libx` 2; `__strlen_avx2 [libc.so.6]` 1

**tab pid 9277** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | GC / CC 3, Idle 1 | 0 / 0 / 4 | gc_cc 3, ipc 3, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `__lll_lock_wake [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 0; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 0

**tab pid 8930** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 8911** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0

