# Pixel-path A/B in one job: chromium tabs in Zen

CPU: AMD EPYC 7763 64-Core Processor. base = cloud/integration chrome JS + host, cand = this branch (its defaults); other variants = this branch with TEST-ONLY prefs (pipe/memfd: axiosozo.engines.linux.memfd_frames off/on; worker/native: see docs/perf/pixel-path.md); rounds alternate. Medians over repetitions; Δ = variant/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δcand r1 | native r1 | Δnative r1 | base r2 | cand r2 | Δcand r2 | native r2 | Δnative r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 59.0 | 60.015 | +1.7% | 60.0 | +1.7% | 59.0 | 59.985 | +1.7% | 60.09 | +1.8% |
| rAF page: frame interval p99 (ms) | 21.169 | 23.775 | +12.3% ⚠️ | 21.089 | -0.4% | 19.732 | 21.157 | +7.2% ⚠️ | 20.859 | +5.7% ⚠️ |
| rAF page: intervals > 25 ms (share) | 0.0 | 0.008 | — | 0.005 | — | 0.0 | 0.005 | — | 0.003 | — |
| rAF page: CPU, whole browser (%) | 82.85 | 66.5 | -19.7% ✅ | 57.3 | -30.8% ✅ | 76.55 | 65.8 | -14.0% ✅ | 58.0 | -24.2% ✅ |
| rAF page: CPU, Zen parent process (%) | 55.5 | 39.6 | -28.6% ✅ | 31.6 | -43.1% ✅ | 51.55 | 38.65 | -25.0% ✅ | 31.75 | -38.4% ✅ |
| presenter draw per frame (ms) | 1.255 | 1.063 | -15.3% ✅ | 0.016 | -98.7% ✅ | 1.204 | 1.058 | -12.1% ✅ | 0.014 | -98.8% ✅ |
| presenter uploaded pixel share | 0.274 | 0.268 | -2.2% | 0.27 | -1.5% | 0.278 | 0.268 | -3.6% | 0.268 | -3.6% |
| wheel scroll: fps while input is delivered (XTest-paced) | 53.5 | 59.84 | +11.9% ✅ | 59.7 | +11.6% ✅ | 54.015 | 60.01 | +11.1% ✅ | 59.975 | +11.0% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 35.011 | 22.854 | -34.7% ✅ | 24.07 | -31.3% ✅ | 35.244 | 21.489 | -39.0% ✅ | 21.684 | -38.5% ✅ |
| wheel scroll: fps, first to last frame of the window | 53.5 | 59.84 | +11.9% ✅ | 59.7 | +11.6% ✅ | 53.96 | 60.01 | +11.2% ✅ | 59.975 | +11.1% ✅ |
| wheel scroll: CPU (%) | 148.95 | 107.95 | -27.5% ✅ | 98.55 | -33.8% ✅ | 143.75 | 100.05 | -30.4% ✅ | 87.15 | -39.4% ✅ |
| wheel scroll: CPU, Zen parent (%) | 104.8 | 66.3 | -36.7% ✅ | 56.65 | -45.9% ✅ | 102.1 | 59.3 | -41.9% ✅ | 46.4 | -54.6% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.959 | 1.956 | -0.2% | 1.954 | -0.3% | 1.961 | 1.954 | -0.4% | 1.955 | -0.3% |
| key -> presented frame (ms) | 20.886 | 12.445 | -40.4% ✅ | 11.928 | -42.9% ✅ | 20.043 | 12.03 | -40.0% ✅ | 11.731 | -41.5% ✅ |
| key -> presented frame p95 (ms) | 26.203 | 14.037 | -46.4% ✅ | 13.904 | -46.9% ✅ | 25.54 | 13.704 | -46.3% ✅ | 13.071 | -48.8% ✅ |
| Gecko -> engine switch (ms) | 583.9 | 575.0 | -1.5% | 526.1 | -9.9% ✅ | 541.25 | 493.55 | -8.8% ✅ | 508.1 | -6.1% ✅ |
| static page: navigate -> visible (ms) | 81.85 | 60.35 | -26.3% ✅ | 50.75 | -38.0% ✅ | 113.7 | 128.5 | +13.0% ⚠️ | 46.25 | -59.3% ✅ |
| RSS, whole browser (MB) | 2753.85 | 2691.15 | -2.3% | 2656.55 | -3.5% | 2749.75 | 2674.65 | -2.7% | 2676.95 | -2.6% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, native-r1 PASS, native-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δcand r1 | native r1 | Δnative r1 | base r2 | cand r2 | Δcand r2 | native r2 | Δnative r2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | 57.64 | 60.04 | +4.2% | 60.02 | +4.1% | 58.0 | 60.01 | +3.5% | 60.005 | +3.5% |
| rAF page: frame interval p99 (ms) | 31.372 | 23.381 | -25.5% ✅ | 22.166 | -29.3% ✅ | 28.817 | 23.179 | -19.6% ✅ | 23.515 | -18.4% ✅ |
| rAF page: intervals > 25 ms (share) | 0.025 | 0.003 | -88.0% ✅ | 0.005 | -80.0% ✅ | 0.022 | 0.005 | -77.3% ✅ | 0.005 | -77.3% ✅ |
| rAF page: CPU, whole browser (%) | 166.2 | 115.55 | -30.5% ✅ | 106.15 | -36.1% ✅ | 172.1 | 115.25 | -33.0% ✅ | 101.8 | -40.8% ✅ |
| rAF page: CPU, Zen parent process (%) | 121.85 | 73.6 | -39.6% ✅ | 62.75 | -48.5% ✅ | 126.3 | 73.25 | -42.0% ✅ | 59.3 | -53.0% ✅ |
| presenter draw per frame (ms) | 3.627 | 2.281 | -37.1% ✅ | 0.02 | -99.4% ✅ | 3.683 | 2.205 | -40.1% ✅ | 0.02 | -99.5% ✅ |
| presenter uploaded pixel share | 0.289 | 0.279 | -3.5% | 0.277 | -4.2% | 0.288 | 0.277 | -3.8% | 0.273 | -5.2% ✅ |
| wheel scroll: fps while input is delivered (XTest-paced) | 28.495 | 58.82 | +106.4% ✅ | 59.935 | +110.3% ✅ | 29.23 | 59.985 | +105.2% ✅ | 59.5 | +103.6% ✅ |
| wheel scroll: frame interval p99 while input (ms) | 76.418 | 30.916 | -59.5% ✅ | 22.364 | -70.7% ✅ | 79.676 | 23.486 | -70.5% ✅ | 29.978 | -62.4% ✅ |
| wheel scroll: fps, first to last frame of the window | 28.495 | 58.82 | +106.4% ✅ | 59.935 | +110.3% ✅ | 29.23 | 59.985 | +105.2% ✅ | 59.5 | +103.6% ✅ |
| wheel scroll: CPU (%) | 241.05 | 219.9 | -8.8% ✅ | 178.3 | -26.0% ✅ | 239.6 | 206.85 | -13.7% ✅ | 179.7 | -25.0% ✅ |
| wheel scroll: CPU, Zen parent (%) | 142.15 | 118.55 | -16.6% ✅ | 81.95 | -42.3% ✅ | 138.65 | 108.05 | -22.1% ✅ | 85.1 | -38.6% ✅ |
| wheel scroll: input span (s, 120 events @16 ms = 1.9) | 1.979 | 1.974 | -0.3% | 1.969 | -0.5% | 1.986 | 1.978 | -0.4% | 1.969 | -0.9% |
| key -> presented frame (ms) | 19.867 | 12.291 | -38.1% ✅ | 12.409 | -37.5% ✅ | 21.452 | 12.726 | -40.7% ✅ | 12.101 | -43.6% ✅ |
| key -> presented frame p95 (ms) | 27.893 | 18.087 | -35.2% ✅ | 14.724 | -47.2% ✅ | 29.167 | 13.799 | -52.7% ✅ | 14.07 | -51.8% ✅ |
| Gecko -> engine switch (ms) | 594.45 | 608.8 | +2.4% | 593.8 | -0.1% | 585.25 | 611.75 | +4.5% | 600.95 | +2.7% |
| static page: navigate -> visible (ms) | 122.05 | 62.7 | -48.6% ✅ | 72.15 | -40.9% ✅ | 127.15 | 65.45 | -48.5% ✅ | 76.35 | -40.0% ✅ |
| RSS, whole browser (MB) | 2928.15 | 2790.1 | -4.7% | 2896.0 | -1.1% | 2911.95 | 2780.4 | -4.5% | 2884.55 | -0.9% |

Status: base-r1 PASS, base-r2 PASS, cand-r1 PASS, cand-r2 PASS, native-r1 PASS, native-r2 PASS

