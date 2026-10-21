### chromium-2x raf (profile pass)

**parent pid 3314** — 775 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 265 | 8.5 | Idle 178, JavaScript 51, Other 21, DOM 11 | 7 / 50 / 208 | ipc 265, poll_wait 189, gc_cc 60, worker_messaging 31 |
| DOM Worker | 162 | 5.2 | JavaScript 157, Profiler 4, Other 2 | 0 / 0 / 162 | subprocess_pipe_io 162, worker_messaging 162, ipc 162, js_ctypes 151 |
| Renderer | 101 | 3.3 | Idle 73, Graphics 28, Other 1 | 0 / 0 / 101 | ipc 101, poll_wait 77, webrender_render 29, webrender_sw_raster 23 |
| SwComposite | 64 | 2.0 | Other 64 | 0 / 0 / 64 | webrender_render 64, poll_wait 60, memcpy_memset 4, webrender_sw_raster 4 |
| BackgroundThreadPool #3 | 60 | 1.9 | Idle 54, Other 6, Graphics 0 | 0 / 0 / 60 | ipc 60, poll_wait 54, native_receiver 6, memcpy_memset 5 |
| WRRenderBackend#0 | 47 | 1.5 | Other 47, Profiler 0 | 0 / 0 / 47 | webrender_render 1, poll_wait 1, memcpy_memset 0, webrender_scene 0 |
| Compositor | 31 | 1.0 | Idle 31, Other 0, Graphics 0 | 0 / 0 / 31 | ipc 31, poll_wait 31, webrender_render 0, image_container 0 |
| Timer | 22 | 0.7 | Other 22 | 0 / 0 / 22 | ipc 22, poll_wait 22 |

Main thread, top self: `poll [libc.so.6]` 179; `[unknown]` 8; `recvmsg [libc.so.6]` 7; `[axiosozo-dev]` 3; `readAXCF (chrome://browser/content/axiosozo/CEFEngineAdapter.sys.mjs:2` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 2; `write [libc.so.6]` 1

**tab pid 4010** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Other 1, Idle 1, GC / CC 1 | 0 / 0 / 3 | ipc 3, gc_cc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `mozilla::RunnableTask::SetIdleDeadline(mozilla::TimeStamp) [libxul.so]` 1; `poll [libc.so.6]` 1; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 1; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 0; `nsQueryReferent::operator()(nsID const&, void**) const [libxul.so]` 0

**tab pid 3498** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | DOM 1, Idle 1, JavaScript 0 | 0 / 2 / 1 | ipc 3, poll_wait 1, gc_cc 1, array_buffer_copy 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeObject*>, JS` 1; `js::StableCellHasher<js::WeakHeapPtr<js::GlobalObject*> >::match(js::W` 0; `prctl [libc.so.6]` 0; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, JS::Mutable` 0

**tab pid 3480** — 1 ms CPU in the window

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

