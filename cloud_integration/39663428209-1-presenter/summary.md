# Engine bench summary — run 39663428209

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.21 [2.28] | 4.58 [4.86] |
| presenter_bgraToRGBA | 1.50 [1.94] | 5.22 [5.38] |
| candidate_u32_fast_path | 1.49 [3.00] | 5.96 [6.33] |
| putImageData_full | 0.10 [0.12] | 0.40 [0.44] |
| presenter_draw_full | 1.67 [1.93] | 6.03 [13.16] |
| surface_draw_full | 1.69 [1.91] | 6.93 [7.23] |
| surface_draw_damage10 | 0.19 [0.34] | 0.72 [0.85] |
| candidate_videoframe_full | 1.70 [1.99] | 5.79 [7.94] |
| candidate_videoframe_damage10 | 0.27 [0.47] | 0.97 [3.20] |
| surface_upload_draw_full | 1.64 [1.93] | 9.15 [13.89] |
| surface_upload_draw_damage10 | 0.28 [0.51] | 1.05 [12.33] |
| candidate_damage10_fast_put | 0.28 [0.49] | 0.85 [1.43] |
| candidate_createImageBitmap | 4.02 [5.79] | 16.59 [23.66] |
| candidate_webgl_full | 4.62 [7.76] | 13.74 [15.40] |
| candidate_webgl_damage10 | 5.46 [9.84] | 12.96 [16.18] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.30 [2.04] | 4.60 [8.32] |
| presenter_bgraToRGBA | 1.54 [2.44] | 5.28 [5.70] |
| candidate_u32_fast_path | 1.00 [1.86] | 3.96 [4.48] |
| putImageData_full | 0.12 [0.18] | 0.50 [0.54] |
| presenter_draw_full | 1.60 [2.72] | 6.22 [8.32] |
| surface_draw_full | 2.62 [2.98] | 6.18 [7.58] |
| surface_draw_damage10 | 0.18 [0.32] | 0.64 [0.84] |
| candidate_videoframe_full | 1.90 [2.36] | 6.16 [6.38] |
| candidate_videoframe_damage10 | 0.06 [0.14] | 0.20 [0.28] |
| surface_upload_draw_full | 1.78 [2.18] | 6.18 [6.42] |
| surface_upload_draw_damage10 | 0.10 [0.24] | 0.22 [0.28] |
| candidate_damage10_fast_put | 0.36 [0.48] | 1.00 [1.34] |
| candidate_createImageBitmap | 6.06 [8.18] | 21.64 [30.08] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.53 [1.30] | 0.24 [1.05] | 1.42 [4.64] | 1.15 [4.67] |
| presenter_bgraToRGBA | 1.39 [1.47] | 1.40 [1.43] | 3.67 [3.77] | 5.70 [5.80] |
| candidate_u32_opaque_fast_path | 1.29 [1.31] | 1.27 [1.33] | 3.67 [3.72] | 5.21 [5.67] |
