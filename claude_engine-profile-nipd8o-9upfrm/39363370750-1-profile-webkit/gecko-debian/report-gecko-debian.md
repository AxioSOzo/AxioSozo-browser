# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz; passes: plain PASS, trace PASS, profile PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.3 | **7.9** (Renderer 3.4, main 2.0, DOM Worker 1.0, WRRende~ckend# 0.5, Compositor 0.5) | Web Content 3.4, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.3 | **29.4** (Renderer 18.5, WRRende~ckend# 2.3, main 2.0, TaskCon~ller # 1.3, WRScene~ilder# 1.3) | Isolated Web Co 5.3, Privileged Cont 0.6, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **50.7** (Renderer 34.2, main 5.5, WRRende~ckend# 3.0, SwComposite 2.5, TaskCon~ller # 1.5) | Isolated Web Co 4.0 | — | — |
| plain | key | — | — | **6.9** (main 4.0, Renderer 1.1, glean.dispatche 0.3, Softwar~cThread 0.3, WrGlyph~terizer 0.3) | Isolated Web Co 1.9, WebExtensions 0.6, Privileged Cont 0.5, Web Content 0.3 | 9.0 | — |
| trace | idle | 59.1 | 17.4 | **6.0** (main 2.5, TaskCon~ller # 1.0, IPDL Background 0.5, Renderer 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.5 | — | — |
| trace | raf | 59.0 | 17.4 | **22.7** (Renderer 11.9, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.9 | — | — |
| trace | scroll | 59.0 | 17.1 | **47.3** (Renderer 32.8, main 4.0, WRRende~ckend# 3.5, SwComposite 2.5, WRScene~ilder# 1.5) | Isolated Web Co 4.5 | — | — |
| trace | key | — | — | **8.5** (main 4.8, Renderer 1.1, Compositor 0.8, Softwar~cThread 0.5, WRScene~ilder# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 10.5 | — |
| profile | idle | 59.5 | 17.1 | **61.9** (DOM Worker 16.6, Indexed~ IO # 14.1, main 13.6, IPDL Background 5.8, SamplerThread 4.9) | Web Content 5.8, Isolated Web Co 3.4, Privileged Cont 1.5, RDD Process 1.5 | — | — |
| profile | raf | 59.0 | 17.1 | **60.3** (Renderer 14.1, main 12.8, DOM Worker 10.2, SamplerThread 5.9, IPDL Background 3.6) | Isolated Web Co 10.8, Web Content 5.9, Privileged Cont 1.6, Socket Process 1.3 | — | — |
| profile | scroll | 59.0 | 17.1 | **65.1** (Renderer 37.1, main 8.0, SamplerThread 6.0, WRRende~ckend# 3.5, SwComposite 3.0) | Isolated Web Co 9.0, Web Content 5.0, Socket Process 1.0, WebExtensions 1.0 | — | — |
| profile | key | — | — | **13.8** (main 5.1, SamplerThread 3.2, Renderer 1.3, TaskCon~ller # 0.8, WRRende~ckend# 0.8) | Web Content 5.4, Isolated Web Co 3.3, WebExtensions 1.4, Socket Process 0.8 | 8.5 | — |

Key → paint breakdown (median ms; hooks):

| pass | keydown→send | send→frame header (host) | payload transport | received→accept | tick wait | surface paint | paint→MozAfterPaint | keydown→surface paint end | keydown→MozAfterPaint |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| trace | — | — | — | — | — | — | — | — | — |
| profile | — | — | — | — | — | — | — | — | — |

### Profile: gecko-debian / idle

- **parent** CPU ms by thread group: DOM Worker 337, main 274, Socket 7, Compositor 2, other 2, IPC I/O 1, Renderer 1, SwComposite 0, WRRenderBackend 0, WRSceneBuilder 0, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 274 ms (13.3% of span): JavaScript 116, DOM 77, Other 35, Idle 33, Network 4, GC / CC 4
  - JS leaf 18 / native under JS 155 / native 101; buckets: ipc 273, gc_cc 179, array_buffer_copy 53, poll_wait 51, worker_messaging 8, memcpy_memset 7, subprocess_pipe_io 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 45; `[unknown]` 24; `[axiosozo-dev]` 8; `mprotect [libc.so.6]` 7; `validate (chrome://global/content/third_party/cfworker/json-` 7; `js::NativeObject::addProperty(JSContext*, JS::Handle<js::Nat` 5
  - GC/CC markers: GCMinor 5× 5 ms
  - WebRender/compositor threads: Renderer 1 ms (top self: `__syscall_cancel_arch [libc.so.6]` 0, `__memmove_evex_unaligned_erms [libc.so.6]` 0); SwComposite 0 ms (top self: `syscall [libc.so.6]` 0); WRRenderBackend#0 0 ms (top self: `syscall [libc.so.6]` 0)
  - busiest DOM Worker 336 ms: buckets worker_messaging 336, ipc 335, gc_cc 86, poll_wait 60, array_buffer_copy 55, memcpy_memset 18; top self: `[unknown]` 54; `__syscall_cancel_arch [libc.so.6]` 53; `jsesc (resource://gre/modules/third_party/jsesc/js` 20; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 16; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 12
- **tab:8370** CPU ms by thread group: main 36, IPC I/O 6, other 0, Socket 0, ImageIO 0
  - main thread 36 ms (1.8% of span): Idle 23, GC / CC 6, JavaScript 4, Layout 2, Other 1, Profiler 0
  - JS leaf 0 / native under JS 5 / native 32; buckets: ipc 35, poll_wait 24, gc_cc 8, array_buffer_copy 3, paint_layout 2, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 24; `js::gc::MarkingTracerT<1u>::processMarkStackTop(JS::SliceBud` 2; `js::LookupProperty(JSContext*, JS::Handle<JSObject*>, JS::Ha` 1; `CCGraphBuilder::NoteJSChild(JS::GCCellPtr) [libxul.so]` 1; `js::GenericTracerImpl<TraversalTracer>::onShapeEdge(js::Shap` 1; `mozilla::detail::HashTable<mozilla::HashMapEntry<js::UnsafeB` 1
  - GC/CC markers: GCMajor 1× 20 ms, GCSlice 4× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8205** CPU ms by thread group: main 2, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 2 ms (0.1% of span): Idle 2, Profiler 0, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `_ZN7mozilla20ProfileChunkedBuffer16ReserveAndPutRawIZNS0_13R` 0; `mozilla::dom::PContentChild::OnMessageReceived(IPC::Message ` 0; `[linux-vdso.so.1]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8308** CPU ms by thread group: main 1, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.1% of span): Idle 1, Other 0
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1; `g_ptr_array_set_size [libglib-2.0.so.0]` 0

### Profile: gecko-debian / raf

- **parent** CPU ms by thread group: Renderer 410, main 383, DOM Worker 294, WRRenderBackend 76, WRSceneBuilder 58, Compositor 46, SwComposite 26, Socket 14, IPC I/O 10, other 5, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 383 ms (12.5% of span): Idle 88, JavaScript 82, DOM 67, GC / CC 67, Other 62, Network 9
  - JS leaf 6 / native under JS 116 / native 261; buckets: ipc 382, gc_cc 191, poll_wait 123, array_buffer_copy 55, memcpy_memset 15, worker_messaging 8, paint_layout 3
  - top self: `__syscall_cancel_arch [libc.so.6]` 108; `pthread_cond_signal@@GLIBC_2.3.2 [libc.so.6]` 13; `[unknown]` 11; `__memmove_evex_unaligned_erms [libc.so.6]` 11; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 10; `[axiosozo-dev]` 10
  - GC/CC markers: GCMajor 1× 71 ms, GCSlice 23× 31 ms, CCSlice 2× 24 ms, GCMinor 2× 9 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 410 ms (top self: `__syscall_cancel_arch [libc.so.6]` 100, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 84, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 84); WRRenderBackend#0 76 ms (top self: `syscall [libc.so.6]` 64, `sched_yield [libc.so.6]` 3, `webrender::batch::BatchBuilder::add_prim_to_batch ` 1); WRSceneBuilder#0 53 ms (top self: `syscall [libc.so.6]` 45, `sched_yield [libc.so.6]` 2, `[axiosozo-dev]` 1)
  - busiest DOM Worker 292 ms: buckets worker_messaging 292, ipc 287, gc_cc 100, poll_wait 47, array_buffer_copy 25, memcpy_memset 13; top self: `[unknown]` 53; `__syscall_cancel_arch [libc.so.6]` 43; `jsesc (resource://gre/modules/third_party/jsesc/js` 25; `JSLinearString* JSRope::flattenInternal<(JSRope::U` 19; `js::gc::ArenaLists::refillFreeListAndAllocate(js::` 16
- **tab:8370** CPU ms by thread group: main 205, IPC I/O 16, other 5, Socket 0, ImageIO 0
  - main thread 205 ms (6.7% of span): Idle 96, Graphics 35, Layout 32, Other 21, Profiler 9, GC / CC 6
  - JS leaf 0 / native under JS 11 / native 194; buckets: ipc 192, poll_wait 99, paint_layout 79, gc_cc 8, subprocess_pipe_io 3, canvas_2d 3, array_buffer_copy 2, memcpy_memset 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 103; `[]` 4; `__lll_lock_wait [libc.so.6]` 3; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 2; `CCGraphBuilder::AddNode(void*, nsCycleCollectionParticipant*` 2; `mozilla::BufferList<InfallibleAllocPolicy>::AllocateBytes(un` 2
  - GC/CC markers: GCMajor 1× 17 ms, GCSlice 5× 3 ms, CCSlice 1× 3 ms, GCMinor 1× 0 ms, CC 1× 0 ms
- **tab:8308** CPU ms by thread group: main 4, IPC I/O 2, other 0, Socket 0, ImageIO 0
  - main thread 4 ms (0.1% of span): Idle 4, Other 0
  - JS leaf 0 / native under JS 0 / native 4; buckets: ipc 4, poll_wait 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 4; `[linux-vdso.so.1]` 0
- **utility:8362** CPU ms by thread group: IPC I/O 2, main 2
  - main thread 2 ms (0.1% of span): Idle 2, Other 0
  - JS leaf 0 / native under JS 0 / native 2; buckets: ipc 2, poll_wait 2
  - top self: `__syscall_cancel_arch [libc.so.6]` 2; `[linux-vdso.so.1]` 0; `nsTSubstring<char>::Assign(nsTSubstring<char>&&, std::nothro` 0; `mozilla::dom::PrefValue::PrefValue(mozilla::dom::PrefValue&&` 0

### Profile: gecko-debian / scroll

- **parent** CPU ms by thread group: Renderer 717, main 145, WRRenderBackend 80, SwComposite 59, DOM Worker 47, Compositor 31, WRSceneBuilder 24, IPC I/O 8, other 1, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 145 ms (7.2% of span): Idle 75, GC / CC 28, Other 19, Graphics 7, Layout 6, JavaScript 6
  - JS leaf 0 / native under JS 7 / native 138; buckets: ipc 144, poll_wait 97, gc_cc 33, paint_layout 13, array_buffer_copy 3, subprocess_pipe_io 2, memcpy_memset 2, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 84; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 6; `js::PrivateScriptData::trace(JSTracer*) [libxul.so]` 2; `js::TraceManuallyBarrieredGCCellPtr(JSTracer*, JS::GCCellPtr` 2; `[axiosozo-dev]` 2; `SweepScriptDataTable(mozilla::HashSet<js::SharedImmutableScr` 1
  - GC/CC markers: GCMajor 1× 73 ms, GCSlice 7× 23 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms, CC 1× 0 ms
  - WebRender/compositor threads: Renderer 717 ms (top self: `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 252, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 129, `__syscall_cancel_arch [libc.so.6]` 59); WRRenderBackend#0 81 ms (top self: `syscall [libc.so.6]` 52, `webrender::frame_builder::FrameBuilder::build [lib` 2, `__memmove_evex_unaligned_erms [libc.so.6]` 2); SwComposite 59 ms (top self: `syscall [libc.so.6]` 50, `__memmove_evex_unaligned_erms [libc.so.6]` 8, `webrender::compositor::sw_compositor::SwCompositeT` 0)
  - busiest DOM Worker 45 ms: buckets gc_cc 45, worker_messaging 44, ipc 44, memcpy_memset 14, poll_wait 0; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 15; `madvise [libc.so.6]` 10; `munmap [libc.so.6]` 3; `js::GenericTracerImpl<js::gc::MovingTracer>::onStr` 2; `js::gc::AllocSpace<js::gc::SmallBufferRegion, 1638` 2
- **tab:8370** CPU ms by thread group: main 100, IPC I/O 14, other 1, Socket 0, ImageIO 0
  - main thread 100 ms (5.0% of span): Idle 70, Graphics 14, Other 8, Profiler 2, Layout 2, JavaScript 2
  - JS leaf 0 / native under JS 3 / native 97; buckets: ipc 97, poll_wait 70, paint_layout 20, array_buffer_copy 2, gc_cc 1, canvas_2d 1, mozafterpaint_events 0, memcpy_memset 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 73; `[]` 2; `nsTextFrame::PaintText(nsTextFrame::PaintTextParams const&, ` 2; `GetTrimmableWhitespaceCount(mozilla::dom::CharacterDataBuffe` 1; `mozilla::PresShell::MarkFramesInSubtreeApproximatelyVisible(` 1; `nsSliderFrame::QueryFrame(nsQueryFrame::FrameIID) const [lib` 1
- **tab:8289** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0
- **tab:8463** CPU ms by thread group: main 0, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 0 ms (0.0% of span): Idle 0
  - JS leaf 0 / native under JS 0 / native 0; buckets: ipc 0, poll_wait 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 0

### Profile: gecko-debian / key

- **parent** CPU ms by thread group: main 185, Renderer 43, WRRenderBackend 18, Compositor 18, WRSceneBuilder 14, IPC I/O 8, SwComposite 5, DOM Worker 4, other 2, Socket 1, WRWorker 0, Canvas 0, ImageIO 0
  - main thread 185 ms (4.9% of span): Idle 46, Layout 39, GC / CC 29, Graphics 21, JavaScript 17, Other 17
  - JS leaf 5 / native under JS 19 / native 161; buckets: ipc 184, paint_layout 66, poll_wait 59, gc_cc 42, subprocess_pipe_io 7, array_buffer_copy 5, memcpy_memset 4
  - top self: `__syscall_cancel_arch [libc.so.6]` 51; `js::gc::MarkingTracerT<2u>::processMarkStackTop(JS::SliceBud` 7; `nsIFrame::BuildDisplayListForChild(mozilla::nsDisplayListBui` 4; `mozilla::nsDisplayListBuilder::IsAnimatedGeometryRoot(nsIFra` 3; `void mozilla::WriteULEB128<unsigned int, mozilla::ProfileBuf` 3; `nsIFrame::IsReplaced() const [libxul.so]` 3
  - GC/CC markers: GCMajor 1× 56 ms, GCSlice 6× 22 ms, CCSlice 1× 5 ms, GCMinor 1× 0 ms
  - WebRender/compositor threads: Renderer 43 ms (top self: `__syscall_cancel_arch [libc.so.6]` 23, `ps_quad_mask_SUPERELLIPSE_frag::distance_to_supere` 8, `void draw_quad_spans<unsigned int>(int, glsl::vec2` 2); WRRenderBackend#0 18 ms (top self: `syscall [libc.so.6]` 16, `webrender::batch::AlphaBatchBuilder::build [libxul` 0, `sched_yield [libc.so.6]` 0); WRSceneBuilder#0 13 ms (top self: `syscall [libc.so.6]` 12, `sched_yield [libc.so.6]` 1, `nsTArrayInfallibleAllocator::ResultTypeProxy nsTAr` 0)
  - busiest DOM Worker 4 ms: buckets worker_messaging 4, ipc 4, gc_cc 3, memcpy_memset 1, poll_wait 1; top self: `unsigned long js::gc::Arena::finalize<JSString, (j` 1; `madvise [libc.so.6]` 1; `__syscall_cancel_arch [libc.so.6]` 1; `auto js::MapGCThingTyped<TraceTaggedPtrEdge<JS::Va` 1
- **tab:8370** CPU ms by thread group: main 66, IPC I/O 6, other 1, Socket 0, ImageIO 0
  - main thread 66 ms (1.8% of span): Idle 25, GC / CC 11, Other 9, Layout 7, Graphics 6, JavaScript 5
  - JS leaf 0 / native under JS 6 / native 60; buckets: ipc 61, poll_wait 27, paint_layout 15, gc_cc 13, array_buffer_copy 3, memcpy_memset 1, mozafterpaint_events 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 29; `[linux-vdso.so.1]` 2; `js::gc::ArenaLists::refillFreeListAndAllocate(js::gc::AllocK` 2; `[]` 1; `nsTextNode::QueryInterface(nsID const&, void**) [libxul.so]` 1; `pthread_mutex_lock@@GLIBC_2.2.5 [libc.so.6]` 1
  - GC/CC markers: GCMajor 1× 25 ms, CCSlice 1× 4 ms, GCSlice 4× 4 ms, GCMinor 1× 1 ms
- **tab:8205** CPU ms by thread group: main 6, IPC I/O 1, other 0, Socket 0, ImageIO 0
  - main thread 6 ms (0.2% of span): Idle 6, JavaScript 0, Other 0
  - JS leaf 0 / native under JS 0 / native 6; buckets: ipc 6, poll_wait 6, array_buffer_copy 0
  - top self: `__syscall_cancel_arch [libc.so.6]` 6; `xpc::XrayWrapper<js::CrossCompartmentWrapper, xpc::JSXrayTra` 0; `__pthread_mutex_unlock_usercnt [libc.so.6]` 0; `[]` 0
  - GC/CC markers: GCMinor 1× 0 ms
- **tab:8267** CPU ms by thread group: main 1, other 0, IPC I/O 0, Socket 0, ImageIO 0
  - main thread 1 ms (0.0% of span): Idle 1
  - JS leaf 0 / native under JS 0 / native 1; buckets: ipc 1, poll_wait 1
  - top self: `__syscall_cancel_arch [libc.so.6]` 1

