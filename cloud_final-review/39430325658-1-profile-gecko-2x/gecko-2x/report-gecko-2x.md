# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.1 | **8.7** (main 2.4, Renderer 1.9, DOM Worker 1.4, IPDL Background 1.0, TaskCon~ller # 0.5) | Web Content 3.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **33.8** (Renderer 19.9, SwComposite 2.9, WRRende~ckend# 2.6, glean.dispatche 2.0, main 1.6) | Isolated Web Co 4.2, WebExtensions 0.7, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **22.2** (Renderer 11.9, SwComposite 2.0, glean.dispatche 1.7, WRRende~ckend# 1.7, WRScene~ilder# 1.3) | Isolated Web Co 4.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **85.8** (Renderer 66.1, SwComposite 6.4, main 4.9, WRRende~ckend# 3.9, Compositor 2.0) | Isolated Web Co 4.4, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **9.0** (main 4.3, Renderer 1.1, TaskCon~ller # 0.5, WRScene~ilder# 0.5, Compositor 0.5) | Isolated Web Co 1.9 | 9.0 | — |
| trace | idle | 59.5 | 17.1 | **5.4** (main 1.9, TaskCon~ller # 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Renderer 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **19.9** (Renderer 8.1, glean.dispatche 2.0, WRRende~ckend# 2.0, SwComposite 2.0, main 1.6) | Isolated Web Co 4.5 | — | — |
| trace | raf-nosampler | — | — | **20.3** (Renderer 10.6, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, SwComposite 1.7) | Isolated Web Co 5.0 | — | — |
| trace | scroll | 59.0 | 17.3 | **88.2** (Renderer 65.5, main 6.4, SwComposite 6.4, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| trace | key | — | — | **62.2** (main 18.4, DOM Worker 16.2, Indexed~ IO # 10.6, IPDL Background 6.9, TaskCon~ller # 2.4) | Isolated Web Co 1.9, WebExtensions 0.3, RDD Process 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **9.1** (SamplerThread 4.3, main 2.4, TaskCon~ller # 1.9, DOM Worker 0.5) | Web Content 8.7, Isolated Web Co 4.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.1 | **31.1** (Renderer 9.4, SamplerThread 6.5, SwComposite 2.6, WRRende~ckend# 2.3, main 1.9) | Isolated Web Co 9.7, Web Content 8.1, Privileged Cont 2.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **32.1** (Renderer 13.2, SamplerThread 6.6, SwComposite 2.6, WRRende~ckend# 2.3, glean.dispatche 2.0) | Isolated Web Co 9.7, Web Content 8.3, Privileged Cont 2.0, WebExtensions 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **111.5** (Renderer 73.9, SamplerThread 10.2, SwComposite 8.3, main 6.8, WRRende~ckend# 4.9) | Web Content 10.2, Isolated Web Co 9.7, Privileged Cont 2.4, WebExtensions 1.9 | — | — |
| profile | key | — | — | **14.9** (main 5.6, SamplerThread 4.5, Renderer 1.3, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 8.3, Isolated Web Co 4.5, WebExtensions 1.9, Socket Process 1.6 | 10.0 | — |

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

- **parent** CPU ms by thread group: main 52, DOM Worker 2, IPC I/O 1, Compositor 1, SwComposite 1, Socket 1, other 1, WRRenderBackend 0, WRSceneBuilder 0, Renderer 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (2.5% of span): GC / CC 29, Other 8, Idle 7, JavaScript 6, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 7 / native 44; buckets: ipc 51, gc_cc 34, poll_wait 14, harness_diagnostics 5, memcpy_memset 2, array_buffer_copy 1, paint_layout 0, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `read [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `nsINode::GetExistingListenerManager() const [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 0; top self: `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 26, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (1.2% of span): Idle 16, GC / CC 6, JavaScript 3, Other 1, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 22; buckets: ipc 25, poll_wait 16, gc_cc 8, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onObjectEdge(JSObjec` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3133** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `mozilla::TaskController::MaybeDispatchOneThreadableTask(mozi` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3289** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 276, SwComposite 72, WRRenderBackend 67, main 61, WRSceneBuilder 55, Compositor 45, IPC I/O 11, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 61 ms (2.0% of span): GC / CC 28, Idle 24, JavaScript 6, Other 2, Layout 2, Profiler 0
  - JS leaf 0 / native under JS 6 / native 56; buckets: ipc 61, gc_cc 31, poll_wait 27, harness_diagnostics 5, paint_layout 2, array_buffer_copy 2, memcpy_memset 1, json_metadata 1
  - top self: `poll [libc.so.6]` 24; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `syscall [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 276 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 89, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 69, `int blendTextureNearestFast<true, glsl::sampler2D_` 14); SwComposite 72 ms (top self: `syscall [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeJ` 0); WRRenderBackend#0 67 ms (top self: `syscall [libc.so.6]` 57, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, memcpy_memset 2, gc_cc 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `munmap [libc.so.6]` 1
- **tab:3285** CPU ms by thread group: main 165, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 165 ms (5.3% of span): Idle 104, Graphics 25, Layout 16, Other 8, Profiler 7, JavaScript 3
  - JS leaf 0 / native under JS 7 / native 157; buckets: ipc 158, poll_wait 105, paint_layout 48, harness_diagnostics 3, gc_cc 3, array_buffer_copy 2, canvas_2d 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 103; `sendmsg [libc.so.6]` 3; `[]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `[linux-vdso.so.1]` 2; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(un` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3374** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 373, WRRenderBackend 63, SwComposite 60, WRSceneBuilder 53, Compositor 45, main 14, IPC I/O 10, other 2, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 14 ms (0.5% of span): Idle 10, JavaScript 2, Other 1, Graphics 0
  - JS leaf 1 / native under JS 2 / native 11; buckets: ipc 14, poll_wait 10, harness_diagnostics 2, array_buffer_copy 2, gc_cc 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 10; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 1; `write [libc.so.6]` 1; `sandbox.create (chrome://remote/content/marionette/evaluate.` 1; `[unknown]` 1; `std::pair<std::__detail::_Node_iterator<mozilla::DisplayItem` 0
  - WebRender/compositor threads: Renderer 373 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 103, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 43); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 60 ms (top self: `syscall [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `[libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 156, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 156 ms (5.1% of span): Idle 107, Graphics 24, Layout 15, Profiler 5, Other 5, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 151; buckets: ipc 150, poll_wait 109, paint_layout 43, canvas_2d 2, gc_cc 1, memcpy_memset 1, subprocess_pipe_io 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 108; `[]` 4; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 1; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul` 1; `read [libc.so.6]` 1; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3374** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1471, main 140, SwComposite 138, WRRenderBackend 95, Compositor 32, WRSceneBuilder 24, IPC I/O 9, other 1, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 140 ms (6.7% of span): Idle 71, GC / CC 29, Other 12, Graphics 9, DOM 8, Layout 5
  - JS leaf 0 / native under JS 10 / native 130; buckets: ipc 140, poll_wait 96, gc_cc 33, paint_layout 14, harness_diagnostics 6, array_buffer_copy 4, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 72; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2
  - GC/CC markers: GCSlice 6× 20 ms, CCSlice 1× 6 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1471 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 461, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 314, `hypotf@@GLIBC_2.35 [libm.so.6]` 105); SwComposite 138 ms (top self: `syscall [libc.so.6]` 127, `__memmove_avx_unaligned_erms [libc.so.6]` 11, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 95 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 5, `core::hash::BuildHasher::hash_one [libxul.so]` 3)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `mozilla::PrintfTarget::vprint(char const*, __va_li` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 107, IPC I/O 15, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 107 ms (5.1% of span): Idle 69, Graphics 14, GC / CC 9, Other 7, JavaScript 5, Layout 1
  - JS leaf 0 / native under JS 5 / native 102; buckets: ipc 104, poll_wait 70, paint_layout 18, gc_cc 12, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 68; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `sendmsg [libc.so.6]` 2; `ScanBlackVisitor::VisitNode(PtrInfo*) [libxul.so]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 18 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3374** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 203, Renderer 46, WRRenderBackend 18, Compositor 17, WRSceneBuilder 14, SwComposite 13, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 203 ms (5.4% of span): Idle 46, Layout 42, JavaScript 33, GC / CC 31, Graphics 22, Other 20
  - JS leaf 3 / native under JS 34 / native 165; buckets: ipc 203, poll_wait 67, paint_layout 63, gc_cc 46, subprocess_pipe_io 8, harness_diagnostics 5, array_buffer_copy 5, memcpy_memset 4
  - top self: `poll [libc.so.6]` 48; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `[axiosozo-dev]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `mozilla::detail::ConditionVariableImpl::wait_for(mozilla::de` 2
  - GC/CC markers: GCMajor 1× 83 ms, GCSlice 10× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 46 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 64, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 64 ms (1.7% of span): Idle 20, Other 14, Layout 9, JavaScript 8, GC / CC 7, Graphics 4
  - JS leaf 1 / native under JS 7 / native 57; buckets: ipc 58, poll_wait 21, paint_layout 15, gc_cc 13, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 1
  - top self: `poll [libc.so.6]` 20; `[]` 3; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 2; `sendmsg [libc.so.6]` 2; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 1; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) ` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3133** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 5; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0; `read [libc.so.6]` 0; `mozilla::ipc::MessageChannel::DispatchAsyncMessage(mozilla::` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

