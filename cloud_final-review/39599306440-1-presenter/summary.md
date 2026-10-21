# Engine bench summary — run 39599306440

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.89 [4.49] | 1.66 [5.42] |
| presenter_bgraToRGBA | 1.25 [1.50] | 4.54 [4.76] |
| candidate_u32_fast_path | 1.25 [2.48] | 4.99 [5.18] |
| baseline_bgraToRGBA | 1.25 [1.28] | 4.57 [4.79] |
| putImageData_full | 0.06 [0.07] | 0.21 [0.24] |
| presenter_draw_full | 1.31 [1.53] | 4.93 [6.57] |
| baseline_draw_full | 1.31 [1.56] | 4.93 [7.51] |
| surface_draw_full | 1.38 [1.59] | 5.67 [6.35] |
| surface_draw_damage10 | 0.15 [0.23] | 0.57 [0.69] |
| candidate_videoframe_full | 1.04 [1.23] | 3.65 [5.12] |
| candidate_videoframe_damage10 | 0.20 [0.35] | 0.70 [2.29] |
| surface_upload_draw_full | 1.02 [3.71] | 4.23 [5.90] |
| surface_upload_draw_damage10 | 0.21 [0.87] | 0.73 [2.38] |
| candidate_damage10_fast_put | 0.23 [0.30] | 0.92 [1.09] |
| candidate_createImageBitmap | 3.10 [3.33] | 10.12 [10.61] |
| candidate_webgl_full | 2.58 [5.68] | 10.70 [14.42] |
| candidate_webgl_damage10 | 3.94 [7.09] | 11.84 [14.74] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.82 [1.54] | 1.18 [2.26] |
| presenter_bgraToRGBA | 1.16 [1.98] | 4.54 [4.72] |
| candidate_u32_fast_path | 0.92 [1.54] | 3.32 [3.50] |
| baseline_bgraToRGBA | 1.38 [1.92] | 4.54 [4.72] |
| putImageData_full | 0.12 [0.14] | 0.36 [0.38] |
| presenter_draw_full | 1.84 [3.06] | 4.94 [5.56] |
| baseline_draw_full | 1.46 [2.58] | 4.94 [5.02] |
| surface_draw_full | 1.32 [2.04] | 5.00 [5.16] |
| surface_draw_damage10 | 0.22 [0.34] | 0.52 [0.58] |
| candidate_videoframe_full | 0.52 [1.40] | 1.54 [2.06] |
| candidate_videoframe_damage10 | 0.04 [0.08] | 0.08 [0.10] |
| surface_upload_draw_full | 0.84 [1.36] | 1.98 [2.10] |
| surface_upload_draw_damage10 | 0.06 [0.12] | 0.10 [0.18] |
| candidate_damage10_fast_put | 0.26 [0.70] | 0.80 [1.02] |
| candidate_createImageBitmap | 2.26 [3.48] | 7.14 [11.46] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.14 [1.02] | 0.10 [1.01] | 0.81 [2.05] | 0.58 [0.69] |
| presenter_bgraToRGBA | 1.14 [1.23] | 1.14 [1.16] | 3.22 [4.99] | 4.60 [4.63] |
| candidate_u32_opaque_fast_path | 1.13 [1.20] | 1.01 [1.05] | 3.00 [3.09] | 4.03 [4.09] |
| baseline_bgraToRGBA | 1.13 [1.23] | 1.14 [1.24] | 3.21 [3.27] | 4.60 [4.65] |
