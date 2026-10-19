# Engine bench comparison

- baseline: `ci-results:cloud_engine-bench/39330954155-1-summary (run 39330954155)`
- candidate: `/home/runner/work/AxioSozo-browser/AxioSozo-browser/.local/evidence-summary/summary.json (run 39334995906)`
- threshold: max(5% of baseline, 2 × stdev, unit floor); medians over repetitions
- 44 shared metrics: **10 regressions**, 2 improvements, 32 within noise, 0 descriptive
- not compared: 897 metrics only in the baseline, 12 only in the candidate

| Metric | Baseline | Candidate | Δ | Δ % | Threshold | Verdict |
| --- | --- | --- | --- | --- | --- | --- |
| `presenter-chromium/1800x1300/candidate_createImageBitmap_ms` | 10.575 | 13.8 | +3.225 | +30.5 % | 0.529 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_u32_fast_path_ms` | 2.655 | 5.15 | +2.495 | +94.0 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_damage10_ms` | 9.42 | 11.615 | +2.195 | +23.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/candidate_webgl_full_ms` | 10.595 | 12.96 | +2.365 | +22.3 % | 0.53 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_bgraToRGBA_ms` | 5.8 | 11.63 | +5.83 | +100.5 % | 0.5 | **REGRESSION** |
| `presenter-chromium/1800x1300/presenter_draw_full_ms` | 6.25 | 12.285 | +6.035 | +96.6 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_createImageBitmap_ms` | 2.57 | 3.195 | +0.625 | +24.3 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_u32_fast_path_ms` | 0.665 | 1.255 | +0.59 | +88.7 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/presenter_draw_full_ms` | 1.51 | 2.975 | +1.465 | +97.0 % | 0.5 | **REGRESSION** |
| `presenter-firefox/1800x1300/presenter_draw_full_ms` | 6.86 | 7.46 | +0.6 | +8.8 % | 0.5 | **REGRESSION** |
| `presenter-chromium/900x650/candidate_webgl_full_ms` | 3.675 | 2.59 | -1.085 | -29.5 % | 0.5 | better |
| `presenter-firefox/1800x1300/candidate_createImageBitmap_ms` | 17.7 | 16.1 | -1.6 | -9.0 % | 0.885 | better |
