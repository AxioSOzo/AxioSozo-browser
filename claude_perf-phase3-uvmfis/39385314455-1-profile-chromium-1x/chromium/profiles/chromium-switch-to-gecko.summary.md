### chromium switch-to-gecko (profile pass)

**parent pid 3402** — 366 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 230 | 1.5 | GC / CC 134, JavaScript 34, Idle 24, Layout 15 | 1 / 50 / 179 | ipc 230, gc_cc 161, poll_wait 30, paint_layout 22 |
| DOM Worker | 46 | 0.3 | Other 17, JavaScript 13, GC / CC 13, Idle 2 | 0 / 0 / 46 | subprocess_pipe_io 46, worker_messaging 45, ipc 45, gc_cc 32 |
| DOM Worker | 40 | 0.4 | Other 38, GC / CC 1, Idle 1, JavaScript 0 | 0 / 0 / 40 | ipc 40, gc_cc 39, array_buffer_copy 1, poll_wait 1 |
| Renderer | 20 | 0.1 | Graphics 18, Idle 3 | 0 / 0 / 20 | ipc 18, webrender_render 18, webrender_sw_raster 15, poll_wait 3 |
| BgIOThreadPool #2 | 9 | 0.1 | Other 8, Idle 1 | 0 / 0 / 9 | ipc 9, poll_wait 1 |
| IPC I/O Parent | 7 | 0.0 | Idle 6, Other 0 | 0 / 0 / 7 | poll_wait 6, ipc 0 |
| Compositor | 4 | 0.0 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 1 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |

Main thread, top self: `poll [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 24; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS::MutableHa` 8; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 8; `[axiosozo-dev]` 7; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 7; `madvise [libc.so.6]` 6

**tab pid 3862** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 5, Layout 0, DOM 0, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 5, paint_layout 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `ProfilingStack::pushLabelFrame(char const*, char const*, void*, JS::Pr` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `webrtc::video_coding::DecodedFramesHistory::GetLastDecodedFrameTimesta` 0; `txMozillaXSLTProcessor::Release() [libxul.so]` 0

**tab pid 3604** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0

**tab pid 4053** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__strlen_avx2 [libc.so.6]` 0

