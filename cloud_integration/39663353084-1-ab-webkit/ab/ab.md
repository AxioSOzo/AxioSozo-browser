# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.85 | 58.0 | +0.3% | 57.905 | 57.86 | -0.1% |
| rAF page: frame interval p99 (ms) | 23.023 | 23.195 | +0.7% | 22.732 | 24.495 | +7.8% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.006 | 0.003 | -50.0% ✅ | 0.003 | 0.009 | +200.0% ⚠️ |
| rAF page: CPU, whole browser (%) | 95.8 | 95.55 | -0.3% | 97.45 | 97.7 | +0.3% |
| rAF page: CPU, Zen parent process (%) | 23.9 | 23.85 | -0.2% | 25.5 | 25.0 | -2.0% |
| presenter draw per frame (ms) | 0.016 | 0.016 | +0.0% | 0.016 | 0.016 | +0.0% |
| wheel scroll: fps while input is delivered (XTest-paced) | 55.7 | 56.165 | +0.8% | 56.25 | 54.735 | -2.7% |
| wheel scroll: frame interval p99 while input (ms) | 35.325 | 36.882 | +4.4% | 36.219 | 37.963 | +4.8% |
| wheel scroll: fps, first to last frame of the window | 55.7 | 56.165 | +0.8% | 56.25 | 54.735 | -2.7% |
| wheel scroll: CPU (%) | 126.85 | 126.4 | -0.4% | 125.8 | 125.95 | +0.1% |
| wheel scroll: CPU, Zen parent (%) | 50.95 | 51.4 | +0.9% | 50.55 | 50.65 | +0.2% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.97 | 1.964 | -0.3% | 1.968 | 1.963 | -0.3% |
| key -> presented frame (ms) | 17.346 | 17.137 | -1.2% | 18.309 | 18.535 | +1.2% |
| key -> presented frame p95 (ms) | 24.427 | 23.649 | -3.2% | 22.94 | 23.8 | +3.7% |
| Gecko -> engine switch (ms) | 724.1 | 733.9 | +1.4% | 725.05 | 748.5 | +3.2% |
| static page: navigate -> visible (ms) | 49.15 | 58.1 | +18.2% ⚠️ | 56.45 | 57.05 | +1.1% |
| RSS, whole browser (MB) | 2173.25 | 2180.05 | +0.3% | 2183.7 | 2171.0 | -0.6% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.925 | 57.68 | -0.4% | 57.97 | 57.84 | -0.2% |
| rAF page: frame interval p99 (ms) | 25.8 | 29.595 | +14.7% ⚠️ | 28.192 | 27.555 | -2.3% |
| rAF page: intervals > 25 ms (share) | 0.017 | 0.025 | +47.1% ⚠️ | 0.023 | 0.017 | -26.1% ✅ |
| rAF page: CPU, whole browser (%) | 235.2 | 233.0 | -0.9% | 235.35 | 236.4 | +0.4% |
| rAF page: CPU, Zen parent process (%) | 33.65 | 32.95 | -2.1% | 34.6 | 34.6 | +0.0% |
| presenter draw per frame (ms) | 0.021 | 0.025 | +19.0% ⚠️ | 0.019 | 0.03 | +57.9% ⚠️ |
| wheel scroll: fps while input is delivered (XTest-paced) | 53.01 | 53.81 | +1.5% | 53.645 | 54.775 | +2.1% |
| wheel scroll: frame interval p99 while input (ms) | 44.215 | 42.847 | -3.1% | 43.094 | 41.675 | -3.3% |
| wheel scroll: fps, first to last frame of the window | 53.01 | 53.81 | +1.5% | 53.645 | 54.775 | +2.1% |
| wheel scroll: CPU (%) | 262.4 | 260.85 | -0.6% | 269.3 | 266.15 | -1.2% |
| wheel scroll: CPU, Zen parent (%) | 60.75 | 59.7 | -1.7% | 64.7 | 62.65 | -3.2% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.987 | 1.994 | +0.4% | 1.988 | 1.996 | +0.4% |
| key -> presented frame (ms) | 24.976 | 26.401 | +5.7% ⚠️ | 25.994 | 25.84 | -0.6% |
| key -> presented frame p95 (ms) | 30.099 | 33.602 | +11.6% ⚠️ | 31.995 | 32.41 | +1.3% |
| Gecko -> engine switch (ms) | 815.15 | 857.0 | +5.1% ⚠️ | 773.3 | 834.85 | +8.0% ⚠️ |
| static page: navigate -> visible (ms) | 69.2 | 66.75 | -3.5% | 73.65 | 76.35 | +3.7% |
| RSS, whole browser (MB) | 2359.05 | 2382.95 | +1.0% | 2383.9 | 2247.35 | -5.7% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

