# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **72.9** (main 24.8, Renderer 23.1, DOM Worker 14.2, StyleThread# 1.8, TaskCon~ller # 1.8) | AxioCEFProbe 60.3, cef:gpu-process 21.3, cef:utility 12.4, cef:renderer 10.6 | — | 494.7 |
| plain | idle | — | — | **5.8** (main 4.3, IPC I/O Parent 0.5, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 0.5 | — | — |
| plain | raf | 59.9 | 21.0 | **64.6** (Renderer 18.6, SwComposite 17.0, main 9.9, Backgro~Pool # 6.1, DOM Worker 3.8) | cef:gpu-process 13.7, cef:renderer 12.2, AxioCEFProbe 11.3 | — | — |
| plain | raf-nosampler | — | — | **63.7** (Renderer 17.5, SwComposite 15.9, main 8.9, Backgro~Pool # 6.3, DOM Worker 3.6) | cef:gpu-process 15.2, cef:renderer 11.6, AxioCEFProbe 10.6 | — | — |
| plain | scroll | 59.8 | 21.7 | **78.0** (main 19.9, Renderer 18.0, SwComposite 15.1, DOM Worker 9.9, Backgro~Pool # 8.5) | cef:gpu-process 60.5, AxioCEFProbe 15.1, cef:renderer 14.3 | — | — |
| plain | key | — | — | **67.0** (main 18.3, DOM Worker 17.5, Indexed~ IO # 7.1, IndexedDB IO # 6.0, IPDL Background 4.9) | AxioCEFProbe 2.7, cef:renderer 1.9, cef:gpu-process 0.8, WebExtensions 0.3 | 12.8 | — |
| plain | switch-to-gecko | — | — | **5.1** (main 1.9, DOM Worker 1.1, TaskCon~ller # 0.5, IPDL Background 0.3, Renderer 0.3) | WebExtensions 0.2, RDD Process 0.1, Web Content 0.1, Isolated Web Co 0.1 | — | 15024.8 |
| profile | switch-to-engine | — | — | **53.9** (main 16.0, Renderer 13.1, DOM Worker 11.6, SamplerThread 5.8, Backgro~Pool # 2.9) | Web Content 69.8, AxioCEFProbe 58.2, cef:gpu-process 21.8, cef:utility 10.2 | — | 624.1 |
| profile | idle | — | — | **24.9** (SamplerThread 9.4, DOM Worker 8.4, main 5.2, Timer 1.4, Socket Thread 0.5) | Web Content 9.8, Privileged Cont 2.4, WebExtensions 2.3, Socket Process 1.4 | — | — |
| profile | raf | 60.0 | 21.3 | **94.8** (Renderer 20.4, SwComposite 17.8, main 14.0, DOM Worker 13.1, SamplerThread 12.7) | cef:gpu-process 15.2, cef:renderer 13.1, AxioCEFProbe 11.2, Web Content 10.8 | — | — |
| profile | raf-nosampler | — | — | **89.3** (Renderer 19.8, SwComposite 17.8, DOM Worker 12.9, main 11.5, SamplerThread 11.2) | cef:gpu-process 16.9, cef:renderer 13.1, AxioCEFProbe 11.2, Web Content 10.2 | — | — |
| profile | scroll | 59.9 | 23.2 | **109.2** (main 25.7, Renderer 20.5, SwComposite 17.7, DOM Worker 15.9, SamplerThread 10.7) | cef:gpu-process 68.1, AxioCEFProbe 16.4, cef:renderer 15.0, Web Content 9.4 | — | — |
| profile | key | — | — | **40.4** (main 11.4, DOM Worker 10.1, SamplerThread 9.8, Renderer 2.4, SwComposite 2.4) | Web Content 10.1, WebExtensions 2.5, AxioCEFProbe 2.4, cef:renderer 2.2 | 15.5 | — |
| profile | switch-to-gecko | — | — | **5.2** (SamplerThread 3.6, DOM Worker 0.5, main 0.4, Renderer 0.3, IPC I/O Parent 0.1) | Web Content 8.1, Privileged Cont 1.7, WebExtensions 1.6, Isolated Web Co 1.6 | — | 15723.5 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 5.6 | 0.0 | 0 | 0.0 | — | — | 4.0 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 58.0 | 0.0 | 0 | 0.0 | — | — | 11.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 4 | 4 | 2.103 | 9.278 | 0.0142 | 0.0625 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 189 | 0.186 | 0.790 | 0.0112 | 0.0473 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.215 | 0.783 | 0.0128 | 0.0467 |
| plain | scroll | memfd | native | 123 | 123 | 0.670 | 0.796 | 0.0386 | 0.0458 |
| plain | key | memfd | native | 21 | 21 | 0.053 | 0.825 | 0.0003 | 0.0047 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 4 | 4 | 2.952 | 6.571 | 0.0165 | 0.0367 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 191 | 191 | 0.231 | 0.874 | 0.0139 | 0.0525 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.238 | 0.880 | 0.0143 | 0.0528 |
| profile | scroll | memfd | native | 126 | 126 | 0.893 | 1.033 | 0.0518 | 0.0598 |
| profile | key | memfd | native | 21 | 21 | 0.068 | 0.872 | 0.0004 | 0.0049 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.7 | 0.1 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 44.0; spawn AxioCEFProbe resolved 100.0; write hello 107.8; first stdout read resolved 457.5; write create 463.9; write frame_ack 638.3; write focus 650.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 35.9; first stdout read resolved 46.8; write shutdown 53.2

### Profile: chromium-2x-control / switch-to-engine

- **parent** CPU ms by thread group: main 104, Renderer 103, DOM Worker 72, BgPool 32, SwComposite 10, Compositor 8, WRRenderBackend 5, IPC I/O 4, WRSceneBuilder 3, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 104 ms (14.5% of span): Layout 40, JavaScript 30, Idle 20, DOM 5, Profiler 5, Graphics 3
  - JS leaf 2 / native under JS 48 / native 54; buckets: ipc 104, paint_layout 52, gc_cc 33, poll_wait 21, array_buffer_copy 13, worker_messaging 10, subprocess_pipe_io 9, harness_diagnostics 6
  - top self: `poll [libc.so.6]` 21; `Gecko_AddRefAtom [libxul.so]` 6; `[axiosozo-dev]` 5; `selectors::matching::matches_complex_selector_list::{{closur` 5; `style::properties::cascade::Cascade::apply_non_prioritary_pr` 5; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 4
  - WebRender/compositor threads: Renderer 103 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 26, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 21, `int blendTextureNearestFast<true, glsl::sampler2D_` 6); SwComposite 10 ms (top self: `syscall [libc.so.6]` 10); WRRenderBackend#0 5 ms (top self: `syscall [libc.so.6]` 4, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `ARGBSetRow_X86 [libxul.so]` 7, `__memset_avx2_unaligned_erms [libc.so.6]` 5); BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 72 ms: buckets subprocess_pipe_io 72, worker_messaging 72, ipc 72, poll_wait 62, js_ctypes 47, memcpy_memset 2; top self: `poll [libc.so.6]` 43; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19; `JS::DescribeScriptedCaller(JS::AutoFilename*, JSCo` 2; `js::ctypes::CData::Create(JSContext*, JS::Handle<J` 2; `write [libc.so.6]` 1
- **tab:5054** CPU ms by thread group: main 56, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 56 ms (11.8% of span): Other 45, DOM 4, Profiler 3, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 50; buckets: ipc 43, array_buffer_copy 19, gc_cc 15, subprocess_pipe_io 6, poll_wait 3, memcpy_memset 2
  - top self: `[]` 7; `__lll_lock_wake [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `mprotect [libc.so.6]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5049** CPU ms by thread group: main 55, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 55 ms (10.4% of span): Other 40, Profiler 5, DOM 4, JavaScript 3, Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 49; buckets: ipc 42, array_buffer_copy 16, gc_cc 15, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 2
  - top self: `[]` 4; `[libexpat.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4891** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.5% of span): Idle 3, Layout 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, paint_layout 1, canvas_2d 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `gfxFont::MeasureGlyphs(gfxTextRun const*, unsigned int, unsi` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / idle

- **parent** CPU ms by thread group: DOM Worker 122, main 107, other 20, Socket 3, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 107 ms (5.0% of span): Idle 87, Other 7, JavaScript 7, DOM 3, GC / CC 3, Profiler 1
  - JS leaf 0 / native under JS 11 / native 96; buckets: ipc 107, poll_wait 91, harness_diagnostics 10, gc_cc 6, array_buffer_copy 4, json_metadata 1, memcpy_memset 0, native_receiver 0
  - top self: `poll [libc.so.6]` 88; `recvmsg [libc.so.6]` 1; `write [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `mozilla::dom::HasPropertyOnPrototype(JSContext*, JS::Handle<` 1; `XPCCallContext::SetName(JS::PropertyKey) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 122 ms: buckets subprocess_pipe_io 122, worker_messaging 122, ipc 122, js_ctypes 121, poll_wait 121, gc_cc 0; top self: `poll [libc.so.6]` 121; `js::RunScript(JSContext*, js::RunState&) [libxul.s` 0
- **tab:4891** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5049** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5054** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf

- **parent** CPU ms by thread group: Renderer 597, SwComposite 550, main 406, DOM Worker 312, BgPool 206, WRRenderBackend 76, Compositor 45, other 37, ImageBridge 19, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 406 ms (12.8% of span): Idle 276, JavaScript 64, Other 37, DOM 24, Profiler 4
  - JS leaf 6 / native under JS 74 / native 326; buckets: ipc 405, poll_wait 299, gc_cc 76, worker_messaging 38, engine_stream_read 37, json_metadata 20, array_buffer_copy 16, subprocess_pipe_io 15
  - top self: `poll [libc.so.6]` 278; `[unknown]` 14; `recvmsg [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `write [libc.so.6]` 4; `[axiosozo-dev]` 4
  - WebRender/compositor threads: Renderer 597 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 241, `int blendTextureNearestFast<false, glsl::sampler2D` 149, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 70); SwComposite 550 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 282, `syscall [libc.so.6]` 179, `__memmove_avx_unaligned_erms [libc.so.6]` 86); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 62, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 205 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 130, `__memmove_avx_unaligned_erms [libc.so.6]` 70, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1); ImageBridgeChld 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `nsThread::DrainDirectTasks() [libxul.so]` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 1 ms (top self: `write [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 312 ms: buckets subprocess_pipe_io 312, worker_messaging 312, ipc 312, js_ctypes 293, poll_wait 285, gc_cc 11; top self: `poll [libc.so.6]` 285; `write [libc.so.6]` 4; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 2; `getcontext [libc.so.6]` 1
- **tab:4627** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4588** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5054** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 569, SwComposite 520, main 333, DOM Worker 297, BgPool 197, WRRenderBackend 73, Compositor 43, ImageBridge 18, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 333 ms (10.9% of span): Idle 142, GC / CC 82, JavaScript 69, Other 24, DOM 15, Profiler 1
  - JS leaf 8 / native under JS 70 / native 254; buckets: ipc 333, poll_wait 162, gc_cc 161, engine_stream_read 44, worker_messaging 41, json_metadata 24, subprocess_pipe_io 19, array_buffer_copy 16
  - top self: `poll [libc.so.6]` 144; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[unknown]` 9; `[axiosozo-dev]` 7; `recvmsg [libc.so.6]` 7; `fun_trace(JSTracer*, JSObject*) [libxul.so]` 7
  - GC/CC markers: GCMajor 2× 190 ms, GCSlice 22× 70 ms, CCSlice 2× 20 ms, GCMinor 3× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 569 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 211, `int blendTextureNearestFast<false, glsl::sampler2D` 153, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 84); SwComposite 520 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 235, `syscall [libc.so.6]` 188, `__memmove_avx_unaligned_erms [libc.so.6]` 91); WRRenderBackend#0 73 ms (top self: `syscall [libc.so.6]` 56, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 197 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 131, `__memmove_avx_unaligned_erms [libc.so.6]` 61, `axio::SinkState::Present() [libxul.so]` 1); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `mozilla::layers::TextureClientRecycleAllocator::Re` 0, `[axiosozo-dev]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 297 ms: buckets subprocess_pipe_io 297, worker_messaging 297, ipc 297, js_ctypes 277, poll_wait 270, gc_cc 7; top self: `poll [libc.so.6]` 270; `[axiosozo-dev]` 2; `write [libc.so.6]` 2; `[unknown]` 2; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Ha` 2
- **tab:5054** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5049** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4627** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / scroll

- **parent** CPU ms by thread group: main 521, Renderer 429, SwComposite 369, DOM Worker 288, BgPool 201, WRRenderBackend 55, Compositor 29, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 521 ms (24.0% of span): Idle 310, JavaScript 95, Other 61, DOM 19, Graphics 13, Profiler 13
  - JS leaf 10 / native under JS 100 / native 411; buckets: ipc 521, poll_wait 391, gc_cc 94, paint_layout 54, worker_messaging 45, engine_stream_read 26, subprocess_pipe_io 22, array_buffer_copy 19
  - top self: `poll [libc.so.6]` 324; `[unknown]` 18; `[axiosozo-dev]` 10; `recvmsg [libc.so.6]` 8; `write [libc.so.6]` 4; `getcontext [libc.so.6]` 4
  - WebRender/compositor threads: Renderer 429 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 235, `int blendTextureNearestFast<false, glsl::sampler2D` 61, `void scale_blit<true>(Texture&, IntRect const&, Te` 35); SwComposite 369 ms (top self: `syscall [libc.so.6]` 231, `void scale_blit<true>(Texture&, IntRect const&, Te` 121, `__memmove_avx_unaligned_erms [libc.so.6]` 17); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 201 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 126, `__memmove_avx_unaligned_erms [libc.so.6]` 65, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 288 ms: buckets subprocess_pipe_io 288, worker_messaging 288, ipc 288, js_ctypes 257, poll_wait 248, gc_cc 13; top self: `poll [libc.so.6]` 248; `mozilla::dom::WorkerEventTarget::Dispatch(already_` 4; `_ZZN7mozilla20ProfileChunkedBuffer16ReserveAndPutR` 4; `[unknown]` 3; `getcontext [libc.so.6]` 3
- **tab:4533** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 11 ms (0.5% of span): GC / CC 9, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 10, gc_cc 9, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 2; `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char c` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onObject` 1
  - GC/CC markers: GCMajor 1× 31 ms, GCSlice 4× 15 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4588** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): GC / CC 2, Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, gc_cc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsComponentManagerImpl::GetServiceLocked(mozilla::Maybe<mozi` 0; `bool js::gc::UnmarkGrayTracer<1u>::onChild<js::Shape>(js::Sh` 0; `sendmsg [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4893** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / key

- **parent** CPU ms by thread group: main 385, DOM Worker 264, Renderer 94, SwComposite 82, other 36, BgPool 20, Compositor 15, WRRenderBackend 15, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 385 ms (10.4% of span): Idle 161, JavaScript 85, Layout 42, Other 37, Graphics 24, DOM 18
  - JS leaf 11 / native under JS 135 / native 238; buckets: ipc 385, poll_wait 202, gc_cc 105, paint_layout 79, worker_messaging 74, engine_stream_read 41, subprocess_pipe_io 24, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 166; `[unknown]` 13; `[axiosozo-dev]` 8; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 94 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 27, `int blendTextureNearestFast<false, glsl::sampler2D` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 16); SwComposite 82 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 36, `syscall [libc.so.6]` 29, `__memmove_avx_unaligned_erms [libc.so.6]` 17); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 1); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 264 ms: buckets subprocess_pipe_io 264, worker_messaging 264, ipc 264, js_ctypes 253, poll_wait 248, gc_cc 6; top self: `poll [libc.so.6]` 248; `mozilla::RunMicroTask(JSContext*, mozilla::CycleCo` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:4533** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.` 0; `[unknown]` 0; `js::jit::DoGetPropFallback(JSContext*, js::jit::BaselineFram` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4627** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4609** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: DOM Worker 72, main 70, Renderer 47, BgPool 10, IPC I/O 7, Compositor 5, WRRenderBackend 3, SwComposite 3, Socket 2, other 2, WRSceneBuilder 2, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 70 ms (0.4% of span): Idle 19, JavaScript 18, Layout 17, Other 10, DOM 5, Graphics 2
  - JS leaf 2 / native under JS 28 / native 41; buckets: ipc 70, paint_layout 24, poll_wait 19, array_buffer_copy 12, gc_cc 10, harness_diagnostics 10, memcpy_memset 3, subprocess_pipe_io 2
  - top self: `poll [libc.so.6]` 19; `sendmsg [libc.so.6]` 4; `madvise [libc.so.6]` 3; `style::properties::generated::longhands::flex_shrink::cascad` 2; `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 1; `ProfilingStack::pushLabelFrame(char const*, char const*, voi` 1
  - GC/CC markers: GCMinor 2× 1 ms
  - WebRender/compositor threads: Renderer 47 ms (top self: `int blendTextureNearestFast<true, glsl::sampler2D_` 13, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 0); SwComposite 3 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 9 ms (top self: `unlink [libc.so.6]` 5, `getdents64 [libc.so.6]` 2, `rmdir [libc.so.6]` 1); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 72 ms: buckets subprocess_pipe_io 72, worker_messaging 72, ipc 72, gc_cc 56, poll_wait 15, js_ctypes 15; top self: `poll [libc.so.6]` 13; `[axiosozo-dev]` 10; `madvise [libc.so.6]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5
- **tab:4627** CPU ms by thread group: main 7, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 5, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: ipc 7, poll_wait 5, gc_cc 2
  - top self: `poll [libc.so.6]` 5; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 1; `js::jit::CacheRegisterAllocator::useRegister(js::jit::MacroA` 1; `read [libc.so.6]` 0; `js::jit::CanBaselineCompileScript(JSContext*, JSScript*) [li` 0; `fog_serialize_ipc_buf [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4588** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4891** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 4, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `sendmsg [libc.so.6]` 1; `mozilla::EventTargetChainItem::HandleEventTargetChain(nsTArr` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

