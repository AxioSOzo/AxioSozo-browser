# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **86.4** (main 43.2, Renderer 21.6, DOM Worker 10.8, WRScene~ilder# 5.4, WRRende~ckend# 5.4) | AxioCEFProbe 32.4, cef:renderer 27.0, cef:gpu-process 5.4 | — | 140.9 |
| plain | idle | — | — | **8.1** (main 5.2, Timer 0.9, IPC I/O Parent 0.5, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.3, AxioCEFProbe 3.3, forkserver 0.5, cef:utility 0.5 | — | — |
| plain | raf | 60.0 | 23.4 | **26.5** (main 11.9, DOM Worker 3.5, Renderer 2.6, WRRende~ckend# 1.3, Compositor 1.3) | cef:renderer 10.9, cef:gpu-process 5.4, AxioCEFProbe 5.4, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **19.9** (main 5.3, DOM Worker 3.6, Renderer 2.3, WRRende~ckend# 1.7, Compositor 1.3) | cef:renderer 10.9, AxioCEFProbe 7.0, cef:gpu-process 6.3 | — | — |
| plain | scroll | 60.0 | 24.2 | **45.9** (main 23.0, DOM Worker 8.1, Renderer 2.9, Backgro~Pool # 2.4, TaskCon~ller # 1.9) | cef:gpu-process 21.1, cef:renderer 12.5, AxioCEFProbe 8.6 | — | — |
| plain | key | — | — | **18.8** (main 11.2, DOM Worker 1.9, Timer 1.4, Renderer 1.1, TaskCon~ller # 0.8) | cef:renderer 2.8, AxioCEFProbe 2.4, cef:gpu-process 0.8, Privileged Cont 0.3 | 13.9 | — |
| plain | switch-to-gecko | — | — | **14.9** (DOM Worker 5.6, main 5.0, IPDL Background 1.7, TaskCon~ller # 1.1, StreamTrans # 0.5) | WebExtensions 0.1, Web Content 0.1, Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15022.2 |
| trace | switch-to-engine | — | — | **109.7** (main 40.4, Renderer 37.5, TaskCon~ller # 11.5, glean.dispatche 5.8, WRRende~ckend# 5.8) | AxioCEFProbe 60.6, cef:gpu-process 31.7, cef:utility 23.0, cef:renderer 17.3 | — | 275.2 |
| trace | idle | — | — | **6.6** (main 5.2, Timer 0.9, DOM Worker 0.5) | AxioCEFProbe 3.4, Web Content 1.4, cef:zygote 0.5 | — | — |
| trace | raf | 60.0 | 22.6 | **26.8** (main 11.9, DOM Worker 3.9, Renderer 2.2, WRRende~ckend# 1.6, SwComposite 1.3) | cef:renderer 10.9, AxioCEFProbe 5.8, cef:gpu-process 5.1 | — | — |
| trace | raf-nosampler | — | — | **18.1** (main 5.6, DOM Worker 3.3, Renderer 2.3, WRRende~ckend# 1.3, Compositor 1.3) | cef:renderer 9.9, AxioCEFProbe 6.3, cef:gpu-process 5.7, Isolated Web Co 0.3 | — | — |
| trace | scroll | 60.1 | 23.0 | **48.6** (main 24.0, DOM Worker 8.2, Backgro~Pool # 3.4, Renderer 2.9, TaskCon~ller # 1.9) | cef:gpu-process 22.2, cef:renderer 11.0, AxioCEFProbe 8.7 | — | — |
| trace | key | — | — | **17.2** (main 10.9, Renderer 1.4, DOM Worker 1.4, Timer 0.8, TaskCon~ller # 0.8) | AxioCEFProbe 2.5, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 13.8 | — |
| trace | switch-to-gecko | — | — | **34.9** (main 17.5, BgIOThr~Pool # 5.8, Renderer 5.8, WRRende~ckend# 5.8) |  | — | 132.6 |
| profile | switch-to-engine | — | — | **91.0** (main 43.3, Renderer 17.3, DOM Worker 13.0, TaskCon~ller # 8.7, SamplerThread 8.7) | AxioCEFProbe 25.9, cef:renderer 21.7, cef:utility 4.3, Privileged Cont 4.3 | — | 149.2 |
| profile | idle | — | — | **23.1** (DOM Worker 8.0, SamplerThread 8.0, main 5.7, Timer 1.4) | Web Content 9.5, AxioCEFProbe 3.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 60.0 | 26.2 | **53.4** (main 13.7, DOM Worker 12.7, SamplerThread 11.8, Renderer 2.5, Timer 1.9) | Web Content 10.8, cef:renderer 9.5, AxioCEFProbe 5.3, cef:gpu-process 4.8 | — | — |
| profile | raf-nosampler | — | — | **41.4** (DOM Worker 13.9, SamplerThread 9.9, main 6.9, Renderer 2.6, WRRende~ckend# 1.6) | cef:renderer 9.6, Web Content 9.5, AxioCEFProbe 5.6, cef:gpu-process 5.0 | — | — |
| profile | scroll | 60.3 | 22.0 | **68.9** (main 24.3, DOM Worker 17.2, SamplerThread 12.4, Renderer 2.9, Backgro~Pool # 2.9) | cef:gpu-process 22.0, cef:renderer 11.4, Web Content 10.5, AxioCEFProbe 8.6 | — | — |
| profile | key | — | — | **42.6** (main 13.3, DOM Worker 10.1, SamplerThread 9.5, TaskCon~ller # 2.2, Renderer 1.9) | Web Content 9.2, cef:renderer 2.5, Privileged Cont 1.9, Isolated Web Co 1.9 | 16.2 | — |
| profile | switch-to-gecko | — | — | **61.5** (main 27.9, DOM Worker 11.2, BgIOThr~Pool # 5.6, WRRende~ckend# 5.6, Compositor 5.6) | Isolated Web Co 5.6 | — | 139.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 8.0 | 0.0 | 0 | 0.0 | — | — | 2.3 | 0.0 | — | 2.94 | 0.37 | — | — | — | — | — | 0.004 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.17 | 0.12 | — | — | — | — | — | 0.009 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.17 | 0.12 | — | — | — | — | — | 0.008 |
| trace | scroll | 59.0 | 0.0 | 0 | 0.0 | — | — | 9.5 | 0.0 | — | 0.35 | 0.12 | — | — | — | — | — | 0.007 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | 0.39 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.3 | 0.0 | 0 | 0.0 | — | — | 7.8 | 0.0 | — | 2.47 | 0.88 | — | — | — | — | — | 0.006 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.18 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.16 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.9 | 0.0 | 0 | 0.0 | — | — | 8.0 | 0.0 | — | 0.32 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.8 | 0.0 | — | 0.64 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.101 | 1.905 | 0.0103 | 0.0178 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.055 | 0.090 | 0.0033 | 0.0054 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.062 | 0.092 | 0.0037 | 0.0055 |
| plain | scroll | memfd | native | 122 | 122 | 0.211 | 0.240 | 0.0122 | 0.0139 |
| plain | key | memfd | native | 21 | 21 | 0.017 | 0.065 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 0.967 | 4.209 | 0.0078 | 0.0338 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 189 | 189 | 0.057 | 0.089 | 0.0034 | 0.0054 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.067 | 0.094 | 0.0040 | 0.0057 |
| trace | scroll | memfd | native | 124 | 124 | 0.252 | 0.253 | 0.0149 | 0.0149 |
| trace | key | memfd | native | 21 | 21 | 0.019 | 0.063 | 0.0001 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.287 | 3.033 | 0.0094 | 0.0222 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.056 | 0.104 | 0.0033 | 0.0062 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.056 | 0.099 | 0.0033 | 0.0059 |
| profile | scroll | memfd | native | 125 | 125 | 0.206 | 0.243 | 0.0121 | 0.0143 |
| profile | key | memfd | native | 21 | 21 | 0.018 | 0.083 | 0.0001 | 0.0005 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 8.9 | 0.0 | — | 0.39 | 0.61 | — | — | 6.2 | 10.1 | 16.5 |
| profile | 0.7 | 11.0 | 0.0 | — | 0.64 | 0.96 | — | — | 6.9 | 13.0 | 19.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 110.3; write create 111.9; first frame applied (native receiver) 292.6; write frame_ack 293.6; write focus 306.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 32.8; first stdout read resolved 40.4; write shutdown 46.5

Switch timeline (profile, switch-to-engine, ms after the window start): write create 62.1; first stdout read resolved 79.7; first frame applied (native receiver) 182.0; write frame_ack 183.6; write focus 194.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 39.1; first stdout read resolved 49.4; write shutdown 54.2

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 118, Renderer 32, DOM Worker 16, BgPool 6, WRRenderBackend 4, Compositor 4, WRSceneBuilder 3, SwComposite 2, IPC I/O 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 118 ms (43.2% of span): GC / CC 39, Layout 29, JavaScript 29, DOM 6, Idle 5, Other 5
  - JS leaf 7 / native under JS 40 / native 71; buckets: ipc 118, gc_cc 74, paint_layout 39, array_buffer_copy 18, harness_diagnostics 14, poll_wait 13, subprocess_pipe_io 11, engine_stream_read 8
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `mozilla::layers::AnimationInfo::EnumerateGenerationOnFrame(n` 6; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 6; `style::properties::generated::longhands::height::cascade_pro` 5; `poll [libc.so.6]` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4
  - GC/CC markers: GCMajor 1× 130 ms, GCSlice 6× 49 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `hypotf@@GLIBC_2.35 [libm.so.6]` 6, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 2); WRSceneBuilder#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, js_ctypes 16, worker_messaging 16, ipc 16, poll_wait 15; top self: `poll [libc.so.6]` 15; `mozilla::dom::WorkerPrivate::BeginCTypesCall() [li` 1
- **tab:4336** CPU ms by thread group: main 31, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 31 ms (11.3% of span): Other 24, DOM 5, JavaScript 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 25; buckets: ipc 30, gc_cc 15, array_buffer_copy 12, subprocess_pipe_io 8, memcpy_memset 2, poll_wait 2
  - top self: `[]` 4; `js::SharedImmutableScriptData::createWith(js::FrontendContex` 3; `icu_78::PropNameData::getPropertyValueName(int, int, int) [l` 2; `icu_78::CharString::appendInvariantChars(char16_t const*, in` 2; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 2; `poll [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4331** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.6% of span): Other 3, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 1, image_container 1, gc_cc 1
  - top self: `poll [libc.so.6]` 1; `nsTimer::Cancel() [libxul.so]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `sendmsg [libc.so.6]` 1; `encoding_rs::utf_8::convert_utf16_to_utf8_partial_inner [lib` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4148** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 108, main 102, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 102 ms (4.8% of span): Idle 85, JavaScript 10, Other 6, Profiler 1, DOM 0
  - JS leaf 1 / native under JS 8 / native 93; buckets: ipc 102, poll_wait 89, harness_diagnostics 8, gc_cc 6, array_buffer_copy 5, subprocess_pipe_io 2, json_metadata 1, worker_messaging 1
  - top self: `poll [libc.so.6]` 85; `recvmsg [libc.so.6]` 2; `[unknown]` 2; `js::jit::BaselineCompiler::emitBody() [libxul.so]` 1; `js::frontend::ParserBase::newGlobalScopeData(js::frontend::P` 1; `JS::RunJSMicroTask(JSContext*, JS::Handle<JSObject*>) [libxu` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, js_ctypes 108, worker_messaging 108, ipc 108, poll_wait 108; top self: `poll [libc.so.6]` 108
- **tab:3622** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4336** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 398, DOM Worker 299, Renderer 78, WRRenderBackend 48, SwComposite 41, Compositor 41, BgPool 37, other 32, ImageBridge 18, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 398 ms (12.6% of span): Idle 226, JavaScript 81, Other 38, GC / CC 35, DOM 15, Profiler 4
  - JS leaf 3 / native under JS 85 / native 310; buckets: ipc 398, poll_wait 251, gc_cc 118, worker_messaging 45, engine_stream_read 41, json_metadata 25, native_receiver 17, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 229; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6
  - GC/CC markers: GCMajor 1× 1045 ms, GCSlice 8× 32 ms, CCSlice 2× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 3); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 41 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 37 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `mozilla::BaseTimeDurationPlatformUtils::ToSeconds(` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `__lll_lock_wait [libc.so.6]` 0, `mozilla::ipc::NodeController::SendUserMessage(mojo` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 299 ms: buckets subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 278, poll_wait 273, gc_cc 9; top self: `poll [libc.so.6]` 273; `__lll_lock_wake [libc.so.6]` 2; `[unknown]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3640** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 11 ms (0.3% of span): GC / CC 8, Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 9, gc_cc 8, poll_wait 4
  - top self: `poll [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*, JS::Slic` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3551** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.3% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 8, gc_cc 7, poll_wait 3, array_buffer_copy 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `nsTHashtable<nsBaseHashtableET<nsPtrHashKey<nsIMemoryReporte` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, gc_cc 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 328, main 193, Renderer 72, WRRenderBackend 42, SwComposite 39, Compositor 38, BgPool 35, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 193 ms (6.3% of span): Idle 106, JavaScript 58, Other 12, DOM 12, Profiler 4
  - JS leaf 6 / native under JS 62 / native 125; buckets: ipc 193, poll_wait 116, gc_cc 66, engine_stream_read 42, worker_messaging 33, json_metadata 20, native_receiver 18, subprocess_pipe_io 13
  - top self: `poll [libc.so.6]` 107; `[unknown]` 8; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `write [libc.so.6]` 3; `recvmsg [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 72 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 57, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 2); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 39 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 31, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wake [libc.so.6]` 0, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 329 ms: buckets subprocess_pipe_io 329, worker_messaging 329, ipc 329, js_ctypes 264, poll_wait 256, gc_cc 50; top self: `poll [libc.so.6]` 256; `[axiosozo-dev]` 8; `madvise [libc.so.6]` 8; `[unknown]` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:3640** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4331** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4336** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 481, DOM Worker 298, BgPool 59, Renderer 51, WRRenderBackend 33, Compositor 27, SwComposite 24, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 481 ms (22.6% of span): Idle 278, JavaScript 76, Other 61, GC / CC 21, Graphics 17, DOM 12
  - JS leaf 13 / native under JS 71 / native 396; buckets: ipc 481, poll_wait 349, gc_cc 96, paint_layout 41, worker_messaging 37, engine_stream_read 21, json_metadata 18, array_buffer_copy 17
  - top self: `poll [libc.so.6]` 281; `write [libc.so.6]` 9; `[unknown]` 8; `recvmsg [libc.so.6]` 8; `[axiosozo-dev]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5
  - GC/CC markers: GCSlice 4× 15 ms, CCSlice 2× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 51 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 42, `syscall [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); SwComposite 24 ms (top self: `syscall [libc.so.6]` 24, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 59 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__pthread_mutex_cond_lock [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 298 ms: buckets subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 258, poll_wait 253, gc_cc 10; top self: `poll [libc.so.6]` 253; `[axiosozo-dev]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `[unknown]` 3; `getcontext [libc.so.6]` 3
- **tab:3640** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4150** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 455, DOM Worker 254, Renderer 54, other 35, Compositor 17, SwComposite 16, WRRenderBackend 14, WRWorker 11, WRSceneBuilder 9, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 455 ms (12.3% of span): Idle 175, JavaScript 83, GC / CC 60, Layout 43, Graphics 32, Other 28
  - JS leaf 13 / native under JS 136 / native 305; buckets: ipc 455, poll_wait 210, gc_cc 151, paint_layout 88, worker_messaging 65, engine_stream_read 36, subprocess_pipe_io 16, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 176; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `[axiosozo-dev]` 11; `[unknown]` 10; `write [libc.so.6]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6
  - GC/CC markers: GCMajor 2× 823 ms, GCSlice 14× 52 ms, CCSlice 3× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 54 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5); SwComposite 16 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `webrender::prepare::prepare_prim_for_render [libxu` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::ipc::PortLink::OnPortStatusChanged() [lib` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 254 ms: buckets subprocess_pipe_io 254, worker_messaging 254, ipc 254, js_ctypes 238, poll_wait 233, gc_cc 6; top self: `poll [libc.so.6]` 233; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `mozilla::dom::TimeoutExecutor::Run() [libxul.so]` 2; `js::ctypes::StructType::FieldSetter(JSContext*, un` 2; `void js::NativeObject::setFixedSlot<true>(unsigned` 1
- **tab:3551** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 0, DOM 0, Profiler 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::H` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `__strlen_avx2 [libc.so.6]` 0; `js::StringEqualsAscii(JSLinearString const*, char const*) [l` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4150** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 48, DOM Worker 14, Renderer 14, BgPool 10, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, IPC I/O 1, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 48 ms (22.8% of span): Layout 20, JavaScript 16, Idle 4, Graphics 3, Other 2, Profiler 2
  - JS leaf 3 / native under JS 28 / native 17; buckets: ipc 48, paint_layout 24, gc_cc 14, harness_diagnostics 10, array_buffer_copy 9, worker_messaging 8, poll_wait 5, engine_stream_read 5
  - top self: `nsContentUtils::GetCurrentJSContext() [libxul.so]` 4; `poll [libc.so.6]` 4; `[axiosozo-dev]` 3; `nsIFrame::IsBlockContainer() const [libxul.so]` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 2; `recvmsg [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 14 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `ps_quad_textured_TEXTURE_2D_frag::swgl_drawSpanRGB` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `webrender::prim_store::text_run::TextRunKey::new [` 1, `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `unlink [libc.so.6]` 7, `fstatat64 [libc.so.6]` 2, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 14, poll_wait 13, array_buffer_copy 0; top self: `poll [libc.so.6]` 13; `wait4 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `write [libc.so.6]` 0; `[axiosozo-dev]` 0
- **tab:4148** CPU ms by thread group: main 5, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (2.3% of span): Idle 3, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `mozilla::dom::Document::GetDocShell() const [libxul.so]` 1; `nsIFrame::Combines3DTransformWithAncestors() const [libxul.s` 0; `non-virtual thunk to nsGlobalWindowInner::GetExistingDebugge` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3551** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.2% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **utility:3694** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

