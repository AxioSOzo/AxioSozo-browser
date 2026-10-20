# Engine bench summary — run 39429676959

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.69 [4.43] | 1.33 [4.85] |
| presenter_bgraToRGBA | 0.83 [1.20] | 4.08 [5.77] |
| candidate_u32_fast_path | 0.82 [1.95] | 3.40 [3.67] |
| baseline_bgraToRGBA | 0.82 [0.89] | 3.19 [3.50] |
| putImageData_full | 0.04 [0.05] | 0.17 [0.18] |
| presenter_draw_full | 0.88 [1.06] | 3.46 [5.17] |
| baseline_draw_full | 0.87 [1.08] | 3.48 [6.12] |
| surface_draw_full | 1.09 [1.26] | 4.67 [4.97] |
| surface_draw_damage10 | 0.12 [0.20] | 0.47 [0.56] |
| candidate_videoframe_full | 0.84 [1.02] | 3.33 [4.33] |
| candidate_videoframe_damage10 | 0.14 [0.27] | 0.58 [2.27] |
| surface_upload_draw_full | 0.84 [3.44] | 3.73 [4.93] |
| surface_upload_draw_damage10 | 0.15 [0.86] | 0.61 [2.79] |
| candidate_damage10_fast_put | 0.16 [0.20] | 0.69 [2.23] |
| candidate_createImageBitmap | 2.08 [2.46] | 6.92 [12.09] |
| candidate_webgl_full | 1.98 [3.12] | 9.50 [12.06] |
| candidate_webgl_damage10 | 1.70 [2.21] | 9.20 [11.62] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.68 [1.38] | 1.40 [3.80] |
| presenter_bgraToRGBA | 0.88 [1.22] | 3.58 [5.48] |
| candidate_u32_fast_path | 0.74 [1.08] | 2.94 [3.50] |
| baseline_bgraToRGBA | 0.90 [1.28] | 3.52 [3.66] |
| putImageData_full | 0.10 [0.12] | 0.30 [0.32] |
| presenter_draw_full | 1.46 [1.58] | 3.86 [4.02] |
| baseline_draw_full | 1.32 [2.50] | 3.86 [3.90] |
| surface_draw_full | 1.20 [1.40] | 4.04 [4.26] |
| surface_draw_damage10 | 0.14 [0.28] | 0.42 [0.64] |
| candidate_videoframe_full | 0.50 [1.10] | 1.40 [2.00] |
| candidate_videoframe_damage10 | 0.04 [0.06] | 0.06 [0.10] |
| surface_upload_draw_full | 0.88 [1.28] | 1.90 [1.98] |
| surface_upload_draw_damage10 | 0.04 [0.06] | 0.08 [0.10] |
| candidate_damage10_fast_put | 0.18 [0.28] | 0.68 [0.74] |
| candidate_createImageBitmap | 2.76 [3.94] | 6.56 [8.32] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.68 [0.73] | 0.08 [0.21] | 0.50 [1.37] | 0.50 [1.39] |
| presenter_bgraToRGBA | 0.79 [0.85] | 0.85 | 2.24 [2.30] | 3.48 [3.53] |
| candidate_u32_opaque_fast_path | 0.87 | 0.78 [1.04] | 2.18 [2.20] | 3.16 [3.20] |
| baseline_bgraToRGBA | 0.88 [0.89] | 0.85 [0.87] | 2.29 [2.32] | 3.32 [3.43] |
