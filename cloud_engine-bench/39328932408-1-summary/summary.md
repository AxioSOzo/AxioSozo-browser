# Engine bench summary — run 39328932408

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | webkit | webkit+damage |
| --- | --- | --- | --- | --- |
| Spawn → ready | 198 ms [671] | 192 ms [203] | 42 ms [43] | 41 ms |
| Create → first frame (1×) | 138 ms [3285] | 140 ms [153] | 420 ms [439] | 428 ms [442] |
| Create → painted frame (1×) | 139 ms [3285] | 141 ms [165] | 420 ms [440] | 428 ms [443] |
| Navigate → painted frame (static, 1×) | 22 ms [26] | 22 ms [25] | 58 ms | 57 ms |
| Idle frames/s (static page) | 0.50 [1.00] | 0.50 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 5 | 5 |
| RSS after create (host+helpers) | 847 MB [851] | 844 MB [849] | 438 MB | 439 MB [440] |
| PSS after create (host+helpers) | — | — | 310 MB [311] | 310 MB [312] |
| Close → host exit | 83 ms [86] | 129 ms [137] | 123 ms [167] | 176 ms |
| Close → no helper left | 89 ms [92] | 135 ms [142] | 124 ms [168] | 176 ms |
| **1× (900×650 CSS px → 900×650 px)** | | | | |
| rAF fps | 60.2 | 60.2 | 58.0 [58.2] | 57.8 |
| rAF frame interval median | 16.7 ms [16.8] | 16.7 ms | 17.2 ms [17.4] | 17.4 ms |
| rAF frame interval p99 | 18.0 ms [18.1] | 18.1 ms [18.6] | 18.4 ms [18.9] | 18.8 ms [18.9] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 [0.004] | 0.000 |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 136 MB/s | 135 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 2340341 B | 2340368 B |
| rAF client read time/frame | 1.85 ms [3.74] | 1.92 ms [3.81] | 1.93 ms [3.72] | 1.92 ms [2.34] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 | — | 0.212 [0.213] |
| rAF CPU host+helpers | 21 % [24] | 22 % | 62 % [69] | 62 % [65] |
| rAF RSS host+helpers | 868 MB [873] | 867 MB [873] | 444 MB [445] | 446 MB |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 58.2 | 55.8 [56.4] |
| Scroll frame interval p99 | 17.9 ms [18.1] | 18.0 ms [18.1] | 31.0 ms [32.5] | 34.5 ms [34.9] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 136 MB/s | 131 MB/s [132] |
| Scroll CPU host+helpers | 27 % [28] | 27 % [28] | 63 % [68] | 64 % [66] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.992 [0.999] |
| Image page scroll fps | 60.2 | 60.2 | 57.6 [58.0] | 57.6 [57.8] |
| DOM page scroll fps | 60.2 | 60.2 | 58.0 [58.2] | 55.8 [57.2] |
| Key → changed frame (pooled) | 5.0 ms [6.8] | 5.0 ms [6.6] | 7.5 ms [22.3] | 7.5 ms [18.3] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms | 1.3 ms [1.5] | 1.2 ms [1.3] |
| Wheel → changed frame (pooled) | 11.2 ms [12.8] | 11.2 ms [12.5] | 7.6 ms [23.5] | 7.5 ms [22.3] |
| Image page navigate → painted | 153 ms [156] | 157 ms [162] | 357 ms [369] | 357 ms [368] |
| DOM page navigate → painted | 342 ms [353] | 340 ms [354] | 498 ms [507] | 487 ms [494] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | |
| rAF fps | 60.1 [60.2] | 60.0 [60.1] | 58.0 [58.1] | 57.7 [58.0] |
| rAF frame interval median | 16.6 ms | 16.7 ms [16.8] | 17.4 ms | 17.2 ms [17.3] |
| rAF frame interval p99 | 20.4 ms [20.6] | 20.0 ms [20.4] | 26.6 ms [27.8] | 27.0 ms [27.5] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.038 [0.048] | 0.052 [0.056] |
| rAF pipe throughput | 563 MB/s | 562 MB/s | 543 MB/s [544] | 540 MB/s [543] |
| rAF bytes/frame | 9360347 B | 9360375 B | 9360346 B | 9360374 B |
| rAF client read time/frame | 9.02 ms [9.11] | 9.11 ms [9.21] | 13.79 ms [14.95] | 10.65 ms [14.33] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.237 | — | 0.212 |
| rAF CPU host+helpers | 49 % [50] | 48 % [51] | 238 % [239] | 243 % [246] |
| rAF RSS host+helpers | 1262 MB [1282] | 1273 MB [1291] | 600 MB [632] | 604 MB [609] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.1 | 57.0 [57.3] | 48.5 [50.1] |
| Scroll frame interval p99 | 24.1 ms [25.5] | 24.2 ms [26.0] | 31.1 ms [35.2] | 39.5 ms [40.1] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s | 533 MB/s [537] | 454 MB/s [469] |
| Scroll CPU host+helpers | 78 % [80] | 80 % [81] | 237 % [239] | 235 % |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.983 [0.991] |
| Image page scroll fps | 59.9 [60.1] | 59.9 [60.0] | 45.6 [46.1] | 43.0 [45.1] |
| DOM page scroll fps | 60.1 [60.2] | 60.0 [60.2] | 56.9 [57.0] | 48.2 [48.9] |
| Key → changed frame (pooled) | 12.6 ms [14.2] | 12.8 ms [14.4] | 24.2 ms [38.5] | 36.5 ms [40.1] |
| Key → title event (median of reps) | 1.5 ms [1.7] | 1.5 ms [1.6] | 1.3 ms [1.4] | 1.3 ms |
| Wheel → changed frame (pooled) | 11.3 ms [16.0] | 11.8 ms [16.1] | 32.7 ms [42.8] | 33.4 ms [43.6] |
| Image page navigate → painted | 186 ms [195] | 140 ms [189] | 218 ms [220] | 208 ms [216] |
| DOM page navigate → painted | 408 ms [444] | 418 ms [455] | 560 ms [571] | 559 ms [566] |
| Resize → frame at new size | 87 ms [93] | 90 ms [98] | 291 ms [338] | 282 ms [291] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | |
| rAF fps, 1 MiB pipe | 59.2 [59.4] | — | 58.0 | — |
| rAF client read/frame, 1 MiB pipe | 6.15 ms [6.25] | — | 8.83 ms [8.97] | — |
| Scroll fps, 1 MiB pipe | 60.0 [60.1] | — | 57.6 [57.8] | — |
| Scroll CPU, 1 MiB pipe | 61 % [62] | — | 226 % [229] | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.66 [4.42] | 1.30 [3.66] |
| presenter_bgraToRGBA | 1.85 [3.57] | 7.33 [7.93] |
| candidate_u32_fast_path | 0.83 [1.91] | 4.73 [6.77] |
| putImageData_full | 0.04 [0.05] | 0.17 [0.19] |
| presenter_draw_full | 1.81 [2.35] | 7.74 [9.55] |
| candidate_damage10_fast_put | 0.17 [3.01] | 0.43 [0.89] |
| candidate_createImageBitmap | 2.23 [4.96] | 7.16 [10.34] |
| candidate_webgl_full | 2.04 [4.61] | 7.60 [9.94] |
| candidate_webgl_damage10 | 1.95 [3.18] | 7.50 [9.48] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.32 [1.70] | 1.42 [4.06] |
| presenter_bgraToRGBA | 1.04 [1.86] | 4.60 [7.42] |
| candidate_u32_fast_path | 0.70 [1.00] | 2.82 [4.36] |
| putImageData_full | 0.08 [0.10] | 0.30 [0.32] |
| presenter_draw_full | 1.30 [2.06] | 4.26 [4.62] |
| candidate_damage10_fast_put | 0.18 [0.22] | 0.62 [0.74] |
| candidate_createImageBitmap | 2.86 [3.76] | 6.92 [8.02] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.08 [1.03] | 0.07 [0.67] | 0.47 [1.27] | 0.51 [0.79] |
| presenter_bgraToRGBA | 1.10 [1.13] | 1.54 [1.56] | 5.74 [5.94] | 6.05 [6.26] |
| candidate_u32_opaque_fast_path | 0.80 [0.82] | 0.71 [0.72] | 2.03 [2.05] | 2.88 [2.92] |

## Integrated (Zen app) — chromium: FAIL

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of c68a154019966d6e6d708e02fb605dc0a431ba91 (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded)

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 10.30 |
| image.navigate_to_title_wall_ms | 266.20 |
| dom.navigate_to_title_wall_ms | 262.80 |
| raf.window.fps | 40.89 |
| raf.window.interval_ms.median | 23.18 |
| raf.window.interval_p99_ms | 40.56 |
| raf.window.long_intervals_share | 0.21 |
| raf.window.usage.cpu_percent | 163.60 |
| scroll.window.fps | 33.68 |
| scroll.window.interval_p99_ms | 47.03 |
| scroll.window.long_intervals_share | 0.97 |
| scroll.window.usage.cpu_percent | 173.70 |
| image_scroll.window.fps | 2.85 |
| image_scroll.window.interval_p99_ms | 11765.71 |
| image_scroll.window.usage.cpu_percent | 34.50 |
| memory_all_processes.rss_mb | 2812.50 |
| memory_all_processes.processes | 23.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 3000.29 |
| tab_switch.back_to_bench_tab_ms.median | 3025.35 |
| switch.gecko_to_engine_switch_ms | 850.10 |
| switch.engine_to_gecko_switch_ms | 138.50 |
| static.timing.navigate_to_title_ms | 66.50 |
| static.timing.navigate_to_visible_ms | 97.40 |
| image.timing.navigate_to_title_ms | 24.50 |
| image.timing.navigate_to_visible_ms | 191.10 |
| dom.timing.navigate_to_title_ms | 23.20 |
| dom.timing.navigate_to_visible_ms | 336.30 |
| raf.window.fps_whole_window | 40.86 |
| scroll.window.fps_whole_window | 32.80 |
| image_scroll.window.fps_whole_window | 2.22 |
| raf.window.presenter.meanDrawMilliseconds | 1.69 |
| scroll.window.presenter.meanDrawMilliseconds | 2.62 |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 30.00 |
| key.keydown_to_presented_frame_ms.p95 | 43.23 |
| memory_after_switch_back.rss_mb | 1530.00 |
| memory_after_switch_back.processes | 13.00 |

## Integrated (Zen app) — gecko: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of c68a154019966d6e6d708e02fb605dc0a431ba91 (8 replaced, 5 added)
Machine: AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 19.00 [82.00] |
| static.timing.loadEventEnd | 18.00 [68.00] |
| static.navigate_to_title_wall_ms | 35.00 [153.40] |
| image.timing.firstContentfulPaint | 122.00 [131.00] |
| image.timing.loadEventEnd | 120.00 [122.00] |
| image.navigate_to_title_wall_ms | 136.40 [137.80] |
| dom.timing.firstContentfulPaint | 163.00 [170.00] |
| dom.timing.loadEventEnd | 156.00 [161.00] |
| dom.navigate_to_title_wall_ms | 171.20 [175.20] |
| static.idle_raf.fps | 58.99 [59.00] |
| raf.window.fps | 59.01 |
| raf.window.interval_ms.median | 17.10 |
| raf.window.interval_p99_ms | 17.14 [17.16] |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 24.60 [28.90] |
| scroll.window.fps | 59.01 [59.02] |
| scroll.window.interval_p99_ms | 17.12 |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13360.00 [13363.00] |
| scroll.window.usage.cpu_percent | 48.10 [49.10] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.14 |
| image_scroll.window.usage.cpu_percent | 6.70 [10.10] |
| key.keydown_to_second_raf_ms.median | 9.00 [11.00] |
| key.keydown_to_second_raf_ms.p95 | 17.00 |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1602.50 [1644.00] |
| memory_all_processes.pss_mb | 735.90 [748.40] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 50.65 [50.72] |
| tab_switch.back_to_bench_tab_ms.median | 50.66 |

## Integrated (Zen app) — gecko-debian: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of c68a154019966d6e6d708e02fb605dc0a431ba91 (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 19.00 [91.00] |
| static.timing.loadEventEnd | 18.00 [83.00] |
| static.navigate_to_title_wall_ms | 42.30 [176.10] |
| image.timing.firstContentfulPaint | 120.00 [132.00] |
| image.timing.loadEventEnd | 118.00 [123.00] |
| image.navigate_to_title_wall_ms | 132.80 [140.80] |
| dom.timing.firstContentfulPaint | 165.00 [180.00] |
| dom.timing.loadEventEnd | 167.00 [173.00] |
| dom.navigate_to_title_wall_ms | 175.10 [186.70] |
| static.idle_raf.fps | 59.01 [59.17] |
| raf.window.fps | 59.00 [59.01] |
| raf.window.interval_ms.median | 17.10 |
| raf.window.interval_p99_ms | 17.14 |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 25.70 [30.00] |
| scroll.window.fps | 59.01 [59.02] |
| scroll.window.interval_p99_ms | 17.12 [17.14] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13289.00 [13349.00] |
| scroll.window.usage.cpu_percent | 48.30 [52.10] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.14 [17.16] |
| image_scroll.window.usage.cpu_percent | 7.30 [7.90] |
| key.keydown_to_second_raf_ms.median | 9.00 [10.00] |
| key.keydown_to_second_raf_ms.p95 | 17.00 |
| key.event_to_handler_ms.median | 0.00 [1.00] |
| memory_all_processes.rss_mb | 1705.10 [1766.50] |
| memory_all_processes.pss_mb | 763.90 [796.30] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 50.62 [50.67] |
| tab_switch.back_to_bench_tab_ms.median | 50.66 [67.80] |

## Integrated (Zen app) — webkit: FAIL

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of c68a154019966d6e6d708e02fb605dc0a431ba91 (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded)

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 6.40 |
| image.navigate_to_title_wall_ms | 522.90 |
| dom.navigate_to_title_wall_ms | 517.70 |
| raf.window.fps | 37.92 |
| raf.window.interval_ms.median | 25.78 |
| raf.window.interval_p99_ms | 39.62 |
| raf.window.long_intervals_share | 0.63 |
| raf.window.usage.cpu_percent | 196.50 |
| scroll.window.fps | 30.81 |
| scroll.window.interval_p99_ms | 44.52 |
| scroll.window.long_intervals_share | 1.00 |
| scroll.window.usage.cpu_percent | 191.20 |
| image_scroll.window.fps | 6.35 |
| image_scroll.window.interval_p99_ms | 10908.76 |
| image_scroll.window.usage.cpu_percent | 65.90 |
| memory_all_processes.rss_mb | 2384.20 |
| memory_all_processes.pss_mb | 1293.00 |
| memory_all_processes.processes | 18.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 3000.27 |
| tab_switch.back_to_bench_tab_ms.median | 3016.78 |
| switch.gecko_to_engine_switch_ms | 759.90 |
| switch.engine_to_gecko_switch_ms | 210.80 |
| static.timing.navigate_to_title_ms | 45.10 |
| static.timing.navigate_to_visible_ms | 97.50 |
| image.timing.navigate_to_title_ms | 332.20 |
| image.timing.navigate_to_visible_ms | 464.60 |
| dom.timing.navigate_to_title_ms | 473.50 |
| dom.timing.navigate_to_visible_ms | 542.70 |
| raf.window.fps_whole_window | 37.59 |
| scroll.window.fps_whole_window | 30.09 |
| image_scroll.window.fps_whole_window | 5.31 |
| raf.window.presenter.meanDrawMilliseconds | 1.57 |
| scroll.window.presenter.meanDrawMilliseconds | 2.58 |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 34.15 |
| key.keydown_to_presented_frame_ms.p95 | 38.13 |
| memory_after_switch_back.rss_mb | 1602.10 |
| memory_after_switch_back.processes | 13.00 |
