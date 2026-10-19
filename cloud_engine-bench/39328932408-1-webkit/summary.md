# Engine bench summary — run 39328932408

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 42 ms [43] | 41 ms |
| Create → first frame (1×) | 420 ms [439] | 428 ms [442] |
| Create → painted frame (1×) | 420 ms [440] | 428 ms [443] |
| Navigate → painted frame (static, 1×) | 58 ms | 57 ms |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 438 MB | 439 MB [440] |
| PSS after create (host+helpers) | 310 MB [311] | 310 MB [312] |
| Close → host exit | 123 ms [167] | 176 ms |
| Close → no helper left | 124 ms [168] | 176 ms |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 58.0 [58.2] | 57.8 |
| rAF frame interval median | 17.2 ms [17.4] | 17.4 ms |
| rAF frame interval p99 | 18.4 ms [18.9] | 18.8 ms [18.9] |
| rAF intervals > 25 ms | 0.000 [0.004] | 0.000 |
| rAF pipe throughput | 136 MB/s | 135 MB/s |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.93 ms [3.72] | 1.92 ms [2.34] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.212 [0.213] |
| rAF CPU host+helpers | 62 % [69] | 62 % [65] |
| rAF RSS host+helpers | 444 MB [445] | 446 MB |
| Scroll fps (wheel 60 Hz) | 58.2 | 55.8 [56.4] |
| Scroll frame interval p99 | 31.0 ms [32.5] | 34.5 ms [34.9] |
| Scroll pipe throughput | 136 MB/s | 131 MB/s [132] |
| Scroll CPU host+helpers | 63 % [68] | 64 % [66] |
| Scroll host damage share (damage run) | — | 0.992 [0.999] |
| Image page scroll fps | 57.6 [58.0] | 57.6 [57.8] |
| DOM page scroll fps | 58.0 [58.2] | 55.8 [57.2] |
| Key → changed frame (pooled) | 7.5 ms [22.3] | 7.5 ms [18.3] |
| Key → title event (median of reps) | 1.3 ms [1.5] | 1.2 ms [1.3] |
| Wheel → changed frame (pooled) | 7.6 ms [23.5] | 7.5 ms [22.3] |
| Image page navigate → painted | 357 ms [369] | 357 ms [368] |
| DOM page navigate → painted | 498 ms [507] | 487 ms [494] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 58.0 [58.1] | 57.7 [58.0] |
| rAF frame interval median | 17.4 ms | 17.2 ms [17.3] |
| rAF frame interval p99 | 26.6 ms [27.8] | 27.0 ms [27.5] |
| rAF intervals > 25 ms | 0.038 [0.048] | 0.052 [0.056] |
| rAF pipe throughput | 543 MB/s [544] | 540 MB/s [543] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 13.79 ms [14.95] | 10.65 ms [14.33] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.212 |
| rAF CPU host+helpers | 238 % [239] | 243 % [246] |
| rAF RSS host+helpers | 600 MB [632] | 604 MB [609] |
| Scroll fps (wheel 60 Hz) | 57.0 [57.3] | 48.5 [50.1] |
| Scroll frame interval p99 | 31.1 ms [35.2] | 39.5 ms [40.1] |
| Scroll pipe throughput | 533 MB/s [537] | 454 MB/s [469] |
| Scroll CPU host+helpers | 237 % [239] | 235 % |
| Scroll host damage share (damage run) | — | 0.983 [0.991] |
| Image page scroll fps | 45.6 [46.1] | 43.0 [45.1] |
| DOM page scroll fps | 56.9 [57.0] | 48.2 [48.9] |
| Key → changed frame (pooled) | 24.2 ms [38.5] | 36.5 ms [40.1] |
| Key → title event (median of reps) | 1.3 ms [1.4] | 1.3 ms |
| Wheel → changed frame (pooled) | 32.7 ms [42.8] | 33.4 ms [43.6] |
| Image page navigate → painted | 218 ms [220] | 208 ms [216] |
| DOM page navigate → painted | 560 ms [571] | 559 ms [566] |
| Resize → frame at new size | 291 ms [338] | 282 ms [291] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 58.0 | — |
| rAF client read/frame, 1 MiB pipe | 8.83 ms [8.97] | — |
| Scroll fps, 1 MiB pipe | 57.6 [57.8] | — |
| Scroll CPU, 1 MiB pipe | 226 % [229] | — |
