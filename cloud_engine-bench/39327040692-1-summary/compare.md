# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39303324088-1-summary (run 39303324088)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39327040692)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 802 shared metrics: **55 regressions**, 7 improvements, 592 within noise, 148 descriptive
- not compared: 0 metrics only in the baseline, 101 only in the candidate
- ⚠ `chromium`: different CPU models (AMD EPYC 7763 64-Core Processor → Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz); relative threshold raised to 25%
- ⚠ `chromium+damage`: different CPU models (AMD EPYC 7763 64-Core Processor → Intel(R) Xeon(R) Platinum 8370C CPU @ 2.80GHz); relative threshold raised to 25%
- ⚠ `webkit`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%
- ⚠ `webkit+damage`: different CPU models (AMD EPYC 9V74 80-Core Processor → AMD EPYC 7763 64-Core Processor); relative threshold raised to 25%

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `chromium+damage/scales.2x.dom_scroll.read_ms.median` | 8.59 | 11.161 | +2.571 | +29.9 % | 2.147 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 35.5 | 46.3 | +10.8 | +30.4 % | 8.875 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.image_scroll.read_ms.median` | 9.291 | 11.947 | +2.656 | +28.6 % | 2.323 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.image_scroll.usage.client_cpu_percent` | 37.4 | 50.3 | +12.9 | +34.5 % | 9.35 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.raf.read_ms.median` | 8.324 | 10.755 | +2.431 | +29.2 % | 2.081 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.raf.usage.client_cpu_percent` | 38.8 | 51.7 | +12.9 | +33.2 % | 9.7 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.scroll.read_ms.median` | 8.433 | 10.844 | +2.411 | +28.6 % | 2.108 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.scroll.usage.client_cpu_percent` | 34.3 | 45.2 | +10.9 | +31.8 % | 8.575 | **REGRESSION** (different CPU) |
| `chromium/pipe_1mib.raf.read_ms.median` | 6.18 | 8.002 | +1.822 | +29.5 % | 1.545 | **REGRESSION** (different CPU) |
| `chromium/pipe_1mib.scroll.read_ms.median` | 6.181 | 8.028 | +1.847 | +29.9 % | 1.545 | **REGRESSION** (different CPU) |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 11.52 | 12.395 | +0.875 | +7.6 % | 0.576 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 12.155 | 13.735 | +1.58 | +13.0 % | 0.608 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 15.62 | 16.765 | +1.145 | +7.3 % | 0.781 | **REGRESSION** |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 1.9 | 2.48 | +0.58 | +30.5 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 11.34 | 12 | +0.66 | +5.8 % | 0.567 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 4.28 | 5.1 | +0.82 | +19.2 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/copy_ms` | 0.806 | 1.528 | +0.722 | +89.6 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/copy_ms` | 0.801 | 1.544 | +0.743 | +92.8 % | 0.5 | **REGRESSION** |
| `webkit+damage/scales.1x.dom.idle_fps` | 9.5 | 12.5 | +3 | +31.6 % | 2.375 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom.navigate_to_completed_ms` | 330.2 | 434.8 | +104.6 | +31.7 % | 82.55 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom.navigate_to_first_frame_ms` | 403.5 | 527 | +123.5 | +30.6 % | 100.875 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom.navigate_to_painted_frame_ms` | 404 | 527.6 | +123.6 | +30.6 % | 101 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.dom_scroll.load.navigate_to_painted_frame_ms` | 432.7 | 543.2 | +110.5 | +25.5 % | 108.175 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.key.latency_ms.median` | 7.275 | 23.085 | +15.81 | +217.3 % | 11.554 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.key.latency_ms.p95` | 8.11 | 23.9 | +15.79 | +194.7 % | 12.784 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.key.pooled_latency_ms` | 7.405 | 23.07 | +15.665 | +211.5 % | 11.95 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 111.9 | 145.7 | +33.8 | +30.2 % | 27.975 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.idle_fps` | 10.5 | 13.5 | +3 | +28.6 % | 2.625 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.navigate_to_completed_ms` | 363.1 | 484.7 | +121.6 | +33.5 % | 90.775 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.navigate_to_first_frame_ms` | 457.8 | 599.2 | +141.4 | +30.9 % | 114.45 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom.navigate_to_painted_frame_ms` | 461 | 603.8 | +142.8 | +31.0 % | 115.25 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom_scroll.load.navigate_to_painted_frame_ms` | 463 | 578.9 | +115.9 | +25.0 % | 115.75 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.dom_scroll.usage.client_cpu_percent` | 27.4 | 36 | +8.6 | +31.4 % | 6.85 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.key.latency_ms.median` | 22.715 | 37.965 | +15.25 | +67.1 % | 5.679 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.key.pooled_latency_ms` | 23.07 | 38.065 | +14.995 | +65.0 % | 11.47 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.raf.long_intervals_share` | 0.021 | 0.065 | +0.044 | +209.5 % | 0.04 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 97.2 | 130.8 | +33.6 | +34.6 % | 24.3 | **REGRESSION** (different CPU) |
| `webkit+damage/scales.2x.scroll.usage.client_cpu_percent` | 27.6 | 34.8 | +7.2 | +26.1 % | 6.9 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.raf.read_ms.median` | 5.202 | 10.203 | +5.001 | +96.1 % | 1.3 | **REGRESSION** (different CPU) |
| `webkit/pipe_1mib.scroll.read_ms.median` | 5.186 | 9.751 | +4.565 | +88.0 % | 1.296 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.dom.navigate_to_completed_ms` | 337 | 428.3 | +91.3 | +27.1 % | 84.25 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.key.latency_ms.p95` | 8.01 | 23.53 | +15.52 | +193.8 % | 11.468 | **REGRESSION** (different CPU) |
| `webkit/scales.1x.scroll.load.navigate_to_painted_frame_ms` | 109.2 | 139.1 | +29.9 | +27.4 % | 27.3 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom.navigate_to_completed_ms` | 370 | 482.2 | +112.2 | +30.3 % | 92.5 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom.navigate_to_first_frame_ms` | 460.2 | 585.4 | +125.2 | +27.2 % | 115.05 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom.navigate_to_painted_frame_ms` | 465.7 | 589.9 | +124.2 | +26.7 % | 116.425 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.load.navigate_to_painted_frame_ms` | 457.6 | 578.3 | +120.7 | +26.4 % | 114.4 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.dom_scroll.usage.client_cpu_percent` | 32.3 | 41.5 | +9.2 | +28.5 % | 8.075 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.latency_ms.median` | 22.48 | 36.765 | +14.285 | +63.5 % | 5.62 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.latency_ms.p95` | 25.34 | 39.66 | +14.32 | +56.5 % | 9.08 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.key.pooled_latency_ms` | 22.52 | 36.82 | +14.3 | +63.5 % | 11.584 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.raf.long_intervals_share` | 0.021 | 0.056 | +0.035 | +166.7 % | 0.02 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.load.navigate_to_painted_frame_ms` | 95.5 | 121.7 | +26.2 | +27.4 % | 23.875 | **REGRESSION** (different CPU) |
| `webkit/scales.2x.scroll.usage.client_cpu_percent` | 32.5 | 40.9 | +8.4 | +25.9 % | 8.125 | **REGRESSION** (different CPU) |
| `webkit/spawn_to_ready_ms` | 33.6 | 42.2 | +8.6 | +25.6 % | 8.4 | **REGRESSION** (different CPU) |
| `chromium+damage/scales.2x.dom_scroll.interval_ms.stdev` | 2.782 | 2.072 | -0.71 | -25.5 % | 0.696 | better (different CPU) |
| `chromium+damage/scales.2x.raf.interval_ms.stdev` | 1.547 | 0.895 | -0.652 | -42.1 % | 0.5 | better (different CPU) |
| `chromium/scales.2x.dom_scroll.interval_ms.stdev` | 2.988 | 1.985 | -1.003 | -33.6 % | 0.747 | better (different CPU) |
| `chromium/scales.2x.raf.interval_ms.stdev` | 1.595 | 0.774 | -0.821 | -51.5 % | 0.51 | better (different CPU) |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 9.82 | 8.86 | -0.96 | -9.8 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 9.2 | 8.52 | -0.68 | -7.4 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 12.011 | 11.282 | -0.729 | -6.1 % | 0.601 | better |
