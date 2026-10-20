# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **131.6** (Renderer 82.8, main 34.1, Backgro~Pool # 4.9, WRScene~ilder# 4.9, SwComposite 4.9) | cef:gpu-process 34.0, AxioCEFProbe 29.3, cef:renderer 14.6, cef:utility 9.8 | — | 176.7 |
| plain | idle | — | — | **3.0** (main 2.0, Timer 0.5, DOM Worker 0.5) | Web Content 1.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.1 | 22.2 | **26.3** (main 7.9, DOM Worker 4.6, Renderer 3.0, SwComposite 2.6, Backgro~Pool # 2.3) | cef:gpu-process 8.8, AxioCEFProbe 7.2, cef:renderer 6.3 | — | — |
| plain | raf-nosampler | — | — | **19.3** (main 4.3, Renderer 3.3, DOM Worker 2.7, SwComposite 2.7, Backgro~Pool # 2.7) | cef:gpu-process 10.6, AxioCEFProbe 7.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.3 | 22.8 | **34.5** (main 12.5, Backgro~Pool # 7.5, DOM Worker 5.5, Renderer 3.5, SwComposite 2.5) | cef:gpu-process 42.6, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.6** (main 4.4, Renderer 1.9, DOM Worker 1.4, SwComposite 1.1, Timer 0.6) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 9.2 | — |
| plain | switch-to-gecko | — | — | **81.4** (main 29.6, Renderer 22.2, TaskCon~ller # 14.8, BgIOThr~Pool # 7.4, WRRende~ckend# 7.4) |  | — | 121.6 |
| plain | switch-to-engine | — | — | **131.6** (Renderer 82.8, main 34.1, Backgro~Pool # 4.9, WRScene~ilder# 4.9, SwComposite 4.9) | cef:gpu-process 34.0, AxioCEFProbe 29.3, cef:renderer 14.6, cef:utility 9.8 | — | 176.7 |
| plain | idle | — | — | **3.0** (main 2.0, Timer 0.5, DOM Worker 0.5) | Web Content 1.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.1 | 22.2 | **26.3** (main 7.9, DOM Worker 4.6, Renderer 3.0, SwComposite 2.6, Backgro~Pool # 2.3) | cef:gpu-process 8.8, AxioCEFProbe 7.2, cef:renderer 6.3 | — | — |
| plain | raf-nosampler | — | — | **19.3** (main 4.3, Renderer 3.3, DOM Worker 2.7, SwComposite 2.7, Backgro~Pool # 2.7) | cef:gpu-process 10.6, AxioCEFProbe 7.3, cef:renderer 6.3 | — | — |
| plain | scroll | 60.3 | 22.8 | **34.5** (main 12.5, Backgro~Pool # 7.5, DOM Worker 5.5, Renderer 3.5, SwComposite 2.5) | cef:gpu-process 42.6, AxioCEFProbe 11.0, cef:renderer 9.0 | — | — |
| plain | key | — | — | **10.6** (main 4.4, Renderer 1.9, DOM Worker 1.4, SwComposite 1.1, Timer 0.6) | cef:renderer 1.5, AxioCEFProbe 1.4, cef:gpu-process 0.3, WebExtensions 0.3 | 9.2 | — |
| plain | switch-to-gecko | — | — | **81.4** (main 29.6, Renderer 22.2, TaskCon~ller # 14.8, BgIOThr~Pool # 7.4, WRRende~ckend# 7.4) |  | — | 121.6 |
| profile | switch-to-engine | — | — | **113.3** (Renderer 41.7, main 29.8, Backgro~Pool # 11.9, DOM Worker 11.9, WRWorker# 6.0) | Web Content 83.5, AxioCEFProbe 17.9, cef:renderer 17.9, cef:gpu-process 6.0 | — | 133.6 |
| profile | idle | — | — | **22.1** (main 6.9, DOM Worker 5.4, SamplerThread 5.4, TaskCon~ller # 2.4, Timer 1.5) | Web Content 3.9, WebExtensions 1.5, AxioCEFProbe 1.0, Privileged Cont 1.0 | — | — |
| profile | raf | 60.0 | 21.0 | **40.2** (DOM Worker 9.8, main 8.5, SamplerThread 7.9, Renderer 3.6, Backgro~Pool # 2.6) | cef:gpu-process 8.8, AxioCEFProbe 7.1, cef:renderer 6.6, Web Content 6.2 | — | — |
| profile | raf-nosampler | — | — | **33.4** (DOM Worker 9.0, SamplerThread 7.0, main 4.7, Renderer 4.0, Backgro~Pool # 3.0) | cef:gpu-process 10.7, AxioCEFProbe 8.0, cef:renderer 5.9, Web Content 5.6 | — | — |
| profile | scroll | 59.7 | 27.3 | **66.8** (main 18.9, DOM Worker 15.9, SamplerThread 8.5, Backgro~Pool # 8.0, Renderer 4.0) | cef:gpu-process 43.3, AxioCEFProbe 11.0, cef:renderer 8.5, Web Content 5.5 | — | — |
| profile | key | — | — | **27.0** (main 7.5, DOM Worker 7.2, SamplerThread 6.4, Renderer 1.9, Timer 1.1) | Web Content 4.2, cef:renderer 1.8, AxioCEFProbe 1.7, WebExtensions 1.7 | 10.9 | — |
| profile | switch-to-gecko | — | — | **77.7** (main 32.4, Renderer 19.4, TaskCon~ller # 12.9, SwComposite 6.5, DOM Worker 6.5) |  | — | 131.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 11.0 | 0.0 | 0 | 0.0 | — | — | 10.0 | 0.0 | — | 3.26 | 2.10 | — | — | — | — | — | 0.023 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.25 | 0.09 | — | — | — | — | — | 0.006 |
| profile | raf-nosampler | 60.2 | 0.0 | 0 | 0.0 | — | — | 15.7 | 0.0 | — | 0.27 | 0.09 | — | — | — | — | — | 0.006 |
| profile | scroll | 58.9 | 0.0 | 0 | 0.0 | — | — | 9.6 | 0.0 | — | 0.69 | 0.10 | — | — | — | — | — | 0.006 |
| profile | key | 5.8 | 0.0 | 0 | 0.0 | — | — | 3.4 | 0.0 | — | 0.39 | 0.09 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.487 | 2.926 | 0.0219 | 0.0257 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.140 | 0.225 | 0.0084 | 0.0135 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.161 | 0.235 | 0.0097 | 0.0141 |
| plain | scroll | memfd | native | 119 | 119 | 0.537 | 0.663 | 0.0318 | 0.0393 |
| plain | key | memfd | native | 21 | 21 | 0.068 | 0.243 | 0.0004 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.487 | 2.926 | 0.0219 | 0.0257 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.140 | 0.225 | 0.0084 | 0.0135 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.161 | 0.235 | 0.0097 | 0.0141 |
| plain | scroll | memfd | native | 119 | 119 | 0.537 | 0.663 | 0.0318 | 0.0393 |
| plain | key | memfd | native | 21 | 21 | 0.068 | 0.243 | 0.0004 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.586 | 4.774 | 0.0285 | 0.0525 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 184 | 184 | 0.146 | 0.234 | 0.0088 | 0.0141 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.166 | 0.279 | 0.0100 | 0.0168 |
| profile | scroll | memfd | native | 119 | 119 | 0.599 | 0.756 | 0.0352 | 0.0445 |
| profile | key | memfd | native | 21 | 21 | 0.075 | 0.262 | 0.0004 | 0.0015 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.3 | 6.6 | 0.0 | — | 0.39 | 0.60 | — | — | 8.3 | 7.5 | 15.1 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 18.9; first stdout read resolved 30.4; first frame applied (native receiver) 130.6; write frame_ack 134.6; write focus 145.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 18.2; first stdout read resolved 25.8; write shutdown 30.2

### Profile: chromium-2x / switch-to-engine

- **parent** CPU ms by thread group: Renderer 65, main 47, BgPool 10, DOM Worker 10, SwComposite 8, WRRenderBackend 4, WRSceneBuilder 2, Compositor 2, IPC I/O 2, Socket 0, WRWorker 0, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 47 ms (26.3% of span): Layout 16, DOM 10, Idle 9, JavaScript 5, Graphics 3, Other 3
  - JS leaf 0 / native under JS 25 / native 23; buckets: ipc 47, paint_layout 21, array_buffer_copy 14, gc_cc 13, harness_diagnostics 10, poll_wait 9, subprocess_pipe_io 2, engine_stream_read 1
  - top self: `__strlen_evex [libc.so.6]` 7; `poll [libc.so.6]` 6; `style::properties::generated::longhands::list_style_type::ca` 5; `mozilla::nsDisplayItem::ZIndex() const [libxul.so]` 3; `[linux-vdso.so.1]` 3; `nsGridContainerFrame::Grid::PlaceGridItems(nsGridContainerFr` 2
  - WebRender/compositor threads: Renderer 65 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 26, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 11, `writev [libc.so.6]` 7); SwComposite 8 ms (top self: `syscall [libc.so.6]` 8, `__memmove_avx512_unaligned_erms [libc.so.6]` 0); WRRenderBackend#0 4 ms (top self: `sched_yield [libc.so.6]` 2, `syscall [libc.so.6]` 1, `webrender::spatial_tree::SpatialTree::visit_node_i` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 10 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__memset_avx512_unaligned_erms [libc.so.6]` 1, `__memmove_avx512_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 10 ms: buckets subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 8, poll_wait 8, gc_cc 0; top self: `poll [libc.so.6]` 8; `[axiosozo-dev]` 1; `mozilla::dom::CallSetup::CallSetup(mozilla::dom::C` 0; `write [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:3964** CPU ms by thread group: main 35, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 35 ms (22.6% of span): Other 25, JavaScript 7, DOM 2, Idle 1, Profiler 0
  - JS leaf 0 / native under JS 3 / native 32; buckets: ipc 27, gc_cc 11, array_buffer_copy 11, subprocess_pipe_io 5, memcpy_memset 2, poll_wait 1
  - top self: `[]` 3; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 3; `__strcmp_evex [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `access [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3960** CPU ms by thread group: main 34, IPC I/O 0, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 34 ms (30.9% of span): Other 28, JavaScript 2, Profiler 2, DOM 1, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 32; buckets: ipc 24, array_buffer_copy 11, gc_cc 8, subprocess_pipe_io 4, memcpy_memset 2, poll_wait 1
  - top self: `[]` 4; `__strcmp_evex [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__open_nocancel [libc.so.6]` 1; `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3772** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 3 ms (1.5% of span): Idle 2, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `mozilla::nsDisplaySolidColor::CreateWebRenderCommands(mozill` 1; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / idle

- **parent** CPU ms by thread group: main 121, DOM Worker 64, other 12, Socket 0, BgPool 0, IPC I/O 0, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 121 ms (5.9% of span): Idle 64, GC / CC 43, JavaScript 9, Other 4, Profiler 1, DOM 0
  - JS leaf 1 / native under JS 7 / native 113; buckets: ipc 121, poll_wait 66, gc_cc 49, harness_diagnostics 6, array_buffer_copy 4, memcpy_memset 1, subprocess_pipe_io 1, native_receiver 0
  - top self: `poll [libc.so.6]` 64; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 4; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onScopeE` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 2
  - GC/CC markers: GCMajor 2× 836 ms, GCSlice 14× 41 ms, CCSlice 3× 7 ms, GCMinor 2× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `munmap [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 64 ms: buckets subprocess_pipe_io 64, js_ctypes 64, worker_messaging 64, ipc 64, poll_wait 64; top self: `poll [libc.so.6]` 64
- **tab:3293** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `poll [libc.so.6]` 1; `getcontext [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3960** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3964** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ScheduleWantsLaterTimer(unsigned int) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf

- **parent** CPU ms by thread group: main 245, DOM Worker 201, Renderer 103, SwComposite 77, BgPool 75, Compositor 27, WRRenderBackend 26, other 23, ImageBridge 11, WRSceneBuilder 5, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 245 ms (8.0% of span): Idle 184, JavaScript 34, Other 14, DOM 8, Profiler 5, GC / CC 0
  - JS leaf 2 / native under JS 38 / native 205; buckets: ipc 245, poll_wait 191, gc_cc 36, engine_stream_read 17, worker_messaging 15, json_metadata 9, subprocess_pipe_io 9, native_receiver 8
  - top self: `poll [libc.so.6]` 183; `[unknown]` 7; `recvmsg [libc.so.6]` 3; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - WebRender/compositor threads: Renderer 103 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 73, `__memmove_avx512_unaligned_erms [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); SwComposite 77 ms (top self: `syscall [libc.so.6]` 69, `__memmove_avx512_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 26 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 1, `webrender::render_backend::RenderBackend::update_d` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 74 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 60, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `rename [libc.so.6]` 0, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0, `open64 [libc.so.6]` 0)
  - busiest DOM Worker 201 ms: buckets subprocess_pipe_io 201, worker_messaging 201, ipc 201, js_ctypes 185, poll_wait 180, gc_cc 7; top self: `poll [libc.so.6]` 180; `[unknown]` 2; `[axiosozo-dev]` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `mozilla::CycleCollectedJSContext::AfterProcessTask` 1
- **tab:3772** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 1, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, gc_cc 2, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `write [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3275** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3777** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `mozilla::ipc::PBackgroundChild::OnMessageReceived(IPC::Messa` 0; `mozilla::dom::Document::HasRecentlyStartedForegroundLoads() ` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 206, main 132, Renderer 102, BgPool 84, SwComposite 79, WRRenderBackend 26, Compositor 26, ImageBridge 11, WRSceneBuilder 4, other 1, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 132 ms (4.4% of span): Idle 90, JavaScript 25, Other 8, DOM 4, GC / CC 4, Profiler 1
  - JS leaf 4 / native under JS 24 / native 105; buckets: ipc 132, poll_wait 94, gc_cc 33, worker_messaging 19, engine_stream_read 16, json_metadata 10, subprocess_pipe_io 5, native_receiver 4
  - top self: `poll [libc.so.6]` 90; `[unknown]` 5; `recvmsg [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libxul.so]` 1; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 102 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx512_unaligned_erms [libc.so.6]` 23, `syscall [libc.so.6]` 7); SwComposite 79 ms (top self: `syscall [libc.so.6]` 70, `__memmove_avx512_unaligned_erms [libc.so.6]` 5, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); WRRenderBackend#0 27 ms (top self: `syscall [libc.so.6]` 25, `sched_yield [libc.so.6]` 0, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 84 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 62, `__memmove_avx512_unaligned_erms [libc.so.6]` 17, `[axiosozo-dev]` 1); ImageBridgeChld 11 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 197 ms: buckets subprocess_pipe_io 197, worker_messaging 197, ipc 197, js_ctypes 182, poll_wait 178, gc_cc 5; top self: `poll [libc.so.6]` 178; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `[axiosozo-dev]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 1; `[unknown]` 1
- **tab:3275** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3254** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3293** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / scroll

- **parent** CPU ms by thread group: main 354, DOM Worker 268, BgPool 158, Renderer 74, SwComposite 51, WRRenderBackend 18, Compositor 18, other 14, ImageBridge 7, WRSceneBuilder 3, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 354 ms (17.5% of span): Idle 220, JavaScript 43, Other 33, GC / CC 32, DOM 10, Graphics 7
  - JS leaf 6 / native under JS 47 / native 301; buckets: ipc 354, poll_wait 251, gc_cc 73, worker_messaging 25, paint_layout 16, array_buffer_copy 15, subprocess_pipe_io 12, harness_diagnostics 12
  - top self: `poll [libc.so.6]` 225; `[unknown]` 5; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `[axiosozo-dev]` 4; `recvmsg [libc.so.6]` 4; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 4
  - GC/CC markers: GCMajor 1× 1280 ms, GCSlice 12× 37 ms, GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 74 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 42, `__memmove_avx512_unaligned_erms [libc.so.6]` 10, `syscall [libc.so.6]` 8); SwComposite 51 ms (top self: `syscall [libc.so.6]` 49, `__memmove_avx512_unaligned_erms [libc.so.6]` 1, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 17, `sched_yield [libc.so.6]` 1, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 158 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 88, `__memmove_avx512_unaligned_erms [libc.so.6]` 66, `write [libc.so.6]` 1); ImageBridgeChld 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 268 ms: buckets subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 196, poll_wait 185, gc_cc 55; top self: `poll [libc.so.6]` 185; `madvise [libc.so.6]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 6; `[axiosozo-dev]` 4; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 4
- **tab:3275** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3293** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3254** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Other 0, Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / key

- **parent** CPU ms by thread group: main 250, DOM Worker 162, Renderer 72, SwComposite 37, other 24, Compositor 10, WRRenderBackend 9, BgPool 8, WRWorker 6, WRSceneBuilder 5, IPC I/O 2, ImageBridge 1, Socket 0, Canvas 0, ImageIO 0
  - main thread 250 ms (6.9% of span): Idle 127, JavaScript 45, Other 22, Layout 19, Graphics 17, DOM 12
  - JS leaf 6 / native under JS 75 / native 170; buckets: ipc 250, poll_wait 147, gc_cc 56, worker_messaging 44, paint_layout 40, engine_stream_read 25, array_buffer_copy 12, json_metadata 9
  - top self: `poll [libc.so.6]` 128; `[unknown]` 8; `[axiosozo-dev]` 5; `write [libc.so.6]` 4; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCSlice 2× 0 ms
  - WebRender/compositor threads: Renderer 72 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 16, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 5); SwComposite 37 ms (top self: `__memmove_avx512_unaligned_erms [libc.so.6]` 18, `syscall [libc.so.6]` 18, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 9 ms (top self: `syscall [libc.so.6]` 7, `sched_yield [libc.so.6]` 1, `webrender::batch::AlphaBatchList::set_params_and_g` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 6, `__memmove_avx512_unaligned_erms [libc.so.6]` 2); ImageBridgeChld 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 162 ms: buckets subprocess_pipe_io 162, worker_messaging 162, ipc 162, js_ctypes 151, poll_wait 147, gc_cc 5; top self: `poll [libc.so.6]` 147; `js::SharedShape::getInitialShape(JSContext*, JSCla` 1; `mozilla::cyclecollector::HoldJSObjectsImpl(nsISupp` 1; `write [libc.so.6]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:3207** CPU ms by thread group: main 12, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 12 ms (0.3% of span): GC / CC 6, Idle 6, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: ipc 12, poll_wait 7, gc_cc 6, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 2; `void js::gc::MarkingTracerT<8u>::markAndTraverse<js::BaseScr` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `bool __gnu_cxx::__ops::_Iter_pred<mozilla::Vector<std::uniqu` 1
  - GC/CC markers: GCMajor 1× 39 ms, GCSlice 4× 7 ms, CCSlice 1× 0 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3293** CPU ms by thread group: main 8, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 8 ms (0.2% of span): GC / CC 6, Idle 1, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 8; buckets: ipc 8, gc_cc 6, poll_wait 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 1; `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 1; `sendmsg [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3254** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 2, poll_wait 2, gc_cc 1
  - top self: `poll [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) ` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 48, Renderer 29, DOM Worker 6, BgPool 4, SwComposite 4, WRRenderBackend 1, WRSceneBuilder 1, Compositor 1, IPC I/O 0, Socket 0, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 48 ms (28.7% of span): GC / CC 14, Layout 13, JavaScript 9, Idle 6, Graphics 3, DOM 2
  - JS leaf 0 / native under JS 18 / native 30; buckets: ipc 47, gc_cc 19, paint_layout 15, array_buffer_copy 7, poll_wait 6, harness_diagnostics 5, memcpy_memset 2, worker_messaging 2
  - top self: `poll [libc.so.6]` 6; `[axiosozo-dev]` 3; `Gecko_CopyConstruct_nsStyleBackground [libxul.so]` 3; `mozilla::ReflowInput::ReflowInput(nsPresContext*, mozilla::R` 2; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCSlice 4× 18 ms, CCSlice 1× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 29 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 4); SwComposite 4 ms (top self: `syscall [libc.so.6]` 4); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #1 4 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 1, `fstatat64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 7 ms: buckets subprocess_pipe_io 7, worker_messaging 7, ipc 7, js_ctypes 6, poll_wait 6; top self: `poll [libc.so.6]` 6; `wait4 [libc.so.6]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3772** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.6% of span): Idle 2, Layout 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, memcpy_memset 1, paint_layout 1
  - top self: `poll [libc.so.6]` 2; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0; `js::BaseShape::get(JSContext*, JSClass const*, JS::Realm*, J` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3207** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.2% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3777** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

