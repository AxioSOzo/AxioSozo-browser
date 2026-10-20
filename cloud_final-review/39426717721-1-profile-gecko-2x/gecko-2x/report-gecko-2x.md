# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.1 | **8.8** (main 2.4, Renderer 2.4, DOM Worker 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **31.3** (Renderer 19.3, SwComposite 2.9, WRRende~ckend# 2.0, glean.dispatche 1.6, main 1.3) | Isolated Web Co 4.6, WebExtensions 0.6, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **23.4** (Renderer 11.9, glean.dispatche 2.0, WRRende~ckend# 2.0, SwComposite 2.0, main 1.7) | Isolated Web Co 4.3, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **86.6** (Renderer 65.4, SwComposite 5.9, main 4.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **8.9** (main 4.0, Renderer 1.3, TaskCon~ller # 0.8, WRRende~ckend# 0.8, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3 | 8.0 | — |
| trace | idle | 59.4 | 17.2 | **3.9** (main 1.9, TaskCon~ller # 1.0, glean.dispatche 0.5, Renderer 0.5) | Isolated Web Co 1.5, Web Content 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **19.6** (Renderer 7.8, WRRende~ckend# 2.0, SwComposite 2.0, main 1.6, glean.dispatche 1.6) | Isolated Web Co 4.6 | — | — |
| trace | raf-nosampler | — | — | **21.2** (Renderer 11.3, glean.dispatche 2.0, WRRende~ckend# 2.0, SwComposite 2.0, Compositor 1.7) | Isolated Web Co 5.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **89.2** (Renderer 66.0, main 5.9, SwComposite 5.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| trace | key | — | — | **52.9** (main 17.6, DOM Worker 16.8, IPDL Background 6.4, TaskCon~ller # 2.4, StreamTrans # 2.4) | Isolated Web Co 1.6, WebExtensions 0.3, Privileged Cont 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **8.7** (SamplerThread 3.9, main 2.4, TaskCon~ller # 1.9, DOM Worker 0.5) | Web Content 8.2, Isolated Web Co 3.4, Socket Process 1.4, RDD Process 1.4 | — | — |
| profile | raf | 59.0 | 17.1 | **30.9** (Renderer 9.7, SamplerThread 6.2, SwComposite 2.9, WRRende~ckend# 2.3, Compositor 2.3) | Isolated Web Co 10.3, Web Content 8.4, Socket Process 1.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **31.4** (Renderer 13.2, SamplerThread 6.3, WRRende~ckend# 2.3, SwComposite 2.3, Compositor 2.0) | Isolated Web Co 10.6, Web Content 9.6, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **112.3** (Renderer 75.3, SamplerThread 10.7, SwComposite 7.8, main 6.3, WRRende~ckend# 5.3) | Isolated Web Co 10.7, Web Content 9.7, WebExtensions 2.4, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **16.5** (main 6.1, SamplerThread 4.5, Renderer 1.6, TaskCon~ller # 0.8, Compositor 0.8) | Web Content 8.5, Isolated Web Co 4.3, WebExtensions 1.9, Socket Process 1.6 | 7.0 | — |

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

- **parent** CPU ms by thread group: main 51, Compositor 2, IPC I/O 1, DOM Worker 1, Renderer 1, SwComposite 1, Socket 1, other 1, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (2.4% of span): GC / CC 26, Idle 9, Other 9, JavaScript 6, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 6 / native 45; buckets: ipc 51, gc_cc 30, poll_wait 14, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 1, paint_layout 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `recvmsg [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 0); SwComposite 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `std::__detail::_Map_base<mozilla::layers::LayersId` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `[linux-vdso.so.1]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 26, IPC I/O 5, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (1.3% of span): Idle 16, GC / CC 5, JavaScript 2, Other 2, Profiler 1, Layout 0
  - JS leaf 0 / native under JS 2 / native 24; buckets: ipc 25, poll_wait 18, gc_cc 7, harness_diagnostics 2, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [li` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `XPCNativeInterface::NewInstance(JSContext*, IID2NativeInterf` 1; `CCGraphBuilder::DescribeRefCountedNode(unsigned long, char c` 1; `js::SharedImmutableStringsCache::getOrCreate(std::unique_ptr` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3181** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `<std::sys::sync::once::futex::Once>::call [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3395** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 283, SwComposite 76, WRRenderBackend 68, main 62, WRSceneBuilder 58, Compositor 46, IPC I/O 12, DOM Worker 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 62 ms (2.0% of span): GC / CC 27, Idle 26, JavaScript 6, Layout 2, Graphics 1, Other 0
  - JS leaf 1 / native under JS 5 / native 57; buckets: ipc 62, gc_cc 30, poll_wait 27, harness_diagnostics 4, array_buffer_copy 3, paint_layout 3, json_metadata 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 283 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 90, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `ps_quad_mask_FAST_PATH_frag::run(glsl::FragmentSha` 15); SwComposite 76 ms (top self: `syscall [libc.so.6]` 70, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeT` 0); WRRenderBackend#0 68 ms (top self: `syscall [libc.so.6]` 57, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 0
- **tab:3304** CPU ms by thread group: main 185, IPC I/O 17, other 3, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 185 ms (5.9% of span): Idle 111, Graphics 23, Layout 21, Other 9, Profiler 7, GC / CC 6
  - JS leaf 0 / native under JS 10 / native 175; buckets: ipc 176, poll_wait 111, paint_layout 59, gc_cc 9, memcpy_memset 3, harness_diagnostics 3, subprocess_pipe_io 2, canvas_2d 2
  - top self: `poll [libc.so.6]` 111; `sendmsg [libc.so.6]` 5; `[]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 13 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3395** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 380, WRRenderBackend 65, SwComposite 64, WRSceneBuilder 54, Compositor 47, main 16, IPC I/O 11, other 2, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 16 ms (0.5% of span): Idle 11, JavaScript 4, DOM 1, Graphics 0, Other 0
  - JS leaf 1 / native under JS 4 / native 12; buckets: ipc 16, poll_wait 12, harness_diagnostics 4, array_buffer_copy 4, paint_layout 0
  - top self: `poll [libc.so.6]` 11; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `nsTSubstring<char>::Append(char) [libxul.so]` 1; `js::NewPlainObjectWithProto(JSContext*, JS::Handle<JSObject*` 1; `deserializeJSON (chrome://remote/content/marionette/json.sys` 1; `__lll_lock_wake [libc.so.6]` 1
  - GC/CC markers: GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 380 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 100, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 53); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); SwComposite 64 ms (top self: `syscall [libc.so.6]` 57, `__memmove_avx_unaligned_erms [libc.so.6]` 7)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 166, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 166 ms (5.5% of span): Idle 108, Graphics 20, Layout 17, Other 12, Profiler 7, DOM 2
  - JS leaf 0 / native under JS 4 / native 163; buckets: ipc 160, poll_wait 111, paint_layout 45, memcpy_memset 4, subprocess_pipe_io 3, canvas_2d 3, gc_cc 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 109; `sendmsg [libc.so.6]` 3; `[]` 3; `write [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3395** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1505, SwComposite 138, main 133, WRRenderBackend 96, Compositor 34, WRSceneBuilder 24, IPC I/O 9, Socket 1, other 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 133 ms (6.4% of span): Idle 73, Other 18, Graphics 13, JavaScript 11, Layout 8, GC / CC 8
  - JS leaf 2 / native under JS 9 / native 122; buckets: ipc 133, poll_wait 103, paint_layout 21, gc_cc 13, harness_diagnostics 8, array_buffer_copy 4, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 74; `mozilla::layers::WebRenderCommandBuilder::CreateWebRenderCom` 3; `mozilla::dom::BrowserHost::QueryInterface(nsID const&, void*` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `recvmsg [libc.so.6]` 2; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 2
  - GC/CC markers: CCSlice 1× 4 ms, GCSlice 4× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1505 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 441, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 333, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 107); SwComposite 138 ms (top self: `syscall [libc.so.6]` 128, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 96 ms (top self: `syscall [libc.so.6]` 56, `webrender::batch::BatchBuilder::add_prim_to_batch:` 4, `webrender::prepare::prepare_prim_for_render [libxu` 4)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 111, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 111 ms (5.3% of span): Idle 74, Graphics 12, Other 9, GC / CC 6, JavaScript 5, Layout 4
  - JS leaf 0 / native under JS 5 / native 107; buckets: ipc 109, poll_wait 76, paint_layout 18, gc_cc 8, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 75; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `sendmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 19 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3181** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `TimerThread::RemoveTimerInternal(nsTimerImpl&) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 218, Renderer 52, WRRenderBackend 21, Compositor 20, SwComposite 16, WRSceneBuilder 15, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 218 ms (5.8% of span): Idle 44, Layout 44, GC / CC 31, Graphics 30, JavaScript 30, Other 28
  - JS leaf 3 / native under JS 36 / native 179; buckets: ipc 218, paint_layout 76, poll_wait 68, gc_cc 50, array_buffer_copy 8, harness_diagnostics 7, subprocess_pipe_io 5, memcpy_memset 4
  - top self: `poll [libc.so.6]` 46; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 4; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, ` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - GC/CC markers: GCMajor 1× 52 ms, GCSlice 7× 26 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 52 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 18, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `[axiosozo-dev]` 1); SwComposite 16 ms (top self: `syscall [libc.so.6]` 13, `__memmove_avx_unaligned_erms [libc.so.6]` 3)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3304** CPU ms by thread group: main 69, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (1.8% of span): Idle 23, Other 10, JavaScript 8, GC / CC 8, Layout 6, DOM 6
  - JS leaf 0 / native under JS 10 / native 59; buckets: ipc 66, poll_wait 23, paint_layout 20, gc_cc 13, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 5; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2; `getcontext [libc.so.6]` 1; `[]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3130** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `sendmsg [libc.so.6]` 0; `mozilla::dom::Promise::MaybeResolve(JSContext*, JS::Handle<J` 0; `__strlen_avx2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3203** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimer::Cancel() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

