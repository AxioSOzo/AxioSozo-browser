# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **43.5** (main 15.1, DOM Worker 13.2, Renderer 9.5, WRScene~ilder# 1.9, WRRende~ckend# 1.9) | WPEWebProcess 56.8, AxioWebKitHost 17.0, WPENetworkProce 9.5 | — | 506.9 |
| plain | idle | — | — | **4.9** (main 3.9, Timer 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.2 | 24.0 | **32.6** (main 9.8, Renderer 7.2, SwComposite 5.6, DOM Worker 3.0, Backgro~Pool # 2.0) | WPEWebProcess 57.7, AxioWebKitHost 6.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **27.0** (Renderer 6.3, SwComposite 5.3, main 4.7, DOM Worker 3.0, Backgro~Pool # 2.7) | WPEWebProcess 57.2, AxioWebKitHost 7.0 | — | — |
| plain | scroll | 57.2 | 33.5 | **46.4** (main 18.4, Renderer 7.0, DOM Worker 5.5, SwComposite 5.0, Backgro~Pool # 3.5) | WPEWebProcess 61.7, AxioWebKitHost 9.5 | — | — |
| plain | key | — | — | **14.3** (main 7.7, Renderer 1.4, SwComposite 1.1, DOM Worker 1.1, glean.dispatche 0.6) | WPEWebProcess 7.5, AxioWebKitHost 1.4 | 16.4 | — |
| plain | switch-to-gecko | — | — | **26.3** (main 13.1, TaskCon~ller # 4.4, Renderer 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 210.4 |
| profile | switch-to-engine | — | — | **30.7** (DOM Worker 10.2, SamplerThread 8.7, main 5.8, IPC I/O Parent 1.5, Socket Thread 1.5) | WPEWebProcess 53.8, Web Content 33.4, AxioWebKitHost 14.5, WPENetworkProce 8.7 | — | 664.8 |
| profile | idle | — | — | **71.3** (DOM Worker 21.5, main 19.5, Indexed~ IO # 11.2, SamplerThread 8.8, IPDL Background 4.4) | Web Content 5.9, WebExtensions 1.5, Isolated Web Co 1.5, RDD Process 1.5 | — | — |
| profile | raf | 57.9 | 21.1 | **61.9** (main 14.7, DOM Worker 12.4, SamplerThread 9.5, Renderer 8.2, SwComposite 5.9) | WPEWebProcess 61.2, AxioWebKitHost 7.5, Web Content 6.8, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **51.2** (DOM Worker 10.0, main 8.3, Renderer 8.3, SamplerThread 8.0, SwComposite 6.3) | WPEWebProcess 60.7, AxioWebKitHost 7.3, Web Content 6.3, Isolated Web Co 1.6 | — | — |
| profile | scroll | 56.4 | 34.6 | **77.0** (main 26.3, DOM Worker 16.9, SamplerThread 9.4, Renderer 7.4, SwComposite 5.5) | WPEWebProcess 61.7, AxioWebKitHost 9.0, Web Content 6.0, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **36.8** (main 13.7, DOM Worker 8.0, SamplerThread 8.0, Timer 1.4, TaskCon~ller # 1.1) | Web Content 6.6, WPEWebProcess 6.3, AxioWebKitHost 1.9, WebExtensions 1.4 | 18.1 | — |
| profile | switch-to-gecko | — | — | **42.1** (main 16.9, DOM Worker 8.4, BgIOThr~Pool # 4.2, Renderer 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 4.2 | — | 215.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 2.9 | 0.0 | 0 | 0.0 | — | — | 146.5 | 0.0 | — | 1.94 | 0.66 | — | — | — | — | — | 0.002 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.16 | 0.14 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.18 | 0.15 | — | — | — | — | — | 0.011 |
| profile | scroll | 54.8 | 0.0 | 0 | 0.0 | — | — | 10.0 | 0.0 | — | 0.41 | 0.14 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.11 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.920 | 1.949 | 0.0034 | 0.0072 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.049 | 0.330 | 0.0028 | 0.0192 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.074 | 0.324 | 0.0043 | 0.0189 |
| plain | scroll | memfd | native | 112 | 112 | 0.233 | 0.316 | 0.0129 | 0.0175 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.397 | 0.0000 | 0.0022 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.974 | 1.315 | 0.0028 | 0.0038 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 178 | 178 | 0.064 | 0.390 | 0.0037 | 0.0226 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.080 | 0.385 | 0.0046 | 0.0223 |
| profile | scroll | memfd | native | 111 | 111 | 0.254 | 0.356 | 0.0139 | 0.0195 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.422 | 0.0000 | 0.0023 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 15.0 | 0.0 | — | 0.11 | 0.42 | — | — | 84.2 | 16.0 | 102.6 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 17.6; spawn AxioWebKitHost resolved 33.8; write hello 36.1; first stdout read resolved 118.0; write create 120.2; first frame applied (native receiver) 666.5; write frame_ack 667.7; write visibility 675.4; write focus 675.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.3; first stdout read resolved 25.9

### Profile: webkit-control / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 51, main 42, Renderer 11, BgPool 5, IPC I/O 3, Compositor 2, SwComposite 2, WRSceneBuilder 2, WRRenderBackend 2, Socket 1, ImageBridge 0, other 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 42 ms (6.0% of span): JavaScript 17, Idle 10, Layout 5, DOM 4, Graphics 4, Profiler 1
  - JS leaf 4 / native under JS 20 / native 18; buckets: ipc 41, gc_cc 20, poll_wait 13, paint_layout 10, array_buffer_copy 9, engine_stream_read 8, harness_diagnostics 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 13; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 1; `js::ProfilingStackFrame::setPC(unsigned char*) [libxul.so]` 1; `xpc::AccessCheck::subsumesConsideringDomain(JS::Realm*, JS::` 1; `js::frontend::ObjectEmitter::ObjectEmitter(js::frontend::Byt` 1
  - WebRender/compositor threads: Renderer 11 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `__syscall_cancel_arch [libc.so.6]` 1, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build_ite` 1, `mozilla::detail::RunnableFunction<mozilla::layers:` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__memset_evex_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0)
  - busiest DOM Worker 51 ms: buckets subprocess_pipe_io 51, worker_messaging 51, ipc 51, js_ctypes 50, poll_wait 47, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 47; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0; `js::GetProperty(JSContext*, JS::Handle<JS::Value>,` 0
- **tab:10061** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (6.9% of span): Other 37, DOM 4, Profiler 3, Idle 1, JavaScript 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 42; buckets: ipc 34, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 5, poll_wait 2, memcpy_memset 1
  - top self: `[]` 10; `[libfontconfig.so.1]` 3; `__strcmp_evex [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10058** CPU ms by thread group: main 46, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 46 ms (7.8% of span): Other 39, JavaScript 4, DOM 1, Idle 1, GC / CC 1, Profiler 1
  - JS leaf 0 / native under JS 2 / native 44; buckets: ipc 34, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 1, image_container 1
  - top self: `[libexpat.so.1]` 5; `__syscall_cancel_arch [libc.so.6]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `[]` 3; `js::jit::JitCode::copyFrom(js::jit::MacroAssembler&) [libxul` 3; `mozilla::dom::Pref::operator=(mozilla::dom::Pref&&) [libxul.` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9966** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.2% of span): Idle 1, Graphics 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::nsDisplayItem::Destroy(mozilla::nsDisplayListBuilde` 0; `mozilla::ServoStyleSet::StyleDocument(mozilla::ServoTraversa` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / idle

- **parent** CPU ms by thread group: DOM Worker 377, main 370, other 16, Socket 8, BgPool 3, Compositor 2, Renderer 1, SwComposite 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 370 ms (18.0% of span): Idle 125, JavaScript 114, DOM 81, Other 32, Network 7, Profiler 6
  - JS leaf 14 / native under JS 163 / native 194; buckets: ipc 367, gc_cc 167, poll_wait 138, array_buffer_copy 63, memcpy_memset 23, harness_diagnostics 16, worker_messaging 4, engine_stream_read 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 18; `__memmove_evex_unaligned_erms [libc.so.6]` 14; `[axiosozo-dev]` 10; `validate (chrome://global/content/third_party/cfworker/json-` 6; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 6
  - GC/CC markers: GCMinor 2× 4 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `[libfreeblpriv3.so]` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 275 ms: buckets worker_messaging 273, ipc 273, gc_cc 83, poll_wait 41, array_buffer_copy 37, memcpy_memset 15; top self: `[unknown]` 48; `__syscall_cancel_arch [libc.so.6]` 37; `jsesc (resource://gre/modules/third_party/jsesc/js` 21; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 15; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 10
- **tab:9653** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9749** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.1% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **utility:9810** CPU ms by thread group: main 1, IPC I/O 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit-control / raf

- **parent** CPU ms by thread group: main 430, DOM Worker 289, Renderer 241, SwComposite 180, BgPool 82, WRRenderBackend 57, Compositor 36, other 26, ImageBridge 15, WRSceneBuilder 7, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 430 ms (14.0% of span): Idle 281, JavaScript 73, Other 32, DOM 20, GC / CC 17, Profiler 7
  - JS leaf 4 / native under JS 88 / native 338; buckets: ipc 429, poll_wait 299, gc_cc 77, engine_stream_read 49, harness_diagnostics 34, worker_messaging 32, subprocess_pipe_io 19, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `[axiosozo-dev]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 3
  - GC/CC markers: GCMajor 1× 536 ms, GCSlice 6× 19 ms, GCMinor 2× 5 ms
  - WebRender/compositor threads: Renderer 241 ms (top self: `__syscall_cancel_arch [libc.so.6]` 136, `int blendTextureNearestFast<false, glsl::sampler2D` 28, `void scale_blit<true>(Texture&, IntRect const&, Te` 22); SwComposite 180 ms (top self: `syscall [libc.so.6]` 109, `void scale_blit<true>(Texture&, IntRect const&, Te` 58, `__memmove_evex_unaligned_erms [libc.so.6]` 11); WRRenderBackend#0 57 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `__memmove_evex_unaligned_erms [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 238 ms: buckets subprocess_pipe_io 238, worker_messaging 238, ipc 238, js_ctypes 215, poll_wait 206, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 208; `[unknown]` 3; `[axiosozo-dev]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:9972** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9708** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9730** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / raf-nosampler

- **parent** CPU ms by thread group: main 235, DOM Worker 229, Renderer 218, SwComposite 180, BgPool 82, WRRenderBackend 53, Compositor 35, ImageBridge 15, WRSceneBuilder 7, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 235 ms (7.8% of span): Idle 104, JavaScript 50, GC / CC 45, Other 22, DOM 11, Profiler 3
  - JS leaf 4 / native under JS 52 / native 179; buckets: ipc 234, poll_wait 119, gc_cc 104, engine_stream_read 39, worker_messaging 26, subprocess_pipe_io 14, array_buffer_copy 12, native_receiver 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 117; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[unknown]` 9; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4; `[axiosozo-dev]` 4; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 50 ms, GCSlice 6× 32 ms, CCSlice 2× 21 ms, GCMinor 1× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 218 ms (top self: `__syscall_cancel_arch [libc.so.6]` 105, `int blendTextureNearestFast<false, glsl::sampler2D` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 17); SwComposite 180 ms (top self: `syscall [libc.so.6]` 101, `void scale_blit<true>(Texture&, IntRect const&, Te` 66, `__memmove_evex_unaligned_erms [libc.so.6]` 10); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_evex_unaligned_erms [libc.so.6]` 18, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15, `__lll_lock_wake [libc.so.6]` 0, `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 225 ms: buckets subprocess_pipe_io 225, worker_messaging 225, ipc 225, js_ctypes 202, poll_wait 195, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 196; `[unknown]` 2; `[axiosozo-dev]` 2; `JSStructuredCloneReader::startReadUnchecked(JS::Mu` 1; `mozilla::detail::nsTStringRepr<char16_t>::EqualsAS` 1
- **tab:9749** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9708** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9730** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / scroll

- **parent** CPU ms by thread group: main 489, DOM Worker 280, Renderer 139, SwComposite 113, BgPool 68, WRRenderBackend 36, Compositor 22, other 16, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 489 ms (24.2% of span): Idle 273, JavaScript 78, Other 61, GC / CC 26, DOM 20, Profiler 14
  - JS leaf 10 / native under JS 85 / native 394; buckets: ipc 486, poll_wait 328, gc_cc 95, engine_stream_read 44, paint_layout 34, harness_diagnostics 33, worker_messaging 31, array_buffer_copy 28
  - top self: `__syscall_cancel_arch [libc.so.6]` 299; `[unknown]` 13; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `[axiosozo-dev]` 6; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 4
  - GC/CC markers: GCMajor 1× 1052 ms, GCSlice 8× 34 ms, CCSlice 4× 9 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 139 ms (top self: `__syscall_cancel_arch [libc.so.6]` 95, `int blendTextureNearestFast<false, glsl::sampler2D` 11, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); SwComposite 113 ms (top self: `syscall [libc.so.6]` 86, `void scale_blit<true>(Texture&, IntRect const&, Te` 24, `UnlockResource [libxul.so]` 1); WRRenderBackend#0 36 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 3, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 68 ms (top self: `__syscall_cancel_arch [libc.so.6]` 53, `__memmove_evex_unaligned_erms [libc.so.6]` 14, `mozilla::TaskQueue::Runner::Run() [libxul.so]` 1); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `mozilla::Queue<nsCOMPtr<nsIRunnable>, 16ul>::Pop()` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 279 ms: buckets subprocess_pipe_io 279, worker_messaging 278, ipc 278, js_ctypes 206, poll_wait 200, gc_cc 59; top self: `__syscall_cancel_arch [libc.so.6]` 201; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 8; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 7; `__pthread_mutex_unlock_usercnt [libc.so.6]` 5; `madvise [libc.so.6]` 5
- **tab:9749** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9972** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `PR_GetCurrentThread [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9730** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / key

- **parent** CPU ms by thread group: main 449, DOM Worker 194, Renderer 44, SwComposite 34, other 27, Compositor 15, WRRenderBackend 13, BgPool 10, WRSceneBuilder 8, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 449 ms (12.3% of span): Idle 208, JavaScript 81, Other 39, Layout 31, DOM 28, Graphics 27
  - JS leaf 9 / native under JS 133 / native 308; buckets: ipc 449, poll_wait 250, gc_cc 103, paint_layout 74, worker_messaging 61, engine_stream_read 61, harness_diagnostics 25, array_buffer_copy 17
  - top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 16; `[axiosozo-dev]` 9; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4; `nsLayoutUtils::GetTransformToAncestor(mozilla::RelativeTo, m` 4
  - GC/CC markers: GCMajor 1× 1054 ms, GCSlice 5× 23 ms, GCMinor 2× 4 ms
  - WebRender/compositor threads: Renderer 44 ms (top self: `__syscall_cancel_arch [libc.so.6]` 24, `int blendTextureNearestFast<false, glsl::sampler2D` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); SwComposite 34 ms (top self: `syscall [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__memmove_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 193 ms: buckets subprocess_pipe_io 193, worker_messaging 193, ipc 193, js_ctypes 175, poll_wait 171, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 172; `__lll_lock_wake [libc.so.6]` 3; `[unknown]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 1
- **tab:9653** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `__strlen_evex [libc.so.6]` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `[unknown]` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9708** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9972** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 17, DOM Worker 11, BgPool 5, Compositor 3, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 66 ms (23.6% of span): JavaScript 31, Layout 8, Other 8, Graphics 7, Profiler 5, Idle 4
  - JS leaf 1 / native under JS 45 / native 20; buckets: ipc 66, array_buffer_copy 18, paint_layout 15, gc_cc 15, harness_diagnostics 11, poll_wait 7, engine_stream_read 4, memcpy_memset 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 5; `[unknown]` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 3; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 3
  - WebRender/compositor threads: Renderer 17 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 9, memcpy_memset 1; top self: `__syscall_cancel_arch [libc.so.6]` 10; `__lll_lock_wait [libc.so.6]` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyK` 0; `__memset_evex_unaligned_erms [libc.so.6]` 0
- **tab:9966** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.5% of span): JavaScript 10, Other 6, Idle 5, Layout 3, DOM 2, Network 1
  - JS leaf 0 / native under JS 10 / native 16; buckets: ipc 24, paint_layout 9, gc_cc 9, poll_wait 5, subprocess_pipe_io 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__strlen_evex [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*,` 1; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9653** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 0, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9749** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, other 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

