# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 9V74 80-Core Processor. base = cloud/integration chrome JS + host, cand = this branch, memfd = this branch with the EXPERIMENTAL memfd frame pref (TEST-ONLY); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 39.11 | 57.85 | +47.9% ✅ | 57.67 | +47.5% ✅ | 38.86 | 57.55 | +48.1% ✅ | 57.71 | +48.5% ✅ |
| rAF page: frame interval p99 (ms) | 42.333 | 22.569 | -46.7% ✅ | 24.207 | -42.8% ✅ | 45.114 | 22.794 | -49.5% ✅ | 22.764 | -49.5% ✅ |
| rAF page: intervals > 25 ms (share) | 0.458 | 0.0 | -100.0% ✅ | 0.006 | -98.7% ✅ | 0.449 | 0.006 | -98.7% ✅ | 0.0 | -100.0% ✅ |
| rAF page: CPU, whole browser (%) | 200.6 | 123.3 | -38.5% ✅ | 115.1 | -42.6% ✅ | 201.9 | 125.2 | -38.0% ✅ | 114.1 | -43.5% ✅ |
| presenter draw per frame (ms) | 1.496 | 0.791 | -47.1% ✅ | 0.818 | -45.3% ✅ | 1.533 | 0.809 | -47.2% ✅ | 0.822 | -46.4% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 9.38 | 12.55 | +33.8% ✅ | 13.5 | +43.9% ✅ | 9.37 | 12.95 | +38.2% ✅ | 13.68 | +46.0% ✅ |
| wheel scroll: CPU (%) | 56.4 | 41.5 | -26.4% ✅ | 38.0 | -32.6% ✅ | 56.4 | 41.5 | -26.4% ✅ | 39.1 | -30.7% ✅ |
| key -> presented frame (ms) | 32.442 | 24.095 | -25.7% ✅ | 24.4 | -24.8% ✅ | 31.964 | 23.685 | -25.9% ✅ | 24.583 | -23.1% ✅ |
| Gecko -> engine switch (ms) | 624.1 | 569.1 | -8.8% ✅ | 536.6 | -14.0% ✅ | 580.4 | 558.6 | -3.8% | 541.3 | -6.7% ✅ |
| static page: navigate -> visible (ms) | 78.1 | 62.8 | -19.6% ✅ | 59.8 | -23.4% ✅ | 72.8 | 65.9 | -9.5% ✅ | 61.3 | -15.8% ✅ |
| RSS, whole browser (MB) | 2254.0 | 2238.8 | -0.7% | 2223.9 | -1.3% | 2378.5 | 2181.1 | -8.3% ✅ | 2222.8 | -6.5% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 5.96 | 48.66 | +716.4% ✅ | 56.6 | +849.7% ✅ | 5.96 | 48.82 | +719.1% ✅ | 56.59 | +849.5% ✅ |
| rAF page: frame interval p99 (ms) | 220.044 | 47.293 | -78.5% ✅ | 33.048 | -85.0% ✅ | 209.323 | 37.824 | -81.9% ✅ | 30.879 | -85.2% ✅ |
| rAF page: intervals > 25 ms (share) | 1.0 | 0.193 | -80.7% ✅ | 0.035 | -96.5% ✅ | 1.0 | 0.187 | -81.3% ✅ | 0.052 | -94.8% ✅ |
| rAF page: CPU, whole browser (%) | 302.4 | 330.2 | +9.2% ⚠️ | 305.5 | +1.0% | 303.4 | 330.8 | +9.0% ⚠️ | 306.2 | +0.9% |
| presenter draw per frame (ms) | 8.905 | 3.731 | -58.1% ✅ | 4.071 | -54.3% ✅ | 8.547 | 3.758 | -56.0% ✅ | 4.024 | -52.9% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 1.88 | 9.03 | +380.3% ✅ | 12.05 | +541.0% ✅ | 1.87 | 9.1 | +386.6% ✅ | 11.61 | +520.9% ✅ |
| wheel scroll: CPU (%) | 92.2 | 87.6 | -5.0% | 86.0 | -6.7% ✅ | 89.4 | 87.9 | -1.7% | 86.1 | -3.7% |
| key -> presented frame (ms) | 98.152 | 29.528 | -69.9% ✅ | 29.846 | -69.6% ✅ | 98.396 | 29.806 | -69.7% ✅ | 30.163 | -69.3% ✅ |
| Gecko -> engine switch (ms) | 702.1 | 648.3 | -7.7% ✅ | 639.6 | -8.9% ✅ | 749.1 | 634.3 | -15.3% ✅ | 623.8 | -16.7% ✅ |
| static page: navigate -> visible (ms) | 215.2 | 86.9 | -59.6% ✅ | 67.0 | -68.9% ✅ | 256.1 | 104.9 | -59.0% ✅ | 70.4 | -72.5% ✅ |
| RSS, whole browser (MB) | 2508.7 | 2373.8 | -5.4% ✅ | 2464.0 | -1.8% | 2513.1 | 2392.4 | -4.8% | 2376.2 | -5.4% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

