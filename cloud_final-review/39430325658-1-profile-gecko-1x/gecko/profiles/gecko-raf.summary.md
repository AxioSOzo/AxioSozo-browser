### gecko raf (profile pass)

**parent pid 3041** — 547 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 309 | 10.0 | Graphics 220, Idle 89, Other 0 | 0 / 0 / 309 | ipc 308, webrender_render 220, webrender_sw_raster 195, poll_wait 93 |
| WRRenderBackend#0 | 60 | 1.9 | Other 60 | 0 / 0 / 60 | webrender_render 1, poll_wait 0, memcpy_memset 0 |
| GeckoMain | 58 | 1.9 | GC / CC 27, Idle 21, JavaScript 4, Other 2 | 0 / 5 / 53 | ipc 58, gc_cc 31, poll_wait 23, harness_diagnostics 3 |
| WRSceneBuilder#0 | 42 | 1.4 | Other 42 | 0 / 0 / 42 | webrender_scene 42, webrender_render 2, memcpy_memset 0, poll_wait 0 |
| Compositor | 40 | 1.3 | Idle 39, Other 1, Profiler 0 | 0 / 0 / 40 | ipc 40, poll_wait 39, webrender_render 0, paint_layout 0 |
| SwComposite | 16 | 0.5 | Other 16 | 0 / 0 / 16 | webrender_render 16, poll_wait 15, webrender_sw_raster 1, memcpy_memset 1 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 22; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBudget&) [lib` 8; `js::GenericTracerImpl<js::gc::MarkingTracerT<6u> >::onObjectEdge(JSObj` 2; `gfxFontGroup::GetFirstValidFont(unsigned int, mozilla::StyleGenericFon` 1; `js::jit::CacheIRStubKey::match(js::jit::CacheIRStubKey const&, js::jit` 1; `mozilla::CycleCollectedJSRuntime::UnmarkSkippableJSHolders() [libxul.s` 1; `bool mozilla::detail::HashTable<char const* const, mozilla::HashSet<ch` 1; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1

**tab pid 3295** — 164 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 148 | 4.8 | Idle 100, Graphics 16, Layout 13, Other 10 | 0 / 6 / 142 | ipc 143, poll_wait 101, paint_layout 38, gc_cc 3 |
| IPC I/O Child | 15 | 0.5 | Idle 15, Other 0, Profiler 0 | 0 / 0 / 15 | poll_wait 15, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 101; `sendmsg [libc.so.6]` 3; `[]` 2; `mozilla::FindAnimationsForCompositor(nsIFrame const*, nsCSSPropertyIDS` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, mozilla::W` 1; `js::jit::BaselineCodeGen<js::jit::BaselineCompilerHandler>::emitConsta` 1; `js::jit::JitActivation::~JitActivation() [libxul.so]` 1

**tab pid 3376** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 0, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0; `sendmsg [libc.so.6]` 0

**tab pid 3186** — 1 ms CPU in the window

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

