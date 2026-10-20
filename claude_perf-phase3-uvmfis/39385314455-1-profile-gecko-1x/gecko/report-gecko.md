# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.1 | **8.3** (Renderer 2.9, main 2.4, DOM Worker 1.0, Socket Thread 0.5, IPDL Background 0.5) | Web Content 2.4, WebExtensions 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **20.9** (Renderer 12.4, main 1.6, WRRende~ckend# 1.6, glean.dispatche 1.3, TaskCon~ller # 1.0) | Isolated Web Co 2.9, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **14.9** (Renderer 7.6, WRRende~ckend# 1.3, main 1.0, glean.dispatche 1.0, TaskCon~ller # 1.0) | Isolated Web Co 3.4 | — | — |
| plain | scroll | 59.0 | 17.1 | **32.9** (Renderer 21.9, main 3.5, WRRende~ckend# 2.5, SwComposite 1.5, glean.dispatche 1.0) | Isolated Web Co 3.5 | — | — |
| plain | key | — | — | **6.2** (main 3.5, Renderer 1.1, glean.dispatche 0.5, WRRende~ckend# 0.5, TaskCon~ller # 0.3) | Isolated Web Co 1.1, WebExtensions 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **3.9** (SamplerThread 2.9, Softwar~cThread 1.0) | Web Content 5.3, Isolated Web Co 2.5, Privileged Cont 1.5, Socket Process 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **22.9** (Renderer 8.8, SamplerThread 4.6, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.3) | Isolated Web Co 6.9, Web Content 6.2, Privileged Cont 1.6, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **21.2** (Renderer 8.3, SamplerThread 4.3, WRRende~ckend# 1.7, Compositor 1.7, glean.dispatche 1.3) | Isolated Web Co 7.0, Web Content 6.3, WebExtensions 1.3, Socket Process 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **70.8** (Renderer 24.7, main 11.9, DOM Worker 8.4, Indexed~ IO # 6.4, SamplerThread 4.9) | Isolated Web Co 6.5, Web Content 5.9, WebExtensions 2.0, RDD Process 1.5 | — | — |
| profile | key | — | — | **38.9** (main 12.3, DOM Worker 11.5, SamplerThread 4.0, IPDL Background 3.2, Indexed~ IO # 1.9) | Web Content 6.9, Isolated Web Co 3.5, WebExtensions 1.6, Socket Process 1.1 | 9.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
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

- **parent** CPU ms by thread group: main 6, Socket 1, Compositor 0, IPC I/O 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, other 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 6 ms (0.3% of span): Idle 2, Other 2, Layout 1, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 3, subprocess_pipe_io 1, gc_cc 1, paint_layout 1, harness_diagnostics 1
  - top self: `poll [libc.so.6]` 2; `NS_IsMainThread [libxul.so]` 1; `nsQueryReferent::operator()(nsID const&, void**) const [libx` 1; `recvmsg [libc.so.6]` 1; `write [libc.so.6]` 0; `ProxyCreate(JSContext*, JS::CallArgs&, char const*) [libxul.` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `[axiosozo-dev]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3089** CPU ms by thread group: main 16, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 16 ms (0.8% of span): Idle 13, JavaScript 3, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 3 / native 14; buckets: ipc 16, poll_wait 13, harness_diagnostics 2, array_buffer_copy 2, gc_cc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 13; `js::AvlTreeImpl<js::jit::JitCodeRange*, js::jit::JitCodeRang` 1; `js::LookupProperty(JSContext*, JS::Handle<JSObject*>, JS::Ha` 1; `js::jit::CacheIRStubInfo::New(js::jit::CacheKind, js::jit::I` 1; `[linux-vdso.so.1]` 0; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3178** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3119** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 264, WRRenderBackend 49, main 47, WRSceneBuilder 39, Compositor 32, SwComposite 14, IPC I/O 8, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 47 ms (1.5% of span): GC / CC 23, Idle 19, JavaScript 1, Profiler 1, Layout 1, Other 1
  - JS leaf 0 / native under JS 1 / native 46; buckets: ipc 47, gc_cc 24, poll_wait 20, paint_layout 2, harness_diagnostics 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 19; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `JS::GCThingTraceKind(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 1
  - GC/CC markers: GCMajor 1× 53 ms, GCSlice 6× 20 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 264 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 99, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 65, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 28); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 4, `webrender::batch::BatchBuilder::add_prim_to_batch ` 0); WRSceneBuilder#0 34 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 2, `std::enable_if<(std::is_same_v<decltype ({parm#2}(` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3089** CPU ms by thread group: main 126, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 126 ms (4.1% of span): Idle 84, Graphics 13, Layout 9, GC / CC 6, Other 6, JavaScript 4
  - JS leaf 0 / native under JS 6 / native 120; buckets: ipc 121, poll_wait 85, paint_layout 30, gc_cc 8, harness_diagnostics 3, array_buffer_copy 2, canvas_2d 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 84; `[]` 3; `sendmsg [libc.so.6]` 3; `getcontext [libc.so.6]` 1; `CCGraphBuilder::DescribeRefCountedNode(unsigned long, char c` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1
  - GC/CC markers: GCMajor 1× 10 ms, GCSlice 4× 2 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3030** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsIEventTarget::IsOnCurrentThread() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 242, WRRenderBackend 47, main 40, WRSceneBuilder 37, Compositor 31, SwComposite 8, IPC I/O 7, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 40 ms (1.3% of span): GC / CC 25, Idle 10, JavaScript 4, Other 0
  - JS leaf 0 / native under JS 4 / native 35; buckets: ipc 40, gc_cc 28, poll_wait 10, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 1, subprocess_pipe_io 0, paint_layout 0
  - top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*, JS::Slic` 2
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 22 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 242 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 69, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 23); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 33 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3089** CPU ms by thread group: main 113, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 113 ms (3.7% of span): Idle 82, Graphics 8, Other 8, Layout 8, Profiler 4, GC / CC 2
  - JS leaf 0 / native under JS 3 / native 110; buckets: ipc 110, poll_wait 85, paint_layout 21, gc_cc 2, memcpy_memset 1, subprocess_pipe_io 1, canvas_2d 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 83; `[]` 1; `write [libc.so.6]` 1; `mozilla::CycleCollectedJSRuntime::DescribeGCThing(bool, JS::` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3178** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2991** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 501, main 228, DOM Worker 159, WRRenderBackend 55, SwComposite 31, Compositor 23, WRSceneBuilder 19, IPC I/O 6, Socket 5, BgPool 3, other 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 228 ms (11.2% of span): Idle 83, JavaScript 67, DOM 35, Other 32, Graphics 3, Network 3
  - JS leaf 6 / native under JS 95 / native 128; buckets: ipc 228, poll_wait 99, gc_cc 98, array_buffer_copy 20, memcpy_memset 6, paint_layout 5, worker_messaging 2, json_metadata 2
  - top self: `poll [libc.so.6]` 87; `mozilla::net::nsHttpChannel::SetupChannelForTransaction() [l` 15; `[unknown]` 14; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 6; `__memmove_avx512_unaligned_erms [libc.so.6]` 5; `js::NewPlainObjectWithProto(JSContext*, JS::Handle<JSObject*` 3
  - GC/CC markers: GCMinor 4× 3 ms
  - WebRender/compositor threads: Renderer 501 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 115, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 113, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 64); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 1); SwComposite 31 ms (top self: `syscall [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `fsync [libc.so.6]` 0, `rename [libc.so.6]` 0); BackgroundThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 158 ms: buckets worker_messaging 158, ipc 158, gc_cc 38, poll_wait 34, array_buffer_copy 29, memcpy_memset 6; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32; `[unknown]` 20; `jsesc (resource://gre/modules/third_party/jsesc/js` 11; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 8; `__memmove_avx512_unaligned_erms [libc.so.6]` 6
- **tab:3089** CPU ms by thread group: main 70, IPC I/O 11, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (3.4% of span): Idle 51, Graphics 12, Other 3, JavaScript 2, Layout 1, DOM 1
  - JS leaf 0 / native under JS 2 / native 67; buckets: ipc 67, poll_wait 51, paint_layout 15, harness_diagnostics 2, gc_cc 1, array_buffer_copy 1, canvas_2d 0, webrender_render 0
  - top self: `poll [libc.so.6]` 51; `[]` 2; `sendmsg [libc.so.6]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeB` 1; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 1; `nsSplittableFrame::GetBlockLevelLogicalSkipSides(bool) const` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3030** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2944** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 443, DOM Worker 421, Renderer 23, Compositor 20, WRRenderBackend 13, Socket 12, WRSceneBuilder 11, IPC I/O 6, BgPool 6, SwComposite 3, other 2, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 443 ms (11.8% of span): Idle 145, JavaScript 76, DOM 71, Other 66, GC / CC 42, Layout 18
  - JS leaf 13 / native under JS 111 / native 319; buckets: ipc 443, poll_wait 189, gc_cc 157, array_buffer_copy 49, paint_layout 35, worker_messaging 10, memcpy_memset 9, subprocess_pipe_io 5
  - top self: `poll [libc.so.6]` 149; `recvmsg [libc.so.6]` 16; `[axiosozo-dev]` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `write [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 66 ms, GCSlice 8× 26 ms, CCSlice 1× 8 ms, GCMinor 3× 8 ms
  - WebRender/compositor threads: Renderer 23 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `syscall [libc.so.6]` 1); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `webrender::render_target::RenderTarget::add_task [` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `webrender::scene_builder_thread::SceneBuilderThrea` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 1, `fsync [libc.so.6]` 1); BackgroundThreadPool #1 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `[axiosozo-dev]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `fsync [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 418 ms: buckets worker_messaging 418, ipc 418, gc_cc 160, poll_wait 73, array_buffer_copy 35, memcpy_memset 24; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 67; `[unknown]` 61; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 31; `jsesc (resource://gre/modules/third_party/jsesc/js` 26; `unsigned long js::gc::Arena::finalize<JSString, (j` 21
- **tab:3089** CPU ms by thread group: main 54, IPC I/O 5, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (1.4% of span): Idle 17, Other 9, GC / CC 7, Layout 7, JavaScript 6, Graphics 5
  - JS leaf 1 / native under JS 4 / native 49; buckets: ipc 49, poll_wait 19, paint_layout 17, gc_cc 9, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 2, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 18; `[]` 3; `sendmsg [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 2; `mozilla::dom::Document::GetBrowsingContext() const [libxul.s` 1; `JS::GCCellPtr::outOfLineKind() const [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2944** CPU ms by thread group: main 7, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 7, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 7, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 7; `sendmsg [libc.so.6]` 0; `write [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `mozilla::Preferences::SetPreference(mozilla::dom::Pref const` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3030** CPU ms by thread group: main 3, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0; `mozilla::IdleTaskRunner::Schedule(bool) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

