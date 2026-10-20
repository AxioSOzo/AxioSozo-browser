### chromium-2x switch-to-gecko (profile pass)

**parent pid 3348** — 574 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BgIOThreadPool #2 | 365 | 8.2 | Other 365, Idle 0 | 0 / 0 / 365 | ipc 365, poll_wait 0 |
| GeckoMain | 65 | 0.4 | Idle 20, JavaScript 15, Layout 9, DOM 7 | 1 / 29 / 35 | ipc 64, poll_wait 21, gc_cc 16, paint_layout 16 |
| DOM Worker | 62 | 0.4 | GC / CC 28, Other 24, JavaScript 8, Idle 1 | 0 / 0 / 62 | subprocess_pipe_io 62, worker_messaging 62, ipc 62, gc_cc 52 |
| Renderer | 58 | 0.4 | Graphics 57, Idle 0 | 0 / 0 / 58 | ipc 58, webrender_render 57, webrender_sw_raster 57, poll_wait 0 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| SwComposite | 4 | 0.0 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4, memcpy_memset 0, webrender_sw_raster 0 |
| Compositor | 4 | 0.0 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, memcpy_memset 0, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |

Main thread, top self: `poll [libc.so.6]` 21; `[unknown]` 3; `nsContainerFrame::ReflowChild(nsIFrame*, nsPresContext*, mozilla::Refl` 2; `[axiosozo-dev]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `js::ObjectFuse::tryOptimizeConstantProperty(JS::PropertyKey, js::Prope` 2; `madvise [libc.so.6]` 2; `mozilla::dom::MessageEvent::cycleCollection::Unlink(void*) [libxul.so]` 1

**tab pid 3547** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 4, JavaScript 2, DOM 1, Other 0 | 0 / 2 / 5 | ipc 7, poll_wait 5, gc_cc 2, array_buffer_copy 0 |
| Timer | 2 | 0.0 | Other 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::DefineAccessorProperty(JSContext*, JS::Handle<JSObject*>, JS::Hand` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 0; `_Z14AssignJSStringIN7mozilla3dom9DOMStringETnPNSt9enable_ifIXsr3stdE9i` 0; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `mozilla::ipc::MessagePump::Run(base::MessagePump::Delegate*) [libxul.s` 0

**tab pid 3508** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `PR_GetCurrentThread [libnspr4.so]` 0

**tab pid 4030** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Graphics 0, Other 0, Layout 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 0; `nsLayoutUtils::GetCumulativeApzCallbackTransform(nsIFrame*) [libxul.so` 0; `pthread_rwlock_unlock@GLIBC_2.2.5 [libc.so.6]` 0; `sendmsg [libc.so.6]` 0; `Pickle::ReadBytesInto(PickleIterator*, void*, unsigned int) const [lib` 0

