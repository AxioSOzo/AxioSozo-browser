# Engine bench summary — run 39352857399

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.06 [1.91] | 4.40 [13.79] |
| presenter_bgraToRGBA | 1.48 [1.70] | 5.20 [5.79] |
| candidate_u32_fast_path | 1.49 [2.99] | 5.92 [6.21] |
| baseline_bgraToRGBA | 1.49 [1.64] | 5.18 [5.38] |
| putImageData_full | 0.10 [0.12] | 0.33 [0.41] |
| presenter_draw_full | 1.59 [1.82] | 5.71 [11.09] |
| baseline_draw_full | 1.59 [1.97] | 5.70 [13.94] |
| surface_draw_full | 1.60 [1.81] | 6.53 [6.92] |
| surface_draw_damage10 | 0.18 [0.29] | 0.70 [1.21] |
| candidate_videoframe_full | 1.28 [1.62] | 5.64 [8.64] |
| candidate_videoframe_damage10 | 0.26 [0.38] | 0.80 [3.03] |
| surface_upload_draw_full | 1.51 [4.84] | 5.72 [8.19] |
| surface_upload_draw_damage10 | 0.28 [1.68] | 0.85 [3.40] |
| candidate_damage10_fast_put | 0.28 [0.32] | 1.04 [1.31] |
| candidate_createImageBitmap | 3.81 [4.07] | 15.51 [16.35] |
| candidate_webgl_full | 3.04 [5.44] | 12.54 [15.66] |
| candidate_webgl_damage10 | 2.83 [3.99] | 11.72 [15.57] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.18 [1.68] | 4.32 [6.98] |
| presenter_bgraToRGBA | 1.32 [2.46] | 5.52 [6.04] |
| candidate_u32_fast_path | 0.98 [1.72] | 3.92 [4.24] |
| baseline_bgraToRGBA | 1.36 [2.50] | 5.46 [5.96] |
| putImageData_full | 0.14 [0.16] | 0.44 [0.48] |
| presenter_draw_full | 2.64 [4.46] | 5.98 [8.16] |
| baseline_draw_full | 1.42 [2.68] | 6.00 [6.48] |
| surface_draw_full | 2.40 [2.80] | 5.92 [8.76] |
| surface_draw_damage10 | 0.24 [0.32] | 0.60 [0.72] |
| candidate_videoframe_full | 1.52 [1.90] | 5.52 [6.88] |
| candidate_videoframe_damage10 | 0.06 [0.08] | 0.12 [0.20] |
| surface_upload_draw_full | 1.98 [2.10] | 5.48 [5.82] |
| surface_upload_draw_damage10 | 0.08 [0.10] | 0.12 [0.22] |
| candidate_damage10_fast_put | 0.32 [1.16] | 0.90 [1.22] |
| candidate_createImageBitmap | 4.96 [6.76] | 19.96 [26.86] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.28 [1.62] | 0.20 [1.17] | 1.25 [4.46] | 1.09 [1.36] |
| presenter_bgraToRGBA | 1.38 [1.44] | 1.40 [1.44] | 3.69 [3.93] | 5.69 [5.75] |
| candidate_u32_opaque_fast_path | 1.28 [1.32] | 1.27 [1.31] | 3.67 [4.14] | 5.20 [5.28] |
| baseline_bgraToRGBA | 1.38 [1.44] | 1.40 [1.43] | 3.67 [3.76] | 5.68 [5.76] |
