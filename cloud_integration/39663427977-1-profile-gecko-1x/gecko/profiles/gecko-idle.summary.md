### gecko idle (profile pass)

**parent pid 2968** — 56 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 2.4 | GC / CC 30, Other 7, JavaScript 7, Idle 6 | 1 / 5 / 44 | ipc 50, gc_cc 36, poll_wait 10, harness_diagnostics 3 |
| DOM Worker | 2 | 0.1 | Other 1, Idle 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1 |
| Compositor | 2 | 0.1 | Other 1, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 0 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 0 | ipc 0, memcpy_memset 0, webrender_render 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 3; `recvmsg [libc.so.6]` 2; `write [libc.so.6]` 2; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 2; `mprotect [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1

**tab pid 3222** — 32 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 1.2 | Idle 16, GC / CC 6, JavaScript 2, Other 1 | 0 / 3 / 24 | ipc 25, poll_wait 17, gc_cc 7, harness_diagnostics 2 |
| IPC I/O Child | 5 | 0.2 | Idle 5 | 0 / 0 / 5 | poll_wait 5 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 17; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `GIFFT_LabeledTimingDistributionStart [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNativeMember*` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1

**tab pid 3308** — 1 ms CPU in the window

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

**tab pid 3151** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0

