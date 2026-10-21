### gecko raf (profile pass)

**parent pid 2911** — 481 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 274 | 9.0 | Graphics 180, Idle 94, Profiler 1, Other 0 | 0 / 0 / 274 | ipc 271, webrender_render 181, webrender_sw_raster 152, poll_wait 100 |
| WRRenderBackend#0 | 60 | 2.0 | Other 60 | 0 / 0 / 60 | memcpy_memset 0, array_buffer_copy 0, webrender_render 0 |
| WRSceneBuilder#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_scene 43, webrender_render 1, array_buffer_copy 0, poll_wait 0 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, webrender_render 0, paint_layout 0 |
| GeckoMain | 24 | 0.8 | Idle 16, Graphics 2, Other 2, JavaScript 1 | 0 / 2 / 22 | ipc 24, poll_wait 17, paint_layout 3, harness_diagnostics 1 |
| SwComposite | 22 | 0.7 | Other 22 | 0 / 0 / 22 | webrender_render 22, poll_wait 21, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 17; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::nsDisplayIte` 1; `nsLayoutUtils::GetDisplayListParent(nsIFrame*) [libxul.so]` 1; `void mozilla::WriteULEB128<unsigned long, mozilla::ProfileBufferEntryW` 1; `WriteStructuredClone(JSContext*, JS::Handle<JS::Value>, JSStructuredCl` 1; `[unknown]` 0; `nsIFrame::ISizeComputationResult nsIFrame::ComputeISizeValue<mozilla::` 0; `XPCCallContext::CanCallNow() [libxul.so]` 0

**tab pid 3176** — 171 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 156 | 5.1 | Idle 97, Graphics 19, Layout 14, Other 8 | 0 / 9 / 147 | ipc 146, poll_wait 99, paint_layout 40, gc_cc 10 |
| IPC I/O Child | 14 | 0.5 | Idle 14, Other 0 | 0 / 0 / 14 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 98; `[]` 4; `sendmsg [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3092** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3265** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

