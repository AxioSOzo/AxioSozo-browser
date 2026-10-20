# Pixel-path A/B in one job: webkit tabs in Zen

CPU: Intel(R) Xeon(R) 6973P-C. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | native r1 | Δnative r1 | base r2 | cand r2 | Δcand r2 | native r2 | Δnative r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 58.36 | 58.185 | -0.3% | 58.205 | -0.3% | 58.085 | 58.365 | +0.5% | 58.445 | +0.6% |
| rAF page: frame interval p99 (ms) | 24.136 | 24.743 | +2.5% | 20.908 | -13.4% ✅ | 22.363 | 20.617 | -7.8% ✅ | 22.594 | +1.0% |
| rAF page: intervals > 25 ms (share) | 0.009 | 0.009 | +0.0% | 0.0 | -100.0% ✅ | 0.003 | 0.006 | +100.0% ⚠️ | 0.006 | +100.0% ⚠️ |
| rAF page: CPU, whole browser (%) | 90.55 | 76.0 | -16.1% ✅ | 70.5 | -22.1% ✅ | 89.35 | 72.85 | -18.5% ✅ | 69.15 | -22.6% ✅ |
| rAF page: CPU, Zen parent process (%) | 42.75 | 28.65 | -33.0% ✅ | 24.2 | -43.4% ✅ | 40.7 | 27.45 | -32.6% ✅ | 23.35 | -42.6% ✅ |
| presenter draw per frame (ms) | 0.66 | 0.744 | +12.7% ⚠️ | 0.012 | -98.2% ✅ | 0.696 | 0.741 | +6.5% ⚠️ | 0.012 | -98.3% ✅ |
| wheel scroll: fps while input is delivered (XTest-paced) | 50.73 | 58.77 | +15.8% ✅ | 58.225 | +14.8% ✅ | 52.03 | 57.875 | +11.2% ✅ | 58.36 | +12.2% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 36.329 | 27.142 | -25.3% ✅ | 29.141 | -19.8% ✅ | 43.435 | 27.823 | -35.9% ✅ | 27.972 | -35.6% ✅ |
| wheel scroll: fps, first to last frame of the window | 50.73 | 58.77 | +15.8% ✅ | 58.225 | +14.8% ✅ | 52.03 | 57.875 | +11.2% ✅ | 58.36 | +12.2% ✅ |
| wheel scroll: CPU (%) | 137.4 | 101.4 | -26.2% ✅ | 90.9 | -33.8% ✅ | 136.05 | 100.4 | -26.2% ✅ | 88.65 | -34.8% ✅ |
| wheel scroll: CPU, Zen parent (%) | 82.5 | 48.05 | -41.8% ✅ | 37.9 | -54.1% ✅ | 79.65 | 48.45 | -39.2% ✅ | 37.0 | -53.5% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.953 | 1.952 | -0.1% | 1.949 | -0.2% | 1.956 | 1.954 | -0.1% | 1.952 | -0.2% |
| key -> presented frame (ms) | 24.697 | 17.066 | -30.9% ✅ | 15.888 | -35.7% ✅ | 23.48 | 15.898 | -32.3% ✅ | 16.335 | -30.4% ✅ |
| key -> presented frame p95 (ms) | 33.894 | 22.534 | -33.5% ✅ | 21.657 | -36.1% ✅ | 32.56 | 22.38 | -31.3% ✅ | 21.373 | -34.4% ✅ |
| Gecko -> engine switch (ms) | 450.0 | 434.2 | -3.5% | 452.1 | +0.5% | 452.1 | 433.85 | -4.0% | 456.75 | +1.0% |
| static page: navigate -> visible (ms) | 65.6 | 68.25 | +4.0% | 51.6 | -21.3% ✅ | 46.2 | 82.25 | +78.0% ⚠️ | 54.6 | +18.2% ⚠️ |
| RSS, whole browser (MB) | 2277.2 | 2187.05 | -4.0% | 2165.4 | -4.9% | 2219.6 | 2167.15 | -2.4% | 2190.0 | -1.3% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, native-r1 PASS, native-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | native r1 | Δnative r1 | base r2 | cand r2 | Δcand r2 | native r2 | Δnative r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 56.56 | 57.87 | +2.3% | 57.975 | +2.5% | 57.55 | 58.045 | +0.9% | 57.935 | +0.7% |
| rAF page: frame interval p99 (ms) | 28.414 | 27.913 | -1.8% | 23.193 | -18.4% ✅ | 28.657 | 27.984 | -2.3% | 24.584 | -14.2% ✅ |
| rAF page: intervals > 25 ms (share) | 0.041 | 0.023 | -43.9% ✅ | 0.0 | -100.0% ✅ | 0.026 | 0.023 | -11.5% ✅ | 0.009 | -65.4% ✅ |
| rAF page: CPU, whole browser (%) | 267.95 | 218.9 | -18.3% ✅ | 198.2 | -26.0% ✅ | 254.6 | 217.5 | -14.6% ✅ | 189.6 | -25.5% ✅ |
| rAF page: CPU, Zen parent process (%) | 115.1 | 68.35 | -40.6% ✅ | 53.55 | -53.5% ✅ | 108.95 | 68.75 | -36.9% ✅ | 51.75 | -52.5% ✅ |
| presenter draw per frame (ms) | 3.408 | 2.495 | -26.8% ✅ | 0.013 | -99.6% ✅ | 3.262 | 2.512 | -23.0% ✅ | 0.017 | -99.5% ✅ |
| wheel scroll: fps while input is delivered (XTest-paced) | 26.82 | 54.16 | +101.9% ✅ | 56.0 | +108.8% ✅ | 26.405 | 53.52 | +102.7% ✅ | 55.96 | +111.9% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 75.47 | 32.504 | -56.9% ✅ | 32.7 | -56.7% ✅ | 77.774 | 38.497 | -50.5% ✅ | 35.028 | -55.0% ✅ |
| wheel scroll: fps, first to last frame of the window | 26.82 | 54.16 | +101.9% ✅ | 56.0 | +108.8% ✅ | 26.405 | 53.52 | +102.7% ✅ | 55.96 | +111.9% ✅ |
| wheel scroll: CPU (%) | 278.8 | 289.4 | +3.8% | 234.45 | -15.9% ✅ | 283.85 | 273.0 | -3.8% | 221.95 | -21.8% ✅ |
| wheel scroll: CPU, Zen parent (%) | 125.2 | 118.6 | -5.3% ✅ | 75.3 | -39.9% ✅ | 129.9 | 106.65 | -17.9% ✅ | 67.7 | -47.9% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 2.014 | 1.995 | -0.9% | 1.977 | -1.8% | 1.976 | 1.99 | +0.7% | 1.972 | -0.2% |
| key -> presented frame (ms) | 26.71 | 26.172 | -2.0% | 21.879 | -18.1% ✅ | 28.946 | 27.644 | -4.5% | 23.14 | -20.1% ✅ |
| key -> presented frame p95 (ms) | 35.842 | 33.724 | -5.9% ✅ | 27.718 | -22.7% ✅ | 37.197 | 32.257 | -13.3% ✅ | 28.589 | -23.1% ✅ |
| Gecko -> engine switch (ms) | 587.85 | 566.95 | -3.6% | 497.15 | -15.4% ✅ | 548.25 | 508.5 | -7.3% ✅ | 512.2 | -6.6% ✅ |
| static page: navigate -> visible (ms) | 88.85 | 69.3 | -22.0% ✅ | 43.65 | -50.9% ✅ | 94.85 | 88.95 | -6.2% ✅ | 81.65 | -13.9% ✅ |
| RSS, whole browser (MB) | 2435.65 | 2348.3 | -3.6% | 2401.95 | -1.4% | 2391.4 | 2260.75 | -5.5% ✅ | 2417.5 | +1.1% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, native-r1 PASS, native-r2 PASS

