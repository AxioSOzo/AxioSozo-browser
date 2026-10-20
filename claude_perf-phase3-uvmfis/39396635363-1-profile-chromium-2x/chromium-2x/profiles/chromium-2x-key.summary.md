### chromium-2x key (profile pass)

**parent pid 3115** — 586 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 250 | 6.9 | Idle 127, JavaScript 45, Other 22, Layout 19 | 6 / 75 / 170 | ipc 250, poll_wait 147, gc_cc 56, worker_messaging 44 |
| DOM Worker | 162 | 4.5 | JavaScript 158, Other 2, Profiler 2 | 0 / 0 / 162 | subprocess_pipe_io 162, worker_messaging 162, ipc 162, js_ctypes 151 |
| Renderer | 72 | 2.0 | Graphics 52, Idle 20, Profiler 0 | 0 / 0 / 72 | ipc 72, webrender_render 52, webrender_sw_raster 48, poll_wait 21 |
| SwComposite | 37 | 1.0 | Other 37 | 0 / 0 / 37 | webrender_render 37, webrender_sw_raster 19, memcpy_memset 18, poll_wait 18 |
| Timer | 24 | 0.7 | Other 24 | 0 / 0 / 24 | ipc 24, poll_wait 23, memcpy_memset 0 |
| Compositor | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | ipc 10, poll_wait 10, canvas_2d 0, webrender_render 0 |
| WRRenderBackend#0 | 9 | 0.3 | Other 9 | 0 / 0 / 9 |  |
| BackgroundThreadPool #1 | 7 | 0.2 | Idle 6, Other 2 | 0 / 0 / 7 | ipc 7, poll_wait 6, native_receiver 2, memcpy_memset 2 |

Main thread, top self: `poll [libc.so.6]` 128; `[unknown]` 8; `[axiosozo-dev]` 5; `write [libc.so.6]` 4; `mozilla::PrintfTarget::vprint(char const*, __va_list_tag*) [axiosozo-d` 3; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `[linux-vdso.so.1]` 2

**tab pid 3207** — 13 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 12 | 0.3 | GC / CC 6, Idle 6, Other 0 | 0 / 0 / 12 | ipc 12, poll_wait 7, gc_cc 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 2; `void js::gc::MarkingTracerT<8u>::markAndTraverse<js::BaseScript>(js::B` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `bool __gnu_cxx::__ops::_Iter_pred<mozilla::Vector<std::unique_ptr<js::` 1; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsContentUtils::UserInteractionObserver::QueryInterface(nsID const&, v` 0

**tab pid 3293** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.2 | GC / CC 6, Idle 1, Other 1, Profiler 0 | 0 / 0 / 8 | ipc 8, gc_cc 6, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `bool js::gc::IsAboutToBeFinalizedInternal<JSString>(JSString*) [libxul` 1; `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `sendmsg [libc.so.6]` 1; `js::detail::OrderedHashTableImpl<js::OrderedHashMapImpl<js::PreBarrier` 1; `<firefox_on_glean::private::custom_distribution::CustomDistributionMet` 0

**tab pid 3254** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 2, GC / CC 1, Other 0 | 0 / 0 / 3 | ipc 2, poll_wait 2, gc_cc 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

