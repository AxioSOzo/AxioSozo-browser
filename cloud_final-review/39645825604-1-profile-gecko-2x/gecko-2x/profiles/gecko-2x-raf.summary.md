### gecko-2x raf (profile pass)

**parent pid 2925** — 277 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 124 | 4.0 | Idle 86, Graphics 37, Other 1 | 0 / 0 / 124 | ipc 124, poll_wait 86, webrender_render 38, webrender_sw_raster 24 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 0, memcpy_memset 0, poll_wait 0 |
| WRSceneBuilder#0 | 28 | 0.9 | Other 28 | 0 / 0 / 28 | webrender_scene 28, webrender_render 0, poll_wait 0, memcpy_memset 0 |
| SwComposite | 28 | 0.9 | Other 28 | 0 / 0 / 28 | webrender_render 28, poll_wait 28, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 25 | 0.8 | Idle 25, Other 0 | 0 / 0 / 25 | ipc 25, poll_wait 25, paint_layout 0, webrender_render 0 |
| GeckoMain | 22 | 0.7 | Idle 14, Other 2, JavaScript 2, Layout 1 | 0 / 2 / 20 | ipc 22, poll_wait 15, paint_layout 3, harness_diagnostics 1 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| WRSceneBuilderLP#0 | 4 | 0.1 | Other 4 | 0 / 0 / 4 |  |

Main thread, top self: `poll [libc.so.6]` 14; `madvise [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, nsPresCont` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAndP` 1; `js::GetFirstSubsumedFrame(JSContext*, JSPrincipals*, JS::Handle<js::Sa` 1; `js::jit::CacheIRStubKey::match(js::jit::CacheIRStubKey const&, js::jit` 1; `recvmsg [libc.so.6]` 1

**tab pid 3182** — 110 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 99 | 3.2 | Idle 71, Graphics 7, Other 7, Layout 5 | 0 / 4 / 95 | ipc 92, poll_wait 71, paint_layout 14, gc_cc 7 |
| IPC I/O Child | 9 | 0.3 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 70; `[]` 4; `[linux-vdso.so.1]` 1; `nsTimer::Cancel() [libxul.so]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `JS_DefineFunctions(JSContext*, JS::Handle<JSObject*>, JSFunctionSpec c` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1

**tab pid 3071** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3110** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `mozilla::ScheduleTimedOut(nsITimer*, void*) [libxul.so]` 0

