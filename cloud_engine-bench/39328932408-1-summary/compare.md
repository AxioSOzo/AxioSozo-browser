# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39303324088-1-summary (run 39303324088)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39328932408)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 802 shared metrics: **11 regressions**, 49 improvements, 594 within noise, 148 descriptive
- not compared: 0 metrics only in the baseline, 139 only in the candidate
- ⚠ `webkit`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%
- ⚠ `webkit+damage`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `chromium+damage/scales.2x.image_scroll.usage.client_cpu_percent` | 37.4 | 42.5 | +5.1 | +13.6 % | 5.096 | **REGRESSION** |
| `chromium+damage/teardown.close_to_exit_ms` | 84.6 | 129.1 | +44.5 | +52.6 % | 43.804 | **REGRESSION** |
| `chromium+damage/teardown.close_to_no_helpers_ms` | 90.6 | 135.2 | +44.6 | +49.2 % | 43.332 | **REGRESSION** |
| `webkit+damage/scales.2x.key.latency_ms.median` | 22.715 | 36.4 | +13.685 | +60.2 % | 5.679 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.key.pooled_latency_ms` | 23.07 | 36.475 | +13.405 | +58.1 % | 12.572 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.long_intervals_share` | 0.021 | 0.052 | +0.031 | +147.6 % | 0.026 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.raf.read_ms.median` | 5.202 | 8.833 | +3.631 | +69.8 % | 1.3 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.scroll.read_ms.median` | 5.186 | 7.91 | +2.724 | +52.5 % | 1.296 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 109.2 | 138.6 | +29.4 | +26.9 % | 27.3 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.latency_ms.p95` | 25.34 | 38.15 | +12.81 | +50.5 % | 9.08 | **REGRESSION** (different CPU) |
| `webkit/spawn_to_ready_ms` | 33.6 | 42.5 | +8.9 | +26.5 % | 8.4 | **REGRESSION** (different CPU) |
| `chromium+damage/navigation.navigate_to_completed_ms` | 14.9 | 13.2 | -1.7 | -11.4 % | 1.138 | better |
| `chromium+damage/scales.1x.dom.navigate_to_completed_ms` | 309.5 | 261.2 | -48.3 | -15.6 % | 45.652 | better |
| `chromium+damage/scales.1x.dom.navigate_to_first_frame_ms` | 312.4 | 264.2 | -48.2 | -15.4 % | 47.034 | better |
| `chromium+damage/scales.1x.dom.navigate_to_painted_frame_ms` | 391 | 339.7 | -51.3 | -13.1 % | 51.246 | better |
| `chromium+damage/scales.1x.image_scroll.usage.cpu_percent` | 48.8 | 43.8 | -5 | -10.2 % | 3 | better |
| `chromium+damage/scales.1x.scroll.usage.cpu_percent` | 30.9 | 27.1 | -3.8 | -12.3 % | 3 | better |
| `chromium+damage/scales.2x.key.latency_ms.median` | 13.715 | 12.775 | -0.94 | -6.9 % | 0.686 | better |
| `chromium+damage/scales.2x.key.latency_ms.p95` | 15.2 | 14.35 | -0.85 | -5.6 % | 0.76 | better |
| `chromium+damage/scales.2x.wheel.latency_ms.p95` | 18.37 | 15.04 | -3.33 | -18.1 % | 1.782 | better |
| `chromium+damage/spawn_to_ready_ms` | 208.9 | 191.5 | -17.4 | -8.3 % | 16.344 | better |
| `chromium/navigation.navigate_to_completed_ms` | 14.9 | 13.8 | -1.1 | -7.4 % | 0.938 | better |
| `chromium/pipe_1mib.scroll.usage.cpu_percent` | 64.7 | 61.1 | -3.6 | -5.6 % | 3.235 | better |
| `chromium/scales.2x.dom_scroll.usage.cpu_percent` | 87.9 | 83.1 | -4.8 | -5.5 % | 4.518 | better |
| `chromium/scales.2x.image_scroll.usage.cpu_percent` | 135.1 | 126.6 | -8.5 | -6.3 % | 6.755 | better |
| `chromium/scales.2x.scroll.usage.cpu_percent` | 82.8 | 78.2 | -4.6 | -5.6 % | 4.14 | better |
| `chromium/scales.2x.wheel.latency_ms.p95` | 17.64 | 15.41 | -2.23 | -12.6 % | 1.008 | better |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 2.605 | 1.305 | -1.3 | -49.9 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 12.85 | 7.16 | -5.69 | -44.3 % | 0.643 | better |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 6.455 | 4.73 | -1.725 | -26.7 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 11.52 | 7.505 | -4.015 | -34.8 % | 0.576 | better |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 12.155 | 7.6 | -4.555 | -37.5 % | 0.608 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 15.08 | 7.33 | -7.75 | -51.4 % | 0.754 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 15.62 | 7.74 | -7.88 | -50.4 % | 0.781 | better |
| `presenter-chromium/900x650/alloc_copy_ms` | 1.245 | 0.66 | -0.585 | -47.0 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 3.955 | 2.23 | -1.725 | -43.6 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 1.61 | 0.83 | -0.78 | -48.4 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_damage10_ms` | 3.095 | 1.945 | -1.15 | -37.2 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.29 | 2.035 | -1.255 | -38.1 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 3.775 | 1.85 | -1.925 | -51.0 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_draw_full_ms` | 3.855 | 1.815 | -2.04 | -52.9 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 11.34 | 6.92 | -4.42 | -39.0 % | 0.567 | better |
| `presenter-firefox/1800x1300/candidate_damage10_fast_put_ms` | 1.22 | 0.62 | -0.6 | -49.2 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 4.28 | 2.82 | -1.46 | -34.1 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 9.82 | 4.6 | -5.22 | -53.2 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 9.2 | 4.26 | -4.94 | -53.7 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 3.96 | 2.86 | -1.1 | -27.8 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_u32_fast_path_ms` | 1.22 | 0.7 | -0.52 | -42.6 % | 0.5 | better |
| `presenter-firefox/900x650/presenter_bgraToRGBA_ms` | 2.12 | 1.04 | -1.08 | -50.9 % | 0.5 | better |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 2.46 | 1.3 | -1.16 | -47.1 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 5.159 | 2.877 | -2.282 | -44.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 12.723 | 6.046 | -6.677 | -52.5 % | 0.636 | better |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.883 | 2.027 | -1.856 | -47.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 12.011 | 5.741 | -6.27 | -52.2 % | 0.601 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/candidate_u32_opaque_fast_path_ms` | 1.294 | 0.71 | -0.584 | -45.1 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 3.137 | 1.544 | -1.593 | -50.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650/candidate_u32_opaque_fast_path_ms` | 1.474 | 0.804 | -0.67 | -45.5 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650/presenter_bgraToRGBA_ms` | 2.104 | 1.101 | -1.003 | -47.7 % | 0.5 | better |
| `webkit+damage/scales.1x.dom_scroll.interval_ms.p95` | 33.749 | 20.187 | -13.562 | -40.2 % | 9.702 | better (different CPU) |
| `webkit+damage/scales.1x.dom_scroll.long_intervals_share` | 0.066 | 0.043 | -0.023 | -34.8 % | 0.02 | better (different CPU) |
