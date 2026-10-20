### gecko-2x idle (profile pass)

**parent pid 3089** — 1220 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 610 | 28.6 | JavaScript 206, Idle 133, DOM 109, GC / CC 106 | 46 / 371 / 193 | worker_messaging 610, ipc 610, gc_cc 171, poll_wait 145 |
| GeckoMain | 574 | 26.9 | JavaScript 187, DOM 146, Idle 108, Other 94 | 32 / 265 / 277 | ipc 574, gc_cc 315, poll_wait 159, array_buffer_copy 94 |
| Socket Thread | 22 | 1.0 | Other 22 | 0 / 0 / 22 | ipc 21, poll_wait 17 |
| BackgroundThreadPool #1 | 5 | 0.2 | Other 3, Idle 2, Profiler 0 | 0 / 0 / 5 | ipc 5, poll_wait 2 |
| Compositor | 2 | 0.1 | Other 2, Idle 1 | 0 / 0 / 2 | ipc 2, memcpy_memset 1, poll_wait 1 |
| DOM Worker | 2 | 0.1 | Idle 2, JavaScript 0 | 0 / 0 / 2 | worker_messaging 2, ipc 2, poll_wait 2, array_buffer_copy 0 |
| IPC I/O Parent | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 1 | 0.1 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 119; `[unknown]` 26; `recvmsg [libc.so.6]` 22; `[axiosozo-dev]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 13; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 13; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 12; `next (self-hosted:392:27)[17]` 8

**tab pid 3330** — 45 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 1.7 | Idle 25, GC / CC 4, JavaScript 3, Other 3 | 0 / 5 / 32 | ipc 35, poll_wait 25, gc_cc 8, array_buffer_copy 3 |
| IPC I/O Child | 7 | 0.3 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 25; `sendmsg [libc.so.6]` 2; `[]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 1; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 1; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBarrier(js::` 1; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 1; `js::jit::CacheIRCompiler::emitObjectToIteratorResult(js::jit::ObjOpera` 1

**tab pid 3272** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | Idle 4, JavaScript 0, Other 0 | 0 / 0 / 4 | ipc 5, poll_wait 4, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::jit::CacheRegisterAllocator::initInputLocation(unsigned long, js::` 0; `[linux-vdso.so.1]` 0; `pthread_rwlock_rdlock@GLIBC_2.2.5 [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3188** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `[linux-vdso.so.1]` 0; `write [libc.so.6]` 0

