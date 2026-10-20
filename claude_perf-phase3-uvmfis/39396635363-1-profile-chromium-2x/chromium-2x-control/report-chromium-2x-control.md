# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x-control (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **97.1** (main 34.5, Renderer 31.4, DOM Worker 9.4, TaskCon~ller # 6.3, glean.dispatche 3.1) | AxioCEFProbe 50.2, cef:gpu-process 25.1, cef:zygote 6.3, cef:renderer 6.3 | — | 298.2 |
| plain | idle | — | — | **2.5** (main 1.5, Timer 0.5, TaskCon~ller # 0.5) | Web Content 2.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 59.9 | 20.7 | **37.2** (Renderer 12.5, SwComposite 11.2, main 5.2, Backgro~Pool # 2.6, DOM Worker 2.3) | cef:gpu-process 9.6, AxioCEFProbe 7.2, cef:renderer 6.6, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **37.3** (Renderer 13.3, SwComposite 12.0, main 3.7, Backgro~Pool # 3.0, DOM Worker 2.0) | cef:gpu-process 10.3, AxioCEFProbe 8.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.2 | 21.1 | **58.5** (Renderer 14.5, main 12.0, SwComposite 12.0, Backgro~Pool # 7.5, DOM Worker 7.0) | cef:gpu-process 43.5, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.9** (main 4.7, Renderer 1.9, SwComposite 1.7, DOM Worker 1.4, glean.dispatche 0.3) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 8.7 | — |
| plain | switch-to-gecko | — | — | **41.8** (main 20.9, Renderer 13.9, Compositor 7.0) |  | — | 125.9 |
| plain | switch-to-engine | — | — | **97.1** (main 34.5, Renderer 31.4, DOM Worker 9.4, TaskCon~ller # 6.3, glean.dispatche 3.1) | AxioCEFProbe 50.2, cef:gpu-process 25.1, cef:zygote 6.3, cef:renderer 6.3 | — | 298.2 |
| plain | idle | — | — | **2.5** (main 1.5, Timer 0.5, TaskCon~ller # 0.5) | Web Content 2.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 59.9 | 20.7 | **37.2** (Renderer 12.5, SwComposite 11.2, main 5.2, Backgro~Pool # 2.6, DOM Worker 2.3) | cef:gpu-process 9.6, AxioCEFProbe 7.2, cef:renderer 6.6, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **37.3** (Renderer 13.3, SwComposite 12.0, main 3.7, Backgro~Pool # 3.0, DOM Worker 2.0) | cef:gpu-process 10.3, AxioCEFProbe 8.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.2 | 21.1 | **58.5** (Renderer 14.5, main 12.0, SwComposite 12.0, Backgro~Pool # 7.5, DOM Worker 7.0) | cef:gpu-process 43.5, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.9** (main 4.7, Renderer 1.9, SwComposite 1.7, DOM Worker 1.4, glean.dispatche 0.3) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 8.7 | — |
| plain | switch-to-gecko | — | — | **41.8** (main 20.9, Renderer 13.9, Compositor 7.0) |  | — | 125.9 |
| profile | switch-to-engine | — | — | **54.5** (main 19.0, Renderer 14.2, DOM Worker 9.5, WRRende~ckend# 4.7, SamplerThread 4.7) | Web Content 66.4, AxioCEFProbe 49.8, cef:gpu-process 18.9, cef:renderer 7.1 | — | 396.7 |
| profile | idle | — | — | **23.0** (main 7.3, DOM Worker 5.9, SamplerThread 5.4, TaskCon~ller # 2.9, IPC I/O Parent 0.5) | Web Content 3.9, WebExtensions 1.0, Isolated Web Co 1.0, AxioCEFProbe 0.5 | — | — |
| profile | raf | 59.7 | 21.3 | **61.7** (Renderer 13.8, SwComposite 11.8, DOM Worker 10.8, main 8.9, SamplerThread 8.5) | cef:gpu-process 9.2, cef:renderer 7.2, AxioCEFProbe 7.1, Web Content 6.2 | — | — |
| profile | raf-nosampler | — | — | **55.0** (Renderer 13.6, SwComposite 11.6, DOM Worker 9.6, SamplerThread 7.6, main 5.0) | cef:gpu-process 9.9, AxioCEFProbe 8.0, cef:renderer 6.7, Web Content 6.3 | — | — |
| profile | scroll | 60.3 | 22.8 | **81.9** (main 17.9, Renderer 15.5, DOM Worker 13.5, SwComposite 13.0, Backgro~Pool # 8.5) | cef:gpu-process 44.9, AxioCEFProbe 12.5, cef:renderer 10.5, Web Content 5.0 | — | — |
| profile | key | — | — | **26.4** (main 7.8, DOM Worker 6.6, SamplerThread 6.1, Renderer 2.2, Timer 1.4) | Web Content 4.7, AxioCEFProbe 1.7, cef:renderer 1.5, Privileged Cont 1.4 | 10.5 | — |
| profile | switch-to-gecko | — | — | **78.0** (main 19.5, Renderer 19.5, WRScene~ilder# 6.5, WRRende~ckend# 6.5, Compositor 6.5) |  | — | 131.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 4.6 | 0.0 | 0 | 0.0 | — | — | 19.5 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf | 59.7 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | raf-nosampler | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | scroll | 59.5 | 0.0 | 0 | 0.0 | — | — | 9.7 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 2.8 | 0.0 | — | — | — | — | — | — | — | — | 0.000 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.982 | 3.504 | 0.0120 | 0.0212 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.146 | 0.248 | 0.0087 | 0.0149 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.167 | 0.286 | 0.0100 | 0.0172 |
| plain | scroll | memfd | native | 119 | 119 | 0.561 | 0.691 | 0.0331 | 0.0409 |
| plain | key | memfd | native | 21 | 21 | 0.072 | 0.212 | 0.0004 | 0.0012 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.982 | 3.504 | 0.0120 | 0.0212 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.146 | 0.248 | 0.0087 | 0.0149 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.167 | 0.286 | 0.0100 | 0.0172 |
| plain | scroll | memfd | native | 119 | 119 | 0.561 | 0.691 | 0.0331 | 0.0409 |
| plain | key | memfd | native | 21 | 21 | 0.072 | 0.212 | 0.0004 | 0.0012 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.472 | 3.147 | 0.0114 | 0.0145 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 183 | 183 | 0.145 | 0.275 | 0.0087 | 0.0164 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.168 | 0.312 | 0.0101 | 0.0188 |
| profile | scroll | memfd | native | 120 | 120 | 0.647 | 0.807 | 0.0385 | 0.0480 |
| profile | key | memfd | native | 21 | 21 | 0.074 | 0.220 | 0.0004 | 0.0013 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.3 | 5.7 | 0.0 | — | — | — | — | — | — | — | — |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 31.3; spawn AxioCEFProbe resolved 67.4; write hello 68.4; first stdout read resolved 276.9; write create 280.5; write frame_ack 405.0; write focus 413.2

Switch timeline (profile, switch-to-gecko, ms after the window start): first stdout read resolved -1.4; write close 18.2; write shutdown 30.2

### Profile: chromium-2x-control / switch-to-engine

- **parent** CPU ms by thread group: Renderer 63, main 60, DOM Worker 41, BgPool 10, SwComposite 8, WRRenderBackend 5, Compositor 4, IPC I/O 3, WRSceneBuilder 3, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 60 ms (13.8% of span): JavaScript 25, Layout 16, Idle 11, Graphics 4, DOM 2, Other 1
  - JS leaf 1 / native under JS 30 / native 29; buckets: ipc 60, paint_layout 24, gc_cc 17, poll_wait 12, worker_messaging 9, array_buffer_copy 9, harness_diagnostics 8, subprocess_pipe_io 7
  - top self: `poll [libc.so.6]` 11; `style::properties::generated::longhands::corner_bottom_left_` 4; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 3; `js::jit::CacheIRWriter::addStubField(unsigned long, js::jit:` 2; `nsGridContainerFrame::GridItemInfo::GridItemInfo(nsIFrame*, ` 2
  - WebRender/compositor threads: Renderer 63 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `int blendTextureNearestFast<true, glsl::sampler2D_` 9); SwComposite 7 ms (top self: `syscall [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 5 ms (top self: `sched_yield [libc.so.6]` 4, `webrender::batch::AlphaBatchBuilder::set_params_an` 1, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ARGBSetRow_X86 [libxul.so]` 3, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 41 ms: buckets subprocess_pipe_io 41, worker_messaging 41, ipc 41, poll_wait 22, js_ctypes 22, array_buffer_copy 11; top self: `poll [libc.so.6]` 21; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 10; `js::BoundFunctionObject::call(JSContext*, unsigned` 2; `[linux-vdso.so.1]` 2; `[axiosozo-dev]` 1
- **tab:5142** CPU ms by thread group: main 37, IPC I/O 1, BgPool 0, other 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (10.8% of span): Other 31, DOM 4, JavaScript 1, Idle 1, Profiler 1, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 33; buckets: ipc 29, gc_cc 10, array_buffer_copy 10, subprocess_pipe_io 6, memcpy_memset 6, canvas_2d 3, poll_wait 1
  - top self: `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 3; `sk_malloc_flags(unsigned long, unsigned int) [libxul.so]` 3; `[]` 3; `mozilla::Vector<js::wasm::CallSiteTarget, 0ul, js::SystemAll` 2; `connect [libc.so.6]` 1; `nsZipArchive::GetDataOffset(nsZipItem*) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5140** CPU ms by thread group: main 37, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 37 ms (13.0% of span): Other 30, JavaScript 3, DOM 2, Idle 1, Profiler 0, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 28, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 4, memcpy_memset 1, poll_wait 1
  - top self: `__strlen_evex [libc.so.6]` 3; `[]` 3; `syscall [libc.so.6]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `getdents64 [libc.so.6]` 1; `[libexpat.so.1]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5031** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.7% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / idle

- **parent** CPU ms by thread group: main 134, DOM Worker 63, other 12, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0
  - main thread 135 ms (6.6% of span): GC / CC 62, Idle 61, Other 5, JavaScript 5, DOM 2, Profiler 0
  - JS leaf 0 / native under JS 6 / native 128; buckets: ipc 135, poll_wait 67, gc_cc 64, harness_diagnostics 6, array_buffer_copy 4, native_receiver 1, memcpy_memset 1, json_metadata 0
  - top self: `poll [libc.so.6]` 61; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `recvmsg [libc.so.6]` 3; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 3
  - GC/CC markers: GCMajor 2× 1089 ms, GCSlice 15× 53 ms, CCSlice 5× 12 ms, GCMinor 2× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0); WRWorkerLP#2 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 0 ms (top self: `munmap [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 63 ms: buckets subprocess_pipe_io 63, js_ctypes 63, worker_messaging 63, ipc 63, poll_wait 63; top self: `poll [libc.so.6]` 63
- **tab:5140** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `mozilla::detail::RunnableFunction<mozilla::TaskController::T` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5142** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Other 0, Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `fog_serialize_ipc_buf [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4546** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf

- **parent** CPU ms by thread group: Renderer 402, SwComposite 354, DOM Worker 251, main 244, BgPool 81, WRRenderBackend 38, Compositor 27, other 24, ImageBridge 11, WRSceneBuilder 4, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 244 ms (8.0% of span): Idle 184, JavaScript 36, Other 18, DOM 4, Profiler 2
  - JS leaf 5 / native under JS 33 / native 206; buckets: ipc 243, poll_wait 191, gc_cc 31, engine_stream_read 17, worker_messaging 15, harness_diagnostics 10, subprocess_pipe_io 9, json_metadata 8
  - top self: `poll [libc.so.6]` 185; `[unknown]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 3; `write [libc.so.6]` 2; `recvmsg [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 402 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 150, `int blendTextureNearestFast<false, glsl::sampler2D` 109, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 50); SwComposite 354 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 172, `syscall [libc.so.6]` 150, `__memmove_avx512_unaligned_erms [libc.so.6]` 28); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 34, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 80 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx512_unaligned_erms [libc.so.6]` 13, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `[linux-vdso.so.1]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 1 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0)
  - busiest DOM Worker 251 ms: buckets subprocess_pipe_io 251, worker_messaging 251, ipc 251, js_ctypes 193, poll_wait 189, gc_cc 47; top self: `poll [libc.so.6]` 189; `madvise [libc.so.6]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 5; `mozilla::cyclecollector::DropJSObjectsWithKeyImpl(` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
- **tab:5031** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 2, ipc 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `non-virtual thunk to ExpirationTrackerImpl<gfxFont, 3u, mozi` 0
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 3× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5036** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4546** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `poll [libc.so.6]` 0; `g_main_context_iteration [libglib-2.0.so.0]` 0; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 396, SwComposite 352, DOM Worker 206, main 129, BgPool 90, WRRenderBackend 38, Compositor 28, ImageBridge 11, WRSceneBuilder 5, other 2, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 129 ms (4.3% of span): Idle 86, JavaScript 26, Other 9, DOM 5, GC / CC 2, Profiler 1
  - JS leaf 3 / native under JS 25 / native 101; buckets: ipc 129, poll_wait 92, gc_cc 34, engine_stream_read 20, worker_messaging 17, subprocess_pipe_io 8, json_metadata 8, array_buffer_copy 5
  - top self: `poll [libc.so.6]` 87; `[unknown]` 6; `recvmsg [libc.so.6]` 2; `js::GenericTracerImpl<js::gc::MinorSweepingTracer>::onString` 1; `mprotect [libc.so.6]` 1; `Subprocess.call/</stdout.read ([System Principal]:66:32)[0]` 1
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 396 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 135, `int blendTextureNearestFast<false, glsl::sampler2D` 118, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 43); SwComposite 352 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 170, `syscall [libc.so.6]` 147, `__memmove_avx512_unaligned_erms [libc.so.6]` 35); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 36, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 90 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 71, `__memmove_avx512_unaligned_erms [libc.so.6]` 16, `mozilla::layers::ImageContainer::SetCurrentImages(` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 206 ms: buckets subprocess_pipe_io 206, worker_messaging 206, ipc 206, js_ctypes 186, poll_wait 182, gc_cc 7; top self: `poll [libc.so.6]` 182; `[unknown]` 3; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::NewTypedArrayWithTemplateAndBuffer(JSContext*,` 1
- **tab:5140** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4528** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5036** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / scroll

- **parent** CPU ms by thread group: main 329, Renderer 293, SwComposite 250, DOM Worker 227, BgPool 166, WRRenderBackend 27, Compositor 18, other 15, ImageBridge 7, WRSceneBuilder 3, Socket 1, IPC I/O 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 329 ms (16.3% of span): Idle 231, JavaScript 41, Other 28, DOM 15, Profiler 5, Graphics 4
  - JS leaf 1 / native under JS 54 / native 273; buckets: ipc 328, poll_wait 255, gc_cc 46, worker_messaging 29, subprocess_pipe_io 17, json_metadata 16, engine_stream_read 15, paint_layout 13
  - top self: `poll [libc.so.6]` 232; `[unknown]` 10; `write [libc.so.6]` 4; `recvmsg [libc.so.6]` 2; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 293 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 150, `int blendTextureNearestFast<false, glsl::sampler2D` 49, `void scale_blit<true>(Texture&, IntRect const&, Te` 27); SwComposite 250 ms (top self: `syscall [libc.so.6]` 159, `void scale_blit<true>(Texture&, IntRect const&, Te` 82, `__memmove_avx512_unaligned_erms [libc.so.6]` 9); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 24, `sched_yield [libc.so.6]` 2, `alloc::raw_vec::RawVec<T,A>::grow_one [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 166 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 84, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 80, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 227 ms: buckets subprocess_pipe_io 227, worker_messaging 226, ipc 226, js_ctypes 213, poll_wait 208, gc_cc 5; top self: `poll [libc.so.6]` 208; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::Nursery::wantEagerCollection() const [libxul.s` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:4546** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5036** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:5140** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / key

- **parent** CPU ms by thread group: main 252, DOM Worker 151, Renderer 62, SwComposite 54, other 23, Compositor 9, WRRenderBackend 7, BgPool 6, WRSceneBuilder 5, IPC I/O 1, ImageBridge 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 252 ms (7.0% of span): Idle 123, JavaScript 57, Layout 20, Graphics 15, Other 15, Profiler 11
  - JS leaf 5 / native under JS 81 / native 166; buckets: ipc 251, poll_wait 137, gc_cc 68, worker_messaging 54, paint_layout 41, engine_stream_read 28, subprocess_pipe_io 13, array_buffer_copy 9
  - top self: `poll [libc.so.6]` 123; `[unknown]` 16; `__lll_lock_wait [libc.so.6]` 3; `write [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.s` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 62 ms (top self: `int blendTextureNearestFast<false, glsl::sampler2D` 21, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 9); SwComposite 54 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 26, `syscall [libc.so.6]` 22, `__memmove_avx512_unaligned_erms [libc.so.6]` 5); WRRenderBackend#0 7 ms (top self: `syscall [libc.so.6]` 6, `mozilla::TimeStamp::Now(bool) [axiosozo-dev]` 0, `webrender::render_task_graph::RenderTaskGraph::res` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `__memmove_avx512_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 151 ms: buckets subprocess_pipe_io 151, worker_messaging 151, ipc 151, js_ctypes 143, poll_wait 140, gc_cc 3; top self: `poll [libc.so.6]` 140; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 1; `[axiosozo-dev]` 1; `getcontext [libc.so.6]` 1; `mozilla::dom::MessageEvent_Binding::get_data(JSCon` 1
- **tab:4456** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 4, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sy` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4528** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `XRE_GetAsyncIOEventTarget() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4507** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: main 32, Renderer 32, DOM Worker 7, SwComposite 3, BgPool 2, WRRenderBackend 2, Compositor 1, WRSceneBuilder 1, Socket 0, IPC I/O 0, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 32 ms (19.6% of span): JavaScript 11, Layout 9, Graphics 4, Idle 3, DOM 3, Other 1
  - JS leaf 0 / native under JS 20 / native 13; buckets: ipc 32, paint_layout 16, harness_diagnostics 8, gc_cc 7, array_buffer_copy 6, worker_messaging 4, poll_wait 3, engine_stream_read 2
  - top self: `webrender_api::display_list::DisplayListBuilder::push_refere` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `poll [libc.so.6]` 3; `js::RegExpStatics::updateFromMatchPairs(JSContext*, JSLinear` 2; `nsStyleUI::CalcDifference(nsStyleUI const&) const [libxul.so` 2; `mozilla::dom::Range_Binding::Wrap(JSContext*, nsRange*, nsWr` 1
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 4, `ps_quad_textured_TEXTURE_2D_frag::read_interp_inpu` 3); SwComposite 3 ms (top self: `syscall [libc.so.6]` 3); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `hashbrown::rustc_entry::<impl hashbrown::map::Hash` 0, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 2 ms (top self: `unlink [libc.so.6]` 2, `getdents64 [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `mozilla::ipc::MessageChannel::SendMessageToLink(st` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, poll_wait 7, js_ctypes 6; top self: `poll [libc.so.6]` 6; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1
- **tab:5031** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.9% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4456** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4528** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

