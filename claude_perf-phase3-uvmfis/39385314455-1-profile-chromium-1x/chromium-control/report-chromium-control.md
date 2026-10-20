# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **71.0** (main 26.9, Renderer 19.2, DOM Worker 15.4, WRRende~ckend# 3.8, StyleThread# 1.9) | AxioCEFProbe 63.4, cef:gpu-process 19.2, cef:utility 15.4, cef:renderer 11.5 | — | 471.2 |
| plain | idle | — | — | **6.3** (main 4.8, TaskCon~ller # 1.0, Timer 0.5) | AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 22.4 | **35.7** (main 10.3, Renderer 6.8, SwComposite 5.2, DOM Worker 3.2, Backgro~Pool # 1.9) | cef:renderer 10.0, AxioCEFProbe 5.5, cef:gpu-process 4.8, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **31.0** (Renderer 7.3, main 6.9, SwComposite 5.6, DOM Worker 3.6, Backgro~Pool # 2.3) | cef:renderer 11.2, AxioCEFProbe 6.3, cef:gpu-process 5.7 | — | — |
| plain | scroll | 59.8 | 22.2 | **51.1** (main 20.2, DOM Worker 8.2, Renderer 7.2, SwComposite 5.3, Backgro~Pool # 2.9) | cef:gpu-process 20.8, cef:renderer 10.1, AxioCEFProbe 8.7 | — | — |
| plain | key | — | — | **17.8** (main 10.4, DOM Worker 1.6, TaskCon~ller # 1.4, Timer 0.8, Renderer 0.8) | AxioCEFProbe 2.8, cef:renderer 2.2, cef:gpu-process 0.3 | 13.0 | — |
| plain | switch-to-gecko | — | — | **12.2** (DOM Worker 4.5, main 3.7, IPDL Background 1.5, TaskCon~ller # 0.5, Indexed~ IO # 0.5) | WebExtensions 0.1, Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15352.4 |
| profile | switch-to-engine | — | — | **48.2** (main 14.9, DOM Worker 14.9, SamplerThread 6.6, Renderer 5.0, glean.dispatche 1.7) | AxioCEFProbe 54.6, Web Content 47.9, cef:gpu-process 14.9, cef:utility 11.6 | — | 550.5 |
| profile | idle | — | — | **25.1** (SamplerThread 9.0, DOM Worker 8.0, main 5.7, Timer 1.9, Cache2 I/O 0.5) | Web Content 7.6, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 59.9 | 20.9 | **61.2** (DOM Worker 12.8, main 12.5, SamplerThread 11.8, Renderer 7.3, SwComposite 5.4) | cef:renderer 11.5, Web Content 8.3, AxioCEFProbe 6.1, cef:gpu-process 5.7 | — | — |
| profile | raf-nosampler | — | — | **53.8** (DOM Worker 12.9, SamplerThread 10.6, Renderer 7.9, main 7.6, SwComposite 5.9) | cef:renderer 11.3, Web Content 7.3, AxioCEFProbe 6.3, cef:gpu-process 6.0 | — | — |
| profile | scroll | 60.0 | 21.2 | **80.1** (main 24.8, DOM Worker 16.2, SamplerThread 12.4, Renderer 8.1, SwComposite 5.2) | cef:gpu-process 23.9, cef:renderer 11.0, Web Content 9.1, AxioCEFProbe 9.0 | — | — |
| profile | key | — | — | **38.4** (main 12.0, DOM Worker 9.8, SamplerThread 9.5, Timer 1.9, Renderer 1.1) | Web Content 7.9, AxioCEFProbe 3.2, cef:renderer 2.7, Privileged Cont 2.2 | 15.7 | — |
| profile | switch-to-gecko | — | — | **7.3** (SamplerThread 3.5, main 1.7, TaskCon~ller # 0.9, DOM Worker 0.5, Renderer 0.2) | Web Content 7.3, Privileged Cont 1.8, WebExtensions 1.6, Isolated Web Co 1.5 | — | 15027.5 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.1 | 0.0 | 0 | 0.0 | — | — | 4.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 58.2 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.4 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 3 | 0.871 | 2.162 | 0.0048 | 0.0119 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.053 | 0.275 | 0.0032 | 0.0165 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.060 | 0.272 | 0.0036 | 0.0163 |
| plain | scroll | memfd | native | 121 | 121 | 0.211 | 0.229 | 0.0122 | 0.0132 |
| plain | key | memfd | native | 21 | 21 | 0.017 | 0.278 | 0.0001 | 0.0016 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.238 | 2.769 | 0.0039 | 0.0087 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.057 | 0.276 | 0.0034 | 0.0165 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.061 | 0.287 | 0.0037 | 0.0172 |
| profile | scroll | memfd | native | 124 | 124 | 0.243 | 0.264 | 0.0141 | 0.0154 |
| profile | key | memfd | native | 21 | 21 | 0.020 | 0.309 | 0.0001 | 0.0018 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.5 | 0.1 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 51.3; spawn AxioCEFProbe resolved 115.4; write hello 121.7; first stdout read resolved 393.8; write create 396.4; write frame_ack 569.5; write focus 580.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 42.1; first stdout read resolved 52.5; write shutdown 55.7

### Profile: chromium-control / switch-to-engine

- **parent** CPU ms by thread group: main 91, DOM Worker 61, Renderer 34, BgPool 6, Compositor 6, WRRenderBackend 5, WRSceneBuilder 4, IPC I/O 3, SwComposite 2, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 91 ms (14.3% of span): Layout 28, JavaScript 24, Idle 16, Other 14, DOM 3, Profiler 3
  - JS leaf 2 / native under JS 37 / native 52; buckets: ipc 91, paint_layout 33, gc_cc 23, poll_wait 22, harness_diagnostics 11, array_buffer_copy 10, worker_messaging 9, memcpy_memset 5
  - top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 8; `style::properties::cascade::iter_declarations [libxul.so]` 8; `recvmsg [libc.so.6]` 5; `[unknown]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 34 ms (top self: `DrawElementsInstanced [libxul.so]` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__lll_lock_wake [libc.so.6]` 3); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2); WRSceneBuilder#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 2, `hashbrown::map::equivalent_key::{{closure}} [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `ARGBSetRow_X86 [libxul.so]` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__memset_avx2_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 61 ms: buckets subprocess_pipe_io 61, worker_messaging 61, ipc 61, poll_wait 55, js_ctypes 37, gc_cc 3; top self: `poll [libc.so.6]` 36; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19; `write [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `js::BoundFunctionObject::initName(JSAtom*) [libxul` 1
- **tab:5010** CPU ms by thread group: main 53, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 53 ms (11.6% of span): Other 41, JavaScript 5, Profiler 3, DOM 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 48; buckets: ipc 38, array_buffer_copy 15, gc_cc 12, subprocess_pipe_io 5, poll_wait 2
  - top self: `[]` 7; `__strcmp_avx2 [libc.so.6]` 3; `__strlen_avx2 [libc.so.6]` 3; `access [libc.so.6]` 2; `read [libc.so.6]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5007** CPU ms by thread group: main 51, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 51 ms (8.7% of span): Other 44, JavaScript 2, Profiler 2, Idle 1, DOM 1, GC / CC 1
  - JS leaf 0 / native under JS 1 / native 50; buckets: ipc 38, array_buffer_copy 19, gc_cc 11, subprocess_pipe_io 5, poll_wait 5, memcpy_memset 2
  - top self: `[libexpat.so.1]` 4; `[]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `FcConfigGetCurrent [libfontconfig.so.1]` 3; `mozilla::HashSet<std::unique_ptr<Pref, std::default_delete<P` 2; `syscall [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4886** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.6% of span): Idle 2, Layout 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGene` 1; `read [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<moz` 0; `getcontext [libc.so.6]` 0; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / idle

- **parent** CPU ms by thread group: main 110, DOM Worker 110, other 21, BgPool 1, Socket 1, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 111 ms (5.2% of span): Idle 86, Other 10, JavaScript 10, DOM 2, GC / CC 2, Profiler 1
  - JS leaf 0 / native under JS 12 / native 99; buckets: ipc 111, poll_wait 92, harness_diagnostics 7, gc_cc 7, array_buffer_copy 5, subprocess_pipe_io 1, json_metadata 1, worker_messaging 0
  - top self: `poll [libc.so.6]` 87; `recvmsg [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `[libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 109 ms: buckets subprocess_pipe_io 109, worker_messaging 109, ipc 109, js_ctypes 109, poll_wait 109; top self: `poll [libc.so.6]` 109; `js::ToPrimitiveSlow(JSContext*, JSType, JS::Mutabl` 0
- **tab:5007** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4886** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf

- **parent** CPU ms by thread group: main 364, DOM Worker 310, Renderer 224, SwComposite 173, BgPool 68, WRRenderBackend 65, Compositor 43, other 33, ImageBridge 19, WRSceneBuilder 9, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 364 ms (11.5% of span): Idle 239, JavaScript 67, Other 35, DOM 14, Profiler 6, GC / CC 2
  - JS leaf 14 / native under JS 64 / native 286; buckets: ipc 364, poll_wait 258, gc_cc 72, worker_messaging 38, engine_stream_read 38, json_metadata 20, array_buffer_copy 18, harness_diagnostics 14
  - top self: `poll [libc.so.6]` 242; `[unknown]` 14; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `recvmsg [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `write [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 223 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 123, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 23, `int blendTextureNearestFast<false, glsl::sampler2D` 22); SwComposite 173 ms (top self: `syscall [libc.so.6]` 109, `void scale_blit<true>(Texture&, IntRect const&, Te` 60, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 57, `[axiosozo-dev]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 68 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 62, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `pthread_cond_wait@@GLIBC_2.3.2 [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 310 ms: buckets subprocess_pipe_io 310, worker_messaging 310, ipc 310, js_ctypes 289, poll_wait 282, gc_cc 8; top self: `poll [libc.so.6]` 282; `[unknown]` 3; `mozilla::dom::ClientInfo::operator=(mozilla::dom::` 2; `bool js::ctypes::jsvalToBigInteger<unsigned long>(` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:4886** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 3, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `fog_counter_add [libxul.so]` 0; `DestroyRealm(JS::GCContext*, JS::Realm*) [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4636** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `MessageLoop::EventTarget::IsOnCurrentThreadInfallible() [lib` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 298, Renderer 224, main 222, SwComposite 173, BgPool 69, WRRenderBackend 64, Compositor 44, ImageBridge 18, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 222 ms (7.2% of span): Idle 118, JavaScript 59, Other 27, DOM 15, Profiler 3
  - JS leaf 6 / native under JS 62 / native 153; buckets: ipc 222, poll_wait 134, gc_cc 73, worker_messaging 42, engine_stream_read 29, json_metadata 26, subprocess_pipe_io 24, array_buffer_copy 20
  - top self: `poll [libc.so.6]` 123; `[unknown]` 10; `recvmsg [libc.so.6]` 8; `write [libc.so.6]` 5; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 4; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 3
  - WebRender/compositor threads: Renderer 224 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 114, `int blendTextureNearestFast<false, glsl::sampler2D` 35, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 22); SwComposite 173 ms (top self: `syscall [libc.so.6]` 96, `void scale_blit<true>(Texture&, IntRect const&, Te` 68, `__memmove_avx_unaligned_erms [libc.so.6]` 9); WRRenderBackend#0 64 ms (top self: `syscall [libc.so.6]` 55, `sched_yield [libc.so.6]` 2, `write [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 63, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `mozilla::ipc::MessageChannel::MessageTask::~Messag` 0, `PR_GetCurrentThread [libnspr4.so]` 0); BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 298 ms: buckets subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 274, poll_wait 267, gc_cc 12; top self: `poll [libc.so.6]` 267; `write [libc.so.6]` 5; `[unknown]` 3; `__lll_lock_wait [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:4891** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `TimerThread::Init() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5007** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / scroll

- **parent** CPU ms by thread group: main 494, DOM Worker 293, Renderer 158, SwComposite 112, BgPool 64, WRRenderBackend 46, Compositor 28, other 23, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 494 ms (23.2% of span): Idle 288, JavaScript 85, Other 55, DOM 24, Graphics 23, Profiler 12
  - JS leaf 10 / native under JS 93 / native 392; buckets: ipc 493, poll_wait 366, gc_cc 86, paint_layout 54, worker_messaging 48, engine_stream_read 27, json_metadata 22, array_buffer_copy 20
  - top self: `poll [libc.so.6]` 292; `[unknown]` 9; `recvmsg [libc.so.6]` 6; `[axiosozo-dev]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 5
  - WebRender/compositor threads: Renderer 158 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 87, `int blendTextureNearestFast<false, glsl::sampler2D` 19, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 13); SwComposite 112 ms (top self: `syscall [libc.so.6]` 100, `void scale_blit<true>(Texture&, IntRect const&, Te` 11, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 64 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 293 ms: buckets subprocess_pipe_io 293, worker_messaging 293, ipc 293, js_ctypes 259, poll_wait 252, gc_cc 12; top self: `poll [libc.so.6]` 252; `[unknown]` 5; `[axiosozo-dev]` 4; `getcontext [libc.so.6]` 4; `write [libc.so.6]` 2
- **tab:4636** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4610** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4891** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / key

- **parent** CPU ms by thread group: main 395, DOM Worker 258, other 37, Renderer 30, SwComposite 22, Compositor 15, WRRenderBackend 11, WRSceneBuilder 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 395 ms (10.7% of span): Idle 159, JavaScript 90, Other 44, Layout 40, Graphics 25, DOM 20
  - JS leaf 10 / native under JS 135 / native 251; buckets: ipc 395, poll_wait 196, gc_cc 109, worker_messaging 81, paint_layout 75, engine_stream_read 36, subprocess_pipe_io 24, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 161; `[unknown]` 16; `[axiosozo-dev]` 10; `write [libc.so.6]` 10; `recvmsg [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5
  - GC/CC markers: CCSlice 2× 4 ms, GCMinor 1× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 30 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); SwComposite 22 ms (top self: `syscall [libc.so.6]` 11, `void scale_blit<true>(Texture&, IntRect const&, Te` 10, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 8, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `[axiosozo-dev]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 253 ms: buckets subprocess_pipe_io 253, worker_messaging 253, ipc 253, js_ctypes 242, poll_wait 239, gc_cc 6; top self: `poll [libc.so.6]` 239; `[axiosozo-dev]` 1; `read [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:4540** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1
  - top self: `poll [libc.so.6]` 6; `[]` 0; `non-virtual thunk to nsGlobalWindowInner::AddRef() [libxul.s` 0; `js::UnwrapOneCheckedDynamic(JS::Handle<JSObject*>, JSContext` 0; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxu` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5007** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4610** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-control / switch-to-gecko

- **parent** CPU ms by thread group: main 244, DOM Worker 67, Renderer 21, BgPool 13, Compositor 8, IPC I/O 6, other 3, WRSceneBuilder 3, WRRenderBackend 2, SwComposite 1, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 244 ms (1.6% of span): GC / CC 162, JavaScript 20, Layout 18, Idle 18, Other 13, DOM 9
  - JS leaf 0 / native under JS 38 / native 205; buckets: ipc 244, gc_cc 179, poll_wait 27, paint_layout 26, array_buffer_copy 14, harness_diagnostics 12, memcpy_memset 7, subprocess_pipe_io 7
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 20; `poll [libc.so.6]` 19; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 8; `write [libc.so.6]` 8; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7
  - GC/CC markers: GCMajor 3× 261 ms, GCSlice 19× 105 ms, CCSlice 6× 61 ms, GCMinor 4× 2 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 21 ms (top self: `ps_text_run_ALPHA_PASS_DUAL_SOURCE_BLENDING_TEXTUR` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 12 ms (top self: `rmdir [libc.so.6]` 5, `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 2); BackgroundThreadPool #3 1 ms (top self: `munmap [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 67 ms: buckets subprocess_pipe_io 67, worker_messaging 67, ipc 67, gc_cc 53, js_ctypes 14, poll_wait 14; top self: `poll [libc.so.6]` 12; `madvise [libc.so.6]` 6; `[axiosozo-dev]` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 4; `syscall [libc.so.6]` 4
- **tab:4636** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.1% of span): GC / CC 6, Idle 4, Other 1, Profiler 1
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 11, gc_cc 8, poll_wait 4, memcpy_memset 0
  - top self: `poll [libc.so.6]` 4; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `mozilla::dom::CallbackObject::cycleCollection::Trace(void*, ` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4540** CPU ms by thread group: main 10, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.1% of span): GC / CC 7, Idle 2, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 9, gc_cc 7, poll_wait 4, array_buffer_copy 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `poll [libc.so.6]` 2; `bool js::gc::MarkingTracerT<1u>::markOneColor<(js::gc::MarkC` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `read [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5010** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

