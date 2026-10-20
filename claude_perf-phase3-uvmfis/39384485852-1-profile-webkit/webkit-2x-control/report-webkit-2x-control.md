# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

