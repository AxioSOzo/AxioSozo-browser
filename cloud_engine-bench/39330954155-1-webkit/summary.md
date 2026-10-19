# Engine bench summary — run 39330954155

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 41 ms [43] | 47 ms [49] |
| Create → first frame (1×) | 435 ms [456] | 448 ms [458] |
| Create → painted frame (1×) | 436 ms [457] | 448 ms [459] |
| Navigate → painted frame (static, 1×) | 58 ms | 58 ms |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 398 MB [399] | 400 MB [401] |
| PSS after create (host+helpers) | 263 MB [264] | 266 MB |
| Close → host exit | 132 ms [181] | 182 ms [185] |
| Close → no helper left | 133 ms [182] | 183 ms [186] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 58.0 [58.6] | 57.8 [58.0] |
| rAF frame interval median | 17.3 ms | 17.4 ms |
| rAF frame interval p99 | 18.6 ms [19.0] | 18.6 ms [18.8] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 136 MB/s [137] | 135 MB/s [136] |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.90 ms [3.87] | 1.89 ms [4.02] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.212 [0.213] |
| rAF CPU host+helpers | 62 % [72] | 68 % [71] |
| rAF RSS host+helpers | 407 MB [409] | 410 MB [411] |
| Scroll fps (wheel 60 Hz) | 58.0 [58.2] | 54.6 [54.8] |
| Scroll frame interval p99 | 21.1 ms [32.4] | 35.1 ms [35.2] |
| Scroll pipe throughput | 136 MB/s | 128 MB/s |
| Scroll CPU host+helpers | 68 % [76] | 65 % [76] |
| Scroll host damage share (damage run) | — | 0.988 [0.999] |
| Image page scroll fps | 58.0 [58.4] | 57.4 [57.6] |
| DOM page scroll fps | 57.8 [58.2] | 54.2 [54.6] |
| Key → changed frame (pooled) | 7.7 ms [23.9] | 22.8 ms [23.9] |
| Key → title event (median of reps) | 1.4 ms [1.6] | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 7.7 ms [24.1] | 9.4 ms [24.0] |
| Image page navigate → painted | 388 ms [401] | 383 ms [400] |
| DOM page navigate → painted | 554 ms [574] | 552 ms [576] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 46.1 [47.4] | 43.7 [46.9] |
| rAF frame interval median | 19.2 ms [22.3] | 20.1 ms [23.3] |
| rAF frame interval p99 | 36.3 ms [39.8] | 37.6 ms [38.1] |
| rAF intervals > 25 ms | 0.209 [0.375] | 0.248 [0.423] |
| rAF pipe throughput | 432 MB/s [444] | 409 MB/s [439] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 17.33 ms [19.00] | 17.99 ms [19.34] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.208 [0.210] |
| rAF CPU host+helpers | 233 % [240] | 241 % [242] |
| rAF RSS host+helpers | 575 MB [582] | 583 MB [585] |
| Scroll fps (wheel 60 Hz) | 42.0 [45.1] | 41.3 [42.2] |
| Scroll frame interval p99 | 37.2 ms [38.7] | 38.4 ms [42.6] |
| Scroll pipe throughput | 393 MB/s [422] | 387 MB/s [395] |
| Scroll CPU host+helpers | 225 % [229] | 229 % [231] |
| Scroll host damage share (damage run) | — | 0.995 [0.999] |
| Image page scroll fps | 36.5 [36.7] | 34.0 [41.4] |
| DOM page scroll fps | 42.5 [44.1] | 39.4 [51.1] |
| Key → changed frame (pooled) | 36.4 ms [43.6] | 37.0 ms [44.5] |
| Key → title event (median of reps) | 1.4 ms [1.5] | 1.3 ms [1.5] |
| Wheel → changed frame (pooled) | 40.5 ms [48.8] | 41.2 ms [51.0] |
| Image page navigate → painted | 240 ms [243] | 227 ms [242] |
| DOM page navigate → painted | 604 ms [638] | 608 ms [614] |
| Resize → frame at new size | 313 ms [331] | 324 ms [345] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 51.0 [52.6] | — |
| rAF client read/frame, 1 MiB pipe | 16.28 ms [16.55] | — |
| Scroll fps, 1 MiB pipe | 51.8 [53.1] | — |
| Scroll CPU, 1 MiB pipe | 236 % | — |
