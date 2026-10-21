# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39663352941)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **11 regressions**, 9 improvements, 24 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 13 | +2.425 | +22.9 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_damage10_fast_put_ms` | 0.74 | 1.42 | +0.68 | +91.9 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 6.455 | +3.8 | +143.1 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 12.075 | +2.655 | +28.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 13.445 | +2.85 | +26.9 % | 0.53 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 4.185 | +1.615 | +62.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.615 | +0.95 | +142.9 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 4.725 | +1.05 | +28.6 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 4.28 | +0.98 | +29.7 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 5.197 | +1.16 | +28.7 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 3.872 | +0.865 | +28.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 2.065 | -1.81 | -46.7 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.635 | -1.315 | -44.6 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 1.88 | -1.7 | -47.5 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 11.76 | -5.94 | -33.6 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 5.9 | -1.1 | -15.7 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 3.38 | -1.14 | -25.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 5.942 | -3.935 | -39.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 4.143 | -5.195 | -55.6 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.477 | -0.966 | -39.5 % | 0.5 | better |
