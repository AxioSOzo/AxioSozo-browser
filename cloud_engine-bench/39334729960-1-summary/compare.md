# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39334729960)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 941 shared metrics: **30 regressions**, 90 improvements, 644 within noise, 177 descriptive
- not compared: 0 metrics only in the baseline, 8 only in the candidate
- ⚠ `webkit`: different CPU models (AMD EPYC 7763 64-Core Processor → AMD EPYC 9V74 80-Core Processor); relative threshold raised to 25%
- ⚠ `webkit+damage`: different CPU models (AMD EPYC 7763 64-Core Processor → AMD EPYC 9V74 80-Core Processor); relative threshold raised to 25%
- ⚠ `zen-chromium`: different CPU models (INTEL(R) XEON(R) PLATINUM 8573C → AMD EPYC 9V74 80-Core Processor); relative threshold raised to 25%
- ⚠ `zen-gecko`: different CPU models (AMD EPYC 7763 64-Core Processor → AMD EPYC 9V74 80-Core Processor); relative threshold raised to 25%
- ⚠ `zen-gecko-debian`: different CPU models (INTEL(R) XEON(R) PLATINUM 8573C → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%
- ⚠ `zen-webkit`: different CPU models (INTEL(R) XEON(R) PLATINUM 8573C → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `chromium+damage/scales.2x.image_scroll.interval_ms.stdev` | 2.21 | 2.725 | +0.515 | +23.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 12.245 | +1.67 | +15.8 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 5.94 | +3.285 | +123.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 11.75 | +2.33 | +24.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 13.13 | +2.535 | +23.9 % | 0.53 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 14.315 | +8.515 | +146.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 14.87 | +8.62 | +137.9 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.695 | +1.125 | +43.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.485 | +0.82 | +123.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 3.535 | +0.585 | +19.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/presenter_draw_full_ms` | 1.51 | 3.65 | +2.14 | +141.7 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 3.92 | +0.62 | +18.8 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 7.88 | +0.88 | +12.6 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 8.06 | +1.2 | +17.5 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_bgraToRGBA_ms` | 1.64 | 2.7 | +1.06 | +64.6 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 1.72 | 2.88 | +1.16 | +67.4 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 5.206 | +1.169 | +29.0 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 12.264 | +2.387 | +24.2 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 3.675 | +0.668 | +22.2 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 11.541 | +2.203 | +23.6 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 3.049 | +0.606 | +24.8 % | 0.5 | **REGRESSION** |
| `zen-gecko-debian/dom.navigate_to_title_wall_ms` | 134.5 | 187 | +52.5 | +39.0 % | 33.625 | **REGRESSION** (different CPU) |
| `zen-gecko-debian/raf.window.usage.cpu_percent` | 22.2 | 29.6 | +7.4 | +33.3 % | 5.55 | **REGRESSION** (different CPU) |
| `zen-gecko-debian/scroll.window.usage.cpu_percent` | 39.1 | 53 | +13.9 | +35.5 % | 9.775 | **REGRESSION** (different CPU) |
| `zen-webkit/image_scroll.window.interval_p99_ms` | 122.476 | 10893 | +10770.5 | +8794.0 % | 30.619 | **REGRESSION** (different CPU) |
| `zen-webkit/raf.window.fps` | 47.92 | 35.81 | -12.11 | -25.3 % | 11.98 | **REGRESSION** (different CPU) |
| `zen-webkit/raf.window.fps_whole_window` | 48.01 | 35.87 | -12.14 | -25.3 % | 12.002 | **REGRESSION** (different CPU) |
| `zen-webkit/raf.window.interval_ms.median` | 19.903 | 27.006 | +7.103 | +35.7 % | 4.976 | **REGRESSION** (different CPU) |
| `zen-webkit/raf.window.long_intervals_share` | 0.069 | 0.761 | +0.692 | +1002.9 % | 0.088 | **REGRESSION** (different CPU) |
| `zen-webkit/scroll.window.long_intervals_share` | 0.471 | 0.777 | +0.306 | +65.0 % | 0.184 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.1x.dom.navigate_to_completed_ms` | 259.2 | 213.2 | -46 | -17.8 % | 13.012 | better |
| `chromium+damage/scales.1x.dom.navigate_to_first_frame_ms` | 264.6 | 215.6 | -49 | -18.5 % | 13.266 | better |
| `chromium+damage/scales.1x.dom.navigate_to_painted_frame_ms` | 328.4 | 278.4 | -50 | -15.2 % | 21.526 | better |
| `chromium+damage/scales.1x.image.navigate_to_completed_ms` | 122.9 | 95.8 | -27.1 | -22.1 % | 23.536 | better |
| `chromium+damage/scales.1x.image.navigate_to_first_frame_ms` | 126 | 98.7 | -27.3 | -21.7 % | 22.454 | better |
| `chromium+damage/scales.1x.image_scroll.usage.cpu_percent` | 39 | 35.9 | -3.1 | -8.0 % | 3.004 | better |
| `chromium+damage/scales.1x.raf.usage.cpu_percent` | 21.1 | 17.1 | -4 | -19.0 % | 3.23 | better |
| `chromium+damage/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 48.7 | 45.8 | -2.9 | -5.9 % | 2.892 | better |
| `chromium+damage/scales.2x.dom.navigate_to_completed_ms` | 303.7 | 217.7 | -86 | -28.3 % | 44.218 | better |
| `chromium+damage/scales.2x.dom.navigate_to_first_frame_ms` | 325.1 | 227.7 | -97.4 | -30.0 % | 43.868 | better |
| `chromium+damage/scales.2x.dom.navigate_to_painted_frame_ms` | 421.4 | 332.7 | -88.7 | -21.1 % | 82.5 | better |
| `chromium+damage/scales.2x.dom_scroll.read_ms.median` | 16.113 | 7.944 | -8.169 | -50.7 % | 0.806 | better |
| `chromium+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 76.7 | 33.1 | -43.6 | -56.8 % | 3.835 | better |
| `chromium+damage/scales.2x.dom_scroll.usage.cpu_percent` | 73.7 | 62.6 | -11.1 | -15.1 % | 4.876 | better |
| `chromium+damage/scales.2x.image.navigate_to_completed_ms` | 110.7 | 85 | -25.7 | -23.2 % | 22.166 | better |
| `chromium+damage/scales.2x.image.navigate_to_first_frame_ms` | 142.4 | 103.7 | -38.7 | -27.2 % | 24.412 | better |
| `chromium+damage/scales.2x.image_scroll.fps` | 57.11 | 59.99 | +2.88 | +5.0 % | 2.856 | better |
| `chromium+damage/scales.2x.image_scroll.pipe_mb_s` | 534.55 | 561.5 | +26.95 | +5.0 % | 26.727 | better |
| `chromium+damage/scales.2x.image_scroll.read_ms.median` | 16.514 | 8.24 | -8.274 | -50.1 % | 0.826 | better |
| `chromium+damage/scales.2x.image_scroll.usage.client_cpu_percent` | 77.1 | 34.3 | -42.8 | -55.5 % | 3.855 | better |
| `chromium+damage/scales.2x.image_scroll.usage.cpu_percent` | 117.9 | 107.2 | -10.7 | -9.1 % | 5.895 | better |
| `chromium+damage/scales.2x.key.latency_ms.median` | 16.42 | 10.605 | -5.815 | -35.4 % | 1.004 | better |
| `chromium+damage/scales.2x.key.latency_ms.p95` | 19.91 | 11.48 | -8.43 | -42.3 % | 1.784 | better |
| `chromium+damage/scales.2x.raf.read_ms.median` | 15.598 | 7.732 | -7.866 | -50.4 % | 0.78 | better |
| `chromium+damage/scales.2x.raf.usage.client_cpu_percent` | 80.3 | 36.9 | -43.4 | -54.0 % | 4.015 | better |
| `chromium+damage/scales.2x.raf.usage.cpu_percent` | 44.2 | 37.9 | -6.3 | -14.2 % | 3 | better |
| `chromium+damage/scales.2x.scroll.interval_ms.p95` | 20.548 | 18.853 | -1.695 | -8.2 % | 1.174 | better |
| `chromium+damage/scales.2x.scroll.interval_ms.stdev` | 3.228 | 2.257 | -0.971 | -30.1 % | 0.5 | better |
| `chromium+damage/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 85.5 | 63.6 | -21.9 | -25.6 % | 11.186 | better |
| `chromium+damage/scales.2x.scroll.read_ms.median` | 16.012 | 7.769 | -8.243 | -51.5 % | 0.801 | better |
| `chromium+damage/scales.2x.scroll.usage.client_cpu_percent` | 74.7 | 32.6 | -42.1 | -56.4 % | 3.735 | better |
| `chromium+damage/scales.2x.scroll.usage.cpu_percent` | 77.4 | 66.7 | -10.7 | -13.8 % | 3.966 | better |
| `chromium+damage/scales.2x.wheel.latency_ms.median` | 16.415 | 11.555 | -4.86 | -29.6 % | 4.478 | better |
| `chromium+damage/scales.2x.wheel.latency_ms.p95` | 23.94 | 14.12 | -9.82 | -41.0 % | 1.354 | better |
| `chromium+damage/teardown.close_to_closed_ms` | 19.4 | 16.2 | -3.2 | -16.5 % | 2.16 | better |
| `chromium/navigation.navigate_to_completed_ms` | 11.8 | 10.7 | -1.1 | -9.3 % | 0.898 | better |
| `chromium/pipe_1mib.raf.read_ms.median` | 12.087 | 5.295 | -6.792 | -56.2 % | 0.604 | better |
| `chromium/pipe_1mib.raf.usage.cpu_percent` | 37.7 | 33.1 | -4.6 | -12.2 % | 3.374 | better |
| `chromium/pipe_1mib.scroll.read_ms.median` | 12.425 | 5.325 | -7.1 | -57.1 % | 0.621 | better |
| `chromium/pipe_1mib.scroll.usage.cpu_percent` | 56.2 | 50.4 | -5.8 | -10.3 % | 3.39 | better |
| `chromium/scales.1x.image.navigate_to_completed_ms` | 123.5 | 98.3 | -25.2 | -20.4 % | 25.064 | better |
| `chromium/scales.1x.raf.usage.cpu_percent` | 19.9 | 16.3 | -3.6 | -18.1 % | 3 | better |
| `chromium/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 49.7 | 44.5 | -5.2 | -10.5 % | 2.858 | better |
| `chromium/scales.2x.dom_scroll.read_ms.median` | 16.012 | 7.851 | -8.161 | -51.0 % | 0.801 | better |
| `chromium/scales.2x.dom_scroll.usage.client_cpu_percent` | 76.3 | 33.2 | -43.1 | -56.5 % | 3.815 | better |
| `chromium/scales.2x.dom_scroll.usage.cpu_percent` | 68.3 | 62.7 | -5.6 | -8.2 % | 5.424 | better |
| `chromium/scales.2x.image_scroll.load.navigate_to_painted_frame_ms` | 170.2 | 133.1 | -37.1 | -21.8 % | 31.416 | better |
| `chromium/scales.2x.image_scroll.read_ms.median` | 16.428 | 8.135 | -8.293 | -50.5 % | 0.821 | better |
| `chromium/scales.2x.image_scroll.usage.client_cpu_percent` | 76.7 | 33.9 | -42.8 | -55.8 % | 3.835 | better |
| `chromium/scales.2x.key.latency_ms.median` | 16.995 | 9.895 | -7.1 | -41.8 % | 1.134 | better |
| `chromium/scales.2x.key.latency_ms.p95` | 20.01 | 10.46 | -9.55 | -47.7 % | 1.614 | better |
| `chromium/scales.2x.key.pooled_latency_ms` | 18.025 | 9.815 | -8.21 | -45.6 % | 6.396 | better |
| `chromium/scales.2x.raf.read_ms.median` | 15.552 | 7.697 | -7.855 | -50.5 % | 0.778 | better |
| `chromium/scales.2x.raf.usage.client_cpu_percent` | 81 | 36.9 | -44.1 | -54.4 % | 4.05 | better |
| `chromium/scales.2x.raf.usage.cpu_percent` | 43.9 | 39 | -4.9 | -11.2 % | 3 | better |
| `chromium/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 80 | 63.9 | -16.1 | -20.1 % | 10.89 | better |
| `chromium/scales.2x.scroll.read_ms.median` | 15.924 | 7.69 | -8.234 | -51.7 % | 0.796 | better |
| `chromium/scales.2x.scroll.usage.client_cpu_percent` | 74.5 | 31.9 | -42.6 | -57.2 % | 3.725 | better |
| `chromium/scales.2x.scroll.usage.cpu_percent` | 77.1 | 66 | -11.1 | -14.4 % | 5.762 | better |
| `chromium/scales.2x.wheel.latency_ms.median` | 16.2 | 12.015 | -4.185 | -25.8 % | 1.088 | better |
| `chromium/scales.2x.wheel.latency_ms.p95` | 22.96 | 13.32 | -9.64 | -42.0 % | 1.148 | better |
| `chromium/teardown.close_to_closed_ms` | 18 | 11.6 | -6.4 | -35.6 % | 3.43 | better |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 1.93 | -1.945 | -50.2 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 1.6 | -1.98 | -55.3 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 9.4 | -8.3 | -46.9 % | 0.885 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 3.78 | -0.74 | -16.4 % | 0.5 | better |
| `webkit+damage/scales.1x.key.latency_ms.median` | 22.805 | 7.255 | -15.55 | -68.2 % | 11.988 | better (different CPU) |
| `webkit+damage/scales.1x.key.latency_ms.p95` | 23.52 | 8.22 | -15.3 | -65.0 % | 12.932 | better (different CPU) |
| `webkit+damage/scales.1x.key.pooled_latency_ms` | 22.82 | 7.335 | -15.485 | -67.9 % | 13.934 | better (different CPU) |
| `webkit+damage/scales.1x.wheel.latency_ms.p95` | 23.54 | 8.75 | -14.79 | -62.8 % | 14.156 | better (different CPU) |
| `webkit+damage/scales.2x.scroll.long_intervals_share` | 0.388 | 0.253 | -0.135 | -34.8 % | 0.13 | better (different CPU) |
| `webkit+damage/spawn_to_ready_ms` | 46.6 | 34.7 | -11.9 | -25.5 % | 11.65 | better (different CPU) |
| `webkit/scales.1x.key.latency_ms.p95` | 23.18 | 7.67 | -15.51 | -66.9 % | 11.466 | better (different CPU) |
| `webkit/scales.1x.wheel.latency_ms.p95` | 23.14 | 8.66 | -14.48 | -62.6 % | 13.804 | better (different CPU) |
| `webkit/scales.2x.dom_scroll.fps` | 42.47 | 54.14 | +11.67 | +27.5 % | 10.617 | better (different CPU) |
| `webkit/scales.2x.dom_scroll.interval_ms.stdev` | 5.983 | 3.839 | -2.144 | -35.8 % | 1.496 | better (different CPU) |
| `webkit/scales.2x.dom_scroll.long_intervals_share` | 0.332 | 0.067 | -0.265 | -79.8 % | 0.084 | better (different CPU) |
| `webkit/scales.2x.dom_scroll.pipe_mb_s` | 397.54 | 506.8 | +109.26 | +27.5 % | 99.385 | better (different CPU) |
| `webkit/scales.2x.image_scroll.long_intervals_share` | 0.494 | 0.332 | -0.162 | -32.8 % | 0.123 | better (different CPU) |
| `webkit/scales.2x.raf.interval_ms.stdev` | 5.107 | 3.748 | -1.359 | -26.6 % | 1.277 | better (different CPU) |
| `webkit/scales.2x.scroll.fps` | 41.99 | 55.38 | +13.39 | +31.9 % | 10.498 | better (different CPU) |
| `webkit/scales.2x.scroll.interval_ms.p95` | 33.946 | 24.531 | -9.415 | -27.7 % | 8.486 | better (different CPU) |
| `webkit/scales.2x.scroll.interval_ms.stdev` | 5.69 | 3.571 | -2.119 | -37.2 % | 1.423 | better (different CPU) |
| `webkit/scales.2x.scroll.long_intervals_share` | 0.383 | 0.043 | -0.34 | -88.8 % | 0.14 | better (different CPU) |
| `webkit/scales.2x.scroll.pipe_mb_s` | 393.05 | 518.37 | +125.32 | +31.9 % | 98.263 | better (different CPU) |
| `zen-chromium/scroll.window.long_intervals_share` | 0.474 | 0.146 | -0.328 | -69.2 % | 0.118 | better (different CPU) |
| `zen-chromium/tab_switch.to_gecko_blank_tab_ms.median` | 54.077 | 33.532 | -20.545 | -38.0 % | 13.519 | better (different CPU) |
| `zen-gecko/dom.navigate_to_title_wall_ms` | 191.8 | 131 | -60.8 | -31.7 % | 47.95 | better (different CPU) |
| `zen-gecko/raf.window.usage.cpu_percent` | 30.3 | 19.8 | -10.5 | -34.6 % | 7.778 | better (different CPU) |
| `zen-gecko/scroll.window.usage.cpu_percent` | 52.1 | 37.4 | -14.7 | -28.2 % | 13.025 | better (different CPU) |
