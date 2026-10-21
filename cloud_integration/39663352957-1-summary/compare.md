# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39663352957)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 802 shared metrics: **39 regressions**, 93 improvements, 522 within noise, 148 descriptive
- not compared: 139 metrics only in the baseline, 369 only in the candidate
- ⚠ `chromium`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%
- ⚠ `chromium+damage`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `chromium+damage/navigation.navigate_to_completed_ms` | 11.5 | 14.4 | +2.9 | +25.2 % | 2.875 | **REGRESSION** (different CPU) |
| `chromium+damage/navigation.navigate_to_painted_frame_ms` | 18 | 23.7 | +5.7 | +31.7 % | 4.5 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.1x.dom.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.1x.dom_scroll.load.navigate_to_painted_frame_ms` | 248.1 | 322.6 | +74.5 | +30.0 % | 62.025 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.1x.image.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.1x.image.navigate_to_completed_ms` | 122.9 | 153.8 | +30.9 | +25.1 % | 30.725 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.dom.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.image.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.image.navigate_to_completed_ms` | 110.7 | 155.2 | +44.5 | +40.2 % | 33.924 | **REGRESSION** (different CPU) |
| `chromium/scales.1x.dom.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium/scales.1x.image.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.dom.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.dom_scroll.load.navigate_to_painted_frame_ms` | 246.6 | 314.1 | +67.5 | +27.4 % | 63.946 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.image.idle_fps` | 0 | 4 | +4 | — | 1 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.image.navigate_to_completed_ms` | 108.8 | 156.4 | +47.6 | +43.8 % | 27.624 | **REGRESSION** (different CPU) |
| `chromium/scales.2x.image.navigate_to_first_frame_ms` | 128.1 | 166.8 | +38.7 | +30.2 % | 32.025 | **REGRESSION** (different CPU) |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 15.105 | +4.53 | +42.8 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 6.045 | +3.39 | +127.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 14.71 | +5.29 | +56.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 16.125 | +5.53 | +52.2 % | 0.53 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.805 | +1.235 | +48.0 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.49 | +0.825 | +124.1 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_damage10_ms` | 2.96 | 3.935 | +0.975 | +32.9 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 4.34 | +0.76 | +21.2 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 19.66 | +1.96 | +11.1 % | 0.885 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 3.82 | +0.52 | +15.8 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 5.92 | +1.4 | +31.0 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 1.72 | 2.34 | +0.62 | +36.0 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 5.203 | +1.166 | +28.9 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 3.666 | +0.659 | +21.9 % | 0.5 | **REGRESSION** |
| `webkit+damage/create.create_to_first_frame_ms` | 447.5 | 473.3 | +25.8 | +5.8 % | 23.794 | **REGRESSION** |
| `webkit+damage/create.create_to_painted_frame_ms` | 448.2 | 473.9 | +25.7 | +5.7 % | 23.75 | **REGRESSION** |
| `webkit+damage/scales.2x.raf.usage.client_cpu_percent` | 72.1 | 77.8 | +5.7 | +7.9 % | 5.03 | **REGRESSION** |
| `webkit+damage/scales.2x.scroll.usage.client_cpu_percent` | 61.4 | 69.8 | +8.4 | +13.7 % | 3.788 | **REGRESSION** |
| `webkit/create.create_to_first_frame_ms` | 435.1 | 475.7 | +40.6 | +9.3 % | 21.755 | **REGRESSION** |
| `webkit/create.create_to_painted_frame_ms` | 435.8 | 476.3 | +40.5 | +9.3 % | 21.79 | **REGRESSION** |
| `webkit/scales.2x.dom.idle_fps` | 11 | 14 | +3 | +27.3 % | 1.72 | **REGRESSION** |
| `webkit/scales.2x.dom_scroll.usage.client_cpu_percent` | 63.6 | 73.4 | +9.8 | +15.4 % | 7.828 | **REGRESSION** |
| `webkit/scales.2x.scroll.usage.client_cpu_percent` | 62.3 | 72.4 | +10.1 | +16.2 % | 6.548 | **REGRESSION** |
| `chromium+damage/scales.2x.dom_scroll.read_ms.median` | 16.113 | 6.165 | -9.948 | -61.7 % | 4.028 | better (different CPU) |
| `chromium+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 76.7 | 30.9 | -45.8 | -59.7 % | 19.175 | better (different CPU) |
| `chromium+damage/scales.2x.image_scroll.read_ms.median` | 16.514 | 6.703 | -9.811 | -59.4 % | 4.128 | better (different CPU) |
| `chromium+damage/scales.2x.image_scroll.usage.client_cpu_percent` | 77.1 | 32.3 | -44.8 | -58.1 % | 19.275 | better (different CPU) |
| `chromium+damage/scales.2x.key.latency_ms.median` | 16.42 | 9.43 | -6.99 | -42.6 % | 4.105 | better (different CPU) |
| `chromium+damage/scales.2x.key.latency_ms.p95` | 19.91 | 10.58 | -9.33 | -46.9 % | 4.978 | better (different CPU) |
| `chromium+damage/scales.2x.key.pooled_latency_ms` | 15.745 | 9.545 | -6.2 | -39.4 % | 5.992 | better (different CPU) |
| `chromium+damage/scales.2x.raf.read_ms.median` | 15.598 | 6.064 | -9.534 | -61.1 % | 3.9 | better (different CPU) |
| `chromium+damage/scales.2x.raf.usage.client_cpu_percent` | 80.3 | 34.5 | -45.8 | -57.0 % | 20.075 | better (different CPU) |
| `chromium+damage/scales.2x.scroll.interval_ms.stdev` | 3.228 | 1.667 | -1.561 | -48.4 % | 0.807 | better (different CPU) |
| `chromium+damage/scales.2x.scroll.read_ms.median` | 16.012 | 6.06 | -9.952 | -62.2 % | 4.003 | better (different CPU) |
| `chromium+damage/scales.2x.scroll.usage.client_cpu_percent` | 74.7 | 30.3 | -44.4 | -59.4 % | 18.675 | better (different CPU) |
| `chromium+damage/scales.2x.wheel.latency_ms.median` | 16.415 | 11.205 | -5.21 | -31.7 % | 4.478 | better (different CPU) |
| `chromium+damage/scales.2x.wheel.latency_ms.p95` | 23.94 | 13.43 | -10.51 | -43.9 % | 5.985 | better (different CPU) |
| `chromium/pipe_1mib.raf.read_ms.median` | 12.087 | 6.146 | -5.941 | -49.1 % | 3.022 | better (different CPU) |
| `chromium/pipe_1mib.scroll.read_ms.median` | 12.425 | 6.141 | -6.284 | -50.6 % | 3.106 | better (different CPU) |
| `chromium/scales.1x.image_scroll.interval_ms.stdev` | 1.214 | 0.625 | -0.589 | -48.5 % | 0.5 | better (different CPU) |
| `chromium/scales.2x.dom_scroll.read_ms.median` | 16.012 | 6.232 | -9.78 | -61.1 % | 4.003 | better (different CPU) |
| `chromium/scales.2x.dom_scroll.usage.client_cpu_percent` | 76.3 | 31.5 | -44.8 | -58.7 % | 19.075 | better (different CPU) |
| `chromium/scales.2x.image_scroll.read_ms.median` | 16.428 | 6.769 | -9.659 | -58.8 % | 4.107 | better (different CPU) |
| `chromium/scales.2x.image_scroll.usage.client_cpu_percent` | 76.7 | 32.7 | -44 | -57.4 % | 19.175 | better (different CPU) |
| `chromium/scales.2x.key.latency_ms.median` | 16.995 | 8.92 | -8.075 | -47.5 % | 4.249 | better (different CPU) |
| `chromium/scales.2x.key.latency_ms.p95` | 20.01 | 9.75 | -10.26 | -51.3 % | 5.003 | better (different CPU) |
| `chromium/scales.2x.key.pooled_latency_ms` | 18.025 | 8.9 | -9.125 | -50.6 % | 6.396 | better (different CPU) |
| `chromium/scales.2x.raf.read_ms.median` | 15.552 | 6.1 | -9.452 | -60.8 % | 3.888 | better (different CPU) |
| `chromium/scales.2x.raf.usage.client_cpu_percent` | 81 | 35 | -46 | -56.8 % | 20.25 | better (different CPU) |
| `chromium/scales.2x.scroll.interval_ms.stdev` | 2.728 | 1.785 | -0.943 | -34.6 % | 0.698 | better (different CPU) |
| `chromium/scales.2x.scroll.read_ms.median` | 15.924 | 6.101 | -9.823 | -61.7 % | 3.981 | better (different CPU) |
| `chromium/scales.2x.scroll.usage.client_cpu_percent` | 74.5 | 30.7 | -43.8 | -58.8 % | 18.625 | better (different CPU) |
| `chromium/scales.2x.wheel.latency_ms.median` | 16.2 | 11.275 | -4.925 | -30.4 % | 4.05 | better (different CPU) |
| `chromium/scales.2x.wheel.latency_ms.p95` | 22.96 | 12.36 | -10.6 | -46.2 % | 5.74 | better (different CPU) |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 5.18 | -0.62 | -10.7 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 3.04 | -0.635 | -17.3 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.485 | -1.465 | -49.7 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 5.26 | -1.74 | -24.9 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 5.78 | -1.08 | -15.7 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 5.693 | -4.184 | -42.4 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 3.675 | -5.663 | -60.6 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.406 | -1.037 | -42.4 % | 0.5 | better |
| `webkit+damage/scales.1x.key.latency_ms.median` | 22.805 | 7.29 | -15.515 | -68.0 % | 11.988 | better |
| `webkit+damage/scales.1x.key.latency_ms.p95` | 23.52 | 8.14 | -15.38 | -65.4 % | 12.944 | better |
| `webkit+damage/scales.1x.key.pooled_latency_ms` | 22.82 | 7.355 | -15.465 | -67.8 % | 13.934 | better |
| `webkit+damage/scales.1x.raf.usage.cpu_percent` | 68.4 | 61 | -7.4 | -10.8 % | 5.888 | better |
| `webkit+damage/scales.2x.dom_scroll.fps` | 39.43 | 50.14 | +10.71 | +27.2 % | 10.346 | better |
| `webkit+damage/scales.2x.dom_scroll.interval_ms.p95` | 36.452 | 29.675 | -6.777 | -18.6 % | 3.04 | better |
| `webkit+damage/scales.2x.dom_scroll.interval_ms.stdev` | 6.311 | 4.039 | -2.272 | -36.0 % | 0.5 | better |
| `webkit+damage/scales.2x.dom_scroll.long_intervals_share` | 0.431 | 0.077 | -0.354 | -82.1 % | 0.29 | better |
| `webkit+damage/scales.2x.dom_scroll.pipe_mb_s` | 369.1 | 469.35 | +100.25 | +27.2 % | 96.878 | better |
| `webkit+damage/scales.2x.image_scroll.interval_ms.stdev` | 8.905 | 7.075 | -1.83 | -20.5 % | 1.066 | better |
| `webkit+damage/scales.2x.raf.fps` | 43.74 | 50.38 | +6.64 | +15.2 % | 4.532 | better |
| `webkit+damage/scales.2x.raf.interval_ms.p95` | 34.659 | 24.544 | -10.115 | -29.2 % | 2.316 | better |
| `webkit+damage/scales.2x.raf.interval_ms.stdev` | 5.657 | 2.934 | -2.723 | -48.1 % | 0.69 | better |
| `webkit+damage/scales.2x.raf.interval_p99_ms` | 37.555 | 30.207 | -7.348 | -19.6 % | 2.724 | better |
| `webkit+damage/scales.2x.raf.long_intervals_share` | 0.248 | 0.043 | -0.205 | -82.7 % | 0.15 | better |
| `webkit+damage/scales.2x.raf.pipe_mb_s` | 409.4 | 471.55 | +62.15 | +15.2 % | 42.364 | better |
| `webkit+damage/scales.2x.raf.read_ms.median` | 17.986 | 16.054 | -1.932 | -10.7 % | 1.568 | better |
| `webkit+damage/scales.2x.scroll.fps` | 41.33 | 49.32 | +7.99 | +19.3 % | 2.85 | better |
| `webkit+damage/scales.2x.scroll.interval_ms.stdev` | 6.204 | 4.78 | -1.424 | -22.9 % | 0.994 | better |
| `webkit+damage/scales.2x.scroll.long_intervals_share` | 0.388 | 0.105 | -0.283 | -72.9 % | 0.13 | better |
| `webkit+damage/scales.2x.scroll.pipe_mb_s` | 386.83 | 461.66 | +74.83 | +19.3 % | 26.674 | better |
| `webkit+damage/scales.2x.scroll.read_ms.median` | 18.603 | 16.111 | -2.492 | -13.4 % | 1.532 | better |
| `webkit+damage/scales.2x.wheel.latency_ms.median` | 41.805 | 33.005 | -8.8 | -21.1 % | 4.976 | better |
| `webkit+damage/scales.2x.wheel.latency_ms.p95` | 50.97 | 47.01 | -3.96 | -7.8 % | 3.64 | better |
| `webkit+damage/spawn_to_ready_ms` | 46.6 | 38.9 | -7.7 | -16.5 % | 6.684 | better |
| `webkit/scales.1x.image_scroll.load.navigate_to_painted_frame_ms` | 192.3 | 181.5 | -10.8 | -5.6 % | 10.672 | better |
| `webkit/scales.1x.key.latency_ms.p95` | 23.18 | 7.84 | -15.34 | -66.2 % | 12.646 | better |
| `webkit/scales.2x.dom_scroll.fps` | 42.47 | 53.27 | +10.8 | +25.4 % | 4.954 | better |
| `webkit/scales.2x.dom_scroll.interval_ms.median` | 20.94 | 17.407 | -3.533 | -16.9 % | 2.424 | better |
| `webkit/scales.2x.dom_scroll.interval_ms.p95` | 34.553 | 25.125 | -9.428 | -27.3 % | 5.192 | better |
| `webkit/scales.2x.dom_scroll.interval_ms.stdev` | 5.983 | 3.5 | -2.483 | -41.5 % | 1.088 | better |
| `webkit/scales.2x.dom_scroll.interval_p99_ms` | 37.597 | 33.121 | -4.476 | -11.9 % | 3.056 | better |
| `webkit/scales.2x.dom_scroll.long_intervals_share` | 0.332 | 0.052 | -0.28 | -84.3 % | 0.104 | better |
| `webkit/scales.2x.dom_scroll.pipe_mb_s` | 397.54 | 498.64 | +101.1 | +25.4 % | 46.4 | better |
| `webkit/scales.2x.dom_scroll.read_ms.median` | 18.932 | 16.012 | -2.92 | -15.4 % | 1.744 | better |
| `webkit/scales.2x.image_scroll.fps` | 36.47 | 40.34 | +3.87 | +10.6 % | 1.872 | better |
| `webkit/scales.2x.image_scroll.interval_ms.p95` | 43.611 | 33.684 | -9.927 | -22.8 % | 4.656 | better |
| `webkit/scales.2x.image_scroll.interval_ms.stdev` | 7.858 | 5.133 | -2.725 | -34.7 % | 1.082 | better |
| `webkit/scales.2x.image_scroll.interval_p99_ms` | 49.954 | 41.671 | -8.283 | -16.6 % | 4.358 | better |
| `webkit/scales.2x.image_scroll.long_intervals_share` | 0.494 | 0.415 | -0.079 | -16.0 % | 0.068 | better |
| `webkit/scales.2x.image_scroll.pipe_mb_s` | 341.4 | 377.56 | +36.16 | +10.6 % | 17.548 | better |
| `webkit/scales.2x.raf.fps` | 46.15 | 53.45 | +7.3 | +15.8 % | 4.532 | better |
| `webkit/scales.2x.raf.interval_ms.p95` | 32.228 | 25.065 | -7.163 | -22.2 % | 3.012 | better |
| `webkit/scales.2x.raf.interval_ms.stdev` | 5.107 | 3.133 | -1.974 | -38.6 % | 1.194 | better |
| `webkit/scales.2x.raf.interval_p99_ms` | 36.294 | 29.572 | -6.722 | -18.5 % | 4.194 | better |
| `webkit/scales.2x.raf.pipe_mb_s` | 431.95 | 500.27 | +68.32 | +15.8 % | 42.424 | better |
| `webkit/scales.2x.scroll.fps` | 41.99 | 52.97 | +10.98 | +26.2 % | 4.458 | better |
| `webkit/scales.2x.scroll.interval_ms.median` | 22.736 | 17.78 | -4.956 | -21.8 % | 3.408 | better |
| `webkit/scales.2x.scroll.interval_ms.p95` | 33.946 | 26.014 | -7.932 | -23.4 % | 2.894 | better |
| `webkit/scales.2x.scroll.interval_ms.stdev` | 5.69 | 3.699 | -1.991 | -35.0 % | 0.63 | better |
| `webkit/scales.2x.scroll.interval_p99_ms` | 37.199 | 33.296 | -3.903 | -10.5 % | 1.86 | better |
| `webkit/scales.2x.scroll.long_intervals_share` | 0.383 | 0.07 | -0.313 | -81.7 % | 0.14 | better |
| `webkit/scales.2x.scroll.pipe_mb_s` | 393.05 | 495.79 | +102.74 | +26.1 % | 41.76 | better |
| `webkit/scales.2x.scroll.read_ms.median` | 19.128 | 15.896 | -3.232 | -16.9 % | 1.842 | better |
