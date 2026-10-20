# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.2 | **6.9** (main 2.4, DOM Worker 1.5, IPDL Background 1.0, Renderer 1.0, glean.dispatche 0.5) | Web Content 3.9, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **30.8** (Renderer 16.6, WRRende~ckend# 2.9, main 2.3, glean.dispatche 2.3, TaskCon~ller # 1.6) | Isolated Web Co 6.2, WebExtensions 1.0, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **52.8** (Renderer 31.5, main 7.4, WRRende~ckend# 4.4, Compositor 2.5, SwComposite 2.0) | Isolated Web Co 5.4, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.8** (main 4.2, Renderer 1.3, IPC I/O Parent 0.5, IPDL Background 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, WebExtensions 0.5 | 8.0 | — |
| trace | idle | 59.0 | 17.2 | **3.0** (main 1.5, Softwar~cThread 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.2 | **23.5** (Renderer 11.1, WRRende~ckend# 2.9, glean.dispatche 2.0, WRScene~ilder# 2.0, main 1.6) | Isolated Web Co 5.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **48.8** (Renderer 31.5, main 5.4, WRRende~ckend# 3.9, glean.dispatche 2.0, SwComposite 2.0) | Isolated Web Co 5.9 | — | — |
| trace | key | — | — | **9.4** (main 4.5, Renderer 0.8, WRRende~ckend# 0.8, Compositor 0.8, glean.dispatche 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.5 | — |
| profile | idle | 59.5 | 17.2 | **121.6** (DOM Worker 36.7, main 24.8, IndexedDB IO # 20.0, IPDL Background 11.4, SamplerThread 8.6) | Web Content 11.0, Isolated Web Co 5.3, Privileged Cont 2.9, Socket Process 2.4 | — | — |
| profile | raf | 59.0 | 17.2 | **49.8** (Renderer 13.3, main 8.7, SamplerThread 7.1, WRRende~ckend# 3.2, DOM Worker 2.6) | Isolated Web Co 12.9, Web Content 9.1, Privileged Cont 2.5, RDD Process 1.9 | — | — |
| profile | scroll | 59.0 | 17.2 | **71.4** (Renderer 35.6, main 9.3, SamplerThread 9.3, WRRende~ckend# 5.4, Compositor 2.4) | Isolated Web Co 11.2, Web Content 9.8, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **16.1** (main 6.1, SamplerThread 4.5, Renderer 1.1, glean.dispatche 0.8, TaskCon~ller # 0.8) | Web Content 8.5, Isolated Web Co 4.8, WebExtensions 1.9, Privileged Cont 1.6 | 9.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — | — |

### Profile: gecko / idle

- **parent** CPU ms by thread group: DOM Worker 742, main 506, Socket 17, other 10, Compositor 3, IPC I/O 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 506 ms (23.7% of span): JavaScript 166, DOM 148, Idle 95, Other 67, GC / CC 13, Network 11
  - JS leaf 30 / native under JS 256 / native 220; buckets: ipc 505, gc_cc 296, poll_wait 122, array_buffer_copy 102, memcpy_memset 23, worker_messaging 15, paint_layout 0, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 98; `[unknown]` 26; `[axiosozo-dev]` 22; `__memmove_avx_unaligned_erms [libc.so.6]` 18; `validate (chrome://global/content/third_party/cfworker/json-` 15; `recvmsg [libc.so.6]` 10
  - GC/CC markers: GCMinor 7× 13 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - busiest DOM Worker 740 ms: buckets worker_messaging 735, ipc 735, gc_cc 243, poll_wait 135, array_buffer_copy 81, memcpy_memset 45; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 124; `[unknown]` 109; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 49; `jsesc (resource://gre/modules/third_party/jsesc/js` 42; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 36
- **tab:3287** CPU ms by thread group: main 36, IPC I/O 9, other 0, Socket 0, ImageIO 0
  - main thread 36 ms (1.7% of span): Idle 28, JavaScript 4, Profiler 1, Layout 1, Other 1, DOM 0
  - JS leaf 0 / native under JS 5 / native 30; buckets: ipc 35, poll_wait 28, gc_cc 3, array_buffer_copy 3, paint_layout 2, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 28; `bool mozilla::HashSet<js::jit::ExecutablePool*, mozilla::Def` 1; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 1; `js::frontend::FunctionScriptEmitter::emitExtraBodyVarScope()` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 0
- **tab:3228** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.2% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `close [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:3138** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 396, main 260, WRRenderBackend 90, DOM Worker 70, WRSceneBuilder 66, Compositor 56, SwComposite 20, IPC I/O 12, Socket 10, other 3, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 260 ms (8.3% of span): GC / CC 85, Idle 56, JavaScript 48, Other 33, DOM 21, Network 7
  - JS leaf 5 / native under JS 55 / native 200; buckets: ipc 260, gc_cc 142, poll_wait 74, array_buffer_copy 16, worker_messaging 10, paint_layout 6, mozafterpaint_events 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 62; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `[unknown]` 6; `recvmsg [libc.so.6]` 5; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 5
  - GC/CC markers: GCMajor 1× 184 ms, GCSlice 33× 41 ms, CCSlice 2× 31 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 396 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 105, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 88, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 42); WRRenderBackend#0 90 ms (top self: `syscall [libc.so.6]` 68, `sched_yield [libc.so.6]` 7, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 59 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 7, `webrender::scene_building::SceneBuilder::build_ite` 1)
  - busiest DOM Worker 68 ms: buckets worker_messaging 67, ipc 67, gc_cc 31, poll_wait 30, memcpy_memset 12, array_buffer_copy 3; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28; `madvise [libc.so.6]` 9; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 4; `JS::GCThingTraceKind(void*) [libxul.so]` 3; `[axiosozo-dev]` 2
- **tab:3287** CPU ms by thread group: main 247, IPC I/O 23, other 7, Socket 0, ImageIO 0
  - main thread 247 ms (7.9% of span): Idle 109, Graphics 52, Layout 41, Profiler 16, Other 14, GC / CC 8
  - JS leaf 0 / native under JS 16 / native 231; buckets: ipc 229, poll_wait 111, paint_layout 109, gc_cc 11, canvas_2d 5, subprocess_pipe_io 3, array_buffer_copy 3, memcpy_memset 3
  - top self: `poll [libc.so.6]` 108; `[]` 10; `sendmsg [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 6× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3228** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2
  - top self: `poll [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `int detail::CompareWrapper<MirrorCallbackList::Find(nsTSubst` 0
- **utility:3280** CPU ms by thread group: IPC I/O 1, main 1
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 703, main 178, WRRenderBackend 93, SwComposite 43, Compositor 39, WRSceneBuilder 25, IPC I/O 10, other 2, DOM Worker 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 178 ms (8.6% of span): Idle 81, GC / CC 40, Other 25, Graphics 12, JavaScript 9, Layout 5
  - JS leaf 1 / native under JS 9 / native 168; buckets: ipc 178, poll_wait 114, gc_cc 50, paint_layout 19, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 81; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `write [libc.so.6]` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `[axiosozo-dev]` 3
  - GC/CC markers: GCMajor 1× 80 ms, GCSlice 6× 28 ms, CCSlice 2× 10 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 703 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 233, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 126, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 57); WRRenderBackend#0 93 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 4, `webrender::prepare::prepare_prim_for_render [libxu` 3); SwComposite 43 ms (top self: `syscall [libc.so.6]` 38, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, array_buffer_copy 1, gc_cc 1, poll_wait 0; top self: `mozilla::PrintfTarget::vprint(char const*, __va_li` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3287** CPU ms by thread group: main 125, IPC I/O 20, other 2, Socket 0, ImageIO 0
  - main thread 125 ms (6.0% of span): Idle 72, Graphics 22, Other 10, GC / CC 8, JavaScript 5, Layout 4
  - JS leaf 0 / native under JS 5 / native 120; buckets: ipc 120, poll_wait 75, paint_layout 30, gc_cc 12, array_buffer_copy 3, canvas_2d 1, memcpy_memset 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 73; `[]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `sendmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 21 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms
- **tab:3372** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `xpc::SelfHostedShmem::Handle() const [libxul.so]` 0
- **tab:3210** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: gecko / key

- **parent** CPU ms by thread group: main 218, Renderer 40, Compositor 22, WRRenderBackend 22, WRSceneBuilder 15, IPC I/O 10, SwComposite 5, DOM Worker 5, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 218 ms (5.7% of span): Idle 48, Layout 45, JavaScript 31, GC / CC 29, Other 28, Graphics 24
  - JS leaf 0 / native under JS 34 / native 183; buckets: ipc 217, paint_layout 78, poll_wait 71, gc_cc 42, subprocess_pipe_io 10, array_buffer_copy 6, memcpy_memset 4, canvas_2d 2
  - top self: `poll [libc.so.6]` 49; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `recvmsg [libc.so.6]` 5; `[axiosozo-dev]` 4; `__tls_get_addr [ld-linux-x86-64.so.2]` 4
  - GC/CC markers: GCMajor 1× 64 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 40 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `writev [libc.so.6]` 2); WRRenderBackend#0 22 ms (top self: `syscall [libc.so.6]` 17, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::try_get_ca` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `PR_GetThreadPrivate [libnspr4.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3287** CPU ms by thread group: main 70, IPC I/O 8, other 1, Socket 0, ImageIO 0
  - main thread 70 ms (1.8% of span): Idle 28, Other 10, GC / CC 8, Layout 7, JavaScript 6, Graphics 4
  - JS leaf 0 / native under JS 7 / native 63; buckets: ipc 64, poll_wait 28, paint_layout 15, gc_cc 14, array_buffer_copy 3, canvas_2d 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 28; `sendmsg [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `[]` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
- **tab:3138** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, GC / CC 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `[]` 1; `PerformPromiseThenWithReaction(JSContext*, JS::Handle<js::Pr` 0; `[unknown]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::JSXrayTra` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:3189** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::TaskController::MaybeDispatchOneThreadableTask(mozi` 0

