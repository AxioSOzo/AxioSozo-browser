# Engine bench summary — run 39659427320

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium+damage**: status BLOCKED_ENV (None/5 reps), engine ?, render_path None, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1'] — error: RuntimeError: BLOCKED_ENV: no usable Chromium sandbox (unprivileged user namespaces are unavailable and chrome-sandbox is not root:root 4755). Run `python3 native/chromium-host/probe.py install-sandbox` (sudo). The host never runs without its sandbox.
- **chromium+damage+payload**: status BLOCKED_ENV (None/5 reps), engine ?, render_path None, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1'] — error: RuntimeError: BLOCKED_ENV: no usable Chromium sandbox (unprivileged user namespaces are unavailable and chrome-sandbox is not root:root 4755). Run `python3 native/chromium-host/probe.py install-sandbox` (sudo). The host never runs without its sandbox.

| Metric | chromium+damage | chromium+damage+payload |
| --- | --- | --- |
| Spawn → ready | — | — |
| Create → first frame (1×) | — | — |
| Create → painted frame (1×) | — | — |
| Navigate → painted frame (static, 1×) | — | — |
| Idle frames/s (static page) | — | — |
| Processes after create | — | — |
| RSS after create (host+helpers) | — | — |
| PSS after create (host+helpers) | — | — |
| Close → host exit | — | — |
| Close → no helper left | — | — |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | — | — |
| rAF frame interval median | — | — |
| rAF frame interval p99 | — | — |
| rAF intervals > 25 ms | — | — |
| rAF pipe throughput | — | — |
| rAF bytes/frame | — | — |
| rAF client read time/frame | — | — |
| rAF changed-row band (share of frame) | — | — |
| rAF host damage share (damage run) | — | — |
| rAF CPU host+helpers | — | — |
| rAF RSS host+helpers | — | — |
| Scroll fps (wheel 60 Hz) | — | — |
| Scroll frame interval p99 | — | — |
| Scroll pipe throughput | — | — |
| Scroll CPU host+helpers | — | — |
| Scroll host damage share (damage run) | — | — |
| Image page scroll fps | — | — |
| DOM page scroll fps | — | — |
| Key → changed frame (pooled) | — | — |
| Key → title event (median of reps) | — | — |
| Wheel → changed frame (pooled) | — | — |
| Image page navigate → painted | — | — |
| DOM page navigate → painted | — | — |
| Resize → frame at new size | — | — |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | — | — |
| rAF frame interval median | — | — |
| rAF frame interval p99 | — | — |
| rAF intervals > 25 ms | — | — |
| rAF pipe throughput | — | — |
| rAF bytes/frame | — | — |
| rAF client read time/frame | — | — |
| rAF changed-row band (share of frame) | — | — |
| rAF host damage share (damage run) | — | — |
| rAF CPU host+helpers | — | — |
| rAF RSS host+helpers | — | — |
| Scroll fps (wheel 60 Hz) | — | — |
| Scroll frame interval p99 | — | — |
| Scroll pipe throughput | — | — |
| Scroll CPU host+helpers | — | — |
| Scroll host damage share (damage run) | — | — |
| Image page scroll fps | — | — |
| DOM page scroll fps | — | — |
| Key → changed frame (pooled) | — | — |
| Key → title event (median of reps) | — | — |
| Wheel → changed frame (pooled) | — | — |
| Image page navigate → painted | — | — |
| DOM page navigate → painted | — | — |
| Resize → frame at new size | — | — |
