### chromium-2x-control switch-to-gecko (profile pass)

**parent pid 4356** — 81 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 32 | 19.6 | JavaScript 11, Layout 9, Graphics 4, Idle 3 | 0 / 20 / 13 | ipc 32, paint_layout 16, harness_diagnostics 8, gc_cc 7 |
| Renderer | 32 | 19.1 | Graphics 27, Idle 4 | 0 / 0 / 32 | ipc 32, webrender_render 27, webrender_sw_raster 24, poll_wait 4 |
| DOM Worker | 7 | 4.2 | JavaScript 6, Idle 1 | 0 / 0 / 7 | subprocess_pipe_io 7, worker_messaging 7, ipc 7, poll_wait 7 |
| SwComposite | 3 | 2.0 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 3 |
| BgIOThreadPool #3 | 2 | 1.4 | Other 2, Idle 0 | 0 / 0 / 2 | ipc 2, poll_wait 0 |
| WRRenderBackend#0 | 1 | 0.9 | Other 1 | 0 / 0 / 1 |  |
| Compositor | 1 | 0.6 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| WRSceneBuilder#0 | 1 | 0.6 | Other 1 | 0 / 0 / 1 | webrender_scene 1, array_buffer_copy 0 |

Main thread, top self: `webrender_api::display_list::DisplayListBuilder::push_reference_frame ` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `poll [libc.so.6]` 3; `js::RegExpStatics::updateFromMatchPairs(JSContext*, JSLinearString*, j` 2; `nsStyleUI::CalcDifference(nsStyleUI const&) const [libxul.so]` 2; `mozilla::dom::Range_Binding::Wrap(JSContext*, nsRange*, nsWrapperCache` 1; `mozilla::nsTArrayBackInserter<RefPtr<mozilla::dom::BrowsingContextGrou` 1; `JSString* js::NewMaybeExternalString<char16_t>(JSContext*, char16_t co` 1

**tab pid 5031** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.9 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 0 | 0.3 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0

**tab pid 4456** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 4528** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

