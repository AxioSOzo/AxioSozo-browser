# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.1 | **6.0** (main 2.0, Renderer 2.0, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5) | Web Content 2.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **22.1** (Renderer 13.5, SwComposite 2.3, main 1.3, WRRende~ckend# 1.3, TaskCon~ller # 1.0) | Isolated Web Co 2.9, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.8** (Renderer 8.6, SwComposite 1.7, glean.dispatche 1.3, WRScene~ilder# 1.3, WRRende~ckend# 1.3) | Isolated Web Co 3.0, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **53.3** (Renderer 41.8, SwComposite 4.5, main 2.5, WRRende~ckend# 2.5, glean.dispatche 0.5) | Isolated Web Co 3.0 | — | — |
| plain | key | — | — | **6.3** (main 3.0, Renderer 1.1, TaskCon~ller # 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.1 | 8.5 | — |
| trace | idle | 59.0 | 17.2 | **4.5** (main 1.5, TaskCon~ller # 1.5, Renderer 1.0, IPDL Background 0.5) | Privileged Cont 0.5, Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **12.1** (Renderer 5.6, SwComposite 1.6, glean.dispatche 1.3, WRScene~ilder# 1.0, WRRende~ckend# 1.0) | Isolated Web Co 3.3 | — | — |
| trace | raf-nosampler | — | — | **16.0** (Renderer 7.0, main 1.7, SwComposite 1.7, WRRende~ckend# 1.3, glean.dispatche 1.0) | Isolated Web Co 2.6 | — | — |
| trace | scroll | 59.0 | 17.1 | **57.3** (Renderer 40.8, main 4.5, SwComposite 4.5, WRRende~ckend# 2.0, glean.dispatche 1.0) | Isolated Web Co 3.0 | — | — |
| trace | key | — | — | **49.7** (DOM Worker 14.3, main 12.4, Indexed~ IO # 10.5, IPDL Background 5.4, TaskCon~ller # 2.2) | Isolated Web Co 0.8, WebExtensions 0.6 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **2.0** (SamplerThread 2.0) | Web Content 3.9, Isolated Web Co 3.0, Privileged Cont 1.5, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **20.8** (Renderer 5.9, SamplerThread 3.6, main 2.0, TaskCon~ller # 1.6, WRRende~ckend# 1.6) | Isolated Web Co 6.9, Web Content 4.6, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **22.3** (Renderer 8.0, SamplerThread 3.3, main 1.7, WRRende~ckend# 1.7, SwComposite 1.7) | Isolated Web Co 5.9, Web Content 5.0, Privileged Cont 1.3, Socket Process 0.7 | — | — |
| profile | scroll | 59.0 | 17.1 | **71.1** (Renderer 46.1, SwComposite 6.5, SamplerThread 6.0, main 5.0, WRRende~ckend# 2.5) | Isolated Web Co 6.0, Web Content 4.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **10.0** (main 3.2, SamplerThread 3.0, Renderer 1.1, Compositor 0.8, WRRende~ckend# 0.5) | Web Content 5.4, Isolated Web Co 2.7, Privileged Cont 1.1, WebExtensions 0.8 | 11.0 | — |

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

- **parent** CPU ms by thread group: main 5, IPC I/O 1, Socket 0, other 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, DOM Worker 0, ImageBridge 0, SwComposite 0
  - main thread 5 ms (0.3% of span): Idle 3, JavaScript 2
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, harness_diagnostics 2, gc_cc 2, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `mprotect [libc.so.6]` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 1; `[unknown]` 0
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 14, IPC I/O 3, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 14 ms (0.7% of span): Idle 12, JavaScript 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 14; buckets: ipc 14, poll_wait 12, array_buffer_copy 1, gc_cc 1, harness_diagnostics 0, paint_layout 0
  - top self: `poll [libc.so.6]` 12; `js::FrameIter::settleOnActivation() [libxul.so]` 1; `js::LiveSavedFrameCache::~LiveSavedFrameCache() [libxul.so]` 0; `write [libc.so.6]` 0; `[]` 0; `js::SCInput::read(unsigned long*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf

- **parent** CPU ms by thread group: Renderer 180, main 58, SwComposite 51, WRRenderBackend 42, WRSceneBuilder 39, Compositor 35, IPC I/O 8, other 1, DOM Worker 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 58 ms (1.9% of span): GC / CC 31, Idle 18, Other 4, JavaScript 3, Layout 1, Graphics 1
  - JS leaf 0 / native under JS 3 / native 54; buckets: ipc 58, gc_cc 34, poll_wait 20, harness_diagnostics 3, paint_layout 2, memcpy_memset 2, array_buffer_copy 2, json_metadata 1
  - top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `mozilla::TraceScriptHolder(nsISupports*, JSTracer*) [libxul.` 2; `JS::Compartment::findSweepGroupEdges() [libxul.so]` 2; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMajor 1× 91 ms, GCSlice 6× 24 ms, CCSlice 2× 7 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 180 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 22, `int blendTextureNearestFast<true, glsl::sampler2D_` 8); SwComposite 51 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx512_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 38, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, poll_wait 1, gc_cc 1; top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::jit::JitCode::finalize(JS::GCContext*) [libxul` 0
- **tab:3186** CPU ms by thread group: main 126, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 126 ms (4.1% of span): Idle 84, Graphics 13, Layout 10, Other 7, GC / CC 6, Profiler 3
  - JS leaf 0 / native under JS 4 / native 122; buckets: ipc 118, poll_wait 85, paint_layout 26, gc_cc 9, harness_diagnostics 2, subprocess_pipe_io 2, array_buffer_copy 1, canvas_2d 1
  - top self: `poll [libc.so.6]` 84; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `sendmsg [libc.so.6]` 2; `XPCWrappedNativeScope::TraceWrappedNativesInAllScopes(XPCJSR` 1
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 2 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / raf-nosampler

- **parent** CPU ms by thread group: Renderer 235, SwComposite 44, WRRenderBackend 41, main 40, WRSceneBuilder 36, Compositor 34, IPC I/O 7, DOM Worker 4, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (1.3% of span): GC / CC 25, Idle 9, Other 3, JavaScript 3, Graphics 0
  - JS leaf 0 / native under JS 2 / native 38; buckets: ipc 40, gc_cc 29, poll_wait 10, harness_diagnostics 2, json_metadata 1, array_buffer_copy 1, paint_layout 0, memcpy_memset 0
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 9; `poll [libc.so.6]` 9; `mprotect [libc.so.6]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 235 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 29, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 23); SwComposite 45 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 41 ms (top self: `syscall [libc.so.6]` 38, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 2 ms: buckets worker_messaging 2, ipc 2, gc_cc 2, poll_wait 0; top self: `mozilla::PrintfTarget::vprint(char const*, __va_li` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTrace` 1; `__lll_lock_wait [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 111, IPC I/O 12, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 111 ms (3.7% of span): Idle 83, Graphics 8, Other 7, Layout 6, Profiler 3, GC / CC 2
  - JS leaf 0 / native under JS 2 / native 109; buckets: ipc 108, poll_wait 84, paint_layout 17, gc_cc 6, memcpy_memset 1, canvas_2d 1, subprocess_pipe_io 0, mozafterpaint_events 0
  - top self: `poll [libc.so.6]` 82; `sendmsg [libc.so.6]` 2; `[]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::` 1
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 6× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3093** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / scroll

- **parent** CPU ms by thread group: Renderer 898, SwComposite 113, main 98, WRRenderBackend 54, Compositor 24, WRSceneBuilder 16, IPC I/O 6, other 1, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 99 ms (4.9% of span): Idle 49, GC / CC 26, Other 11, JavaScript 5, Graphics 3, DOM 3
  - JS leaf 0 / native under JS 7 / native 92; buckets: ipc 99, poll_wait 61, gc_cc 32, harness_diagnostics 6, paint_layout 5, array_buffer_copy 2, subprocess_pipe_io 1, json_metadata 1
  - top self: `poll [libc.so.6]` 49; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `recvmsg [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 898 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 298, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 202, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 53); SwComposite 113 ms (top self: `syscall [libc.so.6]` 102, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 1, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 65, IPC I/O 11, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 65 ms (3.2% of span): Idle 51, Graphics 5, Other 4, JavaScript 4, Layout 1, Profiler 1
  - JS leaf 0 / native under JS 4 / native 61; buckets: ipc 63, poll_wait 51, paint_layout 7, gc_cc 3, harness_diagnostics 2, subprocess_pipe_io 2, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 51; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const ` 1; `webrtc::LogSink::OnLogMessage(std::basic_string_view<char, s` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `js::frontend::SpecificParserAtomLookup<char16_t>::equalsEntr` 1; `[]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3261** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3093** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: gecko-2x / key

- **parent** CPU ms by thread group: main 110, Renderer 43, SwComposite 13, Compositor 13, WRRenderBackend 12, WRSceneBuilder 10, IPC I/O 6, other 1, Socket 1, DOM Worker 1, BgPool 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 110 ms (2.9% of span): Idle 36, Graphics 19, Layout 17, Other 16, JavaScript 15, Profiler 5
  - JS leaf 1 / native under JS 18 / native 91; buckets: ipc 110, poll_wait 46, paint_layout 40, gc_cc 6, harness_diagnostics 4, array_buffer_copy 3, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 37; `[axiosozo-dev]` 5; `[unknown]` 5; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 3; `recvmsg [libc.so.6]` 3; `mozilla::ScrollContainerFrame::BuildDisplayList(mozilla::nsD` 3
  - WebRender/compositor threads: Renderer 43 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 21, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5); SwComposite 13 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 12, `webrender::render_task_graph::RenderTaskGraphBuild` 0, `webrender::quad::prepare_quad_impl [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, ipc 1, array_buffer_copy 1, gc_cc 1, poll_wait 0; top self: `js::StringPrinter::put(char const*, unsigned long)` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3186** CPU ms by thread group: main 48, IPC I/O 5, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (1.3% of span): Idle 23, GC / CC 8, Other 7, JavaScript 3, DOM 3, Layout 2
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 47, poll_wait 24, gc_cc 10, paint_layout 8, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `ChildFinder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3023** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 4, Other 0, Profiler 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, gc_cc 0, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `mojo::core::ports::Node::PrepareToForwardUserMessage(mojo::c` 0; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0; `[unknown]` 0; `nsWindowRoot::AddRef() [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3072** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

