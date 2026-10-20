### webkit-control switch-to-gecko (profile pass)

**parent pid 9563** — 112 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 66 | 23.6 | JavaScript 31, Layout 8, Other 8, Graphics 7 | 1 / 45 / 20 | ipc 66, array_buffer_copy 18, paint_layout 15, gc_cc 15 |
| Renderer | 17 | 6.0 | Graphics 15, Idle 1 | 0 / 0 / 17 | ipc 17, webrender_render 15, webrender_sw_raster 15, poll_wait 1 |
| DOM Worker | 11 | 3.9 | JavaScript 10, Idle 1 | 0 / 0 / 11 | subprocess_pipe_io 11, worker_messaging 11, ipc 11, poll_wait 10 |
| BgIOThreadPool #2 | 5 | 1.7 | Other 4, Idle 1 | 0 / 0 / 5 | ipc 5, poll_wait 1 |
| Compositor | 3 | 1.2 | Idle 2, Other 2 | 0 / 0 / 3 | ipc 3, poll_wait 2, memcpy_memset 2 |
| IPC I/O Parent | 2 | 0.8 | Idle 2 | 0 / 0 / 2 | poll_wait 2 |
| WRRenderBackend#0 | 2 | 0.8 | Other 2 | 0 / 0 / 2 |  |
| SwComposite | 2 | 0.7 | Other 2 | 0 / 0 / 2 | webrender_render 2, poll_wait 2 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 9; `js::NativeGetProperty(JSContext*, JS::Handle<js::NativeObject*>, JS::H` 5; `[unknown]` 5; `js::Interpret(JSContext*, js::RunState&) [libxul.so]` 5; `__memmove_evex_unaligned_erms [libc.so.6]` 3; `indexmap::map::IndexMap<K,V,S>::get_index_of [libxul.so]` 3; `js::PropMapTable::lookupRaw(JS::PropertyKey) const [libxul.so]` 3; `mozilla::nsDisplayWrapList::GetBounds(mozilla::nsDisplayListBuilder*, ` 3

**tab pid 9966** — 28 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 26 | 9.5 | JavaScript 10, Other 6, Idle 5, Layout 3 | 0 / 10 / 16 | ipc 24, paint_layout 9, gc_cc 9, poll_wait 5 |
| IPC I/O Child | 1 | 0.4 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.1 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 5; `__strlen_evex [libc.so.6]` 2; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1; `bool js::NativeSetProperty<(js::QualifiedBool)1>(JSContext*, JS::Handl` 1; `js::SharedPropMap::addProperty(JSContext*, JSClass const*, JS::Mutable` 1; `JS::WeakCache<JS::GCHashSet<js::WeakHeapPtr<js::SharedShape*>, js::Pro` 1; `js::jit::BaselineICAvailableGeneralRegs(unsigned long) [libxul.so]` 1; `pthread_mutex_destroy@@GLIBC_2.2.5 [libc.so.6]` 1

**tab pid 9653** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 4 | 1.3 | Idle 3, Other 0, DOM 0 | 0 / 0 / 4 | ipc 4, poll_wait 3, gc_cc 0, array_buffer_copy 0 |
| IPC I/O Child | 0 | 0.2 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 3; `mozilla::detail::HashTable<js::HeapPtr<JS::Value> const, mozilla::Hash` 0; `JSAtom* js::AtomizeChars<unsigned char>(JSContext*, unsigned char cons` 0

**tab pid 9749** — 0 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.1 | Idle 0, Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `__syscall_cancel_arch [libc.so.6]` 0; `__lll_lock_wait [libc.so.6]` 0

