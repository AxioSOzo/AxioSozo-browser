# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **4.9** (main 1.9, DOM Worker 1.5, Renderer 1.0, glean.dispatche 0.5) | Web Content 2.4, RDD Process 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **16.9** (Renderer 8.5, main 1.6, WRRende~ckend# 1.6, TaskCon~ller # 1.3, glean.dispatche 1.0) | Isolated Web Co 3.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **10.9** (Renderer 5.6, WRRende~ckend# 1.3, main 1.0, glean.dispatche 1.0, WRScene~ilder# 1.0) | Isolated Web Co 3.0 | — | — |
| plain | scroll | 59.0 | 17.2 | **28.3** (Renderer 17.8, main 3.0, WRRende~ckend# 2.5, Compositor 1.5, WRScene~ilder# 1.0) | Isolated Web Co 4.0, Privileged Cont 1.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **5.9** (main 3.5, glean.dispatche 0.5, TaskCon~ller # 0.5, Renderer 0.5, IPC I/O Parent 0.3) | Isolated Web Co 1.6, WebExtensions 0.3 | 8.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## gecko-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.1 | **6.8** (main 1.9, Renderer 1.9, DOM Worker 1.5, glean.dispatche 0.5, WRRende~ckend# 0.5) | Web Content 2.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **26.9** (Renderer 15.7, SwComposite 2.6, main 1.6, TaskCon~ller # 1.3, WRScene~ilder# 1.3) | Isolated Web Co 3.3, WebExtensions 1.0, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **18.7** (Renderer 9.6, WRRende~ckend# 1.7, SwComposite 1.7, Compositor 1.3, main 1.0) | Isolated Web Co 3.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **70.3** (Renderer 52.8, SwComposite 6.5, main 4.0, WRRende~ckend# 3.5, glean.dispatche 1.0) | Isolated Web Co 3.0, Web Content 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.5** (main 3.7, Renderer 1.1, TaskCon~ller # 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.6 | 11.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **55.2** (main 27.5, Renderer 11.8, DOM Worker 5.9, StyleThread# 2.0, WRScene~ilder# 2.0) | AxioCEFProbe 55.0, cef:gpu-process 19.7, cef:renderer 11.8, cef:utility 9.8 | — | 466.0 |
| plain | idle | — | — | **5.3** (main 4.3, Timer 1.0) | AxioCEFProbe 1.0, WebExtensions 0.5 | — | — |
| plain | raf | 60.0 | 20.9 | **20.8** (main 7.8, DOM Worker 3.6, Renderer 2.3, Backgro~Pool # 1.9, Compositor 1.3) | cef:renderer 8.4, AxioCEFProbe 7.8, cef:gpu-process 5.8, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **20.5** (main 6.3, DOM Worker 3.3, Renderer 2.3, Backgro~Pool # 1.7, glean.dispatche 1.3) | cef:renderer 10.2, AxioCEFProbe 5.3, cef:gpu-process 5.0, WebExtensions 0.3 | — | — |
| plain | scroll | 59.8 | 23.2 | **39.9** (main 19.4, DOM Worker 7.8, Backgro~Pool # 2.4, TaskCon~ller # 1.9, Renderer 1.9) | cef:gpu-process 20.4, cef:renderer 10.7, AxioCEFProbe 8.2, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **14.1** (main 8.0, Renderer 1.4, DOM Worker 1.1, Timer 0.8, TaskCon~ller # 0.5) | AxioCEFProbe 2.4, cef:renderer 2.2, WebExtensions 0.6, cef:gpu-process 0.3 | 12.5 | — |
| plain | switch-to-gecko | — | — | **16.3** (DOM Worker 4.5, main 4.4, Indexed~ IO # 3.3, IPDL Background 1.7, TaskCon~ller # 1.0) | Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15018.4 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.974 | 1.184 | 0.0037 | 0.0044 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.063 | 0.226 | 0.0038 | 0.0135 |
| plain | raf-nosampler | memfd | native | 184 | 184 | 0.047 | 0.230 | 0.0029 | 0.0139 |
| plain | scroll | memfd | native | 121 | 120 | 0.168 | 0.207 | 0.0097 | 0.0119 |
| plain | key | memfd | native | 21 | 21 | 0.015 | 0.243 | 0.0001 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## chromium-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **46.6** (main 21.0, Renderer 14.0, DOM Worker 4.7, glean.dispatche 2.3, WrGlyph~terizer 2.3) | AxioCEFProbe 37.2, cef:gpu-process 13.9, cef:utility 9.4, cef:renderer 7.0 | — | 408.6 |
| plain | idle | — | — | **2.4** (main 1.9, DOM Worker 0.5) | Web Content 1.0 | — | — |
| plain | raf | 60.0 | 20.4 | **19.3** (main 4.9, Backgro~Pool # 2.9, Renderer 2.6, DOM Worker 2.0, WRRende~ckend# 1.6) | cef:gpu-process 11.1, cef:renderer 7.5, AxioCEFProbe 6.9, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.4** (main 4.0, Backgro~Pool # 3.3, Renderer 2.7, DOM Worker 2.0, SwComposite 1.7) | cef:gpu-process 10.0, cef:renderer 8.7, AxioCEFProbe 5.7, WebExtensions 0.3 | — | — |
| plain | scroll | 59.8 | 20.5 | **34.7** (main 14.3, DOM Worker 5.4, Backgro~Pool # 4.5, Renderer 3.0, SwComposite 2.0) | cef:gpu-process 42.6, cef:renderer 11.4, AxioCEFProbe 8.4 | — | — |
| plain | key | — | — | **9.8** (main 4.4, Renderer 1.7, DOM Worker 1.1, SwComposite 0.8, Timer 0.6) | cef:renderer 2.0, AxioCEFProbe 1.7, cef:gpu-process 0.3 | 10.0 | — |
| plain | switch-to-gecko | — | — | **49.0** (main 28.0, TaskCon~ller # 14.0, Renderer 7.0) | Isolated Web Co 7.0 | — | 124.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.097 | 1.289 | 0.0050 | 0.0058 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 185 | 185 | 0.087 | 0.382 | 0.0052 | 0.0229 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.089 | 0.399 | 0.0053 | 0.0239 |
| plain | scroll | memfd | native | 119 | 119 | 0.320 | 0.386 | 0.0187 | 0.0225 |
| plain | key | memfd | native | 21 | 21 | 0.023 | 0.500 | 0.0001 | 0.0029 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## gecko-debian (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **5.0** (main 2.0, DOM Worker 1.5, glean.dispatche 0.5, Renderer 0.5, Compositor 0.5) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **22.1** (Renderer 12.5, WRRende~ckend# 2.0, main 1.6, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 5.0, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.3, WRRende~ckend# 2.0, glean.dispatche 1.3, WRScene~ilder# 1.3, main 1.0) | Isolated Web Co 4.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **38.1** (Renderer 24.1, main 4.0, WRRende~ckend# 3.5, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.5 | — | — |
| plain | key | — | — | **8.3** (main 4.6, TaskCon~ller # 0.8, Renderer 0.8, glean.dispatche 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.1 | 8.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## webkit (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **36.7** (Renderer 18.4, main 10.2, DOM Worker 4.1, glean.dispatche 2.0, WRRende~ckend# 2.0) | WPEWebProcess 65.3, AxioWebKitHost 16.3, WPENetworkProce 10.2 | — | 465.8 |
| plain | idle | — | — | **7.9** (main 5.4, DOM Worker 1.0, glean.dispatche 0.5, Timer 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.4 | 20.5 | **22.6** (main 9.2, DOM Worker 2.9, Renderer 2.3, WRRende~ckend# 1.3, Backgro~Pool # 1.3) | WPEWebProcess 57.5, AxioWebKitHost 5.9, WebExtensions 0.6, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.7** (main 5.3, DOM Worker 2.3, Renderer 2.0, Backgro~Pool # 2.0, SwComposite 1.7) | WPEWebProcess 58.4, AxioWebKitHost 7.0, Isolated Web Co 0.3 | — | — |
| plain | scroll | 57.8 | 31.1 | **33.8** (main 16.9, DOM Worker 5.9, Renderer 2.5, glean.dispatche 1.5, Backgro~Pool # 1.5) | WPEWebProcess 59.6, AxioWebKitHost 6.5, WebExtensions 0.5 | — | — |
| plain | key | — | — | **12.3** (main 7.4, Renderer 1.4, DOM Worker 0.8, Timer 0.5, WRRende~ckend# 0.5) | WPEWebProcess 6.0, AxioWebKitHost 1.6 | 18.1 | — |
| plain | switch-to-gecko | — | — | **22.1** (main 8.9, BgIOThr~Pool # 4.4, WRScene~ilder# 4.4, DOM Worker 4.4) | Isolated Web Co 4.4 | — | 209.7 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.717 | 0.461 | 0.0029 | 0.0018 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.076 | 0.180 | 0.0045 | 0.0106 |
| plain | raf-nosampler | memfd | native | 177 | 177 | 0.050 | 0.180 | 0.0029 | 0.0105 |
| plain | scroll | memfd | native | 113 | 113 | 0.118 | 0.136 | 0.0066 | 0.0076 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.191 | 0.0000 | 0.0010 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## webkit-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **37.8** (Renderer 13.9, main 9.9, WRRende~ckend# 4.0, DOM Worker 4.0, IPDL Background 2.0) | WPEWebProcess 71.6, AxioWebKitHost 17.9, WPENetworkProce 11.9 | — | 475.6 |
| plain | idle | — | — | **6.9** (main 5.9, Timer 0.5, TaskCon~ller # 0.5) | Web Content 0.5 | — | — |
| plain | raf | 58.3 | 25.5 | **33.3** (main 11.4, Renderer 5.2, Backgro~Pool # 4.9, SwComposite 3.6, DOM Worker 2.9) | WPEWebProcess 161.1, AxioWebKitHost 19.6, WebExtensions 0.7, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **27.1** (main 5.6, Renderer 5.3, Backgro~Pool # 4.6, SwComposite 3.3, DOM Worker 3.0) | WPEWebProcess 162.4, AxioWebKitHost 19.6, WebExtensions 0.6, Web Content 0.3 | — | — |
| plain | scroll | 55.0 | 31.6 | **49.0** (main 21.1, DOM Worker 7.2, Backgro~Pool # 5.7, Renderer 4.8, SwComposite 2.9) | WPEWebProcess 166.7, AxioWebKitHost 16.3 | — | — |
| plain | key | — | — | **16.7** (main 8.0, Renderer 2.7, SwComposite 1.4, DOM Worker 1.1, Timer 0.8) | WPEWebProcess 15.6, AxioWebKitHost 2.6 | 24.2 | — |
| plain | switch-to-gecko | — | — | **61.4** (main 26.3, TaskCon~ller # 13.1, Renderer 8.8, BgIOThr~Pool # 4.4, WRScene~ilder# 4.4) |  | — | 211.3 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.201 | 1.687 | 0.0047 | 0.0066 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.225 | 0.593 | 0.0131 | 0.0345 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.194 | 0.604 | 0.0112 | 0.0349 |
| plain | scroll | memfd | native | 110 | 110 | 0.529 | 0.605 | 0.0277 | 0.0317 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.616 | 0.0000 | 0.0034 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

