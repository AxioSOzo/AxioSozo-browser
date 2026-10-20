# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **63.9** (main 23.0, Renderer 21.3, DOM Worker 14.2, Backgro~Pool # 1.8, WRRende~ckend# 1.8) | AxioCEFProbe 56.8, cef:gpu-process 23.1, cef:renderer 10.6, cef:utility 10.6 | — | 516.3 |
| plain | idle | — | — | **6.3** (main 4.3, TaskCon~ller # 1.0, Timer 0.5, IndexedDB IO # 0.5) | AxioCEFProbe 1.0 | — | — |
| plain | raf | 60.1 | 21.0 | **59.9** (Renderer 17.7, SwComposite 16.1, main 9.3, Backgro~Pool # 6.1, DOM Worker 3.9) | cef:gpu-process 16.0, cef:renderer 12.5, AxioCEFProbe 10.4, Web Content 0.6 | — | — |
| plain | raf-nosampler | — | — | **58.1** (Renderer 18.5, SwComposite 16.9, main 6.9, Backgro~Pool # 6.3, DOM Worker 3.6) | cef:gpu-process 15.5, cef:renderer 11.9, AxioCEFProbe 9.6, Web Content 0.3 | — | — |
| plain | scroll | 59.9 | 24.8 | **82.9** (main 21.9, Renderer 17.6, SwComposite 15.2, DOM Worker 10.0, Backgro~Pool # 8.1) | cef:gpu-process 61.9, cef:renderer 15.7, AxioCEFProbe 14.8 | — | — |
| plain | key | — | — | **16.7** (main 7.9, Renderer 2.2, SwComposite 1.9, DOM Worker 1.4, Timer 0.8) | AxioCEFProbe 2.5, cef:renderer 2.5, cef:gpu-process 1.1, WebExtensions 0.3 | 12.4 | — |
| plain | switch-to-gecko | — | — | **42.4** (main 24.2, Renderer 12.1, Backgro~Pool # 6.1) | Isolated Web Co 6.1 | — | 133.0 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 3 | 2 | 2.932 | 6.014 | 0.0148 | 0.0203 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 189 | 189 | 0.223 | 0.772 | 0.0134 | 0.0465 |
| plain | raf-nosampler | memfd | native | 183 | 183 | 0.221 | 0.788 | 0.0132 | 0.0472 |
| plain | scroll | memfd | native | 123 | 123 | 0.692 | 0.718 | 0.0400 | 0.0415 |
| plain | key | memfd | native | 21 | 21 | 0.058 | 0.785 | 0.0003 | 0.0045 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

