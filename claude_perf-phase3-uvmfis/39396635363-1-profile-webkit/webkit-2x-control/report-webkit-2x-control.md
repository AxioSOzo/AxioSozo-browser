# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit-2x-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS, plain PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **79.3** (Renderer 48.7, main 16.2, DOM Worker 5.4, WRRende~ckend# 3.6, glean.dispatche 1.8) | WPEWebProcess 57.8, AxioWebKitHost 16.2, WPENetworkProce 10.8 | — | 536.0 |
| plain | idle | — | — | **6.5** (main 3.0, DOM Worker 2.0, Timer 1.0, TaskCon~ller # 0.5) | AxioWebKitHost 1.0 | — | — |
| plain | raf | 58.2 | 26.1 | **64.5** (Renderer 20.6, SwComposite 17.3, main 11.8, Backgro~Pool # 4.6, DOM Worker 3.3) | WPEWebProcess 178.1, AxioWebKitHost 20.3 | — | — |
| plain | raf-nosampler | — | — | **52.9** (Renderer 20.3, SwComposite 17.3, main 4.3, Backgro~Pool # 4.3, DOM Worker 2.7) | WPEWebProcess 176.1, AxioWebKitHost 20.6 | — | — |
| plain | scroll | 53.2 | 36.5 | **80.5** (main 19.4, Renderer 18.4, SwComposite 15.0, Backgro~Pool # 10.2, DOM Worker 8.7) | WPEWebProcess 188.0, AxioWebKitHost 22.8, Web Content 0.5 | — | — |
| plain | key | — | — | **17.8** (main 7.4, Renderer 3.6, SwComposite 3.3, DOM Worker 1.4, glean.dispatche 0.3) | WPEWebProcess 17.8, AxioWebKitHost 2.7 | 26.6 | — |
| plain | switch-to-gecko | — | — | **26.0** (main 13.0, Renderer 8.7, TaskCon~ller # 4.3) |  | — | 212.3 |
| plain | switch-to-engine | — | — | **79.3** (Renderer 48.7, main 16.2, DOM Worker 5.4, WRRende~ckend# 3.6, glean.dispatche 1.8) | WPEWebProcess 57.8, AxioWebKitHost 16.2, WPENetworkProce 10.8 | — | 536.0 |
| plain | idle | — | — | **6.5** (main 3.0, DOM Worker 2.0, Timer 1.0, TaskCon~ller # 0.5) | AxioWebKitHost 1.0 | — | — |
| plain | raf | 58.2 | 26.1 | **64.5** (Renderer 20.6, SwComposite 17.3, main 11.8, Backgro~Pool # 4.6, DOM Worker 3.3) | WPEWebProcess 178.1, AxioWebKitHost 20.3 | — | — |
| plain | raf-nosampler | — | — | **52.9** (Renderer 20.3, SwComposite 17.3, main 4.3, Backgro~Pool # 4.3, DOM Worker 2.7) | WPEWebProcess 176.1, AxioWebKitHost 20.6 | — | — |
| plain | scroll | 53.2 | 36.5 | **80.5** (main 19.4, Renderer 18.4, SwComposite 15.0, Backgro~Pool # 10.2, DOM Worker 8.7) | WPEWebProcess 188.0, AxioWebKitHost 22.8, Web Content 0.5 | — | — |
| plain | key | — | — | **17.8** (main 7.4, Renderer 3.6, SwComposite 3.3, DOM Worker 1.4, glean.dispatche 0.3) | WPEWebProcess 17.8, AxioWebKitHost 2.7 | 26.6 | — |
| plain | switch-to-gecko | — | — | **26.0** (main 13.0, Renderer 8.7, TaskCon~ller # 4.3) |  | — | 212.3 |
| profile | switch-to-engine | — | — | **30.6** (DOM Worker 11.9, main 8.5, SamplerThread 6.8, Backgro~Pool # 1.7, WRScene~ilder# 1.7) | WPEWebProcess 59.3, Web Content 44.1, AxioWebKitHost 18.6, WPENetworkProce 10.2 | — | 567.2 |
| profile | idle | — | — | **24.7** (main 7.4, DOM Worker 6.9, SamplerThread 6.9, Timer 2.0, Renderer 0.5) | Web Content 5.4, WebExtensions 1.5, Isolated Web Co 1.5, Privileged Cont 1.5 | — | — |
| profile | raf | 58.1 | 25.1 | **81.7** (Renderer 21.4, SwComposite 17.8, main 14.0, DOM Worker 9.1, SamplerThread 7.5) | WPEWebProcess 176.2, AxioWebKitHost 21.4, Web Content 6.5, WebExtensions 1.3 | — | — |
| profile | raf-nosampler | — | — | **72.0** (Renderer 20.9, SwComposite 17.3, DOM Worker 9.0, SamplerThread 7.0, main 6.6) | WPEWebProcess 178.2, AxioWebKitHost 21.5, Web Content 6.3, WebExtensions 1.3 | — | — |
| profile | scroll | 54.3 | 32.7 | **98.0** (main 24.2, Renderer 19.3, SwComposite 16.4, DOM Worker 14.5, Backgro~Pool # 10.1) | WPEWebProcess 184.0, AxioWebKitHost 23.2, Web Content 6.3, WebExtensions 1.4 | — | — |
| profile | key | — | — | **39.0** (main 12.6, DOM Worker 8.0, SamplerThread 7.7, Renderer 3.6, SwComposite 3.0) | WPEWebProcess 18.4, Web Content 7.4, AxioWebKitHost 2.5, WebExtensions 1.9 | 29.0 | — |
| profile | switch-to-gecko | — | — | **33.6** (main 12.6, Renderer 8.4, glean.dispatche 4.2, SwComposite 4.2, DOM Worker 4.2) | Isolated Web Co 4.2 | — | 215.3 |

Frame path (median ms per frame; hooks). recv/paint fps = frames read / surface paints per s; header wait = idle until the next AXCF header; payload read = Subprocess read(size) call → resolve; assemble = damage payload → whole frame; native apply = NativeFrameSinks.apply call → resolve (AxioFrameRing queue + main-thread hop); native resolve→ack = presenter present + ack write; tick wait = accept → rAF paint start; paint = convert + putImageData of the damage union; main-thread share = (payload reads + assembly + paints) / window.

| pass | window | recv fps | paint fps | superseded | MB/s | payload KB | damage share | header wait | payload read | assemble | native apply | native resolve→ack | tick wait | paint | convert | put | paint→MozAfterPaint | main-thread share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | switch-to-engine | 3.3 | 0.0 | 0 | 0.0 | — | — | 115.4 | 0.0 | — | 3.71 | 0.56 | — | — | — | — | — | 0.002 |
| profile | raf | 58.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.41 | 0.14 | — | — | — | — | — | 0.011 |
| profile | raf-nosampler | 58.0 | 0.0 | 0 | 0.0 | — | — | 15.8 | 0.0 | — | 0.47 | 0.16 | — | — | — | — | — | 0.011 |
| profile | scroll | 52.4 | 0.0 | 0 | 0.0 | — | — | 8.3 | 0.0 | — | 1.51 | 0.15 | — | — | — | — | — | 0.016 |
| profile | key | 5.5 | 0.0 | 0 | 0.0 | — | — | 15.5 | 0.0 | — | 0.12 | 0.13 | — | — | — | — | — | 0.001 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.201 | 2.961 | 0.0078 | 0.0105 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.304 | 0.461 | 0.0176 | 0.0268 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.268 | 0.418 | 0.0155 | 0.0242 |
| plain | scroll | memfd | native | 107 | 107 | 0.957 | 1.359 | 0.0494 | 0.0701 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.205 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.201 | 2.961 | 0.0078 | 0.0105 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 179 | 179 | 0.304 | 0.461 | 0.0176 | 0.0268 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.268 | 0.418 | 0.0155 | 0.0242 |
| plain | scroll | memfd | native | 107 | 107 | 0.957 | 1.359 | 0.0494 | 0.0701 |
| plain | key | memfd | native | 20 | 20 | 0.004 | 0.205 | 0.0000 | 0.0011 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |
| profile | switch-to-engine | memfd | native | 2 | 2 | 2.572 | 3.115 | 0.0085 | 0.0103 |
| profile | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| profile | raf | memfd | native | 180 | 180 | 0.272 | 0.532 | 0.0158 | 0.0309 |
| profile | raf-nosampler | memfd | native | 176 | 176 | 0.339 | 0.576 | 0.0197 | 0.0334 |
| profile | scroll | memfd | native | 109 | 109 | 1.193 | 1.687 | 0.0624 | 0.0883 |
| profile | key | memfd | native | 20 | 20 | 0.003 | 0.228 | 0.0000 | 0.0012 |
| profile | switch-to-gecko | — | — | — | — | — | — | — | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | native apply | received→ack (native present) | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| profile | 0.6 | 25.9 | 0.0 | — | 0.12 | 0.42 | — | — | 158.4 | 26.9 | 188.1 |

Switch timeline (profile, switch-to-engine, ms after the window start): spawn AxioWebKitHost called 25.4; spawn AxioWebKitHost resolved 49.8; write hello 54.4; first stdout read resolved 116.7; write create 122.7; first frame applied (native receiver) 573.6; write frame_ack 574.5; write visibility 581.4; write focus 581.5

Switch timeline (profile, switch-to-gecko, ms after the window start): write shutdown 18.9; first stdout read resolved 27.8

### Profile: webkit-2x-control / switch-to-engine

- **parent** CPU ms by thread group: main 44, DOM Worker 43, Renderer 13, BgPool 10, IPC I/O 3, Compositor 3, SwComposite 2, WRSceneBuilder 2, WRRenderBackend 2, Socket 1, ImageBridge 0, other 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 44 ms (7.4% of span): JavaScript 19, Idle 9, Other 6, DOM 3, Layout 3, Graphics 2
  - JS leaf 2 / native under JS 26 / native 16; buckets: ipc 44, gc_cc 22, harness_diagnostics 11, poll_wait 10, array_buffer_copy 8, paint_layout 8, engine_stream_read 6, worker_messaging 6
  - top self: `__syscall_cancel_arch [libc.so.6]` 11; `mozilla::EventTargetChainItem::HandleEvent(mozilla::EventCha` 4; `[axiosozo-dev]` 2; `[unknown]` 2; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js::SharedSh` 2; `v8::internal::regexp::IrregexpInterpreter::Result v8::intern` 2
  - WebRender/compositor threads: Renderer 13 ms (top self: `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_shaped` 2, `__syscall_cancel_arch [libc.so.6]` 1); SwComposite 2 ms (top self: `syscall [libc.so.6]` 2); WRSceneBuilder#0 2 ms (top self: `syscall [libc.so.6]` 2, `sched_yield [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 10 ms (top self: `__syscall_cancel_arch [libc.so.6]` 5, `ARGBSetRow_X86 [libxul.so]` 2, `__memset_evex_unaligned_erms [libc.so.6]` 1); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `[linux-vdso.so.1]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 43 ms: buckets subprocess_pipe_io 43, worker_messaging 43, ipc 43, poll_wait 36, js_ctypes 36, memcpy_memset 4; top self: `__syscall_cancel_arch [libc.so.6]` 36; `[axiosozo-dev]` 3; `__abort_lock_unlock [libc.so.6]` 2; `__memset_evex_unaligned_erms [libc.so.6]` 1; `bool mozilla::detail::HashTable<js::WeakHeapPtr<js` 0
- **tab:11430** CPU ms by thread group: main 49, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 49 ms (8.3% of span): Other 38, Profiler 4, DOM 4, JavaScript 2, Idle 1, GC / CC 0
  - JS leaf 0 / native under JS 5 / native 44; buckets: ipc 37, array_buffer_copy 17, gc_cc 10, subprocess_pipe_io 5, memcpy_memset 3, poll_wait 1, image_container 1
  - top self: `[]` 6; `__strcmp_evex [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `__lll_lock_wake [libc.so.6]` 2; `_uhash_put(UHashtable*, UElement, UElement, signed char, UEr` 2; `__memmove_evex_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 48, IPC I/O 1, other 0, BgPool 0, Socket 0, ImageIO 0, ImageBridge 0
  - main thread 48 ms (10.9% of span): Other 40, JavaScript 4, DOM 3, Profiler 1, GC / CC 0, Idle 0
  - JS leaf 0 / native under JS 4 / native 44; buckets: ipc 37, array_buffer_copy 17, gc_cc 11, subprocess_pipe_io 4, memcpy_memset 3, json_metadata 1, image_container 1, poll_wait 0
  - top self: `[libexpat.so.1]` 4; `__read_nocancel [libc.so.6]` 3; `syscall [libc.so.6]` 2; `PLDHashTable::MakeEntryHandle(void const*, std::nothrow_t co` 2; `__strcmp_evex [libc.so.6]` 2; `__memmove_evex_unaligned_erms [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 1 ms, GC Interrupt 3× 0 ms
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11332** CPU ms by thread group: main 2, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 2 ms (0.3% of span): Idle 2, Profiler 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / idle

- **parent** CPU ms by thread group: main 132, DOM Worker 76, other 15, Renderer 3, SwComposite 3, Compositor 2, Socket 1, IPC I/O 1, WRRenderBackend 0, WRSceneBuilder 0, BgPool 0, WRWorker 0, Canvas 0, ImageIO 0, ImageBridge 0
  - main thread 132 ms (6.4% of span): Idle 108, JavaScript 10, DOM 6, Other 5, Profiler 2, Graphics 0
  - JS leaf 2 / native under JS 13 / native 117; buckets: ipc 131, poll_wait 111, harness_diagnostics 13, array_buffer_copy 6, gc_cc 5, engine_stream_read 3, native_receiver 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 109; `[unknown]` 1; `[axiosozo-dev]` 1; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNati` 1; `PrintfAppend<char>::append(char const*, unsigned long) [libx` 1; `bool js::SCInput::readArray<unsigned char>(unsigned char*, u` 1
  - WebRender/compositor threads: Renderer 3 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1); SwComposite 3 ms (top self: `__memmove_evex_unaligned_erms [libc.so.6]` 1, `void scale_blit<true>(Texture&, IntRect const&, Te` 1, `syscall [libc.so.6]` 1); WRRenderBackend#0 0 ms (top self: `<alloc::string::String as core::fmt::Write>::write` 0, `syscall [libc.so.6]` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 76 ms: buckets subprocess_pipe_io 76, js_ctypes 76, worker_messaging 76, ipc 76, poll_wait 76; top self: `__syscall_cancel_arch [libc.so.6]` 76
- **tab:11336** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10971** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf

- **parent** CPU ms by thread group: Renderer 628, SwComposite 529, main 396, DOM Worker 229, BgPool 130, WRRenderBackend 65, Compositor 34, other 26, ImageBridge 14, WRSceneBuilder 6, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 396 ms (12.8% of span): Idle 285, JavaScript 62, Other 29, DOM 16, Profiler 4, GC / CC 2
  - JS leaf 9 / native under JS 68 / native 319; buckets: ipc 395, poll_wait 300, gc_cc 56, engine_stream_read 42, worker_messaging 30, harness_diagnostics 27, subprocess_pipe_io 16, array_buffer_copy 16
  - top self: `__syscall_cancel_arch [libc.so.6]` 300; `[unknown]` 13; `[axiosozo-dev]` 5; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.` 3; `mprotect [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 628 ms (top self: `__syscall_cancel_arch [libc.so.6]` 244, `int blendTextureNearestFast<false, glsl::sampler2D` 139, `void scale_blit<true>(Texture&, IntRect const&, Te` 104); SwComposite 529 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 241, `syscall [libc.so.6]` 215, `__memmove_evex_unaligned_erms [libc.so.6]` 67); WRRenderBackend#0 65 ms (top self: `syscall [libc.so.6]` 47, `sched_yield [libc.so.6]` 11, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 128 ms (top self: `__syscall_cancel_arch [libc.so.6]` 90, `__memmove_evex_unaligned_erms [libc.so.6]` 30, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `__lll_lock_wait [libc.so.6]` 0, `__lll_lock_wake [libc.so.6]` 0); BgIOThreadPool #1 2 ms (top self: `fstatat64 [libc.so.6]` 1, `__syscall_cancel_arch [libc.so.6]` 1)
  - busiest DOM Worker 229 ms: buckets subprocess_pipe_io 229, worker_messaging 229, ipc 229, js_ctypes 202, poll_wait 194, gc_cc 9; top self: `__syscall_cancel_arch [libc.so.6]` 197; `js::NativeGetProperty(JSContext*, JS::Handle<js::N` 3; `[axiosozo-dev]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[unknown]` 2
- **tab:10971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: poll_wait 1, ipc 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `[]` 0; `nsTSubstring<char>::Assign(nsTSubstring<char> const&) [libxu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::IdleTaskManager::DidRunTask() [libxul.so]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / raf-nosampler

- **parent** CPU ms by thread group: Renderer 584, SwComposite 511, DOM Worker 219, main 191, BgPool 142, WRRenderBackend 60, Compositor 33, ImageBridge 14, WRSceneBuilder 6, other 2, Socket 1, IPC I/O 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 191 ms (6.3% of span): Idle 120, JavaScript 37, Other 21, DOM 8, Profiler 2, GC / CC 2
  - JS leaf 4 / native under JS 36 / native 150; buckets: ipc 189, poll_wait 131, gc_cc 48, engine_stream_read 32, worker_messaging 24, array_buffer_copy 11, subprocess_pipe_io 8, native_receiver 7
  - top self: `__syscall_cancel_arch [libc.so.6]` 132; `[unknown]` 7; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `mozilla::dom::MessageEvent::cycleCollection::Unlink(void*) [` 2; `[linux-vdso.so.1]` 2; `js::gc::GetOrCreateUniqueId(js::gc::Cell*, unsigned long*) [` 1
  - GC/CC markers: GCMinor 1× 3 ms
  - WebRender/compositor threads: Renderer 584 ms (top self: `__syscall_cancel_arch [libc.so.6]` 200, `int blendTextureNearestFast<false, glsl::sampler2D` 131, `void scale_blit<true>(Texture&, IntRect const&, Te` 101); SwComposite 511 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 238, `syscall [libc.so.6]` 206, `__memmove_evex_unaligned_erms [libc.so.6]` 63); WRRenderBackend#0 60 ms (top self: `syscall [libc.so.6]` 37, `sched_yield [libc.so.6]` 15, `[axiosozo-dev]` 2)
  - background pools (native receiver queue): BackgroundThreadPool #1 142 ms (top self: `__syscall_cancel_arch [libc.so.6]` 97, `__memmove_evex_unaligned_erms [libc.so.6]` 37, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2); ImageBridgeChld 14 ms (top self: `__syscall_cancel_arch [libc.so.6]` 13, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `__lll_lock_wait [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 219 ms: buckets subprocess_pipe_io 219, worker_messaging 219, ipc 219, js_ctypes 202, poll_wait 200, gc_cc 6; top self: `__syscall_cancel_arch [libc.so.6]` 201; `[unknown]` 2; `mozilla::detail::EventQueueInternal<16ul>::GetEven` 1; `__memset_evex_unaligned_erms [libc.so.6]` 1; `NS_CycleCollectorSuspect3 [libxul.so]` 1
- **tab:11430** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / scroll

- **parent** CPU ms by thread group: main 468, Renderer 374, SwComposite 326, DOM Worker 265, BgPool 197, WRRenderBackend 40, Compositor 21, other 17, ImageBridge 8, WRSceneBuilder 4, Socket 1, IPC I/O 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 468 ms (22.5% of span): Idle 286, JavaScript 83, Other 49, DOM 23, Graphics 10, Profiler 9
  - JS leaf 12 / native under JS 93 / native 363; buckets: ipc 465, poll_wait 339, gc_cc 79, engine_stream_read 54, worker_messaging 39, paint_layout 34, harness_diagnostics 33, subprocess_pipe_io 29
  - top self: `__syscall_cancel_arch [libc.so.6]` 314; `[unknown]` 21; `__lll_lock_wait [libc.so.6]` 10; `[axiosozo-dev]` 6; `__lll_lock_wake [libc.so.6]` 6; `XPCCallContext::XPCCallContext(JSContext*, JS::Handle<JSObje` 3
  - GC/CC markers: GCMinor 1× 4 ms
  - WebRender/compositor threads: Renderer 374 ms (top self: `__syscall_cancel_arch [libc.so.6]` 154, `int blendTextureNearestFast<false, glsl::sampler2D` 79, `void scale_blit<true>(Texture&, IntRect const&, Te` 47); SwComposite 326 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 154, `syscall [libc.so.6]` 153, `__memmove_evex_unaligned_erms [libc.so.6]` 18); WRRenderBackend#0 41 ms (top self: `syscall [libc.so.6]` 30, `sched_yield [libc.so.6]` 9, `hashbrown::raw::RawTable<T,A>::reserve_rehash [lib` 0)
  - background pools (native receiver queue): BackgroundThreadPool #1 197 ms (top self: `__syscall_cancel_arch [libc.so.6]` 120, `__memmove_evex_unaligned_erms [libc.so.6]` 66, `__lll_lock_wait [libc.so.6]` 7); ImageBridgeChld 9 ms (top self: `__syscall_cancel_arch [libc.so.6]` 8, `__lll_lock_wait [libc.so.6]` 0, `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 265 ms: buckets subprocess_pipe_io 265, worker_messaging 263, ipc 263, js_ctypes 222, poll_wait 208, gc_cc 20; top self: `__syscall_cancel_arch [libc.so.6]` 209; `__lll_lock_wake [libc.so.6]` 14; `__memset_evex_unaligned_erms [libc.so.6]` 6; `__lll_lock_wait [libc.so.6]` 5; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 3
- **tab:11436** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `IPC::ChannelPosix::Send(std::unique_ptr<IPC::Message, std::d` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10952** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / key

- **parent** CPU ms by thread group: main 425, DOM Worker 185, Renderer 124, SwComposite 116, other 26, WRRenderBackend 16, Compositor 14, WRSceneBuilder 8, BgPool 5, ImageBridge 2, IPC I/O 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 425 ms (11.6% of span): Idle 216, JavaScript 71, Other 37, Layout 35, DOM 33, Graphics 20
  - JS leaf 9 / native under JS 134 / native 282; buckets: ipc 422, poll_wait 258, gc_cc 90, paint_layout 64, engine_stream_read 61, worker_messaging 59, harness_diagnostics 26, array_buffer_copy 24
  - top self: `__syscall_cancel_arch [libc.so.6]` 238; `[unknown]` 14; `[axiosozo-dev]` 7; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFra` 4; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `nsFlexContainerFrame::FlexLine::ResolveFlexibleLengths(int, ` 4
  - GC/CC markers: GCMinor 1× 2 ms
  - WebRender/compositor threads: Renderer 124 ms (top self: `__syscall_cancel_arch [libc.so.6]` 37, `void scale_blit<true>(Texture&, IntRect const&, Te` 23, `int blendTextureNearestFast<false, glsl::sampler2D` 23); SwComposite 116 ms (top self: `void scale_blit<true>(Texture&, IntRect const&, Te` 51, `syscall [libc.so.6]` 37, `__memmove_evex_unaligned_erms [libc.so.6]` 27); WRRenderBackend#0 16 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1)
  - background pools (native receiver queue): BackgroundThreadPool #1 5 ms (top self: `__syscall_cancel_arch [libc.so.6]` 3, `__memmove_evex_unaligned_erms [libc.so.6]` 2); ImageBridgeChld 2 ms (top self: `__syscall_cancel_arch [libc.so.6]` 2, `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0, `Pickle::ReadBytesInto(PickleIterator*, void*, unsi` 0); BgIOThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 185 ms: buckets subprocess_pipe_io 185, worker_messaging 185, ipc 185, js_ctypes 172, poll_wait 171, gc_cc 4; top self: `__syscall_cancel_arch [libc.so.6]` 171; `JS::HeapValueWriteBarriers(JS::Value*, JS::Value c` 3; `[axiosozo-dev]` 2; `[unknown]` 1; `nsWifiMonitor::AddRef() [libxul.so]` 1
- **tab:10880** CPU ms by thread group: main 6, IPC I/O 1, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 6 ms (0.2% of span): Idle 5, JavaScript 1, DOM 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::` 0; `js::MicroTaskQueueSet::popFront() [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned` 0; `JSStructuredCloneReader::readString(unsigned int, JSStructur` 0; `XPCWrappedNative::QueryInterface(nsID const&, void**) [libxu` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10930** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 0, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10971** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

### Profile: webkit-2x-control / switch-to-gecko

- **parent** CPU ms by thread group: main 66, Renderer 36, DOM Worker 11, SwComposite 7, BgPool 5, WRRenderBackend 3, Compositor 2, WRSceneBuilder 2, IPC I/O 2, Socket 1, other 0, ImageBridge 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 66 ms (23.8% of span): JavaScript 29, Other 9, Layout 7, Graphics 7, DOM 6, Profiler 5
  - JS leaf 3 / native under JS 42 / native 22; buckets: ipc 66, array_buffer_copy 19, paint_layout 17, gc_cc 12, harness_diagnostics 9, engine_stream_read 6, worker_messaging 5, subprocess_pipe_io 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `mprotect [libc.so.6]` 3; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObjec` 3; `mozilla::nsDisplayWrapList::nsDisplayWrapList(mozilla::nsDis` 2; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisp` 2; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [` 2
  - WebRender/compositor threads: Renderer 36 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 10, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 8, `__syscall_cancel_arch [libc.so.6]` 4); SwComposite 7 ms (top self: `syscall [libc.so.6]` 6, `__memmove_evex_unaligned_erms [libc.so.6]` 2); WRRenderBackend#0 3 ms (top self: `syscall [libc.so.6]` 2, `webrender::batch::AlphaBatchList::set_params_and_g` 1, `[axiosozo-dev]` 0)
  - background pools (native receiver queue): BgIOThreadPool #1 5 ms (top self: `unlink [libc.so.6]` 3, `rmdir [libc.so.6]` 1, `fstatat64 [libc.so.6]` 1); BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
  - busiest DOM Worker 11 ms: buckets subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10, js_ctypes 9, array_buffer_copy 0; top self: `__syscall_cancel_arch [libc.so.6]` 10; `PLDHashTable::MakeEntryHandle(void const*) [libxul` 1; `__memset_evex_unaligned_erms [libc.so.6]` 0
- **tab:11332** CPU ms by thread group: main 26, IPC I/O 1, Socket 0, other 0, BgPool 0, ImageIO 0, ImageBridge 0
  - main thread 26 ms (9.2% of span): Other 8, JavaScript 8, Idle 5, Layout 2, Network 2, Profiler 1
  - JS leaf 0 / native under JS 7 / native 19; buckets: ipc 20, gc_cc 7, subprocess_pipe_io 6, poll_wait 5, paint_layout 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `js::frontend::TokenStreamSpecific<mozilla::Utf8Unit, js::fro` 2; `style::values::specified::length::LengthPercentage::parse_in` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsWebBrowser::Release() [libxul.so]` 1
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:10880** CPU ms by thread group: main 5, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 5 ms (1.8% of span): Idle 3, JavaScript 2
  - JS leaf 0 / native under JS 1 / native 3; buckets: ipc 5, poll_wait 3, array_buffer_copy 2, gc_cc 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKe` 1; `js::LifoAlloc::release(js::LifoAlloc::Mark) [libxul.so]` 0; `_recv (resource://gre/modules/ConduitsChild.sys.mjs:84:14)[7` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)
- **tab:11436** CPU ms by thread group: main 0, IPC I/O 0, Socket 0, BgPool 0, ImageIO 0, other 0, ImageBridge 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
  - background pools (native receiver queue): BackgroundThreadPool #1 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0); ImageBridgeChld 0 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0)

