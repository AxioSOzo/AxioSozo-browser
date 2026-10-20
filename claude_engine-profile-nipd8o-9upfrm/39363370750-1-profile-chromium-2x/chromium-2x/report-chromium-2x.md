# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

