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

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **60.0** (main 26.6, DOM Worker 14.9, Renderer 8.3, Socket Thread 1.7, StyleThread# 1.7) | AxioCEFProbe 53.1, cef:gpu-process 16.6, cef:utility 10.0, cef:renderer 8.3 | — | 550.0 |
| plain | idle | — | — | **3.4** (main 2.9, Timer 0.5) | Web Content 3.8 | — | — |
| plain | raf | 59.0 | 20.9 | **55.6** (main 23.8, DOM Worker 9.0, Renderer 7.7, SwComposite 5.8, TaskCon~ller # 3.9) | cef:renderer 9.0, cef:gpu-process 6.4, AxioCEFProbe 6.4, WebExtensions 1.0 | — | — |
| plain | scroll | 52.4 | 34.3 | **108.9** (main 51.1, DOM Worker 32.8, TaskCon~ller # 7.2, Renderer 6.7, SwComposite 4.8) | cef:gpu-process 22.2, cef:renderer 11.1, AxioCEFProbe 10.6, WebExtensions 0.5 | — | — |
| plain | key | — | — | **12.8** (main 7.1, DOM Worker 1.9, Timer 0.8, Renderer 0.8, SwComposite 0.8) | AxioCEFProbe 2.8, cef:renderer 2.1, cef:gpu-process 0.5 | 19.8 | — |
| plain | switch-to-gecko | — | — | **25.5** (main 12.7, Renderer 6.4, DOM Worker 6.4) | Isolated Web Co 12.7 | — | 131.0 |
| trace | switch-to-engine | — | — | **68.4** (Renderer 26.9, main 20.7, DOM Worker 8.3, WRRende~ckend# 4.1, glean.dispatche 2.1) | AxioCEFProbe 60.0, cef:gpu-process 18.6, cef:utility 14.5, cef:renderer 12.4 | — | 444.0 |
| trace | idle | — | — | **3.9** (main 2.9, IPC I/O Parent 0.5, Timer 0.5) | Web Content 3.3, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| trace | raf | 59.0 | 21.7 | **56.0** (main 24.5, DOM Worker 9.0, Renderer 7.4, SwComposite 5.8, TaskCon~ller # 4.8) | cef:renderer 9.3, AxioCEFProbe 7.1, cef:gpu-process 6.4, cef:zygote 0.3 | — | — |
| trace | scroll | 7.9 | 39.3 | **26.0** (main 11.7, DOM Worker 7.8, TaskCon~ller # 1.6, IPDL Background 1.2, Renderer 0.9) | cef:gpu-process 2.8, AxioCEFProbe 1.7, cef:renderer 1.4, Privileged Cont 0.2 | — | — |
| trace | key | — | — | **12.6** (main 7.1, DOM Worker 1.6, Renderer 1.1, SwComposite 0.8, Softwar~cThread 0.5) | cef:renderer 2.2, AxioCEFProbe 2.0, cef:gpu-process 0.6, WebExtensions 0.3 | 18.4 | — |
| trace | switch-to-gecko | — | — | **32.0** (main 12.8, Renderer 6.4, BgIOThr~Pool # 6.4, DOM Worker 6.4) |  | — | 131.1 |
| profile | switch-to-engine | — | — | **51.9** (main 17.9, DOM Worker 17.9, SamplerThread 7.1, Renderer 3.6, TaskCon~ller # 1.8) | AxioCEFProbe 51.9, cef:gpu-process 16.1, cef:utility 12.5, cef:renderer 10.7 | — | 496.2 |
| profile | idle | — | — | **22.2** (SamplerThread 9.0, DOM Worker 6.6, main 4.7, Timer 1.9) | Web Content 8.1, WebExtensions 1.4, Privileged Cont 1.4, Isolated Web Co 1.4 | — | — |
| profile | raf | 58.7 | 26.7 | **88.4** (main 31.9, DOM Worker 18.2, SamplerThread 11.2, Renderer 8.0, SwComposite 6.1) | cef:renderer 10.2, Web Content 8.6, cef:gpu-process 7.3, AxioCEFProbe 7.1 | — | — |
| profile | scroll | 7.3 | 65.6 | **37.7** (main 12.1, DOM Worker 11.5, SamplerThread 8.6, TaskCon~ller # 1.6, Timer 1.5) | Web Content 8.9, cef:gpu-process 3.2, AxioCEFProbe 2.0, WebExtensions 1.8 | — | — |
| profile | key | — | — | **35.8** (main 10.9, DOM Worker 9.6, SamplerThread 9.0, Timer 1.6, Renderer 1.4) | Web Content 8.5, AxioCEFProbe 2.8, cef:renderer 2.8, WebExtensions 1.9 | 22.1 | — |
| profile | switch-to-gecko | — | — | **7.0** (SamplerThread 3.5, BgIOThr~Pool # 2.4, main 0.5, DOM Worker 0.2, Renderer 0.1) | Web Content 8.4, WebExtensions 1.7, Isolated Web Co 1.7, Privileged Cont 1.6 | — | 15024.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.0 | 0.0 | 0 | 10.3 | 2524.0 | — | 10.8 | 9.6 | — | — | — | 8.87 | 2.39 | — | 0.038 |
| trace | raf | 59.6 | 0.0 | 0 | 42.6 | 696.7 | — | 14.4 | 1.6 | — | — | — | — | 0.33 | — | 0.125 |
| trace | scroll | 7.0 | 0.0 | 0 | 18.2 | 2524.0 | — | 4.1 | 8.5 | — | — | — | — | 0.18 | — | 0.070 |
| trace | key | 5.7 | 0.0 | 0 | 1.0 | 47.6 | — | 4.0 | 0.4 | — | — | — | — | 0.04 | — | 0.004 |
| profile | switch-to-engine | 3.4 | 0.0 | 0 | 8.8 | 2524.0 | — | 3.6 | 14.9 | — | — | — | 18.45 | 2.11 | — | 0.051 |
| profile | raf | 59.9 | 0.0 | 0 | 42.4 | 689.1 | — | 13.5 | 2.0 | — | — | — | — | 0.44 | — | 0.162 |
| profile | scroll | 6.9 | 0.0 | 0 | 17.7 | 2524.0 | — | 1.0 | 11.2 | — | — | — | — | 0.30 | — | 0.086 |
| profile | key | 5.7 | 0.0 | 0 | 1.0 | 47.6 | — | 5.2 | 0.8 | — | — | — | — | 0.14 | — | 0.005 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 7.5 | 0.5 | — | — | — | 0.9 | 16.9 | 17.6 |
| profile | 0.7 | 10.1 | 1.0 | — | — | — | 0.9 | 20.3 | 21.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 21.1; spawn AxioCEFProbe resolved 66.0; write hello 67.2; first stdout read resolved 287.2; write create 291.3; first large (>=64 KiB) read resolved 457.7; write frame_ack 458.3; write focus 463.1; first ImageData 466.5; first putImageData end 472.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 21.4; first stdout read resolved 29.1; write shutdown 35.2

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 54.2; spawn AxioCEFProbe resolved 95.0; write hello 97.0; first stdout read resolved 340.7; write create 343.1; first large (>=64 KiB) read resolved 512.7; write frame_ack 513.6; write focus 523.8; first ImageData 531.1; first putImageData end 542.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 28.2; first stdout read resolved 37.8; write shutdown 42.6

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 101, DOM Worker 84, Renderer 31, WRRenderBackend 6, Compositor 4, WRSceneBuilder 4, SwComposite 3, IPC I/O 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 101 ms (17.2% of span): JavaScript 39, Layout 17, Idle 17, DOM 11, Other 10, Graphics 6
  - JS leaf 9 / native under JS 47 / native 45; buckets: ipc 101, paint_layout 42, gc_cc 35, worker_messaging 31, poll_wait 18, array_buffer_copy 15, frame_surface_paint 15, subprocess_pipe_io 15
  - top self: `poll [libc.so.6]` 17; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `[axiosozo-dev]` 6; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 6; `<style::gecko::wrapper::GeckoElement as style::dom::TElement` 5; `PerformPromiseThen(JSContext*, JS::Handle<js::PromiseObject*` 4
  - WebRender/compositor threads: Renderer 31 ms (top self: `__exp2f_fma [libm.so.6]` 5, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4); WRRenderBackend#0 6 ms (top self: `syscall [libc.so.6]` 4, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); WRSceneBuilder#0 4 ms (top self: `syscall [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::wrap_prim` 1, `sched_yield [libc.so.6]` 1)
  - busiest DOM Worker 84 ms: buckets subprocess_pipe_io 84, worker_messaging 84, ipc 84, js_ctypes 39, poll_wait 35, gc_cc 34; top self: `poll [libc.so.6]` 35; `js::gc::TenuringTracer::moveString(JSString*, JSSt` 29; `read [libc.so.6]` 4; `__lll_lock_wake [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2
- **tab:4859** CPU ms by thread group: main 9, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 9 ms (1.5% of span): JavaScript 3, DOM 2, Other 1, Profiler 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 4; buckets: ipc 9, gc_cc 6, poll_wait 1, array_buffer_copy 1
  - top self: `__lll_lock_wait [libc.so.6]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `js::PropMapTable::init(JSContext*, js::LinkedPropMap*) [libx` 1; `JS::ForOfIterator::nextFromOptimizedArray(JS::MutableHandle<` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 1; `[]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:4741** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.6% of span): Idle 2, Other 1, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2, paint_layout 0, webrender_render 0
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__strnlen_avx2 [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0; `mozilla::layers::WebRenderLayerManager::DidComposite(mozilla` 0
- **tab:4854** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 90, DOM Worker 84, other 18, Socket 1, IPC I/O 0, Compositor 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 90 ms (4.2% of span): Idle 72, JavaScript 10, Other 4, DOM 3, Profiler 0
  - JS leaf 1 / native under JS 13 / native 77; buckets: ipc 90, poll_wait 75, gc_cc 9, array_buffer_copy 7, subprocess_pipe_io 5, js_ctypes 1, worker_messaging 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 73; `[unknown]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `JS::PinArrayBufferOrViewLength(JSObject*, bool) [libxul.so]` 1; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 1; `js::gc::BufferAllocator::useAvailableChunk(unsigned long, un` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 84 ms: buckets subprocess_pipe_io 84, js_ctypes 84, worker_messaging 84, ipc 84, poll_wait 84; top self: `poll [libc.so.6]` 84
- **tab:4854** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:4233** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:4741** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 0; `madvise [libc.so.6]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 929, DOM Worker 462, Renderer 235, SwComposite 180, WRRenderBackend 64, Compositor 36, other 29, WRSceneBuilder 12, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 929 ms (29.4% of span): Idle 344, JavaScript 266, GC / CC 125, Other 100, DOM 65, Profiler 20
  - JS leaf 75 / native under JS 323 / native 531; buckets: ipc 929, poll_wait 380, gc_cc 326, worker_messaging 294, subprocess_pipe_io 172, array_buffer_copy 147, paint_layout 144, memcpy_memset 137
  - top self: `poll [libc.so.6]` 348; `__memmove_avx_unaligned_erms [libc.so.6]` 122; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 63; `[unknown]` 21; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 18; `mprotect [libc.so.6]` 14
  - GC/CC markers: GCMajor 3× 395 ms, GCSlice 28× 125 ms, CCSlice 8× 22 ms, GCMinor 3× 2 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 235 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 128, `int blendTextureNearestFast<false, glsl::sampler2D` 29, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 12); SwComposite 180 ms (top self: `syscall [libc.so.6]` 154, `void scale_blit<true>(Texture&, IntRect const&, Te` 24, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - busiest DOM Worker 462 ms: buckets subprocess_pipe_io 462, worker_messaging 462, ipc 462, js_ctypes 370, poll_wait 294, gc_cc 52; top self: `poll [libc.so.6]` 294; `read [libc.so.6]` 65; `syscall [libc.so.6]` 12; `[unknown]` 8; `[axiosozo-dev]` 7
- **tab:4741** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 4, gc_cc 4, poll_wait 3
  - top self: `poll [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::NukedObjectRealm(JSObject*) [libxul.so]` 1; `[]` 0
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:4859** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4254** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 1914, DOM Worker 1450, Renderer 153, other 146, SwComposite 99, WRRenderBackend 40, Compositor 29, WRSceneBuilder 9, IPC I/O 6, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1914 ms (11.1% of span): Idle 718, JavaScript 565, Other 297, GC / CC 180, DOM 58, Graphics 41
  - JS leaf 193 / native under JS 515 / native 1206; buckets: ipc 1912, poll_wait 872, worker_messaging 559, gc_cc 531, array_buffer_copy 373, paint_layout 339, subprocess_pipe_io 322, memcpy_memset 317
  - top self: `poll [libc.so.6]` 737; `__memmove_avx_unaligned_erms [libc.so.6]` 304; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 180; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 41; `[unknown]` 34; `recvmsg [libc.so.6]` 26
  - GC/CC markers: GCMajor 6× 2461 ms, GCSlice 53× 179 ms, CCSlice 8× 24 ms, GCMinor 7× 6 ms, CC 6× 0 ms
  - WebRender/compositor threads: Renderer 153 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 103, `int blendTextureNearestFast<false, glsl::sampler2D` 15, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); SwComposite 99 ms (top self: `syscall [libc.so.6]` 90, `void scale_blit<true>(Texture&, IntRect const&, Te` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 40 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 7, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - busiest DOM Worker 1442 ms: buckets subprocess_pipe_io 1442, worker_messaging 1441, ipc 1441, js_ctypes 1104, poll_wait 947, gc_cc 184; top self: `poll [libc.so.6]` 942; `read [libc.so.6]` 141; `__memmove_avx_unaligned_erms [libc.so.6]` 102; `syscall [libc.so.6]` 48; `[axiosozo-dev]` 16
- **tab:4272** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 12 ms (0.1% of span): GC / CC 7, Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 10, gc_cc 7, poll_wait 5, memcpy_memset 1
  - top self: `poll [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JS::Value>*, char const*, ` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4173** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 8, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 8, ipc 8, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4233** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, ipc 5, gc_cc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 1; `[]` 0; `gfxPlatform::IsInLayoutAsapMode() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: chromium / key

- **parent** CPU ms by thread group: main 367, DOM Worker 233, Renderer 42, other 32, SwComposite 32, Compositor 15, WRRenderBackend 14, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 367 ms (10.0% of span): Idle 154, JavaScript 79, Layout 38, Other 29, DOM 28, Graphics 28
  - JS leaf 14 / native under JS 129 / native 224; buckets: ipc 367, poll_wait 186, gc_cc 90, paint_layout 83, worker_messaging 71, engine_stream_read 35, subprocess_pipe_io 23, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 157; `[unknown]` 12; `[axiosozo-dev]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `write [libc.so.6]` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); SwComposite 32 ms (top self: `syscall [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `webrender::surface::CommandBufferTargets::init [li` 0)
  - busiest DOM Worker 233 ms: buckets subprocess_pipe_io 233, worker_messaging 232, ipc 232, js_ctypes 202, poll_wait 196, gc_cc 20; top self: `poll [libc.so.6]` 196; `syscall [libc.so.6]` 3; `mprotect [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2
- **tab:4173** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 1; `JS::GetPromiseUserInputEventHandlingState(JSObject*) [libxul` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `[unknown]` 0
- **tab:4746** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:4233** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 0

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 65, DOM Worker 26, Renderer 18, IPC I/O 6, Compositor 4, WRRenderBackend 2, other 2, WRSceneBuilder 2, SwComposite 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (0.4% of span): Layout 16, Idle 16, JavaScript 15, Other 9, DOM 5, Graphics 3
  - JS leaf 2 / native under JS 24 / native 38; buckets: ipc 65, paint_layout 23, poll_wait 19, gc_cc 12, array_buffer_copy 10, subprocess_pipe_io 6, worker_messaging 4, memcpy_memset 3
  - top self: `poll [libc.so.6]` 15; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) ` 3; `style::rule_tree::core::StrongRuleNode::ensure_child [libxul` 2; `mprotect [libc.so.6]` 2; `nsFlexContainerFrame::ReflowChildren(mozilla::ReflowInput co` 2; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 18 ms (top self: `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `ps_text_run_DEBUG_OVERDRAW_DUAL_SOURCE_BLENDING_TE` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `write [libc.so.6]` 0, `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - busiest DOM Worker 26 ms: buckets subprocess_pipe_io 26, worker_messaging 26, ipc 26, gc_cc 15, poll_wait 10, js_ctypes 10; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[axiosozo-dev]` 1; `mozilla::dom::CallbackTimeoutHandler::cycleCollect` 1
- **tab:4272** CPU ms by thread group: main 7, other 1, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 4, DOM 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 3 / native 4; buckets: ipc 6, poll_wait 4, gc_cc 2, array_buffer_copy 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 4; `nsAtomTable::AtomizeMainThread(nsTSubstring<char16_t> const&` 1; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 1; `mmap64 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `js::jit::BaselineCompiler::emitBody() [libxul.so]` 0
- **tab:4254** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::ipc::PBackgroundChild::OnMessageReceived(IPC::Messa` 0; `PR_GetCurrentThread [libnspr4.so]` 0; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0; `[linux-vdso.so.1]` 0
- **tab:4741** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 3, Layout 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4, ipc 4
  - top self: `poll [libc.so.6]` 3; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `<firefox_on_glean::private::counter::CounterMetric as glean_` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message ` 0

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **48.9** (main 19.1, Renderer 10.7, DOM Worker 9.5, glean.dispatche 2.4, WRRende~ckend# 2.4) | AxioCEFProbe 35.8, cef:gpu-process 11.9, cef:utility 6.0, cef:renderer 4.8 | — | 788.9 |
| plain | idle | — | — | **5.3** (main 3.8, Timer 1.0, DOM Worker 0.5) | Web Content 3.4, AxioCEFProbe 1.5, RDD Process 0.5 | — | — |
| plain | raf | 58.4 | 27.8 | **117.8** (main 46.2, DOM Worker 26.0, Renderer 19.3, SwComposite 17.3, TaskCon~ller # 3.9) | cef:gpu-process 17.9, AxioCEFProbe 14.5, cef:renderer 12.2, cef:zygote 0.3 | — | — |
| plain | scroll | 29.6 | 71.8 | **139.7** (main 60.9, DOM Worker 48.4, Renderer 11.0, SwComposite 8.2, TaskCon~ller # 5.8) | cef:gpu-process 72.5, AxioCEFProbe 15.4, cef:renderer 14.8, Web Content 0.5 | — | — |
| plain | key | — | — | **20.8** (main 9.3, Renderer 2.7, SwComposite 2.7, DOM Worker 2.2, TaskCon~ller # 1.6) | AxioCEFProbe 2.4, cef:renderer 2.1, cef:gpu-process 1.1, WebExtensions 0.3 | 21.0 | — |
| plain | switch-to-gecko | — | — | **53.1** (main 17.7, Renderer 17.7, BgIOThr~Pool # 5.9, WRScene~ilder# 5.9, WRRende~ckend# 5.9) | Isolated Web Co 5.9 | — | 136.3 |
| trace | switch-to-engine | — | — | **101.5** (Renderer 55.7, main 27.9, DOM Worker 9.9, IPDL Background 2.0, WrGlyph~terizer 2.0) | AxioCEFProbe 55.8, cef:gpu-process 21.9, cef:utility 12.0, cef:renderer 11.9 | — | 443.6 |
| trace | idle | — | — | **6.3** (main 3.8, Timer 1.0, glean.dispatche 0.5, Socket Thread 0.5, IPDL Background 0.5) | Web Content 3.4, AxioCEFProbe 1.0, cef:utility 1.0 | — | — |
| trace | raf | 58.1 | 34.3 | **122.0** (main 47.6, DOM Worker 25.7, Renderer 19.6, SwComposite 17.0, TaskCon~ller # 5.1) | cef:gpu-process 18.0, AxioCEFProbe 13.1, cef:renderer 12.2, Privileged Cont 0.3 | — | — |
| trace | scroll | 4.2 | 11786.2 | **33.6** (main 13.1, DOM Worker 9.8, Indexed~ IO # 3.4, IPDL Background 1.4, TaskCon~ller # 1.3) | cef:gpu-process 8.6, AxioCEFProbe 2.5, cef:renderer 1.8 | — | — |
| trace | key | — | — | **18.9** (main 8.5, Renderer 3.3, SwComposite 2.7, DOM Worker 1.9, Timer 0.8) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 21.2 | — |
| trace | switch-to-gecko | — | — | **0.8** (main 0.3, Renderer 0.2, glean.dispatche 0.1, WRRende~ckend# 0.1, DOM Worker 0.1) | Web Content 0.1, Isolated Web Co 0.1 | — | 15677.3 |
| profile | switch-to-engine | — | — | **71.5** (main 22.0, DOM Worker 16.5, Renderer 14.7, SamplerThread 9.2, WRRende~ckend# 3.7) | AxioCEFProbe 53.2, cef:gpu-process 22.0, cef:renderer 11.0, cef:utility 11.0 | — | 471.7 |
| profile | idle | — | — | **24.8** (SamplerThread 9.1, DOM Worker 8.6, main 5.2, Timer 1.9) | Web Content 8.6, Privileged Cont 2.4, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | raf | 56.0 | 33.5 | **151.4** (main 52.9, DOM Worker 35.7, Renderer 19.5, SwComposite 17.2, SamplerThread 12.1) | cef:gpu-process 19.7, AxioCEFProbe 14.7, cef:renderer 12.4, Web Content 9.9 | — | — |
| profile | scroll | 3.3 | 11788.8 | **40.6** (DOM Worker 13.2, main 11.4, SamplerThread 8.8, BgIOThr~Pool # 2.0, Timer 1.7) | Web Content 9.9, cef:gpu-process 9.3, Privileged Cont 2.2, AxioCEFProbe 2.2 | — | — |
| profile | key | — | — | **43.5** (main 12.5, DOM Worker 10.9, SamplerThread 9.8, Renderer 3.3, SwComposite 3.0) | Web Content 9.5, AxioCEFProbe 3.3, WebExtensions 2.5, cef:renderer 2.5 | 24.1 | — |
| profile | switch-to-gecko | — | — | **4.8** (SamplerThread 3.5, main 0.3, Renderer 0.3, DOM Worker 0.2, BgIOThr~Pool # 0.1) | Web Content 9.6, Isolated Web Co 1.9, Privileged Cont 1.8, Socket Process 1.7 | — | 15027.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.7 | 0.0 | 0 | 30.3 | 7925.3 | — | 11.2 | 29.0 | — | — | — | 11.15 | 2.36 | — | 0.108 |
| trace | raf | 58.9 | 0.0 | 0 | 133.3 | 2240.0 | — | 9.1 | 5.8 | — | — | — | — | 1.08 | — | 0.383 |
| trace | scroll | 3.5 | 0.0 | 0 | 28.3 | 7925.3 | — | 0.2 | 27.4 | — | — | — | — | 0.60 | — | 0.102 |
| trace | key | 5.7 | 0.0 | 0 | 3.2 | 192.9 | — | 5.1 | 0.8 | — | — | — | — | 0.06 | — | 0.009 |
| profile | switch-to-engine | 1.8 | 0.0 | 0 | 14.2 | 7925.3 | — | 23.9 | 26.8 | — | — | — | 14.28 | 2.28 | — | 0.047 |
| profile | raf | 58.2 | 0.0 | 0 | 129.0 | 2213.8 | — | 6.2 | 6.8 | — | — | — | — | 1.23 | — | 0.479 |
| profile | scroll | 2.8 | 0.0 | 0 | 22.6 | 7925.3 | — | 0.2 | 35.9 | — | — | — | — | 0.82 | — | 0.103 |
| profile | key | 5.7 | 0.0 | 0 | 3.2 | 192.9 | — | 6.3 | 1.3 | — | — | — | — | 0.19 | — | 0.016 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 8.6 | 1.0 | — | — | — | 2.2 | 18.8 | 20.7 |
| profile | 0.7 | 11.4 | 1.5 | — | — | — | 2.2 | 21.8 | 24.1 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 25.7; spawn AxioCEFProbe resolved 36.9; write hello 38.9; first stdout read resolved 279.4; write create 280.8; first large (>=64 KiB) read resolved 460.2; write frame_ack 461.1; write focus 467.0; first ImageData 471.3; first putImageData end 485.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 25.0; first stdout read resolved 33.7; write shutdown 43.6

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 41.9; spawn AxioCEFProbe resolved 75.9; write hello 77.3; first stdout read resolved 292.5; write create 295.0; first large (>=64 KiB) read resolved 488.4; write frame_ack 489.3; write focus 497.0; first ImageData 502.7; first putImageData end 513.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 35.9; first stdout read resolved 49.0; write shutdown 54.0

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 121, Renderer 78, DOM Worker 67, SwComposite 7, WRRenderBackend 6, Compositor 5, WRSceneBuilder 4, IPC I/O 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 121 ms (21.3% of span): JavaScript 33, Layout 28, Idle 23, GC / CC 14, Profiler 8, DOM 7
  - JS leaf 6 / native under JS 53 / native 62; buckets: ipc 121, paint_layout 46, gc_cc 45, worker_messaging 41, subprocess_pipe_io 24, poll_wait 24, array_buffer_copy 17, frame_surface_paint 12
  - top self: `poll [libc.so.6]` 23; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 6; `style::properties::cascade::iter_declarations [libxul.so]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `__memmove_avx_unaligned_erms [libc.so.6]` 5; `cssparser::parser::Parser::parse_entirely [libxul.so]` 4
  - GC/CC markers: GCMajor 1× 102 ms, GCSlice 7× 26 ms, GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 31, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4); SwComposite 7 ms (top self: `syscall [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 0, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 6 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 1)
  - busiest DOM Worker 67 ms: buckets subprocess_pipe_io 67, worker_messaging 64, ipc 64, js_ctypes 46, poll_wait 35, gc_cc 9; top self: `poll [libc.so.6]` 33; `read [libc.so.6]` 5; `[axiosozo-dev]` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2
- **tab:4001** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.7% of span): Idle 4
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4
  - top self: `poll [libc.so.6]` 4
- **tab:3512** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:3538** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 108, main 85, other 21, Compositor 2, IPC I/O 1, Socket 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 85 ms (4.0% of span): Idle 71, JavaScript 6, Other 5, DOM 2, Profiler 1
  - JS leaf 1 / native under JS 8 / native 76; buckets: ipc 85, poll_wait 73, array_buffer_copy 4, gc_cc 3, memcpy_memset 0, subprocess_pipe_io 0, worker_messaging 0
  - top self: `poll [libc.so.6]` 71; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `[unknown]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `next (self-hosted:2415:25)[1]` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, js_ctypes 108, worker_messaging 108, ipc 108, poll_wait 108; top self: `poll [libc.so.6]` 108
- **tab:4116** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:4121** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:3538** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, un` 0

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 1567, DOM Worker 980, Renderer 572, SwComposite 530, WRRenderBackend 72, Compositor 42, other 28, WRSceneBuilder 14, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1567 ms (49.3% of span): JavaScript 611, Idle 387, Other 224, DOM 219, GC / CC 89, Profiler 26
  - JS leaf 283 / native under JS 618 / native 665; buckets: ipc 1567, worker_messaging 534, paint_layout 498, frame_surface_paint 480, poll_wait 437, gc_cc 425, memcpy_memset 399, array_buffer_copy 341
  - top self: `poll [libc.so.6]` 394; `__memmove_avx_unaligned_erms [libc.so.6]` 379; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 262; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 76; `[axiosozo-dev]` 32; `[unknown]` 23
  - GC/CC markers: GCMajor 3× 222 ms, GCSlice 27× 85 ms, CCSlice 4× 11 ms, GCMinor 3× 3 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 572 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 245, `int blendTextureNearestFast<false, glsl::sampler2D` 110, `void scale_blit<true>(Texture&, IntRect const&, Te` 75); SwComposite 530 ms (top self: `syscall [libc.so.6]` 298, `void scale_blit<true>(Texture&, IntRect const&, Te` 198, `__memmove_avx_unaligned_erms [libc.so.6]` 32); WRRenderBackend#0 72 ms (top self: `syscall [libc.so.6]` 59, `sched_yield [libc.so.6]` 5, `[axiosozo-dev]` 1)
  - busiest DOM Worker 980 ms: buckets subprocess_pipe_io 980, worker_messaging 980, ipc 980, js_ctypes 609, poll_wait 438, array_buffer_copy 172; top self: `poll [libc.so.6]` 436; `read [libc.so.6]` 150; `__memmove_avx_unaligned_erms [libc.so.6]` 131; `syscall [libc.so.6]` 54; `mprotect [libc.so.6]` 25
- **tab:3538** CPU ms by thread group: main 11, other 1, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 11 ms (0.4% of span): GC / CC 9, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 10, gc_cc 9, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [l` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1
  - GC/CC markers: GCMajor 1× 28 ms, GCSlice 4× 11 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4001** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 3, Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, gc_cc 4, poll_wait 4
  - top self: `poll [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `JSPurpleBuffer::cycleCollection::Trace(void*, TraceCallbacks` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 0
  - GC/CC markers: GCMajor 1× 38 ms, GCSlice 3× 5 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3491** CPU ms by thread group: main 5, other 1, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 5 ms (0.2% of span): Idle 3, GC / CC 1, Other 1
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, gc_cc 1
  - top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 0; `mojo::core::ports::SinglePortLocker::SinglePortLocker(mojo::` 0; `[linux-vdso.so.1]` 0
  - GC/CC markers: GCMajor 1× 37 ms, GCSlice 3× 4 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 1782, DOM Worker 1628, Renderer 177, other 163, SwComposite 132, WRRenderBackend 21, Compositor 18, IPC I/O 6, WRSceneBuilder 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1782 ms (10.4% of span): Idle 725, JavaScript 590, Other 258, GC / CC 95, DOM 62, Graphics 19
  - JS leaf 370 / native under JS 333 / native 1079; buckets: ipc 1782, poll_wait 833, paint_layout 464, worker_messaging 402, frame_surface_paint 393, bgra_to_rgba 353, gc_cc 330, array_buffer_copy 264
  - top self: `poll [libc.so.6]` 740; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 351; `__memmove_avx_unaligned_erms [libc.so.6]` 192; `write [libc.so.6]` 23; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 23; `[unknown]` 22
  - GC/CC markers: GCMajor 3× 269 ms, GCSlice 25× 94 ms, CCSlice 6× 17 ms, GCMinor 5× 6 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 177 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 79, `void scale_blit<true>(Texture&, IntRect const&, Te` 30, `int blendTextureNearestFast<false, glsl::sampler2D` 28); SwComposite 131 ms (top self: `syscall [libc.so.6]` 91, `void scale_blit<true>(Texture&, IntRect const&, Te` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 9); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 0)
  - busiest DOM Worker 1628 ms: buckets subprocess_pipe_io 1628, worker_messaging 1627, ipc 1627, js_ctypes 1142, poll_wait 1018, gc_cc 262; top self: `poll [libc.so.6]` 1000; `__memmove_avx_unaligned_erms [libc.so.6]` 153; `read [libc.so.6]` 119; `syscall [libc.so.6]` 50; `mprotect [libc.so.6]` 38
- **tab:3538** CPU ms by thread group: main 8, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 8 ms (0.0% of span): Idle 4, DOM 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 3 / native 5; buckets: ipc 8, poll_wait 4, gc_cc 3, memcpy_memset 1
  - top self: `poll [libc.so.6]` 4; `js::gc::StoreBuffer::putSlot(js::NativeObject*, int, unsigne` 1; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 1; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 0
- **tab:3512** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3
- **tab:4006** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 417, DOM Worker 268, Renderer 117, SwComposite 106, other 38, Compositor 18, WRRenderBackend 16, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 417 ms (11.3% of span): Idle 172, JavaScript 88, Layout 46, Graphics 38, Other 35, DOM 22
  - JS leaf 19 / native under JS 132 / native 266; buckets: ipc 417, poll_wait 211, paint_layout 102, gc_cc 102, worker_messaging 80, engine_stream_read 36, memcpy_memset 30, subprocess_pipe_io 28
  - top self: `poll [libc.so.6]` 175; `__memmove_avx_unaligned_erms [libc.so.6]` 20; `[unknown]` 12; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 9; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 4
  - GC/CC markers: CCSlice 1× 3 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 117 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 45, `int blendTextureNearestFast<false, glsl::sampler2D` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 18); SwComposite 106 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 52, `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 15); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 0, `webrender::invalidation::quadtree::TileNode::updat` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 231, poll_wait 224, gc_cc 17; top self: `poll [libc.so.6]` 224; `read [libc.so.6]` 6; `__memmove_avx_unaligned_erms [libc.so.6]` 6; `[unknown]` 4; `mozilla::ProfileChunkedBuffer::~ProfileChunkedBuff` 2
- **tab:3442** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 6; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::H` 0; `js::jit::Assembler::cmovCCq(js::jit::AssemblerX86Shared::Con` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 0; `xpcAccTextSelectionChangeEvent::AddRef() [libxul.so]` 0
- **tab:3491** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `g_main_context_default [libglib-2.0.so.0]` 0
- **tab:3512** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `nsRefreshDriver::CancelIdleTask(mozilla::Task*) [libxul.so]` 0

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 58, Renderer 56, DOM Worker 19, IPC I/O 6, SwComposite 5, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, other 2, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 58 ms (0.4% of span): Idle 17, Layout 16, JavaScript 10, Graphics 7, DOM 4, Other 3
  - JS leaf 0 / native under JS 22 / native 36; buckets: ipc 58, paint_layout 28, poll_wait 17, array_buffer_copy 9, gc_cc 5, memcpy_memset 1, subprocess_pipe_io 1, worker_messaging 1
  - top self: `poll [libc.so.6]` 17; `nsImageFrame::GetCurrentRequest() const [libxul.so]` 5; `servo_arc::Arc<T>::drop_slow [libxul.so]` 2; `style::properties::cascade::Cascade::cascade_custom_property` 1; `style::properties::cascade::iter_declarations [libxul.so]` 1; `xpc::GlobalProperties::Define(JSContext*, JS::Handle<JSObjec` 1
  - GC/CC markers: GCMinor 2× 0 ms
  - WebRender/compositor threads: Renderer 57 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 13, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 4); SwComposite 5 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 0)
  - busiest DOM Worker 19 ms: buckets subprocess_pipe_io 19, worker_messaging 19, ipc 19, poll_wait 14, js_ctypes 13, gc_cc 4; top self: `poll [libc.so.6]` 13; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 1; `mozilla::ThrottledEventQueue::Length() const [libx` 1
- **tab:4001** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 3, Graphics 0, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `mozilla::StyleGenericImage<mozilla::StyleGenericGradient<moz` 0; `mozilla::detail::EventQueueInternal<16ul>::PutEvent(already_` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0
- **tab:3491** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `write [libc.so.6]` 0
- **tab:3512** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[libglib-2.0.so.0]` 0

## gecko-debian (PASS)

CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.3 | **7.9** (Renderer 3.4, main 2.0, DOM Worker 1.0, WRRende~ckend# 0.5, Compositor 0.5) | Web Content 3.4, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.3 | **29.4** (Renderer 18.5, WRRende~ckend# 2.3, main 2.0, TaskCon~ller # 1.3, WRScene~ilder# 1.3) | Isolated Web Co 5.3, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **50.7** (Renderer 34.2, main 5.5, WRRende~ckend# 3.0, SwComposite 2.5, TaskCon~ller # 1.5) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **6.9** (main 4.0, Renderer 1.1, glean.dispatche 0.3, Softwar~cThread 0.3, WrGlyph~terizer 0.3) | Isolated Web Co 1.9, WebExtensions 0.6, Privileged Cont 0.5, Web Content 0.3 | 9.0 | — |
| trace | idle | 59.1 | 17.4 | **6.0** (main 2.5, TaskCon~ller # 1.0, IPDL Background 0.5, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.4 | **22.7** (Renderer 11.9, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **47.3** (Renderer 32.8, main 4.0, WRRende~ckend# 3.5, SwComposite 2.5, WRScene~ilder# 1.5) | Isolated Web Co 4.5 | — | — |
| trace | key | — | — | **8.5** (main 4.8, Renderer 1.1, Compositor 0.8, Softwar~cThread 0.5, WRScene~ilder# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **61.9** (DOM Worker 16.6, Indexed~ IO # 14.1, main 13.6, IPDL Background 5.8, SamplerThread 4.9) | Web Content 5.8, Isolated Web Co 3.4, Privileged Cont 1.5, RDD Process 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **60.3** (Renderer 14.1, main 12.8, DOM Worker 10.2, SamplerThread 5.9, IPDL Background 3.6) | Isolated Web Co 10.8, Web Content 5.9, Privileged Cont 1.6, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **65.1** (Renderer 37.1, main 8.0, SamplerThread 6.0, WRRende~ckend# 3.5, SwComposite 3.0) | Isolated Web Co 9.0, Web Content 5.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **13.8** (main 5.1, SamplerThread 3.2, Renderer 1.3, TaskCon~ller # 0.8, WRRende~ckend# 0.8) | Web Content 5.4, Isolated Web Co 3.3, WebExtensions 1.4, Socket Process 0.8 | 8.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: DOM Worker 337, main 274, Socket 7, Compositor 2, other 2, IPC I/O 1, Renderer 1, SwComposite 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 274 ms (13.3% of span): JavaScript 116, DOM 77, Other 35, Idle 33, Network 4, GC / CC 4
  - JS leaf 18 / native under JS 155 / native 101; buckets: ipc 273, gc_cc 179, array_buffer_copy 53, poll_wait 51, worker_messaging 8, memcpy_memset 7, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 45; `[unknown]` 24; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 7; `validate (chrome://global/content/third_party/cfworker/json-` 7; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 5
  - GC/CC markers: GCMinor 5× 5 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `__memmove_evex_unaligned_erms [libc.so.6]` 0); SwComposite 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 336 ms: buckets worker_messaging 336, ipc 335, gc_cc 86, poll_wait 60, array_buffer_copy 55, memcpy_memset 18; top self: `[unknown]` 54; `__syscall_cancel_arch [libc.so.6]` 53; `jsesc (resource://gre/modules/third_party/jsesc/js` 20; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 16; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 12
- **tab:8370** CPU ms by thread group: main 36, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 36 ms (1.8% of span): Idle 23, GC / CC 6, JavaScript 4, Layout 2, Other 1, Profiler 0
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 35, poll_wait 24, gc_cc 8, array_buffer_copy 3, paint_layout 2, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `js::LookupProperty(JSContext*, JS::Handle<JSObject*>, JS::Ha` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeB` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8205** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message ` 0; `[linux-vdso.so.1]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8308** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `g_ptr_array_set_size [libglib-2.0.so.0]` 0

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 410, main 383, DOM Worker 294, WRRenderBackend 76, WRSceneBuilder 58, Compositor 46, SwComposite 26, Socket 14, IPC I/O 10, other 5, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 383 ms (12.5% of span): Idle 88, JavaScript 82, DOM 67, GC / CC 67, Other 62, Network 9
  - JS leaf 6 / native under JS 116 / native 261; buckets: ipc 382, gc_cc 191, poll_wait 123, array_buffer_copy 55, memcpy_memset 15, worker_messaging 8, paint_layout 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 108; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 13; `[unknown]` 11; `__memmove_evex_unaligned_erms [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[axiosozo-dev]` 10
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 23× 31 ms, CCSlice 2× 24 ms, GCMinor 2× 9 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 410 ms (top self: `__syscall_cancel_arch [libc.so.6]` 100, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 84, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 84); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 64, `sched_yield [libc.so.6]` 3, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1); WRSceneBuilder#0 53 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - busiest DOM Worker 292 ms: buckets worker_messaging 292, ipc 287, gc_cc 100, poll_wait 47, array_buffer_copy 25, memcpy_memset 13; top self: `[unknown]` 53; `__syscall_cancel_arch [libc.so.6]` 43; `jsesc (resource://gre/modules/third_party/jsesc/js` 25; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 19; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 16
- **tab:8370** CPU ms by thread group: main 205, IPC I/O 16, other 5, Socket 0, ImageIO 0
  - main thread 205 ms (6.7% of span): Idle 96, Graphics 35, Layout 32, Other 21, Profiler 9, GC / CC 6
  - JS leaf 0 / native under JS 11 / native 194; buckets: ipc 192, poll_wait 99, paint_layout 79, gc_cc 8, subprocess_pipe_io 3, canvas_2d 3, array_buffer_copy 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 4; `__lll_lock_wait [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(un` 2
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 5× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8308** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[linux-vdso.so.1]` 0
- **utility:8362** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[linux-vdso.so.1]` 0; `nsTSubstring<char>::Assign(nsTSubstring<char>&&, std::nothro` 0; `mozilla::dom::PrefValue::PrefValue(mozilla::dom::PrefValue&&` 0

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 717, main 145, WRRenderBackend 80, SwComposite 59, DOM Worker 47, Compositor 31, WRSceneBuilder 24, IPC I/O 8, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 145 ms (7.2% of span): Idle 75, GC / CC 28, Other 19, Graphics 7, Layout 6, JavaScript 6
  - JS leaf 0 / native under JS 7 / native 138; buckets: ipc 144, poll_wait 97, gc_cc 33, paint_layout 13, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 2, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 84; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `[axiosozo-dev]` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScr` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 7× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 717 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 252, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 129, `__syscall_cancel_arch [libc.so.6]` 59); WRRenderBackend#0 81 ms (top self: `syscall [libc.so.6]` 52, `webrender::frame_builder::FrameBuilder::build [lib` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 2); SwComposite 59 ms (top self: `syscall [libc.so.6]` 50, `__memmove_evex_unaligned_erms [libc.so.6]` 8, `webrender::compositor::sw_compositor::SwCompositeT` 0)
  - busiest DOM Worker 45 ms: buckets gc_cc 45, worker_messaging 44, ipc 44, memcpy_memset 14, poll_wait 0; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 15; `madvise [libc.so.6]` 10; `munmap [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 2; `js::gc::AllocSpace<js::gc::SmallBufferRegion, 1638` 2
- **tab:8370** CPU ms by thread group: main 100, IPC I/O 14, other 1, Socket 0, ImageIO 0
  - main thread 100 ms (5.0% of span): Idle 70, Graphics 14, Other 8, Profiler 2, Layout 2, JavaScript 2
  - JS leaf 0 / native under JS 3 / native 97; buckets: ipc 97, poll_wait 70, paint_layout 20, array_buffer_copy 2, gc_cc 1, canvas_2d 1, mozafterpaint_events 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 73; `[]` 2; `nsTextFrame::PaintText(nsTextFrame::PaintTextParams const&, ` 2; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffe` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 1; `nsSliderFrame::QueryFrame(nsQueryFrame::FrameIID) const [lib` 1
- **tab:8289** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8463** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 185, Renderer 43, WRRenderBackend 18, Compositor 18, WRSceneBuilder 14, IPC I/O 8, SwComposite 5, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 185 ms (4.9% of span): Idle 46, Layout 39, GC / CC 29, Graphics 21, JavaScript 17, Other 17
  - JS leaf 5 / native under JS 19 / native 161; buckets: ipc 184, paint_layout 66, poll_wait 59, gc_cc 42, subprocess_pipe_io 7, array_buffer_copy 5, memcpy_memset 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `mozilla::nsDisplayListBuilder::IsAnimatedGeometryRoot(nsIFra` 3; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBuf` 3; `nsIFrame::IsReplaced() const [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 43 ms (top self: `__syscall_cancel_arch [libc.so.6]` 23, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 16, `webrender::batch::AlphaBatchBuilder::build [libxul` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `nsTArrayInfallibleAllocator::ResultTypeProxy nsTAr` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 1, poll_wait 1; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 1; `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Va` 1
- **tab:8370** CPU ms by thread group: main 66, IPC I/O 6, other 1, Socket 0, ImageIO 0
  - main thread 66 ms (1.8% of span): Idle 25, GC / CC 11, Other 9, Layout 7, Graphics 6, JavaScript 5
  - JS leaf 0 / native under JS 6 / native 60; buckets: ipc 61, poll_wait 27, paint_layout 15, gc_cc 13, array_buffer_copy 3, memcpy_memset 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 29; `[linux-vdso.so.1]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[]` 1; `nsTextNode::QueryInterface(nsID const&, void**) [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms
- **tab:8205** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::JSXrayTra` 0; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `[]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8267** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

## webkit (PASS)

CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **48.4** (main 16.7, Renderer 14.9, DOM Worker 13.0, glean.dispatche 1.9, WRRende~ckend# 1.9) | WPEWebProcess 65.0, AxioWebKitHost 16.7, WPENetworkProce 11.2 | — | 513.9 |
| plain | idle | — | — | **8.9** (main 4.9, TaskCon~ller # 1.0, glean.dispatche 0.5, Timer 0.5, Renderer 0.5) | Web Content 2.9, AxioWebKitHost 0.5 | — | — |
| plain | raf | 57.8 | 29.5 | **56.0** (main 24.2, Renderer 9.2, DOM Worker 8.5, SwComposite 7.2, TaskCon~ller # 2.9) | WPEWebProcess 77.0, AxioWebKitHost 9.5, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 51.8 | 36.0 | **105.5** (main 50.5, DOM Worker 28.4, Renderer 8.3, TaskCon~ller # 6.9, SwComposite 6.4) | WPEWebProcess 79.0, AxioWebKitHost 12.7, WebExtensions 0.5, Web Content 0.5 | — | — |
| plain | key | — | — | **14.0** (main 8.5, Renderer 1.1, SwComposite 1.1, DOM Worker 1.1, Timer 0.5) | WPEWebProcess 8.2, AxioWebKitHost 1.4, Isolated Web Co 0.3 | 25.1 | — |
| plain | switch-to-gecko | — | — | **21.9** (main 8.7, IPC I/O Parent 4.4, Renderer 4.4, sqldb:p~lite # 4.4) | WebExtensions 4.4 | — | 210.8 |
| trace | switch-to-engine | — | — | **50.8** (Renderer 20.4, main 14.3, DOM Worker 6.1, glean.dispatche 2.0, WrGlyph~terizer 2.0) | WPEWebProcess 69.3, AxioWebKitHost 20.4, WPENetworkProce 12.2 | — | 467.7 |
| trace | idle | — | — | **4.4** (main 3.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 3.4 | — | — |
| trace | raf | 57.7 | 23.5 | **56.9** (main 25.2, Renderer 8.8, DOM Worker 8.5, SwComposite 6.9, TaskCon~ller # 2.9) | WPEWebProcess 76.0, AxioWebKitHost 9.8 | — | — |
| trace | scroll | 12.6 | 155.5 | **31.1** (main 12.6, DOM Worker 7.5, Indexed~ IO # 2.9, Renderer 1.8, SwComposite 1.3) | WPEWebProcess 22.5, AxioWebKitHost 2.8, Web Content 0.1, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **13.8** (main 8.2, Renderer 1.4, SwComposite 1.1, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 7.1, AxioWebKitHost 1.7 | 25.8 | — |
| trace | switch-to-gecko | — | — | **17.5** (main 8.7, Renderer 4.4, DOM Worker 4.4) |  | — | 211.2 |
| profile | switch-to-engine | — | — | **28.3** (DOM Worker 13.3, main 8.3, SamplerThread 5.0, Softwar~cThread 1.7) | WPEWebProcess 61.3, Web Content 31.5, AxioWebKitHost 18.2, WPENetworkProce 9.9 | — | 574.3 |
| profile | idle | — | — | **24.1** (main 8.3, DOM Worker 6.4, SamplerThread 6.4, Timer 1.5, glean.dispatche 0.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 58.1 | 22.9 | **84.7** (main 32.2, DOM Worker 16.6, Renderer 9.8, SamplerThread 8.1, SwComposite 7.2) | WPEWebProcess 79.0, AxioWebKitHost 10.1, Web Content 6.2, Privileged Cont 1.6 | — | — |
| profile | scroll | 12.4 | 153.9 | **37.6** (main 13.5, DOM Worker 10.4, SamplerThread 6.4, Renderer 1.9, TaskCon~ller # 1.4) | WPEWebProcess 23.5, Web Content 7.2, AxioWebKitHost 2.7, Privileged Cont 1.6 | — | — |
| profile | key | — | — | **33.3** (main 12.1, DOM Worker 8.2, SamplerThread 6.3, Renderer 1.6, Timer 1.1) | WPEWebProcess 8.0, Web Content 6.0, WebExtensions 1.7, Socket Process 1.1 | 26.6 | — |
| profile | switch-to-gecko | — | — | **37.6** (main 12.5, DOM Worker 8.3, IPC I/O Parent 4.2, BgIOThr~Pool # 4.2, Renderer 4.2) | Isolated Web Co 4.2 | — | 216.0 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.0 | 4.0 | 0 | 10.3 | 2524.0 | 1.00 | 95.8 | 6.2 | 0.02 | 3.1 | 6.09 | 4.45 | 1.64 | — | 0.049 |
| trace | raf | 57.4 | 57.7 | 0 | 39.3 | 671.9 | 0.27 | 14.1 | 1.5 | 0.13 | 0.2 | 1.24 | 0.71 | 0.54 | 85.6 | 0.187 |
| trace | scroll | 11.7 | 11.2 | 10 | 14.8 | 0.6 | 0.00 | 11.1 | 0.0 | 0.01 | 0.5 | 0.72 | 2.16 | 0.43 | 111.9 | 0.073 |
| trace | key | 5.5 | 5.5 | 0 | 0.0 | 1.8 | 0.00 | 7.1 | 0.0 | 0.02 | 8.9 | 0.11 | 0.07 | 0.04 | 153.9 | 0.001 |
| profile | switch-to-engine | 3.2 | 3.2 | 0 | 8.3 | 2524.0 | 1.00 | 107.6 | 8.1 | 0.02 | 5.6 | 7.10 | 5.16 | 1.94 | — | 0.049 |
| profile | raf | 58.2 | 58.5 | 0 | 39.6 | 665.5 | 0.26 | 13.1 | 1.7 | 0.14 | 0.3 | 1.49 | 0.82 | 0.70 | — | 0.226 |
| profile | scroll | 11.7 | 11.0 | 13 | 13.9 | 0.5 | 0.00 | 10.7 | 0.0 | 0.01 | 0.4 | 0.81 | 0.29 | 0.59 | 118.9 | 0.082 |
| profile | key | 5.5 | 5.5 | 0 | 0.0 | 1.8 | 0.00 | 7.0 | 0.0 | 0.02 | 8.2 | 0.28 | 0.11 | 0.14 | 153.6 | 0.002 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 14.4 | 0.1 | 0.1 | 8.9 | 0.1 | 153.9 | 24.8 | 178.8 |
| profile | 0.5 | 15.4 | 0.2 | 0.1 | 8.2 | 0.3 | 153.6 | 24.5 | 178.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 10.9; spawn AxioWebKitHost resolved 23.6; write hello 25.7; first stdout read resolved 80.8; write create 81.8; first large (>=64 KiB) read resolved 472.5; first frame accepted (EngineFrameSurface) 472.9; write frame_ack 473.1; write visibility 476.4; write focus 476.6; first ImageData 479.1; first putImageData end 483.7; first surface paint end 483.8

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 12.0; first stdout read resolved 17.3

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 31.9; spawn AxioWebKitHost resolved 62.3; write hello 68.5; first stdout read resolved 125.8; write create 127.0; first large (>=64 KiB) read resolved 583.7; first frame accepted (EngineFrameSurface) 584.0; write frame_ack 584.5; write visibility 591.2; write focus 591.5; first ImageData 594.8; first putImageData end 600.7; first surface paint end 600.8

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.6; first stdout read resolved 26.1

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 58, DOM Worker 51, Renderer 7, IPC I/O 3, Compositor 2, WRSceneBuilder 2, WRRenderBackend 1, SwComposite 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 58 ms (9.4% of span): JavaScript 23, Idle 11, DOM 10, Layout 9, Other 3, Graphics 2
  - JS leaf 5 / native under JS 31 / native 23; buckets: ipc 58, paint_layout 21, gc_cc 20, worker_messaging 19, frame_surface_paint 13, poll_wait 11, array_buffer_copy 11, canvas_2d 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `ARGBSetRow_X86 [libxul.so]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 4; `[unknown]` 3; `nsFlexContainerFrame::DoFlexLayout(mozilla::ReflowInput cons` 2
  - WebRender/compositor threads: Renderer 7 ms (top self: `floorf [libxul.so]` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 1); WRSceneBuilder#0 1 ms (top self: `webrender::clip::ClipTreeBuilder::build_clip_set [` 1, `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRRenderBackend#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0)
  - busiest DOM Worker 51 ms: buckets subprocess_pipe_io 51, worker_messaging 51, ipc 51, js_ctypes 34, poll_wait 32, array_buffer_copy 5; top self: `__syscall_cancel_arch [libc.so.6]` 34; `__lll_lock_wake [libc.so.6]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 3; `__abort_lock_unlock [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7817** CPU ms by thread group: main 50, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 50 ms (8.7% of span): Other 40, Profiler 4, JavaScript 3, DOM 2, Idle 0
  - JS leaf 0 / native under JS 3 / native 46; buckets: ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 1
  - top self: `[]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `[libexpat.so.1]` 3; `mmap64 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7820** CPU ms by thread group: main 38, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 37 ms (6.0% of span): Other 27, JavaScript 5, DOM 4, Idle 2
  - JS leaf 0 / native under JS 4 / native 34; buckets: ipc 29, array_buffer_copy 13, gc_cc 7, subprocess_pipe_io 3, poll_wait 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 3; `[]` 3; `nsTSubstring<char>::ReplaceLiteral(unsigned long, unsigned l` 3; `array_proto_finish(JSContext*, JS::Handle<JSObject*>, JS::Ha` 3; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7731** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.3% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 144, DOM Worker 90, other 16, Renderer 1, Compositor 1, SwComposite 1, Socket 0, IPC I/O 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 144 ms (7.0% of span): Idle 120, Other 7, JavaScript 7, DOM 4, Profiler 3, GC / CC 2
  - JS leaf 1 / native under JS 12 / native 131; buckets: ipc 144, poll_wait 122, gc_cc 4, array_buffer_copy 4, engine_stream_read 2, canvas_2d 2, paint_layout 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 121; `[axiosozo-dev]` 2; `[unknown]` 1; `syscall [libc.so.6]` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `ARGBSetRow_X86 [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `sched_yield [libc.so.6]` 0, `syscall [libc.so.6]` 0)
  - busiest DOM Worker 90 ms: buckets subprocess_pipe_io 90, worker_messaging 90, ipc 90, js_ctypes 89, poll_wait 89, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 89; `[axiosozo-dev]` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(J` 0
- **tab:7386** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7731** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 935, DOM Worker 440, Renderer 278, SwComposite 219, WRRenderBackend 56, Compositor 37, other 23, WRSceneBuilder 11, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 935 ms (30.2% of span): JavaScript 295, Idle 282, DOM 108, GC / CC 99, Other 97, Profiler 36
  - JS leaf 125 / native under JS 341 / native 469; buckets: ipc 928, poll_wait 305, gc_cc 274, paint_layout 257, worker_messaging 243, frame_surface_paint 231, memcpy_memset 135, subprocess_pipe_io 114
  - top self: `__syscall_cancel_arch [libc.so.6]` 307; `__memmove_evex_unaligned_erms [libc.so.6]` 118; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 109; `[unknown]` 40; `[axiosozo-dev]` 21; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 20
  - GC/CC markers: GCMajor 3× 331 ms, GCSlice 23× 84 ms, CCSlice 7× 22 ms, GCMinor 3× 3 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 278 ms (top self: `__syscall_cancel_arch [libc.so.6]` 162, `int blendTextureNearestFast<false, glsl::sampler2D` 39, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 18); SwComposite 219 ms (top self: `syscall [libc.so.6]` 152, `void scale_blit<true>(Texture&, IntRect const&, Te` 56, `__memmove_evex_unaligned_erms [libc.so.6]` 11); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1)
  - busiest DOM Worker 440 ms: buckets subprocess_pipe_io 440, worker_messaging 439, ipc 439, js_ctypes 348, poll_wait 299, gc_cc 52; top self: `__syscall_cancel_arch [libc.so.6]` 336; `[axiosozo-dev]` 12; `__memmove_evex_unaligned_erms [libc.so.6]` 11; `[unknown]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 7
- **tab:7731** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, gc_cc 3, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::NestedIterator<js::gc::SweepGroupZonesIter, js::NestedIt` 1; `js::gc::GCRuntime::collect(bool, JS::SliceBudget const&, JS:` 0; `nsTimerImpl::CancelImpl(bool) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7345** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::ExecuteNextTaskOnlyMainThreadIntern` 0
- **tab:7367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 2156, DOM Worker 1392, Renderer 305, SwComposite 231, other 125, WRRenderBackend 65, Compositor 44, WRSceneBuilder 13, IPC I/O 5, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2156 ms (12.6% of span): Idle 987, JavaScript 508, Other 238, GC / CC 165, DOM 130, Profiler 65
  - JS leaf 174 / native under JS 563 / native 1419; buckets: ipc 2142, poll_wait 1133, gc_cc 434, paint_layout 393, worker_messaging 388, frame_surface_paint 278, subprocess_pipe_io 255, array_buffer_copy 196
  - top self: `__syscall_cancel_arch [libc.so.6]` 1072; `__memmove_evex_unaligned_erms [libc.so.6]` 160; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 144; `[unknown]` 58; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 46; `[axiosozo-dev]` 42
  - GC/CC markers: GCMajor 6× 1907 ms, GCSlice 48× 149 ms, CCSlice 7× 22 ms, GCMinor 22× 9 ms, CC 6× 0 ms
  - WebRender/compositor threads: Renderer 305 ms (top self: `__syscall_cancel_arch [libc.so.6]` 155, `int blendTextureNearestFast<false, glsl::sampler2D` 44, `void scale_blit<true>(Texture&, IntRect const&, Te` 30); SwComposite 231 ms (top self: `syscall [libc.so.6]` 155, `void scale_blit<true>(Texture&, IntRect const&, Te` 63, `__memmove_evex_unaligned_erms [libc.so.6]` 11); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - busiest DOM Worker 1381 ms: buckets subprocess_pipe_io 1381, worker_messaging 1378, ipc 1378, js_ctypes 1076, poll_wait 992, gc_cc 146; top self: `__syscall_cancel_arch [libc.so.6]` 1066; `__memmove_evex_unaligned_erms [libc.so.6]` 96; `syscall [libc.so.6]` 37; `[axiosozo-dev]` 21; `mprotect [libc.so.6]` 16
- **tab:7386** CPU ms by thread group: main 11, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 11 ms (0.1% of span): GC / CC 6, Idle 5, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 11, gc_cc 6, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 3× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7285** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 8 ms (0.0% of span): GC / CC 6, Idle 2
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 7, gc_cc 6, poll_wait 3, array_buffer_copy 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `unsigned long js::gc::Arena::finalize<JSObject, (js::gc::Fin` 1; `__printf_buffer_write [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7345** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, poll_wait 4, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `std::io::impls::<impl std::io::Write for &mut W>::write_all ` 1; `firefox_on_glean::private::labeled::LabeledMetric<T,E>::get_` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `__lll_lock_wake [libc.so.6]` 0; `nsTimer::Cancel() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: main 410, DOM Worker 209, Renderer 51, SwComposite 40, other 26, Compositor 14, WRRenderBackend 12, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 410 ms (11.2% of span): Idle 200, JavaScript 75, Graphics 41, Other 33, Layout 29, DOM 16
  - JS leaf 9 / native under JS 115 / native 287; buckets: ipc 409, poll_wait 237, paint_layout 79, gc_cc 78, worker_messaging 59, engine_stream_read 58, subprocess_pipe_io 22, array_buffer_copy 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 209; `[unknown]` 12; `[axiosozo-dev]` 8; `__memmove_evex_unaligned_erms [libc.so.6]` 7; `__memcmp_evex_movbe [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 51 ms (top self: `__syscall_cancel_arch [libc.so.6]` 27, `int blendTextureNearestFast<false, glsl::sampler2D` 8, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); SwComposite 40 ms (top self: `syscall [libc.so.6]` 23, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - busiest DOM Worker 209 ms: buckets subprocess_pipe_io 209, worker_messaging 209, ipc 209, js_ctypes 195, poll_wait 191, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 191; `[axiosozo-dev]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 2; `nsProfilerStartParams::GetFilters() [libxul.so]` 2; `mozilla::ProfileBufferBlockIndex profiler_add_mark` 1
- **tab:7285** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 6, Profiler 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla` 0; `mozilla::dom::TryToOuterize(JS::MutableHandle<JS::Value>) [l` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
- **tab:7345** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `XRE_IsContentProcess() [libxul.so]` 0
- **tab:7367** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 67, Renderer 18, DOM Worker 13, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 67 ms (24.1% of span): JavaScript 29, Layout 9, Other 8, DOM 8, Idle 5, Profiler 4
  - JS leaf 5 / native under JS 41 / native 21; buckets: ipc 67, array_buffer_copy 18, gc_cc 15, paint_layout 15, worker_messaging 9, poll_wait 6, subprocess_pipe_io 6, engine_stream_read 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBa` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 2; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mo` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::try_recv ` 0, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, poll_wait 12, js_ctypes 11, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSC` 0; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0; `[unknown]` 0
- **tab:7731** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 26 ms (9.3% of span): JavaScript 9, Other 8, Idle 4, Layout 3, DOM 1, GC / CC 0
  - JS leaf 0 / native under JS 9 / native 17; buckets: ipc 24, gc_cc 8, poll_wait 5, subprocess_pipe_io 4, paint_layout 3, memcpy_memset 1, canvas_2d 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 1; `js::SharedImmutableScriptData::createWith(js::FrontendContex` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 1
- **tab:7285** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (1.7% of span): Idle 4, DOM 1, Other 0
  - JS leaf 0 / native under JS 1 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `mozilla::dom::WindowGlobalChild::RecvRawMessage(mozilla::dom` 0
- **tab:7817** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

## webkit-2x (PASS)

CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **57.0** (main 18.4, Renderer 16.7, DOM Worker 13.4, TaskCon~ller # 1.7, BgIOThr~Pool # 1.7) | WPEWebProcess 68.6, AxioWebKitHost 18.4, WPENetworkProce 10.0 | — | 565.3 |
| plain | idle | — | — | **7.4** (main 5.9, Timer 0.5, SwComposite 0.5, DOM Worker 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| plain | raf | 42.1 | 42.7 | **126.7** (main 47.0, DOM Worker 32.8, Renderer 21.6, SwComposite 16.4, TaskCon~ller # 3.5) | WPEWebProcess 181.3, AxioWebKitHost 25.1, WebExtensions 1.3, Privileged Cont 0.9 | — | — |
| plain | scroll | 17.0 | 86.9 | **112.7** (main 51.5, DOM Worker 38.6, Renderer 8.1, SwComposite 6.7, TaskCon~ller # 4.8) | WPEWebProcess 185.6, AxioWebKitHost 27.2, WebExtensions 0.5, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **18.9** (main 8.7, Renderer 3.8, SwComposite 3.0, DOM Worker 1.4, Timer 0.8) | WPEWebProcess 21.8, AxioWebKitHost 2.8 | 32.2 | — |
| plain | switch-to-gecko | — | — | **30.6** (main 8.7, Renderer 8.7, Socket Thread 4.4, Compositor 4.4, SwComposite 4.4) | Isolated Web Co 4.4 | — | 212.2 |
| trace | switch-to-engine | — | — | **93.2** (Renderer 54.7, main 22.5, DOM Worker 6.4, Timer 3.2, TaskCon~ller # 1.6) | WPEWebProcess 67.5, AxioWebKitHost 19.3, WPENetworkProce 9.7 | — | 589.9 |
| trace | idle | — | — | **4.9** (main 3.9, IPC I/O Parent 0.5, Timer 0.5) | Web Content 3.4, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| trace | raf | 41.0 | 42.9 | **124.0** (main 46.1, DOM Worker 32.7, Renderer 20.5, SwComposite 16.7, TaskCon~ller # 3.2) | WPEWebProcess 184.8, AxioWebKitHost 26.0 | — | — |
| trace | scroll | 7.9 | 153.4 | **38.0** (main 14.1, DOM Worker 9.5, Renderer 3.4, IndexedDB IO # 3.1, SwComposite 2.8) | WPEWebProcess 60.2, AxioWebKitHost 6.4, Privileged Cont 0.2, WebExtensions 0.1 | — | — |
| trace | key | — | — | **20.2** (main 9.3, Renderer 4.1, SwComposite 3.5, DOM Worker 1.4, Timer 0.8) | WPEWebProcess 23.0, AxioWebKitHost 3.4, Web Content 0.3 | 31.4 | — |
| trace | switch-to-gecko | — | — | **33.6** (main 8.4, Renderer 8.4, BgIOThr~Pool # 4.2, Compositor 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 4.2 | — | 213.8 |
| profile | switch-to-engine | — | — | **37.2** (DOM Worker 17.9, main 10.4, SamplerThread 7.4, Compositor 1.5) | WPEWebProcess 67.0, AxioWebKitHost 20.8, Web Content 17.9, WPENetworkProce 10.4 | — | 630.0 |
| profile | idle | — | — | **20.4** (main 6.3, DOM Worker 6.3, SamplerThread 5.8, Timer 1.5, Renderer 0.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, RDD Process 1.0 | — | — |
| profile | raf | 37.2 | 49.2 | **132.6** (main 49.8, DOM Worker 31.2, Renderer 18.9, SwComposite 16.4, TaskCon~ller # 6.0) | WPEWebProcess 178.2, AxioWebKitHost 24.2, Web Content 6.0, Isolated Web Co 1.6 | — | — |
| profile | scroll | 8.1 | 167.5 | **38.6** (main 13.5, DOM Worker 9.7, SamplerThread 5.7, Renderer 3.6, SwComposite 2.8) | WPEWebProcess 61.0, Web Content 6.9, AxioWebKitHost 6.7, WebExtensions 1.4 | — | — |
| profile | key | — | — | **39.3** (main 13.4, DOM Worker 8.2, SamplerThread 6.8, Renderer 4.1, SwComposite 3.5) | WPEWebProcess 22.1, Web Content 6.0, AxioWebKitHost 3.3, WebExtensions 1.4 | 33.2 | — |
| profile | switch-to-gecko | — | — | **57.4** (main 16.4, Renderer 12.3, DOM Worker 12.3, BgIOThr~Pool # 4.1, Compositor 4.1) | Isolated Web Co 8.2 | — | 218.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 1.6 | 1.6 | 0 | 12.8 | 7925.3 | 1.00 | 224.3 | 18.0 | 0.03 | 4.5 | 17.54 | 12.87 | 4.67 | — | 0.056 |
| trace | raf | 41.5 | 41.9 | 0 | 97.3 | 2326.8 | 0.29 | 2.4 | 11.1 | 0.44 | 0.2 | 5.78 | 3.59 | 1.89 | — | 0.809 |
| trace | scroll | 7.0 | 7.0 | 0 | 15.0 | 1.2 | 0.00 | 16.2 | 0.0 | 0.02 | 0.2 | 1.52 | 0.10 | 1.34 | 165.4 | 0.120 |
| trace | key | 5.4 | 5.4 | 0 | 0.0 | 6.8 | 0.00 | 17.2 | 0.0 | 0.03 | 0.2 | 0.13 | 0.09 | 0.05 | 156.0 | 0.001 |
| profile | switch-to-engine | 1.5 | 1.5 | 0 | 11.9 | 7925.3 | 1.00 | 264.3 | 21.9 | 0.06 | 7.8 | 18.41 | 13.62 | 4.79 | — | 0.059 |
| profile | raf | 37.9 | 38.2 | 0 | 90.9 | 2399.8 | 0.30 | 0.3 | 13.5 | 0.50 | 0.4 | 6.79 | 4.36 | 2.20 | — | 0.871 |
| profile | scroll | 7.2 | 7.2 | 0 | 12.7 | 1.2 | 0.00 | 15.4 | 0.0 | 0.02 | 0.4 | 2.04 | 0.11 | 1.73 | 84.5 | 0.122 |
| profile | key | 5.4 | 5.4 | 0 | 0.0 | 6.8 | 0.00 | 17.0 | 0.0 | 0.04 | 0.4 | 0.28 | 0.11 | 0.16 | 155.4 | 0.002 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 27.6 | 0.2 | 0.1 | 0.2 | 0.1 | 156.0 | 29.8 | 185.9 |
| profile | 0.5 | 28.2 | 0.2 | 0.1 | 0.4 | 0.3 | 155.4 | 32.0 | 188.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 14.5; spawn AxioWebKitHost resolved 32.2; write hello 34.3; first stdout read resolved 96.8; write create 102.9; first large (>=64 KiB) read resolved 598.5; first frame accepted (EngineFrameSurface) 598.9; write frame_ack 599.1; write visibility 602.4; write focus 602.6; first ImageData 605.5; first putImageData end 620.8; first surface paint end 620.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 12.5; first stdout read resolved 19.1

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 23.2; spawn AxioWebKitHost resolved 52.1; write hello 58.1; first stdout read resolved 128.6; write create 130.7; first large (>=64 KiB) read resolved 637.0; first frame accepted (EngineFrameSurface) 637.5; write frame_ack 637.9; write visibility 644.2; write focus 644.4; first ImageData 647.2; first putImageData end 663.5; first surface paint end 663.7

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 19.5; first stdout read resolved 28.5

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 101, main 70, Renderer 14, IPC I/O 3, Compositor 2, SwComposite 2, WRRenderBackend 1, WRSceneBuilder 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 70 ms (10.2% of span): JavaScript 30, DOM 13, Idle 12, Other 7, Layout 3, Profiler 2
  - JS leaf 11 / native under JS 34 / native 25; buckets: ipc 70, gc_cc 24, worker_messaging 24, paint_layout 22, frame_surface_paint 17, array_buffer_copy 16, subprocess_pipe_io 14, poll_wait 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 9; `__memmove_evex_unaligned_erms [libc.so.6]` 8; `__lll_lock_wake [libc.so.6]` 5; `ARGBSetRow_X86 [libxul.so]` 4; `mozilla::IMEStateManager::SetIMEState(mozilla::widget::IMESt` 2
  - WebRender/compositor threads: Renderer 14 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `void clear_buffer<unsigned int>(Texture&, unsigned` 2); SwComposite 2 ms (top self: `syscall [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, worker_messaging 101, ipc 101, js_ctypes 44, gc_cc 43, poll_wait 40; top self: `__syscall_cancel_arch [libc.so.6]` 43; `js::gc::BufferAllocator::allocSmall(unsigned long,` 27; `__memmove_evex_unaligned_erms [libc.so.6]` 9; `syscall [libc.so.6]` 5; `[axiosozo-dev]` 3
- **tab:9364** CPU ms by thread group: main 53, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 53 ms (8.3% of span): Other 44, JavaScript 5, DOM 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 48; buckets: ipc 40, array_buffer_copy 19, gc_cc 14, subprocess_pipe_io 6, poll_wait 1, memcpy_memset 1
  - top self: `[]` 5; `syscall [libc.so.6]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `[libexpat.so.1]` 2; `PrefsIter::Next() [libxul.so]` 2; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
- **tab:9270** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.2% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::EventTargetChainItem::GetEventTargetParent(mozilla:` 0
- **tab:8810** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 127, DOM Worker 88, other 16, Renderer 4, SwComposite 3, Compositor 2, Socket 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 127 ms (6.2% of span): Idle 103, JavaScript 13, Other 7, DOM 2, Graphics 2, Profiler 1
  - JS leaf 1 / native under JS 13 / native 113; buckets: ipc 127, poll_wait 106, array_buffer_copy 5, memcpy_memset 3, gc_cc 2, engine_stream_read 2, canvas_2d 2, paint_layout 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 105; `[unknown]` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 4 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__syscall_cancel_arch [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 1); SwComposite 3 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 89 ms: buckets subprocess_pipe_io 89, worker_messaging 89, ipc 89, js_ctypes 88, poll_wait 88; top self: `__syscall_cancel_arch [libc.so.6]` 88; `[axiosozo-dev]` 0
- **tab:8924** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libglib-2.0.so.0]` 0
- **tab:8905** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:9276** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 1475, DOM Worker 929, Renderer 557, SwComposite 499, WRRenderBackend 45, Compositor 28, other 15, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1475 ms (46.4% of span): JavaScript 737, Idle 251, DOM 218, Other 132, GC / CC 105, Profiler 25
  - JS leaf 366 / native under JS 657 / native 452; buckets: ipc 1473, paint_layout 590, frame_surface_paint 568, gc_cc 433, worker_messaging 433, bgra_to_rgba 340, memcpy_memset 330, array_buffer_copy 319
  - top self: `__syscall_cancel_arch [libc.so.6]` 375; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 340; `__memmove_evex_unaligned_erms [libc.so.6]` 321; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 70; `[unknown]` 41; `__lll_lock_wait [libc.so.6]` 26
  - GC/CC markers: GCMajor 4× 591 ms, GCSlice 45× 191 ms, CCSlice 9× 35 ms, GCMinor 4× 3 ms, CC 4× 0 ms
  - WebRender/compositor threads: Renderer 557 ms (top self: `__syscall_cancel_arch [libc.so.6]` 283, `int blendTextureNearestFast<false, glsl::sampler2D` 86, `void scale_blit<true>(Texture&, IntRect const&, Te` 63); SwComposite 499 ms (top self: `syscall [libc.so.6]` 302, `void scale_blit<true>(Texture&, IntRect const&, Te` 177, `__memmove_evex_unaligned_erms [libc.so.6]` 19); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 17, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - busiest DOM Worker 929 ms: buckets subprocess_pipe_io 929, worker_messaging 921, ipc 921, js_ctypes 506, poll_wait 416, gc_cc 192; top self: `__syscall_cancel_arch [libc.so.6]` 517; `__memmove_evex_unaligned_erms [libc.so.6]` 98; `[axiosozo-dev]` 50; `__lll_lock_wake [libc.so.6]` 43; `syscall [libc.so.6]` 36
- **tab:9270** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, gc_cc 4, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 1; `__lll_lock_wait [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 0
  - GC/CC markers: GCMajor 1× 43 ms, GCSlice 3× 8 ms, CCSlice 1× 4 ms, GCMinor 1× 2 ms, CC 1× 0 ms
- **tab:8882** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8924** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 2162, DOM Worker 1308, Renderer 576, SwComposite 471, other 119, WRRenderBackend 48, Compositor 32, WRSceneBuilder 8, IPC I/O 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2162 ms (12.5% of span): Idle 1039, JavaScript 522, Other 192, GC / CC 183, DOM 152, Profiler 40
  - JS leaf 254 / native under JS 528 / native 1380; buckets: ipc 2146, poll_wait 1168, paint_layout 446, gc_cc 421, frame_surface_paint 365, worker_messaging 349, subprocess_pipe_io 272, bgra_to_rgba 250
  - top self: `__syscall_cancel_arch [libc.so.6]` 1128; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 240; `__memmove_evex_unaligned_erms [libc.so.6]` 205; `[unknown]` 33; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 32; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 28
  - GC/CC markers: GCMajor 6× 2446 ms, GCSlice 60× 231 ms, CCSlice 11× 30 ms, GCMinor 37× 10 ms, CC 6× 0 ms
  - WebRender/compositor threads: Renderer 576 ms (top self: `__syscall_cancel_arch [libc.so.6]` 265, `int blendTextureNearestFast<false, glsl::sampler2D` 101, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 68); SwComposite 471 ms (top self: `syscall [libc.so.6]` 212, `void scale_blit<true>(Texture&, IntRect const&, Te` 196, `__memmove_evex_unaligned_erms [libc.so.6]` 60); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 17, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1)
  - busiest DOM Worker 1301 ms: buckets subprocess_pipe_io 1301, worker_messaging 1298, ipc 1298, js_ctypes 936, poll_wait 847, gc_cc 216; top self: `__syscall_cancel_arch [libc.so.6]` 919; `__memmove_evex_unaligned_erms [libc.so.6]` 84; `mprotect [libc.so.6]` 43; `syscall [libc.so.6]` 35; `[axiosozo-dev]` 21
- **tab:8924** CPU ms by thread group: main 11, other 1, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 11 ms (0.1% of span): GC / CC 7, Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 9, gc_cc 7, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8810** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 8 ms (0.0% of span): GC / CC 6, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: gc_cc 6, ipc 6, poll_wait 2, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__syscall_cancel_arch [libc.so.6]` 1; `js::detail::OrderedHashTableImpl<js::PreBarriered<js::Hashab` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `mmap64 [libc.so.6]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8882** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 4, ipc 4, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[linux-vdso.so.1]` 1; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 453, DOM Worker 221, Renderer 144, SwComposite 131, other 29, Compositor 15, WRRenderBackend 15, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 453 ms (12.3% of span): Idle 222, JavaScript 84, Graphics 40, Other 35, Layout 34, DOM 20
  - JS leaf 12 / native under JS 131 / native 310; buckets: ipc 450, poll_wait 261, paint_layout 93, gc_cc 83, worker_messaging 65, engine_stream_read 65, memcpy_memset 30, canvas_2d 25
  - top self: `__syscall_cancel_arch [libc.so.6]` 235; `__memmove_evex_unaligned_erms [libc.so.6]` 23; `[unknown]` 15; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `__memset_evex_unaligned_erms [libc.so.6]` 5
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 144 ms (top self: `__syscall_cancel_arch [libc.so.6]` 45, `void scale_blit<true>(Texture&, IntRect const&, Te` 30, `int blendTextureNearestFast<false, glsl::sampler2D` 22); SwComposite 131 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 57, `syscall [libc.so.6]` 42, `__memmove_evex_unaligned_erms [libc.so.6]` 32); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_picture [libxul.so]` 0)
  - busiest DOM Worker 221 ms: buckets subprocess_pipe_io 221, worker_messaging 221, ipc 221, js_ctypes 208, poll_wait 206, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 207; `[unknown]` 4; `[axiosozo-dev]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 1; `js::jit::PostWriteElementBarrier(JSRuntime*, JSObj` 1
- **tab:8810** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 0; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozill` 0; `g_mutex_lock [libglib-2.0.so.0]` 0
- **tab:8882** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
- **tab:8905** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 40, DOM Worker 14, SwComposite 6, Compositor 4, WRRenderBackend 3, IPC I/O 2, WRSceneBuilder 2, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 66 ms (23.6% of span): JavaScript 25, DOM 12, Other 10, Layout 8, Idle 4, Profiler 3
  - JS leaf 1 / native under JS 47 / native 18; buckets: ipc 65, gc_cc 19, array_buffer_copy 17, paint_layout 11, worker_messaging 8, engine_stream_read 5, poll_wait 4, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 5; `[axiosozo-dev]` 4; `js::jit::X86Encoding::BaseAssembler::X86InstructionFormatter` 3; `[unknown]` 2; `AutoPopupStatePusherInternal::~AutoPopupStatePusherInternal(` 2
  - WebRender/compositor threads: Renderer 40 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 5); SwComposite 6 ms (top self: `syscall [libc.so.6]` 6, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 1)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, poll_wait 13, js_ctypes 12; top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 1
- **tab:9270** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 26 ms (9.3% of span): JavaScript 10, Other 8, Idle 4, DOM 1, Profiler 1, Layout 1
  - JS leaf 0 / native under JS 11 / native 15; buckets: ipc 23, paint_layout 10, gc_cc 7, poll_wait 4, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 2; `mozilla::detail::nsTStringRepr<char>::Equals(mozilla::detail` 2; `nsTHashtable<nsBaseHashtableET<nsCStringHashKey, RefPtr<mozi` 1; `js::DefineDataProperty(JSContext*, JS::Handle<JSObject*>, JS` 1; `js::StringEqualsAscii(JSLinearString const*, char const*, un` 1
- **tab:8810** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (1.6% of span): Idle 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 2, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::BaselineCompilerHandler::line() const [libxul.so]` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 0; `[]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateBytes(un` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sy` 0
- **tab:8882** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

