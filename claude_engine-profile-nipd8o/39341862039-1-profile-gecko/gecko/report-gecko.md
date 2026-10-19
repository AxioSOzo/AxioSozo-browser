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

