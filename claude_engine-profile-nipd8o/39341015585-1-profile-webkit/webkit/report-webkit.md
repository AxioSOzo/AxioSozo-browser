# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **41.3** (main 16.5, DOM Worker 16.5, Renderer 6.6, WRRende~ckend# 1.7) | WPEWebProcess 66.2, AxioWebKitHost 16.5, WPENetworkProce 9.9 | — | 571.9 |
| plain | idle | — | — | **8.3** (main 6.3, Timer 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 3.4 | — | — |
| plain | raf | 34.9 | 48.3 | **120.9** (DOM Worker 64.8, main 38.2, Renderer 4.9, TaskCon~ller # 4.2, SwComposite 3.6) | WPEWebProcess 69.0, AxioWebKitHost 14.5, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | scroll | 29.0 | 75.1 | **115.9** (DOM Worker 55.5, main 48.2, Renderer 3.9, TaskCon~ller # 2.4, SwComposite 2.4) | WPEWebProcess 66.7, AxioWebKitHost 12.2, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **26.4** (main 12.0, DOM Worker 9.9, Timer 1.1, Renderer 1.1, SwComposite 0.8) | WPEWebProcess 6.5, AxioWebKitHost 1.9, WebExtensions 0.3, Web Content 0.3 | 33.3 | — |
| plain | switch-to-gecko | — | — | **56.3** (TaskCon~ller # 20.2, main 16.1, glean.dispatche 4.0, BgIOThr~Pool # 4.0, Renderer 4.0) | Isolated Web Co 8.1 | — | 215.1 |
| trace | switch-to-engine | — | — | **36.5** (main 11.6, Renderer 11.6, DOM Worker 6.6, WRRende~ckend# 3.3, Timer 1.7) | WPEWebProcess 63.1, AxioWebKitHost 16.6, WPENetworkProce 10.0 | — | 575.1 |
| trace | idle | — | — | **6.3** (main 5.3, Timer 1.0) | Web Content 3.4 | — | — |
| trace | raf | 35.3 | 44.1 | **120.4** (DOM Worker 65.2, main 37.3, Renderer 4.9, TaskCon~ller # 3.9, SwComposite 3.6) | WPEWebProcess 67.1, AxioWebKitHost 13.9 | — | — |
| trace | scroll | 7.7 | 160.4 | **49.2** (DOM Worker 19.8, main 17.3, Indexed~ IO # 3.7, TaskCon~ller # 2.5, IPDL Background 1.6) | WPEWebProcess 20.0, AxioWebKitHost 3.5, Web Content 0.1, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **27.2** (main 12.3, DOM Worker 10.4, Timer 0.8, Renderer 0.8, SwComposite 0.8) | WPEWebProcess 6.6, AxioWebKitHost 2.4 | 34.9 | — |
| trace | switch-to-gecko | — | — | **32.7** (main 16.3, BgIOThr~Pool # 4.1, Renderer 4.1, Compositor 4.1, DOM Worker 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 211.6 |
| profile | switch-to-engine | — | — | **36.2** (DOM Worker 14.8, main 9.4, SamplerThread 6.7, IPC I/O Parent 2.7, BgIOThr~Pool # 1.3) | WPEWebProcess 57.7, Web Content 40.3, AxioWebKitHost 16.1, WPENetworkProce 9.4 | — | 710.2 |
| profile | idle | — | — | **27.5** (DOM Worker 8.7, SamplerThread 8.7, main 7.7, Timer 1.9, glean.dispatche 0.5) | Web Content 9.6, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 25.3 | 60.1 | **128.8** (DOM Worker 64.1, main 38.3, SamplerThread 11.9, Renderer 3.9, TaskCon~ller # 2.9) | WPEWebProcess 69.3, AxioWebKitHost 12.2, Web Content 9.6, WebExtensions 1.9 | — | — |
| profile | scroll | 6.4 | 10861.2 | **53.8** (DOM Worker 21.7, main 16.1, SamplerThread 10.0, Timer 1.9, TaskCon~ller # 1.7) | WPEWebProcess 19.8, Web Content 10.3, AxioWebKitHost 3.2, WebExtensions 2.5 | — | — |
| profile | key | — | — | **58.3** (DOM Worker 21.3, main 19.1, SamplerThread 10.4, Timer 1.9, Renderer 1.4) | Web Content 10.4, WPEWebProcess 7.2, WebExtensions 2.8, AxioWebKitHost 2.2 | 47.3 | — |
| profile | switch-to-gecko | — | — | **42.9** (main 11.7, Compositor 7.8, DOM Worker 7.8, SamplerThread 7.8, BgIOThr~Pool # 3.9) | Isolated Web Co 7.8 | — | 218.3 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 584.9; first putImageData end 586.3

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 717.4; first putImageData end 718.9

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 81, main 64, Renderer 12, IPC I/O 3, WRSceneBuilder 3, Compositor 2, WRRenderBackend 2, SwComposite 2, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 64 ms (8.4% of span): Idle 22, JavaScript 20, DOM 8, GC / CC 3, Other 3, Profiler 3
  - JS leaf 4 / native under JS 26 / native 34; buckets: poll_wait 24, engine_stream_read 11, bgra_to_rgba 6, subprocess_pipe_io 4, paint_layout 4, gc_cc 3, worker_messaging 2, array_buffer_copy 1
  - top self: `[libxul.so]` 26; `[libc.so.6]` 25; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 4; `[unknown]` 3; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - top JS (total): `switchToWebKit (chrome://browser/content/axiosozo/WebKitPresenter.sys.` 8; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 8; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 7; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 7
  - GC/CC markers: GCMinor 1× 4 ms
  - busiest DOM Worker 81 ms: buckets subprocess_pipe_io 81, poll_wait 45, gc_cc 2, worker_messaging 1, memcpy_memset 1; top self: `[libc.so.6]` 54; `[libxul.so]` 19; `[axiosozo-dev]` 2; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 2
- **tab:7792** CPU ms by thread group: main 54, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 53 ms (8.0% of span): Other 43, DOM 5, JavaScript 3, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 47; buckets: memcpy_memset 1, gc_cc 1, poll_wait 0
  - top self: `[libxul.so]` 28; `[libc.so.6]` 7; `[]` 5; `[libexpat.so.1]` 3; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `access@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7797** CPU ms by thread group: main 50, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 50 ms (7.4% of span): Other 40, JavaScript 4, DOM 4, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 45; buckets: poll_wait 1, gc_cc 1, memcpy_memset 0
  - top self: `[libxul.so]` 18; `[libc.so.6]` 15; `[]` 6; `[libexpat.so.1]` 5; `__read_nocancel@@GLIBC_PRIVATE [libc.so.6]` 2; `[unknown]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
- **tab:7705** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.2% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `[libc.so.6]` 2; `[libxul.so]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 144, DOM Worker 101, other 23, Compositor 2, Renderer 1, IPC I/O 1, Socket 1, SwComposite 1, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 144 ms (6.9% of span): Idle 117, Other 10, JavaScript 10, Profiler 4, Graphics 2, DOM 2
  - JS leaf 2 / native under JS 8 / native 134; buckets: poll_wait 123, paint_layout 2, engine_stream_read 1, memcpy_memset 1, array_buffer_copy 1, subprocess_pipe_io 0
  - top self: `[libc.so.6]` 122; `[libxul.so]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[unknown]` 1; `[axiosozo-dev]` 1; `slice (self-hosted:4456:22)[17]` 1
  - top JS (total): `diagnostics (chrome://browser/content/axiosozo/WebKitEngineControls.sy` 5
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, poll_wait 101; top self: `[libc.so.6]` 101
- **tab:7711** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7366** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[libxul.so]` 0; `[libglib-2.0.so.0]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1907, main 1094, Renderer 113, SwComposite 70, other 34, WRRenderBackend 28, Compositor 23, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1094 ms (34.9% of span): Idle 452, JavaScript 328, Other 150, DOM 70, GC / CC 64, Profiler 20
  - JS leaf 134 / native under JS 307 / native 654; buckets: poll_wait 506, engine_stream_read 200, subprocess_pipe_io 198, bgra_to_rgba 116, gc_cc 64, array_buffer_copy 63, put_image_data 50, canvas_2d 41
  - top self: `[libc.so.6]` 643; `[libxul.so]` 243; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 114; `[unknown]` 27; `[axiosozo-dev]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 183; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 170; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 169; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 168
  - GC/CC markers: GCMajor 2× 252 ms, GCSlice 18× 69 ms, CCSlice 3× 8 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 1907 ms: buckets subprocess_pipe_io 1907, poll_wait 495, gc_cc 36, memcpy_memset 10; top self: `[libc.so.6]` 862; `[libxul.so]` 588; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 113; `[unknown]` 100; `syscall@@GLIBC_2.2.5 [libc.so.6]` 78
- **tab:7705** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): GC / CC 4, Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 7; buckets: gc_cc 4, poll_wait 3
  - top self: `[libxul.so]` 3; `[libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:7316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3167, main 2506, other 176, Renderer 146, SwComposite 90, Compositor 39, WRRenderBackend 37, WRSceneBuilder 8, IPC I/O 6, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2506 ms (14.6% of span): Idle 1315, JavaScript 574, Other 288, GC / CC 166, DOM 89, Profiler 36
  - JS leaf 245 / native under JS 464 / native 1797; buckets: poll_wait 1492, engine_stream_read 362, subprocess_pipe_io 254, bgra_to_rgba 223, gc_cc 166, array_buffer_copy 76, worker_messaging 59, put_image_data 34
  - top self: `[libc.so.6]` 1605; `[libxul.so]` 500; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 220; `[unknown]` 36; `[axiosozo-dev]` 28; `[linux-vdso.so.1]` 16
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 288; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 270; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 264; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 264
  - GC/CC markers: GCMajor 5× 2443 ms, GCSlice 51× 186 ms, CCSlice 10× 23 ms, GCMinor 6× 7 ms, CC 6× 0 ms
  - busiest DOM Worker 3156 ms: buckets subprocess_pipe_io 3156, poll_wait 1345, gc_cc 46, memcpy_memset 23; top self: `[libc.so.6]` 1761; `[libxul.so]` 814; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 155; `[unknown]` 120; `syscall@@GLIBC_2.2.5 [libc.so.6]` 93
- **tab:7366** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 12 ms (0.1% of span): GC / CC 8, Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: gc_cc 8, poll_wait 4
  - top self: `[libxul.so]` 8; `[libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7257** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 7, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 7, poll_wait 2
  - top self: `[libxul.so]` 7; `[libc.so.6]` 2; `prctl@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7316** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 5, GC / CC 2, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 5, gc_cc 2
  - top self: `[libc.so.6]` 5; `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 657, main 630, Renderer 45, other 39, SwComposite 33, Compositor 16, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 630 ms (17.1% of span): Idle 292, JavaScript 105, Other 76, Layout 38, Graphics 37, GC / CC 34
  - JS leaf 12 / native under JS 190 / native 428; buckets: poll_wait 342, paint_layout 70, subprocess_pipe_io 67, engine_stream_read 60, gc_cc 34, array_buffer_copy 19, worker_messaging 15, put_image_data 6
  - top self: `[libc.so.6]` 366; `[libxul.so]` 201; `[axiosozo-dev]` 14; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - top JS (total): `fillBuffer/< (resource://gre/modules/subprocess/subprocess_common.sys.` 44; `onInput (resource://gre/modules/subprocess/subprocess_common.sys.mjs:3` 44; `checkPendingReads (resource://gre/modules/subprocess/subprocess_common` 43
  - GC/CC markers: GCMajor 1× 355 ms, GCSlice 10× 35 ms, CCSlice 2× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 657 ms: buckets subprocess_pipe_io 657, poll_wait 310, gc_cc 10, memcpy_memset 5; top self: `[libc.so.6]` 381; `[libxul.so]` 149; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 31; `[unknown]` 25; `[axiosozo-dev]` 24
- **tab:7257** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, GC / CC 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, gc_cc 0
  - top self: `[libc.so.6]` 6; `[libxul.so]` 1; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0
- **tab:7316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[libxul.so]` 0
- **tab:7366** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 72, Renderer 19, DOM Worker 14, Compositor 4, IPC I/O 2, WRSceneBuilder 2, WRRenderBackend 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 72 ms (24.0% of span): JavaScript 32, Layout 14, Other 7, Graphics 6, DOM 6, Idle 6
  - JS leaf 4 / native under JS 42 / native 26; buckets: paint_layout 14, poll_wait 7, engine_stream_read 2
  - top self: `[libxul.so]` 45; `[libc.so.6]` 10; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 2; `sameFacts (chrome://browser/content/axiosozo/ConsoleErrorsNa` 1
  - top JS (total): `switchToGecko (chrome://browser/content/axiosozo/WebKitPresenter.sys.m` 9; `callListeners (moz-src:///browser/components/tabbrowser/Tabbrowser.sys` 8; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 8; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 8
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, poll_wait 13, worker_messaging 0; top self: `[libc.so.6]` 14; `[libxul.so]` 0
- **tab:7705** CPU ms by thread group: main 27, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 27 ms (8.9% of span): JavaScript 10, Other 5, Idle 5, Layout 4, DOM 1, Network 1
  - JS leaf 0 / native under JS 9 / native 17; buckets: poll_wait 5, paint_layout 1
  - top self: `[libxul.so]` 17; `[libc.so.6]` 6; `[]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 5; `defineLogGetter (resource://autofill/FormAutofill.sys.mjs:189:18)[17]` 2; `ConsoleAPI (resource://gre/modules/Console.sys.mjs:609:27)[7]` 2
- **tab:7257** CPU ms by thread group: main 5, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 5 ms (1.8% of span): Idle 4, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: poll_wait 4
  - top self: `[libc.so.6]` 4; `[libxul.so]` 1; `[]` 0
- **tab:7797** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

