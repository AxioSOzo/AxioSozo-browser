# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

