# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **85.4** (main 37.4, Renderer 32.0, DOM Worker 10.7, WRScene~ilder# 5.3) | cef:renderer 26.7, AxioCEFProbe 26.6, cef:utility 5.3 | — | 136.2 |
| plain | idle | — | — | **4.8** (main 3.8, Timer 0.5, DOM Worker 0.5) | Web Content 3.3, AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.0 | 22.1 | **25.6** (main 9.7, DOM Worker 3.5, Renderer 2.6, Backgro~Pool # 2.3, WRRende~ckend# 1.3) | cef:renderer 10.9, AxioCEFProbe 6.2, cef:gpu-process 5.8, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.9** (main 5.6, DOM Worker 3.3, Renderer 2.3, WRRende~ckend# 1.7, SwComposite 1.7) | cef:renderer 11.3, AxioCEFProbe 6.6, cef:gpu-process 6.2 | — | — |
| plain | scroll | 59.9 | 20.8 | **36.8** (main 17.4, DOM Worker 8.2, Backgro~Pool # 2.9, Renderer 1.9, WRRende~ckend# 1.4) | cef:gpu-process 20.3, cef:renderer 11.1, AxioCEFProbe 8.2 | — | — |
| plain | key | — | — | **16.6** (main 9.6, Renderer 1.4, DOM Worker 1.4, Timer 1.1, TaskCon~ller # 1.1) | cef:renderer 2.2, AxioCEFProbe 2.1, cef:gpu-process 0.5, WebExtensions 0.3 | 13.3 | — |
| plain | switch-to-gecko | — | — | **36.0** (main 12.0, glean.dispatche 6.0, IPC I/O Parent 6.0, Renderer 6.0, DOM Worker 6.0) |  | — | 134.0 |
| profile | switch-to-engine | — | — | **86.9** (main 38.7, Renderer 19.3, SamplerThread 9.7, WRRende~ckend# 4.8, Compositor 4.8) | AxioCEFProbe 33.7, cef:renderer 24.2, WebExtensions 4.8, Isolated Web Co 4.8 | — | 145.9 |
| profile | idle | — | — | **150.3** (DOM Worker 46.7, main 31.3, IndexedDB IO # 17.7, Indexed~ IO # 14.5, IPDL Background 13.5) | Web Content 9.3, Isolated Web Co 2.3, WebExtensions 1.9, RDD Process 1.9 | — | — |
| profile | raf | 60.0 | 21.1 | **53.7** (DOM Worker 12.8, main 12.5, SamplerThread 11.8, Renderer 3.2, Backgro~Pool # 2.6) | cef:renderer 10.5, Web Content 9.3, AxioCEFProbe 6.4, cef:gpu-process 5.4 | — | — |
| profile | raf-nosampler | — | — | **47.1** (DOM Worker 15.5, SamplerThread 10.9, main 7.6, Renderer 3.0, Compositor 2.0) | cef:renderer 11.9, Web Content 9.9, AxioCEFProbe 6.0, cef:gpu-process 5.6 | — | — |
| profile | scroll | 60.1 | 21.1 | **71.1** (main 24.3, DOM Worker 17.6, SamplerThread 11.9, Renderer 3.3, Backgro~Pool # 2.9) | cef:gpu-process 23.4, cef:renderer 11.5, Web Content 10.0, AxioCEFProbe 8.6 | — | — |
| profile | key | — | — | **37.6** (main 11.7, DOM Worker 9.8, SamplerThread 9.5, Timer 1.6, Renderer 1.6) | Web Content 9.5, AxioCEFProbe 2.4, cef:renderer 2.4, Isolated Web Co 2.2 | 15.8 | — |
| profile | switch-to-gecko | — | — | **6.7** (SamplerThread 3.4, main 1.5, TaskCon~ller # 0.7, DOM Worker 0.4, Renderer 0.1) | Web Content 8.5, WebExtensions 1.8, Privileged Cont 1.7, Isolated Web Co 1.6 | — | 15033.6 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 8.2 | 0.0 | 0 | 0.0 | — | — | 3.4 | 0.0 | — | 5.21 | 0.68 | — | — | — | — | — | 0.006 |
| profile | raf | 60.1 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.19 | 0.16 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 59.4 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.18 | 0.17 | — | — | — | — | — | 0.011 |
| profile | scroll | 58.7 | 0.0 | 0 | 0.0 | — | — | 6.7 | 0.0 | — | 0.34 | 0.17 | — | — | — | — | — | 0.011 |
| profile | key | 5.7 | 0.0 | 0 | 0.0 | — | — | 5.9 | 0.0 | — | 0.60 | 0.16 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.932 | 2.494 | 0.0083 | 0.0222 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 188 | 189 | 0.052 | 0.249 | 0.0031 | 0.0150 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.057 | 0.247 | 0.0034 | 0.0148 |
| plain | scroll | memfd | native | 121 | 121 | 0.175 | 0.222 | 0.0101 | 0.0128 |
| plain | key | memfd | native | 21 | 21 | 0.017 | 0.253 | 0.0001 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 3.557 | 3.039 | 0.0292 | 0.0249 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 189 | 189 | 0.062 | 0.277 | 0.0037 | 0.0166 |
| profile | raf-nosampler | memfd | native | 182 | 182 | 0.060 | 0.279 | 0.0035 | 0.0166 |
| profile | scroll | memfd | native | 124 | 124 | 0.215 | 0.249 | 0.0125 | 0.0145 |
| profile | key | memfd | native | 21 | 21 | 0.019 | 0.278 | 0.0001 | 0.0016 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.7 | 10.8 | 0.1 | — | 0.61 | 1.03 | — | — | 6.9 | 12.4 | 20.7 |

Switch timeline (profile, switch-to-engine, ms after the window start): write create 49.5; first stdout read resolved 67.6; first frame applied (native receiver) 172.1; write frame_ack 173.2; write focus 184.3

Switch timeline (profile, switch-to-gecko, ms after the window start): write close 38.6; first stdout read resolved 56.5; write shutdown 59.3

### Profile: chromium / switch-to-engine

- **parent** CPU ms by thread group: main 79, Renderer 33, DOM Worker 14, BgPool 6, WRRenderBackend 4, WRSceneBuilder 4, Compositor 4, SwComposite 2, IPC I/O 1, Socket 1, WRWorker 1, ImageBridge 0, other 0, Canvas 0, ImageIO 0
  - main thread 79 ms (32.8% of span): Layout 33, Idle 21, JavaScript 14, Other 4, DOM 4, Graphics 3
  - JS leaf 1 / native under JS 38 / native 41; buckets: ipc 79, paint_layout 40, poll_wait 22, gc_cc 21, array_buffer_copy 12, harness_diagnostics 7, subprocess_pipe_io 4, worker_messaging 3
  - top self: `poll [libc.so.6]` 21; `style::properties::cascade::cascade_rules [libxul.so]` 5; `core::ptr::drop_in_place<style::values::generics::length::Ge` 4; `__lll_lock_wake [libc.so.6]` 4; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 4; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 3
  - WebRender/compositor threads: Renderer 33 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 7, `<webrender::compositor::sw_compositor::SwComposito` 5, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 5); WRRenderBackend#0 4 ms (top self: `syscall [libc.so.6]` 2, `hashbrown::map::HashMap<K,V,S,A>::insert [libxul.s` 1, `sched_yield [libc.so.6]` 1); WRSceneBuilder#0 4 ms (top self: `syscall [libc.so.6]` 3, `sched_yield [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #2 6 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `__memset_avx2_unaligned_erms [libc.so.6]` 1, `ARGBSetRow_X86 [libxul.so]` 1); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 14 ms: buckets subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 13, poll_wait 13, array_buffer_copy 0; top self: `poll [libc.so.6]` 13; `mozilla::dom::TimeoutManager::SetTimeout(mozilla::` 0; `[unknown]` 0; `WriteStructuredClone(JSContext*, JS::Handle<JS::Va` 0; `__lll_lock_wake [libc.so.6]` 0
- **tab:4048** CPU ms by thread group: main 44, IPC I/O 1, other 0, ImageBridge 0, Socket 0, BgPool 0, ImageIO 0
  - main thread 44 ms (18.2% of span): Other 34, DOM 4, Profiler 3, JavaScript 2, GC / CC 1, Idle 0
  - JS leaf 0 / native under JS 6 / native 39; buckets: ipc 31, array_buffer_copy 14, gc_cc 10, subprocess_pipe_io 3, poll_wait 1, memcpy_memset 1
  - top self: `__strlen_avx2 [libc.so.6]` 4; `[]` 3; `[libexpat.so.1]` 3; `mozilla::detail::RunnableFunction<mozilla::CallbackThreadReg` 2; `[libfontconfig.so.1]` 2; `__lll_lock_wait [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3862** CPU ms by thread group: main 4, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (1.6% of span): Idle 3, Graphics 1, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 3, poll_wait 3, paint_layout 1
  - top self: `poll [libc.so.6]` 3; `mozilla::gfx::ToDeviceColor(mozilla::gfx::sRGBColor const&) ` 1; `[]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `<firefox_on_glean::private::labeled_counter::LabeledCounterM` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4053** CPU ms by thread group: other 0, main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `poll [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / idle

- **parent** CPU ms by thread group: DOM Worker 892, main 644, other 21, Socket 16, BgPool 9, IPC I/O 1, Renderer 0, WRWorker 0, WRSceneBuilder 0, WRRenderBackend 0, Canvas 0, Compositor 0, ImageIO 0, ImageBridge 0, SwComposite 0
  - main thread 643 ms (29.6% of span): JavaScript 196, DOM 147, Idle 145, Other 113, Profiler 17, GC / CC 13
  - JS leaf 33 / native under JS 276 / native 335; buckets: ipc 643, gc_cc 308, poll_wait 194, array_buffer_copy 127, memcpy_memset 36, harness_diagnostics 16, worker_messaging 13, json_metadata 8
  - top self: `poll [libc.so.6]` 150; `[axiosozo-dev]` 34; `[unknown]` 33; `__memmove_avx_unaligned_erms [libc.so.6]` 32; `recvmsg [libc.so.6]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 11
  - GC/CC markers: GCMinor 5× 15 ms
  - WebRender/compositor threads: Renderer 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); WRWorker#0 0 ms (top self: `syscall [libc.so.6]` 0); WRWorker#1 0 ms (top self: `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #2 5 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `<base64::engine::general_purpose::GeneralPurpose a` 1, `<rkv::backend::impl_safe::transaction::RwTransacti` 1); BgIOThreadPool #2 4 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3, `rename [libc.so.6]` 1, `write [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 754 ms: buckets worker_messaging 753, ipc 751, gc_cc 189, poll_wait 157, array_buffer_copy 82, memcpy_memset 28; top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 138; `[unknown]` 113; `jsesc (resource://gre/modules/third_party/jsesc/js` 53; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 40; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 36
- **tab:3604** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.2% of span): Idle 4, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4, array_buffer_copy 0, gc_cc 0
  - top self: `poll [libc.so.6]` 4; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3506** CPU ms by thread group: main 3, IPC I/O 2, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.1% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 0; `mozilla::CheckIdleMemoryCleanupNeeded(nsITimer*, void*) [lib` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **utility:3655** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `poll [libc.so.6]` 2

### Profile: chromium / raf

- **parent** CPU ms by thread group: main 358, DOM Worker 299, Renderer 85, BgPool 69, WRRenderBackend 49, SwComposite 43, Compositor 42, other 33, ImageBridge 18, WRSceneBuilder 9, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 358 ms (11.3% of span): Idle 229, JavaScript 73, Other 27, DOM 19, Profiler 6, GC / CC 4
  - JS leaf 12 / native under JS 79 / native 268; buckets: ipc 358, poll_wait 241, gc_cc 85, worker_messaging 47, engine_stream_read 46, json_metadata 23, native_receiver 20, subprocess_pipe_io 16
  - top self: `poll [libc.so.6]` 230; `[unknown]` 9; `[axiosozo-dev]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `js::SharedShape::getInitialShape(JSContext*, JSClass const*,` 4; `mprotect [libc.so.6]` 3
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 85 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 66, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `syscall [libc.so.6]` 4); WRRenderBackend#0 49 ms (top self: `syscall [libc.so.6]` 42, `sched_yield [libc.so.6]` 2, `webrender::tile_cache::TileCacheInstance::update_p` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 41, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 69 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 62, `__memmove_avx_unaligned_erms [libc.so.6]` 5, `__lll_lock_wake [libc.so.6]` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `[linux-vdso.so.1]` 0, `mozilla::ProfileBufferBlockIndex profiler_add_mark` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 298 ms: buckets subprocess_pipe_io 298, worker_messaging 298, ipc 298, js_ctypes 284, poll_wait 279, gc_cc 8; top self: `poll [libc.so.6]` 279; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 2; `write [libc.so.6]` 1; `js::gc::TenuringTracer::collectToObjectFixedPoint(` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Ha` 1
- **tab:3862** CPU ms by thread group: main 4, other 1, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 4 ms (0.1% of span): Idle 2, GC / CC 2
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 2, gc_cc 2
  - top self: `poll [libc.so.6]` 2; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 1; `clock_gettime@GLIBC_2.2.5 [libc.so.6]` 0; `gecko_profiler_add_marker [libxul.so]` 0
  - GC/CC markers: GCMajor 1× 34 ms, GCSlice 4× 1 ms, CCSlice 1× 1 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3586** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `MessageLoop::EventTarget::IsOnCurrentThreadInfallible() [lib` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4048** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / raf-nosampler

- **parent** CPU ms by thread group: DOM Worker 356, main 218, Renderer 79, BgPool 66, WRRenderBackend 46, SwComposite 43, Compositor 42, ImageBridge 18, WRSceneBuilder 8, other 2, IPC I/O 1, Socket 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 218 ms (7.1% of span): Idle 113, JavaScript 60, Other 26, DOM 10, GC / CC 5, Profiler 4
  - JS leaf 7 / native under JS 59 / native 153; buckets: ipc 218, poll_wait 124, gc_cc 72, worker_messaging 43, engine_stream_read 40, subprocess_pipe_io 18, json_metadata 17, array_buffer_copy 14
  - top self: `poll [libc.so.6]` 115; `[unknown]` 12; `write [libc.so.6]` 3; `recvmsg [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, J` 2
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 79 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 55, `__memmove_avx_unaligned_erms [libc.so.6]` 10, `void scale_blit<true>(Texture&, IntRect const&, Te` 5); WRRenderBackend#0 46 ms (top self: `syscall [libc.so.6]` 42, `[axiosozo-dev]` 1, `sched_yield [libc.so.6]` 1); SwComposite 43 ms (top self: `syscall [libc.so.6]` 42, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 0)
  - background pools (native receiver queue): BackgroundThreadPool #3 66 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 61, `__memmove_avx_unaligned_erms [libc.so.6]` 4, `profiler_get_core_buffer() [libxul.so]` 0); ImageBridgeChld 18 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 18, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0, `mozilla::ipc::MessageChannel::DispatchAsyncMessage` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 351 ms: buckets subprocess_pipe_io 351, worker_messaging 351, ipc 351, js_ctypes 272, poll_wait 264, gc_cc 65; top self: `poll [libc.so.6]` 264; `[axiosozo-dev]` 7; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBu` 6; `madvise [libc.so.6]` 6; `mozilla::dom::Timeout::~Timeout() [libxul.so]` 4
- **tab:3867** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4048** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / scroll

- **parent** CPU ms by thread group: main 478, DOM Worker 292, BgPool 60, Renderer 57, WRRenderBackend 34, Compositor 28, SwComposite 27, other 22, ImageBridge 13, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 478 ms (22.4% of span): Idle 265, JavaScript 89, Other 63, DOM 23, Graphics 21, Profiler 9
  - JS leaf 10 / native under JS 93 / native 375; buckets: ipc 478, poll_wait 346, gc_cc 96, worker_messaging 50, paint_layout 50, engine_stream_read 34, array_buffer_copy 21, json_metadata 21
  - top self: `poll [libc.so.6]` 274; `[unknown]` 15; `[axiosozo-dev]` 9; `recvmsg [libc.so.6]` 6; `write [libc.so.6]` 6; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - WebRender/compositor threads: Renderer 57 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 43, `syscall [libc.so.6]` 4, `writev [libc.so.6]` 4); WRRenderBackend#0 34 ms (top self: `syscall [libc.so.6]` 29, `sched_yield [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0); SwComposite 27 ms (top self: `syscall [libc.so.6]` 27)
  - background pools (native receiver queue): BackgroundThreadPool #3 60 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 52, `__memmove_avx_unaligned_erms [libc.so.6]` 6, `__lll_lock_wake [libc.so.6]` 1); ImageBridgeChld 13 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 12, `[linux-vdso.so.1]` 0, `mozilla::layers::PImageBridgeChild::OnMessageRecei` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 291 ms: buckets subprocess_pipe_io 291, worker_messaging 289, ipc 289, js_ctypes 249, poll_wait 241, gc_cc 17; top self: `poll [libc.so.6]` 241; `[unknown]` 4; `[axiosozo-dev]` 4; `write [libc.so.6]` 3; `getcontext [libc.so.6]` 2
- **tab:3862** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3586** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: poll_wait 0, ipc 0
  - top self: `poll [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / key

- **parent** CPU ms by thread group: main 388, DOM Worker 258, Renderer 56, other 36, SwComposite 16, Compositor 15, WRRenderBackend 14, WRWorker 11, WRSceneBuilder 9, BgPool 7, IPC I/O 2, ImageBridge 2, Socket 1, Canvas 0, ImageIO 0
  - main thread 388 ms (10.5% of span): Idle 158, JavaScript 76, Other 39, Layout 35, Graphics 33, DOM 29
  - JS leaf 13 / native under JS 135 / native 240; buckets: ipc 388, poll_wait 201, gc_cc 96, paint_layout 82, worker_messaging 75, engine_stream_read 45, subprocess_pipe_io 31, array_buffer_copy 20
  - top self: `poll [libc.so.6]` 161; `[unknown]` 20; `recvmsg [libc.so.6]` 9; `[axiosozo-dev]` 9; `write [libc.so.6]` 8; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4
  - GC/CC markers: CCSlice 2× 4 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 56 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 20, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 15, `hypotf@@GLIBC_2.35 [libm.so.6]` 4); SwComposite 16 ms (top self: `syscall [libc.so.6]` 15, `__memmove_avx_unaligned_erms [libc.so.6]` 1, `[libxul.so]` 0); WRRenderBackend#0 14 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `<core::hash::sip::Hasher<S> as core::hash::Hasher>` 1)
  - background pools (native receiver queue): BackgroundThreadPool #3 7 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 7, `__memmove_avx_unaligned_erms [libc.so.6]` 0); ImageBridgeChld 2 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2, `mozilla::AtomicRefCountedWithFinalize<mozilla::lay` 0); BgIOThreadPool #2 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 258 ms: buckets subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 242, poll_wait 237, gc_cc 4; top self: `poll [libc.so.6]` 237; `[unknown]` 3; `ffi_call_plan_invoke [libxul.so]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `mozilla::baseprofiler::profiler_current_thread_id(` 1
- **tab:3506** CPU ms by thread group: main 7, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 7 ms (0.2% of span): Idle 5, JavaScript 1, Profiler 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 1 / native 6; buckets: ipc 7, poll_wait 5, array_buffer_copy 2, gc_cc 1
  - top self: `poll [libc.so.6]` 5; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuff` 0; `nsContentUtils::SubjectPrincipal() [libxul.so]` 0; `XPCWrappedNativeScope::GetExpandoChain(JS::Handle<JSObject*>` 0; `js::fun_apply(JSContext*, unsigned int, JS::Value*) [libxul.` 0; `lazyGetter (resource://gre/modules/XPCOMUtils.sys.mjs:237:24` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4053** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `poll [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

### Profile: chromium / switch-to-gecko

- **parent** CPU ms by thread group: main 230, DOM Worker 86, Renderer 20, BgPool 10, IPC I/O 6, Compositor 4, WRRenderBackend 3, other 2, WRSceneBuilder 2, SwComposite 1, Socket 1, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 230 ms (1.5% of span): GC / CC 134, JavaScript 34, Idle 24, Layout 15, Other 13, Profiler 4
  - JS leaf 1 / native under JS 50 / native 179; buckets: ipc 230, gc_cc 161, poll_wait 30, paint_layout 22, array_buffer_copy 12, memcpy_memset 12, harness_diagnostics 11, worker_messaging 9
  - top self: `poll [libc.so.6]` 27; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 24; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS:` 8; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 8; `[axiosozo-dev]` 7; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned in` 7
  - GC/CC markers: GCMajor 3× 193 ms, GCSlice 12× 83 ms, CCSlice 3× 48 ms, GCMinor 3× 1 ms, CC 3× 0 ms
  - WebRender/compositor threads: Renderer 20 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 5, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 3, `__futex_abstimed_wait_cancelable64 [libc.so.6]` 3); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::frame_builder::FrameBuilder::build [lib` 0, `webrender::clip::ClipStore::set_active_clips [libx` 0); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0, `webrender::scene_builder_thread::SceneBuilderThrea` 0)
  - background pools (native receiver queue): BgIOThreadPool #2 9 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 2, `__open_nocancel [libc.so.6]` 1); BackgroundThreadPool #2 1 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1); BackgroundThreadPool #3 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
  - busiest DOM Worker 46 ms: buckets subprocess_pipe_io 46, worker_messaging 45, ipc 45, gc_cc 32, poll_wait 14, js_ctypes 12; top self: `poll [libc.so.6]` 12; `[axiosozo-dev]` 8; `madvise [libc.so.6]` 5; `syscall [libc.so.6]` 3; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 2
- **tab:3862** CPU ms by thread group: main 5, IPC I/O 1, other 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 5 ms (0.0% of span): Idle 5, Layout 0, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 5; buckets: ipc 5, poll_wait 5, paint_layout 0
  - top self: `poll [libc.so.6]` 5; `ProfilingStack::pushLabelFrame(char const*, char const*, voi` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `webrtc::video_coding::DecodedFramesHistory::GetLastDecodedFr` 0; `txMozillaXSLTProcessor::Release() [libxul.so]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:3604** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)
- **tab:4053** CPU ms by thread group: main 3, other 2, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 3 ms (0.0% of span): Idle 3, Other 0
  - JS leaf 0 / native under JS 0 / native 3; buckets: ipc 3, poll_wait 3
  - top self: `poll [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__strlen_avx2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0)

