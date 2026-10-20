### gecko-2x idle (profile pass)

**parent pid 2847** — 9 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 7 | 0.4 | JavaScript 3, Idle 3, DOM 1, Other 0 | 1 / 3 / 3 | ipc 7, harness_diagnostics 4, gc_cc 4, poll_wait 3 |
| IPC I/O Parent | 1 | 0.1 | Idle 1, Other 0 | 0 / 0 / 1 | poll_wait 1, ipc 0 |
| Socket Thread | 1 | 0.0 | Other 1 | 0 / 0 / 1 | ipc 1, poll_wait 1 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Renderer | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| WRSceneBuilder#0 | 0 | 0.0 | Other 0 | 0 / 0 / 0 | webrender_scene 0 |
| WrGlyphRasterizer | 0 | 0.0 | Other 0 | 0 / 0 / 0 |  |

Main thread, top self: `poll [libc.so.6]` 3; `replacer (chrome://remote/content/marionette/message.sys.mjs:24:22)[11` 1; `js::NewObjectWithClassProto(JSContext*, JSClass const*, JS::Handle<JSO` 1; `[axiosozo-dev]` 1; `ReservedWordInfo const* FindReservedWord<char16_t>(char16_t const*, un` 1; `XPCCallContext::SetName(JS::PropertyKey) [libxul.so]` 1; `[libglib-2.0.so.0]` 0; `mozilla::dom::(anonymous namespace)::QuotaClient::MatchFunction::AddRe` 0

**tab pid 3114** — 30 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 25 | 1.2 | Idle 15, GC / CC 5, JavaScript 4, Other 1 | 0 / 3 / 22 | ipc 24, poll_wait 15, gc_cc 7, harness_diagnostics 3 |
| IPC I/O Child | 5 | 0.2 | Idle 5, Other 0 | 0 / 0 / 5 | poll_wait 5, ipc 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 15; `bool TraversalTracer::onEdge<JSObject>(JSObject**, char const*) [libxu` 1; `JS::Compartment::findSweepGroupEdges() [libxul.so]` 1; `void js::gc::TraceRangeInternal<JS::Value>(JSTracer*, unsigned long, J` 1; `js::ForwardingProxyHandler::get(JSContext*, JS::Handle<JSObject*>, JS:` 1; `js::jit::DoLazyConstantFallback(JSContext*, js::jit::BaselineFrame*, j` 1; `__memmove_avx512_unaligned_erms [libc.so.6]` 1; `mozilla::net::nsStandardURL::Release() [libxul.so]` 1

**tab pid 3186** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

**tab pid 3141** — 1 ms CPU in the window

| Thread | CPU ms | % of span | top categories | JS leaf / native under JS / native | top buckets |
| --- | ---: | ---: | --- | --- | --- |
| GeckoMain | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | ipc 0, poll_wait 0 |
| Timer | 0 | 0.0 | Other 0 | 0 / 0 / 0 | poll_wait 0 |
| IPC I/O Child | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| Socket Thread | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| BackgroundThreadPool #1 | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageIO | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |
| ImageBridgeChld | 0 | 0.0 | Idle 0 | 0 / 0 / 0 | poll_wait 0 |

Main thread, top self: `poll [libc.so.6]` 0

