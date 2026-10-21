# Engine bench summary — run 39663352941

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.24 [6.00] | 2.06 [6.58] |
| presenter_bgraToRGBA | 1.64 [1.99] | 5.90 [6.03] |
| candidate_u32_fast_path | 1.61 [3.27] | 6.46 [6.71] |
| baseline_bgraToRGBA | 1.61 [1.71] | 5.90 [6.12] |
| putImageData_full | 0.07 [0.12] | 0.34 [0.43] |
| presenter_draw_full | 1.75 [2.10] | 6.60 [8.90] |
| baseline_draw_full | 1.76 [2.12] | 6.61 [9.90] |
| surface_draw_full | 1.89 [2.21] | 7.52 [7.82] |
| surface_draw_damage10 | 0.20 [0.38] | 0.78 [0.94] |
| candidate_videoframe_full | 1.54 [1.84] | 5.00 [7.14] |
| candidate_videoframe_damage10 | 0.30 [0.66] | 0.99 [3.08] |
| surface_upload_draw_full | 1.60 [5.39] | 5.84 [9.37] |
| surface_upload_draw_damage10 | 0.32 [1.12] | 1.31 [4.03] |
| candidate_damage10_fast_put | 0.31 [0.43] | 1.42 [2.73] |
| candidate_createImageBitmap | 4.18 [5.97] | 13.00 [15.08] |
| candidate_webgl_full | 4.72 [9.95] | 13.45 [18.27] |
| candidate_webgl_damage10 | 3.35 [4.59] | 12.07 [13.72] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.88 [1.14] | 1.88 [3.50] |
| presenter_bgraToRGBA | 1.56 [2.46] | 5.90 [7.46] |
| candidate_u32_fast_path | 1.08 [1.82] | 4.28 [5.18] |
| baseline_bgraToRGBA | 1.52 [2.60] | 5.84 [6.70] |
| putImageData_full | 0.12 [0.14] | 0.46 [0.50] |
| presenter_draw_full | 1.62 [2.70] | 6.40 [7.04] |
| baseline_draw_full | 1.74 [2.90] | 6.42 [6.60] |
| surface_draw_full | 1.82 [2.78] | 6.52 [7.06] |
| surface_draw_damage10 | 0.18 [0.26] | 0.68 [0.90] |
| candidate_videoframe_full | 1.20 [1.78] | 2.50 [3.24] |
| candidate_videoframe_damage10 | 0.04 [0.10] | 0.16 [0.28] |
| surface_upload_draw_full | 0.78 [1.82] | 2.88 [4.78] |
| surface_upload_draw_damage10 | 0.06 [0.14] | 0.18 [0.30] |
| candidate_damage10_fast_put | 0.28 [0.40] | 1.26 [1.70] |
| candidate_createImageBitmap | 3.38 [4.86] | 11.76 [15.30] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.16 [1.17] | 0.14 [1.08] | 0.75 [1.90] | 0.69 [0.96] |
| presenter_bgraToRGBA | 1.46 [1.52] | 1.48 [1.51] | 4.14 [4.20] | 5.94 [6.03] |
| candidate_u32_opaque_fast_path | 1.46 [1.49] | 1.29 [1.31] | 3.87 [5.59] | 5.20 [5.24] |
| baseline_bgraToRGBA | 1.46 [1.53] | 1.47 [1.51] | 4.16 [6.69] | 5.93 [5.95] |
