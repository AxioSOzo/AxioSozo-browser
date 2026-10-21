### webkit switch-to-engine (profile pass)

**parent pid 7154** — 79 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 33 | 12.1 | JavaScript 16, Idle 6, Other 3, Layout 3 | 1 / 19 / 12 | ipc 33, gc_cc 14, array_buffer_copy 9, harness_diagnostics 9 |
| DOM Worker | 18 | 6.8 | JavaScript 15, Profiler 3 | 0 / 0 / 18 | subprocess_pipe_io 18, worker_messaging 18, ipc 18, js_ctypes 15 |
| Renderer | 11 | 4.2 | Graphics 9, Idle 2 | 0 / 0 / 11 | ipc 11, webrender_render 9, webrender_sw_raster 7, poll_wait 2 |
| BackgroundThreadPool #2 | 5 | 1.7 | Idle 3, Other 1 | 0 / 0 / 5 | ipc 5, poll_wait 3, native_receiver 1, image_container 1 |
| Compositor | 2 | 0.9 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_render 0 |
| IPC I/O Parent | 2 | 0.7 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| SwComposite | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS::MutableHa` 3; `mozilla::DelayForChaosMode(mozilla::ChaosFeature, unsigned int) [libxu` 3; `__lll_lock_wait [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[libstdc++.so.6]` 1; `execute/sendResponse/< (chrome://remote/content/marionette/server.sys.` 1; `[axiosozo-dev]` 1

**tab pid 7843** — 39 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 38 | 17.4 | Other 28, JavaScript 5, DOM 3, Idle 2 | 1 / 4 / 34 | ipc 29, array_buffer_copy 11, gc_cc 11, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strcmp_evex [libc.so.6]` 3; `__strlen_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[]` 2; `getdents64 [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `[libfontconfig.so.1]` 1; `__read_nocancel [libc.so.6]` 1

**tab pid 7849** — 35 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 34 | 29.3 | Other 26, JavaScript 4, DOM 2, Profiler 1 | 0 / 3 / 31 | ipc 26, gc_cc 10, array_buffer_copy 8, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.6 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `js::frontend::SourceCoords::lineToken(unsigned int) const [libxul.so]` 2; `bool js::GetDecimalInteger<mozilla::Utf8Unit>(mozilla::Utf8Unit const*` 1; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, JS::Handle<` 1; `do_lookup_x [ld-linux-x86-64.so.2]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1

**tab pid 7698** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.5 | Idle 1, Graphics 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, paint_layout 0 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `PLDHashTable::Search(void const*) const [libxul.so]` 0; `mozilla::EventDispatcher::CreateEvent(mozilla::dom::EventTarget*, nsPr` 0

