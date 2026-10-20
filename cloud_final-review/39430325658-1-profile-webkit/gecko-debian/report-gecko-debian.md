# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **5.9** (main 2.9, DOM Worker 1.0, glean.dispatche 0.5, Softwar~cThread 0.5, Renderer 0.5) | Web Content 3.4, Isolated Web Co 2.0 | — | — |
| plain | raf | 59.0 | 17.1 | **30.4** (Renderer 16.4, WRRende~ckend# 2.9, main 2.3, glean.dispatche 1.6, TaskCon~ller # 1.6) | Isolated Web Co 4.9, WebExtensions 0.6, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.0** (Renderer 10.0, glean.dispatche 1.7, WRRende~ckend# 1.7, Compositor 1.3, main 1.0) | Isolated Web Co 4.4, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **44.1** (Renderer 28.7, main 4.9, WRRende~ckend# 3.0, SwComposite 2.5, Compositor 1.5) | Isolated Web Co 5.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.9** (main 4.8, Renderer 1.1, TaskCon~ller # 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.6, Privileged Cont 0.3 | 10.5 | — |
| trace | idle | 59.2 | 17.2 | **5.9** (main 2.4, TaskCon~ller # 1.0, glean.dispatche 0.5, IPDL Background 0.5, Renderer 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **21.0** (Renderer 9.5, WRRende~ckend# 2.3, glean.dispatche 1.6, WRScene~ilder# 1.6, main 1.3) | Isolated Web Co 4.2 | — | — |
| trace | raf-nosampler | — | — | **17.1** (Renderer 9.6, glean.dispatche 2.0, WRRende~ckend# 2.0, WRScene~ilder# 1.3, Compositor 1.0) | Isolated Web Co 4.4 | — | — |
| trace | scroll | 59.0 | 17.1 | **45.8** (Renderer 29.3, main 5.5, WRRende~ckend# 3.5, SwComposite 2.0, Compositor 1.5) | Isolated Web Co 5.5 | — | — |
| trace | key | — | — | **66.9** (main 19.0, DOM Worker 16.0, Indexed~ IO # 15.2, IPDL Background 5.9, TaskCon~ller # 2.7) | Isolated Web Co 1.3, WebExtensions 0.6, Privileged Cont 0.3, Utility Process 0.3 | 11.0 | — |
| profile | idle | 59.5 | 17.2 | **9.2** (SamplerThread 3.4, main 2.9, TaskCon~ller # 1.9, IPDL Background 0.5, Compositor 0.5) | Web Content 7.3, Isolated Web Co 4.9, WebExtensions 2.4, Socket Process 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **34.7** (Renderer 12.4, SamplerThread 6.5, WRRende~ckend# 3.3, main 2.6, glean.dispatche 2.0) | Isolated Web Co 11.7, Web Content 7.2, WebExtensions 1.6, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **31.2** (Renderer 12.9, SamplerThread 6.3, WRRende~ckend# 3.0, Compositor 2.3, WRScene~ilder# 2.0) | Isolated Web Co 11.9, Web Content 7.3, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.2 | **63.6** (Renderer 33.4, main 7.9, SamplerThread 7.9, WRRende~ckend# 4.4, SwComposite 2.5) | Isolated Web Co 9.3, Web Content 7.4, WebExtensions 2.0, Socket Process 1.5 | — | — |
| profile | key | — | — | **16.3** (main 5.9, SamplerThread 4.5, Renderer 1.1, Compositor 1.1, TaskCon~ller # 0.8) | Web Content 6.4, Isolated Web Co 4.6, Socket Process 1.6, WebExtensions 1.6 | 9.0 | — |

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

- **parent** CPU ms by thread group: main 57, Compositor 2, DOM Worker 2, IPC I/O 1, Socket 1, other 1, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 57 ms (2.7% of span): GC / CC 34, JavaScript 8, Idle 8, Other 6, Graphics 1, DOM 0
  - JS leaf 0 / native under JS 9 / native 48; buckets: ipc 57, gc_cc 40, poll_wait 13, harness_diagnostics 6, array_buffer_copy 4, memcpy_memset 2, paint_layout 1, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `mprotect [libc.so.6]` 4; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 7× 26 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1; top self: `SweepScriptDataTable(mozilla::HashSet<js::SharedIm` 1; `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8455** CPU ms by thread group: main 36, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 36 ms (1.7% of span): Idle 22, GC / CC 7, JavaScript 4, Other 1, DOM 1, Layout 1
  - JS leaf 0 / native under JS 5 / native 31; buckets: ipc 35, poll_wait 23, gc_cc 10, harness_diagnostics 5, array_buffer_copy 2, paint_layout 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 23; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `[]` 1; `void nsPurpleBuffer::VisitEntries<SnowWhiteKiller>(SnowWhite` 1; `[unknown]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8478** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8544** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 361, WRRenderBackend 83, main 71, WRSceneBuilder 62, Compositor 51, SwComposite 24, IPC I/O 12, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 71 ms (2.3% of span): GC / CC 33, Idle 22, JavaScript 7, Layout 3, Other 3, Graphics 2
  - JS leaf 0 / native under JS 8 / native 63; buckets: ipc 71, gc_cc 41, poll_wait 24, harness_diagnostics 7, paint_layout 6, array_buffer_copy 4, subprocess_pipe_io 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `mprotect [libc.so.6]` 3; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `getrusage [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 26 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 361 ms (top self: `__syscall_cancel_arch [libc.so.6]` 99, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 88, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 40); WRRenderBackend#0 83 ms (top self: `syscall [libc.so.6]` 68, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 1); WRSceneBuilder#0 55 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 2, `mozilla::layers::APZCTreeManager::PrepareNodeForLa` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `munmap [libc.so.6]` 1; `js::gc::BufferAllocator::sweepChunk(js::gc::Buffer` 1; `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8455** CPU ms by thread group: main 217, IPC I/O 19, other 6, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 217 ms (7.0% of span): Idle 100, Graphics 46, Layout 32, Other 17, Profiler 12, JavaScript 6
  - JS leaf 0 / native under JS 14 / native 203; buckets: ipc 199, poll_wait 101, paint_layout 96, gc_cc 5, canvas_2d 4, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 104; `[]` 8; `[linux-vdso.so.1]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `getcontext [libc.so.6]` 3; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libx` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8478** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 370, WRRenderBackend 82, WRSceneBuilder 62, Compositor 52, main 19, SwComposite 16, IPC I/O 12, other 2, DOM Worker 0, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 19 ms (0.6% of span): Idle 14, JavaScript 4, Other 0, Graphics 0, DOM 0
  - JS leaf 0 / native under JS 4 / native 15; buckets: ipc 19, poll_wait 15, harness_diagnostics 4, array_buffer_copy 3, gc_cc 1, paint_layout 0, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 14; `mozilla::dom::AutoRequestJSThreadExecution::AutoRequestJSThr` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Co` 1; `mprotect [libc.so.6]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1; `syscall [libc.so.6]` 0
  - WebRender/compositor threads: Renderer 370 ms (top self: `__syscall_cancel_arch [libc.so.6]` 96, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 94, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 48); WRRenderBackend#0 81 ms (top self: `syscall [libc.so.6]` 67, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 1); WRSceneBuilder#0 56 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 0; `[axiosozo-dev]` 0
- **tab:8455** CPU ms by thread group: main 214, IPC I/O 19, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 214 ms (7.1% of span): Idle 94, Graphics 44, Layout 31, Other 19, Profiler 16, GC / CC 6
  - JS leaf 0 / native under JS 11 / native 203; buckets: ipc 196, poll_wait 95, paint_layout 94, gc_cc 8, canvas_2d 3, subprocess_pipe_io 3, memcpy_memset 2, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 102; `__lll_lock_wait [libc.so.6]` 6; `[]` 4; `getcontext [libc.so.6]` 3; `peek_poke::poke_into_vec [libxul.so]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2
  - GC/CC markers: GCMajor 1× 24 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8478** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 661, main 151, WRRenderBackend 81, SwComposite 45, Compositor 33, WRSceneBuilder 25, IPC I/O 9, BgPool 1, other 1, Socket 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 151 ms (7.4% of span): Idle 75, GC / CC 34, Other 13, JavaScript 9, Layout 8, Graphics 8
  - JS leaf 1 / native under JS 8 / native 142; buckets: ipc 148, poll_wait 98, gc_cc 38, paint_layout 15, harness_diagnostics 4, array_buffer_copy 3, mozafterpaint_events 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 82; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `[axiosozo-dev]` 4; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 3; `[linux-vdso.so.1]` 2
  - GC/CC markers: GCMajor 1× 65 ms, GCSlice 7× 26 ms, CCSlice 1× 8 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 661 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 195, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 95, `__syscall_cancel_arch [libc.so.6]` 58); WRRenderBackend#0 81 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 3); SwComposite 45 ms (top self: `syscall [libc.so.6]` 40, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `fstatat64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<j` 0
- **tab:8455** CPU ms by thread group: main 113, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 113 ms (5.5% of span): Idle 65, Graphics 19, Other 11, GC / CC 8, JavaScript 4, Profiler 3
  - JS leaf 0 / native under JS 5 / native 108; buckets: ipc 109, poll_wait 66, paint_layout 24, gc_cc 11, harness_diagnostics 4, memcpy_memset 2, array_buffer_copy 2, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 67; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::ns` 1; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 1; `zen::ZenMouseTracker::AddRef() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 21 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8379** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8547** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 218, Renderer 36, WRRenderBackend 20, Compositor 20, WRSceneBuilder 16, IPC I/O 10, SwComposite 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 218 ms (5.8% of span): Idle 44, Layout 39, GC / CC 34, JavaScript 31, Graphics 29, Other 29
  - JS leaf 2 / native under JS 34 / native 181; buckets: ipc 218, paint_layout 72, poll_wait 68, gc_cc 55, array_buffer_copy 7, subprocess_pipe_io 4, harness_diagnostics 3, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 52; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `[axiosozo-dev]` 5; `[unknown]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit` 3
  - GC/CC markers: GCMajor 1× 60 ms, GCSlice 6× 27 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 36 ms (top self: `__syscall_cancel_arch [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 20 ms (top self: `syscall [libc.so.6]` 17, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRSceneBuilder#0 15 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 2, `webrender_api::display_list::BuiltDisplayListIter:` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8455** CPU ms by thread group: main 70, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 70 ms (1.8% of span): Idle 26, GC / CC 8, JavaScript 8, DOM 6, Profiler 6, Layout 5
  - JS leaf 0 / native under JS 10 / native 60; buckets: ipc 67, poll_wait 26, paint_layout 18, gc_cc 13, harness_diagnostics 5, array_buffer_copy 4, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 27; `[]` 2; `mozilla::dom::FragmentOrElement::cycleCollection::TraverseNa` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__strlen_avx2 [libc.so.6]` 2; `PLDHashTable::Search(void const*) const [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8302** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `pthread_once@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `js::Nursery::reallocateBuffer(JS::Zone*, js::gc::Cell*, void` 0; `mozilla::cyclecollector::HoldJSObjectsWithKeyImpl(void*, nsS` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

