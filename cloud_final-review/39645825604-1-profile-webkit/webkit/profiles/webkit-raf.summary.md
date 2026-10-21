### webkit raf (profile pass)

**parent pid 7154** — 525 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 233 | 7.6 | Idle 174, JavaScript 32, Other 13, DOM 9 | 4 / 37 / 193 | ipc 233, poll_wait 179, gc_cc 32, engine_stream_read 23 |
| DOM Worker | 120 | 3.9 | JavaScript 117, Other 2, Profiler 1 | 0 / 0 / 120 | subprocess_pipe_io 120, worker_messaging 120, ipc 120, js_ctypes 115 |
| Renderer | 44 | 1.4 | Idle 39, Graphics 6, Other 0 | 0 / 0 / 44 | ipc 44, poll_wait 40, webrender_render 6, webrender_sw_raster 4 |
| WRRenderBackend#0 | 32 | 1.0 | Other 32 | 0 / 0 / 32 | memcpy_memset 0, webrender_render 0 |
| Compositor | 23 | 0.7 | Idle 23, Other 0, Graphics 0, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23, webrender_render 0, canvas_2d 0 |
| SwComposite | 20 | 0.7 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 20, memcpy_memset 1, webrender_sw_raster 1 |
| BackgroundThreadPool #3 | 18 | 0.6 | Idle 18, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 18, native_receiver 1, memcpy_memset 1 |
| Timer | 18 | 0.6 | Other 18 | 0 / 0 / 18 | ipc 18, poll_wait 18, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 179; `[unknown]` 8; `[axiosozo-dev]` 2; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 1; `js::jit::X86Encoding::BaseAssembler::X86InstructionFormatter::memoryMo` 1; `js::NativeObject::create(JSContext*, js::gc::AllocKind, js::gc::Heap, ` 1

**tab pid 7709** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | GC / CC 3, Idle 2, Other 0 | 0 / 0 / 5 | poll_wait 3, gc_cc 3, ipc 3, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `[]` 0; `madvise [libc.so.6]` 0

**tab pid 7715** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

**tab pid 7322** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[linux-vdso.so.1]` 0

