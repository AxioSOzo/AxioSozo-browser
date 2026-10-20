# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

