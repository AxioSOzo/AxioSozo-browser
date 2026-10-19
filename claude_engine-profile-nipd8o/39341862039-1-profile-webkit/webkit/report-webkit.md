# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **39.6** (main 15.8, DOM Worker 12.7, Renderer 6.3, glean.dispatche 1.6, IPDL Background 1.6) | WPEWebProcess 64.9, AxioWebKitHost 15.8, WPENetworkProce 11.1 | — | 601.5 |
| plain | idle | — | — | **6.8** (main 5.8, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 4.4, AxioWebKitHost 0.5 | — | — |
| plain | raf | 35.2 | 48.6 | **120.9** (DOM Worker 67.1, main 37.4, Renderer 4.8, TaskCon~ller # 3.9, SwComposite 3.2) | WPEWebProcess 66.2, AxioWebKitHost 14.8, Privileged Cont 0.9, WebExtensions 0.3 | — | — |
| plain | scroll | 29.7 | 56.0 | **118.4** (DOM Worker 55.8, main 48.9, Renderer 3.9, TaskCon~ller # 3.4, SwComposite 2.4) | WPEWebProcess 60.7, AxioWebKitHost 12.2, WebExtensions 1.0, Privileged Cont 1.0 | — | — |
| plain | key | — | — | **29.3** (main 12.9, DOM Worker 10.2, TaskCon~ller # 1.6, Renderer 1.1, Timer 0.8) | WPEWebProcess 6.9, AxioWebKitHost 1.8, Isolated Web Co 0.3 | 35.0 | — |
| plain | switch-to-gecko | — | — | **21.5** (main 8.6, BgIOThr~Pool # 4.3, Renderer 4.3, DOM Worker 4.3) | WebExtensions 4.3, Isolated Web Co 4.3 | — | 211.5 |
| trace | switch-to-engine | — | — | **45.6** (Renderer 15.2, main 13.5, DOM Worker 8.4, glean.dispatche 1.7, Softwar~cThread 1.7) | WPEWebProcess 65.7, AxioWebKitHost 18.5, WPENetworkProce 10.1, Isolated Web Co 1.7 | — | 571.3 |
| trace | idle | — | — | **8.3** (main 6.3, Timer 1.0, TaskCon~ller # 1.0) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 35.4 | 43.9 | **120.4** (DOM Worker 66.2, main 38.4, Renderer 4.5, TaskCon~ller # 3.9, SwComposite 3.2) | WPEWebProcess 64.6, AxioWebKitHost 14.2 | — | — |
| trace | scroll | 8.1 | 170.0 | **45.9** (DOM Worker 18.8, main 16.6, IndexedDB IO # 2.8, TaskCon~ller # 2.3, IPDL Background 1.4) | WPEWebProcess 19.0, AxioWebKitHost 3.4, WebExtensions 0.1, RDD Process 0.1 | — | — |
| trace | key | — | — | **30.0** (main 13.2, DOM Worker 10.2, TaskCon~ller # 1.9, Renderer 1.1, Timer 0.8) | WPEWebProcess 6.9, AxioWebKitHost 2.5 | 33.3 | — |
| trace | switch-to-gecko | — | — | **25.1** (main 16.7, Renderer 4.2, sqldb:p~lite # 4.2) | Isolated Web Co 8.3 | — | 212.7 |
| profile | switch-to-engine | — | — | **37.4** (DOM Worker 16.4, main 9.0, SamplerThread 9.0, TaskCon~ller # 1.5, Compositor 1.5) | WPEWebProcess 61.3, Web Content 28.4, AxioWebKitHost 16.4, WPENetworkProce 10.5 | — | 639.2 |
| profile | idle | — | — | **28.3** (DOM Worker 8.6, SamplerThread 8.6, main 8.2, Timer 1.9, glean.dispatche 0.5) | Web Content 7.2, Privileged Cont 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 25.3 | 72.6 | **131.4** (DOM Worker 63.9, main 39.3, SamplerThread 11.2, TaskCon~ller # 6.1, Renderer 3.8) | WPEWebProcess 67.1, AxioWebKitHost 12.5, Web Content 7.3, Isolated Web Co 2.2 | — | — |
| profile | scroll | 6.3 | 10835.7 | **50.8** (DOM Worker 20.7, main 15.6, SamplerThread 8.8, Timer 1.7, TaskCon~ller # 1.6) | WPEWebProcess 19.2, Web Content 8.1, AxioWebKitHost 3.3, Privileged Cont 2.4 | — | — |
| profile | key | — | — | **55.5** (DOM Worker 20.8, main 18.6, SamplerThread 9.6, Timer 1.6, TaskCon~ller # 1.1) | Web Content 8.0, WPEWebProcess 7.1, AxioWebKitHost 2.4, WebExtensions 1.9 | 46.6 | — |
| profile | switch-to-gecko | — | — | **43.2** (main 11.8, DOM Worker 11.8, SamplerThread 7.9, IPC I/O Parent 3.9, BgIOThr~Pool # 3.9) | Isolated Web Co 7.9, WebExtensions 3.9 | — | 220.2 |

Frame path per frame (median ms; hooks): header wait = idle until the next frame header; pixel read = Subprocess read(size) call → resolve; convert = pixels → ImageData; put = putImageData.

| pass | window | recv fps | MB/s | stdout reads | header wait | pixel read | convert | put | put→chrome paint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 1.7 | 4.5 | 31 | 230.4 | 21.4 | 4.2 | 1.4 | 22.2 | 0.045 |
| trace | raf | 34.9 | 93.7 | 337 | 0.2 | 24.1 | 1.4 | 0.4 | — | 0.943 |
| trace | scroll | 7.2 | 19.2 | 868 | 0.1 | 25.1 | 0.1 | 0.3 | 87.4 | 0.221 |
| trace | key | 5.5 | 14.7 | 347 | 5.9 | 18.7 | 0.1 | 0.0 | 144.8 | 0.117 |
| profile | switch-to-engine | 1.5 | 3.9 | 33 | 234.8 | 29.7 | 6.8 | 1.8 | 30.1 | 0.056 |
| profile | raf | 24.7 | 66.4 | 242 | 0.3 | 33.2 | 2.0 | 0.5 | — | 0.945 |
| profile | scroll | 5.6 | 15.0 | 783 | 0.2 | 34.1 | 0.2 | 0.4 | 123.5 | 0.221 |
| profile | key | 5.5 | 14.6 | 347 | 7.1 | 27.3 | 0.1 | 0.1 | 135.4 | 0.160 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 12.8 | 18.9 | 0.1 | 0.0 | 144.8 | 32.8 | 178.1 |
| profile | 0.6 | 17.0 | 27.4 | 0.1 | 0.1 | 135.4 | 45.8 | 182.9 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 12.1; spawn AxioWebKitHost resolved 36.7; write hello 38.6; first stdout read resolved 106.0; write create 107.4; first pixel read resolved 572.2; first ImageData 576.4; first putImageData end 577.9; write frame_ack 578.0; write visibility 581.5; write focus 581.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 15.9; first stdout read resolved 21.2

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 25.9; spawn AxioWebKitHost resolved 48.3; write hello 53.2; first stdout read resolved 119.9; write create 121.9; first pixel read resolved 640.5; first ImageData 647.3; first putImageData end 649.2; write frame_ack 649.5; write visibility 656.7; write focus 656.9

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 24.3; first stdout read resolved 35.1

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 101, main 60, Renderer 12, IPC I/O 2, Compositor 2, WRSceneBuilder 1, SwComposite 1, WRRenderBackend 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 60 ms (8.7% of span): JavaScript 27, Idle 15, Other 8, DOM 5, Layout 3, Graphics 2
  - JS leaf 8 / native under JS 27 / native 26; buckets: poll_wait 17, engine_stream_read 16, bgra_to_rgba 6, paint_layout 3, subprocess_pipe_io 3, memcpy_memset 3, put_image_data 2, canvas_2d 2
  - top self: `[libxul.so]` 26; `__syscall_cancel_arch [libc.so.6]` 17; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 6; `[axiosozo-dev]` 3; `[unknown]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 12
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, poll_wait 63, memcpy_memset 8, gc_cc 2, worker_messaging 0; top self: `__syscall_cancel_arch [libc.so.6]` 67; `[libxul.so]` 16; `__memset_avx2_unaligned_erms [libc.so.6]` 7; `mprotect [libc.so.6]` 4; `__lll_lock_wake [libc.so.6]` 3
- **tab:7806** CPU ms by thread group: main 43, IPC I/O 1, other 0, ImageIO 0, Socket 0
  - main thread 43 ms (7.5% of span): Other 33, JavaScript 4, DOM 3, Profiler 2, Idle 1
  - JS leaf 0 / native under JS 7 / native 36; buckets: memcpy_memset 2, poll_wait 1
  - top self: `[libxul.so]` 23; `__lll_lock_wake [libc.so.6]` 3; `__strcmp_avx2 [libc.so.6]` 2; `[libexpat.so.1]` 2; `[]` 2; `__syscall_cancel_arch [libc.so.6]` 1
  - top JS (total): `init (resource://gre/modules/ExtensionProcessScript.sys.mjs:57:7)[6]` 5
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7714** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.2% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
- **tab:7804** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.2% of span): Idle 1, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mprotect [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 147, DOM Worker 109, other 20, Compositor 1, Renderer 1, SwComposite 1, Socket 0, IPC I/O 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 147 ms (7.0% of span): Idle 112, Other 11, JavaScript 9, GC / CC 7, DOM 5, Graphics 3
  - JS leaf 1 / native under JS 12 / native 134; buckets: poll_wait 116, gc_cc 7, engine_stream_read 4, paint_layout 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[libxul.so]` 22; `[linux-vdso.so.1]` 1; `[unknown]` 1; `[axiosozo-dev]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - top JS (total): `diagnostics (chrome://browser/content/axiosozo/WebKitEngineControls.sy` 10
  - GC/CC markers: GCMinor 1× 3 ms, CCSlice 1× 3 ms, CC 1× 0 ms
  - busiest DOM Worker 109 ms: buckets subprocess_pipe_io 109, poll_wait 109; top self: `__syscall_cancel_arch [libc.so.6]` 109; `[libxul.so]` 0
- **tab:7371** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7714** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7344** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1904, main 1150, Renderer 109, SwComposite 65, other 29, WRRenderBackend 27, Compositor 22, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1149 ms (36.4% of span): Idle 426, JavaScript 372, Other 138, GC / CC 122, DOM 60, Profiler 20
  - JS leaf 121 / native under JS 364 / native 664; buckets: poll_wait 487, subprocess_pipe_io 246, engine_stream_read 205, memcpy_memset 127, gc_cc 122, bgra_to_rgba 115, array_buffer_copy 83, worker_messaging 48
  - top self: `__syscall_cancel_arch [libc.so.6]` 523; `[libxul.so]` 295; `__memmove_avx_unaligned_erms [libc.so.6]` 114; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 104; `[unknown]` 20; `[axiosozo-dev]` 11
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 181
  - GC/CC markers: GCMajor 3× 294 ms, GCSlice 40× 128 ms, CCSlice 8× 22 ms, GCMinor 3× 4 ms, CC 4× 0 ms
  - busiest DOM Worker 1904 ms: buckets subprocess_pipe_io 1904, poll_wait 507, memcpy_memset 126, gc_cc 30; top self: `__syscall_cancel_arch [libc.so.6]` 677; `[libxul.so]` 630; `mprotect [libc.so.6]` 150; `[unknown]` 80; `__memset_avx2_unaligned_erms [libc.so.6]` 79
- **tab:7714** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: gc_cc 4, poll_wait 2
  - top self: `[libxul.so]` 4; `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 3× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7720** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7371** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3078, main 2449, other 167, Renderer 132, SwComposite 84, WRRenderBackend 36, Compositor 33, WRSceneBuilder 8, IPC I/O 4, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2449 ms (14.2% of span): Idle 1203, JavaScript 646, Other 268, GC / CC 153, DOM 106, Profiler 35
  - JS leaf 272 / native under JS 531 / native 1646; buckets: poll_wait 1371, engine_stream_read 408, subprocess_pipe_io 324, bgra_to_rgba 241, memcpy_memset 179, gc_cc 153, array_buffer_copy 104, worker_messaging 58
  - top self: `__syscall_cancel_arch [libc.so.6]` 1363; `[libxul.so]` 464; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 238; `__memmove_avx_unaligned_erms [libc.so.6]` 158; `[unknown]` 32; `[axiosozo-dev]` 24
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 334
  - GC/CC markers: GCMajor 5× 2530 ms, GCSlice 44× 144 ms, CCSlice 7× 20 ms, GCMinor 6× 7 ms, CC 5× 0 ms
  - busiest DOM Worker 3065 ms: buckets subprocess_pipe_io 3065, poll_wait 1340, memcpy_memset 154, gc_cc 56; top self: `__syscall_cancel_arch [libc.so.6]` 1520; `[libxul.so]` 773; `mprotect [libc.so.6]` 140; `[unknown]` 112; `__memset_avx2_unaligned_erms [libc.so.6]` 99
- **tab:7371** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 12 ms (0.1% of span): GC / CC 8, Idle 4, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: gc_cc 8, poll_wait 5, memcpy_memset 0
  - top self: `[libxul.so]` 7; `__syscall_cancel_arch [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0; `g_thread_self [libglib-2.0.so.0]` 0
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7270** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 7, poll_wait 2, memcpy_memset 1
  - top self: `[libxul.so]` 5; `__syscall_cancel_arch [libc.so.6]` 2; `mmap64 [libc.so.6]` 1; `[]` 1
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7720** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 644, main 623, Renderer 40, other 36, SwComposite 29, Compositor 16, WRRenderBackend 13, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 623 ms (17.0% of span): Idle 295, JavaScript 119, Other 64, Layout 39, DOM 30, GC / CC 29
  - JS leaf 14 / native under JS 189 / native 419; buckets: poll_wait 344, subprocess_pipe_io 68, engine_stream_read 64, paint_layout 58, memcpy_memset 38, gc_cc 29, worker_messaging 17, array_buffer_copy 14
  - top self: `__syscall_cancel_arch [libc.so.6]` 324; `[libxul.so]` 185; `__memmove_avx_unaligned_erms [libc.so.6]` 30; `[unknown]` 13; `[axiosozo-dev]` 11; `__lll_lock_wait [libc.so.6]` 5
  - GC/CC markers: GCMajor 1× 361 ms, GCSlice 10× 27 ms, CCSlice 2× 5 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - busiest DOM Worker 644 ms: buckets subprocess_pipe_io 644, poll_wait 293, memcpy_memset 29, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 339; `[libxul.so]` 155; `mprotect [libc.so.6]` 31; `[unknown]` 24; `syscall [libc.so.6]` 17
- **tab:7270** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libxul.so]` 1
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[4` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[4]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0
- **tab:7344** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7371** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 82, Renderer 23, DOM Worker 15, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 82 ms (27.0% of span): JavaScript 40, Layout 12, Graphics 10, Other 7, DOM 4, Idle 4
  - JS leaf 3 / native under JS 49 / native 31; buckets: paint_layout 18, engine_stream_read 9, poll_wait 7, gc_cc 3, subprocess_pipe_io 1, memcpy_memset 1
  - top self: `[libxul.so]` 60; `__syscall_cancel_arch [libc.so.6]` 8; `__tls_get_addr [ld-linux-x86-64.so.2]` 5; `mprotect [libc.so.6]` 2; `[unknown]` 2; `getTabForBrowser (moz-src:///browser/components/tabbrowser/T` 1
  - top JS (total): `callListeners (moz-src:///browser/components/tabbrowser/Tabbrowser.sys` 12; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 12; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 12
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, poll_wait 14, worker_messaging 0, memcpy_memset 0; top self: `__syscall_cancel_arch [libc.so.6]` 14; `[libxul.so]` 1; `[axiosozo-dev]` 0
- **tab:7714** CPU ms by thread group: main 28, IPC I/O 2, Socket 0, other 0, ImageIO 0
  - main thread 28 ms (9.2% of span): Other 13, JavaScript 5, Layout 4, Idle 3, Profiler 2, DOM 0
  - JS leaf 0 / native under JS 8 / native 20; buckets: poll_wait 3, paint_layout 1, gc_cc 1, mozafterpaint_events 0
  - top self: `[libxul.so]` 18; `__syscall_cancel_arch [libc.so.6]` 7; `[]` 1; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 1; `[unknown]` 0; `__lll_lock_wait [libc.so.6]` 0
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 4
- **tab:7270** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (1.4% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: poll_wait 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `[libxul.so]` 1
  - top JS (total): `#tabUpdated (moz-extension://98b5ad6d-8768-4c5c-82e0-89b51b625fbe/bg.j` 1; `applySafeWithoutClone/< (resource://gre/modules/ExtensionCommon.sys.mj` 1; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[4]` 1; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 1
- **tab:7344** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

