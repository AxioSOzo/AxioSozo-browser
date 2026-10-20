# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **7.0** (main 2.5, Renderer 2.5, glean.dispatche 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Web Content 2.5, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **22.0** (Renderer 12.5, WRRende~ckend# 2.0, main 1.3, TaskCon~ller # 1.3, Compositor 1.3) | Isolated Web Co 3.9, WebExtensions 0.6, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.0, WRRende~ckend# 1.7, main 1.3, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 3.6, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **32.6** (Renderer 20.6, main 3.5, WRRende~ckend# 2.5, SwComposite 2.5, glean.dispatche 1.0) | Isolated Web Co 4.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.8** (main 4.0, Renderer 0.8, TaskCon~ller # 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.0 | — |
| trace | idle | 59.0 | 17.2 | **4.5** (main 2.0, TaskCon~ller # 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Renderer 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **13.4** (Renderer 7.3, WRRende~ckend# 1.7, glean.dispatche 1.0, WRScene~ilder# 1.0, Compositor 1.0) | Isolated Web Co 3.6 | — | — |
| trace | raf-nosampler | — | — | **15.0** (Renderer 7.7, WRScene~ilder# 1.7, WRRende~ckend# 1.3, main 1.0, Compositor 1.0) | Isolated Web Co 4.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **36.2** (Renderer 21.7, main 4.5, WRRende~ckend# 2.5, SwComposite 2.5, glean.dispatche 1.0) | Isolated Web Co 3.0 | — | — |
| trace | key | — | — | **53.5** (main 15.3, DOM Worker 13.1, Indexed~ IO # 10.7, IPDL Background 5.6, TaskCon~ller # 2.1) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **5.5** (SamplerThread 2.5, DOM Worker 2.0, main 0.5, Socket Thread 0.5) | Web Content 4.9, Isolated Web Co 3.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **22.2** (Renderer 8.2, SamplerThread 3.9, main 2.0, WRRende~ckend# 1.6, TaskCon~ller # 1.3) | Isolated Web Co 7.5, Web Content 5.9, WebExtensions 1.3, RDD Process 1.3 | — | — |
| profile | raf-nosampler | — | — | **24.6** (Renderer 8.3, SamplerThread 4.0, WRScene~ilder# 1.7, WRRende~ckend# 1.7, main 1.3) | Isolated Web Co 7.3, Web Content 4.7, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **48.6** (Renderer 24.6, main 6.5, SamplerThread 5.5, WRRende~ckend# 3.0, SwComposite 3.0) | Isolated Web Co 7.5, Web Content 5.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | key | — | — | **10.4** (main 4.3, SamplerThread 2.9, Renderer 0.8, glean.dispatche 0.5, WRScene~ilder# 0.5) | Web Content 4.9, Isolated Web Co 3.2, WebExtensions 1.4, Socket Process 0.8 | 10.0 | — |

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

- **parent** CPU ms by thread group: DOM Worker 41, main 7, IPC I/O 1, Socket 0, other 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 7 ms (0.4% of span): Idle 4, JavaScript 3, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 7, poll_wait 4, harness_diagnostics 2, gc_cc 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `js::jit::CacheIRStubKey::hash(js::jit::CacheIRStubKey::Looku` 1; `js::DependentAddPtr<JS::GCHashSet<js::WeakHeapPtr<js::SavedF` 1; `nsTSubstring<char>::AppendASCII(char const*, unsigned long, ` 1; `js::NativeObject::moveDenseElements(unsigned int, unsigned i` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__lll_lock_wait [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 39 ms: buckets worker_messaging 39, ipc 39, gc_cc 39, memcpy_memset 11, poll_wait 2; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 16; `madvise [libc.so.6]` 9; `__syscall_cancel_arch [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:8469** CPU ms by thread group: main 19, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 19 ms (0.9% of span): Idle 15, JavaScript 2, Other 1, Profiler 1, DOM 0, Layout 0
  - JS leaf 0 / native under JS 2 / native 17; buckets: ipc 19, poll_wait 15, harness_diagnostics 2, array_buffer_copy 2, paint_layout 1, gc_cc 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 15; `mozilla::detail::RunnableMethodImpl<webrtc::DesktopCaptureIm` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1; `CanEnterBaselineJIT(JSContext*, JS::Handle<JSScript*>, js::A` 0; `mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Compart` 0; `js::jit::IRGenerator::emitConstantDataPropertyResult(js::Nat` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8400** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8552** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 237, main 63, WRRenderBackend 55, WRSceneBuilder 45, Compositor 38, SwComposite 24, IPC I/O 9, DOM Worker 2, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 63 ms (2.1% of span): GC / CC 30, Idle 18, JavaScript 8, Other 5, Graphics 2, Profiler 0
  - JS leaf 2 / native under JS 6 / native 55; buckets: ipc 63, gc_cc 34, poll_wait 25, harness_diagnostics 6, paint_layout 4, array_buffer_copy 2, subprocess_pipe_io 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeE` 2; `mozilla::ImplCycleCollectionTraverse(nsCycleCollectionTraver` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<js::BaseScr` 2
  - GC/CC markers: GCSlice 10× 24 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 237 ms (top self: `__syscall_cancel_arch [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 45, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 27); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `__pthread_mutex_unlock_usercnt [libc.so.6]` 1); WRSceneBuilder#0 40 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `DoSharedSample(bool, unsigned int, mozilla::profil` 0, `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 1
- **tab:8469** CPU ms by thread group: main 150, IPC I/O 13, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 150 ms (4.9% of span): Idle 97, Layout 13, Graphics 13, Other 9, GC / CC 6, JavaScript 5
  - JS leaf 0 / native under JS 10 / native 140; buckets: ipc 143, poll_wait 99, paint_layout 34, gc_cc 8, harness_diagnostics 6, array_buffer_copy 5, subprocess_pipe_io 2, canvas_2d 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 102; `[]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 2; `mozilla::DisplayItemClip::operator==(mozilla::DisplayItemCli` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::dom::XrayFindOwnPropertyInfo(JSContext*, mozilla::d` 1
  - GC/CC markers: GCMajor 1× 24 ms, GCSlice 5× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8509** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8381** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 251, WRRenderBackend 56, WRSceneBuilder 46, main 43, Compositor 38, SwComposite 16, IPC I/O 8, DOM Worker 4, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (1.4% of span): GC / CC 27, Idle 11, Other 2, JavaScript 1, DOM 1, Graphics 1
  - JS leaf 0 / native under JS 2 / native 41; buckets: ipc 43, gc_cc 30, poll_wait 13, harness_diagnostics 2, array_buffer_copy 2, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 2; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 251 ms (top self: `__syscall_cancel_arch [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 41, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 30); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1); WRSceneBuilder#0 41 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, memcpy_memset 2, gc_cc 2, array_buffer_copy 1, poll_wait 0; top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `munmap [libc.so.6]` 1; `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8469** CPU ms by thread group: main 144, IPC I/O 13, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 144 ms (4.8% of span): Idle 100, Graphics 15, Layout 11, Profiler 7, Other 6, GC / CC 3
  - JS leaf 0 / native under JS 4 / native 140; buckets: ipc 135, poll_wait 101, paint_layout 35, gc_cc 4, memcpy_memset 3, canvas_2d 2, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 3; `__lll_lock_wait [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8400** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8552** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mprotect [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 464, main 116, WRRenderBackend 58, SwComposite 54, Compositor 27, WRSceneBuilder 22, IPC I/O 6, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 116 ms (5.8% of span): Idle 58, GC / CC 28, Other 13, JavaScript 5, Graphics 5, Layout 4
  - JS leaf 0 / native under JS 6 / native 109; buckets: ipc 115, poll_wait 75, gc_cc 31, paint_layout 10, harness_diagnostics 6, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 8× 25 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 464 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 135, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 79, `__syscall_cancel_arch [libc.so.6]` 52); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 44, `webrender::batch::BatchBuilder::add_prim_to_batch:` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); SwComposite 54 ms (top self: `syscall [libc.so.6]` 47, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<false>(Texture&, IntRect const&, T` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8469** CPU ms by thread group: main 84, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 83 ms (4.2% of span): Idle 59, Graphics 10, Other 7, Profiler 3, JavaScript 2, Layout 2
  - JS leaf 0 / native under JS 2 / native 81; buckets: ipc 79, poll_wait 60, paint_layout 16, gc_cc 2, harness_diagnostics 2, array_buffer_copy 1, memcpy_memset 1, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 62; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `already_AddRefed<mozilla::layers::WebRenderAPZAnimationData>` 1; `__strlen_evex [libc.so.6]` 1; `syscall [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8381** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8509** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 148, Renderer 33, Compositor 17, WRRenderBackend 17, WRSceneBuilder 13, IPC I/O 7, SwComposite 5, other 2, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 148 ms (3.9% of span): Idle 41, Layout 35, Other 23, JavaScript 22, Graphics 17, DOM 6
  - JS leaf 4 / native under JS 24 / native 120; buckets: ipc 146, poll_wait 61, paint_layout 56, gc_cc 16, canvas_2d 3, subprocess_pipe_io 3, harness_diagnostics 3, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 46; `[unknown]` 7; `[axiosozo-dev]` 3; `mozilla::nsDisplayList::HitTest(mozilla::nsDisplayListBuilde` 2; `nsIFrame::CanBeDynamicReflowRoot() const [libxul.so]` 2; `mozilla::ReflowInput::ComputeContainingBlockRectangle(nsPres` 2
  - WebRender/compositor threads: Renderer 33 ms (top self: `__syscall_cancel_arch [libc.so.6]` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 0, `[axiosozo-dev]` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `core::ptr::drop_in_place<webrender::picture::Pictu` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::gc::BufferAllocator::sweepForMajorCollection(b` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8469** CPU ms by thread group: main 58, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 59 ms (1.6% of span): Idle 24, Other 12, JavaScript 6, Graphics 6, Layout 5, GC / CC 3
  - JS leaf 0 / native under JS 5 / native 53; buckets: ipc 53, poll_wait 24, paint_layout 17, gc_cc 5, harness_diagnostics 2, array_buffer_copy 2, canvas_2d 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 27; `[]` 2; `[linux-vdso.so.1]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libx` 1; `mozilla::nsDisplayListBuilder::CreateClipChainIntersection(m` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8309** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, GC / CC 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `firefox_on_glean::private::timing_distribution::TimingDistri` 0; `xpc::JSXrayTraits::getOwnPropertyFromTargetIfSafe(JSContext*` 0; `js::Proxy::getElements(JSContext*, JS::Handle<JSObject*>, un` 0; `[unknown]` 0; `[]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8400** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

