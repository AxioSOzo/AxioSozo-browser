# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **5.9** (main 2.4, Renderer 1.0, DOM Worker 1.0, IPDL Background 0.5, WRRende~ckend# 0.5) | Web Content 3.4, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.2 | **31.7** (Renderer 16.6, WRRende~ckend# 3.3, glean.dispatche 2.3, main 2.0, WRScene~ilder# 1.6) | Isolated Web Co 5.9, Privileged Cont 0.6, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **22.3** (Renderer 11.3, WRRende~ckend# 2.3, glean.dispatche 2.0, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 5.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **48.7** (Renderer 29.9, main 5.4, WRRende~ckend# 4.4, Compositor 2.0, SwComposite 2.0) | Isolated Web Co 5.4 | — | — |
| plain | key | — | — | **8.5** (main 5.1, Renderer 0.8, TaskCon~ller # 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9 | 9.5 | — |
| trace | idle | 59.3 | 17.2 | **4.9** (main 1.9, IPDL Background 1.0, TaskCon~ller # 1.0, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 2.0 | — | — |
| trace | raf | 59.0 | 17.2 | **24.2** (Renderer 11.1, WRRende~ckend# 2.9, main 2.0, glean.dispatche 2.0, WRScene~ilder# 2.0) | Isolated Web Co 6.1, Privileged Cont 0.3 | — | — |
| trace | raf-nosampler | — | — | **21.3** (Renderer 11.3, WRRende~ckend# 2.7, glean.dispatche 2.0, Compositor 2.0, WRScene~ilder# 1.7) | Isolated Web Co 6.0, Web Content 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **49.7** (Renderer 29.9, main 6.9, WRRende~ckend# 3.4, glean.dispatche 2.0, SwComposite 2.0) | Isolated Web Co 5.9 | — | — |
| trace | key | — | — | **67.3** (main 19.9, DOM Worker 17.5, Indexed~ IO # 14.6, IPDL Background 6.9, TaskCon~ller # 2.9) | Isolated Web Co 1.6, WebExtensions 0.6 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **10.1** (SamplerThread 3.8, main 2.4, TaskCon~ller # 1.9, Softwar~cThread 1.0, IPC I/O Parent 0.5) | Web Content 10.6, Isolated Web Co 4.8, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **35.2** (Renderer 13.0, SamplerThread 6.8, WRRende~ckend# 3.2, main 2.6, Compositor 2.3) | Isolated Web Co 12.8, Web Content 8.7, Privileged Cont 2.2, WebExtensions 1.9 | — | — |
| profile | raf-nosampler | — | — | **32.8** (Renderer 12.9, SamplerThread 6.9, WRRende~ckend# 3.0, Compositor 2.3, glean.dispatche 2.0) | Isolated Web Co 12.2, Web Content 8.9, WebExtensions 1.7, Privileged Cont 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **63.7** (Renderer 34.0, SamplerThread 8.7, main 7.3, WRRende~ckend# 4.9, Compositor 2.9) | Isolated Web Co 12.2, Web Content 9.7, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **16.9** (main 6.4, SamplerThread 4.8, Renderer 1.1, TaskCon~ller # 0.8, Compositor 0.8) | Web Content 8.2, Isolated Web Co 4.0, Privileged Cont 1.9, WebExtensions 1.9 | 8.5 | — |

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

- **parent** CPU ms by thread group: main 58, Compositor 2, DOM Worker 2, IPC I/O 1, Socket 1, other 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 59 ms (2.8% of span): GC / CC 34, JavaScript 8, Idle 7, Other 7, Layout 1, DOM 1
  - JS leaf 1 / native under JS 8 / native 49; buckets: ipc 59, gc_cc 39, poll_wait 13, harness_diagnostics 7, array_buffer_copy 3, subprocess_pipe_io 1, paint_layout 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 6× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3297** CPU ms by thread group: main 42, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 42 ms (2.0% of span): Idle 25, GC / CC 7, JavaScript 4, Other 3, Profiler 1, Layout 1
  - JS leaf 0 / native under JS 5 / native 37; buckets: ipc 39, poll_wait 26, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, paint_layout 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 25; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `JSRuntime::getSelfHostedScriptIndexRange(js::PropertyName*) ` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `array_includes(JSContext*, unsigned int, JS::Value*) [libxul` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3387** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3300** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 374, WRRenderBackend 92, main 75, WRSceneBuilder 65, Compositor 55, SwComposite 21, IPC I/O 13, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 75 ms (2.4% of span): GC / CC 32, Idle 26, JavaScript 8, Layout 3, Other 2, Profiler 2
  - JS leaf 0 / native under JS 8 / native 67; buckets: ipc 75, gc_cc 38, poll_wait 29, harness_diagnostics 7, paint_layout 5, json_metadata 2, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `mprotect [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2
  - GC/CC markers: GCMajor 1× 77 ms, GCSlice 6× 28 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 374 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 79, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 61); WRRenderBackend#0 92 ms (top self: `syscall [libc.so.6]` 76, `webrender::prepare::prepare_prim_for_render [libxu` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1); WRSceneBuilder#0 58 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 3, `webrender::scene_builder_thread::SceneBuilderThrea` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3297** CPU ms by thread group: main 246, IPC I/O 22, other 7, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 246 ms (7.9% of span): Idle 108, Layout 46, Graphics 45, Other 17, Profiler 11, JavaScript 8
  - JS leaf 0 / native under JS 15 / native 230; buckets: ipc 228, paint_layout 114, poll_wait 111, gc_cc 11, canvas_2d 5, memcpy_memset 4, subprocess_pipe_io 4, harness_diagnostics 4
  - top self: `poll [libc.so.6]` 109; `sendmsg [libc.so.6]` 9; `[]` 7; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `getcontext [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 15 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3387** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 370, WRRenderBackend 85, WRSceneBuilder 63, Compositor 54, main 38, SwComposite 15, IPC I/O 12, other 2, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 38 ms (1.3% of span): GC / CC 20, Idle 12, JavaScript 5, Other 2, Graphics 0
  - JS leaf 1 / native under JS 4 / native 34; buckets: ipc 38, gc_cc 22, poll_wait 13, harness_diagnostics 5, array_buffer_copy 3, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 2; `js::SavedStacks::insertFrames(JSContext*, JS::MutableHandle<` 1; `execute (chrome://remote/content/marionette/server.sys.mjs:2` 1
  - GC/CC markers: GCSlice 3× 23 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 371 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 83, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 77, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 60); WRRenderBackend#0 85 ms (top self: `syscall [libc.so.6]` 73, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1); WRSceneBuilder#0 57 ms (top self: `syscall [libc.so.6]` 49, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3297** CPU ms by thread group: main 215, IPC I/O 21, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 215 ms (7.0% of span): Idle 102, Graphics 46, Layout 39, Other 15, Profiler 10, DOM 1
  - JS leaf 0 / native under JS 10 / native 205; buckets: ipc 202, poll_wait 102, paint_layout 101, canvas_2d 5, subprocess_pipe_io 3, memcpy_memset 2, gc_cc 2, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 101; `[]` 9; `sendmsg [libc.so.6]` 6; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `webrender_api::display_list::DisplayListBuilder::push_iter [` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3300** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3385** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_mark` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 679, main 142, WRRenderBackend 90, SwComposite 42, Compositor 37, WRSceneBuilder 24, IPC I/O 10, other 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 142 ms (6.8% of span): Idle 78, Other 25, GC / CC 11, Graphics 9, JavaScript 9, DOM 5
  - JS leaf 1 / native under JS 10 / native 131; buckets: ipc 142, poll_wait 112, paint_layout 15, gc_cc 14, harness_diagnostics 6, array_buffer_copy 4, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 80; `recvmsg [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3; `nsINode::UnoptimizableCCNode() const [libxul.so]` 2; `writev [libc.so.6]` 2; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [` 2
  - GC/CC markers: CCSlice 1× 5 ms, GCSlice 3× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 679 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 214, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 113, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 60); WRRenderBackend#0 90 ms (top self: `syscall [libc.so.6]` 57, `webrender::texture_cache::TextureCache::try_get_ca` 3, `webrender::batch::BatchBuilder::add_prim_to_batch ` 3); SwComposite 42 ms (top self: `syscall [libc.so.6]` 39, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `Composite [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3297** CPU ms by thread group: main 125, IPC I/O 19, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 125 ms (6.0% of span): Idle 72, Graphics 21, Other 11, GC / CC 7, JavaScript 5, Layout 5
  - JS leaf 0 / native under JS 5 / native 120; buckets: ipc 121, poll_wait 73, paint_layout 31, gc_cc 8, harness_diagnostics 3, array_buffer_copy 3, canvas_2d 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 72; `[]` 4; `sendmsg [libc.so.6]` 3; `webrender_api::display_list::AuGrid::rect [libxul.so]` 2; `NonZeroCorner(mozilla::StyleLengthPercentage const&) [libxul` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1
  - GC/CC markers: GCMajor 1× 14 ms, GCSlice 4× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3190** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3387** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 227, Renderer 40, WRRenderBackend 23, Compositor 22, WRSceneBuilder 16, IPC I/O 11, SwComposite 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 227 ms (6.0% of span): Idle 47, Layout 41, Graphics 33, GC / CC 33, JavaScript 32, Other 26
  - JS leaf 0 / native under JS 42 / native 185; buckets: ipc 227, paint_layout 79, poll_wait 73, gc_cc 55, subprocess_pipe_io 8, memcpy_memset 5, harness_diagnostics 4, canvas_2d 4
  - top self: `poll [libc.so.6]` 47; `[axiosozo-dev]` 10; `recvmsg [libc.so.6]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4
  - GC/CC markers: GCMajor 1× 59 ms, GCSlice 6× 25 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 40 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 24, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `syscall [libc.so.6]` 4); WRRenderBackend#0 23 ms (top self: `syscall [libc.so.6]` 19, `sched_yield [libc.so.6]` 1, `webrender::space::SpaceMapper<F,T>::set_target_spa` 1); WRSceneBuilder#0 15 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3297** CPU ms by thread group: main 73, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 73 ms (1.9% of span): Idle 26, Other 12, GC / CC 10, Layout 9, JavaScript 8, DOM 4
  - JS leaf 0 / native under JS 7 / native 67; buckets: ipc 67, poll_wait 27, paint_layout 15, gc_cc 12, harness_diagnostics 4, memcpy_memset 4, array_buffer_copy 3, canvas_2d 1
  - top self: `poll [libc.so.6]` 26; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[]` 2; `sendmsg [libc.so.6]` 2; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*` 1; `syscall [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3138** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 0, GC / CC 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 6; `<firefox_on_glean::private::labeled_timing_distribution::Lab` 0; `PR_Unlock [libnspr4.so]` 0; `sendmsg [libc.so.6]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.m` 0; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

