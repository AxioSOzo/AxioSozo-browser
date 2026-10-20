### chromium switch-to-gecko (profile pass)

**parent pid 3348** — 499 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BgIOThreadPool #1 | 333 | 2.2 | Other 333, Idle 1 | 0 / 0 / 333 | ipc 333, memcpy_memset 1, poll_wait 1 |
| GeckoMain | 69 | 0.5 | Idle 21, JavaScript 18, Layout 14, Other 6 | 2 / 25 / 43 | ipc 69, paint_layout 23, poll_wait 22, gc_cc 13 |
| DOM Worker | 61 | 0.4 | GC / CC 28, Other 19, JavaScript 11, Idle 2 | 0 / 0 / 61 | subprocess_pipe_io 61, worker_messaging 61, ipc 61, gc_cc 48 |
| Renderer | 16 | 0.1 | Graphics 13, Idle 3 | 0 / 0 / 16 | ipc 16, webrender_render 13, webrender_sw_raster 13, poll_wait 3 |
| IPC I/O Parent | 6 | 0.0 | Idle 5, Other 1 | 0 / 0 / 6 | poll_wait 5, ipc 1 |
| Compositor | 4 | 0.0 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 1, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 20; `__lll_lock_wait [libc.so.6]` 4; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::FramePrope` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `madvise [libc.so.6]` 2; `[unknown]` 1; `syscall [libc.so.6]` 1; `mozilla::dom::AbstractRange::MayCrossShadowBoundaryEndRef() const [lib` 1

**tab pid 3526** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 4, JavaScript 2, DOM 1, Other 0 | 0 / 3 / 4 | ipc 6, poll_wait 4, gc_cc 1, array_buffer_copy 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `[]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 0; `js::UnwrapOneCheckedDynamic(JS::Handle<JSObject*>, JSContext*, bool) [` 0; `mozilla::dom::DOMStringMap_Binding::DOMProxyHandler::get(JSContext*, J` 0; `[linux-vdso.so.1]` 0

**tab pid 3995** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 4, Profiler 1, Layout 0, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 4, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 0; `getcontext [libc.so.6]` 0; `JS::NewFunctionFromSpec(JSContext*, JSFunctionSpec const*, JS::Handle<` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message const&) [l` 0; `std::unique_ptr<mozilla::ProfileBufferChunk, std::default_delete<mozil` 0; `sendmsg [libc.so.6]` 0

**tab pid 3487** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `IPC::Message::WillBeRoutedExternally(mojo::core::ports::UserMessageEve` 0; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul.so]` 0

