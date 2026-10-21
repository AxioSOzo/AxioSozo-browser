# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **68.4** (Renderer 28.0, main 24.9, DOM Worker 6.2, WRRende~ckend# 3.1, Backgro~Pool # 3.1) | WPEWebProcess 68.4, AxioWebKitHost 12.4, WPENetworkProce 9.3 | — | 283.8 |
| plain | idle | — | — | **8.7** (main 6.7, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.8, AxioWebKitHost 0.5 | — | — |
| plain | raf | 56.6 | 47.5 | **45.8** (main 17.0, Renderer 6.1, BgIOThr~Pool # 3.5, DOM Worker 3.5, SwComposite 2.9) | WPEWebProcess 187.8, AxioWebKitHost 21.4, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **24.4** (Renderer 5.6, main 4.6, SwComposite 3.3, DOM Worker 3.3, Backgro~Pool # 2.7) | WPEWebProcess 184.1, AxioWebKitHost 20.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 56.2 | 34.5 | **52.1** (main 20.8, Backgro~Pool # 9.0, DOM Worker 7.6, Renderer 5.2, SwComposite 2.8) | WPEWebProcess 182.1, AxioWebKitHost 22.1, Web Content 0.5 | — | — |
| plain | key | — | — | **72.1** (main 27.8, DOM Worker 21.5, IPDL Background 6.5, TaskCon~ller # 4.6, Renderer 3.0) | WPEWebProcess 18.0, AxioWebKitHost 2.5, WebExtensions 0.3, Web Content 0.3 | 29.6 | — |
| plain | switch-to-gecko | — | — | **40.8** (main 12.2, Renderer 12.2, Softwar~cThread 4.1, WRScene~ilder# 4.1, DOM Worker 4.1) | Isolated Web Co 4.1 | — | 215.3 |
| trace | switch-to-engine | — | — | **95.0** (Renderer 61.6, main 16.6, glean.dispatche 2.4, Softwar~cThread 2.4, WRWorker# 2.4) | WPEWebProcess 85.3, AxioWebKitHost 9.5, WPENetworkProce 7.1, Privileged Cont 2.4 | — | 384.4 |
| trace | idle | — | — | **15.4** (main 10.6, TaskCon~ller # 3.8, glean.dispatche 0.5, Timer 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 58.0 | 24.7 | **35.2** (main 12.8, Renderer 6.1, SwComposite 3.2, DOM Worker 3.2, Backgro~Pool # 2.9) | WPEWebProcess 186.6, AxioWebKitHost 22.4, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **25.8** (Renderer 6.0, main 5.6, SwComposite 3.6, DOM Worker 3.3, Backgro~Pool # 2.7) | WPEWebProcess 186.3, AxioWebKitHost 20.5 | — | — |
| trace | scroll | 55.9 | 31.3 | **52.5** (main 22.8, Backgro~Pool # 8.5, DOM Worker 7.6, Renderer 5.2, SwComposite 2.8) | WPEWebProcess 188.2, AxioWebKitHost 23.2 | — | — |
| trace | key | — | — | **19.0** (main 10.6, Renderer 3.0, DOM Worker 1.6, SwComposite 1.4, Timer 0.8) | WPEWebProcess 17.5, AxioWebKitHost 2.5, WebExtensions 0.3, Web Content 0.3 | 27.7 | — |
| trace | switch-to-gecko | — | — | **36.9** (main 8.2, Renderer 8.2, IPC I/O Parent 4.1, WRScene~ilder# 4.1, WRRende~ckend# 4.1) | Isolated Web Co 8.2 | — | 218.0 |
| profile | switch-to-engine | — | — | **46.3** (main 10.9, DOM Worker 10.9, Backgro~Pool # 8.2, SamplerThread 8.2, Renderer 2.7) | WPEWebProcess 68.2, Web Content 19.1, WPENetworkProce 10.9, AxioWebKitHost 8.2 | — | 328.4 |
| profile | idle | — | — | **27.2** (main 8.6, DOM Worker 8.1, SamplerThread 8.1, Timer 1.9, TaskCon~ller # 0.5) | Web Content 8.6, Privileged Cont 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 57.7 | 26.8 | **54.9** (main 16.8, DOM Worker 9.8, SamplerThread 8.6, Renderer 5.7, Backgro~Pool # 3.2) | WPEWebProcess 188.6, AxioWebKitHost 21.8, Web Content 7.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **48.0** (DOM Worker 10.9, SamplerThread 8.6, main 7.9, Renderer 6.3, SwComposite 4.0) | WPEWebProcess 190.6, AxioWebKitHost 22.8, Web Content 7.9, WebExtensions 1.7 | — | — |
| profile | scroll | 54.2 | 33.0 | **78.4** (main 29.1, DOM Worker 14.8, Backgro~Pool # 8.8, SamplerThread 7.9, Renderer 5.6) | WPEWebProcess 188.0, AxioWebKitHost 23.1, Web Content 8.3, Privileged Cont 1.9 | — | — |
| profile | key | — | — | **56.4** (main 15.8, BgIOThr~Pool # 10.6, SamplerThread 10.3, DOM Worker 10.1, Renderer 3.3) | WPEWebProcess 18.5, Web Content 9.8, AxioWebKitHost 2.5, WebExtensions 2.5 | 28.8 | — |
| profile | switch-to-gecko | — | — | **51.0** (main 15.7, DOM Worker 11.8, Renderer 7.9, Compositor 3.9, BgIOThr~Pool # 3.9) | Isolated Web Co 7.9 | — | 223.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.2 | 0.0 | 0 | 0.0 | — | — | 142.6 | 0.0 | — | 3.34 | 0.44 | — | — | — | — | — | 0.002 |
| trace | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.29 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.31 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 54.6 | 0.0 | 0 | 0.0 | — | — | 12.9 | 0.0 | — | 0.93 | 0.13 | — | — | — | — | — | 0.008 |
| trace | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 17.4 | 0.0 | — | 0.10 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.1 | 0.0 | 0 | 0.0 | — | — | 101.3 | 0.0 | — | 3.55 | 0.62 | — | — | — | — | — | 0.003 |
| profile | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.40 | 0.16 | — | — | — | — | — | 0.013 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.33 | 0.18 | — | — | — | — | — | 0.013 |
| profile | scroll | 52.6 | 0.0 | 0 | 0.0 | — | — | 8.8 | 0.0 | — | 1.29 | 0.18 | — | — | — | — | — | 0.016 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 13.6 | 0.0 | — | 0.12 | 0.18 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 3.409 | 6.553 | 0.0199 | 0.0383 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 179 | 0.188 | 0.358 | 0.0107 | 0.0204 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.193 | 0.252 | 0.0112 | 0.0146 |
| plain | scroll | memfd | native | 115 | 115 | 0.723 | 0.795 | 0.0389 | 0.0428 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.187 | 0.0000 | 0.0010 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 2.792 | 6.430 | 0.0119 | 0.0273 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 183 | 183 | 0.187 | 0.277 | 0.0109 | 0.0162 |
| trace | raf-nosampler | memfd | native | 177 | 177 | 0.207 | 0.266 | 0.0120 | 0.0154 |
| trace | scroll | memfd | native | 116 | 116 | 0.789 | 0.819 | 0.0430 | 0.0447 |
| trace | key | memfd | native | 20 | 20 | 0.003 | 0.208 | 0.0000 | 0.0011 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.342 | 7.542 | 0.0170 | 0.0383 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 184 | 184 | 0.257 | 0.383 | 0.0148 | 0.0220 |
| profile | raf-nosampler | memfd | native | 178 | 178 | 0.209 | 0.298 | 0.0121 | 0.0173 |
| profile | scroll | memfd | native | 115 | 115 | 1.044 | 1.272 | 0.0550 | 0.0670 |
| profile | key | memfd | native | 20 | 20 | 0.003 | 0.208 | 0.0000 | 0.0011 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 24.3 | 0.0 | — | 0.10 | 0.32 | — | — | 9.1 | 25.3 | 34.0 |
| profile | 0.6 | 26.3 | 0.1 | — | 0.12 | 0.51 | — | — | 13.8 | 27.5 | 40.4 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 62.3; first stdout read resolved 65.3; first frame applied (native receiver) 438.0; write frame_ack 438.7; write visibility 442.4; write focus 442.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 18.7; first stdout read resolved 25.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.2; first stdout read resolved 42.2; first frame applied (native receiver) 345.1; write frame_ack 346.1; write visibility 356.2; write focus 356.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 28.4; first stdout read resolved 38.8

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 47, DOM Worker 27, Renderer 24, BgPool 18, Compositor 3, WRRenderBackend 3, SwComposite 2, WRSceneBuilder 2, IPC I/O 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, ImageIO 0, Canvas 0
  - main thread 47 ms (12.0% of span): JavaScript 25, Idle 9, Layout 9, Profiler 2, Graphics 1, GC / CC 1
  - JS leaf 2 / native under JS 29 / native 16; buckets: ipc 47, gc_cc 27, paint_layout 10, harness_diagnostics 10, array_buffer_copy 9, poll_wait 9, engine_stream_read 5, worker_messaging 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `nsMenuPopupFrame::IntrinsicISize(mozilla::IntrinsicSizeInput` 3; `mozilla::dom::EventTarget::NonVirtualRelease() [libxul.so]` 2; `js::EqualChars(JSLinearString const*, JSLinearString const*)` 2; `js::MapIteratorObject::create(JSContext*, JS::Handle<js::Map` 2; `[unknown]` 2
  - WebRender/compositor threads: Renderer 24 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `ClearTexSubImage [libxul.so]` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 18 ms (top self: `ARGBSetRow_X86 [libxul.so]` 7, `__syscall_cancel_arch [libc.so.6]` 5, `__memset_avx2_unaligned_erms [libc.so.6]` 4); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 27 ms: buckets subprocess_pipe_io 27, worker_messaging 27, ipc 27, js_ctypes 25, poll_wait 25, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 25; `[axiosozo-dev]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileC` 1
- **tab:9491** CPU ms by thread group: main 53, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 53 ms (14.9% of span): Other 44, JavaScript 6, DOM 2, Idle 1, GC / CC 1
  - JS leaf 1 / native under JS 5 / native 47; buckets: ipc 40, array_buffer_copy 19, gc_cc 13, subprocess_pipe_io 6, poll_wait 1, memcpy_memset 1, image_container 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libexpat.so.1]` 4; `PrefsIter::Next() [libxul.so]` 2; `void js::wasm::RecGroup::visitReferencedGroups<js::wasm::Rec` 2; `[]` 2; `PrefWrapper::WantValueKind(mozilla::PrefType, mozilla::PrefV` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9346** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.4% of span): Other 1, Idle 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1
  - top self: `nsGetInterface::operator()(nsID const&, void**) const [libxu` 1; `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::IMEStateManager::StopIMEStateManagement() [libxul.s` 0; `mozilla::dom::danger::GetJSContext() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **utility:9017** CPU ms by thread group: main 0, IPC I/O 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 180, DOM Worker 109, other 20, Socket 1, IPC I/O 1, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 180 ms (8.5% of span): Idle 127, GC / CC 21, JavaScript 15, Other 9, DOM 4, Profiler 3
  - JS leaf 1 / native under JS 18 / native 161; buckets: ipc 179, poll_wait 132, gc_cc 25, harness_diagnostics 18, array_buffer_copy 5, engine_stream_read 2, json_metadata 1, native_receiver 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 130; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 5; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 3; `[unknown]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 2
  - GC/CC markers: GCSlice 3× 19 ms, CCSlice 2× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 109 ms: buckets subprocess_pipe_io 109, js_ctypes 109, worker_messaging 109, ipc 109, poll_wait 109; top self: `__syscall_cancel_arch [libc.so.6]` 109
- **tab:9491** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8942** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9350** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 485, DOM Worker 250, Renderer 171, BgPool 96, SwComposite 91, WRRenderBackend 54, Compositor 42, other 29, ImageBridge 18, WRSceneBuilder 8, Socket 1, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 485 ms (15.2% of span): Idle 332, JavaScript 87, Other 33, DOM 27, Profiler 6
  - JS leaf 11 / native under JS 97 / native 376; buckets: ipc 484, poll_wait 353, gc_cc 76, engine_stream_read 58, worker_messaging 42, harness_diagnostics 39, native_receiver 21, subprocess_pipe_io 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 349; `[unknown]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 8; `__lll_lock_wake [libc.so.6]` 3; `[axiosozo-dev]` 3; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 171 ms (top self: `__syscall_cancel_arch [libc.so.6]` 118, `__memmove_avx_unaligned_erms [libc.so.6]` 26, `syscall [libc.so.6]` 15); SwComposite 91 ms (top self: `syscall [libc.so.6]` 80, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 4); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 10, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 96 ms (top self: `__syscall_cancel_arch [libc.so.6]` 80, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 250 ms: buckets subprocess_pipe_io 250, worker_messaging 249, ipc 249, js_ctypes 227, poll_wait 221, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 223; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 3; `__lll_lock_wake [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:9485** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9491** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8961** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 248, main 221, Renderer 168, SwComposite 102, BgPool 92, WRRenderBackend 52, Compositor 43, ImageBridge 18, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 221 ms (7.2% of span): Idle 125, JavaScript 54, Other 19, DOM 18, GC / CC 3, Profiler 2
  - JS leaf 5 / native under JS 64 / native 151; buckets: ipc 220, poll_wait 137, gc_cc 77, engine_stream_read 55, worker_messaging 29, subprocess_pipe_io 17, native_receiver 15, array_buffer_copy 11
  - top self: `__syscall_cancel_arch [libc.so.6]` 135; `[unknown]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 168 ms (top self: `__syscall_cancel_arch [libc.so.6]` 103, `__memmove_avx_unaligned_erms [libc.so.6]` 36, `syscall [libc.so.6]` 19); SwComposite 102 ms (top self: `syscall [libc.so.6]` 91, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `void scale_blit<true>(Texture&, IntRect const&, Te` 2); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 11, `floorf [libxul.so]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 93 ms (top self: `__syscall_cancel_arch [libc.so.6]` 74, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `__lll_lock_wake [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 248 ms: buckets subprocess_pipe_io 248, worker_messaging 248, ipc 248, js_ctypes 228, poll_wait 220, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 222; `[axiosozo-dev]` 2; `[unknown]` 2; `getcontext [libc.so.6]` 1; `js::InternalCallOrConstruct(JSContext*, JS::CallAr` 1
- **tab:9350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9485** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8920** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 585, DOM Worker 276, BgPool 171, Renderer 109, SwComposite 58, WRRenderBackend 37, Compositor 27, other 18, ImageBridge 11, WRSceneBuilder 5, Socket 2, IPC I/O 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 585 ms (26.8% of span): Idle 296, JavaScript 133, Other 69, DOM 43, Graphics 22, Profiler 9
  - JS leaf 13 / native under JS 163 / native 410; buckets: ipc 585, poll_wait 378, gc_cc 132, engine_stream_read 91, worker_messaging 71, harness_diagnostics 66, paint_layout 56, array_buffer_copy 37
  - top self: `__syscall_cancel_arch [libc.so.6]` 342; `[unknown]` 30; `__lll_lock_wait [libc.so.6]` 7; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 6; `__lll_lock_wake [libc.so.6]` 5; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 5
  - GC/CC markers: GCMinor 1× 7 ms
  - WebRender/compositor threads: Renderer 109 ms (top self: `__syscall_cancel_arch [libc.so.6]` 78, `syscall [libc.so.6]` 13, `__memmove_avx_unaligned_erms [libc.so.6]` 13); SwComposite 58 ms (top self: `syscall [libc.so.6]` 55, `void scale_blit<true>(Texture&, IntRect const&, Te` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 37 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 171 ms (top self: `__syscall_cancel_arch [libc.so.6]` 111, `__memmove_avx_unaligned_erms [libc.so.6]` 54, `__lll_lock_wake [libc.so.6]` 3); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::NotifyNotUsed(u` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 276 ms: buckets subprocess_pipe_io 276, worker_messaging 276, ipc 276, js_ctypes 232, poll_wait 224, gc_cc 17; top self: `__syscall_cancel_arch [libc.so.6]` 231; `__lll_lock_wake [libc.so.6]` 10; `[axiosozo-dev]` 4; `xpc::OpaqueXrayTraits::preserveWrapper(JSObject*) ` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3
- **tab:8920** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9485** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8942** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 536, BgPool 378, DOM Worker 266, Renderer 116, SwComposite 49, other 36, WRRenderBackend 19, Compositor 17, WRWorker 11, WRSceneBuilder 10, IPC I/O 2, ImageBridge 2, Socket 1, ImageIO 0, Canvas 0
  - main thread 536 ms (14.5% of span): Idle 237, JavaScript 115, Other 52, Layout 48, Graphics 39, DOM 25
  - JS leaf 19 / native under JS 167 / native 351; buckets: ipc 535, poll_wait 284, gc_cc 113, paint_layout 98, engine_stream_read 75, worker_messaging 71, harness_diagnostics 42, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 261; `[unknown]` 18; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `mprotect [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 4
  - GC/CC markers: CCSlice 2× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 116 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 40, `__syscall_cancel_arch [libc.so.6]` 35, `hypotf@@GLIBC_2.35 [libm.so.6]` 7); SwComposite 49 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 13); WRRenderBackend#0 19 ms (top self: `syscall [libc.so.6]` 17, `core::hash::BuildHasher::hash_one [libxul.so]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 373 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 339, `__syscall_cancel_arch [libc.so.6]` 32, `XXH32_update [libxul.so]` 2); BackgroundThreadPool #3 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `[linux-vdso.so.1]` 0)
  - busiest DOM Worker 266 ms: buckets subprocess_pipe_io 266, worker_messaging 266, ipc 266, js_ctypes 253, poll_wait 248, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 250; `JSStructuredCloneReader::readHeader() [libxul.so]` 2; `[unknown]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 1; `JS::Heap<JS::Value>* nsTArray_Impl<JS::Heap<JS::Va` 1
- **tab:8871** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle` 0; `js::OpaqueCrossCompartmentWrapper::hasOwn(JSContext*, JS::Ha` 0; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheI` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8961** CPU ms by thread group: main 4, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, DOM 1, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `mozilla::dom::Element::FindAttributeDependence(nsAtom const*` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS:` 1; `js::jit::BytecodeAnalysis::init() [libxul.so]` 0; `js::InterpreterFrame::prologue(JSContext*) [libxul.so]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8942** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*)` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 84, Renderer 55, DOM Worker 18, BgPool 11, Compositor 5, WRRenderBackend 4, SwComposite 4, WRSceneBuilder 3, IPC I/O 2, Socket 1, other 0, ImageBridge 0, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 84 ms (27.3% of span): JavaScript 36, Layout 15, Graphics 9, DOM 8, Profiler 8, Idle 5
  - JS leaf 2 / native under JS 53 / native 30; buckets: ipc 84, paint_layout 28, array_buffer_copy 24, gc_cc 16, engine_stream_read 10, harness_diagnostics 10, worker_messaging 6, poll_wait 5
  - top self: `js::jit::BytecodeAnalysis::init() [libxul.so]` 9; `__syscall_cancel_arch [libc.so.6]` 6; `[axiosozo-dev]` 5; `mozilla::image::SurfaceCache::LookupBestMatch(mozilla::image` 4; `[unknown]` 4; `mozilla::layers::HitTestInfoManager::ProcessItem(mozilla::ns` 4
  - WebRender/compositor threads: Renderer 55 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `__syscall_cancel_arch [libc.so.6]` 6); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 4, `sched_yield [libc.so.6]` 0); SwComposite 4 ms (top self: `syscall [libc.so.6]` 3, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 10 ms (top self: `rmdir [libc.so.6]` 6, `unlink [libc.so.6]` 3, `__close_nocancel [libc.so.6]` 1); BackgroundThreadPool #3 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 18 ms: buckets subprocess_pipe_io 18, worker_messaging 18, ipc 18, poll_wait 16, js_ctypes 15, memcpy_memset 1; top self: `__syscall_cancel_arch [libc.so.6]` 16; `__lll_lock_wait [libc.so.6]` 1; `[axiosozo-dev]` 1; `nsHashPropertyBagCC::AddRef() [libxul.so]` 0
- **tab:9346** CPU ms by thread group: main 30, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 30 ms (9.9% of span): JavaScript 9, Other 6, Profiler 5, Idle 4, Graphics 2, DOM 2
  - JS leaf 0 / native under JS 8 / native 22; buckets: ipc 23, gc_cc 8, subprocess_pipe_io 6, poll_wait 5, paint_layout 3, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[]` 3; `gecko_profiler_current_thread_is_registered [libxul.so]` 2; `profiler_capture_backtrace_into(mozilla::ProfileChunkedBuffe` 2; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 1; `js::frontend::PropertyEmitter::emitInit(js::frontend::Access` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8871** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (1.8% of span): Idle 3, JavaScript 2, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 6, poll_wait 3, array_buffer_copy 3, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `WarpScriptOracle::maybeInlineIC(mozilla::LinkedList<js::jit:` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9491** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, other 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

