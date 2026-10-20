### chromium-2x-control switch-to-gecko (profile pass)

**parent pid 4435** — 221 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| DOM Worker | 72 | 0.5 | GC / CC 32, Other 24, JavaScript 14, Idle 2 | 0 / 0 / 72 | subprocess_pipe_io 72, worker_messaging 72, ipc 72, gc_cc 56 |
| GeckoMain | 70 | 0.4 | Idle 19, JavaScript 18, Layout 17, Other 10 | 2 / 28 / 41 | ipc 70, paint_layout 24, poll_wait 19, array_buffer_copy 12 |
| Renderer | 47 | 0.3 | Graphics 45, Idle 2 | 0 / 0 / 47 | ipc 47, webrender_render 45, webrender_sw_raster 44, poll_wait 2 |
| BgIOThreadPool #2 | 9 | 0.1 | Other 8, Idle 1 | 0 / 0 / 9 | ipc 9, poll_wait 1 |
| IPC I/O Parent | 7 | 0.0 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 6, ipc 0 |
| Compositor | 5 | 0.0 | Idle 3, Other 2 | 0 / 0 / 5 | ipc 5, poll_wait 3, memcpy_memset 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| SwComposite | 3 | 0.0 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 2, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `poll [libc.so.6]` 19; `sendmsg [libc.so.6]` 4; `madvise [libc.so.6]` 3; `style::properties::generated::longhands::flex_shrink::cascade_property` 2; `hashbrown::raw::RawTable<T,A>::reserve_rehash [libxul.so]` 1; `ProfilingStack::pushLabelFrame(char const*, char const*, void*, JS::Pr` 1; `JSAutoRealm::~JSAutoRealm() [libxul.so]` 1; `nsStyleBorder::~nsStyleBorder() [libxul.so]` 1

**tab pid 4627** — 10 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 5, JavaScript 1, DOM 1, Other 0 | 0 / 2 / 5 | ipc 7, poll_wait 5, gc_cc 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `JSFunction::create(JSContext*, js::gc::AllocKind, js::gc::Heap, JS::Ha` 1; `js::jit::CacheRegisterAllocator::useRegister(js::jit::MacroAssembler&,` 1; `read [libc.so.6]` 0; `js::jit::CanBaselineCompileScript(JSContext*, JSScript*) [libxul.so]` 0; `fog_serialize_ipc_buf [libxul.so]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 4588** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Other 0 | 0 / 0 / 4 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `__lll_lock_wait [libc.so.6]` 0

**tab pid 4891** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 4, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 4, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `sendmsg [libc.so.6]` 1; `mozilla::EventTargetChainItem::HandleEventTargetChain(nsTArray<mozilla` 0

