# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **40.2** (main 17.8, Renderer 8.9, glean.dispatche 4.5, WRRende~ckend# 4.5, DOM Worker 4.5) | WPEWebProcess 71.3, WPENetworkProce 13.4, AxioWebKitHost 4.5 | — | 194.1 |
| plain | idle | — | — | **8.3** (main 6.3, Timer 1.0, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.9, AxioWebKitHost 0.5, WebExtensions 0.5 | — | — |
| plain | raf | 58.2 | 25.5 | **23.0** (main 10.4, Renderer 2.3, DOM Worker 2.3, TaskCon~ller # 1.3, Timer 1.0) | WPEWebProcess 59.6, AxioWebKitHost 6.2, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **14.6** (main 4.0, DOM Worker 2.7, Renderer 2.3, WRRende~ckend# 1.0, Compositor 1.0) | WPEWebProcess 57.2, AxioWebKitHost 5.9, WebExtensions 0.3 | — | — |
| plain | scroll | 57.9 | 32.2 | **38.3** (main 19.0, DOM Worker 6.3, TaskCon~ller # 2.0, Renderer 2.0, WRRende~ckend# 2.0) | WPEWebProcess 64.0, AxioWebKitHost 8.4 | — | — |
| plain | key | — | — | **15.9** (main 10.4, Renderer 1.4, DOM Worker 1.1, Timer 0.5, TaskCon~ller # 0.5) | WPEWebProcess 6.9, AxioWebKitHost 2.2 | 18.3 | — |
| plain | switch-to-gecko | — | — | **12.6** (main 8.4, sqldb:p~lite # 4.2) | Isolated Web Co 4.2 | — | 211.8 |
| trace | switch-to-engine | — | — | **30.6** (main 13.9, Renderer 11.1, glean.dispatche 2.8, WRRende~ckend# 2.8) | WPEWebProcess 75.0, WPENetworkProce 8.3 | — | 333.2 |
| trace | idle | — | — | **10.3** (main 7.8, TaskCon~ller # 1.5, Timer 0.5, DOM Worker 0.5) | Web Content 3.9 | — | — |
| trace | raf | 58.1 | 27.3 | **38.0** (main 17.6, DOM Worker 5.2, TaskCon~ller # 3.3, Renderer 2.3, IPDL Background 1.3) | WPEWebProcess 60.7, AxioWebKitHost 7.2, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **16.5** (main 4.0, DOM Worker 3.7, Renderer 2.0, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 59.5, AxioWebKitHost 6.0 | — | — |
| trace | scroll | 56.9 | 33.5 | **39.6** (main 18.7, DOM Worker 7.9, Renderer 2.5, Backgro~Pool # 2.0, TaskCon~ller # 1.5) | WPEWebProcess 64.1, AxioWebKitHost 8.4 | — | — |
| trace | key | — | — | **19.5** (main 11.0, TaskCon~ller # 1.6, Renderer 1.4, DOM Worker 1.4, Timer 1.1) | WPEWebProcess 6.3, AxioWebKitHost 1.4, WebExtensions 0.3 | 17.9 | — |
| trace | switch-to-gecko | — | — | **21.5** (main 8.6, BgIOThr~Pool # 4.3, Renderer 4.3, DOM Worker 4.3) | Isolated Web Co 4.3 | — | 212.3 |
| profile | switch-to-engine | — | — | **57.6** (main 14.4, DOM Worker 14.4, SamplerThread 14.4, glean.dispatche 3.6, Renderer 3.6) | WPEWebProcess 72.1, Web Content 10.8, AxioWebKitHost 7.2, WPENetworkProce 7.2 | — | 245.2 |
| profile | idle | — | — | **25.1** (main 7.7, SamplerThread 7.7, DOM Worker 7.3, Timer 1.9, glean.dispatche 0.5) | Web Content 6.8, WebExtensions 1.9, Privileged Cont 1.9, Socket Process 1.5 | — | — |
| profile | raf | 57.9 | 20.9 | **49.7** (main 14.3, DOM Worker 11.0, SamplerThread 10.0, Renderer 2.9, Timer 1.9) | WPEWebProcess 65.1, AxioWebKitHost 8.3, Web Content 7.8, Isolated Web Co 1.9 | — | — |
| profile | raf-nosampler | — | — | **38.2** (DOM Worker 10.6, SamplerThread 8.9, main 7.3, Renderer 3.0, WRRende~ckend# 1.7) | WPEWebProcess 66.3, AxioWebKitHost 7.3, Web Content 7.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 57.2 | 31.8 | **64.1** (main 25.6, DOM Worker 14.5, SamplerThread 10.2, Renderer 2.9, Backgro~Pool # 2.9) | WPEWebProcess 66.3, AxioWebKitHost 9.3, Web Content 6.8, WebExtensions 1.5 | — | — |
| profile | key | — | — | **44.3** (main 17.5, SamplerThread 9.3, DOM Worker 8.8, TaskCon~ller # 2.2, Timer 1.6) | Web Content 7.7, WPEWebProcess 6.6, Privileged Cont 2.2, Isolated Web Co 1.9 | 18.0 | — |
| profile | switch-to-gecko | — | — | **53.2** (main 16.3, BgIOThr~Pool # 8.2, DOM Worker 8.2, Timer 4.1, Renderer 4.1) | Isolated Web Co 8.2 | — | 218.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.1 | 0.0 | 0 | 0.0 | — | — | 121.3 | 0.0 | — | 0.67 | 0.37 | — | — | — | — | — | 0.002 |
| trace | raf | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.12 | 0.10 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 58.4 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.12 | 0.09 | — | — | — | — | — | 0.006 |
| trace | scroll | 55.7 | 0.0 | 0 | 0.0 | — | — | 10.8 | 0.0 | — | 0.24 | 0.09 | — | — | — | — | — | 0.005 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.5 | 0.0 | — | 0.08 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 6.6 | 0.0 | 0 | 0.0 | — | — | 72.6 | 0.0 | — | 1.07 | 0.55 | — | — | — | — | — | 0.004 |
| profile | raf | 58.0 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.16 | 0.14 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.18 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 56.1 | 0.0 | 0 | 0.0 | — | — | 11.3 | 0.0 | — | 0.35 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.9 | 0.0 | — | 0.14 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.436 | 0.689 | 0.0036 | 0.0057 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.032 | 0.062 | 0.0019 | 0.0036 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.043 | 0.082 | 0.0025 | 0.0047 |
| plain | scroll | memfd | native | 117 | 117 | 0.138 | 0.196 | 0.0078 | 0.0111 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.077 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.460 | 1.345 | 0.0023 | 0.0068 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.037 | 0.069 | 0.0022 | 0.0040 |
| trace | raf-nosampler | memfd | native | 176 | 176 | 0.039 | 0.076 | 0.0022 | 0.0044 |
| trace | scroll | memfd | native | 114 | 114 | 0.145 | 0.207 | 0.0081 | 0.0115 |
| trace | key | memfd | native | 20 | 20 | 0.000 | 0.064 | 0.0000 | 0.0003 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.880 | 0.732 | 0.0058 | 0.0048 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.049 | 0.093 | 0.0028 | 0.0054 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.060 | 0.100 | 0.0035 | 0.0057 |
| profile | scroll | memfd | native | 117 | 117 | 0.210 | 0.229 | 0.0118 | 0.0129 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.069 | 0.0000 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 13.8 | 0.0 | — | 0.08 | 0.28 | — | — | 12.9 | 14.5 | 28.2 |
| profile | 0.6 | 14.2 | 0.0 | — | 0.14 | 0.48 | — | — | 10.8 | 15.5 | 25.6 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 46.9; first stdout read resolved 52.7; first frame applied (native receiver) 371.4; write frame_ack 372.0; write visibility 376.4; write focus 376.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 16.7; first stdout read resolved 22.2

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.5; first stdout read resolved 41.9; first frame applied (native receiver) 264.9; write frame_ack 265.8; write visibility 273.6; write focus 273.8

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 27.8; first stdout read resolved 36.3

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 37, DOM Worker 22, Renderer 12, BgPool 3, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, IPC I/O 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 37 ms (12.4% of span): JavaScript 22, Other 4, Idle 4, Graphics 3, Layout 3, Profiler 1
  - JS leaf 4 / native under JS 20 / native 14; buckets: ipc 37, gc_cc 16, array_buffer_copy 11, harness_diagnostics 8, engine_stream_read 7, paint_layout 7, worker_messaging 5, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[unknown]` 4; `goSetCommandEnabled (chrome://global/content/globalOverlay.j` 3; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [` 2
  - WebRender/compositor threads: Renderer 12 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 3, `ps_quad_textured_TEXTURE_2D_frag::swgl_drawSpanRGB` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 1, `[axiosozo-dev]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::build_ite` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 22 ms: buckets subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 18, poll_wait 16, memcpy_memset 3; top self: `__syscall_cancel_arch [libc.so.6]` 16; `[axiosozo-dev]` 2; `ffi_call_plan_invoke [libxul.so]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7843** CPU ms by thread group: main 37, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (12.4% of span): Other 27, DOM 5, Profiler 4, JavaScript 1, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 32; buckets: ipc 36, array_buffer_copy 19, gc_cc 7, memcpy_memset 1, subprocess_pipe_io 1, poll_wait 0
  - top self: `__lll_lock_wake [libc.so.6]` 4; `[libexpat.so.1]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `access [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::TokenizerBase<char>::Token::Token() [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7696** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `nsTString<char>* nsTArray_Impl<nsTString<char>, nsTArrayInfa` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7849** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0
  - top self: `PR_IntervalNow [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 145, DOM Worker 95, other 19, Socket 1, IPC I/O 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 145 ms (7.0% of span): Idle 111, JavaScript 14, Other 8, DOM 6, GC / CC 5, Profiler 1
  - JS leaf 3 / native under JS 18 / native 125; buckets: ipc 144, poll_wait 116, harness_diagnostics 20, gc_cc 8, array_buffer_copy 4, engine_stream_read 4, native_receiver 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 114; `[axiosozo-dev]` 2; `[unknown]` 1; `mozilla::dom::WindowGlobalParent::cycleCollection::TraverseN` 1; `js::jit::GetPropIRGenerator::tryAttachArgumentsObjectIterato` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1
  - GC/CC markers: CCSlice 1× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 95 ms: buckets subprocess_pipe_io 95, js_ctypes 95, worker_messaging 95, ipc 95, poll_wait 95; top self: `__syscall_cancel_arch [libc.so.6]` 95
- **tab:7696** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::RestyleManager::ProcessPostTraversal(mozilla::dom::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7351** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 403, DOM Worker 250, Renderer 82, WRRenderBackend 48, SwComposite 40, Compositor 38, BgPool 33, other 31, ImageBridge 16, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 403 ms (13.0% of span): Idle 275, JavaScript 62, Other 37, DOM 22, Profiler 6, GC / CC 2
  - JS leaf 8 / native under JS 74 / native 321; buckets: ipc 402, poll_wait 296, gc_cc 67, engine_stream_read 46, worker_messaging 30, harness_diagnostics 27, subprocess_pipe_io 13, native_receiver 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 12; `mprotect [libc.so.6]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 71, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 3); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 40 ms (top self: `syscall [libc.so.6]` 38, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 28, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `mozilla::ipc::PortLink::SendMessage(std::unique_pt` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 250 ms: buckets subprocess_pipe_io 250, worker_messaging 250, ipc 250, js_ctypes 227, poll_wait 222, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 223; `[unknown]` 3; `[axiosozo-dev]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7696** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 250, main 208, Renderer 79, WRRenderBackend 46, Compositor 38, SwComposite 37, BgPool 35, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 208 ms (6.8% of span): Idle 116, JavaScript 56, Other 25, DOM 10, Profiler 1
  - JS leaf 9 / native under JS 55 / native 145; buckets: ipc 207, poll_wait 130, gc_cc 67, engine_stream_read 47, worker_messaging 31, subprocess_pipe_io 11, array_buffer_copy 11, native_receiver 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 127; `[unknown]` 10; `[axiosozo-dev]` 3; `next (self-hosted:392:27)[28]` 3; `mprotect [libc.so.6]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 79 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `syscall [libc.so.6]` 4); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 3, `webrender::invalidation::quadtree::TileNode::updat` 0); SwComposite 37 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 34 ms (top self: `__syscall_cancel_arch [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 16 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `[linux-vdso.so.1]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 235 ms: buckets subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 221, poll_wait 215, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 217; `[axiosozo-dev]` 2; `[unknown]` 1; `mozilla::dom::AutoYieldJSThreadExecution::AutoYiel` 1; `js::ctypes::ConvertToJS(JSContext*, JS::Handle<JSO` 1
- **tab:7324** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 503, DOM Worker 241, BgPool 53, Renderer 51, WRRenderBackend 33, Compositor 25, SwComposite 22, other 20, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 503 ms (24.2% of span): Idle 268, JavaScript 105, Other 60, DOM 33, Graphics 18, Profiler 10
  - JS leaf 8 / native under JS 129 / native 366; buckets: ipc 502, poll_wait 336, gc_cc 108, engine_stream_read 84, worker_messaging 60, paint_layout 49, harness_diagnostics 38, array_buffer_copy 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 18; `[axiosozo-dev]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 4; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 51 ms (top self: `__syscall_cancel_arch [libc.so.6]` 39, `syscall [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 22 ms (top self: `syscall [libc.so.6]` 21, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 53 ms (top self: `__syscall_cancel_arch [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `mozilla::ipc::MessagePumpForNonMainThreads::Run(ba` 0, `IPC::ParamTraits<mozilla::layers::CompositableOper` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 241 ms: buckets subprocess_pipe_io 241, worker_messaging 241, ipc 241, js_ctypes 204, poll_wait 198, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 199; `[axiosozo-dev]` 4; `[unknown]` 3; `JSStructuredCloneReader::read(JS::MutableHandle<JS` 3; `__lll_lock_wait [libc.so.6]` 3
- **tab:7351** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7324** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7700** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 589, DOM Worker 215, Renderer 52, other 33, SwComposite 18, Compositor 17, WRRenderBackend 14, WRWorker 11, WRSceneBuilder 9, BgPool 2, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 589 ms (16.1% of span): Idle 230, GC / CC 95, JavaScript 92, Layout 47, Other 43, Graphics 37
  - JS leaf 15 / native under JS 151 / native 424; buckets: ipc 585, poll_wait 273, gc_cc 190, paint_layout 97, worker_messaging 76, engine_stream_read 67, harness_diagnostics 29, memcpy_memset 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `[axiosozo-dev]` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 7; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 5
  - GC/CC markers: GCMajor 2× 1371 ms, GCSlice 17× 68 ms, CCSlice 7× 24 ms, GCMinor 3× 4 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 52 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `syscall [libc.so.6]` 6); SwComposite 18 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 9, `sched_yield [libc.so.6]` 3, `webrender::texture_cache::TextureCache::try_get_ca` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 215 ms: buckets subprocess_pipe_io 215, worker_messaging 215, ipc 215, js_ctypes 206, poll_wait 201, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 201; `js::NativeObject::create(JSContext*, js::gc::Alloc` 1; `[unknown]` 1; `JSObject::allocKindForTenure(js::Nursery const&) c` 1; `js::gc::StoreBuffer::MonoTypeBuffer<js::gc::StoreB` 1
- **tab:7242** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `JSStructuredCloneWriter::writeTransferMap() [libxul.so]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0; `nsWindowRoot::Release() [libxul.so]` 0; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.` 0; `JSStructuredCloneReader::readObjectField(JS::Handle<JSObject` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7324** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 65, Renderer 18, DOM Worker 13, BgPool 11, Compositor 2, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, SwComposite 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (22.8% of span): JavaScript 27, Idle 10, Other 8, Layout 6, Graphics 5, DOM 5
  - JS leaf 3 / native under JS 35 / native 27; buckets: ipc 65, poll_wait 17, array_buffer_copy 16, gc_cc 14, paint_layout 12, harness_diagnostics 10, engine_stream_read 5, worker_messaging 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `mprotect [libc.so.6]` 4; `mozilla::layers::ClipManager::SwitchItem(mozilla::nsDisplayL` 3; `nsIFrame::IsTransformed() const [libxul.so]` 3
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `__syscall_cancel_arch [libc.so.6]` 4, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `rmdir [libc.so.6]` 4, `unlink [libc.so.6]` 3, `__open_nocancel [libc.so.6]` 2); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, js_ctypes 12, poll_wait 12; top self: `__syscall_cancel_arch [libc.so.6]` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `[unknown]` 0
- **tab:7696** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.2% of span): Other 9, JavaScript 7, Idle 5, Layout 4, GC / CC 1
  - JS leaf 0 / native under JS 8 / native 18; buckets: ipc 25, paint_layout 13, gc_cc 10, subprocess_pipe_io 6, poll_wait 5, harness_diagnostics 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libfontconfig.so.1]` 4; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, J` 2; `nsBaseURLParser::ParsePath(char const*, int, unsigned int*, ` 1; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `mozilla::net::nsStandardURL::CoalescePath(char*) [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7242** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, DOM 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7843** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

