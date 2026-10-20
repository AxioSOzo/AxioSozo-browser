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

## gecko-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **4.0** (main 1.5, TaskCon~ller # 1.0, Renderer 1.0, SwComposite 0.5) | Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.2 | **18.7** (Renderer 6.6, SwComposite 2.3, main 1.6, WRScene~ilder# 1.6, WRRende~ckend# 1.6) | Isolated Web Co 4.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.3, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.3, WRScene~ilder# 1.0) | Isolated Web Co 4.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **79.6** (Renderer 56.6, main 7.0, SwComposite 7.0, WRRende~ckend# 3.5, TaskCon~ller # 2.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **40.9** (main 14.7, DOM Worker 12.9, IPDL Background 4.6, TaskCon~ller # 2.4, glean.dispatche 1.3) | Isolated Web Co 1.1, WebExtensions 0.6, Privileged Cont 0.3 | 10.5 | — |
| plain | idle | 59.0 | 17.2 | **4.0** (main 1.5, TaskCon~ller # 1.0, Renderer 1.0, SwComposite 0.5) | Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.2 | **18.7** (Renderer 6.6, SwComposite 2.3, main 1.6, WRScene~ilder# 1.6, WRRende~ckend# 1.6) | Isolated Web Co 4.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.3, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.3, WRScene~ilder# 1.0) | Isolated Web Co 4.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **79.6** (Renderer 56.6, main 7.0, SwComposite 7.0, WRRende~ckend# 3.5, TaskCon~ller # 2.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **40.9** (main 14.7, DOM Worker 12.9, IPDL Background 4.6, TaskCon~ller # 2.4, glean.dispatche 1.3) | Isolated Web Co 1.1, WebExtensions 0.6, Privileged Cont 0.3 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **8.4** (SamplerThread 3.4, main 1.5, TaskCon~ller # 1.5, DOM Worker 1.5, IPC I/O Parent 0.5) | Web Content 5.8, Isolated Web Co 3.5, WebExtensions 1.5, Socket Process 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **21.9** (Renderer 6.5, SamplerThread 4.9, SwComposite 2.3, WRRende~ckend# 2.0, glean.dispatche 1.3) | Isolated Web Co 7.6, Web Content 6.5, WebExtensions 1.3, Privileged Cont 1.3 | — | — |
| profile | raf-nosampler | — | — | **25.6** (Renderer 10.0, SamplerThread 4.6, WRRende~ckend# 2.0, SwComposite 2.0, WRScene~ilder# 1.7) | Isolated Web Co 7.0, Web Content 6.6, WebExtensions 1.3, Privileged Cont 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **89.2** (Renderer 58.0, SwComposite 7.4, SamplerThread 7.4, main 6.4, WRRende~ckend# 3.5) | Web Content 7.4, Isolated Web Co 7.0, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **12.3** (main 4.8, SamplerThread 3.7, Renderer 1.1, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 6.5, Isolated Web Co 2.7, WebExtensions 1.6, Privileged Cont 1.3 | 9.5 | — |

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

### Profile: gecko-2x / idle

- **parent** CPU ms by thread group: main 44, DOM Worker 41, IPC I/O 1, Renderer 1, SwComposite 1, Socket 1, other 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 44 ms (2.1% of span): GC / CC 25, Idle 7, Other 6, JavaScript 4, DOM 2, Graphics 0
  - JS leaf 0 / native under JS 6 / native 38; buckets: ipc 44, gc_cc 32, poll_wait 9, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 2, paint_layout 0, json_metadata 0
  - top self: `poll [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3; `[axiosozo-dev]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 2; `mprotect [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 70 ms, GCSlice 6× 21 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 39 ms: buckets worker_messaging 38, ipc 38, gc_cc 37, memcpy_memset 13, poll_wait 2; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 11; `madvise [libc.so.6]` 11; `munmap [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Va` 2
- **tab:3126** CPU ms by thread group: main 23, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 23 ms (1.1% of span): Idle 15, JavaScript 4, GC / CC 3, Other 0, DOM 0, Profiler 0
  - JS leaf 0 / native under JS 4 / native 20; buckets: ipc 23, poll_wait 16, gc_cc 6, harness_diagnostics 3, array_buffer_copy 3, subprocess_pipe_io 1, paint_layout 1
  - top self: `poll [libc.so.6]` 15; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::ResolvePromiseInternal(JSContext*, JS::Handle<JSObject*>` 1; `js::frontend::EmitterScope::enterFunction(js::frontend::Byte` 1; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3214** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3159** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 206, SwComposite 65, WRRenderBackend 55, WRSceneBuilder 45, Compositor 35, main 24, IPC I/O 8, DOM Worker 3, other 1, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 24 ms (0.8% of span): Idle 18, JavaScript 2, Other 1, Graphics 1, Layout 1
  - JS leaf 0 / native under JS 2 / native 22; buckets: ipc 24, poll_wait 18, paint_layout 3, gc_cc 2, harness_diagnostics 1, subprocess_pipe_io 1, array_buffer_copy 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 18; `mozilla::ComputedStyle::HasAnchorPosReference() const [libxu` 1; `nsFlexContainerFrame::UnionInFlowChildOverflow(mozilla::Over` 1; `sendmsg [libc.so.6]` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `js::SavedStacks::getOrCreateSavedFrame(JSContext*, JS::Handl` 1
  - WebRender/compositor threads: Renderer 206 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 38, `int blendTextureNearestFast<true, glsl::sampler2D_` 13); SwComposite 65 ms (top self: `syscall [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 8, `webrender::compositor::sw_compositor::SwCompositeJ` 0); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `madvise [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 139, IPC I/O 13, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 139 ms (4.5% of span): Idle 93, Graphics 15, Layout 14, Other 9, Profiler 4, JavaScript 3
  - JS leaf 0 / native under JS 5 / native 134; buckets: ipc 136, poll_wait 94, paint_layout 37, gc_cc 2, subprocess_pipe_io 2, array_buffer_copy 2, canvas_2d 1, mozafterpaint_events 1
  - top self: `poll [libc.so.6]` 92; `sendmsg [libc.so.6]` 3; `[]` 2; `[linux-vdso.so.1]` 1; `void IPC::WriteSequenceParam<unsigned long const>(IPC::Messa` 1; `nsIXPConnect::XPConnect() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3052** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 284, SwComposite 55, WRRenderBackend 51, WRSceneBuilder 43, main 41, Compositor 34, IPC I/O 8, other 1, DOM Worker 1, Socket 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 41 ms (1.3% of span): GC / CC 27, Idle 10, JavaScript 2, DOM 1, Other 1
  - JS leaf 0 / native under JS 3 / native 37; buckets: ipc 41, gc_cc 28, poll_wait 10, harness_diagnostics 3, array_buffer_copy 3, json_metadata 0
  - top self: `poll [libc.so.6]` 10; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `mozilla::SegmentedVector<nsCOMPtr<nsISupports>, 4096ul, mozi` 1; `mozilla::dom::ProtoAndIfaceCache::~ProtoAndIfaceCache() [lib` 1; `nsINode::GetExistingListenerManager() const [libxul.so]` 1
  - GC/CC markers: GCSlice 6× 24 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 284 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 48, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 46); SwComposite 55 ms (top self: `syscall [libc.so.6]` 48, `__memmove_avx512_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::prepare::prepare_prim_for_render [libxu` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `std::io::impls::<impl std::io::Write for &mut W>::` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 126, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 126 ms (4.2% of span): Idle 86, Graphics 17, Layout 14, Other 4, Profiler 3, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 123; buckets: ipc 121, poll_wait 87, paint_layout 35, subprocess_pipe_io 2, canvas_2d 1, gc_cc 1, memcpy_memset 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 86; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `wr_dp_push_hit_test [libxul.so]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3159** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::IdlePeriodState::GetLocalIdleDeadline(bool&, mozill` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3033** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1151, SwComposite 132, main 123, WRRenderBackend 72, Compositor 25, WRSceneBuilder 20, IPC I/O 7, other 1, Socket 1, DOM Worker 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 123 ms (6.0% of span): Idle 64, GC / CC 33, Graphics 9, Other 9, Layout 4, JavaScript 4
  - JS leaf 0 / native under JS 2 / native 121; buckets: ipc 123, poll_wait 81, gc_cc 34, paint_layout 13, array_buffer_copy 2, harness_diagnostics 2, canvas_2d 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `[axiosozo-dev]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 8× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1151 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 346, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 232, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 73); SwComposite 132 ms (top self: `syscall [libc.so.6]` 119, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 72 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `bool js::gc::IsAboutToBeFinalizedInternal<JSString` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 86, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 86 ms (4.2% of span): Idle 58, Graphics 10, Other 6, GC / CC 5, Profiler 2, Layout 2
  - JS leaf 0 / native under JS 3 / native 83; buckets: ipc 83, poll_wait 60, paint_layout 14, gc_cc 7, harness_diagnostics 3, array_buffer_copy 3, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 59; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_mark` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::frontend::PerHandlerParser<js::frontend::FullParseHandle` 1; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libx` 1
  - GC/CC markers: GCMajor 1× 14 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3159** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3052** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 172, Renderer 44, WRRenderBackend 18, Compositor 15, WRSceneBuilder 12, SwComposite 12, IPC I/O 7, other 2, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 172 ms (4.6% of span): Idle 39, Layout 29, GC / CC 27, Other 23, JavaScript 22, Graphics 22
  - JS leaf 6 / native under JS 24 / native 142; buckets: ipc 172, poll_wait 55, paint_layout 54, gc_cc 40, subprocess_pipe_io 8, memcpy_memset 5, harness_diagnostics 4, array_buffer_copy 3
  - top self: `poll [libc.so.6]` 42; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `recvmsg [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `mozilla::image::VectorImage::GetImageProvider(mozilla::Windo` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 26, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3126** CPU ms by thread group: main 47, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (1.3% of span): Idle 19, Other 9, Layout 7, Graphics 4, JavaScript 4, Profiler 2
  - JS leaf 0 / native under JS 4 / native 43; buckets: ipc 45, poll_wait 19, paint_layout 14, harness_diagnostics 3, array_buffer_copy 2, gc_cc 2, canvas_2d 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 19; `sendmsg [libc.so.6]` 2; `AtomTableEntry::KeyEquals(AtomTableKey const*) const [libxul` 2; `[]` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `mozilla::PresShell::ScrollFrameIntoView(nsIFrame*, mozilla::` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2953** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.1% of span): Idle 5, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, J` 0; `[unknown]` 0; `mozilla::dom::StructuredCloneHolder_Binding::Wrap(JSContext*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3052** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **80.6** (main 31.0, Renderer 31.0, WRScene~ilder# 6.2, WRRende~ckend# 6.2, DOM Worker 6.2) | AxioCEFProbe 31.0, cef:renderer 24.8, cef:utility 6.2 | — | 118.7 |
| plain | idle | — | — | **8.7** (main 5.3, TaskCon~ller # 1.9, IPC I/O Parent 0.5, Timer 0.5, DOM Worker 0.5) | Web Content 3.4, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 26.0 | **27.2** (main 10.7, DOM Worker 3.9, TaskCon~ller # 2.3, Renderer 1.9, WRRende~ckend# 1.6) | cef:renderer 8.7, AxioCEFProbe 5.2, cef:gpu-process 4.8, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.3** (main 4.0, DOM Worker 4.0, Renderer 2.3, WRRende~ckend# 1.0, Compositor 1.0) | cef:renderer 8.0, AxioCEFProbe 5.0, cef:gpu-process 4.6, Web Content 0.3 | — | — |
| plain | scroll | 60.0 | 21.0 | **33.7** (main 15.6, DOM Worker 7.8, Backgro~Pool # 2.4, Renderer 1.9, glean.dispatche 1.0) | cef:gpu-process 20.0, cef:renderer 10.2, AxioCEFProbe 8.4 | — | — |
| plain | key | — | — | **15.8** (main 9.1, TaskCon~ller # 1.4, Renderer 1.4, DOM Worker 1.1, Timer 0.5) | AxioCEFProbe 2.6, cef:renderer 1.9, cef:gpu-process 0.9, WebExtensions 0.3 | 12.3 | — |
| plain | switch-to-gecko | — | — | **0.8** (main 0.2, DOM Worker 0.2, Renderer 0.1, IPC I/O Parent 0.1, BgIOThr~Pool # 0.1) | Web Content 0.1, Isolated Web Co 0.1 | — | 16125.5 |
| plain | switch-to-engine | — | — | **80.6** (main 31.0, Renderer 31.0, WRScene~ilder# 6.2, WRRende~ckend# 6.2, DOM Worker 6.2) | AxioCEFProbe 31.0, cef:renderer 24.8, cef:utility 6.2 | — | 118.7 |
| plain | idle | — | — | **8.7** (main 5.3, TaskCon~ller # 1.9, IPC I/O Parent 0.5, Timer 0.5, DOM Worker 0.5) | Web Content 3.4, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 26.0 | **27.2** (main 10.7, DOM Worker 3.9, TaskCon~ller # 2.3, Renderer 1.9, WRRende~ckend# 1.6) | cef:renderer 8.7, AxioCEFProbe 5.2, cef:gpu-process 4.8, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.3** (main 4.0, DOM Worker 4.0, Renderer 2.3, WRRende~ckend# 1.0, Compositor 1.0) | cef:renderer 8.0, AxioCEFProbe 5.0, cef:gpu-process 4.6, Web Content 0.3 | — | — |
| plain | scroll | 60.0 | 21.0 | **33.7** (main 15.6, DOM Worker 7.8, Backgro~Pool # 2.4, Renderer 1.9, glean.dispatche 1.0) | cef:gpu-process 20.0, cef:renderer 10.2, AxioCEFProbe 8.4 | — | — |
| plain | key | — | — | **15.8** (main 9.1, TaskCon~ller # 1.4, Renderer 1.4, DOM Worker 1.1, Timer 0.5) | AxioCEFProbe 2.6, cef:renderer 1.9, cef:gpu-process 0.9, WebExtensions 0.3 | 12.3 | — |
| plain | switch-to-gecko | — | — | **0.8** (main 0.2, DOM Worker 0.2, Renderer 0.1, IPC I/O Parent 0.1, BgIOThr~Pool # 0.1) | Web Content 0.1, Isolated Web Co 0.1 | — | 16125.5 |
| profile | switch-to-engine | — | — | **68.1** (main 34.0, Renderer 14.6, DOM Worker 9.7, SwComposite 4.9, SamplerThread 4.9) | Web Content 43.7, AxioCEFProbe 29.2, cef:renderer 24.3, WebExtensions 4.9 | — | 150.4 |
| profile | idle | — | — | **24.8** (SamplerThread 9.1, DOM Worker 8.1, main 5.7, Timer 1.9) | Web Content 10.0, Privileged Cont 1.9, Socket Process 1.4, WebExtensions 1.4 | — | — |
| profile | raf | 60.0 | 22.9 | **50.5** (main 12.9, DOM Worker 12.5, SamplerThread 11.9, Renderer 2.6, Backgro~Pool # 1.6) | Web Content 10.3, cef:renderer 8.0, cef:gpu-process 4.8, AxioCEFProbe 4.7 | — | — |
| profile | raf-nosampler | — | — | **39.3** (DOM Worker 12.2, SamplerThread 9.6, main 6.3, Renderer 2.6, WRRende~ckend# 1.7) | Web Content 10.6, cef:renderer 7.9, AxioCEFProbe 5.3, cef:gpu-process 4.6 | — | — |
| profile | scroll | 60.2 | 21.2 | **63.4** (main 22.1, DOM Worker 16.3, SamplerThread 12.0, Backgro~Pool # 2.4, Renderer 2.4) | cef:gpu-process 23.1, cef:renderer 10.5, Web Content 10.1, AxioCEFProbe 7.2 | — | — |
| profile | key | — | — | **41.2** (main 13.1, SamplerThread 9.8, DOM Worker 9.3, Timer 1.6, TaskCon~ller # 1.6) | Web Content 10.1, AxioCEFProbe 2.4, cef:renderer 2.2, WebExtensions 1.9 | 15.6 | — |
| profile | switch-to-gecko | — | — | **7.2** (SamplerThread 3.6, BgIOThr~Pool # 2.3, DOM Worker 0.5, main 0.4, Renderer 0.1) | Web Content 9.4, Isolated Web Co 2.0, Privileged Cont 2.0, WebExtensions 1.9 | — | 15025.5 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 4.1 | 0.0 | 0 | 0.0 | — | — | 12.9 | 0.0 | — | 1.30 | 1.15 | — | — | — | — | — | 0.005 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.17 | 0.15 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.14 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 9.2 | 0.0 | — | 0.29 | 0.14 | — | — | — | — | — | 0.010 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.8 | 0.0 | — | 0.53 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 1.336 | 0.517 | 0.0067 | 0.0026 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.039 | 0.073 | 0.0023 | 0.0044 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.036 | 0.068 | 0.0022 | 0.0041 |
| plain | scroll | memfd | native | 122 | 122 | 0.148 | 0.191 | 0.0087 | 0.0112 |
| plain | key | memfd | native | 21 | 21 | 0.014 | 0.054 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 1 | 1 | 1.336 | 0.517 | 0.0067 | 0.0026 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.039 | 0.073 | 0.0023 | 0.0044 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.036 | 0.068 | 0.0022 | 0.0041 |
| plain | scroll | memfd | native | 122 | 122 | 0.148 | 0.191 | 0.0087 | 0.0112 |
| plain | key | memfd | native | 21 | 21 | 0.014 | 0.054 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 0.983 | 0.919 | 0.0040 | 0.0037 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.044 | 0.082 | 0.0026 | 0.0049 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.046 | 0.078 | 0.0028 | 0.0047 |
| profile | scroll | memfd | native | 124 | 124 | 0.175 | 0.210 | 0.0103 | 0.0123 |
| profile | key | memfd | native | 21 | 21 | 0.014 | 0.065 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 10.4 | 0.0 | — | 0.54 | 0.86 | — | — | 7.8 | 12.0 | 20.0 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 55.6; first stdout read resolved 68.4; first frame applied (native receiver) 186.3; write frame_ack 187.5; write focus 194.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 38.1; first stdout read resolved 46.3; write shutdown 53.8

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 67, Renderer 27, DOM Worker 16, WRRenderBackend 4, WRSceneBuilder 3, Compositor 3, IPC I/O 3, SwComposite 2, BgPool 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 67 ms (27.4% of span): Layout 29, JavaScript 16, Idle 16, Other 2, Graphics 1, DOM 1
  - JS leaf 5 / native under JS 28 / native 34; buckets: ipc 67, paint_layout 25, poll_wait 17, gc_cc 17, array_buffer_copy 15, harness_diagnostics 10, subprocess_pipe_io 4, worker_messaging 2
  - top self: `poll [libc.so.6]` 16; `cssparser::parser::Parser::next_including_whitespace_and_com` 8; `nsContainerFrame::GetChildLists(nsTArray<mozilla::FrameChild` 6; `style::invalidation::element::invalidator::TreeStyleInvalida` 5; `style::custom_properties::do_substitute_chunk [libxul.so]` 4; `pretty (chrome://remote/content/shared/Format.sys.mjs:42:18)` 3
  - WebRender/compositor threads: Renderer 27 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `__lll_lock_wake [libc.so.6]` 1); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 0, `ARGBSetRow_X86 [libxul.so]` 0, `std::vector<unsigned char, std::allocator<unsigned` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 14, poll_wait 14, gc_cc 1; top self: `poll [libc.so.6]` 14; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::jit::DoCallFallback(JSContext*, js::jit::Basel` 1
- **tab:4190** CPU ms by thread group: main 52, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 52 ms (22.2% of span): Other 43, DOM 4, JavaScript 3, Profiler 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 47; buckets: ipc 39, array_buffer_copy 17, gc_cc 14, subprocess_pipe_io 5, memcpy_memset 1, poll_wait 1
  - top self: `[]` 4; `[libexpat.so.1]` 4; `__read_nocancel [libc.so.6]` 2; `icu_78::CharString::append(char, UErrorCode&) [libxul.so]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2; `__strcmp_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4192** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (21.8% of span): Other 39, DOM 4, JavaScript 4, Profiler 2, Idle 1
  - JS leaf 0 / native under JS 4 / native 46; buckets: ipc 39, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 8, memcpy_memset 4, poll_wait 2, image_container 1
  - top self: `[libfontconfig.so.1]` 7; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `[]` 2; `lut_inverse_interp16 [libxul.so]` 2; `js::frontend::InstantiateMarkedAtoms(JSContext*, js::Fronten` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.5% of span): Idle 3, Layout 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `nsBlockFrame::TrialReflow(nsPresContext*, mozilla::ReflowOut` 1; `mozilla::EventListenerManager::HandleEventSingleListener(moz` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 98, DOM Worker 95, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 98 ms (4.6% of span): Idle 78, Other 7, JavaScript 6, GC / CC 4, DOM 3, Profiler 1
  - JS leaf 1 / native under JS 7 / native 90; buckets: ipc 98, poll_wait 82, harness_diagnostics 7, gc_cc 7, array_buffer_copy 3, memcpy_memset 1, native_receiver 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 79; `recvmsg [libc.so.6]` 1; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 1; `js::NewObjectWithGivenTaggedProto(JSContext*, JSClass const*` 1; `debug (resource://gre/modules/Log.sys.mjs:396:8)[1]` 1
  - GC/CC markers: GCSlice 2× 5 ms, GCMinor 2× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 95 ms: buckets subprocess_pipe_io 95, js_ctypes 95, worker_messaging 95, ipc 95, poll_wait 95; top self: `poll [libc.so.6]` 95
- **tab:4192** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 359, DOM Worker 273, Renderer 69, WRRenderBackend 40, SwComposite 37, Compositor 35, other 33, BgPool 31, ImageBridge 16, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 359 ms (11.4% of span): Idle 213, JavaScript 61, GC / CC 34, Other 32, DOM 12, Profiler 8
  - JS leaf 12 / native under JS 59 / native 288; buckets: ipc 358, poll_wait 229, gc_cc 97, engine_stream_read 37, worker_messaging 35, subprocess_pipe_io 17, json_metadata 16, array_buffer_copy 12
  - top self: `poll [libc.so.6]` 216; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `write [libc.so.6]` 5; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 5; `recvmsg [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 784 ms, GCSlice 6× 28 ms, CCSlice 2× 5 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 56, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 3); WRRenderBackend#0 40 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0); SwComposite 37 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `[linux-vdso.so.1]` 0, `unsigned int mozilla::ProfileBufferEntryWriter::Su` 0); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wait [libc.so.6]` 0, `Pickle::~Pickle() [libxul.so]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 273 ms: buckets subprocess_pipe_io 273, worker_messaging 272, ipc 272, js_ctypes 255, poll_wait 249, gc_cc 8; top self: `poll [libc.so.6]` 249; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `bool mozilla::HashSet<js::gc::StoreBuffer::SlotsEd` 1; `JS_SetReservedSlot(JSObject*, unsigned int, JS::Va` 1; `js::SpeciesConstructor(JSContext*, JS::Handle<JSOb` 1
- **tab:3526** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 8, Idle 2
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 10, gc_cc 8, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onShapeE` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3439** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 8, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 10, gc_cc 8, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 5; `poll [libc.so.6]` 2; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1; `JsGcTracer::Trace(JS::Heap<JSObject*>*, char const*, void*) ` 1; `JSObject2WrappedJSMap::UpdateWeakPointersAfterGC(JSTracer*) ` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `JS::RuntimeHeapState() [libxul.so]` 0; `fog_custom_distribution_accumulate_single_sample [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 260, main 178, Renderer 66, WRRenderBackend 39, SwComposite 36, Compositor 35, BgPool 31, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 177 ms (5.8% of span): Idle 109, JavaScript 41, Other 18, DOM 7, Profiler 3
  - JS leaf 6 / native under JS 38 / native 134; buckets: ipc 177, poll_wait 120, gc_cc 49, engine_stream_read 29, worker_messaging 21, subprocess_pipe_io 10, json_metadata 10, native_receiver 9
  - top self: `poll [libc.so.6]` 112; `[unknown]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `recvmsg [libc.so.6]` 2; `write [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 66 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 4); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 1, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `[linux-vdso.so.1]` 0, `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 249, poll_wait 245, gc_cc 6; top self: `poll [libc.so.6]` 245; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `mozilla::CycleCollectedJSRuntime::JSObjectsTenured` 1; `mozilla::dom::WorkerGlobalScope_Binding::get_self(` 1
- **tab:3526** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3487** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 420, DOM Worker 269, BgPool 50, Renderer 50, WRRenderBackend 31, Compositor 24, SwComposite 24, other 22, ImageBridge 11, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 420 ms (19.9% of span): Idle 247, JavaScript 68, Other 57, DOM 24, Graphics 14, Profiler 6
  - JS leaf 7 / native under JS 80 / native 334; buckets: ipc 420, poll_wait 305, gc_cc 78, worker_messaging 47, paint_layout 35, engine_stream_read 30, subprocess_pipe_io 22, json_metadata 14
  - top self: `poll [libc.so.6]` 254; `[unknown]` 11; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 6; `[linux-vdso.so.1]` 3
  - WebRender/compositor threads: Renderer 50 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 41, `syscall [libc.so.6]` 4, `writev [libc.so.6]` 2); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 2, `[linux-vdso.so.1]` 0); SwComposite 24 ms (top self: `syscall [libc.so.6]` 24)
  - background pools (native receiver queue): BackgroundThreadPool #1 51 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::ImageClientSingle::UpdateImage(mo` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 269 ms: buckets subprocess_pipe_io 269, worker_messaging 269, ipc 269, js_ctypes 237, poll_wait 227, gc_cc 11; top self: `poll [libc.so.6]` 227; `[axiosozo-dev]` 2; `[unknown]` 2; `js::jit::JitActivation::JitActivation(JSContext*) ` 2; `mozilla::dom::WorkerPrivate::DoRunLoop(JSContext*)` 2
- **tab:3526** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsThreadManager::get() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4190** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 435, DOM Worker 232, Renderer 52, other 36, Compositor 15, SwComposite 14, WRRenderBackend 13, WRWorker 13, WRSceneBuilder 8, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 435 ms (11.8% of span): Idle 162, JavaScript 74, GC / CC 59, Layout 41, Other 33, Graphics 27
  - JS leaf 9 / native under JS 134 / native 291; buckets: ipc 435, poll_wait 203, gc_cc 151, paint_layout 82, worker_messaging 70, engine_stream_read 35, array_buffer_copy 19, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 163; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 18; `[axiosozo-dev]` 11; `[unknown]` 9; `recvmsg [libc.so.6]` 9; `mprotect [libc.so.6]` 5
  - GC/CC markers: GCMajor 2× 1099 ms, GCSlice 16× 57 ms, CCSlice 3× 10 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 52 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 5); SwComposite 14 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 233 ms: buckets subprocess_pipe_io 233, worker_messaging 233, ipc 233, js_ctypes 219, poll_wait 213, gc_cc 5; top self: `poll [libc.so.6]` 213; `[axiosozo-dev]` 3; `getcontext [libc.so.6]` 2; `read [libc.so.6]` 2; `JSStructuredCloneData::AppendBytes(char const*, un` 2
- **tab:3439** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `[]` 0; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, J` 0; `js::GetElementsWithAdder(JSContext*, JS::Handle<JSObject*>, ` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3526** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 334, main 69, DOM Worker 61, Renderer 16, IPC I/O 6, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, other 2, SwComposite 1, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 69 ms (0.5% of span): Idle 21, JavaScript 18, Layout 14, Other 6, Profiler 5, Graphics 3
  - JS leaf 2 / native under JS 25 / native 43; buckets: ipc 69, paint_layout 23, poll_wait 22, gc_cc 13, array_buffer_copy 11, harness_diagnostics 8, subprocess_pipe_io 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 20; `__lll_lock_wait [libc.so.6]` 4; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `madvise [libc.so.6]` 2; `[unknown]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 16 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 4, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 333 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 312, `write [libc.so.6]` 6, `unlink [libc.so.6]` 5); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 61 ms: buckets subprocess_pipe_io 61, worker_messaging 61, ipc 61, gc_cc 48, poll_wait 13, js_ctypes 13; top self: `poll [libc.so.6]` 11; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `madvise [libc.so.6]` 5; `mozilla::ProfileChunkedBuffer::ResetChunkManager(m` 4; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 3
- **tab:3526** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 4, JavaScript 2, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 6, poll_wait 4, gc_cc 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `[]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `js::UnwrapOneCheckedDynamic(JS::Handle<JSObject*>, JSContext` 0; `mozilla::dom::DOMStringMap_Binding::DOMProxyHandler::get(JSC` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3995** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, Profiler 1, Layout 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_mark` 0; `getcontext [libc.so.6]` 0; `JS::NewFunctionFromSpec(JSContext*, JSFunctionSpec const*, J` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message ` 0; `std::unique_ptr<mozilla::ProfileBufferChunk, std::default_de` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3487** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `IPC::Message::WillBeRoutedExternally(mojo::core::ports::User` 0; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **131.6** (Renderer 82.8, main 34.1, Backgro~Pool # 4.9, WRScene~ilder# 4.9, SwComposite 4.9) | cef:gpu-process 34.0, AxioCEFProbe 29.3, cef:renderer 14.6, cef:utility 9.8 | — | 176.7 |
| plain | idle | — | — | **3.0** (main 2.0, Timer 0.5, DOM Worker 0.5) | Web Content 1.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.1 | 22.2 | **26.3** (main 7.9, DOM Worker 4.6, Renderer 3.0, SwComposite 2.6, Backgro~Pool # 2.3) | cef:gpu-process 8.8, AxioCEFProbe 7.2, cef:renderer 6.3 | — | — |
| plain | raf-nosampler | — | — | **19.3** (main 4.3, Renderer 3.3, DOM Worker 2.7, SwComposite 2.7, Backgro~Pool # 2.7) | cef:gpu-process 10.6, AxioCEFProbe 7.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.3 | 22.8 | **34.5** (main 12.5, Backgro~Pool # 7.5, DOM Worker 5.5, Renderer 3.5, SwComposite 2.5) | cef:gpu-process 42.6, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.6** (main 4.4, Renderer 1.9, DOM Worker 1.4, SwComposite 1.1, Timer 0.6) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 9.2 | — |
| plain | switch-to-gecko | — | — | **81.4** (main 29.6, Renderer 22.2, TaskCon~ller # 14.8, BgIOThr~Pool # 7.4, WRRende~ckend# 7.4) |  | — | 121.6 |
| plain | switch-to-engine | — | — | **131.6** (Renderer 82.8, main 34.1, Backgro~Pool # 4.9, WRScene~ilder# 4.9, SwComposite 4.9) | cef:gpu-process 34.0, AxioCEFProbe 29.3, cef:renderer 14.6, cef:utility 9.8 | — | 176.7 |
| plain | idle | — | — | **3.0** (main 2.0, Timer 0.5, DOM Worker 0.5) | Web Content 1.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.1 | 22.2 | **26.3** (main 7.9, DOM Worker 4.6, Renderer 3.0, SwComposite 2.6, Backgro~Pool # 2.3) | cef:gpu-process 8.8, AxioCEFProbe 7.2, cef:renderer 6.3 | — | — |
| plain | raf-nosampler | — | — | **19.3** (main 4.3, Renderer 3.3, DOM Worker 2.7, SwComposite 2.7, Backgro~Pool # 2.7) | cef:gpu-process 10.6, AxioCEFProbe 7.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.3 | 22.8 | **34.5** (main 12.5, Backgro~Pool # 7.5, DOM Worker 5.5, Renderer 3.5, SwComposite 2.5) | cef:gpu-process 42.6, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.6** (main 4.4, Renderer 1.9, DOM Worker 1.4, SwComposite 1.1, Timer 0.6) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 9.2 | — |
| plain | switch-to-gecko | — | — | **81.4** (main 29.6, Renderer 22.2, TaskCon~ller # 14.8, BgIOThr~Pool # 7.4, WRRende~ckend# 7.4) |  | — | 121.6 |
| profile | switch-to-engine | — | — | **113.3** (Renderer 41.7, main 29.8, Backgro~Pool # 11.9, DOM Worker 11.9, WRWorker# 6.0) | Web Content 83.5, AxioCEFProbe 17.9, cef:renderer 17.9, cef:gpu-process 6.0 | — | 133.6 |
| profile | idle | — | — | **22.1** (main 6.9, DOM Worker 5.4, SamplerThread 5.4, TaskCon~ller # 2.4, Timer 1.5) | Web Content 3.9, WebExtensions 1.5, AxioCEFProbe 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 60.0 | 21.0 | **40.2** (DOM Worker 9.8, main 8.5, SamplerThread 7.9, Renderer 3.6, Backgro~Pool # 2.6) | cef:gpu-process 8.8, AxioCEFProbe 7.1, cef:renderer 6.6, Web Content 6.2 | — | — |
| profile | raf-nosampler | — | — | **33.4** (DOM Worker 9.0, SamplerThread 7.0, main 4.7, Renderer 4.0, Backgro~Pool # 3.0) | cef:gpu-process 10.7, AxioCEFProbe 8.0, cef:renderer 5.9, Web Content 5.6 | — | — |
| profile | scroll | 59.7 | 27.3 | **66.8** (main 18.9, DOM Worker 15.9, SamplerThread 8.5, Backgro~Pool # 8.0, Renderer 4.0) | cef:gpu-process 43.3, AxioCEFProbe 11.0, cef:renderer 8.5, Web Content 5.5 | — | — |
| profile | key | — | — | **27.0** (main 7.5, DOM Worker 7.2, SamplerThread 6.4, Renderer 1.9, Timer 1.1) | Web Content 4.2, cef:renderer 1.8, AxioCEFProbe 1.7, WebExtensions 1.7 | 10.9 | — |
| profile | switch-to-gecko | — | — | **77.7** (main 32.4, Renderer 19.4, TaskCon~ller # 12.9, SwComposite 6.5, DOM Worker 6.5) |  | — | 131.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 11.0 | 0.0 | 0 | 0.0 | — | — | 10.0 | 0.0 | — | 3.26 | 2.10 | — | — | — | — | — | 0.023 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.006 |
| profile | raf-nosampler | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.27 | 0.09 | — | — | — | — | — | 0.006 |
| profile | scroll | 58.9 | 0.0 | 0 | 0.0 | — | — | 9.6 | 0.0 | — | 0.69 | 0.10 | — | — | — | — | — | 0.006 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.4 | 0.0 | — | 0.39 | 0.09 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.487 | 2.926 | 0.0219 | 0.0257 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.140 | 0.225 | 0.0084 | 0.0135 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.161 | 0.235 | 0.0097 | 0.0141 |
| plain | scroll | memfd | native | 119 | 119 | 0.537 | 0.663 | 0.0318 | 0.0393 |
| plain | key | memfd | native | 21 | 21 | 0.068 | 0.243 | 0.0004 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.487 | 2.926 | 0.0219 | 0.0257 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.140 | 0.225 | 0.0084 | 0.0135 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.161 | 0.235 | 0.0097 | 0.0141 |
| plain | scroll | memfd | native | 119 | 119 | 0.537 | 0.663 | 0.0318 | 0.0393 |
| plain | key | memfd | native | 21 | 21 | 0.068 | 0.243 | 0.0004 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.586 | 4.774 | 0.0285 | 0.0525 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 184 | 184 | 0.146 | 0.234 | 0.0088 | 0.0141 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.166 | 0.279 | 0.0100 | 0.0168 |
| profile | scroll | memfd | native | 119 | 119 | 0.599 | 0.756 | 0.0352 | 0.0445 |
| profile | key | memfd | native | 21 | 21 | 0.075 | 0.262 | 0.0004 | 0.0015 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.3 | 6.6 | 0.0 | — | 0.39 | 0.60 | — | — | 8.3 | 7.5 | 15.1 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 18.9; first stdout read resolved 30.4; first frame applied (native receiver) 130.6; write frame_ack 134.6; write focus 145.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 18.2; first stdout read resolved 25.8; write shutdown 30.2

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 65, main 47, BgPool 10, DOM Worker 10, SwComposite 8, WRRenderBackend 4, WRSceneBuilder 2, Compositor 2, IPC I/O 2, Socket 0, WRWorker 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 47 ms (26.3% of span): Layout 16, DOM 10, Idle 9, JavaScript 5, Graphics 3, Other 3
  - JS leaf 0 / native under JS 25 / native 23; buckets: ipc 47, paint_layout 21, array_buffer_copy 14, gc_cc 13, harness_diagnostics 10, poll_wait 9, subprocess_pipe_io 2, engine_stream_read 1
  - top self: `__strlen_evex [libc.so.6]` 7; `poll [libc.so.6]` 6; `style::properties::generated::longhands::list_style_type::ca` 5; `mozilla::nsDisplayItem::ZIndex() const [libxul.so]` 3; `[linux-vdso.so.1]` 3; `nsGridContainerFrame::Grid::PlaceGridItems(nsGridContainerFr` 2
  - WebRender/compositor threads: Renderer 65 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 26, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 11, `writev [libc.so.6]` 7); SwComposite 8 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1, `webrender::spatial_tree::SpatialTree::visit_node_i` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__memset_avx512_unaligned_erms [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 8, poll_wait 8, gc_cc 0; top self: `poll [libc.so.6]` 8; `[axiosozo-dev]` 1; `mozilla::dom::CallSetup::CallSetup(mozilla::dom::C` 0; `write [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:3964** CPU ms by thread group: main 35, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 35 ms (22.6% of span): Other 25, JavaScript 7, DOM 2, Idle 1, Profiler 0
  - JS leaf 0 / native under JS 3 / native 32; buckets: ipc 27, gc_cc 11, array_buffer_copy 11, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 1
  - top self: `[]` 3; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 3; `__strcmp_evex [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `access [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3960** CPU ms by thread group: main 34, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 34 ms (30.9% of span): Other 28, JavaScript 2, Profiler 2, DOM 1, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 32; buckets: ipc 24, array_buffer_copy 11, gc_cc 8, subprocess_pipe_io 4, memcpy_memset 2, poll_wait 1
  - top self: `[]` 4; `__strcmp_evex [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__open_nocancel [libc.so.6]` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3772** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.5% of span): Idle 2, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `mozilla::nsDisplaySolidColor::CreateWebRenderCommands(mozill` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 121, DOM Worker 64, other 12, Socket 0, BgPool 0, IPC I/O 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 121 ms (5.9% of span): Idle 64, GC / CC 43, JavaScript 9, Other 4, Profiler 1, DOM 0
  - JS leaf 1 / native under JS 7 / native 113; buckets: ipc 121, poll_wait 66, gc_cc 49, harness_diagnostics 6, array_buffer_copy 4, memcpy_memset 1, subprocess_pipe_io 1, native_receiver 0
  - top self: `poll [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeE` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 2× 836 ms, GCSlice 14× 41 ms, CCSlice 3× 7 ms, GCMinor 2× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `munmap [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 64 ms: buckets subprocess_pipe_io 64, js_ctypes 64, worker_messaging 64, ipc 64, poll_wait 64; top self: `poll [libc.so.6]` 64
- **tab:3293** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `getcontext [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3960** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3964** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ScheduleWantsLaterTimer(unsigned int) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 245, DOM Worker 201, Renderer 103, SwComposite 77, BgPool 75, Compositor 27, WRRenderBackend 26, other 23, ImageBridge 11, WRSceneBuilder 5, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 245 ms (8.0% of span): Idle 184, JavaScript 34, Other 14, DOM 8, Profiler 5, GC / CC 0
  - JS leaf 2 / native under JS 38 / native 205; buckets: ipc 245, poll_wait 191, gc_cc 36, engine_stream_read 17, worker_messaging 15, json_metadata 9, subprocess_pipe_io 9, native_receiver 8
  - top self: `poll [libc.so.6]` 183; `[unknown]` 7; `recvmsg [libc.so.6]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 103 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 73, `__memmove_avx512_unaligned_erms [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); SwComposite 77 ms (top self: `syscall [libc.so.6]` 69, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 26 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 1, `webrender::render_backend::RenderBackend::update_d` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 74 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 60, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0)
  - busiest DOM Worker 201 ms: buckets subprocess_pipe_io 201, worker_messaging 201, ipc 201, js_ctypes 185, poll_wait 180, gc_cc 7; top self: `poll [libc.so.6]` 180; `[unknown]` 2; `[axiosozo-dev]` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `mozilla::CycleCollectedJSContext::AfterProcessTask` 1
- **tab:3772** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 1, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, gc_cc 2, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `write [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3275** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3777** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ipc::PBackgroundChild::OnMessageReceived(IPC::Messa` 0; `mozilla::dom::Document::HasRecentlyStartedForegroundLoads() ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 206, main 132, Renderer 102, BgPool 84, SwComposite 79, WRRenderBackend 26, Compositor 26, ImageBridge 11, WRSceneBuilder 4, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 132 ms (4.4% of span): Idle 90, JavaScript 25, Other 8, DOM 4, GC / CC 4, Profiler 1
  - JS leaf 4 / native under JS 24 / native 105; buckets: ipc 132, poll_wait 94, gc_cc 33, worker_messaging 19, engine_stream_read 16, json_metadata 10, subprocess_pipe_io 5, native_receiver 4
  - top self: `poll [libc.so.6]` 90; `[unknown]` 5; `recvmsg [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 102 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx512_unaligned_erms [libc.so.6]` 23, `syscall [libc.so.6]` 7); SwComposite 79 ms (top self: `syscall [libc.so.6]` 70, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 84 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 62, `__memmove_avx512_unaligned_erms [libc.so.6]` 17, `[axiosozo-dev]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 197 ms: buckets subprocess_pipe_io 197, worker_messaging 197, ipc 197, js_ctypes 182, poll_wait 178, gc_cc 5; top self: `poll [libc.so.6]` 178; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `[axiosozo-dev]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `[unknown]` 1
- **tab:3275** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3254** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3293** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 354, DOM Worker 268, BgPool 158, Renderer 74, SwComposite 51, WRRenderBackend 18, Compositor 18, other 14, ImageBridge 7, WRSceneBuilder 3, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 354 ms (17.5% of span): Idle 220, JavaScript 43, Other 33, GC / CC 32, DOM 10, Graphics 7
  - JS leaf 6 / native under JS 47 / native 301; buckets: ipc 354, poll_wait 251, gc_cc 73, worker_messaging 25, paint_layout 16, array_buffer_copy 15, subprocess_pipe_io 12, harness_diagnostics 12
  - top self: `poll [libc.so.6]` 225; `[unknown]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `[axiosozo-dev]` 4; `recvmsg [libc.so.6]` 4; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 4
  - GC/CC markers: GCMajor 1× 1280 ms, GCSlice 12× 37 ms, GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 74 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 42, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `syscall [libc.so.6]` 8); SwComposite 51 ms (top self: `syscall [libc.so.6]` 49, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 17, `sched_yield [libc.so.6]` 1, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 158 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `__memmove_avx512_unaligned_erms [libc.so.6]` 66, `write [libc.so.6]` 1); ImageBridgeChld 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 196, poll_wait 185, gc_cc 55; top self: `poll [libc.so.6]` 185; `madvise [libc.so.6]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `[axiosozo-dev]` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:3275** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3293** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3254** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Other 0, Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 250, DOM Worker 162, Renderer 72, SwComposite 37, other 24, Compositor 10, WRRenderBackend 9, BgPool 8, WRWorker 6, WRSceneBuilder 5, IPC I/O 2, ImageBridge 1, Socket 0, Canvas 0, ImageIO 0
  - main thread 250 ms (6.9% of span): Idle 127, JavaScript 45, Other 22, Layout 19, Graphics 17, DOM 12
  - JS leaf 6 / native under JS 75 / native 170; buckets: ipc 250, poll_wait 147, gc_cc 56, worker_messaging 44, paint_layout 40, engine_stream_read 25, array_buffer_copy 12, json_metadata 9
  - top self: `poll [libc.so.6]` 128; `[unknown]` 8; `[axiosozo-dev]` 5; `write [libc.so.6]` 4; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 72 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 16, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 5); SwComposite 37 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 18, `syscall [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 9 ms (top self: `syscall [libc.so.6]` 7, `sched_yield [libc.so.6]` 1, `webrender::batch::AlphaBatchList::set_params_and_g` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 162 ms: buckets subprocess_pipe_io 162, worker_messaging 162, ipc 162, js_ctypes 151, poll_wait 147, gc_cc 5; top self: `poll [libc.so.6]` 147; `js::SharedShape::getInitialShape(JSContext*, JSCla` 1; `mozilla::cyclecollector::HoldJSObjectsImpl(nsISupp` 1; `write [libc.so.6]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:3207** CPU ms by thread group: main 12, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.3% of span): GC / CC 6, Idle 6, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 12, poll_wait 7, gc_cc 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 2; `void js::gc::MarkingTracerT<8u>::markAndTraverse<js::BaseScr` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `bool __gnu_cxx::__ops::_Iter_pred<mozilla::Vector<std::uniqu` 1
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 7 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3293** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): GC / CC 6, Idle 1, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, gc_cc 6, poll_wait 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 1; `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `sendmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3254** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 48, Renderer 29, DOM Worker 6, BgPool 4, SwComposite 4, WRRenderBackend 1, WRSceneBuilder 1, Compositor 1, IPC I/O 0, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 48 ms (28.7% of span): GC / CC 14, Layout 13, JavaScript 9, Idle 6, Graphics 3, DOM 2
  - JS leaf 0 / native under JS 18 / native 30; buckets: ipc 47, gc_cc 19, paint_layout 15, array_buffer_copy 7, poll_wait 6, harness_diagnostics 5, memcpy_memset 2, worker_messaging 2
  - top self: `poll [libc.so.6]` 6; `[axiosozo-dev]` 3; `Gecko_CopyConstruct_nsStyleBackground [libxul.so]` 3; `mozilla::ReflowInput::ReflowInput(nsPresContext*, mozilla::R` 2; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCSlice 4× 18 ms, CCSlice 1× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 29 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 4); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 4 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 1, `fstatat64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 6, poll_wait 6; top self: `poll [libc.so.6]` 6; `wait4 [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3772** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.6% of span): Idle 2, Layout 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, memcpy_memset 1, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `js::BaseShape::get(JSContext*, JSClass const*, JS::Realm*, J` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3207** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3777** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

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

## webkit (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **29.4** (Renderer 14.7, main 7.3, glean.dispatche 3.7, Compositor 3.7) | WPEWebProcess 55.0, WPENetworkProce 11.0, AxioWebKitHost 7.3 | — | 254.3 |
| plain | idle | — | — | **4.0** (main 3.0, Timer 1.0) | Web Content 3.0 | — | — |
| plain | raf | 57.9 | 21.7 | **39.5** (main 14.8, DOM Worker 9.2, IPDL Background 2.6, Renderer 2.3, TaskCon~ller # 1.3) | WPEWebProcess 54.3, AxioWebKitHost 6.6, Privileged Cont 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.3** (main 6.3, DOM Worker 4.0, Renderer 2.0, TaskCon~ller # 1.7, Backgro~Pool # 1.7) | WPEWebProcess 51.3, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 56.2 | 35.5 | **35.5** (main 16.5, DOM Worker 7.5, TaskCon~ller # 2.5, Backgro~Pool # 2.5, Renderer 2.0) | WPEWebProcess 56.1, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.7, Renderer 1.4, DOM Worker 0.8, Timer 0.6, Compositor 0.6) | WPEWebProcess 6.7, AxioWebKitHost 1.1, WebExtensions 0.3 | 16.4 | — |
| plain | switch-to-gecko | — | — | **22.0** (main 13.2, IPC I/O Parent 4.4, TaskCon~ller # 4.4) | Isolated Web Co 4.4 | — | 211.0 |
| plain | switch-to-engine | — | — | **29.4** (Renderer 14.7, main 7.3, glean.dispatche 3.7, Compositor 3.7) | WPEWebProcess 55.0, WPENetworkProce 11.0, AxioWebKitHost 7.3 | — | 254.3 |
| plain | idle | — | — | **4.0** (main 3.0, Timer 1.0) | Web Content 3.0 | — | — |
| plain | raf | 57.9 | 21.7 | **39.5** (main 14.8, DOM Worker 9.2, IPDL Background 2.6, Renderer 2.3, TaskCon~ller # 1.3) | WPEWebProcess 54.3, AxioWebKitHost 6.6, Privileged Cont 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.3** (main 6.3, DOM Worker 4.0, Renderer 2.0, TaskCon~ller # 1.7, Backgro~Pool # 1.7) | WPEWebProcess 51.3, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 56.2 | 35.5 | **35.5** (main 16.5, DOM Worker 7.5, TaskCon~ller # 2.5, Backgro~Pool # 2.5, Renderer 2.0) | WPEWebProcess 56.1, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.7, Renderer 1.4, DOM Worker 0.8, Timer 0.6, Compositor 0.6) | WPEWebProcess 6.7, AxioWebKitHost 1.1, WebExtensions 0.3 | 16.4 | — |
| plain | switch-to-gecko | — | — | **22.0** (main 13.2, IPC I/O Parent 4.4, TaskCon~ller # 4.4) | Isolated Web Co 4.4 | — | 211.0 |
| profile | switch-to-engine | — | — | **36.3** (DOM Worker 16.5, main 9.9, SamplerThread 9.9) | Web Content 99.2, WPEWebProcess 56.2, WPENetworkProce 9.9, AxioWebKitHost 6.6 | — | 275.3 |
| profile | idle | — | — | **21.7** (main 6.4, SamplerThread 6.4, DOM Worker 5.9, Timer 1.5, glean.dispatche 0.5) | Web Content 4.9, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 58.2 | 21.3 | **43.3** (main 13.1, DOM Worker 9.5, SamplerThread 8.9, Renderer 2.6, Timer 1.6) | WPEWebProcess 52.0, Web Content 6.9, AxioWebKitHost 6.3, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **33.5** (DOM Worker 10.3, SamplerThread 7.3, main 5.0, Renderer 3.0, Backgro~Pool # 1.7) | WPEWebProcess 52.2, Web Content 6.9, AxioWebKitHost 6.0, WebExtensions 1.3 | — | — |
| profile | scroll | 57.5 | 34.9 | **64.3** (main 25.9, DOM Worker 13.4, SamplerThread 9.0, TaskCon~ller # 3.5, Backgro~Pool # 3.0) | WPEWebProcess 57.3, AxioWebKitHost 8.5, Web Content 6.0, WebExtensions 1.5 | — | — |
| profile | key | — | — | **37.4** (main 14.0, DOM Worker 8.0, SamplerThread 8.0, Timer 1.4, Renderer 1.4) | Web Content 6.9, WPEWebProcess 6.7, WebExtensions 1.7, Socket Process 1.4 | 18.0 | — |
| profile | switch-to-gecko | — | — | **33.7** (main 16.9, Renderer 4.2, BgIOThr~Pool # 4.2, DOM Worker 4.2, SamplerThread 4.2) | Isolated Web Co 4.2 | — | 215.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 6.3 | 0.0 | 0 | 0.0 | — | — | 98.3 | 0.0 | — | 1.63 | 0.61 | — | — | — | — | — | 0.004 |
| profile | raf | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.12 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.14 | 0.10 | — | — | — | — | — | 0.007 |
| profile | scroll | 55.4 | 0.0 | 0 | 0.0 | — | — | 12.7 | 0.0 | — | 0.33 | 0.13 | — | — | — | — | — | 0.008 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.4 | 0.0 | — | 0.12 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.638 | 1.109 | 0.0044 | 0.0076 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.045 | 0.109 | 0.0026 | 0.0063 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.053 | 0.125 | 0.0031 | 0.0073 |
| plain | scroll | memfd | native | 109 | 109 | 0.200 | 0.283 | 0.0108 | 0.0154 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.097 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.638 | 1.109 | 0.0044 | 0.0076 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.045 | 0.109 | 0.0026 | 0.0063 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.053 | 0.125 | 0.0031 | 0.0073 |
| plain | scroll | memfd | native | 109 | 109 | 0.200 | 0.283 | 0.0108 | 0.0154 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.097 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.786 | 1.554 | 0.0049 | 0.0098 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.040 | 0.106 | 0.0023 | 0.0062 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.057 | 0.134 | 0.0033 | 0.0078 |
| profile | scroll | memfd | native | 112 | 112 | 0.222 | 0.307 | 0.0123 | 0.0170 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.119 | 0.0000 | 0.0007 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 14.7 | 0.0 | — | 0.12 | 0.43 | — | — | 4.4 | 15.9 | 21.4 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 23.7; first stdout read resolved 26.6; first frame applied (native receiver) 284.8; write frame_ack 285.8; write visibility 292.0; write focus 293.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.8; first stdout read resolved 27.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 36, DOM Worker 28, Renderer 9, BgPool 4, IPC I/O 2, Compositor 2, WRRenderBackend 2, SwComposite 2, WRSceneBuilder 1, WRWorker 1, Socket 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 36 ms (11.5% of span): JavaScript 14, Idle 7, GC / CC 4, Layout 4, DOM 3, Other 2
  - JS leaf 0 / native under JS 24 / native 12; buckets: ipc 36, gc_cc 19, array_buffer_copy 13, paint_layout 9, harness_diagnostics 9, poll_wait 7, webrender_render 2, engine_stream_read 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 4; `js::jit::DoToBoolFallback(JSContext*, js::jit::BaselineFrame` 3; `CanAttachNativeGetProp(JSContext*, JSObject*, JS::PropertyKe` 2; `[unknown]` 1; `js::jit::GetPropIRGenerator::GetPropIRGenerator(JSContext*, ` 1
  - WebRender/compositor threads: Renderer 9 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `hypotf@@GLIBC_2.35 [libm.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 28 ms: buckets subprocess_pipe_io 28, worker_messaging 28, ipc 28, js_ctypes 27, poll_wait 27; top self: `__syscall_cancel_arch [libc.so.6]` 27; `mozilla::GlobalTeardownObserver::CheckCurrentGloba` 1; `mozilla::dom::WorkerPrivate::IsSharedMemoryAllowed` 0
- **tab:7881** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 47 ms (20.5% of span): Other 37, JavaScript 4, Profiler 3, DOM 3, Idle 0, GC / CC 0
  - JS leaf 1 / native under JS 4 / native 42; buckets: ipc 36, array_buffer_copy 15, gc_cc 12, subprocess_pipe_io 4, poll_wait 0
  - top self: `[]` 5; `[libexpat.so.1]` 4; `__strlen_evex [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0)
- **tab:7875** CPU ms by thread group: main 45, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (27.0% of span): Other 34, Profiler 5, DOM 3, JavaScript 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 43; buckets: ipc 34, array_buffer_copy 15, gc_cc 9, subprocess_pipe_io 4, poll_wait 1
  - top self: `__lll_lock_wake [libc.so.6]` 4; `__strlen_evex [libc.so.6]` 3; `[]` 3; `[libexpat.so.1]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `__syscall_cancel_arch [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7735** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 128, DOM Worker 71, other 14, Compositor 2, Socket 1, IPC I/O 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0, BgPool 0
  - main thread 128 ms (6.2% of span): Idle 106, JavaScript 13, Other 5, DOM 3, Profiler 1, Layout 0
  - JS leaf 1 / native under JS 15 / native 112; buckets: ipc 127, poll_wait 107, harness_diagnostics 15, array_buffer_copy 8, gc_cc 3, memcpy_memset 1, engine_stream_read 1, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 107; `[unknown]` 2; `[axiosozo-dev]` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 1 ms (top self: `mozilla::layers::CompositorBridgeParent::GetAsyncI` 0, `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 71 ms: buckets subprocess_pipe_io 71, worker_messaging 71, ipc 71, js_ctypes 71, poll_wait 71; top self: `__syscall_cancel_arch [libc.so.6]` 71; `[unknown]` 0
- **tab:7384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7735** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7875** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 375, DOM Worker 219, Renderer 68, SwComposite 35, WRRenderBackend 34, Compositor 33, BgPool 31, other 25, ImageBridge 14, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 375 ms (12.3% of span): Idle 259, JavaScript 55, Other 37, DOM 16, GC / CC 5, Profiler 3
  - JS leaf 6 / native under JS 62 / native 308; buckets: ipc 373, poll_wait 280, gc_cc 51, engine_stream_read 34, worker_messaging 34, harness_diagnostics 25, array_buffer_copy 17, subprocess_pipe_io 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 281; `[unknown]` 14; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 189 ms, GCSlice 4× 4 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 68 ms (top self: `__syscall_cancel_arch [libc.so.6]` 58, `__memmove_evex_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 3); SwComposite 35 ms (top self: `syscall [libc.so.6]` 33, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `webrender::compositor::sw_compositor::SwCompositeT` 0); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 1, `webrender::renderer::gpu_buffer::finish_row [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 31 ms (top self: `__syscall_cancel_arch [libc.so.6]` 28, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0); BgIOThreadPool #4 1 ms (top self: `__lll_lock_wake [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 219 ms: buckets subprocess_pipe_io 219, worker_messaging 218, ipc 218, js_ctypes 200, poll_wait 196, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 197; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 2; `[unknown]` 1; `[libxul.so]` 1
- **tab:7738** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7357** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 216, main 148, Renderer 72, BgPool 39, SwComposite 36, WRRenderBackend 35, Compositor 32, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 148 ms (4.9% of span): Idle 97, JavaScript 26, Other 18, DOM 5, Profiler 2
  - JS leaf 4 / native under JS 27 / native 117; buckets: ipc 147, poll_wait 102, gc_cc 34, engine_stream_read 24, worker_messaging 24, subprocess_pipe_io 8, array_buffer_copy 7, native_receiver 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[unknown]` 6; `__lll_lock_wake [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 1; `bool PropertyEnumerator::enumerateNativeProperties<false>(JS` 1
  - WebRender/compositor threads: Renderer 73 ms (top self: `__syscall_cancel_arch [libc.so.6]` 60, `__memmove_evex_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 3); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 39 ms (top self: `__syscall_cancel_arch [libc.so.6]` 37, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 216 ms: buckets subprocess_pipe_io 216, worker_messaging 215, ipc 215, js_ctypes 192, poll_wait 188, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 190; `[unknown]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 2; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:7735** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): GC / CC 2, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, gc_cc 2, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `nsIGlobalObject::UnlinkObjectsInGlobal() [libxul.so]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7738** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 496, DOM Worker 221, BgPool 61, Renderer 43, WRRenderBackend 22, SwComposite 21, Compositor 20, other 16, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 496 ms (24.6% of span): Idle 246, JavaScript 84, GC / CC 70, Other 52, DOM 25, Graphics 8
  - JS leaf 10 / native under JS 93 / native 393; buckets: ipc 493, poll_wait 289, gc_cc 144, engine_stream_read 49, worker_messaging 37, harness_diagnostics 34, paint_layout 29, subprocess_pipe_io 26
  - top self: `__syscall_cancel_arch [libc.so.6]` 263; `[unknown]` 16; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 8; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 64 ms, GCSlice 14× 56 ms, CCSlice 4× 12 ms, GCMinor 2× 4 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 43 ms (top self: `__syscall_cancel_arch [libc.so.6]` 35, `__memmove_evex_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 1); WRRenderBackend#0 22 ms (top self: `syscall [libc.so.6]` 20, `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); SwComposite 21 ms (top self: `syscall [libc.so.6]` 21, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 60 ms (top self: `__syscall_cancel_arch [libc.so.6]` 50, `__memmove_evex_unaligned_erms [libc.so.6]` 10, `mozilla::layers::ImageContainer::CreateSharedRGBIm` 0); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #4 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `sendfile64 [libc.so.6]` 0)
  - busiest DOM Worker 215 ms: buckets subprocess_pipe_io 215, worker_messaging 215, ipc 215, js_ctypes 187, poll_wait 178, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 179; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 2; `[unknown]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
- **tab:7335** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7384** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7357** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 470, DOM Worker 186, Renderer 54, other 27, SwComposite 26, WRRenderBackend 16, Compositor 15, WRWorker 10, WRSceneBuilder 9, BgPool 3, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 470 ms (12.9% of span): Idle 213, JavaScript 75, Other 37, Layout 36, GC / CC 32, Graphics 32
  - JS leaf 10 / native under JS 127 / native 333; buckets: ipc 468, poll_wait 257, gc_cc 115, paint_layout 77, engine_stream_read 63, worker_messaging 55, harness_diagnostics 32, subprocess_pipe_io 19
  - top self: `__syscall_cancel_arch [libc.so.6]` 222; `[axiosozo-dev]` 13; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 887 ms, GCSlice 8× 26 ms, CCSlice 2× 7 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 54 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 12, `__memmove_evex_unaligned_erms [libc.so.6]` 3); SwComposite 27 ms (top self: `syscall [libc.so.6]` 20, `__memmove_evex_unaligned_erms [libc.so.6]` 6, `void scale_blit<false>(Texture&, IntRect const&, T` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 0, `mozilla::layers::SharedRGBImage::SharedRGBImage(mo` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 186 ms: buckets subprocess_pipe_io 186, worker_messaging 186, ipc 186, js_ctypes 177, poll_wait 176, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 176; `__lll_lock_wake [libc.so.6]` 3; `[unknown]` 1; `[axiosozo-dev]` 1; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 1
- **tab:7278** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 1, DOM 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mojo::core::ports::Node::SendUserMessage(mojo::core::ports::` 0; `mozilla::dom::StructuredCloneHolder::~StructuredCloneHolder(` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::H` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 0; `js::ObjectWrapperMap::put(JSObject*, JSObject*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7384** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 69, Renderer 13, DOM Worker 11, BgPool 5, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 69 ms (24.6% of span): JavaScript 35, Layout 11, Other 7, DOM 7, Graphics 4, Idle 3
  - JS leaf 3 / native under JS 43 / native 23; buckets: ipc 68, array_buffer_copy 23, paint_layout 16, harness_diagnostics 12, gc_cc 8, engine_stream_read 5, worker_messaging 4, poll_wait 3
  - top self: `[unknown]` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `__syscall_cancel_arch [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2; `js::PromiseObject::allocationSite() [libxul.so]` 2
  - WebRender/compositor threads: Renderer 13 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__syscall_cancel_arch [libc.so.6]` 2, `__exp2f_fma [libm.so.6]` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `mozilla::layers::HitTestingTreeNode::SetHitTestDat` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 5 ms (top self: `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 10, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 1; `[unknown]` 0
- **tab:7735** CPU ms by thread group: main 28, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (10.2% of span): JavaScript 12, Other 6, Idle 4, Layout 2, Profiler 1, GC / CC 1
  - JS leaf 0 / native under JS 11 / native 17; buckets: ipc 26, gc_cc 9, subprocess_pipe_io 5, poll_wait 4, paint_layout 3, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `JSScript::lookupScope(unsigned char const*) const [libxul.so` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(` 1; `js::SavedStacks::getOrCreateSavedFrame(JSContext*, JS::Handl` 1; `nsPIDOMWindowInner::GetWindowContext() const [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7278** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.4% of span): Idle 3, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::DoCallFallback(JSContext*, js::jit::BaselineFrame*,` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7875** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **150.2** (DOM Worker 44.7, main 41.5, Renderer 25.6, TaskCon~ller # 9.6, Indexed~ IO # 9.6) | WPEWebProcess 76.7, AxioWebKitHost 6.4, WPENetworkProce 6.4 | — | 281.5 |
| plain | idle | — | — | **10.4** (main 6.4, IPDL Background 1.5, Timer 1.0, DOM Worker 1.0, Socket Thread 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 24.4 | **33.4** (main 10.8, Renderer 5.9, Backgro~Pool # 4.3, SwComposite 3.9, DOM Worker 2.9) | WPEWebProcess 162.4, AxioWebKitHost 18.3 | — | — |
| plain | raf-nosampler | — | — | **24.3** (Renderer 6.3, main 4.0, Backgro~Pool # 3.7, SwComposite 3.7, DOM Worker 2.7) | WPEWebProcess 163.1, AxioWebKitHost 18.3 | — | — |
| plain | scroll | 54.5 | 35.1 | **46.2** (main 17.2, Backgro~Pool # 9.8, DOM Worker 5.9, Renderer 4.9, SwComposite 2.9) | WPEWebProcess 178.8, AxioWebKitHost 20.6 | — | — |
| plain | key | — | — | **18.3** (main 8.2, Renderer 3.3, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 18.3, AxioWebKitHost 2.8, WebExtensions 0.3 | 27.4 | — |
| plain | switch-to-gecko | — | — | **26.2** (main 8.7, Renderer 8.7, Compositor 4.4, SwComposite 4.4) |  | — | 211.7 |
| plain | switch-to-engine | — | — | **150.2** (DOM Worker 44.7, main 41.5, Renderer 25.6, TaskCon~ller # 9.6, Indexed~ IO # 9.6) | WPEWebProcess 76.7, AxioWebKitHost 6.4, WPENetworkProce 6.4 | — | 281.5 |
| plain | idle | — | — | **10.4** (main 6.4, IPDL Background 1.5, Timer 1.0, DOM Worker 1.0, Socket Thread 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 24.4 | **33.4** (main 10.8, Renderer 5.9, Backgro~Pool # 4.3, SwComposite 3.9, DOM Worker 2.9) | WPEWebProcess 162.4, AxioWebKitHost 18.3 | — | — |
| plain | raf-nosampler | — | — | **24.3** (Renderer 6.3, main 4.0, Backgro~Pool # 3.7, SwComposite 3.7, DOM Worker 2.7) | WPEWebProcess 163.1, AxioWebKitHost 18.3 | — | — |
| plain | scroll | 54.5 | 35.1 | **46.2** (main 17.2, Backgro~Pool # 9.8, DOM Worker 5.9, Renderer 4.9, SwComposite 2.9) | WPEWebProcess 178.8, AxioWebKitHost 20.6 | — | — |
| plain | key | — | — | **18.3** (main 8.2, Renderer 3.3, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 18.3, AxioWebKitHost 2.8, WebExtensions 0.3 | 27.4 | — |
| plain | switch-to-gecko | — | — | **26.2** (main 8.7, Renderer 8.7, Compositor 4.4, SwComposite 4.4) |  | — | 211.7 |
| profile | switch-to-engine | — | — | **63.6** (main 27.3, TaskCon~ller # 12.1, DOM Worker 12.1, SamplerThread 9.1, Renderer 3.0) | WPEWebProcess 72.8, Web Content 57.6, WPENetworkProce 12.1, AxioWebKitHost 6.1 | — | 302.7 |
| profile | idle | — | — | **23.2** (main 7.4, SamplerThread 6.9, DOM Worker 6.4, Timer 1.5, TaskCon~ller # 0.5) | Web Content 5.9, Privileged Cont 1.5, Socket Process 1.0, RDD Process 1.0 | — | — |
| profile | raf | 56.7 | 26.4 | **58.1** (main 15.7, DOM Worker 12.4, SamplerThread 7.8, Renderer 6.2, Backgro~Pool # 4.2) | WPEWebProcess 175.9, AxioWebKitHost 21.0, Web Content 6.8, WebExtensions 1.9 | — | — |
| profile | raf-nosampler | — | — | **45.9** (DOM Worker 9.6, main 7.6, SamplerThread 7.3, Renderer 6.6, Backgro~Pool # 4.6) | WPEWebProcess 174.7, AxioWebKitHost 19.9, Web Content 6.3, Privileged Cont 1.3 | — | — |
| profile | scroll | 55.6 | 31.2 | **76.0** (main 24.7, DOM Worker 13.8, Backgro~Pool # 10.8, SamplerThread 7.9, Renderer 5.9) | WPEWebProcess 186.8, AxioWebKitHost 21.7, Web Content 7.9, Isolated Web Co 1.5 | — | — |
| profile | key | — | — | **38.8** (main 12.6, DOM Worker 7.9, SamplerThread 7.9, Renderer 3.3, SwComposite 2.2) | WPEWebProcess 18.4, Web Content 7.1, AxioWebKitHost 3.0, WebExtensions 2.2 | 29.1 | — |
| profile | switch-to-gecko | — | — | **62.0** (main 20.7, Renderer 8.3, DOM Worker 8.3, SamplerThread 8.3, Timer 4.1) | Isolated Web Co 4.1 | — | 218.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 5.8 | 0.0 | 0 | 0.0 | — | — | 77.0 | 0.0 | — | 2.78 | 0.62 | — | — | — | — | — | 0.004 |
| profile | raf | 56.6 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.41 | 0.15 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 58.4 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.40 | 0.15 | — | — | — | — | — | 0.011 |
| profile | scroll | 53.5 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 1.19 | 0.15 | — | — | — | — | — | 0.015 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.11 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.881 | 4.059 | 0.0111 | 0.0238 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.232 | 0.426 | 0.0135 | 0.0248 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.206 | 0.367 | 0.0119 | 0.0213 |
| plain | scroll | memfd | native | 109 | 109 | 0.790 | 0.988 | 0.0421 | 0.0526 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.200 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.881 | 4.059 | 0.0111 | 0.0238 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.232 | 0.426 | 0.0135 | 0.0248 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.206 | 0.367 | 0.0119 | 0.0213 |
| plain | scroll | memfd | native | 109 | 109 | 0.790 | 0.988 | 0.0421 | 0.0526 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.200 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.911 | 3.494 | 0.0111 | 0.0202 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 175 | 176 | 0.295 | 0.493 | 0.0167 | 0.0280 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.278 | 0.483 | 0.0162 | 0.0280 |
| profile | scroll | memfd | native | 109 | 109 | 0.979 | 1.392 | 0.0523 | 0.0744 |
| profile | key | memfd | native | 20 | 20 | 0.004 | 0.218 | 0.0000 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 26.7 | 0.0 | — | 0.11 | 0.45 | — | — | 84.2 | 27.8 | 109.7 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 23.3; first stdout read resolved 28.7; first frame applied (native receiver) 311.5; write frame_ack 312.5; write visibility 318.8; write focus 319.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 23.6; first stdout read resolved 31.2

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 89, DOM Worker 22, Renderer 17, BgPool 9, SwComposite 4, Compositor 3, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 1, Socket 1, WRWorker 0, other 0, ImageBridge 0, Canvas 0, ImageIO 0
  - main thread 89 ms (26.2% of span): GC / CC 46, JavaScript 25, Idle 8, Layout 4, DOM 3, Graphics 1
  - JS leaf 1 / native under JS 32 / native 57; buckets: ipc 88, gc_cc 71, harness_diagnostics 11, array_buffer_copy 11, poll_wait 11, paint_layout 8, engine_stream_read 7, worker_messaging 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 3; `nsINode::GetExistingListenerManager() const [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 137 ms, GCSlice 15× 78 ms, CCSlice 1× 13 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 17 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `ClearTexSubImage [libxul.so]` 2); SwComposite 4 ms (top self: `syscall [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ARGBSetRow_X86 [libxul.so]` 3, `__memset_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 22 ms: buckets subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 20, poll_wait 20, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 20; `__lll_lock_wake [libc.so.6]` 1; `void mozilla::dom::Function::Call<nsCOMPtr<nsIGlob` 1; `EnqueuePromiseReactionJob(JSContext*, JS::Handle<J` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:9493** CPU ms by thread group: main 48, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (15.3% of span): Other 38, JavaScript 4, DOM 3, Profiler 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 37, array_buffer_copy 16, gc_cc 12, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 1, image_container 1
  - top self: `[]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.` 3; `mprotect [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 3 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9499** CPU ms by thread group: main 46, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 46 ms (17.9% of span): Other 36, DOM 3, Profiler 3, JavaScript 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 42; buckets: ipc 36, array_buffer_copy 14, gc_cc 9, subprocess_pipe_io 5, poll_wait 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 3; `__lll_lock_wake [libc.so.6]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `IPC::ParamTraits<nsRect>::Read(IPC::MessageReader*, nsRect*)` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9357** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 136, DOM Worker 79, other 16, Renderer 1, SwComposite 1, IPC I/O 1, Compositor 1, Socket 1, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 136 ms (6.6% of span): Idle 111, JavaScript 13, Other 7, DOM 3, Profiler 2, GC / CC 1
  - JS leaf 1 / native under JS 15 / native 120; buckets: ipc 136, poll_wait 114, harness_diagnostics 13, gc_cc 6, array_buffer_copy 6, subprocess_pipe_io 2, engine_stream_read 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 113; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 1; `[unknown]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `webrender::composite::CompositeState::register_occ` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 70 ms: buckets subprocess_pipe_io 70, worker_messaging 70, ipc 70, js_ctypes 70, poll_wait 70, memcpy_memset 0; top self: `__syscall_cancel_arch [libc.so.6]` 70; `[axiosozo-dev]` 0
- **tab:9499** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [l` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9493** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8975** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 448, DOM Worker 312, Renderer 180, BgPool 135, SwComposite 106, WRRenderBackend 43, Compositor 33, other 26, ImageBridge 14, WRSceneBuilder 6, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 448 ms (14.5% of span): Idle 293, JavaScript 57, GC / CC 37, Other 28, DOM 27, Profiler 6
  - JS leaf 6 / native under JS 75 / native 367; buckets: ipc 439, poll_wait 302, gc_cc 89, engine_stream_read 41, harness_diagnostics 37, worker_messaging 20, native_receiver 17, array_buffer_copy 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[axiosozo-dev]` 11; `[linux-vdso.so.1]` 9; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 4
  - GC/CC markers: GCMajor 1× 1059 ms, GCSlice 8× 42 ms, CCSlice 2× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 180 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_evex_unaligned_erms [libc.so.6]` 31, `syscall [libc.so.6]` 17); SwComposite 106 ms (top self: `syscall [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 10); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 7, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 135 ms (top self: `__syscall_cancel_arch [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 36, `__lll_lock_wait [libc.so.6]` 1); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `mozilla::layers::TextureClient::TextureClientRecyc` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 312 ms: buckets subprocess_pipe_io 312, worker_messaging 308, ipc 308, js_ctypes 212, poll_wait 206, gc_cc 82; top self: `__syscall_cancel_arch [libc.so.6]` 207; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 12; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 10; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >` 10; `madvise [libc.so.6]` 7
- **tab:8901** CPU ms by thread group: main 9, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.3% of span): GC / CC 7, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 8, gc_cc 7, poll_wait 3, memcpy_memset 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `__syscall_cancel_arch [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `nsDocShell::cycleCollection::TraverseNative(void*, nsCycleCo` 1; `mozilla::dom::BrowsingContext::SweepWindowProxies(JSTracer*)` 0; `__lll_lock_wake [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 47 ms, GCSlice 4× 14 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8994** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.3% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 7, gc_cc 7, poll_wait 3, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mmap64 [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, ` 1
  - GC/CC markers: GCMajor 1× 8 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `bool js::gc::UnmarkGrayTracer<8u>::onChild<js::GetterSetter>` 0; `core::hash::BuildHasher::hash_one [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 2× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 221, DOM Worker 221, Renderer 177, BgPool 131, SwComposite 113, WRRenderBackend 43, Compositor 33, ImageBridge 13, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 221 ms (7.3% of span): Idle 122, GC / CC 40, JavaScript 36, DOM 14, Other 7, Profiler 2
  - JS leaf 7 / native under JS 41 / native 172; buckets: ipc 221, poll_wait 128, gc_cc 89, engine_stream_read 39, worker_messaging 27, subprocess_pipe_io 10, native_receiver 9, array_buffer_copy 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 127; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `[unknown]` 7; `mmap64 [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 79 ms, GCSlice 15× 43 ms, CCSlice 1× 11 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 177 ms (top self: `__syscall_cancel_arch [libc.so.6]` 101, `__memmove_evex_unaligned_erms [libc.so.6]` 50, `syscall [libc.so.6]` 21); SwComposite 113 ms (top self: `syscall [libc.so.6]` 90, `__memmove_evex_unaligned_erms [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 7, `floorf [libxul.so]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 130 ms (top self: `__syscall_cancel_arch [libc.so.6]` 90, `__memmove_evex_unaligned_erms [libc.so.6]` 36, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0, `mkdir [libc.so.6]` 0)
  - busiest DOM Worker 221 ms: buckets subprocess_pipe_io 221, worker_messaging 221, ipc 221, js_ctypes 200, poll_wait 194, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 195; `[unknown]` 2; `nsWindowRoot::DispatchEvent(mozilla::dom::Event&, ` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[axiosozo-dev]` 1
- **tab:8975** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9363** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 476, DOM Worker 248, BgPool 200, Renderer 109, SwComposite 71, WRRenderBackend 31, Compositor 21, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 2, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 476 ms (23.3% of span): Idle 267, JavaScript 91, Other 44, GC / CC 26, DOM 20, Graphics 12
  - JS leaf 12 / native under JS 95 / native 369; buckets: ipc 473, poll_wait 313, gc_cc 111, engine_stream_read 56, worker_messaging 43, paint_layout 39, harness_diagnostics 34, array_buffer_copy 27
  - top self: `__syscall_cancel_arch [libc.so.6]` 293; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `__lll_lock_wake [libc.so.6]` 8; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 406 ms, GCSlice 6× 21 ms, GCMinor 3× 8 ms
  - WebRender/compositor threads: Renderer 109 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `__memmove_evex_unaligned_erms [libc.so.6]` 21, `syscall [libc.so.6]` 11); SwComposite 71 ms (top self: `syscall [libc.so.6]` 63, `__memmove_evex_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 22, `sched_yield [libc.so.6]` 5, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 200 ms (top self: `__syscall_cancel_arch [libc.so.6]` 129, `__memmove_evex_unaligned_erms [libc.so.6]` 67, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 248 ms: buckets subprocess_pipe_io 248, worker_messaging 247, ipc 247, js_ctypes 221, poll_wait 211, array_buffer_copy 7; top self: `__syscall_cancel_arch [libc.so.6]` 212; `[axiosozo-dev]` 5; `__lll_lock_wake [libc.so.6]` 4; `__memset_evex_unaligned_erms [libc.so.6]` 4; `DefineDataProperty(JSContext*, JS::Handle<JSObject` 2
- **tab:8953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9363** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9493** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*)` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 434, DOM Worker 188, Renderer 117, SwComposite 78, other 28, WRRenderBackend 19, Compositor 16, WRWorker 10, WRSceneBuilder 9, BgPool 5, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 433 ms (11.8% of span): Idle 222, JavaScript 89, Layout 32, Graphics 27, Other 26, DOM 26
  - JS leaf 15 / native under JS 129 / native 290; buckets: ipc 432, poll_wait 258, gc_cc 84, paint_layout 76, engine_stream_read 66, worker_messaging 54, harness_diagnostics 31, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 236; `[unknown]` 14; `[axiosozo-dev]` 7; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 6; `js::jit::CacheIRWriter::callDOMGetterResult(js::jit::ObjOper` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: GCMinor 1× 1 ms, GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 117 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 34, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 8); SwComposite 79 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 41, `syscall [libc.so.6]` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `webrender::batch::AlphaBatchList::set_params_and_g` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `[axiosozo-dev]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::layers::PTextureChild::SendRecycleTexture` 0, `IPC::StringFromIPCMessageType(unsigned int) [libxu` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 188 ms: buckets subprocess_pipe_io 188, worker_messaging 187, ipc 187, js_ctypes 172, poll_wait 168, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 172; `mozilla::JSCallingLocation::Get(JSContext*) [libxu` 3; `[axiosozo-dev]` 2; `[unknown]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 1
- **tab:8901** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::ResolvePromiseInternal(JSContext*, JS::Handle<JSObject*>` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::dom::JSActor::ReceiveQuery(JSContext*, mozilla::dom` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9363** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8994** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 82, Renderer 31, DOM Worker 14, SwComposite 6, BgPool 5, Compositor 4, WRRenderBackend 2, IPC I/O 2, WRSceneBuilder 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 82 ms (29.1% of span): JavaScript 34, GC / CC 19, Layout 7, Idle 6, Graphics 5, Other 5
  - JS leaf 3 / native under JS 37 / native 41; buckets: ipc 82, gc_cc 32, paint_layout 17, array_buffer_copy 16, harness_diagnostics 12, poll_wait 9, engine_stream_read 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `[axiosozo-dev]` 3; `array_includes(JSContext*, unsigned int, JS::Value*) [libxul` 3; `listener (resource://gre/modules/ExtensionParent.sys.mjs:133` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCSlice 5× 10 ms, CCSlice 1× 6 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10, `ps_quad_textured_TEXTURE_2D_frag::swgl_drawSpanRGB` 3); SwComposite 6 ms (top self: `syscall [libc.so.6]` 6, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 1, `fstat64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, js_ctypes 13, poll_wait 12; top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::ctypes::StructType::LookupField(JSContext*, JS` 1; `std::__detail::_MakeUniq<mozilla::dom::IPCClientIn` 1
- **tab:9357** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.2% of span): Other 7, JavaScript 6, Idle 4, Layout 3, DOM 2, GC / CC 2
  - JS leaf 1 / native under JS 5 / native 20; buckets: ipc 21, gc_cc 13, paint_layout 10, subprocess_pipe_io 7, poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `[]` 2; `nsRefreshDriver::GetNextTickHint() [libxul.so]` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseN` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8901** CPU ms by thread group: main 5, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (1.6% of span): Idle 2, JavaScript 2, DOM 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, array_buffer_copy 2, poll_wait 2, gc_cc 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::jit::DoGetPropFallback(JSContext*, js::jit::BaselineFram` 1; `void mozilla::detail::HashTable<mozilla::HashMapEntry<js::ji` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9499** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_evex_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## chromium-2x-control (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **97.1** (main 34.5, Renderer 31.4, DOM Worker 9.4, TaskCon~ller # 6.3, glean.dispatche 3.1) | AxioCEFProbe 50.2, cef:gpu-process 25.1, cef:zygote 6.3, cef:renderer 6.3 | — | 298.2 |
| plain | idle | — | — | **2.5** (main 1.5, Timer 0.5, TaskCon~ller # 0.5) | Web Content 2.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 59.9 | 20.7 | **37.2** (Renderer 12.5, SwComposite 11.2, main 5.2, Backgro~Pool # 2.6, DOM Worker 2.3) | cef:gpu-process 9.6, AxioCEFProbe 7.2, cef:renderer 6.6, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **37.3** (Renderer 13.3, SwComposite 12.0, main 3.7, Backgro~Pool # 3.0, DOM Worker 2.0) | cef:gpu-process 10.3, AxioCEFProbe 8.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.2 | 21.1 | **58.5** (Renderer 14.5, main 12.0, SwComposite 12.0, Backgro~Pool # 7.5, DOM Worker 7.0) | cef:gpu-process 43.5, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.9** (main 4.7, Renderer 1.9, SwComposite 1.7, DOM Worker 1.4, glean.dispatche 0.3) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 8.7 | — |
| plain | switch-to-gecko | — | — | **41.8** (main 20.9, Renderer 13.9, Compositor 7.0) |  | — | 125.9 |
| plain | switch-to-engine | — | — | **97.1** (main 34.5, Renderer 31.4, DOM Worker 9.4, TaskCon~ller # 6.3, glean.dispatche 3.1) | AxioCEFProbe 50.2, cef:gpu-process 25.1, cef:zygote 6.3, cef:renderer 6.3 | — | 298.2 |
| plain | idle | — | — | **2.5** (main 1.5, Timer 0.5, TaskCon~ller # 0.5) | Web Content 2.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 59.9 | 20.7 | **37.2** (Renderer 12.5, SwComposite 11.2, main 5.2, Backgro~Pool # 2.6, DOM Worker 2.3) | cef:gpu-process 9.6, AxioCEFProbe 7.2, cef:renderer 6.6, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **37.3** (Renderer 13.3, SwComposite 12.0, main 3.7, Backgro~Pool # 3.0, DOM Worker 2.0) | cef:gpu-process 10.3, AxioCEFProbe 8.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.2 | 21.1 | **58.5** (Renderer 14.5, main 12.0, SwComposite 12.0, Backgro~Pool # 7.5, DOM Worker 7.0) | cef:gpu-process 43.5, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.9** (main 4.7, Renderer 1.9, SwComposite 1.7, DOM Worker 1.4, glean.dispatche 0.3) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 8.7 | — |
| plain | switch-to-gecko | — | — | **41.8** (main 20.9, Renderer 13.9, Compositor 7.0) |  | — | 125.9 |
| profile | switch-to-engine | — | — | **54.5** (main 19.0, Renderer 14.2, DOM Worker 9.5, WRRende~ckend# 4.7, SamplerThread 4.7) | Web Content 66.4, AxioCEFProbe 49.8, cef:gpu-process 18.9, cef:renderer 7.1 | — | 396.7 |
| profile | idle | — | — | **23.0** (main 7.3, DOM Worker 5.9, SamplerThread 5.4, TaskCon~ller # 2.9, IPC I/O Parent 0.5) | Web Content 3.9, WebExtensions 1.0, Isolated Web Co 1.0, AxioCEFProbe 0.5 | — | — |
| profile | raf | 59.7 | 21.3 | **61.7** (Renderer 13.8, SwComposite 11.8, DOM Worker 10.8, main 8.9, SamplerThread 8.5) | cef:gpu-process 9.2, cef:renderer 7.2, AxioCEFProbe 7.1, Web Content 6.2 | — | — |
| profile | raf-nosampler | — | — | **55.0** (Renderer 13.6, SwComposite 11.6, DOM Worker 9.6, SamplerThread 7.6, main 5.0) | cef:gpu-process 9.9, AxioCEFProbe 8.0, cef:renderer 6.7, Web Content 6.3 | — | — |
| profile | scroll | 60.3 | 22.8 | **81.9** (main 17.9, Renderer 15.5, DOM Worker 13.5, SwComposite 13.0, Backgro~Pool # 8.5) | cef:gpu-process 44.9, AxioCEFProbe 12.5, cef:renderer 10.5, Web Content 5.0 | — | — |
| profile | key | — | — | **26.4** (main 7.8, DOM Worker 6.6, SamplerThread 6.1, Renderer 2.2, Timer 1.4) | Web Content 4.7, AxioCEFProbe 1.7, cef:renderer 1.5, Privileged Cont 1.4 | 10.5 | — |
| profile | switch-to-gecko | — | — | **78.0** (main 19.5, Renderer 19.5, WRScene~ilder# 6.5, WRRende~ckend# 6.5, Compositor 6.5) |  | — | 131.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 4.6 | 0.0 | 0 | 0.0 | — | — | 19.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 59.5 | 0.0 | 0 | 0.0 | — | — | 9.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 2.8 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.982 | 3.504 | 0.0120 | 0.0212 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.146 | 0.248 | 0.0087 | 0.0149 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.167 | 0.286 | 0.0100 | 0.0172 |
| plain | scroll | memfd | native | 119 | 119 | 0.561 | 0.691 | 0.0331 | 0.0409 |
| plain | key | memfd | native | 21 | 21 | 0.072 | 0.212 | 0.0004 | 0.0012 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.982 | 3.504 | 0.0120 | 0.0212 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.146 | 0.248 | 0.0087 | 0.0149 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.167 | 0.286 | 0.0100 | 0.0172 |
| plain | scroll | memfd | native | 119 | 119 | 0.561 | 0.691 | 0.0331 | 0.0409 |
| plain | key | memfd | native | 21 | 21 | 0.072 | 0.212 | 0.0004 | 0.0012 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.472 | 3.147 | 0.0114 | 0.0145 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 183 | 183 | 0.145 | 0.275 | 0.0087 | 0.0164 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.168 | 0.312 | 0.0101 | 0.0188 |
| profile | scroll | memfd | native | 120 | 120 | 0.647 | 0.807 | 0.0385 | 0.0480 |
| profile | key | memfd | native | 21 | 21 | 0.074 | 0.220 | 0.0004 | 0.0013 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.3 | 5.7 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 31.3; spawn AxioCEFProbe resolved 67.4; write hello 68.4; first stdout read resolved 276.9; write create 280.5; write frame_ack 405.0; write focus 413.2

Switch timeline (profile, switch-to-gecko, ms after the window start): first stdout read resolved -1.4; write close 18.2; write shutdown 30.2

### Profile: chromium-2x-control / switch-to-engine

- **parent** CPU ms by thread group: Renderer 63, main 60, DOM Worker 41, BgPool 10, SwComposite 8, WRRenderBackend 5, Compositor 4, IPC I/O 3, WRSceneBuilder 3, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 60 ms (13.8% of span): JavaScript 25, Layout 16, Idle 11, Graphics 4, DOM 2, Other 1
  - JS leaf 1 / native under JS 30 / native 29; buckets: ipc 60, paint_layout 24, gc_cc 17, poll_wait 12, worker_messaging 9, array_buffer_copy 9, harness_diagnostics 8, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 11; `style::properties::generated::longhands::corner_bottom_left_` 4; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 3; `js::jit::CacheIRWriter::addStubField(unsigned long, js::jit:` 2; `nsGridContainerFrame::GridItemInfo::GridItemInfo(nsIFrame*, ` 2
  - WebRender/compositor threads: Renderer 63 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `int blendTextureNearestFast<true, glsl::sampler2D_` 9); SwComposite 7 ms (top self: `syscall [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 4, `webrender::batch::AlphaBatchBuilder::set_params_an` 1, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ARGBSetRow_X86 [libxul.so]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 41 ms: buckets subprocess_pipe_io 41, worker_messaging 41, ipc 41, poll_wait 22, js_ctypes 22, array_buffer_copy 11; top self: `poll [libc.so.6]` 21; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 10; `js::BoundFunctionObject::call(JSContext*, unsigned` 2; `[linux-vdso.so.1]` 2; `[axiosozo-dev]` 1
- **tab:5142** CPU ms by thread group: main 37, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (10.8% of span): Other 31, DOM 4, JavaScript 1, Idle 1, Profiler 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 33; buckets: ipc 29, gc_cc 10, array_buffer_copy 10, subprocess_pipe_io 6, memcpy_memset 6, canvas_2d 3, poll_wait 1
  - top self: `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 3; `sk_malloc_flags(unsigned long, unsigned int) [libxul.so]` 3; `[]` 3; `mozilla::Vector<js::wasm::CallSiteTarget, 0ul, js::SystemAll` 2; `connect [libc.so.6]` 1; `nsZipArchive::GetDataOffset(nsZipItem*) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5140** CPU ms by thread group: main 37, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (13.0% of span): Other 30, JavaScript 3, DOM 2, Idle 1, Profiler 0, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 28, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 4, memcpy_memset 1, poll_wait 1
  - top self: `__strlen_evex [libc.so.6]` 3; `[]` 3; `syscall [libc.so.6]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `getdents64 [libc.so.6]` 1; `[libexpat.so.1]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5031** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.7% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / idle

- **parent** CPU ms by thread group: main 134, DOM Worker 63, other 12, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 135 ms (6.6% of span): GC / CC 62, Idle 61, Other 5, JavaScript 5, DOM 2, Profiler 0
  - JS leaf 0 / native under JS 6 / native 128; buckets: ipc 135, poll_wait 67, gc_cc 64, harness_diagnostics 6, array_buffer_copy 4, native_receiver 1, memcpy_memset 1, json_metadata 0
  - top self: `poll [libc.so.6]` 61; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `recvmsg [libc.so.6]` 3; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3
  - GC/CC markers: GCMajor 2× 1089 ms, GCSlice 15× 53 ms, CCSlice 5× 12 ms, GCMinor 2× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `munmap [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 63 ms: buckets subprocess_pipe_io 63, js_ctypes 63, worker_messaging 63, ipc 63, poll_wait 63; top self: `poll [libc.so.6]` 63
- **tab:5140** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::detail::RunnableFunction<mozilla::TaskController::T` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5142** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Other 0, Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `fog_serialize_ipc_buf [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4546** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf

- **parent** CPU ms by thread group: Renderer 402, SwComposite 354, DOM Worker 251, main 244, BgPool 81, WRRenderBackend 38, Compositor 27, other 24, ImageBridge 11, WRSceneBuilder 4, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 244 ms (8.0% of span): Idle 184, JavaScript 36, Other 18, DOM 4, Profiler 2
  - JS leaf 5 / native under JS 33 / native 206; buckets: ipc 243, poll_wait 191, gc_cc 31, engine_stream_read 17, worker_messaging 15, harness_diagnostics 10, subprocess_pipe_io 9, json_metadata 8
  - top self: `poll [libc.so.6]` 185; `[unknown]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 2; `recvmsg [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 402 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 150, `int blendTextureNearestFast<false, glsl::sampler2D` 109, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 50); SwComposite 354 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 172, `syscall [libc.so.6]` 150, `__memmove_avx512_unaligned_erms [libc.so.6]` 28); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 80 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx512_unaligned_erms [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 1 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0)
  - busiest DOM Worker 251 ms: buckets subprocess_pipe_io 251, worker_messaging 251, ipc 251, js_ctypes 193, poll_wait 189, gc_cc 47; top self: `poll [libc.so.6]` 189; `madvise [libc.so.6]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `mozilla::cyclecollector::DropJSObjectsWithKeyImpl(` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
- **tab:5031** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 2, ipc 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `non-virtual thunk to ExpirationTrackerImpl<gfxFont, 3u, mozi` 0
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 3× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5036** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4546** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `g_main_context_iteration [libglib-2.0.so.0]` 0; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 396, SwComposite 352, DOM Worker 206, main 129, BgPool 90, WRRenderBackend 38, Compositor 28, ImageBridge 11, WRSceneBuilder 5, other 2, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 129 ms (4.3% of span): Idle 86, JavaScript 26, Other 9, DOM 5, GC / CC 2, Profiler 1
  - JS leaf 3 / native under JS 25 / native 101; buckets: ipc 129, poll_wait 92, gc_cc 34, engine_stream_read 20, worker_messaging 17, subprocess_pipe_io 8, json_metadata 8, array_buffer_copy 5
  - top self: `poll [libc.so.6]` 87; `[unknown]` 6; `recvmsg [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MinorSweepingTracer>::onString` 1; `mprotect [libc.so.6]` 1; `Subprocess.call/</stdout.read ([System Principal]:66:32)[0]` 1
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 396 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 135, `int blendTextureNearestFast<false, glsl::sampler2D` 118, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 43); SwComposite 352 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 170, `syscall [libc.so.6]` 147, `__memmove_avx512_unaligned_erms [libc.so.6]` 35); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 90 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 71, `__memmove_avx512_unaligned_erms [libc.so.6]` 16, `mozilla::layers::ImageContainer::SetCurrentImages(` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 206 ms: buckets subprocess_pipe_io 206, worker_messaging 206, ipc 206, js_ctypes 186, poll_wait 182, gc_cc 7; top self: `poll [libc.so.6]` 182; `[unknown]` 3; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::NewTypedArrayWithTemplateAndBuffer(JSContext*,` 1
- **tab:5140** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4528** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5036** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / scroll

- **parent** CPU ms by thread group: main 329, Renderer 293, SwComposite 250, DOM Worker 227, BgPool 166, WRRenderBackend 27, Compositor 18, other 15, ImageBridge 7, WRSceneBuilder 3, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 329 ms (16.3% of span): Idle 231, JavaScript 41, Other 28, DOM 15, Profiler 5, Graphics 4
  - JS leaf 1 / native under JS 54 / native 273; buckets: ipc 328, poll_wait 255, gc_cc 46, worker_messaging 29, subprocess_pipe_io 17, json_metadata 16, engine_stream_read 15, paint_layout 13
  - top self: `poll [libc.so.6]` 232; `[unknown]` 10; `write [libc.so.6]` 4; `recvmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 293 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 150, `int blendTextureNearestFast<false, glsl::sampler2D` 49, `void scale_blit<true>(Texture&, IntRect const&, Te` 27); SwComposite 250 ms (top self: `syscall [libc.so.6]` 159, `void scale_blit<true>(Texture&, IntRect const&, Te` 82, `__memmove_avx512_unaligned_erms [libc.so.6]` 9); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 2, `alloc::raw_vec::RawVec<T,A>::grow_one [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 166 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 84, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 80, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 227 ms: buckets subprocess_pipe_io 227, worker_messaging 226, ipc 226, js_ctypes 213, poll_wait 208, gc_cc 5; top self: `poll [libc.so.6]` 208; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::Nursery::wantEagerCollection() const [libxul.s` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:4546** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5036** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5140** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / key

- **parent** CPU ms by thread group: main 252, DOM Worker 151, Renderer 62, SwComposite 54, other 23, Compositor 9, WRRenderBackend 7, BgPool 6, WRSceneBuilder 5, IPC I/O 1, ImageBridge 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 252 ms (7.0% of span): Idle 123, JavaScript 57, Layout 20, Graphics 15, Other 15, Profiler 11
  - JS leaf 5 / native under JS 81 / native 166; buckets: ipc 251, poll_wait 137, gc_cc 68, worker_messaging 54, paint_layout 41, engine_stream_read 28, subprocess_pipe_io 13, array_buffer_copy 9
  - top self: `poll [libc.so.6]` 123; `[unknown]` 16; `__lll_lock_wait [libc.so.6]` 3; `write [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 62 ms (top self: `int blendTextureNearestFast<false, glsl::sampler2D` 21, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); SwComposite 54 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 26, `syscall [libc.so.6]` 22, `__memmove_avx512_unaligned_erms [libc.so.6]` 5); WRRenderBackend#0 7 ms (top self: `syscall [libc.so.6]` 6, `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 0, `webrender::render_task_graph::RenderTaskGraph::res` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 151 ms: buckets subprocess_pipe_io 151, worker_messaging 151, ipc 151, js_ctypes 143, poll_wait 140, gc_cc 3; top self: `poll [libc.so.6]` 140; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 1; `[axiosozo-dev]` 1; `getcontext [libc.so.6]` 1; `mozilla::dom::MessageEvent_Binding::get_data(JSCon` 1
- **tab:4456** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 4, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sy` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4528** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `XRE_GetAsyncIOEventTarget() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4507** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: main 32, Renderer 32, DOM Worker 7, SwComposite 3, BgPool 2, WRRenderBackend 2, Compositor 1, WRSceneBuilder 1, Socket 0, IPC I/O 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 32 ms (19.6% of span): JavaScript 11, Layout 9, Graphics 4, Idle 3, DOM 3, Other 1
  - JS leaf 0 / native under JS 20 / native 13; buckets: ipc 32, paint_layout 16, harness_diagnostics 8, gc_cc 7, array_buffer_copy 6, worker_messaging 4, poll_wait 3, engine_stream_read 2
  - top self: `webrender_api::display_list::DisplayListBuilder::push_refere` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `poll [libc.so.6]` 3; `js::RegExpStatics::updateFromMatchPairs(JSContext*, JSLinear` 2; `nsStyleUI::CalcDifference(nsStyleUI const&) const [libxul.so` 2; `mozilla::dom::Range_Binding::Wrap(JSContext*, nsRange*, nsWr` 1
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_textured_TEXTURE_2D_frag::read_interp_inpu` 3); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `hashbrown::rustc_entry::<impl hashbrown::map::Hash` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 2 ms (top self: `unlink [libc.so.6]` 2, `getdents64 [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `mozilla::ipc::MessageChannel::SendMessageToLink(st` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, poll_wait 7, js_ctypes 6; top self: `poll [libc.so.6]` 6; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:5031** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.9% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4456** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4528** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **64.5** (Renderer 24.5, main 20.1, DOM Worker 11.1, Backgro~Pool # 2.2, WRScene~ilder# 2.2) | AxioCEFProbe 60.2, cef:gpu-process 17.8, cef:utility 13.4, cef:renderer 11.1 | — | 409.1 |
| plain | idle | — | — | **5.7** (main 4.3, Timer 1.4) | Web Content 3.4, AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 20.8 | **27.9** (main 7.1, Renderer 6.5, SwComposite 5.2, DOM Worker 2.6, WRRende~ckend# 1.6) | cef:renderer 8.4, AxioCEFProbe 5.1, cef:gpu-process 4.9, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.2** (Renderer 6.0, SwComposite 4.6, main 4.3, DOM Worker 3.0, WRRende~ckend# 1.3) | cef:renderer 8.6, AxioCEFProbe 5.9, cef:gpu-process 5.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.3 | 20.9 | **41.9** (main 15.6, DOM Worker 7.8, Renderer 5.8, SwComposite 4.4, Backgro~Pool # 2.4) | cef:gpu-process 20.4, AxioCEFProbe 9.2, cef:renderer 9.2 | — | — |
| plain | key | — | — | **12.1** (main 7.4, DOM Worker 1.4, Timer 0.8, Renderer 0.8, SwComposite 0.5) | cef:renderer 1.9, AxioCEFProbe 1.4, cef:gpu-process 0.5, WebExtensions 0.3 | 12.0 | — |
| plain | switch-to-gecko | — | — | **42.1** (main 18.1, glean.dispatche 6.0, BgIOThr~Pool # 6.0, Renderer 6.0, WRRende~ckend# 6.0) |  | — | 130.3 |
| plain | switch-to-engine | — | — | **64.5** (Renderer 24.5, main 20.1, DOM Worker 11.1, Backgro~Pool # 2.2, WRScene~ilder# 2.2) | AxioCEFProbe 60.2, cef:gpu-process 17.8, cef:utility 13.4, cef:renderer 11.1 | — | 409.1 |
| plain | idle | — | — | **5.7** (main 4.3, Timer 1.4) | Web Content 3.4, AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 20.8 | **27.9** (main 7.1, Renderer 6.5, SwComposite 5.2, DOM Worker 2.6, WRRende~ckend# 1.6) | cef:renderer 8.4, AxioCEFProbe 5.1, cef:gpu-process 4.9, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.2** (Renderer 6.0, SwComposite 4.6, main 4.3, DOM Worker 3.0, WRRende~ckend# 1.3) | cef:renderer 8.6, AxioCEFProbe 5.9, cef:gpu-process 5.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.3 | 20.9 | **41.9** (main 15.6, DOM Worker 7.8, Renderer 5.8, SwComposite 4.4, Backgro~Pool # 2.4) | cef:gpu-process 20.4, AxioCEFProbe 9.2, cef:renderer 9.2 | — | — |
| plain | key | — | — | **12.1** (main 7.4, DOM Worker 1.4, Timer 0.8, Renderer 0.8, SwComposite 0.5) | cef:renderer 1.9, AxioCEFProbe 1.4, cef:gpu-process 0.5, WebExtensions 0.3 | 12.0 | — |
| plain | switch-to-gecko | — | — | **42.1** (main 18.1, glean.dispatche 6.0, BgIOThr~Pool # 6.0, Renderer 6.0, WRRende~ckend# 6.0) |  | — | 130.3 |
| profile | switch-to-engine | — | — | **44.6** (main 12.5, DOM Worker 12.5, SamplerThread 8.9, Renderer 5.3, IPC I/O Parent 1.8) | AxioCEFProbe 55.3, Web Content 35.6, cef:gpu-process 17.8, cef:utility 12.4 | — | 514.1 |
| profile | idle | — | — | **24.7** (SamplerThread 9.0, DOM Worker 8.1, main 5.7, Timer 1.9) | Web Content 10.0, Socket Process 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 60.0 | 21.3 | **60.2** (main 12.8, DOM Worker 12.2, SamplerThread 12.2, Renderer 7.1, SwComposite 5.4) | Web Content 10.2, cef:renderer 8.6, AxioCEFProbe 4.7, cef:gpu-process 4.5 | — | — |
| profile | raf-nosampler | — | — | **50.4** (DOM Worker 13.9, SamplerThread 10.6, Renderer 6.9, main 6.6, SwComposite 5.6) | Web Content 9.9, cef:renderer 8.5, AxioCEFProbe 5.0, cef:gpu-process 4.7 | — | — |
| profile | scroll | 60.1 | 22.5 | **77.8** (main 23.5, DOM Worker 16.3, SamplerThread 12.0, Renderer 7.7, SwComposite 5.3) | cef:gpu-process 22.1, cef:renderer 11.0, Web Content 10.1, AxioCEFProbe 8.6 | — | — |
| profile | key | — | — | **39.3** (main 13.1, SamplerThread 9.8, DOM Worker 9.3, Timer 1.9, TaskCon~ller # 1.9) | Web Content 10.1, cef:renderer 2.8, WebExtensions 2.4, Privileged Cont 2.2 | 15.4 | — |
| profile | switch-to-gecko | — | — | **7.5** (SamplerThread 3.8, BgIOThr~Pool # 2.3, main 0.5, DOM Worker 0.3, IPC I/O Parent 0.1) | Web Content 9.5, Privileged Cont 2.1, Isolated Web Co 2.0, Socket Process 1.6 | — | 15023.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.4 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 59.4 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 7.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.880 | 0.626 | 0.0038 | 0.0027 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.040 | 0.077 | 0.0024 | 0.0046 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.048 | 0.081 | 0.0029 | 0.0049 |
| plain | scroll | memfd | native | 123 | 123 | 0.186 | 0.194 | 0.0110 | 0.0115 |
| plain | key | memfd | native | 21 | 21 | 0.015 | 0.067 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.880 | 0.626 | 0.0038 | 0.0027 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.040 | 0.077 | 0.0024 | 0.0046 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.048 | 0.081 | 0.0029 | 0.0049 |
| plain | scroll | memfd | native | 123 | 123 | 0.186 | 0.194 | 0.0110 | 0.0115 |
| plain | key | memfd | native | 21 | 21 | 0.015 | 0.067 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.509 | 1.192 | 0.0051 | 0.0041 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 189 | 0.046 | 0.083 | 0.0028 | 0.0050 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.044 | 0.082 | 0.0026 | 0.0048 |
| profile | scroll | memfd | native | 124 | 124 | 0.212 | 0.244 | 0.0124 | 0.0143 |
| profile | key | memfd | native | 21 | 21 | 0.018 | 0.075 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.3 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 50.0; spawn AxioCEFProbe resolved 101.3; write hello 103.2; first stdout read resolved 352.2; write create 355.2; write frame_ack 530.4; write focus 543.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 36.3; first stdout read resolved 48.0; write shutdown 49.8

### Profile: chromium-control / switch-to-engine

- **parent** CPU ms by thread group: main 76, DOM Worker 40, Renderer 28, WRRenderBackend 5, BgPool 5, Compositor 4, IPC I/O 4, WRSceneBuilder 3, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 76 ms (12.9% of span): Layout 23, JavaScript 23, Idle 10, Other 9, DOM 6, Graphics 4
  - JS leaf 3 / native under JS 30 / native 43; buckets: ipc 76, paint_layout 31, gc_cc 23, poll_wait 11, harness_diagnostics 10, worker_messaging 10, array_buffer_copy 9, engine_stream_read 5
  - top self: `poll [libc.so.6]` 10; `style::custom_properties::substitute [libxul.so]` 5; `__lll_lock_wait [libc.so.6]` 4; `sendmsg [libc.so.6]` 3; `js::GetProperty(JSContext*, JS::Handle<JS::Value>, JS::Handl` 2; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, ns` 2
  - WebRender/compositor threads: Renderer 28 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `ClearTexSubImage [libxul.so]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 4, `syscall [libc.so.6]` 1, `webrender::batch::AlphaBatchBuilder::build [libxul` 0); WRSceneBuilder#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memset_avx2_unaligned_erms [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 39 ms: buckets subprocess_pipe_io 39, worker_messaging 39, ipc 39, poll_wait 29, js_ctypes 29, gc_cc 3; top self: `poll [libc.so.6]` 27; `[linux-vdso.so.1]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `JS::IsCallable(JSObject*) [libxul.so]` 1
- **tab:5360** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (9.1% of span): Other 37, Profiler 4, DOM 3, JavaScript 3, Idle 2
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 34, array_buffer_copy 15, gc_cc 14, subprocess_pipe_io 7, memcpy_memset 3, poll_wait 2, canvas_2d 2, image_container 1
  - top self: `__lll_lock_wait [libc.so.6]` 4; `close [libc.so.6]` 3; `[libexpat.so.1]` 3; `syscall [libc.so.6]` 2; `poll [libc.so.6]` 2; `SkSurfaceProps::SkSurfaceProps(unsigned int, SkPixelGeometry` 2
  - GC/CC markers: GCMinor 1× 3 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5365** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (8.8% of span): Other 35, JavaScript 6, DOM 2, Idle 2, Profiler 2, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 42; buckets: ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 7, poll_wait 2, memcpy_memset 2
  - top self: `[]` 6; `prctl [libc.so.6]` 2; `[libexpat.so.1]` 2; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 2; `poll [libc.so.6]` 2; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5249** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (0.6% of span): Idle 2, Profiler 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `[]` 1; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffe` 0; `mozilla::EventStateManager::GetEventTarget() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / idle

- **parent** CPU ms by thread group: main 104, DOM Worker 100, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 104 ms (4.9% of span): Idle 80, JavaScript 8, Other 8, GC / CC 6, Profiler 1, DOM 0
  - JS leaf 0 / native under JS 7 / native 96; buckets: ipc 104, poll_wait 85, gc_cc 9, harness_diagnostics 7, array_buffer_copy 4, memcpy_memset 0, json_metadata 0
  - top self: `poll [libc.so.6]` 81; `recvmsg [libc.so.6]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, ` 1; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [libxul.so]` 1; `TimerThreadWrapper::AddTimer(nsTimerImpl*, mozilla::detail::` 1
  - GC/CC markers: CCSlice 2× 4 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 100 ms: buckets subprocess_pipe_io 100, worker_messaging 100, ipc 100, js_ctypes 99, poll_wait 99; top self: `poll [libc.so.6]` 99; `[axiosozo-dev]` 0
- **tab:4725** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4764** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `fog_counter_add [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5365** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf

- **parent** CPU ms by thread group: main 357, DOM Worker 273, Renderer 210, SwComposite 164, WRRenderBackend 53, Compositor 35, other 33, BgPool 32, ImageBridge 16, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 357 ms (11.3% of span): Idle 224, JavaScript 60, GC / CC 30, Other 30, DOM 8, Profiler 4
  - JS leaf 6 / native under JS 58 / native 294; buckets: ipc 357, poll_wait 243, gc_cc 87, worker_messaging 35, engine_stream_read 26, json_metadata 17, harness_diagnostics 17, array_buffer_copy 11
  - top self: `poll [libc.so.6]` 227; `[unknown]` 8; `recvmsg [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 794 ms, GCSlice 7× 27 ms, CCSlice 2× 6 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 210 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 128, `int blendTextureNearestFast<false, glsl::sampler2D` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 16); SwComposite 164 ms (top self: `syscall [libc.so.6]` 115, `void scale_blit<true>(Texture&, IntRect const&, Te` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 3, `[linux-vdso.so.1]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 32 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 31, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wake [libc.so.6]` 0, `mozilla::BufferList<InfallibleAllocPolicy>::Alloca` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 273 ms: buckets subprocess_pipe_io 273, worker_messaging 273, ipc 273, js_ctypes 259, poll_wait 255, gc_cc 4; top self: `poll [libc.so.6]` 255; `[unknown]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `mozilla::dom::StructuredCloneHolder::~StructuredCl` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:4764** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 9, Idle 1
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 10, gc_cc 9, poll_wait 2
  - top self: `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `poll [libc.so.6]` 1; `js::CyclicModuleFields::trace(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 8 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4678** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 8, gc_cc 7, poll_wait 4
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(J` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 318, Renderer 196, main 177, SwComposite 154, WRRenderBackend 50, Compositor 34, BgPool 31, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 177 ms (5.8% of span): Idle 103, JavaScript 43, Other 16, DOM 11, Profiler 3, GC / CC 2
  - JS leaf 4 / native under JS 47 / native 126; buckets: ipc 177, poll_wait 110, gc_cc 58, worker_messaging 34, engine_stream_read 32, json_metadata 16, subprocess_pipe_io 11, array_buffer_copy 9
  - top self: `poll [libc.so.6]` 103; `[unknown]` 10; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[linux-vdso.so.1]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 196 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 102, `int blendTextureNearestFast<false, glsl::sampler2D` 26, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 16); SwComposite 153 ms (top self: `syscall [libc.so.6]` 76, `void scale_blit<true>(Texture&, IntRect const&, Te` 73, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 29, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 318 ms: buckets subprocess_pipe_io 318, worker_messaging 317, ipc 317, js_ctypes 246, poll_wait 240, gc_cc 55; top self: `poll [libc.so.6]` 240; `[axiosozo-dev]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `madvise [libc.so.6]` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5
- **tab:4746** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / scroll

- **parent** CPU ms by thread group: main 459, DOM Worker 278, Renderer 143, SwComposite 105, BgPool 59, WRRenderBackend 44, Compositor 25, other 22, ImageBridge 11, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 459 ms (21.7% of span): Idle 257, JavaScript 88, Other 57, GC / CC 18, Graphics 16, DOM 14
  - JS leaf 7 / native under JS 83 / native 368; buckets: ipc 457, poll_wait 324, gc_cc 101, worker_messaging 46, paint_layout 40, engine_stream_read 25, array_buffer_copy 19, subprocess_pipe_io 18
  - top self: `poll [libc.so.6]` 263; `[unknown]` 16; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 6; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 4
  - GC/CC markers: CCSlice 3× 8 ms, GCSlice 3× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 143 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `int blendTextureNearestFast<false, glsl::sampler2D` 13, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9); SwComposite 105 ms (top self: `syscall [libc.so.6]` 91, `void scale_blit<true>(Texture&, IntRect const&, Te` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 59 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `[linux-vdso.so.1]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 278 ms: buckets subprocess_pipe_io 278, worker_messaging 278, ipc 278, js_ctypes 253, poll_wait 243, gc_cc 11; top self: `poll [libc.so.6]` 243; `__memset_avx2_unaligned_erms [libc.so.6]` 5; `[unknown]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `JSStructuredCloneWriter::traverseObject(JS::Handle` 1
- **tab:4764** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5365** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / key

- **parent** CPU ms by thread group: main 434, DOM Worker 226, other 36, Renderer 31, SwComposite 24, Compositor 15, WRRenderBackend 10, WRSceneBuilder 8, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 434 ms (11.8% of span): Idle 162, JavaScript 65, GC / CC 62, Layout 38, Other 38, DOM 32
  - JS leaf 11 / native under JS 129 / native 294; buckets: ipc 434, poll_wait 200, gc_cc 146, paint_layout 75, worker_messaging 66, engine_stream_read 44, subprocess_pipe_io 22, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 162; `[axiosozo-dev]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[unknown]` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `recvmsg [libc.so.6]` 5
  - GC/CC markers: GCMajor 2× 1012 ms, GCSlice 16× 54 ms, CCSlice 4× 12 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); SwComposite 24 ms (top self: `syscall [libc.so.6]` 13, `void scale_blit<true>(Texture&, IntRect const&, Te` 10, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 10 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 0, `mozilla::ThreadEventQueue::PutEventInternal(RefPtr` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 226 ms: buckets subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 213, poll_wait 210, gc_cc 9; top self: `poll [libc.so.6]` 209; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `__lll_lock_wait [libc.so.6]` 2; `[unknown]` 1; `JSLinearString* js::StringChars<unsigned char>::to` 1
- **tab:4678** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `[unknown]` 0; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 0; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4725** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4764** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 340, main 70, DOM Worker 44, Renderer 18, IPC I/O 6, Compositor 4, WRRenderBackend 2, WRSceneBuilder 2, other 2, Socket 1, SwComposite 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 71 ms (0.5% of span): Idle 20, JavaScript 19, Layout 18, Other 6, Graphics 3, Profiler 2
  - JS leaf 1 / native under JS 31 / native 38; buckets: ipc 71, paint_layout 23, poll_wait 21, gc_cc 14, array_buffer_copy 12, harness_diagnostics 9, memcpy_memset 6, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `style::properties::cascade::Cascade::apply_non_prioritary_pr` 2; `[axiosozo-dev]` 2; `mozilla::dom::BrowsingContext::PreOrderWalkVoid(std::functio` 2; `[unknown]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 340 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 324, `write [libc.so.6]` 6, `unlink [libc.so.6]` 4); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 44 ms: buckets subprocess_pipe_io 44, worker_messaging 43, ipc 43, gc_cc 28, poll_wait 12, js_ctypes 11; top self: `poll [libc.so.6]` 11; `madvise [libc.so.6]` 4; `[axiosozo-dev]` 3; `getcontext [libc.so.6]` 2; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 2
- **tab:4764** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 4, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 7, poll_wait 4, gc_cc 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::jit::Assembler::movq(js::jit::Operand const&, js::jit::R` 1; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 0; `js::jit::MaybeForwardedScriptFromCalleeToken(void*) [libxul.` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5249** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped` 1; `zen::ZenMouseTracker::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4746** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## webkit-2x-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **79.3** (Renderer 48.7, main 16.2, DOM Worker 5.4, WRRende~ckend# 3.6, glean.dispatche 1.8) | WPEWebProcess 57.8, AxioWebKitHost 16.2, WPENetworkProce 10.8 | — | 536.0 |
| plain | idle | — | — | **6.5** (main 3.0, DOM Worker 2.0, Timer 1.0, TaskCon~ller # 0.5) | AxioWebKitHost 1.0 | — | — |
| plain | raf | 58.2 | 26.1 | **64.5** (Renderer 20.6, SwComposite 17.3, main 11.8, Backgro~Pool # 4.6, DOM Worker 3.3) | WPEWebProcess 178.1, AxioWebKitHost 20.3 | — | — |
| plain | raf-nosampler | — | — | **52.9** (Renderer 20.3, SwComposite 17.3, main 4.3, Backgro~Pool # 4.3, DOM Worker 2.7) | WPEWebProcess 176.1, AxioWebKitHost 20.6 | — | — |
| plain | scroll | 53.2 | 36.5 | **80.5** (main 19.4, Renderer 18.4, SwComposite 15.0, Backgro~Pool # 10.2, DOM Worker 8.7) | WPEWebProcess 188.0, AxioWebKitHost 22.8, Web Content 0.5 | — | — |
| plain | key | — | — | **17.8** (main 7.4, Renderer 3.6, SwComposite 3.3, DOM Worker 1.4, glean.dispatche 0.3) | WPEWebProcess 17.8, AxioWebKitHost 2.7 | 26.6 | — |
| plain | switch-to-gecko | — | — | **26.0** (main 13.0, Renderer 8.7, TaskCon~ller # 4.3) |  | — | 212.3 |
| plain | switch-to-engine | — | — | **79.3** (Renderer 48.7, main 16.2, DOM Worker 5.4, WRRende~ckend# 3.6, glean.dispatche 1.8) | WPEWebProcess 57.8, AxioWebKitHost 16.2, WPENetworkProce 10.8 | — | 536.0 |
| plain | idle | — | — | **6.5** (main 3.0, DOM Worker 2.0, Timer 1.0, TaskCon~ller # 0.5) | AxioWebKitHost 1.0 | — | — |
| plain | raf | 58.2 | 26.1 | **64.5** (Renderer 20.6, SwComposite 17.3, main 11.8, Backgro~Pool # 4.6, DOM Worker 3.3) | WPEWebProcess 178.1, AxioWebKitHost 20.3 | — | — |
| plain | raf-nosampler | — | — | **52.9** (Renderer 20.3, SwComposite 17.3, main 4.3, Backgro~Pool # 4.3, DOM Worker 2.7) | WPEWebProcess 176.1, AxioWebKitHost 20.6 | — | — |
| plain | scroll | 53.2 | 36.5 | **80.5** (main 19.4, Renderer 18.4, SwComposite 15.0, Backgro~Pool # 10.2, DOM Worker 8.7) | WPEWebProcess 188.0, AxioWebKitHost 22.8, Web Content 0.5 | — | — |
| plain | key | — | — | **17.8** (main 7.4, Renderer 3.6, SwComposite 3.3, DOM Worker 1.4, glean.dispatche 0.3) | WPEWebProcess 17.8, AxioWebKitHost 2.7 | 26.6 | — |
| plain | switch-to-gecko | — | — | **26.0** (main 13.0, Renderer 8.7, TaskCon~ller # 4.3) |  | — | 212.3 |
| profile | switch-to-engine | — | — | **30.6** (DOM Worker 11.9, main 8.5, SamplerThread 6.8, Backgro~Pool # 1.7, WRScene~ilder# 1.7) | WPEWebProcess 59.3, Web Content 44.1, AxioWebKitHost 18.6, WPENetworkProce 10.2 | — | 567.2 |
| profile | idle | — | — | **24.7** (main 7.4, DOM Worker 6.9, SamplerThread 6.9, Timer 2.0, Renderer 0.5) | Web Content 5.4, WebExtensions 1.5, Isolated Web Co 1.5, Privileged Cont 1.5 | — | — |
| profile | raf | 58.1 | 25.1 | **81.7** (Renderer 21.4, SwComposite 17.8, main 14.0, DOM Worker 9.1, SamplerThread 7.5) | WPEWebProcess 176.2, AxioWebKitHost 21.4, Web Content 6.5, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **72.0** (Renderer 20.9, SwComposite 17.3, DOM Worker 9.0, SamplerThread 7.0, main 6.6) | WPEWebProcess 178.2, AxioWebKitHost 21.5, Web Content 6.3, WebExtensions 1.3 | — | — |
| profile | scroll | 54.3 | 32.7 | **98.0** (main 24.2, Renderer 19.3, SwComposite 16.4, DOM Worker 14.5, Backgro~Pool # 10.1) | WPEWebProcess 184.0, AxioWebKitHost 23.2, Web Content 6.3, WebExtensions 1.4 | — | — |
| profile | key | — | — | **39.0** (main 12.6, DOM Worker 8.0, SamplerThread 7.7, Renderer 3.6, SwComposite 3.0) | WPEWebProcess 18.4, Web Content 7.4, AxioWebKitHost 2.5, WebExtensions 1.9 | 29.0 | — |
| profile | switch-to-gecko | — | — | **33.6** (main 12.6, Renderer 8.4, glean.dispatche 4.2, SwComposite 4.2, DOM Worker 4.2) | Isolated Web Co 4.2 | — | 215.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.3 | 0.0 | 0 | 0.0 | — | — | 115.4 | 0.0 | — | 3.71 | 0.56 | — | — | — | — | — | 0.002 |
| profile | raf | 58.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.41 | 0.14 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.47 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 52.4 | 0.0 | 0 | 0.0 | — | — | 8.3 | 0.0 | — | 1.51 | 0.15 | — | — | — | — | — | 0.016 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.12 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.201 | 2.961 | 0.0078 | 0.0105 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.304 | 0.461 | 0.0176 | 0.0268 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.268 | 0.418 | 0.0155 | 0.0242 |
| plain | scroll | memfd | native | 107 | 107 | 0.957 | 1.359 | 0.0494 | 0.0701 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.205 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.201 | 2.961 | 0.0078 | 0.0105 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.304 | 0.461 | 0.0176 | 0.0268 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.268 | 0.418 | 0.0155 | 0.0242 |
| plain | scroll | memfd | native | 107 | 107 | 0.957 | 1.359 | 0.0494 | 0.0701 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.205 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.572 | 3.115 | 0.0085 | 0.0103 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.272 | 0.532 | 0.0158 | 0.0309 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.339 | 0.576 | 0.0197 | 0.0334 |
| profile | scroll | memfd | native | 109 | 109 | 1.193 | 1.687 | 0.0624 | 0.0883 |
| profile | key | memfd | native | 20 | 20 | 0.003 | 0.228 | 0.0000 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 25.9 | 0.0 | — | 0.12 | 0.42 | — | — | 158.4 | 26.9 | 188.1 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 25.4; spawn AxioWebKitHost resolved 49.8; write hello 54.4; first stdout read resolved 116.7; write create 122.7; first frame applied (native receiver) 573.6; write frame_ack 574.5; write visibility 581.4; write focus 581.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.9; first stdout read resolved 27.8

### Profile: webkit-2x-control / switch-to-engine

- **parent** CPU ms by thread group: main 44, DOM Worker 43, Renderer 13, BgPool 10, IPC I/O 3, Compositor 3, SwComposite 2, WRSceneBuilder 2, WRRenderBackend 2, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 44 ms (7.4% of span): JavaScript 19, Idle 9, Other 6, DOM 3, Layout 3, Graphics 2
  - JS leaf 2 / native under JS 26 / native 16; buckets: ipc 44, gc_cc 22, harness_diagnostics 11, poll_wait 10, array_buffer_copy 8, paint_layout 8, engine_stream_read 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `mozilla::EventTargetChainItem::HandleEvent(mozilla::EventCha` 4; `[axiosozo-dev]` 2; `[unknown]` 2; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedSh` 2; `v8::internal::regexp::IrregexpInterpreter::Result v8::intern` 2
  - WebRender/compositor threads: Renderer 13 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 2, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ARGBSetRow_X86 [libxul.so]` 2, `__memset_evex_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 43 ms: buckets subprocess_pipe_io 43, worker_messaging 43, ipc 43, poll_wait 36, js_ctypes 36, memcpy_memset 4; top self: `__syscall_cancel_arch [libc.so.6]` 36; `[axiosozo-dev]` 3; `__abort_lock_unlock [libc.so.6]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js` 0
- **tab:11430** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (8.3% of span): Other 38, Profiler 4, DOM 4, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: ipc 37, array_buffer_copy 17, gc_cc 10, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 1, image_container 1
  - top self: `[]` 6; `__strcmp_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `_uhash_put(UHashtable*, UElement, UElement, signed char, UEr` 2; `__memmove_evex_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (10.9% of span): Other 40, JavaScript 4, DOM 3, Profiler 1, GC / CC 0, Idle 0
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 37, array_buffer_copy 17, gc_cc 11, subprocess_pipe_io 4, memcpy_memset 3, json_metadata 1, image_container 1, poll_wait 0
  - top self: `[libexpat.so.1]` 4; `__read_nocancel [libc.so.6]` 3; `syscall [libc.so.6]` 2; `PLDHashTable::MakeEntryHandle(void const*, std::nothrow_t co` 2; `__strcmp_evex [libc.so.6]` 2; `__memmove_evex_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11332** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 2, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / idle

- **parent** CPU ms by thread group: main 132, DOM Worker 76, other 15, Renderer 3, SwComposite 3, Compositor 2, Socket 1, IPC I/O 1, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 132 ms (6.4% of span): Idle 108, JavaScript 10, DOM 6, Other 5, Profiler 2, Graphics 0
  - JS leaf 2 / native under JS 13 / native 117; buckets: ipc 131, poll_wait 111, harness_diagnostics 13, array_buffer_copy 6, gc_cc 5, engine_stream_read 3, native_receiver 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 109; `[unknown]` 1; `[axiosozo-dev]` 1; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 1; `PrintfAppend<char>::append(char const*, unsigned long) [libx` 1; `bool js::SCInput::readArray<unsigned char>(unsigned char*, u` 1
  - WebRender/compositor threads: Renderer 3 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); SwComposite 3 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `<alloc::string::String as core::fmt::Write>::write` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 76 ms: buckets subprocess_pipe_io 76, js_ctypes 76, worker_messaging 76, ipc 76, poll_wait 76; top self: `__syscall_cancel_arch [libc.so.6]` 76
- **tab:11336** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10971** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf

- **parent** CPU ms by thread group: Renderer 628, SwComposite 529, main 396, DOM Worker 229, BgPool 130, WRRenderBackend 65, Compositor 34, other 26, ImageBridge 14, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 396 ms (12.8% of span): Idle 285, JavaScript 62, Other 29, DOM 16, Profiler 4, GC / CC 2
  - JS leaf 9 / native under JS 68 / native 319; buckets: ipc 395, poll_wait 300, gc_cc 56, engine_stream_read 42, worker_messaging 30, harness_diagnostics 27, subprocess_pipe_io 16, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `[axiosozo-dev]` 5; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 3; `mprotect [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 628 ms (top self: `__syscall_cancel_arch [libc.so.6]` 244, `int blendTextureNearestFast<false, glsl::sampler2D` 139, `void scale_blit<true>(Texture&, IntRect const&, Te` 104); SwComposite 529 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 241, `syscall [libc.so.6]` 215, `__memmove_evex_unaligned_erms [libc.so.6]` 67); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 11, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 128 ms (top self: `__syscall_cancel_arch [libc.so.6]` 90, `__memmove_evex_unaligned_erms [libc.so.6]` 30, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `__lll_lock_wait [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #1 2 ms (top self: `fstatat64 [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 229 ms: buckets subprocess_pipe_io 229, worker_messaging 229, ipc 229, js_ctypes 202, poll_wait 194, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 197; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 3; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 2
- **tab:10971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0; `nsTSubstring<char>::Assign(nsTSubstring<char> const&) [libxu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::IdleTaskManager::DidRunTask() [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 584, SwComposite 511, DOM Worker 219, main 191, BgPool 142, WRRenderBackend 60, Compositor 33, ImageBridge 14, WRSceneBuilder 6, other 2, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 191 ms (6.3% of span): Idle 120, JavaScript 37, Other 21, DOM 8, Profiler 2, GC / CC 2
  - JS leaf 4 / native under JS 36 / native 150; buckets: ipc 189, poll_wait 131, gc_cc 48, engine_stream_read 32, worker_messaging 24, array_buffer_copy 11, subprocess_pipe_io 8, native_receiver 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 132; `[unknown]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `mozilla::dom::MessageEvent::cycleCollection::Unlink(void*) [` 2; `[linux-vdso.so.1]` 2; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigned long*) [` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 584 ms (top self: `__syscall_cancel_arch [libc.so.6]` 200, `int blendTextureNearestFast<false, glsl::sampler2D` 131, `void scale_blit<true>(Texture&, IntRect const&, Te` 101); SwComposite 511 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 238, `syscall [libc.so.6]` 206, `__memmove_evex_unaligned_erms [libc.so.6]` 63); WRRenderBackend#0 60 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 15, `[axiosozo-dev]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #1 142 ms (top self: `__syscall_cancel_arch [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 37, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 219 ms: buckets subprocess_pipe_io 219, worker_messaging 219, ipc 219, js_ctypes 202, poll_wait 200, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 201; `[unknown]` 2; `mozilla::detail::EventQueueInternal<16ul>::GetEven` 1; `__memset_evex_unaligned_erms [libc.so.6]` 1; `NS_CycleCollectorSuspect3 [libxul.so]` 1
- **tab:11430** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / scroll

- **parent** CPU ms by thread group: main 468, Renderer 374, SwComposite 326, DOM Worker 265, BgPool 197, WRRenderBackend 40, Compositor 21, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 468 ms (22.5% of span): Idle 286, JavaScript 83, Other 49, DOM 23, Graphics 10, Profiler 9
  - JS leaf 12 / native under JS 93 / native 363; buckets: ipc 465, poll_wait 339, gc_cc 79, engine_stream_read 54, worker_messaging 39, paint_layout 34, harness_diagnostics 33, subprocess_pipe_io 29
  - top self: `__syscall_cancel_arch [libc.so.6]` 314; `[unknown]` 21; `__lll_lock_wait [libc.so.6]` 10; `[axiosozo-dev]` 6; `__lll_lock_wake [libc.so.6]` 6; `XPCCallContext::XPCCallContext(JSContext*, JS::Handle<JSObje` 3
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 374 ms (top self: `__syscall_cancel_arch [libc.so.6]` 154, `int blendTextureNearestFast<false, glsl::sampler2D` 79, `void scale_blit<true>(Texture&, IntRect const&, Te` 47); SwComposite 326 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 154, `syscall [libc.so.6]` 153, `__memmove_evex_unaligned_erms [libc.so.6]` 18); WRRenderBackend#0 41 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 9, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 197 ms (top self: `__syscall_cancel_arch [libc.so.6]` 120, `__memmove_evex_unaligned_erms [libc.so.6]` 66, `__lll_lock_wait [libc.so.6]` 7); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 265 ms: buckets subprocess_pipe_io 265, worker_messaging 263, ipc 263, js_ctypes 222, poll_wait 208, gc_cc 20; top self: `__syscall_cancel_arch [libc.so.6]` 209; `__lll_lock_wake [libc.so.6]` 14; `__memset_evex_unaligned_erms [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 5; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 3
- **tab:11436** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::d` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10952** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / key

- **parent** CPU ms by thread group: main 425, DOM Worker 185, Renderer 124, SwComposite 116, other 26, WRRenderBackend 16, Compositor 14, WRSceneBuilder 8, BgPool 5, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 425 ms (11.6% of span): Idle 216, JavaScript 71, Other 37, Layout 35, DOM 33, Graphics 20
  - JS leaf 9 / native under JS 134 / native 282; buckets: ipc 422, poll_wait 258, gc_cc 90, paint_layout 64, engine_stream_read 61, worker_messaging 59, harness_diagnostics 26, array_buffer_copy 24
  - top self: `__syscall_cancel_arch [libc.so.6]` 238; `[unknown]` 14; `[axiosozo-dev]` 7; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFra` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `nsFlexContainerFrame::FlexLine::ResolveFlexibleLengths(int, ` 4
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 124 ms (top self: `__syscall_cancel_arch [libc.so.6]` 37, `void scale_blit<true>(Texture&, IntRect const&, Te` 23, `int blendTextureNearestFast<false, glsl::sampler2D` 23); SwComposite 116 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 51, `syscall [libc.so.6]` 37, `__memmove_evex_unaligned_erms [libc.so.6]` 27); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `Pickle::ReadBytesInto(PickleIterator*, void*, unsi` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 185 ms: buckets subprocess_pipe_io 185, worker_messaging 185, ipc 185, js_ctypes 172, poll_wait 171, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 171; `JS::HeapValueWriteBarriers(JS::Value*, JS::Value c` 3; `[axiosozo-dev]` 2; `[unknown]` 1; `nsWifiMonitor::AddRef() [libxul.so]` 1
- **tab:10880** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 0; `js::MicroTaskQueueSet::popFront() [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `JSStructuredCloneReader::readString(unsigned int, JSStructur` 0; `XPCWrappedNative::QueryInterface(nsID const&, void**) [libxu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 36, DOM Worker 11, SwComposite 7, BgPool 5, WRRenderBackend 3, Compositor 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 66 ms (23.8% of span): JavaScript 29, Other 9, Layout 7, Graphics 7, DOM 6, Profiler 5
  - JS leaf 3 / native under JS 42 / native 22; buckets: ipc 66, array_buffer_copy 19, paint_layout 17, gc_cc 12, harness_diagnostics 9, engine_stream_read 6, worker_messaging 5, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mprotect [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `mozilla::nsDisplayWrapList::nsDisplayWrapList(mozilla::nsDis` 2; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [` 2
  - WebRender/compositor threads: Renderer 36 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `__syscall_cancel_arch [libc.so.6]` 4); SwComposite 7 ms (top self: `syscall [libc.so.6]` 6, `__memmove_evex_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::batch::AlphaBatchList::set_params_and_g` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 5 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 1, `fstatat64 [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 9, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 10; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0
- **tab:11332** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.2% of span): Other 8, JavaScript 8, Idle 5, Layout 2, Network 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 19; buckets: ipc 20, gc_cc 7, subprocess_pipe_io 6, poll_wait 5, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `style::values::specified::length::LengthPercentage::parse_in` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsWebBrowser::Release() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10880** CPU ms by thread group: main 5, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (1.8% of span): Idle 3, JavaScript 2
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 5, poll_wait 3, array_buffer_copy 2, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 1; `js::LifoAlloc::release(js::LifoAlloc::Mark) [libxul.so]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[7` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **39.5** (Renderer 13.8, main 9.8, WRRende~ckend# 3.9, Backgro~Pool # 2.0, Timer 2.0) | WPEWebProcess 55.1, AxioWebKitHost 17.7, WPENetworkProce 11.8 | — | 489.5 |
| plain | idle | — | — | **4.0** (main 3.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.0 | 27.1 | **56.3** (main 17.4, DOM Worker 11.8, Renderer 6.2, SwComposite 4.9, IPDL Background 3.6) | WPEWebProcess 54.2, AxioWebKitHost 7.0, RDD Process 0.3, Utility Process 0.3 | — | — |
| plain | raf-nosampler | — | — | **30.2** (Renderer 6.7, main 6.3, SwComposite 5.0, DOM Worker 4.3, TaskCon~ller # 2.3) | WPEWebProcess 55.5, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 55.4 | 33.5 | **43.0** (main 17.0, Renderer 6.5, DOM Worker 6.5, SwComposite 4.5, Backgro~Pool # 2.5) | WPEWebProcess 56.4, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.2, DOM Worker 1.4, Renderer 1.1, SwComposite 1.1, Timer 0.6) | WPEWebProcess 7.0, AxioWebKitHost 1.4, WebExtensions 0.3 | 16.7 | — |
| plain | switch-to-gecko | — | — | **43.8** (main 21.9, TaskCon~ller # 13.1, Socket Thread 4.4, Renderer 4.4) |  | — | 210.3 |
| plain | switch-to-engine | — | — | **39.5** (Renderer 13.8, main 9.8, WRRende~ckend# 3.9, Backgro~Pool # 2.0, Timer 2.0) | WPEWebProcess 55.1, AxioWebKitHost 17.7, WPENetworkProce 11.8 | — | 489.5 |
| plain | idle | — | — | **4.0** (main 3.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.0 | 27.1 | **56.3** (main 17.4, DOM Worker 11.8, Renderer 6.2, SwComposite 4.9, IPDL Background 3.6) | WPEWebProcess 54.2, AxioWebKitHost 7.0, RDD Process 0.3, Utility Process 0.3 | — | — |
| plain | raf-nosampler | — | — | **30.2** (Renderer 6.7, main 6.3, SwComposite 5.0, DOM Worker 4.3, TaskCon~ller # 2.3) | WPEWebProcess 55.5, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 55.4 | 33.5 | **43.0** (main 17.0, Renderer 6.5, DOM Worker 6.5, SwComposite 4.5, Backgro~Pool # 2.5) | WPEWebProcess 56.4, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.2, DOM Worker 1.4, Renderer 1.1, SwComposite 1.1, Timer 0.6) | WPEWebProcess 7.0, AxioWebKitHost 1.4, WebExtensions 0.3 | 16.7 | — |
| plain | switch-to-gecko | — | — | **43.8** (main 21.9, TaskCon~ller # 13.1, Socket Thread 4.4, Renderer 4.4) |  | — | 210.3 |
| profile | switch-to-engine | — | — | **31.8** (DOM Worker 11.7, SamplerThread 10.0, main 8.4, Renderer 1.7) | WPEWebProcess 50.1, Web Content 48.5, AxioWebKitHost 15.0, WPENetworkProce 10.0 | — | 575.8 |
| profile | idle | — | — | **23.2** (main 6.9, DOM Worker 6.9, SamplerThread 6.9, Timer 2.0, TaskCon~ller # 0.5) | Web Content 6.4, Socket Process 1.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 58.1 | 20.6 | **55.5** (main 13.7, DOM Worker 10.1, SamplerThread 9.2, Renderer 7.5, SwComposite 5.9) | WPEWebProcess 56.6, AxioWebKitHost 6.9, Web Content 6.8, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **44.9** (DOM Worker 10.6, SamplerThread 8.0, Renderer 7.6, SwComposite 6.0, main 5.6) | WPEWebProcess 54.8, AxioWebKitHost 7.0, Web Content 6.6, WebExtensions 1.3 | — | — |
| profile | scroll | 57.9 | 30.0 | **76.2** (main 27.2, DOM Worker 13.3, SamplerThread 8.9, Renderer 7.4, SwComposite 5.4) | WPEWebProcess 60.9, AxioWebKitHost 8.4, Web Content 5.9, WebExtensions 1.5 | — | — |
| profile | key | — | — | **35.8** (main 13.7, DOM Worker 8.0, SamplerThread 7.4, Timer 1.4, Renderer 1.4) | Web Content 7.1, WPEWebProcess 6.8, WebExtensions 1.7, AxioWebKitHost 1.7 | 17.9 | — |
| profile | switch-to-gecko | — | — | **41.3** (main 12.4, QuotaManager IO 8.3, DOM Worker 8.3, BgIOThr~Pool # 4.1, Renderer 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 215.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.3 | 0.0 | 0 | 0.0 | — | — | 118.3 | 0.0 | — | 2.02 | 0.60 | — | — | — | — | — | 0.002 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.15 | 0.12 | — | — | — | — | — | 0.008 |
| profile | raf-nosampler | 58.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.16 | 0.12 | — | — | — | — | — | 0.009 |
| profile | scroll | 56.5 | 0.0 | 0 | 0.0 | — | — | 10.0 | 0.0 | — | 0.37 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.904 | 1.527 | 0.0035 | 0.0059 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.047 | 0.117 | 0.0028 | 0.0068 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.064 | 0.139 | 0.0037 | 0.0081 |
| plain | scroll | memfd | native | 109 | 109 | 0.213 | 0.296 | 0.0115 | 0.0160 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.098 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.904 | 1.527 | 0.0035 | 0.0059 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.047 | 0.117 | 0.0028 | 0.0068 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.064 | 0.139 | 0.0037 | 0.0081 |
| plain | scroll | memfd | native | 109 | 109 | 0.213 | 0.296 | 0.0115 | 0.0160 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.098 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.028 | 2.090 | 0.0034 | 0.0068 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.058 | 0.120 | 0.0034 | 0.0070 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.071 | 0.144 | 0.0041 | 0.0084 |
| profile | scroll | memfd | native | 115 | 115 | 0.241 | 0.340 | 0.0136 | 0.0192 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.108 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 14.9 | 0.0 | — | 0.14 | 0.49 | — | — | 161.9 | 16.3 | 178.4 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 23.3; spawn AxioWebKitHost resolved 41.8; write hello 46.3; first stdout read resolved 123.2; write create 128.8; first frame applied (native receiver) 581.7; write frame_ack 582.8; write visibility 589.7; write focus 589.8

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 19.2; first stdout read resolved 27.3

### Profile: webkit-control / switch-to-engine

- **parent** CPU ms by thread group: main 43, DOM Worker 42, Renderer 8, BgPool 6, IPC I/O 4, Compositor 2, SwComposite 2, WRSceneBuilder 1, WRRenderBackend 1, Socket 1, ImageBridge 0, other 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 43 ms (7.0% of span): JavaScript 17, DOM 7, Idle 7, Layout 4, Other 4, Graphics 3
  - JS leaf 1 / native under JS 24 / native 18; buckets: ipc 41, gc_cc 21, worker_messaging 9, harness_diagnostics 9, array_buffer_copy 8, engine_stream_read 8, paint_layout 8, poll_wait 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `[axiosozo-dev]` 3; `[unknown]` 2; `mozilla::CanAttemptToDrainMoreMicroTasks(mozilla::CycleColle` 2; `mozilla::EventListenerManager::HandleEventInternal(nsPresCon` 2; `[libxul.so]` 2
  - WebRender/compositor threads: Renderer 8 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 1, `int blendTextureNearestFast<false, glsl::sampler2D` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 2, `__memset_evex_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 42 ms: buckets subprocess_pipe_io 42, worker_messaging 42, ipc 42, js_ctypes 34, poll_wait 33, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 33; `__lll_lock_wait [libc.so.6]` 2; `mozilla::dom::WorkerThread::Observer::OnProcessNex` 1; `__abort_lock_unlock [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1
- **tab:10465** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (8.3% of span): Other 39, JavaScript 5, DOM 3, Profiler 1, GC / CC 1, Idle 1
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 34, gc_cc 13, array_buffer_copy 13, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 1
  - top self: `[]` 3; `__read_nocancel [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.` 2; `__strlen_evex [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10468** CPU ms by thread group: main 43, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (9.7% of span): Other 31, JavaScript 5, DOM 3, Profiler 3, Idle 1
  - JS leaf 0 / native under JS 5 / native 38; buckets: ipc 34, array_buffer_copy 14, gc_cc 11, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 0
  - top self: `__strlen_evex [libc.so.6]` 3; `[]` 2; `js::wasm::TypeContext::startRecGroup(unsigned int) [libxul.s` 2; `[libfontconfig.so.1]` 2; `ustr_hashUCharsN_78 [libxul.so]` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10372** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / idle

- **parent** CPU ms by thread group: main 136, DOM Worker 78, other 15, Compositor 2, Renderer 1, SwComposite 1, Socket 1, IPC I/O 1, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 136 ms (6.6% of span): Idle 114, JavaScript 12, Other 5, DOM 3, Profiler 2
  - JS leaf 1 / native under JS 14 / native 122; buckets: ipc 136, poll_wait 117, harness_diagnostics 13, gc_cc 5, array_buffer_copy 4, subprocess_pipe_io 3, engine_stream_read 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 3; `[axiosozo-dev]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedSh` 1; `js::frontend::EmitterScope::lookupInCache(js::frontend::Byte` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `SkMatrixPriv::MapRect(SkM44 const&, SkRect const&)` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 78 ms: buckets subprocess_pipe_io 78, js_ctypes 78, worker_messaging 78, ipc 78, poll_wait 78, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 78; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigne` 0
- **tab:9993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10012** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<unsigned long>::type, (std::i` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9971** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / raf

- **parent** CPU ms by thread group: main 399, Renderer 227, DOM Worker 227, SwComposite 172, WRRenderBackend 50, BgPool 38, Compositor 33, other 26, ImageBridge 14, WRSceneBuilder 7, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 399 ms (13.0% of span): Idle 273, JavaScript 68, Other 25, DOM 16, GC / CC 12, Profiler 5
  - JS leaf 8 / native under JS 69 / native 323; buckets: ipc 398, poll_wait 284, gc_cc 68, engine_stream_read 34, worker_messaging 32, harness_diagnostics 28, array_buffer_copy 18, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 280; `[unknown]` 12; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 273 ms, GCSlice 3× 15 ms, GCMinor 3× 3 ms
  - WebRender/compositor threads: Renderer 227 ms (top self: `__syscall_cancel_arch [libc.so.6]` 115, `int blendTextureNearestFast<false, glsl::sampler2D` 39, `void scale_blit<true>(Texture&, IntRect const&, Te` 15); SwComposite 172 ms (top self: `syscall [libc.so.6]` 100, `void scale_blit<true>(Texture&, IntRect const&, Te` 63, `__memmove_evex_unaligned_erms [libc.so.6]` 8); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__syscall_cancel_arch [libc.so.6]` 32, `__memmove_evex_unaligned_erms [libc.so.6]` 3, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `__lll_lock_wait [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 227 ms: buckets subprocess_pipe_io 227, worker_messaging 227, ipc 227, js_ctypes 212, poll_wait 202, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 204; `[axiosozo-dev]` 3; `[linux-vdso.so.1]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 1; `[unknown]` 1
- **tab:9971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::IdleSchedulerChild::RecvIdleTime(unsigned long` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10376** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(un` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 226, Renderer 210, SwComposite 173, main 160, WRRenderBackend 48, BgPool 44, Compositor 34, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 160 ms (5.3% of span): Idle 104, JavaScript 30, Other 19, DOM 5, Profiler 3, GC / CC 0
  - JS leaf 3 / native under JS 31 / native 126; buckets: ipc 160, poll_wait 113, gc_cc 33, engine_stream_read 27, worker_messaging 19, subprocess_pipe_io 9, array_buffer_copy 8, js_ctypes 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 115; `[unknown]` 4; `bool mozilla::dom::binding_detail::GenericMethod<mozilla::do` 1; `js::WeakMap<JS::Value, JS::Value, js::BufferAllocPolicy>::wr` 1; `TimerThread::AddTimerInternal(nsTimerImpl&) [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 210 ms (top self: `__syscall_cancel_arch [libc.so.6]` 106, `int blendTextureNearestFast<false, glsl::sampler2D` 36, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 15); SwComposite 173 ms (top self: `syscall [libc.so.6]` 94, `void scale_blit<true>(Texture&, IntRect const&, Te` 71, `__memmove_evex_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 44 ms (top self: `__syscall_cancel_arch [libc.so.6]` 41, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `axio::SinkState::CopyRect(unsigned char*, unsigned` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `WritePadding(mozilla::BufferList<InfallibleAllocPo` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 226 ms: buckets subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 209, poll_wait 201, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 203; `__memset_evex_unaligned_erms [libc.so.6]` 2; `js::ctypes::ArrayType::CreateInternal(JSContext*, ` 1; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 1; `[unknown]` 1
- **tab:10372** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 0; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0
  - GC/CC markers: GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10376** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / scroll

- **parent** CPU ms by thread group: main 510, DOM Worker 229, Renderer 139, SwComposite 106, BgPool 68, WRRenderBackend 32, Compositor 21, other 17, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 510 ms (25.1% of span): Idle 261, JavaScript 88, GC / CC 67, Other 60, DOM 16, Profiler 6
  - JS leaf 9 / native under JS 91 / native 410; buckets: ipc 509, poll_wait 310, gc_cc 139, engine_stream_read 44, worker_messaging 42, harness_diagnostics 32, paint_layout 29, subprocess_pipe_io 23
  - top self: `__syscall_cancel_arch [libc.so.6]` 281; `[unknown]` 23; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 21; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 15× 63 ms, CCSlice 4× 12 ms, GCMinor 2× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 139 ms (top self: `__syscall_cancel_arch [libc.so.6]` 91, `int blendTextureNearestFast<false, glsl::sampler2D` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); SwComposite 106 ms (top self: `syscall [libc.so.6]` 92, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 32 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 66 ms (top self: `__syscall_cancel_arch [libc.so.6]` 53, `__memmove_evex_unaligned_erms [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `mozilla::ipc::PortLink::SendMessage(std::unique_pt` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 223 ms: buckets subprocess_pipe_io 223, worker_messaging 222, ipc 222, js_ctypes 197, poll_wait 188, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 190; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 2
- **tab:9971** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10376** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / key

- **parent** CPU ms by thread group: main 462, DOM Worker 186, Renderer 45, SwComposite 37, other 26, Compositor 15, WRRenderBackend 13, WRSceneBuilder 8, BgPool 3, ImageBridge 2, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 462 ms (12.7% of span): Idle 211, JavaScript 90, Other 38, GC / CC 36, Layout 33, DOM 21
  - JS leaf 12 / native under JS 142 / native 308; buckets: ipc 457, poll_wait 248, gc_cc 129, worker_messaging 69, engine_stream_read 65, paint_layout 62, subprocess_pipe_io 32, harness_diagnostics 26
  - top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 21; `[axiosozo-dev]` 9; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4; `[linux-vdso.so.1]` 4
  - GC/CC markers: GCMajor 1× 1049 ms, GCSlice 8× 31 ms, CCSlice 2× 7 ms, GCMinor 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 45 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `int blendTextureNearestFast<false, glsl::sampler2D` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 6); SwComposite 37 ms (top self: `syscall [libc.so.6]` 21, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 12, `webrender::picture::PictureInstance::take_context ` 0, `webrender::resource_cache::ResourceCache::request_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 186 ms: buckets subprocess_pipe_io 186, worker_messaging 186, ipc 186, js_ctypes 172, poll_wait 169, array_buffer_copy 2; top self: `__syscall_cancel_arch [libc.so.6]` 169; `js::ctypes::CData::Create(JSContext*, JS::Handle<J` 3; `[unknown]` 2; `getcontext [libc.so.6]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1
- **tab:9920** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `JS::GetFunctionRealm(JSContext*, JS::Handle<JSObject*>) [lib` 0; `XPCWrappedNativeScope::GetExpandoChain(JS::Handle<JSObject*>` 0; `js::AbstractGeneratorObject::createFromFrame(JSContext*, js:` 0; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9993** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / switch-to-gecko

- **parent** CPU ms by thread group: main 67, Renderer 21, DOM Worker 11, BgPool 5, WRRenderBackend 3, Compositor 2, SwComposite 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 67 ms (24.3% of span): JavaScript 31, Layout 12, Other 10, Graphics 4, DOM 4, Idle 4
  - JS leaf 4 / native under JS 39 / native 24; buckets: ipc 67, gc_cc 20, paint_layout 17, array_buffer_copy 17, harness_diagnostics 8, engine_stream_read 5, poll_wait 5, worker_messaging 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `mprotect [libc.so.6]` 4; `JSString* js::ConcatStrings<(js::AllowGC)0>(JSContext*, js::` 3; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<n` 3; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::d` 3; `[unknown]` 2
  - WebRender/compositor threads: Renderer 21 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `__syscall_cancel_arch [libc.so.6]` 3, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 1, `rmdir [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 10, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 10; `[unknown]` 0; `js::ctypes::StructType::FieldSetter(JSContext*, un` 0; `getcontext [libc.so.6]` 0; `JS::GetArrayBufferData(JSObject*, bool*, JS::AutoR` 0
- **tab:10372** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.4% of span): JavaScript 10, Idle 6, Other 5, Layout 4, DOM 1, Profiler 0
  - JS leaf 0 / native under JS 9 / native 17; buckets: ipc 23, paint_layout 11, gc_cc 9, poll_wait 6, subprocess_pipe_io 5, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `JS::GetObjectZone(JSObject*) [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `style::stylist::CascadeData::add_styles [libxul.so]` 1; `js::UnwrapOneCheckedStatic(JSObject*) [libxul.so]` 1; `mozilla::xpcom::CreateInstanceImpl(mozilla::xpcom::ModuleID,` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9920** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.4% of span): Idle 3, DOM 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `mozilla::dom::ToJSValue(JSContext*, mozilla::dom::WindowProx` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10465** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

