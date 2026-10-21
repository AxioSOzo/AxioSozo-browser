# Engine bench summary — run 39599306536

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.40 [4.21] | 2.72 [4.30] |
| presenter_bgraToRGBA | 1.57 [2.96] | 5.23 [6.89] |
| candidate_u32_fast_path | 1.48 [3.02] | 5.92 [6.80] |
| putImageData_full | 0.10 [0.13] | 0.34 [0.39] |
| presenter_draw_full | 1.59 [1.84] | 5.76 [8.13] |
| surface_draw_full | 1.61 [1.92] | 6.65 [7.07] |
| surface_draw_damage10 | 0.18 [0.28] | 0.68 [0.77] |
| candidate_videoframe_full | 1.25 [1.53] | 4.67 [6.32] |
| candidate_videoframe_damage10 | 0.23 [0.37] | 0.78 [2.77] |
| surface_upload_draw_full | 1.23 [1.54] | 5.21 [7.04] |
| surface_upload_draw_damage10 | 0.25 [0.39] | 0.81 [4.75] |
| candidate_damage10_fast_put | 0.27 [0.41] | 0.88 [1.16] |
| candidate_createImageBitmap | 3.67 [4.61] | 12.39 [17.05] |
| candidate_webgl_full | 3.10 [5.03] | 16.00 [18.66] |
| candidate_webgl_damage10 | 3.19 [5.09] | 15.07 [18.00] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.00 [2.60] | 1.92 [3.00] |
| presenter_bgraToRGBA | 1.32 [2.50] | 6.12 [8.48] |
| candidate_u32_fast_path | 1.06 [1.82] | 3.84 [6.10] |
| putImageData_full | 0.12 [0.16] | 0.42 [0.46] |
| presenter_draw_full | 1.50 [2.56] | 5.96 [6.60] |
| surface_draw_full | 1.50 [2.36] | 5.98 [6.20] |
| surface_draw_damage10 | 0.26 [0.38] | 0.62 [0.76] |
| candidate_videoframe_full | 1.22 [1.78] | 2.24 [2.92] |
| candidate_videoframe_damage10 | 0.06 [0.22] | 0.12 [0.26] |
| surface_upload_draw_full | 1.64 [3.36] | 2.68 [2.94] |
| surface_upload_draw_damage10 | 0.06 [0.12] | 0.14 [0.28] |
| candidate_damage10_fast_put | 0.28 [0.38] | 0.96 [2.96] |
| candidate_createImageBitmap | 4.52 [6.40] | 9.08 [11.56] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.25 [1.01] | 0.23 [0.95] | 1.02 [1.86] | 1.11 [2.07] |
| presenter_bgraToRGBA | 1.39 [1.49] | 1.41 [1.43] | 3.67 [3.79] | 5.70 [5.82] |
| candidate_u32_opaque_fast_path | 1.29 [1.33] | 1.27 [1.31] | 3.66 [3.77] | 5.20 [5.26] |
