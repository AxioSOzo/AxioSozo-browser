# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **8.0** (main 2.0, Renderer 2.0, DOM Worker 1.5, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 2.9, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **29.3** (Renderer 17.5, SwComposite 4.0, main 1.6, WRRende~ckend# 1.6, WRScene~ilder# 1.3) | Isolated Web Co 3.6, Privileged Cont 0.7, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.6** (Renderer 10.3, SwComposite 2.7, WRRende~ckend# 2.0, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 4.4, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **71.6** (Renderer 52.1, SwComposite 8.5, WRRende~ckend# 3.5, main 3.0, glean.dispatche 1.0) | Isolated Web Co 3.0, Web Content 1.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.6** (main 4.0, Renderer 1.3, TaskCon~ller # 0.8, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.0 | — |
| trace | idle | 59.1 | 17.2 | **6.0** (main 2.5, TaskCon~ller # 1.5, Renderer 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.2 | **17.9** (Renderer 7.6, SwComposite 3.0, WRRende~ckend# 2.0, Compositor 1.3, WRScene~ilder# 1.0) | Isolated Web Co 3.3 | — | — |
| trace | raf-nosampler | — | — | **19.1** (Renderer 9.3, SwComposite 2.7, WRScene~ilder# 1.7, WRRende~ckend# 1.7, glean.dispatche 1.3) | Isolated Web Co 3.6 | — | — |
| trace | scroll | 59.0 | 17.1 | **73.6** (Renderer 51.6, SwComposite 9.0, main 5.0, WRRende~ckend# 3.5, TaskCon~ller # 1.0) | Isolated Web Co 4.0 | — | — |
| trace | key | — | — | **48.0** (main 15.5, DOM Worker 15.3, IPDL Background 5.1, Indexed~ IO # 3.5, TaskCon~ller # 2.4) | Isolated Web Co 1.1, WebExtensions 0.6, RDD Process 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.1 | **11.4** (DOM Worker 2.9, main 2.5, SamplerThread 2.5, TaskCon~ller # 2.0, Softwar~cThread 1.0) | Web Content 5.4, Isolated Web Co 3.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **24.9** (Renderer 8.2, SamplerThread 4.3, SwComposite 3.0, WRRende~ckend# 2.3, WRScene~ilder# 1.6) | Isolated Web Co 7.5, Web Content 5.6, WebExtensions 1.0, Socket Process 0.7 | — | — |
| profile | raf-nosampler | — | — | **26.9** (Renderer 10.3, SamplerThread 4.0, SwComposite 2.7, WRScene~ilder# 2.0, WRRende~ckend# 2.0) | Isolated Web Co 7.7, Web Content 5.0, WebExtensions 1.3, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **89.9** (Renderer 56.4, SwComposite 10.0, SamplerThread 6.5, main 6.0, WRRende~ckend# 4.5) | Isolated Web Co 8.0, Web Content 5.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **13.1** (main 5.1, SamplerThread 2.7, Renderer 1.6, Compositor 0.8, IPC I/O Parent 0.5) | Web Content 5.4, Isolated Web Co 3.5, WebExtensions 1.4, Utility Process 1.3 | 8.5 | — |

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

- **parent** CPU ms by thread group: main 48, DOM Worker 42, Renderer 2, SwComposite 2, IPC I/O 1, Socket 1, Compositor 0, WRSceneBuilder 0, other 0, WRRenderBackend 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 48 ms (2.3% of span): GC / CC 30, Other 7, Idle 5, JavaScript 4, DOM 2, Graphics 1
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 48, gc_cc 33, poll_wait 10, harness_diagnostics 4, array_buffer_copy 4, paint_layout 1, memcpy_memset 0, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<js::BaseScr` 2; `syscall [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 7× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 2 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 2 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 38 ms: buckets worker_messaging 38, ipc 38, gc_cc 38, memcpy_memset 16, poll_wait 0; top self: `madvise [libc.so.6]` 13; `unsigned long js::gc::Arena::finalize<JSString, (j` 7; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `munmap [libc.so.6]` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:3106** CPU ms by thread group: main 19, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 19 ms (0.9% of span): Idle 15, JavaScript 3, Other 1, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 3 / native 16; buckets: ipc 19, poll_wait 15, harness_diagnostics 3, gc_cc 2, array_buffer_copy 1, paint_layout 0
  - top self: `poll [libc.so.6]` 15; `js::jit::DoTypeOfFallback(JSContext*, js::jit::BaselineFrame` 2; `js::jit::JitHintsMap::mightHaveEagerBaselineHint(JSScript*) ` 1; `write [libc.so.6]` 0; `firefox_on_glean::private::timing_distribution::TimingDistri` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3044** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__memcmp_evex_movbe [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3004** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 236, SwComposite 88, WRRenderBackend 62, WRSceneBuilder 51, Compositor 40, main 26, IPC I/O 9, other 1, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 26 ms (0.9% of span): Idle 18, JavaScript 4, Layout 2, Other 1, Graphics 1, Profiler 0
  - JS leaf 0 / native under JS 4 / native 22; buckets: ipc 26, poll_wait 18, paint_layout 3, harness_diagnostics 3, gc_cc 2, array_buffer_copy 2, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 18; `mozilla::RetainedDisplayListBuilder::PreProcessDisplayList(m` 1; `js::jit::GetPropIRGenerator::tryAttachTypedArrayElement(JS::` 1; `mozilla::ComputedStyle::HasAnchorPosReference() const [libxu` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<n` 1
  - WebRender/compositor threads: Renderer 236 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 81, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 37, `int blendTextureNearestFast<true, glsl::sampler2D_` 18); SwComposite 88 ms (top self: `syscall [libc.so.6]` 71, `__memmove_avx512_unaligned_erms [libc.so.6]` 16, `UnlockResource [libxul.so]` 0); WRRenderBackend#0 62 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 4, `webrender::invalidation::quadtree::TileNode::updat` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3106** CPU ms by thread group: main 154, IPC I/O 13, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 155 ms (5.1% of span): Idle 98, Graphics 17, Layout 13, Other 12, Profiler 7, GC / CC 5
  - JS leaf 0 / native under JS 5 / native 150; buckets: ipc 144, poll_wait 99, paint_layout 38, gc_cc 8, memcpy_memset 1, harness_diagnostics 1, canvas_2d 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 98; `sendmsg [libc.so.6]` 4; `[]` 3; `[linux-vdso.so.1]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 6× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3004** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__pthread_enable_asynccancel [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3145** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 298, SwComposite 75, WRRenderBackend 60, WRSceneBuilder 48, Compositor 39, main 39, IPC I/O 8, other 1, DOM Worker 1, Socket 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 39 ms (1.3% of span): GC / CC 25, Idle 10, JavaScript 3, Other 2, Graphics 0, Profiler 0
  - JS leaf 1 / native under JS 2 / native 37; buckets: ipc 39, gc_cc 27, poll_wait 10, harness_diagnostics 3, array_buffer_copy 2, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScript` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 2; `nsWindowRoot::AddRef() [libxul.so]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 5× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 298 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 48, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 32); SwComposite 75 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 16, `webrender::compositor::sw_compositor::SwCompositeT` 0); WRRenderBackend#0 60 ms (top self: `syscall [libc.so.6]` 49, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3106** CPU ms by thread group: main 144, IPC I/O 13, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 144 ms (4.8% of span): Idle 102, Graphics 15, Layout 12, Profiler 7, Other 5, GC / CC 3
  - JS leaf 0 / native under JS 4 / native 140; buckets: ipc 139, poll_wait 102, paint_layout 34, gc_cc 4, canvas_2d 2, subprocess_pipe_io 1, memcpy_memset 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 102; `[]` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `sendmsg [libc.so.6]` 1; `mozilla::layers::apz::GetDisplayportAlignmentMultiplier(mozi` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 6× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3145** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3044** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1112, SwComposite 187, main 117, WRRenderBackend 76, Compositor 29, WRSceneBuilder 23, IPC I/O 7, DOM Worker 1, Socket 1, other 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 117 ms (5.8% of span): Idle 63, GC / CC 27, Other 10, Graphics 9, JavaScript 6, Layout 2
  - JS leaf 0 / native under JS 6 / native 111; buckets: ipc 117, poll_wait 77, gc_cc 29, paint_layout 11, harness_diagnostics 6, array_buffer_copy 3, memcpy_memset 3, json_metadata 1
  - top self: `poll [libc.so.6]` 63; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 2; `js::gc::BufferAllocator::bumpAlloc(unsigned long, unsigned l` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 7× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1112 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 340, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 226, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 87); SwComposite 187 ms (top self: `syscall [libc.so.6]` 152, `__memmove_avx512_unaligned_erms [libc.so.6]` 33, `void scale_blit<false>(Texture&, IntRect const&, T` 2); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 49, `webrender::prepare::prepare_prim_for_render [libxu` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3106** CPU ms by thread group: main 94, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 94 ms (4.7% of span): Idle 59, Graphics 11, Other 8, GC / CC 7, JavaScript 4, Profiler 2
  - JS leaf 0 / native under JS 3 / native 91; buckets: ipc 91, poll_wait 61, paint_layout 16, gc_cc 8, harness_diagnostics 2, memcpy_memset 1, array_buffer_copy 1, webrender_render 0
  - top self: `poll [libc.so.6]` 60; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `sendmsg [libc.so.6]` 2; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 5× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3004** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3044** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 184, Renderer 49, WRRenderBackend 18, SwComposite 17, Compositor 16, WRSceneBuilder 14, IPC I/O 7, other 2, Socket 1, BgPool 1, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 184 ms (4.9% of span): Idle 40, Layout 34, GC / CC 28, Graphics 27, JavaScript 24, Other 18
  - JS leaf 3 / native under JS 27 / native 154; buckets: ipc 182, paint_layout 64, poll_wait 58, gc_cc 34, subprocess_pipe_io 6, memcpy_memset 5, array_buffer_copy 5, harness_diagnostics 5
  - top self: `poll [libc.so.6]` 41; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `mozilla::dom::ResizeObservation::IsActive() const [libxul.so` 3; `gfxFontGroup::GetUnderlineOffset() [libxul.so]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 57 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 49 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 16, `mozilla::ThreadEventTarget::Dispatch(already_AddRe` 0, `webrender::render_task_graph::RenderTaskGraphBuild` 0); SwComposite 17 ms (top self: `syscall [libc.so.6]` 11, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `webrender::compositor::sw_compositor::SwCompositeT` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3106** CPU ms by thread group: main 63, IPC I/O 6, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 63 ms (1.7% of span): Idle 25, Layout 10, Other 9, JavaScript 8, GC / CC 6, DOM 2
  - JS leaf 0 / native under JS 9 / native 55; buckets: ipc 60, poll_wait 25, paint_layout 14, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 25; `sendmsg [libc.so.6]` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `[]` 1; `mozilla::dom::FragmentOrElement::cycleCollection::TraverseNa` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:2956** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, JavaScript 1, DOM 1, GC / CC 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0; `mozilla::ipc::MessageChannel::DispatchAsyncMessage(mozilla::` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 0; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3004** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

