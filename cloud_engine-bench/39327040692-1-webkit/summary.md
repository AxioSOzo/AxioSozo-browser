# Engine bench summary — run 39327040692

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | webkit | webkit+damage |
| --- | --- | --- |
| Spawn → ready | 42 ms [50] | 43 ms [44] |
| Create → first frame (1×) | 445 ms [460] | 455 ms [460] |
| Create → painted frame (1×) | 445 ms [460] | 456 ms [460] |
| Navigate → painted frame (static, 1×) | 57 ms | 58 ms |
| Idle frames/s (static page) | 0.00 | 0.00 |
| Processes after create | 5 | 5 |
| RSS after create (host+helpers) | 433 MB [438] | 439 MB [445] |
| PSS after create (host+helpers) | 304 MB [311] | 308 MB [316] |
| Close → host exit | 123 ms [172] | 175 ms [177] |
| Close → no helper left | 123 ms [172] | 175 ms [178] |
| **1× (900×650 CSS px → 900×650 px)** | | |
| rAF fps | 58.0 [58.2] | 57.8 [58.0] |
| rAF frame interval median | 17.3 ms | 17.3 ms [17.4] |
| rAF frame interval p99 | 18.8 ms [19.3] | 18.8 ms [19.1] |
| rAF intervals > 25 ms | 0.000 | 0.000 |
| rAF pipe throughput | 136 MB/s | 135 MB/s [136] |
| rAF bytes/frame | 2340341 B | 2340368 B |
| rAF client read time/frame | 2.10 ms [3.86] | 2.25 ms [3.00] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.212 [0.213] |
| rAF CPU host+helpers | 69 % [71] | 74 % [75] |
| rAF RSS host+helpers | 440 MB [444] | 446 MB [454] |
| Scroll fps (wheel 60 Hz) | 57.8 [58.0] | 55.0 [56.4] |
| Scroll frame interval p99 | 19.8 ms [32.3] | 35.2 ms [35.7] |
| Scroll pipe throughput | 135 MB/s [136] | 129 MB/s [132] |
| Scroll CPU host+helpers | 69 % [74] | 75 % [77] |
| Scroll host damage share (damage run) | — | 0.985 [0.992] |
| Image page scroll fps | 57.8 [58.0] | 57.8 [58.0] |
| DOM page scroll fps | 57.8 [58.0] | 54.4 [55.6] |
| Key → changed frame (pooled) | 17.6 ms [23.8] | 23.1 ms [24.0] |
| Key → title event (median of reps) | 1.5 ms [1.7] | 1.5 ms [1.6] |
| Wheel → changed frame (pooled) | 7.8 ms [23.7] | 20.9 ms [24.5] |
| Image page navigate → painted | 374 ms [385] | 383 ms [386] |
| DOM page navigate → painted | 513 ms [514] | 528 ms [538] |
| Resize → frame at new size | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | |
| rAF fps | 57.1 [57.7] | 55.9 [57.2] |
| rAF frame interval median | 17.4 ms [17.6] | 17.4 ms [18.0] |
| rAF frame interval p99 | 27.4 ms [28.0] | 29.4 ms [33.2] |
| rAF intervals > 25 ms | 0.056 [0.057] | 0.065 [0.108] |
| rAF pipe throughput | 534 MB/s [540] | 524 MB/s [535] |
| rAF bytes/frame | 9360346 B | 9360374 B |
| rAF client read time/frame | 12.49 ms [14.36] | 11.40 ms [13.40] |
| rAF changed-row band (share of frame) | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.211 [0.213] |
| rAF CPU host+helpers | 248 % [250] | 253 % [255] |
| rAF RSS host+helpers | 600 MB [629] | 616 MB [643] |
| Scroll fps (wheel 60 Hz) | 56.3 [57.0] | 47.0 [49.6] |
| Scroll frame interval p99 | 31.6 ms [35.4] | 40.8 ms [42.6] |
| Scroll pipe throughput | 527 MB/s [533] | 439 MB/s [464] |
| Scroll CPU host+helpers | 247 % [250] | 243 % [250] |
| Scroll host damage share (damage run) | — | 0.991 [0.999] |
| Image page scroll fps | 43.6 [44.0] | 41.8 [42.6] |
| DOM page scroll fps | 56.4 [57.0] | 48.4 [50.2] |
| Key → changed frame (pooled) | 36.8 ms [39.9] | 38.1 ms [40.1] |
| Key → title event (median of reps) | 1.5 ms | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 34.3 ms [47.4] | 36.1 ms [43.4] |
| Image page navigate → painted | 220 ms [226] | 216 ms [220] |
| DOM page navigate → painted | 590 ms [599] | 604 ms [629] |
| Resize → frame at new size | 310 ms [374] | 313 ms [361] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | |
| rAF fps, 1 MiB pipe | 57.9 [58.0] | — |
| rAF client read/frame, 1 MiB pipe | 10.20 ms [10.48] | — |
| Scroll fps, 1 MiB pipe | 57.4 [57.5] | — |
| Scroll CPU, 1 MiB pipe | 235 % [238] | — |
