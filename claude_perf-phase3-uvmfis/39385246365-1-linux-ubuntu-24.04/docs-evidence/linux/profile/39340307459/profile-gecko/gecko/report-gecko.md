# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.3 | **7.9** (Renderer 2.9, main 2.0, DOM Worker 1.5, TaskCon~ller # 1.0, IPC I/O Parent 0.5) | Web Content 2.9, Isolated Web Co 1.0, forkserver 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **24.8** (Renderer 14.4, WRRende~ckend# 2.3, main 1.6, WRScene~ilder# 1.3, Compositor 1.3) | Isolated Web Co 3.9, WebExtensions 0.3, Web Content 0.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **39.5** (Renderer 26.0, main 5.0, WRRende~ckend# 3.0, SwComposite 1.5, glean.dispatche 1.0) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **4.9** (main 2.9, Renderer 0.5, glean.dispatche 0.3, IPC I/O Parent 0.3, WRScene~ilder# 0.3) | Isolated Web Co 1.3, WebExtensions 0.3 | 8.0 | — |
| trace | idle | 59.0 | 17.2 | **5.5** (main 2.0, TaskCon~ller # 1.0, glean.dispatche 0.5, IPDL Background 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.1 | **20.7** (Renderer 11.5, WRRende~ckend# 2.0, main 1.6, glean.dispatche 1.3, Compositor 1.3) | Isolated Web Co 4.0 | — | — |
| trace | scroll | 59.0 | 17.1 | **37.5** (Renderer 26.5, main 3.5, WRRende~ckend# 2.5, SwComposite 2.0, WRScene~ilder# 1.0) | Isolated Web Co 3.5 | — | — |
| trace | key | — | — | **7.2** (main 3.8, Renderer 0.8, WRRende~ckend# 0.5, glean.dispatche 0.3, IPC I/O Parent 0.3) | Isolated Web Co 1.6, WebExtensions 0.3 | 9.5 | — |
| profile | idle | 59.5 | 17.1 | **18.5** (main 6.6, DOM Worker 3.8, SamplerThread 3.3, TaskCon~ller # 1.4, glean.dispatche 0.9) | Web Content 6.1, Isolated Web Co 2.8, WebExtensions 1.4, Privileged Cont 1.4 | — | — |
| profile | raf | 59.0 | 17.1 | **82.8** (DOM Worker 15.3, Renderer 14.0, main 12.7, Indexed~ IO # 12.4, SamplerThread 6.5) | Isolated Web Co 9.8, Web Content 6.2, Privileged Cont 1.6, WebExtensions 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **50.9** (Renderer 28.4, SamplerThread 5.5, main 5.0, WRRende~ckend# 3.5, Compositor 2.0) | Isolated Web Co 6.5, Web Content 6.0, WebExtensions 1.5, Privileged Cont 1.5 | — | — |
| profile | key | — | — | **10.9** (main 4.5, SamplerThread 3.5, Renderer 0.8, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Web Content 5.6, Isolated Web Co 3.0, WebExtensions 1.6, Socket Process 1.1 | 10.0 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

### Profile: gecko / idle

- **parent** CPU ms by thread group: main 152, DOM Worker 74, Socket 4, Compositor 2, other 1, IPC I/O 1, Renderer 1, WRSceneBuilder 0, WRRenderBackend 0, SwComposite 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 152 ms (7.1% of span): JavaScript 84, DOM 30, Other 14, Idle 13, GC / CC 8, Profiler 2
  - JS leaf 14 / native under JS 98 / native 40; buckets: poll_wait 19, gc_cc 8, array_buffer_copy 4, memcpy_memset 1, subprocess_pipe_io 0
  - top self: `[libxul.so]` 80; `[unknown]` 17; `poll@@GLIBC_2.2.5 [libc.so.6]` 13; `validate (chrome://global/content/third_party/cfworker/json-` 7; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 5; `[libc.so.6]` 5
  - top JS (total): `#updateImpl (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 69; `checkRecipe (resource://nimbus/lib/RemoteSettingsExperimentLoader.sys.` 55; `validate (resource://gre/modules/JsonSchema.sys.mjs:82:11)[2]` 54; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 43; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 43
  - GC/CC markers: GCMinor 4× 3 ms, CCSlice 1× 3 ms, CC 1× 0 ms
  - busiest DOM Worker 74 ms: buckets gc_cc 11, worker_messaging 7, poll_wait 3; top self: `[libxul.so]` 31; `[unknown]` 20; `jsesc (resource://gre/modules/third_party/jsesc/js` 7; `[libc.so.6]` 6; `[axiosozo-dev]` 3
- **tab:3049** CPU ms by thread group: main 29, IPC I/O 5, other 0, Socket 0, ImageIO 0
  - main thread 29 ms (1.4% of span): Idle 20, GC / CC 6, JavaScript 2, Profiler 0, Other 0, Layout 0
  - JS leaf 0 / native under JS 3 / native 26; buckets: poll_wait 21, gc_cc 6
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 20; `[libxul.so]` 7; `[libc.so.6]` 1; `[]` 0; `getrusage@@GLIBC_2.2.5 [libc.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 2
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 4 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:2988** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:2901** CPU ms by thread group: main 1, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms

### Profile: gecko / raf

- **parent** CPU ms by thread group: DOM Worker 454, Renderer 417, main 384, WRRenderBackend 72, WRSceneBuilder 52, Compositor 38, SwComposite 20, Socket 12, IPC I/O 9, other 5, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 384 ms (12.5% of span): Idle 103, DOM 79, JavaScript 65, GC / CC 59, Other 57, Network 9
  - JS leaf 9 / native under JS 118 / native 257; buckets: poll_wait 129, gc_cc 59, array_buffer_copy 8, memcpy_memset 7, paint_layout 3, ipc 1, subprocess_pipe_io 0
  - top self: `[libxul.so]` 185; `poll@@GLIBC_2.2.5 [libc.so.6]` 111; `[axiosozo-dev]` 17; `[libc.so.6]` 11; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 9; `write@@GLIBC_2.2.5 [libc.so.6]` 6
  - top JS (total): `maybeSync (resource://services-settings/RemoteSettingsClient.sys.mjs:6` 35
  - GC/CC markers: GCMajor 1× 92 ms, GCSlice 6× 27 ms, CCSlice 2× 24 ms, GCMinor 2× 6 ms
  - busiest DOM Worker 452 ms: buckets worker_messaging 333, poll_wait 108, gc_cc 87, memcpy_memset 6, array_buffer_copy 3; top self: `[libxul.so]` 202; `[libc.so.6]` 112; `[unknown]` 61; `jsesc (resource://gre/modules/third_party/jsesc/js` 24; `[axiosozo-dev]` 12
- **tab:3049** CPU ms by thread group: main 183, IPC I/O 14, other 2, Socket 0, ImageIO 0
  - main thread 183 ms (5.9% of span): Idle 106, Layout 25, Graphics 23, Other 10, Profiler 8, GC / CC 7
  - JS leaf 0 / native under JS 9 / native 174; buckets: poll_wait 106, paint_layout 33, gc_cc 7, mozafterpaint_events 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 106; `[libxul.so]` 59; `[]` 4; `[libc.so.6]` 4; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `write@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 5× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:2988** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 3, JavaScript 0, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0
  - top JS (total): `receiveMessage (moz-src:///toolkit/actors/RemotePageChild.sys.mjs:92:1` 0
- **utility:3038** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2

### Profile: gecko / scroll

- **parent** CPU ms by thread group: Renderer 553, main 95, WRRenderBackend 65, DOM Worker 40, SwComposite 39, Compositor 25, WRSceneBuilder 20, IPC I/O 7, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 95 ms (4.7% of span): Idle 66, Other 11, Graphics 8, JavaScript 4, Layout 4, DOM 1
  - JS leaf 0 / native under JS 5 / native 90; buckets: poll_wait 83, paint_layout 9, memcpy_memset 1, subprocess_pipe_io 0, mozafterpaint_events 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 68; `[libxul.so]` 21; `[axiosozo-dev]` 1; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[libgobject-2.0.so.0]` 1; `g_free_sized [libglib-2.0.so.0]` 1
  - busiest DOM Worker 39 ms: buckets gc_cc 38, memcpy_memset 11, poll_wait 4, worker_messaging 1; top self: `[libxul.so]` 20; `madvise@@GLIBC_2.2.5 [libc.so.6]` 10; `[libc.so.6]` 4; `munmap@@GLIBC_2.2.5 [libc.so.6]` 2; `[axiosozo-dev]` 1
- **tab:3049** CPU ms by thread group: main 83, IPC I/O 12, other 1, Socket 0, ImageIO 0
  - main thread 83 ms (4.1% of span): Idle 63, Graphics 11, Other 4, JavaScript 3, Layout 1, Profiler 1
  - JS leaf 0 / native under JS 3 / native 80; buckets: poll_wait 63, paint_layout 11
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 62; `[libxul.so]` 14; `[]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `[linux-vdso.so.1]` 1; `[libc.so.6]` 0
- **tab:3131** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3133** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: gecko / key

- **parent** CPU ms by thread group: main 168, Renderer 29, WRRenderBackend 17, Compositor 16, WRSceneBuilder 12, IPC I/O 7, SwComposite 4, other 2, DOM Worker 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 168 ms (4.5% of span): Idle 43, Layout 30, GC / CC 28, Other 22, Graphics 22, JavaScript 14
  - JS leaf 1 / native under JS 22 / native 145; buckets: poll_wait 59, paint_layout 48, gc_cc 28, array_buffer_copy 3, memcpy_memset 1, subprocess_pipe_io 0, mozafterpaint_events 0
  - top self: `[libxul.so]` 93; `poll@@GLIBC_2.2.5 [libc.so.6]` 44; `[axiosozo-dev]` 7; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 3; `[libc.so.6]` 2; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 1× 70 ms, GCSlice 7× 20 ms, CCSlice 2× 6 ms, GCMinor 1× 1 ms
  - busiest DOM Worker 1 ms: buckets worker_messaging 1, poll_wait 1, gc_cc 0; top self: `[libc.so.6]` 1; `[libxul.so]` 0
- **tab:3049** CPU ms by thread group: main 56, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 56 ms (1.5% of span): Idle 22, GC / CC 8, Layout 7, Graphics 6, Other 6, JavaScript 4
  - JS leaf 0 / native under JS 5 / native 51; buckets: poll_wait 22, gc_cc 8, paint_layout 8
  - top self: `[libxul.so]` 29; `poll@@GLIBC_2.2.5 [libc.so.6]` 22; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `http://127.0.0.1:37345/engine.html:4:29[7]` 0
  - GC/CC markers: GCMajor 1× 37 ms, CCSlice 1× 4 ms, GCSlice 4× 3 ms, GCMinor 1× 1 ms
- **tab:2901** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, gc_cc 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 5; `[libxul.so]` 0
  - top JS (total): `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[5]` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 0; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[1]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[5` 0; `applySafeWithoutClone/< (resource://gre/modules/ExtensionCommon.sys.mj` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:2988** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

