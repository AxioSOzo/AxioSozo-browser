### chromium-2x key (profile pass)

**parent pid 3385** — 906 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 381 | 10.3 | Idle 162, JavaScript 80, Layout 41, Other 37 | 7 / 136 / 239 | ipc 381, poll_wait 201, gc_cc 93, paint_layout 80 |
| DOM Worker | 258 | 7.0 | JavaScript 249, Profiler 5, Other 4 | 0 / 0 / 258 | subprocess_pipe_io 258, worker_messaging 258, ipc 258, js_ctypes 244 |
| Renderer | 113 | 3.1 | Graphics 102, Idle 11, Other 0 | 0 / 0 / 113 | ipc 113, webrender_render 102, webrender_sw_raster 96, poll_wait 14 |
| SwComposite | 43 | 1.2 | Other 43 | 0 / 0 / 43 | webrender_render 43, webrender_sw_raster 24, memcpy_memset 22, poll_wait 19 |
| Timer | 35 | 1.0 | Other 35, Profiler 0 | 0 / 0 / 35 | ipc 35, poll_wait 35, memcpy_memset 0 |
| BackgroundThreadPool #3 | 19 | 0.5 | Idle 16, Other 3 | 0 / 0 / 19 | ipc 19, poll_wait 16, native_receiver 3, memcpy_memset 3 |
| WRRenderBackend#0 | 16 | 0.4 | Other 16 | 0 / 0 / 16 |  |
| Compositor | 15 | 0.4 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 15 | ipc 15, poll_wait 14, memcpy_memset 0, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 163; `[unknown]` 11; `[axiosozo-dev]` 8; `write [libc.so.6]` 8; `recvmsg [libc.so.6]` 6; `mprotect [libc.so.6]` 3; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `nsIFrame::Combines3DTransformWithAncestors() const [libxul.so]` 3

**tab pid 3472** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.2 | Idle 5, JavaScript 1, Other 1 | 0 / 0 / 6 | ipc 7, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `write [libc.so.6]` 0; `xpc::NativeGlobal(JSObject*) [libxul.so]` 0; `recvRunListener/< (resource://gre/modules/ExtensionChild.sys.mjs:878:1` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::PropertyKe` 0; `bool js::FillArgumentsFromArraylike<js::InvokeArgs, JS::CallArgs>(JSCo` 0; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 3520** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 3953** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 0

