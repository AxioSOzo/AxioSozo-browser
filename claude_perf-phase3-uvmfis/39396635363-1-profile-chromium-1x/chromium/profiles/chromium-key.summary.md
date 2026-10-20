### chromium key (profile pass)

**parent pid 3348** — 825 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 435 | 11.8 | Idle 162, JavaScript 74, GC / CC 59, Layout 41 | 9 / 134 / 291 | ipc 435, poll_wait 203, gc_cc 151, paint_layout 82 |
| DOM Worker | 233 | 6.3 | JavaScript 225, Profiler 5, Other 2 | 0 / 0 / 233 | subprocess_pipe_io 233, worker_messaging 233, ipc 233, js_ctypes 219 |
| Renderer | 52 | 1.4 | Graphics 36, Idle 16 | 0 / 0 / 52 | ipc 50, webrender_render 36, webrender_sw_raster 32, poll_wait 17 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 36 |
| Compositor | 15 | 0.4 | Idle 14, Other 1, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, memcpy_memset 0, webrender_render 0 |
| SwComposite | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 12, webrender_sw_raster 2, memcpy_memset 2 |
| WRRenderBackend#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 |  |
| WRSceneBuilder#0 | 8 | 0.2 | Other 7, Graphics 1 | 0 / 0 / 8 | webrender_scene 8, webrender_sw_raster 1, poll_wait 1, webrender_render 1 |

Main thread, top self: `poll [libc.so.6]` 163; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 18; `[axiosozo-dev]` 11; `[unknown]` 9; `recvmsg [libc.so.6]` 9; `mprotect [libc.so.6]` 5; `__memmove_avx_unaligned_erms [libc.so.6]` 5; `AnchorResolvedMarginHelper::FromUnresolved(mozilla::StyleGenericMargin` 4

**tab pid 3439** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, DOM 0 | 0 / 1 / 6 | ipc 6, poll_wait 6, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[]` 0; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, JS::Value c` 0; `js::GetElementsWithAdder(JSContext*, JS::Handle<JSObject*>, JS::Handle` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 0

**tab pid 3526** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 0

**tab pid 4190** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

