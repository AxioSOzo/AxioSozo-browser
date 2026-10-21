### gecko-debian scroll (profile pass)

**parent pid 8177** — 634 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 410 | 20.5 | Graphics 352, Idle 56, Profiler 1 | 0 / 0 / 410 | ipc 406, webrender_render 353, webrender_sw_raster 323, poll_wait 59 |
| GeckoMain | 97 | 4.9 | Idle 51, GC / CC 26, Other 8, JavaScript 4 | 0 / 5 / 92 | ipc 97, poll_wait 61, gc_cc 29, paint_layout 6 |
| WRRenderBackend#0 | 47 | 2.4 | Other 47 | 0 / 0 / 47 | webrender_render 1, memcpy_memset 1, poll_wait 0 |
| SwComposite | 33 | 1.6 | Other 33 | 0 / 0 / 33 | webrender_render 33, poll_wait 30, webrender_sw_raster 3, memcpy_memset 3 |
| Compositor | 24 | 1.2 | Idle 23, Other 0, Profiler 0 | 0 / 0 / 24 | ipc 24, poll_wait 23, webrender_render 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 16 | 0.8 | Other 16, Profiler 0 | 0 / 0 / 16 | webrender_scene 16, webrender_render 0, gc_cc 0 |
| IPC I/O Parent | 6 | 0.3 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 57; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `[axiosozo-dev]` 2; `zen::nsZenWindowDragUtils::AddRef() [libxul.so]` 2; `nsContentUtils::WrapNative(JSContext*, nsISupports*, nsWrapperCache*, ` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScriptData*, ` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1

**tab pid 8424** — 76 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 3.3 | Idle 50, Other 6, Graphics 4, Layout 2 | 0 / 2 / 63 | ipc 65, poll_wait 52, paint_layout 8, harness_diagnostics 2 |
| IPC I/O Child | 10 | 0.5 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 52; `nsWifiMonitor::AddRef() [libxul.so]` 1; `js::gc::PretenuringNursery::canCreateAllocSite() [libxul.so]` 1; `poll [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 1; `__syscall_cancel [libc.so.6]` 1

**tab pid 8361** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 8342** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

