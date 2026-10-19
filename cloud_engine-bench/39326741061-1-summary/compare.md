# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39303324088-1-summary (run 39303324088)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39326741061)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 802 shared metrics: **52 regressions**, 49 improvements, 553 within noise, 148 descriptive
- not compared: 0 metrics only in the baseline, 31 only in the candidate
- ⚠ `chromium`: different CPU models (AMD EPYC 7763 64-Core Processor → INTEL(R) XEON(R) PLATINUM 8573C); relative threshold raised to 25%
- ⚠ `chromium+damage`: different CPU models (AMD EPYC 7763 64-Core Processor → INTEL(R) XEON(R) PLATINUM 8573C); relative threshold raised to 25%

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 11.52 | 14.705 | +3.185 | +27.7 % | 0.576 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 2.46 | 4.54 | +2.08 | +84.5 % | 0.5 | **REGRESSION** |
| `webkit+damage/scales.1x.dom.navigate_to_completed_ms` | 330.2 | 346.8 | +16.6 | +5.0 % | 16.51 | **REGRESSION** |
| `webkit+damage/scales.2x.dom_scroll.read_ms.median` | 12.504 | 15.646 | +3.142 | +25.1 % | 1.422 | **REGRESSION** |
| `webkit+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 27.4 | 56.8 | +29.4 | +107.3 % | 3 | **REGRESSION** |
| `webkit+damage/scales.2x.image_scroll.fps` | 44.79 | 38.29 | -6.5 | -14.5 % | 2.852 | **REGRESSION** |
| `webkit+damage/scales.2x.image_scroll.interval_ms.p95` | 36.246 | 41.071 | +4.825 | +13.3 % | 3.756 | **REGRESSION** |
| `webkit+damage/scales.2x.image_scroll.long_intervals_share` | 0.332 | 0.476 | +0.144 | +43.4 % | 0.134 | **REGRESSION** |
| `webkit+damage/scales.2x.image_scroll.pipe_mb_s` | 419.25 | 358.41 | -60.84 | -14.5 % | 26.69 | **REGRESSION** |
| `webkit+damage/scales.2x.image_scroll.read_ms.median` | 9.396 | 16.064 | +6.668 | +71.0 % | 4.794 | **REGRESSION** |
| `webkit+damage/scales.2x.image_scroll.usage.client_cpu_percent` | 26.1 | 47.3 | +21.2 | +81.2 % | 4.25 | **REGRESSION** |
| `webkit+damage/scales.2x.key.latency_ms.median` | 22.715 | 33.16 | +10.445 | +46.0 % | 3.654 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.fps` | 57.97 | 49.52 | -8.45 | -14.6 % | 2.899 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.interval_ms.median` | 17.219 | 18.798 | +1.579 | +9.2 % | 1.13 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.interval_ms.p95` | 23.396 | 28.109 | +4.713 | +20.1 % | 1.564 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.interval_p99_ms` | 26.113 | 31.048 | +4.935 | +18.9 % | 1.83 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.load.navigate_to_painted_frame_ms` | 89.8 | 98.1 | +8.3 | +9.2 % | 8.172 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.long_intervals_share` | 0.021 | 0.138 | +0.117 | +557.1 % | 0.046 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.pipe_mb_s` | 542.58 | 463.54 | -79.04 | -14.6 % | 27.129 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.read_ms.median` | 12.63 | 16.483 | +3.853 | +30.5 % | 0.74 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.usage.client_cpu_percent` | 38.8 | 69.6 | +30.8 | +79.4 % | 3.322 | **REGRESSION** |
| `webkit+damage/scales.2x.scroll.read_ms.median` | 11.72 | 15.378 | +3.658 | +31.2 % | 1.462 | **REGRESSION** |
| `webkit+damage/scales.2x.scroll.usage.client_cpu_percent` | 27.6 | 58.4 | +30.8 | +111.6 % | 4.2 | **REGRESSION** |
| `webkit+damage/scales.2x.wheel.latency_ms.p95` | 41 | 45.58 | +4.58 | +11.2 % | 2.616 | **REGRESSION** |
| `webkit+damage/teardown.close_to_closed_ms` | 7.2 | 17.6 | +10.4 | +144.4 % | 7.274 | **REGRESSION** |
| `webkit/pipe_1mib.raf.read_ms.median` | 5.202 | 13.851 | +8.649 | +166.3 % | 1.026 | **REGRESSION** |
| `webkit/pipe_1mib.scroll.read_ms.median` | 5.186 | 13.951 | +8.765 | +169.0 % | 0.542 | **REGRESSION** |
| `webkit/scales.2x.dom_scroll.fps` | 57.44 | 51.79 | -5.65 | -9.8 % | 2.872 | **REGRESSION** |
| `webkit/scales.2x.dom_scroll.pipe_mb_s` | 537.64 | 484.81 | -52.83 | -9.8 % | 26.882 | **REGRESSION** |
| `webkit/scales.2x.dom_scroll.read_ms.median` | 11.864 | 15.986 | +4.122 | +34.7 % | 0.604 | **REGRESSION** |
| `webkit/scales.2x.dom_scroll.usage.client_cpu_percent` | 32.3 | 65.1 | +32.8 | +101.6 % | 3 | **REGRESSION** |
| `webkit/scales.2x.image.navigate_to_completed_ms` | 123.2 | 133.6 | +10.4 | +8.4 % | 6.564 | **REGRESSION** |
| `webkit/scales.2x.image_scroll.fps` | 48.88 | 41.67 | -7.21 | -14.8 % | 3.092 | **REGRESSION** |
| `webkit/scales.2x.image_scroll.load.navigate_to_painted_frame_ms` | 187.4 | 217.4 | +30 | +16.0 % | 24.196 | **REGRESSION** |
| `webkit/scales.2x.image_scroll.long_intervals_share` | 0.25 | 0.389 | +0.139 | +55.6 % | 0.112 | **REGRESSION** |
| `webkit/scales.2x.image_scroll.pipe_mb_s` | 457.54 | 390.03 | -67.51 | -14.8 % | 28.996 | **REGRESSION** |
| `webkit/scales.2x.image_scroll.read_ms.median` | 10.052 | 15.178 | +5.126 | +51.0 % | 4.122 | **REGRESSION** |
| `webkit/scales.2x.image_scroll.usage.client_cpu_percent` | 28.5 | 51.5 | +23 | +80.7 % | 3 | **REGRESSION** |
| `webkit/scales.2x.key.latency_ms.median` | 22.48 | 30.43 | +7.95 | +35.4 % | 1.124 | **REGRESSION** |
| `webkit/scales.2x.key.latency_ms.p95` | 25.34 | 41.59 | +16.25 | +64.1 % | 9.08 | **REGRESSION** |
| `webkit/scales.2x.raf.fps` | 57.99 | 50.92 | -7.07 | -12.2 % | 2.9 | **REGRESSION** |
| `webkit/scales.2x.raf.interval_ms.p95` | 23.788 | 27.952 | +4.164 | +17.5 % | 1.378 | **REGRESSION** |
| `webkit/scales.2x.raf.interval_p99_ms` | 26.173 | 30.597 | +4.424 | +16.9 % | 2.07 | **REGRESSION** |
| `webkit/scales.2x.raf.long_intervals_share` | 0.021 | 0.126 | +0.105 | +500.0 % | 0.044 | **REGRESSION** |
| `webkit/scales.2x.raf.pipe_mb_s` | 542.78 | 476.59 | -66.19 | -12.2 % | 27.139 | **REGRESSION** |
| `webkit/scales.2x.raf.read_ms.median` | 12.311 | 16.152 | +3.841 | +31.2 % | 0.616 | **REGRESSION** |
| `webkit/scales.2x.raf.usage.client_cpu_percent` | 39.6 | 71.1 | +31.5 | +79.5 % | 3 | **REGRESSION** |
| `webkit/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 95.5 | 121.2 | +25.7 | +26.9 % | 14.616 | **REGRESSION** |
| `webkit/scales.2x.scroll.read_ms.median` | 11.409 | 15.382 | +3.973 | +34.8 % | 1.776 | **REGRESSION** |
| `webkit/scales.2x.scroll.usage.client_cpu_percent` | 32.5 | 66.1 | +33.6 | +103.4 % | 3.926 | **REGRESSION** |
| `webkit/scales.2x.wheel.latency_ms.p95` | 41.72 | 45.03 | +3.31 | +7.9 % | 3.058 | **REGRESSION** |
| `webkit/teardown.close_to_closed_ms` | 7.7 | 14.7 | +7 | +90.9 % | 3.834 | **REGRESSION** |
| `chromium+damage/scales.1x.dom.navigate_to_completed_ms` | 309.5 | 231.6 | -77.9 | -25.2 % | 77.375 | better (different CPU) |
| `chromium+damage/scales.1x.scroll.usage.cpu_percent` | 30.9 | 21.8 | -9.1 | -29.4 % | 7.725 | better (different CPU) |
| `chromium+damage/scales.2x.raf.interval_ms.stdev` | 1.547 | 0.892 | -0.655 | -42.3 % | 0.5 | better (different CPU) |
| `chromium/scales.1x.dom_scroll.load.navigate_to_painted_frame_ms` | 309.1 | 229.9 | -79.2 | -25.6 % | 77.275 | better (different CPU) |
| `chromium/scales.2x.dom.navigate_to_completed_ms` | 320 | 230.9 | -89.1 | -27.8 % | 80 | better (different CPU) |
| `chromium/scales.2x.dom.navigate_to_first_frame_ms` | 328.4 | 245.3 | -83.1 | -25.3 % | 82.1 | better (different CPU) |
| `chromium/scales.2x.raf.interval_ms.stdev` | 1.595 | 0.909 | -0.686 | -43.0 % | 0.5 | better (different CPU) |
| `chromium/scales.2x.scroll.interval_ms.stdev` | 2.626 | 1.932 | -0.694 | -26.4 % | 0.656 | better (different CPU) |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 2.605 | 1.915 | -0.69 | -26.5 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 15.08 | 14.175 | -0.905 | -6.0 % | 0.754 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 11.34 | 10.48 | -0.86 | -7.6 % | 0.567 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 9.82 | 8.44 | -1.38 | -14.1 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 9.2 | 7.98 | -1.22 | -13.3 % | 0.5 | better |
| `webkit+damage/after_create_usage.pss_mb` | 304.2 | 262 | -42.2 | -13.9 % | 15.21 | better |
| `webkit+damage/after_create_usage.rss_mb` | 433.3 | 398.4 | -34.9 | -8.1 % | 21.665 | better |
| `webkit+damage/scales.1x.dom_scroll.load.navigate_to_painted_frame_ms` | 432.7 | 410.8 | -21.9 | -5.1 % | 21.635 | better |
| `webkit+damage/scales.1x.dom_scroll.usage.cpu_percent` | 66.2 | 54.2 | -12 | -18.1 % | 5.496 | better |
| `webkit+damage/scales.1x.dom_scroll.usage.pss_mb` | 472 | 435.7 | -36.3 | -7.7 % | 23.6 | better |
| `webkit+damage/scales.1x.image_scroll.usage.cpu_percent` | 105.5 | 87.9 | -17.6 | -16.7 % | 7.792 | better |
| `webkit+damage/scales.1x.image_scroll.usage.pss_mb` | 405 | 366.6 | -38.4 | -9.5 % | 20.25 | better |
| `webkit+damage/scales.1x.image_scroll.usage.rss_mb` | 534.7 | 504 | -30.7 | -5.7 % | 26.735 | better |
| `webkit+damage/scales.1x.raf.usage.cpu_percent` | 63.9 | 54.3 | -9.6 | -15.0 % | 4.238 | better |
| `webkit+damage/scales.1x.raf.usage.pss_mb` | 310.9 | 272.3 | -38.6 | -12.4 % | 15.545 | better |
| `webkit+damage/scales.1x.raf.usage.rss_mb` | 440.6 | 409 | -31.6 | -7.2 % | 22.03 | better |
| `webkit+damage/scales.1x.scroll.usage.cpu_percent` | 64.4 | 53.3 | -11.1 | -17.2 % | 3.22 | better |
| `webkit+damage/scales.1x.scroll.usage.pss_mb` | 333.8 | 294.1 | -39.7 | -11.9 % | 16.69 | better |
| `webkit+damage/scales.1x.scroll.usage.rss_mb` | 463.4 | 430.7 | -32.7 | -7.1 % | 23.17 | better |
| `webkit+damage/scales.2x.dom_scroll.interval_ms.stdev` | 7.188 | 6.413 | -0.775 | -10.8 % | 0.5 | better |
| `webkit+damage/scales.2x.image_scroll.usage.cpu_percent` | 285.6 | 259.1 | -26.5 | -9.3 % | 14.28 | better |
| `webkit+damage/scales.2x.image_scroll.usage.pss_mb` | 543.8 | 511.5 | -32.3 | -5.9 % | 27.19 | better |
| `webkit+damage/scales.2x.raf.usage.pss_mb` | 467.7 | 433.3 | -34.4 | -7.4 % | 31.724 | better |
| `webkit+damage/scales.2x.scroll.interval_ms.stdev` | 7.143 | 6.119 | -1.024 | -14.3 % | 0.5 | better |
| `webkit+damage/scales.2x.scroll.usage.pss_mb` | 504.6 | 467.7 | -36.9 | -7.3 % | 25.23 | better |
| `webkit/after_create_usage.pss_mb` | 306 | 260.7 | -45.3 | -14.8 % | 15.3 | better |
| `webkit/after_create_usage.rss_mb` | 435.1 | 397.9 | -37.2 | -8.6 % | 21.755 | better |
| `webkit/scales.1x.dom_scroll.usage.cpu_percent` | 64 | 56.6 | -7.4 | -11.6 % | 7.068 | better |
| `webkit/scales.1x.dom_scroll.usage.pss_mb` | 471.3 | 434.1 | -37.2 | -7.9 % | 23.565 | better |
| `webkit/scales.1x.image_scroll.usage.cpu_percent` | 105 | 94.3 | -10.7 | -10.2 % | 8.772 | better |
| `webkit/scales.1x.image_scroll.usage.pss_mb` | 403.5 | 364.9 | -38.6 | -9.6 % | 20.175 | better |
| `webkit/scales.1x.image_scroll.usage.rss_mb` | 534 | 503 | -31 | -5.8 % | 26.7 | better |
| `webkit/scales.1x.raf.usage.cpu_percent` | 60.9 | 53.5 | -7.4 | -12.2 % | 6.958 | better |
| `webkit/scales.1x.raf.usage.pss_mb` | 312.8 | 270.9 | -41.9 | -13.4 % | 15.64 | better |
| `webkit/scales.1x.raf.usage.rss_mb` | 442.5 | 408.9 | -33.6 | -7.6 % | 22.125 | better |
| `webkit/scales.1x.scroll.usage.pss_mb` | 334.9 | 292.9 | -42 | -12.5 % | 16.745 | better |
| `webkit/scales.1x.scroll.usage.rss_mb` | 464.2 | 431 | -33.2 | -7.1 % | 23.21 | better |
| `webkit/scales.2x.dom_scroll.usage.pss_mb` | 597.2 | 566.4 | -30.8 | -5.2 % | 29.86 | better |
| `webkit/scales.2x.image_scroll.usage.cpu_percent` | 288.3 | 260.3 | -28 | -9.7 % | 14.415 | better |
| `webkit/scales.2x.raf.usage.pss_mb` | 464.3 | 426.7 | -37.6 | -8.1 % | 29.846 | better |
| `webkit/scales.2x.scroll.usage.pss_mb` | 500.4 | 467.6 | -32.8 | -6.6 % | 25.02 | better |
