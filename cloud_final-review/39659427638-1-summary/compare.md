# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39659427638)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **4 regressions**, 15 improvements, 25 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 36 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 4.97 | +2.315 | +87.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 10.485 | +1.065 | +11.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.08 | +0.51 | +19.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.245 | +0.58 | +87.2 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/alloc_copy_ms` | 3.875 | 1.85 | -2.025 | -52.3 % | 0.5 | better |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 9.885 | -0.69 | -6.5 % | 0.529 | better |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 9.985 | -0.61 | -5.8 % | 0.53 | better |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 4.565 | -1.235 | -21.3 % | 0.5 | better |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 4.915 | -1.335 | -21.4 % | 0.5 | better |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 2.615 | -1.06 | -28.8 % | 0.5 | better |
| `presenter-chromium/900x650/presenter_bgraToRGBA_ms` | 2.95 | 1.245 | -1.705 | -57.8 % | 0.5 | better |
| `presenter-firefox/1800x1300/alloc_copy_ms` | 3.58 | 1.34 | -2.24 | -62.6 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 7.12 | -10.58 | -59.8 % | 0.885 | better |
| `presenter-firefox/1800x1300/presenter_bgraToRGBA_ms` | 7 | 4.52 | -2.48 | -35.4 % | 0.5 | better |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 4.92 | -1.94 | -28.3 % | 0.5 | better |
| `presenter-firefox/900x650/candidate_createImageBitmap_ms` | 4.52 | 3.62 | -0.9 | -19.9 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300-translucent10/presenter_bgraToRGBA_ms` | 9.877 | 4.603 | -5.274 | -53.4 % | 0.5 | better |
| `presenter-v8 v22.23.3/1800x1300/presenter_bgraToRGBA_ms` | 9.338 | 3.213 | -6.125 | -65.6 % | 0.5 | better |
| `presenter-v8 v22.23.3/900x650-translucent10/presenter_bgraToRGBA_ms` | 2.443 | 1.141 | -1.302 | -53.3 % | 0.5 | better |
