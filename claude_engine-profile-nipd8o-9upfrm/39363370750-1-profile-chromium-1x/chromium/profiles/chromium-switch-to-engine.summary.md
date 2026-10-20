### chromium switch-to-engine (profile pass)

**parent pid 4064** — 235 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 101 | 17.2 | JavaScript 39, Layout 17, Idle 17, DOM 11 | 9 / 47 / 45 | ipc 101, paint_layout 42, gc_cc 35, worker_messaging 31 |
| DOM Worker | 84 | 14.4 | JavaScript 45, Other 32, Profiler 6, Idle 1 | 0 / 0 / 84 | subprocess_pipe_io 84, worker_messaging 84, ipc 84, js_ctypes 39 |
| Renderer | 31 | 5.4 | Graphics 27, Idle 4 | 0 / 0 / 31 | ipc 31, webrender_render 27, webrender_sw_raster 21, poll_wait 8 |
| WRRenderBackend#0 | 6 | 1.1 | Other 6 | 0 / 0 / 6 | poll_wait 0 |
| Compositor | 4 | 0.7 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, memcpy_memset 0 |
| WRSceneBuilder#0 | 4 | 0.6 | Other 4, Graphics 0 | 0 / 0 / 4 | webrender_scene 4, webrender_render 0, canvas_2d 0, webrender_sw_raster 0 |
| SwComposite | 3 | 0.5 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 2, webrender_sw_raster 1, memcpy_memset 0 |
| IPC I/O Parent | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 17; `__memmove_avx_unaligned_erms [libc.so.6]` 7; `[axiosozo-dev]` 6; `swizzleRun (chrome://browser/content/axiosozo/EngineFrameSurface.sys.m` 6; `<style::gecko::wrapper::GeckoElement as style::dom::TElement>::inherit` 5; `PerformPromiseThen(JSContext*, JS::Handle<js::PromiseObject*>, JS::Han` 4; `ARGBSetRow_X86 [libxul.so]` 4; `write [libc.so.6]` 4

**tab pid 4859** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 1.5 | JavaScript 3, DOM 2, Other 1, Profiler 1 | 0 / 4 / 4 | ipc 9, gc_cc 6, poll_wait 1, array_buffer_copy 1 |
| IPC I/O Child | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__lll_lock_wait [libc.so.6]` 1; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1; `js::PropMapTable::init(JSContext*, js::LinkedPropMap*) [libxul.so]` 1; `JS::ForOfIterator::nextFromOptimizedArray(JS::MutableHandle<JS::Value>` 1; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxul.so]` 1; `[]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::jit::CacheIRStubK` 1

**tab pid 4741** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.6 | Idle 2, Other 1, Graphics 0 | 0 / 0 / 3 | poll_wait 3, ipc 2, paint_layout 0, webrender_render 0 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `__strnlen_avx2 [libc.so.6]` 0; `zen::ZenCommonUtils::PlayHapticFeedback() [libxul.so]` 0; `mozilla::layers::WebRenderLayerManager::DidComposite(mozilla::layers::` 0

**tab pid 4854** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

