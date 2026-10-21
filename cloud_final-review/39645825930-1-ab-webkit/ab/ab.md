# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.965 | 57.79 | -0.3% | 57.825 | 57.82 | -0.0% |
| rAF page: frame interval p99 (ms) | 20.858 | 23.08 | +10.7% ⚠️ | 21.993 | 24.541 | +11.6% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.003 | 0.006 | +100.0% ⚠️ | 0.0 | 0.009 | — |
| rAF page: CPU, whole browser (%) | 93.65 | 95.8 | +2.3% | 95.35 | 95.5 | +0.2% |
| rAF page: CPU, Zen parent process (%) | 23.0 | 24.4 | +6.1% ⚠️ | 23.95 | 24.6 | +2.7% |
| presenter draw per frame (ms) | 0.015 | 0.016 | +6.7% ⚠️ | 0.016 | 0.016 | +0.0% |
| wheel scroll: fps while input is delivered (XTest-paced) | 56.02 | 57.39 | +2.4% | 56.475 | 56.545 | +0.1% |
| wheel scroll: frame interval p99 while input (ms) | 33.918 | 32.442 | -4.4% | 34.424 | 33.637 | -2.3% |
| wheel scroll: fps, first to last frame of the window | 56.02 | 57.39 | +2.4% | 56.475 | 56.545 | +0.1% |
| wheel scroll: CPU (%) | 122.15 | 122.85 | +0.6% | 124.55 | 121.0 | -2.9% |
| wheel scroll: CPU, Zen parent (%) | 47.15 | 47.25 | +0.2% | 48.75 | 46.65 | -4.3% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.964 | 1.97 | +0.3% | 1.965 | 1.962 | -0.2% |
| key -> presented frame (ms) | 16.844 | 17.801 | +5.7% ⚠️ | 16.952 | 16.527 | -2.5% |
| key -> presented frame p95 (ms) | 22.666 | 22.974 | +1.4% | 22.404 | 22.838 | +1.9% |
| Gecko -> engine switch (ms) | 725.9 | 721.25 | -0.6% | 740.4 | 744.2 | +0.5% |
| static page: navigate -> visible (ms) | 52.8 | 62.55 | +18.5% ⚠️ | 57.6 | 59.6 | +3.5% |
| RSS, whole browser (MB) | 2224.45 | 2217.6 | -0.3% | 2205.85 | 2196.6 | -0.4% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.88 | 57.765 | -0.2% | 57.855 | 57.81 | -0.1% |
| rAF page: frame interval p99 (ms) | 27.326 | 26.584 | -2.7% | 25.718 | 28.368 | +10.3% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.023 | 0.02 | -13.0% ✅ | 0.017 | 0.014 | -17.6% ✅ |
| rAF page: CPU, whole browser (%) | 231.1 | 235.2 | +1.8% | 231.55 | 230.65 | -0.4% |
| rAF page: CPU, Zen parent process (%) | 33.05 | 35.3 | +6.8% ⚠️ | 33.6 | 32.85 | -2.2% |
| presenter draw per frame (ms) | 0.018 | 0.022 | +22.2% ⚠️ | 0.018 | 0.023 | +27.8% ⚠️ |
| wheel scroll: fps while input is delivered (XTest-paced) | 54.905 | 53.3 | -2.9% | 55.02 | 54.845 | -0.3% |
| wheel scroll: frame interval p99 while input (ms) | 35.075 | 38.61 | +10.1% ⚠️ | 34.906 | 36.004 | +3.1% |
| wheel scroll: fps, first to last frame of the window | 54.905 | 53.3 | -2.9% | 55.02 | 54.845 | -0.3% |
| wheel scroll: CPU (%) | 262.6 | 266.5 | +1.5% | 256.55 | 263.7 | +2.8% |
| wheel scroll: CPU, Zen parent (%) | 60.5 | 63.0 | +4.1% | 56.85 | 61.05 | +7.4% ⚠️ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.981 | 1.994 | +0.7% | 1.998 | 1.996 | -0.1% |
| key -> presented frame (ms) | 26.721 | 25.808 | -3.4% | 25.361 | 25.276 | -0.3% |
| key -> presented frame p95 (ms) | 33.567 | 33.215 | -1.0% | 31.049 | 30.771 | -0.9% |
| Gecko -> engine switch (ms) | 807.3 | 780.5 | -3.3% | 748.85 | 763.55 | +2.0% |
| static page: navigate -> visible (ms) | 75.05 | 61.25 | -18.4% ✅ | 61.2 | 64.35 | +5.1% ⚠️ |
| RSS, whole browser (MB) | 2389.55 | 2398.45 | +0.4% | 2406.85 | 2403.8 | -0.1% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

