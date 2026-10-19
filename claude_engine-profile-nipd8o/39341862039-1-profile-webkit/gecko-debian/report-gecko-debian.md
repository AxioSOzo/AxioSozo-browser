# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

