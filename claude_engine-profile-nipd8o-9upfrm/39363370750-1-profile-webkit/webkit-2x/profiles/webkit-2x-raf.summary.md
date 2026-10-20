### webkit-2x raf (profile pass)

**parent pid 8720** — 3557 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1475 | 46.4 | JavaScript 737, Idle 251, DOM 218, Other 132 | 366 / 657 / 452 | ipc 1473, paint_layout 590, frame_surface_paint 568, gc_cc 433 |
| DOM Worker | 929 | 29.2 | JavaScript 778, Other 82, Profiler 61, GC / CC 7 | 0 / 0 / 929 | subprocess_pipe_io 929, worker_messaging 921, ipc 921, js_ctypes 506 |
| Renderer | 557 | 17.5 | Graphics 280, Idle 275, Other 2 | 0 / 0 / 557 | ipc 557, poll_wait 307, webrender_render 282, webrender_sw_raster 247 |
| SwComposite | 499 | 15.7 | Other 499 | 0 / 0 / 499 | webrender_render 499, poll_wait 291, webrender_sw_raster 196, memcpy_memset 19 |
| WRRenderBackend#0 | 45 | 1.4 | Other 45 | 0 / 0 / 45 | webrender_render 0, webrender_scene 0 |
| Compositor | 28 | 0.9 | Idle 27, Other 1, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 1, canvas_2d 0 |
| Timer | 15 | 0.5 | Other 15 | 0 / 0 / 15 | ipc 15, poll_wait 15, memcpy_memset 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 375; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 340; `__memmove_evex_unaligned_erms [libc.so.6]` 321; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 70; `[unknown]` 41; `__lll_lock_wait [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `readStreamPacket/< (chrome://browser/content/axiosozo/EngineStreamClie` 11

**tab pid 9270** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | GC / CC 4, Idle 1, Other 0 | 0 / 0 / 6 | ipc 5, gc_cc 4, poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::HashSet<ch` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, char const*` 1; `__lll_lock_wait [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `std::_Rb_tree_insert_and_rebalance(bool, std::_Rb_tree_node_base*, std` 0

**tab pid 8882** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8924** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

