# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39663428125)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **14 regressions**, 7 improvements, 23 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 4.52 | +0.645 | +16.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 16.22 | +5.645 | +53.4 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 6.07 | +3.415 | +128.6 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 10.86 | +1.44 | +15.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 12.73 | +2.135 | +20.2 % | 0.53 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.86 | +1.29 | +50.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.48 | +0.815 | +122.6 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 5.735 | +2.06 | +56.0 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 4.54 | +0.96 | +26.8 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 20.7 | +3 | +17.0 % | 0.885 | **REGRESSION** |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 5.16 | +0.64 | +14.2 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 1.72 | 2.44 | +0.72 | +41.9 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 5.204 | +1.167 | +28.9 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 3.668 | +0.661 | +22.0 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 5.295 | -0.505 | -8.7 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.49 | -1.46 | -49.5 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 5.2 | -1.8 | -25.7 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 5.84 | -1.02 | -14.9 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 5.696 | -4.181 | -42.3 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 3.675 | -5.663 | -60.6 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.399 | -1.044 | -42.7 % | 0.5 | better |
