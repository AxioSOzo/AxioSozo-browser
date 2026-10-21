# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **49.9** (DOM Worker 19.2, main 15.4, Renderer 7.7, WRScene~ilder# 3.8, WRRende~ckend# 3.8) | WPEWebProcess 73.0, AxioWebKitHost 7.7, WPENetworkProce 7.7 | — | 230.7 |
| plain | idle | — | — | **8.7** (main 6.7, Timer 1.0, IPC I/O Parent 0.5, TaskCon~ller # 0.5) | Web Content 3.8, forkserver 0.5 | — | — |
| plain | raf | 57.9 | 22.6 | **26.8** (main 12.0, DOM Worker 2.9, Renderer 2.6, SwComposite 1.6, TaskCon~ller # 1.3) | WPEWebProcess 65.5, AxioWebKitHost 8.3, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.5** (main 5.3, DOM Worker 3.3, Renderer 2.7, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 65.3, AxioWebKitHost 7.0 | — | — |
| plain | scroll | 56.9 | 34.0 | **41.3** (main 21.4, DOM Worker 6.8, Renderer 2.4, Backgro~Pool # 2.4, TaskCon~ller # 1.9) | WPEWebProcess 67.6, AxioWebKitHost 9.8 | — | — |
| plain | key | — | — | **17.2** (main 11.5, Renderer 1.4, DOM Worker 1.4, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | WPEWebProcess 6.8, AxioWebKitHost 1.4, WebExtensions 0.3 | 16.2 | — |
| plain | switch-to-gecko | — | — | **16.8** (main 8.4, IPC I/O Parent 4.2, BgIOThr~Pool # 4.2) | Isolated Web Co 4.2 | — | 213.3 |
| trace | switch-to-engine | — | — | **41.1** (main 12.6, Renderer 12.6, DOM Worker 6.3, WRScene~ilder# 3.2, WRRende~ckend# 3.2) | WPEWebProcess 56.8, WPENetworkProce 9.5, AxioWebKitHost 3.2, Isolated Web Co 3.2 | — | 288.8 |
| trace | idle | — | — | **9.2** (main 7.2, TaskCon~ller # 1.0, IPC I/O Parent 0.5, Timer 0.5) | Web Content 2.9 | — | — |
| trace | raf | 57.9 | 23.1 | **32.2** (main 15.2, DOM Worker 3.9, TaskCon~ller # 2.9, Renderer 2.6, SwComposite 1.6) | WPEWebProcess 65.8, AxioWebKitHost 8.3 | — | — |
| trace | raf-nosampler | — | — | **19.5** (main 5.3, DOM Worker 4.6, Renderer 2.7, WRRende~ckend# 1.7, SwComposite 1.3) | WPEWebProcess 64.7, AxioWebKitHost 7.7, Isolated Web Co 0.3 | — | — |
| trace | scroll | 57.0 | 32.2 | **44.9** (main 21.9, DOM Worker 7.3, Backgro~Pool # 2.9, TaskCon~ller # 2.4, Renderer 2.4) | WPEWebProcess 68.1, AxioWebKitHost 9.7 | — | — |
| trace | key | — | — | **19.2** (main 11.5, DOM Worker 1.6, Renderer 1.4, TaskCon~ller # 1.1, Timer 0.8) | WPEWebProcess 6.9, AxioWebKitHost 1.7, WebExtensions 0.3 | 19.4 | — |
| trace | switch-to-gecko | — | — | **20.1** (main 12.1, Renderer 4.0, WRScene~ilder# 4.0) | Isolated Web Co 4.0 | — | 214.4 |
| profile | switch-to-engine | — | — | **39.2** (main 14.0, DOM Worker 11.2, SamplerThread 11.2, WRRende~ckend# 2.8) | WPEWebProcess 67.0, Web Content 50.2, AxioWebKitHost 5.6, WPENetworkProce 5.6 | — | 320.2 |
| profile | idle | — | — | **28.2** (DOM Worker 9.1, main 8.6, SamplerThread 8.6, Timer 1.4, TaskCon~ller # 0.5) | Web Content 9.6, WebExtensions 1.4, Privileged Cont 1.4, Utility Process 1.4 | — | — |
| profile | raf | 58.1 | 26.6 | **53.0** (main 16.4, DOM Worker 11.2, SamplerThread 10.3, Renderer 2.9, Timer 1.9) | WPEWebProcess 66.8, Web Content 9.0, AxioWebKitHost 7.4, Privileged Cont 1.9 | — | — |
| profile | raf-nosampler | — | — | **40.1** (DOM Worker 11.3, SamplerThread 8.9, main 7.3, Renderer 3.3, WRRende~ckend# 2.0) | WPEWebProcess 66.8, Web Content 9.6, AxioWebKitHost 8.9, Privileged Cont 2.0 | — | — |
| profile | scroll | 57.1 | 34.0 | **70.5** (main 27.6, DOM Worker 14.8, SamplerThread 10.5, Renderer 3.3, Backgro~Pool # 3.3) | WPEWebProcess 67.2, AxioWebKitHost 9.5, Web Content 7.6, WebExtensions 1.9 | — | — |
| profile | key | — | — | **45.4** (main 17.2, DOM Worker 9.5, SamplerThread 9.5, TaskCon~ller # 2.2, Timer 1.6) | Web Content 9.8, WPEWebProcess 7.5, WebExtensions 2.5, Privileged Cont 2.2 | 20.1 | — |
| profile | switch-to-gecko | — | — | **46.8** (main 15.6, DOM Worker 7.8, SamplerThread 7.8, glean.dispatche 3.9, Socket Thread 3.9) | Isolated Web Co 3.9 | — | 222.1 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 5.9 | 0.0 | 0 | 0.0 | — | — | 87.7 | 0.0 | — | 1.12 | 0.41 | — | — | — | — | — | 0.002 |
| trace | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.14 | 0.13 | — | — | — | — | — | 0.008 |
| trace | raf-nosampler | 57.3 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.14 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 55.8 | 0.0 | 0 | 0.0 | — | — | 8.3 | 0.0 | — | 0.31 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 8.8 | 0.0 | — | 0.09 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.2 | 0.0 | 0 | 0.0 | — | — | 93.0 | 0.0 | — | 1.36 | 0.53 | — | — | — | — | — | 0.003 |
| profile | raf | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.1 | 0.0 | — | 0.16 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.4 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.18 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 55.6 | 0.0 | 0 | 0.0 | — | — | 10.3 | 0.0 | — | 0.35 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 7.9 | 0.0 | — | 0.13 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.875 | 1.747 | 0.0062 | 0.0124 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.045 | 0.077 | 0.0026 | 0.0045 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.063 | 0.098 | 0.0037 | 0.0056 |
| plain | scroll | memfd | native | 115 | 115 | 0.205 | 0.235 | 0.0113 | 0.0130 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.076 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.945 | 1.615 | 0.0056 | 0.0096 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.050 | 0.078 | 0.0029 | 0.0045 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.052 | 0.084 | 0.0030 | 0.0048 |
| trace | scroll | memfd | native | 116 | 116 | 0.207 | 0.229 | 0.0116 | 0.0128 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.071 | 0.0000 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.068 | 1.978 | 0.0055 | 0.0102 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 182 | 182 | 0.055 | 0.091 | 0.0032 | 0.0053 |
| profile | raf-nosampler | memfd | native | 177 | 177 | 0.059 | 0.104 | 0.0034 | 0.0060 |
| profile | scroll | memfd | native | 118 | 118 | 0.221 | 0.280 | 0.0123 | 0.0156 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.076 | 0.0000 | 0.0004 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 16.5 | 0.0 | — | 0.09 | 0.29 | — | — | 14.6 | 17.4 | 32.9 |
| profile | 0.6 | 16.7 | 0.1 | — | 0.13 | 0.48 | — | — | 12.4 | 17.9 | 30.8 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 26.6; first stdout read resolved 30.8; first frame applied (native receiver) 307.0; write frame_ack 307.6; write visibility 311.8; write focus 312.0

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 20.1; first stdout read resolved 25.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 34.9; first stdout read resolved 43.0; first frame applied (native receiver) 340.0; write frame_ack 340.8; write visibility 349.0; write focus 349.4

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 30.0; first stdout read resolved 39.3

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 49, DOM Worker 29, Renderer 17, BgPool 6, Compositor 4, IPC I/O 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, WRWorker 1, Socket 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 49 ms (12.8% of span): JavaScript 28, Idle 5, Other 5, Layout 5, Profiler 4, DOM 1
  - JS leaf 1 / native under JS 34 / native 15; buckets: ipc 49, gc_cc 23, harness_diagnostics 15, array_buffer_copy 12, engine_stream_read 10, worker_messaging 9, paint_layout 8, poll_wait 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `__strlen_avx2 [libc.so.6]` 4; `js::BaseScript::enclosingScope() const [libxul.so]` 4; `__lll_lock_wait [libc.so.6]` 3; `js::jit::DoLazyConstantFallback(JSContext*, js::jit::Baselin` 2; `JS::GetDeflatedUTF8StringLength(JSLinearString*) [libxul.so]` 2
  - WebRender/compositor threads: Renderer 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ClearTexSubImage [libxul.so]` 5, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 4); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `[axiosozo-dev]` 0, `webrender::clip::ClipStore::build_clip_chain_insta` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `webrender::scene_building::create_prim_instance [l` 1, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `ARGBSetRow_X86 [libxul.so]` 3, `__syscall_cancel_arch [libc.so.6]` 1, `__memset_avx2_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 29 ms: buckets subprocess_pipe_io 29, worker_messaging 29, ipc 29, js_ctypes 29, poll_wait 29; top self: `__syscall_cancel_arch [libc.so.6]` 29; `[axiosozo-dev]` 0
- **tab:7840** CPU ms by thread group: main 55, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 55 ms (19.5% of span): Other 43, Profiler 4, DOM 4, JavaScript 3, Idle 2, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 50; buckets: ipc 42, array_buffer_copy 18, gc_cc 11, subprocess_pipe_io 4, memcpy_memset 3, poll_wait 2
  - top self: `[]` 5; `[libexpat.so.1]` 3; `[libfontconfig.so.1]` 3; `__lll_lock_wake [libc.so.6]` 3; `__strcmp_avx2 [libc.so.6]` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7834** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 49 ms (13.9% of span): Other 41, DOM 5, JavaScript 2, Idle 0, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: ipc 37, array_buffer_copy 15, gc_cc 11, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 0
  - top self: `__memcmp_avx2_movbe [libc.so.6]` 4; `[]` 3; `nsresult mozilla::PreferencesImpl::GetPrefValue<unsigned int` 3; `__strncmp_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `JSAtom* js::AtomizeCharsNonStaticValidLength<unsigned char>(` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `PR_GetThreadPrivate [libnspr4.so]` 0)
- **tab:7692** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 2 ms (0.6% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 160, DOM Worker 113, other 21, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRSceneBuilder 0, WRWorker 0, WRRenderBackend 0, Compositor 0, Canvas 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 160 ms (7.6% of span): Idle 126, JavaScript 13, Other 9, DOM 7, Profiler 3, GC / CC 1
  - JS leaf 3 / native under JS 17 / native 140; buckets: ipc 160, poll_wait 132, harness_diagnostics 19, array_buffer_copy 7, gc_cc 6, engine_stream_read 4, native_receiver 1, json_metadata 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 131; `[unknown]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `js::SharedPropMap::freezeOrSealProperties(JSContext*, js::In` 1
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRSceneBuilder#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 113 ms: buckets subprocess_pipe_io 113, js_ctypes 113, worker_messaging 113, ipc 113, poll_wait 113; top self: `__syscall_cancel_arch [libc.so.6]` 113
- **tab:7313** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7291** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::ProfileBufferEntryWriter::Serializer<mozilla::Profi` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 485, DOM Worker 270, Renderer 84, WRRenderBackend 49, Compositor 42, SwComposite 41, BgPool 32, other 31, ImageBridge 18, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 485 ms (15.5% of span): Idle 298, JavaScript 87, Other 38, GC / CC 37, DOM 17, Profiler 8
  - JS leaf 11 / native under JS 86 / native 388; buckets: ipc 483, poll_wait 322, gc_cc 112, engine_stream_read 49, worker_messaging 40, harness_diagnostics 39, array_buffer_copy 17, subprocess_pipe_io 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 317; `[unknown]` 15; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 11; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `[axiosozo-dev]` 4
  - GC/CC markers: GCMajor 1× 1050 ms, GCSlice 8× 30 ms, CCSlice 3× 7 ms, GCMinor 2× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 84 ms (top self: `__syscall_cancel_arch [libc.so.6]` 65, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 5); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 41 ms (top self: `syscall [libc.so.6]` 39, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 31, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `mozilla::layers::PImageBridgeChild::SendUpdate(moz` 0, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 270 ms: buckets subprocess_pipe_io 270, worker_messaging 269, ipc 269, js_ctypes 251, poll_wait 245, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 247; `[unknown]` 3; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7692** CPU ms by thread group: main 5, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.2% of span): Idle 2, GC / CC 2, Other 0, Profiler 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 4, gc_cc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTra` 1; `[]` 0; `IID2NativeInterfaceMap::Trace(JSTracer*) [libxul.so]` 0; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 54 ms, GCSlice 4× 4 ms, CCSlice 1× 1 ms, GCMinor 1× 1 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7313** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::NodeChannel::SendMessage(std::unique_ptr<IPC::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 270, main 211, Renderer 83, WRRenderBackend 48, SwComposite 41, Compositor 41, BgPool 36, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 107, JavaScript 62, Other 19, DOM 15, Profiler 6, GC / CC 2
  - JS leaf 6 / native under JS 72 / native 133; buckets: ipc 210, poll_wait 115, gc_cc 77, engine_stream_read 57, worker_messaging 43, subprocess_pipe_io 19, native_receiver 17, array_buffer_copy 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 116; `[unknown]` 14; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 2; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 83 ms (top self: `__syscall_cancel_arch [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 4); WRRenderBackend#0 48 ms (top self: `syscall [libc.so.6]` 43, `sched_yield [libc.so.6]` 1, `webrender::tile_cache::TileCacheInstance::update_p` 0); SwComposite 41 ms (top self: `syscall [libc.so.6]` 39, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `UnlockResource [libxul.so]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 34 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `profiler_mark_thread_asleep() [libxul.so]` 0, `mozilla::layers::PImageBridgeChild::SendUpdate(moz` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0, `fstat64 [libc.so.6]` 0)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 260, ipc 260, js_ctypes 239, poll_wait 236, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 237; `[unknown]` 2; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1
- **tab:7313** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, paint_layout 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `nsRefreshDriver::GetIdleDeadlineHint(mozilla::TimeStamp, nsR` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7291** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 551, DOM Worker 258, BgPool 59, Renderer 55, WRRenderBackend 34, Compositor 27, SwComposite 23, other 21, ImageBridge 12, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 551 ms (26.0% of span): Idle 282, JavaScript 106, Other 64, DOM 38, Graphics 17, GC / CC 15
  - JS leaf 12 / native under JS 126 / native 413; buckets: ipc 548, poll_wait 360, gc_cc 117, engine_stream_read 64, worker_messaging 52, paint_layout 52, harness_diagnostics 45, array_buffer_copy 30
  - top self: `__syscall_cancel_arch [libc.so.6]` 314; `[unknown]` 17; `__lll_lock_wait [libc.so.6]` 6; `[axiosozo-dev]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5
  - GC/CC markers: CCSlice 4× 9 ms, GCSlice 4× 7 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 55 ms (top self: `__syscall_cancel_arch [libc.so.6]` 41, `syscall [libc.so.6]` 6, `__memmove_avx_unaligned_erms [libc.so.6]` 4); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 3, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); SwComposite 23 ms (top self: `syscall [libc.so.6]` 23, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 59 ms (top self: `__syscall_cancel_arch [libc.so.6]` 51, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 12 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 219, poll_wait 208, gc_cc 14; top self: `__syscall_cancel_arch [libc.so.6]` 216; `[unknown]` 4; `__lll_lock_wait [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 2; `js::Shape::replaceShape(JSContext*, JS::Handle<JSO` 2
- **tab:7291** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7698** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0; `IPC::AddIPCProfilerMarker(IPC::Message const&, int, mozilla:` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 590, DOM Worker 251, Renderer 56, other 35, SwComposite 18, Compositor 18, WRRenderBackend 16, WRWorker 12, WRSceneBuilder 9, BgPool 2, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 590 ms (16.0% of span): Idle 247, JavaScript 109, GC / CC 71, Layout 47, Other 46, Graphics 33
  - JS leaf 14 / native under JS 160 / native 416; buckets: ipc 587, poll_wait 296, gc_cc 170, paint_layout 93, worker_messaging 80, engine_stream_read 77, harness_diagnostics 30, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 269; `[unknown]` 25; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 13; `[axiosozo-dev]` 8; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObject` 4
  - GC/CC markers: GCMajor 2× 1356 ms, GCSlice 17× 64 ms, CCSlice 5× 13 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 56 ms (top self: `__syscall_cancel_arch [libc.so.6]` 19, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 5); SwComposite 18 ms (top self: `syscall [libc.so.6]` 14, `__memmove_avx_unaligned_erms [libc.so.6]` 3, `webrender::compositor::sw_compositor::SwCompositeT` 1); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 13, `sched_yield [libc.so.6]` 1, `webrender::frame_builder::FrameBuilder::build [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `[linux-vdso.so.1]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 251 ms: buckets subprocess_pipe_io 251, worker_messaging 251, ipc 251, js_ctypes 241, poll_wait 236, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 237; `bool js::ctypes::jsvalToInteger<short>(JSContext*,` 2; `[unknown]` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1; `JSAutoRealm::JSAutoRealm(JSContext*, JSObject*) [l` 1
- **tab:7239** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 6, JavaScript 1, Other 0
  - JS leaf 0 / native under JS 0 / native 7; buckets: ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `JSStructuredCloneData::AppendBytes(char const*, unsigned lon` 0; `nsIGlobalObject::CanRunJSMicroTask(JSObject*) const [libxul.` 0; `xpc::XrayTraits::resolveOwnProperty(JSContext*, JS::Handle<J` 0; `mozilla::AutoProfilerLabel::AutoProfilerLabel(char const*, c` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7332** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7313** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 88, Renderer 31, DOM Worker 16, BgPool 11, WRRenderBackend 4, Compositor 3, WRSceneBuilder 3, IPC I/O 3, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 88 ms (28.0% of span): JavaScript 33, Layout 15, DOM 14, Graphics 10, Other 9, Idle 4
  - JS leaf 4 / native under JS 45 / native 39; buckets: ipc 88, paint_layout 26, array_buffer_copy 20, gc_cc 14, harness_diagnostics 13, engine_stream_read 10, worker_messaging 7, poll_wait 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&,` 4; `syscall [libc.so.6]` 4; `mozilla::nsDisplayListSet::MoveTo(mozilla::nsDisplayListSet ` 3; `pthread_self [libc.so.6]` 3
  - WebRender/compositor threads: Renderer 31 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10, `__syscall_cancel_arch [libc.so.6]` 4, `floorf [libxul.so]` 4); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `<webrender::gpu_types::QuadHeader as webrender::re` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `__lll_lock_wait [libc.so.6]` 0, `webrender::scene_building::SceneBuilder::add_image` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 11 ms (top self: `fstatat64 [libc.so.6]` 4, `unlink [libc.so.6]` 2, `__syscall_cancel_arch [libc.so.6]` 2); BackgroundThreadPool #3 0 ms (top self: `syscall [libc.so.6]` 0, `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 16 ms: buckets subprocess_pipe_io 16, worker_messaging 16, ipc 16, poll_wait 15, js_ctypes 15; top self: `__syscall_cancel_arch [libc.so.6]` 15; `bool js::FillArgumentsFromArraylike<js::InvokeArgs` 1; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::V` 0
- **tab:7692** CPU ms by thread group: main 31, IPC I/O 2, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 31 ms (9.8% of span): Other 10, JavaScript 8, Idle 5, DOM 4, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 10 / native 21; buckets: ipc 26, gc_cc 10, poll_wait 6, subprocess_pipe_io 5, paint_layout 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[]` 2; `nsNodeInfoManager::GetNodeInfo(nsAtom*, nsAtom*, int, unsign` 1; `ReservedWordInfo const* FindReservedWord<unsigned char>(unsi` 1; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*,` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7239** CPU ms by thread group: main 14, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 14 ms (4.4% of span): GC / CC 6, JavaScript 3, Idle 3, Other 1
  - JS leaf 0 / native under JS 3 / native 11; buckets: ipc 13, gc_cc 8, array_buffer_copy 3, poll_wait 3, memcpy_memset 1
  - top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 4; `__syscall_cancel_arch [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(J` 1; `__memcmp_avx2_movbe [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 16 ms, GCSlice 4× 10 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7840** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

