# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **5.9** (main 1.9, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.4, RDD Process 0.5, Privileged Cont 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **24.5** (Renderer 15.0, WRRende~ckend# 2.0, main 1.3, glean.dispatche 1.3, TaskCon~ller # 1.3) | Isolated Web Co 3.6, WebExtensions 0.6 | — | — |
| plain | raf-nosampler | — | — | **17.6** (Renderer 9.0, WRScene~ilder# 1.7, WRRende~ckend# 1.7, glean.dispatche 1.3, main 1.0) | Isolated Web Co 4.0, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **40.2** (Renderer 27.2, main 4.0, WRRende~ckend# 3.5, SwComposite 1.5, glean.dispatche 1.0) | Isolated Web Co 4.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.0** (main 4.0, Renderer 0.8, TaskCon~ller # 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.9, WebExtensions 0.5, Privileged Cont 0.3 | 11.0 | — |

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
| plain | idle | 59.0 | 17.1 | **4.0** (Renderer 1.5, main 1.0, DOM Worker 1.0, glean.dispatche 0.5) | Web Content 2.4, forkserver 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **21.1** (Renderer 12.2, WRRende~ckend# 2.0, SwComposite 1.6, main 1.3, glean.dispatche 1.0) | Isolated Web Co 3.0, WebExtensions 0.7 | — | — |
| plain | raf-nosampler | — | — | **13.7** (Renderer 7.0, glean.dispatche 1.0, WRScene~ilder# 1.0, WRRende~ckend# 1.0, Compositor 1.0) | Isolated Web Co 3.3, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.2 | **56.9** (Renderer 39.9, main 4.0, SwComposite 4.0, WRRende~ckend# 3.5, glean.dispatche 1.0) | Isolated Web Co 3.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **6.3** (main 3.2, Renderer 1.1, TaskCon~ller # 0.5, glean.dispatche 0.3, WRScene~ilder# 0.3) | Isolated Web Co 1.1 | 9.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## chromium (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **16.2** (main 8.1, DOM Worker 4.9, Renderer 1.6, WRRende~ckend# 0.8, Compositor 0.8) | AxioCEFProbe 12.2, cef:gpu-process 4.1, cef:renderer 2.4, Web Content 2.4 | — | 1198.4 |
| plain | idle | — | — | **4.4** (main 2.9, TaskCon~ller # 1.5) |  | — | — |
| plain | raf | 60.0 | 20.6 | **21.1** (main 5.3, Renderer 4.6, SwComposite 3.6, DOM Worker 2.3, Backgro~Pool # 1.6) | cef:renderer 5.3, cef:gpu-process 4.3, AxioCEFProbe 4.2, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.9** (Renderer 4.7, main 4.3, SwComposite 3.3, DOM Worker 2.0, Backgro~Pool # 1.3) | cef:renderer 5.9, AxioCEFProbe 4.1, cef:gpu-process 3.4, WebExtensions 0.3 | — | — |
| plain | scroll | 59.9 | 21.3 | **36.0** (main 13.0, DOM Worker 6.5, Renderer 5.0, Backgro~Pool # 3.0, SwComposite 3.0) | cef:gpu-process 14.5, AxioCEFProbe 6.0, cef:renderer 6.0, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **9.3** (main 4.7, DOM Worker 1.1, Renderer 0.8, Timer 0.6, SwComposite 0.6) | cef:renderer 1.4, AxioCEFProbe 1.1, cef:gpu-process 0.9, Web Content 0.6 | 8.5 | — |
| plain | switch-to-gecko | — | — | **42.0** (main 21.0, TaskCon~ller # 7.0, Renderer 7.0, DOM Worker 7.0) |  | — | 125.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.779 | 1.087 | 0.0013 | 0.0018 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.049 | 0.186 | 0.0030 | 0.0111 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.038 | 0.185 | 0.0023 | 0.0111 |
| plain | scroll | memfd | native | 118 | 118 | 0.173 | 0.192 | 0.0102 | 0.0113 |
| plain | key | memfd | native | 21 | 21 | 0.022 | 0.301 | 0.0001 | 0.0017 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **63.9** (main 23.0, Renderer 21.3, DOM Worker 14.2, Backgro~Pool # 1.8, WRRende~ckend# 1.8) | AxioCEFProbe 56.8, cef:gpu-process 23.1, cef:renderer 10.6, cef:utility 10.6 | — | 516.3 |
| plain | idle | — | — | **6.3** (main 4.3, TaskCon~ller # 1.0, Timer 0.5, IndexedDB IO # 0.5) | AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.1 | 21.0 | **59.9** (Renderer 17.7, SwComposite 16.1, main 9.3, Backgro~Pool # 6.1, DOM Worker 3.9) | cef:gpu-process 16.0, cef:renderer 12.5, AxioCEFProbe 10.4, Web Content 0.6 | — | — |
| plain | raf-nosampler | — | — | **58.1** (Renderer 18.5, SwComposite 16.9, main 6.9, Backgro~Pool # 6.3, DOM Worker 3.6) | cef:gpu-process 15.5, cef:renderer 11.9, AxioCEFProbe 9.6, Web Content 0.3 | — | — |
| plain | scroll | 59.9 | 24.8 | **82.9** (main 21.9, Renderer 17.6, SwComposite 15.2, DOM Worker 10.0, Backgro~Pool # 8.1) | cef:gpu-process 61.9, cef:renderer 15.7, AxioCEFProbe 14.8 | — | — |
| plain | key | — | — | **16.7** (main 7.9, Renderer 2.2, SwComposite 1.9, DOM Worker 1.4, Timer 0.8) | AxioCEFProbe 2.5, cef:renderer 2.5, cef:gpu-process 1.1, WebExtensions 0.3 | 12.4 | — |
| plain | switch-to-gecko | — | — | **42.4** (main 24.2, Renderer 12.1, Backgro~Pool # 6.1) | Isolated Web Co 6.1 | — | 133.0 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 2 | 2.932 | 6.014 | 0.0148 | 0.0203 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 189 | 0.223 | 0.772 | 0.0134 | 0.0465 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.221 | 0.788 | 0.0132 | 0.0472 |
| plain | scroll | memfd | native | 123 | 123 | 0.692 | 0.718 | 0.0400 | 0.0415 |
| plain | key | memfd | native | 21 | 21 | 0.058 | 0.785 | 0.0003 | 0.0045 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## gecko-debian (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.4 | **8.5** (Renderer 3.5, main 2.5, TaskCon~ller # 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Web Content 3.9, Isolated Web Co 1.5, RDD Process 0.5 | — | — |
| plain | raf | 59.0 | 17.3 | **27.9** (Renderer 15.5, WRRende~ckend# 2.6, main 2.0, glean.dispatche 1.3, TaskCon~ller # 1.3) | Isolated Web Co 5.7, WebExtensions 0.7, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.2** (Renderer 10.0, WRRende~ckend# 2.3, WRScene~ilder# 2.0, glean.dispatche 1.3, Compositor 1.3) | Isolated Web Co 4.6 | — | — |
| plain | scroll | 59.0 | 17.2 | **41.7** (Renderer 27.2, main 4.5, WRRende~ckend# 3.5, SwComposite 3.0, Compositor 1.5) | Isolated Web Co 4.5 | — | — |
| plain | key | — | — | **9.5** (main 5.1, Renderer 1.1, TaskCon~ller # 0.8, Softwar~cThread 0.5, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

## webkit (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **60.8** (Renderer 20.9, main 17.1, DOM Worker 13.3, glean.dispatche 1.9, Socket Thread 1.9) | WPEWebProcess 64.6, AxioWebKitHost 19.0, WPENetworkProce 11.4 | — | 507.9 |
| plain | idle | — | — | **5.4** (main 4.4, Timer 0.5, TaskCon~ller # 0.5) |  | — | — |
| plain | raf | 58.1 | 20.6 | **38.2** (main 9.9, Renderer 8.5, SwComposite 6.9, DOM Worker 3.6, Backgro~Pool # 3.3) | WPEWebProcess 64.4, AxioWebKitHost 8.9, Privileged Cont 0.7, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **32.9** (Renderer 8.0, SwComposite 6.3, main 6.0, DOM Worker 3.7, Backgro~Pool # 2.7) | WPEWebProcess 64.3, AxioWebKitHost 9.0, Isolated Web Co 0.7, WebExtensions 0.3 | — | — |
| plain | scroll | 57.2 | 34.2 | **53.3** (main 19.9, Renderer 8.9, DOM Worker 7.0, SwComposite 6.0, Backgro~Pool # 4.5) | WPEWebProcess 67.6, AxioWebKitHost 11.4, Web Content 0.5 | — | — |
| plain | key | — | — | **14.2** (main 7.4, DOM Worker 1.7, Timer 1.1, Renderer 1.1, SwComposite 1.1) | WPEWebProcess 7.2, AxioWebKitHost 1.4, WebExtensions 0.6 | 16.9 | — |
| plain | switch-to-gecko | — | — | **21.9** (main 8.7, BgIOThr~Pool # 4.4, Softwar~cThread 4.4, Renderer 4.4) | WebExtensions 4.4, Isolated Web Co 4.4 | — | 212.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.977 | 1.349 | 0.0036 | 0.0050 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 178 | 178 | 0.114 | 0.397 | 0.0066 | 0.0231 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.068 | 0.399 | 0.0039 | 0.0231 |
| plain | scroll | memfd | native | 112 | 112 | 0.296 | 0.386 | 0.0164 | 0.0213 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.428 | 0.0000 | 0.0023 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

## webkit-2x (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **48.6** (main 16.2, Renderer 12.6, DOM Worker 10.8, glean.dispatche 1.8, TaskCon~ller # 1.8) | WPEWebProcess 71.9, AxioWebKitHost 18.0, WPENetworkProce 12.6, Isolated Web Co 1.8 | — | 538.0 |
| plain | idle | — | — | **4.9** (main 3.9, glean.dispatche 0.5, TaskCon~ller # 0.5) | AxioWebKitHost 0.5, Web Content 0.5 | — | — |
| plain | raf | 56.8 | 27.4 | **72.2** (Renderer 21.8, SwComposite 16.9, main 11.4, Backgro~Pool # 9.4, DOM Worker 6.5) | WPEWebProcess 188.9, AxioWebKitHost 26.4, Privileged Cont 0.7, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **66.4** (Renderer 21.6, SwComposite 17.3, Backgro~Pool # 9.0, main 7.0, DOM Worker 5.6) | WPEWebProcess 190.9, AxioWebKitHost 26.0, WebExtensions 0.3, Web Content 0.3 | — | — |
| plain | scroll | 50.6 | 35.8 | **89.7** (Renderer 21.7, main 20.7, SwComposite 15.4, Backgro~Pool # 12.0, DOM Worker 11.6) | WPEWebProcess 184.1, AxioWebKitHost 26.6 | — | — |
| plain | key | — | — | **19.4** (main 7.9, Renderer 3.8, SwComposite 3.3, DOM Worker 1.4, glean.dispatche 0.5) | WPEWebProcess 17.8, AxioWebKitHost 3.5, WebExtensions 0.3 | 26.7 | — |
| plain | switch-to-gecko | — | — | **26.2** (main 8.7, Renderer 8.7, TaskCon~ller # 4.4, SwComposite 4.4) | Isolated Web Co 4.4 | — | 211.6 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 3 | 2.753 | 3.194 | 0.0145 | 0.0169 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 175 | 175 | 0.452 | 1.577 | 0.0255 | 0.0890 |
| plain | raf-nosampler | memfd | native | 174 | 174 | 0.340 | 1.434 | 0.0196 | 0.0824 |
| plain | scroll | memfd | native | 102 | 102 | 1.283 | 1.743 | 0.0627 | 0.0852 |
| plain | key | memfd | native | 20 | 20 | 0.003 | 1.260 | 0.0000 | 0.0069 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

