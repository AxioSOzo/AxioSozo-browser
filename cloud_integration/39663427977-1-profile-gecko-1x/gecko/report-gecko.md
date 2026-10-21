# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.2 | **6.4** (main 2.4, glean.dispatche 1.0, TaskCon~ller # 1.0, Renderer 1.0, Softwar~cThread 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **27.9** (Renderer 16.3, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 5.3, WebExtensions 0.7, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.8** (Renderer 9.6, WRRende~ckend# 2.3, glean.dispatche 1.7, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 4.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **42.4** (Renderer 28.6, main 3.9, WRRende~ckend# 3.4, glean.dispatche 2.0, SwComposite 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **7.9** (main 4.3, Renderer 0.8, TaskCon~ller # 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.6, WebExtensions 0.5 | 9.0 | — |
| trace | idle | 59.4 | 17.2 | **4.9** (main 1.9, TaskCon~ller # 1.0, glean.dispatche 0.5, IPDL Background 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **20.6** (Renderer 9.5, WRRende~ckend# 2.3, glean.dispatche 2.0, WRScene~ilder# 1.6, Compositor 1.6) | Isolated Web Co 4.2 | — | — |
| trace | raf-nosampler | — | — | **16.9** (Renderer 9.6, WRScene~ilder# 1.7, WRRende~ckend# 1.7, glean.dispatche 1.3, Compositor 1.0) | Isolated Web Co 4.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **44.9** (Renderer 29.0, main 5.9, WRRende~ckend# 3.0, SwComposite 2.0, Compositor 1.5) | Isolated Web Co 4.4, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **57.0** (main 18.6, DOM Worker 18.1, IPDL Background 6.9, TaskCon~ller # 2.9, StreamTrans # 2.4) | Isolated Web Co 1.6, WebExtensions 0.3, RDD Process 0.3 | 8.0 | — |
| profile | idle | 59.5 | 17.1 | **9.2** (SamplerThread 3.9, main 2.9, TaskCon~ller # 1.4, IPDL Background 0.5, DOM Worker 0.5) | Web Content 8.7, Isolated Web Co 3.4, Privileged Cont 2.4, Socket Process 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **29.8** (Renderer 10.7, SamplerThread 6.5, WRRende~ckend# 2.6, main 1.9, Compositor 1.9) | Isolated Web Co 9.0, Web Content 7.8, Socket Process 1.9, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **27.1** (Renderer 11.6, SamplerThread 6.0, WRRende~ckend# 2.3, Compositor 2.0, glean.dispatche 1.3) | Isolated Web Co 10.3, Web Content 9.3, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.2 | **62.8** (Renderer 32.5, SamplerThread 8.3, main 7.8, WRRende~ckend# 4.4, Compositor 2.4) | Isolated Web Co 10.2, Web Content 9.7, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **15.9** (main 6.1, SamplerThread 4.8, Renderer 1.1, TaskCon~ller # 0.8, glean.dispatche 0.5) | Web Content 9.1, Isolated Web Co 4.5, WebExtensions 2.1, Privileged Cont 2.1 | 11.0 | — |

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

- **parent** CPU ms by thread group: main 50, DOM Worker 2, Compositor 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, SwComposite 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.4% of span): GC / CC 30, Other 7, JavaScript 7, Idle 6, Graphics 1
  - JS leaf 1 / native under JS 5 / native 44; buckets: ipc 50, gc_cc 36, poll_wait 10, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 2, paint_layout 1, json_metadata 0
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `recvmsg [libc.so.6]` 2; `write [libc.so.6]` 2; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 2
  - GC/CC markers: GCMajor 1× 57 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0); SwComposite 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 1, poll_wait 1, array_buffer_copy 1; top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mozilla::PrintfTarget::vprint(char const*, __va_li` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3222** CPU ms by thread group: main 26, IPC I/O 5, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (1.2% of span): Idle 16, GC / CC 6, JavaScript 2, Other 1, Profiler 0, DOM 0
  - JS leaf 0 / native under JS 3 / native 24; buckets: ipc 25, poll_wait 17, gc_cc 7, harness_diagnostics 2, array_buffer_copy 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 17; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `GIFFT_LabeledTimingDistributionStart [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNat` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3308** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3151** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 320, WRRenderBackend 63, main 62, WRSceneBuilder 51, Compositor 44, SwComposite 19, IPC I/O 11, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 62 ms (2.0% of span): GC / CC 30, Idle 20, JavaScript 5, Graphics 3, Other 2, Layout 2
  - JS leaf 0 / native under JS 5 / native 57; buckets: ipc 62, gc_cc 33, poll_wait 21, paint_layout 4, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 20; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `JS::GCThingTraceKind(void*) [libxul.so]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 26 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 320 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 56, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 54); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1); WRSceneBuilder#0 45 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 3, memcpy_memset 2, poll_wait 0; top self: `munmap [libc.so.6]` 1; `madvise [libc.so.6]` 1; `unsigned long js::gc::Arena::finalize<JSString, (j` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3222** CPU ms by thread group: main 156, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 156 ms (5.0% of span): Idle 98, Graphics 19, Layout 17, Other 11, Profiler 7, JavaScript 3
  - JS leaf 0 / native under JS 7 / native 149; buckets: ipc 150, poll_wait 100, paint_layout 46, harness_diagnostics 4, subprocess_pipe_io 3, gc_cc 3, memcpy_memset 2, canvas_2d 2
  - top self: `poll [libc.so.6]` 98; `sendmsg [libc.so.6]` 4; `[linux-vdso.so.1]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[]` 2; `__sincos_fma [libm.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3112** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::gfx::VRManagerChild::GetIdleDeadlineHint(mozilla::T` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 336, WRRenderBackend 64, WRSceneBuilder 54, Compositor 46, main 15, SwComposite 14, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 15 ms (0.5% of span): Idle 12, JavaScript 2, DOM 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 3 / native 12; buckets: ipc 15, poll_wait 12, harness_diagnostics 3, array_buffer_copy 3, gc_cc 1, paint_layout 0
  - top self: `poll [libc.so.6]` 12; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, J` 1; `__strlen_avx2 [libc.so.6]` 1; `mozilla::MergeState::ProcessItemFromNewList(mozilla::nsDispl` 0; `[linux-vdso.so.1]` 0
  - WebRender/compositor threads: Renderer 337 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 75, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 49); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 4, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 47 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 1, `webrender::scene_builder_thread::SceneBuilderThrea` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3222** CPU ms by thread group: main 165, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 165 ms (5.4% of span): Idle 106, Graphics 22, Layout 15, Other 9, Profiler 8, GC / CC 3
  - JS leaf 0 / native under JS 4 / native 160; buckets: ipc 154, poll_wait 107, paint_layout 45, gc_cc 3, memcpy_memset 3, canvas_2d 2, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 104; `[]` 5; `sendmsg [libc.so.6]` 4; `[linux-vdso.so.1]` 3; `__lll_lock_wait [libc.so.6]` 2; `getcontext [libc.so.6]` 2
  - GC/CC markers: CCSlice 1× 3 ms, GCSlice 2× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3308** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3133** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 646, main 140, WRRenderBackend 77, SwComposite 40, Compositor 32, WRSceneBuilder 23, IPC I/O 9, other 1, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 140 ms (6.7% of span): Idle 72, GC / CC 31, Other 12, JavaScript 8, Graphics 8, Layout 5
  - JS leaf 1 / native under JS 7 / native 132; buckets: ipc 140, poll_wait 94, gc_cc 33, paint_layout 11, harness_diagnostics 5, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 73; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JS::Symbol>` 3; `auto JS::MapGCThingTyped<js::gc::MarkingTracerT<6u>::markAnd` 3; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, ns` 2; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCSlice 10× 28 ms, CCSlice 1× 6 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 646 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 209, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 91, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 61); WRRenderBackend#0 77 ms (top self: `syscall [libc.so.6]` 56, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 3); SwComposite 40 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3222** CPU ms by thread group: main 107, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 107 ms (5.1% of span): Idle 64, Graphics 18, GC / CC 9, Other 7, JavaScript 3, Profiler 2
  - JS leaf 0 / native under JS 3 / native 104; buckets: ipc 105, poll_wait 64, paint_layout 24, gc_cc 12, harness_diagnostics 2, array_buffer_copy 1, canvas_2d 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 64; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 4; `[]` 2; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder` 1; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped` 1; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 21 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3133** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3308** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 216, Renderer 36, WRRenderBackend 20, Compositor 19, WRSceneBuilder 15, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 216 ms (5.7% of span): Idle 46, Layout 38, GC / CC 36, Graphics 32, JavaScript 30, Other 26
  - JS leaf 3 / native under JS 33 / native 181; buckets: ipc 216, paint_layout 73, poll_wait 67, gc_cc 54, subprocess_pipe_io 6, harness_diagnostics 4, memcpy_memset 4, array_buffer_copy 4
  - top self: `poll [libc.so.6]` 47; `[axiosozo-dev]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `[unknown]` 3; `mozilla::nsDisplayItem::GetClippedBounds(mozilla::nsDisplayL` 3
  - GC/CC markers: GCMajor 1× 62 ms, GCSlice 6× 29 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 23, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2); WRRenderBackend#0 20 ms (top self: `syscall [libc.so.6]` 15, `[axiosozo-dev]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3222** CPU ms by thread group: main 69, IPC I/O 7, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 69 ms (1.8% of span): Idle 27, Other 10, GC / CC 8, Profiler 7, JavaScript 7, Layout 5
  - JS leaf 0 / native under JS 6 / native 64; buckets: ipc 63, poll_wait 31, paint_layout 19, gc_cc 12, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 28; `sendmsg [libc.so.6]` 3; `[]` 3; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::V` 1; `nsLineLayout::ReflowFrame(nsIFrame*, nsReflowStatus&, mozill` 1
  - GC/CC markers: GCMajor 1× 22 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3057** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 0, JavaScript 0, DOM 0, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, ` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `mozilla::dom::TimeoutManager::UnmarkGrayTimers() [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:598:12)[` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3112** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

