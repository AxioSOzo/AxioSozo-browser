### webkit-2x switch-to-gecko (profile pass)

**parent pid 8803** — 130 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 73 | 26.5 | JavaScript 29, GC / CC 12, Layout 9, DOM 6 | 0 / 44 / 29 | ipc 70, gc_cc 29, array_buffer_copy 14, harness_diagnostics 12 |
| Renderer | 29 | 10.6 | Graphics 26, Idle 3 | 0 / 0 / 29 | ipc 29, webrender_render 26, webrender_sw_raster 25, poll_wait 3 |
| DOM Worker | 10 | 3.7 | JavaScript 10, Idle 0 | 0 / 0 / 10 | subprocess_pipe_io 10, worker_messaging 10, ipc 10, js_ctypes 8 |
| Compositor | 4 | 1.3 | Other 2, Idle 2 | 0 / 0 / 4 | ipc 4, poll_wait 2, memcpy_memset 1 |
| BgIOThreadPool #1 | 4 | 1.3 | Other 2, Idle 2 | 0 / 0 / 4 | ipc 4, poll_wait 2 |
| SwComposite | 3 | 1.2 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 3, memcpy_memset 0, webrender_sw_raster 0 |
| WRRenderBackend#0 | 3 | 1.0 | Other 3 | 0 / 0 / 3 | webrender_render 1 |
| WRSceneBuilder#0 | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_scene 2, array_buffer_copy 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 6; `js::jit::IRGenerator::emitCallAccessorGuards(js::NativeObject*, js::Na` 4; `[unknown]` 3; `JSObject::traceChildren(JSTracer*) [libxul.so]` 3; `js::jit::IRGenerator::maybeCreateAllocSite() [libxul.so]` 3; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2

**tab pid 9348** — 22 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 21 | 7.7 | Other 8, JavaScript 4, Idle 3, DOM 3 | 0 / 7 / 14 | ipc 20, gc_cc 5, poll_wait 5, subprocess_pipe_io 3 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 8; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 2; `js::frontend::BytecodeEmitter::emitTree(js::frontend::ParseNode*, js::` 1; `mozilla::RecursiveMutex::UnlockInternal() [libxul.so]` 1; `nsIContent::UnbindFromTree(nsINode*, BatchRemovalState const*) [libxul` 1; `style::properties::cascade::iter_declarations [libxul.so]` 1; `js::CreateEnvironmentShape(JSContext*, js::AbstractBindingIter<JSAtom>` 1; `js::frontend::GeneralParser<js::frontend::FullParseHandler, mozilla::U` 1

**tab pid 8896** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 1.3 | Idle 3, JavaScript 1 | 0 / 0 / 3 | ipc 3, poll_wait 3, array_buffer_copy 1 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `js::ObjectFuse::tryOptimizeConstantProperty(JS::PropertyKey, js::Prope` 0; `setActiveOnTab (moz-extension://9a310967-e580-48bf-b3e8-4eafebbc122d/l` 0

**tab pid 8967** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

