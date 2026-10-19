# Engine bench summary — run 39340129366

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.53 [6.04] | 3.33 [7.57] |
| presenter_bgraToRGBA | 1.75 [3.85] | 6.57 [6.93] |
| candidate_u32_fast_path | 1.47 [3.35] | 5.78 [5.93] |
| baseline_bgraToRGBA | 3.50 [5.58] | 13.81 [14.09] |
| putImageData_full | 0.18 [0.22] | 0.70 [0.77] |
| presenter_draw_full | 1.85 [2.08] | 7.62 [9.04] |
| baseline_draw_full | 3.66 [3.98] | 15.07 [16.68] |
| surface_draw_full | 1.87 [2.12] | 7.65 [8.07] |
| surface_draw_damage10 | 0.23 [0.35] | 0.83 [0.96] |
| candidate_damage10_fast_put | 0.29 [0.42] | 1.10 [1.33] |
| candidate_createImageBitmap | 3.42 [6.82] | 11.56 [15.41] |
| candidate_webgl_full | 3.16 [5.02] | 12.27 [15.20] |
| candidate_webgl_damage10 | 2.81 [3.79] | 13.41 [16.41] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.06 [1.44] | 2.86 [4.28] |
| presenter_bgraToRGBA | 1.60 [2.60] | 6.12 [10.36] |
| candidate_u32_fast_path | 1.10 [1.54] | 4.24 [4.80] |
| baseline_bgraToRGBA | 2.20 [3.40] | 7.62 [8.56] |
| putImageData_full | 0.20 [0.24] | 0.68 [0.70] |
| presenter_draw_full | 1.80 [2.58] | 6.86 [7.12] |
| baseline_draw_full | 2.18 [3.26] | 8.62 [8.78] |
| surface_draw_full | 1.74 [3.18] | 6.84 [8.40] |
| surface_draw_damage10 | 0.28 [0.40] | 0.72 [0.82] |
| candidate_damage10_fast_put | 0.28 [0.40] | 0.96 [1.02] |
| candidate_createImageBitmap | 3.56 [5.92] | 11.88 [18.08] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.35 [1.18] | 0.26 [1.04] | 1.12 [2.73] | 1.22 [1.67] |
| presenter_bgraToRGBA | 1.95 [2.04] | 1.63 [1.95] | 4.77 [4.83] | 6.71 [7.26] |
| candidate_u32_opaque_fast_path | 1.44 [1.49] | 1.13 [1.33] | 3.07 [3.14] | 4.63 [4.72] |
| baseline_bgraToRGBA | 1.86 [2.21] | 3.06 [3.17] | 11.57 [11.71] | 12.45 [13.05] |
