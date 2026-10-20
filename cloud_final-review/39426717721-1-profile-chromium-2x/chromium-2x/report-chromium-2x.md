# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **112.6** (Renderer 45.1, main 39.4, DOM Worker 11.3, TaskCon~ller # 5.6, WRRende~ckend# 5.6) | cef:renderer 22.5, AxioCEFProbe 22.5, cef:utility 11.3 | — | 149.8 |
| plain | idle | — | — | **3.4** (main 2.4, Timer 0.5, IPDL Background 0.5) | Web Content 3.9, AxioCEFProbe 1.0 | — | — |
| plain | raf | 59.9 | 22.7 | **32.6** (main 8.8, Renderer 5.9, SwComposite 5.2, Backgro~Pool # 4.2, DOM Worker 2.9) | cef:gpu-process 11.7, AxioCEFProbe 10.5, cef:renderer 9.2 | — | — |
| plain | raf-nosampler | — | — | **24.7** (Renderer 5.3, main 4.6, SwComposite 4.0, Backgro~Pool # 3.6, DOM Worker 2.3) | cef:gpu-process 11.0, AxioCEFProbe 8.6, cef:renderer 8.4, cef:utility 0.3 | — | — |
| plain | scroll | 60.3 | 21.5 | **49.5** (main 17.3, Backgro~Pool # 9.9, DOM Worker 7.4, Renderer 5.4, SwComposite 4.0) | cef:gpu-process 49.4, AxioCEFProbe 13.8, cef:renderer 11.4 | — | — |
| plain | key | — | — | **18.2** (main 8.5, Renderer 2.8, SwComposite 1.9, DOM Worker 1.1, Timer 0.6) | cef:renderer 3.3, AxioCEFProbe 2.8, cef:gpu-process 0.9, WebExtensions 0.3 | 13.6 | — |
| plain | switch-to-gecko | — | — | **12.1** (DOM Worker 4.3, main 3.9, IPDL Background 1.5, TaskCon~ller # 1.1, StreamTrans # 0.5) | Web Content 0.1, WebExtensions 0.1 | — | 15023.5 |
| trace | switch-to-engine | — | — | **102.8** (Renderer 63.4, main 26.4, glean.dispatche 2.6, WrGlyph~terizer 2.6, WRRende~ckend# 2.6) | AxioCEFProbe 52.7, cef:gpu-process 26.4, cef:renderer 13.2, cef:zygote 10.6 | — | 347.9 |
| trace | idle | — | — | **2.4** (main 1.9, Timer 0.5) | AxioCEFProbe 2.5, Web Content 1.9, cef:zygote 0.5, Privileged Cont 0.5 | — | — |
| trace | raf | 59.9 | 20.9 | **28.6** (main 7.5, Renderer 5.6, SwComposite 4.9, Backgro~Pool # 3.9, DOM Worker 2.3) | cef:gpu-process 10.8, AxioCEFProbe 9.4, cef:renderer 7.5 | — | — |
| trace | raf-nosampler | — | — | **22.8** (Renderer 5.6, SwComposite 4.6, main 4.0, Backgro~Pool # 3.3, DOM Worker 2.3) | cef:gpu-process 10.7, AxioCEFProbe 9.3, cef:renderer 8.1 | — | — |
| trace | scroll | 60.1 | 22.8 | **46.7** (main 15.9, Backgro~Pool # 10.4, DOM Worker 6.9, Renderer 5.5, SwComposite 4.0) | cef:gpu-process 49.2, AxioCEFProbe 14.4, cef:renderer 12.0 | — | — |
| trace | key | — | — | **17.1** (main 7.7, Renderer 3.0, SwComposite 2.2, DOM Worker 1.1, Timer 0.5) | AxioCEFProbe 3.0, cef:renderer 2.8, cef:gpu-process 0.5, WebExtensions 0.3 | 13.5 | — |
| trace | switch-to-gecko | — | — | **2.1** (main 0.8, TaskCon~ller # 0.4, DOM Worker 0.2, Renderer 0.1, Backgro~Pool # 0.1) | WebExtensions 0.1, Web Content 0.1, Privileged Cont 0.1 | — | 15626.5 |
| profile | switch-to-engine | — | — | **115.9** (Renderer 40.4, main 30.3, DOM Worker 15.1, SamplerThread 10.1, glean.dispatche 5.0) | AxioCEFProbe 40.2, cef:renderer 25.2, Privileged Cont 5.0 | — | 150.2 |
| profile | idle | — | — | **20.4** (DOM Worker 6.8, SamplerThread 6.3, main 5.3, Timer 1.5, glean.dispatche 0.5) | Web Content 4.9, AxioCEFProbe 2.5, WebExtensions 1.5, cef:utility 1.0 | — | — |
| profile | raf | 60.0 | 21.2 | **57.2** (main 12.0, DOM Worker 11.7, SamplerThread 9.8, Renderer 6.8, SwComposite 5.5) | AxioCEFProbe 11.7, cef:gpu-process 11.4, cef:renderer 9.2, Web Content 7.2 | — | — |
| profile | raf-nosampler | — | — | **48.9** (DOM Worker 10.9, SamplerThread 8.3, Renderer 7.0, main 6.3, SwComposite 5.3) | AxioCEFProbe 10.9, cef:gpu-process 10.6, cef:renderer 9.6, Web Content 6.9 | — | — |
| profile | scroll | 60.0 | 21.2 | **75.2** (main 22.1, DOM Worker 15.7, Backgro~Pool # 10.8, SamplerThread 9.8, Renderer 5.9) | cef:gpu-process 49.2, AxioCEFProbe 13.8, cef:renderer 12.2, Web Content 6.9 | — | — |
| profile | key | — | — | **37.2** (main 11.5, DOM Worker 8.2, SamplerThread 7.7, Renderer 3.0, SwComposite 2.5) | Web Content 6.8, AxioCEFProbe 2.8, cef:renderer 2.2, WebExtensions 1.9 | 16.0 | — |
| profile | switch-to-gecko | — | — | **4.1** (SamplerThread 2.7, main 0.5, DOM Worker 0.4, IPC I/O Parent 0.1, Renderer 0.1) | Web Content 6.1, Privileged Cont 1.5, Isolated Web Co 1.5, WebExtensions 1.2 | — | 15025.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.0 | 0.0 | 0 | 0.0 | — | — | 28.6 | 0.0 | — | 6.75 | 0.51 | — | — | — | — | — | 0.003 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.29 | 0.10 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 11.2 | 0.0 | — | 0.85 | 0.09 | — | — | — | — | — | 0.006 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 5.0 | 0.0 | — | 0.16 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 9.3 | 0.0 | 0 | 0.0 | — | — | 9.4 | 0.0 | — | 6.00 | 1.19 | — | — | — | — | — | 0.011 |
| profile | raf | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.35 | 0.15 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.30 | 0.14 | — | — | — | — | — | 0.009 |
| profile | scroll | 58.5 | 0.0 | 0 | 0.0 | — | — | 11.6 | 0.0 | — | 0.93 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.4 | 0.0 | — | 0.27 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 4.822 | 5.256 | 0.0251 | 0.0273 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.222 | 0.421 | 0.0133 | 0.0252 |
| plain | raf-nosampler | memfd | native | 182 | 181 | 0.180 | 0.377 | 0.0108 | 0.0225 |
| plain | scroll | memfd | native | 120 | 120 | 0.752 | 0.972 | 0.0441 | 0.0570 |
| plain | key | memfd | native | 21 | 21 | 0.093 | 0.295 | 0.0005 | 0.0017 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 3.127 | 5.674 | 0.0158 | 0.0286 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 185 | 185 | 0.197 | 0.405 | 0.0119 | 0.0243 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.170 | 0.364 | 0.0102 | 0.0219 |
| trace | scroll | memfd | native | 120 | 120 | 0.769 | 0.981 | 0.0455 | 0.0580 |
| trace | key | memfd | native | 21 | 21 | 0.095 | 0.304 | 0.0005 | 0.0017 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 5.390 | 12.115 | 0.0500 | 0.1124 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.237 | 0.444 | 0.0142 | 0.0267 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.201 | 0.420 | 0.0121 | 0.0252 |
| profile | scroll | memfd | native | 120 | 120 | 0.830 | 1.075 | 0.0485 | 0.0629 |
| profile | key | memfd | native | 21 | 21 | 0.111 | 0.295 | 0.0006 | 0.0017 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.7 | 9.0 | 0.0 | — | 0.16 | 0.40 | — | — | 8.1 | 10.3 | 18.9 |
| profile | 0.9 | 11.5 | 0.1 | — | 0.27 | 0.59 | — | — | 9.2 | 13.0 | 21.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 182.3; write create 184.7; first frame applied (native receiver) 360.3; write frame_ack 361.1; write focus 368.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 17.4; first stdout read resolved 26.6; write shutdown 31.5

Switch timeline (profile, switch-to-engine, ms after the window start): write create 26.1; first stdout read resolved 33.0; first frame applied (native receiver) 153.2; write frame_ack 155.3; write focus 167.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 24.9; first stdout read resolved 37.3; write shutdown 40.0

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 86, main 66, BgPool 19, DOM Worker 14, SwComposite 10, WRRenderBackend 5, Compositor 4, WRSceneBuilder 3, Socket 1, WRWorker 0, IPC I/O 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 66 ms (30.7% of span): DOM 18, JavaScript 13, Layout 12, Idle 12, Graphics 6, Profiler 2
  - JS leaf 4 / native under JS 35 / native 26; buckets: ipc 66, paint_layout 24, gc_cc 17, array_buffer_copy 15, poll_wait 13, harness_diagnostics 11, canvas_2d 5, webrender_render 4
  - top self: `poll [libc.so.6]` 12; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 7; `mozilla::net::nsStandardURL::nsStandardURL(bool, bool) [libx` 7; `<style::values::specified::corner_shape::CornerShape as styl` 5; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 4; `mozilla::nsCSSGradientRenderer::TryPaintTilesWithExtendMode(` 4
  - WebRender/compositor threads: Renderer 86 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 15, `__lll_lock_wake [libc.so.6]` 11); SwComposite 10 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 19 ms (top self: `ARGBSetRow_X86 [libxul.so]` 6, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memset_avx512_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 11, poll_wait 11, gc_cc 1; top self: `poll [libc.so.6]` 11; `__lll_lock_wake [libc.so.6]` 1; `mozilla::dom::(anonymous namespace)::ExternalRunna` 1; `mprotect [libc.so.6]` 1; `[unknown]` 0
- **tab:3826** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.4% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, webrender_render 0
  - top self: `poll [libc.so.6]` 3; `mozilla::dom::BrowserChild::GetFrom(mozilla::layers::LayersI` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4020** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3335** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 95, DOM Worker 86, other 16, Socket 1, IPC I/O 1, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 95 ms (4.6% of span): Idle 76, Other 5, JavaScript 5, GC / CC 4, Profiler 3, DOM 1
  - JS leaf 0 / native under JS 7 / native 87; buckets: ipc 95, poll_wait 79, harness_diagnostics 7, gc_cc 7, array_buffer_copy 5, memcpy_memset 2, subprocess_pipe_io 2, worker_messaging 0
  - top self: `poll [libc.so.6]` 76; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [` 1; `[axiosozo-dev]` 1; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [li` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1
  - GC/CC markers: CCSlice 1× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 86 ms: buckets subprocess_pipe_io 86, js_ctypes 86, worker_messaging 86, ipc 86, poll_wait 86; top self: `poll [libc.so.6]` 86
- **tab:3335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::detail::nsTStringRepr<char>::Equals(char const*) co` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4015** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `firefox_on_glean::metrics::__glean_metric_maps::COUNTER_MAP:` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4020** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 337, DOM Worker 268, Renderer 193, SwComposite 157, BgPool 128, WRRenderBackend 47, Compositor 35, other 26, ImageBridge 15, WRSceneBuilder 7, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 337 ms (10.9% of span): Idle 242, JavaScript 52, Other 25, DOM 12, Profiler 4, GC / CC 2
  - JS leaf 6 / native under JS 56 / native 274; buckets: ipc 335, poll_wait 252, gc_cc 54, engine_stream_read 28, worker_messaging 22, json_metadata 15, harness_diagnostics 13, subprocess_pipe_io 10
  - top self: `poll [libc.so.6]` 244; `[unknown]` 9; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 193 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 107, `__memmove_avx512_unaligned_erms [libc.so.6]` 64, `syscall [libc.so.6]` 10); SwComposite 157 ms (top self: `syscall [libc.so.6]` 121, `__memmove_avx512_unaligned_erms [libc.so.6]` 34, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `webrender::tile_cache::TileCacheInstance::update_p` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 128 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `__memmove_avx512_unaligned_erms [libc.so.6]` 29, `BackgroundEventTarget::Release() [libxul.so]` 1); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `__lll_lock_wake [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 267, ipc 267, js_ctypes 247, poll_wait 243, gc_cc 10; top self: `poll [libc.so.6]` 243; `write [libc.so.6]` 3; `[axiosozo-dev]` 2; `JSObject::allocKindForTenure(js::Nursery const&) c` 1; `_ZZN7mozilla20ProfileChunkedBuffer16ReserveAndPutR` 1
- **tab:4015** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3294** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 247, Renderer 184, main 177, SwComposite 151, BgPool 117, WRRenderBackend 46, Compositor 35, ImageBridge 14, WRSceneBuilder 7, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 177 ms (5.8% of span): Idle 106, JavaScript 45, Other 17, DOM 9, Profiler 1
  - JS leaf 5 / native under JS 45 / native 127; buckets: ipc 177, poll_wait 113, gc_cc 49, worker_messaging 29, engine_stream_read 28, subprocess_pipe_io 13, json_metadata 11, native_receiver 10
  - top self: `poll [libc.so.6]` 107; `[unknown]` 11; `recvmsg [libc.so.6]` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 2
  - WebRender/compositor threads: Renderer 183 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `__memmove_avx512_unaligned_erms [libc.so.6]` 68, `syscall [libc.so.6]` 7); SwComposite 151 ms (top self: `syscall [libc.so.6]` 107, `__memmove_avx512_unaligned_erms [libc.so.6]` 41, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 117 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 87, `__memmove_avx512_unaligned_erms [libc.so.6]` 25, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 14 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mojo::core::ports::UserMessageEvent::~UserMessageE` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 247 ms: buckets subprocess_pipe_io 247, worker_messaging 247, ipc 247, js_ctypes 226, poll_wait 220, gc_cc 6; top self: `poll [libc.so.6]` 220; `[unknown]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 2; `mozilla::Queue<nsCOMPtr<nsIRunnable>, 16ul>::Pop()` 1
- **tab:3831** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 1; `[]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3294** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4015** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 412, DOM Worker 271, BgPool 220, Renderer 111, SwComposite 87, WRRenderBackend 31, Compositor 22, other 17, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 412 ms (20.1% of span): Idle 259, JavaScript 74, Other 39, Graphics 16, DOM 12, Profiler 10
  - JS leaf 10 / native under JS 73 / native 330; buckets: ipc 412, poll_wait 306, gc_cc 68, worker_messaging 40, paint_layout 38, subprocess_pipe_io 20, array_buffer_copy 19, engine_stream_read 18
  - top self: `poll [libc.so.6]` 260; `[unknown]` 10; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `[axiosozo-dev]` 3
  - WebRender/compositor threads: Renderer 111 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx512_unaligned_erms [libc.so.6]` 23, `syscall [libc.so.6]` 11); SwComposite 87 ms (top self: `syscall [libc.so.6]` 80, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 219 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 126, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `[linux-vdso.so.1]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `rename [libc.so.6]` 0)
  - busiest DOM Worker 271 ms: buckets subprocess_pipe_io 271, worker_messaging 271, ipc 271, js_ctypes 242, poll_wait 233, gc_cc 8; top self: `poll [libc.so.6]` 233; `__lll_lock_wait [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[unknown]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 2
- **tab:4020** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<Ad` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3294** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 389, DOM Worker 200, Renderer 118, SwComposite 77, other 28, WRRenderBackend 20, Compositor 17, WRWorker 11, WRSceneBuilder 10, BgPool 8, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 389 ms (10.6% of span): Idle 155, JavaScript 79, Layout 42, Other 35, Graphics 30, DOM 28
  - JS leaf 10 / native under JS 141 / native 239; buckets: ipc 388, poll_wait 196, gc_cc 104, paint_layout 84, worker_messaging 72, engine_stream_read 45, subprocess_pipe_io 21, harness_diagnostics 16
  - top self: `poll [libc.so.6]` 156; `[unknown]` 21; `[axiosozo-dev]` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `write [libc.so.6]` 4; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 44, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 13); SwComposite 77 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 51, `syscall [libc.so.6]` 23, `UnlockResource [libxul.so]` 1); WRRenderBackend#0 20 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `mozilla::layers::TextureClient::Unlock() [libxul.s` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::ipc::MessageChannel::OnMessageReceivedFro` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 200 ms: buckets subprocess_pipe_io 200, worker_messaging 200, ipc 200, js_ctypes 189, poll_wait 183, gc_cc 6; top self: `poll [libc.so.6]` 183; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `PLDHashTable::Search(void const*) const [libxul.so` 2; `[axiosozo-dev]` 1
- **tab:3233** CPU ms by thread group: main 8, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0, GC / CC 0, Other 0
  - JS leaf 0 / native under JS 1 / native 7; buckets: ipc 8, poll_wait 6, array_buffer_copy 2, gc_cc 1, memcpy_memset 0
  - top self: `poll [libc.so.6]` 6; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `[]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[1` 0; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::TaskController::HasMainThreadPendingTasks() [libxul` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3335** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `TimerThread::AddTimer(nsTimerImpl*, mozilla::detail::BaseAut` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 67, DOM Worker 61, Renderer 34, IPC I/O 6, BgPool 6, SwComposite 5, Compositor 4, other 3, WRRenderBackend 3, WRSceneBuilder 2, Socket 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 67 ms (0.4% of span): Idle 20, JavaScript 14, Other 10, Layout 10, DOM 6, GC / CC 5
  - JS leaf 1 / native under JS 29 / native 37; buckets: ipc 67, poll_wait 22, paint_layout 17, gc_cc 14, harness_diagnostics 9, array_buffer_copy 9, memcpy_memset 4, canvas_2d 3
  - top self: `poll [libc.so.6]` 20; `madvise [libc.so.6]` 3; `nsTextFrame::GetInFlowContentLength() [libxul.so]` 3; `[unknown]` 3; `mprotect [libc.so.6]` 2; `__memcmp_evex_movbe [libc.so.6]` 1
  - GC/CC markers: CCSlice 1× 4 ms, GCMinor 3× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 34 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 14, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9, `hypotf@@GLIBC_2.35 [libm.so.6]` 1); SwComposite 5 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `core::hash::BuildHasher::hash_one [libxul.so]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 5 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 1, `fstatat64 [libc.so.6]` 0); BackgroundThreadPool #3 1 ms (top self: `syscall [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 61 ms: buckets subprocess_pipe_io 61, worker_messaging 61, ipc 61, gc_cc 49, poll_wait 14, js_ctypes 13; top self: `poll [libc.so.6]` 10; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `madvise [libc.so.6]` 7; `mozilla::dom::Timeout::~Timeout() [libxul.so]` 4; `mozilla::SourceLocation::~SourceLocation() [libxul` 4
- **tab:3335** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0; `[libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3831** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `mozilla::dom::AutoYieldJSThreadExecution::AutoYieldJSThreadE` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3826** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 4, DOM 0, Other 0, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 4, paint_layout 1
  - top self: `poll [libc.so.6]` 4; `mozilla::gfx::Matrix4x4TypedFlagged<mozilla::LayoutDevicePix` 0; `nsIFrame::CanBeDynamicReflowRoot() const [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

