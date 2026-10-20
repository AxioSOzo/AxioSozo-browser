### gecko-debian raf-nosampler (profile pass)

**parent pid 8124** — 549 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 317 | 10.5 | Graphics 224, Idle 94 | 0 / 0 / 317 | ipc 313, webrender_render 224, webrender_sw_raster 206, poll_wait 98 |
| WRRenderBackend#0 | 62 | 2.0 | Other 62 | 0 / 0 / 62 | webrender_render 1, poll_wait 0, array_buffer_copy 0 |
| GeckoMain | 47 | 1.5 | GC / CC 32, Idle 11, JavaScript 2, Other 1 | 0 / 2 / 45 | ipc 47, gc_cc 32, poll_wait 12, harness_diagnostics 2 |
| WRSceneBuilder#0 | 45 | 1.5 | Other 45 | 0 / 0 / 45 | webrender_scene 45, webrender_render 3, poll_wait 1, memcpy_memset 1 |
| Compositor | 44 | 1.5 | Idle 43, Other 1, Profiler 0 | 0 / 0 / 44 | ipc 44, poll_wait 43, webrender_render 0, paint_layout 0 |
| SwComposite | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 13, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 12; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 2; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1

**tab pid 8377** — 170 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 152 | 5.0 | Idle 94, Graphics 21, Layout 14, Other 9 | 0 / 4 / 148 | ipc 144, poll_wait 95, paint_layout 43, gc_cc 7 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 98; `[]` 3; `getcontext [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libxul.so]` 1; `gfxFontSrcPrincipal::~gfxFontSrcPrincipal() [libxul.so]` 1

**tab pid 8468** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8293** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

