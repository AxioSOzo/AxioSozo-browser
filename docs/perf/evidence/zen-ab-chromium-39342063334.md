# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch, memfd = this branch with the EXPERIMENTAL memfd frame pref (TEST-ONLY); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 42.64 | 58.99 | +38.3% ✅ | 58.98 | +38.3% ✅ | 42.87 | 59.0 | +37.6% ✅ | 58.66 | +36.8% ✅ |
| rAF page: frame interval p99 (ms) | 38.494 | 19.002 | -50.6% ✅ | 29.142 | -24.3% ✅ | 39.45 | 20.822 | -47.2% ✅ | 29.236 | -25.9% ✅ |
| rAF page: intervals > 25 ms (share) | 0.169 | 0.0 | -100.0% ✅ | 0.017 | -89.9% ✅ | 0.16 | 0.0 | -100.0% ✅ | 0.017 | -89.4% ✅ |
| rAF page: CPU, whole browser (%) | 159.4 | 75.3 | -52.8% ✅ | 69.1 | -56.6% ✅ | 159.3 | 75.2 | -52.8% ✅ | 71.0 | -55.4% ✅ |
| presenter draw per frame (ms) | 1.614 | 1.161 | -28.1% ✅ | 1.169 | -27.6% ✅ | 1.595 | 1.139 | -28.6% ✅ | 1.191 | -25.3% ✅ |
| presenter uploaded pixel share | 0.28 | 0.27 | -3.6% | 0.264 | -5.7% ✅ | 0.281 | 0.27 | -3.9% | 0.264 | -6.0% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 4.95 | 8.08 | +63.2% ✅ | 8.43 | +70.3% ✅ | 4.95 | 8.21 | +65.9% ✅ | 8.42 | +70.1% ✅ |
| wheel scroll: CPU (%) | 25.4 | 21.7 | -14.6% ✅ | 17.8 | -29.9% ✅ | 25.8 | 22.4 | -13.2% ✅ | 18.9 | -26.7% ✅ |
| key -> presented frame (ms) | 29.136 | 19.911 | -31.7% ✅ | 20.284 | -30.4% ✅ | 28.846 | 18.613 | -35.5% ✅ | 20.117 | -30.3% ✅ |
| Gecko -> engine switch (ms) | 438.7 | 420.3 | -4.2% | 431.8 | -1.6% | 454.9 | 427.7 | -6.0% ✅ | 417.4 | -8.2% ✅ |
| static page: navigate -> visible (ms) | 79.8 | 47.6 | -40.4% ✅ | 42.4 | -46.9% ✅ | 87.1 | 61.1 | -29.9% ✅ | 48.4 | -44.4% ✅ |
| RSS, whole browser (MB) | 2833.2 | 2793.7 | -1.4% | 2570.5 | -9.3% ✅ | 2833.8 | 2828.1 | -0.2% | 2670.3 | -5.8% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 10.45 | 58.0 | +455.0% ✅ | 59.0 | +464.6% ✅ | 10.27 | 57.64 | +461.2% ✅ | 59.02 | +474.7% ✅ |
| rAF page: frame interval p99 (ms) | 125.013 | 31.072 | -75.1% ✅ | 21.979 | -82.4% ✅ | 124.977 | 30.611 | -75.5% ✅ | 21.809 | -82.5% ✅ |
| rAF page: intervals > 25 ms (share) | 1.0 | 0.022 | -97.8% ✅ | 0.0 | -100.0% ✅ | 1.0 | 0.028 | -97.2% ✅ | 0.0 | -100.0% ✅ |
| rAF page: CPU, whole browser (%) | 165.1 | 161.5 | -2.2% | 132.5 | -19.7% ✅ | 165.1 | 163.7 | -0.8% | 130.6 | -20.9% ✅ |
| presenter draw per frame (ms) | 6.349 | 3.539 | -44.3% ✅ | 3.578 | -43.6% ✅ | 6.208 | 3.682 | -40.7% ✅ | 3.587 | -42.2% ✅ |
| presenter uploaded pixel share | 0.411 | 0.282 | -31.4% ✅ | 0.28 | -31.9% ✅ | 0.411 | 0.283 | -31.1% ✅ | 0.281 | -31.6% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 1.11 | 3.93 | +254.1% ✅ | 8.13 | +632.4% ✅ | 1.11 | 4.0 | +260.4% ✅ | 8.27 | +645.0% ✅ |
| wheel scroll: CPU (%) | 31.8 | 33.9 | +6.6% ⚠️ | 33.1 | +4.1% | 33.1 | 33.7 | +1.8% | 34.1 | +3.0% |
| key -> presented frame (ms) | 90.68 | 21.061 | -76.8% ✅ | 18.682 | -79.4% ✅ | 89.598 | 20.882 | -76.7% ✅ | 21.03 | -76.5% ✅ |
| Gecko -> engine switch (ms) | 567.1 | 468.5 | -17.4% ✅ | 470.9 | -17.0% ✅ | 601.0 | 525.8 | -12.5% ✅ | 501.6 | -16.5% ✅ |
| static page: navigate -> visible (ms) | 254.3 | 76.6 | -69.9% ✅ | 66.6 | -73.8% ✅ | 282.3 | 87.3 | -69.1% ✅ | 48.4 | -82.9% ✅ |
| RSS, whole browser (MB) | 2996.9 | 3069.0 | +2.4% | 2943.9 | -1.8% | 3108.5 | 2961.1 | -4.7% | 2925.4 | -5.9% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

