# Engine bench summary — run 39330954155

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | webkit | webkit+damage |
| --- | --- | --- | --- | --- |
| Spawn → ready | 262 ms [540] | 230 ms [329] | 41 ms [43] | 47 ms [49] |
| Create → first frame (1×) | 218 ms [642] | 128 ms [264] | 435 ms [456] | 448 ms [458] |
| Create → painted frame (1×) | 219 ms [642] | 128 ms [264] | 436 ms [457] | 448 ms [459] |
| Navigate → painted frame (static, 1×) | 19 ms [22] | 18 ms [22] | 58 ms | 58 ms |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 5 | 5 |
| RSS after create (host+helpers) | 848 MB [852] | 850 MB [857] | 398 MB [399] | 400 MB [401] |
| PSS after create (host+helpers) | — | — | 263 MB [264] | 266 MB |
| Close → host exit | 134 ms [335] | 87 ms [235] | 132 ms [181] | 182 ms [185] |
| Close → no helper left | 139 ms [340] | 92 ms [239] | 133 ms [182] | 183 ms [186] |
| **1× (900×650 CSS px → 900×650 px)** | | | | |
| rAF fps | 60.0 [60.2] | 60.0 [60.2] | 58.0 [58.6] | 57.8 [58.0] |
| rAF frame interval median | 16.7 ms | 16.7 ms [16.8] | 17.3 ms | 17.4 ms |
| rAF frame interval p99 | 18.4 ms [20.4] | 19.7 ms [22.3] | 18.6 ms [19.0] | 18.6 ms [18.8] |
| rAF intervals > 25 ms | 0.000 | 0.000 [0.003] | 0.000 | 0.000 |
| rAF pipe throughput | 140 MB/s [141] | 140 MB/s [141] | 136 MB/s [137] | 135 MB/s [136] |
| rAF bytes/frame | 2340342 B | 2340369 B | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.69 ms [3.81] | 1.73 ms [3.82] | 1.90 ms [3.87] | 1.89 ms [4.02] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 | — | 0.212 [0.213] |
| rAF CPU host+helpers | 20 % [22] | 21 % [23] | 62 % [72] | 68 % [71] |
| rAF RSS host+helpers | 869 MB [870] | 873 MB [877] | 407 MB [409] | 410 MB [411] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 58.0 [58.2] | 54.6 [54.8] |
| Scroll frame interval p99 | 18.2 ms [20.2] | 18.1 ms [18.7] | 21.1 ms [32.4] | 35.1 ms [35.2] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 136 MB/s | 128 MB/s |
| Scroll CPU host+helpers | 23 % [26] | 24 % [26] | 68 % [76] | 65 % [76] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.988 [0.999] |
| Image page scroll fps | 60.2 | 60.2 | 58.0 [58.4] | 57.4 [57.6] |
| DOM page scroll fps | 60.1 [60.2] | 60.2 | 57.8 [58.2] | 54.2 [54.6] |
| Key → changed frame (pooled) | 4.4 ms [6.5] | 4.5 ms [7.0] | 7.7 ms [23.9] | 22.8 ms [23.9] |
| Key → title event (median of reps) | 1.3 ms [1.4] | 1.3 ms [1.4] | 1.4 ms [1.6] | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 11.1 ms [13.2] | 11.0 ms [12.8] | 7.7 ms [24.1] | 9.4 ms [24.0] |
| Image page navigate → painted | 130 ms [136] | 130 ms [158] | 388 ms [401] | 383 ms [400] |
| DOM page navigate → painted | 287 ms [296] | 328 ms [339] | 554 ms [574] | 552 ms [576] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | |
| rAF fps | 59.6 [59.8] | 59.5 [59.8] | 46.1 [47.4] | 43.7 [46.9] |
| rAF frame interval median | 16.8 ms | 16.8 ms [17.0] | 19.2 ms [22.3] | 20.1 ms [23.3] |
| rAF frame interval p99 | 19.7 ms [25.7] | 19.0 ms [26.3] | 36.3 ms [39.8] | 37.6 ms [38.1] |
| rAF intervals > 25 ms | 0.000 [0.010] | 0.000 [0.014] | 0.209 [0.375] | 0.248 [0.423] |
| rAF pipe throughput | 558 MB/s [560] | 557 MB/s [560] | 432 MB/s [444] | 409 MB/s [439] |
| rAF bytes/frame | 9360347 B | 9360375 B | 9360346 B | 9360374 B |
| rAF client read time/frame | 15.55 ms [15.62] | 15.60 ms [15.77] | 17.33 ms [19.00] | 17.99 ms [19.34] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.236 [0.237] | — | 0.208 [0.210] |
| rAF CPU host+helpers | 44 % [46] | 44 % [45] | 233 % [240] | 241 % [242] |
| rAF RSS host+helpers | 1263 MB [1290] | 1273 MB [1285] | 575 MB [582] | 583 MB [585] |
| Scroll fps (wheel 60 Hz) | 59.0 [59.4] | 59.1 [59.3] | 42.0 [45.1] | 41.3 [42.2] |
| Scroll frame interval p99 | 27.1 ms [33.7] | 24.0 ms [31.4] | 37.2 ms [38.7] | 38.4 ms [42.6] |
| Scroll pipe throughput | 552 MB/s [556] | 554 MB/s [555] | 393 MB/s [422] | 387 MB/s [395] |
| Scroll CPU host+helpers | 77 % [83] | 77 % [80] | 225 % [229] | 229 % [231] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.995 [0.999] |
| Image page scroll fps | 57.7 [58.3] | 57.1 [58.6] | 36.5 [36.7] | 34.0 [41.4] |
| DOM page scroll fps | 60.0 | 60.0 | 42.5 [44.1] | 39.4 [51.1] |
| Key → changed frame (pooled) | 18.0 ms [20.5] | 15.7 ms [19.9] | 36.4 ms [43.6] | 37.0 ms [44.5] |
| Key → title event (median of reps) | 1.4 ms | 1.4 ms | 1.4 ms [1.5] | 1.3 ms [1.5] |
| Wheel → changed frame (pooled) | 15.7 ms [23.0] | 17.8 ms [24.2] | 40.5 ms [48.8] | 41.2 ms [51.0] |
| Image page navigate → painted | 168 ms [177] | 168 ms [181] | 240 ms [243] | 227 ms [242] |
| DOM page navigate → painted | 383 ms [465] | 421 ms [454] | 604 ms [638] | 608 ms [614] |
| Resize → frame at new size | 96 ms [99] | 99 ms [101] | 313 ms [331] | 324 ms [345] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | |
| rAF fps, 1 MiB pipe | 59.0 [59.2] | — | 51.0 [52.6] | — |
| rAF client read/frame, 1 MiB pipe | 12.09 ms [12.28] | — | 16.28 ms [16.55] | — |
| Scroll fps, 1 MiB pipe | 60.0 [60.1] | — | 51.8 [53.1] | — |
| Scroll CPU, 1 MiB pipe | 56 % [59] | — | 236 % | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.93 [1.11] | 3.88 [4.96] |
| presenter_bgraToRGBA | 2.95 [4.49] | 5.80 [5.93] |
| candidate_u32_fast_path | 0.67 [0.70] | 2.65 [2.79] |
| putImageData_full | 0.06 [0.07] | 0.20 [0.26] |
| presenter_draw_full | 1.51 [1.58] | 6.25 [13.27] |
| candidate_damage10_fast_put | 0.18 [0.21] | 0.74 [1.12] |
| candidate_createImageBitmap | 2.57 [2.81] | 10.57 [12.97] |
| candidate_webgl_full | 3.67 [5.96] | 10.60 [12.44] |
| candidate_webgl_damage10 | 2.96 [6.28] | 9.42 [10.95] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.86 [1.22] | 3.58 [6.96] |
| presenter_bgraToRGBA | 1.64 [3.26] | 7.00 [13.40] |
| candidate_u32_fast_path | 0.84 [1.22] | 3.30 [3.76] |
| putImageData_full | 0.14 [0.16] | 0.36 [0.38] |
| presenter_draw_full | 1.72 [3.32] | 6.86 [8.48] |
| candidate_damage10_fast_put | 0.24 [0.34] | 0.80 [0.86] |
| candidate_createImageBitmap | 4.52 [6.06] | 17.70 [22.98] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.12 [1.07] | 0.12 [1.04] | 0.71 [4.21] | 0.74 [4.32] |
| presenter_bgraToRGBA | 1.62 [1.73] | 2.44 [2.55] | 9.34 [9.43] | 9.88 [10.05] |
| candidate_u32_opaque_fast_path | 1.12 [1.17] | 1.01 [1.04] | 3.01 [4.50] | 4.04 [4.11] |

## Integrated (Zen app) — chromium: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 0b2c44b2804a63d46d7e4b0d29ce2e6f7d140dee (8 replaced, 5 added)
Machine: INTEL(R) XEON(R) PLATINUM 8573C × 4, 15988 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 6.40 [9.50] |
| image.navigate_to_title_wall_ms | 261.40 [264.30] |
| dom.navigate_to_title_wall_ms | 264.80 [268.20] |
| raf.window.fps | 49.28 [50.59] |
| raf.window.interval_ms.median | 19.64 [20.05] |
| raf.window.interval_p99_ms | 35.95 [37.50] |
| raf.window.long_intervals_share | 0.07 [0.08] |
| raf.window.usage.cpu_percent | 151.10 [153.20] |
| scroll.window.fps | 5.56 [39.82] |
| scroll.window.interval_p99_ms | 11726.42 [11735.88] |
| scroll.window.long_intervals_share | 0.47 [0.50] |
| scroll.window.usage.cpu_percent | 22.20 [167.20] |
| image_scroll.window.fps | 3.32 [3.47] |
| image_scroll.window.interval_p99_ms | 11739.47 [11745.70] |
| image_scroll.window.usage.cpu_percent | 18.80 [29.10] |
| memory_all_processes.rss_mb | 2854.30 [2927.50] |
| memory_all_processes.processes | 23.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 54.08 [54.37] |
| tab_switch.back_to_bench_tab_ms.median | 29.90 [30.09] |
| switch.gecko_to_engine_switch_ms | 384.70 [566.70] |
| switch.engine_to_gecko_switch_ms | 129.30 [133.50] |
| static.timing.navigate_to_title_ms | 45.20 [144.90] |
| static.timing.navigate_to_visible_ms | 72.80 [175.10] |
| image.timing.navigate_to_title_ms | 18.10 [24.30] |
| image.timing.navigate_to_visible_ms | 164.40 [168.20] |
| dom.timing.navigate_to_title_ms | 19.30 [22.00] |
| dom.timing.navigate_to_visible_ms | 255.50 [288.10] |
| raf.window.fps_whole_window | 49.26 [50.26] |
| scroll.window.fps_whole_window | 4.52 [39.27] |
| image_scroll.window.fps_whole_window | 2.58 [2.70] |
| raf.window.presenter.meanDrawMilliseconds | 1.66 [1.68] |
| scroll.window.presenter.meanDrawMilliseconds | 2.55 [2.59] |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 28.47 [28.77] |
| key.keydown_to_presented_frame_ms.p95 | 30.80 [44.56] |
| memory_after_switch_back.rss_mb | 1529.20 [1822.80] |
| memory_after_switch_back.processes | 13.00 |

## Integrated (Zen app) — gecko: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 0b2c44b2804a63d46d7e4b0d29ce2e6f7d140dee (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 21.00 [83.00] |
| static.timing.loadEventEnd | 20.00 [82.00] |
| static.navigate_to_title_wall_ms | 45.90 [189.30] |
| image.timing.firstContentfulPaint | 124.50 [143.00] |
| image.timing.loadEventEnd | 122.00 [132.00] |
| image.navigate_to_title_wall_ms | 133.80 [148.70] |
| dom.timing.firstContentfulPaint | 179.00 [184.00] |
| dom.timing.loadEventEnd | 177.00 [192.00] |
| dom.navigate_to_title_wall_ms | 191.80 [207.40] |
| static.idle_raf.fps | 59.01 [59.22] |
| raf.window.fps | 59.00 [59.01] |
| raf.window.interval_ms.median | 17.12 |
| raf.window.interval_p99_ms | 17.16 [17.18] |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 30.30 [39.20] |
| scroll.window.fps | 59.00 [59.02] |
| scroll.window.interval_p99_ms | 17.14 [17.16] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13341.00 [13382.00] |
| scroll.window.usage.cpu_percent | 52.10 [57.00] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.20 |
| image_scroll.window.usage.cpu_percent | 8.50 [10.90] |
| key.keydown_to_second_raf_ms.median | 9.00 [10.50] |
| key.keydown_to_second_raf_ms.p95 | 17.00 [18.00] |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1531.80 [1591.70] |
| memory_all_processes.pss_mb | 750.40 [782.50] |
| memory_all_processes.processes | 12.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 23.11 [24.21] |
| tab_switch.back_to_bench_tab_ms.median | 23.40 [23.68] |

## Integrated (Zen app) — gecko-debian: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 0b2c44b2804a63d46d7e4b0d29ce2e6f7d140dee (8 replaced, 5 added)
Machine: INTEL(R) XEON(R) PLATINUM 8573C × 4, 15982 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 18.00 [54.00] |
| static.timing.loadEventEnd | 16.00 [54.00] |
| static.navigate_to_title_wall_ms | 35.10 [206.60] |
| image.timing.firstContentfulPaint | 109.50 [115.00] |
| image.timing.loadEventEnd | 106.00 [112.00] |
| image.navigate_to_title_wall_ms | 115.60 [127.20] |
| dom.timing.firstContentfulPaint | 127.00 [141.00] |
| dom.timing.loadEventEnd | 124.00 [137.00] |
| dom.navigate_to_title_wall_ms | 134.50 [151.00] |
| static.idle_raf.fps | 58.98 [59.17] |
| raf.window.fps | 59.00 [59.02] |
| raf.window.interval_ms.median | 17.10 |
| raf.window.interval_p99_ms | 17.22 [17.26] |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 22.20 [25.20] |
| scroll.window.fps | 59.00 [59.01] |
| scroll.window.interval_p99_ms | 17.16 [17.20] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13173.00 [13304.00] |
| scroll.window.usage.cpu_percent | 39.10 [48.60] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.20 [17.22] |
| image_scroll.window.usage.cpu_percent | 5.90 [6.20] |
| key.keydown_to_second_raf_ms.median | 8.00 [10.00] |
| key.keydown_to_second_raf_ms.p95 | 16.00 [17.00] |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1733.40 [1774.30] |
| memory_all_processes.pss_mb | 768.10 [793.30] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 22.65 [24.05] |
| tab_switch.back_to_bench_tab_ms.median | 22.52 [22.60] |

## Integrated (Zen app) — webkit: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of 0b2c44b2804a63d46d7e4b0d29ce2e6f7d140dee (8 replaced, 5 added)
Machine: INTEL(R) XEON(R) PLATINUM 8573C × 4, 15982 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 5.80 [9.30] |
| image.navigate_to_title_wall_ms | 518.10 [528.50] |
| dom.navigate_to_title_wall_ms | 510.90 [522.80] |
| raf.window.fps | 47.92 [48.92] |
| raf.window.interval_ms.median | 19.90 [21.52] |
| raf.window.interval_p99_ms | 37.00 [40.84] |
| raf.window.long_intervals_share | 0.07 [0.18] |
| raf.window.usage.cpu_percent | 182.20 [186.80] |
| scroll.window.fps | 10.47 [37.29] |
| scroll.window.interval_p99_ms | 132.73 [139.71] |
| scroll.window.long_intervals_share | 0.47 [0.60] |
| scroll.window.usage.cpu_percent | 48.10 [186.90] |
| image_scroll.window.fps | 7.84 [8.06] |
| image_scroll.window.interval_p99_ms | 122.48 [124.47] |
| image_scroll.window.usage.cpu_percent | 45.00 [55.50] |
| memory_all_processes.rss_mb | 2235.20 [2331.20] |
| memory_all_processes.pss_mb | 1098.10 [1192.30] |
| memory_all_processes.processes | 18.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 20.83 [21.31] |
| tab_switch.back_to_bench_tab_ms.median | 22.37 [23.22] |
| switch.gecko_to_engine_switch_ms | 479.40 [613.60] |
| switch.engine_to_gecko_switch_ms | 210.80 [211.30] |
| static.timing.navigate_to_title_ms | 43.40 [58.90] |
| static.timing.navigate_to_visible_ms | 76.00 [81.70] |
| image.timing.navigate_to_title_ms | 326.80 [365.00] |
| image.timing.navigate_to_visible_ms | 431.80 [487.60] |
| dom.timing.navigate_to_title_ms | 403.50 [411.70] |
| dom.timing.navigate_to_visible_ms | 462.20 [468.00] |
| raf.window.fps_whole_window | 48.01 [48.71] |
| scroll.window.fps_whole_window | 9.26 [36.72] |
| image_scroll.window.fps_whole_window | 6.56 [6.74] |
| raf.window.presenter.meanDrawMilliseconds | 1.48 [1.61] |
| scroll.window.presenter.meanDrawMilliseconds | 1.97 [2.44] |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 32.89 [33.70] |
| key.keydown_to_presented_frame_ms.p95 | 39.03 [48.90] |
| memory_after_switch_back.rss_mb | 1662.10 [1672.90] |
| memory_after_switch_back.processes | 13.00 |
