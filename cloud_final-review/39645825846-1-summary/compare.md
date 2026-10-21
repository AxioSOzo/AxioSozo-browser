# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39645825846)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **1 regressions**, 22 improvements, 21 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 3.855 | +1.2 | +45.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 1.4 | -2.475 | -63.9 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 7.405 | -3.17 | -30.0 % | 0.529 | better |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 7.95 | -1.47 | -15.6 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 8.76 | -1.835 | -17.3 % | 0.53 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 3.45 | -2.35 | -40.5 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 3.745 | -2.505 | -40.1 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_damage10_ms` | 2.96 | 2.135 | -0.825 | -27.9 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 2.235 | -1.44 | -39.2 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 0.915 | -2.035 | -69.0 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_draw_full_ms` | 1.51 | 0.945 | -0.565 | -37.4 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 1.38 | -2.2 | -61.5 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 6.4 | -11.3 | -63.8 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 3.58 | -3.42 | -48.9 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 3.86 | -3 | -43.7 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 2.16 | -2.36 | -52.2 % | 0.5 | better |
| `presenter-firefox/900x650/presenter_bgraToRGBA_ms` | 1.64 | 0.92 | -0.72 | -43.9 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 3.078 | -0.959 | -23.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 3.34 | -6.537 | -66.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 2.046 | -0.961 | -32.0 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 2.172 | -7.166 | -76.7 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 0.83 | -1.613 | -66.0 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650/presenter_bgraToRGBA_ms` | 1.625 | 0.853 | -0.772 | -47.5 % | 0.5 | better |
