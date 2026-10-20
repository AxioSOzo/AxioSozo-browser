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

## gecko-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.1 | **4.8** (main 1.9, Renderer 1.9, WRRende~ckend# 0.5, DOM Worker 0.5) | Web Content 2.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **27.5** (Renderer 15.7, SwComposite 2.6, main 2.0, TaskCon~ller # 1.6, glean.dispatche 1.3) | Isolated Web Co 3.3, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.3** (Renderer 9.3, WRRende~ckend# 1.7, SwComposite 1.3, glean.dispatche 1.0, WRScene~ilder# 1.0) | Isolated Web Co 3.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **68.8** (Renderer 53.3, SwComposite 6.0, main 3.5, WRRende~ckend# 3.0, glean.dispatche 1.0) | Isolated Web Co 3.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.2** (main 3.8, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.3, Softwar~cThread 0.3) | Isolated Web Co 1.4 | 10.5 | — |
| trace | idle | 59.0 | 17.1 | **5.0** (main 1.5, IPDL Background 1.0, Renderer 1.0, TaskCon~ller # 0.5, Softwar~cThread 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **15.3** (Renderer 6.2, WRRende~ckend# 1.6, SwComposite 1.6, main 1.3, glean.dispatche 1.3) | Isolated Web Co 3.6 | — | — |
| trace | raf-nosampler | — | — | **14.5** (Renderer 8.0, WRRende~ckend# 1.3, glean.dispatche 1.0, WRScene~ilder# 1.0, Compositor 1.0) | Isolated Web Co 2.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **71.9** (Renderer 53.4, SwComposite 6.0, main 4.5, WRRende~ckend# 3.5, glean.dispatche 1.5) | Isolated Web Co 3.5 | — | — |
| trace | key | — | — | **39.0** (main 14.2, DOM Worker 12.6, IPDL Background 4.3, TaskCon~ller # 2.4, StreamTrans # 1.3) | Isolated Web Co 0.8, WebExtensions 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **9.2** (SamplerThread 3.4, DOM Worker 2.4, main 1.9, TaskCon~ller # 1.0, SwComposite 0.5) | Web Content 5.8, Isolated Web Co 3.0, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **20.0** (Renderer 6.5, SamplerThread 4.6, WRRende~ckend# 2.0, SwComposite 1.6, glean.dispatche 1.3) | Web Content 7.2, Isolated Web Co 6.9, WebExtensions 1.6, Privileged Cont 1.3 | — | — |
| profile | raf-nosampler | — | — | **24.5** (Renderer 9.3, SamplerThread 4.6, WRRende~ckend# 2.0, Compositor 1.7, SwComposite 1.7) | Web Content 8.0, Isolated Web Co 6.4, Privileged Cont 1.3, Socket Process 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **85.7** (Renderer 57.5, SamplerThread 7.4, main 6.4, SwComposite 6.4, WRRende~ckend# 3.5) | Isolated Web Co 8.0, Web Content 6.9, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **13.0** (main 4.3, SamplerThread 3.5, Renderer 1.1, TaskCon~ller # 0.8, Compositor 0.8) | Web Content 5.9, Isolated Web Co 2.6, WebExtensions 1.4, Privileged Cont 1.1 | 8.0 | — |

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

- **parent** CPU ms by thread group: main 45, DOM Worker 40, Renderer 1, IPC I/O 1, SwComposite 1, Socket 0, other 0, Compositor 0, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (2.2% of span): GC / CC 27, Idle 8, Other 6, JavaScript 4, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 4 / native 42; buckets: ipc 45, gc_cc 32, poll_wait 10, harness_diagnostics 3, array_buffer_copy 1, memcpy_memset 1, json_metadata 1, paint_layout 0
  - top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `[axiosozo-dev]` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `mprotect [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `writev [libc.so.6]` 1, `[axiosozo-dev]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 0, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 38 ms: buckets worker_messaging 38, ipc 38, gc_cc 37, memcpy_memset 17, poll_wait 1; top self: `madvise [libc.so.6]` 12; `unsigned long js::gc::Arena::finalize<JSString, (j` 11; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `munmap [libc.so.6]` 2
- **tab:3167** CPU ms by thread group: main 22, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 22 ms (1.1% of span): Idle 16, GC / CC 3, JavaScript 2, Profiler 1, Layout 0
  - JS leaf 0 / native under JS 3 / native 19; buckets: ipc 20, poll_wait 17, gc_cc 4, harness_diagnostics 3, array_buffer_copy 2, paint_layout 0
  - top self: `poll [libc.so.6]` 16; `[]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `JSRuntime::scriptDataTableHolder() [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3105** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3189** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 192, SwComposite 55, WRRenderBackend 49, WRSceneBuilder 40, Compositor 32, main 21, IPC I/O 8, DOM Worker 3, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (0.7% of span): Idle 15, Graphics 2, Other 1, JavaScript 1, Layout 1, DOM 1
  - JS leaf 0 / native under JS 2 / native 20; buckets: ipc 21, poll_wait 15, paint_layout 3, harness_diagnostics 1, array_buffer_copy 1, gc_cc 0, mozafterpaint_events 0, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 15; `mozilla::ScrollContainerFrame::GetScrollPadding() const [lib` 1; `nsIFrame::ShouldApplyOverflowClipping(nsStyleDisplay const*)` 1; `nsFlexContainerFrame::Reflow(nsPresContext*, mozilla::Reflow` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1
  - WebRender/compositor threads: Renderer 192 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 42, `void clear_buffer<unsigned int>(Texture&, unsigned` 8); SwComposite 55 ms (top self: `syscall [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 1, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `unsigned long js::gc::Arena::finalize<JSString, (j` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 0
- **tab:3167** CPU ms by thread group: main 121, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 121 ms (3.9% of span): Idle 88, Graphics 12, Layout 9, Other 5, Profiler 4, JavaScript 2
  - JS leaf 0 / native under JS 5 / native 117; buckets: ipc 117, poll_wait 90, paint_layout 24, harness_diagnostics 2, gc_cc 2, canvas_2d 1, memcpy_memset 1, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 88; `[]` 2; `__strlen_evex [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `mozilla::BasePrincipal::IsSameOrigin(nsIURI*, bool*) [libxul` 1; `__lll_lock_wait [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3105** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3066** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 266, WRRenderBackend 46, SwComposite 44, main 39, WRSceneBuilder 38, Compositor 32, IPC I/O 7, other 1, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (1.3% of span): GC / CC 26, Idle 9, JavaScript 3, Other 1, Graphics 1
  - JS leaf 0 / native under JS 2 / native 37; buckets: ipc 39, gc_cc 29, poll_wait 11, harness_diagnostics 2, subprocess_pipe_io 1, paint_layout 1
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `poll [libc.so.6]` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScr` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCSlice 6× 24 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 266 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 51, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 39); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); SwComposite 44 ms (top self: `syscall [libc.so.6]` 40, `__memmove_avx512_unaligned_erms [libc.so.6]` 3)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3167** CPU ms by thread group: main 112, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 112 ms (3.7% of span): Idle 83, Graphics 10, Other 8, Layout 7, Profiler 3, DOM 1
  - JS leaf 0 / native under JS 3 / native 110; buckets: ipc 110, poll_wait 84, paint_layout 22, gc_cc 1, canvas_2d 1, memcpy_memset 1, subprocess_pipe_io 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 83; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `mozilla::dom::FragmentDirective::QueryInterface(nsID const&,` 1; `nsIFrame::GetCompositorHitTestInfoWithoutPointerEvents(mozil` 1; `[]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3066** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3105** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1126, SwComposite 123, main 115, WRRenderBackend 68, Compositor 24, WRSceneBuilder 20, IPC I/O 7, other 1, Socket 1, DOM Worker 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 115 ms (5.7% of span): Idle 64, GC / CC 31, Other 8, Graphics 5, Layout 4, JavaScript 2
  - JS leaf 0 / native under JS 2 / native 113; buckets: ipc 115, poll_wait 77, gc_cc 32, paint_layout 9, subprocess_pipe_io 2, harness_diagnostics 2, array_buffer_copy 2, memcpy_memset 2
  - top self: `poll [libc.so.6]` 65; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `[axiosozo-dev]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 2
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 8× 25 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1126 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 361, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 220, `hypotf@@GLIBC_2.35 [libm.so.6]` 80); SwComposite 123 ms (top self: `syscall [libc.so.6]` 109, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 68 ms (top self: `syscall [libc.so.6]` 47, `webrender::prepare::prepare_prim_for_render [libxu` 3, `webrender::batch::BatchBuilder::add_prim_to_batch ` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3167** CPU ms by thread group: main 80, IPC I/O 11, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 80 ms (4.0% of span): Idle 58, Graphics 7, Other 5, GC / CC 5, JavaScript 3, Layout 1
  - JS leaf 0 / native under JS 3 / native 78; buckets: ipc 78, poll_wait 58, paint_layout 11, gc_cc 8, harness_diagnostics 2, canvas_2d 2, array_buffer_copy 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 57; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::layers::WebRenderBridgeChild::GetFontKeyForScaledFo` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 16 ms, GCSlice 5× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3189** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3087** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 154, Renderer 39, WRRenderBackend 15, Compositor 14, WRSceneBuilder 11, SwComposite 9, IPC I/O 6, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 154 ms (4.1% of span): Idle 43, Layout 29, GC / CC 24, JavaScript 18, Graphics 17, Other 15
  - JS leaf 2 / native under JS 18 / native 133; buckets: ipc 154, poll_wait 56, paint_layout 47, gc_cc 36, array_buffer_copy 4, subprocess_pipe_io 4, memcpy_memset 3, image_container 1
  - top self: `poll [libc.so.6]` 43; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `mprotect [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 70 ms, GCSlice 5× 20 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 39 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 24, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 0, `webrender::render_backend::RenderBackend::update_d` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `mozilla::gfx::TreeLog<1>& mozilla::gfx::TreeLog<1>` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3167** CPU ms by thread group: main 43, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (1.1% of span): Idle 17, Other 8, Layout 7, JavaScript 4, DOM 3, Graphics 2
  - JS leaf 0 / native under JS 2 / native 40; buckets: ipc 42, poll_wait 18, paint_layout 17, gc_cc 2, array_buffer_copy 2, harness_diagnostics 2, subprocess_pipe_io 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 17; `sendmsg [libc.so.6]` 3; `void mozilla::Maybe<mozilla::WidgetPointerEvent>::emplace<bo` 1; `IPC::ChannelPosix::ProcessOutgoingMessages() [libxul.so]` 1; `mozilla::IMEContentObserver::AChangeEvent::CanNotifyIME(mozi` 1; `gfxTextRun::GetAdvanceWidth(gfxTextRun::Range, gfxTextRun::P` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3016** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.1% of span): Idle 4, JavaScript 1, Other 0, GC / CC 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 5, poll_wait 4, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 4; `void js::NativeObject::setFixedSlot<true>(unsigned int, JS::` 0; `sendmsg [libc.so.6]` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 0; `write [libc.so.6]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3105** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **52.0** (main 19.9, Renderer 13.8, DOM Worker 9.2, StyleThread# 3.1, glean.dispatche 1.5) | AxioCEFProbe 33.6, cef:gpu-process 15.3, cef:utility 10.7, cef:renderer 9.2 | — | 605.5 |
| plain | idle | — | — | **6.1** (main 4.7, TaskCon~ller # 0.9, Timer 0.5) | AxioCEFProbe 2.4, cef:utility 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 60.0 | 22.2 | **21.8** (main 8.1, DOM Worker 2.6, Renderer 2.3, Backgro~Pool # 1.3, SwComposite 1.3) | cef:renderer 6.8, AxioCEFProbe 4.8, cef:gpu-process 3.8, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.9** (main 5.3, DOM Worker 2.6, Renderer 2.0, TaskCon~ller # 1.3, WRRende~ckend# 1.0) | cef:renderer 7.6, AxioCEFProbe 5.6, cef:gpu-process 4.7, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.0 | 22.0 | **33.1** (main 15.5, DOM Worker 7.3, Renderer 1.9, Backgro~Pool # 1.9, WRRende~ckend# 1.5) | cef:gpu-process 19.4, cef:renderer 9.2, AxioCEFProbe 8.7 | — | — |
| plain | key | — | — | **15.9** (main 9.3, TaskCon~ller # 1.4, Renderer 1.1, DOM Worker 1.1, glean.dispatche 0.5) | cef:renderer 2.0, AxioCEFProbe 1.9, cef:gpu-process 0.8, WebExtensions 0.3 | 12.6 | — |
| plain | switch-to-gecko | — | — | **12.4** (DOM Worker 4.5, main 3.6, IPDL Background 1.4, Indexed~ IO # 1.2, TaskCon~ller # 0.5) | Privileged Cont 0.1, Web Content 0.1, Utility Process 0.1 | — | 15372.0 |
| trace | switch-to-engine | — | — | **72.7** (Renderer 30.3, main 18.2, glean.dispatche 6.1, DOM Worker 6.1, WRScene~ilder# 3.0) | AxioCEFProbe 66.6, cef:gpu-process 30.2, cef:renderer 18.2, cef:utility 18.2 | — | 284.4 |
| trace | idle | — | — | **3.9** (main 2.9, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 2.5, Web Content 1.9, cef:zygote 0.5, Privileged Cont 0.5 | — | — |
| trace | raf | 60.0 | 20.7 | **19.5** (main 7.4, DOM Worker 2.6, Renderer 2.3, WRRende~ckend# 1.3, glean.dispatche 1.0) | cef:renderer 7.1, cef:gpu-process 4.5, AxioCEFProbe 4.1 | — | — |
| trace | raf-nosampler | — | — | **16.5** (main 4.6, DOM Worker 3.0, Renderer 2.3, Compositor 1.3, SwComposite 1.3) | cef:renderer 8.6, cef:gpu-process 4.7, AxioCEFProbe 4.6, Isolated Web Co 0.3 | — | — |
| trace | scroll | 60.1 | 21.9 | **35.0** (main 16.0, DOM Worker 7.3, Renderer 2.4, Backgro~Pool # 2.4, WRRende~ckend# 1.9) | cef:gpu-process 19.4, cef:renderer 10.2, AxioCEFProbe 7.8 | — | — |
| trace | key | — | — | **13.2** (main 8.2, Renderer 1.4, DOM Worker 1.4, Timer 0.5, Compositor 0.5) | cef:renderer 2.2, AxioCEFProbe 1.9, cef:gpu-process 0.5, WebExtensions 0.3 | 12.8 | — |
| trace | switch-to-gecko | — | — | **2.4** (main 0.9, TaskCon~ller # 0.6, DOM Worker 0.2, glean.dispatche 0.1, IPC I/O Parent 0.1) | WebExtensions 0.1, Privileged Cont 0.1 | — | 15019.2 |
| profile | switch-to-engine | — | — | **85.8** (main 38.1, Renderer 14.3, DOM Worker 14.3, SamplerThread 9.5, Softwar~cThread 4.8) | AxioCEFProbe 23.9, cef:renderer 23.8, Web Content 9.6 | — | 145.5 |
| profile | idle | — | — | **24.6** (SamplerThread 8.5, DOM Worker 7.6, main 5.7, Timer 1.9, TaskCon~ller # 0.9) | Web Content 8.0, AxioCEFProbe 2.8, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.9 | 21.0 | **48.3** (main 12.1, DOM Worker 11.8, SamplerThread 11.2, Renderer 2.6, Timer 1.9) | Web Content 9.9, cef:renderer 8.0, AxioCEFProbe 5.1, cef:gpu-process 4.4 | — | — |
| profile | raf-nosampler | — | — | **39.2** (DOM Worker 11.9, SamplerThread 9.6, main 6.6, Renderer 2.6, WRRende~ckend# 1.6) | Web Content 8.5, cef:renderer 7.9, AxioCEFProbe 5.9, cef:gpu-process 4.9 | — | — |
| profile | scroll | 60.0 | 21.7 | **65.4** (main 21.9, DOM Worker 16.7, SamplerThread 11.9, Renderer 2.9, Backgro~Pool # 2.9) | cef:gpu-process 21.5, cef:renderer 11.0, Web Content 10.0, AxioCEFProbe 7.2 | — | — |
| profile | key | — | — | **49.9** (main 13.3, BgIOThr~Pool # 10.1, DOM Worker 9.8, SamplerThread 9.8, TaskCon~ller # 1.6) | Web Content 9.3, cef:renderer 2.8, AxioCEFProbe 2.7, Privileged Cont 1.9 | 15.7 | — |
| profile | switch-to-gecko | — | — | **64.9** (main 27.1, Renderer 10.8, BgIOThr~Pool # 5.4, WRScene~ilder# 5.4, WRRende~ckend# 5.4) |  | — | 139.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.6 | 0.0 | 0 | 0.0 | — | — | 8.6 | 0.0 | — | 2.79 | 2.41 | — | — | — | — | — | 0.014 |
| trace | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.12 | 0.09 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.14 | 0.10 | — | — | — | — | — | 0.006 |
| trace | scroll | 58.9 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.26 | 0.09 | — | — | — | — | — | 0.006 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.6 | 0.0 | — | 0.32 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 8.1 | 0.0 | 0 | 0.0 | — | — | 7.1 | 0.0 | — | 3.08 | 0.71 | — | — | — | — | — | 0.006 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.15 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.009 |
| profile | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 7.3 | 0.0 | — | 0.31 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.51 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.087 | 1.861 | 0.0032 | 0.0055 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.040 | 0.078 | 0.0024 | 0.0047 |
| plain | raf-nosampler | memfd | native | 184 | 184 | 0.043 | 0.082 | 0.0026 | 0.0049 |
| plain | scroll | memfd | native | 121 | 121 | 0.151 | 0.211 | 0.0087 | 0.0122 |
| plain | key | memfd | native | 21 | 21 | 0.018 | 0.067 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 1.199 | 2.183 | 0.0068 | 0.0123 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 187 | 187 | 0.043 | 0.077 | 0.0026 | 0.0046 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.055 | 0.084 | 0.0033 | 0.0050 |
| trace | scroll | memfd | native | 123 | 123 | 0.178 | 0.225 | 0.0105 | 0.0132 |
| trace | key | memfd | native | 21 | 21 | 0.017 | 0.072 | 0.0001 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.240 | 2.128 | 0.0181 | 0.0172 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.050 | 0.102 | 0.0030 | 0.0061 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.052 | 0.094 | 0.0031 | 0.0057 |
| profile | scroll | memfd | native | 124 | 124 | 0.202 | 0.276 | 0.0118 | 0.0161 |
| profile | key | memfd | native | 21 | 21 | 0.024 | 0.086 | 0.0001 | 0.0005 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 8.2 | 0.0 | — | 0.32 | 0.53 | — | — | 8.8 | 9.3 | 17.7 |
| profile | 0.6 | 10.7 | 0.0 | — | 0.52 | 0.87 | — | — | 8.0 | 12.1 | 20.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 113.2; write create 114.9; first frame applied (native receiver) 297.8; write frame_ack 302.5; write focus 309.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 24.9; first stdout read resolved 30.7; write shutdown 37.9

Switch timeline (profile, switch-to-engine, ms after the window start): write create 51.7; first stdout read resolved 82.3; first frame applied (native receiver) 176.5; write frame_ack 177.5; write focus 186.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 33.9; first stdout read resolved 47.9; write shutdown 49.9

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 76, Renderer 34, DOM Worker 18, BgPool 6, WRRenderBackend 3, Compositor 3, WRSceneBuilder 3, SwComposite 2, IPC I/O 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 76 ms (30.9% of span): Layout 27, JavaScript 20, Idle 10, Graphics 7, DOM 7, Other 4
  - JS leaf 1 / native under JS 40 / native 36; buckets: ipc 76, paint_layout 35, gc_cc 30, array_buffer_copy 19, poll_wait 10, worker_messaging 10, harness_diagnostics 9, subprocess_pipe_io 6
  - top self: `poll [libc.so.6]` 10; `sendmsg [libc.so.6]` 4; `JS::CurrentGlobalOrNull(JSContext*) [libxul.so]` 4; `[axiosozo-dev]` 4; `mozilla::layers::ClipManager::DefineClipChain(mozilla::Displ` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ClearTexSubImage [libxul.so]` 4); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__memset_avx2_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 18 ms: buckets subprocess_pipe_io 18, worker_messaging 18, ipc 18, js_ctypes 17, poll_wait 17, array_buffer_copy 0; top self: `poll [libc.so.6]` 17; `__lll_lock_wait [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Hand` 0; `read [libc.so.6]` 0
- **tab:4175** CPU ms by thread group: main 39, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (15.8% of span): Other 28, JavaScript 4, DOM 4, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 33; buckets: ipc 37, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 1
  - top self: `[]` 6; `[libfontconfig.so.1]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[libexpat.so.1]` 2; `icu_78::UnicodeString::cloneArrayIfNeeded(int, int, signed c` 2; `(anonymous namespace)::NameResolver::visit(js::frontend::Par` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3950** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (1.0% of span): Idle 1, Layout 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 1; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [` 1; `XPCJSContext::AfterProcessTask(unsigned int) [libxul.so]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4170** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 108, main 97, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 97 ms (4.5% of span): Idle 80, JavaScript 7, Other 7, DOM 2, Profiler 2
  - JS leaf 0 / native under JS 8 / native 89; buckets: ipc 97, poll_wait 82, harness_diagnostics 6, gc_cc 5, array_buffer_copy 5, memcpy_memset 2, subprocess_pipe_io 1, engine_stream_read 1
  - top self: `poll [libc.so.6]` 80; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `recvmsg [libc.so.6]` 1; `js::jit::CacheIRWriter::guardSpecificObject(js::jit::ObjOper` 1; `nsContentUtils::GetEventMessageAndAtomForListener(nsTSubstri` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, worker_messaging 108, ipc 108, js_ctypes 108, poll_wait 108, array_buffer_copy 0; top self: `poll [libc.so.6]` 108; `mozilla::dom::DedicatedWorkerGlobalScope_Binding::` 0
- **tab:4175** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4170** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 358, DOM Worker 282, Renderer 67, WRRenderBackend 37, SwComposite 36, BgPool 35, Compositor 34, other 32, ImageBridge 15, WRSceneBuilder 7, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 358 ms (11.3% of span): Idle 218, JavaScript 52, Other 36, GC / CC 35, DOM 13, Profiler 4
  - JS leaf 2 / native under JS 62 / native 294; buckets: ipc 358, poll_wait 234, gc_cc 93, engine_stream_read 29, worker_messaging 28, json_metadata 15, harness_diagnostics 14, array_buffer_copy 13
  - top self: `poll [libc.so.6]` 222; `[unknown]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4
  - GC/CC markers: GCMajor 1× 1041 ms, GCSlice 8× 31 ms, CCSlice 1× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 67 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 4); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `webrender::visibility::update_prim_visibility [lib` 0); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `IPC::ParamTraits<mozilla::layers::CompositableOper` 0, `__memset_avx2_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 282 ms: buckets subprocess_pipe_io 282, worker_messaging 282, ipc 282, js_ctypes 269, poll_wait 264, gc_cc 5; top self: `poll [libc.so.6]` 264; `[unknown]` 2; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1; `getcontext [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:3950** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 0; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0; `fog_custom_distribution_accumulate_single_sample [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3955** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3420** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 270, main 180, Renderer 67, WRRenderBackend 37, SwComposite 36, Compositor 34, BgPool 34, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 180 ms (5.9% of span): Idle 100, JavaScript 50, Other 18, DOM 10, Profiler 2
  - JS leaf 7 / native under JS 46 / native 127; buckets: ipc 180, poll_wait 107, gc_cc 60, worker_messaging 34, engine_stream_read 25, json_metadata 18, subprocess_pipe_io 13, array_buffer_copy 10
  - top self: `poll [libc.so.6]` 102; `[unknown]` 9; `recvmsg [libc.so.6]` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `mprotect [libc.so.6]` 2; `js::jit::MacroAssemblerX86Shared::~MacroAssemblerX86Shared()` 2
  - WebRender/compositor threads: Renderer 67 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `syscall [libc.so.6]` 3); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 0, `webrender::visibility::update_prim_visibility [lib` 0); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 270 ms: buckets subprocess_pipe_io 270, worker_messaging 270, ipc 270, js_ctypes 255, poll_wait 251, gc_cc 10; top self: `poll [libc.so.6]` 251; `write [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3460** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 3, JavaScript 1, DOM 1
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 3; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBa` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `js::PromiseObject::allocationSite() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4175** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3441** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 430, DOM Worker 280, BgPool 61, Renderer 48, WRRenderBackend 28, Compositor 24, SwComposite 23, other 21, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 430 ms (20.2% of span): Idle 254, JavaScript 71, Other 48, DOM 17, GC / CC 16, Graphics 13
  - JS leaf 10 / native under JS 72 / native 348; buckets: ipc 429, poll_wait 316, gc_cc 85, paint_layout 41, worker_messaging 38, engine_stream_read 21, array_buffer_copy 19, json_metadata 16
  - top self: `poll [libc.so.6]` 256; `[unknown]` 14; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 6; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3
  - GC/CC markers: GCSlice 4× 8 ms, CCSlice 3× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 40, `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 28 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 23 ms (top self: `syscall [libc.so.6]` 23, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 61 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `write [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 280 ms: buckets subprocess_pipe_io 280, worker_messaging 280, ipc 280, js_ctypes 251, poll_wait 235, gc_cc 13; top self: `poll [libc.so.6]` 235; `[axiosozo-dev]` 7; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::ctypes::ArrayType::CreateInternal(JSContext*, ` 2
- **tab:3420** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3441** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3460** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 453, BgPool 365, DOM Worker 252, Renderer 55, other 35, SwComposite 17, Compositor 16, WRRenderBackend 14, WRWorker 12, WRSceneBuilder 9, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 453 ms (12.2% of span): Idle 165, JavaScript 74, GC / CC 66, Layout 43, Other 40, Graphics 28
  - JS leaf 14 / native under JS 123 / native 316; buckets: ipc 453, poll_wait 200, gc_cc 158, paint_layout 84, worker_messaging 70, engine_stream_read 37, subprocess_pipe_io 24, array_buffer_copy 18
  - top self: `poll [libc.so.6]` 166; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 17; `[axiosozo-dev]` 14; `[unknown]` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 8; `__memset_avx2_unaligned_erms [libc.so.6]` 7
  - GC/CC markers: GCMajor 2× 1217 ms, GCSlice 16× 60 ms, CCSlice 3× 11 ms, GCMinor 2× 4 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 55 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 22, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `__exp2f_fma [libm.so.6]` 2); SwComposite 17 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 11, `webrender::batch::AlphaBatchList::set_params_and_g` 0, `floorf [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 362 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 345, `write [libc.so.6]` 14, `close [libc.so.6]` 1); BackgroundThreadPool #2 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `mozilla::media::TimeUnit::Invalid() [libxul.so]` 0, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2)
  - busiest DOM Worker 252 ms: buckets subprocess_pipe_io 252, worker_messaging 252, ipc 252, js_ctypes 237, poll_wait 231, gc_cc 5; top self: `poll [libc.so.6]` 231; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::jit::JSJitFrameIter::ionScript() const [libxul` 1; `[unknown]` 1; `getcontext [libc.so.6]` 1
- **tab:3368** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::dom::CallbackObject::Release() [libxul.so]` 0; `mozilla::ipc::MessageChannel::RunMessage(mozilla::ipc::Actor` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3955** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3460** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 48, Renderer 16, DOM Worker 11, BgPool 11, Compositor 3, WRSceneBuilder 2, WRRenderBackend 1, SwComposite 1, IPC I/O 0, Socket 0, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 49 ms (23.2% of span): Layout 16, JavaScript 11, Other 7, Idle 6, DOM 5, Profiler 3
  - JS leaf 1 / native under JS 28 / native 20; buckets: ipc 48, paint_layout 25, poll_wait 11, harness_diagnostics 9, array_buffer_copy 7, gc_cc 5, worker_messaging 3, json_metadata 2
  - top self: `poll [libc.so.6]` 7; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 4; `[libgtk-3.so.0]` 3; `core::ptr::drop_in_place<style::values::specified::border::B` 3; `SerializeJSONArray(JSContext*, JS::Handle<JSObject*>, (anony` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - WebRender/compositor threads: Renderer 16 ms (top self: `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 6, `hypotf@@GLIBC_2.35 [libm.so.6]` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRRenderBackend#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 10 ms (top self: `unlink [libc.so.6]` 5, `rmdir [libc.so.6]` 3, `fstatat64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 11, js_ctypes 10; top self: `poll [libc.so.6]` 10; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3950** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.8% of span): Idle 3, Layout 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `PresShell::DoFlushPendingNotifications InterruptibleLayout` 0; `[libfreeblpriv3.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3368** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, other 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **socket:3357** CPU ms by thread group: main 0, IPC I/O 0, BgPool 0, Socket 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **48.9** (main 18.4, Renderer 13.8, DOM Worker 4.6, glean.dispatche 3.1, Backgro~Pool # 1.5) | AxioCEFProbe 38.2, cef:gpu-process 18.4, cef:utility 10.7, cef:renderer 7.7 | — | 617.2 |
| plain | idle | — | — | **5.8** (main 4.3, TaskCon~ller # 1.0, Timer 0.5) | AxioCEFProbe 2.5, cef:zygote 0.5, cef:renderer 0.5, Web Content 0.5 | — | — |
| plain | raf | 60.0 | 20.7 | **28.3** (main 8.4, Renderer 4.5, Backgro~Pool # 3.5, SwComposite 3.5, DOM Worker 2.6) | cef:gpu-process 14.4, cef:renderer 11.0, AxioCEFProbe 9.1 | — | — |
| plain | raf-nosampler | — | — | **35.5** (main 8.9, Renderer 4.6, Backgro~Pool # 3.6, SwComposite 3.6, BgIOThr~Pool # 3.3) | cef:gpu-process 16.2, cef:renderer 10.9, AxioCEFProbe 8.6 | — | — |
| plain | scroll | 60.0 | 22.0 | **47.5** (main 18.7, DOM Worker 8.6, Backgro~Pool # 5.7, Renderer 4.8, SwComposite 2.9) | cef:gpu-process 60.4, cef:renderer 13.8, AxioCEFProbe 13.4 | — | — |
| plain | key | — | — | **71.2** (main 20.7, DOM Worker 17.7, Indexed~ IO # 8.5, IndexedDB IO # 5.5, IPDL Background 5.2) | cef:renderer 2.2, AxioCEFProbe 1.9, cef:gpu-process 1.3, WebExtensions 0.3 | 13.6 | — |
| plain | switch-to-gecko | — | — | **122.0** (main 40.7, Renderer 23.3, IPDL Background 11.6, Indexed~ IO # 11.6, Cache2 I/O 5.8) | WebExtensions 5.8, Utility Process 5.8, Isolated Web Co 5.8 | — | 137.6 |
| trace | switch-to-engine | — | — | **127.9** (Renderer 76.3, main 24.5, Backgro~Pool # 8.2, Compositor 5.4, glean.dispatche 2.7) | AxioCEFProbe 54.4, cef:gpu-process 38.1, cef:utility 16.3, cef:renderer 13.6 | — | 308.7 |
| trace | idle | — | — | **8.6** (main 4.3, DOM Worker 2.4, TaskCon~ller # 1.4, Timer 0.5) | AxioCEFProbe 3.9, Web Content 3.8, cef:zygote 0.5 | — | — |
| trace | raf | 60.0 | 21.3 | **30.5** (main 9.3, Renderer 4.8, Backgro~Pool # 3.9, SwComposite 3.5, DOM Worker 2.9) | cef:gpu-process 15.4, cef:renderer 11.6, AxioCEFProbe 9.0 | — | — |
| trace | raf-nosampler | — | — | **25.0** (main 5.6, Renderer 4.6, Backgro~Pool # 3.6, SwComposite 3.3, DOM Worker 3.3) | cef:gpu-process 15.9, cef:renderer 11.5, AxioCEFProbe 8.3 | — | — |
| trace | scroll | 60.0 | 21.1 | **49.1** (main 20.2, DOM Worker 7.7, Backgro~Pool # 5.8, Renderer 5.3, SwComposite 3.4) | cef:gpu-process 62.0, cef:renderer 14.0, AxioCEFProbe 12.9 | — | — |
| trace | key | — | — | **17.1** (main 7.7, Renderer 3.0, SwComposite 1.4, DOM Worker 1.4, Timer 0.8) | cef:renderer 2.5, AxioCEFProbe 2.4, cef:gpu-process 0.8, Privileged Cont 0.3 | 13.2 | — |
| trace | switch-to-gecko | — | — | **55.5** (main 24.6, Renderer 12.3, WRScene~ilder# 6.2, Compositor 6.2, BgIOThr~Pool # 6.2) |  | — | 134.1 |
| profile | switch-to-engine | — | — | **98.8** (Renderer 32.9, main 29.2, SamplerThread 11.0, Compositor 7.3, DOM Worker 7.3) | Web Content 69.5, AxioCEFProbe 36.7, cef:renderer 21.9, Isolated Web Co 7.4 | — | 217.3 |
| profile | idle | — | — | **22.7** (SamplerThread 8.0, DOM Worker 7.1, main 5.7, Timer 1.4, TaskCon~ller # 0.5) | Web Content 8.5, AxioCEFProbe 3.7, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 60.0 | 21.1 | **57.6** (main 12.8, SamplerThread 11.8, DOM Worker 11.5, Renderer 5.7, SwComposite 4.1) | cef:gpu-process 17.2, cef:renderer 13.1, AxioCEFProbe 10.0, Web Content 9.6 | — | — |
| profile | raf-nosampler | — | — | **51.3** (DOM Worker 11.9, SamplerThread 10.6, main 7.6, Renderer 5.3, Backgro~Pool # 4.6) | cef:gpu-process 18.2, cef:renderer 12.3, Web Content 9.9, AxioCEFProbe 9.3 | — | — |
| profile | scroll | 60.2 | 23.6 | **78.7** (main 25.7, DOM Worker 16.2, SamplerThread 12.4, Backgro~Pool # 6.7, Renderer 5.2) | cef:gpu-process 66.6, cef:renderer 14.8, AxioCEFProbe 13.3, Web Content 10.0 | — | — |
| profile | key | — | — | **38.9** (main 11.7, SamplerThread 9.8, DOM Worker 9.0, Renderer 3.5, Timer 1.6) | Web Content 9.0, AxioCEFProbe 2.7, WebExtensions 2.4, cef:renderer 2.2 | 15.9 | — |
| profile | switch-to-gecko | — | — | **7.7** (SamplerThread 3.8, BgIOThr~Pool # 2.5, DOM Worker 0.5, main 0.4, Renderer 0.2) | Web Content 8.2, WebExtensions 1.7, Isolated Web Co 1.6, Privileged Cont 1.6 | — | 15029.0 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 7.7 | 0.0 | 0 | 0.0 | — | — | 1.3 | 0.0 | — | 5.43 | 0.19 | — | — | — | — | — | 0.004 |
| trace | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.35 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.36 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 11.5 | 0.0 | — | 0.57 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | 0.27 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 10.0 | 0.0 | 0 | 0.0 | — | — | 1.9 | 0.0 | — | 5.57 | 0.33 | — | — | — | — | — | 0.008 |
| profile | raf | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.40 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.41 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.3 | 0.0 | 0 | 0.0 | — | — | 6.7 | 0.0 | — | 0.65 | 0.18 | — | — | — | — | — | 0.012 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.1 | 0.0 | — | 0.39 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.157 | 6.080 | 0.0093 | 0.0180 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.221 | 0.325 | 0.0133 | 0.0195 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.243 | 0.360 | 0.0145 | 0.0215 |
| plain | scroll | memfd | native | 122 | 122 | 0.460 | 0.539 | 0.0266 | 0.0312 |
| plain | key | memfd | native | 21 | 21 | 0.046 | 0.147 | 0.0003 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 3.526 | 9.130 | 0.0270 | 0.0699 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 188 | 188 | 0.231 | 0.329 | 0.0138 | 0.0197 |
| trace | raf-nosampler | memfd | native | 182 | 183 | 0.249 | 0.346 | 0.0149 | 0.0208 |
| trace | scroll | memfd | native | 123 | 123 | 0.482 | 0.535 | 0.0282 | 0.0313 |
| trace | key | memfd | native | 21 | 21 | 0.050 | 0.162 | 0.0003 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 2.685 | 9.329 | 0.0268 | 0.0931 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.256 | 0.366 | 0.0154 | 0.0220 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.280 | 0.401 | 0.0168 | 0.0240 |
| profile | scroll | memfd | native | 124 | 124 | 0.522 | 0.597 | 0.0304 | 0.0348 |
| profile | key | memfd | native | 21 | 21 | 0.058 | 0.155 | 0.0003 | 0.0009 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 8.8 | 0.0 | — | 0.27 | 0.46 | — | — | 9.3 | 9.8 | 18.7 |
| profile | 0.8 | 11.1 | 0.0 | — | 0.37 | 0.69 | — | — | 9.5 | 13.0 | 23.4 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 128.2; write create 150.0; first frame applied (native receiver) 325.8; write frame_ack 326.9; write focus 341.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 23.0; first stdout read resolved 30.2; write shutdown 34.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 39.0; first stdout read resolved 59.2; first frame applied (native receiver) 224.6; write frame_ack 226.4; write focus 244.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 33.3; first stdout read resolved 42.0; write shutdown 51.8

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 103, main 73, BgPool 24, DOM Worker 16, SwComposite 6, Compositor 6, WRRenderBackend 5, WRSceneBuilder 3, IPC I/O 3, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 73 ms (24.5% of span): Layout 21, Idle 17, DOM 14, JavaScript 12, Graphics 5, Other 4
  - JS leaf 1 / native under JS 35 / native 36; buckets: ipc 73, paint_layout 31, gc_cc 21, poll_wait 20, array_buffer_copy 13, harness_diagnostics 6, subprocess_pipe_io 6, engine_stream_read 3
  - top self: `poll [libc.so.6]` 17; `mozilla::EffectCompositor::PreTraverseInSubtree(mozilla::Ser` 6; `mozilla::dom::Document::EndUpdate() [libxul.so]` 5; `nsIFrame::IsTransformed() const [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 4; `wr_dp_push_image [libxul.so]` 3
  - WebRender/compositor threads: Renderer 103 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 37, `hypotf@@GLIBC_2.35 [libm.so.6]` 14, `ClearTexSubImage [libxul.so]` 8); SwComposite 6 ms (top self: `syscall [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 2, `webrender::batch::AlphaBatchList::set_params_and_g` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 24 ms (top self: `ARGBSetRow_X86 [libxul.so]` 12, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15, poll_wait 15; top self: `poll [libc.so.6]` 15; `mozilla::ThreadEventQueue::HasPendingEvent() [libx` 1; `JS::SetWarningReporter(JSContext*, void (*)(JSCont` 0; `js::jit::IonUnaryArithIC::update(JSContext*, JS::H` 0; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js` 0
- **tab:4213** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (18.4% of span): Other 38, DOM 4, JavaScript 4, Idle 1, GC / CC 1, Profiler 1
  - JS leaf 0 / native under JS 6 / native 42; buckets: ipc 36, array_buffer_copy 14, gc_cc 10, memcpy_memset 5, subprocess_pipe_io 3, poll_wait 1
  - top self: `[]` 8; `[libexpat.so.1]` 3; `mozilla::dom::WebExtensionPolicy_Binding::getByID(JSContext*` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__strncmp_avx2 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 4 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4218** CPU ms by thread group: main 47, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (20.8% of span): Other 35, Profiler 5, DOM 4, JavaScript 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 34, array_buffer_copy 14, gc_cc 10, subprocess_pipe_io 4, memcpy_memset 3, json_metadata 1, poll_wait 1
  - top self: `[libfontconfig.so.1]` 4; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 3; `getcontext [libc.so.6]` 3; `mmap64 [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 2; `[]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4024** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.0% of span): Idle 2, Layout 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `mozilla::AutoProfilerStyleMarker::~AutoProfilerStyleMarker()` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 102, DOM Worker 89, other 18, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 102 ms (4.8% of span): Idle 85, JavaScript 10, Other 4, GC / CC 2, Profiler 1, DOM 1
  - JS leaf 0 / native under JS 9 / native 93; buckets: ipc 102, poll_wait 87, harness_diagnostics 8, gc_cc 7, array_buffer_copy 5, subprocess_pipe_io 3, native_receiver 0, worker_messaging 0
  - top self: `poll [libc.so.6]` 85; `[unknown]` 1; `js::Proxy::getOwnPropertyDescriptor(JSContext*, JS::Handle<J` 1; `mozilla::CycleCollectedJSRuntime::JSObjectsTenured(JS::GCCon` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [libxul.so]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 89 ms: buckets subprocess_pipe_io 89, worker_messaging 89, ipc 89, js_ctypes 89, poll_wait 89; top self: `poll [libc.so.6]` 89; `getcontext [libc.so.6]` 0
- **tab:4027** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3533** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3494** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 368, DOM Worker 275, Renderer 161, BgPool 122, SwComposite 115, WRRenderBackend 55, Compositor 40, other 30, ImageBridge 18, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 367 ms (11.6% of span): Idle 247, JavaScript 83, Other 23, DOM 10, Profiler 4
  - JS leaf 7 / native under JS 82 / native 279; buckets: ipc 367, poll_wait 263, gc_cc 74, worker_messaging 33, engine_stream_read 31, json_metadata 21, harness_diagnostics 16, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 249; `[unknown]` 15; `mprotect [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `write [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 161 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `syscall [libc.so.6]` 9); SwComposite 115 ms (top self: `syscall [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 47, `webrender::frame_builder::FrameBuilder::build [lib` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 121 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `__memmove_avx_unaligned_erms [libc.so.6]` 21, `[linux-vdso.so.1]` 2); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__lll_lock_wake [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #4 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `NS_NewNativeLocalFile [libxul.so]` 0)
  - busiest DOM Worker 275 ms: buckets subprocess_pipe_io 275, worker_messaging 275, ipc 275, js_ctypes 258, poll_wait 255, gc_cc 6; top self: `poll [libc.so.6]` 255; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[unknown]` 1; `__lll_lock_wake [libc.so.6]` 1; `mozilla::dom::MessageEvent::cycleCollection::Unlin` 1
- **tab:3533** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3494** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 267, main 211, Renderer 150, BgPool 127, SwComposite 110, WRRenderBackend 52, Compositor 39, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 116, JavaScript 54, Other 23, DOM 12, Profiler 5, GC / CC 1
  - JS leaf 6 / native under JS 56 / native 149; buckets: ipc 211, poll_wait 128, gc_cc 69, worker_messaging 40, engine_stream_read 34, json_metadata 20, native_receiver 16, subprocess_pipe_io 13
  - top self: `poll [libc.so.6]` 118; `[unknown]` 14; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 150 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 37, `syscall [libc.so.6]` 7); SwComposite 110 ms (top self: `syscall [libc.so.6]` 88, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 127 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 95, `__memmove_avx_unaligned_erms [libc.so.6]` 31, `mozilla::layers::TextureClientRecycleAllocator::Cr` 0); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `[axiosozo-dev]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 267 ms: buckets subprocess_pipe_io 267, worker_messaging 267, ipc 267, js_ctypes 250, poll_wait 246, gc_cc 7; top self: `poll [libc.so.6]` 246; `[axiosozo-dev]` 3; `[unknown]` 1; `nsTHashtable<nsBaseHashtableET<mozilla::dom::Timeo` 1; `write [libc.so.6]` 1
- **tab:3494** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4218** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 512, DOM Worker 288, BgPool 133, Renderer 101, SwComposite 68, WRRenderBackend 39, Compositor 28, other 21, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 513 ms (24.1% of span): Idle 295, JavaScript 95, Other 67, DOM 21, Graphics 17, Layout 10
  - JS leaf 10 / native under JS 100 / native 402; buckets: ipc 512, poll_wait 388, gc_cc 86, paint_layout 54, worker_messaging 40, subprocess_pipe_io 27, array_buffer_copy 26, engine_stream_read 25
  - top self: `poll [libc.so.6]` 302; `recvmsg [libc.so.6]` 16; `[unknown]` 13; `write [libc.so.6]` 11; `[axiosozo-dev]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4
  - WebRender/compositor threads: Renderer 101 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 70, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `syscall [libc.so.6]` 8); SwComposite 68 ms (top self: `syscall [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 6, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 133 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `__memmove_avx_unaligned_erms [libc.so.6]` 41, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::ipc::NodeController::GetMessage(mojo::cor` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 288 ms: buckets subprocess_pipe_io 288, worker_messaging 288, ipc 288, js_ctypes 249, poll_wait 239, gc_cc 13; top self: `poll [libc.so.6]` 239; `getcontext [libc.so.6]` 6; `[unknown]` 4; `__lll_lock_wake [libc.so.6]` 4; `mozilla::CycleCollectedJSRuntime::NurseryWrapperAd` 2
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `g_main_context_iteration [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3533** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3515** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 397, DOM Worker 222, Renderer 118, SwComposite 48, other 34, WRRenderBackend 17, Compositor 16, WRWorker 13, WRSceneBuilder 9, BgPool 5, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 397 ms (10.7% of span): Idle 169, JavaScript 79, Layout 42, Other 41, Graphics 32, DOM 15
  - JS leaf 9 / native under JS 130 / native 258; buckets: ipc 397, poll_wait 210, gc_cc 92, paint_layout 86, worker_messaging 62, engine_stream_read 36, array_buffer_copy 22, subprocess_pipe_io 22
  - top self: `poll [libc.so.6]` 171; `[axiosozo-dev]` 13; `[unknown]` 12; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 7; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, J` 5
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 40, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 9); SwComposite 48 ms (top self: `syscall [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 19, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 222 ms: buckets subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 212, poll_wait 209, gc_cc 4; top self: `poll [libc.so.6]` 209; `[unknown]` 2; `[axiosozo-dev]` 1; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 1; `void* js::gc::CellAllocator::AllocTenuredCellForNu` 1
- **tab:3437** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `js::jit::Assembler::movq(js::jit::ImmWord, js::jit::Register` 0; `get (resource://gre/modules/ExtensionUtils.sys.mjs:102:6)[7]` 0; `mozilla::xpcom::StaticComponents::LookupByContractID(nsTSubs` 0; `IPC::ParamTraits<JSStructuredCloneData>::Read(IPC::MessageRe` 0; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4027** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3533** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 364, main 70, DOM Worker 65, Renderer 42, IPC I/O 6, Compositor 6, SwComposite 3, WRRenderBackend 3, WRSceneBuilder 2, other 2, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 70 ms (0.5% of span): Layout 18, JavaScript 18, Other 15, Idle 11, Graphics 2, DOM 2
  - JS leaf 1 / native under JS 30 / native 39; buckets: ipc 70, paint_layout 21, poll_wait 14, gc_cc 13, array_buffer_copy 12, harness_diagnostics 10, worker_messaging 6, memcpy_memset 5
  - top self: `poll [libc.so.6]` 12; `mozilla::dom::Event::InitPresContextData(nsPresContext*) [li` 6; `madvise [libc.so.6]` 5; `[unknown]` 3; `style::properties::cascade::Cascade::apply_custom_and_priori` 2; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 2
  - GC/CC markers: GCMinor 2× 1 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 12, `ps_quad_textured_TEXTURE_RECT_vert::quad_primive_i` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 363 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 339, `write [libc.so.6]` 12, `unlink [libc.so.6]` 7); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 65 ms: buckets subprocess_pipe_io 65, worker_messaging 65, ipc 65, gc_cc 54, js_ctypes 10, poll_wait 10; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5; `mozilla::dom::CallbackTimeoutHandler::cycleCollect` 4
- **tab:3533** CPU ms by thread group: main 7, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 3, JavaScript 2, DOM 1, Other 1
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 7, poll_wait 3, gc_cc 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 3; `js::jit::CacheIRCompiler::addFailurePath(js::jit::FailurePat` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `write [libc.so.6]` 1; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, J` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4024** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, Layout 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 0
  - top self: `poll [libc.so.6]` 4; `mozilla::PresShell::FrameNeedsReflow(nsIFrame*, mozilla::Int` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3494** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## gecko-debian (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **7.0** (main 2.5, Renderer 2.5, glean.dispatche 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Web Content 2.5, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **22.0** (Renderer 12.5, WRRende~ckend# 2.0, main 1.3, TaskCon~ller # 1.3, Compositor 1.3) | Isolated Web Co 3.9, WebExtensions 0.6, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.0, WRRende~ckend# 1.7, main 1.3, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 3.6, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **32.6** (Renderer 20.6, main 3.5, WRRende~ckend# 2.5, SwComposite 2.5, glean.dispatche 1.0) | Isolated Web Co 4.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.8** (main 4.0, Renderer 0.8, TaskCon~ller # 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.0 | — |
| trace | idle | 59.0 | 17.2 | **4.5** (main 2.0, TaskCon~ller # 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Renderer 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **13.4** (Renderer 7.3, WRRende~ckend# 1.7, glean.dispatche 1.0, WRScene~ilder# 1.0, Compositor 1.0) | Isolated Web Co 3.6 | — | — |
| trace | raf-nosampler | — | — | **15.0** (Renderer 7.7, WRScene~ilder# 1.7, WRRende~ckend# 1.3, main 1.0, Compositor 1.0) | Isolated Web Co 4.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **36.2** (Renderer 21.7, main 4.5, WRRende~ckend# 2.5, SwComposite 2.5, glean.dispatche 1.0) | Isolated Web Co 3.0 | — | — |
| trace | key | — | — | **53.5** (main 15.3, DOM Worker 13.1, Indexed~ IO # 10.7, IPDL Background 5.6, TaskCon~ller # 2.1) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **5.5** (SamplerThread 2.5, DOM Worker 2.0, main 0.5, Socket Thread 0.5) | Web Content 4.9, Isolated Web Co 3.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **22.2** (Renderer 8.2, SamplerThread 3.9, main 2.0, WRRende~ckend# 1.6, TaskCon~ller # 1.3) | Isolated Web Co 7.5, Web Content 5.9, WebExtensions 1.3, RDD Process 1.3 | — | — |
| profile | raf-nosampler | — | — | **24.6** (Renderer 8.3, SamplerThread 4.0, WRScene~ilder# 1.7, WRRende~ckend# 1.7, main 1.3) | Isolated Web Co 7.3, Web Content 4.7, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **48.6** (Renderer 24.6, main 6.5, SamplerThread 5.5, WRRende~ckend# 3.0, SwComposite 3.0) | Isolated Web Co 7.5, Web Content 5.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | key | — | — | **10.4** (main 4.3, SamplerThread 2.9, Renderer 0.8, glean.dispatche 0.5, WRScene~ilder# 0.5) | Web Content 4.9, Isolated Web Co 3.2, WebExtensions 1.4, Socket Process 0.8 | 10.0 | — |

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

- **parent** CPU ms by thread group: DOM Worker 41, main 7, IPC I/O 1, Socket 0, other 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 7 ms (0.4% of span): Idle 4, JavaScript 3, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 7, poll_wait 4, harness_diagnostics 2, gc_cc 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `js::jit::CacheIRStubKey::hash(js::jit::CacheIRStubKey::Looku` 1; `js::DependentAddPtr<JS::GCHashSet<js::WeakHeapPtr<js::SavedF` 1; `nsTSubstring<char>::AppendASCII(char const*, unsigned long, ` 1; `js::NativeObject::moveDenseElements(unsigned int, unsigned i` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__lll_lock_wait [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 39 ms: buckets worker_messaging 39, ipc 39, gc_cc 39, memcpy_memset 11, poll_wait 2; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 16; `madvise [libc.so.6]` 9; `__syscall_cancel_arch [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:8469** CPU ms by thread group: main 19, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 19 ms (0.9% of span): Idle 15, JavaScript 2, Other 1, Profiler 1, DOM 0, Layout 0
  - JS leaf 0 / native under JS 2 / native 17; buckets: ipc 19, poll_wait 15, harness_diagnostics 2, array_buffer_copy 2, paint_layout 1, gc_cc 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 15; `mozilla::detail::RunnableMethodImpl<webrtc::DesktopCaptureIm` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1; `CanEnterBaselineJIT(JSContext*, JS::Handle<JSScript*>, js::A` 0; `mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Compart` 0; `js::jit::IRGenerator::emitConstantDataPropertyResult(js::Nat` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8400** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8552** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 237, main 63, WRRenderBackend 55, WRSceneBuilder 45, Compositor 38, SwComposite 24, IPC I/O 9, DOM Worker 2, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 63 ms (2.1% of span): GC / CC 30, Idle 18, JavaScript 8, Other 5, Graphics 2, Profiler 0
  - JS leaf 2 / native under JS 6 / native 55; buckets: ipc 63, gc_cc 34, poll_wait 25, harness_diagnostics 6, paint_layout 4, array_buffer_copy 2, subprocess_pipe_io 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeE` 2; `mozilla::ImplCycleCollectionTraverse(nsCycleCollectionTraver` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<js::BaseScr` 2
  - GC/CC markers: GCSlice 10× 24 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 237 ms (top self: `__syscall_cancel_arch [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 45, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 27); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `__pthread_mutex_unlock_usercnt [libc.so.6]` 1); WRSceneBuilder#0 40 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `DoSharedSample(bool, unsigned int, mozilla::profil` 0, `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 1
- **tab:8469** CPU ms by thread group: main 150, IPC I/O 13, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 150 ms (4.9% of span): Idle 97, Layout 13, Graphics 13, Other 9, GC / CC 6, JavaScript 5
  - JS leaf 0 / native under JS 10 / native 140; buckets: ipc 143, poll_wait 99, paint_layout 34, gc_cc 8, harness_diagnostics 6, array_buffer_copy 5, subprocess_pipe_io 2, canvas_2d 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 102; `[]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 2; `mozilla::DisplayItemClip::operator==(mozilla::DisplayItemCli` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::dom::XrayFindOwnPropertyInfo(JSContext*, mozilla::d` 1
  - GC/CC markers: GCMajor 1× 24 ms, GCSlice 5× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8509** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8381** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 251, WRRenderBackend 56, WRSceneBuilder 46, main 43, Compositor 38, SwComposite 16, IPC I/O 8, DOM Worker 4, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (1.4% of span): GC / CC 27, Idle 11, Other 2, JavaScript 1, DOM 1, Graphics 1
  - JS leaf 0 / native under JS 2 / native 41; buckets: ipc 43, gc_cc 30, poll_wait 13, harness_diagnostics 2, array_buffer_copy 2, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 2; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 251 ms (top self: `__syscall_cancel_arch [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 41, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 30); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1); WRSceneBuilder#0 41 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, memcpy_memset 2, gc_cc 2, array_buffer_copy 1, poll_wait 0; top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `munmap [libc.so.6]` 1; `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8469** CPU ms by thread group: main 144, IPC I/O 13, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 144 ms (4.8% of span): Idle 100, Graphics 15, Layout 11, Profiler 7, Other 6, GC / CC 3
  - JS leaf 0 / native under JS 4 / native 140; buckets: ipc 135, poll_wait 101, paint_layout 35, gc_cc 4, memcpy_memset 3, canvas_2d 2, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 3; `__lll_lock_wait [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8400** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8552** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mprotect [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 464, main 116, WRRenderBackend 58, SwComposite 54, Compositor 27, WRSceneBuilder 22, IPC I/O 6, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 116 ms (5.8% of span): Idle 58, GC / CC 28, Other 13, JavaScript 5, Graphics 5, Layout 4
  - JS leaf 0 / native under JS 6 / native 109; buckets: ipc 115, poll_wait 75, gc_cc 31, paint_layout 10, harness_diagnostics 6, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 8× 25 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 464 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 135, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 79, `__syscall_cancel_arch [libc.so.6]` 52); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 44, `webrender::batch::BatchBuilder::add_prim_to_batch:` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); SwComposite 54 ms (top self: `syscall [libc.so.6]` 47, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<false>(Texture&, IntRect const&, T` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8469** CPU ms by thread group: main 84, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 83 ms (4.2% of span): Idle 59, Graphics 10, Other 7, Profiler 3, JavaScript 2, Layout 2
  - JS leaf 0 / native under JS 2 / native 81; buckets: ipc 79, poll_wait 60, paint_layout 16, gc_cc 2, harness_diagnostics 2, array_buffer_copy 1, memcpy_memset 1, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 62; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `already_AddRefed<mozilla::layers::WebRenderAPZAnimationData>` 1; `__strlen_evex [libc.so.6]` 1; `syscall [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8381** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8509** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 148, Renderer 33, Compositor 17, WRRenderBackend 17, WRSceneBuilder 13, IPC I/O 7, SwComposite 5, other 2, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 148 ms (3.9% of span): Idle 41, Layout 35, Other 23, JavaScript 22, Graphics 17, DOM 6
  - JS leaf 4 / native under JS 24 / native 120; buckets: ipc 146, poll_wait 61, paint_layout 56, gc_cc 16, canvas_2d 3, subprocess_pipe_io 3, harness_diagnostics 3, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 46; `[unknown]` 7; `[axiosozo-dev]` 3; `mozilla::nsDisplayList::HitTest(mozilla::nsDisplayListBuilde` 2; `nsIFrame::CanBeDynamicReflowRoot() const [libxul.so]` 2; `mozilla::ReflowInput::ComputeContainingBlockRectangle(nsPres` 2
  - WebRender/compositor threads: Renderer 33 ms (top self: `__syscall_cancel_arch [libc.so.6]` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 0, `[axiosozo-dev]` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `core::ptr::drop_in_place<webrender::picture::Pictu` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::gc::BufferAllocator::sweepForMajorCollection(b` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8469** CPU ms by thread group: main 58, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 59 ms (1.6% of span): Idle 24, Other 12, JavaScript 6, Graphics 6, Layout 5, GC / CC 3
  - JS leaf 0 / native under JS 5 / native 53; buckets: ipc 53, poll_wait 24, paint_layout 17, gc_cc 5, harness_diagnostics 2, array_buffer_copy 2, canvas_2d 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 27; `[]` 2; `[linux-vdso.so.1]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libx` 1; `mozilla::nsDisplayListBuilder::CreateClipChainIntersection(m` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8309** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, GC / CC 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `firefox_on_glean::private::timing_distribution::TimingDistri` 0; `xpc::JSXrayTraits::getOwnPropertyFromTargetIfSafe(JSContext*` 0; `js::Proxy::getElements(JSContext*, JS::Handle<JSObject*>, un` 0; `[unknown]` 0; `[]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8400** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **38.6** (Renderer 18.0, main 10.3, DOM Worker 5.1, WRRende~ckend# 2.6, SwComposite 2.6) | WPEWebProcess 56.5, AxioWebKitHost 18.0, WPENetworkProce 12.8 | — | 368.7 |
| plain | idle | — | — | **6.9** (main 3.9, DOM Worker 1.5, TaskCon~ller # 1.0, glean.dispatche 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| plain | raf | 57.9 | 21.1 | **16.8** (main 7.2, Renderer 2.0, DOM Worker 1.6, Backgro~Pool # 1.3, SwComposite 1.0) | WPEWebProcess 42.8, AxioWebKitHost 6.3 | — | — |
| plain | raf-nosampler | — | — | **16.9** (main 4.3, Renderer 2.7, DOM Worker 2.3, SwComposite 1.7, Backgro~Pool # 1.3) | WPEWebProcess 48.1, AxioWebKitHost 7.0, WebExtensions 0.3 | — | — |
| plain | scroll | 56.8 | 33.1 | **35.5** (main 16.5, DOM Worker 6.0, Backgro~Pool # 3.5, Renderer 2.5, TaskCon~ller # 2.0) | WPEWebProcess 50.0, AxioWebKitHost 9.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **14.0** (main 8.5, Renderer 1.1, DOM Worker 0.8, Timer 0.6, TaskCon~ller # 0.6) | WPEWebProcess 5.6, AxioWebKitHost 1.4, Isolated Web Co 0.3 | 17.9 | — |
| plain | switch-to-gecko | — | — | **35.4** (main 17.7, TaskCon~ller # 8.9, Renderer 4.4, sqldb:p~lite # 4.4) |  | — | 211.2 |
| trace | switch-to-engine | — | — | **31.5** (main 18.0, Renderer 9.0, glean.dispatche 4.5) | WPEWebProcess 49.5, WPENetworkProce 13.5, AxioWebKitHost 9.0 | — | 206.0 |
| trace | idle | — | — | **3.0** (main 2.5, Timer 0.5) | Web Content 2.5, forkserver 0.5 | — | — |
| trace | raf | 57.1 | 24.4 | **75.1** (main 19.7, DOM Worker 19.7, Indexed~ IO # 14.1, IPDL Background 6.2, Renderer 2.6) | WPEWebProcess 47.3, AxioWebKitHost 7.6, RDD Process 0.3, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **23.7** (main 8.0, DOM Worker 4.0, Renderer 2.7, TaskCon~ller # 2.0, Backgro~Pool # 1.7) | WPEWebProcess 47.6, AxioWebKitHost 7.6, Web Content 0.3 | — | — |
| trace | scroll | 57.0 | 33.7 | **37.5** (main 17.0, DOM Worker 7.5, Backgro~Pool # 3.0, TaskCon~ller # 2.5, Renderer 2.0) | WPEWebProcess 49.0, AxioWebKitHost 9.5 | — | — |
| trace | key | — | — | **14.8** (main 8.3, DOM Worker 1.4, Renderer 1.1, Timer 0.8, SwComposite 0.8) | WPEWebProcess 5.8, AxioWebKitHost 1.7, WebExtensions 0.3 | 17.8 | — |
| trace | switch-to-gecko | — | — | **35.3** (main 17.7, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4, Renderer 4.4, WRRende~ckend# 4.4) | Isolated Web Co 4.4 | — | 211.5 |
| profile | switch-to-engine | — | — | **41.9** (main 12.5, Renderer 8.4, DOM Worker 8.4, Backgro~Pool # 4.2, Compositor 4.2) | Web Content 92.0, WPEWebProcess 62.7, WPENetworkProce 8.4, Isolated Web Co 4.2 | — | 209.7 |
| profile | idle | — | — | **27.9** (main 10.3, DOM Worker 6.8, SamplerThread 6.8, TaskCon~ller # 2.0, Timer 1.5) | Web Content 5.4, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 58.0 | 24.5 | **45.7** (main 14.1, DOM Worker 9.5, SamplerThread 8.2, Renderer 2.9, WRRende~ckend# 1.6) | WPEWebProcess 48.7, AxioWebKitHost 7.5, Web Content 6.2, Isolated Web Co 1.6 | — | — |
| profile | raf-nosampler | — | — | **32.0** (DOM Worker 10.0, SamplerThread 6.7, main 5.3, Renderer 2.7, Backgro~Pool # 1.7) | WPEWebProcess 47.8, AxioWebKitHost 7.7, Web Content 5.3, Socket Process 1.0 | — | — |
| profile | scroll | 57.3 | 33.6 | **62.1** (main 24.8, DOM Worker 12.9, SamplerThread 8.4, Backgro~Pool # 4.0, Renderer 3.0) | WPEWebProcess 52.2, AxioWebKitHost 9.5, Web Content 5.0, Socket Process 1.0 | — | — |
| profile | key | — | — | **37.9** (main 15.1, DOM Worker 8.0, SamplerThread 7.1, TaskCon~ller # 2.5, Renderer 1.6) | WPEWebProcess 6.5, Web Content 5.8, Privileged Cont 1.4, Isolated Web Co 1.4 | 18.1 | — |
| profile | switch-to-gecko | — | — | **29.5** (main 12.7, Renderer 4.2, Compositor 4.2, DOM Worker 4.2, SamplerThread 4.2) | Isolated Web Co 4.2 | — | 216.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 8.5 | 0.0 | 0 | 0.0 | — | — | 47.1 | 0.0 | — | 1.44 | 0.55 | — | — | — | — | — | 0.005 |
| trace | raf | 57.3 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.15 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.7 | 0.0 | — | 0.17 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 56.3 | 0.0 | 0 | 0.0 | — | — | 13.1 | 0.0 | — | 0.34 | 0.09 | — | — | — | — | — | 0.005 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.07 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.8 | 0.0 | 0 | 0.0 | — | — | 57.9 | 0.0 | — | 1.99 | 1.08 | — | — | — | — | — | 0.009 |
| profile | raf | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.17 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.20 | 0.14 | — | — | — | — | — | 0.009 |
| profile | scroll | 56.3 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 0.42 | 0.13 | — | — | — | — | — | 0.008 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.10 | 0.12 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.850 | 1.378 | 0.0043 | 0.0069 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.047 | 0.113 | 0.0027 | 0.0066 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.065 | 0.148 | 0.0038 | 0.0086 |
| plain | scroll | memfd | native | 112 | 112 | 0.243 | 0.337 | 0.0135 | 0.0188 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.098 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.824 | 1.527 | 0.0070 | 0.0129 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 176 | 176 | 0.067 | 0.133 | 0.0038 | 0.0077 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.083 | 0.152 | 0.0048 | 0.0088 |
| trace | scroll | memfd | native | 113 | 113 | 0.254 | 0.335 | 0.0143 | 0.0189 |
| trace | key | memfd | native | 20 | 20 | 0.002 | 0.098 | 0.0000 | 0.0005 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.474 | 2.407 | 0.0116 | 0.0189 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.066 | 0.132 | 0.0039 | 0.0077 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.090 | 0.169 | 0.0052 | 0.0098 |
| profile | scroll | memfd | native | 114 | 113 | 0.289 | 0.389 | 0.0163 | 0.0217 |
| profile | key | memfd | native | 20 | 20 | 0.002 | 0.121 | 0.0000 | 0.0007 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 14.7 | 0.0 | — | 0.07 | 0.26 | — | — | 14.3 | 15.6 | 30.2 |
| profile | 0.6 | 14.4 | 0.0 | — | 0.10 | 0.34 | — | — | 14.8 | 16.6 | 31.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 19.1; first stdout read resolved 28.0; first frame applied (native receiver) 216.8; write frame_ack 217.8; write visibility 221.1; write focus 221.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 13.1; first stdout read resolved 18.3

Switch timeline (profile, switch-to-engine, ms after the window start): write create 22.6; first stdout read resolved 29.9; first frame applied (native receiver) 217.0; write frame_ack 219.0; write visibility 226.4; write focus 226.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 16.5; first stdout read resolved 25.8

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 37, Renderer 17, DOM Worker 15, BgPool 6, IPC I/O 2, Compositor 2, WRRenderBackend 2, SwComposite 2, WRSceneBuilder 1, Socket 1, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 37 ms (14.7% of span): JavaScript 9, DOM 8, Idle 6, Layout 4, Other 4, GC / CC 4
  - JS leaf 0 / native under JS 25 / native 12; buckets: ipc 37, gc_cc 18, harness_diagnostics 15, array_buffer_copy 13, paint_layout 10, poll_wait 7, engine_stream_read 4, subprocess_pipe_io 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 5; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `js::DefineDataProperty(JSContext*, JS::Handle<JSObject*>, JS` 2; `nsIFrame::GetAspectRatio() const [libxul.so]` 1
  - WebRender/compositor threads: Renderer 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_mask_SUPERELLIPSE_frag::pattern_fragment(g` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #1 6 ms (top self: `ARGBSetRow_X86 [libxul.so]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 14, poll_wait 13, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 13; `void mozilla::WriteULEB128<unsigned int, mozilla::` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 0
- **tab:7881** CPU ms by thread group: main 41, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 41 ms (24.8% of span): Other 31, JavaScript 3, Profiler 3, DOM 3, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 36; buckets: ipc 31, array_buffer_copy 13, gc_cc 10, subprocess_pipe_io 4, poll_wait 2, json_metadata 1
  - top self: `[libfontconfig.so.1]` 4; `[]` 3; `__lll_lock_wake [libc.so.6]` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7887** CPU ms by thread group: main 38, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 38 ms (24.6% of span): Other 30, JavaScript 4, Profiler 2, DOM 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 3 / native 35; buckets: ipc 30, array_buffer_copy 11, gc_cc 6, subprocess_pipe_io 2, poll_wait 1, memcpy_memset 0
  - top self: `__strcmp_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::net::LoadInfo::~LoadInfo() [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `uhash_geti_78 [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7740** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.8% of span): Idle 2, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 193, DOM Worker 82, other 15, Socket 1, BgPool 1, IPC I/O 1, ImageIO 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 193 ms (9.4% of span): Idle 117, GC / CC 41, JavaScript 17, Other 11, DOM 5, Profiler 2
  - JS leaf 3 / native under JS 18 / native 172; buckets: ipc 193, poll_wait 122, gc_cc 46, harness_diagnostics 18, array_buffer_copy 4, engine_stream_read 2, memcpy_memset 2, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 122; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `[unknown]` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMajor 1× 1051 ms, GCSlice 8× 32 ms, CCSlice 4× 10 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `[axiosozo-dev]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 82 ms: buckets subprocess_pipe_io 82, worker_messaging 82, ipc 82, js_ctypes 81, poll_wait 81; top self: `__syscall_cancel_arch [libc.so.6]` 81; `[unknown]` 0
- **tab:7740** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::dom::AutoYieldJSThreadExecution::AutoYieldJSThreadE` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 395, DOM Worker 213, Renderer 84, SwComposite 48, BgPool 40, WRRenderBackend 37, Compositor 32, other 24, ImageBridge 13, WRSceneBuilder 6, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 395 ms (12.8% of span): Idle 256, JavaScript 62, Other 31, GC / CC 26, DOM 16, Profiler 3
  - JS leaf 9 / native under JS 66 / native 319; buckets: ipc 393, poll_wait 274, gc_cc 82, engine_stream_read 40, worker_messaging 32, subprocess_pipe_io 20, harness_diagnostics 18, native_receiver 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 269; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 5; `__lll_lock_wait [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 1049 ms, GCSlice 8× 30 ms, GCMinor 2× 2 ms
  - WebRender/compositor threads: Renderer 84 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx512_unaligned_erms [libc.so.6]` 9, `syscall [libc.so.6]` 4); SwComposite 47 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 1, `floorf [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 41 ms (top self: `__syscall_cancel_arch [libc.so.6]` 38, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 213 ms: buckets subprocess_pipe_io 213, worker_messaging 212, ipc 212, js_ctypes 195, poll_wait 191, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 191; `[axiosozo-dev]` 3; `[unknown]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:7740** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 3, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, gc_cc 3, poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `non-virtual thunk to mozilla::dom::SessionStoreChangeListene` 0; `js::gcstats::Statistics::lookupChildPhase(js::gcstats::Phase` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Ad` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7746** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 206, main 160, Renderer 78, BgPool 50, SwComposite 50, WRRenderBackend 37, Compositor 32, ImageBridge 12, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 160 ms (5.3% of span): Idle 93, JavaScript 42, Other 9, DOM 8, Profiler 5, GC / CC 3
  - JS leaf 8 / native under JS 43 / native 109; buckets: ipc 160, poll_wait 97, gc_cc 53, engine_stream_read 34, worker_messaging 19, native_receiver 15, subprocess_pipe_io 12, array_buffer_copy 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 99; `[unknown]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `bool js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl` 1; `PreprocessFastValue(JSContext*, JS::Value*, (anonymous names` 1; `presentNativeFrame (chrome://browser/content/axiosozo/Engine` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `__syscall_cancel_arch [libc.so.6]` 62, `__memmove_avx512_unaligned_erms [libc.so.6]` 8, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); SwComposite 50 ms (top self: `syscall [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 49 ms (top self: `__syscall_cancel_arch [libc.so.6]` 44, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 0); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `[linux-vdso.so.1]` 0)
  - busiest DOM Worker 206 ms: buckets subprocess_pipe_io 206, worker_messaging 204, ipc 204, js_ctypes 185, poll_wait 181, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 181; `mozilla::JSHolderMap::Put(void*, nsScriptObjectTra` 3; `[linux-vdso.so.1]` 2; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1
- **tab:7740** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, Other 1, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 0; `__lll_lock_wake [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7746** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 460, DOM Worker 202, BgPool 76, Renderer 53, SwComposite 29, WRRenderBackend 27, Compositor 20, other 16, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 460 ms (22.7% of span): Idle 249, JavaScript 86, Other 48, GC / CC 33, DOM 19, Profiler 10
  - JS leaf 10 / native under JS 91 / native 358; buckets: ipc 458, poll_wait 293, gc_cc 113, engine_stream_read 53, worker_messaging 40, paint_layout 34, harness_diagnostics 29, array_buffer_copy 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 265; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `__lll_lock_wake [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCSlice 7× 29 ms, CCSlice 3× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 53 ms (top self: `__syscall_cancel_arch [libc.so.6]` 40, `syscall [libc.so.6]` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); SwComposite 29 ms (top self: `syscall [libc.so.6]` 29, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 1, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 76 ms (top self: `__syscall_cancel_arch [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 17, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `mozilla::BufferList<InfallibleAllocPolicy>::Alloca` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 202 ms: buckets subprocess_pipe_io 202, worker_messaging 202, ipc 202, js_ctypes 185, poll_wait 173, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 175; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[unknown]` 2; `__lll_lock_wait [libc.so.6]` 2; `mozilla::ProfileBufferEntryWriter::Serializer<mozi` 1
- **tab:7360** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7740** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7746** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 502, DOM Worker 188, Renderer 47, other 26, SwComposite 25, Compositor 16, WRRenderBackend 16, WRSceneBuilder 9, WRWorker 9, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 502 ms (13.8% of span): Idle 220, JavaScript 75, GC / CC 63, Other 39, Layout 35, Graphics 30
  - JS leaf 13 / native under JS 116 / native 373; buckets: ipc 500, poll_wait 259, gc_cc 142, paint_layout 80, engine_stream_read 61, worker_messaging 60, harness_diagnostics 23, subprocess_pipe_io 18
  - top self: `__syscall_cancel_arch [libc.so.6]` 229; `[unknown]` 18; `[axiosozo-dev]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4
  - GC/CC markers: GCMajor 2× 1086 ms, GCSlice 15× 53 ms, CCSlice 5× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `ClearTexSubImage [libxul.so]` 3); SwComposite 25 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 11, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `__pthread_mutex_unlock_usercnt [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 183 ms: buckets subprocess_pipe_io 183, worker_messaging 183, ipc 183, js_ctypes 174, poll_wait 170, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 170; `[axiosozo-dev]` 1; `[unknown]` 1; `js::intl::SharedIntlData::trace(JSTracer*) [libxul` 1; `js::gc::TenuringTracer::promoteObjectSlow(JSObject` 1
- **tab:7280** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozill` 0; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 0; `PR_GetCurrentThread [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 63, Renderer 18, DOM Worker 10, BgPool 4, WRRenderBackend 3, WRSceneBuilder 2, Compositor 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 63 ms (23.1% of span): JavaScript 23, DOM 11, Graphics 9, Other 7, Layout 6, Idle 4
  - JS leaf 1 / native under JS 37 / native 25; buckets: ipc 63, paint_layout 17, array_buffer_copy 16, gc_cc 14, harness_diagnostics 9, poll_wait 6, engine_stream_read 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[axiosozo-dev]` 6; `nsAtomTable::AtomizeMainThread(nsTSubstring<char16_t> const&` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 3; `getcontext [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 18 ms (top self: `hypotf@@GLIBC_2.35 [libm.so.6]` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `rmdir [libc.so.6]` 1, `getdents64 [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, poll_wait 9, js_ctypes 9, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 9; `mozilla::EventDispatcher::Dispatch(mozilla::dom::E` 0; `[axiosozo-dev]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::Alloca` 0
- **tab:7740** CPU ms by thread group: main 23, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 23 ms (8.4% of span): JavaScript 8, Idle 5, Other 4, Layout 3, DOM 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 16; buckets: ipc 21, gc_cc 9, paint_layout 9, subprocess_pipe_io 6, poll_wait 5, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::frontend::ParserAtomsTable::internLatin1(js::FrontendCon` 3; `mozilla::PresShell::GetRootWidget() const [libxul.so]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `js::gc::BufferAllocator::allocSmall(unsigned long, bool, boo` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7280** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, J` 0; `js::AsyncFunctionResolve(JSContext*, JS::Handle<js::AsyncFun` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7881** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Other 0, Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `g_poll [libglib-2.0.so.0]` 0; `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **44.7** (Renderer 24.8, main 14.9, WRRende~ckend# 5.0) | WPEWebProcess 69.5, AxioWebKitHost 9.9, WPENetworkProce 9.9 | — | 172.8 |
| plain | idle | — | — | **4.9** (main 3.9, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 2.5 | — | — |
| plain | raf | 58.1 | 24.7 | **32.4** (main 9.5, Renderer 6.2, SwComposite 4.9, Backgro~Pool # 3.3, DOM Worker 2.6) | WPEWebProcess 146.1, AxioWebKitHost 19.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **26.5** (Renderer 6.0, main 4.7, Backgro~Pool # 4.7, SwComposite 4.0, DOM Worker 2.7) | WPEWebProcess 137.3, AxioWebKitHost 19.6, Isolated Web Co 0.3 | — | — |
| plain | scroll | 56.7 | 36.0 | **55.1** (main 19.1, Backgro~Pool # 10.8, DOM Worker 7.4, Renderer 5.9, SwComposite 3.4) | WPEWebProcess 152.2, AxioWebKitHost 22.6, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **16.9** (main 8.5, Renderer 2.7, SwComposite 1.9, DOM Worker 0.8, Timer 0.5) | WPEWebProcess 14.2, AxioWebKitHost 2.8 | 27.4 | — |
| plain | switch-to-gecko | — | — | **35.2** (main 17.6, Renderer 8.8, TaskCon~ller # 4.4, Compositor 4.4) |  | — | 212.7 |
| trace | switch-to-engine | — | — | **86.4** (Renderer 46.8, main 18.0, WrGlyph~terizer 3.6, WRScene~ilder# 3.6, Compositor 3.6) | WPEWebProcess 75.6, AxioWebKitHost 10.8, WPENetworkProce 10.8, Web Content 3.6 | — | 263.7 |
| trace | idle | — | — | **49.6** (DOM Worker 13.7, main 12.7, Indexed~ IO # 10.3, IPDL Background 6.4, TaskCon~ller # 2.0) | Web Content 2.9, forkserver 0.5 | — | — |
| trace | raf | 57.4 | 23.4 | **31.3** (main 8.8, Renderer 6.2, DOM Worker 4.9, SwComposite 3.9, Backgro~Pool # 3.3) | WPEWebProcess 135.5, AxioWebKitHost 19.2 | — | — |
| trace | raf-nosampler | — | — | **26.9** (Renderer 6.0, main 5.0, SwComposite 4.3, Backgro~Pool # 4.3, DOM Worker 3.0) | WPEWebProcess 138.6, AxioWebKitHost 20.0 | — | — |
| trace | scroll | 56.0 | 32.0 | **55.1** (main 20.1, Backgro~Pool # 10.8, DOM Worker 6.9, Renderer 6.4, SwComposite 3.4) | WPEWebProcess 146.9, AxioWebKitHost 23.1 | — | — |
| trace | key | — | — | **17.2** (main 8.5, Renderer 2.7, SwComposite 2.2, DOM Worker 1.1, Timer 0.5) | WPEWebProcess 14.6, AxioWebKitHost 3.3 | 26.2 | — |
| trace | switch-to-gecko | — | — | **44.0** (main 17.6, glean.dispatche 4.4, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4, Renderer 4.4) | Isolated Web Co 4.4 | — | 212.9 |
| profile | switch-to-engine | — | — | **39.0** (main 11.7, DOM Worker 7.8, SamplerThread 7.8, Renderer 3.9, WRRende~ckend# 3.9) | Web Content 136.0, WPEWebProcess 54.4, AxioWebKitHost 11.7, WPENetworkProce 11.7 | — | 236.9 |
| profile | idle | — | — | **27.9** (main 10.8, DOM Worker 6.8, SamplerThread 5.9, TaskCon~ller # 2.9, Timer 1.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, RDD Process 1.0 | — | — |
| profile | raf | 57.9 | 21.7 | **49.9** (main 12.7, DOM Worker 8.5, Renderer 7.2, SamplerThread 6.8, SwComposite 4.6) | WPEWebProcess 138.0, AxioWebKitHost 19.9, Web Content 5.5, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **46.3** (DOM Worker 9.0, main 7.6, Renderer 7.0, SamplerThread 6.3, SwComposite 5.0) | WPEWebProcess 136.0, AxioWebKitHost 19.9, Web Content 5.7, Privileged Cont 1.3 | — | — |
| profile | scroll | 53.3 | 35.7 | **73.5** (main 22.8, DOM Worker 15.5, Backgro~Pool # 10.7, Renderer 6.8, SamplerThread 6.3) | WPEWebProcess 149.2, AxioWebKitHost 25.7, Web Content 5.3, WebExtensions 1.5 | — | — |
| profile | key | — | — | **36.9** (main 12.9, DOM Worker 8.0, SamplerThread 6.9, Renderer 3.3, SwComposite 2.2) | WPEWebProcess 14.8, Web Content 6.0, AxioWebKitHost 2.5, WebExtensions 1.4 | 29.3 | — |
| profile | switch-to-gecko | — | — | **59.1** (main 25.4, Renderer 12.7, glean.dispatche 4.2, Socket Thread 4.2, TaskCon~ller # 4.2) |  | — | 218.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.8 | 0.0 | 0 | 0.0 | — | — | 83.9 | 0.0 | — | 3.03 | 0.56 | — | — | — | — | — | 0.004 |
| trace | raf | 57.4 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.27 | 0.09 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.35 | 0.10 | — | — | — | — | — | 0.007 |
| trace | scroll | 55.1 | 0.0 | 0 | 0.0 | — | — | 12.4 | 0.0 | — | 0.99 | 0.10 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.07 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.5 | 0.0 | 0 | 0.0 | — | — | 72.1 | 0.0 | — | 3.54 | 0.97 | — | — | — | — | — | 0.007 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.32 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.40 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 52.0 | 0.0 | 0 | 0.0 | — | — | 12.4 | 0.0 | — | 1.19 | 0.14 | — | — | — | — | — | 0.011 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.09 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.666 | 4.245 | 0.0253 | 0.0403 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.205 | 0.376 | 0.0119 | 0.0218 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.253 | 0.440 | 0.0147 | 0.0255 |
| plain | scroll | memfd | native | 113 | 113 | 0.933 | 1.049 | 0.0515 | 0.0580 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.377 | 0.0000 | 0.0021 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 1 | 2.745 | 4.382 | 0.0188 | 0.0150 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 176 | 176 | 0.195 | 0.366 | 0.0112 | 0.0210 |
| trace | raf-nosampler | memfd | native | 176 | 176 | 0.255 | 0.432 | 0.0148 | 0.0251 |
| trace | scroll | memfd | native | 113 | 112 | 0.882 | 1.044 | 0.0486 | 0.0570 |
| trace | key | memfd | native | 20 | 20 | 0.004 | 0.309 | 0.0000 | 0.0017 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.310 | 4.941 | 0.0248 | 0.0371 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.215 | 0.428 | 0.0125 | 0.0249 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.265 | 0.481 | 0.0154 | 0.0280 |
| profile | scroll | memfd | native | 108 | 108 | 1.071 | 1.253 | 0.0557 | 0.0651 |
| profile | key | memfd | native | 20 | 20 | 0.004 | 0.310 | 0.0000 | 0.0017 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 21.8 | 0.0 | — | 0.07 | 0.28 | — | — | 9.8 | 22.6 | 32.2 |
| profile | 0.6 | 26.5 | 0.0 | — | 0.09 | 0.41 | — | — | 12.5 | 27.7 | 37.4 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 24.0; first stdout read resolved 40.7; first frame applied (native receiver) 277.4; write frame_ack 278.4; write visibility 281.7; write focus 281.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 13.2; first stdout read resolved 19.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 14.0; first stdout read resolved 16.9; first frame applied (native receiver) 233.9; write frame_ack 235.7; write visibility 246.8; write focus 247.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.7; first stdout read resolved 31.4

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 35, DOM Worker 16, BgPool 15, Renderer 11, SwComposite 2, Compositor 2, IPC I/O 2, WRSceneBuilder 2, WRRenderBackend 2, Socket 0, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 35 ms (13.3% of span): JavaScript 16, Idle 7, Layout 4, Profiler 3, Other 2, Graphics 2
  - JS leaf 1 / native under JS 19 / native 15; buckets: ipc 35, gc_cc 16, array_buffer_copy 11, engine_stream_read 10, poll_wait 9, paint_layout 8, harness_diagnostics 6, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `XPCWrappedNative::InitTearOff(JSContext*, XPCWrappedNativeTe` 7; `JSStructuredCloneWriter::startObject(JS::Handle<JSObject*>, ` 2; `mozilla::baseprofiler::profiler_current_thread_id() [axiosoz` 2; `nsIFrame::ComputeAutoSize(mozilla::SizeComputationInput cons` 2; `js::BaseScript::enclosingScope() const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ARGBSetRow_X86 [libxul.so]` 4, `__memset_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15, poll_wait 15, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 15; `bool mozilla::dom::binding_detail::GenericMethod<m` 0; `__memset_avx512_unaligned_erms [libc.so.6]` 0
- **tab:9523** CPU ms by thread group: main 40, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (31.9% of span): Other 28, JavaScript 7, DOM 4, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 35; buckets: ipc 32, array_buffer_copy 13, gc_cc 10, subprocess_pipe_io 3, memcpy_memset 2, image_container 1, poll_wait 1
  - top self: `[libfontconfig.so.1]` 4; `[]` 3; `__strlen_evex [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9520** CPU ms by thread group: main 24, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 24 ms (28.9% of span): Other 20, DOM 2, JavaScript 1, Idle 1
  - JS leaf 0 / native under JS 3 / native 22; buckets: ipc 20, array_buffer_copy 9, gc_cc 5, subprocess_pipe_io 2, poll_wait 1, image_container 1
  - top self: `gfxSparseBitSet::SetRange(unsigned int, unsigned int) [libxu` 5; `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 1; `u_UCharsToChars_78 [libxul.so]` 1; `uprv_getDefaultLocaleID_78 [libxul.so]` 1; `js::NewDenseUnallocatedArray(JSContext*, unsigned int, js::N` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9377** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.4% of span): Idle 1, Other 1, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, gc_cc 1, poll_wait 0, paint_layout 0
  - top self: `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint` 1; `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `nsPIDOMWindowInner::GetWindowContext() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 209, DOM Worker 70, other 14, Socket 1, IPC I/O 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 209 ms (10.2% of span): Idle 115, GC / CC 60, JavaScript 18, Other 7, Profiler 5, DOM 3
  - JS leaf 2 / native under JS 19 / native 188; buckets: ipc 209, poll_wait 120, gc_cc 68, harness_diagnostics 20, array_buffer_copy 5, engine_stream_read 4, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 118; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 17; `mprotect [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3
  - GC/CC markers: GCMajor 2× 852 ms, GCSlice 14× 51 ms, CCSlice 5× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 71 ms: buckets subprocess_pipe_io 71, js_ctypes 71, worker_messaging 71, ipc 71, poll_wait 71; top self: `__syscall_cancel_arch [libc.so.6]` 71
- **tab:9377** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9005** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 358, DOM Worker 209, Renderer 203, SwComposite 137, BgPool 116, WRRenderBackend 44, Compositor 32, other 24, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 358 ms (11.6% of span): Idle 251, JavaScript 56, Other 32, DOM 14, Profiler 4, GC / CC 1
  - JS leaf 7 / native under JS 60 / native 291; buckets: ipc 355, poll_wait 269, gc_cc 53, engine_stream_read 38, harness_diagnostics 22, worker_messaging 21, array_buffer_copy 20, subprocess_pipe_io 12
  - top self: `__syscall_cancel_arch [libc.so.6]` 266; `[unknown]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 3; `[linux-vdso.so.1]` 3; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 203 ms (top self: `__syscall_cancel_arch [libc.so.6]` 118, `__memmove_avx512_unaligned_erms [libc.so.6]` 55, `syscall [libc.so.6]` 19); SwComposite 137 ms (top self: `syscall [libc.so.6]` 115, `__memmove_avx512_unaligned_erms [libc.so.6]` 19, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 4, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 116 ms (top self: `__syscall_cancel_arch [libc.so.6]` 84, `__memmove_avx512_unaligned_erms [libc.so.6]` 30, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `[axiosozo-dev]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 206 ms: buckets subprocess_pipe_io 206, worker_messaging 206, ipc 206, js_ctypes 192, poll_wait 188, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 189; `[axiosozo-dev]` 2; `[unknown]` 1; `RefPtr<mozilla::dom::XRSession>* nsTArray_Impl<Ref` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:9377** CPU ms by thread group: main 2, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 1, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, gc_cc 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `void mozilla::CycleCollectedJSRuntime::TraverseJSHolders<moz` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::gcstats::Statistics::renderJsonSlice(unsigned long) cons` 0
  - GC/CC markers: GCMajor 1× 35 ms, CCSlice 1× 2 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9005** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 223, DOM Worker 213, Renderer 193, SwComposite 138, BgPool 130, WRRenderBackend 42, Compositor 32, ImageBridge 13, WRSceneBuilder 6, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 223 ms (7.4% of span): Idle 109, JavaScript 51, GC / CC 36, Other 16, DOM 8, Profiler 3
  - JS leaf 3 / native under JS 53 / native 168; buckets: ipc 222, poll_wait 117, gc_cc 91, engine_stream_read 44, worker_messaging 34, array_buffer_copy 20, subprocess_pipe_io 13, native_receiver 10
  - top self: `__syscall_cancel_arch [libc.so.6]` 120; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `JSObject::traceChildren(JSTracer*) [libxul.so]` 8; `[unknown]` 6; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 16× 45 ms, CCSlice 1× 10 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 193 ms (top self: `__syscall_cancel_arch [libc.so.6]` 109, `__memmove_avx512_unaligned_erms [libc.so.6]` 58, `syscall [libc.so.6]` 16); SwComposite 138 ms (top self: `syscall [libc.so.6]` 108, `__memmove_avx512_unaligned_erms [libc.so.6]` 26, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 130 ms (top self: `__syscall_cancel_arch [libc.so.6]` 86, `__memmove_avx512_unaligned_erms [libc.so.6]` 40, `mozilla::layers::ImageContainer::SetCurrentImages(` 1); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `mozilla::layers::TextureClient::TextureClientRecyc` 0, `std::_Rb_tree_rebalance_for_erase(std::_Rb_tree_no` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 213 ms: buckets subprocess_pipe_io 213, worker_messaging 213, ipc 213, js_ctypes 197, poll_wait 192, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 193; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[unknown]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[axiosozo-dev]` 1
- **tab:9383** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9005** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `XRE_GetAsyncIOEventTarget() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 439, DOM Worker 277, BgPool 214, Renderer 121, SwComposite 67, WRRenderBackend 29, Compositor 20, other 16, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 439 ms (21.2% of span): Idle 264, JavaScript 74, Other 55, DOM 24, Graphics 8, GC / CC 6
  - JS leaf 8 / native under JS 89 / native 342; buckets: ipc 435, poll_wait 311, gc_cc 82, engine_stream_read 50, worker_messaging 43, harness_diagnostics 32, paint_layout 30, array_buffer_copy 25
  - top self: `__syscall_cancel_arch [libc.so.6]` 292; `[unknown]` 8; `[axiosozo-dev]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[linux-vdso.so.1]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 4
  - GC/CC markers: GCSlice 4× 6 ms, GCMinor 2× 6 ms
  - WebRender/compositor threads: Renderer 121 ms (top self: `__syscall_cancel_arch [libc.so.6]` 78, `__memmove_avx512_unaligned_erms [libc.so.6]` 26, `syscall [libc.so.6]` 11); SwComposite 67 ms (top self: `syscall [libc.so.6]` 61, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 29 ms (top self: `syscall [libc.so.6]` 22, `sched_yield [libc.so.6]` 7, `webrender::render_backend::Document::updated_pipel` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 214 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 108, `__syscall_cancel_arch [libc.so.6]` 97, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 277 ms: buckets subprocess_pipe_io 277, worker_messaging 276, ipc 276, js_ctypes 189, poll_wait 182, gc_cc 62; top self: `__syscall_cancel_arch [libc.so.6]` 184; `madvise [libc.so.6]` 9; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `[axiosozo-dev]` 5
- **tab:9005** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) [libxul.so` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9383** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9024** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageBridge 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 438, DOM Worker 182, Renderer 108, SwComposite 79, other 26, WRRenderBackend 18, Compositor 16, WRSceneBuilder 9, WRWorker 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 0, ImageIO 0, Canvas 0
  - main thread 438 ms (12.0% of span): Idle 227, JavaScript 77, Other 38, Graphics 35, Layout 31, DOM 22
  - JS leaf 10 / native under JS 117 / native 311; buckets: ipc 437, poll_wait 260, gc_cc 79, paint_layout 67, worker_messaging 66, engine_stream_read 58, harness_diagnostics 20, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 235; `[unknown]` 16; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `[axiosozo-dev]` 7; `mozilla::dom::LCPHelpers::FinalizeLCPEntryForImage(mozilla::` 6; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGene` 3
  - GC/CC markers: GCMinor 1× 3 ms, GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 108 ms (top self: `__syscall_cancel_arch [libc.so.6]` 29, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 13); SwComposite 79 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 41, `syscall [libc.so.6]` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::ipc::NodeController::GetMessage(mojo::cor` 0); BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 182 ms: buckets subprocess_pipe_io 182, worker_messaging 182, ipc 182, js_ctypes 169, poll_wait 167, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 168; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `[unknown]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:9024** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageBridge 0, ImageIO 0
  - main thread 8 ms (0.2% of span): GC / CC 6, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 7, gc_cc 6, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 2; `__syscall_cancel_arch [libc.so.6]` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `getrusage [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8924** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 1; `IPC::Message::~Message() [libxul.so]` 0; `[unknown]` 0; `mozilla::dom::ReceiveMessageArgument::ToObjectInternal(JSCon` 0; `mozilla::dom::(anonymous namespace)::StructuredCloneCallback` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8983** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 3, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 1; `NoteWeakMapsTracer::trace(JSObject*, JS::GCCellPtr, JS::GCCe` 1; `nsJSContext::MaybePokeCC() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 84, Renderer 33, DOM Worker 11, Compositor 5, BgPool 4, SwComposite 4, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 84 ms (30.3% of span): JavaScript 32, GC / CC 23, Layout 9, Idle 6, Graphics 6, DOM 4
  - JS leaf 5 / native under JS 36 / native 43; buckets: ipc 84, gc_cc 40, array_buffer_copy 16, paint_layout 16, harness_diagnostics 12, poll_wait 8, engine_stream_read 7, worker_messaging 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `mprotect [libc.so.6]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `[unknown]` 3; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [` 2; `_send (resource://gre/modules/ConduitsParent.sys.mjs:317:8)[` 2
  - GC/CC markers: GCSlice 6× 15 ms, CCSlice 1× 7 ms
  - WebRender/compositor threads: Renderer 33 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3); SwComposite 4 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `webrender::command_buffer::CommandBuffer::add_cmd ` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `getdents64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 9, js_ctypes 9; top self: `__syscall_cancel_arch [libc.so.6]` 9; `JSScript::createJitScript(JSContext*) [libxul.so]` 1; `_ZN12PLDHashTable15WithEntryHandleIZN12nsTHashtabl` 0
- **tab:9377** CPU ms by thread group: main 22, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 22 ms (7.9% of span): Other 8, JavaScript 5, Idle 4, Layout 2, DOM 1, Graphics 1
  - JS leaf 0 / native under JS 6 / native 16; buckets: ipc 21, poll_wait 4, gc_cc 4, subprocess_pipe_io 3, paint_layout 3, canvas_2d 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__memcmp_evex_movbe [libc.so.6]` 1; `nsTSubstring<char>::~nsTSubstring() [libxul.so]` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1; `[]` 1; `mozilla::detail::HashTable<void* const, mozilla::HashSet<voi` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8924** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.6% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::Assembler::finish() [libxul.so]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::V` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9520** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

