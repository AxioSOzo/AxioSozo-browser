# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 9V45 96-Core Processor. base = cloud/integration chrome JS + host, cand = this branch, memfd = this branch with the EXPERIMENTAL memfd frame pref (TEST-ONLY); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 56.54 | 57.72 | +2.1% | 58.27 | +3.1% | 56.17 | 57.77 | +2.8% | 57.75 | +2.8% |
| rAF page: frame interval p99 (ms) | 37.367 | 24.762 | -33.7% ✅ | 22.021 | -41.1% ✅ | 39.084 | 23.202 | -40.6% ✅ | 21.769 | -44.3% ✅ |
| rAF page: intervals > 25 ms (share) | 0.046 | 0.006 | -87.0% ✅ | 0.0 | -100.0% ✅ | 0.046 | 0.0 | -100.0% ✅ | 0.006 | -87.0% ✅ |
| rAF page: CPU, whole browser (%) | 172.8 | 100.7 | -41.7% ✅ | 98.5 | -43.0% ✅ | 159.5 | 97.1 | -39.1% ✅ | 90.0 | -43.6% ✅ |
| presenter draw per frame (ms) | 0.955 | 0.567 | -40.6% ✅ | 0.66 | -30.9% ✅ | 0.847 | 0.556 | -34.4% ✅ | 0.576 | -32.0% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 13.17 | 13.26 | +0.7% | 13.65 | +3.6% | 12.72 | 13.51 | +6.2% ✅ | 14.04 | +10.4% ✅ |
| wheel scroll: CPU (%) | 47.2 | 30.9 | -34.5% ✅ | 34.6 | -26.7% ✅ | 42.5 | 31.0 | -27.1% ✅ | 30.7 | -27.8% ✅ |
| key -> presented frame (ms) | 26.192 | 24.279 | -7.3% ✅ | 23.959 | -8.5% ✅ | 25.807 | 23.292 | -9.7% ✅ | 22.846 | -11.5% ✅ |
| Gecko -> engine switch (ms) | 447.5 | 405.3 | -9.4% ✅ | 456.7 | +2.1% | 416.1 | 427.1 | +2.6% | 434.2 | +4.3% |
| static page: navigate -> visible (ms) | 82.2 | 53.2 | -35.3% ✅ | 55.1 | -33.0% ✅ | 72.4 | 62.1 | -14.2% ✅ | 60.4 | -16.6% ✅ |
| RSS, whole browser (MB) | 2305.6 | 2236.0 | -3.0% | 2184.9 | -5.2% ✅ | 2284.5 | 2214.1 | -3.1% | 2163.4 | -5.3% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 8.94 | 56.04 | +526.8% ✅ | 57.22 | +540.0% ✅ | 8.57 | 56.24 | +556.2% ✅ | 57.76 | +574.0% ✅ |
| rAF page: frame interval p99 (ms) | 176.296 | 32.503 | -81.6% ✅ | 30.471 | -82.7% ✅ | 171.105 | 31.66 | -81.5% ✅ | 24.125 | -85.9% ✅ |
| rAF page: intervals > 25 ms (share) | 1.0 | 0.075 | -92.5% ✅ | 0.023 | -97.7% ✅ | 1.0 | 0.075 | -92.5% ✅ | 0.006 | -99.4% ✅ |
| rAF page: CPU, whole browser (%) | 260.0 | 269.3 | +3.6% | 240.2 | -7.6% ✅ | 270.3 | 274.0 | +1.4% | 240.8 | -10.9% ✅ |
| presenter draw per frame (ms) | 4.662 | 2.375 | -49.1% ✅ | 2.052 | -56.0% ✅ | 4.665 | 2.357 | -49.5% ✅ | 2.284 | -51.0% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 2.86 | 9.51 | +232.5% ✅ | 13.11 | +358.4% ✅ | 2.41 | 9.45 | +292.1% ✅ | 12.83 | +432.4% ✅ |
| wheel scroll: CPU (%) | 77.5 | 74.2 | -4.3% | 69.3 | -10.6% ✅ | 80.8 | 72.5 | -10.3% ✅ | 71.5 | -11.5% ✅ |
| key -> presented frame (ms) | 68.014 | 28.743 | -57.7% ✅ | 28.304 | -58.4% ✅ | 72.699 | 27.207 | -62.6% ✅ | 28.44 | -60.9% ✅ |
| Gecko -> engine switch (ms) | 547.4 | 460.5 | -15.9% ✅ | 435.9 | -20.4% ✅ | 641.2 | 433.4 | -32.4% ✅ | 444.0 | -30.8% ✅ |
| static page: navigate -> visible (ms) | 238.1 | 167.6 | -29.6% ✅ | 57.6 | -75.8% ✅ | 192.1 | 66.2 | -65.5% ✅ | 57.3 | -70.2% ✅ |
| RSS, whole browser (MB) | 2448.9 | 2345.8 | -4.2% | 2425.2 | -1.0% | 2518.7 | 2401.8 | -4.6% | 2432.6 | -3.4% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

