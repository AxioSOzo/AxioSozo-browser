# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **69.7** (main 26.2, DOM Worker 19.2, Renderer 14.0, WRRende~ckend# 3.5, glean.dispatche 1.7) | AxioCEFProbe 47.0, cef:gpu-process 14.0, cef:utility 10.4, cef:renderer 7.0 | — | 520.2 |
| plain | idle | — | — | **6.3** (main 3.8, Timer 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5, DOM Worker 0.5) | Web Content 3.4, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| plain | raf | 42.8 | 41.2 | **130.7** (DOM Worker 72.9, main 39.2, Renderer 4.8, TaskCon~ller # 4.2, SwComposite 3.5) | AxioCEFProbe 11.2, cef:renderer 10.6, cef:gpu-process 6.4, WebExtensions 0.6 | — | — |
| plain | scroll | 34.8 | 45.6 | **125.1** (DOM Worker 60.6, main 48.1, Renderer 4.8, TaskCon~ller # 3.8, SwComposite 2.9) | cef:gpu-process 24.1, cef:renderer 11.0, AxioCEFProbe 10.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **27.4** (main 11.2, DOM Worker 10.7, Timer 1.1, TaskCon~ller # 1.1, Renderer 0.8) | AxioCEFProbe 2.7, cef:renderer 2.2, cef:gpu-process 0.8, WebExtensions 0.3 | 28.8 | — |
| plain | switch-to-gecko | — | — | **31.4** (main 18.8, BgIOThr~Pool # 6.3, Renderer 6.3) |  | — | 131.1 |
| trace | switch-to-engine | — | — | **77.3** (Renderer 26.5, main 22.4, DOM Worker 14.3, WRRende~ckend# 4.1, glean.dispatche 2.0) | AxioCEFProbe 55.0, cef:gpu-process 16.3, cef:utility 10.2, cef:renderer 8.2 | — | 449.8 |
| trace | idle | — | — | **4.8** (main 3.8, Timer 1.0) | Web Content 2.9, AxioCEFProbe 1.0 | — | — |
| trace | raf | 43.5 | 39.8 | **130.5** (DOM Worker 71.8, main 39.3, TaskCon~ller # 5.2, Renderer 5.2, SwComposite 4.2) | AxioCEFProbe 11.0, cef:renderer 10.6, cef:gpu-process 6.7, cef:utility 0.3 | — | — |
| trace | scroll | 4.9 | 11772.3 | **31.6** (main 11.4, DOM Worker 11.0, Indexed~ IO # 3.1, IPDL Background 1.5, TaskCon~ller # 1.1) | cef:gpu-process 3.1, AxioCEFProbe 1.7, cef:renderer 1.4, Privileged Cont 0.2 | — | — |
| trace | key | — | — | **27.3** (main 11.5, DOM Worker 10.4, TaskCon~ller # 1.1, Renderer 1.1, Timer 0.8) | AxioCEFProbe 2.6, cef:renderer 2.2, cef:gpu-process 0.6, WebExtensions 0.3 | 28.9 | — |
| trace | switch-to-gecko | — | — | **1.7** (main 0.7, TaskCon~ller # 0.5, Renderer 0.1, Timer 0.1, BgIOThr~Pool # 0.1) | Web Content 0.1 | — | 15017.3 |
| profile | switch-to-engine | — | — | **54.0** (DOM Worker 18.0, main 16.4, Renderer 6.6, SamplerThread 6.6, glean.dispatche 1.6) | AxioCEFProbe 50.8, Web Content 47.5, cef:gpu-process 16.3, cef:utility 9.9 | — | 551.4 |
| profile | idle | — | — | **26.2** (SamplerThread 8.6, DOM Worker 8.1, main 6.7, Timer 1.4, TaskCon~ller # 1.4) | Web Content 9.6, Socket Process 1.9, WebExtensions 1.9, RDD Process 1.4 | — | — |
| profile | raf | 30.7 | 55.1 | **142.3** (DOM Worker 72.7, main 39.2, SamplerThread 13.4, Renderer 4.5, TaskCon~ller # 3.5) | cef:renderer 10.8, Web Content 10.2, AxioCEFProbe 9.5, cef:gpu-process 7.6 | — | — |
| profile | scroll | 3.4 | 11808.3 | **40.6** (DOM Worker 14.7, main 10.7, SamplerThread 8.9, BgIOThr~Pool # 2.0, Timer 1.7) | Web Content 9.4, cef:gpu-process 3.1, WebExtensions 2.2, Privileged Cont 2.0 | — | — |
| profile | key | — | — | **53.9** (DOM Worker 21.3, main 16.1, SamplerThread 10.1, Timer 1.9, Renderer 1.4) | Web Content 9.3, cef:renderer 2.8, AxioCEFProbe 2.4, WebExtensions 2.2 | 40.6 | — |
| profile | switch-to-gecko | — | — | **4.3** (SamplerThread 3.5, main 0.3, DOM Worker 0.2, Renderer 0.1, BgIOThr~Pool # 0.1) | Web Content 9.3, Privileged Cont 1.8, WebExtensions 1.6, Utility Process 1.5 | — | 15028.0 |

Frame path per frame (median ms; hooks): header wait = idle until the next frame header; pixel read = Subprocess read(size) call → resolve; convert = pixels → ImageData; put = putImageData.

| pass | window | recv fps | MB/s | stdout reads | header wait | pixel read | convert | put | put→chrome paint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 3.9 | 10.5 | 38 | 4.5 | 35.7 | 4.6 | 1.5 | 36.3 | 0.163 |
| trace | raf | 43.1 | 115.7 | 415 | 0.2 | 19.1 | 1.2 | 0.3 | 86.7 | 0.952 |
| trace | scroll | 4.0 | 10.8 | 708 | 0.1 | 21.9 | 4.4 | 0.2 | 17.9 | 0.114 |
| trace | key | 5.7 | 15.4 | 350 | 4.0 | 18.9 | 0.2 | 0.0 | 148.7 | 0.118 |
| profile | switch-to-engine | 3.1 | 8.3 | 38 | 9.3 | 46.8 | 6.1 | 1.7 | 51.5 | 0.169 |
| profile | raf | 30.3 | 81.3 | 296 | 0.3 | 27.9 | 1.5 | 0.5 | 107.3 | 0.950 |
| profile | scroll | 2.9 | 7.7 | 632 | 0.2 | 31.2 | 5.4 | 0.3 | — | 0.116 |
| profile | key | 5.7 | 15.3 | 350 | 5.3 | 27.4 | 0.2 | 0.1 | 139.8 | 0.160 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 7.5 | 19.1 | 0.2 | 0.0 | 148.9 | 27.9 | 178.2 |
| profile | 0.7 | 10.4 | 27.7 | 0.2 | 0.1 | 139.8 | 39.2 | 179.3 |

Switch timeline (trace, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 23.6; spawn AxioCEFProbe resolved 58.3; write hello 59.0; first stdout read resolved 275.3; write create 277.0; first pixel read resolved 461.3; first ImageData 465.5; first putImageData end 467.1; write frame_ack 467.4; write focus 471.5

Switch timeline (trace, switch-to-gecko, ms after the window start): write close 23.0; first stdout read resolved 31.9; write shutdown 34.1

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioCEFProbe called 46.9; spawn AxioCEFProbe resolved 83.7; write hello 86.3; first stdout read resolved 355.2; write create 356.9; first pixel read resolved 560.3; first ImageData 566.4; first putImageData end 568.2; write frame_ack 568.6; write focus 578.5

Switch timeline (profile, switch-to-gecko, ms after the window start): first ImageData 16.0; first putImageData end 16.3; write frame_ack 16.7; write close 40.4; first stdout read resolved 53.8; write shutdown 58.6

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 106, DOM Worker 98, Renderer 32, WRRenderBackend 5, Compositor 4, IPC I/O 3, WRSceneBuilder 3, SwComposite 2, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 106 ms (16.4% of span): JavaScript 37, Idle 26, Layout 23, DOM 8, Other 6, Graphics 4
  - JS leaf 9 / native under JS 43 / native 54; buckets: poll_wait 28, engine_stream_read 19, paint_layout 11, bgra_to_rgba 9, subprocess_pipe_io 7, array_buffer_copy 4, memcpy_memset 4, put_image_data 4
  - top self: `[libxul.so]` 57; `poll [libc.so.6]` 26; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 4; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.s` 4; `write [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 19
  - busiest DOM Worker 98 ms: buckets subprocess_pipe_io 98, poll_wait 38, memcpy_memset 4, worker_messaging 2, gc_cc 1; top self: `poll [libc.so.6]` 35; `[libxul.so]` 28; `read [libc.so.6]` 6; `__lll_lock_wake [libc.so.6]` 4; `[unknown]` 4
- **tab:4119** CPU ms by thread group: main 49, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 49 ms (9.3% of span): Other 39, DOM 4, JavaScript 3, Profiler 2, Idle 1
  - JS leaf 0 / native under JS 5 / native 44; buckets: memcpy_memset 3, poll_wait 2
  - top self: `[libxul.so]` 20; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 6; `[]` 4; `[libfontconfig.so.1]` 2; `__strlen_avx2 [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:4116** CPU ms by thread group: main 48, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 48 ms (8.4% of span): Other 39, DOM 4, JavaScript 2, Profiler 2, Idle 1
  - JS leaf 0 / native under JS 6 / native 42; buckets: memcpy_memset 4, poll_wait 2
  - top self: `[libxul.so]` 20; `__strlen_avx2 [libc.so.6]` 3; `[]` 3; `sysinfo [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `sendmsg [libc.so.6]` 2
  - top JS (total): `initExtension (resource://gre/modules/ExtensionProcessScript.sys.mjs:2` 4
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:3972** CPU ms by thread group: main 3, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 3 ms (0.5% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `[libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0; `read [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 126, DOM Worker 103, other 21, IPC I/O 1, Socket 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 127 ms (6.0% of span): Idle 76, GC / CC 36, JavaScript 6, Other 4, DOM 3, Profiler 0
  - JS leaf 0 / native under JS 7 / native 119; buckets: poll_wait 80, gc_cc 36, memcpy_memset 1, subprocess_pipe_io 1, array_buffer_copy 0
  - top self: `poll [libc.so.6]` 76; `[libxul.so]` 41; `mprotect [libc.so.6]` 2; `recvmsg [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 1061 ms, GCSlice 8× 33 ms, CCSlice 2× 5 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - busiest DOM Worker 103 ms: buckets subprocess_pipe_io 103, poll_wait 103; top self: `poll [libc.so.6]` 103; `__lll_lock_wait [libc.so.6]` 0
- **tab:4119** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[libxul.so]` 0; `write [libc.so.6]` 0
- **tab:3972** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
- **tab:4116** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: DOM Worker 2189, main 1130, Renderer 127, SwComposite 85, other 37, WRRenderBackend 34, Compositor 25, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1130 ms (35.7% of span): Idle 509, JavaScript 331, Other 142, GC / CC 58, DOM 56, Profiler 25
  - JS leaf 129 / native under JS 292 / native 708; buckets: poll_wait 569, engine_stream_read 196, subprocess_pipe_io 194, bgra_to_rgba 131, memcpy_memset 125, array_buffer_copy 60, gc_cc 58, put_image_data 50
  - top self: `poll [libc.so.6]` 512; `[libxul.so]` 215; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 122; `__memmove_avx_unaligned_erms [libc.so.6]` 110; `write [libc.so.6]` 35; `recvmsg [libc.so.6]` 24
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 196; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 184; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 183; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[1` 183
  - GC/CC markers: GCMajor 2× 192 ms, GCSlice 17× 50 ms, CCSlice 4× 8 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 2189 ms: buckets subprocess_pipe_io 2189, poll_wait 494, memcpy_memset 146, gc_cc 21; top self: `[libxul.so]` 756; `poll [libc.so.6]` 478; `read [libc.so.6]` 196; `mprotect [libc.so.6]` 141; `[unknown]` 118
- **tab:3408** CPU ms by thread group: main 12, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 12 ms (0.4% of span): GC / CC 11, Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: gc_cc 11, poll_wait 2
  - top self: `[libxul.so]` 9; `poll [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `[]` 0
  - GC/CC markers: GCMajor 1× 29 ms, GCSlice 3× 13 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3504** CPU ms by thread group: main 10, other 1, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 10 ms (0.3% of span): GC / CC 6, Idle 2, Profiler 2
  - JS leaf 0 / native under JS 0 / native 10; buckets: gc_cc 7, poll_wait 3
  - top self: `[libxul.so]` 6; `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 1; `getrusage [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 10 ms, GCSlice 4× 10 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3972** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: gc_cc 4, poll_wait 2
  - top self: `[libxul.so]` 2; `poll [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 1; `__printf_fp_buffer_1.isra.0 [libc.so.6]` 1; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 3× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 1 ms, CC 1× 0 ms

### Profile: chromium / scroll

- **parent** CPU ms by thread group: DOM Worker 1969, main 1646, other 167, Renderer 68, SwComposite 42, WRRenderBackend 18, Compositor 16, IPC I/O 6, WRSceneBuilder 4, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1645 ms (9.6% of span): Idle 805, JavaScript 428, Other 164, GC / CC 159, DOM 29, Profiler 24
  - JS leaf 243 / native under JS 271 / native 1131; buckets: poll_wait 937, engine_stream_read 281, bgra_to_rgba 236, gc_cc 159, subprocess_pipe_io 151, memcpy_memset 67, worker_messaging 51, array_buffer_copy 36
  - top self: `poll [libc.so.6]` 822; `[libxul.so]` 348; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 232; `__memmove_avx_unaligned_erms [libc.so.6]` 56; `recvmsg [libc.so.6]` 33; `write [libc.so.6]` 24
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 281; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 255; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[2` 254; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 254
  - GC/CC markers: GCMajor 6× 2990 ms, GCSlice 46× 152 ms, CCSlice 7× 19 ms, GCMinor 7× 8 ms, CC 6× 0 ms
  - busiest DOM Worker 1969 ms: buckets subprocess_pipe_io 1969, poll_wait 1084, memcpy_memset 83, gc_cc 32; top self: `poll [libc.so.6]` 1071; `[libxul.so]` 371; `mprotect [libc.so.6]` 97; `read [libc.so.6]` 88; `syscall [libc.so.6]` 59
- **tab:3504** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 4
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll [libc.so.6]` 4
- **tab:3486** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0
- **tab:4119** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[libglib-2.0.so.0]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

### Profile: chromium / key

- **parent** CPU ms by thread group: DOM Worker 660, main 530, Renderer 43, other 37, SwComposite 33, Compositor 16, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 530 ms (14.4% of span): Idle 240, JavaScript 103, Other 74, Layout 45, Graphics 30, DOM 19
  - JS leaf 14 / native under JS 152 / native 365; buckets: poll_wait 288, paint_layout 64, engine_stream_read 50, subprocess_pipe_io 37, memcpy_memset 27, array_buffer_copy 12, bgra_to_rgba 7, gc_cc 5
  - top self: `poll [libc.so.6]` 243; `[libxul.so]` 173; `__memmove_avx_unaligned_erms [libc.so.6]` 22; `[unknown]` 18; `[axiosozo-dev]` 12; `recvmsg [libc.so.6]` 9
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 50; `_formatURL (moz-src:///browser/components/urlbar/UrlbarValueFormatter.` 44
  - GC/CC markers: GCMinor 1× 3 ms
  - busiest DOM Worker 660 ms: buckets subprocess_pipe_io 660, poll_wait 297, memcpy_memset 40, gc_cc 11; top self: `poll [libc.so.6]` 295; `[libxul.so]` 157; `read [libc.so.6]` 37; `mprotect [libc.so.6]` 37; `[unknown]` 25
- **tab:3408** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1
  - JS leaf 0 / native under JS 1 / native 5; buckets: poll_wait 5
  - top self: `poll [libc.so.6]` 5; `[libxul.so]` 1; `__strlen_avx2 [libc.so.6]` 0; `[unknown]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 1; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 1; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[0]` 1; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[6]` 1; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 0
- **tab:3465** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:3504** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[]` 0

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 59, DOM Worker 26, Renderer 20, IPC I/O 4, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, SwComposite 2, other 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 59 ms (0.4% of span): Idle 20, Layout 15, JavaScript 13, Other 5, Graphics 2, Profiler 2
  - JS leaf 0 / native under JS 24 / native 35; buckets: poll_wait 21, paint_layout 5, engine_stream_read 2, memcpy_memset 2, gc_cc 1, subprocess_pipe_io 1, array_buffer_copy 0, worker_messaging 0
  - top self: `[libxul.so]` 28; `poll [libc.so.6]` 20; `[unknown]` 2; `write [libc.so.6]` 1; `[axiosozo-dev]` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMinor 2× 1 ms
  - busiest DOM Worker 26 ms: buckets subprocess_pipe_io 26, poll_wait 18, worker_messaging 1, gc_cc 1; top self: `poll [libc.so.6]` 16; `[libxul.so]` 3; `syscall [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `write [libc.so.6]` 1
- **tab:3972** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll [libc.so.6]` 4; `[libxul.so]` 0
- **tab:3504** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0
- **tab:3486** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0; `[libxul.so]` 0

