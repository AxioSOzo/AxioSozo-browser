### chromium switch-to-engine (profile pass)

**parent pid 3402** — 149 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 79 | 32.8 | Layout 33, Idle 21, JavaScript 14, Other 4 | 1 / 38 / 41 | ipc 79, paint_layout 40, poll_wait 22, gc_cc 21 |
| Renderer | 33 | 13.5 | Graphics 27, Idle 5 | 0 / 0 / 33 | ipc 33, webrender_render 27, webrender_sw_raster 26, poll_wait 7 |
| DOM Worker | 14 | 5.8 | JavaScript 14, Profiler 0 | 0 / 0 / 14 | subprocess_pipe_io 14, worker_messaging 14, ipc 14, js_ctypes 13 |
| BackgroundThreadPool #2 | 6 | 2.6 | Idle 3, Other 3 | 0 / 0 / 6 | ipc 6, poll_wait 3, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 4 | 1.8 | Other 4 | 0 / 0 / 4 | webrender_render 1, poll_wait 1 |
| WRSceneBuilder#0 | 4 | 1.5 | Other 4 | 0 / 0 / 4 | webrender_scene 4 |
| Compositor | 4 | 1.5 | Idle 3, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 0, webrender_render 0 |
| SwComposite | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 21; `style::properties::cascade::cascade_rules [libxul.so]` 5; `core::ptr::drop_in_place<style::values::generics::length::GenericSize<` 4; `__lll_lock_wake [libc.so.6]` 4; `AttrArray::GetAttr(nsAtom const*) const [libxul.so]` 4; `ValueToNameOrSymbolId(JSContext*, JS::Handle<JS::Value>, JS::MutableHa` 3; `style::properties::cascade::iter_declarations [libxul.so]` 2; `cssparser::tokenizer::Tokenizer::skip_whitespace [libxul.so]` 2

**tab pid 4048** — 45 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 44 | 18.2 | Other 34, DOM 4, Profiler 3, JavaScript 2 | 0 / 6 / 39 | ipc 31, array_buffer_copy 14, gc_cc 10, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strlen_avx2 [libc.so.6]` 4; `[]` 3; `[libexpat.so.1]` 3; `mozilla::detail::RunnableFunction<mozilla::CallbackThreadRegistrySingl` 2; `[libfontconfig.so.1]` 2; `__lll_lock_wait [libc.so.6]` 2; `js::InitMallocAllocator() [libxul.so]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 3862** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.6 | Idle 3, Graphics 1, Other 0 | 0 / 0 / 4 | ipc 3, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.3 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::gfx::ToDeviceColor(mozilla::gfx::sRGBColor const&) [libxul.so` 1; `[]` 0; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 0; `<firefox_on_glean::private::labeled_counter::LabeledCounterMetric as g` 0

**tab pid 4053** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

