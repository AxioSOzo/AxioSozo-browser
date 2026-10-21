# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **105.8** (main 55.2, Renderer 18.4, StyleThread# 9.2, DOM Worker 9.2, glean.dispatche 4.6) | cef:renderer 23.0, AxioCEFProbe 23.0, cef:utility 4.6, Isolated Web Co 4.6 | — | 138.2 |
| plain | idle | — | — | **9.6** (main 6.7, Timer 1.4, IPC I/O Parent 0.5, Socket Thread 0.5, DOM Worker 0.5) | Web Content 3.8, AxioCEFProbe 3.4 | — | — |
| plain | raf | 60.0 | 21.6 | **28.2** (main 12.0, DOM Worker 3.6, Renderer 2.9, WRRende~ckend# 1.6, glean.dispatche 1.3) | cef:renderer 10.6, AxioCEFProbe 6.2, cef:gpu-process 5.5, Web Content 0.6 | — | — |
| plain | raf-nosampler | — | — | **19.8** (main 5.3, DOM Worker 3.6, Renderer 2.6, WRRende~ckend# 1.7, Compositor 1.3) | cef:renderer 11.0, AxioCEFProbe 6.6, cef:gpu-process 5.6, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.0 | 23.0 | **45.4** (main 22.2, DOM Worker 8.7, Backgro~Pool # 2.9, Renderer 2.9, SwComposite 1.9) | cef:gpu-process 21.7, cef:renderer 10.6, AxioCEFProbe 10.1 | — | — |
| plain | key | — | — | **17.5** (main 10.9, DOM Worker 1.6, Renderer 1.4, TaskCon~ller # 1.1, Timer 0.8) | AxioCEFProbe 2.8, cef:renderer 2.2, cef:gpu-process 0.3, WebExtensions 0.3 | 13.5 | — |
| plain | switch-to-gecko | — | — | **18.0** (DOM Worker 5.1, main 5.0, Indexed~ IO # 3.4, IPDL Background 1.7, TaskCon~ller # 1.0) | Web Content 0.2, Privileged Cont 0.2, WebExtensions 0.1, RDD Process 0.1 | — | 15493.5 |
| trace | switch-to-engine | — | — | **86.6** (Renderer 39.7, main 32.5, WRRende~ckend# 3.6, Compositor 3.6, SwComposite 3.6) | AxioCEFProbe 57.7, cef:gpu-process 36.1, cef:renderer 21.6, cef:utility 21.6 | — | 217.9 |
| trace | idle | — | — | **8.1** (main 5.7, Timer 1.4, IPDL Background 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 4.8, Web Content 1.0, cef:utility 0.5, cef:zygote 0.5 | — | — |
| trace | raf | 59.9 | 25.7 | **30.3** (main 13.6, DOM Worker 3.2, Renderer 2.9, WRRende~ckend# 1.6, glean.dispatche 1.3) | cef:renderer 10.6, AxioCEFProbe 6.5, cef:gpu-process 5.8 | — | — |
| trace | raf-nosampler | — | — | **20.1** (main 6.0, DOM Worker 3.6, Renderer 2.6, WRRende~ckend# 1.7, Compositor 1.3) | cef:renderer 11.0, AxioCEFProbe 6.6, cef:gpu-process 5.3, Isolated Web Co 0.3 | — | — |
| trace | scroll | 60.1 | 22.9 | **48.7** (main 23.2, DOM Worker 9.2, Backgro~Pool # 2.9, Renderer 2.4, glean.dispatche 1.9) | cef:gpu-process 20.8, cef:renderer 11.5, AxioCEFProbe 10.1 | — | — |
| trace | key | — | — | **19.9** (main 12.3, Renderer 1.6, DOM Worker 1.6, Timer 1.1, TaskCon~ller # 0.8) | cef:renderer 2.5, AxioCEFProbe 2.4, cef:gpu-process 0.5 | 14.6 | — |
| trace | switch-to-gecko | — | — | **28.6** (main 17.2, BgIOThr~Pool # 5.7, Renderer 5.7) | Web Content 5.7, Privileged Cont 5.7 | — | 136.1 |
| profile | switch-to-engine | — | — | **68.2** (main 36.1, Renderer 16.1, DOM Worker 8.0, SwComposite 4.0, SamplerThread 4.0) | Web Content 48.2, cef:renderer 20.1, AxioCEFProbe 20.1, cef:gpu-process 4.0 | — | 182.9 |
| profile | idle | — | — | **29.0** (DOM Worker 9.5, SamplerThread 9.5, main 7.6, Timer 1.9, glean.dispatche 0.5) | Web Content 9.5, AxioCEFProbe 4.2, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 60.0 | 21.8 | **57.1** (main 16.3, DOM Worker 13.1, SamplerThread 12.5, Renderer 3.2, WRRende~ckend# 2.2) | cef:renderer 11.8, Web Content 11.5, AxioCEFProbe 6.8, cef:gpu-process 6.4 | — | — |
| profile | raf-nosampler | — | — | **46.7** (DOM Worker 14.9, SamplerThread 10.6, main 7.6, Renderer 3.3, Compositor 2.0) | cef:renderer 11.6, Web Content 10.9, cef:gpu-process 6.3, AxioCEFProbe 6.3 | — | — |
| profile | scroll | 60.0 | 24.7 | **79.0** (main 28.7, DOM Worker 17.2, SamplerThread 12.5, Backgro~Pool # 3.8, Renderer 3.4) | cef:gpu-process 23.0, cef:renderer 11.5, AxioCEFProbe 10.0, Web Content 9.6 | — | — |
| profile | key | — | — | **45.7** (main 16.3, DOM Worker 10.6, SamplerThread 10.3, Timer 1.9, TaskCon~ller # 1.6) | Web Content 10.3, AxioCEFProbe 3.0, cef:renderer 2.7, WebExtensions 2.2 | 17.2 | — |
| profile | switch-to-gecko | — | — | **7.2** (SamplerThread 3.8, BgIOThr~Pool # 2.4, main 0.5, DOM Worker 0.3, IPDL Background 0.1) | Web Content 10.8, Privileged Cont 2.2, Isolated Web Co 2.1, WebExtensions 2.0 | — | 15055.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 9.4 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.76 | 0.40 | — | — | — | — | — | 0.012 |
| trace | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.17 | 0.13 | — | — | — | — | — | 0.009 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.17 | 0.12 | — | — | — | — | — | 0.008 |
| trace | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 5.9 | 0.0 | — | 0.30 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.1 | 0.0 | — | 0.41 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.0 | 0.0 | 0 | 0.0 | — | — | 6.7 | 0.0 | — | 3.15 | 0.93 | — | — | — | — | — | 0.006 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.21 | 0.17 | — | — | — | — | — | 0.012 |
| profile | raf-nosampler | 59.5 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.19 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.6 | 0.0 | 0 | 0.0 | — | — | 8.7 | 0.0 | — | 0.36 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.64 | 0.18 | — | — | — | — | — | 0.003 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.549 | 0.671 | 0.0045 | 0.0055 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.055 | 0.087 | 0.0033 | 0.0053 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.060 | 0.090 | 0.0036 | 0.0054 |
| plain | scroll | memfd | native | 122 | 122 | 0.199 | 0.224 | 0.0115 | 0.0130 |
| plain | key | memfd | native | 21 | 21 | 0.018 | 0.073 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 0.498 | 0.758 | 0.0047 | 0.0071 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 188 | 187 | 0.059 | 0.090 | 0.0035 | 0.0054 |
| trace | raf-nosampler | memfd | native | 184 | 184 | 0.063 | 0.087 | 0.0038 | 0.0052 |
| trace | scroll | memfd | native | 123 | 123 | 0.202 | 0.210 | 0.0118 | 0.0123 |
| trace | key | memfd | native | 21 | 21 | 0.017 | 0.077 | 0.0001 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.468 | 1.919 | 0.0103 | 0.0134 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.067 | 0.108 | 0.0040 | 0.0065 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.064 | 0.093 | 0.0038 | 0.0055 |
| profile | scroll | memfd | native | 123 | 123 | 0.230 | 0.243 | 0.0134 | 0.0141 |
| profile | key | memfd | native | 21 | 21 | 0.018 | 0.073 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 9.5 | 0.0 | — | 0.43 | 0.66 | — | — | 7.1 | 11.1 | 19.2 |
| profile | 0.8 | 11.8 | 0.1 | — | 0.70 | 1.10 | — | — | 7.7 | 14.2 | 20.8 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 87.5; write create 99.7; first frame applied (native receiver) 248.6; write frame_ack 251.7; write focus 264.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 28.8; first stdout read resolved 35.9; write shutdown 41.2

Switch timeline (profile, switch-to-engine, ms after the window start): write create 51.4; first stdout read resolved 63.4; first frame applied (native receiver) 211.2; write frame_ack 212.6; write focus 221.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 40.7; first stdout read resolved 53.3; write shutdown 56.4

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 92, Renderer 35, DOM Worker 17, WRRenderBackend 5, Compositor 4, WRSceneBuilder 3, IPC I/O 3, BgPool 2, SwComposite 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 92 ms (32.4% of span): JavaScript 34, Layout 28, Idle 20, DOM 4, Other 4, Graphics 2
  - JS leaf 1 / native under JS 49 / native 43; buckets: ipc 92, gc_cc 29, paint_layout 29, array_buffer_copy 23, poll_wait 23, harness_diagnostics 12, worker_messaging 9, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 20; `nsXPCWrappedJS::CallQueryInterfaceOnJSObject(JSContext*, JSO` 5; `js::jit::CacheIRCompiler::emitGuardToObject(js::jit::ValOper` 5; `[axiosozo-dev]` 3; `style::properties::generated::longhands::border_bottom_left_` 3; `mozilla::StyleRect<mozilla::StyleLengthPercentage>::~StyleRe` 3
  - WebRender/compositor threads: Renderer 35 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1, `webrender::batch::AlphaBatchBuilder::set_params_an` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `__memset_avx2_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 0, `__memset_avx2_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 17 ms: buckets subprocess_pipe_io 17, worker_messaging 17, ipc 17, js_ctypes 16, poll_wait 16, array_buffer_copy 0; top self: `poll [libc.so.6]` 16; `write [libc.so.6]` 0; `PLDHashTable::Search(void const*) const [libxul.so` 0; `std::tuple<js::FixedLengthArrayBufferObject*, unsi` 0
- **tab:4250** CPU ms by thread group: main 55, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 55 ms (25.6% of span): Other 43, DOM 4, Profiler 3, JavaScript 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 49; buckets: ipc 42, array_buffer_copy 18, gc_cc 10, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1, image_container 1
  - top self: `[libexpat.so.1]` 4; `__strlen_avx2 [libc.so.6]` 4; `JSAtom* PermanentlyAtomizeAndCopyCharsNonStaticValidLength<u` 4; `__lll_lock_wake [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__strcmp_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4245** CPU ms by thread group: main 48, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (17.3% of span): Other 35, JavaScript 5, DOM 5, Idle 2, Profiler 2, GC / CC 0
  - JS leaf 0 / native under JS 7 / native 42; buckets: ipc 37, gc_cc 16, array_buffer_copy 15, subprocess_pipe_io 8, poll_wait 3, image_container 1
  - top self: `[]` 5; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 4; `[libfontconfig.so.1]` 3; `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `sendmsg [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4034** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.1% of span): Other 2, Idle 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `read [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 152, DOM Worker 118, other 25, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 152 ms (7.1% of span): Idle 123, JavaScript 14, Other 11, DOM 3, Profiler 1
  - JS leaf 1 / native under JS 15 / native 137; buckets: ipc 152, poll_wait 130, harness_diagnostics 14, gc_cc 6, array_buffer_copy 4, json_metadata 2, subprocess_pipe_io 1, native_receiver 1
  - top self: `poll [libc.so.6]` 123; `recvmsg [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedPropMa` 2; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 118 ms: buckets subprocess_pipe_io 118, js_ctypes 118, worker_messaging 118, ipc 118, poll_wait 118; top self: `poll [libc.so.6]` 118
- **tab:4034** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `getcontext [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3511** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsThread::HasPendingEvents(bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 468, DOM Worker 305, Renderer 88, WRRenderBackend 53, Compositor 46, SwComposite 43, BgPool 39, other 37, ImageBridge 20, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 468 ms (14.8% of span): Idle 265, JavaScript 95, Other 51, GC / CC 25, Profiler 16, DOM 16
  - JS leaf 10 / native under JS 98 / native 360; buckets: ipc 467, poll_wait 295, gc_cc 122, worker_messaging 49, engine_stream_read 42, json_metadata 29, harness_diagnostics 22, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 268; `[unknown]` 18; `recvmsg [libc.so.6]` 14; `write [libc.so.6]` 9; `[axiosozo-dev]` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5
  - GC/CC markers: GCMajor 1× 1263 ms, GCSlice 9× 33 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 88 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 5); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 39 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 20 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 305 ms: buckets subprocess_pipe_io 305, worker_messaging 305, ipc 305, js_ctypes 283, poll_wait 274, gc_cc 13; top self: `poll [libc.so.6]` 274; `[axiosozo-dev]` 3; `[unknown]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 2; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigne` 1
- **tab:3551** CPU ms by thread group: main 12, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.4% of span): GC / CC 9, Idle 3
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 11, gc_cc 9, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 3× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3464** CPU ms by thread group: main 12, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.4% of span): GC / CC 10, Idle 2
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 10, gc_cc 10, poll_wait 3
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 5; `poll [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl<js::` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 59 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3511** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, gc_cc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `void js::gc::GCRuntime::maybeMarkWeaklyHeldAtom<JSAtom>(JSAt` 0; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 0; `mozilla::MemoryTelemetry::Get() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 3 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 348, main 225, Renderer 84, WRRenderBackend 49, Compositor 45, SwComposite 43, BgPool 36, ImageBridge 19, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 225 ms (7.4% of span): Idle 123, JavaScript 62, DOM 20, Other 19, Profiler 2
  - JS leaf 9 / native under JS 70 / native 146; buckets: ipc 225, poll_wait 135, gc_cc 78, worker_messaging 48, engine_stream_read 44, json_metadata 29, subprocess_pipe_io 17, native_receiver 13
  - top self: `poll [libc.so.6]` 124; `[unknown]` 11; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 3
  - WebRender/compositor threads: Renderer 84 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `syscall [libc.so.6]` 4); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `__lll_lock_wait [libc.so.6]` 0, `nsTArrayInfallibleAllocator::ResultTypeProxy nsTAr` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 348 ms: buckets subprocess_pipe_io 348, worker_messaging 348, ipc 348, js_ctypes 271, poll_wait 265, gc_cc 64; top self: `poll [libc.so.6]` 265; `madvise [libc.so.6]` 8; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 4
- **tab:4245** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3551** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 554, DOM Worker 294, BgPool 61, Renderer 57, WRRenderBackend 35, Compositor 28, SwComposite 27, other 23, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 554 ms (26.2% of span): Idle 282, JavaScript 110, Other 62, GC / CC 30, DOM 27, Graphics 26
  - JS leaf 13 / native under JS 114 / native 427; buckets: ipc 553, poll_wait 370, gc_cc 135, paint_layout 57, worker_messaging 55, engine_stream_read 35, subprocess_pipe_io 32, array_buffer_copy 28
  - top self: `poll [libc.so.6]` 285; `[unknown]` 14; `write [libc.so.6]` 12; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 7; `read [libc.so.6]` 7; `recvmsg [libc.so.6]` 7
  - GC/CC markers: GCSlice 5× 20 ms, CCSlice 3× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 57 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 2); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 1, `webrender::render_task_graph::RenderTaskGraphBuild` 0); SwComposite 27 ms (top self: `syscall [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 61 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 53, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 294 ms: buckets subprocess_pipe_io 294, worker_messaging 294, ipc 294, js_ctypes 249, poll_wait 240, gc_cc 13; top self: `poll [libc.so.6]` 240; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `[axiosozo-dev]` 3; `[unknown]` 3; `read [libc.so.6]` 2
- **tab:4245** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `nsJSContext::MaybePokeGC() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 558, DOM Worker 258, Renderer 58, other 40, Compositor 19, SwComposite 18, WRRenderBackend 16, WRWorker 12, WRSceneBuilder 10, BgPool 3, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 558 ms (15.1% of span): Idle 213, JavaScript 105, GC / CC 73, Other 50, Layout 43, Graphics 35
  - JS leaf 10 / native under JS 166 / native 381; buckets: ipc 557, poll_wait 259, gc_cc 184, paint_layout 94, worker_messaging 89, engine_stream_read 50, json_metadata 24, subprocess_pipe_io 23
  - top self: `poll [libc.so.6]` 215; `[axiosozo-dev]` 16; `[unknown]` 16; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `write [libc.so.6]` 10; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 8
  - GC/CC markers: GCMajor 2× 1103 ms, GCSlice 15× 60 ms, CCSlice 5× 13 ms, GCMinor 3× 6 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 16, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 5); SwComposite 18 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `<webrender::frame_allocator::FrameAllocator as all` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 243, poll_wait 238, gc_cc 8; top self: `poll [libc.so.6]` 238; `js::SetIntegrityLevel(JSContext*, JS::Handle<JSObj` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 2; `__lll_lock_wait [libc.so.6]` 2; `[unknown]` 1
- **tab:3464** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::ipc::NodeChannel::SendMessage(std::unique_ptr<IPC::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 345, main 80, DOM Worker 53, Renderer 18, IPC I/O 7, Compositor 5, WRRenderBackend 3, other 3, WRSceneBuilder 2, SwComposite 2, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 80 ms (0.5% of span): JavaScript 25, Idle 20, Layout 16, Other 6, DOM 6, Profiler 4
  - JS leaf 2 / native under JS 38 / native 40; buckets: ipc 80, paint_layout 22, poll_wait 22, gc_cc 20, array_buffer_copy 14, harness_diagnostics 11, worker_messaging 7, engine_stream_read 7
  - top self: `poll [libc.so.6]` 20; `mprotect [libc.so.6]` 8; `[axiosozo-dev]` 4; `__lll_lock_wait [libc.so.6]` 3; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 3× 1 ms
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3, `hypotf@@GLIBC_2.35 [libm.so.6]` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `mozilla::layers::APZCTreeManager::PrepareNodeForLa` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 345 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 323, `write [libc.so.6]` 8, `unlink [libc.so.6]` 8); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 53 ms: buckets subprocess_pipe_io 53, worker_messaging 53, ipc 53, gc_cc 37, poll_wait 13, js_ctypes 10; top self: `poll [libc.so.6]` 10; `madvise [libc.so.6]` 5; `[axiosozo-dev]` 5; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 3; `mozilla::SourceLocation::~SourceLocation() [libxul` 3
- **tab:3551** CPU ms by thread group: main 9, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.1% of span): Idle 6, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 7; buckets: ipc 8, poll_wait 6, gc_cc 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `js::jit::AssemblerX86Shared::jmpSrc(js::jit::Label*) [libxul` 1; `js::jit::MacroAssembler::call(js::jit::Address const&) [libx` 0; `js::Wrapper::New(JSContext*, JSObject*, js::Wrapper const*, ` 0; `g_main_context_iteration [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4034** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, Layout 1, Graphics 1
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `[]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::ipc::PIdleSchedulerChild::OnMessageReceived(IPC::Me` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

