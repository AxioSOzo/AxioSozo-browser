# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.2 | **8.8** (Renderer 2.9, main 2.4, DOM Worker 1.0, SwComposite 1.0, glean.dispatche 0.5) | Web Content 3.4, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **29.1** (Renderer 16.1, WRRende~ckend# 2.3, main 2.0, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.6, WebExtensions 0.7, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.9** (Renderer 9.3, WRRende~ckend# 2.0, main 1.7, glean.dispatche 1.7, WRScene~ilder# 1.3) | Isolated Web Co 3.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **42.8** (Renderer 28.3, main 4.5, WRRende~ckend# 3.5, glean.dispatche 2.0, SwComposite 1.5) | Isolated Web Co 4.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.1** (main 4.3, Renderer 1.1, TaskCon~ller # 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.3, WebExtensions 0.3 | 9.0 | — |
| trace | idle | 59.3 | 17.1 | **7.9** (main 2.4, TaskCon~ller # 1.5, glean.dispatche 1.0, Renderer 1.0, IPC I/O Parent 0.5) | Isolated Web Co 2.0 | — | — |
| trace | raf | 59.0 | 17.1 | **17.3** (Renderer 9.2, WRRende~ckend# 2.3, glean.dispatche 1.6, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 3.9 | — | — |
| trace | raf-nosampler | — | — | **20.7** (Renderer 10.0, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 4.4 | — | — |
| trace | scroll | 59.0 | 17.1 | **46.3** (Renderer 28.8, main 6.0, WRRende~ckend# 3.5, SwComposite 2.0, WRScene~ilder# 1.5) | Isolated Web Co 5.5 | — | — |
| trace | key | — | — | **51.4** (main 18.4, DOM Worker 16.5, IPDL Background 6.4, TaskCon~ller # 2.4, StreamTrans # 2.1) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **9.2** (SamplerThread 3.9, main 1.9, TaskCon~ller # 1.9, Timer 0.5, Socket Thread 0.5) | Web Content 10.2, Isolated Web Co 4.3, WebExtensions 2.4, Socket Process 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **29.8** (Renderer 11.1, SamplerThread 6.2, WRRende~ckend# 2.6, glean.dispatche 2.0, WRScene~ilder# 2.0) | Isolated Web Co 10.1, Web Content 8.5, Socket Process 1.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **28.3** (Renderer 11.3, SamplerThread 6.0, WRRende~ckend# 2.3, WRScene~ilder# 2.0, main 1.7) | Isolated Web Co 9.0, Web Content 8.0, Privileged Cont 1.7, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.2 | **63.8** (Renderer 33.1, main 8.4, SamplerThread 7.9, WRRende~ckend# 3.9, Compositor 2.5) | Isolated Web Co 10.4, Web Content 9.9, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **14.9** (main 5.3, SamplerThread 4.5, Renderer 1.1, Compositor 0.8, glean.dispatche 0.5) | Web Content 8.3, Isolated Web Co 4.1, WebExtensions 1.9, Privileged Cont 1.6 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 50, Compositor 2, DOM Worker 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.4% of span): GC / CC 29, Idle 7, Other 6, JavaScript 6, DOM 1, Graphics 1
  - JS leaf 0 / native under JS 7 / native 43; buckets: ipc 50, gc_cc 33, poll_wait 12, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 2, paint_layout 1, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `[axiosozo-dev]` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 7× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, poll_wait 1, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:8377** CPU ms by thread group: main 25, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (1.2% of span): Idle 15, GC / CC 6, JavaScript 3, Other 1, Layout 0, Profiler 0
  - JS leaf 1 / native under JS 2 / native 22; buckets: ipc 23, poll_wait 15, gc_cc 7, harness_diagnostics 3, memcpy_memset 1, array_buffer_copy 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 16; `[]` 2; `PLDHashTable::MakeEntryHandle(void const*) [libxul.so]` 1; `js::gc::TraceEdgeInternal(JSTracer*, js::TaggedProto*, char ` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(J` 1; `next (self-hosted:392:27)[2]` 1
  - GC/CC markers: GCMajor 1× 19 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8312** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8468** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 318, WRRenderBackend 66, WRSceneBuilder 54, Compositor 46, main 30, SwComposite 19, IPC I/O 12, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (1.0% of span): Idle 22, JavaScript 4, Layout 3, DOM 0, Other 0
  - JS leaf 0 / native under JS 3 / native 27; buckets: ipc 30, poll_wait 22, paint_layout 3, harness_diagnostics 3, array_buffer_copy 2, gc_cc 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 22; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo c` 1; `js::DefineFunctions(JSContext*, JS::Handle<JSObject*>, JSFun` 1; `nsFlexContainerFrame::FlexLine::AddLastItemToMainSizeTotals(` 1; `nsIWidget::NeedsPaint() [libxul.so]` 1; `IntrinsicSizeOffsets(nsIFrame*, int, bool) [libxul.so]` 1
  - WebRender/compositor threads: Renderer 318 ms (top self: `__syscall_cancel_arch [libc.so.6]` 85, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 55, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 52); WRRenderBackend#0 66 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 4, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 48 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 1, poll_wait 1; top self: `madvise [libc.so.6]` 1; `js::gc::ArenaLists::mergeBackgroundSweptArenas() [` 1; `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::AllocSpace<js::gc::SmallBufferRegion, 1638` 1; `munmap [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 168, IPC I/O 16, other 3, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 168 ms (5.5% of span): Idle 103, Graphics 25, Layout 17, Other 13, Profiler 5, JavaScript 4
  - JS leaf 0 / native under JS 8 / native 160; buckets: ipc 164, poll_wait 105, paint_layout 55, subprocess_pipe_io 4, canvas_2d 3, gc_cc 3, harness_diagnostics 3, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 111; `[]` 2; `peek_poke::poke_into_vec [libxul.so]` 1; `getcontext [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `__lll_lock_wait [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8465** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8312** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 318, WRRenderBackend 62, WRSceneBuilder 52, main 47, Compositor 44, SwComposite 13, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (1.5% of span): GC / CC 32, Idle 11, JavaScript 2, Other 1
  - JS leaf 0 / native under JS 2 / native 45; buckets: ipc 47, gc_cc 32, poll_wait 12, harness_diagnostics 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScr` 2
  - GC/CC markers: GCSlice 6× 27 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 317 ms (top self: `__syscall_cancel_arch [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 83, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 41); WRRenderBackend#0 62 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 45 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 4, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 152, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 152 ms (5.0% of span): Idle 94, Graphics 21, Layout 14, Other 9, Profiler 7, GC / CC 6
  - JS leaf 0 / native under JS 4 / native 148; buckets: ipc 144, poll_wait 95, paint_layout 43, gc_cc 7, subprocess_pipe_io 1, memcpy_memset 1, canvas_2d 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 98; `[]` 3; `getcontext [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8468** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8293** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 649, main 153, WRRenderBackend 80, SwComposite 39, Compositor 33, WRSceneBuilder 25, IPC I/O 9, BgPool 1, other 1, Socket 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 153 ms (7.5% of span): Idle 73, GC / CC 36, Other 19, Graphics 9, JavaScript 7, Layout 5
  - JS leaf 0 / native under JS 9 / native 144; buckets: ipc 153, poll_wait 101, gc_cc 40, paint_layout 14, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 82; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `[axiosozo-dev]` 3; `mozilla::dom::CallbackObject::cycleCollection::CanSkipReal(v` 3; `nsLayoutUtils::GetParentOrPlaceholderForCrossDoc(nsIFrame co` 2
  - GC/CC markers: GCMajor 1× 79 ms, GCSlice 7× 28 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 649 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 203, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 104, `__syscall_cancel_arch [libc.so.6]` 59); WRRenderBackend#0 80 ms (top self: `syscall [libc.so.6]` 54, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 3, `webrender::batch::BatchBuilder::add_prim_to_batch ` 2); SwComposite 39 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `Composite [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `access [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, memcpy_memset 1, gc_cc 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 110, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 110 ms (5.4% of span): Idle 65, Graphics 21, Other 9, GC / CC 7, JavaScript 3, Layout 3
  - JS leaf 0 / native under JS 4 / native 106; buckets: ipc 106, poll_wait 65, paint_layout 26, gc_cc 12, canvas_2d 4, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 66; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `[]` 1; `peek_poke::poke_into_vec [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8384** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8271** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 203, Renderer 35, Compositor 17, WRRenderBackend 17, WRSceneBuilder 14, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 203 ms (5.4% of span): Layout 47, Idle 44, GC / CC 31, Other 26, JavaScript 24, Graphics 24
  - JS leaf 1 / native under JS 28 / native 174; buckets: ipc 200, paint_layout 71, poll_wait 64, gc_cc 45, subprocess_pipe_io 8, array_buffer_copy 5, harness_diagnostics 4, memcpy_memset 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `[axiosozo-dev]` 5; `[unknown]` 3; `[linux-vdso.so.1]` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 25 ms, CCSlice 2× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 35 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `int blendTextureNearestFast<true, glsl::sampler2D_` 2); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 66, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 66 ms (1.8% of span): Idle 25, Other 8, GC / CC 8, JavaScript 7, Layout 6, DOM 5
  - JS leaf 0 / native under JS 7 / native 59; buckets: ipc 60, poll_wait 25, paint_layout 16, gc_cc 10, harness_diagnostics 4, array_buffer_copy 4, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 26; `[]` 5; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*,` 1; `js::LifoAlloc::release(js::LifoAlloc::Mark) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8211** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 0; `[]` 0; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8293** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

