# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **58.2** (DOM Worker 23.3, Renderer 15.5, main 11.6, TaskCon~ller # 3.9, WRRende~ckend# 3.9) | WPEWebProcess 77.6, WPENetworkProce 11.6, AxioWebKitHost 7.8 | — | 235.1 |
| plain | idle | — | — | **7.3** (main 6.3, Timer 0.5, DOM Worker 0.5) | Web Content 3.9, forkserver 0.5 | — | — |
| plain | raf | 58.0 | 26.5 | **37.1** (main 13.3, Renderer 5.1, DOM Worker 3.5, SwComposite 3.2, Socket Thread 2.5) | WPEWebProcess 182.2, AxioWebKitHost 18.0 | — | — |
| plain | raf-nosampler | — | — | **28.5** (main 5.3, Renderer 5.3, DOM Worker 4.0, SwComposite 3.3, Backgro~Pool # 2.6) | WPEWebProcess 181.3, AxioWebKitHost 18.2 | — | — |
| plain | scroll | 56.0 | 27.6 | **48.1** (main 20.1, DOM Worker 7.7, Backgro~Pool # 7.2, Renderer 4.8, SwComposite 2.9) | WPEWebProcess 187.1, AxioWebKitHost 18.7 | — | — |
| plain | key | — | — | **81.7** (main 23.8, DOM Worker 21.9, IndexedDB IO # 15.8, IPDL Background 6.0, Renderer 3.0) | WPEWebProcess 18.0, AxioWebKitHost 2.0, RDD Process 0.5, Privileged Cont 0.3 | 28.7 | — |
| plain | switch-to-gecko | — | — | **48.9** (main 20.3, Renderer 12.2, IPDL Background 4.1, BgIOThr~Pool # 4.1, DOM Worker 4.1) | Isolated Web Co 4.1 | — | 214.5 |
| trace | switch-to-engine | — | — | **96.1** (Renderer 67.0, main 14.6, Backgro~Pool # 5.8, glean.dispatche 2.9, WRRende~ckend# 2.9) | WPEWebProcess 75.7, WPENetworkProce 8.7, AxioWebKitHost 5.8 | — | 318.0 |
| trace | idle | — | — | **13.6** (main 8.7, TaskCon~ller # 2.4, DOM Worker 1.5, Timer 1.0) | Web Content 1.0, AxioWebKitHost 0.5 | — | — |
| trace | raf | 57.9 | 26.7 | **30.7** (main 11.0, Renderer 5.2, DOM Worker 3.6, SwComposite 3.2, Backgro~Pool # 2.3) | WPEWebProcess 180.9, AxioWebKitHost 17.1 | — | — |
| trace | raf-nosampler | — | — | **25.9** (main 5.6, Renderer 5.3, SwComposite 3.3, DOM Worker 3.3, Backgro~Pool # 3.0) | WPEWebProcess 181.7, AxioWebKitHost 17.6 | — | — |
| trace | scroll | 56.6 | 31.9 | **48.0** (main 20.6, DOM Worker 8.1, Backgro~Pool # 7.2, Renderer 4.3, SwComposite 2.9) | WPEWebProcess 185.8, AxioWebKitHost 19.2 | — | — |
| trace | key | — | — | **18.9** (main 9.9, Renderer 2.7, SwComposite 1.4, DOM Worker 1.4, Timer 0.8) | WPEWebProcess 16.9, AxioWebKitHost 2.2, WebExtensions 0.5 | 24.7 | — |
| trace | switch-to-gecko | — | — | **25.6** (main 8.5, Renderer 8.5, BgIOThr~Pool # 4.3, WRRende~ckend# 4.3) | Isolated Web Co 4.3 | — | 213.2 |
| profile | switch-to-engine | — | — | **26.4** (main 11.7, DOM Worker 5.9, SamplerThread 5.9, Renderer 2.9) | WPEWebProcess 70.4, Web Content 58.7, AxioWebKitHost 5.9, WPENetworkProce 5.9 | — | 308.7 |
| profile | idle | — | — | **24.5** (main 7.7, SamplerThread 7.7, DOM Worker 7.2, Timer 1.9) | Web Content 7.7, WebExtensions 1.9, Privileged Cont 1.9, Isolated Web Co 1.9 | — | — |
| profile | raf | 58.0 | 24.8 | **55.4** (main 15.7, DOM Worker 10.2, SamplerThread 9.6, Renderer 6.4, Backgro~Pool # 2.9) | WPEWebProcess 184.0, AxioWebKitHost 18.5, Web Content 7.0, WebExtensions 1.9 | — | — |
| profile | raf-nosampler | — | — | **46.3** (DOM Worker 9.9, SamplerThread 8.6, main 7.3, Renderer 6.0, Backgro~Pool # 3.3) | WPEWebProcess 185.2, AxioWebKitHost 18.2, Web Content 6.0, Isolated Web Co 1.7 | — | — |
| profile | scroll | 55.8 | 33.9 | **74.4** (main 27.5, DOM Worker 13.3, SamplerThread 9.0, Backgro~Pool # 7.6, Renderer 5.2) | WPEWebProcess 188.8, AxioWebKitHost 19.4, Web Content 6.6, WebExtensions 1.9 | — | — |
| profile | key | — | — | **44.6** (main 13.9, DOM Worker 9.6, SamplerThread 9.6, Renderer 3.3, BgIOThr~Pool # 2.2) | WPEWebProcess 17.5, Web Content 8.4, WebExtensions 2.8, Privileged Cont 2.2 | 27.9 | — |
| profile | switch-to-gecko | — | — | **40.3** (main 16.1, Renderer 8.1, DOM Worker 8.1, BgIOThr~Pool # 4.0, SamplerThread 4.0) | Isolated Web Co 8.1 | — | 217.8 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 4.9 | 0.0 | 0 | 0.0 | — | — | 50.8 | 0.0 | — | 1.81 | 0.40 | — | — | — | — | — | 0.002 |
| trace | raf | 57.9 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.26 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.29 | 0.12 | — | — | — | — | — | 0.007 |
| trace | scroll | 55.6 | 0.0 | 0 | 0.0 | — | — | 12.1 | 0.0 | — | 0.72 | 0.12 | — | — | — | — | — | 0.008 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 14.2 | 0.0 | — | 0.09 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 79.0 | 0.0 | — | 2.28 | 0.59 | — | — | — | — | — | 0.003 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 15.9 | 0.0 | — | 0.33 | 0.15 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.3 | 0.0 | 0 | 0.0 | — | — | 16.0 | 0.0 | — | 0.30 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 54.5 | 0.0 | 0 | 0.0 | — | — | 7.5 | 0.0 | — | 0.92 | 0.17 | — | — | — | — | — | 0.013 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 15.6 | 0.0 | — | 0.12 | 0.16 | — | — | — | — | — | 0.002 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.516 | 2.428 | 0.0110 | 0.0177 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.153 | 0.219 | 0.0088 | 0.0126 |
| plain | raf-nosampler | memfd | native | 177 | 177 | 0.189 | 0.247 | 0.0110 | 0.0144 |
| plain | scroll | memfd | native | 114 | 114 | 0.652 | 0.633 | 0.0354 | 0.0344 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.157 | 0.0000 | 0.0009 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 1.310 | 2.306 | 0.0064 | 0.0113 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 181 | 181 | 0.150 | 0.214 | 0.0087 | 0.0124 |
| trace | raf-nosampler | memfd | native | 177 | 177 | 0.181 | 0.240 | 0.0105 | 0.0139 |
| trace | scroll | memfd | native | 116 | 116 | 0.637 | 0.652 | 0.0351 | 0.0360 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.165 | 0.0000 | 0.0009 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.591 | 2.442 | 0.0088 | 0.0135 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 184 | 184 | 0.178 | 0.281 | 0.0104 | 0.0164 |
| profile | raf-nosampler | memfd | native | 178 | 178 | 0.190 | 0.272 | 0.0111 | 0.0158 |
| profile | scroll | memfd | native | 115 | 115 | 0.730 | 0.838 | 0.0394 | 0.0453 |
| profile | key | memfd | native | 20 | 20 | 0.002 | 0.196 | 0.0000 | 0.0011 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.4 | 21.8 | 0.0 | — | 0.09 | 0.30 | — | — | 14.2 | 22.5 | 34.5 |
| profile | 0.5 | 25.5 | 0.1 | — | 0.12 | 0.53 | — | — | 6.1 | 26.8 | 32.8 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 69.0; first stdout read resolved 73.0; first frame applied (native receiver) 377.9; write frame_ack 378.5; write visibility 382.5; write focus 382.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 16.6; first stdout read resolved 21.7

Switch timeline (profile, switch-to-engine, ms after the window start): write create 28.8; first stdout read resolved 32.0; first frame applied (native receiver) 322.9; write frame_ack 324.0; write visibility 332.1; write focus 332.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 25.5; first stdout read resolved 34.9

### Profile: webkit-2x / switch-to-engine

- **parent** CPU ms by thread group: main 37, DOM Worker 22, Renderer 17, BgPool 7, IPC I/O 3, Compositor 3, WRRenderBackend 2, WRSceneBuilder 2, SwComposite 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 37 ms (10.2% of span): JavaScript 14, Idle 7, Layout 4, DOM 3, Other 3, Graphics 3
  - JS leaf 2 / native under JS 17 / native 18; buckets: ipc 37, gc_cc 15, poll_wait 11, paint_layout 11, array_buffer_copy 10, harness_diagnostics 8, subprocess_pipe_io 2, engine_stream_read 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 8; `bool mozilla::dom::binding_detail::GenericGetter<mozilla::do` 3; `pthread_cond_broadcast@@GLIBC_2.3.2 [libc.so.6]` 2; `mozilla::ReflowInput::Init(nsPresContext*, mozilla::Maybe<mo` 2; `mozilla::dom::JSIPCValueUtils::ToJSVal(JSContext*, mozilla::` 2; `[libglib-2.0.so.0]` 2
  - WebRender/compositor threads: Renderer 17 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `void commit_solid_span<true>(unsigned int*, unsign` 2, `ps_quad_box_shadow_SUPERELLIPSE_frag::pattern_frag` 2); WRRenderBackend#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 1, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 7 ms (top self: `ARGBSetRow_X86 [libxul.so]` 2, `__syscall_cancel_arch [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 2); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 22 ms: buckets subprocess_pipe_io 22, worker_messaging 22, ipc 22, js_ctypes 21, poll_wait 21, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 21; `void js::NativeObject::setFixedSlot<true>(unsigned` 0; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js` 0; `__lll_lock_wait [libc.so.6]` 0; `[axiosozo-dev]` 0
- **tab:9478** CPU ms by thread group: main 56, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 57 ms (16.8% of span): Other 42, JavaScript 7, Profiler 5, DOM 2, Idle 1, GC / CC 0
  - JS leaf 3 / native under JS 2 / native 52; buckets: ipc 44, array_buffer_copy 18, gc_cc 13, subprocess_pipe_io 6, poll_wait 2, memcpy_memset 1
  - top self: `[]` 6; `__lll_lock_wake [libc.so.6]` 4; `[libfontconfig.so.1]` 4; `[libexpat.so.1]` 3; `initExtensionPolicy (resource://gre/modules/ExtensionProcess` 3; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsign` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9483** CPU ms by thread group: main 46, IPC I/O 0, other 0, BgPool 0, ImageBridge 0, Socket 0, ImageIO 0
  - main thread 46 ms (16.5% of span): Other 36, DOM 4, Profiler 3, JavaScript 2, Idle 1
  - JS leaf 0 / native under JS 7 / native 40; buckets: ipc 35, array_buffer_copy 13, gc_cc 11, subprocess_pipe_io 6, poll_wait 1, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `<T as alloc::vec::spec_from_elem::SpecFromElem>::from_elem [` 3; `[]` 2; `nsresult mozilla::PreferencesImpl::GetSharedPrefValue<float>` 2; `JSAtom* js::NewAtomCopyNDontDeflateValidLength<unsigned char` 2; `__strlen_avx2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9340** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.5% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / idle

- **parent** CPU ms by thread group: main 148, DOM Worker 93, other 19, Socket 1, IPC I/O 1, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 148 ms (7.1% of span): Idle 118, JavaScript 13, Other 6, GC / CC 6, DOM 5, Profiler 1
  - JS leaf 2 / native under JS 15 / native 132; buckets: ipc 148, poll_wait 122, harness_diagnostics 15, gc_cc 13, array_buffer_copy 4, engine_stream_read 2, json_metadata 1, worker_messaging 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 122; `[axiosozo-dev]` 2; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t con` 1; `TraceCallbackFunc::Trace(JS::Heap<JSObject*>*, char const*, ` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1
  - GC/CC markers: CCSlice 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 93 ms: buckets subprocess_pipe_io 93, js_ctypes 93, worker_messaging 93, ipc 93, poll_wait 93; top self: `__syscall_cancel_arch [libc.so.6]` 93
- **tab:8980** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9478** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9344** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf

- **parent** CPU ms by thread group: main 454, DOM Worker 237, Renderer 170, SwComposite 88, BgPool 81, WRRenderBackend 54, Compositor 42, other 33, ImageBridge 18, WRSceneBuilder 9, Socket 2, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 454 ms (14.4% of span): Idle 307, JavaScript 77, Other 40, DOM 25, Profiler 5
  - JS leaf 10 / native under JS 87 / native 357; buckets: ipc 448, poll_wait 326, gc_cc 65, engine_stream_read 46, harness_diagnostics 41, worker_messaging 34, array_buffer_copy 20, subprocess_pipe_io 18
  - top self: `__syscall_cancel_arch [libc.so.6]` 323; `[unknown]` 14; `mprotect [libc.so.6]` 7; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 6; `[linux-vdso.so.1]` 5; `[axiosozo-dev]` 4
  - GC/CC markers: GCMinor 1× 1 ms
  - WebRender/compositor threads: Renderer 170 ms (top self: `__syscall_cancel_arch [libc.so.6]` 105, `__memmove_avx_unaligned_erms [libc.so.6]` 38, `syscall [libc.so.6]` 16); SwComposite 88 ms (top self: `syscall [libc.so.6]` 80, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 54 ms (top self: `syscall [libc.so.6]` 35, `sched_yield [libc.so.6]` 15, `[axiosozo-dev]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 81 ms (top self: `__syscall_cancel_arch [libc.so.6]` 69, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 18 ms (top self: `__syscall_cancel_arch [libc.so.6]` 18, `[linux-vdso.so.1]` 0, `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 237 ms: buckets subprocess_pipe_io 237, worker_messaging 237, ipc 237, js_ctypes 212, poll_wait 206, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 209; `[unknown]` 3; `[axiosozo-dev]` 2; `mprotect [libc.so.6]` 2; `JS::RunJSMicroTask(JSContext*, JS::Handle<JSObject` 2
- **tab:9344** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8980** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 226, main 211, Renderer 164, SwComposite 92, BgPool 82, WRRenderBackend 51, Compositor 41, ImageBridge 17, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 211 ms (6.9% of span): Idle 125, JavaScript 48, Other 26, DOM 7, Profiler 3, GC / CC 1
  - JS leaf 8 / native under JS 46 / native 156; buckets: ipc 210, poll_wait 141, gc_cc 60, engine_stream_read 41, worker_messaging 31, native_receiver 12, subprocess_pipe_io 9, array_buffer_copy 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 141; `[unknown]` 7; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 3; `mozilla::dom::Event::SetOwner(mozilla::dom::EventTarget*) [l` 2; `__tls_get_addr [ld-linux-x86-64.so.2]` 2; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 163 ms (top self: `__syscall_cancel_arch [libc.so.6]` 106, `__memmove_avx_unaligned_erms [libc.so.6]` 34, `syscall [libc.so.6]` 11); SwComposite 92 ms (top self: `syscall [libc.so.6]` 85, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 51 ms (top self: `syscall [libc.so.6]` 33, `sched_yield [libc.so.6]` 12, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 82 ms (top self: `__syscall_cancel_arch [libc.so.6]` 71, `__memmove_avx_unaligned_erms [libc.so.6]` 9, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 17 ms (top self: `__syscall_cancel_arch [libc.so.6]` 17, `[linux-vdso.so.1]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 226 ms: buckets subprocess_pipe_io 226, worker_messaging 226, ipc 226, js_ctypes 206, poll_wait 201, gc_cc 8; top self: `__syscall_cancel_arch [libc.so.6]` 205; `mozilla::ipc::PrincipalInfo::PrincipalInfo(mozilla` 1; `[unknown]` 1; `pthread_mutex_init@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void` 1
- **tab:8980** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[libglib-2.0.so.0]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9478** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `NS_GetMainThread(nsIThread**) [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9344** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / scroll

- **parent** CPU ms by thread group: main 539, DOM Worker 245, BgPool 149, Renderer 102, SwComposite 47, WRRenderBackend 34, Compositor 26, other 21, ImageBridge 11, WRSceneBuilder 6, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 539 ms (25.4% of span): Idle 315, JavaScript 91, Other 46, DOM 40, Graphics 26, Profiler 11
  - JS leaf 10 / native under JS 117 / native 412; buckets: ipc 538, poll_wait 384, gc_cc 84, engine_stream_read 71, harness_diagnostics 51, worker_messaging 50, paint_layout 47, array_buffer_copy 22
  - top self: `__syscall_cancel_arch [libc.so.6]` 335; `[unknown]` 18; `__lll_lock_wait [libc.so.6]` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 6; `[axiosozo-dev]` 5; `mozilla::nsDisplayListBuilder::MarkOutOfFlowFrameForDisplay(` 5
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 102 ms (top self: `__syscall_cancel_arch [libc.so.6]` 68, `__memmove_avx_unaligned_erms [libc.so.6]` 16, `syscall [libc.so.6]` 11); SwComposite 47 ms (top self: `syscall [libc.so.6]` 46, `__memmove_avx_unaligned_erms [libc.so.6]` 1); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 22, `sched_yield [libc.so.6]` 10, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 149 ms (top self: `__syscall_cancel_arch [libc.so.6]` 99, `__memmove_avx_unaligned_erms [libc.so.6]` 47, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 11 ms (top self: `__syscall_cancel_arch [libc.so.6]` 11, `[linux-vdso.so.1]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 245 ms: buckets subprocess_pipe_io 245, worker_messaging 245, ipc 245, js_ctypes 209, poll_wait 204, gc_cc 14; top self: `__syscall_cancel_arch [libc.so.6]` 206; `[unknown]` 7; `[axiosozo-dev]` 6; `__lll_lock_wake [libc.so.6]` 4; `getcontext [libc.so.6]` 2
- **tab:9478** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9344** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / key

- **parent** CPU ms by thread group: main 476, DOM Worker 223, Renderer 110, BgPool 91, SwComposite 49, other 36, WRRenderBackend 18, Compositor 15, WRWorker 12, WRSceneBuilder 9, ImageBridge 2, IPC I/O 1, Socket 1, Canvas 0, ImageIO 0
  - main thread 476 ms (12.9% of span): Idle 233, JavaScript 97, Layout 40, Other 37, Graphics 30, DOM 29
  - JS leaf 11 / native under JS 149 / native 316; buckets: ipc 474, poll_wait 260, gc_cc 88, paint_layout 80, worker_messaging 65, engine_stream_read 58, harness_diagnostics 37, array_buffer_copy 17
  - top self: `__syscall_cancel_arch [libc.so.6]` 239; `[unknown]` 19; `[axiosozo-dev]` 8; `syscall [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 4; `IsTwiceTheRequiredBytesRepresentableAsUint32(unsigned long, ` 3
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 110 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 40, `__syscall_cancel_arch [libc.so.6]` 26, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 10); SwComposite 49 ms (top self: `syscall [libc.so.6]` 31, `__memmove_avx_unaligned_erms [libc.so.6]` 17, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 14, `webrender::batch::BatchBuilder::add_prim_to_batch:` 1, `webrender::bump_allocator::ChunkPool::allocate_chu` 1)
  - background pools (native receiver queue): BgIOThreadPool #2 86 ms (top self: `LZ4HC_compress_generic_noDictCtx [libxul.so]` 82, `__syscall_cancel_arch [libc.so.6]` 3, `XXH32_update [libxul.so]` 1); BackgroundThreadPool #2 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `mozilla::layers::ImageClientSingle::UpdateImage(mo` 0)
  - busiest DOM Worker 223 ms: buckets subprocess_pipe_io 223, worker_messaging 223, ipc 223, js_ctypes 211, poll_wait 208, gc_cc 5; top self: `__syscall_cancel_arch [libc.so.6]` 210; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1; `[unknown]` 1; `ffi_call_plan_invoke [libxul.so]` 1
- **tab:8861** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mozilla::dom::JSActor::QueryHandler::SendReply(JSContext*, m` 0; `[linux-vdso.so.1]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::IterImpl::Advanc` 0; `nsDocShell::EnsureScriptEnvironment() [libxul.so]` 0; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateSegment(` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8980** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, DOM 1, JavaScript 1
  - JS leaf 0 / native under JS 2 / native 2; buckets: ipc 4, poll_wait 2, gc_cc 1, memcpy_memset 1, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `bool mozilla::detail::HashTable<js::MapAndIndex<js::PropMap>` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `nsContentUtils::GetCurrentJSContext() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8953** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::ShmemDestroyed::~ShmemDestroyed() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x / switch-to-gecko

- **parent** CPU ms by thread group: main 76, Renderer 42, DOM Worker 15, BgPool 11, WRRenderBackend 4, WRSceneBuilder 3, Compositor 3, IPC I/O 2, SwComposite 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 76 ms (25.7% of span): JavaScript 22, Layout 13, DOM 11, Other 9, Graphics 7, GC / CC 6
  - JS leaf 3 / native under JS 35 / native 38; buckets: ipc 76, paint_layout 20, array_buffer_copy 16, gc_cc 16, harness_diagnostics 10, poll_wait 8, engine_stream_read 6, worker_messaging 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `mozilla::AbsoluteContainingBlock::ReflowAbsoluteFrame(nsCont` 4; `[unknown]` 4; `mozilla::net::nsHttpChannel::CallOnStartRequest() [libxul.so` 4; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3; `nsINode::GetMutationObservers() [libxul.so]` 3
  - GC/CC markers: CCSlice 1× 5 ms
  - WebRender/compositor threads: Renderer 42 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 18, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 5); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `webrender::render_backend::RenderBackend::process_` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 10 ms (top self: `rmdir [libc.so.6]` 5, `unlink [libc.so.6]` 3, `getdents64 [libc.so.6]` 2); BackgroundThreadPool #2 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, poll_wait 13, js_ctypes 13, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 13; `nsTArray_base<nsTArray_RelocateUsingMemutils>::Mov` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 0; `js::jit::DoCallFallback(JSContext*, js::jit::Basel` 0
- **tab:9340** CPU ms by thread group: main 27, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 27 ms (9.3% of span): JavaScript 10, Other 9, Idle 4, GC / CC 2, Profiler 2, DOM 1
  - JS leaf 1 / native under JS 9 / native 18; buckets: ipc 23, paint_layout 9, gc_cc 8, subprocess_pipe_io 4, poll_wait 4, harness_diagnostics 1, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[]` 3; `mozJSModuleLoader::GetSourceFile(nsIURI*, nsIFile**) [libxul` 3; `RemoveSkippableVisitor::Visit(nsPurpleBuffer&, nsPurpleBuffe` 1; `js::SharedPropMap::addPropertyInternal(JSContext*, JS::Mutab` 1; `js::frontend::BytecodeEmitter::emitJumpTargetOp(JSOp, js::fr` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:8861** CPU ms by thread group: main 4, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (1.5% of span): Idle 4, DOM 1, Other 0
  - JS leaf 0 / native under JS 1 / native 4; buckets: ipc 5, poll_wait 4, array_buffer_copy 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:9483** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

