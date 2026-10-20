### gecko-2x raf-nosampler (profile pass)

**parent pid 3036** — 640 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 380 | 12.5 | Graphics 293, Idle 86, Other 1 | 0 / 0 / 380 | ipc 378, webrender_render 293, webrender_sw_raster 250, poll_wait 93 |
| WRRenderBackend#0 | 65 | 2.1 | Other 65 | 0 / 0 / 65 | webrender_render 0, poll_wait 0 |
| SwComposite | 64 | 2.1 | Other 64 | 0 / 0 / 64 | webrender_render 64, poll_wait 57, memcpy_memset 7, webrender_sw_raster 7 |
| WRSceneBuilder#0 | 48 | 1.6 | Other 48 | 0 / 0 / 48 | webrender_scene 48, webrender_render 3, memcpy_memset 0, poll_wait 0 |
| Compositor | 47 | 1.5 | Idle 45, Other 2, Profiler 0 | 0 / 0 / 47 | ipc 47, poll_wait 45, webrender_render 1, memcpy_memset 0 |
| GeckoMain | 16 | 0.5 | Idle 11, JavaScript 4, DOM 1, Graphics 0 | 1 / 4 / 12 | ipc 16, poll_wait 12, harness_diagnostics 4, array_buffer_copy 4 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 11; `js::NativeDefineProperty(JSContext*, JS::Handle<js::NativeObject*>, JS` 1; `nsTSubstring<char>::Append(char) [libxul.so]` 1; `js::NewPlainObjectWithProto(JSContext*, JS::Handle<JSObject*>, js::New` 1; `deserializeJSON (chrome://remote/content/marionette/json.sys.mjs:244:2` 1; `__lll_lock_wake [libc.so.6]` 1; `__memcmp_avx2_movbe [libc.so.6]` 0; `recvmsg [libc.so.6]` 0

**tab pid 3304** — 185 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 166 | 5.5 | Idle 108, Graphics 20, Layout 17, Other 12 | 0 / 4 / 163 | ipc 160, poll_wait 111, paint_layout 45, memcpy_memset 4 |
| IPC I/O Child | 17 | 0.6 | Idle 17, Other 0 | 0 / 0 / 17 | poll_wait 17, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 109; `sendmsg [libc.so.6]` 3; `[]` 3; `write [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `__lll_lock_wait [libc.so.6]` 1

**tab pid 3203** — 1 ms CPU in the window

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

**tab pid 3395** — 1 ms CPU in the window

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

