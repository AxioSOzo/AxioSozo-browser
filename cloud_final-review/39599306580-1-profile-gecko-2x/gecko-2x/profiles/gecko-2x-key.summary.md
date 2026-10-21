### gecko-2x key (profile pass)

**parent pid 3050** — 330 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 207 | 5.5 | Idle 47, Layout 41, GC / CC 32, Graphics 28 | 4 / 30 / 173 | ipc 207, paint_layout 72, poll_wait 66, gc_cc 46 |
| Renderer | 48 | 1.3 | Idle 28, Graphics 20, Other 1 | 0 / 0 / 48 | ipc 48, poll_wait 28, webrender_render 20, webrender_sw_raster 16 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | webrender_render 1, poll_wait 0 |
| Compositor | 18 | 0.5 | Idle 17, Other 1 | 0 / 0 / 18 | ipc 18, poll_wait 16, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 14 | 0.4 | Other 14 | 0 / 0 / 14 | webrender_scene 14, webrender_render 0 |
| SwComposite | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_render 12, poll_wait 10, memcpy_memset 2, webrender_sw_raster 2 |
| IPC I/O Parent | 9 | 0.2 | Idle 9, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 47; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 9; `[axiosozo-dev]` 7; `recvmsg [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3; `nsContainerFrame::NormalizeChildLists() [libxul.so]` 3; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBuilder*, nsI` 2

**tab pid 3293** — 74 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 67 | 1.8 | Idle 23, Other 11, GC / CC 9, JavaScript 7 | 1 / 7 / 59 | ipc 63, poll_wait 24, paint_layout 14, gc_cc 11 |
| IPC I/O Child | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 23; `sendmsg [libc.so.6]` 3; `[]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `mozilla::PresShell::EventHandler::ComputeFocusedEventTargetElement(moz` 1; `__strlen_avx2 [libc.so.6]` 1; `mozilla::ProfileBufferBlockIndex mozilla::base_profiler_markers_detail` 1; `mojo::core::ports::PortLocker::PortLocker(mojo::core::ports::PortRef c` 1

**tab pid 3136** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, Other 0, DOM 0, JavaScript 0 | 0 / 0 / 6 | ipc 6, poll_wait 6, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, memcpy_memset 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 6; `nsGlobalWindowInner::QueryInterface(nsID const&, void**) [libxul.so]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `JS::GetNonCCWObjectGlobal(JSObject*) [libxul.so]` 0; `nscstring_fallible_append_utf16_to_latin1_lossy_impl [libxul.so]` 0

**tab pid 3209** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

