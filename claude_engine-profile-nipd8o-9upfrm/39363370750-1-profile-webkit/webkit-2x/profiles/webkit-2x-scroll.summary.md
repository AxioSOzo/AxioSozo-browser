### webkit-2x scroll (profile pass)

**parent pid 8720** — 4731 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2162 | 12.5 | Idle 1039, JavaScript 522, Other 192, GC / CC 183 | 254 / 528 / 1380 | ipc 2146, poll_wait 1168, paint_layout 446, gc_cc 421 |
| DOM Worker | 1301 | 7.5 | JavaScript 1153, Other 87, Profiler 34, GC / CC 28 | 0 / 0 / 1301 | subprocess_pipe_io 1301, worker_messaging 1298, ipc 1298, js_ctypes 936 |
| Renderer | 576 | 3.3 | Graphics 334, Idle 242 | 0 / 0 / 576 | ipc 576, webrender_render 334, webrender_sw_raster 288, poll_wait 255 |
| SwComposite | 471 | 2.7 | Other 471 | 0 / 0 / 471 | webrender_render 471, webrender_sw_raster 256, poll_wait 209, memcpy_memset 60 |
| Timer | 119 | 0.7 | Other 119, Profiler 0 | 0 / 0 / 119 | ipc 119, poll_wait 118, memcpy_memset 0 |
| WRRenderBackend#0 | 48 | 0.3 | Other 48 | 0 / 0 / 48 | webrender_render 1, poll_wait 0, memcpy_memset 0, webrender_scene 0 |
| Compositor | 32 | 0.2 | Idle 31, Other 1 | 0 / 0 / 32 | ipc 32, poll_wait 31, webrender_render 0 |
| WRSceneBuilder#0 | 8 | 0.0 | Other 8 | 0 / 0 / 8 | webrender_scene 8 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1128; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 240; `__memmove_evex_unaligned_erms [libc.so.6]` 205; `[unknown]` 33; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 32; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 28; `__lll_lock_wake [libc.so.6]` 20; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 17

**tab pid 8924** — 13 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 11 | 0.1 | GC / CC 7, Idle 4, Other 0 | 0 / 0 / 11 | ipc 9, gc_cc 7, poll_wait 5 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1; `__strlen_evex [libc.so.6]` 0

**tab pid 8810** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.0 | GC / CC 6, Idle 1, Other 0 | 0 / 0 / 8 | gc_cc 6, ipc 6, poll_wait 2, memcpy_memset 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `__syscall_cancel_arch [libc.so.6]` 1; `js::detail::OrderedHashTableImpl<js::PreBarriered<js::HashableValue>, ` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 1; `mmap64 [libc.so.6]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[]` 0

**tab pid 8882** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.0 | Idle 4, GC / CC 1, Other 0 | 0 / 0 / 6 | poll_wait 4, ipc 4, gc_cc 1 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[linux-vdso.so.1]` 1; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

