# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **43.4** (Renderer 16.3, main 14.5, DOM Worker 9.0, WRRende~ckend# 1.8, SwComposite 1.8) | WPEWebProcess 59.7, AxioWebKitHost 18.1, WPENetworkProce 10.9, Isolated Web Co 1.8 | — | 528.6 |
| plain | idle | — | — | **4.9** (main 3.4, glean.dispatche 0.5, Timer 0.5, TaskCon~ller # 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.1 | 25.6 | **65.3** (Renderer 20.5, SwComposite 16.9, main 10.7, Backgro~Pool # 8.4, DOM Worker 3.9) | WPEWebProcess 179.2, AxioWebKitHost 21.0 | — | — |
| plain | raf-nosampler | — | — | **75.3** (Renderer 21.6, SwComposite 18.3, main 9.0, Backgro~Pool # 8.3, Socket Thread 4.6) | WPEWebProcess 181.4, AxioWebKitHost 22.6, Web Content 0.3 | — | — |
| plain | scroll | 54.5 | 34.1 | **85.2** (Renderer 20.5, main 18.6, SwComposite 18.1, Backgro~Pool # 10.3, DOM Worker 9.3) | WPEWebProcess 188.8, AxioWebKitHost 23.0 | — | — |
| plain | key | — | — | **51.6** (main 15.0, DOM Worker 10.6, Indexed~ IO # 9.5, IPDL Background 3.8, Renderer 3.5) | WPEWebProcess 19.1, AxioWebKitHost 2.8, WebExtensions 0.3 | 26.1 | — |
| plain | switch-to-gecko | — | — | **162.3** (DOM Worker 58.2, main 45.7, TaskCon~ller # 20.8, Renderer 12.5, Indexed~ IO # 8.3) |  | — | 215.2 |
| profile | switch-to-engine | — | — | **31.1** (DOM Worker 13.1, main 8.2, SamplerThread 6.6, glean.dispatche 1.6, Renderer 1.6) | WPEWebProcess 57.4, Web Content 32.8, AxioWebKitHost 16.4, WPENetworkProce 9.8 | — | 586.2 |
| profile | idle | — | — | **24.2** (main 7.4, DOM Worker 7.4, SamplerThread 7.4, Timer 1.0, TaskCon~ller # 0.5) | Web Content 5.4, Socket Process 1.5, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | raf | 57.8 | 25.4 | **85.9** (Renderer 20.8, SwComposite 17.8, main 14.0, DOM Worker 9.1, Backgro~Pool # 9.1) | WPEWebProcess 179.0, AxioWebKitHost 22.3, Web Content 6.8, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **76.8** (Renderer 20.9, SwComposite 17.9, DOM Worker 9.3, Backgro~Pool # 8.9, SamplerThread 7.0) | WPEWebProcess 179.9, AxioWebKitHost 22.2, Web Content 6.3, Privileged Cont 1.6 | — | — |
| profile | scroll | 51.7 | 33.3 | **103.2** (main 24.3, Renderer 20.9, SwComposite 17.0, DOM Worker 14.1, Backgro~Pool # 10.7) | WPEWebProcess 181.9, AxioWebKitHost 23.8, Web Content 5.8, Isolated Web Co 1.5 | — | — |
| profile | key | — | — | **42.2** (main 13.5, DOM Worker 8.2, SamplerThread 8.2, Renderer 4.1, SwComposite 3.8) | WPEWebProcess 19.6, Web Content 7.7, AxioWebKitHost 3.1, WebExtensions 1.6 | 29.7 | — |
| profile | switch-to-gecko | — | — | **37.9** (main 12.7, Renderer 8.4, DOM Worker 8.4, WRRende~ckend# 4.2, SamplerThread 4.2) | Isolated Web Co 4.2 | — | 216.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.2 | 0.0 | 0 | 0.0 | — | — | 121.0 | 0.0 | — | 2.70 | 0.61 | — | — | — | — | — | 0.002 |
| profile | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.49 | 0.16 | — | — | — | — | — | 0.015 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.47 | 0.17 | — | — | — | — | — | 0.013 |
| profile | scroll | 49.8 | 0.0 | 0 | 0.0 | — | — | 8.6 | 0.0 | — | 1.60 | 0.16 | — | — | — | — | — | 0.019 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 17.2 | 0.0 | — | 0.16 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.845 | 3.401 | 0.0100 | 0.0120 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.268 | 1.153 | 0.0155 | 0.0669 |
| plain | raf-nosampler | memfd | native | 172 | 173 | 0.352 | 1.304 | 0.0200 | 0.0744 |
| plain | scroll | memfd | native | 108 | 108 | 0.979 | 1.268 | 0.0515 | 0.0667 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 1.213 | 0.0000 | 0.0066 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.231 | 2.889 | 0.0072 | 0.0093 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.350 | 1.503 | 0.0202 | 0.0867 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.342 | 1.357 | 0.0199 | 0.0789 |
| profile | scroll | memfd | native | 103 | 103 | 1.384 | 1.802 | 0.0689 | 0.0897 |
| profile | key | memfd | native | 20 | 20 | 0.005 | 1.330 | 0.0000 | 0.0073 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 26.7 | 0.1 | — | 0.16 | 0.49 | — | — | 156.9 | 28.0 | 187.9 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 22.1; spawn AxioWebKitHost resolved 41.1; write hello 46.4; first stdout read resolved 103.9; write create 107.2; first frame applied (native receiver) 589.2; write frame_ack 590.2; write visibility 598.6; write focus 598.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.4; first stdout read resolved 26.3

### Profile: webkit-2x-control / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 51, main 43, Renderer 15, BgPool 10, SwComposite 2, Compositor 2, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 2, Socket 1, ImageBridge 0, other 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 43 ms (6.9% of span): JavaScript 17, Idle 11, Layout 5, DOM 3, Other 3, Graphics 2
  - JS leaf 1 / native under JS 22 / native 19; buckets: ipc 38, gc_cc 14, harness_diagnostics 11, poll_wait 9, array_buffer_copy 9, paint_layout 8, engine_stream_read 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit` 2; `[libxul.so]` 2; `[linux-vdso.so.1]` 2; `JS::loader::ModuleLoaderBase::EvaluateModuleInContext(JSCont` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2
  - WebRender/compositor threads: Renderer 15 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 9 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 3, `__memset_evex_unaligned_erms [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `[axiosozo-dev]` 0, `mkdir [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 49 ms: buckets subprocess_pipe_io 49, worker_messaging 49, ipc 49, js_ctypes 34, poll_wait 32, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 32; `js::NativeObject::changeProperty(JSContext*, JS::H` 11; `void* js::gc::CellAllocator::AllocTenuredCellForNu` 2; `js::gc::TenuringTracer::promotePlainObject(js::Pla` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:10884** CPU ms by thread group: main 44, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 44 ms (9.3% of span): Other 35, JavaScript 5, DOM 2, Idle 1, Profiler 1
  - JS leaf 0 / native under JS 3 / native 41; buckets: ipc 32, array_buffer_copy 16, gc_cc 10, subprocess_pipe_io 6, poll_wait 3, memcpy_memset 2, canvas_2d 1, image_container 1
  - top self: `[]` 4; `[libexpat.so.1]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `uhash_geti_78 [libxul.so]` 2; `__strlen_evex [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10778** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 2, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<mozilla::WidgetMouseEvent>::t` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10881** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.2% of span): Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::GCRuntime::purgeRuntimeForMinorGC() [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / idle

- **parent** CPU ms by thread group: main 134, DOM Worker 77, other 15, Renderer 3, SwComposite 3, Compositor 2, IPC I/O 1, Socket 1, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 134 ms (6.5% of span): Idle 108, JavaScript 9, Other 9, DOM 5, Profiler 2, Graphics 1
  - JS leaf 1 / native under JS 12 / native 121; buckets: ipc 134, poll_wait 113, harness_diagnostics 12, array_buffer_copy 6, gc_cc 5, engine_stream_read 2, paint_layout 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 111; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[unknown]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1
  - WebRender/compositor threads: Renderer 3 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 3 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 75 ms: buckets subprocess_pipe_io 75, worker_messaging 75, ipc 75, js_ctypes 75, poll_wait 75, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 75; `JSFunction::create(JSContext*, js::gc::AllocKind, ` 0
- **tab:10566** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10884** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10781** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf

- **parent** CPU ms by thread group: Renderer 593, SwComposite 526, main 404, BgPool 255, DOM Worker 225, WRRenderBackend 64, Compositor 33, other 27, ImageBridge 14, WRSceneBuilder 6, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 404 ms (13.1% of span): Idle 281, JavaScript 58, Other 36, DOM 21, Profiler 5, GC / CC 2
  - JS leaf 4 / native under JS 71 / native 328; buckets: ipc 403, poll_wait 303, gc_cc 62, engine_stream_read 42, worker_messaging 26, harness_diagnostics 26, subprocess_pipe_io 15, array_buffer_copy 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 296; `[unknown]` 9; `__lll_lock_wake [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `g_mutex_lock [libglib-2.0.so.0]` 3
  - GC/CC markers: GCMinor 1× 5 ms
  - WebRender/compositor threads: Renderer 593 ms (top self: `__syscall_cancel_arch [libc.so.6]` 230, `int blendTextureNearestFast<false, glsl::sampler2D` 124, `void scale_blit<true>(Texture&, IntRect const&, Te` 93); SwComposite 526 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 242, `syscall [libc.so.6]` 219, `__memmove_evex_unaligned_erms [libc.so.6]` 65); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 12, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #5 255 ms (top self: `__syscall_cancel_arch [libc.so.6]` 136, `__memmove_evex_unaligned_erms [libc.so.6]` 110, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[libxul.so]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 225 ms: buckets subprocess_pipe_io 225, worker_messaging 223, ipc 223, js_ctypes 201, poll_wait 196, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 199; `[axiosozo-dev]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 2; `[unknown]` 2; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 1
- **tab:10524** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10546** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10566** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 583, SwComposite 497, BgPool 255, DOM Worker 224, main 191, WRRenderBackend 63, Compositor 33, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 191 ms (6.3% of span): Idle 131, JavaScript 31, Other 17, DOM 10, GC / CC 2, Profiler 1
  - JS leaf 2 / native under JS 37 / native 152; buckets: ipc 190, poll_wait 138, gc_cc 43, engine_stream_read 28, worker_messaging 21, subprocess_pipe_io 10, array_buffer_copy 8, native_receiver 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 6; `JSStructuredCloneWriter::writeString(unsigned int, JSString*` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 9 ms
  - WebRender/compositor threads: Renderer 583 ms (top self: `__syscall_cancel_arch [libc.so.6]` 218, `int blendTextureNearestFast<false, glsl::sampler2D` 143, `void scale_blit<true>(Texture&, IntRect const&, Te` 99); SwComposite 497 ms (top self: `syscall [libc.so.6]` 229, `void scale_blit<true>(Texture&, IntRect const&, Te` 202, `__memmove_evex_unaligned_erms [libc.so.6]` 64); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 11, `__memmove_evex_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #5 255 ms (top self: `__syscall_cancel_arch [libc.so.6]` 129, `__memmove_evex_unaligned_erms [libc.so.6]` 114, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 224 ms: buckets subprocess_pipe_io 224, worker_messaging 224, ipc 224, js_ctypes 197, poll_wait 192, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 194; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 4; `[unknown]` 4; `__memset_evex_unaligned_erms [libc.so.6]` 2
- **tab:10524** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10546** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::IToplevelProtocol::Lookup(long) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10781** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / scroll

- **parent** CPU ms by thread group: main 469, Renderer 391, SwComposite 340, DOM Worker 260, BgPool 195, WRRenderBackend 43, Compositor 21, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 469 ms (22.7% of span): Idle 274, JavaScript 80, Other 50, DOM 34, Graphics 13, Layout 8
  - JS leaf 11 / native under JS 104 / native 354; buckets: ipc 467, poll_wait 333, gc_cc 80, engine_stream_read 62, paint_layout 42, harness_diagnostics 39, worker_messaging 34, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 298; `[unknown]` 20; `__lll_lock_wake [libc.so.6]` 7; `__lll_lock_wait [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `webrtc::internal::(anonymous namespace)::WebRtcRecordableEnc` 5
  - GC/CC markers: GCMinor 1× 6 ms
  - WebRender/compositor threads: Renderer 391 ms (top self: `__syscall_cancel_arch [libc.so.6]` 153, `int blendTextureNearestFast<false, glsl::sampler2D` 84, `void scale_blit<true>(Texture&, IntRect const&, Te` 71); SwComposite 340 ms (top self: `syscall [libc.so.6]` 156, `void scale_blit<true>(Texture&, IntRect const&, Te` 147, `__memmove_evex_unaligned_erms [libc.so.6]` 35); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 9, `__lll_lock_wake [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #5 194 ms (top self: `__syscall_cancel_arch [libc.so.6]` 115, `__memmove_evex_unaligned_erms [libc.so.6]` 66, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `[axiosozo-dev]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 210, poll_wait 197, array_buffer_copy 21; top self: `__syscall_cancel_arch [libc.so.6]` 198; `__lll_lock_wake [libc.so.6]` 22; `[unknown]` 5; `[axiosozo-dev]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 3
- **tab:10566** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10546** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10524** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `CrashReporter::SetEventloopNestingLevel(unsigned int) [libxu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / key

- **parent** CPU ms by thread group: main 453, DOM Worker 205, Renderer 133, SwComposite 122, other 29, BgPool 26, WRRenderBackend 17, Compositor 16, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 453 ms (12.4% of span): Idle 231, JavaScript 85, Other 43, Layout 30, Graphics 26, DOM 22
  - JS leaf 12 / native under JS 131 / native 311; buckets: ipc 453, poll_wait 269, gc_cc 81, paint_layout 72, engine_stream_read 55, worker_messaging 54, harness_diagnostics 31, array_buffer_copy 18
  - top self: `__syscall_cancel_arch [libc.so.6]` 240; `[unknown]` 18; `[axiosozo-dev]` 6; `mprotect [libc.so.6]` 5; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame co` 4; `__memset_evex_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 5 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 133 ms (top self: `__syscall_cancel_arch [libc.so.6]` 39, `int blendTextureNearestFast<false, glsl::sampler2D` 31, `void scale_blit<true>(Texture&, IntRect const&, Te` 28); SwComposite 122 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 60, `syscall [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 23); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 14, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #5 25 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 16, `__syscall_cancel_arch [libc.so.6]` 8, `mozilla::TaskQueue::Runner::~Runner() [libxul.so]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 192 ms: buckets subprocess_pipe_io 192, worker_messaging 192, ipc 192, js_ctypes 180, poll_wait 179, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 179; `mozilla::detail::MutexImpl::lock() [axiosozo-dev]` 3; `mozilla::JSEventHandler::HandleEvent(mozilla::dom:` 1; `js::gc::BufferAllocator::allocSmall(unsigned long,` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:10474** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `PerformPromiseThenWithReaction(JSContext*, JS::Handle<js::Pr` 0; `[unknown]` 0; `mozilla::ipc::MessageChannel::RunMessage(mozilla::ipc::Actor` 0; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10566** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10524** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: main 67, Renderer 32, DOM Worker 11, BgPool 5, SwComposite 4, WRRenderBackend 3, Compositor 2, IPC I/O 2, WRSceneBuilder 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 67 ms (24.4% of span): DOM 37, JavaScript 19, Layout 5, Idle 3, Other 2, Graphics 1
  - JS leaf 2 / native under JS 55 / native 10; buckets: ipc 67, gc_cc 43, array_buffer_copy 11, harness_diagnostics 9, engine_stream_read 8, worker_messaging 8, paint_layout 7, poll_wait 3
  - top self: `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifI` 32; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `AutoProfilerUntypedMarker::~AutoProfilerUntypedMarker() [lib` 2; `mprotect [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `__syscall_cancel_arch [libc.so.6]` 5, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 4); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 3, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 5 ms (top self: `fstatat64 [libc.so.6]` 2, `unlink [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #5 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, js_ctypes 11, poll_wait 10; top self: `__syscall_cancel_arch [libc.so.6]` 11; `__strlen_evex [libc.so.6]` 0
- **tab:10778** CPU ms by thread group: main 27, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 27 ms (9.9% of span): JavaScript 8, Other 7, Idle 5, Layout 3, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 10 / native 17; buckets: ipc 19, gc_cc 9, poll_wait 5, subprocess_pipe_io 4, paint_layout 2, memcpy_memset 1, harness_diagnostics 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `syscall [libc.so.6]` 2; `[]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `__lll_lock_wake [libc.so.6]` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10474** CPU ms by thread group: main 3, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 3, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10566** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

