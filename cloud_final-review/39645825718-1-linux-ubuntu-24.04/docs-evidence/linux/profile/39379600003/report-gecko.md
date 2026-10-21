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

