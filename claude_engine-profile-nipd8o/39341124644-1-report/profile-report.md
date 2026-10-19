# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.1 | **6.3** (main 1.9, Renderer 1.9, DOM Worker 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 2.9, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **20.7** (Renderer 11.5, WRRende~ckend# 2.3, main 1.3, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 4.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **32.0** (Renderer 19.5, main 4.5, WRRende~ckend# 2.5, glean.dispatche 1.0, TaskCon~ller # 1.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **5.0** (main 2.7, Renderer 0.8, glean.dispatche 0.3, Softwar~cThread 0.3, WRScene~ilder# 0.3) | Isolated Web Co 1.8, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | 9.0 | — |
| trace | idle | 59.0 | 17.1 | **3.4** (main 1.9, glean.dispatche 0.5, TaskCon~ller # 0.5, Renderer 0.5) | Isolated Web Co 0.5 | — | — |
| trace | raf | 59.0 | 17.2 | **16.9** (Renderer 8.5, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.2 | — | — |
| trace | scroll | 59.0 | 17.1 | **29.5** (Renderer 19.5, main 3.5, WRRende~ckend# 2.5, Compositor 1.0, SwComposite 1.0) | Isolated Web Co 3.5, Privileged Cont 0.5 | — | — |
| trace | key | — | — | **5.6** (main 3.2, glean.dispatche 0.5, TaskCon~ller # 0.5, Renderer 0.5, WRScene~ilder# 0.3) | Isolated Web Co 1.1 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **2.4** (SamplerThread 1.9, Softwar~cThread 0.5) | Web Content 5.8, Isolated Web Co 3.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | raf | 59.0 | 17.2 | **83.7** (DOM Worker 17.9, main 17.2, Indexed~ IO # 12.3, Renderer 11.4, IPDL Background 5.5) | Isolated Web Co 9.7, Web Content 4.8, Privileged Cont 1.3, RDD Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.3 | **49.9** (Renderer 23.7, main 8.4, SamplerThread 4.9, WRRende~ckend# 3.9, glean.dispatche 1.5) | Isolated Web Co 7.4, Web Content 4.9, WebExtensions 1.0, RDD Process 1.0 | — | — |
| profile | key | — | — | **10.4** (main 4.0, SamplerThread 2.9, Renderer 0.5, WRScene~ilder# 0.5, WRRende~ckend# 0.5) | Web Content 4.5, Isolated Web Co 3.3, WebExtensions 1.4, Privileged Cont 1.1 | 8.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko / idle

- **parent** CPU ms by thread group: main 4, IPC I/O 1, Socket 0, other 0, ImageIO 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, DOM Worker 0, SwComposite 0
  - main thread 4 ms (0.2% of span): Idle 3, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 1 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `[unknown]` 1; `recvmsg [libc.so.6]` 0
  - top JS (total): `deserializeJSON (chrome://remote/content/marionette/json.sys.mjs:244:2` 1; `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 1; `json.deserialize (chrome://remote/content/marionette/json.sys.mjs:243:` 1; `cloneObject (chrome://remote/content/marionette/json.sys.mjs:43:21)[13` 1
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, poll_wait 0; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3067** CPU ms by thread group: main 24, IPC I/O 4, other 0, Socket 0, ImageIO 0
  - main thread 24 ms (1.2% of span): Idle 16, GC / CC 5, JavaScript 2, Other 1, Layout 0, Profiler 0
  - JS leaf 0 / native under JS 3 / native 22; buckets: poll_wait 17, gc_cc 5, memcpy_memset 0
  - top self: `poll [libc.so.6]` 16; `[libxul.so]` 5; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `sendmsg [libc.so.6]` 0; `[]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 2; `evaluate.sandbox/promise< (chrome://remote/content/marionette/evaluate` 2
  - GC/CC markers: GCMajor 1× 19 ms, GCSlice 3× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:2975** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0
- **tab:3014** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: gecko / raf

- **parent** CPU ms by thread group: DOM Worker 534, main 516, Renderer 342, WRRenderBackend 78, WRSceneBuilder 54, Compositor 38, Socket 21, SwComposite 14, IPC I/O 9, other 8, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 516 ms (16.7% of span): JavaScript 134, DOM 125, Idle 117, Other 63, GC / CC 56, Network 14
  - JS leaf 19 / native under JS 220 / native 278; buckets: poll_wait 150, gc_cc 56, memcpy_memset 26, array_buffer_copy 13, paint_layout 2, worker_messaging 1
  - top self: `[libxul.so]` 254; `poll [libc.so.6]` 126; `[unknown]` 20; `__memmove_avx512_unaligned_erms [libc.so.6]` 16; `[axiosozo-dev]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 12
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 49; `maybeSync (resource://services-settings/RemoteSettingsClient.sys.mjs:6` 45
  - GC/CC markers: GCMajor 1× 47 ms, GCSlice 8× 30 ms, CCSlice 2× 17 ms, GCMinor 6× 12 ms
  - busiest DOM Worker 533 ms: buckets worker_messaging 348, gc_cc 134, poll_wait 97, memcpy_memset 28, array_buffer_copy 2; top self: `[libxul.so]` 249; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 85; `[unknown]` 77; `jsesc (resource://gre/modules/third_party/jsesc/js` 35; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 11
- **tab:3067** CPU ms by thread group: main 204, IPC I/O 15, other 4, Socket 0, ImageIO 0
  - main thread 204 ms (6.6% of span): Idle 100, Layout 41, Graphics 28, Other 16, Profiler 6, GC / CC 6
  - JS leaf 0 / native under JS 9 / native 195; buckets: poll_wait 102, paint_layout 54, gc_cc 6, memcpy_memset 0, webrender_render 0
  - top self: `poll [libc.so.6]` 99; `[libxul.so]` 82; `sendmsg [libc.so.6]` 8; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `write [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 16 ms, GCSlice 5× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3014** CPU ms by thread group: main 4, IPC I/O 3, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll [libc.so.6]` 4; `write [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0
- **utility:3062** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `poll [libc.so.6]` 2; `[libxul.so]` 0

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 464, main 157, WRRenderBackend 74, DOM Worker 30, Compositor 26, SwComposite 25, WRSceneBuilder 22, IPC I/O 7, other 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 157 ms (7.7% of span): Idle 69, GC / CC 48, Other 20, Graphics 9, JavaScript 5, Layout 4
  - JS leaf 0 / native under JS 6 / native 151; buckets: poll_wait 93, gc_cc 48, paint_layout 11, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `[libxul.so]` 72; `poll [libc.so.6]` 70; `[axiosozo-dev]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `recvmsg [libc.so.6]` 1; `__tls_get_addr [ld-linux-x86-64.so.2]` 1
  - GC/CC markers: GCMajor 1× 83 ms, GCSlice 8× 29 ms, CCSlice 1× 14 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 28 ms: buckets gc_cc 27, memcpy_memset 14, worker_messaging 0, poll_wait 0; top self: `madvise [libc.so.6]` 12; `[libxul.so]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `munmap [libc.so.6]` 2; `mprotect [libc.so.6]` 1
- **tab:3067** CPU ms by thread group: main 97, IPC I/O 12, other 1, Socket 0, ImageIO 0
  - main thread 97 ms (4.8% of span): Idle 65, Graphics 11, Other 8, Layout 6, JavaScript 4, DOM 2
  - JS leaf 0 / native under JS 5 / native 91; buckets: poll_wait 67, paint_layout 11, mozafterpaint_events 1, memcpy_memset 1
  - top self: `poll [libc.so.6]` 65; `[libxul.so]` 27; `[]` 1; `[libglib-2.0.so.0]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1
- **tab:2996** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `[]` 0
- **tab:3014** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0

### Profile: gecko / key

- **parent** CPU ms by thread group: main 141, Renderer 28, WRRenderBackend 19, Compositor 16, WRSceneBuilder 13, IPC I/O 6, SwComposite 3, other 2, DOM Worker 1, Socket 1, ImageIO 0, WRWorker 0, Canvas 0
  - main thread 141 ms (3.7% of span): Idle 41, Layout 31, Graphics 26, Other 21, JavaScript 15, DOM 4
  - JS leaf 3 / native under JS 18 / native 120; buckets: poll_wait 55, paint_layout 45, memcpy_memset 1, array_buffer_copy 1, subprocess_pipe_io 1, gc_cc 0, mozafterpaint_events 0, webrender_render 0
  - top self: `[libxul.so]` 75; `poll [libc.so.6]` 42; `[axiosozo-dev]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `recvmsg [libc.so.6]` 2; `[unknown]` 2
  - busiest DOM Worker 1 ms: buckets gc_cc 1, worker_messaging 0, poll_wait 0; top self: `[libxul.so]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3067** CPU ms by thread group: main 61, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 61 ms (1.6% of span): Idle 25, Layout 12, GC / CC 8, JavaScript 7, Other 3, DOM 3
  - JS leaf 0 / native under JS 9 / native 52; buckets: poll_wait 25, gc_cc 9, paint_layout 5, memcpy_memset 1, webrender_render 0
  - top self: `[libxul.so]` 30; `poll [libc.so.6]` 25; `sendmsg [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 4
  - GC/CC markers: GCMajor 1× 37 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 1 ms
- **tab:2927** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 6, DOM 0, GC / CC 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 6; `[libxul.so]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[2` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[2]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:3098** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0

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

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **5.4** (main 2.4, Renderer 1.0, DOM Worker 1.0, IPC I/O Parent 0.5, IPDL Background 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **28.8** (Renderer 17.1, WRRende~ckend# 2.3, glean.dispatche 2.0, main 1.6, TaskCon~ller # 1.6) | Isolated Web Co 4.6, WebExtensions 0.7, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **48.4** (Renderer 30.4, main 6.0, WRRende~ckend# 3.0, glean.dispatche 2.0, WRScene~ilder# 1.5) | Isolated Web Co 4.5, Web Content 0.5 | — | — |
| plain | key | — | — | **7.1** (main 3.7, Renderer 1.1, Compositor 0.5, glean.dispatche 0.3, IPDL Background 0.3) | Isolated Web Co 1.9, WebExtensions 0.6, Privileged Cont 0.3 | 9.0 | — |
| trace | idle | 59.4 | 17.2 | **5.9** (main 2.9, TaskCon~ller # 1.0, IPDL Background 0.5, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **25.7** (Renderer 13.5, WRRende~ckend# 2.3, glean.dispatche 2.0, main 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **43.8** (Renderer 30.8, main 4.0, WRRende~ckend# 3.0, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.5 | — | — |
| trace | key | — | — | **8.1** (main 4.3, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.3 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **66.2** (main 16.4, DOM Worker 15.5, IndexedDB IO # 14.0, SamplerThread 6.3, IPDL Background 5.3) | Web Content 10.6, Isolated Web Co 4.3, Privileged Cont 2.4, WebExtensions 1.9 | — | — |
| profile | raf | 59.0 | 17.3 | **86.2** (Renderer 16.0, DOM Worker 15.7, main 15.0, Indexed~ IO # 10.1, SamplerThread 8.2) | Isolated Web Co 10.1, Web Content 9.4, WebExtensions 2.3, RDD Process 1.9 | — | — |
| profile | scroll | 59.0 | 17.1 | **67.4** (Renderer 35.1, main 8.4, SamplerThread 7.9, WRRende~ckend# 4.0, TaskCon~ller # 2.0) | Web Content 8.9, Isolated Web Co 8.4, Socket Process 2.0, WebExtensions 2.0 | — | — |
| profile | key | — | — | **14.8** (main 5.3, SamplerThread 4.3, Renderer 1.1, TaskCon~ller # 0.8, WRRende~ckend# 0.8) | Web Content 8.0, Isolated Web Co 4.1, WebExtensions 2.4, Privileged Cont 1.6 | 9.0 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: main 325, DOM Worker 316, Socket 11, Compositor 2, other 2, IPC I/O 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 325 ms (15.6% of span): JavaScript 125, DOM 96, Idle 44, Other 41, Network 8, GC / CC 6
  - JS leaf 21 / native under JS 180 / native 124; buckets: poll_wait 60, memcpy_memset 16, array_buffer_copy 13, gc_cc 6, worker_messaging 1, paint_layout 1
  - top self: `[libxul.so]` 166; `__syscall_cancel_arch [libc.so.6]` 59; `[unknown]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 15; `validate (chrome://global/content/third_party/cfworker/json-` 9; `mprotect [libc.so.6]` 8
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 97; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 85; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[40]` 80; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 55
  - GC/CC markers: GCMinor 5× 7 ms
  - busiest DOM Worker 315 ms: buckets worker_messaging 158, poll_wait 64, gc_cc 36, memcpy_memset 14, array_buffer_copy 2; top self: `[libxul.so]` 120; `__syscall_cancel_arch [libc.so.6]` 57; `[unknown]` 46; `jsesc (resource://gre/modules/third_party/jsesc/js` 17; `[axiosozo-dev]` 9
- **tab:8342** CPU ms by thread group: main 31, IPC I/O 5, other 0, Socket 0, ImageIO 0
  - main thread 31 ms (1.5% of span): Idle 18, GC / CC 7, JavaScript 2, Profiler 1, Other 1, DOM 1
  - JS leaf 0 / native under JS 5 / native 25; buckets: poll_wait 18, gc_cc 7, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 19; `[libxul.so]` 11; `getcontext [libc.so.6]` 1; `[]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 3
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8286** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
- **tab:8180** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 462, DOM Worker 461, main 431, WRRenderBackend 72, WRSceneBuilder 54, Compositor 45, SwComposite 19, Socket 14, IPC I/O 10, other 7, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 431 ms (14.0% of span): Idle 97, DOM 81, JavaScript 80, Other 77, GC / CC 70, Profiler 11
  - JS leaf 8 / native under JS 126 / native 297; buckets: poll_wait 136, gc_cc 70, memcpy_memset 19, array_buffer_copy 6, paint_layout 3, subprocess_pipe_io 0
  - top self: `[libxul.so]` 216; `__syscall_cancel_arch [libc.so.6]` 129; `[axiosozo-dev]` 11; `__memmove_avx_unaligned_erms [libc.so.6]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 7; `__memset_avx2_unaligned_erms [libc.so.6]` 6
  - GC/CC markers: GCMajor 1× 92 ms, GCSlice 12× 37 ms, CCSlice 2× 26 ms, GCMinor 3× 7 ms, CC 1× 0 ms
  - busiest DOM Worker 459 ms: buckets worker_messaging 303, poll_wait 105, gc_cc 92, memcpy_memset 32, array_buffer_copy 2; top self: `[libxul.so]` 193; `__syscall_cancel_arch [libc.so.6]` 101; `[unknown]` 54; `jsesc (resource://gre/modules/third_party/jsesc/js` 24; `[axiosozo-dev]` 13
- **tab:8342** CPU ms by thread group: main 167, IPC I/O 17, other 2, Socket 0, ImageIO 0
  - main thread 167 ms (5.4% of span): Idle 100, Graphics 23, Layout 13, Other 12, Profiler 7, GC / CC 7
  - JS leaf 0 / native under JS 8 / native 160; buckets: poll_wait 100, paint_layout 36, gc_cc 8, memcpy_memset 3, webrender_render 0, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 104; `[libxul.so]` 45; `[]` 3; `[linux-vdso.so.1]` 3; `__lll_lock_wait [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 16 ms, CCSlice 1× 3 ms, GCSlice 5× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8286** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[libxul.so]` 0
- **utility:8334** CPU ms by thread group: main 2, IPC I/O 2
  - main thread 2 ms (0.1% of span): Idle 2, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[linux-vdso.so.1]` 0; `[libxul.so]` 0

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 684, main 142, WRRenderBackend 74, SwComposite 34, DOM Worker 33, Compositor 30, WRSceneBuilder 22, IPC I/O 9, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 142 ms (7.0% of span): Idle 68, GC / CC 42, Other 13, Graphics 6, JavaScript 5, Layout 5
  - JS leaf 0 / native under JS 7 / native 135; buckets: poll_wait 82, gc_cc 42, paint_layout 8, memcpy_memset 2, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 74; `[libxul.so]` 56; `[axiosozo-dev]` 3; `mprotect [libc.so.6]` 2; `syscall [libc.so.6]` 1; `__memcmp_avx2_movbe [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 79 ms, GCSlice 8× 29 ms, CCSlice 1× 8 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - busiest DOM Worker 33 ms: buckets gc_cc 33, memcpy_memset 19, poll_wait 1, worker_messaging 0; top self: `madvise [libc.so.6]` 17; `[libxul.so]` 11; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `munmap [libc.so.6]` 2; `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8342** CPU ms by thread group: main 89, IPC I/O 15, other 2, Socket 0, ImageIO 0
  - main thread 89 ms (4.4% of span): Idle 65, Graphics 12, Other 5, JavaScript 2, Profiler 2, Layout 2
  - JS leaf 0 / native under JS 3 / native 86; buckets: poll_wait 65, paint_layout 14, memcpy_memset 0, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 66; `[libxul.so]` 19; `[]` 2; `syscall [libc.so.6]` 0; `getcontext [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0
- **tab:8245** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8345** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 192, Renderer 34, Compositor 18, WRRenderBackend 17, WRSceneBuilder 14, IPC I/O 10, SwComposite 4, DOM Worker 3, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 192 ms (5.1% of span): Idle 43, Layout 40, GC / CC 28, Graphics 24, JavaScript 24, Other 24
  - JS leaf 3 / native under JS 24 / native 165; buckets: poll_wait 60, paint_layout 57, gc_cc 28, memcpy_memset 1, subprocess_pipe_io 1, mozafterpaint_events 0
  - top self: `[libxul.so]` 120; `__syscall_cancel_arch [libc.so.6]` 52; `[unknown]` 2; `[axiosozo-dev]` 2; `__lll_lock_wake [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 24 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms
  - busiest DOM Worker 2 ms: buckets gc_cc 1, worker_messaging 1, poll_wait 1; top self: `[libxul.so]` 1; `__syscall_cancel_arch [libc.so.6]` 1
- **tab:8342** CPU ms by thread group: main 65, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 65 ms (1.7% of span): Idle 24, GC / CC 9, DOM 7, JavaScript 6, Layout 5, Other 5
  - JS leaf 0 / native under JS 6 / native 59; buckets: poll_wait 24, gc_cc 9, paint_layout 7, memcpy_memset 1, webrender_render 0
  - top self: `[libxul.so]` 32; `__syscall_cancel_arch [libc.so.6]` 25; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 2; `__lll_lock_wait [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 4
  - GC/CC markers: GCMajor 1× 19 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms
- **tab:8180** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 7, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `__strlen_avx2 [libc.so.6]` 0; `[libxul.so]` 0; `[]` 0
  - top JS (total): `applySafeWithoutClone/< (resource://gre/modules/ExtensionCommon.sys.mj` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[8]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[8` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8267** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **42.1** (main 17.8, DOM Worker 13.0, Renderer 4.9, glean.dispatche 1.6, TaskCon~ller # 1.6) | WPEWebProcess 66.5, AxioWebKitHost 14.6, WPENetworkProce 9.7, bwrap 1.6 | — | 585.0 |
| plain | idle | — | — | **9.3** (main 6.3, Timer 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 2.9, forkserver 0.5 | — | — |
| plain | raf | 36.5 | 42.0 | **119.1** (DOM Worker 66.0, main 36.6, Renderer 4.9, SwComposite 3.2, TaskCon~ller # 2.9) | WPEWebProcess 67.3, AxioWebKitHost 14.9, WebExtensions 1.0, Web Content 0.3 | — | — |
| plain | scroll | 30.4 | 50.0 | **117.5** (DOM Worker 57.0, main 46.3, Renderer 3.9, TaskCon~ller # 2.9, SwComposite 2.4) | WPEWebProcess 65.3, AxioWebKitHost 12.7, Web Content 1.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **29.6** (main 12.6, DOM Worker 10.2, TaskCon~ller # 1.9, Renderer 1.4, SwComposite 1.1) | WPEWebProcess 6.6, AxioWebKitHost 2.2 | 35.4 | — |
| plain | switch-to-gecko | — | — | **16.8** (main 8.4, BgIOThr~Pool # 4.2, Renderer 4.2) | Isolated Web Co 4.2 | — | 210.8 |
| trace | switch-to-engine | — | — | **41.8** (Renderer 15.7, main 12.2, DOM Worker 7.0, Softwar~cThread 3.5, glean.dispatche 1.7) | WPEWebProcess 67.8, AxioWebKitHost 15.7, WPENetworkProce 10.4 | — | 550.2 |
| trace | idle | — | — | **5.8** (main 5.3, Timer 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 36.3 | 45.3 | **117.3** (DOM Worker 65.6, main 36.2, Renderer 4.9, TaskCon~ller # 3.2, SwComposite 3.2) | WPEWebProcess 67.2, AxioWebKitHost 15.2 | — | — |
| trace | scroll | 8.0 | 127.8 | **44.9** (DOM Worker 18.9, main 16.8, TaskCon~ller # 2.2, IPDL Background 1.7, Renderer 1.0) | WPEWebProcess 19.6, AxioWebKitHost 3.6, WebExtensions 0.1, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **27.2** (main 12.4, DOM Worker 10.7, Timer 1.1, Renderer 1.1, SwComposite 0.8) | WPEWebProcess 6.5, AxioWebKitHost 1.9, WebExtensions 0.3 | 35.2 | — |
| trace | switch-to-gecko | — | — | **17.2** (main 4.3, BgIOThr~Pool # 4.3, Renderer 4.3, sqldb:p~lite # 4.3) | Isolated Web Co 4.3 | — | 211.4 |
| profile | switch-to-engine | — | — | **34.2** (DOM Worker 15.0, main 8.2, SamplerThread 8.2, TaskCon~ller # 1.4, WRScene~ilder# 1.4) | WPEWebProcess 58.5, Web Content 55.8, AxioWebKitHost 15.0, WPENetworkProce 9.5 | — | 703.2 |
| profile | idle | — | — | **31.7** (main 8.6, SamplerThread 8.6, DOM Worker 8.2, TaskCon~ller # 2.9, Timer 1.9) | Web Content 8.7, Socket Process 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 25.4 | 57.0 | **128.8** (DOM Worker 65.8, main 36.5, SamplerThread 11.6, TaskCon~ller # 3.9, Renderer 3.6) | WPEWebProcess 67.9, AxioWebKitHost 11.6, Web Content 9.7, Isolated Web Co 2.5 | — | — |
| profile | scroll | 6.4 | 10837.0 | **53.0** (DOM Worker 21.5, main 15.5, SamplerThread 9.8, Timer 1.9, TaskCon~ller # 1.6) | WPEWebProcess 19.4, Web Content 9.6, AxioWebKitHost 3.1, Privileged Cont 2.6 | — | — |
| profile | key | — | — | **55.5** (DOM Worker 21.1, main 17.8, SamplerThread 10.4, Timer 1.9, Renderer 1.1) | Web Content 10.5, WPEWebProcess 7.6, AxioWebKitHost 2.4, Privileged Cont 2.2 | 43.9 | — |
| profile | switch-to-gecko | — | — | **39.9** (main 11.9, BgIOThr~Pool # 8.0, DOM Worker 8.0, IPC I/O Parent 4.0, Renderer 4.0) | Isolated Web Co 8.0 | — | 217.6 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 556.0; first putImageData end 557.4

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 711.2; first putImageData end 711.9

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 96, main 56, Renderer 12, IPC I/O 3, Compositor 2, SwComposite 1, WRSceneBuilder 1, WRRenderBackend 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 56 ms (7.5% of span): JavaScript 25, Idle 13, Layout 7, Other 4, Profiler 3, Graphics 3
  - JS leaf 8 / native under JS 21 / native 27; buckets: poll_wait 15, engine_stream_read 12, bgra_to_rgba 7, subprocess_pipe_io 4, memcpy_memset 3, paint_layout 3, array_buffer_copy 3
  - top self: `[libxul.so]` 24; `__syscall_cancel_arch [libc.so.6]` 16; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 6; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `mprotect [libc.so.6]` 1; `setSearchMode (chrome://browser/content/urlbar/UrlbarInputBa` 1
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 10
  - busiest DOM Worker 97 ms: buckets subprocess_pipe_io 97, poll_wait 58, worker_messaging 14, memcpy_memset 4, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 64; `[libxul.so]` 15; `mprotect [libc.so.6]` 4; `syscall [libc.so.6]` 3; `[unknown]` 2
- **tab:7801** CPU ms by thread group: main 52, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 52 ms (8.6% of span): Other 37, JavaScript 6, DOM 5, Profiler 2, Idle 2
  - JS leaf 0 / native under JS 5 / native 46; buckets: memcpy_memset 2, poll_wait 2
  - top self: `[libxul.so]` 27; `[libexpat.so.1]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `[]` 3; `__strcmp_avx2 [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7795** CPU ms by thread group: main 44, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 44 ms (7.1% of span): Other 34, JavaScript 5, Profiler 4, DOM 1, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 42; buckets: poll_wait 0, gc_cc 0
  - top self: `[libxul.so]` 19; `[]` 6; `__syscall_cancel_arch [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `[libexpat.so.1]` 3
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
- **tab:7706** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.2% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 161, DOM Worker 103, other 22, Compositor 4, IPC I/O 1, Renderer 1, Socket 1, SwComposite 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 161 ms (7.7% of span): Idle 112, GC / CC 24, JavaScript 13, Other 7, DOM 4, Graphics 2
  - JS leaf 1 / native under JS 16 / native 145; buckets: poll_wait 119, gc_cc 24, engine_stream_read 3, memcpy_memset 2, paint_layout 2, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[libxul.so]` 27; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 2; `__lll_lock_wake [libc.so.6]` 2; `[unknown]` 2
  - GC/CC markers: GCSlice 3× 18 ms, CCSlice 4× 8 ms, CC 1× 0 ms
  - busiest DOM Worker 103 ms: buckets subprocess_pipe_io 103, poll_wait 103; top self: `__syscall_cancel_arch [libc.so.6]` 103; `[axiosozo-dev]` 0
- **tab:7325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7712** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
- **tab:7366** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1959, main 1039, Renderer 107, SwComposite 67, other 32, WRRenderBackend 29, Compositor 22, WRSceneBuilder 6, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1039 ms (33.2% of span): Idle 453, JavaScript 319, Other 127, DOM 60, GC / CC 56, Profiler 21
  - JS leaf 120 / native under JS 300 / native 619; buckets: poll_wait 497, subprocess_pipe_io 189, engine_stream_read 187, bgra_to_rgba 112, memcpy_memset 101, array_buffer_copy 62, gc_cc 56, put_image_data 36
  - top self: `__syscall_cancel_arch [libc.so.6]` 527; `[libxul.so]` 203; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 108; `__memmove_avx_unaligned_erms [libc.so.6]` 87; `[unknown]` 16; `[axiosozo-dev]` 15
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 170
  - GC/CC markers: GCMajor 2× 261 ms, GCSlice 19× 61 ms, CCSlice 3× 9 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 1959 ms: buckets subprocess_pipe_io 1959, poll_wait 481, memcpy_memset 118, gc_cc 30; top self: `__syscall_cancel_arch [libc.so.6]` 683; `[libxul.so]` 636; `[unknown]` 121; `mprotect [libc.so.6]` 120; `[axiosozo-dev]` 72
- **tab:7706** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: gc_cc 3, poll_wait 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7712** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:7347** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `read [libc.so.6]` 0; `PR_IntervalNow [libnspr4.so]` 0

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3083, main 2390, other 178, Renderer 135, SwComposite 87, WRRenderBackend 38, Compositor 32, WRSceneBuilder 8, IPC I/O 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2390 ms (13.9% of span): Idle 1242, JavaScript 542, Other 270, GC / CC 162, DOM 92, Profiler 42
  - JS leaf 262 / native under JS 437 / native 1690; buckets: poll_wait 1420, engine_stream_read 368, subprocess_pipe_io 260, bgra_to_rgba 235, gc_cc 164, memcpy_memset 125, array_buffer_copy 83, worker_messaging 60
  - top self: `__syscall_cancel_arch [libc.so.6]` 1374; `[libxul.so]` 449; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 233; `__memmove_avx_unaligned_erms [libc.so.6]` 103; `[unknown]` 34; `[axiosozo-dev]` 27
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 305
  - GC/CC markers: GCMajor 6× 2386 ms, GCSlice 53× 182 ms, CCSlice 7× 19 ms, GCMinor 7× 8 ms, CC 5× 0 ms
  - busiest DOM Worker 3071 ms: buckets subprocess_pipe_io 3071, poll_wait 1242, memcpy_memset 199, gc_cc 47; top self: `__syscall_cancel_arch [libc.so.6]` 1440; `[libxul.so]` 789; `mprotect [libc.so.6]` 144; `[unknown]` 137; `__memset_avx2_unaligned_erms [libc.so.6]` 98
- **tab:7366** CPU ms by thread group: main 11, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 11 ms (0.1% of span): GC / CC 7, Idle 4
  - JS leaf 0 / native under JS 0 / native 11; buckets: gc_cc 7, poll_wait 4
  - top self: `[libxul.so]` 7; `__syscall_cancel_arch [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 24 ms, GCSlice 4× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7275** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 7, poll_wait 3
  - top self: `[libxul.so]` 6; `__syscall_cancel_arch [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7325** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 641, main 590, Renderer 41, other 39, SwComposite 30, Compositor 15, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 590 ms (16.1% of span): Idle 285, JavaScript 100, Other 70, Layout 48, Graphics 38, DOM 26
  - JS leaf 6 / native under JS 167 / native 417; buckets: poll_wait 321, paint_layout 74, engine_stream_read 53, subprocess_pipe_io 44, memcpy_memset 42, array_buffer_copy 17, worker_messaging 6, put_image_data 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 310; `[libxul.so]` 168; `__memmove_avx_unaligned_erms [libc.so.6]` 29; `[unknown]` 18; `[axiosozo-dev]` 9; `__memset_avx2_unaligned_erms [libc.so.6]` 7
  - GC/CC markers: GCMinor 1× 2 ms
  - busiest DOM Worker 641 ms: buckets subprocess_pipe_io 641, poll_wait 305, memcpy_memset 26, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 338; `[libxul.so]` 156; `mprotect [libc.so.6]` 33; `[unknown]` 30; `[axiosozo-dev]` 18
- **tab:7275** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libxul.so]` 0; `__memcmp_avx2_movbe [libc.so.6]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[2` 0
- **tab:7325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0
- **tab:7801** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 71, Renderer 18, DOM Worker 14, Compositor 3, IPC I/O 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 71 ms (24.0% of span): JavaScript 29, Other 11, Layout 10, Graphics 7, DOM 5, Profiler 5
  - JS leaf 2 / native under JS 39 / native 30; buckets: paint_layout 15, poll_wait 9, engine_stream_read 4, memcpy_memset 2, subprocess_pipe_io 0, worker_messaging 0
  - top self: `[libxul.so]` 47; `__syscall_cancel_arch [libc.so.6]` 8; `[unknown]` 5; `mprotect [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `mozilla::detail::MutexImpl::unlock() [axiosozo-dev]` 1
  - top JS (total): `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 9; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 9; `callListeners (moz-src:///browser/components/tabbrowser/Tabbrowser.sys` 9
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, poll_wait 12, worker_messaging 0; top self: `__syscall_cancel_arch [libc.so.6]` 13; `[libxul.so]` 0
- **tab:7706** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 26 ms (8.8% of span): JavaScript 7, Other 7, Idle 4, Layout 3, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 7 / native 19; buckets: poll_wait 4, memcpy_memset 2, gc_cc 1, paint_layout 1
  - top self: `[libxul.so]` 15; `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__lll_lock_wait [libc.so.6]` 1
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 5
- **tab:7275** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (1.0% of span): Idle 2, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 2; buckets: poll_wait 2, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 1
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[3` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[3]` 0; `wrapPromise/</< (resource://gre/modules/ExtensionCommon.sys.mjs:920:11` 0
- **tab:7325** CPU ms by thread group: IPC I/O 0, main 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0

