### gecko key (profile pass)

**parent pid 2850** — 960 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 443 | 11.8 | Idle 145, JavaScript 76, DOM 71, Other 66 | 13 / 111 / 319 | ipc 443, poll_wait 189, gc_cc 157, array_buffer_copy 49 |
| DOM Worker | 418 | 11.1 | JavaScript 155, GC / CC 134, Idle 67, DOM 41 | 43 / 244 / 131 | worker_messaging 418, ipc 418, gc_cc 160, poll_wait 73 |
| Renderer | 23 | 0.6 | Idle 16, Graphics 7 | 0 / 0 / 23 | ipc 23, poll_wait 18, webrender_render 7, webrender_sw_raster 5 |
| Compositor | 20 | 0.5 | Idle 16, Other 3 | 0 / 0 / 20 | ipc 20, poll_wait 16, memcpy_memset 2 |
| WRRenderBackend#0 | 13 | 0.3 | Other 13 | 0 / 0 / 13 | webrender_render 0, poll_wait 0 |
| Socket Thread | 12 | 0.3 | Other 12 | 0 / 0 / 12 | ipc 12, poll_wait 11, memcpy_memset 0 |
| WRSceneBuilder#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_scene 11, webrender_render 0 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |

Main thread, top self: `poll [libc.so.6]` 149; `recvmsg [libc.so.6]` 16; `[axiosozo-dev]` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `write [libc.so.6]` 5; `[unknown]` 5; `mprotect [libc.so.6]` 5

**tab pid 3089** — 60 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 54 | 1.4 | Idle 17, Other 9, GC / CC 7, Layout 7 | 1 / 4 / 49 | ipc 49, poll_wait 19, paint_layout 17, gc_cc 9 |
| IPC I/O Child | 5 | 0.1 | Idle 5, Other 0, Profiler 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 18; `[]` 3; `sendmsg [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 2; `mozilla::dom::Document::GetBrowsingContext() const [libxul.so]` 1; `JS::GCCellPtr::outOfLineKind() const [libxul.so]` 1; `peek_poke::poke_into_vec [libxul.so]` 1; `XPCJSRuntime::NoteCustomGCThingXPCOMChildren(JSClass const*, JSObject*` 1

**tab pid 2944** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | ipc 7, poll_wait 7, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 3 | 0.1 | Idle 2, Other 0 | 0 / 0 / 3 | poll_wait 2, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 7; `sendmsg [libc.so.6]` 0; `write [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::Preferences::SetPreference(mozilla::dom::Pref const&) [libxul` 0

**tab pid 3030** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0; `mozilla::IdleTaskRunner::Schedule(bool) [libxul.so]` 0

