# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 9V74 80-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | memfd r1 | Δmemfd r1 | base r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 58.66 | 59.05 | +0.7% | 59.02 | 58.54 | -0.8% |
| rAF page: frame interval p99 (ms) | 23.155 | 19.4 | -16.2% ✅ | 21.088 | 33.736 | +60.0% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.006 | 0.0 | -100.0% ✅ | 0.0 | 0.011 | — |
| rAF page: CPU, whole browser (%) | 71.4 | 62.6 | -12.3% ✅ | 72.0 | 64.1 | -11.0% ✅ |
| rAF page: CPU, Zen parent process (%) | 49.1 | 40.9 | -16.7% ✅ | 49.1 | 42.2 | -14.1% ✅ |
| presenter draw per frame (ms) | 1.077 | 1.053 | -2.2% | 1.097 | 1.089 | -0.7% |
| presenter uploaded pixel share | 0.27 | 0.263 | -2.6% | 0.271 | 0.263 | -3.0% |
| wheel scroll: fps (XTest-paced input) | 8.0 | 8.43 | +5.4% ✅ | 8.07 | 8.5 | +5.3% ✅ |
| wheel scroll: frame interval p99 (ms) | 39.291 | 33.95 | -13.6% ✅ | 37.497 | 34.181 | -8.8% ✅ |
| wheel scroll: CPU (%) | 22.9 | 18.0 | -21.4% ✅ | 23.4 | 17.8 | -23.9% ✅ |
| wheel scroll: CPU, Zen parent (%) | 17.0 | 12.7 | -25.3% ✅ | 17.7 | 12.5 | -29.4% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.951 | 1.948 | -0.2% | 1.949 | 1.947 | -0.1% |
| key -> presented frame (ms) | 19.927 | 18.461 | -7.4% ✅ | 19.607 | 18.337 | -6.5% ✅ |
| key -> presented frame p95 (ms) | 28.91 | 27.436 | -5.1% ✅ | 25.194 | 28.603 | +13.5% ⚠️ |
| Gecko -> engine switch (ms) | 474.1 | 401.9 | -15.2% ✅ | 470.2 | 419.0 | -10.9% ✅ |
| static page: navigate -> visible (ms) | 46.2 | 39.8 | -13.9% ✅ | 49.3 | 44.1 | -10.5% ✅ |
| RSS, whole browser (MB) | 2746.7 | 2668.6 | -2.8% | 2805.1 | 2697.4 | -3.8% |

Status: base-r1 PASS, base-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

## 2×

| Metric | base r1 | memfd r1 | Δmemfd r1 | base r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.71 | 58.96 | +2.2% | 57.7 | 58.98 | +2.2% |
| rAF page: frame interval p99 (ms) | 31.378 | 22.452 | -28.4% ✅ | 31.874 | 20.166 | -36.7% ✅ |
| rAF page: intervals > 25 ms (share) | 0.028 | 0.0 | -100.0% ✅ | 0.034 | 0.0 | -100.0% ✅ |
| rAF page: CPU, whole browser (%) | 165.1 | 131.0 | -20.7% ✅ | 166.0 | 130.7 | -21.3% ✅ |
| rAF page: CPU, Zen parent process (%) | 122.6 | 89.5 | -27.0% ✅ | 121.4 | 90.5 | -25.5% ✅ |
| presenter draw per frame (ms) | 3.467 | 3.538 | +2.0% | 3.423 | 3.434 | +0.3% |
| presenter uploaded pixel share | 0.28 | 0.276 | -1.4% | 0.281 | 0.276 | -1.8% |
| wheel scroll: fps (XTest-paced input) | 3.92 | 7.47 | +90.6% ✅ | 3.92 | 7.56 | +92.9% ✅ |
| wheel scroll: frame interval p99 (ms) | 11767.669 | 35.921 | -99.7% ✅ | 11773.128 | 34.99 | -99.7% ✅ |
| wheel scroll: CPU (%) | 34.9 | 34.0 | -2.6% | 33.2 | 33.5 | +0.9% |
| wheel scroll: CPU, Zen parent (%) | 22.1 | 21.1 | -4.5% | 20.4 | 20.8 | +2.0% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.97 | 1.965 | -0.3% | 1.968 | 1.966 | -0.1% |
| key -> presented frame (ms) | 18.893 | 20.146 | +6.6% ⚠️ | 18.808 | 20.323 | +8.1% ⚠️ |
| key -> presented frame p95 (ms) | 29.069 | 25.888 | -10.9% ✅ | 25.826 | 26.421 | +2.3% |
| Gecko -> engine switch (ms) | 504.9 | 449.5 | -11.0% ✅ | 479.0 | 456.4 | -4.7% |
| static page: navigate -> visible (ms) | 102.6 | 62.8 | -38.8% ✅ | 67.3 | 49.2 | -26.9% ✅ |
| RSS, whole browser (MB) | 2936.6 | 2864.0 | -2.5% | 3090.1 | 2815.2 | -8.9% ✅ |

Status: base-r1 PASS, base-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

