# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39303324088-1-summary (run 39303324088)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39330954155)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 802 shared metrics: **108 regressions**, 24 improvements, 522 within noise, 148 descriptive
- not compared: 0 metrics only in the baseline, 139 only in the candidate
- ⚠ `chromium`: different CPU models (AMD EPYC 7763 64-Core Processor → AMD EPYC 9V74 80-Core Processor); relative threshold raised to 25%
- ⚠ `chromium+damage`: different CPU models (AMD EPYC 7763 64-Core Processor → AMD EPYC 9V74 80-Core Processor); relative threshold raised to 25%
- ⚠ `webkit`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%
- ⚠ `webkit+damage`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `chromium+damage/scales.2x.dom_scroll.read_ms.median` | 8.59 | 16.113 | +7.523 | +87.6 % | 2.147 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 35.5 | 76.7 | +41.2 | +116.1 % | 8.875 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.image_scroll.read_ms.median` | 9.291 | 16.514 | +7.223 | +77.7 % | 2.323 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.image_scroll.usage.client_cpu_percent` | 37.4 | 77.1 | +39.7 | +106.2 % | 9.35 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.key.latency_ms.p95` | 15.2 | 19.91 | +4.71 | +31.0 % | 3.8 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.raf.read_ms.median` | 8.324 | 15.598 | +7.274 | +87.4 % | 2.081 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.raf.usage.client_cpu_percent` | 38.8 | 80.3 | +41.5 | +107.0 % | 9.7 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.scroll.read_ms.median` | 8.433 | 16.012 | +7.579 | +89.9 % | 2.108 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.scroll.usage.client_cpu_percent` | 34.3 | 74.7 | +40.4 | +117.8 % | 8.575 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.wheel.latency_ms.p95` | 18.37 | 23.94 | +5.57 | +30.3 % | 4.593 | **REGRESSION** (different CPU) |
| `chromium/pipe_1mib.raf.read_ms.median` | 6.18 | 12.087 | +5.907 | +95.6 % | 1.545 | **REGRESSION** (different CPU) |
| `chromium/pipe_1mib.scroll.read_ms.median` | 6.181 | 12.425 | +6.244 | +101.0 % | 1.545 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.dom_scroll.read_ms.median` | 9.43 | 16.012 | +6.582 | +69.8 % | 2.357 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.dom_scroll.usage.client_cpu_percent` | 40.5 | 76.3 | +35.8 | +88.4 % | 10.125 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.image_scroll.read_ms.median` | 10.815 | 16.428 | +5.613 | +51.9 % | 2.704 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.image_scroll.usage.client_cpu_percent` | 43.1 | 76.7 | +33.6 | +78.0 % | 10.775 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.key.latency_ms.median` | 12.815 | 16.995 | +4.18 | +32.6 % | 3.204 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.key.latency_ms.p95` | 14.39 | 20.01 | +5.62 | +39.1 % | 3.598 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.raf.read_ms.median` | 9.126 | 15.552 | +6.426 | +70.4 % | 2.281 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.raf.usage.client_cpu_percent` | 43.6 | 81 | +37.4 | +85.8 % | 10.9 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.scroll.read_ms.median` | 9.195 | 15.924 | +6.729 | +73.2 % | 2.299 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.scroll.usage.client_cpu_percent` | 39.4 | 74.5 | +35.1 | +89.1 % | 9.85 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.wheel.latency_ms.median` | 11.315 | 16.2 | +4.885 | +43.2 % | 2.829 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.wheel.latency_ms.p95` | 17.64 | 22.96 | +5.32 | +30.2 % | 4.41 | **REGRESSION** (different CPU) |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 2.605 | 3.875 | +1.27 | +48.8 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 1.9 | 3.58 | +1.68 | +88.4 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 11.34 | 17.7 | +6.36 | +56.1 % | 0.567 | **REGRESSION** |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 3.96 | 4.52 | +0.56 | +14.1 % | 0.5 | **REGRESSION** |
| `webkit+damage/scales.1x.dom.idle_fps` | 9.5 | 13 | +3.5 | +36.8 % | 2.375 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom.navigate_to_completed_ms` | 330.2 | 461 | +130.8 | +39.6 % | 82.55 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom.navigate_to_first_frame_ms` | 403.5 | 551.3 | +147.8 | +36.6 % | 100.875 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom.navigate_to_painted_frame_ms` | 404 | 551.9 | +147.9 | +36.6 % | 101 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom_scroll.load.navigate_to_painted_frame_ms` | 432.7 | 550.5 | +117.8 | +27.2 % | 108.175 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.key.latency_ms.median` | 7.275 | 22.805 | +15.53 | +213.5 % | 11.988 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.key.latency_ms.p95` | 8.11 | 23.52 | +15.41 | +190.0 % | 12.784 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.key.pooled_latency_ms` | 7.405 | 22.82 | +15.415 | +208.2 % | 13.934 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 111.9 | 152.9 | +41 | +36.6 % | 27.975 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.navigate_to_completed_ms` | 363.1 | 482 | +118.9 | +32.8 % | 90.775 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.navigate_to_first_frame_ms` | 457.8 | 600.7 | +142.9 | +31.2 % | 114.45 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.navigate_to_painted_frame_ms` | 461 | 607.8 | +146.8 | +31.8 % | 115.25 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom_scroll.load.navigate_to_painted_frame_ms` | 463 | 590.7 | +127.7 | +27.6 % | 115.75 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 27.4 | 56.9 | +29.5 | +107.7 % | 27.212 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.image_scroll.interval_ms.median` | 20.947 | 26.479 | +5.532 | +26.4 % | 5.237 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.image_scroll.interval_ms.p95` | 36.246 | 45.652 | +9.406 | +25.9 % | 9.062 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.image_scroll.long_intervals_share` | 0.332 | 0.538 | +0.206 | +62.1 % | 0.168 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.key.latency_ms.median` | 22.715 | 36.505 | +13.79 | +60.7 % | 5.679 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.key.pooled_latency_ms` | 23.07 | 36.995 | +13.925 | +60.4 % | 12.85 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.interval_ms.p95` | 23.396 | 34.659 | +11.263 | +48.1 % | 5.849 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.interval_ms.stdev` | 3.824 | 5.657 | +1.833 | +47.9 % | 0.956 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.interval_p99_ms` | 26.113 | 37.555 | +11.442 | +43.8 % | 6.528 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.long_intervals_share` | 0.021 | 0.248 | +0.227 | +1081.0 % | 0.15 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.read_ms.median` | 12.63 | 17.986 | +5.356 | +42.4 % | 3.158 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.usage.client_cpu_percent` | 38.8 | 72.1 | +33.3 | +85.8 % | 9.7 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 97.2 | 149.9 | +52.7 | +54.2 % | 24.3 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.scroll.long_intervals_share` | 0.217 | 0.388 | +0.171 | +78.8 % | 0.13 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.scroll.read_ms.median` | 11.72 | 18.603 | +6.883 | +58.7 % | 2.93 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.scroll.usage.client_cpu_percent` | 27.6 | 61.4 | +33.8 | +122.5 % | 6.9 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.wheel.latency_ms.median` | 30.355 | 41.805 | +11.45 | +37.7 % | 7.589 | **REGRESSION** (different CPU) |
| `webkit+damage/spawn_to_ready_ms` | 34.9 | 46.6 | +11.7 | +33.5 % | 8.725 | **REGRESSION** (different CPU) |
| `webkit+damage/teardown.close_to_closed_ms` | 7.2 | 18.2 | +11 | +152.8 % | 9.47 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.raf.read_ms.median` | 5.202 | 16.281 | +11.079 | +213.0 % | 1.3 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.scroll.interval_ms.p95` | 21.587 | 28.092 | +6.505 | +30.1 % | 5.397 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.scroll.read_ms.median` | 5.186 | 16.422 | +11.236 | +216.7 % | 1.296 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.dom.idle_fps` | 10.5 | 14 | +3.5 | +33.3 % | 2.625 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.dom.navigate_to_completed_ms` | 337 | 459.2 | +122.2 | +36.3 % | 84.25 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.dom.navigate_to_first_frame_ms` | 414.2 | 552.7 | +138.5 | +33.4 % | 103.55 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.dom.navigate_to_painted_frame_ms` | 414.7 | 554 | +139.3 | +33.6 % | 103.675 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.dom_scroll.load.navigate_to_painted_frame_ms` | 433.1 | 553.8 | +120.7 | +27.9 % | 108.275 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.key.latency_ms.p95` | 8.01 | 23.18 | +15.17 | +189.4 % | 11.468 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 109.2 | 148.5 | +39.3 | +36.0 % | 27.3 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom.navigate_to_completed_ms` | 370 | 473.5 | +103.5 | +28.0 % | 92.5 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom.navigate_to_first_frame_ms` | 460.2 | 600.3 | +140.1 | +30.4 % | 115.05 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom.navigate_to_painted_frame_ms` | 465.7 | 603.5 | +137.8 | +29.6 % | 116.425 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.fps` | 57.44 | 42.47 | -14.97 | -26.1 % | 14.36 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.interval_ms.p95` | 26.435 | 34.553 | +8.118 | +30.7 % | 6.609 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.load.navigate_to_painted_frame_ms` | 457.6 | 591.6 | +134 | +29.3 % | 114.4 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.long_intervals_share` | 0.077 | 0.332 | +0.255 | +331.2 % | 0.084 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.pipe_mb_s` | 537.64 | 397.54 | -140.1 | -26.1 % | 134.41 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.read_ms.median` | 11.864 | 18.932 | +7.068 | +59.6 % | 2.966 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.usage.client_cpu_percent` | 32.3 | 63.6 | +31.3 | +96.9 % | 8.075 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.fps` | 48.88 | 36.47 | -12.41 | -25.4 % | 12.22 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.interval_ms.median` | 19.671 | 24.819 | +5.148 | +26.2 % | 4.918 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.interval_ms.p95` | 33.064 | 43.611 | +10.547 | +31.9 % | 8.266 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.interval_p99_ms` | 38.497 | 49.954 | +11.457 | +29.8 % | 9.624 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.load.navigate_to_painted_frame_ms` | 187.4 | 249 | +61.6 | +32.9 % | 46.85 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.long_intervals_share` | 0.25 | 0.494 | +0.244 | +97.6 % | 0.098 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.pipe_mb_s` | 457.54 | 341.4 | -116.14 | -25.4 % | 114.385 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.read_ms.median` | 10.052 | 19.352 | +9.3 | +92.5 % | 4.122 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.image_scroll.usage.client_cpu_percent` | 28.5 | 54.6 | +26.1 | +91.6 % | 7.125 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.latency_ms.median` | 22.48 | 35.46 | +12.98 | +57.7 % | 5.62 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.latency_ms.p95` | 25.34 | 43.48 | +18.14 | +71.6 % | 9.08 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.pooled_latency_ms` | 22.52 | 36.41 | +13.89 | +61.7 % | 12.9 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.interval_ms.p95` | 23.788 | 32.228 | +8.44 | +35.5 % | 5.947 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.interval_p99_ms` | 26.173 | 36.294 | +10.121 | +38.7 % | 6.543 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.load.navigate_to_painted_frame_ms` | 86 | 108.6 | +22.6 | +26.3 % | 21.5 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.long_intervals_share` | 0.021 | 0.209 | +0.188 | +895.2 % | 0.16 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.read_ms.median` | 12.311 | 17.328 | +5.017 | +40.8 % | 3.078 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.usage.client_cpu_percent` | 39.6 | 73.7 | +34.1 | +86.1 % | 9.9 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.fps` | 57.35 | 41.99 | -15.36 | -26.8 % | 14.338 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.interval_ms.median` | 17.098 | 22.736 | +5.638 | +33.0 % | 4.274 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.interval_ms.p95` | 26.172 | 33.946 | +7.774 | +29.7 % | 6.543 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 95.5 | 142.7 | +47.2 | +49.4 % | 23.875 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.long_intervals_share` | 0.063 | 0.383 | +0.32 | +507.9 % | 0.14 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.pipe_mb_s` | 536.81 | 393.05 | -143.76 | -26.8 % | 134.202 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.read_ms.median` | 11.409 | 19.128 | +7.719 | +67.7 % | 2.852 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.usage.client_cpu_percent` | 32.5 | 62.3 | +29.8 | +91.7 % | 8.125 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.wheel.latency_ms.median` | 31.86 | 40.41 | +8.55 | +26.8 % | 7.965 | **REGRESSION** (different CPU) |
| `webkit/teardown.close_to_closed_ms` | 7.7 | 16.5 | +8.8 | +114.3 % | 3.834 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.dom_scroll.interval_ms.stdev` | 2.782 | 1.596 | -1.186 | -42.6 % | 0.696 | better (different CPU) |
| `chromium+damage/scales.2x.image.navigate_to_completed_ms` | 156.8 | 110.7 | -46.1 | -29.4 % | 39.2 | better (different CPU) |
| `chromium/scales.2x.dom_scroll.interval_ms.stdev` | 2.988 | 1.66 | -1.328 | -44.4 % | 0.747 | better (different CPU) |
| `chromium/scales.2x.image.navigate_to_completed_ms` | 157.7 | 108.8 | -48.9 | -31.0 % | 47.32 | better (different CPU) |
| `chromium/scales.2x.raf.interval_ms.stdev` | 1.595 | 0.922 | -0.673 | -42.2 % | 0.588 | better (different CPU) |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 12.85 | 10.575 | -2.275 | -17.7 % | 0.643 | better |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 6.455 | 2.655 | -3.8 | -58.9 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 11.52 | 9.42 | -2.1 | -18.2 % | 0.576 | better |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 12.155 | 10.595 | -1.56 | -12.8 % | 0.608 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 15.08 | 5.8 | -9.28 | -61.5 % | 0.754 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 15.62 | 6.25 | -9.37 | -60.0 % | 0.781 | better |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 3.955 | 2.57 | -1.385 | -35.0 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 1.61 | 0.665 | -0.945 | -58.7 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 3.775 | 2.95 | -0.825 | -21.9 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_draw_full_ms` | 3.855 | 1.51 | -2.345 | -60.8 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 4.28 | 3.3 | -0.98 | -22.9 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 9.82 | 7 | -2.82 | -28.7 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 9.2 | 6.86 | -2.34 | -25.4 % | 0.5 | better |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 2.46 | 1.72 | -0.74 | -30.1 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 5.159 | 4.037 | -1.122 | -21.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 12.723 | 9.877 | -2.846 | -22.4 % | 0.636 | better |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.883 | 3.007 | -0.876 | -22.6 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 12.011 | 9.338 | -2.673 | -22.2 % | 0.601 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 3.137 | 2.443 | -0.694 | -22.1 % | 0.5 | better |
