# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.835 | 58.04 | +0.4% | 57.75 | 57.855 | +0.2% |
| rAF page: frame interval p99 (ms) | 22.819 | 21.127 | -7.4% ✅ | 24.827 | 22.12 | -10.9% ✅ |
| rAF page: intervals > 25 ms (share) | 0.006 | 0.0 | -100.0% ✅ | 0.009 | 0.003 | -66.7% ✅ |
| rAF page: CPU, whole browser (%) | 98.65 | 99.85 | +1.2% | 97.35 | 96.6 | -0.8% |
| rAF page: CPU, Zen parent process (%) | 25.6 | 25.55 | -0.2% | 25.1 | 24.75 | -1.4% |
| presenter draw per frame (ms) | 0.017 | 0.017 | +0.0% | 0.016 | 0.016 | +0.0% |
| wheel scroll: fps while input is delivered (XTest-paced) | 57.35 | 57.16 | -0.3% | 57.24 | 57.05 | -0.3% |
| wheel scroll: frame interval p99 while input (ms) | 31.404 | 32.713 | +4.2% | 33.553 | 34.587 | +3.1% |
| wheel scroll: fps, first to last frame of the window | 57.35 | 57.16 | -0.3% | 57.24 | 57.05 | -0.3% |
| wheel scroll: CPU (%) | 127.5 | 128.35 | +0.7% | 126.65 | 126.75 | +0.1% |
| wheel scroll: CPU, Zen parent (%) | 49.95 | 50.5 | +1.1% | 49.6 | 49.2 | -0.8% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.967 | 1.966 | -0.1% | 1.965 | 1.972 | +0.4% |
| key -> presented frame (ms) | 19.471 | 18.125 | -6.9% ✅ | 17.671 | 17.054 | -3.5% |
| key -> presented frame p95 (ms) | 25.407 | 24.162 | -4.9% | 23.591 | 23.349 | -1.0% |
| Gecko -> engine switch (ms) | 753.85 | 754.8 | +0.1% | 724.95 | 709.85 | -2.1% |
| static page: navigate -> visible (ms) | 54.7 | 53.0 | -3.1% | 54.4 | 63.5 | +16.7% ⚠️ |
| RSS, whole browser (MB) | 2222.55 | 2236.0 | +0.6% | 2196.45 | 2082.0 | -5.2% ✅ |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.865 | 57.935 | +0.1% | 57.805 | 57.765 | -0.1% |
| rAF page: frame interval p99 (ms) | 25.715 | 25.638 | -0.3% | 26.07 | 27.072 | +3.8% |
| rAF page: intervals > 25 ms (share) | 0.011 | 0.017 | +54.5% ⚠️ | 0.023 | 0.017 | -26.1% ✅ |
| rAF page: CPU, whole browser (%) | 238.5 | 239.3 | +0.3% | 240.4 | 233.85 | -2.7% |
| rAF page: CPU, Zen parent process (%) | 36.15 | 36.1 | -0.1% | 35.45 | 34.55 | -2.5% |
| presenter draw per frame (ms) | 0.028 | 0.023 | -17.9% ✅ | 0.019 | 0.02 | +5.3% ⚠️ |
| wheel scroll: fps while input is delivered (XTest-paced) | 55.29 | 54.535 | -1.4% | 54.28 | 55.455 | +2.2% |
| wheel scroll: frame interval p99 while input (ms) | 34.533 | 33.965 | -1.6% | 35.122 | 34.524 | -1.7% |
| wheel scroll: fps, first to last frame of the window | 55.29 | 54.535 | -1.4% | 54.28 | 55.455 | +2.2% |
| wheel scroll: CPU (%) | 270.85 | 271.75 | +0.3% | 272.55 | 269.35 | -1.2% |
| wheel scroll: CPU, Zen parent (%) | 63.15 | 65.7 | +4.0% | 65.95 | 64.55 | -2.1% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.98 | 1.982 | +0.1% | 1.983 | 1.997 | +0.7% |
| key -> presented frame (ms) | 25.653 | 25.709 | +0.2% | 26.639 | 26.144 | -1.9% |
| key -> presented frame p95 (ms) | 32.862 | 31.672 | -3.6% | 32.87 | 31.776 | -3.3% |
| Gecko -> engine switch (ms) | 824.15 | 777.3 | -5.7% ✅ | 760.6 | 772.85 | +1.6% |
| static page: navigate -> visible (ms) | 72.55 | 53.1 | -26.8% ✅ | 54.05 | 69.1 | +27.8% ⚠️ |
| RSS, whole browser (MB) | 2272.3 | 2433.35 | +7.1% ⚠️ | 2390.6 | 2279.6 | -4.6% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

