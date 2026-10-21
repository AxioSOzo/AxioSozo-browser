# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 9V45 96-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 60.005 | 59.97 | -0.1% | 59.99 | 59.985 | -0.0% |
| rAF page: frame interval p99 (ms) | 21.291 | 23.505 | +10.4% ⚠️ | 20.77 | 20.535 | -1.1% |
| rAF page: intervals > 25 ms (share) | 0.003 | 0.005 | +66.7% ⚠️ | 0.0 | 0.0 | — |
| rAF page: CPU, whole browser (%) | 36.65 | 34.65 | -5.5% ✅ | 38.7 | 28.75 | -25.7% ✅ |
| rAF page: CPU, Zen parent process (%) | 16.95 | 16.25 | -4.1% | 17.9 | 13.45 | -24.9% ✅ |
| presenter draw per frame (ms) | 0.011 | 0.011 | +0.0% | 0.013 | 0.009 | -30.8% ✅ |
| presenter uploaded pixel share | 0.279 | 0.277 | -0.7% | 0.277 | 0.276 | -0.4% |
| wheel scroll: fps while input is delivered (XTest-paced) | 59.75 | 59.685 | -0.1% | 59.935 | 59.685 | -0.4% |
| wheel scroll: frame interval p99 while input (ms) | 22.845 | 25.503 | +11.6% ⚠️ | 24.081 | 26.643 | +10.6% ⚠️ |
| wheel scroll: fps, first to last frame of the window | 59.75 | 59.685 | -0.1% | 59.935 | 59.685 | -0.4% |
| wheel scroll: CPU (%) | 69.35 | 64.2 | -7.4% ✅ | 67.45 | 65.35 | -3.1% |
| wheel scroll: CPU, Zen parent (%) | 34.2 | 31.45 | -8.0% ✅ | 32.85 | 32.95 | +0.3% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.946 | 1.944 | -0.1% | 1.945 | 1.946 | +0.1% |
| key -> presented frame (ms) | 11.347 | 10.847 | -4.4% | 11.386 | 11.117 | -2.4% |
| key -> presented frame p95 (ms) | 14.397 | 15.283 | +6.2% ⚠️ | 12.361 | 14.766 | +19.5% ⚠️ |
| Gecko -> engine switch (ms) | 445.7 | 378.1 | -15.2% ✅ | 380.15 | 410.1 | +7.9% ⚠️ |
| static page: navigate -> visible (ms) | 30.0 | 29.85 | -0.5% | 35.5 | 23.75 | -33.1% ✅ |
| RSS, whole browser (MB) | 2575.15 | 2713.3 | +5.4% ⚠️ | 2686.55 | 2701.15 | +0.5% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.98 | 59.98 | +0.0% | 60.035 | 59.925 | -0.2% |
| rAF page: frame interval p99 (ms) | 25.952 | 27.236 | +4.9% | 21.743 | 23.839 | +9.6% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.011 | 0.014 | +27.3% ⚠️ | 0.005 | 0.008 | +60.0% ⚠️ |
| rAF page: CPU, whole browser (%) | 54.15 | 54.3 | +0.3% | 55.4 | 60.8 | +9.7% ⚠️ |
| rAF page: CPU, Zen parent process (%) | 22.0 | 22.65 | +3.0% | 23.6 | 25.9 | +9.7% ⚠️ |
| presenter draw per frame (ms) | 0.014 | 0.012 | -14.3% ✅ | 0.012 | 0.014 | +16.7% ⚠️ |
| presenter uploaded pixel share | 0.289 | 0.289 | +0.0% | 0.289 | 0.287 | -0.7% |
| wheel scroll: fps while input is delivered (XTest-paced) | 59.815 | 59.36 | -0.8% | 59.96 | 59.985 | +0.0% |
| wheel scroll: frame interval p99 while input (ms) | 22.266 | 29.965 | +34.6% ⚠️ | 24.8 | 24.093 | -2.9% |
| wheel scroll: fps, first to last frame of the window | 59.815 | 59.36 | -0.8% | 59.96 | 59.985 | +0.0% |
| wheel scroll: CPU (%) | 103.35 | 117.0 | +13.2% ⚠️ | 108.8 | 129.65 | +19.2% ⚠️ |
| wheel scroll: CPU, Zen parent (%) | 37.35 | 47.85 | +28.1% ⚠️ | 40.8 | 51.45 | +26.1% ⚠️ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.945 | 1.949 | +0.2% | 1.946 | 1.952 | +0.3% |
| key -> presented frame (ms) | 11.202 | 11.394 | +1.7% | 11.506 | 12.309 | +7.0% ⚠️ |
| key -> presented frame p95 (ms) | 11.962 | 14.059 | +17.5% ⚠️ | 12.456 | 14.116 | +13.3% ⚠️ |
| Gecko -> engine switch (ms) | 413.35 | 468.0 | +13.2% ⚠️ | 414.5 | 474.85 | +14.6% ⚠️ |
| static page: navigate -> visible (ms) | 44.5 | 42.85 | -3.7% | 35.0 | 40.5 | +15.7% ⚠️ |
| RSS, whole browser (MB) | 2868.1 | 2908.4 | +1.4% | 2880.15 | 2912.35 | +1.1% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

