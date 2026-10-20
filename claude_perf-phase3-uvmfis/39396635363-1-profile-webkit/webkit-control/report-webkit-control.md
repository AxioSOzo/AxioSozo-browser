# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **39.5** (Renderer 13.8, main 9.8, WRRende~ckend# 3.9, Backgro~Pool # 2.0, Timer 2.0) | WPEWebProcess 55.1, AxioWebKitHost 17.7, WPENetworkProce 11.8 | — | 489.5 |
| plain | idle | — | — | **4.0** (main 3.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.0 | 27.1 | **56.3** (main 17.4, DOM Worker 11.8, Renderer 6.2, SwComposite 4.9, IPDL Background 3.6) | WPEWebProcess 54.2, AxioWebKitHost 7.0, RDD Process 0.3, Utility Process 0.3 | — | — |
| plain | raf-nosampler | — | — | **30.2** (Renderer 6.7, main 6.3, SwComposite 5.0, DOM Worker 4.3, TaskCon~ller # 2.3) | WPEWebProcess 55.5, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 55.4 | 33.5 | **43.0** (main 17.0, Renderer 6.5, DOM Worker 6.5, SwComposite 4.5, Backgro~Pool # 2.5) | WPEWebProcess 56.4, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.2, DOM Worker 1.4, Renderer 1.1, SwComposite 1.1, Timer 0.6) | WPEWebProcess 7.0, AxioWebKitHost 1.4, WebExtensions 0.3 | 16.7 | — |
| plain | switch-to-gecko | — | — | **43.8** (main 21.9, TaskCon~ller # 13.1, Socket Thread 4.4, Renderer 4.4) |  | — | 210.3 |
| plain | switch-to-engine | — | — | **39.5** (Renderer 13.8, main 9.8, WRRende~ckend# 3.9, Backgro~Pool # 2.0, Timer 2.0) | WPEWebProcess 55.1, AxioWebKitHost 17.7, WPENetworkProce 11.8 | — | 489.5 |
| plain | idle | — | — | **4.0** (main 3.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.0 | 27.1 | **56.3** (main 17.4, DOM Worker 11.8, Renderer 6.2, SwComposite 4.9, IPDL Background 3.6) | WPEWebProcess 54.2, AxioWebKitHost 7.0, RDD Process 0.3, Utility Process 0.3 | — | — |
| plain | raf-nosampler | — | — | **30.2** (Renderer 6.7, main 6.3, SwComposite 5.0, DOM Worker 4.3, TaskCon~ller # 2.3) | WPEWebProcess 55.5, AxioWebKitHost 6.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 55.4 | 33.5 | **43.0** (main 17.0, Renderer 6.5, DOM Worker 6.5, SwComposite 4.5, Backgro~Pool # 2.5) | WPEWebProcess 56.4, AxioWebKitHost 8.5 | — | — |
| plain | key | — | — | **12.9** (main 7.2, DOM Worker 1.4, Renderer 1.1, SwComposite 1.1, Timer 0.6) | WPEWebProcess 7.0, AxioWebKitHost 1.4, WebExtensions 0.3 | 16.7 | — |
| plain | switch-to-gecko | — | — | **43.8** (main 21.9, TaskCon~ller # 13.1, Socket Thread 4.4, Renderer 4.4) |  | — | 210.3 |
| profile | switch-to-engine | — | — | **31.8** (DOM Worker 11.7, SamplerThread 10.0, main 8.4, Renderer 1.7) | WPEWebProcess 50.1, Web Content 48.5, AxioWebKitHost 15.0, WPENetworkProce 10.0 | — | 575.8 |
| profile | idle | — | — | **23.2** (main 6.9, DOM Worker 6.9, SamplerThread 6.9, Timer 2.0, TaskCon~ller # 0.5) | Web Content 6.4, Socket Process 1.0, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 58.1 | 20.6 | **55.5** (main 13.7, DOM Worker 10.1, SamplerThread 9.2, Renderer 7.5, SwComposite 5.9) | WPEWebProcess 56.6, AxioWebKitHost 6.9, Web Content 6.8, Privileged Cont 1.6 | — | — |
| profile | raf-nosampler | — | — | **44.9** (DOM Worker 10.6, SamplerThread 8.0, Renderer 7.6, SwComposite 6.0, main 5.6) | WPEWebProcess 54.8, AxioWebKitHost 7.0, Web Content 6.6, WebExtensions 1.3 | — | — |
| profile | scroll | 57.9 | 30.0 | **76.2** (main 27.2, DOM Worker 13.3, SamplerThread 8.9, Renderer 7.4, SwComposite 5.4) | WPEWebProcess 60.9, AxioWebKitHost 8.4, Web Content 5.9, WebExtensions 1.5 | — | — |
| profile | key | — | — | **35.8** (main 13.7, DOM Worker 8.0, SamplerThread 7.4, Timer 1.4, Renderer 1.4) | Web Content 7.1, WPEWebProcess 6.8, WebExtensions 1.7, AxioWebKitHost 1.7 | 17.9 | — |
| profile | switch-to-gecko | — | — | **41.3** (main 12.4, QuotaManager IO 8.3, DOM Worker 8.3, BgIOThr~Pool # 4.1, Renderer 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 215.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.3 | 0.0 | 0 | 0.0 | — | — | 118.3 | 0.0 | — | 2.02 | 0.60 | — | — | — | — | — | 0.002 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.15 | 0.12 | — | — | — | — | — | 0.008 |
| profile | raf-nosampler | 58.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.16 | 0.12 | — | — | — | — | — | 0.009 |
| profile | scroll | 56.5 | 0.0 | 0 | 0.0 | — | — | 10.0 | 0.0 | — | 0.37 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.7 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.904 | 1.527 | 0.0035 | 0.0059 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.047 | 0.117 | 0.0028 | 0.0068 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.064 | 0.139 | 0.0037 | 0.0081 |
| plain | scroll | memfd | native | 109 | 109 | 0.213 | 0.296 | 0.0115 | 0.0160 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.098 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.904 | 1.527 | 0.0035 | 0.0059 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.047 | 0.117 | 0.0028 | 0.0068 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.064 | 0.139 | 0.0037 | 0.0081 |
| plain | scroll | memfd | native | 109 | 109 | 0.213 | 0.296 | 0.0115 | 0.0160 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.098 | 0.0000 | 0.0005 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.028 | 2.090 | 0.0034 | 0.0068 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 179 | 179 | 0.058 | 0.120 | 0.0034 | 0.0070 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.071 | 0.144 | 0.0041 | 0.0084 |
| profile | scroll | memfd | native | 115 | 115 | 0.241 | 0.340 | 0.0136 | 0.0192 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.108 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 14.9 | 0.0 | — | 0.14 | 0.49 | — | — | 161.9 | 16.3 | 178.4 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 23.3; spawn AxioWebKitHost resolved 41.8; write hello 46.3; first stdout read resolved 123.2; write create 128.8; first frame applied (native receiver) 581.7; write frame_ack 582.8; write visibility 589.7; write focus 589.8

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 19.2; first stdout read resolved 27.3

### Profile: webkit-control / switch-to-engine

- **parent** CPU ms by thread group: main 43, DOM Worker 42, Renderer 8, BgPool 6, IPC I/O 4, Compositor 2, SwComposite 2, WRSceneBuilder 1, WRRenderBackend 1, Socket 1, ImageBridge 0, other 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 43 ms (7.0% of span): JavaScript 17, DOM 7, Idle 7, Layout 4, Other 4, Graphics 3
  - JS leaf 1 / native under JS 24 / native 18; buckets: ipc 41, gc_cc 21, worker_messaging 9, harness_diagnostics 9, array_buffer_copy 8, engine_stream_read 8, paint_layout 8, poll_wait 8
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `[axiosozo-dev]` 3; `[unknown]` 2; `mozilla::CanAttemptToDrainMoreMicroTasks(mozilla::CycleColle` 2; `mozilla::EventListenerManager::HandleEventInternal(nsPresCon` 2; `[libxul.so]` 2
  - WebRender/compositor threads: Renderer 8 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `__syscall_cancel_arch [libc.so.6]` 1, `int blendTextureNearestFast<false, glsl::sampler2D` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 2, `__memset_evex_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 42 ms: buckets subprocess_pipe_io 42, worker_messaging 42, ipc 42, js_ctypes 34, poll_wait 33, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 33; `__lll_lock_wait [libc.so.6]` 2; `mozilla::dom::WorkerThread::Observer::OnProcessNex` 1; `__abort_lock_unlock [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1
- **tab:10465** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (8.3% of span): Other 39, JavaScript 5, DOM 3, Profiler 1, GC / CC 1, Idle 1
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 34, gc_cc 13, array_buffer_copy 13, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 1
  - top self: `[]` 3; `__read_nocancel [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.` 2; `__strlen_evex [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10468** CPU ms by thread group: main 43, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 43 ms (9.7% of span): Other 31, JavaScript 5, DOM 3, Profiler 3, Idle 1
  - JS leaf 0 / native under JS 5 / native 38; buckets: ipc 34, array_buffer_copy 14, gc_cc 11, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 0
  - top self: `__strlen_evex [libc.so.6]` 3; `[]` 2; `js::wasm::TypeContext::startRecGroup(unsigned int) [libxul.s` 2; `[libfontconfig.so.1]` 2; `ustr_hashUCharsN_78 [libxul.so]` 2; `[libexpat.so.1]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10372** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / idle

- **parent** CPU ms by thread group: main 136, DOM Worker 78, other 15, Compositor 2, Renderer 1, SwComposite 1, Socket 1, IPC I/O 1, WRSceneBuilder 0, WRRenderBackend 0, BgPool 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 136 ms (6.6% of span): Idle 114, JavaScript 12, Other 5, DOM 3, Profiler 2
  - JS leaf 1 / native under JS 14 / native 122; buckets: ipc 136, poll_wait 117, harness_diagnostics 13, gc_cc 5, array_buffer_copy 4, subprocess_pipe_io 3, engine_stream_read 2, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 3; `[axiosozo-dev]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedSh` 1; `js::frontend::EmitterScope::lookupInCache(js::frontend::Byte` 1; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*>` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `SkMatrixPriv::MapRect(SkM44 const&, SkRect const&)` 0); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 78 ms: buckets subprocess_pipe_io 78, js_ctypes 78, worker_messaging 78, ipc 78, poll_wait 78, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 78; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigne` 0
- **tab:9993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10012** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `IPC::ReadResult<std::remove_cv<unsigned long>::type, (std::i` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9971** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / raf

- **parent** CPU ms by thread group: main 399, Renderer 227, DOM Worker 227, SwComposite 172, WRRenderBackend 50, BgPool 38, Compositor 33, other 26, ImageBridge 14, WRSceneBuilder 7, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 399 ms (13.0% of span): Idle 273, JavaScript 68, Other 25, DOM 16, GC / CC 12, Profiler 5
  - JS leaf 8 / native under JS 69 / native 323; buckets: ipc 398, poll_wait 284, gc_cc 68, engine_stream_read 34, worker_messaging 32, harness_diagnostics 28, array_buffer_copy 18, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 280; `[unknown]` 12; `bool js::gc::MarkingTracerT<6u>::onEdge<JSString>(JSString**` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 273 ms, GCSlice 3× 15 ms, GCMinor 3× 3 ms
  - WebRender/compositor threads: Renderer 227 ms (top self: `__syscall_cancel_arch [libc.so.6]` 115, `int blendTextureNearestFast<false, glsl::sampler2D` 39, `void scale_blit<true>(Texture&, IntRect const&, Te` 15); SwComposite 172 ms (top self: `syscall [libc.so.6]` 100, `void scale_blit<true>(Texture&, IntRect const&, Te` 63, `__memmove_evex_unaligned_erms [libc.so.6]` 8); WRRenderBackend#0 50 ms (top self: `syscall [libc.so.6]` 44, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__syscall_cancel_arch [libc.so.6]` 32, `__memmove_evex_unaligned_erms [libc.so.6]` 3, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `__lll_lock_wait [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 227 ms: buckets subprocess_pipe_io 227, worker_messaging 227, ipc 227, js_ctypes 212, poll_wait 202, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 204; `[axiosozo-dev]` 3; `[linux-vdso.so.1]` 1; `__memset_evex_unaligned_erms [libc.so.6]` 1; `[unknown]` 1
- **tab:9971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::IdleSchedulerChild::RecvIdleTime(unsigned long` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10376** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(un` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 226, Renderer 210, SwComposite 173, main 160, WRRenderBackend 48, BgPool 44, Compositor 34, ImageBridge 14, WRSceneBuilder 6, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 160 ms (5.3% of span): Idle 104, JavaScript 30, Other 19, DOM 5, Profiler 3, GC / CC 0
  - JS leaf 3 / native under JS 31 / native 126; buckets: ipc 160, poll_wait 113, gc_cc 33, engine_stream_read 27, worker_messaging 19, subprocess_pipe_io 9, array_buffer_copy 8, js_ctypes 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 115; `[unknown]` 4; `bool mozilla::dom::binding_detail::GenericMethod<mozilla::do` 1; `js::WeakMap<JS::Value, JS::Value, js::BufferAllocPolicy>::wr` 1; `TimerThread::AddTimerInternal(nsTimerImpl&) [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 210 ms (top self: `__syscall_cancel_arch [libc.so.6]` 106, `int blendTextureNearestFast<false, glsl::sampler2D` 36, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 15); SwComposite 173 ms (top self: `syscall [libc.so.6]` 94, `void scale_blit<true>(Texture&, IntRect const&, Te` 71, `__memmove_evex_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 44 ms (top self: `__syscall_cancel_arch [libc.so.6]` 41, `__memmove_evex_unaligned_erms [libc.so.6]` 2, `axio::SinkState::CopyRect(unsigned char*, unsigned` 0); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `WritePadding(mozilla::BufferList<InfallibleAllocPo` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 226 ms: buckets subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 209, poll_wait 201, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 203; `__memset_evex_unaligned_erms [libc.so.6]` 2; `js::ctypes::ArrayType::CreateInternal(JSContext*, ` 1; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 1; `[unknown]` 1
- **tab:10372** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 0; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0
  - GC/CC markers: GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_mutex_lock [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10376** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / scroll

- **parent** CPU ms by thread group: main 510, DOM Worker 229, Renderer 139, SwComposite 106, BgPool 68, WRRenderBackend 32, Compositor 21, other 17, ImageBridge 9, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 510 ms (25.1% of span): Idle 261, JavaScript 88, GC / CC 67, Other 60, DOM 16, Profiler 6
  - JS leaf 9 / native under JS 91 / native 410; buckets: ipc 509, poll_wait 310, gc_cc 139, engine_stream_read 44, worker_messaging 42, harness_diagnostics 32, paint_layout 29, subprocess_pipe_io 23
  - top self: `__syscall_cancel_arch [libc.so.6]` 281; `[unknown]` 23; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 21; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 76 ms, GCSlice 15× 63 ms, CCSlice 4× 12 ms, GCMinor 2× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 139 ms (top self: `__syscall_cancel_arch [libc.so.6]` 91, `int blendTextureNearestFast<false, glsl::sampler2D` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); SwComposite 106 ms (top self: `syscall [libc.so.6]` 92, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 32 ms (top self: `syscall [libc.so.6]` 26, `sched_yield [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 66 ms (top self: `__syscall_cancel_arch [libc.so.6]` 53, `__memmove_evex_unaligned_erms [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 9, `__lll_lock_wait [libc.so.6]` 0, `mozilla::ipc::PortLink::SendMessage(std::unique_pt` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 223 ms: buckets subprocess_pipe_io 223, worker_messaging 222, ipc 222, js_ctypes 197, poll_wait 188, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 190; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 2; `__memset_evex_unaligned_erms [libc.so.6]` 2; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 2
- **tab:9971** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10376** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9993** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / key

- **parent** CPU ms by thread group: main 462, DOM Worker 186, Renderer 45, SwComposite 37, other 26, Compositor 15, WRRenderBackend 13, WRSceneBuilder 8, BgPool 3, ImageBridge 2, IPC I/O 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 462 ms (12.7% of span): Idle 211, JavaScript 90, Other 38, GC / CC 36, Layout 33, DOM 21
  - JS leaf 12 / native under JS 142 / native 308; buckets: ipc 457, poll_wait 248, gc_cc 129, worker_messaging 69, engine_stream_read 65, paint_layout 62, subprocess_pipe_io 32, harness_diagnostics 26
  - top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 21; `[axiosozo-dev]` 9; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(J` 4; `[linux-vdso.so.1]` 4
  - GC/CC markers: GCMajor 1× 1049 ms, GCSlice 8× 31 ms, CCSlice 2× 7 ms, GCMinor 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 45 ms (top self: `__syscall_cancel_arch [libc.so.6]` 21, `int blendTextureNearestFast<false, glsl::sampler2D` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 6); SwComposite 37 ms (top self: `syscall [libc.so.6]` 21, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_evex_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 13 ms (top self: `syscall [libc.so.6]` 12, `webrender::picture::PictureInstance::take_context ` 0, `webrender::resource_cache::ResourceCache::request_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 186 ms: buckets subprocess_pipe_io 186, worker_messaging 186, ipc 186, js_ctypes 172, poll_wait 169, array_buffer_copy 2; top self: `__syscall_cancel_arch [libc.so.6]` 169; `js::ctypes::CData::Create(JSContext*, JS::Handle<J` 3; `[unknown]` 2; `getcontext [libc.so.6]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1
- **tab:9920** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `JS::GetFunctionRealm(JSContext*, JS::Handle<JSObject*>) [lib` 0; `XPCWrappedNativeScope::GetExpandoChain(JS::Handle<JSObject*>` 0; `js::AbstractGeneratorObject::createFromFrame(JSContext*, js:` 0; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9993** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10012** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-control / switch-to-gecko

- **parent** CPU ms by thread group: main 67, Renderer 21, DOM Worker 11, BgPool 5, WRRenderBackend 3, Compositor 2, SwComposite 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 67 ms (24.3% of span): JavaScript 31, Layout 12, Other 10, Graphics 4, DOM 4, Idle 4
  - JS leaf 4 / native under JS 39 / native 24; buckets: ipc 67, gc_cc 20, paint_layout 17, array_buffer_copy 17, harness_diagnostics 8, engine_stream_read 5, poll_wait 5, worker_messaging 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `mprotect [libc.so.6]` 4; `JSString* js::ConcatStrings<(js::AllowGC)0>(JSContext*, js::` 3; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<n` 3; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::d` 3; `[unknown]` 2
  - WebRender/compositor threads: Renderer 21 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `__syscall_cancel_arch [libc.so.6]` 3, `cs_blur_COLOR_TARGET_frag::run(glsl::FragmentShade` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 1, `rmdir [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 10, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 10; `[unknown]` 0; `js::ctypes::StructType::FieldSetter(JSContext*, un` 0; `getcontext [libc.so.6]` 0; `JS::GetArrayBufferData(JSObject*, bool*, JS::AutoR` 0
- **tab:10372** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.4% of span): JavaScript 10, Idle 6, Other 5, Layout 4, DOM 1, Profiler 0
  - JS leaf 0 / native under JS 9 / native 17; buckets: ipc 23, paint_layout 11, gc_cc 9, poll_wait 6, subprocess_pipe_io 5, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `JS::GetObjectZone(JSObject*) [libxul.so]` 1; `mmap64 [libc.so.6]` 1; `style::stylist::CascadeData::add_styles [libxul.so]` 1; `js::UnwrapOneCheckedStatic(JSObject*) [libxul.so]` 1; `mozilla::xpcom::CreateInstanceImpl(mozilla::xpcom::ModuleID,` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9920** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.4% of span): Idle 3, DOM 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 4, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `mozilla::dom::ToJSValue(JSContext*, mozilla::dom::WindowProx` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10465** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

