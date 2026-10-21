# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **51.8** (Renderer 23.6, main 18.8, Compositor 4.7, DOM Worker 4.7) | WPEWebProcess 56.5, WPENetworkProce 9.4, AxioWebKitHost 4.7 | — | 187.8 |
| plain | idle | — | — | **5.9** (main 3.9, DOM Worker 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 2.9 | — | — |
| plain | raf | 58.0 | 21.3 | **28.6** (main 8.2, Renderer 5.9, SwComposite 4.6, Backgro~Pool # 3.0, DOM Worker 2.3) | WPEWebProcess 131.5, AxioWebKitHost 16.4, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **25.7** (Renderer 6.3, main 4.7, Backgro~Pool # 4.0, SwComposite 4.0, DOM Worker 2.7) | WPEWebProcess 135.3, AxioWebKitHost 18.3 | — | — |
| plain | scroll | 53.5 | 36.8 | **48.8** (main 17.7, Backgro~Pool # 9.8, DOM Worker 6.9, Renderer 4.9, SwComposite 2.5) | WPEWebProcess 145.9, AxioWebKitHost 22.6 | — | — |
| plain | key | — | — | **16.4** (main 8.2, Renderer 2.5, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 15.7, AxioWebKitHost 2.8, WebExtensions 0.3 | 25.0 | — |
| plain | switch-to-gecko | — | — | **44.3** (main 22.2, TaskCon~ller # 8.9, BgIOThr~Pool # 4.4, Renderer 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 211.0 |
| trace | switch-to-engine | — | — | **92.6** (Renderer 68.2, main 9.7, Socket Thread 4.9, WRRende~ckend# 4.9, Compositor 4.9) | WPEWebProcess 77.9, WPENetworkProce 14.6, AxioWebKitHost 9.7 | — | 192.2 |
| trace | idle | — | — | **36.6** (DOM Worker 12.2, main 11.7, IndexedDB IO # 4.9, IPDL Background 2.4, TaskCon~ller # 2.4) | Web Content 2.9 | — | — |
| trace | raf | 57.9 | 23.7 | **32.9** (main 10.2, Renderer 6.6, SwComposite 4.3, Backgro~Pool # 3.3, DOM Worker 2.6) | WPEWebProcess 137.7, AxioWebKitHost 16.7, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **23.6** (Renderer 6.0, main 4.3, SwComposite 4.3, Backgro~Pool # 3.0, DOM Worker 2.7) | WPEWebProcess 134.7, AxioWebKitHost 17.9 | — | — |
| trace | scroll | 53.6 | 33.0 | **51.4** (main 19.7, Backgro~Pool # 9.9, DOM Worker 6.9, Renderer 5.4, SwComposite 3.5) | WPEWebProcess 146.0, AxioWebKitHost 23.2 | — | — |
| trace | key | — | — | **16.6** (main 8.2, Renderer 2.5, SwComposite 1.9, DOM Worker 1.1, Timer 0.5) | WPEWebProcess 15.8, AxioWebKitHost 2.5, WebExtensions 0.3 | 25.9 | — |
| trace | switch-to-gecko | — | — | **52.8** (main 17.6, Renderer 8.8, Socket Thread 4.4, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4) |  | — | 213.9 |
| profile | switch-to-engine | — | — | **49.4** (main 15.2, Renderer 7.6, DOM Worker 7.6, SamplerThread 7.6, Backgro~Pool # 3.8) | WPEWebProcess 75.9, Web Content 72.1, AxioWebKitHost 7.6, WPENetworkProce 7.6 | — | 240.5 |
| profile | idle | — | — | **29.0** (main 11.3, SamplerThread 6.4, DOM Worker 5.9, TaskCon~ller # 3.4, Timer 1.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 57.9 | 21.7 | **48.8** (main 12.1, DOM Worker 8.5, Renderer 6.9, SamplerThread 6.5, SwComposite 4.3) | WPEWebProcess 137.1, AxioWebKitHost 18.6, Web Content 5.6, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **44.2** (DOM Worker 9.0, main 7.6, Renderer 6.7, SamplerThread 6.3, Backgro~Pool # 4.3) | WPEWebProcess 146.6, AxioWebKitHost 20.3, Web Content 6.0, WebExtensions 1.3 | — | — |
| profile | scroll | 53.2 | 33.9 | **73.7** (main 24.4, DOM Worker 13.2, Backgro~Pool # 10.7, SamplerThread 6.8, Renderer 6.3) | WPEWebProcess 152.6, AxioWebKitHost 24.4, Web Content 3.9, WebExtensions 1.5 | — | — |
| profile | key | — | — | **35.3** (main 13.1, DOM Worker 7.4, SamplerThread 6.6, Renderer 2.5, SwComposite 1.9) | WPEWebProcess 15.9, Web Content 5.8, AxioWebKitHost 2.8, WebExtensions 1.7 | 27.2 | — |
| profile | switch-to-gecko | — | — | **54.8** (main 16.9, Renderer 12.7, DOM Worker 8.4, TaskCon~ller # 4.2, WRRende~ckend# 4.2) | Isolated Web Co 4.2 | — | 218.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 9.0 | 0.0 | 0 | 0.0 | — | — | 38.1 | 0.0 | — | 3.27 | 0.61 | — | — | — | — | — | 0.005 |
| trace | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.24 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 52.6 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 0.99 | 0.10 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.07 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.3 | 0.0 | 0 | 0.0 | — | — | 47.6 | 0.0 | — | 3.66 | 0.63 | — | — | — | — | — | 0.005 |
| profile | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.30 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.37 | 0.15 | — | — | — | — | — | 0.011 |
| profile | scroll | 52.4 | 0.0 | 0 | 0.0 | — | — | 13.1 | 0.0 | — | 1.20 | 0.14 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 13.3 | 0.0 | — | 0.15 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.612 | 4.371 | 0.0233 | 0.0390 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.165 | 0.341 | 0.0096 | 0.0198 |
| plain | raf-nosampler | memfd | native | 175 | 176 | 0.232 | 0.425 | 0.0134 | 0.0247 |
| plain | scroll | memfd | native | 107 | 107 | 0.811 | 0.985 | 0.0425 | 0.0516 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 0.302 | 0.0000 | 0.0016 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 1 | 2.825 | 4.807 | 0.0254 | 0.0216 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 177 | 177 | 0.172 | 0.348 | 0.0100 | 0.0202 |
| trace | raf-nosampler | memfd | native | 176 | 176 | 0.177 | 0.327 | 0.0103 | 0.0190 |
| trace | scroll | memfd | native | 107 | 107 | 0.871 | 1.042 | 0.0458 | 0.0548 |
| trace | key | memfd | native | 20 | 20 | 0.004 | 0.265 | 0.0000 | 0.0014 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.974 | 5.372 | 0.0217 | 0.0393 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.195 | 0.399 | 0.0113 | 0.0231 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.255 | 0.486 | 0.0148 | 0.0283 |
| profile | scroll | memfd | native | 107 | 107 | 1.013 | 1.249 | 0.0526 | 0.0648 |
| profile | key | memfd | native | 20 | 20 | 0.005 | 0.314 | 0.0000 | 0.0017 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 22.7 | 0.0 | — | 0.07 | 0.25 | — | — | 12.1 | 23.5 | 35.5 |
| profile | 0.6 | 22.8 | 0.0 | — | 0.15 | 0.42 | — | — | 12.0 | 24.3 | 34.9 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 22.0; first stdout read resolved 25.0; first frame applied (native receiver) 205.4; write frame_ack 206.4; write visibility 209.6; write focus 209.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 13.4; first stdout read resolved 17.8

Switch timeline (profile, switch-to-engine, ms after the window start): write create 15.1; first stdout read resolved 17.7; first frame applied (native receiver) 241.9; write frame_ack 243.0; write visibility 251.5; write focus 251.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 19.9; first stdout read resolved 25.8

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 35, Renderer 25, DOM Worker 16, BgPool 14, SwComposite 4, Compositor 2, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 2, Socket 0, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 35 ms (13.0% of span): JavaScript 15, Idle 7, DOM 5, Layout 4, Graphics 3, Other 1
  - JS leaf 1 / native under JS 22 / native 11; buckets: ipc 35, gc_cc 19, array_buffer_copy 9, harness_diagnostics 7, poll_wait 7, paint_layout 6, engine_stream_read 6, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `mozilla::dom::GetOrCreateDOMReflectorHelper<mozilla::dom::No` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `js::jit::CacheIRStubKey::match(js::jit::CacheIRStubKey const` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 2; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 1
  - WebRender/compositor threads: Renderer 25 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `__syscall_cancel_arch [libc.so.6]` 6, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5); SwComposite 4 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 14 ms (top self: `ARGBSetRow_X86 [libxul.so]` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, js_ctypes 16, worker_messaging 16, ipc 16, poll_wait 16; top self: `__syscall_cancel_arch [libc.so.6]` 16
- **tab:9492** CPU ms by thread group: main 43, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (17.0% of span): Other 35, JavaScript 4, DOM 2, Profiler 1, Idle 0
  - JS leaf 0 / native under JS 4 / native 39; buckets: ipc 32, array_buffer_copy 14, gc_cc 13, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 2
  - top self: `[]` 6; `__read_nocancel [libc.so.6]` 3; `[libexpat.so.1]` 2; `mmap64 [libc.so.6]` 2; `__strcmp_evex [libc.so.6]` 1; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9497** CPU ms by thread group: main 40, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (26.0% of span): Other 31, JavaScript 4, DOM 3, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 37; buckets: ipc 29, array_buffer_copy 13, gc_cc 10, memcpy_memset 5, subprocess_pipe_io 5, poll_wait 2, image_container 1
  - top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `__strlen_evex [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `js::frontend::ParserAtomsTable::internLatin1(js::FrontendCon` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9348** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `<std::sys::sync::once::futex::Once>::call [libxul.so]` 0; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 213, DOM Worker 74, other 14, BgPool 1, Socket 1, IPC I/O 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 213 ms (10.4% of span): Idle 114, GC / CC 65, JavaScript 18, Other 9, DOM 4, Profiler 3
  - JS leaf 2 / native under JS 20 / native 191; buckets: ipc 211, poll_wait 119, gc_cc 75, harness_diagnostics 19, array_buffer_copy 3, engine_stream_read 3, subprocess_pipe_io 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 118; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 15; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `mprotect [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3
  - GC/CC markers: GCMajor 2× 1089 ms, GCSlice 15× 54 ms, CCSlice 5× 13 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 74 ms: buckets subprocess_pipe_io 74, js_ctypes 74, worker_messaging 74, ipc 74, poll_wait 74; top self: `__syscall_cancel_arch [libc.so.6]` 74
- **tab:9348** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsRefreshDriver::Tick(mozilla::layers::BaseTransactionId<moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9492** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 354, DOM Worker 201, Renderer 187, SwComposite 131, BgPool 107, WRRenderBackend 42, Compositor 32, other 24, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 354 ms (11.5% of span): Idle 245, JavaScript 64, Other 22, DOM 16, Profiler 6
  - JS leaf 6 / native under JS 65 / native 283; buckets: ipc 353, poll_wait 256, gc_cc 51, engine_stream_read 35, harness_diagnostics 27, worker_messaging 22, native_receiver 13, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 252; `[unknown]` 9; `IID2NativeInterfaceMap::Find(nsID const&) const [libxul.so]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 3; `mozilla::dom::Document::GetUnretargetedFocusedContent(mozill` 2
  - WebRender/compositor threads: Renderer 187 ms (top self: `__syscall_cancel_arch [libc.so.6]` 100, `__memmove_avx512_unaligned_erms [libc.so.6]` 49, `syscall [libc.so.6]` 18); SwComposite 131 ms (top self: `syscall [libc.so.6]` 105, `__memmove_avx512_unaligned_erms [libc.so.6]` 25, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 107 ms (top self: `__syscall_cancel_arch [libc.so.6]` 76, `__memmove_avx512_unaligned_erms [libc.so.6]` 29, `profiler_feature_active(unsigned int) [libxul.so]` 1); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `[axiosozo-dev]` 0, `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 201 ms: buckets subprocess_pipe_io 201, worker_messaging 201, ipc 201, js_ctypes 187, poll_wait 183, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 183; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `nsTSubstring<char16_t>::Assign(char16_t const*, un` 1; `js::Atomize(JSContext*, char const*, unsigned long` 1
- **tab:9348** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0; `mozilla::MainThreadIdlePeriod::GetIdlePeriodHint(mozilla::Ti` 0
  - GC/CC markers: GCMajor 1× 34 ms, CCSlice 1× 2 ms, GCSlice 4× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 225, DOM Worker 209, Renderer 194, BgPool 125, SwComposite 123, WRRenderBackend 44, Compositor 33, ImageBridge 13, WRSceneBuilder 6, other 1, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 225 ms (7.4% of span): Idle 114, GC / CC 41, JavaScript 40, Other 18, DOM 11, Profiler 1
  - JS leaf 7 / native under JS 40 / native 178; buckets: ipc 224, poll_wait 126, gc_cc 96, engine_stream_read 38, worker_messaging 28, subprocess_pipe_io 10, array_buffer_copy 9, native_receiver 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 127; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 9; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3
  - GC/CC markers: GCMajor 1× 89 ms, GCSlice 15× 51 ms, CCSlice 1× 9 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 194 ms (top self: `__syscall_cancel_arch [libc.so.6]` 108, `__memmove_avx512_unaligned_erms [libc.so.6]` 54, `syscall [libc.so.6]` 21); SwComposite 123 ms (top self: `syscall [libc.so.6]` 98, `__memmove_avx512_unaligned_erms [libc.so.6]` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 8); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 6, `__lll_lock_wait [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 125 ms (top self: `__syscall_cancel_arch [libc.so.6]` 86, `__memmove_avx512_unaligned_erms [libc.so.6]` 35, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 209 ms: buckets subprocess_pipe_io 209, worker_messaging 209, ipc 209, js_ctypes 190, poll_wait 186, gc_cc 11; top self: `__syscall_cancel_arch [libc.so.6]` 187; `[axiosozo-dev]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 3; `mozilla::dom::WorkerParentThreadRunnable::WorkerPa` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1
- **tab:8945** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 464, DOM Worker 236, BgPool 219, Renderer 117, SwComposite 79, WRRenderBackend 30, Compositor 20, other 15, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 464 ms (22.5% of span): Idle 266, JavaScript 76, Other 53, DOM 26, GC / CC 19, Graphics 9
  - JS leaf 11 / native under JS 90 / native 363; buckets: ipc 461, poll_wait 323, gc_cc 90, engine_stream_read 47, worker_messaging 41, harness_diagnostics 38, paint_layout 34, subprocess_pipe_io 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 292; `[unknown]` 13; `[axiosozo-dev]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 1137 ms, GCSlice 8× 46 ms, GCMinor 2× 5 ms
  - WebRender/compositor threads: Renderer 117 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx512_unaligned_erms [libc.so.6]` 24, `syscall [libc.so.6]` 15); SwComposite 79 ms (top self: `syscall [libc.so.6]` 74, `__memmove_avx512_unaligned_erms [libc.so.6]` 5); WRRenderBackend#0 30 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 219 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 107, `__syscall_cancel_arch [libc.so.6]` 103, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 236 ms: buckets subprocess_pipe_io 236, worker_messaging 235, ipc 235, js_ctypes 191, poll_wait 185, gc_cc 15; top self: `__syscall_cancel_arch [libc.so.6]` 188; `__memset_avx512_unaligned_erms [libc.so.6]` 7; `__lll_lock_wake [libc.so.6]` 6; `getcontext [libc.so.6]` 3; `[axiosozo-dev]` 3
- **tab:8986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9354** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8945** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 442, DOM Worker 179, Renderer 90, SwComposite 72, other 25, WRRenderBackend 15, Compositor 14, WRSceneBuilder 9, WRWorker 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 442 ms (12.1% of span): Idle 216, JavaScript 87, Layout 35, Other 32, DOM 31, Graphics 24
  - JS leaf 14 / native under JS 128 / native 301; buckets: ipc 440, poll_wait 245, gc_cc 102, worker_messaging 74, paint_layout 70, engine_stream_read 64, subprocess_pipe_io 25, array_buffer_copy 24
  - top self: `__syscall_cancel_arch [libc.so.6]` 225; `[unknown]` 15; `[axiosozo-dev]` 8; `bool js::JSONPerHandlerParser<unsigned char, js::JSONFullPar` 7; `__lll_lock_wait [libc.so.6]` 5; `mozilla::dom::AbstractRange::Init(nsINode*) [libxul.so]` 4
  - GC/CC markers: GCSlice 3× 10 ms, GCMinor 2× 2 ms
  - WebRender/compositor threads: Renderer 90 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `syscall [libc.so.6]` 9); SwComposite 72 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 38, `syscall [libc.so.6]` 33, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 0, `mozilla::detail::RunnableFunction<mozilla::IOUtils` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 179 ms: buckets subprocess_pipe_io 179, worker_messaging 179, ipc 179, js_ctypes 167, poll_wait 163, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 164; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `profiler_capture_backtrace() [libxul.so]` 1; `mozilla::EventDispatcher::Dispatch(mozilla::dom::E` 1
- **tab:8896** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `nsPIDOMWindowInner::IsCurrentInnerWindow() const [libxul.so]` 0; `JSFunction::needsCallObject() const [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[` 0; `js::NewPlainObject(JSContext*, js::NewObjectOptions const&) ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8945** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::RunIdleMemoryCleanup(mozilla::TimeStamp, unsigned i` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 72, Renderer 29, DOM Worker 10, BgPool 4, Compositor 4, SwComposite 3, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 73 ms (26.5% of span): JavaScript 29, GC / CC 12, Layout 9, DOM 6, Idle 5, Other 5
  - JS leaf 0 / native under JS 44 / native 29; buckets: ipc 70, gc_cc 29, array_buffer_copy 14, harness_diagnostics 12, paint_layout 11, worker_messaging 8, engine_stream_read 7, poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `js::jit::IRGenerator::emitCallAccessorGuards(js::NativeObjec` 4; `[unknown]` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::jit::IRGenerator::maybeCreateAllocSite() [libxul.so]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2
  - GC/CC markers: CCSlice 1× 5 ms, GCSlice 4× 5 ms
  - WebRender/compositor threads: Renderer 29 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__syscall_cancel_arch [libc.so.6]` 3); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::composite::CompositeState::push_surface` 1, `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.s` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `unlink [libc.so.6]` 1, `rmdir [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 8, poll_wait 8, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0; `OriginalPromiseThenBuiltin(JSContext*, JS::Handle<` 0
- **tab:9348** CPU ms by thread group: main 21, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (7.7% of span): Other 8, JavaScript 4, Idle 3, DOM 3, Layout 3
  - JS leaf 0 / native under JS 7 / native 14; buckets: ipc 20, gc_cc 5, poll_wait 5, subprocess_pipe_io 3, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseN` 1; `mozilla::RecursiveMutex::UnlockInternal() [libxul.so]` 1; `nsIContent::UnbindFromTree(nsINode*, BatchRemovalState const` 1; `style::properties::cascade::iter_declarations [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8896** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 3, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::ObjectFuse::tryOptimizeConstantProperty(JS::PropertyKey,` 0; `setActiveOnTab (moz-extension://9a310967-e580-48bf-b3e8-4eaf` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

