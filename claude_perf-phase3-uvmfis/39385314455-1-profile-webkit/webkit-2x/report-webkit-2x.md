# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **59.7** (Renderer 25.5, main 21.3, WRRende~ckend# 4.3, SwComposite 4.3, DOM Worker 4.3) | WPEWebProcess 68.0, AxioWebKitHost 8.5, WPENetworkProce 8.5 | — | 207.1 |
| plain | idle | — | — | **5.4** (main 4.4, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 4.4, forkserver 0.5, AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 23.9 | **40.9** (main 11.8, Backgro~Pool # 9.5, Renderer 6.9, SwComposite 3.9, DOM Worker 3.9) | WPEWebProcess 190.1, AxioWebKitHost 26.9, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **47.5** (main 9.3, Backgro~Pool # 8.3, Renderer 6.3, Socket Thread 4.7, SwComposite 4.3) | WPEWebProcess 186.7, AxioWebKitHost 22.9 | — | — |
| plain | scroll | 55.5 | 35.5 | **55.1** (main 20.1, Backgro~Pool # 11.3, DOM Worker 7.9, Renderer 6.4, SwComposite 2.9) | WPEWebProcess 193.5, AxioWebKitHost 24.6 | — | — |
| plain | key | — | — | **30.2** (main 12.0, DOM Worker 4.9, Renderer 3.0, Indexed~ IO # 2.7, SwComposite 1.9) | WPEWebProcess 18.9, AxioWebKitHost 3.3 | 27.7 | — |
| plain | switch-to-gecko | — | — | **131.1** (DOM Worker 38.1, Indexed~ IO # 33.8, main 25.4, Renderer 16.9, IPDL Background 8.5) | Isolated Web Co 4.2 | — | 213.1 |
| profile | switch-to-engine | — | — | **46.2** (main 13.2, DOM Worker 13.2, SamplerThread 9.9, Softwar~cThread 3.3, Compositor 3.3) | WPEWebProcess 66.1, Web Content 29.7, WPENetworkProce 9.9, AxioWebKitHost 6.6 | — | 278.2 |
| profile | idle | — | — | **35.2** (main 13.2, DOM Worker 8.8, SamplerThread 7.3, TaskCon~ller # 4.4, Timer 1.5) | Web Content 5.4, Isolated Web Co 1.5, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 58.0 | 25.5 | **59.3** (main 14.3, DOM Worker 9.8, Backgro~Pool # 8.8, SamplerThread 8.1, Renderer 6.5) | WPEWebProcess 182.7, AxioWebKitHost 20.8, Web Content 6.5, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **49.9** (DOM Worker 10.0, Backgro~Pool # 8.6, SamplerThread 7.6, main 7.3, Renderer 7.0) | WPEWebProcess 181.9, AxioWebKitHost 21.7, Web Content 6.0, WebExtensions 1.3 | — | — |
| profile | scroll | 55.6 | 35.8 | **74.1** (main 25.0, DOM Worker 14.7, Backgro~Pool # 11.3, SamplerThread 7.3, Renderer 6.4) | WPEWebProcess 192.5, AxioWebKitHost 23.1, Web Content 6.4, Isolated Web Co 1.5 | — | — |
| profile | key | — | — | **40.2** (main 13.4, DOM Worker 7.9, SamplerThread 7.9, Renderer 3.6, SwComposite 2.2) | WPEWebProcess 18.6, Web Content 6.8, AxioWebKitHost 3.1, WebExtensions 1.7 | 30.5 | — |
| profile | switch-to-gecko | — | — | **45.9** (main 12.5, Renderer 8.3, SamplerThread 8.3, Compositor 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 8.3 | — | 217.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 6.2 | 0.0 | 0 | 0.0 | — | — | 73.8 | 0.0 | — | 3.04 | 0.68 | — | — | — | — | — | 0.004 |
| profile | raf | 58.0 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.46 | 0.15 | — | — | — | — | — | 0.012 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.45 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 53.5 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 1.37 | 0.15 | — | — | — | — | — | 0.014 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.17 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.225 | 3.033 | 0.0177 | 0.0242 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.363 | 1.238 | 0.0210 | 0.0716 |
| plain | raf-nosampler | memfd | native | 173 | 173 | 0.377 | 1.262 | 0.0214 | 0.0719 |
| plain | scroll | memfd | native | 110 | 110 | 1.078 | 1.266 | 0.0579 | 0.0680 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 1.191 | 0.0000 | 0.0065 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.264 | 3.075 | 0.0141 | 0.0192 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.327 | 1.294 | 0.0190 | 0.0751 |
| profile | raf-nosampler | memfd | native | 175 | 175 | 0.330 | 1.237 | 0.0190 | 0.0715 |
| profile | scroll | memfd | native | 110 | 110 | 1.172 | 1.793 | 0.0628 | 0.0960 |
| profile | key | memfd | native | 20 | 20 | 0.004 | 1.389 | 0.0000 | 0.0076 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 26.7 | 0.0 | — | 0.17 | 0.52 | — | — | 157.9 | 27.7 | 188.9 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 30.6; first stdout read resolved 38.7; first frame applied (native receiver) 289.0; write frame_ack 290.2; write visibility 298.8; write focus 299.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 20.4; first stdout read resolved 29.3

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 41, DOM Worker 24, BgPool 10, Compositor 4, Renderer 4, SwComposite 2, IPC I/O 2, WRSceneBuilder 2, WRRenderBackend 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 41 ms (13.0% of span): JavaScript 19, Idle 6, DOM 6, Layout 5, Graphics 3, Other 1
  - JS leaf 3 / native under JS 26 / native 12; buckets: ipc 41, gc_cc 21, paint_layout 12, harness_diagnostics 10, array_buffer_copy 10, poll_wait 8, engine_stream_read 6, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `AnchorResolvedInsetHelper::FromUnresolved(mozilla::StyleGene` 3; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 2; `js::GetOwnPropertyDescriptor(JSContext*, JS::Handle<JSObject` 2; `mozilla::dom::ChromeUtils::AddProfilerMarker(mozilla::dom::G` 2; `#read (chrome://browser/content/axiosozo/EngineStreamClient.` 2
  - WebRender/compositor threads: Renderer 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3); WRSceneBuilder#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `webrender::scene_building::SceneBuilder::build_ite` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 10 ms (top self: `ARGBSetRow_X86 [libxul.so]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 3, `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) ` 0)
  - busiest DOM Worker 24 ms: buckets subprocess_pipe_io 24, worker_messaging 24, ipc 24, js_ctypes 23, poll_wait 22; top self: `__syscall_cancel_arch [libc.so.6]` 22; `[unknown]` 1; `js::ctypes::ConvertArgument(JSContext*, JS::Handle` 0; `js::ctypes::StructType::LookupField(JSContext*, JS` 0; `mozilla::detail::MutexImpl::unlock() [axiosozo-dev` 0
- **tab:9229** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 48 ms (15.0% of span): Other 38, JavaScript 4, DOM 3, Idle 1, GC / CC 1, Profiler 0
  - JS leaf 0 / native under JS 5 / native 43; buckets: ipc 37, array_buffer_copy 15, gc_cc 13, subprocess_pipe_io 4, poll_wait 2, image_container 1, memcpy_memset 1
  - top self: `[libexpat.so.1]` 3; `__strlen_evex [libc.so.6]` 2; `[]` 2; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2; `__syscall_cancel_arch [libc.so.6]` 2; `[libssl3.so]` 2
  - GC/CC markers: GCMinor 1× 5 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9235** CPU ms by thread group: main 47, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 47 ms (14.8% of span): Other 39, JavaScript 4, DOM 2, Profiler 2, Idle 0
  - JS leaf 1 / native under JS 3 / native 43; buckets: ipc 35, array_buffer_copy 15, gc_cc 10, subprocess_pipe_io 4, memcpy_memset 3, poll_wait 1, canvas_2d 1
  - top self: `__strcmp_evex [libc.so.6]` 3; `__memmove_evex_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `uhash_compareUChars_78 [libxul.so]` 2; `[]` 2; `mozilla::PreferencesImpl::Lookup(char const*, bool) [libxul.` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9079** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 1, Graphics 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsBlockFrame::GetChildList(mozilla::FrameChildListID) const ` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 252, DOM Worker 124, other 16, Compositor 2, Renderer 1, BgPool 1, SwComposite 1, Socket 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, ImageIO 0, WRWorker 0, Canvas 0, ImageBridge 0
  - main thread 252 ms (12.3% of span): Idle 127, GC / CC 81, JavaScript 21, Other 14, DOM 6, Profiler 3
  - JS leaf 3 / native under JS 23 / native 226; buckets: ipc 250, poll_wait 133, gc_cc 89, harness_diagnostics 24, array_buffer_copy 5, engine_stream_read 5, memcpy_memset 4, subprocess_pipe_io 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 131; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[unknown]` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 4; `[axiosozo-dev]` 3
  - GC/CC markers: GCSlice 15× 62 ms, GCMajor 1× 60 ms, CCSlice 6× 21 ms, GCMinor 2× 6 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 1 ms (top self: `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `sched_yield [libc.so.6]` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 1 ms (top self: `munmap [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 83 ms: buckets subprocess_pipe_io 83, js_ctypes 83, worker_messaging 83, ipc 83, poll_wait 83; top self: `__syscall_cancel_arch [libc.so.6]` 83
- **tab:8826** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8765** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9079** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTA` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 407, BgPool 259, DOM Worker 238, Renderer 181, SwComposite 116, WRRenderBackend 48, Compositor 34, other 27, ImageBridge 14, WRSceneBuilder 7, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 407 ms (13.1% of span): Idle 281, JavaScript 68, Other 32, DOM 16, Profiler 8, GC / CC 2
  - JS leaf 11 / native under JS 74 / native 322; buckets: ipc 407, poll_wait 293, gc_cc 60, engine_stream_read 42, harness_diagnostics 31, worker_messaging 29, array_buffer_copy 14, native_receiver 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 290; `[unknown]` 18; `__lll_lock_wait [libc.so.6]` 5; `__lll_lock_wake [libc.so.6]` 4; `[axiosozo-dev]` 3; `js::jit::CacheIRCompiler::addFailurePath(js::jit::FailurePat` 3
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 181 ms (top self: `__syscall_cancel_arch [libc.so.6]` 114, `__memmove_evex_unaligned_erms [libc.so.6]` 31, `syscall [libc.so.6]` 26); SwComposite 116 ms (top self: `syscall [libc.so.6]` 104, `__memmove_evex_unaligned_erms [libc.so.6]` 11, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 12, `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 152 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 78, `__syscall_cancel_arch [libc.so.6]` 70, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 1); BackgroundThreadPool #2 107 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 66, `__syscall_cancel_arch [libc.so.6]` 38, `[linux-vdso.so.1]` 2); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `[linux-vdso.so.1]` 0, `mozilla::ipc::NodeController::GetMessage(mojo::cor` 0)
  - busiest DOM Worker 238 ms: buckets subprocess_pipe_io 238, worker_messaging 238, ipc 238, js_ctypes 210, poll_wait 203, gc_cc 12; top self: `__syscall_cancel_arch [libc.so.6]` 205; `[axiosozo-dev]` 3; `__lll_lock_wait [libc.so.6]` 3; `[unknown]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
- **tab:8848** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `std::_Rb_tree<RefPtr<mozilla::Task>, RefPtr<mozilla::Task>, ` 0; `mozilla::ipc::NodeController::ForwardEvent(mojo::core::ports` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9085** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8875** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mojo::core::ports::PortRef::PortRef(mojo::core::ports::PortR` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: BgPool 258, DOM Worker 233, main 198, Renderer 185, SwComposite 114, WRRenderBackend 48, Compositor 36, ImageBridge 14, WRSceneBuilder 7, Socket 2, other 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 198 ms (6.6% of span): Idle 121, JavaScript 42, Other 17, DOM 15, GC / CC 3
  - JS leaf 6 / native under JS 49 / native 144; buckets: ipc 198, poll_wait 131, gc_cc 55, engine_stream_read 43, worker_messaging 24, array_buffer_copy 13, subprocess_pipe_io 12, native_receiver 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 130; `[unknown]` 9; `mozilla::net::nsStandardURL::BuildNormalizedSpec(char const*` 3; `[axiosozo-dev]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `[libX11.so.6]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 185 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_evex_unaligned_erms [libc.so.6]` 52, `syscall [libc.so.6]` 15); SwComposite 114 ms (top self: `syscall [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 16, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 32, `sched_yield [libc.so.6]` 12, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 258 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 142, `__syscall_cancel_arch [libc.so.6]` 107, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 233 ms: buckets subprocess_pipe_io 233, worker_messaging 233, ipc 233, js_ctypes 218, poll_wait 208, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 210; `[axiosozo-dev]` 3; `__pthread_mutex_unlock_usercnt [libc.so.6]` 3; `__memset_evex_unaligned_erms [libc.so.6]` 1; `[unknown]` 1
- **tab:8875** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9085** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8848** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 472, DOM Worker 256, BgPool 204, Renderer 112, SwComposite 59, WRRenderBackend 30, Compositor 21, other 18, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 472 ms (23.0% of span): Idle 262, JavaScript 98, Other 46, DOM 34, Profiler 12, Graphics 11
  - JS leaf 9 / native under JS 120 / native 344; buckets: ipc 469, poll_wait 323, gc_cc 89, engine_stream_read 73, worker_messaging 46, paint_layout 43, harness_diagnostics 43, array_buffer_copy 29
  - top self: `__syscall_cancel_arch [libc.so.6]` 289; `[unknown]` 17; `__lll_lock_wake [libc.so.6]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 112 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `syscall [libc.so.6]` 19, `__memmove_evex_unaligned_erms [libc.so.6]` 17); SwComposite 59 ms (top self: `syscall [libc.so.6]` 53, `__memmove_evex_unaligned_erms [libc.so.6]` 6); WRRenderBackend#0 30 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 203 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_evex_unaligned_erms [libc.so.6]` 80, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4); ImageBridgeChld 8 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 256 ms: buckets subprocess_pipe_io 256, worker_messaging 256, ipc 256, js_ctypes 207, poll_wait 190, gc_cc 17; top self: `__syscall_cancel_arch [libc.so.6]` 203; `__lll_lock_wake [libc.so.6]` 9; `__memset_evex_unaligned_erms [libc.so.6]` 6; `mozilla::detail::EventQueueInternal<16ul>::PutEven` 4; `js::ArrayBufferObject::class_constructor(JSContext` 3
- **tab:8826** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9085** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8848** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ipc::MessageChannel::MessageTask::Run() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 458, DOM Worker 187, Renderer 122, SwComposite 79, other 28, BgPool 28, WRRenderBackend 20, Compositor 16, WRWorker 10, WRSceneBuilder 9, ImageBridge 2, IPC I/O 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 458 ms (12.5% of span): Idle 227, JavaScript 82, Other 44, Layout 30, Graphics 28, DOM 27
  - JS leaf 9 / native under JS 131 / native 318; buckets: ipc 453, poll_wait 271, gc_cc 88, paint_layout 70, engine_stream_read 65, worker_messaging 59, harness_diagnostics 23, array_buffer_copy 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 237; `[unknown]` 13; `[axiosozo-dev]` 9; `nsTArrayInfallibleAllocator::ResultTypeProxy nsTArray_base<n` 5; `xpc::WindowGlobalOrNull(JSObject*) [libxul.so]` 5; `[linux-vdso.so.1]` 4
  - GC/CC markers: CCSlice 2× 5 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 121 ms (top self: `__syscall_cancel_arch [libc.so.6]` 44, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 23, `syscall [libc.so.6]` 7); SwComposite 79 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 44, `syscall [libc.so.6]` 35, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 20 ms (top self: `syscall [libc.so.6]` 14, `sched_yield [libc.so.6]` 2, `core::hash::BuildHasher::hash_one [libxul.so]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 27 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 13, `__syscall_cancel_arch [libc.so.6]` 13, `mozilla::layers::ImageBridgeChild::GetSingleton() ` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `[axiosozo-dev]` 0, `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) ` 0); BgIOThreadPool #3 1 ms (top self: `rename [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 187 ms: buckets subprocess_pipe_io 187, worker_messaging 187, ipc 187, js_ctypes 175, poll_wait 171, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 173; `__lll_lock_wait [libc.so.6]` 2; `[axiosozo-dev]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `[unknown]` 1
- **tab:8765** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*,` 0; `mozilla::dom::XPCOMObjectToJsval(JSContext*, JS::Handle<JSOb` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandl` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8826** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8875** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 68, Renderer 36, DOM Worker 12, BgPool 9, SwComposite 4, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 68 ms (24.1% of span): JavaScript 32, Layout 10, Other 8, DOM 7, Graphics 6, Idle 4
  - JS leaf 3 / native under JS 39 / native 26; buckets: ipc 68, gc_cc 19, array_buffer_copy 18, paint_layout 15, harness_diagnostics 8, engine_stream_read 7, worker_messaging 6, poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `PLDHashTable::Iterator::Iterator(PLDHashTable*) [libxul.so]` 4; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 4; `goSetCommandEnabled (chrome://global/content/globalOverlay.j` 3; `js::jit::CallIRGenerator::tryAttachFunCallBound(JS::Handle<J` 3
  - WebRender/compositor threads: Renderer 36 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `__syscall_cancel_arch [libc.so.6]` 5); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `__memmove_evex_unaligned_erms [libc.so.6]` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 9 ms (top self: `unlink [libc.so.6]` 7, `fstatat64 [libc.so.6]` 1, `getdents64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 11, poll_wait 11, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::jit::CacheIRStubKey::hash(js::jit::CacheIRStub` 0
- **tab:9079** CPU ms by thread group: main 25, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 25 ms (9.0% of span): Other 9, JavaScript 6, Idle 3, Graphics 2, DOM 1, Layout 1
  - JS leaf 0 / native under JS 7 / native 18; buckets: ipc 23, paint_layout 13, gc_cc 11, subprocess_pipe_io 6, poll_wait 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1; `__lll_lock_wait [libc.so.6]` 1; `__strlen_evex [libc.so.6]` 1; `nsTSubstring<char16_t>::StartBulkWriteImpl(unsigned long, un` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8765** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 2, JavaScript 1, Other 1
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 4, poll_wait 2, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::CallObject::createForFrame(JSContext*, js::AbstractFrame` 1; `xpc::AutoScriptActivity::~AutoScriptActivity() [libxul.so]` 0; `mozilla::CCGCScheduler::MaybePokeCC(mozilla::TimeStamp, unsi` 0; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8826** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

