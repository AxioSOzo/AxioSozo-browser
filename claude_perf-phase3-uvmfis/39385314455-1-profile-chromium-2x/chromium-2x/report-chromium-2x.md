# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **148.9** (Renderer 54.5, main 44.6, DOM Worker 19.8, Backgro~Pool # 5.0, TaskCon~ller # 5.0) | AxioCEFProbe 34.8, cef:renderer 24.8, cef:gpu-process 10.0, cef:utility 5.0 | — | 155.8 |
| plain | idle | — | — | **5.7** (main 4.3, Timer 0.9, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 20.8 | **31.8** (main 8.7, Backgro~Pool # 6.1, Renderer 4.8, SwComposite 3.5, DOM Worker 3.5) | cef:gpu-process 15.4, cef:renderer 12.2, AxioCEFProbe 11.3 | — | — |
| plain | raf-nosampler | — | — | **41.6** (main 9.6, Backgro~Pool # 6.6, Renderer 5.3, SwComposite 4.3, DOM Worker 3.3) | cef:gpu-process 17.6, cef:renderer 11.9, AxioCEFProbe 10.9, RDD Process 0.3 | — | — |
| plain | scroll | 59.7 | 21.4 | **48.5** (main 18.2, Backgro~Pool # 8.6, DOM Worker 7.7, Renderer 5.3, SwComposite 3.4) | cef:gpu-process 59.4, AxioCEFProbe 14.3, cef:renderer 13.9 | — | — |
| plain | key | — | — | **43.7** (main 14.7, DOM Worker 9.0, IndexedDB IO # 6.8, Renderer 3.0, IPDL Background 2.5) | cef:renderer 2.5, AxioCEFProbe 2.4, cef:gpu-process 0.8, Web Content 0.3 | 13.1 | — |
| plain | switch-to-gecko | — | — | **8.7** (main 2.9, DOM Worker 2.9, IPDL Background 0.9, TaskCon~ller # 0.9, Renderer 0.3) | Privileged Cont 0.1, WebExtensions 0.1, Web Content 0.1 | — | 15018.0 |
| profile | switch-to-engine | — | — | **84.9** (Renderer 32.4, main 28.3, DOM Worker 8.1, SamplerThread 8.1, WRRende~ckend# 4.0) | AxioCEFProbe 28.2, cef:renderer 20.2, cef:gpu-process 12.1, Web Content 8.1 | — | 179.3 |
| profile | idle | — | — | **25.1** (DOM Worker 8.5, SamplerThread 8.5, main 5.2, Timer 1.9, glean.dispatche 0.5) | Web Content 8.9, WebExtensions 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 60.0 | 21.0 | **62.3** (main 13.4, DOM Worker 12.7, SamplerThread 12.1, Backgro~Pool # 6.1, Renderer 5.4) | cef:gpu-process 14.9, cef:renderer 11.8, Web Content 10.5, AxioCEFProbe 10.5 | — | — |
| profile | raf-nosampler | — | — | **60.9** (DOM Worker 12.9, main 11.5, SamplerThread 10.9, Backgro~Pool # 6.9, Renderer 5.9) | cef:gpu-process 15.5, cef:renderer 11.6, AxioCEFProbe 10.6, Web Content 9.6 | — | — |
| profile | scroll | 60.0 | 21.4 | **83.8** (main 26.0, DOM Worker 17.5, SamplerThread 12.3, Backgro~Pool # 9.5, Renderer 5.7) | cef:gpu-process 65.2, AxioCEFProbe 16.6, cef:renderer 16.0, Web Content 10.4 | — | — |
| profile | key | — | — | **40.6** (main 11.7, DOM Worker 10.1, SamplerThread 9.8, Renderer 3.3, Timer 1.6) | Web Content 9.5, AxioCEFProbe 3.0, WebExtensions 2.5, cef:renderer 2.4 | 15.5 | — |
| profile | switch-to-gecko | — | — | **4.8** (SamplerThread 3.4, main 0.4, DOM Worker 0.4, Renderer 0.3, IPDL Background 0.1) | Web Content 8.8, WebExtensions 1.8, Isolated Web Co 1.8, Privileged Cont 1.6 | — | 15038.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 6.8 | 0.0 | 0 | 0.0 | — | — | 17.3 | 0.0 | — | 6.37 | 1.18 | — | — | — | — | — | 0.008 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.36 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.2 | 0.0 | — | 0.41 | 0.18 | — | — | — | — | — | 0.014 |
| profile | scroll | 58.2 | 0.0 | 0 | 0.0 | — | — | 12.2 | 0.0 | — | 0.97 | 0.16 | — | — | — | — | — | 0.012 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.37 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.416 | 6.728 | 0.0290 | 0.0572 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 188 | 0.212 | 0.784 | 0.0128 | 0.0470 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.236 | 0.779 | 0.0141 | 0.0465 |
| plain | scroll | memfd | native | 122 | 122 | 0.739 | 0.732 | 0.0427 | 0.0422 |
| plain | key | memfd | native | 21 | 21 | 0.063 | 0.795 | 0.0004 | 0.0045 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 4.885 | 7.872 | 0.0333 | 0.0537 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.218 | 0.811 | 0.0131 | 0.0485 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.252 | 0.826 | 0.0151 | 0.0495 |
| profile | scroll | memfd | native | 125 | 125 | 0.849 | 0.855 | 0.0494 | 0.0498 |
| profile | key | memfd | native | 21 | 21 | 0.063 | 0.881 | 0.0004 | 0.0050 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 11.0 | 0.1 | — | 0.35 | 0.74 | — | — | 12.2 | 12.4 | 24.4 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 59.1; first stdout read resolved 79.2; first frame applied (native receiver) 216.3; write frame_ack 218.3; write focus 226.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 36.4; first stdout read resolved 59.1; write shutdown 62.2

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 89, main 71, BgPool 15, DOM Worker 15, SwComposite 6, Compositor 6, WRRenderBackend 4, WRSceneBuilder 3, IPC I/O 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 71 ms (24.4% of span): Layout 21, JavaScript 19, Idle 12, Other 7, Graphics 5, Profiler 4
  - JS leaf 2 / native under JS 40 / native 29; buckets: ipc 71, paint_layout 26, gc_cc 25, array_buffer_copy 19, harness_diagnostics 13, poll_wait 13, webrender_render 4, worker_messaging 4
  - top self: `poll [libc.so.6]` 12; `style::properties::cascade::Declarations::note_declaration [` 8; `mozilla::net::nsStandardURL::nsStandardURL(bool, bool) [libx` 7; `__lll_lock_wake [libc.so.6]` 4; `style::sharing::StyleSharingCache<E>::new [libxul.so]` 4; `js::jit::CacheIRWriter::copyStubData(unsigned char*) const [` 4
  - WebRender/compositor threads: Renderer 89 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 25, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 14, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 10); SwComposite 6 ms (top self: `syscall [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 15 ms (top self: `ARGBSetRow_X86 [libxul.so]` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, js_ctypes 14, poll_wait 14; top self: `poll [libc.so.6]` 14; `__lll_lock_wait [libc.so.6]` 1; `mprotect [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0
- **tab:3958** CPU ms by thread group: main 18, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 18 ms (6.2% of span): Other 10, JavaScript 4, DOM 2, Profiler 1, GC / CC 1, Idle 1
  - JS leaf 0 / native under JS 2 / native 16; buckets: ipc 18, gc_cc 11, subprocess_pipe_io 6, memcpy_memset 1, poll_wait 1
  - top self: `js::LexicalScope::RuntimeData* js::frontend::ScopeStencil::c` 1; `mmap64 [ld-linux-x86-64.so.2]` 1; `mozilla::CycleCollectedJSContext::Get() [libxul.so]` 1; `non-virtual thunk to mozilla::net::nsStandardURL::TemplatedM` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `js::SharedImmutableScriptData::shareScriptData(js::FrontendC` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 17, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 17 ms (5.8% of span): Other 7, JavaScript 3, DOM 3, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 1 / native under JS 5 / native 11; buckets: ipc 17, gc_cc 10, subprocess_pipe_io 3, array_buffer_copy 2, poll_wait 2, memcpy_memset 1
  - top self: `[libmozsandbox.so]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `poll [libc.so.6]` 1; `JSStructuredCloneReader::read(JS::MutableHandle<JS::Value>, ` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3825** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 2, Layout 1, Profiler 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `Servo_StyleSet_MediumFeaturesChanged [libxul.so]` 1; `profiler_active_without_feature(unsigned int) [libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: DOM Worker 110, main 99, other 21, Socket 3, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, Canvas 0, Compositor 0, WRRenderBackend 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 99 ms (4.6% of span): Idle 83, JavaScript 8, Other 6, DOM 1, Profiler 1
  - JS leaf 1 / native under JS 7 / native 90; buckets: ipc 99, poll_wait 86, harness_diagnostics 8, array_buffer_copy 5, gc_cc 3, json_metadata 1, native_receiver 0, memcpy_memset 0
  - top self: `poll [libc.so.6]` 84; `__lll_lock_wait [libc.so.6]` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 1; `AsyncFunctionResume(JSContext*, JS::Handle<js::AsyncFunction` 1; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 110 ms: buckets subprocess_pipe_io 110, worker_messaging 110, ipc 110, js_ctypes 110, poll_wait 110, array_buffer_copy 0; top self: `poll [libc.so.6]` 110; `js::TypedArrayObject::ensureHasBuffer(JSContext*, ` 0; `[unknown]` 0
- **tab:3958** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::GetCpuTimeSinceProcessStartInMs(unsigned long*) [li` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 380, DOM Worker 299, BgPool 196, Renderer 172, SwComposite 128, WRRenderBackend 52, Compositor 40, other 35, ImageBridge 17, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 380 ms (12.0% of span): Idle 258, JavaScript 59, Other 36, DOM 12, Profiler 12, GC / CC 3
  - JS leaf 6 / native under JS 66 / native 309; buckets: ipc 380, poll_wait 279, gc_cc 65, engine_stream_read 32, worker_messaging 28, harness_diagnostics 14, json_metadata 13, native_receiver 13
  - top self: `poll [libc.so.6]` 260; `[unknown]` 9; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 171 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 107, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `void scale_blit<true>(Texture&, IntRect const&, Te` 11); SwComposite 128 ms (top self: `syscall [libc.so.6]` 105, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 11); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 46, `sched_yield [libc.so.6]` 2, `webrender::tile_cache::TileCacheInstance::update_p` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 195 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 134, `__memmove_avx_unaligned_erms [libc.so.6]` 56, `mozilla::layers::ImageContainer::SetCurrentImages(` 1); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `__lll_lock_wake [libc.so.6]` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 1 ms (top self: `write [libc.so.6]` 1, `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 299 ms: buckets subprocess_pipe_io 299, worker_messaging 299, ipc 299, js_ctypes 282, poll_wait 276, gc_cc 4; top self: `poll [libc.so.6]` 276; `write [libc.so.6]` 2; `[axiosozo-dev]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3830** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3541** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: main 330, DOM Worker 295, BgPool 192, Renderer 164, SwComposite 125, WRRenderBackend 51, Compositor 41, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 330 ms (10.7% of span): Idle 138, GC / CC 88, JavaScript 72, Other 19, DOM 10, Profiler 2
  - JS leaf 7 / native under JS 71 / native 251; buckets: ipc 330, gc_cc 167, poll_wait 151, worker_messaging 52, engine_stream_read 38, json_metadata 27, subprocess_pipe_io 17, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 141; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `mprotect [libc.so.6]` 9; `[unknown]` 7; `write [libc.so.6]` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5
  - GC/CC markers: GCMajor 2× 128 ms, GCSlice 15× 67 ms, CCSlice 2× 18 ms, GCMinor 2× 2 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 164 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 98, `__memmove_avx_unaligned_erms [libc.so.6]` 41, `void scale_blit<true>(Texture&, IntRect const&, Te` 11); SwComposite 125 ms (top self: `syscall [libc.so.6]` 102, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 2, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 192 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 114, `__memmove_avx_unaligned_erms [libc.so.6]` 70, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `mozilla::ipc::MessagePumpForNonMainThreads::Run(ba` 0, `__lll_lock_wake [libc.so.6]` 0); BackgroundThreadPool #5 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 295 ms: buckets subprocess_pipe_io 295, worker_messaging 295, ipc 295, js_ctypes 275, poll_wait 270, gc_cc 9; top self: `poll [libc.so.6]` 270; `[axiosozo-dev]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:3830** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[libstdc++.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3559** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 512, DOM Worker 301, BgPool 191, Renderer 115, SwComposite 76, WRRenderBackend 39, Compositor 28, other 23, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 512 ms (23.9% of span): Idle 282, JavaScript 87, Other 70, Graphics 27, DOM 19, Layout 13
  - JS leaf 7 / native under JS 92 / native 413; buckets: ipc 512, poll_wait 379, gc_cc 88, paint_layout 65, worker_messaging 55, json_metadata 22, engine_stream_read 22, array_buffer_copy 21
  - top self: `poll [libc.so.6]` 289; `recvmsg [libc.so.6]` 10; `mprotect [libc.so.6]` 10; `[unknown]` 10; `[axiosozo-dev]` 9; `write [libc.so.6]` 6
  - GC/CC markers: GCMinor 2× 6 ms
  - WebRender/compositor threads: Renderer 115 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 67, `__memmove_avx_unaligned_erms [libc.so.6]` 24, `syscall [libc.so.6]` 13); SwComposite 76 ms (top self: `syscall [libc.so.6]` 72, `void scale_blit<true>(Texture&, IntRect const&, Te` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 39 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 4, `webrender::render_backend::RenderBackend::process_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 191 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 122, `__memmove_avx_unaligned_erms [libc.so.6]` 60, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[libstdc++.so.6]` 0, `mozilla::layers::TextureClientRecycleAllocator::Re` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 301 ms: buckets subprocess_pipe_io 301, worker_messaging 301, ipc 301, js_ctypes 262, poll_wait 254, gc_cc 14; top self: `poll [libc.so.6]` 254; `[axiosozo-dev]` 4; `__lll_lock_wait [libc.so.6]` 2; `NS_IsMainThread [libxul.so]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2
- **tab:3472** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.5% of span): GC / CC 9, Idle 1
  - JS leaf 0 / native under JS 0 / native 10; buckets: gc_cc 9, ipc 8, poll_wait 2
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 6; `__lll_lock_wake [libc.so.6]` 1; `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `void js::gc::MarkingTracerT<1u>::markAndTraverse<JS::Symbol>` 1
  - GC/CC markers: GCMajor 1× 67 ms, GCSlice 2× 18 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3541** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 381, DOM Worker 258, Renderer 113, SwComposite 43, other 35, BgPool 19, WRRenderBackend 16, Compositor 15, WRWorker 11, WRSceneBuilder 9, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 381 ms (10.3% of span): Idle 162, JavaScript 80, Layout 41, Other 37, Graphics 32, DOM 21
  - JS leaf 7 / native under JS 136 / native 239; buckets: ipc 381, poll_wait 201, gc_cc 93, paint_layout 80, worker_messaging 69, engine_stream_read 36, subprocess_pipe_io 22, array_buffer_copy 19
  - top self: `poll [libc.so.6]` 163; `[unknown]` 11; `[axiosozo-dev]` 8; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 6; `mprotect [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 113 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 48, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `hypotf@@GLIBC_2.35 [libm.so.6]` 8); SwComposite 43 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 22, `syscall [libc.so.6]` 19, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 2, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 16, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `write [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::layers::ImageBridgeChild::UpdateImageClie` 0, `unsigned int mozilla::ProfileBufferEntryWriter::Su` 0); BgIOThreadPool #2 0 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 244, poll_wait 240, gc_cc 7; top self: `poll [libc.so.6]` 240; `[axiosozo-dev]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:3472** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 5; `write [libc.so.6]` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::` 0; `bool js::FillArgumentsFromArraylike<js::InvokeArgs, JS::Call` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 78, DOM Worker 63, Renderer 58, BgPool 9, IPC I/O 6, Compositor 6, SwComposite 4, WRRenderBackend 3, WRSceneBuilder 3, other 2, Socket 2, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 77 ms (0.5% of span): Layout 19, Idle 17, JavaScript 15, Graphics 9, Other 8, GC / CC 5
  - JS leaf 2 / native under JS 25 / native 50; buckets: ipc 77, paint_layout 29, poll_wait 18, gc_cc 13, array_buffer_copy 11, harness_diagnostics 11, memcpy_memset 5, worker_messaging 4
  - top self: `poll [libc.so.6]` 17; `madvise [libc.so.6]` 3; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame co` 3; `core::ptr::drop_in_place<style::values::generics::color::Gen` 3; `mozilla::StyleGenericInset<mozilla::StylePercentage, mozilla` 2; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTA` 2
  - GC/CC markers: CCSlice 1× 4 ms, GCMinor 3× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 17, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 6); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `mozilla::layers::AsyncPanZoomController::GetCurren` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 9 ms (top self: `unlink [libc.so.6]` 7, `fstatat64 [libc.so.6]` 1, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `syscall [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 63 ms: buckets subprocess_pipe_io 63, worker_messaging 62, ipc 62, gc_cc 51, poll_wait 12, js_ctypes 12; top self: `poll [libc.so.6]` 10; `[axiosozo-dev]` 8; `madvise [libc.so.6]` 5; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3
- **tab:3559** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 4, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::jit::CanIonCompileScript(JSContext*, JSScript*) [libxul.` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3825** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 3, Graphics 1, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFra` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 0; `mozilla::ProfileChunkedBuffer::~ProfileChunkedBuffer() [libx` 0; `nsGlobalWindowInner::GetRelevantGlobal() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3520** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `TimerThread::Init() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

