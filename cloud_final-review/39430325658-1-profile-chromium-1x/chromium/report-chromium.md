# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **78.4** (Renderer 33.7, main 26.2, glean.dispatche 3.7, Socket Thread 3.7, StyleThread# 3.7) | AxioCEFProbe 29.9, cef:gpu-process 22.4, cef:renderer 15.0, cef:utility 14.9 | — | 236.9 |
| plain | idle | — | — | **5.3** (main 2.9, DOM Worker 1.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 60.1 | 20.6 | **17.3** (main 7.1, Renderer 1.9, DOM Worker 1.9, WRRende~ckend# 1.3, TaskCon~ller # 1.0) | cef:renderer 7.5, AxioCEFProbe 3.8, cef:gpu-process 3.2, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.5** (main 4.3, DOM Worker 2.7, Renderer 2.0, SwComposite 1.3, glean.dispatche 1.0) | cef:renderer 8.7, cef:gpu-process 5.3, AxioCEFProbe 4.3 | — | — |
| plain | scroll | 59.9 | 24.5 | **35.1** (main 17.2, DOM Worker 6.4, Renderer 2.0, TaskCon~ller # 1.5, WRRende~ckend# 1.5) | cef:gpu-process 18.2, cef:renderer 8.8, AxioCEFProbe 6.9 | — | — |
| plain | key | — | — | **11.5** (main 6.9, Renderer 1.1, DOM Worker 1.1, TaskCon~ller # 0.6, Compositor 0.6) | cef:renderer 2.3, AxioCEFProbe 1.7, cef:gpu-process 0.6 | 11.1 | — |
| plain | switch-to-gecko | — | — | **11.3** (main 3.3, DOM Worker 3.3, IndexedDB IO # 1.6, IPDL Background 0.9, TaskCon~ller # 0.8) | WebExtensions 0.2, Privileged Cont 0.1, Web Content 0.1 | — | 15798.9 |
| trace | switch-to-engine | — | — | **93.1** (main 35.8, Renderer 25.0, TaskCon~ller # 10.7, IPDL Background 3.6, WRWorker# 3.6) | AxioCEFProbe 50.1, cef:gpu-process 25.0, cef:utility 17.9, cef:renderer 14.3 | — | 245.6 |
| trace | idle | — | — | **2.9** (main 2.4, Timer 0.5) | AxioCEFProbe 3.0, Web Content 2.9 | — | — |
| trace | raf | 60.0 | 20.7 | **16.3** (main 6.2, DOM Worker 1.9, Renderer 1.6, WRRende~ckend# 1.3, SwComposite 1.3) | cef:renderer 6.8, AxioCEFProbe 3.8, cef:gpu-process 3.5, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **14.8** (main 4.3, Renderer 2.0, DOM Worker 2.0, Backgro~Pool # 1.3, WRRende~ckend# 1.0) | cef:renderer 6.3, cef:gpu-process 4.6, AxioCEFProbe 3.7 | — | — |
| trace | scroll | 60.0 | 20.9 | **29.7** (main 14.8, DOM Worker 4.9, Renderer 2.0, Backgro~Pool # 2.0, TaskCon~ller # 1.5) | cef:gpu-process 17.8, cef:renderer 7.4, AxioCEFProbe 5.9 | — | — |
| trace | key | — | — | **11.7** (main 6.6, Renderer 1.1, DOM Worker 1.1, Timer 0.8, TaskCon~ller # 0.6) | AxioCEFProbe 1.7, cef:renderer 1.4, cef:gpu-process 0.6, WebExtensions 0.3 | 11.0 | — |
| trace | switch-to-gecko | — | — | **1.3** (main 0.7, TaskCon~ller # 0.4, DOM Worker 0.1, Renderer 0.1) | Web Content 0.1, Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15015.1 |
| profile | switch-to-engine | — | — | **71.8** (main 35.9, Renderer 23.9, DOM Worker 6.0, SamplerThread 6.0) | Web Content 47.8, cef:renderer 23.9, AxioCEFProbe 17.9, cef:gpu-process 6.0 | — | 118.5 |
| profile | idle | — | — | **16.3** (SamplerThread 6.2, DOM Worker 5.3, main 3.8, Timer 1.0) | Web Content 5.7, Privileged Cont 1.4, AxioCEFProbe 1.0, Socket Process 1.0 | — | — |
| profile | raf | 60.0 | 21.1 | **36.5** (main 9.0, DOM Worker 8.7, SamplerThread 8.4, Renderer 2.3, Timer 1.3) | cef:renderer 7.8, Web Content 6.8, cef:gpu-process 4.5, AxioCEFProbe 4.4 | — | — |
| profile | raf-nosampler | — | — | **30.9** (DOM Worker 8.9, SamplerThread 7.6, main 5.6, Renderer 2.3, WRRende~ckend# 1.3) | cef:renderer 8.7, Web Content 7.3, cef:gpu-process 5.3, AxioCEFProbe 4.0 | — | — |
| profile | scroll | 60.1 | 22.1 | **55.8** (main 20.0, DOM Worker 12.7, SamplerThread 9.3, Renderer 2.4, Backgro~Pool # 1.9) | cef:gpu-process 19.5, cef:renderer 8.8, AxioCEFProbe 7.3, Web Content 6.3 | — | — |
| profile | key | — | — | **27.8** (main 9.1, SamplerThread 7.1, DOM Worker 6.6, Timer 1.4, Renderer 1.1) | Web Content 6.3, cef:renderer 1.9, AxioCEFProbe 1.7, WebExtensions 1.7 | 12.9 | — |
| profile | switch-to-gecko | — | — | **5.8** (SamplerThread 2.8, BgIOThr~Pool # 1.8, DOM Worker 0.4, main 0.3, IPC I/O Parent 0.1) | Web Content 7.0, Isolated Web Co 1.5, Socket Process 1.3, WebExtensions 1.3 | — | 15653.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.3 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 2.38 | 0.82 | — | — | — | — | — | 0.003 |
| trace | raf | 59.6 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.11 | 0.08 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.14 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 59.2 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | 0.17 | 0.08 | — | — | — | — | — | 0.005 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.5 | 0.0 | — | 0.24 | 0.08 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 16.0 | 0.0 | 0 | 0.0 | — | — | 1.1 | 0.0 | — | 2.12 | 0.32 | — | — | — | — | — | 0.014 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.13 | 0.11 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.16 | 0.13 | — | — | — | — | — | 0.009 |
| profile | scroll | 59.4 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 0.21 | 0.12 | — | — | — | — | — | 0.008 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.6 | 0.0 | — | 0.31 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.859 | 1.448 | 0.0056 | 0.0094 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.047 | 0.081 | 0.0028 | 0.0049 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.071 | 0.100 | 0.0043 | 0.0060 |
| plain | scroll | memfd | native | 120 | 120 | 0.115 | 0.137 | 0.0067 | 0.0080 |
| plain | key | memfd | native | 21 | 21 | 0.013 | 0.053 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 1 | 1 | 1.452 | 1.783 | 0.0048 | 0.0059 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.045 | 0.084 | 0.0027 | 0.0050 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.064 | 0.097 | 0.0039 | 0.0058 |
| trace | scroll | memfd | native | 121 | 121 | 0.105 | 0.133 | 0.0062 | 0.0079 |
| trace | key | memfd | native | 21 | 21 | 0.013 | 0.044 | 0.0001 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 1.592 | 1.972 | 0.0255 | 0.0315 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 187 | 187 | 0.050 | 0.089 | 0.0030 | 0.0054 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.071 | 0.100 | 0.0043 | 0.0060 |
| profile | scroll | memfd | native | 122 | 122 | 0.122 | 0.152 | 0.0072 | 0.0089 |
| profile | key | memfd | native | 21 | 21 | 0.016 | 0.065 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.7 | 0.0 | — | 0.24 | 0.42 | — | — | 8.3 | 7.6 | 17.4 |
| profile | 0.6 | 8.4 | 0.0 | — | 0.33 | 0.63 | — | — | 7.1 | 9.6 | 16.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 107.5; write create 108.8; first frame applied (native receiver) 264.9; write frame_ack 265.7; write focus 269.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 18.4; first stdout read resolved 23.3; write shutdown 27.1

Switch timeline (profile, switch-to-engine, ms after the window start): write create 29.6; first stdout read resolved 38.2; first frame applied (native receiver) 128.0; write frame_ack 130.0; write focus 140.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 25.5; first stdout read resolved 38.7; write shutdown 42.0

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 62, Renderer 26, DOM Worker 11, BgPool 7, WRRenderBackend 3, Compositor 3, WRSceneBuilder 2, SwComposite 2, IPC I/O 1, Socket 1, WRWorker 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 61 ms (32.9% of span): Idle 14, JavaScript 13, Other 12, Layout 10, DOM 7, Graphics 3
  - JS leaf 2 / native under JS 26 / native 33; buckets: ipc 61, paint_layout 24, gc_cc 19, poll_wait 15, array_buffer_copy 10, harness_diagnostics 6, worker_messaging 5, engine_stream_read 5
  - top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 12; `mozilla::ReflowInput::ReflowInput(nsPresContext*, mozilla::R` 3; `nsXULCommandDispatcher::Release() [libxul.so]` 3; `handleEvent (resource:///modules/zen/ZenWindowSync.sys.mjs:3` 2; `servo_arc::Arc<T>::drop_slow [libxul.so]` 2
  - WebRender/compositor threads: Renderer 26 ms (top self: `syscall [libc.so.6]` 9, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `SkPixmap::reset(SkImageInfo const&, void const*, u` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ARGBSetRow_X86 [libxul.so]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, js_ctypes 10, poll_wait 9, gc_cc 1; top self: `poll [libc.so.6]` 9; `__strlen_evex [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 0; `JSStructuredCloneData::AppendBytes(char const*, un` 0; `getcontext [libc.so.6]` 0
- **tab:3990** CPU ms by thread group: main 38, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 38 ms (28.3% of span): Other 29, JavaScript 3, Idle 2, Profiler 2, DOM 2
  - JS leaf 0 / native under JS 4 / native 34; buckets: ipc 27, array_buffer_copy 9, gc_cc 9, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1
  - top self: `js::frontend::FunctionBox::copyFunctionFields(js::frontend::` 3; `poll [libc.so.6]` 2; `[libexpat.so.1]` 2; `mozilla::StaticPrefs::InitStaticPrefsFromShared() [libxul.so` 2; `__memcmp_evex_movbe [libc.so.6]` 2; `__strlen_evex [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3799** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.4% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `mozilla::dom::BrowsingContext::TouchEventsOverride() const [` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3988** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - GC/CC markers: GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 76, DOM Worker 68, other 14, IPC I/O 1, Socket 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 76 ms (3.6% of span): Idle 64, JavaScript 4, Other 4, DOM 2, GC / CC 2, Profiler 0
  - JS leaf 0 / native under JS 6 / native 70; buckets: ipc 76, poll_wait 65, harness_diagnostics 5, gc_cc 5, array_buffer_copy 4, subprocess_pipe_io 0, worker_messaging 0, json_metadata 0
  - top self: `poll [libc.so.6]` 64; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[axiosozo-dev]` 1; `js::gc::BufferAllocator::updateFreeListsAfterAlloc(js::gc::B` 1; `mozilla::dom::FocusEvent_Binding::_finalize(JS::GCContext*, ` 1; `js::NewDenseCopiedArray(JSContext*, unsigned int, JS::Value ` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 68 ms: buckets subprocess_pipe_io 68, js_ctypes 68, worker_messaging 68, ipc 68, poll_wait 68; top self: `poll [libc.so.6]` 68
- **tab:3990** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3988** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3280** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 255, DOM Worker 203, Renderer 62, WRRenderBackend 37, SwComposite 33, BgPool 32, Compositor 29, other 23, ImageBridge 12, WRSceneBuilder 7, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 255 ms (8.2% of span): Idle 188, JavaScript 38, Other 18, DOM 7, Profiler 3, GC / CC 1
  - JS leaf 5 / native under JS 36 / native 214; buckets: ipc 255, poll_wait 200, gc_cc 43, engine_stream_read 23, worker_messaging 19, json_metadata 14, subprocess_pipe_io 10, array_buffer_copy 7
  - top self: `poll [libc.so.6]` 189; `[unknown]` 8; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `write [libc.so.6]` 3; `JS::GetExecutionGlobalFromJSMicroTask(JSObject*) [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 62 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `webrender::frame_builder::FrameBuilder::build [lib` 1, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 33 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 32 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 203 ms: buckets subprocess_pipe_io 203, worker_messaging 202, ipc 202, js_ctypes 193, poll_wait 190, gc_cc 3; top self: `poll [libc.so.6]` 190; `[axiosozo-dev]` 1; `js::NativeObject::addProperty(JSContext*, JS::Hand` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[unknown]` 1
- **tab:3799** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 4, poll_wait 3, gc_cc 3, memcpy_memset 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `nsINode::UnoptimizableCCNode() const [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::d` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3804** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 199, main 167, Renderer 62, WRRenderBackend 38, BgPool 37, SwComposite 33, Compositor 30, ImageBridge 12, WRSceneBuilder 7, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 167 ms (5.5% of span): Idle 104, JavaScript 35, Other 11, DOM 10, GC / CC 5, Profiler 2
  - JS leaf 10 / native under JS 34 / native 122; buckets: ipc 167, poll_wait 111, gc_cc 50, worker_messaging 29, engine_stream_read 23, json_metadata 15, subprocess_pipe_io 13, native_receiver 8
  - top self: `poll [libc.so.6]` 105; `[unknown]` 5; `recvmsg [libc.so.6]` 3; `[axiosozo-dev]` 2; `[linux-vdso.so.1]` 2; `XPC_WN_CallMethod(JSContext*, unsigned int, JS::Value*) [lib` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 62 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 50, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 2); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 33 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::compositor::sw_compositor::SwCompositeT` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 36, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `RefPtr<mozilla::ipc::MessageChannel::MessageTask> ` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 199 ms: buckets subprocess_pipe_io 199, worker_messaging 199, ipc 199, js_ctypes 188, poll_wait 187, gc_cc 5; top self: `poll [libc.so.6]` 186; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `[axiosozo-dev]` 1; `mozilla::dom::Event::cycleCollection::Unlink(void*` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
- **tab:3799** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, gc_cc 2, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `__strnlen_evex [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3990** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 387, DOM Worker 208, Renderer 47, BgPool 38, WRRenderBackend 29, SwComposite 22, Compositor 22, other 16, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 387 ms (18.7% of span): Idle 219, JavaScript 75, Other 43, Graphics 16, DOM 15, Profiler 10
  - JS leaf 10 / native under JS 78 / native 299; buckets: ipc 387, poll_wait 276, gc_cc 77, worker_messaging 42, paint_layout 39, subprocess_pipe_io 23, engine_stream_read 22, array_buffer_copy 18
  - top self: `poll [libc.so.6]` 222; `[unknown]` 15; `write [libc.so.6]` 7; `recvmsg [libc.so.6]` 7; `mprotect [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 37, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 3); WRRenderBackend#0 29 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 22 ms (top self: `syscall [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 34, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `mozilla::TaskController::AddTask(already_AddRefed<` 0); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `RefPtr<mozilla::ipc::MessageChannel::MessageTask> ` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #4 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 208 ms: buckets subprocess_pipe_io 208, worker_messaging 208, ipc 208, js_ctypes 178, poll_wait 172, gc_cc 8; top self: `poll [libc.so.6]` 172; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[axiosozo-dev]` 3; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 2
- **tab:3319** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.2% of span): Idle 2, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 3, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `[unknown]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Ti` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3804** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 305, DOM Worker 171, Renderer 45, other 26, SwComposite 15, WRRenderBackend 12, Compositor 12, WRWorker 10, WRSceneBuilder 8, BgPool 2, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 305 ms (8.3% of span): Idle 134, JavaScript 56, Layout 35, Other 30, Graphics 22, DOM 19
  - JS leaf 15 / native under JS 98 / native 193; buckets: ipc 305, poll_wait 168, gc_cc 71, paint_layout 67, worker_messaging 47, engine_stream_read 29, subprocess_pipe_io 21, array_buffer_copy 16
  - top self: `poll [libc.so.6]` 136; `[unknown]` 8; `[axiosozo-dev]` 7; `write [libc.so.6]` 4; `recvmsg [libc.so.6]` 3; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<n` 3
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 45 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 3); SwComposite 15 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `mozilla::ThreadEventQueue::PutEventInternal(RefPtr` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 171 ms: buckets subprocess_pipe_io 171, worker_messaging 171, ipc 171, js_ctypes 158, poll_wait 156, gc_cc 6; top self: `poll [libc.so.6]` 156; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `__lll_lock_wait [libc.so.6]` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:3234** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, GC / CC 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 0; `JSAutoStructuredCloneBuffer::clear() [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3804** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3319** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 276, DOM Worker 55, main 51, Renderer 13, IPC I/O 5, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, other 1, SwComposite 1, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 51 ms (0.3% of span): Idle 15, Layout 14, JavaScript 10, Other 4, Graphics 3, Profiler 3
  - JS leaf 1 / native under JS 22 / native 28; buckets: ipc 51, paint_layout 20, poll_wait 15, harness_diagnostics 8, gc_cc 8, array_buffer_copy 7, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 14; `[axiosozo-dev]` 3; `core::ptr::drop_in_place<style::values::generics::length::Ge` 2; `madvise [libc.so.6]` 2; `nsRegion::Sub(nsRegion const&, nsRegion const&) [libxul.so]` 2; `core::ptr::drop_in_place<style::values::generics::image::Gen` 2
  - GC/CC markers: GCMinor 3× 1 ms
  - WebRender/compositor threads: Renderer 13 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `__sincosf_fma [libm.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 275 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 257, `write [libc.so.6]` 6, `unlink [libc.so.6]` 5); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 55 ms: buckets subprocess_pipe_io 55, worker_messaging 55, ipc 55, gc_cc 47, poll_wait 8, js_ctypes 6; top self: `poll [libc.so.6]` 6; `madvise [libc.so.6]` 5; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4; `mozilla::ProfileChunkedBuffer::ResetChunkManager(m` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >` 3
- **tab:3280** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3799** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, DOM 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `PLDHashTable::MakeEntryHandle(void const*, std::nothrow_t co` 0; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozill` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

