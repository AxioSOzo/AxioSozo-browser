# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **47.9** (main 20.2, Renderer 12.6, DOM Worker 10.1, WRScene~ilder# 2.5, WRRende~ckend# 2.5) | AxioCEFProbe 45.3, cef:gpu-process 15.1, cef:utility 10.0, cef:zygote 5.0 | — | 364.2 |
| plain | idle | — | — | **4.9** (main 2.4, DOM Worker 1.5, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 1.9 | — | — |
| plain | raf | 60.0 | 23.0 | **16.1** (main 6.2, Renderer 2.0, DOM Worker 2.0, WRRende~ckend# 1.3, Compositor 1.0) | cef:renderer 7.8, cef:gpu-process 3.9, AxioCEFProbe 2.9 | — | — |
| plain | raf-nosampler | — | — | **12.3** (main 3.7, DOM Worker 2.3, Renderer 1.3, WRRende~ckend# 1.0, Backgro~Pool # 1.0) | cef:renderer 8.4, cef:gpu-process 4.6, AxioCEFProbe 3.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.0 | 23.7 | **29.7** (main 14.8, DOM Worker 4.9, Renderer 2.5, TaskCon~ller # 1.5, WRRende~ckend# 1.5) | cef:gpu-process 15.3, cef:renderer 9.5, AxioCEFProbe 6.5 | — | — |
| plain | key | — | — | **10.3** (main 5.8, DOM Worker 1.1, Timer 0.8, Renderer 0.8, glean.dispatche 0.6) | cef:renderer 1.9, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 10.9 | — |
| plain | switch-to-gecko | — | — | **46.3** (main 19.9, Renderer 6.6, Compositor 6.6, BgIOThr~Pool # 6.6, DOM Worker 6.6) |  | — | 129.9 |
| trace | switch-to-engine | — | — | **51.8** (main 25.9, Renderer 19.4, WRRende~ckend# 6.5) | AxioCEFProbe 45.3, cef:gpu-process 25.9, cef:renderer 19.4, cef:utility 12.9 | — | 134.7 |
| trace | idle | — | — | **2.9** (main 1.9, IPC I/O Parent 0.5, Timer 0.5) | Web Content 2.4, AxioCEFProbe 2.0 | — | — |
| trace | raf | 59.3 | 22.7 | **50.5** (DOM Worker 17.6, main 16.6, IPDL Background 4.6, TaskCon~ller # 2.0, glean.dispatche 1.6) | cef:renderer 8.8, cef:gpu-process 3.9, AxioCEFProbe 3.6, WebExtensions 0.3 | — | — |
| trace | raf-nosampler | — | — | **16.6** (main 6.0, DOM Worker 3.3, TaskCon~ller # 1.3, Renderer 1.3, WRRende~ckend# 1.3) | cef:renderer 7.3, cef:gpu-process 4.3, AxioCEFProbe 4.0 | — | — |
| trace | scroll | 60.2 | 22.8 | **32.4** (main 15.9, DOM Worker 5.0, TaskCon~ller # 2.5, Renderer 2.0, WRRende~ckend# 1.5) | cef:gpu-process 15.9, cef:renderer 9.0, AxioCEFProbe 5.5 | — | — |
| trace | key | — | — | **10.1** (main 5.5, DOM Worker 1.4, Renderer 0.8, glean.dispatche 0.6, Timer 0.3) | AxioCEFProbe 1.7, cef:renderer 1.7, cef:gpu-process 0.6 | 10.8 | — |
| trace | switch-to-gecko | — | — | **41.4** (main 20.7, TaskCon~ller # 6.9, Renderer 6.9, BgIOThr~Pool # 6.9) | Isolated Web Co 6.9 | — | 124.1 |
| profile | switch-to-engine | — | — | **98.8** (main 45.6, Renderer 15.2, DOM Worker 15.2, glean.dispatche 7.6, WRRende~ckend# 7.6) | Web Content 45.6, AxioCEFProbe 38.0, cef:renderer 22.8 | — | 102.9 |
| profile | idle | — | — | **18.2** (main 5.7, SamplerThread 4.8, DOM Worker 3.3, TaskCon~ller # 2.9, Timer 1.0) | Web Content 4.3, Privileged Cont 1.5, WebExtensions 1.0, Utility Process 1.0 | — | — |
| profile | raf | 60.0 | 20.6 | **28.5** (main 7.2, SamplerThread 7.2, DOM Worker 6.2, Renderer 2.0, WRRende~ckend# 1.3) | cef:renderer 7.5, Web Content 5.2, cef:gpu-process 3.3, AxioCEFProbe 3.3 | — | — |
| profile | raf-nosampler | — | — | **26.6** (DOM Worker 7.0, SamplerThread 6.3, main 5.3, Renderer 1.7, WRRende~ckend# 1.3) | cef:renderer 7.7, Web Content 5.3, cef:gpu-process 5.0, AxioCEFProbe 3.3 | — | — |
| profile | scroll | 60.1 | 20.7 | **44.1** (main 16.8, DOM Worker 9.9, SamplerThread 7.4, Renderer 2.0, WRRende~ckend# 1.5) | cef:gpu-process 15.8, cef:renderer 8.9, AxioCEFProbe 5.5, Web Content 4.4 | — | — |
| profile | key | — | — | **23.7** (main 7.7, SamplerThread 5.5, DOM Worker 5.0, Renderer 1.4, Timer 1.1) | Web Content 5.6, cef:renderer 1.9, WebExtensions 1.7, Privileged Cont 1.1 | 12.7 | — |
| profile | switch-to-gecko | — | — | **44.6** (main 19.1, DOM Worker 12.7, Renderer 6.4, BgIOThr~Pool # 6.4) | Isolated Web Co 6.4 | — | 131.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 11.5 | 0.0 | 0 | 0.0 | — | — | 6.9 | 0.0 | — | 0.56 | 1.31 | — | — | — | — | — | 0.015 |
| trace | raf | 59.3 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.09 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.11 | 0.10 | — | — | — | — | — | 0.007 |
| trace | scroll | 59.6 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | 0.15 | 0.09 | — | — | — | — | — | 0.006 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.0 | 0.0 | — | 0.31 | 0.08 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 13.1 | 0.0 | 0 | 0.0 | — | — | 5.3 | 0.0 | — | 1.04 | 0.62 | — | — | — | — | — | 0.008 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.10 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.11 | 0.12 | — | — | — | — | — | 0.008 |
| profile | scroll | 59.2 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | 0.16 | 0.11 | — | — | — | — | — | 0.007 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.2 | 0.0 | — | 0.36 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.384 | 0.493 | 0.0018 | 0.0024 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 185 | 185 | 0.029 | 0.052 | 0.0017 | 0.0031 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.039 | 0.058 | 0.0023 | 0.0035 |
| plain | scroll | memfd | native | 119 | 119 | 0.088 | 0.107 | 0.0051 | 0.0063 |
| plain | key | memfd | native | 21 | 21 | 0.008 | 0.050 | 0.0000 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.345 | 0.755 | 0.0040 | 0.0087 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 184 | 184 | 0.030 | 0.056 | 0.0018 | 0.0034 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.043 | 0.063 | 0.0026 | 0.0038 |
| trace | scroll | memfd | native | 121 | 121 | 0.100 | 0.123 | 0.0060 | 0.0073 |
| trace | key | memfd | native | 21 | 21 | 0.009 | 0.044 | 0.0001 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.422 | 0.840 | 0.0055 | 0.0110 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.031 | 0.055 | 0.0018 | 0.0033 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.041 | 0.065 | 0.0025 | 0.0039 |
| profile | scroll | memfd | native | 121 | 121 | 0.091 | 0.118 | 0.0054 | 0.0070 |
| profile | key | memfd | native | 21 | 21 | 0.010 | 0.046 | 0.0001 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.0 | 0.0 | — | 0.41 | 0.55 | — | — | 5.5 | 7.4 | 12.8 |
| profile | 0.6 | 8.0 | 0.0 | — | 0.36 | 0.65 | — | — | 5.2 | 9.2 | 14.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 43.8; write create 45.2; first frame applied (native receiver) 149.9; write frame_ack 152.4; write focus 156.1

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 18.7; first stdout read resolved 23.6; write shutdown 27.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 31.3; first stdout read resolved 37.3; first frame applied (native receiver) 116.7; write frame_ack 117.8; write focus 125.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 20.3; first stdout read resolved 26.7; write shutdown 32.0

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 53, Renderer 14, DOM Worker 10, WRRenderBackend 3, WRSceneBuilder 2, Compositor 2, BgPool 2, IPC I/O 1, SwComposite 1, Socket 0, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 53 ms (35.1% of span): JavaScript 17, Layout 16, DOM 7, Graphics 7, Idle 6, Other 1
  - JS leaf 1 / native under JS 27 / native 26; buckets: ipc 53, paint_layout 28, gc_cc 19, array_buffer_copy 11, harness_diagnostics 8, poll_wait 6, subprocess_pipe_io 5, worker_messaging 3
  - top self: `poll [libc.so.6]` 6; `mozilla::StyleGenericBorderImageSideWidth<mozilla::StyleLeng` 5; `js::frontend::TokenStreamSpecific<char16_t, js::frontend::Pa` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsTArrayInfallibleAllocator::ResultTypeProxy nsTArray_base<n` 3; `[unknown]` 2
  - WebRender/compositor threads: Renderer 14 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `webrender::quad::prepare_quad_impl [libxul.so]` 0); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `std::vector<unsigned char, std::allocator<unsigned` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 9 ms: buckets subprocess_pipe_io 9, worker_messaging 9, ipc 9, js_ctypes 8, poll_wait 8; top self: `poll [libc.so.6]` 8; `[unknown]` 0; `read [libc.so.6]` 0
- **tab:4163** CPU ms by thread group: main 33, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 33 ms (28.9% of span): Other 25, JavaScript 4, Profiler 2, Idle 1, GC / CC 0, DOM 0
  - JS leaf 0 / native under JS 4 / native 29; buckets: ipc 25, gc_cc 11, array_buffer_copy 9, subprocess_pipe_io 5, poll_wait 1, image_container 1, memcpy_memset 0
  - top self: `[libfontconfig.so.1]` 3; `[libexpat.so.1]` 3; `__powf_fma [libm.so.6]` 3; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Pr` 2; `[]` 2; `mozilla::detail::nsTStringRepr<char>::LowerCaseEqualsASCII(c` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3973** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.7% of span): Idle 2, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1, gc_cc 0
  - top self: `poll [libc.so.6]` 2; `mozilla::GetDisplayPortFromMarginsData(nsIContent*, mozilla:` 1; `mozilla::glean::HistogramIdForMetric(unsigned int) [libxul.s` 0; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4158** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 119, DOM Worker 34, other 11, BgPool 2, IPC I/O 0, Socket 0, ImageIO 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 119 ms (5.6% of span): GC / CC 54, Idle 50, JavaScript 8, Other 4, DOM 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 112; buckets: ipc 119, gc_cc 58, poll_wait 54, array_buffer_copy 5, harness_diagnostics 5, memcpy_memset 2, subprocess_pipe_io 0, worker_messaging 0
  - top self: `poll [libc.so.6]` 52; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3
  - GC/CC markers: GCMajor 2× 848 ms, GCSlice 15× 49 ms, CCSlice 3× 9 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #3 1 ms (top self: `write [libc.so.6]` 1, `open64 [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 34 ms: buckets subprocess_pipe_io 34, worker_messaging 34, ipc 34, js_ctypes 33, poll_wait 33; top self: `poll [libc.so.6]` 33; `getcontext [libc.so.6]` 0
- **tab:4158** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3414** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 208, DOM Worker 136, Renderer 48, WRRenderBackend 38, Compositor 26, BgPool 21, SwComposite 20, other 18, ImageBridge 11, WRSceneBuilder 6, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 208 ms (6.7% of span): Idle 154, JavaScript 31, DOM 10, Other 9, Profiler 2, GC / CC 2
  - JS leaf 5 / native under JS 35 / native 168; buckets: ipc 208, poll_wait 157, gc_cc 38, engine_stream_read 20, worker_messaging 19, json_metadata 11, subprocess_pipe_io 9, array_buffer_copy 8
  - top self: `poll [libc.so.6]` 153; `[unknown]` 5; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 42, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 35, `webrender::tile_cache::TileCacheInstance::update_p` 0, `webrender::clip::ClipStore::build_clip_chain_insta` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 21 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `mozilla::TaskQueue::MaybeResolveShutdown() [libxul` 0); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `EmptyCString() [libxul.so]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 136 ms: buckets subprocess_pipe_io 136, worker_messaging 136, ipc 136, js_ctypes 130, poll_wait 128, gc_cc 2; top self: `poll [libc.so.6]` 128; `[unknown]` 2; `[axiosozo-dev]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0
- **tab:3973** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, gc_cc 4, poll_wait 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 2; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `CCGraphBuilder::DescribeGCedNode(bool, char const*, unsigned` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `mozilla::dom::Document::cycleCollection::Trace(void*, TraceC` 1; `nsGlobalWindowOuter::cycleCollection::CanSkipReal(void*, boo` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3978** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: main 142, DOM Worker 136, Renderer 48, WRRenderBackend 38, Compositor 26, BgPool 26, SwComposite 20, ImageBridge 11, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 142 ms (4.7% of span): Idle 95, JavaScript 32, Other 9, DOM 6, Profiler 1
  - JS leaf 5 / native under JS 33 / native 105; buckets: ipc 142, poll_wait 100, gc_cc 40, worker_messaging 21, engine_stream_read 20, json_metadata 16, subprocess_pipe_io 10, array_buffer_copy 6
  - top self: `poll [libc.so.6]` 96; `[unknown]` 8; `recvmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::jit::UnaryArithIRGenerator::UnaryArithIRGenerator(JSCont` 1; `ptrToUint8Array (resource://gre/modules/subprocess/subproces` 1
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 40, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `webrender::frame_builder::FrameBuilder::build [lib` 1, `sched_yield [libc.so.6]` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 25 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `non-virtual thunk to mozilla::layers::ImageBridgeC` 0); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[axiosozo-dev]` 0, `mozilla::runnable_args_memfn<RefPtr<mozilla::layer` 0); BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 136 ms: buckets subprocess_pipe_io 136, worker_messaging 136, ipc 136, js_ctypes 127, poll_wait 125, gc_cc 3; top self: `poll [libc.so.6]` 125; `mozilla::EventListenerManager::HandleEventSingleLi` 1; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3973** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, gc_cc 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `mmap64 [libc.so.6]` 0; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3483** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 319, DOM Worker 157, Renderer 35, BgPool 29, WRRenderBackend 28, Compositor 19, SwComposite 13, other 12, ImageBridge 8, WRSceneBuilder 5, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 319 ms (15.6% of span): Idle 197, JavaScript 58, Other 36, DOM 12, Graphics 7, Layout 6
  - JS leaf 9 / native under JS 55 / native 255; buckets: ipc 319, poll_wait 243, gc_cc 53, worker_messaging 31, paint_layout 26, subprocess_pipe_io 17, engine_stream_read 15, array_buffer_copy 13
  - top self: `poll [libc.so.6]` 198; `[unknown]` 9; `write [libc.so.6]` 7; `recvmsg [libc.so.6]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - WebRender/compositor threads: Renderer 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 29, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 1); WRRenderBackend#0 28 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 13 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 29 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 27, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `mozilla::layers::BufferTextureData::BorrowMappedDa` 0); ImageBridgeChld 8 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8, `mozilla::layers::TextureClientRecycleAllocator::Re` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 157 ms: buckets subprocess_pipe_io 157, worker_messaging 157, ipc 157, js_ctypes 140, poll_wait 136, gc_cc 8; top self: `poll [libc.so.6]` 136; `[axiosozo-dev]` 4; `mozilla::dom::WorkerPrivate::SetGCTimerMode(mozill` 2; `__lll_lock_wait [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
- **tab:3483** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `TimerThread::RemoveTimer(nsTimerImpl*, mozilla::detail::Base` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3978** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3973** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 258, DOM Worker 105, Renderer 34, other 20, WRRenderBackend 12, Compositor 11, SwComposite 10, WRWorker 9, WRSceneBuilder 7, BgPool 2, ImageBridge 1, IPC I/O 1, Socket 0, ImageIO 0, Canvas 0
  - main thread 258 ms (7.1% of span): Idle 96, JavaScript 58, Layout 30, Other 23, Graphics 22, DOM 16
  - JS leaf 9 / native under JS 98 / native 151; buckets: ipc 258, poll_wait 122, gc_cc 74, paint_layout 62, worker_messaging 48, engine_stream_read 22, subprocess_pipe_io 19, array_buffer_copy 17
  - top self: `poll [libc.so.6]` 96; `[axiosozo-dev]` 9; `[unknown]` 7; `write [libc.so.6]` 4; `mprotect [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: CCSlice 1× 3 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `hypotf@@GLIBC_2.35 [libm.so.6]` 2); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 11, `webrender::batch::AlphaBatchBuilder::build [libxul` 0, `webrender::render_task_graph::RenderTaskGraphBuild` 0); SwComposite 10 ms (top self: `syscall [libc.so.6]` 9, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `mozilla::layers::SharedRGBImage::RecycleAllocator(` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, worker_messaging 101, ipc 101, js_ctypes 97, poll_wait 93, array_buffer_copy 1; top self: `poll [libc.so.6]` 93; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::ctypes::ConvertToJS(JSContext*, JS::Handle<JSO` 1; `read [libc.so.6]` 1; `getcontext [libc.so.6]` 1
- **tab:3414** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 4, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 4, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 4; `mozilla::dom::JSIPCValueUtils::FromJSVal(mozilla::dom::JSIPC` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 0; `_registerShims/< (moz-extension://9a310967-e580-48bf-b3e8-4e` 0; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4158** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 35, Renderer 10, BgPool 8, DOM Worker 6, WRRenderBackend 2, Compositor 1, WRSceneBuilder 1, SwComposite 0, IPC I/O 0, Socket 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 35 ms (20.1% of span): Layout 13, JavaScript 10, Idle 6, Graphics 3, DOM 2, Other 1
  - JS leaf 0 / native under JS 22 / native 13; buckets: ipc 35, paint_layout 17, harness_diagnostics 7, array_buffer_copy 7, poll_wait 6, gc_cc 6, worker_messaging 3, engine_stream_read 1
  - top self: `poll [libc.so.6]` 6; `mozilla::AbsoluteContainingBlock::PrepareAbsoluteFrames(nsCo` 3; `style::properties::cascade::iter_declarations [libxul.so]` 2; `[axiosozo-dev]` 2; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 1
  - WebRender/compositor threads: Renderer 10 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 8 ms (top self: `unlink [libc.so.6]` 6, `fstatat64 [libc.so.6]` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `syscall [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 6 ms: buckets subprocess_pipe_io 6, worker_messaging 6, ipc 6, poll_wait 6, js_ctypes 5, array_buffer_copy 0; top self: `poll [libc.so.6]` 5; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::jit::JitRuntime::freeIonOsrTempData() [libxul.` 0; `write [libc.so.6]` 0
- **tab:3973** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.9% of span): Idle 3, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `PollWrapper(_GPollFD*, unsigned int, int) [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3414** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.3% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3461** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

