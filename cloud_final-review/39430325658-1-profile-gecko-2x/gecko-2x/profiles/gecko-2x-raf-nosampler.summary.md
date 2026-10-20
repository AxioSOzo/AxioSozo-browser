### gecko-2x raf-nosampler (profile pass)

**parent pid 3043** — 620 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 373 | 12.2 | Graphics 278, Idle 92, Other 3, Profiler 1 | 0 / 0 / 373 | ipc 369, webrender_render 281, webrender_sw_raster 242, poll_wait 97 |
| WRRenderBackend#0 | 63 | 2.1 | Other 63 | 0 / 0 / 63 | webrender_render 1, poll_wait 1, memcpy_memset 1, array_buffer_copy 0 |
| SwComposite | 60 | 2.0 | Other 60 | 0 / 0 / 60 | webrender_render 60, poll_wait 51, webrender_sw_raster 9, memcpy_memset 9 |
| WRSceneBuilder#0 | 47 | 1.5 | Other 47, Profiler 0 | 0 / 0 / 47 | webrender_scene 47, webrender_render 2, poll_wait 1, memcpy_memset 1 |
| Compositor | 45 | 1.5 | Idle 44, Other 1, Profiler 0 | 0 / 0 / 45 | ipc 45, poll_wait 43, paint_layout 1, webrender_render 0 |
| GeckoMain | 14 | 0.5 | Idle 10, JavaScript 2, Other 1, Graphics 0 | 1 / 2 / 11 | ipc 14, poll_wait 10, harness_diagnostics 2, array_buffer_copy 2 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 10; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS::Value con` 1; `write [libc.so.6]` 1; `sandbox.create (chrome://remote/content/marionette/evaluate.sys.mjs:24` 1; `[unknown]` 1; `std::pair<std::__detail::_Node_iterator<mozilla::DisplayItemClipChain ` 0; `recvmsg [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

**tab pid 3285** — 175 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 156 | 5.1 | Idle 107, Graphics 24, Layout 15, Profiler 5 | 0 / 5 / 151 | ipc 150, poll_wait 109, paint_layout 43, canvas_2d 2 |
| IPC I/O Child | 17 | 0.6 | Idle 16, Other 0 | 0 / 0 / 17 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 108; `[]` 4; `Pickle::WriteBytes(void const*, unsigned int) [libxul.so]` 1; `nsPresArena<32768ul, mozilla::DisplayListArenaObjectId, 76ul>::Free(mo` 1; `read [libc.so.6]` 1; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom const*, b` 1; `getcontext [libc.so.6]` 1; `mozilla::layers::PWebRenderBridgeChild::SendSetDisplayList(mozilla::la` 1

**tab pid 3374** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `sendmsg [libc.so.6]` 0

**tab pid 3211** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

