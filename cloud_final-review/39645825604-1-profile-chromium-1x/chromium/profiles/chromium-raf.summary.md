### chromium raf (profile pass)

**parent pid 3299** — 534 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 208 | 6.7 | Idle 154, JavaScript 31, DOM 10, Other 9 | 5 / 35 / 168 | ipc 208, poll_wait 157, gc_cc 38, engine_stream_read 20 |
| DOM Worker | 136 | 4.4 | JavaScript 134, Profiler 1, Other 1 | 0 / 0 / 136 | subprocess_pipe_io 136, worker_messaging 136, ipc 136, js_ctypes 130 |
| Renderer | 48 | 1.5 | Idle 42, Graphics 5, Other 1, Profiler 0 | 0 / 0 / 48 | ipc 48, poll_wait 42, webrender_render 6, webrender_sw_raster 4 |
| WRRenderBackend#0 | 38 | 1.2 | Other 38 | 0 / 0 / 38 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| Compositor | 26 | 0.8 | Idle 25, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 25, webrender_render 0, memcpy_memset 0 |
| BackgroundThreadPool #2 | 21 | 0.7 | Idle 20, Other 1 | 0 / 0 / 21 | ipc 21, poll_wait 20, native_receiver 1, memcpy_memset 1 |
| SwComposite | 20 | 0.7 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 20, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 18 | 0.6 | Other 18, Profiler 0 | 0 / 0 / 18 | ipc 18, poll_wait 18, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 153; `[unknown]` 5; `__memmove_avx512_unaligned_erms [libc.so.6]` 2; `write [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `mprotect [libc.so.6]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 1; `recvmsg [libc.so.6]` 1

**tab pid 3973** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | GC / CC 4, Idle 2 | 0 / 0 / 5 | ipc 5, gc_cc 4, poll_wait 2, array_buffer_copy 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `js::gc::BufferAllocator::TraceEdge(JSTracer*, void**, char const*) [li` 1; `CCGraphBuilder::DescribeGCedNode(bool, char const*, unsigned long) [li` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `mozilla::dom::Document::cycleCollection::Trace(void*, TraceCallbacks c` 1; `nsGlobalWindowOuter::cycleCollection::CanSkipReal(void*, bool) [libxul` 0; `js::StringPrinter::put(char const*, unsigned long) [libxul.so]` 0

**tab pid 4163** — 1 ms CPU in the window

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

**tab pid 3978** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

