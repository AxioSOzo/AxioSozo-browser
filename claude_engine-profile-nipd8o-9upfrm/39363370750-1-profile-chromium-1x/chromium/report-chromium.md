# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **60.0** (main 26.6, DOM Worker 14.9, Renderer 8.3, Socket Thread 1.7, StyleThread# 1.7) | AxioCEFProbe 53.1, cef:gpu-process 16.6, cef:utility 10.0, cef:renderer 8.3 | — | 550.0 |
| plain | idle | — | — | **3.4** (main 2.9, Timer 0.5) | Web Content 3.8 | — | — |
| plain | raf | 59.0 | 20.9 | **55.6** (main 23.8, DOM Worker 9.0, Renderer 7.7, SwComposite 5.8, TaskCon~ller # 3.9) | cef:renderer 9.0, cef:gpu-process 6.4, AxioCEFProbe 6.4, WebExtensions 1.0 | — | — |
| plain | scroll | 52.4 | 34.3 | **108.9** (main 51.1, DOM Worker 32.8, TaskCon~ller # 7.2, Renderer 6.7, SwComposite 4.8) | cef:gpu-process 22.2, cef:renderer 11.1, AxioCEFProbe 10.6, WebExtensions 0.5 | — | — |
| plain | key | — | — | **12.8** (main 7.1, DOM Worker 1.9, Timer 0.8, Renderer 0.8, SwComposite 0.8) | AxioCEFProbe 2.8, cef:renderer 2.1, cef:gpu-process 0.5 | 19.8 | — |
| plain | switch-to-gecko | — | — | **25.5** (main 12.7, Renderer 6.4, DOM Worker 6.4) | Isolated Web Co 12.7 | — | 131.0 |
| trace | switch-to-engine | — | — | **68.4** (Renderer 26.9, main 20.7, DOM Worker 8.3, WRRende~ckend# 4.1, glean.dispatche 2.1) | AxioCEFProbe 60.0, cef:gpu-process 18.6, cef:utility 14.5, cef:renderer 12.4 | — | 444.0 |
| trace | idle | — | — | **3.9** (main 2.9, IPC I/O Parent 0.5, Timer 0.5) | Web Content 3.3, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| trace | raf | 59.0 | 21.7 | **56.0** (main 24.5, DOM Worker 9.0, Renderer 7.4, SwComposite 5.8, TaskCon~ller # 4.8) | cef:renderer 9.3, AxioCEFProbe 7.1, cef:gpu-process 6.4, cef:zygote 0.3 | — | — |
| trace | scroll | 7.9 | 39.3 | **26.0** (main 11.7, DOM Worker 7.8, TaskCon~ller # 1.6, IPDL Background 1.2, Renderer 0.9) | cef:gpu-process 2.8, AxioCEFProbe 1.7, cef:renderer 1.4, Privileged Cont 0.2 | — | — |
| trace | key | — | — | **12.6** (main 7.1, DOM Worker 1.6, Renderer 1.1, SwComposite 0.8, Softwar~cThread 0.5) | cef:renderer 2.2, AxioCEFProbe 2.0, cef:gpu-process 0.6, WebExtensions 0.3 | 18.4 | — |
| trace | switch-to-gecko | — | — | **32.0** (main 12.8, Renderer 6.4, BgIOThr~Pool # 6.4, DOM Worker 6.4) |  | — | 131.1 |
| profile | switch-to-engine | — | — | **51.9** (main 17.9, DOM Worker 17.9, SamplerThread 7.1, Renderer 3.6, TaskCon~ller # 1.8) | AxioCEFProbe 51.9, cef:gpu-process 16.1, cef:utility 12.5, cef:renderer 10.7 | — | 496.2 |
| profile | idle | — | — | **22.2** (SamplerThread 9.0, DOM Worker 6.6, main 4.7, Timer 1.9) | Web Content 8.1, WebExtensions 1.4, Privileged Cont 1.4, Isolated Web Co 1.4 | — | — |
| profile | raf | 58.7 | 26.7 | **88.4** (main 31.9, DOM Worker 18.2, SamplerThread 11.2, Renderer 8.0, SwComposite 6.1) | cef:renderer 10.2, Web Content 8.6, cef:gpu-process 7.3, AxioCEFProbe 7.1 | — | — |
| profile | scroll | 7.3 | 65.6 | **37.7** (main 12.1, DOM Worker 11.5, SamplerThread 8.6, TaskCon~ller # 1.6, Timer 1.5) | Web Content 8.9, cef:gpu-process 3.2, AxioCEFProbe 2.0, WebExtensions 1.8 | — | — |
| profile | key | — | — | **35.8** (main 10.9, DOM Worker 9.6, SamplerThread 9.0, Timer 1.6, Renderer 1.4) | Web Content 8.5, AxioCEFProbe 2.8, cef:renderer 2.8, WebExtensions 1.9 | 22.1 | — |
| profile | switch-to-gecko | — | — | **7.0** (SamplerThread 3.5, BgIOThr~Pool # 2.4, main 0.5, DOM Worker 0.2, Renderer 0.1) | Web Content 8.4, WebExtensions 1.7, Isolated Web Co 1.7, Privileged Cont 1.6 | — | 15024.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.0 | 0.0 | 0 | 10.3 | 2524.0 | — | 10.8 | 9.6 | — | — | — | 8.87 | 2.39 | — | 0.038 |
| trace | raf | 59.6 | 0.0 | 0 | 42.6 | 696.7 | — | 14.4 | 1.6 | — | — | — | — | 0.33 | — | 0.125 |
| trace | scroll | 7.0 | 0.0 | 0 | 18.2 | 2524.0 | — | 4.1 | 8.5 | — | — | — | — | 0.18 | — | 0.070 |
| trace | key | 5.7 | 0.0 | 0 | 1.0 | 47.6 | — | 4.0 | 0.4 | — | — | — | — | 0.04 | — | 0.004 |
| profile | switch-to-engine | 3.4 | 0.0 | 0 | 8.8 | 2524.0 | — | 3.6 | 14.9 | — | — | — | 18.45 | 2.11 | — | 0.051 |
| profile | raf | 59.9 | 0.0 | 0 | 42.4 | 689.1 | — | 13.5 | 2.0 | — | — | — | — | 0.44 | — | 0.162 |
| profile | scroll | 6.9 | 0.0 | 0 | 17.7 | 2524.0 | — | 1.0 | 11.2 | — | — | — | — | 0.30 | — | 0.086 |
| profile | key | 5.7 | 0.0 | 0 | 1.0 | 47.6 | — | 5.2 | 0.8 | — | — | — | — | 0.14 | — | 0.005 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 7.5 | 0.5 | — | — | — | 0.9 | 16.9 | 17.6 |
| profile | 0.7 | 10.1 | 1.0 | — | — | — | 0.9 | 20.3 | 21.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 21.1; spawn AxioCEFProbe resolved 66.0; write hello 67.2; first stdout read resolved 287.2; write create 291.3; first large (>=64 KiB) read resolved 457.7; write frame_ack 458.3; write focus 463.1; first ImageData 466.5; first putImageData end 472.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 21.4; first stdout read resolved 29.1; write shutdown 35.2

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 54.2; spawn AxioCEFProbe resolved 95.0; write hello 97.0; first stdout read resolved 340.7; write create 343.1; first large (>=64 KiB) read resolved 512.7; write frame_ack 513.6; write focus 523.8; first ImageData 531.1; first putImageData end 542.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 28.2; first stdout read resolved 37.8; write shutdown 42.6

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 101, DOM Worker 84, Renderer 31, WRRenderBackend 6, Compositor 4, WRSceneBuilder 4, SwComposite 3, IPC I/O 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 101 ms (17.2% of span): JavaScript 39, Layout 17, Idle 17, DOM 11, Other 10, Graphics 6
  - JS leaf 9 / native under JS 47 / native 45; buckets: ipc 101, paint_layout 42, gc_cc 35, worker_messaging 31, poll_wait 18, array_buffer_copy 15, frame_surface_paint 15, subprocess_pipe_io 15
  - top self: `poll [libc.so.6]` 17; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `[axiosozo-dev]` 6; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 6; `<style::gecko::wrapper::GeckoElement as style::dom::TElement` 5; `PerformPromiseThen(JSContext*, JS::Handle<js::PromiseObject*` 4
  - WebRender/compositor threads: Renderer 31 ms (top self: `__exp2f_fma [libm.so.6]` 5, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4); WRRenderBackend#0 6 ms (top self: `syscall [libc.so.6]` 4, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 4 ms (top self: `syscall [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::wrap_prim` 1, `sched_yield [libc.so.6]` 1)
  - busiest DOM Worker 84 ms: buckets subprocess_pipe_io 84, worker_messaging 84, ipc 84, js_ctypes 39, poll_wait 35, gc_cc 34; top self: `poll [libc.so.6]` 35; `js::gc::TenuringTracer::moveString(JSString*, JSSt` 29; `read [libc.so.6]` 4; `__lll_lock_wake [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2
- **tab:4859** CPU ms by thread group: main 9, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 9 ms (1.5% of span): JavaScript 3, DOM 2, Other 1, Profiler 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 4; buckets: ipc 9, gc_cc 6, poll_wait 1, array_buffer_copy 1
  - top self: `__lll_lock_wait [libc.so.6]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `js::PropMapTable::init(JSContext*, js::LinkedPropMap*) [libx` 1; `JS::ForOfIterator::nextFromOptimizedArray(JS::MutableHandle<` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 1; `[]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:4741** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.6% of span): Idle 2, Other 1, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2, paint_layout 0, webrender_render 0
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__strnlen_avx2 [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0; `mozilla::layers::WebRenderLayerManager::DidComposite(mozilla` 0
- **tab:4854** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 90, DOM Worker 84, other 18, Socket 1, IPC I/O 0, Compositor 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 90 ms (4.2% of span): Idle 72, JavaScript 10, Other 4, DOM 3, Profiler 0
  - JS leaf 1 / native under JS 13 / native 77; buckets: ipc 90, poll_wait 75, gc_cc 9, array_buffer_copy 7, subprocess_pipe_io 5, js_ctypes 1, worker_messaging 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 73; `[unknown]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `JS::PinArrayBufferOrViewLength(JSObject*, bool) [libxul.so]` 1; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 1; `js::gc::BufferAllocator::useAvailableChunk(unsigned long, un` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 84 ms: buckets subprocess_pipe_io 84, js_ctypes 84, worker_messaging 84, ipc 84, poll_wait 84; top self: `poll [libc.so.6]` 84
- **tab:4854** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:4233** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:4741** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 0; `madvise [libc.so.6]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 929, DOM Worker 462, Renderer 235, SwComposite 180, WRRenderBackend 64, Compositor 36, other 29, WRSceneBuilder 12, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 929 ms (29.4% of span): Idle 344, JavaScript 266, GC / CC 125, Other 100, DOM 65, Profiler 20
  - JS leaf 75 / native under JS 323 / native 531; buckets: ipc 929, poll_wait 380, gc_cc 326, worker_messaging 294, subprocess_pipe_io 172, array_buffer_copy 147, paint_layout 144, memcpy_memset 137
  - top self: `poll [libc.so.6]` 348; `__memmove_avx_unaligned_erms [libc.so.6]` 122; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 63; `[unknown]` 21; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 18; `mprotect [libc.so.6]` 14
  - GC/CC markers: GCMajor 3× 395 ms, GCSlice 28× 125 ms, CCSlice 8× 22 ms, GCMinor 3× 2 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 235 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 128, `int blendTextureNearestFast<false, glsl::sampler2D` 29, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 12); SwComposite 180 ms (top self: `syscall [libc.so.6]` 154, `void scale_blit<true>(Texture&, IntRect const&, Te` 24, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - busiest DOM Worker 462 ms: buckets subprocess_pipe_io 462, worker_messaging 462, ipc 462, js_ctypes 370, poll_wait 294, gc_cc 52; top self: `poll [libc.so.6]` 294; `read [libc.so.6]` 65; `syscall [libc.so.6]` 12; `[unknown]` 8; `[axiosozo-dev]` 7
- **tab:4741** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 4, gc_cc 4, poll_wait 3
  - top self: `poll [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::NukedObjectRealm(JSObject*) [libxul.so]` 1; `[]` 0
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:4859** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4254** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 1914, DOM Worker 1450, Renderer 153, other 146, SwComposite 99, WRRenderBackend 40, Compositor 29, WRSceneBuilder 9, IPC I/O 6, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1914 ms (11.1% of span): Idle 718, JavaScript 565, Other 297, GC / CC 180, DOM 58, Graphics 41
  - JS leaf 193 / native under JS 515 / native 1206; buckets: ipc 1912, poll_wait 872, worker_messaging 559, gc_cc 531, array_buffer_copy 373, paint_layout 339, subprocess_pipe_io 322, memcpy_memset 317
  - top self: `poll [libc.so.6]` 737; `__memmove_avx_unaligned_erms [libc.so.6]` 304; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 180; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 41; `[unknown]` 34; `recvmsg [libc.so.6]` 26
  - GC/CC markers: GCMajor 6× 2461 ms, GCSlice 53× 179 ms, CCSlice 8× 24 ms, GCMinor 7× 6 ms, CC 6× 0 ms
  - WebRender/compositor threads: Renderer 153 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 103, `int blendTextureNearestFast<false, glsl::sampler2D` 15, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); SwComposite 99 ms (top self: `syscall [libc.so.6]` 90, `void scale_blit<true>(Texture&, IntRect const&, Te` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 40 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 7, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - busiest DOM Worker 1442 ms: buckets subprocess_pipe_io 1442, worker_messaging 1441, ipc 1441, js_ctypes 1104, poll_wait 947, gc_cc 184; top self: `poll [libc.so.6]` 942; `read [libc.so.6]` 141; `__memmove_avx_unaligned_erms [libc.so.6]` 102; `syscall [libc.so.6]` 48; `[axiosozo-dev]` 16
- **tab:4272** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 12 ms (0.1% of span): GC / CC 7, Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 10, gc_cc 7, poll_wait 5, memcpy_memset 1
  - top self: `poll [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JS::Value>*, char const*, ` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4173** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 8, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 8, ipc 8, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4233** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, ipc 5, gc_cc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 1; `[]` 0; `gfxPlatform::IsInLayoutAsapMode() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: chromium / key

- **parent** CPU ms by thread group: main 367, DOM Worker 233, Renderer 42, other 32, SwComposite 32, Compositor 15, WRRenderBackend 14, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 367 ms (10.0% of span): Idle 154, JavaScript 79, Layout 38, Other 29, DOM 28, Graphics 28
  - JS leaf 14 / native under JS 129 / native 224; buckets: ipc 367, poll_wait 186, gc_cc 90, paint_layout 83, worker_messaging 71, engine_stream_read 35, subprocess_pipe_io 23, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 157; `[unknown]` 12; `[axiosozo-dev]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `write [libc.so.6]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); SwComposite 32 ms (top self: `syscall [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `webrender::surface::CommandBufferTargets::init [li` 0)
  - busiest DOM Worker 233 ms: buckets subprocess_pipe_io 233, worker_messaging 232, ipc 232, js_ctypes 202, poll_wait 196, gc_cc 20; top self: `poll [libc.so.6]` 196; `syscall [libc.so.6]` 3; `mprotect [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2
- **tab:4173** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 1; `JS::GetPromiseUserInputEventHandlingState(JSObject*) [libxul` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `[unknown]` 0
- **tab:4746** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:4233** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 0

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 65, DOM Worker 26, Renderer 18, IPC I/O 6, Compositor 4, WRRenderBackend 2, other 2, WRSceneBuilder 2, SwComposite 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (0.4% of span): Layout 16, Idle 16, JavaScript 15, Other 9, DOM 5, Graphics 3
  - JS leaf 2 / native under JS 24 / native 38; buckets: ipc 65, paint_layout 23, poll_wait 19, gc_cc 12, array_buffer_copy 10, subprocess_pipe_io 6, worker_messaging 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 15; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) ` 3; `style::rule_tree::core::StrongRuleNode::ensure_child [libxul` 2; `mprotect [libc.so.6]` 2; `nsFlexContainerFrame::ReflowChildren(mozilla::ReflowInput co` 2; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 18 ms (top self: `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `ps_text_run_DEBUG_OVERDRAW_DUAL_SOURCE_BLENDING_TE` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `write [libc.so.6]` 0, `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - busiest DOM Worker 26 ms: buckets subprocess_pipe_io 26, worker_messaging 26, ipc 26, gc_cc 15, poll_wait 10, js_ctypes 10; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[axiosozo-dev]` 1; `mozilla::dom::CallbackTimeoutHandler::cycleCollect` 1
- **tab:4272** CPU ms by thread group: main 7, other 1, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 4, DOM 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 6, poll_wait 4, gc_cc 2, array_buffer_copy 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 4; `nsAtomTable::AtomizeMainThread(nsTSubstring<char16_t> const&` 1; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 1; `mmap64 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `js::jit::BaselineCompiler::emitBody() [libxul.so]` 0
- **tab:4254** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::ipc::PBackgroundChild::OnMessageReceived(IPC::Messa` 0; `PR_GetCurrentThread [libnspr4.so]` 0; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0; `[linux-vdso.so.1]` 0
- **tab:4741** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 3, Layout 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4, ipc 4
  - top self: `poll [libc.so.6]` 3; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `<firefox_on_glean::private::counter::CounterMetric as glean_` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message ` 0

