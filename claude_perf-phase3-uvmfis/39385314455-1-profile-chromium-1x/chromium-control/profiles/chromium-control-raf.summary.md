### chromium-control raf (profile pass)

**parent pid 4455** — 1309 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 364 | 11.5 | Idle 239, JavaScript 67, Other 35, DOM 14 | 14 / 64 / 286 | ipc 364, poll_wait 258, gc_cc 72, worker_messaging 38 |
| DOM Worker | 310 | 9.8 | JavaScript 305, Other 4, Profiler 2 | 0 / 0 / 310 | subprocess_pipe_io 310, worker_messaging 310, ipc 310, js_ctypes 289 |
| Renderer | 223 | 7.1 | Idle 125, Graphics 97, Profiler 1, Other 1 | 0 / 0 / 223 | ipc 223, poll_wait 127, webrender_render 97, webrender_sw_raster 88 |
| SwComposite | 173 | 5.5 | Other 173 | 0 / 0 / 173 | webrender_render 173, poll_wait 109, webrender_sw_raster 64, memcpy_memset 4 |
| BackgroundThreadPool #3 | 68 | 2.2 | Idle 63, Other 5, Graphics 1 | 0 / 0 / 68 | ipc 68, poll_wait 63, native_receiver 6, memcpy_memset 5 |
| WRRenderBackend#0 | 65 | 2.0 | Other 65 | 0 / 0 / 65 | webrender_render 1, memcpy_memset 1, array_buffer_copy 0 |
| Compositor | 43 | 1.4 | Idle 41, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, webrender_render 1, canvas_2d 1 |
| Timer | 33 | 1.0 | Other 33, Profiler 0 | 0 / 0 / 33 | ipc 33, poll_wait 32, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 242; `[unknown]` 14; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `write [libc.so.6]` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 3; `__lll_lock_wait [libc.so.6]` 3

**tab pid 4886** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1 | 0 / 0 / 3 | poll_wait 3, ipc 3, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `fog_counter_add [libxul.so]` 0; `DestroyRealm(JS::GCContext*, JS::Realm*) [libxul.so]` 0

**tab pid 4636** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[]` 0

**tab pid 5010** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `MessageLoop::EventTarget::IsOnCurrentThreadInfallible() [libxul.so]` 0

