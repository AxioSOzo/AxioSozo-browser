# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **64.5** (Renderer 24.5, main 20.1, DOM Worker 11.1, Backgro~Pool # 2.2, WRScene~ilder# 2.2) | AxioCEFProbe 60.2, cef:gpu-process 17.8, cef:utility 13.4, cef:renderer 11.1 | — | 409.1 |
| plain | idle | — | — | **5.7** (main 4.3, Timer 1.4) | Web Content 3.4, AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 20.8 | **27.9** (main 7.1, Renderer 6.5, SwComposite 5.2, DOM Worker 2.6, WRRende~ckend# 1.6) | cef:renderer 8.4, AxioCEFProbe 5.1, cef:gpu-process 4.9, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.2** (Renderer 6.0, SwComposite 4.6, main 4.3, DOM Worker 3.0, WRRende~ckend# 1.3) | cef:renderer 8.6, AxioCEFProbe 5.9, cef:gpu-process 5.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.3 | 20.9 | **41.9** (main 15.6, DOM Worker 7.8, Renderer 5.8, SwComposite 4.4, Backgro~Pool # 2.4) | cef:gpu-process 20.4, AxioCEFProbe 9.2, cef:renderer 9.2 | — | — |
| plain | key | — | — | **12.1** (main 7.4, DOM Worker 1.4, Timer 0.8, Renderer 0.8, SwComposite 0.5) | cef:renderer 1.9, AxioCEFProbe 1.4, cef:gpu-process 0.5, WebExtensions 0.3 | 12.0 | — |
| plain | switch-to-gecko | — | — | **42.1** (main 18.1, glean.dispatche 6.0, BgIOThr~Pool # 6.0, Renderer 6.0, WRRende~ckend# 6.0) |  | — | 130.3 |
| plain | switch-to-engine | — | — | **64.5** (Renderer 24.5, main 20.1, DOM Worker 11.1, Backgro~Pool # 2.2, WRScene~ilder# 2.2) | AxioCEFProbe 60.2, cef:gpu-process 17.8, cef:utility 13.4, cef:renderer 11.1 | — | 409.1 |
| plain | idle | — | — | **5.7** (main 4.3, Timer 1.4) | Web Content 3.4, AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 20.8 | **27.9** (main 7.1, Renderer 6.5, SwComposite 5.2, DOM Worker 2.6, WRRende~ckend# 1.6) | cef:renderer 8.4, AxioCEFProbe 5.1, cef:gpu-process 4.9, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.2** (Renderer 6.0, SwComposite 4.6, main 4.3, DOM Worker 3.0, WRRende~ckend# 1.3) | cef:renderer 8.6, AxioCEFProbe 5.9, cef:gpu-process 5.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.3 | 20.9 | **41.9** (main 15.6, DOM Worker 7.8, Renderer 5.8, SwComposite 4.4, Backgro~Pool # 2.4) | cef:gpu-process 20.4, AxioCEFProbe 9.2, cef:renderer 9.2 | — | — |
| plain | key | — | — | **12.1** (main 7.4, DOM Worker 1.4, Timer 0.8, Renderer 0.8, SwComposite 0.5) | cef:renderer 1.9, AxioCEFProbe 1.4, cef:gpu-process 0.5, WebExtensions 0.3 | 12.0 | — |
| plain | switch-to-gecko | — | — | **42.1** (main 18.1, glean.dispatche 6.0, BgIOThr~Pool # 6.0, Renderer 6.0, WRRende~ckend# 6.0) |  | — | 130.3 |
| profile | switch-to-engine | — | — | **44.6** (main 12.5, DOM Worker 12.5, SamplerThread 8.9, Renderer 5.3, IPC I/O Parent 1.8) | AxioCEFProbe 55.3, Web Content 35.6, cef:gpu-process 17.8, cef:utility 12.4 | — | 514.1 |
| profile | idle | — | — | **24.7** (SamplerThread 9.0, DOM Worker 8.1, main 5.7, Timer 1.9) | Web Content 10.0, Socket Process 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 60.0 | 21.3 | **60.2** (main 12.8, DOM Worker 12.2, SamplerThread 12.2, Renderer 7.1, SwComposite 5.4) | Web Content 10.2, cef:renderer 8.6, AxioCEFProbe 4.7, cef:gpu-process 4.5 | — | — |
| profile | raf-nosampler | — | — | **50.4** (DOM Worker 13.9, SamplerThread 10.6, Renderer 6.9, main 6.6, SwComposite 5.6) | Web Content 9.9, cef:renderer 8.5, AxioCEFProbe 5.0, cef:gpu-process 4.7 | — | — |
| profile | scroll | 60.1 | 22.5 | **77.8** (main 23.5, DOM Worker 16.3, SamplerThread 12.0, Renderer 7.7, SwComposite 5.3) | cef:gpu-process 22.1, cef:renderer 11.0, Web Content 10.1, AxioCEFProbe 8.6 | — | — |
| profile | key | — | — | **39.3** (main 13.1, SamplerThread 9.8, DOM Worker 9.3, Timer 1.9, TaskCon~ller # 1.9) | Web Content 10.1, cef:renderer 2.8, WebExtensions 2.4, Privileged Cont 2.2 | 15.4 | — |
| profile | switch-to-gecko | — | — | **7.5** (SamplerThread 3.8, BgIOThr~Pool # 2.3, main 0.5, DOM Worker 0.3, IPC I/O Parent 0.1) | Web Content 9.5, Privileged Cont 2.1, Isolated Web Co 2.0, Socket Process 1.6 | — | 15023.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.4 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 59.4 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 7.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.880 | 0.626 | 0.0038 | 0.0027 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.040 | 0.077 | 0.0024 | 0.0046 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.048 | 0.081 | 0.0029 | 0.0049 |
| plain | scroll | memfd | native | 123 | 123 | 0.186 | 0.194 | 0.0110 | 0.0115 |
| plain | key | memfd | native | 21 | 21 | 0.015 | 0.067 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.880 | 0.626 | 0.0038 | 0.0027 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.040 | 0.077 | 0.0024 | 0.0046 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.048 | 0.081 | 0.0029 | 0.0049 |
| plain | scroll | memfd | native | 123 | 123 | 0.186 | 0.194 | 0.0110 | 0.0115 |
| plain | key | memfd | native | 21 | 21 | 0.015 | 0.067 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.509 | 1.192 | 0.0051 | 0.0041 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 189 | 0.046 | 0.083 | 0.0028 | 0.0050 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.044 | 0.082 | 0.0026 | 0.0048 |
| profile | scroll | memfd | native | 124 | 124 | 0.212 | 0.244 | 0.0124 | 0.0143 |
| profile | key | memfd | native | 21 | 21 | 0.018 | 0.075 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.3 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 50.0; spawn AxioCEFProbe resolved 101.3; write hello 103.2; first stdout read resolved 352.2; write create 355.2; write frame_ack 530.4; write focus 543.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 36.3; first stdout read resolved 48.0; write shutdown 49.8

### Profile: chromium-control / switch-to-engine

- **parent** CPU ms by thread group: main 76, DOM Worker 40, Renderer 28, WRRenderBackend 5, BgPool 5, Compositor 4, IPC I/O 4, WRSceneBuilder 3, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 76 ms (12.9% of span): Layout 23, JavaScript 23, Idle 10, Other 9, DOM 6, Graphics 4
  - JS leaf 3 / native under JS 30 / native 43; buckets: ipc 76, paint_layout 31, gc_cc 23, poll_wait 11, harness_diagnostics 10, worker_messaging 10, array_buffer_copy 9, engine_stream_read 5
  - top self: `poll [libc.so.6]` 10; `style::custom_properties::substitute [libxul.so]` 5; `__lll_lock_wait [libc.so.6]` 4; `sendmsg [libc.so.6]` 3; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handl` 2; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, ns` 2
  - WebRender/compositor threads: Renderer 28 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `ClearTexSubImage [libxul.so]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 4, `syscall [libc.so.6]` 1, `webrender::batch::AlphaBatchBuilder::build [libxul` 0); WRSceneBuilder#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memset_avx2_unaligned_erms [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 39 ms: buckets subprocess_pipe_io 39, worker_messaging 39, ipc 39, poll_wait 29, js_ctypes 29, gc_cc 3; top self: `poll [libc.so.6]` 27; `[linux-vdso.so.1]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `JS::IsCallable(JSObject*) [libxul.so]` 1
- **tab:5360** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (9.1% of span): Other 37, Profiler 4, DOM 3, JavaScript 3, Idle 2
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 34, array_buffer_copy 15, gc_cc 14, subprocess_pipe_io 7, memcpy_memset 3, poll_wait 2, canvas_2d 2, image_container 1
  - top self: `__lll_lock_wait [libc.so.6]` 4; `close [libc.so.6]` 3; `[libexpat.so.1]` 3; `syscall [libc.so.6]` 2; `poll [libc.so.6]` 2; `SkSurfaceProps::SkSurfaceProps(unsigned int, SkPixelGeometry` 2
  - GC/CC markers: GCMinor 1× 3 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5365** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (8.8% of span): Other 35, JavaScript 6, DOM 2, Idle 2, Profiler 2, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 42; buckets: ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 7, poll_wait 2, memcpy_memset 2
  - top self: `[]` 6; `prctl [libc.so.6]` 2; `[libexpat.so.1]` 2; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 2; `poll [libc.so.6]` 2; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5249** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (0.6% of span): Idle 2, Profiler 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `[]` 1; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffe` 0; `mozilla::EventStateManager::GetEventTarget() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / idle

- **parent** CPU ms by thread group: main 104, DOM Worker 100, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 104 ms (4.9% of span): Idle 80, JavaScript 8, Other 8, GC / CC 6, Profiler 1, DOM 0
  - JS leaf 0 / native under JS 7 / native 96; buckets: ipc 104, poll_wait 85, gc_cc 9, harness_diagnostics 7, array_buffer_copy 4, memcpy_memset 0, json_metadata 0
  - top self: `poll [libc.so.6]` 81; `recvmsg [libc.so.6]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, ` 1; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [libxul.so]` 1; `TimerThreadWrapper::AddTimer(nsTimerImpl*, mozilla::detail::` 1
  - GC/CC markers: CCSlice 2× 4 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 100 ms: buckets subprocess_pipe_io 100, worker_messaging 100, ipc 100, js_ctypes 99, poll_wait 99; top self: `poll [libc.so.6]` 99; `[axiosozo-dev]` 0
- **tab:4725** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4764** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `fog_counter_add [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5365** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf

- **parent** CPU ms by thread group: main 357, DOM Worker 273, Renderer 210, SwComposite 164, WRRenderBackend 53, Compositor 35, other 33, BgPool 32, ImageBridge 16, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 357 ms (11.3% of span): Idle 224, JavaScript 60, GC / CC 30, Other 30, DOM 8, Profiler 4
  - JS leaf 6 / native under JS 58 / native 294; buckets: ipc 357, poll_wait 243, gc_cc 87, worker_messaging 35, engine_stream_read 26, json_metadata 17, harness_diagnostics 17, array_buffer_copy 11
  - top self: `poll [libc.so.6]` 227; `[unknown]` 8; `recvmsg [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 794 ms, GCSlice 7× 27 ms, CCSlice 2× 6 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 210 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 128, `int blendTextureNearestFast<false, glsl::sampler2D` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 16); SwComposite 164 ms (top self: `syscall [libc.so.6]` 115, `void scale_blit<true>(Texture&, IntRect const&, Te` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 3, `[linux-vdso.so.1]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 32 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 31, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wake [libc.so.6]` 0, `mozilla::BufferList<InfallibleAllocPolicy>::Alloca` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 273 ms: buckets subprocess_pipe_io 273, worker_messaging 273, ipc 273, js_ctypes 259, poll_wait 255, gc_cc 4; top self: `poll [libc.so.6]` 255; `[unknown]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `mozilla::dom::StructuredCloneHolder::~StructuredCl` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:4764** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 9, Idle 1
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 10, gc_cc 9, poll_wait 2
  - top self: `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `poll [libc.so.6]` 1; `js::CyclicModuleFields::trace(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 8 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4678** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 8, gc_cc 7, poll_wait 4
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(J` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 318, Renderer 196, main 177, SwComposite 154, WRRenderBackend 50, Compositor 34, BgPool 31, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 177 ms (5.8% of span): Idle 103, JavaScript 43, Other 16, DOM 11, Profiler 3, GC / CC 2
  - JS leaf 4 / native under JS 47 / native 126; buckets: ipc 177, poll_wait 110, gc_cc 58, worker_messaging 34, engine_stream_read 32, json_metadata 16, subprocess_pipe_io 11, array_buffer_copy 9
  - top self: `poll [libc.so.6]` 103; `[unknown]` 10; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[linux-vdso.so.1]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 196 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 102, `int blendTextureNearestFast<false, glsl::sampler2D` 26, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 16); SwComposite 153 ms (top self: `syscall [libc.so.6]` 76, `void scale_blit<true>(Texture&, IntRect const&, Te` 73, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 29, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 318 ms: buckets subprocess_pipe_io 318, worker_messaging 317, ipc 317, js_ctypes 246, poll_wait 240, gc_cc 55; top self: `poll [libc.so.6]` 240; `[axiosozo-dev]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `madvise [libc.so.6]` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5
- **tab:4746** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / scroll

- **parent** CPU ms by thread group: main 459, DOM Worker 278, Renderer 143, SwComposite 105, BgPool 59, WRRenderBackend 44, Compositor 25, other 22, ImageBridge 11, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 459 ms (21.7% of span): Idle 257, JavaScript 88, Other 57, GC / CC 18, Graphics 16, DOM 14
  - JS leaf 7 / native under JS 83 / native 368; buckets: ipc 457, poll_wait 324, gc_cc 101, worker_messaging 46, paint_layout 40, engine_stream_read 25, array_buffer_copy 19, subprocess_pipe_io 18
  - top self: `poll [libc.so.6]` 263; `[unknown]` 16; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 6; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 4
  - GC/CC markers: CCSlice 3× 8 ms, GCSlice 3× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 143 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `int blendTextureNearestFast<false, glsl::sampler2D` 13, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9); SwComposite 105 ms (top self: `syscall [libc.so.6]` 91, `void scale_blit<true>(Texture&, IntRect const&, Te` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 59 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `[linux-vdso.so.1]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 278 ms: buckets subprocess_pipe_io 278, worker_messaging 278, ipc 278, js_ctypes 253, poll_wait 243, gc_cc 11; top self: `poll [libc.so.6]` 243; `__memset_avx2_unaligned_erms [libc.so.6]` 5; `[unknown]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `JSStructuredCloneWriter::traverseObject(JS::Handle` 1
- **tab:4764** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5365** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / key

- **parent** CPU ms by thread group: main 434, DOM Worker 226, other 36, Renderer 31, SwComposite 24, Compositor 15, WRRenderBackend 10, WRSceneBuilder 8, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 434 ms (11.8% of span): Idle 162, JavaScript 65, GC / CC 62, Layout 38, Other 38, DOM 32
  - JS leaf 11 / native under JS 129 / native 294; buckets: ipc 434, poll_wait 200, gc_cc 146, paint_layout 75, worker_messaging 66, engine_stream_read 44, subprocess_pipe_io 22, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 162; `[axiosozo-dev]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[unknown]` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `recvmsg [libc.so.6]` 5
  - GC/CC markers: GCMajor 2× 1012 ms, GCSlice 16× 54 ms, CCSlice 4× 12 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); SwComposite 24 ms (top self: `syscall [libc.so.6]` 13, `void scale_blit<true>(Texture&, IntRect const&, Te` 10, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 10 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 0, `mozilla::ThreadEventQueue::PutEventInternal(RefPtr` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 226 ms: buckets subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 213, poll_wait 210, gc_cc 9; top self: `poll [libc.so.6]` 209; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `__lll_lock_wait [libc.so.6]` 2; `[unknown]` 1; `JSLinearString* js::StringChars<unsigned char>::to` 1
- **tab:4678** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `[unknown]` 0; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 0; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4764** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 340, main 70, DOM Worker 44, Renderer 18, IPC I/O 6, Compositor 4, WRRenderBackend 2, WRSceneBuilder 2, other 2, Socket 1, SwComposite 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 71 ms (0.5% of span): Idle 20, JavaScript 19, Layout 18, Other 6, Graphics 3, Profiler 2
  - JS leaf 1 / native under JS 31 / native 38; buckets: ipc 71, paint_layout 23, poll_wait 21, gc_cc 14, array_buffer_copy 12, harness_diagnostics 9, memcpy_memset 6, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `style::properties::cascade::Cascade::apply_non_prioritary_pr` 2; `[axiosozo-dev]` 2; `mozilla::dom::BrowsingContext::PreOrderWalkVoid(std::functio` 2; `[unknown]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 340 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 324, `write [libc.so.6]` 6, `unlink [libc.so.6]` 4); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 44 ms: buckets subprocess_pipe_io 44, worker_messaging 43, ipc 43, gc_cc 28, poll_wait 12, js_ctypes 11; top self: `poll [libc.so.6]` 11; `madvise [libc.so.6]` 4; `[axiosozo-dev]` 3; `getcontext [libc.so.6]` 2; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 2
- **tab:4764** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 4, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 7, poll_wait 4, gc_cc 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::jit::Assembler::movq(js::jit::Operand const&, js::jit::R` 1; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 0; `js::jit::MaybeForwardedScriptFromCalleeToken(void*) [libxul.` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5249** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped` 1; `zen::ZenMouseTracker::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4746** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

