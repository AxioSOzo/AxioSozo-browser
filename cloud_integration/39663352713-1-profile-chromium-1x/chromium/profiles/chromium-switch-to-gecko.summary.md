### chromium switch-to-gecko (profile pass)

**parent pid 3349** — 69 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 19.6 | JavaScript 15, Layout 10, Idle 5, DOM 2 | 3 / 21 / 11 | ipc 35, paint_layout 16, harness_diagnostics 9, array_buffer_copy 7 |
| Renderer | 11 | 6.0 | Graphics 9, Idle 2 | 0 / 0 / 11 | ipc 11, webrender_render 9, webrender_sw_raster 9, poll_wait 2 |
| DOM Worker | 9 | 4.9 | JavaScript 8, Idle 0 | 0 / 0 / 9 | subprocess_pipe_io 9, worker_messaging 9, ipc 9, js_ctypes 8 |
| BgIOThreadPool #2 | 7 | 3.9 | Other 7, Idle 0 | 0 / 0 / 7 | ipc 7, poll_wait 0 |
| Compositor | 2 | 1.1 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.9 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 1 | 0.7 | Other 1 | 0 / 0 / 1 | webrender_scene 1 |
| SwComposite | 1 | 0.4 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 0, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `poll [libc.so.6]` 5; `style::properties::cascade::Declarations::note_declaration [libxul.so]` 2; `js::jit::MacroAssemblerX86Shared::~MacroAssemblerX86Shared() [libxul.s` 2; `[unknown]` 2; `willShowFormattedMixedContentProtocol (moz-src:///browser/components/u` 2; `IntrinsicSizeOffsets(nsIFrame*, int, bool) [libxul.so]` 2; `core::ptr::drop_in_place<style::gecko::pseudo_element::PseudoElement> ` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 4039** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.7 | Idle 2, Other 0, Layout 0, Graphics 0 | 0 / 0 / 3 | ipc 3, poll_wait 2, paint_layout 1, subprocess_pipe_io 0 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsIFrame*) [l` 0; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, mozilla::W` 0; `[]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0; `nsWebBrowser::AddRef() [libxul.so]` 0; `nsIFrame::GetClipPropClipRect(nsStyleDisplay const*, nsStyleEffects co` 0

**tab pid 3455** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3508** — 0 ms CPU in the window

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

