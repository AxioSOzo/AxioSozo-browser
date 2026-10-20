# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

