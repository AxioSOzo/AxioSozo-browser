# Engine bench summary — run 39301948003

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium+damage |
| --- | --- |
| Spawn → ready | 169 ms [1070] |
| Create → first frame (1×) | 158 ms [163] |
| Create → painted frame (1×) | 159 ms [164] |
| Navigate → painted frame (static, 1×) | 25 ms [26] |
| Idle frames/s (static page) | 0.50 |
| Processes after create | 11 |
| RSS after create (host+helpers) | 761 MB [767] |
| PSS after create (host+helpers) | — |
| Close → host exit | 90 ms |
| Close → no helper left | 96 ms [97] |
| **1× (900×650 CSS px → 900×650 px)** | |
| rAF fps | 60.2 |
| rAF frame interval median | 16.7 ms |
| rAF frame interval p99 | 17.6 ms [17.9] |
| rAF intervals > 25 ms | 0.000 |
| rAF pipe throughput | 141 MB/s |
| rAF bytes/frame | 2340369 B |
| rAF client read time/frame | 1.98 ms [4.17] |
| rAF changed-row band (share of frame) | 0.423 |
| rAF host damage share (damage run) | 0.236 [0.237] |
| rAF CPU host+helpers | 27 % [29] |
| rAF RSS host+helpers | 791 MB [794] |
| Scroll fps (wheel 60 Hz) | 60.2 |
| Scroll frame interval p99 | 17.8 ms [18.1] |
| Scroll pipe throughput | 141 MB/s |
| Scroll CPU host+helpers | 32 % [34] |
| Scroll host damage share (damage run) | 1.000 |
| Image page scroll fps | 60.2 |
| DOM page scroll fps | 60.2 |
| Key → changed frame (pooled) | 5.3 ms [7.7] |
| Key → title event (median of reps) | 1.6 ms [1.7] |
| Wheel → changed frame (pooled) | 10.5 ms [12.2] |
| Image page navigate → painted | 166 ms [170] |
| DOM page navigate → painted | 367 ms [395] |
| Resize → frame at new size | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | |
| rAF fps | 53.3 [53.9] |
| rAF frame interval median | 18.6 ms [18.8] |
| rAF frame interval p99 | 21.6 ms [22.7] |
| rAF intervals > 25 ms | 0.000 [0.004] |
| rAF pipe throughput | 499 MB/s [505] |
| rAF bytes/frame | 9360375 B |
| rAF client read time/frame | 17.24 ms [17.41] |
| rAF changed-row band (share of frame) | 0.424 |
| rAF host damage share (damage run) | 0.237 [0.238] |
| rAF CPU host+helpers | 54 % [55] |
| rAF RSS host+helpers | 1187 MB [1226] |
| Scroll fps (wheel 60 Hz) | 54.6 [56.3] |
| Scroll frame interval p99 | 26.3 ms [28.3] |
| Scroll pipe throughput | 511 MB/s [527] |
| Scroll CPU host+helpers | 93 % [96] |
| Scroll host damage share (damage run) | 1.000 |
| Image page scroll fps | 50.6 [50.9] |
| DOM page scroll fps | 53.2 [54.9] |
| Key → changed frame (pooled) | 19.1 ms [23.2] |
| Key → title event (median of reps) | 1.7 ms |
| Wheel → changed frame (pooled) | 16.3 ms [25.2] |
| Image page navigate → painted | 219 ms [224] |
| DOM page navigate → painted | 461 ms [532] |
| Resize → frame at new size | 101 ms [109] |
