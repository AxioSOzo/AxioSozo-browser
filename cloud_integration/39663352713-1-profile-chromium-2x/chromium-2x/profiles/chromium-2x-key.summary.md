### chromium-2x key (profile pass)

**parent pid 3314** — 749 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 258 | 7.1 | Idle 103, JavaScript 54, Layout 28, Graphics 27 | 12 / 81 / 166 | ipc 258, poll_wait 137, paint_layout 63, gc_cc 57 |
| BgIOThreadPool #1 | 224 | 6.1 | Other 224, Idle 0 | 0 / 0 / 224 | ipc 224, poll_wait 0 |
| DOM Worker | 102 | 2.8 | JavaScript 98, Other 2, Profiler 2 | 0 / 0 / 102 | subprocess_pipe_io 102, worker_messaging 102, ipc 102, js_ctypes 98 |
| Renderer | 71 | 1.9 | Graphics 53, Idle 18 | 0 / 0 / 71 | ipc 71, webrender_render 53, webrender_sw_raster 47, poll_wait 21 |
| SwComposite | 27 | 0.7 | Other 27 | 0 / 0 / 27 | webrender_render 27, poll_wait 20, webrender_sw_raster 7, memcpy_memset 7 |
| Timer | 19 | 0.5 | Other 19 | 0 / 0 / 19 | ipc 19, poll_wait 19 |
| WRRenderBackend#0 | 15 | 0.4 | Other 15 | 0 / 0 / 15 | poll_wait 0, webrender_render 0 |
| Compositor | 12 | 0.3 | Idle 11, Graphics 0, Other 0 | 0 / 0 / 12 | ipc 12, poll_wait 11, webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 103; `[unknown]` 10; `[axiosozo-dev]` 6; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&, mozilla::` 5; `mozilla::nsDisplayListBuilder::AllocateDisplayItemClipChain(mozilla::D` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 3; `read [libc.so.6]` 3; `SkImageInfo::Make(int, int, SkColorType, SkAlphaType) [libxul.so]` 2

**tab pid 3412** — 7 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 6 | 0.2 | Idle 5, JavaScript 0, DOM 0, Other 0 | 0 / 0 / 6 | ipc 6, poll_wait 5, array_buffer_copy 1, gc_cc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 5; `__strlen_evex [libc.so.6]` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `js::ReactToUnwrappedPromise(JSContext*, JS::Handle<js::PromiseObject*>` 0; `[]` 0; `void* js::gc::CellAllocator::AllocTenuredCellForNurseryAlloc<(js::Allo` 0; `PLDHashTable::Search(void const*) const [libxul.so]` 0; `JSStructuredCloneReader::readObjectField(JS::Handle<JSObject*>, JS::Ha` 0

**tab pid 3498** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `read [libc.so.6]` 0

**tab pid 3459** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

