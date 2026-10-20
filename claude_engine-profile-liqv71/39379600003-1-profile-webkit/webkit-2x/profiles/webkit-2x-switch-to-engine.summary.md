### webkit-2x switch-to-engine (profile pass)

**parent pid 8750** — 203 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 85 | 10.9 | GC / CC 32, JavaScript 22, Idle 11, DOM 9 | 1 / 32 / 52 | ipc 85, gc_cc 60, poll_wait 13, engine_stream_read 13 |
| DOM Worker | 57 | 7.3 | JavaScript 50, Profiler 5, Other 2, Idle 0 | 0 / 0 / 57 | subprocess_pipe_io 57, worker_messaging 57, ipc 57, poll_wait 39 |
| Renderer | 31 | 3.9 | Graphics 29, Idle 1 | 0 / 0 / 31 | ipc 31, webrender_render 29, webrender_sw_raster 26, poll_wait 1 |
| BackgroundThreadPool #4 | 10 | 1.3 | Idle 7, Other 3 | 0 / 0 / 10 | ipc 10, poll_wait 7, native_receiver 3, memcpy_memset 2 |
| SwComposite | 7 | 0.9 | Other 7 | 0 / 0 / 7 | webrender_render 7, poll_wait 4, webrender_sw_raster 4 |
| IPC I/O Parent | 3 | 0.4 | Idle 3, Other 1 | 0 / 0 / 3 | poll_wait 3, ipc 1, memcpy_memset 0 |
| Compositor | 3 | 0.4 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| WRRenderBackend#0 | 2 | 0.3 | Other 2 | 0 / 0 / 2 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 18; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `u_charType_78 [libxul.so]` 4; `[axiosozo-dev]` 3; `js::Shape::replaceShape(JSContext*, JS::Handle<JSObject*>, js::EnumFla` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `js::ScriptWarmUpData::trace(JSTracer*) [libxul.so]` 3

**tab pid 9369** — 51 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 50 | 7.7 | Other 40, JavaScript 4, DOM 3, Profiler 2 | 0 / 6 / 45 | ipc 38, array_buffer_copy 17, gc_cc 12, subprocess_pipe_io 4 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `[]` 6; `__read_nocancel [libc.so.6]` 3; `[libfontconfig.so.1]` 3; `__syscall_cancel_arch [libc.so.6]` 2; `[libexpat.so.1]` 2; `nsTArray_base<nsTArray_RelocateUsingMemutils>::ShrinkCapacity(unsigned` 2; `do_lookup_x [ld-linux-x86-64.so.2]` 2; `__strlen_avx2 [libc.so.6]` 1

**tab pid 9373** — 49 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 48 | 6.9 | Other 37, DOM 4, JavaScript 4, Profiler 3 | 0 / 4 / 43 | ipc 35, array_buffer_copy 17, gc_cc 16, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strlen_avx2 [libc.so.6]` 3; `__syscall_cancel_arch [libc.so.6]` 3; `[libexpat.so.1]` 3; `PR_Free [libnspr4.so]` 2; `js::gc::StoreBuffer::enable() [libxul.so]` 2; `[libfontconfig.so.1]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 1

**tab pid 9277** — 2 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.2 | Idle 2, Layout 0 | 0 / 0 / 2 | ipc 2, poll_wait 2, paint_layout 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 2; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom const*, b` 0

