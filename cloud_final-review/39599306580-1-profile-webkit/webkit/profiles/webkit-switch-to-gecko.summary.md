### webkit switch-to-gecko (profile pass)

**parent pid 7154** — 164 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 88 | 28.0 | JavaScript 33, Layout 15, DOM 14, Graphics 10 | 4 / 45 / 39 | ipc 88, paint_layout 26, array_buffer_copy 20, gc_cc 14 |
| Renderer | 31 | 9.9 | Graphics 27, Idle 4 | 0 / 0 / 31 | ipc 30, webrender_render 27, webrender_sw_raster 25, poll_wait 5 |
| DOM Worker | 16 | 5.2 | JavaScript 16, Idle 0 | 0 / 0 / 16 | subprocess_pipe_io 16, worker_messaging 16, ipc 16, poll_wait 15 |
| BgIOThreadPool #1 | 11 | 3.6 | Other 9, Idle 2 | 0 / 0 / 11 | ipc 11, poll_wait 2 |
| WRRenderBackend#0 | 4 | 1.3 | Other 4 | 0 / 0 / 4 | webrender_render 0 |
| Compositor | 3 | 1.1 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3, memcpy_memset 0 |
| IPC I/O Parent | 3 | 0.9 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| WRSceneBuilder#0 | 3 | 0.9 | Other 3 | 0 / 0 / 3 | webrender_scene 3 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 11; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 6; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 4; `syscall [libc.so.6]` 4; `mozilla::nsDisplayListSet::MoveTo(mozilla::nsDisplayListSet const&) co` 3; `pthread_self [libc.so.6]` 3; `[unknown]` 3; `some (self-hosted:125:19)[13]` 3

**tab pid 7692** — 33 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 31 | 9.8 | Other 10, JavaScript 8, Idle 5, DOM 4 | 0 / 10 / 21 | ipc 26, gc_cc 10, poll_wait 6, subprocess_pipe_io 5 |
| IPC I/O Child | 2 | 0.6 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 7; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 2; `[]` 2; `nsNodeInfoManager::GetNodeInfo(nsAtom*, nsAtom*, int, unsigned short, ` 1; `ReservedWordInfo const* FindReservedWord<unsigned char>(unsigned char ` 1; `js::SharedShape::getPropMapShape(JSContext*, js::BaseShape*, unsigned ` 1; `mozilla::Vector<js::WasmInstanceObject*, 0ul, js::TrackedAllocPolicy<(` 1; `js::frontend::ParseNodeAllocator::allocNode(unsigned long) [libxul.so]` 1

**tab pid 7239** — 15 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 14 | 4.4 | GC / CC 6, JavaScript 3, Idle 3, Other 1 | 0 / 3 / 11 | ipc 13, gc_cc 8, array_buffer_copy 3, poll_wait 3 |
| IPC I/O Child | 1 | 0.2 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.1 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBudget&) [lib` 4; `__syscall_cancel_arch [libc.so.6]` 3; `__memmove_avx_unaligned_erms [libc.so.6]` 1; `void js::gc::MarkingTracerT<8u>::markAndTraverse<JSObject>(JSObject*) ` 1; `__memcmp_avx2_movbe [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocKind, js::g` 1; `js::gc::MarkingTracerT<1u>::eagerlyMarkChildren(js::PropMap*) [libxul.` 1

**tab pid 7840** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0

