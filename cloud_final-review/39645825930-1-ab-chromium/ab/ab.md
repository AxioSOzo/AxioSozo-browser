# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 9V74 80-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 60.0 | 59.99 | -0.0% | 60.05 | 59.99 | -0.1% |
| rAF page: frame interval p99 (ms) | 21.078 | 20.619 | -2.2% | 20.947 | 20.563 | -1.8% |
| rAF page: intervals > 25 ms (share) | 0.003 | 0.0 | -100.0% ✅ | 0.0 | 0.003 | — |
| rAF page: CPU, whole browser (%) | 29.45 | 28.8 | -2.2% | 30.1 | 29.6 | -1.7% |
| rAF page: CPU, Zen parent process (%) | 14.65 | 13.8 | -5.8% ✅ | 14.8 | 14.95 | +1.0% |
| presenter draw per frame (ms) | 0.011 | 0.012 | +9.1% ⚠️ | 0.01 | 0.01 | +0.0% |
| presenter uploaded pixel share | 0.276 | 0.276 | +0.0% | 0.28 | 0.276 | -1.4% |
| wheel scroll: fps while input is delivered (XTest-paced) | 60.005 | 59.99 | -0.0% | 59.75 | 59.855 | +0.2% |
| wheel scroll: frame interval p99 while input (ms) | 20.859 | 21.045 | +0.9% | 22.68 | 20.916 | -7.8% ✅ |
| wheel scroll: fps, first to last frame of the window | 60.005 | 59.99 | -0.0% | 59.75 | 59.855 | +0.2% |
| wheel scroll: CPU (%) | 57.6 | 55.15 | -4.3% | 59.75 | 64.25 | +7.5% ⚠️ |
| wheel scroll: CPU, Zen parent (%) | 26.05 | 25.05 | -3.8% | 28.8 | 29.75 | +3.3% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.944 | 1.944 | +0.0% | 1.944 | 1.943 | -0.1% |
| key -> presented frame (ms) | 10.727 | 10.497 | -2.1% | 10.474 | 10.957 | +4.6% |
| key -> presented frame p95 (ms) | 12.359 | 11.631 | -5.9% ✅ | 11.223 | 14.246 | +26.9% ⚠️ |
| Gecko -> engine switch (ms) | 661.9 | 407.7 | -38.4% ✅ | 445.25 | 424.0 | -4.8% |
| static page: navigate -> visible (ms) | 48.65 | 32.25 | -33.7% ✅ | 25.5 | 44.05 | +72.7% ⚠️ |
| RSS, whole browser (MB) | 2684.35 | 2682.0 | -0.1% | 2707.25 | 2672.9 | -1.3% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 60.0 | 60.025 | +0.0% | 60.02 | 59.985 | -0.1% |
| rAF page: frame interval p99 (ms) | 21.004 | 20.95 | -0.3% | 20.685 | 20.887 | +1.0% |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.003 | — | 0.005 | 0.0 | -100.0% ✅ |
| rAF page: CPU, whole browser (%) | 50.9 | 49.95 | -1.9% | 52.05 | 54.35 | +4.4% |
| rAF page: CPU, Zen parent process (%) | 22.3 | 22.15 | -0.7% | 22.5 | 23.35 | +3.8% |
| presenter draw per frame (ms) | 0.011 | 0.01 | -9.1% ✅ | 0.011 | 0.011 | +0.0% |
| presenter uploaded pixel share | 0.286 | 0.286 | +0.0% | 0.287 | 0.286 | -0.3% |
| wheel scroll: fps while input is delivered (XTest-paced) | 59.355 | 59.72 | +0.6% | 59.225 | 59.755 | +0.9% |
| wheel scroll: frame interval p99 while input (ms) | 22.532 | 21.763 | -3.4% | 24.198 | 24.615 | +1.7% |
| wheel scroll: fps, first to last frame of the window | 59.355 | 59.72 | +0.6% | 59.225 | 59.755 | +0.9% |
| wheel scroll: CPU (%) | 114.55 | 115.4 | +0.7% | 115.2 | 117.7 | +2.2% |
| wheel scroll: CPU, Zen parent (%) | 42.1 | 42.35 | +0.6% | 43.05 | 41.8 | -2.9% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.948 | 1.947 | -0.1% | 1.946 | 1.947 | +0.1% |
| key -> presented frame (ms) | 11.019 | 10.975 | -0.4% | 11.096 | 11.04 | -0.5% |
| key -> presented frame p95 (ms) | 13.579 | 11.686 | -13.9% ✅ | 12.988 | 13.236 | +1.9% |
| Gecko -> engine switch (ms) | 446.75 | 464.85 | +4.1% | 463.6 | 457.45 | -1.3% |
| static page: navigate -> visible (ms) | 48.25 | 38.05 | -21.1% ✅ | 44.65 | 34.5 | -22.7% ✅ |
| RSS, whole browser (MB) | 2899.7 | 2883.95 | -0.5% | 2904.85 | 2899.05 | -0.2% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

