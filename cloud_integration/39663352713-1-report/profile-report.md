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

## gecko-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.1 | **6.0** (main 2.0, Renderer 2.0, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Web Content 2.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **22.1** (Renderer 13.5, SwComposite 2.3, main 1.3, WRRende~ckend# 1.3, TaskCon~ller # 1.0) | Isolated Web Co 2.9, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.8** (Renderer 8.6, SwComposite 1.7, glean.dispatche 1.3, WRScene~ilder# 1.3, WRRende~ckend# 1.3) | Isolated Web Co 3.0, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **53.3** (Renderer 41.8, SwComposite 4.5, main 2.5, WRRende~ckend# 2.5, glean.dispatche 0.5) | Isolated Web Co 3.0 | — | — |
| plain | key | — | — | **6.3** (main 3.0, Renderer 1.1, TaskCon~ller # 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.1 | 8.5 | — |
| trace | idle | 59.0 | 17.2 | **4.5** (main 1.5, TaskCon~ller # 1.5, Renderer 1.0, IPDL Background 0.5) | Privileged Cont 0.5, Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **12.1** (Renderer 5.6, SwComposite 1.6, glean.dispatche 1.3, WRScene~ilder# 1.0, WRRende~ckend# 1.0) | Isolated Web Co 3.3 | — | — |
| trace | raf-nosampler | — | — | **16.0** (Renderer 7.0, main 1.7, SwComposite 1.7, WRRende~ckend# 1.3, glean.dispatche 1.0) | Isolated Web Co 2.6 | — | — |
| trace | scroll | 59.0 | 17.1 | **57.3** (Renderer 40.8, main 4.5, SwComposite 4.5, WRRende~ckend# 2.0, glean.dispatche 1.0) | Isolated Web Co 3.0 | — | — |
| trace | key | — | — | **49.7** (DOM Worker 14.3, main 12.4, Indexed~ IO # 10.5, IPDL Background 5.4, TaskCon~ller # 2.2) | Isolated Web Co 0.8, WebExtensions 0.6 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **2.0** (SamplerThread 2.0) | Web Content 3.9, Isolated Web Co 3.0, Privileged Cont 1.5, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **20.8** (Renderer 5.9, SamplerThread 3.6, main 2.0, TaskCon~ller # 1.6, WRRende~ckend# 1.6) | Isolated Web Co 6.9, Web Content 4.6, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **22.3** (Renderer 8.0, SamplerThread 3.3, main 1.7, WRRende~ckend# 1.7, SwComposite 1.7) | Isolated Web Co 5.9, Web Content 5.0, Privileged Cont 1.3, Socket Process 0.7 | — | — |
| profile | scroll | 59.0 | 17.1 | **71.1** (Renderer 46.1, SwComposite 6.5, SamplerThread 6.0, main 5.0, WRRende~ckend# 2.5) | Isolated Web Co 6.0, Web Content 4.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **10.0** (main 3.2, SamplerThread 3.0, Renderer 1.1, Compositor 0.8, WRRende~ckend# 0.5) | Web Content 5.4, Isolated Web Co 2.7, Privileged Cont 1.1, WebExtensions 0.8 | 11.0 | — |

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

- **parent** CPU ms by thread group: main 5, IPC I/O 1, Socket 0, other 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, DOM Worker 0, ImageBridge 0, SwComposite 0
  - main thread 5 ms (0.3% of span): Idle 3, JavaScript 2
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, harness_diagnostics 2, gc_cc 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `mprotect [libc.so.6]` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 1; `[unknown]` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 14, IPC I/O 3, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 14 ms (0.7% of span): Idle 12, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 14; buckets: ipc 14, poll_wait 12, array_buffer_copy 1, gc_cc 1, harness_diagnostics 0, paint_layout 0
  - top self: `poll [libc.so.6]` 12; `js::FrameIter::settleOnActivation() [libxul.so]` 1; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [libxul.so]` 0; `write [libc.so.6]` 0; `[]` 0; `js::SCInput::read(unsigned long*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 180, main 58, SwComposite 51, WRRenderBackend 42, WRSceneBuilder 39, Compositor 35, IPC I/O 8, other 1, DOM Worker 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 58 ms (1.9% of span): GC / CC 31, Idle 18, Other 4, JavaScript 3, Layout 1, Graphics 1
  - JS leaf 0 / native under JS 3 / native 54; buckets: ipc 58, gc_cc 34, poll_wait 20, harness_diagnostics 3, paint_layout 2, memcpy_memset 2, array_buffer_copy 2, json_metadata 1
  - top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `mozilla::TraceScriptHolder(nsISupports*, JSTracer*) [libxul.` 2; `JS::Compartment::findSweepGroupEdges() [libxul.so]` 2; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMajor 1× 91 ms, GCSlice 6× 24 ms, CCSlice 2× 7 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 180 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 22, `int blendTextureNearestFast<true, glsl::sampler2D_` 8); SwComposite 51 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx512_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::jit::JitCode::finalize(JS::GCContext*) [libxul` 0
- **tab:3186** CPU ms by thread group: main 126, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 126 ms (4.1% of span): Idle 84, Graphics 13, Layout 10, Other 7, GC / CC 6, Profiler 3
  - JS leaf 0 / native under JS 4 / native 122; buckets: ipc 118, poll_wait 85, paint_layout 26, gc_cc 9, harness_diagnostics 2, subprocess_pipe_io 2, array_buffer_copy 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 84; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `sendmsg [libc.so.6]` 2; `XPCWrappedNativeScope::TraceWrappedNativesInAllScopes(XPCJSR` 1
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 2 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 235, SwComposite 44, WRRenderBackend 41, main 40, WRSceneBuilder 36, Compositor 34, IPC I/O 7, DOM Worker 4, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (1.3% of span): GC / CC 25, Idle 9, Other 3, JavaScript 3, Graphics 0
  - JS leaf 0 / native under JS 2 / native 38; buckets: ipc 40, gc_cc 29, poll_wait 10, harness_diagnostics 2, json_metadata 1, array_buffer_copy 1, paint_layout 0, memcpy_memset 0
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `poll [libc.so.6]` 9; `mprotect [libc.so.6]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 235 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 29, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 23); SwComposite 45 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 41 ms (top self: `syscall [libc.so.6]` 38, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 2, poll_wait 0; top self: `mozilla::PrintfTarget::vprint(char const*, __va_li` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 1; `__lll_lock_wait [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 111, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 111 ms (3.7% of span): Idle 83, Graphics 8, Other 7, Layout 6, Profiler 3, GC / CC 2
  - JS leaf 0 / native under JS 2 / native 109; buckets: ipc 108, poll_wait 84, paint_layout 17, gc_cc 6, memcpy_memset 1, canvas_2d 1, subprocess_pipe_io 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 82; `sendmsg [libc.so.6]` 2; `[]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::` 1
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 6× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3093** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 898, SwComposite 113, main 98, WRRenderBackend 54, Compositor 24, WRSceneBuilder 16, IPC I/O 6, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 99 ms (4.9% of span): Idle 49, GC / CC 26, Other 11, JavaScript 5, Graphics 3, DOM 3
  - JS leaf 0 / native under JS 7 / native 92; buckets: ipc 99, poll_wait 61, gc_cc 32, harness_diagnostics 6, paint_layout 5, array_buffer_copy 2, subprocess_pipe_io 1, json_metadata 1
  - top self: `poll [libc.so.6]` 49; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 898 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 298, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 202, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 53); SwComposite 113 ms (top self: `syscall [libc.so.6]` 102, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 1, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 65, IPC I/O 11, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 65 ms (3.2% of span): Idle 51, Graphics 5, Other 4, JavaScript 4, Layout 1, Profiler 1
  - JS leaf 0 / native under JS 4 / native 61; buckets: ipc 63, poll_wait 51, paint_layout 7, gc_cc 3, harness_diagnostics 2, subprocess_pipe_io 2, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 51; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const ` 1; `webrtc::LogSink::OnLogMessage(std::basic_string_view<char, s` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `js::frontend::SpecificParserAtomLookup<char16_t>::equalsEntr` 1; `[]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3093** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 110, Renderer 43, SwComposite 13, Compositor 13, WRRenderBackend 12, WRSceneBuilder 10, IPC I/O 6, other 1, Socket 1, DOM Worker 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 110 ms (2.9% of span): Idle 36, Graphics 19, Layout 17, Other 16, JavaScript 15, Profiler 5
  - JS leaf 1 / native under JS 18 / native 91; buckets: ipc 110, poll_wait 46, paint_layout 40, gc_cc 6, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 37; `[axiosozo-dev]` 5; `[unknown]` 5; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 3; `recvmsg [libc.so.6]` 3; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsD` 3
  - WebRender/compositor threads: Renderer 43 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5); SwComposite 13 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 12, `webrender::render_task_graph::RenderTaskGraphBuild` 0, `webrender::quad::prepare_quad_impl [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, array_buffer_copy 1, gc_cc 1, poll_wait 0; top self: `js::StringPrinter::put(char const*, unsigned long)` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 48, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (1.3% of span): Idle 23, GC / CC 8, Other 7, JavaScript 3, DOM 3, Layout 2
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 47, poll_wait 24, gc_cc 10, paint_layout 8, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `ChildFinder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3023** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 4, Other 0, Profiler 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `mojo::core::ports::Node::PrepareToForwardUserMessage(mojo::c` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0; `[unknown]` 0; `nsWindowRoot::AddRef() [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **84.4** (main 38.9, Renderer 26.0, DOM Worker 13.0, StyleThread# 6.5) | cef:renderer 26.0, AxioCEFProbe 19.5, cef:utility 13.0, Isolated Web Co 6.5 | — | 123.8 |
| plain | idle | — | — | **5.8** (main 3.4, DOM Worker 1.4, glean.dispatche 0.5, Cache2 I/O 0.5) | Web Content 1.9, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 22.4 | **17.0** (main 6.5, DOM Worker 1.9, Renderer 1.6, Backgro~Pool # 1.0, Timer 1.0) | cef:renderer 6.8, cef:gpu-process 3.9, AxioCEFProbe 3.2 | — | — |
| plain | raf-nosampler | — | — | **12.0** (main 3.6, DOM Worker 2.0, Renderer 1.7, Compositor 1.0, SwComposite 1.0) | cef:renderer 7.0, cef:gpu-process 4.9, AxioCEFProbe 4.0, WebExtensions 0.3 | — | — |
| plain | scroll | 59.9 | 23.5 | **30.7** (main 14.3, DOM Worker 5.4, Backgro~Pool # 2.0, Renderer 2.0, TaskCon~ller # 1.5) | cef:gpu-process 17.7, cef:renderer 7.4, AxioCEFProbe 5.9, Web Content 0.5 | — | — |
| plain | key | — | — | **12.1** (main 6.9, Renderer 1.1, DOM Worker 1.1, Timer 0.6, TaskCon~ller # 0.6) | AxioCEFProbe 2.0, cef:renderer 1.9, cef:gpu-process 0.3 | 11.0 | — |
| plain | switch-to-gecko | — | — | **10.2** (DOM Worker 3.7, main 3.4, IPDL Background 1.0, TaskCon~ller # 0.8, StreamTrans # 0.4) | Privileged Cont 0.1 | — | 15736.0 |
| trace | switch-to-engine | — | — | **83.6** (main 31.7, Renderer 23.0, TaskCon~ller # 11.5, DOM Worker 5.8, WrGlyph~terizer 2.9) | AxioCEFProbe 51.8, cef:gpu-process 20.1, cef:renderer 14.4, cef:utility 14.4 | — | 314.0 |
| trace | idle | — | — | **3.9** (main 2.9, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 3.9, Web Content 2.9 | — | — |
| trace | raf | 60.0 | 20.6 | **15.3** (main 6.2, DOM Worker 1.9, Renderer 1.6, Backgro~Pool # 1.0, WRRende~ckend# 1.0) | cef:renderer 6.5, AxioCEFProbe 3.5, cef:gpu-process 3.2 | — | — |
| trace | raf-nosampler | — | — | **13.6** (main 4.0, Renderer 2.0, DOM Worker 2.0, WRRende~ckend# 1.3, Backgro~Pool # 1.0) | cef:renderer 6.3, cef:gpu-process 4.3, AxioCEFProbe 3.7, Web Content 0.3 | — | — |
| trace | scroll | 60.0 | 22.8 | **29.2** (main 14.8, DOM Worker 5.4, Renderer 2.0, TaskCon~ller # 1.5, glean.dispatche 1.0) | cef:gpu-process 17.8, cef:renderer 9.0, AxioCEFProbe 5.9 | — | — |
| trace | key | — | — | **12.6** (main 6.9, Renderer 1.1, DOM Worker 1.1, TaskCon~ller # 0.8, Timer 0.6) | cef:renderer 2.5, AxioCEFProbe 1.7, cef:gpu-process 0.6, WebExtensions 0.3 | 11.2 | — |
| trace | switch-to-gecko | — | — | **1.5** (main 0.7, TaskCon~ller # 0.5, DOM Worker 0.1, glean.dispatche 0.1, Renderer 0.1) | WebExtensions 0.1, Web Content 0.1, Privileged Cont 0.1 | — | 15016.5 |
| profile | switch-to-engine | — | — | **76.4** (main 25.5, Renderer 12.7, DOM Worker 12.7, SamplerThread 12.7, IPC I/O Parent 6.4) | Web Content 31.8, cef:renderer 25.5, AxioCEFProbe 12.7, cef:gpu-process 6.4 | — | 116.7 |
| profile | idle | — | — | **17.7** (SamplerThread 6.2, DOM Worker 5.3, main 4.3, Timer 1.4, IPDL Background 0.5) | Web Content 6.2, Isolated Web Co 1.4, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 60.0 | 21.3 | **35.2** (main 8.7, DOM Worker 8.7, SamplerThread 8.1, Renderer 2.3, Timer 1.3) | Web Content 6.8, cef:renderer 6.8, cef:gpu-process 3.8, AxioCEFProbe 3.8 | — | — |
| profile | raf-nosampler | — | — | **31.0** (DOM Worker 8.6, SamplerThread 7.6, main 5.3, Renderer 2.3, Backgro~Pool # 1.3) | cef:renderer 7.6, Web Content 6.6, cef:gpu-process 4.6, AxioCEFProbe 4.0 | — | — |
| profile | scroll | 60.1 | 22.1 | **52.0** (main 18.6, DOM Worker 11.7, SamplerThread 8.8, Renderer 2.4, Backgro~Pool # 2.0) | cef:gpu-process 18.6, cef:renderer 9.3, Web Content 7.3, AxioCEFProbe 6.9 | — | — |
| profile | key | — | — | **28.1** (main 9.1, SamplerThread 7.2, DOM Worker 6.6, Renderer 1.4, Timer 1.1) | Web Content 7.2, AxioCEFProbe 1.4, WebExtensions 1.4, Privileged Cont 1.4 | 12.9 | — |
| profile | switch-to-gecko | — | — | **44.7** (main 19.1, BgIOThr~Pool # 6.4, Renderer 6.4, DOM Worker 6.4, SamplerThread 6.4) |  | — | 132.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.4 | 0.0 | 0 | 0.0 | — | — | 7.9 | 0.0 | — | 1.86 | 0.41 | — | — | — | — | — | 0.002 |
| trace | raf | 59.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.10 | 0.08 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.12 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 59.2 | 0.0 | 0 | 0.0 | — | — | 6.8 | 0.0 | — | 0.16 | 0.08 | — | — | — | — | — | 0.005 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.5 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.7 | 0.0 | 0 | 0.0 | — | — | 10.9 | 0.0 | — | 2.01 | 0.74 | — | — | — | — | — | 0.004 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.12 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.13 | 0.11 | — | — | — | — | — | 0.007 |
| profile | scroll | 59.0 | 0.0 | 0 | 0.0 | — | — | 8.4 | 0.0 | — | 0.20 | 0.12 | — | — | — | — | — | 0.008 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.4 | 0.0 | — | 0.45 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 1.317 | 2.458 | 0.0073 | 0.0137 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.036 | 0.079 | 0.0022 | 0.0047 |
| plain | raf-nosampler | memfd | native | 182 | 183 | 0.051 | 0.093 | 0.0031 | 0.0056 |
| plain | scroll | memfd | native | 119 | 119 | 0.109 | 0.136 | 0.0064 | 0.0079 |
| plain | key | memfd | native | 21 | 21 | 0.013 | 0.044 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.897 | 1.495 | 0.0048 | 0.0080 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.040 | 0.081 | 0.0024 | 0.0049 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.055 | 0.094 | 0.0033 | 0.0056 |
| trace | scroll | memfd | native | 121 | 121 | 0.099 | 0.133 | 0.0059 | 0.0079 |
| trace | key | memfd | native | 21 | 21 | 0.011 | 0.046 | 0.0001 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 1.779 | 4.845 | 0.0101 | 0.0276 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 187 | 187 | 0.042 | 0.082 | 0.0025 | 0.0050 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.054 | 0.093 | 0.0032 | 0.0056 |
| profile | scroll | memfd | native | 122 | 122 | 0.116 | 0.151 | 0.0068 | 0.0089 |
| profile | key | memfd | native | 21 | 21 | 0.013 | 0.058 | 0.0001 | 0.0003 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.5 | 0.0 | — | 0.26 | 0.41 | — | — | 5.4 | 7.5 | 13.5 |
| profile | 0.6 | 8.2 | 0.0 | — | 0.45 | 0.71 | — | — | 7.3 | 9.5 | 17.1 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called -21.9; spawn AxioCEFProbe resolved -6.2; write hello -4.0; first stdout read resolved 211.8; write create 213.5; first frame applied (native receiver) 336.2; write frame_ack 336.9; write focus 342.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 18.5; first stdout read resolved 27.9; write shutdown 28.5

Switch timeline (profile, switch-to-engine, ms after the window start): write create 26.1; first stdout read resolved 33.2; first frame applied (native receiver) 125.7; write frame_ack 126.4; write focus 133.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 24.2; first stdout read resolved 32.2; write shutdown 35.7

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 53, Renderer 26, DOM Worker 12, WRRenderBackend 4, BgPool 3, WRSceneBuilder 2, Compositor 2, SwComposite 2, IPC I/O 1, WRWorker 1, Socket 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 53 ms (30.6% of span): Layout 16, Idle 12, Other 10, JavaScript 8, Graphics 5, DOM 2
  - JS leaf 2 / native under JS 21 / native 30; buckets: ipc 53, paint_layout 19, gc_cc 17, poll_wait 13, array_buffer_copy 10, harness_diagnostics 6, worker_messaging 4, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 12; `mozilla::EventTargetChainItem::HandleEvent(mozilla::EventCha` 5; `Servo_ViewTransitionRule_AddRef [libxul.so]` 4; `style::style_adjuster::StyleAdjuster::adjust [libxul.so]` 3; `sendmsg [libc.so.6]` 3; `cssparser::parser::Parser::next_including_whitespace_and_com` 2
  - WebRender/compositor threads: Renderer 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6, `hypotf@@GLIBC_2.35 [libm.so.6]` 3); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__memset_avx512_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 9, poll_wait 9; top self: `poll [libc.so.6]` 9; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 2; `[unknown]` 1; `[axiosozo-dev]` 0
- **tab:4225** CPU ms by thread group: main 38, IPC I/O 0, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (21.4% of span): Other 27, DOM 4, JavaScript 3, Profiler 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 34; buckets: ipc 28, array_buffer_copy 12, gc_cc 11, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 1
  - top self: `[]` 4; `open64 [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall [libc.so.6]` 1; `poll [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4229** CPU ms by thread group: main 21, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (12.2% of span): Other 17, JavaScript 3, Idle 1, DOM 0
  - JS leaf 2 / native under JS 2 / native 17; buckets: ipc 21, gc_cc 8, array_buffer_copy 6, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1, image_container 1
  - top self: `syscall [libc.so.6]` 2; `[]` 2; `next (self-hosted:2415:25)[7]` 1; `mmap64 [libc.so.6]` 1; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 1; `icu_78::LikelySubtagsData::toLanguage(int) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4039** CPU ms by thread group: main 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (1.3% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 78, DOM Worker 73, other 14, IPC I/O 1, Socket 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 78 ms (3.7% of span): Idle 66, JavaScript 5, Other 3, Profiler 1, DOM 1, GC / CC 1
  - JS leaf 1 / native under JS 6 / native 71; buckets: ipc 78, poll_wait 67, harness_diagnostics 6, gc_cc 3, array_buffer_copy 3, worker_messaging 1, engine_stream_read 1, json_metadata 0
  - top self: `poll [libc.so.6]` 66; `mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Compart` 1; `mozilla::dom::TimeoutExecutor::MaybeReschedule(mozilla::Time` 1; `NS_CycleCollectorSuspect3 [libxul.so]` 1; `write [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 73 ms: buckets subprocess_pipe_io 73, worker_messaging 73, ipc 73, js_ctypes 73, poll_wait 73; top self: `poll [libc.so.6]` 73; `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 0
- **tab:4229** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4225** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 248, DOM Worker 198, Renderer 58, WRRenderBackend 35, SwComposite 32, BgPool 29, Compositor 28, other 23, ImageBridge 12, WRSceneBuilder 6, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 248 ms (8.0% of span): Idle 182, JavaScript 38, Other 17, DOM 8, Profiler 2, Graphics 0
  - JS leaf 6 / native under JS 37 / native 204; buckets: ipc 248, poll_wait 193, gc_cc 37, worker_messaging 23, engine_stream_read 18, json_metadata 14, array_buffer_copy 9, subprocess_pipe_io 9
  - top self: `poll [libc.so.6]` 183; `[unknown]` 5; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ModuleObject::environment() const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 58 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 50, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 1); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 32, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0, `webrender::resource_cache::ResourceCache::end_fram` 0); SwComposite 32 ms (top self: `syscall [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 29 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__pthread_enable_asynccancel [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[axiosozo-dev]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 198 ms: buckets subprocess_pipe_io 198, worker_messaging 198, ipc 198, js_ctypes 186, poll_wait 184, gc_cc 3; top self: `poll [libc.so.6]` 184; `[unknown]` 3; `JSStructuredCloneReader::readObjectField(JS::Handl` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:4039** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, gc_cc 3, poll_wait 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::DescribeGCedNode(bool, char const*, unsigned` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::TraceEdgeInternal(JSTracer*, JS::Value*, char const*` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsThread::DoMainThreadSpecificProcessing() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3555** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 195, main 145, Renderer 58, WRRenderBackend 34, BgPool 33, SwComposite 31, Compositor 28, ImageBridge 12, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 145 ms (4.8% of span): Idle 92, JavaScript 29, Other 12, DOM 8, GC / CC 3, Profiler 1
  - JS leaf 4 / native under JS 30 / native 111; buckets: ipc 144, poll_wait 98, gc_cc 40, worker_messaging 21, engine_stream_read 18, json_metadata 14, subprocess_pipe_io 10, array_buffer_copy 6
  - top self: `poll [libc.so.6]` 92; `[unknown]` 6; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 2; `[axiosozo-dev]` 1; `now ([System Principal]:37:15)[2]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 1); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 32, `__memcmp_evex_movbe [libc.so.6]` 0, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 31 ms (top self: `syscall [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 33 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `axio::SinkState::CopyRect(unsigned char*, unsigned` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `profiler_mark_thread_asleep() [libxul.so]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 195 ms: buckets subprocess_pipe_io 195, worker_messaging 194, ipc 194, js_ctypes 184, poll_wait 183, gc_cc 5; top self: `poll [libc.so.6]` 183; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `[axiosozo-dev]` 2; `__strnlen_evex [libc.so.6]` 1; `[unknown]` 1
- **tab:4039** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `nsTSubstring<char>::~nsTSubstring() [libxul.so]` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 0; `mozilla::detail::SprintfAppend::append(char const*, unsigned` 0
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3555** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4229** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 362, DOM Worker 193, Renderer 44, BgPool 37, WRRenderBackend 27, SwComposite 21, Compositor 20, other 15, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 362 ms (17.5% of span): Idle 215, JavaScript 56, Other 46, DOM 14, Graphics 11, Layout 8
  - JS leaf 7 / native under JS 62 / native 293; buckets: ipc 361, poll_wait 270, gc_cc 63, worker_messaging 31, paint_layout 27, engine_stream_read 22, subprocess_pipe_io 16, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 216; `recvmsg [libc.so.6]` 10; `[unknown]` 8; `write [libc.so.6]` 5; `[linux-vdso.so.1]` 4; `[axiosozo-dev]` 4
  - GC/CC markers: GCMinor 1× 5 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 3); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 1, `__lll_lock_wake [libc.so.6]` 0); SwComposite 21 ms (top self: `syscall [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `std::pair<std::__detail::_Node_iterator<std::pair<` 0); BgIOThreadPool #2 1 ms (top self: `open64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `close [libc.so.6]` 0)
  - busiest DOM Worker 193 ms: buckets subprocess_pipe_io 193, worker_messaging 193, ipc 193, js_ctypes 175, poll_wait 168, gc_cc 4; top self: `poll [libc.so.6]` 168; `[axiosozo-dev]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `[unknown]` 2; `read [libc.so.6]` 2
- **tab:3555** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): Idle 2, DOM 1, JavaScript 1
  - JS leaf 0 / native under JS 1 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*,` 1; `js::jit::ICScript::initICEntries(JSContext*, JSScript*) [lib` 1; `[linux-vdso.so.1]` 0; `js::InterpreterFrame::prologue(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4229** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 300, DOM Worker 168, Renderer 46, other 26, SwComposite 15, WRRenderBackend 12, Compositor 12, WRWorker 10, WRSceneBuilder 7, BgPool 2, IPC I/O 2, ImageBridge 1, Socket 0, Canvas 0, ImageIO 0
  - main thread 300 ms (8.2% of span): Idle 133, JavaScript 58, Layout 29, Graphics 28, Other 28, DOM 16
  - JS leaf 11 / native under JS 95 / native 194; buckets: ipc 300, poll_wait 165, gc_cc 64, paint_layout 62, worker_messaging 50, engine_stream_read 27, subprocess_pipe_io 21, array_buffer_copy 17
  - top self: `poll [libc.so.6]` 134; `[unknown]` 12; `[axiosozo-dev]` 8; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 46 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); SwComposite 15 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 10, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0, `webrender::batch::AlphaBatchList::set_params_and_g` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `void std::__introsort_loop<mojo::core::ports::Port` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 168 ms: buckets subprocess_pipe_io 168, worker_messaging 168, ipc 168, js_ctypes 162, poll_wait 155, gc_cc 6; top self: `poll [libc.so.6]` 155; `js::ctypes::FunctionType::Call(JSContext*, unsigne` 2; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::promoteObjectSlow(JSObject` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:3455** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 5; `JS::MaybeGetHostDefinedDataFromJSMicroTask(JSObject*, JS::Mu` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 0; `JSString::tryReplaceWithAtomRef(JSAtom*) [libxul.so]` 0; `JSRuntime::getHostDefinedData(JSContext*, JS::MutableHandle<` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 35, Renderer 11, DOM Worker 9, BgPool 7, Compositor 2, WRRenderBackend 2, WRSceneBuilder 1, SwComposite 1, Socket 0, IPC I/O 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 35 ms (19.6% of span): JavaScript 15, Layout 10, Idle 5, DOM 2, Graphics 1, Profiler 1
  - JS leaf 3 / native under JS 21 / native 11; buckets: ipc 35, paint_layout 16, harness_diagnostics 9, array_buffer_copy 7, poll_wait 6, gc_cc 6, worker_messaging 5, subprocess_pipe_io 4
  - top self: `poll [libc.so.6]` 5; `style::properties::cascade::Declarations::note_declaration [` 2; `js::jit::MacroAssemblerX86Shared::~MacroAssemblerX86Shared()` 2; `[unknown]` 2; `willShowFormattedMixedContentProtocol (moz-src:///browser/co` 2; `IntrinsicSizeOffsets(nsIFrame*, int, bool) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 11 ms (top self: `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 7 ms (top self: `unlink [libc.so.6]` 6, `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 9 ms: buckets subprocess_pipe_io 9, worker_messaging 9, ipc 9, js_ctypes 8, poll_wait 8; top self: `poll [libc.so.6]` 8; `wait4 [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:4039** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.7% of span): Idle 2, Other 0, Layout 0, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 2; `UpdateCurrentHitTestInfo(mozilla::nsDisplayListBuilder*, nsI` 0; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 0; `[]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0; `nsWebBrowser::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3455** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **94.2** (main 43.9, Renderer 25.1, StyleThread# 6.3, WrGlyph~terizer 6.3, WRRende~ckend# 6.3) | AxioCEFProbe 37.7, cef:renderer 18.8, cef:utility 6.3 | — | 128.5 |
| plain | idle | — | — | **3.9** (main 2.4, DOM Worker 1.0, IPC I/O Parent 0.5) | Web Content 2.9 | — | — |
| plain | raf | 60.0 | 21.3 | **23.8** (main 7.8, Renderer 3.2, DOM Worker 3.2, SwComposite 2.3, Backgro~Pool # 1.6) | cef:gpu-process 11.6, cef:renderer 11.4, AxioCEFProbe 7.4, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **21.2** (main 6.3, Renderer 3.0, SwComposite 2.3, DOM Worker 2.3, Backgro~Pool # 2.0) | cef:gpu-process 12.3, cef:renderer 10.3, AxioCEFProbe 6.3 | — | — |
| plain | scroll | 59.9 | 26.5 | **41.5** (main 18.5, DOM Worker 6.3, Backgro~Pool # 5.4, Renderer 3.4, TaskCon~ller # 1.9) | cef:gpu-process 43.9, cef:renderer 12.2, AxioCEFProbe 10.2 | — | — |
| plain | key | — | — | **14.3** (main 6.9, Renderer 1.9, SwComposite 0.8, DOM Worker 0.8, glean.dispatche 0.6) | cef:renderer 2.0, AxioCEFProbe 1.7, cef:gpu-process 0.9, WebExtensions 0.3 | 11.8 | — |
| plain | switch-to-gecko | — | — | **12.0** (DOM Worker 3.4, main 3.3, Indexed~ IO # 2.2, IPDL Background 0.9, TaskCon~ller # 0.9) |  | — | 15244.3 |
| trace | switch-to-engine | — | — | **86.4** (Renderer 55.2, main 20.7, Backgro~Pool # 3.5, Compositor 3.5, DOM Worker 3.5) | AxioCEFProbe 44.9, cef:gpu-process 27.6, cef:utility 13.8, cef:renderer 10.4 | — | 259.9 |
| trace | idle | — | — | **2.9** (main 1.9, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 2.5, Web Content 1.9, cef:zygote 0.5 | — | — |
| trace | raf | 60.1 | 20.8 | **21.2** (main 7.5, Renderer 2.9, DOM Worker 2.9, SwComposite 1.9, Backgro~Pool # 1.6) | cef:renderer 10.4, cef:gpu-process 10.3, AxioCEFProbe 6.4 | — | — |
| trace | raf-nosampler | — | — | **17.8** (main 4.6, Renderer 3.0, DOM Worker 2.7, Backgro~Pool # 2.0, SwComposite 2.0) | cef:gpu-process 11.0, cef:renderer 9.6, AxioCEFProbe 5.7, Web Content 0.3 | — | — |
| trace | scroll | 59.9 | 21.5 | **37.0** (main 15.7, DOM Worker 5.4, Backgro~Pool # 4.4, Renderer 3.0, SwComposite 2.5) | cef:gpu-process 39.4, cef:renderer 11.3, AxioCEFProbe 8.4 | — | — |
| trace | key | — | — | **9.8** (main 5.5, Renderer 1.7, DOM Worker 0.8, SwComposite 0.6, Timer 0.3) | cef:renderer 2.6, AxioCEFProbe 1.4, cef:gpu-process 0.9, WebExtensions 0.3 | 11.1 | — |
| trace | switch-to-gecko | — | — | **1.6** (main 0.6, TaskCon~ller # 0.4, DOM Worker 0.2, Renderer 0.1, glean.dispatche 0.1) | Privileged Cont 0.1, WebExtensions 0.1 | — | 15956.6 |
| profile | switch-to-engine | — | — | **109.7** (Renderer 34.8, main 29.9, SamplerThread 10.0, IPC I/O Parent 5.0, Socket Thread 5.0) | Web Content 54.7, cef:renderer 19.9, AxioCEFProbe 19.9, cef:utility 5.0 | — | 156.4 |
| profile | idle | — | — | **12.5** (SamplerThread 4.8, DOM Worker 3.8, main 2.9, Timer 1.0) | Web Content 4.8, AxioCEFProbe 3.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 60.0 | 26.9 | **38.5** (main 9.7, DOM Worker 7.7, SamplerThread 7.4, Renderer 3.5, SwComposite 2.3) | cef:gpu-process 11.2, cef:renderer 10.6, AxioCEFProbe 7.0, Web Content 5.2 | — | — |
| profile | raf-nosampler | — | — | **30.3** (DOM Worker 6.6, main 6.0, SamplerThread 6.0, Renderer 3.0, SwComposite 2.0) | cef:gpu-process 11.7, cef:renderer 10.0, AxioCEFProbe 6.7, Web Content 5.3 | — | — |
| profile | scroll | 60.0 | 27.6 | **59.7** (main 22.3, DOM Worker 11.1, SamplerThread 7.3, Backgro~Pool # 5.8, Renderer 3.4) | cef:gpu-process 43.6, cef:renderer 13.6, AxioCEFProbe 10.2, Web Content 5.3 | — | — |
| profile | key | — | — | **28.7** (main 7.7, BgIOThr~Pool # 6.1, SamplerThread 5.2, DOM Worker 4.7, Renderer 1.9) | Web Content 5.5, AxioCEFProbe 2.9, cef:renderer 1.9, WebExtensions 1.4 | 13.0 | — |
| profile | switch-to-gecko | — | — | **3.3** (SamplerThread 2.1, DOM Worker 0.4, main 0.3, Renderer 0.1, Compositor 0.1) | Web Content 5.9, WebExtensions 1.1, Privileged Cont 1.1, Isolated Web Co 1.1 | — | 15025.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.6 | 0.0 | 0 | 0.0 | — | — | 26.3 | 0.0 | — | 2.93 | 0.65 | — | — | — | — | — | 0.004 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.17 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.18 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 8.7 | 0.0 | — | 0.40 | 0.12 | — | — | — | — | — | 0.008 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.6 | 0.0 | — | 0.27 | 0.09 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 9.0 | 0.0 | 0 | 0.0 | — | — | 8.5 | 0.0 | — | 5.46 | 0.65 | — | — | — | — | — | 0.006 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.19 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.21 | 0.15 | — | — | — | — | — | 0.009 |
| profile | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 10.8 | 0.0 | — | 0.50 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.3 | 0.0 | — | 0.33 | 0.10 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 4.221 | 4.479 | 0.0239 | 0.0254 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.106 | 0.162 | 0.0064 | 0.0098 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.113 | 0.165 | 0.0068 | 0.0099 |
| plain | scroll | memfd | native | 121 | 121 | 0.390 | 0.462 | 0.0229 | 0.0271 |
| plain | key | memfd | native | 21 | 21 | 0.035 | 0.135 | 0.0002 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 2.571 | 3.852 | 0.0169 | 0.0254 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.104 | 0.154 | 0.0063 | 0.0092 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.113 | 0.162 | 0.0068 | 0.0097 |
| trace | scroll | memfd | native | 121 | 121 | 0.333 | 0.392 | 0.0197 | 0.0232 |
| trace | key | memfd | native | 21 | 21 | 0.028 | 0.110 | 0.0002 | 0.0006 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 4.163 | 4.676 | 0.0376 | 0.0422 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 187 | 187 | 0.116 | 0.177 | 0.0070 | 0.0106 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.118 | 0.178 | 0.0071 | 0.0107 |
| profile | scroll | memfd | native | 123 | 123 | 0.459 | 0.503 | 0.0271 | 0.0297 |
| profile | key | memfd | native | 21 | 21 | 0.032 | 0.098 | 0.0002 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 6.5 | 0.0 | — | 0.24 | 0.41 | — | — | 6.9 | 7.5 | 15.0 |
| profile | 0.7 | 8.2 | 0.0 | — | 0.32 | 0.53 | — | — | 7.4 | 9.4 | 17.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 93.3; write create 106.5; first frame applied (native receiver) 267.8; write frame_ack 268.9; write focus 274.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 17.9; first stdout read resolved 25.2; write shutdown 28.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 31.2; first stdout read resolved 51.0; first frame applied (native receiver) 167.6; write frame_ack 168.6; write focus 178.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 20.1; first stdout read resolved 26.0; write shutdown 35.7

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 65, Renderer 51, DOM Worker 14, BgPool 13, Compositor 5, WRRenderBackend 4, SwComposite 4, WRSceneBuilder 3, IPC I/O 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 65 ms (29.3% of span): JavaScript 12, Other 12, DOM 12, Layout 12, Idle 12, Graphics 4
  - JS leaf 0 / native under JS 32 / native 33; buckets: ipc 65, gc_cc 29, paint_layout 25, poll_wait 12, worker_messaging 10, harness_diagnostics 10, array_buffer_copy 10, json_metadata 6
  - top self: `poll [libc.so.6]` 12; `nsNodeSupportsWeakRefTearoff::GetWeakReference(nsIWeakRefere` 8; `JS::NewStringFromKnownLiveTwoByteBuffer(JSContext*, mozilla:` 5; `js::EnvironmentIter::settle() [libxul.so]` 5; `mozilla::StyleGenericSize<mozilla::StyleLengthPercentage>::~` 4; `__lll_lock_wake [libc.so.6]` 4
  - WebRender/compositor threads: Renderer 51 ms (top self: `webrender::renderer::Renderer::draw_alpha_batch_co` 8, `hypotf@@GLIBC_2.35 [libm.so.6]` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 13 ms (top self: `ARGBSetRow_X86 [libxul.so]` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memset_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 12, poll_wait 12, array_buffer_copy 0; top self: `poll [libc.so.6]` 12; `nsTSubstring<char>::StartBulkWriteImpl(unsigned lo` 1; `__lll_lock_wake [libc.so.6]` 0
- **tab:4200** CPU ms by thread group: main 39, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (20.4% of span): Other 27, DOM 4, JavaScript 4, Profiler 2, Idle 2
  - JS leaf 0 / native under JS 5 / native 34; buckets: ipc 30, array_buffer_copy 13, gc_cc 8, subprocess_pipe_io 4, poll_wait 3, memcpy_memset 2
  - top self: `access [libc.so.6]` 4; `atp_set_real_time_limit [libxul.so]` 3; `js::XDRStencilDecoder::codeStencil(JS::ReadOnlyDecodeOptions` 2; `poll [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4205** CPU ms by thread group: main 39, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (22.8% of span): Other 28, Profiler 4, JavaScript 4, DOM 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 36; buckets: ipc 29, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 3, poll_wait 2, image_container 1, memcpy_memset 0, json_metadata 0
  - top self: `__lll_lock_wake [libc.so.6]` 3; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 3; `[]` 2; `[libexpat.so.1]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `readlink [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4010** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 2, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 0
  - top self: `poll [libc.so.6]` 2; `nsIFrame::GetBorderRadii(nsSize const&, nsSize const&, mozil` 0; `nsLayoutUtils::ShouldHandleMetaViewport(mozilla::dom::Docume` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 52, DOM Worker 38, other 10, IPC I/O 0, Socket 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 52 ms (2.5% of span): Idle 45, JavaScript 5, Other 2, DOM 1, Profiler 0
  - JS leaf 1 / native under JS 5 / native 47; buckets: ipc 52, poll_wait 46, harness_diagnostics 5, gc_cc 4, array_buffer_copy 3, subprocess_pipe_io 2, native_receiver 0, json_metadata 0
  - top self: `poll [libc.so.6]` 45; `recvmsg [libc.so.6]` 1; `[unknown]` 1; `js::frontend::EmitterScope::lookupInCache(js::frontend::Byte` 1; `toString (chrome://remote/content/marionette/message.sys.mjs` 1; `write [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 38 ms: buckets subprocess_pipe_io 38, js_ctypes 38, worker_messaging 38, ipc 38, poll_wait 38; top self: `poll [libc.so.6]` 38; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0
- **tab:4205** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4200** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4010** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 265, DOM Worker 162, Renderer 102, SwComposite 64, BgPool 60, WRRenderBackend 48, Compositor 32, other 22, ImageBridge 13, WRSceneBuilder 7, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 265 ms (8.5% of span): Idle 178, JavaScript 51, Other 21, DOM 11, Profiler 3, GC / CC 2
  - JS leaf 7 / native under JS 50 / native 208; buckets: ipc 265, poll_wait 189, gc_cc 60, worker_messaging 31, engine_stream_read 25, json_metadata 19, subprocess_pipe_io 17, native_receiver 12
  - top self: `poll [libc.so.6]` 179; `[unknown]` 8; `recvmsg [libc.so.6]` 7; `[axiosozo-dev]` 3; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 101 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 73, `__memmove_avx512_unaligned_erms [libc.so.6]` 15, `syscall [libc.so.6]` 5); SwComposite 64 ms (top self: `syscall [libc.so.6]` 60, `__memmove_avx512_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 60 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `mozilla::layers::TextureClientRecycleAllocator::Cr` 0); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13, `__lll_lock_wake [libc.so.6]` 0, `std::pair<std::__detail::_Node_iterator<std::pair<` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 162 ms: buckets subprocess_pipe_io 162, worker_messaging 162, ipc 162, js_ctypes 151, poll_wait 150, memcpy_memset 3; top self: `poll [libc.so.6]` 150; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `[unknown]` 2; `write [libc.so.6]` 1; `mozilla::dom::WorkerPrivate::DoRunLoop(JSContext*)` 1
- **tab:4010** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Other 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, gc_cc 1, poll_wait 1
  - top self: `mozilla::RunnableTask::SetIdleDeadline(mozilla::TimeStamp) [` 1; `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 0; `nsQueryReferent::operator()(nsID const&, void**) const [libx` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3498** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): DOM 1, Idle 1, JavaScript 0
  - JS leaf 0 / native under JS 2 / native 1; buckets: ipc 3, poll_wait 1, gc_cc 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `js::StableCellHasher<js::WeakHeapPtr<js::GlobalObject*> >::m` 0; `prctl [libc.so.6]` 0; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3480** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: main 173, DOM Worker 152, Renderer 90, BgPool 59, SwComposite 58, WRRenderBackend 43, Compositor 30, ImageBridge 12, WRSceneBuilder 7, other 1, IPC I/O 0, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 173 ms (5.7% of span): Idle 105, JavaScript 41, Other 14, DOM 9, GC / CC 3, Profiler 1
  - JS leaf 4 / native under JS 46 / native 124; buckets: ipc 173, poll_wait 109, gc_cc 54, worker_messaging 31, engine_stream_read 22, json_metadata 18, subprocess_pipe_io 10, native_receiver 8
  - top self: `poll [libc.so.6]` 103; `[unknown]` 9; `recvmsg [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 2; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 90 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 16, `writev [libc.so.6]` 2); SwComposite 58 ms (top self: `syscall [libc.so.6]` 55, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `std::sys::backtrace::__rust_begin_short_backtrace ` 0); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 59 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `__lll_lock_wait [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 152 ms: buckets subprocess_pipe_io 152, worker_messaging 152, ipc 152, js_ctypes 146, poll_wait 145, gc_cc 3; top self: `poll [libc.so.6]` 145; `[axiosozo-dev]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `JS::NewArrayBufferWithContents(JSContext*, unsigne` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:4200** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsTHashtable<nsBaseHashtableET<nsIntegralHashKey<long, 0>, R` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3480** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4205** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 444, DOM Worker 196, BgPool 116, Renderer 70, SwComposite 37, WRRenderBackend 34, Compositor 25, other 16, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 444 ms (21.3% of span): Idle 236, JavaScript 100, Other 50, DOM 24, Layout 18, Graphics 12
  - JS leaf 10 / native under JS 106 / native 327; buckets: ipc 443, poll_wait 309, gc_cc 95, paint_layout 51, worker_messaging 45, engine_stream_read 39, json_metadata 27, subprocess_pipe_io 20
  - top self: `poll [libc.so.6]` 240; `[unknown]` 25; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 4; `mozilla::Vector<unsigned char, 80ul, js::StringBuilderAllocP` 4; `mozilla::dom::Event::SetOwner(mozilla::dom::EventTarget*) [l` 4
  - WebRender/compositor threads: Renderer 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 48, `syscall [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 5); SwComposite 37 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 27, `sched_yield [libc.so.6]` 3, `[linux-vdso.so.1]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 116 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 76, `__memmove_avx512_unaligned_erms [libc.so.6]` 37, `[linux-vdso.so.1]` 1); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `mojo::core::ports::Node::PrepareToForwardUserMessa` 0, `mozilla::ProfileBufferBlockIndex profiler_add_mark` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 196 ms: buckets subprocess_pipe_io 196, worker_messaging 196, ipc 196, js_ctypes 171, poll_wait 164, gc_cc 8; top self: `poll [libc.so.6]` 164; `getcontext [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `read [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2
- **tab:3459** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `mozilla::TaskController::ExecuteNextTaskOnlyMainThreadIntern` 0; `mozilla::CycleCollectedJSRuntime::FinalizeDeferredThings(moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4015** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4200** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 258, BgPool 227, DOM Worker 102, Renderer 71, SwComposite 27, other 19, WRRenderBackend 15, Compositor 12, WRWorker 9, WRSceneBuilder 7, ImageBridge 1, IPC I/O 1, Socket 1, Canvas 0, ImageIO 0
  - main thread 258 ms (7.1% of span): Idle 103, JavaScript 54, Layout 28, Graphics 27, Other 25, DOM 12
  - JS leaf 12 / native under JS 81 / native 166; buckets: ipc 258, poll_wait 137, paint_layout 63, gc_cc 57, worker_messaging 41, engine_stream_read 28, subprocess_pipe_io 12, array_buffer_copy 9
  - top self: `poll [libc.so.6]` 103; `[unknown]` 10; `[axiosozo-dev]` 6; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&,` 5; `mozilla::nsDisplayListBuilder::AllocateDisplayItemClipChain(` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 71 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `void commit_solid_span<true>(unsigned int*, unsign` 6); SwComposite 27 ms (top self: `syscall [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 224 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 213, `write [libc.so.6]` 9, `close [libc.so.6]` 1); BackgroundThreadPool #3 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 102 ms: buckets subprocess_pipe_io 102, worker_messaging 102, ipc 102, js_ctypes 98, poll_wait 97, gc_cc 2; top self: `poll [libc.so.6]` 97; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1; `read [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:3412** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `__strlen_evex [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `js::ReactToUnwrappedPromise(JSContext*, JS::Handle<js::Promi` 0; `[]` 0; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3498** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3459** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 54, DOM Worker 50, Renderer 23, BgPool 7, IPC I/O 4, Compositor 4, SwComposite 2, WRRenderBackend 2, other 2, WRSceneBuilder 2, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 54 ms (0.4% of span): Idle 20, JavaScript 10, Layout 9, Other 5, DOM 4, GC / CC 3
  - JS leaf 2 / native under JS 18 / native 34; buckets: ipc 54, poll_wait 21, paint_layout 14, gc_cc 8, array_buffer_copy 7, harness_diagnostics 6, memcpy_memset 4, worker_messaging 0
  - top self: `poll [libc.so.6]` 21; `madvise [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `nsImageFrame::QueryFrame(nsQueryFrame::FrameIID) const [libx` 1
  - GC/CC markers: GCMinor 3× 3 ms
  - WebRender/compositor threads: Renderer 23 ms (top self: `ps_quad_repeat_frag::pattern_fragment(glsl::vec4) ` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `writev [libc.so.6]` 3); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 6 ms (top self: `unlink [libc.so.6]` 5, `__open_nocancel [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 50 ms: buckets subprocess_pipe_io 50, worker_messaging 50, ipc 50, gc_cc 44, poll_wait 7, memcpy_memset 7; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `madvise [libc.so.6]` 5; `poll [libc.so.6]` 5; `mozilla::SourceLocation::~SourceLocation() [libxul` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:4010** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Layout 1, Other 0, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1, gc_cc 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedPropMa` 0; `mozilla::dom::Document::CollectDescendantDocuments(nsTArray<` 0; `mozilla::PresShell::GetRootScrollContainerFrame() const [lib` 0; `[]` 0; `nsSHistory::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3459** CPU ms by thread group: main 2, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3498** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

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

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **40.2** (main 17.8, Renderer 8.9, glean.dispatche 4.5, WRRende~ckend# 4.5, DOM Worker 4.5) | WPEWebProcess 71.3, WPENetworkProce 13.4, AxioWebKitHost 4.5 | — | 194.1 |
| plain | idle | — | — | **8.3** (main 6.3, Timer 1.0, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.9, AxioWebKitHost 0.5, WebExtensions 0.5 | — | — |
| plain | raf | 58.2 | 25.5 | **23.0** (main 10.4, Renderer 2.3, DOM Worker 2.3, TaskCon~ller # 1.3, Timer 1.0) | WPEWebProcess 59.6, AxioWebKitHost 6.2, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **14.6** (main 4.0, DOM Worker 2.7, Renderer 2.3, WRRende~ckend# 1.0, Compositor 1.0) | WPEWebProcess 57.2, AxioWebKitHost 5.9, WebExtensions 0.3 | — | — |
| plain | scroll | 57.9 | 32.2 | **38.3** (main 19.0, DOM Worker 6.3, TaskCon~ller # 2.0, Renderer 2.0, WRRende~ckend# 2.0) | WPEWebProcess 64.0, AxioWebKitHost 8.4 | — | — |
| plain | key | — | — | **15.9** (main 10.4, Renderer 1.4, DOM Worker 1.1, Timer 0.5, TaskCon~ller # 0.5) | WPEWebProcess 6.9, AxioWebKitHost 2.2 | 18.3 | — |
| plain | switch-to-gecko | — | — | **12.6** (main 8.4, sqldb:p~lite # 4.2) | Isolated Web Co 4.2 | — | 211.8 |
| trace | switch-to-engine | — | — | **30.6** (main 13.9, Renderer 11.1, glean.dispatche 2.8, WRRende~ckend# 2.8) | WPEWebProcess 75.0, WPENetworkProce 8.3 | — | 333.2 |
| trace | idle | — | — | **10.3** (main 7.8, TaskCon~ller # 1.5, Timer 0.5, DOM Worker 0.5) | Web Content 3.9 | — | — |
| trace | raf | 58.1 | 27.3 | **38.0** (main 17.6, DOM Worker 5.2, TaskCon~ller # 3.3, Renderer 2.3, IPDL Background 1.3) | WPEWebProcess 60.7, AxioWebKitHost 7.2, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **16.5** (main 4.0, DOM Worker 3.7, Renderer 2.0, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 59.5, AxioWebKitHost 6.0 | — | — |
| trace | scroll | 56.9 | 33.5 | **39.6** (main 18.7, DOM Worker 7.9, Renderer 2.5, Backgro~Pool # 2.0, TaskCon~ller # 1.5) | WPEWebProcess 64.1, AxioWebKitHost 8.4 | — | — |
| trace | key | — | — | **19.5** (main 11.0, TaskCon~ller # 1.6, Renderer 1.4, DOM Worker 1.4, Timer 1.1) | WPEWebProcess 6.3, AxioWebKitHost 1.4, WebExtensions 0.3 | 17.9 | — |
| trace | switch-to-gecko | — | — | **21.5** (main 8.6, BgIOThr~Pool # 4.3, Renderer 4.3, DOM Worker 4.3) | Isolated Web Co 4.3 | — | 212.3 |
| profile | switch-to-engine | — | — | **57.6** (main 14.4, DOM Worker 14.4, SamplerThread 14.4, glean.dispatche 3.6, Renderer 3.6) | WPEWebProcess 72.1, Web Content 10.8, AxioWebKitHost 7.2, WPENetworkProce 7.2 | — | 245.2 |
| profile | idle | — | — | **25.1** (main 7.7, SamplerThread 7.7, DOM Worker 7.3, Timer 1.9, glean.dispatche 0.5) | Web Content 6.8, WebExtensions 1.9, Privileged Cont 1.9, Socket Process 1.5 | — | — |
| profile | raf | 57.9 | 20.9 | **49.7** (main 14.3, DOM Worker 11.0, SamplerThread 10.0, Renderer 2.9, Timer 1.9) | WPEWebProcess 65.1, AxioWebKitHost 8.3, Web Content 7.8, Isolated Web Co 1.9 | — | — |
| profile | raf-nosampler | — | — | **38.2** (DOM Worker 10.6, SamplerThread 8.9, main 7.3, Renderer 3.0, WRRende~ckend# 1.7) | WPEWebProcess 66.3, AxioWebKitHost 7.3, Web Content 7.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 57.2 | 31.8 | **64.1** (main 25.6, DOM Worker 14.5, SamplerThread 10.2, Renderer 2.9, Backgro~Pool # 2.9) | WPEWebProcess 66.3, AxioWebKitHost 9.3, Web Content 6.8, WebExtensions 1.5 | — | — |
| profile | key | — | — | **44.3** (main 17.5, SamplerThread 9.3, DOM Worker 8.8, TaskCon~ller # 2.2, Timer 1.6) | Web Content 7.7, WPEWebProcess 6.6, Privileged Cont 2.2, Isolated Web Co 1.9 | 18.0 | — |
| profile | switch-to-gecko | — | — | **53.2** (main 16.3, BgIOThr~Pool # 8.2, DOM Worker 8.2, Timer 4.1, Renderer 4.1) | Isolated Web Co 8.2 | — | 218.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.1 | 0.0 | 0 | 0.0 | — | — | 121.3 | 0.0 | — | 0.67 | 0.37 | — | — | — | — | — | 0.002 |
| trace | raf | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.12 | 0.10 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 58.4 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.12 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 55.7 | 0.0 | 0 | 0.0 | — | — | 10.8 | 0.0 | — | 0.24 | 0.09 | — | — | — | — | — | 0.005 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.5 | 0.0 | — | 0.08 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 6.6 | 0.0 | 0 | 0.0 | — | — | 72.6 | 0.0 | — | 1.07 | 0.55 | — | — | — | — | — | 0.004 |
| profile | raf | 58.0 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.16 | 0.14 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.18 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 56.1 | 0.0 | 0 | 0.0 | — | — | 11.3 | 0.0 | — | 0.35 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.9 | 0.0 | — | 0.14 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.436 | 0.689 | 0.0036 | 0.0057 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.032 | 0.062 | 0.0019 | 0.0036 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.043 | 0.082 | 0.0025 | 0.0047 |
| plain | scroll | memfd | native | 117 | 117 | 0.138 | 0.196 | 0.0078 | 0.0111 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.077 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.460 | 1.345 | 0.0023 | 0.0068 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.037 | 0.069 | 0.0022 | 0.0040 |
| trace | raf-nosampler | memfd | native | 176 | 176 | 0.039 | 0.076 | 0.0022 | 0.0044 |
| trace | scroll | memfd | native | 114 | 114 | 0.145 | 0.207 | 0.0081 | 0.0115 |
| trace | key | memfd | native | 20 | 20 | 0.000 | 0.064 | 0.0000 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.880 | 0.732 | 0.0058 | 0.0048 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.049 | 0.093 | 0.0028 | 0.0054 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.060 | 0.100 | 0.0035 | 0.0057 |
| profile | scroll | memfd | native | 117 | 117 | 0.210 | 0.229 | 0.0118 | 0.0129 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.069 | 0.0000 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 13.8 | 0.0 | — | 0.08 | 0.28 | — | — | 12.9 | 14.5 | 28.2 |
| profile | 0.6 | 14.2 | 0.0 | — | 0.14 | 0.48 | — | — | 10.8 | 15.5 | 25.6 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 46.9; first stdout read resolved 52.7; first frame applied (native receiver) 371.4; write frame_ack 372.0; write visibility 376.4; write focus 376.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 16.7; first stdout read resolved 22.2

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.5; first stdout read resolved 41.9; first frame applied (native receiver) 264.9; write frame_ack 265.8; write visibility 273.6; write focus 273.8

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 27.8; first stdout read resolved 36.3

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 37, DOM Worker 22, Renderer 12, BgPool 3, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, IPC I/O 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 37 ms (12.4% of span): JavaScript 22, Other 4, Idle 4, Graphics 3, Layout 3, Profiler 1
  - JS leaf 4 / native under JS 20 / native 14; buckets: ipc 37, gc_cc 16, array_buffer_copy 11, harness_diagnostics 8, engine_stream_read 7, paint_layout 7, worker_messaging 5, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[unknown]` 4; `goSetCommandEnabled (chrome://global/content/globalOverlay.j` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [` 2
  - WebRender/compositor threads: Renderer 12 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 3, `ps_quad_textured_TEXTURE_2D_frag::swgl_drawSpanRGB` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 1, `[axiosozo-dev]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 22 ms: buckets subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 18, poll_wait 16, memcpy_memset 3; top self: `__syscall_cancel_arch [libc.so.6]` 16; `[axiosozo-dev]` 2; `ffi_call_plan_invoke [libxul.so]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7843** CPU ms by thread group: main 37, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (12.4% of span): Other 27, DOM 5, Profiler 4, JavaScript 1, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 32; buckets: ipc 36, array_buffer_copy 19, gc_cc 7, memcpy_memset 1, subprocess_pipe_io 1, poll_wait 0
  - top self: `__lll_lock_wake [libc.so.6]` 4; `[libexpat.so.1]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `access [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::TokenizerBase<char>::Token::Token() [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7696** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `nsTString<char>* nsTArray_Impl<nsTString<char>, nsTArrayInfa` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7849** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0
  - top self: `PR_IntervalNow [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 145, DOM Worker 95, other 19, Socket 1, IPC I/O 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 145 ms (7.0% of span): Idle 111, JavaScript 14, Other 8, DOM 6, GC / CC 5, Profiler 1
  - JS leaf 3 / native under JS 18 / native 125; buckets: ipc 144, poll_wait 116, harness_diagnostics 20, gc_cc 8, array_buffer_copy 4, engine_stream_read 4, native_receiver 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 114; `[axiosozo-dev]` 2; `[unknown]` 1; `mozilla::dom::WindowGlobalParent::cycleCollection::TraverseN` 1; `js::jit::GetPropIRGenerator::tryAttachArgumentsObjectIterato` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 95 ms: buckets subprocess_pipe_io 95, js_ctypes 95, worker_messaging 95, ipc 95, poll_wait 95; top self: `__syscall_cancel_arch [libc.so.6]` 95
- **tab:7696** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::RestyleManager::ProcessPostTraversal(mozilla::dom::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7351** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 403, DOM Worker 250, Renderer 82, WRRenderBackend 48, SwComposite 40, Compositor 38, BgPool 33, other 31, ImageBridge 16, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 403 ms (13.0% of span): Idle 275, JavaScript 62, Other 37, DOM 22, Profiler 6, GC / CC 2
  - JS leaf 8 / native under JS 74 / native 321; buckets: ipc 402, poll_wait 296, gc_cc 67, engine_stream_read 46, worker_messaging 30, harness_diagnostics 27, subprocess_pipe_io 13, native_receiver 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 12; `mprotect [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 71, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 3); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 40 ms (top self: `syscall [libc.so.6]` 38, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 28, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `mozilla::ipc::PortLink::SendMessage(std::unique_pt` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 250 ms: buckets subprocess_pipe_io 250, worker_messaging 250, ipc 250, js_ctypes 227, poll_wait 222, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 223; `[unknown]` 3; `[axiosozo-dev]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7696** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 250, main 208, Renderer 79, WRRenderBackend 46, Compositor 38, SwComposite 37, BgPool 35, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 208 ms (6.8% of span): Idle 116, JavaScript 56, Other 25, DOM 10, Profiler 1
  - JS leaf 9 / native under JS 55 / native 145; buckets: ipc 207, poll_wait 130, gc_cc 67, engine_stream_read 47, worker_messaging 31, subprocess_pipe_io 11, array_buffer_copy 11, native_receiver 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 127; `[unknown]` 10; `[axiosozo-dev]` 3; `next (self-hosted:392:27)[28]` 3; `mprotect [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 79 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 4); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 37 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 34 ms (top self: `__syscall_cancel_arch [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 16 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `[linux-vdso.so.1]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 235 ms: buckets subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 221, poll_wait 215, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 217; `[axiosozo-dev]` 2; `[unknown]` 1; `mozilla::dom::AutoYieldJSThreadExecution::AutoYiel` 1; `js::ctypes::ConvertToJS(JSContext*, JS::Handle<JSO` 1
- **tab:7324** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 503, DOM Worker 241, BgPool 53, Renderer 51, WRRenderBackend 33, Compositor 25, SwComposite 22, other 20, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 503 ms (24.2% of span): Idle 268, JavaScript 105, Other 60, DOM 33, Graphics 18, Profiler 10
  - JS leaf 8 / native under JS 129 / native 366; buckets: ipc 502, poll_wait 336, gc_cc 108, engine_stream_read 84, worker_messaging 60, paint_layout 49, harness_diagnostics 38, array_buffer_copy 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 18; `[axiosozo-dev]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 51 ms (top self: `__syscall_cancel_arch [libc.so.6]` 39, `syscall [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 22 ms (top self: `syscall [libc.so.6]` 21, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 53 ms (top self: `__syscall_cancel_arch [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `mozilla::ipc::MessagePumpForNonMainThreads::Run(ba` 0, `IPC::ParamTraits<mozilla::layers::CompositableOper` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 241 ms: buckets subprocess_pipe_io 241, worker_messaging 241, ipc 241, js_ctypes 204, poll_wait 198, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 199; `[axiosozo-dev]` 4; `[unknown]` 3; `JSStructuredCloneReader::read(JS::MutableHandle<JS` 3; `__lll_lock_wait [libc.so.6]` 3
- **tab:7351** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7324** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 589, DOM Worker 215, Renderer 52, other 33, SwComposite 18, Compositor 17, WRRenderBackend 14, WRWorker 11, WRSceneBuilder 9, BgPool 2, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 589 ms (16.1% of span): Idle 230, GC / CC 95, JavaScript 92, Layout 47, Other 43, Graphics 37
  - JS leaf 15 / native under JS 151 / native 424; buckets: ipc 585, poll_wait 273, gc_cc 190, paint_layout 97, worker_messaging 76, engine_stream_read 67, harness_diagnostics 29, memcpy_memset 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `[axiosozo-dev]` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 7; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 5
  - GC/CC markers: GCMajor 2× 1371 ms, GCSlice 17× 68 ms, CCSlice 7× 24 ms, GCMinor 3× 4 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 52 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `syscall [libc.so.6]` 6); SwComposite 18 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 3, `webrender::texture_cache::TextureCache::try_get_ca` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 215 ms: buckets subprocess_pipe_io 215, worker_messaging 215, ipc 215, js_ctypes 206, poll_wait 201, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 201; `js::NativeObject::create(JSContext*, js::gc::Alloc` 1; `[unknown]` 1; `JSObject::allocKindForTenure(js::Nursery const&) c` 1; `js::gc::StoreBuffer::MonoTypeBuffer<js::gc::StoreB` 1
- **tab:7242** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `JSStructuredCloneWriter::writeTransferMap() [libxul.so]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `nsWindowRoot::Release() [libxul.so]` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 0; `JSStructuredCloneReader::readObjectField(JS::Handle<JSObject` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7324** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 65, Renderer 18, DOM Worker 13, BgPool 11, Compositor 2, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, SwComposite 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (22.8% of span): JavaScript 27, Idle 10, Other 8, Layout 6, Graphics 5, DOM 5
  - JS leaf 3 / native under JS 35 / native 27; buckets: ipc 65, poll_wait 17, array_buffer_copy 16, gc_cc 14, paint_layout 12, harness_diagnostics 10, engine_stream_read 5, worker_messaging 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `mprotect [libc.so.6]` 4; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayL` 3; `nsIFrame::IsTransformed() const [libxul.so]` 3
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `__syscall_cancel_arch [libc.so.6]` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `rmdir [libc.so.6]` 4, `unlink [libc.so.6]` 3, `__open_nocancel [libc.so.6]` 2); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, js_ctypes 12, poll_wait 12; top self: `__syscall_cancel_arch [libc.so.6]` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `[unknown]` 0
- **tab:7696** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.2% of span): Other 9, JavaScript 7, Idle 5, Layout 4, GC / CC 1
  - JS leaf 0 / native under JS 8 / native 18; buckets: ipc 25, paint_layout 13, gc_cc 10, subprocess_pipe_io 6, poll_wait 5, harness_diagnostics 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libfontconfig.so.1]` 4; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, J` 2; `nsBaseURLParser::ParsePath(char const*, int, unsigned int*, ` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `mozilla::net::nsStandardURL::CoalescePath(char*) [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7242** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, DOM 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7843** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **58.2** (DOM Worker 23.3, Renderer 15.5, main 11.6, TaskCon~ller # 3.9, WRRende~ckend# 3.9) | WPEWebProcess 77.6, WPENetworkProce 11.6, AxioWebKitHost 7.8 | — | 235.1 |
| plain | idle | — | — | **7.3** (main 6.3, Timer 0.5, DOM Worker 0.5) | Web Content 3.9, forkserver 0.5 | — | — |
| plain | raf | 58.0 | 26.5 | **37.1** (main 13.3, Renderer 5.1, DOM Worker 3.5, SwComposite 3.2, Socket Thread 2.5) | WPEWebProcess 182.2, AxioWebKitHost 18.0 | — | — |
| plain | raf-nosampler | — | — | **28.5** (main 5.3, Renderer 5.3, DOM Worker 4.0, SwComposite 3.3, Backgro~Pool # 2.6) | WPEWebProcess 181.3, AxioWebKitHost 18.2 | — | — |
| plain | scroll | 56.0 | 27.6 | **48.1** (main 20.1, DOM Worker 7.7, Backgro~Pool # 7.2, Renderer 4.8, SwComposite 2.9) | WPEWebProcess 187.1, AxioWebKitHost 18.7 | — | — |
| plain | key | — | — | **81.7** (main 23.8, DOM Worker 21.9, IndexedDB IO # 15.8, IPDL Background 6.0, Renderer 3.0) | WPEWebProcess 18.0, AxioWebKitHost 2.0, RDD Process 0.5, Privileged Cont 0.3 | 28.7 | — |
| plain | switch-to-gecko | — | — | **48.9** (main 20.3, Renderer 12.2, IPDL Background 4.1, BgIOThr~Pool # 4.1, DOM Worker 4.1) | Isolated Web Co 4.1 | — | 214.5 |
| trace | switch-to-engine | — | — | **96.1** (Renderer 67.0, main 14.6, Backgro~Pool # 5.8, glean.dispatche 2.9, WRRende~ckend# 2.9) | WPEWebProcess 75.7, WPENetworkProce 8.7, AxioWebKitHost 5.8 | — | 318.0 |
| trace | idle | — | — | **13.6** (main 8.7, TaskCon~ller # 2.4, DOM Worker 1.5, Timer 1.0) | Web Content 1.0, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.9 | 26.7 | **30.7** (main 11.0, Renderer 5.2, DOM Worker 3.6, SwComposite 3.2, Backgro~Pool # 2.3) | WPEWebProcess 180.9, AxioWebKitHost 17.1 | — | — |
| trace | raf-nosampler | — | — | **25.9** (main 5.6, Renderer 5.3, SwComposite 3.3, DOM Worker 3.3, Backgro~Pool # 3.0) | WPEWebProcess 181.7, AxioWebKitHost 17.6 | — | — |
| trace | scroll | 56.6 | 31.9 | **48.0** (main 20.6, DOM Worker 8.1, Backgro~Pool # 7.2, Renderer 4.3, SwComposite 2.9) | WPEWebProcess 185.8, AxioWebKitHost 19.2 | — | — |
| trace | key | — | — | **18.9** (main 9.9, Renderer 2.7, SwComposite 1.4, DOM Worker 1.4, Timer 0.8) | WPEWebProcess 16.9, AxioWebKitHost 2.2, WebExtensions 0.5 | 24.7 | — |
| trace | switch-to-gecko | — | — | **25.6** (main 8.5, Renderer 8.5, BgIOThr~Pool # 4.3, WRRende~ckend# 4.3) | Isolated Web Co 4.3 | — | 213.2 |
| profile | switch-to-engine | — | — | **26.4** (main 11.7, DOM Worker 5.9, SamplerThread 5.9, Renderer 2.9) | WPEWebProcess 70.4, Web Content 58.7, AxioWebKitHost 5.9, WPENetworkProce 5.9 | — | 308.7 |
| profile | idle | — | — | **24.5** (main 7.7, SamplerThread 7.7, DOM Worker 7.2, Timer 1.9) | Web Content 7.7, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 58.0 | 24.8 | **55.4** (main 15.7, DOM Worker 10.2, SamplerThread 9.6, Renderer 6.4, Backgro~Pool # 2.9) | WPEWebProcess 184.0, AxioWebKitHost 18.5, Web Content 7.0, WebExtensions 1.9 | — | — |
| profile | raf-nosampler | — | — | **46.3** (DOM Worker 9.9, SamplerThread 8.6, main 7.3, Renderer 6.0, Backgro~Pool # 3.3) | WPEWebProcess 185.2, AxioWebKitHost 18.2, Web Content 6.0, Isolated Web Co 1.7 | — | — |
| profile | scroll | 55.8 | 33.9 | **74.4** (main 27.5, DOM Worker 13.3, SamplerThread 9.0, Backgro~Pool # 7.6, Renderer 5.2) | WPEWebProcess 188.8, AxioWebKitHost 19.4, Web Content 6.6, WebExtensions 1.9 | — | — |
| profile | key | — | — | **44.6** (main 13.9, DOM Worker 9.6, SamplerThread 9.6, Renderer 3.3, BgIOThr~Pool # 2.2) | WPEWebProcess 17.5, Web Content 8.4, WebExtensions 2.8, Privileged Cont 2.2 | 27.9 | — |
| profile | switch-to-gecko | — | — | **40.3** (main 16.1, Renderer 8.1, DOM Worker 8.1, BgIOThr~Pool # 4.0, SamplerThread 4.0) | Isolated Web Co 8.1 | — | 217.8 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.9 | 0.0 | 0 | 0.0 | — | — | 50.8 | 0.0 | — | 1.81 | 0.40 | — | — | — | — | — | 0.002 |
| trace | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.26 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.29 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 55.6 | 0.0 | 0 | 0.0 | — | — | 12.1 | 0.0 | — | 0.72 | 0.12 | — | — | — | — | — | 0.008 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 14.2 | 0.0 | — | 0.09 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 79.0 | 0.0 | — | 2.28 | 0.59 | — | — | — | — | — | 0.003 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.33 | 0.15 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.30 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 54.5 | 0.0 | 0 | 0.0 | — | — | 7.5 | 0.0 | — | 0.92 | 0.17 | — | — | — | — | — | 0.013 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.12 | 0.16 | — | — | — | — | — | 0.002 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.516 | 2.428 | 0.0110 | 0.0177 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.153 | 0.219 | 0.0088 | 0.0126 |
| plain | raf-nosampler | memfd | native | 177 | 177 | 0.189 | 0.247 | 0.0110 | 0.0144 |
| plain | scroll | memfd | native | 114 | 114 | 0.652 | 0.633 | 0.0354 | 0.0344 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.157 | 0.0000 | 0.0009 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 1.310 | 2.306 | 0.0064 | 0.0113 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 181 | 181 | 0.150 | 0.214 | 0.0087 | 0.0124 |
| trace | raf-nosampler | memfd | native | 177 | 177 | 0.181 | 0.240 | 0.0105 | 0.0139 |
| trace | scroll | memfd | native | 116 | 116 | 0.637 | 0.652 | 0.0351 | 0.0360 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.165 | 0.0000 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.591 | 2.442 | 0.0088 | 0.0135 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 184 | 184 | 0.178 | 0.281 | 0.0104 | 0.0164 |
| profile | raf-nosampler | memfd | native | 178 | 178 | 0.190 | 0.272 | 0.0111 | 0.0158 |
| profile | scroll | memfd | native | 115 | 115 | 0.730 | 0.838 | 0.0394 | 0.0453 |
| profile | key | memfd | native | 20 | 20 | 0.002 | 0.196 | 0.0000 | 0.0011 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 21.8 | 0.0 | — | 0.09 | 0.30 | — | — | 14.2 | 22.5 | 34.5 |
| profile | 0.5 | 25.5 | 0.1 | — | 0.12 | 0.53 | — | — | 6.1 | 26.8 | 32.8 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 69.0; first stdout read resolved 73.0; first frame applied (native receiver) 377.9; write frame_ack 378.5; write visibility 382.5; write focus 382.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 16.6; first stdout read resolved 21.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 28.8; first stdout read resolved 32.0; first frame applied (native receiver) 322.9; write frame_ack 324.0; write visibility 332.1; write focus 332.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 25.5; first stdout read resolved 34.9

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 37, DOM Worker 22, Renderer 17, BgPool 7, IPC I/O 3, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 37 ms (10.2% of span): JavaScript 14, Idle 7, Layout 4, DOM 3, Other 3, Graphics 3
  - JS leaf 2 / native under JS 17 / native 18; buckets: ipc 37, gc_cc 15, poll_wait 11, paint_layout 11, array_buffer_copy 10, harness_diagnostics 8, subprocess_pipe_io 2, engine_stream_read 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `bool mozilla::dom::binding_detail::GenericGetter<mozilla::do` 3; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 2; `mozilla::ReflowInput::Init(nsPresContext*, mozilla::Maybe<mo` 2; `mozilla::dom::JSIPCValueUtils::ToJSVal(JSContext*, mozilla::` 2; `[libglib-2.0.so.0]` 2
  - WebRender/compositor threads: Renderer 17 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `void commit_solid_span<true>(unsigned int*, unsign` 2, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 7 ms (top self: `ARGBSetRow_X86 [libxul.so]` 2, `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 22 ms: buckets subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 21, poll_wait 21, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 21; `void js::NativeObject::setFixedSlot<true>(unsigned` 0; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js` 0; `__lll_lock_wait [libc.so.6]` 0; `[axiosozo-dev]` 0
- **tab:9478** CPU ms by thread group: main 56, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 57 ms (16.8% of span): Other 42, JavaScript 7, Profiler 5, DOM 2, Idle 1, GC / CC 0
  - JS leaf 3 / native under JS 2 / native 52; buckets: ipc 44, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 1
  - top self: `[]` 6; `__lll_lock_wake [libc.so.6]` 4; `[libfontconfig.so.1]` 4; `[libexpat.so.1]` 3; `initExtensionPolicy (resource://gre/modules/ExtensionProcess` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9483** CPU ms by thread group: main 46, IPC I/O 0, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 46 ms (16.5% of span): Other 36, DOM 4, Profiler 3, JavaScript 2, Idle 1
  - JS leaf 0 / native under JS 7 / native 40; buckets: ipc 35, array_buffer_copy 13, gc_cc 11, subprocess_pipe_io 6, poll_wait 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `<T as alloc::vec::spec_from_elem::SpecFromElem>::from_elem [` 3; `[]` 2; `nsresult mozilla::PreferencesImpl::GetSharedPrefValue<float>` 2; `JSAtom* js::NewAtomCopyNDontDeflateValidLength<unsigned char` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9340** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 148, DOM Worker 93, other 19, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 148 ms (7.1% of span): Idle 118, JavaScript 13, Other 6, GC / CC 6, DOM 5, Profiler 1
  - JS leaf 2 / native under JS 15 / native 132; buckets: ipc 148, poll_wait 122, harness_diagnostics 15, gc_cc 13, array_buffer_copy 4, engine_stream_read 2, json_metadata 1, worker_messaging 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 122; `[axiosozo-dev]` 2; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, ` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1
  - GC/CC markers: CCSlice 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 93 ms: buckets subprocess_pipe_io 93, js_ctypes 93, worker_messaging 93, ipc 93, poll_wait 93; top self: `__syscall_cancel_arch [libc.so.6]` 93
- **tab:8980** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9478** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9344** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 454, DOM Worker 237, Renderer 170, SwComposite 88, BgPool 81, WRRenderBackend 54, Compositor 42, other 33, ImageBridge 18, WRSceneBuilder 9, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 454 ms (14.4% of span): Idle 307, JavaScript 77, Other 40, DOM 25, Profiler 5
  - JS leaf 10 / native under JS 87 / native 357; buckets: ipc 448, poll_wait 326, gc_cc 65, engine_stream_read 46, harness_diagnostics 41, worker_messaging 34, array_buffer_copy 20, subprocess_pipe_io 18
  - top self: `__syscall_cancel_arch [libc.so.6]` 323; `[unknown]` 14; `mprotect [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `[linux-vdso.so.1]` 5; `[axiosozo-dev]` 4
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 170 ms (top self: `__syscall_cancel_arch [libc.so.6]` 105, `__memmove_avx_unaligned_erms [libc.so.6]` 38, `syscall [libc.so.6]` 16); SwComposite 88 ms (top self: `syscall [libc.so.6]` 80, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 15, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 81 ms (top self: `__syscall_cancel_arch [libc.so.6]` 69, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `[linux-vdso.so.1]` 0, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 237 ms: buckets subprocess_pipe_io 237, worker_messaging 237, ipc 237, js_ctypes 212, poll_wait 206, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 209; `[unknown]` 3; `[axiosozo-dev]` 2; `mprotect [libc.so.6]` 2; `JS::RunJSMicroTask(JSContext*, JS::Handle<JSObject` 2
- **tab:9344** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8980** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 226, main 211, Renderer 164, SwComposite 92, BgPool 82, WRRenderBackend 51, Compositor 41, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 125, JavaScript 48, Other 26, DOM 7, Profiler 3, GC / CC 1
  - JS leaf 8 / native under JS 46 / native 156; buckets: ipc 210, poll_wait 141, gc_cc 60, engine_stream_read 41, worker_messaging 31, native_receiver 12, subprocess_pipe_io 9, array_buffer_copy 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 141; `[unknown]` 7; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 3; `mozilla::dom::Event::SetOwner(mozilla::dom::EventTarget*) [l` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 163 ms (top self: `__syscall_cancel_arch [libc.so.6]` 106, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `syscall [libc.so.6]` 11); SwComposite 92 ms (top self: `syscall [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 71, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `[linux-vdso.so.1]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 226 ms: buckets subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 206, poll_wait 201, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 205; `mozilla::ipc::PrincipalInfo::PrincipalInfo(mozilla` 1; `[unknown]` 1; `pthread_mutex_init@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 1
- **tab:8980** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9478** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `NS_GetMainThread(nsIThread**) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9344** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 539, DOM Worker 245, BgPool 149, Renderer 102, SwComposite 47, WRRenderBackend 34, Compositor 26, other 21, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 539 ms (25.4% of span): Idle 315, JavaScript 91, Other 46, DOM 40, Graphics 26, Profiler 11
  - JS leaf 10 / native under JS 117 / native 412; buckets: ipc 538, poll_wait 384, gc_cc 84, engine_stream_read 71, harness_diagnostics 51, worker_messaging 50, paint_layout 47, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 335; `[unknown]` 18; `__lll_lock_wait [libc.so.6]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 6; `[axiosozo-dev]` 5; `mozilla::nsDisplayListBuilder::MarkOutOfFlowFrameForDisplay(` 5
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 102 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `syscall [libc.so.6]` 11); SwComposite 47 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 22, `sched_yield [libc.so.6]` 10, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 149 ms (top self: `__syscall_cancel_arch [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 47, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 245 ms: buckets subprocess_pipe_io 245, worker_messaging 245, ipc 245, js_ctypes 209, poll_wait 204, gc_cc 14; top self: `__syscall_cancel_arch [libc.so.6]` 206; `[unknown]` 7; `[axiosozo-dev]` 6; `__lll_lock_wake [libc.so.6]` 4; `getcontext [libc.so.6]` 2
- **tab:9478** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9344** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 476, DOM Worker 223, Renderer 110, BgPool 91, SwComposite 49, other 36, WRRenderBackend 18, Compositor 15, WRWorker 12, WRSceneBuilder 9, ImageBridge 2, IPC I/O 1, Socket 1, Canvas 0, ImageIO 0
  - main thread 476 ms (12.9% of span): Idle 233, JavaScript 97, Layout 40, Other 37, Graphics 30, DOM 29
  - JS leaf 11 / native under JS 149 / native 316; buckets: ipc 474, poll_wait 260, gc_cc 88, paint_layout 80, worker_messaging 65, engine_stream_read 58, harness_diagnostics 37, array_buffer_copy 17
  - top self: `__syscall_cancel_arch [libc.so.6]` 239; `[unknown]` 19; `[axiosozo-dev]` 8; `syscall [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `IsTwiceTheRequiredBytesRepresentableAsUint32(unsigned long, ` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 110 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 40, `__syscall_cancel_arch [libc.so.6]` 26, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10); SwComposite 49 ms (top self: `syscall [libc.so.6]` 31, `__memmove_avx_unaligned_erms [libc.so.6]` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1, `webrender::bump_allocator::ChunkPool::allocate_chu` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 86 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 82, `__syscall_cancel_arch [libc.so.6]` 3, `XXH32_update [libxul.so]` 1); BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::layers::ImageClientSingle::UpdateImage(mo` 0)
  - busiest DOM Worker 223 ms: buckets subprocess_pipe_io 223, worker_messaging 223, ipc 223, js_ctypes 211, poll_wait 208, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 210; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `[unknown]` 1; `ffi_call_plan_invoke [libxul.so]` 1
- **tab:8861** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::dom::JSActor::QueryHandler::SendReply(JSContext*, m` 0; `[linux-vdso.so.1]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0; `nsDocShell::EnsureScriptEnvironment() [libxul.so]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateSegment(` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8980** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, DOM 1, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 1, memcpy_memset 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `bool mozilla::detail::HashTable<js::MapAndIndex<js::PropMap>` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsContentUtils::GetCurrentJSContext() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::ShmemDestroyed::~ShmemDestroyed() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 76, Renderer 42, DOM Worker 15, BgPool 11, WRRenderBackend 4, WRSceneBuilder 3, Compositor 3, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 76 ms (25.7% of span): JavaScript 22, Layout 13, DOM 11, Other 9, Graphics 7, GC / CC 6
  - JS leaf 3 / native under JS 35 / native 38; buckets: ipc 76, paint_layout 20, array_buffer_copy 16, gc_cc 16, harness_diagnostics 10, poll_wait 8, engine_stream_read 6, worker_messaging 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `mozilla::AbsoluteContainingBlock::ReflowAbsoluteFrame(nsCont` 4; `[unknown]` 4; `mozilla::net::nsHttpChannel::CallOnStartRequest() [libxul.so` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3; `nsINode::GetMutationObservers() [libxul.so]` 3
  - GC/CC markers: CCSlice 1× 5 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 5); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `webrender::render_backend::RenderBackend::process_` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 10 ms (top self: `rmdir [libc.so.6]` 5, `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 2); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 13, js_ctypes 13, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 13; `nsTArray_base<nsTArray_RelocateUsingMemutils>::Mov` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 0; `js::jit::DoCallFallback(JSContext*, js::jit::Basel` 0
- **tab:9340** CPU ms by thread group: main 27, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 27 ms (9.3% of span): JavaScript 10, Other 9, Idle 4, GC / CC 2, Profiler 2, DOM 1
  - JS leaf 1 / native under JS 9 / native 18; buckets: ipc 23, paint_layout 9, gc_cc 8, subprocess_pipe_io 4, poll_wait 4, harness_diagnostics 1, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 3; `mozJSModuleLoader::GetSourceFile(nsIURI*, nsIFile**) [libxul` 3; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBuffe` 1; `js::SharedPropMap::addPropertyInternal(JSContext*, JS::Mutab` 1; `js::frontend::BytecodeEmitter::emitJumpTargetOp(JSOp, js::fr` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8861** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (1.5% of span): Idle 4, DOM 1, Other 0
  - JS leaf 0 / native under JS 1 / native 4; buckets: ipc 5, poll_wait 4, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9483** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

