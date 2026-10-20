# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **29.4** (Renderer 14.7, main 7.3, glean.dispatche 3.7, Compositor 3.7) | WPEWebProcess 55.0, WPENetworkProce 11.0, AxioWebKitHost 7.3 | — | 254.3 |
| plain | idle | — | — | **4.0** (main 3.0, Timer 1.0) | Web Content 3.0 | — | — |
| plain | raf | 57.9 | 21.7 | **39.5** (main 14.8, DOM Worker 9.2, IPDL Background 2.6, Renderer 2.3, TaskCon~ller # 1.3) | WPEWebProcess 54.3, AxioWebKitHost 6.6, Privileged Cont 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.3** (main 6.3, DOM Worker 4.0, Renderer 2.0, TaskCon~ller # 1.7, Backgro~Pool # 1.7) | WPEWebProcess 51.3, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 56.2 | 35.5 | **35.5** (main 16.5, DOM Worker 7.5, TaskCon~ller # 2.5, Backgro~Pool # 2.5, Renderer 2.0) | WPEWebProcess 56.1, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.7, Renderer 1.4, DOM Worker 0.8, Timer 0.6, Compositor 0.6) | WPEWebProcess 6.7, AxioWebKitHost 1.1, WebExtensions 0.3 | 16.4 | — |
| plain | switch-to-gecko | — | — | **22.0** (main 13.2, IPC I/O Parent 4.4, TaskCon~ller # 4.4) | Isolated Web Co 4.4 | — | 211.0 |
| plain | switch-to-engine | — | — | **29.4** (Renderer 14.7, main 7.3, glean.dispatche 3.7, Compositor 3.7) | WPEWebProcess 55.0, WPENetworkProce 11.0, AxioWebKitHost 7.3 | — | 254.3 |
| plain | idle | — | — | **4.0** (main 3.0, Timer 1.0) | Web Content 3.0 | — | — |
| plain | raf | 57.9 | 21.7 | **39.5** (main 14.8, DOM Worker 9.2, IPDL Background 2.6, Renderer 2.3, TaskCon~ller # 1.3) | WPEWebProcess 54.3, AxioWebKitHost 6.6, Privileged Cont 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.3** (main 6.3, DOM Worker 4.0, Renderer 2.0, TaskCon~ller # 1.7, Backgro~Pool # 1.7) | WPEWebProcess 51.3, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 56.2 | 35.5 | **35.5** (main 16.5, DOM Worker 7.5, TaskCon~ller # 2.5, Backgro~Pool # 2.5, Renderer 2.0) | WPEWebProcess 56.1, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.7, Renderer 1.4, DOM Worker 0.8, Timer 0.6, Compositor 0.6) | WPEWebProcess 6.7, AxioWebKitHost 1.1, WebExtensions 0.3 | 16.4 | — |
| plain | switch-to-gecko | — | — | **22.0** (main 13.2, IPC I/O Parent 4.4, TaskCon~ller # 4.4) | Isolated Web Co 4.4 | — | 211.0 |
| profile | switch-to-engine | — | — | **36.3** (DOM Worker 16.5, main 9.9, SamplerThread 9.9) | Web Content 99.2, WPEWebProcess 56.2, WPENetworkProce 9.9, AxioWebKitHost 6.6 | — | 275.3 |
| profile | idle | — | — | **21.7** (main 6.4, SamplerThread 6.4, DOM Worker 5.9, Timer 1.5, glean.dispatche 0.5) | Web Content 4.9, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 58.2 | 21.3 | **43.3** (main 13.1, DOM Worker 9.5, SamplerThread 8.9, Renderer 2.6, Timer 1.6) | WPEWebProcess 52.0, Web Content 6.9, AxioWebKitHost 6.3, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **33.5** (DOM Worker 10.3, SamplerThread 7.3, main 5.0, Renderer 3.0, Backgro~Pool # 1.7) | WPEWebProcess 52.2, Web Content 6.9, AxioWebKitHost 6.0, WebExtensions 1.3 | — | — |
| profile | scroll | 57.5 | 34.9 | **64.3** (main 25.9, DOM Worker 13.4, SamplerThread 9.0, TaskCon~ller # 3.5, Backgro~Pool # 3.0) | WPEWebProcess 57.3, AxioWebKitHost 8.5, Web Content 6.0, WebExtensions 1.5 | — | — |
| profile | key | — | — | **37.4** (main 14.0, DOM Worker 8.0, SamplerThread 8.0, Timer 1.4, Renderer 1.4) | Web Content 6.9, WPEWebProcess 6.7, WebExtensions 1.7, Socket Process 1.4 | 18.0 | — |
| profile | switch-to-gecko | — | — | **33.7** (main 16.9, Renderer 4.2, BgIOThr~Pool # 4.2, DOM Worker 4.2, SamplerThread 4.2) | Isolated Web Co 4.2 | — | 215.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 6.3 | 0.0 | 0 | 0.0 | — | — | 98.3 | 0.0 | — | 1.63 | 0.61 | — | — | — | — | — | 0.004 |
| profile | raf | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.12 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.14 | 0.10 | — | — | — | — | — | 0.007 |
| profile | scroll | 55.4 | 0.0 | 0 | 0.0 | — | — | 12.7 | 0.0 | — | 0.33 | 0.13 | — | — | — | — | — | 0.008 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.4 | 0.0 | — | 0.12 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.638 | 1.109 | 0.0044 | 0.0076 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.045 | 0.109 | 0.0026 | 0.0063 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.053 | 0.125 | 0.0031 | 0.0073 |
| plain | scroll | memfd | native | 109 | 109 | 0.200 | 0.283 | 0.0108 | 0.0154 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.097 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.638 | 1.109 | 0.0044 | 0.0076 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.045 | 0.109 | 0.0026 | 0.0063 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.053 | 0.125 | 0.0031 | 0.0073 |
| plain | scroll | memfd | native | 109 | 109 | 0.200 | 0.283 | 0.0108 | 0.0154 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.097 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.786 | 1.554 | 0.0049 | 0.0098 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.040 | 0.106 | 0.0023 | 0.0062 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.057 | 0.134 | 0.0033 | 0.0078 |
| profile | scroll | memfd | native | 112 | 112 | 0.222 | 0.307 | 0.0123 | 0.0170 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.119 | 0.0000 | 0.0007 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 14.7 | 0.0 | — | 0.12 | 0.43 | — | — | 4.4 | 15.9 | 21.4 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 23.7; first stdout read resolved 26.6; first frame applied (native receiver) 284.8; write frame_ack 285.8; write visibility 292.0; write focus 293.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.8; first stdout read resolved 27.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 36, DOM Worker 28, Renderer 9, BgPool 4, IPC I/O 2, Compositor 2, WRRenderBackend 2, SwComposite 2, WRSceneBuilder 1, WRWorker 1, Socket 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 36 ms (11.5% of span): JavaScript 14, Idle 7, GC / CC 4, Layout 4, DOM 3, Other 2
  - JS leaf 0 / native under JS 24 / native 12; buckets: ipc 36, gc_cc 19, array_buffer_copy 13, paint_layout 9, harness_diagnostics 9, poll_wait 7, webrender_render 2, engine_stream_read 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 4; `js::jit::DoToBoolFallback(JSContext*, js::jit::BaselineFrame` 3; `CanAttachNativeGetProp(JSContext*, JSObject*, JS::PropertyKe` 2; `[unknown]` 1; `js::jit::GetPropIRGenerator::GetPropIRGenerator(JSContext*, ` 1
  - WebRender/compositor threads: Renderer 9 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `hypotf@@GLIBC_2.35 [libm.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 28 ms: buckets subprocess_pipe_io 28, worker_messaging 28, ipc 28, js_ctypes 27, poll_wait 27; top self: `__syscall_cancel_arch [libc.so.6]` 27; `mozilla::GlobalTeardownObserver::CheckCurrentGloba` 1; `mozilla::dom::WorkerPrivate::IsSharedMemoryAllowed` 0
- **tab:7881** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 47 ms (20.5% of span): Other 37, JavaScript 4, Profiler 3, DOM 3, Idle 0, GC / CC 0
  - JS leaf 1 / native under JS 4 / native 42; buckets: ipc 36, array_buffer_copy 15, gc_cc 12, subprocess_pipe_io 4, poll_wait 0
  - top self: `[]` 5; `[libexpat.so.1]` 4; `__strlen_evex [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0)
- **tab:7875** CPU ms by thread group: main 45, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (27.0% of span): Other 34, Profiler 5, DOM 3, JavaScript 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 43; buckets: ipc 34, array_buffer_copy 15, gc_cc 9, subprocess_pipe_io 4, poll_wait 1
  - top self: `__lll_lock_wake [libc.so.6]` 4; `__strlen_evex [libc.so.6]` 3; `[]` 3; `[libexpat.so.1]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7735** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 128, DOM Worker 71, other 14, Compositor 2, Socket 1, IPC I/O 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0, BgPool 0
  - main thread 128 ms (6.2% of span): Idle 106, JavaScript 13, Other 5, DOM 3, Profiler 1, Layout 0
  - JS leaf 1 / native under JS 15 / native 112; buckets: ipc 127, poll_wait 107, harness_diagnostics 15, array_buffer_copy 8, gc_cc 3, memcpy_memset 1, engine_stream_read 1, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 107; `[unknown]` 2; `[axiosozo-dev]` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 1 ms (top self: `mozilla::layers::CompositorBridgeParent::GetAsyncI` 0, `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 71 ms: buckets subprocess_pipe_io 71, worker_messaging 71, ipc 71, js_ctypes 71, poll_wait 71; top self: `__syscall_cancel_arch [libc.so.6]` 71; `[unknown]` 0
- **tab:7384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7735** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7875** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 375, DOM Worker 219, Renderer 68, SwComposite 35, WRRenderBackend 34, Compositor 33, BgPool 31, other 25, ImageBridge 14, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 375 ms (12.3% of span): Idle 259, JavaScript 55, Other 37, DOM 16, GC / CC 5, Profiler 3
  - JS leaf 6 / native under JS 62 / native 308; buckets: ipc 373, poll_wait 280, gc_cc 51, engine_stream_read 34, worker_messaging 34, harness_diagnostics 25, array_buffer_copy 17, subprocess_pipe_io 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 281; `[unknown]` 14; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 189 ms, GCSlice 4× 4 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 68 ms (top self: `__syscall_cancel_arch [libc.so.6]` 58, `__memmove_evex_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 3); SwComposite 35 ms (top self: `syscall [libc.so.6]` 33, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `webrender::compositor::sw_compositor::SwCompositeT` 0); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 1, `webrender::renderer::gpu_buffer::finish_row [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 31 ms (top self: `__syscall_cancel_arch [libc.so.6]` 28, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0); BgIOThreadPool #4 1 ms (top self: `__lll_lock_wake [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 219 ms: buckets subprocess_pipe_io 219, worker_messaging 218, ipc 218, js_ctypes 200, poll_wait 196, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 197; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 2; `[unknown]` 1; `[libxul.so]` 1
- **tab:7738** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7357** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 216, main 148, Renderer 72, BgPool 39, SwComposite 36, WRRenderBackend 35, Compositor 32, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 148 ms (4.9% of span): Idle 97, JavaScript 26, Other 18, DOM 5, Profiler 2
  - JS leaf 4 / native under JS 27 / native 117; buckets: ipc 147, poll_wait 102, gc_cc 34, engine_stream_read 24, worker_messaging 24, subprocess_pipe_io 8, array_buffer_copy 7, native_receiver 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[unknown]` 6; `__lll_lock_wake [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 1; `bool PropertyEnumerator::enumerateNativeProperties<false>(JS` 1
  - WebRender/compositor threads: Renderer 73 ms (top self: `__syscall_cancel_arch [libc.so.6]` 60, `__memmove_evex_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 3); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 39 ms (top self: `__syscall_cancel_arch [libc.so.6]` 37, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 216 ms: buckets subprocess_pipe_io 216, worker_messaging 215, ipc 215, js_ctypes 192, poll_wait 188, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 190; `[unknown]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 2; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:7735** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): GC / CC 2, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, gc_cc 2, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `nsIGlobalObject::UnlinkObjectsInGlobal() [libxul.so]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7738** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 496, DOM Worker 221, BgPool 61, Renderer 43, WRRenderBackend 22, SwComposite 21, Compositor 20, other 16, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 496 ms (24.6% of span): Idle 246, JavaScript 84, GC / CC 70, Other 52, DOM 25, Graphics 8
  - JS leaf 10 / native under JS 93 / native 393; buckets: ipc 493, poll_wait 289, gc_cc 144, engine_stream_read 49, worker_messaging 37, harness_diagnostics 34, paint_layout 29, subprocess_pipe_io 26
  - top self: `__syscall_cancel_arch [libc.so.6]` 263; `[unknown]` 16; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 8; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 64 ms, GCSlice 14× 56 ms, CCSlice 4× 12 ms, GCMinor 2× 4 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 43 ms (top self: `__syscall_cancel_arch [libc.so.6]` 35, `__memmove_evex_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 22 ms (top self: `syscall [libc.so.6]` 20, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); SwComposite 21 ms (top self: `syscall [libc.so.6]` 21, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 60 ms (top self: `__syscall_cancel_arch [libc.so.6]` 50, `__memmove_evex_unaligned_erms [libc.so.6]` 10, `mozilla::layers::ImageContainer::CreateSharedRGBIm` 0); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #4 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `sendfile64 [libc.so.6]` 0)
  - busiest DOM Worker 215 ms: buckets subprocess_pipe_io 215, worker_messaging 215, ipc 215, js_ctypes 187, poll_wait 178, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 179; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 2; `[unknown]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
- **tab:7335** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7384** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7357** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 470, DOM Worker 186, Renderer 54, other 27, SwComposite 26, WRRenderBackend 16, Compositor 15, WRWorker 10, WRSceneBuilder 9, BgPool 3, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 470 ms (12.9% of span): Idle 213, JavaScript 75, Other 37, Layout 36, GC / CC 32, Graphics 32
  - JS leaf 10 / native under JS 127 / native 333; buckets: ipc 468, poll_wait 257, gc_cc 115, paint_layout 77, engine_stream_read 63, worker_messaging 55, harness_diagnostics 32, subprocess_pipe_io 19
  - top self: `__syscall_cancel_arch [libc.so.6]` 222; `[axiosozo-dev]` 13; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 887 ms, GCSlice 8× 26 ms, CCSlice 2× 7 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 54 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 12, `__memmove_evex_unaligned_erms [libc.so.6]` 3); SwComposite 27 ms (top self: `syscall [libc.so.6]` 20, `__memmove_evex_unaligned_erms [libc.so.6]` 6, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 0, `mozilla::layers::SharedRGBImage::SharedRGBImage(mo` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 186 ms: buckets subprocess_pipe_io 186, worker_messaging 186, ipc 186, js_ctypes 177, poll_wait 176, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 176; `__lll_lock_wake [libc.so.6]` 3; `[unknown]` 1; `[axiosozo-dev]` 1; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 1
- **tab:7278** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 1, DOM 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mojo::core::ports::Node::SendUserMessage(mojo::core::ports::` 0; `mozilla::dom::StructuredCloneHolder::~StructuredCloneHolder(` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::H` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 0; `js::ObjectWrapperMap::put(JSObject*, JSObject*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 69, Renderer 13, DOM Worker 11, BgPool 5, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 69 ms (24.6% of span): JavaScript 35, Layout 11, Other 7, DOM 7, Graphics 4, Idle 3
  - JS leaf 3 / native under JS 43 / native 23; buckets: ipc 68, array_buffer_copy 23, paint_layout 16, harness_diagnostics 12, gc_cc 8, engine_stream_read 5, worker_messaging 4, poll_wait 3
  - top self: `[unknown]` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `__syscall_cancel_arch [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2; `js::PromiseObject::allocationSite() [libxul.so]` 2
  - WebRender/compositor threads: Renderer 13 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__syscall_cancel_arch [libc.so.6]` 2, `__exp2f_fma [libm.so.6]` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `mozilla::layers::HitTestingTreeNode::SetHitTestDat` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 5 ms (top self: `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 10, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 1; `[unknown]` 0
- **tab:7735** CPU ms by thread group: main 28, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (10.2% of span): JavaScript 12, Other 6, Idle 4, Layout 2, Profiler 1, GC / CC 1
  - JS leaf 0 / native under JS 11 / native 17; buckets: ipc 26, gc_cc 9, subprocess_pipe_io 5, poll_wait 4, paint_layout 3, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `JSScript::lookupScope(unsigned char const*) const [libxul.so` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(` 1; `js::SavedStacks::getOrCreateSavedFrame(JSContext*, JS::Handl` 1; `nsPIDOMWindowInner::GetWindowContext() const [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7278** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.4% of span): Idle 3, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::DoCallFallback(JSContext*, js::jit::BaselineFrame*,` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7875** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

