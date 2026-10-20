### gecko key (profile pass)

**parent pid 3041** — 282 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 189 | 5.0 | Idle 36, Layout 36, GC / CC 30, JavaScript 28 | 2 / 26 / 160 | ipc 189, paint_layout 65, poll_wait 61, gc_cc 44 |
| Renderer | 32 | 0.8 | Idle 22, Graphics 10 | 0 / 0 / 32 | ipc 31, poll_wait 22, webrender_render 10, webrender_sw_raster 8 |
| WRRenderBackend#0 | 17 | 0.4 | Other 17 | 0 / 0 / 17 | webrender_render 1, poll_wait 1 |
| Compositor | 16 | 0.4 | Idle 16, Other 1 | 0 / 0 / 16 | ipc 16, poll_wait 16, memcpy_memset 1, webrender_render 0 |
| WRSceneBuilder#0 | 12 | 0.3 | Other 12 | 0 / 0 / 12 | webrender_scene 12 |
| IPC I/O Parent | 8 | 0.2 | Idle 7, Other 1, Profiler 0 | 0 / 0 / 8 | poll_wait 8, ipc 1 |
| SwComposite | 3 | 0.1 | Other 3 | 0 / 0 / 3 | webrender_render 3, poll_wait 3, memcpy_memset 0, webrender_sw_raster 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | ipc 2, poll_wait 2 |

Main thread, top self: `poll [libc.so.6]` 40; `[axiosozo-dev]` 10; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `recvmsg [libc.so.6]` 5; `[unknown]` 4; `nsIFrame::BuildDisplayListForStackingContext(mozilla::nsDisplayListBui` 4; `syscall [libc.so.6]` 3; `getcontext [libc.so.6]` 3

**tab pid 3295** — 68 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 61 | 1.6 | Idle 22, Other 10, GC / CC 7, JavaScript 6 | 0 / 6 / 55 | ipc 56, poll_wait 22, paint_layout 15, gc_cc 11 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 22; `sendmsg [libc.so.6]` 4; `[]` 2; `[libgcc_s.so.1]` 1; `NeedsScriptTraverse(nsINode*) [libxul.so]` 1; `nsINode::GetMutationObservers() [libxul.so]` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `mozilla::ipc::URIParams::MaybeDestroy() [libxul.so]` 1

**tab pid 3130** — 8 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 1, DOM 0 | 0 / 1 / 5 | ipc 6, poll_wait 5, array_buffer_copy 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `js::jit::GetPropIRGenerator::tryAttachTypedArrayElement(JS::Handle<JSO` 0; `xpc::TryResolvePropertyFromSpecs(JSContext*, JS::Handle<JS::PropertyKe` 0; `js::Wrapper::wrappedObject(JSObject*) [libxul.so]` 0; `js::InternalCallOrConstruct(JSContext*, JS::CallArgs const&, js::Maybe` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `[unknown]` 0

**tab pid 3207** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1; `[]` 0

