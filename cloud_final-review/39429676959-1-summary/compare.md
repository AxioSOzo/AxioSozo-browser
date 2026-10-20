# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39429676959)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **2 regressions**, 21 improvements, 21 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 3.405 | +0.75 | +28.2 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/900x650/copy_ms` | 0.119 | 0.678 | +0.559 | +469.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 1.33 | -2.545 | -65.7 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 6.915 | -3.66 | -34.6 % | 0.529 | better |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 9.5 | -1.095 | -10.3 % | 0.53 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 4.075 | -1.725 | -29.7 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 3.465 | -2.785 | -44.6 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_damage10_ms` | 2.96 | 1.7 | -1.26 | -42.6 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 1.975 | -1.7 | -46.3 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 0.835 | -2.115 | -71.7 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_draw_full_ms` | 1.51 | 0.875 | -0.635 | -42.0 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 1.4 | -2.18 | -60.9 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 6.56 | -11.14 | -62.9 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 3.58 | -3.42 | -48.9 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 3.86 | -3 | -43.7 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 2.76 | -1.76 | -38.9 % | 0.5 | better |
| `presenter-firefox/900x650/presenter_bgraToRGBA_ms` | 1.64 | 0.88 | -0.76 | -46.3 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 3.159 | -0.878 | -21.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 3.475 | -6.402 | -64.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 2.179 | -0.828 | -27.5 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 2.244 | -7.094 | -76.0 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 0.85 | -1.593 | -65.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650/presenter_bgraToRGBA_ms` | 1.625 | 0.792 | -0.833 | -51.3 % | 0.5 | better |
