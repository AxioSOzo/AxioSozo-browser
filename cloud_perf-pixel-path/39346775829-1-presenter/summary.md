# Engine bench summary — run 39346775829

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.77 [1.43] | 3.16 [3.91] |
| presenter_bgraToRGBA | 0.91 [1.27] | 3.23 [3.44] |
| candidate_u32_fast_path | 0.86 [2.07] | 3.50 [6.03] |
| baseline_bgraToRGBA | 1.85 [3.09] | 7.34 [7.58] |
| putImageData_full | 0.04 [0.06] | 0.17 [0.22] |
| presenter_draw_full | 0.91 [1.07] | 3.58 [9.70] |
| baseline_draw_full | 1.88 [2.29] | 7.98 [15.09] |
| surface_draw_full | 1.17 [1.34] | 5.10 [6.72] |
| surface_draw_damage10 | 0.12 [0.20] | 0.51 [0.71] |
| candidate_damage10_fast_put | 0.17 [0.21] | 0.54 [0.90] |
| candidate_createImageBitmap | 2.35 [2.82] | 9.48 [10.05] |
| candidate_webgl_full | 2.05 [5.00] | 7.61 [18.48] |
| candidate_webgl_damage10 | 2.79 [8.79] | 7.21 [12.69] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.76 [1.28] | 3.26 [6.00] |
| presenter_bgraToRGBA | 0.90 [1.20] | 3.52 [4.92] |
| candidate_u32_fast_path | 0.76 [1.18] | 2.90 [3.86] |
| baseline_bgraToRGBA | 1.84 [2.08] | 4.08 [7.72] |
| putImageData_full | 0.08 [0.12] | 0.30 [0.32] |
| presenter_draw_full | 1.02 [1.26] | 3.86 [4.56] |
| baseline_draw_full | 1.28 [2.34] | 4.34 [4.66] |
| surface_draw_full | 1.04 [1.48] | 3.92 [4.52] |
| surface_draw_damage10 | 0.12 [0.18] | 0.40 [0.46] |
| candidate_damage10_fast_put | 0.24 [0.30] | 0.66 [0.74] |
| candidate_createImageBitmap | 3.96 [5.44] | 14.66 [17.78] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.08 [0.88] | 0.09 [0.90] | 0.55 [3.18] | 0.52 [3.10] |
| presenter_bgraToRGBA | 0.85 [0.86] | 0.81 [0.82] | 2.29 [3.08] | 3.30 [4.58] |
| candidate_u32_opaque_fast_path | 0.83 [0.84] | 0.75 [0.78] | 2.07 [3.74] | 3.06 [3.08] |
| baseline_bgraToRGBA | 1.13 [1.68] | 1.58 [1.63] | 5.97 [6.63] | 6.35 [6.79] |
