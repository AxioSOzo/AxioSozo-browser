# Engine bench summary — run 39426862370

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.10 [6.21] | 2.27 [6.61] |
| presenter_bgraToRGBA | 1.50 [2.34] | 5.36 [5.95] |
| candidate_u32_fast_path | 1.50 [3.01] | 6.11 [6.59] |
| baseline_bgraToRGBA | 1.50 [1.65] | 5.29 [5.88] |
| putImageData_full | 0.12 [0.15] | 0.30 [0.52] |
| presenter_draw_full | 1.71 [2.06] | 6.41 [8.64] |
| baseline_draw_full | 1.70 [2.15] | 6.38 [9.33] |
| surface_draw_full | 1.75 [2.04] | 7.12 [8.04] |
| surface_draw_damage10 | 0.20 [0.38] | 0.75 [0.93] |
| candidate_videoframe_full | 1.52 [2.23] | 7.55 [9.12] |
| candidate_videoframe_damage10 | 0.27 [0.54] | 1.05 [3.79] |
| surface_upload_draw_full | 1.66 [4.83] | 8.97 [13.90] |
| surface_upload_draw_damage10 | 0.28 [1.09] | 1.08 [3.71] |
| candidate_damage10_fast_put | 0.28 [0.37] | 1.10 [1.50] |
| candidate_createImageBitmap | 4.00 [5.61] | 13.03 [19.50] |
| candidate_webgl_full | 5.25 [12.60] | 17.11 [19.11] |
| candidate_webgl_damage10 | 3.40 [4.62] | 15.38 [17.21] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.36 [2.76] | 2.02 [3.44] |
| presenter_bgraToRGBA | 1.34 [2.22] | 5.44 [8.78] |
| candidate_u32_fast_path | 1.02 [1.66] | 3.90 [4.08] |
| baseline_bgraToRGBA | 1.58 [2.48] | 5.34 [6.24] |
| putImageData_full | 0.14 [0.20] | 0.44 [0.56] |
| presenter_draw_full | 1.84 [2.66] | 6.32 [6.88] |
| baseline_draw_full | 1.94 [2.60] | 6.38 [6.94] |
| surface_draw_full | 2.38 [2.66] | 6.38 [8.28] |
| surface_draw_damage10 | 0.28 [0.34] | 0.66 [0.74] |
| candidate_videoframe_full | 1.42 [5.54] | 3.00 [3.76] |
| candidate_videoframe_damage10 | 0.06 [0.14] | 0.20 [0.34] |
| surface_upload_draw_full | 1.30 [1.96] | 2.90 [3.86] |
| surface_upload_draw_damage10 | 0.08 [0.20] | 0.24 [0.40] |
| candidate_damage10_fast_put | 0.30 [0.44] | 0.96 [1.42] |
| candidate_createImageBitmap | 4.20 [7.46] | 10.74 [13.64] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.30 [1.41] | 0.25 [1.02] | 1.52 [3.21] | 1.40 [2.28] |
| presenter_bgraToRGBA | 1.40 [1.52] | 1.40 [1.45] | 3.71 [6.03] | 5.70 [5.82] |
| candidate_u32_opaque_fast_path | 1.30 [1.34] | 1.27 [1.30] | 3.67 [3.81] | 5.20 [5.28] |
| baseline_bgraToRGBA | 1.39 [1.44] | 1.41 [2.20] | 3.70 [3.83] | 5.71 [5.76] |
