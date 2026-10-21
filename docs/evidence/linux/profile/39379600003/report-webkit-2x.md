# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

