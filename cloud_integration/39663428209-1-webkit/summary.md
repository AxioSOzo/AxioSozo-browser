# Engine bench summary — run 39663428209

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage+payload**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage | webkit+damage+payload |
| --- | --- | --- | --- |
| Spawn → ready | 40 ms [45] | 42 ms [45] | 42 ms [44] |
| Create → first frame (1×) | 462 ms [479] | 460 ms [463] | 475 ms [491] |
| Create → painted frame (1×) | 462 ms [479] | 461 ms [464] | 476 ms [492] |
| Navigate → painted frame (static, 1×) | 56 ms [57] | 57 ms | 55 ms [56] |
| Idle frames/s (static page) | 0.00 | 0.00 | 0.00 |
| Processes after create | 5 | 5 | 5 |
| RSS after create (host+helpers) | 402 MB [406] | 408 MB [409] | 404 MB [408] |
| PSS after create (host+helpers) | 267 MB [270] | 273 MB [274] | 267 MB [273] |
| Close → host exit | 130 ms [184] | 181 ms [183] | 173 ms [175] |
| Close → no helper left | 131 ms [185] | 182 ms [184] | 173 ms [175] |
| **1× (900×650 CSS px → 900×650 px)** | | | |
| rAF fps | 58.1 [58.2] | 57.8 [58.0] | 58.0 |
| rAF frame interval median | 17.2 ms | 17.4 ms [17.5] | 17.3 ms |
| rAF frame interval p99 | 18.4 ms [18.8] | 18.5 ms [18.7] | 18.2 ms [18.8] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 136 MB/s | 135 MB/s [136] | 29 MB/s |
| rAF bytes/frame | 2340341 B | 2340368 B | 497849 B |
| rAF client read time/frame | 0.92 ms [2.99] | 0.94 ms [3.01] | 0.15 ms [0.23] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.212 [0.213] | 0.213 |
| rAF CPU host+helpers | 59 % [60] | 62 % [64] | 57 % [59] |
| rAF RSS host+helpers | 410 MB [414] | 416 MB [417] | 413 MB [417] |
| Scroll fps (wheel 60 Hz) | 58.0 [58.2] | 54.4 [55.2] | 54.8 [55.2] |
| Scroll frame interval p99 | 19.7 ms [32.7] | 34.7 ms [34.8] | 34.7 ms [34.8] |
| Scroll pipe throughput | 136 MB/s | 127 MB/s [129] | 127 MB/s [128] |
| Scroll CPU host+helpers | 61 % [63] | 62 % | 63 % [64] |
| Scroll host damage share (damage run) | — | 0.985 [0.995] | 0.992 [0.996] |
| Image page scroll fps | 58.0 [58.2] | 57.2 [57.8] | 57.6 [57.8] |
| DOM page scroll fps | 58.2 | 54.0 [55.0] | 53.8 [55.2] |
| Key → changed frame (pooled) | 7.4 ms [21.3] | 7.5 ms [23.3] | 7.2 ms [8.3] |
| Key → title event (median of reps) | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.3 ms [1.4] |
| Wheel → changed frame (pooled) | 7.4 ms [22.5] | 7.5 ms [23.6] | 7.3 ms [21.4] |
| Image page navigate → painted | 369 ms [374] | 369 ms [370] | 370 ms [383] |
| DOM page navigate → painted | 537 ms [548] | 547 ms [552] | 538 ms [552] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | |
| rAF fps | 54.2 [55.4] | 52.3 [52.7] | 58.2 [58.4] |
| rAF frame interval median | 17.3 ms [17.4] | 18.6 ms [19.3] | 17.1 ms |
| rAF frame interval p99 | 28.5 ms [29.3] | 27.9 ms [30.9] | 19.7 ms [21.3] |
| rAF intervals > 25 ms | 0.033 [0.053] | 0.034 [0.043] | 0.000 [0.003] |
| rAF pipe throughput | 507 MB/s [518] | 490 MB/s [493] | 116 MB/s |
| rAF bytes/frame | 9360346 B | 9360374 B | 1989675 B [1992022] |
| rAF client read time/frame | 15.89 ms [15.98] | 15.70 ms [15.89] | 1.38 ms [1.41] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 | — |
| rAF host damage share (damage run) | — | 0.209 [0.211] | 0.212 [0.213] |
| rAF CPU host+helpers | 230 % [231] | 232 % [235] | 227 % [228] |
| rAF RSS host+helpers | 580 MB [583] | 583 MB [592] | 582 MB [585] |
| Scroll fps (wheel 60 Hz) | 54.5 [54.7] | 49.9 [50.1] | 52.1 [52.8] |
| Scroll frame interval p99 | 26.9 ms [29.5] | 35.3 ms [38.6] | 37.6 ms [40.8] |
| Scroll pipe throughput | 510 MB/s [512] | 467 MB/s [469] | 478 MB/s [492] |
| Scroll CPU host+helpers | 234 % | 233 % [234] | 235 % [237] |
| Scroll host damage share (damage run) | — | 0.999 | 0.984 [0.995] |
| Image page scroll fps | 40.9 [42.0] | 38.7 [44.0] | 42.1 [43.2] |
| DOM page scroll fps | 53.8 [54.8] | 50.6 [51.0] | 51.8 [53.0] |
| Key → changed frame (pooled) | 30.2 ms [42.3] | 36.0 ms [42.9] | 22.5 ms [24.2] |
| Key → title event (median of reps) | 1.4 ms | 1.3 ms [1.4] | 1.4 ms |
| Wheel → changed frame (pooled) | 38.4 ms [48.5] | 33.2 ms [47.3] | 27.0 ms [37.3] |
| Image page navigate → painted | 239 ms [241] | 222 ms [232] | 218 ms [222] |
| DOM page navigate → painted | 586 ms [596] | 577 ms [606] | 576 ms [585] |
| Resize → frame at new size | 310 ms [314] | 314 ms [319] | 312 ms [313] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | |
| rAF fps, 1 MiB pipe | 54.1 [55.2] | — | — |
| rAF client read/frame, 1 MiB pipe | 15.87 ms [15.92] | — | — |
| Scroll fps, 1 MiB pipe | 54.3 [54.8] | — | — |
| Scroll CPU, 1 MiB pipe | 232 % [234] | — | — |
