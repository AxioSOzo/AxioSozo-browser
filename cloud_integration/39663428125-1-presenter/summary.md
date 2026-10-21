# Engine bench summary — run 39663428125

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.08 [1.92] | 4.52 [14.07] |
| presenter_bgraToRGBA | 1.49 [1.93] | 5.29 [5.72] |
| candidate_u32_fast_path | 1.48 [2.98] | 6.07 [6.46] |
| baseline_bgraToRGBA | 1.48 [1.61] | 5.24 [5.75] |
| putImageData_full | 0.10 [0.17] | 0.35 [0.42] |
| presenter_draw_full | 1.61 [1.94] | 6.00 [11.85] |
| baseline_draw_full | 1.61 [1.90] | 5.98 [14.39] |
| surface_draw_full | 1.66 [1.92] | 6.92 [11.01] |
| surface_draw_damage10 | 0.18 [0.29] | 1.21 [1.40] |
| candidate_videoframe_full | 1.50 [1.91] | 7.49 [10.26] |
| candidate_videoframe_damage10 | 0.26 [0.47] | 0.91 [4.34] |
| surface_upload_draw_full | 1.35 [4.96] | 8.07 [8.89] |
| surface_upload_draw_damage10 | 0.27 [1.62] | 0.96 [3.88] |
| candidate_damage10_fast_put | 0.28 [0.34] | 1.08 [1.44] |
| candidate_createImageBitmap | 3.86 [4.34] | 16.22 [24.03] |
| candidate_webgl_full | 5.74 [11.87] | 12.73 [19.25] |
| candidate_webgl_damage10 | 3.36 [6.03] | 10.86 [12.79] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.22 [1.88] | 4.54 [7.38] |
| presenter_bgraToRGBA | 1.44 [2.46] | 5.20 [5.54] |
| candidate_u32_fast_path | 0.94 [1.38] | 3.80 [3.96] |
| baseline_bgraToRGBA | 1.52 [2.48] | 5.22 [6.52] |
| putImageData_full | 0.14 [0.16] | 0.44 [0.54] |
| presenter_draw_full | 2.44 [3.28] | 5.84 [6.00] |
| baseline_draw_full | 1.64 [2.86] | 5.84 [6.04] |
| surface_draw_full | 2.52 [2.86] | 6.20 [7.54] |
| surface_draw_damage10 | 0.30 [0.36] | 0.62 [0.76] |
| candidate_videoframe_full | 1.50 [2.12] | 5.78 [6.06] |
| candidate_videoframe_damage10 | 0.08 [0.18] | 0.14 [0.30] |
| surface_upload_draw_full | 1.88 [2.18] | 5.88 [6.12] |
| surface_upload_draw_damage10 | 0.08 [0.12] | 0.16 [0.30] |
| candidate_damage10_fast_put | 0.32 [0.60] | 0.94 [1.14] |
| candidate_createImageBitmap | 5.16 [7.36] | 20.70 [27.38] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.27 [1.85] | 0.23 [1.28] | 1.15 [4.50] | 1.10 [1.43] |
| presenter_bgraToRGBA | 1.38 [1.45] | 1.40 [1.43] | 3.67 [3.77] | 5.70 [5.78] |
| candidate_u32_opaque_fast_path | 1.28 [1.31] | 1.27 [1.32] | 3.67 [3.75] | 5.20 [5.25] |
| baseline_bgraToRGBA | 1.38 [1.47] | 1.40 [1.44] | 3.67 [3.83] | 5.69 [5.93] |
