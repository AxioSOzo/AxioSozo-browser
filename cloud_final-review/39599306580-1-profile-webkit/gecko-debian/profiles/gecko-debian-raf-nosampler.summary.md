### gecko-debian raf-nosampler (profile pass)

**parent pid 8168** — 584 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 354 | 11.7 | Graphics 267, Idle 86, Other 1 | 0 / 0 / 354 | ipc 353, webrender_render 267, webrender_sw_raster 231, poll_wait 92 |
| WRRenderBackend#0 | 75 | 2.5 | Other 75 | 0 / 0 / 75 | webrender_render 1, memcpy_memset 1, poll_wait 1 |
| WRSceneBuilder#0 | 52 | 1.7 | Other 52 | 0 / 0 / 52 | webrender_scene 52, webrender_render 2, poll_wait 1, paint_layout 0 |
| Compositor | 50 | 1.7 | Idle 49, Other 1, Profiler 0 | 0 / 0 / 50 | ipc 50, poll_wait 49, webrender_render 0, webrender_scene 0 |
| GeckoMain | 17 | 0.6 | Idle 13, JavaScript 3, Graphics 0, Other 0 | 0 / 3 / 14 | ipc 17, poll_wait 14, harness_diagnostics 3, array_buffer_copy 2 |
| SwComposite | 15 | 0.5 | Other 15 | 0 / 0 / 15 | webrender_render 15, poll_wait 15, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::frontend::RecyclableNameMap<unsigned int>* js::frontend::Collectio` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 1; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 1; `mozilla::RetainedDisplayListBuilder::PreProcessDisplayList(mozilla::Re` 0; `[linux-vdso.so.1]` 0; `[libgdk-3.so.0]` 0; `[libX11.so.6]` 0

**tab pid 8417** — 220 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 199 | 6.6 | Idle 98, Graphics 34, Layout 32, Other 14 | 0 / 7 / 192 | ipc 184, poll_wait 99, paint_layout 78, gc_cc 8 |
| IPC I/O Child | 19 | 0.6 | Idle 19, Other 0, Profiler 0 | 0 / 0 / 19 | poll_wait 18, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 5; `getcontext [libc.so.6]` 3; `__memset_avx2_unaligned_erms [libc.so.6]` 3; `[linux-vdso.so.1]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 3; `__lll_lock_wait [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2

**tab pid 8461** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8503** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

