# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **124.2** (main 41.4, Renderer 41.4, DOM Worker 27.6, Backgro~Pool # 4.6, WRRende~ckend# 4.6) | AxioCEFProbe 36.8, cef:renderer 23.0, cef:utility 4.6, cef:gpu-process 4.6 | — | 161.3 |
| plain | idle | — | — | **6.3** (main 4.8, Timer 0.5, Socket Thread 0.5, IndexedDB IO # 0.5) | Web Content 3.4, AxioCEFProbe 2.5 | — | — |
| plain | raf | 60.0 | 22.3 | **29.5** (main 9.7, Renderer 4.2, Backgro~Pool # 3.2, SwComposite 3.2, DOM Worker 3.2) | cef:gpu-process 16.1, cef:renderer 11.9, AxioCEFProbe 9.0 | — | — |
| plain | raf-nosampler | — | — | **40.3** (main 10.6, Renderer 4.6, SwComposite 3.6, Backgro~Pool # 3.3, DOM Worker 3.3) | cef:gpu-process 17.2, cef:renderer 12.0, AxioCEFProbe 8.3, RDD Process 0.3 | — | — |
| plain | scroll | 60.0 | 23.0 | **48.3** (main 20.4, DOM Worker 8.3, Backgro~Pool # 5.8, Renderer 5.4, SwComposite 3.4) | cef:gpu-process 61.3, cef:renderer 14.6, AxioCEFProbe 14.1 | — | — |
| plain | key | — | — | **25.6** (main 11.5, DOM Worker 4.1, Renderer 3.0, TaskCon~ller # 1.6, SwComposite 1.1) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8 | 13.5 | — |
| plain | switch-to-gecko | — | — | **163.2** (IndexedDB IO # 39.4, main 33.8, DOM Worker 22.5, IPDL Background 16.9, Renderer 16.9) | Isolated Web Co 5.6 | — | 142.3 |
| trace | switch-to-engine | — | — | **162.7** (Renderer 69.1, main 39.5, DOM Worker 9.9, StreamTrans # 9.9, glean.dispatche 4.9) | AxioCEFProbe 44.3, cef:renderer 19.7, cef:utility 14.8, cef:gpu-process 4.9 | — | 152.5 |
| trace | idle | — | — | **6.2** (main 4.3, Timer 1.4, Socket Thread 0.5) | Web Content 3.4, AxioCEFProbe 3.4, cef:zygote 0.5 | — | — |
| trace | raf | 60.0 | 26.5 | **31.2** (main 10.3, Renderer 4.5, SwComposite 3.6, DOM Worker 3.2, Backgro~Pool # 2.9) | cef:gpu-process 17.5, cef:renderer 12.3, AxioCEFProbe 8.7, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **27.9** (main 7.3, Renderer 4.6, SwComposite 3.6, DOM Worker 3.6, Backgro~Pool # 3.6) | cef:gpu-process 17.9, cef:renderer 12.3, AxioCEFProbe 9.9 | — | — |
| trace | scroll | 60.2 | 22.4 | **49.2** (main 20.4, DOM Worker 7.8, Backgro~Pool # 5.8, Renderer 4.8, SwComposite 3.4) | cef:gpu-process 62.1, cef:renderer 14.6, AxioCEFProbe 11.7 | — | — |
| trace | key | — | — | **20.3** (main 10.4, Renderer 2.7, TaskCon~ller # 1.9, SwComposite 1.4, Timer 1.1) | cef:renderer 3.0, AxioCEFProbe 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 12.8 | — |
| trace | switch-to-gecko | — | — | **55.8** (main 24.8, Renderer 24.8, BgIOThr~Pool # 6.2) |  | — | 132.9 |
| profile | switch-to-engine | — | — | **119.7** (Renderer 43.8, main 39.9, WRRende~ckend# 8.0, Backgro~Pool # 8.0, DOM Worker 8.0) | Web Content 35.9, AxioCEFProbe 27.9, cef:renderer 23.9, cef:gpu-process 4.0 | — | 179.8 |
| profile | idle | — | — | **23.9** (SamplerThread 8.6, DOM Worker 7.2, main 6.7, Timer 1.4) | Web Content 9.6, AxioCEFProbe 4.3, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | raf | 60.0 | 21.0 | **55.4** (main 12.5, SamplerThread 11.9, DOM Worker 11.6, Renderer 5.1, Backgro~Pool # 3.5) | cef:gpu-process 18.4, cef:renderer 12.8, Web Content 9.3, AxioCEFProbe 9.3 | — | — |
| profile | raf-nosampler | — | — | **51.0** (DOM Worker 11.6, SamplerThread 10.9, main 7.9, Renderer 5.3, Backgro~Pool # 4.0) | cef:gpu-process 18.9, cef:renderer 13.2, Web Content 9.9, AxioCEFProbe 8.6 | — | — |
| profile | scroll | 60.0 | 21.4 | **77.7** (main 27.8, DOM Worker 16.3, SamplerThread 12.0, Backgro~Pool # 6.7, Renderer 4.8) | cef:gpu-process 66.3, cef:renderer 15.3, AxioCEFProbe 14.4, Web Content 10.1 | — | — |
| profile | key | — | — | **42.6** (main 12.8, SamplerThread 10.4, DOM Worker 9.3, Renderer 3.5, Timer 1.4) | Web Content 9.3, AxioCEFProbe 3.0, cef:renderer 2.5, WebExtensions 1.9 | 16.6 | — |
| profile | switch-to-gecko | — | — | **5.5** (SamplerThread 3.9, main 0.5, DOM Worker 0.4, Renderer 0.3, glean.dispatche 0.1) | Web Content 9.0, Privileged Cont 2.3, Isolated Web Co 2.1, WebExtensions 1.7 | — | 15025.4 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 8.2 | 0.0 | 0 | 0.0 | — | — | 18.8 | 0.0 | — | 5.34 | 1.94 | — | — | — | — | — | 0.016 |
| trace | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.32 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.32 | 0.12 | — | — | — | — | — | 0.009 |
| trace | scroll | 59.0 | 0.0 | 0 | 0.0 | — | — | 11.5 | 0.0 | — | 0.53 | 0.13 | — | — | — | — | — | 0.009 |
| trace | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 4.8 | 0.0 | — | 0.23 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 10.3 | 0.0 | 0 | 0.0 | — | — | 3.0 | 0.0 | — | 1.85 | 0.39 | — | — | — | — | — | 0.010 |
| profile | raf | 59.9 | 0.0 | 0 | 0.0 | — | — | 15.4 | 0.0 | — | 0.37 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 60.0 | 0.0 | 0 | 0.0 | — | — | 15.3 | 0.0 | — | 0.37 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.4 | 0.0 | 0 | 0.0 | — | — | 11.7 | 0.0 | — | 0.66 | 0.18 | — | — | — | — | — | 0.013 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 6.4 | 0.0 | — | 0.59 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 3 | 1.681 | 3.093 | 0.0209 | 0.0384 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.205 | 0.263 | 0.0123 | 0.0158 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.225 | 0.278 | 0.0135 | 0.0167 |
| plain | scroll | memfd | native | 121 | 121 | 0.473 | 0.533 | 0.0275 | 0.0311 |
| plain | key | memfd | native | 21 | 21 | 0.047 | 0.137 | 0.0003 | 0.0008 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 4.732 | 2.156 | 0.0390 | 0.0178 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 187 | 187 | 0.214 | 0.274 | 0.0128 | 0.0164 |
| trace | raf-nosampler | memfd | native | 182 | 182 | 0.221 | 0.267 | 0.0132 | 0.0160 |
| trace | scroll | memfd | native | 123 | 123 | 0.458 | 0.520 | 0.0270 | 0.0307 |
| trace | key | memfd | native | 21 | 21 | 0.041 | 0.133 | 0.0002 | 0.0008 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 3 | 3 | 2.297 | 3.419 | 0.0237 | 0.0353 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.231 | 0.305 | 0.0139 | 0.0184 |
| profile | raf-nosampler | memfd | native | 183 | 183 | 0.236 | 0.307 | 0.0141 | 0.0184 |
| profile | scroll | memfd | native | 123 | 123 | 0.532 | 0.601 | 0.0311 | 0.0351 |
| profile | key | memfd | native | 21 | 21 | 0.046 | 0.211 | 0.0003 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.6 | 8.3 | 0.0 | — | 0.23 | 0.41 | — | — | 10.1 | 9.3 | 19.3 |
| profile | 0.8 | 11.4 | 0.0 | — | 0.51 | 0.88 | — | — | 9.7 | 13.6 | 23.0 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 51.3; first stdout read resolved 52.9; first frame applied (native receiver) 186.1; write frame_ack 189.8; write focus 196.1

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 24.4; first stdout read resolved 31.7; write shutdown 34.8

Switch timeline (profile, switch-to-engine, ms after the window start): write create 57.6; first stdout read resolved 74.1; first frame applied (native receiver) 203.9; write frame_ack 206.1; write focus 219.2

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 31.9; first stdout read resolved 44.8; write shutdown 47.3

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: main 97, Renderer 94, DOM Worker 15, BgPool 10, SwComposite 9, WRRenderBackend 5, Compositor 4, WRSceneBuilder 3, IPC I/O 3, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 97 ms (33.7% of span): JavaScript 23, Layout 21, DOM 19, GC / CC 10, Graphics 9, Idle 8
  - JS leaf 5 / native under JS 44 / native 48; buckets: ipc 97, gc_cc 44, paint_layout 34, array_buffer_copy 15, harness_diagnostics 14, poll_wait 11, worker_messaging 10, engine_stream_read 8
  - top self: `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 10; `[axiosozo-dev]` 10; `poll [libc.so.6]` 8; `mozilla::dom::Element_Binding::setAttribute(JSContext*, JS::` 5; `mozilla::dom::PerformanceMainThread::CreationTimeStamp() con` 5; `__memmove_avx_unaligned_erms [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 9 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 95 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 25, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 21, `hypotf@@GLIBC_2.35 [libm.so.6]` 12); SwComposite 9 ms (top self: `syscall [libc.so.6]` 9); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 3, `syscall [libc.so.6]` 2, `webrender::resource_cache::ResourceCache::discard_` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 10 ms (top self: `__memmove_avx_unaligned_erms [libc.so.6]` 6, `__memset_avx2_unaligned_erms [libc.so.6]` 2, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, js_ctypes 15, worker_messaging 15, ipc 15, poll_wait 15, gc_cc 0; top self: `poll [libc.so.6]` 15; `js::NativeObject::create(JSContext*, js::gc::Alloc` 0
- **tab:4217** CPU ms by thread group: main 52, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 52 ms (19.9% of span): Other 36, JavaScript 6, Profiler 5, DOM 3, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 5 / native 47; buckets: ipc 44, array_buffer_copy 15, gc_cc 13, subprocess_pipe_io 3, poll_wait 1
  - top self: `sendmsg [libc.so.6]` 6; `__lll_lock_wake [libc.so.6]` 5; `[]` 4; `[libfontconfig.so.1]` 4; `GetExistingDataProperty(JSContext*, JS::Handle<js::NativeObj` 3; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4222** CPU ms by thread group: main 48, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (16.9% of span): Other 40, Profiler 4, DOM 2, JavaScript 2, GC / CC 0, Idle 0
  - JS leaf 1 / native under JS 2 / native 45; buckets: ipc 37, array_buffer_copy 17, gc_cc 11, subprocess_pipe_io 5, poll_wait 1, memcpy_memset 1
  - top self: `__strlen_avx2 [libc.so.6]` 4; `[libexpat.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `__read_nocancel [libc.so.6]` 3; `[libgcc_s.so.1]` 2
  - GC/CC markers: GCMinor 1× 6 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4030** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.0% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, ipc 2
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsINode::GetRelevantGlobal() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 119, DOM Worker 97, other 19, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 119 ms (5.6% of span): Idle 98, Other 8, JavaScript 8, GC / CC 2, DOM 1, Profiler 1
  - JS leaf 0 / native under JS 10 / native 109; buckets: ipc 119, poll_wait 104, harness_diagnostics 9, gc_cc 5, array_buffer_copy 5, json_metadata 1, worker_messaging 0, native_receiver 0
  - top self: `poll [libc.so.6]` 99; `recvmsg [libc.so.6]` 4; `[axiosozo-dev]` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 1; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1; `mozilla::dom::AddEventListenerOptions::Init(mozilla::dom::Bi` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 90 ms: buckets subprocess_pipe_io 90, worker_messaging 90, ipc 90, js_ctypes 89, poll_wait 89, gc_cc 1; top self: `poll [libc.so.6]` 89; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:3508** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ipc::PortLink::SendMessage(std::unique_ptr<IPC::Mes` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4035** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, paint_layout 0
  - top self: `poll [libc.so.6]` 0; `nsRefreshDriver::GetIdleDeadlineHint(mozilla::TimeStamp, nsR` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 360, DOM Worker 268, Renderer 150, SwComposite 107, BgPool 106, WRRenderBackend 54, Compositor 40, other 30, ImageBridge 17, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 360 ms (11.5% of span): Idle 235, JavaScript 65, Other 44, DOM 12, Profiler 3, GC / CC 2
  - JS leaf 8 / native under JS 68 / native 285; buckets: ipc 360, poll_wait 256, gc_cc 62, worker_messaging 31, engine_stream_read 30, json_metadata 15, harness_diagnostics 14, subprocess_pipe_io 13
  - top self: `poll [libc.so.6]` 239; `[unknown]` 11; `recvmsg [libc.so.6]` 9; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*` 3; `write [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 150 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 96, `__memmove_avx_unaligned_erms [libc.so.6]` 31, `syscall [libc.so.6]` 7); SwComposite 107 ms (top self: `syscall [libc.so.6]` 91, `__memmove_avx_unaligned_erms [libc.so.6]` 15, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 106 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 89, `__memmove_avx_unaligned_erms [libc.so.6]` 15, `[linux-vdso.so.1]` 1); ImageBridgeChld 17 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `mozilla::ipc::MessageChannel::MessageTask::~Messag` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 250, poll_wait 244, gc_cc 9; top self: `poll [libc.so.6]` 244; `[unknown]` 3; `mozilla::CycleCollectedJSRuntime::JSObjectsTenured` 2; `[axiosozo-dev]` 2; `write [libc.so.6]` 1
- **tab:3547** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 11 ms (0.4% of span): GC / CC 8, Idle 3, Profiler 0
  - JS leaf 0 / native under JS 0 / native 11; buckets: ipc 10, gc_cc 8, poll_wait 4, memcpy_memset 0
  - top self: `poll [libc.so.6]` 3; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Scope*) ` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `CheckParticipatesInCycleCollection(JS::GCCellPtr, char const` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<1u> >::onShapeE` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 1
  - GC/CC markers: GCMajor 1× 26 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3455** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 10 ms (0.3% of span): GC / CC 8, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: ipc 9, gc_cc 8, poll_wait 3
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 6; `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `JS::GCThingTraceKind(void*) [libxul.so]` 1; `[]` 0
  - GC/CC markers: GCMajor 1× 26 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `js::TypedRootedTraceableBase<js::PersistentRootedTraceableBa` 0; `__lll_lock_wait [libc.so.6]` 0; `nsTHashtable<nsBaseHashtableET<nsGenericHashKey<mojo::core::` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 263, main 225, Renderer 149, SwComposite 106, BgPool 106, WRRenderBackend 53, Compositor 42, ImageBridge 18, WRSceneBuilder 9, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 225 ms (7.4% of span): Idle 128, JavaScript 57, Other 21, DOM 16, Profiler 2, GC / CC 0
  - JS leaf 8 / native under JS 60 / native 157; buckets: ipc 225, poll_wait 140, gc_cc 72, worker_messaging 36, engine_stream_read 35, json_metadata 18, native_receiver 13, subprocess_pipe_io 11
  - top self: `poll [libc.so.6]` 130; `[unknown]` 12; `recvmsg [libc.so.6]` 5; `write [libc.so.6]` 4; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 2; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 2
  - WebRender/compositor threads: Renderer 149 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 95, `__memmove_avx_unaligned_erms [libc.so.6]` 35, `syscall [libc.so.6]` 7); SwComposite 106 ms (top self: `syscall [libc.so.6]` 90, `__memmove_avx_unaligned_erms [libc.so.6]` 13, `void scale_blit<true>(Texture&, IntRect const&, Te` 3); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 46, `webrender::picture::PictureInstance::take_context ` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 104 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 86, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `axio::SinkState::CopyRect(unsigned char*, unsigned` 1); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 17, `[axiosozo-dev]` 0, `mozilla::detail::MutexImpl::unlock() [axiosozo-dev` 0); BgIOThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1, `sendfile64 [libc.so.6]` 0)
  - busiest DOM Worker 263 ms: buckets subprocess_pipe_io 263, worker_messaging 263, ipc 263, js_ctypes 243, poll_wait 239, gc_cc 11; top self: `poll [libc.so.6]` 238; `xpc::NativeGlobal(JSObject*) [libxul.so]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `[axiosozo-dev]` 2; `[unknown]` 1
- **tab:4035** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3529** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 533, DOM Worker 283, BgPool 135, Renderer 95, SwComposite 60, WRRenderBackend 35, Compositor 28, other 22, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 533 ms (25.3% of span): Idle 280, JavaScript 110, Other 67, DOM 30, Graphics 26, Layout 12
  - JS leaf 11 / native under JS 127 / native 396; buckets: ipc 533, poll_wait 368, gc_cc 115, paint_layout 67, worker_messaging 50, engine_stream_read 31, array_buffer_copy 29, harness_diagnostics 25
  - top self: `poll [libc.so.6]` 284; `[unknown]` 17; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 10; `[axiosozo-dev]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 6
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 95 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 64, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `syscall [libc.so.6]` 10); SwComposite 60 ms (top self: `syscall [libc.so.6]` 57, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 5, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 135 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 92, `__memmove_avx_unaligned_erms [libc.so.6]` 40, `[linux-vdso.so.1]` 1); ImageBridgeChld 12 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 283 ms: buckets subprocess_pipe_io 283, worker_messaging 283, ipc 283, js_ctypes 258, poll_wait 251, gc_cc 7; top self: `poll [libc.so.6]` 251; `[axiosozo-dev]` 4; `[linux-vdso.so.1]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2; `getcontext [libc.so.6]` 1
- **tab:4035** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4217** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3547** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 430, DOM Worker 232, Renderer 123, SwComposite 52, other 36, WRRenderBackend 19, Compositor 17, WRWorker 13, WRSceneBuilder 9, BgPool 6, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 430 ms (11.6% of span): Idle 191, JavaScript 93, Layout 49, Other 35, Graphics 27, DOM 22
  - JS leaf 15 / native under JS 145 / native 270; buckets: ipc 430, poll_wait 233, gc_cc 100, paint_layout 89, worker_messaging 73, engine_stream_read 46, array_buffer_copy 19, harness_diagnostics 18
  - top self: `poll [libc.so.6]` 195; `[unknown]` 18; `recvmsg [libc.so.6]` 6; `[axiosozo-dev]` 6; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 5; `write [libc.so.6]` 4
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 123 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 37, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 15, `hypotf@@GLIBC_2.35 [libm.so.6]` 14); SwComposite 52 ms (top self: `syscall [libc.so.6]` 28, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `void scale_blit<false>(Texture&, IntRect const&, T` 3); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 16, `core::hash::BuildHasher::hash_one [libxul.so]` 0, `webrender::render_task_graph::RenderTaskGraphBuild` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 232 ms: buckets subprocess_pipe_io 232, worker_messaging 232, ipc 232, js_ctypes 219, poll_wait 212, gc_cc 9; top self: `poll [libc.so.6]` 212; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3455** CPU ms by thread group: main 8, IPC I/O 2, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): Idle 6, DOM 1, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 1 / native 7; buckets: ipc 8, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0; `WritePadding(mozilla::BufferList<InfallibleAllocPolicy>&, un` 0; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3547** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: BgPool 365, main 65, DOM Worker 62, Renderer 58, IPC I/O 6, SwComposite 4, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, other 2, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (0.4% of span): Idle 20, JavaScript 15, Layout 9, DOM 7, Other 6, Profiler 4
  - JS leaf 1 / native under JS 29 / native 35; buckets: ipc 64, poll_wait 21, gc_cc 16, paint_layout 16, array_buffer_copy 13, harness_diagnostics 9, memcpy_memset 4, worker_messaging 4
  - top self: `poll [libc.so.6]` 21; `[unknown]` 3; `nsContainerFrame::ReflowChild(nsIFrame*, nsPresContext*, moz` 2; `[axiosozo-dev]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::ObjectFuse::tryOptimizeConstantProperty(JS::PropertyKey,` 2
  - GC/CC markers: CCSlice 1× 5 ms, GCMinor 3× 1 ms
  - WebRender/compositor threads: Renderer 58 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 21, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 13, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 10); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `webrender::image_source::resolve_image [libxul.so]` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 365 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 335, `write [libc.so.6]` 11, `unlink [libc.so.6]` 7); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #5 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 62 ms: buckets subprocess_pipe_io 62, worker_messaging 62, ipc 62, gc_cc 52, poll_wait 9, js_ctypes 8; top self: `poll [libc.so.6]` 8; `madvise [libc.so.6]` 7; `std::unique_ptr<mozilla::ProfileBufferChunk, std::` 6; `SnowWhiteKiller::MaybeKillObject(SnowWhiteKiller::` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:3547** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.0% of span): Idle 4, JavaScript 2, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: ipc 7, poll_wait 5, gc_cc 2, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::DefineAccessorProperty(JSContext*, JS::Handle<JSObject*>` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::He` 0; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifI` 0; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3508** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `PR_GetCurrentThread [libnspr4.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4030** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.0% of span): Idle 3, Graphics 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, paint_layout 0
  - top self: `poll [libc.so.6]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 0; `nsLayoutUtils::GetCumulativeApzCallbackTransform(nsIFrame*) ` 0; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `Pickle::ReadBytesInto(PickleIterator*, void*, unsigned int) ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

