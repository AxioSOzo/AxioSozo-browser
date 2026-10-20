### chromium-2x switch-to-engine (profile pass)

**parent pid 3115** — 151 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 65 | 36.8 | Graphics 64, Idle 1 | 0 / 0 / 65 | ipc 65, webrender_render 64, webrender_sw_raster 56, canvas_2d 7 |
| GeckoMain | 47 | 26.3 | Layout 16, DOM 10, Idle 9, JavaScript 5 | 0 / 25 / 23 | ipc 47, paint_layout 21, array_buffer_copy 14, gc_cc 13 |
| BackgroundThreadPool #1 | 10 | 5.9 | Idle 7, Other 3 | 0 / 0 / 10 | ipc 10, poll_wait 7, native_receiver 3, memcpy_memset 3 |
| DOM Worker | 10 | 5.4 | JavaScript 9, Profiler 1, Other 0 | 0 / 0 / 10 | subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 8 |
| SwComposite | 8 | 4.5 | Other 8 | 0 / 0 / 8 | webrender_render 8, poll_wait 8, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 4 | 2.0 | Other 4 | 0 / 0 / 4 |  |
| WRSceneBuilder#0 | 2 | 1.2 | Other 2, Graphics 0 | 0 / 0 / 2 | webrender_scene 2, webrender_sw_raster 0, poll_wait 0 |
| Compositor | 2 | 1.2 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, webrender_render 0 |

Main thread, top self: `__strlen_evex [libc.so.6]` 7; `poll [libc.so.6]` 6; `style::properties::generated::longhands::list_style_type::cascade_prop` 5; `mozilla::nsDisplayItem::ZIndex() const [libxul.so]` 3; `[linux-vdso.so.1]` 3; `nsGridContainerFrame::Grid::PlaceGridItems(nsGridContainerFrame::GridR` 2; `__lll_lock_wake [libc.so.6]` 2; `nsLayoutUtils::IsAncestorFrameCrossDocInProcessConsideringContinuation` 1

**tab pid 3964** — 35 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 22.6 | Other 25, JavaScript 7, DOM 2, Idle 1 | 0 / 3 / 32 | ipc 27, gc_cc 11, array_buffer_copy 11, subprocess_pipe_io 5 |
| IPC I/O Child | 0 | 0.3 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 3; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 3; `__strcmp_evex [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `access [libc.so.6]` 1; `poll [libc.so.6]` 1; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.so]` 1

**tab pid 3960** — 35 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 34 | 30.9 | Other 28, JavaScript 2, Profiler 2, DOM 1 | 0 / 2 / 32 | ipc 24, array_buffer_copy 11, gc_cc 8, subprocess_pipe_io 4 |
| IPC I/O Child | 0 | 0.5 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `__strcmp_evex [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__open_nocancel [libc.so.6]` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(js::fronte` 1; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, unsigned l` 1; `js::frontend::BytecodeEmitter::emitFunction(js::frontend::FunctionNode` 1

**tab pid 3772** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.5 | Idle 2, Graphics 1, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 1 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `mozilla::nsDisplaySolidColor::CreateWebRenderCommands(mozilla::wr::Dis` 1; `__lll_lock_wait [libc.so.6]` 0

