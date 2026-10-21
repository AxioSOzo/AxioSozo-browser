### gecko-debian key (profile pass)

**parent pid 8187** — 133 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 79 | 2.1 | Idle 31, Graphics 16, Layout 14, JavaScript 7 | 2 / 10 / 67 | ipc 79, poll_wait 35, paint_layout 30, harness_diagnostics 3 |
| Renderer | 19 | 0.5 | Idle 13, Graphics 6 | 0 / 0 / 19 | ipc 19, poll_wait 14, webrender_render 6, webrender_sw_raster 5 |
| Compositor | 9 | 0.3 | Idle 8, Other 1, Profiler 0 | 0 / 0 / 9 | ipc 9, poll_wait 8, memcpy_memset 1, canvas_2d 0 |
| WRRenderBackend#0 | 9 | 0.2 | Other 9 | 0 / 0 / 9 | webrender_render 0, poll_wait 0 |
| WRSceneBuilder#0 | 7 | 0.2 | Other 7 | 0 / 0 / 7 | webrender_scene 7, webrender_render 0 |
| IPC I/O Parent | 4 | 0.1 | Idle 4 | 0 / 0 / 4 | poll_wait 4 |
| SwComposite | 2 | 0.0 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 32; `[axiosozo-dev]` 4; `IsTwiceTheRequiredBytesRepresentableAsUint32(unsigned long, unsigned l` 2; `nsBlockFrame::Reflow(nsPresContext*, mozilla::ReflowOutput&, mozilla::` 2; `nsIFrame::ComputeSize(mozilla::SizeComputationInput const&, mozilla::W` 2; `mozilla::layers::WebRenderLayerManager::EndTransactionWithoutLayer(moz` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `nsIFrame::ComputeBSizeValueAsPercentageBasis(mozilla::StyleGenericSize` 1

**tab pid 8454** — 40 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 36 | 1.0 | Idle 20, GC / CC 5, Graphics 3, JavaScript 2 | 0 / 2 / 34 | ipc 35, poll_wait 20, gc_cc 6, paint_layout 6 |
| IPC I/O Child | 3 | 0.1 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 20; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `webrtc::rtcp::TargetBitrate::GetTargetBitrates() const [libxul.so]` 1; `mozilla::DisplayListClipState::ClipContainingBlockDescendants(mozilla:` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1; `mozilla::detail::nsDequeBase::Push(void*, std::nothrow_t const&) [libx` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `js::NurseryAwareHashMap<JSString*, JSString*, js::TrackedAllocPolicy<(` 1

**tab pid 8277** — 5 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 0.1 | Idle 3, JavaScript 0, DOM 0 | 0 / 0 / 3 | ipc 4, poll_wait 3, array_buffer_copy 0 |
| IPC I/O Child | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::OpaqueXrayTraits>::` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0; `mozilla::detail::nsTStringRepr<char>::Equals(mozilla::detail::nsTStrin` 0

**tab pid 8368** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0, Profiler 0 | 0 / 0 / 0 | ipc 0, poll_wait 0, memcpy_memset 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__memmove_avx512_unaligned_erms [libc.so.6]` 0

