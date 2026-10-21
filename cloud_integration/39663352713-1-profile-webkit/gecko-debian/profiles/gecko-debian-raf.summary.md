### gecko-debian raf (profile pass)

**parent pid 8162** — 535 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 313 | 10.2 | Graphics 209, Idle 101, Other 2 | 0 / 0 / 313 | ipc 308, webrender_render 211, webrender_sw_raster 189, poll_wait 103 |
| WRRenderBackend#0 | 64 | 2.1 | Other 64 | 0 / 0 / 64 | webrender_render 1, memcpy_memset 0, poll_wait 0 |
| WRSceneBuilder#0 | 45 | 1.5 | Other 45 | 0 / 0 / 45 | webrender_scene 45, webrender_render 2, poll_wait 0, memcpy_memset 0 |
| Compositor | 43 | 1.4 | Idle 42, Other 1, Profiler 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, webrender_render 0, paint_layout 0 |
| GeckoMain | 29 | 0.9 | Idle 20, Layout 3, JavaScript 3, Other 2 | 0 / 3 / 25 | ipc 29, poll_wait 20, paint_layout 4, gc_cc 2 |
| SwComposite | 18 | 0.6 | Other 18 | 0 / 0 / 18 | webrender_render 18, poll_wait 17, memcpy_memset 1, webrender_sw_raster 1 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 20; `nsQueryInterfaceISupports::operator()(nsID const&, void**) const [libx` 3; `mozilla::SimpleTaskQueue::DrainTasks() [libxul.so]` 1; `[unknown]` 1; `bool CommonIterPromiseCombinator<bool (*)(JSContext*, PromiseForOfIter` 1; `mozilla::nsDisplayList::AppendToTop(mozilla::nsDisplayItem*) [libxul.s` 1; `Promise_catch_impl(JSContext*, unsigned int, JS::Value*, bool) [libxul` 1; `<style::properties::generated::animated_properties::AnimationValue as ` 1

**tab pid 8404** — 175 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 157 | 5.1 | Idle 98, Graphics 19, Layout 16, Other 11 | 0 / 9 / 148 | ipc 150, poll_wait 103, paint_layout 42, gc_cc 4 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[libglib-2.0.so.0]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `mozilla::detail::nsTStringRepr<char>::Equals(char const*) const [libxu` 1; `<core::hash::sip::Hasher<S> as core::hash::Hasher>::write [libxul.so]` 1

**tab pid 8325** — 1 ms CPU in the window

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

**tab pid 8344** — 1 ms CPU in the window

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

