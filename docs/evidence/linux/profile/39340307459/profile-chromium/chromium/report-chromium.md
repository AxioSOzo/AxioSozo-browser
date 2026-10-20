# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **55.3** (main 23.4, DOM Worker 18.4, Renderer 8.4, WRScene~ilder# 1.7, WRRende~ckend# 1.7) | AxioCEFProbe 46.9, cef:gpu-process 13.4, cef:utility 8.4, cef:renderer 6.7 | — | 545.4 |
| plain | idle | — | — | **3.9** (main 3.4, Timer 0.5) | Web Content 3.4, AxioCEFProbe 1.0 | — | — |
| plain | raf | 42.5 | 37.6 | **131.0** (DOM Worker 72.8, main 38.6, Renderer 5.7, TaskCon~ller # 4.2, SwComposite 4.2) | AxioCEFProbe 11.6, cef:renderer 9.6, cef:gpu-process 6.3, Web Content 1.0 | — | — |
| plain | scroll | 34.5 | 52.9 | **125.2** (DOM Worker 61.1, main 48.6, Renderer 4.3, SwComposite 3.4, TaskCon~ller # 2.9) | cef:gpu-process 22.7, AxioCEFProbe 10.1, cef:renderer 9.7, Privileged Cont 1.0 | — | — |
| plain | key | — | — | **30.3** (main 12.1, DOM Worker 11.2, TaskCon~ller # 1.6, Timer 1.1, Renderer 1.1) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 29.4 | — |
| plain | switch-to-gecko | — | — | **15.8** (DOM Worker 4.4, main 3.8, Indexed~ IO # 3.6, IPDL Background 1.6, TaskCon~ller # 0.9) | Privileged Cont 0.2, RDD Process 0.1, Isolated Web Co 0.1, Web Content 0.1 | — | 15044.4 |
| trace | switch-to-engine | — | — | **62.5** (main 25.0, Renderer 22.9, DOM Worker 12.5, WRRende~ckend# 2.1) | AxioCEFProbe 58.5, cef:gpu-process 18.8, cef:utility 10.4, cef:renderer 8.3 | — | 434.4 |
| trace | idle | — | — | **10.1** (main 5.3, DOM Worker 1.9, TaskCon~ller # 1.4, Timer 1.0, Indexed~ IO # 0.5) | Web Content 2.9, AxioCEFProbe 1.0, cef:renderer 0.5 | — | — |
| trace | raf | 42.5 | 38.2 | **130.0** (DOM Worker 71.7, main 39.4, Renderer 5.1, TaskCon~ller # 4.5, SwComposite 3.8) | AxioCEFProbe 10.6, cef:renderer 10.2, cef:gpu-process 7.0, cef:zygote 0.3 | — | — |
| trace | scroll | 4.8 | 11770.8 | **19.4** (main 8.6, DOM Worker 7.4, Timer 0.9, TaskCon~ller # 0.8, Renderer 0.5) | cef:gpu-process 2.8, AxioCEFProbe 1.7, cef:renderer 1.4, Web Content 0.1 | — | — |
| trace | key | — | — | **26.4** (DOM Worker 11.0, main 10.4, Timer 1.1, Renderer 1.1, SwComposite 0.8) | AxioCEFProbe 3.3, cef:renderer 2.8, cef:gpu-process 0.5, Privileged Cont 0.3 | 28.8 | — |
| trace | switch-to-gecko | — | — | **1.8** (main 0.7, TaskCon~ller # 0.5, Renderer 0.1, glean.dispatche 0.1, IPC I/O Parent 0.1) | WebExtensions 0.1, Privileged Cont 0.1 | — | 15019.9 |
| profile | switch-to-engine | — | — | **52.5** (DOM Worker 19.9, main 16.3, SamplerThread 7.3, Renderer 5.4, IPDL Background 1.8) | AxioCEFProbe 47.1, Web Content 20.0, cef:gpu-process 14.5, cef:utility 12.7 | — | 498.1 |
| profile | idle | — | — | **21.8** (DOM Worker 7.6, SamplerThread 7.6, main 5.2, Timer 1.4) | Web Content 8.6, Privileged Cont 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 30.6 | 61.1 | **143.9** (DOM Worker 74.3, main 38.9, SamplerThread 13.7, Renderer 4.8, TaskCon~ller # 3.5) | cef:renderer 11.4, Web Content 10.8, AxioCEFProbe 10.6, cef:gpu-process 7.3 | — | — |
| profile | scroll | 3.4 | 11808.5 | **39.4** (DOM Worker 15.0, main 9.9, SamplerThread 9.0, BgIOThr~Pool # 2.0, Timer 1.6) | Web Content 10.2, cef:gpu-process 3.2, Privileged Cont 2.1, WebExtensions 2.0 | — | — |
| profile | key | — | — | **57.0** (DOM Worker 21.8, main 17.2, SamplerThread 10.4, Timer 1.9, Renderer 1.4) | Web Content 9.3, AxioCEFProbe 2.7, WebExtensions 2.4, Isolated Web Co 2.2 | 40.8 | — |
| profile | switch-to-gecko | — | — | **5.6** (SamplerThread 3.3, main 0.9, TaskCon~ller # 0.5, DOM Worker 0.2, Renderer 0.1) | Web Content 8.6, Privileged Cont 1.7, Isolated Web Co 1.6, WebExtensions 1.5 | — | 15028.5 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 452.6; first putImageData end 453.4

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 513.8; first putImageData end 514.5

Switch timeline (profile, switch-to-gecko, ms after the window start): first ImageData 13.8; first putImageData end 14.0

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 99, main 98, Renderer 32, WRRenderBackend 5, Compositor 4, WRSceneBuilder 4, IPC I/O 2, SwComposite 2, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 98 ms (17.0% of span): Idle 28, JavaScript 25, Layout 20, Other 11, DOM 7, Graphics 4
  - JS leaf 10 / native under JS 29 / native 59; buckets: poll_wait 31, engine_stream_read 13, paint_layout 10, bgra_to_rgba 9, subprocess_pipe_io 5, array_buffer_copy 4, ipc 2, put_image_data 2
  - top self: `[libxul.so]` 41; `poll@@GLIBC_2.2.5 [libc.so.6]` 30; `[libc.so.6]` 6; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 5; `[axiosozo-dev]` 3; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.s` 3
  - busiest DOM Worker 99 ms: buckets subprocess_pipe_io 99, poll_wait 37, worker_messaging 3, gc_cc 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 35; `[libxul.so]` 20; `[libc.so.6]` 8; `read@@GLIBC_2.2.5 [libc.so.6]` 7; `[unknown]` 6
- **tab:4105** CPU ms by thread group: main 49, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 49 ms (9.0% of span): Other 34, JavaScript 7, Profiler 3, Idle 3, DOM 2, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: poll_wait 4, memcpy_memset 1, gc_cc 0
  - top self: `[libxul.so]` 21; `[libc.so.6]` 7; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5; `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libexpat.so.1]` 3; `[]` 3
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:3988** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.5% of span): Idle 2, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[]` 0; `[linux-vdso.so.1]` 0
- **tab:3443** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 100, main 83, other 21, IPC I/O 1, Socket 0, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 83 ms (3.9% of span): Idle 69, Other 7, JavaScript 6, DOM 1, Profiler 1
  - JS leaf 1 / native under JS 5 / native 77; buckets: poll_wait 72, engine_stream_read 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 69; `[libxul.so]` 7; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sy` 1
  - busiest DOM Worker 100 ms: buckets subprocess_pipe_io 100, poll_wait 99; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 99; `[libxul.so]` 0
- **tab:4105** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3988** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3443** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: DOM Worker 2222, main 1128, Renderer 135, SwComposite 90, WRRenderBackend 35, other 35, Compositor 26, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1129 ms (35.5% of span): Idle 515, JavaScript 310, Other 143, GC / CC 69, DOM 55, Profiler 28
  - JS leaf 133 / native under JS 285 / native 711; buckets: poll_wait 573, subprocess_pipe_io 206, engine_stream_read 190, bgra_to_rgba 117, gc_cc 69, array_buffer_copy 56, put_image_data 51, canvas_2d 43
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 521; `[libxul.so]` 198; `[libc.so.6]` 135; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 113; `write@@GLIBC_2.2.5 [libc.so.6]` 36; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 26
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 190; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 177; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[5` 173; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 173
  - GC/CC markers: GCMajor 2× 225 ms, GCSlice 18× 59 ms, CCSlice 4× 12 ms, GCMinor 2× 4 ms, CC 3× 0 ms
  - busiest DOM Worker 2222 ms: buckets subprocess_pipe_io 2222, poll_wait 504, memcpy_memset 26, gc_cc 26; top self: `[libxul.so]` 754; `poll@@GLIBC_2.2.5 [libc.so.6]` 494; `[libc.so.6]` 187; `read@@GLIBC_2.2.5 [libc.so.6]` 172; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 164
- **tab:3988** CPU ms by thread group: main 7, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): GC / CC 5, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: gc_cc 5, poll_wait 3
  - top self: `[libxul.so]` 3; `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 1; `[libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 38 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4105** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4100** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms

### Profile: chromium / scroll

- **parent** CPU ms by thread group: DOM Worker 2029, main 1509, other 169, Renderer 76, SwComposite 44, WRRenderBackend 19, Compositor 17, IPC I/O 7, WRSceneBuilder 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1509 ms (8.8% of span): Idle 784, JavaScript 422, Other 158, DOM 42, GC / CC 38, Profiler 27
  - JS leaf 245 / native under JS 236 / native 1027; buckets: poll_wait 905, engine_stream_read 276, bgra_to_rgba 230, subprocess_pipe_io 133, array_buffer_copy 45, gc_cc 41, paint_layout 24, worker_messaging 20
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 795; `[libxul.so]` 270; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 229; `[libc.so.6]` 70; `write@@GLIBC_2.2.5 [libc.so.6]` 30; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 24
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 276; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 254; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 251; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[6` 250
  - GC/CC markers: GCMajor 1× 167 ms, GCSlice 10× 33 ms, CCSlice 2× 6 ms, GCMinor 3× 4 ms, CC 1× 0 ms
  - busiest DOM Worker 2029 ms: buckets subprocess_pipe_io 2029, poll_wait 1085, gc_cc 41, memcpy_memset 18; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1072; `[libxul.so]` 403; `[libc.so.6]` 106; `read@@GLIBC_2.2.5 [libc.so.6]` 96; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 86
- **tab:3482** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 4, DOM 2, JavaScript 1, Profiler 0, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: poll_wait 4
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libxul.so]` 3; `[libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 2; `renderUsage (chrome://browser/content/axiosozo/overview/about-axiosozo` 2; `renderUsage/< (chrome://browser/content/axiosozo/overview/about-axioso` 2; `h (chrome://browser/content/axiosozo/overview/about-axiosozo.mjs:94:11` 1
- **tab:3464** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:4105** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0; `[]` 0

### Profile: chromium / key

- **parent** CPU ms by thread group: DOM Worker 676, main 582, Renderer 45, other 37, SwComposite 35, Compositor 17, WRRenderBackend 15, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 582 ms (15.8% of span): Idle 233, JavaScript 139, Other 67, Layout 38, Graphics 33, GC / CC 32
  - JS leaf 11 / native under JS 202 / native 368; buckets: poll_wait 286, subprocess_pipe_io 70, paint_layout 64, engine_stream_read 59, gc_cc 32, array_buffer_copy 24, worker_messaging 15, bgra_to_rgba 8
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 238; `[libxul.so]` 205; `[libc.so.6]` 42; `[axiosozo-dev]` 16; `[unknown]` 15; `write@@GLIBC_2.2.5 [libc.so.6]` 11
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 59; `fillBuffer/< (resource://gre/modules/subprocess/subprocess_common.sys.` 47; `checkPendingReads (resource://gre/modules/subprocess/subprocess_common` 46
  - GC/CC markers: GCMajor 1× 462 ms, GCSlice 9× 30 ms, CCSlice 2× 5 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - busiest DOM Worker 676 ms: buckets subprocess_pipe_io 676, poll_wait 296, gc_cc 12; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 294; `[libxul.so]` 182; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 39; `[libc.so.6]` 35; `read@@GLIBC_2.2.5 [libc.so.6]` 30
- **tab:3389** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, JavaScript 0, DOM 0, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `g_mutex_unlock [libglib-2.0.so.0]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0
  - top JS (total): `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[7]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[7` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sys.mjs:173:` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4105** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `[libxul.so]` 0
- **tab:3443** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 136, DOM Worker 25, Renderer 22, IPC I/O 6, Compositor 4, WRRenderBackend 3, SwComposite 3, other 2, WRSceneBuilder 2, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 136 ms (0.9% of span): GC / CC 55, Idle 26, JavaScript 23, Layout 16, Other 10, Graphics 3
  - JS leaf 4 / native under JS 30 / native 102; buckets: gc_cc 56, poll_wait 30, paint_layout 7, memcpy_memset 3, subprocess_pipe_io 2, array_buffer_copy 1, worker_messaging 0, webrender_render 0
  - top self: `[libxul.so]` 84; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 6; `[libc.so.6]` 4; `getTabToAdopt (chrome://browser/content/browser-init.js:83:1` 4; `madvise@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 2× 131 ms, GCSlice 9× 50 ms, CCSlice 2× 6 ms, GCMinor 3× 2 ms, CC 2× 0 ms
  - busiest DOM Worker 25 ms: buckets subprocess_pipe_io 25, poll_wait 14, worker_messaging 1, gc_cc 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 13; `[libc.so.6]` 6; `[libxul.so]` 3; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 1
- **tab:3988** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 1, Layout 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 3, paint_layout 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 0
- **tab:3482** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `PR_IntervalNow [libnspr4.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0
- **tab:3464** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0

