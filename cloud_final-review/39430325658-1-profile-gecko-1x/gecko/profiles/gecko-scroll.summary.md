### gecko scroll (profile pass)

**parent pid 3041** — 897 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 615 | 30.0 | Graphics 551, Idle 63, Other 1 | 0 / 0 / 615 | ipc 602, webrender_render 552, webrender_sw_raster 511, poll_wait 65 |
| GeckoMain | 123 | 6.0 | Idle 64, GC / CC 32, Other 10, Graphics 8 | 0 / 6 / 118 | ipc 123, poll_wait 80, gc_cc 35, paint_layout 10 |
| WRRenderBackend#0 | 66 | 3.2 | Other 66 | 0 / 0 / 66 | webrender_render 1, poll_wait 1, webrender_sw_raster 1 |
| SwComposite | 30 | 1.5 | Other 30 | 0 / 0 / 30 | webrender_render 30, poll_wait 29, webrender_sw_raster 1, memcpy_memset 1 |
| Compositor | 28 | 1.4 | Idle 28, Other 0 | 0 / 0 / 28 | ipc 28, poll_wait 28, webrender_render 0, canvas_2d 0 |
| WRSceneBuilder#0 | 21 | 1.0 | Other 21 | 0 / 0 / 21 | webrender_scene 21, memcpy_memset 0, webrender_render 0, paint_layout 0 |
| IPC I/O Parent | 8 | 0.4 | Idle 8, Other 0 | 0 / 0 / 8 | poll_wait 8, memcpy_memset 0, ipc 0 |
| WRSceneBuilderLP#0 | 1 | 0.1 | Other 1 | 0 / 0 / 1 |  |

Main thread, top self: `poll [libc.so.6]` 66; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 2; `[unknown]` 2; `[axiosozo-dev]` 2; `recvmsg [libc.so.6]` 2; `__futex_abstimed_wait_cancelable64 [libc.so.6]` 1; `nsTHashtable<detail::VoidPtrHashKey>::s_HashKey(void const*) [libxul.s` 1

**tab pid 3295** — 105 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 91 | 4.4 | Idle 58, Graphics 11, GC / CC 8, Other 6 | 0 / 4 / 87 | ipc 88, poll_wait 58, paint_layout 14, gc_cc 11 |
| IPC I/O Child | 14 | 0.7 | Idle 13, Other 0 | 0 / 0 / 14 | poll_wait 13, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 57; `sendmsg [libc.so.6]` 2; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 2; `webrender_api::display_list::DisplayListBuilder::push_iter [libxul.so]` 1; `[linux-vdso.so.1]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<unsigned int, mozilla` 1; `XPCWrappedNativeScope::UpdateWeakPointersAfterGC(JSTracer*) [libxul.so` 1

**tab pid 3207** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3233** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

