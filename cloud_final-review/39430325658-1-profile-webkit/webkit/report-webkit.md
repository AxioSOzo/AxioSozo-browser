# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **68.0** (DOM Worker 24.0, main 20.0, Renderer 8.0, glean.dispatche 4.0, WRScene~ilder# 4.0) | WPEWebProcess 76.1, WPENetworkProce 12.0, AxioWebKitHost 8.0 | — | 214.0 |
| plain | idle | — | — | **8.8** (main 6.8, Timer 1.0, IPC I/O Parent 0.5, DOM Worker 0.5) | Web Content 3.9, AxioWebKitHost 0.5 | — | — |
| plain | raf | 58.0 | 24.4 | **23.9** (main 10.7, DOM Worker 2.9, Renderer 2.3, WRRende~ckend# 1.6, SwComposite 1.6) | WPEWebProcess 64.1, AxioWebKitHost 7.1, Web Content 0.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.5** (main 5.3, DOM Worker 3.0, Renderer 2.7, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 64.2, AxioWebKitHost 8.7 | — | — |
| plain | scroll | 56.7 | 33.9 | **40.8** (main 21.8, DOM Worker 6.8, Renderer 2.4, Backgro~Pool # 2.4, WRRende~ckend# 1.9) | WPEWebProcess 67.3, AxioWebKitHost 9.8 | — | — |
| plain | key | — | — | **17.9** (main 11.5, Renderer 1.4, DOM Worker 1.4, Timer 0.8, TaskCon~ller # 0.5) | WPEWebProcess 7.5, AxioWebKitHost 1.4, WebExtensions 0.3 | 17.9 | — |
| plain | switch-to-gecko | — | — | **16.1** (main 12.1, Renderer 4.0) | Isolated Web Co 4.0 | — | 214.7 |
| trace | switch-to-engine | — | — | **41.7** (main 14.8, Renderer 11.9, WRScene~ilder# 3.0, WRRende~ckend# 3.0, Backgro~Pool # 3.0) | WPEWebProcess 59.3, WPENetworkProce 8.9, AxioWebKitHost 3.0 | — | 312.7 |
| trace | idle | — | — | **11.6** (main 8.2, TaskCon~ller # 1.4, Timer 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 2.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.8 | 23.5 | **31.3** (main 15.2, DOM Worker 3.9, TaskCon~ller # 2.6, Renderer 2.3, WRRende~ckend# 1.6) | WPEWebProcess 65.2, AxioWebKitHost 8.0, Isolated Web Co 0.3 | — | — |
| trace | raf-nosampler | — | — | **20.2** (main 5.3, DOM Worker 4.6, Renderer 2.7, WRRende~ckend# 1.3, SwComposite 1.3) | WPEWebProcess 65.6, AxioWebKitHost 7.7 | — | — |
| trace | scroll | 57.5 | 33.2 | **44.8** (main 23.3, DOM Worker 6.8, Renderer 2.9, Backgro~Pool # 2.9, TaskCon~ller # 2.4) | WPEWebProcess 67.0, AxioWebKitHost 10.7 | — | — |
| trace | key | — | — | **17.8** (main 11.8, Renderer 1.4, DOM Worker 1.4, TaskCon~ller # 0.8, Timer 0.5) | WPEWebProcess 7.1, AxioWebKitHost 1.7 | 19.3 | — |
| trace | switch-to-gecko | — | — | **28.0** (main 12.0, IPDL Background 4.0, BgIOThr~Pool # 4.0, Renderer 4.0, Compositor 4.0) | Isolated Web Co 8.0, WebExtensions 4.0 | — | 214.7 |
| profile | switch-to-engine | — | — | **42.5** (main 14.2, DOM Worker 14.2, SamplerThread 8.5, IPC I/O Parent 2.8, Backgro~Pool # 2.8) | WPEWebProcess 71.0, Web Content 68.1, WPENetworkProce 8.5, AxioWebKitHost 2.8 | — | 312.6 |
| profile | idle | — | — | **27.2** (SamplerThread 8.6, main 8.1, DOM Worker 7.6, Timer 1.4, TaskCon~ller # 1.0) | Web Content 9.6, WebExtensions 1.9, Isolated Web Co 1.9, RDD Process 1.4 | — | — |
| profile | raf | 58.0 | 26.5 | **52.6** (main 16.4, DOM Worker 11.2, SamplerThread 10.9, Renderer 2.9, WRRende~ckend# 1.9) | WPEWebProcess 65.8, Web Content 9.0, AxioWebKitHost 8.0, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **39.4** (DOM Worker 11.3, SamplerThread 9.3, main 7.6, Renderer 2.6, WRRende~ckend# 2.0) | WPEWebProcess 66.6, Web Content 8.9, AxioWebKitHost 7.9, WebExtensions 1.7 | — | — |
| profile | scroll | 56.8 | 34.6 | **71.3** (main 28.3, DOM Worker 14.8, SamplerThread 10.5, Renderer 2.9, Backgro~Pool # 2.4) | WPEWebProcess 69.5, AxioWebKitHost 10.6, Web Content 7.7, WebExtensions 1.9 | — | — |
| profile | key | — | — | **46.5** (main 17.7, DOM Worker 9.8, SamplerThread 9.8, Timer 1.9, TaskCon~ller # 1.9) | Web Content 9.8, WPEWebProcess 7.7, WebExtensions 2.5, Privileged Cont 2.2 | 20.9 | — |
| profile | switch-to-gecko | — | — | **39.2** (main 15.8, Socket Thread 3.9, BgIOThr~Pool # 3.9, Renderer 3.9, WRScene~ilder# 3.9) | Isolated Web Co 7.9 | — | 221.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 71.2 | 0.0 | — | 1.55 | 0.46 | — | — | — | — | — | 0.003 |
| trace | raf | 57.7 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.13 | 0.12 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 58.0 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.14 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 56.3 | 0.0 | 0 | 0.0 | — | — | 9.7 | 0.0 | — | 0.33 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 7.3 | 0.0 | — | 0.11 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.3 | 0.0 | 0 | 0.0 | — | — | 92.3 | 0.0 | — | 1.48 | 0.67 | — | — | — | — | — | 0.004 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.15 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.17 | 0.18 | — | — | — | — | — | 0.012 |
| profile | scroll | 55.5 | 0.0 | 0 | 0.0 | — | — | 9.0 | 0.0 | — | 0.37 | 0.16 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.11 | 0.14 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.908 | 1.862 | 0.0067 | 0.0138 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.044 | 0.076 | 0.0026 | 0.0044 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.065 | 0.102 | 0.0038 | 0.0059 |
| plain | scroll | memfd | native | 115 | 115 | 0.212 | 0.230 | 0.0117 | 0.0127 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.077 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.874 | 1.764 | 0.0048 | 0.0097 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.047 | 0.079 | 0.0027 | 0.0046 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.054 | 0.091 | 0.0031 | 0.0053 |
| trace | scroll | memfd | native | 117 | 117 | 0.231 | 0.241 | 0.0130 | 0.0136 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.081 | 0.0000 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.124 | 1.987 | 0.0060 | 0.0105 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 183 | 182 | 0.048 | 0.103 | 0.0028 | 0.0060 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.066 | 0.107 | 0.0038 | 0.0062 |
| profile | scroll | memfd | native | 117 | 117 | 0.234 | 0.273 | 0.0130 | 0.0151 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.079 | 0.0000 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 15.4 | 0.0 | — | 0.11 | 0.32 | — | — | 13.0 | 16.4 | 31.1 |
| profile | 0.7 | 17.3 | 0.0 | — | 0.11 | 0.43 | — | — | 9.5 | 18.2 | 27.5 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 31.1; first stdout read resolved 34.7; first frame applied (native receiver) 336.3; write frame_ack 337.1; write visibility 341.0; write focus 341.2

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 18.4; first stdout read resolved 24.4

Switch timeline (profile, switch-to-engine, ms after the window start): write create 33.5; first stdout read resolved 37.7; first frame applied (native receiver) 331.0; write frame_ack 332.0; write visibility 339.8; write focus 340.0

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 30.6; first stdout read resolved 39.6

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 49, DOM Worker 31, Renderer 17, BgPool 6, Compositor 4, IPC I/O 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 49 ms (13.1% of span): JavaScript 20, Idle 10, Layout 6, Other 5, DOM 3, Graphics 3
  - JS leaf 0 / native under JS 28 / native 21; buckets: ipc 49, gc_cc 19, poll_wait 14, array_buffer_copy 13, harness_diagnostics 11, paint_layout 11, engine_stream_read 5, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 16; `u_charType_78 [libxul.so]` 3; `nsIFrame::IsHiddenByContentVisibilityOfInFlowParentForLayout` 2; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 2; `[unknown]` 1; `__lll_lock_wait [libc.so.6]` 1
  - WebRender/compositor threads: Renderer 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 6, `ClearTexSubImage [libxul.so]` 4, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 3); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 1 ms (top self: `sched_yield [libc.so.6]` 1, `syscall [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 31 ms: buckets subprocess_pipe_io 31, worker_messaging 31, ipc 31, js_ctypes 29, poll_wait 29, array_buffer_copy 1; top self: `__syscall_cancel_arch [libc.so.6]` 29; `void* js::gc::CellAllocator::AllocTenuredCellForNu` 1; `mozilla::ProfileBufferEntryWriter::Serializer<mozi` 1; `__lll_lock_wait [libc.so.6]` 0
- **tab:7879** CPU ms by thread group: main 64, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 64 ms (22.3% of span): Other 51, DOM 5, JavaScript 4, Profiler 2, Idle 1, GC / CC 1
  - JS leaf 1 / native under JS 7 / native 56; buckets: ipc 49, array_buffer_copy 20, gc_cc 15, subprocess_pipe_io 6, memcpy_memset 2, poll_wait 1, json_metadata 1
  - top self: `[]` 9; `__strlen_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[libexpat.so.1]` 3; `qcms::transform_util::compute_precache [libxul.so]` 2; `__memcmp_avx2_movbe [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7885** CPU ms by thread group: main 51, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 51 ms (17.5% of span): Other 40, JavaScript 6, Profiler 2, DOM 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 6 / native 45; buckets: ipc 38, array_buffer_copy 15, gc_cc 11, subprocess_pipe_io 4, memcpy_memset 2, poll_wait 2, canvas_2d 1, json_metadata 1
  - top self: `[libexpat.so.1]` 6; `[]` 4; `char* mozilla::detail::DuplicateString<char, 4096ul, 1ul>(ch` 3; `mmap64 [libc.so.6]` 2; `_uhash_rehash(UHashtable*, UErrorCode*) [libxul.so]` 2; `JS::SetAVXEnabled(bool) [libxul.so]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7739** CPU ms by thread group: main 2, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `<core::str::lossy::Utf8Chunks as core::iter::traits::iterato` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 158, DOM Worker 111, other 20, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 158 ms (7.5% of span): Idle 127, JavaScript 15, Other 10, DOM 4, Profiler 2, GC / CC 0
  - JS leaf 2 / native under JS 15 / native 141; buckets: ipc 158, poll_wait 132, harness_diagnostics 16, gc_cc 8, array_buffer_copy 6, engine_stream_read 2, memcpy_memset 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 130; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 2; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `validLinuxRoot (chrome://browser/content/axiosozo/WebKitEngi` 1; `mprotect [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRSceneBuilderLP#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 111 ms: buckets subprocess_pipe_io 111, worker_messaging 111, ipc 111, js_ctypes 111, poll_wait 111, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 111
- **tab:7739** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7337** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 475, DOM Worker 267, Renderer 84, WRRenderBackend 47, SwComposite 42, Compositor 39, BgPool 33, other 31, ImageBridge 17, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 475 ms (15.1% of span): Idle 276, JavaScript 98, Other 40, GC / CC 32, DOM 24, Profiler 6
  - JS leaf 12 / native under JS 105 / native 358; buckets: ipc 471, poll_wait 292, gc_cc 123, engine_stream_read 63, worker_messaging 40, harness_diagnostics 37, subprocess_pipe_io 25, native_receiver 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 290; `[unknown]` 23; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `[linux-vdso.so.1]` 4; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) ` 4
  - GC/CC markers: GCMajor 1× 1047 ms, GCSlice 8× 29 ms, CCSlice 3× 7 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 84 ms (top self: `__syscall_cancel_arch [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `syscall [libc.so.6]` 4); WRRenderBackend#0 47 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 2, `webrender::space::SpaceSnapper::snap_rect_rounded ` 0); SwComposite 42 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 33 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 16, `__lll_lock_wait [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 267 ms: buckets subprocess_pipe_io 267, worker_messaging 267, ipc 267, js_ctypes 246, poll_wait 238, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 242; `[unknown]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:7739** CPU ms by thread group: main 6, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 3, GC / CC 2, Profiler 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 4, poll_wait 4, gc_cc 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 1; `__lll_lock_wake [libc.so.6]` 0; `__internal_syscall_cancel [libc.so.6]` 0; `js::GenericTracerImpl<js::gc::UnmarkGrayTracer<1u> >::onShap` 0; `prctl [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 35 ms, GCSlice 4× 2 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7745** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 273, main 213, Renderer 83, WRRenderBackend 48, SwComposite 43, Compositor 40, BgPool 39, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 213 ms (7.0% of span): Idle 104, JavaScript 67, DOM 21, Other 16, Profiler 3, GC / CC 2
  - JS leaf 7 / native under JS 82 / native 125; buckets: ipc 212, poll_wait 113, gc_cc 83, engine_stream_read 67, worker_messaging 38, subprocess_pipe_io 20, native_receiver 14, array_buffer_copy 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 113; `[unknown]` 15; `mprotect [libc.so.6]` 4; `[axiosozo-dev]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `js::Atomize(JSContext*, char const*, unsigned long, mozilla:` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 83 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `syscall [libc.so.6]` 4); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 41, `sched_yield [libc.so.6]` 3, `[axiosozo-dev]` 0); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 37 ms (top self: `__syscall_cancel_arch [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `pthread_mutex_destroy@@GLIBC_2.2.5 [libc.so.6]` 0); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `nsTArrayInfallibleAllocator::ResultTypeProxy nsTAr` 0, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1, `access [libc.so.6]` 1)
  - busiest DOM Worker 261 ms: buckets subprocess_pipe_io 261, worker_messaging 261, ipc 261, js_ctypes 238, poll_wait 233, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 234; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 3; `[unknown]` 2; `mozilla::dom::StructuredCloneHolder::MaybeClearTra` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:7337** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 547, DOM Worker 255, BgPool 61, Renderer 56, WRRenderBackend 35, Compositor 27, SwComposite 24, other 20, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 547 ms (26.0% of span): Idle 289, JavaScript 113, Other 62, DOM 28, Graphics 21, GC / CC 16
  - JS leaf 13 / native under JS 119 / native 415; buckets: ipc 544, poll_wait 365, gc_cc 104, engine_stream_read 63, paint_layout 56, worker_messaging 48, harness_diagnostics 44, array_buffer_copy 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 316; `[unknown]` 21; `[axiosozo-dev]` 9; `mprotect [libc.so.6]` 5; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `nsOuterWindowProxy::get(JSContext*, JS::Handle<JSObject*>, J` 5
  - GC/CC markers: CCSlice 3× 8 ms, GCSlice 4× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 40, `syscall [libc.so.6]` 6, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 35 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1); SwComposite 24 ms (top self: `syscall [libc.so.6]` 23, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 61 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `Pickle::Pickle(unsigned int, unsigned long) [libxu` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 255 ms: buckets subprocess_pipe_io 255, worker_messaging 254, ipc 254, js_ctypes 225, poll_wait 214, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 221; `[unknown]` 3; `js::jit::JSJitFrameIter::checkInvalidation(js::jit` 2; `__lll_lock_wait [libc.so.6]` 2; `[axiosozo-dev]` 2
- **tab:7745** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7379** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7739** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 598, DOM Worker 255, Renderer 57, other 35, SwComposite 20, Compositor 18, WRRenderBackend 17, WRWorker 12, WRSceneBuilder 10, BgPool 2, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 598 ms (16.2% of span): Idle 242, JavaScript 91, GC / CC 81, Other 54, Graphics 41, DOM 37
  - JS leaf 9 / native under JS 154 / native 435; buckets: ipc 597, poll_wait 288, gc_cc 179, paint_layout 93, worker_messaging 76, engine_stream_read 67, harness_diagnostics 40, array_buffer_copy 27
  - top self: `__syscall_cancel_arch [libc.so.6]` 264; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 18; `[axiosozo-dev]` 14; `[unknown]` 9; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 7; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 7
  - GC/CC markers: GCMajor 2× 1337 ms, GCSlice 16× 66 ms, CCSlice 5× 15 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 57 ms (top self: `__syscall_cancel_arch [libc.so.6]` 24, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 19, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); SwComposite 20 ms (top self: `syscall [libc.so.6]` 17, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `void scale_blit<true>(Texture&, IntRect const&, Te` 0); WRRenderBackend#0 17 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `mozilla::wr::RenderThread::WrNotifierEvent_NewFram` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 255 ms: buckets subprocess_pipe_io 255, worker_messaging 255, ipc 255, js_ctypes 242, poll_wait 237, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 237; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `[axiosozo-dev]` 1; `mozilla::EventListenerManager::HandleEventSingleLi` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7274** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 0; `non-virtual thunk to nsDocShell::GetWindow() [libxul.so]` 0; `mozilla::dom::WindowContext_Binding::get_isInBFCache(JSConte` 0; `NS_CycleCollectorSuspect3 [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7360** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::NodeController::ForwardEvent(mojo::core::ports` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7745** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 94, Renderer 32, DOM Worker 15, BgPool 12, WRRenderBackend 4, Compositor 4, WRSceneBuilder 3, IPC I/O 3, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 94 ms (29.7% of span): JavaScript 30, Layout 24, DOM 12, Graphics 10, Other 6, Idle 6
  - JS leaf 3 / native under JS 47 / native 44; buckets: ipc 94, paint_layout 32, array_buffer_copy 26, gc_cc 16, harness_diagnostics 15, engine_stream_read 8, poll_wait 7, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[unknown]` 4; `nsLayoutUtils::ComputeCBDependentValue(int, mozilla::UniqueO` 4; `mozilla::StyleGenericBackgroundSize<mozilla::StyleLengthPerc` 3; `mozilla::dom::BindingJSObjectCreator<nsWindowRoot>::CreateOb` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 32 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 6, `ps_quad_textured_TEXTURE_RECT_vert::quad_primive_i` 5, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `[axiosozo-dev]` 0, `mozilla::gfx::RecordedDrawTargetCreation::Recorded` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 12 ms (top self: `fstatat64 [libc.so.6]` 5, `rmdir [libc.so.6]` 4, `getdents64 [libc.so.6]` 1); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 14, js_ctypes 14; top self: `__syscall_cancel_arch [libc.so.6]` 14; `[axiosozo-dev]` 1; `mozilla::dom::WorkerThreadRunnable::Run() [libxul.` 0
- **tab:7739** CPU ms by thread group: main 32, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 32 ms (9.9% of span): JavaScript 12, Other 10, Idle 5, Layout 3, Profiler 1, DOM 1
  - JS leaf 0 / native under JS 11 / native 20; buckets: ipc 28, gc_cc 11, subprocess_pipe_io 8, poll_wait 5, memcpy_memset 2, paint_layout 1, canvas_2d 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `nsGlobalWindowOuter::GetGlobalJSObject() [libxul.so]` 3; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsStyleUIReset::~nsStyleUIReset() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7274** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.3% of span): Idle 3, Other 1, JavaScript 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `g_io_channel_get_buffer_condition [libglib-2.0.so.0]` 0; `mozilla::dom::CallSetup::CheckBeforeExecution(nsIGlobalObjec` 0; `ResolvePromise(JSContext*, JS::Handle<js::PromiseObject*>, J` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7337** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

