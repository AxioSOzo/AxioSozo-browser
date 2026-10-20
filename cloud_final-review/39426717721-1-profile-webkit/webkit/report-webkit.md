# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **54.1** (Renderer 24.9, main 16.6, glean.dispatche 4.2, Compositor 4.2, DOM Worker 4.2) | WPEWebProcess 70.7, WPENetworkProce 12.5, Isolated Web Co 8.3, AxioWebKitHost 4.2 | — | 206.1 |
| plain | idle | — | — | **7.3** (main 6.3, Timer 0.5, TaskCon~ller # 0.5) | Web Content 4.3 | — | — |
| plain | raf | 58.2 | 23.9 | **21.3** (main 10.1, DOM Worker 2.3, Renderer 1.9, SwComposite 1.3, TaskCon~ller # 1.0) | WPEWebProcess 61.3, AxioWebKitHost 6.7, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.8** (main 4.6, DOM Worker 2.7, Renderer 2.3, glean.dispatche 1.3, WRRende~ckend# 1.3) | WPEWebProcess 59.6, AxioWebKitHost 5.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 57.7 | 31.2 | **40.1** (main 19.3, DOM Worker 7.2, TaskCon~ller # 2.9, Backgro~Pool # 2.9, Renderer 1.9) | WPEWebProcess 65.8, AxioWebKitHost 8.7, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **15.9** (main 10.7, Renderer 1.4, TaskCon~ller # 0.8, DOM Worker 0.8, Timer 0.5) | WPEWebProcess 6.6, AxioWebKitHost 1.4 | 17.1 | — |
| plain | switch-to-gecko | — | — | **20.9** (main 8.3, BgIOThr~Pool # 4.2, WRScene~ilder# 4.2, DOM Worker 4.2) |  | — | 213.7 |
| trace | switch-to-engine | — | — | **33.2** (Renderer 13.3, main 10.0, Softwar~cThread 3.3, WRScene~ilder# 3.3, WRRende~ckend# 3.3) | WPEWebProcess 63.2, WPENetworkProce 13.3, AxioWebKitHost 3.3 | — | 272.7 |
| trace | idle | — | — | **11.5** (main 8.7, Timer 1.4, TaskCon~ller # 1.4) | Web Content 1.9, AxioWebKitHost 1.0 | — | — |
| trace | raf | 58.1 | 25.3 | **35.2** (main 17.2, DOM Worker 4.2, TaskCon~ller # 3.2, Renderer 2.3, WRRende~ckend# 1.6) | WPEWebProcess 62.2, AxioWebKitHost 6.7, Isolated Web Co 0.6, WebExtensions 0.3 | — | — |
| trace | raf-nosampler | — | — | **18.5** (main 4.6, DOM Worker 4.3, Renderer 2.0, Backgro~Pool # 1.3, glean.dispatche 1.0) | WPEWebProcess 63.4, AxioWebKitHost 7.3 | — | — |
| trace | scroll | 56.0 | 34.6 | **39.3** (main 19.9, DOM Worker 6.8, Renderer 2.4, Backgro~Pool # 2.4, TaskCon~ller # 1.9) | WPEWebProcess 67.5, AxioWebKitHost 9.3 | — | — |
| trace | key | — | — | **20.1** (main 12.1, TaskCon~ller # 1.9, DOM Worker 1.4, Timer 1.1, Renderer 1.1) | WPEWebProcess 6.9, AxioWebKitHost 1.4, Web Content 0.3 | 16.4 | — |
| trace | switch-to-gecko | — | — | **28.2** (main 12.1, Renderer 8.1, glean.dispatche 4.0, BgIOThr~Pool # 4.0) | Isolated Web Co 8.1 | — | 213.8 |
| profile | switch-to-engine | — | — | **42.0** (main 12.0, DOM Worker 12.0, SamplerThread 9.0, Renderer 3.0, Compositor 3.0) | WPEWebProcess 63.2, Web Content 33.1, WPENetworkProce 9.0, AxioWebKitHost 3.0 | — | 295.4 |
| profile | idle | — | — | **26.7** (main 8.6, DOM Worker 8.1, SamplerThread 8.1, Timer 1.4, TaskCon~ller # 0.5) | Web Content 9.1, WebExtensions 1.9, Isolated Web Co 1.9, Socket Process 1.4 | — | — |
| profile | raf | 58.0 | 21.1 | **45.9** (main 13.8, DOM Worker 10.6, SamplerThread 9.7, Renderer 2.9, Timer 1.6) | WPEWebProcess 63.7, Web Content 8.7, AxioWebKitHost 6.7, WebExtensions 1.6 | — | — |
| profile | raf-nosampler | — | — | **37.9** (DOM Worker 10.9, SamplerThread 8.3, main 6.6, Renderer 3.0, WRRende~ckend# 1.7) | WPEWebProcess 63.2, Web Content 7.9, AxioWebKitHost 6.6, WebExtensions 1.7 | — | — |
| profile | scroll | 57.0 | 33.8 | **62.4** (main 25.0, DOM Worker 13.9, SamplerThread 9.6, Renderer 2.9, Backgro~Pool # 2.9) | WPEWebProcess 66.3, AxioWebKitHost 9.6, Web Content 7.2, Socket Process 1.4 | — | — |
| profile | key | — | — | **45.2** (main 17.2, DOM Worker 9.8, SamplerThread 9.5, TaskCon~ller # 2.7, Timer 1.6) | Web Content 9.8, WPEWebProcess 6.9, Isolated Web Co 2.2, WebExtensions 2.2 | 19.2 | — |
| profile | switch-to-gecko | — | — | **51.9** (main 15.9, Renderer 8.0, DOM Worker 8.0, SamplerThread 8.0, IPC I/O Parent 4.0) | Isolated Web Co 8.0 | — | 220.7 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | switch-to-engine | 6.3 | 0.0 | 0 | 0.0 | — | — | 74.7 | 0.0 | — | 1.28 | 0.43 | — | — | — | — | — | 0.003 |
| trace | raf | 57.6 | 0.0 | 0 | 0.0 | — | — | 16.5 | 0.0 | — | 0.13 | 0.11 | — | — | — | — | — | 0.007 |
| trace | raf-nosampler | 57.4 | 0.0 | 0 | 0.0 | — | — | 16.6 | 0.0 | — | 0.14 | 0.11 | — | — | — | — | — | 0.007 |
| trace | scroll | 54.8 | 0.0 | 0 | 0.0 | — | — | 11.0 | 0.0 | — | 0.29 | 0.11 | — | — | — | — | — | 0.006 |
| trace | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 6.5 | 0.0 | — | 0.10 | 0.11 | — | — | — | — | — | 0.001 |
| profile | switch-to-engine | 5.5 | 0.0 | 0 | 0.0 | — | — | 89.4 | 0.0 | — | 2.01 | 0.61 | — | — | — | — | — | 0.003 |
| profile | raf | 58.2 | 0.0 | 0 | 0.0 | — | — | 16.4 | 0.0 | — | 0.14 | 0.14 | — | — | — | — | — | 0.009 |
| profile | raf-nosampler | 57.8 | 0.0 | 0 | 0.0 | — | — | 16.3 | 0.0 | — | 0.16 | 0.15 | — | — | — | — | — | 0.010 |
| profile | scroll | 55.7 | 0.0 | 0 | 0.0 | — | — | 13.2 | 0.0 | — | 0.36 | 0.15 | — | — | — | — | — | 0.010 |
| profile | key | 5.4 | 0.0 | 0 | 0.0 | — | — | 6.0 | 0.0 | — | 0.12 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.841 | 1.560 | 0.0064 | 0.0119 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.035 | 0.068 | 0.0020 | 0.0039 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.053 | 0.094 | 0.0030 | 0.0055 |
| plain | scroll | memfd | native | 117 | 117 | 0.172 | 0.245 | 0.0096 | 0.0137 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.068 | 0.0000 | 0.0004 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| trace | switch-to-engine | memfd | native | 2 | 2 | 0.894 | 1.696 | 0.0056 | 0.0106 |
| trace | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| trace | raf | memfd | native | 180 | 180 | 0.042 | 0.084 | 0.0024 | 0.0049 |
| trace | raf-nosampler | memfd | native | 175 | 175 | 0.049 | 0.090 | 0.0028 | 0.0052 |
| trace | scroll | memfd | native | 114 | 114 | 0.189 | 0.229 | 0.0104 | 0.0125 |
| trace | key | memfd | native | 20 | 20 | 0.001 | 0.073 | 0.0000 | 0.0004 |
| trace | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 1.146 | 2.109 | 0.0063 | 0.0117 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 181 | 181 | 0.046 | 0.080 | 0.0027 | 0.0046 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.054 | 0.099 | 0.0031 | 0.0057 |
| profile | scroll | memfd | native | 117 | 117 | 0.233 | 0.254 | 0.0130 | 0.0142 |
| profile | key | memfd | native | 20 | 20 | 0.001 | 0.109 | 0.0000 | 0.0006 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | 0.5 | 12.9 | 0.0 | — | 0.10 | 0.30 | — | — | 14.8 | 13.6 | 31.6 |
| profile | 0.6 | 15.9 | 0.0 | — | 0.12 | 0.46 | — | — | 10.3 | 16.8 | 26.3 |

Switch timeline (trace, switch-to-engine, ms after the window start): write create 22.6; first stdout read resolved 24.1; first frame applied (native receiver) 288.0; write frame_ack 288.6; write visibility 292.5; write focus 292.7

Switch timeline (trace, switch-to-gecko, ms after the window start): write shutdown 17.7; first stdout read resolved 23.0

Switch timeline (profile, switch-to-engine, ms after the window start): write create 38.4; first stdout read resolved 46.7; first frame applied (native receiver) 318.8; write frame_ack 319.9; write visibility 327.2; write focus 327.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 30.8; first stdout read resolved 39.4

### Profile: webkit / switch-to-engine

- **parent** CPU ms by thread group: main 38, DOM Worker 25, Renderer 18, BgPool 6, Compositor 3, WRRenderBackend 3, IPC I/O 2, WRSceneBuilder 2, SwComposite 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 38 ms (10.7% of span): JavaScript 15, Idle 11, Layout 6, Graphics 3, Other 1, DOM 1
  - JS leaf 0 / native under JS 20 / native 19; buckets: ipc 38, gc_cc 12, poll_wait 12, array_buffer_copy 9, paint_layout 8, harness_diagnostics 8, engine_stream_read 4, worker_messaging 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 12; `JS::AddAssociatedMemory(JSObject*, unsigned long, JS::Memory` 2; `XPCNativeSet::FindMember(JS::Handle<JS::PropertyKey>, XPCNat` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 2; `mozilla::ReflowInput::InitConstraints(nsPresContext*, mozill` 2; `[axiosozo-dev]` 1
  - WebRender/compositor threads: Renderer 18 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `ClearTexSubImage [libxul.so]` 4, `__syscall_cancel_arch [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 6 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `ARGBSetRow_X86 [libxul.so]` 1, `__memmove_avx_unaligned_erms [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 25 ms: buckets subprocess_pipe_io 25, worker_messaging 25, ipc 25, js_ctypes 22, poll_wait 21, gc_cc 0; top self: `__syscall_cancel_arch [libc.so.6]` 21; `pthread_mutex_init@@GLIBC_2.2.5 [libc.so.6]` 3; `js::jit::JSJitFrameIter::JSJitFrameIter(js::jit::J` 0; `js::SharedShape::getInitialShape(JSContext*, JSCla` 0; `__lll_lock_wait [libc.so.6]` 0
- **tab:7878** CPU ms by thread group: main 53, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 53 ms (14.8% of span): Other 43, JavaScript 8, GC / CC 1, Idle 1, Profiler 0, DOM 0
  - JS leaf 0 / native under JS 9 / native 45; buckets: ipc 45, array_buffer_copy 18, gc_cc 12, memcpy_memset 2, subprocess_pipe_io 2, poll_wait 2
  - top self: `js::jit::CacheIRCompiler::emitCompareInt32Result(JSOp, js::j` 6; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 6; `[libfontconfig.so.1]` 4; `[]` 4; `mozilla::xpcom::StaticModule::GetFactory() const [libxul.so]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7883** CPU ms by thread group: main 40, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 40 ms (11.9% of span): Other 30, DOM 4, Profiler 2, JavaScript 2, Idle 1
  - JS leaf 0 / native under JS 5 / native 35; buckets: ipc 27, gc_cc 14, subprocess_pipe_io 6, array_buffer_copy 5, poll_wait 3, memcpy_memset 3
  - top self: `CallbackTrieNode::GetOrCreateChild(nsTSubstring<char> const&` 3; `__syscall_cancel_arch [libc.so.6]` 3; `js::frontend::BytecodeEmitter::emitStatementList(js::fronten` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `alloc::raw_vec::RawVecInner<A>::reserve::do_reserve_and_hand` 1
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7736** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.4% of span): Idle 1, Other 1
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::dom::EventCallbackDebuggerNotificationGuard::Dispat` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / idle

- **parent** CPU ms by thread group: main 158, DOM Worker 106, other 19, Socket 1, IPC I/O 0, BgPool 0, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 158 ms (7.5% of span): Idle 121, JavaScript 13, Other 12, DOM 6, GC / CC 4, Profiler 2
  - JS leaf 2 / native under JS 17 / native 139; buckets: ipc 157, poll_wait 129, harness_diagnostics 16, gc_cc 7, array_buffer_copy 6, engine_stream_read 2, native_receiver 2, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 129; `[unknown]` 3; `mprotect [libc.so.6]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `CCGraphBuilder::NoteXPCOMChild(nsISupports*) [libxul.so]` 1; `js::NurseryAwareHashMap<JSObject*, JSObject*, js::TrackedAll` 1
  - GC/CC markers: CCSlice 1× 3 ms, GCMinor 1× 2 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#3 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 106 ms: buckets subprocess_pipe_io 106, worker_messaging 106, ipc 106, js_ctypes 106, poll_wait 106, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 106; `js::ArrayObject::addDenseElementNoLengthChange(JSC` 0
- **tab:7342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `js::Nursery::wantEagerCollection() const [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf

- **parent** CPU ms by thread group: main 392, DOM Worker 253, Renderer 78, WRRenderBackend 45, Compositor 36, SwComposite 36, BgPool 29, other 29, ImageBridge 15, WRSceneBuilder 8, IPC I/O 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 392 ms (12.5% of span): Idle 261, JavaScript 75, Other 31, DOM 18, Profiler 5, GC / CC 3
  - JS leaf 7 / native under JS 85 / native 300; buckets: ipc 391, poll_wait 278, gc_cc 74, engine_stream_read 49, worker_messaging 45, harness_diagnostics 25, subprocess_pipe_io 22, array_buffer_copy 17
  - top self: `__syscall_cancel_arch [libc.so.6]` 274; `[unknown]` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 5; `[axiosozo-dev]` 4; `mprotect [libc.so.6]` 3; `encoding_rs::utf_8::convert_utf16_to_utf8_partial_inner [lib` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 78 ms (top self: `__syscall_cancel_arch [libc.so.6]` 64, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 3); WRRenderBackend#0 45 ms (top self: `syscall [libc.so.6]` 40, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 1); SwComposite 36 ms (top self: `syscall [libc.so.6]` 35, `__memmove_avx_unaligned_erms [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 29 ms (top self: `__syscall_cancel_arch [libc.so.6]` 27, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[linux-vdso.so.1]` 0); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 15); BgIOThreadPool #1 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 253 ms: buckets subprocess_pipe_io 253, worker_messaging 253, ipc 253, js_ctypes 234, poll_wait 230, gc_cc 10; top self: `__syscall_cancel_arch [libc.so.6]` 232; `[unknown]` 3; `[axiosozo-dev]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `js::gc::StoreBuffer::CellPtrEdge<JSObject>::trace(` 1
- **tab:7736** CPU ms by thread group: main 3, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 2, GC / CC 1, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 2, gc_cc 1, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `madvise [libc.so.6]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 2 ms, GCMinor 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::CycleCollectedJSContext::CleanupIDBTransactions(uns` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 260, main 202, Renderer 74, WRRenderBackend 42, SwComposite 38, Compositor 35, BgPool 34, ImageBridge 15, WRSceneBuilder 7, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 202 ms (6.6% of span): Idle 102, JavaScript 58, Other 23, DOM 13, GC / CC 3, Profiler 2
  - JS leaf 8 / native under JS 60 / native 133; buckets: ipc 202, poll_wait 113, gc_cc 75, engine_stream_read 43, worker_messaging 28, array_buffer_copy 16, native_receiver 13, subprocess_pipe_io 13
  - top self: `__syscall_cancel_arch [libc.so.6]` 110; `[unknown]` 8; `js::BlockLexicalEnvironmentObject::create(JSContext*, JS::Ha` 7; `__lll_lock_wait [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `[axiosozo-dev]` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 74 ms (top self: `__syscall_cancel_arch [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 7, `syscall [libc.so.6]` 3); WRRenderBackend#0 42 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 2, `webrender::tile_cache::TileCacheInstance::update_p` 1); SwComposite 38 ms (top self: `syscall [libc.so.6]` 36, `__memmove_avx_unaligned_erms [libc.so.6]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #3 32 ms (top self: `__syscall_cancel_arch [libc.so.6]` 30, `__memmove_avx_unaligned_erms [libc.so.6]` 2, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 15 ms (top self: `__syscall_cancel_arch [libc.so.6]` 14, `nsThread::ProcessNextEvent(bool, bool*) [libxul.so` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 1 ms (top self: `rename [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 246 ms: buckets subprocess_pipe_io 246, worker_messaging 246, ipc 246, js_ctypes 230, poll_wait 223, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 226; `[axiosozo-dev]` 4; `js::ctypes::CDataArrayProxyHandler::get(JSContext*` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7342** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7383** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / scroll

- **parent** CPU ms by thread group: main 482, DOM Worker 235, BgPool 58, Renderer 52, WRRenderBackend 33, SwComposite 24, Compositor 24, other 20, ImageBridge 10, WRSceneBuilder 5, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 482 ms (23.0% of span): Idle 258, JavaScript 103, Other 58, DOM 27, Graphics 14, Profiler 14
  - JS leaf 12 / native under JS 112 / native 358; buckets: ipc 481, poll_wait 316, gc_cc 97, engine_stream_read 68, worker_messaging 54, paint_layout 41, harness_diagnostics 38, subprocess_pipe_io 21
  - top self: `__syscall_cancel_arch [libc.so.6]` 286; `[unknown]` 20; `[axiosozo-dev]` 6; `ProfilingStack::pushLabelFrame(char const*, char const*, voi` 4; `mozilla::nsDisplayListBuilder::MarkFramesForDisplayList(nsIF` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - WebRender/compositor threads: Renderer 52 ms (top self: `__syscall_cancel_arch [libc.so.6]` 43, `syscall [libc.so.6]` 2, `__memmove_avx_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 33 ms (top self: `syscall [libc.so.6]` 28, `sched_yield [libc.so.6]` 3, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 25 ms (top self: `syscall [libc.so.6]` 24, `__memmove_avx_unaligned_erms [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 58 ms (top self: `__syscall_cancel_arch [libc.so.6]` 48, `__memmove_avx_unaligned_erms [libc.so.6]` 8, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1); ImageBridgeChld 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 10, `__lll_lock_wait [libc.so.6]` 0, `mozilla::layers::ImageBridgeChild::UpdateImageClie` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 235 ms: buckets subprocess_pipe_io 235, worker_messaging 235, ipc 235, js_ctypes 211, poll_wait 203, gc_cc 7; top self: `__syscall_cancel_arch [libc.so.6]` 203; `[axiosozo-dev]` 2; `[unknown]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1
- **tab:7342** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wake [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7742** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / key

- **parent** CPU ms by thread group: main 593, DOM Worker 260, Renderer 53, other 33, Compositor 18, SwComposite 16, WRRenderBackend 14, WRWorker 12, WRSceneBuilder 8, BgPool 2, ImageBridge 2, IPC I/O 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 593 ms (16.1% of span): Idle 240, GC / CC 92, JavaScript 88, Other 45, Layout 42, DOM 37
  - JS leaf 15 / native under JS 150 / native 428; buckets: ipc 592, poll_wait 283, gc_cc 186, paint_layout 85, worker_messaging 73, engine_stream_read 71, harness_diagnostics 33, subprocess_pipe_io 26
  - top self: `__syscall_cancel_arch [libc.so.6]` 262; `[unknown]` 13; `[axiosozo-dev]` 12; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 12; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 6; `mprotect [libc.so.6]` 5
  - GC/CC markers: GCMajor 2× 1353 ms, GCSlice 16× 69 ms, CCSlice 7× 23 ms, GCMinor 2× 3 ms, CC 2× 0 ms
  - WebRender/compositor threads: Renderer 53 ms (top self: `__syscall_cancel_arch [libc.so.6]` 25, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 9, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 4); SwComposite 16 ms (top self: `syscall [libc.so.6]` 11, `__memmove_avx_unaligned_erms [libc.so.6]` 5); WRRenderBackend#0 15 ms (top self: `syscall [libc.so.6]` 12, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 1, `webrender::frame_builder::FrameBuilder::build [lib` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `IPC::StringFromIPCMessageType(unsigned int) [libxu` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 260 ms: buckets subprocess_pipe_io 260, worker_messaging 259, ipc 259, js_ctypes 244, poll_wait 242, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 242; `[unknown]` 3; `mozilla::detail::EventQueueInternal<16ul>::GetEven` 2; `[axiosozo-dev]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 1
- **tab:7280** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 6, DOM 0, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `[linux-vdso.so.1]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 0; `JSStructuredCloneData::discardTransferables() [libxul.so]` 0; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7364** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, moz` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7383** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit / switch-to-gecko

- **parent** CPU ms by thread group: main 75, Renderer 22, DOM Worker 15, BgPool 10, WRRenderBackend 4, Compositor 3, WRSceneBuilder 3, IPC I/O 2, SwComposite 1, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 75 ms (24.8% of span): JavaScript 28, Layout 14, DOM 12, Graphics 8, Idle 5, Other 5
  - JS leaf 0 / native under JS 42 / native 33; buckets: ipc 75, paint_layout 21, array_buffer_copy 21, gc_cc 13, harness_diagnostics 9, poll_wait 7, engine_stream_read 4, worker_messaging 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 7; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 4; `mozilla::dom::Element::InternalGetAttrNameFromQName(nsTSubst` 4; `mprotect [libc.so.6]` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 3
  - WebRender/compositor threads: Renderer 22 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `int blendTextureLinearR8<true, glsl::sampler2D_imp` 4, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 1, `__lll_lock_wait [libc.so.6]` 0); WRSceneBuilder#0 3 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `webrender_api::display_list::BuiltDisplayListIter:` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 4, `getdents64 [libc.so.6]` 3, `unlink [libc.so.6]` 1); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BackgroundThreadPool #3 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `syscall [libc.so.6]` 0)
  - busiest DOM Worker 15 ms: buckets subprocess_pipe_io 15, worker_messaging 15, ipc 15, js_ctypes 14, poll_wait 13, gc_cc 1; top self: `__syscall_cancel_arch [libc.so.6]` 13; `mozilla::dom::DedicatedWorkerGlobalScope::QueryInt` 1; `TimerThread::RemoveTimer(nsTimerImpl*, mozilla::de` 0; `js::Interpret(JSContext*, js::RunState&) [libxul.s` 0; `js::ctypes::ImplicitConvert(JSContext*, JS::Handle` 0
- **tab:7736** CPU ms by thread group: main 28, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 28 ms (9.4% of span): Other 9, JavaScript 8, Idle 4, DOM 4, Layout 2, Profiler 1
  - JS leaf 0 / native under JS 8 / native 20; buckets: ipc 24, paint_layout 10, gc_cc 6, subprocess_pipe_io 4, poll_wait 4, memcpy_memset 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 2; `[]` 2; `profiler_is_locked_on_current_thread() [libxul.so]` 1; `u_terminateChars_78 [libxul.so]` 1; `js::LinkConstructorAndPrototype(JSContext*, JSObject*, JSObj` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7280** CPU ms by thread group: main 4, IPC I/O 0, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (1.2% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:7883** CPU ms by thread group: main 0, IPC I/O 0, BgPool 0, Socket 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

