### gecko raf-nosampler (profile pass)

**parent pid 3041** — 492 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 311 | 10.2 | Graphics 217, Idle 93, Other 1 | 0 / 0 / 311 | ipc 301, webrender_render 218, webrender_sw_raster 190, poll_wait 94 |
| WRRenderBackend#0 | 58 | 1.9 | Other 58 | 0 / 0 / 58 | webrender_render 1, poll_wait 1 |
| WRSceneBuilder#0 | 41 | 1.4 | Other 41 | 0 / 0 / 41 | webrender_scene 41, webrender_render 1, poll_wait 1, array_buffer_copy 0 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, paint_layout 1, webrender_scene 0 |
| GeckoMain | 13 | 0.4 | Idle 9, JavaScript 4, Other 0, Graphics 0 | 0 / 3 / 10 | ipc 13, poll_wait 9, gc_cc 4, harness_diagnostics 3 |
| SwComposite | 10 | 0.3 | Other 10 | 0 / 0 / 10 | webrender_render 10, poll_wait 10, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Other 0, Profiler 0 | 0 / 0 / 9 | poll_wait 9, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 9; `mozilla::detail::HashTable<js::WeakHeapPtr<js::WasmGCShape*> const, mo` 1; `JSStructuredCloneWriter::traverseObject(JS::Handle<JSObject*>, js::ESC` 1; `js::NewFunctionWithProto(JSContext*, bool (*)(JSContext*, unsigned int` 1; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheIRStubKey::` 1; `[unknown]` 0; `non-virtual thunk to nsGlobalWindowOuter::AddRef() [libxul.so]` 0; `recvmsg [libc.so.6]` 0

**tab pid 3295** — 153 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 137 | 4.5 | Idle 97, Graphics 16, Layout 11, Other 7 | 0 / 4 / 133 | ipc 132, poll_wait 99, paint_layout 31, memcpy_memset 1 |
| IPC I/O Child | 15 | 0.5 | Idle 15, Other 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 98; `[]` 2; `write [libc.so.6]` 2; `sendmsg [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `getcontext [libc.so.6]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `mozilla::ProfileChunkedBuffer::ReserveAndPutRaw<mozilla::ProfileChunke` 1

**tab pid 3186** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

**tab pid 3233** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `[linux-vdso.so.1]` 0

