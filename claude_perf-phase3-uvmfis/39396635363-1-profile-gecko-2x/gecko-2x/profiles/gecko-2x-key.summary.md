### gecko-2x key (profile pass)

**parent pid 2854** — 282 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 172 | 4.6 | Idle 39, Layout 29, GC / CC 27, Other 23 | 6 / 24 / 142 | ipc 172, poll_wait 55, paint_layout 54, gc_cc 40 |
| Renderer | 44 | 1.2 | Idle 26, Graphics 18, Other 0 | 0 / 0 / 44 | ipc 44, poll_wait 26, webrender_render 18, webrender_sw_raster 16 |
| WRRenderBackend#0 | 18 | 0.5 | Other 18 | 0 / 0 / 18 | memcpy_memset 1, webrender_render 0 |
| Compositor | 15 | 0.4 | Idle 15, Other 0 | 0 / 0 / 15 | ipc 15, poll_wait 15, paint_layout 0 |
| WRSceneBuilder#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_scene 11, paint_layout 0 |
| SwComposite | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_render 11, poll_wait 8, memcpy_memset 4, webrender_sw_raster 4 |
| IPC I/O Parent | 7 | 0.2 | Idle 7, Other 0 | 0 / 0 / 7 | poll_wait 7, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 42; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 10; `recvmsg [libc.so.6]` 4; `__memset_avx512_unaligned_erms [libc.so.6]` 3; `[axiosozo-dev]` 3; `mozilla::image::VectorImage::GetImageProvider(mozilla::WindowRenderer*` 2; `mozilla::nsDisplayListBuilder::IsAnimatedGeometryRoot(nsIFrame*, nsIFr` 2; `style::values::generics::calc::GenericCalcNode<L>::resolve_internal [l` 2

**tab pid 3126** — 53 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 47 | 1.3 | Idle 19, Other 9, Layout 7, Graphics 4 | 0 / 4 / 43 | ipc 45, poll_wait 19, paint_layout 14, harness_diagnostics 3 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 19; `sendmsg [libc.so.6]` 2; `AtomTableEntry::KeyEquals(AtomTableKey const*) const [libxul.so]` 2; `[]` 2; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `mozilla::PresShell::ScrollFrameIntoView(nsIFrame*, mozilla::Maybe<nsRe` 1; `mozilla::ContentEventHandler::HandleQueryContentEvent(mozilla::WidgetQ` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeBarePtr<JSO` 1

**tab pid 2953** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.1 | Idle 5, JavaScript 0 | 0 / 0 / 5 | ipc 6, poll_wait 5, array_buffer_copy 0, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `js::MicroTaskQueueSet::enqueueRegularMicroTask(JSContext*, JS::Value c` 0; `[unknown]` 0; `mozilla::dom::StructuredCloneHolder_Binding::Wrap(JSContext*, mozilla:` 0

**tab pid 3052** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Profiler 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 0

