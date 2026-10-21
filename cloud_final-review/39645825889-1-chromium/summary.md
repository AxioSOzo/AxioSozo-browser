# Engine bench summary — run 39645825889

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage+payload**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage | chromium+damage+payload |
| --- | --- | --- | --- |
| Spawn → ready | 214 ms [906] | 206 ms [226] | 213 ms [222] |
| Create → first frame (1×) | 148 ms [5497] | 151 ms [165] | 147 ms [182] |
| Create → painted frame (1×) | 151 ms [5498] | 152 ms [167] | 148 ms [194] |
| Navigate → painted frame (static, 1×) | 22 ms [25] | 22 ms [23] | 21 ms [25] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.50 |
| Processes after create | 10 | 10 | 10 |
| RSS after create (host+helpers) | 848 MB [852] | 851 MB [852] | 850 MB [851] |
| PSS after create (host+helpers) | — | — | — |
| Close → host exit | 89 ms [132] | 89 ms [139] | 84 ms |
| Close → no helper left | 96 ms [139] | 96 ms [145] | 90 ms [91] |
| **1× (900×650 CSS px → 900×650 px)** | | | |
| rAF fps | 60.2 | 60.2 | 60.2 |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms [16.8] | 16.7 ms [16.8] |
| rAF frame interval p99 | 17.8 ms [17.9] | 17.8 ms | 17.6 ms [17.8] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 33 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 553408 B |
| rAF client read time/frame | 1.09 ms [3.29] | 1.09 ms [3.34] | 0.19 ms |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.236 | 0.236 |
| rAF CPU host+helpers | 20 % [23] | 20 % [22] | 17 % [18] |
| rAF RSS host+helpers | 869 MB [871] | 871 MB [874] | 867 MB [874] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 |
| Scroll frame interval p99 | 18.0 ms [18.2] | 17.7 ms [18.0] | 17.7 ms [17.8] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 25 % [26] | 25 % [26] | 26 % [27] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 |
| Image page scroll fps | 60.2 | 60.2 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 | 60.0 [60.2] |
| Key → changed frame (pooled) | 4.5 ms [6.8] | 4.5 ms [6.7] | 3.1 ms [3.9] |
| Key → title event (median of reps) | 1.6 ms [1.7] | 1.6 ms [1.7] | 1.6 ms |
| Wheel → changed frame (pooled) | 11.2 ms [13.0] | 10.8 ms [12.9] | 11.0 ms [12.2] |
| Image page navigate → painted | 163 ms [165] | 160 ms [170] | 166 ms [167] |
| DOM page navigate → painted | 400 ms [408] | 369 ms [392] | 377 ms [404] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | |
| rAF fps | 60.1 | 60.1 | 60.2 |
| rAF frame interval median | 16.6 ms [16.7] | 16.6 ms [16.7] | 16.7 ms |
| rAF frame interval p99 | 18.6 ms [18.9] | 18.9 ms [19.1] | 17.9 ms [18.0] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.003 |
| rAF pipe throughput | 562 MB/s | 562 MB/s | 133 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B | 2212442 B [2212531] |
| rAF client read time/frame | 13.46 ms [13.72] | 13.62 ms [13.90] | 0.93 ms [0.95] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | — |
| rAF host damage share (damage run) | — | 0.237 | 0.236 |
| rAF CPU host+helpers | 44 % [45] | 44 % [45] | 35 % [36] |
| rAF RSS host+helpers | 1245 MB [1254] | 1257 MB [1280] | 1234 MB [1277] |
| Scroll fps (wheel 60 Hz) | 59.6 [60.0] | 59.7 [60.0] | 60.2 |
| Scroll frame interval p99 | 25.3 ms [31.0] | 26.4 ms [28.7] | 23.7 ms [26.3] |
| Scroll pipe throughput | 558 MB/s [561] | 558 MB/s [561] | 563 MB/s |
| Scroll CPU host+helpers | 80 % [81] | 80 % [82] | 75 % [76] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 |
| Image page scroll fps | 59.4 | 59.2 [59.5] | 60.0 |
| DOM page scroll fps | 60.0 [60.1] | 60.0 [60.1] | 60.0 [60.2] |
| Key → changed frame (pooled) | 17.3 ms [19.0] | 17.5 ms [19.1] | 4.2 ms [5.0] |
| Key → title event (median of reps) | 1.6 ms | 1.6 ms [1.7] | 1.5 ms [1.6] |
| Wheel → changed frame (pooled) | 13.3 ms [22.8] | 12.5 ms [23.1] | 10.5 ms [11.8] |
| Image page navigate → painted | 208 ms [215] | 182 ms [224] | 189 ms [193] |
| DOM page navigate → painted | 443 ms [504] | 458 ms [491] | 415 ms [434] |
| Resize → frame at new size | 96 ms [106] | 97 ms [101] | 89 ms [93] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | |
| rAF fps, 1 MiB pipe | 58.7 [58.9] | — | — |
| rAF client read/frame, 1 MiB pipe | 13.79 ms [13.82] | — | — |
| Scroll fps, 1 MiB pipe | 59.9 [60.0] | — | — |
| Scroll CPU, 1 MiB pipe | 69 % [71] | — | — |
