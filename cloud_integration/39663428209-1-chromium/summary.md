# Engine bench summary — run 39663428209

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage+payload**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage | chromium+damage+payload |
| --- | --- | --- | --- |
| Spawn → ready | 211 ms [323] | 205 ms [214] | 206 ms [220] |
| Create → first frame (1×) | 141 ms [481] | 144 ms [169] | 146 ms [156] |
| Create → painted frame (1×) | 149 ms [482] | 145 ms [170] | 147 ms [158] |
| Navigate → painted frame (static, 1×) | 22 ms [23] | 23 ms [26] | 23 ms [24] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.50 |
| Processes after create | 10 | 10 | 10 |
| RSS after create (host+helpers) | 848 MB [851] | 849 MB [852] | 849 MB [850] |
| PSS after create (host+helpers) | — | — | — |
| Close → host exit | 88 ms [140] | 87 ms [139] | 84 ms [90] |
| Close → no helper left | 95 ms [147] | 95 ms [146] | 90 ms [98] |
| **1× (900×650 CSS px → 900×650 px)** | | | |
| rAF fps | 60.2 | 60.2 | 60.2 |
| rAF frame interval median | 16.6 ms [16.7] | 16.7 ms [16.8] | 16.6 ms [16.7] |
| rAF frame interval p99 | 17.8 ms [19.6] | 17.9 ms [18.5] | 17.8 ms [18.2] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 33 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 553408 B [553430] |
| rAF client read time/frame | 1.09 ms [3.20] | 1.09 ms [3.35] | 0.20 ms [0.21] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.236 [0.237] | 0.236 |
| rAF CPU host+helpers | 22 % [24] | 22 % [25] | 22 % [24] |
| rAF RSS host+helpers | 870 MB [876] | 870 MB [875] | 873 MB [876] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 |
| Scroll frame interval p99 | 17.8 ms [18.7] | 17.7 ms [18.7] | 17.8 ms [18.2] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 26 % [28] | 27 % [30] | 28 % [30] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 |
| Image page scroll fps | 60.2 | 60.2 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 | 60.2 |
| Key → changed frame (pooled) | 4.4 ms [6.5] | 4.4 ms [6.7] | 3.1 ms [3.6] |
| Key → title event (median of reps) | 1.6 ms [1.7] | 1.6 ms | 1.6 ms |
| Wheel → changed frame (pooled) | 11.2 ms [12.9] | 11.3 ms [13.2] | 11.2 ms [12.1] |
| Image page navigate → painted | 160 ms [165] | 164 ms [168] | 161 ms [163] |
| DOM page navigate → painted | 381 ms [393] | 353 ms [400] | 383 ms [396] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | |
| rAF fps | 60.1 | 60.1 | 60.2 |
| rAF frame interval median | 16.6 ms [16.7] | 16.7 ms | 16.7 ms |
| rAF frame interval p99 | 18.0 ms [19.8] | 18.5 ms [20.1] | 19.2 ms [19.7] |
| rAF intervals > 25 ms | 0.000 | 0.000 [0.003] | 0.000 [0.003] |
| rAF pipe throughput | 562 MB/s [563] | 562 MB/s | 133 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B | 2216193 B |
| rAF client read time/frame | 12.96 ms [13.18] | 13.34 ms [13.41] | 0.85 ms [0.95] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | — |
| rAF host damage share (damage run) | — | 0.237 | 0.237 |
| rAF CPU host+helpers | 42 % [43] | 43 % [45] | 33 % [35] |
| rAF RSS host+helpers | 1232 MB [1274] | 1246 MB [1264] | 1234 MB [1266] |
| Scroll fps (wheel 60 Hz) | 59.6 [59.8] | 59.7 [59.8] | 60.2 |
| Scroll frame interval p99 | 27.9 ms [29.1] | 26.5 ms [28.6] | 22.6 ms [25.4] |
| Scroll pipe throughput | 558 MB/s [560] | 559 MB/s [560] | 563 MB/s |
| Scroll CPU host+helpers | 78 % [80] | 81 % [82] | 74 % [77] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 |
| Image page scroll fps | 59.8 | 59.4 [59.6] | 60.0 [60.2] |
| DOM page scroll fps | 59.9 [60.0] | 59.6 [60.1] | 60.2 |
| Key → changed frame (pooled) | 15.5 ms [18.2] | 15.4 ms [18.7] | 4.2 ms [4.9] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.6 ms [1.7] | 1.6 ms |
| Wheel → changed frame (pooled) | 11.5 ms [21.5] | 12.2 ms [22.1] | 10.5 ms [11.8] |
| Image page navigate → painted | 206 ms [212] | 180 ms [213] | 186 ms [194] |
| DOM page navigate → painted | 426 ms [508] | 444 ms [473] | 429 ms [468] |
| Resize → frame at new size | 94 ms [106] | 103 ms | 93 ms [104] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | |
| rAF fps, 1 MiB pipe | 58.9 [59.1] | — | — |
| rAF client read/frame, 1 MiB pipe | 13.22 ms [13.30] | — | — |
| Scroll fps, 1 MiB pipe | 59.9 [60.0] | — | — |
| Scroll CPU, 1 MiB pipe | 68 % [70] | — | — |
