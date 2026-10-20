# Pixel-path A/B in one job: webkit tabs in Zen

CPU: Intel(R) Xeon(R) 6973P-C. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | jsmain r1 | Δjsmain r1 | base r2 | cand r2 | Δcand r2 | jsmain r2 | Δjsmain r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.87 | 57.82 | -0.1% | 58.14 | +0.5% | 57.66 | 58.02 | +0.6% | 57.96 | +0.5% |
| rAF page: frame interval p99 (ms) | 22.304 | 21.768 | -2.4% | 22.153 | -0.7% | 23.671 | 22.349 | -5.6% ✅ | 22.906 | -3.2% |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.0 | — | 0.0 | — | 0.006 | 0.0 | -100.0% ✅ | 0.006 | +0.0% |
| rAF page: CPU, whole browser (%) | 98.2 | 93.6 | -4.7% | 97.3 | -0.9% | 109.7 | 103.1 | -6.0% ✅ | 102.2 | -6.8% ✅ |
| rAF page: CPU, Zen parent process (%) | 43.6 | 36.1 | -17.2% ✅ | 38.4 | -11.9% ✅ | 49.6 | 39.7 | -20.0% ✅ | 40.7 | -17.9% ✅ |
| presenter draw per frame (ms) | 0.838 | 0.976 | +16.5% ⚠️ | 0.98 | +16.9% ⚠️ | 0.893 | 1.059 | +18.6% ⚠️ | 1.09 | +22.1% ⚠️ |
| wheel scroll: fps while input is delivered (XTest-paced) | 50.72 | 57.21 | +12.8% ✅ | 53.23 | +4.9% | 51.17 | 57.13 | +11.6% ✅ | 52.39 | +2.4% |
| wheel scroll: frame interval p99 while input (ms) | 38.638 | 33.057 | -14.4% ✅ | 37.128 | -3.9% | 41.466 | 34.752 | -16.2% ✅ | 37.293 | -10.1% ✅ |
| wheel scroll: fps, first to last frame of the window | 50.72 | 57.21 | +12.8% ✅ | 53.23 | +4.9% | 51.17 | 57.13 | +11.6% ✅ | 52.39 | +2.4% |
| wheel scroll: CPU (%) | 150.3 | 118.0 | -21.5% ✅ | 117.4 | -21.9% ✅ | 158.0 | 123.9 | -21.6% ✅ | 125.1 | -20.8% ✅ |
| wheel scroll: CPU, Zen parent (%) | 87.2 | 53.5 | -38.6% ✅ | 54.7 | -37.3% ✅ | 92.8 | 57.4 | -38.1% ✅ | 59.5 | -35.9% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.962 | 1.963 | +0.1% | 1.953 | -0.5% | 1.955 | 1.951 | -0.2% | 1.953 | -0.1% |
| key -> presented frame (ms) | 24.806 | 16.394 | -33.9% ✅ | 24.495 | -1.3% | 24.659 | 16.598 | -32.7% ✅ | 24.542 | -0.5% |
| key -> presented frame p95 (ms) | 33.03 | 23.506 | -28.8% ✅ | 33.057 | +0.1% | 32.549 | 24.344 | -25.2% ✅ | 32.489 | -0.2% |
| Gecko -> engine switch (ms) | 435.1 | 515.1 | +18.4% ⚠️ | 548.7 | +26.1% ⚠️ | 514.6 | 517.7 | +0.6% | 516.4 | +0.3% |
| static page: navigate -> visible (ms) | 66.7 | 63.7 | -4.5% | 62.1 | -6.9% ✅ | 64.0 | 60.0 | -6.2% ✅ | 56.1 | -12.3% ✅ |
| RSS, whole browser (MB) | 2222.5 | 2214.4 | -0.4% | 2222.7 | +0.0% | 2228.1 | 2211.5 | -0.7% | 2208.2 | -0.9% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, jsmain-r1 PASS, jsmain-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | jsmain r1 | Δjsmain r1 | base r2 | cand r2 | Δcand r2 | jsmain r2 | Δjsmain r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 54.31 | 57.6 | +6.1% ✅ | 56.57 | +4.2% | 50.93 | 57.8 | +13.5% ✅ | 56.5 | +10.9% ✅ |
| rAF page: frame interval p99 (ms) | 33.608 | 26.861 | -20.1% ✅ | 30.897 | -8.1% ✅ | 36.823 | 28.477 | -22.7% ✅ | 31.469 | -14.5% ✅ |
| rAF page: intervals > 25 ms (share) | 0.073 | 0.034 | -53.4% ✅ | 0.041 | -43.8% ✅ | 0.13 | 0.046 | -64.6% ✅ | 0.036 | -72.3% ✅ |
| rAF page: CPU, whole browser (%) | 296.0 | 260.1 | -12.1% ✅ | 290.4 | -1.9% | 314.3 | 273.9 | -12.9% ✅ | 290.4 | -7.6% ✅ |
| rAF page: CPU, Zen parent process (%) | 124.7 | 81.0 | -35.0% ✅ | 101.4 | -18.7% ✅ | 131.6 | 84.6 | -35.7% ✅ | 100.4 | -23.7% ✅ |
| presenter draw per frame (ms) | 3.87 | 3.197 | -17.4% ✅ | 4.085 | +5.6% ⚠️ | 4.315 | 3.566 | -17.4% ✅ | 4.171 | -3.3% |
| wheel scroll: fps while input is delivered (XTest-paced) | 22.62 | 49.89 | +120.6% ✅ | 41.21 | +82.2% ✅ | 20.63 | 47.38 | +129.7% ✅ | 40.31 | +95.4% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 87.537 | 39.044 | -55.4% ✅ | 44.843 | -48.8% ✅ | 85.098 | 41.609 | -51.1% ✅ | 49.741 | -41.5% ✅ |
| wheel scroll: fps, first to last frame of the window | 22.62 | 49.89 | +120.6% ✅ | 41.21 | +82.2% ✅ | 20.63 | 47.38 | +129.7% ✅ | 40.31 | +95.4% ✅ |
| wheel scroll: CPU (%) | 296.1 | 317.8 | +7.3% ⚠️ | 306.2 | +3.4% | 307.6 | 319.0 | +3.7% | 302.7 | -1.6% |
| wheel scroll: CPU, Zen parent (%) | 121.1 | 129.1 | +6.6% ⚠️ | 124.1 | +2.5% | 122.6 | 129.9 | +6.0% ⚠️ | 120.1 | -2.0% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 2.0 | 2.006 | +0.3% | 2.009 | +0.4% | 2.011 | 2.001 | -0.5% | 2.018 | +0.3% |
| key -> presented frame (ms) | 29.457 | 30.707 | +4.2% | 29.971 | +1.7% | 30.069 | 30.768 | +2.3% | 31.357 | +4.3% |
| key -> presented frame p95 (ms) | 37.313 | 35.8 | -4.1% | 38.771 | +3.9% | 36.886 | 35.569 | -3.6% | 37.663 | +2.1% |
| Gecko -> engine switch (ms) | 518.1 | 603.4 | +16.5% ⚠️ | 544.7 | +5.1% ⚠️ | 619.0 | 581.4 | -6.1% ✅ | 599.6 | -3.1% |
| static page: navigate -> visible (ms) | 102.8 | 87.6 | -14.8% ✅ | 73.3 | -28.7% ✅ | 91.2 | 61.1 | -33.0% ✅ | 81.2 | -11.0% ✅ |
| RSS, whole browser (MB) | 2410.1 | 2396.1 | -0.6% | 2445.2 | +1.5% | 2396.9 | 2384.4 | -0.5% | 2423.0 | +1.1% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, jsmain-r1 PASS, jsmain-r2 PASS

