### gecko raf-nosampler (profile pass)

**parent pid 3048** — 484 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 307 | 10.1 | Graphics 220, Idle 86, Other 1 | 0 / 0 / 307 | ipc 306, webrender_render 220, webrender_sw_raster 202, poll_wait 92 |
| WRRenderBackend#0 | 53 | 1.7 | Other 53 | 0 / 0 / 53 | webrender_render 0, webrender_scene 0 |
| Compositor | 43 | 1.4 | Idle 42, Other 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 39 | 1.3 | Other 39 | 0 / 0 / 39 | webrender_scene 39, webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| GeckoMain | 13 | 0.4 | Idle 9, JavaScript 4, DOM 1, Other 0 | 0 / 3 / 10 | ipc 13, poll_wait 9, array_buffer_copy 3, gc_cc 3 |
| SwComposite | 12 | 0.4 | Other 12 | 0 / 0 / 12 | webrender_render 12, poll_wait 11, webrender_sw_raster 0, memcpy_memset 0 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 9; `profiler_feature_active(unsigned int) [libxul.so]` 1; `PerformPromiseThen(JSContext*, JS::Handle<js::PromiseObject*>, JS::Han` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1; `js::jit::CacheIRWriter::addStubField(unsigned long, js::jit::StubField` 1; `mozilla::dom::JSIPCValue::MaybeDestroy() [libxul.so]` 1; `recvmsg [libc.so.6]` 0; `[libgdk-3.so.0]` 0

**tab pid 3312** — 144 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 127 | 4.2 | Idle 91, Graphics 14, Layout 8, GC / CC 5 | 0 / 2 / 125 | ipc 123, poll_wait 93, paint_layout 28, gc_cc 5 |
| IPC I/O Child | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 91; `[]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `sendmsg [libc.so.6]` 2; `mojo::core::ports::Node::PrepareToForwardUserMessage(mojo::core::ports` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1; `mozilla::wr::DisplayListBuilder::GetSpatialIdForDefinedLayer(mozilla::` 1

**tab pid 3229** — 1 ms CPU in the window

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

**tab pid 3396** — 1 ms CPU in the window

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

