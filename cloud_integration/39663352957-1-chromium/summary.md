# Engine bench summary — run 39663352957

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage+payload**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage | chromium+damage+payload |
| --- | --- | --- | --- |
| Spawn → ready | 202 ms [557] | 205 ms [207] | 198 ms [205] |
| Create → first frame (1×) | 136 ms [447] | 130 ms [142] | 135 ms [142] |
| Create → painted frame (1×) | 138 ms [448] | 131 ms [142] | 138 ms [143] |
| Navigate → painted frame (static, 1×) | 21 ms [22] | 24 ms | 21 ms [24] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.50 |
| Processes after create | 10 | 10 | 10 |
| RSS after create (host+helpers) | 846 MB [847] | 844 MB [846] | 841 MB [847] |
| PSS after create (host+helpers) | — | — | — |
| Close → host exit | 82 ms [83] | 83 ms [132] | 81 ms [88] |
| Close → no helper left | 89 ms [91] | 90 ms [138] | 87 ms [95] |
| **1× (900×650 CSS px → 900×650 px)** | | | |
| rAF fps | 60.2 | 60.2 | 60.2 |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms | 16.6 ms [16.8] |
| rAF frame interval p99 | 17.7 ms [17.9] | 17.7 ms [17.9] | 17.6 ms [17.9] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 33 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 553408 B |
| rAF client read time/frame | 0.97 ms [1.21] | 1.00 ms [3.04] | 0.19 ms [0.20] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.236 | 0.236 |
| rAF CPU host+helpers | 21 % [22] | 22 % [24] | 20 % |
| rAF RSS host+helpers | 864 MB [873] | 868 MB [874] | 866 MB [872] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 |
| Scroll frame interval p99 | 17.6 ms [17.9] | 17.6 ms [17.8] | 17.7 ms [17.8] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 26 % [27] | 26 % [32] | 27 % |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 |
| Image page scroll fps | 60.0 [60.2] | 60.2 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 | 60.2 |
| Key → changed frame (pooled) | 4.2 ms [6.4] | 4.3 ms [6.2] | 3.1 ms [3.8] |
| Key → title event (median of reps) | 1.6 ms | 1.6 ms | 1.6 ms |
| Wheel → changed frame (pooled) | 11.2 ms [13.1] | 11.3 ms [13.0] | 11.1 ms [12.3] |
| Image page navigate → painted | 158 ms [160] | 161 ms [163] | 159 ms [162] |
| DOM page navigate → painted | 344 ms [348] | 355 ms [416] | 344 ms [348] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | |
| rAF fps | 60.1 [60.2] | 60.1 [60.2] | 60.2 |
| rAF frame interval median | 16.7 ms | 16.7 ms | 16.7 ms |
| rAF frame interval p99 | 17.7 ms [17.9] | 17.9 ms | 18.0 ms [18.1] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 563 MB/s | 563 MB/s | 133 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B | 2213155 B [2216193] |
| rAF client read time/frame | 6.10 ms [6.14] | 6.06 ms [6.19] | 0.80 ms [0.84] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | — |
| rAF host damage share (damage run) | — | 0.236 [0.237] | 0.236 [0.237] |
| rAF CPU host+helpers | 42 % [43] | 41 % [43] | 32 % [34] |
| rAF RSS host+helpers | 1259 MB [1280] | 1266 MB [1298] | 1262 MB [1268] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 60.2 |
| Scroll frame interval p99 | 21.9 ms [28.2] | 21.7 ms [25.2] | 19.1 ms [23.0] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s | 563 MB/s |
| Scroll CPU host+helpers | 72 % | 71 % [72] | 72 % [74] |
| Scroll host damage share (damage run) | — | 1.000 | 1.000 |
| Image page scroll fps | 60.0 [60.1] | 60.0 [60.1] | 60.0 |
| DOM page scroll fps | 60.0 [60.1] | 60.0 [60.2] | 60.1 [60.2] |
| Key → changed frame (pooled) | 8.9 ms [10.2] | 9.5 ms [10.7] | 3.9 ms [4.6] |
| Key → title event (median of reps) | 1.6 ms | 1.5 ms [1.6] | 1.5 ms [1.6] |
| Wheel → changed frame (pooled) | 11.3 ms [13.2] | 11.4 ms [13.5] | 10.7 ms [11.6] |
| Image page navigate → painted | 182 ms [185] | 181 ms [183] | 180 ms [181] |
| DOM page navigate → painted | 375 ms [414] | 418 ms [458] | 396 ms [457] |
| Resize → frame at new size | 88 ms [95] | 85 ms [91] | 82 ms [85] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | |
| rAF fps, 1 MiB pipe | 59.2 [60.0] | — | — |
| rAF client read/frame, 1 MiB pipe | 6.15 ms [6.16] | — | — |
| Scroll fps, 1 MiB pipe | 60.1 [60.2] | — | — |
| Scroll CPU, 1 MiB pipe | 62 % [64] | — | — |
