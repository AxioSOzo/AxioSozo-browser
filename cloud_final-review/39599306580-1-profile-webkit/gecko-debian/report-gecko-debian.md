# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.5 | 17.2 | **7.3** (Renderer 3.4, main 2.4, WRRende~ckend# 0.5, Compositor 0.5, DOM Worker 0.5) | Web Content 3.9, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **30.2** (Renderer 17.0, WRRende~ckend# 2.6, main 2.0, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.9, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **21.9** (Renderer 10.3, WRRende~ckend# 2.3, main 1.7, glean.dispatche 1.7, WRScene~ilder# 1.7) | Isolated Web Co 4.7, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **46.5** (Renderer 30.1, main 5.4, WRRende~ckend# 3.5, WRScene~ilder# 1.5, Compositor 1.5) | Isolated Web Co 5.0 | — | — |
| plain | key | — | — | **8.3** (main 4.8, Renderer 0.8, WRRende~ckend# 0.8, TaskCon~ller # 0.5, Compositor 0.5) | Isolated Web Co 1.6, Web Content 0.3 | 9.5 | — |
| trace | idle | 59.3 | 17.1 | **6.9** (main 2.9, TaskCon~ller # 1.5, Softwar~cThread 1.0, Timer 0.5, IPDL Background 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **19.2** (Renderer 10.1, WRRende~ckend# 2.3, glean.dispatche 1.6, WRScene~ilder# 1.6, Compositor 1.3) | Isolated Web Co 4.2, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **20.6** (Renderer 10.3, WRRende~ckend# 2.3, glean.dispatche 1.7, WRScene~ilder# 1.7, main 1.3) | Isolated Web Co 5.0, Privileged Cont 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **48.6** (Renderer 30.2, main 6.4, WRRende~ckend# 3.5, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 5.0 | — | — |
| trace | key | — | — | **66.4** (main 19.2, DOM Worker 18.1, IndexedDB IO # 14.1, IPDL Background 6.4, TaskCon~ller # 2.7) | Isolated Web Co 1.9, WebExtensions 0.3, RDD Process 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **10.1** (SamplerThread 4.8, main 2.9, TaskCon~ller # 1.9, IPDL Background 0.5) | Web Content 7.2, Isolated Web Co 5.3, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **33.5** (Renderer 12.4, SamplerThread 6.5, WRRende~ckend# 2.9, main 2.6, Compositor 2.0) | Isolated Web Co 11.4, Web Content 6.8, WebExtensions 2.0, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **30.0** (Renderer 12.6, SamplerThread 6.3, WRRende~ckend# 3.0, Compositor 2.0, glean.dispatche 1.7) | Isolated Web Co 11.3, Web Content 6.6, WebExtensions 1.7, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.2 | **66.5** (Renderer 34.2, main 8.3, SamplerThread 8.3, WRRende~ckend# 4.9, Compositor 2.4) | Isolated Web Co 11.2, Web Content 8.3, Socket Process 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **15.7** (main 5.9, SamplerThread 4.5, Renderer 1.1, TaskCon~ller # 0.8, glean.dispatche 0.5) | Web Content 6.9, Isolated Web Co 4.3, Privileged Cont 2.2, WebExtensions 1.9 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 54, DOM Worker 2, Compositor 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (2.6% of span): GC / CC 30, Other 8, Idle 7, JavaScript 6, DOM 2, Graphics 1
  - JS leaf 1 / native under JS 7 / native 46; buckets: ipc 53, gc_cc 36, poll_wait 12, harness_diagnostics 5, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 2, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `mprotect [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 25 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #4 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0; `__lll_lock_wake [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 37, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (1.8% of span): Idle 25, GC / CC 6, JavaScript 4, Profiler 1, Other 1, DOM 0
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 35, poll_wait 24, gc_cc 8, harness_diagnostics 4, array_buffer_copy 2, paint_layout 1, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 24; `[]` 1; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8507** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8461** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 354, WRRenderBackend 81, main 72, WRSceneBuilder 60, Compositor 52, SwComposite 22, IPC I/O 13, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 72 ms (2.3% of span): GC / CC 34, Idle 25, JavaScript 7, Other 3, Layout 3
  - JS leaf 0 / native under JS 7 / native 65; buckets: ipc 72, gc_cc 40, poll_wait 27, harness_diagnostics 5, paint_layout 3, subprocess_pipe_io 2, array_buffer_copy 1, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `[axiosozo-dev]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `syscall [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 61 ms, GCSlice 6× 27 ms, CCSlice 1× 8 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 353 ms (top self: `__syscall_cancel_arch [libc.so.6]` 101, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 68, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 49); WRRenderBackend#0 81 ms (top self: `syscall [libc.so.6]` 62, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 54 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >` 0; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 212, IPC I/O 20, other 5, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 212 ms (6.8% of span): Idle 104, Graphics 36, Layout 27, Other 23, Profiler 14, JavaScript 6
  - JS leaf 1 / native under JS 12 / native 198; buckets: ipc 199, poll_wait 107, paint_layout 89, gc_cc 5, harness_diagnostics 4, memcpy_memset 4, canvas_2d 3, array_buffer_copy 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 115; `[]` 5; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2; `getcontext [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8358** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8331** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 354, WRRenderBackend 75, WRSceneBuilder 59, Compositor 50, main 17, SwComposite 16, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 17 ms (0.6% of span): Idle 13, JavaScript 3, Graphics 0, Other 0
  - JS leaf 0 / native under JS 3 / native 14; buckets: ipc 17, poll_wait 14, harness_diagnostics 3, array_buffer_copy 2, gc_cc 2, subprocess_pipe_io 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::frontend::RecyclableNameMap<unsigned int>* js::frontend:` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 1; `mozilla::RetainedDisplayListBuilder::PreProcessDisplayList(m` 0; `[linux-vdso.so.1]` 0
  - WebRender/compositor threads: Renderer 354 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 95, `__syscall_cancel_arch [libc.so.6]` 88, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 40); WRRenderBackend#0 75 ms (top self: `syscall [libc.so.6]` 63, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 2); WRSceneBuilder#0 52 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::gc::GCRuntime::endSweepingSweepGroup(JS::GCCon` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 199, IPC I/O 19, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 199 ms (6.6% of span): Idle 98, Graphics 34, Layout 32, Other 14, Profiler 12, GC / CC 7
  - JS leaf 0 / native under JS 7 / native 192; buckets: ipc 184, poll_wait 99, paint_layout 78, gc_cc 8, memcpy_memset 5, canvas_2d 2, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 5; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[linux-vdso.so.1]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 3
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 6× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8461** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8503** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 685, main 162, WRRenderBackend 85, SwComposite 44, Compositor 34, WRSceneBuilder 26, IPC I/O 10, Socket 1, other 1, BgPool 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 162 ms (7.9% of span): Idle 78, GC / CC 36, Other 18, Graphics 11, JavaScript 9, DOM 7
  - JS leaf 1 / native under JS 9 / native 152; buckets: ipc 158, poll_wait 100, gc_cc 42, paint_layout 15, harness_diagnostics 5, memcpy_memset 3, array_buffer_copy 2, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 80; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `nsWindowRoot::cycleCollection::TraceWrapper(void*, TraceCall` 5; `[linux-vdso.so.1]` 5; `[axiosozo-dev]` 3
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 8× 28 ms, CCSlice 1× 8 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 685 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 215, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 104, `__syscall_cancel_arch [libc.so.6]` 64); WRRenderBackend#0 85 ms (top self: `syscall [libc.so.6]` 58, `webrender::prepare::prepare_prim_for_render [libxu` 3, `sched_yield [libc.so.6]` 3); SwComposite 44 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `void js::gc::ArenaLists::backgroundFinalize<(js::g` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 122, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 122 ms (5.9% of span): Idle 72, Graphics 22, Other 11, GC / CC 7, JavaScript 4, Layout 3
  - JS leaf 0 / native under JS 4 / native 118; buckets: ipc 116, poll_wait 75, paint_layout 28, gc_cc 9, harness_diagnostics 4, canvas_2d 2, array_buffer_copy 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 75; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 4; `[]` 2; `webrender_api::display_list::AuGrid::rect [libxul.so]` 1; `wr_dp_push_text [libxul.so]` 1; `nsTimer::Cancel() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 5 ms, GCSlice 5× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8358** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8507** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 219, Renderer 37, WRRenderBackend 21, Compositor 19, WRSceneBuilder 15, IPC I/O 10, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 219 ms (5.8% of span): Layout 49, Idle 38, GC / CC 38, Other 31, JavaScript 27, Graphics 23
  - JS leaf 4 / native under JS 29 / native 187; buckets: ipc 218, paint_layout 75, poll_wait 70, gc_cc 50, subprocess_pipe_io 14, array_buffer_copy 6, harness_diagnostics 5, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[axiosozo-dev]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 5; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 37 ms, GCSlice 6× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 37 ms (top self: `__syscall_cancel_arch [libc.so.6]` 23, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `syscall [libc.so.6]` 2); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 18, `sched_yield [libc.so.6]` 1, `webrender::tile_cache::TileCacheInstance::update_p` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 2, `[linux-vdso.so.1]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8417** CPU ms by thread group: main 69, IPC I/O 7, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (1.8% of span): Idle 22, Other 11, JavaScript 9, GC / CC 9, Graphics 7, Layout 5
  - JS leaf 1 / native under JS 8 / native 59; buckets: ipc 61, poll_wait 23, paint_layout 15, gc_cc 14, harness_diagnostics 5, array_buffer_copy 2, subprocess_pipe_io 1, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 25; `[]` 2; `[linux-vdso.so.1]` 2; `js::jit::CheckPrivateFieldIRGenerator::tryAttachStub() [libx` 1; `void nsPurpleBuffer::VisitEntries<RemoveSkippableVisitor>(Re` 1; `nsWindowRoot::AddRef() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 4× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8256** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `js::gc::StoreBuffer::putSlot(js::NativeObject*, int, unsigne` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozill` 0; `[unknown]` 0; `mozilla::dom::AutoJSAPI::Init(nsIGlobalObject*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8331** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

