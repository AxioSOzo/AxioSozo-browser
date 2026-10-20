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

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.1 | **8.7** (main 2.4, Renderer 1.9, DOM Worker 1.4, IPDL Background 1.0, TaskCon~ller # 0.5) | Web Content 3.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **33.8** (Renderer 19.9, SwComposite 2.9, WRRende~ckend# 2.6, glean.dispatche 2.0, main 1.6) | Isolated Web Co 4.2, WebExtensions 0.7, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **22.2** (Renderer 11.9, SwComposite 2.0, glean.dispatche 1.7, WRRende~ckend# 1.7, WRScene~ilder# 1.3) | Isolated Web Co 4.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **85.8** (Renderer 66.1, SwComposite 6.4, main 4.9, WRRende~ckend# 3.9, Compositor 2.0) | Isolated Web Co 4.4, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **9.0** (main 4.3, Renderer 1.1, TaskCon~ller # 0.5, WRScene~ilder# 0.5, Compositor 0.5) | Isolated Web Co 1.9 | 9.0 | — |
| trace | idle | 59.5 | 17.1 | **5.4** (main 1.9, TaskCon~ller # 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Renderer 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **19.9** (Renderer 8.1, glean.dispatche 2.0, WRRende~ckend# 2.0, SwComposite 2.0, main 1.6) | Isolated Web Co 4.5 | — | — |
| trace | raf-nosampler | — | — | **20.3** (Renderer 10.6, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, SwComposite 1.7) | Isolated Web Co 5.0 | — | — |
| trace | scroll | 59.0 | 17.3 | **88.2** (Renderer 65.5, main 6.4, SwComposite 6.4, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| trace | key | — | — | **62.2** (main 18.4, DOM Worker 16.2, Indexed~ IO # 10.6, IPDL Background 6.9, TaskCon~ller # 2.4) | Isolated Web Co 1.9, WebExtensions 0.3, RDD Process 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **9.1** (SamplerThread 4.3, main 2.4, TaskCon~ller # 1.9, DOM Worker 0.5) | Web Content 8.7, Isolated Web Co 4.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.1 | **31.1** (Renderer 9.4, SamplerThread 6.5, SwComposite 2.6, WRRende~ckend# 2.3, main 1.9) | Isolated Web Co 9.7, Web Content 8.1, Privileged Cont 2.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **32.1** (Renderer 13.2, SamplerThread 6.6, SwComposite 2.6, WRRende~ckend# 2.3, glean.dispatche 2.0) | Isolated Web Co 9.7, Web Content 8.3, Privileged Cont 2.0, WebExtensions 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **111.5** (Renderer 73.9, SamplerThread 10.2, SwComposite 8.3, main 6.8, WRRende~ckend# 4.9) | Web Content 10.2, Isolated Web Co 9.7, Privileged Cont 2.4, WebExtensions 1.9 | — | — |
| profile | key | — | — | **14.9** (main 5.6, SamplerThread 4.5, Renderer 1.3, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 8.3, Isolated Web Co 4.5, WebExtensions 1.9, Socket Process 1.6 | 10.0 | — |

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

- **parent** CPU ms by thread group: main 52, DOM Worker 2, IPC I/O 1, Compositor 1, SwComposite 1, Socket 1, other 1, WRRenderBackend 0, WRSceneBuilder 0, Renderer 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (2.5% of span): GC / CC 29, Other 8, Idle 7, JavaScript 6, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 7 / native 44; buckets: ipc 51, gc_cc 34, poll_wait 14, harness_diagnostics 5, memcpy_memset 2, array_buffer_copy 1, paint_layout 0, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `read [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `nsINode::GetExistingListenerManager() const [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 0; top self: `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 26, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (1.2% of span): Idle 16, GC / CC 6, JavaScript 3, Other 1, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 22; buckets: ipc 25, poll_wait 16, gc_cc 8, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onObjectEdge(JSObjec` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3133** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `mozilla::TaskController::MaybeDispatchOneThreadableTask(mozi` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3289** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 276, SwComposite 72, WRRenderBackend 67, main 61, WRSceneBuilder 55, Compositor 45, IPC I/O 11, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 61 ms (2.0% of span): GC / CC 28, Idle 24, JavaScript 6, Other 2, Layout 2, Profiler 0
  - JS leaf 0 / native under JS 6 / native 56; buckets: ipc 61, gc_cc 31, poll_wait 27, harness_diagnostics 5, paint_layout 2, array_buffer_copy 2, memcpy_memset 1, json_metadata 1
  - top self: `poll [libc.so.6]` 24; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `syscall [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 276 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 89, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 69, `int blendTextureNearestFast<true, glsl::sampler2D_` 14); SwComposite 72 ms (top self: `syscall [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeJ` 0); WRRenderBackend#0 67 ms (top self: `syscall [libc.so.6]` 57, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, memcpy_memset 2, gc_cc 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `munmap [libc.so.6]` 1
- **tab:3285** CPU ms by thread group: main 165, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 165 ms (5.3% of span): Idle 104, Graphics 25, Layout 16, Other 8, Profiler 7, JavaScript 3
  - JS leaf 0 / native under JS 7 / native 157; buckets: ipc 158, poll_wait 105, paint_layout 48, harness_diagnostics 3, gc_cc 3, array_buffer_copy 2, canvas_2d 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 103; `sendmsg [libc.so.6]` 3; `[]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `[linux-vdso.so.1]` 2; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(un` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3374** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3190** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 373, WRRenderBackend 63, SwComposite 60, WRSceneBuilder 53, Compositor 45, main 14, IPC I/O 10, other 2, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 14 ms (0.5% of span): Idle 10, JavaScript 2, Other 1, Graphics 0
  - JS leaf 1 / native under JS 2 / native 11; buckets: ipc 14, poll_wait 10, harness_diagnostics 2, array_buffer_copy 2, gc_cc 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 10; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 1; `write [libc.so.6]` 1; `sandbox.create (chrome://remote/content/marionette/evaluate.` 1; `[unknown]` 1; `std::pair<std::__detail::_Node_iterator<mozilla::DisplayItem` 0
  - WebRender/compositor threads: Renderer 373 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 103, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 43); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 60 ms (top self: `syscall [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `[libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 156, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 156 ms (5.1% of span): Idle 107, Graphics 24, Layout 15, Profiler 5, Other 5, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 151; buckets: ipc 150, poll_wait 109, paint_layout 43, canvas_2d 2, gc_cc 1, memcpy_memset 1, subprocess_pipe_io 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 108; `[]` 4; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 1; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul` 1; `read [libc.so.6]` 1; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3374** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1471, main 140, SwComposite 138, WRRenderBackend 95, Compositor 32, WRSceneBuilder 24, IPC I/O 9, other 1, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 140 ms (6.7% of span): Idle 71, GC / CC 29, Other 12, Graphics 9, DOM 8, Layout 5
  - JS leaf 0 / native under JS 10 / native 130; buckets: ipc 140, poll_wait 96, gc_cc 33, paint_layout 14, harness_diagnostics 6, array_buffer_copy 4, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 72; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 3; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2
  - GC/CC markers: GCSlice 6× 20 ms, CCSlice 1× 6 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1471 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 461, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 314, `hypotf@@GLIBC_2.35 [libm.so.6]` 105); SwComposite 138 ms (top self: `syscall [libc.so.6]` 127, `__memmove_avx_unaligned_erms [libc.so.6]` 11, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 95 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 5, `core::hash::BuildHasher::hash_one [libxul.so]` 3)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `mozilla::PrintfTarget::vprint(char const*, __va_li` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 107, IPC I/O 15, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 107 ms (5.1% of span): Idle 69, Graphics 14, GC / CC 9, Other 7, JavaScript 5, Layout 1
  - JS leaf 0 / native under JS 5 / native 102; buckets: ipc 104, poll_wait 70, paint_layout 18, gc_cc 12, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 68; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `sendmsg [libc.so.6]` 2; `ScanBlackVisitor::VisitNode(PtrInfo*) [libxul.so]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 18 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3374** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 203, Renderer 46, WRRenderBackend 18, Compositor 17, WRSceneBuilder 14, SwComposite 13, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 203 ms (5.4% of span): Idle 46, Layout 42, JavaScript 33, GC / CC 31, Graphics 22, Other 20
  - JS leaf 3 / native under JS 34 / native 165; buckets: ipc 203, poll_wait 67, paint_layout 63, gc_cc 46, subprocess_pipe_io 8, harness_diagnostics 5, array_buffer_copy 5, memcpy_memset 4
  - top self: `poll [libc.so.6]` 48; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `[axiosozo-dev]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `mprotect [libc.so.6]` 4; `mozilla::detail::ConditionVariableImpl::wait_for(mozilla::de` 2
  - GC/CC markers: GCMajor 1× 83 ms, GCSlice 10× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 46 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3285** CPU ms by thread group: main 64, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 64 ms (1.7% of span): Idle 20, Other 14, Layout 9, JavaScript 8, GC / CC 7, Graphics 4
  - JS leaf 1 / native under JS 7 / native 57; buckets: ipc 58, poll_wait 21, paint_layout 15, gc_cc 13, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 1
  - top self: `poll [libc.so.6]` 20; `[]` 3; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 2; `sendmsg [libc.so.6]` 2; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 1; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) ` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3133** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 5; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0; `read [libc.so.6]` 0; `mozilla::ipc::MessageChannel::DispatchAsyncMessage(mozilla::` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **78.4** (Renderer 33.7, main 26.2, glean.dispatche 3.7, Socket Thread 3.7, StyleThread# 3.7) | AxioCEFProbe 29.9, cef:gpu-process 22.4, cef:renderer 15.0, cef:utility 14.9 | — | 236.9 |
| plain | idle | — | — | **5.3** (main 2.9, DOM Worker 1.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 60.1 | 20.6 | **17.3** (main 7.1, Renderer 1.9, DOM Worker 1.9, WRRende~ckend# 1.3, TaskCon~ller # 1.0) | cef:renderer 7.5, AxioCEFProbe 3.8, cef:gpu-process 3.2, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.5** (main 4.3, DOM Worker 2.7, Renderer 2.0, SwComposite 1.3, glean.dispatche 1.0) | cef:renderer 8.7, cef:gpu-process 5.3, AxioCEFProbe 4.3 | — | — |
| plain | scroll | 59.9 | 24.5 | **35.1** (main 17.2, DOM Worker 6.4, Renderer 2.0, TaskCon~ller # 1.5, WRRende~ckend# 1.5) | cef:gpu-process 18.2, cef:renderer 8.8, AxioCEFProbe 6.9 | — | — |
| plain | key | — | — | **11.5** (main 6.9, Renderer 1.1, DOM Worker 1.1, TaskCon~ller # 0.6, Compositor 0.6) | cef:renderer 2.3, AxioCEFProbe 1.7, cef:gpu-process 0.6 | 11.1 | — |
| plain | switch-to-gecko | — | — | **11.3** (main 3.3, DOM Worker 3.3, IndexedDB IO # 1.6, IPDL Background 0.9, TaskCon~ller # 0.8) | WebExtensions 0.2, Privileged Cont 0.1, Web Content 0.1 | — | 15798.9 |
| trace | switch-to-engine | — | — | **93.1** (main 35.8, Renderer 25.0, TaskCon~ller # 10.7, IPDL Background 3.6, WRWorker# 3.6) | AxioCEFProbe 50.1, cef:gpu-process 25.0, cef:utility 17.9, cef:renderer 14.3 | — | 245.6 |
| trace | idle | — | — | **2.9** (main 2.4, Timer 0.5) | AxioCEFProbe 3.0, Web Content 2.9 | — | — |
| trace | raf | 60.0 | 20.7 | **16.3** (main 6.2, DOM Worker 1.9, Renderer 1.6, WRRende~ckend# 1.3, SwComposite 1.3) | cef:renderer 6.8, AxioCEFProbe 3.8, cef:gpu-process 3.5, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **14.8** (main 4.3, Renderer 2.0, DOM Worker 2.0, Backgro~Pool # 1.3, WRRende~ckend# 1.0) | cef:renderer 6.3, cef:gpu-process 4.6, AxioCEFProbe 3.7 | — | — |
| trace | scroll | 60.0 | 20.9 | **29.7** (main 14.8, DOM Worker 4.9, Renderer 2.0, Backgro~Pool # 2.0, TaskCon~ller # 1.5) | cef:gpu-process 17.8, cef:renderer 7.4, AxioCEFProbe 5.9 | — | — |
| trace | key | — | — | **11.7** (main 6.6, Renderer 1.1, DOM Worker 1.1, Timer 0.8, TaskCon~ller # 0.6) | AxioCEFProbe 1.7, cef:renderer 1.4, cef:gpu-process 0.6, WebExtensions 0.3 | 11.0 | — |
| trace | switch-to-gecko | — | — | **1.3** (main 0.7, TaskCon~ller # 0.4, DOM Worker 0.1, Renderer 0.1) | Web Content 0.1, Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15015.1 |
| profile | switch-to-engine | — | — | **71.8** (main 35.9, Renderer 23.9, DOM Worker 6.0, SamplerThread 6.0) | Web Content 47.8, cef:renderer 23.9, AxioCEFProbe 17.9, cef:gpu-process 6.0 | — | 118.5 |
| profile | idle | — | — | **16.3** (SamplerThread 6.2, DOM Worker 5.3, main 3.8, Timer 1.0) | Web Content 5.7, Privileged Cont 1.4, AxioCEFProbe 1.0, Socket Process 1.0 | — | — |
| profile | raf | 60.0 | 21.1 | **36.5** (main 9.0, DOM Worker 8.7, SamplerThread 8.4, Renderer 2.3, Timer 1.3) | cef:renderer 7.8, Web Content 6.8, cef:gpu-process 4.5, AxioCEFProbe 4.4 | — | — |
| profile | raf-nosampler | — | — | **30.9** (DOM Worker 8.9, SamplerThread 7.6, main 5.6, Renderer 2.3, WRRende~ckend# 1.3) | cef:renderer 8.7, Web Content 7.3, cef:gpu-process 5.3, AxioCEFProbe 4.0 | — | — |
| profile | scroll | 60.1 | 22.1 | **55.8** (main 20.0, DOM Worker 12.7, SamplerThread 9.3, Renderer 2.4, Backgro~Pool # 1.9) | cef:gpu-process 19.5, cef:renderer 8.8, AxioCEFProbe 7.3, Web Content 6.3 | — | — |
| profile | key | — | — | **27.8** (main 9.1, SamplerThread 7.1, DOM Worker 6.6, Timer 1.4, Renderer 1.1) | Web Content 6.3, cef:renderer 1.9, AxioCEFProbe 1.7, WebExtensions 1.7 | 12.9 | — |
| profile | switch-to-gecko | — | — | **5.8** (SamplerThread 2.8, BgIOThr~Pool # 1.8, DOM Worker 0.4, main 0.3, IPC I/O Parent 0.1) | Web Content 7.0, Isolated Web Co 1.5, Socket Process 1.3, WebExtensions 1.3 | — | 15653.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.3 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 2.38 | 0.82 | — | — | — | — | — | 0.003 |
| trace | raf | 59.6 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.11 | 0.08 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.14 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 59.2 | 0.0 | 0 | 0.0 | — | — | 4.9 | 0.0 | — | 0.17 | 0.08 | — | — | — | — | — | 0.005 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.5 | 0.0 | — | 0.24 | 0.08 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 16.0 | 0.0 | 0 | 0.0 | — | — | 1.1 | 0.0 | — | 2.12 | 0.32 | — | — | — | — | — | 0.014 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.13 | 0.11 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.16 | 0.13 | — | — | — | — | — | 0.009 |
| profile | scroll | 59.4 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 0.21 | 0.12 | — | — | — | — | — | 0.008 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.6 | 0.0 | — | 0.31 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.859 | 1.448 | 0.0056 | 0.0094 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.047 | 0.081 | 0.0028 | 0.0049 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.071 | 0.100 | 0.0043 | 0.0060 |
| plain | scroll | memfd | native | 120 | 120 | 0.115 | 0.137 | 0.0067 | 0.0080 |
| plain | key | memfd | native | 21 | 21 | 0.013 | 0.053 | 0.0001 | 0.0003 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 1 | 1 | 1.452 | 1.783 | 0.0048 | 0.0059 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.045 | 0.084 | 0.0027 | 0.0050 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.064 | 0.097 | 0.0039 | 0.0058 |
| trace | scroll | memfd | native | 121 | 121 | 0.105 | 0.133 | 0.0062 | 0.0079 |
| trace | key | memfd | native | 21 | 21 | 0.013 | 0.044 | 0.0001 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 1.592 | 1.972 | 0.0255 | 0.0315 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 187 | 187 | 0.050 | 0.089 | 0.0030 | 0.0054 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.071 | 0.100 | 0.0043 | 0.0060 |
| profile | scroll | memfd | native | 122 | 122 | 0.122 | 0.152 | 0.0072 | 0.0089 |
| profile | key | memfd | native | 21 | 21 | 0.016 | 0.065 | 0.0001 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.7 | 0.0 | — | 0.24 | 0.42 | — | — | 8.3 | 7.6 | 17.4 |
| profile | 0.6 | 8.4 | 0.0 | — | 0.33 | 0.63 | — | — | 7.1 | 9.6 | 16.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 107.5; write create 108.8; first frame applied (native receiver) 264.9; write frame_ack 265.7; write focus 269.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 18.4; first stdout read resolved 23.3; write shutdown 27.1

Switch timeline (profile, switch-to-engine, ms after the window start): write create 29.6; first stdout read resolved 38.2; first frame applied (native receiver) 128.0; write frame_ack 130.0; write focus 140.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 25.5; first stdout read resolved 38.7; write shutdown 42.0

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 62, Renderer 26, DOM Worker 11, BgPool 7, WRRenderBackend 3, Compositor 3, WRSceneBuilder 2, SwComposite 2, IPC I/O 1, Socket 1, WRWorker 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 61 ms (32.9% of span): Idle 14, JavaScript 13, Other 12, Layout 10, DOM 7, Graphics 3
  - JS leaf 2 / native under JS 26 / native 33; buckets: ipc 61, paint_layout 24, gc_cc 19, poll_wait 15, array_buffer_copy 10, harness_diagnostics 6, worker_messaging 5, engine_stream_read 5
  - top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 12; `mozilla::ReflowInput::ReflowInput(nsPresContext*, mozilla::R` 3; `nsXULCommandDispatcher::Release() [libxul.so]` 3; `handleEvent (resource:///modules/zen/ZenWindowSync.sys.mjs:3` 2; `servo_arc::Arc<T>::drop_slow [libxul.so]` 2
  - WebRender/compositor threads: Renderer 26 ms (top self: `syscall [libc.so.6]` 9, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `SkPixmap::reset(SkImageInfo const&, void const*, u` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ARGBSetRow_X86 [libxul.so]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, js_ctypes 10, poll_wait 9, gc_cc 1; top self: `poll [libc.so.6]` 9; `__strlen_evex [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 0; `JSStructuredCloneData::AppendBytes(char const*, un` 0; `getcontext [libc.so.6]` 0
- **tab:3990** CPU ms by thread group: main 38, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 38 ms (28.3% of span): Other 29, JavaScript 3, Idle 2, Profiler 2, DOM 2
  - JS leaf 0 / native under JS 4 / native 34; buckets: ipc 27, array_buffer_copy 9, gc_cc 9, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1
  - top self: `js::frontend::FunctionBox::copyFunctionFields(js::frontend::` 3; `poll [libc.so.6]` 2; `[libexpat.so.1]` 2; `mozilla::StaticPrefs::InitStaticPrefsFromShared() [libxul.so` 2; `__memcmp_evex_movbe [libc.so.6]` 2; `__strlen_evex [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3799** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.4% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `mozilla::dom::BrowsingContext::TouchEventsOverride() const [` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3988** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - GC/CC markers: GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 76, DOM Worker 68, other 14, IPC I/O 1, Socket 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 76 ms (3.6% of span): Idle 64, JavaScript 4, Other 4, DOM 2, GC / CC 2, Profiler 0
  - JS leaf 0 / native under JS 6 / native 70; buckets: ipc 76, poll_wait 65, harness_diagnostics 5, gc_cc 5, array_buffer_copy 4, subprocess_pipe_io 0, worker_messaging 0, json_metadata 0
  - top self: `poll [libc.so.6]` 64; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[axiosozo-dev]` 1; `js::gc::BufferAllocator::updateFreeListsAfterAlloc(js::gc::B` 1; `mozilla::dom::FocusEvent_Binding::_finalize(JS::GCContext*, ` 1; `js::NewDenseCopiedArray(JSContext*, unsigned int, JS::Value ` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 68 ms: buckets subprocess_pipe_io 68, js_ctypes 68, worker_messaging 68, ipc 68, poll_wait 68; top self: `poll [libc.so.6]` 68
- **tab:3990** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3988** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3280** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 255, DOM Worker 203, Renderer 62, WRRenderBackend 37, SwComposite 33, BgPool 32, Compositor 29, other 23, ImageBridge 12, WRSceneBuilder 7, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 255 ms (8.2% of span): Idle 188, JavaScript 38, Other 18, DOM 7, Profiler 3, GC / CC 1
  - JS leaf 5 / native under JS 36 / native 214; buckets: ipc 255, poll_wait 200, gc_cc 43, engine_stream_read 23, worker_messaging 19, json_metadata 14, subprocess_pipe_io 10, array_buffer_copy 7
  - top self: `poll [libc.so.6]` 189; `[unknown]` 8; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `write [libc.so.6]` 3; `JS::GetExecutionGlobalFromJSMicroTask(JSObject*) [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 62 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `webrender::frame_builder::FrameBuilder::build [lib` 1, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 33 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 32 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 203 ms: buckets subprocess_pipe_io 203, worker_messaging 202, ipc 202, js_ctypes 193, poll_wait 190, gc_cc 3; top self: `poll [libc.so.6]` 190; `[axiosozo-dev]` 1; `js::NativeObject::addProperty(JSContext*, JS::Hand` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[unknown]` 1
- **tab:3799** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 4, poll_wait 3, gc_cc 3, memcpy_memset 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `nsINode::UnoptimizableCCNode() const [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::d` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3804** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 199, main 167, Renderer 62, WRRenderBackend 38, BgPool 37, SwComposite 33, Compositor 30, ImageBridge 12, WRSceneBuilder 7, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 167 ms (5.5% of span): Idle 104, JavaScript 35, Other 11, DOM 10, GC / CC 5, Profiler 2
  - JS leaf 10 / native under JS 34 / native 122; buckets: ipc 167, poll_wait 111, gc_cc 50, worker_messaging 29, engine_stream_read 23, json_metadata 15, subprocess_pipe_io 13, native_receiver 8
  - top self: `poll [libc.so.6]` 105; `[unknown]` 5; `recvmsg [libc.so.6]` 3; `[axiosozo-dev]` 2; `[linux-vdso.so.1]` 2; `XPC_WN_CallMethod(JSContext*, unsigned int, JS::Value*) [lib` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 62 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 50, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 2); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 33 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::compositor::sw_compositor::SwCompositeT` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 36, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `RefPtr<mozilla::ipc::MessageChannel::MessageTask> ` 0); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 199 ms: buckets subprocess_pipe_io 199, worker_messaging 199, ipc 199, js_ctypes 188, poll_wait 187, gc_cc 5; top self: `poll [libc.so.6]` 186; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `[axiosozo-dev]` 1; `mozilla::dom::Event::cycleCollection::Unlink(void*` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
- **tab:3799** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, gc_cc 2, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `__strnlen_evex [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3990** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 387, DOM Worker 208, Renderer 47, BgPool 38, WRRenderBackend 29, SwComposite 22, Compositor 22, other 16, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 387 ms (18.7% of span): Idle 219, JavaScript 75, Other 43, Graphics 16, DOM 15, Profiler 10
  - JS leaf 10 / native under JS 78 / native 299; buckets: ipc 387, poll_wait 276, gc_cc 77, worker_messaging 42, paint_layout 39, subprocess_pipe_io 23, engine_stream_read 22, array_buffer_copy 18
  - top self: `poll [libc.so.6]` 222; `[unknown]` 15; `write [libc.so.6]` 7; `recvmsg [libc.so.6]` 7; `mprotect [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 37, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `syscall [libc.so.6]` 3); WRRenderBackend#0 29 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 22 ms (top self: `syscall [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 34, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `mozilla::TaskController::AddTask(already_AddRefed<` 0); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `RefPtr<mozilla::ipc::MessageChannel::MessageTask> ` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #4 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 208 ms: buckets subprocess_pipe_io 208, worker_messaging 208, ipc 208, js_ctypes 178, poll_wait 172, gc_cc 8; top self: `poll [libc.so.6]` 172; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[axiosozo-dev]` 3; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 2
- **tab:3319** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.2% of span): Idle 2, DOM 1, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 3, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `[unknown]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Ti` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3804** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 305, DOM Worker 171, Renderer 45, other 26, SwComposite 15, WRRenderBackend 12, Compositor 12, WRWorker 10, WRSceneBuilder 8, BgPool 2, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 305 ms (8.3% of span): Idle 134, JavaScript 56, Layout 35, Other 30, Graphics 22, DOM 19
  - JS leaf 15 / native under JS 98 / native 193; buckets: ipc 305, poll_wait 168, gc_cc 71, paint_layout 67, worker_messaging 47, engine_stream_read 29, subprocess_pipe_io 21, array_buffer_copy 16
  - top self: `poll [libc.so.6]` 136; `[unknown]` 8; `[axiosozo-dev]` 7; `write [libc.so.6]` 4; `recvmsg [libc.so.6]` 3; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<n` 3
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 45 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 3); SwComposite 15 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `mozilla::ThreadEventQueue::PutEventInternal(RefPtr` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #4 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 171 ms: buckets subprocess_pipe_io 171, worker_messaging 171, ipc 171, js_ctypes 158, poll_wait 156, gc_cc 6; top self: `poll [libc.so.6]` 156; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `__lll_lock_wait [libc.so.6]` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:3234** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, GC / CC 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 0; `JSAutoStructuredCloneBuffer::clear() [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3804** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3319** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 276, DOM Worker 55, main 51, Renderer 13, IPC I/O 5, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, other 1, SwComposite 1, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 51 ms (0.3% of span): Idle 15, Layout 14, JavaScript 10, Other 4, Graphics 3, Profiler 3
  - JS leaf 1 / native under JS 22 / native 28; buckets: ipc 51, paint_layout 20, poll_wait 15, harness_diagnostics 8, gc_cc 8, array_buffer_copy 7, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 14; `[axiosozo-dev]` 3; `core::ptr::drop_in_place<style::values::generics::length::Ge` 2; `madvise [libc.so.6]` 2; `nsRegion::Sub(nsRegion const&, nsRegion const&) [libxul.so]` 2; `core::ptr::drop_in_place<style::values::generics::image::Gen` 2
  - GC/CC markers: GCMinor 3× 1 ms
  - WebRender/compositor threads: Renderer 13 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `__sincosf_fma [libm.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 275 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 257, `write [libc.so.6]` 6, `unlink [libc.so.6]` 5); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 55 ms: buckets subprocess_pipe_io 55, worker_messaging 55, ipc 55, gc_cc 47, poll_wait 8, js_ctypes 6; top self: `poll [libc.so.6]` 6; `madvise [libc.so.6]` 5; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4; `mozilla::ProfileChunkedBuffer::ResetChunkManager(m` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >` 3
- **tab:3280** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3799** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, DOM 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `PLDHashTable::MakeEntryHandle(void const*, std::nothrow_t co` 0; `mozilla::ReflowInput::InitResizeFlags(nsPresContext*, mozill` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3301** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **124.2** (main 41.4, Renderer 41.4, DOM Worker 27.6, Backgro~Pool # 4.6, WRRende~ckend# 4.6) | AxioCEFProbe 36.8, cef:renderer 23.0, cef:utility 4.6, cef:gpu-process 4.6 | — | 161.3 |
| plain | idle | — | — | **6.3** (main 4.8, Timer 0.5, Socket Thread 0.5, IndexedDB IO # 0.5) | Web Content 3.4, AxioCEFProbe 2.5 | — | — |
| plain | raf | 60.0 | 22.3 | **29.5** (main 9.7, Renderer 4.2, Backgro~Pool # 3.2, SwComposite 3.2, DOM Worker 3.2) | cef:gpu-process 16.1, cef:renderer 11.9, AxioCEFProbe 9.0 | — | — |
| plain | raf-nosampler | — | — | **40.3** (main 10.6, Renderer 4.6, SwComposite 3.6, Backgro~Pool # 3.3, DOM Worker 3.3) | cef:gpu-process 17.2, cef:renderer 12.0, AxioCEFProbe 8.3, RDD Process 0.3 | — | — |
| plain | scroll | 60.0 | 23.0 | **48.3** (main 20.4, DOM Worker 8.3, Backgro~Pool # 5.8, Renderer 5.4, SwComposite 3.4) | cef:gpu-process 61.3, cef:renderer 14.6, AxioCEFProbe 14.1 | — | — |
| plain | key | — | — | **25.6** (main 11.5, DOM Worker 4.1, Renderer 3.0, TaskCon~ller # 1.6, SwComposite 1.1) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8 | 13.5 | — |
| plain | switch-to-gecko | — | — | **163.2** (IndexedDB IO # 39.4, main 33.8, DOM Worker 22.5, IPDL Background 16.9, Renderer 16.9) | Isolated Web Co 5.6 | — | 142.3 |
| trace | switch-to-engine | — | — | **162.7** (Renderer 69.1, main 39.5, DOM Worker 9.9, StreamTrans # 9.9, glean.dispatche 4.9) | AxioCEFProbe 44.3, cef:renderer 19.7, cef:utility 14.8, cef:gpu-process 4.9 | — | 152.5 |
| trace | idle | — | — | **6.2** (main 4.3, Timer 1.4, Socket Thread 0.5) | Web Content 3.4, AxioCEFProbe 3.4, cef:zygote 0.5 | — | — |
| trace | raf | 60.0 | 26.5 | **31.2** (main 10.3, Renderer 4.5, SwComposite 3.6, DOM Worker 3.2, Backgro~Pool # 2.9) | cef:gpu-process 17.5, cef:renderer 12.3, AxioCEFProbe 8.7, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **27.9** (main 7.3, Renderer 4.6, SwComposite 3.6, DOM Worker 3.6, Backgro~Pool # 3.6) | cef:gpu-process 17.9, cef:renderer 12.3, AxioCEFProbe 9.9 | — | — |
| trace | scroll | 60.2 | 22.4 | **49.2** (main 20.4, DOM Worker 7.8, Backgro~Pool # 5.8, Renderer 4.8, SwComposite 3.4) | cef:gpu-process 62.1, cef:renderer 14.6, AxioCEFProbe 11.7 | — | — |
| trace | key | — | — | **20.3** (main 10.4, Renderer 2.7, TaskCon~ller # 1.9, SwComposite 1.4, Timer 1.1) | cef:renderer 3.0, AxioCEFProbe 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 12.8 | — |
| trace | switch-to-gecko | — | — | **55.8** (main 24.8, Renderer 24.8, BgIOThr~Pool # 6.2) |  | — | 132.9 |
| profile | switch-to-engine | — | — | **119.7** (Renderer 43.8, main 39.9, WRRende~ckend# 8.0, Backgro~Pool # 8.0, DOM Worker 8.0) | Web Content 35.9, AxioCEFProbe 27.9, cef:renderer 23.9, cef:gpu-process 4.0 | — | 179.8 |
| profile | idle | — | — | **23.9** (SamplerThread 8.6, DOM Worker 7.2, main 6.7, Timer 1.4) | Web Content 9.6, AxioCEFProbe 4.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 60.0 | 21.0 | **55.4** (main 12.5, SamplerThread 11.9, DOM Worker 11.6, Renderer 5.1, Backgro~Pool # 3.5) | cef:gpu-process 18.4, cef:renderer 12.8, Web Content 9.3, AxioCEFProbe 9.3 | — | — |
| profile | raf-nosampler | — | — | **51.0** (DOM Worker 11.6, SamplerThread 10.9, main 7.9, Renderer 5.3, Backgro~Pool # 4.0) | cef:gpu-process 18.9, cef:renderer 13.2, Web Content 9.9, AxioCEFProbe 8.6 | — | — |
| profile | scroll | 60.0 | 21.4 | **77.7** (main 27.8, DOM Worker 16.3, SamplerThread 12.0, Backgro~Pool # 6.7, Renderer 4.8) | cef:gpu-process 66.3, cef:renderer 15.3, AxioCEFProbe 14.4, Web Content 10.1 | — | — |
| profile | key | — | — | **42.6** (main 12.8, SamplerThread 10.4, DOM Worker 9.3, Renderer 3.5, Timer 1.4) | Web Content 9.3, AxioCEFProbe 3.0, cef:renderer 2.5, WebExtensions 1.9 | 16.6 | — |
| profile | switch-to-gecko | — | — | **5.5** (SamplerThread 3.9, main 0.5, DOM Worker 0.4, Renderer 0.3, glean.dispatche 0.1) | Web Content 9.0, Privileged Cont 2.3, Isolated Web Co 2.1, WebExtensions 1.7 | — | 15025.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 8.2 | 0.0 | 0 | 0.0 | — | — | 18.8 | 0.0 | — | 5.34 | 1.94 | — | — | — | — | — | 0.016 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.32 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.32 | 0.12 | — | — | — | — | — | 0.009 |
| trace | scroll | 59.0 | 0.0 | 0 | 0.0 | — | — | 11.5 | 0.0 | — | 0.53 | 0.13 | — | — | — | — | — | 0.009 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.8 | 0.0 | — | 0.23 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 10.3 | 0.0 | 0 | 0.0 | — | — | 3.0 | 0.0 | — | 1.85 | 0.39 | — | — | — | — | — | 0.010 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.37 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.37 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.4 | 0.0 | 0 | 0.0 | — | — | 11.7 | 0.0 | — | 0.66 | 0.18 | — | — | — | — | — | 0.013 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.4 | 0.0 | — | 0.59 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 3 | 1.681 | 3.093 | 0.0209 | 0.0384 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.205 | 0.263 | 0.0123 | 0.0158 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.225 | 0.278 | 0.0135 | 0.0167 |
| plain | scroll | memfd | native | 121 | 121 | 0.473 | 0.533 | 0.0275 | 0.0311 |
| plain | key | memfd | native | 21 | 21 | 0.047 | 0.137 | 0.0003 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 4.732 | 2.156 | 0.0390 | 0.0178 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 187 | 187 | 0.214 | 0.274 | 0.0128 | 0.0164 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.221 | 0.267 | 0.0132 | 0.0160 |
| trace | scroll | memfd | native | 123 | 123 | 0.458 | 0.520 | 0.0270 | 0.0307 |
| trace | key | memfd | native | 21 | 21 | 0.041 | 0.133 | 0.0002 | 0.0008 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 2.297 | 3.419 | 0.0237 | 0.0353 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.231 | 0.305 | 0.0139 | 0.0184 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.236 | 0.307 | 0.0141 | 0.0184 |
| profile | scroll | memfd | native | 123 | 123 | 0.532 | 0.601 | 0.0311 | 0.0351 |
| profile | key | memfd | native | 21 | 21 | 0.046 | 0.211 | 0.0003 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 8.3 | 0.0 | — | 0.23 | 0.41 | — | — | 10.1 | 9.3 | 19.3 |
| profile | 0.8 | 11.4 | 0.0 | — | 0.51 | 0.88 | — | — | 9.7 | 13.6 | 23.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 51.3; first stdout read resolved 52.9; first frame applied (native receiver) 186.1; write frame_ack 189.8; write focus 196.1

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 24.4; first stdout read resolved 31.7; write shutdown 34.8

Switch timeline (profile, switch-to-engine, ms after the window start): write create 57.6; first stdout read resolved 74.1; first frame applied (native receiver) 203.9; write frame_ack 206.1; write focus 219.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 31.9; first stdout read resolved 44.8; write shutdown 47.3

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 97, Renderer 94, DOM Worker 15, BgPool 10, SwComposite 9, WRRenderBackend 5, Compositor 4, WRSceneBuilder 3, IPC I/O 3, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 97 ms (33.7% of span): JavaScript 23, Layout 21, DOM 19, GC / CC 10, Graphics 9, Idle 8
  - JS leaf 5 / native under JS 44 / native 48; buckets: ipc 97, gc_cc 44, paint_layout 34, array_buffer_copy 15, harness_diagnostics 14, poll_wait 11, worker_messaging 10, engine_stream_read 8
  - top self: `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 10; `[axiosozo-dev]` 10; `poll [libc.so.6]` 8; `mozilla::dom::Element_Binding::setAttribute(JSContext*, JS::` 5; `mozilla::dom::PerformanceMainThread::CreationTimeStamp() con` 5; `__memmove_avx_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 9 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 95 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 25, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 21, `hypotf@@GLIBC_2.35 [libm.so.6]` 12); SwComposite 9 ms (top self: `syscall [libc.so.6]` 9); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `webrender::resource_cache::ResourceCache::discard_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 10 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 6, `__memset_avx2_unaligned_erms [libc.so.6]` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, js_ctypes 15, worker_messaging 15, ipc 15, poll_wait 15, gc_cc 0; top self: `poll [libc.so.6]` 15; `js::NativeObject::create(JSContext*, js::gc::Alloc` 0
- **tab:4217** CPU ms by thread group: main 52, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 52 ms (19.9% of span): Other 36, JavaScript 6, Profiler 5, DOM 3, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 47; buckets: ipc 44, array_buffer_copy 15, gc_cc 13, subprocess_pipe_io 3, poll_wait 1
  - top self: `sendmsg [libc.so.6]` 6; `__lll_lock_wake [libc.so.6]` 5; `[]` 4; `[libfontconfig.so.1]` 4; `GetExistingDataProperty(JSContext*, JS::Handle<js::NativeObj` 3; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4222** CPU ms by thread group: main 48, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (16.9% of span): Other 40, Profiler 4, DOM 2, JavaScript 2, GC / CC 0, Idle 0
  - JS leaf 1 / native under JS 2 / native 45; buckets: ipc 37, array_buffer_copy 17, gc_cc 11, subprocess_pipe_io 5, poll_wait 1, memcpy_memset 1
  - top self: `__strlen_avx2 [libc.so.6]` 4; `[libexpat.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `__read_nocancel [libc.so.6]` 3; `[libgcc_s.so.1]` 2
  - GC/CC markers: GCMinor 1× 6 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4030** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.0% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsINode::GetRelevantGlobal() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 119, DOM Worker 97, other 19, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 119 ms (5.6% of span): Idle 98, Other 8, JavaScript 8, GC / CC 2, DOM 1, Profiler 1
  - JS leaf 0 / native under JS 10 / native 109; buckets: ipc 119, poll_wait 104, harness_diagnostics 9, gc_cc 5, array_buffer_copy 5, json_metadata 1, worker_messaging 0, native_receiver 0
  - top self: `poll [libc.so.6]` 99; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1; `mozilla::dom::AddEventListenerOptions::Init(mozilla::dom::Bi` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 90 ms: buckets subprocess_pipe_io 90, worker_messaging 90, ipc 90, js_ctypes 89, poll_wait 89, gc_cc 1; top self: `poll [libc.so.6]` 89; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3508** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ipc::PortLink::SendMessage(std::unique_ptr<IPC::Mes` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4035** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, paint_layout 0
  - top self: `poll [libc.so.6]` 0; `nsRefreshDriver::GetIdleDeadlineHint(mozilla::TimeStamp, nsR` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 360, DOM Worker 268, Renderer 150, SwComposite 107, BgPool 106, WRRenderBackend 54, Compositor 40, other 30, ImageBridge 17, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 360 ms (11.5% of span): Idle 235, JavaScript 65, Other 44, DOM 12, Profiler 3, GC / CC 2
  - JS leaf 8 / native under JS 68 / native 285; buckets: ipc 360, poll_wait 256, gc_cc 62, worker_messaging 31, engine_stream_read 30, json_metadata 15, harness_diagnostics 14, subprocess_pipe_io 13
  - top self: `poll [libc.so.6]` 239; `[unknown]` 11; `recvmsg [libc.so.6]` 9; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 3; `write [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 150 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `__memmove_avx_unaligned_erms [libc.so.6]` 31, `syscall [libc.so.6]` 7); SwComposite 107 ms (top self: `syscall [libc.so.6]` 91, `__memmove_avx_unaligned_erms [libc.so.6]` 15, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 106 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 89, `__memmove_avx_unaligned_erms [libc.so.6]` 15, `[linux-vdso.so.1]` 1); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `mozilla::ipc::MessageChannel::MessageTask::~Messag` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 250, poll_wait 244, gc_cc 9; top self: `poll [libc.so.6]` 244; `[unknown]` 3; `mozilla::CycleCollectedJSRuntime::JSObjectsTenured` 2; `[axiosozo-dev]` 2; `write [libc.so.6]` 1
- **tab:3547** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 11 ms (0.4% of span): GC / CC 8, Idle 3, Profiler 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 10, gc_cc 8, poll_wait 4, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `CheckParticipatesInCycleCollection(JS::GCCellPtr, char const` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onShapeE` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1
  - GC/CC markers: GCMajor 1× 26 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3455** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 8, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 9, gc_cc 8, poll_wait 3
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 6; `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `[]` 0
  - GC/CC markers: GCMajor 1× 26 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::TypedRootedTraceableBase<js::PersistentRootedTraceableBa` 0; `__lll_lock_wait [libc.so.6]` 0; `nsTHashtable<nsBaseHashtableET<nsGenericHashKey<mojo::core::` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 263, main 225, Renderer 149, SwComposite 106, BgPool 106, WRRenderBackend 53, Compositor 42, ImageBridge 18, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 225 ms (7.4% of span): Idle 128, JavaScript 57, Other 21, DOM 16, Profiler 2, GC / CC 0
  - JS leaf 8 / native under JS 60 / native 157; buckets: ipc 225, poll_wait 140, gc_cc 72, worker_messaging 36, engine_stream_read 35, json_metadata 18, native_receiver 13, subprocess_pipe_io 11
  - top self: `poll [libc.so.6]` 130; `[unknown]` 12; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2
  - WebRender/compositor threads: Renderer 149 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 95, `__memmove_avx_unaligned_erms [libc.so.6]` 35, `syscall [libc.so.6]` 7); SwComposite 106 ms (top self: `syscall [libc.so.6]` 90, `__memmove_avx_unaligned_erms [libc.so.6]` 13, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 46, `webrender::picture::PictureInstance::take_context ` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 104 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `axio::SinkState::CopyRect(unsigned char*, unsigned` 1); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `[axiosozo-dev]` 0, `mozilla::detail::MutexImpl::unlock() [axiosozo-dev` 0); BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `sendfile64 [libc.so.6]` 0)
  - busiest DOM Worker 263 ms: buckets subprocess_pipe_io 263, worker_messaging 263, ipc 263, js_ctypes 243, poll_wait 239, gc_cc 11; top self: `poll [libc.so.6]` 238; `xpc::NativeGlobal(JSObject*) [libxul.so]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `[axiosozo-dev]` 2; `[unknown]` 1
- **tab:4035** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 533, DOM Worker 283, BgPool 135, Renderer 95, SwComposite 60, WRRenderBackend 35, Compositor 28, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 533 ms (25.3% of span): Idle 280, JavaScript 110, Other 67, DOM 30, Graphics 26, Layout 12
  - JS leaf 11 / native under JS 127 / native 396; buckets: ipc 533, poll_wait 368, gc_cc 115, paint_layout 67, worker_messaging 50, engine_stream_read 31, array_buffer_copy 29, harness_diagnostics 25
  - top self: `poll [libc.so.6]` 284; `[unknown]` 17; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 10; `[axiosozo-dev]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 6
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 95 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 64, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `syscall [libc.so.6]` 10); SwComposite 60 ms (top self: `syscall [libc.so.6]` 57, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 135 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `__memmove_avx_unaligned_erms [libc.so.6]` 40, `[linux-vdso.so.1]` 1); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 283 ms: buckets subprocess_pipe_io 283, worker_messaging 283, ipc 283, js_ctypes 258, poll_wait 251, gc_cc 7; top self: `poll [libc.so.6]` 251; `[axiosozo-dev]` 4; `[linux-vdso.so.1]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2; `getcontext [libc.so.6]` 1
- **tab:4035** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4217** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3547** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 430, DOM Worker 232, Renderer 123, SwComposite 52, other 36, WRRenderBackend 19, Compositor 17, WRWorker 13, WRSceneBuilder 9, BgPool 6, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 430 ms (11.6% of span): Idle 191, JavaScript 93, Layout 49, Other 35, Graphics 27, DOM 22
  - JS leaf 15 / native under JS 145 / native 270; buckets: ipc 430, poll_wait 233, gc_cc 100, paint_layout 89, worker_messaging 73, engine_stream_read 46, array_buffer_copy 19, harness_diagnostics 18
  - top self: `poll [libc.so.6]` 195; `[unknown]` 18; `recvmsg [libc.so.6]` 6; `[axiosozo-dev]` 6; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 5; `write [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 123 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 37, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `hypotf@@GLIBC_2.35 [libm.so.6]` 14); SwComposite 52 ms (top self: `syscall [libc.so.6]` 28, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `void scale_blit<false>(Texture&, IntRect const&, T` 3); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 16, `core::hash::BuildHasher::hash_one [libxul.so]` 0, `webrender::render_task_graph::RenderTaskGraphBuild` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 232 ms: buckets subprocess_pipe_io 232, worker_messaging 232, ipc 232, js_ctypes 219, poll_wait 212, gc_cc 9; top self: `poll [libc.so.6]` 212; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3455** CPU ms by thread group: main 8, IPC I/O 2, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 6, DOM 1, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 1 / native 7; buckets: ipc 8, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, un` 0; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3547** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 365, main 65, DOM Worker 62, Renderer 58, IPC I/O 6, SwComposite 4, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, other 2, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (0.4% of span): Idle 20, JavaScript 15, Layout 9, DOM 7, Other 6, Profiler 4
  - JS leaf 1 / native under JS 29 / native 35; buckets: ipc 64, poll_wait 21, gc_cc 16, paint_layout 16, array_buffer_copy 13, harness_diagnostics 9, memcpy_memset 4, worker_messaging 4
  - top self: `poll [libc.so.6]` 21; `[unknown]` 3; `nsContainerFrame::ReflowChild(nsIFrame*, nsPresContext*, moz` 2; `[axiosozo-dev]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::ObjectFuse::tryOptimizeConstantProperty(JS::PropertyKey,` 2
  - GC/CC markers: CCSlice 1× 5 ms, GCMinor 3× 1 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 21, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 13, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 10); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `webrender::image_source::resolve_image [libxul.so]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 365 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 335, `write [libc.so.6]` 11, `unlink [libc.so.6]` 7); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #5 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 62 ms: buckets subprocess_pipe_io 62, worker_messaging 62, ipc 62, gc_cc 52, poll_wait 9, js_ctypes 8; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 7; `std::unique_ptr<mozilla::ProfileBufferChunk, std::` 6; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:3547** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 4, JavaScript 2, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: ipc 7, poll_wait 5, gc_cc 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::DefineAccessorProperty(JSContext*, JS::Handle<JSObject*>` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 0; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifI` 0; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `PR_GetCurrentThread [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4030** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Graphics 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 0; `nsLayoutUtils::GetCumulativeApzCallbackTransform(nsIFrame*) ` 0; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `Pickle::ReadBytesInto(PickleIterator*, void*, unsigned int) ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

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

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **68.0** (DOM Worker 24.0, main 20.0, Renderer 8.0, glean.dispatche 4.0, WRScene~ilder# 4.0) | WPEWebProcess 76.1, WPENetworkProce 12.0, AxioWebKitHost 8.0 | — | 214.0 |
| plain | idle | — | — | **8.8** (main 6.8, Timer 1.0, IPC I/O Parent 0.5, DOM Worker 0.5) | Web Content 3.9, AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 24.4 | **23.9** (main 10.7, DOM Worker 2.9, Renderer 2.3, WRRende~ckend# 1.6, SwComposite 1.6) | WPEWebProcess 64.1, AxioWebKitHost 7.1, Web Content 0.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.5** (main 5.3, DOM Worker 3.0, Renderer 2.7, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 64.2, AxioWebKitHost 8.7 | — | — |
| plain | scroll | 56.7 | 33.9 | **40.8** (main 21.8, DOM Worker 6.8, Renderer 2.4, Backgro~Pool # 2.4, WRRende~ckend# 1.9) | WPEWebProcess 67.3, AxioWebKitHost 9.8 | — | — |
| plain | key | — | — | **17.9** (main 11.5, Renderer 1.4, DOM Worker 1.4, Timer 0.8, TaskCon~ller # 0.5) | WPEWebProcess 7.5, AxioWebKitHost 1.4, WebExtensions 0.3 | 17.9 | — |
| plain | switch-to-gecko | — | — | **16.1** (main 12.1, Renderer 4.0) | Isolated Web Co 4.0 | — | 214.7 |
| trace | switch-to-engine | — | — | **41.7** (main 14.8, Renderer 11.9, WRScene~ilder# 3.0, WRRende~ckend# 3.0, Backgro~Pool # 3.0) | WPEWebProcess 59.3, WPENetworkProce 8.9, AxioWebKitHost 3.0 | — | 312.7 |
| trace | idle | — | — | **11.6** (main 8.2, TaskCon~ller # 1.4, Timer 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 2.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.8 | 23.5 | **31.3** (main 15.2, DOM Worker 3.9, TaskCon~ller # 2.6, Renderer 2.3, WRRende~ckend# 1.6) | WPEWebProcess 65.2, AxioWebKitHost 8.0, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **20.2** (main 5.3, DOM Worker 4.6, Renderer 2.7, WRRende~ckend# 1.3, SwComposite 1.3) | WPEWebProcess 65.6, AxioWebKitHost 7.7 | — | — |
| trace | scroll | 57.5 | 33.2 | **44.8** (main 23.3, DOM Worker 6.8, Renderer 2.9, Backgro~Pool # 2.9, TaskCon~ller # 2.4) | WPEWebProcess 67.0, AxioWebKitHost 10.7 | — | — |
| trace | key | — | — | **17.8** (main 11.8, Renderer 1.4, DOM Worker 1.4, TaskCon~ller # 0.8, Timer 0.5) | WPEWebProcess 7.1, AxioWebKitHost 1.7 | 19.3 | — |
| trace | switch-to-gecko | — | — | **28.0** (main 12.0, IPDL Background 4.0, BgIOThr~Pool # 4.0, Renderer 4.0, Compositor 4.0) | Isolated Web Co 8.0, WebExtensions 4.0 | — | 214.7 |
| profile | switch-to-engine | — | — | **42.5** (main 14.2, DOM Worker 14.2, SamplerThread 8.5, IPC I/O Parent 2.8, Backgro~Pool # 2.8) | WPEWebProcess 71.0, Web Content 68.1, WPENetworkProce 8.5, AxioWebKitHost 2.8 | — | 312.6 |
| profile | idle | — | — | **27.2** (SamplerThread 8.6, main 8.1, DOM Worker 7.6, Timer 1.4, TaskCon~ller # 1.0) | Web Content 9.6, WebExtensions 1.9, Isolated Web Co 1.9, RDD Process 1.4 | — | — |
| profile | raf | 58.0 | 26.5 | **52.6** (main 16.4, DOM Worker 11.2, SamplerThread 10.9, Renderer 2.9, WRRende~ckend# 1.9) | WPEWebProcess 65.8, Web Content 9.0, AxioWebKitHost 8.0, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **39.4** (DOM Worker 11.3, SamplerThread 9.3, main 7.6, Renderer 2.6, WRRende~ckend# 2.0) | WPEWebProcess 66.6, Web Content 8.9, AxioWebKitHost 7.9, WebExtensions 1.7 | — | — |
| profile | scroll | 56.8 | 34.6 | **71.3** (main 28.3, DOM Worker 14.8, SamplerThread 10.5, Renderer 2.9, Backgro~Pool # 2.4) | WPEWebProcess 69.5, AxioWebKitHost 10.6, Web Content 7.7, WebExtensions 1.9 | — | — |
| profile | key | — | — | **46.5** (main 17.7, DOM Worker 9.8, SamplerThread 9.8, Timer 1.9, TaskCon~ller # 1.9) | Web Content 9.8, WPEWebProcess 7.7, WebExtensions 2.5, Privileged Cont 2.2 | 20.9 | — |
| profile | switch-to-gecko | — | — | **39.2** (main 15.8, Socket Thread 3.9, BgIOThr~Pool # 3.9, Renderer 3.9, WRScene~ilder# 3.9) | Isolated Web Co 7.9 | — | 221.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 71.2 | 0.0 | — | 1.55 | 0.46 | — | — | — | — | — | 0.003 |
| trace | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.13 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 58.0 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.14 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 56.3 | 0.0 | 0 | 0.0 | — | — | 9.7 | 0.0 | — | 0.33 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.3 | 0.0 | — | 0.11 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.3 | 0.0 | 0 | 0.0 | — | — | 92.3 | 0.0 | — | 1.48 | 0.67 | — | — | — | — | — | 0.004 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.15 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.17 | 0.18 | — | — | — | — | — | 0.012 |
| profile | scroll | 55.5 | 0.0 | 0 | 0.0 | — | — | 9.0 | 0.0 | — | 0.37 | 0.16 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.11 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.908 | 1.862 | 0.0067 | 0.0138 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.044 | 0.076 | 0.0026 | 0.0044 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.065 | 0.102 | 0.0038 | 0.0059 |
| plain | scroll | memfd | native | 115 | 115 | 0.212 | 0.230 | 0.0117 | 0.0127 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.077 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.874 | 1.764 | 0.0048 | 0.0097 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.047 | 0.079 | 0.0027 | 0.0046 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.054 | 0.091 | 0.0031 | 0.0053 |
| trace | scroll | memfd | native | 117 | 117 | 0.231 | 0.241 | 0.0130 | 0.0136 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.081 | 0.0000 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.124 | 1.987 | 0.0060 | 0.0105 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 183 | 182 | 0.048 | 0.103 | 0.0028 | 0.0060 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.066 | 0.107 | 0.0038 | 0.0062 |
| profile | scroll | memfd | native | 117 | 117 | 0.234 | 0.273 | 0.0130 | 0.0151 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.079 | 0.0000 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 15.4 | 0.0 | — | 0.11 | 0.32 | — | — | 13.0 | 16.4 | 31.1 |
| profile | 0.7 | 17.3 | 0.0 | — | 0.11 | 0.43 | — | — | 9.5 | 18.2 | 27.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 31.1; first stdout read resolved 34.7; first frame applied (native receiver) 336.3; write frame_ack 337.1; write visibility 341.0; write focus 341.2

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 18.4; first stdout read resolved 24.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.5; first stdout read resolved 37.7; first frame applied (native receiver) 331.0; write frame_ack 332.0; write visibility 339.8; write focus 340.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 30.6; first stdout read resolved 39.6

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 49, DOM Worker 31, Renderer 17, BgPool 6, Compositor 4, IPC I/O 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 49 ms (13.1% of span): JavaScript 20, Idle 10, Layout 6, Other 5, DOM 3, Graphics 3
  - JS leaf 0 / native under JS 28 / native 21; buckets: ipc 49, gc_cc 19, poll_wait 14, array_buffer_copy 13, harness_diagnostics 11, paint_layout 11, engine_stream_read 5, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 16; `u_charType_78 [libxul.so]` 3; `nsIFrame::IsHiddenByContentVisibilityOfInFlowParentForLayout` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `[unknown]` 1; `__lll_lock_wait [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 6, `ClearTexSubImage [libxul.so]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets subprocess_pipe_io 31, worker_messaging 31, ipc 31, js_ctypes 29, poll_wait 29, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 29; `void* js::gc::CellAllocator::AllocTenuredCellForNu` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozi` 1; `__lll_lock_wait [libc.so.6]` 0
- **tab:7879** CPU ms by thread group: main 64, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 64 ms (22.3% of span): Other 51, DOM 5, JavaScript 4, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 1 / native under JS 7 / native 56; buckets: ipc 49, array_buffer_copy 20, gc_cc 15, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 1, json_metadata 1
  - top self: `[]` 9; `__strlen_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[libexpat.so.1]` 3; `qcms::transform_util::compute_precache [libxul.so]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7885** CPU ms by thread group: main 51, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 51 ms (17.5% of span): Other 40, JavaScript 6, Profiler 2, DOM 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 45; buckets: ipc 38, array_buffer_copy 15, gc_cc 11, subprocess_pipe_io 4, memcpy_memset 2, poll_wait 2, canvas_2d 1, json_metadata 1
  - top self: `[libexpat.so.1]` 6; `[]` 4; `char* mozilla::detail::DuplicateString<char, 4096ul, 1ul>(ch` 3; `mmap64 [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `JS::SetAVXEnabled(bool) [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7739** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `<core::str::lossy::Utf8Chunks as core::iter::traits::iterato` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 158, DOM Worker 111, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 158 ms (7.5% of span): Idle 127, JavaScript 15, Other 10, DOM 4, Profiler 2, GC / CC 0
  - JS leaf 2 / native under JS 15 / native 141; buckets: ipc 158, poll_wait 132, harness_diagnostics 16, gc_cc 8, array_buffer_copy 6, engine_stream_read 2, memcpy_memset 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 130; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 2; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `validLinuxRoot (chrome://browser/content/axiosozo/WebKitEngi` 1; `mprotect [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 111 ms: buckets subprocess_pipe_io 111, worker_messaging 111, ipc 111, js_ctypes 111, poll_wait 111, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 111
- **tab:7739** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7337** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 475, DOM Worker 267, Renderer 84, WRRenderBackend 47, SwComposite 42, Compositor 39, BgPool 33, other 31, ImageBridge 17, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 475 ms (15.1% of span): Idle 276, JavaScript 98, Other 40, GC / CC 32, DOM 24, Profiler 6
  - JS leaf 12 / native under JS 105 / native 358; buckets: ipc 471, poll_wait 292, gc_cc 123, engine_stream_read 63, worker_messaging 40, harness_diagnostics 37, subprocess_pipe_io 25, native_receiver 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 290; `[unknown]` 23; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `[linux-vdso.so.1]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4
  - GC/CC markers: GCMajor 1× 1047 ms, GCSlice 8× 29 ms, CCSlice 3× 7 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 84 ms (top self: `__syscall_cancel_arch [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `syscall [libc.so.6]` 4); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 2, `webrender::space::SpaceSnapper::snap_rect_rounded ` 0); SwComposite 42 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 33 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `__lll_lock_wait [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 267 ms: buckets subprocess_pipe_io 267, worker_messaging 267, ipc 267, js_ctypes 246, poll_wait 238, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 242; `[unknown]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:7739** CPU ms by thread group: main 6, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 3, GC / CC 2, Profiler 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 4, poll_wait 4, gc_cc 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `__lll_lock_wake [libc.so.6]` 0; `__internal_syscall_cancel [libc.so.6]` 0; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<1u> >::onShap` 0; `prctl [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7745** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 273, main 213, Renderer 83, WRRenderBackend 48, SwComposite 43, Compositor 40, BgPool 39, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 213 ms (7.0% of span): Idle 104, JavaScript 67, DOM 21, Other 16, Profiler 3, GC / CC 2
  - JS leaf 7 / native under JS 82 / native 125; buckets: ipc 212, poll_wait 113, gc_cc 83, engine_stream_read 67, worker_messaging 38, subprocess_pipe_io 20, native_receiver 14, array_buffer_copy 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 113; `[unknown]` 15; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 83 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `syscall [libc.so.6]` 4); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 0); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__syscall_cancel_arch [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `pthread_mutex_destroy@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `nsTArrayInfallibleAllocator::ResultTypeProxy nsTAr` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `access [libc.so.6]` 1)
  - busiest DOM Worker 261 ms: buckets subprocess_pipe_io 261, worker_messaging 261, ipc 261, js_ctypes 238, poll_wait 233, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 234; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 3; `[unknown]` 2; `mozilla::dom::StructuredCloneHolder::MaybeClearTra` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:7337** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 547, DOM Worker 255, BgPool 61, Renderer 56, WRRenderBackend 35, Compositor 27, SwComposite 24, other 20, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 547 ms (26.0% of span): Idle 289, JavaScript 113, Other 62, DOM 28, Graphics 21, GC / CC 16
  - JS leaf 13 / native under JS 119 / native 415; buckets: ipc 544, poll_wait 365, gc_cc 104, engine_stream_read 63, paint_layout 56, worker_messaging 48, harness_diagnostics 44, array_buffer_copy 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 316; `[unknown]` 21; `[axiosozo-dev]` 9; `mprotect [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `nsOuterWindowProxy::get(JSContext*, JS::Handle<JSObject*>, J` 5
  - GC/CC markers: CCSlice 3× 8 ms, GCSlice 4× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 40, `syscall [libc.so.6]` 6, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1); SwComposite 24 ms (top self: `syscall [libc.so.6]` 23, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 61 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `Pickle::Pickle(unsigned int, unsigned long) [libxu` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 255 ms: buckets subprocess_pipe_io 255, worker_messaging 254, ipc 254, js_ctypes 225, poll_wait 214, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 3; `js::jit::JSJitFrameIter::checkInvalidation(js::jit` 2; `__lll_lock_wait [libc.so.6]` 2; `[axiosozo-dev]` 2
- **tab:7745** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7739** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 598, DOM Worker 255, Renderer 57, other 35, SwComposite 20, Compositor 18, WRRenderBackend 17, WRWorker 12, WRSceneBuilder 10, BgPool 2, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 598 ms (16.2% of span): Idle 242, JavaScript 91, GC / CC 81, Other 54, Graphics 41, DOM 37
  - JS leaf 9 / native under JS 154 / native 435; buckets: ipc 597, poll_wait 288, gc_cc 179, paint_layout 93, worker_messaging 76, engine_stream_read 67, harness_diagnostics 40, array_buffer_copy 27
  - top self: `__syscall_cancel_arch [libc.so.6]` 264; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 18; `[axiosozo-dev]` 14; `[unknown]` 9; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7
  - GC/CC markers: GCMajor 2× 1337 ms, GCSlice 16× 66 ms, CCSlice 5× 15 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 57 ms (top self: `__syscall_cancel_arch [libc.so.6]` 24, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); SwComposite 20 ms (top self: `syscall [libc.so.6]` 17, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `mozilla::wr::RenderThread::WrNotifierEvent_NewFram` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 255 ms: buckets subprocess_pipe_io 255, worker_messaging 255, ipc 255, js_ctypes 242, poll_wait 237, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 237; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `[axiosozo-dev]` 1; `mozilla::EventListenerManager::HandleEventSingleLi` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7274** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 0; `non-virtual thunk to nsDocShell::GetWindow() [libxul.so]` 0; `mozilla::dom::WindowContext_Binding::get_isInBFCache(JSConte` 0; `NS_CycleCollectorSuspect3 [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::NodeController::ForwardEvent(mojo::core::ports` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7745** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 94, Renderer 32, DOM Worker 15, BgPool 12, WRRenderBackend 4, Compositor 4, WRSceneBuilder 3, IPC I/O 3, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 94 ms (29.7% of span): JavaScript 30, Layout 24, DOM 12, Graphics 10, Other 6, Idle 6
  - JS leaf 3 / native under JS 47 / native 44; buckets: ipc 94, paint_layout 32, array_buffer_copy 26, gc_cc 16, harness_diagnostics 15, engine_stream_read 8, poll_wait 7, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[unknown]` 4; `nsLayoutUtils::ComputeCBDependentValue(int, mozilla::UniqueO` 4; `mozilla::StyleGenericBackgroundSize<mozilla::StyleLengthPerc` 3; `mozilla::dom::BindingJSObjectCreator<nsWindowRoot>::CreateOb` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `ps_quad_textured_TEXTURE_RECT_vert::quad_primive_i` 5, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `[axiosozo-dev]` 0, `mozilla::gfx::RecordedDrawTargetCreation::Recorded` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 12 ms (top self: `fstatat64 [libc.so.6]` 5, `rmdir [libc.so.6]` 4, `getdents64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 14, js_ctypes 14; top self: `__syscall_cancel_arch [libc.so.6]` 14; `[axiosozo-dev]` 1; `mozilla::dom::WorkerThreadRunnable::Run() [libxul.` 0
- **tab:7739** CPU ms by thread group: main 32, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 32 ms (9.9% of span): JavaScript 12, Other 10, Idle 5, Layout 3, Profiler 1, DOM 1
  - JS leaf 0 / native under JS 11 / native 20; buckets: ipc 28, gc_cc 11, subprocess_pipe_io 8, poll_wait 5, memcpy_memset 2, paint_layout 1, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `nsGlobalWindowOuter::GetGlobalJSObject() [libxul.so]` 3; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsStyleUIReset::~nsStyleUIReset() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7274** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, Other 1, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 0; `mozilla::dom::CallSetup::CheckBeforeExecution(nsIGlobalObjec` 0; `ResolvePromise(JSContext*, JS::Handle<js::PromiseObject*>, J` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7337** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **79.8** (Renderer 31.2, main 20.8, DOM Worker 17.3, Backgro~Pool # 3.5, WRRende~ckend# 3.5) | WPEWebProcess 86.5, AxioWebKitHost 10.4, WPENetworkProce 10.4 | — | 249.1 |
| plain | idle | — | — | **9.7** (main 6.7, glean.dispatche 1.0, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.4, forkserver 0.5 | — | — |
| plain | raf | 56.6 | 41.3 | **46.6** (main 16.4, Renderer 5.8, DOM Worker 4.2, BgIOThr~Pool # 3.8, SwComposite 3.2) | WPEWebProcess 184.6, AxioWebKitHost 20.8, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **27.1** (Renderer 6.3, main 5.0, SwComposite 3.6, DOM Worker 3.3, Backgro~Pool # 3.0) | WPEWebProcess 185.4, AxioWebKitHost 21.5, Privileged Cont 0.3 | — | — |
| plain | scroll | 53.6 | 35.3 | **53.0** (main 20.9, Backgro~Pool # 9.0, DOM Worker 8.5, Renderer 5.2, SwComposite 3.3) | WPEWebProcess 188.4, AxioWebKitHost 23.2 | — | — |
| plain | key | — | — | **88.9** (main 28.5, DOM Worker 19.8, IndexedDB IO # 16.0, IPDL Background 6.5, TaskCon~ller # 3.8) | WPEWebProcess 18.3, AxioWebKitHost 2.7, WebExtensions 0.6, Utility Process 0.3 | 29.4 | — |
| plain | switch-to-gecko | — | — | **44.2** (main 16.1, Renderer 12.1, Socket Thread 4.0, WRRende~ckend# 4.0, sqldb:p~lite # 4.0) | Isolated Web Co 4.0 | — | 216.3 |
| trace | switch-to-engine | — | — | **76.9** (Renderer 44.3, main 23.3, Compositor 4.7, WRScene~ilder# 2.3, WRRende~ckend# 2.3) | WPEWebProcess 84.0, AxioWebKitHost 7.0, WPENetworkProce 7.0, Privileged Cont 2.3 | — | 397.8 |
| trace | idle | — | — | **13.0** (main 7.7, DOM Worker 2.9, TaskCon~ller # 1.4, Timer 1.0) | AxioWebKitHost 0.5, Web Content 0.5 | — | — |
| trace | raf | 57.8 | 25.7 | **33.9** (main 13.2, Renderer 5.8, SwComposite 3.5, DOM Worker 3.5, Backgro~Pool # 2.9) | WPEWebProcess 187.5, AxioWebKitHost 20.9 | — | — |
| trace | raf-nosampler | — | — | **28.2** (Renderer 6.3, main 6.0, SwComposite 3.6, DOM Worker 3.6, Backgro~Pool # 3.0) | WPEWebProcess 187.1, AxioWebKitHost 20.5, Web Content 0.3 | — | — |
| trace | scroll | 55.4 | 33.7 | **54.9** (main 22.3, DOM Worker 8.6, Backgro~Pool # 8.6, Renderer 5.7, SwComposite 2.9) | WPEWebProcess 185.4, AxioWebKitHost 22.3 | — | — |
| trace | key | — | — | **18.8** (main 10.6, Renderer 2.7, SwComposite 1.4, DOM Worker 1.4, glean.dispatche 0.5) | WPEWebProcess 18.0, AxioWebKitHost 2.2 | 27.0 | — |
| trace | switch-to-gecko | — | — | **41.0** (main 12.3, Renderer 12.3, Socket Thread 4.1, DOM Worker 4.1, BgIOThr~Pool # 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 217.4 |
| profile | switch-to-engine | — | — | **49.6** (main 14.6, DOM Worker 11.7, SamplerThread 11.7, TaskCon~ller # 2.9, Renderer 2.9) | WPEWebProcess 67.2, Web Content 14.6, WPENetworkProce 8.8, AxioWebKitHost 5.8 | — | 303.7 |
| profile | idle | — | — | **28.7** (main 8.6, SamplerThread 8.6, DOM Worker 8.1, Timer 1.9, IPC I/O Parent 0.5) | Web Content 9.1, Isolated Web Co 2.4, Socket Process 1.9, WebExtensions 1.4 | — | — |
| profile | raf | 58.0 | 23.8 | **54.6** (main 16.5, DOM Worker 9.8, SamplerThread 8.5, Renderer 6.0, SwComposite 3.2) | WPEWebProcess 190.1, AxioWebKitHost 21.8, Web Content 7.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **45.9** (DOM Worker 10.2, SamplerThread 8.3, main 7.6, Renderer 6.6, SwComposite 3.3) | WPEWebProcess 189.8, AxioWebKitHost 22.1, Web Content 7.3, Privileged Cont 1.7 | — | — |
| profile | scroll | 53.1 | 35.4 | **74.8** (main 27.6, DOM Worker 14.3, Backgro~Pool # 9.2, SamplerThread 7.4, Renderer 6.5) | WPEWebProcess 191.6, AxioWebKitHost 24.9, Web Content 8.3, Privileged Cont 2.3 | — | — |
| profile | key | — | — | **55.5** (main 16.0, BgIOThr~Pool # 10.3, DOM Worker 10.0, SamplerThread 10.0, Renderer 3.2) | WPEWebProcess 18.4, Web Content 9.7, AxioWebKitHost 2.8, Privileged Cont 2.4 | 29.1 | — |
| profile | switch-to-gecko | — | — | **53.2** (main 11.4, Renderer 11.4, DOM Worker 7.6, WRRende~ckend# 3.8, Compositor 3.8) | Isolated Web Co 7.6 | — | 225.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.3 | 0.0 | 0 | 0.0 | — | — | 127.5 | 0.0 | — | 2.98 | 0.45 | — | — | — | — | — | 0.002 |
| trace | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.31 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.31 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 54.2 | 0.0 | 0 | 0.0 | — | — | 12.2 | 0.0 | — | 0.86 | 0.14 | — | — | — | — | — | 0.008 |
| trace | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 14.4 | 0.0 | — | 0.09 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.4 | 0.0 | 0 | 0.0 | — | — | 94.9 | 0.0 | — | 3.18 | 0.68 | — | — | — | — | — | 0.004 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.34 | 0.16 | — | — | — | — | — | 0.013 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.31 | 0.17 | — | — | — | — | — | 0.012 |
| profile | scroll | 51.1 | 0.0 | 0 | 0.0 | — | — | 10.1 | 0.0 | — | 1.48 | 0.17 | — | — | — | — | — | 0.014 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.13 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.744 | 5.638 | 0.0176 | 0.0362 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.189 | 0.302 | 0.0108 | 0.0172 |
| plain | raf-nosampler | memfd | native | 177 | 177 | 0.283 | 0.342 | 0.0165 | 0.0199 |
| plain | scroll | memfd | native | 111 | 111 | 0.790 | 0.869 | 0.0413 | 0.0454 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.227 | 0.0000 | 0.0012 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 2.749 | 5.287 | 0.0118 | 0.0226 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 182 | 182 | 0.189 | 0.297 | 0.0110 | 0.0172 |
| trace | raf-nosampler | memfd | native | 177 | 177 | 0.211 | 0.283 | 0.0123 | 0.0165 |
| trace | scroll | memfd | native | 115 | 115 | 0.752 | 0.891 | 0.0408 | 0.0483 |
| trace | key | memfd | native | 20 | 20 | 0.002 | 0.193 | 0.0000 | 0.0010 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.029 | 6.416 | 0.0164 | 0.0347 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.211 | 0.299 | 0.0123 | 0.0174 |
| profile | raf-nosampler | memfd | native | 178 | 178 | 0.193 | 0.277 | 0.0112 | 0.0161 |
| profile | scroll | memfd | native | 112 | 112 | 1.018 | 1.233 | 0.0520 | 0.0630 |
| profile | key | memfd | native | 20 | 20 | 0.002 | 0.232 | 0.0000 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 23.1 | 0.0 | — | 0.09 | 0.32 | — | — | 10.9 | 23.9 | 34.5 |
| profile | 0.6 | 25.6 | 0.1 | — | 0.13 | 0.52 | — | — | 9.9 | 27.3 | 35.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 53.5; first stdout read resolved 56.2; first frame applied (native receiver) 436.6; write frame_ack 437.3; write visibility 440.9; write focus 441.1

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 17.6; first stdout read resolved 23.8

Switch timeline (profile, switch-to-engine, ms after the window start): write create 35.9; first stdout read resolved 39.4; first frame applied (native receiver) 321.9; write frame_ack 323.0; write visibility 333.1; write focus 333.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 29.7; first stdout read resolved 40.9

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 49, Renderer 24, DOM Worker 23, BgPool 18, Compositor 4, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 49 ms (13.3% of span): JavaScript 16, Idle 9, Layout 7, DOM 7, Graphics 3, GC / CC 3
  - JS leaf 0 / native under JS 31 / native 18; buckets: ipc 49, gc_cc 23, paint_layout 13, array_buffer_copy 11, harness_diagnostics 11, poll_wait 9, engine_stream_read 8, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&,` 3; `mozilla::dom::Document::GetTitleElement() [libxul.so]` 3; `mprotect [libc.so.6]` 2; `js::EqualChars(JSLinearString const*, JSLinearString const*)` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 8 ms
  - WebRender/compositor threads: Renderer 24 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7, `ClearTexSubImage [libxul.so]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1, `syscall [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 18 ms (top self: `ARGBSetRow_X86 [libxul.so]` 9, `__syscall_cancel_arch [libc.so.6]` 4, `__memset_avx2_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 23 ms: buckets subprocess_pipe_io 23, worker_messaging 23, ipc 23, js_ctypes 21, poll_wait 21, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 22; `getcontext [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0; `mozilla::detail::HashTable<mozilla::Span<char, 184` 0
- **tab:9523** CPU ms by thread group: main 56, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 56 ms (15.8% of span): Other 44, JavaScript 4, DOM 4, Profiler 3, Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 7 / native 50; buckets: ipc 43, array_buffer_copy 21, gc_cc 15, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 2, image_container 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `[]` 3; `[libexpat.so.1]` 3; `__memcmp_avx2_movbe [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `mozilla::dom::InitScriptSettings() [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 6 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9383** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.3% of span): Idle 1, Graphics 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9529** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 166, DOM Worker 117, other 20, IPC I/O 1, Socket 1, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 166 ms (7.9% of span): Idle 129, JavaScript 12, Other 10, DOM 7, GC / CC 7, Profiler 2
  - JS leaf 1 / native under JS 18 / native 148; buckets: ipc 166, poll_wait 134, harness_diagnostics 16, gc_cc 10, array_buffer_copy 6, engine_stream_read 4, worker_messaging 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 133; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 1; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: CCSlice 2× 4 ms, GCSlice 2× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 117 ms: buckets subprocess_pipe_io 117, js_ctypes 117, worker_messaging 117, ipc 117, poll_wait 117; top self: `__syscall_cancel_arch [libc.so.6]` 117
- **tab:8962** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9387** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8984** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 490, DOM Worker 248, Renderer 179, SwComposite 99, BgPool 90, WRRenderBackend 55, Compositor 43, other 29, ImageBridge 18, WRSceneBuilder 8, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 490 ms (15.3% of span): Idle 329, JavaScript 93, Other 34, DOM 27, Profiler 5, GC / CC 2
  - JS leaf 15 / native under JS 101 / native 374; buckets: ipc 489, poll_wait 354, gc_cc 80, engine_stream_read 57, harness_diagnostics 48, worker_messaging 36, native_receiver 21, array_buffer_copy 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 347; `[unknown]` 14; `[axiosozo-dev]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 7; `__lll_lock_wake [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 179 ms (top self: `__syscall_cancel_arch [libc.so.6]` 119, `__memmove_avx_unaligned_erms [libc.so.6]` 32, `syscall [libc.so.6]` 18); SwComposite 99 ms (top self: `syscall [libc.so.6]` 92, `__memmove_avx_unaligned_erms [libc.so.6]` 7); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 12, `crossbeam_channel::channel::Sender<T>::send [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 90 ms (top self: `__syscall_cancel_arch [libc.so.6]` 72, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `[linux-vdso.so.1]` 0, `Pickle::WriteBytes(void const*, unsigned int) [lib` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 248 ms: buckets subprocess_pipe_io 248, worker_messaging 248, ipc 248, js_ctypes 220, poll_wait 210, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 213; `[axiosozo-dev]` 4; `mozilla::dom::TimeoutExecutor::MaybeSchedule(mozil` 3; `moz_xmalloc [axiosozo-dev]` 3; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 3
- **tab:9523** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8984** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ipc::MessageChannel::Send(std::unique_ptr<IPC::Mess` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `g_source_ref [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 242, main 216, Renderer 175, SwComposite 100, BgPool 84, WRRenderBackend 53, Compositor 42, ImageBridge 18, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 216 ms (7.1% of span): Idle 136, JavaScript 52, Other 16, DOM 11, GC / CC 1
  - JS leaf 8 / native under JS 51 / native 157; buckets: ipc 213, poll_wait 142, gc_cc 66, engine_stream_read 45, worker_messaging 34, native_receiver 17, subprocess_pipe_io 9, array_buffer_copy 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 141; `[unknown]` 10; `[linux-vdso.so.1]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 175 ms (top self: `__syscall_cancel_arch [libc.so.6]` 115, `__memmove_avx_unaligned_erms [libc.so.6]` 40, `syscall [libc.so.6]` 13); SwComposite 100 ms (top self: `syscall [libc.so.6]` 87, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 11, `webrender::visibility::update_prim_visibility [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 85 ms (top self: `__syscall_cancel_arch [libc.so.6]` 69, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `__lll_lock_wake [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 242 ms: buckets subprocess_pipe_io 242, worker_messaging 242, ipc 242, js_ctypes 225, poll_wait 222, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 225; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `[linux-vdso.so.1]` 1; `getcontext [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1
- **tab:8962** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9523** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9387** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 559, DOM Worker 278, BgPool 178, Renderer 118, SwComposite 62, WRRenderBackend 38, Compositor 27, other 17, ImageBridge 11, WRSceneBuilder 6, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 559 ms (25.6% of span): Idle 329, JavaScript 107, Other 61, DOM 27, Graphics 15, Profiler 10
  - JS leaf 11 / native under JS 120 / native 428; buckets: ipc 559, poll_wait 381, gc_cc 100, engine_stream_read 69, worker_messaging 56, paint_layout 51, harness_diagnostics 39, subprocess_pipe_io 36
  - top self: `__syscall_cancel_arch [libc.so.6]` 360; `[unknown]` 21; `__lll_lock_wait [libc.so.6]` 9; `__lll_lock_wake [libc.so.6]` 7; `[axiosozo-dev]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `__syscall_cancel_arch [libc.so.6]` 75, `__memmove_avx_unaligned_erms [libc.so.6]` 22, `syscall [libc.so.6]` 15); SwComposite 62 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 7, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 178 ms (top self: `__syscall_cancel_arch [libc.so.6]` 129, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 278 ms: buckets subprocess_pipe_io 278, worker_messaging 278, ipc 278, js_ctypes 244, poll_wait 235, gc_cc 13; top self: `__syscall_cancel_arch [libc.so.6]` 241; `[axiosozo-dev]` 7; `__lll_lock_wake [libc.so.6]` 4; `getcontext [libc.so.6]` 3; `mozilla::dom::FunctionOrTrustedScriptOrString::Try` 3
- **tab:8984** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9529** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8962** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 544, BgPool 368, DOM Worker 262, Renderer 114, SwComposite 53, other 36, WRRenderBackend 18, Compositor 17, WRWorker 11, WRSceneBuilder 9, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 544 ms (14.6% of span): Idle 275, JavaScript 98, Graphics 46, Other 43, DOM 30, Layout 30
  - JS leaf 10 / native under JS 149 / native 385; buckets: ipc 538, poll_wait 316, gc_cc 108, paint_layout 86, engine_stream_read 76, worker_messaging 69, harness_diagnostics 39, subprocess_pipe_io 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 277; `[unknown]` 19; `[axiosozo-dev]` 12; `__internal_syscall_cancel [libc.so.6]` 7; `[linux-vdso.so.1]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6
  - GC/CC markers: CCSlice 2× 5 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 113 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 43, `__syscall_cancel_arch [libc.so.6]` 26, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 12); SwComposite 53 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 363 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 337, `__syscall_cancel_arch [libc.so.6]` 22, `LZ4F_flush [libxul.so]` 3); BackgroundThreadPool #3 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2)
  - busiest DOM Worker 262 ms: buckets subprocess_pipe_io 262, worker_messaging 262, ipc 262, js_ctypes 245, poll_wait 239, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 241; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 5; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:8911** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 4, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 4, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::jit::JitHintsMap::getIonThresholdHint(JSScript*, unsigne` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JS_WrapObject(JSContext*, JS::MutableHandle<JSObject*>) [lib` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9003** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 3, DOM 2, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, gc_cc 2, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `nsTHashtable<AtomTableEntry>::s_HashKey(void const*) [libxul` 1; `bool mozilla::HashSet<js::jit::ExecutablePool*, mozilla::Def` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1; `js::jit::MacroAssembler::Push(js::jit::Register) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8962** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 85, Renderer 59, DOM Worker 16, BgPool 11, SwComposite 5, Compositor 4, WRRenderBackend 4, IPC I/O 3, WRSceneBuilder 3, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 85 ms (27.3% of span): JavaScript 39, Layout 14, Graphics 13, Other 11, DOM 4, Idle 2
  - JS leaf 4 / native under JS 41 / native 41; buckets: ipc 85, paint_layout 29, array_buffer_copy 23, harness_diagnostics 12, poll_wait 11, gc_cc 7, worker_messaging 7, engine_stream_read 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `mozilla::DisplayListClipState::AutoSaveRestore::AutoSaveRest` 7; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 7; `[unknown]` 5; `selectors::matching::matches_simple_selector [libxul.so]` 4; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4
  - WebRender/compositor threads: Renderer 59 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9, `hypotf@@GLIBC_2.35 [libm.so.6]` 8); SwComposite 5 ms (top self: `syscall [libc.so.6]` 5); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 11 ms (top self: `unlink [libc.so.6]` 3, `__open_nocancel [libc.so.6]` 3, `fstatat64 [libc.so.6]` 2); BackgroundThreadPool #3 0 ms (top self: `syscall [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15, poll_wait 14; top self: `__syscall_cancel_arch [libc.so.6]` 15; `getcontext [libc.so.6]` 1; `js::ctypes::StructType::LookupField(JSContext*, JS` 0
- **tab:9383** CPU ms by thread group: main 29, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (9.2% of span): Other 9, JavaScript 8, Idle 5, DOM 3, Layout 2, Graphics 1
  - JS leaf 1 / native under JS 7 / native 21; buckets: ipc 26, gc_cc 7, poll_wait 5, subprocess_pipe_io 4, paint_layout 2, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 2; `defineProperty (self-hosted:2717:30)[16]` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8911** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (1.8% of span): Idle 5, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `XPCConvert::NativeInterface2JSObject(JSContext*, JS::Mutable` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[6` 0; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9523** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

