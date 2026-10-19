# Engine bench summary — run 39301948003

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, INTEL(R) XEON(R) PLATINUM 8573C × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, INTEL(R) XEON(R) PLATINUM 8573C × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 38 ms [39] | 37 ms [38] |
| Create → first frame (1×) | 373 ms [374] | 361 ms [388] |
| Create → painted frame (1×) | 374 ms [375] | 361 ms [388] |
| Navigate → painted frame (static, 1×) | 58 ms | 58 ms [59] |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 394 MB [398] | 401 MB |
| PSS after create (host+helpers) | 258 MB [259] | 266 MB [267] |
| Close → host exit | 128 ms [130] | 174 ms [184] |
| Close → no helper left | 128 ms [130] | 174 ms [185] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 58.4 [58.6] | 57.6 [58.0] |
| rAF frame interval median | 17.0 ms [17.1] | 17.3 ms [17.4] |
| rAF frame interval p99 | 18.5 ms [18.8] | 18.6 ms [19.4] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 137 MB/s | 135 MB/s [136] |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.67 ms [3.27] | 1.70 ms [3.59] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.212 [0.213] |
| rAF CPU host+helpers | 53 % [54] | 56 % [58] |
| rAF RSS host+helpers | 404 MB [407] | 412 MB |
| Scroll fps (wheel 60 Hz) | 58.4 | 55.2 [56.0] |
| Scroll frame interval p99 | 18.8 ms [32.0] | 34.8 ms |
| Scroll pipe throughput | 137 MB/s | 129 MB/s [131] |
| Scroll CPU host+helpers | 56 % [57] | 57 % [59] |
| Scroll host damage share (damage run) | — | 0.988 [0.996] |
| Image page scroll fps | 57.6 | 57.2 [57.4] |
| DOM page scroll fps | 58.2 [58.4] | 54.4 [55.6] |
| Key → changed frame (pooled) | 7.5 ms [23.7] | 19.6 ms [24.0] |
| Key → title event (median of reps) | 1.1 ms [1.3] | 1.2 ms [1.3] |
| Wheel → changed frame (pooled) | 7.9 ms [23.9] | 20.7 ms [24.0] |
| Image page navigate → painted | 389 ms [402] | 401 ms [403] |
| DOM page navigate → painted | 445 ms [452] | 451 ms [464] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 55.5 [56.5] | 52.7 [55.1] |
| rAF frame interval median | 17.5 ms [18.5] | 17.9 ms [19.8] |
| rAF frame interval p99 | 29.6 ms [34.4] | 32.0 ms [33.7] |
| rAF intervals > 25 ms | 0.058 [0.162] | 0.110 [0.193] |
| rAF pipe throughput | 519 MB/s [529] | 493 MB/s [516] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 16.07 ms [16.73] | 16.26 ms [17.60] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.212 [0.214] |
| rAF CPU host+helpers | 197 % [208] | 206 % [222] |
| rAF RSS host+helpers | 600 MB [604] | 605 MB [618] |
| Scroll fps (wheel 60 Hz) | 54.0 [55.3] | 47.5 [49.5] |
| Scroll frame interval p99 | 33.2 ms [34.6] | 39.1 ms [42.3] |
| Scroll pipe throughput | 505 MB/s [517] | 444 MB/s [463] |
| Scroll CPU host+helpers | 196 % [211] | 198 % [216] |
| Scroll host damage share (damage run) | — | 0.991 [0.994] |
| Image page scroll fps | 42.4 [45.5] | 40.4 [44.0] |
| DOM page scroll fps | 53.2 [55.7] | 45.1 [47.1] |
| Key → changed frame (pooled) | 35.2 ms [43.7] | 38.8 ms [44.7] |
| Key → title event (median of reps) | 1.2 ms [1.4] | 1.1 ms [1.3] |
| Wheel → changed frame (pooled) | 39.6 ms [51.3] | 38.1 ms [51.3] |
| Image page navigate → painted | 274 ms [292] | 273 ms [290] |
| DOM page navigate → painted | 487 ms [514] | 493 ms [510] |
| Resize → frame at new size | 307 ms [333] | 308 ms [336] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 58.0 | — |
| rAF client read/frame, 1 MiB pipe | 15.22 ms [15.32] | — |
| Scroll fps, 1 MiB pipe | 56.9 [57.5] | — |
| Scroll CPU, 1 MiB pipe | 201 % [216] | — |
