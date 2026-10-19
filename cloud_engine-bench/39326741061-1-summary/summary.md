# Engine bench summary — run 39326741061

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, INTEL(R) XEON(R) PLATINUM 8573C × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, INTEL(R) XEON(R) PLATINUM 8573C × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 9V74 80-Core Processor × 4, 15983 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | webkit | webkit+damage |
| --- | --- | --- | --- | --- |
| Spawn → ready | 177 ms [827] | 182 ms [196] | 35 ms [38] | 33 ms [39] |
| Create → first frame (1×) | 116 ms [451] | 120 ms [132] | 359 ms [364] | 355 ms [369] |
| Create → painted frame (1×) | 118 ms [452] | 120 ms [149] | 359 ms [364] | 355 ms [369] |
| Navigate → painted frame (static, 1×) | 22 ms [23] | 22 ms [25] | 56 ms | 56 ms [57] |
| Idle frames/s (static page) | 0.50 | 0.50 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 5 | 5 |
| RSS after create (host+helpers) | 848 MB [852] | 847 MB [850] | 398 MB [399] | 398 MB [400] |
| PSS after create (host+helpers) | — | — | 261 MB [265] | 262 MB [266] |
| Close → host exit | 82 ms | 84 ms [87] | 129 ms [180] | 182 ms [186] |
| Close → no helper left | 85 ms [86] | 87 ms [90] | 130 ms [180] | 182 ms [186] |
| **1× (900×650 CSS px → 900×650 px)** | | | | |
| rAF fps | 60.2 | 60.1 [60.2] | 58.0 [58.2] | 58.6 |
| rAF frame interval median | 16.8 ms | 16.7 ms | 17.2 ms [17.4] | 17.0 ms [17.1] |
| rAF frame interval p99 | 18.1 ms [18.7] | 18.1 ms [18.3] | 18.5 ms [18.6] | 18.3 ms [23.8] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 [0.004] | 0.000 [0.003] |
| rAF pipe throughput | 141 MB/s | 141 MB/s | 136 MB/s | 137 MB/s |
| rAF bytes/frame | 2340342 B | 2340369 B | 2340341 B | 2340368 B |
| rAF client read time/frame | 2.05 ms [3.56] | 2.03 ms [3.58] | 1.45 ms [3.25] | 1.37 ms [3.16] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 [0.237] | — | 0.214 |
| rAF CPU host+helpers | 21 % [23] | 20 % [22] | 54 % [61] | 54 % [55] |
| rAF RSS host+helpers | 868 MB [873] | 874 MB [875] | 409 MB | 409 MB [412] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 57.8 [58.0] | 54.2 [54.8] |
| Scroll frame interval p99 | 17.9 ms [18.2] | 17.8 ms [17.9] | 24.3 ms [32.2] | 35.1 ms [35.2] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 135 MB/s [136] | 127 MB/s [128] |
| Scroll CPU host+helpers | 24 % | 22 % | 58 % [63] | 53 % [54] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.988 [0.995] |
| Image page scroll fps | 60.0 [60.2] | 60.0 [60.2] | 57.8 | 57.0 [57.4] |
| DOM page scroll fps | 60.2 | 60.2 | 57.8 [58.0] | 55.2 [55.4] |
| Key → changed frame (pooled) | 5.5 ms [7.3] | 5.4 ms [7.2] | 7.3 ms [21.2] | 7.4 ms [21.4] |
| Key → title event (median of reps) | 1.5 ms | 1.4 ms [1.5] | 1.2 ms [1.3] | 1.2 ms |
| Wheel → changed frame (pooled) | 11.0 ms [12.5] | 11.0 ms [12.2] | 7.4 ms [21.7] | 7.4 ms [22.0] |
| Image page navigate → painted | 143 ms [147] | 143 ms [144] | 319 ms [320] | 308 ms [320] |
| DOM page navigate → painted | 320 ms [334] | 308 ms [316] | 427 ms [455] | 417 ms [430] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | |
| rAF fps | 60.0 [60.1] | 60.0 [60.1] | 50.9 [53.1] | 49.5 [51.7] |
| rAF frame interval median | 16.6 ms | 16.6 ms [16.7] | 18.0 ms [18.2] | 18.8 ms [19.9] |
| rAF frame interval p99 | 19.1 ms [19.7] | 19.3 ms [20.7] | 30.6 ms [33.1] | 31.0 ms [33.3] |
| rAF intervals > 25 ms | 0.000 [0.003] | 0.000 | 0.126 [0.137] | 0.138 [0.174] |
| rAF pipe throughput | 562 MB/s [563] | 562 MB/s [563] | 477 MB/s [497] | 464 MB/s [484] |
| rAF bytes/frame | 9360347 B | 9360375 B | 9360346 B | 9360374 B |
| rAF client read time/frame | 10.24 ms [10.28] | 9.78 ms [10.14] | 16.15 ms [16.42] | 16.48 ms [16.72] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.236 [0.237] | — | 0.210 [0.212] |
| rAF CPU host+helpers | 46 % [47] | 46 % [48] | 221 % [223] | 226 % [227] |
| rAF RSS host+helpers | 1291 MB [1299] | 1263 MB [1304] | 571 MB [576] | 577 MB [582] |
| Scroll fps (wheel 60 Hz) | 60.0 [60.2] | 60.0 [60.1] | 54.3 [56.6] | 48.0 [49.8] |
| Scroll frame interval p99 | 22.9 ms [26.7] | 22.2 ms [28.2] | 34.7 ms [36.7] | 36.9 ms [41.6] |
| Scroll pipe throughput | 562 MB/s [563] | 562 MB/s | 509 MB/s [530] | 449 MB/s [466] |
| Scroll CPU host+helpers | 67 % [71] | 68 % [69] | 221 % [224] | 218 % [221] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.995 |
| Image page scroll fps | 59.9 | 59.9 [60.0] | 41.7 [43.9] | 38.3 [40.1] |
| DOM page scroll fps | 60.1 [60.2] | 60.1 [60.2] | 51.8 [54.4] | 46.1 [46.8] |
| Key → changed frame (pooled) | 15.2 ms [16.7] | 15.3 ms [17.4] | 30.6 ms [41.7] | 32.9 ms [42.9] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms | 1.2 ms [1.3] | 1.2 ms |
| Wheel → changed frame (pooled) | 11.8 ms [17.4] | 12.8 ms [17.5] | 36.4 ms [46.4] | 31.6 ms [46.7] |
| Image page navigate → painted | 171 ms [190] | 167 ms [173] | 207 ms [216] | 203 ms [210] |
| DOM page navigate → painted | 371 ms [415] | 354 ms [375] | 475 ms [483] | 469 ms [471] |
| Resize → frame at new size | 90 ms [97] | 87 ms [91] | 255 ms [281] | 261 ms [270] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | |
| rAF fps, 1 MiB pipe | 59.1 [59.3] | — | 56.5 [57.5] | — |
| rAF client read/frame, 1 MiB pipe | 7.35 ms [7.43] | — | 13.85 ms [14.62] | — |
| Scroll fps, 1 MiB pipe | 60.2 | — | 56.6 [57.1] | — |
| Scroll CPU, 1 MiB pipe | 50 % [52] | — | 223 % [224] | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.30 [5.02] | 1.92 [4.88] |
| presenter_bgraToRGBA | 3.57 [9.97] | 14.18 [30.52] |
| candidate_u32_fast_path | 1.48 [2.90] | 5.97 [6.25] |
| putImageData_full | 0.10 [0.12] | 0.34 [0.41] |
| presenter_draw_full | 3.66 [4.03] | 14.85 [17.14] |
| candidate_damage10_fast_put | 0.23 [3.54] | 0.86 [1.31] |
| candidate_createImageBitmap | 3.72 [4.21] | 12.32 [15.93] |
| candidate_webgl_full | 3.16 [6.15] | 12.48 [16.36] |
| candidate_webgl_damage10 | 2.90 [3.92] | 14.71 [17.70] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.98 [1.68] | 1.78 [3.28] |
| presenter_bgraToRGBA | 2.18 [4.70] | 8.44 [14.88] |
| candidate_u32_fast_path | 1.56 [1.82] | 3.92 [6.16] |
| putImageData_full | 0.16 [0.20] | 0.42 [0.46] |
| presenter_draw_full | 4.54 [7.08] | 7.98 [8.44] |
| candidate_damage10_fast_put | 0.40 [0.92] | 0.94 [1.10] |
| candidate_createImageBitmap | 4.12 [5.42] | 10.48 [12.58] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.25 [1.40] | 0.22 [1.00] | 0.93 [1.37] | 1.06 [1.83] |
| presenter_bgraToRGBA | 1.95 [2.16] | 3.07 [3.35] | 11.50 [11.74] | 12.25 [12.38] |
| candidate_u32_opaque_fast_path | 1.28 [1.29] | 1.27 [1.34] | 3.67 [3.75] | 5.20 [5.33] |

## Integrated (Zen app) — chromium: FAIL

App: fetched-artifact run 39319467610, commit b0baccecfbd5d6e0a2b88ccc75a1482376039531; TEST-ONLY chrome-overlay: apps/browser/chrome of 5f30a6b898ac6ee1d9ffb51cbe490adabe5ca755 (8 replaced, 5 added)
Machine: AMD EPYC 9V45 96-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function)

## Integrated (Zen app) — gecko: PASS

App: fetched-artifact run 39319467610, commit b0baccecfbd5d6e0a2b88ccc75a1482376039531; TEST-ONLY chrome-overlay: apps/browser/chrome of 5f30a6b898ac6ee1d9ffb51cbe490adabe5ca755 (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 19.00 [123.00] |
| static.timing.loadEventEnd | 18.00 [113.00] |
| static.navigate_to_title_wall_ms | 43.70 [342.20] |
| image.timing.firstContentfulPaint | 119.50 [134.00] |
| image.timing.loadEventEnd | 115.00 [126.00] |
| image.navigate_to_title_wall_ms | 131.10 [145.30] |
| dom.timing.firstContentfulPaint | 183.00 [185.00] |
| dom.timing.loadEventEnd | 171.00 [177.00] |
| dom.navigate_to_title_wall_ms | 188.20 [193.10] |
| static.idle_raf.fps | 59.00 [59.38] |
| raf.window.fps | 59.01 |
| raf.window.interval_ms.median | 17.10 [17.12] |
| raf.window.interval_p99_ms | 17.14 [17.16] |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 29.00 [36.90] |
| scroll.window.fps | 59.00 [59.01] |
| scroll.window.interval_p99_ms | 17.14 [17.18] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13282.00 [13292.00] |
| scroll.window.usage.cpu_percent | 51.60 [56.00] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.16 [17.18] |
| image_scroll.window.usage.cpu_percent | 7.30 [12.50] |
| key.keydown_to_second_raf_ms.median | 9.00 [10.00] |
| key.keydown_to_second_raf_ms.p95 | 17.00 [18.00] |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1620.80 [1659.90] |
| memory_all_processes.pss_mb | 741.30 [763.40] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 50.72 [50.86] |
| tab_switch.back_to_bench_tab_ms.median | 50.78 [50.81] |
