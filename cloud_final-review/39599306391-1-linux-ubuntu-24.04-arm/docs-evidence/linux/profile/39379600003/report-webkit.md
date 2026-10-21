# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **46.6** (Renderer 16.6, main 13.3, DOM Worker 9.9, glean.dispatche 1.7, Softwar~cThread 1.7) | WPEWebProcess 67.9, AxioWebKitHost 16.6, WPENetworkProce 9.9 | — | 580.0 |
| plain | idle | — | — | **7.3** (main 5.8, Timer 0.5, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.9 | — | — |
| plain | raf | 58.1 | 21.6 | **36.4** (main 12.7, Renderer 6.2, SwComposite 4.6, DOM Worker 3.3, TaskCon~ller # 2.9) | WPEWebProcess 63.2, AxioWebKitHost 7.1, Web Content 0.7, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **28.1** (Renderer 6.3, main 6.0, SwComposite 4.6, DOM Worker 3.0, Backgro~Pool # 2.3) | WPEWebProcess 65.1, AxioWebKitHost 7.2, Privileged Cont 1.0, WebExtensions 0.3 | — | — |
| plain | scroll | 57.3 | 33.4 | **45.3** (main 19.1, DOM Worker 6.9, Renderer 5.9, SwComposite 4.4, Backgro~Pool # 2.5) | WPEWebProcess 64.9, AxioWebKitHost 8.4 | — | — |
| plain | key | — | — | **17.1** (main 10.4, TaskCon~ller # 1.6, Timer 1.1, DOM Worker 1.1, Renderer 0.8) | WPEWebProcess 6.6, AxioWebKitHost 1.4 | 16.2 | — |
| plain | switch-to-gecko | — | — | **21.0** (main 8.4, BgIOThr~Pool # 4.2, Renderer 4.2, SwComposite 4.2) | Isolated Web Co 4.2 | — | 212.5 |
| trace | switch-to-engine | — | — | **51.1** (main 19.4, Renderer 15.8, TaskCon~ller # 7.0, DOM Worker 3.5, glean.dispatche 1.8) | WPEWebProcess 65.2, AxioWebKitHost 15.8, WPENetworkProce 10.6, bwrap 1.8 | — | 547.6 |
| trace | idle | — | — | **6.8** (main 5.3, Timer 1.0, Compositor 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.9 | 29.1 | **37.0** (main 13.4, Renderer 6.5, SwComposite 4.6, DOM Worker 3.3, Backgro~Pool # 2.0) | WPEWebProcess 63.2, AxioWebKitHost 7.2, Web Content 0.3 | — | — |
| trace | raf-nosampler | — | — | **104.2** (DOM Worker 26.8, main 22.5, IndexedDB IO # 19.2, IPDL Background 8.3, Renderer 6.3) | WPEWebProcess 63.1, AxioWebKitHost 6.6, WebExtensions 0.3, RDD Process 0.3 | — | — |
| trace | scroll | 57.4 | 30.5 | **49.7** (main 20.6, DOM Worker 8.3, Renderer 6.4, SwComposite 4.9, Backgro~Pool # 2.5) | WPEWebProcess 64.3, AxioWebKitHost 8.9 | — | — |
| trace | key | — | — | **15.5** (main 9.3, DOM Worker 1.9, Timer 1.1, SwComposite 0.8, Softwar~cThread 0.5) | WPEWebProcess 6.9, AxioWebKitHost 1.4 | 15.9 | — |
| trace | switch-to-gecko | — | — | **16.5** (main 8.3, BgIOThr~Pool # 4.1, Renderer 4.1) | Isolated Web Co 8.3 | — | 211.4 |
| profile | switch-to-engine | — | — | **31.2** (DOM Worker 14.0, SamplerThread 7.8, main 6.2, IPC I/O Parent 1.6, IPDL Background 1.6) | WPEWebProcess 62.1, Web Content 24.9, AxioWebKitHost 17.1, WPENetworkProce 9.3 | — | 615.2 |
| profile | idle | — | — | **28.5** (SamplerThread 8.7, DOM Worker 8.2, main 7.7, Timer 2.4, glean.dispatche 0.5) | Web Content 10.1, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 57.9 | 21.6 | **67.0** (main 18.8, DOM Worker 11.0, SamplerThread 11.0, Renderer 7.1, SwComposite 4.9) | WPEWebProcess 65.1, Web Content 9.1, AxioWebKitHost 7.4, Privileged Cont 2.2 | — | — |
| profile | raf-nosampler | — | — | **52.6** (DOM Worker 11.6, SamplerThread 9.9, main 8.6, Renderer 7.3, SwComposite 5.3) | WPEWebProcess 64.3, Web Content 8.9, AxioWebKitHost 7.7, Privileged Cont 2.0 | — | — |
| profile | scroll | 55.8 | 33.6 | **74.0** (main 26.3, DOM Worker 14.1, SamplerThread 10.7, Renderer 6.8, SwComposite 4.4) | WPEWebProcess 65.2, Web Content 9.7, AxioWebKitHost 8.8, WebExtensions 1.9 | — | — |
| profile | key | — | — | **39.6** (main 14.0, SamplerThread 9.9, DOM Worker 9.6, Timer 2.2, Renderer 0.8) | Web Content 9.9, WPEWebProcess 7.1, WebExtensions 2.7, Privileged Cont 1.9 | 17.6 | — |
| profile | switch-to-gecko | — | — | **36.0** (main 12.0, DOM Worker 8.0, BgIOThr~Pool # 4.0, Renderer 4.0, ImageBridgeChld 4.0) | Isolated Web Co 8.0, Web Content 4.0 | — | 217.0 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.4 | 0.0 | 0 | 0.0 | — | — | 113.5 | 0.0 | — | 0.69 | 0.32 | — | — | — | — | — | 0.001 |
| trace | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.17 | 0.13 | — | — | — | — | — | 0.009 |
| trace | raf-nosampler | 56.5 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.15 | 0.14 | — | — | — | — | — | 0.008 |
| trace | scroll | 55.1 | 0.0 | 0 | 0.0 | — | — | 8.9 | 0.0 | — | 0.27 | 0.12 | — | — | — | — | — | 0.007 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.9 | 0.0 | — | 0.09 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 3.0 | 0.0 | 0 | 0.0 | — | — | 127.3 | 0.0 | — | 0.75 | 0.54 | — | — | — | — | — | 0.002 |
| profile | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.20 | 0.17 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.17 | 0.17 | — | — | — | — | — | 0.013 |
| profile | scroll | 53.5 | 0.0 | 0 | 0.0 | — | — | 12.7 | 0.0 | — | 0.30 | 0.16 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 6.8 | 0.0 | — | 0.13 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.778 | 1.174 | 0.0025 | 0.0038 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.067 | 0.242 | 0.0039 | 0.0141 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.043 | 0.241 | 0.0025 | 0.0140 |
| plain | scroll | memfd | native | 112 | 112 | 0.194 | 0.208 | 0.0106 | 0.0113 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.242 | 0.0000 | 0.0013 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.432 | 0.995 | 0.0015 | 0.0034 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 179 | 179 | 0.066 | 0.226 | 0.0039 | 0.0131 |
| trace | raf-nosampler | memfd | native | 173 | 173 | 0.045 | 0.234 | 0.0025 | 0.0133 |
| trace | scroll | memfd | native | 113 | 113 | 0.164 | 0.199 | 0.0090 | 0.0110 |
| trace | key | memfd | native | 20 | 20 | 0.000 | 0.209 | 0.0000 | 0.0011 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 0.500 | 0.723 | 0.0015 | 0.0022 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 181 | 181 | 0.075 | 0.252 | 0.0043 | 0.0146 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.052 | 0.238 | 0.0030 | 0.0138 |
| profile | scroll | memfd | native | 111 | 111 | 0.172 | 0.213 | 0.0092 | 0.0114 |
| profile | key | memfd | native | 20 | 20 | 0.000 | 0.245 | 0.0000 | 0.0013 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 12.8 | 0.0 | — | 0.09 | 0.31 | — | — | 88.3 | 13.5 | 115.6 |
| profile | 0.6 | 14.0 | 0.1 | — | 0.13 | 0.51 | — | — | 85.8 | 15.0 | 102.6 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 19.2; spawn AxioWebKitHost resolved 30.2; write hello 41.8; first stdout read resolved 98.5; write create 99.9; first frame applied (native receiver) 560.0; write frame_ack 560.5; write visibility 564.4; write focus 564.6

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 18.2; first stdout read resolved 23.3

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 35.1; spawn AxioWebKitHost resolved 54.6; write hello 61.2; first stdout read resolved 133.5; write create 136.8; first frame applied (native receiver) 631.7; write frame_ack 632.6; write visibility 640.1; write focus 640.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 28.7; first stdout read resolved 37.1

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 60, main 41, Renderer 9, BgPool 3, Compositor 3, IPC I/O 3, WRSceneBuilder 2, WRRenderBackend 2, SwComposite 1, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 41 ms (6.2% of span): Idle 13, JavaScript 12, Layout 7, DOM 3, Graphics 2, Other 2
  - JS leaf 3 / native under JS 18 / native 21; buckets: ipc 41, poll_wait 15, gc_cc 12, paint_layout 10, harness_diagnostics 8, array_buffer_copy 7, subprocess_pipe_io 4, engine_stream_read 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 16; `int nsLayoutUtils::ResolveToLength<false>(mozilla::StyleLeng` 2; `[axiosozo-dev]` 2; `delimitedRead (chrome://remote/content/marionette/stream-uti` 1; `next (self-hosted:392:27)[5]` 1; `style::bloom::StyleBloom<E>::push_internal [libxul.so]` 1
  - WebRender/compositor threads: Renderer 9 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 2, `hypotf@@GLIBC_2.35 [libm.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0, `webrender::scene_building::SceneBuilder::finalize_` 0); WRRenderBackend#0 1 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1, `webrender::texture_cache::TextureCache::request [l` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 60 ms: buckets subprocess_pipe_io 60, worker_messaging 60, ipc 60, poll_wait 53, js_ctypes 53, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 53; `[unknown]` 2; `mozilla::profiler::detail::CopyToRightSizedBuffer(` 2; `mprotect [libc.so.6]` 1; `MaybeCallMethod(JSContext*, JS::Handle<JSObject*>,` 1
- **tab:7802** CPU ms by thread group: main 40, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (6.8% of span): Other 26, Profiler 7, JavaScript 3, DOM 2, Idle 2, GC / CC 0
  - JS leaf 0 / native under JS 4 / native 36; buckets: ipc 30, array_buffer_copy 12, gc_cc 7, poll_wait 2, subprocess_pipe_io 1, image_container 1, memcpy_memset 1
  - top self: `[]` 5; `[libfontconfig.so.1]` 3; `syscall [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7806** CPU ms by thread group: main 9, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 9 ms (1.3% of span): DOM 4, Other 3, JavaScript 1, Idle 1
  - JS leaf 0 / native under JS 4 / native 4; buckets: ipc 9, gc_cc 6, array_buffer_copy 1, poll_wait 1, subprocess_pipe_io 1, image_container 1
  - top self: `mozilla::extensions::WebExtensionContentScript::WebExtension` 2; `__syscall_cancel_arch [libc.so.6]` 1; `[]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 1; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7712** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.2% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::dom::Element::DescribeAttribute(unsigned int, nsTSu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 152, DOM Worker 111, other 21, Compositor 1, Renderer 1, Socket 1, SwComposite 1, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 152 ms (7.3% of span): Idle 122, JavaScript 13, Other 10, DOM 4, GC / CC 2, Profiler 1
  - JS leaf 1 / native under JS 16 / native 136; buckets: ipc 152, poll_wait 126, harness_diagnostics 15, gc_cc 6, array_buffer_copy 6, engine_stream_read 3, subprocess_pipe_io 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 125; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[unknown]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeOb` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::BaseShape*>,` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 1
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 0, `__syscall_cancel_arch [libc.so.6]` 0); SwComposite 1 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 110 ms: buckets subprocess_pipe_io 110, js_ctypes 110, worker_messaging 110, ipc 110, poll_wait 110; top self: `__syscall_cancel_arch [libc.so.6]` 110
- **tab:7350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7369** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7712** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 542, DOM Worker 259, Renderer 221, SwComposite 147, BgPool 62, WRRenderBackend 56, Compositor 39, other 32, ImageBridge 17, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 542 ms (17.4% of span): Idle 281, GC / CC 98, JavaScript 77, Other 55, DOM 25, Profiler 4
  - JS leaf 8 / native under JS 91 / native 443; buckets: ipc 539, poll_wait 312, gc_cc 174, engine_stream_read 55, harness_diagnostics 33, worker_messaging 30, array_buffer_copy 19, subprocess_pipe_io 19
  - top self: `__syscall_cancel_arch [libc.so.6]` 309; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 16; `[unknown]` 14; `[axiosozo-dev]` 8; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `NS_CycleCollectorSuspect3 [libxul.so]` 5
  - GC/CC markers: GCMajor 1× 104 ms, GCSlice 13× 60 ms, CCSlice 14× 51 ms, GCMinor 1× 1 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 221 ms (top self: `__syscall_cancel_arch [libc.so.6]` 136, `int blendTextureNearestFast<false, glsl::sampler2D` 23, `syscall [libc.so.6]` 15); SwComposite 147 ms (top self: `syscall [libc.so.6]` 112, `void scale_blit<true>(Texture&, IntRect const&, Te` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 3); WRRenderBackend#0 56 ms (top self: `syscall [libc.so.6]` 48, `sched_yield [libc.so.6]` 4, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 62 ms (top self: `__syscall_cancel_arch [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `[linux-vdso.so.1]` 0, `mozilla::ThreadEventQueue::GetEvent(bool, mozilla:` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 259 ms: buckets subprocess_pipe_io 259, worker_messaging 259, ipc 259, js_ctypes 233, poll_wait 226, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 229; `__memset_avx2_unaligned_erms [libc.so.6]` 4; `[unknown]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `EnterJit(JSContext*, js::RunState&, unsigned char*` 1
- **tab:7712** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, gc_cc 4, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<js::gc::MarkingTracerT<8u> >::onObject` 1; `js::gc::StoreBuffer::SlotsEdge::trace(js::gc::TenuringTracer` 1; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString` 1; `non-virtual thunk to nsDocShell::GetInProcessChildCount(int*` 0
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7718** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 252, main 242, Renderer 201, SwComposite 146, BgPool 56, WRRenderBackend 52, Compositor 37, ImageBridge 16, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 242 ms (7.9% of span): Idle 115, JavaScript 68, GC / CC 31, Other 17, DOM 6, Profiler 4
  - JS leaf 6 / native under JS 65 / native 170; buckets: ipc 242, poll_wait 127, gc_cc 107, engine_stream_read 53, worker_messaging 30, subprocess_pipe_io 15, native_receiver 11, array_buffer_copy 9
  - top self: `__syscall_cancel_arch [libc.so.6]` 126; `[unknown]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::PropMap*` 4; `mprotect [libc.so.6]` 3; `[axiosozo-dev]` 3
  - GC/CC markers: GCMajor 1× 54 ms, GCSlice 9× 31 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 201 ms (top self: `__syscall_cancel_arch [libc.so.6]` 107, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 24, `int blendTextureNearestFast<false, glsl::sampler2D` 23); SwComposite 146 ms (top self: `syscall [libc.so.6]` 99, `void scale_blit<true>(Texture&, IntRect const&, Te` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 52 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 3, `webrender::picture::PictureInstance::take_context ` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 16 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `__lll_lock_wake [libc.so.6]` 0, `[axiosozo-dev]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 252 ms: buckets subprocess_pipe_io 252, worker_messaging 252, ipc 252, js_ctypes 232, poll_wait 227, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 227; `[unknown]` 2; `getcontext [libc.so.6]` 1; `js::BoundFunctionObject::call(JSContext*, unsigned` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7712** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): GC / CC 2, Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `bool TraversalTracer::onEdge<js::Scope>(js::Scope**, char co` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `nsCycleCollector::ScanRoots(bool) [libxul.so]` 0; `js::StringPrinter::put(char const*, unsigned long) [libxul.s` 0
  - GC/CC markers: GCMajor 1× 50 ms, CCSlice 1× 2 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7328** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7718** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 518, DOM Worker 237, Renderer 130, SwComposite 85, BgPool 47, WRRenderBackend 35, Compositor 24, other 21, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 518 ms (25.0% of span): Idle 287, JavaScript 85, Other 60, GC / CC 29, DOM 28, Graphics 14
  - JS leaf 9 / native under JS 98 / native 411; buckets: ipc 515, poll_wait 355, gc_cc 104, engine_stream_read 57, worker_messaging 43, paint_layout 39, harness_diagnostics 31, array_buffer_copy 23
  - top self: `__syscall_cancel_arch [libc.so.6]` 313; `[unknown]` 19; `[axiosozo-dev]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `mprotect [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 903 ms, GCSlice 8× 31 ms, GCMinor 2× 4 ms
  - WebRender/compositor threads: Renderer 130 ms (top self: `__syscall_cancel_arch [libc.so.6]` 86, `int blendTextureNearestFast<false, glsl::sampler2D` 13, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7); SwComposite 85 ms (top self: `syscall [libc.so.6]` 74, `void scale_blit<true>(Texture&, IntRect const&, Te` 9, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 46 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `[linux-vdso.so.1]` 0); ImageBridgeChld 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 237 ms: buckets subprocess_pipe_io 237, worker_messaging 237, ipc 237, js_ctypes 201, poll_wait 191, gc_cc 11; top self: `__syscall_cancel_arch [libc.so.6]` 194; `[axiosozo-dev]` 5; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[unknown]` 3; `getcontext [libc.so.6]` 2
- **tab:7718** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7328** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7369** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 476, DOM Worker 236, other 37, Renderer 32, SwComposite 25, Compositor 13, WRRenderBackend 11, WRSceneBuilder 8, BgPool 7, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 476 ms (13.0% of span): Idle 215, JavaScript 85, Other 44, Layout 38, DOM 38, Graphics 24
  - JS leaf 11 / native under JS 152 / native 314; buckets: ipc 474, poll_wait 259, gc_cc 111, paint_layout 76, engine_stream_read 66, worker_messaging 58, harness_diagnostics 31, subprocess_pipe_io 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 231; `[unknown]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `[axiosozo-dev]` 9; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `mozilla::dom::Document::CreateRange(mozilla::ErrorResult&) [` 4
  - GC/CC markers: GCSlice 5× 23 ms, GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 20, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4, `glsl::texture(glsl::sampler2DRect_impl*, glsl::vec` 2); SwComposite 25 ms (top self: `syscall [libc.so.6]` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 11 ms (top self: `syscall [libc.so.6]` 10, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `__memmove_avx_unaligned_erms [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__pthread_mutex_unlock_usercnt [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `void mozilla::MozPromise<mozilla::dom::WriteJSONRe` 1, `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 236 ms: buckets subprocess_pipe_io 236, worker_messaging 236, ipc 236, js_ctypes 227, poll_wait 222, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 223; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::gc::TenuringTracer::traverse(JS::Value*) [libx` 1; `js::TypedArrayObject::ensureHasBuffer(JSContext*, ` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7274** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::CheckIdleMemoryCleanupNeeded(nsITimer*, void*) [lib` 0; `[unknown]` 0; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7369** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7350** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 82, Renderer 23, DOM Worker 13, BgPool 11, Compositor 4, WRRenderBackend 3, IPC I/O 3, WRSceneBuilder 2, SwComposite 1, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 82 ms (27.6% of span): JavaScript 36, Layout 12, Graphics 9, Other 8, Idle 7, GC / CC 6
  - JS leaf 3 / native under JS 44 / native 36; buckets: ipc 82, gc_cc 23, paint_layout 21, array_buffer_copy 16, harness_diagnostics 13, poll_wait 9, engine_stream_read 5, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `mprotect [libc.so.6]` 6; `round [libxul.so]` 3; `[axiosozo-dev]` 3; `XRE_IsParentProcess() [libxul.so]` 3; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 2
  - GC/CC markers: CCSlice 1× 6 ms
  - WebRender/compositor threads: Renderer 23 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `hypotf@@GLIBC_2.35 [libm.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `mozilla::wr::RenderThread::WrNotifierEvent_NewFram` 1, `webrender::batch::BatchBuilder::add_prim_to_batch:` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `<webrender_bindings::bindings::APZCallbacks as web` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 11 ms (top self: `unlink [libc.so.6]` 6, `rmdir [libc.so.6]` 4, `__syscall_cancel_arch [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 13 ms: buckets subprocess_pipe_io 13, worker_messaging 13, ipc 13, poll_wait 12, js_ctypes 12, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 12; `mozilla::dom::CallSetup::CallSetup(mozilla::dom::C` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0
- **tab:7712** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (8.6% of span): Other 10, JavaScript 7, Idle 4, DOM 2, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 19; buckets: ipc 23, paint_layout 10, gc_cc 9, subprocess_pipe_io 7, poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[]` 2; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(` 2; `js::frontend::GeneralParser<js::frontend::SyntaxParseHandler` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 1; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo c` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7274** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 3, gc_cc 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `FulfillMaybeWrappedPromise(JSContext*, JS::Handle<JSObject*>` 1; `js::jit::CallIRGenerator::tryAttachCallScripted(JS::Handle<J` 0; `mozilla::dom::danger::GetJSContext() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7806** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.1% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

