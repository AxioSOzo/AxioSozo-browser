### chromium-2x switch-to-gecko (profile pass)

**parent pid 3385** — 234 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 77 | 0.5 | Layout 19, Idle 17, JavaScript 15, Graphics 9 | 2 / 25 / 50 | ipc 77, paint_layout 29, poll_wait 18, gc_cc 13 |
| DOM Worker | 63 | 0.4 | GC / CC 30, Other 21, JavaScript 10, Idle 2 | 0 / 0 / 63 | subprocess_pipe_io 63, worker_messaging 62, ipc 62, gc_cc 51 |
| Renderer | 58 | 0.4 | Graphics 54, Idle 4 | 0 / 0 / 58 | ipc 58, webrender_render 54, webrender_sw_raster 51, poll_wait 4 |
| BgIOThreadPool #2 | 9 | 0.1 | Other 8, Idle 0 | 0 / 0 / 9 | ipc 9, poll_wait 0 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0, Profiler 0 | 0 / 0 / 6 | poll_wait 6, ipc 0, memcpy_memset 0 |
| Compositor | 6 | 0.0 | Other 3, Idle 3 | 0 / 0 / 6 | ipc 6, poll_wait 3 |
| SwComposite | 4 | 0.0 | Other 4 | 0 / 0 / 4 | webrender_render 4, poll_wait 4 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 | webrender_render 0 |

Main thread, top self: `poll [libc.so.6]` 17; `madvise [libc.so.6]` 3; `DescendIntoChild(mozilla::nsDisplayListBuilder*, nsIFrame const*, nsRe` 3; `core::ptr::drop_in_place<style::values::generics::color::GenericColor<` 3; `mozilla::StyleGenericInset<mozilla::StylePercentage, mozilla::StyleLen` 2; `nsTArray_base<nsTArray_RelocateUsingMemutils>::MoveInit(nsTArray_base<` 2; `[axiosozo-dev]` 2; `__memmove_avx_unaligned_erms [libc.so.6]` 2

**tab pid 3559** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 4, JavaScript 0, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 4, array_buffer_copy 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::jit::CanIonCompileScript(JSContext*, JSScript*) [libxul.so]` 0; `sendmsg [libc.so.6]` 0

**tab pid 3825** — 6 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 5 | 0.0 | Idle 3, Graphics 1, Other 0, Profiler 0 | 0 / 0 / 5 | ipc 5, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `nsLayoutUtils::ComputeScrollMetadata(nsIFrame const*, nsIFrame const*,` 1; `mozilla::ProfileBufferBlockIndex profiler_add_marker_impl<geckoprofile` 0; `mozilla::ProfileChunkedBuffer::~ProfileChunkedBuffer() [libxul.so]` 0; `nsGlobalWindowInner::GetRelevantGlobal() const [libxul.so]` 0

**tab pid 3520** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 1, ipc 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `TimerThread::Init() [libxul.so]` 0

