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

## chromium (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **47.9** (main 20.2, Renderer 12.6, DOM Worker 10.1, WRScene~ilder# 2.5, WRRende~ckend# 2.5) | AxioCEFProbe 45.3, cef:gpu-process 15.1, cef:utility 10.0, cef:zygote 5.0 | — | 364.2 |
| plain | idle | — | — | **4.9** (main 2.4, DOM Worker 1.5, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 1.9 | — | — |
| plain | raf | 60.0 | 23.0 | **16.1** (main 6.2, Renderer 2.0, DOM Worker 2.0, WRRende~ckend# 1.3, Compositor 1.0) | cef:renderer 7.8, cef:gpu-process 3.9, AxioCEFProbe 2.9 | — | — |
| plain | raf-nosampler | — | — | **12.3** (main 3.7, DOM Worker 2.3, Renderer 1.3, WRRende~ckend# 1.0, Backgro~Pool # 1.0) | cef:renderer 8.4, cef:gpu-process 4.6, AxioCEFProbe 3.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.0 | 23.7 | **29.7** (main 14.8, DOM Worker 4.9, Renderer 2.5, TaskCon~ller # 1.5, WRRende~ckend# 1.5) | cef:gpu-process 15.3, cef:renderer 9.5, AxioCEFProbe 6.5 | — | — |
| plain | key | — | — | **10.3** (main 5.8, DOM Worker 1.1, Timer 0.8, Renderer 0.8, glean.dispatche 0.6) | cef:renderer 1.9, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 10.9 | — |
| plain | switch-to-gecko | — | — | **46.3** (main 19.9, Renderer 6.6, Compositor 6.6, BgIOThr~Pool # 6.6, DOM Worker 6.6) |  | — | 129.9 |
| trace | switch-to-engine | — | — | **51.8** (main 25.9, Renderer 19.4, WRRende~ckend# 6.5) | AxioCEFProbe 45.3, cef:gpu-process 25.9, cef:renderer 19.4, cef:utility 12.9 | — | 134.7 |
| trace | idle | — | — | **2.9** (main 1.9, IPC I/O Parent 0.5, Timer 0.5) | Web Content 2.4, AxioCEFProbe 2.0 | — | — |
| trace | raf | 59.3 | 22.7 | **50.5** (DOM Worker 17.6, main 16.6, IPDL Background 4.6, TaskCon~ller # 2.0, glean.dispatche 1.6) | cef:renderer 8.8, cef:gpu-process 3.9, AxioCEFProbe 3.6, WebExtensions 0.3 | — | — |
| trace | raf-nosampler | — | — | **16.6** (main 6.0, DOM Worker 3.3, TaskCon~ller # 1.3, Renderer 1.3, WRRende~ckend# 1.3) | cef:renderer 7.3, cef:gpu-process 4.3, AxioCEFProbe 4.0 | — | — |
| trace | scroll | 60.2 | 22.8 | **32.4** (main 15.9, DOM Worker 5.0, TaskCon~ller # 2.5, Renderer 2.0, WRRende~ckend# 1.5) | cef:gpu-process 15.9, cef:renderer 9.0, AxioCEFProbe 5.5 | — | — |
| trace | key | — | — | **10.1** (main 5.5, DOM Worker 1.4, Renderer 0.8, glean.dispatche 0.6, Timer 0.3) | AxioCEFProbe 1.7, cef:renderer 1.7, cef:gpu-process 0.6 | 10.8 | — |
| trace | switch-to-gecko | — | — | **41.4** (main 20.7, TaskCon~ller # 6.9, Renderer 6.9, BgIOThr~Pool # 6.9) | Isolated Web Co 6.9 | — | 124.1 |
| profile | switch-to-engine | — | — | **98.8** (main 45.6, Renderer 15.2, DOM Worker 15.2, glean.dispatche 7.6, WRRende~ckend# 7.6) | Web Content 45.6, AxioCEFProbe 38.0, cef:renderer 22.8 | — | 102.9 |
| profile | idle | — | — | **18.2** (main 5.7, SamplerThread 4.8, DOM Worker 3.3, TaskCon~ller # 2.9, Timer 1.0) | Web Content 4.3, Privileged Cont 1.5, WebExtensions 1.0, Utility Process 1.0 | — | — |
| profile | raf | 60.0 | 20.6 | **28.5** (main 7.2, SamplerThread 7.2, DOM Worker 6.2, Renderer 2.0, WRRende~ckend# 1.3) | cef:renderer 7.5, Web Content 5.2, cef:gpu-process 3.3, AxioCEFProbe 3.3 | — | — |
| profile | raf-nosampler | — | — | **26.6** (DOM Worker 7.0, SamplerThread 6.3, main 5.3, Renderer 1.7, WRRende~ckend# 1.3) | cef:renderer 7.7, Web Content 5.3, cef:gpu-process 5.0, AxioCEFProbe 3.3 | — | — |
| profile | scroll | 60.1 | 20.7 | **44.1** (main 16.8, DOM Worker 9.9, SamplerThread 7.4, Renderer 2.0, WRRende~ckend# 1.5) | cef:gpu-process 15.8, cef:renderer 8.9, AxioCEFProbe 5.5, Web Content 4.4 | — | — |
| profile | key | — | — | **23.7** (main 7.7, SamplerThread 5.5, DOM Worker 5.0, Renderer 1.4, Timer 1.1) | Web Content 5.6, cef:renderer 1.9, WebExtensions 1.7, Privileged Cont 1.1 | 12.7 | — |
| profile | switch-to-gecko | — | — | **44.6** (main 19.1, DOM Worker 12.7, Renderer 6.4, BgIOThr~Pool # 6.4) | Isolated Web Co 6.4 | — | 131.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 11.5 | 0.0 | 0 | 0.0 | — | — | 6.9 | 0.0 | — | 0.56 | 1.31 | — | — | — | — | — | 0.015 |
| trace | raf | 59.3 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.09 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.11 | 0.10 | — | — | — | — | — | 0.007 |
| trace | scroll | 59.6 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | 0.15 | 0.09 | — | — | — | — | — | 0.006 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.0 | 0.0 | — | 0.31 | 0.08 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 13.1 | 0.0 | 0 | 0.0 | — | — | 5.3 | 0.0 | — | 1.04 | 0.62 | — | — | — | — | — | 0.008 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.10 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.11 | 0.12 | — | — | — | — | — | 0.008 |
| profile | scroll | 59.2 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | 0.16 | 0.11 | — | — | — | — | — | 0.007 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.2 | 0.0 | — | 0.36 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.384 | 0.493 | 0.0018 | 0.0024 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 185 | 185 | 0.029 | 0.052 | 0.0017 | 0.0031 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.039 | 0.058 | 0.0023 | 0.0035 |
| plain | scroll | memfd | native | 119 | 119 | 0.088 | 0.107 | 0.0051 | 0.0063 |
| plain | key | memfd | native | 21 | 21 | 0.008 | 0.050 | 0.0000 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.345 | 0.755 | 0.0040 | 0.0087 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 184 | 184 | 0.030 | 0.056 | 0.0018 | 0.0034 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.043 | 0.063 | 0.0026 | 0.0038 |
| trace | scroll | memfd | native | 121 | 121 | 0.100 | 0.123 | 0.0060 | 0.0073 |
| trace | key | memfd | native | 21 | 21 | 0.009 | 0.044 | 0.0001 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.422 | 0.840 | 0.0055 | 0.0110 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.031 | 0.055 | 0.0018 | 0.0033 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.041 | 0.065 | 0.0025 | 0.0039 |
| profile | scroll | memfd | native | 121 | 121 | 0.091 | 0.118 | 0.0054 | 0.0070 |
| profile | key | memfd | native | 21 | 21 | 0.010 | 0.046 | 0.0001 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.0 | 0.0 | — | 0.41 | 0.55 | — | — | 5.5 | 7.4 | 12.8 |
| profile | 0.6 | 8.0 | 0.0 | — | 0.36 | 0.65 | — | — | 5.2 | 9.2 | 14.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 43.8; write create 45.2; first frame applied (native receiver) 149.9; write frame_ack 152.4; write focus 156.1

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 18.7; first stdout read resolved 23.6; write shutdown 27.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 31.3; first stdout read resolved 37.3; first frame applied (native receiver) 116.7; write frame_ack 117.8; write focus 125.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 20.3; first stdout read resolved 26.7; write shutdown 32.0

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 53, Renderer 14, DOM Worker 10, WRRenderBackend 3, WRSceneBuilder 2, Compositor 2, BgPool 2, IPC I/O 1, SwComposite 1, Socket 0, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 53 ms (35.1% of span): JavaScript 17, Layout 16, DOM 7, Graphics 7, Idle 6, Other 1
  - JS leaf 1 / native under JS 27 / native 26; buckets: ipc 53, paint_layout 28, gc_cc 19, array_buffer_copy 11, harness_diagnostics 8, poll_wait 6, subprocess_pipe_io 5, worker_messaging 3
  - top self: `poll [libc.so.6]` 6; `mozilla::StyleGenericBorderImageSideWidth<mozilla::StyleLeng` 5; `js::frontend::TokenStreamSpecific<char16_t, js::frontend::Pa` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsTArrayInfallibleAllocator::ResultTypeProxy nsTArray_base<n` 3; `[unknown]` 2
  - WebRender/compositor threads: Renderer 14 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `webrender::quad::prepare_quad_impl [libxul.so]` 0); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `std::vector<unsigned char, std::allocator<unsigned` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 9 ms: buckets subprocess_pipe_io 9, worker_messaging 9, ipc 9, js_ctypes 8, poll_wait 8; top self: `poll [libc.so.6]` 8; `[unknown]` 0; `read [libc.so.6]` 0
- **tab:4163** CPU ms by thread group: main 33, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 33 ms (28.9% of span): Other 25, JavaScript 4, Profiler 2, Idle 1, GC / CC 0, DOM 0
  - JS leaf 0 / native under JS 4 / native 29; buckets: ipc 25, gc_cc 11, array_buffer_copy 9, subprocess_pipe_io 5, poll_wait 1, image_container 1, memcpy_memset 0
  - top self: `[libfontconfig.so.1]` 3; `[libexpat.so.1]` 3; `__powf_fma [libm.so.6]` 3; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Pr` 2; `[]` 2; `mozilla::detail::nsTStringRepr<char>::LowerCaseEqualsASCII(c` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3973** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.7% of span): Idle 2, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1, gc_cc 0
  - top self: `poll [libc.so.6]` 2; `mozilla::GetDisplayPortFromMarginsData(nsIContent*, mozilla:` 1; `mozilla::glean::HistogramIdForMetric(unsigned int) [libxul.s` 0; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4158** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 119, DOM Worker 34, other 11, BgPool 2, IPC I/O 0, Socket 0, ImageIO 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 119 ms (5.6% of span): GC / CC 54, Idle 50, JavaScript 8, Other 4, DOM 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 112; buckets: ipc 119, gc_cc 58, poll_wait 54, array_buffer_copy 5, harness_diagnostics 5, memcpy_memset 2, subprocess_pipe_io 0, worker_messaging 0
  - top self: `poll [libc.so.6]` 52; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3
  - GC/CC markers: GCMajor 2× 848 ms, GCSlice 15× 49 ms, CCSlice 3× 9 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #3 1 ms (top self: `write [libc.so.6]` 1, `open64 [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 34 ms: buckets subprocess_pipe_io 34, worker_messaging 34, ipc 34, js_ctypes 33, poll_wait 33; top self: `poll [libc.so.6]` 33; `getcontext [libc.so.6]` 0
- **tab:4158** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3414** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 208, DOM Worker 136, Renderer 48, WRRenderBackend 38, Compositor 26, BgPool 21, SwComposite 20, other 18, ImageBridge 11, WRSceneBuilder 6, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 208 ms (6.7% of span): Idle 154, JavaScript 31, DOM 10, Other 9, Profiler 2, GC / CC 2
  - JS leaf 5 / native under JS 35 / native 168; buckets: ipc 208, poll_wait 157, gc_cc 38, engine_stream_read 20, worker_messaging 19, json_metadata 11, subprocess_pipe_io 9, array_buffer_copy 8
  - top self: `poll [libc.so.6]` 153; `[unknown]` 5; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 42, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 35, `webrender::tile_cache::TileCacheInstance::update_p` 0, `webrender::clip::ClipStore::build_clip_chain_insta` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 21 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `mozilla::TaskQueue::MaybeResolveShutdown() [libxul` 0); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `EmptyCString() [libxul.so]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 136 ms: buckets subprocess_pipe_io 136, worker_messaging 136, ipc 136, js_ctypes 130, poll_wait 128, gc_cc 2; top self: `poll [libc.so.6]` 128; `[unknown]` 2; `[axiosozo-dev]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0
- **tab:3973** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, gc_cc 4, poll_wait 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 2; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `CCGraphBuilder::DescribeGCedNode(bool, char const*, unsigned` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `mozilla::dom::Document::cycleCollection::Trace(void*, TraceC` 1; `nsGlobalWindowOuter::cycleCollection::CanSkipReal(void*, boo` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3978** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: main 142, DOM Worker 136, Renderer 48, WRRenderBackend 38, Compositor 26, BgPool 26, SwComposite 20, ImageBridge 11, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 142 ms (4.7% of span): Idle 95, JavaScript 32, Other 9, DOM 6, Profiler 1
  - JS leaf 5 / native under JS 33 / native 105; buckets: ipc 142, poll_wait 100, gc_cc 40, worker_messaging 21, engine_stream_read 20, json_metadata 16, subprocess_pipe_io 10, array_buffer_copy 6
  - top self: `poll [libc.so.6]` 96; `[unknown]` 8; `recvmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::jit::UnaryArithIRGenerator::UnaryArithIRGenerator(JSCont` 1; `ptrToUint8Array (resource://gre/modules/subprocess/subproces` 1
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 40, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `webrender::frame_builder::FrameBuilder::build [lib` 1, `sched_yield [libc.so.6]` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 25 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `non-virtual thunk to mozilla::layers::ImageBridgeC` 0); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[axiosozo-dev]` 0, `mozilla::runnable_args_memfn<RefPtr<mozilla::layer` 0); BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 136 ms: buckets subprocess_pipe_io 136, worker_messaging 136, ipc 136, js_ctypes 127, poll_wait 125, gc_cc 3; top self: `poll [libc.so.6]` 125; `mozilla::EventListenerManager::HandleEventSingleLi` 1; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3973** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, gc_cc 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `mmap64 [libc.so.6]` 0; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3483** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 319, DOM Worker 157, Renderer 35, BgPool 29, WRRenderBackend 28, Compositor 19, SwComposite 13, other 12, ImageBridge 8, WRSceneBuilder 5, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 319 ms (15.6% of span): Idle 197, JavaScript 58, Other 36, DOM 12, Graphics 7, Layout 6
  - JS leaf 9 / native under JS 55 / native 255; buckets: ipc 319, poll_wait 243, gc_cc 53, worker_messaging 31, paint_layout 26, subprocess_pipe_io 17, engine_stream_read 15, array_buffer_copy 13
  - top self: `poll [libc.so.6]` 198; `[unknown]` 9; `write [libc.so.6]` 7; `recvmsg [libc.so.6]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - WebRender/compositor threads: Renderer 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 29, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 1); WRRenderBackend#0 28 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 13 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 29 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 27, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `mozilla::layers::BufferTextureData::BorrowMappedDa` 0); ImageBridgeChld 8 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8, `mozilla::layers::TextureClientRecycleAllocator::Re` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 157 ms: buckets subprocess_pipe_io 157, worker_messaging 157, ipc 157, js_ctypes 140, poll_wait 136, gc_cc 8; top self: `poll [libc.so.6]` 136; `[axiosozo-dev]` 4; `mozilla::dom::WorkerPrivate::SetGCTimerMode(mozill` 2; `__lll_lock_wait [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
- **tab:3483** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `TimerThread::RemoveTimer(nsTimerImpl*, mozilla::detail::Base` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3978** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3973** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 258, DOM Worker 105, Renderer 34, other 20, WRRenderBackend 12, Compositor 11, SwComposite 10, WRWorker 9, WRSceneBuilder 7, BgPool 2, ImageBridge 1, IPC I/O 1, Socket 0, ImageIO 0, Canvas 0
  - main thread 258 ms (7.1% of span): Idle 96, JavaScript 58, Layout 30, Other 23, Graphics 22, DOM 16
  - JS leaf 9 / native under JS 98 / native 151; buckets: ipc 258, poll_wait 122, gc_cc 74, paint_layout 62, worker_messaging 48, engine_stream_read 22, subprocess_pipe_io 19, array_buffer_copy 17
  - top self: `poll [libc.so.6]` 96; `[axiosozo-dev]` 9; `[unknown]` 7; `write [libc.so.6]` 4; `mprotect [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: CCSlice 1× 3 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `hypotf@@GLIBC_2.35 [libm.so.6]` 2); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 11, `webrender::batch::AlphaBatchBuilder::build [libxul` 0, `webrender::render_task_graph::RenderTaskGraphBuild` 0); SwComposite 10 ms (top self: `syscall [libc.so.6]` 9, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `mozilla::layers::SharedRGBImage::RecycleAllocator(` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, worker_messaging 101, ipc 101, js_ctypes 97, poll_wait 93, array_buffer_copy 1; top self: `poll [libc.so.6]` 93; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::ctypes::ConvertToJS(JSContext*, JS::Handle<JSO` 1; `read [libc.so.6]` 1; `getcontext [libc.so.6]` 1
- **tab:3414** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 4, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 4, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 4; `mozilla::dom::JSIPCValueUtils::FromJSVal(mozilla::dom::JSIPC` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 0; `_registerShims/< (moz-extension://9a310967-e580-48bf-b3e8-4e` 0; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4158** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4163** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 35, Renderer 10, BgPool 8, DOM Worker 6, WRRenderBackend 2, Compositor 1, WRSceneBuilder 1, SwComposite 0, IPC I/O 0, Socket 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 35 ms (20.1% of span): Layout 13, JavaScript 10, Idle 6, Graphics 3, DOM 2, Other 1
  - JS leaf 0 / native under JS 22 / native 13; buckets: ipc 35, paint_layout 17, harness_diagnostics 7, array_buffer_copy 7, poll_wait 6, gc_cc 6, worker_messaging 3, engine_stream_read 1
  - top self: `poll [libc.so.6]` 6; `mozilla::AbsoluteContainingBlock::PrepareAbsoluteFrames(nsCo` 3; `style::properties::cascade::iter_declarations [libxul.so]` 2; `[axiosozo-dev]` 2; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 1
  - WebRender/compositor threads: Renderer 10 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 8 ms (top self: `unlink [libc.so.6]` 6, `fstatat64 [libc.so.6]` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `syscall [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 6 ms: buckets subprocess_pipe_io 6, worker_messaging 6, ipc 6, poll_wait 6, js_ctypes 5, array_buffer_copy 0; top self: `poll [libc.so.6]` 5; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::jit::JitRuntime::freeIonOsrTempData() [libxul.` 0; `write [libc.so.6]` 0
- **tab:3973** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.9% of span): Idle 3, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `PollWrapper(_GPollFD*, unsigned int, int) [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3414** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.3% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3461** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **117.0** (Renderer 55.9, main 40.7, Softwar~cThread 5.1, WRScene~ilder# 5.1, WRRende~ckend# 5.1) | AxioCEFProbe 30.5, cef:renderer 25.4, cef:gpu-process 5.1 | — | 141.0 |
| plain | idle | — | — | **6.3** (main 3.8, Timer 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 2.9, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 20.8 | **27.6** (main 8.1, Renderer 4.5, SwComposite 3.2, DOM Worker 3.2, Backgro~Pool # 2.6) | cef:gpu-process 13.5, cef:renderer 11.3, AxioCEFProbe 8.7, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **31.7** (main 8.3, Renderer 4.6, SwComposite 3.3, DOM Worker 3.3, Backgro~Pool # 3.0) | cef:gpu-process 15.9, cef:renderer 11.6, AxioCEFProbe 10.0, Web Content 0.3 | — | — |
| plain | scroll | 59.9 | 21.0 | **47.7** (main 18.9, DOM Worker 7.7, Backgro~Pool # 7.3, Renderer 4.4, SwComposite 2.9) | cef:gpu-process 55.7, cef:renderer 15.0, AxioCEFProbe 14.6, Web Content 0.5 | — | — |
| plain | key | — | — | **47.7** (main 15.1, DOM Worker 11.5, IndexedDB IO # 6.8, Renderer 3.0, IPDL Background 2.5) | AxioCEFProbe 2.5, cef:renderer 2.2, cef:gpu-process 0.8, Utility Process 0.3 | 12.7 | — |
| plain | switch-to-gecko | — | — | **173.9** (DOM Worker 67.4, main 56.1, Renderer 16.8, glean.dispatche 5.6, IPC I/O Parent 5.6) |  | — | 135.7 |
| trace | switch-to-engine | — | — | **118.0** (Renderer 78.7, main 31.5, Timer 3.9, DOM Worker 3.9) | AxioCEFProbe 51.0, cef:gpu-process 35.4, cef:utility 15.7, cef:renderer 15.7 | — | 216.1 |
| trace | idle | — | — | **10.1** (main 5.2, DOM Worker 2.4, Timer 1.0, TaskCon~ller # 1.0, IPC I/O Parent 0.5) | Web Content 3.3, AxioCEFProbe 3.0 | — | — |
| trace | raf | 60.1 | 20.9 | **27.3** (main 9.0, Renderer 4.5, SwComposite 3.2, DOM Worker 3.2, Backgro~Pool # 2.9) | cef:gpu-process 13.8, cef:renderer 11.0, AxioCEFProbe 9.3 | — | — |
| trace | raf-nosampler | — | — | **24.1** (main 5.3, Renderer 4.3, DOM Worker 3.3, Backgro~Pool # 3.0, SwComposite 3.0) | cef:gpu-process 15.3, cef:renderer 11.9, AxioCEFProbe 9.6 | — | — |
| trace | scroll | 60.0 | 20.9 | **50.3** (main 19.9, DOM Worker 8.3, Backgro~Pool # 6.8, Renderer 4.4, SwComposite 2.9) | cef:gpu-process 57.3, AxioCEFProbe 14.2, cef:renderer 13.6 | — | — |
| trace | key | — | — | **15.5** (main 8.0, Renderer 2.5, DOM Worker 1.4, Timer 0.8, SwComposite 0.8) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 12.9 | — |
| trace | switch-to-gecko | — | — | **1.7** (main 0.7, TaskCon~ller # 0.3, Renderer 0.2, glean.dispatche 0.1, DOM Worker 0.1) | Privileged Cont 0.2, Web Content 0.1, Isolated Web Co 0.1 | — | 15020.7 |
| profile | switch-to-engine | — | — | **87.8** (main 35.1, Renderer 30.7, DOM Worker 8.8, SamplerThread 8.8, SwComposite 4.4) | AxioCEFProbe 35.2, cef:renderer 17.6, Web Content 13.2, cef:gpu-process 8.8 | — | 160.8 |
| profile | idle | — | — | **26.2** (SamplerThread 9.5, DOM Worker 8.6, main 5.2, Timer 1.9, glean.dispatche 0.5) | Web Content 10.5, AxioCEFProbe 3.0, Isolated Web Co 2.4, WebExtensions 1.9 | — | — |
| profile | raf | 60.0 | 21.3 | **57.9** (main 12.8, DOM Worker 12.2, SamplerThread 11.9, Renderer 4.8, SwComposite 3.5) | cef:gpu-process 16.6, cef:renderer 12.8, Web Content 10.6, AxioCEFProbe 9.2 | — | — |
| profile | raf-nosampler | — | — | **50.0** (DOM Worker 12.5, SamplerThread 10.6, main 7.3, Renderer 5.6, Backgro~Pool # 4.0) | cef:gpu-process 17.2, cef:renderer 12.9, Web Content 10.9, AxioCEFProbe 10.0 | — | — |
| profile | scroll | 59.9 | 20.9 | **78.8** (main 25.3, DOM Worker 16.7, SamplerThread 12.4, Backgro~Pool # 7.6, Renderer 4.8) | cef:gpu-process 64.6, AxioCEFProbe 13.3, cef:renderer 13.3, Web Content 10.5 | — | — |
| profile | key | — | — | **40.2** (main 11.2, DOM Worker 9.6, SamplerThread 9.6, Renderer 3.0, Timer 1.9) | Web Content 9.6, AxioCEFProbe 2.7, WebExtensions 2.5, cef:renderer 2.5 | 15.5 | — |
| profile | switch-to-gecko | — | — | **5.5** (SamplerThread 4.0, DOM Worker 0.4, main 0.3, Renderer 0.2, IPC I/O Parent 0.1) | Web Content 9.1, WebExtensions 2.3, Isolated Web Co 1.7, Privileged Cont 1.6 | — | 16472.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 9.4 | 0.0 | 0 | 0.0 | — | — | 2.7 | 0.0 | — | 1.29 | 0.16 | — | — | — | — | — | 0.033 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.30 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 59.6 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.30 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 58.6 | 0.0 | 0 | 0.0 | — | — | 11.7 | 0.0 | — | 0.62 | 0.12 | — | — | — | — | — | 0.007 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | 0.22 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.3 | 0.0 | 0 | 0.0 | — | — | 11.8 | 0.0 | — | 2.62 | 0.83 | — | — | — | — | — | 0.006 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.35 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.35 | 0.17 | — | — | — | — | — | 0.012 |
| profile | scroll | 58.4 | 0.0 | 0 | 0.0 | — | — | 7.5 | 0.0 | — | 0.76 | 0.16 | — | — | — | — | — | 0.012 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.9 | 0.0 | — | 0.50 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.589 | 2.133 | 0.0142 | 0.0190 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.176 | 0.231 | 0.0106 | 0.0139 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.211 | 0.263 | 0.0126 | 0.0158 |
| plain | scroll | memfd | native | 121 | 120 | 0.592 | 0.600 | 0.0342 | 0.0344 |
| plain | key | memfd | native | 21 | 21 | 0.057 | 0.166 | 0.0003 | 0.0009 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 1.244 | 1.613 | 0.0117 | 0.0151 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 188 | 188 | 0.177 | 0.226 | 0.0107 | 0.0136 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.202 | 0.246 | 0.0121 | 0.0147 |
| trace | scroll | memfd | native | 122 | 122 | 0.537 | 0.566 | 0.0314 | 0.0332 |
| trace | key | memfd | native | 21 | 21 | 0.042 | 0.147 | 0.0002 | 0.0008 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.921 | 2.718 | 0.0141 | 0.0199 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.211 | 0.265 | 0.0127 | 0.0159 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.225 | 0.275 | 0.0135 | 0.0165 |
| profile | scroll | memfd | native | 124 | 124 | 0.628 | 0.653 | 0.0367 | 0.0381 |
| profile | key | memfd | native | 21 | 21 | 0.063 | 0.168 | 0.0004 | 0.0010 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 8.3 | 0.0 | — | 0.21 | 0.41 | — | — | 10.4 | 9.3 | 19.8 |
| profile | 0.6 | 10.7 | 0.0 | — | 0.48 | 0.81 | — | — | 11.4 | 12.1 | 23.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 52.0; write create 84.4; first frame applied (native receiver) 260.0; write frame_ack 270.1; write focus 278.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 24.9; first stdout read resolved 32.2; write shutdown 39.1

Switch timeline (profile, switch-to-engine, ms after the window start): write create 61.0; first stdout read resolved 73.1; first frame applied (native receiver) 196.5; write frame_ack 197.8; write focus 209.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 36.1; first stdout read resolved 45.1; write shutdown 50.6

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 76, main 66, DOM Worker 16, BgPool 7, SwComposite 6, WRRenderBackend 5, Compositor 3, WRSceneBuilder 2, IPC I/O 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 66 ms (24.3% of span): Layout 26, Idle 16, JavaScript 8, Other 6, Graphics 4, DOM 4
  - JS leaf 1 / native under JS 27 / native 38; buckets: ipc 66, paint_layout 31, gc_cc 18, poll_wait 18, array_buffer_copy 11, worker_messaging 5, harness_diagnostics 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 17; `nsFlexContainerFrame::FlexLine::PositionItemsInMainAxis(mozi` 8; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 4; `nsSplittableFrame::FirstContinuation() const [libxul.so]` 4; `[axiosozo-dev]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 75 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 31, `hypotf@@GLIBC_2.35 [libm.so.6]` 9, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 8); SwComposite 6 ms (top self: `syscall [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 7 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 4, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 14, poll_wait 14, array_buffer_copy 0; top self: `poll [libc.so.6]` 14; `[axiosozo-dev]` 1; `mozilla::dom::AutoJSAPI::ReportException() [libxul` 1; `js::BoundFunctionObject::createWithTemplate(JSCont` 0; `__lll_lock_wake [libc.so.6]` 0
- **tab:4318** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (18.4% of span): Other 37, JavaScript 4, Profiler 3, DOM 3, Idle 1
  - JS leaf 0 / native under JS 4 / native 43; buckets: ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 4, memcpy_memset 2, poll_wait 1, canvas_2d 1
  - top self: `[]` 4; `__lll_lock_wake [libc.so.6]` 3; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 3; `[libfontconfig.so.1]` 3; `__strlen_avx2 [libc.so.6]` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4329** CPU ms by thread group: main 21, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (7.9% of span): Other 9, DOM 5, Profiler 3, JavaScript 3, GC / CC 1, Idle 1
  - JS leaf 1 / native under JS 5 / native 15; buckets: ipc 21, gc_cc 13, subprocess_pipe_io 6, memcpy_memset 1, array_buffer_copy 1, poll_wait 1
  - top self: `__lll_lock_wake [libc.so.6]` 2; `[]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `regex_automata::meta::regex::Builder::build [libxul.so]` 2; `mozilla::Vector<js::frontend::ScriptStencil, 1ul, js::System` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4169** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.9% of span): Idle 1, Other 1, Graphics 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 103, main 97, other 20, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 97 ms (4.6% of span): Idle 82, JavaScript 7, Other 7, Profiler 2, DOM 0
  - JS leaf 0 / native under JS 8 / native 89; buckets: ipc 97, poll_wait 86, harness_diagnostics 7, array_buffer_copy 4, gc_cc 3, subprocess_pipe_io 2, json_metadata 1, worker_messaging 1
  - top self: `poll [libc.so.6]` 82; `recvmsg [libc.so.6]` 2; `[unknown]` 1; `[axiosozo-dev]` 1; `PerformPromiseRace(JSContext*, PromiseForOfIterator&, JS::Ha` 1; `js::ScriptSource::tryCompressOffThread(JSContext*) [libxul.s` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 103 ms: buckets subprocess_pipe_io 103, js_ctypes 103, worker_messaging 103, ipc 103, poll_wait 103; top self: `poll [libc.so.6]` 103
- **tab:4329** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3674** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 373, DOM Worker 287, Renderer 144, BgPool 129, SwComposite 105, WRRenderBackend 52, Compositor 40, other 33, ImageBridge 18, WRSceneBuilder 8, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 373 ms (11.8% of span): Idle 248, JavaScript 64, Other 34, DOM 16, Profiler 8, GC / CC 3
  - JS leaf 8 / native under JS 70 / native 295; buckets: ipc 373, poll_wait 270, gc_cc 70, worker_messaging 34, engine_stream_read 33, json_metadata 20, subprocess_pipe_io 15, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 252; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 144 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `__memmove_avx_unaligned_erms [libc.so.6]` 32, `syscall [libc.so.6]` 5); SwComposite 105 ms (top self: `syscall [libc.so.6]` 94, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `Composite [libxul.so]` 1); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 95 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); BgIOThreadPool #4 34 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 31, `write [libc.so.6]` 1, `open64 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `[axiosozo-dev]` 0, `mozilla::ipc::MessageChannel::OnMessageReceivedFro` 0)
  - busiest DOM Worker 287 ms: buckets subprocess_pipe_io 287, worker_messaging 287, ipc 287, js_ctypes 268, poll_wait 264, gc_cc 7; top self: `poll [libc.so.6]` 264; `__lll_lock_wake [libc.so.6]` 2; `[axiosozo-dev]` 2; `write [libc.so.6]` 2; `[unknown]` 1
- **tab:3692** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Other 1, Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 273, main 213, Renderer 141, SwComposite 105, BgPool 98, WRRenderBackend 51, Compositor 40, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 213 ms (7.0% of span): Idle 115, JavaScript 59, Other 18, DOM 17, Profiler 2, GC / CC 2
  - JS leaf 7 / native under JS 64 / native 142; buckets: ipc 212, poll_wait 123, gc_cc 75, engine_stream_read 38, worker_messaging 35, json_metadata 20, native_receiver 16, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 116; `[unknown]` 11; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 4; `recvmsg [libc.so.6]` 4; `write [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 141 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 72, `__memmove_avx_unaligned_erms [libc.so.6]` 41, `syscall [libc.so.6]` 8); SwComposite 105 ms (top self: `syscall [libc.so.6]` 97, `__memmove_avx_unaligned_erms [libc.so.6]` 7); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 98 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `[linux-vdso.so.1]` 1); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `[axiosozo-dev]` 0, `IPC::StringFromIPCMessageType(unsigned int) [libxu` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 273 ms: buckets subprocess_pipe_io 273, worker_messaging 273, ipc 273, js_ctypes 255, poll_wait 250, gc_cc 7; top self: `poll [libc.so.6]` 250; `[axiosozo-dev]` 2; `write [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `[unknown]` 1
- **tab:3692** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, DOM 1, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4329** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::RunnableTask::Run() [libxul.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 493, DOM Worker 289, BgPool 151, Renderer 92, SwComposite 61, WRRenderBackend 37, Compositor 27, other 23, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 493 ms (23.2% of span): Idle 275, JavaScript 107, Other 51, Graphics 23, DOM 21, Layout 9
  - JS leaf 20 / native under JS 106 / native 367; buckets: ipc 493, poll_wait 348, gc_cc 106, paint_layout 60, worker_messaging 50, engine_stream_read 35, harness_diagnostics 23, json_metadata 23
  - top self: `poll [libc.so.6]` 278; `[unknown]` 19; `recvmsg [libc.so.6]` 10; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 7; `[axiosozo-dev]` 5; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 5
  - WebRender/compositor threads: Renderer 92 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `syscall [libc.so.6]` 13); SwComposite 61 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 5, `webrender::composite::CompositeState::get_surface_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 151 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 97, `__memmove_avx_unaligned_erms [libc.so.6]` 50, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 289 ms: buckets subprocess_pipe_io 289, worker_messaging 289, ipc 289, js_ctypes 252, poll_wait 241, gc_cc 15; top self: `poll [libc.so.6]` 241; `write [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 3; `[axiosozo-dev]` 3; `[unknown]` 3
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `[linux-vdso.so.1]` 0; `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3674** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 374, DOM Worker 235, Renderer 109, SwComposite 38, other 38, WRRenderBackend 15, Compositor 15, WRWorker 11, WRSceneBuilder 9, BgPool 6, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 374 ms (10.1% of span): Idle 169, JavaScript 68, Layout 44, Other 33, Graphics 30, DOM 21
  - JS leaf 8 / native under JS 122 / native 243; buckets: ipc 374, poll_wait 209, paint_layout 82, gc_cc 78, worker_messaging 61, engine_stream_read 30, subprocess_pipe_io 17, json_metadata 15
  - top self: `poll [libc.so.6]` 169; `[unknown]` 14; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 4
  - WebRender/compositor threads: Renderer 109 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 42, `hypotf@@GLIBC_2.35 [libm.so.6]` 11, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8); SwComposite 38 ms (top self: `syscall [libc.so.6]` 22, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.s` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[axiosozo-dev]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `nsXULPopupShownEvent::AddRef() [libxul.so]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 235 ms: buckets subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 220, poll_wait 218, gc_cc 5; top self: `poll [libc.so.6]` 218; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `mozilla::BaseTimeDurationPlatformUtils::ToSeconds(` 1; `xpc::OpaqueXrayTraits::enumerateNames(JSContext*, ` 1
- **tab:3603** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, J` 0; `GetExistingDataProperty(JSContext*, JS::Handle<js::NativeObj` 0; `[unknown]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4174** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimer::InitWithNamedFuncCallback(void (*)(nsITimer*, void*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3653** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 63, DOM Worker 62, Renderer 40, BgPool 9, IPC I/O 6, SwComposite 4, Compositor 4, WRRenderBackend 2, WRSceneBuilder 2, other 2, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 63 ms (0.4% of span): Idle 20, Layout 16, Other 10, JavaScript 10, DOM 2, Graphics 2
  - JS leaf 1 / native under JS 21 / native 42; buckets: ipc 63, poll_wait 24, paint_layout 21, array_buffer_copy 9, harness_diagnostics 9, gc_cc 7, memcpy_memset 4, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 22; `madvise [libc.so.6]` 4; `style::properties::generated::longhands::corner_top_right_sh` 3; `syscall [libc.so.6]` 2; `mprotect [libc.so.6]` 2; `recvmsg [libc.so.6]` 1
  - GC/CC markers: GCMinor 2× 0 ms
  - WebRender/compositor threads: Renderer 40 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #4 9 ms (top self: `unlink [libc.so.6]` 6, `fstatat64 [libc.so.6]` 1, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 62 ms: buckets subprocess_pipe_io 62, worker_messaging 60, ipc 60, gc_cc 51, poll_wait 11, js_ctypes 10; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 7; `[axiosozo-dev]` 5; `mozilla::ProfileChunkedBuffer::ResetChunkManager(m` 4
- **tab:3653** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3692** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__memcmp_avx2_movbe [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4318** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## gecko-debian (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **3.5** (main 1.5, DOM Worker 1.0, glean.dispatche 0.5, Renderer 0.5) | Web Content 2.9 | — | — |
| plain | raf | 59.0 | 17.1 | **12.6** (Renderer 6.9, main 1.0, glean.dispatche 1.0, TaskCon~ller # 1.0, WRRende~ckend# 1.0) | Isolated Web Co 1.6, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **11.1** (Renderer 5.0, main 1.0, WRScene~ilder# 1.0, WRRende~ckend# 1.0, glean.dispatche 0.7) | Isolated Web Co 2.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **21.1** (Renderer 15.1, main 2.0, WRRende~ckend# 1.5, glean.dispatche 1.0, Socket Thread 0.5) | Isolated Web Co 2.0, WebExtensions 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **4.6** (main 2.4, Renderer 0.5, WRScene~ilder# 0.5, TaskCon~ller # 0.3, Softwar~cThread 0.3) | Isolated Web Co 0.8, Web Content 0.3 | 7.5 | — |
| trace | idle | 59.0 | 17.1 | **4.0** (main 1.5, TaskCon~ller # 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Compositor 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **9.0** (Renderer 4.6, WRRende~ckend# 1.3, main 0.7, glean.dispatche 0.7, WRScene~ilder# 0.7) | Isolated Web Co 2.3 | — | — |
| trace | raf-nosampler | — | — | **9.9** (Renderer 4.3, main 1.0, glean.dispatche 1.0, WRScene~ilder# 1.0, WRRende~ckend# 1.0) | Isolated Web Co 2.3, Web Content 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **25.1** (Renderer 15.6, main 3.5, WRRende~ckend# 1.5, glean.dispatche 1.0, TaskCon~ller # 1.0) | Isolated Web Co 1.5 | — | — |
| trace | key | — | — | **38.8** (main 11.3, DOM Worker 9.4, IndexedDB IO # 8.6, IPDL Background 3.2, TaskCon~ller # 1.9) | Isolated Web Co 1.3, WebExtensions 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **2.0** (SamplerThread 2.0) | Web Content 5.4, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **18.7** (Renderer 5.3, SamplerThread 3.3, main 1.6, WRRende~ckend# 1.6, TaskCon~ller # 1.3) | Isolated Web Co 5.3, Web Content 4.6, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **13.3** (Renderer 5.0, SamplerThread 2.7, main 1.0, WRRende~ckend# 1.0, Compositor 1.0) | Web Content 4.3, Isolated Web Co 4.3, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **31.5** (Renderer 16.5, main 4.0, SamplerThread 3.5, WRRende~ckend# 2.0, TaskCon~ller # 1.5) | Web Content 4.5, Isolated Web Co 4.5, WebExtensions 1.0, Socket Process 0.5 | — | — |
| profile | key | — | — | **7.7** (SamplerThread 2.4, main 2.2, Renderer 0.5, WRRende~ckend# 0.5, glean.dispatche 0.3) | Web Content 4.1, Isolated Web Co 2.5, WebExtensions 1.1, Socket Process 0.8 | 9.5 | — |

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

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, other 0, BgPool 0, Renderer 0, WRWorker 0, WRRenderBackend 0, WRSceneBuilder 0, Canvas 0, Compositor 0, ImageIO 0, DOM Worker 0, ImageBridge 0, SwComposite 0
  - main thread 4 ms (0.2% of span): JavaScript 2, Idle 1, DOM 1
  - JS leaf 0 / native under JS 2 / native 1; buckets: ipc 4, harness_diagnostics 2, poll_wait 1, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[unknown]` 1; `js::Wrapper::New(JSContext*, JSObject*, js::Wrapper const*, ` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `fromPacket (chrome://remote/content/marionette/message.sys.m` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8454** CPU ms by thread group: main 9, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.4% of span): Idle 7, DOM 1, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 2 / native 7; buckets: ipc 9, poll_wait 7, harness_diagnostics 2, array_buffer_copy 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::SharedPropMap::createInitial(JSContext*, JS::Handle<JS::` 1; `JSScript::createJitScript(JSContext*) [libxul.so]` 1; `__memcmp_evex_movbe [libc.so.6]` 0; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0; `__memset_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8327** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8349** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 151, main 51, WRRenderBackend 33, DOM Worker 28, WRSceneBuilder 28, Compositor 24, IPC I/O 6, SwComposite 6, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (1.7% of span): GC / CC 25, Idle 16, Other 4, JavaScript 3, Graphics 1, Layout 1
  - JS leaf 1 / native under JS 2 / native 48; buckets: ipc 51, gc_cc 29, poll_wait 18, harness_diagnostics 2, paint_layout 2, array_buffer_copy 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 2; `nsTHashtable<nsBaseHashtableET<nsStringHashKey, nsCOMPtr<nsI` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 5× 20 ms, CCSlice 1× 5 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 151 ms (top self: `__syscall_cancel_arch [libc.so.6]` 88, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 25, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 25 ms (top self: `syscall [libc.so.6]` 23, `sched_yield [libc.so.6]` 0, `free [axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 26 ms: buckets worker_messaging 26, ipc 26, gc_cc 25, memcpy_memset 9, poll_wait 3, array_buffer_copy 2; top self: `madvise [libc.so.6]` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `unsigned long js::gc::Arena::finalize<JSString, (j` 2; `munmap [libc.so.6]` 2
- **tab:8454** CPU ms by thread group: main 91, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 91 ms (3.0% of span): Idle 64, Graphics 7, Other 7, Layout 5, GC / CC 4, JavaScript 2
  - JS leaf 0 / native under JS 4 / native 87; buckets: ipc 86, poll_wait 64, paint_layout 15, gc_cc 5, harness_diagnostics 2, array_buffer_copy 1, webrender_render 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 66; `[]` 3; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*,` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::He` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 10 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8327** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8532** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 152, WRRenderBackend 31, main 30, WRSceneBuilder 27, Compositor 23, IPC I/O 6, DOM Worker 4, SwComposite 4, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (1.0% of span): GC / CC 20, Idle 6, DOM 2, Profiler 1, Other 1, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 28; buckets: ipc 30, gc_cc 23, poll_wait 9, harness_diagnostics 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 1
  - GC/CC markers: GCMajor 1× 68 ms, GCSlice 5× 17 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 152 ms (top self: `__syscall_cancel_arch [libc.so.6]` 83, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 27, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 23 ms (top self: `syscall [libc.so.6]` 22, `[axiosozo-dev]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedIm` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8454** CPU ms by thread group: main 80, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 80 ms (2.7% of span): Idle 61, Graphics 7, Other 4, Layout 3, Profiler 3, GC / CC 2
  - JS leaf 0 / native under JS 1 / native 79; buckets: ipc 77, poll_wait 61, paint_layout 12, gc_cc 3, mozafterpaint_events 1, webrender_render 0, subprocess_pipe_io 0, canvas_2d 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 62; `[]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onScopeE` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::gc::TraceExternalEdge(JSTracer*, JS::PropertyKey*, char ` 1; `mozilla::ImplCycleCollectionTraverse(nsCycleCollectionTraver` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 6× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8327** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 323, main 71, WRRenderBackend 36, Compositor 16, SwComposite 14, WRSceneBuilder 13, IPC I/O 4, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 71 ms (3.6% of span): Idle 40, GC / CC 19, Other 5, JavaScript 3, Layout 2, Graphics 1
  - JS leaf 0 / native under JS 4 / native 68; buckets: ipc 71, poll_wait 47, gc_cc 22, harness_diagnostics 4, paint_layout 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 44; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `nsIFrame::ShouldApplyOverflowClipping(nsStyleDisplay const*)` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 1
  - GC/CC markers: GCMajor 1× 45 ms, GCSlice 6× 22 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 323 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 95, `__syscall_cancel_arch [libc.so.6]` 58, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 47); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1); SwComposite 14 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8454** CPU ms by thread group: main 50, IPC I/O 8, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.5% of span): Idle 42, Graphics 4, Other 2, JavaScript 2, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 2 / native 48; buckets: ipc 48, poll_wait 42, paint_layout 4, harness_diagnostics 1, array_buffer_copy 1, gc_cc 0, canvas_2d 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 42; `[]` 1; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffe` 1; `floorf [libxul.so]` 1; `mozilla::FlattenedDisplayListIterator::ResolveFlattening() [` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8532** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8528** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 79, Renderer 19, Compositor 9, WRRenderBackend 9, WRSceneBuilder 7, IPC I/O 4, SwComposite 2, other 1, BgPool 1, DOM Worker 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 79 ms (2.1% of span): Idle 31, Graphics 16, Layout 14, JavaScript 7, Other 6, DOM 5
  - JS leaf 2 / native under JS 10 / native 67; buckets: ipc 79, poll_wait 35, paint_layout 30, harness_diagnostics 3, gc_cc 3, subprocess_pipe_io 3, memcpy_memset 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 32; `[axiosozo-dev]` 4; `IsTwiceTheRequiredBytesRepresentableAsUint32(unsigned long, ` 2; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&,` 2; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 2; `mozilla::layers::WebRenderLayerManager::EndTransactionWithou` 2
  - WebRender/compositor threads: Renderer 19 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 1, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 1); WRRenderBackend#0 9 ms (top self: `syscall [libc.so.6]` 8, `sched_yield [libc.so.6]` 0, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 7 ms (top self: `syscall [libc.so.6]` 6, `sched_yield [libc.so.6]` 0, `mozilla::layers::APZCTreeManager::PrepareNodeForLa` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8454** CPU ms by thread group: main 36, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 36 ms (1.0% of span): Idle 20, GC / CC 5, Graphics 3, JavaScript 2, Other 2, Layout 2
  - JS leaf 0 / native under JS 2 / native 34; buckets: ipc 35, poll_wait 20, gc_cc 6, paint_layout 6, harness_diagnostics 2, memcpy_memset 1, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 20; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libx` 1; `mozilla::DisplayListClipState::ClipContainingBlockDescendant` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8277** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 3, JavaScript 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::OpaqueXra` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::detail::nsTStringRepr<char>::Equals(mozilla::detail` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

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

## webkit-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **32.0** (main 12.8, Renderer 12.8, DOM Worker 4.3, WRRende~ckend# 2.1) | WPEWebProcess 83.5, AxioWebKitHost 27.8, WPENetworkProce 12.8, Isolated Web Co 2.1 | — | 443.9 |
| plain | idle | — | — | **5.4** (main 3.4, DOM Worker 1.0, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 1.9 | — | — |
| plain | raf | 57.8 | 22.1 | **22.0** (main 7.8, Renderer 3.6, DOM Worker 2.6, SwComposite 2.3, Backgro~Pool # 2.0) | WPEWebProcess 140.8, AxioWebKitHost 13.7 | — | — |
| plain | raf-nosampler | — | — | **20.1** (main 5.3, Renderer 3.3, DOM Worker 2.7, SwComposite 2.0, WRRende~ckend# 1.7) | WPEWebProcess 141.4, AxioWebKitHost 13.7, Web Content 0.3 | — | — |
| plain | scroll | 54.9 | 32.8 | **39.3** (main 17.6, DOM Worker 5.4, Backgro~Pool # 4.4, Renderer 3.9, TaskCon~ller # 2.0) | WPEWebProcess 145.4, AxioWebKitHost 12.7 | — | — |
| plain | key | — | — | **12.1** (main 6.1, Renderer 1.4, DOM Worker 1.4, SwComposite 0.8, glean.dispatche 0.6) | WPEWebProcess 13.6, AxioWebKitHost 1.7, WebExtensions 0.3 | 22.1 | — |
| plain | switch-to-gecko | — | — | **30.9** (main 13.3, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4, Renderer 4.4, sqldb:p~lite # 4.4) | Isolated Web Co 4.4 | — | 210.6 |
| trace | switch-to-engine | — | — | **87.1** (Renderer 43.6, main 18.7, glean.dispatche 6.2, WRScene~ilder# 6.2, SwComposite 6.2) | WPEWebProcess 68.6, AxioWebKitHost 6.2, WPENetworkProce 6.2, Isolated Web Co 6.2 | — | 147.7 |
| trace | idle | — | — | **3.4** (main 2.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 1.0 | — | — |
| trace | raf | 57.2 | 22.5 | **24.8** (main 8.2, DOM Worker 4.6, Renderer 3.6, SwComposite 2.3, WRRende~ckend# 1.6) | WPEWebProcess 141.5, AxioWebKitHost 12.7, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **20.5** (main 6.0, Renderer 3.3, DOM Worker 2.3, SwComposite 2.0, Backgro~Pool # 1.7) | WPEWebProcess 141.3, AxioWebKitHost 13.3 | — | — |
| trace | scroll | 55.0 | 38.5 | **39.7** (main 17.8, DOM Worker 6.3, Renderer 3.9, Backgro~Pool # 3.9, SwComposite 1.9) | WPEWebProcess 145.8, AxioWebKitHost 13.1 | — | — |
| trace | key | — | — | **10.0** (main 5.8, Renderer 1.7, DOM Worker 1.1, SwComposite 0.8, Timer 0.3) | WPEWebProcess 14.1, AxioWebKitHost 0.8, WebExtensions 0.3 | 20.9 | — |
| trace | switch-to-gecko | — | — | **44.0** (main 17.6, TaskCon~ller # 8.8, BgIOThr~Pool # 4.4, Renderer 4.4, Compositor 4.4) | Isolated Web Co 4.4 | — | 210.9 |
| profile | switch-to-engine | — | — | **42.0** (main 11.5, Renderer 11.5, IPC I/O Parent 3.8, Softwar~cThread 3.8, ImageBridgeChld 3.8) | Web Content 165.5, WPEWebProcess 57.7, WPENetworkProce 7.7, AxioWebKitHost 3.8 | — | 216.7 |
| profile | idle | — | — | **16.6** (main 5.4, SamplerThread 4.9, DOM Worker 3.4, TaskCon~ller # 1.9, Timer 1.0) | Web Content 4.9, WebExtensions 1.5, Privileged Cont 1.0, Isolated Web Co 1.0 | — | — |
| profile | raf | 58.1 | 21.5 | **36.6** (main 10.7, SamplerThread 6.2, DOM Worker 5.9, Renderer 4.2, SwComposite 2.3) | WPEWebProcess 144.2, AxioWebKitHost 14.1, Web Content 4.9, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **32.7** (DOM Worker 6.3, main 5.7, SamplerThread 5.7, Renderer 4.3, Backgro~Pool # 2.3) | WPEWebProcess 144.0, AxioWebKitHost 13.6, Web Content 4.3, Isolated Web Co 1.0 | — | — |
| profile | scroll | 53.4 | 33.2 | **56.8** (main 21.5, DOM Worker 12.7, SamplerThread 6.3, Backgro~Pool # 3.9, Renderer 3.4) | WPEWebProcess 144.6, AxioWebKitHost 12.7, Web Content 4.9, Socket Process 1.0 | — | — |
| profile | key | — | — | **26.2** (main 9.6, SamplerThread 5.5, DOM Worker 4.7, Renderer 1.9, TaskCon~ller # 1.4) | WPEWebProcess 14.7, Web Content 5.8, WebExtensions 1.4, Privileged Cont 1.4 | 21.7 | — |
| profile | switch-to-gecko | — | — | **26.3** (main 8.7, BgIOThr~Pool # 4.4, Renderer 4.4, WRScene~ilder# 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 214.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 11.7 | 0.0 | 0 | 0.0 | — | — | 48.8 | 0.0 | — | 3.57 | 0.49 | — | — | — | — | — | 0.006 |
| trace | raf | 57.2 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.17 | 0.09 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.20 | 0.10 | — | — | — | — | — | 0.007 |
| trace | scroll | 53.8 | 0.0 | 0 | 0.0 | — | — | 4.1 | 0.0 | — | 0.40 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 12.4 | 0.0 | — | 0.06 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.4 | 0.0 | 0 | 0.0 | — | — | 69.2 | 0.0 | — | 2.81 | 1.44 | — | — | — | — | — | 0.011 |
| profile | raf | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.22 | 0.12 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.21 | 0.13 | — | — | — | — | — | 0.009 |
| profile | scroll | 53.0 | 0.0 | 0 | 0.0 | — | — | 9.8 | 0.0 | — | 0.44 | 0.14 | — | — | — | — | — | 0.008 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 11.1 | 0.0 | — | 0.07 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.038 | 1.415 | 0.0044 | 0.0059 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.108 | 0.152 | 0.0063 | 0.0088 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.118 | 0.164 | 0.0068 | 0.0095 |
| plain | scroll | memfd | native | 111 | 111 | 0.325 | 0.417 | 0.0175 | 0.0225 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.111 | 0.0000 | 0.0006 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.950 | 1.363 | 0.0111 | 0.0160 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 177 | 177 | 0.105 | 0.150 | 0.0061 | 0.0086 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.116 | 0.163 | 0.0067 | 0.0094 |
| trace | scroll | memfd | native | 112 | 112 | 0.356 | 0.408 | 0.0191 | 0.0220 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.115 | 0.0000 | 0.0006 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.414 | 2.413 | 0.0178 | 0.0178 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.123 | 0.166 | 0.0072 | 0.0097 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.130 | 0.187 | 0.0076 | 0.0109 |
| profile | scroll | memfd | native | 109 | 109 | 0.347 | 0.425 | 0.0184 | 0.0225 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.113 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 18.5 | 0.0 | — | 0.06 | 0.24 | — | — | 12.6 | 19.2 | 32.0 |
| profile | 0.4 | 17.6 | 0.1 | — | 0.07 | 0.30 | — | — | 13.4 | 19.0 | 32.9 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 14.2; first stdout read resolved 14.8; first frame applied (native receiver) 154.4; write frame_ack 155.2; write visibility 157.8; write focus 157.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 12.1; first stdout read resolved 17.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 13.7; first stdout read resolved 15.9; first frame applied (native receiver) 212.3; write frame_ack 215.0; write visibility 225.8; write focus 226.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 14.0; first stdout read resolved 19.0

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 29, Renderer 25, DOM Worker 12, BgPool 5, Compositor 2, WRRenderBackend 2, SwComposite 2, IPC I/O 2, WRSceneBuilder 1, WRWorker 1, Socket 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 29 ms (10.9% of span): Layout 10, JavaScript 7, Idle 6, DOM 5, Other 1, Profiler 1
  - JS leaf 0 / native under JS 19 / native 10; buckets: ipc 29, paint_layout 12, gc_cc 10, poll_wait 6, engine_stream_read 6, harness_diagnostics 5, worker_messaging 5, native_receiver 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `nsIFrame* nsCSSFrameConstructor::FindSibling<(nsCSSFrameCons` 5; `__lll_lock_wake [libc.so.6]` 3; `mozilla::dom::ResizeObserver::GatherActiveObservations(unsig` 2; `[unknown]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 25 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 14, `syscall [libc.so.6]` 7, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__memset_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 9, poll_wait 9, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 9; `__lll_lock_wake [libc.so.6]` 1; `mozilla::dom::Event::Release() [libxul.so]` 1
- **tab:9507** CPU ms by thread group: main 29, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (33.5% of span): Other 23, Profiler 2, JavaScript 2, DOM 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 3 / native 26; buckets: ipc 22, array_buffer_copy 9, gc_cc 7, subprocess_pipe_io 2, image_container 1, poll_wait 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `JSLinearString* JSRope::flattenInternal<(JSRope::UsingBarrie` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 2; `icu_78::UnicodeString::UnicodeString(icu_78::UnicodeString c` 2; `js::frontend::ParserAtomsTable::markUsedByStencil(js::fronte` 1; `l10nregistry_register_parent_process_sources [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9504** CPU ms by thread group: main 20, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0
  - main thread 20 ms (64.6% of span): Other 18, Profiler 2
  - JS leaf 0 / native under JS 0 / native 20; buckets: ipc 12, array_buffer_copy 9, gc_cc 2
  - top self: `[]` 4; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `prctl [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2; `FcConfigGetCurrent [libfontconfig.so.1]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9361** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::layers::ImageBridgeParent::GetContentId() [libxul.s` 1; `non-virtual thunk to mozilla::PresShell::QueryInterface(nsID` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 100, DOM Worker 31, other 10, Socket 0, IPC I/O 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 100 ms (4.9% of span): Idle 61, GC / CC 27, JavaScript 7, Other 3, Profiler 1, DOM 1
  - JS leaf 0 / native under JS 7 / native 93; buckets: ipc 100, poll_wait 64, gc_cc 30, harness_diagnostics 7, array_buffer_copy 4, memcpy_memset 3, engine_stream_read 1, worker_messaging 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 63; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 793 ms, GCSlice 7× 23 ms, CCSlice 2× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets subprocess_pipe_io 31, js_ctypes 31, worker_messaging 31, ipc 31, poll_wait 31; top self: `__syscall_cancel_arch [libc.so.6]` 31
- **tab:9507** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `fog_serialize_ipc_buf [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9504** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 317, DOM Worker 147, Renderer 118, SwComposite 58, BgPool 57, WRRenderBackend 45, Compositor 32, other 19, ImageBridge 13, WRSceneBuilder 7, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 317 ms (10.2% of span): Idle 213, JavaScript 55, Other 29, DOM 15, Profiler 4, GC / CC 1
  - JS leaf 10 / native under JS 58 / native 249; buckets: ipc 315, poll_wait 232, gc_cc 48, engine_stream_read 33, worker_messaging 29, harness_diagnostics 27, array_buffer_copy 9, subprocess_pipe_io 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 227; `[unknown]` 10; `[axiosozo-dev]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `xpc::InitializeValue(nsXPTType const&, void*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 2× 8 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `__syscall_cancel_arch [libc.so.6]` 79, `__memmove_avx512_unaligned_erms [libc.so.6]` 19, `syscall [libc.so.6]` 12); SwComposite 58 ms (top self: `syscall [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 8, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 50, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `void mozilla::WriteULEB128<unsigned int, mozilla::` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `mozilla::layers::ImageBridgeChild::RecvParentAsync` 0); BgIOThreadPool #2 1 ms (top self: `non-virtual thunk to mozilla::PrioritizableCancela` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 140 ms: buckets subprocess_pipe_io 140, worker_messaging 140, ipc 140, js_ctypes 127, poll_wait 125, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 126; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `[unknown]` 1
- **tab:9361** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `nsQueryReferent::operator()(nsID const&, void**) const [libx` 0
  - GC/CC markers: GCMajor 1× 33 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9016** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 166, DOM Worker 139, Renderer 112, SwComposite 62, BgPool 60, WRRenderBackend 44, Compositor 31, ImageBridge 13, WRSceneBuilder 7, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 166 ms (5.5% of span): Idle 99, JavaScript 46, DOM 10, Other 8, Profiler 1
  - JS leaf 7 / native under JS 49 / native 110; buckets: ipc 164, poll_wait 103, gc_cc 56, engine_stream_read 46, worker_messaging 31, subprocess_pipe_io 9, native_receiver 8, array_buffer_copy 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 102; `[unknown]` 19; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `nsTSubstring<char>::Assign(char const*, unsigned long, std::` 1
  - WebRender/compositor threads: Renderer 112 ms (top self: `__syscall_cancel_arch [libc.so.6]` 80, `__memmove_avx512_unaligned_erms [libc.so.6]` 15, `syscall [libc.so.6]` 10); SwComposite 62 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 60 ms (top self: `__syscall_cancel_arch [libc.so.6]` 52, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `mozilla::TaskQueue::MaybeResolveShutdown() [libxul` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `__lll_lock_wait [libc.so.6]` 0, `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 139 ms: buckets subprocess_pipe_io 139, worker_messaging 139, ipc 139, js_ctypes 130, poll_wait 127, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 128; `[unknown]` 2; `[axiosozo-dev]` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*` 1; `js::ctypes::CData::Create(JSContext*, JS::Handle<J` 0
- **tab:8989** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBuf` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 413, DOM Worker 227, BgPool 80, Renderer 60, SwComposite 33, WRRenderBackend 27, Compositor 18, other 12, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 413 ms (20.1% of span): Idle 232, JavaScript 70, Other 42, GC / CC 27, DOM 23, Graphics 9
  - JS leaf 12 / native under JS 79 / native 322; buckets: ipc 412, poll_wait 275, gc_cc 96, engine_stream_read 51, worker_messaging 39, harness_diagnostics 29, paint_layout 28, array_buffer_copy 25
  - top self: `__syscall_cancel_arch [libc.so.6]` 249; `[unknown]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `mprotect [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3
  - GC/CC markers: GCSlice 5× 22 ms, CCSlice 3× 7 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 60 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `syscall [libc.so.6]` 6); SwComposite 33 ms (top self: `syscall [libc.so.6]` 31, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 80 ms (top self: `__syscall_cancel_arch [libc.so.6]` 53, `__memmove_avx512_unaligned_erms [libc.so.6]` 24, `nsThreadPool::Run() [libxul.so]` 1); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::TextureClient::IsSharedWithCompos` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 227 ms: buckets subprocess_pipe_io 227, worker_messaging 227, ipc 227, js_ctypes 148, poll_wait 138, gc_cc 60; top self: `__syscall_cancel_arch [libc.so.6]` 141; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 9; `madvise [libc.so.6]` 8; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `__lll_lock_wake [libc.so.6]` 6
- **tab:8967** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8989** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 330, DOM Worker 92, Renderer 58, SwComposite 29, other 19, WRRenderBackend 12, Compositor 11, WRWorker 8, WRSceneBuilder 7, BgPool 3, ImageBridge 1, IPC I/O 1, Socket 0, ImageIO 0, Canvas 0
  - main thread 330 ms (9.0% of span): Idle 162, JavaScript 43, GC / CC 31, Graphics 28, Layout 24, Other 17
  - JS leaf 5 / native under JS 75 / native 249; buckets: ipc 328, poll_wait 178, gc_cc 79, paint_layout 56, worker_messaging 44, engine_stream_read 34, harness_diagnostics 14, array_buffer_copy 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 167; `[axiosozo-dev]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `syscall [libc.so.6]` 5; `[unknown]` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 1047 ms, GCSlice 8× 30 ms, CCSlice 2× 4 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `__syscall_cancel_arch [libc.so.6]` 19, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 13, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); SwComposite 29 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 10); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 0, `floorf [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 92 ms: buckets subprocess_pipe_io 92, worker_messaging 92, ipc 92, js_ctypes 88, poll_wait 85, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 85; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 0; `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 0
- **tab:8908** CPU ms by thread group: main 13, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 13 ms (0.4% of span): GC / CC 6, Idle 5, Other 1, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 12, gc_cc 7, poll_wait 6, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `js::jit::ExecutableAllocator::poisonCode(JSRuntime*, mozilla` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `js::gc::TraceExternalEdge(JSTracer*, JS::PropertyKey*, char ` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - GC/CC markers: GCMajor 1× 38 ms, GCSlice 4× 6 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9016** CPU ms by thread group: main 7, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): GC / CC 5, Idle 1, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, gc_cc 5, poll_wait 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 0; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla` 0
  - GC/CC markers: GCMajor 1× 22 ms, GCSlice 4× 5 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 2, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): GC / CC 1, Idle 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 27, Renderer 15, DOM Worker 7, BgPool 6, Compositor 2, WRRenderBackend 1, WRSceneBuilder 1, SwComposite 1, Socket 1, IPC I/O 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 27 ms (11.3% of span): JavaScript 8, Idle 7, Other 4, Layout 3, DOM 3, Profiler 2
  - JS leaf 0 / native under JS 15 / native 11; buckets: ipc 27, poll_wait 11, array_buffer_copy 5, harness_diagnostics 4, paint_layout 4, gc_cc 4, worker_messaging 3, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `harfbuzz::unicode_funcs::UnicodeFuncsBuilder::set_general_ca` 1; `nsIContent::Release() [libxul.so]` 1; `js::jit::CallIRGenerator::tryAttachCallNative(JS::Handle<JSF` 1
  - WebRender/compositor threads: Renderer 15 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `__syscall_cancel_arch [libc.so.6]` 3, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 2); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 2, `rmdir [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 6, poll_wait 5; top self: `__syscall_cancel_arch [libc.so.6]` 5; `(anonymous namespace)::HandleSigChld(int) [libxul.` 1; `bool mozilla::HashSet<js::jit::ExecutablePool*, mo` 1; `mozilla::BaseTimeDurationPlatformUtils::TicksFromM` 0
- **tab:9361** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (2.4% of span): Idle 3, Other 2, DOM 1, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 4; buckets: ipc 6, poll_wait 3, gc_cc 1, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `nscstring_fallible_append_utf16_to_utf8_impl [libxul.so]` 1; `(anonymous namespace)::NameResolver::visit(js::frontend::Par` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `__strlen_evex [libc.so.6]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8908** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.4% of span): Idle 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_thread_self [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

