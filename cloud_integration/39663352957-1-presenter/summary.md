# Engine bench summary — run 39663352957

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.07 [1.91] | 4.36 [7.04] |
| presenter_bgraToRGBA | 1.49 [1.92] | 5.18 [5.43] |
| candidate_u32_fast_path | 1.49 [3.00] | 6.04 [7.34] |
| putImageData_full | 0.09 [0.11] | 0.34 [0.40] |
| presenter_draw_full | 1.58 [1.79] | 5.83 [12.48] |
| surface_draw_full | 1.61 [1.87] | 6.71 [7.53] |
| surface_draw_damage10 | 0.18 [0.26] | 0.68 [0.83] |
| candidate_videoframe_full | 1.43 [1.68] | 6.92 [8.21] |
| candidate_videoframe_damage10 | 0.24 [0.35] | 0.79 [2.96] |
| surface_upload_draw_full | 1.28 [1.67] | 7.37 [11.15] |
| surface_upload_draw_damage10 | 0.26 [0.42] | 1.03 [14.32] |
| candidate_damage10_fast_put | 0.28 [0.42] | 1.06 [1.85] |
| candidate_createImageBitmap | 3.81 [5.17] | 15.11 [15.62] |
| candidate_webgl_full | 3.04 [5.14] | 16.12 [18.89] |
| candidate_webgl_damage10 | 3.94 [6.54] | 14.71 [17.36] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.08 [2.06] | 4.34 [6.52] |
| presenter_bgraToRGBA | 1.42 [2.00] | 5.26 [5.48] |
| candidate_u32_fast_path | 0.98 [1.82] | 3.82 [4.06] |
| putImageData_full | 0.14 [0.18] | 0.42 [0.44] |
| presenter_draw_full | 2.34 [2.80] | 5.78 [5.98] |
| surface_draw_full | 2.44 [3.38] | 5.86 [7.32] |
| surface_draw_damage10 | 0.16 [0.24] | 0.62 [0.76] |
| candidate_videoframe_full | 1.92 [2.44] | 5.50 [5.80] |
| candidate_videoframe_damage10 | 0.08 [0.10] | 0.12 [0.22] |
| surface_upload_draw_full | 1.54 [2.40] | 5.50 [5.80] |
| surface_upload_draw_damage10 | 0.06 [0.08] | 0.12 [0.28] |
| candidate_damage10_fast_put | 0.26 [0.56] | 0.90 [1.12] |
| candidate_createImageBitmap | 5.92 [7.50] | 19.66 [24.62] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.21 [1.07] | 0.22 [1.18] | 0.89 [1.34] | 1.06 [1.39] |
| presenter_bgraToRGBA | 1.38 [1.42] | 1.41 [1.44] | 3.67 [3.80] | 5.69 [6.25] |
| candidate_u32_opaque_fast_path | 1.28 [1.34] | 1.27 [1.30] | 3.67 [3.74] | 5.20 [5.27] |
