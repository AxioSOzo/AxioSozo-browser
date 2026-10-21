### chromium switch-to-gecko (profile pass)

**parent pid 3367** — 518 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BgIOThreadPool #1 | 345 | 2.3 | Other 344, Idle 1 | 0 / 0 / 345 | ipc 345, poll_wait 1 |
| GeckoMain | 80 | 0.5 | JavaScript 25, Idle 20, Layout 16, Other 6 | 2 / 38 / 40 | ipc 80, paint_layout 22, poll_wait 22, gc_cc 20 |
| DOM Worker | 53 | 0.3 | GC / CC 19, Other 18, JavaScript 11, Profiler 2 | 0 / 0 / 53 | subprocess_pipe_io 53, worker_messaging 53, ipc 53, gc_cc 37 |
| Renderer | 18 | 0.1 | Graphics 16, Idle 3 | 0 / 0 / 18 | ipc 18, webrender_render 16, webrender_sw_raster 15, poll_wait 3 |
| IPC I/O Parent | 7 | 0.0 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Compositor | 5 | 0.0 | Idle 4, Other 0 | 0 / 0 / 5 | ipc 5, poll_wait 4, memcpy_memset 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 | memcpy_memset 0, webrender_render 0, poll_wait 0 |
| Timer | 3 | 0.0 | Other 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |

Main thread, top self: `poll [libc.so.6]` 20; `mprotect [libc.so.6]` 8; `[axiosozo-dev]` 4; `__lll_lock_wait [libc.so.6]` 3; `_Unwind_Find_FDE@@GCC_3.0 [libgcc_s.so.1]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `g_source_ref [libglib-2.0.so.0]` 1; `recvmsg [libc.so.6]` 1

**tab pid 3551** — 12 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 9 | 0.1 | Idle 6, JavaScript 1, DOM 1, Other 0 | 0 / 2 / 7 | ipc 8, poll_wait 6, gc_cc 2, array_buffer_copy 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 1; `js::jit::AssemblerX86Shared::jmpSrc(js::jit::Label*) [libxul.so]` 1; `js::jit::MacroAssembler::call(js::jit::Address const&) [libxul.so]` 0; `js::Wrapper::New(JSContext*, JSObject*, js::Wrapper const*, js::Wrappe` 0; `g_main_context_iteration [libglib-2.0.so.0]` 0; `[]` 0; `[libnspr4.so]` 0

**tab pid 4034** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 4, Layout 1, Graphics 1 | 0 / 0 / 5 | ipc 5, poll_wait 4, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `[]` 1

**tab pid 4039** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `mozilla::ipc::PIdleSchedulerChild::OnMessageReceived(IPC::Message cons` 0; `sendmsg [libc.so.6]` 0

