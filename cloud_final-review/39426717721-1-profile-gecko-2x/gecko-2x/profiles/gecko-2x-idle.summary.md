### gecko-2x idle (profile pass)

**parent pid 3036** — 59 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 51 | 2.4 | GC / CC 26, Idle 9, Other 9, JavaScript 6 | 0 / 6 / 45 | ipc 51, gc_cc 30, poll_wait 14, harness_diagnostics 4 |
| Compositor | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| DOM Worker | 1 | 0.1 | Idle 1, Other 1 | 0 / 0 / 1 | worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1 |
| Renderer | 1 | 0.1 | Idle 1, Graphics 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, memcpy_memset 0, webrender_render 0 |
| SwComposite | 1 | 0.0 | Other 1 | 0 / 0 / 1 | webrender_render 1, memcpy_memset 1, webrender_sw_raster 1, poll_wait 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `recvmsg [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `mprotect [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1

**tab pid 3304** — 32 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 1.3 | Idle 16, GC / CC 5, JavaScript 2, Other 2 | 0 / 2 / 24 | ipc 25, poll_wait 18, gc_cc 7, harness_diagnostics 2 |
| IPC I/O Child | 5 | 0.2 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 16; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [libxul.so]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `XPCNativeInterface::NewInstance(JSContext*, IID2NativeInterfaceMap*, n` 1; `CCGraphBuilder::DescribeRefCountedNode(unsigned long, char const*) [li` 1; `js::SharedImmutableStringsCache::getOrCreate(std::unique_ptr<char [], ` 1; `mozilla::HashSet<void*, mozilla::PointerHasher<void*>, js::SystemAlloc` 1; `read [libc.so.6]` 1

**tab pid 3181** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `<std::sys::sync::once::futex::Once>::call [libxul.so]` 0

**tab pid 3395** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[]` 0

