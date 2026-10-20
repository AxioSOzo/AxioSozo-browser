# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.79 | 57.69 | -0.2% | 57.64 | -0.3% | 57.96 | 57.95 | -0.0% | 57.78 | -0.3% |
| rAF page: frame interval p99 (ms) | 22.319 | 22.622 | +1.4% | 22.682 | +1.6% | 22.593 | 23.576 | +4.4% | 25.045 | +10.9% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.006 | — | 0.006 | — | 0.006 | 0.0 | -100.0% ✅ | 0.011 | +83.3% ⚠️ |
| rAF page: CPU, whole browser (%) | 125.0 | 134.0 | +7.2% ⚠️ | 120.2 | -3.8% | 127.9 | 127.5 | -0.3% | 125.1 | -2.2% |
| rAF page: CPU, Zen parent process (%) | 50.7 | 56.4 | +11.2% ⚠️ | 43.9 | -13.4% ✅ | 52.1 | 52.5 | +0.8% | 48.1 | -7.7% ✅ |
| presenter draw per frame (ms) | 0.861 | 0.931 | +8.1% ⚠️ | 0.879 | +2.1% | 0.904 | 0.896 | -0.9% | 0.936 | +3.5% |
| wheel scroll: fps (XTest-paced input) | 13.21 | 12.81 | -3.0% | 13.28 | +0.5% | 13.01 | 13.08 | +0.5% | 13.88 | +6.7% ✅ |
| wheel scroll: frame interval p99 (ms) | 139.315 | 137.355 | -1.4% | 85.89 | -38.3% ✅ | 136.944 | 139.63 | +2.0% | 87.059 | -36.4% ✅ |
| wheel scroll: CPU (%) | 42.7 | 45.4 | +6.3% ⚠️ | 39.1 | -8.4% ✅ | 43.1 | 45.1 | +4.6% | 42.4 | -1.6% |
| wheel scroll: CPU, Zen parent (%) | 20.2 | 21.9 | +8.4% ⚠️ | 17.2 | -14.9% ✅ | 20.5 | 21.4 | +4.4% | 18.8 | -8.3% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.971 | 1.97 | -0.1% | 1.97 | -0.1% | 1.97 | 1.972 | +0.1% | 1.969 | -0.1% |
| key -> presented frame (ms) | 23.809 | 23.763 | -0.2% | 24.599 | +3.3% | 23.873 | 25.183 | +5.5% ⚠️ | 25.17 | +5.4% ⚠️ |
| key -> presented frame p95 (ms) | 32.736 | 32.175 | -1.7% | 33.434 | +2.1% | 32.81 | 32.48 | -1.0% | 33.996 | +3.6% |
| Gecko -> engine switch (ms) | 567.6 | 579.8 | +2.1% | 553.1 | -2.6% | 558.8 | 557.7 | -0.2% | 558.8 | +0.0% |
| static page: navigate -> visible (ms) | 58.5 | 67.5 | +15.4% ⚠️ | 59.3 | +1.4% | 74.6 | 82.7 | +10.9% ⚠️ | 60.6 | -18.8% ✅ |
| RSS, whole browser (MB) | 2259.7 | 2243.4 | -0.7% | 2228.9 | -1.4% | 2091.6 | 2082.8 | -0.4% | 2223.0 | +6.3% ⚠️ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 47.79 | 46.24 | -3.2% | 56.52 | +18.3% ✅ | 46.68 | 47.37 | +1.5% | 55.43 | +18.7% ✅ |
| rAF page: frame interval p99 (ms) | 41.43 | 43.818 | +5.8% ⚠️ | 31.736 | -23.4% ✅ | 44.175 | 39.844 | -9.8% ✅ | 31.168 | -29.4% ✅ |
| rAF page: intervals > 25 ms (share) | 0.186 | 0.254 | +36.6% ⚠️ | 0.052 | -72.0% ✅ | 0.196 | 0.205 | +4.6% | 0.065 | -66.8% ✅ |
| rAF page: CPU, whole browser (%) | 330.6 | 328.6 | -0.6% | 304.5 | -7.9% ✅ | 328.6 | 326.8 | -0.5% | 310.5 | -5.5% ✅ |
| rAF page: CPU, Zen parent process (%) | 127.1 | 126.4 | -0.6% | 97.0 | -23.7% ✅ | 124.1 | 124.0 | -0.1% | 100.7 | -18.9% ✅ |
| presenter draw per frame (ms) | 3.996 | 4.026 | +0.8% | 4.188 | +4.8% | 4.028 | 4.061 | +0.8% | 4.343 | +7.8% ⚠️ |
| wheel scroll: fps (XTest-paced input) | 8.96 | 8.75 | -2.3% | 11.95 | +33.4% ✅ | 8.66 | 9.03 | +4.3% | 11.69 | +35.0% ✅ |
| wheel scroll: frame interval p99 (ms) | 113.445 | 106.036 | -6.5% ✅ | 67.969 | -40.1% ✅ | 120.395 | 107.497 | -10.7% ✅ | 72.189 | -40.0% ✅ |
| wheel scroll: CPU (%) | 87.7 | 89.4 | +1.9% | 86.0 | -1.9% | 87.9 | 87.9 | +0.0% | 86.6 | -1.5% |
| wheel scroll: CPU, Zen parent (%) | 26.9 | 27.5 | +2.2% | 25.6 | -4.8% | 26.3 | 26.2 | -0.4% | 26.1 | -0.8% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 2.027 | 2.027 | +0.0% | 2.032 | +0.2% | 2.021 | 2.033 | +0.6% | 2.027 | +0.3% |
| key -> presented frame (ms) | 29.266 | 30.375 | +3.8% | 30.763 | +5.1% ⚠️ | 29.665 | 29.718 | +0.2% | 30.128 | +1.6% |
| key -> presented frame p95 (ms) | 35.348 | 35.428 | +0.2% | 36.453 | +3.1% | 37.394 | 37.133 | -0.7% | 35.38 | -5.4% ✅ |
| Gecko -> engine switch (ms) | 644.5 | 677.9 | +5.2% ⚠️ | 630.1 | -2.2% | 680.0 | 667.4 | -1.9% | 620.1 | -8.8% ✅ |
| static page: navigate -> visible (ms) | 89.6 | 105.2 | +17.4% ⚠️ | 76.7 | -14.4% ✅ | 136.0 | 90.4 | -33.5% ✅ | 77.6 | -42.9% ✅ |
| RSS, whole browser (MB) | 2420.0 | 2344.4 | -3.1% | 2398.1 | -0.9% | 2402.4 | 2406.8 | +0.2% | 2415.0 | +0.5% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

