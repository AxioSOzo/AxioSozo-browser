### gecko raf-nosampler (profile pass)

**parent pid 3126** — 546 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 333 | 10.9 | Graphics 236, Idle 95, Other 2 | 0 / 0 / 333 | ipc 329, webrender_render 237, webrender_sw_raster 209, poll_wait 99 |
| WRRenderBackend#0 | 69 | 2.3 | Other 69 | 0 / 0 / 69 | webrender_render 2, poll_wait 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 49 | 1.6 | Other 48, Profiler 0 | 0 / 0 / 49 | webrender_scene 49, webrender_render 2, poll_wait 1, array_buffer_copy 0 |
| Compositor | 47 | 1.5 | Idle 46, Other 1, Profiler 0 | 0 / 0 / 47 | ipc 47, poll_wait 45, paint_layout 0, memcpy_memset 0 |
| GeckoMain | 16 | 0.5 | Idle 10, JavaScript 2, DOM 2, Other 1 | 0 / 3 / 12 | ipc 16, poll_wait 11, harness_diagnostics 3, array_buffer_copy 3 |
| SwComposite | 14 | 0.5 | Other 14 | 0 / 0 / 14 | webrender_render 14, poll_wait 14, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0, Profiler 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 10; `bool js::frontend::ScopeStencil::appendScopeStencilAndData<js::ScopeKi` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1; `obj_assign(JSContext*, unsigned int, JS::Value*) [libxul.so]` 1; `mozilla::dom::AutoJSAPI::ReportException() [libxul.so]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::Runnable::QueryInterface(nsID const&, void**) [libxul.so]` 1; `xpc::WrapperFactory::Rewrap(JSContext*, JS::Handle<JSObject*>, JS::Han` 0

**tab pid 3359** — 185 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 166 | 5.4 | Idle 98, Graphics 23, Layout 20, Other 14 | 0 / 5 / 161 | ipc 159, poll_wait 101, paint_layout 56, canvas_2d 2 |
| IPC I/O Child | 18 | 0.6 | Idle 18, Other 0 | 0 / 0 / 18 | poll_wait 18, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 99; `[]` 5; `sendmsg [libc.so.6]` 4; `write [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `void gfxFont::DrawOneGlyph<(gfxFont::FontComplexityT)0>(unsigned int, ` 2; `nsScrollbarFrame::QueryFrame(nsQueryFrame::FrameIID) const [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3385** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3263** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

