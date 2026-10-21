# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.1 | **5.9** (main 1.9, Renderer 1.5, glean.dispatche 0.5, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Web Content 2.4, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **20.1** (Renderer 11.8, main 2.0, WRRende~ckend# 1.3, SwComposite 1.3, glean.dispatche 1.0) | Isolated Web Co 2.3, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **12.1** (Renderer 5.6, WRScene~ilder# 1.0, WRRende~ckend# 1.0, SwComposite 1.0, main 0.7) | Isolated Web Co 2.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **47.8** (Renderer 37.3, SwComposite 3.0, main 2.5, WRRende~ckend# 2.5, WRScene~ilder# 1.0) | Isolated Web Co 3.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **6.1** (main 3.0, Renderer 0.8, Compositor 0.5, glean.dispatche 0.3, TaskCon~ller # 0.3) | Isolated Web Co 1.1, Web Content 0.3 | 8.5 | — |
| trace | idle | 59.0 | 17.1 | **3.5** (main 1.5, TaskCon~ller # 1.0, Renderer 1.0) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.2 | **10.3** (Renderer 3.9, WRRende~ckend# 1.3, main 1.0, glean.dispatche 1.0, SwComposite 1.0) | Isolated Web Co 2.0 | — | — |
| trace | raf-nosampler | — | — | **10.0** (Renderer 5.3, WRScene~ilder# 1.0, WRRende~ckend# 1.0, glean.dispatche 0.7, Compositor 0.7) | Isolated Web Co 2.3 | — | — |
| trace | scroll | 59.0 | 17.2 | **51.8** (Renderer 37.3, main 4.5, SwComposite 3.5, WRRende~ckend# 2.0, glean.dispatche 1.0) | Isolated Web Co 3.0 | — | — |
| trace | key | — | — | **41.9** (main 11.6, DOM Worker 11.3, IndexedDB IO # 7.8, IPDL Background 3.2, TaskCon~ller # 2.7) | Isolated Web Co 0.8, Web Content 0.3, Privileged Cont 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.1 | **5.8** (DOM Worker 1.9, SamplerThread 1.9, main 1.0, TaskCon~ller # 1.0) | Web Content 4.8, Isolated Web Co 1.5, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 59.0 | 17.2 | **14.7** (Renderer 4.6, SamplerThread 2.9, WRRende~ckend# 1.6, WRScene~ilder# 1.3, SwComposite 1.3) | Isolated Web Co 5.2, Web Content 4.6, WebExtensions 1.0, RDD Process 0.7 | — | — |
| profile | raf-nosampler | — | — | **16.3** (Renderer 6.0, SamplerThread 3.3, WRRende~ckend# 1.3, main 1.0, WRScene~ilder# 1.0) | Isolated Web Co 5.3, Web Content 4.7, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **61.0** (Renderer 38.6, main 5.4, SamplerThread 4.5, SwComposite 3.5, WRRende~ckend# 3.0) | Isolated Web Co 5.5, Web Content 4.9, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | key | — | — | **7.9** (main 2.7, SamplerThread 2.1, Renderer 0.8, IPC I/O Parent 0.5, Softwar~cThread 0.5) | Web Content 4.6, Isolated Web Co 2.5, WebExtensions 1.1, Privileged Cont 0.8 | 8.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |
| trace | idle | — | — | — | — | — | — | — | — |
| trace | raf | — | — | — | — | — | — | — | — |
| trace | raf-nosampler | — | — | — | — | — | — | — | — |
| trace | scroll | — | — | — | — | — | — | — | — |
| trace | key | — | — | — | — | — | — | — | — |
| profile | idle | — | — | — | — | — | — | — | — |
| profile | raf | — | — | — | — | — | — | — | — |
| profile | raf-nosampler | — | — | — | — | — | — | — | — |
| profile | scroll | — | — | — | — | — | — | — | — |
| profile | key | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — | — | — | — |

### Profile: gecko-2x / idle

- **parent** CPU ms by thread group: DOM Worker 34, main 31, Socket 0, IPC I/O 0, other 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 31 ms (1.5% of span): GC / CC 23, JavaScript 5, Idle 2, Profiler 1, Other 1
  - JS leaf 0 / native under JS 5 / native 26; buckets: ipc 31, gc_cc 26, harness_diagnostics 5, subprocess_pipe_io 2, poll_wait 2, array_buffer_copy 2, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `mprotect [libc.so.6]` 2; `poll [libc.so.6]` 2
  - GC/CC markers: GCSlice 5× 27 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 32 ms: buckets worker_messaging 32, ipc 32, gc_cc 32, memcpy_memset 16, poll_wait 1; top self: `madvise [libc.so.6]` 10; `unsigned long js::gc::Arena::finalize<JSString, (j` 5; `munmap [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsCycleCollector::ScanWhiteNodes(bool) [libxul.so]` 3
- **tab:3182** CPU ms by thread group: main 9, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.4% of span): Idle 8, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 8; buckets: ipc 9, poll_wait 8, harness_diagnostics 1, array_buffer_copy 1, gc_cc 1, paint_layout 0
  - top self: `poll [libc.so.6]` 8; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 0; `js::CrossCompartmentWrapper::call(JSContext*, JS::Handle<JSO` 0; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3110** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3266** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 124, WRRenderBackend 37, WRSceneBuilder 32, SwComposite 28, Compositor 25, main 22, IPC I/O 6, other 1, DOM Worker 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 22 ms (0.7% of span): Idle 14, Other 2, JavaScript 2, Layout 1, Graphics 1, Profiler 1
  - JS leaf 0 / native under JS 2 / native 20; buckets: ipc 22, poll_wait 15, paint_layout 3, harness_diagnostics 1, memcpy_memset 1, gc_cc 1, array_buffer_copy 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 14; `madvise [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, ` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 1; `js::GetFirstSubsumedFrame(JSContext*, JSPrincipals*, JS::Han` 1
  - WebRender/compositor threads: Renderer 124 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `int blendTextureNearestFast<true, glsl::sampler2D_` 5); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `webrender::render_task_graph::RenderTaskGraphBuild` 0); WRSceneBuilder#0 28 ms (top self: `syscall [libc.so.6]` 27, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, memcpy_memset 1, gc_cc 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3182** CPU ms by thread group: main 100, IPC I/O 9, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 99 ms (3.2% of span): Idle 71, Graphics 7, Other 7, Layout 5, GC / CC 5, JavaScript 3
  - JS leaf 0 / native under JS 4 / native 95; buckets: ipc 92, poll_wait 71, paint_layout 14, gc_cc 7, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1, webrender_render 1
  - top self: `poll [libc.so.6]` 70; `[]` 4; `[linux-vdso.so.1]` 1; `nsTimer::Cancel() [libxul.so]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `JS_DefineFunctions(JSContext*, JS::Handle<JSObject*>, JSFunc` 1
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3071** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3110** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ScheduleTimedOut(nsITimer*, void*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 174, WRRenderBackend 36, main 34, WRSceneBuilder 31, Compositor 25, SwComposite 22, IPC I/O 7, DOM Worker 4, other 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 34 ms (1.1% of span): GC / CC 23, Idle 7, JavaScript 1, Other 1, DOM 1, Layout 1
  - JS leaf 1 / native under JS 1 / native 32; buckets: ipc 34, gc_cc 24, poll_wait 11, harness_diagnostics 2, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 1
  - top self: `poll [libc.so.6]` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `evaluate.sandbox/promise< (chrome://remote/content/marionett` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScript` 1
  - GC/CC markers: GCMajor 1× 51 ms, GCSlice 5× 19 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 174 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 89, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 30, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 18); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 2, `mozilla::layers::APZCTreeManager::PrepareNodeForLa` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0
- **tab:3182** CPU ms by thread group: main 92, IPC I/O 9, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 92 ms (3.0% of span): Idle 67, Graphics 12, Other 5, Layout 4, GC / CC 3, Profiler 1
  - JS leaf 0 / native under JS 1 / native 91; buckets: ipc 89, poll_wait 68, paint_layout 19, gc_cc 3, canvas_2d 2, mozafterpaint_events 1, webrender_render 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 66; `[]` 2; `write [libc.so.6]` 2; `nsIContent::GetFlattenedTreeParent() const [libxul.so]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `sendmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 6× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3071** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3266** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 778, main 101, SwComposite 65, WRRenderBackend 59, Compositor 20, WRSceneBuilder 18, IPC I/O 6, other 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0, BgPool 0
  - main thread 101 ms (4.9% of span): Idle 54, GC / CC 26, JavaScript 7, Other 5, Graphics 4, Layout 3
  - JS leaf 0 / native under JS 6 / native 94; buckets: ipc 100, poll_wait 64, gc_cc 27, paint_layout 7, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 54; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, J` 2; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 7× 22 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 778 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 280, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 131, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 61); SwComposite 65 ms (top self: `syscall [libc.so.6]` 61, `__memmove_avx512_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 59 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 2)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3182** CPU ms by thread group: main 70, IPC I/O 10, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 70 ms (3.4% of span): Idle 54, Other 7, Graphics 5, JavaScript 3, DOM 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 67; buckets: ipc 69, poll_wait 55, paint_layout 9, harness_diagnostics 2, array_buffer_copy 2, gc_cc 1, subprocess_pipe_io 1, canvas_2d 0
  - top self: `poll [libc.so.6]` 55; `sendmsg [libc.so.6]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 1; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const ` 1; `JS::ForOfIterator::next(JS::MutableHandle<JS::Value>, bool*)` 1; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3110** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3071** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 92, Renderer 25, WRRenderBackend 11, Compositor 10, WRSceneBuilder 8, IPC I/O 5, SwComposite 5, other 1, Socket 1, DOM Worker 1, BgPool 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 92 ms (2.5% of span): Idle 36, Layout 18, Other 13, Graphics 13, JavaScript 9, DOM 3
  - JS leaf 0 / native under JS 11 / native 81; buckets: ipc 92, poll_wait 44, paint_layout 33, gc_cc 5, subprocess_pipe_io 4, memcpy_memset 2, array_buffer_copy 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 36; `mozilla::detail::MutexImpl::lock() [axiosozo-dev]` 2; `writev [libc.so.6]` 2; `nsLineLayout::AllowForStartMargin(nsLineLayout::PerFrameData` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1
  - WebRender/compositor threads: Renderer 25 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `syscall [libc.so.6]` 2); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 0, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 8 ms (top self: `syscall [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `close [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 0, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 0
- **tab:3182** CPU ms by thread group: main 43, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (1.2% of span): Idle 20, Other 6, GC / CC 6, JavaScript 4, Layout 3, Graphics 2
  - JS leaf 0 / native under JS 5 / native 38; buckets: ipc 39, poll_wait 20, gc_cc 8, paint_layout 8, harness_diagnostics 2, array_buffer_copy 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 20; `[]` 2; `sendmsg [libc.so.6]` 2; `profiler_capture_backtrace_into(mozilla::ProfileChunkedBuffe` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `void js::Scope::applyScopeDataTyped<js::Scope::traceChildren` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3016** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 4, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 4; `mozilla::dom::PWindowGlobalParent::SendRawMessage(mozilla::d` 0; `WriteStructuredClone(JSContext*, JS::Handle<JS::Value>, JSSt` 0; `sendmsg [libc.so.6]` 0; `js::InitFunctionEnvironmentObjects(JSContext*, js::AbstractF` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3071** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

