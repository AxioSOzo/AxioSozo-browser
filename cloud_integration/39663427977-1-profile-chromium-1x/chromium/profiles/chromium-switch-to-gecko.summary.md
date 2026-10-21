### chromium switch-to-gecko (profile pass)

**parent pid 3461** — 95 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 22.8 | Layout 20, JavaScript 16, Idle 4, Graphics 3 | 3 / 28 / 17 | ipc 48, paint_layout 24, gc_cc 14, harness_diagnostics 10 |
| DOM Worker | 14 | 6.8 | JavaScript 14, Idle 0 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 14 |
| Renderer | 14 | 6.6 | Graphics 13, Idle 1 | 0 / 0 / 14 | ipc 13, webrender_render 13, webrender_sw_raster 10, poll_wait 1 |
| BgIOThreadPool #1 | 10 | 4.7 | Other 10, Idle 0 | 0 / 0 / 10 | ipc 10, poll_wait 0 |
| Compositor | 3 | 1.4 | Idle 2, Other 1 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 0 |
| WRRenderBackend#0 | 2 | 0.9 | Other 2 | 0 / 0 / 2 |  |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |
| SwComposite | 1 | 0.4 | Other 1 | 0 / 0 / 1 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `nsContentUtils::GetCurrentJSContext() [libxul.so]` 4; `poll [libc.so.6]` 4; `[axiosozo-dev]` 3; `nsIFrame::IsBlockContainer() const [libxul.so]` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 2; `recvmsg [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsTHashtable<nsBaseHashtableET<nsCStringHashKey, std::unique_ptr<mozil` 1

**tab pid 4148** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 2.3 | Idle 3, Graphics 1, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.5 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::dom::Document::GetDocShell() const [libxul.so]` 1; `nsIFrame::Combines3DTransformWithAncestors() const [libxul.so]` 0; `non-virtual thunk to nsGlobalWindowInner::GetExistingDebuggerNotificat` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advance(mozilla:` 0

**tab pid 3551** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**utility pid 3694** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

