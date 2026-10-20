### gecko-debian raf (profile pass)

**parent pid 8124** — 552 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 318 | 10.3 | Graphics 231, Idle 85, Other 3 | 0 / 0 / 318 | ipc 313, webrender_render 232, webrender_sw_raster 204, poll_wait 88 |
| WRRenderBackend#0 | 66 | 2.2 | Other 66 | 0 / 0 / 66 | webrender_render 2, memcpy_memset 0, poll_wait 0 |
| WRSceneBuilder#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_scene 48, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 46 | 1.5 | Idle 44, Other 2, Profiler 0 | 0 / 0 / 46 | ipc 46, poll_wait 44, paint_layout 0, webrender_render 0 |
| GeckoMain | 30 | 1.0 | Idle 22, JavaScript 4, Layout 3, DOM 0 | 0 / 3 / 27 | ipc 30, poll_wait 22, paint_layout 3, harness_diagnostics 3 |
| SwComposite | 19 | 0.6 | Other 19 | 0 / 0 / 19 | webrender_render 19, poll_wait 17, webrender_sw_raster 2, memcpy_memset 2 |
| IPC I/O Parent | 12 | 0.4 | Idle 11, Other 0 | 0 / 0 / 12 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 22; `nsXPCWrappedJS::CallMethod(unsigned short, nsXPTMethodInfo const*, nsX` 1; `js::DefineFunctions(JSContext*, JS::Handle<JSObject*>, JSFunctionSpec ` 1; `nsFlexContainerFrame::FlexLine::AddLastItemToMainSizeTotals() [libxul.` 1; `nsIWidget::NeedsPaint() [libxul.so]` 1; `IntrinsicSizeOffsets(nsIFrame*, int, bool) [libxul.so]` 1; `ProfilingStack::pushLabelFrame(char const*, char const*, void*, JS::Pr` 1; `js::GeneratorResumeState::GeneratorResumeState(JSContext*, JS::Handle<` 1

**tab pid 8377** — 187 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 168 | 5.5 | Idle 103, Graphics 25, Layout 17, Other 13 | 0 / 8 / 160 | ipc 164, poll_wait 105, paint_layout 55, subprocess_pipe_io 4 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 3 | 0.1 | Other 3 | 0 / 0 / 3 | poll_wait 3 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 111; `[]` 2; `peek_poke::poke_into_vec [libxul.so]` 1; `getcontext [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `__lll_lock_wait [libc.so.6]` 1; `mozilla::nsDisplayBackgroundImage::AppendBackgroundItemsToTop(mozilla:` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1

**tab pid 8465** — 1 ms CPU in the window

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

**tab pid 8312** — 1 ms CPU in the window

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

