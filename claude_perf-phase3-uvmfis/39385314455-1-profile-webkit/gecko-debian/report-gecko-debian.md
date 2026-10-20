# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.3 | **6.5** (main 2.5, Renderer 1.0, DOM Worker 1.0, glean.dispatche 0.5, Softwar~cThread 0.5) | Web Content 3.5, Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.3 | **24.4** (Renderer 13.9, WRRende~ckend# 2.3, main 1.7, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.6, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.6** (Renderer 9.0, WRRende~ckend# 1.7, main 1.3, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.4, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **39.7** (Renderer 26.2, main 4.0, WRRende~ckend# 3.5, SwComposite 2.5, glean.dispatche 1.0) | Isolated Web Co 4.0, Web Content 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **8.0** (main 4.6, Renderer 1.3, TaskCon~ller # 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.1 | **3.5** (SamplerThread 2.5, main 0.5, Softwar~cThread 0.5) | Web Content 5.4, Isolated Web Co 2.5, Privileged Cont 1.5, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.1 | **26.6** (Renderer 9.6, SamplerThread 4.9, main 2.3, WRRende~ckend# 2.3, WRScene~ilder# 1.6) | Isolated Web Co 8.9, Web Content 5.9, WebExtensions 1.3, Privileged Cont 1.3 | — | — |
| profile | raf-nosampler | — | — | **25.4** (Renderer 10.6, SamplerThread 4.7, WRScene~ilder# 2.0, WRRende~ckend# 2.0, main 1.7) | Isolated Web Co 8.0, Web Content 6.3, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | scroll | 59.0 | 17.3 | **155.2** (DOM Worker 33.6, Renderer 32.1, main 26.5, Indexed~ IO # 25.0, IPDL Background 11.0) | Isolated Web Co 8.0, Web Content 7.0, Privileged Cont 1.5, Socket Process 1.0 | — | — |
| profile | key | — | — | **23.2** (main 9.6, SamplerThread 4.0, DOM Worker 2.4, IPDL Background 1.1, Renderer 1.1) | Web Content 5.9, Isolated Web Co 3.7, WebExtensions 1.9, Privileged Cont 1.6 | 7.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |
| profile | idle | — | — | — | — | — | — | — | — |
| profile | raf | — | — | — | — | — | — | — | — |
| profile | raf-nosampler | — | — | — | — | — | — | — | — |
| profile | scroll | — | — | — | — | — | — | — | — |
| profile | key | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | — | — | — | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: main 9, IPC I/O 1, Compositor 1, Renderer 1, Socket 1, SwComposite 0, WRSceneBuilder 0, WRRenderBackend 0, other 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 9 ms (0.4% of span): JavaScript 4, Idle 4, Graphics 1, Other 0
  - JS leaf 0 / native under JS 3 / native 6; buckets: ipc 9, poll_wait 4, gc_cc 3, harness_diagnostics 3, array_buffer_copy 1, paint_layout 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1; `js::gc::BufferAllocator::bumpAlloc(unsigned long, unsigned l` 1; `js::jit::ExecutableAllocator::poolForSize(unsigned long) [li` 1; `nsINode::GetFlattenedTreeParentNodeForStyle() const [libxul.` 1; `mprotect [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 0 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 0, `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8325** CPU ms by thread group: main 27, IPC I/O 4, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 27 ms (1.3% of span): Idle 15, GC / CC 5, JavaScript 3, Profiler 2, Other 1, Layout 0
  - JS leaf 0 / native under JS 3 / native 23; buckets: ipc 24, poll_wait 16, gc_cc 7, harness_diagnostics 3, array_buffer_copy 2, subprocess_pipe_io 1, paint_layout 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 15; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::gc::AtomRefRuntime::recordRefToId(JSContext*, JS::Proper` 1; `js::ScriptSource::setFilename(js::FrontendContext*, std::uni` 1
  - GC/CC markers: GCMajor 1× 25 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8419** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8357** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 292, WRRenderBackend 62, main 56, WRSceneBuilder 51, Compositor 41, SwComposite 23, IPC I/O 9, other 2, Socket 1, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 56 ms (1.8% of span): GC / CC 26, Idle 18, Other 3, JavaScript 3, Layout 3, Graphics 2
  - JS leaf 0 / native under JS 3 / native 52; buckets: ipc 55, gc_cc 27, poll_wait 19, paint_layout 5, harness_diagnostics 3, subprocess_pipe_io 1, array_buffer_copy 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::GCMarker::updateRangesAtStartOfSlice() [libxul.so]` 2; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 2; `mprotect [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1
  - GC/CC markers: GCMajor 1× 72 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 291 ms (top self: `__syscall_cancel_arch [libc.so.6]` 100, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 67, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 34); WRRenderBackend#0 63 ms (top self: `syscall [libc.so.6]` 51, `sched_yield [libc.so.6]` 5, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); WRSceneBuilder#0 46 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8325** CPU ms by thread group: main 166, IPC I/O 14, other 2, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 166 ms (5.4% of span): Idle 108, Graphics 16, Layout 13, Other 10, GC / CC 7, JavaScript 5
  - JS leaf 0 / native under JS 9 / native 157; buckets: ipc 160, poll_wait 109, paint_layout 41, gc_cc 10, harness_diagnostics 4, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 112; `[]` 2; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul` 2; `getcontext [libc.so.6]` 1; `mozilla::ipc::PortLink::SendMessage(std::unique_ptr<IPC::Mes` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 11 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8262** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8416** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / raf-nosampler

- **parent** CPU ms by thread group: Renderer 295, WRRenderBackend 58, WRSceneBuilder 49, main 44, Compositor 40, SwComposite 15, IPC I/O 9, other 1, Socket 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0, ImageBridge 0
  - main thread 44 ms (1.4% of span): GC / CC 26, Idle 11, Other 3, JavaScript 3, Profiler 1
  - JS leaf 0 / native under JS 3 / native 41; buckets: ipc 43, gc_cc 29, poll_wait 11, harness_diagnostics 2, array_buffer_copy 2, subprocess_pipe_io 0, json_metadata 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 2; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 6× 22 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 295 ms (top self: `__syscall_cancel_arch [libc.so.6]` 94, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 70, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 35); WRRenderBackend#0 58 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 3, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1); WRSceneBuilder#0 44 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 1, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, ipc 0, poll_wait 0; top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8325** CPU ms by thread group: main 146, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 146 ms (4.8% of span): Idle 102, Graphics 14, Layout 10, Other 8, Profiler 5, GC / CC 4
  - JS leaf 0 / native under JS 4 / native 142; buckets: ipc 139, poll_wait 106, paint_layout 32, gc_cc 5, memcpy_memset 1, canvas_2d 1, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 107; `[]` 2; `nsIFrame::IsTransformed() const [libxul.so]` 1; `mozilla::EffectSet::GetForFrame(nsIFrame const*, nsCSSProper` 1; `__lll_lock_wait [libc.so.6]` 1; `bool TraversalTracer::onEdge<js::Scope>(js::Scope**, char co` 1
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8221** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8416** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: DOM Worker 642, Renderer 620, main 506, WRRenderBackend 73, SwComposite 51, Compositor 28, WRSceneBuilder 24, Socket 13, BgPool 10, IPC I/O 7, other 1, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 506 ms (25.2% of span): Idle 161, JavaScript 139, DOM 104, Other 66, Graphics 8, Profiler 8
  - JS leaf 20 / native under JS 192 / native 294; buckets: ipc 505, gc_cc 218, poll_wait 196, array_buffer_copy 98, memcpy_memset 21, paint_layout 14, worker_messaging 11, harness_diagnostics 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 181; `[unknown]` 23; `[axiosozo-dev]` 21; `__memmove_evex_unaligned_erms [libc.so.6]` 10; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8
  - GC/CC markers: GCMinor 6× 8 ms
  - WebRender/compositor threads: Renderer 620 ms (top self: `__syscall_cancel_arch [libc.so.6]` 169, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 154, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 76); WRRenderBackend#0 73 ms (top self: `syscall [libc.so.6]` 52, `sched_yield [libc.so.6]` 5, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2); SwComposite 51 ms (top self: `syscall [libc.so.6]` 47, `__memmove_evex_unaligned_erms [libc.so.6]` 4, `void scale_blit<false>(Texture&, IntRect const&, T` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `[libfreeblpriv3.so]` 0); BgIOThreadPool #1 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `rename [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 640 ms: buckets worker_messaging 637, ipc 634, poll_wait 263, gc_cc 111, array_buffer_copy 68, memcpy_memset 21; top self: `__syscall_cancel_arch [libc.so.6]` 258; `[unknown]` 75; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 29; `jsesc (resource://gre/modules/third_party/jsesc/js` 24; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 17
- **tab:8325** CPU ms by thread group: main 89, IPC I/O 14, other 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 89 ms (4.4% of span): Idle 61, Graphics 14, Other 8, JavaScript 3, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 2 / native 87; buckets: ipc 83, poll_wait 61, paint_layout 17, gc_cc 2, harness_diagnostics 2, canvas_2d 1, array_buffer_copy 1, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 61; `[]` 3; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 2; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const ` 1; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayL` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8262** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8157** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 344, DOM Worker 87, Renderer 39, Compositor 20, WRRenderBackend 19, WRSceneBuilder 15, Socket 9, IPC I/O 8, SwComposite 6, other 2, BgPool 2, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 344 ms (9.2% of span): Idle 75, GC / CC 60, JavaScript 59, Other 55, Layout 37, Graphics 27
  - JS leaf 9 / native under JS 63 / native 273; buckets: ipc 342, gc_cc 119, poll_wait 112, paint_layout 69, memcpy_memset 11, array_buffer_copy 8, subprocess_pipe_io 6, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 99; `[axiosozo-dev]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 8; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 6; `__memmove_evex_unaligned_erms [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 89 ms, GCSlice 26× 34 ms, CCSlice 2× 26 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 39 ms (top self: `__syscall_cancel_arch [libc.so.6]` 26, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 18, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); WRSceneBuilder#0 14 ms (top self: `syscall [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 86 ms: buckets worker_messaging 84, ipc 84, gc_cc 59, poll_wait 23, memcpy_memset 22, array_buffer_copy 8; top self: `__syscall_cancel_arch [libc.so.6]` 22; `madvise [libc.so.6]` 16; `unsigned long js::gc::Arena::finalize<JSString, (j` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__memset_evex_unaligned [libc.so.6]` 3
- **tab:8325** CPU ms by thread group: main 70, IPC I/O 6, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 70 ms (1.9% of span): Idle 27, Other 12, GC / CC 8, Graphics 8, JavaScript 6, Layout 4
  - JS leaf 0 / native under JS 7 / native 63; buckets: ipc 66, poll_wait 28, paint_layout 17, gc_cc 11, harness_diagnostics 3, array_buffer_copy 2, memcpy_memset 2, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 30; `[]` 2; `non-virtual thunk to nsGlobalWindowInner::Release() [libxul.` 1; `js::Proxy::getPrototype(JSContext*, JS::Handle<JSObject*>, J` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1
  - GC/CC markers: GCMajor 1× 36 ms, CCSlice 1× 4 ms, GCSlice 3× 4 ms, GCMinor 1× 1 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8157** CPU ms by thread group: main 8, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 8, DOM 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, poll_wait 8, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8262** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

