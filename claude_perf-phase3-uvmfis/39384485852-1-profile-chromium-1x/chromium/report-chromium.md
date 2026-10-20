# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **23.4** (main 15.3, Renderer 4.1, DOM Worker 2.0, WRRende~ckend# 1.0, Compositor 1.0) | AxioCEFProbe 22.4, cef:gpu-process 8.2, cef:renderer 5.1, cef:utility 4.1 | — | 910.0 |
| plain | idle | — | — | **5.4** (main 3.4, TaskCon~ller # 1.5, Timer 0.5) | AxioCEFProbe 1.0, WebExtensions 0.5 | — | — |
| plain | raf | 59.0 | 22.2 | **52.3** (main 22.5, Renderer 9.8, SwComposite 8.5, DOM Worker 3.3, WRRende~ckend# 2.3) | cef:renderer 10.8, AxioCEFProbe 7.2, cef:gpu-process 4.9, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **51.2** (main 22.6, Renderer 10.3, SwComposite 8.3, DOM Worker 3.0, WRRende~ckend# 2.7) | cef:renderer 11.0, AxioCEFProbe 6.6, cef:gpu-process 6.3, Isolated Web Co 0.3 | — | — |
| plain | scroll | 58.0 | 33.1 | **93.0** (main 60.1, Renderer 9.8, SwComposite 7.8, DOM Worker 5.4, Backgro~Pool # 3.4) | cef:gpu-process 20.5, cef:renderer 12.7, AxioCEFProbe 10.2 | — | — |
| plain | key | — | — | **19.1** (main 9.6, TaskCon~ller # 1.7, Renderer 1.7, SwComposite 1.4, DOM Worker 1.4) | cef:renderer 2.5, AxioCEFProbe 2.3, cef:gpu-process 0.3 | 18.9 | — |
| plain | switch-to-gecko | — | — | **40.2** (main 20.1, Renderer 13.4, BgIOThr~Pool # 6.7) |  | — | 125.0 |

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

