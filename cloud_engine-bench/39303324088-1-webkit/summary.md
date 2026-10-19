# Engine bench summary — run 39303324088

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 34 ms | 35 ms [37] |
| Create → first frame (1×) | 359 ms [370] | 368 ms [376] |
| Create → painted frame (1×) | 359 ms [371] | 369 ms [376] |
| Navigate → painted frame (static, 1×) | 56 ms [57] | 57 ms |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 435 MB [437] | 433 MB [434] |
| PSS after create (host+helpers) | 306 MB [309] | 304 MB [306] |
| Close → host exit | 122 ms [126] | 172 ms [177] |
| Close → no helper left | 123 ms [126] | 172 ms [177] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 57.8 [58.2] | 58.0 [58.4] |
| rAF frame interval median | 17.3 ms [17.4] | 17.1 ms [17.4] |
| rAF frame interval p99 | 18.9 ms [19.2] | 18.7 ms [19.3] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 135 MB/s [136] | 136 MB/s [137] |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.62 ms [3.27] | 1.59 ms [3.43] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.213 |
| rAF CPU host+helpers | 61 % [63] | 64 % [67] |
| rAF RSS host+helpers | 442 MB [444] | 441 MB [442] |
| Scroll fps (wheel 60 Hz) | 57.6 [58.0] | 54.8 [55.4] |
| Scroll frame interval p99 | 19.2 ms [31.6] | 35.0 ms [35.3] |
| Scroll pipe throughput | 135 MB/s [136] | 128 MB/s [130] |
| Scroll CPU host+helpers | 64 % [65] | 64 % [65] |
| Scroll host damage share (damage run) | — | 0.988 |
| Image page scroll fps | 57.6 [58.0] | 57.0 [57.6] |
| DOM page scroll fps | 57.6 [57.8] | 54.4 [55.0] |
| Key → changed frame (pooled) | 7.4 ms [21.6] | 7.4 ms [23.5] |
| Key → title event (median of reps) | 1.3 ms | 1.3 ms |
| Wheel → changed frame (pooled) | 7.5 ms [22.2] | 7.5 ms [23.5] |
| Image page navigate → painted | 320 ms [325] | 319 ms [323] |
| DOM page navigate → painted | 415 ms [416] | 404 ms [408] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 58.0 | 58.0 [58.1] |
| rAF frame interval median | 17.2 ms [17.5] | 17.2 ms [17.3] |
| rAF frame interval p99 | 26.2 ms [27.0] | 26.1 ms [27.4] |
| rAF intervals > 25 ms | 0.021 [0.035] | 0.021 [0.031] |
| rAF pipe throughput | 543 MB/s | 543 MB/s [544] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 12.31 ms [12.77] | 12.63 ms [13.17] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.212 |
| rAF CPU host+helpers | 224 % [226] | 232 % |
| rAF RSS host+helpers | 600 MB [627] | 604 MB [634] |
| Scroll fps (wheel 60 Hz) | 57.4 [57.5] | 49.1 [50.6] |
| Scroll frame interval p99 | 30.8 ms [31.8] | 38.8 ms [41.6] |
| Scroll pipe throughput | 537 MB/s [538] | 460 MB/s [474] |
| Scroll CPU host+helpers | 227 % [229] | 224 % [226] |
| Scroll host damage share (damage run) | — | 0.987 [0.999] |
| Image page scroll fps | 48.9 [51.1] | 44.8 [46.6] |
| DOM page scroll fps | 57.4 [57.5] | 48.2 [50.3] |
| Key → changed frame (pooled) | 22.5 ms [26.2] | 23.1 ms [36.8] |
| Key → title event (median of reps) | 1.3 ms | 1.3 ms [1.4] |
| Wheel → changed frame (pooled) | 32.4 ms [42.0] | 29.8 ms [41.4] |
| Image page navigate → painted | 197 ms [199] | 198 ms [201] |
| DOM page navigate → painted | 466 ms [479] | 461 ms [466] |
| Resize → frame at new size | 258 ms [298] | 263 ms [309] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 58.0 [58.1] | — |
| rAF client read/frame, 1 MiB pipe | 5.20 ms [5.90] | — |
| Scroll fps, 1 MiB pipe | 57.7 [58.0] | — |
| Scroll CPU, 1 MiB pipe | 217 % [218] | — |
