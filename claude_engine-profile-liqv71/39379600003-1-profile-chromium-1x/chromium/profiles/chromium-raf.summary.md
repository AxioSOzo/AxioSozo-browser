### chromium raf (profile pass)

**parent pid 3165** — 699 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 196 | 6.4 | Idle 144, JavaScript 29, Other 12, DOM 8 | 3 / 33 / 160 | ipc 196, poll_wait 149, gc_cc 34, worker_messaging 18 |
| DOM Worker | 133 | 4.3 | JavaScript 125, Profiler 5, Other 2 | 0 / 0 / 133 | subprocess_pipe_io 133, worker_messaging 133, ipc 133, js_ctypes 122 |
| Renderer | 130 | 4.2 | Idle 92, Graphics 37 | 0 / 0 / 130 | ipc 130, poll_wait 94, webrender_render 37, webrender_sw_raster 34 |
| SwComposite | 96 | 3.1 | Other 96 | 0 / 0 / 96 | webrender_render 96, poll_wait 79, webrender_sw_raster 16, memcpy_memset 3 |
| WRRenderBackend#0 | 40 | 1.3 | Other 40 | 0 / 0 / 40 | webrender_render 1, memcpy_memset 0 |
| BackgroundThreadPool #2 | 36 | 1.2 | Idle 34, Other 1, Graphics 0 | 0 / 0 / 36 | ipc 36, poll_wait 34, native_receiver 1, memcpy_memset 1 |
| Compositor | 24 | 0.8 | Idle 23, Other 0, Graphics 0 | 0 / 0 / 24 | ipc 24, poll_wait 23, webrender_render 0, canvas_2d 0 |
| Timer | 19 | 0.6 | Other 19 | 0 / 0 / 19 | ipc 19, poll_wait 19 |

Main thread, top self: `poll [libc.so.6]` 145; `[unknown]` 5; `write [libc.so.6]` 3; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 2; `mozilla::PerformanceCounterState::MaybeReportAccumulatedTime(nsTString` 1; `fun_resolve(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS::Property` 1; `nsAtomTable::GetOrInsert(nsTSubstring<char16_t> const&, AtomTableKey&)` 1; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1

**tab pid 3832** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 2, GC / CC 2, Other 0 | 0 / 0 / 4 | ipc 3, poll_wait 2, gc_cc 2, memcpy_memset 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `write [libc.so.6]` 0; `GIFFT_LabeledTimingDistributionAccumulateRawMillis [libxul.so]` 0

**tab pid 3958** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3356** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

