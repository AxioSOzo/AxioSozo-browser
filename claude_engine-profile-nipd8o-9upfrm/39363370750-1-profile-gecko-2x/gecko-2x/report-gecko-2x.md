# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.1 | **5.8** (main 1.9, Renderer 1.9, SwComposite 1.0, glean.dispatche 0.5, Compositor 0.5) | Web Content 3.4, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **36.1** (Renderer 20.8, SwComposite 3.6, WRRende~ckend# 2.6, main 2.0, glean.dispatche 1.6) | Isolated Web Co 5.6, WebExtensions 0.6, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **94.1** (Renderer 68.5, SwComposite 7.3, main 6.9, WRRende~ckend# 4.4, glean.dispatche 2.0) | Isolated Web Co 4.9, WebExtensions 0.5, Web Content 0.5 | — | — |
| plain | key | — | — | **9.9** (main 4.8, Renderer 1.3, Compositor 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5) | Isolated Web Co 1.9, WebExtensions 0.6, Privileged Cont 0.3 | 9.0 | — |
| trace | idle | 59.1 | 17.1 | **3.0** (Renderer 1.0, main 0.5, IPDL Background 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Isolated Web Co 2.0 | — | — |
| trace | raf | 59.0 | 17.2 | **23.4** (Renderer 9.5, WRRende~ckend# 2.6, SwComposite 2.6, main 1.6, glean.dispatche 1.6) | Isolated Web Co 5.2 | — | — |
| trace | scroll | 59.0 | 17.1 | **87.7** (Renderer 67.0, SwComposite 7.4, main 4.9, WRRende~ckend# 4.4, WRScene~ilder# 1.5) | Isolated Web Co 4.9 | — | — |
| trace | key | — | — | **9.2** (main 4.3, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.6 | 9.5 | — |
| profile | idle | 59.5 | 17.3 | **123.0** (DOM Worker 31.0, main 28.6, IndexedDB IO # 25.2, IPDL Background 12.9, SamplerThread 9.0) | Web Content 9.5, Isolated Web Co 5.3, WebExtensions 3.4, Privileged Cont 2.9 | — | — |
| profile | raf | 59.0 | 17.2 | **39.3** (Renderer 11.7, SamplerThread 6.8, main 3.6, SwComposite 3.2, WRRende~ckend# 2.9) | Isolated Web Co 12.3, Web Content 8.4, Privileged Cont 1.9, Socket Process 1.6 | — | — |
| profile | scroll | 59.0 | 17.2 | **120.4** (Renderer 76.5, SamplerThread 10.7, main 8.8, SwComposite 8.8, WRRende~ckend# 5.4) | Isolated Web Co 10.2, Web Content 9.7, Privileged Cont 2.9, Socket Process 1.9 | — | — |
| profile | key | — | — | **17.6** (main 6.1, SamplerThread 4.8, Renderer 1.6, TaskCon~ller # 0.8, Compositor 0.8) | Web Content 9.0, Isolated Web Co 4.6, WebExtensions 2.2, Privileged Cont 1.9 | 9.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — | — |

### Profile: gecko-2x / idle

- **parent** CPU ms by thread group: DOM Worker 612, main 574, Socket 22, other 6, Compositor 2, IPC I/O 1, Renderer 1, SwComposite 1, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 574 ms (26.9% of span): JavaScript 187, DOM 146, Idle 108, Other 94, Network 17, Profiler 13
  - JS leaf 32 / native under JS 265 / native 277; buckets: ipc 574, gc_cc 315, poll_wait 159, array_buffer_copy 94, memcpy_memset 20, worker_messaging 17, paint_layout 1
  - top self: `poll [libc.so.6]` 119; `[unknown]` 26; `recvmsg [libc.so.6]` 22; `[axiosozo-dev]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 13; `validate (chrome://global/content/third_party/cfworker/json-` 13
  - GC/CC markers: GCMinor 7× 10 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 610 ms: buckets worker_messaging 610, ipc 610, gc_cc 171, poll_wait 145, array_buffer_copy 80, memcpy_memset 22; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 129; `[unknown]` 85; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 37; `jsesc (resource://gre/modules/third_party/jsesc/js` 33; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 31
- **tab:3330** CPU ms by thread group: main 37, IPC I/O 7, other 0, Socket 0, ImageIO 0
  - main thread 37 ms (1.7% of span): Idle 25, GC / CC 4, JavaScript 3, Other 3, Layout 1, DOM 1
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 35, poll_wait 25, gc_cc 8, array_buffer_copy 3, paint_layout 2, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 25; `sendmsg [libc.so.6]` 2; `[]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBa` 1
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3272** CPU ms by thread group: main 5, IPC I/O 3, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (0.2% of span): Idle 4, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 5, poll_wait 4, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 4; `js::jit::CacheRegisterAllocator::initInputLocation(unsigned ` 0; `[linux-vdso.so.1]` 0; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:3188** CPU ms by thread group: main 3, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `write [libc.so.6]` 0

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 346, main 100, SwComposite 92, WRRenderBackend 82, WRSceneBuilder 69, Compositor 55, DOM Worker 46, IPC I/O 14, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 100 ms (3.2% of span): GC / CC 62, Idle 31, Layout 3, Other 2, Graphics 1, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 99; buckets: ipc 99, gc_cc 62, poll_wait 32, paint_layout 4, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 31; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 4; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 4; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 3
  - GC/CC markers: GCMajor 1× 138 ms, GCSlice 8× 35 ms, CCSlice 4× 28 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 346 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 110, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 67, `ps_quad_mask_FAST_PATH_frag::run(glsl::FragmentSha` 23); SwComposite 92 ms (top self: `syscall [libc.so.6]` 87, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeJ` 0); WRRenderBackend#0 82 ms (top self: `syscall [libc.so.6]` 68, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - busiest DOM Worker 44 ms: buckets gc_cc 43, worker_messaging 43, ipc 43, memcpy_memset 18, poll_wait 1; top self: `madvise [libc.so.6]` 15; `unsigned long js::gc::Arena::finalize<JSString, (j` 8; `munmap [libc.so.6]` 3; `mozilla::CycleCollectedJSRuntime::NoteGCThingXPCOM` 2; `void js::gc::ArenaLists::backgroundFinalize<(js::g` 2
- **tab:3330** CPU ms by thread group: main 237, IPC I/O 21, other 3, Socket 0, ImageIO 0
  - main thread 237 ms (7.6% of span): Idle 105, Graphics 50, Layout 35, Profiler 16, Other 10, GC / CC 9
  - JS leaf 0 / native under JS 17 / native 220; buckets: ipc 218, poll_wait 108, paint_layout 102, gc_cc 13, subprocess_pipe_io 6, canvas_2d 5, memcpy_memset 4, array_buffer_copy 3
  - top self: `poll [libc.so.6]` 106; `[]` 14; `sendmsg [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `getcontext [libc.so.6]` 3; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 2
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 6× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3233** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:3419** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1518, main 173, SwComposite 154, WRRenderBackend 102, Compositor 36, WRSceneBuilder 26, IPC I/O 10, other 2, DOM Worker 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 173 ms (8.3% of span): Idle 76, GC / CC 38, Other 34, Graphics 8, Layout 7, JavaScript 7
  - JS leaf 1 / native under JS 7 / native 165; buckets: ipc 173, poll_wait 113, gc_cc 42, paint_layout 15, memcpy_memset 3, array_buffer_copy 3, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 79; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 6; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 3; `mozilla::detail::Maybe_CopyMove_Enabler<nsTString<char>, fal` 2
  - GC/CC markers: GCMajor 1× 66 ms, GCSlice 8× 29 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1518 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 477, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 318, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 99); SwComposite 154 ms (top self: `syscall [libc.so.6]` 137, `__memmove_avx_unaligned_erms [libc.so.6]` 17, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 102 ms (top self: `syscall [libc.so.6]` 63, `sched_yield [libc.so.6]` 4, `core::hash::BuildHasher::hash_one [libxul.so]` 3)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1, memcpy_memset 0; top self: `void js::gc::ArenaLists::backgroundFinalize<(js::g` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 0
- **tab:3330** CPU ms by thread group: main 109, IPC I/O 18, other 1, Socket 0, ImageIO 0
  - main thread 109 ms (5.2% of span): Idle 72, Graphics 17, Other 13, Layout 3, JavaScript 2, Profiler 1
  - JS leaf 0 / native under JS 3 / native 106; buckets: ipc 106, poll_wait 74, paint_layout 22, array_buffer_copy 2, canvas_2d 1, gc_cc 1, memcpy_memset 0, webrender_render 0
  - top self: `poll [libc.so.6]` 72; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped` 2; `[]` 1; `nsIFrame::RemoveDisplayItem(mozilla::nsDisplayItem*) [libxul` 1; `sendmsg [libc.so.6]` 1
- **tab:3416** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:3254** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 223, Renderer 57, WRRenderBackend 23, Compositor 21, WRSceneBuilder 16, SwComposite 15, IPC I/O 10, DOM Worker 5, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 223 ms (5.9% of span): Layout 49, Idle 47, JavaScript 34, GC / CC 32, Graphics 25, Other 21
  - JS leaf 2 / native under JS 37 / native 184; buckets: ipc 222, paint_layout 78, poll_wait 68, gc_cc 52, subprocess_pipe_io 11, array_buffer_copy 7, memcpy_memset 3, canvas_2d 1
  - top self: `poll [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 6; `mprotect [libc.so.6]` 5; `AnchorResolvedMarginHelper::FromUnresolved(mozilla::StyleGen` 4; `mozilla::nsDisplayItem::nsDisplayItem(mozilla::nsDisplayList` 4
  - GC/CC markers: GCMajor 1× 69 ms, GCSlice 8× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 57 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); WRRenderBackend#0 23 ms (top self: `syscall [libc.so.6]` 19, `sched_yield [libc.so.6]` 1, `webrender::invalidation::quadtree::TileNode::updat` 1); WRSceneBuilder#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `madvise [libc.so.6]` 2; `js::gcstats::Statistics::endPhase(js::gcstats::Pha` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*` 0
- **tab:3330** CPU ms by thread group: main 60, IPC I/O 8, other 0, Socket 0, ImageIO 0
  - main thread 60 ms (1.6% of span): Idle 26, Other 11, JavaScript 8, Layout 5, DOM 4, Profiler 3
  - JS leaf 0 / native under JS 7 / native 52; buckets: ipc 57, poll_wait 26, paint_layout 17, gc_cc 3, array_buffer_copy 3, memcpy_memset 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 26; `sendmsg [libc.so.6]` 6; `[]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `non-virtual thunk to nsGlobalWindowInner::GetExistingDebugge` 1; `webrtc::SampleCounter::NumSamples() const [libxul.so]` 1
- **tab:3188** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `syscall [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:3233** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTA` 0

