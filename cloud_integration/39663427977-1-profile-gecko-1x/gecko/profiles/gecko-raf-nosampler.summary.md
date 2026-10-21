### gecko raf-nosampler (profile pass)

**parent pid 2968** — 544 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 337 | 11.0 | Graphics 244, Idle 92 | 0 / 0 / 337 | ipc 333, webrender_render 244, webrender_sw_raster 222, poll_wait 93 |
| WRRenderBackend#0 | 64 | 2.1 | Other 64 | 0 / 0 / 64 | webrender_render 0, gc_cc 0, poll_wait 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 47 | 1.6 | Other 47 | 0 / 0 / 47 | webrender_scene 47, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 46 | 1.5 | Idle 45, Other 1, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 45, paint_layout 0, webrender_render 0 |
| GeckoMain | 15 | 0.5 | Idle 12, JavaScript 2, DOM 1, Graphics 0 | 0 / 3 / 12 | ipc 15, poll_wait 12, harness_diagnostics 3, array_buffer_copy 3 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 14, webrender_sw_raster 1, memcpy_memset 0 |
| IPC I/O Parent | 11 | 0.4 | Idle 10, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 12; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `JS_ResolveStandardClass(JSContext*, JS::Handle<JSObject*>, JS::Handle<` 1; `__strlen_avx2 [libc.so.6]` 1; `mozilla::MergeState::ProcessItemFromNewList(mozilla::nsDisplayItem*, m` 0; `[linux-vdso.so.1]` 0; `recvmsg [libc.so.6]` 0; `gdk_event_new [libgdk-3.so.0]` 0

**tab pid 3222** — 183 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 165 | 5.4 | Idle 106, Graphics 22, Layout 15, Other 9 | 0 / 4 / 160 | ipc 154, poll_wait 107, paint_layout 45, gc_cc 3 |
| IPC I/O Child | 17 | 0.5 | Idle 16, Other 0 | 0 / 0 / 17 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 104; `[]` 5; `sendmsg [libc.so.6]` 4; `[linux-vdso.so.1]` 3; `__lll_lock_wait [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::StyleAbsoluteColor::ToColor(nsIFrame const*) const [libxul.so` 1

**tab pid 3308** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3133** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

