# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **48.9** (main 18.4, Renderer 13.8, DOM Worker 4.6, glean.dispatche 3.1, Backgro~Pool # 1.5) | AxioCEFProbe 38.2, cef:gpu-process 18.4, cef:utility 10.7, cef:renderer 7.7 | — | 617.2 |
| plain | idle | — | — | **5.8** (main 4.3, TaskCon~ller # 1.0, Timer 0.5) | AxioCEFProbe 2.5, cef:zygote 0.5, cef:renderer 0.5, Web Content 0.5 | — | — |
| plain | raf | 60.0 | 20.7 | **28.3** (main 8.4, Renderer 4.5, Backgro~Pool # 3.5, SwComposite 3.5, DOM Worker 2.6) | cef:gpu-process 14.4, cef:renderer 11.0, AxioCEFProbe 9.1 | — | — |
| plain | raf-nosampler | — | — | **35.5** (main 8.9, Renderer 4.6, Backgro~Pool # 3.6, SwComposite 3.6, BgIOThr~Pool # 3.3) | cef:gpu-process 16.2, cef:renderer 10.9, AxioCEFProbe 8.6 | — | — |
| plain | scroll | 60.0 | 22.0 | **47.5** (main 18.7, DOM Worker 8.6, Backgro~Pool # 5.7, Renderer 4.8, SwComposite 2.9) | cef:gpu-process 60.4, cef:renderer 13.8, AxioCEFProbe 13.4 | — | — |
| plain | key | — | — | **71.2** (main 20.7, DOM Worker 17.7, Indexed~ IO # 8.5, IndexedDB IO # 5.5, IPDL Background 5.2) | cef:renderer 2.2, AxioCEFProbe 1.9, cef:gpu-process 1.3, WebExtensions 0.3 | 13.6 | — |
| plain | switch-to-gecko | — | — | **122.0** (main 40.7, Renderer 23.3, IPDL Background 11.6, Indexed~ IO # 11.6, Cache2 I/O 5.8) | WebExtensions 5.8, Utility Process 5.8, Isolated Web Co 5.8 | — | 137.6 |
| trace | switch-to-engine | — | — | **127.9** (Renderer 76.3, main 24.5, Backgro~Pool # 8.2, Compositor 5.4, glean.dispatche 2.7) | AxioCEFProbe 54.4, cef:gpu-process 38.1, cef:utility 16.3, cef:renderer 13.6 | — | 308.7 |
| trace | idle | — | — | **8.6** (main 4.3, DOM Worker 2.4, TaskCon~ller # 1.4, Timer 0.5) | AxioCEFProbe 3.9, Web Content 3.8, cef:zygote 0.5 | — | — |
| trace | raf | 60.0 | 21.3 | **30.5** (main 9.3, Renderer 4.8, Backgro~Pool # 3.9, SwComposite 3.5, DOM Worker 2.9) | cef:gpu-process 15.4, cef:renderer 11.6, AxioCEFProbe 9.0 | — | — |
| trace | raf-nosampler | — | — | **25.0** (main 5.6, Renderer 4.6, Backgro~Pool # 3.6, SwComposite 3.3, DOM Worker 3.3) | cef:gpu-process 15.9, cef:renderer 11.5, AxioCEFProbe 8.3 | — | — |
| trace | scroll | 60.0 | 21.1 | **49.1** (main 20.2, DOM Worker 7.7, Backgro~Pool # 5.8, Renderer 5.3, SwComposite 3.4) | cef:gpu-process 62.0, cef:renderer 14.0, AxioCEFProbe 12.9 | — | — |
| trace | key | — | — | **17.1** (main 7.7, Renderer 3.0, SwComposite 1.4, DOM Worker 1.4, Timer 0.8) | cef:renderer 2.5, AxioCEFProbe 2.4, cef:gpu-process 0.8, Privileged Cont 0.3 | 13.2 | — |
| trace | switch-to-gecko | — | — | **55.5** (main 24.6, Renderer 12.3, WRScene~ilder# 6.2, Compositor 6.2, BgIOThr~Pool # 6.2) |  | — | 134.1 |
| profile | switch-to-engine | — | — | **98.8** (Renderer 32.9, main 29.2, SamplerThread 11.0, Compositor 7.3, DOM Worker 7.3) | Web Content 69.5, AxioCEFProbe 36.7, cef:renderer 21.9, Isolated Web Co 7.4 | — | 217.3 |
| profile | idle | — | — | **22.7** (SamplerThread 8.0, DOM Worker 7.1, main 5.7, Timer 1.4, TaskCon~ller # 0.5) | Web Content 8.5, AxioCEFProbe 3.7, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 60.0 | 21.1 | **57.6** (main 12.8, SamplerThread 11.8, DOM Worker 11.5, Renderer 5.7, SwComposite 4.1) | cef:gpu-process 17.2, cef:renderer 13.1, AxioCEFProbe 10.0, Web Content 9.6 | — | — |
| profile | raf-nosampler | — | — | **51.3** (DOM Worker 11.9, SamplerThread 10.6, main 7.6, Renderer 5.3, Backgro~Pool # 4.6) | cef:gpu-process 18.2, cef:renderer 12.3, Web Content 9.9, AxioCEFProbe 9.3 | — | — |
| profile | scroll | 60.2 | 23.6 | **78.7** (main 25.7, DOM Worker 16.2, SamplerThread 12.4, Backgro~Pool # 6.7, Renderer 5.2) | cef:gpu-process 66.6, cef:renderer 14.8, AxioCEFProbe 13.3, Web Content 10.0 | — | — |
| profile | key | — | — | **38.9** (main 11.7, SamplerThread 9.8, DOM Worker 9.0, Renderer 3.5, Timer 1.6) | Web Content 9.0, AxioCEFProbe 2.7, WebExtensions 2.4, cef:renderer 2.2 | 15.9 | — |
| profile | switch-to-gecko | — | — | **7.7** (SamplerThread 3.8, BgIOThr~Pool # 2.5, DOM Worker 0.5, main 0.4, Renderer 0.2) | Web Content 8.2, WebExtensions 1.7, Isolated Web Co 1.6, Privileged Cont 1.6 | — | 15029.0 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 7.7 | 0.0 | 0 | 0.0 | — | — | 1.3 | 0.0 | — | 5.43 | 0.19 | — | — | — | — | — | 0.004 |
| trace | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.35 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.36 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 11.5 | 0.0 | — | 0.57 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | 0.27 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 10.0 | 0.0 | 0 | 0.0 | — | — | 1.9 | 0.0 | — | 5.57 | 0.33 | — | — | — | — | — | 0.008 |
| profile | raf | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.40 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.41 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.3 | 0.0 | 0 | 0.0 | — | — | 6.7 | 0.0 | — | 0.65 | 0.18 | — | — | — | — | — | 0.012 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.1 | 0.0 | — | 0.39 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.157 | 6.080 | 0.0093 | 0.0180 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.221 | 0.325 | 0.0133 | 0.0195 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.243 | 0.360 | 0.0145 | 0.0215 |
| plain | scroll | memfd | native | 122 | 122 | 0.460 | 0.539 | 0.0266 | 0.0312 |
| plain | key | memfd | native | 21 | 21 | 0.046 | 0.147 | 0.0003 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 3.526 | 9.130 | 0.0270 | 0.0699 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 188 | 188 | 0.231 | 0.329 | 0.0138 | 0.0197 |
| trace | raf-nosampler | memfd | native | 182 | 183 | 0.249 | 0.346 | 0.0149 | 0.0208 |
| trace | scroll | memfd | native | 123 | 123 | 0.482 | 0.535 | 0.0282 | 0.0313 |
| trace | key | memfd | native | 21 | 21 | 0.050 | 0.162 | 0.0003 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 2.685 | 9.329 | 0.0268 | 0.0931 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.256 | 0.366 | 0.0154 | 0.0220 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.280 | 0.401 | 0.0168 | 0.0240 |
| profile | scroll | memfd | native | 124 | 124 | 0.522 | 0.597 | 0.0304 | 0.0348 |
| profile | key | memfd | native | 21 | 21 | 0.058 | 0.155 | 0.0003 | 0.0009 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 8.8 | 0.0 | — | 0.27 | 0.46 | — | — | 9.3 | 9.8 | 18.7 |
| profile | 0.8 | 11.1 | 0.0 | — | 0.37 | 0.69 | — | — | 9.5 | 13.0 | 23.4 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 128.2; write create 150.0; first frame applied (native receiver) 325.8; write frame_ack 326.9; write focus 341.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 23.0; first stdout read resolved 30.2; write shutdown 34.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 39.0; first stdout read resolved 59.2; first frame applied (native receiver) 224.6; write frame_ack 226.4; write focus 244.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 33.3; first stdout read resolved 42.0; write shutdown 51.8

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 103, main 73, BgPool 24, DOM Worker 16, SwComposite 6, Compositor 6, WRRenderBackend 5, WRSceneBuilder 3, IPC I/O 3, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 73 ms (24.5% of span): Layout 21, Idle 17, DOM 14, JavaScript 12, Graphics 5, Other 4
  - JS leaf 1 / native under JS 35 / native 36; buckets: ipc 73, paint_layout 31, gc_cc 21, poll_wait 20, array_buffer_copy 13, harness_diagnostics 6, subprocess_pipe_io 6, engine_stream_read 3
  - top self: `poll [libc.so.6]` 17; `mozilla::EffectCompositor::PreTraverseInSubtree(mozilla::Ser` 6; `mozilla::dom::Document::EndUpdate() [libxul.so]` 5; `nsIFrame::IsTransformed() const [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 4; `wr_dp_push_image [libxul.so]` 3
  - WebRender/compositor threads: Renderer 103 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 37, `hypotf@@GLIBC_2.35 [libm.so.6]` 14, `ClearTexSubImage [libxul.so]` 8); SwComposite 6 ms (top self: `syscall [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 2, `webrender::batch::AlphaBatchList::set_params_and_g` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 24 ms (top self: `ARGBSetRow_X86 [libxul.so]` 12, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15, poll_wait 15; top self: `poll [libc.so.6]` 15; `mozilla::ThreadEventQueue::HasPendingEvent() [libx` 1; `JS::SetWarningReporter(JSContext*, void (*)(JSCont` 0; `js::jit::IonUnaryArithIC::update(JSContext*, JS::H` 0; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js` 0
- **tab:4213** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (18.4% of span): Other 38, DOM 4, JavaScript 4, Idle 1, GC / CC 1, Profiler 1
  - JS leaf 0 / native under JS 6 / native 42; buckets: ipc 36, array_buffer_copy 14, gc_cc 10, memcpy_memset 5, subprocess_pipe_io 3, poll_wait 1
  - top self: `[]` 8; `[libexpat.so.1]` 3; `mozilla::dom::WebExtensionPolicy_Binding::getByID(JSContext*` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__strncmp_avx2 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 4 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4218** CPU ms by thread group: main 47, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (20.8% of span): Other 35, Profiler 5, DOM 4, JavaScript 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 34, array_buffer_copy 14, gc_cc 10, subprocess_pipe_io 4, memcpy_memset 3, json_metadata 1, poll_wait 1
  - top self: `[libfontconfig.so.1]` 4; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 3; `getcontext [libc.so.6]` 3; `mmap64 [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 2; `[]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4024** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.0% of span): Idle 2, Layout 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `mozilla::AutoProfilerStyleMarker::~AutoProfilerStyleMarker()` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 102, DOM Worker 89, other 18, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 102 ms (4.8% of span): Idle 85, JavaScript 10, Other 4, GC / CC 2, Profiler 1, DOM 1
  - JS leaf 0 / native under JS 9 / native 93; buckets: ipc 102, poll_wait 87, harness_diagnostics 8, gc_cc 7, array_buffer_copy 5, subprocess_pipe_io 3, native_receiver 0, worker_messaging 0
  - top self: `poll [libc.so.6]` 85; `[unknown]` 1; `js::Proxy::getOwnPropertyDescriptor(JSContext*, JS::Handle<J` 1; `mozilla::CycleCollectedJSRuntime::JSObjectsTenured(JS::GCCon` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [libxul.so]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 89 ms: buckets subprocess_pipe_io 89, worker_messaging 89, ipc 89, js_ctypes 89, poll_wait 89; top self: `poll [libc.so.6]` 89; `getcontext [libc.so.6]` 0
- **tab:4027** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3533** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3494** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 368, DOM Worker 275, Renderer 161, BgPool 122, SwComposite 115, WRRenderBackend 55, Compositor 40, other 30, ImageBridge 18, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 367 ms (11.6% of span): Idle 247, JavaScript 83, Other 23, DOM 10, Profiler 4
  - JS leaf 7 / native under JS 82 / native 279; buckets: ipc 367, poll_wait 263, gc_cc 74, worker_messaging 33, engine_stream_read 31, json_metadata 21, harness_diagnostics 16, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 249; `[unknown]` 15; `mprotect [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `write [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 161 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `syscall [libc.so.6]` 9); SwComposite 115 ms (top self: `syscall [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 47, `webrender::frame_builder::FrameBuilder::build [lib` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 121 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `__memmove_avx_unaligned_erms [libc.so.6]` 21, `[linux-vdso.so.1]` 2); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__lll_lock_wake [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #4 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `NS_NewNativeLocalFile [libxul.so]` 0)
  - busiest DOM Worker 275 ms: buckets subprocess_pipe_io 275, worker_messaging 275, ipc 275, js_ctypes 258, poll_wait 255, gc_cc 6; top self: `poll [libc.so.6]` 255; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[unknown]` 1; `__lll_lock_wake [libc.so.6]` 1; `mozilla::dom::MessageEvent::cycleCollection::Unlin` 1
- **tab:3533** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3494** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 267, main 211, Renderer 150, BgPool 127, SwComposite 110, WRRenderBackend 52, Compositor 39, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 116, JavaScript 54, Other 23, DOM 12, Profiler 5, GC / CC 1
  - JS leaf 6 / native under JS 56 / native 149; buckets: ipc 211, poll_wait 128, gc_cc 69, worker_messaging 40, engine_stream_read 34, json_metadata 20, native_receiver 16, subprocess_pipe_io 13
  - top self: `poll [libc.so.6]` 118; `[unknown]` 14; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 150 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 37, `syscall [libc.so.6]` 7); SwComposite 110 ms (top self: `syscall [libc.so.6]` 88, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 127 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 95, `__memmove_avx_unaligned_erms [libc.so.6]` 31, `mozilla::layers::TextureClientRecycleAllocator::Cr` 0); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `[axiosozo-dev]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 267 ms: buckets subprocess_pipe_io 267, worker_messaging 267, ipc 267, js_ctypes 250, poll_wait 246, gc_cc 7; top self: `poll [libc.so.6]` 246; `[axiosozo-dev]` 3; `[unknown]` 1; `nsTHashtable<nsBaseHashtableET<mozilla::dom::Timeo` 1; `write [libc.so.6]` 1
- **tab:3494** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4218** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 512, DOM Worker 288, BgPool 133, Renderer 101, SwComposite 68, WRRenderBackend 39, Compositor 28, other 21, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 513 ms (24.1% of span): Idle 295, JavaScript 95, Other 67, DOM 21, Graphics 17, Layout 10
  - JS leaf 10 / native under JS 100 / native 402; buckets: ipc 512, poll_wait 388, gc_cc 86, paint_layout 54, worker_messaging 40, subprocess_pipe_io 27, array_buffer_copy 26, engine_stream_read 25
  - top self: `poll [libc.so.6]` 302; `recvmsg [libc.so.6]` 16; `[unknown]` 13; `write [libc.so.6]` 11; `[axiosozo-dev]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4
  - WebRender/compositor threads: Renderer 101 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 70, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `syscall [libc.so.6]` 8); SwComposite 68 ms (top self: `syscall [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 6, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 133 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `__memmove_avx_unaligned_erms [libc.so.6]` 41, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::ipc::NodeController::GetMessage(mojo::cor` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 288 ms: buckets subprocess_pipe_io 288, worker_messaging 288, ipc 288, js_ctypes 249, poll_wait 239, gc_cc 13; top self: `poll [libc.so.6]` 239; `getcontext [libc.so.6]` 6; `[unknown]` 4; `__lll_lock_wake [libc.so.6]` 4; `mozilla::CycleCollectedJSRuntime::NurseryWrapperAd` 2
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `g_main_context_iteration [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3533** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3515** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 397, DOM Worker 222, Renderer 118, SwComposite 48, other 34, WRRenderBackend 17, Compositor 16, WRWorker 13, WRSceneBuilder 9, BgPool 5, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 397 ms (10.7% of span): Idle 169, JavaScript 79, Layout 42, Other 41, Graphics 32, DOM 15
  - JS leaf 9 / native under JS 130 / native 258; buckets: ipc 397, poll_wait 210, gc_cc 92, paint_layout 86, worker_messaging 62, engine_stream_read 36, array_buffer_copy 22, subprocess_pipe_io 22
  - top self: `poll [libc.so.6]` 171; `[axiosozo-dev]` 13; `[unknown]` 12; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 7; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, J` 5
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 40, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 9); SwComposite 48 ms (top self: `syscall [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 19, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 222 ms: buckets subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 212, poll_wait 209, gc_cc 4; top self: `poll [libc.so.6]` 209; `[unknown]` 2; `[axiosozo-dev]` 1; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 1; `void* js::gc::CellAllocator::AllocTenuredCellForNu` 1
- **tab:3437** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `js::jit::Assembler::movq(js::jit::ImmWord, js::jit::Register` 0; `get (resource://gre/modules/ExtensionUtils.sys.mjs:102:6)[7]` 0; `mozilla::xpcom::StaticComponents::LookupByContractID(nsTSubs` 0; `IPC::ParamTraits<JSStructuredCloneData>::Read(IPC::MessageRe` 0; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3533** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 364, main 70, DOM Worker 65, Renderer 42, IPC I/O 6, Compositor 6, SwComposite 3, WRRenderBackend 3, WRSceneBuilder 2, other 2, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 70 ms (0.5% of span): Layout 18, JavaScript 18, Other 15, Idle 11, Graphics 2, DOM 2
  - JS leaf 1 / native under JS 30 / native 39; buckets: ipc 70, paint_layout 21, poll_wait 14, gc_cc 13, array_buffer_copy 12, harness_diagnostics 10, worker_messaging 6, memcpy_memset 5
  - top self: `poll [libc.so.6]` 12; `mozilla::dom::Event::InitPresContextData(nsPresContext*) [li` 6; `madvise [libc.so.6]` 5; `[unknown]` 3; `style::properties::cascade::Cascade::apply_custom_and_priori` 2; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 2
  - GC/CC markers: GCMinor 2× 1 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 12, `ps_quad_textured_TEXTURE_RECT_vert::quad_primive_i` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 363 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 339, `write [libc.so.6]` 12, `unlink [libc.so.6]` 7); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 65 ms: buckets subprocess_pipe_io 65, worker_messaging 65, ipc 65, gc_cc 54, js_ctypes 10, poll_wait 10; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5; `mozilla::dom::CallbackTimeoutHandler::cycleCollect` 4
- **tab:3533** CPU ms by thread group: main 7, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 3, JavaScript 2, DOM 1, Other 1
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 7, poll_wait 3, gc_cc 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 3; `js::jit::CacheIRCompiler::addFailurePath(js::jit::FailurePat` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `write [libc.so.6]` 1; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, J` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4024** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, Layout 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 0
  - top self: `poll [libc.so.6]` 4; `mozilla::PresShell::FrameNeedsReflow(nsIFrame*, mozilla::Int` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3494** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

