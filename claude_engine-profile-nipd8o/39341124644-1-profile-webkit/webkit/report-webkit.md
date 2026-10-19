# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **42.1** (main 17.8, DOM Worker 13.0, Renderer 4.9, glean.dispatche 1.6, TaskCon~ller # 1.6) | WPEWebProcess 66.5, AxioWebKitHost 14.6, WPENetworkProce 9.7, bwrap 1.6 | — | 585.0 |
| plain | idle | — | — | **9.3** (main 6.3, Timer 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 2.9, forkserver 0.5 | — | — |
| plain | raf | 36.5 | 42.0 | **119.1** (DOM Worker 66.0, main 36.6, Renderer 4.9, SwComposite 3.2, TaskCon~ller # 2.9) | WPEWebProcess 67.3, AxioWebKitHost 14.9, WebExtensions 1.0, Web Content 0.3 | — | — |
| plain | scroll | 30.4 | 50.0 | **117.5** (DOM Worker 57.0, main 46.3, Renderer 3.9, TaskCon~ller # 2.9, SwComposite 2.4) | WPEWebProcess 65.3, AxioWebKitHost 12.7, Web Content 1.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **29.6** (main 12.6, DOM Worker 10.2, TaskCon~ller # 1.9, Renderer 1.4, SwComposite 1.1) | WPEWebProcess 6.6, AxioWebKitHost 2.2 | 35.4 | — |
| plain | switch-to-gecko | — | — | **16.8** (main 8.4, BgIOThr~Pool # 4.2, Renderer 4.2) | Isolated Web Co 4.2 | — | 210.8 |
| trace | switch-to-engine | — | — | **41.8** (Renderer 15.7, main 12.2, DOM Worker 7.0, Softwar~cThread 3.5, glean.dispatche 1.7) | WPEWebProcess 67.8, AxioWebKitHost 15.7, WPENetworkProce 10.4 | — | 550.2 |
| trace | idle | — | — | **5.8** (main 5.3, Timer 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| trace | raf | 36.3 | 45.3 | **117.3** (DOM Worker 65.6, main 36.2, Renderer 4.9, TaskCon~ller # 3.2, SwComposite 3.2) | WPEWebProcess 67.2, AxioWebKitHost 15.2 | — | — |
| trace | scroll | 8.0 | 127.8 | **44.9** (DOM Worker 18.9, main 16.8, TaskCon~ller # 2.2, IPDL Background 1.7, Renderer 1.0) | WPEWebProcess 19.6, AxioWebKitHost 3.6, WebExtensions 0.1, Privileged Cont 0.1 | — | — |
| trace | key | — | — | **27.2** (main 12.4, DOM Worker 10.7, Timer 1.1, Renderer 1.1, SwComposite 0.8) | WPEWebProcess 6.5, AxioWebKitHost 1.9, WebExtensions 0.3 | 35.2 | — |
| trace | switch-to-gecko | — | — | **17.2** (main 4.3, BgIOThr~Pool # 4.3, Renderer 4.3, sqldb:p~lite # 4.3) | Isolated Web Co 4.3 | — | 211.4 |
| profile | switch-to-engine | — | — | **34.2** (DOM Worker 15.0, main 8.2, SamplerThread 8.2, TaskCon~ller # 1.4, WRScene~ilder# 1.4) | WPEWebProcess 58.5, Web Content 55.8, AxioWebKitHost 15.0, WPENetworkProce 9.5 | — | 703.2 |
| profile | idle | — | — | **31.7** (main 8.6, SamplerThread 8.6, DOM Worker 8.2, TaskCon~ller # 2.9, Timer 1.9) | Web Content 8.7, Socket Process 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 25.4 | 57.0 | **128.8** (DOM Worker 65.8, main 36.5, SamplerThread 11.6, TaskCon~ller # 3.9, Renderer 3.6) | WPEWebProcess 67.9, AxioWebKitHost 11.6, Web Content 9.7, Isolated Web Co 2.5 | — | — |
| profile | scroll | 6.4 | 10837.0 | **53.0** (DOM Worker 21.5, main 15.5, SamplerThread 9.8, Timer 1.9, TaskCon~ller # 1.6) | WPEWebProcess 19.4, Web Content 9.6, AxioWebKitHost 3.1, Privileged Cont 2.6 | — | — |
| profile | key | — | — | **55.5** (DOM Worker 21.1, main 17.8, SamplerThread 10.4, Timer 1.9, Renderer 1.1) | Web Content 10.5, WPEWebProcess 7.6, AxioWebKitHost 2.4, Privileged Cont 2.2 | 43.9 | — |
| profile | switch-to-gecko | — | — | **39.9** (main 11.9, BgIOThr~Pool # 8.0, DOM Worker 8.0, IPC I/O Parent 4.0, Renderer 4.0) | Isolated Web Co 8.0 | — | 217.6 |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | pixel transport | convert | put | put→chrome paint | keydown→put end | keydown→chrome paint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — |

Switch timeline (trace, switch-to-engine, ms after the window start): first ImageData 556.0; first putImageData end 557.4

Switch timeline (profile, switch-to-engine, ms after the window start): first ImageData 711.2; first putImageData end 711.9

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: DOM Worker 96, main 56, Renderer 12, IPC I/O 3, Compositor 2, SwComposite 1, WRSceneBuilder 1, WRRenderBackend 1, Socket 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 56 ms (7.5% of span): JavaScript 25, Idle 13, Layout 7, Other 4, Profiler 3, Graphics 3
  - JS leaf 8 / native under JS 21 / native 27; buckets: poll_wait 15, engine_stream_read 12, bgra_to_rgba 7, subprocess_pipe_io 4, memcpy_memset 3, paint_layout 3, array_buffer_copy 3
  - top self: `[libxul.so]` 24; `__syscall_cancel_arch [libc.so.6]` 16; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 6; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `mprotect [libc.so.6]` 1; `setSearchMode (chrome://browser/content/urlbar/UrlbarInputBa` 1
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 10
  - busiest DOM Worker 97 ms: buckets subprocess_pipe_io 97, poll_wait 58, worker_messaging 14, memcpy_memset 4, gc_cc 2; top self: `__syscall_cancel_arch [libc.so.6]` 64; `[libxul.so]` 15; `mprotect [libc.so.6]` 4; `syscall [libc.so.6]` 3; `[unknown]` 2
- **tab:7801** CPU ms by thread group: main 52, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 52 ms (8.6% of span): Other 37, JavaScript 6, DOM 5, Profiler 2, Idle 2
  - JS leaf 0 / native under JS 5 / native 46; buckets: memcpy_memset 2, poll_wait 2
  - top self: `[libxul.so]` 27; `[libexpat.so.1]` 4; `__syscall_cancel_arch [libc.so.6]` 3; `[]` 3; `__strcmp_avx2 [libc.so.6]` 2; `__read_nocancel [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
- **tab:7795** CPU ms by thread group: main 44, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 44 ms (7.1% of span): Other 34, JavaScript 5, Profiler 4, DOM 1, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 2 / native 42; buckets: poll_wait 0, gc_cc 0
  - top self: `[libxul.so]` 19; `[]` 6; `__syscall_cancel_arch [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `[libexpat.so.1]` 3
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
- **tab:7706** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, other 0, ImageIO 0
  - main thread 2 ms (0.2% of span): Idle 1, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 161, DOM Worker 103, other 22, Compositor 4, IPC I/O 1, Renderer 1, Socket 1, SwComposite 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 161 ms (7.7% of span): Idle 112, GC / CC 24, JavaScript 13, Other 7, DOM 4, Graphics 2
  - JS leaf 1 / native under JS 16 / native 145; buckets: poll_wait 119, gc_cc 24, engine_stream_read 3, memcpy_memset 2, paint_layout 2, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[libxul.so]` 27; `mprotect [libc.so.6]` 5; `[axiosozo-dev]` 2; `__lll_lock_wake [libc.so.6]` 2; `[unknown]` 2
  - GC/CC markers: GCSlice 3× 18 ms, CCSlice 4× 8 ms, CC 1× 0 ms
  - busiest DOM Worker 103 ms: buckets subprocess_pipe_io 103, poll_wait 103; top self: `__syscall_cancel_arch [libc.so.6]` 103; `[axiosozo-dev]` 0
- **tab:7325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
- **tab:7712** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0
- **tab:7366** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0

### Profile: webkit / raf

- **parent** CPU ms by thread group: DOM Worker 1959, main 1039, Renderer 107, SwComposite 67, other 32, WRRenderBackend 29, Compositor 22, WRSceneBuilder 6, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 1039 ms (33.2% of span): Idle 453, JavaScript 319, Other 127, DOM 60, GC / CC 56, Profiler 21
  - JS leaf 120 / native under JS 300 / native 619; buckets: poll_wait 497, subprocess_pipe_io 189, engine_stream_read 187, bgra_to_rgba 112, memcpy_memset 101, array_buffer_copy 62, gc_cc 56, put_image_data 36
  - top self: `__syscall_cancel_arch [libc.so.6]` 527; `[libxul.so]` 203; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 108; `__memmove_avx_unaligned_erms [libc.so.6]` 87; `[unknown]` 16; `[axiosozo-dev]` 15
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 170
  - GC/CC markers: GCMajor 2× 261 ms, GCSlice 19× 61 ms, CCSlice 3× 9 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - busiest DOM Worker 1959 ms: buckets subprocess_pipe_io 1959, poll_wait 481, memcpy_memset 118, gc_cc 30; top self: `__syscall_cancel_arch [libc.so.6]` 683; `[libxul.so]` 636; `[unknown]` 121; `mprotect [libc.so.6]` 120; `[axiosozo-dev]` 72
- **tab:7706** CPU ms by thread group: main 5, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 5 ms (0.2% of span): GC / CC 3, Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: gc_cc 3, poll_wait 3, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7712** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
- **tab:7347** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `read [libc.so.6]` 0; `PR_IntervalNow [libnspr4.so]` 0

### Profile: webkit / scroll

- **parent** CPU ms by thread group: DOM Worker 3083, main 2390, other 178, Renderer 135, SwComposite 87, WRRenderBackend 38, Compositor 32, WRSceneBuilder 8, IPC I/O 5, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 2390 ms (13.9% of span): Idle 1242, JavaScript 542, Other 270, GC / CC 162, DOM 92, Profiler 42
  - JS leaf 262 / native under JS 437 / native 1690; buckets: poll_wait 1420, engine_stream_read 368, subprocess_pipe_io 260, bgra_to_rgba 235, gc_cc 164, memcpy_memset 125, array_buffer_copy 83, worker_messaging 60
  - top self: `__syscall_cancel_arch [libc.so.6]` 1374; `[libxul.so]` 449; `bgraToRGBA (chrome://browser/content/axiosozo/WebKitPresente` 233; `__memmove_avx_unaligned_erms [libc.so.6]` 103; `[unknown]` 34; `[axiosozo-dev]` 27
  - top JS (total): `#read (chrome://browser/content/axiosozo/EngineStreamClient.sys.mjs:30` 305
  - GC/CC markers: GCMajor 6× 2386 ms, GCSlice 53× 182 ms, CCSlice 7× 19 ms, GCMinor 7× 8 ms, CC 5× 0 ms
  - busiest DOM Worker 3071 ms: buckets subprocess_pipe_io 3071, poll_wait 1242, memcpy_memset 199, gc_cc 47; top self: `__syscall_cancel_arch [libc.so.6]` 1440; `[libxul.so]` 789; `mprotect [libc.so.6]` 144; `[unknown]` 137; `__memset_avx2_unaligned_erms [libc.so.6]` 98
- **tab:7366** CPU ms by thread group: main 11, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 11 ms (0.1% of span): GC / CC 7, Idle 4
  - JS leaf 0 / native under JS 0 / native 11; buckets: gc_cc 7, poll_wait 4
  - top self: `[libxul.so]` 7; `__syscall_cancel_arch [libc.so.6]` 4
  - GC/CC markers: GCMajor 1× 24 ms, GCSlice 4× 7 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7275** CPU ms by thread group: main 9, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 9 ms (0.1% of span): GC / CC 7, Idle 2
  - JS leaf 0 / native under JS 0 / native 9; buckets: gc_cc 7, poll_wait 3
  - top self: `[libxul.so]` 6; `__syscall_cancel_arch [libc.so.6]` 3
  - GC/CC markers: GCMajor 1× 41 ms, GCSlice 4× 8 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:7325** CPU ms by thread group: main 6, other 2, IPC I/O 1, Socket 0, ImageIO 0
  - main thread 6 ms (0.0% of span): Idle 4, GC / CC 2, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 5, gc_cc 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 2 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms

### Profile: webkit / key

- **parent** CPU ms by thread group: DOM Worker 641, main 590, Renderer 41, other 39, SwComposite 30, Compositor 15, WRRenderBackend 14, WRSceneBuilder 8, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 590 ms (16.1% of span): Idle 285, JavaScript 100, Other 70, Layout 48, Graphics 38, DOM 26
  - JS leaf 6 / native under JS 167 / native 417; buckets: poll_wait 321, paint_layout 74, engine_stream_read 53, subprocess_pipe_io 44, memcpy_memset 42, array_buffer_copy 17, worker_messaging 6, put_image_data 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 310; `[libxul.so]` 168; `__memmove_avx_unaligned_erms [libc.so.6]` 29; `[unknown]` 18; `[axiosozo-dev]` 9; `__memset_avx2_unaligned_erms [libc.so.6]` 7
  - GC/CC markers: GCMinor 1× 2 ms
  - busiest DOM Worker 641 ms: buckets subprocess_pipe_io 641, poll_wait 305, memcpy_memset 26, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 338; `[libxul.so]` 156; `mprotect [libc.so.6]` 33; `[unknown]` 30; `[axiosozo-dev]` 18
- **tab:7275** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 5, Other 1, JavaScript 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `[libxul.so]` 0; `__memcmp_avx2_movbe [libc.so.6]` 0
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[2` 0
- **tab:7325** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libxul.so]` 0
- **tab:7801** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 71, Renderer 18, DOM Worker 14, Compositor 3, IPC I/O 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 1, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 71 ms (24.0% of span): JavaScript 29, Other 11, Layout 10, Graphics 7, DOM 5, Profiler 5
  - JS leaf 2 / native under JS 39 / native 30; buckets: paint_layout 15, poll_wait 9, engine_stream_read 4, memcpy_memset 2, subprocess_pipe_io 0, worker_messaging 0
  - top self: `[libxul.so]` 47; `__syscall_cancel_arch [libc.so.6]` 8; `[unknown]` 5; `mprotect [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `mozilla::detail::MutexImpl::unlock() [axiosozo-dev]` 1
  - top JS (total): `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 9; `_callProgressListeners (moz-src:///browser/components/tabbrowser/Tabbr` 9; `callListeners (moz-src:///browser/components/tabbrowser/Tabbrowser.sys` 9
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, poll_wait 12, worker_messaging 0; top self: `__syscall_cancel_arch [libc.so.6]` 13; `[libxul.so]` 0
- **tab:7706** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, ImageIO 0
  - main thread 26 ms (8.8% of span): JavaScript 7, Other 7, Idle 4, Layout 3, Profiler 2, DOM 1
  - JS leaf 0 / native under JS 7 / native 19; buckets: poll_wait 4, memcpy_memset 2, gc_cc 1, paint_layout 1
  - top self: `[libxul.so]` 15; `__syscall_cancel_arch [libc.so.6]` 5; `[]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 1; `__lll_lock_wait [libc.so.6]` 1
  - top JS (total): `FormAutofillChild (resource://autofill/FormAutofillChild.sys.mjs:71:14` 5
- **tab:7275** CPU ms by thread group: main 3, IPC I/O 0, other 0, Socket 0, ImageIO 0
  - main thread 3 ms (1.0% of span): Idle 2, JavaScript 0, Other 0, DOM 0
  - JS leaf 0 / native under JS 1 / native 2; buckets: poll_wait 2, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[libxul.so]` 1
  - top JS (total): `receiveMessage (resource://gre/modules/ConduitsChild.sys.mjs:192:17)[3` 0; `recvRunListener (resource://gre/modules/ExtensionChild.sys.mjs:860:18)` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[3]` 0; `wrapPromise/</< (resource://gre/modules/ExtensionCommon.sys.mjs:920:11` 0
- **tab:7325** CPU ms by thread group: IPC I/O 0, main 0, Socket 0, other 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[libxul.so]` 0

