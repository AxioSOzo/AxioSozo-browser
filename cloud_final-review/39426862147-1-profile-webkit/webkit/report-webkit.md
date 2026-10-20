# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **38.6** (Renderer 18.0, main 10.3, DOM Worker 5.1, WRRende~ckend# 2.6, SwComposite 2.6) | WPEWebProcess 56.5, AxioWebKitHost 18.0, WPENetworkProce 12.8 | — | 368.7 |
| plain | idle | — | — | **6.9** (main 3.9, DOM Worker 1.5, TaskCon~ller # 1.0, glean.dispatche 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| plain | raf | 57.9 | 21.1 | **16.8** (main 7.2, Renderer 2.0, DOM Worker 1.6, Backgro~Pool # 1.3, SwComposite 1.0) | WPEWebProcess 42.8, AxioWebKitHost 6.3 | — | — |
| plain | raf-nosampler | — | — | **16.9** (main 4.3, Renderer 2.7, DOM Worker 2.3, SwComposite 1.7, Backgro~Pool # 1.3) | WPEWebProcess 48.1, AxioWebKitHost 7.0, WebExtensions 0.3 | — | — |
| plain | scroll | 56.8 | 33.1 | **35.5** (main 16.5, DOM Worker 6.0, Backgro~Pool # 3.5, Renderer 2.5, TaskCon~ller # 2.0) | WPEWebProcess 50.0, AxioWebKitHost 9.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **14.0** (main 8.5, Renderer 1.1, DOM Worker 0.8, Timer 0.6, TaskCon~ller # 0.6) | WPEWebProcess 5.6, AxioWebKitHost 1.4, Isolated Web Co 0.3 | 17.9 | — |
| plain | switch-to-gecko | — | — | **35.4** (main 17.7, TaskCon~ller # 8.9, Renderer 4.4, sqldb:p~lite # 4.4) |  | — | 211.2 |
| trace | switch-to-engine | — | — | **31.5** (main 18.0, Renderer 9.0, glean.dispatche 4.5) | WPEWebProcess 49.5, WPENetworkProce 13.5, AxioWebKitHost 9.0 | — | 206.0 |
| trace | idle | — | — | **3.0** (main 2.5, Timer 0.5) | Web Content 2.5, forkserver 0.5 | — | — |
| trace | raf | 57.1 | 24.4 | **75.1** (main 19.7, DOM Worker 19.7, Indexed~ IO # 14.1, IPDL Background 6.2, Renderer 2.6) | WPEWebProcess 47.3, AxioWebKitHost 7.6, RDD Process 0.3, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **23.7** (main 8.0, DOM Worker 4.0, Renderer 2.7, TaskCon~ller # 2.0, Backgro~Pool # 1.7) | WPEWebProcess 47.6, AxioWebKitHost 7.6, Web Content 0.3 | — | — |
| trace | scroll | 57.0 | 33.7 | **37.5** (main 17.0, DOM Worker 7.5, Backgro~Pool # 3.0, TaskCon~ller # 2.5, Renderer 2.0) | WPEWebProcess 49.0, AxioWebKitHost 9.5 | — | — |
| trace | key | — | — | **14.8** (main 8.3, DOM Worker 1.4, Renderer 1.1, Timer 0.8, SwComposite 0.8) | WPEWebProcess 5.8, AxioWebKitHost 1.7, WebExtensions 0.3 | 17.8 | — |
| trace | switch-to-gecko | — | — | **35.3** (main 17.7, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4, Renderer 4.4, WRRende~ckend# 4.4) | Isolated Web Co 4.4 | — | 211.5 |
| profile | switch-to-engine | — | — | **41.9** (main 12.5, Renderer 8.4, DOM Worker 8.4, Backgro~Pool # 4.2, Compositor 4.2) | Web Content 92.0, WPEWebProcess 62.7, WPENetworkProce 8.4, Isolated Web Co 4.2 | — | 209.7 |
| profile | idle | — | — | **27.9** (main 10.3, DOM Worker 6.8, SamplerThread 6.8, TaskCon~ller # 2.0, Timer 1.5) | Web Content 5.4, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 58.0 | 24.5 | **45.7** (main 14.1, DOM Worker 9.5, SamplerThread 8.2, Renderer 2.9, WRRende~ckend# 1.6) | WPEWebProcess 48.7, AxioWebKitHost 7.5, Web Content 6.2, Isolated Web Co 1.6 | — | — |
| profile | raf-nosampler | — | — | **32.0** (DOM Worker 10.0, SamplerThread 6.7, main 5.3, Renderer 2.7, Backgro~Pool # 1.7) | WPEWebProcess 47.8, AxioWebKitHost 7.7, Web Content 5.3, Socket Process 1.0 | — | — |
| profile | scroll | 57.3 | 33.6 | **62.1** (main 24.8, DOM Worker 12.9, SamplerThread 8.4, Backgro~Pool # 4.0, Renderer 3.0) | WPEWebProcess 52.2, AxioWebKitHost 9.5, Web Content 5.0, Socket Process 1.0 | — | — |
| profile | key | — | — | **37.9** (main 15.1, DOM Worker 8.0, SamplerThread 7.1, TaskCon~ller # 2.5, Renderer 1.6) | WPEWebProcess 6.5, Web Content 5.8, Privileged Cont 1.4, Isolated Web Co 1.4 | 18.1 | — |
| profile | switch-to-gecko | — | — | **29.5** (main 12.7, Renderer 4.2, Compositor 4.2, DOM Worker 4.2, SamplerThread 4.2) | Isolated Web Co 4.2 | — | 216.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 8.5 | 0.0 | 0 | 0.0 | — | — | 47.1 | 0.0 | — | 1.44 | 0.55 | — | — | — | — | — | 0.005 |
| trace | raf | 57.3 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.15 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.7 | 0.0 | — | 0.17 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 56.3 | 0.0 | 0 | 0.0 | — | — | 13.1 | 0.0 | — | 0.34 | 0.09 | — | — | — | — | — | 0.005 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.07 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.8 | 0.0 | 0 | 0.0 | — | — | 57.9 | 0.0 | — | 1.99 | 1.08 | — | — | — | — | — | 0.009 |
| profile | raf | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.17 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.20 | 0.14 | — | — | — | — | — | 0.009 |
| profile | scroll | 56.3 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 0.42 | 0.13 | — | — | — | — | — | 0.008 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.10 | 0.12 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.850 | 1.378 | 0.0043 | 0.0069 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.047 | 0.113 | 0.0027 | 0.0066 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.065 | 0.148 | 0.0038 | 0.0086 |
| plain | scroll | memfd | native | 112 | 112 | 0.243 | 0.337 | 0.0135 | 0.0188 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.098 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.824 | 1.527 | 0.0070 | 0.0129 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 176 | 176 | 0.067 | 0.133 | 0.0038 | 0.0077 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.083 | 0.152 | 0.0048 | 0.0088 |
| trace | scroll | memfd | native | 113 | 113 | 0.254 | 0.335 | 0.0143 | 0.0189 |
| trace | key | memfd | native | 20 | 20 | 0.002 | 0.098 | 0.0000 | 0.0005 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.474 | 2.407 | 0.0116 | 0.0189 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.066 | 0.132 | 0.0039 | 0.0077 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.090 | 0.169 | 0.0052 | 0.0098 |
| profile | scroll | memfd | native | 114 | 113 | 0.289 | 0.389 | 0.0163 | 0.0217 |
| profile | key | memfd | native | 20 | 20 | 0.002 | 0.121 | 0.0000 | 0.0007 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 14.7 | 0.0 | — | 0.07 | 0.26 | — | — | 14.3 | 15.6 | 30.2 |
| profile | 0.6 | 14.4 | 0.0 | — | 0.10 | 0.34 | — | — | 14.8 | 16.6 | 31.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 19.1; first stdout read resolved 28.0; first frame applied (native receiver) 216.8; write frame_ack 217.8; write visibility 221.1; write focus 221.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 13.1; first stdout read resolved 18.3

Switch timeline (profile, switch-to-engine, ms after the window start): write create 22.6; first stdout read resolved 29.9; first frame applied (native receiver) 217.0; write frame_ack 219.0; write visibility 226.4; write focus 226.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 16.5; first stdout read resolved 25.8

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 37, Renderer 17, DOM Worker 15, BgPool 6, IPC I/O 2, Compositor 2, WRRenderBackend 2, SwComposite 2, WRSceneBuilder 1, Socket 1, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 37 ms (14.7% of span): JavaScript 9, DOM 8, Idle 6, Layout 4, Other 4, GC / CC 4
  - JS leaf 0 / native under JS 25 / native 12; buckets: ipc 37, gc_cc 18, harness_diagnostics 15, array_buffer_copy 13, paint_layout 10, poll_wait 7, engine_stream_read 4, subprocess_pipe_io 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 5; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `js::DefineDataProperty(JSContext*, JS::Handle<JSObject*>, JS` 2; `nsIFrame::GetAspectRatio() const [libxul.so]` 1
  - WebRender/compositor threads: Renderer 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_mask_SUPERELLIPSE_frag::pattern_fragment(g` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #1 6 ms (top self: `ARGBSetRow_X86 [libxul.so]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 14, poll_wait 13, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 13; `void mozilla::WriteULEB128<unsigned int, mozilla::` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 0
- **tab:7881** CPU ms by thread group: main 41, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 41 ms (24.8% of span): Other 31, JavaScript 3, Profiler 3, DOM 3, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 36; buckets: ipc 31, array_buffer_copy 13, gc_cc 10, subprocess_pipe_io 4, poll_wait 2, json_metadata 1
  - top self: `[libfontconfig.so.1]` 4; `[]` 3; `__lll_lock_wake [libc.so.6]` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7887** CPU ms by thread group: main 38, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 38 ms (24.6% of span): Other 30, JavaScript 4, Profiler 2, DOM 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 3 / native 35; buckets: ipc 30, array_buffer_copy 11, gc_cc 6, subprocess_pipe_io 2, poll_wait 1, memcpy_memset 0
  - top self: `__strcmp_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::net::LoadInfo::~LoadInfo() [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `uhash_geti_78 [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7740** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.8% of span): Idle 2, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 193, DOM Worker 82, other 15, Socket 1, BgPool 1, IPC I/O 1, ImageIO 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 193 ms (9.4% of span): Idle 117, GC / CC 41, JavaScript 17, Other 11, DOM 5, Profiler 2
  - JS leaf 3 / native under JS 18 / native 172; buckets: ipc 193, poll_wait 122, gc_cc 46, harness_diagnostics 18, array_buffer_copy 4, engine_stream_read 2, memcpy_memset 2, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 122; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `[unknown]` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMajor 1× 1051 ms, GCSlice 8× 32 ms, CCSlice 4× 10 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `[axiosozo-dev]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 82 ms: buckets subprocess_pipe_io 82, worker_messaging 82, ipc 82, js_ctypes 81, poll_wait 81; top self: `__syscall_cancel_arch [libc.so.6]` 81; `[unknown]` 0
- **tab:7740** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::dom::AutoYieldJSThreadExecution::AutoYieldJSThreadE` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 395, DOM Worker 213, Renderer 84, SwComposite 48, BgPool 40, WRRenderBackend 37, Compositor 32, other 24, ImageBridge 13, WRSceneBuilder 6, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 395 ms (12.8% of span): Idle 256, JavaScript 62, Other 31, GC / CC 26, DOM 16, Profiler 3
  - JS leaf 9 / native under JS 66 / native 319; buckets: ipc 393, poll_wait 274, gc_cc 82, engine_stream_read 40, worker_messaging 32, subprocess_pipe_io 20, harness_diagnostics 18, native_receiver 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 269; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 5; `__lll_lock_wait [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 1049 ms, GCSlice 8× 30 ms, GCMinor 2× 2 ms
  - WebRender/compositor threads: Renderer 84 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx512_unaligned_erms [libc.so.6]` 9, `syscall [libc.so.6]` 4); SwComposite 47 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 1, `floorf [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 41 ms (top self: `__syscall_cancel_arch [libc.so.6]` 38, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 213 ms: buckets subprocess_pipe_io 213, worker_messaging 212, ipc 212, js_ctypes 195, poll_wait 191, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 191; `[axiosozo-dev]` 3; `[unknown]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:7740** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 3, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, gc_cc 3, poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `non-virtual thunk to mozilla::dom::SessionStoreChangeListene` 0; `js::gcstats::Statistics::lookupChildPhase(js::gcstats::Phase` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Ad` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7746** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 206, main 160, Renderer 78, BgPool 50, SwComposite 50, WRRenderBackend 37, Compositor 32, ImageBridge 12, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 160 ms (5.3% of span): Idle 93, JavaScript 42, Other 9, DOM 8, Profiler 5, GC / CC 3
  - JS leaf 8 / native under JS 43 / native 109; buckets: ipc 160, poll_wait 97, gc_cc 53, engine_stream_read 34, worker_messaging 19, native_receiver 15, subprocess_pipe_io 12, array_buffer_copy 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 99; `[unknown]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `bool js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl` 1; `PreprocessFastValue(JSContext*, JS::Value*, (anonymous names` 1; `presentNativeFrame (chrome://browser/content/axiosozo/Engine` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `__syscall_cancel_arch [libc.so.6]` 62, `__memmove_avx512_unaligned_erms [libc.so.6]` 8, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); SwComposite 50 ms (top self: `syscall [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 49 ms (top self: `__syscall_cancel_arch [libc.so.6]` 44, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 0); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `[linux-vdso.so.1]` 0)
  - busiest DOM Worker 206 ms: buckets subprocess_pipe_io 206, worker_messaging 204, ipc 204, js_ctypes 185, poll_wait 181, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 181; `mozilla::JSHolderMap::Put(void*, nsScriptObjectTra` 3; `[linux-vdso.so.1]` 2; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1
- **tab:7740** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, Other 1, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 0; `__lll_lock_wake [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7746** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 460, DOM Worker 202, BgPool 76, Renderer 53, SwComposite 29, WRRenderBackend 27, Compositor 20, other 16, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 460 ms (22.7% of span): Idle 249, JavaScript 86, Other 48, GC / CC 33, DOM 19, Profiler 10
  - JS leaf 10 / native under JS 91 / native 358; buckets: ipc 458, poll_wait 293, gc_cc 113, engine_stream_read 53, worker_messaging 40, paint_layout 34, harness_diagnostics 29, array_buffer_copy 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 265; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `__lll_lock_wake [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCSlice 7× 29 ms, CCSlice 3× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 53 ms (top self: `__syscall_cancel_arch [libc.so.6]` 40, `syscall [libc.so.6]` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); SwComposite 29 ms (top self: `syscall [libc.so.6]` 29, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 1, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 76 ms (top self: `__syscall_cancel_arch [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 17, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `mozilla::BufferList<InfallibleAllocPolicy>::Alloca` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 202 ms: buckets subprocess_pipe_io 202, worker_messaging 202, ipc 202, js_ctypes 185, poll_wait 173, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 175; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[unknown]` 2; `__lll_lock_wait [libc.so.6]` 2; `mozilla::ProfileBufferEntryWriter::Serializer<mozi` 1
- **tab:7360** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7740** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7746** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 502, DOM Worker 188, Renderer 47, other 26, SwComposite 25, Compositor 16, WRRenderBackend 16, WRSceneBuilder 9, WRWorker 9, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 502 ms (13.8% of span): Idle 220, JavaScript 75, GC / CC 63, Other 39, Layout 35, Graphics 30
  - JS leaf 13 / native under JS 116 / native 373; buckets: ipc 500, poll_wait 259, gc_cc 142, paint_layout 80, engine_stream_read 61, worker_messaging 60, harness_diagnostics 23, subprocess_pipe_io 18
  - top self: `__syscall_cancel_arch [libc.so.6]` 229; `[unknown]` 18; `[axiosozo-dev]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4
  - GC/CC markers: GCMajor 2× 1086 ms, GCSlice 15× 53 ms, CCSlice 5× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `ClearTexSubImage [libxul.so]` 3); SwComposite 25 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 11, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `__pthread_mutex_unlock_usercnt [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 183 ms: buckets subprocess_pipe_io 183, worker_messaging 183, ipc 183, js_ctypes 174, poll_wait 170, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 170; `[axiosozo-dev]` 1; `[unknown]` 1; `js::intl::SharedIntlData::trace(JSTracer*) [libxul` 1; `js::gc::TenuringTracer::promoteObjectSlow(JSObject` 1
- **tab:7280** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozill` 0; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 0; `PR_GetCurrentThread [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 63, Renderer 18, DOM Worker 10, BgPool 4, WRRenderBackend 3, WRSceneBuilder 2, Compositor 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 63 ms (23.1% of span): JavaScript 23, DOM 11, Graphics 9, Other 7, Layout 6, Idle 4
  - JS leaf 1 / native under JS 37 / native 25; buckets: ipc 63, paint_layout 17, array_buffer_copy 16, gc_cc 14, harness_diagnostics 9, poll_wait 6, engine_stream_read 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[axiosozo-dev]` 6; `nsAtomTable::AtomizeMainThread(nsTSubstring<char16_t> const&` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 3; `getcontext [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 18 ms (top self: `hypotf@@GLIBC_2.35 [libm.so.6]` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `rmdir [libc.so.6]` 1, `getdents64 [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, poll_wait 9, js_ctypes 9, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 9; `mozilla::EventDispatcher::Dispatch(mozilla::dom::E` 0; `[axiosozo-dev]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::Alloca` 0
- **tab:7740** CPU ms by thread group: main 23, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 23 ms (8.4% of span): JavaScript 8, Idle 5, Other 4, Layout 3, DOM 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 16; buckets: ipc 21, gc_cc 9, paint_layout 9, subprocess_pipe_io 6, poll_wait 5, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::frontend::ParserAtomsTable::internLatin1(js::FrontendCon` 3; `mozilla::PresShell::GetRootWidget() const [libxul.so]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `js::gc::BufferAllocator::allocSmall(unsigned long, bool, boo` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7280** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, J` 0; `js::AsyncFunctionResolve(JSContext*, JS::Handle<js::AsyncFun` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7881** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Other 0, Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `g_poll [libglib-2.0.so.0]` 0; `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

