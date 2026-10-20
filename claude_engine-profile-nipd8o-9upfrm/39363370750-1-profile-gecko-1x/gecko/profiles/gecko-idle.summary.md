### gecko idle (profile pass)

**parent pid 3047** — 1280 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 740 | 34.6 | JavaScript 292, GC / CC 171, Idle 124, DOM 93 | 72 / 421 / 247 | worker_messaging 735, ipc 735, gc_cc 243, poll_wait 135 |
| GeckoMain | 506 | 23.7 | JavaScript 166, DOM 148, Idle 95, Other 67 | 30 / 256 / 220 | ipc 505, gc_cc 296, poll_wait 122, array_buffer_copy 102 |
| Socket Thread | 17 | 0.8 | Other 17 | 0 / 0 / 17 | ipc 17, poll_wait 13, memcpy_memset 1 |
| BackgroundThreadPool #1 | 9 | 0.4 | Other 6, Idle 2 | 0 / 0 / 9 | ipc 9, poll_wait 2 |
| Compositor | 3 | 0.2 | Other 2, Idle 2 | 0 / 0 / 3 | ipc 3, memcpy_memset 2, poll_wait 2 |
| DOM Worker | 2 | 0.1 | JavaScript 1, Idle 1 | 0 / 1 / 1 | worker_messaging 2, ipc 2, poll_wait 1, gc_cc 1 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Parent | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 98; `[unknown]` 26; `[axiosozo-dev]` 22; `__memmove_avx_unaligned_erms [libc.so.6]` 18; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 15; `recvmsg [libc.so.6]` 10; `mprotect [libc.so.6]` 8; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 6

**tab pid 3287** — 45 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 36 | 1.7 | Idle 28, JavaScript 4, Profiler 1, Layout 1 | 0 / 5 / 30 | ipc 35, poll_wait 28, gc_cc 3, array_buffer_copy 3 |
| IPC I/O Child | 9 | 0.4 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 28; `bool mozilla::HashSet<js::jit::ExecutablePool*, mozilla::DefaultHasher` 1; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc<(js::Allo` 1; `js::frontend::FunctionScriptEmitter::emitExtraBodyVarScope() [libxul.s` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 1; `core::hash::BuildHasher::hash_one [libxul.so]` 0; `js::jit::BytecodeAnalysis::init() [libxul.so]` 0; `js::jit::JitZone::getBaselineCacheIRStubCode(js::jit::CacheIRStubKey::` 0

**tab pid 3228** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.2 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `close [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3138** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | ipc 2, poll_wait 2 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2

