### chromium switch-to-engine (profile pass)

**parent pid 3349** — 106 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 30.6 | Layout 16, Idle 12, Other 10, JavaScript 8 | 2 / 21 / 30 | ipc 53, paint_layout 19, gc_cc 17, poll_wait 13 |
| Renderer | 26 | 14.9 | Graphics 17, Idle 9 | 0 / 0 / 26 | ipc 25, webrender_render 17, webrender_sw_raster 13, poll_wait 10 |
| DOM Worker | 12 | 7.1 | JavaScript 12, Profiler 0 | 0 / 0 / 12 | subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 9 |
| WRRenderBackend#0 | 3 | 2.0 | Other 3 | 0 / 0 / 3 |  |
| BackgroundThreadPool #1 | 3 | 1.8 | Other 2, Idle 1 | 0 / 0 / 3 | ipc 3, native_receiver 2, memcpy_memset 1, image_container 1 |
| WRSceneBuilder#0 | 2 | 1.3 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 1, poll_wait 0 |
| Compositor | 2 | 1.3 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, webrender_render 0 |
| SwComposite | 2 | 0.9 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 12; `mozilla::EventTargetChainItem::HandleEvent(mozilla::EventChainPostVisi` 5; `Servo_ViewTransitionRule_AddRef [libxul.so]` 4; `style::style_adjuster::StyleAdjuster::adjust [libxul.so]` 3; `sendmsg [libc.so.6]` 3; `cssparser::parser::Parser::next_including_whitespace_and_comments [lib` 2; `nsStyleMargin::GetMargin(nsMargin&) const [libxul.so]` 2; `Subprocess.call/</stdout.read/< ([System Principal]:69:38)[8]` 2

**tab pid 4225** — 38 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 21.4 | Other 27, DOM 4, JavaScript 3, Profiler 2 | 0 / 4 / 34 | ipc 28, array_buffer_copy 12, gc_cc 11, subprocess_pipe_io 6 |
| IPC I/O Child | 0 | 0.3 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 4; `open64 [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall [libc.so.6]` 1; `poll [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1; `readlink [libc.so.6]` 1; `__strcmp_evex [libc.so.6]` 1

**tab pid 4229** — 22 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 21 | 12.2 | Other 17, JavaScript 3, Idle 1, DOM 0 | 2 / 2 / 17 | ipc 21, gc_cc 8, array_buffer_copy 6, subprocess_pipe_io 4 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `syscall [libc.so.6]` 2; `[]` 2; `next (self-hosted:2415:25)[7]` 1; `mmap64 [libc.so.6]` 1; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 1; `icu_78::LikelySubtagsData::toLanguage(int) [libxul.so]` 1; `[libexpat.so.1]` 1; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*) [libxul.s` 1

**tab pid 4039** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 1.3 | Idle 1, Other 1 | 0 / 0 / 2 | poll_wait 2, ipc 1, paint_layout 0 |
| IPC I/O Child | 1 | 0.4 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

