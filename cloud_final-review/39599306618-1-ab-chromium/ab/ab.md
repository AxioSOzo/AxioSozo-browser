# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.95 | 60.015 | +0.1% | 60.015 | 59.995 | -0.0% |
| rAF page: frame interval p99 (ms) | 20.857 | 20.78 | -0.4% | 21.521 | 21.715 | +0.9% |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.003 | — | 0.0 | 0.003 | — |
| rAF page: CPU, whole browser (%) | 44.4 | 42.45 | -4.4% | 46.7 | 45.2 | -3.2% |
| rAF page: CPU, Zen parent process (%) | 21.25 | 21.35 | +0.5% | 22.55 | 22.05 | -2.2% |
| presenter draw per frame (ms) | 0.015 | 0.017 | +13.3% ⚠️ | 0.015 | 0.019 | +26.7% ⚠️ |
| presenter uploaded pixel share | 0.276 | 0.276 | +0.0% | 0.276 | 0.278 | +0.7% |
| wheel scroll: fps while input is delivered (XTest-paced) | 60.155 | 59.46 | -1.2% | 59.065 | 58.675 | -0.7% |
| wheel scroll: frame interval p99 while input (ms) | 21.324 | 29.267 | +37.2% ⚠️ | 39.461 | 36.326 | -7.9% ✅ |
| wheel scroll: fps, first to last frame of the window | 60.155 | 59.46 | -1.2% | 59.065 | 58.675 | -0.7% |
| wheel scroll: CPU (%) | 79.7 | 89.0 | +11.7% ⚠️ | 90.95 | 90.75 | -0.2% |
| wheel scroll: CPU, Zen parent (%) | 39.35 | 48.7 | +23.8% ⚠️ | 50.15 | 50.2 | +0.1% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.954 | 1.953 | -0.1% | 1.953 | 1.953 | +0.0% |
| key -> presented frame (ms) | 12.601 | 12.502 | -0.8% | 12.755 | 12.656 | -0.8% |
| key -> presented frame p95 (ms) | 13.954 | 14.711 | +5.4% ⚠️ | 14.683 | 15.742 | +7.2% ⚠️ |
| Gecko -> engine switch (ms) | 563.25 | 575.1 | +2.1% | 568.7 | 579.75 | +1.9% |
| static page: navigate -> visible (ms) | 36.2 | 49.45 | +36.6% ⚠️ | 52.2 | 52.9 | +1.3% |
| RSS, whole browser (MB) | 2674.95 | 2673.7 | -0.0% | 2689.7 | 2672.65 | -0.6% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.99 | 59.995 | +0.0% | 60.01 | 60.025 | +0.0% |
| rAF page: frame interval p99 (ms) | 21.065 | 21.692 | +3.0% | 21.262 | 22.102 | +4.0% |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.003 | — | 0.003 | 0.003 | +0.0% |
| rAF page: CPU, whole browser (%) | 66.15 | 67.1 | +1.4% | 70.65 | 70.25 | -0.6% |
| rAF page: CPU, Zen parent process (%) | 27.85 | 29.65 | +6.5% ⚠️ | 31.1 | 30.45 | -2.1% |
| presenter draw per frame (ms) | 0.013 | 0.017 | +30.8% ⚠️ | 0.015 | 0.015 | +0.0% |
| presenter uploaded pixel share | 0.285 | 0.285 | +0.0% | 0.286 | 0.287 | +0.3% |
| wheel scroll: fps while input is delivered (XTest-paced) | 59.96 | 59.96 | +0.0% | 59.19 | 59.22 | +0.1% |
| wheel scroll: frame interval p99 while input (ms) | 21.635 | 21.149 | -2.2% | 32.52 | 38.183 | +17.4% ⚠️ |
| wheel scroll: fps, first to last frame of the window | 59.96 | 59.96 | +0.0% | 59.19 | 59.22 | +0.1% |
| wheel scroll: CPU (%) | 133.5 | 133.7 | +0.1% | 151.25 | 152.5 | +0.8% |
| wheel scroll: CPU, Zen parent (%) | 48.7 | 49.4 | +1.4% | 64.5 | 64.2 | -0.5% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.958 | 1.955 | -0.2% | 1.957 | 1.957 | +0.0% |
| key -> presented frame (ms) | 12.863 | 13.186 | +2.5% | 12.909 | 13.053 | +1.1% |
| key -> presented frame p95 (ms) | 15.163 | 16.122 | +6.3% ⚠️ | 14.976 | 16.28 | +8.7% ⚠️ |
| Gecko -> engine switch (ms) | 586.35 | 607.25 | +3.6% | 653.4 | 643.25 | -1.6% |
| static page: navigate -> visible (ms) | 60.35 | 57.85 | -4.1% | 76.4 | 54.25 | -29.0% ✅ |
| RSS, whole browser (MB) | 2869.55 | 2866.85 | -0.1% | 2854.85 | 2868.4 | +0.5% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

