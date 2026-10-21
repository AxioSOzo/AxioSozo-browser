### chromium switch-to-gecko (profile pass)

**parent pid 3299** — 64 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 20.1 | Layout 13, JavaScript 10, Idle 6, Graphics 3 | 0 / 22 / 13 | ipc 35, paint_layout 17, harness_diagnostics 7, array_buffer_copy 7 |
| Renderer | 10 | 5.6 | Graphics 7, Idle 1, Profiler 1 | 0 / 0 / 10 | ipc 10, webrender_render 8, webrender_sw_raster 7, poll_wait 1 |
| BgIOThreadPool #3 | 8 | 4.8 | Other 8, Idle 0 | 0 / 0 / 8 | ipc 8, poll_wait 0 |
| DOM Worker | 6 | 3.4 | JavaScript 5, Idle 1 | 0 / 0 / 6 | subprocess_pipe_io 6, worker_messaging 6, ipc 6, poll_wait 6 |
| WRRenderBackend#0 | 2 | 1.0 | Other 2 | 0 / 0 / 2 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 1 | 0.8 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| WRSceneBuilder#0 | 1 | 0.7 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| SwComposite | 0 | 0.3 | Other 0 | 0 / 0 / 0 | webrender_render 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `mozilla::AbsoluteContainingBlock::PrepareAbsoluteFrames(nsContainerFra` 3; `style::properties::cascade::iter_declarations [libxul.so]` 2; `[axiosozo-dev]` 2; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::emitProlog` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 1; `style::properties::generated::longhands::contain::cascade_property [li` 1; `alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_handle [libxul` 1

**tab pid 3973** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.9 | Idle 3, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `PollWrapper(_GPollFD*, unsigned int, int) [libxul.so]` 1

**tab pid 3414** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.3 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3461** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

