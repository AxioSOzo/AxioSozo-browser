# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39426862370)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **13 regressions**, 9 improvements, 22 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 13.03 | +2.455 | +23.2 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 6.11 | +3.455 | +130.1 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 15.385 | +5.965 | +63.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 17.115 | +6.52 | +61.5 % | 0.53 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 4.005 | +1.435 | +55.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.495 | +0.83 | +124.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 5.25 | +1.575 | +42.9 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 3.9 | +0.6 | +18.2 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/alloc_copy_ms` | 0.86 | 1.36 | +0.5 | +58.1 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 5.203 | +1.166 | +28.9 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/copy_ms` | 0.742 | 1.397 | +0.655 | +88.3 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 3.674 | +0.667 | +22.2 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/copy_ms` | 0.715 | 1.517 | +0.802 | +112.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 2.265 | -1.61 | -41.5 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.5 | -1.45 | -49.1 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 2.02 | -1.56 | -43.6 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 10.74 | -6.96 | -39.3 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 5.44 | -1.56 | -22.3 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 6.32 | -0.54 | -7.9 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 5.704 | -4.173 | -42.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 3.714 | -5.624 | -60.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.401 | -1.042 | -42.6 % | 0.5 | better |
