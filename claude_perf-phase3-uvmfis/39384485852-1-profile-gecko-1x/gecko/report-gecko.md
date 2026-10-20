# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.1 | **5.8** (main 2.4, Renderer 1.9, glean.dispatche 0.5, IPDL Background 0.5, DOM Worker 0.5) | Web Content 3.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **27.4** (Renderer 16.3, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.2, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **18.8** (Renderer 9.9, glean.dispatche 2.0, WRRende~ckend# 2.0, main 1.3, WRScene~ilder# 1.3) | Isolated Web Co 4.7, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **43.2** (Renderer 28.4, main 3.9, WRRende~ckend# 3.4, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.4 | — | — |
| plain | key | — | — | **8.1** (main 4.5, Renderer 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5, Softwar~cThread 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

