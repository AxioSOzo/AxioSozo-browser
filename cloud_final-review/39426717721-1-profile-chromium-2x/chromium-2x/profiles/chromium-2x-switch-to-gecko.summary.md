### chromium-2x switch-to-gecko (profile pass)

**parent pid 3139** — 191 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 0.4 | Idle 20, JavaScript 14, Other 10, Layout 10 | 1 / 29 / 37 | ipc 67, poll_wait 22, paint_layout 17, gc_cc 14 |
| DOM Worker | 61 | 0.4 | GC / CC 27, Other 22, JavaScript 10, Idle 2 | 0 / 0 / 61 | subprocess_pipe_io 61, worker_messaging 61, ipc 61, gc_cc 49 |
| Renderer | 34 | 0.2 | Graphics 34, Idle 1 | 0 / 0 / 34 | ipc 34, webrender_render 34, webrender_sw_raster 33, poll_wait 1 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| BgIOThreadPool #1 | 5 | 0.0 | Other 5, Idle 0 | 0 / 0 / 5 | ipc 5, poll_wait 0 |
| SwComposite | 5 | 0.0 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 4, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 4 | 0.0 | Idle 4 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| Timer | 3 | 0.0 | Other 3, Profiler 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 20; `madvise [libc.so.6]` 3; `nsTextFrame::GetInFlowContentLength() [libxul.so]` 3; `[unknown]` 3; `mprotect [libc.so.6]` 2; `__memcmp_evex_movbe [libc.so.6]` 1; `g_slice_free1 [libglib-2.0.so.0]` 1; `mozilla::TextEditor::ComputeTextValue(nsTSubstring<char16_t>&) const [` 1

**tab pid 3335** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Other 0, Profiler 0 | 0 / 0 / 4 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `__strlen_evex [libc.so.6]` 0; `[libxul.so]` 0

**tab pid 3831** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `sendmsg [libc.so.6]` 0; `mozilla::dom::AutoYieldJSThreadExecution::AutoYieldJSThreadExecution()` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0

**tab pid 3826** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 4, DOM 0, Other 0, Layout 0 | 0 / 0 / 5 | ipc 5, poll_wait 4, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `mozilla::gfx::Matrix4x4TypedFlagged<mozilla::LayoutDevicePixel, mozill` 0; `nsIFrame::CanBeDynamicReflowRoot() const [libxul.so]` 0; `__lll_lock_wait [libc.so.6]` 0

