### gecko idle (profile pass)

**parent pid 3126** — 65 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 58 | 2.7 | GC / CC 37, Idle 7, Other 7, JavaScript 6 | 0 / 7 / 51 | ipc 58, gc_cc 42, poll_wait 10, array_buffer_copy 3 |
| DOM Worker | 2 | 0.1 | Idle 1, Other 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, poll_wait 1, gc_cc 0 |
| Compositor | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| WRRenderBackend#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 2; `mozilla::EventListenerManager::MarkForCC() [libxul.so]` 2; `write [libc.so.6]` 2

**tab pid 3359** — 43 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 35 | 1.7 | Idle 25, GC / CC 6, Other 1, DOM 1 | 0 / 2 / 33 | ipc 34, poll_wait 27, gc_cc 6, harness_diagnostics 2 |
| IPC I/O Child | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 26; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `JS_WrapObject(JSContext*, JS::MutableHandle<JSObject*>) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `xpc::OpaqueXrayTraits::enumerateNames(JSContext*, JS::Handle<JSObject*` 1; `mozilla::TaskController::AddTask(already_AddRefed<mozilla::Task>) [lib` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<js::GetterSetter>(js:` 1; `XPCNativeWrapper::AttachNewConstructorObject(JSContext*, JS::Handle<JS` 1

**tab pid 3385** — 1 ms CPU in the window

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

**tab pid 3302** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `TimerThreadWrapper::RemoveTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0

