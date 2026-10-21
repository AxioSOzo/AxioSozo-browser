# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

