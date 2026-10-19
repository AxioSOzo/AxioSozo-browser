# Engine bench summary — run 39342063334

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.97 [1.28] | 2.33 [3.63] |
| presenter_bgraToRGBA | 2.15 [2.37] | 3.71 [4.12] |
| candidate_u32_fast_path | 2.75 [30.78] | 3.14 [3.35] |
| baseline_bgraToRGBA | 1.75 [1.96] | 6.67 [6.94] |
| putImageData_full | 0.09 [0.12] | 0.38 [0.48] |
| presenter_draw_full | 1.04 [1.16] | 4.31 [4.72] |
| baseline_draw_full | 1.89 [2.07] | 7.33 [7.65] |
| surface_draw_full | 1.40 [1.99] | 4.43 [4.84] |
| surface_draw_damage10 | 0.17 [0.25] | 0.47 [0.81] |
| candidate_damage10_fast_put | 0.23 [0.43] | 0.80 [1.36] |
| candidate_createImageBitmap | 3.38 [5.14] | 9.54 [9.80] |
| candidate_webgl_full | 3.44 [6.55] | 12.46 [16.34] |
| candidate_webgl_damage10 | 4.22 [6.55] | 11.24 [12.73] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.88 [1.44] | 1.92 [3.14] |
| presenter_bgraToRGBA | 1.54 [2.60] | 5.60 [9.14] |
| candidate_u32_fast_path | 0.98 [1.24] | 4.32 [7.64] |
| baseline_bgraToRGBA | 2.04 [5.16] | 10.74 [16.90] |
| putImageData_full | 0.14 [0.18] | 0.58 [0.64] |
| presenter_draw_full | 1.50 [2.52] | 7.04 [9.22] |
| baseline_draw_full | 2.52 [5.42] | 12.42 [18.84] |
| surface_draw_full | 1.54 [2.36] | 7.48 [10.16] |
| surface_draw_damage10 | 0.18 [0.30] | 0.90 [1.12] |
| candidate_damage10_fast_put | 0.24 [0.32] | 1.20 [1.42] |
| candidate_createImageBitmap | 3.20 [5.20] | 12.26 [16.22] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.92 [2.96] | 0.22 [0.96] | 0.94 [1.96] | 1.09 [1.30] |
| presenter_bgraToRGBA | 1.65 [1.75] | 1.94 [2.10] | 6.04 [6.18] | 7.85 [8.08] |
| candidate_u32_opaque_fast_path | 1.29 [1.31] | 1.27 [1.32] | 3.66 [3.74] | 5.19 [5.25] |
| baseline_bgraToRGBA | 1.94 [1.97] | 3.04 [3.08] | 11.50 [11.68] | 12.21 [12.35] |
