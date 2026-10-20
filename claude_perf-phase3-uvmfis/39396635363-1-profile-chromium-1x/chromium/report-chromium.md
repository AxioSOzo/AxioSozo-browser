# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **80.6** (main 31.0, Renderer 31.0, WRScene~ilder# 6.2, WRRende~ckend# 6.2, DOM Worker 6.2) | AxioCEFProbe 31.0, cef:renderer 24.8, cef:utility 6.2 | — | 118.7 |
| plain | idle | — | — | **8.7** (main 5.3, TaskCon~ller # 1.9, IPC I/O Parent 0.5, Timer 0.5, DOM Worker 0.5) | Web Content 3.4, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 26.0 | **27.2** (main 10.7, DOM Worker 3.9, TaskCon~ller # 2.3, Renderer 1.9, WRRende~ckend# 1.6) | cef:renderer 8.7, AxioCEFProbe 5.2, cef:gpu-process 4.8, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.3** (main 4.0, DOM Worker 4.0, Renderer 2.3, WRRende~ckend# 1.0, Compositor 1.0) | cef:renderer 8.0, AxioCEFProbe 5.0, cef:gpu-process 4.6, Web Content 0.3 | — | — |
| plain | scroll | 60.0 | 21.0 | **33.7** (main 15.6, DOM Worker 7.8, Backgro~Pool # 2.4, Renderer 1.9, glean.dispatche 1.0) | cef:gpu-process 20.0, cef:renderer 10.2, AxioCEFProbe 8.4 | — | — |
| plain | key | — | — | **15.8** (main 9.1, TaskCon~ller # 1.4, Renderer 1.4, DOM Worker 1.1, Timer 0.5) | AxioCEFProbe 2.6, cef:renderer 1.9, cef:gpu-process 0.9, WebExtensions 0.3 | 12.3 | — |
| plain | switch-to-gecko | — | — | **0.8** (main 0.2, DOM Worker 0.2, Renderer 0.1, IPC I/O Parent 0.1, BgIOThr~Pool # 0.1) | Web Content 0.1, Isolated Web Co 0.1 | — | 16125.5 |
| plain | switch-to-engine | — | — | **80.6** (main 31.0, Renderer 31.0, WRScene~ilder# 6.2, WRRende~ckend# 6.2, DOM Worker 6.2) | AxioCEFProbe 31.0, cef:renderer 24.8, cef:utility 6.2 | — | 118.7 |
| plain | idle | — | — | **8.7** (main 5.3, TaskCon~ller # 1.9, IPC I/O Parent 0.5, Timer 0.5, DOM Worker 0.5) | Web Content 3.4, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 26.0 | **27.2** (main 10.7, DOM Worker 3.9, TaskCon~ller # 2.3, Renderer 1.9, WRRende~ckend# 1.6) | cef:renderer 8.7, AxioCEFProbe 5.2, cef:gpu-process 4.8, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.3** (main 4.0, DOM Worker 4.0, Renderer 2.3, WRRende~ckend# 1.0, Compositor 1.0) | cef:renderer 8.0, AxioCEFProbe 5.0, cef:gpu-process 4.6, Web Content 0.3 | — | — |
| plain | scroll | 60.0 | 21.0 | **33.7** (main 15.6, DOM Worker 7.8, Backgro~Pool # 2.4, Renderer 1.9, glean.dispatche 1.0) | cef:gpu-process 20.0, cef:renderer 10.2, AxioCEFProbe 8.4 | — | — |
| plain | key | — | — | **15.8** (main 9.1, TaskCon~ller # 1.4, Renderer 1.4, DOM Worker 1.1, Timer 0.5) | AxioCEFProbe 2.6, cef:renderer 1.9, cef:gpu-process 0.9, WebExtensions 0.3 | 12.3 | — |
| plain | switch-to-gecko | — | — | **0.8** (main 0.2, DOM Worker 0.2, Renderer 0.1, IPC I/O Parent 0.1, BgIOThr~Pool # 0.1) | Web Content 0.1, Isolated Web Co 0.1 | — | 16125.5 |
| profile | switch-to-engine | — | — | **68.1** (main 34.0, Renderer 14.6, DOM Worker 9.7, SwComposite 4.9, SamplerThread 4.9) | Web Content 43.7, AxioCEFProbe 29.2, cef:renderer 24.3, WebExtensions 4.9 | — | 150.4 |
| profile | idle | — | — | **24.8** (SamplerThread 9.1, DOM Worker 8.1, main 5.7, Timer 1.9) | Web Content 10.0, Privileged Cont 1.9, Socket Process 1.4, WebExtensions 1.4 | — | — |
| profile | raf | 60.0 | 22.9 | **50.5** (main 12.9, DOM Worker 12.5, SamplerThread 11.9, Renderer 2.6, Backgro~Pool # 1.6) | Web Content 10.3, cef:renderer 8.0, cef:gpu-process 4.8, AxioCEFProbe 4.7 | — | — |
| profile | raf-nosampler | — | — | **39.3** (DOM Worker 12.2, SamplerThread 9.6, main 6.3, Renderer 2.6, WRRende~ckend# 1.7) | Web Content 10.6, cef:renderer 7.9, AxioCEFProbe 5.3, cef:gpu-process 4.6 | — | — |
| profile | scroll | 60.2 | 21.2 | **63.4** (main 22.1, DOM Worker 16.3, SamplerThread 12.0, Backgro~Pool # 2.4, Renderer 2.4) | cef:gpu-process 23.1, cef:renderer 10.5, Web Content 10.1, AxioCEFProbe 7.2 | — | — |
| profile | key | — | — | **41.2** (main 13.1, SamplerThread 9.8, DOM Worker 9.3, Timer 1.6, TaskCon~ller # 1.6) | Web Content 10.1, AxioCEFProbe 2.4, cef:renderer 2.2, WebExtensions 1.9 | 15.6 | — |
| profile | switch-to-gecko | — | — | **7.2** (SamplerThread 3.6, BgIOThr~Pool # 2.3, DOM Worker 0.5, main 0.4, Renderer 0.1) | Web Content 9.4, Isolated Web Co 2.0, Privileged Cont 2.0, WebExtensions 1.9 | — | 15025.5 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 4.1 | 0.0 | 0 | 0.0 | — | — | 12.9 | 0.0 | — | 1.30 | 1.15 | — | — | — | — | — | 0.005 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.17 | 0.15 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.14 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 9.2 | 0.0 | — | 0.29 | 0.14 | — | — | — | — | — | 0.010 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.8 | 0.0 | — | 0.53 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 1.336 | 0.517 | 0.0067 | 0.0026 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.039 | 0.073 | 0.0023 | 0.0044 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.036 | 0.068 | 0.0022 | 0.0041 |
| plain | scroll | memfd | native | 122 | 122 | 0.148 | 0.191 | 0.0087 | 0.0112 |
| plain | key | memfd | native | 21 | 21 | 0.014 | 0.054 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 1 | 1 | 1.336 | 0.517 | 0.0067 | 0.0026 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.039 | 0.073 | 0.0023 | 0.0044 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.036 | 0.068 | 0.0022 | 0.0041 |
| plain | scroll | memfd | native | 122 | 122 | 0.148 | 0.191 | 0.0087 | 0.0112 |
| plain | key | memfd | native | 21 | 21 | 0.014 | 0.054 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 0.983 | 0.919 | 0.0040 | 0.0037 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.044 | 0.082 | 0.0026 | 0.0049 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.046 | 0.078 | 0.0028 | 0.0047 |
| profile | scroll | memfd | native | 124 | 124 | 0.175 | 0.210 | 0.0103 | 0.0123 |
| profile | key | memfd | native | 21 | 21 | 0.014 | 0.065 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 10.4 | 0.0 | — | 0.54 | 0.86 | — | — | 7.8 | 12.0 | 20.0 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 55.6; first stdout read resolved 68.4; first frame applied (native receiver) 186.3; write frame_ack 187.5; write focus 194.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 38.1; first stdout read resolved 46.3; write shutdown 53.8

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 67, Renderer 27, DOM Worker 16, WRRenderBackend 4, WRSceneBuilder 3, Compositor 3, IPC I/O 3, SwComposite 2, BgPool 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 67 ms (27.4% of span): Layout 29, JavaScript 16, Idle 16, Other 2, Graphics 1, DOM 1
  - JS leaf 5 / native under JS 28 / native 34; buckets: ipc 67, paint_layout 25, poll_wait 17, gc_cc 17, array_buffer_copy 15, harness_diagnostics 10, subprocess_pipe_io 4, worker_messaging 2
  - top self: `poll [libc.so.6]` 16; `cssparser::parser::Parser::next_including_whitespace_and_com` 8; `nsContainerFrame::GetChildLists(nsTArray<mozilla::FrameChild` 6; `style::invalidation::element::invalidator::TreeStyleInvalida` 5; `style::custom_properties::do_substitute_chunk [libxul.so]` 4; `pretty (chrome://remote/content/shared/Format.sys.mjs:42:18)` 3
  - WebRender/compositor threads: Renderer 27 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `__lll_lock_wake [libc.so.6]` 1); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 0, `ARGBSetRow_X86 [libxul.so]` 0, `std::vector<unsigned char, std::allocator<unsigned` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 14, poll_wait 14, gc_cc 1; top self: `poll [libc.so.6]` 14; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::jit::DoCallFallback(JSContext*, js::jit::Basel` 1
- **tab:4190** CPU ms by thread group: main 52, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 52 ms (22.2% of span): Other 43, DOM 4, JavaScript 3, Profiler 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 47; buckets: ipc 39, array_buffer_copy 17, gc_cc 14, subprocess_pipe_io 5, memcpy_memset 1, poll_wait 1
  - top self: `[]` 4; `[libexpat.so.1]` 4; `__read_nocancel [libc.so.6]` 2; `icu_78::CharString::append(char, UErrorCode&) [libxul.so]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2; `__strcmp_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4192** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (21.8% of span): Other 39, DOM 4, JavaScript 4, Profiler 2, Idle 1
  - JS leaf 0 / native under JS 4 / native 46; buckets: ipc 39, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 8, memcpy_memset 4, poll_wait 2, image_container 1
  - top self: `[libfontconfig.so.1]` 7; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `[]` 2; `lut_inverse_interp16 [libxul.so]` 2; `js::frontend::InstantiateMarkedAtoms(JSContext*, js::Fronten` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.5% of span): Idle 3, Layout 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `nsBlockFrame::TrialReflow(nsPresContext*, mozilla::ReflowOut` 1; `mozilla::EventListenerManager::HandleEventSingleListener(moz` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 98, DOM Worker 95, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 98 ms (4.6% of span): Idle 78, Other 7, JavaScript 6, GC / CC 4, DOM 3, Profiler 1
  - JS leaf 1 / native under JS 7 / native 90; buckets: ipc 98, poll_wait 82, harness_diagnostics 7, gc_cc 7, array_buffer_copy 3, memcpy_memset 1, native_receiver 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 79; `recvmsg [libc.so.6]` 1; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 1; `js::NewObjectWithGivenTaggedProto(JSContext*, JSClass const*` 1; `debug (resource://gre/modules/Log.sys.mjs:396:8)[1]` 1
  - GC/CC markers: GCSlice 2× 5 ms, GCMinor 2× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 95 ms: buckets subprocess_pipe_io 95, js_ctypes 95, worker_messaging 95, ipc 95, poll_wait 95; top self: `poll [libc.so.6]` 95
- **tab:4192** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 359, DOM Worker 273, Renderer 69, WRRenderBackend 40, SwComposite 37, Compositor 35, other 33, BgPool 31, ImageBridge 16, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 359 ms (11.4% of span): Idle 213, JavaScript 61, GC / CC 34, Other 32, DOM 12, Profiler 8
  - JS leaf 12 / native under JS 59 / native 288; buckets: ipc 358, poll_wait 229, gc_cc 97, engine_stream_read 37, worker_messaging 35, subprocess_pipe_io 17, json_metadata 16, array_buffer_copy 12
  - top self: `poll [libc.so.6]` 216; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `write [libc.so.6]` 5; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 5; `recvmsg [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 784 ms, GCSlice 6× 28 ms, CCSlice 2× 5 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 56, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 3); WRRenderBackend#0 40 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0); SwComposite 37 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `[linux-vdso.so.1]` 0, `unsigned int mozilla::ProfileBufferEntryWriter::Su` 0); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wait [libc.so.6]` 0, `Pickle::~Pickle() [libxul.so]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 273 ms: buckets subprocess_pipe_io 273, worker_messaging 272, ipc 272, js_ctypes 255, poll_wait 249, gc_cc 8; top self: `poll [libc.so.6]` 249; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `bool mozilla::HashSet<js::gc::StoreBuffer::SlotsEd` 1; `JS_SetReservedSlot(JSObject*, unsigned int, JS::Va` 1; `js::SpeciesConstructor(JSContext*, JS::Handle<JSOb` 1
- **tab:3526** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 8, Idle 2
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 10, gc_cc 8, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onShapeE` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3439** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 8, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 10, gc_cc 8, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 5; `poll [libc.so.6]` 2; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1; `JsGcTracer::Trace(JS::Heap<JSObject*>*, char const*, void*) ` 1; `JSObject2WrappedJSMap::UpdateWeakPointersAfterGC(JSTracer*) ` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `JS::RuntimeHeapState() [libxul.so]` 0; `fog_custom_distribution_accumulate_single_sample [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 260, main 178, Renderer 66, WRRenderBackend 39, SwComposite 36, Compositor 35, BgPool 31, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 177 ms (5.8% of span): Idle 109, JavaScript 41, Other 18, DOM 7, Profiler 3
  - JS leaf 6 / native under JS 38 / native 134; buckets: ipc 177, poll_wait 120, gc_cc 49, engine_stream_read 29, worker_messaging 21, subprocess_pipe_io 10, json_metadata 10, native_receiver 9
  - top self: `poll [libc.so.6]` 112; `[unknown]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `recvmsg [libc.so.6]` 2; `write [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 66 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 4); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 1, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `[linux-vdso.so.1]` 0, `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 249, poll_wait 245, gc_cc 6; top self: `poll [libc.so.6]` 245; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `mozilla::CycleCollectedJSRuntime::JSObjectsTenured` 1; `mozilla::dom::WorkerGlobalScope_Binding::get_self(` 1
- **tab:3526** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3487** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 420, DOM Worker 269, BgPool 50, Renderer 50, WRRenderBackend 31, Compositor 24, SwComposite 24, other 22, ImageBridge 11, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 420 ms (19.9% of span): Idle 247, JavaScript 68, Other 57, DOM 24, Graphics 14, Profiler 6
  - JS leaf 7 / native under JS 80 / native 334; buckets: ipc 420, poll_wait 305, gc_cc 78, worker_messaging 47, paint_layout 35, engine_stream_read 30, subprocess_pipe_io 22, json_metadata 14
  - top self: `poll [libc.so.6]` 254; `[unknown]` 11; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 6; `[linux-vdso.so.1]` 3
  - WebRender/compositor threads: Renderer 50 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 41, `syscall [libc.so.6]` 4, `writev [libc.so.6]` 2); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 2, `[linux-vdso.so.1]` 0); SwComposite 24 ms (top self: `syscall [libc.so.6]` 24)
  - background pools (native receiver queue): BackgroundThreadPool #1 51 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::ImageClientSingle::UpdateImage(mo` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 269 ms: buckets subprocess_pipe_io 269, worker_messaging 269, ipc 269, js_ctypes 237, poll_wait 227, gc_cc 11; top self: `poll [libc.so.6]` 227; `[axiosozo-dev]` 2; `[unknown]` 2; `js::jit::JitActivation::JitActivation(JSContext*) ` 2; `mozilla::dom::WorkerPrivate::DoRunLoop(JSContext*)` 2
- **tab:3526** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsThreadManager::get() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4190** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 435, DOM Worker 232, Renderer 52, other 36, Compositor 15, SwComposite 14, WRRenderBackend 13, WRWorker 13, WRSceneBuilder 8, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 435 ms (11.8% of span): Idle 162, JavaScript 74, GC / CC 59, Layout 41, Other 33, Graphics 27
  - JS leaf 9 / native under JS 134 / native 291; buckets: ipc 435, poll_wait 203, gc_cc 151, paint_layout 82, worker_messaging 70, engine_stream_read 35, array_buffer_copy 19, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 163; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 18; `[axiosozo-dev]` 11; `[unknown]` 9; `recvmsg [libc.so.6]` 9; `mprotect [libc.so.6]` 5
  - GC/CC markers: GCMajor 2× 1099 ms, GCSlice 16× 57 ms, CCSlice 3× 10 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 52 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 5); SwComposite 14 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 233 ms: buckets subprocess_pipe_io 233, worker_messaging 233, ipc 233, js_ctypes 219, poll_wait 213, gc_cc 5; top self: `poll [libc.so.6]` 213; `[axiosozo-dev]` 3; `getcontext [libc.so.6]` 2; `read [libc.so.6]` 2; `JSStructuredCloneData::AppendBytes(char const*, un` 2
- **tab:3439** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `[]` 0; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, J` 0; `js::GetElementsWithAdder(JSContext*, JS::Handle<JSObject*>, ` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3526** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 334, main 69, DOM Worker 61, Renderer 16, IPC I/O 6, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, other 2, SwComposite 1, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 69 ms (0.5% of span): Idle 21, JavaScript 18, Layout 14, Other 6, Profiler 5, Graphics 3
  - JS leaf 2 / native under JS 25 / native 43; buckets: ipc 69, paint_layout 23, poll_wait 22, gc_cc 13, array_buffer_copy 11, harness_diagnostics 8, subprocess_pipe_io 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 20; `__lll_lock_wait [libc.so.6]` 4; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `madvise [libc.so.6]` 2; `[unknown]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 16 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 4, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 333 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 312, `write [libc.so.6]` 6, `unlink [libc.so.6]` 5); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 61 ms: buckets subprocess_pipe_io 61, worker_messaging 61, ipc 61, gc_cc 48, poll_wait 13, js_ctypes 13; top self: `poll [libc.so.6]` 11; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `madvise [libc.so.6]` 5; `mozilla::ProfileChunkedBuffer::ResetChunkManager(m` 4; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 3
- **tab:3526** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 4, JavaScript 2, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 6, poll_wait 4, gc_cc 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `[]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `js::UnwrapOneCheckedDynamic(JS::Handle<JSObject*>, JSContext` 0; `mozilla::dom::DOMStringMap_Binding::DOMProxyHandler::get(JSC` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, Profiler 1, Layout 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_mark` 0; `getcontext [libc.so.6]` 0; `JS::NewFunctionFromSpec(JSContext*, JSFunctionSpec const*, J` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message ` 0; `std::unique_ptr<mozilla::ProfileBufferChunk, std::default_de` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3487** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `IPC::Message::WillBeRoutedExternally(mojo::core::ports::User` 0; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

