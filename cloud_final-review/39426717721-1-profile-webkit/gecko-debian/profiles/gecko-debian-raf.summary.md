### gecko-debian raf (profile pass)

**parent pid 8212** — 547 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 318 | 10.3 | Graphics 220, Idle 97, Other 1 | 0 / 0 / 318 | ipc 315, webrender_render 221, webrender_sw_raster 198, poll_wait 103 |
| WRRenderBackend#0 | 67 | 2.2 | Other 67 | 0 / 0 / 67 | memcpy_memset 1, webrender_render 0, poll_wait 0, array_buffer_copy 0 |
| WRSceneBuilder#0 | 47 | 1.5 | Other 47 | 0 / 0 / 47 | webrender_scene 47, webrender_render 1, poll_wait 1, memcpy_memset 0 |
| Compositor | 45 | 1.4 | Idle 44, Other 1 | 0 / 0 / 45 | ipc 45, poll_wait 44, webrender_render 0, paint_layout 0 |
| GeckoMain | 27 | 0.9 | Idle 18, JavaScript 3, Graphics 2, Layout 1 | 0 / 4 / 22 | ipc 27, poll_wait 19, gc_cc 6, paint_layout 4 |
| SwComposite | 20 | 0.6 | Other 20 | 0 / 0 / 20 | webrender_render 20, poll_wait 18, memcpy_memset 2, webrender_sw_raster 2 |
| IPC I/O Parent | 11 | 0.4 | Idle 11, Other 0 | 0 / 0 / 11 | poll_wait 11, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 18; `PLDHashTable::~PLDHashTable() [libxul.so]` 2; `js::LookupNameNoGC(JSContext*, js::PropertyName*, JSObject*, js::Nativ` 1; `js::NativeObject::setUniqueId(JSRuntime*, unsigned long) [libxul.so]` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 1; `[unknown]` 1; `nsFlexContainerFrame::FlexLine::AddLastItemToMainSizeTotals() [libxul.` 1; `js::jit::ICScript::initICEntries(JSContext*, JSScript*) [libxul.so]` 1

**tab pid 8460** — 180 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 162 | 5.2 | Idle 99, Graphics 27, Layout 16, Other 8 | 0 / 8 / 154 | ipc 151, poll_wait 98, paint_layout 50, gc_cc 3 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0, Profiler 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 2 | 0.1 | Other 2 | 0 / 0 / 2 | poll_wait 2, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 101; `[]` 6; `[linux-vdso.so.1]` 2; `__pthread_mutex_unlock_usercnt [libc.so.6]` 1; `__memset_avx2_unaligned_erms [libc.so.6]` 1; `nsIFrame::GetOverflowRect(mozilla::OverflowType) const [libxul.so]` 1; `js::Wrapper::finalizeInBackground(JS::Value const&) const [libxul.so]` 1; `std::io::impls::<impl std::io::Write for &mut W>::write_all [libxul.so` 1

**tab pid 8379** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 0; `[linux-vdso.so.1]` 0

**tab pid 8398** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1, Other 0 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 1; `mozilla::TaskController::MaybeInterruptTask(mozilla::Task*, mozilla::d` 0

