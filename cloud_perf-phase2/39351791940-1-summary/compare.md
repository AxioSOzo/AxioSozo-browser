# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39351791940)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **9 regressions**, 12 improvements, 23 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 12.66 | +2.085 | +19.7 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 4.745 | +2.09 | +78.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 10.765 | +1.345 | +14.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 12.855 | +2.26 | +21.3 % | 0.53 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.345 | +0.775 | +30.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.255 | +0.59 | +88.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_damage10_ms` | 2.96 | 3.975 | +1.015 | +34.3 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 4.16 | +0.86 | +26.1 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/candidate_u32_fast_path_ms` | 0.84 | 1.34 | +0.5 | +59.5 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 2.545 | -1.33 | -34.3 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 4.375 | -1.425 | -24.6 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 5.36 | -0.89 | -14.2 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.29 | -1.66 | -56.3 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 2.42 | -1.16 | -32.4 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 10.44 | -7.26 | -41.0 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 4.52 | -2.48 | -35.4 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 5.66 | -1.2 | -17.5 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 3.72 | -0.8 | -17.7 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 3.922 | -5.955 | -60.3 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 2.61 | -6.728 | -72.0 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 0.946 | -1.497 | -61.3 % | 0.5 | better |
