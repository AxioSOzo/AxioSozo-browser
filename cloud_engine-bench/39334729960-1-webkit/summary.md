# Engine bench summary — run 39334729960

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 35 ms [43] | 35 ms [43] |
| Create → first frame (1×) | 366 ms [383] | 366 ms [379] |
| Create → painted frame (1×) | 366 ms [384] | 367 ms [380] |
| Navigate → painted frame (static, 1×) | 56 ms | 56 ms [57] |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 398 MB | 399 MB [400] |
| PSS after create (host+helpers) | 260 MB [262] | 263 MB [266] |
| Close → host exit | 129 ms [180] | 182 ms [183] |
| Close → no helper left | 129 ms [181] | 183 ms |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 58.1 [58.4] | 58.2 [58.4] |
| rAF frame interval median | 17.2 ms [17.5] | 17.1 ms |
| rAF frame interval p99 | 18.4 ms [20.8] | 18.9 ms [19.3] |
| rAF intervals > 25 ms | 0.000 [0.004] | 0.000 [0.003] |
| rAF pipe throughput | 136 MB/s [137] | 136 MB/s [137] |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.47 ms [3.32] | 1.53 ms [3.22] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.213 |
| rAF CPU host+helpers | 52 % [60] | 64 % [65] |
| rAF RSS host+helpers | 408 MB [409] | 408 MB [411] |
| Scroll fps (wheel 60 Hz) | 58.0 [58.2] | 54.6 [55.2] |
| Scroll frame interval p99 | 24.0 ms [31.7] | 35.0 ms [35.3] |
| Scroll pipe throughput | 136 MB/s | 128 MB/s [129] |
| Scroll CPU host+helpers | 56 % [61] | 65 % |
| Scroll host damage share (damage run) | — | 0.988 [0.992] |
| Image page scroll fps | 57.6 [57.8] | 57.4 [57.6] |
| DOM page scroll fps | 58.0 [58.2] | 55.2 [55.4] |
| Key → changed frame (pooled) | 7.3 ms [21.6] | 7.3 ms [23.4] |
| Key → title event (median of reps) | 1.2 ms [1.3] | 1.3 ms |
| Wheel → changed frame (pooled) | 7.4 ms [21.8] | 7.4 ms [22.4] |
| Image page navigate → painted | 321 ms [322] | 320 ms [324] |
| DOM page navigate → painted | 423 ms [436] | 444 ms [470] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 51.9 [53.5] | 48.5 [50.5] |
| rAF frame interval median | 17.9 ms [18.6] | 19.1 ms [20.1] |
| rAF frame interval p99 | 30.7 ms [33.2] | 32.7 ms [34.1] |
| rAF intervals > 25 ms | 0.124 [0.142] | 0.182 [0.208] |
| rAF pipe throughput | 486 MB/s [500] | 454 MB/s [472] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 16.23 ms [16.59] | 16.75 ms [17.06] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.209 [0.215] |
| rAF CPU host+helpers | 221 % [222] | 227 % [228] |
| rAF RSS host+helpers | 568 MB [574] | 583 MB [584] |
| Scroll fps (wheel 60 Hz) | 55.4 [55.6] | 46.7 [48.8] |
| Scroll frame interval p99 | 31.2 ms [32.5] | 40.2 ms [46.9] |
| Scroll pipe throughput | 518 MB/s [521] | 437 MB/s [456] |
| Scroll CPU host+helpers | 221 % [223] | 223 % [226] |
| Scroll host damage share (damage run) | — | 0.991 [0.995] |
| Image page scroll fps | 42.1 [43.0] | 37.4 [38.5] |
| DOM page scroll fps | 54.1 [55.7] | 45.7 [46.6] |
| Key → changed frame (pooled) | 30.1 ms [41.9] | 32.6 ms [44.0] |
| Key → title event (median of reps) | 1.3 ms | 1.3 ms |
| Wheel → changed frame (pooled) | 36.8 ms [46.6] | 34.1 ms [46.5] |
| Image page navigate → painted | 206 ms [224] | 198 ms [224] |
| DOM page navigate → painted | 477 ms [505] | 481 ms [504] |
| Resize → frame at new size | 262 ms [264] | 280 ms [283] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 56.9 [57.0] | — |
| rAF client read/frame, 1 MiB pipe | 13.60 ms [14.49] | — |
| Scroll fps, 1 MiB pipe | 56.5 [57.0] | — |
| Scroll CPU, 1 MiB pipe | 224 % [226] | — |
