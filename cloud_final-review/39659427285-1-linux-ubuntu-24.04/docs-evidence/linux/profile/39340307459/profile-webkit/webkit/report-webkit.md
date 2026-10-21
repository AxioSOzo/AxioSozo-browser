# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **47.6** (main 17.0, DOM Worker 11.9, Renderer 10.2, TaskCon~ller # 1.7, Softwar~cThread 1.7) | WPEWebProcess 68.0, AxioWebKitHost 15.3, WPENetworkProce 11.9 | — | 562.4 |
| plain | idle | — | — | **6.8** (main 5.8, Timer 0.5, TaskCon~ller # 0.5) | Web Content 3.4, forkserver 0.5, AxioWebKitHost 0.5, RDD Process 0.5 | — | — |
| plain | raf | 36.2 | 44.8 | **118.8** (DOM Worker 64.7, main 37.5, Renderer 5.2, TaskCon~ller # 3.9, SwComposite 3.2) | WPEWebProcess 66.5, AxioWebKitHost 12.9, WebExtensions 1.0, Web Content 0.6 | — | — |
| plain | scroll | 30.8 | 53.4 | **121.1** (DOM Worker 57.1, main 48.8, Renderer 3.9, TaskCon~ller # 2.9, SwComposite 2.9) | WPEWebProcess 65.4, AxioWebKitHost 11.7, Privileged Cont 0.5, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **28.6** (main 13.2, DOM Worker 9.9, TaskCon~ller # 1.4, Renderer 1.1, Timer 0.8) | WPEWebProcess 6.2, AxioWebKitHost 2.1 | 33.3 | — |
| plain | switch-to-gecko | — | — | **29.2** (main 8.3, BgIOThr~Pool # 8.3, Renderer 4.2, SwComposite 4.2, DOM Worker 4.2) | Isolated Web Co 4.2 | — | 211.5 |
| trace | switch-to-engine | — | — | **43.2** (Renderer 15.6, main 12.1, DOM Worker 6.9, Compositor 3.5, IPC I/O Parent 1.7) | WPEWebProcess 64.2, AxioWebKitHost 17.3, WPENetworkProce 10.4, bwrap 1.7 | — | 551.4 |
| trace | idle | — | — | **7.8** (main 6.3, Timer 1.0, TaskCon~ller # 0.5) | Web Content 3.9, AxioWebKitHost 0.5 | — | — |
| trace | raf | 36.0 | 42.6 | **119.9** (DOM Worker 66.2, main 37.1, Renderer 4.8, TaskCon~ller # 3.6, SwComposite 3.6) | WPEWebProcess 67.8, AxioWebKitHost 14.5 | — | — |
| trace | scroll | 8.1 | 163.7 | **43.4** (DOM Worker 18.5, main 16.7, TaskCon~ller # 2.1, IPDL Background 1.6, Timer 0.9) | WPEWebProcess 19.4, AxioWebKitHost 3.7, WebExtensions 0.2, Web Content 0.1 | — | — |
| trace | key | — | — | **28.1** (main 12.4, DOM Worker 10.2, Timer 1.1, TaskCon~ller # 1.1, Renderer 1.1) | WPEWebProcess 6.6, AxioWebKitHost 1.9 | 35.6 | — |
| trace | switch-to-gecko | — | — | **24.6** (main 8.2, Renderer 8.2, BgIOThr~Pool # 4.1, sqldb:p~lite # 4.1) | Isolated Web Co 12.3 | — | 211.5 |
| profile | switch-to-engine | — | — | **39.0** (DOM Worker 17.3, SamplerThread 10.1, main 8.7, Renderer 2.9) | WPEWebProcess 63.5, AxioWebKitHost 15.9, Web Content 13.0, WPENetworkProce 10.1 | — | 660.6 |
| profile | idle | — | — | **27.5** (SamplerThread 8.7, DOM Worker 8.2, main 7.7, Timer 1.9, IPC I/O Parent 0.5) | Web Content 7.7, WebExtensions 2.4, Isolated Web Co 2.4, Privileged Cont 1.9 | — | — |
| profile | raf | 25.8 | 60.1 | **129.6** (DOM Worker 65.5, main 36.1, SamplerThread 11.3, Renderer 4.5, TaskCon~ller # 3.5) | WPEWebProcess 67.2, AxioWebKitHost 12.6, Web Content 9.0, Isolated Web Co 2.2 | — | — |
| profile | scroll | 6.4 | 10864.8 | **52.2** (DOM Worker 21.3, main 15.7, SamplerThread 9.5, Timer 1.8, TaskCon~ller # 1.5) | WPEWebProcess 19.7, Web Content 10.3, AxioWebKitHost 3.4, Privileged Cont 2.3 | — | — |
| profile | key | — | — | **54.3** (DOM Worker 20.6, main 16.7, SamplerThread 10.1, Timer 1.6, Renderer 1.4) | Web Content 9.3, WPEWebProcess 7.8, WebExtensions 2.2, AxioWebKitHost 2.2 | 44.9 | — |
| profile | switch-to-gecko | — | — | **59.0** (main 23.6, DOM Worker 11.8, TaskCon~ller # 7.9, SamplerThread 7.9, BgIOThr~Pool # 3.9) | Isolated Web Co 3.9 | — | 219.5 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 557.5; first putImageData end 558.9

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 665.2; first putImageData end 667.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 86, main 65, Renderer 13, WRRenderBackend 3, Compositor 2, SwComposite 2, WRSceneBuilder 2, Socket 1, IPC I/O 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (9.1% of span): JavaScript 31, Idle 14, Layout 6, Other 6, DOM 4, Graphics 2
  - JS leaf 9 / native under JS 29 / native 27; buckets: poll_wait 17, engine_stream_read 15, bgra_to_rgba 6, subprocess_pipe_io 4, paint_layout 4, worker_messaging 2, put_image_data 2, canvas_2d 2
  - top self: `[libxul.so]` 27; `[libc.so.6]` 20; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 6; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3; `[libX11.so.6]` 1
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 11; `switchToWebKit (chrome://browser/content/axiosozo/WebKitPresenter.sys.` 10; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 8; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 8
  - busiest DOM Worker 86 ms: buckets subprocess_pipe_io 86, poll_wait 46, gc_cc 2, memcpy_memset 1, worker_messaging 0; top self: `[libc.so.6]` 57; `[libxul.so]` 18; `syscall@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3; `[axiosozo-dev]` 2
- **tab:7700** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.3% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `[libc.so.6]` 2; `[libxul.so]` 0
- **tab:7251** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0
- **tab:7706** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 155, DOM Worker 97, other 21, Compositor 2, Renderer 1, IPC I/O 1, Socket 1, SwComposite 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 155 ms (7.4% of span): Idle 109, GC / CC 17, JavaScript 11, Other 9, DOM 4, Graphics 2
  - JS leaf 1 / native under JS 13 / native 141; buckets: poll_wait 115, gc_cc 17, engine_stream_read 2, paint_layout 2, memcpy_memset 1, subprocess_pipe_io 0, mozafterpaint_events 0, array_buffer_copy 0
  - top self: `[libc.so.6]` 114; `[libxul.so]` 32; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 2; `[unknown]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1
  - top JS (total): `diagnostics (chrome://browser/content/axiosozo/WebKitEngineControls.sy` 8
  - GC/CC markers: GCSlice 3× 19 ms, GCMinor 1× 1 ms
  - busiest DOM Worker 97 ms: buckets subprocess_pipe_io 97, poll_wait 97; top self: `[libc.so.6]` 97
- **tab:7706** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0
- **tab:7332** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:7351** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0; `[]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1931, main 1038, Renderer 122, SwComposite 73, other 31, WRRenderBackend 29, Compositor 22, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1038 ms (33.2% of span): Idle 468, JavaScript 281, Other 136, DOM 63, GC / CC 62, Profiler 25
  - JS leaf 111 / native under JS 274 / native 653; buckets: poll_wait 524, engine_stream_read 180, subprocess_pipe_io 167, bgra_to_rgba 103, gc_cc 62, array_buffer_copy 57, put_image_data 43, canvas_2d 39
  - top self: `[libc.so.6]` 662; `[libxul.so]` 203; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 99; `[unknown]` 21; `[axiosozo-dev]` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 163; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 159; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 156; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 156
  - GC/CC markers: GCMajor 2× 251 ms, GCSlice 19× 60 ms, CCSlice 4× 9 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 1931 ms: buckets subprocess_pipe_io 1931, poll_wait 501, gc_cc 26, memcpy_memset 24; top self: `[libc.so.6]` 867; `[libxul.so]` 578; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 129; `[unknown]` 99; `syscall@@GLIBC_2.2.5 [libc.so.6]` 81
- **tab:7700** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2, Profiler 1
  - JS leaf 0 / native under JS 0 / native 6; buckets: gc_cc 4, poll_wait 2
  - top self: `[libxul.so]` 4; `[libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7706** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3091, main 2446, other 175, Renderer 150, SwComposite 96, WRRenderBackend 37, Compositor 32, WRSceneBuilder 8, IPC I/O 6, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2446 ms (14.2% of span): Idle 1273, JavaScript 529, Other 275, GC / CC 164, DOM 113, Profiler 43
  - JS leaf 255 / native under JS 448 / native 1743; buckets: poll_wait 1437, engine_stream_read 382, subprocess_pipe_io 249, bgra_to_rgba 226, gc_cc 164, array_buffer_copy 91, worker_messaging 49, put_image_data 48
  - top self: `[libc.so.6]` 1538; `[libxul.so]` 515; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 222; `[unknown]` 32; `[axiosozo-dev]` 23; `[linux-vdso.so.1]` 9
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 309; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 286; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 285; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 284
  - GC/CC markers: GCMajor 5× 2321 ms, GCSlice 49× 181 ms, CCSlice 9× 20 ms, GCMinor 7× 10 ms, CC 5× 0 ms
  - busiest DOM Worker 3081 ms: buckets subprocess_pipe_io 3081, poll_wait 1260, gc_cc 50, memcpy_memset 32; top self: `[libc.so.6]` 1708; `[libxul.so]` 796; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 152; `[unknown]` 122; `syscall@@GLIBC_2.2.5 [libc.so.6]` 88
- **tab:7351** CPU ms by thread group: main 13, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 13 ms (0.1% of span): GC / CC 8, Idle 5, Other 0
  - JS leaf 0 / native under JS 0 / native 13; buckets: gc_cc 8, poll_wait 6
  - top self: `[libxul.so]` 7; `[libc.so.6]` 6; `[linux-vdso.so.1]` 0
  - GC/CC markers: GCMajor 1× 8 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7251** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 10 ms (0.1% of span): GC / CC 8, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: gc_cc 8, poll_wait 3
  - top self: `[libxul.so]` 6; `[libc.so.6]` 3; `[]` 1
  - GC/CC markers: GCMajor 1× 25 ms, GCSlice 4× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7310** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 5, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 5, gc_cc 2
  - top self: `[libc.so.6]` 5; `[libxul.so]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 636, main 574, Renderer 45, other 36, SwComposite 32, Compositor 14, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 574 ms (15.7% of span): Idle 286, JavaScript 106, Other 64, Graphics 37, Layout 32, DOM 25
  - JS leaf 14 / native under JS 154 / native 406; buckets: poll_wait 338, paint_layout 65, engine_stream_read 58, subprocess_pipe_io 44, array_buffer_copy 17, gc_cc 8, worker_messaging 4, memcpy_memset 3
  - top self: `[libc.so.6]` 359; `[libxul.so]` 149; `[unknown]` 18; `[axiosozo-dev]` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[linux-vdso.so.1]` 3
  - top JS (total): `update/< (moz-src:///browser/components/urlbar/UrlbarValueFormatter.sy` 39
  - GC/CC markers: GCSlice 2× 6 ms, GCMinor 2× 3 ms
  - busiest DOM Worker 636 ms: buckets subprocess_pipe_io 636, poll_wait 272, gc_cc 6, memcpy_memset 2; top self: `[libc.so.6]` 359; `[libxul.so]` 165; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 23; `[unknown]` 23; `syscall@@GLIBC_2.2.5 [libc.so.6]` 20
- **tab:7251** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, array_buffer_copy 0
  - top self: `[libc.so.6]` 5; `[libxul.so]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[5` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[5]` 0
- **tab:7789** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[linux-vdso.so.1]` 0
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 99, Renderer 23, DOM Worker 16, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 99 ms (32.1% of span): JavaScript 43, GC / CC 16, Layout 12, Other 8, Graphics 8, Idle 6
  - JS leaf 9 / native under JS 42 / native 48; buckets: paint_layout 18, gc_cc 16, poll_wait 10, engine_stream_read 4, subprocess_pipe_io 2, memcpy_memset 2, mozafterpaint_events 1, worker_messaging 0
  - top self: `[libxul.so]` 57; `[libc.so.6]` 14; `[axiosozo-dev]` 8; `[unknown]` 4; `trackRunListenerPromise (resource://gre/modules/ExtensionPar` 3; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 3
  - top JS (total): `switchToGecko (chrome://browser/content/axiosozo/WebKitPresenter.sys.m` 9; `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 9
  - GC/CC markers: GCSlice 4× 9 ms, CCSlice 1× 6 ms
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, poll_wait 14; top self: `[libc.so.6]` 14; `[libxul.so]` 2
- **tab:7700** CPU ms by thread group: main 27, IPC I/O 2, Socket 0, other 0, ImageIO 0
  - main thread 27 ms (8.8% of span): JavaScript 10, Other 8, Idle 4, Layout 2, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 11 / native 16; buckets: poll_wait 4, paint_layout 1
  - top self: `[libxul.so]` 20; `[libc.so.6]` 5; `[]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 6
- **tab:7251** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (1.7% of span): Idle 3, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: poll_wait 3
  - top self: `[libc.so.6]` 3; `[libxul.so]` 2; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 2; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[2]` 2; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[6]` 2; `applySafeWithoutClone/< (resource://gre/modules/ExtensionCommon.sys.mj` 2; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 2; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[6` 2
- **tab:7789** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

