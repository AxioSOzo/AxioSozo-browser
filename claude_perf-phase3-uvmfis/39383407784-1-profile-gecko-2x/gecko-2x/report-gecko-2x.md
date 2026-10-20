# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 9V74 80-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.1 | **6.8** (main 1.9, Renderer 1.9, DOM Worker 1.5, glean.dispatche 0.5, WRRende~ckend# 0.5) | Web Content 2.9, Isolated Web Co 1.0 | — | — |
| plain | raf | 59.0 | 17.1 | **26.9** (Renderer 15.7, SwComposite 2.6, main 1.6, TaskCon~ller # 1.3, WRScene~ilder# 1.3) | Isolated Web Co 3.3, WebExtensions 1.0, Privileged Cont 0.6 | — | — |
| plain | raf-nosampler | — | — | **18.7** (Renderer 9.6, WRRende~ckend# 1.7, SwComposite 1.7, Compositor 1.3, main 1.0) | Isolated Web Co 3.3, Web Content 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **70.3** (Renderer 52.8, SwComposite 6.5, main 4.0, WRRende~ckend# 3.5, glean.dispatche 1.0) | Isolated Web Co 3.0, Web Content 0.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **7.5** (main 3.7, Renderer 1.1, TaskCon~ller # 0.5, WRRende~ckend# 0.5, Compositor 0.5) | Isolated Web Co 1.6 | 11.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

