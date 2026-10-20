# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-2x (PASS)

CPU: AMD EPYC 9V45 96-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.0 | 17.1 | **4.4** (main 1.9, DOM Worker 1.0, IPDL Background 0.5, TaskCon~ller # 0.5, Renderer 0.5) | Web Content 1.9, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **22.9** (Renderer 13.1, SwComposite 2.0, WRRende~ckend# 1.6, main 1.3, TaskCon~ller # 1.3) | Isolated Web Co 3.9, WebExtensions 0.3, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **15.6** (Renderer 7.0, WRRende~ckend# 2.3, main 1.0, glean.dispatche 1.0, WRScene~ilder# 1.0) | Isolated Web Co 5.4 | — | — |
| plain | scroll | 59.0 | 17.1 | **53.7** (Renderer 39.7, main 4.0, SwComposite 3.5, WRRende~ckend# 3.0, Compositor 1.5) | Isolated Web Co 3.0, WebExtensions 0.5 | — | — |
| plain | key | — | — | **6.9** (main 3.5, Renderer 1.1, TaskCon~ller # 0.5, glean.dispatche 0.3, IPC I/O Parent 0.3) | Isolated Web Co 1.4, WebExtensions 0.3 | 11.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

