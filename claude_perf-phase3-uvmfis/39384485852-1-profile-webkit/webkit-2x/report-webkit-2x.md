# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

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

