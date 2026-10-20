### gecko-2x key (profile pass)

**parent pid 2847** — 755 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 442 | 11.7 | Idle 96, JavaScript 85, GC / CC 74, Other 65 | 10 / 114 / 317 | ipc 442, gc_cc 178, poll_wait 137, paint_layout 60 |
| DOM Worker | 194 | 5.2 | JavaScript 85, GC / CC 60, Idle 28, DOM 16 | 21 / 133 / 39 | worker_messaging 194, ipc 194, gc_cc 81, poll_wait 29 |
| Renderer | 26 | 0.7 | Idle 20, Graphics 5, Other 1, Profiler 0 | 0 / 0 / 26 | ipc 26, poll_wait 20, webrender_render 6, webrender_sw_raster 4 |
| WRRenderBackend#0 | 22 | 0.6 | Other 22 | 0 / 0 / 22 | webrender_render 1, memcpy_memset 0 |
| Compositor | 19 | 0.5 | Idle 16, Other 3 | 0 / 0 / 19 | ipc 19, poll_wait 16, memcpy_memset 2, webrender_render 0 |
| Socket Thread | 14 | 0.4 | Other 14, Profiler 0 | 0 / 0 / 14 | ipc 14, poll_wait 12, memcpy_memset 0 |
| WRSceneBuilder#0 | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_scene 13, webrender_render 1, memcpy_memset 0, array_buffer_copy 0 |
| SwComposite | 8 | 0.2 | Other 8 | 0 / 0 / 8 | webrender_render 8, poll_wait 7, memcpy_memset 0, webrender_sw_raster 0 |

Main thread, top self: `poll [libc.so.6]` 106; `[unknown]` 13; `recvmsg [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 11; `[axiosozo-dev]` 7; `__memmove_avx512_unaligned_erms [libc.so.6]` 6; `SnowWhiteKiller::Visit(nsPurpleBuffer&, nsPurpleBufferEntry*) [libxul.` 5; `JSObject::traceChildren(JSTracer*) [libxul.so]` 5

**tab pid 3114** — 72 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 65 | 1.7 | Idle 25, GC / CC 11, Layout 10, Other 9 | 0 / 4 / 62 | ipc 60, poll_wait 27, paint_layout 18, gc_cc 13 |
| IPC I/O Child | 6 | 0.2 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 26; `sendmsg [libc.so.6]` 3; `[]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr*, char co` 2; `JS::loader::ScriptLoadRequest::~ScriptLoadRequest() [libxul.so]` 1; `mozilla::RangeBoundaryBase<nsINode*, nsIContent*>::RangeBoundaryBase(n` 1; `js::AtomizeStringSlow(JSContext*, JSString*) [libxul.so]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Value>(JSTracer*, JS::` 1

**tab pid 2947** — 11 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 8 | 0.2 | Idle 7, JavaScript 1, Other 0 | 0 / 0 / 8 | ipc 8, poll_wait 7, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 7; `[linux-vdso.so.1]` 0; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0; `JS_HasPropertyById(JSContext*, JS::Handle<JSObject*>, JS::Handle<JS::P` 0; `[unknown]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `mozilla::AutoProfilerLabel::AutoProfilerLabel(char const*, char const*` 0; `read [libc.so.6]` 0

**tab pid 3039** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 4, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4 |
| IPC I/O Child | 2 | 0.1 | Idle 2, Other 0 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Timer | 0 | 0.0 | Other 0, Profiler 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `nsJSContext::MaybePokeCC() [libxul.so]` 0

