# Engine bench summary — run 39663352957

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage+payload**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage | webkit+damage+payload |
| --- | --- | --- | --- |
| Spawn → ready | 43 ms [46] | 39 ms [44] | 40 ms [47] |
| Create → first frame (1×) | 476 ms [491] | 473 ms [486] | 480 ms [489] |
| Create → painted frame (1×) | 476 ms [492] | 474 ms [487] | 480 ms [491] |
| Navigate → painted frame (static, 1×) | 57 ms [58] | 57 ms | 55 ms [56] |
| Idle frames/s (static page) | 0.00 | 0.00 | 0.00 |
| Processes after create | 5 | 5 | 5 |
| RSS after create (host+helpers) | 404 MB [407] | 406 MB [409] | 407 MB [408] |
| PSS after create (host+helpers) | 268 MB | 270 MB [273] | 271 MB [274] |
| Close → host exit | 131 ms [133] | 181 ms [182] | 172 ms [184] |
| Close → no helper left | 131 ms [134] | 181 ms [183] | 172 ms [185] |
| **1× (900×650 CSS px → 900×650 px)** | | | |
| rAF fps | 58.0 | 57.6 [58.0] | 58.0 [58.2] |
| rAF frame interval median | 17.3 ms | 17.5 ms | 17.3 ms |
| rAF frame interval p99 | 18.3 ms [18.5] | 18.9 ms [19.3] | 18.4 ms [19.0] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 136 MB/s | 135 MB/s [136] | 29 MB/s |
| rAF bytes/frame | 2340341 B | 2340368 B | 497918 B [498467] |
| rAF client read time/frame | 0.90 ms [3.08] | 0.95 ms [3.03] | 0.15 ms [0.27] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.212 [0.213] | 0.213 |
| rAF CPU host+helpers | 59 % [61] | 61 % [65] | 58 % [65] |
| rAF RSS host+helpers | 412 MB [418] | 415 MB [418] | 416 MB [418] |
| Scroll fps (wheel 60 Hz) | 58.2 [58.4] | 54.4 [56.8] | 54.0 [54.2] |
| Scroll frame interval p99 | 18.9 ms [32.6] | 34.7 ms [35.2] | 34.8 ms [35.0] |
| Scroll pipe throughput | 136 MB/s [137] | 127 MB/s [133] | 124 MB/s [125] |
| Scroll CPU host+helpers | 61 % | 62 % [69] | 63 % [66] |
| Scroll host damage share (damage run) | — | 0.992 [0.996] | 0.984 [0.988] |
| Image page scroll fps | 57.8 [58.0] | 57.8 [58.0] | 57.4 [57.8] |
| DOM page scroll fps | 58.0 [58.2] | 54.2 [54.6] | 54.0 [54.6] |
| Key → changed frame (pooled) | 7.4 ms [21.4] | 7.4 ms [23.5] | 7.3 ms [8.4] |
| Key → title event (median of reps) | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.2 ms [1.3] |
| Wheel → changed frame (pooled) | 7.5 ms [22.1] | 7.5 ms [23.6] | 7.2 ms [21.8] |
| Image page navigate → painted | 371 ms [384] | 372 ms [384] | 369 ms [383] |
| DOM page navigate → painted | 548 ms [558] | 545 ms [552] | 538 ms [553] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | |
| rAF fps | 53.5 [54.2] | 50.4 [51.3] | 58.2 |
| rAF frame interval median | 17.6 ms [20.2] | 18.9 ms [19.0] | 17.2 ms [17.3] |
| rAF frame interval p99 | 29.6 ms [30.6] | 30.2 ms [31.7] | 19.3 ms [19.6] |
| rAF intervals > 25 ms | 0.053 [0.080] | 0.043 [0.056] | 0.000 |
| rAF pipe throughput | 500 MB/s [508] | 472 MB/s [481] | 116 MB/s |
| rAF bytes/frame | 9360346 B | 9360374 B | 1987124 B [1989675] |
| rAF client read time/frame | 15.96 ms [17.50] | 16.05 ms [16.25] | 0.76 ms [1.44] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 | — |
| rAF host damage share (damage run) | — | 0.209 [0.210] | 0.212 |
| rAF CPU host+helpers | 232 % [242] | 234 % | 228 % [231] |
| rAF RSS host+helpers | 579 MB [584] | 582 MB [583] | 585 MB [587] |
| Scroll fps (wheel 60 Hz) | 53.0 [53.1] | 49.3 [49.5] | 51.0 [51.6] |
| Scroll frame interval p99 | 33.3 ms [33.9] | 36.5 ms [40.1] | 37.4 ms [40.0] |
| Scroll pipe throughput | 496 MB/s [497] | 462 MB/s [463] | 471 MB/s [475] |
| Scroll CPU host+helpers | 232 % [233] | 234 % [239] | 237 % [239] |
| Scroll host damage share (damage run) | — | 0.995 [0.999] | 0.984 [0.995] |
| Image page scroll fps | 40.3 [41.2] | 37.8 [38.5] | 42.0 [42.4] |
| DOM page scroll fps | 53.3 [53.7] | 50.1 [50.5] | 51.6 [52.4] |
| Key → changed frame (pooled) | 30.9 ms [42.5] | 37.5 ms [43.6] | 22.4 ms [23.8] |
| Key → title event (median of reps) | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.4 ms |
| Wheel → changed frame (pooled) | 38.4 ms [49.1] | 32.3 ms [49.0] | 25.7 ms [38.6] |
| Image page navigate → painted | 239 ms [242] | 225 ms [232] | 218 ms [221] |
| DOM page navigate → painted | 588 ms [599] | 596 ms [605] | 564 ms [576] |
| Resize → frame at new size | 307 ms [313] | 320 ms [323] | 306 ms [311] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | |
| rAF fps, 1 MiB pipe | 52.5 [54.2] | — | — |
| rAF client read/frame, 1 MiB pipe | 16.03 ms [18.02] | — | — |
| Scroll fps, 1 MiB pipe | 52.9 [54.7] | — | — |
| Scroll CPU, 1 MiB pipe | 233 % [235] | — | — |
