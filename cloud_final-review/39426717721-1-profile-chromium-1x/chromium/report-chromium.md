# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **7.5** (main 3.3, DOM Worker 1.5, TaskCon~ller # 1.2, Renderer 0.6, glean.dispatche 0.3) | AxioCEFProbe 4.2, cef:gpu-process 1.8, Web Content 1.5, cef:utility 1.2 | — | 3351.8 |
| plain | idle | — | — | **2.0** (main 1.0, Socket Thread 0.5, TaskCon~ller # 0.5) | Privileged Cont 1.0 | — | — |
| plain | raf | 60.0 | 20.9 | **11.1** (main 4.2, DOM Worker 1.6, Renderer 1.0, glean.dispatche 0.7, TaskCon~ller # 0.7) | cef:renderer 5.0, cef:gpu-process 2.9, AxioCEFProbe 2.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **9.4** (main 2.7, DOM Worker 1.7, Renderer 1.0, WRRende~ckend# 1.0, Backgro~Pool # 1.0) | cef:renderer 5.4, cef:gpu-process 3.6, AxioCEFProbe 2.7 | — | — |
| plain | scroll | 60.1 | 24.0 | **23.7** (main 11.8, DOM Worker 4.4, TaskCon~ller # 1.5, Backgro~Pool # 1.5, Renderer 1.0) | cef:gpu-process 13.8, cef:renderer 7.5, AxioCEFProbe 5.0 | — | — |
| plain | key | — | — | **9.6** (main 5.0, Renderer 1.1, DOM Worker 0.8, Timer 0.6, TaskCon~ller # 0.6) | cef:renderer 2.3, AxioCEFProbe 1.1, cef:gpu-process 0.3, WebExtensions 0.3 | 10.3 | — |
| plain | switch-to-gecko | — | — | **9.0** (DOM Worker 2.9, main 2.8, TaskCon~ller # 0.9, IPDL Background 0.8, Indexed~ IO # 0.7) | Privileged Cont 0.1 | — | 15015.1 |
| trace | switch-to-engine | — | — | **50.6** (main 20.2, Renderer 20.2, Socket Thread 3.4, WRRende~ckend# 3.4, DOM Worker 3.4) | AxioCEFProbe 50.6, cef:gpu-process 20.2, cef:renderer 13.5, cef:utility 13.4 | — | 267.1 |
| trace | idle | — | — | **3.9** (main 2.9, TaskCon~ller # 1.0) | AxioCEFProbe 2.0, Web Content 1.9, cef:utility 0.5 | — | — |
| trace | raf | 60.0 | 22.4 | **14.8** (main 6.2, Renderer 1.6, DOM Worker 1.6, WRRende~ckend# 1.3, glean.dispatche 0.7) | cef:renderer 7.2, cef:gpu-process 3.3, AxioCEFProbe 2.6 | — | — |
| trace | raf-nosampler | — | — | **14.0** (main 5.3, DOM Worker 2.0, Renderer 1.3, WRRende~ckend# 1.0, Compositor 1.0) | cef:renderer 8.0, cef:gpu-process 4.7, AxioCEFProbe 3.7 | — | — |
| trace | scroll | 60.0 | 22.1 | **24.4** (main 10.9, DOM Worker 4.5, Renderer 1.5, Backgro~Pool # 1.5, glean.dispatche 1.0) | cef:gpu-process 13.4, cef:renderer 7.5, AxioCEFProbe 5.0 | — | — |
| trace | key | — | — | **10.4** (main 6.4, TaskCon~ller # 1.1, DOM Worker 0.8, Renderer 0.6, glean.dispatche 0.3) | AxioCEFProbe 2.0, cef:renderer 1.7, cef:gpu-process 0.6, WebExtensions 0.3 | 10.7 | — |
| trace | switch-to-gecko | — | — | **34.0** (main 13.6, Renderer 6.8, DOM Worker 6.8, Backgro~Pool # 6.8) |  | — | 125.5 |
| profile | switch-to-engine | — | — | **92.4** (main 38.5, Renderer 15.4, DOM Worker 15.4, SamplerThread 15.4, glean.dispatche 7.7) | AxioCEFProbe 30.8, cef:renderer 15.4 | — | 105.2 |
| profile | idle | — | — | **10.1** (SamplerThread 3.8, DOM Worker 2.9, main 2.4, Timer 1.0) | Web Content 4.8, Isolated Web Co 2.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.9 | 20.8 | **27.8** (main 7.1, DOM Worker 6.2, SamplerThread 6.2, Renderer 1.6, Timer 1.3) | cef:renderer 8.1, Web Content 4.9, AxioCEFProbe 3.9, cef:gpu-process 3.2 | — | — |
| profile | raf-nosampler | — | — | **29.5** (DOM Worker 7.9, main 6.0, SamplerThread 6.0, Renderer 2.0, Socket Thread 1.7) | cef:renderer 7.5, Web Content 5.6, cef:gpu-process 4.7, AxioCEFProbe 2.9 | — | — |
| profile | scroll | 60.2 | 24.5 | **48.2** (main 18.1, DOM Worker 9.8, SamplerThread 6.9, TaskCon~ller # 2.9, Renderer 1.5) | cef:gpu-process 15.7, cef:renderer 8.3, AxioCEFProbe 4.9, Web Content 4.4 | — | — |
| profile | key | — | — | **25.0** (main 8.2, SamplerThread 5.8, DOM Worker 4.7, Timer 1.4, TaskCon~ller # 1.1) | Web Content 4.9, cef:renderer 2.2, AxioCEFProbe 1.4, WebExtensions 1.1 | 12.8 | — |
| profile | switch-to-gecko | — | — | **3.6** (SamplerThread 2.0, main 0.8, TaskCon~ller # 0.4, DOM Worker 0.3, BgIOThr~Pool # 0.1) | Web Content 5.7, Privileged Cont 1.1, Isolated Web Co 1.1, WebExtensions 1.0 | — | 15712.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.4 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 1.15 | 1.91 | — | — | — | — | — | 0.012 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.09 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | 0.12 | 0.07 | — | — | — | — | — | 0.005 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.0 | 0.0 | — | 0.23 | 0.08 | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 6.8 | 0.0 | 0 | 0.0 | — | — | 9.8 | 0.0 | — | 1.89 | 1.09 | — | — | — | — | — | 0.007 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.2 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.11 | 0.12 | — | — | — | — | — | 0.008 |
| profile | scroll | 59.4 | 0.0 | 0 | 0.0 | — | — | 8.7 | 0.0 | — | 0.15 | 0.11 | — | — | — | — | — | 0.007 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.0 | 0.0 | — | 0.28 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.714 | 1.298 | 0.0004 | 0.0008 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 185 | 185 | 0.021 | 0.045 | 0.0013 | 0.0027 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.032 | 0.057 | 0.0019 | 0.0034 |
| plain | scroll | memfd | native | 121 | 121 | 0.077 | 0.111 | 0.0045 | 0.0066 |
| plain | key | memfd | native | 21 | 21 | 0.009 | 0.049 | 0.0000 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.777 | 1.276 | 0.0050 | 0.0082 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 185 | 185 | 0.028 | 0.056 | 0.0017 | 0.0033 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.043 | 0.064 | 0.0026 | 0.0038 |
| trace | scroll | memfd | native | 120 | 120 | 0.072 | 0.108 | 0.0042 | 0.0064 |
| trace | key | memfd | native | 21 | 21 | 0.008 | 0.043 | 0.0000 | 0.0002 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 1.384 | 1.097 | 0.0095 | 0.0075 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.030 | 0.057 | 0.0018 | 0.0034 |
| profile | raf-nosampler | memfd | native | 180 | 180 | 0.043 | 0.072 | 0.0025 | 0.0043 |
| profile | scroll | memfd | native | 122 | 122 | 0.092 | 0.125 | 0.0055 | 0.0075 |
| profile | key | memfd | native | 21 | 21 | 0.009 | 0.046 | 0.0000 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 5.9 | 0.0 | — | 0.23 | 0.37 | — | — | 5.8 | 6.9 | 12.5 |
| profile | 0.6 | 7.8 | 0.0 | — | 0.29 | 0.55 | — | — | 6.3 | 9.2 | 15.7 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 153.6; write create 157.9; first frame applied (native receiver) 272.7; write frame_ack 276.4; write focus 282.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 16.1; first stdout read resolved 20.6; write shutdown 25.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 20.7; first stdout read resolved 27.9; first frame applied (native receiver) 110.7; write frame_ack 111.8; write focus 119.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 18.5; first stdout read resolved 24.2; write shutdown 28.2

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 44, Renderer 21, DOM Worker 7, WRRenderBackend 3, BgPool 2, WRSceneBuilder 2, Compositor 2, SwComposite 1, WRWorker 1, Socket 0, IPC I/O 0, ImageBridge 0, other 0, ImageIO 0
  - main thread 44 ms (31.2% of span): JavaScript 12, Layout 9, Idle 7, Other 6, Profiler 6, Graphics 2
  - JS leaf 3 / native under JS 22 / native 19; buckets: ipc 44, paint_layout 20, gc_cc 16, poll_wait 12, array_buffer_copy 10, subprocess_pipe_io 3, js_ctypes 3, harness_diagnostics 2
  - top self: `poll [libc.so.6]` 7; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 5; `#getClosableTabs/remainingTabs< (resource:///modules/zen/Zen` 3; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 21 ms (top self: `syscall [libc.so.6]` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::try_get_ca` 0); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memset_avx512_unaligned_erms [libc.so.6]` 0, `ARGBSetRow_X86 [libxul.so]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 7, poll_wait 7; top self: `poll [libc.so.6]` 7; `[unknown]` 0; `pthread_mutex_init@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3811** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (1.6% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3994** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.7% of span): GC / CC 1, Idle 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, gc_cc 1, poll_wait 0
  - top self: `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 1; `poll [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3227** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 45, DOM Worker 34, other 10, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 45 ms (2.2% of span): Idle 38, JavaScript 5, Profiler 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 7 / native 38; buckets: ipc 45, poll_wait 38, harness_diagnostics 6, array_buffer_copy 3, gc_cc 2, memcpy_memset 1, json_metadata 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 38; `write [libc.so.6]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Pr` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 33 ms: buckets subprocess_pipe_io 33, js_ctypes 33, worker_messaging 33, ipc 33, poll_wait 33; top self: `poll [libc.so.6]` 33
- **tab:3811** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): GC / CC 3, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, gc_cc 3, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `XPCWrappedNative::FlatJSObjectFinalized() [libxul.so]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `IPC::Message::IPDLMessage(long, unsigned int, unsigned int, ` 0; `__strnlen_evex [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3994** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 211, DOM Worker 130, Renderer 47, WRRenderBackend 37, Compositor 26, BgPool 22, SwComposite 20, other 17, ImageBridge 11, WRSceneBuilder 6, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0
  - main thread 211 ms (6.8% of span): Idle 148, JavaScript 36, Other 15, DOM 6, Profiler 3, GC / CC 2
  - JS leaf 7 / native under JS 32 / native 172; buckets: ipc 211, poll_wait 159, gc_cc 38, worker_messaging 18, engine_stream_read 14, json_metadata 11, native_receiver 7, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 149; `[unknown]` 6; `recvmsg [libc.so.6]` 5; `mprotect [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 189 ms, GCSlice 3× 2 ms, GCMinor 2× 2 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 41, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `syscall [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `[axiosozo-dev]` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 21 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 130 ms: buckets subprocess_pipe_io 130, worker_messaging 130, ipc 130, js_ctypes 124, poll_wait 123, gc_cc 2; top self: `poll [libc.so.6]` 123; `write [libc.so.6]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 0; `non-virtual thunk to mozilla::dom::WorkerGlobalSco` 0
- **tab:3317** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3816** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 194, main 178, Socket 59, Renderer 46, WRRenderBackend 36, BgPool 30, Compositor 26, SwComposite 20, ImageBridge 10, WRSceneBuilder 6, other 2, IPC I/O 1, ImageIO 0, WRWorker 0
  - main thread 178 ms (5.9% of span): Idle 99, JavaScript 37, Other 17, DOM 15, Network 9, Profiler 2
  - JS leaf 6 / native under JS 51 / native 122; buckets: ipc 178, poll_wait 105, gc_cc 51, worker_messaging 26, engine_stream_read 20, array_buffer_copy 14, subprocess_pipe_io 12, json_metadata 12
  - top self: `poll [libc.so.6]` 99; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `[unknown]` 6; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 4; `recvmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 46 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 41, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 32, `webrender::visibility::update_prim_visibility [lib` 0, `__memcmp_evex_movbe [libc.so.6]` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `nsThread::Dispatch(already_AddRefed<nsIRunnable>, ` 0); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #1 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `rename [libc.so.6]` 1, `[libfreeblpriv3.so]` 1)
  - busiest DOM Worker 186 ms: buckets subprocess_pipe_io 186, worker_messaging 185, ipc 185, js_ctypes 128, poll_wait 125, gc_cc 52; top self: `poll [libc.so.6]` 125; `[axiosozo-dev]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `madvise [libc.so.6]` 5; `mozilla::dom::Timeout::~Timeout() [libxul.so]` 4
- **tab:3317** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3299** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3993** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 359, DOM Worker 151, Renderer 34, BgPool 30, WRRenderBackend 27, Compositor 18, SwComposite 13, other 12, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0
  - main thread 359 ms (17.5% of span): Idle 188, GC / CC 56, JavaScript 48, Other 27, DOM 19, Graphics 9
  - JS leaf 2 / native under JS 61 / native 296; buckets: ipc 359, poll_wait 223, gc_cc 116, worker_messaging 38, paint_layout 31, subprocess_pipe_io 17, array_buffer_copy 15, engine_stream_read 15
  - top self: `poll [libc.so.6]` 190; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `write [libc.so.6]` 7; `[unknown]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `[axiosozo-dev]` 4
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 14× 50 ms, CCSlice 3× 10 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `syscall [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 1, `webrender::spatial_tree::SpatialTree::visit_node_i` 0); SwComposite 13 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 29, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 8 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::TextureClient::TextureClientRecyc` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 151 ms: buckets subprocess_pipe_io 151, worker_messaging 151, ipc 151, js_ctypes 139, poll_wait 135, array_buffer_copy 3; top self: `poll [libc.so.6]` 135; `read [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `[unknown]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3811** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3994** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3278** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 277, DOM Worker 106, Renderer 31, other 20, WRRenderBackend 11, Compositor 10, WRWorker 9, SwComposite 8, WRSceneBuilder 7, BgPool 2, IPC I/O 1, ImageBridge 1, Socket 1, ImageIO 0
  - main thread 277 ms (7.6% of span): Idle 102, JavaScript 51, GC / CC 29, Layout 26, Graphics 24, Other 20
  - JS leaf 7 / native under JS 90 / native 180; buckets: ipc 277, poll_wait 137, gc_cc 93, paint_layout 56, worker_messaging 47, engine_stream_read 28, subprocess_pipe_io 13, array_buffer_copy 11
  - top self: `poll [libc.so.6]` 102; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `[axiosozo-dev]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `write [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 786 ms, GCSlice 7× 23 ms, CCSlice 2× 6 ms, GCMinor 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0); SwComposite 9 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 106 ms: buckets subprocess_pipe_io 106, worker_messaging 106, ipc 106, js_ctypes 94, poll_wait 91, gc_cc 5; top self: `poll [libc.so.6]` 91; `getcontext [libc.so.6]` 3; `mozilla::dom::TimeoutExecutor::Run() [libxul.so]` 2; `JSStructuredCloneWriter::traverseObject(JS::Handle` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:3227** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `xpc::JSXrayTraits::createHolder(JSContext*, JSObject*) [libx` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3299** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3278** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 134, DOM Worker 31, Renderer 8, BgPool 7, IPC I/O 5, Compositor 3, other 2, WRRenderBackend 2, WRSceneBuilder 2, Socket 1, SwComposite 1, ImageBridge 0, ImageIO 0, WRWorker 0
  - main thread 134 ms (0.8% of span): GC / CC 73, Idle 20, JavaScript 13, Layout 11, Other 6, Graphics 5
  - JS leaf 1 / native under JS 23 / native 110; buckets: ipc 134, gc_cc 82, poll_wait 23, paint_layout 19, array_buffer_copy 11, harness_diagnostics 8, memcpy_memset 2, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 20; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `mozilla::nsDisplayOpacity::CanMerge(mozilla::nsDisplayItem c` 4
  - GC/CC markers: GCMajor 3× 198 ms, GCSlice 14× 65 ms, CCSlice 3× 10 ms, GCMinor 3× 1 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 8 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `roundf [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 6 ms (top self: `unlink [libc.so.6]` 4, `rmdir [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets subprocess_pipe_io 31, worker_messaging 31, ipc 31, gc_cc 27, js_ctypes 5, poll_wait 4; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `poll [libc.so.6]` 4; `[axiosozo-dev]` 3; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 3; `madvise [libc.so.6]` 3
- **tab:3317** CPU ms by thread group: main 5, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 3, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 3; `nsGenericHTMLElement::UnbindFromTree(mozilla::dom::UnbindCon` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `mozilla::dom::Promise::CreateWrapper(mozilla::ErrorResult&, ` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::ipc::IdleSchedulerChild::SetActive() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3811** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0, Layout 0, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1, canvas_2d 0
  - top self: `poll [libc.so.6]` 3; `[]` 0; `mozilla::layout::TextDrawTarget::~TextDrawTarget() [libxul.s` 0; `mozilla::ScrollContainerFrame::HandleScrollbarStyleSwitching` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::ViewportUtils::VisualToLayout(nsRect const&, mozill` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3299** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

