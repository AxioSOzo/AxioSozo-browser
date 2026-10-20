# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.1 | **7.8** (Renderer 2.9, main 1.9, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Web Content 2.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.2 | **26.0** (Renderer 16.0, main 2.0, WRRende~ckend# 2.0, glean.dispatche 1.6, TaskCon~ller # 1.0) | Isolated Web Co 3.6, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.1** (Renderer 9.0, WRRende~ckend# 2.0, main 1.3, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 3.6 | — | — |
| plain | scroll | 59.0 | 17.1 | **40.7** (Renderer 28.2, main 3.5, WRRende~ckend# 2.5, WRScene~ilder# 1.5, Compositor 1.5) | Isolated Web Co 3.5 | — | — |
| plain | key | — | — | **7.7** (main 4.3, Renderer 0.8, TaskCon~ller # 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, Web Content 0.3, Privileged Cont 0.3 | 9.0 | — |
| trace | idle | 59.2 | 17.1 | **3.0** (main 1.5, TaskCon~ller # 1.0, IPDL Background 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.2 | **19.8** (Renderer 9.1, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.3) | Isolated Web Co 3.6 | — | — |
| trace | raf-nosampler | — | — | **17.2** (Renderer 9.3, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.3, Compositor 1.0) | Isolated Web Co 3.6, Privileged Cont 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **42.7** (Renderer 27.7, main 5.0, WRRende~ckend# 2.5, WRScene~ilder# 1.5, Compositor 1.5) | Isolated Web Co 3.5 | — | — |
| trace | key | — | — | **48.3** (main 17.1, DOM Worker 15.5, IPDL Background 5.6, TaskCon~ller # 2.4, Indexed~ IO # 1.6) | Isolated Web Co 2.2, WebExtensions 0.8, RDD Process 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **9.3** (SamplerThread 3.9, main 2.4, TaskCon~ller # 1.5, Softwar~cThread 0.5, Renderer 0.5) | Web Content 9.2, Isolated Web Co 4.3, WebExtensions 1.9, Privileged Cont 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **29.4** (Renderer 10.4, SamplerThread 6.2, WRRende~ckend# 2.3, main 2.0, Compositor 2.0) | Isolated Web Co 8.8, Web Content 7.8, WebExtensions 1.6, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **25.0** (Renderer 10.6, SamplerThread 6.0, WRRende~ckend# 2.3, WRScene~ilder# 1.7, Compositor 1.7) | Web Content 8.0, Isolated Web Co 8.0, Privileged Cont 2.0, WebExtensions 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **58.7** (Renderer 31.5, SamplerThread 7.9, main 5.9, WRRende~ckend# 3.9, Compositor 2.0) | Isolated Web Co 8.9, Web Content 8.4, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **15.7** (main 5.3, SamplerThread 4.5, TaskCon~ller # 0.8, Renderer 0.8, WRRende~ckend# 0.8) | Web Content 8.3, Isolated Web Co 3.8, Privileged Cont 1.6, WebExtensions 1.3 | 11.0 | — |

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

- **parent** CPU ms by thread group: main 50, Compositor 2, DOM Worker 1, IPC I/O 1, Socket 1, other 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.4% of span): GC / CC 28, Idle 9, Other 5, JavaScript 4, Profiler 2, Layout 1
  - JS leaf 1 / native under JS 5 / native 44; buckets: ipc 50, gc_cc 34, poll_wait 14, harness_diagnostics 4, subprocess_pipe_io 1, memcpy_memset 1, paint_layout 1, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `read [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 7× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3295** CPU ms by thread group: main 28, IPC I/O 5, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 28 ms (1.4% of span): Idle 20, GC / CC 5, JavaScript 2, Other 1, Profiler 0, DOM 0
  - JS leaf 0 / native under JS 2 / native 26; buckets: ipc 27, poll_wait 21, gc_cc 5, array_buffer_copy 2, harness_diagnostics 2, memcpy_memset 1, paint_layout 0
  - top self: `poll [libc.so.6]` 20; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedSh` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 25 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3316** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3207** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 309, WRRenderBackend 60, main 58, WRSceneBuilder 48, Compositor 40, SwComposite 16, IPC I/O 10, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 58 ms (1.9% of span): GC / CC 27, Idle 21, JavaScript 4, Other 2, Layout 2, Graphics 1
  - JS leaf 0 / native under JS 5 / native 53; buckets: ipc 58, gc_cc 31, poll_wait 23, harness_diagnostics 3, paint_layout 3, memcpy_memset 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 22; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `gfxFontGroup::GetFirstValidFont(unsigned int, mozilla::Style` 1; `js::jit::CacheIRStubKey::match(js::jit::CacheIRStubKey const` 1; `mozilla::CycleCollectedJSRuntime::UnmarkSkippableJSHolders()` 1
  - GC/CC markers: GCMajor 1× 57 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 309 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 89, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 58, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 53); WRRenderBackend#0 60 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1); WRSceneBuilder#0 42 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 1, poll_wait 0; top self: `[axiosozo-dev]` 1; `js::StringPrinter::put(char const*, unsigned long)` 1; `madvise [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3295** CPU ms by thread group: main 148, IPC I/O 15, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 148 ms (4.8% of span): Idle 100, Graphics 16, Layout 13, Other 10, Profiler 5, JavaScript 4
  - JS leaf 0 / native under JS 6 / native 142; buckets: ipc 143, poll_wait 101, paint_layout 38, gc_cc 3, canvas_2d 3, harness_diagnostics 2, subprocess_pipe_io 2, array_buffer_copy 2
  - top self: `poll [libc.so.6]` 101; `sendmsg [libc.so.6]` 3; `[]` 2; `mozilla::FindAnimationsForCompositor(nsIFrame const*, nsCSSP` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, ` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3376** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3186** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 311, WRRenderBackend 58, WRSceneBuilder 47, Compositor 40, main 13, SwComposite 10, IPC I/O 9, other 1, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 13 ms (0.4% of span): Idle 9, JavaScript 4, Other 0, Graphics 0
  - JS leaf 0 / native under JS 3 / native 10; buckets: ipc 13, poll_wait 9, gc_cc 4, harness_diagnostics 3, array_buffer_copy 3, paint_layout 0
  - top self: `poll [libc.so.6]` 9; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1; `JSStructuredCloneWriter::traverseObject(JS::Handle<JSObject*` 1; `js::NewFunctionWithProto(JSContext*, bool (*)(JSContext*, un` 1; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 1; `[unknown]` 0
  - WebRender/compositor threads: Renderer 311 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 80, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 40); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 41 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `RelazifyFunctions(JS::Zone*, js::gc::AllocKind) [l` 0
- **tab:3295** CPU ms by thread group: main 137, IPC I/O 15, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 137 ms (4.5% of span): Idle 97, Graphics 16, Layout 11, Other 7, Profiler 5, DOM 0
  - JS leaf 0 / native under JS 4 / native 133; buckets: ipc 132, poll_wait 99, paint_layout 31, memcpy_memset 1, subprocess_pipe_io 1, mozafterpaint_events 0, webrender_render 0, gc_cc 0
  - top self: `poll [libc.so.6]` 98; `[]` 2; `write [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3186** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3233** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 615, main 123, WRRenderBackend 66, SwComposite 30, Compositor 28, WRSceneBuilder 22, IPC I/O 8, other 1, Socket 1, BgPool 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 123 ms (6.0% of span): Idle 64, GC / CC 32, Other 10, Graphics 8, JavaScript 6, Layout 2
  - JS leaf 0 / native under JS 6 / native 118; buckets: ipc 123, poll_wait 80, gc_cc 35, paint_layout 10, array_buffer_copy 3, harness_diagnostics 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 66; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `[unknown]` 2; `[axiosozo-dev]` 2; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 9× 24 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 615 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 198, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 87, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63); WRRenderBackend#0 66 ms (top self: `syscall [libc.so.6]` 49, `sched_yield [libc.so.6]` 2, `webrender::quad::prepare_quad_impl [libxul.so]` 1); SwComposite 30 ms (top self: `syscall [libc.so.6]` 29, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `open64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3295** CPU ms by thread group: main 91, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 91 ms (4.4% of span): Idle 58, Graphics 11, GC / CC 8, Other 6, JavaScript 3, Profiler 2
  - JS leaf 0 / native under JS 4 / native 87; buckets: ipc 88, poll_wait 58, paint_layout 14, gc_cc 11, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 57; `sendmsg [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `webrender_api::display_list::DisplayListBuilder::push_iter [` 1; `[linux-vdso.so.1]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3207** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3233** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 189, Renderer 32, WRRenderBackend 17, Compositor 16, WRSceneBuilder 13, IPC I/O 8, SwComposite 3, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 189 ms (5.0% of span): Idle 36, Layout 36, GC / CC 30, JavaScript 28, Graphics 26, Other 25
  - JS leaf 2 / native under JS 26 / native 160; buckets: ipc 189, paint_layout 65, poll_wait 61, gc_cc 44, subprocess_pipe_io 10, harness_diagnostics 6, memcpy_memset 4, canvas_2d 2
  - top self: `poll [libc.so.6]` 40; `[axiosozo-dev]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `recvmsg [libc.so.6]` 5; `[unknown]` 4; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 4
  - GC/CC markers: GCMajor 1× 83 ms, GCSlice 12× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 32 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `hypotf@@GLIBC_2.35 [libm.so.6]` 1); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 15, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 0); WRSceneBuilder#0 12 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3295** CPU ms by thread group: main 61, IPC I/O 6, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 61 ms (1.6% of span): Idle 22, Other 10, GC / CC 7, JavaScript 6, Layout 6, Graphics 5
  - JS leaf 0 / native under JS 6 / native 55; buckets: ipc 56, poll_wait 22, paint_layout 15, gc_cc 11, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 0, webrender_render 0
  - top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 4; `[]` 2; `[libgcc_s.so.1]` 1; `NeedsScriptTraverse(nsINode*) [libxul.so]` 1; `nsINode::GetMutationObservers() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3130** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 5; `js::jit::GetPropIRGenerator::tryAttachTypedArrayElement(JS::` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `js::Wrapper::wrappedObject(JSObject*) [libxul.so]` 0; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3207** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

