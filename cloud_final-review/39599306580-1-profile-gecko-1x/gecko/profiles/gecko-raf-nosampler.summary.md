### gecko raf-nosampler (profile pass)

**parent pid 3086** — 549 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 340 | 11.2 | Graphics 256, Idle 84, Other 1 | 0 / 0 / 340 | ipc 338, webrender_render 256, webrender_sw_raster 228, poll_wait 86 |
| WRRenderBackend#0 | 67 | 2.2 | Other 67 | 0 / 0 / 67 | memcpy_memset 1, webrender_render 1, poll_wait 0, webrender_scene 0 |
| WRSceneBuilder#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_scene 48, webrender_render 1, paint_layout 0, memcpy_memset 0 |
| Compositor | 46 | 1.5 | Idle 44, Other 2, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 44, paint_layout 1, webrender_render 0 |
| GeckoMain | 15 | 0.5 | Idle 10, JavaScript 3, Other 1, DOM 1 | 0 / 4 / 12 | ipc 15, poll_wait 12, harness_diagnostics 4, array_buffer_copy 3 |
| SwComposite | 14 | 0.5 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 14, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 11 | 0.3 | Idle 10, Other 0 | 0 / 0 / 11 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 11; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*> const, mo` 1; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 1; `js::jit::CacheRegisterAllocator::useValueRegister(js::jit::MacroAssemb` 1; `js::GeckoProfilerRuntime::profileString(JSContext*, js::BaseScript*) [` 1; `nsLayoutUtils::GetDisplayListParent(nsIFrame*) [libxul.so]` 0; `pthread_getspecific@GLIBC_2.2.5 [libc.so.6]` 0; `JS_GetPropertyById(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS::P` 0

**tab pid 3315** — 182 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 164 | 5.4 | Idle 101, Graphics 28, Layout 18, Other 10 | 0 / 4 / 160 | ipc 157, poll_wait 102, paint_layout 56, memcpy_memset 2 |
| IPC I/O Child | 17 | 0.5 | Idle 16, Other 0 | 0 / 0 / 17 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 101; `sendmsg [libc.so.6]` 6; `[]` 5; `round [libxul.so]` 2; `wr_dp_push_linear_gradient [libxul.so]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `nsContainerFrame::GetChildList(mozilla::FrameChildListID) const [libxu` 1; `mozilla::layers::WebRenderScrollData::~WebRenderScrollData() [libxul.s` 1

**tab pid 3321** — 1 ms CPU in the window

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

**tab pid 3248** — 1 ms CPU in the window

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

