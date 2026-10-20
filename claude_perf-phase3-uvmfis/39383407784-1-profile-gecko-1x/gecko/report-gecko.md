# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.2 | **4.9** (main 1.9, DOM Worker 1.5, Renderer 1.0, glean.dispatche 0.5) | Web Content 2.4, RDD Process 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **16.9** (Renderer 8.5, main 1.6, WRRende~ckend# 1.6, TaskCon~ller # 1.3, glean.dispatche 1.0) | Isolated Web Co 3.6, WebExtensions 0.3 | — | — |
| plain | raf-nosampler | — | — | **10.9** (Renderer 5.6, WRRende~ckend# 1.3, main 1.0, glean.dispatche 1.0, WRScene~ilder# 1.0) | Isolated Web Co 3.0 | — | — |
| plain | scroll | 59.0 | 17.2 | **28.3** (Renderer 17.8, main 3.0, WRRende~ckend# 2.5, Compositor 1.5, WRScene~ilder# 1.0) | Isolated Web Co 4.0, Privileged Cont 1.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **5.9** (main 3.5, glean.dispatche 0.5, TaskCon~ller # 0.5, Renderer 0.5, IPC I/O Parent 0.3) | Isolated Web Co 1.6, WebExtensions 0.3 | 8.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

