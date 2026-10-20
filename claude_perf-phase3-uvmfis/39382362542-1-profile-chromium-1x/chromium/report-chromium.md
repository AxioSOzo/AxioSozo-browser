# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: Intel(R) Xeon(R) 6973P-C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **16.2** (main 8.1, DOM Worker 4.9, Renderer 1.6, WRRende~ckend# 0.8, Compositor 0.8) | AxioCEFProbe 12.2, cef:gpu-process 4.1, cef:renderer 2.4, Web Content 2.4 | — | 1198.4 |
| plain | idle | — | — | **4.4** (main 2.9, TaskCon~ller # 1.5) |  | — | — |
| plain | raf | 60.0 | 20.6 | **21.1** (main 5.3, Renderer 4.6, SwComposite 3.6, DOM Worker 2.3, Backgro~Pool # 1.6) | cef:renderer 5.3, cef:gpu-process 4.3, AxioCEFProbe 4.2, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **19.9** (Renderer 4.7, main 4.3, SwComposite 3.3, DOM Worker 2.0, Backgro~Pool # 1.3) | cef:renderer 5.9, AxioCEFProbe 4.1, cef:gpu-process 3.4, WebExtensions 0.3 | — | — |
| plain | scroll | 59.9 | 21.3 | **36.0** (main 13.0, DOM Worker 6.5, Renderer 5.0, Backgro~Pool # 3.0, SwComposite 3.0) | cef:gpu-process 14.5, AxioCEFProbe 6.0, cef:renderer 6.0, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **9.3** (main 4.7, DOM Worker 1.1, Renderer 0.8, Timer 0.6, SwComposite 0.6) | cef:renderer 1.4, AxioCEFProbe 1.1, cef:gpu-process 0.9, Web Content 0.6 | 8.5 | — |
| plain | switch-to-gecko | — | — | **42.0** (main 21.0, TaskCon~ller # 7.0, Renderer 7.0, DOM Worker 7.0) |  | — | 125.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.779 | 1.087 | 0.0013 | 0.0018 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 183 | 183 | 0.049 | 0.186 | 0.0030 | 0.0111 |
| plain | raf-nosampler | memfd | native | 182 | 182 | 0.038 | 0.185 | 0.0023 | 0.0111 |
| plain | scroll | memfd | native | 118 | 118 | 0.173 | 0.192 | 0.0102 | 0.0113 |
| plain | key | memfd | native | 21 | 21 | 0.022 | 0.301 | 0.0001 | 0.0017 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

