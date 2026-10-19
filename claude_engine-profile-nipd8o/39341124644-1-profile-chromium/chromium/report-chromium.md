# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **59.9** (main 24.0, DOM Worker 17.1, Renderer 8.6, WRRende~ckend# 3.4, Socket Thread 1.7) | AxioCEFProbe 46.2, cef:gpu-process 15.4, cef:utility 12.0, cef:renderer 8.6 | — | 543.3 |
| plain | idle | — | — | **4.8** (main 3.8, Timer 1.0) | Web Content 3.4, AxioCEFProbe 0.5 | — | — |
| plain | raf | 45.6 | 39.0 | **132.2** (DOM Worker 71.6, main 39.7, Renderer 5.5, TaskCon~ller # 4.8, SwComposite 4.2) | AxioCEFProbe 11.3, cef:renderer 10.7, cef:gpu-process 7.4, Web Content 0.6 | — | — |
| plain | scroll | 36.4 | 49.1 | **126.0** (DOM Worker 58.6, main 50.4, Renderer 4.8, TaskCon~ller # 3.4, SwComposite 2.9) | cef:gpu-process 25.2, cef:renderer 10.7, AxioCEFProbe 10.2, WebExtensions 0.5 | — | — |
| plain | key | — | — | **26.4** (main 11.2, DOM Worker 9.6, TaskCon~ller # 1.6, Renderer 1.1, Timer 0.8) | AxioCEFProbe 3.0, cef:renderer 2.2, cef:gpu-process 0.8, WebExtensions 0.3 | 28.1 | — |
| plain | switch-to-gecko | — | — | **13.1** (DOM Worker 4.0, main 3.7, Indexed~ IO # 1.8, IPDL Background 1.3, TaskCon~ller # 0.9) | Privileged Cont 0.2, WebExtensions 0.1 | — | 15153.8 |
| trace | switch-to-engine | — | — | **69.6** (Renderer 25.3, main 23.2, DOM Worker 14.8, glean.dispatche 2.1, WRRende~ckend# 2.1) | AxioCEFProbe 59.1, cef:gpu-process 19.0, cef:utility 14.7, cef:renderer 10.6 | — | 434.8 |
| trace | idle | — | — | **16.8** (main 8.2, TaskCon~ller # 4.3, DOM Worker 2.4, Timer 1.4, IPDL Background 0.5) | Web Content 2.9, AxioCEFProbe 1.0, cef:renderer 0.5 | — | — |
| trace | raf | 45.5 | 37.7 | **131.9** (DOM Worker 72.0, main 39.9, Renderer 5.5, TaskCon~ller # 4.8, SwComposite 4.5) | cef:renderer 11.6, AxioCEFProbe 10.9, cef:gpu-process 7.1, cef:utility 0.3 | — | — |
| trace | scroll | 5.2 | 11785.1 | **19.2** (main 8.9, DOM Worker 7.2, Timer 1.0, Renderer 0.6, TaskCon~ller # 0.5) | cef:gpu-process 3.2, AxioCEFProbe 1.8, cef:renderer 1.2, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **27.5** (main 11.2, DOM Worker 10.4, Timer 1.1, TaskCon~ller # 1.1, Renderer 0.8) | AxioCEFProbe 3.0, cef:renderer 2.8, cef:gpu-process 0.6, Web Content 0.3 | 28.5 | — |
| trace | switch-to-gecko | — | — | **24.9** (main 12.5, BgIOThr~Pool # 6.2, Renderer 6.2) |  | — | 133.6 |
| profile | switch-to-engine | — | — | **54.6** (main 18.8, DOM Worker 18.8, SamplerThread 9.4, Renderer 5.7, Compositor 1.9) | AxioCEFProbe 56.5, cef:gpu-process 18.9, cef:utility 11.3, cef:renderer 9.4 | — | 490.2 |
| profile | idle | — | — | **22.5** (SamplerThread 8.1, DOM Worker 7.2, main 4.8, Timer 1.4, IPDL Background 0.5) | Web Content 6.7, WebExtensions 1.4, Privileged Cont 1.4, Isolated Web Co 1.4 | — | — |
| profile | raf | 33.1 | 46.9 | **145.4** (DOM Worker 72.2, main 40.6, SamplerThread 13.4, TaskCon~ller # 4.8, Renderer 4.5) | cef:renderer 11.9, Web Content 10.2, AxioCEFProbe 10.2, cef:gpu-process 7.3 | — | — |
| profile | scroll | 3.8 | 11803.2 | **35.7** (DOM Worker 13.6, main 9.8, SamplerThread 8.7, Timer 1.6, TaskCon~ller # 0.5) | Web Content 9.1, cef:gpu-process 3.2, Privileged Cont 1.8, AxioCEFProbe 1.8 | — | — |
| profile | key | — | — | **60.4** (DOM Worker 19.7, main 16.4, SamplerThread 10.4, BgIOThr~Pool # 4.6, Timer 1.9) | Web Content 8.7, AxioCEFProbe 3.8, cef:renderer 2.5, Privileged Cont 2.2 | 37.6 | — |
| profile | switch-to-gecko | — | — | **5.5** (SamplerThread 3.6, main 0.9, TaskCon~ller # 0.4, DOM Worker 0.2, IPC I/O Parent 0.1) | Web Content 8.2, WebExtensions 1.8, Privileged Cont 1.8, Isolated Web Co 1.6 | — | 15031.4 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 444.3; first putImageData end 445.1

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 506.1; first putImageData end 508.0

Switch timeline (profile, switch-to-gecko, ms after the window start): first ImageData 15.7; first putImageData end 15.9

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 101, main 90, Renderer 28, Compositor 4, WRRenderBackend 3, WRSceneBuilder 3, SwComposite 2, Socket 0, IPC I/O 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 90 ms (16.2% of span): JavaScript 26, Layout 24, Idle 22, DOM 7, Other 5, Graphics 5
  - JS leaf 3 / native under JS 36 / native 51; buckets: poll_wait 25, paint_layout 9, engine_stream_read 7, subprocess_pipe_io 7, bgra_to_rgba 4, memcpy_memset 2, array_buffer_copy 2, worker_messaging 2
  - top self: `[libxul.so]` 49; `poll [libc.so.6]` 22; `[axiosozo-dev]` 5; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.s` 3; `mprotect [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 1
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, poll_wait 52, worker_messaging 13, memcpy_memset 6, gc_cc 2; top self: `poll [libc.so.6]` 39; `[libxul.so]` 20; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 13; `read [libc.so.6]` 6; `__memset_avx2_unaligned_erms [libc.so.6]` 4
- **tab:3962** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.6% of span): Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 2, paint_layout 0
  - top self: `poll [libc.so.6]` 2; `[libxul.so]` 1; `[]` 0; `[linux-vdso.so.1]` 0
- **tab:4072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
- **tab:3479** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: main 85, DOM Worker 84, other 19, Socket 1, IPC I/O 1, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 85 ms (4.0% of span): Idle 72, JavaScript 8, Other 3, DOM 1, Profiler 1
  - JS leaf 1 / native under JS 7 / native 76; buckets: poll_wait 74, memcpy_memset 0, subprocess_pipe_io 0
  - top self: `poll [libc.so.6]` 73; `[libxul.so]` 7; `flat (self-hosted:643:19)[1]` 1; `[unknown]` 1; `recvmsg [libc.so.6]` 1; `mprotect [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 5; `executeScript (chrome://remote/content/marionette/actors/MarionetteCom` 3; `sandbox.create (chrome://remote/content/marionette/evaluate.sys.mjs:24` 3
  - busiest DOM Worker 84 ms: buckets subprocess_pipe_io 84, poll_wait 84; top self: `poll [libc.so.6]` 84
- **tab:3479** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:3460** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[libxul.so]` 0
- **tab:4072** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[libxul.so]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: DOM Worker 2165, main 1181, Renderer 136, SwComposite 98, WRRenderBackend 38, other 31, Compositor 27, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1181 ms (37.5% of span): Idle 492, JavaScript 354, Other 147, GC / CC 95, DOM 56, Profiler 22
  - JS leaf 141 / native under JS 333 / native 707; buckets: poll_wait 560, subprocess_pipe_io 242, engine_stream_read 203, memcpy_memset 147, bgra_to_rgba 132, gc_cc 95, worker_messaging 58, array_buffer_copy 54
  - top self: `poll [libc.so.6]` 505; `[libxul.so]` 245; `__memmove_avx_unaligned_erms [libc.so.6]` 139; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 128; `write [libc.so.6]` 31; `recvmsg [libc.so.6]` 25
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 203; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 190; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[6` 183; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 183
  - GC/CC markers: GCMajor 3× 336 ms, GCSlice 33× 92 ms, CCSlice 4× 9 ms, GCMinor 3× 5 ms, CC 2× 0 ms
  - busiest DOM Worker 2165 ms: buckets subprocess_pipe_io 2165, poll_wait 501, memcpy_memset 147, gc_cc 32; top self: `[libxul.so]` 713; `poll [libc.so.6]` 490; `read [libc.so.6]` 187; `mprotect [libc.so.6]` 159; `[unknown]` 110
- **tab:3389** CPU ms by thread group: main 11, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 11 ms (0.3% of span): GC / CC 9, Idle 2
  - JS leaf 0 / native under JS 0 / native 11; buckets: gc_cc 9, poll_wait 3
  - top self: `[libxul.so]` 6; `poll [libc.so.6]` 2; `[]` 1; `__lll_lock_wait [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 27 ms, GCSlice 4× 10 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3479** CPU ms by thread group: main 9, other 1, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.3% of span): GC / CC 6, Idle 3, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 6, poll_wait 3
  - top self: `[libxul.so]` 6; `poll [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 25 ms, GCSlice 4× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3962** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 6; buckets: gc_cc 4, poll_wait 2
  - top self: `[libxul.so]` 4; `poll [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 3× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: chromium / scroll

- **parent** CPU ms by thread group: DOM Worker 1843, main 1517, other 152, Renderer 78, SwComposite 46, WRRenderBackend 21, Compositor 18, IPC I/O 6, WRSceneBuilder 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1517 ms (8.8% of span): Idle 781, JavaScript 432, Other 155, DOM 48, GC / CC 38, Profiler 28
  - JS leaf 269 / native under JS 233 / native 1015; buckets: poll_wait 901, engine_stream_read 304, bgra_to_rgba 258, subprocess_pipe_io 125, memcpy_memset 67, gc_cc 38, array_buffer_copy 35, worker_messaging 25
  - top self: `poll [libc.so.6]` 795; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 253; `[libxul.so]` 232; `__memmove_avx_unaligned_erms [libc.so.6]` 56; `[axiosozo-dev]` 24; `write [libc.so.6]` 22
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 304; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 286; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 285; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[1` 285
  - GC/CC markers: GCMajor 1× 153 ms, GCSlice 10× 30 ms, CCSlice 2× 6 ms, GCMinor 4× 5 ms, CC 1× 0 ms
  - busiest DOM Worker 1843 ms: buckets subprocess_pipe_io 1843, poll_wait 974, memcpy_memset 84, gc_cc 34; top self: `poll [libc.so.6]` 960; `[libxul.so]` 370; `mprotect [libc.so.6]` 85; `read [libc.so.6]` 79; `[unknown]` 62
- **tab:3479** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 4, JavaScript 1, DOM 1, Profiler 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: poll_wait 4, memcpy_memset 1
  - top self: `poll [libc.so.6]` 4; `[libxul.so]` 1; `__strlen_avx2 [libc.so.6]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `read [libc.so.6]` 0; `write [libc.so.6]` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 2; `renderUsage (chrome://browser/content/axiosozo/overview/about-axiosozo` 1; `renderUsage/< (chrome://browser/content/axiosozo/overview/about-axioso` 1; `h (chrome://browser/content/axiosozo/overview/about-axiosozo.mjs:94:11` 1; `nodes (chrome://browser/content/axiosozo/overview/about-axiosozo.mjs:1` 1
- **tab:3439** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:3460** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `[linux-vdso.so.1]` 0

### Profile: chromium / key

- **parent** CPU ms by thread group: DOM Worker 616, main 544, Renderer 43, SwComposite 35, other 33, Compositor 19, WRRenderBackend 16, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 545 ms (14.8% of span): Idle 220, JavaScript 123, Other 65, GC / CC 39, Layout 38, DOM 26
  - JS leaf 15 / native under JS 182 / native 347; buckets: poll_wait 268, subprocess_pipe_io 67, paint_layout 54, engine_stream_read 46, gc_cc 40, memcpy_memset 34, array_buffer_copy 17, worker_messaging 14
  - top self: `poll [libc.so.6]` 227; `[libxul.so]` 206; `__memmove_avx_unaligned_erms [libc.so.6]` 28; `[unknown]` 14; `[axiosozo-dev]` 9; `write [libc.so.6]` 8
  - top JS (total): `fillBuffer/< (resource://gre/modules/subprocess/subprocess_common.sys.` 48; `checkPendingReads (resource://gre/modules/subprocess/subprocess_common` 47; `onInput (resource://gre/modules/subprocess/subprocess_common.sys.mjs:3` 47
  - GC/CC markers: GCMajor 1× 542 ms, GCSlice 10× 38 ms, CCSlice 2× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 616 ms: buckets subprocess_pipe_io 616, poll_wait 268, memcpy_memset 39, gc_cc 8; top self: `poll [libc.so.6]` 266; `[libxul.so]` 147; `read [libc.so.6]` 36; `mprotect [libc.so.6]` 30; `[unknown]` 27
- **tab:3389** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 6
  - top self: `poll [libc.so.6]` 6; `[libxul.so]` 0; `__strlen_avx2 [libc.so.6]` 0
  - top JS (total): `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[0]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 0
- **tab:3479** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:3460** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 124, DOM Worker 24, Renderer 22, IPC I/O 6, Compositor 4, WRRenderBackend 2, other 2, WRSceneBuilder 2, SwComposite 2, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 124 ms (0.8% of span): GC / CC 53, JavaScript 19, Idle 19, Layout 17, Other 9, Graphics 4
  - JS leaf 0 / native under JS 30 / native 94; buckets: gc_cc 53, poll_wait 20, memcpy_memset 9, paint_layout 5, engine_stream_read 3, subprocess_pipe_io 2, bgra_to_rgba 1, array_buffer_copy 0
  - top self: `[libxul.so]` 79; `poll [libc.so.6]` 19; `madvise [libc.so.6]` 5; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 3; `mprotect [libc.so.6]` 3
  - GC/CC markers: GCMajor 2× 151 ms, GCSlice 8× 54 ms, CCSlice 2× 7 ms, GCMinor 3× 1 ms, CC 2× 0 ms
  - busiest DOM Worker 24 ms: buckets subprocess_pipe_io 24, poll_wait 14, worker_messaging 2, gc_cc 1; top self: `poll [libc.so.6]` 11; `[libxul.so]` 5; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3; `read [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1
- **tab:3962** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 4, Graphics 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll [libc.so.6]` 4; `[libxul.so]` 0
- **tab:3460** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0; `[libxul.so]` 0
- **tab:3479** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3

