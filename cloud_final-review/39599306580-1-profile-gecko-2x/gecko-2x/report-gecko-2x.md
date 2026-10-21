# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.3 | **7.2** (main 1.9, Renderer 1.9, DOM Worker 1.4, IPDL Background 1.0, glean.dispatche 0.5) | Web Content 3.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **34.5** (Renderer 19.8, SwComposite 3.3, WRRende~ckend# 2.3, main 2.0, glean.dispatche 1.6) | Isolated Web Co 4.2, WebExtensions 0.6, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **23.6** (Renderer 12.3, WRRende~ckend# 2.0, SwComposite 2.0, glean.dispatche 1.7, main 1.3) | Isolated Web Co 4.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **84.7** (Renderer 65.5, SwComposite 5.9, main 4.4, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 3.9, Privileged Cont 1.0 | — | — |
| plain | key | — | — | **8.3** (main 4.3, Renderer 1.1, IPC I/O Parent 0.5, TaskCon~ller # 0.5, WRScene~ilder# 0.5) | Isolated Web Co 1.6, Web Content 0.5, WebExtensions 0.3 | 8.5 | — |
| trace | idle | 59.4 | 17.1 | **6.4** (main 1.9, glean.dispatche 1.0, TaskCon~ller # 1.0, Timer 0.5, IPDL Background 0.5) | Isolated Web Co 1.4 | — | — |
| trace | raf | 59.0 | 17.1 | **18.3** (Renderer 7.8, SwComposite 2.3, WRRende~ckend# 2.0, main 1.3, glean.dispatche 1.3) | Isolated Web Co 4.2, WebExtensions 0.3 | — | — |
| trace | raf-nosampler | — | — | **23.0** (Renderer 11.3, WRRende~ckend# 2.3, glean.dispatche 2.0, WRScene~ilder# 1.7, Compositor 1.7) | Isolated Web Co 5.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **85.1** (Renderer 65.4, main 5.9, SwComposite 5.9, WRRende~ckend# 3.9, glean.dispatche 1.0) | Isolated Web Co 4.4 | — | — |
| trace | key | — | — | **53.3** (main 17.6, DOM Worker 17.0, IPDL Background 6.7, TaskCon~ller # 2.1, StreamTrans # 1.9) | Isolated Web Co 1.1, WebExtensions 0.5 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **10.6** (SamplerThread 4.3, main 2.9, TaskCon~ller # 1.9, Softwar~cThread 0.5, Compositor 0.5) | Web Content 8.1, Isolated Web Co 4.3, Socket Process 1.4, Privileged Cont 1.4 | — | — |
| profile | raf | 59.0 | 17.1 | **29.6** (Renderer 8.7, SamplerThread 6.1, WRRende~ckend# 2.6, SwComposite 2.6, main 2.3) | Isolated Web Co 9.4, Web Content 8.4, WebExtensions 1.6, Socket Process 1.3 | — | — |
| profile | raf-nosampler | — | — | **32.1** (Renderer 12.2, SamplerThread 6.3, WRRende~ckend# 2.3, WRScene~ilder# 2.0, Compositor 2.0) | Isolated Web Co 9.3, Web Content 7.9, Privileged Cont 2.3, Socket Process 1.7 | — | — |
| profile | scroll | 59.0 | 17.2 | **104.7** (Renderer 72.4, SamplerThread 9.7, SwComposite 7.2, main 5.3, WRRende~ckend# 4.3) | Web Content 9.7, Isolated Web Co 9.1, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | key | — | — | **15.1** (main 5.6, SamplerThread 4.3, Renderer 1.3, TaskCon~ller # 0.5, WRScene~ilder# 0.5) | Web Content 8.0, Isolated Web Co 4.0, WebExtensions 1.6, Privileged Cont 1.6 | 9.5 | — |

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

- **parent** CPU ms by thread group: main 54, DOM Worker 1, Compositor 1, IPC I/O 1, Renderer 1, SwComposite 1, Socket 1, other 0, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 54 ms (2.6% of span): GC / CC 33, Idle 8, JavaScript 7, Other 5, DOM 1, Graphics 0
  - JS leaf 0 / native under JS 8 / native 46; buckets: ipc 54, gc_cc 37, poll_wait 10, harness_diagnostics 6, array_buffer_copy 3, memcpy_memset 1, paint_layout 0
  - top self: `poll [libc.so.6]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `write [libc.so.6]` 2; `js::IndirectBindingMap::trace(JSTracer*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 75 ms, GCSlice 7× 26 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, gc_cc 1, poll_wait 1; top self: `void js::gc::ArenaLists::backgroundFinalize<(js::g` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3293** CPU ms by thread group: main 26, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (1.2% of span): Idle 16, GC / CC 5, JavaScript 3, Other 2, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 3 / native 23; buckets: ipc 25, poll_wait 17, gc_cc 7, array_buffer_copy 3, harness_diagnostics 3, subprocess_pipe_io 1, paint_layout 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `[unknown]` 1; `mozilla::CycleCollectedJSContext::AfterProcessMicrotasks() [` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 20 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3209** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3382** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 267, SwComposite 69, main 62, WRRenderBackend 62, WRSceneBuilder 56, Compositor 44, IPC I/O 11, DOM Worker 5, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 62 ms (2.0% of span): GC / CC 28, Idle 19, JavaScript 6, Other 5, Graphics 3, Layout 2
  - JS leaf 0 / native under JS 6 / native 57; buckets: ipc 62, gc_cc 34, poll_wait 21, harness_diagnostics 5, paint_layout 4, array_buffer_copy 2, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `bool mozilla::detail::HashTable<char const* const, mozilla::` 2; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 6 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 267 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 102, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 81, `int blendTextureNearestFast<true, glsl::sampler2D_` 15); SwComposite 69 ms (top self: `syscall [libc.so.6]` 63, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 62 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 3 ms: buckets worker_messaging 3, ipc 3, gc_cc 2, memcpy_memset 2, poll_wait 1; top self: `madvise [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3293** CPU ms by thread group: main 164, IPC I/O 17, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 164 ms (5.2% of span): Idle 104, Graphics 18, Layout 13, Other 9, Profiler 8, GC / CC 6
  - JS leaf 0 / native under JS 9 / native 154; buckets: ipc 157, poll_wait 105, paint_layout 43, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 104; `[]` 4; `sendmsg [libc.so.6]` 3; `getcontext [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3385** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3382** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 354, WRRenderBackend 58, SwComposite 58, WRSceneBuilder 52, main 45, Compositor 44, IPC I/O 11, other 2, DOM Worker 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 45 ms (1.5% of span): GC / CC 27, Idle 12, DOM 4, Other 1, JavaScript 1, Graphics 0
  - JS leaf 0 / native under JS 5 / native 40; buckets: ipc 45, gc_cc 28, poll_wait 13, harness_diagnostics 5, array_buffer_copy 4, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `Native2WrappedNativeMap::Find(nsISupports*) const [libxul.so` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 354 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 109, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 44); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 2, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); SwComposite 58 ms (top self: `syscall [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `Composite [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3293** CPU ms by thread group: main 148, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 148 ms (4.9% of span): Idle 95, Graphics 20, Layout 13, Other 7, Profiler 7, GC / CC 5
  - JS leaf 0 / native under JS 3 / native 145; buckets: ipc 137, poll_wait 95, paint_layout 39, gc_cc 5, memcpy_memset 2, subprocess_pipe_io 1, canvas_2d 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 95; `[]` 6; `sendmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `write [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 6× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3188** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3227** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 1455, SwComposite 131, main 105, WRRenderBackend 88, Compositor 32, WRSceneBuilder 25, IPC I/O 9, other 1, Socket 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 105 ms (5.0% of span): Idle 74, Other 9, JavaScript 8, Graphics 8, Layout 3, DOM 3
  - JS leaf 0 / native under JS 9 / native 96; buckets: ipc 105, poll_wait 89, paint_layout 11, gc_cc 8, harness_diagnostics 6, memcpy_memset 2, json_metadata 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 73; `[unknown]` 5; `[linux-vdso.so.1]` 3; `[axiosozo-dev]` 3; `QuoteJSONString(JSContext*, js::StringBuilder&, JSString*) [` 2; `webrtc::videocapturemodule::VideoCaptureImpl::CurrentDeviceN` 1
  - WebRender/compositor threads: Renderer 1455 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 490, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 285, `hypotf@@GLIBC_2.35 [libm.so.6]` 104); SwComposite 131 ms (top self: `syscall [libc.so.6]` 119, `__memmove_avx_unaligned_erms [libc.so.6]` 11, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 88 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `core::hash::BuildHasher::hash_one [libxul.so]` 3)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3293** CPU ms by thread group: main 93, IPC I/O 16, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 93 ms (4.4% of span): Idle 65, Graphics 14, Other 7, Profiler 3, Layout 2, DOM 1
  - JS leaf 0 / native under JS 3 / native 90; buckets: ipc 91, poll_wait 65, paint_layout 17, canvas_2d 2, mozafterpaint_events 2, harness_diagnostics 1, array_buffer_copy 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 65; `getcontext [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `[]` 1; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3209** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3188** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 207, Renderer 48, WRRenderBackend 18, Compositor 18, WRSceneBuilder 15, SwComposite 12, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 207 ms (5.5% of span): Idle 47, Layout 41, GC / CC 32, Graphics 28, JavaScript 26, Other 20
  - JS leaf 4 / native under JS 30 / native 173; buckets: ipc 207, paint_layout 72, poll_wait 66, gc_cc 46, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `[axiosozo-dev]` 7; `recvmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 3
  - GC/CC markers: GCMajor 1× 59 ms, GCSlice 6× 26 ms, CCSlice 1× 6 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 26, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3293** CPU ms by thread group: main 67, IPC I/O 7, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 67 ms (1.8% of span): Idle 23, Other 11, GC / CC 9, JavaScript 7, Profiler 6, Layout 6
  - JS leaf 1 / native under JS 7 / native 59; buckets: ipc 63, poll_wait 24, paint_layout 14, gc_cc 11, array_buffer_copy 3, harness_diagnostics 3, memcpy_memset 2, canvas_2d 1
  - top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 3; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `mozilla::PresShell::EventHandler::ComputeFocusedEventTargetE` 1; `__strlen_avx2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3136** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 0, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `nsGlobalWindowInner::QueryInterface(nsID const&, void**) [li` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `nscstring_fallible_append_utf16_to_latin1_lossy_impl [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3209** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

