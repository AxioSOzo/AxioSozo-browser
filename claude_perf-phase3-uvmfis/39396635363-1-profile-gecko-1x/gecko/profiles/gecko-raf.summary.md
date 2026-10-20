### gecko raf (profile pass)

**parent pid 3048** — 537 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 302 | 9.7 | Graphics 211, Idle 91, Other 1 | 0 / 0 / 302 | ipc 299, webrender_render 211, webrender_sw_raster 192, poll_wait 94 |
| GeckoMain | 57 | 1.8 | GC / CC 28, Idle 18, JavaScript 5, Layout 2 | 2 / 3 / 51 | ipc 57, gc_cc 31, poll_wait 20, harness_diagnostics 4 |
| WRRenderBackend#0 | 56 | 1.8 | Other 56 | 0 / 0 / 56 | webrender_render 0, poll_wait 0, array_buffer_copy 0 |
| Compositor | 44 | 1.4 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 44 | ipc 44, poll_wait 43, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 41 | 1.3 | Other 41 | 0 / 0 / 41 | webrender_scene 41, webrender_render 1, poll_wait 1, memcpy_memset 0 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 15, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `XRE_IsParentProcess() [libxul.so]` 1; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handle<js::Prop` 1; `recvmsg [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JS::Value>*, char const*, void*) con` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1

**tab pid 3312** — 154 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 136 | 4.4 | Idle 92, Graphics 17, Layout 9, Other 8 | 0 / 6 / 129 | ipc 130, poll_wait 93, paint_layout 33, harness_diagnostics 3 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 92; `sendmsg [libc.so.6]` 4; `[]` 3; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 1; `getcontext [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `nsXPTInterfaceInfo::GetMethodInfo(unsigned short, nsXPTMethodInfo cons` 1

**tab pid 3396** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3208** — 1 ms CPU in the window

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

