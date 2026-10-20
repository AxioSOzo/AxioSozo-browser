### chromium-control switch-to-gecko (profile pass)

**parent pid 4588** — 491 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| BgIOThreadPool #2 | 340 | 2.3 | Other 339, Idle 1 | 0 / 0 / 340 | ipc 340, poll_wait 1 |
| GeckoMain | 71 | 0.5 | Idle 20, JavaScript 19, Layout 18, Other 6 | 1 / 31 / 38 | ipc 71, paint_layout 23, poll_wait 21, gc_cc 14 |
| DOM Worker | 44 | 0.3 | Other 16, GC / CC 13, JavaScript 11, Profiler 2 | 0 / 0 / 44 | subprocess_pipe_io 44, worker_messaging 43, ipc 43, gc_cc 28 |
| Renderer | 18 | 0.1 | Graphics 15, Idle 4 | 0 / 0 / 18 | ipc 16, webrender_render 15, webrender_sw_raster 12, poll_wait 4 |
| IPC I/O Parent | 6 | 0.0 | Idle 6, Other 0 | 0 / 0 / 6 | poll_wait 6, ipc 0 |
| Compositor | 4 | 0.0 | Idle 3, Other 0, Profiler 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, memcpy_memset 0, paint_layout 0 |
| WRRenderBackend#0 | 3 | 0.0 | Other 3 | 0 / 0 / 3 |  |
| WRSceneBuilder#0 | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_scene 2 |

Main thread, top self: `poll [libc.so.6]` 20; `__memmove_avx_unaligned_erms [libc.so.6]` 3; `style::properties::cascade::Cascade::apply_non_prioritary_properties [` 2; `[axiosozo-dev]` 2; `mozilla::dom::BrowsingContext::PreOrderWalkVoid(std::function<void (mo` 2; `[unknown]` 1; `mozilla::nsDisplayItem::Destroy(mozilla::nsDisplayListBuilder*) [libxu` 1; `madvise [libc.so.6]` 1

**tab pid 4764** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.0 | Idle 4, DOM 1, JavaScript 1, Other 0 | 0 / 3 / 4 | ipc 7, poll_wait 4, gc_cc 2, array_buffer_copy 0 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 4; `js::Atomize(JSContext*, char const*, unsigned long, mozilla::Maybe<uns` 1; `js::jit::Assembler::movq(js::jit::Operand const&, js::jit::Register) [` 1; `js::SharedShape::getInitialShape(JSContext*, JSClass const*, JS::Realm` 0; `js::jit::MaybeForwardedScriptFromCalleeToken(void*) [libxul.so]` 0; `js::ProxyObject::New(JSContext*, js::BaseProxyHandler const*, JS::Hand` 0; `write [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0

**tab pid 5249** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.0 | Idle 3, Graphics 1, Other 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, paint_layout 1 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `gfxTextRun::Draw(gfxTextRun::Range, mozilla::gfx::PointTyped<mozilla::` 1; `zen::ZenMouseTracker::AddRef() [libxul.so]` 0

**tab pid 4746** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.0 | Idle 3, Other 0 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| Timer | 2 | 0.0 | Other 2 | 0 / 0 / 2 | poll_wait 2 |
| IPC I/O Child | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | poll_wait 1 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3; `__lll_lock_wake [libc.so.6]` 0; `nsThread::ProcessNextEvent(bool, bool*) [libxul.so]` 0

