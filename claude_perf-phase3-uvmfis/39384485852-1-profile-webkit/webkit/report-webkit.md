# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## webkit (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **61.1** (DOM Worker 20.3, main 16.3, Renderer 8.1, TaskCon~ller # 4.1, WRScene~ilder# 4.1) | WPEWebProcess 73.2, AxioWebKitHost 8.1, WPENetworkProce 8.1 | — | 213.4 |
| plain | idle | — | — | **8.8** (main 6.3, IPC I/O Parent 0.5, Timer 0.5, TaskCon~ller # 0.5, IndexedDB IO # 0.5) | Web Content 3.4 | — | — |
| plain | raf | 58.0 | 20.9 | **26.2** (main 11.3, DOM Worker 2.9, Renderer 2.3, Backgro~Pool # 2.3, WRRende~ckend# 1.6) | WPEWebProcess 65.8, AxioWebKitHost 7.3, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.2** (main 4.6, DOM Worker 3.3, Renderer 2.7, Backgro~Pool # 2.0, SwComposite 1.3) | WPEWebProcess 63.3, AxioWebKitHost 7.3 | — | — |
| plain | scroll | 57.6 | 33.1 | **39.1** (main 19.0, DOM Worker 6.8, TaskCon~ller # 2.9, Backgro~Pool # 2.4, Renderer 1.5) | WPEWebProcess 63.4, AxioWebKitHost 9.3, Web Content 0.5 | — | — |
| plain | key | — | — | **16.2** (main 9.9, Renderer 1.4, DOM Worker 1.1, Timer 0.8, TaskCon~ller # 0.5) | WPEWebProcess 6.9, AxioWebKitHost 1.4 | 16.0 | — |
| plain | switch-to-gecko | — | — | **41.0** (main 12.3, Renderer 8.2, glean.dispatche 4.1, IPC I/O Parent 4.1, BgIOThr~Pool # 4.1) | WebExtensions 4.1, Isolated Web Co 4.1 | — | 212.8 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.884 | 1.647 | 0.0066 | 0.0123 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 180 | 180 | 0.040 | 0.257 | 0.0023 | 0.0149 |
| plain | raf-nosampler | memfd | native | 175 | 175 | 0.059 | 0.259 | 0.0034 | 0.0150 |
| plain | scroll | memfd | native | 113 | 113 | 0.186 | 0.223 | 0.0102 | 0.0122 |
| plain | key | memfd | native | 20 | 20 | 0.001 | 0.267 | 0.0000 | 0.0015 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

