### webkit raf (profile pass)

**parent pid 7154** — 782 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 325 | 10.6 | Idle 238, JavaScript 43, Other 26, DOM 14 | 6 / 48 / 270 | ipc 324, poll_wait 252, gc_cc 40, engine_stream_read 25 |
| DOM Worker | 199 | 6.5 | JavaScript 195, Profiler 3, Other 1 | 0 / 0 / 199 | subprocess_pipe_io 199, worker_messaging 199, ipc 199, js_ctypes 182 |
| Renderer | 73 | 2.4 | Idle 61, Graphics 12, Other 0, Profiler 0 | 0 / 0 / 73 | ipc 73, poll_wait 64, webrender_render 12, webrender_sw_raster 7 |
| SwComposite | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_render 42, poll_wait 40, webrender_sw_raster 1, memcpy_memset 1 |
| BackgroundThreadPool #2 | 39 | 1.3 | Idle 36, Other 3, Graphics 0 | 0 / 0 / 39 | ipc 39, poll_wait 36, native_receiver 3, memcpy_memset 2 |
| WRRenderBackend#0 | 33 | 1.1 | Other 33 | 0 / 0 / 33 | poll_wait 0, webrender_render 0, array_buffer_copy 0, memcpy_memset 0 |
| Compositor | 29 | 1.0 | Idle 28, Other 1, Profiler 0, Graphics 0 | 0 / 0 / 29 | ipc 29, poll_wait 29, webrender_render 0, image_container 0 |
| Timer | 23 | 0.8 | Other 23, Profiler 0 | 0 / 0 / 23 | ipc 23, poll_wait 23, memcpy_memset 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 248; `[unknown]` 5; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 4; `__lll_lock_wait [libc.so.6]` 2; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 1; `[axiosozo-dev]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1

**tab pid 7698** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.2 | GC / CC 3, Idle 1, Other 0 | 0 / 0 / 5 | ipc 4, gc_cc 3, poll_wait 2, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `GraphWalker<ScanBlackVisitor>::DoWalk(nsDeque<PtrInfo>&) [libxul.so]` 1; `js::gc::BufferAllocator::markTenuredAlloc(void*) [libxul.so]` 1; `__memset_avx512_unaligned_erms [libc.so.6]` 0; `NS_TableDrivenQI(void*, nsID const&, void**, QITableEntry const*) [lib` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 7704** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `mozilla::Variant<nsTimerImpl::UnknownCallback, nsCOMPtr<nsITimerCallba` 0

**tab pid 7319** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

