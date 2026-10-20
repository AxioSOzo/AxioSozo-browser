# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **4.5** (main 2.0, TaskCon~ller # 1.0, Renderer 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.2 | **15.6** (Renderer 7.6, WRRende~ckend# 1.7, glean.dispatche 1.3, Compositor 1.3, WRScene~ilder# 1.0) | Isolated Web Co 3.9 | — | — |
| plain | raf-nosampler | — | — | **16.2** (Renderer 8.0, WRRende~ckend# 1.7, main 1.3, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 3.7 | — | — |
| plain | scroll | 59.0 | 17.2 | **39.2** (Renderer 24.7, main 5.0, WRRende~ckend# 3.0, glean.dispatche 1.5, SwComposite 1.5) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **62.1** (main 16.6, DOM Worker 15.0, Indexed~ IO # 13.7, IPDL Background 6.2, TaskCon~ller # 2.7) | Isolated Web Co 1.4 | 7.5 | — |
| plain | idle | 59.0 | 17.2 | **4.5** (main 2.0, TaskCon~ller # 1.0, Renderer 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.2 | **15.6** (Renderer 7.6, WRRende~ckend# 1.7, glean.dispatche 1.3, Compositor 1.3, WRScene~ilder# 1.0) | Isolated Web Co 3.9 | — | — |
| plain | raf-nosampler | — | — | **16.2** (Renderer 8.0, WRRende~ckend# 1.7, main 1.3, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 3.7 | — | — |
| plain | scroll | 59.0 | 17.2 | **39.2** (Renderer 24.7, main 5.0, WRRende~ckend# 3.0, glean.dispatche 1.5, SwComposite 1.5) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **62.1** (main 16.6, DOM Worker 15.0, Indexed~ IO # 13.7, IPDL Background 6.2, TaskCon~ller # 2.7) | Isolated Web Co 1.4 | 7.5 | — |
| profile | idle | 59.5 | 17.1 | **10.5** (SamplerThread 3.0, DOM Worker 2.5, main 2.0, TaskCon~ller # 2.0, Socket Thread 0.5) | Web Content 4.9, Isolated Web Co 2.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **24.3** (Renderer 9.9, SamplerThread 4.6, WRRende~ckend# 2.3, WRScene~ilder# 2.0, Compositor 1.6) | Isolated Web Co 8.6, Web Content 6.3, Privileged Cont 1.3, Socket Process 1.0 | — | — |
| profile | raf-nosampler | — | — | **26.9** (Renderer 10.0, SamplerThread 4.7, main 2.0, WRRende~ckend# 2.0, Compositor 2.0) | Isolated Web Co 7.7, Web Content 5.0, Socket Process 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **53.7** (Renderer 28.2, SamplerThread 7.0, main 6.0, WRRende~ckend# 3.5, SwComposite 2.5) | Isolated Web Co 8.5, Web Content 5.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **13.7** (main 5.6, SamplerThread 3.8, Renderer 1.1, WRScene~ilder# 0.8, glean.dispatche 0.5) | Web Content 5.4, Isolated Web Co 3.8, WebExtensions 1.6, Privileged Cont 1.1 | 9.5 | — |

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

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: main 49, DOM Worker 43, Compositor 2, IPC I/O 1, Socket 1, Renderer 1, SwComposite 0, other 0, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 49 ms (2.4% of span): GC / CC 31, JavaScript 7, Idle 6, Other 4, Profiler 1
  - JS leaf 0 / native under JS 7 / native 43; buckets: ipc 48, gc_cc 35, poll_wait 8, harness_diagnostics 5, array_buffer_copy 2, subprocess_pipe_io 2, json_metadata 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `[axiosozo-dev]` 2; `mprotect [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 7× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `mozilla::layers::AsyncPanZoomController::GetCurren` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 40 ms: buckets worker_messaging 39, ipc 39, gc_cc 39, memcpy_memset 14, poll_wait 2; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 14; `madvise [libc.so.6]` 10; `__syscall_cancel_arch [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionPa` 1
- **tab:8434** CPU ms by thread group: main 17, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 17 ms (0.8% of span): Idle 12, JavaScript 3, Profiler 1, Other 0, Layout 0, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 13; buckets: ipc 16, poll_wait 12, harness_diagnostics 3, gc_cc 2, array_buffer_copy 2, paint_layout 1, memcpy_memset 1, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `__memset_evex_unaligned_erms [libc.so.6]` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Handle<JSObj` 1; `js::frontend::BytecodeEmitter::newSrcNote(js::SrcNoteType, u` 1; `js::jit::CacheIRWriter::loadInt32Constant(unsigned int) [lib` 1; `bool js::gc::UnmarkGrayTracer<8u>::onChild<JSObject>(JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8522** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8526** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 276, WRRenderBackend 59, WRSceneBuilder 48, Compositor 41, main 26, SwComposite 20, IPC I/O 9, other 1, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 26 ms (0.9% of span): Idle 20, JavaScript 2, Graphics 2, Layout 1, Other 1
  - JS leaf 1 / native under JS 1 / native 24; buckets: ipc 26, poll_wait 20, paint_layout 3, harness_diagnostics 2, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 20; `mozilla::EffectCompositor::GetAnimationElementAndPseudoForFr` 1; `mprotect [libc.so.6]` 1; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, ns` 1; `TransformGfxRectToAncestor(mozilla::RelativeTo, mozilla::gfx` 1; `#execute (chrome://remote/content/marionette/driver.sys.mjs:` 1
  - WebRender/compositor threads: Renderer 276 ms (top self: `__syscall_cancel_arch [libc.so.6]` 91, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 56, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 29); WRRenderBackend#0 59 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); WRSceneBuilder#0 43 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8434** CPU ms by thread group: main 154, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 154 ms (5.1% of span): Idle 100, Graphics 14, Layout 14, Other 12, GC / CC 6, JavaScript 3
  - JS leaf 0 / native under JS 6 / native 149; buckets: ipc 147, poll_wait 101, paint_layout 37, gc_cc 9, array_buffer_copy 3, harness_diagnostics 2, canvas_2d 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 108; `[]` 3; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `style::parallel::style_trees [libxul.so]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `mozilla::dom::XrayResolveProperty(JSContext*, JS::Handle<JSO` 1
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8364** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 288, WRRenderBackend 58, WRSceneBuilder 48, main 46, Compositor 40, SwComposite 14, IPC I/O 9, DOM Worker 6, other 1, Socket 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 45 ms (1.5% of span): GC / CC 29, Idle 12, JavaScript 2, Other 2
  - JS leaf 0 / native under JS 2 / native 43; buckets: ipc 45, gc_cc 30, poll_wait 14, harness_diagnostics 2, array_buffer_copy 1, subprocess_pipe_io 0, mozafterpaint_events 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScr` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `nsWindowRoot::cycleCollection::TraceWrapper(void*, TraceCall` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 288 ms (top self: `__syscall_cancel_arch [libc.so.6]` 87, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 69, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 29); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 49, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1); WRSceneBuilder#0 43 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8434** CPU ms by thread group: main 145, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 145 ms (4.8% of span): Idle 101, Layout 13, Graphics 12, Other 9, Profiler 5, GC / CC 4
  - JS leaf 0 / native under JS 3 / native 142; buckets: ipc 137, poll_wait 102, paint_layout 30, gc_cc 4, canvas_2d 1, subprocess_pipe_io 1, memcpy_memset 0, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 104; `[]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1; `nsFont::CalcDifference(nsFont const&) const [libxul.so]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 6× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8364** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 542, main 114, WRRenderBackend 63, SwComposite 42, Compositor 28, WRSceneBuilder 22, IPC I/O 7, Socket 1, other 1, DOM Worker 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 114 ms (5.7% of span): Idle 62, GC / CC 25, Other 13, Graphics 7, JavaScript 4, DOM 2
  - JS leaf 0 / native under JS 4 / native 111; buckets: ipc 113, poll_wait 76, gc_cc 28, paint_layout 9, array_buffer_copy 3, harness_diagnostics 3, subprocess_pipe_io 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 68; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `bool mozilla::detail::HashTable<char const* const, mozilla::` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 8× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 542 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 169, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 78, `__syscall_cancel_arch [libc.so.6]` 53); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1); SwComposite 42 ms (top self: `syscall [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 4)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `[axiosozo-dev]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8434** CPU ms by thread group: main 92, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 92 ms (4.6% of span): Idle 62, Graphics 9, GC / CC 9, Other 8, JavaScript 3, Layout 2
  - JS leaf 0 / native under JS 4 / native 89; buckets: ipc 90, poll_wait 64, paint_layout 13, gc_cc 9, harness_diagnostics 3, array_buffer_copy 2, canvas_2d 1, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 64; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeB` 1
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 4× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8461** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8384** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 195, Renderer 38, WRRenderBackend 19, Compositor 17, WRSceneBuilder 14, IPC I/O 8, SwComposite 6, other 2, BgPool 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 195 ms (5.2% of span): Idle 45, Layout 38, GC / CC 31, Other 23, JavaScript 22, Graphics 20
  - JS leaf 3 / native under JS 31 / native 161; buckets: ipc 195, poll_wait 67, paint_layout 63, gc_cc 42, array_buffer_copy 6, subprocess_pipe_io 6, harness_diagnostics 6, memcpy_memset 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 4; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 38 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::request [l` 1); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8434** CPU ms by thread group: main 63, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 63 ms (1.7% of span): Idle 23, Layout 9, Other 9, GC / CC 8, JavaScript 7, Profiler 3
  - JS leaf 0 / native under JS 9 / native 54; buckets: ipc 57, poll_wait 24, paint_layout 13, gc_cc 10, harness_diagnostics 5, array_buffer_copy 2, memcpy_memset 1, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 25; `[]` 3; `[unknown]` 2; `js::GetProperty(JSContext*, JS::Handle<JSObject*>, JS::Handl` 1; `pthread_mutexattr_init@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8293** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libglib-2.0.so.0]` 0; `mozilla::dom::CallSetup::GetActiveGlobalObjectForCall(JS::Ha` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 0; `mozilla::dom::JSIPCValueUtils::ToJSVal(JSContext*, mozilla::` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

