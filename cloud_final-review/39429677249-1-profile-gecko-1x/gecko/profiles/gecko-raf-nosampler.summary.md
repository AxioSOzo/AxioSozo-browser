### gecko raf-nosampler (profile pass)

**parent pid 3064** — 515 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| Renderer | 323 | 10.6 | Graphics 229, Idle 93, Profiler 1 | 0 / 0 / 323 | ipc 320, webrender_render 230, webrender_sw_raster 201, poll_wait 97 |
| WRRenderBackend#0 | 59 | 1.9 | Other 59, Profiler 0 | 0 / 0 / 59 | webrender_render 1, poll_wait 0, webrender_scene 0 |
| WRSceneBuilder#0 | 44 | 1.4 | Other 44 | 0 / 0 / 44 | webrender_scene 44, webrender_render 1, poll_wait 0, memcpy_memset 0 |
| Compositor | 43 | 1.4 | Idle 42, Other 1, Profiler 0 | 0 / 0 / 43 | ipc 43, poll_wait 42, webrender_render 0, memcpy_memset 0 |
| GeckoMain | 14 | 0.5 | Idle 8, JavaScript 3, DOM 2, Profiler 1 | 0 / 5 / 9 | ipc 14, poll_wait 9, harness_diagnostics 5, gc_cc 3 |
| SwComposite | 13 | 0.4 | Other 13 | 0 / 0 / 13 | webrender_render 13, poll_wait 13, webrender_sw_raster 0, memcpy_memset 0 |
| IPC I/O Parent | 10 | 0.3 | Idle 10, Other 0 | 0 / 0 / 10 | poll_wait 10, ipc 0 |
| WRSceneBuilderLP#0 | 6 | 0.2 | Other 6 | 0 / 0 / 6 |  |

Main thread, top self: `poll [libc.so.6]` 8; `XPCConvert::NativeInterface2JSObject(JSContext*, JS::MutableHandle<JS:` 1; `write [libc.so.6]` 1; `js::jit::CacheIRWriter::writeOperandId(js::jit::OperandId) [libxul.so]` 1; `JS::GetScriptedCallerGlobal(JSContext*) [libxul.so]` 1; `mprotect [libc.so.6]` 1; `mozilla::ProfileBufferEntryWriter::WriteBytes(void const*, unsigned in` 1; `js::jit::Assembler::movq(js::jit::ImmWord, js::jit::Register) [libxul.` 0

**tab pid 3312** — 159 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 143 | 4.7 | Idle 94, Graphics 20, Layout 13, Profiler 8 | 0 / 4 / 139 | ipc 136, poll_wait 96, paint_layout 41, subprocess_pipe_io 1 |
| IPC I/O Child | 16 | 0.5 | Idle 16, Other 0 | 0 / 0 / 16 | poll_wait 16, ipc 0 |
| Timer | 1 | 0.0 | Other 1 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 93; `[]` 5; `sendmsg [libc.so.6]` 2; `[linux-vdso.so.1]` 2; `write [libc.so.6]` 1; `PLDHashTable::Iterator::~Iterator() [libxul.so]` 1; `getcontext [libc.so.6]` 1; `__lll_lock_wait [libc.so.6]` 1

**tab pid 3316** — 1 ms CPU in the window

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

**tab pid 3211** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 1 | 0.0 | Idle 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0, ipc 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 1

