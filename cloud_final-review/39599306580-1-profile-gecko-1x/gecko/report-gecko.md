# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.2 | **6.4** (main 2.4, IPDL Background 1.0, DOM Worker 1.0, Softwar~cThread 0.5, Renderer 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **26.8** (Renderer 15.3, WRRende~ckend# 2.3, main 2.0, glean.dispatche 2.0, WRScene~ilder# 1.6) | Isolated Web Co 4.6, WebExtensions 0.7, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.0** (Renderer 10.3, WRRende~ckend# 2.3, glean.dispatche 1.3, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 3.9, Web Content 0.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **44.3** (Renderer 29.0, main 4.4, WRRende~ckend# 3.4, Compositor 2.0, SwComposite 2.0) | Isolated Web Co 4.4, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **9.0** (main 4.5, Renderer 0.8, WRRende~ckend# 0.8, TaskCon~ller # 0.5, glean.dispatche 0.3) | Isolated Web Co 1.9, WebExtensions 0.3 | 8.5 | — |
| trace | idle | 59.0 | 17.2 | **4.9** (main 1.9, TaskCon~ller # 1.0, glean.dispatche 0.5, IPDL Background 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **20.3** (Renderer 9.8, glean.dispatche 2.0, main 1.6, WRScene~ilder# 1.6, WRRende~ckend# 1.6) | Isolated Web Co 4.3 | — | — |
| trace | raf-nosampler | — | — | **17.8** (Renderer 9.6, WRRende~ckend# 2.3, glean.dispatche 1.7, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 4.6 | — | — |
| trace | scroll | 59.0 | 17.1 | **53.6** (Renderer 30.0, main 8.3, WRRende~ckend# 2.9, DOM Worker 2.9, SwComposite 2.5) | Isolated Web Co 4.9 | — | — |
| trace | key | — | — | **64.2** (main 17.3, DOM Worker 15.7, IndexedDB IO # 14.9, IPDL Background 6.6, TaskCon~ller # 2.4) | Isolated Web Co 1.6, Privileged Cont 0.6, WebExtensions 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.2 | **9.6** (SamplerThread 3.8, main 1.9, TaskCon~ller # 1.9, Timer 0.5, IPDL Background 0.5) | Web Content 10.1, Isolated Web Co 5.8, Privileged Cont 1.9, Socket Process 1.4 | — | — |
| profile | raf | 59.0 | 17.1 | **31.1** (Renderer 11.4, SamplerThread 6.5, WRRende~ckend# 2.6, main 2.3, Compositor 2.3) | Isolated Web Co 9.7, Web Content 9.4, Privileged Cont 2.2, Socket Process 1.6 | — | — |
| profile | raf-nosampler | — | — | **27.5** (Renderer 11.6, SamplerThread 6.0, WRRende~ckend# 2.6, Compositor 2.0, glean.dispatche 1.7) | Isolated Web Co 10.5, Web Content 8.6, WebExtensions 2.0, Socket Process 1.7 | — | — |
| profile | scroll | 59.0 | 17.1 | **63.5** (Renderer 33.2, SamplerThread 8.3, main 7.3, WRRende~ckend# 4.4, Compositor 2.4) | Web Content 10.3, Isolated Web Co 9.8, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **14.8** (main 5.6, SamplerThread 4.5, Renderer 0.8, WRRende~ckend# 0.8, IPC I/O Parent 0.5) | Web Content 8.0, Isolated Web Co 4.3, WebExtensions 2.2, Privileged Cont 1.6 | 9.0 | — |

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

- **parent** CPU ms by thread group: main 52, DOM Worker 2, Compositor 1, IPC I/O 1, Socket 1, other 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0, BgPool 0
  - main thread 52 ms (2.5% of span): GC / CC 30, Other 8, JavaScript 7, Idle 5, DOM 1, Profiler 1
  - JS leaf 2 / native under JS 6 / native 44; buckets: ipc 52, gc_cc 36, poll_wait 8, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 7; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `[axiosozo-dev]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::build [li` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 0; top self: `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3315** CPU ms by thread group: main 32, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 32 ms (1.5% of span): Idle 20, GC / CC 5, JavaScript 3, Other 2, Profiler 1, DOM 0
  - JS leaf 0 / native under JS 4 / native 28; buckets: ipc 31, poll_wait 21, gc_cc 8, array_buffer_copy 3, harness_diagnostics 3, paint_layout 1, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 21; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handl` 1; `prctl [libc.so.6]` 1; `__strlen_avx2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3408** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3405** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 336, WRRenderBackend 71, main 67, WRSceneBuilder 56, Compositor 46, SwComposite 20, IPC I/O 11, DOM Worker 5, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0, BgPool 0
  - main thread 67 ms (2.2% of span): GC / CC 32, Idle 25, Graphics 3, Other 3, JavaScript 3, DOM 1
  - JS leaf 0 / native under JS 4 / native 63; buckets: ipc 67, gc_cc 34, poll_wait 27, paint_layout 4, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsD` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 6× 27 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 336 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 100, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 75, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 42); WRRenderBackend#0 71 ms (top self: `syscall [libc.so.6]` 58, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1); WRSceneBuilder#0 50 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build_ite` 1)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 4, memcpy_memset 2, poll_wait 0; top self: `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 2; `madvise [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3315** CPU ms by thread group: main 173, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 173 ms (5.6% of span): Idle 106, Layout 22, Graphics 19, Other 11, Profiler 9, JavaScript 4
  - JS leaf 0 / native under JS 8 / native 165; buckets: ipc 166, poll_wait 107, paint_layout 53, gc_cc 4, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 106; `sendmsg [libc.so.6]` 3; `[]` 3; `__lll_lock_wait [libc.so.6]` 2; `Pickle::BeginWrite(unsigned int) [libxul.so]` 1; `mozilla::nsDisplayList::HitTest(mozilla::nsDisplayListBuilde` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3408** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3321** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `nsJSContext::MaybePokeGC() [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 340, WRRenderBackend 67, WRSceneBuilder 55, Compositor 46, main 15, SwComposite 14, IPC I/O 10, other 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0, BgPool 0
  - main thread 15 ms (0.5% of span): Idle 10, JavaScript 3, Other 1, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 4 / native 12; buckets: ipc 15, poll_wait 12, harness_diagnostics 4, array_buffer_copy 3, gc_cc 2, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 11; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 1; `js::jit::CacheRegisterAllocator::useValueRegister(js::jit::M` 1; `js::GeckoProfilerRuntime::profileString(JSContext*, js::Base` 1; `nsLayoutUtils::GetDisplayListParent(nsIFrame*) [libxul.so]` 0
  - WebRender/compositor threads: Renderer 340 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 93, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 83, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 35); WRRenderBackend#0 67 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 3, `webrender::texture_cache::TextureCache::request [l` 1); WRSceneBuilder#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `webrender::scene_building::SceneBuilder::build_ite` 1)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3315** CPU ms by thread group: main 164, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 164 ms (5.4% of span): Idle 101, Graphics 28, Layout 18, Other 10, Profiler 6, DOM 2
  - JS leaf 0 / native under JS 4 / native 160; buckets: ipc 157, poll_wait 102, paint_layout 56, memcpy_memset 2, canvas_2d 2, subprocess_pipe_io 1, gc_cc 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 101; `sendmsg [libc.so.6]` 6; `[]` 5; `round [libxul.so]` 2; `wr_dp_push_linear_gradient [libxul.so]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3321** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3248** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 654, main 144, WRRenderBackend 79, SwComposite 39, Compositor 33, WRSceneBuilder 23, IPC I/O 9, other 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 144 ms (7.0% of span): Idle 75, GC / CC 28, Other 13, Graphics 10, JavaScript 7, Layout 6
  - JS leaf 0 / native under JS 9 / native 135; buckets: ipc 144, poll_wait 98, gc_cc 34, paint_layout 18, harness_diagnostics 5, array_buffer_copy 4, memcpy_memset 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 76; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 2; `write [libc.so.6]` 2
  - GC/CC markers: GCSlice 7× 21 ms, CCSlice 1× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 654 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 209, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 100, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 58); WRRenderBackend#0 79 ms (top self: `syscall [libc.so.6]` 51, `[axiosozo-dev]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 3); SwComposite 39 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #4 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3315** CPU ms by thread group: main 107, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 107 ms (5.1% of span): Idle 63, Graphics 16, Other 10, GC / CC 7, Layout 5, JavaScript 4
  - JS leaf 0 / native under JS 4 / native 102; buckets: ipc 102, poll_wait 65, paint_layout 24, gc_cc 11, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 64; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 3; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3248** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3408** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 210, Renderer 34, WRRenderBackend 19, Compositor 18, WRSceneBuilder 14, IPC I/O 10, SwComposite 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0, BgPool 0
  - main thread 210 ms (5.5% of span): Layout 43, Idle 40, Other 35, GC / CC 30, Graphics 24, JavaScript 24
  - JS leaf 1 / native under JS 34 / native 174; buckets: ipc 209, paint_layout 76, poll_wait 66, gc_cc 47, memcpy_memset 8, array_buffer_copy 7, harness_diagnostics 6, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 44; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `[axiosozo-dev]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `__memset_avx2_unaligned_erms [libc.so.6]` 5; `recvmsg [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 54 ms, GCSlice 6× 24 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3315** CPU ms by thread group: main 67, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 67 ms (1.8% of span): Idle 24, Other 10, JavaScript 10, Graphics 8, GC / CC 8, Layout 3
  - JS leaf 0 / native under JS 9 / native 58; buckets: ipc 64, poll_wait 26, paint_layout 15, gc_cc 12, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 1
  - top self: `poll [libc.so.6]` 24; `sendmsg [libc.so.6]` 4; `zen::ZenMouseTracker::AddRef() [libxul.so]` 1; `mozilla::ReflowInput::InitConstraints(nsPresContext*, mozill` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3176** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `NS_CycleCollectableHasRefCntZero [libxul.so]` 0; `[unknown]` 0; `NS_IsMainThread [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3405** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

