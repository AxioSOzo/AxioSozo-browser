### chromium-2x key (profile pass)

**parent pid 3331** — 884 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 397 | 10.7 | Idle 169, JavaScript 79, Layout 42, Other 41 | 9 / 130 / 258 | ipc 397, poll_wait 210, gc_cc 92, paint_layout 86 |
| DOM Worker | 222 | 6.0 | JavaScript 219, Profiler 3, Other 0 | 0 / 0 / 222 | subprocess_pipe_io 222, worker_messaging 222, ipc 222, js_ctypes 212 |
| Renderer | 118 | 3.2 | Graphics 102, Idle 16, Other 0 | 0 / 0 / 118 | ipc 112, webrender_render 102, webrender_sw_raster 90, poll_wait 16 |
| SwComposite | 48 | 1.3 | Other 48 | 0 / 0 / 48 | webrender_render 48, poll_wait 27, webrender_sw_raster 20, memcpy_memset 19 |
| Timer | 34 | 0.9 | Other 34, Profiler 0 | 0 / 0 / 34 | ipc 34, poll_wait 34, memcpy_memset 0 |
| WRRenderBackend#0 | 17 | 0.5 | Other 17 | 0 / 0 / 17 |  |
| Compositor | 16 | 0.4 | Idle 15, Other 1, Profiler 0 | 0 / 0 / 16 | ipc 16, poll_wait 15, memcpy_memset 1, paint_layout 0 |
| WRSceneBuilder#0 | 9 | 0.2 | Other 8, Graphics 1 | 0 / 0 / 9 | webrender_scene 9, webrender_sw_raster 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 171; `[axiosozo-dev]` 13; `[unknown]` 12; `write [libc.so.6]` 11; `recvmsg [libc.so.6]` 7; `void js::gc::AtomRefRuntime::recordRef<JSAtom>(JSContext*, JSAtom*) [l` 5; `__lll_lock_wait [libc.so.6]` 4; `mprotect [libc.so.6]` 3

**tab pid 3437** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 6, JavaScript 0, Other 0 | 0 / 0 / 7 | ipc 7, poll_wait 6, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `js::jit::Assembler::movq(js::jit::ImmWord, js::jit::Register) [libxul.` 0; `get (resource://gre/modules/ExtensionUtils.sys.mjs:102:6)[7]` 0; `mozilla::xpcom::StaticComponents::LookupByContractID(nsTSubstring<char` 0; `IPC::ParamTraits<JSStructuredCloneData>::Read(IPC::MessageReader*, JSS` 0; `xpc::SelfHostedShmem::AddRef() [libxul.so]` 0; `IPC::ParamTraits<mozilla::dom::JSIPCValue>::Read(IPC::MessageReader*) ` 0; `nsXULPrototypeCache::Release() [libxul.so]` 0

**tab pid 4027** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3533** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::TaskController::DoExecuteNextTaskOnlyMainThreadInternal(mozil` 0

