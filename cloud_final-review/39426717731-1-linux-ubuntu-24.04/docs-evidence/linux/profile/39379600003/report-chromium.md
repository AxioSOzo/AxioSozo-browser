# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **51.0** (main 19.9, Renderer 17.0, DOM Worker 5.7, TaskCon~ller # 2.8, WRRende~ckend# 2.8) | AxioCEFProbe 48.2, cef:gpu-process 14.2, cef:utility 8.5, cef:renderer 5.7 | — | 325.0 |
| plain | idle | — | — | **4.9** (main 2.9, DOM Worker 1.0, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 1.5, cef:utility 1.0, forkserver 0.5 | — | — |
| plain | raf | 60.0 | 21.9 | **17.3** (main 4.6, Renderer 3.6, SwComposite 2.9, DOM Worker 1.6, TaskCon~ller # 1.0) | cef:renderer 5.6, AxioCEFProbe 3.6, cef:gpu-process 3.3, WebExtensions 0.7 | — | — |
| plain | raf-nosampler | — | — | **15.8** (Renderer 3.7, main 3.3, SwComposite 2.7, DOM Worker 1.7, WRRende~ckend# 1.0) | cef:renderer 5.0, cef:gpu-process 3.0, AxioCEFProbe 2.0, Web Content 0.3 | — | — |
| plain | scroll | 59.8 | 20.5 | **26.4** (main 9.9, DOM Worker 5.0, Renderer 3.5, SwComposite 3.0, WRRende~ckend# 1.5) | cef:gpu-process 12.4, cef:renderer 7.0, AxioCEFProbe 4.0 | — | — |
| plain | key | — | — | **8.3** (main 4.2, DOM Worker 0.8, TaskCon~ller # 0.6, IPC I/O Parent 0.3, Timer 0.3) | AxioCEFProbe 1.4, cef:renderer 1.1, cef:gpu-process 0.9, WebExtensions 0.3 | 9.4 | — |
| plain | switch-to-gecko | — | — | **44.3** (main 14.7, BgIOThr~Pool # 7.4, Renderer 7.4, Compositor 7.4, DOM Worker 7.4) |  | — | 120.8 |
| trace | switch-to-engine | — | — | **58.9** (Renderer 20.7, main 17.3, DOM Worker 10.4, Timer 3.5, WRScene~ilder# 3.5) | AxioCEFProbe 48.4, cef:gpu-process 17.3, cef:renderer 10.4, cef:utility 7.0 | — | 266.3 |
| trace | idle | — | — | **2.0** (main 1.5, Timer 0.5) | Web Content 1.9, AxioCEFProbe 1.0, cef:utility 0.5 | — | — |
| trace | raf | 60.0 | 20.9 | **20.6** (main 6.5, Renderer 3.6, SwComposite 2.6, TaskCon~ller # 1.3, WRRende~ckend# 1.3) | cef:renderer 5.6, AxioCEFProbe 3.6, cef:gpu-process 3.3 | — | — |
| trace | raf-nosampler | — | — | **27.6** (main 6.6, DOM Worker 6.0, Renderer 3.3, Indexed~ IO # 3.0, SwComposite 2.7) | cef:renderer 6.0, cef:gpu-process 3.0, AxioCEFProbe 2.6, Isolated Web Co 0.3 | — | — |
| trace | scroll | 59.5 | 20.8 | **37.9** (main 13.4, DOM Worker 7.0, Renderer 5.0, SwComposite 3.5, IPDL Background 1.5) | cef:gpu-process 13.4, cef:renderer 7.5, AxioCEFProbe 4.0 | — | — |
| trace | key | — | — | **12.4** (main 6.1, TaskCon~ller # 1.9, DOM Worker 1.4, Timer 0.6, Compositor 0.6) | AxioCEFProbe 2.0, cef:renderer 1.1, WebExtensions 0.6, cef:gpu-process 0.3 | 9.1 | — |
| trace | switch-to-gecko | — | — | **1.1** (main 0.5, TaskCon~ller # 0.2, DOM Worker 0.2, Renderer 0.1, BgIOThr~Pool # 0.1) |  | — | 15015.1 |
| profile | switch-to-engine | — | — | **21.0** (main 8.7, DOM Worker 5.0, SamplerThread 3.7, Renderer 1.2, Backgro~Pool # 1.2) | AxioCEFProbe 18.6, Web Content 16.1, cef:gpu-process 6.2, cef:zygote 3.7 | — | 784.1 |
| profile | idle | — | — | **11.2** (SamplerThread 4.4, main 2.9, DOM Worker 2.9, Timer 1.0) | Web Content 4.4, AxioCEFProbe 2.0, cef:utility 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 60.0 | 21.3 | **35.8** (main 7.2, SamplerThread 6.8, DOM Worker 6.5, Renderer 4.9, SwComposite 3.3) | cef:renderer 6.9, Web Content 4.9, cef:gpu-process 4.5, AxioCEFProbe 3.3 | — | — |
| profile | raf-nosampler | — | — | **28.2** (DOM Worker 6.3, SamplerThread 5.3, Renderer 4.3, main 4.0, SwComposite 3.3) | cef:renderer 6.0, Web Content 4.9, cef:gpu-process 3.6, AxioCEFProbe 2.7 | — | — |
| profile | scroll | 60.0 | 21.1 | **45.2** (main 14.4, DOM Worker 8.4, SamplerThread 6.4, Renderer 5.0, SwComposite 3.0) | cef:gpu-process 14.9, cef:renderer 7.0, Web Content 5.0, AxioCEFProbe 4.5 | — | — |
| profile | key | — | — | **18.4** (main 5.8, SamplerThread 4.7, DOM Worker 4.4, Timer 1.1, Renderer 0.6) | Web Content 4.1, WebExtensions 1.4, cef:renderer 1.4, AxioCEFProbe 1.1 | 10.4 | — |
| profile | switch-to-gecko | — | — | **3.8** (SamplerThread 2.0, main 0.8, TaskCon~ller # 0.4, DOM Worker 0.3, BgIOThr~Pool # 0.1) | Web Content 5.5, WebExtensions 1.3, Socket Process 0.9, Isolated Web Co 0.9 | — | 15813.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.7 | 0.0 | 0 | 0.0 | — | — | 5.3 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf | 59.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | raf-nosampler | 59.5 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | scroll | 59.3 | 0.0 | 0 | 0.0 | — | — | 4.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| trace | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 2.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | switch-to-engine | 2.4 | 0.0 | 0 | 0.0 | — | — | 6.1 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 59.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 59.5 | 0.0 | 0 | 0.0 | — | — | 5.2 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 2.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.710 | 0.475 | 0.0039 | 0.0026 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.026 | 0.119 | 0.0016 | 0.0071 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.018 | 0.122 | 0.0011 | 0.0073 |
| plain | scroll | memfd | native | 119 | 119 | 0.072 | 0.102 | 0.0042 | 0.0060 |
| plain | key | memfd | native | 21 | 21 | 0.008 | 0.167 | 0.0000 | 0.0010 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.363 | 1.331 | 0.0024 | 0.0089 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 184 | 184 | 0.027 | 0.114 | 0.0016 | 0.0068 |
| trace | raf-nosampler | memfd | native | 181 | 181 | 0.020 | 0.117 | 0.0012 | 0.0070 |
| trace | scroll | memfd | native | 120 | 120 | 0.075 | 0.103 | 0.0044 | 0.0061 |
| trace | key | memfd | native | 21 | 21 | 0.007 | 0.153 | 0.0000 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.629 | 1.171 | 0.0015 | 0.0029 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 185 | 186 | 0.029 | 0.139 | 0.0017 | 0.0084 |
| profile | raf-nosampler | memfd | native | 181 | 181 | 0.018 | 0.130 | 0.0011 | 0.0078 |
| profile | scroll | memfd | native | 121 | 121 | 0.082 | 0.110 | 0.0049 | 0.0065 |
| profile | key | memfd | native | 21 | 21 | 0.008 | 0.157 | 0.0000 | 0.0009 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.3 | 4.6 | 0.0 | — | — | — | — | — | — | — | — |
| profile | 0.4 | 5.6 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 11.7; spawn AxioCEFProbe resolved 20.1; write hello 22.0; first stdout read resolved 179.6; write create 180.7; write frame_ack 272.1; write focus 276.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 14.2; first stdout read resolved 23.2; write shutdown 23.9

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 30.4; spawn AxioCEFProbe resolved 65.0; write hello 69.8; first stdout read resolved 309.7; write create 310.9; write frame_ack 794.6; write focus 800.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 18.9; first stdout read resolved 34.4; write shutdown 36.6

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 59, DOM Worker 33, Renderer 16, WRRenderBackend 4, Compositor 3, BgPool 3, IPC I/O 2, WRSceneBuilder 2, SwComposite 2, Socket 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 59 ms (7.2% of span): Layout 19, Idle 17, JavaScript 15, Other 5, DOM 2, Graphics 2
  - JS leaf 1 / native under JS 19 / native 40; buckets: ipc 59, paint_layout 23, poll_wait 20, gc_cc 12, harness_diagnostics 7, array_buffer_copy 4, subprocess_pipe_io 2, engine_stream_read 2
  - top self: `poll [libc.so.6]` 17; `style::properties::cascade::iter_declarations [libxul.so]` 6; `style::properties::generated::longhands::color::cascade_prop` 3; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, J` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 2
  - WebRender/compositor threads: Renderer 16 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5, `void clear_buffer<unsigned int>(Texture&, unsigned` 4); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1, `__memset_avx512_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 33 ms: buckets subprocess_pipe_io 33, worker_messaging 33, ipc 33, poll_wait 23, js_ctypes 23, array_buffer_copy 2; top self: `poll [libc.so.6]` 22; `[axiosozo-dev]` 4; `__GI__Fork [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[unknown]` 1
- **tab:3958** CPU ms by thread group: main 32, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 32 ms (4.0% of span): Other 24, JavaScript 4, DOM 2, Profiler 1, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 28; buckets: ipc 24, array_buffer_copy 9, gc_cc 8, subprocess_pipe_io 4, json_metadata 1, memcpy_memset 1, poll_wait 1
  - top self: `xpt::detail::InterfaceByIID(nsID const&) [libxul.so]` 3; `[libfontconfig.so.1]` 2; `mozilla::dom::StartupJSEnvironment() [libxul.so]` 1; `[]` 1; `js::frontend::BytecodeEmitter::emitGCIndexOp(JSOp, js::GCThi` 1; `do_lookup_x [ld-linux-x86-64.so.2]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `syscall [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 30, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (4.2% of span): Other 26, Profiler 2, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 29; buckets: ipc 22, gc_cc 9, array_buffer_copy 8, poll_wait 4, subprocess_pipe_io 3, memcpy_memset 1
  - top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `poll [libc.so.6]` 2; `[libexpat.so.1]` 2; `gfxPlatformFontList::InitializeCodepointsWithNoFonts() [libx` 2; `[]` 1; `PrefsIter::Next() [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3832** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `mozilla::dom::BrowserChildMessageManager::GetEventTargetPare` 0; `mozilla::PointerEventHandler::DispatchPointerFromMouseOrTouc` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 50, DOM Worker 32, other 10, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 50 ms (2.4% of span): Idle 37, JavaScript 8, DOM 3, Profiler 1, Other 1, GC / CC 0
  - JS leaf 2 / native under JS 9 / native 39; buckets: ipc 50, poll_wait 38, gc_cc 6, array_buffer_copy 5, harness_diagnostics 5, subprocess_pipe_io 4, js_ctypes 1, json_metadata 0
  - top self: `poll [libc.so.6]` 37; `next (self-hosted:1265:23)[10]` 2; `__lll_lock_wait [libc.so.6]` 1; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, J` 1; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `rename [libc.so.6]` 0, `open64 [libc.so.6]` 0, `getdents64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 32 ms: buckets subprocess_pipe_io 32, js_ctypes 32, worker_messaging 32, ipc 32, poll_wait 32; top self: `poll [libc.so.6]` 32
- **tab:3958** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3832** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 196, DOM Worker 141, Renderer 130, SwComposite 96, WRRenderBackend 40, BgPool 36, Compositor 24, other 19, ImageBridge 10, WRSceneBuilder 5, IPC I/O 2, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 196 ms (6.4% of span): Idle 144, JavaScript 29, Other 12, DOM 8, GC / CC 2, Graphics 1
  - JS leaf 3 / native under JS 33 / native 160; buckets: ipc 196, poll_wait 149, gc_cc 34, worker_messaging 18, array_buffer_copy 13, engine_stream_read 13, json_metadata 11, subprocess_pipe_io 8
  - top self: `poll [libc.so.6]` 145; `[unknown]` 5; `write [libc.so.6]` 3; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 2; `mozilla::PerformanceCounterState::MaybeReportAccumulatedTime` 1; `fun_resolve(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 130 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `int blendTextureNearestFast<false, glsl::sampler2D` 16, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); SwComposite 96 ms (top self: `syscall [libc.so.6]` 79, `void scale_blit<true>(Texture&, IntRect const&, Te` 14, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 40 ms (top self: `syscall [libc.so.6]` 36, `webrender::quad::write_rounded_rect_clip_blocks [l` 1, `webrender::render_target::RenderTarget::add_task::` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 36 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 34, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `nsIEventTarget::IsOnCurrentThread() [libxul.so]` 0); ImageBridgeChld 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0, `close [libc.so.6]` 0)
  - busiest DOM Worker 133 ms: buckets subprocess_pipe_io 133, worker_messaging 133, ipc 133, js_ctypes 122, poll_wait 120, memcpy_memset 3; top self: `poll [libc.so.6]` 120; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `js::gc::StoreBuffer::SlotsEdge::trace(js::gc::Tenu` 2; `bool js::ctypes::jsvalToInteger<int>(JSContext*, J` 1; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 1
- **tab:3832** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 2, gc_cc 2, memcpy_memset 1
  - top self: `poll [libc.so.6]` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `write [libc.so.6]` 0; `GIFFT_LabeledTimingDistributionAccumulateRawMillis [libxul.s` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3958** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3356** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 122, Renderer 116, main 112, SwComposite 87, WRRenderBackend 37, BgPool 31, Compositor 22, ImageBridge 9, WRSceneBuilder 5, other 1, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 112 ms (3.7% of span): Idle 76, JavaScript 19, Other 9, DOM 5, GC / CC 3
  - JS leaf 3 / native under JS 20 / native 88; buckets: ipc 112, poll_wait 80, gc_cc 25, engine_stream_read 15, worker_messaging 12, json_metadata 8, subprocess_pipe_io 7, array_buffer_copy 4
  - top self: `poll [libc.so.6]` 78; `[unknown]` 5; `write [libc.so.6]` 4; `js::gc::TenuringTracer::collectToObjectFixedPoint() [libxul.` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 116 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 82, `int blendTextureNearestFast<false, glsl::sampler2D` 14, `glsl::texture(glsl::sampler2DRect_impl*, glsl::vec` 4); SwComposite 87 ms (top self: `syscall [libc.so.6]` 72, `void scale_blit<true>(Texture&, IntRect const&, Te` 13, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 33, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 31 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 28, `__memmove_avx512_unaligned_erms [libc.so.6]` 2, `nsXULPrototypeCache::Release() [libxul.so]` 0); ImageBridgeChld 9 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `mozilla::ipc::MessageChannel::OnMessageReceivedFro` 0, `IsTwiceTheRequiredBytesRepresentableAsUint32(unsig` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 122 ms: buckets subprocess_pipe_io 122, worker_messaging 122, ipc 122, js_ctypes 112, poll_wait 111, gc_cc 2; top self: `poll [libc.so.6]` 111; `nsProfilerStartParams::GetFilters() [libxul.so]` 3; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `write [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3958** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3356** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 285, DOM Worker 137, Renderer 93, SwComposite 67, WRRenderBackend 30, BgPool 26, Compositor 16, other 11, ImageBridge 7, WRSceneBuilder 4, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 285 ms (14.0% of span): Idle 174, JavaScript 42, GC / CC 27, Other 21, DOM 8, Graphics 5
  - JS leaf 4 / native under JS 43 / native 238; buckets: ipc 285, poll_wait 203, gc_cc 66, worker_messaging 26, paint_layout 15, engine_stream_read 14, array_buffer_copy 13, json_metadata 11
  - top self: `poll [libc.so.6]` 175; `[unknown]` 8; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 5; `write [libc.so.6]` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 4
  - GC/CC markers: GCMajor 1× 895 ms, GCSlice 6× 32 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 93 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55, `int blendTextureNearestFast<false, glsl::sampler2D` 10, `syscall [libc.so.6]` 6); SwComposite 67 ms (top self: `syscall [libc.so.6]` 60, `void scale_blit<true>(Texture&, IntRect const&, Te` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 30 ms (top self: `syscall [libc.so.6]` 27, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 26 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 25, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 137 ms: buckets subprocess_pipe_io 137, worker_messaging 137, ipc 137, js_ctypes 123, poll_wait 121, gc_cc 6; top self: `poll [libc.so.6]` 121; `[unknown]` 3; `js::gc::TenuringTracer::promoteObjectSlow(JSObject` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__memcmp_evex_movbe [libc.so.6]` 1
- **tab:3338** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3832** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `webrtc::internal::WeakReferenceOwner::WeakReferenceOwner() [` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 192, DOM Worker 88, Renderer 19, other 18, SwComposite 13, Compositor 8, WRRenderBackend 8, WRSceneBuilder 6, BgPool 4, IPC I/O 1, ImageBridge 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 192 ms (5.3% of span): Idle 77, JavaScript 46, Layout 21, Graphics 15, Other 15, DOM 14
  - JS leaf 6 / native under JS 72 / native 115; buckets: ipc 191, poll_wait 94, gc_cc 50, paint_layout 44, worker_messaging 38, engine_stream_read 21, array_buffer_copy 11, subprocess_pipe_io 10
  - top self: `poll [libc.so.6]` 78; `[unknown]` 8; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `std::__uniq_ptr_impl<mozilla::ScrollSnapTargetIds, std::defa` 2
  - WebRender/compositor threads: Renderer 19 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `int blendTextureNearestFast<false, glsl::sampler2D` 1, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 1); SwComposite 13 ms (top self: `syscall [libc.so.6]` 10, `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 8 ms (top self: `syscall [libc.so.6]` 7, `sched_yield [libc.so.6]` 0, `webrender::transform::register_gpu_transform [libx` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 88 ms: buckets subprocess_pipe_io 88, worker_messaging 88, ipc 88, js_ctypes 83, poll_wait 80, gc_cc 4; top self: `poll [libc.so.6]` 80; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1; `mozilla::dom::WorkerPrivate::BeginCTypesCall() [li` 1; `js::SpeciesConstructor(JSContext*, JS::Handle<JSOb` 1
- **tab:3259** CPU ms by thread group: main 12, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.3% of span): GC / CC 6, Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 10, poll_wait 8, gc_cc 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `FixWeakMappingGrayBitsTracer::trace(JSObject*, JS::GCCellPtr` 0; `js::PromiseObject::resolve(JSContext*, JS::Handle<js::Promis` 0
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 6 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3317** CPU ms by thread group: main 2, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.1% of span): Idle 2, GC / CC 1, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, u` 0; `sendmsg [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 1 ms, GCSlice 4× 1 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 117, DOM Worker 46, Renderer 12, BgPool 7, IPC I/O 4, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, other 1, SwComposite 1, Socket 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 117 ms (0.7% of span): GC / CC 74, JavaScript 14, Idle 11, Layout 6, DOM 5, Other 3
  - JS leaf 0 / native under JS 26 / native 90; buckets: ipc 117, gc_cc 80, poll_wait 13, paint_layout 11, harness_diagnostics 10, array_buffer_copy 7, subprocess_pipe_io 4, json_metadata 3
  - top self: `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 19; `poll [libc.so.6]` 11; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 5; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 5; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNat` 4; `unsigned long js::gc::Arena::finalize<JSObject, (js::gc::Fin` 4
  - GC/CC markers: GCMajor 2× 136 ms, GCSlice 14× 66 ms, CCSlice 3× 7 ms, GCMinor 3× 0 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 12 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 7 ms (top self: `unlink [libc.so.6]` 4, `fstatat64 [libc.so.6]` 1, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 47 ms: buckets subprocess_pipe_io 47, worker_messaging 47, ipc 47, gc_cc 41, poll_wait 7, memcpy_memset 5; top self: `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 5; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4; `poll [libc.so.6]` 4; `std::unique_ptr<mozilla::ProfileBufferChunk, std::` 3
- **tab:3832** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Layout 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `mozilla::glean::HistogramIdForMetric(unsigned int) [libxul.s` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3356** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2, ipc 2
  - top self: `poll [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3338** CPU ms by thread group: main 2, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.0% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

