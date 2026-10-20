### chromium-control switch-to-engine (profile pass)

**parent pid 4455** — 212 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 91 | 14.3 | Layout 28, JavaScript 24, Idle 16, Other 14 | 2 / 37 / 52 | ipc 91, paint_layout 33, gc_cc 23, poll_wait 22 |
| DOM Worker | 61 | 9.6 | JavaScript 41, Idle 19, GC / CC 1 | 0 / 0 / 61 | subprocess_pipe_io 61, worker_messaging 61, ipc 61, poll_wait 55 |
| Renderer | 34 | 5.4 | Graphics 32, Idle 2 | 0 / 0 / 34 | ipc 34, webrender_render 32, webrender_sw_raster 16, poll_wait 2 |
| Compositor | 6 | 0.9 | Idle 6 | 0 / 0 / 6 | ipc 6, poll_wait 6 |
| BackgroundThreadPool #3 | 5 | 0.8 | Other 3, Idle 2 | 0 / 0 / 5 | ipc 5, native_receiver 3, image_container 2, poll_wait 2 |
| WRRenderBackend#0 | 5 | 0.8 | Other 5 | 0 / 0 / 5 |  |
| WRSceneBuilder#0 | 4 | 0.6 | Other 4 | 0 / 0 / 4 | webrender_scene 4 |
| IPC I/O Parent | 3 | 0.5 | Idle 3, Other 1 | 0 / 0 / 3 | poll_wait 3, ipc 1, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 8; `style::properties::cascade::iter_declarations [libxul.so]` 8; `recvmsg [libc.so.6]` 5; `[unknown]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 3; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, nsSize, nsSt` 3

**tab pid 5010** — 54 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 53 | 11.6 | Other 41, JavaScript 5, Profiler 3, DOM 3 | 0 / 5 / 48 | ipc 38, array_buffer_copy 15, gc_cc 12, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, memcpy_memset 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 7; `__strcmp_avx2 [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 3; `access [libc.so.6]` 2; `read [libc.so.6]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 2; `__lll_lock_wake [libc.so.6]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2

**tab pid 5007** — 52 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 51 | 8.7 | Other 44, JavaScript 2, Profiler 2, Idle 1 | 0 / 1 / 50 | ipc 38, array_buffer_copy 19, gc_cc 11, subprocess_pipe_io 5 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[libexpat.so.1]` 4; `[]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `FcConfigGetCurrent [libfontconfig.so.1]` 3; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<Pref> >, Pr` 2; `syscall [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `open64 [libc.so.6]` 2

**tab pid 4886** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.6 | Idle 2, Layout 1, Other 0, Profiler 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGenericInset<m` 1; `read [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<mozilla::Prof` 0; `getcontext [libc.so.6]` 0; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0; `__lll_lock_wake [libc.so.6]` 0

