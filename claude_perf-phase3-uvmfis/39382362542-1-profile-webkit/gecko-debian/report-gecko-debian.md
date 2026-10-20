# Zen parent-process profile report (tools/engine-bench/profile)

Software rendering on GitHub runners (no GPU); TEST-ONLY harness pieces are labelled in each result. Passes: plain = no instrumentation, trace = chrome timing hooks, profile = hooks + Gecko profiler.

## gecko-debian (PASS)

CPU: INTEL(R) XEON(R) PLATINUM 8573C; passes: plain PASS

| pass | window | fps | p99 ms | Zen parent CPU % (top threads) | other processes CPU % | key→frame ms | switch ms |
| --- | --- | ---: | ---: | --- | --- | ---: | ---: |
| plain | idle | 59.3 | 17.4 | **8.5** (Renderer 3.5, main 2.5, TaskCon~ller # 0.5, Softwar~cThread 0.5, WRRende~ckend# 0.5) | Web Content 3.9, Isolated Web Co 1.5, RDD Process 0.5 | — | — |
| plain | raf | 59.0 | 17.3 | **27.9** (Renderer 15.5, WRRende~ckend# 2.6, main 2.0, glean.dispatche 1.3, TaskCon~ller # 1.3) | Isolated Web Co 5.7, WebExtensions 0.7, Privileged Cont 0.6, Web Content 0.3 | — | — |
| plain | raf-nosampler | — | — | **20.2** (Renderer 10.0, WRRende~ckend# 2.3, WRScene~ilder# 2.0, glean.dispatche 1.3, Compositor 1.3) | Isolated Web Co 4.6 | — | — |
| plain | scroll | 59.0 | 17.2 | **41.7** (Renderer 27.2, main 4.5, WRRende~ckend# 3.5, SwComposite 3.0, Compositor 1.5) | Isolated Web Co 4.5 | — | — |
| plain | key | — | — | **9.5** (main 5.1, Renderer 1.1, TaskCon~ller # 0.8, Softwar~cThread 0.5, Compositor 0.5) | Isolated Web Co 1.6, WebExtensions 0.3 | 10.5 | — |

Presenter frame path (diagnostics at the window end; native receiver = nsIAxioFrameSink.statsJSON deltas: apply on the AxioFrameRing task queue, present on the main thread):

| pass | window | transport | upload | applied | presented | apply ms/frame | present ms/frame | apply core share | present core share |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| plain | idle | — | — | — | — | — | — | — | — |
| plain | raf | — | — | — | — | — | — | — | — |
| plain | raf-nosampler | — | — | — | — | — | — | — | — |
| plain | scroll | — | — | — | — | — | — | — | — |
| plain | key | — | — | — | — | — | — | — | — |

