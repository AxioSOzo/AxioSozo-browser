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

## gecko-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.1 | **7.3** (main 1.9, Renderer 1.9, IPDL Background 1.0, Compositor 1.0, DOM Worker 1.0) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **25.1** (Renderer 12.8, WRRende~ckend# 2.6, SwComposite 2.3, main 1.6, TaskCon~ller # 1.6) | Isolated Web Co 4.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.7** (Renderer 7.3, main 1.7, WRRende~ckend# 1.7, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 4.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **57.8** (Renderer 41.8, main 4.5, SwComposite 4.0, WRRende~ckend# 3.5, glean.dispatche 1.0) | Isolated Web Co 4.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.3** (main 4.3, Renderer 0.8, TaskCon~ller # 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.6 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **2.9** (SamplerThread 1.9, main 0.5, IPDL Background 0.5) | Web Content 5.4, Isolated Web Co 3.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **24.2** (Renderer 6.2, SamplerThread 3.9, WRRende~ckend# 2.9, main 2.0, WRScene~ilder# 2.0) | Isolated Web Co 11.1, Web Content 6.2, Privileged Cont 1.3, WebExtensions 1.0 | — | — |
| profile | raf-nosampler | — | — | **26.3** (Renderer 8.6, SamplerThread 4.3, WRRende~ckend# 2.7, WRScene~ilder# 2.0, main 1.7) | Isolated Web Co 10.3, Web Content 4.3, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | scroll | 59.0 | 17.2 | **124.6** (Renderer 48.2, main 17.7, DOM Worker 14.3, Indexed~ IO # 12.8, SamplerThread 7.4) | Isolated Web Co 8.9, Web Content 5.9, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **33.6** (main 12.0, DOM Worker 5.3, Indexed~ IO # 4.0, SamplerThread 3.7, IPDL Background 1.9) | Web Content 5.3, Isolated Web Co 3.7, WebExtensions 1.9, Privileged Cont 1.4 | 11.0 | — |

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

### Profile: gecko-2x / idle

- **parent** CPU ms by thread group: main 7, IPC I/O 1, Socket 1, other 0, ImageIO 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, BgPool 0, DOM Worker 0, ImageBridge 0, SwComposite 0
  - main thread 7 ms (0.4% of span): JavaScript 3, Idle 3, DOM 1, Other 0
  - JS leaf 1 / native under JS 3 / native 3; buckets: ipc 7, harness_diagnostics 4, gc_cc 4, poll_wait 3, array_buffer_copy 2, json_metadata 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 3; `replacer (chrome://remote/content/marionette/message.sys.mjs` 1; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 1; `[axiosozo-dev]` 1; `ReservedWordInfo const* FindReservedWord<char16_t>(char16_t ` 1; `XPCCallContext::SetName(JS::PropertyKey) [libxul.so]` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `sched_yield [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3114** CPU ms by thread group: main 25, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (1.2% of span): Idle 15, GC / CC 5, JavaScript 4, Other 1, Layout 1, Profiler 0
  - JS leaf 0 / native under JS 3 / native 22; buckets: ipc 24, poll_wait 15, gc_cc 7, harness_diagnostics 3, paint_layout 2, array_buffer_copy 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 15; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `JS::Compartment::findSweepGroupEdges() [libxul.so]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Handle<JSObj` 1; `js::jit::DoLazyConstantFallback(JSContext*, js::jit::Baselin` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3186** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3141** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 185, WRRenderBackend 78, main 67, WRSceneBuilder 58, SwComposite 52, Compositor 44, IPC I/O 11, other 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 67 ms (2.2% of span): GC / CC 32, Idle 26, JavaScript 4, Other 2, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 4 / native 63; buckets: ipc 67, gc_cc 34, poll_wait 28, harness_diagnostics 4, paint_layout 3, array_buffer_copy 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `mprotect [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 6× 27 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 185 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 21, `int blendTextureNearestFast<true, glsl::sampler2D_` 10); WRRenderBackend#0 78 ms (top self: `syscall [libc.so.6]` 65, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 53 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3114** CPU ms by thread group: main 240, IPC I/O 17, other 5, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 240 ms (7.8% of span): Idle 101, Graphics 48, Layout 47, Other 26, Profiler 6, GC / CC 5
  - JS leaf 0 / native under JS 12 / native 227; buckets: ipc 222, paint_layout 113, poll_wait 104, gc_cc 12, canvas_2d 8, subprocess_pipe_io 6, harness_diagnostics 4, webrender_render 3
  - top self: `poll [libc.so.6]` 100; `sendmsg [libc.so.6]` 6; `[]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 14 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3021** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3186** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimerEvent::Run() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 244, WRRenderBackend 76, WRSceneBuilder 59, main 52, Compositor 44, SwComposite 40, IPC I/O 10, other 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 52 ms (1.7% of span): GC / CC 31, Idle 15, JavaScript 6, Other 0, Graphics 0
  - JS leaf 0 / native under JS 5 / native 47; buckets: ipc 52, gc_cc 34, poll_wait 15, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 1, json_metadata 1, paint_layout 0
  - top self: `poll [libc.so.6]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 26 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 244 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 33, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 31); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 63, `sched_yield [libc.so.6]` 2, `webrender::invalidation::quadtree::TileNode::updat` 1); WRSceneBuilder#0 54 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3114** CPU ms by thread group: main 214, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 214 ms (7.1% of span): Idle 92, Graphics 57, Layout 37, Other 15, Profiler 7, DOM 5
  - JS leaf 0 / native under JS 8 / native 206; buckets: ipc 201, paint_layout 110, poll_wait 94, subprocess_pipe_io 5, canvas_2d 4, memcpy_memset 2, mozafterpaint_events 1, gc_cc 1
  - top self: `poll [libc.so.6]` 92; `[]` 6; `sendmsg [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3000** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3141** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 948, main 346, DOM Worker 275, WRRenderBackend 87, SwComposite 81, Compositor 30, WRSceneBuilder 23, Socket 9, IPC I/O 7, BgPool 2, other 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 346 ms (16.9% of span): Idle 104, JavaScript 85, DOM 76, Other 43, Graphics 14, Layout 9
  - JS leaf 15 / native under JS 127 / native 204; buckets: ipc 346, poll_wait 156, gc_cc 147, array_buffer_copy 62, paint_layout 22, memcpy_memset 17, worker_messaging 6, json_metadata 4
  - top self: `poll [libc.so.6]` 107; `__memmove_avx512_unaligned_erms [libc.so.6]` 12; `[unknown]` 11; `validate (chrome://global/content/third_party/cfworker/json-` 8; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 6; `read [libc.so.6]` 6
  - GC/CC markers: GCMinor 5× 7 ms
  - WebRender/compositor threads: Renderer 948 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 306, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 144, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 70); WRRenderBackend#0 87 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 4, `webrender::prepare::prepare_prim_for_render [libxu` 2); SwComposite 81 ms (top self: `syscall [libc.so.6]` 76, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `[libfreeblpriv3.so]` 0); BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `rename [libc.so.6]` 0, `fsync [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 275 ms: buckets worker_messaging 275, ipc 275, gc_cc 70, poll_wait 61, array_buffer_copy 37, memcpy_memset 9; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 57; `[unknown]` 30; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 15; `js::gc::TenuringTracer::onStringEdge(JSString**, c` 15; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 13
- **tab:3114** CPU ms by thread group: main 112, IPC I/O 17, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 112 ms (5.5% of span): Idle 82, Graphics 12, JavaScript 7, Other 6, Layout 2, Profiler 2
  - JS leaf 0 / native under JS 7 / native 105; buckets: ipc 109, poll_wait 82, paint_layout 20, gc_cc 3, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 82; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 2; `[]` 1; `mozilla::AppShutdown::IsShutdownImpending() [libxul.so]` 1; `sendmsg [libc.so.6]` 1; `mozilla::dom::FontFaceSetImpl::CheckLoadingFinished() [libxu` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3039** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2947** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 442, DOM Worker 197, Renderer 26, WRRenderBackend 22, Compositor 19, WRSceneBuilder 14, Socket 14, SwComposite 8, IPC I/O 6, BgPool 6, other 2, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 442 ms (11.7% of span): Idle 96, JavaScript 85, GC / CC 74, Other 65, DOM 45, Layout 29
  - JS leaf 10 / native under JS 114 / native 317; buckets: ipc 442, gc_cc 178, poll_wait 137, paint_layout 60, array_buffer_copy 29, memcpy_memset 11, worker_messaging 10, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 106; `[unknown]` 13; `recvmsg [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[axiosozo-dev]` 7; `__memmove_avx512_unaligned_erms [libc.so.6]` 6
  - GC/CC markers: GCMajor 1× 80 ms, GCSlice 19× 35 ms, CCSlice 2× 21 ms, GCMinor 2× 9 ms
  - WebRender/compositor threads: Renderer 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `int blendTextureNearestFast<true, glsl::sampler2D_` 1); WRRenderBackend#0 22 ms (top self: `syscall [libc.so.6]` 17, `sched_yield [libc.so.6]` 1, `webrender::spatial_tree::SpatialTree::get_world_tr` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 9, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `<base64::engine::general_purpose::GeneralPurpose a` 1, `__memcmp_evex_movbe [libc.so.6]` 0); BgIOThreadPool #3 2 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 194 ms: buckets worker_messaging 194, ipc 194, gc_cc 81, poll_wait 29, array_buffer_copy 11, memcpy_memset 6; top self: `[unknown]` 31; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28; `jsesc (resource://gre/modules/third_party/jsesc/js` 17; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 14; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 13
- **tab:3114** CPU ms by thread group: main 65, IPC I/O 6, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 65 ms (1.7% of span): Idle 25, GC / CC 11, Layout 10, Other 9, JavaScript 3, Profiler 3
  - JS leaf 0 / native under JS 4 / native 62; buckets: ipc 60, poll_wait 27, paint_layout 18, gc_cc 13, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 26; `sendmsg [libc.so.6]` 3; `[]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `JS::loader::ScriptLoadRequest::~ScriptLoadRequest() [libxul.` 1; `mozilla::RangeBoundaryBase<nsINode*, nsIContent*>::RangeBoun` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2947** CPU ms by thread group: main 8, IPC I/O 3, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 7, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, poll_wait 7, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 7; `[linux-vdso.so.1]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `JS_HasPropertyById(JSContext*, JS::Handle<JSObject*>, JS::Ha` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3039** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4
  - top self: `poll [libc.so.6]` 4; `nsJSContext::MaybePokeCC() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **85.4** (main 37.4, Renderer 32.0, DOM Worker 10.7, WRScene~ilder# 5.3) | cef:renderer 26.7, AxioCEFProbe 26.6, cef:utility 5.3 | — | 136.2 |
| plain | idle | — | — | **4.8** (main 3.8, Timer 0.5, DOM Worker 0.5) | Web Content 3.3, AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 22.1 | **25.6** (main 9.7, DOM Worker 3.5, Renderer 2.6, Backgro~Pool # 2.3, WRRende~ckend# 1.3) | cef:renderer 10.9, AxioCEFProbe 6.2, cef:gpu-process 5.8, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.9** (main 5.6, DOM Worker 3.3, Renderer 2.3, WRRende~ckend# 1.7, SwComposite 1.7) | cef:renderer 11.3, AxioCEFProbe 6.6, cef:gpu-process 6.2 | — | — |
| plain | scroll | 59.9 | 20.8 | **36.8** (main 17.4, DOM Worker 8.2, Backgro~Pool # 2.9, Renderer 1.9, WRRende~ckend# 1.4) | cef:gpu-process 20.3, cef:renderer 11.1, AxioCEFProbe 8.2 | — | — |
| plain | key | — | — | **16.6** (main 9.6, Renderer 1.4, DOM Worker 1.4, Timer 1.1, TaskCon~ller # 1.1) | cef:renderer 2.2, AxioCEFProbe 2.1, cef:gpu-process 0.5, WebExtensions 0.3 | 13.3 | — |
| plain | switch-to-gecko | — | — | **36.0** (main 12.0, glean.dispatche 6.0, IPC I/O Parent 6.0, Renderer 6.0, DOM Worker 6.0) |  | — | 134.0 |
| profile | switch-to-engine | — | — | **86.9** (main 38.7, Renderer 19.3, SamplerThread 9.7, WRRende~ckend# 4.8, Compositor 4.8) | AxioCEFProbe 33.7, cef:renderer 24.2, WebExtensions 4.8, Isolated Web Co 4.8 | — | 145.9 |
| profile | idle | — | — | **150.3** (DOM Worker 46.7, main 31.3, IndexedDB IO # 17.7, Indexed~ IO # 14.5, IPDL Background 13.5) | Web Content 9.3, Isolated Web Co 2.3, WebExtensions 1.9, RDD Process 1.9 | — | — |
| profile | raf | 60.0 | 21.1 | **53.7** (DOM Worker 12.8, main 12.5, SamplerThread 11.8, Renderer 3.2, Backgro~Pool # 2.6) | cef:renderer 10.5, Web Content 9.3, AxioCEFProbe 6.4, cef:gpu-process 5.4 | — | — |
| profile | raf-nosampler | — | — | **47.1** (DOM Worker 15.5, SamplerThread 10.9, main 7.6, Renderer 3.0, Compositor 2.0) | cef:renderer 11.9, Web Content 9.9, AxioCEFProbe 6.0, cef:gpu-process 5.6 | — | — |
| profile | scroll | 60.1 | 21.1 | **71.1** (main 24.3, DOM Worker 17.6, SamplerThread 11.9, Renderer 3.3, Backgro~Pool # 2.9) | cef:gpu-process 23.4, cef:renderer 11.5, Web Content 10.0, AxioCEFProbe 8.6 | — | — |
| profile | key | — | — | **37.6** (main 11.7, DOM Worker 9.8, SamplerThread 9.5, Timer 1.6, Renderer 1.6) | Web Content 9.5, AxioCEFProbe 2.4, cef:renderer 2.4, Isolated Web Co 2.2 | 15.8 | — |
| profile | switch-to-gecko | — | — | **6.7** (SamplerThread 3.4, main 1.5, TaskCon~ller # 0.7, DOM Worker 0.4, Renderer 0.1) | Web Content 8.5, WebExtensions 1.8, Privileged Cont 1.7, Isolated Web Co 1.6 | — | 15033.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 8.2 | 0.0 | 0 | 0.0 | — | — | 3.4 | 0.0 | — | 5.21 | 0.68 | — | — | — | — | — | 0.006 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.19 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 59.4 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.18 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 6.7 | 0.0 | — | 0.34 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.9 | 0.0 | — | 0.60 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.932 | 2.494 | 0.0083 | 0.0222 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 189 | 0.052 | 0.249 | 0.0031 | 0.0150 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.057 | 0.247 | 0.0034 | 0.0148 |
| plain | scroll | memfd | native | 121 | 121 | 0.175 | 0.222 | 0.0101 | 0.0128 |
| plain | key | memfd | native | 21 | 21 | 0.017 | 0.253 | 0.0001 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.557 | 3.039 | 0.0292 | 0.0249 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.062 | 0.277 | 0.0037 | 0.0166 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.060 | 0.279 | 0.0035 | 0.0166 |
| profile | scroll | memfd | native | 124 | 124 | 0.215 | 0.249 | 0.0125 | 0.0145 |
| profile | key | memfd | native | 21 | 21 | 0.019 | 0.278 | 0.0001 | 0.0016 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.8 | 0.1 | — | 0.61 | 1.03 | — | — | 6.9 | 12.4 | 20.7 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 49.5; first stdout read resolved 67.6; first frame applied (native receiver) 172.1; write frame_ack 173.2; write focus 184.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 38.6; first stdout read resolved 56.5; write shutdown 59.3

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 79, Renderer 33, DOM Worker 14, BgPool 6, WRRenderBackend 4, WRSceneBuilder 4, Compositor 4, SwComposite 2, IPC I/O 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 79 ms (32.8% of span): Layout 33, Idle 21, JavaScript 14, Other 4, DOM 4, Graphics 3
  - JS leaf 1 / native under JS 38 / native 41; buckets: ipc 79, paint_layout 40, poll_wait 22, gc_cc 21, array_buffer_copy 12, harness_diagnostics 7, subprocess_pipe_io 4, worker_messaging 3
  - top self: `poll [libc.so.6]` 21; `style::properties::cascade::cascade_rules [libxul.so]` 5; `core::ptr::drop_in_place<style::values::generics::length::Ge` 4; `__lll_lock_wake [libc.so.6]` 4; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 4; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 3
  - WebRender/compositor threads: Renderer 33 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `<webrender::compositor::sw_compositor::SwComposito` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.s` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 4 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memset_avx2_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 13, poll_wait 13, array_buffer_copy 0; top self: `poll [libc.so.6]` 13; `mozilla::dom::TimeoutManager::SetTimeout(mozilla::` 0; `[unknown]` 0; `WriteStructuredClone(JSContext*, JS::Handle<JS::Va` 0; `__lll_lock_wake [libc.so.6]` 0
- **tab:4048** CPU ms by thread group: main 44, IPC I/O 1, other 0, ImageBridge 0, Socket 0, BgPool 0, ImageIO 0
  - main thread 44 ms (18.2% of span): Other 34, DOM 4, Profiler 3, JavaScript 2, GC / CC 1, Idle 0
  - JS leaf 0 / native under JS 6 / native 39; buckets: ipc 31, array_buffer_copy 14, gc_cc 10, subprocess_pipe_io 3, poll_wait 1, memcpy_memset 1
  - top self: `__strlen_avx2 [libc.so.6]` 4; `[]` 3; `[libexpat.so.1]` 3; `mozilla::detail::RunnableFunction<mozilla::CallbackThreadReg` 2; `[libfontconfig.so.1]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3862** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.6% of span): Idle 3, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `mozilla::gfx::ToDeviceColor(mozilla::gfx::sRGBColor const&) ` 1; `[]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `<firefox_on_glean::private::labeled_counter::LabeledCounterM` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4053** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 892, main 644, other 21, Socket 16, BgPool 9, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 643 ms (29.6% of span): JavaScript 196, DOM 147, Idle 145, Other 113, Profiler 17, GC / CC 13
  - JS leaf 33 / native under JS 276 / native 335; buckets: ipc 643, gc_cc 308, poll_wait 194, array_buffer_copy 127, memcpy_memset 36, harness_diagnostics 16, worker_messaging 13, json_metadata 8
  - top self: `poll [libc.so.6]` 150; `[axiosozo-dev]` 34; `[unknown]` 33; `__memmove_avx_unaligned_erms [libc.so.6]` 32; `recvmsg [libc.so.6]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 11
  - GC/CC markers: GCMinor 5× 15 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `<base64::engine::general_purpose::GeneralPurpose a` 1, `<rkv::backend::impl_safe::transaction::RwTransacti` 1); BgIOThreadPool #2 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `rename [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 754 ms: buckets worker_messaging 753, ipc 751, gc_cc 189, poll_wait 157, array_buffer_copy 82, memcpy_memset 28; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 138; `[unknown]` 113; `jsesc (resource://gre/modules/third_party/jsesc/js` 53; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 40; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 36
- **tab:3604** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): Idle 4, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 4; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3506** CPU ms by thread group: main 3, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 0; `mozilla::CheckIdleMemoryCleanupNeeded(nsITimer*, void*) [lib` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **utility:3655** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 358, DOM Worker 299, Renderer 85, BgPool 69, WRRenderBackend 49, SwComposite 43, Compositor 42, other 33, ImageBridge 18, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 358 ms (11.3% of span): Idle 229, JavaScript 73, Other 27, DOM 19, Profiler 6, GC / CC 4
  - JS leaf 12 / native under JS 79 / native 268; buckets: ipc 358, poll_wait 241, gc_cc 85, worker_messaging 47, engine_stream_read 46, json_metadata 23, native_receiver 20, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 230; `[unknown]` 9; `[axiosozo-dev]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 4; `mprotect [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 85 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 4); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 2, `webrender::tile_cache::TileCacheInstance::update_p` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 62, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `[linux-vdso.so.1]` 0, `mozilla::ProfileBufferBlockIndex profiler_add_mark` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 298 ms: buckets subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 284, poll_wait 279, gc_cc 8; top self: `poll [libc.so.6]` 279; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `write [libc.so.6]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Ha` 1
- **tab:3862** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0; `gecko_profiler_add_marker [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3586** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `MessageLoop::EventTarget::IsOnCurrentThreadInfallible() [lib` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4048** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 356, main 218, Renderer 79, BgPool 66, WRRenderBackend 46, SwComposite 43, Compositor 42, ImageBridge 18, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 218 ms (7.1% of span): Idle 113, JavaScript 60, Other 26, DOM 10, GC / CC 5, Profiler 4
  - JS leaf 7 / native under JS 59 / native 153; buckets: ipc 218, poll_wait 124, gc_cc 72, worker_messaging 43, engine_stream_read 40, subprocess_pipe_io 18, json_metadata 17, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 115; `[unknown]` 12; `write [libc.so.6]` 3; `recvmsg [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, J` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 79 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 42, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 66 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `profiler_get_core_buffer() [libxul.so]` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0, `mozilla::ipc::MessageChannel::DispatchAsyncMessage` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 351 ms: buckets subprocess_pipe_io 351, worker_messaging 351, ipc 351, js_ctypes 272, poll_wait 264, gc_cc 65; top self: `poll [libc.so.6]` 264; `[axiosozo-dev]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `madvise [libc.so.6]` 6; `mozilla::dom::Timeout::~Timeout() [libxul.so]` 4
- **tab:3867** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4048** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 478, DOM Worker 292, BgPool 60, Renderer 57, WRRenderBackend 34, Compositor 28, SwComposite 27, other 22, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 478 ms (22.4% of span): Idle 265, JavaScript 89, Other 63, DOM 23, Graphics 21, Profiler 9
  - JS leaf 10 / native under JS 93 / native 375; buckets: ipc 478, poll_wait 346, gc_cc 96, worker_messaging 50, paint_layout 50, engine_stream_read 34, array_buffer_copy 21, json_metadata 21
  - top self: `poll [libc.so.6]` 274; `[unknown]` 15; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - WebRender/compositor threads: Renderer 57 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 43, `syscall [libc.so.6]` 4, `writev [libc.so.6]` 4); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 27 ms (top self: `syscall [libc.so.6]` 27)
  - background pools (native receiver queue): BackgroundThreadPool #3 60 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 291 ms: buckets subprocess_pipe_io 291, worker_messaging 289, ipc 289, js_ctypes 249, poll_wait 241, gc_cc 17; top self: `poll [libc.so.6]` 241; `[unknown]` 4; `[axiosozo-dev]` 4; `write [libc.so.6]` 3; `getcontext [libc.so.6]` 2
- **tab:3862** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3586** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 388, DOM Worker 258, Renderer 56, other 36, SwComposite 16, Compositor 15, WRRenderBackend 14, WRWorker 11, WRSceneBuilder 9, BgPool 7, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 388 ms (10.5% of span): Idle 158, JavaScript 76, Other 39, Layout 35, Graphics 33, DOM 29
  - JS leaf 13 / native under JS 135 / native 240; buckets: ipc 388, poll_wait 201, gc_cc 96, paint_layout 82, worker_messaging 75, engine_stream_read 45, subprocess_pipe_io 31, array_buffer_copy 20
  - top self: `poll [libc.so.6]` 161; `[unknown]` 20; `recvmsg [libc.so.6]` 9; `[axiosozo-dev]` 9; `write [libc.so.6]` 8; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: CCSlice 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 56 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); SwComposite 16 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[libxul.so]` 0); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 242, poll_wait 237, gc_cc 4; top self: `poll [libc.so.6]` 237; `[unknown]` 3; `ffi_call_plan_invoke [libxul.so]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `mozilla::baseprofiler::profiler_current_thread_id(` 1
- **tab:3506** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Profiler 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0; `nsContentUtils::SubjectPrincipal() [libxul.so]` 0; `XPCWrappedNativeScope::GetExpandoChain(JS::Handle<JSObject*>` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.` 0; `lazyGetter (resource://gre/modules/XPCOMUtils.sys.mjs:237:24` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4053** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 230, DOM Worker 86, Renderer 20, BgPool 10, IPC I/O 6, Compositor 4, WRRenderBackend 3, other 2, WRSceneBuilder 2, SwComposite 1, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 230 ms (1.5% of span): GC / CC 134, JavaScript 34, Idle 24, Layout 15, Other 13, Profiler 4
  - JS leaf 1 / native under JS 50 / native 179; buckets: ipc 230, gc_cc 161, poll_wait 30, paint_layout 22, array_buffer_copy 12, memcpy_memset 12, harness_diagnostics 11, worker_messaging 9
  - top self: `poll [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 24; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 8; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 8; `[axiosozo-dev]` 7; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 7
  - GC/CC markers: GCMajor 3× 193 ms, GCSlice 12× 83 ms, CCSlice 3× 48 ms, GCMinor 3× 1 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 20 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0, `webrender::clip::ClipStore::set_active_clips [libx` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `webrender::scene_builder_thread::SceneBuilderThrea` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 9 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 2, `__open_nocancel [libc.so.6]` 1); BackgroundThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 46 ms: buckets subprocess_pipe_io 46, worker_messaging 45, ipc 45, gc_cc 32, poll_wait 14, js_ctypes 12; top self: `poll [libc.so.6]` 12; `[axiosozo-dev]` 8; `madvise [libc.so.6]` 5; `syscall [libc.so.6]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2
- **tab:3862** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 5, Layout 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 5, paint_layout 0
  - top self: `poll [libc.so.6]` 5; `ProfilingStack::pushLabelFrame(char const*, char const*, voi` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `webrtc::video_coding::DecodedFramesHistory::GetLastDecodedFr` 0; `txMozillaXSLTProcessor::Release() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4053** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__strlen_avx2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **148.9** (Renderer 54.5, main 44.6, DOM Worker 19.8, Backgro~Pool # 5.0, TaskCon~ller # 5.0) | AxioCEFProbe 34.8, cef:renderer 24.8, cef:gpu-process 10.0, cef:utility 5.0 | — | 155.8 |
| plain | idle | — | — | **5.7** (main 4.3, Timer 0.9, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 20.8 | **31.8** (main 8.7, Backgro~Pool # 6.1, Renderer 4.8, SwComposite 3.5, DOM Worker 3.5) | cef:gpu-process 15.4, cef:renderer 12.2, AxioCEFProbe 11.3 | — | — |
| plain | raf-nosampler | — | — | **41.6** (main 9.6, Backgro~Pool # 6.6, Renderer 5.3, SwComposite 4.3, DOM Worker 3.3) | cef:gpu-process 17.6, cef:renderer 11.9, AxioCEFProbe 10.9, RDD Process 0.3 | — | — |
| plain | scroll | 59.7 | 21.4 | **48.5** (main 18.2, Backgro~Pool # 8.6, DOM Worker 7.7, Renderer 5.3, SwComposite 3.4) | cef:gpu-process 59.4, AxioCEFProbe 14.3, cef:renderer 13.9 | — | — |
| plain | key | — | — | **43.7** (main 14.7, DOM Worker 9.0, IndexedDB IO # 6.8, Renderer 3.0, IPDL Background 2.5) | cef:renderer 2.5, AxioCEFProbe 2.4, cef:gpu-process 0.8, Web Content 0.3 | 13.1 | — |
| plain | switch-to-gecko | — | — | **8.7** (main 2.9, DOM Worker 2.9, IPDL Background 0.9, TaskCon~ller # 0.9, Renderer 0.3) | Privileged Cont 0.1, WebExtensions 0.1, Web Content 0.1 | — | 15018.0 |
| profile | switch-to-engine | — | — | **84.9** (Renderer 32.4, main 28.3, DOM Worker 8.1, SamplerThread 8.1, WRRende~ckend# 4.0) | AxioCEFProbe 28.2, cef:renderer 20.2, cef:gpu-process 12.1, Web Content 8.1 | — | 179.3 |
| profile | idle | — | — | **25.1** (DOM Worker 8.5, SamplerThread 8.5, main 5.2, Timer 1.9, glean.dispatche 0.5) | Web Content 8.9, WebExtensions 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 60.0 | 21.0 | **62.3** (main 13.4, DOM Worker 12.7, SamplerThread 12.1, Backgro~Pool # 6.1, Renderer 5.4) | cef:gpu-process 14.9, cef:renderer 11.8, Web Content 10.5, AxioCEFProbe 10.5 | — | — |
| profile | raf-nosampler | — | — | **60.9** (DOM Worker 12.9, main 11.5, SamplerThread 10.9, Backgro~Pool # 6.9, Renderer 5.9) | cef:gpu-process 15.5, cef:renderer 11.6, AxioCEFProbe 10.6, Web Content 9.6 | — | — |
| profile | scroll | 60.0 | 21.4 | **83.8** (main 26.0, DOM Worker 17.5, SamplerThread 12.3, Backgro~Pool # 9.5, Renderer 5.7) | cef:gpu-process 65.2, AxioCEFProbe 16.6, cef:renderer 16.0, Web Content 10.4 | — | — |
| profile | key | — | — | **40.6** (main 11.7, DOM Worker 10.1, SamplerThread 9.8, Renderer 3.3, Timer 1.6) | Web Content 9.5, AxioCEFProbe 3.0, WebExtensions 2.5, cef:renderer 2.4 | 15.5 | — |
| profile | switch-to-gecko | — | — | **4.8** (SamplerThread 3.4, main 0.4, DOM Worker 0.4, Renderer 0.3, IPDL Background 0.1) | Web Content 8.8, WebExtensions 1.8, Isolated Web Co 1.8, Privileged Cont 1.6 | — | 15038.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 6.8 | 0.0 | 0 | 0.0 | — | — | 17.3 | 0.0 | — | 6.37 | 1.18 | — | — | — | — | — | 0.008 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.36 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.2 | 0.0 | — | 0.41 | 0.18 | — | — | — | — | — | 0.014 |
| profile | scroll | 58.2 | 0.0 | 0 | 0.0 | — | — | 12.2 | 0.0 | — | 0.97 | 0.16 | — | — | — | — | — | 0.012 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.37 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.416 | 6.728 | 0.0290 | 0.0572 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 188 | 0.212 | 0.784 | 0.0128 | 0.0470 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.236 | 0.779 | 0.0141 | 0.0465 |
| plain | scroll | memfd | native | 122 | 122 | 0.739 | 0.732 | 0.0427 | 0.0422 |
| plain | key | memfd | native | 21 | 21 | 0.063 | 0.795 | 0.0004 | 0.0045 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 4.885 | 7.872 | 0.0333 | 0.0537 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.218 | 0.811 | 0.0131 | 0.0485 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.252 | 0.826 | 0.0151 | 0.0495 |
| profile | scroll | memfd | native | 125 | 125 | 0.849 | 0.855 | 0.0494 | 0.0498 |
| profile | key | memfd | native | 21 | 21 | 0.063 | 0.881 | 0.0004 | 0.0050 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 11.0 | 0.1 | — | 0.35 | 0.74 | — | — | 12.2 | 12.4 | 24.4 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 59.1; first stdout read resolved 79.2; first frame applied (native receiver) 216.3; write frame_ack 218.3; write focus 226.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 36.4; first stdout read resolved 59.1; write shutdown 62.2

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 89, main 71, BgPool 15, DOM Worker 15, SwComposite 6, Compositor 6, WRRenderBackend 4, WRSceneBuilder 3, IPC I/O 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 71 ms (24.4% of span): Layout 21, JavaScript 19, Idle 12, Other 7, Graphics 5, Profiler 4
  - JS leaf 2 / native under JS 40 / native 29; buckets: ipc 71, paint_layout 26, gc_cc 25, array_buffer_copy 19, harness_diagnostics 13, poll_wait 13, webrender_render 4, worker_messaging 4
  - top self: `poll [libc.so.6]` 12; `style::properties::cascade::Declarations::note_declaration [` 8; `mozilla::net::nsStandardURL::nsStandardURL(bool, bool) [libx` 7; `__lll_lock_wake [libc.so.6]` 4; `style::sharing::StyleSharingCache<E>::new [libxul.so]` 4; `js::jit::CacheIRWriter::copyStubData(unsigned char*) const [` 4
  - WebRender/compositor threads: Renderer 89 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 25, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 14, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 10); SwComposite 6 ms (top self: `syscall [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 15 ms (top self: `ARGBSetRow_X86 [libxul.so]` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, js_ctypes 14, poll_wait 14; top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 1; `mprotect [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0
- **tab:3958** CPU ms by thread group: main 18, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 18 ms (6.2% of span): Other 10, JavaScript 4, DOM 2, Profiler 1, GC / CC 1, Idle 1
  - JS leaf 0 / native under JS 2 / native 16; buckets: ipc 18, gc_cc 11, subprocess_pipe_io 6, memcpy_memset 1, poll_wait 1
  - top self: `js::LexicalScope::RuntimeData* js::frontend::ScopeStencil::c` 1; `mmap64 [ld-linux-x86-64.so.2]` 1; `mozilla::CycleCollectedJSContext::Get() [libxul.so]` 1; `non-virtual thunk to mozilla::net::nsStandardURL::TemplatedM` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `js::SharedImmutableScriptData::shareScriptData(js::FrontendC` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 17, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 17 ms (5.8% of span): Other 7, JavaScript 3, DOM 3, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 1 / native under JS 5 / native 11; buckets: ipc 17, gc_cc 10, subprocess_pipe_io 3, array_buffer_copy 2, poll_wait 2, memcpy_memset 1
  - top self: `[libmozsandbox.so]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `poll [libc.so.6]` 1; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, ` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3825** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 2, Layout 1, Profiler 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `Servo_StyleSet_MediumFeaturesChanged [libxul.so]` 1; `profiler_active_without_feature(unsigned int) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 110, main 99, other 21, Socket 3, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, Canvas 0, Compositor 0, WRRenderBackend 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 99 ms (4.6% of span): Idle 83, JavaScript 8, Other 6, DOM 1, Profiler 1
  - JS leaf 1 / native under JS 7 / native 90; buckets: ipc 99, poll_wait 86, harness_diagnostics 8, array_buffer_copy 5, gc_cc 3, json_metadata 1, native_receiver 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 84; `__lll_lock_wait [libc.so.6]` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 1; `AsyncFunctionResume(JSContext*, JS::Handle<js::AsyncFunction` 1; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 110 ms: buckets subprocess_pipe_io 110, worker_messaging 110, ipc 110, js_ctypes 110, poll_wait 110, array_buffer_copy 0; top self: `poll [libc.so.6]` 110; `js::TypedArrayObject::ensureHasBuffer(JSContext*, ` 0; `[unknown]` 0
- **tab:3958** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::GetCpuTimeSinceProcessStartInMs(unsigned long*) [li` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 380, DOM Worker 299, BgPool 196, Renderer 172, SwComposite 128, WRRenderBackend 52, Compositor 40, other 35, ImageBridge 17, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 380 ms (12.0% of span): Idle 258, JavaScript 59, Other 36, DOM 12, Profiler 12, GC / CC 3
  - JS leaf 6 / native under JS 66 / native 309; buckets: ipc 380, poll_wait 279, gc_cc 65, engine_stream_read 32, worker_messaging 28, harness_diagnostics 14, json_metadata 13, native_receiver 13
  - top self: `poll [libc.so.6]` 260; `[unknown]` 9; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 171 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 107, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `void scale_blit<true>(Texture&, IntRect const&, Te` 11); SwComposite 128 ms (top self: `syscall [libc.so.6]` 105, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 11); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 2, `webrender::tile_cache::TileCacheInstance::update_p` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 195 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 134, `__memmove_avx_unaligned_erms [libc.so.6]` 56, `mozilla::layers::ImageContainer::SetCurrentImages(` 1); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__lll_lock_wake [libc.so.6]` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 1 ms (top self: `write [libc.so.6]` 1, `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 299 ms: buckets subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 282, poll_wait 276, gc_cc 4; top self: `poll [libc.so.6]` 276; `write [libc.so.6]` 2; `[axiosozo-dev]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3830** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3541** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: main 330, DOM Worker 295, BgPool 192, Renderer 164, SwComposite 125, WRRenderBackend 51, Compositor 41, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 330 ms (10.7% of span): Idle 138, GC / CC 88, JavaScript 72, Other 19, DOM 10, Profiler 2
  - JS leaf 7 / native under JS 71 / native 251; buckets: ipc 330, gc_cc 167, poll_wait 151, worker_messaging 52, engine_stream_read 38, json_metadata 27, subprocess_pipe_io 17, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 141; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `mprotect [libc.so.6]` 9; `[unknown]` 7; `write [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5
  - GC/CC markers: GCMajor 2× 128 ms, GCSlice 15× 67 ms, CCSlice 2× 18 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 164 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 41, `void scale_blit<true>(Texture&, IntRect const&, Te` 11); SwComposite 125 ms (top self: `syscall [libc.so.6]` 102, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 192 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 114, `__memmove_avx_unaligned_erms [libc.so.6]` 70, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `mozilla::ipc::MessagePumpForNonMainThreads::Run(ba` 0, `__lll_lock_wake [libc.so.6]` 0); BackgroundThreadPool #5 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 295 ms: buckets subprocess_pipe_io 295, worker_messaging 295, ipc 295, js_ctypes 275, poll_wait 270, gc_cc 9; top self: `poll [libc.so.6]` 270; `[axiosozo-dev]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:3830** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[libstdc++.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3559** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 512, DOM Worker 301, BgPool 191, Renderer 115, SwComposite 76, WRRenderBackend 39, Compositor 28, other 23, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 512 ms (23.9% of span): Idle 282, JavaScript 87, Other 70, Graphics 27, DOM 19, Layout 13
  - JS leaf 7 / native under JS 92 / native 413; buckets: ipc 512, poll_wait 379, gc_cc 88, paint_layout 65, worker_messaging 55, json_metadata 22, engine_stream_read 22, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 289; `recvmsg [libc.so.6]` 10; `mprotect [libc.so.6]` 10; `[unknown]` 10; `[axiosozo-dev]` 9; `write [libc.so.6]` 6
  - GC/CC markers: GCMinor 2× 6 ms
  - WebRender/compositor threads: Renderer 115 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 67, `__memmove_avx_unaligned_erms [libc.so.6]` 24, `syscall [libc.so.6]` 13); SwComposite 76 ms (top self: `syscall [libc.so.6]` 72, `void scale_blit<true>(Texture&, IntRect const&, Te` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 4, `webrender::render_backend::RenderBackend::process_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 191 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 122, `__memmove_avx_unaligned_erms [libc.so.6]` 60, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[libstdc++.so.6]` 0, `mozilla::layers::TextureClientRecycleAllocator::Re` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 301 ms: buckets subprocess_pipe_io 301, worker_messaging 301, ipc 301, js_ctypes 262, poll_wait 254, gc_cc 14; top self: `poll [libc.so.6]` 254; `[axiosozo-dev]` 4; `__lll_lock_wait [libc.so.6]` 2; `NS_IsMainThread [libxul.so]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2
- **tab:3472** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.5% of span): GC / CC 9, Idle 1
  - JS leaf 0 / native under JS 0 / native 10; buckets: gc_cc 9, ipc 8, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 6; `__lll_lock_wake [libc.so.6]` 1; `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `void js::gc::MarkingTracerT<1u>::markAndTraverse<JS::Symbol>` 1
  - GC/CC markers: GCMajor 1× 67 ms, GCSlice 2× 18 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3541** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 381, DOM Worker 258, Renderer 113, SwComposite 43, other 35, BgPool 19, WRRenderBackend 16, Compositor 15, WRWorker 11, WRSceneBuilder 9, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 381 ms (10.3% of span): Idle 162, JavaScript 80, Layout 41, Other 37, Graphics 32, DOM 21
  - JS leaf 7 / native under JS 136 / native 239; buckets: ipc 381, poll_wait 201, gc_cc 93, paint_layout 80, worker_messaging 69, engine_stream_read 36, subprocess_pipe_io 22, array_buffer_copy 19
  - top self: `poll [libc.so.6]` 163; `[unknown]` 11; `[axiosozo-dev]` 8; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 6; `mprotect [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 113 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 48, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 8); SwComposite 43 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 22, `syscall [libc.so.6]` 19, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 2, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `write [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::layers::ImageBridgeChild::UpdateImageClie` 0, `unsigned int mozilla::ProfileBufferEntryWriter::Su` 0); BgIOThreadPool #2 0 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 244, poll_wait 240, gc_cc 7; top self: `poll [libc.so.6]` 240; `[axiosozo-dev]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:3472** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `write [libc.so.6]` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `bool js::FillArgumentsFromArraylike<js::InvokeArgs, JS::Call` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 78, DOM Worker 63, Renderer 58, BgPool 9, IPC I/O 6, Compositor 6, SwComposite 4, WRRenderBackend 3, WRSceneBuilder 3, other 2, Socket 2, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 77 ms (0.5% of span): Layout 19, Idle 17, JavaScript 15, Graphics 9, Other 8, GC / CC 5
  - JS leaf 2 / native under JS 25 / native 50; buckets: ipc 77, paint_layout 29, poll_wait 18, gc_cc 13, array_buffer_copy 11, harness_diagnostics 11, memcpy_memset 5, worker_messaging 4
  - top self: `poll [libc.so.6]` 17; `madvise [libc.so.6]` 3; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame co` 3; `core::ptr::drop_in_place<style::values::generics::color::Gen` 3; `mozilla::StyleGenericInset<mozilla::StylePercentage, mozilla` 2; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTA` 2
  - GC/CC markers: CCSlice 1× 4 ms, GCMinor 3× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 17, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 6); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `mozilla::layers::AsyncPanZoomController::GetCurren` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 9 ms (top self: `unlink [libc.so.6]` 7, `fstatat64 [libc.so.6]` 1, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `syscall [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 63 ms: buckets subprocess_pipe_io 63, worker_messaging 62, ipc 62, gc_cc 51, poll_wait 12, js_ctypes 12; top self: `poll [libc.so.6]` 10; `[axiosozo-dev]` 8; `madvise [libc.so.6]` 5; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3
- **tab:3559** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 4, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::jit::CanIonCompileScript(JSContext*, JSScript*) [libxul.` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3825** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 3, Graphics 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFra` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 0; `mozilla::ProfileChunkedBuffer::~ProfileChunkedBuffer() [libx` 0; `nsGlobalWindowInner::GetRelevantGlobal() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `TimerThread::Init() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## gecko-debian (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.3 | **6.5** (main 2.5, Renderer 1.0, DOM Worker 1.0, glean.dispatche 0.5, Softwar~cThread 0.5) | Web Content 3.5, Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.3 | **24.4** (Renderer 13.9, WRRende~ckend# 2.3, main 1.7, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.6, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.6** (Renderer 9.0, WRRende~ckend# 1.7, main 1.3, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.4, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **39.7** (Renderer 26.2, main 4.0, WRRende~ckend# 3.5, SwComposite 2.5, glean.dispatche 1.0) | Isolated Web Co 4.0, Web Content 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.0** (main 4.6, Renderer 1.3, TaskCon~ller # 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.1 | **3.5** (SamplerThread 2.5, main 0.5, Softwar~cThread 0.5) | Web Content 5.4, Isolated Web Co 2.5, Privileged Cont 1.5, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **26.6** (Renderer 9.6, SamplerThread 4.9, main 2.3, WRRende~ckend# 2.3, WRScene~ilder# 1.6) | Isolated Web Co 8.9, Web Content 5.9, WebExtensions 1.3, Privileged Cont 1.3 | — | — |
| profile | raf-nosampler | — | — | **25.4** (Renderer 10.6, SamplerThread 4.7, WRScene~ilder# 2.0, WRRende~ckend# 2.0, main 1.7) | Isolated Web Co 8.0, Web Content 6.3, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | scroll | 59.0 | 17.3 | **155.2** (DOM Worker 33.6, Renderer 32.1, main 26.5, Indexed~ IO # 25.0, IPDL Background 11.0) | Isolated Web Co 8.0, Web Content 7.0, Privileged Cont 1.5, Socket Process 1.0 | — | — |
| profile | key | — | — | **23.2** (main 9.6, SamplerThread 4.0, DOM Worker 2.4, IPDL Background 1.1, Renderer 1.1) | Web Content 5.9, Isolated Web Co 3.7, WebExtensions 1.9, Privileged Cont 1.6 | 7.5 | — |

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

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: main 9, IPC I/O 1, Compositor 1, Renderer 1, Socket 1, SwComposite 0, WRSceneBuilder 0, WRRenderBackend 0, other 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 9 ms (0.4% of span): JavaScript 4, Idle 4, Graphics 1, Other 0
  - JS leaf 0 / native under JS 3 / native 6; buckets: ipc 9, poll_wait 4, gc_cc 3, harness_diagnostics 3, array_buffer_copy 1, paint_layout 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1; `js::gc::BufferAllocator::bumpAlloc(unsigned long, unsigned l` 1; `js::jit::ExecutableAllocator::poolForSize(unsigned long) [li` 1; `nsINode::GetFlattenedTreeParentNodeForStyle() const [libxul.` 1; `mprotect [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 0 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 0, `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8325** CPU ms by thread group: main 27, IPC I/O 4, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 27 ms (1.3% of span): Idle 15, GC / CC 5, JavaScript 3, Profiler 2, Other 1, Layout 0
  - JS leaf 0 / native under JS 3 / native 23; buckets: ipc 24, poll_wait 16, gc_cc 7, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 15; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::gc::AtomRefRuntime::recordRefToId(JSContext*, JS::Proper` 1; `js::ScriptSource::setFilename(js::FrontendContext*, std::uni` 1
  - GC/CC markers: GCMajor 1× 25 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8419** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8357** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 292, WRRenderBackend 62, main 56, WRSceneBuilder 51, Compositor 41, SwComposite 23, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 56 ms (1.8% of span): GC / CC 26, Idle 18, Other 3, JavaScript 3, Layout 3, Graphics 2
  - JS leaf 0 / native under JS 3 / native 52; buckets: ipc 55, gc_cc 27, poll_wait 19, paint_layout 5, harness_diagnostics 3, subprocess_pipe_io 1, array_buffer_copy 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::GCMarker::updateRangesAtStartOfSlice() [libxul.so]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `mprotect [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 291 ms (top self: `__syscall_cancel_arch [libc.so.6]` 100, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 67, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 34); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 5, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); WRSceneBuilder#0 46 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8325** CPU ms by thread group: main 166, IPC I/O 14, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 166 ms (5.4% of span): Idle 108, Graphics 16, Layout 13, Other 10, GC / CC 7, JavaScript 5
  - JS leaf 0 / native under JS 9 / native 157; buckets: ipc 160, poll_wait 109, paint_layout 41, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 112; `[]` 2; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul` 2; `getcontext [libc.so.6]` 1; `mozilla::ipc::PortLink::SendMessage(std::unique_ptr<IPC::Mes` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 11 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8262** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8416** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 295, WRRenderBackend 58, WRSceneBuilder 49, main 44, Compositor 40, SwComposite 15, IPC I/O 9, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 44 ms (1.4% of span): GC / CC 26, Idle 11, Other 3, JavaScript 3, Profiler 1
  - JS leaf 0 / native under JS 3 / native 41; buckets: ipc 43, gc_cc 29, poll_wait 11, harness_diagnostics 2, array_buffer_copy 2, subprocess_pipe_io 0, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 22 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 295 ms (top self: `__syscall_cancel_arch [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 70, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 35); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 3, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 44 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8325** CPU ms by thread group: main 146, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 146 ms (4.8% of span): Idle 102, Graphics 14, Layout 10, Other 8, Profiler 5, GC / CC 4
  - JS leaf 0 / native under JS 4 / native 142; buckets: ipc 139, poll_wait 106, paint_layout 32, gc_cc 5, memcpy_memset 1, canvas_2d 1, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 107; `[]` 2; `nsIFrame::IsTransformed() const [libxul.so]` 1; `mozilla::EffectSet::GetForFrame(nsIFrame const*, nsCSSProper` 1; `__lll_lock_wait [libc.so.6]` 1; `bool TraversalTracer::onEdge<js::Scope>(js::Scope**, char co` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8221** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8416** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: DOM Worker 642, Renderer 620, main 506, WRRenderBackend 73, SwComposite 51, Compositor 28, WRSceneBuilder 24, Socket 13, BgPool 10, IPC I/O 7, other 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 506 ms (25.2% of span): Idle 161, JavaScript 139, DOM 104, Other 66, Graphics 8, Profiler 8
  - JS leaf 20 / native under JS 192 / native 294; buckets: ipc 505, gc_cc 218, poll_wait 196, array_buffer_copy 98, memcpy_memset 21, paint_layout 14, worker_messaging 11, harness_diagnostics 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 181; `[unknown]` 23; `[axiosozo-dev]` 21; `__memmove_evex_unaligned_erms [libc.so.6]` 10; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8
  - GC/CC markers: GCMinor 6× 8 ms
  - WebRender/compositor threads: Renderer 620 ms (top self: `__syscall_cancel_arch [libc.so.6]` 169, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 154, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 76); WRRenderBackend#0 73 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 5, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2); SwComposite 51 ms (top self: `syscall [libc.so.6]` 47, `__memmove_evex_unaligned_erms [libc.so.6]` 4, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `[libfreeblpriv3.so]` 0); BgIOThreadPool #1 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `rename [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 640 ms: buckets worker_messaging 637, ipc 634, poll_wait 263, gc_cc 111, array_buffer_copy 68, memcpy_memset 21; top self: `__syscall_cancel_arch [libc.so.6]` 258; `[unknown]` 75; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 29; `jsesc (resource://gre/modules/third_party/jsesc/js` 24; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 17
- **tab:8325** CPU ms by thread group: main 89, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 89 ms (4.4% of span): Idle 61, Graphics 14, Other 8, JavaScript 3, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 2 / native 87; buckets: ipc 83, poll_wait 61, paint_layout 17, gc_cc 2, harness_diagnostics 2, canvas_2d 1, array_buffer_copy 1, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 61; `[]` 3; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const ` 1; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayL` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8262** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8157** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 344, DOM Worker 87, Renderer 39, Compositor 20, WRRenderBackend 19, WRSceneBuilder 15, Socket 9, IPC I/O 8, SwComposite 6, other 2, BgPool 2, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 344 ms (9.2% of span): Idle 75, GC / CC 60, JavaScript 59, Other 55, Layout 37, Graphics 27
  - JS leaf 9 / native under JS 63 / native 273; buckets: ipc 342, gc_cc 119, poll_wait 112, paint_layout 69, memcpy_memset 11, array_buffer_copy 8, subprocess_pipe_io 6, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 99; `[axiosozo-dev]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 8; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 6; `__memmove_evex_unaligned_erms [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 89 ms, GCSlice 26× 34 ms, CCSlice 2× 26 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 39 ms (top self: `__syscall_cancel_arch [libc.so.6]` 26, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 18, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 86 ms: buckets worker_messaging 84, ipc 84, gc_cc 59, poll_wait 23, memcpy_memset 22, array_buffer_copy 8; top self: `__syscall_cancel_arch [libc.so.6]` 22; `madvise [libc.so.6]` 16; `unsigned long js::gc::Arena::finalize<JSString, (j` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__memset_evex_unaligned [libc.so.6]` 3
- **tab:8325** CPU ms by thread group: main 70, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 70 ms (1.9% of span): Idle 27, Other 12, GC / CC 8, Graphics 8, JavaScript 6, Layout 4
  - JS leaf 0 / native under JS 7 / native 63; buckets: ipc 66, poll_wait 28, paint_layout 17, gc_cc 11, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 2, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 30; `[]` 2; `non-virtual thunk to nsGlobalWindowInner::Release() [libxul.` 1; `js::Proxy::getPrototype(JSContext*, JS::Handle<JSObject*>, J` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 4 ms, GCSlice 3× 4 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8157** CPU ms by thread group: main 8, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 8, DOM 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, poll_wait 8, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8262** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **41.7** (Renderer 23.2, main 13.9, SwComposite 4.6) | WPEWebProcess 65.0, AxioWebKitHost 9.3, WPENetworkProce 9.3 | — | 193.4 |
| plain | idle | — | — | **5.9** (main 4.4, Timer 0.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.4 | — | — |
| plain | raf | 57.9 | 26.5 | **23.9** (main 9.6, DOM Worker 3.0, Renderer 2.3, Backgro~Pool # 2.0, TaskCon~ller # 1.3) | WPEWebProcess 54.0, AxioWebKitHost 6.3, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.3** (main 4.3, Renderer 2.7, DOM Worker 2.7, Backgro~Pool # 2.3, SwComposite 1.3) | WPEWebProcess 54.8, AxioWebKitHost 6.7, Privileged Cont 0.6 | — | — |
| plain | scroll | 56.8 | 29.8 | **36.9** (main 17.9, DOM Worker 6.5, Backgro~Pool # 3.0, Renderer 2.5, TaskCon~ller # 2.0) | WPEWebProcess 63.3, AxioWebKitHost 9.5 | — | — |
| plain | key | — | — | **14.9** (main 8.0, Renderer 1.4, DOM Worker 1.1, SwComposite 0.8, glean.dispatche 0.6) | WPEWebProcess 8.1, AxioWebKitHost 2.3, WebExtensions 0.3 | 17.3 | — |
| plain | switch-to-gecko | — | — | **22.0** (main 8.8, Timer 4.4, Renderer 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 210.1 |
| profile | switch-to-engine | — | — | **29.7** (main 8.9, DOM Worker 8.9, SamplerThread 5.9, Socket Thread 3.0, Renderer 3.0) | Web Content 65.0, WPEWebProcess 62.1, WPENetworkProce 8.9, AxioWebKitHost 5.9 | — | 311.5 |
| profile | idle | — | — | **24.8** (main 9.2, DOM Worker 6.8, SamplerThread 6.8, Timer 1.0, glean.dispatche 0.5) | Web Content 4.4, WebExtensions 1.5, Socket Process 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 57.8 | 21.5 | **49.8** (main 14.7, DOM Worker 11.5, SamplerThread 9.2, Renderer 2.6, Backgro~Pool # 2.6) | WPEWebProcess 58.5, Web Content 7.2, AxioWebKitHost 7.2, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **39.5** (DOM Worker 10.0, SamplerThread 8.0, main 7.3, Renderer 3.3, Backgro~Pool # 2.7) | WPEWebProcess 57.0, Web Content 6.6, AxioWebKitHost 6.6, WebExtensions 1.3 | — | — |
| profile | scroll | 56.3 | 34.2 | **66.4** (main 24.9, DOM Worker 15.5, SamplerThread 9.0, Backgro~Pool # 4.0, TaskCon~ller # 2.5) | WPEWebProcess 57.4, AxioWebKitHost 8.0, Web Content 6.0, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **37.8** (main 13.8, DOM Worker 8.3, SamplerThread 8.0, Renderer 1.7, Timer 1.4) | WPEWebProcess 6.9, Web Content 6.6, WebExtensions 2.0, AxioWebKitHost 1.7 | 17.9 | — |
| profile | switch-to-gecko | — | — | **46.3** (main 16.9, DOM Worker 8.4, SamplerThread 8.4, Renderer 4.2, WRScene~ilder# 4.2) | Web Content 4.2 | — | 216.8 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 5.7 | 0.0 | 0 | 0.0 | — | — | 92.9 | 0.0 | — | 1.51 | 0.66 | — | — | — | — | — | 0.004 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.16 | 0.14 | — | — | — | — | — | 0.010 |
| profile | scroll | 54.5 | 0.0 | 0 | 0.0 | — | — | 12.7 | 0.0 | — | 0.38 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.1 | 0.0 | — | 0.12 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.981 | 0.876 | 0.0086 | 0.0077 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 176 | 0.035 | 0.301 | 0.0020 | 0.0174 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.058 | 0.298 | 0.0034 | 0.0174 |
| plain | scroll | memfd | native | 111 | 111 | 0.235 | 0.318 | 0.0129 | 0.0175 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.436 | 0.0000 | 0.0024 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.017 | 0.891 | 0.0057 | 0.0050 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.050 | 0.365 | 0.0029 | 0.0211 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.063 | 0.363 | 0.0036 | 0.0210 |
| profile | scroll | memfd | native | 110 | 110 | 0.252 | 0.337 | 0.0137 | 0.0184 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.471 | 0.0000 | 0.0026 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 15.6 | 0.1 | — | 0.12 | 0.40 | — | — | 8.2 | 17.1 | 24.3 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 23.8; first stdout read resolved 29.3; first frame applied (native receiver) 320.0; write frame_ack 321.1; write visibility 327.8; write focus 328.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 20.2; first stdout read resolved 30.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 37, DOM Worker 23, Renderer 8, BgPool 4, IPC I/O 2, Compositor 2, WRRenderBackend 2, WRSceneBuilder 1, SwComposite 1, Socket 1, WRWorker 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 37 ms (10.4% of span): JavaScript 15, Layout 6, Idle 5, DOM 5, Other 3, Profiler 2
  - JS leaf 0 / native under JS 24 / native 13; buckets: ipc 37, gc_cc 20, array_buffer_copy 11, paint_layout 9, harness_diagnostics 9, poll_wait 6, engine_stream_read 6, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `nsBlockFrame::ReflowBlockFrame(mozilla::BlockReflowState&, G` 2; `js::frontend::BytecodeEmitter::updateSourceCoordNotes(unsign` 2; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifI` 2; `v8::internal::ExternalReference::TopOfRegexpStack(v8::intern` 2; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 7 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 1, `__syscall_cancel_arch [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0, `webrender::prepare::prepare_prim_for_render [libxu` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__memset_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 23 ms: buckets subprocess_pipe_io 23, worker_messaging 23, ipc 23, js_ctypes 22, poll_wait 20; top self: `__syscall_cancel_arch [libc.so.6]` 22; `[axiosozo-dev]` 1
- **tab:7735** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (16.8% of span): Other 36, JavaScript 5, Profiler 3, DOM 3, Idle 1
  - JS leaf 1 / native under JS 3 / native 44; buckets: ipc 38, array_buffer_copy 17, gc_cc 10, subprocess_pipe_io 3, poll_wait 2, memcpy_memset 2, canvas_2d 1
  - top self: `[]` 6; `__syscall_cancel_arch [libc.so.6]` 4; `js::SharedPropMap::addPropertyInternal(JSContext*, JS::Mutab` 3; `mmap64 [libc.so.6]` 2; `[libexpat.so.1]` 2; `access [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7741** CPU ms by thread group: main 45, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (17.5% of span): Other 33, Profiler 4, DOM 3, JavaScript 3, Idle 2
  - JS leaf 0 / native under JS 4 / native 41; buckets: ipc 33, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 4, poll_wait 3, memcpy_memset 2, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 2; `[libfontconfig.so.1]` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7593** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 1, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `g_poll [libglib-2.0.so.0]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 173, DOM Worker 85, other 16, Compositor 1, Socket 1, IPC I/O 1, Renderer 0, BgPool 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 173 ms (8.4% of span): Idle 113, JavaScript 26, DOM 21, Other 9, Profiler 3, Graphics 1
  - JS leaf 0 / native under JS 38 / native 134; buckets: ipc 173, poll_wait 118, gc_cc 24, array_buffer_copy 16, harness_diagnostics 16, engine_stream_read 4, worker_messaging 2, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `js::AbstractGeneratorObject::resume(JSContext*, js::Interpre` 2
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `webrender::clip::ClipStore::build_clip_chain_insta` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 81 ms: buckets subprocess_pipe_io 81, js_ctypes 81, worker_messaging 81, ipc 81, poll_wait 81, memcpy_memset 0; top self: `__syscall_cancel_arch [libc.so.6]` 81; `moz_arena_calloc [axiosozo-dev]` 0; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 0
- **tab:7380** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7285** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 433, DOM Worker 271, Renderer 80, BgPool 76, SwComposite 42, WRRenderBackend 41, Compositor 34, other 26, ImageBridge 14, WRSceneBuilder 7, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 433 ms (14.1% of span): Idle 275, JavaScript 67, Other 33, GC / CC 26, DOM 23, Profiler 7
  - JS leaf 9 / native under JS 81 / native 342; buckets: ipc 432, poll_wait 289, gc_cc 86, engine_stream_read 45, harness_diagnostics 38, worker_messaging 34, subprocess_pipe_io 16, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 285; `[unknown]` 14; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 7; `[axiosozo-dev]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 581 ms, GCSlice 7× 25 ms, GCMinor 2× 7 ms
  - WebRender/compositor threads: Renderer 80 ms (top self: `__syscall_cancel_arch [libc.so.6]` 64, `__memmove_evex_unaligned_erms [libc.so.6]` 6, `syscall [libc.so.6]` 5); SwComposite 42 ms (top self: `syscall [libc.so.6]` 39, `__memmove_evex_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 41 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 76 ms (top self: `__syscall_cancel_arch [libc.so.6]` 67, `__memmove_evex_unaligned_erms [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `[linux-vdso.so.1]` 0, `__lll_lock_wake [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 228 ms: buckets subprocess_pipe_io 228, worker_messaging 228, ipc 228, js_ctypes 211, poll_wait 205, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 206; `[unknown]` 3; `[axiosozo-dev]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1; `mozilla::net::SSLTokensCacheService::Release() [li` 1
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7361** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 219, main 210, Renderer 77, BgPool 76, SwComposite 40, WRRenderBackend 38, Compositor 34, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 210 ms (6.9% of span): Idle 105, JavaScript 46, GC / CC 30, Other 19, DOM 7, Profiler 3
  - JS leaf 6 / native under JS 45 / native 159; buckets: ipc 210, poll_wait 116, gc_cc 79, engine_stream_read 40, worker_messaging 28, subprocess_pipe_io 12, native_receiver 7, array_buffer_copy 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::jit::BaselineCacheIRCompiler::compile() [libxul.so]` 3; `syscall [libc.so.6]` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 28 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 77 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_evex_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 4); SwComposite 40 ms (top self: `syscall [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 76 ms (top self: `__syscall_cancel_arch [libc.so.6]` 62, `__memmove_evex_unaligned_erms [libc.so.6]` 13, `nsThreadPool::Run() [libxul.so]` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[axiosozo-dev]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 216 ms: buckets subprocess_pipe_io 216, worker_messaging 216, ipc 216, js_ctypes 194, poll_wait 187, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 188; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7380** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 461, DOM Worker 264, BgPool 66, Renderer 46, WRRenderBackend 24, SwComposite 23, Compositor 20, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 461 ms (22.9% of span): Idle 253, JavaScript 78, Other 51, GC / CC 33, DOM 24, Profiler 9
  - JS leaf 7 / native under JS 89 / native 365; buckets: ipc 459, poll_wait 296, gc_cc 111, engine_stream_read 59, worker_messaging 41, paint_layout 29, harness_diagnostics 26, array_buffer_copy 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 276; `[unknown]` 20; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 791 ms, GCSlice 7× 28 ms, CCSlice 2× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 46 ms (top self: `__syscall_cancel_arch [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `syscall [libc.so.6]` 1); WRRenderBackend#0 24 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 23 ms (top self: `syscall [libc.so.6]` 23, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 66 ms (top self: `__syscall_cancel_arch [libc.so.6]` 54, `__memmove_evex_unaligned_erms [libc.so.6]` 11, `[linux-vdso.so.1]` 1); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `mojo::core::ports::Node::PrepareToForwardUserMessa` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 263 ms: buckets subprocess_pipe_io 263, worker_messaging 262, ipc 262, js_ctypes 180, poll_wait 170, gc_cc 54; top self: `__syscall_cancel_arch [libc.so.6]` 171; `[axiosozo-dev]` 8; `__memset_evex_unaligned_erms [libc.so.6]` 7; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 7; `madvise [libc.so.6]` 7
- **tab:7599** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7339** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 461, DOM Worker 188, Renderer 54, other 26, SwComposite 26, Compositor 16, WRRenderBackend 15, WRWorker 10, BgPool 10, WRSceneBuilder 9, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 461 ms (12.6% of span): Idle 212, JavaScript 67, Other 42, GC / CC 38, DOM 33, Layout 31
  - JS leaf 8 / native under JS 121 / native 332; buckets: ipc 459, poll_wait 258, gc_cc 115, paint_layout 71, engine_stream_read 56, worker_messaging 55, harness_diagnostics 22, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 230; `[unknown]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 9; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 6
  - GC/CC markers: GCMajor 1× 1053 ms, GCSlice 8× 31 ms, CCSlice 2× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 54 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 4); SwComposite 26 ms (top self: `syscall [libc.so.6]` 15, `__memmove_evex_unaligned_erms [libc.so.6]` 9, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `<webrender::frame_allocator::FrameAllocator as all` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__memmove_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 187 ms: buckets subprocess_pipe_io 187, worker_messaging 187, ipc 187, js_ctypes 175, poll_wait 172, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 172; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 2; `[unknown]` 2; `[axiosozo-dev]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1
- **tab:7285** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `g_source_ref [libglib-2.0.so.0]` 1; `nsArrayCC::AddRef() [libxul.so]` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7599** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 17, DOM Worker 14, BgPool 6, Compositor 3, WRSceneBuilder 2, WRRenderBackend 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 66 ms (23.7% of span): JavaScript 24, Layout 11, Other 10, DOM 10, Idle 5, Graphics 4
  - JS leaf 5 / native under JS 36 / native 26; buckets: ipc 66, paint_layout 15, array_buffer_copy 13, harness_diagnostics 13, gc_cc 12, poll_wait 10, subprocess_pipe_io 5, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `mozilla::TaskController::MaybeInterruptTask(mozilla::Task*, ` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `next (self-hosted:392:27)[25]` 3; `mozilla::TimingParams::FromEffectTiming(mozilla::dom::Effect` 2; `mozilla::ScrollContainerFrame::ComputeScrolledRect(nsIFrame ` 2
  - WebRender/compositor threads: Renderer 17 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 2, `hypotf@@GLIBC_2.35 [libm.so.6]` 2); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `<core::iter::adapters::map::Map<I,F> as core::iter` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 6 ms (top self: `rmdir [libc.so.6]` 3, `unlink [libc.so.6]` 2, `fstatat64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `syscall [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, poll_wait 13, js_ctypes 13; top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::Interpret(JSContext*, js::RunState&) [libxul.s` 1; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::V` 0; `mozilla::ProfileBufferBlockIndex profiler_add_mark` 0
- **tab:7593** CPU ms by thread group: main 25, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (9.1% of span): JavaScript 7, Other 7, Idle 5, Layout 3, DOM 2, Profiler 1
  - JS leaf 1 / native under JS 8 / native 16; buckets: ipc 21, gc_cc 7, poll_wait 5, subprocess_pipe_io 5, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7285** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 3, JavaScript 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[]` 0; `js::SavedStacks::getLocation(JSContext*, js::FrameIter const` 0; `AddPromiseReaction(JSContext*, JS::Handle<js::PromiseObject*` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7735** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **59.7** (Renderer 25.5, main 21.3, WRRende~ckend# 4.3, SwComposite 4.3, DOM Worker 4.3) | WPEWebProcess 68.0, AxioWebKitHost 8.5, WPENetworkProce 8.5 | — | 207.1 |
| plain | idle | — | — | **5.4** (main 4.4, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 4.4, forkserver 0.5, AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 23.9 | **40.9** (main 11.8, Backgro~Pool # 9.5, Renderer 6.9, SwComposite 3.9, DOM Worker 3.9) | WPEWebProcess 190.1, AxioWebKitHost 26.9, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **47.5** (main 9.3, Backgro~Pool # 8.3, Renderer 6.3, Socket Thread 4.7, SwComposite 4.3) | WPEWebProcess 186.7, AxioWebKitHost 22.9 | — | — |
| plain | scroll | 55.5 | 35.5 | **55.1** (main 20.1, Backgro~Pool # 11.3, DOM Worker 7.9, Renderer 6.4, SwComposite 2.9) | WPEWebProcess 193.5, AxioWebKitHost 24.6 | — | — |
| plain | key | — | — | **30.2** (main 12.0, DOM Worker 4.9, Renderer 3.0, Indexed~ IO # 2.7, SwComposite 1.9) | WPEWebProcess 18.9, AxioWebKitHost 3.3 | 27.7 | — |
| plain | switch-to-gecko | — | — | **131.1** (DOM Worker 38.1, Indexed~ IO # 33.8, main 25.4, Renderer 16.9, IPDL Background 8.5) | Isolated Web Co 4.2 | — | 213.1 |
| profile | switch-to-engine | — | — | **46.2** (main 13.2, DOM Worker 13.2, SamplerThread 9.9, Softwar~cThread 3.3, Compositor 3.3) | WPEWebProcess 66.1, Web Content 29.7, WPENetworkProce 9.9, AxioWebKitHost 6.6 | — | 278.2 |
| profile | idle | — | — | **35.2** (main 13.2, DOM Worker 8.8, SamplerThread 7.3, TaskCon~ller # 4.4, Timer 1.5) | Web Content 5.4, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 58.0 | 25.5 | **59.3** (main 14.3, DOM Worker 9.8, Backgro~Pool # 8.8, SamplerThread 8.1, Renderer 6.5) | WPEWebProcess 182.7, AxioWebKitHost 20.8, Web Content 6.5, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **49.9** (DOM Worker 10.0, Backgro~Pool # 8.6, SamplerThread 7.6, main 7.3, Renderer 7.0) | WPEWebProcess 181.9, AxioWebKitHost 21.7, Web Content 6.0, WebExtensions 1.3 | — | — |
| profile | scroll | 55.6 | 35.8 | **74.1** (main 25.0, DOM Worker 14.7, Backgro~Pool # 11.3, SamplerThread 7.3, Renderer 6.4) | WPEWebProcess 192.5, AxioWebKitHost 23.1, Web Content 6.4, Isolated Web Co 1.5 | — | — |
| profile | key | — | — | **40.2** (main 13.4, DOM Worker 7.9, SamplerThread 7.9, Renderer 3.6, SwComposite 2.2) | WPEWebProcess 18.6, Web Content 6.8, AxioWebKitHost 3.1, WebExtensions 1.7 | 30.5 | — |
| profile | switch-to-gecko | — | — | **45.9** (main 12.5, Renderer 8.3, SamplerThread 8.3, Compositor 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 8.3 | — | 217.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 6.2 | 0.0 | 0 | 0.0 | — | — | 73.8 | 0.0 | — | 3.04 | 0.68 | — | — | — | — | — | 0.004 |
| profile | raf | 58.0 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.46 | 0.15 | — | — | — | — | — | 0.012 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.45 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 53.5 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 1.37 | 0.15 | — | — | — | — | — | 0.014 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.17 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.225 | 3.033 | 0.0177 | 0.0242 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.363 | 1.238 | 0.0210 | 0.0716 |
| plain | raf-nosampler | memfd | native | 173 | 173 | 0.377 | 1.262 | 0.0214 | 0.0719 |
| plain | scroll | memfd | native | 110 | 110 | 1.078 | 1.266 | 0.0579 | 0.0680 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 1.191 | 0.0000 | 0.0065 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.264 | 3.075 | 0.0141 | 0.0192 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.327 | 1.294 | 0.0190 | 0.0751 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.330 | 1.237 | 0.0190 | 0.0715 |
| profile | scroll | memfd | native | 110 | 110 | 1.172 | 1.793 | 0.0628 | 0.0960 |
| profile | key | memfd | native | 20 | 20 | 0.004 | 1.389 | 0.0000 | 0.0076 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 26.7 | 0.0 | — | 0.17 | 0.52 | — | — | 157.9 | 27.7 | 188.9 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 30.6; first stdout read resolved 38.7; first frame applied (native receiver) 289.0; write frame_ack 290.2; write visibility 298.8; write focus 299.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 20.4; first stdout read resolved 29.3

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 41, DOM Worker 24, BgPool 10, Compositor 4, Renderer 4, SwComposite 2, IPC I/O 2, WRSceneBuilder 2, WRRenderBackend 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 41 ms (13.0% of span): JavaScript 19, Idle 6, DOM 6, Layout 5, Graphics 3, Other 1
  - JS leaf 3 / native under JS 26 / native 12; buckets: ipc 41, gc_cc 21, paint_layout 12, harness_diagnostics 10, array_buffer_copy 10, poll_wait 8, engine_stream_read 6, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGene` 3; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 2; `js::GetOwnPropertyDescriptor(JSContext*, JS::Handle<JSObject` 2; `mozilla::dom::ChromeUtils::AddProfilerMarker(mozilla::dom::G` 2; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 2
  - WebRender/compositor threads: Renderer 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3); WRSceneBuilder#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build_ite` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 10 ms (top self: `ARGBSetRow_X86 [libxul.so]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) ` 0)
  - busiest DOM Worker 24 ms: buckets subprocess_pipe_io 24, worker_messaging 24, ipc 24, js_ctypes 23, poll_wait 22; top self: `__syscall_cancel_arch [libc.so.6]` 22; `[unknown]` 1; `js::ctypes::ConvertArgument(JSContext*, JS::Handle` 0; `js::ctypes::StructType::LookupField(JSContext*, JS` 0; `mozilla::detail::MutexImpl::unlock() [axiosozo-dev` 0
- **tab:9229** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 48 ms (15.0% of span): Other 38, JavaScript 4, DOM 3, Idle 1, GC / CC 1, Profiler 0
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 37, array_buffer_copy 15, gc_cc 13, subprocess_pipe_io 4, poll_wait 2, image_container 1, memcpy_memset 1
  - top self: `[libexpat.so.1]` 3; `__strlen_evex [libc.so.6]` 2; `[]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2; `__syscall_cancel_arch [libc.so.6]` 2; `[libssl3.so]` 2
  - GC/CC markers: GCMinor 1× 5 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9235** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (14.8% of span): Other 39, JavaScript 4, DOM 2, Profiler 2, Idle 0
  - JS leaf 1 / native under JS 3 / native 43; buckets: ipc 35, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 4, memcpy_memset 3, poll_wait 1, canvas_2d 1
  - top self: `__strcmp_evex [libc.so.6]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `uhash_compareUChars_78 [libxul.so]` 2; `[]` 2; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9079** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 1, Graphics 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsBlockFrame::GetChildList(mozilla::FrameChildListID) const ` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 252, DOM Worker 124, other 16, Compositor 2, Renderer 1, BgPool 1, SwComposite 1, Socket 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 252 ms (12.3% of span): Idle 127, GC / CC 81, JavaScript 21, Other 14, DOM 6, Profiler 3
  - JS leaf 3 / native under JS 23 / native 226; buckets: ipc 250, poll_wait 133, gc_cc 89, harness_diagnostics 24, array_buffer_copy 5, engine_stream_read 5, memcpy_memset 4, subprocess_pipe_io 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 131; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[unknown]` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 4; `[axiosozo-dev]` 3
  - GC/CC markers: GCSlice 15× 62 ms, GCMajor 1× 60 ms, CCSlice 6× 21 ms, GCMinor 2× 6 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `sched_yield [libc.so.6]` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `munmap [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 83 ms: buckets subprocess_pipe_io 83, js_ctypes 83, worker_messaging 83, ipc 83, poll_wait 83; top self: `__syscall_cancel_arch [libc.so.6]` 83
- **tab:8826** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8765** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9079** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTA` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 407, BgPool 259, DOM Worker 238, Renderer 181, SwComposite 116, WRRenderBackend 48, Compositor 34, other 27, ImageBridge 14, WRSceneBuilder 7, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 407 ms (13.1% of span): Idle 281, JavaScript 68, Other 32, DOM 16, Profiler 8, GC / CC 2
  - JS leaf 11 / native under JS 74 / native 322; buckets: ipc 407, poll_wait 293, gc_cc 60, engine_stream_read 42, harness_diagnostics 31, worker_messaging 29, array_buffer_copy 14, native_receiver 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 290; `[unknown]` 18; `__lll_lock_wait [libc.so.6]` 5; `__lll_lock_wake [libc.so.6]` 4; `[axiosozo-dev]` 3; `js::jit::CacheIRCompiler::addFailurePath(js::jit::FailurePat` 3
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 181 ms (top self: `__syscall_cancel_arch [libc.so.6]` 114, `__memmove_evex_unaligned_erms [libc.so.6]` 31, `syscall [libc.so.6]` 26); SwComposite 116 ms (top self: `syscall [libc.so.6]` 104, `__memmove_evex_unaligned_erms [libc.so.6]` 11, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 12, `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 152 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 78, `__syscall_cancel_arch [libc.so.6]` 70, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 1); BackgroundThreadPool #2 107 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 66, `__syscall_cancel_arch [libc.so.6]` 38, `[linux-vdso.so.1]` 2); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `[linux-vdso.so.1]` 0, `mozilla::ipc::NodeController::GetMessage(mojo::cor` 0)
  - busiest DOM Worker 238 ms: buckets subprocess_pipe_io 238, worker_messaging 238, ipc 238, js_ctypes 210, poll_wait 203, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 205; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 3; `[unknown]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
- **tab:8848** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `std::_Rb_tree<RefPtr<mozilla::Task>, RefPtr<mozilla::Task>, ` 0; `mozilla::ipc::NodeController::ForwardEvent(mojo::core::ports` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9085** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8875** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mojo::core::ports::PortRef::PortRef(mojo::core::ports::PortR` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: BgPool 258, DOM Worker 233, main 198, Renderer 185, SwComposite 114, WRRenderBackend 48, Compositor 36, ImageBridge 14, WRSceneBuilder 7, Socket 2, other 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 198 ms (6.6% of span): Idle 121, JavaScript 42, Other 17, DOM 15, GC / CC 3
  - JS leaf 6 / native under JS 49 / native 144; buckets: ipc 198, poll_wait 131, gc_cc 55, engine_stream_read 43, worker_messaging 24, array_buffer_copy 13, subprocess_pipe_io 12, native_receiver 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 130; `[unknown]` 9; `mozilla::net::nsStandardURL::BuildNormalizedSpec(char const*` 3; `[axiosozo-dev]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `[libX11.so.6]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 185 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_evex_unaligned_erms [libc.so.6]` 52, `syscall [libc.so.6]` 15); SwComposite 114 ms (top self: `syscall [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 16, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 12, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 258 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 142, `__syscall_cancel_arch [libc.so.6]` 107, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 233 ms: buckets subprocess_pipe_io 233, worker_messaging 233, ipc 233, js_ctypes 218, poll_wait 208, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 210; `[axiosozo-dev]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 1; `[unknown]` 1
- **tab:8875** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9085** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8848** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 472, DOM Worker 256, BgPool 204, Renderer 112, SwComposite 59, WRRenderBackend 30, Compositor 21, other 18, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 472 ms (23.0% of span): Idle 262, JavaScript 98, Other 46, DOM 34, Profiler 12, Graphics 11
  - JS leaf 9 / native under JS 120 / native 344; buckets: ipc 469, poll_wait 323, gc_cc 89, engine_stream_read 73, worker_messaging 46, paint_layout 43, harness_diagnostics 43, array_buffer_copy 29
  - top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 17; `__lll_lock_wake [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 112 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `syscall [libc.so.6]` 19, `__memmove_evex_unaligned_erms [libc.so.6]` 17); SwComposite 59 ms (top self: `syscall [libc.so.6]` 53, `__memmove_evex_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 30 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 203 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_evex_unaligned_erms [libc.so.6]` 80, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 256 ms: buckets subprocess_pipe_io 256, worker_messaging 256, ipc 256, js_ctypes 207, poll_wait 190, gc_cc 17; top self: `__syscall_cancel_arch [libc.so.6]` 203; `__lll_lock_wake [libc.so.6]` 9; `__memset_evex_unaligned_erms [libc.so.6]` 6; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 4; `js::ArrayBufferObject::class_constructor(JSContext` 3
- **tab:8826** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9085** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8848** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 458, DOM Worker 187, Renderer 122, SwComposite 79, other 28, BgPool 28, WRRenderBackend 20, Compositor 16, WRWorker 10, WRSceneBuilder 9, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 458 ms (12.5% of span): Idle 227, JavaScript 82, Other 44, Layout 30, Graphics 28, DOM 27
  - JS leaf 9 / native under JS 131 / native 318; buckets: ipc 453, poll_wait 271, gc_cc 88, paint_layout 70, engine_stream_read 65, worker_messaging 59, harness_diagnostics 23, array_buffer_copy 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 237; `[unknown]` 13; `[axiosozo-dev]` 9; `nsTArrayInfallibleAllocator::ResultTypeProxy nsTArray_base<n` 5; `xpc::WindowGlobalOrNull(JSObject*) [libxul.so]` 5; `[linux-vdso.so.1]` 4
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 121 ms (top self: `__syscall_cancel_arch [libc.so.6]` 44, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 23, `syscall [libc.so.6]` 7); SwComposite 79 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 44, `syscall [libc.so.6]` 35, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 20 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 2, `core::hash::BuildHasher::hash_one [libxul.so]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 27 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 13, `__syscall_cancel_arch [libc.so.6]` 13, `mozilla::layers::ImageBridgeChild::GetSingleton() ` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `[axiosozo-dev]` 0, `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) ` 0); BgIOThreadPool #3 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 187 ms: buckets subprocess_pipe_io 187, worker_messaging 187, ipc 187, js_ctypes 175, poll_wait 171, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 173; `__lll_lock_wait [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[unknown]` 1
- **tab:8765** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 0; `mozilla::dom::XPCOMObjectToJsval(JSContext*, JS::Handle<JSOb` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8826** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8875** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 68, Renderer 36, DOM Worker 12, BgPool 9, SwComposite 4, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 68 ms (24.1% of span): JavaScript 32, Layout 10, Other 8, DOM 7, Graphics 6, Idle 4
  - JS leaf 3 / native under JS 39 / native 26; buckets: ipc 68, gc_cc 19, array_buffer_copy 18, paint_layout 15, harness_diagnostics 8, engine_stream_read 7, worker_messaging 6, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 4; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 4; `goSetCommandEnabled (chrome://global/content/globalOverlay.j` 3; `js::jit::CallIRGenerator::tryAttachFunCallBound(JS::Handle<J` 3
  - WebRender/compositor threads: Renderer 36 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `__syscall_cancel_arch [libc.so.6]` 5); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 9 ms (top self: `unlink [libc.so.6]` 7, `fstatat64 [libc.so.6]` 1, `getdents64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 11, poll_wait 11, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::jit::CacheIRStubKey::hash(js::jit::CacheIRStub` 0
- **tab:9079** CPU ms by thread group: main 25, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (9.0% of span): Other 9, JavaScript 6, Idle 3, Graphics 2, DOM 1, Layout 1
  - JS leaf 0 / native under JS 7 / native 18; buckets: ipc 23, paint_layout 13, gc_cc 11, subprocess_pipe_io 6, poll_wait 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1; `__lll_lock_wait [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1; `nsTSubstring<char16_t>::StartBulkWriteImpl(unsigned long, un` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8765** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 2, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::CallObject::createForFrame(JSContext*, js::AbstractFrame` 1; `xpc::AutoScriptActivity::~AutoScriptActivity() [libxul.so]` 0; `mozilla::CCGCScheduler::MaybePokeCC(mozilla::TimeStamp, unsi` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8826** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## chromium-2x-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **72.9** (main 24.8, Renderer 23.1, DOM Worker 14.2, StyleThread# 1.8, TaskCon~ller # 1.8) | AxioCEFProbe 60.3, cef:gpu-process 21.3, cef:utility 12.4, cef:renderer 10.6 | — | 494.7 |
| plain | idle | — | — | **5.8** (main 4.3, IPC I/O Parent 0.5, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 0.5 | — | — |
| plain | raf | 59.9 | 21.0 | **64.6** (Renderer 18.6, SwComposite 17.0, main 9.9, Backgro~Pool # 6.1, DOM Worker 3.8) | cef:gpu-process 13.7, cef:renderer 12.2, AxioCEFProbe 11.3 | — | — |
| plain | raf-nosampler | — | — | **63.7** (Renderer 17.5, SwComposite 15.9, main 8.9, Backgro~Pool # 6.3, DOM Worker 3.6) | cef:gpu-process 15.2, cef:renderer 11.6, AxioCEFProbe 10.6 | — | — |
| plain | scroll | 59.8 | 21.7 | **78.0** (main 19.9, Renderer 18.0, SwComposite 15.1, DOM Worker 9.9, Backgro~Pool # 8.5) | cef:gpu-process 60.5, AxioCEFProbe 15.1, cef:renderer 14.3 | — | — |
| plain | key | — | — | **67.0** (main 18.3, DOM Worker 17.5, Indexed~ IO # 7.1, IndexedDB IO # 6.0, IPDL Background 4.9) | AxioCEFProbe 2.7, cef:renderer 1.9, cef:gpu-process 0.8, WebExtensions 0.3 | 12.8 | — |
| plain | switch-to-gecko | — | — | **5.1** (main 1.9, DOM Worker 1.1, TaskCon~ller # 0.5, IPDL Background 0.3, Renderer 0.3) | WebExtensions 0.2, RDD Process 0.1, Web Content 0.1, Isolated Web Co 0.1 | — | 15024.8 |
| profile | switch-to-engine | — | — | **53.9** (main 16.0, Renderer 13.1, DOM Worker 11.6, SamplerThread 5.8, Backgro~Pool # 2.9) | Web Content 69.8, AxioCEFProbe 58.2, cef:gpu-process 21.8, cef:utility 10.2 | — | 624.1 |
| profile | idle | — | — | **24.9** (SamplerThread 9.4, DOM Worker 8.4, main 5.2, Timer 1.4, Socket Thread 0.5) | Web Content 9.8, Privileged Cont 2.4, WebExtensions 2.3, Socket Process 1.4 | — | — |
| profile | raf | 60.0 | 21.3 | **94.8** (Renderer 20.4, SwComposite 17.8, main 14.0, DOM Worker 13.1, SamplerThread 12.7) | cef:gpu-process 15.2, cef:renderer 13.1, AxioCEFProbe 11.2, Web Content 10.8 | — | — |
| profile | raf-nosampler | — | — | **89.3** (Renderer 19.8, SwComposite 17.8, DOM Worker 12.9, main 11.5, SamplerThread 11.2) | cef:gpu-process 16.9, cef:renderer 13.1, AxioCEFProbe 11.2, Web Content 10.2 | — | — |
| profile | scroll | 59.9 | 23.2 | **109.2** (main 25.7, Renderer 20.5, SwComposite 17.7, DOM Worker 15.9, SamplerThread 10.7) | cef:gpu-process 68.1, AxioCEFProbe 16.4, cef:renderer 15.0, Web Content 9.4 | — | — |
| profile | key | — | — | **40.4** (main 11.4, DOM Worker 10.1, SamplerThread 9.8, Renderer 2.4, SwComposite 2.4) | Web Content 10.1, WebExtensions 2.5, AxioCEFProbe 2.4, cef:renderer 2.2 | 15.5 | — |
| profile | switch-to-gecko | — | — | **5.2** (SamplerThread 3.6, DOM Worker 0.5, main 0.4, Renderer 0.3, IPC I/O Parent 0.1) | Web Content 8.1, Privileged Cont 1.7, WebExtensions 1.6, Isolated Web Co 1.6 | — | 15723.5 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 5.6 | 0.0 | 0 | 0.0 | — | — | 4.0 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 58.0 | 0.0 | 0 | 0.0 | — | — | 11.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 4 | 4 | 2.103 | 9.278 | 0.0142 | 0.0625 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 189 | 0.186 | 0.790 | 0.0112 | 0.0473 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.215 | 0.783 | 0.0128 | 0.0467 |
| plain | scroll | memfd | native | 123 | 123 | 0.670 | 0.796 | 0.0386 | 0.0458 |
| plain | key | memfd | native | 21 | 21 | 0.053 | 0.825 | 0.0003 | 0.0047 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 4 | 4 | 2.952 | 6.571 | 0.0165 | 0.0367 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 191 | 191 | 0.231 | 0.874 | 0.0139 | 0.0525 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.238 | 0.880 | 0.0143 | 0.0528 |
| profile | scroll | memfd | native | 126 | 126 | 0.893 | 1.033 | 0.0518 | 0.0598 |
| profile | key | memfd | native | 21 | 21 | 0.068 | 0.872 | 0.0004 | 0.0049 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.7 | 0.1 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 44.0; spawn AxioCEFProbe resolved 100.0; write hello 107.8; first stdout read resolved 457.5; write create 463.9; write frame_ack 638.3; write focus 650.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 35.9; first stdout read resolved 46.8; write shutdown 53.2

### Profile: chromium-2x-control / switch-to-engine

- **parent** CPU ms by thread group: main 104, Renderer 103, DOM Worker 72, BgPool 32, SwComposite 10, Compositor 8, WRRenderBackend 5, IPC I/O 4, WRSceneBuilder 3, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 104 ms (14.5% of span): Layout 40, JavaScript 30, Idle 20, DOM 5, Profiler 5, Graphics 3
  - JS leaf 2 / native under JS 48 / native 54; buckets: ipc 104, paint_layout 52, gc_cc 33, poll_wait 21, array_buffer_copy 13, worker_messaging 10, subprocess_pipe_io 9, harness_diagnostics 6
  - top self: `poll [libc.so.6]` 21; `Gecko_AddRefAtom [libxul.so]` 6; `[axiosozo-dev]` 5; `selectors::matching::matches_complex_selector_list::{{closur` 5; `style::properties::cascade::Cascade::apply_non_prioritary_pr` 5; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 4
  - WebRender/compositor threads: Renderer 103 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 26, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 21, `int blendTextureNearestFast<true, glsl::sampler2D_` 6); SwComposite 10 ms (top self: `syscall [libc.so.6]` 10); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 4, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `ARGBSetRow_X86 [libxul.so]` 7, `__memset_avx2_unaligned_erms [libc.so.6]` 5); BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 72 ms: buckets subprocess_pipe_io 72, worker_messaging 72, ipc 72, poll_wait 62, js_ctypes 47, memcpy_memset 2; top self: `poll [libc.so.6]` 43; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19; `JS::DescribeScriptedCaller(JS::AutoFilename*, JSCo` 2; `js::ctypes::CData::Create(JSContext*, JS::Handle<J` 2; `write [libc.so.6]` 1
- **tab:5054** CPU ms by thread group: main 56, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 56 ms (11.8% of span): Other 45, DOM 4, Profiler 3, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 50; buckets: ipc 43, array_buffer_copy 19, gc_cc 15, subprocess_pipe_io 6, poll_wait 3, memcpy_memset 2
  - top self: `[]` 7; `__lll_lock_wake [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `mprotect [libc.so.6]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5049** CPU ms by thread group: main 55, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 55 ms (10.4% of span): Other 40, Profiler 5, DOM 4, JavaScript 3, Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 49; buckets: ipc 42, array_buffer_copy 16, gc_cc 15, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 2
  - top self: `[]` 4; `[libexpat.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4891** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.5% of span): Idle 3, Layout 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, paint_layout 1, canvas_2d 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `gfxFont::MeasureGlyphs(gfxTextRun const*, unsigned int, unsi` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / idle

- **parent** CPU ms by thread group: DOM Worker 122, main 107, other 20, Socket 3, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 107 ms (5.0% of span): Idle 87, Other 7, JavaScript 7, DOM 3, GC / CC 3, Profiler 1
  - JS leaf 0 / native under JS 11 / native 96; buckets: ipc 107, poll_wait 91, harness_diagnostics 10, gc_cc 6, array_buffer_copy 4, json_metadata 1, memcpy_memset 0, native_receiver 0
  - top self: `poll [libc.so.6]` 88; `recvmsg [libc.so.6]` 1; `write [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `mozilla::dom::HasPropertyOnPrototype(JSContext*, JS::Handle<` 1; `XPCCallContext::SetName(JS::PropertyKey) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 122 ms: buckets subprocess_pipe_io 122, worker_messaging 122, ipc 122, js_ctypes 121, poll_wait 121, gc_cc 0; top self: `poll [libc.so.6]` 121; `js::RunScript(JSContext*, js::RunState&) [libxul.s` 0
- **tab:4891** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5049** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5054** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf

- **parent** CPU ms by thread group: Renderer 597, SwComposite 550, main 406, DOM Worker 312, BgPool 206, WRRenderBackend 76, Compositor 45, other 37, ImageBridge 19, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 406 ms (12.8% of span): Idle 276, JavaScript 64, Other 37, DOM 24, Profiler 4
  - JS leaf 6 / native under JS 74 / native 326; buckets: ipc 405, poll_wait 299, gc_cc 76, worker_messaging 38, engine_stream_read 37, json_metadata 20, array_buffer_copy 16, subprocess_pipe_io 15
  - top self: `poll [libc.so.6]` 278; `[unknown]` 14; `recvmsg [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `write [libc.so.6]` 4; `[axiosozo-dev]` 4
  - WebRender/compositor threads: Renderer 597 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 241, `int blendTextureNearestFast<false, glsl::sampler2D` 149, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 70); SwComposite 550 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 282, `syscall [libc.so.6]` 179, `__memmove_avx_unaligned_erms [libc.so.6]` 86); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 62, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 205 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 130, `__memmove_avx_unaligned_erms [libc.so.6]` 70, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); ImageBridgeChld 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `nsThread::DrainDirectTasks() [libxul.so]` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 1 ms (top self: `write [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 312 ms: buckets subprocess_pipe_io 312, worker_messaging 312, ipc 312, js_ctypes 293, poll_wait 285, gc_cc 11; top self: `poll [libc.so.6]` 285; `write [libc.so.6]` 4; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 2; `getcontext [libc.so.6]` 1
- **tab:4627** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4588** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5054** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 569, SwComposite 520, main 333, DOM Worker 297, BgPool 197, WRRenderBackend 73, Compositor 43, ImageBridge 18, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 333 ms (10.9% of span): Idle 142, GC / CC 82, JavaScript 69, Other 24, DOM 15, Profiler 1
  - JS leaf 8 / native under JS 70 / native 254; buckets: ipc 333, poll_wait 162, gc_cc 161, engine_stream_read 44, worker_messaging 41, json_metadata 24, subprocess_pipe_io 19, array_buffer_copy 16
  - top self: `poll [libc.so.6]` 144; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 9; `[axiosozo-dev]` 7; `recvmsg [libc.so.6]` 7; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 7
  - GC/CC markers: GCMajor 2× 190 ms, GCSlice 22× 70 ms, CCSlice 2× 20 ms, GCMinor 3× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 569 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 211, `int blendTextureNearestFast<false, glsl::sampler2D` 153, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 84); SwComposite 520 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 235, `syscall [libc.so.6]` 188, `__memmove_avx_unaligned_erms [libc.so.6]` 91); WRRenderBackend#0 73 ms (top self: `syscall [libc.so.6]` 56, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 197 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 131, `__memmove_avx_unaligned_erms [libc.so.6]` 61, `axio::SinkState::Present() [libxul.so]` 1); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `mozilla::layers::TextureClientRecycleAllocator::Re` 0, `[axiosozo-dev]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 297 ms: buckets subprocess_pipe_io 297, worker_messaging 297, ipc 297, js_ctypes 277, poll_wait 270, gc_cc 7; top self: `poll [libc.so.6]` 270; `[axiosozo-dev]` 2; `write [libc.so.6]` 2; `[unknown]` 2; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Ha` 2
- **tab:5054** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5049** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4627** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / scroll

- **parent** CPU ms by thread group: main 521, Renderer 429, SwComposite 369, DOM Worker 288, BgPool 201, WRRenderBackend 55, Compositor 29, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 521 ms (24.0% of span): Idle 310, JavaScript 95, Other 61, DOM 19, Graphics 13, Profiler 13
  - JS leaf 10 / native under JS 100 / native 411; buckets: ipc 521, poll_wait 391, gc_cc 94, paint_layout 54, worker_messaging 45, engine_stream_read 26, subprocess_pipe_io 22, array_buffer_copy 19
  - top self: `poll [libc.so.6]` 324; `[unknown]` 18; `[axiosozo-dev]` 10; `recvmsg [libc.so.6]` 8; `write [libc.so.6]` 4; `getcontext [libc.so.6]` 4
  - WebRender/compositor threads: Renderer 429 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 235, `int blendTextureNearestFast<false, glsl::sampler2D` 61, `void scale_blit<true>(Texture&, IntRect const&, Te` 35); SwComposite 369 ms (top self: `syscall [libc.so.6]` 231, `void scale_blit<true>(Texture&, IntRect const&, Te` 121, `__memmove_avx_unaligned_erms [libc.so.6]` 17); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 201 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 126, `__memmove_avx_unaligned_erms [libc.so.6]` 65, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 288 ms: buckets subprocess_pipe_io 288, worker_messaging 288, ipc 288, js_ctypes 257, poll_wait 248, gc_cc 13; top self: `poll [libc.so.6]` 248; `mozilla::dom::WorkerEventTarget::Dispatch(already_` 4; `_ZZN7mozilla20ProfileChunkedBuffer16ReserveAndPutR` 4; `[unknown]` 3; `getcontext [libc.so.6]` 3
- **tab:4533** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 11 ms (0.5% of span): GC / CC 9, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 10, gc_cc 9, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 2; `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 1
  - GC/CC markers: GCMajor 1× 31 ms, GCSlice 4× 15 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4588** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): GC / CC 2, Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, gc_cc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsComponentManagerImpl::GetServiceLocked(mozilla::Maybe<mozi` 0; `bool js::gc::UnmarkGrayTracer<1u>::onChild<js::Shape>(js::Sh` 0; `sendmsg [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4893** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / key

- **parent** CPU ms by thread group: main 385, DOM Worker 264, Renderer 94, SwComposite 82, other 36, BgPool 20, Compositor 15, WRRenderBackend 15, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 385 ms (10.4% of span): Idle 161, JavaScript 85, Layout 42, Other 37, Graphics 24, DOM 18
  - JS leaf 11 / native under JS 135 / native 238; buckets: ipc 385, poll_wait 202, gc_cc 105, paint_layout 79, worker_messaging 74, engine_stream_read 41, subprocess_pipe_io 24, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 166; `[unknown]` 13; `[axiosozo-dev]` 8; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 94 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 27, `int blendTextureNearestFast<false, glsl::sampler2D` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 16); SwComposite 82 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 36, `syscall [libc.so.6]` 29, `__memmove_avx_unaligned_erms [libc.so.6]` 17); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 1); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 264 ms: buckets subprocess_pipe_io 264, worker_messaging 264, ipc 264, js_ctypes 253, poll_wait 248, gc_cc 6; top self: `poll [libc.so.6]` 248; `mozilla::RunMicroTask(JSContext*, mozilla::CycleCo` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:4533** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.` 0; `[unknown]` 0; `js::jit::DoGetPropFallback(JSContext*, js::jit::BaselineFram` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4627** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4609** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: DOM Worker 72, main 70, Renderer 47, BgPool 10, IPC I/O 7, Compositor 5, WRRenderBackend 3, SwComposite 3, Socket 2, other 2, WRSceneBuilder 2, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 70 ms (0.4% of span): Idle 19, JavaScript 18, Layout 17, Other 10, DOM 5, Graphics 2
  - JS leaf 2 / native under JS 28 / native 41; buckets: ipc 70, paint_layout 24, poll_wait 19, array_buffer_copy 12, gc_cc 10, harness_diagnostics 10, memcpy_memset 3, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 19; `sendmsg [libc.so.6]` 4; `madvise [libc.so.6]` 3; `style::properties::generated::longhands::flex_shrink::cascad` 2; `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 1; `ProfilingStack::pushLabelFrame(char const*, char const*, voi` 1
  - GC/CC markers: GCMinor 2× 1 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `int blendTextureNearestFast<true, glsl::sampler2D_` 13, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 0); SwComposite 3 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 9 ms (top self: `unlink [libc.so.6]` 5, `getdents64 [libc.so.6]` 2, `rmdir [libc.so.6]` 1); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 72 ms: buckets subprocess_pipe_io 72, worker_messaging 72, ipc 72, gc_cc 56, poll_wait 15, js_ctypes 15; top self: `poll [libc.so.6]` 13; `[axiosozo-dev]` 10; `madvise [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5
- **tab:4627** CPU ms by thread group: main 7, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 5, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: ipc 7, poll_wait 5, gc_cc 2
  - top self: `poll [libc.so.6]` 5; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `js::jit::CacheRegisterAllocator::useRegister(js::jit::MacroA` 1; `read [libc.so.6]` 0; `js::jit::CanBaselineCompileScript(JSContext*, JSScript*) [li` 0; `fog_serialize_ipc_buf [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4588** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4891** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 4, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `sendmsg [libc.so.6]` 1; `mozilla::EventTargetChainItem::HandleEventTargetChain(nsTArr` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **71.0** (main 26.9, Renderer 19.2, DOM Worker 15.4, WRRende~ckend# 3.8, StyleThread# 1.9) | AxioCEFProbe 63.4, cef:gpu-process 19.2, cef:utility 15.4, cef:renderer 11.5 | — | 471.2 |
| plain | idle | — | — | **6.3** (main 4.8, TaskCon~ller # 1.0, Timer 0.5) | AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 22.4 | **35.7** (main 10.3, Renderer 6.8, SwComposite 5.2, DOM Worker 3.2, Backgro~Pool # 1.9) | cef:renderer 10.0, AxioCEFProbe 5.5, cef:gpu-process 4.8, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **31.0** (Renderer 7.3, main 6.9, SwComposite 5.6, DOM Worker 3.6, Backgro~Pool # 2.3) | cef:renderer 11.2, AxioCEFProbe 6.3, cef:gpu-process 5.7 | — | — |
| plain | scroll | 59.8 | 22.2 | **51.1** (main 20.2, DOM Worker 8.2, Renderer 7.2, SwComposite 5.3, Backgro~Pool # 2.9) | cef:gpu-process 20.8, cef:renderer 10.1, AxioCEFProbe 8.7 | — | — |
| plain | key | — | — | **17.8** (main 10.4, DOM Worker 1.6, TaskCon~ller # 1.4, Timer 0.8, Renderer 0.8) | AxioCEFProbe 2.8, cef:renderer 2.2, cef:gpu-process 0.3 | 13.0 | — |
| plain | switch-to-gecko | — | — | **12.2** (DOM Worker 4.5, main 3.7, IPDL Background 1.5, TaskCon~ller # 0.5, Indexed~ IO # 0.5) | WebExtensions 0.1, Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15352.4 |
| profile | switch-to-engine | — | — | **48.2** (main 14.9, DOM Worker 14.9, SamplerThread 6.6, Renderer 5.0, glean.dispatche 1.7) | AxioCEFProbe 54.6, Web Content 47.9, cef:gpu-process 14.9, cef:utility 11.6 | — | 550.5 |
| profile | idle | — | — | **25.1** (SamplerThread 9.0, DOM Worker 8.0, main 5.7, Timer 1.9, Cache2 I/O 0.5) | Web Content 7.6, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 59.9 | 20.9 | **61.2** (DOM Worker 12.8, main 12.5, SamplerThread 11.8, Renderer 7.3, SwComposite 5.4) | cef:renderer 11.5, Web Content 8.3, AxioCEFProbe 6.1, cef:gpu-process 5.7 | — | — |
| profile | raf-nosampler | — | — | **53.8** (DOM Worker 12.9, SamplerThread 10.6, Renderer 7.9, main 7.6, SwComposite 5.9) | cef:renderer 11.3, Web Content 7.3, AxioCEFProbe 6.3, cef:gpu-process 6.0 | — | — |
| profile | scroll | 60.0 | 21.2 | **80.1** (main 24.8, DOM Worker 16.2, SamplerThread 12.4, Renderer 8.1, SwComposite 5.2) | cef:gpu-process 23.9, cef:renderer 11.0, Web Content 9.1, AxioCEFProbe 9.0 | — | — |
| profile | key | — | — | **38.4** (main 12.0, DOM Worker 9.8, SamplerThread 9.5, Timer 1.9, Renderer 1.1) | Web Content 7.9, AxioCEFProbe 3.2, cef:renderer 2.7, Privileged Cont 2.2 | 15.7 | — |
| profile | switch-to-gecko | — | — | **7.3** (SamplerThread 3.5, main 1.7, TaskCon~ller # 0.9, DOM Worker 0.5, Renderer 0.2) | Web Content 7.3, Privileged Cont 1.8, WebExtensions 1.6, Isolated Web Co 1.5 | — | 15027.5 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.1 | 0.0 | 0 | 0.0 | — | — | 4.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 58.2 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 3 | 0.871 | 2.162 | 0.0048 | 0.0119 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.053 | 0.275 | 0.0032 | 0.0165 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.060 | 0.272 | 0.0036 | 0.0163 |
| plain | scroll | memfd | native | 121 | 121 | 0.211 | 0.229 | 0.0122 | 0.0132 |
| plain | key | memfd | native | 21 | 21 | 0.017 | 0.278 | 0.0001 | 0.0016 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.238 | 2.769 | 0.0039 | 0.0087 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.057 | 0.276 | 0.0034 | 0.0165 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.061 | 0.287 | 0.0037 | 0.0172 |
| profile | scroll | memfd | native | 124 | 124 | 0.243 | 0.264 | 0.0141 | 0.0154 |
| profile | key | memfd | native | 21 | 21 | 0.020 | 0.309 | 0.0001 | 0.0018 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.5 | 0.1 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 51.3; spawn AxioCEFProbe resolved 115.4; write hello 121.7; first stdout read resolved 393.8; write create 396.4; write frame_ack 569.5; write focus 580.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 42.1; first stdout read resolved 52.5; write shutdown 55.7

### Profile: chromium-control / switch-to-engine

- **parent** CPU ms by thread group: main 91, DOM Worker 61, Renderer 34, BgPool 6, Compositor 6, WRRenderBackend 5, WRSceneBuilder 4, IPC I/O 3, SwComposite 2, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 91 ms (14.3% of span): Layout 28, JavaScript 24, Idle 16, Other 14, DOM 3, Profiler 3
  - JS leaf 2 / native under JS 37 / native 52; buckets: ipc 91, paint_layout 33, gc_cc 23, poll_wait 22, harness_diagnostics 11, array_buffer_copy 10, worker_messaging 9, memcpy_memset 5
  - top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 8; `style::properties::cascade::iter_declarations [libxul.so]` 8; `recvmsg [libc.so.6]` 5; `[unknown]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 34 ms (top self: `DrawElementsInstanced [libxul.so]` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__lll_lock_wake [libc.so.6]` 3); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2); WRSceneBuilder#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 2, `hashbrown::map::equivalent_key::{{closure}} [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `ARGBSetRow_X86 [libxul.so]` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memset_avx2_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 61 ms: buckets subprocess_pipe_io 61, worker_messaging 61, ipc 61, poll_wait 55, js_ctypes 37, gc_cc 3; top self: `poll [libc.so.6]` 36; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19; `write [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `js::BoundFunctionObject::initName(JSAtom*) [libxul` 1
- **tab:5010** CPU ms by thread group: main 53, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 53 ms (11.6% of span): Other 41, JavaScript 5, Profiler 3, DOM 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 48; buckets: ipc 38, array_buffer_copy 15, gc_cc 12, subprocess_pipe_io 5, poll_wait 2
  - top self: `[]` 7; `__strcmp_avx2 [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 3; `access [libc.so.6]` 2; `read [libc.so.6]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5007** CPU ms by thread group: main 51, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (8.7% of span): Other 44, JavaScript 2, Profiler 2, Idle 1, DOM 1, GC / CC 1
  - JS leaf 0 / native under JS 1 / native 50; buckets: ipc 38, array_buffer_copy 19, gc_cc 11, subprocess_pipe_io 5, poll_wait 5, memcpy_memset 2
  - top self: `[libexpat.so.1]` 4; `[]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `FcConfigGetCurrent [libfontconfig.so.1]` 3; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 2; `syscall [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4886** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.6% of span): Idle 2, Layout 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGene` 1; `read [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<moz` 0; `getcontext [libc.so.6]` 0; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / idle

- **parent** CPU ms by thread group: main 110, DOM Worker 110, other 21, BgPool 1, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 111 ms (5.2% of span): Idle 86, Other 10, JavaScript 10, DOM 2, GC / CC 2, Profiler 1
  - JS leaf 0 / native under JS 12 / native 99; buckets: ipc 111, poll_wait 92, harness_diagnostics 7, gc_cc 7, array_buffer_copy 5, subprocess_pipe_io 1, json_metadata 1, worker_messaging 0
  - top self: `poll [libc.so.6]` 87; `recvmsg [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `[libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 109 ms: buckets subprocess_pipe_io 109, worker_messaging 109, ipc 109, js_ctypes 109, poll_wait 109; top self: `poll [libc.so.6]` 109; `js::ToPrimitiveSlow(JSContext*, JSType, JS::Mutabl` 0
- **tab:5007** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4886** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf

- **parent** CPU ms by thread group: main 364, DOM Worker 310, Renderer 224, SwComposite 173, BgPool 68, WRRenderBackend 65, Compositor 43, other 33, ImageBridge 19, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 364 ms (11.5% of span): Idle 239, JavaScript 67, Other 35, DOM 14, Profiler 6, GC / CC 2
  - JS leaf 14 / native under JS 64 / native 286; buckets: ipc 364, poll_wait 258, gc_cc 72, worker_messaging 38, engine_stream_read 38, json_metadata 20, array_buffer_copy 18, harness_diagnostics 14
  - top self: `poll [libc.so.6]` 242; `[unknown]` 14; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `write [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 223 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 123, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 23, `int blendTextureNearestFast<false, glsl::sampler2D` 22); SwComposite 173 ms (top self: `syscall [libc.so.6]` 109, `void scale_blit<true>(Texture&, IntRect const&, Te` 60, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 57, `[axiosozo-dev]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 68 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 62, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `pthread_cond_wait@@GLIBC_2.3.2 [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 310 ms: buckets subprocess_pipe_io 310, worker_messaging 310, ipc 310, js_ctypes 289, poll_wait 282, gc_cc 8; top self: `poll [libc.so.6]` 282; `[unknown]` 3; `mozilla::dom::ClientInfo::operator=(mozilla::dom::` 2; `bool js::ctypes::jsvalToBigInteger<unsigned long>(` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:4886** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 3, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `fog_counter_add [libxul.so]` 0; `DestroyRealm(JS::GCContext*, JS::Realm*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4636** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `MessageLoop::EventTarget::IsOnCurrentThreadInfallible() [lib` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 298, Renderer 224, main 222, SwComposite 173, BgPool 69, WRRenderBackend 64, Compositor 44, ImageBridge 18, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 222 ms (7.2% of span): Idle 118, JavaScript 59, Other 27, DOM 15, Profiler 3
  - JS leaf 6 / native under JS 62 / native 153; buckets: ipc 222, poll_wait 134, gc_cc 73, worker_messaging 42, engine_stream_read 29, json_metadata 26, subprocess_pipe_io 24, array_buffer_copy 20
  - top self: `poll [libc.so.6]` 123; `[unknown]` 10; `recvmsg [libc.so.6]` 8; `write [libc.so.6]` 5; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 4; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 3
  - WebRender/compositor threads: Renderer 224 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 114, `int blendTextureNearestFast<false, glsl::sampler2D` 35, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 22); SwComposite 173 ms (top self: `syscall [libc.so.6]` 96, `void scale_blit<true>(Texture&, IntRect const&, Te` 68, `__memmove_avx_unaligned_erms [libc.so.6]` 9); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 2, `write [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `mozilla::ipc::MessageChannel::MessageTask::~Messag` 0, `PR_GetCurrentThread [libnspr4.so]` 0); BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 298 ms: buckets subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 274, poll_wait 267, gc_cc 12; top self: `poll [libc.so.6]` 267; `write [libc.so.6]` 5; `[unknown]` 3; `__lll_lock_wait [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:4891** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `TimerThread::Init() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5007** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / scroll

- **parent** CPU ms by thread group: main 494, DOM Worker 293, Renderer 158, SwComposite 112, BgPool 64, WRRenderBackend 46, Compositor 28, other 23, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 494 ms (23.2% of span): Idle 288, JavaScript 85, Other 55, DOM 24, Graphics 23, Profiler 12
  - JS leaf 10 / native under JS 93 / native 392; buckets: ipc 493, poll_wait 366, gc_cc 86, paint_layout 54, worker_messaging 48, engine_stream_read 27, json_metadata 22, array_buffer_copy 20
  - top self: `poll [libc.so.6]` 292; `[unknown]` 9; `recvmsg [libc.so.6]` 6; `[axiosozo-dev]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5
  - WebRender/compositor threads: Renderer 158 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 87, `int blendTextureNearestFast<false, glsl::sampler2D` 19, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 13); SwComposite 112 ms (top self: `syscall [libc.so.6]` 100, `void scale_blit<true>(Texture&, IntRect const&, Te` 11, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 64 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 293 ms: buckets subprocess_pipe_io 293, worker_messaging 293, ipc 293, js_ctypes 259, poll_wait 252, gc_cc 12; top self: `poll [libc.so.6]` 252; `[unknown]` 5; `[axiosozo-dev]` 4; `getcontext [libc.so.6]` 4; `write [libc.so.6]` 2
- **tab:4636** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4610** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4891** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / key

- **parent** CPU ms by thread group: main 395, DOM Worker 258, other 37, Renderer 30, SwComposite 22, Compositor 15, WRRenderBackend 11, WRSceneBuilder 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 395 ms (10.7% of span): Idle 159, JavaScript 90, Other 44, Layout 40, Graphics 25, DOM 20
  - JS leaf 10 / native under JS 135 / native 251; buckets: ipc 395, poll_wait 196, gc_cc 109, worker_messaging 81, paint_layout 75, engine_stream_read 36, subprocess_pipe_io 24, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 161; `[unknown]` 16; `[axiosozo-dev]` 10; `write [libc.so.6]` 10; `recvmsg [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5
  - GC/CC markers: CCSlice 2× 4 ms, GCMinor 1× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); SwComposite 22 ms (top self: `syscall [libc.so.6]` 11, `void scale_blit<true>(Texture&, IntRect const&, Te` 10, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 8, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `[axiosozo-dev]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 253 ms: buckets subprocess_pipe_io 253, worker_messaging 253, ipc 253, js_ctypes 242, poll_wait 239, gc_cc 6; top self: `poll [libc.so.6]` 239; `[axiosozo-dev]` 1; `read [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:4540** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `[]` 0; `non-virtual thunk to nsGlobalWindowInner::AddRef() [libxul.s` 0; `js::UnwrapOneCheckedDynamic(JS::Handle<JSObject*>, JSContext` 0; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5007** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4610** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / switch-to-gecko

- **parent** CPU ms by thread group: main 244, DOM Worker 67, Renderer 21, BgPool 13, Compositor 8, IPC I/O 6, other 3, WRSceneBuilder 3, WRRenderBackend 2, SwComposite 1, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 244 ms (1.6% of span): GC / CC 162, JavaScript 20, Layout 18, Idle 18, Other 13, DOM 9
  - JS leaf 0 / native under JS 38 / native 205; buckets: ipc 244, gc_cc 179, poll_wait 27, paint_layout 26, array_buffer_copy 14, harness_diagnostics 12, memcpy_memset 7, subprocess_pipe_io 7
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 20; `poll [libc.so.6]` 19; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 8; `write [libc.so.6]` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7
  - GC/CC markers: GCMajor 3× 261 ms, GCSlice 19× 105 ms, CCSlice 6× 61 ms, GCMinor 4× 2 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 21 ms (top self: `ps_text_run_ALPHA_PASS_DUAL_SOURCE_BLENDING_TEXTUR` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 12 ms (top self: `rmdir [libc.so.6]` 5, `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 2); BackgroundThreadPool #3 1 ms (top self: `munmap [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 67 ms: buckets subprocess_pipe_io 67, worker_messaging 67, ipc 67, gc_cc 53, js_ctypes 14, poll_wait 14; top self: `poll [libc.so.6]` 12; `madvise [libc.so.6]` 6; `[axiosozo-dev]` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 4; `syscall [libc.so.6]` 4
- **tab:4636** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.1% of span): GC / CC 6, Idle 4, Other 1, Profiler 1
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 11, gc_cc 8, poll_wait 4, memcpy_memset 0
  - top self: `poll [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `mozilla::dom::CallbackObject::cycleCollection::Trace(void*, ` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4540** CPU ms by thread group: main 10, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.1% of span): GC / CC 7, Idle 2, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 9, gc_cc 7, poll_wait 4, array_buffer_copy 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<1u>::markOneColor<(js::gc::MarkC` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `read [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## webkit-2x-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **43.4** (Renderer 16.3, main 14.5, DOM Worker 9.0, WRRende~ckend# 1.8, SwComposite 1.8) | WPEWebProcess 59.7, AxioWebKitHost 18.1, WPENetworkProce 10.9, Isolated Web Co 1.8 | — | 528.6 |
| plain | idle | — | — | **4.9** (main 3.4, glean.dispatche 0.5, Timer 0.5, TaskCon~ller # 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.1 | 25.6 | **65.3** (Renderer 20.5, SwComposite 16.9, main 10.7, Backgro~Pool # 8.4, DOM Worker 3.9) | WPEWebProcess 179.2, AxioWebKitHost 21.0 | — | — |
| plain | raf-nosampler | — | — | **75.3** (Renderer 21.6, SwComposite 18.3, main 9.0, Backgro~Pool # 8.3, Socket Thread 4.6) | WPEWebProcess 181.4, AxioWebKitHost 22.6, Web Content 0.3 | — | — |
| plain | scroll | 54.5 | 34.1 | **85.2** (Renderer 20.5, main 18.6, SwComposite 18.1, Backgro~Pool # 10.3, DOM Worker 9.3) | WPEWebProcess 188.8, AxioWebKitHost 23.0 | — | — |
| plain | key | — | — | **51.6** (main 15.0, DOM Worker 10.6, Indexed~ IO # 9.5, IPDL Background 3.8, Renderer 3.5) | WPEWebProcess 19.1, AxioWebKitHost 2.8, WebExtensions 0.3 | 26.1 | — |
| plain | switch-to-gecko | — | — | **162.3** (DOM Worker 58.2, main 45.7, TaskCon~ller # 20.8, Renderer 12.5, Indexed~ IO # 8.3) |  | — | 215.2 |
| profile | switch-to-engine | — | — | **31.1** (DOM Worker 13.1, main 8.2, SamplerThread 6.6, glean.dispatche 1.6, Renderer 1.6) | WPEWebProcess 57.4, Web Content 32.8, AxioWebKitHost 16.4, WPENetworkProce 9.8 | — | 586.2 |
| profile | idle | — | — | **24.2** (main 7.4, DOM Worker 7.4, SamplerThread 7.4, Timer 1.0, TaskCon~ller # 0.5) | Web Content 5.4, Socket Process 1.5, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | raf | 57.8 | 25.4 | **85.9** (Renderer 20.8, SwComposite 17.8, main 14.0, DOM Worker 9.1, Backgro~Pool # 9.1) | WPEWebProcess 179.0, AxioWebKitHost 22.3, Web Content 6.8, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **76.8** (Renderer 20.9, SwComposite 17.9, DOM Worker 9.3, Backgro~Pool # 8.9, SamplerThread 7.0) | WPEWebProcess 179.9, AxioWebKitHost 22.2, Web Content 6.3, Privileged Cont 1.6 | — | — |
| profile | scroll | 51.7 | 33.3 | **103.2** (main 24.3, Renderer 20.9, SwComposite 17.0, DOM Worker 14.1, Backgro~Pool # 10.7) | WPEWebProcess 181.9, AxioWebKitHost 23.8, Web Content 5.8, Isolated Web Co 1.5 | — | — |
| profile | key | — | — | **42.2** (main 13.5, DOM Worker 8.2, SamplerThread 8.2, Renderer 4.1, SwComposite 3.8) | WPEWebProcess 19.6, Web Content 7.7, AxioWebKitHost 3.1, WebExtensions 1.6 | 29.7 | — |
| profile | switch-to-gecko | — | — | **37.9** (main 12.7, Renderer 8.4, DOM Worker 8.4, WRRende~ckend# 4.2, SamplerThread 4.2) | Isolated Web Co 4.2 | — | 216.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.2 | 0.0 | 0 | 0.0 | — | — | 121.0 | 0.0 | — | 2.70 | 0.61 | — | — | — | — | — | 0.002 |
| profile | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.49 | 0.16 | — | — | — | — | — | 0.015 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.47 | 0.17 | — | — | — | — | — | 0.013 |
| profile | scroll | 49.8 | 0.0 | 0 | 0.0 | — | — | 8.6 | 0.0 | — | 1.60 | 0.16 | — | — | — | — | — | 0.019 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 17.2 | 0.0 | — | 0.16 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.845 | 3.401 | 0.0100 | 0.0120 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.268 | 1.153 | 0.0155 | 0.0669 |
| plain | raf-nosampler | memfd | native | 172 | 173 | 0.352 | 1.304 | 0.0200 | 0.0744 |
| plain | scroll | memfd | native | 108 | 108 | 0.979 | 1.268 | 0.0515 | 0.0667 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 1.213 | 0.0000 | 0.0066 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.231 | 2.889 | 0.0072 | 0.0093 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.350 | 1.503 | 0.0202 | 0.0867 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.342 | 1.357 | 0.0199 | 0.0789 |
| profile | scroll | memfd | native | 103 | 103 | 1.384 | 1.802 | 0.0689 | 0.0897 |
| profile | key | memfd | native | 20 | 20 | 0.005 | 1.330 | 0.0000 | 0.0073 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 26.7 | 0.1 | — | 0.16 | 0.49 | — | — | 156.9 | 28.0 | 187.9 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 22.1; spawn AxioWebKitHost resolved 41.1; write hello 46.4; first stdout read resolved 103.9; write create 107.2; first frame applied (native receiver) 589.2; write frame_ack 590.2; write visibility 598.6; write focus 598.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.4; first stdout read resolved 26.3

### Profile: webkit-2x-control / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 51, main 43, Renderer 15, BgPool 10, SwComposite 2, Compositor 2, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 2, Socket 1, ImageBridge 0, other 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 43 ms (6.9% of span): JavaScript 17, Idle 11, Layout 5, DOM 3, Other 3, Graphics 2
  - JS leaf 1 / native under JS 22 / native 19; buckets: ipc 38, gc_cc 14, harness_diagnostics 11, poll_wait 9, array_buffer_copy 9, paint_layout 8, engine_stream_read 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit` 2; `[libxul.so]` 2; `[linux-vdso.so.1]` 2; `JS::loader::ModuleLoaderBase::EvaluateModuleInContext(JSCont` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2
  - WebRender/compositor threads: Renderer 15 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 9 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 3, `__memset_evex_unaligned_erms [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `[axiosozo-dev]` 0, `mkdir [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 49 ms: buckets subprocess_pipe_io 49, worker_messaging 49, ipc 49, js_ctypes 34, poll_wait 32, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 32; `js::NativeObject::changeProperty(JSContext*, JS::H` 11; `void* js::gc::CellAllocator::AllocTenuredCellForNu` 2; `js::gc::TenuringTracer::promotePlainObject(js::Pla` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:10884** CPU ms by thread group: main 44, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 44 ms (9.3% of span): Other 35, JavaScript 5, DOM 2, Idle 1, Profiler 1
  - JS leaf 0 / native under JS 3 / native 41; buckets: ipc 32, array_buffer_copy 16, gc_cc 10, subprocess_pipe_io 6, poll_wait 3, memcpy_memset 2, canvas_2d 1, image_container 1
  - top self: `[]` 4; `[libexpat.so.1]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `uhash_geti_78 [libxul.so]` 2; `__strlen_evex [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10778** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 2, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<mozilla::WidgetMouseEvent>::t` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10881** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.2% of span): Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::GCRuntime::purgeRuntimeForMinorGC() [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / idle

- **parent** CPU ms by thread group: main 134, DOM Worker 77, other 15, Renderer 3, SwComposite 3, Compositor 2, IPC I/O 1, Socket 1, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 134 ms (6.5% of span): Idle 108, JavaScript 9, Other 9, DOM 5, Profiler 2, Graphics 1
  - JS leaf 1 / native under JS 12 / native 121; buckets: ipc 134, poll_wait 113, harness_diagnostics 12, array_buffer_copy 6, gc_cc 5, engine_stream_read 2, paint_layout 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 111; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[unknown]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1
  - WebRender/compositor threads: Renderer 3 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 3 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 75 ms: buckets subprocess_pipe_io 75, worker_messaging 75, ipc 75, js_ctypes 75, poll_wait 75, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 75; `JSFunction::create(JSContext*, js::gc::AllocKind, ` 0
- **tab:10566** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10884** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10781** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf

- **parent** CPU ms by thread group: Renderer 593, SwComposite 526, main 404, BgPool 255, DOM Worker 225, WRRenderBackend 64, Compositor 33, other 27, ImageBridge 14, WRSceneBuilder 6, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 404 ms (13.1% of span): Idle 281, JavaScript 58, Other 36, DOM 21, Profiler 5, GC / CC 2
  - JS leaf 4 / native under JS 71 / native 328; buckets: ipc 403, poll_wait 303, gc_cc 62, engine_stream_read 42, worker_messaging 26, harness_diagnostics 26, subprocess_pipe_io 15, array_buffer_copy 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 296; `[unknown]` 9; `__lll_lock_wake [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `g_mutex_lock [libglib-2.0.so.0]` 3
  - GC/CC markers: GCMinor 1× 5 ms
  - WebRender/compositor threads: Renderer 593 ms (top self: `__syscall_cancel_arch [libc.so.6]` 230, `int blendTextureNearestFast<false, glsl::sampler2D` 124, `void scale_blit<true>(Texture&, IntRect const&, Te` 93); SwComposite 526 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 242, `syscall [libc.so.6]` 219, `__memmove_evex_unaligned_erms [libc.so.6]` 65); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 12, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #5 255 ms (top self: `__syscall_cancel_arch [libc.so.6]` 136, `__memmove_evex_unaligned_erms [libc.so.6]` 110, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[libxul.so]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 225 ms: buckets subprocess_pipe_io 225, worker_messaging 223, ipc 223, js_ctypes 201, poll_wait 196, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 199; `[axiosozo-dev]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 2; `[unknown]` 2; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 1
- **tab:10524** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10546** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10566** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 583, SwComposite 497, BgPool 255, DOM Worker 224, main 191, WRRenderBackend 63, Compositor 33, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 191 ms (6.3% of span): Idle 131, JavaScript 31, Other 17, DOM 10, GC / CC 2, Profiler 1
  - JS leaf 2 / native under JS 37 / native 152; buckets: ipc 190, poll_wait 138, gc_cc 43, engine_stream_read 28, worker_messaging 21, subprocess_pipe_io 10, array_buffer_copy 8, native_receiver 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 6; `JSStructuredCloneWriter::writeString(unsigned int, JSString*` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 9 ms
  - WebRender/compositor threads: Renderer 583 ms (top self: `__syscall_cancel_arch [libc.so.6]` 218, `int blendTextureNearestFast<false, glsl::sampler2D` 143, `void scale_blit<true>(Texture&, IntRect const&, Te` 99); SwComposite 497 ms (top self: `syscall [libc.so.6]` 229, `void scale_blit<true>(Texture&, IntRect const&, Te` 202, `__memmove_evex_unaligned_erms [libc.so.6]` 64); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 11, `__memmove_evex_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #5 255 ms (top self: `__syscall_cancel_arch [libc.so.6]` 129, `__memmove_evex_unaligned_erms [libc.so.6]` 114, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 224 ms: buckets subprocess_pipe_io 224, worker_messaging 224, ipc 224, js_ctypes 197, poll_wait 192, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 194; `[axiosozo-dev]` 5; `__lll_lock_wait [libc.so.6]` 4; `[unknown]` 4; `__memset_evex_unaligned_erms [libc.so.6]` 2
- **tab:10524** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10546** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::IToplevelProtocol::Lookup(long) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10781** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / scroll

- **parent** CPU ms by thread group: main 469, Renderer 391, SwComposite 340, DOM Worker 260, BgPool 195, WRRenderBackend 43, Compositor 21, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 469 ms (22.7% of span): Idle 274, JavaScript 80, Other 50, DOM 34, Graphics 13, Layout 8
  - JS leaf 11 / native under JS 104 / native 354; buckets: ipc 467, poll_wait 333, gc_cc 80, engine_stream_read 62, paint_layout 42, harness_diagnostics 39, worker_messaging 34, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 298; `[unknown]` 20; `__lll_lock_wake [libc.so.6]` 7; `__lll_lock_wait [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `webrtc::internal::(anonymous namespace)::WebRtcRecordableEnc` 5
  - GC/CC markers: GCMinor 1× 6 ms
  - WebRender/compositor threads: Renderer 391 ms (top self: `__syscall_cancel_arch [libc.so.6]` 153, `int blendTextureNearestFast<false, glsl::sampler2D` 84, `void scale_blit<true>(Texture&, IntRect const&, Te` 71); SwComposite 340 ms (top self: `syscall [libc.so.6]` 156, `void scale_blit<true>(Texture&, IntRect const&, Te` 147, `__memmove_evex_unaligned_erms [libc.so.6]` 35); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 9, `__lll_lock_wake [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #5 194 ms (top self: `__syscall_cancel_arch [libc.so.6]` 115, `__memmove_evex_unaligned_erms [libc.so.6]` 66, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `[axiosozo-dev]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 210, poll_wait 197, array_buffer_copy 21; top self: `__syscall_cancel_arch [libc.so.6]` 198; `__lll_lock_wake [libc.so.6]` 22; `[unknown]` 5; `[axiosozo-dev]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 3
- **tab:10566** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10546** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10524** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `CrashReporter::SetEventloopNestingLevel(unsigned int) [libxu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / key

- **parent** CPU ms by thread group: main 453, DOM Worker 205, Renderer 133, SwComposite 122, other 29, BgPool 26, WRRenderBackend 17, Compositor 16, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 453 ms (12.4% of span): Idle 231, JavaScript 85, Other 43, Layout 30, Graphics 26, DOM 22
  - JS leaf 12 / native under JS 131 / native 311; buckets: ipc 453, poll_wait 269, gc_cc 81, paint_layout 72, engine_stream_read 55, worker_messaging 54, harness_diagnostics 31, array_buffer_copy 18
  - top self: `__syscall_cancel_arch [libc.so.6]` 240; `[unknown]` 18; `[axiosozo-dev]` 6; `mprotect [libc.so.6]` 5; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame co` 4; `__memset_evex_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 5 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 133 ms (top self: `__syscall_cancel_arch [libc.so.6]` 39, `int blendTextureNearestFast<false, glsl::sampler2D` 31, `void scale_blit<true>(Texture&, IntRect const&, Te` 28); SwComposite 122 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 60, `syscall [libc.so.6]` 38, `__memmove_evex_unaligned_erms [libc.so.6]` 23); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 14, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #5 25 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 16, `__syscall_cancel_arch [libc.so.6]` 8, `mozilla::TaskQueue::Runner::~Runner() [libxul.so]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 192 ms: buckets subprocess_pipe_io 192, worker_messaging 192, ipc 192, js_ctypes 180, poll_wait 179, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 179; `mozilla::detail::MutexImpl::lock() [axiosozo-dev]` 3; `mozilla::JSEventHandler::HandleEvent(mozilla::dom:` 1; `js::gc::BufferAllocator::allocSmall(unsigned long,` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1
- **tab:10474** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `PerformPromiseThenWithReaction(JSContext*, JS::Handle<js::Pr` 0; `[unknown]` 0; `mozilla::ipc::MessageChannel::RunMessage(mozilla::ipc::Actor` 0; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10566** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10524** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: main 67, Renderer 32, DOM Worker 11, BgPool 5, SwComposite 4, WRRenderBackend 3, Compositor 2, IPC I/O 2, WRSceneBuilder 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 67 ms (24.4% of span): DOM 37, JavaScript 19, Layout 5, Idle 3, Other 2, Graphics 1
  - JS leaf 2 / native under JS 55 / native 10; buckets: ipc 67, gc_cc 43, array_buffer_copy 11, harness_diagnostics 9, engine_stream_read 8, worker_messaging 8, paint_layout 7, poll_wait 3
  - top self: `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifI` 32; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `AutoProfilerUntypedMarker::~AutoProfilerUntypedMarker() [lib` 2; `mprotect [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `__syscall_cancel_arch [libc.so.6]` 5, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 4); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 3, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 5 ms (top self: `fstatat64 [libc.so.6]` 2, `unlink [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #5 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, js_ctypes 11, poll_wait 10; top self: `__syscall_cancel_arch [libc.so.6]` 11; `__strlen_evex [libc.so.6]` 0
- **tab:10778** CPU ms by thread group: main 27, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 27 ms (9.9% of span): JavaScript 8, Other 7, Idle 5, Layout 3, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 10 / native 17; buckets: ipc 19, gc_cc 9, poll_wait 5, subprocess_pipe_io 4, paint_layout 2, memcpy_memset 1, harness_diagnostics 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `syscall [libc.so.6]` 2; `[]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `__lll_lock_wake [libc.so.6]` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10474** CPU ms by thread group: main 3, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 3, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10566** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **43.5** (main 15.1, DOM Worker 13.2, Renderer 9.5, WRScene~ilder# 1.9, WRRende~ckend# 1.9) | WPEWebProcess 56.8, AxioWebKitHost 17.0, WPENetworkProce 9.5 | — | 506.9 |
| plain | idle | — | — | **4.9** (main 3.9, Timer 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.2 | 24.0 | **32.6** (main 9.8, Renderer 7.2, SwComposite 5.6, DOM Worker 3.0, Backgro~Pool # 2.0) | WPEWebProcess 57.7, AxioWebKitHost 6.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **27.0** (Renderer 6.3, SwComposite 5.3, main 4.7, DOM Worker 3.0, Backgro~Pool # 2.7) | WPEWebProcess 57.2, AxioWebKitHost 7.0 | — | — |
| plain | scroll | 57.2 | 33.5 | **46.4** (main 18.4, Renderer 7.0, DOM Worker 5.5, SwComposite 5.0, Backgro~Pool # 3.5) | WPEWebProcess 61.7, AxioWebKitHost 9.5 | — | — |
| plain | key | — | — | **14.3** (main 7.7, Renderer 1.4, SwComposite 1.1, DOM Worker 1.1, glean.dispatche 0.6) | WPEWebProcess 7.5, AxioWebKitHost 1.4 | 16.4 | — |
| plain | switch-to-gecko | — | — | **26.3** (main 13.1, TaskCon~ller # 4.4, Renderer 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 210.4 |
| profile | switch-to-engine | — | — | **30.7** (DOM Worker 10.2, SamplerThread 8.7, main 5.8, IPC I/O Parent 1.5, Socket Thread 1.5) | WPEWebProcess 53.8, Web Content 33.4, AxioWebKitHost 14.5, WPENetworkProce 8.7 | — | 664.8 |
| profile | idle | — | — | **71.3** (DOM Worker 21.5, main 19.5, Indexed~ IO # 11.2, SamplerThread 8.8, IPDL Background 4.4) | Web Content 5.9, WebExtensions 1.5, Isolated Web Co 1.5, RDD Process 1.5 | — | — |
| profile | raf | 57.9 | 21.1 | **61.9** (main 14.7, DOM Worker 12.4, SamplerThread 9.5, Renderer 8.2, SwComposite 5.9) | WPEWebProcess 61.2, AxioWebKitHost 7.5, Web Content 6.8, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **51.2** (DOM Worker 10.0, main 8.3, Renderer 8.3, SamplerThread 8.0, SwComposite 6.3) | WPEWebProcess 60.7, AxioWebKitHost 7.3, Web Content 6.3, Isolated Web Co 1.6 | — | — |
| profile | scroll | 56.4 | 34.6 | **77.0** (main 26.3, DOM Worker 16.9, SamplerThread 9.4, Renderer 7.4, SwComposite 5.5) | WPEWebProcess 61.7, AxioWebKitHost 9.0, Web Content 6.0, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **36.8** (main 13.7, DOM Worker 8.0, SamplerThread 8.0, Timer 1.4, TaskCon~ller # 1.1) | Web Content 6.6, WPEWebProcess 6.3, AxioWebKitHost 1.9, WebExtensions 1.4 | 18.1 | — |
| profile | switch-to-gecko | — | — | **42.1** (main 16.9, DOM Worker 8.4, BgIOThr~Pool # 4.2, Renderer 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 4.2 | — | 215.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 2.9 | 0.0 | 0 | 0.0 | — | — | 146.5 | 0.0 | — | 1.94 | 0.66 | — | — | — | — | — | 0.002 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.16 | 0.14 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.18 | 0.15 | — | — | — | — | — | 0.011 |
| profile | scroll | 54.8 | 0.0 | 0 | 0.0 | — | — | 10.0 | 0.0 | — | 0.41 | 0.14 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.11 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.920 | 1.949 | 0.0034 | 0.0072 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.049 | 0.330 | 0.0028 | 0.0192 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.074 | 0.324 | 0.0043 | 0.0189 |
| plain | scroll | memfd | native | 112 | 112 | 0.233 | 0.316 | 0.0129 | 0.0175 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.397 | 0.0000 | 0.0022 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.974 | 1.315 | 0.0028 | 0.0038 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.064 | 0.390 | 0.0037 | 0.0226 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.080 | 0.385 | 0.0046 | 0.0223 |
| profile | scroll | memfd | native | 111 | 111 | 0.254 | 0.356 | 0.0139 | 0.0195 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.422 | 0.0000 | 0.0023 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 15.0 | 0.0 | — | 0.11 | 0.42 | — | — | 84.2 | 16.0 | 102.6 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 17.6; spawn AxioWebKitHost resolved 33.8; write hello 36.1; first stdout read resolved 118.0; write create 120.2; first frame applied (native receiver) 666.5; write frame_ack 667.7; write visibility 675.4; write focus 675.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.3; first stdout read resolved 25.9

### Profile: webkit-control / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 51, main 42, Renderer 11, BgPool 5, IPC I/O 3, Compositor 2, SwComposite 2, WRSceneBuilder 2, WRRenderBackend 2, Socket 1, ImageBridge 0, other 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 42 ms (6.0% of span): JavaScript 17, Idle 10, Layout 5, DOM 4, Graphics 4, Profiler 1
  - JS leaf 4 / native under JS 20 / native 18; buckets: ipc 41, gc_cc 20, poll_wait 13, paint_layout 10, array_buffer_copy 9, engine_stream_read 8, harness_diagnostics 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 1; `js::ProfilingStackFrame::setPC(unsigned char*) [libxul.so]` 1; `xpc::AccessCheck::subsumesConsideringDomain(JS::Realm*, JS::` 1; `js::frontend::ObjectEmitter::ObjectEmitter(js::frontend::Byt` 1
  - WebRender/compositor threads: Renderer 11 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `__syscall_cancel_arch [libc.so.6]` 1, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build_ite` 1, `mozilla::detail::RunnableFunction<mozilla::layers:` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__memset_evex_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - busiest DOM Worker 51 ms: buckets subprocess_pipe_io 51, worker_messaging 51, ipc 51, js_ctypes 50, poll_wait 47, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 47; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0; `js::GetProperty(JSContext*, JS::Handle<JS::Value>,` 0
- **tab:10061** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (6.9% of span): Other 37, DOM 4, Profiler 3, Idle 1, JavaScript 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 42; buckets: ipc 34, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 5, poll_wait 2, memcpy_memset 1
  - top self: `[]` 10; `[libfontconfig.so.1]` 3; `__strcmp_evex [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10058** CPU ms by thread group: main 46, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 46 ms (7.8% of span): Other 39, JavaScript 4, DOM 1, Idle 1, GC / CC 1, Profiler 1
  - JS leaf 0 / native under JS 2 / native 44; buckets: ipc 34, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 1, image_container 1
  - top self: `[libexpat.so.1]` 5; `__syscall_cancel_arch [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `[]` 3; `js::jit::JitCode::copyFrom(js::jit::MacroAssembler&) [libxul` 3; `mozilla::dom::Pref::operator=(mozilla::dom::Pref&&) [libxul.` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9966** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.2% of span): Idle 1, Graphics 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::nsDisplayItem::Destroy(mozilla::nsDisplayListBuilde` 0; `mozilla::ServoStyleSet::StyleDocument(mozilla::ServoTraversa` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / idle

- **parent** CPU ms by thread group: DOM Worker 377, main 370, other 16, Socket 8, BgPool 3, Compositor 2, Renderer 1, SwComposite 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 370 ms (18.0% of span): Idle 125, JavaScript 114, DOM 81, Other 32, Network 7, Profiler 6
  - JS leaf 14 / native under JS 163 / native 194; buckets: ipc 367, gc_cc 167, poll_wait 138, array_buffer_copy 63, memcpy_memset 23, harness_diagnostics 16, worker_messaging 4, engine_stream_read 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 18; `__memmove_evex_unaligned_erms [libc.so.6]` 14; `[axiosozo-dev]` 10; `validate (chrome://global/content/third_party/cfworker/json-` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 6
  - GC/CC markers: GCMinor 2× 4 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `[libfreeblpriv3.so]` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 275 ms: buckets worker_messaging 273, ipc 273, gc_cc 83, poll_wait 41, array_buffer_copy 37, memcpy_memset 15; top self: `[unknown]` 48; `__syscall_cancel_arch [libc.so.6]` 37; `jsesc (resource://gre/modules/third_party/jsesc/js` 21; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 15; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 10
- **tab:9653** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9749** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **utility:9810** CPU ms by thread group: main 1, IPC I/O 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit-control / raf

- **parent** CPU ms by thread group: main 430, DOM Worker 289, Renderer 241, SwComposite 180, BgPool 82, WRRenderBackend 57, Compositor 36, other 26, ImageBridge 15, WRSceneBuilder 7, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 430 ms (14.0% of span): Idle 281, JavaScript 73, Other 32, DOM 20, GC / CC 17, Profiler 7
  - JS leaf 4 / native under JS 88 / native 338; buckets: ipc 429, poll_wait 299, gc_cc 77, engine_stream_read 49, harness_diagnostics 34, worker_messaging 32, subprocess_pipe_io 19, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `[axiosozo-dev]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3
  - GC/CC markers: GCMajor 1× 536 ms, GCSlice 6× 19 ms, GCMinor 2× 5 ms
  - WebRender/compositor threads: Renderer 241 ms (top self: `__syscall_cancel_arch [libc.so.6]` 136, `int blendTextureNearestFast<false, glsl::sampler2D` 28, `void scale_blit<true>(Texture&, IntRect const&, Te` 22); SwComposite 180 ms (top self: `syscall [libc.so.6]` 109, `void scale_blit<true>(Texture&, IntRect const&, Te` 58, `__memmove_evex_unaligned_erms [libc.so.6]` 11); WRRenderBackend#0 57 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `__memmove_evex_unaligned_erms [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 238 ms: buckets subprocess_pipe_io 238, worker_messaging 238, ipc 238, js_ctypes 215, poll_wait 206, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 208; `[unknown]` 3; `[axiosozo-dev]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:9972** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9708** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9730** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / raf-nosampler

- **parent** CPU ms by thread group: main 235, DOM Worker 229, Renderer 218, SwComposite 180, BgPool 82, WRRenderBackend 53, Compositor 35, ImageBridge 15, WRSceneBuilder 7, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 235 ms (7.8% of span): Idle 104, JavaScript 50, GC / CC 45, Other 22, DOM 11, Profiler 3
  - JS leaf 4 / native under JS 52 / native 179; buckets: ipc 234, poll_wait 119, gc_cc 104, engine_stream_read 39, worker_messaging 26, subprocess_pipe_io 14, array_buffer_copy 12, native_receiver 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 117; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[unknown]` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4; `[axiosozo-dev]` 4; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 50 ms, GCSlice 6× 32 ms, CCSlice 2× 21 ms, GCMinor 1× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 218 ms (top self: `__syscall_cancel_arch [libc.so.6]` 105, `int blendTextureNearestFast<false, glsl::sampler2D` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 17); SwComposite 180 ms (top self: `syscall [libc.so.6]` 101, `void scale_blit<true>(Texture&, IntRect const&, Te` 66, `__memmove_evex_unaligned_erms [libc.so.6]` 10); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_evex_unaligned_erms [libc.so.6]` 18, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15, `__lll_lock_wake [libc.so.6]` 0, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 225 ms: buckets subprocess_pipe_io 225, worker_messaging 225, ipc 225, js_ctypes 202, poll_wait 195, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 196; `[unknown]` 2; `[axiosozo-dev]` 2; `JSStructuredCloneReader::startReadUnchecked(JS::Mu` 1; `mozilla::detail::nsTStringRepr<char16_t>::EqualsAS` 1
- **tab:9749** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9708** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9730** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / scroll

- **parent** CPU ms by thread group: main 489, DOM Worker 280, Renderer 139, SwComposite 113, BgPool 68, WRRenderBackend 36, Compositor 22, other 16, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 489 ms (24.2% of span): Idle 273, JavaScript 78, Other 61, GC / CC 26, DOM 20, Profiler 14
  - JS leaf 10 / native under JS 85 / native 394; buckets: ipc 486, poll_wait 328, gc_cc 95, engine_stream_read 44, paint_layout 34, harness_diagnostics 33, worker_messaging 31, array_buffer_copy 28
  - top self: `__syscall_cancel_arch [libc.so.6]` 299; `[unknown]` 13; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `[axiosozo-dev]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 4
  - GC/CC markers: GCMajor 1× 1052 ms, GCSlice 8× 34 ms, CCSlice 4× 9 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 139 ms (top self: `__syscall_cancel_arch [libc.so.6]` 95, `int blendTextureNearestFast<false, glsl::sampler2D` 11, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); SwComposite 113 ms (top self: `syscall [libc.so.6]` 86, `void scale_blit<true>(Texture&, IntRect const&, Te` 24, `UnlockResource [libxul.so]` 1); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 3, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 68 ms (top self: `__syscall_cancel_arch [libc.so.6]` 53, `__memmove_evex_unaligned_erms [libc.so.6]` 14, `mozilla::TaskQueue::Runner::Run() [libxul.so]` 1); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `mozilla::Queue<nsCOMPtr<nsIRunnable>, 16ul>::Pop()` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 279 ms: buckets subprocess_pipe_io 279, worker_messaging 278, ipc 278, js_ctypes 206, poll_wait 200, gc_cc 59; top self: `__syscall_cancel_arch [libc.so.6]` 201; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 7; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5; `madvise [libc.so.6]` 5
- **tab:9749** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9972** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `PR_GetCurrentThread [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9730** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / key

- **parent** CPU ms by thread group: main 449, DOM Worker 194, Renderer 44, SwComposite 34, other 27, Compositor 15, WRRenderBackend 13, BgPool 10, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 449 ms (12.3% of span): Idle 208, JavaScript 81, Other 39, Layout 31, DOM 28, Graphics 27
  - JS leaf 9 / native under JS 133 / native 308; buckets: ipc 449, poll_wait 250, gc_cc 103, paint_layout 74, worker_messaging 61, engine_stream_read 61, harness_diagnostics 25, array_buffer_copy 17
  - top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 16; `[axiosozo-dev]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4; `nsLayoutUtils::GetTransformToAncestor(mozilla::RelativeTo, m` 4
  - GC/CC markers: GCMajor 1× 1054 ms, GCSlice 5× 23 ms, GCMinor 2× 4 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__syscall_cancel_arch [libc.so.6]` 24, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); SwComposite 34 ms (top self: `syscall [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__memmove_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 193 ms: buckets subprocess_pipe_io 193, worker_messaging 193, ipc 193, js_ctypes 175, poll_wait 171, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 172; `__lll_lock_wake [libc.so.6]` 3; `[unknown]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1
- **tab:9653** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `__strlen_evex [libc.so.6]` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `[unknown]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9708** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9972** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 17, DOM Worker 11, BgPool 5, Compositor 3, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 66 ms (23.6% of span): JavaScript 31, Layout 8, Other 8, Graphics 7, Profiler 5, Idle 4
  - JS leaf 1 / native under JS 45 / native 20; buckets: ipc 66, array_buffer_copy 18, paint_layout 15, gc_cc 15, harness_diagnostics 11, poll_wait 7, engine_stream_read 4, memcpy_memset 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 5; `[unknown]` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 3; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 3
  - WebRender/compositor threads: Renderer 17 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 9, memcpy_memset 1; top self: `__syscall_cancel_arch [libc.so.6]` 10; `__lll_lock_wait [libc.so.6]` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyK` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0
- **tab:9966** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.5% of span): JavaScript 10, Other 6, Idle 5, Layout 3, DOM 2, Network 1
  - JS leaf 0 / native under JS 10 / native 16; buckets: ipc 24, paint_layout 9, gc_cc 9, poll_wait 5, subprocess_pipe_io 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__strlen_evex [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*,` 1; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9653** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 0, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9749** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, other 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

