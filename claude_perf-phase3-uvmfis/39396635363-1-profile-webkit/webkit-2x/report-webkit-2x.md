# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **150.2** (DOM Worker 44.7, main 41.5, Renderer 25.6, TaskCon~ller # 9.6, Indexed~ IO # 9.6) | WPEWebProcess 76.7, AxioWebKitHost 6.4, WPENetworkProce 6.4 | — | 281.5 |
| plain | idle | — | — | **10.4** (main 6.4, IPDL Background 1.5, Timer 1.0, DOM Worker 1.0, Socket Thread 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 24.4 | **33.4** (main 10.8, Renderer 5.9, Backgro~Pool # 4.3, SwComposite 3.9, DOM Worker 2.9) | WPEWebProcess 162.4, AxioWebKitHost 18.3 | — | — |
| plain | raf-nosampler | — | — | **24.3** (Renderer 6.3, main 4.0, Backgro~Pool # 3.7, SwComposite 3.7, DOM Worker 2.7) | WPEWebProcess 163.1, AxioWebKitHost 18.3 | — | — |
| plain | scroll | 54.5 | 35.1 | **46.2** (main 17.2, Backgro~Pool # 9.8, DOM Worker 5.9, Renderer 4.9, SwComposite 2.9) | WPEWebProcess 178.8, AxioWebKitHost 20.6 | — | — |
| plain | key | — | — | **18.3** (main 8.2, Renderer 3.3, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 18.3, AxioWebKitHost 2.8, WebExtensions 0.3 | 27.4 | — |
| plain | switch-to-gecko | — | — | **26.2** (main 8.7, Renderer 8.7, Compositor 4.4, SwComposite 4.4) |  | — | 211.7 |
| plain | switch-to-engine | — | — | **150.2** (DOM Worker 44.7, main 41.5, Renderer 25.6, TaskCon~ller # 9.6, Indexed~ IO # 9.6) | WPEWebProcess 76.7, AxioWebKitHost 6.4, WPENetworkProce 6.4 | — | 281.5 |
| plain | idle | — | — | **10.4** (main 6.4, IPDL Background 1.5, Timer 1.0, DOM Worker 1.0, Socket Thread 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 24.4 | **33.4** (main 10.8, Renderer 5.9, Backgro~Pool # 4.3, SwComposite 3.9, DOM Worker 2.9) | WPEWebProcess 162.4, AxioWebKitHost 18.3 | — | — |
| plain | raf-nosampler | — | — | **24.3** (Renderer 6.3, main 4.0, Backgro~Pool # 3.7, SwComposite 3.7, DOM Worker 2.7) | WPEWebProcess 163.1, AxioWebKitHost 18.3 | — | — |
| plain | scroll | 54.5 | 35.1 | **46.2** (main 17.2, Backgro~Pool # 9.8, DOM Worker 5.9, Renderer 4.9, SwComposite 2.9) | WPEWebProcess 178.8, AxioWebKitHost 20.6 | — | — |
| plain | key | — | — | **18.3** (main 8.2, Renderer 3.3, SwComposite 1.9, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 18.3, AxioWebKitHost 2.8, WebExtensions 0.3 | 27.4 | — |
| plain | switch-to-gecko | — | — | **26.2** (main 8.7, Renderer 8.7, Compositor 4.4, SwComposite 4.4) |  | — | 211.7 |
| profile | switch-to-engine | — | — | **63.6** (main 27.3, TaskCon~ller # 12.1, DOM Worker 12.1, SamplerThread 9.1, Renderer 3.0) | WPEWebProcess 72.8, Web Content 57.6, WPENetworkProce 12.1, AxioWebKitHost 6.1 | — | 302.7 |
| profile | idle | — | — | **23.2** (main 7.4, SamplerThread 6.9, DOM Worker 6.4, Timer 1.5, TaskCon~ller # 0.5) | Web Content 5.9, Privileged Cont 1.5, Socket Process 1.0, RDD Process 1.0 | — | — |
| profile | raf | 56.7 | 26.4 | **58.1** (main 15.7, DOM Worker 12.4, SamplerThread 7.8, Renderer 6.2, Backgro~Pool # 4.2) | WPEWebProcess 175.9, AxioWebKitHost 21.0, Web Content 6.8, WebExtensions 1.9 | — | — |
| profile | raf-nosampler | — | — | **45.9** (DOM Worker 9.6, main 7.6, SamplerThread 7.3, Renderer 6.6, Backgro~Pool # 4.6) | WPEWebProcess 174.7, AxioWebKitHost 19.9, Web Content 6.3, Privileged Cont 1.3 | — | — |
| profile | scroll | 55.6 | 31.2 | **76.0** (main 24.7, DOM Worker 13.8, Backgro~Pool # 10.8, SamplerThread 7.9, Renderer 5.9) | WPEWebProcess 186.8, AxioWebKitHost 21.7, Web Content 7.9, Isolated Web Co 1.5 | — | — |
| profile | key | — | — | **38.8** (main 12.6, DOM Worker 7.9, SamplerThread 7.9, Renderer 3.3, SwComposite 2.2) | WPEWebProcess 18.4, Web Content 7.1, AxioWebKitHost 3.0, WebExtensions 2.2 | 29.1 | — |
| profile | switch-to-gecko | — | — | **62.0** (main 20.7, Renderer 8.3, DOM Worker 8.3, SamplerThread 8.3, Timer 4.1) | Isolated Web Co 4.1 | — | 218.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 5.8 | 0.0 | 0 | 0.0 | — | — | 77.0 | 0.0 | — | 2.78 | 0.62 | — | — | — | — | — | 0.004 |
| profile | raf | 56.6 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.41 | 0.15 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 58.4 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.40 | 0.15 | — | — | — | — | — | 0.011 |
| profile | scroll | 53.5 | 0.0 | 0 | 0.0 | — | — | 11.9 | 0.0 | — | 1.19 | 0.15 | — | — | — | — | — | 0.015 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.11 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.881 | 4.059 | 0.0111 | 0.0238 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.232 | 0.426 | 0.0135 | 0.0248 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.206 | 0.367 | 0.0119 | 0.0213 |
| plain | scroll | memfd | native | 109 | 109 | 0.790 | 0.988 | 0.0421 | 0.0526 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.200 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.881 | 4.059 | 0.0111 | 0.0238 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.232 | 0.426 | 0.0135 | 0.0248 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.206 | 0.367 | 0.0119 | 0.0213 |
| plain | scroll | memfd | native | 109 | 109 | 0.790 | 0.988 | 0.0421 | 0.0526 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.200 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.911 | 3.494 | 0.0111 | 0.0202 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 175 | 176 | 0.295 | 0.493 | 0.0167 | 0.0280 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.278 | 0.483 | 0.0162 | 0.0280 |
| profile | scroll | memfd | native | 109 | 109 | 0.979 | 1.392 | 0.0523 | 0.0744 |
| profile | key | memfd | native | 20 | 20 | 0.004 | 0.218 | 0.0000 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 26.7 | 0.0 | — | 0.11 | 0.45 | — | — | 84.2 | 27.8 | 109.7 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 23.3; first stdout read resolved 28.7; first frame applied (native receiver) 311.5; write frame_ack 312.5; write visibility 318.8; write focus 319.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 23.6; first stdout read resolved 31.2

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 89, DOM Worker 22, Renderer 17, BgPool 9, SwComposite 4, Compositor 3, IPC I/O 2, WRRenderBackend 2, WRSceneBuilder 1, Socket 1, WRWorker 0, other 0, ImageBridge 0, Canvas 0, ImageIO 0
  - main thread 89 ms (26.2% of span): GC / CC 46, JavaScript 25, Idle 8, Layout 4, DOM 3, Graphics 1
  - JS leaf 1 / native under JS 32 / native 57; buckets: ipc 88, gc_cc 71, harness_diagnostics 11, array_buffer_copy 11, poll_wait 11, paint_layout 8, engine_stream_read 7, worker_messaging 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 3; `nsINode::GetExistingListenerManager() const [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 137 ms, GCSlice 15× 78 ms, CCSlice 1× 13 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 17 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `ClearTexSubImage [libxul.so]` 2); SwComposite 4 ms (top self: `syscall [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ARGBSetRow_X86 [libxul.so]` 3, `__memset_evex_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 22 ms: buckets subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 20, poll_wait 20, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 20; `__lll_lock_wake [libc.so.6]` 1; `void mozilla::dom::Function::Call<nsCOMPtr<nsIGlob` 1; `EnqueuePromiseReactionJob(JSContext*, JS::Handle<J` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:9493** CPU ms by thread group: main 48, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (15.3% of span): Other 38, JavaScript 4, DOM 3, Profiler 3, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 37, array_buffer_copy 16, gc_cc 12, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 1, image_container 1
  - top self: `[]` 5; `__syscall_cancel_arch [libc.so.6]` 4; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.` 3; `mprotect [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `[libfontconfig.so.1]` 2
  - GC/CC markers: GCMinor 1× 3 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9499** CPU ms by thread group: main 46, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 46 ms (17.9% of span): Other 36, DOM 3, Profiler 3, JavaScript 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 42; buckets: ipc 36, array_buffer_copy 14, gc_cc 9, subprocess_pipe_io 5, poll_wait 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 3; `__lll_lock_wake [libc.so.6]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `IPC::ParamTraits<nsRect>::Read(IPC::MessageReader*, nsRect*)` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9357** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 136, DOM Worker 79, other 16, Renderer 1, SwComposite 1, IPC I/O 1, Compositor 1, Socket 1, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 136 ms (6.6% of span): Idle 111, JavaScript 13, Other 7, DOM 3, Profiler 2, GC / CC 1
  - JS leaf 1 / native under JS 15 / native 120; buckets: ipc 136, poll_wait 114, harness_diagnostics 13, gc_cc 6, array_buffer_copy 6, subprocess_pipe_io 2, engine_stream_read 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 113; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 1; `[unknown]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `webrender::composite::CompositeState::register_occ` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 70 ms: buckets subprocess_pipe_io 70, worker_messaging 70, ipc 70, js_ctypes 70, poll_wait 70, memcpy_memset 0; top self: `__syscall_cancel_arch [libc.so.6]` 70; `[axiosozo-dev]` 0
- **tab:9499** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [l` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9493** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8975** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 448, DOM Worker 312, Renderer 180, BgPool 135, SwComposite 106, WRRenderBackend 43, Compositor 33, other 26, ImageBridge 14, WRSceneBuilder 6, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 448 ms (14.5% of span): Idle 293, JavaScript 57, GC / CC 37, Other 28, DOM 27, Profiler 6
  - JS leaf 6 / native under JS 75 / native 367; buckets: ipc 439, poll_wait 302, gc_cc 89, engine_stream_read 41, harness_diagnostics 37, worker_messaging 20, native_receiver 17, array_buffer_copy 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[axiosozo-dev]` 11; `[linux-vdso.so.1]` 9; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 4
  - GC/CC markers: GCMajor 1× 1059 ms, GCSlice 8× 42 ms, CCSlice 2× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 180 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_evex_unaligned_erms [libc.so.6]` 31, `syscall [libc.so.6]` 17); SwComposite 106 ms (top self: `syscall [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 10); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 7, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 135 ms (top self: `__syscall_cancel_arch [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 36, `__lll_lock_wait [libc.so.6]` 1); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `mozilla::layers::TextureClient::TextureClientRecyc` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 312 ms: buckets subprocess_pipe_io 312, worker_messaging 308, ipc 308, js_ctypes 212, poll_wait 206, gc_cc 82; top self: `__syscall_cancel_arch [libc.so.6]` 207; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 12; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 10; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >` 10; `madvise [libc.so.6]` 7
- **tab:8901** CPU ms by thread group: main 9, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.3% of span): GC / CC 7, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 8, gc_cc 7, poll_wait 3, memcpy_memset 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `__syscall_cancel_arch [libc.so.6]` 3; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `nsDocShell::cycleCollection::TraverseNative(void*, nsCycleCo` 1; `mozilla::dom::BrowsingContext::SweepWindowProxies(JSTracer*)` 0; `__lll_lock_wake [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 47 ms, GCSlice 4× 14 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8994** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (0.3% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: ipc 7, gc_cc 7, poll_wait 3, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mmap64 [libc.so.6]` 1; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, ` 1
  - GC/CC markers: GCMajor 1× 8 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `bool js::gc::UnmarkGrayTracer<8u>::onChild<js::GetterSetter>` 0; `core::hash::BuildHasher::hash_one [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 2× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 221, DOM Worker 221, Renderer 177, BgPool 131, SwComposite 113, WRRenderBackend 43, Compositor 33, ImageBridge 13, WRSceneBuilder 6, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 221 ms (7.3% of span): Idle 122, GC / CC 40, JavaScript 36, DOM 14, Other 7, Profiler 2
  - JS leaf 7 / native under JS 41 / native 172; buckets: ipc 221, poll_wait 128, gc_cc 89, engine_stream_read 39, worker_messaging 27, subprocess_pipe_io 10, native_receiver 9, array_buffer_copy 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 127; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 8; `[unknown]` 7; `mmap64 [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `XPCWrappedNative::Trace(JSTracer*, JSObject*) [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 79 ms, GCSlice 15× 43 ms, CCSlice 1× 11 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 177 ms (top self: `__syscall_cancel_arch [libc.so.6]` 101, `__memmove_evex_unaligned_erms [libc.so.6]` 50, `syscall [libc.so.6]` 21); SwComposite 113 ms (top self: `syscall [libc.so.6]` 90, `__memmove_evex_unaligned_erms [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 43 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 7, `floorf [libxul.so]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 130 ms (top self: `__syscall_cancel_arch [libc.so.6]` 90, `__memmove_evex_unaligned_erms [libc.so.6]` 36, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0, `mkdir [libc.so.6]` 0)
  - busiest DOM Worker 221 ms: buckets subprocess_pipe_io 221, worker_messaging 221, ipc 221, js_ctypes 200, poll_wait 194, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 195; `[unknown]` 2; `nsWindowRoot::DispatchEvent(mozilla::dom::Event&, ` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[axiosozo-dev]` 1
- **tab:8975** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9363** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 476, DOM Worker 248, BgPool 200, Renderer 109, SwComposite 71, WRRenderBackend 31, Compositor 21, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 2, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 476 ms (23.3% of span): Idle 267, JavaScript 91, Other 44, GC / CC 26, DOM 20, Graphics 12
  - JS leaf 12 / native under JS 95 / native 369; buckets: ipc 473, poll_wait 313, gc_cc 111, engine_stream_read 56, worker_messaging 43, paint_layout 39, harness_diagnostics 34, array_buffer_copy 27
  - top self: `__syscall_cancel_arch [libc.so.6]` 293; `[unknown]` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `__lll_lock_wake [libc.so.6]` 8; `[axiosozo-dev]` 5; `mprotect [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 406 ms, GCSlice 6× 21 ms, GCMinor 3× 8 ms
  - WebRender/compositor threads: Renderer 109 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `__memmove_evex_unaligned_erms [libc.so.6]` 21, `syscall [libc.so.6]` 11); SwComposite 71 ms (top self: `syscall [libc.so.6]` 63, `__memmove_evex_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 31 ms (top self: `syscall [libc.so.6]` 22, `sched_yield [libc.so.6]` 5, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 200 ms (top self: `__syscall_cancel_arch [libc.so.6]` 129, `__memmove_evex_unaligned_erms [libc.so.6]` 67, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 248 ms: buckets subprocess_pipe_io 248, worker_messaging 247, ipc 247, js_ctypes 221, poll_wait 211, array_buffer_copy 7; top self: `__syscall_cancel_arch [libc.so.6]` 212; `[axiosozo-dev]` 5; `__lll_lock_wake [libc.so.6]` 4; `__memset_evex_unaligned_erms [libc.so.6]` 4; `DefineDataProperty(JSContext*, JS::Handle<JSObject` 2
- **tab:8953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9363** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9493** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*)` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 434, DOM Worker 188, Renderer 117, SwComposite 78, other 28, WRRenderBackend 19, Compositor 16, WRWorker 10, WRSceneBuilder 9, BgPool 5, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 433 ms (11.8% of span): Idle 222, JavaScript 89, Layout 32, Graphics 27, Other 26, DOM 26
  - JS leaf 15 / native under JS 129 / native 290; buckets: ipc 432, poll_wait 258, gc_cc 84, paint_layout 76, engine_stream_read 66, worker_messaging 54, harness_diagnostics 31, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 236; `[unknown]` 14; `[axiosozo-dev]` 7; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc` 6; `js::jit::CacheIRWriter::callDOMGetterResult(js::jit::ObjOper` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: GCMinor 1× 1 ms, GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 117 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 34, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 8); SwComposite 79 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 41, `syscall [libc.so.6]` 36, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 15, `sched_yield [libc.so.6]` 1, `webrender::batch::AlphaBatchList::set_params_and_g` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `[axiosozo-dev]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::layers::PTextureChild::SendRecycleTexture` 0, `IPC::StringFromIPCMessageType(unsigned int) [libxu` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 188 ms: buckets subprocess_pipe_io 188, worker_messaging 187, ipc 187, js_ctypes 172, poll_wait 168, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 172; `mozilla::JSCallingLocation::Get(JSContext*) [libxu` 3; `[axiosozo-dev]` 2; `[unknown]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 1
- **tab:8901** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, DOM 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::ResolvePromiseInternal(JSContext*, JS::Handle<JSObject*>` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `mozilla::dom::JSActor::ReceiveQuery(JSContext*, mozilla::dom` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9363** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8994** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 82, Renderer 31, DOM Worker 14, SwComposite 6, BgPool 5, Compositor 4, WRRenderBackend 2, IPC I/O 2, WRSceneBuilder 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 82 ms (29.1% of span): JavaScript 34, GC / CC 19, Layout 7, Idle 6, Graphics 5, Other 5
  - JS leaf 3 / native under JS 37 / native 41; buckets: ipc 82, gc_cc 32, paint_layout 17, array_buffer_copy 16, harness_diagnostics 12, poll_wait 9, engine_stream_read 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `[axiosozo-dev]` 3; `array_includes(JSContext*, unsigned int, JS::Value*) [libxul` 3; `listener (resource://gre/modules/ExtensionParent.sys.mjs:133` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCSlice 5× 10 ms, CCSlice 1× 6 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10, `ps_quad_textured_TEXTURE_2D_frag::swgl_drawSpanRGB` 3); SwComposite 6 ms (top self: `syscall [libc.so.6]` 6, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 1, `fstat64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, js_ctypes 13, poll_wait 12; top self: `__syscall_cancel_arch [libc.so.6]` 12; `js::ctypes::StructType::LookupField(JSContext*, JS` 1; `std::__detail::_MakeUniq<mozilla::dom::IPCClientIn` 1
- **tab:9357** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.2% of span): Other 7, JavaScript 6, Idle 4, Layout 3, DOM 2, GC / CC 2
  - JS leaf 1 / native under JS 5 / native 20; buckets: ipc 21, gc_cc 13, paint_layout 10, subprocess_pipe_io 7, poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 3; `[]` 2; `nsRefreshDriver::GetNextTickHint() [libxul.so]` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseN` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8901** CPU ms by thread group: main 5, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (1.6% of span): Idle 2, JavaScript 2, DOM 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, array_buffer_copy 2, poll_wait 2, gc_cc 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::jit::DoGetPropFallback(JSContext*, js::jit::BaselineFram` 1; `void mozilla::detail::HashTable<mozilla::HashMapEntry<js::ji` 1; `__memmove_evex_unaligned_erms [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9499** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_evex_unaligned_erms [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

