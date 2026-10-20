### gecko-debian idle (profile pass)

**parent pid 8214** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 39 | 1.9 | Other 35, GC / CC 3, Profiler 1, Idle 0 | 0 / 0 / 39 | worker_messaging 39, ipc 39, gc_cc 39, memcpy_memset 11 |
| GeckoMain | 7 | 0.4 | Idle 4, JavaScript 3, DOM 1, Other 0 | 0 / 3 / 4 | ipc 7, poll_wait 4, harness_diagnostics 2, gc_cc 2 |
| DOM Worker | 2 | 0.1 | Other 2, Idle 1 | 0 / 0 / 2 | worker_messaging 2, ipc 2, gc_cc 2, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Other 0, Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BgIOThreadPool #2 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 4; `js::jit::CacheIRStubKey::hash(js::jit::CacheIRStubKey::Lookup const&) ` 1; `js::DependentAddPtr<JS::GCHashSet<js::WeakHeapPtr<js::SavedFrame*>, js` 1; `nsTSubstring<char>::AppendASCII(char const*, unsigned long, std::nothr` 1; `js::NativeObject::moveDenseElements(unsigned int, unsigned int, unsign` 0; `__tls_get_addr [ld-linux-x86-64.so.2]` 0; `execute (chrome://remote/content/marionette/server.sys.mjs:284:16)[62]` 0; `[linux-vdso.so.1]` 0

**tab pid 8469** — 24 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 19 | 0.9 | Idle 15, JavaScript 2, Other 1, Profiler 1 | 0 / 2 / 17 | ipc 19, poll_wait 15, harness_diagnostics 2, array_buffer_copy 2 |
| IPC I/O Child | 5 | 0.2 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 15; `mozilla::detail::RunnableMethodImpl<webrtc::DesktopCaptureImpl*, void ` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::emitConsta` 1; `CanEnterBaselineJIT(JSContext*, JS::Handle<JSScript*>, js::AbstractFra` 0; `mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Compartment*, js:` 0; `js::jit::IRGenerator::emitConstantDataPropertyResult(js::NativeObject*` 0; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 0; `__strlen_evex [libc.so.6]` 0

**tab pid 8400** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8552** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

