# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **61.8** (main 22.5, Renderer 22.5, DOM Worker 11.2, Compositor 5.6) | WPEWebProcess 67.5, WPENetworkProce 11.2, AxioWebKitHost 5.6 | — | 158.3 |
| plain | idle | — | — | **6.4** (main 3.9, DOM Worker 1.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.0 | — | — |
| plain | raf | 57.9 | 20.8 | **19.7** (main 7.6, Renderer 2.3, DOM Worker 2.0, SwComposite 1.6, WRRende~ckend# 1.3) | WPEWebProcess 45.4, AxioWebKitHost 6.9, Privileged Cont 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.9** (main 4.3, Renderer 3.0, DOM Worker 2.3, Backgro~Pool # 1.3, SwComposite 1.3) | WPEWebProcess 45.3, AxioWebKitHost 7.7, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 57.3 | 29.5 | **33.4** (main 15.9, DOM Worker 5.5, Backgro~Pool # 3.5, TaskCon~ller # 2.0, Renderer 2.0) | WPEWebProcess 49.3, AxioWebKitHost 9.5 | — | — |
| plain | key | — | — | **14.0** (main 8.5, Renderer 1.1, Timer 0.8, TaskCon~ller # 0.8, SwComposite 0.8) | WPEWebProcess 6.4, AxioWebKitHost 1.1, WebExtensions 0.3, Web Content 0.3 | 18.9 | — |
| plain | switch-to-gecko | — | — | **44.2** (main 13.3, TaskCon~ller # 8.9, Socket Thread 4.4, BgIOThr~Pool # 4.4, Renderer 4.4) | Isolated Web Co 4.4 | — | 211.3 |
| trace | switch-to-engine | — | — | **35.8** (main 15.9, Renderer 15.9, glean.dispatche 4.0) | WPEWebProcess 51.8, WPENetworkProce 11.9, AxioWebKitHost 4.0 | — | 232.5 |
| trace | idle | — | — | **3.0** (main 2.5, IPC I/O Parent 0.5) | Web Content 3.0, forkserver 0.5 | — | — |
| trace | raf | 57.1 | 24.2 | **64.0** (DOM Worker 19.7, main 16.8, Indexed~ IO # 11.8, IPDL Background 4.9, Renderer 2.3) | WPEWebProcess 45.3, AxioWebKitHost 6.5 | — | — |
| trace | raf-nosampler | — | — | **29.5** (main 10.0, DOM Worker 4.7, Renderer 2.3, Indexed~ IO # 2.3, TaskCon~ller # 1.7) | WPEWebProcess 45.8, AxioWebKitHost 7.3 | — | — |
| trace | scroll | 57.4 | 32.9 | **39.0** (main 17.5, DOM Worker 7.5, Backgro~Pool # 4.0, TaskCon~ller # 2.5, Renderer 2.5) | WPEWebProcess 50.4, AxioWebKitHost 9.0, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **13.9** (main 8.0, DOM Worker 1.4, Renderer 1.1, Timer 0.8, SwComposite 0.8) | WPEWebProcess 6.1, AxioWebKitHost 0.8, WebExtensions 0.3 | 19.6 | — |
| trace | switch-to-gecko | — | — | **35.0** (main 13.1, TaskCon~ller # 8.7, IPDL Background 4.4, Renderer 4.4, Compositor 4.4) | Isolated Web Co 4.4 | — | 212.6 |
| profile | switch-to-engine | — | — | **42.1** (main 15.3, DOM Worker 11.5, SamplerThread 7.7, Renderer 3.8, Compositor 3.8) | Web Content 95.9, WPEWebProcess 61.4, WPENetworkProce 11.5, AxioWebKitHost 7.7 | — | 241.2 |
| profile | idle | — | — | **27.0** (main 10.8, SamplerThread 6.4, DOM Worker 5.9, TaskCon~ller # 2.9, Timer 1.0) | Web Content 5.4, WebExtensions 1.0, Privileged Cont 1.0, Isolated Web Co 1.0 | — | — |
| profile | raf | 58.0 | 20.9 | **39.4** (main 11.5, DOM Worker 8.9, SamplerThread 7.9, Renderer 2.6, SwComposite 1.6) | WPEWebProcess 44.3, AxioWebKitHost 6.2, Web Content 4.9, WebExtensions 1.0 | — | — |
| profile | raf-nosampler | — | — | **32.0** (DOM Worker 9.3, SamplerThread 6.7, main 5.0, Renderer 2.3, Backgro~Pool # 2.0) | WPEWebProcess 45.2, AxioWebKitHost 5.9, Web Content 5.7, WebExtensions 1.3 | — | — |
| profile | scroll | 58.0 | 29.5 | **52.3** (main 19.9, DOM Worker 12.4, SamplerThread 8.5, Backgro~Pool # 3.0, Renderer 2.5) | WPEWebProcess 50.8, AxioWebKitHost 8.0, Web Content 5.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **33.3** (main 12.9, DOM Worker 7.7, SamplerThread 6.9, Renderer 1.7, Timer 1.1) | Web Content 6.1, WPEWebProcess 5.6, WebExtensions 1.4, Socket Process 1.1 | 18.1 | — |
| profile | switch-to-gecko | — | — | **33.8** (main 12.7, DOM Worker 8.5, Renderer 4.2, WRScene~ilder# 4.2, SamplerThread 4.2) |  | — | 215.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 7.6 | 0.0 | 0 | 0.0 | — | — | 69.0 | 0.0 | — | 1.11 | 0.57 | — | — | — | — | — | 0.004 |
| trace | raf | 56.9 | 0.0 | 0 | 0.0 | — | — | 16.7 | 0.0 | — | 0.14 | 0.09 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.7 | 0.0 | — | 0.16 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 57.2 | 0.0 | 0 | 0.0 | — | — | 11.2 | 0.0 | — | 0.33 | 0.09 | — | — | — | — | — | 0.005 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.6 | 0.0 | — | 0.08 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.4 | 0.0 | 0 | 0.0 | — | — | 78.9 | 0.0 | — | 1.18 | 0.58 | — | — | — | — | — | 0.004 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.15 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.16 | 0.10 | — | — | — | — | — | 0.007 |
| profile | scroll | 57.0 | 0.0 | 0 | 0.0 | — | — | 12.6 | 0.0 | — | 0.33 | 0.11 | — | — | — | — | — | 0.007 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.14 | 0.12 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.836 | 1.399 | 0.0089 | 0.0148 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.063 | 0.118 | 0.0036 | 0.0068 |
| plain | raf-nosampler | memfd | native | 174 | 174 | 0.074 | 0.146 | 0.0043 | 0.0084 |
| plain | scroll | memfd | native | 114 | 114 | 0.243 | 0.317 | 0.0138 | 0.0179 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.104 | 0.0000 | 0.0006 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.934 | 1.415 | 0.0071 | 0.0108 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 175 | 175 | 0.059 | 0.117 | 0.0034 | 0.0067 |
| trace | raf-nosampler | memfd | native | 174 | 174 | 0.074 | 0.149 | 0.0042 | 0.0086 |
| trace | scroll | memfd | native | 115 | 115 | 0.242 | 0.339 | 0.0139 | 0.0194 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.100 | 0.0000 | 0.0005 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.909 | 1.466 | 0.0067 | 0.0109 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 177 | 177 | 0.063 | 0.133 | 0.0036 | 0.0077 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.076 | 0.155 | 0.0044 | 0.0090 |
| profile | scroll | memfd | native | 115 | 115 | 0.208 | 0.338 | 0.0118 | 0.0193 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.104 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 14.5 | 0.0 | — | 0.08 | 0.26 | — | — | 16.1 | 15.4 | 32.0 |
| profile | 0.6 | 15.4 | 0.0 | — | 0.14 | 0.40 | — | — | 17.7 | 16.6 | 33.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 16.5; first stdout read resolved 23.8; first frame applied (native receiver) 241.7; write frame_ack 242.7; write visibility 246.3; write focus 246.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 14.4; first stdout read resolved 19.9

Switch timeline (profile, switch-to-engine, ms after the window start): write create 13.7; first stdout read resolved 15.5; first frame applied (native receiver) 243.7; write frame_ack 244.7; write visibility 251.3; write focus 251.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 15.8; first stdout read resolved 23.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 33, DOM Worker 20, Renderer 11, BgPool 5, Compositor 2, WRRenderBackend 2, IPC I/O 2, SwComposite 2, WRSceneBuilder 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 33 ms (12.1% of span): JavaScript 16, Idle 6, Other 3, Layout 3, Profiler 2, DOM 2
  - JS leaf 1 / native under JS 19 / native 12; buckets: ipc 33, gc_cc 14, array_buffer_copy 9, harness_diagnostics 9, paint_layout 7, poll_wait 6, engine_stream_read 3, worker_messaging 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 3; `mozilla::DelayForChaosMode(mozilla::ChaosFeature, unsigned i` 3; `__lll_lock_wait [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[libstdc++.so.6]` 1
  - WebRender/compositor threads: Renderer 11 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 3, `ClearTexSubImage [libxul.so]` 3, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `webrender::batch::AlphaBatchList::set_params_and_g` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `ARGBSetRow_X86 [libxul.so]` 1, `__memset_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 18 ms: buckets subprocess_pipe_io 18, worker_messaging 18, ipc 18, js_ctypes 15, poll_wait 15; top self: `__syscall_cancel_arch [libc.so.6]` 15; `__lll_lock_wait [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `mozilla::Queue<mozilla::TimeStamp, 16ul>::Push(moz` 0
- **tab:7843** CPU ms by thread group: main 38, IPC I/O 0, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 38 ms (17.4% of span): Other 28, JavaScript 5, DOM 3, Idle 2, Profiler 1
  - JS leaf 1 / native under JS 4 / native 34; buckets: ipc 29, array_buffer_copy 11, gc_cc 11, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 2, image_container 1
  - top self: `__strcmp_evex [libc.so.6]` 3; `__strlen_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[]` 2; `getdents64 [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7849** CPU ms by thread group: main 34, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 34 ms (29.3% of span): Other 26, JavaScript 4, DOM 2, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 31; buckets: ipc 26, gc_cc 10, array_buffer_copy 8, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1
  - top self: `[]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `js::frontend::SourceCoords::lineToken(unsigned int) const [l` 2; `bool js::GetDecimalInteger<mozilla::Utf8Unit>(mozilla::Utf8U` 1; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, J` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `PLDHashTable::Search(void const*) const [libxul.so]` 0; `mozilla::EventDispatcher::CreateEvent(mozilla::dom::EventTar` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 206, DOM Worker 70, other 14, Socket 1, IPC I/O 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, BgPool 0, SwComposite 0
  - main thread 206 ms (10.0% of span): Idle 116, GC / CC 61, JavaScript 16, Other 7, DOM 5, Profiler 2
  - JS leaf 2 / native under JS 18 / native 185; buckets: ipc 204, poll_wait 120, gc_cc 69, harness_diagnostics 20, array_buffer_copy 5, engine_stream_read 3, subprocess_pipe_io 1, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 118; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `[unknown]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3
  - GC/CC markers: GCMajor 2× 834 ms, GCSlice 14× 52 ms, CCSlice 3× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 70 ms: buckets subprocess_pipe_io 70, worker_messaging 70, ipc 70, js_ctypes 70, poll_wait 70; top self: `__syscall_cancel_arch [libc.so.6]` 70; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 0
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsTimer::Release() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7244** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memcmp_evex_movbe [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 325, DOM Worker 199, Renderer 73, SwComposite 42, BgPool 39, WRRenderBackend 33, Compositor 29, other 23, ImageBridge 12, WRSceneBuilder 6, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 325 ms (10.6% of span): Idle 238, JavaScript 43, Other 26, DOM 14, Profiler 3, GC / CC 1
  - JS leaf 6 / native under JS 48 / native 270; buckets: ipc 324, poll_wait 252, gc_cc 40, engine_stream_read 25, worker_messaging 24, harness_diagnostics 22, subprocess_pipe_io 12, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 248; `[unknown]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 1; `[axiosozo-dev]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 73 ms (top self: `__syscall_cancel_arch [libc.so.6]` 62, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 3); SwComposite 42 ms (top self: `syscall [libc.so.6]` 40, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 30, `webrender::tile_cache::TileCacheInstance::update_p` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 39 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `MessageLoop::DoDelayedWork(base::TimeTicks*) [libx` 0, `non-virtual thunk to mozilla::layers::ImageBridgeC` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 199 ms: buckets subprocess_pipe_io 199, worker_messaging 199, ipc 199, js_ctypes 182, poll_wait 179, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 181; `[unknown]` 2; `OriginalPromiseThenBuiltin(JSContext*, JS::Handle<` 1; `[axiosozo-dev]` 1; `__lll_lock_wake [libc.so.6]` 1
- **tab:7698** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 4, gc_cc 3, poll_wait 2, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [li` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7704** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7319** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 194, main 145, Renderer 69, BgPool 46, SwComposite 39, WRRenderBackend 31, Compositor 29, ImageBridge 12, WRSceneBuilder 5, other 1, IPC I/O 0, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 145 ms (4.8% of span): Idle 86, JavaScript 31, Other 18, DOM 4, GC / CC 3, Profiler 2
  - JS leaf 1 / native under JS 32 / native 112; buckets: ipc 144, poll_wait 94, gc_cc 32, worker_messaging 24, engine_stream_read 22, subprocess_pipe_io 10, array_buffer_copy 5, native_receiver 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 94; `[unknown]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 2; `MessageLoop::ProcessNextDelayedNonNestableTask() [libxul.so]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 69 ms (top self: `__syscall_cancel_arch [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 2); SwComposite 39 ms (top self: `syscall [libc.so.6]` 38, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 0, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 45 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #4 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 194 ms: buckets subprocess_pipe_io 194, worker_messaging 194, ipc 194, js_ctypes 179, poll_wait 177, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 177; `[unknown]` 2; `PromiseConstructor(JSContext*, unsigned int, JS::V` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1
- **tab:7698** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 0; `js::PropMap::traceChildren(JSTracer*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7704** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7297** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0; `TimerThreadWrapper::RemoveTimer(nsTimerImpl*, mozilla::detai` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 383, DOM Worker 196, BgPool 62, Renderer 41, WRRenderBackend 21, SwComposite 18, Compositor 18, other 15, ImageBridge 7, WRSceneBuilder 3, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 383 ms (19.0% of span): Idle 229, JavaScript 78, Other 37, DOM 17, Profiler 12, Graphics 5
  - JS leaf 11 / native under JS 82 / native 290; buckets: ipc 382, poll_wait 263, gc_cc 74, engine_stream_read 45, worker_messaging 42, harness_diagnostics 29, paint_layout 21, subprocess_pipe_io 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 19; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 41 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 16, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 18 ms (top self: `syscall [libc.so.6]` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 62 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `[axiosozo-dev]` 1); ImageBridgeChld 7 ms (top self: `__syscall_cancel_arch [libc.so.6]` 7, `MessageLoop::DoDelayedWork(base::TimeTicks*) [libx` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 196 ms: buckets subprocess_pipe_io 196, worker_messaging 195, ipc 195, js_ctypes 169, poll_wait 162, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 164; `getcontext [libc.so.6]` 4; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 1
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7297** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 430, DOM Worker 184, Renderer 50, SwComposite 26, other 25, WRRenderBackend 15, Compositor 14, WRSceneBuilder 9, WRWorker 8, BgPool 3, ImageBridge 2, IPC I/O 1, Socket 1, Canvas 0, ImageIO 0
  - main thread 430 ms (11.8% of span): Idle 217, JavaScript 73, Layout 35, Graphics 34, Other 31, DOM 26
  - JS leaf 18 / native under JS 110 / native 303; buckets: ipc 430, poll_wait 250, gc_cc 85, paint_layout 75, engine_stream_read 60, worker_messaging 55, harness_diagnostics 22, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 228; `[unknown]` 13; `[axiosozo-dev]` 9; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, ` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 3
  - GC/CC markers: CCSlice 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 50 ms (top self: `__syscall_cancel_arch [libc.so.6]` 27, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `ClearTexSubImage [libxul.so]` 4); SwComposite 26 ms (top self: `syscall [libc.so.6]` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 176 ms: buckets subprocess_pipe_io 176, worker_messaging 176, ipc 176, js_ctypes 166, poll_wait 163, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 164; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Ha` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `ffi_call_plan_invoke [libxul.so]` 2; `getcontext [libc.so.6]` 1
- **tab:7244** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 7, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 7, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `JS::PropertySpecNameEqualsId(JSPropertySpec::Name, JS::Handl` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `[unknown]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `xpc::AutoScriptActivity::AutoScriptActivity(bool) [libxul.so` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7297** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 58, Renderer 16, DOM Worker 9, BgPool 4, WRRenderBackend 3, Compositor 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 58 ms (21.6% of span): JavaScript 21, Other 9, DOM 8, Layout 6, Graphics 6, Idle 4
  - JS leaf 1 / native under JS 34 / native 23; buckets: ipc 57, paint_layout 16, gc_cc 15, array_buffer_copy 11, harness_diagnostics 8, engine_stream_read 8, poll_wait 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 3; `JS::GetScriptedCallerGlobal(JSContext*) [libxul.so]` 3; `__lll_lock_wait [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 2
  - WebRender/compositor threads: Renderer 16 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::picture_composite_mode::prepare_composi` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `webrender::prim_store::text_run::TextRunKey::new [` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 4 ms (top self: `unlink [libc.so.6]` 2, `rmdir [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 9 ms: buckets subprocess_pipe_io 9, worker_messaging 9, ipc 9, poll_wait 9, js_ctypes 8; top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 0
- **tab:7698** CPU ms by thread group: main 22, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 22 ms (8.1% of span): JavaScript 8, Other 5, Idle 3, Layout 2, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 9 / native 12; buckets: ipc 19, gc_cc 8, subprocess_pipe_io 7, poll_wait 3, paint_layout 0
  - top self: `js::frontend::TaggedParserAtomIndex js::frontend::WellKnownP` 5; `__syscall_cancel_arch [libc.so.6]` 4; `[]` 2; `getcontext [libc.so.6]` 2; `mozilla::cyclecollector::HoldJSObjectsImpl(nsISupports*) [li` 1; `js::GlobalOrEvalDeclInstantiation(JSContext*, JS::Handle<JSO` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7244** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.1% of span): Idle 3, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[]` 0; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 0; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7843** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

