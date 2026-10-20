# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **41.7** (Renderer 23.2, main 13.9, SwComposite 4.6) | WPEWebProcess 65.0, AxioWebKitHost 9.3, WPENetworkProce 9.3 | — | 193.4 |
| plain | idle | — | — | **5.9** (main 4.4, Timer 0.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.4 | — | — |
| plain | raf | 57.9 | 26.5 | **23.9** (main 9.6, DOM Worker 3.0, Renderer 2.3, Backgro~Pool # 2.0, TaskCon~ller # 1.3) | WPEWebProcess 54.0, AxioWebKitHost 6.3, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.3** (main 4.3, Renderer 2.7, DOM Worker 2.7, Backgro~Pool # 2.3, SwComposite 1.3) | WPEWebProcess 54.8, AxioWebKitHost 6.7, Privileged Cont 0.6 | — | — |
| plain | scroll | 56.8 | 29.8 | **36.9** (main 17.9, DOM Worker 6.5, Backgro~Pool # 3.0, Renderer 2.5, TaskCon~ller # 2.0) | WPEWebProcess 63.3, AxioWebKitHost 9.5 | — | — |
| plain | key | — | — | **14.9** (main 8.0, Renderer 1.4, DOM Worker 1.1, SwComposite 0.8, glean.dispatche 0.6) | WPEWebProcess 8.1, AxioWebKitHost 2.3, WebExtensions 0.3 | 17.3 | — |
| plain | switch-to-gecko | — | — | **22.0** (main 8.8, Timer 4.4, Renderer 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 210.1 |
| profile | switch-to-engine | — | — | **29.7** (main 8.9, DOM Worker 8.9, SamplerThread 5.9, Socket Thread 3.0, Renderer 3.0) | Web Content 65.0, WPEWebProcess 62.1, WPENetworkProce 8.9, AxioWebKitHost 5.9 | — | 311.5 |
| profile | idle | — | — | **24.8** (main 9.2, DOM Worker 6.8, SamplerThread 6.8, Timer 1.0, glean.dispatche 0.5) | Web Content 4.4, WebExtensions 1.5, Socket Process 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 57.8 | 21.5 | **49.8** (main 14.7, DOM Worker 11.5, SamplerThread 9.2, Renderer 2.6, Backgro~Pool # 2.6) | WPEWebProcess 58.5, Web Content 7.2, AxioWebKitHost 7.2, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **39.5** (DOM Worker 10.0, SamplerThread 8.0, main 7.3, Renderer 3.3, Backgro~Pool # 2.7) | WPEWebProcess 57.0, Web Content 6.6, AxioWebKitHost 6.6, WebExtensions 1.3 | — | — |
| profile | scroll | 56.3 | 34.2 | **66.4** (main 24.9, DOM Worker 15.5, SamplerThread 9.0, Backgro~Pool # 4.0, TaskCon~ller # 2.5) | WPEWebProcess 57.4, AxioWebKitHost 8.0, Web Content 6.0, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **37.8** (main 13.8, DOM Worker 8.3, SamplerThread 8.0, Renderer 1.7, Timer 1.4) | WPEWebProcess 6.9, Web Content 6.6, WebExtensions 2.0, AxioWebKitHost 1.7 | 17.9 | — |
| profile | switch-to-gecko | — | — | **46.3** (main 16.9, DOM Worker 8.4, SamplerThread 8.4, Renderer 4.2, WRScene~ilder# 4.2) | Web Content 4.2 | — | 216.8 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 5.7 | 0.0 | 0 | 0.0 | — | — | 92.9 | 0.0 | — | 1.51 | 0.66 | — | — | — | — | — | 0.004 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.16 | 0.14 | — | — | — | — | — | 0.010 |
| profile | scroll | 54.5 | 0.0 | 0 | 0.0 | — | — | 12.7 | 0.0 | — | 0.38 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.1 | 0.0 | — | 0.12 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.981 | 0.876 | 0.0086 | 0.0077 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 176 | 0.035 | 0.301 | 0.0020 | 0.0174 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.058 | 0.298 | 0.0034 | 0.0174 |
| plain | scroll | memfd | native | 111 | 111 | 0.235 | 0.318 | 0.0129 | 0.0175 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.436 | 0.0000 | 0.0024 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.017 | 0.891 | 0.0057 | 0.0050 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.050 | 0.365 | 0.0029 | 0.0211 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.063 | 0.363 | 0.0036 | 0.0210 |
| profile | scroll | memfd | native | 110 | 110 | 0.252 | 0.337 | 0.0137 | 0.0184 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.471 | 0.0000 | 0.0026 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 15.6 | 0.1 | — | 0.12 | 0.40 | — | — | 8.2 | 17.1 | 24.3 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 23.8; first stdout read resolved 29.3; first frame applied (native receiver) 320.0; write frame_ack 321.1; write visibility 327.8; write focus 328.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 20.2; first stdout read resolved 30.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 37, DOM Worker 23, Renderer 8, BgPool 4, IPC I/O 2, Compositor 2, WRRenderBackend 2, WRSceneBuilder 1, SwComposite 1, Socket 1, WRWorker 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 37 ms (10.4% of span): JavaScript 15, Layout 6, Idle 5, DOM 5, Other 3, Profiler 2
  - JS leaf 0 / native under JS 24 / native 13; buckets: ipc 37, gc_cc 20, array_buffer_copy 11, paint_layout 9, harness_diagnostics 9, poll_wait 6, engine_stream_read 6, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `nsBlockFrame::ReflowBlockFrame(mozilla::BlockReflowState&, G` 2; `js::frontend::BytecodeEmitter::updateSourceCoordNotes(unsign` 2; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifI` 2; `v8::internal::ExternalReference::TopOfRegexpStack(v8::intern` 2; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 7 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 1, `__syscall_cancel_arch [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0, `webrender::prepare::prepare_prim_for_render [libxu` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__memset_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 23 ms: buckets subprocess_pipe_io 23, worker_messaging 23, ipc 23, js_ctypes 22, poll_wait 20; top self: `__syscall_cancel_arch [libc.so.6]` 22; `[axiosozo-dev]` 1
- **tab:7735** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (16.8% of span): Other 36, JavaScript 5, Profiler 3, DOM 3, Idle 1
  - JS leaf 1 / native under JS 3 / native 44; buckets: ipc 38, array_buffer_copy 17, gc_cc 10, subprocess_pipe_io 3, poll_wait 2, memcpy_memset 2, canvas_2d 1
  - top self: `[]` 6; `__syscall_cancel_arch [libc.so.6]` 4; `js::SharedPropMap::addPropertyInternal(JSContext*, JS::Mutab` 3; `mmap64 [libc.so.6]` 2; `[libexpat.so.1]` 2; `access [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7741** CPU ms by thread group: main 45, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (17.5% of span): Other 33, Profiler 4, DOM 3, JavaScript 3, Idle 2
  - JS leaf 0 / native under JS 4 / native 41; buckets: ipc 33, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 4, poll_wait 3, memcpy_memset 2, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 2; `[libfontconfig.so.1]` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7593** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 1, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `g_poll [libglib-2.0.so.0]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 173, DOM Worker 85, other 16, Compositor 1, Socket 1, IPC I/O 1, Renderer 0, BgPool 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 173 ms (8.4% of span): Idle 113, JavaScript 26, DOM 21, Other 9, Profiler 3, Graphics 1
  - JS leaf 0 / native under JS 38 / native 134; buckets: ipc 173, poll_wait 118, gc_cc 24, array_buffer_copy 16, harness_diagnostics 16, engine_stream_read 4, worker_messaging 2, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `js::AbstractGeneratorObject::resume(JSContext*, js::Interpre` 2
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `webrender::clip::ClipStore::build_clip_chain_insta` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 81 ms: buckets subprocess_pipe_io 81, js_ctypes 81, worker_messaging 81, ipc 81, poll_wait 81, memcpy_memset 0; top self: `__syscall_cancel_arch [libc.so.6]` 81; `moz_arena_calloc [axiosozo-dev]` 0; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 0
- **tab:7380** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7285** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 433, DOM Worker 271, Renderer 80, BgPool 76, SwComposite 42, WRRenderBackend 41, Compositor 34, other 26, ImageBridge 14, WRSceneBuilder 7, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 433 ms (14.1% of span): Idle 275, JavaScript 67, Other 33, GC / CC 26, DOM 23, Profiler 7
  - JS leaf 9 / native under JS 81 / native 342; buckets: ipc 432, poll_wait 289, gc_cc 86, engine_stream_read 45, harness_diagnostics 38, worker_messaging 34, subprocess_pipe_io 16, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 285; `[unknown]` 14; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 7; `[axiosozo-dev]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 581 ms, GCSlice 7× 25 ms, GCMinor 2× 7 ms
  - WebRender/compositor threads: Renderer 80 ms (top self: `__syscall_cancel_arch [libc.so.6]` 64, `__memmove_evex_unaligned_erms [libc.so.6]` 6, `syscall [libc.so.6]` 5); SwComposite 42 ms (top self: `syscall [libc.so.6]` 39, `__memmove_evex_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 41 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 76 ms (top self: `__syscall_cancel_arch [libc.so.6]` 67, `__memmove_evex_unaligned_erms [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `[linux-vdso.so.1]` 0, `__lll_lock_wake [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 228 ms: buckets subprocess_pipe_io 228, worker_messaging 228, ipc 228, js_ctypes 211, poll_wait 205, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 206; `[unknown]` 3; `[axiosozo-dev]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1; `mozilla::net::SSLTokensCacheService::Release() [li` 1
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7361** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 219, main 210, Renderer 77, BgPool 76, SwComposite 40, WRRenderBackend 38, Compositor 34, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 210 ms (6.9% of span): Idle 105, JavaScript 46, GC / CC 30, Other 19, DOM 7, Profiler 3
  - JS leaf 6 / native under JS 45 / native 159; buckets: ipc 210, poll_wait 116, gc_cc 79, engine_stream_read 40, worker_messaging 28, subprocess_pipe_io 12, native_receiver 7, array_buffer_copy 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::jit::BaselineCacheIRCompiler::compile() [libxul.so]` 3; `syscall [libc.so.6]` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 77 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_evex_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 4); SwComposite 40 ms (top self: `syscall [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 76 ms (top self: `__syscall_cancel_arch [libc.so.6]` 62, `__memmove_evex_unaligned_erms [libc.so.6]` 13, `nsThreadPool::Run() [libxul.so]` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[axiosozo-dev]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 216 ms: buckets subprocess_pipe_io 216, worker_messaging 216, ipc 216, js_ctypes 194, poll_wait 187, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 188; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7380** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 461, DOM Worker 264, BgPool 66, Renderer 46, WRRenderBackend 24, SwComposite 23, Compositor 20, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 461 ms (22.9% of span): Idle 253, JavaScript 78, Other 51, GC / CC 33, DOM 24, Profiler 9
  - JS leaf 7 / native under JS 89 / native 365; buckets: ipc 459, poll_wait 296, gc_cc 111, engine_stream_read 59, worker_messaging 41, paint_layout 29, harness_diagnostics 26, array_buffer_copy 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 276; `[unknown]` 20; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 791 ms, GCSlice 7× 28 ms, CCSlice 2× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 46 ms (top self: `__syscall_cancel_arch [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `syscall [libc.so.6]` 1); WRRenderBackend#0 24 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 23 ms (top self: `syscall [libc.so.6]` 23, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 66 ms (top self: `__syscall_cancel_arch [libc.so.6]` 54, `__memmove_evex_unaligned_erms [libc.so.6]` 11, `[linux-vdso.so.1]` 1); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `mojo::core::ports::Node::PrepareToForwardUserMessa` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 263 ms: buckets subprocess_pipe_io 263, worker_messaging 262, ipc 262, js_ctypes 180, poll_wait 170, gc_cc 54; top self: `__syscall_cancel_arch [libc.so.6]` 171; `[axiosozo-dev]` 8; `__memset_evex_unaligned_erms [libc.so.6]` 7; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 7; `madvise [libc.so.6]` 7
- **tab:7599** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7339** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 461, DOM Worker 188, Renderer 54, other 26, SwComposite 26, Compositor 16, WRRenderBackend 15, WRWorker 10, BgPool 10, WRSceneBuilder 9, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 461 ms (12.6% of span): Idle 212, JavaScript 67, Other 42, GC / CC 38, DOM 33, Layout 31
  - JS leaf 8 / native under JS 121 / native 332; buckets: ipc 459, poll_wait 258, gc_cc 115, paint_layout 71, engine_stream_read 56, worker_messaging 55, harness_diagnostics 22, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 230; `[unknown]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 9; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 6
  - GC/CC markers: GCMajor 1× 1053 ms, GCSlice 8× 31 ms, CCSlice 2× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 54 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 4); SwComposite 26 ms (top self: `syscall [libc.so.6]` 15, `__memmove_evex_unaligned_erms [libc.so.6]` 9, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `<webrender::frame_allocator::FrameAllocator as all` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__memmove_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 187 ms: buckets subprocess_pipe_io 187, worker_messaging 187, ipc 187, js_ctypes 175, poll_wait 172, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 172; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 2; `[unknown]` 2; `[axiosozo-dev]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1
- **tab:7285** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `g_source_ref [libglib-2.0.so.0]` 1; `nsArrayCC::AddRef() [libxul.so]` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 17, DOM Worker 14, BgPool 6, Compositor 3, WRSceneBuilder 2, WRRenderBackend 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 66 ms (23.7% of span): JavaScript 24, Layout 11, Other 10, DOM 10, Idle 5, Graphics 4
  - JS leaf 5 / native under JS 36 / native 26; buckets: ipc 66, paint_layout 15, array_buffer_copy 13, harness_diagnostics 13, gc_cc 12, poll_wait 10, subprocess_pipe_io 5, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `mozilla::TaskController::MaybeInterruptTask(mozilla::Task*, ` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `next (self-hosted:392:27)[25]` 3; `mozilla::TimingParams::FromEffectTiming(mozilla::dom::Effect` 2; `mozilla::ScrollContainerFrame::ComputeScrolledRect(nsIFrame ` 2
  - WebRender/compositor threads: Renderer 17 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 2, `hypotf@@GLIBC_2.35 [libm.so.6]` 2); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `<core::iter::adapters::map::Map<I,F> as core::iter` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 6 ms (top self: `rmdir [libc.so.6]` 3, `unlink [libc.so.6]` 2, `fstatat64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `syscall [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, poll_wait 13, js_ctypes 13; top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::Interpret(JSContext*, js::RunState&) [libxul.s` 1; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::V` 0; `mozilla::ProfileBufferBlockIndex profiler_add_mark` 0
- **tab:7593** CPU ms by thread group: main 25, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (9.1% of span): JavaScript 7, Other 7, Idle 5, Layout 3, DOM 2, Profiler 1
  - JS leaf 1 / native under JS 8 / native 16; buckets: ipc 21, gc_cc 7, poll_wait 5, subprocess_pipe_io 5, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7285** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 3, JavaScript 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[]` 0; `js::SavedStacks::getLocation(JSContext*, js::FrameIter const` 0; `AddPromiseReaction(JSContext*, JS::Handle<js::PromiseObject*` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7735** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

