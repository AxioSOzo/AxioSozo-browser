### gecko-debian raf-nosampler (profile pass)

**parent pid 8213** — 614 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 370 | 12.2 | Graphics 274, Idle 96, Other 1 | 0 / 0 / 370 | ipc 367, webrender_render 275, webrender_sw_raster 243, poll_wait 97 |
| WRRenderBackend#0 | 81 | 2.7 | Other 81 | 0 / 0 / 81 | webrender_render 1, memcpy_memset 0 |
| WRSceneBuilder#0 | 56 | 1.8 | Other 56 | 0 / 0 / 56 | webrender_scene 56, webrender_render 3, poll_wait 1, memcpy_memset 0 |
| Compositor | 52 | 1.7 | Idle 50, Other 2, Profiler 0 | 0 / 0 / 52 | ipc 52, poll_wait 50, webrender_render 1, paint_layout 1 |
| GeckoMain | 19 | 0.6 | Idle 14, JavaScript 4, Other 0, Graphics 0 | 0 / 4 / 15 | ipc 19, poll_wait 15, harness_diagnostics 4, array_buffer_copy 3 |
| SwComposite | 16 | 0.5 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 15, memcpy_memset 0, webrender_sw_raster 0 |
| IPC I/O Parent | 12 | 0.4 | Idle 11, Other 0, Profiler 0 | 0 / 0 / 12 | poll_wait 12, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 14; `mozilla::dom::AutoRequestJSThreadExecution::AutoRequestJSThreadExecuti` 1; `bool mozilla::detail::HashTable<mozilla::HashMapEntry<JS::Compartment*` 1; `mprotect [libc.so.6]` 1; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::NativeObject*` 1; `syscall [libc.so.6]` 0; `js::InternalBarrierMethods<js::WasmTagObject*, void>::postBarrier(js::` 0; `Json::Value::resolveReference(char const*) [libxul.so]` 0

**tab pid 8455** — 235 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 214 | 7.1 | Idle 94, Graphics 44, Layout 31, Other 19 | 0 / 11 / 203 | ipc 196, poll_wait 95, paint_layout 94, gc_cc 8 |
| IPC I/O Child | 19 | 0.6 | Idle 19, Other 0 | 0 / 0 / 19 | poll_wait 19, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 102; `__lll_lock_wait [libc.so.6]` 6; `[]` 4; `getcontext [libc.so.6]` 3; `peek_poke::poke_into_vec [libxul.so]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `mozilla::layers::WebRenderCommandBuilder::CreateWebRenderCommandsFromD` 2; `nsCSSRendering::GetImageLayerClip(nsStyleImageLayers::Layer const&, ns` 2

**tab pid 8379** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::ipc::CancelCPOWs() [libxul.so]` 0; `[linux-vdso.so.1]` 0

**tab pid 8478** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `[linux-vdso.so.1]` 0

