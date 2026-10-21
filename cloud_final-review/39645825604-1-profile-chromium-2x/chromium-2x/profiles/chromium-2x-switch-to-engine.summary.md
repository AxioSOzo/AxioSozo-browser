### chromium-2x switch-to-engine (profile pass)

**parent pid 3512** — 185 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 75 | 27.8 | Graphics 70, Idle 5 | 0 / 0 / 75 | ipc 75, webrender_render 70, webrender_sw_raster 68, poll_wait 6 |
| GeckoMain | 66 | 24.3 | Layout 26, Idle 16, JavaScript 8, Other 6 | 1 / 27 / 38 | ipc 66, paint_layout 31, gc_cc 18, poll_wait 18 |
| DOM Worker | 16 | 5.9 | JavaScript 15, Profiler 1 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 14 |
| BackgroundThreadPool #3 | 7 | 2.5 | Other 5, Idle 1 | 0 / 0 / 7 | ipc 7, native_receiver 5, memcpy_memset 4, poll_wait 1 |
| SwComposite | 6 | 2.1 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 5, memcpy_memset 1, webrender_sw_raster 1 |
| WRRenderBackend#0 | 5 | 1.7 | Other 5 | 0 / 0 / 5 |  |
| Compositor | 3 | 1.2 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, canvas_2d 0, webrender_render 0 |
| WRSceneBuilder#0 | 2 | 0.9 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 17; `nsFlexContainerFrame::FlexLine::PositionItemsInMainAxis(mozilla::Style` 8; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 4; `nsSplittableFrame::FirstContinuation() const [libxul.so]` 4; `[axiosozo-dev]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `mozilla::StaticPresData::Get() [libxul.so]` 2; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2

**tab pid 4318** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 18.4 | Other 37, JavaScript 4, Profiler 3, DOM 3 | 0 / 4 / 43 | ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `__lll_lock_wake [libc.so.6]` 3; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 3; `[libfontconfig.so.1]` 3; `__strlen_avx2 [libc.so.6]` 2; `[libexpat.so.1]` 2; `uhash_geti_78 [libxul.so]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2

**tab pid 4329** — 22 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 21 | 7.9 | Other 9, DOM 5, Profiler 3, JavaScript 3 | 1 / 5 / 15 | ipc 21, gc_cc 13, subprocess_pipe_io 6, memcpy_memset 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__lll_lock_wake [libc.so.6]` 2; `[]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::frontend::Par` 2; `regex_automata::meta::regex::Builder::build [libxul.so]` 2; `mozilla::Vector<js::frontend::ScriptStencil, 1ul, js::SystemAllocPolic` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::frontend::TaggedP` 1; `PR_Now [libnspr4.so]` 1

**tab pid 4169** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.9 | Idle 1, Other 1, Graphics 0 | 0 / 0 / 2 | poll_wait 2, ipc 1, paint_layout 0 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0

