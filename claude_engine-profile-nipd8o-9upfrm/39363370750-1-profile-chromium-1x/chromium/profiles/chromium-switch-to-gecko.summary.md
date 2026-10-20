### chromium switch-to-gecko (profile pass)

**parent pid 4064** — 128 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 0.4 | Layout 16, Idle 16, JavaScript 15, Other 9 | 2 / 24 / 38 | ipc 65, paint_layout 23, poll_wait 19, gc_cc 12 |
| DOM Worker | 26 | 0.2 | JavaScript 9, Other 9, GC / CC 7, Idle 1 | 0 / 0 / 26 | subprocess_pipe_io 26, worker_messaging 26, ipc 26, gc_cc 15 |
| Renderer | 18 | 0.1 | Graphics 17, Idle 2 | 0 / 0 / 18 | ipc 18, webrender_render 17, webrender_sw_raster 14, poll_wait 3 |
| IPC I/O Parent | 6 | 0.0 | Idle 5, Other 1 | 0 / 0 / 6 | poll_wait 6, ipc 1 |
| Compositor | 4 | 0.0 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| WRRenderBackend#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_render 0, poll_wait 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 15; `nsLayoutUtils::GetTransformToAncestorScale(nsIFrame const*) [libxul.so` 3; `style::rule_tree::core::StrongRuleNode::ensure_child [libxul.so]` 2; `mprotect [libc.so.6]` 2; `nsFlexContainerFrame::ReflowChildren(mozilla::ReflowInput const&, nsSi` 2; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `WatchdogManager::RecordContextActivity(XPCJSContext*, bool) [libxul.so` 1; `read [libc.so.6]` 1

**tab pid 4272** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 4, DOM 2, JavaScript 1, Other 1 | 0 / 3 / 4 | ipc 6, poll_wait 4, gc_cc 2, array_buffer_copy 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `nsAtomTable::AtomizeMainThread(nsTSubstring<char16_t> const&) [libxul.` 1; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 1; `mmap64 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `js::jit::BaselineCompiler::emitBody() [libxul.so]` 0; `mozilla::CycleCollectedJSContext::PerformMicroTaskCheckPoint(bool) [li` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0

**tab pid 4254** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::ipc::PBackgroundChild::OnMessageReceived(IPC::Message const&)` 0; `PR_GetCurrentThread [libnspr4.so]` 0; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInternal(mozil` 0; `[linux-vdso.so.1]` 0

**tab pid 4741** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Layout 0, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 4 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `<firefox_on_glean::private::counter::CounterMetric as glean_core::trai` 0; `mozilla::dom::PBrowserChild::OnMessageReceived(IPC::Message const&) [l` 0

