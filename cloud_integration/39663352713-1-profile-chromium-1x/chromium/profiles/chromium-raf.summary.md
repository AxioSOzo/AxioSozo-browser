### chromium raf (profile pass)

**parent pid 3349** — 669 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 248 | 8.0 | Idle 182, JavaScript 38, Other 17, DOM 8 | 6 / 37 / 204 | ipc 248, poll_wait 193, gc_cc 37, worker_messaging 23 |
| DOM Worker | 198 | 6.4 | JavaScript 194, Other 3, Profiler 2 | 0 / 0 / 198 | subprocess_pipe_io 198, worker_messaging 198, ipc 198, js_ctypes 186 |
| Renderer | 58 | 1.9 | Idle 50, Graphics 8 | 0 / 0 / 58 | ipc 58, poll_wait 51, webrender_render 8, webrender_sw_raster 6 |
| WRRenderBackend#0 | 35 | 1.1 | Other 35 | 0 / 0 / 35 | webrender_render 1, poll_wait 0, webrender_sw_raster 0 |
| SwComposite | 32 | 1.0 | Other 32 | 0 / 0 / 32 | webrender_render 32, poll_wait 30, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #1 | 29 | 0.9 | Idle 28, Other 1 | 0 / 0 / 29 | ipc 29, poll_wait 28, native_receiver 1, memcpy_memset 1 |
| Compositor | 28 | 0.9 | Idle 27, Other 1, Graphics 0, Profiler 0 | 0 / 0 / 28 | ipc 28, poll_wait 27, webrender_render 0, canvas_2d 0 |
| Timer | 23 | 0.7 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `poll [libc.so.6]` 183; `[unknown]` 5; `recvmsg [libc.so.6]` 3; `write [libc.so.6]` 3; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `js::ModuleObject::environment() const [libxul.so]` 2; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:2` 2; `EnterJit(JSContext*, js::RunState&, unsigned char*) [libxul.so]` 2

**tab pid 4039** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | GC / CC 3, Idle 2, Other 0 | 0 / 0 / 5 | ipc 5, gc_cc 3, poll_wait 2, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `CCGraphBuilder::DescribeGCedNode(bool, char const*, unsigned long) [li` 1; `bool js::gc::MarkingTracerT<8u>::onEdge<JSString>(JSString**, char con` 1; `js::gc::TraceEdgeInternal(JSTracer*, JS::Value*, char const*) [libxul.` 1; `madvise [libc.so.6]` 0

**tab pid 3508** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `nsThread::DoMainThreadSpecificProcessing() const [libxul.so]` 0

**tab pid 3555** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `write [libc.so.6]` 0

