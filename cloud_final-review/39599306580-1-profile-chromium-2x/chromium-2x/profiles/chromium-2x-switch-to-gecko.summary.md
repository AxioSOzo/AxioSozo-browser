### chromium-2x switch-to-gecko (profile pass)

**parent pid 3249** — 162 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 55 | 0.4 | GC / CC 22, Other 21, JavaScript 10, Idle 2 | 0 / 0 / 55 | subprocess_pipe_io 55, worker_messaging 55, ipc 55, gc_cc 43 |
| GeckoMain | 50 | 0.3 | Idle 15, Layout 11, JavaScript 10, Other 9 | 1 / 19 / 30 | ipc 50, poll_wait 16, paint_layout 16, harness_diagnostics 8 |
| Renderer | 31 | 0.2 | Graphics 30, Profiler 1, Idle 0 | 0 / 0 / 31 | ipc 31, webrender_render 31, webrender_sw_raster 28, memcpy_memset 1 |
| BgIOThreadPool #3 | 6 | 0.0 | Other 6, Idle 0 | 0 / 0 / 6 | ipc 6, poll_wait 0 |
| IPC I/O Parent | 5 | 0.0 | Idle 5, Other 0, Profiler 0 | 0 / 0 / 5 | poll_wait 4, ipc 0 |
| Compositor | 5 | 0.0 | Other 3, Idle 2 | 0 / 0 / 5 | ipc 5, poll_wait 2, memcpy_memset 1 |
| SwComposite | 4 | 0.0 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 3, memcpy_memset 1, webrender_sw_raster 1 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 15; `madvise [libc.so.6]` 3; `sendmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `style::properties::generated::longhands::_moz_default_appearance::casc` 1; `mprotect [libc.so.6]` 1

**tab pid 3411** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, gc_cc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `sendmsg [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0

**tab pid 3429** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 2, Other 0 | 0 / 0 / 3 | ipc 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `[]` 0; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0

**tab pid 3920** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Layout 0, Other 0, Graphics 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 0, canvas_2d 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `SkCanvas::setMatrix(SkMatrix const&) [libxul.so]` 0; `PR_GetThreadPrivate [libnspr4.so]` 0; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder*, mozilla` 0; `<firefox_on_glean::private::labeled_counter::LabeledCounterMetric as g` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

