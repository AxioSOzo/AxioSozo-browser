# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: AMD EPYC 7763 64-Core Processor; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.2 | 17.4 | **11.3** (Renderer 3.4, main 2.9, DOM Worker 1.0, glean.dispatche 0.5, IPC I/O Parent 0.5) | Web Content 4.4, Isolated Web Co 0.5 | — | — |
| plain | raf | 59.0 | 17.1 | **27.1** (Renderer 16.4, WRRende~ckend# 2.3, main 1.6, glean.dispatche 1.6, TaskCon~ller # 1.3) | Isolated Web Co 4.9, WebExtensions 0.7, Privileged Cont 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.5** (Renderer 9.6, WRRende~ckend# 2.3, glean.dispatche 1.7, WRScene~ilder# 1.7, main 1.3) | Isolated Web Co 4.0, Privileged Cont 0.3 | — | — |
| plain | scroll | 59.0 | 17.1 | **44.2** (Renderer 28.7, main 5.0, WRRende~ckend# 4.0, glean.dispatche 1.5, Compositor 1.5) | Isolated Web Co 4.5, Privileged Cont 0.5 | — | — |
| plain | key | — | — | **9.1** (main 4.5, Renderer 0.8, glean.dispatche 0.5, TaskCon~ller # 0.5, WRRende~ckend# 0.5) | Isolated Web Co 1.9, WebExtensions 0.3 | 10.0 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

