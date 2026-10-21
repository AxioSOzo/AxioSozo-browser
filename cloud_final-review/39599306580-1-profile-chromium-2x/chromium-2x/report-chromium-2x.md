# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **108.5** (main 40.0, Renderer 40.0, glean.dispatche 5.7, StyleThread# 5.7, WRRende~ckend# 5.7) | AxioCEFProbe 17.1, cef:renderer 17.1, cef:utility 5.7 | — | 142.9 |
| plain | idle | — | — | **3.4** (main 2.9, IPDL Background 0.5) | Web Content 3.4 | — | — |
| plain | raf | 60.0 | 21.0 | **25.2** (main 7.8, Renderer 3.9, SwComposite 3.2, Backgro~Pool # 2.6, DOM Worker 2.6) | cef:gpu-process 12.3, cef:renderer 9.4, AxioCEFProbe 7.1 | — | — |
| plain | raf-nosampler | — | — | **18.9** (main 3.6, Renderer 3.6, SwComposite 3.0, Backgro~Pool # 2.7, DOM Worker 2.3) | cef:gpu-process 11.6, cef:renderer 8.0, AxioCEFProbe 7.0 | — | — |
| plain | scroll | 60.0 | 24.9 | **42.2** (main 17.1, DOM Worker 5.9, Backgro~Pool # 5.4, Renderer 4.4, SwComposite 3.4) | cef:gpu-process 51.0, cef:renderer 12.2, AxioCEFProbe 10.8 | — | — |
| plain | key | — | — | **14.2** (main 6.9, Renderer 2.5, DOM Worker 1.1, TaskCon~ller # 0.8, SwComposite 0.8) | AxioCEFProbe 2.0, cef:renderer 1.6, cef:gpu-process 0.9, WebExtensions 0.3 | 11.5 | — |
| plain | switch-to-gecko | — | — | **10.3** (DOM Worker 3.8, main 3.5, IPDL Background 1.0, TaskCon~ller # 1.0, glean.dispatche 0.2) | Privileged Cont 0.1, WebExtensions 0.1, Web Content 0.1, Isolated Web Co 0.1 | — | 15263.5 |
| trace | switch-to-engine | — | — | **106.2** (Renderer 66.8, main 24.3, Compositor 6.1, SwComposite 3.0, DOM Worker 3.0) | AxioCEFProbe 51.6, cef:gpu-process 33.4, cef:utility 15.2, cef:renderer 12.1 | — | 291.3 |
| trace | idle | — | — | **3.4** (main 2.9, Timer 0.5) | AxioCEFProbe 2.5, Web Content 2.4 | — | — |
| trace | raf | 60.0 | 20.7 | **24.5** (main 7.5, Renderer 4.2, SwComposite 3.2, Backgro~Pool # 3.2, DOM Worker 2.6) | cef:gpu-process 11.3, cef:renderer 9.1, AxioCEFProbe 7.1, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **21.5** (main 4.6, Renderer 4.3, SwComposite 3.3, Backgro~Pool # 2.7, DOM Worker 2.3) | cef:gpu-process 10.6, cef:renderer 9.3, AxioCEFProbe 7.6 | — | — |
| trace | scroll | 59.9 | 20.5 | **40.6** (main 16.1, DOM Worker 7.3, Backgro~Pool # 5.4, Renderer 3.9, SwComposite 2.9) | cef:gpu-process 51.8, AxioCEFProbe 10.8, cef:renderer 10.7 | — | — |
| trace | key | — | — | **13.0** (main 6.3, Renderer 2.5, SwComposite 1.1, Timer 0.8, DOM Worker 0.8) | cef:renderer 2.6, AxioCEFProbe 2.3, cef:gpu-process 0.9, Web Content 0.3 | 11.5 | — |
| trace | switch-to-gecko | — | — | **33.0** (main 13.2, Renderer 13.2, WRScene~ilder# 6.6) |  | — | 129.7 |
| profile | switch-to-engine | — | — | **107.9** (main 39.7, Renderer 34.0, Socket Thread 5.7, IPDL Background 5.7, WRRende~ckend# 5.7) | cef:renderer 22.7, AxioCEFProbe 22.7, cef:utility 5.7 | — | 139.3 |
| profile | idle | — | — | **16.8** (SamplerThread 7.2, DOM Worker 4.8, main 3.4, Timer 1.4) | Web Content 6.7, WebExtensions 2.0, Privileged Cont 1.5, Isolated Web Co 1.4 | — | — |
| profile | raf | 60.0 | 21.1 | **49.8** (main 11.9, DOM Worker 9.3, SamplerThread 9.3, Renderer 5.2, SwComposite 3.5) | cef:gpu-process 12.5, cef:renderer 10.3, AxioCEFProbe 8.0, Web Content 7.4 | — | — |
| profile | raf-nosampler | — | — | **50.9** (main 10.6, DOM Worker 9.3, SamplerThread 8.3, Renderer 4.6, SwComposite 3.6) | cef:gpu-process 11.6, cef:renderer 10.2, AxioCEFProbe 8.7, Web Content 6.3 | — | — |
| profile | scroll | 60.2 | 21.1 | **68.6** (main 23.2, DOM Worker 13.5, SamplerThread 9.7, Backgro~Pool # 6.3, Renderer 5.3) | cef:gpu-process 55.6, cef:renderer 12.6, AxioCEFProbe 10.6, Web Content 7.2 | — | — |
| profile | key | — | — | **36.8** (main 11.5, SamplerThread 7.7, DOM Worker 7.1, Renderer 2.5, TaskCon~ller # 1.9) | Web Content 6.6, cef:renderer 2.7, AxioCEFProbe 2.4, WebExtensions 2.2 | 13.7 | — |
| profile | switch-to-gecko | — | — | **4.1** (SamplerThread 3.1, DOM Worker 0.4, main 0.3, Renderer 0.1, Timer 0.1) | Web Content 6.6, Privileged Cont 1.5, Isolated Web Co 1.3, WebExtensions 1.1 | — | 15024.2 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.7 | 0.0 | 0 | 0.0 | — | — | 29.2 | 0.0 | — | 3.98 | 0.56 | — | — | — | — | — | 0.003 |
| trace | raf | 59.6 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.26 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 59.6 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.23 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 9.4 | 0.0 | — | 0.49 | 0.11 | — | — | — | — | — | 0.007 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.9 | 0.0 | — | 0.20 | 0.08 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.0 | 0.0 | 0 | 0.0 | — | — | 33.4 | 0.0 | — | 5.50 | 0.81 | — | — | — | — | — | 0.004 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.30 | 0.14 | — | — | — | — | — | 0.010 |
| profile | raf-nosampler | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.30 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 58.8 | 0.0 | 0 | 0.0 | — | — | 10.5 | 0.0 | — | 0.59 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.1 | 0.0 | — | 0.33 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 1 | 1 | 5.089 | 5.332 | 0.0264 | 0.0276 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.172 | 0.266 | 0.0103 | 0.0160 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.151 | 0.252 | 0.0091 | 0.0152 |
| plain | scroll | memfd | native | 120 | 120 | 0.438 | 0.479 | 0.0256 | 0.0279 |
| plain | key | memfd | native | 21 | 21 | 0.041 | 0.143 | 0.0002 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 3.128 | 5.463 | 0.0178 | 0.0311 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 186 | 186 | 0.185 | 0.271 | 0.0111 | 0.0162 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.166 | 0.270 | 0.0100 | 0.0162 |
| trace | scroll | memfd | native | 121 | 121 | 0.437 | 0.481 | 0.0256 | 0.0282 |
| trace | key | memfd | native | 21 | 21 | 0.042 | 0.143 | 0.0002 | 0.0008 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 1 | 1 | 5.317 | 5.314 | 0.0266 | 0.0266 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 188 | 188 | 0.212 | 0.288 | 0.0127 | 0.0173 |
| profile | raf-nosampler | memfd | native | 182 | 181 | 0.211 | 0.287 | 0.0126 | 0.0171 |
| profile | scroll | memfd | native | 123 | 123 | 0.492 | 0.558 | 0.0289 | 0.0328 |
| profile | key | memfd | native | 21 | 21 | 0.051 | 0.138 | 0.0003 | 0.0008 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 6.9 | 0.0 | — | 0.19 | 0.37 | — | — | 8.4 | 7.7 | 16.9 |
| profile | 0.6 | 9.1 | 0.0 | — | 0.31 | 0.61 | — | — | 8.4 | 10.5 | 20.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 117.7; write create 125.8; first frame applied (native receiver) 309.6; write frame_ack 310.4; write focus 314.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 17.6; first stdout read resolved 24.7; write shutdown 28.3

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.0; first stdout read resolved 40.7; first frame applied (native receiver) 154.5; write frame_ack 155.3; write focus 163.6

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 26.7; first stdout read resolved 37.2; write shutdown 42.4

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 67, main 62, BgPool 10, DOM Worker 8, SwComposite 7, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, Socket 1, IPC I/O 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 62 ms (31.4% of span): Layout 21, JavaScript 13, Idle 11, DOM 6, Graphics 6, Other 5
  - JS leaf 1 / native under JS 31 / native 30; buckets: ipc 62, paint_layout 30, gc_cc 16, array_buffer_copy 14, poll_wait 12, harness_diagnostics 10, worker_messaging 2, engine_stream_read 2
  - top self: `poll [libc.so.6]` 11; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 5; `selectors::matching::matches_simple_selector [libxul.so]` 5; `style::rule_collector::RuleCollector<E>::collect_stylist_rul` 4; `JSStructuredCloneWriter::startWrite(JS::Handle<JS::Value>) [` 3
  - WebRender/compositor threads: Renderer 67 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 22, `__lll_lock_wake [libc.so.6]` 9, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 7); SwComposite 7 ms (top self: `syscall [libc.so.6]` 7); WRRenderBackend#0 3 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 10 ms (top self: `__memset_avx512_unaligned_erms [libc.so.6]` 4, `ARGBSetRow_X86 [libxul.so]` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 8 ms: buckets subprocess_pipe_io 8, worker_messaging 8, ipc 8, js_ctypes 8, poll_wait 8; top self: `poll [libc.so.6]` 8; `mozilla::dom::AutoJSAPI::ReportException() [libxul` 0; `[unknown]` 0; `EnqueuePromiseReactionJob(JSContext*, JS::Handle<J` 0; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 0
- **tab:4108** CPU ms by thread group: main 13, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 13 ms (6.4% of span): Other 9, JavaScript 2, Idle 1, DOM 0
  - JS leaf 0 / native under JS 4 / native 9; buckets: ipc 13, gc_cc 7, subprocess_pipe_io 4, memcpy_memset 1, image_container 1, poll_wait 1
  - top self: `sendmsg [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 1; `syscall [libc.so.6]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `js::frontend::BytecodeEmitter::markSimpleBreakpoint() [libxu` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3920** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.3% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4104** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.6% of span): Other 1, Idle 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `sendmsg [libc.so.6]` 1; `poll [libc.so.6]` 0; `[]` 0
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 73, DOM Worker 65, other 13, IPC I/O 1, Socket 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 73 ms (3.5% of span): Idle 64, JavaScript 4, Other 4, DOM 1, Profiler 1
  - JS leaf 0 / native under JS 4 / native 69; buckets: ipc 73, poll_wait 66, harness_diagnostics 4, array_buffer_copy 4, gc_cc 2, native_receiver 0, memcpy_memset 0, json_metadata 0
  - top self: `poll [libc.so.6]` 64; `recvmsg [libc.so.6]` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 1; `js::Call(JSContext*, JS::Handle<JS::Value>, JS::Handle<JS::V` 1; `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 65 ms: buckets subprocess_pipe_io 65, js_ctypes 65, worker_messaging 65, ipc 65, poll_wait 65; top self: `poll [libc.so.6]` 65
- **tab:3343** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.4% of span): GC / CC 6, Idle 2, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 6, gc_cc 6, poll_wait 3, memcpy_memset 0
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `poll [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 7 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3429** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.4% of span): GC / CC 7, Idle 1
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, gc_cc 7, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1
  - GC/CC markers: GCMajor 1× 6 ms, GCSlice 4× 6 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3390** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsign` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 351, DOM Worker 222, Renderer 142, SwComposite 106, BgPool 97, WRRenderBackend 47, Compositor 35, other 25, ImageBridge 15, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 351 ms (11.2% of span): Idle 216, JavaScript 66, GC / CC 29, Other 25, DOM 11, Profiler 3
  - JS leaf 10 / native under JS 66 / native 275; buckets: ipc 351, poll_wait 230, gc_cc 89, engine_stream_read 34, worker_messaging 30, json_metadata 19, harness_diagnostics 16, subprocess_pipe_io 14
  - top self: `poll [libc.so.6]` 220; `[unknown]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `write [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) ` 3; `recvmsg [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 785 ms, GCSlice 7× 26 ms, CCSlice 2× 4 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 142 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `__memmove_avx512_unaligned_erms [libc.so.6]` 35, `syscall [libc.so.6]` 5); SwComposite 106 ms (top self: `syscall [libc.so.6]` 88, `__memmove_avx512_unaligned_erms [libc.so.6]` 15, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 44, `webrender::tile_cache::TileCacheInstance::update_p` 0, `webrender::invalidation::quadtree::TileNode::updat` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 97 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 75, `__memmove_avx512_unaligned_erms [libc.so.6]` 21, `write [libc.so.6]` 1); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 14, `__lll_lock_wait [libc.so.6]` 0, `IPC::ParamTraits<mozilla::layers::AsyncParentMessa` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 222 ms: buckets subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 206, poll_wait 200, gc_cc 7; top self: `poll [libc.so.6]` 200; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 2; `[unknown]` 1; `__lll_lock_wait [libc.so.6]` 1; `write [libc.so.6]` 1
- **tab:3390** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3925** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: main 303, DOM Worker 255, BgPool 158, Renderer 138, SwComposite 103, Socket 56, WRRenderBackend 45, Compositor 34, ImageBridge 14, WRSceneBuilder 7, other 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 303 ms (10.0% of span): Idle 129, Network 61, JavaScript 57, DOM 28, Other 27, Profiler 2
  - JS leaf 8 / native under JS 78 / native 218; buckets: ipc 303, poll_wait 139, gc_cc 85, array_buffer_copy 52, worker_messaging 44, memcpy_memset 33, engine_stream_read 24, json_metadata 19
  - top self: `poll [libc.so.6]` 130; `__memmove_avx512_unaligned_erms [libc.so.6]` 18; `__memset_avx512_unaligned_erms [libc.so.6]` 16; `zlib_rs::inflate::inflate_fast_help_avx2 [libxul.so]` 15; `[unknown]` 11; `decltype (((std::declval<mozilla::dom::TypedArray_base<JS::T` 10
  - WebRender/compositor threads: Renderer 138 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 80, `__memmove_avx512_unaligned_erms [libc.so.6]` 36, `syscall [libc.so.6]` 8); SwComposite 103 ms (top self: `syscall [libc.so.6]` 89, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 92 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 78, `__memmove_avx512_unaligned_erms [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); BgIOThreadPool #2 65 ms (top self: `[libfreeblpriv3.so]` 52, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `read [libc.so.6]` 3); ImageBridgeChld 14 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0)
  - busiest DOM Worker 213 ms: buckets subprocess_pipe_io 213, worker_messaging 213, ipc 213, js_ctypes 202, poll_wait 199, gc_cc 5; top self: `poll [libc.so.6]` 199; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRa` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:3429** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3411** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 452, DOM Worker 228, BgPool 128, Renderer 91, SwComposite 68, WRRenderBackend 35, Compositor 23, other 17, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 452 ms (21.6% of span): Idle 262, JavaScript 71, Other 45, DOM 23, Graphics 22, GC / CC 15
  - JS leaf 12 / native under JS 80 / native 360; buckets: ipc 452, poll_wait 335, gc_cc 82, paint_layout 49, worker_messaging 39, subprocess_pipe_io 19, harness_diagnostics 17, engine_stream_read 17
  - top self: `poll [libc.so.6]` 273; `[unknown]` 11; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4; `write [libc.so.6]` 4
  - GC/CC markers: GCSlice 5× 7 ms, CCSlice 2× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 91 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx512_unaligned_erms [libc.so.6]` 18, `syscall [libc.so.6]` 10); SwComposite 67 ms (top self: `syscall [libc.so.6]` 67, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 31, `sched_yield [libc.so.6]` 2, `webrender::picture::PictureInstance::take_context ` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 127 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 90, `__memmove_avx512_unaligned_erms [libc.so.6]` 36, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `[linux-vdso.so.1]` 0, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0); BgIOThreadPool #3 1 ms (top self: `open64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1)
  - busiest DOM Worker 229 ms: buckets subprocess_pipe_io 229, worker_messaging 229, ipc 229, js_ctypes 211, poll_wait 202, gc_cc 6; top self: `poll [libc.so.6]` 202; `__memset_avx512_unaligned_erms [libc.so.6]` 4; `getcontext [libc.so.6]` 3; `js::jit::InlineFrameIterator::findNextFrame() [lib` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:3429** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3411** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 390, DOM Worker 179, Renderer 96, SwComposite 44, other 25, Compositor 14, WRRenderBackend 14, WRWorker 10, WRSceneBuilder 8, BgPool 5, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 390 ms (10.7% of span): Idle 146, GC / CC 67, JavaScript 64, Layout 36, Graphics 26, Other 26
  - JS leaf 16 / native under JS 105 / native 269; buckets: ipc 390, poll_wait 188, gc_cc 142, paint_layout 67, worker_messaging 53, engine_stream_read 40, subprocess_pipe_io 16, harness_diagnostics 10
  - top self: `poll [libc.so.6]` 149; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `[unknown]` 11; `recvmsg [libc.so.6]` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 6; `[axiosozo-dev]` 4
  - GC/CC markers: GCMajor 2× 816 ms, GCSlice 14× 49 ms, CCSlice 3× 11 ms, GCMinor 3× 5 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 97 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 38, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); SwComposite 44 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 23, `syscall [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `core::hash::BuildHasher::hash_one [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `mozilla::layers::ImageBridgeChild::UpdateImageClie` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 179 ms: buckets subprocess_pipe_io 179, worker_messaging 179, ipc 179, js_ctypes 168, poll_wait 166, gc_cc 5; top self: `poll [libc.so.6]` 166; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `write [libc.so.6]` 1
- **tab:3343** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 0, JavaScript 0, Profiler 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `sendmsg [libc.so.6]` 0; `unsigned int mozilla::ProfileBufferEntryWriter::SumBytes<moz` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `js::ToBooleanSlow(JS::Handle<JS::Value>) [libxul.so]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.m` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3429** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4108** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: DOM Worker 54, main 50, Renderer 31, BgPool 7, IPC I/O 5, Compositor 5, SwComposite 4, WRRenderBackend 2, WRSceneBuilder 2, other 2, Socket 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 50 ms (0.3% of span): Idle 15, Layout 11, JavaScript 10, Other 9, DOM 3, Graphics 1
  - JS leaf 1 / native under JS 19 / native 30; buckets: ipc 50, poll_wait 16, paint_layout 16, harness_diagnostics 8, array_buffer_copy 8, gc_cc 7, memcpy_memset 3, subprocess_pipe_io 3
  - top self: `poll [libc.so.6]` 15; `madvise [libc.so.6]` 3; `sendmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `__lll_lock_wait [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - GC/CC markers: GCMinor 3× 2 ms
  - WebRender/compositor threads: Renderer 31 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `hypotf@@GLIBC_2.35 [libm.so.6]` 5); SwComposite 4 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 6 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 2, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `syscall [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 55 ms: buckets subprocess_pipe_io 55, worker_messaging 55, ipc 55, gc_cc 43, poll_wait 12, js_ctypes 11; top self: `poll [libc.so.6]` 10; `[axiosozo-dev]` 5; `madvise [libc.so.6]` 5; `std::unique_ptr<mozilla::ProfileBufferChunk, std::` 4; `mozilla::SourceLocation::~SourceLocation() [libxul` 3
- **tab:3411** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, gc_cc 0
  - top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `sendmsg [libc.so.6]` 0; `JS::HasAnyMicroTasks(JSContext*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3429** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2; `[]` 0; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3920** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Layout 0, Other 0, Graphics 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 0, canvas_2d 0
  - top self: `poll [libc.so.6]` 3; `SkCanvas::setMatrix(SkMatrix const&) [libxul.so]` 0; `PR_GetThreadPrivate [libnspr4.so]` 0; `nsBlockFrame::BuildDisplayList(mozilla::nsDisplayListBuilder` 0; `<firefox_on_glean::private::labeled_counter::LabeledCounterM` 0; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

