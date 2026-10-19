# Engine bench summary — run 39303324088

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage |
| --- | --- | --- |
| Spawn → ready | 206 ms [314] | 209 ms [212] |
| Create → first frame (1×) | 139 ms [3661] | 134 ms [142] |
| Create → painted frame (1×) | 140 ms [3662] | 136 ms [143] |
| Navigate → painted frame (static, 1×) | 22 ms [26] | 23 ms [24] |
| Idle frames/s (static page) | 0.50 [1.00] | 0.50 |
| Processes after create | 10 | 10 |
| RSS after create (host+helpers) | 847 MB [850] | 846 MB [849] |
| PSS after create (host+helpers) | — | — |
| Close → host exit | 83 ms | 85 ms [137] |
| Close → no helper left | 89 ms [91] | 91 ms [143] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 60.2 | 60.2 |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms |
| rAF frame interval p99 | 18.1 ms [18.5] | 18.1 ms [18.4] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B |
| rAF client read time/frame | 2.05 ms [3.84] | 2.08 ms [3.98] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 [0.237] |
| rAF CPU host+helpers | 24 % [26] | 25 % [28] |
| rAF RSS host+helpers | 866 MB [872] | 867 MB [876] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 |
| Scroll frame interval p99 | 18.1 ms [18.2] | 17.9 ms [18.0] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 29 % [31] | 31 % [34] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.0 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 |
| Key → changed frame (pooled) | 5.3 ms [6.8] | 5.4 ms [7.1] |
| Key → title event (median of reps) | 1.6 ms [1.7] | 1.6 ms [1.7] |
| Wheel → changed frame (pooled) | 11.2 ms [12.2] | 11.3 ms [12.6] |
| Image page navigate → painted | 158 ms | 158 ms [163] |
| DOM page navigate → painted | 343 ms [363] | 391 ms [401] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 60.1 | 60.1 [60.2] |
| rAF frame interval median | 16.7 ms | 16.7 ms |
| rAF frame interval p99 | 20.5 ms [21.0] | 20.3 ms [20.6] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 563 MB/s | 563 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B |
| rAF client read time/frame | 9.13 ms [9.27] | 8.32 ms [9.21] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 |
| rAF host damage share (damage run) | — | 0.236 [0.237] |
| rAF CPU host+helpers | 52 % [53] | 50 % [52] |
| rAF RSS host+helpers | 1274 MB [1304] | 1270 MB [1284] |
| Scroll fps (wheel 60 Hz) | 60.0 [60.2] | 60.0 [60.2] |
| Scroll frame interval p99 | 24.0 ms [26.1] | 20.8 ms [26.2] |
| Scroll pipe throughput | 562 MB/s [563] | 562 MB/s [563] |
| Scroll CPU host+helpers | 83 % [85] | 83 % |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 59.9 [60.0] | 60.0 [60.1] |
| DOM page scroll fps | 60.0 [60.1] | 60.1 |
| Key → changed frame (pooled) | 12.9 ms [14.5] | 13.7 ms [15.3] |
| Key → title event (median of reps) | 1.6 ms | 1.6 ms |
| Wheel → changed frame (pooled) | 11.6 ms [17.9] | 12.6 ms [18.8] |
| Image page navigate → painted | 189 ms [236] | 192 ms [202] |
| DOM page navigate → painted | 411 ms [464] | 423 ms [457] |
| Resize → frame at new size | 86 ms [93] | 89 ms [100] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 59.3 [59.6] | — |
| rAF client read/frame, 1 MiB pipe | 6.18 ms [6.27] | — |
| Scroll fps, 1 MiB pipe | 60.1 [60.2] | — |
| Scroll CPU, 1 MiB pipe | 65 % [66] | — |
