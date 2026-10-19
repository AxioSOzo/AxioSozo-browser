# Engine bench summary — run 39326741061

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, INTEL(R) XEON(R) PLATINUM 8573C × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, INTEL(R) XEON(R) PLATINUM 8573C × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage |
| --- | --- | --- |
| Spawn → ready | 177 ms [827] | 182 ms [196] |
| Create → first frame (1×) | 116 ms [451] | 120 ms [132] |
| Create → painted frame (1×) | 118 ms [452] | 120 ms [149] |
| Navigate → painted frame (static, 1×) | 22 ms [23] | 22 ms [25] |
| Idle frames/s (static page) | 0.50 | 0.50 |
| Processes after create | 10 | 10 |
| RSS after create (host+helpers) | 848 MB [852] | 847 MB [850] |
| PSS after create (host+helpers) | — | — |
| Close → host exit | 82 ms | 84 ms [87] |
| Close → no helper left | 85 ms [86] | 87 ms [90] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 60.2 | 60.1 [60.2] |
| rAF frame interval median | 16.8 ms | 16.7 ms |
| rAF frame interval p99 | 18.1 ms [18.7] | 18.1 ms [18.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B |
| rAF client read time/frame | 2.05 ms [3.56] | 2.03 ms [3.58] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 [0.237] |
| rAF CPU host+helpers | 21 % [23] | 20 % [22] |
| rAF RSS host+helpers | 868 MB [873] | 874 MB [875] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 |
| Scroll frame interval p99 | 17.9 ms [18.2] | 17.8 ms [17.9] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 24 % | 22 % |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.0 [60.2] | 60.0 [60.2] |
| DOM page scroll fps | 60.2 | 60.2 |
| Key → changed frame (pooled) | 5.5 ms [7.3] | 5.4 ms [7.2] |
| Key → title event (median of reps) | 1.5 ms | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 11.0 ms [12.5] | 11.0 ms [12.2] |
| Image page navigate → painted | 143 ms [147] | 143 ms [144] |
| DOM page navigate → painted | 320 ms [334] | 308 ms [316] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 60.0 [60.1] | 60.0 [60.1] |
| rAF frame interval median | 16.6 ms | 16.6 ms [16.7] |
| rAF frame interval p99 | 19.1 ms [19.7] | 19.3 ms [20.7] |
| rAF intervals > 25 ms | 0.000 [0.003] | 0.000 |
| rAF pipe throughput | 562 MB/s [563] | 562 MB/s [563] |
| rAF bytes/frame | 9360347 B | 9360375 B |
| rAF client read time/frame | 10.24 ms [10.28] | 9.78 ms [10.14] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 |
| rAF host damage share (damage run) | — | 0.236 [0.237] |
| rAF CPU host+helpers | 46 % [47] | 46 % [48] |
| rAF RSS host+helpers | 1291 MB [1299] | 1263 MB [1304] |
| Scroll fps (wheel 60 Hz) | 60.0 [60.2] | 60.0 [60.1] |
| Scroll frame interval p99 | 22.9 ms [26.7] | 22.2 ms [28.2] |
| Scroll pipe throughput | 562 MB/s [563] | 562 MB/s |
| Scroll CPU host+helpers | 67 % [71] | 68 % [69] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 59.9 | 59.9 [60.0] |
| DOM page scroll fps | 60.1 [60.2] | 60.1 [60.2] |
| Key → changed frame (pooled) | 15.2 ms [16.7] | 15.3 ms [17.4] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms |
| Wheel → changed frame (pooled) | 11.8 ms [17.4] | 12.8 ms [17.5] |
| Image page navigate → painted | 171 ms [190] | 167 ms [173] |
| DOM page navigate → painted | 371 ms [415] | 354 ms [375] |
| Resize → frame at new size | 90 ms [97] | 87 ms [91] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 59.1 [59.3] | — |
| rAF client read/frame, 1 MiB pipe | 7.35 ms [7.43] | — |
| Scroll fps, 1 MiB pipe | 60.2 | — |
| Scroll CPU, 1 MiB pipe | 50 % [52] | — |
