# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.1 | **7.3** (main 1.9, Renderer 1.9, IPDL Background 1.0, Compositor 1.0, DOM Worker 1.0) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **25.1** (Renderer 12.8, WRRende~ckend# 2.6, SwComposite 2.3, main 1.6, TaskCon~ller # 1.6) | Isolated Web Co 4.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.7** (Renderer 7.3, main 1.7, WRRende~ckend# 1.7, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 4.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **57.8** (Renderer 41.8, main 4.5, SwComposite 4.0, WRRende~ckend# 3.5, glean.dispatche 1.0) | Isolated Web Co 4.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.3** (main 4.3, Renderer 0.8, TaskCon~ller # 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.6 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **2.9** (SamplerThread 1.9, main 0.5, IPDL Background 0.5) | Web Content 5.4, Isolated Web Co 3.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **24.2** (Renderer 6.2, SamplerThread 3.9, WRRende~ckend# 2.9, main 2.0, WRScene~ilder# 2.0) | Isolated Web Co 11.1, Web Content 6.2, Privileged Cont 1.3, WebExtensions 1.0 | — | — |
| profile | raf-nosampler | — | — | **26.3** (Renderer 8.6, SamplerThread 4.3, WRRende~ckend# 2.7, WRScene~ilder# 2.0, main 1.7) | Isolated Web Co 10.3, Web Content 4.3, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | scroll | 59.0 | 17.2 | **124.6** (Renderer 48.2, main 17.7, DOM Worker 14.3, Indexed~ IO # 12.8, SamplerThread 7.4) | Isolated Web Co 8.9, Web Content 5.9, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **33.6** (main 12.0, DOM Worker 5.3, Indexed~ IO # 4.0, SamplerThread 3.7, IPDL Background 1.9) | Web Content 5.3, Isolated Web Co 3.7, WebExtensions 1.9, Privileged Cont 1.4 | 11.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
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

- **parent** CPU ms by thread group: main 7, IPC I/O 1, Socket 1, other 0, ImageIO 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, BgPool 0, DOM Worker 0, ImageBridge 0, SwComposite 0
  - main thread 7 ms (0.4% of span): JavaScript 3, Idle 3, DOM 1, Other 0
  - JS leaf 1 / native under JS 3 / native 3; buckets: ipc 7, harness_diagnostics 4, gc_cc 4, poll_wait 3, array_buffer_copy 2, json_metadata 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 3; `replacer (chrome://remote/content/marionette/message.sys.mjs` 1; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 1; `[axiosozo-dev]` 1; `ReservedWordInfo const* FindReservedWord<char16_t>(char16_t ` 1; `XPCCallContext::SetName(JS::PropertyKey) [libxul.so]` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `sched_yield [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3114** CPU ms by thread group: main 25, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (1.2% of span): Idle 15, GC / CC 5, JavaScript 4, Other 1, Layout 1, Profiler 0
  - JS leaf 0 / native under JS 3 / native 22; buckets: ipc 24, poll_wait 15, gc_cc 7, harness_diagnostics 3, paint_layout 2, array_buffer_copy 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 15; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `JS::Compartment::findSweepGroupEdges() [libxul.so]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Handle<JSObj` 1; `js::jit::DoLazyConstantFallback(JSContext*, js::jit::Baselin` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3186** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3141** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 185, WRRenderBackend 78, main 67, WRSceneBuilder 58, SwComposite 52, Compositor 44, IPC I/O 11, other 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 67 ms (2.2% of span): GC / CC 32, Idle 26, JavaScript 4, Other 2, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 4 / native 63; buckets: ipc 67, gc_cc 34, poll_wait 28, harness_diagnostics 4, paint_layout 3, array_buffer_copy 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `mprotect [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 6× 27 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 185 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 21, `int blendTextureNearestFast<true, glsl::sampler2D_` 10); WRRenderBackend#0 78 ms (top self: `syscall [libc.so.6]` 65, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 53 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3114** CPU ms by thread group: main 240, IPC I/O 17, other 5, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 240 ms (7.8% of span): Idle 101, Graphics 48, Layout 47, Other 26, Profiler 6, GC / CC 5
  - JS leaf 0 / native under JS 12 / native 227; buckets: ipc 222, paint_layout 113, poll_wait 104, gc_cc 12, canvas_2d 8, subprocess_pipe_io 6, harness_diagnostics 4, webrender_render 3
  - top self: `poll [libc.so.6]` 100; `sendmsg [libc.so.6]` 6; `[]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 14 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3021** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3186** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimerEvent::Run() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 244, WRRenderBackend 76, WRSceneBuilder 59, main 52, Compositor 44, SwComposite 40, IPC I/O 10, other 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 52 ms (1.7% of span): GC / CC 31, Idle 15, JavaScript 6, Other 0, Graphics 0
  - JS leaf 0 / native under JS 5 / native 47; buckets: ipc 52, gc_cc 34, poll_wait 15, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 1, json_metadata 1, paint_layout 0
  - top self: `poll [libc.so.6]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 26 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 244 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 33, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 31); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 63, `sched_yield [libc.so.6]` 2, `webrender::invalidation::quadtree::TileNode::updat` 1); WRSceneBuilder#0 54 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3114** CPU ms by thread group: main 214, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 214 ms (7.1% of span): Idle 92, Graphics 57, Layout 37, Other 15, Profiler 7, DOM 5
  - JS leaf 0 / native under JS 8 / native 206; buckets: ipc 201, paint_layout 110, poll_wait 94, subprocess_pipe_io 5, canvas_2d 4, memcpy_memset 2, mozafterpaint_events 1, gc_cc 1
  - top self: `poll [libc.so.6]` 92; `[]` 6; `sendmsg [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3000** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3141** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 948, main 346, DOM Worker 275, WRRenderBackend 87, SwComposite 81, Compositor 30, WRSceneBuilder 23, Socket 9, IPC I/O 7, BgPool 2, other 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 346 ms (16.9% of span): Idle 104, JavaScript 85, DOM 76, Other 43, Graphics 14, Layout 9
  - JS leaf 15 / native under JS 127 / native 204; buckets: ipc 346, poll_wait 156, gc_cc 147, array_buffer_copy 62, paint_layout 22, memcpy_memset 17, worker_messaging 6, json_metadata 4
  - top self: `poll [libc.so.6]` 107; `__memmove_avx512_unaligned_erms [libc.so.6]` 12; `[unknown]` 11; `validate (chrome://global/content/third_party/cfworker/json-` 8; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 6; `read [libc.so.6]` 6
  - GC/CC markers: GCMinor 5× 7 ms
  - WebRender/compositor threads: Renderer 948 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 306, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 144, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 70); WRRenderBackend#0 87 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 4, `webrender::prepare::prepare_prim_for_render [libxu` 2); SwComposite 81 ms (top self: `syscall [libc.so.6]` 76, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `[libfreeblpriv3.so]` 0); BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `rename [libc.so.6]` 0, `fsync [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 275 ms: buckets worker_messaging 275, ipc 275, gc_cc 70, poll_wait 61, array_buffer_copy 37, memcpy_memset 9; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 57; `[unknown]` 30; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 15; `js::gc::TenuringTracer::onStringEdge(JSString**, c` 15; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 13
- **tab:3114** CPU ms by thread group: main 112, IPC I/O 17, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 112 ms (5.5% of span): Idle 82, Graphics 12, JavaScript 7, Other 6, Layout 2, Profiler 2
  - JS leaf 0 / native under JS 7 / native 105; buckets: ipc 109, poll_wait 82, paint_layout 20, gc_cc 3, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 82; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 2; `[]` 1; `mozilla::AppShutdown::IsShutdownImpending() [libxul.so]` 1; `sendmsg [libc.so.6]` 1; `mozilla::dom::FontFaceSetImpl::CheckLoadingFinished() [libxu` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3039** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2947** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 442, DOM Worker 197, Renderer 26, WRRenderBackend 22, Compositor 19, WRSceneBuilder 14, Socket 14, SwComposite 8, IPC I/O 6, BgPool 6, other 2, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 442 ms (11.7% of span): Idle 96, JavaScript 85, GC / CC 74, Other 65, DOM 45, Layout 29
  - JS leaf 10 / native under JS 114 / native 317; buckets: ipc 442, gc_cc 178, poll_wait 137, paint_layout 60, array_buffer_copy 29, memcpy_memset 11, worker_messaging 10, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 106; `[unknown]` 13; `recvmsg [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[axiosozo-dev]` 7; `__memmove_avx512_unaligned_erms [libc.so.6]` 6
  - GC/CC markers: GCMajor 1× 80 ms, GCSlice 19× 35 ms, CCSlice 2× 21 ms, GCMinor 2× 9 ms
  - WebRender/compositor threads: Renderer 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `int blendTextureNearestFast<true, glsl::sampler2D_` 1); WRRenderBackend#0 22 ms (top self: `syscall [libc.so.6]` 17, `sched_yield [libc.so.6]` 1, `webrender::spatial_tree::SpatialTree::get_world_tr` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 9, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `<base64::engine::general_purpose::GeneralPurpose a` 1, `__memcmp_evex_movbe [libc.so.6]` 0); BgIOThreadPool #3 2 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 194 ms: buckets worker_messaging 194, ipc 194, gc_cc 81, poll_wait 29, array_buffer_copy 11, memcpy_memset 6; top self: `[unknown]` 31; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28; `jsesc (resource://gre/modules/third_party/jsesc/js` 17; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 14; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 13
- **tab:3114** CPU ms by thread group: main 65, IPC I/O 6, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 65 ms (1.7% of span): Idle 25, GC / CC 11, Layout 10, Other 9, JavaScript 3, Profiler 3
  - JS leaf 0 / native under JS 4 / native 62; buckets: ipc 60, poll_wait 27, paint_layout 18, gc_cc 13, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 26; `sendmsg [libc.so.6]` 3; `[]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `JS::loader::ScriptLoadRequest::~ScriptLoadRequest() [libxul.` 1; `mozilla::RangeBoundaryBase<nsINode*, nsIContent*>::RangeBoun` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2947** CPU ms by thread group: main 8, IPC I/O 3, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 7, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, poll_wait 7, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 7; `[linux-vdso.so.1]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `JS_HasPropertyById(JSContext*, JS::Handle<JSObject*>, JS::Ha` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3039** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4
  - top self: `poll [libc.so.6]` 4; `nsJSContext::MaybePokeCC() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

