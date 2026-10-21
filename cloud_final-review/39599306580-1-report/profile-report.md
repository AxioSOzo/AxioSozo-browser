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

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.3 | **7.2** (main 1.9, Renderer 1.9, DOM Worker 1.4, IPDL Background 1.0, glean.dispatche 0.5) | Web Content 3.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **34.5** (Renderer 19.8, SwComposite 3.3, WRRende~ckend# 2.3, main 2.0, glean.dispatche 1.6) | Isolated Web Co 4.2, WebExtensions 0.6, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.6** (Renderer 12.3, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.7, main 1.3) | Isolated Web Co 4.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **84.7** (Renderer 65.5, SwComposite 5.9, main 4.4, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 3.9, Privileged Cont 1.0 | — | — |
| plain | key | — | — | **8.3** (main 4.3, Renderer 1.1, IPC I/O Parent 0.5, TaskCon~ller # 0.5, WRScene~ilder# 0.5) | Isolated Web Co 1.6, Web Content 0.5, WebExtensions 0.3 | 8.5 | — |
| trace | idle | 59.4 | 17.1 | **6.4** (main 1.9, glean.dispatche 1.0, TaskCon~ller # 1.0, Timer 0.5, IPDL Background 0.5) | Isolated Web Co 1.4 | — | — |
| trace | raf | 59.0 | 17.1 | **18.3** (Renderer 7.8, SwComposite 2.3, WRRende~ckend# 2.0, main 1.3, glean.dispatche 1.3) | Isolated Web Co 4.2, WebExtensions 0.3 | — | — |
| trace | raf-nosampler | — | — | **23.0** (Renderer 11.3, WRRende~ckend# 2.3, glean.dispatche 2.0, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 5.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **85.1** (Renderer 65.4, main 5.9, SwComposite 5.9, WRRende~ckend# 3.9, glean.dispatche 1.0) | Isolated Web Co 4.4 | — | — |
| trace | key | — | — | **53.3** (main 17.6, DOM Worker 17.0, IPDL Background 6.7, TaskCon~ller # 2.1, StreamTrans # 1.9) | Isolated Web Co 1.1, WebExtensions 0.5 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **10.6** (SamplerThread 4.3, main 2.9, TaskCon~ller # 1.9, Softwar~cThread 0.5, Compositor 0.5) | Web Content 8.1, Isolated Web Co 4.3, Socket Process 1.4, Privileged Cont 1.4 | — | — |
| profile | raf | 59.0 | 17.1 | **29.6** (Renderer 8.7, SamplerThread 6.1, WRRende~ckend# 2.6, SwComposite 2.6, main 2.3) | Isolated Web Co 9.4, Web Content 8.4, WebExtensions 1.6, Socket Process 1.3 | — | — |
| profile | raf-nosampler | — | — | **32.1** (Renderer 12.2, SamplerThread 6.3, WRRende~ckend# 2.3, WRScene~ilder# 2.0, Compositor 2.0) | Isolated Web Co 9.3, Web Content 7.9, Privileged Cont 2.3, Socket Process 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **104.7** (Renderer 72.4, SamplerThread 9.7, SwComposite 7.2, main 5.3, WRRende~ckend# 4.3) | Web Content 9.7, Isolated Web Co 9.1, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | key | — | — | **15.1** (main 5.6, SamplerThread 4.3, Renderer 1.3, TaskCon~ller # 0.5, WRScene~ilder# 0.5) | Web Content 8.0, Isolated Web Co 4.0, WebExtensions 1.6, Privileged Cont 1.6 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 54, DOM Worker 1, Compositor 1, IPC I/O 1, Renderer 1, SwComposite 1, Socket 1, other 0, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (2.6% of span): GC / CC 33, Idle 8, JavaScript 7, Other 5, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 8 / native 46; buckets: ipc 54, gc_cc 37, poll_wait 10, harness_diagnostics 6, array_buffer_copy 3, memcpy_memset 1, paint_layout 0
  - top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `write [libc.so.6]` 2; `js::IndirectBindingMap::trace(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 7× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1; top self: `void js::gc::ArenaLists::backgroundFinalize<(js::g` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3293** CPU ms by thread group: main 26, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (1.2% of span): Idle 16, GC / CC 5, JavaScript 3, Other 2, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 3 / native 23; buckets: ipc 25, poll_wait 17, gc_cc 7, array_buffer_copy 3, harness_diagnostics 3, subprocess_pipe_io 1, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `[unknown]` 1; `mozilla::CycleCollectedJSContext::AfterProcessMicrotasks() [` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3209** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3382** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 267, SwComposite 69, main 62, WRRenderBackend 62, WRSceneBuilder 56, Compositor 44, IPC I/O 11, DOM Worker 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 62 ms (2.0% of span): GC / CC 28, Idle 19, JavaScript 6, Other 5, Graphics 3, Layout 2
  - JS leaf 0 / native under JS 6 / native 57; buckets: ipc 62, gc_cc 34, poll_wait 21, harness_diagnostics 5, paint_layout 4, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `bool mozilla::detail::HashTable<char const* const, mozilla::` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 267 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 102, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 81, `int blendTextureNearestFast<true, glsl::sampler2D_` 15); SwComposite 69 ms (top self: `syscall [libc.so.6]` 63, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 62 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3293** CPU ms by thread group: main 164, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 164 ms (5.2% of span): Idle 104, Graphics 18, Layout 13, Other 9, Profiler 8, GC / CC 6
  - JS leaf 0 / native under JS 9 / native 154; buckets: ipc 157, poll_wait 105, paint_layout 43, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 104; `[]` 4; `sendmsg [libc.so.6]` 3; `getcontext [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3385** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3382** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 354, WRRenderBackend 58, SwComposite 58, WRSceneBuilder 52, main 45, Compositor 44, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (1.5% of span): GC / CC 27, Idle 12, DOM 4, Other 1, JavaScript 1, Graphics 0
  - JS leaf 0 / native under JS 5 / native 40; buckets: ipc 45, gc_cc 28, poll_wait 13, harness_diagnostics 5, array_buffer_copy 4, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `Native2WrappedNativeMap::Find(nsISupports*) const [libxul.so` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 354 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 109, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 44); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); SwComposite 58 ms (top self: `syscall [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `Composite [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3293** CPU ms by thread group: main 148, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 148 ms (4.9% of span): Idle 95, Graphics 20, Layout 13, Other 7, Profiler 7, GC / CC 5
  - JS leaf 0 / native under JS 3 / native 145; buckets: ipc 137, poll_wait 95, paint_layout 39, gc_cc 5, memcpy_memset 2, subprocess_pipe_io 1, canvas_2d 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 95; `[]` 6; `sendmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `write [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 6× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3188** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3227** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1455, SwComposite 131, main 105, WRRenderBackend 88, Compositor 32, WRSceneBuilder 25, IPC I/O 9, other 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 105 ms (5.0% of span): Idle 74, Other 9, JavaScript 8, Graphics 8, Layout 3, DOM 3
  - JS leaf 0 / native under JS 9 / native 96; buckets: ipc 105, poll_wait 89, paint_layout 11, gc_cc 8, harness_diagnostics 6, memcpy_memset 2, json_metadata 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 73; `[unknown]` 5; `[linux-vdso.so.1]` 3; `[axiosozo-dev]` 3; `QuoteJSONString(JSContext*, js::StringBuilder&, JSString*) [` 2; `webrtc::videocapturemodule::VideoCaptureImpl::CurrentDeviceN` 1
  - WebRender/compositor threads: Renderer 1455 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 490, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 285, `hypotf@@GLIBC_2.35 [libm.so.6]` 104); SwComposite 131 ms (top self: `syscall [libc.so.6]` 119, `__memmove_avx_unaligned_erms [libc.so.6]` 11, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 88 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `core::hash::BuildHasher::hash_one [libxul.so]` 3)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3293** CPU ms by thread group: main 93, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 93 ms (4.4% of span): Idle 65, Graphics 14, Other 7, Profiler 3, Layout 2, DOM 1
  - JS leaf 0 / native under JS 3 / native 90; buckets: ipc 91, poll_wait 65, paint_layout 17, canvas_2d 2, mozafterpaint_events 2, harness_diagnostics 1, array_buffer_copy 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 65; `getcontext [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `[]` 1; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3209** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3188** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 207, Renderer 48, WRRenderBackend 18, Compositor 18, WRSceneBuilder 15, SwComposite 12, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 207 ms (5.5% of span): Idle 47, Layout 41, GC / CC 32, Graphics 28, JavaScript 26, Other 20
  - JS leaf 4 / native under JS 30 / native 173; buckets: ipc 207, paint_layout 72, poll_wait 66, gc_cc 46, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `[axiosozo-dev]` 7; `recvmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 3
  - GC/CC markers: GCMajor 1× 59 ms, GCSlice 6× 26 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 26, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3293** CPU ms by thread group: main 67, IPC I/O 7, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 67 ms (1.8% of span): Idle 23, Other 11, GC / CC 9, JavaScript 7, Profiler 6, Layout 6
  - JS leaf 1 / native under JS 7 / native 59; buckets: ipc 63, poll_wait 24, paint_layout 14, gc_cc 11, array_buffer_copy 3, harness_diagnostics 3, memcpy_memset 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 3; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `mozilla::PresShell::EventHandler::ComputeFocusedEventTargetE` 1; `__strlen_avx2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3136** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 0, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `nsGlobalWindowInner::QueryInterface(nsID const&, void**) [li` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `nscstring_fallible_append_utf16_to_latin1_lossy_impl [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3209** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **105.8** (main 55.2, Renderer 18.4, StyleThread# 9.2, DOM Worker 9.2, glean.dispatche 4.6) | cef:renderer 23.0, AxioCEFProbe 23.0, cef:utility 4.6, Isolated Web Co 4.6 | — | 138.2 |
| plain | idle | — | — | **9.6** (main 6.7, Timer 1.4, IPC I/O Parent 0.5, Socket Thread 0.5, DOM Worker 0.5) | Web Content 3.8, AxioCEFProbe 3.4 | — | — |
| plain | raf | 60.0 | 21.6 | **28.2** (main 12.0, DOM Worker 3.6, Renderer 2.9, WRRende~ckend# 1.6, glean.dispatche 1.3) | cef:renderer 10.6, AxioCEFProbe 6.2, cef:gpu-process 5.5, Web Content 0.6 | — | — |
| plain | raf-nosampler | — | — | **19.8** (main 5.3, DOM Worker 3.6, Renderer 2.6, WRRende~ckend# 1.7, Compositor 1.3) | cef:renderer 11.0, AxioCEFProbe 6.6, cef:gpu-process 5.6, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.0 | 23.0 | **45.4** (main 22.2, DOM Worker 8.7, Backgro~Pool # 2.9, Renderer 2.9, SwComposite 1.9) | cef:gpu-process 21.7, cef:renderer 10.6, AxioCEFProbe 10.1 | — | — |
| plain | key | — | — | **17.5** (main 10.9, DOM Worker 1.6, Renderer 1.4, TaskCon~ller # 1.1, Timer 0.8) | AxioCEFProbe 2.8, cef:renderer 2.2, cef:gpu-process 0.3, WebExtensions 0.3 | 13.5 | — |
| plain | switch-to-gecko | — | — | **18.0** (DOM Worker 5.1, main 5.0, Indexed~ IO # 3.4, IPDL Background 1.7, TaskCon~ller # 1.0) | Web Content 0.2, Privileged Cont 0.2, WebExtensions 0.1, RDD Process 0.1 | — | 15493.5 |
| trace | switch-to-engine | — | — | **86.6** (Renderer 39.7, main 32.5, WRRende~ckend# 3.6, Compositor 3.6, SwComposite 3.6) | AxioCEFProbe 57.7, cef:gpu-process 36.1, cef:renderer 21.6, cef:utility 21.6 | — | 217.9 |
| trace | idle | — | — | **8.1** (main 5.7, Timer 1.4, IPDL Background 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 4.8, Web Content 1.0, cef:utility 0.5, cef:zygote 0.5 | — | — |
| trace | raf | 59.9 | 25.7 | **30.3** (main 13.6, DOM Worker 3.2, Renderer 2.9, WRRende~ckend# 1.6, glean.dispatche 1.3) | cef:renderer 10.6, AxioCEFProbe 6.5, cef:gpu-process 5.8 | — | — |
| trace | raf-nosampler | — | — | **20.1** (main 6.0, DOM Worker 3.6, Renderer 2.6, WRRende~ckend# 1.7, Compositor 1.3) | cef:renderer 11.0, AxioCEFProbe 6.6, cef:gpu-process 5.3, Isolated Web Co 0.3 | — | — |
| trace | scroll | 60.1 | 22.9 | **48.7** (main 23.2, DOM Worker 9.2, Backgro~Pool # 2.9, Renderer 2.4, glean.dispatche 1.9) | cef:gpu-process 20.8, cef:renderer 11.5, AxioCEFProbe 10.1 | — | — |
| trace | key | — | — | **19.9** (main 12.3, Renderer 1.6, DOM Worker 1.6, Timer 1.1, TaskCon~ller # 0.8) | cef:renderer 2.5, AxioCEFProbe 2.4, cef:gpu-process 0.5 | 14.6 | — |
| trace | switch-to-gecko | — | — | **28.6** (main 17.2, BgIOThr~Pool # 5.7, Renderer 5.7) | Web Content 5.7, Privileged Cont 5.7 | — | 136.1 |
| profile | switch-to-engine | — | — | **68.2** (main 36.1, Renderer 16.1, DOM Worker 8.0, SwComposite 4.0, SamplerThread 4.0) | Web Content 48.2, cef:renderer 20.1, AxioCEFProbe 20.1, cef:gpu-process 4.0 | — | 182.9 |
| profile | idle | — | — | **29.0** (DOM Worker 9.5, SamplerThread 9.5, main 7.6, Timer 1.9, glean.dispatche 0.5) | Web Content 9.5, AxioCEFProbe 4.2, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 60.0 | 21.8 | **57.1** (main 16.3, DOM Worker 13.1, SamplerThread 12.5, Renderer 3.2, WRRende~ckend# 2.2) | cef:renderer 11.8, Web Content 11.5, AxioCEFProbe 6.8, cef:gpu-process 6.4 | — | — |
| profile | raf-nosampler | — | — | **46.7** (DOM Worker 14.9, SamplerThread 10.6, main 7.6, Renderer 3.3, Compositor 2.0) | cef:renderer 11.6, Web Content 10.9, cef:gpu-process 6.3, AxioCEFProbe 6.3 | — | — |
| profile | scroll | 60.0 | 24.7 | **79.0** (main 28.7, DOM Worker 17.2, SamplerThread 12.5, Backgro~Pool # 3.8, Renderer 3.4) | cef:gpu-process 23.0, cef:renderer 11.5, AxioCEFProbe 10.0, Web Content 9.6 | — | — |
| profile | key | — | — | **45.7** (main 16.3, DOM Worker 10.6, SamplerThread 10.3, Timer 1.9, TaskCon~ller # 1.6) | Web Content 10.3, AxioCEFProbe 3.0, cef:renderer 2.7, WebExtensions 2.2 | 17.2 | — |
| profile | switch-to-gecko | — | — | **7.2** (SamplerThread 3.8, BgIOThr~Pool # 2.4, main 0.5, DOM Worker 0.3, IPDL Background 0.1) | Web Content 10.8, Privileged Cont 2.2, Isolated Web Co 2.1, WebExtensions 2.0 | — | 15055.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 9.4 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.76 | 0.40 | — | — | — | — | — | 0.012 |
| trace | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.17 | 0.13 | — | — | — | — | — | 0.009 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.17 | 0.12 | — | — | — | — | — | 0.008 |
| trace | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 5.9 | 0.0 | — | 0.30 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.1 | 0.0 | — | 0.41 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.0 | 0.0 | 0 | 0.0 | — | — | 6.7 | 0.0 | — | 3.15 | 0.93 | — | — | — | — | — | 0.006 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.21 | 0.17 | — | — | — | — | — | 0.012 |
| profile | raf-nosampler | 59.5 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.19 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.6 | 0.0 | 0 | 0.0 | — | — | 8.7 | 0.0 | — | 0.36 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.64 | 0.18 | — | — | — | — | — | 0.003 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.549 | 0.671 | 0.0045 | 0.0055 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.055 | 0.087 | 0.0033 | 0.0053 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.060 | 0.090 | 0.0036 | 0.0054 |
| plain | scroll | memfd | native | 122 | 122 | 0.199 | 0.224 | 0.0115 | 0.0130 |
| plain | key | memfd | native | 21 | 21 | 0.018 | 0.073 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 0.498 | 0.758 | 0.0047 | 0.0071 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 188 | 187 | 0.059 | 0.090 | 0.0035 | 0.0054 |
| trace | raf-nosampler | memfd | native | 184 | 184 | 0.063 | 0.087 | 0.0038 | 0.0052 |
| trace | scroll | memfd | native | 123 | 123 | 0.202 | 0.210 | 0.0118 | 0.0123 |
| trace | key | memfd | native | 21 | 21 | 0.017 | 0.077 | 0.0001 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.468 | 1.919 | 0.0103 | 0.0134 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.067 | 0.108 | 0.0040 | 0.0065 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.064 | 0.093 | 0.0038 | 0.0055 |
| profile | scroll | memfd | native | 123 | 123 | 0.230 | 0.243 | 0.0134 | 0.0141 |
| profile | key | memfd | native | 21 | 21 | 0.018 | 0.073 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 9.5 | 0.0 | — | 0.43 | 0.66 | — | — | 7.1 | 11.1 | 19.2 |
| profile | 0.8 | 11.8 | 0.1 | — | 0.70 | 1.10 | — | — | 7.7 | 14.2 | 20.8 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 87.5; write create 99.7; first frame applied (native receiver) 248.6; write frame_ack 251.7; write focus 264.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 28.8; first stdout read resolved 35.9; write shutdown 41.2

Switch timeline (profile, switch-to-engine, ms after the window start): write create 51.4; first stdout read resolved 63.4; first frame applied (native receiver) 211.2; write frame_ack 212.6; write focus 221.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 40.7; first stdout read resolved 53.3; write shutdown 56.4

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 92, Renderer 35, DOM Worker 17, WRRenderBackend 5, Compositor 4, WRSceneBuilder 3, IPC I/O 3, BgPool 2, SwComposite 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 92 ms (32.4% of span): JavaScript 34, Layout 28, Idle 20, DOM 4, Other 4, Graphics 2
  - JS leaf 1 / native under JS 49 / native 43; buckets: ipc 92, gc_cc 29, paint_layout 29, array_buffer_copy 23, poll_wait 23, harness_diagnostics 12, worker_messaging 9, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 20; `nsXPCWrappedJS::CallQueryInterfaceOnJSObject(JSContext*, JSO` 5; `js::jit::CacheIRCompiler::emitGuardToObject(js::jit::ValOper` 5; `[axiosozo-dev]` 3; `style::properties::generated::longhands::border_bottom_left_` 3; `mozilla::StyleRect<mozilla::StyleLengthPercentage>::~StyleRe` 3
  - WebRender/compositor threads: Renderer 35 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1, `webrender::batch::AlphaBatchBuilder::set_params_an` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `__memset_avx2_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 0, `__memset_avx2_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 17 ms: buckets subprocess_pipe_io 17, worker_messaging 17, ipc 17, js_ctypes 16, poll_wait 16, array_buffer_copy 0; top self: `poll [libc.so.6]` 16; `write [libc.so.6]` 0; `PLDHashTable::Search(void const*) const [libxul.so` 0; `std::tuple<js::FixedLengthArrayBufferObject*, unsi` 0
- **tab:4250** CPU ms by thread group: main 55, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 55 ms (25.6% of span): Other 43, DOM 4, Profiler 3, JavaScript 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 49; buckets: ipc 42, array_buffer_copy 18, gc_cc 10, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1, image_container 1
  - top self: `[libexpat.so.1]` 4; `__strlen_avx2 [libc.so.6]` 4; `JSAtom* PermanentlyAtomizeAndCopyCharsNonStaticValidLength<u` 4; `__lll_lock_wake [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__strcmp_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4245** CPU ms by thread group: main 48, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (17.3% of span): Other 35, JavaScript 5, DOM 5, Idle 2, Profiler 2, GC / CC 0
  - JS leaf 0 / native under JS 7 / native 42; buckets: ipc 37, gc_cc 16, array_buffer_copy 15, subprocess_pipe_io 8, poll_wait 3, image_container 1
  - top self: `[]` 5; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 4; `[libfontconfig.so.1]` 3; `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `sendmsg [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4034** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.1% of span): Other 2, Idle 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `read [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 152, DOM Worker 118, other 25, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 152 ms (7.1% of span): Idle 123, JavaScript 14, Other 11, DOM 3, Profiler 1
  - JS leaf 1 / native under JS 15 / native 137; buckets: ipc 152, poll_wait 130, harness_diagnostics 14, gc_cc 6, array_buffer_copy 4, json_metadata 2, subprocess_pipe_io 1, native_receiver 1
  - top self: `poll [libc.so.6]` 123; `recvmsg [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedPropMa` 2; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 118 ms: buckets subprocess_pipe_io 118, js_ctypes 118, worker_messaging 118, ipc 118, poll_wait 118; top self: `poll [libc.so.6]` 118
- **tab:4034** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `getcontext [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3511** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsThread::HasPendingEvents(bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 468, DOM Worker 305, Renderer 88, WRRenderBackend 53, Compositor 46, SwComposite 43, BgPool 39, other 37, ImageBridge 20, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 468 ms (14.8% of span): Idle 265, JavaScript 95, Other 51, GC / CC 25, Profiler 16, DOM 16
  - JS leaf 10 / native under JS 98 / native 360; buckets: ipc 467, poll_wait 295, gc_cc 122, worker_messaging 49, engine_stream_read 42, json_metadata 29, harness_diagnostics 22, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 268; `[unknown]` 18; `recvmsg [libc.so.6]` 14; `write [libc.so.6]` 9; `[axiosozo-dev]` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5
  - GC/CC markers: GCMajor 1× 1263 ms, GCSlice 9× 33 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 88 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 5); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 39 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 20 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 305 ms: buckets subprocess_pipe_io 305, worker_messaging 305, ipc 305, js_ctypes 283, poll_wait 274, gc_cc 13; top self: `poll [libc.so.6]` 274; `[axiosozo-dev]` 3; `[unknown]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 2; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigne` 1
- **tab:3551** CPU ms by thread group: main 12, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.4% of span): GC / CC 9, Idle 3
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 11, gc_cc 9, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 3× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3464** CPU ms by thread group: main 12, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.4% of span): GC / CC 10, Idle 2
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 10, gc_cc 10, poll_wait 3
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 5; `poll [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl<js::` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 59 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3511** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, gc_cc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `void js::gc::GCRuntime::maybeMarkWeaklyHeldAtom<JSAtom>(JSAt` 0; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 0; `mozilla::MemoryTelemetry::Get() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 3 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 348, main 225, Renderer 84, WRRenderBackend 49, Compositor 45, SwComposite 43, BgPool 36, ImageBridge 19, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 225 ms (7.4% of span): Idle 123, JavaScript 62, DOM 20, Other 19, Profiler 2
  - JS leaf 9 / native under JS 70 / native 146; buckets: ipc 225, poll_wait 135, gc_cc 78, worker_messaging 48, engine_stream_read 44, json_metadata 29, subprocess_pipe_io 17, native_receiver 13
  - top self: `poll [libc.so.6]` 124; `[unknown]` 11; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 3
  - WebRender/compositor threads: Renderer 84 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `syscall [libc.so.6]` 4); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `__lll_lock_wait [libc.so.6]` 0, `nsTArrayInfallibleAllocator::ResultTypeProxy nsTAr` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 348 ms: buckets subprocess_pipe_io 348, worker_messaging 348, ipc 348, js_ctypes 271, poll_wait 265, gc_cc 64; top self: `poll [libc.so.6]` 265; `madvise [libc.so.6]` 8; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 4
- **tab:4245** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3551** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 554, DOM Worker 294, BgPool 61, Renderer 57, WRRenderBackend 35, Compositor 28, SwComposite 27, other 23, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 554 ms (26.2% of span): Idle 282, JavaScript 110, Other 62, GC / CC 30, DOM 27, Graphics 26
  - JS leaf 13 / native under JS 114 / native 427; buckets: ipc 553, poll_wait 370, gc_cc 135, paint_layout 57, worker_messaging 55, engine_stream_read 35, subprocess_pipe_io 32, array_buffer_copy 28
  - top self: `poll [libc.so.6]` 285; `[unknown]` 14; `write [libc.so.6]` 12; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 7; `read [libc.so.6]` 7; `recvmsg [libc.so.6]` 7
  - GC/CC markers: GCSlice 5× 20 ms, CCSlice 3× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 57 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 2); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 1, `webrender::render_task_graph::RenderTaskGraphBuild` 0); SwComposite 27 ms (top self: `syscall [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 61 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 53, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 294 ms: buckets subprocess_pipe_io 294, worker_messaging 294, ipc 294, js_ctypes 249, poll_wait 240, gc_cc 13; top self: `poll [libc.so.6]` 240; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `[axiosozo-dev]` 3; `[unknown]` 3; `read [libc.so.6]` 2
- **tab:4245** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `nsJSContext::MaybePokeGC() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 558, DOM Worker 258, Renderer 58, other 40, Compositor 19, SwComposite 18, WRRenderBackend 16, WRWorker 12, WRSceneBuilder 10, BgPool 3, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 558 ms (15.1% of span): Idle 213, JavaScript 105, GC / CC 73, Other 50, Layout 43, Graphics 35
  - JS leaf 10 / native under JS 166 / native 381; buckets: ipc 557, poll_wait 259, gc_cc 184, paint_layout 94, worker_messaging 89, engine_stream_read 50, json_metadata 24, subprocess_pipe_io 23
  - top self: `poll [libc.so.6]` 215; `[axiosozo-dev]` 16; `[unknown]` 16; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `write [libc.so.6]` 10; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 8
  - GC/CC markers: GCMajor 2× 1103 ms, GCSlice 15× 60 ms, CCSlice 5× 13 ms, GCMinor 3× 6 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 16, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 5); SwComposite 18 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `<webrender::frame_allocator::FrameAllocator as all` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 243, poll_wait 238, gc_cc 8; top self: `poll [libc.so.6]` 238; `js::SetIntegrityLevel(JSContext*, JS::Handle<JSObj` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 2; `__lll_lock_wait [libc.so.6]` 2; `[unknown]` 1
- **tab:3464** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::ipc::NodeChannel::SendMessage(std::unique_ptr<IPC::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4250** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 345, main 80, DOM Worker 53, Renderer 18, IPC I/O 7, Compositor 5, WRRenderBackend 3, other 3, WRSceneBuilder 2, SwComposite 2, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 80 ms (0.5% of span): JavaScript 25, Idle 20, Layout 16, Other 6, DOM 6, Profiler 4
  - JS leaf 2 / native under JS 38 / native 40; buckets: ipc 80, paint_layout 22, poll_wait 22, gc_cc 20, array_buffer_copy 14, harness_diagnostics 11, worker_messaging 7, engine_stream_read 7
  - top self: `poll [libc.so.6]` 20; `mprotect [libc.so.6]` 8; `[axiosozo-dev]` 4; `__lll_lock_wait [libc.so.6]` 3; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 3× 1 ms
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3, `hypotf@@GLIBC_2.35 [libm.so.6]` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `mozilla::layers::APZCTreeManager::PrepareNodeForLa` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 345 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 323, `write [libc.so.6]` 8, `unlink [libc.so.6]` 8); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 53 ms: buckets subprocess_pipe_io 53, worker_messaging 53, ipc 53, gc_cc 37, poll_wait 13, js_ctypes 10; top self: `poll [libc.so.6]` 10; `madvise [libc.so.6]` 5; `[axiosozo-dev]` 5; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 3; `mozilla::SourceLocation::~SourceLocation() [libxul` 3
- **tab:3551** CPU ms by thread group: main 9, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.1% of span): Idle 6, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 7; buckets: ipc 8, poll_wait 6, gc_cc 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `js::jit::AssemblerX86Shared::jmpSrc(js::jit::Label*) [libxul` 1; `js::jit::MacroAssembler::call(js::jit::Address const&) [libx` 0; `js::Wrapper::New(JSContext*, JSObject*, js::Wrapper const*, ` 0; `g_main_context_iteration [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4034** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, Layout 1, Graphics 1
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `[]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::ipc::PIdleSchedulerChild::OnMessageReceived(IPC::Me` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **108.5** (main 40.0, Renderer 40.0, glean.dispatche 5.7, StyleThread# 5.7, WRRende~ckend# 5.7) | AxioCEFProbe 17.1, cef:renderer 17.1, cef:utility 5.7 | — | 142.9 |
| plain | idle | — | — | **3.4** (main 2.9, IPDL Background 0.5) | Web Content 3.4 | — | — |
| plain | raf | 60.0 | 21.0 | **25.2** (main 7.8, Renderer 3.9, SwComposite 3.2, Backgro~Pool # 2.6, DOM Worker 2.6) | cef:gpu-process 12.3, cef:renderer 9.4, AxioCEFProbe 7.1 | — | — |
| plain | raf-nosampler | — | — | **18.9** (main 3.6, Renderer 3.6, SwComposite 3.0, Backgro~Pool # 2.7, DOM Worker 2.3) | cef:gpu-process 11.6, cef:renderer 8.0, AxioCEFProbe 7.0 | — | — |
| plain | scroll | 60.0 | 24.9 | **42.2** (main 17.1, DOM Worker 5.9, Backgro~Pool # 5.4, Renderer 4.4, SwComposite 3.4) | cef:gpu-process 51.0, cef:renderer 12.2, AxioCEFProbe 10.8 | — | — |
| plain | key | — | — | **14.2** (main 6.9, Renderer 2.5, DOM Worker 1.1, TaskCon~ller # 0.8, SwComposite 0.8) | AxioCEFProbe 2.0, cef:renderer 1.6, cef:gpu-process 0.9, WebExtensions 0.3 | 11.5 | — |
| plain | switch-to-gecko | — | — | **10.3** (DOM Worker 3.8, main 3.5, IPDL Background 1.0, TaskCon~ller # 1.0, glean.dispatche 0.2) | Privileged Cont 0.1, WebExtensions 0.1, Web Content 0.1, Isolated Web Co 0.1 | — | 15263.5 |
| trace | switch-to-engine | — | — | **106.2** (Renderer 66.8, main 24.3, Compositor 6.1, SwComposite 3.0, DOM Worker 3.0) | AxioCEFProbe 51.6, cef:gpu-process 33.4, cef:utility 15.2, cef:renderer 12.1 | — | 291.3 |
| trace | idle | — | — | **3.4** (main 2.9, Timer 0.5) | AxioCEFProbe 2.5, Web Content 2.4 | — | — |
| trace | raf | 60.0 | 20.7 | **24.5** (main 7.5, Renderer 4.2, SwComposite 3.2, Backgro~Pool # 3.2, DOM Worker 2.6) | cef:gpu-process 11.3, cef:renderer 9.1, AxioCEFProbe 7.1, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **21.5** (main 4.6, Renderer 4.3, SwComposite 3.3, Backgro~Pool # 2.7, DOM Worker 2.3) | cef:gpu-process 10.6, cef:renderer 9.3, AxioCEFProbe 7.6 | — | — |
| trace | scroll | 59.9 | 20.5 | **40.6** (main 16.1, DOM Worker 7.3, Backgro~Pool # 5.4, Renderer 3.9, SwComposite 2.9) | cef:gpu-process 51.8, AxioCEFProbe 10.8, cef:renderer 10.7 | — | — |
| trace | key | — | — | **13.0** (main 6.3, Renderer 2.5, SwComposite 1.1, Timer 0.8, DOM Worker 0.8) | cef:renderer 2.6, AxioCEFProbe 2.3, cef:gpu-process 0.9, Web Content 0.3 | 11.5 | — |
| trace | switch-to-gecko | — | — | **33.0** (main 13.2, Renderer 13.2, WRScene~ilder# 6.6) |  | — | 129.7 |
| profile | switch-to-engine | — | — | **107.9** (main 39.7, Renderer 34.0, Socket Thread 5.7, IPDL Background 5.7, WRRende~ckend# 5.7) | cef:renderer 22.7, AxioCEFProbe 22.7, cef:utility 5.7 | — | 139.3 |
| profile | idle | — | — | **16.8** (SamplerThread 7.2, DOM Worker 4.8, main 3.4, Timer 1.4) | Web Content 6.7, WebExtensions 2.0, Privileged Cont 1.5, Isolated Web Co 1.4 | — | — |
| profile | raf | 60.0 | 21.1 | **49.8** (main 11.9, DOM Worker 9.3, SamplerThread 9.3, Renderer 5.2, SwComposite 3.5) | cef:gpu-process 12.5, cef:renderer 10.3, AxioCEFProbe 8.0, Web Content 7.4 | — | — |
| profile | raf-nosampler | — | — | **50.9** (main 10.6, DOM Worker 9.3, SamplerThread 8.3, Renderer 4.6, SwComposite 3.6) | cef:gpu-process 11.6, cef:renderer 10.2, AxioCEFProbe 8.7, Web Content 6.3 | — | — |
| profile | scroll | 60.2 | 21.1 | **68.6** (main 23.2, DOM Worker 13.5, SamplerThread 9.7, Backgro~Pool # 6.3, Renderer 5.3) | cef:gpu-process 55.6, cef:renderer 12.6, AxioCEFProbe 10.6, Web Content 7.2 | — | — |
| profile | key | — | — | **36.8** (main 11.5, SamplerThread 7.7, DOM Worker 7.1, Renderer 2.5, TaskCon~ller # 1.9) | Web Content 6.6, cef:renderer 2.7, AxioCEFProbe 2.4, WebExtensions 2.2 | 13.7 | — |
| profile | switch-to-gecko | — | — | **4.1** (SamplerThread 3.1, DOM Worker 0.4, main 0.3, Renderer 0.1, Timer 0.1) | Web Content 6.6, Privileged Cont 1.5, Isolated Web Co 1.3, WebExtensions 1.1 | — | 15024.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.7 | 0.0 | 0 | 0.0 | — | — | 29.2 | 0.0 | — | 3.98 | 0.56 | — | — | — | — | — | 0.003 |
| trace | raf | 59.6 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.26 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 59.6 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.23 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 9.4 | 0.0 | — | 0.49 | 0.11 | — | — | — | — | — | 0.007 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.9 | 0.0 | — | 0.20 | 0.08 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.0 | 0.0 | 0 | 0.0 | — | — | 33.4 | 0.0 | — | 5.50 | 0.81 | — | — | — | — | — | 0.004 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.30 | 0.14 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.30 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 58.8 | 0.0 | 0 | 0.0 | — | — | 10.5 | 0.0 | — | 0.59 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.1 | 0.0 | — | 0.33 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 5.089 | 5.332 | 0.0264 | 0.0276 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.172 | 0.266 | 0.0103 | 0.0160 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.151 | 0.252 | 0.0091 | 0.0152 |
| plain | scroll | memfd | native | 120 | 120 | 0.438 | 0.479 | 0.0256 | 0.0279 |
| plain | key | memfd | native | 21 | 21 | 0.041 | 0.143 | 0.0002 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 3.128 | 5.463 | 0.0178 | 0.0311 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.185 | 0.271 | 0.0111 | 0.0162 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.166 | 0.270 | 0.0100 | 0.0162 |
| trace | scroll | memfd | native | 121 | 121 | 0.437 | 0.481 | 0.0256 | 0.0282 |
| trace | key | memfd | native | 21 | 21 | 0.042 | 0.143 | 0.0002 | 0.0008 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 5.317 | 5.314 | 0.0266 | 0.0266 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 188 | 188 | 0.212 | 0.288 | 0.0127 | 0.0173 |
| profile | raf-nosampler | memfd | native | 182 | 181 | 0.211 | 0.287 | 0.0126 | 0.0171 |
| profile | scroll | memfd | native | 123 | 123 | 0.492 | 0.558 | 0.0289 | 0.0328 |
| profile | key | memfd | native | 21 | 21 | 0.051 | 0.138 | 0.0003 | 0.0008 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.9 | 0.0 | — | 0.19 | 0.37 | — | — | 8.4 | 7.7 | 16.9 |
| profile | 0.6 | 9.1 | 0.0 | — | 0.31 | 0.61 | — | — | 8.4 | 10.5 | 20.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 117.7; write create 125.8; first frame applied (native receiver) 309.6; write frame_ack 310.4; write focus 314.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 17.6; first stdout read resolved 24.7; write shutdown 28.3

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.0; first stdout read resolved 40.7; first frame applied (native receiver) 154.5; write frame_ack 155.3; write focus 163.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 26.7; first stdout read resolved 37.2; write shutdown 42.4

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 67, main 62, BgPool 10, DOM Worker 8, SwComposite 7, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, Socket 1, IPC I/O 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 62 ms (31.4% of span): Layout 21, JavaScript 13, Idle 11, DOM 6, Graphics 6, Other 5
  - JS leaf 1 / native under JS 31 / native 30; buckets: ipc 62, paint_layout 30, gc_cc 16, array_buffer_copy 14, poll_wait 12, harness_diagnostics 10, worker_messaging 2, engine_stream_read 2
  - top self: `poll [libc.so.6]` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 5; `selectors::matching::matches_simple_selector [libxul.so]` 5; `style::rule_collector::RuleCollector<E>::collect_stylist_rul` 4; `JSStructuredCloneWriter::startWrite(JS::Handle<JS::Value>) [` 3
  - WebRender/compositor threads: Renderer 67 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 22, `__lll_lock_wake [libc.so.6]` 9, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 7); SwComposite 7 ms (top self: `syscall [libc.so.6]` 7); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 10 ms (top self: `__memset_avx512_unaligned_erms [libc.so.6]` 4, `ARGBSetRow_X86 [libxul.so]` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 8 ms: buckets subprocess_pipe_io 8, worker_messaging 8, ipc 8, js_ctypes 8, poll_wait 8; top self: `poll [libc.so.6]` 8; `mozilla::dom::AutoJSAPI::ReportException() [libxul` 0; `[unknown]` 0; `EnqueuePromiseReactionJob(JSContext*, JS::Handle<J` 0; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 0
- **tab:4108** CPU ms by thread group: main 13, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 13 ms (6.4% of span): Other 9, JavaScript 2, Idle 1, DOM 0
  - JS leaf 0 / native under JS 4 / native 9; buckets: ipc 13, gc_cc 7, subprocess_pipe_io 4, memcpy_memset 1, image_container 1, poll_wait 1
  - top self: `sendmsg [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `syscall [libc.so.6]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `js::frontend::BytecodeEmitter::markSimpleBreakpoint() [libxu` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3920** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4104** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.6% of span): Other 1, Idle 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `sendmsg [libc.so.6]` 1; `poll [libc.so.6]` 0; `[]` 0
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 73, DOM Worker 65, other 13, IPC I/O 1, Socket 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 73 ms (3.5% of span): Idle 64, JavaScript 4, Other 4, DOM 1, Profiler 1
  - JS leaf 0 / native under JS 4 / native 69; buckets: ipc 73, poll_wait 66, harness_diagnostics 4, array_buffer_copy 4, gc_cc 2, native_receiver 0, memcpy_memset 0, json_metadata 0
  - top self: `poll [libc.so.6]` 64; `recvmsg [libc.so.6]` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::V` 1; `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 65 ms: buckets subprocess_pipe_io 65, js_ctypes 65, worker_messaging 65, ipc 65, poll_wait 65; top self: `poll [libc.so.6]` 65
- **tab:3343** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.4% of span): GC / CC 6, Idle 2, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 6, gc_cc 6, poll_wait 3, memcpy_memset 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `poll [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 7 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3429** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.4% of span): GC / CC 7, Idle 1
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, gc_cc 7, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3390** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 351, DOM Worker 222, Renderer 142, SwComposite 106, BgPool 97, WRRenderBackend 47, Compositor 35, other 25, ImageBridge 15, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 351 ms (11.2% of span): Idle 216, JavaScript 66, GC / CC 29, Other 25, DOM 11, Profiler 3
  - JS leaf 10 / native under JS 66 / native 275; buckets: ipc 351, poll_wait 230, gc_cc 89, engine_stream_read 34, worker_messaging 30, json_metadata 19, harness_diagnostics 16, subprocess_pipe_io 14
  - top self: `poll [libc.so.6]` 220; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `write [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `recvmsg [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 785 ms, GCSlice 7× 26 ms, CCSlice 2× 4 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 142 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `__memmove_avx512_unaligned_erms [libc.so.6]` 35, `syscall [libc.so.6]` 5); SwComposite 106 ms (top self: `syscall [libc.so.6]` 88, `__memmove_avx512_unaligned_erms [libc.so.6]` 15, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 44, `webrender::tile_cache::TileCacheInstance::update_p` 0, `webrender::invalidation::quadtree::TileNode::updat` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 97 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 75, `__memmove_avx512_unaligned_erms [libc.so.6]` 21, `write [libc.so.6]` 1); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `__lll_lock_wait [libc.so.6]` 0, `IPC::ParamTraits<mozilla::layers::AsyncParentMessa` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 222 ms: buckets subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 206, poll_wait 200, gc_cc 7; top self: `poll [libc.so.6]` 200; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 2; `[unknown]` 1; `__lll_lock_wait [libc.so.6]` 1; `write [libc.so.6]` 1
- **tab:3390** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3925** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: main 303, DOM Worker 255, BgPool 158, Renderer 138, SwComposite 103, Socket 56, WRRenderBackend 45, Compositor 34, ImageBridge 14, WRSceneBuilder 7, other 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 303 ms (10.0% of span): Idle 129, Network 61, JavaScript 57, DOM 28, Other 27, Profiler 2
  - JS leaf 8 / native under JS 78 / native 218; buckets: ipc 303, poll_wait 139, gc_cc 85, array_buffer_copy 52, worker_messaging 44, memcpy_memset 33, engine_stream_read 24, json_metadata 19
  - top self: `poll [libc.so.6]` 130; `__memmove_avx512_unaligned_erms [libc.so.6]` 18; `__memset_avx512_unaligned_erms [libc.so.6]` 16; `zlib_rs::inflate::inflate_fast_help_avx2 [libxul.so]` 15; `[unknown]` 11; `decltype (((std::declval<mozilla::dom::TypedArray_base<JS::T` 10
  - WebRender/compositor threads: Renderer 138 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 80, `__memmove_avx512_unaligned_erms [libc.so.6]` 36, `syscall [libc.so.6]` 8); SwComposite 103 ms (top self: `syscall [libc.so.6]` 89, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 92 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 78, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); BgIOThreadPool #2 65 ms (top self: `[libfreeblpriv3.so]` 52, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `read [libc.so.6]` 3); ImageBridgeChld 14 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0)
  - busiest DOM Worker 213 ms: buckets subprocess_pipe_io 213, worker_messaging 213, ipc 213, js_ctypes 202, poll_wait 199, gc_cc 5; top self: `poll [libc.so.6]` 199; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:3429** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3411** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 452, DOM Worker 228, BgPool 128, Renderer 91, SwComposite 68, WRRenderBackend 35, Compositor 23, other 17, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 452 ms (21.6% of span): Idle 262, JavaScript 71, Other 45, DOM 23, Graphics 22, GC / CC 15
  - JS leaf 12 / native under JS 80 / native 360; buckets: ipc 452, poll_wait 335, gc_cc 82, paint_layout 49, worker_messaging 39, subprocess_pipe_io 19, harness_diagnostics 17, engine_stream_read 17
  - top self: `poll [libc.so.6]` 273; `[unknown]` 11; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `write [libc.so.6]` 4
  - GC/CC markers: GCSlice 5× 7 ms, CCSlice 2× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 91 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx512_unaligned_erms [libc.so.6]` 18, `syscall [libc.so.6]` 10); SwComposite 67 ms (top self: `syscall [libc.so.6]` 67, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 2, `webrender::picture::PictureInstance::take_context ` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 127 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `__memmove_avx512_unaligned_erms [libc.so.6]` 36, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `[linux-vdso.so.1]` 0, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0); BgIOThreadPool #3 1 ms (top self: `open64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 229 ms: buckets subprocess_pipe_io 229, worker_messaging 229, ipc 229, js_ctypes 211, poll_wait 202, gc_cc 6; top self: `poll [libc.so.6]` 202; `__memset_avx512_unaligned_erms [libc.so.6]` 4; `getcontext [libc.so.6]` 3; `js::jit::InlineFrameIterator::findNextFrame() [lib` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:3429** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3411** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 390, DOM Worker 179, Renderer 96, SwComposite 44, other 25, Compositor 14, WRRenderBackend 14, WRWorker 10, WRSceneBuilder 8, BgPool 5, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 390 ms (10.7% of span): Idle 146, GC / CC 67, JavaScript 64, Layout 36, Graphics 26, Other 26
  - JS leaf 16 / native under JS 105 / native 269; buckets: ipc 390, poll_wait 188, gc_cc 142, paint_layout 67, worker_messaging 53, engine_stream_read 40, subprocess_pipe_io 16, harness_diagnostics 10
  - top self: `poll [libc.so.6]` 149; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `[unknown]` 11; `recvmsg [libc.so.6]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 6; `[axiosozo-dev]` 4
  - GC/CC markers: GCMajor 2× 816 ms, GCSlice 14× 49 ms, CCSlice 3× 11 ms, GCMinor 3× 5 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 97 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 38, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); SwComposite 44 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 23, `syscall [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `core::hash::BuildHasher::hash_one [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `mozilla::layers::ImageBridgeChild::UpdateImageClie` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 179 ms: buckets subprocess_pipe_io 179, worker_messaging 179, ipc 179, js_ctypes 168, poll_wait 166, gc_cc 5; top self: `poll [libc.so.6]` 166; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `write [libc.so.6]` 1
- **tab:3343** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 0, JavaScript 0, Profiler 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<moz` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `js::ToBooleanSlow(JS::Handle<JS::Value>) [libxul.so]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.m` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3429** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: DOM Worker 54, main 50, Renderer 31, BgPool 7, IPC I/O 5, Compositor 5, SwComposite 4, WRRenderBackend 2, WRSceneBuilder 2, other 2, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 50 ms (0.3% of span): Idle 15, Layout 11, JavaScript 10, Other 9, DOM 3, Graphics 1
  - JS leaf 1 / native under JS 19 / native 30; buckets: ipc 50, poll_wait 16, paint_layout 16, harness_diagnostics 8, array_buffer_copy 8, gc_cc 7, memcpy_memset 3, subprocess_pipe_io 3
  - top self: `poll [libc.so.6]` 15; `madvise [libc.so.6]` 3; `sendmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `hypotf@@GLIBC_2.35 [libm.so.6]` 5); SwComposite 4 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 6 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 2, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `syscall [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 55 ms: buckets subprocess_pipe_io 55, worker_messaging 55, ipc 55, gc_cc 43, poll_wait 12, js_ctypes 11; top self: `poll [libc.so.6]` 10; `[axiosozo-dev]` 5; `madvise [libc.so.6]` 5; `std::unique_ptr<mozilla::ProfileBufferChunk, std::` 4; `mozilla::SourceLocation::~SourceLocation() [libxul` 3
- **tab:3411** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, gc_cc 0
  - top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `sendmsg [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3429** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `[]` 0; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3920** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Layout 0, Other 0, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 0, canvas_2d 0
  - top self: `poll [libc.so.6]` 3; `SkCanvas::setMatrix(SkMatrix const&) [libxul.so]` 0; `PR_GetThreadPrivate [libnspr4.so]` 0; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder` 0; `<firefox_on_glean::private::labeled_counter::LabeledCounterM` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.5 | 17.2 | **7.3** (Renderer 3.4, main 2.4, WRRende~ckend# 0.5, Compositor 0.5, DOM Worker 0.5) | Web Content 3.9, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **30.2** (Renderer 17.0, WRRende~ckend# 2.6, main 2.0, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.9, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **21.9** (Renderer 10.3, WRRende~ckend# 2.3, main 1.7, glean.dispatche 1.7, WRScene~ilder# 1.7) | Isolated Web Co 4.7, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **46.5** (Renderer 30.1, main 5.4, WRRende~ckend# 3.5, WRScene~ilder# 1.5, Compositor 1.5) | Isolated Web Co 5.0 | — | — |
| plain | key | — | — | **8.3** (main 4.8, Renderer 0.8, WRRende~ckend# 0.8, TaskCon~ller # 0.5, Compositor 0.5) | Isolated Web Co 1.6, Web Content 0.3 | 9.5 | — |
| trace | idle | 59.3 | 17.1 | **6.9** (main 2.9, TaskCon~ller # 1.5, Softwar~cThread 1.0, Timer 0.5, IPDL Background 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **19.2** (Renderer 10.1, WRRende~ckend# 2.3, glean.dispatche 1.6, WRScene~ilder# 1.6, Compositor 1.3) | Isolated Web Co 4.2, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **20.6** (Renderer 10.3, WRRende~ckend# 2.3, glean.dispatche 1.7, WRScene~ilder# 1.7, main 1.3) | Isolated Web Co 5.0, Privileged Cont 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **48.6** (Renderer 30.2, main 6.4, WRRende~ckend# 3.5, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 5.0 | — | — |
| trace | key | — | — | **66.4** (main 19.2, DOM Worker 18.1, IndexedDB IO # 14.1, IPDL Background 6.4, TaskCon~ller # 2.7) | Isolated Web Co 1.9, WebExtensions 0.3, RDD Process 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **10.1** (SamplerThread 4.8, main 2.9, TaskCon~ller # 1.9, IPDL Background 0.5) | Web Content 7.2, Isolated Web Co 5.3, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **33.5** (Renderer 12.4, SamplerThread 6.5, WRRende~ckend# 2.9, main 2.6, Compositor 2.0) | Isolated Web Co 11.4, Web Content 6.8, WebExtensions 2.0, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **30.0** (Renderer 12.6, SamplerThread 6.3, WRRende~ckend# 3.0, Compositor 2.0, glean.dispatche 1.7) | Isolated Web Co 11.3, Web Content 6.6, WebExtensions 1.7, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.2 | **66.5** (Renderer 34.2, main 8.3, SamplerThread 8.3, WRRende~ckend# 4.9, Compositor 2.4) | Isolated Web Co 11.2, Web Content 8.3, Socket Process 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **15.7** (main 5.9, SamplerThread 4.5, Renderer 1.1, TaskCon~ller # 0.8, glean.dispatche 0.5) | Web Content 6.9, Isolated Web Co 4.3, Privileged Cont 2.2, WebExtensions 1.9 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 54, DOM Worker 2, Compositor 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (2.6% of span): GC / CC 30, Other 8, Idle 7, JavaScript 6, DOM 2, Graphics 1
  - JS leaf 1 / native under JS 7 / native 46; buckets: ipc 53, gc_cc 36, poll_wait 12, harness_diagnostics 5, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 2, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `mprotect [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 25 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #4 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0; `__lll_lock_wake [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 37, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (1.8% of span): Idle 25, GC / CC 6, JavaScript 4, Profiler 1, Other 1, DOM 0
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 35, poll_wait 24, gc_cc 8, harness_diagnostics 4, array_buffer_copy 2, paint_layout 1, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 24; `[]` 1; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8507** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8461** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 354, WRRenderBackend 81, main 72, WRSceneBuilder 60, Compositor 52, SwComposite 22, IPC I/O 13, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 72 ms (2.3% of span): GC / CC 34, Idle 25, JavaScript 7, Other 3, Layout 3
  - JS leaf 0 / native under JS 7 / native 65; buckets: ipc 72, gc_cc 40, poll_wait 27, harness_diagnostics 5, paint_layout 3, subprocess_pipe_io 2, array_buffer_copy 1, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `[axiosozo-dev]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `syscall [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 61 ms, GCSlice 6× 27 ms, CCSlice 1× 8 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 353 ms (top self: `__syscall_cancel_arch [libc.so.6]` 101, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 68, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 49); WRRenderBackend#0 81 ms (top self: `syscall [libc.so.6]` 62, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 54 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >` 0; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 212, IPC I/O 20, other 5, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 212 ms (6.8% of span): Idle 104, Graphics 36, Layout 27, Other 23, Profiler 14, JavaScript 6
  - JS leaf 1 / native under JS 12 / native 198; buckets: ipc 199, poll_wait 107, paint_layout 89, gc_cc 5, harness_diagnostics 4, memcpy_memset 4, canvas_2d 3, array_buffer_copy 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 115; `[]` 5; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2; `getcontext [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8358** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8331** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 354, WRRenderBackend 75, WRSceneBuilder 59, Compositor 50, main 17, SwComposite 16, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 17 ms (0.6% of span): Idle 13, JavaScript 3, Graphics 0, Other 0
  - JS leaf 0 / native under JS 3 / native 14; buckets: ipc 17, poll_wait 14, harness_diagnostics 3, array_buffer_copy 2, gc_cc 2, subprocess_pipe_io 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::frontend::RecyclableNameMap<unsigned int>* js::frontend:` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 1; `mozilla::RetainedDisplayListBuilder::PreProcessDisplayList(m` 0; `[linux-vdso.so.1]` 0
  - WebRender/compositor threads: Renderer 354 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 95, `__syscall_cancel_arch [libc.so.6]` 88, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 40); WRRenderBackend#0 75 ms (top self: `syscall [libc.so.6]` 63, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 2); WRSceneBuilder#0 52 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::gc::GCRuntime::endSweepingSweepGroup(JS::GCCon` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 199, IPC I/O 19, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 199 ms (6.6% of span): Idle 98, Graphics 34, Layout 32, Other 14, Profiler 12, GC / CC 7
  - JS leaf 0 / native under JS 7 / native 192; buckets: ipc 184, poll_wait 99, paint_layout 78, gc_cc 8, memcpy_memset 5, canvas_2d 2, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 5; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[linux-vdso.so.1]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 3
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 6× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8461** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8503** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 685, main 162, WRRenderBackend 85, SwComposite 44, Compositor 34, WRSceneBuilder 26, IPC I/O 10, Socket 1, other 1, BgPool 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 162 ms (7.9% of span): Idle 78, GC / CC 36, Other 18, Graphics 11, JavaScript 9, DOM 7
  - JS leaf 1 / native under JS 9 / native 152; buckets: ipc 158, poll_wait 100, gc_cc 42, paint_layout 15, harness_diagnostics 5, memcpy_memset 3, array_buffer_copy 2, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 80; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `nsWindowRoot::cycleCollection::TraceWrapper(void*, TraceCall` 5; `[linux-vdso.so.1]` 5; `[axiosozo-dev]` 3
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 8× 28 ms, CCSlice 1× 8 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 685 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 215, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 104, `__syscall_cancel_arch [libc.so.6]` 64); WRRenderBackend#0 85 ms (top self: `syscall [libc.so.6]` 58, `webrender::prepare::prepare_prim_for_render [libxu` 3, `sched_yield [libc.so.6]` 3); SwComposite 44 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `void js::gc::ArenaLists::backgroundFinalize<(js::g` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 122, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 122 ms (5.9% of span): Idle 72, Graphics 22, Other 11, GC / CC 7, JavaScript 4, Layout 3
  - JS leaf 0 / native under JS 4 / native 118; buckets: ipc 116, poll_wait 75, paint_layout 28, gc_cc 9, harness_diagnostics 4, canvas_2d 2, array_buffer_copy 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 75; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 4; `[]` 2; `webrender_api::display_list::AuGrid::rect [libxul.so]` 1; `wr_dp_push_text [libxul.so]` 1; `nsTimer::Cancel() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 5 ms, GCSlice 5× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8358** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8507** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 219, Renderer 37, WRRenderBackend 21, Compositor 19, WRSceneBuilder 15, IPC I/O 10, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 219 ms (5.8% of span): Layout 49, Idle 38, GC / CC 38, Other 31, JavaScript 27, Graphics 23
  - JS leaf 4 / native under JS 29 / native 187; buckets: ipc 218, paint_layout 75, poll_wait 70, gc_cc 50, subprocess_pipe_io 14, array_buffer_copy 6, harness_diagnostics 5, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[axiosozo-dev]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 5; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 37 ms, GCSlice 6× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 37 ms (top self: `__syscall_cancel_arch [libc.so.6]` 23, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `syscall [libc.so.6]` 2); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 18, `sched_yield [libc.so.6]` 1, `webrender::tile_cache::TileCacheInstance::update_p` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 2, `[linux-vdso.so.1]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 69, IPC I/O 7, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (1.8% of span): Idle 22, Other 11, JavaScript 9, GC / CC 9, Graphics 7, Layout 5
  - JS leaf 1 / native under JS 8 / native 59; buckets: ipc 61, poll_wait 23, paint_layout 15, gc_cc 14, harness_diagnostics 5, array_buffer_copy 2, subprocess_pipe_io 1, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 25; `[]` 2; `[linux-vdso.so.1]` 2; `js::jit::CheckPrivateFieldIRGenerator::tryAttachStub() [libx` 1; `void nsPurpleBuffer::VisitEntries<RemoveSkippableVisitor>(Re` 1; `nsWindowRoot::AddRef() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 4× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8256** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `js::gc::StoreBuffer::putSlot(js::NativeObject*, int, unsigne` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozill` 0; `[unknown]` 0; `mozilla::dom::AutoJSAPI::Init(nsIGlobalObject*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8331** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **49.9** (DOM Worker 19.2, main 15.4, Renderer 7.7, WRScene~ilder# 3.8, WRRende~ckend# 3.8) | WPEWebProcess 73.0, AxioWebKitHost 7.7, WPENetworkProce 7.7 | — | 230.7 |
| plain | idle | — | — | **8.7** (main 6.7, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.8, forkserver 0.5 | — | — |
| plain | raf | 57.9 | 22.6 | **26.8** (main 12.0, DOM Worker 2.9, Renderer 2.6, SwComposite 1.6, TaskCon~ller # 1.3) | WPEWebProcess 65.5, AxioWebKitHost 8.3, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.5** (main 5.3, DOM Worker 3.3, Renderer 2.7, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 65.3, AxioWebKitHost 7.0 | — | — |
| plain | scroll | 56.9 | 34.0 | **41.3** (main 21.4, DOM Worker 6.8, Renderer 2.4, Backgro~Pool # 2.4, TaskCon~ller # 1.9) | WPEWebProcess 67.6, AxioWebKitHost 9.8 | — | — |
| plain | key | — | — | **17.2** (main 11.5, Renderer 1.4, DOM Worker 1.4, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | WPEWebProcess 6.8, AxioWebKitHost 1.4, WebExtensions 0.3 | 16.2 | — |
| plain | switch-to-gecko | — | — | **16.8** (main 8.4, IPC I/O Parent 4.2, BgIOThr~Pool # 4.2) | Isolated Web Co 4.2 | — | 213.3 |
| trace | switch-to-engine | — | — | **41.1** (main 12.6, Renderer 12.6, DOM Worker 6.3, WRScene~ilder# 3.2, WRRende~ckend# 3.2) | WPEWebProcess 56.8, WPENetworkProce 9.5, AxioWebKitHost 3.2, Isolated Web Co 3.2 | — | 288.8 |
| trace | idle | — | — | **9.2** (main 7.2, TaskCon~ller # 1.0, IPC I/O Parent 0.5, Timer 0.5) | Web Content 2.9 | — | — |
| trace | raf | 57.9 | 23.1 | **32.2** (main 15.2, DOM Worker 3.9, TaskCon~ller # 2.9, Renderer 2.6, SwComposite 1.6) | WPEWebProcess 65.8, AxioWebKitHost 8.3 | — | — |
| trace | raf-nosampler | — | — | **19.5** (main 5.3, DOM Worker 4.6, Renderer 2.7, WRRende~ckend# 1.7, SwComposite 1.3) | WPEWebProcess 64.7, AxioWebKitHost 7.7, Isolated Web Co 0.3 | — | — |
| trace | scroll | 57.0 | 32.2 | **44.9** (main 21.9, DOM Worker 7.3, Backgro~Pool # 2.9, TaskCon~ller # 2.4, Renderer 2.4) | WPEWebProcess 68.1, AxioWebKitHost 9.7 | — | — |
| trace | key | — | — | **19.2** (main 11.5, DOM Worker 1.6, Renderer 1.4, TaskCon~ller # 1.1, Timer 0.8) | WPEWebProcess 6.9, AxioWebKitHost 1.7, WebExtensions 0.3 | 19.4 | — |
| trace | switch-to-gecko | — | — | **20.1** (main 12.1, Renderer 4.0, WRScene~ilder# 4.0) | Isolated Web Co 4.0 | — | 214.4 |
| profile | switch-to-engine | — | — | **39.2** (main 14.0, DOM Worker 11.2, SamplerThread 11.2, WRRende~ckend# 2.8) | WPEWebProcess 67.0, Web Content 50.2, AxioWebKitHost 5.6, WPENetworkProce 5.6 | — | 320.2 |
| profile | idle | — | — | **28.2** (DOM Worker 9.1, main 8.6, SamplerThread 8.6, Timer 1.4, TaskCon~ller # 0.5) | Web Content 9.6, WebExtensions 1.4, Privileged Cont 1.4, Utility Process 1.4 | — | — |
| profile | raf | 58.1 | 26.6 | **53.0** (main 16.4, DOM Worker 11.2, SamplerThread 10.3, Renderer 2.9, Timer 1.9) | WPEWebProcess 66.8, Web Content 9.0, AxioWebKitHost 7.4, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **40.1** (DOM Worker 11.3, SamplerThread 8.9, main 7.3, Renderer 3.3, WRRende~ckend# 2.0) | WPEWebProcess 66.8, Web Content 9.6, AxioWebKitHost 8.9, Privileged Cont 2.0 | — | — |
| profile | scroll | 57.1 | 34.0 | **70.5** (main 27.6, DOM Worker 14.8, SamplerThread 10.5, Renderer 3.3, Backgro~Pool # 3.3) | WPEWebProcess 67.2, AxioWebKitHost 9.5, Web Content 7.6, WebExtensions 1.9 | — | — |
| profile | key | — | — | **45.4** (main 17.2, DOM Worker 9.5, SamplerThread 9.5, TaskCon~ller # 2.2, Timer 1.6) | Web Content 9.8, WPEWebProcess 7.5, WebExtensions 2.5, Privileged Cont 2.2 | 20.1 | — |
| profile | switch-to-gecko | — | — | **46.8** (main 15.6, DOM Worker 7.8, SamplerThread 7.8, glean.dispatche 3.9, Socket Thread 3.9) | Isolated Web Co 3.9 | — | 222.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.9 | 0.0 | 0 | 0.0 | — | — | 87.7 | 0.0 | — | 1.12 | 0.41 | — | — | — | — | — | 0.002 |
| trace | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.14 | 0.13 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 57.3 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.14 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 55.8 | 0.0 | 0 | 0.0 | — | — | 8.3 | 0.0 | — | 0.31 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 8.8 | 0.0 | — | 0.09 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.2 | 0.0 | 0 | 0.0 | — | — | 93.0 | 0.0 | — | 1.36 | 0.53 | — | — | — | — | — | 0.003 |
| profile | raf | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.16 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.4 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.18 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 55.6 | 0.0 | 0 | 0.0 | — | — | 10.3 | 0.0 | — | 0.35 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 7.9 | 0.0 | — | 0.13 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.875 | 1.747 | 0.0062 | 0.0124 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.045 | 0.077 | 0.0026 | 0.0045 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.063 | 0.098 | 0.0037 | 0.0056 |
| plain | scroll | memfd | native | 115 | 115 | 0.205 | 0.235 | 0.0113 | 0.0130 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.076 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.945 | 1.615 | 0.0056 | 0.0096 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.050 | 0.078 | 0.0029 | 0.0045 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.052 | 0.084 | 0.0030 | 0.0048 |
| trace | scroll | memfd | native | 116 | 116 | 0.207 | 0.229 | 0.0116 | 0.0128 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.071 | 0.0000 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.068 | 1.978 | 0.0055 | 0.0102 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 182 | 182 | 0.055 | 0.091 | 0.0032 | 0.0053 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.059 | 0.104 | 0.0034 | 0.0060 |
| profile | scroll | memfd | native | 118 | 118 | 0.221 | 0.280 | 0.0123 | 0.0156 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.076 | 0.0000 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 16.5 | 0.0 | — | 0.09 | 0.29 | — | — | 14.6 | 17.4 | 32.9 |
| profile | 0.6 | 16.7 | 0.1 | — | 0.13 | 0.48 | — | — | 12.4 | 17.9 | 30.8 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 26.6; first stdout read resolved 30.8; first frame applied (native receiver) 307.0; write frame_ack 307.6; write visibility 311.8; write focus 312.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 20.1; first stdout read resolved 25.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 34.9; first stdout read resolved 43.0; first frame applied (native receiver) 340.0; write frame_ack 340.8; write visibility 349.0; write focus 349.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 30.0; first stdout read resolved 39.3

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 49, DOM Worker 29, Renderer 17, BgPool 6, Compositor 4, IPC I/O 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 49 ms (12.8% of span): JavaScript 28, Idle 5, Other 5, Layout 5, Profiler 4, DOM 1
  - JS leaf 1 / native under JS 34 / native 15; buckets: ipc 49, gc_cc 23, harness_diagnostics 15, array_buffer_copy 12, engine_stream_read 10, worker_messaging 9, paint_layout 8, poll_wait 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `__strlen_avx2 [libc.so.6]` 4; `js::BaseScript::enclosingScope() const [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 3; `js::jit::DoLazyConstantFallback(JSContext*, js::jit::Baselin` 2; `JS::GetDeflatedUTF8StringLength(JSLinearString*) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ClearTexSubImage [libxul.so]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0, `webrender::clip::ClipStore::build_clip_chain_insta` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::scene_building::create_prim_instance [l` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `ARGBSetRow_X86 [libxul.so]` 3, `__syscall_cancel_arch [libc.so.6]` 1, `__memset_avx2_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 29 ms: buckets subprocess_pipe_io 29, worker_messaging 29, ipc 29, js_ctypes 29, poll_wait 29; top self: `__syscall_cancel_arch [libc.so.6]` 29; `[axiosozo-dev]` 0
- **tab:7840** CPU ms by thread group: main 55, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 55 ms (19.5% of span): Other 43, Profiler 4, DOM 4, JavaScript 3, Idle 2, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 50; buckets: ipc 42, array_buffer_copy 18, gc_cc 11, subprocess_pipe_io 4, memcpy_memset 3, poll_wait 2
  - top self: `[]` 5; `[libexpat.so.1]` 3; `[libfontconfig.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `__strcmp_avx2 [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7834** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 49 ms (13.9% of span): Other 41, DOM 5, JavaScript 2, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: ipc 37, array_buffer_copy 15, gc_cc 11, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 0
  - top self: `__memcmp_avx2_movbe [libc.so.6]` 4; `[]` 3; `nsresult mozilla::PreferencesImpl::GetPrefValue<unsigned int` 3; `__strncmp_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `PR_GetThreadPrivate [libnspr4.so]` 0)
- **tab:7692** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 160, DOM Worker 113, other 21, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 160 ms (7.6% of span): Idle 126, JavaScript 13, Other 9, DOM 7, Profiler 3, GC / CC 1
  - JS leaf 3 / native under JS 17 / native 140; buckets: ipc 160, poll_wait 132, harness_diagnostics 19, array_buffer_copy 7, gc_cc 6, engine_stream_read 4, native_receiver 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 131; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `js::SharedPropMap::freezeOrSealProperties(JSContext*, js::In` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 113 ms: buckets subprocess_pipe_io 113, js_ctypes 113, worker_messaging 113, ipc 113, poll_wait 113; top self: `__syscall_cancel_arch [libc.so.6]` 113
- **tab:7313** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7291** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 485, DOM Worker 270, Renderer 84, WRRenderBackend 49, Compositor 42, SwComposite 41, BgPool 32, other 31, ImageBridge 18, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 485 ms (15.5% of span): Idle 298, JavaScript 87, Other 38, GC / CC 37, DOM 17, Profiler 8
  - JS leaf 11 / native under JS 86 / native 388; buckets: ipc 483, poll_wait 322, gc_cc 112, engine_stream_read 49, worker_messaging 40, harness_diagnostics 39, array_buffer_copy 17, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 317; `[unknown]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4
  - GC/CC markers: GCMajor 1× 1050 ms, GCSlice 8× 30 ms, CCSlice 3× 7 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 84 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 5); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 41 ms (top self: `syscall [libc.so.6]` 39, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 31, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `mozilla::layers::PImageBridgeChild::SendUpdate(moz` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 270 ms: buckets subprocess_pipe_io 270, worker_messaging 269, ipc 269, js_ctypes 251, poll_wait 245, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 3; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7692** CPU ms by thread group: main 5, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): Idle 2, GC / CC 2, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 4, gc_cc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `[]` 0; `IID2NativeInterfaceMap::Trace(JSTracer*) [libxul.so]` 0; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 54 ms, GCSlice 4× 4 ms, CCSlice 1× 1 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7313** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::NodeChannel::SendMessage(std::unique_ptr<IPC::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 270, main 211, Renderer 83, WRRenderBackend 48, SwComposite 41, Compositor 41, BgPool 36, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 107, JavaScript 62, Other 19, DOM 15, Profiler 6, GC / CC 2
  - JS leaf 6 / native under JS 72 / native 133; buckets: ipc 210, poll_wait 115, gc_cc 77, engine_stream_read 57, worker_messaging 43, subprocess_pipe_io 19, native_receiver 17, array_buffer_copy 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 14; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 2; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 83 ms (top self: `__syscall_cancel_arch [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 4); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 1, `webrender::tile_cache::TileCacheInstance::update_p` 0); SwComposite 41 ms (top self: `syscall [libc.so.6]` 39, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `UnlockResource [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 34 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `profiler_mark_thread_asleep() [libxul.so]` 0, `mozilla::layers::PImageBridgeChild::SendUpdate(moz` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0, `fstat64 [libc.so.6]` 0)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 239, poll_wait 236, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 237; `[unknown]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:7313** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsRefreshDriver::GetIdleDeadlineHint(mozilla::TimeStamp, nsR` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7291** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 551, DOM Worker 258, BgPool 59, Renderer 55, WRRenderBackend 34, Compositor 27, SwComposite 23, other 21, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 551 ms (26.0% of span): Idle 282, JavaScript 106, Other 64, DOM 38, Graphics 17, GC / CC 15
  - JS leaf 12 / native under JS 126 / native 413; buckets: ipc 548, poll_wait 360, gc_cc 117, engine_stream_read 64, worker_messaging 52, paint_layout 52, harness_diagnostics 45, array_buffer_copy 30
  - top self: `__syscall_cancel_arch [libc.so.6]` 314; `[unknown]` 17; `__lll_lock_wait [libc.so.6]` 6; `[axiosozo-dev]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5
  - GC/CC markers: CCSlice 4× 9 ms, GCSlice 4× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 55 ms (top self: `__syscall_cancel_arch [libc.so.6]` 41, `syscall [libc.so.6]` 6, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); SwComposite 23 ms (top self: `syscall [libc.so.6]` 23, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 59 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 219, poll_wait 208, gc_cc 14; top self: `__syscall_cancel_arch [libc.so.6]` 216; `[unknown]` 4; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::Shape::replaceShape(JSContext*, JS::Handle<JSO` 2
- **tab:7291** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `IPC::AddIPCProfilerMarker(IPC::Message const&, int, mozilla:` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 590, DOM Worker 251, Renderer 56, other 35, SwComposite 18, Compositor 18, WRRenderBackend 16, WRWorker 12, WRSceneBuilder 9, BgPool 2, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 590 ms (16.0% of span): Idle 247, JavaScript 109, GC / CC 71, Layout 47, Other 46, Graphics 33
  - JS leaf 14 / native under JS 160 / native 416; buckets: ipc 587, poll_wait 296, gc_cc 170, paint_layout 93, worker_messaging 80, engine_stream_read 77, harness_diagnostics 30, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 269; `[unknown]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `[axiosozo-dev]` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4
  - GC/CC markers: GCMajor 2× 1356 ms, GCSlice 17× 64 ms, CCSlice 5× 13 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 19, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5); SwComposite 18 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 251 ms: buckets subprocess_pipe_io 251, worker_messaging 251, ipc 251, js_ctypes 241, poll_wait 236, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 237; `bool js::ctypes::jsvalToInteger<short>(JSContext*,` 2; `[unknown]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `JSAutoRealm::JSAutoRealm(JSContext*, JSObject*) [l` 1
- **tab:7239** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `JSStructuredCloneData::AppendBytes(char const*, unsigned lon` 0; `nsIGlobalObject::CanRunJSMicroTask(JSObject*) const [libxul.` 0; `xpc::XrayTraits::resolveOwnProperty(JSContext*, JS::Handle<J` 0; `mozilla::AutoProfilerLabel::AutoProfilerLabel(char const*, c` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7313** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 88, Renderer 31, DOM Worker 16, BgPool 11, WRRenderBackend 4, Compositor 3, WRSceneBuilder 3, IPC I/O 3, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 88 ms (28.0% of span): JavaScript 33, Layout 15, DOM 14, Graphics 10, Other 9, Idle 4
  - JS leaf 4 / native under JS 45 / native 39; buckets: ipc 88, paint_layout 26, array_buffer_copy 20, gc_cc 14, harness_diagnostics 13, engine_stream_read 10, worker_messaging 7, poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 4; `syscall [libc.so.6]` 4; `mozilla::nsDisplayListSet::MoveTo(mozilla::nsDisplayListSet ` 3; `pthread_self [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 31 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10, `__syscall_cancel_arch [libc.so.6]` 4, `floorf [libxul.so]` 4); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `<webrender::gpu_types::QuadHeader as webrender::re` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::add_image` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 11 ms (top self: `fstatat64 [libc.so.6]` 4, `unlink [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 2); BackgroundThreadPool #3 0 ms (top self: `syscall [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, poll_wait 15, js_ctypes 15; top self: `__syscall_cancel_arch [libc.so.6]` 15; `bool js::FillArgumentsFromArraylike<js::InvokeArgs` 1; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::V` 0
- **tab:7692** CPU ms by thread group: main 31, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 31 ms (9.8% of span): Other 10, JavaScript 8, Idle 5, DOM 4, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 10 / native 21; buckets: ipc 26, gc_cc 10, poll_wait 6, subprocess_pipe_io 5, paint_layout 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[]` 2; `nsNodeInfoManager::GetNodeInfo(nsAtom*, nsAtom*, int, unsign` 1; `ReservedWordInfo const* FindReservedWord<unsigned char>(unsi` 1; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*,` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7239** CPU ms by thread group: main 14, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 14 ms (4.4% of span): GC / CC 6, JavaScript 3, Idle 3, Other 1
  - JS leaf 0 / native under JS 3 / native 11; buckets: ipc 13, gc_cc 8, array_buffer_copy 3, poll_wait 3, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `__syscall_cancel_arch [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(J` 1; `__memcmp_avx2_movbe [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 16 ms, GCSlice 4× 10 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7840** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **68.4** (Renderer 28.0, main 24.9, DOM Worker 6.2, WRRende~ckend# 3.1, Backgro~Pool # 3.1) | WPEWebProcess 68.4, AxioWebKitHost 12.4, WPENetworkProce 9.3 | — | 283.8 |
| plain | idle | — | — | **8.7** (main 6.7, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.8, AxioWebKitHost 0.5 | — | — |
| plain | raf | 56.6 | 47.5 | **45.8** (main 17.0, Renderer 6.1, BgIOThr~Pool # 3.5, DOM Worker 3.5, SwComposite 2.9) | WPEWebProcess 187.8, AxioWebKitHost 21.4, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **24.4** (Renderer 5.6, main 4.6, SwComposite 3.3, DOM Worker 3.3, Backgro~Pool # 2.7) | WPEWebProcess 184.1, AxioWebKitHost 20.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 56.2 | 34.5 | **52.1** (main 20.8, Backgro~Pool # 9.0, DOM Worker 7.6, Renderer 5.2, SwComposite 2.8) | WPEWebProcess 182.1, AxioWebKitHost 22.1, Web Content 0.5 | — | — |
| plain | key | — | — | **72.1** (main 27.8, DOM Worker 21.5, IPDL Background 6.5, TaskCon~ller # 4.6, Renderer 3.0) | WPEWebProcess 18.0, AxioWebKitHost 2.5, WebExtensions 0.3, Web Content 0.3 | 29.6 | — |
| plain | switch-to-gecko | — | — | **40.8** (main 12.2, Renderer 12.2, Softwar~cThread 4.1, WRScene~ilder# 4.1, DOM Worker 4.1) | Isolated Web Co 4.1 | — | 215.3 |
| trace | switch-to-engine | — | — | **95.0** (Renderer 61.6, main 16.6, glean.dispatche 2.4, Softwar~cThread 2.4, WRWorker# 2.4) | WPEWebProcess 85.3, AxioWebKitHost 9.5, WPENetworkProce 7.1, Privileged Cont 2.4 | — | 384.4 |
| trace | idle | — | — | **15.4** (main 10.6, TaskCon~ller # 3.8, glean.dispatche 0.5, Timer 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 58.0 | 24.7 | **35.2** (main 12.8, Renderer 6.1, SwComposite 3.2, DOM Worker 3.2, Backgro~Pool # 2.9) | WPEWebProcess 186.6, AxioWebKitHost 22.4, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **25.8** (Renderer 6.0, main 5.6, SwComposite 3.6, DOM Worker 3.3, Backgro~Pool # 2.7) | WPEWebProcess 186.3, AxioWebKitHost 20.5 | — | — |
| trace | scroll | 55.9 | 31.3 | **52.5** (main 22.8, Backgro~Pool # 8.5, DOM Worker 7.6, Renderer 5.2, SwComposite 2.8) | WPEWebProcess 188.2, AxioWebKitHost 23.2 | — | — |
| trace | key | — | — | **19.0** (main 10.6, Renderer 3.0, DOM Worker 1.6, SwComposite 1.4, Timer 0.8) | WPEWebProcess 17.5, AxioWebKitHost 2.5, WebExtensions 0.3, Web Content 0.3 | 27.7 | — |
| trace | switch-to-gecko | — | — | **36.9** (main 8.2, Renderer 8.2, IPC I/O Parent 4.1, WRScene~ilder# 4.1, WRRende~ckend# 4.1) | Isolated Web Co 8.2 | — | 218.0 |
| profile | switch-to-engine | — | — | **46.3** (main 10.9, DOM Worker 10.9, Backgro~Pool # 8.2, SamplerThread 8.2, Renderer 2.7) | WPEWebProcess 68.2, Web Content 19.1, WPENetworkProce 10.9, AxioWebKitHost 8.2 | — | 328.4 |
| profile | idle | — | — | **27.2** (main 8.6, DOM Worker 8.1, SamplerThread 8.1, Timer 1.9, TaskCon~ller # 0.5) | Web Content 8.6, Privileged Cont 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 57.7 | 26.8 | **54.9** (main 16.8, DOM Worker 9.8, SamplerThread 8.6, Renderer 5.7, Backgro~Pool # 3.2) | WPEWebProcess 188.6, AxioWebKitHost 21.8, Web Content 7.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **48.0** (DOM Worker 10.9, SamplerThread 8.6, main 7.9, Renderer 6.3, SwComposite 4.0) | WPEWebProcess 190.6, AxioWebKitHost 22.8, Web Content 7.9, WebExtensions 1.7 | — | — |
| profile | scroll | 54.2 | 33.0 | **78.4** (main 29.1, DOM Worker 14.8, Backgro~Pool # 8.8, SamplerThread 7.9, Renderer 5.6) | WPEWebProcess 188.0, AxioWebKitHost 23.1, Web Content 8.3, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **56.4** (main 15.8, BgIOThr~Pool # 10.6, SamplerThread 10.3, DOM Worker 10.1, Renderer 3.3) | WPEWebProcess 18.5, Web Content 9.8, AxioWebKitHost 2.5, WebExtensions 2.5 | 28.8 | — |
| profile | switch-to-gecko | — | — | **51.0** (main 15.7, DOM Worker 11.8, Renderer 7.9, Compositor 3.9, BgIOThr~Pool # 3.9) | Isolated Web Co 7.9 | — | 223.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.2 | 0.0 | 0 | 0.0 | — | — | 142.6 | 0.0 | — | 3.34 | 0.44 | — | — | — | — | — | 0.002 |
| trace | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.29 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.31 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 54.6 | 0.0 | 0 | 0.0 | — | — | 12.9 | 0.0 | — | 0.93 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 17.4 | 0.0 | — | 0.10 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.1 | 0.0 | 0 | 0.0 | — | — | 101.3 | 0.0 | — | 3.55 | 0.62 | — | — | — | — | — | 0.003 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.40 | 0.16 | — | — | — | — | — | 0.013 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.33 | 0.18 | — | — | — | — | — | 0.013 |
| profile | scroll | 52.6 | 0.0 | 0 | 0.0 | — | — | 8.8 | 0.0 | — | 1.29 | 0.18 | — | — | — | — | — | 0.016 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 13.6 | 0.0 | — | 0.12 | 0.18 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.409 | 6.553 | 0.0199 | 0.0383 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 179 | 0.188 | 0.358 | 0.0107 | 0.0204 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.193 | 0.252 | 0.0112 | 0.0146 |
| plain | scroll | memfd | native | 115 | 115 | 0.723 | 0.795 | 0.0389 | 0.0428 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.187 | 0.0000 | 0.0010 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 2.792 | 6.430 | 0.0119 | 0.0273 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 183 | 183 | 0.187 | 0.277 | 0.0109 | 0.0162 |
| trace | raf-nosampler | memfd | native | 177 | 177 | 0.207 | 0.266 | 0.0120 | 0.0154 |
| trace | scroll | memfd | native | 116 | 116 | 0.789 | 0.819 | 0.0430 | 0.0447 |
| trace | key | memfd | native | 20 | 20 | 0.003 | 0.208 | 0.0000 | 0.0011 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.342 | 7.542 | 0.0170 | 0.0383 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 184 | 184 | 0.257 | 0.383 | 0.0148 | 0.0220 |
| profile | raf-nosampler | memfd | native | 178 | 178 | 0.209 | 0.298 | 0.0121 | 0.0173 |
| profile | scroll | memfd | native | 115 | 115 | 1.044 | 1.272 | 0.0550 | 0.0670 |
| profile | key | memfd | native | 20 | 20 | 0.003 | 0.208 | 0.0000 | 0.0011 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 24.3 | 0.0 | — | 0.10 | 0.32 | — | — | 9.1 | 25.3 | 34.0 |
| profile | 0.6 | 26.3 | 0.1 | — | 0.12 | 0.51 | — | — | 13.8 | 27.5 | 40.4 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 62.3; first stdout read resolved 65.3; first frame applied (native receiver) 438.0; write frame_ack 438.7; write visibility 442.4; write focus 442.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 18.7; first stdout read resolved 25.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.2; first stdout read resolved 42.2; first frame applied (native receiver) 345.1; write frame_ack 346.1; write visibility 356.2; write focus 356.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 28.4; first stdout read resolved 38.8

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 47, DOM Worker 27, Renderer 24, BgPool 18, Compositor 3, WRRenderBackend 3, SwComposite 2, WRSceneBuilder 2, IPC I/O 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 47 ms (12.0% of span): JavaScript 25, Idle 9, Layout 9, Profiler 2, Graphics 1, GC / CC 1
  - JS leaf 2 / native under JS 29 / native 16; buckets: ipc 47, gc_cc 27, paint_layout 10, harness_diagnostics 10, array_buffer_copy 9, poll_wait 9, engine_stream_read 5, worker_messaging 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `nsMenuPopupFrame::IntrinsicISize(mozilla::IntrinsicSizeInput` 3; `mozilla::dom::EventTarget::NonVirtualRelease() [libxul.so]` 2; `js::EqualChars(JSLinearString const*, JSLinearString const*)` 2; `js::MapIteratorObject::create(JSContext*, JS::Handle<js::Map` 2; `[unknown]` 2
  - WebRender/compositor threads: Renderer 24 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `ClearTexSubImage [libxul.so]` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 18 ms (top self: `ARGBSetRow_X86 [libxul.so]` 7, `__syscall_cancel_arch [libc.so.6]` 5, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 27 ms: buckets subprocess_pipe_io 27, worker_messaging 27, ipc 27, js_ctypes 25, poll_wait 25, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 25; `[axiosozo-dev]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 1
- **tab:9491** CPU ms by thread group: main 53, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 53 ms (14.9% of span): Other 44, JavaScript 6, DOM 2, Idle 1, GC / CC 1
  - JS leaf 1 / native under JS 5 / native 47; buckets: ipc 40, array_buffer_copy 19, gc_cc 13, subprocess_pipe_io 6, poll_wait 1, memcpy_memset 1, image_container 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libexpat.so.1]` 4; `PrefsIter::Next() [libxul.so]` 2; `void js::wasm::RecGroup::visitReferencedGroups<js::wasm::Rec` 2; `[]` 2; `PrefWrapper::WantValueKind(mozilla::PrefType, mozilla::PrefV` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9346** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.4% of span): Other 1, Idle 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1
  - top self: `nsGetInterface::operator()(nsID const&, void**) const [libxu` 1; `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::IMEStateManager::StopIMEStateManagement() [libxul.s` 0; `mozilla::dom::danger::GetJSContext() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **utility:9017** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 180, DOM Worker 109, other 20, Socket 1, IPC I/O 1, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 180 ms (8.5% of span): Idle 127, GC / CC 21, JavaScript 15, Other 9, DOM 4, Profiler 3
  - JS leaf 1 / native under JS 18 / native 161; buckets: ipc 179, poll_wait 132, gc_cc 25, harness_diagnostics 18, array_buffer_copy 5, engine_stream_read 2, json_metadata 1, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 130; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `[unknown]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2
  - GC/CC markers: GCSlice 3× 19 ms, CCSlice 2× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 109 ms: buckets subprocess_pipe_io 109, js_ctypes 109, worker_messaging 109, ipc 109, poll_wait 109; top self: `__syscall_cancel_arch [libc.so.6]` 109
- **tab:9491** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8942** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9350** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 485, DOM Worker 250, Renderer 171, BgPool 96, SwComposite 91, WRRenderBackend 54, Compositor 42, other 29, ImageBridge 18, WRSceneBuilder 8, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 485 ms (15.2% of span): Idle 332, JavaScript 87, Other 33, DOM 27, Profiler 6
  - JS leaf 11 / native under JS 97 / native 376; buckets: ipc 484, poll_wait 353, gc_cc 76, engine_stream_read 58, worker_messaging 42, harness_diagnostics 39, native_receiver 21, subprocess_pipe_io 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 349; `[unknown]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 8; `__lll_lock_wake [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 171 ms (top self: `__syscall_cancel_arch [libc.so.6]` 118, `__memmove_avx_unaligned_erms [libc.so.6]` 26, `syscall [libc.so.6]` 15); SwComposite 91 ms (top self: `syscall [libc.so.6]` 80, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 10, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 96 ms (top self: `__syscall_cancel_arch [libc.so.6]` 80, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 250 ms: buckets subprocess_pipe_io 250, worker_messaging 249, ipc 249, js_ctypes 227, poll_wait 221, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 223; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 3; `__lll_lock_wake [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:9485** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9491** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8961** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 248, main 221, Renderer 168, SwComposite 102, BgPool 92, WRRenderBackend 52, Compositor 43, ImageBridge 18, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 221 ms (7.2% of span): Idle 125, JavaScript 54, Other 19, DOM 18, GC / CC 3, Profiler 2
  - JS leaf 5 / native under JS 64 / native 151; buckets: ipc 220, poll_wait 137, gc_cc 77, engine_stream_read 55, worker_messaging 29, subprocess_pipe_io 17, native_receiver 15, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 168 ms (top self: `__syscall_cancel_arch [libc.so.6]` 103, `__memmove_avx_unaligned_erms [libc.so.6]` 36, `syscall [libc.so.6]` 19); SwComposite 102 ms (top self: `syscall [libc.so.6]` 91, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 11, `floorf [libxul.so]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 93 ms (top self: `__syscall_cancel_arch [libc.so.6]` 74, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 248 ms: buckets subprocess_pipe_io 248, worker_messaging 248, ipc 248, js_ctypes 228, poll_wait 220, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 222; `[axiosozo-dev]` 2; `[unknown]` 2; `getcontext [libc.so.6]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 1
- **tab:9350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9485** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8920** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 585, DOM Worker 276, BgPool 171, Renderer 109, SwComposite 58, WRRenderBackend 37, Compositor 27, other 18, ImageBridge 11, WRSceneBuilder 5, Socket 2, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 585 ms (26.8% of span): Idle 296, JavaScript 133, Other 69, DOM 43, Graphics 22, Profiler 9
  - JS leaf 13 / native under JS 163 / native 410; buckets: ipc 585, poll_wait 378, gc_cc 132, engine_stream_read 91, worker_messaging 71, harness_diagnostics 66, paint_layout 56, array_buffer_copy 37
  - top self: `__syscall_cancel_arch [libc.so.6]` 342; `[unknown]` 30; `__lll_lock_wait [libc.so.6]` 7; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 6; `__lll_lock_wake [libc.so.6]` 5; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 5
  - GC/CC markers: GCMinor 1× 7 ms
  - WebRender/compositor threads: Renderer 109 ms (top self: `__syscall_cancel_arch [libc.so.6]` 78, `syscall [libc.so.6]` 13, `__memmove_avx_unaligned_erms [libc.so.6]` 13); SwComposite 58 ms (top self: `syscall [libc.so.6]` 55, `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 171 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_avx_unaligned_erms [libc.so.6]` 54, `__lll_lock_wake [libc.so.6]` 3); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 276 ms: buckets subprocess_pipe_io 276, worker_messaging 276, ipc 276, js_ctypes 232, poll_wait 224, gc_cc 17; top self: `__syscall_cancel_arch [libc.so.6]` 231; `__lll_lock_wake [libc.so.6]` 10; `[axiosozo-dev]` 4; `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) ` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3
- **tab:8920** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9485** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8942** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 536, BgPool 378, DOM Worker 266, Renderer 116, SwComposite 49, other 36, WRRenderBackend 19, Compositor 17, WRWorker 11, WRSceneBuilder 10, IPC I/O 2, ImageBridge 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 536 ms (14.5% of span): Idle 237, JavaScript 115, Other 52, Layout 48, Graphics 39, DOM 25
  - JS leaf 19 / native under JS 167 / native 351; buckets: ipc 535, poll_wait 284, gc_cc 113, paint_layout 98, engine_stream_read 75, worker_messaging 71, harness_diagnostics 42, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 261; `[unknown]` 18; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `mprotect [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 116 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 40, `__syscall_cancel_arch [libc.so.6]` 35, `hypotf@@GLIBC_2.35 [libm.so.6]` 7); SwComposite 49 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 13); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 17, `core::hash::BuildHasher::hash_one [libxul.so]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 373 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 339, `__syscall_cancel_arch [libc.so.6]` 32, `XXH32_update [libxul.so]` 2); BackgroundThreadPool #3 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `[linux-vdso.so.1]` 0)
  - busiest DOM Worker 266 ms: buckets subprocess_pipe_io 266, worker_messaging 266, ipc 266, js_ctypes 253, poll_wait 248, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 250; `JSStructuredCloneReader::readHeader() [libxul.so]` 2; `[unknown]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 1; `JS::Heap<JS::Value>* nsTArray_Impl<JS::Heap<JS::Va` 1
- **tab:8871** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle` 0; `js::OpaqueCrossCompartmentWrapper::hasOwn(JSContext*, JS::Ha` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8961** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, DOM 1, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::dom::Element::FindAttributeDependence(nsAtom const*` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 1; `js::jit::BytecodeAnalysis::init() [libxul.so]` 0; `js::InterpreterFrame::prologue(JSContext*) [libxul.so]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8942** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*)` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 84, Renderer 55, DOM Worker 18, BgPool 11, Compositor 5, WRRenderBackend 4, SwComposite 4, WRSceneBuilder 3, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 84 ms (27.3% of span): JavaScript 36, Layout 15, Graphics 9, DOM 8, Profiler 8, Idle 5
  - JS leaf 2 / native under JS 53 / native 30; buckets: ipc 84, paint_layout 28, array_buffer_copy 24, gc_cc 16, engine_stream_read 10, harness_diagnostics 10, worker_messaging 6, poll_wait 5
  - top self: `js::jit::BytecodeAnalysis::init() [libxul.so]` 9; `__syscall_cancel_arch [libc.so.6]` 6; `[axiosozo-dev]` 5; `mozilla::image::SurfaceCache::LookupBestMatch(mozilla::image` 4; `[unknown]` 4; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::ns` 4
  - WebRender/compositor threads: Renderer 55 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `__syscall_cancel_arch [libc.so.6]` 6); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 4, `sched_yield [libc.so.6]` 0); SwComposite 4 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 10 ms (top self: `rmdir [libc.so.6]` 6, `unlink [libc.so.6]` 3, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 18 ms: buckets subprocess_pipe_io 18, worker_messaging 18, ipc 18, poll_wait 16, js_ctypes 15, memcpy_memset 1; top self: `__syscall_cancel_arch [libc.so.6]` 16; `__lll_lock_wait [libc.so.6]` 1; `[axiosozo-dev]` 1; `nsHashPropertyBagCC::AddRef() [libxul.so]` 0
- **tab:9346** CPU ms by thread group: main 30, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (9.9% of span): JavaScript 9, Other 6, Profiler 5, Idle 4, Graphics 2, DOM 2
  - JS leaf 0 / native under JS 8 / native 22; buckets: ipc 23, gc_cc 8, subprocess_pipe_io 6, poll_wait 5, paint_layout 3, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 3; `gecko_profiler_current_thread_is_registered [libxul.so]` 2; `profiler_capture_backtrace_into(mozilla::ProfileChunkedBuffe` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::frontend::PropertyEmitter::emitInit(js::frontend::Access` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8871** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (1.8% of span): Idle 3, JavaScript 2, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 6, poll_wait 3, array_buffer_copy 3, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `WarpScriptOracle::maybeInlineIC(mozilla::LinkedList<js::jit:` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9491** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, other 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

