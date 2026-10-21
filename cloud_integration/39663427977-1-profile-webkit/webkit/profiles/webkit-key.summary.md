### webkit key (profile pass)

**parent pid 7154** — 768 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 430 | 11.8 | Idle 217, JavaScript 73, Layout 35, Graphics 34 | 18 / 110 / 303 | ipc 430, poll_wait 250, gc_cc 85, paint_layout 75 |
| DOM Worker | 176 | 4.8 | JavaScript 171, Other 3, Profiler 2 | 0 / 0 / 176 | subprocess_pipe_io 176, worker_messaging 176, ipc 176, js_ctypes 166 |
| Renderer | 50 | 1.4 | Idle 27, Graphics 22 | 0 / 0 / 50 | ipc 50, poll_wait 27, webrender_render 22, webrender_sw_raster 17 |
| SwComposite | 26 | 0.7 | Other 26 | 0 / 0 / 26 | webrender_render 26, poll_wait 18, webrender_sw_raster 7, memcpy_memset 7 |
| Timer | 25 | 0.7 | Other 25 | 0 / 0 / 25 | ipc 25, poll_wait 25 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | webrender_render 0 |
| Compositor | 14 | 0.4 | Idle 13, Other 0 | 0 / 0 / 14 | ipc 14, poll_wait 13, memcpy_memset 0, paint_layout 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 8, Graphics 0 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 228; `[unknown]` 13; `[axiosozo-dev]` 9; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 4; `mozilla::AbsoluteContainingBlock::Reflow(nsContainerFrame*, nsPresCont` 3; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 3; `ComputeObjectAnchorCoord(mozilla::StyleLengthPercentage const&, int, i` 2; `nsIFrame::IsTransformed() const [libxul.so]` 2

**tab pid 7244** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 7, JavaScript 1, DOM 0, Other 0 | 0 / 0 / 7 | ipc 7, poll_wait 7, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `JS::PropertySpecNameEqualsId(JSPropertySpec::Name, JS::Handle<JS::Prop` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `[unknown]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `xpc::AutoScriptActivity::AutoScriptActivity(bool) [libxul.so]` 0; `[]` 0

**tab pid 7297** — 1 ms CPU in the window

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

**tab pid 7338** — 1 ms CPU in the window

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

