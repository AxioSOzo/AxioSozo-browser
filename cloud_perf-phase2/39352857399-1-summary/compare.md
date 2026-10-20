# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39352857399)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **14 regressions**, 9 improvements, 21 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 4.4 | +0.525 | +13.6 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 15.505 | +4.93 | +46.6 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 5.925 | +3.27 | +123.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 11.725 | +2.305 | +24.5 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 12.535 | +1.94 | +18.3 % | 0.53 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.805 | +1.235 | +48.0 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.49 | +0.825 | +124.1 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 4.32 | +0.74 | +20.7 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 19.96 | +2.26 | +12.8 % | 0.885 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 3.92 | +0.62 | +18.8 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 1.72 | 2.64 | +0.92 | +53.5 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 5.195 | +1.158 | +28.7 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/candidate_u32_opaque_fast_path_ms` | 3.007 | 3.665 | +0.658 | +21.9 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/copy_ms` | 0.715 | 1.247 | +0.532 | +74.4 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 5.2 | -0.6 | -10.3 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 5.71 | -0.54 | -8.6 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 3.035 | -0.64 | -17.4 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.48 | -1.47 | -49.8 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 5.52 | -1.48 | -21.1 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 5.98 | -0.88 | -12.8 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 5.688 | -4.189 | -42.4 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 3.688 | -5.65 | -60.5 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.403 | -1.04 | -42.6 % | 0.5 | better |
