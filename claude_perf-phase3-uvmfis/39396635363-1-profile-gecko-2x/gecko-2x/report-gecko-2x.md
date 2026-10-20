# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **4.0** (main 1.5, TaskCon~ller # 1.0, Renderer 1.0, SwComposite 0.5) | Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.2 | **18.7** (Renderer 6.6, SwComposite 2.3, main 1.6, WRScene~ilder# 1.6, WRRende~ckend# 1.6) | Isolated Web Co 4.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.3, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.3, WRScene~ilder# 1.0) | Isolated Web Co 4.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **79.6** (Renderer 56.6, main 7.0, SwComposite 7.0, WRRende~ckend# 3.5, TaskCon~ller # 2.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **40.9** (main 14.7, DOM Worker 12.9, IPDL Background 4.6, TaskCon~ller # 2.4, glean.dispatche 1.3) | Isolated Web Co 1.1, WebExtensions 0.6, Privileged Cont 0.3 | 10.5 | — |
| plain | idle | 59.0 | 17.2 | **4.0** (main 1.5, TaskCon~ller # 1.0, Renderer 1.0, SwComposite 0.5) | Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.2 | **18.7** (Renderer 6.6, SwComposite 2.3, main 1.6, WRScene~ilder# 1.6, WRRende~ckend# 1.6) | Isolated Web Co 4.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.3, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.3, WRScene~ilder# 1.0) | Isolated Web Co 4.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **79.6** (Renderer 56.6, main 7.0, SwComposite 7.0, WRRende~ckend# 3.5, TaskCon~ller # 2.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **40.9** (main 14.7, DOM Worker 12.9, IPDL Background 4.6, TaskCon~ller # 2.4, glean.dispatche 1.3) | Isolated Web Co 1.1, WebExtensions 0.6, Privileged Cont 0.3 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **8.4** (SamplerThread 3.4, main 1.5, TaskCon~ller # 1.5, DOM Worker 1.5, IPC I/O Parent 0.5) | Web Content 5.8, Isolated Web Co 3.5, WebExtensions 1.5, Socket Process 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **21.9** (Renderer 6.5, SamplerThread 4.9, SwComposite 2.3, WRRende~ckend# 2.0, glean.dispatche 1.3) | Isolated Web Co 7.6, Web Content 6.5, WebExtensions 1.3, Privileged Cont 1.3 | — | — |
| profile | raf-nosampler | — | — | **25.6** (Renderer 10.0, SamplerThread 4.6, WRRende~ckend# 2.0, SwComposite 2.0, WRScene~ilder# 1.7) | Isolated Web Co 7.0, Web Content 6.6, WebExtensions 1.3, Privileged Cont 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **89.2** (Renderer 58.0, SwComposite 7.4, SamplerThread 7.4, main 6.4, WRRende~ckend# 3.5) | Web Content 7.4, Isolated Web Co 7.0, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **12.3** (main 4.8, SamplerThread 3.7, Renderer 1.1, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 6.5, Isolated Web Co 2.7, WebExtensions 1.6, Privileged Cont 1.3 | 9.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |
| profile | idle | — | — | — | — | — | — | — | — |
| profile | raf | — | — | — | — | — | — | — | — |
| profile | raf-nosampler | — | — | — | — | — | — | — | — |
| profile | scroll | — | — | — | — | — | — | — | — |
| profile | key | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | — | — | — | — | — | — | — | — | — | — | — |

### Profile: gecko-2x / idle

- **parent** CPU ms by thread group: main 44, DOM Worker 41, IPC I/O 1, Renderer 1, SwComposite 1, Socket 1, other 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 44 ms (2.1% of span): GC / CC 25, Idle 7, Other 6, JavaScript 4, DOM 2, Graphics 0
  - JS leaf 0 / native under JS 6 / native 38; buckets: ipc 44, gc_cc 32, poll_wait 9, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 2, paint_layout 0, json_metadata 0
  - top self: `poll [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3; `[axiosozo-dev]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 2; `mprotect [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 70 ms, GCSlice 6× 21 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 39 ms: buckets worker_messaging 38, ipc 38, gc_cc 37, memcpy_memset 13, poll_wait 2; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 11; `madvise [libc.so.6]` 11; `munmap [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Va` 2
- **tab:3126** CPU ms by thread group: main 23, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 23 ms (1.1% of span): Idle 15, JavaScript 4, GC / CC 3, Other 0, DOM 0, Profiler 0
  - JS leaf 0 / native under JS 4 / native 20; buckets: ipc 23, poll_wait 16, gc_cc 6, harness_diagnostics 3, array_buffer_copy 3, subprocess_pipe_io 1, paint_layout 1
  - top self: `poll [libc.so.6]` 15; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::ResolvePromiseInternal(JSContext*, JS::Handle<JSObject*>` 1; `js::frontend::EmitterScope::enterFunction(js::frontend::Byte` 1; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3214** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3159** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 206, SwComposite 65, WRRenderBackend 55, WRSceneBuilder 45, Compositor 35, main 24, IPC I/O 8, DOM Worker 3, other 1, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 24 ms (0.8% of span): Idle 18, JavaScript 2, Other 1, Graphics 1, Layout 1
  - JS leaf 0 / native under JS 2 / native 22; buckets: ipc 24, poll_wait 18, paint_layout 3, gc_cc 2, harness_diagnostics 1, subprocess_pipe_io 1, array_buffer_copy 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 18; `mozilla::ComputedStyle::HasAnchorPosReference() const [libxu` 1; `nsFlexContainerFrame::UnionInFlowChildOverflow(mozilla::Over` 1; `sendmsg [libc.so.6]` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `js::SavedStacks::getOrCreateSavedFrame(JSContext*, JS::Handl` 1
  - WebRender/compositor threads: Renderer 206 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 38, `int blendTextureNearestFast<true, glsl::sampler2D_` 13); SwComposite 65 ms (top self: `syscall [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 8, `webrender::compositor::sw_compositor::SwCompositeJ` 0); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `madvise [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 139, IPC I/O 13, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 139 ms (4.5% of span): Idle 93, Graphics 15, Layout 14, Other 9, Profiler 4, JavaScript 3
  - JS leaf 0 / native under JS 5 / native 134; buckets: ipc 136, poll_wait 94, paint_layout 37, gc_cc 2, subprocess_pipe_io 2, array_buffer_copy 2, canvas_2d 1, mozafterpaint_events 1
  - top self: `poll [libc.so.6]` 92; `sendmsg [libc.so.6]` 3; `[]` 2; `[linux-vdso.so.1]` 1; `void IPC::WriteSequenceParam<unsigned long const>(IPC::Messa` 1; `nsIXPConnect::XPConnect() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3052** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 284, SwComposite 55, WRRenderBackend 51, WRSceneBuilder 43, main 41, Compositor 34, IPC I/O 8, other 1, DOM Worker 1, Socket 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 41 ms (1.3% of span): GC / CC 27, Idle 10, JavaScript 2, DOM 1, Other 1
  - JS leaf 0 / native under JS 3 / native 37; buckets: ipc 41, gc_cc 28, poll_wait 10, harness_diagnostics 3, array_buffer_copy 3, json_metadata 0
  - top self: `poll [libc.so.6]` 10; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `mozilla::SegmentedVector<nsCOMPtr<nsISupports>, 4096ul, mozi` 1; `mozilla::dom::ProtoAndIfaceCache::~ProtoAndIfaceCache() [lib` 1; `nsINode::GetExistingListenerManager() const [libxul.so]` 1
  - GC/CC markers: GCSlice 6× 24 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 284 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 48, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 46); SwComposite 55 ms (top self: `syscall [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `std::io::impls::<impl std::io::Write for &mut W>::` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 126, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 126 ms (4.2% of span): Idle 86, Graphics 17, Layout 14, Other 4, Profiler 3, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 123; buckets: ipc 121, poll_wait 87, paint_layout 35, subprocess_pipe_io 2, canvas_2d 1, gc_cc 1, memcpy_memset 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 86; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `wr_dp_push_hit_test [libxul.so]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3159** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::IdlePeriodState::GetLocalIdleDeadline(bool&, mozill` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3033** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1151, SwComposite 132, main 123, WRRenderBackend 72, Compositor 25, WRSceneBuilder 20, IPC I/O 7, other 1, Socket 1, DOM Worker 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 123 ms (6.0% of span): Idle 64, GC / CC 33, Graphics 9, Other 9, Layout 4, JavaScript 4
  - JS leaf 0 / native under JS 2 / native 121; buckets: ipc 123, poll_wait 81, gc_cc 34, paint_layout 13, array_buffer_copy 2, harness_diagnostics 2, canvas_2d 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `[axiosozo-dev]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 8× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1151 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 346, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 232, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 73); SwComposite 132 ms (top self: `syscall [libc.so.6]` 119, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 72 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `bool js::gc::IsAboutToBeFinalizedInternal<JSString` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 86, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 86 ms (4.2% of span): Idle 58, Graphics 10, Other 6, GC / CC 5, Profiler 2, Layout 2
  - JS leaf 0 / native under JS 3 / native 83; buckets: ipc 83, poll_wait 60, paint_layout 14, gc_cc 7, harness_diagnostics 3, array_buffer_copy 3, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 59; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_mark` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::frontend::PerHandlerParser<js::frontend::FullParseHandle` 1; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libx` 1
  - GC/CC markers: GCMajor 1× 14 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3159** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3052** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 172, Renderer 44, WRRenderBackend 18, Compositor 15, WRSceneBuilder 12, SwComposite 12, IPC I/O 7, other 2, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 172 ms (4.6% of span): Idle 39, Layout 29, GC / CC 27, Other 23, JavaScript 22, Graphics 22
  - JS leaf 6 / native under JS 24 / native 142; buckets: ipc 172, poll_wait 55, paint_layout 54, gc_cc 40, subprocess_pipe_io 8, memcpy_memset 5, harness_diagnostics 4, array_buffer_copy 3
  - top self: `poll [libc.so.6]` 42; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `recvmsg [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `mozilla::image::VectorImage::GetImageProvider(mozilla::Windo` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 26, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 47, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (1.3% of span): Idle 19, Other 9, Layout 7, Graphics 4, JavaScript 4, Profiler 2
  - JS leaf 0 / native under JS 4 / native 43; buckets: ipc 45, poll_wait 19, paint_layout 14, harness_diagnostics 3, array_buffer_copy 2, gc_cc 2, canvas_2d 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 19; `sendmsg [libc.so.6]` 2; `AtomTableEntry::KeyEquals(AtomTableKey const*) const [libxul` 2; `[]` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `mozilla::PresShell::ScrollFrameIntoView(nsIFrame*, mozilla::` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2953** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.1% of span): Idle 5, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, J` 0; `[unknown]` 0; `mozilla::dom::StructuredCloneHolder_Binding::Wrap(JSContext*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3052** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

