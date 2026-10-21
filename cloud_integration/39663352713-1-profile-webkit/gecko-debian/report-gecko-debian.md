# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.1 | **5.5** (main 2.0, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **26.8** (Renderer 15.7, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.3) | Isolated Web Co 4.2, WebExtensions 0.7, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.7** (Renderer 10.0, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, main 1.3) | Isolated Web Co 4.4, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **43.8** (Renderer 28.8, main 5.0, WRRende~ckend# 4.0, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 5.5, Web Content 0.5 | — | — |
| plain | key | — | — | **9.6** (main 4.5, Renderer 0.8, Compositor 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5) | Isolated Web Co 1.3, WebExtensions 0.3 | 9.0 | — |
| trace | idle | 59.3 | 17.2 | **5.4** (main 2.4, TaskCon~ller # 1.0, Renderer 1.0, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **17.2** (Renderer 8.9, glean.dispatche 2.0, WRRende~ckend# 2.0, WRScene~ilder# 1.0, Compositor 1.0) | Isolated Web Co 4.0 | — | — |
| trace | raf-nosampler | — | — | **19.5** (Renderer 9.3, glean.dispatche 2.0, WRRende~ckend# 2.0, WRScene~ilder# 1.7, main 1.3) | Isolated Web Co 4.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **42.8** (Renderer 27.8, main 5.5, WRRende~ckend# 3.0, Compositor 1.5, SwComposite 1.5) | Isolated Web Co 4.0, Web Content 0.5, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **60.8** (DOM Worker 18.5, main 18.2, IndexedDB IO # 8.0, IPDL Background 6.4, TaskCon~ller # 2.4) | Isolated Web Co 1.4, WebExtensions 0.3, Privileged Cont 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.1 | **9.2** (SamplerThread 3.9, main 2.4, TaskCon~ller # 1.9, IPC I/O Parent 0.5, IPDL Background 0.5) | Web Content 11.2, Isolated Web Co 3.9, Privileged Cont 1.9, Socket Process 1.5 | — | — |
| profile | raf | 59.0 | 17.2 | **28.1** (Renderer 11.1, SamplerThread 5.6, WRRende~ckend# 2.3, Compositor 2.0, WRScene~ilder# 1.6) | Isolated Web Co 9.2, Web Content 8.2, Socket Process 1.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **26.8** (Renderer 10.6, SamplerThread 6.0, WRRende~ckend# 2.3, main 1.7, WRScene~ilder# 1.7) | Web Content 9.3, Isolated Web Co 8.0, WebExtensions 1.7, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **60.9** (Renderer 31.1, SamplerThread 7.9, main 7.4, WRRende~ckend# 3.5, SwComposite 2.5) | Web Content 9.4, Isolated Web Co 8.9, WebExtensions 2.0, Socket Process 1.5 | — | — |
| profile | key | — | — | **14.0** (main 5.3, SamplerThread 4.3, TaskCon~ller # 0.8, Renderer 0.8, WRScene~ilder# 0.5) | Web Content 8.0, Isolated Web Co 3.4, WebExtensions 1.6, Privileged Cont 1.6 | 11.5 | — |

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

- **parent** CPU ms by thread group: main 50, Compositor 2, DOM Worker 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.4% of span): GC / CC 29, Idle 8, Other 6, JavaScript 6, Layout 0
  - JS leaf 0 / native under JS 5 / native 45; buckets: ipc 50, gc_cc 32, poll_wait 12, harness_diagnostics 3, paint_layout 1, array_buffer_copy 1, memcpy_memset 0, subprocess_pipe_io 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `syscall [libc.so.6]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 7× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 0; top self: `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Va` 1; `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::dom::ProtoAndIfaceCache::PageTableCache::` 0
- **tab:8404** CPU ms by thread group: main 26, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (1.2% of span): Idle 17, GC / CC 4, JavaScript 4, Other 1, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 2 / native 24; buckets: ipc 23, poll_wait 19, gc_cc 5, array_buffer_copy 2, paint_layout 2, harness_diagnostics 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 19; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 1; `js::GlobalObject::getSelfHostedFunction(JSContext*, JS::Hand` 1; `js::jit::X86Encoding::BaseAssembler::cmpl_im(int, int, js::j` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8325** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8410** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 313, WRRenderBackend 64, WRSceneBuilder 51, Compositor 43, main 28, SwComposite 18, IPC I/O 10, DOM Worker 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (0.9% of span): Idle 20, Layout 3, JavaScript 3, Other 2, Graphics 1, DOM 0
  - JS leaf 0 / native under JS 3 / native 25; buckets: ipc 29, poll_wait 20, paint_layout 4, gc_cc 2, harness_diagnostics 2, memcpy_memset 0, subprocess_pipe_io 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 20; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 3; `mozilla::SimpleTaskQueue::DrainTasks() [libxul.so]` 1; `[unknown]` 1; `bool CommonIterPromiseCombinator<bool (*)(JSContext*, Promis` 1; `mozilla::nsDisplayList::AppendToTop(mozilla::nsDisplayItem*)` 1
  - WebRender/compositor threads: Renderer 313 ms (top self: `__syscall_cancel_arch [libc.so.6]` 102, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 56, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 53); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 4, `[linux-vdso.so.1]` 0); WRSceneBuilder#0 45 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 1, poll_wait 1; top self: `mozilla::CaptureTask::PrincipalChanged(mozilla::do` 2; `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8404** CPU ms by thread group: main 157, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 157 ms (5.1% of span): Idle 98, Graphics 19, Layout 16, Other 11, Profiler 7, JavaScript 4
  - JS leaf 0 / native under JS 9 / native 148; buckets: ipc 150, poll_wait 103, paint_layout 42, gc_cc 4, harness_diagnostics 3, subprocess_pipe_io 3, memcpy_memset 2, canvas_2d 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[libglib-2.0.so.0]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8344** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 304, WRRenderBackend 55, WRSceneBuilder 46, main 46, Compositor 41, SwComposite 12, IPC I/O 10, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 46 ms (1.5% of span): GC / CC 30, Idle 9, Other 4, JavaScript 2, Graphics 1
  - JS leaf 0 / native under JS 2 / native 44; buckets: ipc 46, gc_cc 33, poll_wait 10, harness_diagnostics 2, array_buffer_copy 2, paint_layout 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onShapeE` 5; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3; `__lll_lock_wait [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCSlice 6× 26 ms, CCSlice 1× 6 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 304 ms (top self: `__syscall_cancel_arch [libc.so.6]` 97, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 71, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 33); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 6, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 40 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8404** CPU ms by thread group: main 128, IPC I/O 15, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 128 ms (4.2% of span): Idle 93, Graphics 13, Layout 7, Profiler 7, Other 6, DOM 1
  - JS leaf 0 / native under JS 4 / native 124; buckets: ipc 122, poll_wait 93, paint_layout 29, gc_cc 1, subprocess_pipe_io 1, memcpy_memset 1, canvas_2d 0, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 97; `[]` 4; `getcontext [libc.so.6]` 1; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, un` 1; `__lll_lock_wait [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8303** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 614, main 128, WRRenderBackend 67, SwComposite 33, Compositor 28, WRSceneBuilder 22, IPC I/O 8, BgPool 1, other 1, DOM Worker 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 128 ms (6.3% of span): Idle 64, GC / CC 37, Other 11, Graphics 7, JavaScript 4, Layout 3
  - JS leaf 1 / native under JS 4 / native 123; buckets: ipc 127, poll_wait 79, gc_cc 38, paint_layout 10, array_buffer_copy 3, harness_diagnostics 3, memcpy_memset 1, subprocess_pipe_io 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 69; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 2; `[libgobject-2.0.so.0]` 1
  - GC/CC markers: GCMajor 1× 60 ms, GCSlice 7× 27 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 614 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 201, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 89, `__syscall_cancel_arch [libc.so.6]` 53); WRRenderBackend#0 67 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 2); SwComposite 33 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8404** CPU ms by thread group: main 90, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 90 ms (4.4% of span): Idle 59, Other 10, Graphics 9, GC / CC 5, Layout 3, JavaScript 3
  - JS leaf 0 / native under JS 3 / native 88; buckets: ipc 86, poll_wait 59, paint_layout 14, gc_cc 7, harness_diagnostics 3, canvas_2d 2, array_buffer_copy 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 61; `[]` 2; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libx` 2; `[linux-vdso.so.1]` 1; `js::jit::CacheIRCompiler::emitGuardToObject(js::jit::ValOper` 1; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 15 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8325** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8303** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 196, Renderer 34, WRRenderBackend 17, Compositor 16, WRSceneBuilder 13, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 196 ms (5.2% of span): Layout 41, Idle 41, GC / CC 33, JavaScript 27, Graphics 22, Other 22
  - JS leaf 4 / native under JS 32 / native 160; buckets: ipc 196, paint_layout 64, poll_wait 61, gc_cc 51, memcpy_memset 7, harness_diagnostics 6, subprocess_pipe_io 5, array_buffer_copy 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `mprotect [libc.so.6]` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `[axiosozo-dev]` 4; `nsFlexContainerFrame::ReflowChildren(mozilla::ReflowInput co` 3
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 6× 29 ms, CCSlice 2× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__syscall_cancel_arch [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 2, `mozilla::layers::FrameMetrics::operator==(mozilla:` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8404** CPU ms by thread group: main 50, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (1.3% of span): Idle 20, Other 10, Layout 8, Graphics 5, Profiler 3, JavaScript 2
  - JS leaf 1 / native under JS 3 / native 46; buckets: ipc 47, poll_wait 20, paint_layout 15, gc_cc 3, array_buffer_copy 2, harness_diagnostics 2, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 22; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `nsGenericHTMLFormControlElement::GetAutocapitalize(nsTSubstr` 1; `getcontext [libc.so.6]` 1; `nsLayoutUtils::GetFramesForArea(mozilla::RelativeTo, nsRect ` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8249** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, gc_cc 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mo` 0; `js::UnwrapOneCheckedStatic(JSObject*) [libxul.so]` 0; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 0; `mozilla::dom::AutoEntryScript::AutoEntryScript(nsIGlobalObje` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

