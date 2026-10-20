### gecko-debian idle (profile pass)

**parent pid 8116** — 625 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 336 | 16.3 | JavaScript 134, DOM 70, Idle 54, GC / CC 45 | 34 / 206 / 96 | worker_messaging 336, ipc 335, gc_cc 86, poll_wait 60 |
| GeckoMain | 274 | 13.3 | JavaScript 116, DOM 77, Other 35, Idle 33 | 18 / 155 / 101 | ipc 273, gc_cc 179, array_buffer_copy 53, poll_wait 51 |
| Socket Thread | 7 | 0.3 | Other 7 | 0 / 0 / 7 | ipc 7, poll_wait 5 |
| Compositor | 2 | 0.1 | Idle 1, Other 1 | 0 / 0 / 2 | ipc 2, poll_wait 1, memcpy_memset 1 |
| BackgroundThreadPool #2 | 2 | 0.1 | Idle 1, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 1 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| DOM Worker | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | worker_messaging 1, ipc 1, poll_wait 1 |
| Renderer | 1 | 0.0 | Idle 0, Graphics 0 | 0 / 0 / 1 | ipc 1, poll_wait 0, memcpy_memset 0, webrender_render 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 45; `[unknown]` 24; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 7; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 7; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 4; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 4

**tab pid 8370** — 43 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 36 | 1.8 | Idle 23, GC / CC 6, JavaScript 4, Layout 2 | 0 / 5 / 32 | ipc 35, poll_wait 24, gc_cc 8, array_buffer_copy 3 |
| IPC I/O Child | 6 | 0.3 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 2; `js::LookupProperty(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS::P` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shape**, char ` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePtr<JSO` 1; `js::jit::InlinableNativeIRGenerator::tryAttachStub() [libxul.so]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1

**tab pid 8205** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Profiler 0, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13ReserveAndP` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message const&) [l` 0; `[linux-vdso.so.1]` 0

**tab pid 8308** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `g_ptr_array_set_size [libglib-2.0.so.0]` 0

