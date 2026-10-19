# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.1 | **6.8** (main 2.4, Renderer 1.9, TaskCon~ller # 1.0, IPDL Background 0.5, WRRende~ckend# 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **28.7** (Renderer 17.6, WRRende~ckend# 2.3, glean.dispatche 2.0, main 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.6, WebExtensions 0.6, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **48.5** (Renderer 30.6, main 5.9, WRRende~ckend# 3.5, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.5, Web Content 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **6.4** (main 3.7, Renderer 0.8, WRRende~ckend# 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.6, WebExtensions 0.5 | 10.0 | — |
| trace | idle | 59.2 | 17.1 | **5.4** (main 1.9, TaskCon~ller # 1.0, Softwar~cThread 1.0, glean.dispatche 0.5, Compositor 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **26.0** (Renderer 14.0, WRRende~ckend# 2.6, main 1.6, glean.dispatche 1.6, WRScene~ilder# 1.6) | Isolated Web Co 4.2 | — | — |
| trace | scroll | 59.0 | 17.1 | **45.5** (Renderer 30.6, main 4.9, WRRende~ckend# 3.5, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.5, Web Content 0.5 | — | — |
| trace | key | — | — | **8.7** (main 4.0, Renderer 1.1, glean.dispatche 0.5, TaskCon~ller # 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.6, WebExtensions 0.3, Web Content 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.3 | **95.4** (DOM Worker 29.2, Indexed~ IO # 22.5, main 18.7, IPDL Background 9.6, SamplerThread 7.7) | Web Content 10.1, Isolated Web Co 5.3, WebExtensions 2.9, Privileged Cont 2.4 | — | — |
| profile | raf | 59.0 | 17.2 | **73.5** (Renderer 17.2, main 12.6, DOM Worker 9.4, SamplerThread 8.1, Indexed~ IO # 6.8) | Isolated Web Co 11.3, Web Content 9.1, WebExtensions 1.9, Privileged Cont 1.9 | — | — |
| profile | scroll | 59.0 | 17.2 | **69.4** (Renderer 35.1, main 8.8, SamplerThread 8.8, WRRende~ckend# 4.9, Compositor 2.4) | Isolated Web Co 10.8, Web Content 9.3, WebExtensions 2.0, Socket Process 1.5 | — | — |
| profile | key | — | — | **15.8** (main 5.6, SamplerThread 4.5, Renderer 1.1, Compositor 1.1, glean.dispatche 0.5) | Web Content 8.5, Isolated Web Co 4.6, WebExtensions 1.9, Privileged Cont 1.9 | 9.0 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko / idle

- **parent** CPU ms by thread group: DOM Worker 583, main 375, Socket 10, Compositor 3, other 2, IPC I/O 1, Renderer 0, WRRenderBackend 0, WRSceneBuilder 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 375 ms (17.8% of span): JavaScript 140, DOM 116, Idle 52, Other 40, GC / CC 11, Profiler 9
  - JS leaf 20 / native under JS 206 / native 149; buckets: poll_wait 73, array_buffer_copy 15, gc_cc 12, memcpy_memset 2, paint_layout 1, worker_messaging 1, subprocess_pipe_io 0
  - top self: `[libxul.so]` 194; `poll@@GLIBC_2.2.5 [libc.so.6]` 53; `[unknown]` 30; `[libc.so.6]` 22; `validate (chrome://global/content/third_party/cfworker/json-` 14; `[axiosozo-dev]` 14
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 101; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 79; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[252]` 76; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 59; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 59
  - GC/CC markers: GCMinor 6× 11 ms
  - busiest DOM Worker 582 ms: buckets worker_messaging 333, poll_wait 111, gc_cc 99, memcpy_memset 8, array_buffer_copy 4; top self: `[libxul.so]` 257; `[libc.so.6]` 125; `[unknown]` 87; `jsesc (resource://gre/modules/third_party/jsesc/js` 29; `[axiosozo-dev]` 17
- **tab:3201** CPU ms by thread group: main 39, IPC I/O 7, other 0, Socket 0, ImageIO 0
  - main thread 39 ms (1.8% of span): Idle 27, GC / CC 7, JavaScript 3, Other 1, Profiler 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 36; buckets: poll_wait 27, gc_cc 7
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 27; `[libxul.so]` 10; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 0; `[unknown]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 2; `executeScript (chrome://remote/content/marionette/actors/MarionetteCom` 2
  - GC/CC markers: GCMajor 1× 21 ms, GCSlice 4× 4 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:3138** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2
- **tab:3037** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

### Profile: gecko / raf

- **parent** CPU ms by thread group: Renderer 499, main 371, DOM Worker 277, WRRenderBackend 82, WRSceneBuilder 63, Compositor 50, SwComposite 23, Socket 14, IPC I/O 12, other 3, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 371 ms (11.9% of span): Idle 91, JavaScript 68, GC / CC 66, DOM 60, Other 59, Network 12
  - JS leaf 8 / native under JS 103 / native 260; buckets: poll_wait 124, gc_cc 66, memcpy_memset 2, paint_layout 2, array_buffer_copy 2
  - top self: `[libxul.so]` 183; `poll@@GLIBC_2.2.5 [libc.so.6]` 97; `[libc.so.6]` 15; `[unknown]` 13; `[axiosozo-dev]` 8; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 7
  - top JS (total): `executeIDB (resource://services-settings/Database.sys.mjs:505:26)[11]` 27
  - GC/CC markers: GCMajor 1× 151 ms, GCSlice 32× 37 ms, CCSlice 2× 28 ms, GCMinor 2× 4 ms, CC 1× 0 ms
  - busiest DOM Worker 273 ms: buckets worker_messaging 205, poll_wait 52, gc_cc 33, array_buffer_copy 2, memcpy_memset 0; top self: `[libxul.so]` 106; `[libc.so.6]` 58; `[unknown]` 54; `jsesc (resource://gre/modules/third_party/jsesc/js` 23; `test (self-hosted:3931:20)` 8
- **tab:3201** CPU ms by thread group: main 200, IPC I/O 19, other 2, Socket 0, ImageIO 0
  - main thread 200 ms (6.4% of span): Idle 109, Graphics 33, Layout 25, Profiler 12, GC / CC 8, Other 7
  - JS leaf 0 / native under JS 11 / native 189; buckets: poll_wait 111, paint_layout 43, gc_cc 10, mozafterpaint_events 0, memcpy_memset 0, webrender_render 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 108; `[libxul.so]` 68; `[libc.so.6]` 8; `[]` 3; `[linux-vdso.so.1]` 3; `write@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 6× 4 ms, CCSlice 1× 4 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:3138** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[]` 0; `[libc.so.6]` 0
- **utility:3190** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 699, main 159, WRRenderBackend 82, SwComposite 41, Compositor 33, WRSceneBuilder 23, IPC I/O 9, DOM Worker 2, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 159 ms (7.7% of span): Idle 72, GC / CC 45, Other 22, JavaScript 8, Graphics 6, Layout 3
  - JS leaf 2 / native under JS 8 / native 150; buckets: poll_wait 97, gc_cc 45, paint_layout 6, memcpy_memset 3, subprocess_pipe_io 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 73; `[libxul.so]` 61; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 5; `[libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 84 ms, GCSlice 6× 32 ms, CCSlice 1× 8 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 1 ms: buckets gc_cc 1, worker_messaging 0, poll_wait 0; top self: `[libxul.so]` 1; `[libc.so.6]` 0
- **tab:3201** CPU ms by thread group: main 98, IPC I/O 16, other 1, Socket 0, ImageIO 0
  - main thread 98 ms (4.7% of span): Idle 64, Graphics 18, Other 8, DOM 3, Profiler 2, Layout 2
  - JS leaf 0 / native under JS 3 / native 95; buckets: poll_wait 65, paint_layout 19, gc_cc 0, webrender_render 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 64; `[libxul.so]` 28; `[libc.so.6]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 1; `read@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3284** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3204** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0

### Profile: gecko / key

- **parent** CPU ms by thread group: main 210, Renderer 37, Compositor 21, WRRenderBackend 20, WRSceneBuilder 15, IPC I/O 10, SwComposite 5, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (5.6% of span): Idle 44, Layout 42, GC / CC 28, Other 28, JavaScript 26, Graphics 24
  - JS leaf 1 / native under JS 32 / native 178; buckets: poll_wait 70, paint_layout 61, gc_cc 28, memcpy_memset 3, array_buffer_copy 1, mozafterpaint_events 1, subprocess_pipe_io 0, webrender_render 0
  - top self: `[libxul.so]` 131; `poll@@GLIBC_2.2.5 [libc.so.6]` 45; `[libc.so.6]` 8; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `[axiosozo-dev]` 3; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 63 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 1 ms
  - busiest DOM Worker 3 ms: buckets gc_cc 3, memcpy_memset 2, worker_messaging 0, poll_wait 0; top self: `madvise@@GLIBC_2.2.5 [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `[libc.so.6]` 0; `[libxul.so]` 0
- **tab:3201** CPU ms by thread group: main 70, IPC I/O 7, other 1, Socket 0, ImageIO 0
  - main thread 70 ms (1.9% of span): Idle 27, Other 13, JavaScript 9, GC / CC 9, Layout 5, DOM 4
  - JS leaf 0 / native under JS 9 / native 61; buckets: poll_wait 28, gc_cc 10, paint_layout 3
  - top self: `[libxul.so]` 31; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `[]` 2; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 3
  - GC/CC markers: GCMajor 1× 53 ms, CCSlice 1× 5 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms
- **tab:3037** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, GC / CC 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: poll_wait 6, gc_cc 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `[libc.so.6]` 1
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[1` 1; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[1]` 1; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[7]` 0; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:3120** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 0

