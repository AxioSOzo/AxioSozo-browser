### chromium-2x switch-to-engine (profile pass)

**parent pid 3348** — 244 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 97 | 33.7 | JavaScript 23, Layout 21, DOM 19, GC / CC 10 | 5 / 44 / 48 | ipc 97, gc_cc 44, paint_layout 34, array_buffer_copy 15 |
| Renderer | 95 | 32.7 | Graphics 91, Idle 3 | 0 / 0 / 95 | ipc 95, webrender_render 91, webrender_sw_raster 90, poll_wait 3 |
| DOM Worker | 15 | 5.1 | JavaScript 15 | 0 / 0 / 15 | subprocess_pipe_io 15, js_ctypes 15, worker_messaging 15, ipc 15 |
| BackgroundThreadPool #2 | 10 | 3.5 | Other 8, Idle 2 | 0 / 0 / 10 | ipc 10, native_receiver 8, memcpy_memset 8, poll_wait 2 |
| SwComposite | 9 | 3.2 | Other 9 | 0 / 0 / 9 | webrender_render 9, poll_wait 9 |
| WRRenderBackend#0 | 5 | 1.9 | Other 5 | 0 / 0 / 5 | webrender_scene 0 |
| Compositor | 4 | 1.4 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| WRSceneBuilder#0 | 3 | 1.1 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 10; `[axiosozo-dev]` 10; `poll [libc.so.6]` 8; `mozilla::dom::Element_Binding::setAttribute(JSContext*, JS::Handle<JSO` 5; `mozilla::dom::PerformanceMainThread::CreationTimeStamp() const [libxul` 5; `__memmove_avx_unaligned_erms [libc.so.6]` 4; `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 3

**tab pid 4217** — 53 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 52 | 19.9 | Other 36, JavaScript 6, Profiler 5, DOM 3 | 0 / 5 / 47 | ipc 44, array_buffer_copy 15, gc_cc 13, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `sendmsg [libc.so.6]` 6; `__lll_lock_wake [libc.so.6]` 5; `[]` 4; `[libfontconfig.so.1]` 4; `GetExistingDataProperty(JSContext*, JS::Handle<js::NativeObject*>, JS:` 3; `__strlen_avx2 [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__strcmp_avx2 [libc.so.6]` 2

**tab pid 4222** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 16.9 | Other 40, Profiler 4, DOM 2, JavaScript 2 | 1 / 2 / 45 | ipc 37, array_buffer_copy 17, gc_cc 11, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strlen_avx2 [libc.so.6]` 4; `[libexpat.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `__read_nocancel [libc.so.6]` 3; `[libgcc_s.so.1]` 2; `read [libc.so.6]` 2; `[libfontconfig.so.1]` 2

**tab pid 4030** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.0 | Idle 2, Other 1 | 0 / 0 / 3 | poll_wait 3, ipc 2 |
| IPC I/O Child | 1 | 0.3 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsINode::GetRelevantGlobal() const [libxul.so]` 0

