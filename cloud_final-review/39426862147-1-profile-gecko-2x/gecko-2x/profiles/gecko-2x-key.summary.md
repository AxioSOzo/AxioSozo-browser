### gecko-2x key (profile pass)

**parent pid 2918** — 251 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 154 | 4.1 | Idle 43, Layout 29, GC / CC 24, JavaScript 18 | 2 / 18 / 133 | ipc 154, poll_wait 56, paint_layout 47, gc_cc 36 |
| Renderer | 39 | 1.0 | Idle 24, Graphics 15 | 0 / 0 / 39 | ipc 39, poll_wait 25, webrender_render 15, webrender_sw_raster 12 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | memcpy_memset 0 |
| Compositor | 14 | 0.4 | Idle 13, Other 0, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 13, webrender_render 0, paint_layout 0 |
| WRSceneBuilder#0 | 11 | 0.3 | Other 11 | 0 / 0 / 11 | webrender_scene 11, webrender_render 0, memcpy_memset 0, paint_layout 0 |
| SwComposite | 9 | 0.3 | Other 9 | 0 / 0 / 9 | webrender_render 9, poll_wait 7, memcpy_memset 3, webrender_sw_raster 3 |
| IPC I/O Parent | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 43; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 6; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Scope*) [libxul.so` 3; `js::gc::MarkingTracerT<6u>::eagerlyMarkChildren(js::Shape*) [libxul.so` 3; `mprotect [libc.so.6]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `syscall [libc.so.6]` 2; `AnchorResolvedMarginHelper::FromUnresolved(mozilla::StyleGenericMargin` 2

**tab pid 3167** — 48 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 43 | 1.1 | Idle 17, Other 8, Layout 7, JavaScript 4 | 0 / 2 / 40 | ipc 42, poll_wait 18, paint_layout 17, gc_cc 2 |
| IPC I/O Child | 5 | 0.1 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 17; `sendmsg [libc.so.6]` 3; `void mozilla::Maybe<mozilla::WidgetPointerEvent>::emplace<bool, mozill` 1; `IPC::ChannelPosix::ProcessOutgoingMessages() [libxul.so]` 1; `mozilla::IMEContentObserver::AChangeEvent::CanNotifyIME(mozilla::IMECo` 1; `gfxTextRun::GetAdvanceWidth(gfxTextRun::Range, gfxTextRun::PropertyPro` 1; `DrawTextRun(gfxTextRun const*, mozilla::gfx::PointTyped<mozilla::gfx::` 1; `void js::NativeObject::initFixedSlot<true>(unsigned int, JS::Value con` 1

**tab pid 3016** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.1 | Idle 4, JavaScript 1, Other 0, GC / CC 0 | 0 / 1 / 5 | ipc 5, poll_wait 4, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `void js::NativeObject::setFixedSlot<true>(unsigned int, JS::Value cons` 0; `sendmsg [libc.so.6]` 0; `js::UncheckedUnwrap(JSObject*, bool, unsigned int*) [libxul.so]` 0; `write [libc.so.6]` 0; `get (resource://gre/modules/ExtensionCommon.sys.mjs:603:12)[1]` 0; `[linux-vdso.so.1]` 0; `JS_DefinePropertyById(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS` 0

**tab pid 3105** — 1 ms CPU in the window

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

