# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **32.0** (main 12.8, Renderer 12.8, DOM Worker 4.3, WRRende~ckend# 2.1) | WPEWebProcess 83.5, AxioWebKitHost 27.8, WPENetworkProce 12.8, Isolated Web Co 2.1 | — | 443.9 |
| plain | idle | — | — | **5.4** (main 3.4, DOM Worker 1.0, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 1.9 | — | — |
| plain | raf | 57.8 | 22.1 | **22.0** (main 7.8, Renderer 3.6, DOM Worker 2.6, SwComposite 2.3, Backgro~Pool # 2.0) | WPEWebProcess 140.8, AxioWebKitHost 13.7 | — | — |
| plain | raf-nosampler | — | — | **20.1** (main 5.3, Renderer 3.3, DOM Worker 2.7, SwComposite 2.0, WRRende~ckend# 1.7) | WPEWebProcess 141.4, AxioWebKitHost 13.7, Web Content 0.3 | — | — |
| plain | scroll | 54.9 | 32.8 | **39.3** (main 17.6, DOM Worker 5.4, Backgro~Pool # 4.4, Renderer 3.9, TaskCon~ller # 2.0) | WPEWebProcess 145.4, AxioWebKitHost 12.7 | — | — |
| plain | key | — | — | **12.1** (main 6.1, Renderer 1.4, DOM Worker 1.4, SwComposite 0.8, glean.dispatche 0.6) | WPEWebProcess 13.6, AxioWebKitHost 1.7, WebExtensions 0.3 | 22.1 | — |
| plain | switch-to-gecko | — | — | **30.9** (main 13.3, TaskCon~ller # 4.4, BgIOThr~Pool # 4.4, Renderer 4.4, sqldb:p~lite # 4.4) | Isolated Web Co 4.4 | — | 210.6 |
| trace | switch-to-engine | — | — | **87.1** (Renderer 43.6, main 18.7, glean.dispatche 6.2, WRScene~ilder# 6.2, SwComposite 6.2) | WPEWebProcess 68.6, AxioWebKitHost 6.2, WPENetworkProce 6.2, Isolated Web Co 6.2 | — | 147.7 |
| trace | idle | — | — | **3.4** (main 2.4, Timer 0.5, TaskCon~ller # 0.5) | Web Content 1.0 | — | — |
| trace | raf | 57.2 | 22.5 | **24.8** (main 8.2, DOM Worker 4.6, Renderer 3.6, SwComposite 2.3, WRRende~ckend# 1.6) | WPEWebProcess 141.5, AxioWebKitHost 12.7, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **20.5** (main 6.0, Renderer 3.3, DOM Worker 2.3, SwComposite 2.0, Backgro~Pool # 1.7) | WPEWebProcess 141.3, AxioWebKitHost 13.3 | — | — |
| trace | scroll | 55.0 | 38.5 | **39.7** (main 17.8, DOM Worker 6.3, Renderer 3.9, Backgro~Pool # 3.9, SwComposite 1.9) | WPEWebProcess 145.8, AxioWebKitHost 13.1 | — | — |
| trace | key | — | — | **10.0** (main 5.8, Renderer 1.7, DOM Worker 1.1, SwComposite 0.8, Timer 0.3) | WPEWebProcess 14.1, AxioWebKitHost 0.8, WebExtensions 0.3 | 20.9 | — |
| trace | switch-to-gecko | — | — | **44.0** (main 17.6, TaskCon~ller # 8.8, BgIOThr~Pool # 4.4, Renderer 4.4, Compositor 4.4) | Isolated Web Co 4.4 | — | 210.9 |
| profile | switch-to-engine | — | — | **42.0** (main 11.5, Renderer 11.5, IPC I/O Parent 3.8, Softwar~cThread 3.8, ImageBridgeChld 3.8) | Web Content 165.5, WPEWebProcess 57.7, WPENetworkProce 7.7, AxioWebKitHost 3.8 | — | 216.7 |
| profile | idle | — | — | **16.6** (main 5.4, SamplerThread 4.9, DOM Worker 3.4, TaskCon~ller # 1.9, Timer 1.0) | Web Content 4.9, WebExtensions 1.5, Privileged Cont 1.0, Isolated Web Co 1.0 | — | — |
| profile | raf | 58.1 | 21.5 | **36.6** (main 10.7, SamplerThread 6.2, DOM Worker 5.9, Renderer 4.2, SwComposite 2.3) | WPEWebProcess 144.2, AxioWebKitHost 14.1, Web Content 4.9, Privileged Cont 1.0 | — | — |
| profile | raf-nosampler | — | — | **32.7** (DOM Worker 6.3, main 5.7, SamplerThread 5.7, Renderer 4.3, Backgro~Pool # 2.3) | WPEWebProcess 144.0, AxioWebKitHost 13.6, Web Content 4.3, Isolated Web Co 1.0 | — | — |
| profile | scroll | 53.4 | 33.2 | **56.8** (main 21.5, DOM Worker 12.7, SamplerThread 6.3, Backgro~Pool # 3.9, Renderer 3.4) | WPEWebProcess 144.6, AxioWebKitHost 12.7, Web Content 4.9, Socket Process 1.0 | — | — |
| profile | key | — | — | **26.2** (main 9.6, SamplerThread 5.5, DOM Worker 4.7, Renderer 1.9, TaskCon~ller # 1.4) | WPEWebProcess 14.7, Web Content 5.8, WebExtensions 1.4, Privileged Cont 1.4 | 21.7 | — |
| profile | switch-to-gecko | — | — | **26.3** (main 8.7, BgIOThr~Pool # 4.4, Renderer 4.4, WRScene~ilder# 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 214.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 11.7 | 0.0 | 0 | 0.0 | — | — | 48.8 | 0.0 | — | 3.57 | 0.49 | — | — | — | — | — | 0.006 |
| trace | raf | 57.2 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.17 | 0.09 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.20 | 0.10 | — | — | — | — | — | 0.007 |
| trace | scroll | 53.8 | 0.0 | 0 | 0.0 | — | — | 4.1 | 0.0 | — | 0.40 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 12.4 | 0.0 | — | 0.06 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 7.4 | 0.0 | 0 | 0.0 | — | — | 69.2 | 0.0 | — | 2.81 | 1.44 | — | — | — | — | — | 0.011 |
| profile | raf | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.22 | 0.12 | — | — | — | — | — | 0.007 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.21 | 0.13 | — | — | — | — | — | 0.009 |
| profile | scroll | 53.0 | 0.0 | 0 | 0.0 | — | — | 9.8 | 0.0 | — | 0.44 | 0.14 | — | — | — | — | — | 0.008 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 11.1 | 0.0 | — | 0.07 | 0.11 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.038 | 1.415 | 0.0044 | 0.0059 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.108 | 0.152 | 0.0063 | 0.0088 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.118 | 0.164 | 0.0068 | 0.0095 |
| plain | scroll | memfd | native | 111 | 111 | 0.325 | 0.417 | 0.0175 | 0.0225 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.111 | 0.0000 | 0.0006 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.950 | 1.363 | 0.0111 | 0.0160 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 177 | 177 | 0.105 | 0.150 | 0.0061 | 0.0086 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.116 | 0.163 | 0.0067 | 0.0094 |
| trace | scroll | memfd | native | 112 | 112 | 0.356 | 0.408 | 0.0191 | 0.0220 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.115 | 0.0000 | 0.0006 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.414 | 2.413 | 0.0178 | 0.0178 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.123 | 0.166 | 0.0072 | 0.0097 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.130 | 0.187 | 0.0076 | 0.0109 |
| profile | scroll | memfd | native | 109 | 109 | 0.347 | 0.425 | 0.0184 | 0.0225 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.113 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 18.5 | 0.0 | — | 0.06 | 0.24 | — | — | 12.6 | 19.2 | 32.0 |
| profile | 0.4 | 17.6 | 0.1 | — | 0.07 | 0.30 | — | — | 13.4 | 19.0 | 32.9 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 14.2; first stdout read resolved 14.8; first frame applied (native receiver) 154.4; write frame_ack 155.2; write visibility 157.8; write focus 157.9

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 12.1; first stdout read resolved 17.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 13.7; first stdout read resolved 15.9; first frame applied (native receiver) 212.3; write frame_ack 215.0; write visibility 225.8; write focus 226.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 14.0; first stdout read resolved 19.0

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 29, Renderer 25, DOM Worker 12, BgPool 5, Compositor 2, WRRenderBackend 2, SwComposite 2, IPC I/O 2, WRSceneBuilder 1, WRWorker 1, Socket 0, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 29 ms (10.9% of span): Layout 10, JavaScript 7, Idle 6, DOM 5, Other 1, Profiler 1
  - JS leaf 0 / native under JS 19 / native 10; buckets: ipc 29, paint_layout 12, gc_cc 10, poll_wait 6, engine_stream_read 6, harness_diagnostics 5, worker_messaging 5, native_receiver 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `nsIFrame* nsCSSFrameConstructor::FindSibling<(nsCSSFrameCons` 5; `__lll_lock_wake [libc.so.6]` 3; `mozilla::dom::ResizeObserver::GatherActiveObservations(unsig` 2; `[unknown]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 25 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 14, `syscall [libc.so.6]` 7, `__syscall_cancel_arch [libc.so.6]` 2); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `__memset_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 12 ms: buckets subprocess_pipe_io 12, worker_messaging 12, ipc 12, js_ctypes 9, poll_wait 9, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 9; `__lll_lock_wake [libc.so.6]` 1; `mozilla::dom::Event::Release() [libxul.so]` 1
- **tab:9507** CPU ms by thread group: main 29, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (33.5% of span): Other 23, Profiler 2, JavaScript 2, DOM 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 3 / native 26; buckets: ipc 22, array_buffer_copy 9, gc_cc 7, subprocess_pipe_io 2, image_container 1, poll_wait 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `JSLinearString* JSRope::flattenInternal<(JSRope::UsingBarrie` 2; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 2; `icu_78::UnicodeString::UnicodeString(icu_78::UnicodeString c` 2; `js::frontend::ParserAtomsTable::markUsedByStencil(js::fronte` 1; `l10nregistry_register_parent_process_sources [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9504** CPU ms by thread group: main 20, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0
  - main thread 20 ms (64.6% of span): Other 18, Profiler 2
  - JS leaf 0 / native under JS 0 / native 20; buckets: ipc 12, array_buffer_copy 9, gc_cc 2
  - top self: `[]` 4; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `prctl [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2; `FcConfigGetCurrent [libfontconfig.so.1]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9361** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.5% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::layers::ImageBridgeParent::GetContentId() [libxul.s` 1; `non-virtual thunk to mozilla::PresShell::QueryInterface(nsID` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 100, DOM Worker 31, other 10, Socket 0, IPC I/O 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageBridge 0, SwComposite 0
  - main thread 100 ms (4.9% of span): Idle 61, GC / CC 27, JavaScript 7, Other 3, Profiler 1, DOM 1
  - JS leaf 0 / native under JS 7 / native 93; buckets: ipc 100, poll_wait 64, gc_cc 30, harness_diagnostics 7, array_buffer_copy 4, memcpy_memset 3, engine_stream_read 1, worker_messaging 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 63; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 793 ms, GCSlice 7× 23 ms, CCSlice 2× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets subprocess_pipe_io 31, js_ctypes 31, worker_messaging 31, ipc 31, poll_wait 31; top self: `__syscall_cancel_arch [libc.so.6]` 31
- **tab:9507** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `fog_serialize_ipc_buf [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9504** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9361** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 317, DOM Worker 147, Renderer 118, SwComposite 58, BgPool 57, WRRenderBackend 45, Compositor 32, other 19, ImageBridge 13, WRSceneBuilder 7, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 317 ms (10.2% of span): Idle 213, JavaScript 55, Other 29, DOM 15, Profiler 4, GC / CC 1
  - JS leaf 10 / native under JS 58 / native 249; buckets: ipc 315, poll_wait 232, gc_cc 48, engine_stream_read 33, worker_messaging 29, harness_diagnostics 27, array_buffer_copy 9, subprocess_pipe_io 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 227; `[unknown]` 10; `[axiosozo-dev]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `xpc::InitializeValue(nsXPTType const&, void*) [libxul.so]` 2
  - GC/CC markers: GCMajor 1× 74 ms, GCSlice 2× 8 ms, GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `__syscall_cancel_arch [libc.so.6]` 79, `__memmove_avx512_unaligned_erms [libc.so.6]` 19, `syscall [libc.so.6]` 12); SwComposite 58 ms (top self: `syscall [libc.so.6]` 56, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 8, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 50, `__memmove_avx512_unaligned_erms [libc.so.6]` 4, `void mozilla::WriteULEB128<unsigned int, mozilla::` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `mozilla::layers::ImageBridgeChild::RecvParentAsync` 0); BgIOThreadPool #2 1 ms (top self: `non-virtual thunk to mozilla::PrioritizableCancela` 0, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 140 ms: buckets subprocess_pipe_io 140, worker_messaging 140, ipc 140, js_ctypes 127, poll_wait 125, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 126; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `[unknown]` 1
- **tab:9361** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 1; `nsQueryReferent::operator()(nsID const&, void**) const [libx` 0
  - GC/CC markers: GCMajor 1× 33 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9016** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: main 166, DOM Worker 139, Renderer 112, SwComposite 62, BgPool 60, WRRenderBackend 44, Compositor 31, ImageBridge 13, WRSceneBuilder 7, other 1, IPC I/O 0, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 166 ms (5.5% of span): Idle 99, JavaScript 46, DOM 10, Other 8, Profiler 1
  - JS leaf 7 / native under JS 49 / native 110; buckets: ipc 164, poll_wait 103, gc_cc 56, engine_stream_read 46, worker_messaging 31, subprocess_pipe_io 9, native_receiver 8, array_buffer_copy 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 102; `[unknown]` 19; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `nsTSubstring<char>::Assign(char const*, unsigned long, std::` 1
  - WebRender/compositor threads: Renderer 112 ms (top self: `__syscall_cancel_arch [libc.so.6]` 80, `__memmove_avx512_unaligned_erms [libc.so.6]` 15, `syscall [libc.so.6]` 10); SwComposite 62 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 44 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 60 ms (top self: `__syscall_cancel_arch [libc.so.6]` 52, `__memmove_avx512_unaligned_erms [libc.so.6]` 7, `mozilla::TaskQueue::MaybeResolveShutdown() [libxul` 0); ImageBridgeChld 13 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `__lll_lock_wait [libc.so.6]` 0, `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 139 ms: buckets subprocess_pipe_io 139, worker_messaging 139, ipc 139, js_ctypes 130, poll_wait 127, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 128; `[unknown]` 2; `[axiosozo-dev]` 1; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*` 1; `js::ctypes::CData::Create(JSContext*, JS::Handle<J` 0
- **tab:8989** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBuf` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 413, DOM Worker 227, BgPool 80, Renderer 60, SwComposite 33, WRRenderBackend 27, Compositor 18, other 12, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 413 ms (20.1% of span): Idle 232, JavaScript 70, Other 42, GC / CC 27, DOM 23, Graphics 9
  - JS leaf 12 / native under JS 79 / native 322; buckets: ipc 412, poll_wait 275, gc_cc 96, engine_stream_read 51, worker_messaging 39, harness_diagnostics 29, paint_layout 28, array_buffer_copy 25
  - top self: `__syscall_cancel_arch [libc.so.6]` 249; `[unknown]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `mprotect [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3
  - GC/CC markers: GCSlice 5× 22 ms, CCSlice 3× 7 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 60 ms (top self: `__syscall_cancel_arch [libc.so.6]` 36, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `syscall [libc.so.6]` 6); SwComposite 33 ms (top self: `syscall [libc.so.6]` 31, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 21, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 80 ms (top self: `__syscall_cancel_arch [libc.so.6]` 53, `__memmove_avx512_unaligned_erms [libc.so.6]` 24, `nsThreadPool::Run() [libxul.so]` 1); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `mozilla::layers::TextureClient::IsSharedWithCompos` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 227 ms: buckets subprocess_pipe_io 227, worker_messaging 227, ipc 227, js_ctypes 148, poll_wait 138, gc_cc 60; top self: `__syscall_cancel_arch [libc.so.6]` 141; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 9; `madvise [libc.so.6]` 8; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `__lll_lock_wake [libc.so.6]` 6
- **tab:8967** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8989** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9367** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 330, DOM Worker 92, Renderer 58, SwComposite 29, other 19, WRRenderBackend 12, Compositor 11, WRWorker 8, WRSceneBuilder 7, BgPool 3, ImageBridge 1, IPC I/O 1, Socket 0, ImageIO 0, Canvas 0
  - main thread 330 ms (9.0% of span): Idle 162, JavaScript 43, GC / CC 31, Graphics 28, Layout 24, Other 17
  - JS leaf 5 / native under JS 75 / native 249; buckets: ipc 328, poll_wait 178, gc_cc 79, paint_layout 56, worker_messaging 44, engine_stream_read 34, harness_diagnostics 14, array_buffer_copy 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 167; `[axiosozo-dev]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `syscall [libc.so.6]` 5; `[unknown]` 5; `__pthread_mutex_unlock_usercnt [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 1047 ms, GCSlice 8× 30 ms, CCSlice 2× 4 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `__syscall_cancel_arch [libc.so.6]` 19, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 13, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 6); SwComposite 29 ms (top self: `syscall [libc.so.6]` 19, `__memmove_avx512_unaligned_erms [libc.so.6]` 10); WRRenderBackend#0 12 ms (top self: `syscall [libc.so.6]` 11, `sched_yield [libc.so.6]` 0, `floorf [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 92 ms: buckets subprocess_pipe_io 92, worker_messaging 92, ipc 92, js_ctypes 88, poll_wait 85, gc_cc 3; top self: `__syscall_cancel_arch [libc.so.6]` 85; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 0; `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 0
- **tab:8908** CPU ms by thread group: main 13, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 13 ms (0.4% of span): GC / CC 6, Idle 5, Other 1, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 12, gc_cc 7, poll_wait 6, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `js::jit::ExecutableAllocator::poisonCode(JSRuntime*, mozilla` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char cons` 1; `js::gc::TraceExternalEdge(JSTracer*, JS::PropertyKey*, char ` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0
  - GC/CC markers: GCMajor 1× 38 ms, GCSlice 4× 6 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9016** CPU ms by thread group: main 7, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): GC / CC 5, Idle 1, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, gc_cc 5, poll_wait 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `JSObject::traceChildren(JSTracer*) [libxul.so]` 0; `void mozilla::ProfileBufferEntryWriter::WriteObjects<mozilla` 0
  - GC/CC markers: GCMajor 1× 22 ms, GCSlice 4× 5 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 2, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): GC / CC 1, Idle 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 27, Renderer 15, DOM Worker 7, BgPool 6, Compositor 2, WRRenderBackend 1, WRSceneBuilder 1, SwComposite 1, Socket 1, IPC I/O 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 27 ms (11.3% of span): JavaScript 8, Idle 7, Other 4, Layout 3, DOM 3, Profiler 2
  - JS leaf 0 / native under JS 15 / native 11; buckets: ipc 27, poll_wait 11, array_buffer_copy 5, harness_diagnostics 4, paint_layout 4, gc_cc 4, worker_messaging 3, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `harfbuzz::unicode_funcs::UnicodeFuncsBuilder::set_general_ca` 1; `nsIContent::Release() [libxul.so]` 1; `js::jit::CallIRGenerator::tryAttachCallNative(JS::Handle<JSF` 1
  - WebRender/compositor threads: Renderer 15 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3, `__syscall_cancel_arch [libc.so.6]` 3, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 2); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 5 ms (top self: `unlink [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 2, `rmdir [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 6, poll_wait 5; top self: `__syscall_cancel_arch [libc.so.6]` 5; `(anonymous namespace)::HandleSigChld(int) [libxul.` 1; `bool mozilla::HashSet<js::jit::ExecutablePool*, mo` 1; `mozilla::BaseTimeDurationPlatformUtils::TicksFromM` 0
- **tab:9361** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (2.4% of span): Idle 3, Other 2, DOM 1, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 4; buckets: ipc 6, poll_wait 3, gc_cc 1, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `nscstring_fallible_append_utf16_to_utf8_impl [libxul.so]` 1; `(anonymous namespace)::NameResolver::visit(js::frontend::Par` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `__strlen_evex [libc.so.6]` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8908** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.4% of span): Idle 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[unknown]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8967** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `g_thread_self [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

