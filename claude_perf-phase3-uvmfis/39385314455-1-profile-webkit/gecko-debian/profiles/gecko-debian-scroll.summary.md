### gecko-debian scroll (profile pass)

**parent pid 8069** — 1976 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 640 | 31.9 | Idle 260, JavaScript 189, DOM 82, GC / CC 68 | 49 / 274 / 316 | worker_messaging 637, ipc 634, poll_wait 263, gc_cc 111 |
| Renderer | 620 | 30.9 | Graphics 451, Idle 168, Profiler 2 | 0 / 0 / 620 | ipc 615, webrender_render 453, webrender_sw_raster 424, poll_wait 168 |
| GeckoMain | 506 | 25.2 | Idle 161, JavaScript 139, DOM 104, Other 66 | 20 / 192 / 294 | ipc 505, gc_cc 218, poll_wait 196, array_buffer_copy 98 |
| WRRenderBackend#0 | 73 | 3.6 | Other 73 | 0 / 0 / 73 | webrender_render 2, poll_wait 0, memcpy_memset 0, array_buffer_copy 0 |
| SwComposite | 51 | 2.5 | Other 51 | 0 / 0 / 51 | webrender_render 51, poll_wait 47, webrender_sw_raster 4, memcpy_memset 4 |
| Compositor | 28 | 1.4 | Idle 27, Other 0, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 0, webrender_scene 0 |
| WRSceneBuilder#0 | 23 | 1.2 | Other 23, Profiler 0 | 0 / 0 / 23 | webrender_scene 23, webrender_render 1, poll_wait 0, paint_layout 0 |
| Socket Thread | 13 | 0.6 | Other 13, Profiler 0 | 0 / 0 / 13 | ipc 13, poll_wait 11 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 181; `[unknown]` 23; `[axiosozo-dev]` 21; `__memmove_evex_unaligned_erms [libc.so.6]` 10; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 7; `js::jit::GetNativeDataPropertyPure(JSContext*, JSObject*, JS::Property` 6

**tab pid 8325** — 103 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 89 | 4.4 | Idle 61, Graphics 14, Other 8, JavaScript 3 | 0 / 2 / 87 | ipc 83, poll_wait 61, paint_layout 17, gc_cc 2 |
| IPC I/O Child | 14 | 0.7 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 14 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 61; `[]` 3; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(nsIFrame*,` 2; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const [libxul.so` 1; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayListBuilder` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `profiler_mark_thread_asleep() [libxul.so]` 1; `mozilla::layers::PWebRenderBridgeChild::SendSetDisplayList(mozilla::la` 1

**tab pid 8262** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 8157** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2

