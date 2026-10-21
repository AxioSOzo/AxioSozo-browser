# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 9V45 96-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.975 | 59.98 | +0.0% | 59.8 | 59.945 | +0.2% |
| rAF page: frame interval p99 (ms) | 21.121 | 21.128 | +0.0% | 23.304 | 21.267 | -8.7% ✅ |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.005 | — | 0.005 | 0.0 | -100.0% ✅ |
| rAF page: CPU, whole browser (%) | 25.9 | 34.45 | +33.0% ⚠️ | 33.4 | 34.35 | +2.8% |
| rAF page: CPU, Zen parent process (%) | 12.1 | 16.2 | +33.9% ⚠️ | 15.25 | 15.85 | +3.9% |
| presenter draw per frame (ms) | 0.01 | 0.011 | +10.0% ⚠️ | 0.011 | 0.011 | +0.0% |
| presenter uploaded pixel share | 0.277 | 0.277 | +0.0% | 0.277 | 0.276 | -0.4% |
| wheel scroll: fps while input is delivered (XTest-paced) | 59.975 | 59.72 | -0.4% | 59.965 | 59.57 | -0.7% |
| wheel scroll: frame interval p99 while input (ms) | 21.229 | 22.228 | +4.7% | 21.596 | 27.282 | +26.3% ⚠️ |
| wheel scroll: fps, first to last frame of the window | 59.975 | 59.72 | -0.4% | 59.965 | 59.57 | -0.7% |
| wheel scroll: CPU (%) | 51.9 | 67.0 | +29.1% ⚠️ | 61.55 | 64.8 | +5.3% ⚠️ |
| wheel scroll: CPU, Zen parent (%) | 23.6 | 33.25 | +40.9% ⚠️ | 28.3 | 33.25 | +17.5% ⚠️ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.943 | 1.945 | +0.1% | 1.944 | 1.944 | +0.0% |
| key -> presented frame (ms) | 10.209 | 11.515 | +12.8% ⚠️ | 11.036 | 11.119 | +0.8% |
| key -> presented frame p95 (ms) | 11.321 | 13.878 | +22.6% ⚠️ | 11.764 | 14.194 | +20.7% ⚠️ |
| Gecko -> engine switch (ms) | 422.3 | 436.15 | +3.3% | 380.55 | 382.95 | +0.6% |
| static page: navigate -> visible (ms) | 30.8 | 26.6 | -13.6% ✅ | 43.7 | 36.75 | -15.9% ✅ |
| RSS, whole browser (MB) | 2688.6 | 2666.5 | -0.8% | 2679.7 | 2700.45 | +0.8% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | base r2 | cand r2 | Δcand r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.985 | 60.02 | +0.1% | 60.005 | 59.99 | -0.0% |
| rAF page: frame interval p99 (ms) | 20.822 | 22.912 | +10.0% ⚠️ | 20.99 | 23.706 | +12.9% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.003 | 0.005 | +66.7% ⚠️ | 0.0 | 0.011 | — |
| rAF page: CPU, whole browser (%) | 46.8 | 52.25 | +11.6% ⚠️ | 51.3 | 53.25 | +3.8% |
| rAF page: CPU, Zen parent process (%) | 18.8 | 22.4 | +19.1% ⚠️ | 21.1 | 22.05 | +4.5% |
| presenter draw per frame (ms) | 0.01 | 0.012 | +20.0% ⚠️ | 0.011 | 0.013 | +18.2% ⚠️ |
| presenter uploaded pixel share | 0.288 | 0.284 | -1.4% | 0.288 | 0.286 | -0.7% |
| wheel scroll: fps while input is delivered (XTest-paced) | 59.565 | 60.06 | +0.8% | 60.03 | 59.99 | -0.1% |
| wheel scroll: frame interval p99 while input (ms) | 25.291 | 23.077 | -8.8% ✅ | 24.716 | 21.209 | -14.2% ✅ |
| wheel scroll: fps, first to last frame of the window | 59.565 | 60.06 | +0.8% | 60.03 | 59.99 | -0.1% |
| wheel scroll: CPU (%) | 99.85 | 107.75 | +7.9% ⚠️ | 101.55 | 100.95 | -0.6% |
| wheel scroll: CPU, Zen parent (%) | 39.8 | 41.9 | +5.3% ⚠️ | 38.35 | 37.6 | -2.0% |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.945 | 1.949 | +0.2% | 1.949 | 1.944 | -0.3% |
| key -> presented frame (ms) | 10.729 | 11.262 | +5.0% | 11.181 | 11.253 | +0.6% |
| key -> presented frame p95 (ms) | 11.689 | 12.304 | +5.3% ⚠️ | 12.759 | 13.27 | +4.0% |
| Gecko -> engine switch (ms) | 465.2 | 459.85 | -1.2% | 452.2 | 459.7 | +1.7% |
| static page: navigate -> visible (ms) | 28.6 | 43.7 | +52.8% ⚠️ | 44.9 | 42.4 | -5.6% ✅ |
| RSS, whole browser (MB) | 2888.4 | 2876.7 | -0.4% | 2881.15 | 2880.3 | -0.0% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS

