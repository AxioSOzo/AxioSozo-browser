# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

