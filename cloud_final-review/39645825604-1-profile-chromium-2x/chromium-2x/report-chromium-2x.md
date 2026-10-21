# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **117.0** (Renderer 55.9, main 40.7, Softwar~cThread 5.1, WRScene~ilder# 5.1, WRRende~ckend# 5.1) | AxioCEFProbe 30.5, cef:renderer 25.4, cef:gpu-process 5.1 | — | 141.0 |
| plain | idle | — | — | **6.3** (main 3.8, Timer 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 2.9, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 20.8 | **27.6** (main 8.1, Renderer 4.5, SwComposite 3.2, DOM Worker 3.2, Backgro~Pool # 2.6) | cef:gpu-process 13.5, cef:renderer 11.3, AxioCEFProbe 8.7, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **31.7** (main 8.3, Renderer 4.6, SwComposite 3.3, DOM Worker 3.3, Backgro~Pool # 3.0) | cef:gpu-process 15.9, cef:renderer 11.6, AxioCEFProbe 10.0, Web Content 0.3 | — | — |
| plain | scroll | 59.9 | 21.0 | **47.7** (main 18.9, DOM Worker 7.7, Backgro~Pool # 7.3, Renderer 4.4, SwComposite 2.9) | cef:gpu-process 55.7, cef:renderer 15.0, AxioCEFProbe 14.6, Web Content 0.5 | — | — |
| plain | key | — | — | **47.7** (main 15.1, DOM Worker 11.5, IndexedDB IO # 6.8, Renderer 3.0, IPDL Background 2.5) | AxioCEFProbe 2.5, cef:renderer 2.2, cef:gpu-process 0.8, Utility Process 0.3 | 12.7 | — |
| plain | switch-to-gecko | — | — | **173.9** (DOM Worker 67.4, main 56.1, Renderer 16.8, glean.dispatche 5.6, IPC I/O Parent 5.6) |  | — | 135.7 |
| trace | switch-to-engine | — | — | **118.0** (Renderer 78.7, main 31.5, Timer 3.9, DOM Worker 3.9) | AxioCEFProbe 51.0, cef:gpu-process 35.4, cef:utility 15.7, cef:renderer 15.7 | — | 216.1 |
| trace | idle | — | — | **10.1** (main 5.2, DOM Worker 2.4, Timer 1.0, TaskCon~ller # 1.0, IPC I/O Parent 0.5) | Web Content 3.3, AxioCEFProbe 3.0 | — | — |
| trace | raf | 60.1 | 20.9 | **27.3** (main 9.0, Renderer 4.5, SwComposite 3.2, DOM Worker 3.2, Backgro~Pool # 2.9) | cef:gpu-process 13.8, cef:renderer 11.0, AxioCEFProbe 9.3 | — | — |
| trace | raf-nosampler | — | — | **24.1** (main 5.3, Renderer 4.3, DOM Worker 3.3, Backgro~Pool # 3.0, SwComposite 3.0) | cef:gpu-process 15.3, cef:renderer 11.9, AxioCEFProbe 9.6 | — | — |
| trace | scroll | 60.0 | 20.9 | **50.3** (main 19.9, DOM Worker 8.3, Backgro~Pool # 6.8, Renderer 4.4, SwComposite 2.9) | cef:gpu-process 57.3, AxioCEFProbe 14.2, cef:renderer 13.6 | — | — |
| trace | key | — | — | **15.5** (main 8.0, Renderer 2.5, DOM Worker 1.4, Timer 0.8, SwComposite 0.8) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 12.9 | — |
| trace | switch-to-gecko | — | — | **1.7** (main 0.7, TaskCon~ller # 0.3, Renderer 0.2, glean.dispatche 0.1, DOM Worker 0.1) | Privileged Cont 0.2, Web Content 0.1, Isolated Web Co 0.1 | — | 15020.7 |
| profile | switch-to-engine | — | — | **87.8** (main 35.1, Renderer 30.7, DOM Worker 8.8, SamplerThread 8.8, SwComposite 4.4) | AxioCEFProbe 35.2, cef:renderer 17.6, Web Content 13.2, cef:gpu-process 8.8 | — | 160.8 |
| profile | idle | — | — | **26.2** (SamplerThread 9.5, DOM Worker 8.6, main 5.2, Timer 1.9, glean.dispatche 0.5) | Web Content 10.5, AxioCEFProbe 3.0, Isolated Web Co 2.4, WebExtensions 1.9 | — | — |
| profile | raf | 60.0 | 21.3 | **57.9** (main 12.8, DOM Worker 12.2, SamplerThread 11.9, Renderer 4.8, SwComposite 3.5) | cef:gpu-process 16.6, cef:renderer 12.8, Web Content 10.6, AxioCEFProbe 9.2 | — | — |
| profile | raf-nosampler | — | — | **50.0** (DOM Worker 12.5, SamplerThread 10.6, main 7.3, Renderer 5.6, Backgro~Pool # 4.0) | cef:gpu-process 17.2, cef:renderer 12.9, Web Content 10.9, AxioCEFProbe 10.0 | — | — |
| profile | scroll | 59.9 | 20.9 | **78.8** (main 25.3, DOM Worker 16.7, SamplerThread 12.4, Backgro~Pool # 7.6, Renderer 4.8) | cef:gpu-process 64.6, AxioCEFProbe 13.3, cef:renderer 13.3, Web Content 10.5 | — | — |
| profile | key | — | — | **40.2** (main 11.2, DOM Worker 9.6, SamplerThread 9.6, Renderer 3.0, Timer 1.9) | Web Content 9.6, AxioCEFProbe 2.7, WebExtensions 2.5, cef:renderer 2.5 | 15.5 | — |
| profile | switch-to-gecko | — | — | **5.5** (SamplerThread 4.0, DOM Worker 0.4, main 0.3, Renderer 0.2, IPC I/O Parent 0.1) | Web Content 9.1, WebExtensions 2.3, Isolated Web Co 1.7, Privileged Cont 1.6 | — | 16472.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 9.4 | 0.0 | 0 | 0.0 | — | — | 2.7 | 0.0 | — | 1.29 | 0.16 | — | — | — | — | — | 0.033 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.30 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 59.6 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.30 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 58.6 | 0.0 | 0 | 0.0 | — | — | 11.7 | 0.0 | — | 0.62 | 0.12 | — | — | — | — | — | 0.007 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | 0.22 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.3 | 0.0 | 0 | 0.0 | — | — | 11.8 | 0.0 | — | 2.62 | 0.83 | — | — | — | — | — | 0.006 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.35 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.35 | 0.17 | — | — | — | — | — | 0.012 |
| profile | scroll | 58.4 | 0.0 | 0 | 0.0 | — | — | 7.5 | 0.0 | — | 0.76 | 0.16 | — | — | — | — | — | 0.012 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.9 | 0.0 | — | 0.50 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.589 | 2.133 | 0.0142 | 0.0190 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.176 | 0.231 | 0.0106 | 0.0139 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.211 | 0.263 | 0.0126 | 0.0158 |
| plain | scroll | memfd | native | 121 | 120 | 0.592 | 0.600 | 0.0342 | 0.0344 |
| plain | key | memfd | native | 21 | 21 | 0.057 | 0.166 | 0.0003 | 0.0009 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 1.244 | 1.613 | 0.0117 | 0.0151 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 188 | 188 | 0.177 | 0.226 | 0.0107 | 0.0136 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.202 | 0.246 | 0.0121 | 0.0147 |
| trace | scroll | memfd | native | 122 | 122 | 0.537 | 0.566 | 0.0314 | 0.0332 |
| trace | key | memfd | native | 21 | 21 | 0.042 | 0.147 | 0.0002 | 0.0008 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.921 | 2.718 | 0.0141 | 0.0199 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.211 | 0.265 | 0.0127 | 0.0159 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.225 | 0.275 | 0.0135 | 0.0165 |
| profile | scroll | memfd | native | 124 | 124 | 0.628 | 0.653 | 0.0367 | 0.0381 |
| profile | key | memfd | native | 21 | 21 | 0.063 | 0.168 | 0.0004 | 0.0010 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 8.3 | 0.0 | — | 0.21 | 0.41 | — | — | 10.4 | 9.3 | 19.8 |
| profile | 0.6 | 10.7 | 0.0 | — | 0.48 | 0.81 | — | — | 11.4 | 12.1 | 23.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 52.0; write create 84.4; first frame applied (native receiver) 260.0; write frame_ack 270.1; write focus 278.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 24.9; first stdout read resolved 32.2; write shutdown 39.1

Switch timeline (profile, switch-to-engine, ms after the window start): write create 61.0; first stdout read resolved 73.1; first frame applied (native receiver) 196.5; write frame_ack 197.8; write focus 209.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 36.1; first stdout read resolved 45.1; write shutdown 50.6

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 76, main 66, DOM Worker 16, BgPool 7, SwComposite 6, WRRenderBackend 5, Compositor 3, WRSceneBuilder 2, IPC I/O 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 66 ms (24.3% of span): Layout 26, Idle 16, JavaScript 8, Other 6, Graphics 4, DOM 4
  - JS leaf 1 / native under JS 27 / native 38; buckets: ipc 66, paint_layout 31, gc_cc 18, poll_wait 18, array_buffer_copy 11, worker_messaging 5, harness_diagnostics 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 17; `nsFlexContainerFrame::FlexLine::PositionItemsInMainAxis(mozi` 8; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 4; `nsSplittableFrame::FirstContinuation() const [libxul.so]` 4; `[axiosozo-dev]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 75 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 31, `hypotf@@GLIBC_2.35 [libm.so.6]` 9, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 8); SwComposite 6 ms (top self: `syscall [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 7 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 4, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 14, poll_wait 14, array_buffer_copy 0; top self: `poll [libc.so.6]` 14; `[axiosozo-dev]` 1; `mozilla::dom::AutoJSAPI::ReportException() [libxul` 1; `js::BoundFunctionObject::createWithTemplate(JSCont` 0; `__lll_lock_wake [libc.so.6]` 0
- **tab:4318** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (18.4% of span): Other 37, JavaScript 4, Profiler 3, DOM 3, Idle 1
  - JS leaf 0 / native under JS 4 / native 43; buckets: ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 4, memcpy_memset 2, poll_wait 1, canvas_2d 1
  - top self: `[]` 4; `__lll_lock_wake [libc.so.6]` 3; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 3; `[libfontconfig.so.1]` 3; `__strlen_avx2 [libc.so.6]` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4329** CPU ms by thread group: main 21, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (7.9% of span): Other 9, DOM 5, Profiler 3, JavaScript 3, GC / CC 1, Idle 1
  - JS leaf 1 / native under JS 5 / native 15; buckets: ipc 21, gc_cc 13, subprocess_pipe_io 6, memcpy_memset 1, array_buffer_copy 1, poll_wait 1
  - top self: `__lll_lock_wake [libc.so.6]` 2; `[]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `regex_automata::meta::regex::Builder::build [libxul.so]` 2; `mozilla::Vector<js::frontend::ScriptStencil, 1ul, js::System` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4169** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.9% of span): Idle 1, Other 1, Graphics 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 103, main 97, other 20, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 97 ms (4.6% of span): Idle 82, JavaScript 7, Other 7, Profiler 2, DOM 0
  - JS leaf 0 / native under JS 8 / native 89; buckets: ipc 97, poll_wait 86, harness_diagnostics 7, array_buffer_copy 4, gc_cc 3, subprocess_pipe_io 2, json_metadata 1, worker_messaging 1
  - top self: `poll [libc.so.6]` 82; `recvmsg [libc.so.6]` 2; `[unknown]` 1; `[axiosozo-dev]` 1; `PerformPromiseRace(JSContext*, PromiseForOfIterator&, JS::Ha` 1; `js::ScriptSource::tryCompressOffThread(JSContext*) [libxul.s` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 103 ms: buckets subprocess_pipe_io 103, js_ctypes 103, worker_messaging 103, ipc 103, poll_wait 103; top self: `poll [libc.so.6]` 103
- **tab:4329** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3674** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 373, DOM Worker 287, Renderer 144, BgPool 129, SwComposite 105, WRRenderBackend 52, Compositor 40, other 33, ImageBridge 18, WRSceneBuilder 8, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 373 ms (11.8% of span): Idle 248, JavaScript 64, Other 34, DOM 16, Profiler 8, GC / CC 3
  - JS leaf 8 / native under JS 70 / native 295; buckets: ipc 373, poll_wait 270, gc_cc 70, worker_messaging 34, engine_stream_read 33, json_metadata 20, subprocess_pipe_io 15, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 252; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 144 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `__memmove_avx_unaligned_erms [libc.so.6]` 32, `syscall [libc.so.6]` 5); SwComposite 105 ms (top self: `syscall [libc.so.6]` 94, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `Composite [libxul.so]` 1); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 95 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); BgIOThreadPool #4 34 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 31, `write [libc.so.6]` 1, `open64 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `[axiosozo-dev]` 0, `mozilla::ipc::MessageChannel::OnMessageReceivedFro` 0)
  - busiest DOM Worker 287 ms: buckets subprocess_pipe_io 287, worker_messaging 287, ipc 287, js_ctypes 268, poll_wait 264, gc_cc 7; top self: `poll [libc.so.6]` 264; `__lll_lock_wake [libc.so.6]` 2; `[axiosozo-dev]` 2; `write [libc.so.6]` 2; `[unknown]` 1
- **tab:3692** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Other 1, Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 273, main 213, Renderer 141, SwComposite 105, BgPool 98, WRRenderBackend 51, Compositor 40, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 213 ms (7.0% of span): Idle 115, JavaScript 59, Other 18, DOM 17, Profiler 2, GC / CC 2
  - JS leaf 7 / native under JS 64 / native 142; buckets: ipc 212, poll_wait 123, gc_cc 75, engine_stream_read 38, worker_messaging 35, json_metadata 20, native_receiver 16, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 116; `[unknown]` 11; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 4; `recvmsg [libc.so.6]` 4; `write [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 141 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 72, `__memmove_avx_unaligned_erms [libc.so.6]` 41, `syscall [libc.so.6]` 8); SwComposite 105 ms (top self: `syscall [libc.so.6]` 97, `__memmove_avx_unaligned_erms [libc.so.6]` 7); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 98 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `[linux-vdso.so.1]` 1); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `[axiosozo-dev]` 0, `IPC::StringFromIPCMessageType(unsigned int) [libxu` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 273 ms: buckets subprocess_pipe_io 273, worker_messaging 273, ipc 273, js_ctypes 255, poll_wait 250, gc_cc 7; top self: `poll [libc.so.6]` 250; `[axiosozo-dev]` 2; `write [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `[unknown]` 1
- **tab:3692** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, DOM 1, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4329** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::RunnableTask::Run() [libxul.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 493, DOM Worker 289, BgPool 151, Renderer 92, SwComposite 61, WRRenderBackend 37, Compositor 27, other 23, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 493 ms (23.2% of span): Idle 275, JavaScript 107, Other 51, Graphics 23, DOM 21, Layout 9
  - JS leaf 20 / native under JS 106 / native 367; buckets: ipc 493, poll_wait 348, gc_cc 106, paint_layout 60, worker_messaging 50, engine_stream_read 35, harness_diagnostics 23, json_metadata 23
  - top self: `poll [libc.so.6]` 278; `[unknown]` 19; `recvmsg [libc.so.6]` 10; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 7; `[axiosozo-dev]` 5; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 5
  - WebRender/compositor threads: Renderer 92 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `syscall [libc.so.6]` 13); SwComposite 61 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 5, `webrender::composite::CompositeState::get_surface_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 151 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 97, `__memmove_avx_unaligned_erms [libc.so.6]` 50, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 289 ms: buckets subprocess_pipe_io 289, worker_messaging 289, ipc 289, js_ctypes 252, poll_wait 241, gc_cc 15; top self: `poll [libc.so.6]` 241; `write [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 3; `[axiosozo-dev]` 3; `[unknown]` 3
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `[linux-vdso.so.1]` 0; `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3674** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 374, DOM Worker 235, Renderer 109, SwComposite 38, other 38, WRRenderBackend 15, Compositor 15, WRWorker 11, WRSceneBuilder 9, BgPool 6, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 374 ms (10.1% of span): Idle 169, JavaScript 68, Layout 44, Other 33, Graphics 30, DOM 21
  - JS leaf 8 / native under JS 122 / native 243; buckets: ipc 374, poll_wait 209, paint_layout 82, gc_cc 78, worker_messaging 61, engine_stream_read 30, subprocess_pipe_io 17, json_metadata 15
  - top self: `poll [libc.so.6]` 169; `[unknown]` 14; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 4
  - WebRender/compositor threads: Renderer 109 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 42, `hypotf@@GLIBC_2.35 [libm.so.6]` 11, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8); SwComposite 38 ms (top self: `syscall [libc.so.6]` 22, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.s` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[axiosozo-dev]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `nsXULPopupShownEvent::AddRef() [libxul.so]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 235 ms: buckets subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 220, poll_wait 218, gc_cc 5; top self: `poll [libc.so.6]` 218; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `mozilla::BaseTimeDurationPlatformUtils::ToSeconds(` 1; `xpc::OpaqueXrayTraits::enumerateNames(JSContext*, ` 1
- **tab:3603** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, J` 0; `GetExistingDataProperty(JSContext*, JS::Handle<js::NativeObj` 0; `[unknown]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimer::InitWithNamedFuncCallback(void (*)(nsITimer*, void*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3653** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 63, DOM Worker 62, Renderer 40, BgPool 9, IPC I/O 6, SwComposite 4, Compositor 4, WRRenderBackend 2, WRSceneBuilder 2, other 2, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 63 ms (0.4% of span): Idle 20, Layout 16, Other 10, JavaScript 10, DOM 2, Graphics 2
  - JS leaf 1 / native under JS 21 / native 42; buckets: ipc 63, poll_wait 24, paint_layout 21, array_buffer_copy 9, harness_diagnostics 9, gc_cc 7, memcpy_memset 4, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 22; `madvise [libc.so.6]` 4; `style::properties::generated::longhands::corner_top_right_sh` 3; `syscall [libc.so.6]` 2; `mprotect [libc.so.6]` 2; `recvmsg [libc.so.6]` 1
  - GC/CC markers: GCMinor 2× 0 ms
  - WebRender/compositor threads: Renderer 40 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #4 9 ms (top self: `unlink [libc.so.6]` 6, `fstatat64 [libc.so.6]` 1, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 62 ms: buckets subprocess_pipe_io 62, worker_messaging 60, ipc 60, gc_cc 51, poll_wait 11, js_ctypes 10; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 7; `[axiosozo-dev]` 5; `mozilla::ProfileChunkedBuffer::ResetChunkManager(m` 4
- **tab:3653** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3692** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__memcmp_avx2_movbe [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

