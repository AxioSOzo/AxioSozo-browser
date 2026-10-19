# Engine bench summary — run 39327040692

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.

- **chromium**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **chromium+damage**: status PASS (5/5 reps), engine 154.0.8037.17, render_path native-osr-bgra, Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz × 4, 15988 MB, Ubuntu 24.04.5 LTS, GPU nodes ['card1']
- **webkit**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none
- **webkit+damage**: status PASS (5/5 reps), engine 2.48.3, render_path wpe-fdo-shm-bgra, AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie), GPU nodes none

| Metric | chromium | chromium+damage | webkit | webkit+damage |
| --- | --- | --- | --- | --- |
| Spawn → ready | 181 ms [579] | 178 ms [240] | 42 ms [50] | 43 ms [44] |
| Create → first frame (1×) | 124 ms [3089] | 125 ms [145] | 445 ms [460] | 455 ms [460] |
| Create → painted frame (1×) | 125 ms [3090] | 126 ms [146] | 445 ms [460] | 456 ms [460] |
| Navigate → painted frame (static, 1×) | 22 ms [24] | 22 ms [23] | 57 ms | 58 ms |
| Idle frames/s (static page) | 0.50 [1.00] | 0.50 | 0.00 | 0.00 |
| Processes after create | 10 | 10 | 5 | 5 |
| RSS after create (host+helpers) | 850 MB | 849 MB [852] | 433 MB [438] | 439 MB [445] |
| PSS after create (host+helpers) | — | — | 304 MB [311] | 308 MB [316] |
| Close → host exit | 82 ms [84] | 80 ms [83] | 123 ms [172] | 175 ms [177] |
| Close → no helper left | 86 ms [89] | 84 ms [87] | 123 ms [172] | 175 ms [178] |
| **1× (900×650 CSS px → 900×650 px)** | | | | |
| rAF fps | 60.0 [60.2] | 60.0 [60.2] | 58.0 [58.2] | 57.8 [58.0] |
| rAF frame interval median | 16.6 ms [16.8] | 16.7 ms | 17.3 ms | 17.3 ms [17.4] |
| rAF frame interval p99 | 18.0 ms [18.1] | 18.3 ms [18.5] | 18.8 ms [19.3] | 18.8 ms [19.1] |
| rAF intervals > 25 ms | 0.000 | 0.000 | 0.000 | 0.000 |
| rAF pipe throughput | 140 MB/s [141] | 140 MB/s [141] | 136 MB/s | 135 MB/s [136] |
| rAF bytes/frame | 2340342 B | 2340369 B | 2340341 B | 2340368 B |
| rAF client read time/frame | 2.05 ms [3.41] | 2.06 ms [3.50] | 2.10 ms [3.86] | 2.25 ms [3.00] |
| rAF changed-row band (share of frame) | 0.423 | 0.423 | 0.423 | 0.423 |
| rAF host damage share (damage run) | — | 0.236 | — | 0.212 [0.213] |
| rAF CPU host+helpers | 23 % [26] | 24 % [27] | 69 % [71] | 74 % [75] |
| rAF RSS host+helpers | 869 MB [876] | 871 MB [876] | 440 MB [444] | 446 MB [454] |
| Scroll fps (wheel 60 Hz) | 60.2 | 60.2 | 57.8 [58.0] | 55.0 [56.4] |
| Scroll frame interval p99 | 18.0 ms [18.1] | 18.1 ms [18.3] | 19.8 ms [32.3] | 35.2 ms [35.7] |
| Scroll pipe throughput | 141 MB/s | 141 MB/s | 135 MB/s [136] | 129 MB/s [132] |
| Scroll CPU host+helpers | 27 % [28] | 27 % [28] | 69 % [74] | 75 % [77] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.985 [0.992] |
| Image page scroll fps | 60.2 | 60.2 | 57.8 [58.0] | 57.8 [58.0] |
| DOM page scroll fps | 60.2 | 60.2 | 57.8 [58.0] | 54.4 [55.6] |
| Key → changed frame (pooled) | 5.6 ms [7.1] | 5.6 ms [7.5] | 17.6 ms [23.8] | 23.1 ms [24.0] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms [1.7] | 1.5 ms [1.7] | 1.5 ms [1.6] |
| Wheel → changed frame (pooled) | 11.0 ms [12.3] | 11.0 ms [12.0] | 7.8 ms [23.7] | 20.9 ms [24.5] |
| Image page navigate → painted | 156 ms [161] | 154 ms [155] | 374 ms [385] | 383 ms [386] |
| DOM page navigate → painted | 327 ms [361] | 343 ms [360] | 513 ms [514] | 528 ms [538] |
| Resize → frame at new size | 0 ms | 0 ms | 0 ms | 0 ms |
| **2× (900×650 CSS px → 1800×1300 px)** | | | | |
| rAF fps | 60.0 | 60.0 | 57.1 [57.7] | 55.9 [57.2] |
| rAF frame interval median | 16.6 ms [16.7] | 16.6 ms [16.7] | 17.4 ms [17.6] | 17.4 ms [18.0] |
| rAF frame interval p99 | 18.4 ms [19.5] | 18.6 ms [20.1] | 27.4 ms [28.0] | 29.4 ms [33.2] |
| rAF intervals > 25 ms | 0.000 [0.003] | 0.000 [0.003] | 0.056 [0.057] | 0.065 [0.108] |
| rAF pipe throughput | 562 MB/s | 562 MB/s | 534 MB/s [540] | 524 MB/s [535] |
| rAF bytes/frame | 9360347 B | 9360375 B | 9360346 B | 9360374 B |
| rAF client read time/frame | 10.47 ms [10.78] | 10.76 ms [11.02] | 12.49 ms [14.36] | 11.40 ms [13.40] |
| rAF changed-row band (share of frame) | 0.424 | 0.424 | 0.422 | 0.422 |
| rAF host damage share (damage run) | — | 0.237 | — | 0.211 [0.213] |
| rAF CPU host+helpers | 50 % [53] | 52 % [54] | 248 % [250] | 253 % [255] |
| rAF RSS host+helpers | 1259 MB [1281] | 1265 MB [1271] | 600 MB [629] | 616 MB [643] |
| Scroll fps (wheel 60 Hz) | 60.1 | 60.1 | 56.3 [57.0] | 47.0 [49.6] |
| Scroll frame interval p99 | 21.4 ms [23.1] | 22.5 ms [26.5] | 31.6 ms [35.4] | 40.8 ms [42.6] |
| Scroll pipe throughput | 563 MB/s | 563 MB/s | 527 MB/s [533] | 439 MB/s [464] |
| Scroll CPU host+helpers | 83 % [84] | 83 % [84] | 247 % [250] | 243 % [250] |
| Scroll host damage share (damage run) | — | 1.000 | — | 0.991 [0.999] |
| Image page scroll fps | 59.7 [59.8] | 59.7 [60.0] | 43.6 [44.0] | 41.8 [42.6] |
| DOM page scroll fps | 60.1 | 60.1 | 56.4 [57.0] | 48.4 [50.2] |
| Key → changed frame (pooled) | 14.9 ms [16.8] | 15.4 ms [17.6] | 36.8 ms [39.9] | 38.1 ms [40.1] |
| Key → title event (median of reps) | 1.5 ms [1.6] | 1.5 ms [1.6] | 1.5 ms | 1.4 ms [1.5] |
| Wheel → changed frame (pooled) | 12.6 ms [19.8] | 12.6 ms [20.2] | 34.3 ms [47.4] | 36.1 ms [43.4] |
| Image page navigate → painted | 194 ms [199] | 152 ms [193] | 220 ms [226] | 216 ms [220] |
| DOM page navigate → painted | 414 ms [446] | 433 ms [443] | 590 ms [599] | 604 ms [629] |
| Resize → frame at new size | 90 ms [100] | 97 ms | 310 ms [374] | 313 ms [361] |
| **A/B: stdout pipe enlarged to 1 MiB (2×)** | | | | |
| rAF fps, 1 MiB pipe | 58.9 | — | 57.9 [58.0] | — |
| rAF client read/frame, 1 MiB pipe | 8.00 ms [8.22] | — | 10.20 ms [10.48] | — |
| Scroll fps, 1 MiB pipe | 60.0 | — | 57.4 [57.5] | — |
| Scroll CPU, 1 MiB pipe | 65 % [66] | — | 235 % [238] | — |

## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.99 [4.04] | 2.52 [4.79] |
| presenter_bgraToRGBA | 3.81 [9.32] | 15.34 [26.55] |
| candidate_u32_fast_path | 1.65 [3.44] | 6.38 [6.96] |
| putImageData_full | 0.17 [0.18] | 0.64 [0.71] |
| presenter_draw_full | 4.00 [4.75] | 16.77 [17.86] |
| candidate_damage10_fast_put | 0.28 [2.22] | 0.95 [1.34] |
| candidate_createImageBitmap | 3.75 [4.50] | 13.09 [16.09] |
| candidate_webgl_full | 3.56 [5.17] | 13.73 [16.30] |
| candidate_webgl_damage10 | 3.23 [4.67] | 12.39 [14.16] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.94 [1.28] | 2.48 [3.58] |
| presenter_bgraToRGBA | 1.88 [2.64] | 8.86 [15.86] |
| candidate_u32_fast_path | 1.28 [1.60] | 5.10 [7.64] |
| putImageData_full | 0.20 [0.22] | 0.68 [0.70] |
| presenter_draw_full | 2.22 [3.84] | 8.52 [9.40] |
| candidate_damage10_fast_put | 0.28 [0.46] | 1.00 [1.14] |
| candidate_createImageBitmap | 4.08 [4.86] | 12.00 [14.22] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.31 [0.97] | 0.34 [1.04] | 1.54 [2.48] | 1.53 [2.52] |
| presenter_bgraToRGBA | 2.13 [2.24] | 3.03 [3.11] | 11.28 [11.54] | 12.17 [12.40] |
| candidate_u32_opaque_fast_path | 1.47 [1.50] | 1.18 [1.20] | 3.41 [3.48] | 4.78 [4.84] |

## Integrated (Zen app) — chromium: FAIL

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of b933c1301cb033d2bc9eb49b01319d46085a338b (8 replaced, 5 added)
Machine: AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function), FAIL (MarionetteError: WebDriver:ExecuteAsyncScript: javascript error: TypeError: window.AxioSozo.engineProbe.switchTo is not a function)

## Integrated (Zen app) — gecko: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of b933c1301cb033d2bc9eb49b01319d46085a338b (8 replaced, 5 added)
Machine: AMD EPYC 7763 64-Core Processor × 4, 15989 MB, Ubuntu 24.04.5 LTS
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 20.00 [226.00] |
| static.timing.loadEventEnd | 19.00 [216.00] |
| static.navigate_to_title_wall_ms | 36.40 [331.60] |
| image.timing.firstContentfulPaint | 122.50 [135.00] |
| image.timing.loadEventEnd | 119.00 [122.00] |
| image.navigate_to_title_wall_ms | 134.60 [136.70] |
| dom.timing.firstContentfulPaint | 174.00 [180.00] |
| dom.timing.loadEventEnd | 168.00 [177.00] |
| dom.navigate_to_title_wall_ms | 184.30 [191.40] |
| static.idle_raf.fps | 59.00 [59.60] |
| raf.window.fps | 59.00 [59.01] |
| raf.window.interval_ms.median | 17.10 |
| raf.window.interval_p99_ms | 17.14 |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 26.60 [31.30] |
| scroll.window.fps | 59.00 [59.01] |
| scroll.window.interval_p99_ms | 17.12 [17.14] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13302.00 [13312.00] |
| scroll.window.usage.cpu_percent | 49.10 [49.70] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.14 |
| image_scroll.window.usage.cpu_percent | 7.20 [9.30] |
| key.keydown_to_second_raf_ms.median | 9.50 [10.00] |
| key.keydown_to_second_raf_ms.p95 | 17.00 |
| key.event_to_handler_ms.median | 0.00 [1.00] |
| memory_all_processes.rss_mb | 1611.90 [1653.10] |
| memory_all_processes.pss_mb | 747.00 [759.50] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 50.63 [67.76] |
| tab_switch.back_to_bench_tab_ms.median | 50.63 [50.72] |

## Integrated (Zen app) — gecko-debian: PASS

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of b933c1301cb033d2bc9eb49b01319d46085a338b (8 replaced, 5 added)
Machine: AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, PASS, PASS, PASS, PASS

| Metric | median [p95] |
| --- | --- |
| static.timing.firstContentfulPaint | 19.00 [74.00] |
| static.timing.loadEventEnd | 19.00 [67.00] |
| static.navigate_to_title_wall_ms | 45.30 [158.50] |
| image.timing.firstContentfulPaint | 127.00 [129.00] |
| image.timing.loadEventEnd | 125.00 [127.00] |
| image.navigate_to_title_wall_ms | 139.70 [149.30] |
| dom.timing.firstContentfulPaint | 177.00 [181.00] |
| dom.timing.loadEventEnd | 169.00 [182.00] |
| dom.navigate_to_title_wall_ms | 178.30 [194.30] |
| static.idle_raf.fps | 58.99 [59.40] |
| raf.window.fps | 58.99 [59.01] |
| raf.window.interval_ms.median | 17.14 |
| raf.window.interval_p99_ms | 17.18 [17.20] |
| raf.window.long_intervals_share | 0.00 |
| raf.window.usage.cpu_percent | 31.30 [40.20] |
| scroll.window.fps | 59.00 [59.01] |
| scroll.window.interval_p99_ms | 17.14 [17.16] |
| scroll.window.long_intervals_share | 0.00 |
| scroll.window.scrolled_css_px | 13276.00 [13376.00] |
| scroll.window.usage.cpu_percent | 54.30 [57.70] |
| image_scroll.window.fps | 59.00 |
| image_scroll.window.interval_p99_ms | 17.18 [17.20] |
| image_scroll.window.usage.cpu_percent | 8.30 [11.00] |
| key.keydown_to_second_raf_ms.median | 9.00 [9.50] |
| key.keydown_to_second_raf_ms.p95 | 17.00 [18.00] |
| key.event_to_handler_ms.median | 1.00 |
| memory_all_processes.rss_mb | 1706.60 [1741.90] |
| memory_all_processes.pss_mb | 771.20 [777.10] |
| memory_all_processes.processes | 13.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 50.77 [50.86] |
| tab_switch.back_to_bench_tab_ms.median | 50.80 [67.88] |

## Integrated (Zen app) — webkit: FAIL

App: fetched-artifact run 39325384904, commit 832ac3e3d2a68eb742f11a0345962983076e4c0e; TEST-ONLY chrome-overlay: apps/browser/chrome of b933c1301cb033d2bc9eb49b01319d46085a338b (8 replaced, 5 added)
Machine: AMD EPYC 9V74 80-Core Processor × 4, 15989 MB, Debian GNU/Linux 13 (trixie)
Repetitions: PASS, FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded), FAIL (MarionetteError: WebDriver:NewWindow: no such window: Browsing context has been discarded)

| Metric | median [p95] |
| --- | --- |
| static.navigate_to_title_wall_ms | 6.40 |
| image.navigate_to_title_wall_ms | 523.70 |
| dom.navigate_to_title_wall_ms | 520.10 |
| raf.window.fps | 36.82 |
| raf.window.interval_ms.median | 26.30 |
| raf.window.interval_p99_ms | 49.24 |
| raf.window.long_intervals_share | 0.66 |
| raf.window.usage.cpu_percent | 207.40 |
| scroll.window.fps | 29.58 |
| scroll.window.interval_p99_ms | 48.69 |
| scroll.window.long_intervals_share | 1.00 |
| scroll.window.usage.cpu_percent | 206.90 |
| image_scroll.window.fps | 6.18 |
| image_scroll.window.interval_p99_ms | 10963.68 |
| image_scroll.window.usage.cpu_percent | 74.80 |
| memory_all_processes.rss_mb | 2224.30 |
| memory_all_processes.pss_mb | 1134.20 |
| memory_all_processes.processes | 18.00 |
| tab_switch.to_gecko_blank_tab_ms.median | 3000.27 |
| tab_switch.back_to_bench_tab_ms.median | 3021.57 |
| switch.gecko_to_engine_switch_ms | 761.60 |
| switch.engine_to_gecko_switch_ms | 212.40 |
| static.timing.navigate_to_title_ms | 91.20 |
| static.timing.navigate_to_visible_ms | 132.20 |
| image.timing.navigate_to_title_ms | 346.90 |
| image.timing.navigate_to_visible_ms | 483.90 |
| dom.timing.navigate_to_title_ms | 473.80 |
| dom.timing.navigate_to_visible_ms | 544.20 |
| raf.window.fps_whole_window | 36.52 |
| scroll.window.fps_whole_window | 29.01 |
| image_scroll.window.fps_whole_window | 5.18 |
| raf.window.presenter.meanDrawMilliseconds | 1.73 |
| scroll.window.presenter.meanDrawMilliseconds | 2.90 |
| raf.window.multi_frame_updates | 0.00 |
| scroll.window.multi_frame_updates | 0.00 |
| key.keydown_to_presented_frame_ms.median | 36.74 |
| key.keydown_to_presented_frame_ms.p95 | 45.34 |
| memory_after_switch_back.rss_mb | 1613.30 |
| memory_after_switch_back.processes | 13.00 |
