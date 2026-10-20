### chromium-2x switch-to-gecko (profile pass)

**parent pid 3347** — 155 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 58 | 0.4 | Idle 17, Layout 16, JavaScript 10, Graphics 7 | 0 / 22 / 36 | ipc 58, paint_layout 28, poll_wait 17, array_buffer_copy 9 |
| Renderer | 57 | 0.4 | Graphics 53, Idle 3 | 0 / 0 / 57 | webrender_render 53, ipc 53, webrender_sw_raster 49, poll_wait 1 |
| DOM Worker | 19 | 0.1 | JavaScript 13, Other 4, Idle 2, GC / CC 1 | 0 / 0 / 19 | subprocess_pipe_io 19, worker_messaging 19, ipc 19, poll_wait 14 |
| IPC I/O Parent | 6 | 0.0 | Idle 5, Other 1 | 0 / 0 / 6 | poll_wait 5, ipc 1 |
| SwComposite | 5 | 0.0 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 4, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 4 | 0.0 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 1, webrender_render 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 17; `nsImageFrame::GetCurrentRequest() const [libxul.so]` 5; `servo_arc::Arc<T>::drop_slow [libxul.so]` 2; `style::properties::cascade::Cascade::cascade_custom_property [libxul.s` 1; `style::properties::cascade::iter_declarations [libxul.so]` 1; `xpc::GlobalProperties::Define(JSContext*, JS::Handle<JSObject*>) [libx` 1; `nsTHashtable<nsBaseHashtableET<nsPtrHashKey<void const>, void*> >::s_H` 1; `mojo::core::ports::Node::GetStatus(mojo::core::ports::PortRef const&, ` 1

**tab pid 4001** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Graphics 0, Other 0, Profiler 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 1, memcpy_memset 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::StyleGenericImage<mozilla::StyleGenericGradient<mozilla::Styl` 0; `mozilla::detail::EventQueueInternal<16ul>::PutEvent(already_AddRefed<n` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0

**tab pid 3491** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0

**tab pid 3512** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[libglib-2.0.so.0]` 0

