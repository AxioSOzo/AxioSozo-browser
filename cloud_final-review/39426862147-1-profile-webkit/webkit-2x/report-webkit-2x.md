# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **44.7** (Renderer 24.8, main 14.9, WRRende~ckend# 5.0) | WPEWebProcess 69.5, AxioWebKitHost 9.9, WPENetworkProce 9.9 | — | 172.8 |
| plain | idle | — | — | **4.9** (main 3.9, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 2.5 | — | — |
| plain | raf | 58.1 | 24.7 | **32.4** (main 9.5, Renderer 6.2, SwComposite 4.9, Backgro~Pool # 3.3, DOM Worker 2.6) | WPEWebProcess 146.1, AxioWebKitHost 19.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **26.5** (Renderer 6.0, main 4.7, Backgro~Pool # 4.7, SwComposite 4.0, DOM Worker 2.7) | WPEWebProcess 137.3, AxioWebKitHost 19.6, Isolated Web Co 0.3 | — | — |
| plain | scroll | 56.7 | 36.0 | **55.1** (main 19.1, Backgro~Pool # 10.8, DOM Worker 7.4, Renderer 5.9, SwComposite 3.4) | WPEWebProcess 152.2, AxioWebKitHost 22.6, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **16.9** (main 8.5, Renderer 2.7, SwComposite 1.9, DOM Worker 0.8, Timer 0.5) | WPEWebProcess 14.2, AxioWebKitHost 2.8 | 27.4 | — |
| plain | switch-to-gecko | — | — | **35.2** (main 17.6, Renderer 8.8, TaskCon~ller # 4.4, Compositor 4.4) |  | — | 212.7 |
| trace | switch-to-engine | — | — | **86.4** (Renderer 46.8, main 18.0, WrGlyph~terizer 3.6, WRScene~ilder# 3.6, Compositor 3.6) | WPEWebProcess 75.6, AxioWebKitHost 10.8, WPENetworkProce 10.8, Web Content 3.6 | — | 263.7 |
| trace | idle | — | — | **49.6** (DOM Worker 13.7, main 12.7, Indexed~ IO # 10.3, IPDL Background 6.4, TaskCon~ller # 2.0) | Web Content 2.9, forkserver 0.5 | — | — |
| trace | raf | 57.4 | 23.4 | **31.3** (main 8.8, Renderer 6.2, DOM Worker 4.9, SwComposite 3.9, Backgro~Pool # 3.3) | WPEWebProcess 135.5, AxioWebKitHost 19.2 | — | — |
| trace | raf-nosampler | — | — | **26.9** (Renderer 6.0, main 5.0, SwComposite 4.3, Backgro~Pool # 4.3, DOM Worker 3.0) | WPEWebProcess 138.6, AxioWebKitHost 20.0 | — | — |
| trace | scroll | 56.0 | 32.0 | **55.1** (main 20.1, Backgro~Pool # 10.8, DOM Worker 6.9, Renderer 6.4, SwComposite 3.4) | WPEWebProcess 146.9, AxioWebKitHost 23.1 | — | — |
| trace | key | — | — | **17.2** (main 8.5, Renderer 2.7, SwComposite 2.2, DOM Worker 1.1, Timer 0.5) | WPEWebProcess 14.6, AxioWebKitHost 3.3 | 26.2 | — |
| trace | switch-to-gecko | — | — | **44.0** (main 17.6, glean.dispatche 4.4, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4, Renderer 4.4) | Isolated Web Co 4.4 | — | 212.9 |
| profile | switch-to-engine | — | — | **39.0** (main 11.7, DOM Worker 7.8, SamplerThread 7.8, Renderer 3.9, WRRende~ckend# 3.9) | Web Content 136.0, WPEWebProcess 54.4, AxioWebKitHost 11.7, WPENetworkProce 11.7 | — | 236.9 |
| profile | idle | — | — | **27.9** (main 10.8, DOM Worker 6.8, SamplerThread 5.9, TaskCon~ller # 2.9, Timer 1.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, RDD Process 1.0 | — | — |
| profile | raf | 57.9 | 21.7 | **49.9** (main 12.7, DOM Worker 8.5, Renderer 7.2, SamplerThread 6.8, SwComposite 4.6) | WPEWebProcess 138.0, AxioWebKitHost 19.9, Web Content 5.5, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **46.3** (DOM Worker 9.0, main 7.6, Renderer 7.0, SamplerThread 6.3, SwComposite 5.0) | WPEWebProcess 136.0, AxioWebKitHost 19.9, Web Content 5.7, Privileged Cont 1.3 | — | — |
| profile | scroll | 53.3 | 35.7 | **73.5** (main 22.8, DOM Worker 15.5, Backgro~Pool # 10.7, Renderer 6.8, SamplerThread 6.3) | WPEWebProcess 149.2, AxioWebKitHost 25.7, Web Content 5.3, WebExtensions 1.5 | — | — |
| profile | key | — | — | **36.9** (main 12.9, DOM Worker 8.0, SamplerThread 6.9, Renderer 3.3, SwComposite 2.2) | WPEWebProcess 14.8, Web Content 6.0, AxioWebKitHost 2.5, WebExtensions 1.4 | 29.3 | — |
| profile | switch-to-gecko | — | — | **59.1** (main 25.4, Renderer 12.7, glean.dispatche 4.2, Socket Thread 4.2, TaskCon~ller # 4.2) |  | — | 218.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.8 | 0.0 | 0 | 0.0 | — | — | 83.9 | 0.0 | — | 3.03 | 0.56 | — | — | — | — | — | 0.004 |
| trace | raf | 57.4 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.27 | 0.09 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.35 | 0.10 | — | — | — | — | — | 0.007 |
| trace | scroll | 55.1 | 0.0 | 0 | 0.0 | — | — | 12.4 | 0.0 | — | 0.99 | 0.10 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.07 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.5 | 0.0 | 0 | 0.0 | — | — | 72.1 | 0.0 | — | 3.54 | 0.97 | — | — | — | — | — | 0.007 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.32 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.40 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 52.0 | 0.0 | 0 | 0.0 | — | — | 12.4 | 0.0 | — | 1.19 | 0.14 | — | — | — | — | — | 0.011 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.09 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.666 | 4.245 | 0.0253 | 0.0403 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.205 | 0.376 | 0.0119 | 0.0218 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.253 | 0.440 | 0.0147 | 0.0255 |
| plain | scroll | memfd | native | 113 | 113 | 0.933 | 1.049 | 0.0515 | 0.0580 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.377 | 0.0000 | 0.0021 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 1 | 2.745 | 4.382 | 0.0188 | 0.0150 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 176 | 176 | 0.195 | 0.366 | 0.0112 | 0.0210 |
| trace | raf-nosampler | memfd | native | 176 | 176 | 0.255 | 0.432 | 0.0148 | 0.0251 |
| trace | scroll | memfd | native | 113 | 112 | 0.882 | 1.044 | 0.0486 | 0.0570 |
| trace | key | memfd | native | 20 | 20 | 0.004 | 0.309 | 0.0000 | 0.0017 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.310 | 4.941 | 0.0248 | 0.0371 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.215 | 0.428 | 0.0125 | 0.0249 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.265 | 0.481 | 0.0154 | 0.0280 |
| profile | scroll | memfd | native | 108 | 108 | 1.071 | 1.253 | 0.0557 | 0.0651 |
| profile | key | memfd | native | 20 | 20 | 0.004 | 0.310 | 0.0000 | 0.0017 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 21.8 | 0.0 | — | 0.07 | 0.28 | — | — | 9.8 | 22.6 | 32.2 |
| profile | 0.6 | 26.5 | 0.0 | — | 0.09 | 0.41 | — | — | 12.5 | 27.7 | 37.4 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 24.0; first stdout read resolved 40.7; first frame applied (native receiver) 277.4; write frame_ack 278.4; write visibility 281.7; write focus 281.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 13.2; first stdout read resolved 19.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 14.0; first stdout read resolved 16.9; first frame applied (native receiver) 233.9; write frame_ack 235.7; write visibility 246.8; write focus 247.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.7; first stdout read resolved 31.4

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 35, DOM Worker 16, BgPool 15, Renderer 11, SwComposite 2, Compositor 2, IPC I/O 2, WRSceneBuilder 2, WRRenderBackend 2, Socket 0, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 35 ms (13.3% of span): JavaScript 16, Idle 7, Layout 4, Profiler 3, Other 2, Graphics 2
  - JS leaf 1 / native under JS 19 / native 15; buckets: ipc 35, gc_cc 16, array_buffer_copy 11, engine_stream_read 10, poll_wait 9, paint_layout 8, harness_diagnostics 6, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `XPCWrappedNative::InitTearOff(JSContext*, XPCWrappedNativeTe` 7; `JSStructuredCloneWriter::startObject(JS::Handle<JSObject*>, ` 2; `mozilla::baseprofiler::profiler_current_thread_id() [axiosoz` 2; `nsIFrame::ComputeAutoSize(mozilla::SizeComputationInput cons` 2; `js::BaseScript::enclosingScope() const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ARGBSetRow_X86 [libxul.so]` 4, `__memset_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15, poll_wait 15, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 15; `bool mozilla::dom::binding_detail::GenericMethod<m` 0; `__memset_avx512_unaligned_erms [libc.so.6]` 0
- **tab:9523** CPU ms by thread group: main 40, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (31.9% of span): Other 28, JavaScript 7, DOM 4, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 35; buckets: ipc 32, array_buffer_copy 13, gc_cc 10, subprocess_pipe_io 3, memcpy_memset 2, image_container 1, poll_wait 1
  - top self: `[libfontconfig.so.1]` 4; `[]` 3; `__strlen_evex [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9520** CPU ms by thread group: main 24, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 24 ms (28.9% of span): Other 20, DOM 2, JavaScript 1, Idle 1
  - JS leaf 0 / native under JS 3 / native 22; buckets: ipc 20, array_buffer_copy 9, gc_cc 5, subprocess_pipe_io 2, poll_wait 1, image_container 1
  - top self: `gfxSparseBitSet::SetRange(unsigned int, unsigned int) [libxu` 5; `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 1; `u_UCharsToChars_78 [libxul.so]` 1; `uprv_getDefaultLocaleID_78 [libxul.so]` 1; `js::NewDenseUnallocatedArray(JSContext*, unsigned int, js::N` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9377** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.4% of span): Idle 1, Other 1, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, gc_cc 1, poll_wait 0, paint_layout 0
  - top self: `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint` 1; `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `nsPIDOMWindowInner::GetWindowContext() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 209, DOM Worker 70, other 14, Socket 1, IPC I/O 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 209 ms (10.2% of span): Idle 115, GC / CC 60, JavaScript 18, Other 7, Profiler 5, DOM 3
  - JS leaf 2 / native under JS 19 / native 188; buckets: ipc 209, poll_wait 120, gc_cc 68, harness_diagnostics 20, array_buffer_copy 5, engine_stream_read 4, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 118; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 17; `mprotect [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3
  - GC/CC markers: GCMajor 2× 852 ms, GCSlice 14× 51 ms, CCSlice 5× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 71 ms: buckets subprocess_pipe_io 71, js_ctypes 71, worker_messaging 71, ipc 71, poll_wait 71; top self: `__syscall_cancel_arch [libc.so.6]` 71
- **tab:9377** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9005** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 358, DOM Worker 209, Renderer 203, SwComposite 137, BgPool 116, WRRenderBackend 44, Compositor 32, other 24, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 358 ms (11.6% of span): Idle 251, JavaScript 56, Other 32, DOM 14, Profiler 4, GC / CC 1
  - JS leaf 7 / native under JS 60 / native 291; buckets: ipc 355, poll_wait 269, gc_cc 53, engine_stream_read 38, harness_diagnostics 22, worker_messaging 21, array_buffer_copy 20, subprocess_pipe_io 12
  - top self: `__syscall_cancel_arch [libc.so.6]` 266; `[unknown]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 3; `[linux-vdso.so.1]` 3; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 203 ms (top self: `__syscall_cancel_arch [libc.so.6]` 118, `__memmove_avx512_unaligned_erms [libc.so.6]` 55, `syscall [libc.so.6]` 19); SwComposite 137 ms (top self: `syscall [libc.so.6]` 115, `__memmove_avx512_unaligned_erms [libc.so.6]` 19, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 4, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 116 ms (top self: `__syscall_cancel_arch [libc.so.6]` 84, `__memmove_avx512_unaligned_erms [libc.so.6]` 30, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `[axiosozo-dev]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 206 ms: buckets subprocess_pipe_io 206, worker_messaging 206, ipc 206, js_ctypes 192, poll_wait 188, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 189; `[axiosozo-dev]` 2; `[unknown]` 1; `RefPtr<mozilla::dom::XRSession>* nsTArray_Impl<Ref` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:9377** CPU ms by thread group: main 2, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 1, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, gc_cc 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `void mozilla::CycleCollectedJSRuntime::TraverseJSHolders<moz` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::gcstats::Statistics::renderJsonSlice(unsigned long) cons` 0
  - GC/CC markers: GCMajor 1× 35 ms, CCSlice 1× 2 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9005** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 223, DOM Worker 213, Renderer 193, SwComposite 138, BgPool 130, WRRenderBackend 42, Compositor 32, ImageBridge 13, WRSceneBuilder 6, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 223 ms (7.4% of span): Idle 109, JavaScript 51, GC / CC 36, Other 16, DOM 8, Profiler 3
  - JS leaf 3 / native under JS 53 / native 168; buckets: ipc 222, poll_wait 117, gc_cc 91, engine_stream_read 44, worker_messaging 34, array_buffer_copy 20, subprocess_pipe_io 13, native_receiver 10
  - top self: `__syscall_cancel_arch [libc.so.6]` 120; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 8; `[unknown]` 6; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 16× 45 ms, CCSlice 1× 10 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 193 ms (top self: `__syscall_cancel_arch [libc.so.6]` 109, `__memmove_avx512_unaligned_erms [libc.so.6]` 58, `syscall [libc.so.6]` 16); SwComposite 138 ms (top self: `syscall [libc.so.6]` 108, `__memmove_avx512_unaligned_erms [libc.so.6]` 26, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 130 ms (top self: `__syscall_cancel_arch [libc.so.6]` 86, `__memmove_avx512_unaligned_erms [libc.so.6]` 40, `mozilla::layers::ImageContainer::SetCurrentImages(` 1); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `mozilla::layers::TextureClient::TextureClientRecyc` 0, `std::_Rb_tree_rebalance_for_erase(std::_Rb_tree_no` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 213 ms: buckets subprocess_pipe_io 213, worker_messaging 213, ipc 213, js_ctypes 197, poll_wait 192, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 193; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[unknown]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[axiosozo-dev]` 1
- **tab:9383** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9005** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `XRE_GetAsyncIOEventTarget() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 439, DOM Worker 277, BgPool 214, Renderer 121, SwComposite 67, WRRenderBackend 29, Compositor 20, other 16, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 439 ms (21.2% of span): Idle 264, JavaScript 74, Other 55, DOM 24, Graphics 8, GC / CC 6
  - JS leaf 8 / native under JS 89 / native 342; buckets: ipc 435, poll_wait 311, gc_cc 82, engine_stream_read 50, worker_messaging 43, harness_diagnostics 32, paint_layout 30, array_buffer_copy 25
  - top self: `__syscall_cancel_arch [libc.so.6]` 292; `[unknown]` 8; `[axiosozo-dev]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[linux-vdso.so.1]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 4
  - GC/CC markers: GCSlice 4× 6 ms, GCMinor 2× 6 ms
  - WebRender/compositor threads: Renderer 121 ms (top self: `__syscall_cancel_arch [libc.so.6]` 78, `__memmove_avx512_unaligned_erms [libc.so.6]` 26, `syscall [libc.so.6]` 11); SwComposite 67 ms (top self: `syscall [libc.so.6]` 61, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 29 ms (top self: `syscall [libc.so.6]` 22, `sched_yield [libc.so.6]` 7, `webrender::render_backend::Document::updated_pipel` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 214 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 108, `__syscall_cancel_arch [libc.so.6]` 97, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 277 ms: buckets subprocess_pipe_io 277, worker_messaging 276, ipc 276, js_ctypes 189, poll_wait 182, gc_cc 62; top self: `__syscall_cancel_arch [libc.so.6]` 184; `madvise [libc.so.6]` 9; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `[axiosozo-dev]` 5
- **tab:9005** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) [libxul.so` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9383** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9024** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageBridge 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 438, DOM Worker 182, Renderer 108, SwComposite 79, other 26, WRRenderBackend 18, Compositor 16, WRSceneBuilder 9, WRWorker 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 0, ImageIO 0, Canvas 0
  - main thread 438 ms (12.0% of span): Idle 227, JavaScript 77, Other 38, Graphics 35, Layout 31, DOM 22
  - JS leaf 10 / native under JS 117 / native 311; buckets: ipc 437, poll_wait 260, gc_cc 79, paint_layout 67, worker_messaging 66, engine_stream_read 58, harness_diagnostics 20, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 235; `[unknown]` 16; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `[axiosozo-dev]` 7; `mozilla::dom::LCPHelpers::FinalizeLCPEntryForImage(mozilla::` 6; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGene` 3
  - GC/CC markers: GCMinor 1× 3 ms, GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 108 ms (top self: `__syscall_cancel_arch [libc.so.6]` 29, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 13); SwComposite 79 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 41, `syscall [libc.so.6]` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::ipc::NodeController::GetMessage(mojo::cor` 0); BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 182 ms: buckets subprocess_pipe_io 182, worker_messaging 182, ipc 182, js_ctypes 169, poll_wait 167, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 168; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `[unknown]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:9024** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageBridge 0, ImageIO 0
  - main thread 8 ms (0.2% of span): GC / CC 6, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 7, gc_cc 6, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 2; `__syscall_cancel_arch [libc.so.6]` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `getrusage [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8924** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 1; `IPC::Message::~Message() [libxul.so]` 0; `[unknown]` 0; `mozilla::dom::ReceiveMessageArgument::ToObjectInternal(JSCon` 0; `mozilla::dom::(anonymous namespace)::StructuredCloneCallback` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 3, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 1; `NoteWeakMapsTracer::trace(JSObject*, JS::GCCellPtr, JS::GCCe` 1; `nsJSContext::MaybePokeCC() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 84, Renderer 33, DOM Worker 11, Compositor 5, BgPool 4, SwComposite 4, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 84 ms (30.3% of span): JavaScript 32, GC / CC 23, Layout 9, Idle 6, Graphics 6, DOM 4
  - JS leaf 5 / native under JS 36 / native 43; buckets: ipc 84, gc_cc 40, array_buffer_copy 16, paint_layout 16, harness_diagnostics 12, poll_wait 8, engine_stream_read 7, worker_messaging 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `mprotect [libc.so.6]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `[unknown]` 3; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [` 2; `_send (resource://gre/modules/ConduitsParent.sys.mjs:317:8)[` 2
  - GC/CC markers: GCSlice 6× 15 ms, CCSlice 1× 7 ms
  - WebRender/compositor threads: Renderer 33 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3); SwComposite 4 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `webrender::command_buffer::CommandBuffer::add_cmd ` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `getdents64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 9, js_ctypes 9; top self: `__syscall_cancel_arch [libc.so.6]` 9; `JSScript::createJitScript(JSContext*) [libxul.so]` 1; `_ZN12PLDHashTable15WithEntryHandleIZN12nsTHashtabl` 0
- **tab:9377** CPU ms by thread group: main 22, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 22 ms (7.9% of span): Other 8, JavaScript 5, Idle 4, Layout 2, DOM 1, Graphics 1
  - JS leaf 0 / native under JS 6 / native 16; buckets: ipc 21, poll_wait 4, gc_cc 4, subprocess_pipe_io 3, paint_layout 3, canvas_2d 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__memcmp_evex_movbe [libc.so.6]` 1; `nsTSubstring<char>::~nsTSubstring() [libxul.so]` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1; `[]` 1; `mozilla::detail::HashTable<void* const, mozilla::HashSet<voi` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8924** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.6% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::Assembler::finish() [libxul.so]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::V` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9520** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

