# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

