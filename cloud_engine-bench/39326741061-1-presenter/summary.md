# Engine bench summary — run 39326741061

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.30 [5.02] | 1.92 [4.88] |
| presenter_bgraToRGBA | 3.57 [9.97] | 14.18 [30.52] |
| candidate_u32_fast_path | 1.48 [2.90] | 5.97 [6.25] |
| putImageData_full | 0.10 [0.12] | 0.34 [0.41] |
| presenter_draw_full | 3.66 [4.03] | 14.85 [17.14] |
| candidate_damage10_fast_put | 0.23 [3.54] | 0.86 [1.31] |
| candidate_createImageBitmap | 3.72 [4.21] | 12.32 [15.93] |
| candidate_webgl_full | 3.16 [6.15] | 12.48 [16.36] |
| candidate_webgl_damage10 | 2.90 [3.92] | 14.71 [17.70] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.98 [1.68] | 1.78 [3.28] |
| presenter_bgraToRGBA | 2.18 [4.70] | 8.44 [14.88] |
| candidate_u32_fast_path | 1.56 [1.82] | 3.92 [6.16] |
| putImageData_full | 0.16 [0.20] | 0.42 [0.46] |
| presenter_draw_full | 4.54 [7.08] | 7.98 [8.44] |
| candidate_damage10_fast_put | 0.40 [0.92] | 0.94 [1.10] |
| candidate_createImageBitmap | 4.12 [5.42] | 10.48 [12.58] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.25 [1.40] | 0.22 [1.00] | 0.93 [1.37] | 1.06 [1.83] |
| presenter_bgraToRGBA | 1.95 [2.16] | 3.07 [3.35] | 11.50 [11.74] | 12.25 [12.38] |
| candidate_u32_opaque_fast_path | 1.28 [1.29] | 1.27 [1.34] | 3.67 [3.75] | 5.20 [5.33] |
