### chromium-2x switch-to-engine (profile pass)

**parent pid 3249** — 166 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 67 | 34.0 | Graphics 65, Idle 3 | 0 / 0 / 67 | ipc 67, webrender_render 65, webrender_sw_raster 53, poll_wait 3 |
| GeckoMain | 62 | 31.4 | Layout 21, JavaScript 13, Idle 11, DOM 6 | 1 / 31 / 30 | ipc 62, paint_layout 30, gc_cc 16, array_buffer_copy 14 |
| BackgroundThreadPool #3 | 10 | 5.1 | Other 8, Idle 2 | 0 / 0 / 10 | ipc 10, native_receiver 8, memcpy_memset 5, image_container 3 |
| DOM Worker | 8 | 4.2 | JavaScript 8 | 0 / 0 / 8 | subprocess_pipe_io 8, worker_messaging 8, ipc 8, js_ctypes 8 |
| SwComposite | 7 | 3.5 | Other 7 | 0 / 0 / 7 | webrender_render 7, poll_wait 7 |
| Compositor | 4 | 1.9 | Idle 2, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 2 |
| WRRenderBackend#0 | 3 | 1.7 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 1.1 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeObject*>, JS` 5; `selectors::matching::matches_simple_selector [libxul.so]` 5; `style::rule_collector::RuleCollector<E>::collect_stylist_rules [libxul` 4; `JSStructuredCloneWriter::startWrite(JS::Handle<JS::Value>) [libxul.so]` 3; `mozilla::PrintfTarget::PrintfTarget() [axiosozo-dev]` 3; `crossbeam_channel::waker::SyncWaker::notify [libxul.so]` 3

**tab pid 4108** — 13 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 13 | 6.4 | Other 9, JavaScript 2, Idle 1, DOM 0 | 0 / 4 / 9 | ipc 13, gc_cc 7, subprocess_pipe_io 4, memcpy_memset 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `sendmsg [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `syscall [libc.so.6]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 1; `js::frontend::BytecodeEmitter::markSimpleBreakpoint() [libxul.so]` 1; `zlib_rs::inflate::inflate_fast_help_avx2 [libxul.so]` 1; `js::frontend::BytecodeEmitter::newSrcNoteOperand(long) [libxul.so]` 1

**tab pid 3920** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.3 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 3, ipc 2 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1

**tab pid 4104** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.6 | Other 1, Idle 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `sendmsg [libc.so.6]` 1; `poll [libc.so.6]` 0; `[]` 0

