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

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **55.3** (main 23.4, DOM Worker 18.4, Renderer 8.4, WRScene~ilder# 1.7, WRRende~ckend# 1.7) | AxioCEFProbe 46.9, cef:gpu-process 13.4, cef:utility 8.4, cef:renderer 6.7 | — | 545.4 |
| plain | idle | — | — | **3.9** (main 3.4, Timer 0.5) | Web Content 3.4, AxioCEFProbe 1.0 | — | — |
| plain | raf | 42.5 | 37.6 | **131.0** (DOM Worker 72.8, main 38.6, Renderer 5.7, TaskCon~ller # 4.2, SwComposite 4.2) | AxioCEFProbe 11.6, cef:renderer 9.6, cef:gpu-process 6.3, Web Content 1.0 | — | — |
| plain | scroll | 34.5 | 52.9 | **125.2** (DOM Worker 61.1, main 48.6, Renderer 4.3, SwComposite 3.4, TaskCon~ller # 2.9) | cef:gpu-process 22.7, AxioCEFProbe 10.1, cef:renderer 9.7, Privileged Cont 1.0 | — | — |
| plain | key | — | — | **30.3** (main 12.1, DOM Worker 11.2, TaskCon~ller # 1.6, Timer 1.1, Renderer 1.1) | AxioCEFProbe 2.7, cef:renderer 2.5, cef:gpu-process 0.8, WebExtensions 0.3 | 29.4 | — |
| plain | switch-to-gecko | — | — | **15.8** (DOM Worker 4.4, main 3.8, Indexed~ IO # 3.6, IPDL Background 1.6, TaskCon~ller # 0.9) | Privileged Cont 0.2, RDD Process 0.1, Isolated Web Co 0.1, Web Content 0.1 | — | 15044.4 |
| trace | switch-to-engine | — | — | **62.5** (main 25.0, Renderer 22.9, DOM Worker 12.5, WRRende~ckend# 2.1) | AxioCEFProbe 58.5, cef:gpu-process 18.8, cef:utility 10.4, cef:renderer 8.3 | — | 434.4 |
| trace | idle | — | — | **10.1** (main 5.3, DOM Worker 1.9, TaskCon~ller # 1.4, Timer 1.0, Indexed~ IO # 0.5) | Web Content 2.9, AxioCEFProbe 1.0, cef:renderer 0.5 | — | — |
| trace | raf | 42.5 | 38.2 | **130.0** (DOM Worker 71.7, main 39.4, Renderer 5.1, TaskCon~ller # 4.5, SwComposite 3.8) | AxioCEFProbe 10.6, cef:renderer 10.2, cef:gpu-process 7.0, cef:zygote 0.3 | — | — |
| trace | scroll | 4.8 | 11770.8 | **19.4** (main 8.6, DOM Worker 7.4, Timer 0.9, TaskCon~ller # 0.8, Renderer 0.5) | cef:gpu-process 2.8, AxioCEFProbe 1.7, cef:renderer 1.4, Web Content 0.1 | — | — |
| trace | key | — | — | **26.4** (DOM Worker 11.0, main 10.4, Timer 1.1, Renderer 1.1, SwComposite 0.8) | AxioCEFProbe 3.3, cef:renderer 2.8, cef:gpu-process 0.5, Privileged Cont 0.3 | 28.8 | — |
| trace | switch-to-gecko | — | — | **1.8** (main 0.7, TaskCon~ller # 0.5, Renderer 0.1, glean.dispatche 0.1, IPC I/O Parent 0.1) | WebExtensions 0.1, Privileged Cont 0.1 | — | 15019.9 |
| profile | switch-to-engine | — | — | **52.5** (DOM Worker 19.9, main 16.3, SamplerThread 7.3, Renderer 5.4, IPDL Background 1.8) | AxioCEFProbe 47.1, Web Content 20.0, cef:gpu-process 14.5, cef:utility 12.7 | — | 498.1 |
| profile | idle | — | — | **21.8** (DOM Worker 7.6, SamplerThread 7.6, main 5.2, Timer 1.4) | Web Content 8.6, Privileged Cont 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 30.6 | 61.1 | **143.9** (DOM Worker 74.3, main 38.9, SamplerThread 13.7, Renderer 4.8, TaskCon~ller # 3.5) | cef:renderer 11.4, Web Content 10.8, AxioCEFProbe 10.6, cef:gpu-process 7.3 | — | — |
| profile | scroll | 3.4 | 11808.5 | **39.4** (DOM Worker 15.0, main 9.9, SamplerThread 9.0, BgIOThr~Pool # 2.0, Timer 1.6) | Web Content 10.2, cef:gpu-process 3.2, Privileged Cont 2.1, WebExtensions 2.0 | — | — |
| profile | key | — | — | **57.0** (DOM Worker 21.8, main 17.2, SamplerThread 10.4, Timer 1.9, Renderer 1.4) | Web Content 9.3, AxioCEFProbe 2.7, WebExtensions 2.4, Isolated Web Co 2.2 | 40.8 | — |
| profile | switch-to-gecko | — | — | **5.6** (SamplerThread 3.3, main 0.9, TaskCon~ller # 0.5, DOM Worker 0.2, Renderer 0.1) | Web Content 8.6, Privileged Cont 1.7, Isolated Web Co 1.6, WebExtensions 1.5 | — | 15028.5 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 452.6; first putImageData end 453.4

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 513.8; first putImageData end 514.5

Switch timeline (profile, switch-to-gecko, ms after the window start): first ImageData 13.8; first putImageData end 14.0

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 99, main 98, Renderer 32, WRRenderBackend 5, Compositor 4, WRSceneBuilder 4, IPC I/O 2, SwComposite 2, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 98 ms (17.0% of span): Idle 28, JavaScript 25, Layout 20, Other 11, DOM 7, Graphics 4
  - JS leaf 10 / native under JS 29 / native 59; buckets: poll_wait 31, engine_stream_read 13, paint_layout 10, bgra_to_rgba 9, subprocess_pipe_io 5, array_buffer_copy 4, ipc 2, put_image_data 2
  - top self: `[libxul.so]` 41; `poll@@GLIBC_2.2.5 [libc.so.6]` 30; `[libc.so.6]` 6; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 5; `[axiosozo-dev]` 3; `bgraToRGBA (chrome://browser/content/axiosozo/CEFPresenter.s` 3
  - busiest DOM Worker 99 ms: buckets subprocess_pipe_io 99, poll_wait 37, worker_messaging 3, gc_cc 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 35; `[libxul.so]` 20; `[libc.so.6]` 8; `read@@GLIBC_2.2.5 [libc.so.6]` 7; `[unknown]` 6
- **tab:4105** CPU ms by thread group: main 49, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 49 ms (9.0% of span): Other 34, JavaScript 7, Profiler 3, Idle 3, DOM 2, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: poll_wait 4, memcpy_memset 1, gc_cc 0
  - top self: `[libxul.so]` 21; `[libc.so.6]` 7; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 5; `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libexpat.so.1]` 3; `[]` 3
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:3988** CPU ms by thread group: main 3, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (0.5% of span): Idle 2, Other 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `[]` 0; `[linux-vdso.so.1]` 0
- **tab:3443** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 100, main 83, other 21, IPC I/O 1, Socket 0, Compositor 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, ImageIO 0, SwComposite 0
  - main thread 83 ms (3.9% of span): Idle 69, Other 7, JavaScript 6, DOM 1, Profiler 1
  - JS leaf 1 / native under JS 5 / native 77; buckets: poll_wait 72, engine_stream_read 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 69; `[libxul.so]` 7; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 2; `[libc.so.6]` 1; `write@@GLIBC_2.2.5 [libc.so.6]` 1; `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sy` 1
  - busiest DOM Worker 100 ms: buckets subprocess_pipe_io 100, poll_wait 99; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 99; `[libxul.so]` 0
- **tab:4105** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
- **tab:3988** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:3443** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0

### Profile: chromium / raf

- **parent** CPU ms by thread group: DOM Worker 2222, main 1128, Renderer 135, SwComposite 90, WRRenderBackend 35, other 35, Compositor 26, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1129 ms (35.5% of span): Idle 515, JavaScript 310, Other 143, GC / CC 69, DOM 55, Profiler 28
  - JS leaf 133 / native under JS 285 / native 711; buckets: poll_wait 573, subprocess_pipe_io 206, engine_stream_read 190, bgra_to_rgba 117, gc_cc 69, array_buffer_copy 56, put_image_data 51, canvas_2d 43
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 521; `[libxul.so]` 198; `[libc.so.6]` 135; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 113; `write@@GLIBC_2.2.5 [libc.so.6]` 36; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 26
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 190; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 177; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[5` 173; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 173
  - GC/CC markers: GCMajor 2× 225 ms, GCSlice 18× 59 ms, CCSlice 4× 12 ms, GCMinor 2× 4 ms, CC 3× 0 ms
  - busiest DOM Worker 2222 ms: buckets subprocess_pipe_io 2222, poll_wait 504, memcpy_memset 26, gc_cc 26; top self: `[libxul.so]` 754; `poll@@GLIBC_2.2.5 [libc.so.6]` 494; `[libc.so.6]` 187; `read@@GLIBC_2.2.5 [libc.so.6]` 172; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 164
- **tab:3988** CPU ms by thread group: main 7, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): GC / CC 5, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: gc_cc 5, poll_wait 3
  - top self: `[libxul.so]` 3; `poll@@GLIBC_2.2.5 [libc.so.6]` 2; `[]` 1; `[libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 38 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:4105** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4100** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMinor 1× 0 ms

### Profile: chromium / scroll

- **parent** CPU ms by thread group: DOM Worker 2029, main 1509, other 169, Renderer 76, SwComposite 44, WRRenderBackend 19, Compositor 17, IPC I/O 7, WRSceneBuilder 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1509 ms (8.8% of span): Idle 784, JavaScript 422, Other 158, DOM 42, GC / CC 38, Profiler 27
  - JS leaf 245 / native under JS 236 / native 1027; buckets: poll_wait 905, engine_stream_read 276, bgra_to_rgba 230, subprocess_pipe_io 133, array_buffer_copy 45, gc_cc 41, paint_layout 24, worker_messaging 20
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 795; `[libxul.so]` 270; `bgraRegionToRGBA (chrome://browser/content/axiosozo/CEFPrese` 229; `[libc.so.6]` 70; `write@@GLIBC_2.2.5 [libc.so.6]` 30; `recvmsg@@GLIBC_2.2.5 [libc.so.6]` 24
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 276; `acceptFrame (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mj` 254; `onFrame (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:690:17` 251; `#draw (chrome://browser/content/axiosozo/CEFPresenter.sys.mjs:791:8)[6` 250
  - GC/CC markers: GCMajor 1× 167 ms, GCSlice 10× 33 ms, CCSlice 2× 6 ms, GCMinor 3× 4 ms, CC 1× 0 ms
  - busiest DOM Worker 2029 ms: buckets subprocess_pipe_io 2029, poll_wait 1085, gc_cc 41, memcpy_memset 18; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1072; `[libxul.so]` 403; `[libc.so.6]` 106; `read@@GLIBC_2.2.5 [libc.so.6]` 96; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 86
- **tab:3482** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 4, DOM 2, JavaScript 1, Profiler 0, Other 0
  - JS leaf 0 / native under JS 3 / native 4; buckets: poll_wait 4
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 4; `[libxul.so]` 3; `[libc.so.6]` 0; `[linux-vdso.so.1]` 0
  - top JS (total): `loadLedger (chrome://browser/content/axiosozo/overview/about-axiosozo.` 2; `renderUsage (chrome://browser/content/axiosozo/overview/about-axiosozo` 2; `renderUsage/< (chrome://browser/content/axiosozo/overview/about-axioso` 2; `h (chrome://browser/content/axiosozo/overview/about-axiosozo.mjs:94:11` 1
- **tab:3464** CPU ms by thread group: main 4, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `[]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0
- **tab:4105** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[libxul.so]` 0; `[]` 0

### Profile: chromium / key

- **parent** CPU ms by thread group: DOM Worker 676, main 582, Renderer 45, other 37, SwComposite 35, Compositor 17, WRRenderBackend 15, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 582 ms (15.8% of span): Idle 233, JavaScript 139, Other 67, Layout 38, Graphics 33, GC / CC 32
  - JS leaf 11 / native under JS 202 / native 368; buckets: poll_wait 286, subprocess_pipe_io 70, paint_layout 64, engine_stream_read 59, gc_cc 32, array_buffer_copy 24, worker_messaging 15, bgra_to_rgba 8
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 238; `[libxul.so]` 205; `[libc.so.6]` 42; `[axiosozo-dev]` 16; `[unknown]` 15; `write@@GLIBC_2.2.5 [libc.so.6]` 11
  - top JS (total): `#read (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:620:` 59; `fillBuffer/< (resource://gre/modules/subprocess/subprocess_common.sys.` 47; `checkPendingReads (resource://gre/modules/subprocess/subprocess_common` 46
  - GC/CC markers: GCMajor 1× 462 ms, GCSlice 9× 30 ms, CCSlice 2× 5 ms, GCMinor 1× 3 ms, CC 1× 0 ms
  - busiest DOM Worker 676 ms: buckets subprocess_pipe_io 676, poll_wait 296, gc_cc 12; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 294; `[libxul.so]` 182; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 39; `[libc.so.6]` 35; `read@@GLIBC_2.2.5 [libc.so.6]` 30
- **tab:3389** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 7 ms (0.2% of span): Idle 6, Other 1, JavaScript 0, DOM 0, GC / CC 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 6, array_buffer_copy 0, gc_cc 0
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 6; `[libxul.so]` 1; `g_mutex_unlock [libglib-2.0.so.0]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0
  - top JS (total): `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[7]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[7` 0; `get cloneScope (resource://gre/modules/ExtensionPageChild.sys.mjs:173:` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:4105** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1; `[libxul.so]` 0
- **tab:3443** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 1

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 136, DOM Worker 25, Renderer 22, IPC I/O 6, Compositor 4, WRRenderBackend 3, SwComposite 3, other 2, WRSceneBuilder 2, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 136 ms (0.9% of span): GC / CC 55, Idle 26, JavaScript 23, Layout 16, Other 10, Graphics 3
  - JS leaf 4 / native under JS 30 / native 102; buckets: gc_cc 56, poll_wait 30, paint_layout 7, memcpy_memset 3, subprocess_pipe_io 2, array_buffer_copy 1, worker_messaging 0, webrender_render 0
  - top self: `[libxul.so]` 84; `poll@@GLIBC_2.2.5 [libc.so.6]` 26; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 6; `[libc.so.6]` 4; `getTabToAdopt (chrome://browser/content/browser-init.js:83:1` 4; `madvise@@GLIBC_2.2.5 [libc.so.6]` 3
  - GC/CC markers: GCMajor 2× 131 ms, GCSlice 9× 50 ms, CCSlice 2× 6 ms, GCMinor 3× 2 ms, CC 2× 0 ms
  - busiest DOM Worker 25 ms: buckets subprocess_pipe_io 25, poll_wait 14, worker_messaging 1, gc_cc 1; top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 13; `[libc.so.6]` 6; `[libxul.so]` 3; `syscall@@GLIBC_2.2.5 [libc.so.6]` 2; `[unknown]` 1
- **tab:3988** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.0% of span): Idle 3, Other 1, Layout 1
  - JS leaf 0 / native under JS 0 / native 4; buckets: poll_wait 3, paint_layout 1
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `[libxul.so]` 1; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 0
- **tab:3482** CPU ms by thread group: main 3, other 1, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `PR_IntervalNow [libnspr4.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[libxul.so]` 0
- **tab:3464** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: poll_wait 3
  - top self: `poll@@GLIBC_2.2.5 [libc.so.6]` 3; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0; `[]` 0

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

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **47.6** (main 17.0, DOM Worker 11.9, Renderer 10.2, TaskCon~ller # 1.7, Softwar~cThread 1.7) | WPEWebProcess 68.0, AxioWebKitHost 15.3, WPENetworkProce 11.9 | — | 562.4 |
| plain | idle | — | — | **6.8** (main 5.8, Timer 0.5, TaskCon~ller # 0.5) | Web Content 3.4, forkserver 0.5, AxioWebKitHost 0.5, RDD Process 0.5 | — | — |
| plain | raf | 36.2 | 44.8 | **118.8** (DOM Worker 64.7, main 37.5, Renderer 5.2, TaskCon~ller # 3.9, SwComposite 3.2) | WPEWebProcess 66.5, AxioWebKitHost 12.9, WebExtensions 1.0, Web Content 0.6 | — | — |
| plain | scroll | 30.8 | 53.4 | **121.1** (DOM Worker 57.1, main 48.8, Renderer 3.9, TaskCon~ller # 2.9, SwComposite 2.9) | WPEWebProcess 65.4, AxioWebKitHost 11.7, Privileged Cont 0.5, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **28.6** (main 13.2, DOM Worker 9.9, TaskCon~ller # 1.4, Renderer 1.1, Timer 0.8) | WPEWebProcess 6.2, AxioWebKitHost 2.1 | 33.3 | — |
| plain | switch-to-gecko | — | — | **29.2** (main 8.3, BgIOThr~Pool # 8.3, Renderer 4.2, SwComposite 4.2, DOM Worker 4.2) | Isolated Web Co 4.2 | — | 211.5 |
| trace | switch-to-engine | — | — | **43.2** (Renderer 15.6, main 12.1, DOM Worker 6.9, Compositor 3.5, IPC I/O Parent 1.7) | WPEWebProcess 64.2, AxioWebKitHost 17.3, WPENetworkProce 10.4, bwrap 1.7 | — | 551.4 |
| trace | idle | — | — | **7.8** (main 6.3, Timer 1.0, TaskCon~ller # 0.5) | Web Content 3.9, AxioWebKitHost 0.5 | — | — |
| trace | raf | 36.0 | 42.6 | **119.9** (DOM Worker 66.2, main 37.1, Renderer 4.8, TaskCon~ller # 3.6, SwComposite 3.6) | WPEWebProcess 67.8, AxioWebKitHost 14.5 | — | — |
| trace | scroll | 8.1 | 163.7 | **43.4** (DOM Worker 18.5, main 16.7, TaskCon~ller # 2.1, IPDL Background 1.6, Timer 0.9) | WPEWebProcess 19.4, AxioWebKitHost 3.7, WebExtensions 0.2, Web Content 0.1 | — | — |
| trace | key | — | — | **28.1** (main 12.4, DOM Worker 10.2, Timer 1.1, TaskCon~ller # 1.1, Renderer 1.1) | WPEWebProcess 6.6, AxioWebKitHost 1.9 | 35.6 | — |
| trace | switch-to-gecko | — | — | **24.6** (main 8.2, Renderer 8.2, BgIOThr~Pool # 4.1, sqldb:p~lite # 4.1) | Isolated Web Co 12.3 | — | 211.5 |
| profile | switch-to-engine | — | — | **39.0** (DOM Worker 17.3, SamplerThread 10.1, main 8.7, Renderer 2.9) | WPEWebProcess 63.5, AxioWebKitHost 15.9, Web Content 13.0, WPENetworkProce 10.1 | — | 660.6 |
| profile | idle | — | — | **27.5** (SamplerThread 8.7, DOM Worker 8.2, main 7.7, Timer 1.9, IPC I/O Parent 0.5) | Web Content 7.7, WebExtensions 2.4, Isolated Web Co 2.4, Privileged Cont 1.9 | — | — |
| profile | raf | 25.8 | 60.1 | **129.6** (DOM Worker 65.5, main 36.1, SamplerThread 11.3, Renderer 4.5, TaskCon~ller # 3.5) | WPEWebProcess 67.2, AxioWebKitHost 12.6, Web Content 9.0, Isolated Web Co 2.2 | — | — |
| profile | scroll | 6.4 | 10864.8 | **52.2** (DOM Worker 21.3, main 15.7, SamplerThread 9.5, Timer 1.8, TaskCon~ller # 1.5) | WPEWebProcess 19.7, Web Content 10.3, AxioWebKitHost 3.4, Privileged Cont 2.3 | — | — |
| profile | key | — | — | **54.3** (DOM Worker 20.6, main 16.7, SamplerThread 10.1, Timer 1.6, Renderer 1.4) | Web Content 9.3, WPEWebProcess 7.8, WebExtensions 2.2, AxioWebKitHost 2.2 | 44.9 | — |
| profile | switch-to-gecko | — | — | **59.0** (main 23.6, DOM Worker 11.8, TaskCon~ller # 7.9, SamplerThread 7.9, BgIOThr~Pool # 3.9) | Isolated Web Co 3.9 | — | 219.5 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 557.5; first putImageData end 558.9

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 665.2; first putImageData end 667.0

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 86, main 65, Renderer 13, WRRenderBackend 3, Compositor 2, SwComposite 2, WRSceneBuilder 2, Socket 1, IPC I/O 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 65 ms (9.1% of span): JavaScript 31, Idle 14, Layout 6, Other 6, DOM 4, Graphics 2
  - JS leaf 9 / native under JS 29 / native 27; buckets: poll_wait 17, engine_stream_read 15, bgra_to_rgba 6, subprocess_pipe_io 4, paint_layout 4, worker_messaging 2, put_image_data 2, canvas_2d 2
  - top self: `[libxul.so]` 27; `[libc.so.6]` 20; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 6; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3; `[libX11.so.6]` 1
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 11; `switchToWebKit (chrome://browser/content/axiosozo/WebKitPresenter.sys.` 10; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 8; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 8
  - busiest DOM Worker 86 ms: buckets subprocess_pipe_io 86, poll_wait 46, gc_cc 2, memcpy_memset 1, worker_messaging 0; top self: `[libc.so.6]` 57; `[libxul.so]` 18; `syscall@@GLIBC_2.2.5 [libc.so.6]` 4; `[unknown]` 3; `[axiosozo-dev]` 2
- **tab:7700** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.3% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 2
  - top self: `[libc.so.6]` 2; `[libxul.so]` 0
- **tab:7251** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0
- **tab:7706** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 155, DOM Worker 97, other 21, Compositor 2, Renderer 1, IPC I/O 1, Socket 1, SwComposite 0, WRSceneBuilder 0, WRRenderBackend 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 155 ms (7.4% of span): Idle 109, GC / CC 17, JavaScript 11, Other 9, DOM 4, Graphics 2
  - JS leaf 1 / native under JS 13 / native 141; buckets: poll_wait 115, gc_cc 17, engine_stream_read 2, paint_layout 2, memcpy_memset 1, subprocess_pipe_io 0, mozafterpaint_events 0, array_buffer_copy 0
  - top self: `[libc.so.6]` 114; `[libxul.so]` 32; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 2; `[unknown]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1
  - top JS (total): `diagnostics (chrome://browser/content/axiosozo/WebKitEngineControls.sy` 8
  - GC/CC markers: GCSlice 3× 19 ms, GCMinor 1× 1 ms
  - busiest DOM Worker 97 ms: buckets subprocess_pipe_io 97, poll_wait 97; top self: `[libc.so.6]` 97
- **tab:7706** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0
- **tab:7332** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:7351** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0; `[]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1931, main 1038, Renderer 122, SwComposite 73, other 31, WRRenderBackend 29, Compositor 22, WRSceneBuilder 6, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1038 ms (33.2% of span): Idle 468, JavaScript 281, Other 136, DOM 63, GC / CC 62, Profiler 25
  - JS leaf 111 / native under JS 274 / native 653; buckets: poll_wait 524, engine_stream_read 180, subprocess_pipe_io 167, bgra_to_rgba 103, gc_cc 62, array_buffer_copy 57, put_image_data 43, canvas_2d 39
  - top self: `[libc.so.6]` 662; `[libxul.so]` 203; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 99; `[unknown]` 21; `[axiosozo-dev]` 12; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 5
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 163; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 159; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 156; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 156
  - GC/CC markers: GCMajor 2× 251 ms, GCSlice 19× 60 ms, CCSlice 4× 9 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 1931 ms: buckets subprocess_pipe_io 1931, poll_wait 501, gc_cc 26, memcpy_memset 24; top self: `[libc.so.6]` 867; `[libxul.so]` 578; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 129; `[unknown]` 99; `syscall@@GLIBC_2.2.5 [libc.so.6]` 81
- **tab:7700** CPU ms by thread group: main 6, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): GC / CC 4, Idle 2, Profiler 1
  - JS leaf 0 / native under JS 0 / native 6; buckets: gc_cc 4, poll_wait 2
  - top self: `[libxul.so]` 4; `[libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 36 ms, GCSlice 4× 3 ms, CCSlice 1× 2 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1
- **tab:7706** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3091, main 2446, other 175, Renderer 150, SwComposite 96, WRRenderBackend 37, Compositor 32, WRSceneBuilder 8, IPC I/O 6, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2446 ms (14.2% of span): Idle 1273, JavaScript 529, Other 275, GC / CC 164, DOM 113, Profiler 43
  - JS leaf 255 / native under JS 448 / native 1743; buckets: poll_wait 1437, engine_stream_read 382, subprocess_pipe_io 249, bgra_to_rgba 226, gc_cc 164, array_buffer_copy 91, worker_messaging 49, put_image_data 48
  - top self: `[libc.so.6]` 1538; `[libxul.so]` 515; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 222; `[unknown]` 32; `[axiosozo-dev]` 23; `[linux-vdso.so.1]` 9
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 309; `acceptFrame (chrome://browser/content/axiosozo/EngineStreamClient.sys.` 286; `onFrame (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:187` 285; `#draw (chrome://browser/content/axiosozo/WebKitPresenter.sys.mjs:287:8` 284
  - GC/CC markers: GCMajor 5× 2321 ms, GCSlice 49× 181 ms, CCSlice 9× 20 ms, GCMinor 7× 10 ms, CC 5× 0 ms
  - busiest DOM Worker 3081 ms: buckets subprocess_pipe_io 3081, poll_wait 1260, gc_cc 50, memcpy_memset 32; top self: `[libc.so.6]` 1708; `[libxul.so]` 796; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 152; `[unknown]` 122; `syscall@@GLIBC_2.2.5 [libc.so.6]` 88
- **tab:7351** CPU ms by thread group: main 13, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 13 ms (0.1% of span): GC / CC 8, Idle 5, Other 0
  - JS leaf 0 / native under JS 0 / native 13; buckets: gc_cc 8, poll_wait 6
  - top self: `[libxul.so]` 7; `[libc.so.6]` 6; `[linux-vdso.so.1]` 0
  - GC/CC markers: GCMajor 1× 8 ms, GCSlice 3× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7251** CPU ms by thread group: main 10, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 10 ms (0.1% of span): GC / CC 8, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 10; buckets: gc_cc 8, poll_wait 3
  - top self: `[libxul.so]` 6; `[libc.so.6]` 3; `[]` 1
  - GC/CC markers: GCMajor 1× 25 ms, GCSlice 4× 9 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7310** CPU ms by thread group: main 7, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 7 ms (0.0% of span): Idle 5, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: poll_wait 5, gc_cc 2
  - top self: `[libc.so.6]` 5; `[libxul.so]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 636, main 574, Renderer 45, other 36, SwComposite 32, Compositor 14, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 574 ms (15.7% of span): Idle 286, JavaScript 106, Other 64, Graphics 37, Layout 32, DOM 25
  - JS leaf 14 / native under JS 154 / native 406; buckets: poll_wait 338, paint_layout 65, engine_stream_read 58, subprocess_pipe_io 44, array_buffer_copy 17, gc_cc 8, worker_messaging 4, memcpy_memset 3
  - top self: `[libc.so.6]` 359; `[libxul.so]` 149; `[unknown]` 18; `[axiosozo-dev]` 10; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[linux-vdso.so.1]` 3
  - top JS (total): `update/< (moz-src:///browser/components/urlbar/UrlbarValueFormatter.sy` 39
  - GC/CC markers: GCSlice 2× 6 ms, GCMinor 2× 3 ms
  - busiest DOM Worker 636 ms: buckets subprocess_pipe_io 636, poll_wait 272, gc_cc 6, memcpy_memset 2; top self: `[libc.so.6]` 359; `[libxul.so]` 165; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 23; `[unknown]` 23; `syscall@@GLIBC_2.2.5 [libc.so.6]` 20
- **tab:7251** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, array_buffer_copy 0
  - top self: `[libc.so.6]` 5; `[libxul.so]` 0; `write@@GLIBC_2.2.5 [libc.so.6]` 0; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[5` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[5]` 0
- **tab:7789** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1; `[linux-vdso.so.1]` 0
- **tab:7351** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `[libc.so.6]` 1

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 99, Renderer 23, DOM Worker 16, Compositor 4, WRRenderBackend 3, WRSceneBuilder 2, IPC I/O 2, SwComposite 2, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 99 ms (32.1% of span): JavaScript 43, GC / CC 16, Layout 12, Other 8, Graphics 8, Idle 6
  - JS leaf 9 / native under JS 42 / native 48; buckets: paint_layout 18, gc_cc 16, poll_wait 10, engine_stream_read 4, subprocess_pipe_io 2, memcpy_memset 2, mozafterpaint_events 1, worker_messaging 0
  - top self: `[libxul.so]` 57; `[libc.so.6]` 14; `[axiosozo-dev]` 8; `[unknown]` 4; `trackRunListenerPromise (resource://gre/modules/ExtensionPar` 3; `mprotect@@GLIBC_2.2.5 [libc.so.6]` 3
  - top JS (total): `switchToGecko (chrome://browser/content/axiosozo/WebKitPresenter.sys.m` 9; `receiveMessage (chrome://remote/content/marionette/actors/MarionetteCo` 9
  - GC/CC markers: GCSlice 4× 9 ms, CCSlice 1× 6 ms
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, poll_wait 14; top self: `[libc.so.6]` 14; `[libxul.so]` 2
- **tab:7700** CPU ms by thread group: main 27, IPC I/O 2, Socket 0, other 0, ImageIO 0
  - main thread 27 ms (8.8% of span): JavaScript 10, Other 8, Idle 4, Layout 2, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 11 / native 16; buckets: poll_wait 4, paint_layout 1
  - top self: `[libxul.so]` 20; `[libc.so.6]` 5; `[]` 1; `getcontext@@GLIBC_2.2.5 [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 6
- **tab:7251** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 5 ms (1.7% of span): Idle 3, JavaScript 1, DOM 1, Other 0
  - JS leaf 0 / native under JS 2 / native 3; buckets: poll_wait 3
  - top self: `[libc.so.6]` 3; `[libxul.so]` 2; `sendmsg@@GLIBC_2.2.5 [libc.so.6]` 0
  - top JS (total): `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 2; `fire (resource://gre/modules/ExtensionChild.sys.mjs:873:18)[2]` 2; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[6]` 2; `applySafeWithoutClone/< (resource://gre/modules/ExtensionCommon.sys.mj` 2; `applySafeWithoutClone (resource://gre/modules/ExtensionCommon.sys.mjs:` 2; `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[6` 2
- **tab:7789** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `[libc.so.6]` 0

