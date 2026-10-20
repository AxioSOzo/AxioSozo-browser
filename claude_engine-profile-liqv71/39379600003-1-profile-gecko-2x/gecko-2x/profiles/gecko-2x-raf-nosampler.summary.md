### gecko-2x raf-nosampler (profile pass)

**parent pid 3036** — 542 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 331 | 10.9 | Graphics 248, Idle 83, Other 0 | 0 / 0 / 331 | ipc 328, webrender_render 248, webrender_sw_raster 223, poll_wait 91 |
| WRRenderBackend#0 | 51 | 1.7 | Other 51 | 0 / 0 / 51 | webrender_render 1, poll_wait 0, memcpy_memset 0, array_buffer_copy 0 |
| SwComposite | 49 | 1.6 | Other 49 | 0 / 0 / 49 | webrender_render 49, poll_wait 46, webrender_sw_raster 3, memcpy_memset 3 |
| Compositor | 42 | 1.4 | Idle 41, Other 1, Profiler 0 | 0 / 0 / 42 | ipc 42, poll_wait 41, paint_layout 0, webrender_render 0 |
| WRSceneBuilder#0 | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_scene 40, webrender_render 1, memcpy_memset 0, paint_layout 0 |
| GeckoMain | 12 | 0.4 | Idle 8, JavaScript 3, DOM 1, Other 0 | 0 / 3 / 9 | ipc 12, poll_wait 8, gc_cc 3, harness_diagnostics 3 |
| IPC I/O Parent | 10 | 0.3 | Idle 9, Other 0 | 0 / 0 / 10 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 8; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*> const, mo` 1; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 1; `mprotect [libc.so.6]` 1; `JS::Compartment::firstGlobal() const [libxul.so]` 1; `prettyObject (chrome://remote/content/shared/Format.sys.mjs:81:24)[21]` 0; `recvmsg [libc.so.6]` 0; `[libgdk-3.so.0]` 0

**tab pid 3278** — 149 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 131 | 4.3 | Idle 91, Graphics 17, Layout 10, GC / CC 5 | 0 / 2 / 129 | ipc 126, poll_wait 91, paint_layout 31, gc_cc 6 |
| IPC I/O Child | 17 | 0.5 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 91; `sendmsg [libc.so.6]` 1; `[]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `[linux-vdso.so.1]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsDisplayList` 1; `getcontext [libc.so.6]` 1

**tab pid 3290** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0

**tab pid 3180** — 1 ms CPU in the window

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

