# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

