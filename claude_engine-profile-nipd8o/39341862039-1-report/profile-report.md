# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.2 | **5.9** (main 1.9, IPDL Background 1.0, Renderer 1.0, IPC I/O Parent 0.5, Softwar~cThread 0.5) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **26.8** (Renderer 16.7, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.6, TaskCon~ller # 1.6) | Isolated Web Co 4.0, WebExtensions 0.6, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **45.8** (Renderer 29.8, main 5.0, WRRende~ckend# 3.5, glean.dispatche 1.5, Compositor 1.5) | Isolated Web Co 4.0, Web Content 0.5 | — | — |
| plain | key | — | — | **6.2** (main 3.2, Renderer 1.1, WRScene~ilder# 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.9, WebExtensions 0.3 | 10.5 | — |
| trace | idle | 59.3 | 17.1 | **4.0** (main 1.5, TaskCon~ller # 1.0, glean.dispatche 0.5, Softwar~cThread 0.5, Renderer 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.2 | **22.3** (Renderer 13.1, main 1.6, WRRende~ckend# 1.6, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 3.2, Privileged Cont 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **39.8** (Renderer 29.3, main 3.5, WRRende~ckend# 3.0, WRScene~ilder# 1.0, SwComposite 1.0) | Isolated Web Co 4.0 | — | — |
| trace | key | — | — | **7.9** (main 3.7, Renderer 1.1, TaskCon~ller # 0.8, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.3 | 9.0 | — |
| profile | idle | 59.5 | 17.2 | **81.1** (DOM Worker 23.0, main 16.8, Indexed~ IO # 11.5, IPDL Background 7.2, IndexedDB IO # 7.2) | Web Content 9.1, Isolated Web Co 3.8, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | raf | 59.0 | 17.1 | **60.9** (Renderer 14.9, main 11.4, DOM Worker 8.4, SamplerThread 7.5, IPDL Background 3.2) | Isolated Web Co 9.7, Web Content 8.7, WebExtensions 1.6, RDD Process 1.6 | — | — |
| profile | scroll | 59.0 | 17.1 | **62.2** (Renderer 33.5, SamplerThread 7.9, main 6.9, WRRende~ckend# 3.9, TaskCon~ller # 2.0) | Isolated Web Co 7.9, Web Content 7.4, Socket Process 1.5, RDD Process 1.5 | — | — |
| profile | key | — | — | **16.1** (main 5.3, SamplerThread 4.8, TaskCon~ller # 1.1, Renderer 0.8, Compositor 0.8) | Web Content 7.5, Isolated Web Co 3.5, WebExtensions 1.6, Privileged Cont 1.6 | 10.0 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko / idle

- **parent** CPU ms by thread group: DOM Worker 462, main 337, Socket 11, other 2, IPC I/O 1, Renderer 0, Compositor 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 337 ms (16.0% of span): JavaScript 128, DOM 94, Other 49, Idle 42, GC / CC 11, Profiler 8
  - JS leaf 21 / native under JS 175 / native 142; buckets: poll_wait 66, memcpy_memset 21, gc_cc 13, array_buffer_copy 12, worker_messaging 1, mozafterpaint_events 1
  - top self: `[libxul.so]` 167; `poll [libc.so.6]` 47; `[unknown]` 25; `__memmove_avx_unaligned_erms [libc.so.6]` 17; `validate (chrome://global/content/third_party/cfworker/json-` 13; `[axiosozo-dev]` 11
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 88; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 74; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[90]` 74; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 60; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 60
  - GC/CC markers: GCMinor 6× 10 ms
  - busiest DOM Worker 461 ms: buckets worker_messaging 257, poll_wait 90, gc_cc 78, memcpy_memset 19, array_buffer_copy 2; top self: `[libxul.so]` 201; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 81; `[unknown]` 70; `jsesc (resource://gre/modules/third_party/jsesc/js` 28; `[axiosozo-dev]` 14
- **tab:3344** CPU ms by thread group: main 31, IPC I/O 6, other 1, Socket 0, ImageIO 0
  - main thread 31 ms (1.5% of span): Idle 20, GC / CC 6, JavaScript 2, Other 1, Layout 1, DOM 1
  - JS leaf 0 / native under JS 3 / native 28; buckets: poll_wait 20, gc_cc 6, memcpy_memset 0
  - top self: `poll [libc.so.6]` 20; `[libxul.so]` 10; `sendmsg [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 3; `executeScript (chrome://remote/content/marionette/actors/MarionetteCom` 3
  - GC/CC markers: GCMajor 1× 24 ms, GCSlice 3× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3286** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1
- **tab:3183** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1; `[libxul.so]` 0; `__strlen_avx2 [libc.so.6]` 0; `write [libc.so.6]` 0

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 453, main 328, DOM Worker 239, WRRenderBackend 68, WRSceneBuilder 51, Compositor 41, SwComposite 15, Socket 12, IPC I/O 10, other 3, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 328 ms (10.6% of span): Idle 86, GC / CC 65, Other 62, DOM 51, JavaScript 47, Network 7
  - JS leaf 5 / native under JS 78 / native 245; buckets: poll_wait 118, gc_cc 65, memcpy_memset 11, array_buffer_copy 3, paint_layout 2, mozafterpaint_events 0
  - top self: `[libxul.so]` 157; `poll [libc.so.6]` 92; `recvmsg [libc.so.6]` 15; `[axiosozo-dev]` 11; `write [libc.so.6]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 7
  - GC/CC markers: GCMajor 1× 93 ms, GCSlice 21× 34 ms, CCSlice 3× 26 ms, GCMinor 2× 3 ms, CC 1× 0 ms
  - busiest DOM Worker 237 ms: buckets worker_messaging 184, poll_wait 50, gc_cc 23, array_buffer_copy 6, memcpy_memset 6; top self: `[libxul.so]` 102; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 46; `[unknown]` 35; `jsesc (resource://gre/modules/third_party/jsesc/js` 19; `test (self-hosted:3931:20)` 6
- **tab:3344** CPU ms by thread group: main 161, IPC I/O 16, other 2, Socket 0, ImageIO 0
  - main thread 161 ms (5.2% of span): Idle 102, Graphics 21, Layout 12, Profiler 7, GC / CC 7, Other 5
  - JS leaf 0 / native under JS 9 / native 152; buckets: poll_wait 102, paint_layout 27, gc_cc 7, memcpy_memset 2
  - top self: `poll [libc.so.6]` 102; `[libxul.so]` 46; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 7 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3286** CPU ms by thread group: main 3, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 0
- **utility:3337** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `poll [libc.so.6]` 2; `g_private_get [libglib-2.0.so.0]` 0; `write [libc.so.6]` 0

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 659, main 140, WRRenderBackend 71, SwComposite 30, Compositor 29, WRSceneBuilder 22, IPC I/O 8, DOM Worker 2, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 140 ms (6.8% of span): Idle 66, GC / CC 37, Other 18, JavaScript 8, Graphics 6, Layout 4
  - JS leaf 2 / native under JS 6 / native 131; buckets: poll_wait 86, gc_cc 37, paint_layout 6, memcpy_memset 1, subprocess_pipe_io 1
  - top self: `poll [libc.so.6]` 71; `[libxul.so]` 54; `dispatch (chrome://remote/content/marionette/server.sys.mjs:` 2; `__lll_lock_wait [libc.so.6]` 2; `recvmsg [libc.so.6]` 2; `[libgdk-3.so.0]` 1
  - GC/CC markers: GCMajor 1× 80 ms, GCSlice 6× 29 ms, CCSlice 1× 7 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - busiest DOM Worker 2 ms: buckets poll_wait 1, gc_cc 1, worker_messaging 1; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__lll_lock_wake [libc.so.6]` 0
- **tab:3344** CPU ms by thread group: main 84, IPC I/O 14, other 1, Socket 0, ImageIO 0
  - main thread 84 ms (4.1% of span): Idle 60, Graphics 13, Other 5, JavaScript 2, Layout 2, DOM 1
  - JS leaf 0 / native under JS 2 / native 81; buckets: poll_wait 62, paint_layout 13, memcpy_memset 0
  - top self: `poll [libc.so.6]` 61; `[libxul.so]` 19; `[]` 1; `sendmsg [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `g_main_context_default [libglib-2.0.so.0]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 2
- **tab:3247** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0
- **tab:3434** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

### Profile: gecko / key

- **parent** CPU ms by thread group: main 188, Renderer 33, Compositor 18, WRRenderBackend 17, WRSceneBuilder 13, IPC I/O 8, SwComposite 4, DOM Worker 3, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 188 ms (5.0% of span): Idle 42, Layout 36, Other 29, GC / CC 29, Graphics 24, JavaScript 18
  - JS leaf 0 / native under JS 25 / native 163; buckets: poll_wait 64, paint_layout 54, gc_cc 29, memcpy_memset 6
  - top self: `[libxul.so]` 110; `poll [libc.so.6]` 45; `[axiosozo-dev]` 4; `read [libc.so.6]` 4; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3
  - GC/CC markers: GCMajor 1× 77 ms, GCSlice 8× 23 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms
  - busiest DOM Worker 2 ms: buckets gc_cc 2, poll_wait 1, worker_messaging 0; top self: `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0
- **tab:3344** CPU ms by thread group: main 63, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 63 ms (1.7% of span): Idle 23, GC / CC 10, Other 7, Layout 6, JavaScript 6, Graphics 5
  - JS leaf 0 / native under JS 7 / native 57; buckets: poll_wait 24, gc_cc 10, paint_layout 9, memcpy_memset 1
  - top self: `[libxul.so]` 31; `poll [libc.so.6]` 23; `[]` 3; `sendmsg [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `__memcmp_avx2_movbe [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms
- **tab:3183** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, DOM 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: poll_wait 6, memcpy_memset 0
  - top self: `poll [libc.so.6]` 6; `[libxul.so]` 0; `[unknown]` 0; `__memmove_avx_unaligned_erms [libc.so.6]` 0; `get (resource://gre/modules/ExtensionUtils.sys.mjs:102:6)[8]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 1; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 1; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[0]` 1; `get (resource://gre/modules/ExtensionUtils.sys.mjs:102:6)[8]` 0; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:3268** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll [libc.so.6]` 1

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

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.1 | **4.9** (main 2.4, DOM Worker 1.0, IPDL Background 0.5, Softwar~cThread 0.5, Renderer 0.5) | Web Content 3.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.2 | **30.8** (Renderer 17.7, WRRende~ckend# 2.3, main 2.0, glean.dispatche 2.0, WRScene~ilder# 1.6) | Isolated Web Co 4.6, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **49.1** (Renderer 31.2, main 5.9, WRRende~ckend# 3.5, SwComposite 2.5, glean.dispatche 1.5) | Isolated Web Co 3.5 | — | — |
| plain | key | — | — | **6.5** (main 3.5, Renderer 0.8, glean.dispatche 0.5, IPC I/O Parent 0.5, Softwar~cThread 0.3) | Isolated Web Co 1.6, WebExtensions 0.3, Privileged Cont 0.3 | 8.5 | — |
| trace | idle | 59.2 | 17.1 | **4.9** (main 1.9, Renderer 1.0, TaskCon~ller # 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.0 | — | — |
| trace | raf | 59.0 | 17.1 | **23.0** (Renderer 12.8, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.3, Web Content 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **46.5** (Renderer 31.6, main 5.4, WRRende~ckend# 3.5, SwComposite 2.0, Compositor 1.5) | Isolated Web Co 4.9 | — | — |
| trace | key | — | — | **8.0** (main 4.3, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9 | 10.0 | — |
| profile | idle | 59.5 | 17.1 | **90.6** (DOM Worker 24.4, Indexed~ IO # 20.6, main 18.2, IPDL Background 9.1, SamplerThread 6.7) | Web Content 9.1, Isolated Web Co 4.8, WebExtensions 2.4, Privileged Cont 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **64.1** (Renderer 16.6, main 12.0, SamplerThread 7.1, DOM Worker 5.5, IndexedDB IO # 4.9) | Isolated Web Co 10.6, Web Content 7.8, WebExtensions 1.9, Privileged Cont 1.6 | — | — |
| profile | scroll | 59.0 | 17.1 | **66.6** (Renderer 35.2, main 8.3, SamplerThread 8.3, WRRende~ckend# 4.4, SwComposite 2.4) | Isolated Web Co 8.8, Web Content 8.3, Privileged Cont 2.0, Socket Process 1.5 | — | — |
| profile | key | — | — | **15.1** (main 5.6, SamplerThread 4.3, Renderer 1.3, TaskCon~ller # 0.8, glean.dispatche 0.5) | Web Content 8.2, Isolated Web Co 3.7, WebExtensions 1.6, Socket Process 1.3 | 10.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: DOM Worker 493, main 367, Socket 10, other 5, Compositor 2, IPC I/O 1, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 367 ms (17.4% of span): JavaScript 162, DOM 99, Idle 47, Other 38, GC / CC 9, Network 8
  - JS leaf 20 / native under JS 217 / native 130; buckets: poll_wait 62, memcpy_memset 15, array_buffer_copy 11, gc_cc 9, worker_messaging 1, paint_layout 1, subprocess_pipe_io 0
  - top self: `[libxul.so]` 204; `__syscall_cancel_arch [libc.so.6]` 54; `[unknown]` 29; `[axiosozo-dev]` 11; `mprotect [libc.so.6]` 10; `__memmove_avx_unaligned_erms [libc.so.6]` 8
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 99; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 88; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[139]` 87; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 66; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 65
  - GC/CC markers: GCMinor 7× 10 ms
  - busiest DOM Worker 492 ms: buckets worker_messaging 263, poll_wait 114, gc_cc 73, memcpy_memset 20, array_buffer_copy 0; top self: `[libxul.so]` 204; `__syscall_cancel_arch [libc.so.6]` 98; `[unknown]` 66; `jsesc (resource://gre/modules/third_party/jsesc/js` 32; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 16
- **tab:8343** CPU ms by thread group: main 36, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 36 ms (1.7% of span): Idle 23, GC / CC 6, JavaScript 3, Other 1, Layout 1, Profiler 1
  - JS leaf 0 / native under JS 4 / native 31; buckets: poll_wait 23, gc_cc 6, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 23; `[libxul.so]` 12; `[]` 0; `__lll_lock_wake [libc.so.6]` 0; `pthread_mutex_destroy@@GLIBC_2.2.5 [libc.so.6]` 0; `__memset_avx2_unaligned_erms [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 3
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8281** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
- **tab:8177** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `__memcmp_avx2_movbe [libc.so.6]` 0

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 490, main 359, DOM Worker 165, WRRenderBackend 81, WRSceneBuilder 60, Compositor 48, SwComposite 22, Socket 13, IPC I/O 11, other 3, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 359 ms (11.6% of span): Idle 99, GC / CC 74, Other 61, JavaScript 57, DOM 50, Profiler 7
  - JS leaf 7 / native under JS 77 / native 274; buckets: poll_wait 137, gc_cc 74, memcpy_memset 5, paint_layout 4, array_buffer_copy 2
  - top self: `[libxul.so]` 171; `__syscall_cancel_arch [libc.so.6]` 130; `[axiosozo-dev]` 8; `getrusage [libc.so.6]` 5; `[unknown]` 4; `syscall [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 145 ms, GCSlice 33× 41 ms, CCSlice 2× 25 ms, GCMinor 1× 4 ms, CC 1× 0 ms
  - busiest DOM Worker 163 ms: buckets worker_messaging 108, poll_wait 50, memcpy_memset 3, gc_cc 2, array_buffer_copy 1; top self: `[libxul.so]` 66; `__syscall_cancel_arch [libc.so.6]` 47; `[unknown]` 15; `jsesc (resource://gre/modules/third_party/jsesc/js` 10; `[axiosozo-dev]` 6
- **tab:8343** CPU ms by thread group: main 202, IPC I/O 18, other 2, Socket 0, ImageIO 0
  - main thread 202 ms (6.5% of span): Idle 105, Layout 27, Graphics 22, Other 22, Profiler 7, GC / CC 7
  - JS leaf 1 / native under JS 15 / native 186; buckets: poll_wait 109, paint_layout 38, gc_cc 7, memcpy_memset 3, mozafterpaint_events 1, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 113; `[libxul.so]` 73; `[]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 5× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8281** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4
- **utility:8338** CPU ms by thread group: main 2, IPC I/O 2
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 700, main 156, WRRenderBackend 81, SwComposite 39, Compositor 32, WRSceneBuilder 23, IPC I/O 9, other 2, DOM Worker 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 156 ms (7.6% of span): Idle 78, GC / CC 35, Other 16, Graphics 12, JavaScript 7, Layout 3
  - JS leaf 0 / native under JS 9 / native 147; buckets: poll_wait 101, gc_cc 35, paint_layout 13, memcpy_memset 3, subprocess_pipe_io 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 86; `[libxul.so]` 57; `[axiosozo-dev]` 6; `mprotect [libc.so.6]` 2; `syscall [libc.so.6]` 1; `madvise [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 6× 28 ms, CCSlice 1× 7 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 1 ms: buckets gc_cc 1, worker_messaging 0, poll_wait 0; top self: `[libxul.so]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8343** CPU ms by thread group: main 96, IPC I/O 16, other 1, Socket 0, ImageIO 0
  - main thread 96 ms (4.7% of span): Idle 64, Graphics 14, Other 9, JavaScript 4, Layout 3, Profiler 1
  - JS leaf 0 / native under JS 5 / native 92; buckets: poll_wait 65, paint_layout 14, memcpy_memset 0, webrender_render 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 65; `[libxul.so]` 26; `[]` 1; `__lll_lock_wake [libc.so.6]` 1; `[libglib-2.0.so.0]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:8262** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0
- **tab:8353** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 203, Renderer 34, WRRenderBackend 18, Compositor 18, WRSceneBuilder 15, IPC I/O 10, SwComposite 4, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 203 ms (5.4% of span): Idle 43, Layout 39, Other 35, GC / CC 30, Graphics 25, JavaScript 20
  - JS leaf 2 / native under JS 26 / native 176; buckets: poll_wait 68, paint_layout 61, gc_cc 30, memcpy_memset 3, array_buffer_copy 1, mozafterpaint_events 1
  - top self: `[libxul.so]` 115; `__syscall_cancel_arch [libc.so.6]` 57; `[axiosozo-dev]` 8; `getcontext [libc.so.6]` 3; `mprotect [libc.so.6]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 57 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - busiest DOM Worker 3 ms: buckets memcpy_memset 2, gc_cc 2, worker_messaging 0, poll_wait 0; top self: `madvise [libc.so.6]` 1; `[libxul.so]` 1; `munmap [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8343** CPU ms by thread group: main 54, IPC I/O 7, other 0, Socket 0, ImageIO 0
  - main thread 54 ms (1.4% of span): Idle 24, JavaScript 8, Layout 7, Other 5, Graphics 5, DOM 3
  - JS leaf 0 / native under JS 6 / native 48; buckets: poll_wait 23, paint_layout 10
  - top self: `__syscall_cancel_arch [libc.so.6]` 26; `[libxul.so]` 24; `[]` 3; `[linux-vdso.so.1]` 1
- **tab:8177** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0; `__strlen_avx2 [libc.so.6]` 0
  - top JS (total): `applySafeWithoutClone/< (resource://gre/modules/ExtensionCommon.sys.mj` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[1` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[1]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8353** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

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

