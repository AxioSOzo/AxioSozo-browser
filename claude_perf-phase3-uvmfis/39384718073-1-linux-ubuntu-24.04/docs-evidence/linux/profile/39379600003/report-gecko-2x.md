# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.4 | **6.4** (main 1.9, Renderer 1.5, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Web Content 2.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **34.3** (Renderer 19.6, SwComposite 2.9, WRRende~ckend# 2.3, main 2.0, glean.dispatche 2.0) | Isolated Web Co 4.6, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **21.9** (Renderer 11.6, glean.dispatche 1.7, WRRende~ckend# 1.7, SwComposite 1.7, WRScene~ilder# 1.3) | Isolated Web Co 4.7, WebExtensions 0.7, Web Content 0.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **79.2** (Renderer 62.0, SwComposite 5.4, main 3.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.7** (main 4.0, Renderer 1.1, Compositor 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3 | 9.0 | — |
| trace | idle | 59.4 | 17.2 | **4.9** (main 2.4, TaskCon~ller # 1.0, glean.dispatche 0.5, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.2 | **18.3** (Renderer 7.5, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.6 | — | — |
| trace | raf-nosampler | — | — | **21.9** (Renderer 10.3, glean.dispatche 2.0, WRRende~ckend# 2.0, WRScene~ilder# 1.7, SwComposite 1.7) | Isolated Web Co 3.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **82.3** (Renderer 62.1, main 5.4, SwComposite 5.4, WRRende~ckend# 3.4, Compositor 1.5) | Isolated Web Co 4.9 | — | — |
| trace | key | — | — | **48.3** (main 16.8, DOM Worker 14.7, IPDL Background 6.1, TaskCon~ller # 2.4, IndexedDB IO # 1.9) | Isolated Web Co 1.1, WebExtensions 0.6, Privileged Cont 0.6, RDD Process 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **8.8** (SamplerThread 3.9, main 2.4, TaskCon~ller # 1.5, IPDL Background 1.0) | Web Content 9.2, Isolated Web Co 3.9, WebExtensions 1.9, Privileged Cont 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **26.7** (Renderer 8.4, SamplerThread 5.8, SwComposite 2.3, WRRende~ckend# 1.9, Compositor 1.9) | Web Content 8.4, Isolated Web Co 8.1, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **27.3** (Renderer 11.3, SamplerThread 6.0, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.7) | Isolated Web Co 8.3, Web Content 7.9, WebExtensions 1.7, Privileged Cont 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **105.1** (Renderer 68.8, SamplerThread 9.8, main 7.3, SwComposite 6.3, WRRende~ckend# 4.4) | Web Content 9.8, Isolated Web Co 9.3, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **14.0** (main 4.8, SamplerThread 4.0, Renderer 1.3, Compositor 0.8, TaskCon~ller # 0.5) | Web Content 8.0, Isolated Web Co 3.8, Privileged Cont 1.9, WebExtensions 1.9 | 8.5 | — |

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

- **parent** CPU ms by thread group: main 40, Compositor 1, DOM Worker 1, IPC I/O 1, SwComposite 1, Renderer 1, Socket 1, other 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, ImageBridge 0
  - main thread 40 ms (1.9% of span): GC / CC 21, Other 7, Idle 6, JavaScript 5, DOM 1
  - JS leaf 0 / native under JS 6 / native 34; buckets: ipc 40, gc_cc 25, poll_wait 11, harness_diagnostics 4, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 1, json_metadata 0
  - top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `recvmsg [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<nsIClassInf` 1
  - GC/CC markers: GCMajor 1× 53 ms, GCSlice 5× 21 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); Renderer 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `webrender::scene_builder_thread::SceneBuilderThrea` 0, `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::GCRuntime::beginMarkPhase(js::gc::AutoGCSe` 0
- **tab:3278** CPU ms by thread group: main 23, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 23 ms (1.1% of span): Idle 14, GC / CC 5, JavaScript 3, Profiler 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 20; buckets: ipc 21, poll_wait 14, gc_cc 5, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 1, paint_layout 0
  - top self: `poll [libc.so.6]` 14; `nsOuterWindowProxy::getOwnPropertyDescriptor(JSContext*, JS:` 1; `[]` 1; `mozilla::CycleCollectedJSRuntime::NoteGCThingXPCOMChildren(J` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `js::ForwardingProxyHandler::isCallable(JSObject*) const [lib` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3201** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 247, SwComposite 59, main 56, WRRenderBackend 54, WRSceneBuilder 49, Compositor 42, IPC I/O 10, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, ImageBridge 0
  - main thread 56 ms (1.8% of span): GC / CC 26, Idle 18, JavaScript 4, Other 3, Layout 2, DOM 2
  - JS leaf 0 / native under JS 4 / native 51; buckets: ipc 56, gc_cc 28, poll_wait 19, paint_layout 5, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScript` 2; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 2
  - GC/CC markers: GCMajor 1× 69 ms, GCSlice 5× 21 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 247 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 75, `int blendTextureNearestFast<true, glsl::sampler2D_` 17); SwComposite 59 ms (top self: `syscall [libc.so.6]` 53, `__memmove_avx_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::AtomsTable::sweepIncrementally(mozilla::detail` 0
- **tab:3278** CPU ms by thread group: main 138, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 138 ms (4.4% of span): Idle 99, Graphics 16, Layout 9, Profiler 6, Other 5, JavaScript 3
  - JS leaf 0 / native under JS 4 / native 134; buckets: ipc 134, poll_wait 99, paint_layout 32, gc_cc 2, array_buffer_copy 2, canvas_2d 2, harness_diagnostics 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 99; `[]` 2; `sendmsg [libc.so.6]` 2; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [l` 1; `JS::GetFlowIdFromJSMicroTask(JSObject*, unsigned long*) [lib` 1; `[linux-vdso.so.1]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3201** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3219** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `std::_Rb_tree_rebalance_for_erase(std::_Rb_tree_node_base*, ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 331, WRRenderBackend 51, SwComposite 49, WRSceneBuilder 46, Compositor 42, main 12, IPC I/O 10, other 2, Socket 0, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 12 ms (0.4% of span): Idle 8, JavaScript 3, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 9; buckets: ipc 12, poll_wait 8, gc_cc 3, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 8; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 1; `mprotect [libc.so.6]` 1; `JS::Compartment::firstGlobal() const [libxul.so]` 1; `prettyObject (chrome://remote/content/shared/Format.sys.mjs:` 0
  - WebRender/compositor threads: Renderer 331 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 85, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 83, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 43); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 4, `[axiosozo-dev]` 0); SwComposite 49 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3278** CPU ms by thread group: main 130, IPC I/O 17, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 131 ms (4.3% of span): Idle 91, Graphics 17, Layout 10, GC / CC 5, Other 4, Profiler 4
  - JS leaf 0 / native under JS 2 / native 129; buckets: ipc 126, poll_wait 91, paint_layout 31, gc_cc 6, memcpy_memset 1, canvas_2d 1, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 91; `sendmsg [libc.so.6]` 1; `[]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `[linux-vdso.so.1]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1
  - GC/CC markers: CCSlice 1× 3 ms, GCSlice 3× 2 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3290** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3180** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1371, main 135, SwComposite 119, WRRenderBackend 84, Compositor 30, WRSceneBuilder 23, IPC I/O 8, other 1, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 135 ms (6.5% of span): Idle 71, GC / CC 35, Other 10, JavaScript 7, Graphics 7, Layout 4
  - JS leaf 1 / native under JS 6 / native 128; buckets: ipc 135, poll_wait 87, gc_cc 38, paint_layout 11, harness_diagnostics 5, array_buffer_copy 4, json_metadata 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 71; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 2; `[linux-vdso.so.1]` 2
  - GC/CC markers: GCMajor 1× 44 ms, GCSlice 9× 28 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1371 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 430, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 296, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 105); SwComposite 119 ms (top self: `syscall [libc.so.6]` 111, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 84 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 4, `core::hash::BuildHasher::hash_one [libxul.so]` 2)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `bool js::gc::IsAboutToBeFinalizedInternal<JSString` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3278** CPU ms by thread group: main 98, IPC I/O 15, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 97 ms (4.7% of span): Idle 65, Graphics 14, GC / CC 7, JavaScript 4, Other 3, Profiler 2
  - JS leaf 0 / native under JS 4 / native 93; buckets: ipc 92, poll_wait 66, paint_layout 19, gc_cc 10, canvas_2d 4, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 65; `[]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `sendmsg [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3219** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 170, Renderer 40, WRRenderBackend 15, Compositor 15, WRSceneBuilder 12, SwComposite 10, IPC I/O 8, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 170 ms (4.5% of span): Idle 39, Layout 34, GC / CC 25, JavaScript 25, Other 21, Graphics 19
  - JS leaf 1 / native under JS 26 / native 143; buckets: ipc 170, paint_layout 58, poll_wait 57, gc_cc 38, subprocess_pipe_io 5, harness_diagnostics 5, array_buffer_copy 2, json_metadata 1
  - top self: `poll [libc.so.6]` 41; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 4; `__strcmp_avx2 [libc.so.6]` 3; `[unknown]` 3
  - GC/CC markers: GCMajor 1× 53 ms, GCSlice 5× 21 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 40 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `webrender::scene_builder_thread::SceneBuilderThrea` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3278** CPU ms by thread group: main 54, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (1.4% of span): Idle 22, GC / CC 8, Other 8, JavaScript 5, Layout 4, Profiler 3
  - JS leaf 0 / native under JS 6 / native 48; buckets: ipc 49, poll_wait 23, paint_layout 12, gc_cc 10, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 3; `[]` 2; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 2; `std::io::impls::<impl std::io::Write for &mut W>::write_all ` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3126** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 5, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 5, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 5; `nsThread::DoMainThreadSpecificProcessing() const [libxul.so]` 0; `mozilla::dom::WindowGlobalChild_Binding::get_isCurrentGlobal` 0; `js::ForwardingProxyHandler::isCallable(JSObject*) const [lib` 0; `nsDocShell::EnsureScriptEnvironment() [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3180** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

