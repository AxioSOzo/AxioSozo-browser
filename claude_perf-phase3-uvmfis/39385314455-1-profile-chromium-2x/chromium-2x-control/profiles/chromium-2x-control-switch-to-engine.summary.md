### chromium-2x-control switch-to-engine (profile pass)

**parent pid 4435** — 343 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 104 | 14.5 | Layout 40, JavaScript 30, Idle 20, DOM 5 | 2 / 48 / 54 | ipc 104, paint_layout 52, gc_cc 33, poll_wait 21 |
| Renderer | 103 | 14.4 | Graphics 97, Idle 6 | 0 / 0 / 103 | ipc 102, webrender_render 97, webrender_sw_raster 82, poll_wait 6 |
| DOM Worker | 72 | 10.1 | JavaScript 51, Idle 19, Profiler 2 | 0 / 0 / 72 | subprocess_pipe_io 72, worker_messaging 72, ipc 72, poll_wait 62 |
| BackgroundThreadPool #3 | 30 | 4.2 | Other 15, Idle 15 | 0 / 0 / 30 | ipc 30, native_receiver 15, poll_wait 15, memcpy_memset 8 |
| SwComposite | 10 | 1.5 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 10 |
| Compositor | 8 | 1.1 | Idle 5, Other 3 | 0 / 0 / 8 | ipc 8, poll_wait 5, memcpy_memset 1 |
| WRRenderBackend#0 | 5 | 0.7 | Other 5 | 0 / 0 / 5 |  |
| IPC I/O Parent | 4 | 0.6 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 21; `Gecko_AddRefAtom [libxul.so]` 6; `[axiosozo-dev]` 5; `selectors::matching::matches_complex_selector_list::{{closure}} [libxu` 5; `style::properties::cascade::Cascade::apply_non_prioritary_properties [` 5; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc<(js::Allo` 4; `mprotect [libc.so.6]` 4; `moz_arena_calloc [axiosozo-dev]` 3

**tab pid 5054** — 57 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 56 | 11.8 | Other 45, DOM 4, Profiler 3, JavaScript 2 | 0 / 5 / 50 | ipc 43, array_buffer_copy 19, gc_cc 15, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 7; `__lll_lock_wake [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `mprotect [libc.so.6]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 2; `[libexpat.so.1]` 2; `poll [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 1

**tab pid 5049** — 56 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 55 | 10.4 | Other 40, Profiler 5, DOM 4, JavaScript 3 | 0 / 6 / 49 | ipc 42, array_buffer_copy 16, gc_cc 15, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `[libexpat.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `__strlen_avx2 [libc.so.6]` 2; `js::LifoAlloc::getOrCreateChunk(unsigned long) [libxul.so]` 2; `poll [libc.so.6]` 2

**tab pid 4891** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.5 | Idle 3, Layout 1, Profiler 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, paint_layout 1, canvas_2d 1 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `gfxFont::MeasureGlyphs(gfxTextRun const*, unsigned int, unsigned int, ` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0

