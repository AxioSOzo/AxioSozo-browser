### chromium-2x switch-to-gecko (profile pass)

**parent pid 3331** — 563 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BgIOThreadPool #4 | 363 | 2.4 | Other 362, Idle 1 | 0 / 0 / 363 | ipc 363, poll_wait 1 |
| GeckoMain | 70 | 0.5 | Layout 18, JavaScript 18, Other 15, Idle 11 | 1 / 30 / 39 | ipc 70, paint_layout 21, poll_wait 14, gc_cc 13 |
| DOM Worker | 65 | 0.4 | GC / CC 30, Other 24, JavaScript 8, Idle 2 | 0 / 0 / 65 | subprocess_pipe_io 65, worker_messaging 65, ipc 65, gc_cc 54 |
| Renderer | 42 | 0.3 | Graphics 38, Idle 4 | 0 / 0 / 42 | ipc 42, webrender_render 38, webrender_sw_raster 35, poll_wait 4 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Compositor | 6 | 0.0 | Idle 5, Other 1 | 0 / 0 / 6 | ipc 6, poll_wait 5, memcpy_memset 1 |
| SwComposite | 3 | 0.0 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 3, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |

Main thread, top self: `poll [libc.so.6]` 12; `mozilla::dom::Event::InitPresContextData(nsPresContext*) [libxul.so]` 6; `madvise [libc.so.6]` 5; `[unknown]` 3; `style::properties::cascade::Cascade::apply_custom_and_prioritary_prope` 2; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 2; `nsLayoutUtils::MinSizeContributionForAxis(mozilla::PhysicalAxis, gfxCo` 2; `getcontext [libc.so.6]` 2

**tab pid 3533** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 3, JavaScript 2, DOM 1, Other 1 | 0 / 3 / 4 | ipc 7, poll_wait 3, gc_cc 2, array_buffer_copy 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `js::jit::CacheIRCompiler::addFailurePath(js::jit::FailurePath**) [libx` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `write [libc.so.6]` 1; `xpc::JSXrayTraits::call(JSContext*, JS::Handle<JSObject*>, JS::CallArg` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::emit_InitP` 0; `[linux-vdso.so.1]` 0

**tab pid 4024** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 4, Layout 0 | 0 / 0 / 5 | ipc 5, poll_wait 4, paint_layout 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `mozilla::PresShell::FrameNeedsReflow(nsIFrame*, mozilla::IntrinsicDirt` 0

**tab pid 3494** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Profiler 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 0

