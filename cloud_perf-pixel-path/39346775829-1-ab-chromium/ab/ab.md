# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 9V74 80-Core Processor. base = cloud/integration chrome JS + host, cand = this branch, memfd = this branch with the EXPERIMENTAL memfd frame pref (TEST-ONLY); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 54.4 | 59.0 | +8.5% ✅ | 59.03 | +8.5% ✅ | 54.68 | 58.97 | +7.8% ✅ | 59.02 | +7.9% ✅ |
| rAF page: frame interval p99 (ms) | 35.62 | 19.843 | -44.3% ✅ | 20.235 | -43.2% ✅ | 36.616 | 21.6 | -41.0% ✅ | 20.244 | -44.7% ✅ |
| rAF page: intervals > 25 ms (share) | 0.072 | 0.0 | -100.0% ✅ | 0.0 | -100.0% ✅ | 0.054 | 0.006 | -88.9% ✅ | 0.0 | -100.0% ✅ |
| rAF page: CPU, whole browser (%) | 161.5 | 68.9 | -57.3% ✅ | 58.4 | -63.8% ✅ | 160.2 | 68.9 | -57.0% ✅ | 60.1 | -62.5% ✅ |
| presenter draw per frame (ms) | 1.28 | 1.023 | -20.1% ✅ | 0.958 | -25.2% ✅ | 1.289 | 0.999 | -22.5% ✅ | 0.972 | -24.6% ✅ |
| presenter uploaded pixel share | 0.27 | 0.268 | -0.7% | 0.263 | -2.6% | 0.271 | 0.271 | +0.0% | 0.264 | -2.6% |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 6.33 | 8.15 | +28.8% ✅ | 8.38 | +32.4% ✅ | 6.12 | 8.29 | +35.5% ✅ | 8.29 | +35.5% ✅ |
| wheel scroll: CPU (%) | 24.7 | 21.1 | -14.6% ✅ | 15.6 | -36.8% ✅ | 26.5 | 20.1 | -24.2% ✅ | 16.4 | -38.1% ✅ |
| key -> presented frame (ms) | 24.336 | 16.955 | -30.3% ✅ | 18.259 | -25.0% ✅ | 24.229 | 15.906 | -34.4% ✅ | 18.962 | -21.7% ✅ |
| Gecko -> engine switch (ms) | 517.2 | 584.0 | +12.9% ⚠️ | 375.9 | -27.3% ✅ | 431.6 | 462.7 | +7.2% ⚠️ | 385.2 | -10.8% ✅ |
| static page: navigate -> visible (ms) | 63.1 | 46.4 | -26.5% ✅ | 40.6 | -35.7% ✅ | 65.8 | 58.1 | -11.7% ✅ | 41.4 | -37.1% ✅ |
| RSS, whole browser (MB) | 2771.5 | 2834.3 | +2.3% | 2663.5 | -3.9% | 2892.5 | 2752.2 | -4.9% | 2714.8 | -6.1% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | memfd r1 | Δmemfd r1 | base r2 | cand r2 | Δcand r2 | memfd r2 | Δmemfd r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 12.71 | 58.02 | +356.5% ✅ | 59.0 | +364.2% ✅ | 13.08 | 58.33 | +345.9% ✅ | 58.99 | +351.0% ✅ |
| rAF page: frame interval p99 (ms) | 109.614 | 29.398 | -73.2% ✅ | 19.935 | -81.8% ✅ | 107.802 | 30.035 | -72.1% ✅ | 22.526 | -79.1% ✅ |
| rAF page: intervals > 25 ms (share) | 1.0 | 0.017 | -98.3% ✅ | 0.0 | -100.0% ✅ | 1.0 | 0.023 | -97.7% ✅ | 0.006 | -99.4% ✅ |
| rAF page: CPU, whole browser (%) | 164.7 | 149.0 | -9.5% ✅ | 120.3 | -27.0% ✅ | 163.5 | 150.3 | -8.1% ✅ | 125.1 | -23.5% ✅ |
| presenter draw per frame (ms) | 4.677 | 2.953 | -36.9% ✅ | 3.004 | -35.8% ✅ | 4.653 | 2.966 | -36.3% ✅ | 3.028 | -34.9% ✅ |
| presenter uploaded pixel share | 0.384 | 0.279 | -27.3% ✅ | 0.272 | -29.2% ✅ | 0.384 | 0.282 | -26.6% ✅ | 0.275 | -28.4% ✅ |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | 1.47 | 4.73 | +221.8% ✅ | 8.34 | +467.3% ✅ | 1.47 | 4.95 | +236.7% ✅ | 8.06 | +448.3% ✅ |
| wheel scroll: CPU (%) | 30.3 | 33.2 | +9.6% ⚠️ | 31.5 | +4.0% | 31.2 | 32.5 | +4.2% | 29.6 | -5.1% ✅ |
| key -> presented frame (ms) | 73.872 | 19.681 | -73.4% ✅ | 18.69 | -74.7% ✅ | 74.315 | 19.675 | -73.5% ✅ | 19.371 | -73.9% ✅ |
| Gecko -> engine switch (ms) | 482.5 | 532.0 | +10.3% ⚠️ | 436.5 | -9.5% ✅ | 549.2 | 487.3 | -11.3% ✅ | 408.2 | -25.7% ✅ |
| static page: navigate -> visible (ms) | 235.0 | 82.4 | -64.9% ✅ | 48.5 | -79.4% ✅ | 208.3 | 78.7 | -62.2% ✅ | 44.9 | -78.4% ✅ |
| RSS, whole browser (MB) | 3117.1 | 2926.7 | -6.1% ✅ | 2896.7 | -7.1% ✅ | 3105.9 | 2750.2 | -11.5% ✅ | 2932.9 | -5.6% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, memfd-r1 PASS, memfd-r2 PASS

