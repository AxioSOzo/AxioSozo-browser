# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **4.5** (main 2.0, Renderer 1.0, DOM Worker 1.0, Compositor 0.5) | Web Content 3.4, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.3 | **20.4** (Renderer 12.2, WRRende~ckend# 1.6, main 1.3, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 3.3, WebExtensions 1.0, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **17.2** (Renderer 8.3, WRRende~ckend# 2.0, main 1.3, glean.dispatche 1.3, WRScene~ilder# 1.0) | Isolated Web Co 3.6 | — | — |
| plain | scroll | 59.0 | 17.2 | **36.6** (Renderer 24.1, main 3.5, WRRende~ckend# 3.0, SwComposite 2.0, glean.dispatche 1.0) | Isolated Web Co 4.0, Web Content 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.9** (main 4.3, TaskCon~ller # 1.1, Renderer 1.1, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 12.5 | — |
| trace | idle | 59.2 | 17.3 | **5.5** (main 2.5, TaskCon~ller # 1.0, Socket Thread 0.5, Renderer 0.5, WRScene~ilder# 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.3 | **14.5** (Renderer 7.6, WRRende~ckend# 1.6, glean.dispatche 1.3, WRScene~ilder# 1.0, Compositor 1.0) | Isolated Web Co 3.6 | — | — |
| trace | raf-nosampler | — | — | **16.9** (Renderer 8.3, WRRende~ckend# 2.0, WRScene~ilder# 1.3, main 1.0, glean.dispatche 1.0) | Isolated Web Co 4.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **38.6** (Renderer 23.6, main 4.5, WRRende~ckend# 3.0, TaskCon~ller # 1.5, Compositor 1.5) | Isolated Web Co 3.0 | — | — |
| trace | key | — | — | **57.9** (DOM Worker 16.1, main 15.5, IndexedDB IO # 12.6, IPDL Background 5.4, TaskCon~ller # 2.1) | Isolated Web Co 1.3 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **9.8** (main 2.4, SamplerThread 2.4, TaskCon~ller # 2.0, DOM Worker 2.0, IPC I/O Parent 0.5) | Web Content 5.9, Isolated Web Co 2.5, Privileged Cont 1.5, Socket Process 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **23.5** (Renderer 9.5, SamplerThread 4.3, WRRende~ckend# 2.0, WRScene~ilder# 1.6, Compositor 1.6) | Isolated Web Co 8.9, Web Content 4.9, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **25.1** (Renderer 9.6, SamplerThread 4.3, WRRende~ckend# 2.0, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 7.6, Web Content 4.7, RDD Process 1.3, WebExtensions 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **49.4** (Renderer 26.9, main 6.5, SamplerThread 5.5, WRRende~ckend# 3.5, SwComposite 2.0) | Isolated Web Co 8.0, Web Content 6.5, Socket Process 1.5, WebExtensions 1.0 | — | — |
| profile | key | — | — | **12.9** (main 5.1, SamplerThread 2.9, Renderer 1.1, TaskCon~ller # 0.8, Compositor 0.8) | Web Content 5.4, Isolated Web Co 3.6, WebExtensions 1.1, Privileged Cont 1.1 | 10.0 | — |

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

- **parent** CPU ms by thread group: DOM Worker 44, main 43, Compositor 2, IPC I/O 1, Renderer 1, Socket 0, SwComposite 0, other 0, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (2.1% of span): GC / CC 24, Idle 7, Other 6, JavaScript 5, Profiler 1, Graphics 1
  - JS leaf 0 / native under JS 5 / native 38; buckets: ipc 43, gc_cc 31, poll_wait 8, harness_diagnostics 4, array_buffer_copy 2, paint_layout 1, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `write [libc.so.6]` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 23 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 0 ms (top self: `__lll_lock_wait [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 41 ms: buckets worker_messaging 41, ipc 41, gc_cc 41, memcpy_memset 19, poll_wait 2; top self: `madvise [libc.so.6]` 15; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `unsigned long js::gc::Arena::finalize<JSString, (j` 5; `munmap [libc.so.6]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2
- **tab:3176** CPU ms by thread group: main 18, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 18 ms (0.9% of span): Idle 13, JavaScript 2, Other 2, DOM 1, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 2 / native 16; buckets: ipc 17, poll_wait 14, harness_diagnostics 2, array_buffer_copy 2, gc_cc 2, subprocess_pipe_io 1, paint_layout 0
  - top self: `poll [libc.so.6]` 13; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `[linux-vdso.so.1]` 1; `mozilla::dom::JSActor::QueryHandler::SendReply(JSContext*, m` 1; `js::frontend::ScopeStencil::createScope(JSContext*, js::fron` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3110** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3265** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 274, WRRenderBackend 60, WRSceneBuilder 48, Compositor 40, main 24, SwComposite 22, IPC I/O 9, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 24 ms (0.8% of span): Idle 16, Graphics 2, Other 2, JavaScript 1, DOM 1, Layout 1
  - JS leaf 0 / native under JS 2 / native 22; buckets: ipc 24, poll_wait 17, paint_layout 3, harness_diagnostics 1, gc_cc 1, subprocess_pipe_io 1, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 17; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::ns` 1; `nsLayoutUtils::GetDisplayListParent(nsIFrame*) [libxul.so]` 1; `void mozilla::WriteULEB128<unsigned long, mozilla::ProfileBu` 1; `WriteStructuredClone(JSContext*, JS::Handle<JS::Value>, JSSt` 1; `[unknown]` 0
  - WebRender/compositor threads: Renderer 274 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 58, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 28); WRRenderBackend#0 60 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 43 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3176** CPU ms by thread group: main 156, IPC I/O 14, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 156 ms (5.1% of span): Idle 97, Graphics 19, Layout 14, Other 8, GC / CC 7, JavaScript 5
  - JS leaf 0 / native under JS 9 / native 147; buckets: ipc 146, poll_wait 99, paint_layout 40, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, canvas_2d 2, memcpy_memset 2
  - top self: `poll [libc.so.6]` 98; `[]` 4; `sendmsg [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 33 ms, GCSlice 8× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3092** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3265** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 277, WRRenderBackend 58, main 46, WRSceneBuilder 45, Compositor 39, SwComposite 14, IPC I/O 9, other 1, DOM Worker 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, ImageBridge 0
  - main thread 46 ms (1.5% of span): GC / CC 31, Idle 11, JavaScript 3, Other 2, Profiler 0
  - JS leaf 0 / native under JS 3 / native 43; buckets: ipc 45, gc_cc 33, poll_wait 12, harness_diagnostics 3, array_buffer_copy 2, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::MapObject::get(JSContext*, JS::Value const&, JS::Mutable` 1
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 27 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 277 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 69, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 36); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRSceneBuilder#0 40 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3176** CPU ms by thread group: main 140, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 140 ms (4.6% of span): Idle 100, Graphics 14, Layout 9, Profiler 7, Other 6, GC / CC 4
  - JS leaf 0 / native under JS 3 / native 137; buckets: ipc 130, poll_wait 102, paint_layout 27, gc_cc 5, memcpy_memset 2, canvas_2d 1, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 100; `[]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 6× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3219** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `[libgcc_s.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3262** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 520, main 114, WRRenderBackend 64, SwComposite 44, Compositor 28, WRSceneBuilder 22, IPC I/O 7, Socket 1, other 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, ImageBridge 0
  - main thread 114 ms (5.6% of span): Idle 58, GC / CC 30, Other 10, Graphics 7, JavaScript 5, Layout 3
  - JS leaf 0 / native under JS 6 / native 108; buckets: ipc 114, poll_wait 73, gc_cc 33, paint_layout 10, harness_diagnostics 6, array_buffer_copy 3, subprocess_pipe_io 2, canvas_2d 0
  - top self: `poll [libc.so.6]` 59; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `recvmsg [libc.so.6]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 7× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 520 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 178, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 88, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); SwComposite 44 ms (top self: `syscall [libc.so.6]` 39, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `mozilla::detail::HashTable<mozilla::HashMapEntry<u` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3176** CPU ms by thread group: main 92, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 92 ms (4.6% of span): Idle 60, Graphics 9, Other 8, GC / CC 7, JavaScript 5, Layout 2
  - JS leaf 0 / native under JS 6 / native 87; buckets: ipc 90, poll_wait 60, paint_layout 15, gc_cc 10, harness_diagnostics 4, array_buffer_copy 2, subprocess_pipe_io 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 60; `sendmsg [libc.so.6]` 2; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::ObjectWrapperMap::ModIterator::ModIterator(js::ObjectWra` 1; `js::jit::AttachBaselineCacheIRStub(JSContext*, js::jit::Cach` 1
  - GC/CC markers: GCMajor 1× 17 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3265** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3110** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 179, Renderer 35, WRRenderBackend 18, Compositor 16, WRSceneBuilder 14, IPC I/O 8, SwComposite 6, other 2, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 179 ms (4.8% of span): Idle 45, Layout 34, GC / CC 25, Other 24, JavaScript 20, Graphics 18
  - JS leaf 1 / native under JS 25 / native 153; buckets: ipc 178, poll_wait 66, paint_layout 57, gc_cc 37, array_buffer_copy 6, subprocess_pipe_io 5, harness_diagnostics 3, memcpy_memset 2
  - top self: `poll [libc.so.6]` 45; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `syscall [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `[libgdk-3.so.0]` 3
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 3); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 1, `webrender::render_backend::RenderBackend::update_d` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3176** CPU ms by thread group: main 63, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 63 ms (1.7% of span): Idle 25, Layout 10, Other 7, JavaScript 6, GC / CC 6, Graphics 5
  - JS leaf 0 / native under JS 6 / native 58; buckets: ipc 59, poll_wait 27, paint_layout 18, gc_cc 10, array_buffer_copy 3, harness_diagnostics 3, canvas_2d 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 25; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsFrameMessageManager::cycleCollection::TraverseNative(void*` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3013** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 5; `read [libc.so.6]` 0; `js::GetElementsWithAdder(JSContext*, JS::Handle<JSObject*>, ` 0; `js::ElementAdder::append(JSContext*, JS::Handle<JS::Value>) ` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3110** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

