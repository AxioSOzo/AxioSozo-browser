### gecko-debian idle (profile pass)

**parent pid 8177** — 45 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 31 | 1.5 | GC / CC 30, Other 1, Idle 0 | 0 / 0 / 31 | worker_messaging 31, ipc 31, gc_cc 30, memcpy_memset 15 |
| GeckoMain | 8 | 0.4 | Idle 3, JavaScript 3, Other 1, Graphics 1 | 0 / 3 / 5 | ipc 8, poll_wait 4, harness_diagnostics 2, gc_cc 1 |
| DOM Worker | 2 | 0.1 | GC / CC 1, Other 1, Idle 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 2, memcpy_memset 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Renderer | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| SwComposite | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_render 0, poll_wait 0 |
| WRSceneBuilder#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_scene 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `[unknown]` 1; `bool js::NativeLookupOwnProperty<(js::AllowGC)1>(JSContext*, js::Maybe` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 1; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeObject*>, JS` 1; `isSafeInteger (self-hosted:2519:30)[8]` 0; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, JSAtom*) [l` 0

**tab pid 8424** — 20 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 16 | 0.8 | Idle 12, JavaScript 3, Other 1, Profiler 0 | 0 / 4 / 13 | ipc 16, poll_wait 12, harness_diagnostics 3, gc_cc 3 |
| IPC I/O Child | 4 | 0.2 | Idle 4, Other 0 | 0 / 0 / 4 | poll_wait 4, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 13; `js::frontend::TokenStreamSpecific<char16_t, js::frontend::ParserAnyCha` 1; `mozilla::HashSet<void*, mozilla::PointerHasher<void*>, js::SystemAlloc` 1; `js::OpaqueCrossCompartmentWrapper::hasOwn(JSContext*, JS::Handle<JSObj` 1; `js::Proxy::call(JSContext*, JS::Handle<JSObject*>, JS::CallArgs const&` 0; `auto mozilla::ProfileChunkedBuffer::Read<mozilla::ProfileBufferEntryWr` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0

**tab pid 8361** — 1 ms CPU in the window

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

**tab pid 8342** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `[]` 0

