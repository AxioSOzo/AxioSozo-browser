### webkit switch-to-engine (profile pass)

**parent pid 7188** — 117 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 13.1 | JavaScript 20, Idle 10, Layout 6, Other 5 | 0 / 28 / 21 | ipc 49, gc_cc 19, poll_wait 14, array_buffer_copy 13 |
| DOM Worker | 31 | 8.2 | JavaScript 30, Profiler 1 | 0 / 0 / 31 | subprocess_pipe_io 31, worker_messaging 31, ipc 31, js_ctypes 29 |
| Renderer | 17 | 4.5 | Graphics 11, Idle 6 | 0 / 0 / 17 | ipc 17, webrender_render 11, webrender_sw_raster 7, poll_wait 6 |
| BackgroundThreadPool #2 | 6 | 1.6 | Other 4, Idle 2 | 0 / 0 / 6 | ipc 6, native_receiver 4, poll_wait 2, image_container 2 |
| Compositor | 4 | 1.1 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 1 |
| IPC I/O Parent | 3 | 0.8 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 2, ipc 0 |
| WRRenderBackend#0 | 2 | 0.5 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 1 | 0.4 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 16; `u_charType_78 [libxul.so]` 3; `nsIFrame::IsHiddenByContentVisibilityOfInFlowParentForLayout() const [` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `[unknown]` 1; `__lll_lock_wait [libc.so.6]` 1; `mozilla::dom::HTMLImageElement::QueryInterface(nsID const&, void**) [l` 1; `js::NewDenseFullyAllocatedArray(JSContext*, unsigned int, js::NewObjec` 1

**tab pid 7879** — 65 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 64 | 22.3 | Other 51, DOM 5, JavaScript 4, Profiler 2 | 1 / 7 / 56 | ipc 49, array_buffer_copy 20, gc_cc 15, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 9; `__strlen_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[libexpat.so.1]` 3; `qcms::transform_util::compute_precache [libxul.so]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2

**tab pid 7885** — 53 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 51 | 17.5 | Other 40, JavaScript 6, Profiler 2, DOM 2 | 0 / 6 / 45 | ipc 38, array_buffer_copy 15, gc_cc 11, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.5 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libexpat.so.1]` 6; `[]` 4; `char* mozilla::detail::DuplicateString<char, 4096ul, 1ul>(char const*,` 3; `mmap64 [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `JS::SetAVXEnabled(bool) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 1; `access [libc.so.6]` 1

**tab pid 7739** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.5 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `<core::str::lossy::Utf8Chunks as core::iter::traits::iterator::Iterato` 0

