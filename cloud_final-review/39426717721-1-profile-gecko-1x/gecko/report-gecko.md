# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.4 | **5.9** (main 3.4, IPC I/O Parent 0.5, Renderer 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Web Content 3.4, Isolated Web Co 1.4 | — | — |
| plain | raf | 59.0 | 17.3 | **35.6** (Renderer 18.1, main 3.5, WRRende~ckend# 3.2, TaskCon~ller # 2.3, glean.dispatche 1.9) | Isolated Web Co 7.4, WebExtensions 0.6, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **24.1** (Renderer 11.3, WRRende~ckend# 3.0, main 2.0, WRScene~ilder# 2.0, glean.dispatche 1.3) | Isolated Web Co 7.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **50.2** (Renderer 31.1, main 6.8, WRRende~ckend# 4.4, SwComposite 2.9, glean.dispatche 1.5) | Isolated Web Co 6.3 | — | — |
| plain | key | — | — | **10.4** (main 5.3, TaskCon~ller # 1.1, Renderer 1.1, glean.dispatche 0.5, WRScene~ilder# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3, Web Content 0.3 | 10.0 | — |
| trace | idle | 59.1 | 17.3 | **6.8** (main 2.9, TaskCon~ller # 1.9, IPDL Background 0.5, Softwar~cThread 0.5, Renderer 0.5) | Isolated Web Co 2.4 | — | — |
| trace | raf | 59.0 | 17.3 | **25.7** (Renderer 10.7, WRRende~ckend# 3.2, main 2.9, glean.dispatche 1.6, TaskCon~ller # 1.6) | Isolated Web Co 6.8 | — | — |
| trace | raf-nosampler | — | — | **21.2** (Renderer 11.6, WRRende~ckend# 3.0, WRScene~ilder# 2.0, glean.dispatche 1.7, Compositor 1.3) | Isolated Web Co 7.0 | — | — |
| trace | scroll | 59.0 | 17.3 | **95.3** (Renderer 34.0, main 19.9, IndexedDB IO # 9.7, DOM Worker 8.8, WRRende~ckend# 4.9) | Isolated Web Co 6.3 | — | — |
| trace | key | — | — | **38.6** (main 15.4, DOM Worker 10.4, IPDL Background 3.7, TaskCon~ller # 2.1, StreamTrans # 1.9) | Isolated Web Co 1.6, WebExtensions 0.3, RDD Process 0.3 | 11.5 | — |
| profile | idle | 59.5 | 17.2 | **9.7** (SamplerThread 3.4, main 2.9, TaskCon~ller # 2.4, IPDL Background 0.5, Softwar~cThread 0.5) | Web Content 5.3, Isolated Web Co 5.3, WebExtensions 1.4, Privileged Cont 1.4 | — | — |
| profile | raf | 59.0 | 17.2 | **39.0** (Renderer 13.9, SamplerThread 6.8, WRRende~ckend# 3.9, main 2.9, WRScene~ilder# 2.6) | Isolated Web Co 14.8, Web Content 6.1, WebExtensions 1.6, Socket Process 1.3 | — | — |
| profile | raf-nosampler | — | — | **37.8** (Renderer 14.6, SamplerThread 7.0, WRRende~ckend# 4.0, main 2.3, WRScene~ilder# 2.3) | Isolated Web Co 14.0, Web Content 6.0, WebExtensions 1.7, Privileged Cont 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **68.9** (Renderer 35.6, SamplerThread 8.8, main 8.3, WRRende~ckend# 5.4, SwComposite 3.9) | Isolated Web Co 11.7, Web Content 6.3, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **18.7** (main 7.1, SamplerThread 5.0, Renderer 1.3, TaskCon~ller # 0.8, WRRende~ckend# 0.8) | Web Content 6.3, Isolated Web Co 4.8, WebExtensions 2.6, Privileged Cont 1.9 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 73, Compositor 2, IPC I/O 1, Socket 1, other 1, Renderer 1, WRSceneBuilder 0, SwComposite 0, WRRenderBackend 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0, BgPool 0
  - main thread 73 ms (3.5% of span): GC / CC 48, Other 8, Idle 8, JavaScript 7, DOM 2, Graphics 1
  - JS leaf 0 / native under JS 8 / native 65; buckets: ipc 73, gc_cc 53, poll_wait 11, harness_diagnostics 6, memcpy_memset 2, array_buffer_copy 2, json_metadata 1, paint_layout 1
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 15; `poll [libc.so.6]` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCSlice 11× 43 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1); SwComposite 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3112** CPU ms by thread group: main 50, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (2.4% of span): Idle 34, GC / CC 9, JavaScript 2, DOM 2, Profiler 2, Layout 1
  - JS leaf 0 / native under JS 5 / native 45; buckets: ipc 50, poll_wait 34, gc_cc 11, paint_layout 4, harness_diagnostics 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 34; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1
  - GC/CC markers: GCMajor 1× 27 ms, GCSlice 4× 6 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2940** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3115** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 419, WRRenderBackend 113, main 88, WRSceneBuilder 78, Compositor 61, SwComposite 36, IPC I/O 14, DOM Worker 2, other 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 88 ms (2.8% of span): GC / CC 42, Idle 33, JavaScript 4, Other 4, Layout 3, DOM 2
  - JS leaf 0 / native under JS 6 / native 82; buckets: ipc 88, gc_cc 47, poll_wait 36, harness_diagnostics 5, paint_layout 3, array_buffer_copy 3, subprocess_pipe_io 3, memcpy_memset 0
  - top self: `poll [libc.so.6]` 33; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 15; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 1× 85 ms, GCSlice 6× 36 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 419 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 79, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 67); WRRenderBackend#0 113 ms (top self: `syscall [libc.so.6]` 83, `sched_yield [libc.so.6]` 3, `webrender::picture::PictureInstance::take_context ` 2); WRSceneBuilder#0 72 ms (top self: `syscall [libc.so.6]` 56, `sched_yield [libc.so.6]` 5, `[axiosozo-dev]` 2)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 2, poll_wait 1; top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 1; `js::AtomsTable::sweepIncrementally(mozilla::detail` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3112** CPU ms by thread group: main 296, IPC I/O 23, other 7, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 296 ms (9.5% of span): Idle 106, Layout 70, Graphics 60, Other 26, Profiler 15, GC / CC 9
  - JS leaf 0 / native under JS 24 / native 272; buckets: ipc 273, paint_layout 154, poll_wait 106, gc_cc 15, memcpy_memset 7, canvas_2d 7, subprocess_pipe_io 7, harness_diagnostics 3
  - top self: `poll [libc.so.6]` 104; `[]` 13; `sendmsg [libc.so.6]` 7; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `[linux-vdso.so.1]` 3; `__lll_lock_wait [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3115** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3187** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 414, WRRenderBackend 106, WRSceneBuilder 75, main 66, Compositor 59, SwComposite 23, IPC I/O 13, other 2, DOM Worker 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 66 ms (2.2% of span): GC / CC 42, Idle 19, JavaScript 3, Graphics 1, Other 1, DOM 0
  - JS leaf 0 / native under JS 4 / native 62; buckets: ipc 66, gc_cc 44, poll_wait 21, harness_diagnostics 4, array_buffer_copy 1, paint_layout 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 85 ms, GCSlice 6× 36 ms, CCSlice 1× 8 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 414 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 89, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 79, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 49); WRRenderBackend#0 106 ms (top self: `syscall [libc.so.6]` 81, `[axiosozo-dev]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 2); WRSceneBuilder#0 68 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1; top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3112** CPU ms by thread group: main 267, IPC I/O 23, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 267 ms (8.8% of span): Idle 101, Layout 58, Graphics 52, Other 22, Profiler 20, DOM 8
  - JS leaf 0 / native under JS 18 / native 249; buckets: ipc 244, paint_layout 138, poll_wait 102, canvas_2d 9, gc_cc 7, subprocess_pipe_io 5, memcpy_memset 4, webrender_render 1
  - top self: `poll [libc.so.6]` 101; `[]` 12; `sendmsg [libc.so.6]` 8; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2
  - GC/CC markers: GCMajor 1× 26 ms, GCSlice 4× 4 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3017** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3043** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 712, main 149, WRRenderBackend 103, SwComposite 68, Compositor 37, WRSceneBuilder 29, IPC I/O 10, other 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0, BgPool 0
  - main thread 149 ms (7.2% of span): Idle 83, Other 24, Graphics 22, Layout 9, JavaScript 5, DOM 3
  - JS leaf 1 / native under JS 5 / native 143; buckets: ipc 149, poll_wait 134, paint_layout 34, harness_diagnostics 5, array_buffer_copy 4, gc_cc 2, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 85; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 8; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 3; `__strnlen_evex [libc.so.6]` 2; `[libgtk-3.so.0]` 2; `sendmsg [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 712 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 207, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 128, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63); WRRenderBackend#0 103 ms (top self: `syscall [libc.so.6]` 55, `webrender::prepare::prepare_prim_for_render [libxu` 2, `webrender::batch::AlphaBatchBuilder::build [libxul` 2); SwComposite 68 ms (top self: `syscall [libc.so.6]` 58, `__memmove_avx512_unaligned_erms [libc.so.6]` 10)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3112** CPU ms by thread group: main 134, IPC I/O 19, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 134 ms (6.5% of span): Idle 77, Graphics 26, Other 12, JavaScript 7, Layout 6, Profiler 5
  - JS leaf 1 / native under JS 6 / native 127; buckets: ipc 126, poll_wait 79, paint_layout 39, harness_diagnostics 3, gc_cc 3, memcpy_memset 2, canvas_2d 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 76; `[]` 6; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3182** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3187** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 261, Renderer 42, WRRenderBackend 29, Compositor 24, WRSceneBuilder 19, IPC I/O 10, SwComposite 6, other 3, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0, BgPool 0
  - main thread 261 ms (6.9% of span): Layout 48, Idle 46, Other 45, GC / CC 40, Graphics 36, JavaScript 26
  - JS leaf 5 / native under JS 30 / native 225; buckets: ipc 261, paint_layout 89, poll_wait 88, gc_cc 60, harness_diagnostics 4, array_buffer_copy 4, subprocess_pipe_io 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `recvmsg [libc.so.6]` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 7; `[unknown]` 6; `[axiosozo-dev]` 5
  - GC/CC markers: GCMajor 1× 82 ms, GCSlice 6× 32 ms, CCSlice 1× 9 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 29 ms (top self: `syscall [libc.so.6]` 18, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1); WRSceneBuilder#0 18 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 2, `webrender::scene_builder_thread::SceneBuilderThrea` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3112** CPU ms by thread group: main 92, IPC I/O 9, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 92 ms (2.4% of span): Idle 30, GC / CC 15, Other 14, JavaScript 11, Layout 11, Graphics 5
  - JS leaf 0 / native under JS 12 / native 81; buckets: ipc 87, poll_wait 30, paint_layout 24, gc_cc 20, harness_diagnostics 5, array_buffer_copy 4, canvas_2d 2, memcpy_memset 2
  - top self: `poll [libc.so.6]` 30; `sendmsg [libc.so.6]` 5; `[]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `mozilla::BlockReflowState::ClearFloats(int, mozilla::UsedCle` 1; `[unknown]` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 6 ms, CCSlice 1× 5 ms, GCMinor 1× 2 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2940** CPU ms by thread group: main 9, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.2% of span): Idle 8, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 9, poll_wait 8, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `mozilla::dom::IsJSAPIActive() [libxul.so]` 0; `xpc::XrayTraits::getExpandoObject(JSContext*, JS::Handle<JSO` 0; `js::NewObjectWithGivenTaggedProto(JSContext*, JSClass const*` 0; `__lll_lock_wait [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3115** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

