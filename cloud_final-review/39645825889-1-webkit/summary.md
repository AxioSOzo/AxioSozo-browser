# Engine bench summary — run 39645825889

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage+payload**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15982 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage | webkit+damage+payload |
| --- | --- | --- | --- |
| Spawn → ready | 40 ms [43] | 37 ms [41] | 42 ms [43] |
| Create → first frame (1×) | 436 ms [439] | 443 ms [445] | 424 ms [451] |
| Create → painted frame (1×) | 436 ms [440] | 444 ms [446] | 425 ms [452] |
| Navigate → painted frame (static, 1×) | 57 ms [58] | 57 ms [58] | 56 ms |
| Idle frames/s (static page) | 0.00 | 0.00 | 0.00 |
| Processes after create | 5 | 5 | 5 |
| RSS after create (host+helpers) | 405 MB [406] | 406 MB [410] | 408 MB [409] |
| PSS after create (host+helpers) | 271 MB [272] | 270 MB [273] | 270 MB [276] |
| Close → host exit | 129 ms [130] | 179 ms [182] | 174 ms |
| Close → no helper left | 129 ms [131] | 180 ms [182] | 174 ms [175] |
| **1× (900×650 CSS px → 900×650 px)** | | | |
| rAF fps | 58.2 | 58.0 | 58.0 [58.4] |
| rAF frame interval median | 17.1 ms [17.3] | 17.3 ms | 17.3 ms |
| rAF frame interval p99 | 18.6 ms [18.9] | 18.6 ms [19.5] | 18.5 ms [18.7] |
| rAF intervals > 25 ms | 0.000 | 0.000 [0.004] | 0.000 |
| rAF pipe throughput | 136 MB/s | 136 MB/s | 29 MB/s |
| rAF bytes/frame | 2340341 B | 2340368 B | 497849 B [498962] |
| rAF client read time/frame | 1.27 ms [2.97] | 1.30 ms [3.00] | 0.18 ms [0.29] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | — |
| rAF host damage share (damage run) | — | 0.213 | 0.213 |
| rAF CPU host+helpers | 82 % [83] | 85 % [86] | 82 % [84] |
| rAF RSS host+helpers | 414 MB [416] | 415 MB [420] | 417 MB [418] |
| Scroll fps (wheel 60 Hz) | 57.8 | 54.6 [55.2] | 55.0 [55.8] |
| Scroll frame interval p99 | 19.5 ms [20.6] | 35.1 ms [35.5] | 35.0 ms [35.1] |
| Scroll pipe throughput | 135 MB/s | 128 MB/s [129] | 126 MB/s [129] |
| Scroll CPU host+helpers | 83 % | 84 % | 86 % [87] |
| Scroll host damage share (damage run) | — | 0.988 [0.992] | 0.988 [0.995] |
| Image page scroll fps | 57.4 [57.6] | 57.4 [57.8] | 57.6 |
| DOM page scroll fps | 57.8 [58.0] | 55.0 [55.8] | 54.4 [55.4] |
| Key → changed frame (pooled) | 23.1 ms [24.3] | 23.1 ms [24.2] | 7.5 ms [23.4] |
| Key → title event (median of reps) | 1.4 ms [1.5] | 1.4 ms | 1.6 ms [1.7] |
| Wheel → changed frame (pooled) | 23.2 ms [25.2] | 23.2 ms [25.2] | 22.9 ms [24.3] |
| Image page navigate → painted | 432 ms [447] | 432 ms [433] | 437 ms [447] |
| DOM page navigate → painted | 510 ms [528] | 513 ms [522] | 516 ms [536] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | |
| rAF fps | 45.2 [46.1] | 43.2 [43.7] | 52.2 [52.8] |
| rAF frame interval median | 21.5 ms [21.9] | 22.7 ms [23.0] | 19.0 ms |
| rAF frame interval p99 | 32.7 ms [35.8] | 30.8 ms [32.2] | 26.1 ms [26.5] |
| rAF intervals > 25 ms | 0.151 [0.174] | 0.219 [0.227] | 0.030 [0.042] |
| rAF pipe throughput | 423 MB/s [432] | 405 MB/s [409] | 102 MB/s [103] |
| rAF bytes/frame | 9360346 B | 9360374 B | 1958289 B [1958655] |
| rAF client read time/frame | 18.25 ms [18.37] | 18.71 ms [18.91] | 3.26 ms [3.89] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 | — |
| rAF host damage share (damage run) | — | 0.231 [0.233] | 0.209 |
| rAF CPU host+helpers | 254 % [256] | 243 % | 269 % [271] |
| rAF RSS host+helpers | 604 MB [613] | 610 MB [615] | 616 MB [617] |
| Scroll fps (wheel 60 Hz) | 46.2 [47.0] | 44.0 [44.2] | 45.2 [46.7] |
| Scroll frame interval p99 | 31.8 ms [33.9] | 39.5 ms [42.4] | 43.3 ms [46.8] |
| Scroll pipe throughput | 432 MB/s [439] | 412 MB/s [414] | 419 MB/s [426] |
| Scroll CPU host+helpers | 255 % [256] | 254 % [255] | 269 % [273] |
| Scroll host damage share (damage run) | — | 0.990 [0.995] | 0.990 [0.999] |
| Image page scroll fps | 36.0 [36.1] | 32.7 [34.2] | 35.1 [35.7] |
| DOM page scroll fps | 45.8 [46.1] | 42.1 [42.6] | 44.1 [45.2] |
| Key → changed frame (pooled) | 35.9 ms [43.3] | 39.2 ms [44.6] | 22.0 ms [34.5] |
| Key → title event (median of reps) | 1.4 ms | 1.4 ms | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 42.4 ms [54.1] | 41.9 ms [52.0] | 36.6 ms [47.2] |
| Image page navigate → painted | 317 ms [332] | 307 ms [314] | 312 ms [319] |
| DOM page navigate → painted | 563 ms [567] | 564 ms [576] | 557 ms [560] |
| Resize → frame at new size | 372 ms [378] | 383 ms [393] | 379 ms [388] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | |
| rAF fps, 1 MiB pipe | 46.2 [46.6] | — | — |
| rAF client read/frame, 1 MiB pipe | 17.19 ms [18.14] | — | — |
| Scroll fps, 1 MiB pipe | 45.4 [45.7] | — | — |
| Scroll CPU, 1 MiB pipe | 253 % [255] | — | — |
