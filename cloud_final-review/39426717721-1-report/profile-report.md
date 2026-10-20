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

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.1 | **8.8** (main 2.4, Renderer 2.4, DOM Worker 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **31.3** (Renderer 19.3, SwComposite 2.9, WRRende~ckend# 2.0, glean.dispatche 1.6, main 1.3) | Isolated Web Co 4.6, WebExtensions 0.6, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **23.4** (Renderer 11.9, glean.dispatche 2.0, WRRende~ckend# 2.0, SwComposite 2.0, main 1.7) | Isolated Web Co 4.3, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **86.6** (Renderer 65.4, SwComposite 5.9, main 4.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **8.9** (main 4.0, Renderer 1.3, TaskCon~ller # 0.8, WRRende~ckend# 0.8, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3 | 8.0 | — |
| trace | idle | 59.4 | 17.2 | **3.9** (main 1.9, TaskCon~ller # 1.0, glean.dispatche 0.5, Renderer 0.5) | Isolated Web Co 1.5, Web Content 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **19.6** (Renderer 7.8, WRRende~ckend# 2.0, SwComposite 2.0, main 1.6, glean.dispatche 1.6) | Isolated Web Co 4.6 | — | — |
| trace | raf-nosampler | — | — | **21.2** (Renderer 11.3, glean.dispatche 2.0, WRRende~ckend# 2.0, SwComposite 2.0, Compositor 1.7) | Isolated Web Co 5.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **89.2** (Renderer 66.0, main 5.9, SwComposite 5.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| trace | key | — | — | **52.9** (main 17.6, DOM Worker 16.8, IPDL Background 6.4, TaskCon~ller # 2.4, StreamTrans # 2.4) | Isolated Web Co 1.6, WebExtensions 0.3, Privileged Cont 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **8.7** (SamplerThread 3.9, main 2.4, TaskCon~ller # 1.9, DOM Worker 0.5) | Web Content 8.2, Isolated Web Co 3.4, Socket Process 1.4, RDD Process 1.4 | — | — |
| profile | raf | 59.0 | 17.1 | **30.9** (Renderer 9.7, SamplerThread 6.2, SwComposite 2.9, WRRende~ckend# 2.3, Compositor 2.3) | Isolated Web Co 10.3, Web Content 8.4, Socket Process 1.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **31.4** (Renderer 13.2, SamplerThread 6.3, WRRende~ckend# 2.3, SwComposite 2.3, Compositor 2.0) | Isolated Web Co 10.6, Web Content 9.6, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **112.3** (Renderer 75.3, SamplerThread 10.7, SwComposite 7.8, main 6.3, WRRende~ckend# 5.3) | Isolated Web Co 10.7, Web Content 9.7, WebExtensions 2.4, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **16.5** (main 6.1, SamplerThread 4.5, Renderer 1.6, TaskCon~ller # 0.8, Compositor 0.8) | Web Content 8.5, Isolated Web Co 4.3, WebExtensions 1.9, Socket Process 1.6 | 7.0 | — |

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

- **parent** CPU ms by thread group: main 51, Compositor 2, IPC I/O 1, DOM Worker 1, Renderer 1, SwComposite 1, Socket 1, other 1, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (2.4% of span): GC / CC 26, Idle 9, Other 9, JavaScript 6, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 6 / native 45; buckets: ipc 51, gc_cc 30, poll_wait 14, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 1, paint_layout 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `recvmsg [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 0); SwComposite 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `std::__detail::_Map_base<mozilla::layers::LayersId` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `[linux-vdso.so.1]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 26, IPC I/O 5, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (1.3% of span): Idle 16, GC / CC 5, JavaScript 2, Other 2, Profiler 1, Layout 0
  - JS leaf 0 / native under JS 2 / native 24; buckets: ipc 25, poll_wait 18, gc_cc 7, harness_diagnostics 2, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [li` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `XPCNativeInterface::NewInstance(JSContext*, IID2NativeInterf` 1; `CCGraphBuilder::DescribeRefCountedNode(unsigned long, char c` 1; `js::SharedImmutableStringsCache::getOrCreate(std::unique_ptr` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3181** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `<std::sys::sync::once::futex::Once>::call [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3395** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 283, SwComposite 76, WRRenderBackend 68, main 62, WRSceneBuilder 58, Compositor 46, IPC I/O 12, DOM Worker 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 62 ms (2.0% of span): GC / CC 27, Idle 26, JavaScript 6, Layout 2, Graphics 1, Other 0
  - JS leaf 1 / native under JS 5 / native 57; buckets: ipc 62, gc_cc 30, poll_wait 27, harness_diagnostics 4, array_buffer_copy 3, paint_layout 3, json_metadata 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 283 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 90, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `ps_quad_mask_FAST_PATH_frag::run(glsl::FragmentSha` 15); SwComposite 76 ms (top self: `syscall [libc.so.6]` 70, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeT` 0); WRRenderBackend#0 68 ms (top self: `syscall [libc.so.6]` 57, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 0
- **tab:3304** CPU ms by thread group: main 185, IPC I/O 17, other 3, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 185 ms (5.9% of span): Idle 111, Graphics 23, Layout 21, Other 9, Profiler 7, GC / CC 6
  - JS leaf 0 / native under JS 10 / native 175; buckets: ipc 176, poll_wait 111, paint_layout 59, gc_cc 9, memcpy_memset 3, harness_diagnostics 3, subprocess_pipe_io 2, canvas_2d 2
  - top self: `poll [libc.so.6]` 111; `sendmsg [libc.so.6]` 5; `[]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 13 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3395** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 380, WRRenderBackend 65, SwComposite 64, WRSceneBuilder 54, Compositor 47, main 16, IPC I/O 11, other 2, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 16 ms (0.5% of span): Idle 11, JavaScript 4, DOM 1, Graphics 0, Other 0
  - JS leaf 1 / native under JS 4 / native 12; buckets: ipc 16, poll_wait 12, harness_diagnostics 4, array_buffer_copy 4, paint_layout 0
  - top self: `poll [libc.so.6]` 11; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `nsTSubstring<char>::Append(char) [libxul.so]` 1; `js::NewPlainObjectWithProto(JSContext*, JS::Handle<JSObject*` 1; `deserializeJSON (chrome://remote/content/marionette/json.sys` 1; `__lll_lock_wake [libc.so.6]` 1
  - GC/CC markers: GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 380 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 100, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 53); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); SwComposite 64 ms (top self: `syscall [libc.so.6]` 57, `__memmove_avx_unaligned_erms [libc.so.6]` 7)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 166, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 166 ms (5.5% of span): Idle 108, Graphics 20, Layout 17, Other 12, Profiler 7, DOM 2
  - JS leaf 0 / native under JS 4 / native 163; buckets: ipc 160, poll_wait 111, paint_layout 45, memcpy_memset 4, subprocess_pipe_io 3, canvas_2d 3, gc_cc 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 109; `sendmsg [libc.so.6]` 3; `[]` 3; `write [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3395** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1505, SwComposite 138, main 133, WRRenderBackend 96, Compositor 34, WRSceneBuilder 24, IPC I/O 9, Socket 1, other 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 133 ms (6.4% of span): Idle 73, Other 18, Graphics 13, JavaScript 11, Layout 8, GC / CC 8
  - JS leaf 2 / native under JS 9 / native 122; buckets: ipc 133, poll_wait 103, paint_layout 21, gc_cc 13, harness_diagnostics 8, array_buffer_copy 4, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 74; `mozilla::layers::WebRenderCommandBuilder::CreateWebRenderCom` 3; `mozilla::dom::BrowserHost::QueryInterface(nsID const&, void*` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `recvmsg [libc.so.6]` 2; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 2
  - GC/CC markers: CCSlice 1× 4 ms, GCSlice 4× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1505 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 441, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 333, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 107); SwComposite 138 ms (top self: `syscall [libc.so.6]` 128, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 96 ms (top self: `syscall [libc.so.6]` 56, `webrender::batch::BatchBuilder::add_prim_to_batch:` 4, `webrender::prepare::prepare_prim_for_render [libxu` 4)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 111, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 111 ms (5.3% of span): Idle 74, Graphics 12, Other 9, GC / CC 6, JavaScript 5, Layout 4
  - JS leaf 0 / native under JS 5 / native 107; buckets: ipc 109, poll_wait 76, paint_layout 18, gc_cc 8, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 75; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `sendmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 19 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3181** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `TimerThread::RemoveTimerInternal(nsTimerImpl&) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 218, Renderer 52, WRRenderBackend 21, Compositor 20, SwComposite 16, WRSceneBuilder 15, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 218 ms (5.8% of span): Idle 44, Layout 44, GC / CC 31, Graphics 30, JavaScript 30, Other 28
  - JS leaf 3 / native under JS 36 / native 179; buckets: ipc 218, paint_layout 76, poll_wait 68, gc_cc 50, array_buffer_copy 8, harness_diagnostics 7, subprocess_pipe_io 5, memcpy_memset 4
  - top self: `poll [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 4; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, ` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 7× 26 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 52 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 18, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `[axiosozo-dev]` 1); SwComposite 16 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx_unaligned_erms [libc.so.6]` 3)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 69, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (1.8% of span): Idle 23, Other 10, JavaScript 8, GC / CC 8, Layout 6, DOM 6
  - JS leaf 0 / native under JS 10 / native 59; buckets: ipc 66, poll_wait 23, paint_layout 20, gc_cc 13, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 5; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2; `getcontext [libc.so.6]` 1; `[]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3130** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `mozilla::dom::Promise::MaybeResolve(JSContext*, JS::Handle<J` 0; `__strlen_avx2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimer::Cancel() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **7.5** (main 3.3, DOM Worker 1.5, TaskCon~ller # 1.2, Renderer 0.6, glean.dispatche 0.3) | AxioCEFProbe 4.2, cef:gpu-process 1.8, Web Content 1.5, cef:utility 1.2 | — | 3351.8 |
| plain | idle | — | — | **2.0** (main 1.0, Socket Thread 0.5, TaskCon~ller # 0.5) | Privileged Cont 1.0 | — | — |
| plain | raf | 60.0 | 20.9 | **11.1** (main 4.2, DOM Worker 1.6, Renderer 1.0, glean.dispatche 0.7, TaskCon~ller # 0.7) | cef:renderer 5.0, cef:gpu-process 2.9, AxioCEFProbe 2.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **9.4** (main 2.7, DOM Worker 1.7, Renderer 1.0, WRRende~ckend# 1.0, Backgro~Pool # 1.0) | cef:renderer 5.4, cef:gpu-process 3.6, AxioCEFProbe 2.7 | — | — |
| plain | scroll | 60.1 | 24.0 | **23.7** (main 11.8, DOM Worker 4.4, TaskCon~ller # 1.5, Backgro~Pool # 1.5, Renderer 1.0) | cef:gpu-process 13.8, cef:renderer 7.5, AxioCEFProbe 5.0 | — | — |
| plain | key | — | — | **9.6** (main 5.0, Renderer 1.1, DOM Worker 0.8, Timer 0.6, TaskCon~ller # 0.6) | cef:renderer 2.3, AxioCEFProbe 1.1, cef:gpu-process 0.3, WebExtensions 0.3 | 10.3 | — |
| plain | switch-to-gecko | — | — | **9.0** (DOM Worker 2.9, main 2.8, TaskCon~ller # 0.9, IPDL Background 0.8, Indexed~ IO # 0.7) | Privileged Cont 0.1 | — | 15015.1 |
| trace | switch-to-engine | — | — | **50.6** (main 20.2, Renderer 20.2, Socket Thread 3.4, WRRende~ckend# 3.4, DOM Worker 3.4) | AxioCEFProbe 50.6, cef:gpu-process 20.2, cef:renderer 13.5, cef:utility 13.4 | — | 267.1 |
| trace | idle | — | — | **3.9** (main 2.9, TaskCon~ller # 1.0) | AxioCEFProbe 2.0, Web Content 1.9, cef:utility 0.5 | — | — |
| trace | raf | 60.0 | 22.4 | **14.8** (main 6.2, Renderer 1.6, DOM Worker 1.6, WRRende~ckend# 1.3, glean.dispatche 0.7) | cef:renderer 7.2, cef:gpu-process 3.3, AxioCEFProbe 2.6 | — | — |
| trace | raf-nosampler | — | — | **14.0** (main 5.3, DOM Worker 2.0, Renderer 1.3, WRRende~ckend# 1.0, Compositor 1.0) | cef:renderer 8.0, cef:gpu-process 4.7, AxioCEFProbe 3.7 | — | — |
| trace | scroll | 60.0 | 22.1 | **24.4** (main 10.9, DOM Worker 4.5, Renderer 1.5, Backgro~Pool # 1.5, glean.dispatche 1.0) | cef:gpu-process 13.4, cef:renderer 7.5, AxioCEFProbe 5.0 | — | — |
| trace | key | — | — | **10.4** (main 6.4, TaskCon~ller # 1.1, DOM Worker 0.8, Renderer 0.6, glean.dispatche 0.3) | AxioCEFProbe 2.0, cef:renderer 1.7, cef:gpu-process 0.6, WebExtensions 0.3 | 10.7 | — |
| trace | switch-to-gecko | — | — | **34.0** (main 13.6, Renderer 6.8, DOM Worker 6.8, Backgro~Pool # 6.8) |  | — | 125.5 |
| profile | switch-to-engine | — | — | **92.4** (main 38.5, Renderer 15.4, DOM Worker 15.4, SamplerThread 15.4, glean.dispatche 7.7) | AxioCEFProbe 30.8, cef:renderer 15.4 | — | 105.2 |
| profile | idle | — | — | **10.1** (SamplerThread 3.8, DOM Worker 2.9, main 2.4, Timer 1.0) | Web Content 4.8, Isolated Web Co 2.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.9 | 20.8 | **27.8** (main 7.1, DOM Worker 6.2, SamplerThread 6.2, Renderer 1.6, Timer 1.3) | cef:renderer 8.1, Web Content 4.9, AxioCEFProbe 3.9, cef:gpu-process 3.2 | — | — |
| profile | raf-nosampler | — | — | **29.5** (DOM Worker 7.9, main 6.0, SamplerThread 6.0, Renderer 2.0, Socket Thread 1.7) | cef:renderer 7.5, Web Content 5.6, cef:gpu-process 4.7, AxioCEFProbe 2.9 | — | — |
| profile | scroll | 60.2 | 24.5 | **48.2** (main 18.1, DOM Worker 9.8, SamplerThread 6.9, TaskCon~ller # 2.9, Renderer 1.5) | cef:gpu-process 15.7, cef:renderer 8.3, AxioCEFProbe 4.9, Web Content 4.4 | — | — |
| profile | key | — | — | **25.0** (main 8.2, SamplerThread 5.8, DOM Worker 4.7, Timer 1.4, TaskCon~ller # 1.1) | Web Content 4.9, cef:renderer 2.2, AxioCEFProbe 1.4, WebExtensions 1.1 | 12.8 | — |
| profile | switch-to-gecko | — | — | **3.6** (SamplerThread 2.0, main 0.8, TaskCon~ller # 0.4, DOM Worker 0.3, BgIOThr~Pool # 0.1) | Web Content 5.7, Privileged Cont 1.1, Isolated Web Co 1.1, WebExtensions 1.0 | — | 15712.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.4 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 1.15 | 1.91 | — | — | — | — | — | 0.012 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.09 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | 0.12 | 0.07 | — | — | — | — | — | 0.005 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.0 | 0.0 | — | 0.23 | 0.08 | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 6.8 | 0.0 | 0 | 0.0 | — | — | 9.8 | 0.0 | — | 1.89 | 1.09 | — | — | — | — | — | 0.007 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.2 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.11 | 0.12 | — | — | — | — | — | 0.008 |
| profile | scroll | 59.4 | 0.0 | 0 | 0.0 | — | — | 8.7 | 0.0 | — | 0.15 | 0.11 | — | — | — | — | — | 0.007 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.0 | 0.0 | — | 0.28 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.714 | 1.298 | 0.0004 | 0.0008 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 185 | 185 | 0.021 | 0.045 | 0.0013 | 0.0027 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.032 | 0.057 | 0.0019 | 0.0034 |
| plain | scroll | memfd | native | 121 | 121 | 0.077 | 0.111 | 0.0045 | 0.0066 |
| plain | key | memfd | native | 21 | 21 | 0.009 | 0.049 | 0.0000 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.777 | 1.276 | 0.0050 | 0.0082 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 185 | 185 | 0.028 | 0.056 | 0.0017 | 0.0033 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.043 | 0.064 | 0.0026 | 0.0038 |
| trace | scroll | memfd | native | 120 | 120 | 0.072 | 0.108 | 0.0042 | 0.0064 |
| trace | key | memfd | native | 21 | 21 | 0.008 | 0.043 | 0.0000 | 0.0002 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 1.384 | 1.097 | 0.0095 | 0.0075 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.030 | 0.057 | 0.0018 | 0.0034 |
| profile | raf-nosampler | memfd | native | 180 | 180 | 0.043 | 0.072 | 0.0025 | 0.0043 |
| profile | scroll | memfd | native | 122 | 122 | 0.092 | 0.125 | 0.0055 | 0.0075 |
| profile | key | memfd | native | 21 | 21 | 0.009 | 0.046 | 0.0000 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 5.9 | 0.0 | — | 0.23 | 0.37 | — | — | 5.8 | 6.9 | 12.5 |
| profile | 0.6 | 7.8 | 0.0 | — | 0.29 | 0.55 | — | — | 6.3 | 9.2 | 15.7 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 153.6; write create 157.9; first frame applied (native receiver) 272.7; write frame_ack 276.4; write focus 282.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 16.1; first stdout read resolved 20.6; write shutdown 25.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 20.7; first stdout read resolved 27.9; first frame applied (native receiver) 110.7; write frame_ack 111.8; write focus 119.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 18.5; first stdout read resolved 24.2; write shutdown 28.2

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 44, Renderer 21, DOM Worker 7, WRRenderBackend 3, BgPool 2, WRSceneBuilder 2, Compositor 2, SwComposite 1, WRWorker 1, Socket 0, IPC I/O 0, ImageBridge 0, other 0, ImageIO 0
  - main thread 44 ms (31.2% of span): JavaScript 12, Layout 9, Idle 7, Other 6, Profiler 6, Graphics 2
  - JS leaf 3 / native under JS 22 / native 19; buckets: ipc 44, paint_layout 20, gc_cc 16, poll_wait 12, array_buffer_copy 10, subprocess_pipe_io 3, js_ctypes 3, harness_diagnostics 2
  - top self: `poll [libc.so.6]` 7; `write [libc.so.6]` 5; `recvmsg [libc.so.6]` 5; `#getClosableTabs/remainingTabs< (resource:///modules/zen/Zen` 3; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 21 ms (top self: `syscall [libc.so.6]` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::try_get_ca` 0); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memset_avx512_unaligned_erms [libc.so.6]` 0, `ARGBSetRow_X86 [libxul.so]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 7, poll_wait 7; top self: `poll [libc.so.6]` 7; `[unknown]` 0; `pthread_mutex_init@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3811** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (1.6% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3994** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.7% of span): GC / CC 1, Idle 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, gc_cc 1, poll_wait 0
  - top self: `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 1; `poll [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3227** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 45, DOM Worker 34, other 10, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 45 ms (2.2% of span): Idle 38, JavaScript 5, Profiler 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 7 / native 38; buckets: ipc 45, poll_wait 38, harness_diagnostics 6, array_buffer_copy 3, gc_cc 2, memcpy_memset 1, json_metadata 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 38; `write [libc.so.6]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Pr` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 33 ms: buckets subprocess_pipe_io 33, js_ctypes 33, worker_messaging 33, ipc 33, poll_wait 33; top self: `poll [libc.so.6]` 33
- **tab:3811** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): GC / CC 3, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, gc_cc 3, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `XPCWrappedNative::FlatJSObjectFinalized() [libxul.so]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `IPC::Message::IPDLMessage(long, unsigned int, unsigned int, ` 0; `__strnlen_evex [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3994** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 211, DOM Worker 130, Renderer 47, WRRenderBackend 37, Compositor 26, BgPool 22, SwComposite 20, other 17, ImageBridge 11, WRSceneBuilder 6, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0
  - main thread 211 ms (6.8% of span): Idle 148, JavaScript 36, Other 15, DOM 6, Profiler 3, GC / CC 2
  - JS leaf 7 / native under JS 32 / native 172; buckets: ipc 211, poll_wait 159, gc_cc 38, worker_messaging 18, engine_stream_read 14, json_metadata 11, native_receiver 7, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 149; `[unknown]` 6; `recvmsg [libc.so.6]` 5; `mprotect [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 189 ms, GCSlice 3× 2 ms, GCMinor 2× 2 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 41, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `syscall [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `[axiosozo-dev]` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 21 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 130 ms: buckets subprocess_pipe_io 130, worker_messaging 130, ipc 130, js_ctypes 124, poll_wait 123, gc_cc 2; top self: `poll [libc.so.6]` 123; `write [libc.so.6]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 0; `non-virtual thunk to mozilla::dom::WorkerGlobalSco` 0
- **tab:3317** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3816** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 194, main 178, Socket 59, Renderer 46, WRRenderBackend 36, BgPool 30, Compositor 26, SwComposite 20, ImageBridge 10, WRSceneBuilder 6, other 2, IPC I/O 1, ImageIO 0, WRWorker 0
  - main thread 178 ms (5.9% of span): Idle 99, JavaScript 37, Other 17, DOM 15, Network 9, Profiler 2
  - JS leaf 6 / native under JS 51 / native 122; buckets: ipc 178, poll_wait 105, gc_cc 51, worker_messaging 26, engine_stream_read 20, array_buffer_copy 14, subprocess_pipe_io 12, json_metadata 12
  - top self: `poll [libc.so.6]` 99; `__memset_avx512_unaligned_erms [libc.so.6]` 6; `[unknown]` 6; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 4; `recvmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 46 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 41, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 32, `webrender::visibility::update_prim_visibility [lib` 0, `__memcmp_evex_movbe [libc.so.6]` 0); SwComposite 20 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `nsThread::Dispatch(already_AddRefed<nsIRunnable>, ` 0); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #1 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `rename [libc.so.6]` 1, `[libfreeblpriv3.so]` 1)
  - busiest DOM Worker 186 ms: buckets subprocess_pipe_io 186, worker_messaging 185, ipc 185, js_ctypes 128, poll_wait 125, gc_cc 52; top self: `poll [libc.so.6]` 125; `[axiosozo-dev]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `madvise [libc.so.6]` 5; `mozilla::dom::Timeout::~Timeout() [libxul.so]` 4
- **tab:3317** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3299** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3993** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 359, DOM Worker 151, Renderer 34, BgPool 30, WRRenderBackend 27, Compositor 18, SwComposite 13, other 12, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0
  - main thread 359 ms (17.5% of span): Idle 188, GC / CC 56, JavaScript 48, Other 27, DOM 19, Graphics 9
  - JS leaf 2 / native under JS 61 / native 296; buckets: ipc 359, poll_wait 223, gc_cc 116, worker_messaging 38, paint_layout 31, subprocess_pipe_io 17, array_buffer_copy 15, engine_stream_read 15
  - top self: `poll [libc.so.6]` 190; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `write [libc.so.6]` 7; `[unknown]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `[axiosozo-dev]` 4
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 14× 50 ms, CCSlice 3× 10 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `syscall [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 1, `webrender::spatial_tree::SpatialTree::visit_node_i` 0); SwComposite 13 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 29, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 8 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::TextureClient::TextureClientRecyc` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 151 ms: buckets subprocess_pipe_io 151, worker_messaging 151, ipc 151, js_ctypes 139, poll_wait 135, array_buffer_copy 3; top self: `poll [libc.so.6]` 135; `read [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `[unknown]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3811** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3994** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3278** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 277, DOM Worker 106, Renderer 31, other 20, WRRenderBackend 11, Compositor 10, WRWorker 9, SwComposite 8, WRSceneBuilder 7, BgPool 2, IPC I/O 1, ImageBridge 1, Socket 1, ImageIO 0
  - main thread 277 ms (7.6% of span): Idle 102, JavaScript 51, GC / CC 29, Layout 26, Graphics 24, Other 20
  - JS leaf 7 / native under JS 90 / native 180; buckets: ipc 277, poll_wait 137, gc_cc 93, paint_layout 56, worker_messaging 47, engine_stream_read 28, subprocess_pipe_io 13, array_buffer_copy 11
  - top self: `poll [libc.so.6]` 102; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `[axiosozo-dev]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `write [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 786 ms, GCSlice 7× 23 ms, CCSlice 2× 6 ms, GCMinor 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0); SwComposite 9 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 106 ms: buckets subprocess_pipe_io 106, worker_messaging 106, ipc 106, js_ctypes 94, poll_wait 91, gc_cc 5; top self: `poll [libc.so.6]` 91; `getcontext [libc.so.6]` 3; `mozilla::dom::TimeoutExecutor::Run() [libxul.so]` 2; `JSStructuredCloneWriter::traverseObject(JS::Handle` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:3227** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `xpc::JSXrayTraits::createHolder(JSContext*, JSObject*) [libx` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3299** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3278** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 134, DOM Worker 31, Renderer 8, BgPool 7, IPC I/O 5, Compositor 3, other 2, WRRenderBackend 2, WRSceneBuilder 2, Socket 1, SwComposite 1, ImageBridge 0, ImageIO 0, WRWorker 0
  - main thread 134 ms (0.8% of span): GC / CC 73, Idle 20, JavaScript 13, Layout 11, Other 6, Graphics 5
  - JS leaf 1 / native under JS 23 / native 110; buckets: ipc 134, gc_cc 82, poll_wait 23, paint_layout 19, array_buffer_copy 11, harness_diagnostics 8, memcpy_memset 2, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 20; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `mozilla::nsDisplayOpacity::CanMerge(mozilla::nsDisplayItem c` 4
  - GC/CC markers: GCMajor 3× 198 ms, GCSlice 14× 65 ms, CCSlice 3× 10 ms, GCMinor 3× 1 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 8 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `roundf [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 6 ms (top self: `unlink [libc.so.6]` 4, `rmdir [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets subprocess_pipe_io 31, worker_messaging 31, ipc 31, gc_cc 27, js_ctypes 5, poll_wait 4; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `poll [libc.so.6]` 4; `[axiosozo-dev]` 3; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 3; `madvise [libc.so.6]` 3
- **tab:3317** CPU ms by thread group: main 5, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 3, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 3; `nsGenericHTMLElement::UnbindFromTree(mozilla::dom::UnbindCon` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `mozilla::dom::Promise::CreateWrapper(mozilla::ErrorResult&, ` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::ipc::IdleSchedulerChild::SetActive() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3811** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0, Layout 0, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1, canvas_2d 0
  - top self: `poll [libc.so.6]` 3; `[]` 0; `mozilla::layout::TextDrawTarget::~TextDrawTarget() [libxul.s` 0; `mozilla::ScrollContainerFrame::HandleScrollbarStyleSwitching` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::ViewportUtils::VisualToLayout(nsRect const&, mozill` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3299** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **112.6** (Renderer 45.1, main 39.4, DOM Worker 11.3, TaskCon~ller # 5.6, WRRende~ckend# 5.6) | cef:renderer 22.5, AxioCEFProbe 22.5, cef:utility 11.3 | — | 149.8 |
| plain | idle | — | — | **3.4** (main 2.4, Timer 0.5, IPDL Background 0.5) | Web Content 3.9, AxioCEFProbe 1.0 | — | — |
| plain | raf | 59.9 | 22.7 | **32.6** (main 8.8, Renderer 5.9, SwComposite 5.2, Backgro~Pool # 4.2, DOM Worker 2.9) | cef:gpu-process 11.7, AxioCEFProbe 10.5, cef:renderer 9.2 | — | — |
| plain | raf-nosampler | — | — | **24.7** (Renderer 5.3, main 4.6, SwComposite 4.0, Backgro~Pool # 3.6, DOM Worker 2.3) | cef:gpu-process 11.0, AxioCEFProbe 8.6, cef:renderer 8.4, cef:utility 0.3 | — | — |
| plain | scroll | 60.3 | 21.5 | **49.5** (main 17.3, Backgro~Pool # 9.9, DOM Worker 7.4, Renderer 5.4, SwComposite 4.0) | cef:gpu-process 49.4, AxioCEFProbe 13.8, cef:renderer 11.4 | — | — |
| plain | key | — | — | **18.2** (main 8.5, Renderer 2.8, SwComposite 1.9, DOM Worker 1.1, Timer 0.6) | cef:renderer 3.3, AxioCEFProbe 2.8, cef:gpu-process 0.9, WebExtensions 0.3 | 13.6 | — |
| plain | switch-to-gecko | — | — | **12.1** (DOM Worker 4.3, main 3.9, IPDL Background 1.5, TaskCon~ller # 1.1, StreamTrans # 0.5) | Web Content 0.1, WebExtensions 0.1 | — | 15023.5 |
| trace | switch-to-engine | — | — | **102.8** (Renderer 63.4, main 26.4, glean.dispatche 2.6, WrGlyph~terizer 2.6, WRRende~ckend# 2.6) | AxioCEFProbe 52.7, cef:gpu-process 26.4, cef:renderer 13.2, cef:zygote 10.6 | — | 347.9 |
| trace | idle | — | — | **2.4** (main 1.9, Timer 0.5) | AxioCEFProbe 2.5, Web Content 1.9, cef:zygote 0.5, Privileged Cont 0.5 | — | — |
| trace | raf | 59.9 | 20.9 | **28.6** (main 7.5, Renderer 5.6, SwComposite 4.9, Backgro~Pool # 3.9, DOM Worker 2.3) | cef:gpu-process 10.8, AxioCEFProbe 9.4, cef:renderer 7.5 | — | — |
| trace | raf-nosampler | — | — | **22.8** (Renderer 5.6, SwComposite 4.6, main 4.0, Backgro~Pool # 3.3, DOM Worker 2.3) | cef:gpu-process 10.7, AxioCEFProbe 9.3, cef:renderer 8.1 | — | — |
| trace | scroll | 60.1 | 22.8 | **46.7** (main 15.9, Backgro~Pool # 10.4, DOM Worker 6.9, Renderer 5.5, SwComposite 4.0) | cef:gpu-process 49.2, AxioCEFProbe 14.4, cef:renderer 12.0 | — | — |
| trace | key | — | — | **17.1** (main 7.7, Renderer 3.0, SwComposite 2.2, DOM Worker 1.1, Timer 0.5) | AxioCEFProbe 3.0, cef:renderer 2.8, cef:gpu-process 0.5, WebExtensions 0.3 | 13.5 | — |
| trace | switch-to-gecko | — | — | **2.1** (main 0.8, TaskCon~ller # 0.4, DOM Worker 0.2, Renderer 0.1, Backgro~Pool # 0.1) | WebExtensions 0.1, Web Content 0.1, Privileged Cont 0.1 | — | 15626.5 |
| profile | switch-to-engine | — | — | **115.9** (Renderer 40.4, main 30.3, DOM Worker 15.1, SamplerThread 10.1, glean.dispatche 5.0) | AxioCEFProbe 40.2, cef:renderer 25.2, Privileged Cont 5.0 | — | 150.2 |
| profile | idle | — | — | **20.4** (DOM Worker 6.8, SamplerThread 6.3, main 5.3, Timer 1.5, glean.dispatche 0.5) | Web Content 4.9, AxioCEFProbe 2.5, WebExtensions 1.5, cef:utility 1.0 | — | — |
| profile | raf | 60.0 | 21.2 | **57.2** (main 12.0, DOM Worker 11.7, SamplerThread 9.8, Renderer 6.8, SwComposite 5.5) | AxioCEFProbe 11.7, cef:gpu-process 11.4, cef:renderer 9.2, Web Content 7.2 | — | — |
| profile | raf-nosampler | — | — | **48.9** (DOM Worker 10.9, SamplerThread 8.3, Renderer 7.0, main 6.3, SwComposite 5.3) | AxioCEFProbe 10.9, cef:gpu-process 10.6, cef:renderer 9.6, Web Content 6.9 | — | — |
| profile | scroll | 60.0 | 21.2 | **75.2** (main 22.1, DOM Worker 15.7, Backgro~Pool # 10.8, SamplerThread 9.8, Renderer 5.9) | cef:gpu-process 49.2, AxioCEFProbe 13.8, cef:renderer 12.2, Web Content 6.9 | — | — |
| profile | key | — | — | **37.2** (main 11.5, DOM Worker 8.2, SamplerThread 7.7, Renderer 3.0, SwComposite 2.5) | Web Content 6.8, AxioCEFProbe 2.8, cef:renderer 2.2, WebExtensions 1.9 | 16.0 | — |
| profile | switch-to-gecko | — | — | **4.1** (SamplerThread 2.7, main 0.5, DOM Worker 0.4, IPC I/O Parent 0.1, Renderer 0.1) | Web Content 6.1, Privileged Cont 1.5, Isolated Web Co 1.5, WebExtensions 1.2 | — | 15025.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.0 | 0.0 | 0 | 0.0 | — | — | 28.6 | 0.0 | — | 6.75 | 0.51 | — | — | — | — | — | 0.003 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.29 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 11.2 | 0.0 | — | 0.85 | 0.09 | — | — | — | — | — | 0.006 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | 0.16 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 9.3 | 0.0 | 0 | 0.0 | — | — | 9.4 | 0.0 | — | 6.00 | 1.19 | — | — | — | — | — | 0.011 |
| profile | raf | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.35 | 0.15 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.30 | 0.14 | — | — | — | — | — | 0.009 |
| profile | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 11.6 | 0.0 | — | 0.93 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.4 | 0.0 | — | 0.27 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 4.822 | 5.256 | 0.0251 | 0.0273 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.222 | 0.421 | 0.0133 | 0.0252 |
| plain | raf-nosampler | memfd | native | 182 | 181 | 0.180 | 0.377 | 0.0108 | 0.0225 |
| plain | scroll | memfd | native | 120 | 120 | 0.752 | 0.972 | 0.0441 | 0.0570 |
| plain | key | memfd | native | 21 | 21 | 0.093 | 0.295 | 0.0005 | 0.0017 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 3.127 | 5.674 | 0.0158 | 0.0286 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 185 | 185 | 0.197 | 0.405 | 0.0119 | 0.0243 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.170 | 0.364 | 0.0102 | 0.0219 |
| trace | scroll | memfd | native | 120 | 120 | 0.769 | 0.981 | 0.0455 | 0.0580 |
| trace | key | memfd | native | 21 | 21 | 0.095 | 0.304 | 0.0005 | 0.0017 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 5.390 | 12.115 | 0.0500 | 0.1124 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.237 | 0.444 | 0.0142 | 0.0267 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.201 | 0.420 | 0.0121 | 0.0252 |
| profile | scroll | memfd | native | 120 | 120 | 0.830 | 1.075 | 0.0485 | 0.0629 |
| profile | key | memfd | native | 21 | 21 | 0.111 | 0.295 | 0.0006 | 0.0017 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.7 | 9.0 | 0.0 | — | 0.16 | 0.40 | — | — | 8.1 | 10.3 | 18.9 |
| profile | 0.9 | 11.5 | 0.1 | — | 0.27 | 0.59 | — | — | 9.2 | 13.0 | 21.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 182.3; write create 184.7; first frame applied (native receiver) 360.3; write frame_ack 361.1; write focus 368.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 17.4; first stdout read resolved 26.6; write shutdown 31.5

Switch timeline (profile, switch-to-engine, ms after the window start): write create 26.1; first stdout read resolved 33.0; first frame applied (native receiver) 153.2; write frame_ack 155.3; write focus 167.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 24.9; first stdout read resolved 37.3; write shutdown 40.0

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 86, main 66, BgPool 19, DOM Worker 14, SwComposite 10, WRRenderBackend 5, Compositor 4, WRSceneBuilder 3, Socket 1, WRWorker 0, IPC I/O 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 66 ms (30.7% of span): DOM 18, JavaScript 13, Layout 12, Idle 12, Graphics 6, Profiler 2
  - JS leaf 4 / native under JS 35 / native 26; buckets: ipc 66, paint_layout 24, gc_cc 17, array_buffer_copy 15, poll_wait 13, harness_diagnostics 11, canvas_2d 5, webrender_render 4
  - top self: `poll [libc.so.6]` 12; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 7; `mozilla::net::nsStandardURL::nsStandardURL(bool, bool) [libx` 7; `<style::values::specified::corner_shape::CornerShape as styl` 5; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 4; `mozilla::nsCSSGradientRenderer::TryPaintTilesWithExtendMode(` 4
  - WebRender/compositor threads: Renderer 86 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 15, `__lll_lock_wake [libc.so.6]` 11); SwComposite 10 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 19 ms (top self: `ARGBSetRow_X86 [libxul.so]` 6, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memset_avx512_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 11, poll_wait 11, gc_cc 1; top self: `poll [libc.so.6]` 11; `__lll_lock_wake [libc.so.6]` 1; `mozilla::dom::(anonymous namespace)::ExternalRunna` 1; `mprotect [libc.so.6]` 1; `[unknown]` 0
- **tab:3826** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.4% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, webrender_render 0
  - top self: `poll [libc.so.6]` 3; `mozilla::dom::BrowserChild::GetFrom(mozilla::layers::LayersI` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4020** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3335** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 95, DOM Worker 86, other 16, Socket 1, IPC I/O 1, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 95 ms (4.6% of span): Idle 76, Other 5, JavaScript 5, GC / CC 4, Profiler 3, DOM 1
  - JS leaf 0 / native under JS 7 / native 87; buckets: ipc 95, poll_wait 79, harness_diagnostics 7, gc_cc 7, array_buffer_copy 5, memcpy_memset 2, subprocess_pipe_io 2, worker_messaging 0
  - top self: `poll [libc.so.6]` 76; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [` 1; `[axiosozo-dev]` 1; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [li` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1
  - GC/CC markers: CCSlice 1× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 86 ms: buckets subprocess_pipe_io 86, js_ctypes 86, worker_messaging 86, ipc 86, poll_wait 86; top self: `poll [libc.so.6]` 86
- **tab:3335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::detail::nsTStringRepr<char>::Equals(char const*) co` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4015** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `firefox_on_glean::metrics::__glean_metric_maps::COUNTER_MAP:` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4020** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 337, DOM Worker 268, Renderer 193, SwComposite 157, BgPool 128, WRRenderBackend 47, Compositor 35, other 26, ImageBridge 15, WRSceneBuilder 7, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 337 ms (10.9% of span): Idle 242, JavaScript 52, Other 25, DOM 12, Profiler 4, GC / CC 2
  - JS leaf 6 / native under JS 56 / native 274; buckets: ipc 335, poll_wait 252, gc_cc 54, engine_stream_read 28, worker_messaging 22, json_metadata 15, harness_diagnostics 13, subprocess_pipe_io 10
  - top self: `poll [libc.so.6]` 244; `[unknown]` 9; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 193 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 107, `__memmove_avx512_unaligned_erms [libc.so.6]` 64, `syscall [libc.so.6]` 10); SwComposite 157 ms (top self: `syscall [libc.so.6]` 121, `__memmove_avx512_unaligned_erms [libc.so.6]` 34, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `webrender::tile_cache::TileCacheInstance::update_p` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 128 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `__memmove_avx512_unaligned_erms [libc.so.6]` 29, `BackgroundEventTarget::Release() [libxul.so]` 1); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `__lll_lock_wake [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 267, ipc 267, js_ctypes 247, poll_wait 243, gc_cc 10; top self: `poll [libc.so.6]` 243; `write [libc.so.6]` 3; `[axiosozo-dev]` 2; `JSObject::allocKindForTenure(js::Nursery const&) c` 1; `_ZZN7mozilla20ProfileChunkedBuffer16ReserveAndPutR` 1
- **tab:4015** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3294** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 247, Renderer 184, main 177, SwComposite 151, BgPool 117, WRRenderBackend 46, Compositor 35, ImageBridge 14, WRSceneBuilder 7, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 177 ms (5.8% of span): Idle 106, JavaScript 45, Other 17, DOM 9, Profiler 1
  - JS leaf 5 / native under JS 45 / native 127; buckets: ipc 177, poll_wait 113, gc_cc 49, worker_messaging 29, engine_stream_read 28, subprocess_pipe_io 13, json_metadata 11, native_receiver 10
  - top self: `poll [libc.so.6]` 107; `[unknown]` 11; `recvmsg [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 2
  - WebRender/compositor threads: Renderer 183 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `__memmove_avx512_unaligned_erms [libc.so.6]` 68, `syscall [libc.so.6]` 7); SwComposite 151 ms (top self: `syscall [libc.so.6]` 107, `__memmove_avx512_unaligned_erms [libc.so.6]` 41, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 117 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 87, `__memmove_avx512_unaligned_erms [libc.so.6]` 25, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 14 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mojo::core::ports::UserMessageEvent::~UserMessageE` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 247 ms: buckets subprocess_pipe_io 247, worker_messaging 247, ipc 247, js_ctypes 226, poll_wait 220, gc_cc 6; top self: `poll [libc.so.6]` 220; `[unknown]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 2; `mozilla::Queue<nsCOMPtr<nsIRunnable>, 16ul>::Pop()` 1
- **tab:3831** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `[]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3294** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4015** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 412, DOM Worker 271, BgPool 220, Renderer 111, SwComposite 87, WRRenderBackend 31, Compositor 22, other 17, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 412 ms (20.1% of span): Idle 259, JavaScript 74, Other 39, Graphics 16, DOM 12, Profiler 10
  - JS leaf 10 / native under JS 73 / native 330; buckets: ipc 412, poll_wait 306, gc_cc 68, worker_messaging 40, paint_layout 38, subprocess_pipe_io 20, array_buffer_copy 19, engine_stream_read 18
  - top self: `poll [libc.so.6]` 260; `[unknown]` 10; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 3
  - WebRender/compositor threads: Renderer 111 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx512_unaligned_erms [libc.so.6]` 23, `syscall [libc.so.6]` 11); SwComposite 87 ms (top self: `syscall [libc.so.6]` 80, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 219 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 126, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `[linux-vdso.so.1]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `rename [libc.so.6]` 0)
  - busiest DOM Worker 271 ms: buckets subprocess_pipe_io 271, worker_messaging 271, ipc 271, js_ctypes 242, poll_wait 233, gc_cc 8; top self: `poll [libc.so.6]` 233; `__lll_lock_wait [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[unknown]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 2
- **tab:4020** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Ad` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3294** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 389, DOM Worker 200, Renderer 118, SwComposite 77, other 28, WRRenderBackend 20, Compositor 17, WRWorker 11, WRSceneBuilder 10, BgPool 8, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 389 ms (10.6% of span): Idle 155, JavaScript 79, Layout 42, Other 35, Graphics 30, DOM 28
  - JS leaf 10 / native under JS 141 / native 239; buckets: ipc 388, poll_wait 196, gc_cc 104, paint_layout 84, worker_messaging 72, engine_stream_read 45, subprocess_pipe_io 21, harness_diagnostics 16
  - top self: `poll [libc.so.6]` 156; `[unknown]` 21; `[axiosozo-dev]` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `write [libc.so.6]` 4; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 44, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 13); SwComposite 77 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 51, `syscall [libc.so.6]` 23, `UnlockResource [libxul.so]` 1); WRRenderBackend#0 20 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `mozilla::layers::TextureClient::Unlock() [libxul.s` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::ipc::MessageChannel::OnMessageReceivedFro` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 200 ms: buckets subprocess_pipe_io 200, worker_messaging 200, ipc 200, js_ctypes 189, poll_wait 183, gc_cc 6; top self: `poll [libc.so.6]` 183; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `PLDHashTable::Search(void const*) const [libxul.so` 2; `[axiosozo-dev]` 1
- **tab:3233** CPU ms by thread group: main 8, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0, GC / CC 0, Other 0
  - JS leaf 0 / native under JS 1 / native 7; buckets: ipc 8, poll_wait 6, array_buffer_copy 2, gc_cc 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 6; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `[]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[1` 0; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 67, DOM Worker 61, Renderer 34, IPC I/O 6, BgPool 6, SwComposite 5, Compositor 4, other 3, WRRenderBackend 3, WRSceneBuilder 2, Socket 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 67 ms (0.4% of span): Idle 20, JavaScript 14, Other 10, Layout 10, DOM 6, GC / CC 5
  - JS leaf 1 / native under JS 29 / native 37; buckets: ipc 67, poll_wait 22, paint_layout 17, gc_cc 14, harness_diagnostics 9, array_buffer_copy 9, memcpy_memset 4, canvas_2d 3
  - top self: `poll [libc.so.6]` 20; `madvise [libc.so.6]` 3; `nsTextFrame::GetInFlowContentLength() [libxul.so]` 3; `[unknown]` 3; `mprotect [libc.so.6]` 2; `__memcmp_evex_movbe [libc.so.6]` 1
  - GC/CC markers: CCSlice 1× 4 ms, GCMinor 3× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 14, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9, `hypotf@@GLIBC_2.35 [libm.so.6]` 1); SwComposite 5 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `core::hash::BuildHasher::hash_one [libxul.so]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 5 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 1, `fstatat64 [libc.so.6]` 0); BackgroundThreadPool #3 1 ms (top self: `syscall [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 61 ms: buckets subprocess_pipe_io 61, worker_messaging 61, ipc 61, gc_cc 49, poll_wait 14, js_ctypes 13; top self: `poll [libc.so.6]` 10; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `madvise [libc.so.6]` 7; `mozilla::dom::Timeout::~Timeout() [libxul.so]` 4; `mozilla::SourceLocation::~SourceLocation() [libxul` 4
- **tab:3335** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0; `[libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3831** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `mozilla::dom::AutoYieldJSThreadExecution::AutoYieldJSThreadE` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3826** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, DOM 0, Other 0, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `mozilla::gfx::Matrix4x4TypedFlagged<mozilla::LayoutDevicePix` 0; `nsIFrame::CanBeDynamicReflowRoot() const [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **54.1** (Renderer 24.9, main 16.6, glean.dispatche 4.2, Compositor 4.2, DOM Worker 4.2) | WPEWebProcess 70.7, WPENetworkProce 12.5, Isolated Web Co 8.3, AxioWebKitHost 4.2 | — | 206.1 |
| plain | idle | — | — | **7.3** (main 6.3, Timer 0.5, TaskCon~ller # 0.5) | Web Content 4.3 | — | — |
| plain | raf | 58.2 | 23.9 | **21.3** (main 10.1, DOM Worker 2.3, Renderer 1.9, SwComposite 1.3, TaskCon~ller # 1.0) | WPEWebProcess 61.3, AxioWebKitHost 6.7, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.8** (main 4.6, DOM Worker 2.7, Renderer 2.3, glean.dispatche 1.3, WRRende~ckend# 1.3) | WPEWebProcess 59.6, AxioWebKitHost 5.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 57.7 | 31.2 | **40.1** (main 19.3, DOM Worker 7.2, TaskCon~ller # 2.9, Backgro~Pool # 2.9, Renderer 1.9) | WPEWebProcess 65.8, AxioWebKitHost 8.7, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **15.9** (main 10.7, Renderer 1.4, TaskCon~ller # 0.8, DOM Worker 0.8, Timer 0.5) | WPEWebProcess 6.6, AxioWebKitHost 1.4 | 17.1 | — |
| plain | switch-to-gecko | — | — | **20.9** (main 8.3, BgIOThr~Pool # 4.2, WRScene~ilder# 4.2, DOM Worker 4.2) |  | — | 213.7 |
| trace | switch-to-engine | — | — | **33.2** (Renderer 13.3, main 10.0, Softwar~cThread 3.3, WRScene~ilder# 3.3, WRRende~ckend# 3.3) | WPEWebProcess 63.2, WPENetworkProce 13.3, AxioWebKitHost 3.3 | — | 272.7 |
| trace | idle | — | — | **11.5** (main 8.7, Timer 1.4, TaskCon~ller # 1.4) | Web Content 1.9, AxioWebKitHost 1.0 | — | — |
| trace | raf | 58.1 | 25.3 | **35.2** (main 17.2, DOM Worker 4.2, TaskCon~ller # 3.2, Renderer 2.3, WRRende~ckend# 1.6) | WPEWebProcess 62.2, AxioWebKitHost 6.7, Isolated Web Co 0.6, WebExtensions 0.3 | — | — |
| trace | raf-nosampler | — | — | **18.5** (main 4.6, DOM Worker 4.3, Renderer 2.0, Backgro~Pool # 1.3, glean.dispatche 1.0) | WPEWebProcess 63.4, AxioWebKitHost 7.3 | — | — |
| trace | scroll | 56.0 | 34.6 | **39.3** (main 19.9, DOM Worker 6.8, Renderer 2.4, Backgro~Pool # 2.4, TaskCon~ller # 1.9) | WPEWebProcess 67.5, AxioWebKitHost 9.3 | — | — |
| trace | key | — | — | **20.1** (main 12.1, TaskCon~ller # 1.9, DOM Worker 1.4, Timer 1.1, Renderer 1.1) | WPEWebProcess 6.9, AxioWebKitHost 1.4, Web Content 0.3 | 16.4 | — |
| trace | switch-to-gecko | — | — | **28.2** (main 12.1, Renderer 8.1, glean.dispatche 4.0, BgIOThr~Pool # 4.0) | Isolated Web Co 8.1 | — | 213.8 |
| profile | switch-to-engine | — | — | **42.0** (main 12.0, DOM Worker 12.0, SamplerThread 9.0, Renderer 3.0, Compositor 3.0) | WPEWebProcess 63.2, Web Content 33.1, WPENetworkProce 9.0, AxioWebKitHost 3.0 | — | 295.4 |
| profile | idle | — | — | **26.7** (main 8.6, DOM Worker 8.1, SamplerThread 8.1, Timer 1.4, TaskCon~ller # 0.5) | Web Content 9.1, WebExtensions 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 58.0 | 21.1 | **45.9** (main 13.8, DOM Worker 10.6, SamplerThread 9.7, Renderer 2.9, Timer 1.6) | WPEWebProcess 63.7, Web Content 8.7, AxioWebKitHost 6.7, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **37.9** (DOM Worker 10.9, SamplerThread 8.3, main 6.6, Renderer 3.0, WRRende~ckend# 1.7) | WPEWebProcess 63.2, Web Content 7.9, AxioWebKitHost 6.6, WebExtensions 1.7 | — | — |
| profile | scroll | 57.0 | 33.8 | **62.4** (main 25.0, DOM Worker 13.9, SamplerThread 9.6, Renderer 2.9, Backgro~Pool # 2.9) | WPEWebProcess 66.3, AxioWebKitHost 9.6, Web Content 7.2, Socket Process 1.4 | — | — |
| profile | key | — | — | **45.2** (main 17.2, DOM Worker 9.8, SamplerThread 9.5, TaskCon~ller # 2.7, Timer 1.6) | Web Content 9.8, WPEWebProcess 6.9, Isolated Web Co 2.2, WebExtensions 2.2 | 19.2 | — |
| profile | switch-to-gecko | — | — | **51.9** (main 15.9, Renderer 8.0, DOM Worker 8.0, SamplerThread 8.0, IPC I/O Parent 4.0) | Isolated Web Co 8.0 | — | 220.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.3 | 0.0 | 0 | 0.0 | — | — | 74.7 | 0.0 | — | 1.28 | 0.43 | — | — | — | — | — | 0.003 |
| trace | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.13 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 57.4 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.14 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 54.8 | 0.0 | 0 | 0.0 | — | — | 11.0 | 0.0 | — | 0.29 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 89.4 | 0.0 | — | 2.01 | 0.61 | — | — | — | — | — | 0.003 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.16 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 55.7 | 0.0 | 0 | 0.0 | — | — | 13.2 | 0.0 | — | 0.36 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.12 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.841 | 1.560 | 0.0064 | 0.0119 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.035 | 0.068 | 0.0020 | 0.0039 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.053 | 0.094 | 0.0030 | 0.0055 |
| plain | scroll | memfd | native | 117 | 117 | 0.172 | 0.245 | 0.0096 | 0.0137 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.068 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.894 | 1.696 | 0.0056 | 0.0106 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.042 | 0.084 | 0.0024 | 0.0049 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.049 | 0.090 | 0.0028 | 0.0052 |
| trace | scroll | memfd | native | 114 | 114 | 0.189 | 0.229 | 0.0104 | 0.0125 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.073 | 0.0000 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.146 | 2.109 | 0.0063 | 0.0117 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 181 | 181 | 0.046 | 0.080 | 0.0027 | 0.0046 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.054 | 0.099 | 0.0031 | 0.0057 |
| profile | scroll | memfd | native | 117 | 117 | 0.233 | 0.254 | 0.0130 | 0.0142 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.109 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 12.9 | 0.0 | — | 0.10 | 0.30 | — | — | 14.8 | 13.6 | 31.6 |
| profile | 0.6 | 15.9 | 0.0 | — | 0.12 | 0.46 | — | — | 10.3 | 16.8 | 26.3 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 22.6; first stdout read resolved 24.1; first frame applied (native receiver) 288.0; write frame_ack 288.6; write visibility 292.5; write focus 292.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 17.7; first stdout read resolved 23.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 38.4; first stdout read resolved 46.7; first frame applied (native receiver) 318.8; write frame_ack 319.9; write visibility 327.2; write focus 327.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 30.8; first stdout read resolved 39.4

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 38, DOM Worker 25, Renderer 18, BgPool 6, Compositor 3, WRRenderBackend 3, IPC I/O 2, WRSceneBuilder 2, SwComposite 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 38 ms (10.7% of span): JavaScript 15, Idle 11, Layout 6, Graphics 3, Other 1, DOM 1
  - JS leaf 0 / native under JS 20 / native 19; buckets: ipc 38, gc_cc 12, poll_wait 12, array_buffer_copy 9, paint_layout 8, harness_diagnostics 8, engine_stream_read 4, worker_messaging 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `JS::AddAssociatedMemory(JSObject*, unsigned long, JS::Memory` 2; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNat` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `mozilla::ReflowInput::InitConstraints(nsPresContext*, mozill` 2; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `ClearTexSubImage [libxul.so]` 4, `__syscall_cancel_arch [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `ARGBSetRow_X86 [libxul.so]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 25 ms: buckets subprocess_pipe_io 25, worker_messaging 25, ipc 25, js_ctypes 22, poll_wait 21, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 21; `pthread_mutex_init@@GLIBC_2.2.5 [libc.so.6]` 3; `js::jit::JSJitFrameIter::JSJitFrameIter(js::jit::J` 0; `js::SharedShape::getInitialShape(JSContext*, JSCla` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:7878** CPU ms by thread group: main 53, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 53 ms (14.8% of span): Other 43, JavaScript 8, GC / CC 1, Idle 1, Profiler 0, DOM 0
  - JS leaf 0 / native under JS 9 / native 45; buckets: ipc 45, array_buffer_copy 18, gc_cc 12, memcpy_memset 2, subprocess_pipe_io 2, poll_wait 2
  - top self: `js::jit::CacheIRCompiler::emitCompareInt32Result(JSOp, js::j` 6; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 6; `[libfontconfig.so.1]` 4; `[]` 4; `mozilla::xpcom::StaticModule::GetFactory() const [libxul.so]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7883** CPU ms by thread group: main 40, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (11.9% of span): Other 30, DOM 4, Profiler 2, JavaScript 2, Idle 1
  - JS leaf 0 / native under JS 5 / native 35; buckets: ipc 27, gc_cc 14, subprocess_pipe_io 6, array_buffer_copy 5, poll_wait 3, memcpy_memset 3
  - top self: `CallbackTrieNode::GetOrCreateChild(nsTSubstring<char> const&` 3; `__syscall_cancel_arch [libc.so.6]` 3; `js::frontend::BytecodeEmitter::emitStatementList(js::fronten` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_hand` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7736** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.4% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::dom::EventCallbackDebuggerNotificationGuard::Dispat` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 158, DOM Worker 106, other 19, Socket 1, IPC I/O 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 158 ms (7.5% of span): Idle 121, JavaScript 13, Other 12, DOM 6, GC / CC 4, Profiler 2
  - JS leaf 2 / native under JS 17 / native 139; buckets: ipc 157, poll_wait 129, harness_diagnostics 16, gc_cc 7, array_buffer_copy 6, engine_stream_read 2, native_receiver 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 129; `[unknown]` 3; `mprotect [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 1
  - GC/CC markers: CCSlice 1× 3 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 106 ms: buckets subprocess_pipe_io 106, worker_messaging 106, ipc 106, js_ctypes 106, poll_wait 106, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 106; `js::ArrayObject::addDenseElementNoLengthChange(JSC` 0
- **tab:7342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 392, DOM Worker 253, Renderer 78, WRRenderBackend 45, Compositor 36, SwComposite 36, BgPool 29, other 29, ImageBridge 15, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 392 ms (12.5% of span): Idle 261, JavaScript 75, Other 31, DOM 18, Profiler 5, GC / CC 3
  - JS leaf 7 / native under JS 85 / native 300; buckets: ipc 391, poll_wait 278, gc_cc 74, engine_stream_read 49, worker_messaging 45, harness_diagnostics 25, subprocess_pipe_io 22, array_buffer_copy 17
  - top self: `__syscall_cancel_arch [libc.so.6]` 274; `[unknown]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 3; `encoding_rs::utf_8::convert_utf16_to_utf8_partial_inner [lib` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `__syscall_cancel_arch [libc.so.6]` 64, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 3); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 29 ms (top self: `__syscall_cancel_arch [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 253 ms: buckets subprocess_pipe_io 253, worker_messaging 253, ipc 253, js_ctypes 234, poll_wait 230, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 232; `[unknown]` 3; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7736** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 260, main 202, Renderer 74, WRRenderBackend 42, SwComposite 38, Compositor 35, BgPool 34, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 202 ms (6.6% of span): Idle 102, JavaScript 58, Other 23, DOM 13, GC / CC 3, Profiler 2
  - JS leaf 8 / native under JS 60 / native 133; buckets: ipc 202, poll_wait 113, gc_cc 75, engine_stream_read 43, worker_messaging 28, array_buffer_copy 16, native_receiver 13, subprocess_pipe_io 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 110; `[unknown]` 8; `js::BlockLexicalEnvironmentObject::create(JSContext*, JS::Ha` 7; `__lll_lock_wait [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 74 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 3); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 2, `webrender::tile_cache::TileCacheInstance::update_p` 1); SwComposite 38 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 246 ms: buckets subprocess_pipe_io 246, worker_messaging 246, ipc 246, js_ctypes 230, poll_wait 223, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 226; `[axiosozo-dev]` 4; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7342** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7383** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 482, DOM Worker 235, BgPool 58, Renderer 52, WRRenderBackend 33, SwComposite 24, Compositor 24, other 20, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 482 ms (23.0% of span): Idle 258, JavaScript 103, Other 58, DOM 27, Graphics 14, Profiler 14
  - JS leaf 12 / native under JS 112 / native 358; buckets: ipc 481, poll_wait 316, gc_cc 97, engine_stream_read 68, worker_messaging 54, paint_layout 41, harness_diagnostics 38, subprocess_pipe_io 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 286; `[unknown]` 20; `[axiosozo-dev]` 6; `ProfilingStack::pushLabelFrame(char const*, char const*, voi` 4; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - WebRender/compositor threads: Renderer 52 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 25 ms (top self: `syscall [libc.so.6]` 24, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 58 ms (top self: `__syscall_cancel_arch [libc.so.6]` 48, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::UpdateImageClie` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 235 ms: buckets subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 211, poll_wait 203, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 203; `[axiosozo-dev]` 2; `[unknown]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 593, DOM Worker 260, Renderer 53, other 33, Compositor 18, SwComposite 16, WRRenderBackend 14, WRWorker 12, WRSceneBuilder 8, BgPool 2, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 593 ms (16.1% of span): Idle 240, GC / CC 92, JavaScript 88, Other 45, Layout 42, DOM 37
  - JS leaf 15 / native under JS 150 / native 428; buckets: ipc 592, poll_wait 283, gc_cc 186, paint_layout 85, worker_messaging 73, engine_stream_read 71, harness_diagnostics 33, subprocess_pipe_io 26
  - top self: `__syscall_cancel_arch [libc.so.6]` 262; `[unknown]` 13; `[axiosozo-dev]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `mprotect [libc.so.6]` 5
  - GC/CC markers: GCMajor 2× 1353 ms, GCSlice 16× 69 ms, CCSlice 7× 23 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 53 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); SwComposite 16 ms (top self: `syscall [libc.so.6]` 11, `__memmove_avx_unaligned_erms [libc.so.6]` 5); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `IPC::StringFromIPCMessageType(unsigned int) [libxu` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 259, ipc 259, js_ctypes 244, poll_wait 242, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 242; `[unknown]` 3; `mozilla::detail::EventQueueInternal<16ul>::GetEven` 2; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:7280** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, DOM 0, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[linux-vdso.so.1]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JSStructuredCloneData::discardTransferables() [libxul.so]` 0; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7383** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 75, Renderer 22, DOM Worker 15, BgPool 10, WRRenderBackend 4, Compositor 3, WRSceneBuilder 3, IPC I/O 2, SwComposite 1, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 75 ms (24.8% of span): JavaScript 28, Layout 14, DOM 12, Graphics 8, Idle 5, Other 5
  - JS leaf 0 / native under JS 42 / native 33; buckets: ipc 75, paint_layout 21, array_buffer_copy 21, gc_cc 13, harness_diagnostics 9, poll_wait 7, engine_stream_read 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 4; `mozilla::dom::Element::InternalGetAttrNameFromQName(nsTSubst` 4; `mprotect [libc.so.6]` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - WebRender/compositor threads: Renderer 22 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 4, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `webrender_api::display_list::BuiltDisplayListIter:` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `getdents64 [libc.so.6]` 3, `unlink [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `syscall [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, js_ctypes 14, poll_wait 13, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 13; `mozilla::dom::DedicatedWorkerGlobalScope::QueryInt` 1; `TimerThread::RemoveTimer(nsTimerImpl*, mozilla::de` 0; `js::Interpret(JSContext*, js::RunState&) [libxul.s` 0; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0
- **tab:7736** CPU ms by thread group: main 28, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 28 ms (9.4% of span): Other 9, JavaScript 8, Idle 4, DOM 4, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 8 / native 20; buckets: ipc 24, paint_layout 10, gc_cc 6, subprocess_pipe_io 4, poll_wait 4, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 2; `[]` 2; `profiler_is_locked_on_current_thread() [libxul.so]` 1; `u_terminateChars_78 [libxul.so]` 1; `js::LinkConstructorAndPrototype(JSContext*, JSObject*, JSObj` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7280** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7883** CPU ms by thread group: main 0, IPC I/O 0, BgPool 0, Socket 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

