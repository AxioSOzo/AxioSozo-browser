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

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **86.4** (main 43.2, Renderer 21.6, DOM Worker 10.8, WRScene~ilder# 5.4, WRRende~ckend# 5.4) | AxioCEFProbe 32.4, cef:renderer 27.0, cef:gpu-process 5.4 | — | 140.9 |
| plain | idle | — | — | **8.1** (main 5.2, Timer 0.9, IPC I/O Parent 0.5, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.3, AxioCEFProbe 3.3, forkserver 0.5, cef:utility 0.5 | — | — |
| plain | raf | 60.0 | 23.4 | **26.5** (main 11.9, DOM Worker 3.5, Renderer 2.6, WRRende~ckend# 1.3, Compositor 1.3) | cef:renderer 10.9, cef:gpu-process 5.4, AxioCEFProbe 5.4, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **19.9** (main 5.3, DOM Worker 3.6, Renderer 2.3, WRRende~ckend# 1.7, Compositor 1.3) | cef:renderer 10.9, AxioCEFProbe 7.0, cef:gpu-process 6.3 | — | — |
| plain | scroll | 60.0 | 24.2 | **45.9** (main 23.0, DOM Worker 8.1, Renderer 2.9, Backgro~Pool # 2.4, TaskCon~ller # 1.9) | cef:gpu-process 21.1, cef:renderer 12.5, AxioCEFProbe 8.6 | — | — |
| plain | key | — | — | **18.8** (main 11.2, DOM Worker 1.9, Timer 1.4, Renderer 1.1, TaskCon~ller # 0.8) | cef:renderer 2.8, AxioCEFProbe 2.4, cef:gpu-process 0.8, Privileged Cont 0.3 | 13.9 | — |
| plain | switch-to-gecko | — | — | **14.9** (DOM Worker 5.6, main 5.0, IPDL Background 1.7, TaskCon~ller # 1.1, StreamTrans # 0.5) | WebExtensions 0.1, Web Content 0.1, Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15022.2 |
| trace | switch-to-engine | — | — | **109.7** (main 40.4, Renderer 37.5, TaskCon~ller # 11.5, glean.dispatche 5.8, WRRende~ckend# 5.8) | AxioCEFProbe 60.6, cef:gpu-process 31.7, cef:utility 23.0, cef:renderer 17.3 | — | 275.2 |
| trace | idle | — | — | **6.6** (main 5.2, Timer 0.9, DOM Worker 0.5) | AxioCEFProbe 3.4, Web Content 1.4, cef:zygote 0.5 | — | — |
| trace | raf | 60.0 | 22.6 | **26.8** (main 11.9, DOM Worker 3.9, Renderer 2.2, WRRende~ckend# 1.6, SwComposite 1.3) | cef:renderer 10.9, AxioCEFProbe 5.8, cef:gpu-process 5.1 | — | — |
| trace | raf-nosampler | — | — | **18.1** (main 5.6, DOM Worker 3.3, Renderer 2.3, WRRende~ckend# 1.3, Compositor 1.3) | cef:renderer 9.9, AxioCEFProbe 6.3, cef:gpu-process 5.7, Isolated Web Co 0.3 | — | — |
| trace | scroll | 60.1 | 23.0 | **48.6** (main 24.0, DOM Worker 8.2, Backgro~Pool # 3.4, Renderer 2.9, TaskCon~ller # 1.9) | cef:gpu-process 22.2, cef:renderer 11.0, AxioCEFProbe 8.7 | — | — |
| trace | key | — | — | **17.2** (main 10.9, Renderer 1.4, DOM Worker 1.4, Timer 0.8, TaskCon~ller # 0.8) | AxioCEFProbe 2.5, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 13.8 | — |
| trace | switch-to-gecko | — | — | **34.9** (main 17.5, BgIOThr~Pool # 5.8, Renderer 5.8, WRRende~ckend# 5.8) |  | — | 132.6 |
| profile | switch-to-engine | — | — | **91.0** (main 43.3, Renderer 17.3, DOM Worker 13.0, TaskCon~ller # 8.7, SamplerThread 8.7) | AxioCEFProbe 25.9, cef:renderer 21.7, cef:utility 4.3, Privileged Cont 4.3 | — | 149.2 |
| profile | idle | — | — | **23.1** (DOM Worker 8.0, SamplerThread 8.0, main 5.7, Timer 1.4) | Web Content 9.5, AxioCEFProbe 3.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 60.0 | 26.2 | **53.4** (main 13.7, DOM Worker 12.7, SamplerThread 11.8, Renderer 2.5, Timer 1.9) | Web Content 10.8, cef:renderer 9.5, AxioCEFProbe 5.3, cef:gpu-process 4.8 | — | — |
| profile | raf-nosampler | — | — | **41.4** (DOM Worker 13.9, SamplerThread 9.9, main 6.9, Renderer 2.6, WRRende~ckend# 1.6) | cef:renderer 9.6, Web Content 9.5, AxioCEFProbe 5.6, cef:gpu-process 5.0 | — | — |
| profile | scroll | 60.3 | 22.0 | **68.9** (main 24.3, DOM Worker 17.2, SamplerThread 12.4, Renderer 2.9, Backgro~Pool # 2.9) | cef:gpu-process 22.0, cef:renderer 11.4, Web Content 10.5, AxioCEFProbe 8.6 | — | — |
| profile | key | — | — | **42.6** (main 13.3, DOM Worker 10.1, SamplerThread 9.5, TaskCon~ller # 2.2, Renderer 1.9) | Web Content 9.2, cef:renderer 2.5, Privileged Cont 1.9, Isolated Web Co 1.9 | 16.2 | — |
| profile | switch-to-gecko | — | — | **61.5** (main 27.9, DOM Worker 11.2, BgIOThr~Pool # 5.6, WRRende~ckend# 5.6, Compositor 5.6) | Isolated Web Co 5.6 | — | 139.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 8.0 | 0.0 | 0 | 0.0 | — | — | 2.3 | 0.0 | — | 2.94 | 0.37 | — | — | — | — | — | 0.004 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.17 | 0.12 | — | — | — | — | — | 0.009 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.17 | 0.12 | — | — | — | — | — | 0.008 |
| trace | scroll | 59.0 | 0.0 | 0 | 0.0 | — | — | 9.5 | 0.0 | — | 0.35 | 0.12 | — | — | — | — | — | 0.007 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | 0.39 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.3 | 0.0 | 0 | 0.0 | — | — | 7.8 | 0.0 | — | 2.47 | 0.88 | — | — | — | — | — | 0.006 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.18 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.16 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.9 | 0.0 | 0 | 0.0 | — | — | 8.0 | 0.0 | — | 0.32 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.8 | 0.0 | — | 0.64 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.101 | 1.905 | 0.0103 | 0.0178 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.055 | 0.090 | 0.0033 | 0.0054 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.062 | 0.092 | 0.0037 | 0.0055 |
| plain | scroll | memfd | native | 122 | 122 | 0.211 | 0.240 | 0.0122 | 0.0139 |
| plain | key | memfd | native | 21 | 21 | 0.017 | 0.065 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 0.967 | 4.209 | 0.0078 | 0.0338 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 189 | 189 | 0.057 | 0.089 | 0.0034 | 0.0054 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.067 | 0.094 | 0.0040 | 0.0057 |
| trace | scroll | memfd | native | 124 | 124 | 0.252 | 0.253 | 0.0149 | 0.0149 |
| trace | key | memfd | native | 21 | 21 | 0.019 | 0.063 | 0.0001 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.287 | 3.033 | 0.0094 | 0.0222 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.056 | 0.104 | 0.0033 | 0.0062 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.056 | 0.099 | 0.0033 | 0.0059 |
| profile | scroll | memfd | native | 125 | 125 | 0.206 | 0.243 | 0.0121 | 0.0143 |
| profile | key | memfd | native | 21 | 21 | 0.018 | 0.083 | 0.0001 | 0.0005 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 8.9 | 0.0 | — | 0.39 | 0.61 | — | — | 6.2 | 10.1 | 16.5 |
| profile | 0.7 | 11.0 | 0.0 | — | 0.64 | 0.96 | — | — | 6.9 | 13.0 | 19.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 110.3; write create 111.9; first frame applied (native receiver) 292.6; write frame_ack 293.6; write focus 306.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 32.8; first stdout read resolved 40.4; write shutdown 46.5

Switch timeline (profile, switch-to-engine, ms after the window start): write create 62.1; first stdout read resolved 79.7; first frame applied (native receiver) 182.0; write frame_ack 183.6; write focus 194.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 39.1; first stdout read resolved 49.4; write shutdown 54.2

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 118, Renderer 32, DOM Worker 16, BgPool 6, WRRenderBackend 4, Compositor 4, WRSceneBuilder 3, SwComposite 2, IPC I/O 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 118 ms (43.2% of span): GC / CC 39, Layout 29, JavaScript 29, DOM 6, Idle 5, Other 5
  - JS leaf 7 / native under JS 40 / native 71; buckets: ipc 118, gc_cc 74, paint_layout 39, array_buffer_copy 18, harness_diagnostics 14, poll_wait 13, subprocess_pipe_io 11, engine_stream_read 8
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `mozilla::layers::AnimationInfo::EnumerateGenerationOnFrame(n` 6; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 6; `style::properties::generated::longhands::height::cascade_pro` 5; `poll [libc.so.6]` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4
  - GC/CC markers: GCMajor 1× 130 ms, GCSlice 6× 49 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `hypotf@@GLIBC_2.35 [libm.so.6]` 6, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 2); WRSceneBuilder#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, js_ctypes 16, worker_messaging 16, ipc 16, poll_wait 15; top self: `poll [libc.so.6]` 15; `mozilla::dom::WorkerPrivate::BeginCTypesCall() [li` 1
- **tab:4336** CPU ms by thread group: main 31, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 31 ms (11.3% of span): Other 24, DOM 5, JavaScript 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 25; buckets: ipc 30, gc_cc 15, array_buffer_copy 12, subprocess_pipe_io 8, memcpy_memset 2, poll_wait 2
  - top self: `[]` 4; `js::SharedImmutableScriptData::createWith(js::FrontendContex` 3; `icu_78::PropNameData::getPropertyValueName(int, int, int) [l` 2; `icu_78::CharString::appendInvariantChars(char16_t const*, in` 2; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 2; `poll [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4331** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.6% of span): Other 3, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 1, image_container 1, gc_cc 1
  - top self: `poll [libc.so.6]` 1; `nsTimer::Cancel() [libxul.so]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `sendmsg [libc.so.6]` 1; `encoding_rs::utf_8::convert_utf16_to_utf8_partial_inner [lib` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4148** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 108, main 102, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 102 ms (4.8% of span): Idle 85, JavaScript 10, Other 6, Profiler 1, DOM 0
  - JS leaf 1 / native under JS 8 / native 93; buckets: ipc 102, poll_wait 89, harness_diagnostics 8, gc_cc 6, array_buffer_copy 5, subprocess_pipe_io 2, json_metadata 1, worker_messaging 1
  - top self: `poll [libc.so.6]` 85; `recvmsg [libc.so.6]` 2; `[unknown]` 2; `js::jit::BaselineCompiler::emitBody() [libxul.so]` 1; `js::frontend::ParserBase::newGlobalScopeData(js::frontend::P` 1; `JS::RunJSMicroTask(JSContext*, JS::Handle<JSObject*>) [libxu` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, js_ctypes 108, worker_messaging 108, ipc 108, poll_wait 108; top self: `poll [libc.so.6]` 108
- **tab:3622** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4336** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 398, DOM Worker 299, Renderer 78, WRRenderBackend 48, SwComposite 41, Compositor 41, BgPool 37, other 32, ImageBridge 18, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 398 ms (12.6% of span): Idle 226, JavaScript 81, Other 38, GC / CC 35, DOM 15, Profiler 4
  - JS leaf 3 / native under JS 85 / native 310; buckets: ipc 398, poll_wait 251, gc_cc 118, worker_messaging 45, engine_stream_read 41, json_metadata 25, native_receiver 17, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 229; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `recvmsg [libc.so.6]` 7; `write [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6
  - GC/CC markers: GCMajor 1× 1045 ms, GCSlice 8× 32 ms, CCSlice 2× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 3); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 41 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 37 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `mozilla::BaseTimeDurationPlatformUtils::ToSeconds(` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `__lll_lock_wait [libc.so.6]` 0, `mozilla::ipc::NodeController::SendUserMessage(mojo` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 299 ms: buckets subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 278, poll_wait 273, gc_cc 9; top self: `poll [libc.so.6]` 273; `__lll_lock_wake [libc.so.6]` 2; `[unknown]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3640** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 11 ms (0.3% of span): GC / CC 8, Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 9, gc_cc 8, poll_wait 4
  - top self: `poll [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::gc::GCRuntime::sweepPropMapTree(JS::GCContext*, JS::Slic` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3551** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.3% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 8, gc_cc 7, poll_wait 3, array_buffer_copy 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `nsTHashtable<nsBaseHashtableET<nsPtrHashKey<nsIMemoryReporte` 1
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, gc_cc 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 328, main 193, Renderer 72, WRRenderBackend 42, SwComposite 39, Compositor 38, BgPool 35, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 193 ms (6.3% of span): Idle 106, JavaScript 58, Other 12, DOM 12, Profiler 4
  - JS leaf 6 / native under JS 62 / native 125; buckets: ipc 193, poll_wait 116, gc_cc 66, engine_stream_read 42, worker_messaging 33, json_metadata 20, native_receiver 18, subprocess_pipe_io 13
  - top self: `poll [libc.so.6]` 107; `[unknown]` 8; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `write [libc.so.6]` 3; `recvmsg [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 72 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 57, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 2); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 39 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 31, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wake [libc.so.6]` 0, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 329 ms: buckets subprocess_pipe_io 329, worker_messaging 329, ipc 329, js_ctypes 264, poll_wait 256, gc_cc 50; top self: `poll [libc.so.6]` 256; `[axiosozo-dev]` 8; `madvise [libc.so.6]` 8; `[unknown]` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:3640** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4331** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4336** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 481, DOM Worker 298, BgPool 59, Renderer 51, WRRenderBackend 33, Compositor 27, SwComposite 24, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 481 ms (22.6% of span): Idle 278, JavaScript 76, Other 61, GC / CC 21, Graphics 17, DOM 12
  - JS leaf 13 / native under JS 71 / native 396; buckets: ipc 481, poll_wait 349, gc_cc 96, paint_layout 41, worker_messaging 37, engine_stream_read 21, json_metadata 18, array_buffer_copy 17
  - top self: `poll [libc.so.6]` 281; `write [libc.so.6]` 9; `[unknown]` 8; `recvmsg [libc.so.6]` 8; `[axiosozo-dev]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5
  - GC/CC markers: GCSlice 4× 15 ms, CCSlice 2× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 51 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 42, `syscall [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); SwComposite 24 ms (top self: `syscall [libc.so.6]` 24, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 59 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__pthread_mutex_cond_lock [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 298 ms: buckets subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 258, poll_wait 253, gc_cc 10; top self: `poll [libc.so.6]` 253; `[axiosozo-dev]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `[unknown]` 3; `getcontext [libc.so.6]` 3
- **tab:3640** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4150** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 455, DOM Worker 254, Renderer 54, other 35, Compositor 17, SwComposite 16, WRRenderBackend 14, WRWorker 11, WRSceneBuilder 9, BgPool 3, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 455 ms (12.3% of span): Idle 175, JavaScript 83, GC / CC 60, Layout 43, Graphics 32, Other 28
  - JS leaf 13 / native under JS 136 / native 305; buckets: ipc 455, poll_wait 210, gc_cc 151, paint_layout 88, worker_messaging 65, engine_stream_read 36, subprocess_pipe_io 16, array_buffer_copy 15
  - top self: `poll [libc.so.6]` 176; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 14; `[axiosozo-dev]` 11; `[unknown]` 10; `write [libc.so.6]` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6
  - GC/CC markers: GCMajor 2× 823 ms, GCSlice 14× 52 ms, CCSlice 3× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 54 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5); SwComposite 16 ms (top self: `syscall [libc.so.6]` 12, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `webrender::prepare::prepare_prim_for_render [libxu` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::ipc::PortLink::OnPortStatusChanged() [lib` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 254 ms: buckets subprocess_pipe_io 254, worker_messaging 254, ipc 254, js_ctypes 238, poll_wait 233, gc_cc 6; top self: `poll [libc.so.6]` 233; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `mozilla::dom::TimeoutExecutor::Run() [libxul.so]` 2; `js::ctypes::StructType::FieldSetter(JSContext*, un` 2; `void js::NativeObject::setFixedSlot<true>(unsigned` 1
- **tab:3551** CPU ms by thread group: main 7, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 0, DOM 0, Profiler 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::H` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `__strlen_avx2 [libc.so.6]` 0; `js::StringEqualsAscii(JSLinearString const*, char const*) [l` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3600** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4150** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 48, DOM Worker 14, Renderer 14, BgPool 10, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, IPC I/O 1, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 48 ms (22.8% of span): Layout 20, JavaScript 16, Idle 4, Graphics 3, Other 2, Profiler 2
  - JS leaf 3 / native under JS 28 / native 17; buckets: ipc 48, paint_layout 24, gc_cc 14, harness_diagnostics 10, array_buffer_copy 9, worker_messaging 8, poll_wait 5, engine_stream_read 5
  - top self: `nsContentUtils::GetCurrentJSContext() [libxul.so]` 4; `poll [libc.so.6]` 4; `[axiosozo-dev]` 3; `nsIFrame::IsBlockContainer() const [libxul.so]` 2; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 2; `recvmsg [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 14 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `ps_quad_textured_TEXTURE_2D_frag::swgl_drawSpanRGB` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `webrender::prim_store::text_run::TextRunKey::new [` 1, `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `unlink [libc.so.6]` 7, `fstatat64 [libc.so.6]` 2, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 14, poll_wait 13, array_buffer_copy 0; top self: `poll [libc.so.6]` 13; `wait4 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `write [libc.so.6]` 0; `[axiosozo-dev]` 0
- **tab:4148** CPU ms by thread group: main 5, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (2.3% of span): Idle 3, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `mozilla::dom::Document::GetDocShell() const [libxul.so]` 1; `nsIFrame::Combines3DTransformWithAncestors() const [libxul.s` 0; `non-virtual thunk to nsGlobalWindowInner::GetExistingDebugge` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3551** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.2% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **utility:3694** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **111.7** (Renderer 46.5, main 37.2, WRRende~ckend# 9.3, DOM Worker 9.3, Backgro~Pool # 4.7) | AxioCEFProbe 32.7, cef:renderer 23.3, cef:gpu-process 4.7, Isolated Web Co 4.7 | — | 161.7 |
| plain | idle | — | — | **5.3** (main 3.8, Timer 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 3.3, AxioCEFProbe 3.0, forkserver 0.5, cef:utility 0.5 | — | — |
| plain | raf | 60.0 | 20.9 | **30.6** (main 8.4, Renderer 5.5, Backgro~Pool # 3.9, SwComposite 3.9, DOM Worker 2.9) | cef:gpu-process 15.4, cef:renderer 12.3, AxioCEFProbe 8.7 | — | — |
| plain | raf-nosampler | — | — | **39.3** (main 10.3, Renderer 4.3, Backgro~Pool # 4.0, Socket Thread 3.6, DOM Worker 3.6) | cef:gpu-process 17.6, cef:renderer 11.5, AxioCEFProbe 8.6 | — | — |
| plain | scroll | 60.0 | 21.0 | **47.2** (main 18.7, DOM Worker 6.7, Backgro~Pool # 6.2, Renderer 4.8, SwComposite 3.4) | cef:gpu-process 59.6, cef:renderer 14.8, AxioCEFProbe 12.9 | — | — |
| plain | key | — | — | **40.1** (main 14.5, DOM Worker 9.8, Indexed~ IO # 3.6, Renderer 3.3, IPDL Background 1.9) | AxioCEFProbe 2.7, cef:renderer 1.9, cef:gpu-process 1.0, WebExtensions 0.6 | 13.3 | — |
| plain | switch-to-gecko | — | — | **9.1** (main 3.1, DOM Worker 3.1, IPDL Background 0.9, TaskCon~ller # 0.8, StreamTrans # 0.3) | Privileged Cont 0.2, RDD Process 0.1 | — | 15022.7 |
| trace | switch-to-engine | — | — | **94.9** (Renderer 47.4, main 22.3, DOM Worker 9.8, Backgro~Pool # 4.2, glean.dispatche 1.4) | AxioCEFProbe 86.5, cef:gpu-process 33.5, cef:utility 18.2, cef:zygote 16.7 | — | 655.4 |
| trace | idle | — | — | **3.8** (main 3.3, Timer 0.5) | AxioCEFProbe 4.3, cef:zygote 0.5, cef:gpu-process 0.5, Web Content 0.5 | — | — |
| trace | raf | 60.0 | 20.7 | **29.3** (main 8.6, Renderer 4.8, Backgro~Pool # 3.8, SwComposite 3.8, DOM Worker 2.9) | cef:gpu-process 15.6, cef:renderer 11.5, AxioCEFProbe 9.5, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **25.4** (main 5.3, Renderer 4.6, Backgro~Pool # 3.6, SwComposite 3.6, DOM Worker 3.3) | cef:gpu-process 15.9, cef:renderer 10.2, AxioCEFProbe 9.7 | — | — |
| trace | scroll | 59.9 | 23.2 | **44.8** (main 19.5, DOM Worker 7.6, Backgro~Pool # 6.2, Renderer 4.8, SwComposite 3.3) | cef:gpu-process 60.9, AxioCEFProbe 13.4, cef:renderer 12.8 | — | — |
| trace | key | — | — | **22.1** (main 11.2, Renderer 3.0, TaskCon~ller # 1.9, SwComposite 1.4, DOM Worker 1.1) | AxioCEFProbe 3.3, cef:renderer 2.8, cef:gpu-process 0.8 | 14.0 | — |
| trace | switch-to-gecko | — | — | **42.7** (Renderer 18.3, main 12.2, BgIOThr~Pool # 6.1, DOM Worker 6.1) | Isolated Web Co 6.1 | — | 134.6 |
| profile | switch-to-engine | — | — | **106.1** (Renderer 31.9, main 28.3, DOM Worker 10.6, SamplerThread 10.6, Backgro~Pool # 7.1) | Web Content 38.9, AxioCEFProbe 24.7, cef:renderer 17.7, cef:utility 3.5 | — | 223.7 |
| profile | idle | — | — | **24.1** (SamplerThread 9.0, DOM Worker 7.1, main 5.7, Timer 1.4, TaskCon~ller # 0.9) | Web Content 8.5, AxioCEFProbe 3.3, WebExtensions 1.9, Socket Process 1.4 | — | — |
| profile | raf | 60.1 | 20.8 | **59.8** (main 13.3, SamplerThread 12.0, DOM Worker 11.7, Renderer 5.7, Backgro~Pool # 4.4) | cef:gpu-process 17.7, cef:renderer 12.4, Web Content 9.5, AxioCEFProbe 9.1 | — | — |
| profile | raf-nosampler | — | — | **48.2** (DOM Worker 11.2, SamplerThread 10.6, main 7.3, Renderer 5.6, Backgro~Pool # 4.6) | cef:gpu-process 17.6, cef:renderer 11.6, Web Content 10.6, AxioCEFProbe 10.0 | — | — |
| profile | scroll | 59.9 | 21.9 | **75.4** (main 25.6, DOM Worker 15.2, SamplerThread 11.9, Backgro~Pool # 7.1, Renderer 5.2) | cef:gpu-process 66.9, cef:renderer 15.6, AxioCEFProbe 13.8, Web Content 9.5 | — | — |
| profile | key | — | — | **40.1** (main 11.7, SamplerThread 9.8, DOM Worker 8.7, Renderer 3.3, Timer 1.6) | Web Content 8.7, cef:renderer 2.8, AxioCEFProbe 2.2, WebExtensions 2.2 | 15.8 | — |
| profile | switch-to-gecko | — | — | **78.4** (main 22.4, Renderer 22.4, BgIOThr~Pool # 11.2, Softwar~cThread 5.6, Compositor 5.6) | Isolated Web Co 5.6 | — | 143.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.0 | 0.0 | 0 | 0.0 | — | — | 1.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | scroll | 57.8 | 0.0 | 0 | 0.0 | — | — | 11.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 6.3 | 0.0 | 0 | 0.0 | — | — | 14.8 | 0.0 | — | 6.60 | 1.45 | — | — | — | — | — | 0.009 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.44 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.39 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 57.7 | 0.0 | 0 | 0.0 | — | — | 11.8 | 0.0 | — | 0.71 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.3 | 0.0 | — | 0.31 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 4.104 | 8.102 | 0.0345 | 0.0681 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.250 | 0.337 | 0.0150 | 0.0202 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.261 | 0.356 | 0.0155 | 0.0212 |
| plain | scroll | memfd | native | 121 | 121 | 0.452 | 0.540 | 0.0260 | 0.0311 |
| plain | key | memfd | native | 21 | 21 | 0.048 | 0.148 | 0.0003 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 4.955 | 9.857 | 0.0199 | 0.0396 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 189 | 189 | 0.243 | 0.354 | 0.0146 | 0.0212 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.243 | 0.370 | 0.0146 | 0.0222 |
| trace | scroll | memfd | native | 123 | 123 | 0.487 | 0.567 | 0.0282 | 0.0328 |
| trace | key | memfd | native | 21 | 21 | 0.055 | 0.157 | 0.0003 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 5.901 | 7.862 | 0.0371 | 0.0494 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 192 | 192 | 0.289 | 0.407 | 0.0174 | 0.0245 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.282 | 0.442 | 0.0169 | 0.0265 |
| profile | scroll | memfd | native | 123 | 123 | 0.593 | 0.646 | 0.0342 | 0.0372 |
| profile | key | memfd | native | 21 | 21 | 0.052 | 0.190 | 0.0003 | 0.0011 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 9.1 | 0.0 | — | — | — | — | — | — | — | — |
| profile | 0.7 | 11.4 | 0.0 | — | 0.29 | 0.66 | — | — | 9.7 | 12.7 | 22.3 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 33.0; spawn AxioCEFProbe resolved 51.2; write hello 69.1; first stdout read resolved 393.0; write create 398.0; write frame_ack 674.2; write focus 684.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 27.5; first stdout read resolved 34.1; write shutdown 42.2

Switch timeline (profile, switch-to-engine, ms after the window start): write create 46.5; first stdout read resolved 61.1; first frame applied (native receiver) 243.9; write frame_ack 246.0; write focus 259.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 31.0; first stdout read resolved 41.5; write shutdown 44.7

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 89, main 76, DOM Worker 21, BgPool 20, SwComposite 8, WRRenderBackend 5, Compositor 5, WRSceneBuilder 3, IPC I/O 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 76 ms (24.1% of span): JavaScript 28, Layout 16, DOM 10, Idle 8, Profiler 6, Other 4
  - JS leaf 1 / native under JS 49 / native 27; buckets: ipc 76, paint_layout 28, gc_cc 27, array_buffer_copy 17, poll_wait 12, harness_diagnostics 11, memcpy_memset 8, webrender_render 7
  - top self: `poll [libc.so.6]` 11; `__memmove_avx_unaligned_erms [libc.so.6]` 8; `nsStyledElement::SetInlineStyleDeclaration(mozilla::StyleLoc` 7; `js::GlobalObject::setPrototype(JSProtoKey, JSObject*) [libxu` 7; `[unknown]` 6; `__lll_lock_wake [libc.so.6]` 5
  - WebRender/compositor threads: Renderer 89 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 46, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 17, `hypotf@@GLIBC_2.35 [libm.so.6]` 8); SwComposite 8 ms (top self: `syscall [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #1 20 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 8, `__memset_avx2_unaligned_erms [libc.so.6]` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `rename [libc.so.6]` 0)
  - busiest DOM Worker 21 ms: buckets subprocess_pipe_io 21, worker_messaging 21, ipc 21, js_ctypes 18, poll_wait 15; top self: `poll [libc.so.6]` 15; `js::PCToLineNumber(unsigned int, JS::LimitedColumn` 3; `write [libc.so.6]` 3
- **tab:4373** CPU ms by thread group: main 51, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (23.1% of span): Other 40, Profiler 4, JavaScript 3, DOM 2, Idle 1, GC / CC 0
  - JS leaf 1 / native under JS 4 / native 47; buckets: ipc 38, array_buffer_copy 18, gc_cc 14, subprocess_pipe_io 6, poll_wait 2
  - top self: `[libfontconfig.so.1]` 8; `__lll_lock_wake [libc.so.6]` 4; `[]` 3; `mozilla::ipc::PBackgroundStarterChild::PBackgroundStarterChi` 2; `poll [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 19, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 19 ms (6.1% of span): Other 14, DOM 3, JavaScript 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 16; buckets: ipc 19, gc_cc 12, subprocess_pipe_io 6, array_buffer_copy 4, poll_wait 1
  - top self: `[]` 4; `js::frontend::PerHandlerParser<js::frontend::FullParseHandle` 1; `poll [libc.so.6]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `js::frontend::TDZCheckCache::noteTDZCheck(js::frontend::Byte` 1; `js::frontend::NameOpEmitter::NameOpEmitter(js::frontend::Byt` 1
  - GC/CC markers: GCMinor 1× 4 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4231** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.9% of span): Idle 3, Layout 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `mozilla::SVGObserverUtils::GetAndObserveMasks(nsIFrame*, nsT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 122, DOM Worker 94, other 19, BgPool 1, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 122 ms (5.7% of span): Idle 86, GC / CC 19, JavaScript 6, DOM 5, Other 5, Profiler 1
  - JS leaf 1 / native under JS 10 / native 111; buckets: ipc 122, poll_wait 89, gc_cc 23, harness_diagnostics 7, array_buffer_copy 4, subprocess_pipe_io 1, json_metadata 1, worker_messaging 0
  - top self: `poll [libc.so.6]` 86; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3
  - GC/CC markers: GCSlice 2× 21 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 94 ms: buckets subprocess_pipe_io 94, js_ctypes 94, worker_messaging 94, ipc 94, poll_wait 94; top self: `poll [libc.so.6]` 94
- **tab:3647** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3629** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3608** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 386, DOM Worker 285, Renderer 169, BgPool 135, SwComposite 127, WRRenderBackend 58, Compositor 42, other 32, ImageBridge 18, WRSceneBuilder 9, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 386 ms (12.1% of span): Idle 257, JavaScript 74, Other 29, DOM 21, Profiler 4
  - JS leaf 6 / native under JS 84 / native 296; buckets: ipc 385, poll_wait 272, gc_cc 79, worker_messaging 43, engine_stream_read 29, json_metadata 23, harness_diagnostics 18, native_receiver 16
  - top self: `poll [libc.so.6]` 259; `[unknown]` 14; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 5
  - WebRender/compositor threads: Renderer 169 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 104, `__memmove_avx_unaligned_erms [libc.so.6]` 44, `syscall [libc.so.6]` 12); SwComposite 127 ms (top self: `syscall [libc.so.6]` 102, `__memmove_avx_unaligned_erms [libc.so.6]` 22, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 135 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 101, `__memmove_avx_unaligned_erms [libc.so.6]` 27, `[linux-vdso.so.1]` 3); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0)
  - busiest DOM Worker 285 ms: buckets subprocess_pipe_io 285, worker_messaging 285, ipc 285, js_ctypes 267, poll_wait 264, gc_cc 10; top self: `poll [libc.so.6]` 264; `[unknown]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `js::Nursery::wantEagerCollection() const [libxul.s` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1
- **tab:3647** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `js::jit::CacheIRCompiler::emitIsObjectResult(js::jit::ValOpe` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4373** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsTimerImpl::CancelImpl(bool) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 255, main 206, Renderer 157, BgPool 136, SwComposite 118, WRRenderBackend 51, Compositor 37, ImageBridge 15, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 206 ms (6.7% of span): Idle 119, JavaScript 55, Other 18, DOM 13, Profiler 1, GC / CC 0
  - JS leaf 4 / native under JS 61 / native 141; buckets: ipc 206, poll_wait 128, gc_cc 63, worker_messaging 40, engine_stream_read 31, json_metadata 23, subprocess_pipe_io 12, array_buffer_copy 10
  - top self: `poll [libc.so.6]` 122; `[unknown]` 9; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `js::Nursery::reallocateBuffer(JS::Zone*, js::gc::Cell*, void` 2; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 157 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 49, `syscall [libc.so.6]` 10); SwComposite 118 ms (top self: `syscall [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `webrender::picture::PictureInstance::take_context ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 135 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 33, `[linux-vdso.so.1]` 2); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wait [libc.so.6]` 0, `mozilla::detail::EventQueueInternal<16ul>::PutEven` 0); BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 255 ms: buckets subprocess_pipe_io 255, worker_messaging 255, ipc 255, js_ctypes 242, poll_wait 239, memcpy_memset 2; top self: `poll [libc.so.6]` 239; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `[unknown]` 1; `write [libc.so.6]` 1; `mozilla::ProfileChunkedBuffer::~ProfileChunkedBuff` 1
- **tab:3647** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3629** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 506, DOM Worker 264, BgPool 146, Renderer 101, SwComposite 70, WRRenderBackend 38, Compositor 26, other 22, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 506 ms (23.8% of span): Idle 273, JavaScript 82, Other 76, Graphics 22, DOM 21, Layout 15
  - JS leaf 6 / native under JS 103 / native 398; buckets: ipc 506, poll_wait 365, gc_cc 88, paint_layout 64, worker_messaging 61, engine_stream_read 28, array_buffer_copy 26, subprocess_pipe_io 26
  - top self: `poll [libc.so.6]` 280; `[unknown]` 18; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 7; `[axiosozo-dev]` 5; `JS_IsNativeFunction(JSObject*, bool (*)(JSContext*, unsigned` 4
  - GC/CC markers: GCMinor 1× 5 ms
  - WebRender/compositor threads: Renderer 101 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 67, `__memmove_avx_unaligned_erms [libc.so.6]` 15, `syscall [libc.so.6]` 6); SwComposite 70 ms (top self: `syscall [libc.so.6]` 68, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 5, `webrender::render_backend::RenderBackend::save_cap` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 146 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 44, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[linux-vdso.so.1]` 0, `non-virtual thunk to mozilla::layers::EGLImageText` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 265 ms: buckets subprocess_pipe_io 265, worker_messaging 265, ipc 265, js_ctypes 240, poll_wait 229, gc_cc 5; top self: `poll [libc.so.6]` 229; `[axiosozo-dev]` 3; `[unknown]` 3; `__strlen_avx2 [libc.so.6]` 3; `nsThread::DrainDirectTasks() [libxul.so]` 2
- **tab:3608** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4373** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 394, DOM Worker 222, Renderer 120, SwComposite 50, other 33, WRRenderBackend 18, Compositor 16, WRWorker 12, WRSceneBuilder 9, BgPool 6, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 394 ms (10.7% of span): Idle 171, JavaScript 72, Layout 44, Other 36, Graphics 30, DOM 26
  - JS leaf 12 / native under JS 131 / native 251; buckets: ipc 392, poll_wait 206, gc_cc 90, paint_layout 84, worker_messaging 63, engine_stream_read 36, subprocess_pipe_io 21, array_buffer_copy 19
  - top self: `poll [libc.so.6]` 171; `[unknown]` 16; `[axiosozo-dev]` 7; `write [libc.so.6]` 5; `bool mozilla::FrameProperties::Remove<nsTextFrame>(mozilla::` 5; `recvmsg [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 120 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 51, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `hypotf@@GLIBC_2.35 [libm.so.6]` 15); SwComposite 50 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 28, `syscall [libc.so.6]` 22, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 13, `webrender::frame_builder::FrameBuilder::build [lib` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 222 ms: buckets subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 203, poll_wait 200, gc_cc 6; top self: `poll [libc.so.6]` 199; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2
- **tab:3555** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `RefPtr<mozilla::dom::JSExecutionManager>::~RefPtr() [libxul.` 0; `apply (self-hosted:2805:23)[3]` 0; `js::IsDeadProxyObject(JSObject const*) [libxul.so]` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3608** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::MainThreadIdlePeriod::GetIdlePeriodHint(mozilla::Ti` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4236** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 40, Renderer 38, BgPool 13, DOM Worker 12, Compositor 4, SwComposite 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 1, Socket 0, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 40 ms (20.0% of span): JavaScript 14, Layout 12, Idle 10, DOM 2, Graphics 2, Other 1
  - JS leaf 1 / native under JS 27 / native 12; buckets: ipc 40, paint_layout 15, gc_cc 12, harness_diagnostics 11, poll_wait 10, array_buffer_copy 8, worker_messaging 4, json_metadata 3
  - top self: `poll [libc.so.6]` 9; `mozilla::SVGObserverUtils::InvalidateDirectRenderingObserver` 3; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 2; `apply (self-hosted:2805:23)[8]` 1; `__lll_lock_wake [libc.so.6]` 1; `js::CloneFunctionReuseScript(JSContext*, JS::Handle<JSFuncti` 1
  - WebRender/compositor threads: Renderer 38 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7, `ps_quad_box_shadow_SUPERELLIPSE_frag::run(glsl::Fr` 4); SwComposite 3 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `webrender::picture::PictureInstance::take_context ` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 12 ms (top self: `unlink [libc.so.6]` 5, `rmdir [libc.so.6]` 3, `fstatat64 [libc.so.6]` 2); BackgroundThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, poll_wait 9, js_ctypes 8; top self: `poll [libc.so.6]` 8; `js::jit::JSJitFrameIter::checkInvalidation(js::jit` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:4231** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (2.1% of span): Idle 3, Profiler 1, Layout 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `nsContentUtils::AppendNativeAnonymousChildren(nsIContent con` 0; `getcontext [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3555** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **utility:3702** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

## gecko-debian (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.2 | **8.5** (Renderer 2.0, main 1.5, DOM Worker 1.5, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 3.0, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **19.3** (Renderer 11.2, main 2.0, WRRende~ckend# 1.7, glean.dispatche 1.0, WRScene~ilder# 1.0) | Isolated Web Co 2.6, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **13.6** (Renderer 7.0, WRRende~ckend# 1.3, main 1.0, TaskCon~ller # 1.0, WRScene~ilder# 1.0) | Isolated Web Co 3.7, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **29.7** (Renderer 19.2, main 3.0, WRRende~ckend# 2.0, Compositor 1.5, SwComposite 1.5) | Isolated Web Co 3.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **6.5** (main 3.8, Renderer 0.8, TaskCon~ller # 0.5, WRRende~ckend# 0.5, Compositor 0.3) | Isolated Web Co 1.3, WebExtensions 0.3 | 10.0 | — |
| trace | idle | 59.0 | 17.1 | **4.0** (main 2.0, TaskCon~ller # 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **12.9** (Renderer 6.6, WRRende~ckend# 1.3, WRScene~ilder# 1.0, Compositor 1.0, main 0.7) | Isolated Web Co 2.9 | — | — |
| trace | raf-nosampler | — | — | **14.0** (Renderer 6.7, WRRende~ckend# 1.7, WRScene~ilder# 1.3, main 1.0, glean.dispatche 1.0) | Isolated Web Co 3.0, Web Content 0.7 | — | — |
| trace | scroll | 59.0 | 17.1 | **36.2** (Renderer 21.7, main 4.5, WRRende~ckend# 2.5, SwComposite 2.5, glean.dispatche 1.5) | Isolated Web Co 4.5 | — | — |
| trace | key | — | — | **54.2** (main 15.0, DOM Worker 15.0, Indexed~ IO # 10.7, IPDL Background 5.4, TaskCon~ller # 2.7) | Isolated Web Co 1.1, WebExtensions 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.1 | **5.0** (SamplerThread 2.5, DOM Worker 1.5, TaskCon~ller # 0.5, Softwar~cThread 0.5) | Web Content 3.0, Isolated Web Co 3.0, WebExtensions 1.0, Socket Process 0.5 | — | — |
| profile | raf | 59.0 | 17.1 | **24.3** (Renderer 7.9, SamplerThread 4.0, main 2.6, WRRende~ckend# 2.0, Compositor 1.6) | Isolated Web Co 7.5, Web Content 4.9, Privileged Cont 1.3, WebExtensions 1.0 | — | — |
| profile | raf-nosampler | — | — | **20.6** (Renderer 8.0, SamplerThread 3.7, WRRende~ckend# 1.7, main 1.3, glean.dispatche 1.3) | Isolated Web Co 6.7, Web Content 5.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **42.1** (Renderer 21.6, main 5.5, SamplerThread 5.0, WRRende~ckend# 2.5, Compositor 2.0) | Isolated Web Co 7.0, Web Content 5.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **9.3** (main 3.8, SamplerThread 2.7, Renderer 0.8, WRRende~ckend# 0.5, glean.dispatche 0.3) | Web Content 4.3, Isolated Web Co 2.7, WebExtensions 1.3, Privileged Cont 1.1 | 9.5 | — |

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

- **parent** CPU ms by thread group: DOM Worker 33, main 8, IPC I/O 1, Renderer 1, Socket 1, SwComposite 0, WRSceneBuilder 0, Compositor 0, WRRenderBackend 0, other 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 8 ms (0.4% of span): Idle 3, JavaScript 3, Other 1, Graphics 1
  - JS leaf 0 / native under JS 3 / native 5; buckets: ipc 8, poll_wait 4, harness_diagnostics 2, gc_cc 1, array_buffer_copy 1, paint_layout 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[unknown]` 1; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `isSafeInteger (self-hosted:2519:30)[8]` 0
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__lll_lock_wait [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets worker_messaging 31, ipc 31, gc_cc 30, memcpy_memset 15, poll_wait 0; top self: `madvise [libc.so.6]` 9; `unsigned long js::gc::Arena::finalize<JSString, (j` 4; `munmap [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__memset_avx512_unaligned [libc.so.6]` 2
- **tab:8424** CPU ms by thread group: main 16, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 16 ms (0.8% of span): Idle 12, JavaScript 3, Other 1, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 4 / native 13; buckets: ipc 16, poll_wait 12, harness_diagnostics 3, gc_cc 3, array_buffer_copy 3, subprocess_pipe_io 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::frontend::TokenStreamSpecific<char16_t, js::frontend::Pa` 1; `mozilla::HashSet<void*, mozilla::PointerHasher<void*>, js::S` 1; `js::OpaqueCrossCompartmentWrapper::hasOwn(JSContext*, JS::Ha` 1; `js::Proxy::call(JSContext*, JS::Handle<JSObject*>, JS::CallA` 0; `auto mozilla::ProfileChunkedBuffer::Read<mozilla::ProfileBuf` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 231, main 69, WRRenderBackend 50, WRSceneBuilder 40, Compositor 36, SwComposite 21, IPC I/O 8, other 2, DOM Worker 2, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 69 ms (2.3% of span): GC / CC 37, Idle 20, JavaScript 4, Other 4, Profiler 3, Graphics 1
  - JS leaf 0 / native under JS 2 / native 67; buckets: ipc 69, gc_cc 40, poll_wait 23, paint_layout 3, array_buffer_copy 2, memcpy_memset 2, harness_diagnostics 1, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBuf` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 2
  - GC/CC markers: GCSlice 5× 27 ms, CCSlice 1× 9 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 231 ms (top self: `__syscall_cancel_arch [libc.so.6]` 89, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 51, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 28); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1); WRSceneBuilder#0 36 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 0
- **tab:8424** CPU ms by thread group: main 135, IPC I/O 12, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 135 ms (4.4% of span): Idle 91, Layout 13, Graphics 11, GC / CC 6, Profiler 5, Other 5
  - JS leaf 0 / native under JS 5 / native 131; buckets: ipc 131, poll_wait 91, paint_layout 30, gc_cc 8, harness_diagnostics 2, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 93; `[]` 2; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) ` 1; `gfxFont::Draw(gfxTextRun const*, unsigned int, unsigned int,` 1; `[linux-vdso.so.1]` 1; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 9 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8513** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 225, WRRenderBackend 46, main 43, WRSceneBuilder 37, Compositor 34, SwComposite 12, IPC I/O 8, DOM Worker 4, other 1, Socket 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 43 ms (1.4% of span): GC / CC 27, Idle 10, JavaScript 3, Other 2, Profiler 1, Graphics 1
  - JS leaf 0 / native under JS 3 / native 40; buckets: ipc 43, gc_cc 31, poll_wait 12, harness_diagnostics 3, array_buffer_copy 1, image_container 1, paint_layout 1, subprocess_pipe_io 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 3; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::BaseScript::enclosingScope() const [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 225 ms (top self: `__syscall_cancel_arch [libc.so.6]` 88, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 41, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 23); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); WRSceneBuilder#0 33 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, poll_wait 1, memcpy_memset 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `madvise [libc.so.6]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1
- **tab:8424** CPU ms by thread group: main 117, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 117 ms (3.9% of span): Idle 85, Graphics 11, Layout 8, Other 6, Profiler 4, GC / CC 3
  - JS leaf 0 / native under JS 2 / native 115; buckets: ipc 114, poll_wait 85, paint_layout 23, gc_cc 3, subprocess_pipe_io 1, canvas_2d 1, mozafterpaint_events 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 86; `[]` 2; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBa` 1; `unsigned long js::gc::Arena::finalize<js::BaseScript, (js::g` 1; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 1; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8320** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 410, main 97, WRRenderBackend 47, SwComposite 33, Compositor 24, WRSceneBuilder 17, IPC I/O 6, other 1, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 97 ms (4.9% of span): Idle 51, GC / CC 26, Other 8, JavaScript 4, Graphics 4, Profiler 2
  - JS leaf 0 / native under JS 5 / native 92; buckets: ipc 97, poll_wait 61, gc_cc 29, paint_layout 6, harness_diagnostics 5, array_buffer_copy 2, json_metadata 1, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 57; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[axiosozo-dev]` 2; `zen::nsZenWindowDragUtils::AddRef() [libxul.so]` 2; `nsContentUtils::WrapNative(JSContext*, nsISupports*, nsWrapp` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 8× 22 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 410 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 107, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 78, `__syscall_cancel_arch [libc.so.6]` 58); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 36, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); SwComposite 33 ms (top self: `syscall [libc.so.6]` 30, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8424** CPU ms by thread group: main 65, IPC I/O 10, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 65 ms (3.3% of span): Idle 50, Other 6, Graphics 4, Layout 2, JavaScript 2, Profiler 1
  - JS leaf 0 / native under JS 2 / native 63; buckets: ipc 65, poll_wait 52, paint_layout 8, harness_diagnostics 2, array_buffer_copy 2, gc_cc 1, memcpy_memset 1, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 52; `nsWifiMonitor::AddRef() [libxul.so]` 1; `js::gc::PretenuringNursery::canCreateAllocSite() [libxul.so]` 1; `poll [libc.so.6]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 126, Renderer 30, WRRenderBackend 15, Compositor 14, WRSceneBuilder 11, IPC I/O 6, SwComposite 5, other 1, DOM Worker 1, Socket 1, BgPool 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 126 ms (3.4% of span): Idle 40, Layout 24, Graphics 19, Other 17, JavaScript 17, DOM 5
  - JS leaf 3 / native under JS 19 / native 104; buckets: ipc 123, poll_wait 50, paint_layout 44, gc_cc 8, subprocess_pipe_io 4, harness_diagnostics 3, array_buffer_copy 3, canvas_2d 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 42; `[axiosozo-dev]` 5; `[unknown]` 4; `nsIFrame::DisplayBorderBackgroundOutline(mozilla::nsDisplayL` 2; `mozilla::nsDisplayContainer::~nsDisplayContainer() [libxul.s` 2; `[linux-vdso.so.1]` 2
  - WebRender/compositor threads: Renderer 30 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `syscall [libc.so.6]` 2); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 13, `webrender::frame_builder::FrameBuilder::build [lib` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `__lll_lock_wake [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `<core::str::lossy::Utf8Chunks as core::iter::trait` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8424** CPU ms by thread group: main 56, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 56 ms (1.5% of span): Idle 24, Layout 9, GC / CC 7, JavaScript 6, Other 4, Graphics 2
  - JS leaf 0 / native under JS 7 / native 48; buckets: ipc 55, poll_wait 25, paint_layout 13, gc_cc 9, harness_diagnostics 2, array_buffer_copy 2, canvas_2d 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 25; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayL` 1; `mozilla::dom::FragmentOrElement::cycleCollection::TraverseNa` 1; `nsWindowRoot::AddRef() [libxul.so]` 1; `nsINode::DisconnectChild(nsIContent*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8267** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, Other 0, DOM 0, GC / CC 0, Profiler 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mo` 0; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 0; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<js::Un` 0; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8342** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **61.8** (main 22.5, Renderer 22.5, DOM Worker 11.2, Compositor 5.6) | WPEWebProcess 67.5, WPENetworkProce 11.2, AxioWebKitHost 5.6 | — | 158.3 |
| plain | idle | — | — | **6.4** (main 3.9, DOM Worker 1.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.0 | — | — |
| plain | raf | 57.9 | 20.8 | **19.7** (main 7.6, Renderer 2.3, DOM Worker 2.0, SwComposite 1.6, WRRende~ckend# 1.3) | WPEWebProcess 45.4, AxioWebKitHost 6.9, Privileged Cont 0.3, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.9** (main 4.3, Renderer 3.0, DOM Worker 2.3, Backgro~Pool # 1.3, SwComposite 1.3) | WPEWebProcess 45.3, AxioWebKitHost 7.7, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 57.3 | 29.5 | **33.4** (main 15.9, DOM Worker 5.5, Backgro~Pool # 3.5, TaskCon~ller # 2.0, Renderer 2.0) | WPEWebProcess 49.3, AxioWebKitHost 9.5 | — | — |
| plain | key | — | — | **14.0** (main 8.5, Renderer 1.1, Timer 0.8, TaskCon~ller # 0.8, SwComposite 0.8) | WPEWebProcess 6.4, AxioWebKitHost 1.1, WebExtensions 0.3, Web Content 0.3 | 18.9 | — |
| plain | switch-to-gecko | — | — | **44.2** (main 13.3, TaskCon~ller # 8.9, Socket Thread 4.4, BgIOThr~Pool # 4.4, Renderer 4.4) | Isolated Web Co 4.4 | — | 211.3 |
| trace | switch-to-engine | — | — | **35.8** (main 15.9, Renderer 15.9, glean.dispatche 4.0) | WPEWebProcess 51.8, WPENetworkProce 11.9, AxioWebKitHost 4.0 | — | 232.5 |
| trace | idle | — | — | **3.0** (main 2.5, IPC I/O Parent 0.5) | Web Content 3.0, forkserver 0.5 | — | — |
| trace | raf | 57.1 | 24.2 | **64.0** (DOM Worker 19.7, main 16.8, Indexed~ IO # 11.8, IPDL Background 4.9, Renderer 2.3) | WPEWebProcess 45.3, AxioWebKitHost 6.5 | — | — |
| trace | raf-nosampler | — | — | **29.5** (main 10.0, DOM Worker 4.7, Renderer 2.3, Indexed~ IO # 2.3, TaskCon~ller # 1.7) | WPEWebProcess 45.8, AxioWebKitHost 7.3 | — | — |
| trace | scroll | 57.4 | 32.9 | **39.0** (main 17.5, DOM Worker 7.5, Backgro~Pool # 4.0, TaskCon~ller # 2.5, Renderer 2.5) | WPEWebProcess 50.4, AxioWebKitHost 9.0, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **13.9** (main 8.0, DOM Worker 1.4, Renderer 1.1, Timer 0.8, SwComposite 0.8) | WPEWebProcess 6.1, AxioWebKitHost 0.8, WebExtensions 0.3 | 19.6 | — |
| trace | switch-to-gecko | — | — | **35.0** (main 13.1, TaskCon~ller # 8.7, IPDL Background 4.4, Renderer 4.4, Compositor 4.4) | Isolated Web Co 4.4 | — | 212.6 |
| profile | switch-to-engine | — | — | **42.1** (main 15.3, DOM Worker 11.5, SamplerThread 7.7, Renderer 3.8, Compositor 3.8) | Web Content 95.9, WPEWebProcess 61.4, WPENetworkProce 11.5, AxioWebKitHost 7.7 | — | 241.2 |
| profile | idle | — | — | **27.0** (main 10.8, SamplerThread 6.4, DOM Worker 5.9, TaskCon~ller # 2.9, Timer 1.0) | Web Content 5.4, WebExtensions 1.0, Privileged Cont 1.0, Isolated Web Co 1.0 | — | — |
| profile | raf | 58.0 | 20.9 | **39.4** (main 11.5, DOM Worker 8.9, SamplerThread 7.9, Renderer 2.6, SwComposite 1.6) | WPEWebProcess 44.3, AxioWebKitHost 6.2, Web Content 4.9, WebExtensions 1.0 | — | — |
| profile | raf-nosampler | — | — | **32.0** (DOM Worker 9.3, SamplerThread 6.7, main 5.0, Renderer 2.3, Backgro~Pool # 2.0) | WPEWebProcess 45.2, AxioWebKitHost 5.9, Web Content 5.7, WebExtensions 1.3 | — | — |
| profile | scroll | 58.0 | 29.5 | **52.3** (main 19.9, DOM Worker 12.4, SamplerThread 8.5, Backgro~Pool # 3.0, Renderer 2.5) | WPEWebProcess 50.8, AxioWebKitHost 8.0, Web Content 5.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **33.3** (main 12.9, DOM Worker 7.7, SamplerThread 6.9, Renderer 1.7, Timer 1.1) | Web Content 6.1, WPEWebProcess 5.6, WebExtensions 1.4, Socket Process 1.1 | 18.1 | — |
| profile | switch-to-gecko | — | — | **33.8** (main 12.7, DOM Worker 8.5, Renderer 4.2, WRScene~ilder# 4.2, SamplerThread 4.2) |  | — | 215.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 7.6 | 0.0 | 0 | 0.0 | — | — | 69.0 | 0.0 | — | 1.11 | 0.57 | — | — | — | — | — | 0.004 |
| trace | raf | 56.9 | 0.0 | 0 | 0.0 | — | — | 16.7 | 0.0 | — | 0.14 | 0.09 | — | — | — | — | — | 0.005 |
| trace | raf-nosampler | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.7 | 0.0 | — | 0.16 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 57.2 | 0.0 | 0 | 0.0 | — | — | 11.2 | 0.0 | — | 0.33 | 0.09 | — | — | — | — | — | 0.005 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.6 | 0.0 | — | 0.08 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.4 | 0.0 | 0 | 0.0 | — | — | 78.9 | 0.0 | — | 1.18 | 0.58 | — | — | — | — | — | 0.004 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.15 | 0.10 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.16 | 0.10 | — | — | — | — | — | 0.007 |
| profile | scroll | 57.0 | 0.0 | 0 | 0.0 | — | — | 12.6 | 0.0 | — | 0.33 | 0.11 | — | — | — | — | — | 0.007 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.14 | 0.12 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.836 | 1.399 | 0.0089 | 0.0148 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 177 | 177 | 0.063 | 0.118 | 0.0036 | 0.0068 |
| plain | raf-nosampler | memfd | native | 174 | 174 | 0.074 | 0.146 | 0.0043 | 0.0084 |
| plain | scroll | memfd | native | 114 | 114 | 0.243 | 0.317 | 0.0138 | 0.0179 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.104 | 0.0000 | 0.0006 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.934 | 1.415 | 0.0071 | 0.0108 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 175 | 175 | 0.059 | 0.117 | 0.0034 | 0.0067 |
| trace | raf-nosampler | memfd | native | 174 | 174 | 0.074 | 0.149 | 0.0042 | 0.0086 |
| trace | scroll | memfd | native | 115 | 115 | 0.242 | 0.339 | 0.0139 | 0.0194 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.100 | 0.0000 | 0.0005 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.909 | 1.466 | 0.0067 | 0.0109 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 177 | 177 | 0.063 | 0.133 | 0.0036 | 0.0077 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.076 | 0.155 | 0.0044 | 0.0090 |
| profile | scroll | memfd | native | 115 | 115 | 0.208 | 0.338 | 0.0118 | 0.0193 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.104 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 14.5 | 0.0 | — | 0.08 | 0.26 | — | — | 16.1 | 15.4 | 32.0 |
| profile | 0.6 | 15.4 | 0.0 | — | 0.14 | 0.40 | — | — | 17.7 | 16.6 | 33.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 16.5; first stdout read resolved 23.8; first frame applied (native receiver) 241.7; write frame_ack 242.7; write visibility 246.3; write focus 246.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 14.4; first stdout read resolved 19.9

Switch timeline (profile, switch-to-engine, ms after the window start): write create 13.7; first stdout read resolved 15.5; first frame applied (native receiver) 243.7; write frame_ack 244.7; write visibility 251.3; write focus 251.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 15.8; first stdout read resolved 23.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 33, DOM Worker 20, Renderer 11, BgPool 5, Compositor 2, WRRenderBackend 2, IPC I/O 2, SwComposite 2, WRSceneBuilder 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 33 ms (12.1% of span): JavaScript 16, Idle 6, Other 3, Layout 3, Profiler 2, DOM 2
  - JS leaf 1 / native under JS 19 / native 12; buckets: ipc 33, gc_cc 14, array_buffer_copy 9, harness_diagnostics 9, paint_layout 7, poll_wait 6, engine_stream_read 3, worker_messaging 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 3; `mozilla::DelayForChaosMode(mozilla::ChaosFeature, unsigned i` 3; `__lll_lock_wait [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[libstdc++.so.6]` 1
  - WebRender/compositor threads: Renderer 11 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 3, `ClearTexSubImage [libxul.so]` 3, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `webrender::batch::AlphaBatchList::set_params_and_g` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `ARGBSetRow_X86 [libxul.so]` 1, `__memset_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 18 ms: buckets subprocess_pipe_io 18, worker_messaging 18, ipc 18, js_ctypes 15, poll_wait 15; top self: `__syscall_cancel_arch [libc.so.6]` 15; `__lll_lock_wait [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `mozilla::Queue<mozilla::TimeStamp, 16ul>::Push(moz` 0
- **tab:7843** CPU ms by thread group: main 38, IPC I/O 0, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 38 ms (17.4% of span): Other 28, JavaScript 5, DOM 3, Idle 2, Profiler 1
  - JS leaf 1 / native under JS 4 / native 34; buckets: ipc 29, array_buffer_copy 11, gc_cc 11, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 2, image_container 1
  - top self: `__strcmp_evex [libc.so.6]` 3; `__strlen_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[]` 2; `getdents64 [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7849** CPU ms by thread group: main 34, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 34 ms (29.3% of span): Other 26, JavaScript 4, DOM 2, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 31; buckets: ipc 26, gc_cc 10, array_buffer_copy 8, subprocess_pipe_io 4, poll_wait 2, memcpy_memset 1
  - top self: `[]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `js::frontend::SourceCoords::lineToken(unsigned int) const [l` 2; `bool js::GetDecimalInteger<mozilla::Utf8Unit>(mozilla::Utf8U` 1; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, J` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `PLDHashTable::Search(void const*) const [libxul.so]` 0; `mozilla::EventDispatcher::CreateEvent(mozilla::dom::EventTar` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 206, DOM Worker 70, other 14, Socket 1, IPC I/O 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, BgPool 0, SwComposite 0
  - main thread 206 ms (10.0% of span): Idle 116, GC / CC 61, JavaScript 16, Other 7, DOM 5, Profiler 2
  - JS leaf 2 / native under JS 18 / native 185; buckets: ipc 204, poll_wait 120, gc_cc 69, harness_diagnostics 20, array_buffer_copy 5, engine_stream_read 3, subprocess_pipe_io 1, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 118; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `[unknown]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3
  - GC/CC markers: GCMajor 2× 834 ms, GCSlice 14× 52 ms, CCSlice 3× 12 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 70 ms: buckets subprocess_pipe_io 70, worker_messaging 70, ipc 70, js_ctypes 70, poll_wait 70; top self: `__syscall_cancel_arch [libc.so.6]` 70; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 0
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsTimer::Release() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7244** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memcmp_evex_movbe [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 325, DOM Worker 199, Renderer 73, SwComposite 42, BgPool 39, WRRenderBackend 33, Compositor 29, other 23, ImageBridge 12, WRSceneBuilder 6, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 325 ms (10.6% of span): Idle 238, JavaScript 43, Other 26, DOM 14, Profiler 3, GC / CC 1
  - JS leaf 6 / native under JS 48 / native 270; buckets: ipc 324, poll_wait 252, gc_cc 40, engine_stream_read 25, worker_messaging 24, harness_diagnostics 22, subprocess_pipe_io 12, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 248; `[unknown]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 1; `[axiosozo-dev]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 73 ms (top self: `__syscall_cancel_arch [libc.so.6]` 62, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 3); SwComposite 42 ms (top self: `syscall [libc.so.6]` 40, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 30, `webrender::tile_cache::TileCacheInstance::update_p` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 39 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `MessageLoop::DoDelayedWork(base::TimeTicks*) [libx` 0, `non-virtual thunk to mozilla::layers::ImageBridgeC` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 199 ms: buckets subprocess_pipe_io 199, worker_messaging 199, ipc 199, js_ctypes 182, poll_wait 179, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 181; `[unknown]` 2; `OriginalPromiseThenBuiltin(JSContext*, JS::Handle<` 1; `[axiosozo-dev]` 1; `__lll_lock_wake [libc.so.6]` 1
- **tab:7698** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 4, gc_cc 3, poll_wait 2, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [li` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7704** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsIT` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7319** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 194, main 145, Renderer 69, BgPool 46, SwComposite 39, WRRenderBackend 31, Compositor 29, ImageBridge 12, WRSceneBuilder 5, other 1, IPC I/O 0, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 145 ms (4.8% of span): Idle 86, JavaScript 31, Other 18, DOM 4, GC / CC 3, Profiler 2
  - JS leaf 1 / native under JS 32 / native 112; buckets: ipc 144, poll_wait 94, gc_cc 32, worker_messaging 24, engine_stream_read 22, subprocess_pipe_io 10, array_buffer_copy 5, native_receiver 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 94; `[unknown]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 2; `MessageLoop::ProcessNextDelayedNonNestableTask() [libxul.so]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 69 ms (top self: `__syscall_cancel_arch [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 2); SwComposite 39 ms (top self: `syscall [libc.so.6]` 38, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 0, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 45 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #4 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 194 ms: buckets subprocess_pipe_io 194, worker_messaging 194, ipc 194, js_ctypes 179, poll_wait 177, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 177; `[unknown]` 2; `PromiseConstructor(JSContext*, unsigned int, JS::V` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1
- **tab:7698** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 0; `js::PropMap::traceChildren(JSTracer*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7704** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7297** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0; `TimerThreadWrapper::RemoveTimer(nsTimerImpl*, mozilla::detai` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 383, DOM Worker 196, BgPool 62, Renderer 41, WRRenderBackend 21, SwComposite 18, Compositor 18, other 15, ImageBridge 7, WRSceneBuilder 3, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 383 ms (19.0% of span): Idle 229, JavaScript 78, Other 37, DOM 17, Profiler 12, Graphics 5
  - JS leaf 11 / native under JS 82 / native 290; buckets: ipc 382, poll_wait 263, gc_cc 74, engine_stream_read 45, worker_messaging 42, harness_diagnostics 29, paint_layout 21, subprocess_pipe_io 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 19; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 41 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 21 ms (top self: `syscall [libc.so.6]` 16, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 18 ms (top self: `syscall [libc.so.6]` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 62 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `[axiosozo-dev]` 1); ImageBridgeChld 7 ms (top self: `__syscall_cancel_arch [libc.so.6]` 7, `MessageLoop::DoDelayedWork(base::TimeTicks*) [libx` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 196 ms: buckets subprocess_pipe_io 196, worker_messaging 195, ipc 195, js_ctypes 169, poll_wait 162, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 164; `getcontext [libc.so.6]` 4; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 1
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7297** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 430, DOM Worker 184, Renderer 50, SwComposite 26, other 25, WRRenderBackend 15, Compositor 14, WRSceneBuilder 9, WRWorker 8, BgPool 3, ImageBridge 2, IPC I/O 1, Socket 1, Canvas 0, ImageIO 0
  - main thread 430 ms (11.8% of span): Idle 217, JavaScript 73, Layout 35, Graphics 34, Other 31, DOM 26
  - JS leaf 18 / native under JS 110 / native 303; buckets: ipc 430, poll_wait 250, gc_cc 85, paint_layout 75, engine_stream_read 60, worker_messaging 55, harness_diagnostics 22, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 228; `[unknown]` 13; `[axiosozo-dev]` 9; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, ` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 3
  - GC/CC markers: CCSlice 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 50 ms (top self: `__syscall_cancel_arch [libc.so.6]` 27, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `ClearTexSubImage [libxul.so]` 4); SwComposite 26 ms (top self: `syscall [libc.so.6]` 18, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 176 ms: buckets subprocess_pipe_io 176, worker_messaging 176, ipc 176, js_ctypes 166, poll_wait 163, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 164; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Ha` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `ffi_call_plan_invoke [libxul.so]` 2; `getcontext [libc.so.6]` 1
- **tab:7244** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 7, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 7, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `JS::PropertySpecNameEqualsId(JSPropertySpec::Name, JS::Handl` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `[unknown]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `xpc::AutoScriptActivity::AutoScriptActivity(bool) [libxul.so` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7297** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7338** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 58, Renderer 16, DOM Worker 9, BgPool 4, WRRenderBackend 3, Compositor 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 58 ms (21.6% of span): JavaScript 21, Other 9, DOM 8, Layout 6, Graphics 6, Idle 4
  - JS leaf 1 / native under JS 34 / native 23; buckets: ipc 57, paint_layout 16, gc_cc 15, array_buffer_copy 11, harness_diagnostics 8, engine_stream_read 8, poll_wait 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 3; `JS::GetScriptedCallerGlobal(JSContext*) [libxul.so]` 3; `__lll_lock_wait [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 2
  - WebRender/compositor threads: Renderer 16 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::picture_composite_mode::prepare_composi` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `webrender::prim_store::text_run::TextRunKey::new [` 0)
  - background pools (native receiver queue): BgIOThreadPool #4 4 ms (top self: `unlink [libc.so.6]` 2, `rmdir [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 9 ms: buckets subprocess_pipe_io 9, worker_messaging 9, ipc 9, poll_wait 9, js_ctypes 8; top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 0
- **tab:7698** CPU ms by thread group: main 22, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 22 ms (8.1% of span): JavaScript 8, Other 5, Idle 3, Layout 2, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 9 / native 12; buckets: ipc 19, gc_cc 8, subprocess_pipe_io 7, poll_wait 3, paint_layout 0
  - top self: `js::frontend::TaggedParserAtomIndex js::frontend::WellKnownP` 5; `__syscall_cancel_arch [libc.so.6]` 4; `[]` 2; `getcontext [libc.so.6]` 2; `mozilla::cyclecollector::HoldJSObjectsImpl(nsISupports*) [li` 1; `js::GlobalOrEvalDeclInstantiation(JSContext*, JS::Handle<JSO` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7244** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.1% of span): Idle 3, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[]` 0; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 0; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7843** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **51.8** (Renderer 23.6, main 18.8, Compositor 4.7, DOM Worker 4.7) | WPEWebProcess 56.5, WPENetworkProce 9.4, AxioWebKitHost 4.7 | — | 187.8 |
| plain | idle | — | — | **5.9** (main 3.9, DOM Worker 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 2.9 | — | — |
| plain | raf | 58.0 | 21.3 | **28.6** (main 8.2, Renderer 5.9, SwComposite 4.6, Backgro~Pool # 3.0, DOM Worker 2.3) | WPEWebProcess 131.5, AxioWebKitHost 16.4, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **25.7** (Renderer 6.3, main 4.7, Backgro~Pool # 4.0, SwComposite 4.0, DOM Worker 2.7) | WPEWebProcess 135.3, AxioWebKitHost 18.3 | — | — |
| plain | scroll | 53.5 | 36.8 | **48.8** (main 17.7, Backgro~Pool # 9.8, DOM Worker 6.9, Renderer 4.9, SwComposite 2.5) | WPEWebProcess 145.9, AxioWebKitHost 22.6 | — | — |
| plain | key | — | — | **16.4** (main 8.2, Renderer 2.5, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 15.7, AxioWebKitHost 2.8, WebExtensions 0.3 | 25.0 | — |
| plain | switch-to-gecko | — | — | **44.3** (main 22.2, TaskCon~ller # 8.9, BgIOThr~Pool # 4.4, Renderer 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 211.0 |
| trace | switch-to-engine | — | — | **92.6** (Renderer 68.2, main 9.7, Socket Thread 4.9, WRRende~ckend# 4.9, Compositor 4.9) | WPEWebProcess 77.9, WPENetworkProce 14.6, AxioWebKitHost 9.7 | — | 192.2 |
| trace | idle | — | — | **36.6** (DOM Worker 12.2, main 11.7, IndexedDB IO # 4.9, IPDL Background 2.4, TaskCon~ller # 2.4) | Web Content 2.9 | — | — |
| trace | raf | 57.9 | 23.7 | **32.9** (main 10.2, Renderer 6.6, SwComposite 4.3, Backgro~Pool # 3.3, DOM Worker 2.6) | WPEWebProcess 137.7, AxioWebKitHost 16.7, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **23.6** (Renderer 6.0, main 4.3, SwComposite 4.3, Backgro~Pool # 3.0, DOM Worker 2.7) | WPEWebProcess 134.7, AxioWebKitHost 17.9 | — | — |
| trace | scroll | 53.6 | 33.0 | **51.4** (main 19.7, Backgro~Pool # 9.9, DOM Worker 6.9, Renderer 5.4, SwComposite 3.5) | WPEWebProcess 146.0, AxioWebKitHost 23.2 | — | — |
| trace | key | — | — | **16.6** (main 8.2, Renderer 2.5, SwComposite 1.9, DOM Worker 1.1, Timer 0.5) | WPEWebProcess 15.8, AxioWebKitHost 2.5, WebExtensions 0.3 | 25.9 | — |
| trace | switch-to-gecko | — | — | **52.8** (main 17.6, Renderer 8.8, Socket Thread 4.4, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4) |  | — | 213.9 |
| profile | switch-to-engine | — | — | **49.4** (main 15.2, Renderer 7.6, DOM Worker 7.6, SamplerThread 7.6, Backgro~Pool # 3.8) | WPEWebProcess 75.9, Web Content 72.1, AxioWebKitHost 7.6, WPENetworkProce 7.6 | — | 240.5 |
| profile | idle | — | — | **29.0** (main 11.3, SamplerThread 6.4, DOM Worker 5.9, TaskCon~ller # 3.4, Timer 1.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 57.9 | 21.7 | **48.8** (main 12.1, DOM Worker 8.5, Renderer 6.9, SamplerThread 6.5, SwComposite 4.3) | WPEWebProcess 137.1, AxioWebKitHost 18.6, Web Content 5.6, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **44.2** (DOM Worker 9.0, main 7.6, Renderer 6.7, SamplerThread 6.3, Backgro~Pool # 4.3) | WPEWebProcess 146.6, AxioWebKitHost 20.3, Web Content 6.0, WebExtensions 1.3 | — | — |
| profile | scroll | 53.2 | 33.9 | **73.7** (main 24.4, DOM Worker 13.2, Backgro~Pool # 10.7, SamplerThread 6.8, Renderer 6.3) | WPEWebProcess 152.6, AxioWebKitHost 24.4, Web Content 3.9, WebExtensions 1.5 | — | — |
| profile | key | — | — | **35.3** (main 13.1, DOM Worker 7.4, SamplerThread 6.6, Renderer 2.5, SwComposite 1.9) | WPEWebProcess 15.9, Web Content 5.8, AxioWebKitHost 2.8, WebExtensions 1.7 | 27.2 | — |
| profile | switch-to-gecko | — | — | **54.8** (main 16.9, Renderer 12.7, DOM Worker 8.4, TaskCon~ller # 4.2, WRRende~ckend# 4.2) | Isolated Web Co 4.2 | — | 218.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 9.0 | 0.0 | 0 | 0.0 | — | — | 38.1 | 0.0 | — | 3.27 | 0.61 | — | — | — | — | — | 0.005 |
| trace | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.24 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 52.6 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 0.99 | 0.10 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.07 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.3 | 0.0 | 0 | 0.0 | — | — | 47.6 | 0.0 | — | 3.66 | 0.63 | — | — | — | — | — | 0.005 |
| profile | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.30 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.37 | 0.15 | — | — | — | — | — | 0.011 |
| profile | scroll | 52.4 | 0.0 | 0 | 0.0 | — | — | 13.1 | 0.0 | — | 1.20 | 0.14 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 13.3 | 0.0 | — | 0.15 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.612 | 4.371 | 0.0233 | 0.0390 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.165 | 0.341 | 0.0096 | 0.0198 |
| plain | raf-nosampler | memfd | native | 175 | 176 | 0.232 | 0.425 | 0.0134 | 0.0247 |
| plain | scroll | memfd | native | 107 | 107 | 0.811 | 0.985 | 0.0425 | 0.0516 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 0.302 | 0.0000 | 0.0016 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 1 | 2.825 | 4.807 | 0.0254 | 0.0216 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 177 | 177 | 0.172 | 0.348 | 0.0100 | 0.0202 |
| trace | raf-nosampler | memfd | native | 176 | 176 | 0.177 | 0.327 | 0.0103 | 0.0190 |
| trace | scroll | memfd | native | 107 | 107 | 0.871 | 1.042 | 0.0458 | 0.0548 |
| trace | key | memfd | native | 20 | 20 | 0.004 | 0.265 | 0.0000 | 0.0014 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.974 | 5.372 | 0.0217 | 0.0393 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.195 | 0.399 | 0.0113 | 0.0231 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.255 | 0.486 | 0.0148 | 0.0283 |
| profile | scroll | memfd | native | 107 | 107 | 1.013 | 1.249 | 0.0526 | 0.0648 |
| profile | key | memfd | native | 20 | 20 | 0.005 | 0.314 | 0.0000 | 0.0017 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 22.7 | 0.0 | — | 0.07 | 0.25 | — | — | 12.1 | 23.5 | 35.5 |
| profile | 0.6 | 22.8 | 0.0 | — | 0.15 | 0.42 | — | — | 12.0 | 24.3 | 34.9 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 22.0; first stdout read resolved 25.0; first frame applied (native receiver) 205.4; write frame_ack 206.4; write visibility 209.6; write focus 209.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 13.4; first stdout read resolved 17.8

Switch timeline (profile, switch-to-engine, ms after the window start): write create 15.1; first stdout read resolved 17.7; first frame applied (native receiver) 241.9; write frame_ack 243.0; write visibility 251.5; write focus 251.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 19.9; first stdout read resolved 25.8

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 35, Renderer 25, DOM Worker 16, BgPool 14, SwComposite 4, Compositor 2, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 2, Socket 0, WRWorker 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 35 ms (13.0% of span): JavaScript 15, Idle 7, DOM 5, Layout 4, Graphics 3, Other 1
  - JS leaf 1 / native under JS 22 / native 11; buckets: ipc 35, gc_cc 19, array_buffer_copy 9, harness_diagnostics 7, poll_wait 7, paint_layout 6, engine_stream_read 6, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `mozilla::dom::GetOrCreateDOMReflectorHelper<mozilla::dom::No` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `js::jit::CacheIRStubKey::match(js::jit::CacheIRStubKey const` 2; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 2; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 1
  - WebRender/compositor threads: Renderer 25 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `__syscall_cancel_arch [libc.so.6]` 6, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5); SwComposite 4 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 14 ms (top self: `ARGBSetRow_X86 [libxul.so]` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, js_ctypes 16, worker_messaging 16, ipc 16, poll_wait 16; top self: `__syscall_cancel_arch [libc.so.6]` 16
- **tab:9492** CPU ms by thread group: main 43, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (17.0% of span): Other 35, JavaScript 4, DOM 2, Profiler 1, Idle 0
  - JS leaf 0 / native under JS 4 / native 39; buckets: ipc 32, array_buffer_copy 14, gc_cc 13, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 2
  - top self: `[]` 6; `__read_nocancel [libc.so.6]` 3; `[libexpat.so.1]` 2; `mmap64 [libc.so.6]` 2; `__strcmp_evex [libc.so.6]` 1; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9497** CPU ms by thread group: main 40, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (26.0% of span): Other 31, JavaScript 4, DOM 3, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 37; buckets: ipc 29, array_buffer_copy 13, gc_cc 10, memcpy_memset 5, subprocess_pipe_io 5, poll_wait 2, image_container 1
  - top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `__strlen_evex [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `js::frontend::ParserAtomsTable::internLatin1(js::FrontendCon` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9348** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 1, Graphics 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `<std::sys::sync::once::futex::Once>::call [libxul.so]` 0; `nsQueryInterfaceISupports::operator()(nsID const&, void**) c` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 213, DOM Worker 74, other 14, BgPool 1, Socket 1, IPC I/O 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 213 ms (10.4% of span): Idle 114, GC / CC 65, JavaScript 18, Other 9, DOM 4, Profiler 3
  - JS leaf 2 / native under JS 20 / native 191; buckets: ipc 211, poll_wait 119, gc_cc 75, harness_diagnostics 19, array_buffer_copy 3, engine_stream_read 3, subprocess_pipe_io 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 118; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 15; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `mprotect [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3
  - GC/CC markers: GCMajor 2× 1089 ms, GCSlice 15× 54 ms, CCSlice 5× 13 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorkerLP#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 74 ms: buckets subprocess_pipe_io 74, js_ctypes 74, worker_messaging 74, ipc 74, poll_wait 74; top self: `__syscall_cancel_arch [libc.so.6]` 74
- **tab:9348** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsRefreshDriver::Tick(mozilla::layers::BaseTransactionId<moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9492** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 354, DOM Worker 201, Renderer 187, SwComposite 131, BgPool 107, WRRenderBackend 42, Compositor 32, other 24, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 354 ms (11.5% of span): Idle 245, JavaScript 64, Other 22, DOM 16, Profiler 6
  - JS leaf 6 / native under JS 65 / native 283; buckets: ipc 353, poll_wait 256, gc_cc 51, engine_stream_read 35, harness_diagnostics 27, worker_messaging 22, native_receiver 13, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 252; `[unknown]` 9; `IID2NativeInterfaceMap::Find(nsID const&) const [libxul.so]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 3; `mozilla::dom::Document::GetUnretargetedFocusedContent(mozill` 2
  - WebRender/compositor threads: Renderer 187 ms (top self: `__syscall_cancel_arch [libc.so.6]` 100, `__memmove_avx512_unaligned_erms [libc.so.6]` 49, `syscall [libc.so.6]` 18); SwComposite 131 ms (top self: `syscall [libc.so.6]` 105, `__memmove_avx512_unaligned_erms [libc.so.6]` 25, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 107 ms (top self: `__syscall_cancel_arch [libc.so.6]` 76, `__memmove_avx512_unaligned_erms [libc.so.6]` 29, `profiler_feature_active(unsigned int) [libxul.so]` 1); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 12, `[axiosozo-dev]` 0, `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 201 ms: buckets subprocess_pipe_io 201, worker_messaging 201, ipc 201, js_ctypes 187, poll_wait 183, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 183; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `nsTSubstring<char16_t>::Assign(char16_t const*, un` 1; `js::Atomize(JSContext*, char const*, unsigned long` 1
- **tab:9348** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0; `mozilla::MainThreadIdlePeriod::GetIdlePeriodHint(mozilla::Ti` 0
  - GC/CC markers: GCMajor 1× 34 ms, CCSlice 1× 2 ms, GCSlice 4× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 225, DOM Worker 209, Renderer 194, BgPool 125, SwComposite 123, WRRenderBackend 44, Compositor 33, ImageBridge 13, WRSceneBuilder 6, other 1, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 225 ms (7.4% of span): Idle 114, GC / CC 41, JavaScript 40, Other 18, DOM 11, Profiler 1
  - JS leaf 7 / native under JS 40 / native 178; buckets: ipc 224, poll_wait 126, gc_cc 96, engine_stream_read 38, worker_messaging 28, subprocess_pipe_io 10, array_buffer_copy 9, native_receiver 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 127; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 9; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 3
  - GC/CC markers: GCMajor 1× 89 ms, GCSlice 15× 51 ms, CCSlice 1× 9 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 194 ms (top self: `__syscall_cancel_arch [libc.so.6]` 108, `__memmove_avx512_unaligned_erms [libc.so.6]` 54, `syscall [libc.so.6]` 21); SwComposite 123 ms (top self: `syscall [libc.so.6]` 98, `__memmove_avx512_unaligned_erms [libc.so.6]` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 8); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 6, `__lll_lock_wait [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 125 ms (top self: `__syscall_cancel_arch [libc.so.6]` 86, `__memmove_avx512_unaligned_erms [libc.so.6]` 35, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 209 ms: buckets subprocess_pipe_io 209, worker_messaging 209, ipc 209, js_ctypes 190, poll_wait 186, gc_cc 11; top self: `__syscall_cancel_arch [libc.so.6]` 187; `[axiosozo-dev]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 3; `mozilla::dom::WorkerParentThreadRunnable::WorkerPa` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1
- **tab:8945** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 464, DOM Worker 236, BgPool 219, Renderer 117, SwComposite 79, WRRenderBackend 30, Compositor 20, other 15, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 464 ms (22.5% of span): Idle 266, JavaScript 76, Other 53, DOM 26, GC / CC 19, Graphics 9
  - JS leaf 11 / native under JS 90 / native 363; buckets: ipc 461, poll_wait 323, gc_cc 90, engine_stream_read 47, worker_messaging 41, harness_diagnostics 38, paint_layout 34, subprocess_pipe_io 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 292; `[unknown]` 13; `[axiosozo-dev]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 1137 ms, GCSlice 8× 46 ms, GCMinor 2× 5 ms
  - WebRender/compositor threads: Renderer 117 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx512_unaligned_erms [libc.so.6]` 24, `syscall [libc.so.6]` 15); SwComposite 79 ms (top self: `syscall [libc.so.6]` 74, `__memmove_avx512_unaligned_erms [libc.so.6]` 5); WRRenderBackend#0 30 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 219 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 107, `__syscall_cancel_arch [libc.so.6]` 103, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 236 ms: buckets subprocess_pipe_io 236, worker_messaging 235, ipc 235, js_ctypes 191, poll_wait 185, gc_cc 15; top self: `__syscall_cancel_arch [libc.so.6]` 188; `__memset_avx512_unaligned_erms [libc.so.6]` 7; `__lll_lock_wake [libc.so.6]` 6; `getcontext [libc.so.6]` 3; `[axiosozo-dev]` 3
- **tab:8986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9354** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8945** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 442, DOM Worker 179, Renderer 90, SwComposite 72, other 25, WRRenderBackend 15, Compositor 14, WRSceneBuilder 9, WRWorker 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 442 ms (12.1% of span): Idle 216, JavaScript 87, Layout 35, Other 32, DOM 31, Graphics 24
  - JS leaf 14 / native under JS 128 / native 301; buckets: ipc 440, poll_wait 245, gc_cc 102, worker_messaging 74, paint_layout 70, engine_stream_read 64, subprocess_pipe_io 25, array_buffer_copy 24
  - top self: `__syscall_cancel_arch [libc.so.6]` 225; `[unknown]` 15; `[axiosozo-dev]` 8; `bool js::JSONPerHandlerParser<unsigned char, js::JSONFullPar` 7; `__lll_lock_wait [libc.so.6]` 5; `mozilla::dom::AbstractRange::Init(nsINode*) [libxul.so]` 4
  - GC/CC markers: GCSlice 3× 10 ms, GCMinor 2× 2 ms
  - WebRender/compositor threads: Renderer 90 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `syscall [libc.so.6]` 9); SwComposite 72 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 38, `syscall [libc.so.6]` 33, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 0, `mozilla::detail::RunnableFunction<mozilla::IOUtils` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 179 ms: buckets subprocess_pipe_io 179, worker_messaging 179, ipc 179, js_ctypes 167, poll_wait 163, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 164; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `profiler_capture_backtrace() [libxul.so]` 1; `mozilla::EventDispatcher::Dispatch(mozilla::dom::E` 1
- **tab:8896** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `nsPIDOMWindowInner::IsCurrentInnerWindow() const [libxul.so]` 0; `JSFunction::needsCallObject() const [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[` 0; `js::NewPlainObject(JSContext*, js::NewObjectOptions const&) ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8945** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::RunIdleMemoryCleanup(mozilla::TimeStamp, unsigned i` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8986** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 72, Renderer 29, DOM Worker 10, BgPool 4, Compositor 4, SwComposite 3, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 73 ms (26.5% of span): JavaScript 29, GC / CC 12, Layout 9, DOM 6, Idle 5, Other 5
  - JS leaf 0 / native under JS 44 / native 29; buckets: ipc 70, gc_cc 29, array_buffer_copy 14, harness_diagnostics 12, paint_layout 11, worker_messaging 8, engine_stream_read 7, poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `js::jit::IRGenerator::emitCallAccessorGuards(js::NativeObjec` 4; `[unknown]` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::jit::IRGenerator::maybeCreateAllocSite() [libxul.so]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2
  - GC/CC markers: CCSlice 1× 5 ms, GCSlice 4× 5 ms
  - WebRender/compositor threads: Renderer 29 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__syscall_cancel_arch [libc.so.6]` 3); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::composite::CompositeState::push_surface` 1, `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.s` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 4 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `unlink [libc.so.6]` 1, `rmdir [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 8, poll_wait 8, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0; `OriginalPromiseThenBuiltin(JSContext*, JS::Handle<` 0
- **tab:9348** CPU ms by thread group: main 21, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 21 ms (7.7% of span): Other 8, JavaScript 4, Idle 3, DOM 3, Layout 3
  - JS leaf 0 / native under JS 7 / native 14; buckets: ipc 20, gc_cc 5, poll_wait 5, subprocess_pipe_io 3, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseN` 1; `mozilla::RecursiveMutex::UnlockInternal() [libxul.so]` 1; `nsIContent::UnbindFromTree(nsINode*, BatchRemovalState const` 1; `style::properties::cascade::iter_declarations [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8896** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 3, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::ObjectFuse::tryOptimizeConstantProperty(JS::PropertyKey,` 0; `setActiveOnTab (moz-extension://9a310967-e580-48bf-b3e8-4eaf` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

