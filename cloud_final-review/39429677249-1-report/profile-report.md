# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **6.8** (main 2.4, DOM Worker 1.4, Renderer 1.0, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **25.2** (Renderer 15.0, main 2.0, WRRende~ckend# 2.0, WRScene~ilder# 1.6, glean.dispatche 1.3) | Isolated Web Co 4.3, Privileged Cont 1.0, WebExtensions 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.6** (Renderer 9.6, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 3.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **40.3** (Renderer 27.5, main 3.9, WRRende~ckend# 3.4, SwComposite 2.0, glean.dispatche 1.0) | Isolated Web Co 3.4 | — | — |
| plain | key | — | — | **8.1** (main 4.3, Renderer 1.1, TaskCon~ller # 0.8, glean.dispatche 0.5, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3, Privileged Cont 0.3 | 9.0 | — |
| trace | idle | 59.4 | 17.2 | **4.0** (main 1.5, TaskCon~ller # 1.0, glean.dispatche 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **18.6** (Renderer 9.1, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.3) | Isolated Web Co 4.0 | — | — |
| trace | raf-nosampler | — | — | **18.0** (Renderer 9.6, WRRende~ckend# 2.0, glean.dispatche 1.7, WRScene~ilder# 1.7, Compositor 1.0) | Isolated Web Co 3.3, Web Content 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **42.3** (Renderer 28.0, main 5.4, WRRende~ckend# 2.9, glean.dispatche 1.0, TaskCon~ller # 1.0) | Isolated Web Co 4.9 | — | — |
| trace | key | — | — | **63.1** (main 17.6, DOM Worker 15.4, Indexed~ IO # 13.8, IPDL Background 6.4, TaskCon~ller # 2.4) | Isolated Web Co 1.6, WebExtensions 0.6 | 8.5 | — |
| profile | idle | 59.5 | 17.2 | **8.7** (SamplerThread 3.4, main 2.4, TaskCon~ller # 1.9, IPDL Background 0.5, DOM Worker 0.5) | Web Content 8.6, Isolated Web Co 4.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **28.3** (Renderer 10.7, SamplerThread 5.8, WRRende~ckend# 2.3, main 1.9, Compositor 1.9) | Isolated Web Co 9.7, Web Content 8.4, WebExtensions 1.9, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **27.7** (Renderer 11.2, SamplerThread 5.6, Compositor 2.3, WRRende~ckend# 2.0, glean.dispatche 1.7) | Isolated Web Co 8.9, Web Content 8.6, Privileged Cont 2.0, WebExtensions 1.7 | — | — |
| profile | scroll | 59.0 | 17.1 | **54.9** (Renderer 31.0, SamplerThread 7.8, main 4.8, WRRende~ckend# 3.4, Compositor 1.9) | Web Content 9.7, Isolated Web Co 9.7, Privileged Cont 1.9, Socket Process 1.5 | — | — |
| profile | key | — | — | **14.2** (main 5.3, SamplerThread 4.3, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 8.0, Isolated Web Co 4.3, WebExtensions 1.9, Privileged Cont 1.6 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 53, Compositor 2, DOM Worker 2, IPC I/O 1, Socket 1, other 0, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 53 ms (2.5% of span): GC / CC 34, JavaScript 6, Idle 6, Other 5, Layout 1, DOM 1
  - JS leaf 0 / native under JS 7 / native 46; buckets: ipc 53, gc_cc 40, poll_wait 11, harness_diagnostics 4, memcpy_memset 2, paint_layout 1, array_buffer_copy 1, subprocess_pipe_io 0
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `poll [libc.so.6]` 7; `mprotect [libc.so.6]` 4; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 6× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `writev [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 0 ms (top self: `__lll_lock_wait [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1; top self: `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3312** CPU ms by thread group: main 30, IPC I/O 5, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (1.4% of span): Idle 18, GC / CC 6, JavaScript 4, Other 1, Profiler 1, DOM 0
  - JS leaf 0 / native under JS 4 / native 25; buckets: ipc 29, poll_wait 18, gc_cc 7, harness_diagnostics 4, array_buffer_copy 3, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 18; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `JS::TraceChildren(JSTracer*, JS::GCCellPtr) [libxul.so]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3316** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3232** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 317, WRRenderBackend 65, main 60, WRSceneBuilder 52, Compositor 45, SwComposite 19, IPC I/O 11, DOM Worker 4, other 2, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 60 ms (1.9% of span): GC / CC 29, Idle 18, JavaScript 4, Other 3, Graphics 3, Layout 1
  - JS leaf 1 / native under JS 4 / native 55; buckets: ipc 60, gc_cc 32, poll_wait 22, paint_layout 4, harness_diagnostics 3, array_buffer_copy 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `recvmsg [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 317 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 100, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 75, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 39); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 4, `webrender::invalidation::quadtree::TileNode::updat` 1); WRSceneBuilder#0 46 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 1, poll_wait 1; top self: `madvise [libc.so.6]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Va` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString` 1
- **tab:3312** CPU ms by thread group: main 167, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 167 ms (5.4% of span): Idle 100, Graphics 19, Layout 15, Other 12, Profiler 8, GC / CC 7
  - JS leaf 0 / native under JS 6 / native 161; buckets: ipc 157, poll_wait 101, paint_layout 48, gc_cc 12, memcpy_memset 3, canvas_2d 2, array_buffer_copy 2, harness_diagnostics 2
  - top self: `poll [libc.so.6]` 100; `sendmsg [libc.so.6]` 6; `[]` 5; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2; `gfxFont::Draw(gfxTextRun const*, unsigned int, unsigned int,` 2; `write [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 32 ms, GCSlice 7× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3250** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3232** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / raf-nosampler

- **parent** CPU ms by thread group: Renderer 323, WRRenderBackend 59, WRSceneBuilder 50, Compositor 43, main 14, SwComposite 14, IPC I/O 10, other 1, Socket 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 14 ms (0.5% of span): Idle 8, JavaScript 3, DOM 2, Profiler 1, Other 0
  - JS leaf 0 / native under JS 5 / native 9; buckets: ipc 14, poll_wait 9, harness_diagnostics 5, gc_cc 3, array_buffer_copy 1, paint_layout 1
  - top self: `poll [libc.so.6]` 8; `XPCConvert::NativeInterface2JSObject(JSContext*, JS::Mutable` 1; `write [libc.so.6]` 1; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [` 1; `JS::GetScriptedCallerGlobal(JSContext*) [libxul.so]` 1; `mprotect [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 323 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 93, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 80, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 34); WRRenderBackend#0 59 ms (top self: `syscall [libc.so.6]` 50, `sched_yield [libc.so.6]` 4, `[axiosozo-dev]` 1); WRSceneBuilder#0 44 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3312** CPU ms by thread group: main 142, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 143 ms (4.7% of span): Idle 94, Graphics 20, Layout 13, Profiler 8, Other 6, DOM 2
  - JS leaf 0 / native under JS 4 / native 139; buckets: ipc 136, poll_wait 96, paint_layout 41, subprocess_pipe_io 1, memcpy_memset 1, canvas_2d 1, gc_cc 1, webrender_render 0
  - top self: `poll [libc.so.6]` 93; `[]` 5; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 1; `PLDHashTable::Iterator::~Iterator() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 624, main 107, WRRenderBackend 69, SwComposite 33, Compositor 30, WRSceneBuilder 22, IPC I/O 8, Socket 1, other 1, DOM Worker 1, BgPool 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 107 ms (5.1% of span): Idle 65, Other 12, GC / CC 11, JavaScript 10, Graphics 4, Layout 3
  - JS leaf 1 / native under JS 10 / native 96; buckets: ipc 107, poll_wait 78, gc_cc 15, paint_layout 10, harness_diagnostics 7, array_buffer_copy 3, memcpy_memset 1, mozafterpaint_events 1
  - top self: `poll [libc.so.6]` 64; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 3; `mojo::core::ports::Node::GetUserData(mojo::core::ports::Port` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 2
  - GC/CC markers: GCSlice 5× 12 ms, CCSlice 1× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 624 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 183, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 94, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54); WRRenderBackend#0 69 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 2, `floorf [libxul.so]` 2); SwComposite 33 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `open64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3312** CPU ms by thread group: main 94, IPC I/O 15, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 94 ms (4.5% of span): Idle 64, Graphics 11, GC / CC 8, Other 5, JavaScript 5, Layout 1
  - JS leaf 0 / native under JS 5 / native 89; buckets: ipc 90, poll_wait 65, paint_layout 14, gc_cc 11, harness_diagnostics 3, array_buffer_copy 3, subprocess_pipe_io 2, canvas_2d 2
  - top self: `poll [libc.so.6]` 64; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffe` 1; `sendmsg [libc.so.6]` 1; `nsTextFrame::PaintText(nsTextFrame::PaintTextParams const&, ` 1
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 3× 5 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3211** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3316** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko / key

- **parent** CPU ms by thread group: main 194, Renderer 34, WRRenderBackend 18, Compositor 18, WRSceneBuilder 14, IPC I/O 9, SwComposite 4, other 2, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 194 ms (5.1% of span): Idle 43, Layout 40, GC / CC 29, Other 24, Graphics 23, JavaScript 23
  - JS leaf 4 / native under JS 28 / native 163; buckets: ipc 194, paint_layout 70, poll_wait 58, gc_cc 41, harness_diagnostics 7, subprocess_pipe_io 7, memcpy_memset 5, array_buffer_copy 3
  - top self: `poll [libc.so.6]` 44; `nsFlexContainerFrame::GenerateFlexItemForChild(nsFlexContain` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `array_splice_impl(JSContext*, unsigned int, JS::Value*, bool` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3; `[axiosozo-dev]` 3
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 7× 23 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 16, `webrender::batch::BatchBuilder::add_prim_to_batch:` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 10, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3312** CPU ms by thread group: main 63, IPC I/O 6, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 63 ms (1.7% of span): Idle 23, JavaScript 8, Layout 8, GC / CC 8, Other 6, Graphics 5
  - JS leaf 1 / native under JS 8 / native 54; buckets: ipc 59, poll_wait 23, paint_layout 14, gc_cc 11, harness_diagnostics 4, array_buffer_copy 3, canvas_2d 1
  - top self: `poll [libc.so.6]` 23; `[]` 3; `sendmsg [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 1; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3158** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Profiler 0, DOM 0, GC / CC 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBuffe` 0; `read [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.1 | **7.3** (main 1.9, Renderer 1.9, glean.dispatche 0.5, IPC I/O Parent 0.5, Softwar~cThread 0.5) | Web Content 3.4, Isolated Web Co 1.4, WebExtensions 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **32.8** (Renderer 20.5, SwComposite 2.9, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.6) | Isolated Web Co 3.9, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **22.3** (Renderer 11.9, glean.dispatche 1.7, WRRende~ckend# 1.7, SwComposite 1.7, main 1.3) | Isolated Web Co 4.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **84.9** (Renderer 65.7, SwComposite 6.4, main 3.9, WRRende~ckend# 3.9, Compositor 1.5) | Isolated Web Co 3.9, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.6** (main 4.3, Renderer 1.1, TaskCon~ller # 0.8, glean.dispatche 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.3, Web Content 0.3, Privileged Cont 0.3 | 9.0 | — |
| trace | idle | 59.5 | 17.1 | **4.9** (main 1.9, TaskCon~ller # 1.0, Renderer 1.0, WRScene~ilder# 0.5, SwComposite 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **19.0** (Renderer 7.5, WRRende~ckend# 2.3, SwComposite 2.0, glean.dispatche 1.6, main 1.3) | Isolated Web Co 3.6 | — | — |
| trace | raf-nosampler | — | — | **18.5** (Renderer 10.3, WRRende~ckend# 2.0, glean.dispatche 1.7, Compositor 1.3, SwComposite 1.3) | Isolated Web Co 4.3 | — | — |
| trace | scroll | 59.0 | 17.4 | **199.0** (Renderer 74.2, DOM Worker 32.8, main 27.9, IndexedDB IO # 26.5, IPDL Background 10.6) | Isolated Web Co 5.3, WebExtensions 0.5, Web Content 0.5 | — | — |
| trace | key | — | — | **13.4** (main 5.9, DOM Worker 1.6, Renderer 1.3, TaskCon~ller # 0.8, glean.dispatche 0.5) | Isolated Web Co 1.1, WebExtensions 0.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **8.1** (SamplerThread 3.8, main 1.9, TaskCon~ller # 1.4, Softwar~cThread 0.5, WRScene~ilder# 0.5) | Web Content 6.2, Isolated Web Co 2.9, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.1 | **28.4** (Renderer 8.7, SamplerThread 5.5, main 2.3, WRRende~ckend# 2.3, SwComposite 2.3) | Isolated Web Co 9.4, Web Content 8.4, WebExtensions 1.6, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **29.8** (Renderer 11.9, SamplerThread 5.6, SwComposite 2.3, WRRende~ckend# 2.0, glean.dispatche 1.7) | Isolated Web Co 8.3, Web Content 6.9, WebExtensions 1.7, RDD Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **103.8** (Renderer 71.7, SamplerThread 8.7, SwComposite 7.3, main 5.8, WRRende~ckend# 4.4) | Web Content 9.2, Isolated Web Co 8.2, WebExtensions 1.9, Socket Process 1.5 | — | — |
| profile | key | — | — | **14.4** (main 5.3, SamplerThread 4.5, Renderer 1.1, TaskCon~ller # 0.8, IPC I/O Parent 0.5) | Web Content 8.0, Isolated Web Co 4.0, WebExtensions 1.9, Socket Process 1.6 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 48, DOM Worker 4, Renderer 1, SwComposite 1, Compositor 1, IPC I/O 1, Socket 1, WRSceneBuilder 0, other 0, WRRenderBackend 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 48 ms (2.3% of span): GC / CC 29, Idle 7, JavaScript 5, Other 4, DOM 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 41; buckets: ipc 48, gc_cc 33, poll_wait 11, harness_diagnostics 4, array_buffer_copy 1, subprocess_pipe_io 1, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 55 ms, GCSlice 6× 22 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, poll_wait 3, gc_cc 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:3307** CPU ms by thread group: main 24, IPC I/O 4, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 24 ms (1.2% of span): Idle 15, GC / CC 5, JavaScript 2, Other 1, Profiler 1, Layout 0
  - JS leaf 0 / native under JS 3 / native 21; buckets: ipc 24, poll_wait 15, gc_cc 6, harness_diagnostics 3, array_buffer_copy 3, paint_layout 0
  - top self: `poll [libc.so.6]` 15; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `mozilla::dom::Element::UnbindFromTree(mozilla::dom::UnbindCo` 1; `js::jit::CacheIRWriter::loadObject(JSObject*) [libxul.so]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `js::GenericTracerImpl<TraversalTracer>::onScriptEdge(js::Bas` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3242** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3316** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 261, SwComposite 68, WRRenderBackend 59, main 58, WRSceneBuilder 52, Compositor 42, IPC I/O 11, other 2, DOM Worker 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 58 ms (1.8% of span): GC / CC 27, Idle 18, JavaScript 6, Other 2, Layout 2, Graphics 2
  - JS leaf 0 / native under JS 6 / native 51; buckets: ipc 58, gc_cc 32, poll_wait 20, harness_diagnostics 5, paint_layout 4, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `TraceCallbackFunc::Trace(JS::TenuredHeap<JSObject*>*, char c` 2; `recvmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 261 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 95, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 81, `int blendTextureNearestFast<true, glsl::sampler2D_` 13); SwComposite 68 ms (top self: `syscall [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 59 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 3, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS` 0
- **tab:3307** CPU ms by thread group: main 158, IPC I/O 16, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 158 ms (5.1% of span): Idle 102, Graphics 18, Layout 10, GC / CC 8, Other 8, Profiler 6
  - JS leaf 0 / native under JS 7 / native 150; buckets: ipc 147, poll_wait 104, paint_layout 36, gc_cc 13, harness_diagnostics 3, array_buffer_copy 3, memcpy_memset 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 103; `[]` 8; `sendmsg [libc.so.6]` 4; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const ` 1; `read [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 15 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3242** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `nsTString<char>* nsTArray_Impl<nsTString<char>, nsTArrayInfa` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 346, SwComposite 55, WRRenderBackend 54, WRSceneBuilder 48, main 42, Compositor 42, IPC I/O 10, other 1, DOM Worker 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0, BgPool 0
  - main thread 42 ms (1.4% of span): GC / CC 27, Idle 10, JavaScript 5, Other 0
  - JS leaf 0 / native under JS 4 / native 38; buckets: ipc 42, gc_cc 31, poll_wait 12, harness_diagnostics 4, array_buffer_copy 3
  - top self: `poll [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3; `mprotect [libc.so.6]` 2; `js::gc::TraceCycleCollectorChildren(JSTracer*, js::Shape*) [` 2
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 346 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 95, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 91, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 42); SwComposite 55 ms (top self: `syscall [libc.so.6]` 47, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 4, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 0; top self: `getrusage [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3307** CPU ms by thread group: main 133, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 133 ms (4.4% of span): Idle 97, Graphics 15, Layout 10, Other 6, Profiler 5, DOM 0
  - JS leaf 0 / native under JS 3 / native 130; buckets: ipc 128, poll_wait 98, paint_layout 28, subprocess_pipe_io 2, gc_cc 1, canvas_2d 1, memcpy_memset 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 97; `[]` 3; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3220** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3242** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1464, SwComposite 132, main 101, WRRenderBackend 90, Compositor 31, WRSceneBuilder 23, IPC I/O 9, Socket 1, other 1, BgPool 1, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 101 ms (4.8% of span): Idle 70, Other 10, Graphics 7, JavaScript 4, DOM 4, Layout 4
  - JS leaf 0 / native under JS 7 / native 94; buckets: ipc 101, poll_wait 88, paint_layout 11, gc_cc 4, harness_diagnostics 3, array_buffer_copy 2, json_metadata 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 71; `nsPresContext::UpdateContainerQueryStylesAndAnchorPosLayout(` 2; `[axiosozo-dev]` 1; `__lll_lock_wait [libc.so.6]` 1; `writev [libc.so.6]` 1; `js::Stringify(JSContext*, JS::MutableHandle<JS::Value>, JSOb` 1
  - WebRender/compositor threads: Renderer 1464 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 434, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 307, `hypotf@@GLIBC_2.35 [libm.so.6]` 121); SwComposite 132 ms (top self: `syscall [libc.so.6]` 121, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `webrender::compositor::sw_compositor::SwCompositeT` 0); WRRenderBackend#0 90 ms (top self: `syscall [libc.so.6]` 55, `webrender::batch::BatchBuilder::add_prim_to_batch ` 3, `[axiosozo-dev]` 3)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `write [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3307** CPU ms by thread group: main 93, IPC I/O 15, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 93 ms (4.5% of span): Idle 62, Graphics 15, Other 7, JavaScript 3, Layout 3, Profiler 2
  - JS leaf 0 / native under JS 4 / native 90; buckets: ipc 89, poll_wait 63, paint_layout 20, gc_cc 2, harness_diagnostics 2, mozafterpaint_events 1, canvas_2d 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 63; `[]` 3; `sendmsg [libc.so.6]` 2; `mozilla::FlattenedDisplayListIterator::GetNextItem() [libxul` 1; `[linux-vdso.so.1]` 1; `js::LifoAlloc::mark() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3242** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3402** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 196, Renderer 43, WRRenderBackend 16, Compositor 16, WRSceneBuilder 13, SwComposite 10, IPC I/O 8, other 2, Socket 1, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, DOM Worker 0, ImageBridge 0
  - main thread 196 ms (5.2% of span): Idle 42, Layout 42, JavaScript 31, GC / CC 30, Graphics 23, Other 19
  - JS leaf 2 / native under JS 33 / native 160; buckets: ipc 196, paint_layout 71, poll_wait 57, gc_cc 49, subprocess_pipe_io 12, array_buffer_copy 8, harness_diagnostics 5, js_ctypes 3
  - top self: `poll [libc.so.6]` 42; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 7; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 5; `[unknown]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 6× 25 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 43 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 22, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `webrender::picture::PictureInstance::take_context ` 0); WRSceneBuilder#0 12 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 2, `__memset_avx2_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `fstatat64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3307** CPU ms by thread group: main 62, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 62 ms (1.6% of span): Idle 24, GC / CC 9, JavaScript 8, Other 8, DOM 7, Layout 3
  - JS leaf 0 / native under JS 9 / native 53; buckets: ipc 60, poll_wait 25, paint_layout 12, gc_cc 12, harness_diagnostics 4, array_buffer_copy 3, canvas_2d 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 24; `sendmsg [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `[]` 1; `mozilla::dom::NodeInfo::HTMLTag() const [libxul.so]` 1; `nsWindowRoot::AddRef() [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3165** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, JavaScript 0, DOM 0, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `[linux-vdso.so.1]` 0; `XPCJSContext::BeforeProcessTask(bool) [libxul.so]` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 0; `mozilla::dom::WindowGlobalChild::IsCurrentGlobal() [libxul.s` 0; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

