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

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **62.0** (main 27.4, DOM Worker 20.1, Renderer 9.1, glean.dispatche 1.8, Softwar~cThread 1.8) | AxioCEFProbe 49.3, cef:gpu-process 14.6, cef:utility 12.8, cef:renderer 11.0 | — | 495.4 |
| plain | idle | — | — | **5.3** (main 3.8, Timer 1.0, TaskCon~ller # 0.5) | Web Content 3.8, AxioCEFProbe 0.5, WebExtensions 0.5 | — | — |
| plain | raf | 42.5 | 40.6 | **129.0** (DOM Worker 72.4, main 38.9, Renderer 5.1, TaskCon~ller # 3.9, SwComposite 3.9) | cef:renderer 10.9, AxioCEFProbe 10.9, cef:gpu-process 7.0, WebExtensions 0.6 | — | — |
| plain | scroll | 34.9 | 42.9 | **126.9** (DOM Worker 61.2, main 49.1, Renderer 5.3, TaskCon~ller # 3.9, SwComposite 2.9) | cef:gpu-process 23.6, AxioCEFProbe 11.1, cef:renderer 11.1, WebExtensions 0.5 | — | — |
| plain | key | — | — | **28.1** (main 11.5, DOM Worker 10.7, Renderer 1.1, Timer 0.8, TaskCon~ller # 0.8) | AxioCEFProbe 2.8, cef:renderer 2.5, cef:gpu-process 0.6, WebExtensions 0.3 | 28.8 | — |
| plain | switch-to-gecko | — | — | **13.5** (DOM Worker 3.6, main 3.2, IndexedDB IO # 2.7, IPDL Background 1.4, TaskCon~ller # 0.9) | Web Content 0.1, Isolated Web Co 0.1 | — | 15030.5 |
| trace | switch-to-engine | — | — | **70.5** (main 24.8, Renderer 22.8, DOM Worker 14.5, WRScene~ilder# 2.1, WRRende~ckend# 2.1) | AxioCEFProbe 55.9, cef:gpu-process 18.6, cef:utility 12.4, cef:renderer 10.4 | — | 427.2 |
| trace | idle | — | — | **14.5** (main 7.7, TaskCon~ller # 2.9, DOM Worker 2.9, Timer 1.0) | Web Content 4.3, forkserver 0.5, AxioCEFProbe 0.5 | — | — |
| trace | raf | 42.4 | 38.9 | **131.8** (DOM Worker 73.3, main 38.9, Renderer 5.5, TaskCon~ller # 4.5, SwComposite 4.5) | AxioCEFProbe 10.7, cef:renderer 10.3, cef:gpu-process 6.7, cef:utility 0.3 | — | — |
| trace | scroll | 4.7 | 11775.5 | **19.1** (main 8.6, DOM Worker 7.2, Timer 0.9, TaskCon~ller # 0.8, Renderer 0.5) | cef:gpu-process 3.0, AxioCEFProbe 2.0, cef:renderer 1.4, Isolated Web Co 0.1 | — | — |
| trace | key | — | — | **27.8** (main 11.2, DOM Worker 11.2, Timer 1.4, Renderer 1.1, SwComposite 0.8) | cef:renderer 2.8, AxioCEFProbe 2.5, cef:gpu-process 0.3, WebExtensions 0.3 | 29.6 | — |
| trace | switch-to-gecko | — | — | **1.5** (main 0.7, TaskCon~ller # 0.4, Renderer 0.1, BgIOThr~Pool # 0.1, WRRende~ckend# 0.1) | Privileged Cont 0.3, Web Content 0.2, Isolated Web Co 0.1 | — | 15024.4 |
| profile | switch-to-engine | — | — | **56.3** (DOM Worker 21.8, main 18.2, SamplerThread 7.3, Renderer 3.6, IPC I/O Parent 1.8) | AxioCEFProbe 49.1, cef:gpu-process 18.2, cef:utility 12.8, Web Content 10.9 | — | 499.2 |
| profile | idle | — | — | **22.9** (DOM Worker 8.1, SamplerThread 8.1, main 4.8, Timer 1.9) | Web Content 7.7, Socket Process 1.9, RDD Process 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 30.5 | 56.7 | **142.4** (DOM Worker 73.6, main 38.7, SamplerThread 13.4, Renderer 4.5, SwComposite 3.5) | Web Content 10.9, cef:renderer 10.6, AxioCEFProbe 9.6, cef:gpu-process 7.0 | — | — |
| profile | scroll | 3.5 | 11818.7 | **39.7** (DOM Worker 14.7, main 10.0, SamplerThread 9.0, BgIOThr~Pool # 2.0, Timer 1.6) | Web Content 10.0, cef:gpu-process 3.1, Privileged Cont 2.1, WebExtensions 2.0 | — | — |
| profile | key | — | — | **55.2** (DOM Worker 21.6, main 16.4, SamplerThread 10.4, Timer 1.9, Renderer 1.6) | Web Content 9.6, AxioCEFProbe 4.0, Isolated Web Co 2.2, WebExtensions 2.2 | 39.9 | — |
| profile | switch-to-gecko | — | — | **5.2** (SamplerThread 3.3, main 0.9, TaskCon~ller # 0.4, Renderer 0.1, IPC I/O Parent 0.1) | Web Content 8.6, Privileged Cont 1.7, WebExtensions 1.6, Isolated Web Co 1.6 | — | 15029.1 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 447.2; first putImageData end 448.0

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 520.3; first putImageData end 522.3

Switch timeline (profile, switch-to-gecko, ms after the window start): first ImageData 18.5; first putImageData end 18.8

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 108, main 103, Renderer 27, WRRenderBackend 6, Compositor 4, WRSceneBuilder 4, SwComposite 2, IPC I/O 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 103 ms (17.5% of span): JavaScript 35, Idle 26, Layout 20, DOM 9, Other 6, Profiler 4
  - JS leaf 11 / native under JS 40 / native 53; buckets: poll_wait 28, engine_stream_read 18, bgra_to_rgba 11, subprocess_pipe_io 10, paint_layout 9, put_image_data 3, canvas_2d 3, array_buffer_copy 2
  - top self: `[libxul.so]` 49; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `[libc.so.6]` 5; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 5; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.s` 4; `[axiosozo-dev]` 2
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 18
  - busiest DOM Worker 108 ms: buckets subprocess_pipe_io 108, poll_wait 43, gc_cc 2, worker_messaging 1, memcpy_memset 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 41; `[libxul.so]` 30; `[libc.so.6]` 21; `[axiosozo-dev]` 5; `[unknown]` 3
- **tab:4096** CPU ms by thread group: main 35, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 35 ms (6.0% of span): Other 27, JavaScript 7, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 4 / native 32; buckets: poll_wait 1, gc_cc 1
  - top self: `[libxul.so]` 16; `[]` 5; `[libc.so.6]` 3; `[libexpat.so.1]` 3; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:3981** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.6% of span): Other 2, Idle 2, Graphics 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3, paint_layout 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0; `std::__detail::_Prime_rehash_policy::_M_need_rehash(unsigned` 0
- **tab:4091** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 102, main 82, other 20, IPC I/O 1, Socket 1, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 82 ms (3.9% of span): Idle 71, JavaScript 5, Other 4, DOM 1, Profiler 1
  - JS leaf 0 / native under JS 6 / native 76; buckets: poll_wait 73, memcpy_memset 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 71; `[libxul.so]` 7; `[libgdk-3.so.0]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `[axiosozo-dev]` 0; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 4; `executeScript (chrome://remote/content/marionette/actors/MarionetteCom` 3; `evaluate.sandbox (chrome://remote/content/marionette/evaluate.sys.mjs:` 3
  - busiest DOM Worker 102 ms: buckets subprocess_pipe_io 102, poll_wait 102; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 102; `[libxul.so]` 0
- **tab:4091** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3458** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3986** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: DOM Worker 2209, main 1124, Renderer 135, SwComposite 92, WRRenderBackend 35, other 34, Compositor 26, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1125 ms (35.5% of span): Idle 506, JavaScript 319, Other 147, GC / CC 65, DOM 56, Profiler 17
  - JS leaf 139 / native under JS 284 / native 701; buckets: poll_wait 568, subprocess_pipe_io 204, engine_stream_read 192, bgra_to_rgba 125, gc_cc 65, array_buffer_copy 51, put_image_data 46, worker_messaging 43
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 514; `[libxul.so]` 207; `[libc.so.6]` 142; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 120; `write@@GLIBC_2.2.5 [libc.so.6]` 27; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 22
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 192; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 181; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 179; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[6` 179
  - GC/CC markers: GCMajor 2× 215 ms, GCSlice 19× 58 ms, CCSlice 2× 7 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 2209 ms: buckets subprocess_pipe_io 2209, poll_wait 530, gc_cc 27, memcpy_memset 15; top self: `[libxul.so]` 713; `poll@@GLIBC_2.2.5 [libc.so.6]` 502; `[libc.so.6]` 215; `read@@GLIBC_2.2.5 [libc.so.6]` 176; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 145
- **tab:3981** CPU ms by thread group: main 7, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): GC / CC 4, Idle 2
  - JS leaf 0 / native under JS 0 / native 7; buckets: gc_cc 4, poll_wait 3
  - top self: `[libxul.so]` 3; `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[]` 0
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:4096** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4091** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms

### Profile: chromium / scroll

- **parent** CPU ms by thread group: DOM Worker 1999, main 1528, other 166, Renderer 72, SwComposite 43, WRRenderBackend 19, Compositor 17, IPC I/O 7, WRSceneBuilder 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1527 ms (8.9% of span): Idle 787, JavaScript 403, Other 157, GC / CC 88, DOM 39, Graphics 22
  - JS leaf 235 / native under JS 264 / native 1029; buckets: poll_wait 912, engine_stream_read 262, bgra_to_rgba 221, subprocess_pipe_io 172, gc_cc 89, worker_messaging 50, array_buffer_copy 46, paint_layout 21
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 799; `[libxul.so]` 283; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 219; `[libc.so.6]` 77; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 30; `write@@GLIBC_2.2.5 [libc.so.6]` 25
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 262; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 241; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[7` 240; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 240
  - GC/CC markers: GCMajor 3× 438 ms, GCSlice 31× 85 ms, CCSlice 3× 9 ms, GCMinor 6× 7 ms, CC 2× 0 ms
  - busiest DOM Worker 1999 ms: buckets subprocess_pipe_io 1999, poll_wait 1065, gc_cc 34, memcpy_memset 14; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1060; `[libxul.so]` 404; `read@@GLIBC_2.2.5 [libc.so.6]` 106; `[libc.so.6]` 95; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 78
- **tab:3497** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 5, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 5; buckets: poll_wait 5
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 5; `[libxul.so]` 1; `[libc.so.6]` 1; `[]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 2; `renderUsage (chrome://browser/content/axiosozo/overview/about-axiosozo` 1; `renderUsage/< (chrome://browser/content/axiosozo/overview/about-axioso` 1; `renderRules (chrome://browser/content/axiosozo/overview/about-axiosozo` 1; `keepFocus (chrome://browser/content/axiosozo/overview/about-axiosozo.m` 1; `h (chrome://browser/content/axiosozo/overview/about-axiosozo.mjs:94:11` 1
- **tab:3986** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `read@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0
- **tab:4091** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0; `[linux-vdso.so.1]` 0; `[libc.so.6]` 0

### Profile: chromium / key

- **parent** CPU ms by thread group: DOM Worker 679, main 548, Renderer 45, other 38, SwComposite 34, Compositor 16, WRRenderBackend 15, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 549 ms (14.9% of span): Idle 246, JavaScript 100, Other 56, Layout 43, GC / CC 31, Graphics 30
  - JS leaf 15 / native under JS 180 / native 354; buckets: poll_wait 288, subprocess_pipe_io 69, paint_layout 67, engine_stream_read 41, gc_cc 31, worker_messaging 18, array_buffer_copy 16, bgra_to_rgba 6
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 251; `[libxul.so]` 186; `[libc.so.6]` 33; `[unknown]` 18; `[axiosozo-dev]` 10; `write@@GLIBC_2.2.5 [libc.so.6]` 7
  - top JS (total): `update/< (moz-src:///browser/components/urlbar/UrlbarValueFormatter.sy` 49
  - GC/CC markers: GCMajor 1× 492 ms, GCSlice 10× 29 ms, CCSlice 2× 6 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - busiest DOM Worker 679 ms: buckets subprocess_pipe_io 679, poll_wait 272, gc_cc 8, memcpy_memset 2; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 270; `[libxul.so]` 189; `read@@GLIBC_2.2.5 [libc.so.6]` 43; `[libc.so.6]` 42; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 34
- **tab:3409** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 0, DOM 0, Other 0, GC / CC 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[unknown]` 0; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[4` 1; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[4]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4091** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:4096** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 137, DOM Worker 27, Renderer 24, IPC I/O 7, Compositor 4, other 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 137 ms (0.9% of span): GC / CC 57, Idle 27, JavaScript 18, Layout 18, DOM 7, Other 7
  - JS leaf 2 / native under JS 36 / native 99; buckets: gc_cc 57, poll_wait 30, paint_layout 7, subprocess_pipe_io 3, memcpy_memset 2, engine_stream_read 1, worker_messaging 1
  - top self: `[libxul.so]` 88; `poll@@GLIBC_2.2.5 [libc.so.6]` 28; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 6; `[libc.so.6]` 3; `[axiosozo-dev]` 2; `madvise@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMajor 2× 474 ms, GCSlice 10× 51 ms, CCSlice 2× 8 ms, GCMinor 3× 2 ms, CC 2× 0 ms
  - busiest DOM Worker 27 ms: buckets subprocess_pipe_io 27, poll_wait 17, worker_messaging 2, gc_cc 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 15; `[libxul.so]` 5; `[libc.so.6]` 3; `read@@GLIBC_2.2.5 [libc.so.6]` 1; `syscall@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3497** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `std::chrono::_V2::steady_clock::now()@@GLIBCXX_3.4.19 [libst` 0; `read@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3981** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 4, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 4
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libxul.so]` 0; `[libc.so.6]` 0
- **tab:3458** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0

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

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **41.3** (main 16.5, DOM Worker 16.5, Renderer 6.6, WRRende~ckend# 1.7) | WPEWebProcess 66.2, AxioWebKitHost 16.5, WPENetworkProce 9.9 | — | 571.9 |
| plain | idle | — | — | **8.3** (main 6.3, Timer 1.0, glean.dispatche 0.5, TaskCon~ller # 0.5) | Web Content 3.4 | — | — |
| plain | raf | 34.9 | 48.3 | **120.9** (DOM Worker 64.8, main 38.2, Renderer 4.9, TaskCon~ller # 4.2, SwComposite 3.6) | WPEWebProcess 69.0, AxioWebKitHost 14.5, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | scroll | 29.0 | 75.1 | **115.9** (DOM Worker 55.5, main 48.2, Renderer 3.9, TaskCon~ller # 2.4, SwComposite 2.4) | WPEWebProcess 66.7, AxioWebKitHost 12.2, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **26.4** (main 12.0, DOM Worker 9.9, Timer 1.1, Renderer 1.1, SwComposite 0.8) | WPEWebProcess 6.5, AxioWebKitHost 1.9, WebExtensions 0.3, Web Content 0.3 | 33.3 | — |
| plain | switch-to-gecko | — | — | **56.3** (TaskCon~ller # 20.2, main 16.1, glean.dispatche 4.0, BgIOThr~Pool # 4.0, Renderer 4.0) | Isolated Web Co 8.1 | — | 215.1 |
| trace | switch-to-engine | — | — | **36.5** (main 11.6, Renderer 11.6, DOM Worker 6.6, WRRende~ckend# 3.3, Timer 1.7) | WPEWebProcess 63.1, AxioWebKitHost 16.6, WPENetworkProce 10.0 | — | 575.1 |
| trace | idle | — | — | **6.3** (main 5.3, Timer 1.0) | Web Content 3.4 | — | — |
| trace | raf | 35.3 | 44.1 | **120.4** (DOM Worker 65.2, main 37.3, Renderer 4.9, TaskCon~ller # 3.9, SwComposite 3.6) | WPEWebProcess 67.1, AxioWebKitHost 13.9 | — | — |
| trace | scroll | 7.7 | 160.4 | **49.2** (DOM Worker 19.8, main 17.3, Indexed~ IO # 3.7, TaskCon~ller # 2.5, IPDL Background 1.6) | WPEWebProcess 20.0, AxioWebKitHost 3.5, Web Content 0.1, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **27.2** (main 12.3, DOM Worker 10.4, Timer 0.8, Renderer 0.8, SwComposite 0.8) | WPEWebProcess 6.6, AxioWebKitHost 2.4 | 34.9 | — |
| trace | switch-to-gecko | — | — | **32.7** (main 16.3, BgIOThr~Pool # 4.1, Renderer 4.1, Compositor 4.1, DOM Worker 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 211.6 |
| profile | switch-to-engine | — | — | **36.2** (DOM Worker 14.8, main 9.4, SamplerThread 6.7, IPC I/O Parent 2.7, BgIOThr~Pool # 1.3) | WPEWebProcess 57.7, Web Content 40.3, AxioWebKitHost 16.1, WPENetworkProce 9.4 | — | 710.2 |
| profile | idle | — | — | **27.5** (DOM Worker 8.7, SamplerThread 8.7, main 7.7, Timer 1.9, glean.dispatche 0.5) | Web Content 9.6, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 25.3 | 60.1 | **128.8** (DOM Worker 64.1, main 38.3, SamplerThread 11.9, Renderer 3.9, TaskCon~ller # 2.9) | WPEWebProcess 69.3, AxioWebKitHost 12.2, Web Content 9.6, WebExtensions 1.9 | — | — |
| profile | scroll | 6.4 | 10861.2 | **53.8** (DOM Worker 21.7, main 16.1, SamplerThread 10.0, Timer 1.9, TaskCon~ller # 1.7) | WPEWebProcess 19.8, Web Content 10.3, AxioWebKitHost 3.2, WebExtensions 2.5 | — | — |
| profile | key | — | — | **58.3** (DOM Worker 21.3, main 19.1, SamplerThread 10.4, Timer 1.9, Renderer 1.4) | Web Content 10.4, WPEWebProcess 7.2, WebExtensions 2.8, AxioWebKitHost 2.2 | 47.3 | — |
| profile | switch-to-gecko | — | — | **42.9** (main 11.7, Compositor 7.8, DOM Worker 7.8, SamplerThread 7.8, BgIOThr~Pool # 3.9) | Isolated Web Co 7.8 | — | 218.3 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 584.9; first putImageData end 586.3

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 717.4; first putImageData end 718.9

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 81, main 64, Renderer 12, IPC I/O 3, WRSceneBuilder 3, Compositor 2, WRRenderBackend 2, SwComposite 2, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 64 ms (8.4% of span): Idle 22, JavaScript 20, DOM 8, GC / CC 3, Other 3, Profiler 3
  - JS leaf 4 / native under JS 26 / native 34; buckets: poll_wait 24, engine_stream_read 11, bgra_to_rgba 6, subprocess_pipe_io 4, paint_layout 4, gc_cc 3, worker_messaging 2, array_buffer_copy 1
  - top self: `[libxul.so]` 26; `[libc.so.6]` 25; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 4; `[unknown]` 3; `[axiosozo-dev]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - top JS (total): `switchToWebKit (chrome://browser/content/axiosozo/WebKitPresenter.sys.` 8; `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 8; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 7; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 7
  - GC/CC markers: GCMinor 1× 4 ms
  - busiest DOM Worker 81 ms: buckets subprocess_pipe_io 81, poll_wait 45, gc_cc 2, worker_messaging 1, memcpy_memset 1; top self: `[libc.so.6]` 54; `[libxul.so]` 19; `[axiosozo-dev]` 2; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 2
- **tab:7792** CPU ms by thread group: main 54, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 53 ms (8.0% of span): Other 43, DOM 5, JavaScript 3, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 47; buckets: memcpy_memset 1, gc_cc 1, poll_wait 0
  - top self: `[libxul.so]` 28; `[libc.so.6]` 7; `[]` 5; `[libexpat.so.1]` 3; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `access@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7797** CPU ms by thread group: main 50, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 50 ms (7.4% of span): Other 40, JavaScript 4, DOM 4, Profiler 1, Idle 1, GC / CC 1
  - JS leaf 0 / native under JS 6 / native 45; buckets: poll_wait 1, gc_cc 1, memcpy_memset 0
  - top self: `[libxul.so]` 18; `[libc.so.6]` 15; `[]` 6; `[libexpat.so.1]` 5; `__read_nocancel@@GLIBC_PRIVATE [libc.so.6]` 2; `[unknown]` 1
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
- **tab:7705** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.2% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `[libc.so.6]` 2; `[libxul.so]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 144, DOM Worker 101, other 23, Compositor 2, Renderer 1, IPC I/O 1, Socket 1, SwComposite 1, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 144 ms (6.9% of span): Idle 117, Other 10, JavaScript 10, Profiler 4, Graphics 2, DOM 2
  - JS leaf 2 / native under JS 8 / native 134; buckets: poll_wait 123, paint_layout 2, engine_stream_read 1, memcpy_memset 1, array_buffer_copy 1, subprocess_pipe_io 0
  - top self: `[libc.so.6]` 122; `[libxul.so]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `[unknown]` 1; `[axiosozo-dev]` 1; `slice (self-hosted:4456:22)[17]` 1
  - top JS (total): `diagnostics (chrome://browser/content/axiosozo/WebKitEngineControls.sy` 5
  - busiest DOM Worker 101 ms: buckets subprocess_pipe_io 101, poll_wait 101; top self: `[libc.so.6]` 101
- **tab:7711** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7366** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[libxul.so]` 0; `[libglib-2.0.so.0]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1907, main 1094, Renderer 113, SwComposite 70, other 34, WRRenderBackend 28, Compositor 23, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1094 ms (34.9% of span): Idle 452, JavaScript 328, Other 150, DOM 70, GC / CC 64, Profiler 20
  - JS leaf 134 / native under JS 307 / native 654; buckets: poll_wait 506, engine_stream_read 200, subprocess_pipe_io 198, bgra_to_rgba 116, gc_cc 64, array_buffer_copy 63, put_image_data 50, canvas_2d 41
  - top self: `[libc.so.6]` 643; `[libxul.so]` 243; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 114; `[unknown]` 27; `[axiosozo-dev]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 183; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 170; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 169; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 168
  - GC/CC markers: GCMajor 2× 252 ms, GCSlice 18× 69 ms, CCSlice 3× 8 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 1907 ms: buckets subprocess_pipe_io 1907, poll_wait 495, gc_cc 36, memcpy_memset 10; top self: `[libc.so.6]` 862; `[libxul.so]` 588; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 113; `[unknown]` 100; `syscall@@GLIBC_2.2.5 [libc.so.6]` 78
- **tab:7705** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): GC / CC 4, Idle 2, Other 1
  - JS leaf 0 / native under JS 0 / native 7; buckets: gc_cc 4, poll_wait 3
  - top self: `[libxul.so]` 3; `[libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 1 ms, CC 1× 0 ms
- **tab:7316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7339** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3167, main 2506, other 176, Renderer 146, SwComposite 90, Compositor 39, WRRenderBackend 37, WRSceneBuilder 8, IPC I/O 6, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2506 ms (14.6% of span): Idle 1315, JavaScript 574, Other 288, GC / CC 166, DOM 89, Profiler 36
  - JS leaf 245 / native under JS 464 / native 1797; buckets: poll_wait 1492, engine_stream_read 362, subprocess_pipe_io 254, bgra_to_rgba 223, gc_cc 166, array_buffer_copy 76, worker_messaging 59, put_image_data 34
  - top self: `[libc.so.6]` 1605; `[libxul.so]` 500; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 220; `[unknown]` 36; `[axiosozo-dev]` 28; `[linux-vdso.so.1]` 16
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 288; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 270; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 264; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 264
  - GC/CC markers: GCMajor 5× 2443 ms, GCSlice 51× 186 ms, CCSlice 10× 23 ms, GCMinor 6× 7 ms, CC 6× 0 ms
  - busiest DOM Worker 3156 ms: buckets subprocess_pipe_io 3156, poll_wait 1345, gc_cc 46, memcpy_memset 23; top self: `[libc.so.6]` 1761; `[libxul.so]` 814; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 155; `[unknown]` 120; `syscall@@GLIBC_2.2.5 [libc.so.6]` 93
- **tab:7366** CPU ms by thread group: main 12, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 12 ms (0.1% of span): GC / CC 8, Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 12; buckets: gc_cc 8, poll_wait 4
  - top self: `[libxul.so]` 8; `[libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 7 ms, GCSlice 3× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7257** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 7, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 7, poll_wait 2
  - top self: `[libxul.so]` 7; `[libc.so.6]` 2; `prctl@@GLIBC_2.2.5 [libc.so.6]` 1; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 40 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7316** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 5, GC / CC 2, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 5, gc_cc 2
  - top self: `[libc.so.6]` 5; `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 657, main 630, Renderer 45, other 39, SwComposite 33, Compositor 16, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 630 ms (17.1% of span): Idle 292, JavaScript 105, Other 76, Layout 38, Graphics 37, GC / CC 34
  - JS leaf 12 / native under JS 190 / native 428; buckets: poll_wait 342, paint_layout 70, subprocess_pipe_io 67, engine_stream_read 60, gc_cc 34, array_buffer_copy 19, worker_messaging 15, put_image_data 6
  - top self: `[libc.so.6]` 366; `[libxul.so]` 201; `[axiosozo-dev]` 14; `[unknown]` 12; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3
  - top JS (total): `fillBuffer/< (resource://gre/modules/subprocess/subprocess_common.sys.` 44; `onInput (resource://gre/modules/subprocess/subprocess_common.sys.mjs:3` 44; `checkPendingReads (resource://gre/modules/subprocess/subprocess_common` 43
  - GC/CC markers: GCMajor 1× 355 ms, GCSlice 10× 35 ms, CCSlice 2× 6 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - busiest DOM Worker 657 ms: buckets subprocess_pipe_io 657, poll_wait 310, gc_cc 10, memcpy_memset 5; top self: `[libc.so.6]` 381; `[libxul.so]` 149; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 31; `[unknown]` 25; `[axiosozo-dev]` 24
- **tab:7257** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, GC / CC 0, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, gc_cc 0
  - top self: `[libc.so.6]` 6; `[libxul.so]` 1; `__tls_get_addr@@GLIBC_2.3 [ld-linux-x86-64.so.2]` 0
- **tab:7316** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[libxul.so]` 0
- **tab:7366** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 72, Renderer 19, DOM Worker 14, Compositor 4, IPC I/O 2, WRSceneBuilder 2, WRRenderBackend 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 72 ms (24.0% of span): JavaScript 32, Layout 14, Other 7, Graphics 6, DOM 6, Idle 6
  - JS leaf 4 / native under JS 42 / native 26; buckets: paint_layout 14, poll_wait 7, engine_stream_read 2
  - top self: `[libxul.so]` 45; `[libc.so.6]` 10; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 4; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 2; `sameFacts (chrome://browser/content/axiosozo/ConsoleErrorsNa` 1
  - top JS (total): `switchToGecko (chrome://browser/content/axiosozo/WebKitPresenter.sys.m` 9; `callListeners (moz-src:///browser/components/tabbrowser/Tabbrowser.sys` 8; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 8; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 8
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, poll_wait 13, worker_messaging 0; top self: `[libc.so.6]` 14; `[libxul.so]` 0
- **tab:7705** CPU ms by thread group: main 27, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 27 ms (8.9% of span): JavaScript 10, Other 5, Idle 5, Layout 4, DOM 1, Network 1
  - JS leaf 0 / native under JS 9 / native 17; buckets: poll_wait 5, paint_layout 1
  - top self: `[libxul.so]` 17; `[libc.so.6]` 6; `[]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 5; `defineLogGetter (resource://autofill/FormAutofill.sys.mjs:189:18)[17]` 2; `ConsoleAPI (resource://gre/modules/Console.sys.mjs:609:27)[7]` 2
- **tab:7257** CPU ms by thread group: main 5, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 5 ms (1.8% of span): Idle 4, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: poll_wait 4
  - top self: `[libc.so.6]` 4; `[libxul.so]` 1; `[]` 0
- **tab:7797** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

