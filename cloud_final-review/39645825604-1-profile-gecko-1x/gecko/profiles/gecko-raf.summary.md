### gecko raf (profile pass)

**parent pid 3126** — 650 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 350 | 11.2 | Graphics 259, Idle 90, Profiler 1 | 0 / 0 / 350 | ipc 346, webrender_render 260, webrender_sw_raster 224, poll_wait 94 |
| WRRenderBackend#0 | 80 | 2.6 | Other 80 | 0 / 0 / 80 | webrender_render 2, poll_wait 1, memcpy_memset 0 |
| GeckoMain | 69 | 2.2 | GC / CC 31, Idle 25, JavaScript 5, Layout 4 | 0 / 5 / 64 | ipc 69, gc_cc 34, poll_wait 28, paint_layout 6 |
| WRSceneBuilder#0 | 54 | 1.7 | Other 54 | 0 / 0 / 54 | webrender_scene 54, webrender_render 1, poll_wait 0, paint_layout 0 |
| Compositor | 50 | 1.6 | Idle 48, Other 2 | 0 / 0 / 50 | ipc 50, poll_wait 48, paint_layout 1, webrender_render 1 |
| SwComposite | 21 | 0.7 | Other 21 | 0 / 0 / 21 | webrender_render 21, poll_wait 20, memcpy_memset 1, webrender_sw_raster 1 |
| IPC I/O Parent | 12 | 0.4 | Idle 12, Other 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 | memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `[axiosozo-dev]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `js::ModuleNamespaceObject::ProxyHandler::trace(JSTracer*, JSObject*) c` 2; `mozilla::dom::binding_detail::ReflectedHTMLAttributeSlots<1ul, 4ul, 7u` 2

**tab pid 3359** — 239 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 214 | 6.9 | Idle 103, Graphics 42, Layout 25, Profiler 16 | 0 / 12 / 202 | ipc 200, poll_wait 105, paint_layout 86, gc_cc 9 |
| IPC I/O Child | 19 | 0.6 | Idle 19, Other 0 | 0 / 0 / 19 | poll_wait 19, ipc 0 |
| Timer | 6 | 0.2 | Other 6 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 104; `__lll_lock_wait [libc.so.6]` 5; `sendmsg [libc.so.6]` 4; `getcontext [libc.so.6]` 4; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2

**tab pid 3302** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

**tab pid 3263** — 1 ms CPU in the window

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

