# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **9.8** (Renderer 3.4, main 2.4, IPDL Background 1.0, DOM Worker 1.0, WRScene~ilder# 0.5) | Web Content 2.9, Isolated Web Co 1.5 | — | — |
| plain | raf | 59.0 | 17.1 | **31.0** (Renderer 18.4, WRRende~ckend# 2.6, main 2.3, glean.dispatche 1.6, Compositor 1.6) | Isolated Web Co 4.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **52.8** (Renderer 32.8, main 6.5, WRRende~ckend# 3.5, glean.dispatche 2.0, SwComposite 2.0) | Isolated Web Co 4.5 | — | — |
| plain | key | — | — | **7.7** (main 3.7, Renderer 1.1, glean.dispatche 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Isolated Web Co 2.1, WebExtensions 0.6, Web Content 0.5 | 8.5 | — |
| trace | idle | 59.1 | 17.2 | **5.9** (main 2.9, TaskCon~ller # 1.5, glean.dispatche 0.5, Socket Thread 0.5, IPDL Background 0.5) | Isolated Web Co 1.5, WebExtensions 0.5 | — | — |
| trace | raf | 59.0 | 17.2 | **26.2** (Renderer 14.4, WRRende~ckend# 2.6, main 2.3, glean.dispatche 2.0, Compositor 1.6) | Isolated Web Co 5.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **49.8** (Renderer 32.3, main 5.5, WRRende~ckend# 4.0, SwComposite 2.5, glean.dispatche 1.5) | Isolated Web Co 6.0 | — | — |
| trace | key | — | — | **8.6** (main 4.5, TaskCon~ller # 0.8, Renderer 0.8, glean.dispatche 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.3, WebExtensions 0.3 | 8.0 | — |
| profile | idle | 59.5 | 17.1 | **79.4** (DOM Worker 21.2, Indexed~ IO # 20.2, main 15.9, IPDL Background 8.2, SamplerThread 6.7) | Web Content 10.1, Isolated Web Co 6.3, Socket Process 1.9, WebExtensions 1.9 | — | — |
| profile | raf | 59.0 | 17.5 | **78.4** (Renderer 17.0, main 15.3, DOM Worker 11.1, SamplerThread 8.2, Indexed~ IO # 4.9) | Isolated Web Co 13.1, Web Content 10.1, WebExtensions 2.0, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.2 | **72.2** (Renderer 36.0, main 9.9, SamplerThread 8.9, WRRende~ckend# 4.9, SwComposite 3.0) | Isolated Web Co 10.4, Web Content 9.4, Privileged Cont 2.5, WebExtensions 2.0 | — | — |
| profile | key | — | — | **15.9** (main 6.1, SamplerThread 4.3, Renderer 1.3, Compositor 0.8, glean.dispatche 0.5) | Web Content 8.8, Isolated Web Co 4.3, Socket Process 1.6, WebExtensions 1.6 | 10.0 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: DOM Worker 420, main 323, Socket 10, other 2, Compositor 1, IPC I/O 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 323 ms (15.4% of span): JavaScript 142, DOM 86, Idle 41, Other 39, Network 5, Profiler 5
  - JS leaf 25 / native under JS 184 / native 114; buckets: poll_wait 57, array_buffer_copy 9, gc_cc 5, memcpy_memset 2, worker_messaging 1, paint_layout 1
  - top self: `[libxul.so]` 168; `[libc.so.6]` 70; `[unknown]` 26; `validate (chrome://global/content/third_party/cfworker/json-` 12; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 11; `[axiosozo-dev]` 9
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 100; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 86; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[119]` 85; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 64; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 64
  - GC/CC markers: GCMinor 4× 4 ms
  - busiest DOM Worker 420 ms: buckets worker_messaging 190, poll_wait 99, gc_cc 57, memcpy_memset 8, array_buffer_copy 1; top self: `[libxul.so]` 177; `[libc.so.6]` 114; `[unknown]` 47; `jsesc (resource://gre/modules/third_party/jsesc/js` 21; `[axiosozo-dev]` 16
- **tab:8336** CPU ms by thread group: main 41, IPC I/O 8, other 0, Socket 0, ImageIO 0
  - main thread 41 ms (2.0% of span): Idle 24, GC / CC 7, JavaScript 4, Other 2, Layout 2, Profiler 2
  - JS leaf 0 / native under JS 6 / native 35; buckets: poll_wait 24, gc_cc 7, memcpy_memset 0
  - top self: `[libc.so.6]` 25; `[libxul.so]` 13; `[]` 2; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0; `tick (http://127.0.0.1:38527/engine.html?page=2:4:14)[5]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 4
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 5 ms, GCSlice 3× 4 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8176** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[libxul.so]` 0; `[linux-vdso.so.1]` 0
- **tab:8270** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[]` 0

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 504, main 430, DOM Worker 320, WRRenderBackend 93, WRSceneBuilder 65, Compositor 53, SwComposite 23, Socket 17, IPC I/O 13, other 6, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 430 ms (13.9% of span): Idle 104, JavaScript 98, Other 72, DOM 68, GC / CC 67, Profiler 10
  - JS leaf 8 / native under JS 134 / native 288; buckets: poll_wait 136, gc_cc 67, array_buffer_copy 3, memcpy_memset 3, ipc 1
  - top self: `[libxul.so]` 215; `[libc.so.6]` 150; `[axiosozo-dev]` 10; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 9; `[unknown]` 8; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5
  - top JS (total): `maybeSync (resource://services-settings/RemoteSettingsClient.sys.mjs:6` 34
  - GC/CC markers: GCMajor 1× 98 ms, GCSlice 11× 42 ms, CCSlice 2× 24 ms, GCMinor 2× 5 ms, CC 1× 0 ms
  - busiest DOM Worker 318 ms: buckets worker_messaging 262, gc_cc 71, poll_wait 55, array_buffer_copy 1, memcpy_memset 0; top self: `[libxul.so]` 137; `[unknown]` 61; `[libc.so.6]` 58; `jsesc (resource://gre/modules/third_party/jsesc/js` 35; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6
- **tab:8336** CPU ms by thread group: main 239, IPC I/O 21, other 7, Socket 0, ImageIO 0
  - main thread 239 ms (7.7% of span): Idle 106, Graphics 48, Layout 38, Other 16, Profiler 10, GC / CC 10
  - JS leaf 0 / native under JS 13 / native 225; buckets: poll_wait 108, paint_layout 65, gc_cc 11, memcpy_memset 1, mozafterpaint_events 0, webrender_render 0
  - top self: `[libc.so.6]` 120; `[libxul.so]` 102; `[]` 9; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `[linux-vdso.so.1]` 1
  - GC/CC markers: GCMajor 1× 33 ms, GCSlice 6× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8270** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `[libc.so.6]` 4; `[libglib-2.0.so.0]` 0; `[libxul.so]` 0
- **utility:8322** CPU ms by thread group: main 2, IPC I/O 2
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `[libc.so.6]` 2; `[libxul.so]` 0

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 711, main 175, WRRenderBackend 89, SwComposite 42, Compositor 36, WRSceneBuilder 24, IPC I/O 10, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0, DOM Worker 0
  - main thread 175 ms (8.6% of span): Idle 83, GC / CC 35, Other 22, Graphics 13, JavaScript 8, Layout 7
  - JS leaf 0 / native under JS 9 / native 166; buckets: poll_wait 114, gc_cc 35, paint_layout 15, subprocess_pipe_io 2, memcpy_memset 1, mozafterpaint_events 0
  - top self: `[libc.so.6]` 90; `[libxul.so]` 71; `[linux-vdso.so.1]` 3; `[axiosozo-dev]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 79 ms, GCSlice 7× 28 ms, CCSlice 1× 8 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - busiest DOM Worker 0 ms: buckets worker_messaging 0, poll_wait 0; top self: `[libc.so.6]` 0
- **tab:8336** CPU ms by thread group: main 109, IPC I/O 18, other 1, Socket 0, ImageIO 0
  - main thread 109 ms (5.3% of span): Idle 71, Graphics 20, Other 10, Layout 3, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 2 / native 107; buckets: poll_wait 71, paint_layout 23
  - top self: `[libc.so.6]` 75; `[libxul.so]` 29; `[]` 2; `[linux-vdso.so.1]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:8251** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0
- **tab:8229** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0; `[libxul.so]` 0

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 212, Renderer 38, Compositor 22, WRRenderBackend 21, WRSceneBuilder 15, IPC I/O 10, SwComposite 5, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 212 ms (5.6% of span): Layout 42, Idle 39, Other 36, Graphics 30, GC / CC 29, JavaScript 25
  - JS leaf 2 / native under JS 32 / native 179; buckets: paint_layout 66, poll_wait 65, gc_cc 29, memcpy_memset 2, mozafterpaint_events 0, subprocess_pipe_io 0
  - top self: `[libxul.so]` 123; `[libc.so.6]` 59; `[unknown]` 5; `[axiosozo-dev]` 4; `syscall@@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 6× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - busiest DOM Worker 3 ms: buckets gc_cc 3, memcpy_memset 2, worker_messaging 0, poll_wait 0; top self: `madvise@@GLIBC_2.2.5 [libc.so.6]` 2; `[libxul.so]` 2; `[libc.so.6]` 0
- **tab:8336** CPU ms by thread group: main 72, IPC I/O 8, other 1, Socket 0, ImageIO 0
  - main thread 72 ms (1.9% of span): Idle 26, Other 13, GC / CC 10, JavaScript 8, Graphics 5, Layout 4
  - JS leaf 0 / native under JS 7 / native 65; buckets: poll_wait 27, gc_cc 10, paint_layout 8, memcpy_memset 0
  - top self: `[libxul.so]` 39; `[libc.so.6]` 29; `[]` 2; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `g_main_context_iteration [libglib-2.0.so.0]` 0; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 30 ms, GCSlice 4× 6 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
- **tab:8176** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Profiler 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 5, gc_cc 0, array_buffer_copy 0
  - top self: `[libc.so.6]` 6; `[libxul.so]` 1; `[linux-vdso.so.1]` 0
  - top JS (total): `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[5]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[5` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8270** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[libxul.so]` 0

