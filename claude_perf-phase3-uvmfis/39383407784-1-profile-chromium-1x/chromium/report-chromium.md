# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## chromium (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | switch-to-engine | — | — | **55.2** (main 27.5, Renderer 11.8, DOM Worker 5.9, StyleThread# 2.0, WRScene~ilder# 2.0) | AxioCEFProbe 55.0, cef:gpu-process 19.7, cef:renderer 11.8, cef:utility 9.8 | — | 466.0 |
| plain | idle | — | — | **5.3** (main 4.3, Timer 1.0) | AxioCEFProbe 1.0, WebExtensions 0.5 | — | — |
| plain | raf | 60.0 | 20.9 | **20.8** (main 7.8, DOM Worker 3.6, Renderer 2.3, Backgro~Pool # 1.9, Compositor 1.3) | cef:renderer 8.4, AxioCEFProbe 7.8, cef:gpu-process 5.8, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **20.5** (main 6.3, DOM Worker 3.3, Renderer 2.3, Backgro~Pool # 1.7, glean.dispatche 1.3) | cef:renderer 10.2, AxioCEFProbe 5.3, cef:gpu-process 5.0, WebExtensions 0.3 | — | — |
| plain | scroll | 59.8 | 23.2 | **39.9** (main 19.4, DOM Worker 7.8, Backgro~Pool # 2.4, TaskCon~ller # 1.9, Renderer 1.9) | cef:gpu-process 20.4, cef:renderer 10.7, AxioCEFProbe 8.2, Isolated Web Co 0.5 | — | — |
| plain | key | — | — | **14.1** (main 8.0, Renderer 1.4, DOM Worker 1.1, Timer 0.8, TaskCon~ller # 0.5) | AxioCEFProbe 2.4, cef:renderer 2.2, WebExtensions 0.6, cef:gpu-process 0.3 | 12.5 | — |
| plain | switch-to-gecko | — | — | **16.3** (DOM Worker 4.5, main 4.4, Indexed~ IO # 3.3, IPDL Background 1.7, TaskCon~ller # 1.0) | Privileged Cont 0.1, Isolated Web Co 0.1 | — | 15018.4 |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | switch-to-engine | memfd | native | 2 | 2 | 0.974 | 1.184 | 0.0037 | 0.0044 |
| plain | idle | memfd | native | 0 | 0 | — | — | 0.0000 | 0.0000 |
| plain | raf | memfd | native | 187 | 187 | 0.063 | 0.226 | 0.0038 | 0.0135 |
| plain | raf-nosampler | memfd | native | 184 | 184 | 0.047 | 0.230 | 0.0029 | 0.0139 |
| plain | scroll | memfd | native | 121 | 120 | 0.168 | 0.207 | 0.0097 | 0.0119 |
| plain | key | memfd | native | 21 | 21 | 0.015 | 0.243 | 0.0001 | 0.0014 |
| plain | switch-to-gecko | — | — | — | — | — | — | — | — |

