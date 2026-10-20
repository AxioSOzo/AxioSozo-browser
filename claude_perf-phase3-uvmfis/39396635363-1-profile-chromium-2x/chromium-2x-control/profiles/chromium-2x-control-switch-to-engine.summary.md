### chromium-2x-control switch-to-engine (profile pass)

**parent pid 4356** — 196 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 63 | 14.5 | Graphics 62, Idle 1 | 0 / 0 / 63 | ipc 62, webrender_render 62, webrender_sw_raster 61, memcpy_memset 1 |
| GeckoMain | 60 | 13.8 | JavaScript 25, Layout 16, Idle 11, Graphics 4 | 1 / 30 / 29 | ipc 60, paint_layout 24, gc_cc 17, poll_wait 12 |
| DOM Worker | 41 | 9.4 | JavaScript 35, Profiler 4, Idle 1 | 0 / 0 / 41 | subprocess_pipe_io 41, worker_messaging 41, ipc 41, poll_wait 22 |
| BackgroundThreadPool #2 | 10 | 2.3 | Other 6, Idle 4 | 0 / 0 / 10 | ipc 10, native_receiver 6, poll_wait 4, image_container 3 |
| SwComposite | 7 | 1.7 | Other 7 | 0 / 0 / 7 | webrender_render 7, poll_wait 6, memcpy_memset 2, webrender_sw_raster 2 |
| WRRenderBackend#0 | 5 | 1.2 | Other 5 | 0 / 0 / 5 | webrender_render 0 |
| Compositor | 4 | 0.9 | Idle 3, Other 1 | 0 / 0 / 4 | ipc 4, poll_wait 3 |
| IPC I/O Parent | 3 | 0.6 | Idle 3, Other 0 | 0 / 0 / 3 | poll_wait 3, ipc 0 |

Main thread, top self: `poll [libc.so.6]` 11; `style::properties::generated::longhands::corner_bottom_left_shape::cas` 4; `js::LookupPropertyPure(JSContext*, JSObject*, JS::PropertyKey, js::Nat` 4; `nsPropertyTable::GetPropertyInternal(nsPropertyOwner, nsAtom const*, b` 3; `js::jit::CacheIRWriter::addStubField(unsigned long, js::jit::StubField` 2; `nsGridContainerFrame::GridItemInfo::GridItemInfo(nsIFrame*, nsGridCont` 2; `js::RunScript(JSContext*, js::RunState&) [libxul.so]` 2; `XPCWrappedNative::CallMethod(XPCCallContext&, XPCWrappedNative::CallMo` 2

**tab pid 5142** — 38 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 10.8 | Other 31, DOM 4, JavaScript 1, Idle 1 | 0 / 4 / 33 | ipc 29, gc_cc 10, array_buffer_copy 10, subprocess_pipe_io 6 |
| IPC I/O Child | 1 | 0.2 | Idle 1, Profiler 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `js::frontend::RewritingParseNodeVisitor<FoldVisitor>::visit(js::fronte` 3; `sk_malloc_flags(unsigned long, unsigned int) [libxul.so]` 3; `[]` 3; `mozilla::Vector<js::wasm::CallSiteTarget, 0ul, js::SystemAllocPolicy>:` 2; `connect [libc.so.6]` 1; `nsZipArchive::GetDataOffset(nsZipItem*) [libxul.so]` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `__strcmp_evex [libc.so.6]` 1

**tab pid 5140** — 38 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 37 | 13.0 | Other 30, JavaScript 3, DOM 2, Idle 1 | 0 / 5 / 32 | ipc 28, array_buffer_copy 12, gc_cc 9, subprocess_pipe_io 4 |
| IPC I/O Child | 0 | 0.2 | Idle 0, Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |

Main thread, top self: `__strlen_evex [libc.so.6]` 3; `[]` 3; `syscall [libc.so.6]` 1; `pthread_create@GLIBC_2.2.5 [libc.so.6]` 1; `getdents64 [libc.so.6]` 1; `[libexpat.so.1]` 1; `pthread_mutex_unlock@@GLIBC_2.2.5 [libc.so.6]` 1; `js::jit::X86Encoding::BaseAssembler::X86InstructionFormatter::memoryMo` 1

**tab pid 5031** — 4 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 3 | 0.7 | Idle 3 | 0 / 0 / 3 | ipc 3, poll_wait 3 |
| IPC I/O Child | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 3

