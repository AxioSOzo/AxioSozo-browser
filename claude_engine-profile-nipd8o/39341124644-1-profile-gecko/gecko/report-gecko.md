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

