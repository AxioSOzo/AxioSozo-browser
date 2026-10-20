# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **52.0** (main 19.9, Renderer 13.8, DOM Worker 9.2, StyleThread# 3.1, glean.dispatche 1.5) | AxioCEFProbe 33.6, cef:gpu-process 15.3, cef:utility 10.7, cef:renderer 9.2 | — | 605.5 |
| plain | idle | — | — | **6.1** (main 4.7, TaskCon~ller # 0.9, Timer 0.5) | AxioCEFProbe 2.4, cef:utility 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 60.0 | 22.2 | **21.8** (main 8.1, DOM Worker 2.6, Renderer 2.3, Backgro~Pool # 1.3, SwComposite 1.3) | cef:renderer 6.8, AxioCEFProbe 4.8, cef:gpu-process 3.8, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.9** (main 5.3, DOM Worker 2.6, Renderer 2.0, TaskCon~ller # 1.3, WRRende~ckend# 1.0) | cef:renderer 7.6, AxioCEFProbe 5.6, cef:gpu-process 4.7, Isolated Web Co 0.3 | — | — |
| plain | scroll | 60.0 | 22.0 | **33.1** (main 15.5, DOM Worker 7.3, Renderer 1.9, Backgro~Pool # 1.9, WRRende~ckend# 1.5) | cef:gpu-process 19.4, cef:renderer 9.2, AxioCEFProbe 8.7 | — | — |
| plain | key | — | — | **15.9** (main 9.3, TaskCon~ller # 1.4, Renderer 1.1, DOM Worker 1.1, glean.dispatche 0.5) | cef:renderer 2.0, AxioCEFProbe 1.9, cef:gpu-process 0.8, WebExtensions 0.3 | 12.6 | — |
| plain | switch-to-gecko | — | — | **12.4** (DOM Worker 4.5, main 3.6, IPDL Background 1.4, Indexed~ IO # 1.2, TaskCon~ller # 0.5) | Privileged Cont 0.1, Web Content 0.1, Utility Process 0.1 | — | 15372.0 |
| trace | switch-to-engine | — | — | **72.7** (Renderer 30.3, main 18.2, glean.dispatche 6.1, DOM Worker 6.1, WRScene~ilder# 3.0) | AxioCEFProbe 66.6, cef:gpu-process 30.2, cef:renderer 18.2, cef:utility 18.2 | — | 284.4 |
| trace | idle | — | — | **3.9** (main 2.9, Timer 0.5, TaskCon~ller # 0.5) | AxioCEFProbe 2.5, Web Content 1.9, cef:zygote 0.5, Privileged Cont 0.5 | — | — |
| trace | raf | 60.0 | 20.7 | **19.5** (main 7.4, DOM Worker 2.6, Renderer 2.3, WRRende~ckend# 1.3, glean.dispatche 1.0) | cef:renderer 7.1, cef:gpu-process 4.5, AxioCEFProbe 4.1 | — | — |
| trace | raf-nosampler | — | — | **16.5** (main 4.6, DOM Worker 3.0, Renderer 2.3, Compositor 1.3, SwComposite 1.3) | cef:renderer 8.6, cef:gpu-process 4.7, AxioCEFProbe 4.6, Isolated Web Co 0.3 | — | — |
| trace | scroll | 60.1 | 21.9 | **35.0** (main 16.0, DOM Worker 7.3, Renderer 2.4, Backgro~Pool # 2.4, WRRende~ckend# 1.9) | cef:gpu-process 19.4, cef:renderer 10.2, AxioCEFProbe 7.8 | — | — |
| trace | key | — | — | **13.2** (main 8.2, Renderer 1.4, DOM Worker 1.4, Timer 0.5, Compositor 0.5) | cef:renderer 2.2, AxioCEFProbe 1.9, cef:gpu-process 0.5, WebExtensions 0.3 | 12.8 | — |
| trace | switch-to-gecko | — | — | **2.4** (main 0.9, TaskCon~ller # 0.6, DOM Worker 0.2, glean.dispatche 0.1, IPC I/O Parent 0.1) | WebExtensions 0.1, Privileged Cont 0.1 | — | 15019.2 |
| profile | switch-to-engine | — | — | **85.8** (main 38.1, Renderer 14.3, DOM Worker 14.3, SamplerThread 9.5, Softwar~cThread 4.8) | AxioCEFProbe 23.9, cef:renderer 23.8, Web Content 9.6 | — | 145.5 |
| profile | idle | — | — | **24.6** (SamplerThread 8.5, DOM Worker 7.6, main 5.7, Timer 1.9, TaskCon~ller # 0.9) | Web Content 8.0, AxioCEFProbe 2.8, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 59.9 | 21.0 | **48.3** (main 12.1, DOM Worker 11.8, SamplerThread 11.2, Renderer 2.6, Timer 1.9) | Web Content 9.9, cef:renderer 8.0, AxioCEFProbe 5.1, cef:gpu-process 4.4 | — | — |
| profile | raf-nosampler | — | — | **39.2** (DOM Worker 11.9, SamplerThread 9.6, main 6.6, Renderer 2.6, WRRende~ckend# 1.6) | Web Content 8.5, cef:renderer 7.9, AxioCEFProbe 5.9, cef:gpu-process 4.9 | — | — |
| profile | scroll | 60.0 | 21.7 | **65.4** (main 21.9, DOM Worker 16.7, SamplerThread 11.9, Renderer 2.9, Backgro~Pool # 2.9) | cef:gpu-process 21.5, cef:renderer 11.0, Web Content 10.0, AxioCEFProbe 7.2 | — | — |
| profile | key | — | — | **49.9** (main 13.3, BgIOThr~Pool # 10.1, DOM Worker 9.8, SamplerThread 9.8, TaskCon~ller # 1.6) | Web Content 9.3, cef:renderer 2.8, AxioCEFProbe 2.7, Privileged Cont 1.9 | 15.7 | — |
| profile | switch-to-gecko | — | — | **64.9** (main 27.1, Renderer 10.8, BgIOThr~Pool # 5.4, WRScene~ilder# 5.4, WRRende~ckend# 5.4) |  | — | 139.9 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.6 | 0.0 | 0 | 0.0 | — | — | 8.6 | 0.0 | — | 2.79 | 2.41 | — | — | — | — | — | 0.014 |
| trace | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.12 | 0.09 | — | — | — | — | — | 0.006 |
| trace | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.14 | 0.10 | — | — | — | — | — | 0.006 |
| trace | scroll | 58.9 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.26 | 0.09 | — | — | — | — | — | 0.006 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.6 | 0.0 | — | 0.32 | 0.10 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 8.1 | 0.0 | 0 | 0.0 | — | — | 7.1 | 0.0 | — | 3.08 | 0.71 | — | — | — | — | — | 0.006 |
| profile | raf | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.15 | 0.13 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.009 |
| profile | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 7.3 | 0.0 | — | 0.31 | 0.13 | — | — | — | — | — | 0.009 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.51 | 0.15 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.087 | 1.861 | 0.0032 | 0.0055 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 188 | 0.040 | 0.078 | 0.0024 | 0.0047 |
| plain | raf-nosampler | memfd | native | 184 | 184 | 0.043 | 0.082 | 0.0026 | 0.0049 |
| plain | scroll | memfd | native | 121 | 121 | 0.151 | 0.211 | 0.0087 | 0.0122 |
| plain | key | memfd | native | 21 | 21 | 0.018 | 0.067 | 0.0001 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 1.199 | 2.183 | 0.0068 | 0.0123 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 187 | 187 | 0.043 | 0.077 | 0.0026 | 0.0046 |
| trace | raf-nosampler | memfd | native | 183 | 183 | 0.055 | 0.084 | 0.0033 | 0.0050 |
| trace | scroll | memfd | native | 123 | 123 | 0.178 | 0.225 | 0.0105 | 0.0132 |
| trace | key | memfd | native | 21 | 21 | 0.017 | 0.072 | 0.0001 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.240 | 2.128 | 0.0181 | 0.0172 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 190 | 190 | 0.050 | 0.102 | 0.0030 | 0.0061 |
| profile | raf-nosampler | memfd | native | 184 | 184 | 0.052 | 0.094 | 0.0031 | 0.0057 |
| profile | scroll | memfd | native | 124 | 124 | 0.202 | 0.276 | 0.0118 | 0.0161 |
| profile | key | memfd | native | 21 | 21 | 0.024 | 0.086 | 0.0001 | 0.0005 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 8.2 | 0.0 | — | 0.32 | 0.53 | — | — | 8.8 | 9.3 | 17.7 |
| profile | 0.6 | 10.7 | 0.0 | — | 0.52 | 0.87 | — | — | 8.0 | 12.1 | 20.2 |

Switch timeline (trace, switch-to-engine, ms after the window start): first stdout read resolved 113.2; write create 114.9; first frame applied (native receiver) 297.8; write frame_ack 302.5; write focus 309.3

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 24.9; first stdout read resolved 30.7; write shutdown 37.9

Switch timeline (profile, switch-to-engine, ms after the window start): write create 51.7; first stdout read resolved 82.3; first frame applied (native receiver) 176.5; write frame_ack 177.5; write focus 186.1

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 33.9; first stdout read resolved 47.9; write shutdown 49.9

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 76, Renderer 34, DOM Worker 18, BgPool 6, WRRenderBackend 3, Compositor 3, WRSceneBuilder 3, SwComposite 2, IPC I/O 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 76 ms (30.9% of span): Layout 27, JavaScript 20, Idle 10, Graphics 7, DOM 7, Other 4
  - JS leaf 1 / native under JS 40 / native 36; buckets: ipc 76, paint_layout 35, gc_cc 30, array_buffer_copy 19, poll_wait 10, worker_messaging 10, harness_diagnostics 9, subprocess_pipe_io 6
  - top self: `poll [libc.so.6]` 10; `sendmsg [libc.so.6]` 4; `JS::CurrentGlobalOrNull(JSContext*) [libxul.so]` 4; `[axiosozo-dev]` 4; `mozilla::layers::ClipManager::DefineClipChain(mozilla::Displ` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3
  - WebRender/compositor threads: Renderer 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ClearTexSubImage [libxul.so]` 4); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__memset_avx2_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 18 ms: buckets subprocess_pipe_io 18, worker_messaging 18, ipc 18, js_ctypes 17, poll_wait 17, array_buffer_copy 0; top self: `poll [libc.so.6]` 17; `__lll_lock_wait [libc.so.6]` 0; `js::NativeObject::addProperty(JSContext*, JS::Hand` 0; `read [libc.so.6]` 0
- **tab:4175** CPU ms by thread group: main 39, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 39 ms (15.8% of span): Other 28, JavaScript 4, DOM 4, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 33; buckets: ipc 37, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 1
  - top self: `[]` 6; `[libfontconfig.so.1]` 4; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[libexpat.so.1]` 2; `icu_78::UnicodeString::cloneArrayIfNeeded(int, int, signed c` 2; `(anonymous namespace)::NameResolver::visit(js::frontend::Par` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3950** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (1.0% of span): Idle 1, Layout 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 1; `nsBlockFrame::ReflowDirtyLines(mozilla::BlockReflowState&) [` 1; `XPCJSContext::AfterProcessTask(unsigned int) [libxul.so]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4170** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 108, main 97, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 97 ms (4.5% of span): Idle 80, JavaScript 7, Other 7, DOM 2, Profiler 2
  - JS leaf 0 / native under JS 8 / native 89; buckets: ipc 97, poll_wait 82, harness_diagnostics 6, gc_cc 5, array_buffer_copy 5, memcpy_memset 2, subprocess_pipe_io 1, engine_stream_read 1
  - top self: `poll [libc.so.6]` 80; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `recvmsg [libc.so.6]` 1; `js::jit::CacheIRWriter::guardSpecificObject(js::jit::ObjOper` 1; `nsContentUtils::GetEventMessageAndAtomForListener(nsTSubstri` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 1
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, worker_messaging 108, ipc 108, js_ctypes 108, poll_wait 108, array_buffer_copy 0; top self: `poll [libc.so.6]` 108; `mozilla::dom::DedicatedWorkerGlobalScope_Binding::` 0
- **tab:4175** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4170** CPU ms by thread group: main 0, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.so]` 0; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInte` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3368** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 358, DOM Worker 282, Renderer 67, WRRenderBackend 37, SwComposite 36, BgPool 35, Compositor 34, other 32, ImageBridge 15, WRSceneBuilder 7, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 358 ms (11.3% of span): Idle 218, JavaScript 52, Other 36, GC / CC 35, DOM 13, Profiler 4
  - JS leaf 2 / native under JS 62 / native 294; buckets: ipc 358, poll_wait 234, gc_cc 93, engine_stream_read 29, worker_messaging 28, json_metadata 15, harness_diagnostics 14, array_buffer_copy 13
  - top self: `poll [libc.so.6]` 222; `[unknown]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4
  - GC/CC markers: GCMajor 1× 1041 ms, GCSlice 8× 31 ms, CCSlice 1× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 67 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `syscall [libc.so.6]` 4); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 1, `webrender::visibility::update_prim_visibility [lib` 0); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 35 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `IPC::ParamTraits<mozilla::layers::CompositableOper` 0, `__memset_avx2_unaligned_erms [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 282 ms: buckets subprocess_pipe_io 282, worker_messaging 282, ipc 282, js_ctypes 269, poll_wait 264, gc_cc 5; top self: `poll [libc.so.6]` 264; `[unknown]` 2; `js::gc::TenuringTracer::traceObject(JSObject*) [li` 1; `getcontext [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
- **tab:3950** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 0; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 0; `nsUrlClassifierStreamUpdater::AddRef() [libxul.so]` 0; `fog_custom_distribution_accumulate_single_sample [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 18 ms, GCSlice 3× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3955** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3420** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 0; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 270, main 180, Renderer 67, WRRenderBackend 37, SwComposite 36, Compositor 34, BgPool 34, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 180 ms (5.9% of span): Idle 100, JavaScript 50, Other 18, DOM 10, Profiler 2
  - JS leaf 7 / native under JS 46 / native 127; buckets: ipc 180, poll_wait 107, gc_cc 60, worker_messaging 34, engine_stream_read 25, json_metadata 18, subprocess_pipe_io 13, array_buffer_copy 10
  - top self: `poll [libc.so.6]` 102; `[unknown]` 9; `recvmsg [libc.so.6]` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `mprotect [libc.so.6]` 2; `js::jit::MacroAssemblerX86Shared::~MacroAssemblerX86Shared()` 2
  - WebRender/compositor threads: Renderer 67 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 54, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `syscall [libc.so.6]` 3); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 34, `sched_yield [libc.so.6]` 0, `webrender::visibility::update_prim_visibility [lib` 0); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 34 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 33, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 15 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 270 ms: buckets subprocess_pipe_io 270, worker_messaging 270, ipc 270, js_ctypes 255, poll_wait 251, gc_cc 10; top self: `poll [libc.so.6]` 251; `write [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3460** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 3, JavaScript 1, DOM 1
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 3; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBa` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `js::PromiseObject::allocationSite() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4175** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3441** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 430, DOM Worker 280, BgPool 61, Renderer 48, WRRenderBackend 28, Compositor 24, SwComposite 23, other 21, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 430 ms (20.2% of span): Idle 254, JavaScript 71, Other 48, DOM 17, GC / CC 16, Graphics 13
  - JS leaf 10 / native under JS 72 / native 348; buckets: ipc 429, poll_wait 316, gc_cc 85, paint_layout 41, worker_messaging 38, engine_stream_read 21, array_buffer_copy 19, json_metadata 16
  - top self: `poll [libc.so.6]` 256; `[unknown]` 14; `recvmsg [libc.so.6]` 9; `write [libc.so.6]` 6; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3
  - GC/CC markers: GCSlice 4× 8 ms, CCSlice 3× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 48 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 40, `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 28 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 1, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); SwComposite 23 ms (top self: `syscall [libc.so.6]` 23, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 61 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `write [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 280 ms: buckets subprocess_pipe_io 280, worker_messaging 280, ipc 280, js_ctypes 251, poll_wait 235, gc_cc 13; top self: `poll [libc.so.6]` 235; `[axiosozo-dev]` 7; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::ctypes::ArrayType::CreateInternal(JSContext*, ` 2
- **tab:3420** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3441** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3460** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 453, BgPool 365, DOM Worker 252, Renderer 55, other 35, SwComposite 17, Compositor 16, WRRenderBackend 14, WRWorker 12, WRSceneBuilder 9, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 453 ms (12.2% of span): Idle 165, JavaScript 74, GC / CC 66, Layout 43, Other 40, Graphics 28
  - JS leaf 14 / native under JS 123 / native 316; buckets: ipc 453, poll_wait 200, gc_cc 158, paint_layout 84, worker_messaging 70, engine_stream_read 37, subprocess_pipe_io 24, array_buffer_copy 18
  - top self: `poll [libc.so.6]` 166; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 17; `[axiosozo-dev]` 14; `[unknown]` 9; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 8; `__memset_avx2_unaligned_erms [libc.so.6]` 7
  - GC/CC markers: GCMajor 2× 1217 ms, GCSlice 16× 60 ms, CCSlice 3× 11 ms, GCMinor 2× 4 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 55 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 22, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 19, `__exp2f_fma [libm.so.6]` 2); SwComposite 17 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<false>(Texture&, IntRect const&, T` 0); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 11, `webrender::batch::AlphaBatchList::set_params_and_g` 0, `floorf [libxul.so]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 362 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 345, `write [libc.so.6]` 14, `close [libc.so.6]` 1); BackgroundThreadPool #2 3 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `mozilla::media::TimeUnit::Invalid() [libxul.so]` 0, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2)
  - busiest DOM Worker 252 ms: buckets subprocess_pipe_io 252, worker_messaging 252, ipc 252, js_ctypes 237, poll_wait 231, gc_cc 5; top self: `poll [libc.so.6]` 231; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::jit::JSJitFrameIter::ionScript() const [libxul` 1; `[unknown]` 1; `getcontext [libc.so.6]` 1
- **tab:3368** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, Other 1, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<ge` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::dom::CallbackObject::Release() [libxul.so]` 0; `mozilla::ipc::MessageChannel::RunMessage(mozilla::ipc::Actor` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - GC/CC markers: GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3955** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3460** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 48, Renderer 16, DOM Worker 11, BgPool 11, Compositor 3, WRSceneBuilder 2, WRRenderBackend 1, SwComposite 1, IPC I/O 0, Socket 0, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 49 ms (23.2% of span): Layout 16, JavaScript 11, Other 7, Idle 6, DOM 5, Profiler 3
  - JS leaf 1 / native under JS 28 / native 20; buckets: ipc 48, paint_layout 25, poll_wait 11, harness_diagnostics 9, array_buffer_copy 7, gc_cc 5, worker_messaging 3, json_metadata 2
  - top self: `poll [libc.so.6]` 7; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 4; `[libgtk-3.so.0]` 3; `core::ptr::drop_in_place<style::values::specified::border::B` 3; `SerializeJSONArray(JSContext*, JS::Handle<JSObject*>, (anony` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - WebRender/compositor threads: Renderer 16 ms (top self: `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 6, `hypotf@@GLIBC_2.35 [libm.so.6]` 2, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRRenderBackend#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 10 ms (top self: `unlink [libc.so.6]` 5, `rmdir [libc.so.6]` 3, `fstatat64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__lll_lock_wake [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 11, js_ctypes 10; top self: `poll [libc.so.6]` 10; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:3950** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.8% of span): Idle 3, Layout 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `PresShell::DoFlushPendingNotifications InterruptibleLayout` 0; `[libfreeblpriv3.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3368** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, other 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **socket:3357** CPU ms by thread group: main 0, IPC I/O 0, BgPool 0, Socket 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

