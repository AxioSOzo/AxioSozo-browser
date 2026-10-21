# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **3.5** (main 1.5, DOM Worker 1.0, glean.dispatche 0.5, Renderer 0.5) | Web Content 2.9 | — | — |
| plain | raf | 59.0 | 17.1 | **12.6** (Renderer 6.9, main 1.0, glean.dispatche 1.0, TaskCon~ller # 1.0, WRRende~ckend# 1.0) | Isolated Web Co 1.6, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **11.1** (Renderer 5.0, main 1.0, WRScene~ilder# 1.0, WRRende~ckend# 1.0, glean.dispatche 0.7) | Isolated Web Co 2.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **21.1** (Renderer 15.1, main 2.0, WRRende~ckend# 1.5, glean.dispatche 1.0, Socket Thread 0.5) | Isolated Web Co 2.0, WebExtensions 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **4.6** (main 2.4, Renderer 0.5, WRScene~ilder# 0.5, TaskCon~ller # 0.3, Softwar~cThread 0.3) | Isolated Web Co 0.8, Web Content 0.3 | 7.5 | — |
| trace | idle | 59.0 | 17.1 | **4.0** (main 1.5, TaskCon~ller # 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Compositor 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **9.0** (Renderer 4.6, WRRende~ckend# 1.3, main 0.7, glean.dispatche 0.7, WRScene~ilder# 0.7) | Isolated Web Co 2.3 | — | — |
| trace | raf-nosampler | — | — | **9.9** (Renderer 4.3, main 1.0, glean.dispatche 1.0, WRScene~ilder# 1.0, WRRende~ckend# 1.0) | Isolated Web Co 2.3, Web Content 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **25.1** (Renderer 15.6, main 3.5, WRRende~ckend# 1.5, glean.dispatche 1.0, TaskCon~ller # 1.0) | Isolated Web Co 1.5 | — | — |
| trace | key | — | — | **38.8** (main 11.3, DOM Worker 9.4, IndexedDB IO # 8.6, IPDL Background 3.2, TaskCon~ller # 1.9) | Isolated Web Co 1.3, WebExtensions 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **2.0** (SamplerThread 2.0) | Web Content 5.4, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **18.7** (Renderer 5.3, SamplerThread 3.3, main 1.6, WRRende~ckend# 1.6, TaskCon~ller # 1.3) | Isolated Web Co 5.3, Web Content 4.6, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **13.3** (Renderer 5.0, SamplerThread 2.7, main 1.0, WRRende~ckend# 1.0, Compositor 1.0) | Web Content 4.3, Isolated Web Co 4.3, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **31.5** (Renderer 16.5, main 4.0, SamplerThread 3.5, WRRende~ckend# 2.0, TaskCon~ller # 1.5) | Web Content 4.5, Isolated Web Co 4.5, WebExtensions 1.0, Socket Process 0.5 | — | — |
| profile | key | — | — | **7.7** (SamplerThread 2.4, main 2.2, Renderer 0.5, WRRende~ckend# 0.5, glean.dispatche 0.3) | Web Content 4.1, Isolated Web Co 2.5, WebExtensions 1.1, Socket Process 0.8 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, other 0, BgPool 0, Renderer 0, WRWorker 0, WRRenderBackend 0, WRSceneBuilder 0, Canvas 0, Compositor 0, ImageIO 0, DOM Worker 0, ImageBridge 0, SwComposite 0
  - main thread 4 ms (0.2% of span): JavaScript 2, Idle 1, DOM 1
  - JS leaf 0 / native under JS 2 / native 1; buckets: ipc 4, harness_diagnostics 2, poll_wait 1, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[unknown]` 1; `js::Wrapper::New(JSContext*, JSObject*, js::Wrapper const*, ` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `fromPacket (chrome://remote/content/marionette/message.sys.m` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8454** CPU ms by thread group: main 9, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.4% of span): Idle 7, DOM 1, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 2 / native 7; buckets: ipc 9, poll_wait 7, harness_diagnostics 2, array_buffer_copy 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::SharedPropMap::createInitial(JSContext*, JS::Handle<JS::` 1; `JSScript::createJitScript(JSContext*) [libxul.so]` 1; `__memcmp_evex_movbe [libc.so.6]` 0; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0; `__memset_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8327** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8349** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 151, main 51, WRRenderBackend 33, DOM Worker 28, WRSceneBuilder 28, Compositor 24, IPC I/O 6, SwComposite 6, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (1.7% of span): GC / CC 25, Idle 16, Other 4, JavaScript 3, Graphics 1, Layout 1
  - JS leaf 1 / native under JS 2 / native 48; buckets: ipc 51, gc_cc 29, poll_wait 18, harness_diagnostics 2, paint_layout 2, array_buffer_copy 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 2; `nsTHashtable<nsBaseHashtableET<nsStringHashKey, nsCOMPtr<nsI` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 5× 20 ms, CCSlice 1× 5 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 151 ms (top self: `__syscall_cancel_arch [libc.so.6]` 88, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 25, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 25 ms (top self: `syscall [libc.so.6]` 23, `sched_yield [libc.so.6]` 0, `free [axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 26 ms: buckets worker_messaging 26, ipc 26, gc_cc 25, memcpy_memset 9, poll_wait 3, array_buffer_copy 2; top self: `madvise [libc.so.6]` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `unsigned long js::gc::Arena::finalize<JSString, (j` 2; `munmap [libc.so.6]` 2
- **tab:8454** CPU ms by thread group: main 91, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 91 ms (3.0% of span): Idle 64, Graphics 7, Other 7, Layout 5, GC / CC 4, JavaScript 2
  - JS leaf 0 / native under JS 4 / native 87; buckets: ipc 86, poll_wait 64, paint_layout 15, gc_cc 5, harness_diagnostics 2, array_buffer_copy 1, webrender_render 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 66; `[]` 3; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*,` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::He` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 10 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8327** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8532** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 152, WRRenderBackend 31, main 30, WRSceneBuilder 27, Compositor 23, IPC I/O 6, DOM Worker 4, SwComposite 4, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (1.0% of span): GC / CC 20, Idle 6, DOM 2, Profiler 1, Other 1, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 28; buckets: ipc 30, gc_cc 23, poll_wait 9, harness_diagnostics 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 1
  - GC/CC markers: GCMajor 1× 68 ms, GCSlice 5× 17 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 152 ms (top self: `__syscall_cancel_arch [libc.so.6]` 83, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 27, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 23 ms (top self: `syscall [libc.so.6]` 22, `[axiosozo-dev]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedIm` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8454** CPU ms by thread group: main 80, IPC I/O 8, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 80 ms (2.7% of span): Idle 61, Graphics 7, Other 4, Layout 3, Profiler 3, GC / CC 2
  - JS leaf 0 / native under JS 1 / native 79; buckets: ipc 77, poll_wait 61, paint_layout 12, gc_cc 3, mozafterpaint_events 1, webrender_render 0, subprocess_pipe_io 0, canvas_2d 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 62; `[]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onScopeE` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::gc::TraceExternalEdge(JSTracer*, JS::PropertyKey*, char ` 1; `mozilla::ImplCycleCollectionTraverse(nsCycleCollectionTraver` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 6× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8327** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 323, main 71, WRRenderBackend 36, Compositor 16, SwComposite 14, WRSceneBuilder 13, IPC I/O 4, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 71 ms (3.6% of span): Idle 40, GC / CC 19, Other 5, JavaScript 3, Layout 2, Graphics 1
  - JS leaf 0 / native under JS 4 / native 68; buckets: ipc 71, poll_wait 47, gc_cc 22, harness_diagnostics 4, paint_layout 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 44; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `nsIFrame::ShouldApplyOverflowClipping(nsStyleDisplay const*)` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 1
  - GC/CC markers: GCMajor 1× 45 ms, GCSlice 6× 22 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 323 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 95, `__syscall_cancel_arch [libc.so.6]` 58, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 47); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1); SwComposite 14 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8454** CPU ms by thread group: main 50, IPC I/O 8, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.5% of span): Idle 42, Graphics 4, Other 2, JavaScript 2, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 2 / native 48; buckets: ipc 48, poll_wait 42, paint_layout 4, harness_diagnostics 1, array_buffer_copy 1, gc_cc 0, canvas_2d 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 42; `[]` 1; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffe` 1; `floorf [libxul.so]` 1; `mozilla::FlattenedDisplayListIterator::ResolveFlattening() [` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8532** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8528** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 79, Renderer 19, Compositor 9, WRRenderBackend 9, WRSceneBuilder 7, IPC I/O 4, SwComposite 2, other 1, BgPool 1, DOM Worker 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 79 ms (2.1% of span): Idle 31, Graphics 16, Layout 14, JavaScript 7, Other 6, DOM 5
  - JS leaf 2 / native under JS 10 / native 67; buckets: ipc 79, poll_wait 35, paint_layout 30, harness_diagnostics 3, gc_cc 3, subprocess_pipe_io 3, memcpy_memset 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 32; `[axiosozo-dev]` 4; `IsTwiceTheRequiredBytesRepresentableAsUint32(unsigned long, ` 2; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&,` 2; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 2; `mozilla::layers::WebRenderLayerManager::EndTransactionWithou` 2
  - WebRender/compositor threads: Renderer 19 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 1, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 1); WRRenderBackend#0 9 ms (top self: `syscall [libc.so.6]` 8, `sched_yield [libc.so.6]` 0, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 7 ms (top self: `syscall [libc.so.6]` 6, `sched_yield [libc.so.6]` 0, `mozilla::layers::APZCTreeManager::PrepareNodeForLa` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8454** CPU ms by thread group: main 36, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 36 ms (1.0% of span): Idle 20, GC / CC 5, Graphics 3, JavaScript 2, Other 2, Layout 2
  - JS leaf 0 / native under JS 2 / native 34; buckets: ipc 35, poll_wait 20, gc_cc 6, paint_layout 6, harness_diagnostics 2, memcpy_memset 1, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 20; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libx` 1; `mozilla::DisplayListClipState::ClipContainingBlockDescendant` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8277** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 3, JavaScript 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::OpaqueXra` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::detail::nsTStringRepr<char>::Equals(mozilla::detail` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

