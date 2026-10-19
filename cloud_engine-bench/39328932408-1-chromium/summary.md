# Engine bench summary — run 39328932408

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']

| Metric | chromium | chromium+damage |
| --- | --- | --- |
| Spawn → ready | 198 ms [671] | 192 ms [203] |
| Create → first frame (1×) | 138 ms [3285] | 140 ms [153] |
| Create → painted frame (1×) | 139 ms [3285] | 141 ms [165] |
| Navigate → painted frame (static, 1×) | 22 ms [26] | 22 ms [25] |
| Idle frames/s (static page) | 0.50 [1.00] | 0.50 |
| Processes after create | 10 | 10 |
| RSS after create (host+helpers) | 847 MB [851] | 844 MB [849] |
| PSS after create (host+helpers) | — | — |
| Close → host exit | 83 ms [86] | 129 ms [137] |
| Close → no helper left | 89 ms [92] | 135 ms [142] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 60.2 | 60.2 |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms |
| rAF frame interval p99 | 18.0 ms [18.1] | 18.1 ms [18.6] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B |
| rAF client read time/frame | 1.85 ms [3.74] | 1.92 ms [3.81] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 |
| rAF CPU host+helpers | 21 % [24] | 22 % |
| rAF RSS host+helpers | 868 MB [873] | 867 MB [873] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 |
| Scroll frame interval p99 | 17.9 ms [18.1] | 18.0 ms [18.1] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s |
| Scroll CPU host+helpers | 27 % [28] | 27 % [28] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 60.2 | 60.2 |
| DOM page scroll fps | 60.2 | 60.2 |
| Key → changed frame (pooled) | 5.0 ms [6.8] | 5.0 ms [6.6] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms |
| Wheel → changed frame (pooled) | 11.2 ms [12.8] | 11.2 ms [12.5] |
| Image page navigate → painted | 153 ms [156] | 157 ms [162] |
| DOM page navigate → painted | 342 ms [353] | 340 ms [354] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 60.1 [60.2] | 60.0 [60.1] |
| rAF frame interval median | 16.6 ms | 16.7 ms [16.8] |
| rAF frame interval p99 | 20.4 ms [20.6] | 20.0 ms [20.4] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 563 MB/s | 562 MB/s |
| rAF bytes/frame | 9360347 B | 9360375 B |
| rAF client read time/frame | 9.02 ms [9.11] | 9.11 ms [9.21] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 |
| rAF host damage share (damage run) | — | 0.237 |
| rAF CPU host+helpers | 49 % [50] | 48 % [51] |
| rAF RSS host+helpers | 1262 MB [1282] | 1273 MB [1291] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.1 |
| Scroll frame interval p99 | 24.1 ms [25.5] | 24.2 ms [26.0] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s |
| Scroll CPU host+helpers | 78 % [80] | 80 % [81] |
| Scroll host damage share (damage run) | — | 1.000 |
| Image page scroll fps | 59.9 [60.1] | 59.9 [60.0] |
| DOM page scroll fps | 60.1 [60.2] | 60.0 [60.2] |
| Key → changed frame (pooled) | 12.6 ms [14.2] | 12.8 ms [14.4] |
| Key → title event (median of reps) | 1.5 ms [1.7] | 1.5 ms [1.6] |
| Wheel → changed frame (pooled) | 11.3 ms [16.0] | 11.8 ms [16.1] |
| Image page navigate → painted | 186 ms [195] | 140 ms [189] |
| DOM page navigate → painted | 408 ms [444] | 418 ms [455] |
| Resize → frame at new size | 87 ms [93] | 90 ms [98] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 59.2 [59.4] | — |
| rAF client read/frame, 1 MiB pipe | 6.15 ms [6.25] | — |
| Scroll fps, 1 MiB pipe | 60.0 [60.1] | — |
| Scroll CPU, 1 MiB pipe | 61 % [62] | — |
