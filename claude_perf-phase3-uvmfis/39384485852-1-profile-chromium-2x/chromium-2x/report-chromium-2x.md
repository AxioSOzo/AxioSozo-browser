# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **47.8** (main 22.8, Renderer 16.6, DOM Worker 4.2, WRRende~ckend# 2.1, Compositor 2.1) | AxioCEFProbe 43.7, cef:gpu-process 16.7, cef:utility 10.4, cef:zygote 6.2 | — | 409.7 |
| plain | idle | — | — | **3.8** (main 1.4, DOM Worker 1.4, Timer 0.5, Socket Thread 0.5) | AxioCEFProbe 1.0, Web Content 0.5 | — | — |
| plain | raf | 59.0 | 19.1 | **69.5** (main 32.7, Renderer 14.6, SwComposite 12.9, WRRende~ckend# 2.3, DOM Worker 2.3) | cef:renderer 11.4, cef:gpu-process 10.7, AxioCEFProbe 6.4, Isolated Web Co 0.3 | — | — |
| plain | raf-nosampler | — | — | **71.5** (main 35.2, Renderer 14.3, SwComposite 12.3, DOM Worker 3.0, WRRende~ckend# 2.7) | cef:gpu-process 13.3, cef:renderer 11.0, AxioCEFProbe 7.6 | — | — |
| plain | scroll | 36.9 | 39.0 | **96.6** (main 66.3, Renderer 9.6, SwComposite 7.2, DOM Worker 5.3, Backgro~Pool # 2.4) | cef:gpu-process 45.1, cef:renderer 12.5, AxioCEFProbe 9.2 | — | — |
| plain | key | — | — | **13.3** (main 6.1, Renderer 2.2, SwComposite 1.9, Timer 0.8, DOM Worker 0.8) | cef:renderer 2.5, AxioCEFProbe 1.4, cef:gpu-process 0.9 | 17.4 | — |
| plain | switch-to-gecko | — | — | **9.3** (main 3.0, DOM Worker 2.8, TaskCon~ller # 0.9, IPDL Background 0.8, IndexedDB IO # 0.7) | Web Content 0.1 | — | 15171.1 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | imagedata | — | — | — | — | — | — |
| plain | idle | memfd | imagedata | — | — | — | — | — | — |
| plain | raf | memfd | imagedata | — | — | — | — | — | — |
| plain | raf-nosampler | memfd | imagedata | — | — | — | — | — | — |
| plain | scroll | memfd | imagedata | — | — | — | — | — | — |
| plain | key | memfd | imagedata | — | — | — | — | — | — |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

