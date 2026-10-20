### gecko-debian raf (profile pass)

**parent pid 8116** — 1322 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 410 | 13.4 | Graphics 314, Idle 96, Other 0 | 0 / 0 / 410 | ipc 409, webrender_render 314, webrender_sw_raster 276, poll_wait 98 |
| GeckoMain | 383 | 12.5 | Idle 88, JavaScript 82, DOM 67, GC / CC 67 | 6 / 116 / 261 | ipc 382, gc_cc 191, poll_wait 123, array_buffer_copy 55 |
| DOM Worker | 292 | 9.5 | JavaScript 138, GC / CC 66, Idle 45, DOM 31 | 42 / 187 / 63 | worker_messaging 292, ipc 287, gc_cc 100, poll_wait 47 |
| WRRenderBackend#0 | 76 | 2.5 | Other 76 | 0 / 0 / 76 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 53 | 1.7 | Other 52, Profiler 0 | 0 / 0 / 53 | webrender_scene 53, webrender_render 2, memcpy_memset 1, poll_wait 0 |
| Compositor | 46 | 1.5 | Idle 45, Other 1, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 45, webrender_render 0, paint_layout 0 |
| SwComposite | 26 | 0.8 | Other 26 | 0 / 0 / 26 | webrender_render 26, poll_wait 24, memcpy_memset 2, webrender_sw_raster 2 |
| Socket Thread | 14 | 0.5 | Other 14 | 0 / 0 / 14 | ipc 14, poll_wait 13 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 108; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 13; `[unknown]` 11; `__memmove_evex_unaligned_erms [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[axiosozo-dev]` 10; `mprotect [libc.so.6]` 7; `__pthread_mutex_unlock_usercnt [libc.so.6]` 6

**tab pid 8370** — 226 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 205 | 6.7 | Idle 96, Graphics 35, Layout 32, Other 21 | 0 / 11 / 194 | ipc 192, poll_wait 99, paint_layout 79, gc_cc 8 |
| IPC I/O Child | 16 | 0.5 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 15, ipc 0 |
| Timer | 5 | 0.2 | Other 5 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 4; `__lll_lock_wait [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(unsigned lon` 2; `mozilla::nsDisplayList::HitTest(mozilla::nsDisplayListBuilder*, nsRect` 1; `nsIFrame::GetTransformMatrix(mozilla::ViewportType, mozilla::RelativeT` 1

**tab pid 8308** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, memcpy_memset 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[linux-vdso.so.1]` 0

**utility pid 8362** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `[linux-vdso.so.1]` 0; `nsTSubstring<char>::Assign(nsTSubstring<char>&&, std::nothrow_t const&` 0; `mozilla::dom::PrefValue::PrefValue(mozilla::dom::PrefValue&&) [libxul.` 0

