# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.2 | **4.9** (main 2.4, DOM Worker 1.0, glean.dispatche 0.5, Softwar~cThread 0.5, Renderer 0.5) | Web Content 3.9, RDD Process 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **26.8** (Renderer 16.0, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.6, TaskCon~ller # 1.3) | Isolated Web Co 3.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.5** (Renderer 9.6, WRRende~ckend# 2.0, WRScene~ilder# 1.7, main 1.3, glean.dispatche 1.3) | Isolated Web Co 4.0 | — | — |
| plain | scroll | 59.0 | 17.1 | **43.0** (Renderer 30.1, main 3.9, WRRende~ckend# 3.0, SwComposite 2.0, glean.dispatche 1.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **8.3** (main 4.5, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 8.5 | — |
| trace | idle | 59.5 | 17.4 | **5.4** (main 1.9, TaskCon~ller # 1.0, Softwar~cThread 1.0, IPDL Background 0.5, Renderer 0.5) | Isolated Web Co 1.5, Privileged Cont 0.5 | — | — |
| trace | raf | 59.0 | 17.2 | **19.5** (Renderer 9.8, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.2 | — | — |
| trace | raf-nosampler | — | — | **18.5** (Renderer 9.9, WRRende~ckend# 2.0, WRScene~ilder# 1.7, glean.dispatche 1.3, Compositor 1.3) | Isolated Web Co 3.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **48.0** (Renderer 30.6, main 5.9, WRRende~ckend# 3.5, SwComposite 2.0, TaskCon~ller # 1.5) | Isolated Web Co 4.5 | — | — |
| trace | key | — | — | **57.8** (main 18.4, DOM Worker 16.5, Indexed~ IO # 8.8, IPDL Background 5.9, TaskCon~ller # 2.7) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **10.6** (SamplerThread 4.8, TaskCon~ller # 2.4, main 1.9, Socket Thread 0.5, IPDL Background 0.5) | Web Content 8.7, Isolated Web Co 4.3, WebExtensions 1.9, RDD Process 1.9 | — | — |
| profile | raf | 59.0 | 17.1 | **31.9** (Renderer 12.0, SamplerThread 6.5, WRRende~ckend# 2.9, main 1.9, WRScene~ilder# 1.9) | Isolated Web Co 10.3, Web Content 8.4, Socket Process 1.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **29.2** (Renderer 11.6, SamplerThread 6.6, WRRende~ckend# 2.7, glean.dispatche 2.0, Compositor 2.0) | Isolated Web Co 9.7, Web Content 8.6, Privileged Cont 2.0, WebExtensions 1.7 | — | — |
| profile | scroll | 59.0 | 17.1 | **61.8** (Renderer 33.8, SamplerThread 7.8, main 7.3, WRRende~ckend# 3.9, Compositor 2.0) | Web Content 9.8, Isolated Web Co 9.3, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **14.2** (main 5.6, SamplerThread 4.5, TaskCon~ller # 0.8, Renderer 0.8, WRRende~ckend# 0.5) | Web Content 8.5, Isolated Web Co 4.6, WebExtensions 1.9, Privileged Cont 1.9 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 52, Compositor 2, DOM Worker 1, IPC I/O 1, Socket 1, other 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 52 ms (2.5% of span): GC / CC 30, Other 8, Idle 7, JavaScript 6, Graphics 1
  - JS leaf 1 / native under JS 5 / native 46; buckets: ipc 52, gc_cc 37, poll_wait 10, harness_diagnostics 4, array_buffer_copy 2, json_metadata 1, paint_layout 1, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `poll [libc.so.6]` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `write [libc.so.6]` 2; `mozilla::EventListenerManager::MarkForCC() [libxul.so]` 2; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 2
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 6× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `wr_renderer_update [libxul.so]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3294** CPU ms by thread group: main 32, IPC I/O 6, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 32 ms (1.5% of span): Idle 19, GC / CC 6, JavaScript 3, Other 1, Profiler 1, Layout 1
  - JS leaf 0 / native under JS 4 / native 28; buckets: ipc 30, poll_wait 19, gc_cc 8, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 2, paint_layout 1
  - top self: `poll [libc.so.6]` 19; `PLDHashTable::MakeEntryHandle(void const*) [libxul.so]` 1; `CCGraphBuilder::BuildGraph(JS::SliceBudget&) [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl<js::` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3296** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<unsigned long>::type, (std::i` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3380** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 348, WRRenderBackend 76, main 66, WRSceneBuilder 59, Compositor 46, SwComposite 20, IPC I/O 11, DOM Worker 6, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 66 ms (2.1% of span): GC / CC 32, Idle 26, JavaScript 4, Other 2, Layout 1, DOM 1
  - JS leaf 1 / native under JS 4 / native 61; buckets: ipc 66, gc_cc 37, poll_wait 27, harness_diagnostics 3, array_buffer_copy 2, paint_layout 1, json_metadata 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 26; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 2
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 6× 29 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 348 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 101, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 70, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 53); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 59, `sched_yield [libc.so.6]` 5, `[linux-vdso.so.1]` 1); WRSceneBuilder#0 53 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3294** CPU ms by thread group: main 187, IPC I/O 17, other 3, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 187 ms (6.0% of span): Idle 105, Graphics 30, Layout 28, Other 10, Profiler 7, JavaScript 4
  - JS leaf 0 / native under JS 9 / native 178; buckets: ipc 176, poll_wait 107, paint_layout 70, subprocess_pipe_io 4, canvas_2d 3, gc_cc 3, harness_diagnostics 2, memcpy_memset 2
  - top self: `poll [libc.so.6]` 104; `[]` 6; `sendmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `getcontext [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3230** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3296** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 336, WRRenderBackend 65, WRSceneBuilder 53, Compositor 42, main 14, SwComposite 11, IPC I/O 10, other 2, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 14 ms (0.5% of span): Idle 10, Other 2, JavaScript 2
  - JS leaf 1 / native under JS 1 / native 12; buckets: ipc 14, poll_wait 11, harness_diagnostics 2, gc_cc 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 11; `nsTimerImpl::InitHighResolutionWithNamedFuncCallback(void (*` 1; `#log (chrome://remote/content/marionette/server.sys.mjs:209:` 1; `mprotect [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `recvmsg [libc.so.6]` 0
  - WebRender/compositor threads: Renderer 337 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 78, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 46); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1); WRSceneBuilder#0 47 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 4, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3294** CPU ms by thread group: main 152, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 152 ms (5.0% of span): Idle 96, Graphics 23, Layout 17, Other 8, Profiler 5, DOM 1
  - JS leaf 0 / native under JS 5 / native 147; buckets: ipc 144, poll_wait 98, paint_layout 45, gc_cc 3, subprocess_pipe_io 2, canvas_2d 1, memcpy_memset 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 96; `[]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `mozilla::nsDisplayList::PaintRoot(mozilla::nsDisplayListBuil` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3212** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3296** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 665, main 136, WRRenderBackend 75, SwComposite 39, Compositor 30, WRSceneBuilder 24, IPC I/O 9, other 1, Socket 1, BgPool 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 136 ms (6.6% of span): Idle 68, GC / CC 30, Other 13, JavaScript 12, Graphics 5, Layout 5
  - JS leaf 5 / native under JS 9 / native 123; buckets: ipc 136, poll_wait 85, gc_cc 36, paint_layout 10, harness_diagnostics 10, array_buffer_copy 3, subprocess_pipe_io 1, json_metadata 0
  - top self: `poll [libc.so.6]` 68; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `Response (chrome://remote/content/marionette/message.sys.mjs` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul` 2
  - GC/CC markers: GCSlice 12× 27 ms, CCSlice 2× 6 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 665 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 224, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 91, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 64); WRRenderBackend#0 75 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 5, `[axiosozo-dev]` 3); SwComposite 39 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `open64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::UncompressedSourceCache::purge() [libxul.so]` 0
- **tab:3294** CPU ms by thread group: main 104, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 104 ms (5.0% of span): Idle 64, Graphics 13, Other 9, GC / CC 8, JavaScript 4, Profiler 2
  - JS leaf 0 / native under JS 5 / native 99; buckets: ipc 101, poll_wait 65, paint_layout 18, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, canvas_2d 2, mozafterpaint_events 1
  - top self: `poll [libc.so.6]` 65; `[]` 2; `nsIFrame::Extend3DContext(nsStyleDisplay const*, nsStyleEffe` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `mozilla::RunnableTask::Run() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 5 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3212** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3296** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `nsCycleCollector_suspectedCount() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 205, Renderer 35, WRRenderBackend 19, Compositor 18, WRSceneBuilder 15, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 205 ms (5.4% of span): Idle 44, GC / CC 33, Layout 33, Graphics 31, JavaScript 25, Other 24
  - JS leaf 0 / native under JS 34 / native 171; buckets: ipc 205, paint_layout 73, poll_wait 67, gc_cc 49, memcpy_memset 6, subprocess_pipe_io 5, harness_diagnostics 4, array_buffer_copy 4
  - top self: `poll [libc.so.6]` 45; `[axiosozo-dev]` 11; `recvmsg [libc.so.6]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 6× 29 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 16, `sched_yield [libc.so.6]` 1, `webrender::render_target::RenderTarget::add_task [` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `non-virtual thunk to mozilla::layers::CompositorBr` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3294** CPU ms by thread group: main 65, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 65 ms (1.7% of span): Idle 24, Other 10, GC / CC 8, JavaScript 7, Layout 7, Graphics 4
  - JS leaf 0 / native under JS 6 / native 59; buckets: ipc 60, poll_wait 24, paint_layout 16, gc_cc 13, array_buffer_copy 4, harness_diagnostics 3, subprocess_pipe_io 3, canvas_2d 1
  - top self: `poll [libc.so.6]` 24; `sendmsg [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `syscall [libc.so.6]` 2; `[]` 1; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 23 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3130** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle` 0; `js::jit::CacheIRWriter::loadArgumentDynamicSlot_(js::jit::In` 0; `mozilla::dom::ToJSValue(JSContext*, mozilla::dom::WindowProx` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3296** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.4 | 17.4 | **6.4** (main 1.9, Renderer 1.5, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Web Content 2.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **34.3** (Renderer 19.6, SwComposite 2.9, WRRende~ckend# 2.3, main 2.0, glean.dispatche 2.0) | Isolated Web Co 4.6, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **21.9** (Renderer 11.6, glean.dispatche 1.7, WRRende~ckend# 1.7, SwComposite 1.7, WRScene~ilder# 1.3) | Isolated Web Co 4.7, WebExtensions 0.7, Web Content 0.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **79.2** (Renderer 62.0, SwComposite 5.4, main 3.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 4.4, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.7** (main 4.0, Renderer 1.1, Compositor 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3 | 9.0 | — |
| trace | idle | 59.4 | 17.2 | **4.9** (main 2.4, TaskCon~ller # 1.0, glean.dispatche 0.5, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.2 | **18.3** (Renderer 7.5, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.6 | — | — |
| trace | raf-nosampler | — | — | **21.9** (Renderer 10.3, glean.dispatche 2.0, WRRende~ckend# 2.0, WRScene~ilder# 1.7, SwComposite 1.7) | Isolated Web Co 3.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **82.3** (Renderer 62.1, main 5.4, SwComposite 5.4, WRRende~ckend# 3.4, Compositor 1.5) | Isolated Web Co 4.9 | — | — |
| trace | key | — | — | **48.3** (main 16.8, DOM Worker 14.7, IPDL Background 6.1, TaskCon~ller # 2.4, IndexedDB IO # 1.9) | Isolated Web Co 1.1, WebExtensions 0.6, Privileged Cont 0.6, RDD Process 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **8.8** (SamplerThread 3.9, main 2.4, TaskCon~ller # 1.5, IPDL Background 1.0) | Web Content 9.2, Isolated Web Co 3.9, WebExtensions 1.9, Privileged Cont 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **26.7** (Renderer 8.4, SamplerThread 5.8, SwComposite 2.3, WRRende~ckend# 1.9, Compositor 1.9) | Web Content 8.4, Isolated Web Co 8.1, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **27.3** (Renderer 11.3, SamplerThread 6.0, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.7) | Isolated Web Co 8.3, Web Content 7.9, WebExtensions 1.7, Privileged Cont 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **105.1** (Renderer 68.8, SamplerThread 9.8, main 7.3, SwComposite 6.3, WRRende~ckend# 4.4) | Web Content 9.8, Isolated Web Co 9.3, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **14.0** (main 4.8, SamplerThread 4.0, Renderer 1.3, Compositor 0.8, TaskCon~ller # 0.5) | Web Content 8.0, Isolated Web Co 3.8, Privileged Cont 1.9, WebExtensions 1.9 | 8.5 | — |

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

- **parent** CPU ms by thread group: main 40, Compositor 1, DOM Worker 1, IPC I/O 1, SwComposite 1, Renderer 1, Socket 1, other 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, ImageBridge 0
  - main thread 40 ms (1.9% of span): GC / CC 21, Other 7, Idle 6, JavaScript 5, DOM 1
  - JS leaf 0 / native under JS 6 / native 34; buckets: ipc 40, gc_cc 25, poll_wait 11, harness_diagnostics 4, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 1, json_metadata 0
  - top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `recvmsg [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<nsIClassInf` 1
  - GC/CC markers: GCMajor 1× 53 ms, GCSlice 5× 21 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); Renderer 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `webrender::scene_builder_thread::SceneBuilderThrea` 0, `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::GCRuntime::beginMarkPhase(js::gc::AutoGCSe` 0
- **tab:3278** CPU ms by thread group: main 23, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 23 ms (1.1% of span): Idle 14, GC / CC 5, JavaScript 3, Profiler 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 20; buckets: ipc 21, poll_wait 14, gc_cc 5, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 1, paint_layout 0
  - top self: `poll [libc.so.6]` 14; `nsOuterWindowProxy::getOwnPropertyDescriptor(JSContext*, JS:` 1; `[]` 1; `mozilla::CycleCollectedJSRuntime::NoteGCThingXPCOMChildren(J` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `js::ForwardingProxyHandler::isCallable(JSObject*) const [lib` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3201** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 247, SwComposite 59, main 56, WRRenderBackend 54, WRSceneBuilder 49, Compositor 42, IPC I/O 10, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, ImageBridge 0
  - main thread 56 ms (1.8% of span): GC / CC 26, Idle 18, JavaScript 4, Other 3, Layout 2, DOM 2
  - JS leaf 0 / native under JS 4 / native 51; buckets: ipc 56, gc_cc 28, poll_wait 19, paint_layout 5, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScript` 2; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 2
  - GC/CC markers: GCMajor 1× 69 ms, GCSlice 5× 21 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 247 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 75, `int blendTextureNearestFast<true, glsl::sampler2D_` 17); SwComposite 59 ms (top self: `syscall [libc.so.6]` 53, `__memmove_avx_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `js::AtomsTable::sweepIncrementally(mozilla::detail` 0
- **tab:3278** CPU ms by thread group: main 138, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 138 ms (4.4% of span): Idle 99, Graphics 16, Layout 9, Profiler 6, Other 5, JavaScript 3
  - JS leaf 0 / native under JS 4 / native 134; buckets: ipc 134, poll_wait 99, paint_layout 32, gc_cc 2, array_buffer_copy 2, canvas_2d 2, harness_diagnostics 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 99; `[]` 2; `sendmsg [libc.so.6]` 2; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [l` 1; `JS::GetFlowIdFromJSMicroTask(JSObject*, unsigned long*) [lib` 1; `[linux-vdso.so.1]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3201** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3219** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `std::_Rb_tree_rebalance_for_erase(std::_Rb_tree_node_base*, ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 331, WRRenderBackend 51, SwComposite 49, WRSceneBuilder 46, Compositor 42, main 12, IPC I/O 10, other 2, Socket 0, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 12 ms (0.4% of span): Idle 8, JavaScript 3, DOM 1, Other 0
  - JS leaf 0 / native under JS 3 / native 9; buckets: ipc 12, poll_wait 8, gc_cc 3, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 8; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 1; `mprotect [libc.so.6]` 1; `JS::Compartment::firstGlobal() const [libxul.so]` 1; `prettyObject (chrome://remote/content/shared/Format.sys.mjs:` 0
  - WebRender/compositor threads: Renderer 331 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 85, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 83, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 43); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 4, `[axiosozo-dev]` 0); SwComposite 49 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3278** CPU ms by thread group: main 130, IPC I/O 17, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 131 ms (4.3% of span): Idle 91, Graphics 17, Layout 10, GC / CC 5, Other 4, Profiler 4
  - JS leaf 0 / native under JS 2 / native 129; buckets: ipc 126, poll_wait 91, paint_layout 31, gc_cc 6, memcpy_memset 1, canvas_2d 1, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 91; `sendmsg [libc.so.6]` 1; `[]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `[linux-vdso.so.1]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1
  - GC/CC markers: CCSlice 1× 3 ms, GCSlice 3× 2 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3290** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3180** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1371, main 135, SwComposite 119, WRRenderBackend 84, Compositor 30, WRSceneBuilder 23, IPC I/O 8, other 1, DOM Worker 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 135 ms (6.5% of span): Idle 71, GC / CC 35, Other 10, JavaScript 7, Graphics 7, Layout 4
  - JS leaf 1 / native under JS 6 / native 128; buckets: ipc 135, poll_wait 87, gc_cc 38, paint_layout 11, harness_diagnostics 5, array_buffer_copy 4, json_metadata 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 71; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 2; `[linux-vdso.so.1]` 2
  - GC/CC markers: GCMajor 1× 44 ms, GCSlice 9× 28 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1371 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 430, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 296, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 105); SwComposite 119 ms (top self: `syscall [libc.so.6]` 111, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 84 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 4, `core::hash::BuildHasher::hash_one [libxul.so]` 2)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `bool js::gc::IsAboutToBeFinalizedInternal<JSString` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3278** CPU ms by thread group: main 98, IPC I/O 15, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 97 ms (4.7% of span): Idle 65, Graphics 14, GC / CC 7, JavaScript 4, Other 3, Profiler 2
  - JS leaf 0 / native under JS 4 / native 93; buckets: ipc 92, poll_wait 66, paint_layout 19, gc_cc 10, canvas_2d 4, harness_diagnostics 4, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 65; `[]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `sendmsg [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3219** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 170, Renderer 40, WRRenderBackend 15, Compositor 15, WRSceneBuilder 12, SwComposite 10, IPC I/O 8, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, BgPool 0, DOM Worker 0, ImageBridge 0
  - main thread 170 ms (4.5% of span): Idle 39, Layout 34, GC / CC 25, JavaScript 25, Other 21, Graphics 19
  - JS leaf 1 / native under JS 26 / native 143; buckets: ipc 170, paint_layout 58, poll_wait 57, gc_cc 38, subprocess_pipe_io 5, harness_diagnostics 5, array_buffer_copy 2, json_metadata 1
  - top self: `poll [libc.so.6]` 41; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 4; `__strcmp_avx2 [libc.so.6]` 3; `[unknown]` 3
  - GC/CC markers: GCMajor 1× 53 ms, GCSlice 5× 21 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 40 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 3); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0); WRSceneBuilder#0 11 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 1, `webrender::scene_builder_thread::SceneBuilderThrea` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3278** CPU ms by thread group: main 54, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (1.4% of span): Idle 22, GC / CC 8, Other 8, JavaScript 5, Layout 4, Profiler 3
  - JS leaf 0 / native under JS 6 / native 48; buckets: ipc 49, poll_wait 23, paint_layout 12, gc_cc 10, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 3; `[]` 2; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 2; `std::io::impls::<impl std::io::Write for &mut W>::write_all ` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3126** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 5, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 5, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 5; `nsThread::DoMainThreadSpecificProcessing() const [libxul.so]` 0; `mozilla::dom::WindowGlobalChild_Binding::get_isCurrentGlobal` 0; `js::ForwardingProxyHandler::isCallable(JSObject*) const [lib` 0; `nsDocShell::EnsureScriptEnvironment() [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3180** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **51.0** (main 19.9, Renderer 17.0, DOM Worker 5.7, TaskCon~ller # 2.8, WRRende~ckend# 2.8) | AxioCEFProbe 48.2, cef:gpu-process 14.2, cef:utility 8.5, cef:renderer 5.7 | — | 325.0 |
| plain | idle | — | — | **4.9** (main 2.9, DOM Worker 1.0, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 1.5, cef:utility 1.0, forkserver 0.5 | — | — |
| plain | raf | 60.0 | 21.9 | **17.3** (main 4.6, Renderer 3.6, SwComposite 2.9, DOM Worker 1.6, TaskCon~ller # 1.0) | cef:renderer 5.6, AxioCEFProbe 3.6, cef:gpu-process 3.3, WebExtensions 0.7 | — | — |
| plain | raf-nosampler | — | — | **15.8** (Renderer 3.7, main 3.3, SwComposite 2.7, DOM Worker 1.7, WRRende~ckend# 1.0) | cef:renderer 5.0, cef:gpu-process 3.0, AxioCEFProbe 2.0, Web Content 0.3 | — | — |
| plain | scroll | 59.8 | 20.5 | **26.4** (main 9.9, DOM Worker 5.0, Renderer 3.5, SwComposite 3.0, WRRende~ckend# 1.5) | cef:gpu-process 12.4, cef:renderer 7.0, AxioCEFProbe 4.0 | — | — |
| plain | key | — | — | **8.3** (main 4.2, DOM Worker 0.8, TaskCon~ller # 0.6, IPC I/O Parent 0.3, Timer 0.3) | AxioCEFProbe 1.4, cef:renderer 1.1, cef:gpu-process 0.9, WebExtensions 0.3 | 9.4 | — |
| plain | switch-to-gecko | — | — | **44.3** (main 14.7, BgIOThr~Pool # 7.4, Renderer 7.4, Compositor 7.4, DOM Worker 7.4) |  | — | 120.8 |
| trace | switch-to-engine | — | — | **58.9** (Renderer 20.7, main 17.3, DOM Worker 10.4, Timer 3.5, WRScene~ilder# 3.5) | AxioCEFProbe 48.4, cef:gpu-process 17.3, cef:renderer 10.4, cef:utility 7.0 | — | 266.3 |
| trace | idle | — | — | **2.0** (main 1.5, Timer 0.5) | Web Content 1.9, AxioCEFProbe 1.0, cef:utility 0.5 | — | — |
| trace | raf | 60.0 | 20.9 | **20.6** (main 6.5, Renderer 3.6, SwComposite 2.6, TaskCon~ller # 1.3, WRRende~ckend# 1.3) | cef:renderer 5.6, AxioCEFProbe 3.6, cef:gpu-process 3.3 | — | — |
| trace | raf-nosampler | — | — | **27.6** (main 6.6, DOM Worker 6.0, Renderer 3.3, Indexed~ IO # 3.0, SwComposite 2.7) | cef:renderer 6.0, cef:gpu-process 3.0, AxioCEFProbe 2.6, Isolated Web Co 0.3 | — | — |
| trace | scroll | 59.5 | 20.8 | **37.9** (main 13.4, DOM Worker 7.0, Renderer 5.0, SwComposite 3.5, IPDL Background 1.5) | cef:gpu-process 13.4, cef:renderer 7.5, AxioCEFProbe 4.0 | — | — |
| trace | key | — | — | **12.4** (main 6.1, TaskCon~ller # 1.9, DOM Worker 1.4, Timer 0.6, Compositor 0.6) | AxioCEFProbe 2.0, cef:renderer 1.1, WebExtensions 0.6, cef:gpu-process 0.3 | 9.1 | — |
| trace | switch-to-gecko | — | — | **1.1** (main 0.5, TaskCon~ller # 0.2, DOM Worker 0.2, Renderer 0.1, BgIOThr~Pool # 0.1) |  | — | 15015.1 |
| profile | switch-to-engine | — | — | **21.0** (main 8.7, DOM Worker 5.0, SamplerThread 3.7, Renderer 1.2, Backgro~Pool # 1.2) | AxioCEFProbe 18.6, Web Content 16.1, cef:gpu-process 6.2, cef:zygote 3.7 | — | 784.1 |
| profile | idle | — | — | **11.2** (SamplerThread 4.4, main 2.9, DOM Worker 2.9, Timer 1.0) | Web Content 4.4, AxioCEFProbe 2.0, cef:utility 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 60.0 | 21.3 | **35.8** (main 7.2, SamplerThread 6.8, DOM Worker 6.5, Renderer 4.9, SwComposite 3.3) | cef:renderer 6.9, Web Content 4.9, cef:gpu-process 4.5, AxioCEFProbe 3.3 | — | — |
| profile | raf-nosampler | — | — | **28.2** (DOM Worker 6.3, SamplerThread 5.3, Renderer 4.3, main 4.0, SwComposite 3.3) | cef:renderer 6.0, Web Content 4.9, cef:gpu-process 3.6, AxioCEFProbe 2.7 | — | — |
| profile | scroll | 60.0 | 21.1 | **45.2** (main 14.4, DOM Worker 8.4, SamplerThread 6.4, Renderer 5.0, SwComposite 3.0) | cef:gpu-process 14.9, cef:renderer 7.0, Web Content 5.0, AxioCEFProbe 4.5 | — | — |
| profile | key | — | — | **18.4** (main 5.8, SamplerThread 4.7, DOM Worker 4.4, Timer 1.1, Renderer 0.6) | Web Content 4.1, WebExtensions 1.4, cef:renderer 1.4, AxioCEFProbe 1.1 | 10.4 | — |
| profile | switch-to-gecko | — | — | **3.8** (SamplerThread 2.0, main 0.8, TaskCon~ller # 0.4, DOM Worker 0.3, BgIOThr~Pool # 0.1) | Web Content 5.5, WebExtensions 1.3, Socket Process 0.9, Isolated Web Co 0.9 | — | 15813.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.7 | 0.0 | 0 | 0.0 | — | — | 5.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf | 59.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf-nosampler | 59.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | scroll | 59.3 | 0.0 | 0 | 0.0 | — | — | 4.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 2.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 2.4 | 0.0 | 0 | 0.0 | — | — | 6.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 59.5 | 0.0 | 0 | 0.0 | — | — | 5.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 2.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.710 | 0.475 | 0.0039 | 0.0026 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.026 | 0.119 | 0.0016 | 0.0071 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.018 | 0.122 | 0.0011 | 0.0073 |
| plain | scroll | memfd | native | 119 | 119 | 0.072 | 0.102 | 0.0042 | 0.0060 |
| plain | key | memfd | native | 21 | 21 | 0.008 | 0.167 | 0.0000 | 0.0010 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.363 | 1.331 | 0.0024 | 0.0089 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 184 | 184 | 0.027 | 0.114 | 0.0016 | 0.0068 |
| trace | raf-nosampler | memfd | native | 181 | 181 | 0.020 | 0.117 | 0.0012 | 0.0070 |
| trace | scroll | memfd | native | 120 | 120 | 0.075 | 0.103 | 0.0044 | 0.0061 |
| trace | key | memfd | native | 21 | 21 | 0.007 | 0.153 | 0.0000 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.629 | 1.171 | 0.0015 | 0.0029 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 185 | 186 | 0.029 | 0.139 | 0.0017 | 0.0084 |
| profile | raf-nosampler | memfd | native | 181 | 181 | 0.018 | 0.130 | 0.0011 | 0.0078 |
| profile | scroll | memfd | native | 121 | 121 | 0.082 | 0.110 | 0.0049 | 0.0065 |
| profile | key | memfd | native | 21 | 21 | 0.008 | 0.157 | 0.0000 | 0.0009 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.3 | 4.6 | 0.0 | — | — | — | — | — | — | — | — |
| profile | 0.4 | 5.6 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 11.7; spawn AxioCEFProbe resolved 20.1; write hello 22.0; first stdout read resolved 179.6; write create 180.7; write frame_ack 272.1; write focus 276.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 14.2; first stdout read resolved 23.2; write shutdown 23.9

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 30.4; spawn AxioCEFProbe resolved 65.0; write hello 69.8; first stdout read resolved 309.7; write create 310.9; write frame_ack 794.6; write focus 800.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 18.9; first stdout read resolved 34.4; write shutdown 36.6

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 59, DOM Worker 33, Renderer 16, WRRenderBackend 4, Compositor 3, BgPool 3, IPC I/O 2, WRSceneBuilder 2, SwComposite 2, Socket 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 59 ms (7.2% of span): Layout 19, Idle 17, JavaScript 15, Other 5, DOM 2, Graphics 2
  - JS leaf 1 / native under JS 19 / native 40; buckets: ipc 59, paint_layout 23, poll_wait 20, gc_cc 12, harness_diagnostics 7, array_buffer_copy 4, subprocess_pipe_io 2, engine_stream_read 2
  - top self: `poll [libc.so.6]` 17; `style::properties::cascade::iter_declarations [libxul.so]` 6; `style::properties::generated::longhands::color::cascade_prop` 3; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 2
  - WebRender/compositor threads: Renderer 16 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `void clear_buffer<unsigned int>(Texture&, unsigned` 4); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1, `__memset_avx512_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 33 ms: buckets subprocess_pipe_io 33, worker_messaging 33, ipc 33, poll_wait 23, js_ctypes 23, array_buffer_copy 2; top self: `poll [libc.so.6]` 22; `[axiosozo-dev]` 4; `__GI__Fork [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[unknown]` 1
- **tab:3958** CPU ms by thread group: main 32, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 32 ms (4.0% of span): Other 24, JavaScript 4, DOM 2, Profiler 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 28; buckets: ipc 24, array_buffer_copy 9, gc_cc 8, subprocess_pipe_io 4, json_metadata 1, memcpy_memset 1, poll_wait 1
  - top self: `xpt::detail::InterfaceByIID(nsID const&) [libxul.so]` 3; `[libfontconfig.so.1]` 2; `mozilla::dom::StartupJSEnvironment() [libxul.so]` 1; `[]` 1; `js::frontend::BytecodeEmitter::emitGCIndexOp(JSOp, js::GCThi` 1; `do_lookup_x [ld-linux-x86-64.so.2]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `syscall [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 30, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (4.2% of span): Other 26, Profiler 2, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 29; buckets: ipc 22, gc_cc 9, array_buffer_copy 8, poll_wait 4, subprocess_pipe_io 3, memcpy_memset 1
  - top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `poll [libc.so.6]` 2; `[libexpat.so.1]` 2; `gfxPlatformFontList::InitializeCodepointsWithNoFonts() [libx` 2; `[]` 1; `PrefsIter::Next() [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3832** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `mozilla::dom::BrowserChildMessageManager::GetEventTargetPare` 0; `mozilla::PointerEventHandler::DispatchPointerFromMouseOrTouc` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 50, DOM Worker 32, other 10, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 50 ms (2.4% of span): Idle 37, JavaScript 8, DOM 3, Profiler 1, Other 1, GC / CC 0
  - JS leaf 2 / native under JS 9 / native 39; buckets: ipc 50, poll_wait 38, gc_cc 6, array_buffer_copy 5, harness_diagnostics 5, subprocess_pipe_io 4, js_ctypes 1, json_metadata 0
  - top self: `poll [libc.so.6]` 37; `next (self-hosted:1265:23)[10]` 2; `__lll_lock_wait [libc.so.6]` 1; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, J` 1; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `rename [libc.so.6]` 0, `open64 [libc.so.6]` 0, `getdents64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 32 ms: buckets subprocess_pipe_io 32, js_ctypes 32, worker_messaging 32, ipc 32, poll_wait 32; top self: `poll [libc.so.6]` 32
- **tab:3958** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3832** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 196, DOM Worker 141, Renderer 130, SwComposite 96, WRRenderBackend 40, BgPool 36, Compositor 24, other 19, ImageBridge 10, WRSceneBuilder 5, IPC I/O 2, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 196 ms (6.4% of span): Idle 144, JavaScript 29, Other 12, DOM 8, GC / CC 2, Graphics 1
  - JS leaf 3 / native under JS 33 / native 160; buckets: ipc 196, poll_wait 149, gc_cc 34, worker_messaging 18, array_buffer_copy 13, engine_stream_read 13, json_metadata 11, subprocess_pipe_io 8
  - top self: `poll [libc.so.6]` 145; `[unknown]` 5; `write [libc.so.6]` 3; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 2; `mozilla::PerformanceCounterState::MaybeReportAccumulatedTime` 1; `fun_resolve(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 130 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `int blendTextureNearestFast<false, glsl::sampler2D` 16, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); SwComposite 96 ms (top self: `syscall [libc.so.6]` 79, `void scale_blit<true>(Texture&, IntRect const&, Te` 14, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 40 ms (top self: `syscall [libc.so.6]` 36, `webrender::quad::write_rounded_rect_clip_blocks [l` 1, `webrender::render_target::RenderTarget::add_task::` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 34, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `nsIEventTarget::IsOnCurrentThread() [libxul.so]` 0); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0, `close [libc.so.6]` 0)
  - busiest DOM Worker 133 ms: buckets subprocess_pipe_io 133, worker_messaging 133, ipc 133, js_ctypes 122, poll_wait 120, memcpy_memset 3; top self: `poll [libc.so.6]` 120; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `js::gc::StoreBuffer::SlotsEdge::trace(js::gc::Tenu` 2; `bool js::ctypes::jsvalToInteger<int>(JSContext*, J` 1; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 1
- **tab:3832** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 2, gc_cc 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `write [libc.so.6]` 0; `GIFFT_LabeledTimingDistributionAccumulateRawMillis [libxul.s` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3958** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3356** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 122, Renderer 116, main 112, SwComposite 87, WRRenderBackend 37, BgPool 31, Compositor 22, ImageBridge 9, WRSceneBuilder 5, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 112 ms (3.7% of span): Idle 76, JavaScript 19, Other 9, DOM 5, GC / CC 3
  - JS leaf 3 / native under JS 20 / native 88; buckets: ipc 112, poll_wait 80, gc_cc 25, engine_stream_read 15, worker_messaging 12, json_metadata 8, subprocess_pipe_io 7, array_buffer_copy 4
  - top self: `poll [libc.so.6]` 78; `[unknown]` 5; `write [libc.so.6]` 4; `js::gc::TenuringTracer::collectToObjectFixedPoint() [libxul.` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 116 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `int blendTextureNearestFast<false, glsl::sampler2D` 14, `glsl::texture(glsl::sampler2DRect_impl*, glsl::vec` 4); SwComposite 87 ms (top self: `syscall [libc.so.6]` 72, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `nsXULPrototypeCache::Release() [libxul.so]` 0); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `mozilla::ipc::MessageChannel::OnMessageReceivedFro` 0, `IsTwiceTheRequiredBytesRepresentableAsUint32(unsig` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 122 ms: buckets subprocess_pipe_io 122, worker_messaging 122, ipc 122, js_ctypes 112, poll_wait 111, gc_cc 2; top self: `poll [libc.so.6]` 111; `nsProfilerStartParams::GetFilters() [libxul.so]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `write [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3958** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3356** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 285, DOM Worker 137, Renderer 93, SwComposite 67, WRRenderBackend 30, BgPool 26, Compositor 16, other 11, ImageBridge 7, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 285 ms (14.0% of span): Idle 174, JavaScript 42, GC / CC 27, Other 21, DOM 8, Graphics 5
  - JS leaf 4 / native under JS 43 / native 238; buckets: ipc 285, poll_wait 203, gc_cc 66, worker_messaging 26, paint_layout 15, engine_stream_read 14, array_buffer_copy 13, json_metadata 11
  - top self: `poll [libc.so.6]` 175; `[unknown]` 8; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 5; `write [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4
  - GC/CC markers: GCMajor 1× 895 ms, GCSlice 6× 32 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 93 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55, `int blendTextureNearestFast<false, glsl::sampler2D` 10, `syscall [libc.so.6]` 6); SwComposite 67 ms (top self: `syscall [libc.so.6]` 60, `void scale_blit<true>(Texture&, IntRect const&, Te` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 30 ms (top self: `syscall [libc.so.6]` 27, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 137 ms: buckets subprocess_pipe_io 137, worker_messaging 137, ipc 137, js_ctypes 123, poll_wait 121, gc_cc 6; top self: `poll [libc.so.6]` 121; `[unknown]` 3; `js::gc::TenuringTracer::promoteObjectSlow(JSObject` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__memcmp_evex_movbe [libc.so.6]` 1
- **tab:3338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3832** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `webrtc::internal::WeakReferenceOwner::WeakReferenceOwner() [` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 192, DOM Worker 88, Renderer 19, other 18, SwComposite 13, Compositor 8, WRRenderBackend 8, WRSceneBuilder 6, BgPool 4, IPC I/O 1, ImageBridge 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 192 ms (5.3% of span): Idle 77, JavaScript 46, Layout 21, Graphics 15, Other 15, DOM 14
  - JS leaf 6 / native under JS 72 / native 115; buckets: ipc 191, poll_wait 94, gc_cc 50, paint_layout 44, worker_messaging 38, engine_stream_read 21, array_buffer_copy 11, subprocess_pipe_io 10
  - top self: `poll [libc.so.6]` 78; `[unknown]` 8; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `std::__uniq_ptr_impl<mozilla::ScrollSnapTargetIds, std::defa` 2
  - WebRender/compositor threads: Renderer 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `int blendTextureNearestFast<false, glsl::sampler2D` 1, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); SwComposite 13 ms (top self: `syscall [libc.so.6]` 10, `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 8 ms (top self: `syscall [libc.so.6]` 7, `sched_yield [libc.so.6]` 0, `webrender::transform::register_gpu_transform [libx` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 88 ms: buckets subprocess_pipe_io 88, worker_messaging 88, ipc 88, js_ctypes 83, poll_wait 80, gc_cc 4; top self: `poll [libc.so.6]` 80; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1; `mozilla::dom::WorkerPrivate::BeginCTypesCall() [li` 1; `js::SpeciesConstructor(JSContext*, JS::Handle<JSOb` 1
- **tab:3259** CPU ms by thread group: main 12, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.3% of span): GC / CC 6, Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 10, poll_wait 8, gc_cc 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `FixWeakMappingGrayBitsTracer::trace(JSObject*, JS::GCCellPtr` 0; `js::PromiseObject::resolve(JSContext*, JS::Handle<js::Promis` 0
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 6 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 2, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 2, GC / CC 1, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `sendmsg [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 117, DOM Worker 46, Renderer 12, BgPool 7, IPC I/O 4, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, other 1, SwComposite 1, Socket 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 117 ms (0.7% of span): GC / CC 74, JavaScript 14, Idle 11, Layout 6, DOM 5, Other 3
  - JS leaf 0 / native under JS 26 / native 90; buckets: ipc 117, gc_cc 80, poll_wait 13, paint_layout 11, harness_diagnostics 10, array_buffer_copy 7, subprocess_pipe_io 4, json_metadata 3
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 19; `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 5; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNat` 4; `unsigned long js::gc::Arena::finalize<JSObject, (js::gc::Fin` 4
  - GC/CC markers: GCMajor 2× 136 ms, GCSlice 14× 66 ms, CCSlice 3× 7 ms, GCMinor 3× 0 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 12 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 7 ms (top self: `unlink [libc.so.6]` 4, `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 47 ms: buckets subprocess_pipe_io 47, worker_messaging 47, ipc 47, gc_cc 41, poll_wait 7, memcpy_memset 5; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 5; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4; `poll [libc.so.6]` 4; `std::unique_ptr<mozilla::ProfileBufferChunk, std::` 3
- **tab:3832** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Layout 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `mozilla::glean::HistogramIdForMetric(unsigned int) [libxul.s` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3356** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2
  - top self: `poll [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3338** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **66.8** (main 21.2, Renderer 19.6, DOM Worker 13.0, StyleThread# 3.3, Compositor 3.3) | AxioCEFProbe 53.7, cef:gpu-process 21.2, cef:utility 11.4, cef:renderer 9.8 | — | 569.7 |
| plain | idle | — | — | **5.8** (main 3.8, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 25.3 | **57.2** (Renderer 16.4, SwComposite 14.8, main 9.3, Backgro~Pool # 6.4, DOM Worker 3.9) | cef:gpu-process 16.0, AxioCEFProbe 12.1, cef:renderer 11.3, WebExtensions 0.6 | — | — |
| plain | raf-nosampler | — | — | **54.8** (Renderer 16.5, SwComposite 15.2, main 6.6, Backgro~Pool # 6.3, DOM Worker 4.0) | cef:gpu-process 15.2, cef:renderer 11.2, AxioCEFProbe 10.9, WebExtensions 0.3 | — | — |
| plain | scroll | 59.7 | 27.9 | **78.9** (main 21.0, Renderer 17.6, SwComposite 15.3, Backgro~Pool # 8.6, DOM Worker 8.6) | cef:gpu-process 60.5, AxioCEFProbe 14.3, cef:renderer 12.8 | — | — |
| plain | key | — | — | **15.4** (main 7.1, Renderer 2.2, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | AxioCEFProbe 2.6, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.8 | 12.1 | — |
| plain | switch-to-gecko | — | — | **73.1** (main 30.4, Renderer 12.2, TaskCon~ller # 6.1, BgIOThr~Pool # 6.1, WRRende~ckend# 6.1) |  | — | 133.4 |
| trace | switch-to-engine | — | — | **106.2** (Renderer 60.9, main 29.5, Backgro~Pool # 3.9, DOM Worker 3.9, Timer 2.0) | AxioCEFProbe 63.0, cef:gpu-process 25.6, cef:renderer 11.8, cef:utility 11.8 | — | 454.9 |
| trace | idle | — | — | **5.3** (main 3.8, Timer 1.0, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5 | — | — |
| trace | raf | 60.1 | 26.4 | **60.9** (Renderer 17.3, SwComposite 15.4, main 10.6, Backgro~Pool # 6.1, DOM Worker 3.5) | cef:gpu-process 17.0, AxioCEFProbe 12.5, cef:renderer 12.2, cef:zygote 0.3 | — | — |
| trace | raf-nosampler | — | — | **117.5** (DOM Worker 27.8, main 26.8, Renderer 16.5, SwComposite 14.5, IPDL Background 8.3) | cef:gpu-process 17.2, cef:renderer 12.6, AxioCEFProbe 10.2, WebExtensions 0.3 | — | — |
| trace | scroll | 59.5 | 26.7 | **81.1** (main 20.0, Renderer 17.2, SwComposite 14.8, DOM Worker 12.4, Backgro~Pool # 8.6) | cef:gpu-process 62.0, AxioCEFProbe 13.8, cef:renderer 13.8, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **15.3** (main 7.7, Renderer 2.2, SwComposite 1.9, DOM Worker 1.6, Timer 0.5) | AxioCEFProbe 3.2, cef:renderer 2.5, cef:gpu-process 0.5, Web Content 0.3 | 12.1 | — |
| trace | switch-to-gecko | — | — | **83.0** (main 29.7, Renderer 17.8, TaskCon~ller # 11.9, BgIOThr~Pool # 5.9, WRRende~ckend# 5.9) |  | — | 133.7 |
| profile | switch-to-engine | — | — | **68.6** (main 22.3, Renderer 12.0, DOM Worker 12.0, TaskCon~ller # 6.9, SamplerThread 6.9) | AxioCEFProbe 60.0, cef:gpu-process 20.5, Web Content 13.7, cef:renderer 10.3 | — | 532.7 |
| profile | idle | — | — | **24.1** (DOM Worker 8.5, SamplerThread 8.5, main 5.7, Timer 1.4) | Web Content 9.4, WebExtensions 1.9, Privileged Cont 1.9, RDD Process 1.4 | — | — |
| profile | raf | 60.0 | 22.6 | **95.0** (Renderer 19.7, SwComposite 17.2, main 15.9, DOM Worker 12.4, SamplerThread 12.4) | cef:gpu-process 18.7, cef:renderer 13.1, AxioCEFProbe 11.4, Web Content 9.8 | — | — |
| profile | raf-nosampler | — | — | **82.3** (Renderer 19.8, SwComposite 17.1, DOM Worker 13.2, SamplerThread 10.9, main 7.3) | cef:gpu-process 18.2, cef:renderer 11.6, AxioCEFProbe 11.2, Web Content 9.6 | — | — |
| profile | scroll | 60.1 | 22.6 | **111.4** (main 26.1, Renderer 21.4, SwComposite 17.7, DOM Worker 16.8, SamplerThread 10.7) | cef:gpu-process 68.0, cef:renderer 15.0, AxioCEFProbe 14.0, Web Content 9.4 | — | — |
| profile | key | — | — | **40.2** (main 11.4, DOM Worker 10.1, SamplerThread 9.5, Renderer 2.7, SwComposite 2.2) | Web Content 9.0, AxioCEFProbe 3.2, cef:renderer 2.5, WebExtensions 2.2 | 15.0 | — |
| profile | switch-to-gecko | — | — | **69.8** (main 16.1, Renderer 16.1, DOM Worker 10.7, SamplerThread 10.7, IPC I/O Parent 5.4) |  | — | 147.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 14.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf-nosampler | 58.6 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | scroll | 58.0 | 0.0 | 0 | 0.0 | — | — | 10.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 4.9 | 0.0 | 0 | 0.0 | — | — | 1.8 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.3 | 0.0 | 0 | 0.0 | — | — | 15.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 57.8 | 0.0 | 0 | 0.0 | — | — | 8.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.783 | 6.804 | 0.0119 | 0.0213 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 189 | 0.223 | 0.796 | 0.0134 | 0.0477 |
| plain | raf-nosampler | memfd | native | 184 | 184 | 0.214 | 0.776 | 0.0129 | 0.0467 |
| plain | scroll | memfd | native | 122 | 122 | 0.741 | 0.743 | 0.0426 | 0.0427 |
| plain | key | memfd | native | 21 | 21 | 0.059 | 0.837 | 0.0003 | 0.0048 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 3 | 3 | 2.712 | 6.764 | 0.0151 | 0.0375 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 189 | 189 | 0.225 | 0.770 | 0.0135 | 0.0462 |
| trace | raf-nosampler | memfd | native | 179 | 179 | 0.223 | 0.734 | 0.0130 | 0.0431 |
| trace | scroll | memfd | native | 123 | 123 | 0.713 | 0.731 | 0.0413 | 0.0424 |
| trace | key | memfd | native | 21 | 21 | 0.059 | 0.771 | 0.0003 | 0.0044 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 3.014 | 10.641 | 0.0147 | 0.0519 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 191 | 192 | 0.259 | 0.870 | 0.0155 | 0.0525 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.258 | 0.840 | 0.0154 | 0.0503 |
| profile | scroll | memfd | native | 126 | 126 | 0.821 | 0.942 | 0.0475 | 0.0545 |
| profile | key | memfd | native | 21 | 21 | 0.069 | 0.867 | 0.0004 | 0.0049 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 7.8 | 0.0 | — | — | — | — | — | — | — | — |
| profile | 0.6 | 10.5 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 34.3; spawn AxioCEFProbe resolved 50.5; write hello 53.7; first stdout read resolved 294.0; write create 295.2; write frame_ack 479.9; write focus 484.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 25.0; first stdout read resolved 35.4; write shutdown 36.6

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 57.7; spawn AxioCEFProbe resolved 108.5; write hello 111.8; first stdout read resolved 344.9; write create 348.0; write frame_ack 547.4; write focus 565.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 37.3; first stdout read resolved 47.2; write shutdown 54.3

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 131, Renderer 87, DOM Worker 43, BgPool 25, WRRenderBackend 8, SwComposite 6, Compositor 6, WRSceneBuilder 4, IPC I/O 2, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 131 ms (21.3% of span): GC / CC 40, Layout 33, JavaScript 25, Idle 16, Other 6, DOM 6
  - JS leaf 4 / native under JS 34 / native 93; buckets: ipc 131, gc_cc 68, paint_layout 40, poll_wait 21, worker_messaging 13, array_buffer_copy 9, harness_diagnostics 8, engine_stream_read 6
  - top self: `poll [libc.so.6]` 16; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 10; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `__lll_lock_wait [libc.so.6]` 5; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4
  - GC/CC markers: GCMajor 1× 94 ms, GCSlice 9× 57 ms, CCSlice 1× 14 ms, GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 87 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 27, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 14, `ClearTexSubImage [libxul.so]` 9); WRRenderBackend#0 8 ms (top self: `syscall [libc.so.6]` 7, `sched_yield [libc.so.6]` 1); SwComposite 6 ms (top self: `syscall [libc.so.6]` 6)
  - background pools (native receiver queue): BackgroundThreadPool #1 25 ms (top self: `ARGBSetRow_X86 [libxul.so]` 11, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 8, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 43 ms: buckets subprocess_pipe_io 43, worker_messaging 43, ipc 43, poll_wait 36, js_ctypes 36, gc_cc 3; top self: `poll [libc.so.6]` 34; `nsCycleCollector_maybeDoDeferredDeletion() [libxul` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `__GI__Fork [libc.so.6]` 1
- **tab:4151** CPU ms by thread group: main 49, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (8.0% of span): Other 39, JavaScript 5, DOM 4, Idle 1, GC / CC 1, Profiler 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: ipc 36, array_buffer_copy 18, gc_cc 14, subprocess_pipe_io 8, memcpy_memset 4, poll_wait 1, image_container 0
  - top self: `access [libc.so.6]` 4; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[libfontconfig.so.1]` 2; `mozilla::Vector<js::frontend::StencilModuleRequest, 0ul, js:` 2; `mozilla::Preferences::SetPreference(mozilla::dom::Pref const` 1
  - GC/CC markers: GCMinor 1× 5 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4035** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.6% of span): Idle 2, Other 1, Graphics 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 2, paint_layout 2, memcpy_memset 0
  - top self: `poll [libc.so.6]` 2; `sendmsg [libc.so.6]` 1; `[]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3560** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 114, main 94, other 20, BgPool 1, IPC I/O 1, Socket 1, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 94 ms (4.4% of span): Idle 80, JavaScript 8, Other 5, Profiler 2, DOM 0
  - JS leaf 0 / native under JS 8 / native 86; buckets: ipc 94, poll_wait 83, harness_diagnostics 5, array_buffer_copy 3, gc_cc 3, worker_messaging 0, engine_stream_read 0, json_metadata 0
  - top self: `poll [libc.so.6]` 81; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 1; `js::jit::MaybeTransition(JSContext*, js::jit::BaselineFrame*` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `PR_Now [libnspr4.so]` 1; `js::gc::BarrieredPtrImpl<JS::Value, 3u>::uncheckedSet(JS::Va` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `open64 [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 113 ms: buckets subprocess_pipe_io 113, js_ctypes 113, worker_messaging 113, ipc 113, poll_wait 113; top self: `poll [libc.so.6]` 113
- **tab:3560** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3542** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4146** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: Renderer 596, SwComposite 519, main 469, DOM Worker 309, BgPool 208, WRRenderBackend 64, Compositor 41, other 33, ImageBridge 17, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 469 ms (14.7% of span): Idle 263, JavaScript 77, GC / CC 65, Other 40, DOM 19, Profiler 5
  - JS leaf 5 / native under JS 85 / native 379; buckets: ipc 469, poll_wait 286, gc_cc 150, worker_messaging 46, engine_stream_read 43, json_metadata 26, subprocess_pipe_io 20, array_buffer_copy 16
  - top self: `poll [libc.so.6]` 265; `[unknown]` 17; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 16; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 7; `mprotect [libc.so.6]` 7
  - GC/CC markers: GCMajor 2× 1107 ms, GCSlice 16× 59 ms, CCSlice 5× 14 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 596 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 230, `int blendTextureNearestFast<false, glsl::sampler2D` 130, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 82); SwComposite 519 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 228, `syscall [libc.so.6]` 217, `__memmove_avx_unaligned_erms [libc.so.6]` 71); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 208 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 127, `__memmove_avx_unaligned_erms [libc.so.6]` 71, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 309 ms: buckets subprocess_pipe_io 309, worker_messaging 309, ipc 309, js_ctypes 285, poll_wait 276, gc_cc 8; top self: `poll [libc.so.6]` 276; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 3; `[unknown]` 3
- **tab:4035** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 5, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, gc_cc 5, poll_wait 2
  - top self: `poll [libc.so.6]` 1; `mozilla::services::GetObserverService() [libxul.so]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::Nursery::collect(JS::GCOptions, JS::GCReason) [libxul.so` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 571, SwComposite 509, DOM Worker 297, main 211, BgPool 196, WRRenderBackend 64, Compositor 40, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 138, JavaScript 41, Other 19, DOM 11, Profiler 2
  - JS leaf 5 / native under JS 45 / native 160; buckets: ipc 211, poll_wait 152, gc_cc 50, worker_messaging 29, engine_stream_read 25, subprocess_pipe_io 14, json_metadata 14, array_buffer_copy 13
  - top self: `poll [libc.so.6]` 140; `[unknown]` 8; `recvmsg [libc.so.6]` 4; `read [libc.so.6]` 3; `js::SharedImmutableStringsCache::getOrCreate(std::unique_ptr` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 571 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 193, `int blendTextureNearestFast<false, glsl::sampler2D` 163, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 70); SwComposite 509 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 251, `syscall [libc.so.6]` 176, `__memmove_avx_unaligned_erms [libc.so.6]` 81); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 196 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 111, `__memmove_avx_unaligned_erms [libc.so.6]` 78, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 16 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 297 ms: buckets subprocess_pipe_io 297, worker_messaging 297, ipc 297, js_ctypes 276, poll_wait 270, gc_cc 8; top self: `poll [libc.so.6]` 270; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 2; `mozilla::WidgetEvent::IsAllowedToDispatchInSystemG` 2; `__lll_lock_wake [libc.so.6]` 1
- **tab:4035** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 3, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 1
  - top self: `poll [libc.so.6]` 3; `fog_timing_distribution_accumulate_raw_nanos [libxul.so]` 1; `getrusage [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*)` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3542** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 515, Renderer 436, SwComposite 365, DOM Worker 299, BgPool 196, WRRenderBackend 50, Compositor 28, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 515 ms (23.7% of span): Idle 306, JavaScript 102, Other 57, DOM 20, Graphics 14, Layout 9
  - JS leaf 10 / native under JS 106 / native 399; buckets: ipc 515, poll_wait 365, gc_cc 106, worker_messaging 63, paint_layout 47, subprocess_pipe_io 36, array_buffer_copy 31, engine_stream_read 29
  - top self: `poll [libc.so.6]` 318; `write [libc.so.6]` 17; `[unknown]` 10; `__lll_lock_wake [libc.so.6]` 7; `js::jit::DoCallFallback(JSContext*, js::jit::BaselineFrame*,` 6; `[axiosozo-dev]` 5
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 436 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 245, `int blendTextureNearestFast<false, glsl::sampler2D` 46, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 43); SwComposite 365 ms (top self: `syscall [libc.so.6]` 243, `void scale_blit<true>(Texture&, IntRect const&, Te` 106, `__memmove_avx_unaligned_erms [libc.so.6]` 15); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 195 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 119, `__memmove_avx_unaligned_erms [libc.so.6]` 69, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::UseTextures(moz` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 299 ms: buckets subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 276, poll_wait 262, gc_cc 10; top self: `poll [libc.so.6]` 262; `__memset_avx2_unaligned_erms [libc.so.6]` 5; `write [libc.so.6]` 4; `[axiosozo-dev]` 2; `[unknown]` 2
- **tab:4151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4146** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 378, DOM Worker 273, Renderer 96, SwComposite 82, other 36, BgPool 21, Compositor 14, WRRenderBackend 13, WRSceneBuilder 8, IPC I/O 2, ImageBridge 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 378 ms (10.2% of span): Idle 161, JavaScript 80, Layout 40, Other 32, Graphics 24, DOM 23
  - JS leaf 10 / native under JS 133 / native 235; buckets: ipc 378, poll_wait 199, gc_cc 97, paint_layout 75, worker_messaging 64, engine_stream_read 42, subprocess_pipe_io 19, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 164; `[unknown]` 11; `[axiosozo-dev]` 7; `write [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `recvmsg [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 3 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 96 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `int blendTextureNearestFast<false, glsl::sampler2D` 24, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 15); SwComposite 82 ms (top self: `syscall [libc.so.6]` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 29, `__memmove_avx_unaligned_erms [libc.so.6]` 18); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 20 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__memmove_avx_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `Pickle::Pickle(unsigned int, unsigned long) [libxu` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `rename [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 242, poll_wait 238, gc_cc 6; top self: `poll [libc.so.6]` 237; `[unknown]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3458** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `[unknown]` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `JS::Compartment::wrap(JSContext*, JS::MutableHandle<JS::Valu` 0; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3542** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4151** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: Renderer 40, main 37, DOM Worker 16, BgPool 11, Compositor 3, WRRenderBackend 2, SwComposite 2, WRSceneBuilder 2, IPC I/O 1, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 37 ms (17.1% of span): JavaScript 15, Layout 12, Idle 6, Graphics 2, DOM 1, Profiler 1
  - JS leaf 2 / native under JS 26 / native 9; buckets: ipc 37, paint_layout 14, array_buffer_copy 12, gc_cc 10, harness_diagnostics 9, worker_messaging 6, poll_wait 6, subprocess_pipe_io 3
  - top self: `poll [libc.so.6]` 6; `write [libc.so.6]` 3; `#logEvent (resource://gre/modules/EventEmitter.sys.mjs:164:1` 2; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, ns` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `<style::properties_and_values::value::Value<Component> as co` 1
  - WebRender/compositor threads: Renderer 40 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 14, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 6); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::prepare::prepare_prim_for_render [libxu` 0, `sched_yield [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `unlink [libc.so.6]` 5, `rmdir [libc.so.6]` 2, `__open_nocancel [libc.so.6]` 1); BackgroundThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, poll_wait 15, js_ctypes 15, array_buffer_copy 1; top self: `poll [libc.so.6]` 15; `[linux-vdso.so.1]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:4035** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.8% of span): Idle 2, Other 1, Graphics 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `[]` 1; `mozilla::ipc::NodeController::SerializeEventMessage(std::uni` 0; `sendmsg [libc.so.6]` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message ` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3458** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **rdd:3466** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.2 | **8.8** (Renderer 2.9, main 2.4, DOM Worker 1.0, SwComposite 1.0, glean.dispatche 0.5) | Web Content 3.4, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **29.1** (Renderer 16.1, WRRende~ckend# 2.3, main 2.0, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.6, WebExtensions 0.7, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.9** (Renderer 9.3, WRRende~ckend# 2.0, main 1.7, glean.dispatche 1.7, WRScene~ilder# 1.3) | Isolated Web Co 3.7 | — | — |
| plain | scroll | 59.0 | 17.1 | **42.8** (Renderer 28.3, main 4.5, WRRende~ckend# 3.5, glean.dispatche 2.0, SwComposite 1.5) | Isolated Web Co 4.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.1** (main 4.3, Renderer 1.1, TaskCon~ller # 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.3, WebExtensions 0.3 | 9.0 | — |
| trace | idle | 59.3 | 17.1 | **7.9** (main 2.4, TaskCon~ller # 1.5, glean.dispatche 1.0, Renderer 1.0, IPC I/O Parent 0.5) | Isolated Web Co 2.0 | — | — |
| trace | raf | 59.0 | 17.1 | **17.3** (Renderer 9.2, WRRende~ckend# 2.3, glean.dispatche 1.6, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 3.9 | — | — |
| trace | raf-nosampler | — | — | **20.7** (Renderer 10.0, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 4.4 | — | — |
| trace | scroll | 59.0 | 17.1 | **46.3** (Renderer 28.8, main 6.0, WRRende~ckend# 3.5, SwComposite 2.0, WRScene~ilder# 1.5) | Isolated Web Co 5.5 | — | — |
| trace | key | — | — | **51.4** (main 18.4, DOM Worker 16.5, IPDL Background 6.4, TaskCon~ller # 2.4, StreamTrans # 2.1) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | 8.5 | — |
| profile | idle | 59.5 | 17.1 | **9.2** (SamplerThread 3.9, main 1.9, TaskCon~ller # 1.9, Timer 0.5, Socket Thread 0.5) | Web Content 10.2, Isolated Web Co 4.3, WebExtensions 2.4, Socket Process 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **29.8** (Renderer 11.1, SamplerThread 6.2, WRRende~ckend# 2.6, glean.dispatche 2.0, WRScene~ilder# 2.0) | Isolated Web Co 10.1, Web Content 8.5, Socket Process 1.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **28.3** (Renderer 11.3, SamplerThread 6.0, WRRende~ckend# 2.3, WRScene~ilder# 2.0, main 1.7) | Isolated Web Co 9.0, Web Content 8.0, Privileged Cont 1.7, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.2 | **63.8** (Renderer 33.1, main 8.4, SamplerThread 7.9, WRRende~ckend# 3.9, Compositor 2.5) | Isolated Web Co 10.4, Web Content 9.9, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **14.9** (main 5.3, SamplerThread 4.5, Renderer 1.1, Compositor 0.8, glean.dispatche 0.5) | Web Content 8.3, Isolated Web Co 4.1, WebExtensions 1.9, Privileged Cont 1.6 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 50, Compositor 2, DOM Worker 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (2.4% of span): GC / CC 29, Idle 7, Other 6, JavaScript 6, DOM 1, Graphics 1
  - JS leaf 0 / native under JS 7 / native 43; buckets: ipc 50, gc_cc 33, poll_wait 12, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 2, paint_layout 1, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 3; `[axiosozo-dev]` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 7× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, poll_wait 1, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:8377** CPU ms by thread group: main 25, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (1.2% of span): Idle 15, GC / CC 6, JavaScript 3, Other 1, Layout 0, Profiler 0
  - JS leaf 1 / native under JS 2 / native 22; buckets: ipc 23, poll_wait 15, gc_cc 7, harness_diagnostics 3, memcpy_memset 1, array_buffer_copy 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 16; `[]` 2; `PLDHashTable::MakeEntryHandle(void const*) [libxul.so]` 1; `js::gc::TraceEdgeInternal(JSTracer*, js::TaggedProto*, char ` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(J` 1; `next (self-hosted:392:27)[2]` 1
  - GC/CC markers: GCMajor 1× 19 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8312** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8468** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 318, WRRenderBackend 66, WRSceneBuilder 54, Compositor 46, main 30, SwComposite 19, IPC I/O 12, DOM Worker 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (1.0% of span): Idle 22, JavaScript 4, Layout 3, DOM 0, Other 0
  - JS leaf 0 / native under JS 3 / native 27; buckets: ipc 30, poll_wait 22, paint_layout 3, harness_diagnostics 3, array_buffer_copy 2, gc_cc 1, subprocess_pipe_io 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 22; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo c` 1; `js::DefineFunctions(JSContext*, JS::Handle<JSObject*>, JSFun` 1; `nsFlexContainerFrame::FlexLine::AddLastItemToMainSizeTotals(` 1; `nsIWidget::NeedsPaint() [libxul.so]` 1; `IntrinsicSizeOffsets(nsIFrame*, int, bool) [libxul.so]` 1
  - WebRender/compositor threads: Renderer 318 ms (top self: `__syscall_cancel_arch [libc.so.6]` 85, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 55, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 52); WRRenderBackend#0 66 ms (top self: `syscall [libc.so.6]` 53, `sched_yield [libc.so.6]` 4, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 48 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 1, poll_wait 1; top self: `madvise [libc.so.6]` 1; `js::gc::ArenaLists::mergeBackgroundSweptArenas() [` 1; `__syscall_cancel_arch [libc.so.6]` 1; `js::gc::AllocSpace<js::gc::SmallBufferRegion, 1638` 1; `munmap [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 168, IPC I/O 16, other 3, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 168 ms (5.5% of span): Idle 103, Graphics 25, Layout 17, Other 13, Profiler 5, JavaScript 4
  - JS leaf 0 / native under JS 8 / native 160; buckets: ipc 164, poll_wait 105, paint_layout 55, subprocess_pipe_io 4, canvas_2d 3, gc_cc 3, harness_diagnostics 3, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 111; `[]` 2; `peek_poke::poke_into_vec [libxul.so]` 1; `getcontext [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `__lll_lock_wait [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8465** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8312** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 318, WRRenderBackend 62, WRSceneBuilder 52, main 47, Compositor 44, SwComposite 13, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (1.5% of span): GC / CC 32, Idle 11, JavaScript 2, Other 1
  - JS leaf 0 / native under JS 2 / native 45; buckets: ipc 47, gc_cc 32, poll_wait 12, harness_diagnostics 2, array_buffer_copy 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScr` 2
  - GC/CC markers: GCSlice 6× 27 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 317 ms (top self: `__syscall_cancel_arch [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 83, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 41); WRRenderBackend#0 62 ms (top self: `syscall [libc.so.6]` 54, `sched_yield [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 1); WRSceneBuilder#0 45 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 4, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 152, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 152 ms (5.0% of span): Idle 94, Graphics 21, Layout 14, Other 9, Profiler 7, GC / CC 6
  - JS leaf 0 / native under JS 4 / native 148; buckets: ipc 144, poll_wait 95, paint_layout 43, gc_cc 7, subprocess_pipe_io 1, memcpy_memset 1, canvas_2d 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 98; `[]` 3; `getcontext [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8468** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8293** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 649, main 153, WRRenderBackend 80, SwComposite 39, Compositor 33, WRSceneBuilder 25, IPC I/O 9, BgPool 1, other 1, Socket 1, DOM Worker 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 153 ms (7.5% of span): Idle 73, GC / CC 36, Other 19, Graphics 9, JavaScript 7, Layout 5
  - JS leaf 0 / native under JS 9 / native 144; buckets: ipc 153, poll_wait 101, gc_cc 40, paint_layout 14, harness_diagnostics 5, array_buffer_copy 3, memcpy_memset 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 82; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `[axiosozo-dev]` 3; `mozilla::dom::CallbackObject::cycleCollection::CanSkipReal(v` 3; `nsLayoutUtils::GetParentOrPlaceholderForCrossDoc(nsIFrame co` 2
  - GC/CC markers: GCMajor 1× 79 ms, GCSlice 7× 28 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 649 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 203, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 104, `__syscall_cancel_arch [libc.so.6]` 59); WRRenderBackend#0 80 ms (top self: `syscall [libc.so.6]` 54, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 3, `webrender::batch::BatchBuilder::add_prim_to_batch ` 2); SwComposite 39 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `Composite [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `access [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, memcpy_memset 1, gc_cc 1, poll_wait 0; top self: `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 110, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 110 ms (5.4% of span): Idle 65, Graphics 21, Other 9, GC / CC 7, JavaScript 3, Layout 3
  - JS leaf 0 / native under JS 4 / native 106; buckets: ipc 106, poll_wait 65, paint_layout 26, gc_cc 12, canvas_2d 4, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 66; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsi` 2; `[]` 1; `peek_poke::poke_into_vec [libxul.so]` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8384** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8271** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 203, Renderer 35, Compositor 17, WRRenderBackend 17, WRSceneBuilder 14, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 203 ms (5.4% of span): Layout 47, Idle 44, GC / CC 31, Other 26, JavaScript 24, Graphics 24
  - JS leaf 1 / native under JS 28 / native 174; buckets: ipc 200, paint_layout 71, poll_wait 64, gc_cc 45, subprocess_pipe_io 8, array_buffer_copy 5, harness_diagnostics 4, memcpy_memset 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `[axiosozo-dev]` 5; `[unknown]` 3; `[linux-vdso.so.1]` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 25 ms, CCSlice 2× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 35 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `int blendTextureNearestFast<true, glsl::sampler2D_` 2); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8377** CPU ms by thread group: main 66, IPC I/O 7, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 66 ms (1.8% of span): Idle 25, Other 8, GC / CC 8, JavaScript 7, Layout 6, DOM 5
  - JS leaf 0 / native under JS 7 / native 59; buckets: ipc 60, poll_wait 25, paint_layout 16, gc_cc 10, harness_diagnostics 4, array_buffer_copy 4, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 26; `[]` 5; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*,` 1; `js::LifoAlloc::release(js::LifoAlloc::Mark) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8211** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 0; `[]` 0; `JSAutoNullableRealm::JSAutoNullableRealm(JSContext*, JSObjec` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8293** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **46.6** (Renderer 16.6, main 13.3, DOM Worker 9.9, glean.dispatche 1.7, Softwar~cThread 1.7) | WPEWebProcess 67.9, AxioWebKitHost 16.6, WPENetworkProce 9.9 | — | 580.0 |
| plain | idle | — | — | **7.3** (main 5.8, Timer 0.5, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.9 | — | — |
| plain | raf | 58.1 | 21.6 | **36.4** (main 12.7, Renderer 6.2, SwComposite 4.6, DOM Worker 3.3, TaskCon~ller # 2.9) | WPEWebProcess 63.2, AxioWebKitHost 7.1, Web Content 0.7, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **28.1** (Renderer 6.3, main 6.0, SwComposite 4.6, DOM Worker 3.0, Backgro~Pool # 2.3) | WPEWebProcess 65.1, AxioWebKitHost 7.2, Privileged Cont 1.0, WebExtensions 0.3 | — | — |
| plain | scroll | 57.3 | 33.4 | **45.3** (main 19.1, DOM Worker 6.9, Renderer 5.9, SwComposite 4.4, Backgro~Pool # 2.5) | WPEWebProcess 64.9, AxioWebKitHost 8.4 | — | — |
| plain | key | — | — | **17.1** (main 10.4, TaskCon~ller # 1.6, Timer 1.1, DOM Worker 1.1, Renderer 0.8) | WPEWebProcess 6.6, AxioWebKitHost 1.4 | 16.2 | — |
| plain | switch-to-gecko | — | — | **21.0** (main 8.4, BgIOThr~Pool # 4.2, Renderer 4.2, SwComposite 4.2) | Isolated Web Co 4.2 | — | 212.5 |
| trace | switch-to-engine | — | — | **51.1** (main 19.4, Renderer 15.8, TaskCon~ller # 7.0, DOM Worker 3.5, glean.dispatche 1.8) | WPEWebProcess 65.2, AxioWebKitHost 15.8, WPENetworkProce 10.6, bwrap 1.8 | — | 547.6 |
| trace | idle | — | — | **6.8** (main 5.3, Timer 1.0, Compositor 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.9 | 29.1 | **37.0** (main 13.4, Renderer 6.5, SwComposite 4.6, DOM Worker 3.3, Backgro~Pool # 2.0) | WPEWebProcess 63.2, AxioWebKitHost 7.2, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **104.2** (DOM Worker 26.8, main 22.5, IndexedDB IO # 19.2, IPDL Background 8.3, Renderer 6.3) | WPEWebProcess 63.1, AxioWebKitHost 6.6, WebExtensions 0.3, RDD Process 0.3 | — | — |
| trace | scroll | 57.4 | 30.5 | **49.7** (main 20.6, DOM Worker 8.3, Renderer 6.4, SwComposite 4.9, Backgro~Pool # 2.5) | WPEWebProcess 64.3, AxioWebKitHost 8.9 | — | — |
| trace | key | — | — | **15.5** (main 9.3, DOM Worker 1.9, Timer 1.1, SwComposite 0.8, Softwar~cThread 0.5) | WPEWebProcess 6.9, AxioWebKitHost 1.4 | 15.9 | — |
| trace | switch-to-gecko | — | — | **16.5** (main 8.3, BgIOThr~Pool # 4.1, Renderer 4.1) | Isolated Web Co 8.3 | — | 211.4 |
| profile | switch-to-engine | — | — | **31.2** (DOM Worker 14.0, SamplerThread 7.8, main 6.2, IPC I/O Parent 1.6, IPDL Background 1.6) | WPEWebProcess 62.1, Web Content 24.9, AxioWebKitHost 17.1, WPENetworkProce 9.3 | — | 615.2 |
| profile | idle | — | — | **28.5** (SamplerThread 8.7, DOM Worker 8.2, main 7.7, Timer 2.4, glean.dispatche 0.5) | Web Content 10.1, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 57.9 | 21.6 | **67.0** (main 18.8, DOM Worker 11.0, SamplerThread 11.0, Renderer 7.1, SwComposite 4.9) | WPEWebProcess 65.1, Web Content 9.1, AxioWebKitHost 7.4, Privileged Cont 2.2 | — | — |
| profile | raf-nosampler | — | — | **52.6** (DOM Worker 11.6, SamplerThread 9.9, main 8.6, Renderer 7.3, SwComposite 5.3) | WPEWebProcess 64.3, Web Content 8.9, AxioWebKitHost 7.7, Privileged Cont 2.0 | — | — |
| profile | scroll | 55.8 | 33.6 | **74.0** (main 26.3, DOM Worker 14.1, SamplerThread 10.7, Renderer 6.8, SwComposite 4.4) | WPEWebProcess 65.2, Web Content 9.7, AxioWebKitHost 8.8, WebExtensions 1.9 | — | — |
| profile | key | — | — | **39.6** (main 14.0, SamplerThread 9.9, DOM Worker 9.6, Timer 2.2, Renderer 0.8) | Web Content 9.9, WPEWebProcess 7.1, WebExtensions 2.7, Privileged Cont 1.9 | 17.6 | — |
| profile | switch-to-gecko | — | — | **36.0** (main 12.0, DOM Worker 8.0, BgIOThr~Pool # 4.0, Renderer 4.0, ImageBridgeChld 4.0) | Isolated Web Co 8.0, Web Content 4.0 | — | 217.0 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.4 | 0.0 | 0 | 0.0 | — | — | 113.5 | 0.0 | — | 0.69 | 0.32 | — | — | — | — | — | 0.001 |
| trace | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.17 | 0.13 | — | — | — | — | — | 0.009 |
| trace | raf-nosampler | 56.5 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.15 | 0.14 | — | — | — | — | — | 0.008 |
| trace | scroll | 55.1 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 0.27 | 0.12 | — | — | — | — | — | 0.007 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.9 | 0.0 | — | 0.09 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 3.0 | 0.0 | 0 | 0.0 | — | — | 127.3 | 0.0 | — | 0.75 | 0.54 | — | — | — | — | — | 0.002 |
| profile | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.20 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.17 | 0.17 | — | — | — | — | — | 0.013 |
| profile | scroll | 53.5 | 0.0 | 0 | 0.0 | — | — | 12.7 | 0.0 | — | 0.30 | 0.16 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 6.8 | 0.0 | — | 0.13 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.778 | 1.174 | 0.0025 | 0.0038 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.067 | 0.242 | 0.0039 | 0.0141 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.043 | 0.241 | 0.0025 | 0.0140 |
| plain | scroll | memfd | native | 112 | 112 | 0.194 | 0.208 | 0.0106 | 0.0113 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.242 | 0.0000 | 0.0013 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.432 | 0.995 | 0.0015 | 0.0034 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 179 | 179 | 0.066 | 0.226 | 0.0039 | 0.0131 |
| trace | raf-nosampler | memfd | native | 173 | 173 | 0.045 | 0.234 | 0.0025 | 0.0133 |
| trace | scroll | memfd | native | 113 | 113 | 0.164 | 0.199 | 0.0090 | 0.0110 |
| trace | key | memfd | native | 20 | 20 | 0.000 | 0.209 | 0.0000 | 0.0011 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.500 | 0.723 | 0.0015 | 0.0022 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 181 | 181 | 0.075 | 0.252 | 0.0043 | 0.0146 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.052 | 0.238 | 0.0030 | 0.0138 |
| profile | scroll | memfd | native | 111 | 111 | 0.172 | 0.213 | 0.0092 | 0.0114 |
| profile | key | memfd | native | 20 | 20 | 0.000 | 0.245 | 0.0000 | 0.0013 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 12.8 | 0.0 | — | 0.09 | 0.31 | — | — | 88.3 | 13.5 | 115.6 |
| profile | 0.6 | 14.0 | 0.1 | — | 0.13 | 0.51 | — | — | 85.8 | 15.0 | 102.6 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 19.2; spawn AxioWebKitHost resolved 30.2; write hello 41.8; first stdout read resolved 98.5; write create 99.9; first frame applied (native receiver) 560.0; write frame_ack 560.5; write visibility 564.4; write focus 564.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 18.2; first stdout read resolved 23.3

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 35.1; spawn AxioWebKitHost resolved 54.6; write hello 61.2; first stdout read resolved 133.5; write create 136.8; first frame applied (native receiver) 631.7; write frame_ack 632.6; write visibility 640.1; write focus 640.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 28.7; first stdout read resolved 37.1

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 60, main 41, Renderer 9, BgPool 3, Compositor 3, IPC I/O 3, WRSceneBuilder 2, WRRenderBackend 2, SwComposite 1, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 41 ms (6.2% of span): Idle 13, JavaScript 12, Layout 7, DOM 3, Graphics 2, Other 2
  - JS leaf 3 / native under JS 18 / native 21; buckets: ipc 41, poll_wait 15, gc_cc 12, paint_layout 10, harness_diagnostics 8, array_buffer_copy 7, subprocess_pipe_io 4, engine_stream_read 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 16; `int nsLayoutUtils::ResolveToLength<false>(mozilla::StyleLeng` 2; `[axiosozo-dev]` 2; `delimitedRead (chrome://remote/content/marionette/stream-uti` 1; `next (self-hosted:392:27)[5]` 1; `style::bloom::StyleBloom<E>::push_internal [libxul.so]` 1
  - WebRender/compositor threads: Renderer 9 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `hypotf@@GLIBC_2.35 [libm.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0, `webrender::scene_building::SceneBuilder::finalize_` 0); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::request [l` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 60 ms: buckets subprocess_pipe_io 60, worker_messaging 60, ipc 60, poll_wait 53, js_ctypes 53, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 53; `[unknown]` 2; `mozilla::profiler::detail::CopyToRightSizedBuffer(` 2; `mprotect [libc.so.6]` 1; `MaybeCallMethod(JSContext*, JS::Handle<JSObject*>,` 1
- **tab:7802** CPU ms by thread group: main 40, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (6.8% of span): Other 26, Profiler 7, JavaScript 3, DOM 2, Idle 2, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 36; buckets: ipc 30, array_buffer_copy 12, gc_cc 7, poll_wait 2, subprocess_pipe_io 1, image_container 1, memcpy_memset 1
  - top self: `[]` 5; `[libfontconfig.so.1]` 3; `syscall [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7806** CPU ms by thread group: main 9, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (1.3% of span): DOM 4, Other 3, JavaScript 1, Idle 1
  - JS leaf 0 / native under JS 4 / native 4; buckets: ipc 9, gc_cc 6, array_buffer_copy 1, poll_wait 1, subprocess_pipe_io 1, image_container 1
  - top self: `mozilla::extensions::WebExtensionContentScript::WebExtension` 2; `__syscall_cancel_arch [libc.so.6]` 1; `[]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7712** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.2% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::dom::Element::DescribeAttribute(unsigned int, nsTSu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 152, DOM Worker 111, other 21, Compositor 1, Renderer 1, Socket 1, SwComposite 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 152 ms (7.3% of span): Idle 122, JavaScript 13, Other 10, DOM 4, GC / CC 2, Profiler 1
  - JS leaf 1 / native under JS 16 / native 136; buckets: ipc 152, poll_wait 126, harness_diagnostics 15, gc_cc 6, array_buffer_copy 6, engine_stream_read 3, subprocess_pipe_io 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 125; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[unknown]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::BaseShape*>,` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 0, `__syscall_cancel_arch [libc.so.6]` 0); SwComposite 1 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 110 ms: buckets subprocess_pipe_io 110, js_ctypes 110, worker_messaging 110, ipc 110, poll_wait 110; top self: `__syscall_cancel_arch [libc.so.6]` 110
- **tab:7350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7369** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7712** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 542, DOM Worker 259, Renderer 221, SwComposite 147, BgPool 62, WRRenderBackend 56, Compositor 39, other 32, ImageBridge 17, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 542 ms (17.4% of span): Idle 281, GC / CC 98, JavaScript 77, Other 55, DOM 25, Profiler 4
  - JS leaf 8 / native under JS 91 / native 443; buckets: ipc 539, poll_wait 312, gc_cc 174, engine_stream_read 55, harness_diagnostics 33, worker_messaging 30, array_buffer_copy 19, subprocess_pipe_io 19
  - top self: `__syscall_cancel_arch [libc.so.6]` 309; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 16; `[unknown]` 14; `[axiosozo-dev]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `NS_CycleCollectorSuspect3 [libxul.so]` 5
  - GC/CC markers: GCMajor 1× 104 ms, GCSlice 13× 60 ms, CCSlice 14× 51 ms, GCMinor 1× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 221 ms (top self: `__syscall_cancel_arch [libc.so.6]` 136, `int blendTextureNearestFast<false, glsl::sampler2D` 23, `syscall [libc.so.6]` 15); SwComposite 147 ms (top self: `syscall [libc.so.6]` 112, `void scale_blit<true>(Texture&, IntRect const&, Te` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 62 ms (top self: `__syscall_cancel_arch [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `[linux-vdso.so.1]` 0, `mozilla::ThreadEventQueue::GetEvent(bool, mozilla:` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 259 ms: buckets subprocess_pipe_io 259, worker_messaging 259, ipc 259, js_ctypes 233, poll_wait 226, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 229; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `[unknown]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `EnterJit(JSContext*, js::RunState&, unsigned char*` 1
- **tab:7712** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, gc_cc 4, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `js::gc::StoreBuffer::SlotsEdge::trace(js::gc::TenuringTracer` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 1; `non-virtual thunk to nsDocShell::GetInProcessChildCount(int*` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7718** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 252, main 242, Renderer 201, SwComposite 146, BgPool 56, WRRenderBackend 52, Compositor 37, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 242 ms (7.9% of span): Idle 115, JavaScript 68, GC / CC 31, Other 17, DOM 6, Profiler 4
  - JS leaf 6 / native under JS 65 / native 170; buckets: ipc 242, poll_wait 127, gc_cc 107, engine_stream_read 53, worker_messaging 30, subprocess_pipe_io 15, native_receiver 11, array_buffer_copy 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 126; `[unknown]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 4; `mprotect [libc.so.6]` 3; `[axiosozo-dev]` 3
  - GC/CC markers: GCMajor 1× 54 ms, GCSlice 9× 31 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 201 ms (top self: `__syscall_cancel_arch [libc.so.6]` 107, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 24, `int blendTextureNearestFast<false, glsl::sampler2D` 23); SwComposite 146 ms (top self: `syscall [libc.so.6]` 99, `void scale_blit<true>(Texture&, IntRect const&, Te` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::picture::PictureInstance::take_context ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 16 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `__lll_lock_wake [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 252 ms: buckets subprocess_pipe_io 252, worker_messaging 252, ipc 252, js_ctypes 232, poll_wait 227, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 227; `[unknown]` 2; `getcontext [libc.so.6]` 1; `js::BoundFunctionObject::call(JSContext*, unsigned` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7712** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `bool TraversalTracer::onEdge<js::Scope>(js::Scope**, char co` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `nsCycleCollector::ScanRoots(bool) [libxul.so]` 0; `js::StringPrinter::put(char const*, unsigned long) [libxul.s` 0
  - GC/CC markers: GCMajor 1× 50 ms, CCSlice 1× 2 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7328** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7718** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 518, DOM Worker 237, Renderer 130, SwComposite 85, BgPool 47, WRRenderBackend 35, Compositor 24, other 21, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 518 ms (25.0% of span): Idle 287, JavaScript 85, Other 60, GC / CC 29, DOM 28, Graphics 14
  - JS leaf 9 / native under JS 98 / native 411; buckets: ipc 515, poll_wait 355, gc_cc 104, engine_stream_read 57, worker_messaging 43, paint_layout 39, harness_diagnostics 31, array_buffer_copy 23
  - top self: `__syscall_cancel_arch [libc.so.6]` 313; `[unknown]` 19; `[axiosozo-dev]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 903 ms, GCSlice 8× 31 ms, GCMinor 2× 4 ms
  - WebRender/compositor threads: Renderer 130 ms (top self: `__syscall_cancel_arch [libc.so.6]` 86, `int blendTextureNearestFast<false, glsl::sampler2D` 13, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); SwComposite 85 ms (top self: `syscall [libc.so.6]` 74, `void scale_blit<true>(Texture&, IntRect const&, Te` 9, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 46 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `[linux-vdso.so.1]` 0); ImageBridgeChld 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 237 ms: buckets subprocess_pipe_io 237, worker_messaging 237, ipc 237, js_ctypes 201, poll_wait 191, gc_cc 11; top self: `__syscall_cancel_arch [libc.so.6]` 194; `[axiosozo-dev]` 5; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[unknown]` 3; `getcontext [libc.so.6]` 2
- **tab:7718** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7328** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7369** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 476, DOM Worker 236, other 37, Renderer 32, SwComposite 25, Compositor 13, WRRenderBackend 11, WRSceneBuilder 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 476 ms (13.0% of span): Idle 215, JavaScript 85, Other 44, Layout 38, DOM 38, Graphics 24
  - JS leaf 11 / native under JS 152 / native 314; buckets: ipc 474, poll_wait 259, gc_cc 111, paint_layout 76, engine_stream_read 66, worker_messaging 58, harness_diagnostics 31, subprocess_pipe_io 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 231; `[unknown]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[axiosozo-dev]` 9; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `mozilla::dom::Document::CreateRange(mozilla::ErrorResult&) [` 4
  - GC/CC markers: GCSlice 5× 23 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `glsl::texture(glsl::sampler2DRect_impl*, glsl::vec` 2); SwComposite 25 ms (top self: `syscall [libc.so.6]` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `void mozilla::MozPromise<mozilla::dom::WriteJSONRe` 1, `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 236 ms: buckets subprocess_pipe_io 236, worker_messaging 236, ipc 236, js_ctypes 227, poll_wait 222, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 223; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `js::TypedArrayObject::ensureHasBuffer(JSContext*, ` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7274** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::CheckIdleMemoryCleanupNeeded(nsITimer*, void*) [lib` 0; `[unknown]` 0; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7369** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 82, Renderer 23, DOM Worker 13, BgPool 11, Compositor 4, WRRenderBackend 3, IPC I/O 3, WRSceneBuilder 2, SwComposite 1, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 82 ms (27.6% of span): JavaScript 36, Layout 12, Graphics 9, Other 8, Idle 7, GC / CC 6
  - JS leaf 3 / native under JS 44 / native 36; buckets: ipc 82, gc_cc 23, paint_layout 21, array_buffer_copy 16, harness_diagnostics 13, poll_wait 9, engine_stream_read 5, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `mprotect [libc.so.6]` 6; `round [libxul.so]` 3; `[axiosozo-dev]` 3; `XRE_IsParentProcess() [libxul.so]` 3; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 2
  - GC/CC markers: CCSlice 1× 6 ms
  - WebRender/compositor threads: Renderer 23 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `hypotf@@GLIBC_2.35 [libm.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `mozilla::wr::RenderThread::WrNotifierEvent_NewFram` 1, `webrender::batch::BatchBuilder::add_prim_to_batch:` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `<webrender_bindings::bindings::APZCallbacks as web` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 11 ms (top self: `unlink [libc.so.6]` 6, `rmdir [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, poll_wait 12, js_ctypes 12, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 12; `mozilla::dom::CallSetup::CallSetup(mozilla::dom::C` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0
- **tab:7712** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (8.6% of span): Other 10, JavaScript 7, Idle 4, DOM 2, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 19; buckets: ipc 23, paint_layout 10, gc_cc 9, subprocess_pipe_io 7, poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[]` 2; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(` 2; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo c` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7274** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `FulfillMaybeWrappedPromise(JSContext*, JS::Handle<JSObject*>` 1; `js::jit::CallIRGenerator::tryAttachCallScripted(JS::Handle<J` 0; `mozilla::dom::danger::GetJSContext() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7806** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **40.3** (main 14.5, Renderer 11.3, DOM Worker 9.7, glean.dispatche 1.6, TaskCon~ller # 1.6) | WPEWebProcess 77.5, AxioWebKitHost 16.1, WPENetworkProce 9.7 | — | 595.3 |
| plain | idle | — | — | **7.3** (main 6.3, Timer 1.0) | Web Content 4.8, AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.1 | 25.7 | **61.5** (Renderer 18.0, SwComposite 14.2, main 12.9, Backgro~Pool # 5.2, DOM Worker 4.2) | WPEWebProcess 180.6, AxioWebKitHost 19.6, WebExtensions 0.6, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **55.3** (Renderer 17.9, SwComposite 13.9, main 7.3, Backgro~Pool # 5.3, DOM Worker 4.3) | WPEWebProcess 179.9, AxioWebKitHost 19.2, WebExtensions 0.7, Privileged Cont 0.3 | — | — |
| plain | scroll | 57.4 | 27.9 | **79.6** (main 22.5, Renderer 17.2, SwComposite 13.9, DOM Worker 11.0, Backgro~Pool # 6.7) | WPEWebProcess 182.8, AxioWebKitHost 20.6, Web Content 0.5 | — | — |
| plain | key | — | — | **17.6** (main 9.0, Renderer 2.5, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 16.9, AxioWebKitHost 1.7 | 25.3 | — |
| plain | switch-to-gecko | — | — | **29.6** (main 12.7, Renderer 8.5, SwComposite 4.2, DOM Worker 4.2) | Isolated Web Co 4.2 | — | 213.2 |
| trace | switch-to-engine | — | — | **78.4** (Renderer 49.9, main 20.0, Timer 1.7, BgIOThr~Pool # 1.7, WRRende~ckend# 1.7) | WPEWebProcess 73.3, AxioWebKitHost 16.6, WPENetworkProce 10.0, bwrap 1.7 | — | 576.5 |
| trace | idle | — | — | **7.8** (main 5.8, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 2.9, forkserver 0.5, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.9 | 32.1 | **62.0** (Renderer 18.4, SwComposite 14.2, main 13.6, Backgro~Pool # 5.5, DOM Worker 3.9) | WPEWebProcess 180.4, AxioWebKitHost 17.7 | — | — |
| trace | raf-nosampler | — | — | **130.5** (DOM Worker 32.4, main 24.4, IndexedDB IO # 18.2, Renderer 16.2, SwComposite 12.2) | WPEWebProcess 179.4, AxioWebKitHost 18.5, Web Content 0.3 | — | — |
| trace | scroll | 55.2 | 34.2 | **78.5** (main 22.4, Renderer 17.2, SwComposite 13.4, DOM Worker 11.4, Backgro~Pool # 6.7) | WPEWebProcess 178.8, AxioWebKitHost 19.6, Isolated Web Co 1.0 | — | — |
| trace | key | — | — | **20.5** (main 9.3, DOM Worker 3.0, Renderer 2.7, SwComposite 1.9, Timer 0.8) | WPEWebProcess 17.7, AxioWebKitHost 1.9 | 25.2 | — |
| trace | switch-to-gecko | — | — | **60.2** (main 24.1, TaskCon~ller # 12.1, Renderer 8.0, IPDL Background 4.0, BgIOThr~Pool # 4.0) | Isolated Web Co 4.0 | — | 213.9 |
| profile | switch-to-engine | — | — | **39.3** (main 13.1, DOM Worker 11.8, SamplerThread 7.9, TaskCon~ller # 2.6, Renderer 1.3) | WPEWebProcess 65.4, Web Content 45.8, AxioWebKitHost 17.0, WPENetworkProce 9.2 | — | 726.4 |
| profile | idle | — | — | **29.8** (main 9.1, SamplerThread 9.1, DOM Worker 8.7, Timer 1.4, TaskCon~ller # 1.0) | Web Content 9.6, Socket Process 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 57.8 | 24.5 | **90.3** (main 20.1, Renderer 18.9, SwComposite 14.8, DOM Worker 10.7, SamplerThread 8.8) | WPEWebProcess 183.7, AxioWebKitHost 20.2, Web Content 8.8, WebExtensions 1.9 | — | — |
| profile | raf-nosampler | — | — | **75.4** (Renderer 19.5, SwComposite 15.2, DOM Worker 10.9, SamplerThread 9.3, main 7.6) | WPEWebProcess 184.7, AxioWebKitHost 20.4, Web Content 8.9, Socket Process 1.7 | — | — |
| profile | scroll | 54.7 | 31.7 | **95.1** (main 27.2, Renderer 16.7, DOM Worker 15.3, SwComposite 12.9, SamplerThread 8.6) | WPEWebProcess 180.9, AxioWebKitHost 21.1, Web Content 8.1, Isolated Web Co 1.9 | — | — |
| profile | key | — | — | **44.4** (main 13.9, SamplerThread 9.8, DOM Worker 9.0, Renderer 3.0, SwComposite 2.7) | WPEWebProcess 18.3, Web Content 9.8, WebExtensions 2.5, Privileged Cont 2.2 | 28.0 | — |
| profile | switch-to-gecko | — | — | **44.0** (main 16.0, Renderer 8.0, DOM Worker 8.0, SamplerThread 8.0, BgIOThr~Pool # 4.0) | Isolated Web Co 4.0 | — | 219.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.2 | 0.0 | 0 | 0.0 | — | — | 120.6 | 0.0 | — | 1.45 | 0.42 | — | — | — | — | — | 0.001 |
| trace | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.34 | 0.14 | — | — | — | — | — | 0.010 |
| trace | raf-nosampler | 55.1 | 0.0 | 0 | 0.0 | — | — | 14.7 | 0.0 | — | 0.47 | 0.17 | — | — | — | — | — | 0.020 |
| trace | scroll | 53.0 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 0.74 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 14.5 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 3.8 | 0.0 | 0 | 0.0 | — | — | 0.8 | 0.0 | — | 1.71 | 0.35 | — | — | — | — | — | 0.002 |
| profile | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 15.1 | 0.0 | — | 0.50 | 0.19 | — | — | — | — | — | 0.019 |
| profile | raf-nosampler | 57.7 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.41 | 0.18 | — | — | — | — | — | 0.014 |
| profile | scroll | 51.5 | 0.0 | 0 | 0.0 | — | — | 8.5 | 0.0 | — | 1.03 | 0.18 | — | — | — | — | — | 0.016 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 14.4 | 0.0 | — | 0.14 | 0.17 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.371 | 2.031 | 0.0043 | 0.0064 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 181 | 181 | 0.222 | 0.698 | 0.0128 | 0.0403 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.219 | 0.682 | 0.0126 | 0.0393 |
| plain | scroll | memfd | native | 115 | 115 | 0.639 | 0.709 | 0.0349 | 0.0387 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.672 | 0.0000 | 0.0037 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 1.277 | 1.786 | 0.0041 | 0.0058 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 182 | 182 | 0.255 | 0.718 | 0.0148 | 0.0417 |
| trace | raf-nosampler | memfd | native | 169 | 169 | 0.258 | 1.048 | 0.0142 | 0.0578 |
| trace | scroll | memfd | native | 112 | 112 | 0.636 | 0.766 | 0.0337 | 0.0406 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.672 | 0.0000 | 0.0036 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 1.361 | 2.189 | 0.0052 | 0.0084 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.263 | 0.964 | 0.0152 | 0.0556 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.260 | 0.835 | 0.0150 | 0.0482 |
| profile | scroll | memfd | native | 109 | 109 | 0.813 | 1.058 | 0.0419 | 0.0545 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.747 | 0.0000 | 0.0040 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 22.0 | 0.0 | — | 0.10 | 0.35 | — | — | 159.3 | 22.8 | 182.0 |
| profile | 0.6 | 24.5 | 0.1 | — | 0.14 | 0.50 | — | — | 159.4 | 25.7 | 185.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 23.4; spawn AxioWebKitHost resolved 35.3; write hello 37.8; first stdout read resolved 100.8; write create 104.6; first frame applied (native receiver) 592.5; write frame_ack 593.1; write visibility 597.1; write focus 597.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 17.8; first stdout read resolved 25.0

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 29.0; spawn AxioWebKitHost resolved 51.5; write hello 55.6; first stdout read resolved 162.5; write create 164.9; first frame applied (native receiver) 735.1; write frame_ack 735.8; write visibility 745.9; write focus 746.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 27.8; first stdout read resolved 36.0

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 85, DOM Worker 57, Renderer 31, BgPool 11, SwComposite 7, IPC I/O 3, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 85 ms (10.9% of span): GC / CC 32, JavaScript 22, Idle 11, DOM 9, Layout 5, Profiler 3
  - JS leaf 1 / native under JS 32 / native 52; buckets: ipc 85, gc_cc 60, poll_wait 13, engine_stream_read 13, array_buffer_copy 12, worker_messaging 11, paint_layout 9, harness_diagnostics 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `u_charType_78 [libxul.so]` 4; `[axiosozo-dev]` 3; `js::Shape::replaceShape(JSContext*, JS::Handle<JSObject*>, j` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 113 ms, GCSlice 5× 54 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 11, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `int blendTextureNearestFast<false, glsl::sampler2D` 4); SwComposite 7 ms (top self: `syscall [libc.so.6]` 4, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `webrender::texture_cache::TextureCache::request [l` 0, `__lll_lock_wait [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #4 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 7, `ARGBSetRow_X86 [libxul.so]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `mozilla::detail::MutexImpl::MutexImpl() [axiosozo-` 0)
  - busiest DOM Worker 57 ms: buckets subprocess_pipe_io 57, worker_messaging 57, ipc 57, poll_wait 39, js_ctypes 39, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 39; `js::jit::CacheIRWriter::copyStubData(unsigned char` 3; `[axiosozo-dev]` 3; `js::NativeObject::create(JSContext*, js::gc::Alloc` 3; `getcontext [libc.so.6]` 3
- **tab:9369** CPU ms by thread group: main 50, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 50 ms (7.7% of span): Other 40, JavaScript 4, DOM 3, Profiler 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 45; buckets: ipc 38, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 4, poll_wait 1, memcpy_memset 1
  - top self: `[]` 6; `__read_nocancel [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `[libexpat.so.1]` 2; `nsTArray_base<nsTArray_RelocateUsingMemutils>::ShrinkCapacit` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9373** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (6.9% of span): Other 37, DOM 4, JavaScript 4, Profiler 3, GC / CC 1, Idle 0
  - JS leaf 0 / native under JS 4 / native 43; buckets: ipc 35, array_buffer_copy 17, gc_cc 16, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 0
  - top self: `__strlen_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[libexpat.so.1]` 3; `PR_Free [libnspr4.so]` 2; `js::gc::StoreBuffer::enable() [libxul.so]` 2; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9277** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.2% of span): Idle 2, Layout 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 175, DOM Worker 110, other 23, Renderer 2, SwComposite 2, Compositor 2, BgPool 1, Socket 1, IPC I/O 1, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 175 ms (8.4% of span): Idle 127, JavaScript 19, Other 14, DOM 7, GC / CC 5, Profiler 3
  - JS leaf 2 / native under JS 23 / native 151; buckets: ipc 174, poll_wait 132, harness_diagnostics 19, gc_cc 15, array_buffer_copy 9, engine_stream_read 4, native_receiver 1, worker_messaging 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 132; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `nsTHashtable<nsBaseHashtableET<nsCStringHashKey, RefPtr<mozi` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `mozilla::CycleCollectedJSRuntime::TraverseGCThing(mozilla::C` 2
  - GC/CC markers: CCSlice 2× 6 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 1); SwComposite 2 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `core::ptr::drop_in_place<webrender::prim_store::pi` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `fstatat64 [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 109 ms: buckets subprocess_pipe_io 109, js_ctypes 109, worker_messaging 109, ipc 109, poll_wait 109; top self: `__syscall_cancel_arch [libc.so.6]` 109
- **tab:8911** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9283** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 595, Renderer 567, SwComposite 441, DOM Worker 278, BgPool 174, WRRenderBackend 63, Compositor 44, other 33, ImageBridge 19, WRSceneBuilder 8, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 595 ms (18.5% of span): Idle 352, JavaScript 109, Other 53, GC / CC 41, DOM 30, Profiler 9
  - JS leaf 13 / native under JS 123 / native 459; buckets: ipc 592, poll_wait 382, gc_cc 138, engine_stream_read 78, worker_messaging 54, harness_diagnostics 53, subprocess_pipe_io 33, array_buffer_copy 29
  - top self: `__syscall_cancel_arch [libc.so.6]` 383; `[unknown]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 11; `[axiosozo-dev]` 6; `mozilla::EventListenerManager::HandleEventInternal(nsPresCon` 6; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 5
  - GC/CC markers: GCMajor 2× 1708 ms, GCSlice 18× 95 ms, CCSlice 6× 19 ms, GCMinor 3× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 567 ms (top self: `__syscall_cancel_arch [libc.so.6]` 295, `int blendTextureNearestFast<false, glsl::sampler2D` 86, `void scale_blit<true>(Texture&, IntRect const&, Te` 66); SwComposite 441 ms (top self: `syscall [libc.so.6]` 249, `void scale_blit<true>(Texture&, IntRect const&, Te` 166, `__memmove_avx_unaligned_erms [libc.so.6]` 26); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 14, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #4 153 ms (top self: `__syscall_cancel_arch [libc.so.6]` 110, `__memmove_avx_unaligned_erms [libc.so.6]` 36, `__lll_lock_wake [libc.so.6]` 3); BackgroundThreadPool #5 21 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `__lll_lock_wait [libc.so.6]` 2); ImageBridgeChld 19 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `__lll_lock_wait [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0)
  - busiest DOM Worker 278 ms: buckets subprocess_pipe_io 278, worker_messaging 277, ipc 277, js_ctypes 241, poll_wait 234, memcpy_memset 10; top self: `__syscall_cancel_arch [libc.so.6]` 234; `__memset_avx2_unaligned_erms [libc.so.6]` 9; `[linux-vdso.so.1]` 5; `mozilla::dom::TimeoutExecutor::ScheduleImmediate(m` 3; `[unknown]` 3
- **tab:9277** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2, Profiler 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: gc_cc 4, ipc 4, poll_wait 2
  - top self: `__lll_lock_wake [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 0; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 0; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<8u> >::onObje` 0; `firefox_on_glean::metrics::__glean_metric_maps::labeled_enum` 0
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8911** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsTimerEvent::Run() [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8889** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 550, SwComposite 451, DOM Worker 259, main 217, BgPool 169, WRRenderBackend 62, Compositor 42, ImageBridge 18, WRSceneBuilder 8, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 217 ms (7.1% of span): Idle 141, JavaScript 40, Other 18, DOM 14, Profiler 4
  - JS leaf 8 / native under JS 45 / native 165; buckets: ipc 216, poll_wait 152, gc_cc 57, engine_stream_read 38, worker_messaging 28, subprocess_pipe_io 14, array_buffer_copy 14, native_receiver 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 152; `[unknown]` 3; `mozilla::detail::HashTable<mozilla::Span<char, 1844674407370` 3; `__lll_lock_wake [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 550 ms (top self: `__syscall_cancel_arch [libc.so.6]` 220, `int blendTextureNearestFast<false, glsl::sampler2D` 116, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 65); SwComposite 451 ms (top self: `syscall [libc.so.6]` 238, `void scale_blit<true>(Texture&, IntRect const&, Te` 168, `__memmove_avx_unaligned_erms [libc.so.6]` 46); WRRenderBackend#0 62 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 14, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #5 169 ms (top self: `__syscall_cancel_arch [libc.so.6]` 114, `__memmove_avx_unaligned_erms [libc.so.6]` 48, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 259 ms: buckets subprocess_pipe_io 259, worker_messaging 258, ipc 258, js_ctypes 226, poll_wait 216, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 219; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2
- **tab:9277** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 3, Idle 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: gc_cc 3, ipc 3, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `__lll_lock_wake [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 0; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 0
  - GC/CC markers: GCMajor 1× 3 ms, GCSlice 2× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8911** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 525, Renderer 307, DOM Worker 271, SwComposite 253, BgPool 135, WRRenderBackend 38, Compositor 25, other 20, ImageBridge 11, WRSceneBuilder 5, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 525 ms (24.8% of span): Idle 276, JavaScript 97, Other 80, DOM 31, Graphics 23, Profiler 8
  - JS leaf 5 / native under JS 124 / native 395; buckets: ipc 522, poll_wait 356, gc_cc 99, engine_stream_read 63, worker_messaging 58, paint_layout 53, array_buffer_copy 43, harness_diagnostics 38
  - top self: `__syscall_cancel_arch [libc.so.6]` 320; `__lll_lock_wait [libc.so.6]` 15; `[unknown]` 11; `[axiosozo-dev]` 10; `__lll_lock_wake [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 8
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 307 ms (top self: `__syscall_cancel_arch [libc.so.6]` 150, `int blendTextureNearestFast<false, glsl::sampler2D` 37, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 37); SwComposite 253 ms (top self: `syscall [libc.so.6]` 150, `void scale_blit<true>(Texture&, IntRect const&, Te` 87, `__memmove_avx_unaligned_erms [libc.so.6]` 15); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 7, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #5 134 ms (top self: `__syscall_cancel_arch [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 23, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::CompositableOperationDetail::Comp` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 271 ms: buckets subprocess_pipe_io 271, worker_messaging 267, ipc 267, js_ctypes 210, poll_wait 200, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 201; `[unknown]` 9; `__lll_lock_wake [libc.so.6]` 4; `[linux-vdso.so.1]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 4
- **tab:8889** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9283** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8911** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 464, DOM Worker 217, Renderer 99, SwComposite 86, other 38, BgPool 16, Compositor 15, WRRenderBackend 14, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 464 ms (12.6% of span): Idle 248, JavaScript 83, Layout 39, Other 39, Graphics 20, DOM 20
  - JS leaf 12 / native under JS 132 / native 320; buckets: ipc 462, poll_wait 283, gc_cc 86, paint_layout 68, engine_stream_read 64, worker_messaging 61, harness_diagnostics 26, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 259; `[unknown]` 8; `[axiosozo-dev]` 7; `mprotect [libc.so.6]` 6; `__memmove_avx_unaligned_erms [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 99 ms (top self: `__syscall_cancel_arch [libc.so.6]` 42, `int blendTextureNearestFast<false, glsl::sampler2D` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); SwComposite 86 ms (top self: `syscall [libc.so.6]` 37, `void scale_blit<true>(Texture&, IntRect const&, Te` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 16); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `webrender::composite::CompositeState::get_surface_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #5 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 1 ms (top self: `access [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 217 ms: buckets subprocess_pipe_io 217, worker_messaging 217, ipc 217, js_ctypes 206, poll_wait 205, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 206; `[unknown]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `JS::Compartment::getNonWrapperObjectForCurrentComp` 1; `js::SpeciesConstructor(JSContext*, JS::Handle<JSOb` 1
- **tab:8836** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, gc_cc 0, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0; `[unknown]` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8911** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 76, Renderer 42, DOM Worker 15, BgPool 12, SwComposite 4, WRRenderBackend 3, Compositor 3, IPC I/O 3, WRSceneBuilder 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 76 ms (25.5% of span): JavaScript 32, DOM 14, Layout 11, Idle 6, Profiler 5, Graphics 4
  - JS leaf 3 / native under JS 52 / native 21; buckets: ipc 74, paint_layout 24, array_buffer_copy 17, gc_cc 15, harness_diagnostics 11, poll_wait 6, memcpy_memset 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `[axiosozo-dev]` 7; `[unknown]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 4; `AttrArray::GetAttr(nsTSubstring<char16_t> const&, nsCaseTrea` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 3
  - WebRender/compositor threads: Renderer 42 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 3, `webrender::surface::SurfaceBuilder::add_child_rend` 0, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 11 ms (top self: `getdents64 [libc.so.6]` 4, `unlink [libc.so.6]` 3, `fstatat64 [libc.so.6]` 3); BackgroundThreadPool #4 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 13, js_ctypes 12, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 13; `__lll_lock_wait [libc.so.6]` 1; `mozilla::dom::WorkerGlobalScope::SetTimeoutOrInter` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0; `syscall [libc.so.6]` 0
- **tab:9277** CPU ms by thread group: main 28, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 28 ms (9.3% of span): JavaScript 8, Other 7, Idle 4, Layout 4, DOM 2, Graphics 1
  - JS leaf 0 / native under JS 9 / native 19; buckets: ipc 23, paint_layout 11, gc_cc 7, subprocess_pipe_io 5, poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 3; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*,` 2; `nsIncrementalDownload::GetFinalURI(nsIURI**) [libxul.so]` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseN` 2; `style::properties::generated::longhands::font_width::cascade` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8836** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.4% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::ForwardingProxyHandler::call(JSContext*, JS::Handle<JSOb` 1; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigned long*) [` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:598:12)[` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8889** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

