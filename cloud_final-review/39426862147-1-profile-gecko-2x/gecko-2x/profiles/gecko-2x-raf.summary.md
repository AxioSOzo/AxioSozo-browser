### gecko-2x raf (profile pass)

**parent pid 2918** — 403 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 192 | 6.2 | Graphics 97, Idle 93, Other 2 | 0 / 0 / 192 | ipc 192, webrender_render 98, poll_wait 96, webrender_sw_raster 79 |
| SwComposite | 55 | 1.8 | Other 55 | 0 / 0 / 55 | webrender_render 55, poll_wait 48, webrender_sw_raster 7, memcpy_memset 7 |
| WRRenderBackend#0 | 49 | 1.6 | Other 49 | 0 / 0 / 49 | webrender_render 0 |
| WRSceneBuilder#0 | 36 | 1.2 | Other 36 | 0 / 0 / 36 | webrender_scene 36, webrender_render 2, webrender_sw_raster 0 |
| Compositor | 32 | 1.1 | Idle 31, Other 1, Profiler 0 | 0 / 0 / 32 | ipc 32, poll_wait 31, paint_layout 0, webrender_render 0 |
| GeckoMain | 21 | 0.7 | Idle 15, Graphics 2, Other 1, JavaScript 1 | 0 / 2 / 20 | ipc 21, poll_wait 15, paint_layout 3, harness_diagnostics 1 |
| IPC I/O Parent | 8 | 0.3 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, ipc 0 |
| WRSceneBuilderLP#0 | 5 | 0.1 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `poll [libc.so.6]` 15; `mozilla::ScrollContainerFrame::GetScrollPadding() const [libxul.so]` 1; `nsIFrame::ShouldApplyOverflowClipping(nsStyleDisplay const*) const [li` 1; `nsFlexContainerFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&, m` 1; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 1; `JS::Compartment::getNonWrapperObjectForCurrentCompartment(JSContext*, ` 1; `ResolvePromise(JSContext*, JS::Handle<js::PromiseObject*>, JS::Handle<` 0; `__lll_lock_wake [libc.so.6]` 0

**tab pid 3167** — 135 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 121 | 3.9 | Idle 88, Graphics 12, Layout 9, Other 5 | 0 / 5 / 117 | ipc 117, poll_wait 90, paint_layout 24, harness_diagnostics 2 |
| IPC I/O Child | 12 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 88; `[]` 2; `__strlen_evex [libc.so.6]` 1; `[linux-vdso.so.1]` 1; `mozilla::BasePrincipal::IsSameOrigin(nsIURI*, bool*) [libxul.so]` 1; `__lll_lock_wait [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::ProfileChunkedBuffer::PutObj` 1; `g_main_context_iteration [libglib-2.0.so.0]` 1

**tab pid 3105** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3066** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

