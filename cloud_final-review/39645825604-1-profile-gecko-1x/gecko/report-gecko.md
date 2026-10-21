# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.2 | **6.9** (main 2.4, IPDL Background 1.0, Renderer 1.0, DOM Worker 1.0, TaskCon~ller # 0.5) | Web Content 3.4, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **28.1** (Renderer 16.6, WRRende~ckend# 2.6, main 2.0, glean.dispatche 2.0, WRScene~ilder# 1.6) | Isolated Web Co 5.2, Privileged Cont 0.6, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.7** (Renderer 10.3, WRRende~ckend# 2.7, glean.dispatche 2.0, main 1.7, WRScene~ilder# 1.7) | Isolated Web Co 5.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **43.8** (Renderer 29.0, main 4.9, WRRende~ckend# 3.4, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **9.3** (main 4.8, Renderer 0.8, WRRende~ckend# 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 10.5 | — |
| trace | idle | 59.4 | 17.2 | **4.9** (main 1.9, IPDL Background 1.0, TaskCon~ller # 1.0, glean.dispatche 0.5, Renderer 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **21.7** (Renderer 10.1, main 2.3, WRRende~ckend# 2.3, glean.dispatche 2.0, WRScene~ilder# 1.3) | Isolated Web Co 5.6 | — | — |
| trace | raf-nosampler | — | — | **19.0** (Renderer 9.9, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, Compositor 1.0) | Isolated Web Co 4.2 | — | — |
| trace | scroll | 59.0 | 17.1 | **45.8** (Renderer 29.0, main 6.4, WRRende~ckend# 3.4, glean.dispatche 1.5, WRScene~ilder# 1.5) | Isolated Web Co 4.9, Web Content 0.5 | — | — |
| trace | key | — | — | **57.9** (DOM Worker 19.7, main 19.4, IPDL Background 6.4, TaskCon~ller # 2.4, glean.dispatche 1.9) | Isolated Web Co 1.3, RDD Process 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **9.7** (main 2.9, SamplerThread 2.9, TaskCon~ller # 2.4, Timer 0.5, IPDL Background 0.5) | Web Content 9.1, Isolated Web Co 4.3, Privileged Cont 1.9, Utility Process 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **32.0** (Renderer 11.7, SamplerThread 6.5, WRRende~ckend# 2.9, main 2.3, Compositor 2.3) | Isolated Web Co 11.6, Web Content 9.4, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **28.4** (Renderer 11.6, SamplerThread 6.3, WRRende~ckend# 2.6, glean.dispatche 2.0, WRScene~ilder# 2.0) | Isolated Web Co 9.6, Web Content 8.6, Socket Process 1.7, WebExtensions 1.7 | — | — |
| profile | scroll | 59.0 | 17.1 | **62.4** (Renderer 31.7, SamplerThread 8.3, main 7.3, WRRende~ckend# 4.4, SwComposite 2.4) | Isolated Web Co 10.2, Web Content 8.8, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **15.5** (main 5.9, SamplerThread 4.8, Renderer 1.3, Compositor 0.8, glean.dispatche 0.5) | Web Content 8.2, Isolated Web Co 4.3, WebExtensions 2.2, Privileged Cont 1.6 | 9.0 | — |

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

### Profile: gecko / idle

- **parent** CPU ms by thread group: main 58, DOM Worker 2, Compositor 1, IPC I/O 1, Socket 1, other 1, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 58 ms (2.7% of span): GC / CC 37, Idle 7, Other 7, JavaScript 6, DOM 0
  - JS leaf 0 / native under JS 7 / native 51; buckets: ipc 58, gc_cc 42, poll_wait 10, array_buffer_copy 3, harness_diagnostics 3, memcpy_memset 1, subprocess_pipe_io 0, json_metadata 0
  - top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2
  - GC/CC markers: GCMajor 1× 62 ms, GCSlice 5× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, poll_wait 1, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0
- **tab:3359** CPU ms by thread group: main 35, IPC I/O 7, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 35 ms (1.7% of span): Idle 25, GC / CC 6, Other 1, DOM 1, JavaScript 1, Layout 1
  - JS leaf 0 / native under JS 2 / native 33; buckets: ipc 34, poll_wait 27, gc_cc 6, harness_diagnostics 2, array_buffer_copy 2, paint_layout 1
  - top self: `poll [libc.so.6]` 26; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `JS_WrapObject(JSContext*, JS::MutableHandle<JSObject*>) [lib` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `xpc::OpaqueXrayTraits::enumerateNames(JSContext*, JS::Handle` 1; `mozilla::TaskController::AddTask(already_AddRefed<mozilla::T` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3385** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3302** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `TimerThreadWrapper::RemoveTimer(nsTimerImpl*, mozilla::detai` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 350, WRRenderBackend 80, main 69, WRSceneBuilder 60, Compositor 50, SwComposite 21, IPC I/O 12, DOM Worker 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (2.2% of span): GC / CC 31, Idle 25, JavaScript 5, Layout 4, Other 2, Graphics 1
  - JS leaf 0 / native under JS 5 / native 64; buckets: ipc 69, gc_cc 34, poll_wait 28, paint_layout 6, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `[axiosozo-dev]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 59 ms, GCSlice 6× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 350 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 83, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 51); WRRenderBackend#0 80 ms (top self: `syscall [libc.so.6]` 67, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 54 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::AllocSpace<js::gc::SmallBufferRegion, 1638` 1; `[libgcc_s.so.1]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozi` 0
- **tab:3359** CPU ms by thread group: main 214, IPC I/O 19, other 6, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 214 ms (6.9% of span): Idle 103, Graphics 42, Layout 25, Profiler 16, Other 15, JavaScript 6
  - JS leaf 0 / native under JS 12 / native 202; buckets: ipc 200, poll_wait 105, paint_layout 86, gc_cc 9, memcpy_memset 4, canvas_2d 3, harness_diagnostics 3, array_buffer_copy 2
  - top self: `poll [libc.so.6]` 104; `__lll_lock_wait [libc.so.6]` 5; `sendmsg [libc.so.6]` 4; `getcontext [libc.so.6]` 4; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 10 ms, GCSlice 6× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3302** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3263** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 333, WRRenderBackend 69, WRSceneBuilder 54, Compositor 47, main 16, SwComposite 14, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 16 ms (0.5% of span): Idle 10, JavaScript 2, DOM 2, Other 1, Graphics 1
  - JS leaf 0 / native under JS 3 / native 12; buckets: ipc 16, poll_wait 11, harness_diagnostics 3, array_buffer_copy 3, gc_cc 2, subprocess_pipe_io 1, paint_layout 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 10; `bool js::frontend::ScopeStencil::appendScopeStencilAndData<j` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `obj_assign(JSContext*, unsigned int, JS::Value*) [libxul.so]` 1; `mozilla::dom::AutoJSAPI::ReportException() [libxul.so]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 333 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 83, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 34); WRRenderBackend#0 69 ms (top self: `syscall [libc.so.6]` 57, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 49 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0
- **tab:3359** CPU ms by thread group: main 166, IPC I/O 18, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 166 ms (5.4% of span): Idle 98, Graphics 23, Layout 20, Other 14, Profiler 7, DOM 3
  - JS leaf 0 / native under JS 5 / native 161; buckets: ipc 159, poll_wait 101, paint_layout 56, canvas_2d 2, subprocess_pipe_io 1, gc_cc 1, memcpy_memset 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 99; `[]` 5; `sendmsg [libc.so.6]` 4; `write [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3385** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3263** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 638, main 144, WRRenderBackend 79, SwComposite 39, Compositor 32, WRSceneBuilder 24, IPC I/O 9, other 1, Socket 1, BgPool 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 144 ms (7.0% of span): Idle 74, GC / CC 32, Other 16, Graphics 7, Layout 6, JavaScript 6
  - JS leaf 1 / native under JS 6 / native 137; buckets: ipc 144, poll_wait 100, gc_cc 36, paint_layout 13, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 75; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `recvmsg [libc.so.6]` 4; `__lll_lock_wake [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `mozilla::ThreadEventTarget::Dispatch(already_AddRefed<nsIRun` 2
  - GC/CC markers: GCSlice 9× 27 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 638 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 207, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 101, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63); WRRenderBackend#0 79 ms (top self: `syscall [libc.so.6]` 57, `webrender::prepare::prepare_prim_for_render [libxu` 2, `webrender::batch::BatchBuilder::add_prim_to_batch ` 2); SwComposite 39 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `<firefox_on_glean::private::labeled_timing_distrib` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3359** CPU ms by thread group: main 105, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 105 ms (5.1% of span): Idle 64, Graphics 16, Other 8, GC / CC 8, Layout 3, JavaScript 3
  - JS leaf 0 / native under JS 3 / native 102; buckets: ipc 101, poll_wait 64, paint_layout 22, gc_cc 10, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 64; `sendmsg [libc.so.6]` 3; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 1; `bool gfxFont::DrawGlyphs<(gfxFont::FontComplexityT)0, (gfxFo` 1; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsI` 1; `[]` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3385** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3284** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 204, Renderer 36, WRRenderBackend 18, Compositor 18, WRSceneBuilder 14, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 204 ms (5.4% of span): Layout 44, Idle 43, GC / CC 31, Other 26, JavaScript 25, Graphics 25
  - JS leaf 3 / native under JS 29 / native 172; buckets: ipc 204, paint_layout 72, poll_wait 65, gc_cc 49, array_buffer_copy 6, harness_diagnostics 6, subprocess_pipe_io 6, memcpy_memset 5
  - top self: `poll [libc.so.6]` 48; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `recvmsg [libc.so.6]` 5; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozill` 4; `nsIFrame::GetUsedMargin() const [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3
  - GC/CC markers: GCMajor 1× 53 ms, GCSlice 6× 26 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 16, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3359** CPU ms by thread group: main 64, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 64 ms (1.7% of span): Idle 27, JavaScript 8, Layout 8, GC / CC 7, Other 6, DOM 4
  - JS leaf 0 / native under JS 6 / native 58; buckets: ipc 59, poll_wait 28, paint_layout 14, gc_cc 13, array_buffer_copy 3, harness_diagnostics 3, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 28; `sendmsg [libc.so.6]` 3; `[]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3212** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `write [libc.so.6]` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `__lll_lock_wait [libc.so.6]` 0; `JSStructuredCloneReader::JSStructuredCloneReader(js::SCInput` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3284** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

