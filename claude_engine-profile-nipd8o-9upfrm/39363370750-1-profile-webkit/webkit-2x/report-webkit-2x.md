# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **57.0** (main 18.4, Renderer 16.7, DOM Worker 13.4, TaskCon~ller # 1.7, BgIOThr~Pool # 1.7) | WPEWebProcess 68.6, AxioWebKitHost 18.4, WPENetworkProce 10.0 | — | 565.3 |
| plain | idle | — | — | **7.4** (main 5.9, Timer 0.5, SwComposite 0.5, DOM Worker 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| plain | raf | 42.1 | 42.7 | **126.7** (main 47.0, DOM Worker 32.8, Renderer 21.6, SwComposite 16.4, TaskCon~ller # 3.5) | WPEWebProcess 181.3, AxioWebKitHost 25.1, WebExtensions 1.3, Privileged Cont 0.9 | — | — |
| plain | scroll | 17.0 | 86.9 | **112.7** (main 51.5, DOM Worker 38.6, Renderer 8.1, SwComposite 6.7, TaskCon~ller # 4.8) | WPEWebProcess 185.6, AxioWebKitHost 27.2, WebExtensions 0.5, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **18.9** (main 8.7, Renderer 3.8, SwComposite 3.0, DOM Worker 1.4, Timer 0.8) | WPEWebProcess 21.8, AxioWebKitHost 2.8 | 32.2 | — |
| plain | switch-to-gecko | — | — | **30.6** (main 8.7, Renderer 8.7, Socket Thread 4.4, Compositor 4.4, SwComposite 4.4) | Isolated Web Co 4.4 | — | 212.2 |
| trace | switch-to-engine | — | — | **93.2** (Renderer 54.7, main 22.5, DOM Worker 6.4, Timer 3.2, TaskCon~ller # 1.6) | WPEWebProcess 67.5, AxioWebKitHost 19.3, WPENetworkProce 9.7 | — | 589.9 |
| trace | idle | — | — | **4.9** (main 3.9, IPC I/O Parent 0.5, Timer 0.5) | Web Content 3.4, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| trace | raf | 41.0 | 42.9 | **124.0** (main 46.1, DOM Worker 32.7, Renderer 20.5, SwComposite 16.7, TaskCon~ller # 3.2) | WPEWebProcess 184.8, AxioWebKitHost 26.0 | — | — |
| trace | scroll | 7.9 | 153.4 | **38.0** (main 14.1, DOM Worker 9.5, Renderer 3.4, IndexedDB IO # 3.1, SwComposite 2.8) | WPEWebProcess 60.2, AxioWebKitHost 6.4, Privileged Cont 0.2, WebExtensions 0.1 | — | — |
| trace | key | — | — | **20.2** (main 9.3, Renderer 4.1, SwComposite 3.5, DOM Worker 1.4, Timer 0.8) | WPEWebProcess 23.0, AxioWebKitHost 3.4, Web Content 0.3 | 31.4 | — |
| trace | switch-to-gecko | — | — | **33.6** (main 8.4, Renderer 8.4, BgIOThr~Pool # 4.2, Compositor 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 4.2 | — | 213.8 |
| profile | switch-to-engine | — | — | **37.2** (DOM Worker 17.9, main 10.4, SamplerThread 7.4, Compositor 1.5) | WPEWebProcess 67.0, AxioWebKitHost 20.8, Web Content 17.9, WPENetworkProce 10.4 | — | 630.0 |
| profile | idle | — | — | **20.4** (main 6.3, DOM Worker 6.3, SamplerThread 5.8, Timer 1.5, Renderer 0.5) | Web Content 4.9, Socket Process 1.0, WebExtensions 1.0, RDD Process 1.0 | — | — |
| profile | raf | 37.2 | 49.2 | **132.6** (main 49.8, DOM Worker 31.2, Renderer 18.9, SwComposite 16.4, TaskCon~ller # 6.0) | WPEWebProcess 178.2, AxioWebKitHost 24.2, Web Content 6.0, Isolated Web Co 1.6 | — | — |
| profile | scroll | 8.1 | 167.5 | **38.6** (main 13.5, DOM Worker 9.7, SamplerThread 5.7, Renderer 3.6, SwComposite 2.8) | WPEWebProcess 61.0, Web Content 6.9, AxioWebKitHost 6.7, WebExtensions 1.4 | — | — |
| profile | key | — | — | **39.3** (main 13.4, DOM Worker 8.2, SamplerThread 6.8, Renderer 4.1, SwComposite 3.5) | WPEWebProcess 22.1, Web Content 6.0, AxioWebKitHost 3.3, WebExtensions 1.4 | 33.2 | — |
| profile | switch-to-gecko | — | — | **57.4** (main 16.4, Renderer 12.3, DOM Worker 12.3, BgIOThr~Pool # 4.1, Compositor 4.1) | Isolated Web Co 8.2 | — | 218.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 1.6 | 1.6 | 0 | 12.8 | 7925.3 | 1.00 | 224.3 | 18.0 | 0.03 | 4.5 | 17.54 | 12.87 | 4.67 | — | 0.056 |
| trace | raf | 41.5 | 41.9 | 0 | 97.3 | 2326.8 | 0.29 | 2.4 | 11.1 | 0.44 | 0.2 | 5.78 | 3.59 | 1.89 | — | 0.809 |
| trace | scroll | 7.0 | 7.0 | 0 | 15.0 | 1.2 | 0.00 | 16.2 | 0.0 | 0.02 | 0.2 | 1.52 | 0.10 | 1.34 | 165.4 | 0.120 |
| trace | key | 5.4 | 5.4 | 0 | 0.0 | 6.8 | 0.00 | 17.2 | 0.0 | 0.03 | 0.2 | 0.13 | 0.09 | 0.05 | 156.0 | 0.001 |
| profile | switch-to-engine | 1.5 | 1.5 | 0 | 11.9 | 7925.3 | 1.00 | 264.3 | 21.9 | 0.06 | 7.8 | 18.41 | 13.62 | 4.79 | — | 0.059 |
| profile | raf | 37.9 | 38.2 | 0 | 90.9 | 2399.8 | 0.30 | 0.3 | 13.5 | 0.50 | 0.4 | 6.79 | 4.36 | 2.20 | — | 0.871 |
| profile | scroll | 7.2 | 7.2 | 0 | 12.7 | 1.2 | 0.00 | 15.4 | 0.0 | 0.02 | 0.4 | 2.04 | 0.11 | 1.73 | 84.5 | 0.122 |
| profile | key | 5.4 | 5.4 | 0 | 0.0 | 6.8 | 0.00 | 17.0 | 0.0 | 0.04 | 0.4 | 0.28 | 0.11 | 0.16 | 155.4 | 0.002 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 27.6 | 0.2 | 0.1 | 0.2 | 0.1 | 156.0 | 29.8 | 185.9 |
| profile | 0.5 | 28.2 | 0.2 | 0.1 | 0.4 | 0.3 | 155.4 | 32.0 | 188.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 14.5; spawn AxioWebKitHost resolved 32.2; write hello 34.3; first stdout read resolved 96.8; write create 102.9; first large (>=64 KiB) read resolved 598.5; first frame accepted (EngineFrameSurface) 598.9; write frame_ack 599.1; write visibility 602.4; write focus 602.6; first ImageData 605.5; first putImageData end 620.8; first surface paint end 620.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 12.5; first stdout read resolved 19.1

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 23.2; spawn AxioWebKitHost resolved 52.1; write hello 58.1; first stdout read resolved 128.6; write create 130.7; first large (>=64 KiB) read resolved 637.0; first frame accepted (EngineFrameSurface) 637.5; write frame_ack 637.9; write visibility 644.2; write focus 644.4; first ImageData 647.2; first putImageData end 663.5; first surface paint end 663.7

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 19.5; first stdout read resolved 28.5

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 101, main 70, Renderer 14, IPC I/O 3, Compositor 2, SwComposite 2, WRRenderBackend 1, WRSceneBuilder 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 70 ms (10.2% of span): JavaScript 30, DOM 13, Idle 12, Other 7, Layout 3, Profiler 2
  - JS leaf 11 / native under JS 34 / native 25; buckets: ipc 70, gc_cc 24, worker_messaging 24, paint_layout 22, frame_surface_paint 17, array_buffer_copy 16, subprocess_pipe_io 14, poll_wait 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 9; `__memmove_evex_unaligned_erms [libc.so.6]` 8; `__lll_lock_wake [libc.so.6]` 5; `ARGBSetRow_X86 [libxul.so]` 4; `mozilla::IMEStateManager::SetIMEState(mozilla::widget::IMESt` 2
  - WebRender/compositor threads: Renderer 14 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `void clear_buffer<unsigned int>(Texture&, unsigned` 2); SwComposite 2 ms (top self: `syscall [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, worker_messaging 101, ipc 101, js_ctypes 44, gc_cc 43, poll_wait 40; top self: `__syscall_cancel_arch [libc.so.6]` 43; `js::gc::BufferAllocator::allocSmall(unsigned long,` 27; `__memmove_evex_unaligned_erms [libc.so.6]` 9; `syscall [libc.so.6]` 5; `[axiosozo-dev]` 3
- **tab:9364** CPU ms by thread group: main 53, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 53 ms (8.3% of span): Other 44, JavaScript 5, DOM 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 48; buckets: ipc 40, array_buffer_copy 19, gc_cc 14, subprocess_pipe_io 6, poll_wait 1, memcpy_memset 1
  - top self: `[]` 5; `syscall [libc.so.6]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `[libexpat.so.1]` 2; `PrefsIter::Next() [libxul.so]` 2; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
- **tab:9270** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.2% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::EventTargetChainItem::GetEventTargetParent(mozilla:` 0
- **tab:8810** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 127, DOM Worker 88, other 16, Renderer 4, SwComposite 3, Compositor 2, Socket 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 127 ms (6.2% of span): Idle 103, JavaScript 13, Other 7, DOM 2, Graphics 2, Profiler 1
  - JS leaf 1 / native under JS 13 / native 113; buckets: ipc 127, poll_wait 106, array_buffer_copy 5, memcpy_memset 3, gc_cc 2, engine_stream_read 2, canvas_2d 2, paint_layout 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 105; `[unknown]` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 4 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__syscall_cancel_arch [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 1); SwComposite 3 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 89 ms: buckets subprocess_pipe_io 89, worker_messaging 89, ipc 89, js_ctypes 88, poll_wait 88; top self: `__syscall_cancel_arch [libc.so.6]` 88; `[axiosozo-dev]` 0
- **tab:8924** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libglib-2.0.so.0]` 0
- **tab:8905** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:9276** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 1475, DOM Worker 929, Renderer 557, SwComposite 499, WRRenderBackend 45, Compositor 28, other 15, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1475 ms (46.4% of span): JavaScript 737, Idle 251, DOM 218, Other 132, GC / CC 105, Profiler 25
  - JS leaf 366 / native under JS 657 / native 452; buckets: ipc 1473, paint_layout 590, frame_surface_paint 568, gc_cc 433, worker_messaging 433, bgra_to_rgba 340, memcpy_memset 330, array_buffer_copy 319
  - top self: `__syscall_cancel_arch [libc.so.6]` 375; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 340; `__memmove_evex_unaligned_erms [libc.so.6]` 321; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 70; `[unknown]` 41; `__lll_lock_wait [libc.so.6]` 26
  - GC/CC markers: GCMajor 4× 591 ms, GCSlice 45× 191 ms, CCSlice 9× 35 ms, GCMinor 4× 3 ms, CC 4× 0 ms
  - WebRender/compositor threads: Renderer 557 ms (top self: `__syscall_cancel_arch [libc.so.6]` 283, `int blendTextureNearestFast<false, glsl::sampler2D` 86, `void scale_blit<true>(Texture&, IntRect const&, Te` 63); SwComposite 499 ms (top self: `syscall [libc.so.6]` 302, `void scale_blit<true>(Texture&, IntRect const&, Te` 177, `__memmove_evex_unaligned_erms [libc.so.6]` 19); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 17, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - busiest DOM Worker 929 ms: buckets subprocess_pipe_io 929, worker_messaging 921, ipc 921, js_ctypes 506, poll_wait 416, gc_cc 192; top self: `__syscall_cancel_arch [libc.so.6]` 517; `__memmove_evex_unaligned_erms [libc.so.6]` 98; `[axiosozo-dev]` 50; `__lll_lock_wake [libc.so.6]` 43; `syscall [libc.so.6]` 36
- **tab:9270** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 5, gc_cc 4, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::` 1; `mozilla::detail::nsDequeBase::PopFront() [libxul.so]` 1; `js::gc::BufferAllocator::traceSmallAlloc(JSTracer*, void*, c` 1; `__lll_lock_wait [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 0
  - GC/CC markers: GCMajor 1× 43 ms, GCSlice 3× 8 ms, CCSlice 1× 4 ms, GCMinor 1× 2 ms, CC 1× 0 ms
- **tab:8882** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8924** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 2162, DOM Worker 1308, Renderer 576, SwComposite 471, other 119, WRRenderBackend 48, Compositor 32, WRSceneBuilder 8, IPC I/O 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2162 ms (12.5% of span): Idle 1039, JavaScript 522, Other 192, GC / CC 183, DOM 152, Profiler 40
  - JS leaf 254 / native under JS 528 / native 1380; buckets: ipc 2146, poll_wait 1168, paint_layout 446, gc_cc 421, frame_surface_paint 365, worker_messaging 349, subprocess_pipe_io 272, bgra_to_rgba 250
  - top self: `__syscall_cancel_arch [libc.so.6]` 1128; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSur` 240; `__memmove_evex_unaligned_erms [libc.so.6]` 205; `[unknown]` 33; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned cha` 32; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 28
  - GC/CC markers: GCMajor 6× 2446 ms, GCSlice 60× 231 ms, CCSlice 11× 30 ms, GCMinor 37× 10 ms, CC 6× 0 ms
  - WebRender/compositor threads: Renderer 576 ms (top self: `__syscall_cancel_arch [libc.so.6]` 265, `int blendTextureNearestFast<false, glsl::sampler2D` 101, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 68); SwComposite 471 ms (top self: `syscall [libc.so.6]` 212, `void scale_blit<true>(Texture&, IntRect const&, Te` 196, `__memmove_evex_unaligned_erms [libc.so.6]` 60); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 17, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 1)
  - busiest DOM Worker 1301 ms: buckets subprocess_pipe_io 1301, worker_messaging 1298, ipc 1298, js_ctypes 936, poll_wait 847, gc_cc 216; top self: `__syscall_cancel_arch [libc.so.6]` 919; `__memmove_evex_unaligned_erms [libc.so.6]` 84; `mprotect [libc.so.6]` 43; `syscall [libc.so.6]` 35; `[axiosozo-dev]` 21
- **tab:8924** CPU ms by thread group: main 11, other 1, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 11 ms (0.1% of span): GC / CC 7, Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 9, gc_cc 7, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8810** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 8 ms (0.0% of span): GC / CC 6, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: gc_cc 6, ipc 6, poll_wait 2, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__syscall_cancel_arch [libc.so.6]` 1; `js::detail::OrderedHashTableImpl<js::PreBarriered<js::Hashab` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `mmap64 [libc.so.6]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8882** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 4, ipc 4, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[linux-vdso.so.1]` 1; `js::PropMapTable::trace(JSTracer*) [libxul.so]` 0; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 453, DOM Worker 221, Renderer 144, SwComposite 131, other 29, Compositor 15, WRRenderBackend 15, WRSceneBuilder 7, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 453 ms (12.3% of span): Idle 222, JavaScript 84, Graphics 40, Other 35, Layout 34, DOM 20
  - JS leaf 12 / native under JS 131 / native 310; buckets: ipc 450, poll_wait 261, paint_layout 93, gc_cc 83, worker_messaging 65, engine_stream_read 65, memcpy_memset 30, canvas_2d 25
  - top self: `__syscall_cancel_arch [libc.so.6]` 235; `__memmove_evex_unaligned_erms [libc.so.6]` 23; `[unknown]` 15; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `__memset_evex_unaligned_erms [libc.so.6]` 5
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 144 ms (top self: `__syscall_cancel_arch [libc.so.6]` 45, `void scale_blit<true>(Texture&, IntRect const&, Te` 30, `int blendTextureNearestFast<false, glsl::sampler2D` 22); SwComposite 131 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 57, `syscall [libc.so.6]` 42, `__memmove_evex_unaligned_erms [libc.so.6]` 32); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `webrender::prepare::prepare_picture [libxul.so]` 0)
  - busiest DOM Worker 221 ms: buckets subprocess_pipe_io 221, worker_messaging 221, ipc 221, js_ctypes 208, poll_wait 206, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 207; `[unknown]` 4; `[axiosozo-dev]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 1; `js::jit::PostWriteElementBarrier(JSRuntime*, JSObj` 1
- **tab:8810** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 0; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `mozilla::dom::JSActor::CallReceiveMessage(JSContext*, mozill` 0; `g_mutex_lock [libglib-2.0.so.0]` 0
- **tab:8882** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::ClearKeptObjects(JSContext*) [libxul.so]` 0
- **tab:8905** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 40, DOM Worker 14, SwComposite 6, Compositor 4, WRRenderBackend 3, IPC I/O 2, WRSceneBuilder 2, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 66 ms (23.6% of span): JavaScript 25, DOM 12, Other 10, Layout 8, Idle 4, Profiler 3
  - JS leaf 1 / native under JS 47 / native 18; buckets: ipc 65, gc_cc 19, array_buffer_copy 17, paint_layout 11, worker_messaging 8, engine_stream_read 5, poll_wait 4, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 5; `[axiosozo-dev]` 4; `js::jit::X86Encoding::BaseAssembler::X86InstructionFormatter` 3; `[unknown]` 2; `AutoPopupStatePusherInternal::~AutoPopupStatePusherInternal(` 2
  - WebRender/compositor threads: Renderer 40 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 5); SwComposite 6 ms (top self: `syscall [libc.so.6]` 6, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 1)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, poll_wait 13, js_ctypes 12; top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 1
- **tab:9270** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 26 ms (9.3% of span): JavaScript 10, Other 8, Idle 4, DOM 1, Profiler 1, Layout 1
  - JS leaf 0 / native under JS 11 / native 15; buckets: ipc 23, paint_layout 10, gc_cc 7, poll_wait 4, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 2; `mozilla::detail::nsTStringRepr<char>::Equals(mozilla::detail` 2; `nsTHashtable<nsBaseHashtableET<nsCStringHashKey, RefPtr<mozi` 1; `js::DefineDataProperty(JSContext*, JS::Handle<JSObject*>, JS` 1; `js::StringEqualsAscii(JSLinearString const*, char const*, un` 1
- **tab:8810** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (1.6% of span): Idle 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 2, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::jit::BaselineCompilerHandler::line() const [libxul.so]` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 0; `[]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateBytes(un` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sy` 0
- **tab:8882** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

