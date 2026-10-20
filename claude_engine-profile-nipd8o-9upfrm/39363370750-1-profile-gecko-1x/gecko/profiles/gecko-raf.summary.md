### gecko raf (profile pass)

**parent pid 3047** — 981 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 396 | 12.7 | Graphics 287, Idle 106, Profiler 2, Other 1 | 0 / 0 / 396 | ipc 392, webrender_render 289, webrender_sw_raster 251, poll_wait 116 |
| GeckoMain | 260 | 8.3 | GC / CC 85, Idle 56, JavaScript 48, Other 33 | 5 / 55 / 200 | ipc 260, gc_cc 142, poll_wait 74, array_buffer_copy 16 |
| WRRenderBackend#0 | 90 | 2.9 | Other 90 | 0 / 0 / 90 | webrender_render 2, memcpy_memset 1, webrender_sw_raster 0, poll_wait 0 |
| DOM Worker | 68 | 2.2 | Idle 28, GC / CC 26, DOM 6, Other 5 | 0 / 7 / 60 | worker_messaging 67, ipc 67, gc_cc 31, poll_wait 30 |
| WRSceneBuilder#0 | 59 | 1.9 | Other 59 | 0 / 0 / 59 | webrender_scene 59, webrender_render 2, poll_wait 1, memcpy_memset 0 |
| Compositor | 55 | 1.8 | Idle 54, Other 2 | 0 / 0 / 55 | ipc 55, poll_wait 54, paint_layout 0, webrender_render 0 |
| SwComposite | 20 | 0.6 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 20, memcpy_memset 1, webrender_sw_raster 1 |
| IPC I/O Parent | 13 | 0.4 | Idle 12, Other 0, Profiler 0 | 0 / 0 / 13 | poll_wait 12, ipc 0 |

Main thread, top self: `poll [libc.so.6]` 62; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 14; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 7; `[unknown]` 6; `recvmsg [libc.so.6]` 5; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*) [libxul.` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 4; `__lll_lock_wake [libc.so.6]` 4

**tab pid 3287** — 277 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 247 | 7.9 | Idle 109, Graphics 52, Layout 41, Profiler 16 | 0 / 16 / 231 | ipc 229, poll_wait 111, paint_layout 109, gc_cc 11 |
| IPC I/O Child | 23 | 0.7 | Idle 22, Other 0 | 0 / 0 / 23 | poll_wait 22, ipc 0 |
| Timer | 7 | 0.2 | Other 7 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 108; `[]` 10; `sendmsg [libc.so.6]` 5; `__lll_lock_wait [libc.so.6]` 4; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `getcontext [libc.so.6]` 2; `void IPC::WriteParams<mozilla::Maybe<mozilla::layers::ScrollDirection>` 2; `read [libc.so.6]` 2

**tab pid 3228** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 2; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `int detail::CompareWrapper<MirrorCallbackList::Find(nsTSubstring<char>` 0

**utility pid 3280** — 3 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `poll [libc.so.6]` 1

