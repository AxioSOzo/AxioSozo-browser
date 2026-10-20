# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | jsmain r1 | Δjsmain r1 | base r2 | cand r2 | Δcand r2 | jsmain r2 | Δjsmain r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.0 | 60.04 | +1.8% | 59.0 | +0.0% | 59.0 | 59.99 | +1.7% | 58.99 | -0.0% |
| rAF page: frame interval p99 (ms) | 20.513 | 20.819 | +1.5% | 18.788 | -8.4% ✅ | 21.018 | 22.358 | +6.4% ⚠️ | 19.14 | -8.9% ✅ |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.005 | — | 0.0 | — | 0.0 | 0.0 | — | 0.005 | — |
| rAF page: CPU, whole browser (%) | 74.4 | 63.0 | -15.3% ✅ | 70.0 | -5.9% ✅ | 78.9 | 62.3 | -21.0% ✅ | 66.2 | -16.1% ✅ |
| rAF page: CPU, Zen parent process (%) | 50.9 | 37.5 | -26.3% ✅ | 44.0 | -13.6% ✅ | 53.1 | 37.5 | -29.4% ✅ | 43.4 | -18.3% ✅ |
| presenter draw per frame (ms) | 1.209 | 1.168 | -3.4% | 1.494 | +23.6% ⚠️ | 1.282 | 1.133 | -11.6% ✅ | 1.469 | +14.6% ⚠️ |
| presenter uploaded pixel share | 0.282 | 0.268 | -5.0% | 0.422 | +49.6% ⚠️ | 0.279 | 0.268 | -3.9% | 0.419 | +50.2% ⚠️ |
| wheel scroll: fps while input is delivered (XTest-paced) | 53.9 | 59.84 | +11.0% ✅ | 58.43 | +8.4% ✅ | 52.36 | 59.81 | +14.2% ✅ | 57.43 | +9.7% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 36.382 | 23.032 | -36.7% ✅ | 25.266 | -30.6% ✅ | 35.275 | 21.338 | -39.5% ✅ | 32.059 | -9.1% ✅ |
| wheel scroll: fps, first to last frame of the window | 53.9 | 59.84 | +11.0% ✅ | 58.43 | +8.4% ✅ | 52.36 | 59.81 | +14.2% ✅ | 57.43 | +9.7% ✅ |
| wheel scroll: CPU (%) | 141.1 | 102.2 | -27.6% ✅ | 113.5 | -19.6% ✅ | 149.4 | 103.1 | -31.0% ✅ | 111.3 | -25.5% ✅ |
| wheel scroll: CPU, Zen parent (%) | 100.1 | 61.4 | -38.7% ✅ | 71.9 | -28.2% ✅ | 105.1 | 60.9 | -42.1% ✅ | 70.3 | -33.1% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.958 | 1.955 | -0.2% | 1.957 | -0.1% | 1.957 | 1.956 | -0.1% | 1.955 | -0.1% |
| key -> presented frame (ms) | 19.611 | 12.118 | -38.2% ✅ | 19.81 | +1.0% | 20.066 | 12.024 | -40.1% ✅ | 19.266 | -4.0% |
| key -> presented frame p95 (ms) | 25.507 | 13.331 | -47.7% ✅ | 25.073 | -1.7% | 25.792 | 13.669 | -47.0% ✅ | 25.465 | -1.3% |
| Gecko -> engine switch (ms) | 493.0 | 540.5 | +9.6% ⚠️ | 495.5 | +0.5% | 529.4 | 559.9 | +5.8% ⚠️ | 458.1 | -13.5% ✅ |
| static page: navigate -> visible (ms) | 61.5 | 53.0 | -13.8% ✅ | 55.7 | -9.4% ✅ | 58.0 | 51.1 | -11.9% ✅ | 58.7 | +1.2% |
| RSS, whole browser (MB) | 2760.2 | 2651.1 | -4.0% | 2736.9 | -0.8% | 2773.7 | 2693.0 | -2.9% | 2716.3 | -2.1% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, jsmain-r1 PASS, jsmain-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | jsmain r1 | Δjsmain r1 | base r2 | cand r2 | Δcand r2 | jsmain r2 | Δjsmain r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 56.73 | 60.03 | +5.8% ✅ | 58.99 | +4.0% | 56.77 | 59.97 | +5.6% ✅ | 58.72 | +3.4% |
| rAF page: frame interval p99 (ms) | 33.156 | 24.499 | -26.1% ✅ | 25.007 | -24.6% ✅ | 36.23 | 27.462 | -24.2% ✅ | 26.611 | -26.5% ✅ |
| rAF page: intervals > 25 ms (share) | 0.051 | 0.005 | -90.2% ✅ | 0.011 | -78.4% ✅ | 0.04 | 0.016 | -60.0% ✅ | 0.011 | -72.5% ✅ |
| rAF page: CPU, whole browser (%) | 171.8 | 124.1 | -27.8% ✅ | 145.9 | -15.1% ✅ | 177.7 | 124.1 | -30.2% ✅ | 143.5 | -19.2% ✅ |
| rAF page: CPU, Zen parent process (%) | 125.8 | 81.9 | -34.9% ✅ | 101.7 | -19.2% ✅ | 130.2 | 80.6 | -38.1% ✅ | 99.0 | -24.0% ✅ |
| presenter draw per frame (ms) | 3.727 | 3.655 | -1.9% | 4.772 | +28.0% ⚠️ | 3.81 | 3.563 | -6.5% ✅ | 4.558 | +19.6% ⚠️ |
| presenter uploaded pixel share | 0.291 | 0.277 | -4.8% | 0.467 | +60.5% ⚠️ | 0.288 | 0.277 | -3.8% | 0.468 | +62.5% ⚠️ |
| wheel scroll: fps while input is delivered (XTest-paced) | 24.64 | 59.65 | +142.1% ✅ | 47.28 | +91.9% ✅ | 23.18 | 59.82 | +158.1% ✅ | 47.04 | +102.9% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 98.272 | 24.07 | -75.5% ✅ | 46.293 | -52.9% ✅ | 101.215 | 25.002 | -75.3% ✅ | 35.623 | -64.8% ✅ |
| wheel scroll: fps, first to last frame of the window | 24.66 | 59.65 | +141.9% ✅ | 46.98 | +90.5% ✅ | 23.22 | 59.82 | +157.6% ✅ | 46.79 | +101.5% ✅ |
| wheel scroll: CPU (%) | 228.2 | 227.0 | -0.5% | 249.9 | +9.5% ⚠️ | 233.0 | 229.7 | -1.4% | 251.4 | +7.9% ⚠️ |
| wheel scroll: CPU, Zen parent (%) | 131.5 | 125.4 | -4.6% | 149.7 | +13.8% ⚠️ | 131.3 | 129.2 | -1.6% | 150.3 | +14.5% ⚠️ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.976 | 1.979 | +0.2% | 1.986 | +0.5% | 1.979 | 1.986 | +0.4% | 1.988 | +0.5% |
| key -> presented frame (ms) | 20.909 | 12.439 | -40.5% ✅ | 21.031 | +0.6% | 21.39 | 12.153 | -43.2% ✅ | 20.715 | -3.2% |
| key -> presented frame p95 (ms) | 28.834 | 15.466 | -46.4% ✅ | 28.338 | -1.7% | 29.721 | 13.671 | -54.0% ✅ | 27.622 | -7.1% ✅ |
| Gecko -> engine switch (ms) | 610.1 | 561.9 | -7.9% ✅ | 578.2 | -5.2% ✅ | 604.6 | 554.8 | -8.2% ✅ | 507.6 | -16.0% ✅ |
| static page: navigate -> visible (ms) | 120.3 | 49.0 | -59.3% ✅ | 58.9 | -51.0% ✅ | 111.0 | 60.3 | -45.7% ✅ | 71.1 | -35.9% ✅ |
| RSS, whole browser (MB) | 3159.7 | 2752.0 | -12.9% ✅ | 2924.1 | -7.5% ✅ | 3029.9 | 2769.9 | -8.6% ✅ | 2861.5 | -5.6% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, jsmain-r1 PASS, jsmain-r2 PASS

