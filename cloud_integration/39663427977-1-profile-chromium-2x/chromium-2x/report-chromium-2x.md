# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **111.7** (Renderer 46.5, main 37.2, WRRende~ckend# 9.3, DOM Worker 9.3, Backgro~Pool # 4.7) | AxioCEFProbe 32.7, cef:renderer 23.3, cef:gpu-process 4.7, Isolated Web Co 4.7 | — | 161.7 |
| plain | idle | — | — | **5.3** (main 3.8, Timer 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 3.3, AxioCEFProbe 3.0, forkserver 0.5, cef:utility 0.5 | — | — |
| plain | raf | 60.0 | 20.9 | **30.6** (main 8.4, Renderer 5.5, Backgro~Pool # 3.9, SwComposite 3.9, DOM Worker 2.9) | cef:gpu-process 15.4, cef:renderer 12.3, AxioCEFProbe 8.7 | — | — |
| plain | raf-nosampler | — | — | **39.3** (main 10.3, Renderer 4.3, Backgro~Pool # 4.0, Socket Thread 3.6, DOM Worker 3.6) | cef:gpu-process 17.6, cef:renderer 11.5, AxioCEFProbe 8.6 | — | — |
| plain | scroll | 60.0 | 21.0 | **47.2** (main 18.7, DOM Worker 6.7, Backgro~Pool # 6.2, Renderer 4.8, SwComposite 3.4) | cef:gpu-process 59.6, cef:renderer 14.8, AxioCEFProbe 12.9 | — | — |
| plain | key | — | — | **40.1** (main 14.5, DOM Worker 9.8, Indexed~ IO # 3.6, Renderer 3.3, IPDL Background 1.9) | AxioCEFProbe 2.7, cef:renderer 1.9, cef:gpu-process 1.0, WebExtensions 0.6 | 13.3 | — |
| plain | switch-to-gecko | — | — | **9.1** (main 3.1, DOM Worker 3.1, IPDL Background 0.9, TaskCon~ller # 0.8, StreamTrans # 0.3) | Privileged Cont 0.2, RDD Process 0.1 | — | 15022.7 |
| trace | switch-to-engine | — | — | **94.9** (Renderer 47.4, main 22.3, DOM Worker 9.8, Backgro~Pool # 4.2, glean.dispatche 1.4) | AxioCEFProbe 86.5, cef:gpu-process 33.5, cef:utility 18.2, cef:zygote 16.7 | — | 655.4 |
| trace | idle | — | — | **3.8** (main 3.3, Timer 0.5) | AxioCEFProbe 4.3, cef:zygote 0.5, cef:gpu-process 0.5, Web Content 0.5 | — | — |
| trace | raf | 60.0 | 20.7 | **29.3** (main 8.6, Renderer 4.8, Backgro~Pool # 3.8, SwComposite 3.8, DOM Worker 2.9) | cef:gpu-process 15.6, cef:renderer 11.5, AxioCEFProbe 9.5, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **25.4** (main 5.3, Renderer 4.6, Backgro~Pool # 3.6, SwComposite 3.6, DOM Worker 3.3) | cef:gpu-process 15.9, cef:renderer 10.2, AxioCEFProbe 9.7 | — | — |
| trace | scroll | 59.9 | 23.2 | **44.8** (main 19.5, DOM Worker 7.6, Backgro~Pool # 6.2, Renderer 4.8, SwComposite 3.3) | cef:gpu-process 60.9, AxioCEFProbe 13.4, cef:renderer 12.8 | — | — |
| trace | key | — | — | **22.1** (main 11.2, Renderer 3.0, TaskCon~ller # 1.9, SwComposite 1.4, DOM Worker 1.1) | AxioCEFProbe 3.3, cef:renderer 2.8, cef:gpu-process 0.8 | 14.0 | — |
| trace | switch-to-gecko | — | — | **42.7** (Renderer 18.3, main 12.2, BgIOThr~Pool # 6.1, DOM Worker 6.1) | Isolated Web Co 6.1 | — | 134.6 |
| profile | switch-to-engine | — | — | **106.1** (Renderer 31.9, main 28.3, DOM Worker 10.6, SamplerThread 10.6, Backgro~Pool # 7.1) | Web Content 38.9, AxioCEFProbe 24.7, cef:renderer 17.7, cef:utility 3.5 | — | 223.7 |
| profile | idle | — | — | **24.1** (SamplerThread 9.0, DOM Worker 7.1, main 5.7, Timer 1.4, TaskCon~ller # 0.9) | Web Content 8.5, AxioCEFProbe 3.3, WebExtensions 1.9, Socket Process 1.4 | — | — |
| profile | raf | 60.1 | 20.8 | **59.8** (main 13.3, SamplerThread 12.0, DOM Worker 11.7, Renderer 5.7, Backgro~Pool # 4.4) | cef:gpu-process 17.7, cef:renderer 12.4, Web Content 9.5, AxioCEFProbe 9.1 | — | — |
| profile | raf-nosampler | — | — | **48.2** (DOM Worker 11.2, SamplerThread 10.6, main 7.3, Renderer 5.6, Backgro~Pool # 4.6) | cef:gpu-process 17.6, cef:renderer 11.6, Web Content 10.6, AxioCEFProbe 10.0 | — | — |
| profile | scroll | 59.9 | 21.9 | **75.4** (main 25.6, DOM Worker 15.2, SamplerThread 11.9, Backgro~Pool # 7.1, Renderer 5.2) | cef:gpu-process 66.9, cef:renderer 15.6, AxioCEFProbe 13.8, Web Content 9.5 | — | — |
| profile | key | — | — | **40.1** (main 11.7, SamplerThread 9.8, DOM Worker 8.7, Renderer 3.3, Timer 1.6) | Web Content 8.7, cef:renderer 2.8, AxioCEFProbe 2.2, WebExtensions 2.2 | 15.8 | — |
| profile | switch-to-gecko | — | — | **78.4** (main 22.4, Renderer 22.4, BgIOThr~Pool # 11.2, Softwar~cThread 5.6, Compositor 5.6) | Isolated Web Co 5.6 | — | 143.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.0 | 0.0 | 0 | 0.0 | — | — | 1.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | scroll | 57.8 | 0.0 | 0 | 0.0 | — | — | 11.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 6.3 | 0.0 | 0 | 0.0 | — | — | 14.8 | 0.0 | — | 6.60 | 1.45 | — | — | — | — | — | 0.009 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.44 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.39 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 57.7 | 0.0 | 0 | 0.0 | — | — | 11.8 | 0.0 | — | 0.71 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.31 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 4.104 | 8.102 | 0.0345 | 0.0681 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.250 | 0.337 | 0.0150 | 0.0202 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.261 | 0.356 | 0.0155 | 0.0212 |
| plain | scroll | memfd | native | 121 | 121 | 0.452 | 0.540 | 0.0260 | 0.0311 |
| plain | key | memfd | native | 21 | 21 | 0.048 | 0.148 | 0.0003 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 4.955 | 9.857 | 0.0199 | 0.0396 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 189 | 189 | 0.243 | 0.354 | 0.0146 | 0.0212 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.243 | 0.370 | 0.0146 | 0.0222 |
| trace | scroll | memfd | native | 123 | 123 | 0.487 | 0.567 | 0.0282 | 0.0328 |
| trace | key | memfd | native | 21 | 21 | 0.055 | 0.157 | 0.0003 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 5.901 | 7.862 | 0.0371 | 0.0494 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 192 | 192 | 0.289 | 0.407 | 0.0174 | 0.0245 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.282 | 0.442 | 0.0169 | 0.0265 |
| profile | scroll | memfd | native | 123 | 123 | 0.593 | 0.646 | 0.0342 | 0.0372 |
| profile | key | memfd | native | 21 | 21 | 0.052 | 0.190 | 0.0003 | 0.0011 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 9.1 | 0.0 | — | — | — | — | — | — | — | — |
| profile | 0.7 | 11.4 | 0.0 | — | 0.29 | 0.66 | — | — | 9.7 | 12.7 | 22.3 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 33.0; spawn AxioCEFProbe resolved 51.2; write hello 69.1; first stdout read resolved 393.0; write create 398.0; write frame_ack 674.2; write focus 684.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 27.5; first stdout read resolved 34.1; write shutdown 42.2

Switch timeline (profile, switch-to-engine, ms after the window start): write create 46.5; first stdout read resolved 61.1; first frame applied (native receiver) 243.9; write frame_ack 246.0; write focus 259.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 31.0; first stdout read resolved 41.5; write shutdown 44.7

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 89, main 76, DOM Worker 21, BgPool 20, SwComposite 8, WRRenderBackend 5, Compositor 5, WRSceneBuilder 3, IPC I/O 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 76 ms (24.1% of span): JavaScript 28, Layout 16, DOM 10, Idle 8, Profiler 6, Other 4
  - JS leaf 1 / native under JS 49 / native 27; buckets: ipc 76, paint_layout 28, gc_cc 27, array_buffer_copy 17, poll_wait 12, harness_diagnostics 11, memcpy_memset 8, webrender_render 7
  - top self: `poll [libc.so.6]` 11; `__memmove_avx_unaligned_erms [libc.so.6]` 8; `nsStyledElement::SetInlineStyleDeclaration(mozilla::StyleLoc` 7; `js::GlobalObject::setPrototype(JSProtoKey, JSObject*) [libxu` 7; `[unknown]` 6; `__lll_lock_wake [libc.so.6]` 5
  - WebRender/compositor threads: Renderer 89 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 46, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 17, `hypotf@@GLIBC_2.35 [libm.so.6]` 8); SwComposite 8 ms (top self: `syscall [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #1 20 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 8, `__memset_avx2_unaligned_erms [libc.so.6]` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `rename [libc.so.6]` 0)
  - busiest DOM Worker 21 ms: buckets subprocess_pipe_io 21, worker_messaging 21, ipc 21, js_ctypes 18, poll_wait 15; top self: `poll [libc.so.6]` 15; `js::PCToLineNumber(unsigned int, JS::LimitedColumn` 3; `write [libc.so.6]` 3
- **tab:4373** CPU ms by thread group: main 51, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (23.1% of span): Other 40, Profiler 4, JavaScript 3, DOM 2, Idle 1, GC / CC 0
  - JS leaf 1 / native under JS 4 / native 47; buckets: ipc 38, array_buffer_copy 18, gc_cc 14, subprocess_pipe_io 6, poll_wait 2
  - top self: `[libfontconfig.so.1]` 8; `__lll_lock_wake [libc.so.6]` 4; `[]` 3; `mozilla::ipc::PBackgroundStarterChild::PBackgroundStarterChi` 2; `poll [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 19, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 19 ms (6.1% of span): Other 14, DOM 3, JavaScript 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 16; buckets: ipc 19, gc_cc 12, subprocess_pipe_io 6, array_buffer_copy 4, poll_wait 1
  - top self: `[]` 4; `js::frontend::PerHandlerParser<js::frontend::FullParseHandle` 1; `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `js::frontend::TDZCheckCache::noteTDZCheck(js::frontend::Byte` 1; `js::frontend::NameOpEmitter::NameOpEmitter(js::frontend::Byt` 1
  - GC/CC markers: GCMinor 1× 4 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4231** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.9% of span): Idle 3, Layout 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `mozilla::SVGObserverUtils::GetAndObserveMasks(nsIFrame*, nsT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 122, DOM Worker 94, other 19, BgPool 1, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 122 ms (5.7% of span): Idle 86, GC / CC 19, JavaScript 6, DOM 5, Other 5, Profiler 1
  - JS leaf 1 / native under JS 10 / native 111; buckets: ipc 122, poll_wait 89, gc_cc 23, harness_diagnostics 7, array_buffer_copy 4, subprocess_pipe_io 1, json_metadata 1, worker_messaging 0
  - top self: `poll [libc.so.6]` 86; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3
  - GC/CC markers: GCSlice 2× 21 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 94 ms: buckets subprocess_pipe_io 94, js_ctypes 94, worker_messaging 94, ipc 94, poll_wait 94; top self: `poll [libc.so.6]` 94
- **tab:3647** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3629** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3608** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 386, DOM Worker 285, Renderer 169, BgPool 135, SwComposite 127, WRRenderBackend 58, Compositor 42, other 32, ImageBridge 18, WRSceneBuilder 9, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 386 ms (12.1% of span): Idle 257, JavaScript 74, Other 29, DOM 21, Profiler 4
  - JS leaf 6 / native under JS 84 / native 296; buckets: ipc 385, poll_wait 272, gc_cc 79, worker_messaging 43, engine_stream_read 29, json_metadata 23, harness_diagnostics 18, native_receiver 16
  - top self: `poll [libc.so.6]` 259; `[unknown]` 14; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 5
  - WebRender/compositor threads: Renderer 169 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 104, `__memmove_avx_unaligned_erms [libc.so.6]` 44, `syscall [libc.so.6]` 12); SwComposite 127 ms (top self: `syscall [libc.so.6]` 102, `__memmove_avx_unaligned_erms [libc.so.6]` 22, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 135 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 101, `__memmove_avx_unaligned_erms [libc.so.6]` 27, `[linux-vdso.so.1]` 3); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0)
  - busiest DOM Worker 285 ms: buckets subprocess_pipe_io 285, worker_messaging 285, ipc 285, js_ctypes 267, poll_wait 264, gc_cc 10; top self: `poll [libc.so.6]` 264; `[unknown]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `js::Nursery::wantEagerCollection() const [libxul.s` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1
- **tab:3647** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `js::jit::CacheIRCompiler::emitIsObjectResult(js::jit::ValOpe` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4373** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimerImpl::CancelImpl(bool) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 255, main 206, Renderer 157, BgPool 136, SwComposite 118, WRRenderBackend 51, Compositor 37, ImageBridge 15, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 206 ms (6.7% of span): Idle 119, JavaScript 55, Other 18, DOM 13, Profiler 1, GC / CC 0
  - JS leaf 4 / native under JS 61 / native 141; buckets: ipc 206, poll_wait 128, gc_cc 63, worker_messaging 40, engine_stream_read 31, json_metadata 23, subprocess_pipe_io 12, array_buffer_copy 10
  - top self: `poll [libc.so.6]` 122; `[unknown]` 9; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `js::Nursery::reallocateBuffer(JS::Zone*, js::gc::Cell*, void` 2; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 157 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 49, `syscall [libc.so.6]` 10); SwComposite 118 ms (top self: `syscall [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `webrender::picture::PictureInstance::take_context ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 135 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 33, `[linux-vdso.so.1]` 2); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wait [libc.so.6]` 0, `mozilla::detail::EventQueueInternal<16ul>::PutEven` 0); BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 255 ms: buckets subprocess_pipe_io 255, worker_messaging 255, ipc 255, js_ctypes 242, poll_wait 239, memcpy_memset 2; top self: `poll [libc.so.6]` 239; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `[unknown]` 1; `write [libc.so.6]` 1; `mozilla::ProfileChunkedBuffer::~ProfileChunkedBuff` 1
- **tab:3647** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3629** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 506, DOM Worker 264, BgPool 146, Renderer 101, SwComposite 70, WRRenderBackend 38, Compositor 26, other 22, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 506 ms (23.8% of span): Idle 273, JavaScript 82, Other 76, Graphics 22, DOM 21, Layout 15
  - JS leaf 6 / native under JS 103 / native 398; buckets: ipc 506, poll_wait 365, gc_cc 88, paint_layout 64, worker_messaging 61, engine_stream_read 28, array_buffer_copy 26, subprocess_pipe_io 26
  - top self: `poll [libc.so.6]` 280; `[unknown]` 18; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 7; `[axiosozo-dev]` 5; `JS_IsNativeFunction(JSObject*, bool (*)(JSContext*, unsigned` 4
  - GC/CC markers: GCMinor 1× 5 ms
  - WebRender/compositor threads: Renderer 101 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 67, `__memmove_avx_unaligned_erms [libc.so.6]` 15, `syscall [libc.so.6]` 6); SwComposite 70 ms (top self: `syscall [libc.so.6]` 68, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 5, `webrender::render_backend::RenderBackend::save_cap` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 146 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 44, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[linux-vdso.so.1]` 0, `non-virtual thunk to mozilla::layers::EGLImageText` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 265 ms: buckets subprocess_pipe_io 265, worker_messaging 265, ipc 265, js_ctypes 240, poll_wait 229, gc_cc 5; top self: `poll [libc.so.6]` 229; `[axiosozo-dev]` 3; `[unknown]` 3; `__strlen_avx2 [libc.so.6]` 3; `nsThread::DrainDirectTasks() [libxul.so]` 2
- **tab:3608** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4373** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 394, DOM Worker 222, Renderer 120, SwComposite 50, other 33, WRRenderBackend 18, Compositor 16, WRWorker 12, WRSceneBuilder 9, BgPool 6, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 394 ms (10.7% of span): Idle 171, JavaScript 72, Layout 44, Other 36, Graphics 30, DOM 26
  - JS leaf 12 / native under JS 131 / native 251; buckets: ipc 392, poll_wait 206, gc_cc 90, paint_layout 84, worker_messaging 63, engine_stream_read 36, subprocess_pipe_io 21, array_buffer_copy 19
  - top self: `poll [libc.so.6]` 171; `[unknown]` 16; `[axiosozo-dev]` 7; `write [libc.so.6]` 5; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::` 5; `recvmsg [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 120 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 51, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `hypotf@@GLIBC_2.35 [libm.so.6]` 15); SwComposite 50 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 28, `syscall [libc.so.6]` 22, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 13, `webrender::frame_builder::FrameBuilder::build [lib` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 222 ms: buckets subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 203, poll_wait 200, gc_cc 6; top self: `poll [libc.so.6]` 199; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2
- **tab:3555** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `RefPtr<mozilla::dom::JSExecutionManager>::~RefPtr() [libxul.` 0; `apply (self-hosted:2805:23)[3]` 0; `js::IsDeadProxyObject(JSObject const*) [libxul.so]` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3608** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::MainThreadIdlePeriod::GetIdlePeriodHint(mozilla::Ti` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4236** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 40, Renderer 38, BgPool 13, DOM Worker 12, Compositor 4, SwComposite 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 1, Socket 0, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 40 ms (20.0% of span): JavaScript 14, Layout 12, Idle 10, DOM 2, Graphics 2, Other 1
  - JS leaf 1 / native under JS 27 / native 12; buckets: ipc 40, paint_layout 15, gc_cc 12, harness_diagnostics 11, poll_wait 10, array_buffer_copy 8, worker_messaging 4, json_metadata 3
  - top self: `poll [libc.so.6]` 9; `mozilla::SVGObserverUtils::InvalidateDirectRenderingObserver` 3; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 2; `apply (self-hosted:2805:23)[8]` 1; `__lll_lock_wake [libc.so.6]` 1; `js::CloneFunctionReuseScript(JSContext*, JS::Handle<JSFuncti` 1
  - WebRender/compositor threads: Renderer 38 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7, `ps_quad_box_shadow_SUPERELLIPSE_frag::run(glsl::Fr` 4); SwComposite 3 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `webrender::picture::PictureInstance::take_context ` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 12 ms (top self: `unlink [libc.so.6]` 5, `rmdir [libc.so.6]` 3, `fstatat64 [libc.so.6]` 2); BackgroundThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, poll_wait 9, js_ctypes 8; top self: `poll [libc.so.6]` 8; `js::jit::JSJitFrameIter::checkInvalidation(js::jit` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:4231** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (2.1% of span): Idle 3, Profiler 1, Layout 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `nsContentUtils::AppendNativeAnonymousChildren(nsIContent con` 0; `getcontext [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3555** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **utility:3702** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

