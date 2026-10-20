# Engine bench summary — run 39430325631

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.15 [1.50] | 2.64 [3.49] |
| presenter_bgraToRGBA | 2.04 [2.34] | 3.15 [3.28] |
| candidate_u32_fast_path | 0.78 [0.89] | 3.00 [3.17] |
| baseline_bgraToRGBA | 0.81 [0.89] | 3.17 [3.67] |
| putImageData_full | 0.17 [0.20] | 0.67 [0.70] |
| presenter_draw_full | 1.00 [1.04] | 3.96 [4.22] |
| baseline_draw_full | 1.00 [1.05] | 3.98 [4.30] |
| surface_draw_full | 1.04 [1.19] | 4.33 [4.50] |
| surface_draw_damage10 | 0.14 [0.16] | 0.50 [0.57] |
| candidate_videoframe_full | 1.50 [1.58] | 4.75 [5.51] |
| candidate_videoframe_damage10 | 0.21 [0.30] | 0.73 [1.75] |
| surface_upload_draw_full | 1.48 [1.71] | 5.00 [6.03] |
| surface_upload_draw_damage10 | 0.23 [0.27] | 0.76 [1.73] |
| candidate_damage10_fast_put | 0.23 [0.27] | 0.83 [1.28] |
| candidate_createImageBitmap | 2.67 [2.80] | 9.12 [13.32] |
| candidate_webgl_full | 4.78 [6.80] | 12.38 [16.63] |
| candidate_webgl_damage10 | 4.01 [8.77] | 10.35 [11.28] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.80 [1.48] | 2.54 [2.94] |
| presenter_bgraToRGBA | 1.34 [2.24] | 5.20 [5.38] |
| candidate_u32_fast_path | 1.26 [2.04] | 4.22 [4.38] |
| baseline_bgraToRGBA | 1.36 [2.42] | 5.20 [5.48] |
| putImageData_full | 0.18 [0.22] | 0.68 [0.72] |
| presenter_draw_full | 2.44 [3.72] | 6.04 [6.62] |
| baseline_draw_full | 2.18 [2.90] | 6.04 [6.18] |
| surface_draw_full | 1.66 [2.36] | 6.26 [9.04] |
| surface_draw_damage10 | 0.20 [0.28] | 0.66 [0.68] |
| candidate_videoframe_full | 1.28 [2.76] | 3.14 [3.56] |
| candidate_videoframe_damage10 | 0.08 [0.12] | 0.18 [0.22] |
| surface_upload_draw_full | 1.28 [1.82] | 3.38 [3.66] |
| surface_upload_draw_damage10 | 0.10 [0.14] | 0.22 [0.38] |
| candidate_damage10_fast_put | 0.36 [0.44] | 0.98 [1.12] |
| candidate_createImageBitmap | 3.92 [5.32] | 10.98 [13.32] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.34 [1.12] | 0.25 [1.09] | 1.16 [2.13] | 1.15 [2.06] |
| presenter_bgraToRGBA | 1.54 [1.60] | 1.24 [1.28] | 3.37 [3.52] | 4.99 [5.18] |
| candidate_u32_opaque_fast_path | 1.43 [1.48] | 1.12 [1.17] | 3.08 [3.17] | 4.53 [4.64] |
| baseline_bgraToRGBA | 1.53 [1.62] | 1.23 [1.28] | 3.36 [3.46] | 5.01 [5.17] |
