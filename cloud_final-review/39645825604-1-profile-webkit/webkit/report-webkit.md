# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **25.2** (main 12.6, Renderer 5.4, DOM Worker 5.4, WRRende~ckend# 1.8) | WPEWebProcess 63.2, AxioWebKitHost 23.5, WPENetworkProce 10.8, Isolated Web Co 1.8 | — | 535.3 |
| plain | idle | — | — | **4.4** (main 2.9, DOM Worker 1.0, TaskCon~ller # 0.5) | AxioWebKitHost 0.5, Web Content 0.5 | — | — |
| plain | raf | 57.6 | 20.6 | **12.6** (main 4.9, DOM Worker 1.6, Renderer 1.3, WRRende~ckend# 1.3, Backgro~Pool # 1.0) | WPEWebProcess 40.5, AxioWebKitHost 2.6 | — | — |
| plain | raf-nosampler | — | — | **11.0** (main 3.7, DOM Worker 2.0, Renderer 1.3, glean.dispatche 1.0, TaskCon~ller # 0.7) | WPEWebProcess 38.8, AxioWebKitHost 3.6, Web Content 0.7, WebExtensions 0.3 | — | — |
| plain | scroll | 56.7 | 34.1 | **26.3** (main 12.9, DOM Worker 4.4, TaskCon~ller # 1.5, Backgro~Pool # 1.5, Renderer 1.0) | WPEWebProcess 48.5, AxioWebKitHost 4.0 | — | — |
| plain | key | — | — | **10.4** (main 5.8, Renderer 0.8, DOM Worker 0.8, Timer 0.6, WRScene~ilder# 0.6) | WPEWebProcess 7.0, AxioWebKitHost 0.6, Privileged Cont 0.3 | 17.9 | — |
| plain | switch-to-gecko | — | — | **9.0** (main 9.0) | Isolated Web Co 4.5 | — | 209.2 |
| trace | switch-to-engine | — | — | **43.3** (main 18.5, Renderer 12.4, WRRende~ckend# 6.2, DOM Worker 6.2) | WPEWebProcess 68.0, WPENetworkProce 12.4, Isolated Web Co 6.2 | — | 150.5 |
| trace | idle | — | — | **2.9** (main 2.4, Timer 0.5) | Web Content 2.0, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.3 | 24.4 | **50.4** (DOM Worker 14.7, main 13.4, Indexed~ IO # 9.5, IPDL Background 3.6, TaskCon~ller # 2.0) | WPEWebProcess 42.2, AxioWebKitHost 4.2, Privileged Cont 0.3 | — | — |
| trace | raf-nosampler | — | — | **16.0** (main 6.3, DOM Worker 2.0, Renderer 1.3, WRRende~ckend# 1.0, glean.dispatche 0.7) | WPEWebProcess 40.6, AxioWebKitHost 3.6 | — | — |
| trace | scroll | 57.0 | 32.6 | **29.5** (main 14.0, DOM Worker 5.5, TaskCon~ller # 3.0, WRRende~ckend# 1.5, Backgro~Pool # 1.5) | WPEWebProcess 49.4, AxioWebKitHost 5.0 | — | — |
| trace | key | — | — | **8.2** (main 5.3, DOM Worker 0.8, Renderer 0.6, glean.dispatche 0.3, Timer 0.3) | WPEWebProcess 4.8, AxioWebKitHost 0.6, WebExtensions 0.3, Web Content 0.3 | 14.0 | — |
| trace | switch-to-gecko | — | — | **13.5** (main 4.5, Renderer 4.5, Compositor 4.5) | WebExtensions 4.5, Isolated Web Co 4.5 | — | 209.3 |
| profile | switch-to-engine | — | — | **32.3** (main 13.9, Renderer 4.6, WRScene~ilder# 4.6, DOM Worker 4.6, SamplerThread 4.6) | Web Content 147.8, WPEWebProcess 64.6, AxioWebKitHost 4.6, WPENetworkProce 4.6 | — | 194.6 |
| profile | idle | — | — | **12.7** (SamplerThread 4.4, main 3.9, DOM Worker 3.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 4.9, WebExtensions 1.0, Privileged Cont 1.0, Isolated Web Co 1.0 | — | — |
| profile | raf | 58.3 | 21.8 | **28.1** (main 8.5, SamplerThread 6.2, DOM Worker 5.6, Renderer 1.6, Timer 1.0) | WPEWebProcess 42.2, Web Content 4.2, AxioWebKitHost 3.9, Isolated Web Co 1.3 | — | — |
| profile | raf-nosampler | — | — | **21.2** (DOM Worker 5.3, SamplerThread 5.3, main 4.0, Renderer 1.7, WRRende~ckend# 1.3) | WPEWebProcess 42.2, Web Content 4.7, AxioWebKitHost 3.6, WebExtensions 1.0 | — | — |
| profile | scroll | 57.3 | 33.1 | **37.6** (main 15.3, DOM Worker 7.9, SamplerThread 6.4, Timer 1.5, Renderer 1.5) | WPEWebProcess 48.5, AxioWebKitHost 5.0, Web Content 4.9, WebExtensions 1.0 | — | — |
| profile | key | — | — | **23.2** (main 8.0, SamplerThread 5.0, DOM Worker 4.4, Timer 1.1, Renderer 0.8) | WPEWebProcess 5.5, Web Content 4.7, AxioWebKitHost 1.5, WebExtensions 1.4 | 16.3 | — |
| profile | switch-to-gecko | — | — | **26.4** (main 8.8, WRRende~ckend# 4.4, BgIOThr~Pool # 4.4, DOM Worker 4.4, SamplerThread 4.4) |  | — | 212.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 11.8 | 0.0 | 0 | 0.0 | — | — | 53.6 | 0.0 | — | 0.39 | 0.42 | — | — | — | — | — | 0.005 |
| trace | raf | 57.4 | 0.0 | 0 | 0.0 | — | — | 16.8 | 0.0 | — | 0.08 | 0.08 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 17.0 | 0.0 | — | 0.08 | 0.08 | — | — | — | — | — | 0.005 |
| trace | scroll | 56.2 | 0.0 | 0 | 0.0 | — | — | 12.2 | 0.0 | — | 0.13 | 0.07 | — | — | — | — | — | 0.004 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.2 | 0.0 | — | 0.05 | 0.06 | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 8.7 | 0.0 | 0 | 0.0 | — | — | 64.2 | 0.0 | — | 0.52 | 0.54 | — | — | — | — | — | 0.005 |
| profile | raf | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.08 | 0.09 | — | — | — | — | — | 0.006 |
| profile | raf-nosampler | 58.0 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.10 | 0.10 | — | — | — | — | — | 0.007 |
| profile | scroll | 56.6 | 0.0 | 0 | 0.0 | — | — | 7.1 | 0.0 | — | 0.15 | 0.09 | — | — | — | — | — | 0.006 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.07 | 0.10 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.294 | 0.384 | 0.0010 | 0.0014 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.023 | 0.044 | 0.0014 | 0.0025 |
| plain | raf-nosampler | memfd | native | 174 | 174 | 0.030 | 0.052 | 0.0017 | 0.0030 |
| plain | scroll | memfd | native | 113 | 113 | 0.073 | 0.107 | 0.0041 | 0.0059 |
| plain | key | memfd | native | 20 | 20 | 0.000 | 0.043 | 0.0000 | 0.0002 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.266 | 0.617 | 0.0031 | 0.0073 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 176 | 176 | 0.026 | 0.050 | 0.0015 | 0.0029 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.032 | 0.055 | 0.0019 | 0.0032 |
| trace | scroll | memfd | native | 113 | 113 | 0.085 | 0.107 | 0.0048 | 0.0060 |
| trace | key | memfd | native | 20 | 20 | 0.000 | 0.044 | 0.0000 | 0.0002 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.370 | 0.382 | 0.0032 | 0.0033 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.029 | 0.052 | 0.0017 | 0.0030 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.037 | 0.066 | 0.0021 | 0.0038 |
| profile | scroll | memfd | native | 115 | 115 | 0.090 | 0.122 | 0.0051 | 0.0069 |
| profile | key | memfd | native | 20 | 20 | 0.000 | 0.049 | 0.0000 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.3 | 12.4 | 0.0 | — | 0.05 | 0.18 | — | — | 13.3 | 12.9 | 26.6 |
| profile | 0.3 | 12.2 | 0.0 | — | 0.07 | 0.28 | — | — | 12.6 | 13.1 | 29.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 8.9; first stdout read resolved 9.4; first frame applied (native receiver) 154.5; write frame_ack 155.3; write visibility 157.8; write focus 157.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 9.9; first stdout read resolved 14.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 16.9; first stdout read resolved 20.7; first frame applied (native receiver) 201.6; write frame_ack 202.5; write visibility 207.5; write focus 207.7

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 14.0; first stdout read resolved 19.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 28, DOM Worker 10, Renderer 6, IPC I/O 2, Compositor 2, BgPool 2, WRRenderBackend 1, WRSceneBuilder 1, SwComposite 0, WRWorker 0, Socket 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 28 ms (12.1% of span): Idle 9, DOM 7, Layout 5, JavaScript 4, Graphics 2, Other 1
  - JS leaf 1 / native under JS 13 / native 14; buckets: ipc 28, poll_wait 10, paint_layout 9, gc_cc 8, array_buffer_copy 4, engine_stream_read 4, harness_diagnostics 3, worker_messaging 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `mozilla::dom::Element::GetScrollRange() [libxul.so]` 3; `nsOverflowContinuationTracker::nsOverflowContinuationTracker` 2; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsI` 1; `nsRect::Intersect(nsRect const&) const [libxul.so]` 1; `nsNativeTheme::IsWidgetAlwaysNonNative(nsIFrame*, mozilla::S` 1
  - WebRender/compositor threads: Renderer 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 10, poll_wait 8; top self: `__syscall_cancel_arch [libc.so.6]` 9; `mozilla::dom::TimeoutManager::SetTimeout(mozilla::` 0; `[axiosozo-dev]` 0
- **tab:7860** CPU ms by thread group: main 31, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 31 ms (38.6% of span): Other 25, Profiler 2, DOM 2, JavaScript 2, Idle 0
  - JS leaf 1 / native under JS 2 / native 29; buckets: ipc 25, array_buffer_copy 10, gc_cc 9, subprocess_pipe_io 2, memcpy_memset 2, poll_wait 0
  - top self: `prctl [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `getdents64 [libc.so.6]` 2; `[]` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7855** CPU ms by thread group: main 28, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 28 ms (37.4% of span): Other 20, DOM 3, Profiler 2, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 1 / native 27; buckets: ipc 22, array_buffer_copy 8, gc_cc 8, subprocess_pipe_io 3, memcpy_memset 2, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `__lll_lock_wake [libc.so.6]` 2; `__strlen_evex [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `js::gc::GCRuntime::getOrAllocChunk(js::gc::StallAndRetry, js` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7709** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::AfterProcessMicrotasks() [` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 76, DOM Worker 34, other 9, BgPool 1, Socket 0, IPC I/O 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 76 ms (3.7% of span): Idle 63, JavaScript 6, DOM 2, Other 2, GC / CC 2, Profiler 0
  - JS leaf 0 / native under JS 8 / native 68; buckets: ipc 76, poll_wait 64, harness_diagnostics 7, gc_cc 5, array_buffer_copy 3, subprocess_pipe_io 1, native_receiver 0, engine_stream_read 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 64; `[unknown]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeB` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::fr` 1; `nsDocShell::QueryInterface(nsID const&, void**) [libxul.so]` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 34 ms: buckets subprocess_pipe_io 34, worker_messaging 34, ipc 34, js_ctypes 34, poll_wait 34, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 34; `__memset_avx512_unaligned_erms [libc.so.6]` 0
- **tab:7341** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7860** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::GetCpuTimeSinceProcessStartInMs(unsigned long*) [li` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7300** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 233, DOM Worker 120, Renderer 44, WRRenderBackend 32, Compositor 23, SwComposite 20, BgPool 18, other 18, ImageBridge 10, WRSceneBuilder 6, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 233 ms (7.6% of span): Idle 174, JavaScript 32, Other 13, DOM 9, Profiler 3, GC / CC 2
  - JS leaf 4 / native under JS 37 / native 193; buckets: ipc 233, poll_wait 179, gc_cc 32, engine_stream_read 23, worker_messaging 13, harness_diagnostics 13, subprocess_pipe_io 10, array_buffer_copy 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 179; `[unknown]` 8; `[axiosozo-dev]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__syscall_cancel_arch [libc.so.6]` 39, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 32 ms (top self: `syscall [libc.so.6]` 29, `webrender::frame_builder::FrameBuilder::build [lib` 1, `sched_yield [libc.so.6]` 1); SwComposite 20 ms (top self: `syscall [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::compositor::sw_compositor::SwCompositeT` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `nsThread::DrainDirectTasks() [libxul.so]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 120 ms: buckets subprocess_pipe_io 120, worker_messaging 120, ipc 120, js_ctypes 115, poll_wait 114, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 114; `js::gc::TenuringTracer::moveElements(js::NativeObj` 1; `[unknown]` 1; `[axiosozo-dev]` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:7709** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: poll_wait 3, gc_cc 3, ipc 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `[]` 0; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 3× 4 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7715** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7322** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 113, main 112, Renderer 46, WRRenderBackend 31, Compositor 22, BgPool 22, SwComposite 19, ImageBridge 9, WRSceneBuilder 5, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 112 ms (3.7% of span): Idle 75, JavaScript 20, Other 9, DOM 5, Profiler 2, GC / CC 1
  - JS leaf 5 / native under JS 20 / native 88; buckets: ipc 112, poll_wait 79, gc_cc 25, engine_stream_read 21, worker_messaging 7, subprocess_pipe_io 6, array_buffer_copy 6, native_receiver 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 81; `[unknown]` 3; `write (resource://gre/modules/subprocess/subprocess_common.s` 1; `xpt::detail::InterfaceByName(char const*) [libxul.so]` 1; `[linux-vdso.so.1]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 1
  - WebRender/compositor threads: Renderer 46 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 1, `floorf [libxul.so]` 0); SwComposite 19 ms (top self: `syscall [libc.so.6]` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 22 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `axio::SinkState::Apply(unsigned int, unsigned int,` 0); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 9, `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 113 ms: buckets subprocess_pipe_io 113, worker_messaging 113, ipc 113, js_ctypes 108, poll_wait 104, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 104; `__lll_lock_wake [libc.so.6]` 3; `[axiosozo-dev]` 1; `[unknown]` 1; `EnqueuePromiseReactionJob(JSContext*, JS::Handle<J` 0
- **tab:7709** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2, gc_cc 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `mmap64 [libc.so.6]` 1; `(anonymous namespace)::CipherSuiteChangeObserver::QueryInter` 0; `__lll_lock_wait [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7341** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7322** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 293, DOM Worker 124, Renderer 31, BgPool 26, WRRenderBackend 24, Compositor 16, SwComposite 14, other 11, ImageBridge 7, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 293 ms (14.4% of span): Idle 171, JavaScript 68, Other 31, DOM 11, Graphics 4, Layout 3
  - JS leaf 9 / native under JS 69 / native 216; buckets: ipc 292, poll_wait 202, gc_cc 65, engine_stream_read 42, worker_messaging 31, harness_diagnostics 15, paint_layout 15, subprocess_pipe_io 15
  - top self: `__syscall_cancel_arch [libc.so.6]` 184; `[unknown]` 9; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `g_list_remove_link [libglib-2.0.so.0]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `__syscall_cancel_arch [libc.so.6]` 28, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 1); WRRenderBackend#0 24 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 1, `mozilla::detail::EventQueueInternal<16ul>::PutEven` 0); SwComposite 14 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 26 ms (top self: `__syscall_cancel_arch [libc.so.6]` 23, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 7 ms (top self: `__syscall_cancel_arch [libc.so.6]` 6, `[linux-vdso.so.1]` 0, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 123 ms: buckets subprocess_pipe_io 123, worker_messaging 123, ipc 123, js_ctypes 108, poll_wait 107, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 107; `[axiosozo-dev]` 7; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[unknown]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1
- **tab:7341** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7300** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7322** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 275, DOM Worker 98, Renderer 30, other 18, WRRenderBackend 11, SwComposite 10, Compositor 9, WRWorker 8, WRSceneBuilder 6, BgPool 2, ImageBridge 1, IPC I/O 1, Socket 0, ImageIO 0, Canvas 0
  - main thread 275 ms (7.6% of span): Idle 150, JavaScript 40, Graphics 23, Other 23, Layout 22, DOM 10
  - JS leaf 8 / native under JS 60 / native 207; buckets: ipc 274, poll_wait 166, gc_cc 48, paint_layout 45, engine_stream_read 32, worker_messaging 31, array_buffer_copy 9, harness_diagnostics 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 157; `[unknown]` 9; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 3; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 3; `nsLayoutUtils::FindNearestCommonAncestorFrame(nsIFrame const` 2
  - GC/CC markers: GCMinor 1× 3 ms, CCSlice 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 30 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 9, `crossbeam_channel::channel::Sender<T>::send [libxu` 0, `sched_yield [libc.so.6]` 0); SwComposite 10 ms (top self: `syscall [libc.so.6]` 9, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `mozilla::Queue<nsCOMPtr<nsIRunnable>, 16ul>::Push(` 0, `mozilla::ipc::MessageChannel::SendMessageToLink(st` 0); BgIOThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 91 ms: buckets subprocess_pipe_io 91, worker_messaging 91, ipc 91, js_ctypes 82, poll_wait 82, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 82; `[unknown]` 3; `OriginalPromiseThenBuiltin(JSContext*, JS::Handle<` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:7246** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 5, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `lazyGetter (resource://gre/modules/XPCOMUtils.sys.mjs:237:24` 0; `__memcmp_evex_movbe [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::dom::ReceiveMessageArgument::ReceiveMessageArgument` 0; `nsMemoryReporterManager::QueryInterface(nsID const&, void**)` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7341** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7322** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 26, BgPool 7, Renderer 6, DOM Worker 6, Compositor 2, WRRenderBackend 1, WRSceneBuilder 1, Socket 1, SwComposite 0, IPC I/O 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 26 ms (11.0% of span): JavaScript 9, Other 5, Idle 3, Graphics 3, Profiler 2, DOM 2
  - JS leaf 1 / native under JS 12 / native 13; buckets: ipc 26, paint_layout 7, gc_cc 7, array_buffer_copy 5, harness_diagnostics 5, poll_wait 4, worker_messaging 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `nsIFrame::GetUsedPadding() const [libxul.so]` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 2; `XPCConvert::NativeArray2JS(JSContext*, JS::MutableHandle<JS:` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 7 ms (top self: `rmdir [libc.so.6]` 3, `unlink [libc.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 6 ms: buckets subprocess_pipe_io 6, worker_messaging 6, ipc 6, poll_wait 5, js_ctypes 4, memcpy_memset 0; top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [l` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSO` 0
- **tab:7709** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.7% of span): Idle 2, JavaScript 1, DOM 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 3, poll_wait 2, subprocess_pipe_io 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::LifoAlloc::reset(unsigned long) [libxul.so]` 1; `[]` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7246** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.3% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7715** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

