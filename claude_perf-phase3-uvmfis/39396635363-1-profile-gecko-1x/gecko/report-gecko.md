# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.2 | **5.5** (main 1.5, IPDL Background 1.0, IPC I/O Parent 0.5, Timer 0.5, TaskCon~ller # 0.5) | Isolated Web Co 2.0 | — | — |
| plain | raf | 59.0 | 17.1 | **19.1** (Renderer 9.1, WRRende~ckend# 2.3, glean.dispatche 2.0, main 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.5** (Renderer 9.3, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.3, Compositor 1.0) | Isolated Web Co 3.6 | — | — |
| plain | scroll | 59.0 | 17.1 | **45.3** (Renderer 27.5, main 5.4, WRRende~ckend# 2.9, glean.dispatche 1.5, TaskCon~ller # 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **49.0** (main 17.1, DOM Worker 16.3, IPDL Background 6.7, TaskCon~ller # 2.4, glean.dispatche 1.6) | Isolated Web Co 1.4, WebExtensions 0.6, Privileged Cont 0.3 | 9.5 | — |
| plain | idle | 59.3 | 17.2 | **5.5** (main 1.5, IPDL Background 1.0, IPC I/O Parent 0.5, Timer 0.5, TaskCon~ller # 0.5) | Isolated Web Co 2.0 | — | — |
| plain | raf | 59.0 | 17.1 | **19.1** (Renderer 9.1, WRRende~ckend# 2.3, glean.dispatche 2.0, main 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.5** (Renderer 9.3, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.3, Compositor 1.0) | Isolated Web Co 3.6 | — | — |
| plain | scroll | 59.0 | 17.1 | **45.3** (Renderer 27.5, main 5.4, WRRende~ckend# 2.9, glean.dispatche 1.5, TaskCon~ller # 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **49.0** (main 17.1, DOM Worker 16.3, IPDL Background 6.7, TaskCon~ller # 2.4, glean.dispatche 1.6) | Isolated Web Co 1.4, WebExtensions 0.6, Privileged Cont 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **8.2** (SamplerThread 3.4, main 2.4, TaskCon~ller # 1.9, DOM Worker 0.5) | Web Content 9.2, Isolated Web Co 4.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **29.0** (Renderer 10.1, SamplerThread 5.8, main 2.3, WRRende~ckend# 2.3, glean.dispatche 1.6) | Web Content 8.4, Isolated Web Co 8.1, Privileged Cont 1.9, Socket Process 1.6 | — | — |
| profile | raf-nosampler | — | — | **25.1** (Renderer 10.6, SamplerThread 6.0, WRRende~ckend# 2.0, Compositor 2.0, WRScene~ilder# 1.7) | Web Content 9.6, Isolated Web Co 8.3, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.2 | **59.5** (Renderer 30.7, SamplerThread 8.3, main 6.8, WRRende~ckend# 3.9, SwComposite 2.4) | Web Content 10.2, Isolated Web Co 9.8, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **13.3** (main 4.8, SamplerThread 4.3, glean.dispatche 0.8, Renderer 0.8, TaskCon~ller # 0.5) | Web Content 8.0, Isolated Web Co 3.8, WebExtensions 1.9, Privileged Cont 1.6 | 10.5 | — |

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

### Profile: gecko / idle

- **parent** CPU ms by thread group: main 47, Compositor 1, DOM Worker 1, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (2.2% of span): GC / CC 27, Idle 8, JavaScript 6, Other 6, DOM 1, Graphics 0
  - JS leaf 1 / native under JS 6 / native 40; buckets: ipc 47, gc_cc 32, poll_wait 13, harness_diagnostics 4, array_buffer_copy 2, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 2
  - GC/CC markers: GCMajor 1× 70 ms, GCSlice 6× 21 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `smallvec::SmallVec<A>::retain [libxul.so]` 0, `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, memcpy_memset 1, gc_cc 1, poll_wait 1; top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3312** CPU ms by thread group: main 24, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 24 ms (1.2% of span): Idle 15, GC / CC 5, JavaScript 2, DOM 1, Other 1, Layout 0
  - JS leaf 0 / native under JS 3 / native 21; buckets: ipc 23, poll_wait 15, gc_cc 7, harness_diagnostics 3, array_buffer_copy 2, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 15; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `webrtc::videocapturemodule::DeviceInfoFake::NumberOfDevices(` 1; `mprotect [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3398** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3396** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ipc::MessageChannel::DispatchMessage(mozilla::ipc::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 302, main 56, WRRenderBackend 56, WRSceneBuilder 47, Compositor 44, SwComposite 15, IPC I/O 10, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 57 ms (1.8% of span): GC / CC 28, Idle 18, JavaScript 5, Layout 2, Graphics 2, Other 1
  - JS leaf 2 / native under JS 3 / native 51; buckets: ipc 57, gc_cc 31, poll_wait 20, harness_diagnostics 4, paint_layout 3, subprocess_pipe_io 2, array_buffer_copy 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `XRE_IsParentProcess() [libxul.so]` 1; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handl` 1; `recvmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 6× 25 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 302 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 91, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 70, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 38); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 4, `[axiosozo-dev]` 1); WRSceneBuilder#0 41 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, memcpy_memset 2, gc_cc 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `munmap [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3312** CPU ms by thread group: main 136, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 136 ms (4.4% of span): Idle 92, Graphics 17, Layout 9, Other 8, Profiler 6, JavaScript 3
  - JS leaf 0 / native under JS 6 / native 129; buckets: ipc 130, poll_wait 93, paint_layout 33, harness_diagnostics 3, array_buffer_copy 2, gc_cc 1, canvas_2d 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 92; `sendmsg [libc.so.6]` 4; `[]` 3; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 1; `getcontext [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3396** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3208** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 307, WRRenderBackend 53, WRSceneBuilder 45, Compositor 43, main 13, SwComposite 12, IPC I/O 9, other 1, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 13 ms (0.4% of span): Idle 9, JavaScript 4, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 10; buckets: ipc 13, poll_wait 9, array_buffer_copy 3, gc_cc 3, harness_diagnostics 3, memcpy_memset 0
  - top self: `poll [libc.so.6]` 9; `profiler_feature_active(unsigned int) [libxul.so]` 1; `PerformPromiseThen(JSContext*, JS::Handle<js::PromiseObject*` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `js::jit::CacheIRWriter::addStubField(unsigned long, js::jit:` 1; `mozilla::dom::JSIPCValue::MaybeDestroy() [libxul.so]` 1
  - WebRender/compositor threads: Renderer 307 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 70, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 37); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 4, `webrender::texture_cache::TextureCache::request [l` 0); WRSceneBuilder#0 39 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3312** CPU ms by thread group: main 127, IPC I/O 15, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 127 ms (4.2% of span): Idle 91, Graphics 14, Layout 8, GC / CC 5, Other 5, Profiler 4
  - JS leaf 0 / native under JS 2 / native 125; buckets: ipc 123, poll_wait 93, paint_layout 28, gc_cc 5, memcpy_memset 1, subprocess_pipe_io 1, mozafterpaint_events 0, webrender_render 0
  - top self: `poll [libc.so.6]` 91; `[]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `sendmsg [libc.so.6]` 2; `mojo::core::ports::Node::PrepareToForwardUserMessage(mojo::c` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: CCSlice 1× 5 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3229** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3396** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 610, main 119, WRRenderBackend 64, Compositor 30, SwComposite 28, WRSceneBuilder 21, IPC I/O 8, other 1, Socket 1, BgPool 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 119 ms (5.7% of span): Idle 60, GC / CC 28, Other 13, JavaScript 7, Graphics 6, Layout 3
  - JS leaf 1 / native under JS 4 / native 114; buckets: ipc 119, poll_wait 75, gc_cc 33, paint_layout 10, harness_diagnostics 4, array_buffer_copy 2, subprocess_pipe_io 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 61; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `mozilla::IdleTaskRunner::Run() [libxul.so]` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 61 ms, GCSlice 11× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 610 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 214, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 76, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 4, `webrender::prepare::prepare_prim_for_render [libxu` 2); SwComposite 28 ms (top self: `syscall [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `open64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3312** CPU ms by thread group: main 86, IPC I/O 15, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 86 ms (4.1% of span): Idle 56, Graphics 11, GC / CC 8, Other 6, JavaScript 2, Layout 1
  - JS leaf 0 / native under JS 3 / native 83; buckets: ipc 85, poll_wait 57, paint_layout 14, gc_cc 10, harness_diagnostics 3, array_buffer_copy 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 56; `[]` 1; `[linux-vdso.so.1]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `write [libc.so.6]` 1; `js::gc::PretenuringNursery::doPretenuring(js::gc::GCRuntime*` 1
  - GC/CC markers: GCMajor 1× 37 ms, GCSlice 6× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3247** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3229** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 177, Renderer 32, Compositor 16, WRRenderBackend 15, WRSceneBuilder 12, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 177 ms (4.7% of span): Layout 38, Idle 37, GC / CC 28, Other 24, JavaScript 23, Graphics 21
  - JS leaf 1 / native under JS 29 / native 147; buckets: ipc 177, paint_layout 59, poll_wait 56, gc_cc 39, subprocess_pipe_io 5, harness_diagnostics 5, array_buffer_copy 4, canvas_2d 2
  - top self: `poll [libc.so.6]` 39; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 6; `recvmsg [libc.so.6]` 3; `style::properties::cascade::Declarations::note_declaration [` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 32 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `int blendTextureNearestFast<true, glsl::sampler2D_` 2, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::try_get_ca` 0); WRSceneBuilder#0 12 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build [li` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3312** CPU ms by thread group: main 57, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 57 ms (1.5% of span): Idle 22, Other 11, GC / CC 7, JavaScript 5, Layout 5, DOM 3
  - JS leaf 1 / native under JS 5 / native 51; buckets: ipc 55, poll_wait 22, paint_layout 14, gc_cc 11, harness_diagnostics 4, array_buffer_copy 2, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `mozilla::EventDispatcher::Dispatch(mozilla::dom::EventTarget` 1; `mozilla::dom::EventTarget::NonVirtualRelease() [libxul.so]` 1; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3153** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 5, JavaScript 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `[linux-vdso.so.1]` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 0; `js::jit::GetPropIRGenerator::tryAttachStub() [libxul.so]` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3247** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `XPCJSContext::AfterProcessTask(unsigned int) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

