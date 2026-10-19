# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **62.0** (main 27.4, DOM Worker 20.1, Renderer 9.1, glean.dispatche 1.8, Softwar~cThread 1.8) | AxioCEFProbe 49.3, cef:gpu-process 14.6, cef:utility 12.8, cef:renderer 11.0 | — | 495.4 |
| plain | idle | — | — | **5.3** (main 3.8, Timer 1.0, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5, WebExtensions 0.5 | — | — |
| plain | raf | 42.5 | 40.6 | **129.0** (DOM Worker 72.4, main 38.9, Renderer 5.1, TaskCon~ller # 3.9, SwComposite 3.9) | cef:renderer 10.9, AxioCEFProbe 10.9, cef:gpu-process 7.0, WebExtensions 0.6 | — | — |
| plain | scroll | 34.9 | 42.9 | **126.9** (DOM Worker 61.2, main 49.1, Renderer 5.3, TaskCon~ller # 3.9, SwComposite 2.9) | cef:gpu-process 23.6, AxioCEFProbe 11.1, cef:renderer 11.1, WebExtensions 0.5 | — | — |
| plain | key | — | — | **28.1** (main 11.5, DOM Worker 10.7, Renderer 1.1, Timer 0.8, TaskCon~ller # 0.8) | AxioCEFProbe 2.8, cef:renderer 2.5, cef:gpu-process 0.6, WebExtensions 0.3 | 28.8 | — |
| plain | switch-to-gecko | — | — | **13.5** (DOM Worker 3.6, main 3.2, IndexedDB IO # 2.7, IPDL Background 1.4, TaskCon~ller # 0.9) | Web Content 0.1, Isolated Web Co 0.1 | — | 15030.5 |
| trace | switch-to-engine | — | — | **70.5** (main 24.8, Renderer 22.8, DOM Worker 14.5, WRScene~ilder# 2.1, WRRende~ckend# 2.1) | AxioCEFProbe 55.9, cef:gpu-process 18.6, cef:utility 12.4, cef:renderer 10.4 | — | 427.2 |
| trace | idle | — | — | **14.5** (main 7.7, TaskCon~ller # 2.9, DOM Worker 2.9, Timer 1.0) | Web Content 4.3, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| trace | raf | 42.4 | 38.9 | **131.8** (DOM Worker 73.3, main 38.9, Renderer 5.5, TaskCon~ller # 4.5, SwComposite 4.5) | AxioCEFProbe 10.7, cef:renderer 10.3, cef:gpu-process 6.7, cef:utility 0.3 | — | — |
| trace | scroll | 4.7 | 11775.5 | **19.1** (main 8.6, DOM Worker 7.2, Timer 0.9, TaskCon~ller # 0.8, Renderer 0.5) | cef:gpu-process 3.0, AxioCEFProbe 2.0, cef:renderer 1.4, Isolated Web Co 0.1 | — | — |
| trace | key | — | — | **27.8** (main 11.2, DOM Worker 11.2, Timer 1.4, Renderer 1.1, SwComposite 0.8) | cef:renderer 2.8, AxioCEFProbe 2.5, cef:gpu-process 0.3, WebExtensions 0.3 | 29.6 | — |
| trace | switch-to-gecko | — | — | **1.5** (main 0.7, TaskCon~ller # 0.4, Renderer 0.1, BgIOThr~Pool # 0.1, WRRende~ckend# 0.1) | Privileged Cont 0.3, Web Content 0.2, Isolated Web Co 0.1 | — | 15024.4 |
| profile | switch-to-engine | — | — | **56.3** (DOM Worker 21.8, main 18.2, SamplerThread 7.3, Renderer 3.6, IPC I/O Parent 1.8) | AxioCEFProbe 49.1, cef:gpu-process 18.2, cef:utility 12.8, Web Content 10.9 | — | 499.2 |
| profile | idle | — | — | **22.9** (DOM Worker 8.1, SamplerThread 8.1, main 4.8, Timer 1.9) | Web Content 7.7, Socket Process 1.9, RDD Process 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 30.5 | 56.7 | **142.4** (DOM Worker 73.6, main 38.7, SamplerThread 13.4, Renderer 4.5, SwComposite 3.5) | Web Content 10.9, cef:renderer 10.6, AxioCEFProbe 9.6, cef:gpu-process 7.0 | — | — |
| profile | scroll | 3.5 | 11818.7 | **39.7** (DOM Worker 14.7, main 10.0, SamplerThread 9.0, BgIOThr~Pool # 2.0, Timer 1.6) | Web Content 10.0, cef:gpu-process 3.1, Privileged Cont 2.1, WebExtensions 2.0 | — | — |
| profile | key | — | — | **55.2** (DOM Worker 21.6, main 16.4, SamplerThread 10.4, Timer 1.9, Renderer 1.6) | Web Content 9.6, AxioCEFProbe 4.0, Isolated Web Co 2.2, WebExtensions 2.2 | 39.9 | — |
| profile | switch-to-gecko | — | — | **5.2** (SamplerThread 3.3, main 0.9, TaskCon~ller # 0.4, Renderer 0.1, IPC I/O Parent 0.1) | Web Content 8.6, Privileged Cont 1.7, WebExtensions 1.6, Isolated Web Co 1.6 | — | 15029.1 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 447.2; first putImageData end 448.0

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 520.3; first putImageData end 522.3

Switch timeline (profile, switch-to-gecko, ms after the window start): first ImageData 18.5; first putImageData end 18.8

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 108, main 103, Renderer 27, WRRenderBackend 6, Compositor 4, WRSceneBuilder 4, SwComposite 2, IPC I/O 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 103 ms (17.5% of span): JavaScript 35, Idle 26, Layout 20, DOM 9, Other 6, Profiler 4
  - JS leaf 11 / native under JS 40 / native 53; buckets: poll_wait 28, engine_stream_read 18, bgra_to_rgba 11, subprocess_pipe_io 10, paint_layout 9, put_image_data 3, canvas_2d 3, array_buffer_copy 2
  - top self: `[libxul.so]` 49; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `[libc.so.6]` 5; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 5; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.s` 4; `[axiosozo-dev]` 2
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 18
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, poll_wait 43, gc_cc 2, worker_messaging 1, memcpy_memset 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 41; `[libxul.so]` 30; `[libc.so.6]` 21; `[axiosozo-dev]` 5; `[unknown]` 3
- **tab:4096** CPU ms by thread group: main 35, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 35 ms (6.0% of span): Other 27, JavaScript 7, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 32; buckets: poll_wait 1, gc_cc 1
  - top self: `[libxul.so]` 16; `[]` 5; `[libc.so.6]` 3; `[libexpat.so.1]` 3; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:3981** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.6% of span): Other 2, Idle 2, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, paint_layout 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0; `std::__detail::_Prime_rehash_policy::_M_need_rehash(unsigned` 0
- **tab:4091** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 102, main 82, other 20, IPC I/O 1, Socket 1, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 82 ms (3.9% of span): Idle 71, JavaScript 5, Other 4, DOM 1, Profiler 1
  - JS leaf 0 / native under JS 6 / native 76; buckets: poll_wait 73, memcpy_memset 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 71; `[libxul.so]` 7; `[libgdk-3.so.0]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 0; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 4; `executeScript (chrome://remote/content/marionette/actors/MarionetteCom` 3; `evaluate.sandbox (chrome://remote/content/marionette/evaluate.sys.mjs:` 3
  - busiest DOM Worker 102 ms: buckets subprocess_pipe_io 102, poll_wait 102; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 102; `[libxul.so]` 0
- **tab:4091** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3458** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: DOM Worker 2209, main 1124, Renderer 135, SwComposite 92, WRRenderBackend 35, other 34, Compositor 26, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1125 ms (35.5% of span): Idle 506, JavaScript 319, Other 147, GC / CC 65, DOM 56, Profiler 17
  - JS leaf 139 / native under JS 284 / native 701; buckets: poll_wait 568, subprocess_pipe_io 204, engine_stream_read 192, bgra_to_rgba 125, gc_cc 65, array_buffer_copy 51, put_image_data 46, worker_messaging 43
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 514; `[libxul.so]` 207; `[libc.so.6]` 142; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 120; `write@@GLIBC_2.2.5 [libc.so.6]` 27; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 22
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 192; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 181; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 179; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[6` 179
  - GC/CC markers: GCMajor 2× 215 ms, GCSlice 19× 58 ms, CCSlice 2× 7 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 2209 ms: buckets subprocess_pipe_io 2209, poll_wait 530, gc_cc 27, memcpy_memset 15; top self: `[libxul.so]` 713; `poll@@GLIBC_2.2.5 [libc.so.6]` 502; `[libc.so.6]` 215; `read@@GLIBC_2.2.5 [libc.so.6]` 176; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 145
- **tab:3981** CPU ms by thread group: main 7, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 7; buckets: gc_cc 4, poll_wait 3
  - top self: `[libxul.so]` 3; `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[]` 0
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:4096** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4091** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms

### Profile: chromium / scroll

- **parent** CPU ms by thread group: DOM Worker 1999, main 1528, other 166, Renderer 72, SwComposite 43, WRRenderBackend 19, Compositor 17, IPC I/O 7, WRSceneBuilder 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1527 ms (8.9% of span): Idle 787, JavaScript 403, Other 157, GC / CC 88, DOM 39, Graphics 22
  - JS leaf 235 / native under JS 264 / native 1029; buckets: poll_wait 912, engine_stream_read 262, bgra_to_rgba 221, subprocess_pipe_io 172, gc_cc 89, worker_messaging 50, array_buffer_copy 46, paint_layout 21
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 799; `[libxul.so]` 283; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 219; `[libc.so.6]` 77; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 30; `write@@GLIBC_2.2.5 [libc.so.6]` 25
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 262; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 241; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[7` 240; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 240
  - GC/CC markers: GCMajor 3× 438 ms, GCSlice 31× 85 ms, CCSlice 3× 9 ms, GCMinor 6× 7 ms, CC 2× 0 ms
  - busiest DOM Worker 1999 ms: buckets subprocess_pipe_io 1999, poll_wait 1065, gc_cc 34, memcpy_memset 14; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1060; `[libxul.so]` 404; `read@@GLIBC_2.2.5 [libc.so.6]` 106; `[libc.so.6]` 95; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 78
- **tab:3497** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 5, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: poll_wait 5
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 5; `[libxul.so]` 1; `[libc.so.6]` 1; `[]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 2; `renderUsage (chrome://browser/content/axiosozo/overview/about-axiosozo` 1; `renderUsage/< (chrome://browser/content/axiosozo/overview/about-axioso` 1; `renderRules (chrome://browser/content/axiosozo/overview/about-axiosozo` 1; `keepFocus (chrome://browser/content/axiosozo/overview/about-axiosozo.m` 1; `h (chrome://browser/content/axiosozo/overview/about-axiosozo.mjs:94:11` 1
- **tab:3986** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `read@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0
- **tab:4091** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0; `[linux-vdso.so.1]` 0; `[libc.so.6]` 0

### Profile: chromium / key

- **parent** CPU ms by thread group: DOM Worker 679, main 548, Renderer 45, other 38, SwComposite 34, Compositor 16, WRRenderBackend 15, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 549 ms (14.9% of span): Idle 246, JavaScript 100, Other 56, Layout 43, GC / CC 31, Graphics 30
  - JS leaf 15 / native under JS 180 / native 354; buckets: poll_wait 288, subprocess_pipe_io 69, paint_layout 67, engine_stream_read 41, gc_cc 31, worker_messaging 18, array_buffer_copy 16, bgra_to_rgba 6
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 251; `[libxul.so]` 186; `[libc.so.6]` 33; `[unknown]` 18; `[axiosozo-dev]` 10; `write@@GLIBC_2.2.5 [libc.so.6]` 7
  - top JS (total): `update/< (moz-src:///browser/components/urlbar/UrlbarValueFormatter.sy` 49
  - GC/CC markers: GCMajor 1× 492 ms, GCSlice 10× 29 ms, CCSlice 2× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - busiest DOM Worker 679 ms: buckets subprocess_pipe_io 679, poll_wait 272, gc_cc 8, memcpy_memset 2; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 270; `[libxul.so]` 189; `read@@GLIBC_2.2.5 [libc.so.6]` 43; `[libc.so.6]` 42; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 34
- **tab:3409** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0, GC / CC 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[unknown]` 0; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[4` 1; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[4]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4091** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:4096** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 137, DOM Worker 27, Renderer 24, IPC I/O 7, Compositor 4, other 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 137 ms (0.9% of span): GC / CC 57, Idle 27, JavaScript 18, Layout 18, DOM 7, Other 7
  - JS leaf 2 / native under JS 36 / native 99; buckets: gc_cc 57, poll_wait 30, paint_layout 7, subprocess_pipe_io 3, memcpy_memset 2, engine_stream_read 1, worker_messaging 1
  - top self: `[libxul.so]` 88; `poll@@GLIBC_2.2.5 [libc.so.6]` 28; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 6; `[libc.so.6]` 3; `[axiosozo-dev]` 2; `madvise@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 2× 474 ms, GCSlice 10× 51 ms, CCSlice 2× 8 ms, GCMinor 3× 2 ms, CC 2× 0 ms
  - busiest DOM Worker 27 ms: buckets subprocess_pipe_io 27, poll_wait 17, worker_messaging 2, gc_cc 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 15; `[libxul.so]` 5; `[libc.so.6]` 3; `read@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3497** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `std::chrono::_V2::steady_clock::now()@@GLIBCXX_3.4.19 [libst` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3981** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 4, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libxul.so]` 0; `[libc.so.6]` 0
- **tab:3458** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

