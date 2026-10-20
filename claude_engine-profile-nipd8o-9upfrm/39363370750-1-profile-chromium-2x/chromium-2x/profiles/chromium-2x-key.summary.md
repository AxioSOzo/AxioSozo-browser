### chromium-2x key (profile pass)

**parent pid 3347** — 991 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 417 | 11.3 | Idle 172, JavaScript 88, Layout 46, Graphics 38 | 19 / 132 / 266 | ipc 417, poll_wait 211, paint_layout 102, gc_cc 102 |
| DOM Worker | 268 | 7.3 | JavaScript 255, Other 8, GC / CC 5, Profiler 0 | 0 / 0 / 268 | subprocess_pipe_io 268, worker_messaging 268, ipc 268, js_ctypes 231 |
| Renderer | 117 | 3.2 | Graphics 70, Idle 45, Other 3 | 0 / 0 / 117 | ipc 117, webrender_render 70, webrender_sw_raster 62, poll_wait 47 |
| SwComposite | 106 | 2.9 | Other 106 | 0 / 0 / 106 | webrender_render 106, webrender_sw_raster 68, poll_wait 37, memcpy_memset 15 |
| Timer | 38 | 1.0 | Other 38, Profiler 0 | 0 / 0 / 38 | ipc 38, poll_wait 38 |
| Compositor | 18 | 0.5 | Idle 17, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 17, memcpy_memset 1, canvas_2d 0 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 | poll_wait 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_scene 9, webrender_render 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 175; `__memmove_avx_unaligned_erms [libc.so.6]` 20; `[unknown]` 12; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 9; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 4; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, mozilla::W` 4; `recvmsg [libc.so.6]` 4

**tab pid 3442** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 0; `mozilla::dom::StructuredCloneHolder::Write(JSContext*, JS::Handle<JS::` 0; `js::jit::Assembler::cmovCCq(js::jit::AssemblerX86Shared::Condition, js` 0; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 0; `xpcAccTextSelectionChangeEvent::AddRef() [libxul.so]` 0

**tab pid 3491** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `g_main_context_default [libglib-2.0.so.0]` 0

**tab pid 3512** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1, paint_layout 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `nsRefreshDriver::CancelIdleTask(mozilla::Task*) [libxul.so]` 0

