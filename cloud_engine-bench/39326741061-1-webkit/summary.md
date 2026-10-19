# Engine bench summary — run 39326741061

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 35 ms [38] | 33 ms [39] |
| Create → first frame (1×) | 359 ms [364] | 355 ms [369] |
| Create → painted frame (1×) | 359 ms [364] | 355 ms [369] |
| Navigate → painted frame (static, 1×) | 56 ms | 56 ms [57] |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 398 MB [399] | 398 MB [400] |
| PSS after create (host+helpers) | 261 MB [265] | 262 MB [266] |
| Close → host exit | 129 ms [180] | 182 ms [186] |
| Close → no helper left | 130 ms [180] | 182 ms [186] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 58.0 [58.2] | 58.6 |
| rAF frame interval median | 17.2 ms [17.4] | 17.0 ms [17.1] |
| rAF frame interval p99 | 18.5 ms [18.6] | 18.3 ms [23.8] |
| rAF intervals > 25 ms | 0.000 [0.004] | 0.000 [0.003] |
| rAF pipe throughput | 136 MB/s | 137 MB/s |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.45 ms [3.25] | 1.37 ms [3.16] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.214 |
| rAF CPU host+helpers | 54 % [61] | 54 % [55] |
| rAF RSS host+helpers | 409 MB | 409 MB [412] |
| Scroll fps (wheel 60 Hz) | 57.8 [58.0] | 54.2 [54.8] |
| Scroll frame interval p99 | 24.3 ms [32.2] | 35.1 ms [35.2] |
| Scroll pipe throughput | 135 MB/s [136] | 127 MB/s [128] |
| Scroll CPU host+helpers | 58 % [63] | 53 % [54] |
| Scroll host damage share (damage run) | — | 0.988 [0.995] |
| Image page scroll fps | 57.8 | 57.0 [57.4] |
| DOM page scroll fps | 57.8 [58.0] | 55.2 [55.4] |
| Key → changed frame (pooled) | 7.3 ms [21.2] | 7.4 ms [21.4] |
| Key → title event (median of reps) | 1.2 ms [1.3] | 1.2 ms |
| Wheel → changed frame (pooled) | 7.4 ms [21.7] | 7.4 ms [22.0] |
| Image page navigate → painted | 319 ms [320] | 308 ms [320] |
| DOM page navigate → painted | 427 ms [455] | 417 ms [430] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 50.9 [53.1] | 49.5 [51.7] |
| rAF frame interval median | 18.0 ms [18.2] | 18.8 ms [19.9] |
| rAF frame interval p99 | 30.6 ms [33.1] | 31.0 ms [33.3] |
| rAF intervals > 25 ms | 0.126 [0.137] | 0.138 [0.174] |
| rAF pipe throughput | 477 MB/s [497] | 464 MB/s [484] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 16.15 ms [16.42] | 16.48 ms [16.72] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.210 [0.212] |
| rAF CPU host+helpers | 221 % [223] | 226 % [227] |
| rAF RSS host+helpers | 571 MB [576] | 577 MB [582] |
| Scroll fps (wheel 60 Hz) | 54.3 [56.6] | 48.0 [49.8] |
| Scroll frame interval p99 | 34.7 ms [36.7] | 36.9 ms [41.6] |
| Scroll pipe throughput | 509 MB/s [530] | 449 MB/s [466] |
| Scroll CPU host+helpers | 221 % [224] | 218 % [221] |
| Scroll host damage share (damage run) | — | 0.995 |
| Image page scroll fps | 41.7 [43.9] | 38.3 [40.1] |
| DOM page scroll fps | 51.8 [54.4] | 46.1 [46.8] |
| Key → changed frame (pooled) | 30.6 ms [41.7] | 32.9 ms [42.9] |
| Key → title event (median of reps) | 1.2 ms [1.3] | 1.2 ms |
| Wheel → changed frame (pooled) | 36.4 ms [46.4] | 31.6 ms [46.7] |
| Image page navigate → painted | 207 ms [216] | 203 ms [210] |
| DOM page navigate → painted | 475 ms [483] | 469 ms [471] |
| Resize → frame at new size | 255 ms [281] | 261 ms [270] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 56.5 [57.5] | — |
| rAF client read/frame, 1 MiB pipe | 13.85 ms [14.62] | — |
| Scroll fps, 1 MiB pipe | 56.6 [57.1] | — |
| Scroll CPU, 1 MiB pipe | 223 % [224] | — |
