# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **5.9** (main 1.9, DOM Worker 1.0, glean.dispatche 0.5, IPDL Background 0.5, TaskCon~ller # 0.5) | Web Content 3.4, RDD Process 0.5, Privileged Cont 0.5, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **24.5** (Renderer 15.0, WRRende~ckend# 2.0, main 1.3, glean.dispatche 1.3, TaskCon~ller # 1.3) | Isolated Web Co 3.6, WebExtensions 0.6 | — | — |
| plain | raf-nosampler | — | — | **17.6** (Renderer 9.0, WRScene~ilder# 1.7, WRRende~ckend# 1.7, glean.dispatche 1.3, main 1.0) | Isolated Web Co 4.0, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **40.2** (Renderer 27.2, main 4.0, WRRende~ckend# 3.5, SwComposite 1.5, glean.dispatche 1.0) | Isolated Web Co 4.0, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.0** (main 4.0, Renderer 0.8, TaskCon~ller # 0.5, Compositor 0.5, glean.dispatche 0.3) | Isolated Web Co 1.9, WebExtensions 0.5, Privileged Cont 0.3 | 11.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

