### chromium idle (profile pass)

**parent pid 3402** — 1582 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 754 | 34.8 | JavaScript 310, Idle 143, GC / CC 119, DOM 113 | 87 / 449 / 218 | worker_messaging 753, ipc 751, gc_cc 189, poll_wait 157 |
| GeckoMain | 643 | 29.6 | JavaScript 196, DOM 147, Idle 145, Other 113 | 33 / 276 / 335 | ipc 643, gc_cc 308, poll_wait 194, array_buffer_copy 127 |
| DOM Worker | 135 | 6.2 | JavaScript 135 | 0 / 0 / 135 | subprocess_pipe_io 135, js_ctypes 135, worker_messaging 135, ipc 135 |
| Timer | 21 | 1.0 | Other 21 | 0 / 0 / 21 | ipc 21, poll_wait 21 |
| Socket Thread | 16 | 0.7 | Other 16 | 0 / 0 / 16 | ipc 16, poll_wait 15 |
| BackgroundThreadPool #2 | 5 | 0.2 | Other 3, Idle 2 | 0 / 0 / 5 | ipc 5, poll_wait 2 |
| BgIOThreadPool #2 | 4 | 0.2 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3 |
| DOM Worker | 2 | 0.1 | Idle 2, JavaScript 1 | 0 / 1 / 2 | worker_messaging 2, ipc 2, poll_wait 2, gc_cc 1 |

Main thread, top self: `poll [libc.so.6]` 150; `[axiosozo-dev]` 34; `[unknown]` 33; `__memmove_avx_unaligned_erms [libc.so.6]` 32; `recvmsg [libc.so.6]` 17; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 11; `validate (chrome://global/content/third_party/cfworker/json-schema.js:` 11; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 9

**tab pid 3604** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.2 | Idle 4, DOM 0, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 0; `__lll_lock_wait [libc.so.6]` 0; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 3506** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `read [libc.so.6]` 0; `mozilla::CheckIdleMemoryCleanupNeeded(nsITimer*, void*) [libxul.so]` 0

**utility pid 3655** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2 |
| GeckoMain | 2 | 0.1 | Idle 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 2

