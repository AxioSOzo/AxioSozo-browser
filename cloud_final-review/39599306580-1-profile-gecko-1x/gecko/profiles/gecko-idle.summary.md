### gecko idle (profile pass)

**parent pid 3086** — 59 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 52 | 2.5 | GC / CC 30, Other 8, JavaScript 7, Idle 5 | 2 / 6 / 44 | ipc 52, gc_cc 36, poll_wait 8, harness_diagnostics 5 |
| DOM Worker | 2 | 0.1 | Other 1, Idle 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 1, poll_wait 0 |
| Compositor | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Renderer | 0 | 0.0 | Graphics 0, Idle 0 | 0 / 0 / 0 | ipc 0, canvas_2d 0, webrender_render 0, poll_wait 0 |
| WRSceneBuilder#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_scene 0 |

Main thread, top self: `poll [libc.so.6]` 7; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**, char con` 3; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `recvmsg [libc.so.6]` 1

**tab pid 3315** — 39 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 32 | 1.5 | Idle 20, GC / CC 5, JavaScript 3, Other 2 | 0 / 4 / 28 | ipc 31, poll_wait 21, gc_cc 8, array_buffer_copy 3 |
| IPC I/O Child | 6 | 0.3 | Idle 6 | 0 / 0 / 6 | poll_wait 6 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 21; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handle<js::Prop` 1; `prctl [libc.so.6]` 1; `__strlen_avx2 [libc.so.6]` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(js::fronte` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObjectEdge(JSObj` 1

**tab pid 3408** — 1 ms CPU in the window

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

**tab pid 3405** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

