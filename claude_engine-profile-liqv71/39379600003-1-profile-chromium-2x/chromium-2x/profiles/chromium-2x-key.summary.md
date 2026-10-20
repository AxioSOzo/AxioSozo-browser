### chromium-2x key (profile pass)

**parent pid 3371** — 927 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 378 | 10.2 | Idle 161, JavaScript 80, Layout 40, Other 32 | 10 / 133 / 235 | ipc 378, poll_wait 199, gc_cc 97, paint_layout 75 |
| DOM Worker | 258 | 7.0 | JavaScript 252, Other 3, Profiler 2, GC / CC 1 | 0 / 0 / 258 | subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 242 |
| Renderer | 96 | 2.6 | Graphics 71, Idle 25 | 0 / 0 / 96 | ipc 96, webrender_render 71, webrender_sw_raster 65, poll_wait 25 |
| SwComposite | 82 | 2.2 | Other 82 | 0 / 0 / 82 | webrender_render 82, webrender_sw_raster 46, poll_wait 36, memcpy_memset 18 |
| Timer | 36 | 1.0 | Other 36, Profiler 0 | 0 / 0 / 36 | ipc 36, poll_wait 36 |
| BackgroundThreadPool #1 | 20 | 0.5 | Idle 17, Other 3 | 0 / 0 / 20 | ipc 20, poll_wait 17, native_receiver 3, memcpy_memset 3 |
| DOM Worker | 15 | 0.5 | Other 14, GC / CC 1, Idle 0 | 0 / 0 / 15 | ipc 15, gc_cc 15, memcpy_memset 1, worker_messaging 0 |
| Compositor | 14 | 0.4 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 14, canvas_2d 0, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 164; `[unknown]` 11; `[axiosozo-dev]` 7; `write [libc.so.6]` 5; `mprotect [libc.so.6]` 4; `recvmsg [libc.so.6]` 4; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 3

**tab pid 3458** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 1, DOM 0 | 0 / 1 / 6 | ipc 7, poll_wait 6, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `[unknown]` 0; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Ini` 0; `JS::Compartment::wrap(JSContext*, JS::MutableHandle<JS::Value>) [libxu` 0; `js::NativeObject::lookup(JSContext*, JS::PropertyKey) [libxul.so]` 0; `JSStructuredCloneReader::startReadUnchecked(JS::MutableHandle<JS::Valu` 0; `js::jit::MaybeEnterJit(JSContext*, js::RunState&) [libxul.so]` 0; `nsTSubstring<char>::StartBulkWriteImpl(unsigned long, unsigned long, b` 0

**tab pid 3542** — 1 ms CPU in the window

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

**tab pid 4151** — 1 ms CPU in the window

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

