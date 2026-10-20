### gecko raf-nosampler (profile pass)

**parent pid 3041** — 535 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 337 | 11.1 | Graphics 242, Idle 93, Profiler 1, Other 0 | 0 / 0 / 337 | ipc 333, webrender_render 243, webrender_sw_raster 223, poll_wait 99 |
| WRRenderBackend#0 | 65 | 2.1 | Other 65 | 0 / 0 / 65 | webrender_render 1, memcpy_memset 0, poll_wait 0, webrender_sw_raster 0 |
| WRSceneBuilder#0 | 47 | 1.5 | Other 47, Profiler 0 | 0 / 0 / 47 | webrender_scene 47, webrender_render 3, poll_wait 0, array_buffer_copy 0 |
| Compositor | 42 | 1.4 | Idle 42, Other 1, Profiler 0 | 0 / 0 / 42 | ipc 42, poll_wait 42, paint_layout 0, webrender_render 0 |
| GeckoMain | 14 | 0.5 | Idle 10, Other 2, JavaScript 2 | 1 / 1 / 12 | ipc 14, poll_wait 11, harness_diagnostics 2, gc_cc 2 |
| SwComposite | 11 | 0.4 | Other 11 | 0 / 0 / 11 | webrender_render 11, poll_wait 11, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 11; `nsTimerImpl::InitHighResolutionWithNamedFuncCallback(void (*)(nsITimer` 1; `#log (chrome://remote/content/marionette/server.sys.mjs:209:7)[20]` 1; `mprotect [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `recvmsg [libc.so.6]` 0; `mozilla::widget::KeymapWrapper::FilterEvents(void*, _GdkEvent*, void*)` 0; `[libgdk-3.so.0]` 0

**tab pid 3294** — 169 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 152 | 5.0 | Idle 96, Graphics 23, Layout 17, Other 8 | 0 / 5 / 147 | ipc 144, poll_wait 98, paint_layout 45, gc_cc 3 |
| IPC I/O Child | 16 | 0.5 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 96; `[]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `mozilla::nsDisplayList::PaintRoot(mozilla::nsDisplayListBuilder*, gfxC` 1; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, unsigned int` 1; `void mozilla::nsDisplayList::Sort<mozilla::ZSortItem, mozilla::ZOrderC` 1

**tab pid 3212** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3296** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0

