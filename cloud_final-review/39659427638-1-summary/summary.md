# Engine bench summary — run 39659427638

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.82 [4.61] | 1.85 [5.12] |
| presenter_bgraToRGBA | 1.25 [1.49] | 4.57 [8.98] |
| candidate_u32_fast_path | 1.25 [2.50] | 4.97 [5.18] |
| baseline_bgraToRGBA | 1.25 [1.30] | 4.54 [4.70] |
| putImageData_full | 0.06 [0.07] | 0.21 [0.23] |
| presenter_draw_full | 1.31 [1.50] | 4.92 [6.60] |
| baseline_draw_full | 1.31 [1.49] | 4.90 [7.43] |
| surface_draw_full | 1.38 [1.54] | 5.64 [5.90] |
| surface_draw_damage10 | 0.15 [0.23] | 0.58 [0.68] |
| candidate_videoframe_full | 1.02 [1.25] | 3.59 [4.55] |
| candidate_videoframe_damage10 | 0.19 [0.33] | 0.71 [2.38] |
| surface_upload_draw_full | 1.09 [3.69] | 4.09 [5.12] |
| surface_upload_draw_damage10 | 0.21 [0.84] | 0.70 [2.44] |
| candidate_damage10_fast_put | 0.23 [0.31] | 0.89 [1.02] |
| candidate_createImageBitmap | 3.08 [3.37] | 9.88 [10.24] |
| candidate_webgl_full | 2.62 [3.94] | 9.98 [14.84] |
| candidate_webgl_damage10 | 2.47 [3.46] | 10.48 [13.73] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.96 [1.94] | 1.34 [1.78] |
| presenter_bgraToRGBA | 1.14 [1.96] | 4.52 [4.76] |
| candidate_u32_fast_path | 0.84 [1.42] | 3.32 [4.02] |
| baseline_bgraToRGBA | 1.14 [1.76] | 4.52 [4.64] |
| putImageData_full | 0.12 [0.16] | 0.36 [0.38] |
| presenter_draw_full | 1.40 [1.98] | 4.92 [5.00] |
| baseline_draw_full | 2.24 [4.52] | 4.92 [5.12] |
| surface_draw_full | 1.92 [4.26] | 5.00 [6.28] |
| surface_draw_damage10 | 0.24 [0.36] | 0.52 [0.64] |
| candidate_videoframe_full | 0.50 [1.10] | 1.42 [2.04] |
| candidate_videoframe_damage10 | 0.04 [0.06] | 0.08 [0.22] |
| surface_upload_draw_full | 0.96 [1.40] | 1.84 [2.54] |
| surface_upload_draw_damage10 | 0.04 [0.08] | 0.12 [0.22] |
| candidate_damage10_fast_put | 0.26 [0.42] | 0.80 [1.22] |
| candidate_createImageBitmap | 3.62 [5.02] | 7.12 [9.36] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.13 [0.95] | 0.10 [0.24] | 0.67 [1.54] | 0.60 [0.83] |
| presenter_bgraToRGBA | 1.13 [1.20] | 1.14 [1.17] | 3.21 [3.60] | 4.60 [4.67] |
| candidate_u32_opaque_fast_path | 1.12 [1.14] | 1.01 [1.11] | 3.00 [3.05] | 4.03 [4.08] |
| baseline_bgraToRGBA | 1.13 [1.16] | 1.15 [1.24] | 3.21 [3.28] | 4.60 [4.66] |
