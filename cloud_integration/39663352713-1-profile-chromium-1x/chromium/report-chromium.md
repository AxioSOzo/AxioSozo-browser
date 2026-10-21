# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **84.4** (main 38.9, Renderer 26.0, DOM Worker 13.0, StyleThread# 6.5) | cef:renderer 26.0, AxioCEFProbe 19.5, cef:utility 13.0, Isolated Web Co 6.5 | — | 123.8 |
| plain | idle | — | — | **5.8** (main 3.4, DOM Worker 1.4, glean.dispatche 0.5, Cache2 I/O 0.5) | Web Content 1.9, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 22.4 | **17.0** (main 6.5, DOM Worker 1.9, Renderer 1.6, Backgro~Pool # 1.0, Timer 1.0) | cef:renderer 6.8, cef:gpu-process 3.9, AxioCEFProbe 3.2 | — | — |
| plain | raf-nosampler | — | — | **12.0** (main 3.6, DOM Worker 2.0, Renderer 1.7, Compositor 1.0, SwComposite 1.0) | cef:renderer 7.0, cef:gpu-process 4.9, AxioCEFProbe 4.0, WebExtensions 0.3 | — | — |
| plain | scroll | 59.9 | 23.5 | **30.7** (main 14.3, DOM Worker 5.4, Backgro~Pool # 2.0, Renderer 2.0, TaskCon~ller # 1.5) | cef:gpu-process 17.7, cef:renderer 7.4, AxioCEFProbe 5.9, Web Content 0.5 | — | — |
| plain | key | — | — | **12.1** (main 6.9, Renderer 1.1, DOM Worker 1.1, Timer 0.6, TaskCon~ller # 0.6) | AxioCEFProbe 2.0, cef:renderer 1.9, cef:gpu-process 0.3 | 11.0 | — |
| plain | switch-to-gecko | — | — | **10.2** (DOM Worker 3.7, main 3.4, IPDL Background 1.0, TaskCon~ller # 0.8, StreamTrans # 0.4) | Privileged Cont 0.1 | — | 15736.0 |
| trace | switch-to-engine | — | — | **83.6** (main 31.7, Renderer 23.0, TaskCon~ller # 11.5, DOM Worker 5.8, WrGlyph~terizer 2.9) | AxioCEFProbe 51.8, cef:gpu-process 20.1, cef:renderer 14.4, cef:utility 14.4 | — | 314.0 |
| trace | idle | — | — | **3.9** (main 2.9, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 3.9, Web Content 2.9 | — | — |
| trace | raf | 60.0 | 20.6 | **15.3** (main 6.2, DOM Worker 1.9, Renderer 1.6, Backgro~Pool # 1.0, WRRende~ckend# 1.0) | cef:renderer 6.5, AxioCEFProbe 3.5, cef:gpu-process 3.2 | — | — |
| trace | raf-nosampler | — | — | **13.6** (main 4.0, Renderer 2.0, DOM Worker 2.0, WRRende~ckend# 1.3, Backgro~Pool # 1.0) | cef:renderer 6.3, cef:gpu-process 4.3, AxioCEFProbe 3.7, Web Content 0.3 | — | — |
| trace | scroll | 60.0 | 22.8 | **29.2** (main 14.8, DOM Worker 5.4, Renderer 2.0, TaskCon~ller # 1.5, glean.dispatche 1.0) | cef:gpu-process 17.8, cef:renderer 9.0, AxioCEFProbe 5.9 | — | — |
| trace | key | — | — | **12.6** (main 6.9, Renderer 1.1, DOM Worker 1.1, TaskCon~ller # 0.8, Timer 0.6) | cef:renderer 2.5, AxioCEFProbe 1.7, cef:gpu-process 0.6, WebExtensions 0.3 | 11.2 | — |
| trace | switch-to-gecko | — | — | **1.5** (main 0.7, TaskCon~ller # 0.5, DOM Worker 0.1, glean.dispatche 0.1, Renderer 0.1) | WebExtensions 0.1, Web Content 0.1, Privileged Cont 0.1 | — | 15016.5 |
| profile | switch-to-engine | — | — | **76.4** (main 25.5, Renderer 12.7, DOM Worker 12.7, SamplerThread 12.7, IPC I/O Parent 6.4) | Web Content 31.8, cef:renderer 25.5, AxioCEFProbe 12.7, cef:gpu-process 6.4 | — | 116.7 |
| profile | idle | — | — | **17.7** (SamplerThread 6.2, DOM Worker 5.3, main 4.3, Timer 1.4, IPDL Background 0.5) | Web Content 6.2, Isolated Web Co 1.4, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 60.0 | 21.3 | **35.2** (main 8.7, DOM Worker 8.7, SamplerThread 8.1, Renderer 2.3, Timer 1.3) | Web Content 6.8, cef:renderer 6.8, cef:gpu-process 3.8, AxioCEFProbe 3.8 | — | — |
| profile | raf-nosampler | — | — | **31.0** (DOM Worker 8.6, SamplerThread 7.6, main 5.3, Renderer 2.3, Backgro~Pool # 1.3) | cef:renderer 7.6, Web Content 6.6, cef:gpu-process 4.6, AxioCEFProbe 4.0 | — | — |
| profile | scroll | 60.1 | 22.1 | **52.0** (main 18.6, DOM Worker 11.7, SamplerThread 8.8, Renderer 2.4, Backgro~Pool # 2.0) | cef:gpu-process 18.6, cef:renderer 9.3, Web Content 7.3, AxioCEFProbe 6.9 | — | — |
| profile | key | — | — | **28.1** (main 9.1, SamplerThread 7.2, DOM Worker 6.6, Renderer 1.4, Timer 1.1) | Web Content 7.2, AxioCEFProbe 1.4, WebExtensions 1.4, Privileged Cont 1.4 | 12.9 | — |
| profile | switch-to-gecko | — | — | **44.7** (main 19.1, BgIOThr~Pool # 6.4, Renderer 6.4, DOM Worker 6.4, SamplerThread 6.4) |  | — | 132.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.4 | 0.0 | 0 | 0.0 | — | — | 7.9 | 0.0 | — | 1.86 | 0.41 | — | — | — | — | — | 0.002 |
| trace | raf | 59.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.10 | 0.08 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.12 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 59.2 | 0.0 | 0 | 0.0 | — | — | 6.8 | 0.0 | — | 0.16 | 0.08 | — | — | — | — | — | 0.005 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.5 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.7 | 0.0 | 0 | 0.0 | — | — | 10.9 | 0.0 | — | 2.01 | 0.74 | — | — | — | — | — | 0.004 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.12 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.13 | 0.11 | — | — | — | — | — | 0.007 |
| profile | scroll | 59.0 | 0.0 | 0 | 0.0 | — | — | 8.4 | 0.0 | — | 0.20 | 0.12 | — | — | — | — | — | 0.008 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.4 | 0.0 | — | 0.45 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 1.317 | 2.458 | 0.0073 | 0.0137 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.036 | 0.079 | 0.0022 | 0.0047 |
| plain | raf-nosampler | memfd | native | 182 | 183 | 0.051 | 0.093 | 0.0031 | 0.0056 |
| plain | scroll | memfd | native | 119 | 119 | 0.109 | 0.136 | 0.0064 | 0.0079 |
| plain | key | memfd | native | 21 | 21 | 0.013 | 0.044 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.897 | 1.495 | 0.0048 | 0.0080 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.040 | 0.081 | 0.0024 | 0.0049 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.055 | 0.094 | 0.0033 | 0.0056 |
| trace | scroll | memfd | native | 121 | 121 | 0.099 | 0.133 | 0.0059 | 0.0079 |
| trace | key | memfd | native | 21 | 21 | 0.011 | 0.046 | 0.0001 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 1.779 | 4.845 | 0.0101 | 0.0276 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 187 | 187 | 0.042 | 0.082 | 0.0025 | 0.0050 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.054 | 0.093 | 0.0032 | 0.0056 |
| profile | scroll | memfd | native | 122 | 122 | 0.116 | 0.151 | 0.0068 | 0.0089 |
| profile | key | memfd | native | 21 | 21 | 0.013 | 0.058 | 0.0001 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.5 | 0.0 | — | 0.26 | 0.41 | — | — | 5.4 | 7.5 | 13.5 |
| profile | 0.6 | 8.2 | 0.0 | — | 0.45 | 0.71 | — | — | 7.3 | 9.5 | 17.1 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called -21.9; spawn AxioCEFProbe resolved -6.2; write hello -4.0; first stdout read resolved 211.8; write create 213.5; first frame applied (native receiver) 336.2; write frame_ack 336.9; write focus 342.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 18.5; first stdout read resolved 27.9; write shutdown 28.5

Switch timeline (profile, switch-to-engine, ms after the window start): write create 26.1; first stdout read resolved 33.2; first frame applied (native receiver) 125.7; write frame_ack 126.4; write focus 133.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 24.2; first stdout read resolved 32.2; write shutdown 35.7

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 53, Renderer 26, DOM Worker 12, WRRenderBackend 4, BgPool 3, WRSceneBuilder 2, Compositor 2, SwComposite 2, IPC I/O 1, WRWorker 1, Socket 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 53 ms (30.6% of span): Layout 16, Idle 12, Other 10, JavaScript 8, Graphics 5, DOM 2
  - JS leaf 2 / native under JS 21 / native 30; buckets: ipc 53, paint_layout 19, gc_cc 17, poll_wait 13, array_buffer_copy 10, harness_diagnostics 6, worker_messaging 4, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 12; `mozilla::EventTargetChainItem::HandleEvent(mozilla::EventCha` 5; `Servo_ViewTransitionRule_AddRef [libxul.so]` 4; `style::style_adjuster::StyleAdjuster::adjust [libxul.so]` 3; `sendmsg [libc.so.6]` 3; `cssparser::parser::Parser::next_including_whitespace_and_com` 2
  - WebRender/compositor threads: Renderer 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6, `hypotf@@GLIBC_2.35 [libm.so.6]` 3); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__memset_avx512_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 9, poll_wait 9; top self: `poll [libc.so.6]` 9; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 2; `[unknown]` 1; `[axiosozo-dev]` 0
- **tab:4225** CPU ms by thread group: main 38, IPC I/O 0, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (21.4% of span): Other 27, DOM 4, JavaScript 3, Profiler 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 34; buckets: ipc 28, array_buffer_copy 12, gc_cc 11, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 1
  - top self: `[]` 4; `open64 [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall [libc.so.6]` 1; `poll [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4229** CPU ms by thread group: main 21, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (12.2% of span): Other 17, JavaScript 3, Idle 1, DOM 0
  - JS leaf 2 / native under JS 2 / native 17; buckets: ipc 21, gc_cc 8, array_buffer_copy 6, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1, image_container 1
  - top self: `syscall [libc.so.6]` 2; `[]` 2; `next (self-hosted:2415:25)[7]` 1; `mmap64 [libc.so.6]` 1; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 1; `icu_78::LikelySubtagsData::toLanguage(int) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (1.3% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 78, DOM Worker 73, other 14, IPC I/O 1, Socket 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 78 ms (3.7% of span): Idle 66, JavaScript 5, Other 3, Profiler 1, DOM 1, GC / CC 1
  - JS leaf 1 / native under JS 6 / native 71; buckets: ipc 78, poll_wait 67, harness_diagnostics 6, gc_cc 3, array_buffer_copy 3, worker_messaging 1, engine_stream_read 1, json_metadata 0
  - top self: `poll [libc.so.6]` 66; `mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Compart` 1; `mozilla::dom::TimeoutExecutor::MaybeReschedule(mozilla::Time` 1; `NS_CycleCollectorSuspect3 [libxul.so]` 1; `write [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 73 ms: buckets subprocess_pipe_io 73, worker_messaging 73, ipc 73, js_ctypes 73, poll_wait 73; top self: `poll [libc.so.6]` 73; `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 0
- **tab:4229** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4225** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 248, DOM Worker 198, Renderer 58, WRRenderBackend 35, SwComposite 32, BgPool 29, Compositor 28, other 23, ImageBridge 12, WRSceneBuilder 6, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 248 ms (8.0% of span): Idle 182, JavaScript 38, Other 17, DOM 8, Profiler 2, Graphics 0
  - JS leaf 6 / native under JS 37 / native 204; buckets: ipc 248, poll_wait 193, gc_cc 37, worker_messaging 23, engine_stream_read 18, json_metadata 14, array_buffer_copy 9, subprocess_pipe_io 9
  - top self: `poll [libc.so.6]` 183; `[unknown]` 5; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ModuleObject::environment() const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 58 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 50, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 1); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 32, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0, `webrender::resource_cache::ResourceCache::end_fram` 0); SwComposite 32 ms (top self: `syscall [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 29 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__pthread_enable_asynccancel [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[axiosozo-dev]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 198 ms: buckets subprocess_pipe_io 198, worker_messaging 198, ipc 198, js_ctypes 186, poll_wait 184, gc_cc 3; top self: `poll [libc.so.6]` 184; `[unknown]` 3; `JSStructuredCloneReader::readObjectField(JS::Handl` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:4039** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, gc_cc 3, poll_wait 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::DescribeGCedNode(bool, char const*, unsigned` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::TraceEdgeInternal(JSTracer*, JS::Value*, char const*` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsThread::DoMainThreadSpecificProcessing() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3555** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 195, main 145, Renderer 58, WRRenderBackend 34, BgPool 33, SwComposite 31, Compositor 28, ImageBridge 12, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 145 ms (4.8% of span): Idle 92, JavaScript 29, Other 12, DOM 8, GC / CC 3, Profiler 1
  - JS leaf 4 / native under JS 30 / native 111; buckets: ipc 144, poll_wait 98, gc_cc 40, worker_messaging 21, engine_stream_read 18, json_metadata 14, subprocess_pipe_io 10, array_buffer_copy 6
  - top self: `poll [libc.so.6]` 92; `[unknown]` 6; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 2; `[axiosozo-dev]` 1; `now ([System Principal]:37:15)[2]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 1); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 32, `__memcmp_evex_movbe [libc.so.6]` 0, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 31 ms (top self: `syscall [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 33 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `axio::SinkState::CopyRect(unsigned char*, unsigned` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `profiler_mark_thread_asleep() [libxul.so]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 195 ms: buckets subprocess_pipe_io 195, worker_messaging 194, ipc 194, js_ctypes 184, poll_wait 183, gc_cc 5; top self: `poll [libc.so.6]` 183; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `[axiosozo-dev]` 2; `__strnlen_evex [libc.so.6]` 1; `[unknown]` 1
- **tab:4039** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `nsTSubstring<char>::~nsTSubstring() [libxul.so]` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 0; `mozilla::detail::SprintfAppend::append(char const*, unsigned` 0
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3555** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4229** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 362, DOM Worker 193, Renderer 44, BgPool 37, WRRenderBackend 27, SwComposite 21, Compositor 20, other 15, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 362 ms (17.5% of span): Idle 215, JavaScript 56, Other 46, DOM 14, Graphics 11, Layout 8
  - JS leaf 7 / native under JS 62 / native 293; buckets: ipc 361, poll_wait 270, gc_cc 63, worker_messaging 31, paint_layout 27, engine_stream_read 22, subprocess_pipe_io 16, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 216; `recvmsg [libc.so.6]` 10; `[unknown]` 8; `write [libc.so.6]` 5; `[linux-vdso.so.1]` 4; `[axiosozo-dev]` 4
  - GC/CC markers: GCMinor 1× 5 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 3); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 1, `__lll_lock_wake [libc.so.6]` 0); SwComposite 21 ms (top self: `syscall [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `std::pair<std::__detail::_Node_iterator<std::pair<` 0); BgIOThreadPool #2 1 ms (top self: `open64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `close [libc.so.6]` 0)
  - busiest DOM Worker 193 ms: buckets subprocess_pipe_io 193, worker_messaging 193, ipc 193, js_ctypes 175, poll_wait 168, gc_cc 4; top self: `poll [libc.so.6]` 168; `[axiosozo-dev]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `[unknown]` 2; `read [libc.so.6]` 2
- **tab:3555** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): Idle 2, DOM 1, JavaScript 1
  - JS leaf 0 / native under JS 1 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*,` 1; `js::jit::ICScript::initICEntries(JSContext*, JSScript*) [lib` 1; `[linux-vdso.so.1]` 0; `js::InterpreterFrame::prologue(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4229** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 300, DOM Worker 168, Renderer 46, other 26, SwComposite 15, WRRenderBackend 12, Compositor 12, WRWorker 10, WRSceneBuilder 7, BgPool 2, IPC I/O 2, ImageBridge 1, Socket 0, Canvas 0, ImageIO 0
  - main thread 300 ms (8.2% of span): Idle 133, JavaScript 58, Layout 29, Graphics 28, Other 28, DOM 16
  - JS leaf 11 / native under JS 95 / native 194; buckets: ipc 300, poll_wait 165, gc_cc 64, paint_layout 62, worker_messaging 50, engine_stream_read 27, subprocess_pipe_io 21, array_buffer_copy 17
  - top self: `poll [libc.so.6]` 134; `[unknown]` 12; `[axiosozo-dev]` 8; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 46 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); SwComposite 15 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 10, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0, `webrender::batch::AlphaBatchList::set_params_and_g` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `void std::__introsort_loop<mojo::core::ports::Port` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 168 ms: buckets subprocess_pipe_io 168, worker_messaging 168, ipc 168, js_ctypes 162, poll_wait 155, gc_cc 6; top self: `poll [libc.so.6]` 155; `js::ctypes::FunctionType::Call(JSContext*, unsigne` 2; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::promoteObjectSlow(JSObject` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:3455** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 5; `JS::MaybeGetHostDefinedDataFromJSMicroTask(JSObject*, JS::Mu` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 0; `JSString::tryReplaceWithAtomRef(JSAtom*) [libxul.so]` 0; `JSRuntime::getHostDefinedData(JSContext*, JS::MutableHandle<` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 35, Renderer 11, DOM Worker 9, BgPool 7, Compositor 2, WRRenderBackend 2, WRSceneBuilder 1, SwComposite 1, Socket 0, IPC I/O 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 35 ms (19.6% of span): JavaScript 15, Layout 10, Idle 5, DOM 2, Graphics 1, Profiler 1
  - JS leaf 3 / native under JS 21 / native 11; buckets: ipc 35, paint_layout 16, harness_diagnostics 9, array_buffer_copy 7, poll_wait 6, gc_cc 6, worker_messaging 5, subprocess_pipe_io 4
  - top self: `poll [libc.so.6]` 5; `style::properties::cascade::Declarations::note_declaration [` 2; `js::jit::MacroAssemblerX86Shared::~MacroAssemblerX86Shared()` 2; `[unknown]` 2; `willShowFormattedMixedContentProtocol (moz-src:///browser/co` 2; `IntrinsicSizeOffsets(nsIFrame*, int, bool) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 11 ms (top self: `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 7 ms (top self: `unlink [libc.so.6]` 6, `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 9 ms: buckets subprocess_pipe_io 9, worker_messaging 9, ipc 9, js_ctypes 8, poll_wait 8; top self: `poll [libc.so.6]` 8; `wait4 [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:4039** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.7% of span): Idle 2, Other 0, Layout 0, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 2; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsI` 0; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 0; `[]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0; `nsWebBrowser::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3455** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

