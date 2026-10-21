### webkit key (profile pass)

**parent pid 7154** — 965 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 589 | 16.1 | Idle 230, GC / CC 95, JavaScript 92, Layout 47 | 15 / 151 / 424 | ipc 585, poll_wait 273, gc_cc 190, paint_layout 97 |
| DOM Worker | 215 | 5.9 | JavaScript 211, Other 3, Profiler 2 | 0 / 0 / 215 | subprocess_pipe_io 215, worker_messaging 215, ipc 215, js_ctypes 206 |
| Renderer | 52 | 1.4 | Graphics 37, Idle 15 | 0 / 0 / 52 | ipc 52, webrender_render 37, webrender_sw_raster 30, poll_wait 19 |
| Timer | 33 | 0.9 | Other 33 | 0 / 0 / 33 | ipc 33, poll_wait 33 |
| SwComposite | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 18, poll_wait 15, webrender_sw_raster 3, memcpy_memset 3 |
| Compositor | 17 | 0.5 | Idle 15, Other 2 | 0 / 0 / 17 | ipc 17, poll_wait 15, memcpy_memset 2, webrender_render 0 |
| WRRenderBackend#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_render 0, poll_wait 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9, Graphics 0 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 0, paint_layout 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 13; `[axiosozo-dev]` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 7; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 5

**tab pid 7242** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, Other 0, DOM 0 | 0 / 0 / 6 | ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `JSStructuredCloneWriter::writeTransferMap() [libxul.so]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[4` 0; `nsWindowRoot::Release() [libxul.so]` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 0; `JSStructuredCloneReader::readObjectField(JS::Handle<JSObject*>, JS::Ha` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0

**tab pid 7324** — 1 ms CPU in the window

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

**tab pid 7351** — 1 ms CPU in the window

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

