# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **94.2** (main 43.9, Renderer 25.1, StyleThread# 6.3, WrGlyph~terizer 6.3, WRRende~ckend# 6.3) | AxioCEFProbe 37.7, cef:renderer 18.8, cef:utility 6.3 | — | 128.5 |
| plain | idle | — | — | **3.9** (main 2.4, DOM Worker 1.0, IPC I/O Parent 0.5) | Web Content 2.9 | — | — |
| plain | raf | 60.0 | 21.3 | **23.8** (main 7.8, Renderer 3.2, DOM Worker 3.2, SwComposite 2.3, Backgro~Pool # 1.6) | cef:gpu-process 11.6, cef:renderer 11.4, AxioCEFProbe 7.4, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **21.2** (main 6.3, Renderer 3.0, SwComposite 2.3, DOM Worker 2.3, Backgro~Pool # 2.0) | cef:gpu-process 12.3, cef:renderer 10.3, AxioCEFProbe 6.3 | — | — |
| plain | scroll | 59.9 | 26.5 | **41.5** (main 18.5, DOM Worker 6.3, Backgro~Pool # 5.4, Renderer 3.4, TaskCon~ller # 1.9) | cef:gpu-process 43.9, cef:renderer 12.2, AxioCEFProbe 10.2 | — | — |
| plain | key | — | — | **14.3** (main 6.9, Renderer 1.9, SwComposite 0.8, DOM Worker 0.8, glean.dispatche 0.6) | cef:renderer 2.0, AxioCEFProbe 1.7, cef:gpu-process 0.9, WebExtensions 0.3 | 11.8 | — |
| plain | switch-to-gecko | — | — | **12.0** (DOM Worker 3.4, main 3.3, Indexed~ IO # 2.2, IPDL Background 0.9, TaskCon~ller # 0.9) |  | — | 15244.3 |
| trace | switch-to-engine | — | — | **86.4** (Renderer 55.2, main 20.7, Backgro~Pool # 3.5, Compositor 3.5, DOM Worker 3.5) | AxioCEFProbe 44.9, cef:gpu-process 27.6, cef:utility 13.8, cef:renderer 10.4 | — | 259.9 |
| trace | idle | — | — | **2.9** (main 1.9, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 2.5, Web Content 1.9, cef:zygote 0.5 | — | — |
| trace | raf | 60.1 | 20.8 | **21.2** (main 7.5, Renderer 2.9, DOM Worker 2.9, SwComposite 1.9, Backgro~Pool # 1.6) | cef:renderer 10.4, cef:gpu-process 10.3, AxioCEFProbe 6.4 | — | — |
| trace | raf-nosampler | — | — | **17.8** (main 4.6, Renderer 3.0, DOM Worker 2.7, Backgro~Pool # 2.0, SwComposite 2.0) | cef:gpu-process 11.0, cef:renderer 9.6, AxioCEFProbe 5.7, Web Content 0.3 | — | — |
| trace | scroll | 59.9 | 21.5 | **37.0** (main 15.7, DOM Worker 5.4, Backgro~Pool # 4.4, Renderer 3.0, SwComposite 2.5) | cef:gpu-process 39.4, cef:renderer 11.3, AxioCEFProbe 8.4 | — | — |
| trace | key | — | — | **9.8** (main 5.5, Renderer 1.7, DOM Worker 0.8, SwComposite 0.6, Timer 0.3) | cef:renderer 2.6, AxioCEFProbe 1.4, cef:gpu-process 0.9, WebExtensions 0.3 | 11.1 | — |
| trace | switch-to-gecko | — | — | **1.6** (main 0.6, TaskCon~ller # 0.4, DOM Worker 0.2, Renderer 0.1, glean.dispatche 0.1) | Privileged Cont 0.1, WebExtensions 0.1 | — | 15956.6 |
| profile | switch-to-engine | — | — | **109.7** (Renderer 34.8, main 29.9, SamplerThread 10.0, IPC I/O Parent 5.0, Socket Thread 5.0) | Web Content 54.7, cef:renderer 19.9, AxioCEFProbe 19.9, cef:utility 5.0 | — | 156.4 |
| profile | idle | — | — | **12.5** (SamplerThread 4.8, DOM Worker 3.8, main 2.9, Timer 1.0) | Web Content 4.8, AxioCEFProbe 3.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 60.0 | 26.9 | **38.5** (main 9.7, DOM Worker 7.7, SamplerThread 7.4, Renderer 3.5, SwComposite 2.3) | cef:gpu-process 11.2, cef:renderer 10.6, AxioCEFProbe 7.0, Web Content 5.2 | — | — |
| profile | raf-nosampler | — | — | **30.3** (DOM Worker 6.6, main 6.0, SamplerThread 6.0, Renderer 3.0, SwComposite 2.0) | cef:gpu-process 11.7, cef:renderer 10.0, AxioCEFProbe 6.7, Web Content 5.3 | — | — |
| profile | scroll | 60.0 | 27.6 | **59.7** (main 22.3, DOM Worker 11.1, SamplerThread 7.3, Backgro~Pool # 5.8, Renderer 3.4) | cef:gpu-process 43.6, cef:renderer 13.6, AxioCEFProbe 10.2, Web Content 5.3 | — | — |
| profile | key | — | — | **28.7** (main 7.7, BgIOThr~Pool # 6.1, SamplerThread 5.2, DOM Worker 4.7, Renderer 1.9) | Web Content 5.5, AxioCEFProbe 2.9, cef:renderer 1.9, WebExtensions 1.4 | 13.0 | — |
| profile | switch-to-gecko | — | — | **3.3** (SamplerThread 2.1, DOM Worker 0.4, main 0.3, Renderer 0.1, Compositor 0.1) | Web Content 5.9, WebExtensions 1.1, Privileged Cont 1.1, Isolated Web Co 1.1 | — | 15025.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.6 | 0.0 | 0 | 0.0 | — | — | 26.3 | 0.0 | — | 2.93 | 0.65 | — | — | — | — | — | 0.004 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.17 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.18 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 8.7 | 0.0 | — | 0.40 | 0.12 | — | — | — | — | — | 0.008 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.6 | 0.0 | — | 0.27 | 0.09 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 9.0 | 0.0 | 0 | 0.0 | — | — | 8.5 | 0.0 | — | 5.46 | 0.65 | — | — | — | — | — | 0.006 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.19 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.21 | 0.15 | — | — | — | — | — | 0.009 |
| profile | scroll | 59.1 | 0.0 | 0 | 0.0 | — | — | 10.8 | 0.0 | — | 0.50 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 4.3 | 0.0 | — | 0.33 | 0.10 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 4.221 | 4.479 | 0.0239 | 0.0254 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.106 | 0.162 | 0.0064 | 0.0098 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.113 | 0.165 | 0.0068 | 0.0099 |
| plain | scroll | memfd | native | 121 | 121 | 0.390 | 0.462 | 0.0229 | 0.0271 |
| plain | key | memfd | native | 21 | 21 | 0.035 | 0.135 | 0.0002 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 2.571 | 3.852 | 0.0169 | 0.0254 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.104 | 0.154 | 0.0063 | 0.0092 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.113 | 0.162 | 0.0068 | 0.0097 |
| trace | scroll | memfd | native | 121 | 121 | 0.333 | 0.392 | 0.0197 | 0.0232 |
| trace | key | memfd | native | 21 | 21 | 0.028 | 0.110 | 0.0002 | 0.0006 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 4.163 | 4.676 | 0.0376 | 0.0422 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 187 | 187 | 0.116 | 0.177 | 0.0070 | 0.0106 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.118 | 0.178 | 0.0071 | 0.0107 |
| profile | scroll | memfd | native | 123 | 123 | 0.459 | 0.503 | 0.0271 | 0.0297 |
| profile | key | memfd | native | 21 | 21 | 0.032 | 0.098 | 0.0002 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 6.5 | 0.0 | — | 0.24 | 0.41 | — | — | 6.9 | 7.5 | 15.0 |
| profile | 0.7 | 8.2 | 0.0 | — | 0.32 | 0.53 | — | — | 7.4 | 9.4 | 17.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 93.3; write create 106.5; first frame applied (native receiver) 267.8; write frame_ack 268.9; write focus 274.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 17.9; first stdout read resolved 25.2; write shutdown 28.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 31.2; first stdout read resolved 51.0; first frame applied (native receiver) 167.6; write frame_ack 168.6; write focus 178.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 20.1; first stdout read resolved 26.0; write shutdown 35.7

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 65, Renderer 51, DOM Worker 14, BgPool 13, Compositor 5, WRRenderBackend 4, SwComposite 4, WRSceneBuilder 3, IPC I/O 2, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 65 ms (29.3% of span): JavaScript 12, Other 12, DOM 12, Layout 12, Idle 12, Graphics 4
  - JS leaf 0 / native under JS 32 / native 33; buckets: ipc 65, gc_cc 29, paint_layout 25, poll_wait 12, worker_messaging 10, harness_diagnostics 10, array_buffer_copy 10, json_metadata 6
  - top self: `poll [libc.so.6]` 12; `nsNodeSupportsWeakRefTearoff::GetWeakReference(nsIWeakRefere` 8; `JS::NewStringFromKnownLiveTwoByteBuffer(JSContext*, mozilla:` 5; `js::EnvironmentIter::settle() [libxul.so]` 5; `mozilla::StyleGenericSize<mozilla::StyleLengthPercentage>::~` 4; `__lll_lock_wake [libc.so.6]` 4
  - WebRender/compositor threads: Renderer 51 ms (top self: `webrender::renderer::Renderer::draw_alpha_batch_co` 8, `hypotf@@GLIBC_2.35 [libm.so.6]` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 13 ms (top self: `ARGBSetRow_X86 [libxul.so]` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memset_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 12, poll_wait 12, array_buffer_copy 0; top self: `poll [libc.so.6]` 12; `nsTSubstring<char>::StartBulkWriteImpl(unsigned lo` 1; `__lll_lock_wake [libc.so.6]` 0
- **tab:4200** CPU ms by thread group: main 39, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (20.4% of span): Other 27, DOM 4, JavaScript 4, Profiler 2, Idle 2
  - JS leaf 0 / native under JS 5 / native 34; buckets: ipc 30, array_buffer_copy 13, gc_cc 8, subprocess_pipe_io 4, poll_wait 3, memcpy_memset 2
  - top self: `access [libc.so.6]` 4; `atp_set_real_time_limit [libxul.so]` 3; `js::XDRStencilDecoder::codeStencil(JS::ReadOnlyDecodeOptions` 2; `poll [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4205** CPU ms by thread group: main 39, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (22.8% of span): Other 28, Profiler 4, JavaScript 4, DOM 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 3 / native 36; buckets: ipc 29, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 3, poll_wait 2, image_container 1, memcpy_memset 0, json_metadata 0
  - top self: `__lll_lock_wake [libc.so.6]` 3; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 3; `[]` 2; `[libexpat.so.1]` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `readlink [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4010** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 2, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 0
  - top self: `poll [libc.so.6]` 2; `nsIFrame::GetBorderRadii(nsSize const&, nsSize const&, mozil` 0; `nsLayoutUtils::ShouldHandleMetaViewport(mozilla::dom::Docume` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 52, DOM Worker 38, other 10, IPC I/O 0, Socket 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 52 ms (2.5% of span): Idle 45, JavaScript 5, Other 2, DOM 1, Profiler 0
  - JS leaf 1 / native under JS 5 / native 47; buckets: ipc 52, poll_wait 46, harness_diagnostics 5, gc_cc 4, array_buffer_copy 3, subprocess_pipe_io 2, native_receiver 0, json_metadata 0
  - top self: `poll [libc.so.6]` 45; `recvmsg [libc.so.6]` 1; `[unknown]` 1; `js::frontend::EmitterScope::lookupInCache(js::frontend::Byte` 1; `toString (chrome://remote/content/marionette/message.sys.mjs` 1; `write [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 38 ms: buckets subprocess_pipe_io 38, js_ctypes 38, worker_messaging 38, ipc 38, poll_wait 38; top self: `poll [libc.so.6]` 38; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0
- **tab:4205** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4200** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4010** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 265, DOM Worker 162, Renderer 102, SwComposite 64, BgPool 60, WRRenderBackend 48, Compositor 32, other 22, ImageBridge 13, WRSceneBuilder 7, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 265 ms (8.5% of span): Idle 178, JavaScript 51, Other 21, DOM 11, Profiler 3, GC / CC 2
  - JS leaf 7 / native under JS 50 / native 208; buckets: ipc 265, poll_wait 189, gc_cc 60, worker_messaging 31, engine_stream_read 25, json_metadata 19, subprocess_pipe_io 17, native_receiver 12
  - top self: `poll [libc.so.6]` 179; `[unknown]` 8; `recvmsg [libc.so.6]` 7; `[axiosozo-dev]` 3; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 101 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 73, `__memmove_avx512_unaligned_erms [libc.so.6]` 15, `syscall [libc.so.6]` 5); SwComposite 64 ms (top self: `syscall [libc.so.6]` 60, `__memmove_avx512_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 60 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `mozilla::layers::TextureClientRecycleAllocator::Cr` 0); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13, `__lll_lock_wake [libc.so.6]` 0, `std::pair<std::__detail::_Node_iterator<std::pair<` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 162 ms: buckets subprocess_pipe_io 162, worker_messaging 162, ipc 162, js_ctypes 151, poll_wait 150, memcpy_memset 3; top self: `poll [libc.so.6]` 150; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `[unknown]` 2; `write [libc.so.6]` 1; `mozilla::dom::WorkerPrivate::DoRunLoop(JSContext*)` 1
- **tab:4010** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Other 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, gc_cc 1, poll_wait 1
  - top self: `mozilla::RunnableTask::SetIdleDeadline(mozilla::TimeStamp) [` 1; `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry co` 0; `nsQueryReferent::operator()(nsID const&, void**) const [libx` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3498** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): DOM 1, Idle 1, JavaScript 0
  - JS leaf 0 / native under JS 2 / native 1; buckets: ipc 3, poll_wait 1, gc_cc 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `js::StableCellHasher<js::WeakHeapPtr<js::GlobalObject*> >::m` 0; `prctl [libc.so.6]` 0; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3480** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: main 173, DOM Worker 152, Renderer 90, BgPool 59, SwComposite 58, WRRenderBackend 43, Compositor 30, ImageBridge 12, WRSceneBuilder 7, other 1, IPC I/O 0, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 173 ms (5.7% of span): Idle 105, JavaScript 41, Other 14, DOM 9, GC / CC 3, Profiler 1
  - JS leaf 4 / native under JS 46 / native 124; buckets: ipc 173, poll_wait 109, gc_cc 54, worker_messaging 31, engine_stream_read 22, json_metadata 18, subprocess_pipe_io 10, native_receiver 8
  - top self: `poll [libc.so.6]` 103; `[unknown]` 9; `recvmsg [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 2; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 90 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 16, `writev [libc.so.6]` 2); SwComposite 58 ms (top self: `syscall [libc.so.6]` 55, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `std::sys::backtrace::__rust_begin_short_backtrace ` 0); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 59 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `__lll_lock_wait [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 152 ms: buckets subprocess_pipe_io 152, worker_messaging 152, ipc 152, js_ctypes 146, poll_wait 145, gc_cc 3; top self: `poll [libc.so.6]` 145; `[axiosozo-dev]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `JS::NewArrayBufferWithContents(JSContext*, unsigne` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:4200** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `nsTHashtable<nsBaseHashtableET<nsIntegralHashKey<long, 0>, R` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3480** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4205** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 444, DOM Worker 196, BgPool 116, Renderer 70, SwComposite 37, WRRenderBackend 34, Compositor 25, other 16, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 444 ms (21.3% of span): Idle 236, JavaScript 100, Other 50, DOM 24, Layout 18, Graphics 12
  - JS leaf 10 / native under JS 106 / native 327; buckets: ipc 443, poll_wait 309, gc_cc 95, paint_layout 51, worker_messaging 45, engine_stream_read 39, json_metadata 27, subprocess_pipe_io 20
  - top self: `poll [libc.so.6]` 240; `[unknown]` 25; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 4; `mozilla::Vector<unsigned char, 80ul, js::StringBuilderAllocP` 4; `mozilla::dom::Event::SetOwner(mozilla::dom::EventTarget*) [l` 4
  - WebRender/compositor threads: Renderer 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 48, `syscall [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 5); SwComposite 37 ms (top self: `syscall [libc.so.6]` 37, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 27, `sched_yield [libc.so.6]` 3, `[linux-vdso.so.1]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 116 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 76, `__memmove_avx512_unaligned_erms [libc.so.6]` 37, `[linux-vdso.so.1]` 1); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `mojo::core::ports::Node::PrepareToForwardUserMessa` 0, `mozilla::ProfileBufferBlockIndex profiler_add_mark` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 196 ms: buckets subprocess_pipe_io 196, worker_messaging 196, ipc 196, js_ctypes 171, poll_wait 164, gc_cc 8; top self: `poll [libc.so.6]` 164; `getcontext [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `read [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2
- **tab:3459** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `mozilla::TaskController::ExecuteNextTaskOnlyMainThreadIntern` 0; `mozilla::CycleCollectedJSRuntime::FinalizeDeferredThings(moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4015** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4200** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 258, BgPool 227, DOM Worker 102, Renderer 71, SwComposite 27, other 19, WRRenderBackend 15, Compositor 12, WRWorker 9, WRSceneBuilder 7, ImageBridge 1, IPC I/O 1, Socket 1, Canvas 0, ImageIO 0
  - main thread 258 ms (7.1% of span): Idle 103, JavaScript 54, Layout 28, Graphics 27, Other 25, DOM 12
  - JS leaf 12 / native under JS 81 / native 166; buckets: ipc 258, poll_wait 137, paint_layout 63, gc_cc 57, worker_messaging 41, engine_stream_read 28, subprocess_pipe_io 12, array_buffer_copy 9
  - top self: `poll [libc.so.6]` 103; `[unknown]` 10; `[axiosozo-dev]` 6; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&,` 5; `mozilla::nsDisplayListBuilder::AllocateDisplayItemClipChain(` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 71 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `void commit_solid_span<true>(unsigned int*, unsign` 6); SwComposite 27 ms (top self: `syscall [libc.so.6]` 20, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `webrender::render_task_graph::RenderTaskGraphBuild` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 224 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 213, `write [libc.so.6]` 9, `close [libc.so.6]` 1); BackgroundThreadPool #3 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 102 ms: buckets subprocess_pipe_io 102, worker_messaging 102, ipc 102, js_ctypes 98, poll_wait 97, gc_cc 2; top self: `poll [libc.so.6]` 97; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1; `read [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:3412** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `__strlen_evex [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `js::ReactToUnwrappedPromise(JSContext*, JS::Handle<js::Promi` 0; `[]` 0; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3498** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3459** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 54, DOM Worker 50, Renderer 23, BgPool 7, IPC I/O 4, Compositor 4, SwComposite 2, WRRenderBackend 2, other 2, WRSceneBuilder 2, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 54 ms (0.4% of span): Idle 20, JavaScript 10, Layout 9, Other 5, DOM 4, GC / CC 3
  - JS leaf 2 / native under JS 18 / native 34; buckets: ipc 54, poll_wait 21, paint_layout 14, gc_cc 8, array_buffer_copy 7, harness_diagnostics 6, memcpy_memset 4, worker_messaging 0
  - top self: `poll [libc.so.6]` 21; `madvise [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::jit::AttachBaselineCacheIRStubLocked(JSContext*, js::jit` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `nsImageFrame::QueryFrame(nsQueryFrame::FrameIID) const [libx` 1
  - GC/CC markers: GCMinor 3× 3 ms
  - WebRender/compositor threads: Renderer 23 ms (top self: `ps_quad_repeat_frag::pattern_fragment(glsl::vec4) ` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `writev [libc.so.6]` 3); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 6 ms (top self: `unlink [libc.so.6]` 5, `__open_nocancel [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 50 ms: buckets subprocess_pipe_io 50, worker_messaging 50, ipc 50, gc_cc 44, poll_wait 7, memcpy_memset 7; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `madvise [libc.so.6]` 5; `poll [libc.so.6]` 5; `mozilla::SourceLocation::~SourceLocation() [libxul` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:4010** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Layout 1, Other 0, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1, gc_cc 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedPropMa` 0; `mozilla::dom::Document::CollectDescendantDocuments(nsTArray<` 0; `mozilla::PresShell::GetRootScrollContainerFrame() const [lib` 0; `[]` 0; `nsSHistory::AddRef() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3459** CPU ms by thread group: main 2, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3498** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

