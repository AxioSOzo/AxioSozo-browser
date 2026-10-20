# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

