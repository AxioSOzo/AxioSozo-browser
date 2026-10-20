### gecko scroll (profile pass)

**parent pid 2850** — 1031 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 501 | 24.5 | Graphics 385, Idle 115 | 0 / 0 / 501 | ipc 499, webrender_render 385, webrender_sw_raster 370, poll_wait 161 |
| GeckoMain | 228 | 11.2 | Idle 83, JavaScript 67, DOM 35, Other 32 | 6 / 95 / 128 | ipc 228, poll_wait 99, gc_cc 98, array_buffer_copy 20 |
| DOM Worker | 158 | 7.8 | JavaScript 61, Idle 32, DOM 32, GC / CC 19 | 21 / 81 / 56 | worker_messaging 158, ipc 158, gc_cc 38, poll_wait 34 |
| WRRenderBackend#0 | 55 | 2.7 | Other 55, Profiler 1 | 0 / 0 / 55 | webrender_render 1, memcpy_memset 1 |
| SwComposite | 31 | 1.5 | Other 31 | 0 / 0 / 31 | webrender_render 31, poll_wait 30, memcpy_memset 1, webrender_sw_raster 1 |
| Compositor | 23 | 1.1 | Idle 22, Other 0 | 0 / 0 / 23 | ipc 23, poll_wait 22, paint_layout 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 18 | 0.9 | Other 18 | 0 / 0 / 18 | webrender_scene 18, webrender_render 0 |
| IPC I/O Parent | 6 | 0.3 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |

Main thread, top self: `poll [libc.so.6]` 87; `mozilla::net::nsHttpChannel::SetupChannelForTransaction() [libxul.so]` 15; `[unknown]` 14; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 6; `__memmove_avx512_unaligned_erms [libc.so.6]` 5; `js::NewPlainObjectWithProto(JSContext*, JS::Handle<JSObject*>, js::New` 3; `JSStructuredCloneWriter::writeString(unsigned int, JSString*) [libxul.` 3; `js::jit::GetNativeDataPropertyPure(JSContext*, JSObject*, JS::Property` 3

**tab pid 3089** — 81 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 69 | 3.4 | Idle 51, Graphics 12, Other 3, JavaScript 2 | 0 / 2 / 67 | ipc 67, poll_wait 51, paint_layout 15, harness_diagnostics 2 |
| IPC I/O Child | 11 | 0.5 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 51; `[]` 2; `sendmsg [libc.so.6]` 2; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePtr<JSO` 1; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 1; `nsSplittableFrame::GetBlockLevelLogicalSkipSides(bool) const [libxul.s` 1; `std::_Hashtable<mozilla::DisplayItemClipChain const*, mozilla::Display` 1; `nsLayoutUtils::UpdateCompositionBoundsForRCDRSF(mozilla::gfx::RectType` 1

**tab pid 3030** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

**tab pid 2944** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `write [libc.so.6]` 0

