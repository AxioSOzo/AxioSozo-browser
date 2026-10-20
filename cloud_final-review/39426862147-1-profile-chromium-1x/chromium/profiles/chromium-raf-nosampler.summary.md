### chromium raf-nosampler (profile pass)

**parent pid 3278** — 683 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 270 | 8.8 | JavaScript 264, Other 5, Profiler 2 | 0 / 0 / 270 | subprocess_pipe_io 270, worker_messaging 270, ipc 270, js_ctypes 255 |
| GeckoMain | 180 | 5.9 | Idle 100, JavaScript 50, Other 18, DOM 10 | 7 / 46 / 127 | ipc 180, poll_wait 107, gc_cc 60, worker_messaging 34 |
| Renderer | 67 | 2.2 | Idle 54, Graphics 12, Other 0 | 0 / 0 / 67 | ipc 67, poll_wait 56, webrender_render 12, webrender_sw_raster 10 |
| WRRenderBackend#0 | 37 | 1.2 | Other 37 | 0 / 0 / 37 | webrender_render 0 |
| SwComposite | 36 | 1.2 | Other 36 | 0 / 0 / 36 | webrender_render 36, poll_wait 35, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 34 | 1.1 | Idle 33, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 34 | ipc 34, poll_wait 34, webrender_render 1, canvas_2d 0 |
| BackgroundThreadPool #2 | 34 | 1.1 | Idle 33, Other 1 | 0 / 0 / 34 | ipc 34, poll_wait 33, native_receiver 1, memcpy_memset 0 |
| ImageBridgeChld | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, image_container 0 |

Main thread, top self: `poll [libc.so.6]` 102; `[unknown]` 9; `recvmsg [libc.so.6]` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `mprotect [libc.so.6]` 2; `js::jit::MacroAssemblerX86Shared::~MacroAssemblerX86Shared() [libxul.s` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 2; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 2

**tab pid 3460** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 3, JavaScript 1, DOM 1 | 0 / 2 / 3 | ipc 5, poll_wait 3, gc_cc 2 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBarrier(js::` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `js::PromiseObject::allocationSite() [libxul.so]` 0

**tab pid 4175** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3441** — 1 ms CPU in the window

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

