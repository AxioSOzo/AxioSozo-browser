# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **6.9** (main 2.4, DOM Worker 1.5, Renderer 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 2.9, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **30.1** (Renderer 17.4, WRRende~ckend# 3.0, main 2.3, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 5.0, Privileged Cont 0.6, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **50.4** (Renderer 31.4, main 6.5, WRRende~ckend# 4.0, Compositor 2.0, SwComposite 2.0) | Isolated Web Co 5.5 | — | — |
| plain | key | — | — | **7.2** (main 3.7, Renderer 1.1, glean.dispatche 0.3, IPC I/O Parent 0.3, IPDL Background 0.3) | Isolated Web Co 1.9, WebExtensions 0.6, Privileged Cont 0.3 | 9.5 | — |
| trace | idle | 59.3 | 17.2 | **5.4** (main 2.4, TaskCon~ller # 1.5, Timer 0.5, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.5, Web Content 0.5 | — | — |
| trace | raf | 59.0 | 17.1 | **25.6** (Renderer 13.4, WRRende~ckend# 2.6, glean.dispatche 2.0, main 1.6, WRScene~ilder# 1.3) | Isolated Web Co 4.6, Privileged Cont 0.3 | — | — |
| trace | scroll | 59.0 | 17.1 | **43.9** (Renderer 30.4, main 4.0, WRRende~ckend# 3.5, glean.dispatche 1.5, Compositor 1.5) | Isolated Web Co 5.5 | — | — |
| trace | key | — | — | **7.3** (main 4.0, Renderer 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5, IPC I/O Parent 0.3) | Isolated Web Co 1.3, WebExtensions 0.3 | 9.0 | — |
| profile | idle | 59.5 | 17.2 | **44.2** (main 13.0, DOM Worker 9.6, Indexed~ IO # 7.2, SamplerThread 4.8, IPDL Background 3.4) | Web Content 9.7, Isolated Web Co 4.8, RDD Process 2.4, WebExtensions 1.9 | — | — |
| profile | raf | 59.0 | 17.2 | **88.8** (DOM Worker 17.3, Renderer 16.6, main 16.3, SamplerThread 8.5, Indexed~ IO # 7.5) | Isolated Web Co 10.2, Web Content 9.5, WebExtensions 2.6, Privileged Cont 2.0 | — | — |
| profile | scroll | 59.0 | 17.1 | **66.4** (Renderer 34.6, main 7.9, SamplerThread 7.9, WRRende~ckend# 4.0, DOM Worker 2.5) | Web Content 9.4, Isolated Web Co 8.9, WebExtensions 2.0, Socket Process 1.5 | — | — |
| profile | key | — | — | **14.9** (main 5.3, SamplerThread 4.5, TaskCon~ller # 1.1, Renderer 0.8, Compositor 0.8) | Web Content 7.7, Isolated Web Co 3.8, WebExtensions 1.9, Privileged Cont 1.6 | 8.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: main 265, DOM Worker 193, Socket 8, Compositor 2, other 2, IPC I/O 1, Renderer 0, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 265 ms (12.7% of span): JavaScript 118, DOM 76, Other 31, Idle 27, Network 5, GC / CC 3
  - JS leaf 17 / native under JS 169 / native 79; buckets: poll_wait 38, array_buffer_copy 6, gc_cc 3, memcpy_memset 2, worker_messaging 1, paint_layout 1, subprocess_pipe_io 0
  - top self: `[libxul.so]` 157; `[libc.so.6]` 49; `[unknown]` 16; `validate (chrome://global/content/third_party/cfworker/json-` 11; `[axiosozo-dev]` 10; `next (self-hosted:392:27)[25]` 3
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 98; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 84; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[199]` 82; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 55; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 55
  - GC/CC markers: GCMinor 3× 3 ms
  - busiest DOM Worker 192 ms: buckets worker_messaging 50, poll_wait 36, gc_cc 24, array_buffer_copy 1; top self: `[libxul.so]` 84; `[libc.so.6]` 44; `[unknown]` 26; `jsesc (resource://gre/modules/third_party/jsesc/js` 11; `stringify (resource://gre/modules/CanonicalJSON.sy` 7
- **tab:8336** CPU ms by thread group: main 31, IPC I/O 5, other 0, Socket 0, ImageIO 0
  - main thread 31 ms (1.5% of span): Idle 20, GC / CC 6, JavaScript 4, Profiler 0, Layout 0, DOM 0
  - JS leaf 0 / native under JS 4 / native 27; buckets: poll_wait 22, gc_cc 6
  - top self: `[libc.so.6]` 22; `[libxul.so]` 7; `[]` 1; `[linux-vdso.so.1]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 4; `executeScript (chrome://remote/content/marionette/actors/MarionetteCom` 3
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8182** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, memcpy_memset 0
  - top self: `[libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0
- **tab:8280** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: DOM Worker 509, Renderer 476, main 467, WRRenderBackend 76, WRSceneBuilder 57, Compositor 44, SwComposite 20, Socket 15, IPC I/O 10, other 7, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 467 ms (15.1% of span): Idle 101, DOM 95, JavaScript 95, Other 75, GC / CC 75, Profiler 14
  - JS leaf 7 / native under JS 150 / native 310; buckets: poll_wait 137, gc_cc 75, array_buffer_copy 9, memcpy_memset 6, paint_layout 3, ipc 1
  - top self: `[libxul.so]` 255; `[libc.so.6]` 157; `[axiosozo-dev]` 11; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 9; `[unknown]` 9; `syscall@@GLIBC_2.2.5 [libc.so.6]` 6
  - GC/CC markers: GCMajor 1× 88 ms, GCSlice 24× 37 ms, CCSlice 2× 25 ms, GCMinor 3× 8 ms, CC 1× 0 ms
  - busiest DOM Worker 507 ms: buckets worker_messaging 384, poll_wait 106, gc_cc 97, memcpy_memset 2, array_buffer_copy 2; top self: `[libxul.so]` 212; `[libc.so.6]` 122; `[unknown]` 74; `jsesc (resource://gre/modules/third_party/jsesc/js` 39; `[axiosozo-dev]` 16
- **tab:8336** CPU ms by thread group: main 182, IPC I/O 17, other 3, Socket 0, ImageIO 0
  - main thread 182 ms (5.9% of span): Idle 110, Graphics 23, Layout 18, Other 10, Profiler 7, GC / CC 6
  - JS leaf 0 / native under JS 10 / native 171; buckets: poll_wait 113, paint_layout 35, gc_cc 6, mozafterpaint_events 0
  - top self: `[libc.so.6]` 120; `[libxul.so]` 54; `[]` 5; `g_source_ref [libglib-2.0.so.0]` 1; `[linux-vdso.so.1]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 9 ms, CCSlice 1× 3 ms, GCSlice 4× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8280** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `[libc.so.6]` 4; `[libxul.so]` 0
- **utility:8326** CPU ms by thread group: main 2, IPC I/O 2
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `[libc.so.6]` 2

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 677, main 138, WRRenderBackend 73, DOM Worker 47, SwComposite 34, Compositor 30, WRSceneBuilder 22, IPC I/O 8, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 138 ms (6.8% of span): Idle 66, GC / CC 37, Other 18, Graphics 7, JavaScript 5, Layout 3
  - JS leaf 0 / native under JS 5 / native 133; buckets: poll_wait 85, gc_cc 37, paint_layout 7, memcpy_memset 2, subprocess_pipe_io 1, mozafterpaint_events 1, array_buffer_copy 0
  - top self: `[libc.so.6]` 76; `[libxul.so]` 52; `getrusage@@GLIBC_2.2.5 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 1
  - GC/CC markers: GCMajor 1× 78 ms, GCSlice 7× 27 ms, CCSlice 1× 8 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 45 ms: buckets gc_cc 44, memcpy_memset 20, poll_wait 2, worker_messaging 1; top self: `madvise@@GLIBC_2.2.5 [libc.so.6]` 17; `[libxul.so]` 14; `[libc.so.6]` 6; `[axiosozo-dev]` 4; `munmap@@GLIBC_2.2.5 [libc.so.6]` 3
- **tab:8336** CPU ms by thread group: main 85, IPC I/O 15, other 1, Socket 0, ImageIO 0
  - main thread 85 ms (4.2% of span): Idle 58, Graphics 12, Other 8, JavaScript 3, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 4 / native 81; buckets: poll_wait 59, paint_layout 14, mozafterpaint_events 0
  - top self: `[libc.so.6]` 64; `[libxul.so]` 18; `[]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `g_main_context_default [libglib-2.0.so.0]` 0; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:8374** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0
- **tab:8422** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 193, Renderer 34, Compositor 18, WRRenderBackend 18, WRSceneBuilder 14, IPC I/O 9, DOM Worker 5, SwComposite 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 193 ms (5.1% of span): Layout 42, Idle 39, GC / CC 30, Graphics 25, Other 24, JavaScript 22
  - JS leaf 4 / native under JS 25 / native 165; buckets: poll_wait 60, paint_layout 55, gc_cc 31, subprocess_pipe_io 2, memcpy_memset 1, array_buffer_copy 1, mozafterpaint_events 1
  - top self: `[libxul.so]` 125; `[libc.so.6]` 50; `[axiosozo-dev]` 4; `[libgdk-3.so.0]` 2; `[unknown]` 2; `handlePlacesEvents (resource://gre/modules/NewTabUtils.sys.m` 1
  - GC/CC markers: GCMajor 1× 58 ms, GCSlice 6× 24 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms
  - busiest DOM Worker 3 ms: buckets gc_cc 2, poll_wait 2, memcpy_memset 1, worker_messaging 1; top self: `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `madvise@@GLIBC_2.2.5 [libc.so.6]` 1; `[libc.so.6]` 1; `[libxul.so]` 1
- **tab:8336** CPU ms by thread group: main 66, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 66 ms (1.8% of span): Idle 21, GC / CC 11, Other 10, Profiler 7, JavaScript 6, DOM 5
  - JS leaf 0 / native under JS 6 / native 60; buckets: poll_wait 22, gc_cc 11, paint_layout 8, memcpy_memset 1
  - top self: `[libxul.so]` 33; `[libc.so.6]` 25; `[]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 11 ms, CCSlice 1× 5 ms, GCSlice 5× 4 ms, GCMinor 1× 1 ms
- **tab:8182** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, DOM 0, GC / CC 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 6, gc_cc 0
  - top self: `[libc.so.6]` 6; `[libxul.so]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[0` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[4]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:598:12)[4]` 0; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[6]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[0]` 0; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8253** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[linux-vdso.so.1]` 0

