# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **66.8** (main 21.2, Renderer 19.6, DOM Worker 13.0, StyleThread# 3.3, Compositor 3.3) | AxioCEFProbe 53.7, cef:gpu-process 21.2, cef:utility 11.4, cef:renderer 9.8 | — | 569.7 |
| plain | idle | — | — | **5.8** (main 3.8, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 25.3 | **57.2** (Renderer 16.4, SwComposite 14.8, main 9.3, Backgro~Pool # 6.4, DOM Worker 3.9) | cef:gpu-process 16.0, AxioCEFProbe 12.1, cef:renderer 11.3, WebExtensions 0.6 | — | — |
| plain | raf-nosampler | — | — | **54.8** (Renderer 16.5, SwComposite 15.2, main 6.6, Backgro~Pool # 6.3, DOM Worker 4.0) | cef:gpu-process 15.2, cef:renderer 11.2, AxioCEFProbe 10.9, WebExtensions 0.3 | — | — |
| plain | scroll | 59.7 | 27.9 | **78.9** (main 21.0, Renderer 17.6, SwComposite 15.3, Backgro~Pool # 8.6, DOM Worker 8.6) | cef:gpu-process 60.5, AxioCEFProbe 14.3, cef:renderer 12.8 | — | — |
| plain | key | — | — | **15.4** (main 7.1, Renderer 2.2, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | AxioCEFProbe 2.6, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.8 | 12.1 | — |
| plain | switch-to-gecko | — | — | **73.1** (main 30.4, Renderer 12.2, TaskCon~ller # 6.1, BgIOThr~Pool # 6.1, WRRende~ckend# 6.1) |  | — | 133.4 |
| trace | switch-to-engine | — | — | **106.2** (Renderer 60.9, main 29.5, Backgro~Pool # 3.9, DOM Worker 3.9, Timer 2.0) | AxioCEFProbe 63.0, cef:gpu-process 25.6, cef:renderer 11.8, cef:utility 11.8 | — | 454.9 |
| trace | idle | — | — | **5.3** (main 3.8, Timer 1.0, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5 | — | — |
| trace | raf | 60.1 | 26.4 | **60.9** (Renderer 17.3, SwComposite 15.4, main 10.6, Backgro~Pool # 6.1, DOM Worker 3.5) | cef:gpu-process 17.0, AxioCEFProbe 12.5, cef:renderer 12.2, cef:zygote 0.3 | — | — |
| trace | raf-nosampler | — | — | **117.5** (DOM Worker 27.8, main 26.8, Renderer 16.5, SwComposite 14.5, IPDL Background 8.3) | cef:gpu-process 17.2, cef:renderer 12.6, AxioCEFProbe 10.2, WebExtensions 0.3 | — | — |
| trace | scroll | 59.5 | 26.7 | **81.1** (main 20.0, Renderer 17.2, SwComposite 14.8, DOM Worker 12.4, Backgro~Pool # 8.6) | cef:gpu-process 62.0, AxioCEFProbe 13.8, cef:renderer 13.8, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **15.3** (main 7.7, Renderer 2.2, SwComposite 1.9, DOM Worker 1.6, Timer 0.5) | AxioCEFProbe 3.2, cef:renderer 2.5, cef:gpu-process 0.5, Web Content 0.3 | 12.1 | — |
| trace | switch-to-gecko | — | — | **83.0** (main 29.7, Renderer 17.8, TaskCon~ller # 11.9, BgIOThr~Pool # 5.9, WRRende~ckend# 5.9) |  | — | 133.7 |
| profile | switch-to-engine | — | — | **68.6** (main 22.3, Renderer 12.0, DOM Worker 12.0, TaskCon~ller # 6.9, SamplerThread 6.9) | AxioCEFProbe 60.0, cef:gpu-process 20.5, Web Content 13.7, cef:renderer 10.3 | — | 532.7 |
| profile | idle | — | — | **24.1** (DOM Worker 8.5, SamplerThread 8.5, main 5.7, Timer 1.4) | Web Content 9.4, WebExtensions 1.9, Privileged Cont 1.9, RDD Process 1.4 | — | — |
| profile | raf | 60.0 | 22.6 | **95.0** (Renderer 19.7, SwComposite 17.2, main 15.9, DOM Worker 12.4, SamplerThread 12.4) | cef:gpu-process 18.7, cef:renderer 13.1, AxioCEFProbe 11.4, Web Content 9.8 | — | — |
| profile | raf-nosampler | — | — | **82.3** (Renderer 19.8, SwComposite 17.1, DOM Worker 13.2, SamplerThread 10.9, main 7.3) | cef:gpu-process 18.2, cef:renderer 11.6, AxioCEFProbe 11.2, Web Content 9.6 | — | — |
| profile | scroll | 60.1 | 22.6 | **111.4** (main 26.1, Renderer 21.4, SwComposite 17.7, DOM Worker 16.8, SamplerThread 10.7) | cef:gpu-process 68.0, cef:renderer 15.0, AxioCEFProbe 14.0, Web Content 9.4 | — | — |
| profile | key | — | — | **40.2** (main 11.4, DOM Worker 10.1, SamplerThread 9.5, Renderer 2.7, SwComposite 2.2) | Web Content 9.0, AxioCEFProbe 3.2, cef:renderer 2.5, WebExtensions 2.2 | 15.0 | — |
| profile | switch-to-gecko | — | — | **69.8** (main 16.1, Renderer 16.1, DOM Worker 10.7, SamplerThread 10.7, IPC I/O Parent 5.4) |  | — | 147.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 14.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf-nosampler | 58.6 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | scroll | 58.0 | 0.0 | 0 | 0.0 | — | — | 10.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 4.9 | 0.0 | 0 | 0.0 | — | — | 1.8 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.3 | 0.0 | 0 | 0.0 | — | — | 15.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 57.8 | 0.0 | 0 | 0.0 | — | — | 8.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.783 | 6.804 | 0.0119 | 0.0213 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 189 | 0.223 | 0.796 | 0.0134 | 0.0477 |
| plain | raf-nosampler | memfd | native | 184 | 184 | 0.214 | 0.776 | 0.0129 | 0.0467 |
| plain | scroll | memfd | native | 122 | 122 | 0.741 | 0.743 | 0.0426 | 0.0427 |
| plain | key | memfd | native | 21 | 21 | 0.059 | 0.837 | 0.0003 | 0.0048 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 2.712 | 6.764 | 0.0151 | 0.0375 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 189 | 189 | 0.225 | 0.770 | 0.0135 | 0.0462 |
| trace | raf-nosampler | memfd | native | 179 | 179 | 0.223 | 0.734 | 0.0130 | 0.0431 |
| trace | scroll | memfd | native | 123 | 123 | 0.713 | 0.731 | 0.0413 | 0.0424 |
| trace | key | memfd | native | 21 | 21 | 0.059 | 0.771 | 0.0003 | 0.0044 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 3.014 | 10.641 | 0.0147 | 0.0519 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 191 | 192 | 0.259 | 0.870 | 0.0155 | 0.0525 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.258 | 0.840 | 0.0154 | 0.0503 |
| profile | scroll | memfd | native | 126 | 126 | 0.821 | 0.942 | 0.0475 | 0.0545 |
| profile | key | memfd | native | 21 | 21 | 0.069 | 0.867 | 0.0004 | 0.0049 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 7.8 | 0.0 | — | — | — | — | — | — | — | — |
| profile | 0.6 | 10.5 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 34.3; spawn AxioCEFProbe resolved 50.5; write hello 53.7; first stdout read resolved 294.0; write create 295.2; write frame_ack 479.9; write focus 484.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 25.0; first stdout read resolved 35.4; write shutdown 36.6

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 57.7; spawn AxioCEFProbe resolved 108.5; write hello 111.8; first stdout read resolved 344.9; write create 348.0; write frame_ack 547.4; write focus 565.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 37.3; first stdout read resolved 47.2; write shutdown 54.3

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 131, Renderer 87, DOM Worker 43, BgPool 25, WRRenderBackend 8, SwComposite 6, Compositor 6, WRSceneBuilder 4, IPC I/O 2, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 131 ms (21.3% of span): GC / CC 40, Layout 33, JavaScript 25, Idle 16, Other 6, DOM 6
  - JS leaf 4 / native under JS 34 / native 93; buckets: ipc 131, gc_cc 68, paint_layout 40, poll_wait 21, worker_messaging 13, array_buffer_copy 9, harness_diagnostics 8, engine_stream_read 6
  - top self: `poll [libc.so.6]` 16; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 10; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `__lll_lock_wait [libc.so.6]` 5; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4
  - GC/CC markers: GCMajor 1× 94 ms, GCSlice 9× 57 ms, CCSlice 1× 14 ms, GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 87 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 27, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 14, `ClearTexSubImage [libxul.so]` 9); WRRenderBackend#0 8 ms (top self: `syscall [libc.so.6]` 7, `sched_yield [libc.so.6]` 1); SwComposite 6 ms (top self: `syscall [libc.so.6]` 6)
  - background pools (native receiver queue): BackgroundThreadPool #1 25 ms (top self: `ARGBSetRow_X86 [libxul.so]` 11, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 43 ms: buckets subprocess_pipe_io 43, worker_messaging 43, ipc 43, poll_wait 36, js_ctypes 36, gc_cc 3; top self: `poll [libc.so.6]` 34; `nsCycleCollector_maybeDoDeferredDeletion() [libxul` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `__GI__Fork [libc.so.6]` 1
- **tab:4151** CPU ms by thread group: main 49, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (8.0% of span): Other 39, JavaScript 5, DOM 4, Idle 1, GC / CC 1, Profiler 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: ipc 36, array_buffer_copy 18, gc_cc 14, subprocess_pipe_io 8, memcpy_memset 4, poll_wait 1, image_container 0
  - top self: `access [libc.so.6]` 4; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[libfontconfig.so.1]` 2; `mozilla::Vector<js::frontend::StencilModuleRequest, 0ul, js:` 2; `mozilla::Preferences::SetPreference(mozilla::dom::Pref const` 1
  - GC/CC markers: GCMinor 1× 5 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4035** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.6% of span): Idle 2, Other 1, Graphics 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 2, paint_layout 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 2; `sendmsg [libc.so.6]` 1; `[]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3560** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 114, main 94, other 20, BgPool 1, IPC I/O 1, Socket 1, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 94 ms (4.4% of span): Idle 80, JavaScript 8, Other 5, Profiler 2, DOM 0
  - JS leaf 0 / native under JS 8 / native 86; buckets: ipc 94, poll_wait 83, harness_diagnostics 5, array_buffer_copy 3, gc_cc 3, worker_messaging 0, engine_stream_read 0, json_metadata 0
  - top self: `poll [libc.so.6]` 81; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `js::jit::MaybeTransition(JSContext*, js::jit::BaselineFrame*` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `PR_Now [libnspr4.so]` 1; `js::gc::BarrieredPtrImpl<JS::Value, 3u>::uncheckedSet(JS::Va` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `open64 [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 113 ms: buckets subprocess_pipe_io 113, js_ctypes 113, worker_messaging 113, ipc 113, poll_wait 113; top self: `poll [libc.so.6]` 113
- **tab:3560** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3542** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4146** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: Renderer 596, SwComposite 519, main 469, DOM Worker 309, BgPool 208, WRRenderBackend 64, Compositor 41, other 33, ImageBridge 17, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 469 ms (14.7% of span): Idle 263, JavaScript 77, GC / CC 65, Other 40, DOM 19, Profiler 5
  - JS leaf 5 / native under JS 85 / native 379; buckets: ipc 469, poll_wait 286, gc_cc 150, worker_messaging 46, engine_stream_read 43, json_metadata 26, subprocess_pipe_io 20, array_buffer_copy 16
  - top self: `poll [libc.so.6]` 265; `[unknown]` 17; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 16; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 7; `mprotect [libc.so.6]` 7
  - GC/CC markers: GCMajor 2× 1107 ms, GCSlice 16× 59 ms, CCSlice 5× 14 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 596 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 230, `int blendTextureNearestFast<false, glsl::sampler2D` 130, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 82); SwComposite 519 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 228, `syscall [libc.so.6]` 217, `__memmove_avx_unaligned_erms [libc.so.6]` 71); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 208 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 127, `__memmove_avx_unaligned_erms [libc.so.6]` 71, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 309 ms: buckets subprocess_pipe_io 309, worker_messaging 309, ipc 309, js_ctypes 285, poll_wait 276, gc_cc 8; top self: `poll [libc.so.6]` 276; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 3; `[unknown]` 3
- **tab:4035** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 5, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, gc_cc 5, poll_wait 2
  - top self: `poll [libc.so.6]` 1; `mozilla::services::GetObserverService() [libxul.so]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::Nursery::collect(JS::GCOptions, JS::GCReason) [libxul.so` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 571, SwComposite 509, DOM Worker 297, main 211, BgPool 196, WRRenderBackend 64, Compositor 40, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 138, JavaScript 41, Other 19, DOM 11, Profiler 2
  - JS leaf 5 / native under JS 45 / native 160; buckets: ipc 211, poll_wait 152, gc_cc 50, worker_messaging 29, engine_stream_read 25, subprocess_pipe_io 14, json_metadata 14, array_buffer_copy 13
  - top self: `poll [libc.so.6]` 140; `[unknown]` 8; `recvmsg [libc.so.6]` 4; `read [libc.so.6]` 3; `js::SharedImmutableStringsCache::getOrCreate(std::unique_ptr` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 571 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 193, `int blendTextureNearestFast<false, glsl::sampler2D` 163, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 70); SwComposite 509 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 251, `syscall [libc.so.6]` 176, `__memmove_avx_unaligned_erms [libc.so.6]` 81); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 196 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 111, `__memmove_avx_unaligned_erms [libc.so.6]` 78, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 297 ms: buckets subprocess_pipe_io 297, worker_messaging 297, ipc 297, js_ctypes 276, poll_wait 270, gc_cc 8; top self: `poll [libc.so.6]` 270; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 2; `mozilla::WidgetEvent::IsAllowedToDispatchInSystemG` 2; `__lll_lock_wake [libc.so.6]` 1
- **tab:4035** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 3, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 1
  - top self: `poll [libc.so.6]` 3; `fog_timing_distribution_accumulate_raw_nanos [libxul.so]` 1; `getrusage [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*)` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3542** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 515, Renderer 436, SwComposite 365, DOM Worker 299, BgPool 196, WRRenderBackend 50, Compositor 28, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 515 ms (23.7% of span): Idle 306, JavaScript 102, Other 57, DOM 20, Graphics 14, Layout 9
  - JS leaf 10 / native under JS 106 / native 399; buckets: ipc 515, poll_wait 365, gc_cc 106, worker_messaging 63, paint_layout 47, subprocess_pipe_io 36, array_buffer_copy 31, engine_stream_read 29
  - top self: `poll [libc.so.6]` 318; `write [libc.so.6]` 17; `[unknown]` 10; `__lll_lock_wake [libc.so.6]` 7; `js::jit::DoCallFallback(JSContext*, js::jit::BaselineFrame*,` 6; `[axiosozo-dev]` 5
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 436 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 245, `int blendTextureNearestFast<false, glsl::sampler2D` 46, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 43); SwComposite 365 ms (top self: `syscall [libc.so.6]` 243, `void scale_blit<true>(Texture&, IntRect const&, Te` 106, `__memmove_avx_unaligned_erms [libc.so.6]` 15); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 195 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 119, `__memmove_avx_unaligned_erms [libc.so.6]` 69, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::UseTextures(moz` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 299 ms: buckets subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 276, poll_wait 262, gc_cc 10; top self: `poll [libc.so.6]` 262; `__memset_avx2_unaligned_erms [libc.so.6]` 5; `write [libc.so.6]` 4; `[axiosozo-dev]` 2; `[unknown]` 2
- **tab:4151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4146** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 378, DOM Worker 273, Renderer 96, SwComposite 82, other 36, BgPool 21, Compositor 14, WRRenderBackend 13, WRSceneBuilder 8, IPC I/O 2, ImageBridge 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 378 ms (10.2% of span): Idle 161, JavaScript 80, Layout 40, Other 32, Graphics 24, DOM 23
  - JS leaf 10 / native under JS 133 / native 235; buckets: ipc 378, poll_wait 199, gc_cc 97, paint_layout 75, worker_messaging 64, engine_stream_read 42, subprocess_pipe_io 19, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 164; `[unknown]` 11; `[axiosozo-dev]` 7; `write [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `recvmsg [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 3 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 96 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `int blendTextureNearestFast<false, glsl::sampler2D` 24, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 15); SwComposite 82 ms (top self: `syscall [libc.so.6]` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 29, `__memmove_avx_unaligned_erms [libc.so.6]` 18); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 20 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__memmove_avx_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `Pickle::Pickle(unsigned int, unsigned long) [libxu` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 242, poll_wait 238, gc_cc 6; top self: `poll [libc.so.6]` 237; `[unknown]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3458** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `[unknown]` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `JS::Compartment::wrap(JSContext*, JS::MutableHandle<JS::Valu` 0; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3542** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: Renderer 40, main 37, DOM Worker 16, BgPool 11, Compositor 3, WRRenderBackend 2, SwComposite 2, WRSceneBuilder 2, IPC I/O 1, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 37 ms (17.1% of span): JavaScript 15, Layout 12, Idle 6, Graphics 2, DOM 1, Profiler 1
  - JS leaf 2 / native under JS 26 / native 9; buckets: ipc 37, paint_layout 14, array_buffer_copy 12, gc_cc 10, harness_diagnostics 9, worker_messaging 6, poll_wait 6, subprocess_pipe_io 3
  - top self: `poll [libc.so.6]` 6; `write [libc.so.6]` 3; `#logEvent (resource://gre/modules/EventEmitter.sys.mjs:164:1` 2; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, ns` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `<style::properties_and_values::value::Value<Component> as co` 1
  - WebRender/compositor threads: Renderer 40 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 14, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 6); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0, `sched_yield [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `unlink [libc.so.6]` 5, `rmdir [libc.so.6]` 2, `__open_nocancel [libc.so.6]` 1); BackgroundThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, poll_wait 15, js_ctypes 15, array_buffer_copy 1; top self: `poll [libc.so.6]` 15; `[linux-vdso.so.1]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:4035** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.8% of span): Idle 2, Other 1, Graphics 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `[]` 1; `mozilla::ipc::NodeController::SerializeEventMessage(std::uni` 0; `sendmsg [libc.so.6]` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message ` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3458** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **rdd:3466** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

