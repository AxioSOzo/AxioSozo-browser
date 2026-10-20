# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **48.4** (main 16.7, Renderer 14.9, DOM Worker 13.0, glean.dispatche 1.9, WRRende~ckend# 1.9) | WPEWebProcess 65.0, AxioWebKitHost 16.7, WPENetworkProce 11.2 | — | 513.9 |
| plain | idle | — | — | **8.9** (main 4.9, TaskCon~ller # 1.0, glean.dispatche 0.5, Timer 0.5, Renderer 0.5) | Web Content 2.9, AxioWebKitHost 0.5 | — | — |
| plain | raf | 57.8 | 29.5 | **56.0** (main 24.2, Renderer 9.2, DOM Worker 8.5, SwComposite 7.2, TaskCon~ller # 2.9) | WPEWebProcess 77.0, AxioWebKitHost 9.5, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 51.8 | 36.0 | **105.5** (main 50.5, DOM Worker 28.4, Renderer 8.3, TaskCon~ller # 6.9, SwComposite 6.4) | WPEWebProcess 79.0, AxioWebKitHost 12.7, WebExtensions 0.5, Web Content 0.5 | — | — |
| plain | key | — | — | **14.0** (main 8.5, Renderer 1.1, SwComposite 1.1, DOM Worker 1.1, Timer 0.5) | WPEWebProcess 8.2, AxioWebKitHost 1.4, Isolated Web Co 0.3 | 25.1 | — |
| plain | switch-to-gecko | — | — | **21.9** (main 8.7, IPC I/O Parent 4.4, Renderer 4.4, sqldb:p~lite # 4.4) | WebExtensions 4.4 | — | 210.8 |
| trace | switch-to-engine | — | — | **50.8** (Renderer 20.4, main 14.3, DOM Worker 6.1, glean.dispatche 2.0, WrGlyph~terizer 2.0) | WPEWebProcess 69.3, AxioWebKitHost 20.4, WPENetworkProce 12.2 | — | 467.7 |
| trace | idle | — | — | **4.4** (main 3.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 3.4 | — | — |
| trace | raf | 57.7 | 23.5 | **56.9** (main 25.2, Renderer 8.8, DOM Worker 8.5, SwComposite 6.9, TaskCon~ller # 2.9) | WPEWebProcess 76.0, AxioWebKitHost 9.8 | — | — |
| trace | scroll | 12.6 | 155.5 | **31.1** (main 12.6, DOM Worker 7.5, Indexed~ IO # 2.9, Renderer 1.8, SwComposite 1.3) | WPEWebProcess 22.5, AxioWebKitHost 2.8, Web Content 0.1, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **13.8** (main 8.2, Renderer 1.4, SwComposite 1.1, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 7.1, AxioWebKitHost 1.7 | 25.8 | — |
| trace | switch-to-gecko | — | — | **17.5** (main 8.7, Renderer 4.4, DOM Worker 4.4) |  | — | 211.2 |
| profile | switch-to-engine | — | — | **28.3** (DOM Worker 13.3, main 8.3, SamplerThread 5.0, Softwar~cThread 1.7) | WPEWebProcess 61.3, Web Content 31.5, AxioWebKitHost 18.2, WPENetworkProce 9.9 | — | 574.3 |
| profile | idle | — | — | **24.1** (main 8.3, DOM Worker 6.4, SamplerThread 6.4, Timer 1.5, glean.dispatche 0.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 58.1 | 22.9 | **84.7** (main 32.2, DOM Worker 16.6, Renderer 9.8, SamplerThread 8.1, SwComposite 7.2) | WPEWebProcess 79.0, AxioWebKitHost 10.1, Web Content 6.2, Privileged Cont 1.6 | — | — |
| profile | scroll | 12.4 | 153.9 | **37.6** (main 13.5, DOM Worker 10.4, SamplerThread 6.4, Renderer 1.9, TaskCon~ller # 1.4) | WPEWebProcess 23.5, Web Content 7.2, AxioWebKitHost 2.7, Privileged Cont 1.6 | — | — |
| profile | key | — | — | **33.3** (main 12.1, DOM Worker 8.2, SamplerThread 6.3, Renderer 1.6, Timer 1.1) | WPEWebProcess 8.0, Web Content 6.0, WebExtensions 1.7, Socket Process 1.1 | 26.6 | — |
| profile | switch-to-gecko | — | — | **37.6** (main 12.5, DOM Worker 8.3, IPC I/O Parent 4.2, BgIOThr~Pool # 4.2, Renderer 4.2) | Isolated Web Co 4.2 | — | 216.0 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.0 | 4.0 | 0 | 10.3 | 2524.0 | 1.00 | 95.8 | 6.2 | 0.02 | 3.1 | 6.09 | 4.45 | 1.64 | — | 0.049 |
| trace | raf | 57.4 | 57.7 | 0 | 39.3 | 671.9 | 0.27 | 14.1 | 1.5 | 0.13 | 0.2 | 1.24 | 0.71 | 0.54 | 85.6 | 0.187 |
| trace | scroll | 11.7 | 11.2 | 10 | 14.8 | 0.6 | 0.00 | 11.1 | 0.0 | 0.01 | 0.5 | 0.72 | 2.16 | 0.43 | 111.9 | 0.073 |
| trace | key | 5.5 | 5.5 | 0 | 0.0 | 1.8 | 0.00 | 7.1 | 0.0 | 0.02 | 8.9 | 0.11 | 0.07 | 0.04 | 153.9 | 0.001 |
| profile | switch-to-engine | 3.2 | 3.2 | 0 | 8.3 | 2524.0 | 1.00 | 107.6 | 8.1 | 0.02 | 5.6 | 7.10 | 5.16 | 1.94 | — | 0.049 |
| profile | raf | 58.2 | 58.5 | 0 | 39.6 | 665.5 | 0.26 | 13.1 | 1.7 | 0.14 | 0.3 | 1.49 | 0.82 | 0.70 | — | 0.226 |
| profile | scroll | 11.7 | 11.0 | 13 | 13.9 | 0.5 | 0.00 | 10.7 | 0.0 | 0.01 | 0.4 | 0.81 | 0.29 | 0.59 | 118.9 | 0.082 |
| profile | key | 5.5 | 5.5 | 0 | 0.0 | 1.8 | 0.00 | 7.0 | 0.0 | 0.02 | 8.2 | 0.28 | 0.11 | 0.14 | 153.6 | 0.002 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 14.4 | 0.1 | 0.1 | 8.9 | 0.1 | 153.9 | 24.8 | 178.8 |
| profile | 0.5 | 15.4 | 0.2 | 0.1 | 8.2 | 0.3 | 153.6 | 24.5 | 178.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 10.9; spawn AxioWebKitHost resolved 23.6; write hello 25.7; first stdout read resolved 80.8; write create 81.8; first large (>=64 KiB) read resolved 472.5; first frame accepted (EngineFrameSurface) 472.9; write frame_ack 473.1; write visibility 476.4; write focus 476.6; first ImageData 479.1; first putImageData end 483.7; first surface paint end 483.8

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 12.0; first stdout read resolved 17.3

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 31.9; spawn AxioWebKitHost resolved 62.3; write hello 68.5; first stdout read resolved 125.8; write create 127.0; first large (>=64 KiB) read resolved 583.7; first frame accepted (EngineFrameSurface) 584.0; write frame_ack 584.5; write visibility 591.2; write focus 591.5; first ImageData 594.8; first putImageData end 600.7; first surface paint end 600.8

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.6; first stdout read resolved 26.1

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 58, DOM Worker 51, Renderer 7, IPC I/O 3, Compositor 2, WRSceneBuilder 2, WRRenderBackend 1, SwComposite 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 58 ms (9.4% of span): JavaScript 23, Idle 11, DOM 10, Layout 9, Other 3, Graphics 2
  - JS leaf 5 / native under JS 31 / native 23; buckets: ipc 58, paint_layout 21, gc_cc 20, worker_messaging 19, frame_surface_paint 13, poll_wait 11, array_buffer_copy 11, canvas_2d 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `ARGBSetRow_X86 [libxul.so]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 4; `[unknown]` 3; `nsFlexContainerFrame::DoFlexLayout(mozilla::ReflowInput cons` 2
  - WebRender/compositor threads: Renderer 7 ms (top self: `floorf [libxul.so]` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 1); WRSceneBuilder#0 1 ms (top self: `webrender::clip::ClipTreeBuilder::build_clip_set [` 1, `syscall [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRRenderBackend#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0)
  - busiest DOM Worker 51 ms: buckets subprocess_pipe_io 51, worker_messaging 51, ipc 51, js_ctypes 34, poll_wait 32, array_buffer_copy 5; top self: `__syscall_cancel_arch [libc.so.6]` 34; `__lll_lock_wake [libc.so.6]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 3; `__abort_lock_unlock [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7817** CPU ms by thread group: main 50, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 50 ms (8.7% of span): Other 40, Profiler 4, JavaScript 3, DOM 2, Idle 0
  - JS leaf 0 / native under JS 3 / native 46; buckets: ipc 36, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 1
  - top self: `[]` 6; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `[libexpat.so.1]` 3; `mmap64 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7820** CPU ms by thread group: main 38, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 37 ms (6.0% of span): Other 27, JavaScript 5, DOM 4, Idle 2
  - JS leaf 0 / native under JS 4 / native 34; buckets: ipc 29, array_buffer_copy 13, gc_cc 7, subprocess_pipe_io 3, poll_wait 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 3; `[]` 3; `nsTSubstring<char>::ReplaceLiteral(unsigned long, unsigned l` 3; `array_proto_finish(JSContext*, JS::Handle<JSObject*>, JS::Ha` 3; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7731** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.3% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, memcpy_memset 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 144, DOM Worker 90, other 16, Renderer 1, Compositor 1, SwComposite 1, Socket 0, IPC I/O 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 144 ms (7.0% of span): Idle 120, Other 7, JavaScript 7, DOM 4, Profiler 3, GC / CC 2
  - JS leaf 1 / native under JS 12 / native 131; buckets: ipc 144, poll_wait 122, gc_cc 4, array_buffer_copy 4, engine_stream_read 2, canvas_2d 2, paint_layout 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 121; `[axiosozo-dev]` 2; `[unknown]` 1; `syscall [libc.so.6]` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1; `ARGBSetRow_X86 [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `sched_yield [libc.so.6]` 0, `syscall [libc.so.6]` 0)
  - busiest DOM Worker 90 ms: buckets subprocess_pipe_io 90, worker_messaging 90, ipc 90, js_ctypes 89, poll_wait 89, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 89; `[axiosozo-dev]` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(J` 0
- **tab:7386** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7731** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 935, DOM Worker 440, Renderer 278, SwComposite 219, WRRenderBackend 56, Compositor 37, other 23, WRSceneBuilder 11, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 935 ms (30.2% of span): JavaScript 295, Idle 282, DOM 108, GC / CC 99, Other 97, Profiler 36
  - JS leaf 125 / native under JS 341 / native 469; buckets: ipc 928, poll_wait 305, gc_cc 274, paint_layout 257, worker_messaging 243, frame_surface_paint 231, memcpy_memset 135, subprocess_pipe_io 114
  - top self: `__syscall_cancel_arch [libc.so.6]` 307; `__memmove_evex_unaligned_erms [libc.so.6]` 118; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 109; `[unknown]` 40; `[axiosozo-dev]` 21; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 20
  - GC/CC markers: GCMajor 3× 331 ms, GCSlice 23× 84 ms, CCSlice 7× 22 ms, GCMinor 3× 3 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 278 ms (top self: `__syscall_cancel_arch [libc.so.6]` 162, `int blendTextureNearestFast<false, glsl::sampler2D` 39, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 18); SwComposite 219 ms (top self: `syscall [libc.so.6]` 152, `void scale_blit<true>(Texture&, IntRect const&, Te` 56, `__memmove_evex_unaligned_erms [libc.so.6]` 11); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1)
  - busiest DOM Worker 440 ms: buckets subprocess_pipe_io 440, worker_messaging 439, ipc 439, js_ctypes 348, poll_wait 299, gc_cc 52; top self: `__syscall_cancel_arch [libc.so.6]` 336; `[axiosozo-dev]` 12; `__memmove_evex_unaligned_erms [libc.so.6]` 11; `[unknown]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 7
- **tab:7731** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, gc_cc 3, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `js::NestedIterator<js::gc::SweepGroupZonesIter, js::NestedIt` 1; `js::gc::GCRuntime::collect(bool, JS::SliceBudget const&, JS:` 0; `nsTimerImpl::CancelImpl(bool) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7345** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::ExecuteNextTaskOnlyMainThreadIntern` 0
- **tab:7367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 2156, DOM Worker 1392, Renderer 305, SwComposite 231, other 125, WRRenderBackend 65, Compositor 44, WRSceneBuilder 13, IPC I/O 5, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2156 ms (12.6% of span): Idle 987, JavaScript 508, Other 238, GC / CC 165, DOM 130, Profiler 65
  - JS leaf 174 / native under JS 563 / native 1419; buckets: ipc 2142, poll_wait 1133, gc_cc 434, paint_layout 393, worker_messaging 388, frame_surface_paint 278, subprocess_pipe_io 255, array_buffer_copy 196
  - top self: `__syscall_cancel_arch [libc.so.6]` 1072; `__memmove_evex_unaligned_erms [libc.so.6]` 160; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 144; `[unknown]` 58; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 46; `[axiosozo-dev]` 42
  - GC/CC markers: GCMajor 6× 1907 ms, GCSlice 48× 149 ms, CCSlice 7× 22 ms, GCMinor 22× 9 ms, CC 6× 0 ms
  - WebRender/compositor threads: Renderer 305 ms (top self: `__syscall_cancel_arch [libc.so.6]` 155, `int blendTextureNearestFast<false, glsl::sampler2D` 44, `void scale_blit<true>(Texture&, IntRect const&, Te` 30); SwComposite 231 ms (top self: `syscall [libc.so.6]` 155, `void scale_blit<true>(Texture&, IntRect const&, Te` 63, `__memmove_evex_unaligned_erms [libc.so.6]` 11); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - busiest DOM Worker 1381 ms: buckets subprocess_pipe_io 1381, worker_messaging 1378, ipc 1378, js_ctypes 1076, poll_wait 992, gc_cc 146; top self: `__syscall_cancel_arch [libc.so.6]` 1066; `__memmove_evex_unaligned_erms [libc.so.6]` 96; `syscall [libc.so.6]` 37; `[axiosozo-dev]` 21; `mprotect [libc.so.6]` 16
- **tab:7386** CPU ms by thread group: main 11, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 11 ms (0.1% of span): GC / CC 6, Idle 5, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 11, gc_cc 6, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 3× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7285** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 8 ms (0.0% of span): GC / CC 6, Idle 2
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 7, gc_cc 6, poll_wait 3, array_buffer_copy 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `unsigned long js::gc::Arena::finalize<JSObject, (js::gc::Fin` 1; `__printf_buffer_write [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7345** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, poll_wait 4, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `std::io::impls::<impl std::io::Write for &mut W>::write_all ` 1; `firefox_on_glean::private::labeled::LabeledMetric<T,E>::get_` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `__lll_lock_wake [libc.so.6]` 0; `nsTimer::Cancel() [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: main 410, DOM Worker 209, Renderer 51, SwComposite 40, other 26, Compositor 14, WRRenderBackend 12, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 410 ms (11.2% of span): Idle 200, JavaScript 75, Graphics 41, Other 33, Layout 29, DOM 16
  - JS leaf 9 / native under JS 115 / native 287; buckets: ipc 409, poll_wait 237, paint_layout 79, gc_cc 78, worker_messaging 59, engine_stream_read 58, subprocess_pipe_io 22, array_buffer_copy 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 209; `[unknown]` 12; `[axiosozo-dev]` 8; `__memmove_evex_unaligned_erms [libc.so.6]` 7; `__memcmp_evex_movbe [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 51 ms (top self: `__syscall_cancel_arch [libc.so.6]` 27, `int blendTextureNearestFast<false, glsl::sampler2D` 8, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); SwComposite 40 ms (top self: `syscall [libc.so.6]` 23, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - busiest DOM Worker 209 ms: buckets subprocess_pipe_io 209, worker_messaging 209, ipc 209, js_ctypes 195, poll_wait 191, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 191; `[axiosozo-dev]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 2; `nsProfilerStartParams::GetFilters() [libxul.so]` 2; `mozilla::ProfileBufferBlockIndex profiler_add_mark` 1
- **tab:7285** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 6, Profiler 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla` 0; `mozilla::dom::TryToOuterize(JS::MutableHandle<JS::Value>) [l` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
- **tab:7345** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `XRE_IsContentProcess() [libxul.so]` 0
- **tab:7367** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 67, Renderer 18, DOM Worker 13, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 67 ms (24.1% of span): JavaScript 29, Layout 9, Other 8, DOM 8, Idle 5, Profiler 4
  - JS leaf 5 / native under JS 41 / native 21; buckets: ipc 67, array_buffer_copy 18, gc_cc 15, paint_layout 15, worker_messaging 9, poll_wait 6, subprocess_pipe_io 6, engine_stream_read 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBa` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 2; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<mo` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::try_recv ` 0, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, poll_wait 12, js_ctypes 11, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSC` 0; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0; `[unknown]` 0
- **tab:7731** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 26 ms (9.3% of span): JavaScript 9, Other 8, Idle 4, Layout 3, DOM 1, GC / CC 0
  - JS leaf 0 / native under JS 9 / native 17; buckets: ipc 24, gc_cc 8, poll_wait 5, subprocess_pipe_io 4, paint_layout 3, memcpy_memset 1, canvas_2d 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 1; `js::SharedImmutableScriptData::createWith(js::FrontendContex` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 1
- **tab:7285** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (1.7% of span): Idle 4, DOM 1, Other 0
  - JS leaf 0 / native under JS 1 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 1; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `mozilla::dom::WindowGlobalChild::RecvRawMessage(mozilla::dom` 0
- **tab:7817** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

