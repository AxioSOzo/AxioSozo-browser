### chromium-2x scroll (profile pass)

**parent pid 3347** — 3932 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1782 | 10.4 | Idle 725, JavaScript 590, Other 258, GC / CC 95 | 370 / 333 / 1079 | ipc 1782, poll_wait 833, paint_layout 464, worker_messaging 402 |
| DOM Worker | 1628 | 9.5 | JavaScript 1470, Other 115, GC / CC 25, Profiler 18 | 0 / 0 / 1628 | subprocess_pipe_io 1628, worker_messaging 1627, ipc 1627, js_ctypes 1142 |
| Renderer | 177 | 1.0 | Graphics 98, Idle 79 | 0 / 0 / 177 | ipc 177, webrender_render 98, webrender_sw_raster 91, poll_wait 89 |
| Timer | 163 | 0.9 | Other 163, Profiler 0 | 0 / 0 / 163 | ipc 163, poll_wait 161, memcpy_memset 0 |
| SwComposite | 131 | 0.8 | Other 131 | 0 / 0 / 131 | webrender_render 131, poll_wait 91, webrender_sw_raster 41, memcpy_memset 9 |
| WRRenderBackend#0 | 21 | 0.1 | Other 21 | 0 / 0 / 21 | webrender_render 0 |
| Compositor | 18 | 0.1 | Idle 17, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 17, webrender_render 0 |
| IPC I/O Parent | 6 | 0.0 | Idle 5, Other 1 | 0 / 0 / 6 | poll_wait 6, ipc 1 |

Main thread, top self: `poll [libc.so.6]` 740; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 351; `__memmove_avx_unaligned_erms [libc.so.6]` 192; `write [libc.so.6]` 23; `void mozilla::gfx::Premultiply_AVX2<true, true>(unsigned char const*, ` 23; `[unknown]` 22; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 22; `[axiosozo-dev]` 21

**tab pid 3538** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.0 | Idle 4, DOM 2, JavaScript 1, Other 1 | 0 / 3 / 5 | ipc 8, poll_wait 4, gc_cc 3, memcpy_memset 1 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::gc::StoreBuffer::putSlot(js::NativeObject*, int, unsigned int, uns` 1; `nsAppShell::ScheduleNativeEventCallback() [libxul.so]` 1; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 0; `sendmsg [libc.so.6]` 0; `v8::internal::regexp::CharacterRange::ClampToOneByte(v8::internal::Zon` 0

**tab pid 3512** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3

**tab pid 4006** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

