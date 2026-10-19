# Pixel-path A/B in one job: webkit tabs in Zen

CPU: AMD EPYC 9V45 96-Core Processor. base = cloud/integration chrome JS + host, cand = this branch; rounds alternate base/cand. Medians over repetitions; Δ = cand/base − 1.

## 1×

| Metric | base r1 | cand r1 | Δ r1 | base r2 | cand r2 | Δ r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | — | 57.83 | — | — | 57.76 | — |
| rAF page: frame interval p99 (ms) | — | 22.524 | — | — | 25.726 | — |
| rAF page: intervals > 25 ms (share) | — | 0.006 | — | — | 0.011 | — |
| rAF page: CPU, whole browser (%) | — | 94.6 | — | — | 103.3 | — |
| presenter draw per frame (ms) | — | 0.583 | — | — | 0.613 | — |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | — | 13.26 | — | — | 12.98 | — |
| wheel scroll: CPU (%) | — | 28.9 | — | — | 31.4 | — |
| key -> presented frame (ms) | — | 24.58 | — | — | 23.48 | — |
| Gecko -> engine switch (ms) | — | 430.7 | — | — | 431.2 | — |
| static page: navigate -> visible (ms) | — | 61.2 | — | — | 55.7 | — |
| RSS, whole browser (MB) | — | 2150.5 | — | — | 2226.6 | — |

Status: cand-r1 PASS, cand-r2 PASS

## 2×

| Metric | base r1 | cand r1 | Δ r1 | base r2 | cand r2 | Δ r2 |
| --- | --- | --- | --- | --- | --- | --- |
| rAF page: presented fps | — | 56.65 | — | — | 56.66 | — |
| rAF page: frame interval p99 (ms) | — | 33.96 | — | — | 33.354 | — |
| rAF page: intervals > 25 ms (share) | — | 0.052 | — | — | 0.058 | — |
| rAF page: CPU, whole browser (%) | — | 259.8 | — | — | 269.3 | — |
| presenter draw per frame (ms) | — | 2.445 | — | — | 2.511 | — |
| wheel scroll: fps (rep 1 windows valid, see PERFORMANCE.md) | — | 10.06 | — | — | 10.01 | — |
| wheel scroll: CPU (%) | — | 70.7 | — | — | 73.6 | — |
| key -> presented frame (ms) | — | 29.534 | — | — | 28.323 | — |
| Gecko -> engine switch (ms) | — | 418.0 | — | — | 459.4 | — |
| static page: navigate -> visible (ms) | — | 64.2 | — | — | 83.8 | — |
| RSS, whole browser (MB) | — | 2425.0 | — | — | 2377.9 | — |

Status: cand-r1 PASS, cand-r2 PASS

