### gecko-debian raf (profile pass)

**parent pid 8204** — 481 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 276 | 9.1 | Graphics 183, Idle 90, Other 3 | 0 / 0 / 276 | ipc 275, webrender_render 184, webrender_sw_raster 167, poll_wait 91 |
| WRRenderBackend#0 | 59 | 1.9 | Other 59 | 0 / 0 / 59 | webrender_render 1, poll_wait 1, array_buffer_copy 0, memcpy_memset 0 |
| WRSceneBuilder#0 | 43 | 1.4 | Other 43 | 0 / 0 / 43 | webrender_scene 43, webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 41 | 1.3 | Idle 39, Other 1, Profiler 0 | 0 / 0 / 41 | ipc 41, poll_wait 39, paint_layout 0, webrender_render 0 |
| GeckoMain | 26 | 0.9 | Idle 20, JavaScript 2, Graphics 2, Layout 1 | 1 / 1 / 24 | ipc 26, poll_wait 20, paint_layout 3, harness_diagnostics 2 |
| SwComposite | 20 | 0.7 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 19, webrender_sw_raster 2, memcpy_memset 1 |
| IPC I/O Parent | 9 | 0.3 | Idle 9, Profiler 0, Other 0 | 0 / 0 / 9 | poll_wait 9, ipc 0, memcpy_memset 0 |
| WRSceneBuilderLP#0 | 5 | 0.2 | Other 5 | 0 / 0 / 5 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 20; `mozilla::EffectCompositor::GetAnimationElementAndPseudoForFrame(nsIFra` 1; `mprotect [libc.so.6]` 1; `nsIFrame::FinishAndStoreOverflow(mozilla::OverflowAreas&, nsSize, nsSt` 1; `TransformGfxRectToAncestor(mozilla::RelativeTo, mozilla::gfx::RectType` 1; `#execute (chrome://remote/content/marionette/driver.sys.mjs:4184:17)[5` 1; `mozilla::CSSOrderAwareFrameIteratorT<nsFrameList::Iterator<nsFrameList` 1; `PopEnvironment(JSContext*, js::EnvironmentIter&) [libxul.so]` 1

**tab pid 8434** — 170 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 154 | 5.1 | Idle 100, Graphics 14, Layout 14, Other 12 | 0 / 6 / 149 | ipc 147, poll_wait 101, paint_layout 37, gc_cc 9 |
| IPC I/O Child | 14 | 0.5 | Idle 14, Other 0, Profiler 0 | 0 / 0 / 14 | poll_wait 14, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 108; `[]` 3; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `style::parallel::style_trees [libxul.so]` 1; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 1; `mozilla::dom::XrayResolveProperty(JSContext*, JS::Handle<JSObject*>, J` 1; `mozilla::BufferList<js::SystemAllocPolicy>::AllocateBytes(unsigned lon` 1; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1

**tab pid 8364** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

**tab pid 8342** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1

