# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **46.6** (main 21.0, Renderer 14.0, DOM Worker 4.7, glean.dispatche 2.3, WrGlyph~terizer 2.3) | AxioCEFProbe 37.2, cef:gpu-process 13.9, cef:utility 9.4, cef:renderer 7.0 | — | 408.6 |
| plain | idle | — | — | **2.4** (main 1.9, DOM Worker 0.5) | Web Content 1.0 | — | — |
| plain | raf | 60.0 | 20.4 | **19.3** (main 4.9, Backgro~Pool # 2.9, Renderer 2.6, DOM Worker 2.0, WRRende~ckend# 1.6) | cef:gpu-process 11.1, cef:renderer 7.5, AxioCEFProbe 6.9, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **17.4** (main 4.0, Backgro~Pool # 3.3, Renderer 2.7, DOM Worker 2.0, SwComposite 1.7) | cef:gpu-process 10.0, cef:renderer 8.7, AxioCEFProbe 5.7, WebExtensions 0.3 | — | — |
| plain | scroll | 59.8 | 20.5 | **34.7** (main 14.3, DOM Worker 5.4, Backgro~Pool # 4.5, Renderer 3.0, SwComposite 2.0) | cef:gpu-process 42.6, cef:renderer 11.4, AxioCEFProbe 8.4 | — | — |
| plain | key | — | — | **9.8** (main 4.4, Renderer 1.7, DOM Worker 1.1, SwComposite 0.8, Timer 0.6) | cef:renderer 2.0, AxioCEFProbe 1.7, cef:gpu-process 0.3 | 10.0 | — |
| plain | switch-to-gecko | — | — | **49.0** (main 28.0, TaskCon~ller # 14.0, Renderer 7.0) | Isolated Web Co 7.0 | — | 124.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 1.097 | 1.289 | 0.0050 | 0.0058 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 185 | 185 | 0.087 | 0.382 | 0.0052 | 0.0229 |
| plain | raf-nosampler | memfd | native | 181 | 181 | 0.089 | 0.399 | 0.0053 | 0.0239 |
| plain | scroll | memfd | native | 119 | 119 | 0.320 | 0.386 | 0.0187 | 0.0225 |
| plain | key | memfd | native | 21 | 21 | 0.023 | 0.500 | 0.0001 | 0.0029 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

