# Engine bench summary — run 39334729960

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage |
| --- | --- | --- |
| Spawn → ready | 174 ms [392] | 236 ms [299] |
| Create → first frame (1×) | 122 ms [640] | 109 ms [240] |
| Create → painted frame (1×) | 122 ms [640] | 110 ms [241] |
| Navigate → painted frame (static, 1×) | 18 ms [23] | 20 ms [24] |
| Idle frames/s (static page) | 0.50 | 0.50 |
| Processes after create | 10 | 10 |
| RSS after create (host+helpers) | 846 MB [851] | 847 MB [850] |
| PSS after create (host+helpers) | — | — |
| Close → host exit | 79 ms [177] | 82 ms [133] |
| Close → no helper left | 83 ms [181] | 86 ms [137] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 60.0 | 60.0 [60.1] |
| rAF frame interval median | 16.5 ms [16.6] | 16.5 ms [16.6] |
| rAF frame interval p99 | 18.1 ms [18.7] | 18.1 ms [18.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 140 MB/s | 140 MB/s [141] |
| rAF bytes/frame | 2340342 B | 2340369 B |
| rAF client read time/frame | 1.41 ms [2.42] | 1.48 ms [3.45] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 |
| rAF CPU host+helpers | 16 % [17] | 17 % [19] |
| rAF RSS host+helpers | 868 MB [870] | 868 MB [870] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 |
| Scroll frame interval p99 | 18.0 ms [18.9] | 17.8 ms [17.9] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 20 % [22] | 22 % [23] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.2 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 |
| Key → changed frame (pooled) | 4.0 ms [5.9] | 4.0 ms [6.3] |
| Key → title event (median of reps) | 1.2 ms [1.4] | 1.3 ms |
| Wheel → changed frame (pooled) | 10.9 ms [12.9] | 11.1 ms [12.5] |
| Image page navigate → painted | 125 ms [127] | 122 ms [129] |
| DOM page navigate → painted | 279 ms [303] | 278 ms [284] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 60.1 | 60.0 [60.1] |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms |
| rAF frame interval p99 | 19.8 ms [20.4] | 19.8 ms [20.4] |
| rAF intervals > 25 ms | 0.000 [0.003] | 0.000 [0.003] |
| rAF pipe throughput | 563 MB/s | 562 MB/s [563] |
| rAF bytes/frame | 9360347 B | 9360375 B |
| rAF client read time/frame | 7.70 ms [7.84] | 7.73 ms [7.78] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 |
| rAF host damage share (damage run) | — | 0.236 [0.237] |
| rAF CPU host+helpers | 39 % [40] | 38 % [40] |
| rAF RSS host+helpers | 1258 MB [1270] | 1275 MB [1301] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.1 [60.2] |
| Scroll frame interval p99 | 21.2 ms [31.9] | 21.9 ms [23.0] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s |
| Scroll CPU host+helpers | 66 % [68] | 67 % [69] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.0 | 60.0 [60.1] |
| DOM page scroll fps | 60.1 [60.2] | 60.0 [60.2] |
| Key → changed frame (pooled) | 9.8 ms [11.2] | 10.5 ms [11.6] |
| Key → title event (median of reps) | 1.3 ms | 1.3 ms [1.4] |
| Wheel → changed frame (pooled) | 11.9 ms [13.6] | 11.6 ms [14.5] |
| Image page navigate → painted | 146 ms [152] | 149 ms [161] |
| DOM page navigate → painted | 316 ms [379] | 333 ms [362] |
| Resize → frame at new size | 93 ms [96] | 90 ms [98] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 60.0 [60.2] | — |
| rAF client read/frame, 1 MiB pipe | 5.29 ms [5.37] | — |
| Scroll fps, 1 MiB pipe | 60.0 [60.1] | — |
| Scroll CPU, 1 MiB pipe | 50 % [52] | — |
