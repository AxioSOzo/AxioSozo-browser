# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

