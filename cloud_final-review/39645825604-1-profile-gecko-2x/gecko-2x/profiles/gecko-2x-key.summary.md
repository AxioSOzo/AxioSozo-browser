### gecko-2x key (profile pass)

**parent pid 2925** — 159 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 92 | 2.5 | Idle 36, Layout 18, Other 13, Graphics 13 | 0 / 11 / 81 | ipc 92, poll_wait 44, paint_layout 33, gc_cc 5 |
| Renderer | 25 | 0.7 | Idle 16, Graphics 9 | 0 / 0 / 25 | ipc 25, poll_wait 17, webrender_render 9, webrender_sw_raster 8 |
| WRRenderBackend#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 |  |
| Compositor | 10 | 0.3 | Idle 9, Other 1 | 0 / 0 / 10 | ipc 10, poll_wait 9, memcpy_memset 1, canvas_2d 0 |
| WRSceneBuilder#0 | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_scene 8, webrender_render 0, poll_wait 0, memcpy_memset 0 |
| IPC I/O Parent | 5 | 0.1 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| SwComposite | 5 | 0.1 | Other 5 | 0 / 0 / 5 | webrender_render 5, poll_wait 4, memcpy_memset 1, webrender_sw_raster 1 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 36; `mozilla::detail::MutexImpl::lock() [axiosozo-dev]` 2; `writev [libc.so.6]` 2; `nsLineLayout::AllowForStartMargin(nsLineLayout::PerFrameData*, mozilla` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1; `recvmsg [libc.so.6]` 1; `js::jit::MacroAssembler::Push(js::jit::Register) [libxul.so]` 1

**tab pid 3182** — 47 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 1.2 | Idle 20, Other 6, GC / CC 6, JavaScript 4 | 0 / 5 / 38 | ipc 39, poll_wait 20, gc_cc 8, paint_layout 8 |
| IPC I/O Child | 4 | 0.1 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 20; `[]` 2; `sendmsg [libc.so.6]` 2; `profiler_capture_backtrace_into(mozilla::ProfileChunkedBuffer&, mozill` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `void js::Scope::applyScopeDataTyped<js::Scope::traceChildren(JSTracer*` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Heap<JSObject*>, ` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1

**tab pid 3016** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.1 | Idle 4, JavaScript 0, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 4, array_buffer_copy 1, gc_cc 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `mozilla::dom::PWindowGlobalParent::SendRawMessage(mozilla::dom::JSActo` 0; `WriteStructuredClone(JSContext*, JS::Handle<JS::Value>, JSStructuredCl` 0; `sendmsg [libc.so.6]` 0; `js::InitFunctionEnvironmentObjects(JSContext*, js::AbstractFramePtr) [` 0

**tab pid 3071** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[linux-vdso.so.1]` 0

