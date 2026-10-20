### chromium-2x switch-to-engine (profile pass)

**parent pid 3371** — 314 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 131 | 21.3 | GC / CC 40, Layout 33, JavaScript 25, Idle 16 | 4 / 34 / 93 | ipc 131, gc_cc 68, paint_layout 40, poll_wait 21 |
| Renderer | 87 | 14.2 | Graphics 86, Idle 1 | 0 / 0 / 87 | webrender_render 86, ipc 86, webrender_sw_raster 71, memcpy_memset 1 |
| DOM Worker | 43 | 7.1 | JavaScript 38, Other 3, Idle 2 | 0 / 0 / 43 | subprocess_pipe_io 43, worker_messaging 43, ipc 43, poll_wait 36 |
| BackgroundThreadPool #1 | 25 | 4.1 | Other 17, Idle 8 | 0 / 0 / 25 | ipc 25, native_receiver 17, image_container 11, poll_wait 8 |
| WRRenderBackend#0 | 8 | 1.3 | Other 8 | 0 / 0 / 8 |  |
| SwComposite | 6 | 1.1 | Other 6 | 0 / 0 / 6 | webrender_render 6, poll_wait 6 |
| Compositor | 6 | 1.0 | Idle 6, Graphics 0, Profiler 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, canvas_2d 0, webrender_render 0 |
| WRSceneBuilder#0 | 3 | 0.6 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `poll [libc.so.6]` 16; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 10; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `__lll_lock_wait [libc.so.6]` 5; `void js::gc::MarkingTracerT<6u>::markAndTraverse<JSObject>(JSObject*) ` 4; `js::ObjectWrapperMap::lookup(JSObject*) const [libxul.so]` 3; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 3

**tab pid 4151** — 50 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 49 | 8.0 | Other 39, JavaScript 5, DOM 4, Idle 1 | 0 / 5 / 44 | ipc 36, array_buffer_copy 18, gc_cc 14, subprocess_pipe_io 8 |
| IPC I/O Child | 1 | 0.1 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `access [libc.so.6]` 4; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `[libfontconfig.so.1]` 2; `mozilla::Vector<js::frontend::StencilModuleRequest, 0ul, js::SystemAll` 2; `mozilla::Preferences::SetPreference(mozilla::dom::Pref const&) [libxul` 1; `mmap64 [ld-linux-x86-64.so.2]` 1; `__memmove_avx_unaligned_erms [libc.so.6]` 1

**tab pid 4035** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.6 | Idle 2, Other 1, Graphics 1, Profiler 0 | 0 / 0 / 4 | ipc 3, poll_wait 2, paint_layout 2, memcpy_memset 0 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `sendmsg [libc.so.6]` 1; `[]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 0

**tab pid 3560** — 0 ms CPU in the window

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

