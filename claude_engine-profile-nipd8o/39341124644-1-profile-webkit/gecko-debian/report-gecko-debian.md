# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

