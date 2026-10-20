# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39426717880)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **17 regressions**, 8 improvements, 19 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 15.655 | +5.08 | +48.0 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 6.7 | +4.045 | +152.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 17.305 | +7.885 | +83.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 19.88 | +9.285 | +87.6 % | 0.53 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 7.35 | +1.1 | +17.6 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/alloc_copy_ms` | 0.93 | 1.605 | +0.675 | +72.6 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 4.015 | +1.445 | +56.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.69 | +1.025 | +154.1 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_damage10_ms` | 2.96 | 4.04 | +1.08 | +36.5 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 6.645 | +2.97 | +80.8 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/candidate_u32_fast_path_ms` | 3.3 | 5.1 | +1.8 | +54.5 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 7.94 | +1.08 | +15.7 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/putImageData_full_ms` | 0.36 | 0.98 | +0.62 | +172.2 % | 0.5 | **REGRESSION** |
| `presenter-firefox/900x650/presenter_draw_full_ms` | 1.72 | 2.28 | +0.56 | +32.6 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/candidate_u32_opaque_fast_path_ms` | 4.037 | 4.837 | +0.8 | +19.8 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300-translucent10/copy_ms` | 0.742 | 2.049 | +1.307 | +176.2 % | 0.5 | **REGRESSION** |
| `presenter-v8 v22.23.3/1800x1300/copy_ms` | 0.715 | 2.22 | +1.505 | +210.5 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 3.215 | -0.66 | -17.0 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.63 | -1.32 | -44.8 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 15.88 | -1.82 | -10.3 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 6.32 | -0.68 | -9.7 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 3.3 | -1.22 | -27.0 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 5.513 | -4.364 | -44.2 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 3.835 | -5.503 | -58.9 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.356 | -1.087 | -44.5 % | 0.5 | better |
