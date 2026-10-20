# Engine bench summary — run 39426717880

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.60 [6.47] | 3.21 [6.58] |
| presenter_bgraToRGBA | 1.63 [2.58] | 5.69 [6.20] |
| candidate_u32_fast_path | 1.69 [3.60] | 6.70 [7.15] |
| baseline_bgraToRGBA | 1.57 [1.75] | 5.72 [6.16] |
| putImageData_full | 0.17 [0.21] | 0.59 [0.68] |
| presenter_draw_full | 1.87 [3.15] | 7.35 [8.56] |
| baseline_draw_full | 1.83 [2.04] | 7.37 [9.18] |
| surface_draw_full | 2.00 [2.27] | 9.72 [10.74] |
| surface_draw_damage10 | 0.28 [0.39] | 0.96 [1.29] |
| candidate_videoframe_full | 1.69 [2.09] | 6.28 [7.66] |
| candidate_videoframe_damage10 | 0.24 [0.46] | 0.83 [2.62] |
| surface_upload_draw_full | 1.66 [3.50] | 7.83 [9.84] |
| surface_upload_draw_damage10 | 0.26 [1.21] | 0.90 [2.85] |
| candidate_damage10_fast_put | 0.31 [0.47] | 1.23 [1.52] |
| candidate_createImageBitmap | 4.01 [4.75] | 15.65 [25.09] |
| candidate_webgl_full | 6.64 [12.88] | 19.88 [22.14] |
| candidate_webgl_damage10 | 4.04 [5.71] | 17.30 [19.13] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.08 [1.56] | 3.22 [4.12] |
| presenter_bgraToRGBA | 1.62 [2.14] | 6.32 [7.38] |
| candidate_u32_fast_path | 1.30 [2.18] | 5.10 [7.06] |
| baseline_bgraToRGBA | 1.78 [2.76] | 6.34 [7.46] |
| putImageData_full | 0.16 [0.18] | 0.98 [1.04] |
| presenter_draw_full | 2.28 [3.54] | 7.94 [10.30] |
| baseline_draw_full | 2.80 [3.34] | 7.80 [8.42] |
| surface_draw_full | 2.06 [3.42] | 7.84 [9.76] |
| surface_draw_damage10 | 0.24 [0.42] | 0.80 [0.92] |
| candidate_videoframe_full | 1.42 [4.58] | 4.04 [4.70] |
| candidate_videoframe_damage10 | 0.10 [0.14] | 0.28 [0.42] |
| surface_upload_draw_full | 1.42 [1.94] | 4.08 [4.66] |
| surface_upload_draw_damage10 | 0.12 [0.18] | 0.28 [0.40] |
| candidate_damage10_fast_put | 0.40 [0.68] | 1.12 [1.32] |
| candidate_createImageBitmap | 3.30 [4.96] | 15.88 [20.22] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.47 [1.21] | 0.47 [1.20] | 2.22 [2.77] | 2.05 [2.75] |
| presenter_bgraToRGBA | 1.55 [1.61] | 1.36 [1.40] | 3.83 [3.97] | 5.51 [5.57] |
| candidate_u32_opaque_fast_path | 1.47 [2.46] | 1.19 [1.25] | 3.51 [3.90] | 4.84 [4.93] |
| baseline_bgraToRGBA | 1.56 [1.67] | 1.36 [1.54] | 3.85 [4.22] | 5.55 [5.94] |
