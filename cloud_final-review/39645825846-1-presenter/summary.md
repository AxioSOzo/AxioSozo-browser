# Engine bench summary — run 39645825846

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.78 [1.61] | 1.40 [5.29] |
| presenter_bgraToRGBA | 0.92 [1.53] | 3.45 [5.49] |
| candidate_u32_fast_path | 0.89 [2.12] | 3.85 [6.10] |
| baseline_bgraToRGBA | 0.88 [0.96] | 3.46 [3.57] |
| putImageData_full | 0.05 [0.06] | 0.17 [0.23] |
| presenter_draw_full | 0.94 [1.17] | 3.75 [5.68] |
| baseline_draw_full | 0.94 [1.15] | 3.71 [6.27] |
| surface_draw_full | 1.21 [1.39] | 4.93 [5.21] |
| surface_draw_damage10 | 0.12 [0.21] | 0.52 [0.63] |
| candidate_videoframe_full | 0.95 [1.22] | 3.53 [5.93] |
| candidate_videoframe_damage10 | 0.15 [0.34] | 0.65 [2.43] |
| surface_upload_draw_full | 0.96 [3.77] | 4.01 [5.33] |
| surface_upload_draw_damage10 | 0.17 [0.94] | 0.65 [2.34] |
| candidate_damage10_fast_put | 0.17 [0.20] | 0.69 [0.80] |
| candidate_createImageBitmap | 2.29 [2.58] | 7.41 [12.31] |
| candidate_webgl_full | 2.23 [3.52] | 8.76 [9.90] |
| candidate_webgl_damage10 | 2.13 [2.55] | 7.95 [9.40] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.48 [1.08] | 1.38 [2.34] |
| presenter_bgraToRGBA | 0.92 [1.34] | 3.58 [4.48] |
| candidate_u32_fast_path | 1.02 [1.12] | 2.92 [4.24] |
| baseline_bgraToRGBA | 1.18 [1.38] | 3.54 [4.22] |
| putImageData_full | 0.08 [0.10] | 0.30 [0.32] |
| presenter_draw_full | 1.46 [1.62] | 3.86 [4.10] |
| baseline_draw_full | 1.04 [1.36] | 3.88 [3.98] |
| surface_draw_full | 1.38 [2.04] | 4.04 [4.20] |
| surface_draw_damage10 | 0.10 [0.12] | 0.44 [0.58] |
| candidate_videoframe_full | 0.88 [1.22] | 2.02 [3.90] |
| candidate_videoframe_damage10 | 0.04 [0.08] | 0.08 [0.18] |
| surface_upload_draw_full | 0.94 [2.56] | 1.96 [2.18] |
| surface_upload_draw_damage10 | 0.04 [0.14] | 0.10 [0.16] |
| candidate_damage10_fast_put | 0.20 [0.24] | 0.66 [0.74] |
| candidate_createImageBitmap | 2.16 [3.38] | 6.40 [7.46] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.10 [1.03] | 0.10 [0.86] | 0.51 [0.99] | 0.55 [0.78] |
| presenter_bgraToRGBA | 0.85 [1.14] | 0.83 [1.06] | 2.17 [2.25] | 3.34 [3.43] |
| candidate_u32_opaque_fast_path | 0.83 [0.87] | 0.75 [0.95] | 2.05 [2.14] | 3.08 [3.13] |
| baseline_bgraToRGBA | 0.84 [0.93] | 0.81 [0.82] | 2.15 [2.23] | 3.33 [3.40] |
