### gecko raf (profile pass)

**parent pid 3064** — 576 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 317 | 10.2 | Graphics 216, Idle 100, Other 1 | 0 / 0 / 317 | ipc 315, webrender_render 217, webrender_sw_raster 199, poll_wait 105 |
| WRRenderBackend#0 | 65 | 2.1 | Other 65 | 0 / 0 / 65 | webrender_render 0, poll_wait 0, memcpy_memset 0 |
| GeckoMain | 60 | 1.9 | GC / CC 29, Idle 18, JavaScript 4, Other 3 | 1 / 4 / 55 | ipc 60, gc_cc 32, poll_wait 22, paint_layout 4 |
| WRSceneBuilder#0 | 46 | 1.5 | Other 46 | 0 / 0 / 46 | webrender_scene 46, webrender_render 1, poll_wait 1, array_buffer_copy 0 |
| Compositor | 45 | 1.5 | Idle 45, Other 1 | 0 / 0 / 45 | ipc 45, poll_wait 45, paint_layout 0, webrender_render 0 |
| SwComposite | 19 | 0.6 | Other 19 | 0 / 0 / 19 | webrender_render 19, poll_wait 18, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 11 | 0.3 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 19; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `recvmsg [libc.so.6]` 2; `JSObject::traceChildren(JSTracer*) [libxul.so]` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 2; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 2; `nsStyleTransformMatrix::ProcessTranslate3D(mozilla::gfx::Matrix4x4Type` 2; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 1

**tab pid 3312** — 186 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 167 | 5.4 | Idle 100, Graphics 19, Layout 15, Other 12 | 0 / 6 / 161 | ipc 157, poll_wait 101, paint_layout 48, gc_cc 12 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2, Profiler 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 100; `sendmsg [libc.so.6]` 6; `[]` 5; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 2; `gfxFont::Draw(gfxTextRun const*, unsigned int, unsigned int, mozilla::` 2; `write [libc.so.6]` 2; `__memset_avx2_unaligned_erms [libc.so.6]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2

**tab pid 3250** — 1 ms CPU in the window

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

**tab pid 3232** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

