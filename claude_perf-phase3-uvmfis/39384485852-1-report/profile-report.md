# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.1 | **5.8** (main 2.4, Renderer 1.9, glean.dispatche 0.5, IPDL Background 0.5, DOM Worker 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **27.4** (Renderer 16.3, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.2, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.8** (Renderer 9.9, glean.dispatche 2.0, WRRende~ckend# 2.0, main 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.7, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **43.2** (Renderer 28.4, main 3.9, WRRende~ckend# 3.4, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **8.1** (main 4.5, Renderer 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## gecko-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.1 | **4.4** (main 1.9, DOM Worker 1.0, IPDL Background 0.5, TaskCon~ller # 0.5, Renderer 0.5) | Web Content 1.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **22.9** (Renderer 13.1, SwComposite 2.0, WRRende~ckend# 1.6, main 1.3, TaskCon~ller # 1.3) | Isolated Web Co 3.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.6** (Renderer 7.0, WRRende~ckend# 2.3, main 1.0, glean.dispatche 1.0, WRScene~ilder# 1.0) | Isolated Web Co 5.4 | — | — |
| plain | scroll | 59.0 | 17.1 | **53.7** (Renderer 39.7, main 4.0, SwComposite 3.5, WRRende~ckend# 3.0, Compositor 1.5) | Isolated Web Co 3.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **6.9** (main 3.5, Renderer 1.1, TaskCon~ller # 0.5, glean.dispatche 0.3, IPC I/O Parent 0.3) | Isolated Web Co 1.4, WebExtensions 0.3 | 11.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## chromium (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **23.4** (main 15.3, Renderer 4.1, DOM Worker 2.0, WRRende~ckend# 1.0, Compositor 1.0) | AxioCEFProbe 22.4, cef:gpu-process 8.2, cef:renderer 5.1, cef:utility 4.1 | — | 910.0 |
| plain | idle | — | — | **5.4** (main 3.4, TaskCon~ller # 1.5, Timer 0.5) | AxioCEFProbe 1.0, WebExtensions 0.5 | — | — |
| plain | raf | 59.0 | 22.2 | **52.3** (main 22.5, Renderer 9.8, SwComposite 8.5, DOM Worker 3.3, WRRende~ckend# 2.3) | cef:renderer 10.8, AxioCEFProbe 7.2, cef:gpu-process 4.9, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **51.2** (main 22.6, Renderer 10.3, SwComposite 8.3, DOM Worker 3.0, WRRende~ckend# 2.7) | cef:renderer 11.0, AxioCEFProbe 6.6, cef:gpu-process 6.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 58.0 | 33.1 | **93.0** (main 60.1, Renderer 9.8, SwComposite 7.8, DOM Worker 5.4, Backgro~Pool # 3.4) | cef:gpu-process 20.5, cef:renderer 12.7, AxioCEFProbe 10.2 | — | — |
| plain | key | — | — | **19.1** (main 9.6, TaskCon~ller # 1.7, Renderer 1.7, SwComposite 1.4, DOM Worker 1.4) | cef:renderer 2.5, AxioCEFProbe 2.3, cef:gpu-process 0.3 | 18.9 | — |
| plain | switch-to-gecko | — | — | **40.2** (main 20.1, Renderer 13.4, BgIOThr~Pool # 6.7) |  | — | 125.0 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | imagedata | — | — | — | — | — | — |
| plain | idle | memfd | imagedata | — | — | — | — | — | — |
| plain | raf | memfd | imagedata | — | — | — | — | — | — |
| plain | raf-nosampler | memfd | imagedata | — | — | — | — | — | — |
| plain | scroll | memfd | imagedata | — | — | — | — | — | — |
| plain | key | memfd | imagedata | — | — | — | — | — | — |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## chromium-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **47.8** (main 22.8, Renderer 16.6, DOM Worker 4.2, WRRende~ckend# 2.1, Compositor 2.1) | AxioCEFProbe 43.7, cef:gpu-process 16.7, cef:utility 10.4, cef:zygote 6.2 | — | 409.7 |
| plain | idle | — | — | **3.8** (main 1.4, DOM Worker 1.4, Timer 0.5, Socket Thread 0.5) | AxioCEFProbe 1.0, Web Content 0.5 | — | — |
| plain | raf | 59.0 | 19.1 | **69.5** (main 32.7, Renderer 14.6, SwComposite 12.9, WRRende~ckend# 2.3, DOM Worker 2.3) | cef:renderer 11.4, cef:gpu-process 10.7, AxioCEFProbe 6.4, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **71.5** (main 35.2, Renderer 14.3, SwComposite 12.3, DOM Worker 3.0, WRRende~ckend# 2.7) | cef:gpu-process 13.3, cef:renderer 11.0, AxioCEFProbe 7.6 | — | — |
| plain | scroll | 36.9 | 39.0 | **96.6** (main 66.3, Renderer 9.6, SwComposite 7.2, DOM Worker 5.3, Backgro~Pool # 2.4) | cef:gpu-process 45.1, cef:renderer 12.5, AxioCEFProbe 9.2 | — | — |
| plain | key | — | — | **13.3** (main 6.1, Renderer 2.2, SwComposite 1.9, Timer 0.8, DOM Worker 0.8) | cef:renderer 2.5, AxioCEFProbe 1.4, cef:gpu-process 0.9 | 17.4 | — |
| plain | switch-to-gecko | — | — | **9.3** (main 3.0, DOM Worker 2.8, TaskCon~ller # 0.9, IPDL Background 0.8, IndexedDB IO # 0.7) | Web Content 0.1 | — | 15171.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | imagedata | — | — | — | — | — | — |
| plain | idle | memfd | imagedata | — | — | — | — | — | — |
| plain | raf | memfd | imagedata | — | — | — | — | — | — |
| plain | raf-nosampler | memfd | imagedata | — | — | — | — | — | — |
| plain | scroll | memfd | imagedata | — | — | — | — | — | — |
| plain | key | memfd | imagedata | — | — | — | — | — | — |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.4 | **11.3** (Renderer 3.4, main 2.9, DOM Worker 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 4.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **27.1** (Renderer 16.4, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.6, TaskCon~ller # 1.3) | Isolated Web Co 4.9, WebExtensions 0.7, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.5** (Renderer 9.6, WRRende~ckend# 2.3, glean.dispatche 1.7, WRScene~ilder# 1.7, main 1.3) | Isolated Web Co 4.0, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **44.2** (Renderer 28.7, main 5.0, WRRende~ckend# 4.0, glean.dispatche 1.5, Compositor 1.5) | Isolated Web Co 4.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **9.1** (main 4.5, Renderer 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 10.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **61.1** (DOM Worker 20.3, main 16.3, Renderer 8.1, TaskCon~ller # 4.1, WRScene~ilder# 4.1) | WPEWebProcess 73.2, AxioWebKitHost 8.1, WPENetworkProce 8.1 | — | 213.4 |
| plain | idle | — | — | **8.8** (main 6.3, IPC I/O Parent 0.5, Timer 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 3.4 | — | — |
| plain | raf | 58.0 | 20.9 | **26.2** (main 11.3, DOM Worker 2.9, Renderer 2.3, Backgro~Pool # 2.3, WRRende~ckend# 1.6) | WPEWebProcess 65.8, AxioWebKitHost 7.3, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.2** (main 4.6, DOM Worker 3.3, Renderer 2.7, Backgro~Pool # 2.0, SwComposite 1.3) | WPEWebProcess 63.3, AxioWebKitHost 7.3 | — | — |
| plain | scroll | 57.6 | 33.1 | **39.1** (main 19.0, DOM Worker 6.8, TaskCon~ller # 2.9, Backgro~Pool # 2.4, Renderer 1.5) | WPEWebProcess 63.4, AxioWebKitHost 9.3, Web Content 0.5 | — | — |
| plain | key | — | — | **16.2** (main 9.9, Renderer 1.4, DOM Worker 1.1, Timer 0.8, TaskCon~ller # 0.5) | WPEWebProcess 6.9, AxioWebKitHost 1.4 | 16.0 | — |
| plain | switch-to-gecko | — | — | **41.0** (main 12.3, Renderer 8.2, glean.dispatche 4.1, IPC I/O Parent 4.1, BgIOThr~Pool # 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 212.8 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.884 | 1.647 | 0.0066 | 0.0123 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.040 | 0.257 | 0.0023 | 0.0149 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.059 | 0.259 | 0.0034 | 0.0150 |
| plain | scroll | memfd | native | 113 | 113 | 0.186 | 0.223 | 0.0102 | 0.0122 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.267 | 0.0000 | 0.0015 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## webkit-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **79.7** (Renderer 24.2, DOM Worker 24.2, main 17.3, Backgro~Pool # 3.5, TaskCon~ller # 3.5) | WPEWebProcess 76.0, WPENetworkProce 10.4, AxioWebKitHost 6.9 | — | 247.6 |
| plain | idle | — | — | **7.8** (main 5.8, TaskCon~ller # 1.0, Timer 0.5, DOM Worker 0.5) | Web Content 3.4, AxioWebKitHost 0.5 | — | — |
| plain | raf | 57.0 | 33.0 | **48.7** (main 15.7, Backgro~Pool # 5.8, Renderer 5.1, BgIOThr~Pool # 3.5, DOM Worker 3.5) | WPEWebProcess 182.6, AxioWebKitHost 19.5 | — | — |
| plain | raf-nosampler | — | — | **25.9** (Backgro~Pool # 6.0, Renderer 5.0, main 4.6, DOM Worker 3.6, SwComposite 2.7) | WPEWebProcess 183.3, AxioWebKitHost 18.9, Privileged Cont 0.3 | — | — |
| plain | scroll | 57.4 | 29.0 | **51.3** (main 20.1, Backgro~Pool # 8.6, DOM Worker 7.7, Renderer 5.7, SwComposite 2.9) | WPEWebProcess 182.5, AxioWebKitHost 20.6 | — | — |
| plain | key | — | — | **82.6** (main 25.0, DOM Worker 18.8, IndexedDB IO # 13.9, IPDL Background 6.5, TaskCon~ller # 2.7) | WPEWebProcess 17.7, AxioWebKitHost 1.9, WebExtensions 0.6, Privileged Cont 0.3 | 26.7 | — |
| plain | switch-to-gecko | — | — | **37.1** (main 12.4, Renderer 12.4, BgIOThr~Pool # 4.1, Compositor 4.1, DOM Worker 4.1) | Isolated Web Co 4.1 | — | 216.0 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.745 | 6.008 | 0.0174 | 0.0382 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.176 | 0.900 | 0.0101 | 0.0515 |
| plain | raf-nosampler | memfd | native | 176 | 176 | 0.181 | 0.837 | 0.0105 | 0.0483 |
| plain | scroll | memfd | native | 114 | 114 | 0.707 | 0.824 | 0.0383 | 0.0447 |
| plain | key | memfd | native | 20 | 20 | 0.002 | 0.873 | 0.0000 | 0.0047 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## chromium-2x-control (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **55.7** (main 20.3, Renderer 17.8, DOM Worker 7.6, glean.dispatche 2.5, Backgro~Pool # 2.5) | AxioCEFProbe 48.2, cef:gpu-process 20.4, cef:utility 10.2, cef:renderer 7.6 | — | 368.5 |
| plain | idle | — | — | **3.9** (main 1.9, DOM Worker 1.0, IndexedDB IO # 1.0) | Web Content 1.9, AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.1 | 20.9 | **44.9** (Renderer 13.3, SwComposite 12.0, main 7.1, Backgro~Pool # 3.9, DOM Worker 3.2) | cef:renderer 10.7, cef:gpu-process 9.7, AxioCEFProbe 6.4 | — | — |
| plain | raf-nosampler | — | — | **43.6** (Renderer 13.3, SwComposite 12.0, main 6.0, Backgro~Pool # 3.7, DOM Worker 3.3) | cef:gpu-process 12.0, cef:renderer 10.3, AxioCEFProbe 7.0 | — | — |
| plain | scroll | 59.9 | 24.6 | **66.1** (main 19.1, Renderer 13.7, SwComposite 11.2, DOM Worker 8.8, Backgro~Pool # 4.4) | cef:gpu-process 44.5, cef:renderer 11.7, AxioCEFProbe 9.8 | — | — |
| plain | key | — | — | **11.2** (main 5.5, Renderer 1.4, SwComposite 1.4, DOM Worker 0.8, Timer 0.6) | AxioCEFProbe 2.0, cef:renderer 2.0, cef:gpu-process 0.3, WebExtensions 0.3 | 10.5 | — |
| plain | switch-to-gecko | — | — | **10.5** (DOM Worker 3.0, main 3.0, Indexed~ IO # 1.7, TaskCon~ller # 0.9, IPDL Background 0.8) | Web Content 0.1, Privileged Cont 0.1 | — | 15179.4 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.539 | 4.306 | 0.0125 | 0.0212 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 186 | 186 | 0.103 | 0.481 | 0.0062 | 0.0289 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.116 | 0.479 | 0.0070 | 0.0288 |
| plain | scroll | memfd | native | 121 | 121 | 0.337 | 0.412 | 0.0198 | 0.0242 |
| plain | key | memfd | native | 21 | 21 | 0.033 | 0.481 | 0.0002 | 0.0028 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## chromium-control (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **85.3** (main 30.5, Renderer 24.4, DOM Worker 14.2, glean.dispatche 4.1, WRRende~ckend# 4.1) | AxioCEFProbe 50.9, cef:gpu-process 16.3, cef:renderer 12.2, cef:utility 10.2 | — | 443.8 |
| plain | idle | — | — | **3.9** (main 3.4, TaskCon~ller # 0.5) | AxioCEFProbe 0.5 | — | — |
| plain | raf | 60.0 | 22.7 | **41.2** (main 9.8, Renderer 9.5, SwComposite 7.8, Backgro~Pool # 3.6, DOM Worker 3.6) | cef:renderer 10.5, AxioCEFProbe 6.2, cef:gpu-process 4.9, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **36.1** (Renderer 9.6, SwComposite 8.0, main 5.3, Backgro~Pool # 4.0, DOM Worker 4.0) | cef:renderer 11.0, AxioCEFProbe 7.7, cef:gpu-process 6.3, Web Content 0.3 | — | — |
| plain | scroll | 59.8 | 22.7 | **58.4** (main 20.3, Renderer 9.9, SwComposite 7.9, DOM Worker 7.9, Backgro~Pool # 4.9) | cef:gpu-process 19.8, cef:renderer 11.0, AxioCEFProbe 10.4 | — | — |
| plain | key | — | — | **14.8** (main 8.0, DOM Worker 1.4, TaskCon~ller # 1.1, Renderer 1.1, SwComposite 1.1) | AxioCEFProbe 2.3, cef:renderer 2.0, cef:gpu-process 1.5, WebExtensions 0.3 | 12.7 | — |
| plain | switch-to-gecko | — | — | **12.8** (DOM Worker 4.5, main 4.3, IPDL Background 1.5, TaskCon~ller # 1.1, StreamTrans # 0.4) | Web Content 0.1 | — | 15615.6 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 3 | 0.968 | 3.848 | 0.0057 | 0.0228 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 184 | 184 | 0.095 | 0.454 | 0.0057 | 0.0271 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.139 | 0.462 | 0.0084 | 0.0277 |
| plain | scroll | memfd | native | 119 | 119 | 0.394 | 0.424 | 0.0230 | 0.0248 |
| plain | key | memfd | native | 21 | 21 | 0.030 | 0.421 | 0.0002 | 0.0024 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## webkit-2x-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **42.9** (main 13.3, Renderer 11.8, DOM Worker 10.3, Backgro~Pool # 1.5, Socket Thread 1.5) | WPEWebProcess 56.0, AxioWebKitHost 19.2, WPENetworkProce 10.3, bwrap 1.5 | — | 648.4 |
| plain | idle | — | — | **9.3** (main 6.8, DOM Worker 1.0, Timer 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 56.9 | 32.5 | **72.8** (Renderer 18.8, main 16.9, SwComposite 14.1, Backgro~Pool # 6.1, DOM Worker 4.5) | WPEWebProcess 183.3, AxioWebKitHost 21.1, WebExtensions 0.3, RDD Process 0.3 | — | — |
| plain | raf-nosampler | — | — | **54.1** (Renderer 19.5, SwComposite 14.9, Backgro~Pool # 6.0, main 5.0, DOM Worker 4.0) | WPEWebProcess 182.7, AxioWebKitHost 20.8 | — | — |
| plain | scroll | 55.2 | 36.5 | **72.6** (main 20.3, Renderer 16.5, SwComposite 12.7, DOM Worker 9.0, Backgro~Pool # 8.0) | WPEWebProcess 182.1, AxioWebKitHost 20.2, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **67.9** (main 25.8, DOM Worker 19.6, IPDL Background 6.5, TaskCon~ller # 3.3, Renderer 2.7) | WPEWebProcess 18.3, AxioWebKitHost 3.0, WebExtensions 0.3, Privileged Cont 0.3 | 28.0 | — |
| plain | switch-to-gecko | — | — | **40.8** (main 12.2, Renderer 12.2, BgIOThr~Pool # 4.1, Compositor 4.1, SwComposite 4.1) | Privileged Cont 4.1, Isolated Web Co 4.1, Web Content 4.1 | — | 214.4 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 2.819 | 5.476 | 0.0081 | 0.0157 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 181 | 0.183 | 0.926 | 0.0104 | 0.0530 |
| plain | raf-nosampler | memfd | native | 177 | 177 | 0.183 | 0.811 | 0.0106 | 0.0471 |
| plain | scroll | memfd | native | 111 | 111 | 0.736 | 0.921 | 0.0383 | 0.0479 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.787 | 0.0000 | 0.0043 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## webkit-control (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **40.9** (main 15.2, DOM Worker 12.1, Renderer 4.6, TaskCon~ller # 3.0, glean.dispatche 1.5) | WPEWebProcess 54.6, AxioWebKitHost 15.2, WPENetworkProce 10.6, bwrap 1.5 | — | 630.0 |
| plain | idle | — | — | **8.2** (main 6.7, Timer 0.5, TaskCon~ller # 0.5, DOM Worker 0.5) | AxioWebKitHost 0.5 | — | — |
| plain | raf | 57.8 | 20.8 | **35.6** (main 12.0, Renderer 6.8, SwComposite 4.9, DOM Worker 3.2, WRRende~ckend# 2.3) | WPEWebProcess 65.1, AxioWebKitHost 7.4, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **29.9** (Renderer 7.0, main 6.0, SwComposite 5.0, DOM Worker 3.3, Backgro~Pool # 2.3) | WPEWebProcess 66.3, AxioWebKitHost 7.6, Privileged Cont 0.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 58.5 | 20.9 | **47.2** (main 20.4, Renderer 7.3, DOM Worker 6.3, SwComposite 4.4, Backgro~Pool # 2.9) | WPEWebProcess 64.7, AxioWebKitHost 10.2 | — | — |
| plain | key | — | — | **16.7** (main 10.7, TaskCon~ller # 1.4, DOM Worker 1.1, Renderer 0.8, glean.dispatche 0.5) | WPEWebProcess 6.3, AxioWebKitHost 1.4, Web Content 0.5 | 15.5 | — |
| plain | switch-to-gecko | — | — | **28.0** (main 12.0, Renderer 8.0, BgIOThr~Pool # 4.0, WRScene~ilder# 4.0) | Isolated Web Co 8.0 | — | 212.8 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.915 | 1.625 | 0.0027 | 0.0048 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.043 | 0.268 | 0.0025 | 0.0155 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.068 | 0.269 | 0.0039 | 0.0155 |
| plain | scroll | memfd | native | 115 | 115 | 0.217 | 0.235 | 0.0121 | 0.0130 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.270 | 0.0000 | 0.0015 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

