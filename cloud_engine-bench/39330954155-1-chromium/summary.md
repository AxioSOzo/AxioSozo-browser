# Engine bench summary — run 39330954155

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage |
| --- | --- | --- |
| Spawn → ready | 262 ms [540] | 230 ms [329] |
| Create → first frame (1×) | 218 ms [642] | 128 ms [264] |
| Create → painted frame (1×) | 219 ms [642] | 128 ms [264] |
| Navigate → painted frame (static, 1×) | 19 ms [22] | 18 ms [22] |
| Idle frames/s (static page) | 0.50 | 0.50 |
| Processes after create | 10 | 10 |
| RSS after create (host+helpers) | 848 MB [852] | 850 MB [857] |
| PSS after create (host+helpers) | — | — |
| Close → host exit | 134 ms [335] | 87 ms [235] |
| Close → no helper left | 139 ms [340] | 92 ms [239] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 60.0 [60.2] | 60.0 [60.2] |
| rAF frame interval median | 16.7 ms | 16.7 ms [16.8] |
| rAF frame interval p99 | 18.4 ms [20.4] | 19.7 ms [22.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 [0.003] |
| rAF pipe throughput | 140 MB/s [141] | 140 MB/s [141] |
| rAF bytes/frame | 2340342 B | 2340369 B |
| rAF client read time/frame | 1.69 ms [3.81] | 1.73 ms [3.82] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 |
| rAF CPU host+helpers | 20 % [22] | 21 % [23] |
| rAF RSS host+helpers | 869 MB [870] | 873 MB [877] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 |
| Scroll frame interval p99 | 18.2 ms [20.2] | 18.1 ms [18.7] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 23 % [26] | 24 % [26] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.2 | 60.2 |
| DOM page scroll fps | 60.1 [60.2] | 60.2 |
| Key → changed frame (pooled) | 4.4 ms [6.5] | 4.5 ms [7.0] |
| Key → title event (median of reps) | 1.3 ms [1.4] | 1.3 ms [1.4] |
| Wheel → changed frame (pooled) | 11.1 ms [13.2] | 11.0 ms [12.8] |
| Image page navigate → painted | 130 ms [136] | 130 ms [158] |
| DOM page navigate → painted | 287 ms [296] | 328 ms [339] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 59.6 [59.8] | 59.5 [59.8] |
| rAF frame interval median | 16.8 ms | 16.8 ms [17.0] |
| rAF frame interval p99 | 19.7 ms [25.7] | 19.0 ms [26.3] |
| rAF intervals > 25 ms | 0.000 [0.010] | 0.000 [0.014] |
| rAF pipe throughput | 558 MB/s [560] | 557 MB/s [560] |
| rAF bytes/frame | 9360347 B | 9360375 B |
| rAF client read time/frame | 15.55 ms [15.62] | 15.60 ms [15.77] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 |
| rAF host damage share (damage run) | — | 0.236 [0.237] |
| rAF CPU host+helpers | 44 % [46] | 44 % [45] |
| rAF RSS host+helpers | 1263 MB [1290] | 1273 MB [1285] |
| Scroll fps (wheel 60 Hz) | 59.0 [59.4] | 59.1 [59.3] |
| Scroll frame interval p99 | 27.1 ms [33.7] | 24.0 ms [31.4] |
| Scroll pipe throughput | 552 MB/s [556] | 554 MB/s [555] |
| Scroll CPU host+helpers | 77 % [83] | 77 % [80] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 57.7 [58.3] | 57.1 [58.6] |
| DOM page scroll fps | 60.0 | 60.0 |
| Key → changed frame (pooled) | 18.0 ms [20.5] | 15.7 ms [19.9] |
| Key → title event (median of reps) | 1.4 ms | 1.4 ms |
| Wheel → changed frame (pooled) | 15.7 ms [23.0] | 17.8 ms [24.2] |
| Image page navigate → painted | 168 ms [177] | 168 ms [181] |
| DOM page navigate → painted | 383 ms [465] | 421 ms [454] |
| Resize → frame at new size | 96 ms [99] | 99 ms [101] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 59.0 [59.2] | — |
| rAF client read/frame, 1 MiB pipe | 12.09 ms [12.28] | — |
| Scroll fps, 1 MiB pipe | 60.0 [60.1] | — |
| Scroll CPU, 1 MiB pipe | 56 % [59] | — |
