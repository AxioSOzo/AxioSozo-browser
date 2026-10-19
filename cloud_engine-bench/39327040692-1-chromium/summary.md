# Engine bench summary — run 39327040692

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage |
| --- | --- | --- |
| Spawn → ready | 181 ms [579] | 178 ms [240] |
| Create → first frame (1×) | 124 ms [3089] | 125 ms [145] |
| Create → painted frame (1×) | 125 ms [3090] | 126 ms [146] |
| Navigate → painted frame (static, 1×) | 22 ms [24] | 22 ms [23] |
| Idle frames/s (static page) | 0.50 [1.00] | 0.50 |
| Processes after create | 10 | 10 |
| RSS after create (host+helpers) | 850 MB | 849 MB [852] |
| PSS after create (host+helpers) | — | — |
| Close → host exit | 82 ms [84] | 80 ms [83] |
| Close → no helper left | 86 ms [89] | 84 ms [87] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 60.0 [60.2] | 60.0 [60.2] |
| rAF frame interval median | 16.6 ms [16.8] | 16.7 ms |
| rAF frame interval p99 | 18.0 ms [18.1] | 18.3 ms [18.5] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 140 MB/s [141] | 140 MB/s [141] |
| rAF bytes/frame | 2340342 B | 2340369 B |
| rAF client read time/frame | 2.05 ms [3.41] | 2.06 ms [3.50] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 |
| rAF CPU host+helpers | 23 % [26] | 24 % [27] |
| rAF RSS host+helpers | 869 MB [876] | 871 MB [876] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 |
| Scroll frame interval p99 | 18.0 ms [18.1] | 18.1 ms [18.3] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 27 % [28] | 27 % [28] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.2 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 |
| Key → changed frame (pooled) | 5.6 ms [7.1] | 5.6 ms [7.5] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms [1.7] |
| Wheel → changed frame (pooled) | 11.0 ms [12.3] | 11.0 ms [12.0] |
| Image page navigate → painted | 156 ms [161] | 154 ms [155] |
| DOM page navigate → painted | 327 ms [361] | 343 ms [360] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 60.0 | 60.0 |
| rAF frame interval median | 16.6 ms [16.7] | 16.6 ms [16.7] |
| rAF frame interval p99 | 18.4 ms [19.5] | 18.6 ms [20.1] |
| rAF intervals > 25 ms | 0.000 [0.003] | 0.000 [0.003] |
| rAF pipe throughput | 562 MB/s | 562 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B |
| rAF client read time/frame | 10.47 ms [10.78] | 10.76 ms [11.02] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 |
| rAF host damage share (damage run) | — | 0.237 |
| rAF CPU host+helpers | 50 % [53] | 52 % [54] |
| rAF RSS host+helpers | 1259 MB [1281] | 1265 MB [1271] |
| Scroll fps (wheel 60 Hz) | 60.1 | 60.1 |
| Scroll frame interval p99 | 21.4 ms [23.1] | 22.5 ms [26.5] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s |
| Scroll CPU host+helpers | 83 % [84] | 83 % [84] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 59.7 [59.8] | 59.7 [60.0] |
| DOM page scroll fps | 60.1 | 60.1 |
| Key → changed frame (pooled) | 14.9 ms [16.8] | 15.4 ms [17.6] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms [1.6] |
| Wheel → changed frame (pooled) | 12.6 ms [19.8] | 12.6 ms [20.2] |
| Image page navigate → painted | 194 ms [199] | 152 ms [193] |
| DOM page navigate → painted | 414 ms [446] | 433 ms [443] |
| Resize → frame at new size | 90 ms [100] | 97 ms |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 58.9 | — |
| rAF client read/frame, 1 MiB pipe | 8.00 ms [8.22] | — |
| Scroll fps, 1 MiB pipe | 60.0 | — |
| Scroll CPU, 1 MiB pipe | 65 % [66] | — |
