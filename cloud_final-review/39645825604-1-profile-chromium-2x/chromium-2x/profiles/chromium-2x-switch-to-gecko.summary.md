### chromium-2x switch-to-gecko (profile pass)

**parent pid 3512** — 194 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 63 | 0.4 | Idle 20, Layout 16, Other 10, JavaScript 10 | 1 / 21 / 42 | ipc 63, poll_wait 24, paint_layout 21, array_buffer_copy 9 |
| DOM Worker | 62 | 0.4 | GC / CC 31, Other 21, JavaScript 9, Idle 1 | 0 / 0 / 62 | subprocess_pipe_io 62, worker_messaging 60, ipc 60, gc_cc 51 |
| Renderer | 40 | 0.2 | Graphics 37, Idle 3, Other 0 | 0 / 0 / 40 | ipc 40, webrender_render 37, webrender_sw_raster 37, poll_wait 3 |
| BgIOThreadPool #4 | 9 | 0.1 | Other 9, Idle 0 | 0 / 0 / 9 | ipc 9, poll_wait 0 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| SwComposite | 4 | 0.0 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 4 | 0.0 | Idle 3, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 0 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `poll [libc.so.6]` 22; `madvise [libc.so.6]` 4; `style::properties::generated::longhands::corner_top_right_shape::casca` 3; `syscall [libc.so.6]` 2; `mprotect [libc.so.6]` 2; `recvmsg [libc.so.6]` 1; `nsWindowRoot::QueryInterface(nsID const&, void**) [libxul.so]` 1; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [libxul.so]` 1

**tab pid 3653** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0, Profiler 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 0

**tab pid 3692** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__memcmp_avx2_movbe [libc.so.6]` 0

**tab pid 4318** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2, Profiler 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsITimerCallba` 0

