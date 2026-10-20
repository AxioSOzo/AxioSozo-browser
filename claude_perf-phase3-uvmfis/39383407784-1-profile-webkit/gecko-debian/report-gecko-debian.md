# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.1 | 17.2 | **5.0** (main 2.0, DOM Worker 1.5, glean.dispatche 0.5, Renderer 0.5, Compositor 0.5) | Web Content 2.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.2 | **22.1** (Renderer 12.5, WRRende~ckend# 2.0, main 1.6, WRScene~ilder# 1.3, glean.dispatche 1.0) | Isolated Web Co 5.0, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **16.6** (Renderer 8.3, WRRende~ckend# 2.0, glean.dispatche 1.3, WRScene~ilder# 1.3, main 1.0) | Isolated Web Co 4.3, WebExtensions 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **38.1** (Renderer 24.1, main 4.0, WRRende~ckend# 3.5, SwComposite 2.0, glean.dispatche 1.5) | Isolated Web Co 4.5 | — | — |
| plain | key | — | — | **8.3** (main 4.6, TaskCon~ller # 0.8, Renderer 0.8, glean.dispatche 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.1 | 8.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

