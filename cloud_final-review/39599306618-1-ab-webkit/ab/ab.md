# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 58.125 | 58.145 | +0.0% | 58.1 | 58.06 | -0.1% |
| rAF page: frame interval p99 (ms) | 23.749 | 21.977 | -7.5% ✅ | 24.644 | 20.795 | -15.6% ✅ |
| rAF page: intervals > 25 ms (share) | 0.006 | 0.0 | -100.0% ✅ | 0.006 | 0.003 | -50.0% ✅ |
| rAF page: CPU, whole browser (%) | 87.55 | 88.1 | +0.6% | 88.55 | 87.95 | -0.7% |
| rAF page: CPU, Zen parent process (%) | 21.6 | 21.25 | -1.6% | 21.9 | 21.4 | -2.3% |
| presenter draw per frame (ms) | 0.015 | 0.016 | +6.7% ⚠️ | 0.016 | 0.015 | -6.2% ✅ |
| wheel scroll: fps while input is delivered (XTest-paced) | 56.19 | 57.11 | +1.6% | 56.15 | 56.245 | +0.2% |
| wheel scroll: frame interval p99 while input (ms) | 35.536 | 31.326 | -11.8% ✅ | 37.037 | 35.751 | -3.5% |
| wheel scroll: fps, first to last frame of the window | 56.19 | 57.11 | +1.6% | 56.15 | 56.245 | +0.2% |
| wheel scroll: CPU (%) | 118.85 | 121.55 | +2.3% | 121.5 | 120.05 | -1.2% |
| wheel scroll: CPU, Zen parent (%) | 46.1 | 48.1 | +4.3% | 48.0 | 48.15 | +0.3% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.97 | 1.962 | -0.4% | 1.968 | 1.963 | -0.3% |
| key -> presented frame (ms) | 16.665 | 16.538 | -0.8% | 16.615 | 17.199 | +3.5% |
| key -> presented frame p95 (ms) | 23.298 | 21.651 | -7.1% ✅ | 22.745 | 22.633 | -0.5% |
| Gecko -> engine switch (ms) | 747.3 | 738.65 | -1.2% | 721.9 | 753.5 | +4.4% |
| static page: navigate -> visible (ms) | 59.35 | 64.05 | +7.9% ⚠️ | 55.75 | 56.8 | +1.9% |
| RSS, whole browser (MB) | 2042.35 | 2163.25 | +5.9% ⚠️ | 2181.75 | 2176.95 | -0.2% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.95 | 57.98 | +0.1% | 57.87 | 57.995 | +0.2% |
| rAF page: frame interval p99 (ms) | 27.125 | 27.426 | +1.1% | 25.461 | 27.193 | +6.8% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.025 | 0.011 | -56.0% ✅ | 0.017 | 0.014 | -17.6% ✅ |
| rAF page: CPU, whole browser (%) | 226.45 | 225.5 | -0.4% | 223.4 | 225.6 | +1.0% |
| rAF page: CPU, Zen parent process (%) | 31.95 | 31.55 | -1.3% | 31.05 | 31.1 | +0.2% |
| presenter draw per frame (ms) | 0.02 | 0.017 | -15.0% ✅ | 0.018 | 0.018 | +0.0% |
| wheel scroll: fps while input is delivered (XTest-paced) | 53.605 | 53.14 | -0.9% | 54.705 | 53.175 | -2.8% |
| wheel scroll: frame interval p99 while input (ms) | 35.554 | 38.623 | +8.6% ⚠️ | 35.779 | 41.037 | +14.7% ⚠️ |
| wheel scroll: fps, first to last frame of the window | 53.605 | 53.14 | -0.9% | 54.705 | 53.175 | -2.8% |
| wheel scroll: CPU (%) | 256.6 | 255.55 | -0.4% | 255.8 | 252.55 | -1.3% |
| wheel scroll: CPU, Zen parent (%) | 58.75 | 57.85 | -1.5% | 59.0 | 56.95 | -3.5% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.992 | 1.989 | -0.2% | 1.982 | 1.986 | +0.2% |
| key -> presented frame (ms) | 25.395 | 24.553 | -3.3% | 25.495 | 25.506 | +0.0% |
| key -> presented frame p95 (ms) | 32.578 | 29.605 | -9.1% ✅ | 31.42 | 30.492 | -3.0% |
| Gecko -> engine switch (ms) | 765.15 | 731.8 | -4.4% | 803.75 | 731.35 | -9.0% ✅ |
| static page: navigate -> visible (ms) | 73.2 | 63.85 | -12.8% ✅ | 78.4 | 68.45 | -12.7% ✅ |
| RSS, whole browser (MB) | 2228.8 | 2354.9 | +5.7% ⚠️ | 2351.85 | 2352.7 | +0.0% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

