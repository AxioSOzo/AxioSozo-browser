# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **79.8** (Renderer 31.2, main 20.8, DOM Worker 17.3, Backgro~Pool # 3.5, WRRende~ckend# 3.5) | WPEWebProcess 86.5, AxioWebKitHost 10.4, WPENetworkProce 10.4 | — | 249.1 |
| plain | idle | — | — | **9.7** (main 6.7, glean.dispatche 1.0, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.4, forkserver 0.5 | — | — |
| plain | raf | 56.6 | 41.3 | **46.6** (main 16.4, Renderer 5.8, DOM Worker 4.2, BgIOThr~Pool # 3.8, SwComposite 3.2) | WPEWebProcess 184.6, AxioWebKitHost 20.8, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **27.1** (Renderer 6.3, main 5.0, SwComposite 3.6, DOM Worker 3.3, Backgro~Pool # 3.0) | WPEWebProcess 185.4, AxioWebKitHost 21.5, Privileged Cont 0.3 | — | — |
| plain | scroll | 53.6 | 35.3 | **53.0** (main 20.9, Backgro~Pool # 9.0, DOM Worker 8.5, Renderer 5.2, SwComposite 3.3) | WPEWebProcess 188.4, AxioWebKitHost 23.2 | — | — |
| plain | key | — | — | **88.9** (main 28.5, DOM Worker 19.8, IndexedDB IO # 16.0, IPDL Background 6.5, TaskCon~ller # 3.8) | WPEWebProcess 18.3, AxioWebKitHost 2.7, WebExtensions 0.6, Utility Process 0.3 | 29.4 | — |
| plain | switch-to-gecko | — | — | **44.2** (main 16.1, Renderer 12.1, Socket Thread 4.0, WRRende~ckend# 4.0, sqldb:p~lite # 4.0) | Isolated Web Co 4.0 | — | 216.3 |
| trace | switch-to-engine | — | — | **76.9** (Renderer 44.3, main 23.3, Compositor 4.7, WRScene~ilder# 2.3, WRRende~ckend# 2.3) | WPEWebProcess 84.0, AxioWebKitHost 7.0, WPENetworkProce 7.0, Privileged Cont 2.3 | — | 397.8 |
| trace | idle | — | — | **13.0** (main 7.7, DOM Worker 2.9, TaskCon~ller # 1.4, Timer 1.0) | AxioWebKitHost 0.5, Web Content 0.5 | — | — |
| trace | raf | 57.8 | 25.7 | **33.9** (main 13.2, Renderer 5.8, SwComposite 3.5, DOM Worker 3.5, Backgro~Pool # 2.9) | WPEWebProcess 187.5, AxioWebKitHost 20.9 | — | — |
| trace | raf-nosampler | — | — | **28.2** (Renderer 6.3, main 6.0, SwComposite 3.6, DOM Worker 3.6, Backgro~Pool # 3.0) | WPEWebProcess 187.1, AxioWebKitHost 20.5, Web Content 0.3 | — | — |
| trace | scroll | 55.4 | 33.7 | **54.9** (main 22.3, DOM Worker 8.6, Backgro~Pool # 8.6, Renderer 5.7, SwComposite 2.9) | WPEWebProcess 185.4, AxioWebKitHost 22.3 | — | — |
| trace | key | — | — | **18.8** (main 10.6, Renderer 2.7, SwComposite 1.4, DOM Worker 1.4, glean.dispatche 0.5) | WPEWebProcess 18.0, AxioWebKitHost 2.2 | 27.0 | — |
| trace | switch-to-gecko | — | — | **41.0** (main 12.3, Renderer 12.3, Socket Thread 4.1, DOM Worker 4.1, BgIOThr~Pool # 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 217.4 |
| profile | switch-to-engine | — | — | **49.6** (main 14.6, DOM Worker 11.7, SamplerThread 11.7, TaskCon~ller # 2.9, Renderer 2.9) | WPEWebProcess 67.2, Web Content 14.6, WPENetworkProce 8.8, AxioWebKitHost 5.8 | — | 303.7 |
| profile | idle | — | — | **28.7** (main 8.6, SamplerThread 8.6, DOM Worker 8.1, Timer 1.9, IPC I/O Parent 0.5) | Web Content 9.1, Isolated Web Co 2.4, Socket Process 1.9, WebExtensions 1.4 | — | — |
| profile | raf | 58.0 | 23.8 | **54.6** (main 16.5, DOM Worker 9.8, SamplerThread 8.5, Renderer 6.0, SwComposite 3.2) | WPEWebProcess 190.1, AxioWebKitHost 21.8, Web Content 7.6, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **45.9** (DOM Worker 10.2, SamplerThread 8.3, main 7.6, Renderer 6.6, SwComposite 3.3) | WPEWebProcess 189.8, AxioWebKitHost 22.1, Web Content 7.3, Privileged Cont 1.7 | — | — |
| profile | scroll | 53.1 | 35.4 | **74.8** (main 27.6, DOM Worker 14.3, Backgro~Pool # 9.2, SamplerThread 7.4, Renderer 6.5) | WPEWebProcess 191.6, AxioWebKitHost 24.9, Web Content 8.3, Privileged Cont 2.3 | — | — |
| profile | key | — | — | **55.5** (main 16.0, BgIOThr~Pool # 10.3, DOM Worker 10.0, SamplerThread 10.0, Renderer 3.2) | WPEWebProcess 18.4, Web Content 9.7, AxioWebKitHost 2.8, Privileged Cont 2.4 | 29.1 | — |
| profile | switch-to-gecko | — | — | **53.2** (main 11.4, Renderer 11.4, DOM Worker 7.6, WRRende~ckend# 3.8, Compositor 3.8) | Isolated Web Co 7.6 | — | 225.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.3 | 0.0 | 0 | 0.0 | — | — | 127.5 | 0.0 | — | 2.98 | 0.45 | — | — | — | — | — | 0.002 |
| trace | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.2 | 0.0 | — | 0.31 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.31 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 54.2 | 0.0 | 0 | 0.0 | — | — | 12.2 | 0.0 | — | 0.86 | 0.14 | — | — | — | — | — | 0.008 |
| trace | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 14.4 | 0.0 | — | 0.09 | 0.12 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.4 | 0.0 | 0 | 0.0 | — | — | 94.9 | 0.0 | — | 3.18 | 0.68 | — | — | — | — | — | 0.004 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.34 | 0.16 | — | — | — | — | — | 0.013 |
| profile | raf-nosampler | 58.1 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.31 | 0.17 | — | — | — | — | — | 0.012 |
| profile | scroll | 51.1 | 0.0 | 0 | 0.0 | — | — | 10.1 | 0.0 | — | 1.48 | 0.17 | — | — | — | — | — | 0.014 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.13 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.744 | 5.638 | 0.0176 | 0.0362 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.189 | 0.302 | 0.0108 | 0.0172 |
| plain | raf-nosampler | memfd | native | 177 | 177 | 0.283 | 0.342 | 0.0165 | 0.0199 |
| plain | scroll | memfd | native | 111 | 111 | 0.790 | 0.869 | 0.0413 | 0.0454 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.227 | 0.0000 | 0.0012 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 2.749 | 5.287 | 0.0118 | 0.0226 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 182 | 182 | 0.189 | 0.297 | 0.0110 | 0.0172 |
| trace | raf-nosampler | memfd | native | 177 | 177 | 0.211 | 0.283 | 0.0123 | 0.0165 |
| trace | scroll | memfd | native | 115 | 115 | 0.752 | 0.891 | 0.0408 | 0.0483 |
| trace | key | memfd | native | 20 | 20 | 0.002 | 0.193 | 0.0000 | 0.0010 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.029 | 6.416 | 0.0164 | 0.0347 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 186 | 186 | 0.211 | 0.299 | 0.0123 | 0.0174 |
| profile | raf-nosampler | memfd | native | 178 | 178 | 0.193 | 0.277 | 0.0112 | 0.0161 |
| profile | scroll | memfd | native | 112 | 112 | 1.018 | 1.233 | 0.0520 | 0.0630 |
| profile | key | memfd | native | 20 | 20 | 0.002 | 0.232 | 0.0000 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 23.1 | 0.0 | — | 0.09 | 0.32 | — | — | 10.9 | 23.9 | 34.5 |
| profile | 0.6 | 25.6 | 0.1 | — | 0.13 | 0.52 | — | — | 9.9 | 27.3 | 35.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 53.5; first stdout read resolved 56.2; first frame applied (native receiver) 436.6; write frame_ack 437.3; write visibility 440.9; write focus 441.1

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 17.6; first stdout read resolved 23.8

Switch timeline (profile, switch-to-engine, ms after the window start): write create 35.9; first stdout read resolved 39.4; first frame applied (native receiver) 321.9; write frame_ack 323.0; write visibility 333.1; write focus 333.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 29.7; first stdout read resolved 40.9

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 49, Renderer 24, DOM Worker 23, BgPool 18, Compositor 4, WRRenderBackend 2, WRSceneBuilder 2, IPC I/O 2, SwComposite 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 49 ms (13.3% of span): JavaScript 16, Idle 9, Layout 7, DOM 7, Graphics 3, GC / CC 3
  - JS leaf 0 / native under JS 31 / native 18; buckets: ipc 49, gc_cc 23, paint_layout 13, array_buffer_copy 11, harness_diagnostics 11, poll_wait 9, engine_stream_read 8, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 9; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&,` 3; `mozilla::dom::Document::GetTitleElement() [libxul.so]` 3; `mprotect [libc.so.6]` 2; `js::EqualChars(JSLinearString const*, JSLinearString const*)` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 8 ms
  - WebRender/compositor threads: Renderer 24 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 7, `ClearTexSubImage [libxul.so]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 2 ms (top self: `sched_yield [libc.so.6]` 1, `crossbeam_channel::channel::Receiver<T>::recv [lib` 1, `syscall [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 18 ms (top self: `ARGBSetRow_X86 [libxul.so]` 9, `__syscall_cancel_arch [libc.so.6]` 4, `__memset_avx2_unaligned_erms [libc.so.6]` 3); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 23 ms: buckets subprocess_pipe_io 23, worker_messaging 23, ipc 23, js_ctypes 21, poll_wait 21, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 22; `getcontext [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0; `mozilla::detail::HashTable<mozilla::Span<char, 184` 0
- **tab:9523** CPU ms by thread group: main 56, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 56 ms (15.8% of span): Other 44, JavaScript 4, DOM 4, Profiler 3, Idle 2, GC / CC 1
  - JS leaf 0 / native under JS 7 / native 50; buckets: ipc 43, array_buffer_copy 21, gc_cc 15, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 2, image_container 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `[]` 3; `[libexpat.so.1]` 3; `__memcmp_avx2_movbe [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `mozilla::dom::InitScriptSettings() [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 6 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9383** CPU ms by thread group: main 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 1 ms (0.3% of span): Idle 1, Graphics 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9529** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 166, DOM Worker 117, other 20, IPC I/O 1, Socket 1, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0, BgPool 0
  - main thread 166 ms (7.9% of span): Idle 129, JavaScript 12, Other 10, DOM 7, GC / CC 7, Profiler 2
  - JS leaf 1 / native under JS 18 / native 148; buckets: ipc 166, poll_wait 134, harness_diagnostics 16, gc_cc 10, array_buffer_copy 6, engine_stream_read 4, worker_messaging 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 133; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 1; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: CCSlice 2× 4 ms, GCSlice 2× 3 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 117 ms: buckets subprocess_pipe_io 117, js_ctypes 117, worker_messaging 117, ipc 117, poll_wait 117; top self: `__syscall_cancel_arch [libc.so.6]` 117
- **tab:8962** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9387** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8984** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 490, DOM Worker 248, Renderer 179, SwComposite 99, BgPool 90, WRRenderBackend 55, Compositor 43, other 29, ImageBridge 18, WRSceneBuilder 8, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 490 ms (15.3% of span): Idle 329, JavaScript 93, Other 34, DOM 27, Profiler 5, GC / CC 2
  - JS leaf 15 / native under JS 101 / native 374; buckets: ipc 489, poll_wait 354, gc_cc 80, engine_stream_read 57, harness_diagnostics 48, worker_messaging 36, native_receiver 21, array_buffer_copy 20
  - top self: `__syscall_cancel_arch [libc.so.6]` 347; `[unknown]` 14; `[axiosozo-dev]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 7; `__lll_lock_wake [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 179 ms (top self: `__syscall_cancel_arch [libc.so.6]` 119, `__memmove_avx_unaligned_erms [libc.so.6]` 32, `syscall [libc.so.6]` 18); SwComposite 99 ms (top self: `syscall [libc.so.6]` 92, `__memmove_avx_unaligned_erms [libc.so.6]` 7); WRRenderBackend#0 55 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 12, `crossbeam_channel::channel::Sender<T>::send [libxu` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 90 ms (top self: `__syscall_cancel_arch [libc.so.6]` 72, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `[linux-vdso.so.1]` 0, `Pickle::WriteBytes(void const*, unsigned int) [lib` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 248 ms: buckets subprocess_pipe_io 248, worker_messaging 248, ipc 248, js_ctypes 220, poll_wait 210, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 213; `[axiosozo-dev]` 4; `mozilla::dom::TimeoutExecutor::MaybeSchedule(mozil` 3; `moz_xmalloc [axiosozo-dev]` 3; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 3
- **tab:9523** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8984** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9529** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ipc::MessageChannel::Send(std::unique_ptr<IPC::Mess` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0; `g_source_ref [libglib-2.0.so.0]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 242, main 216, Renderer 175, SwComposite 100, BgPool 84, WRRenderBackend 53, Compositor 42, ImageBridge 18, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 216 ms (7.1% of span): Idle 136, JavaScript 52, Other 16, DOM 11, GC / CC 1
  - JS leaf 8 / native under JS 51 / native 157; buckets: ipc 213, poll_wait 142, gc_cc 66, engine_stream_read 45, worker_messaging 34, native_receiver 17, subprocess_pipe_io 9, array_buffer_copy 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 141; `[unknown]` 10; `[linux-vdso.so.1]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[axiosozo-dev]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2
  - WebRender/compositor threads: Renderer 175 ms (top self: `__syscall_cancel_arch [libc.so.6]` 115, `__memmove_avx_unaligned_erms [libc.so.6]` 40, `syscall [libc.so.6]` 13); SwComposite 100 ms (top self: `syscall [libc.so.6]` 87, `__memmove_avx_unaligned_erms [libc.so.6]` 12, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 53 ms (top self: `syscall [libc.so.6]` 39, `sched_yield [libc.so.6]` 11, `webrender::visibility::update_prim_visibility [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 85 ms (top self: `__syscall_cancel_arch [libc.so.6]` 69, `__memmove_avx_unaligned_erms [libc.so.6]` 14, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `__lll_lock_wake [libc.so.6]` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 242 ms: buckets subprocess_pipe_io 242, worker_messaging 242, ipc 242, js_ctypes 225, poll_wait 222, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 225; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `[linux-vdso.so.1]` 1; `getcontext [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1
- **tab:8962** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9523** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9387** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 559, DOM Worker 278, BgPool 178, Renderer 118, SwComposite 62, WRRenderBackend 38, Compositor 27, other 17, ImageBridge 11, WRSceneBuilder 6, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 559 ms (25.6% of span): Idle 329, JavaScript 107, Other 61, DOM 27, Graphics 15, Profiler 10
  - JS leaf 11 / native under JS 120 / native 428; buckets: ipc 559, poll_wait 381, gc_cc 100, engine_stream_read 69, worker_messaging 56, paint_layout 51, harness_diagnostics 39, subprocess_pipe_io 36
  - top self: `__syscall_cancel_arch [libc.so.6]` 360; `[unknown]` 21; `__lll_lock_wait [libc.so.6]` 9; `__lll_lock_wake [libc.so.6]` 7; `[axiosozo-dev]` 6; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 4
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 118 ms (top self: `__syscall_cancel_arch [libc.so.6]` 75, `__memmove_avx_unaligned_erms [libc.so.6]` 22, `syscall [libc.so.6]` 15); SwComposite 62 ms (top self: `syscall [libc.so.6]` 59, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 38 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 7, `__lll_lock_wake [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 178 ms (top self: `__syscall_cancel_arch [libc.so.6]` 129, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 278 ms: buckets subprocess_pipe_io 278, worker_messaging 278, ipc 278, js_ctypes 244, poll_wait 235, gc_cc 13; top self: `__syscall_cancel_arch [libc.so.6]` 241; `[axiosozo-dev]` 7; `__lll_lock_wake [libc.so.6]` 4; `getcontext [libc.so.6]` 3; `mozilla::dom::FunctionOrTrustedScriptOrString::Try` 3
- **tab:8984** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9529** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8962** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 544, BgPool 368, DOM Worker 262, Renderer 114, SwComposite 53, other 36, WRRenderBackend 18, Compositor 17, WRWorker 11, WRSceneBuilder 9, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 544 ms (14.6% of span): Idle 275, JavaScript 98, Graphics 46, Other 43, DOM 30, Layout 30
  - JS leaf 10 / native under JS 149 / native 385; buckets: ipc 538, poll_wait 316, gc_cc 108, paint_layout 86, engine_stream_read 76, worker_messaging 69, harness_diagnostics 39, subprocess_pipe_io 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 277; `[unknown]` 19; `[axiosozo-dev]` 12; `__internal_syscall_cancel [libc.so.6]` 7; `[linux-vdso.so.1]` 6; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6
  - GC/CC markers: CCSlice 2× 5 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 113 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 43, `__syscall_cancel_arch [libc.so.6]` 26, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 12); SwComposite 53 ms (top self: `syscall [libc.so.6]` 32, `__memmove_avx_unaligned_erms [libc.so.6]` 20, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BgIOThreadPool #3 363 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 337, `__syscall_cancel_arch [libc.so.6]` 22, `LZ4F_flush [libxul.so]` 3); BackgroundThreadPool #3 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2)
  - busiest DOM Worker 262 ms: buckets subprocess_pipe_io 262, worker_messaging 262, ipc 262, js_ctypes 245, poll_wait 239, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 241; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 5; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 1; `[axiosozo-dev]` 1
- **tab:8911** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 4, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 5; buckets: ipc 6, poll_wait 4, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::jit::JitHintsMap::getIonThresholdHint(JSScript*, unsigne` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JS_WrapObject(JSContext*, JS::MutableHandle<JSObject*>) [lib` 0; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JS` 0; `mozilla::dom::MessageListener::ReceiveMessage(mozilla::dom::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9003** CPU ms by thread group: main 5, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.1% of span): Idle 3, DOM 2, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 3; buckets: ipc 5, poll_wait 3, gc_cc 2, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `nsTHashtable<AtomTableEntry>::s_HashKey(void const*) [libxul` 1; `bool mozilla::HashSet<js::jit::ExecutablePool*, mozilla::Def` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::` 1; `js::jit::MacroAssembler::Push(js::jit::Register) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8962** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 85, Renderer 59, DOM Worker 16, BgPool 11, SwComposite 5, Compositor 4, WRRenderBackend 4, IPC I/O 3, WRSceneBuilder 3, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 85 ms (27.3% of span): JavaScript 39, Layout 14, Graphics 13, Other 11, DOM 4, Idle 2
  - JS leaf 4 / native under JS 41 / native 41; buckets: ipc 85, paint_layout 29, array_buffer_copy 23, harness_diagnostics 12, poll_wait 11, gc_cc 7, worker_messaging 7, engine_stream_read 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 10; `mozilla::DisplayListClipState::AutoSaveRestore::AutoSaveRest` 7; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 7; `[unknown]` 5; `selectors::matching::matches_simple_selector [libxul.so]` 4; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4
  - WebRender/compositor threads: Renderer 59 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 9, `hypotf@@GLIBC_2.35 [libm.so.6]` 8); SwComposite 5 ms (top self: `syscall [libc.so.6]` 5); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 2, `webrender::prepare::prepare_prim_for_render [libxu` 0)
  - background pools (native receiver queue): BgIOThreadPool #3 11 ms (top self: `unlink [libc.so.6]` 3, `__open_nocancel [libc.so.6]` 3, `fstatat64 [libc.so.6]` 2); BackgroundThreadPool #3 0 ms (top self: `syscall [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, js_ctypes 15, poll_wait 14; top self: `__syscall_cancel_arch [libc.so.6]` 15; `getcontext [libc.so.6]` 1; `js::ctypes::StructType::LookupField(JSContext*, JS` 0
- **tab:9383** CPU ms by thread group: main 29, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 29 ms (9.2% of span): Other 9, JavaScript 8, Idle 5, DOM 3, Layout 2, Graphics 1
  - JS leaf 1 / native under JS 7 / native 21; buckets: ipc 26, gc_cc 7, poll_wait 5, subprocess_pipe_io 4, paint_layout 2, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `js::frontend::GeneralParser<js::frontend::FullParseHandler, ` 2; `defineProperty (self-hosted:2717:30)[16]` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8911** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (1.8% of span): Idle 5, JavaScript 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `XPCConvert::NativeInterface2JSObject(JSContext*, JS::Mutable` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[6` 0; `xpc::JSXrayTraits::resolveOwnProperty(JSContext*, JS::Handle` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9523** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

