# Engine bench summary — run 39351791940

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.06 [3.94] | 2.54 [5.28] |
| presenter_bgraToRGBA | 1.29 [1.64] | 4.38 [4.58] |
| candidate_u32_fast_path | 1.25 [2.54] | 4.75 [5.00] |
| baseline_bgraToRGBA | 1.24 [1.45] | 4.33 [4.58] |
| putImageData_full | 0.17 [0.20] | 0.67 [0.69] |
| presenter_draw_full | 1.48 [1.75] | 5.36 [6.36] |
| baseline_draw_full | 1.44 [1.94] | 5.49 [6.86] |
| surface_draw_full | 1.49 [1.76] | 6.17 [6.45] |
| surface_draw_damage10 | 0.23 [0.35] | 0.66 [0.76] |
| candidate_videoframe_full | 1.66 [2.09] | 4.67 [5.63] |
| candidate_videoframe_damage10 | 0.20 [0.39] | 0.67 [1.69] |
| surface_upload_draw_full | 1.84 [3.40] | 4.99 [6.82] |
| surface_upload_draw_damage10 | 0.24 [1.09] | 0.82 [2.94] |
| candidate_damage10_fast_put | 0.28 [0.41] | 0.97 [1.20] |
| candidate_createImageBitmap | 3.35 [3.98] | 12.66 [17.38] |
| candidate_webgl_full | 3.40 [6.09] | 12.86 [14.77] |
| candidate_webgl_damage10 | 3.98 [7.55] | 10.77 [12.48] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.26 [1.68] | 2.42 [3.16] |
| presenter_bgraToRGBA | 1.44 [1.96] | 4.52 [4.78] |
| candidate_u32_fast_path | 1.34 [1.74] | 4.16 [4.78] |
| baseline_bgraToRGBA | 1.44 [1.78] | 4.46 [4.94] |
| putImageData_full | 0.20 [0.26] | 0.66 [0.70] |
| presenter_draw_full | 1.78 [2.30] | 5.66 [6.68] |
| baseline_draw_full | 1.74 [2.28] | 5.44 [5.98] |
| surface_draw_full | 1.68 [2.18] | 5.56 [5.96] |
| surface_draw_damage10 | 0.20 [0.34] | 0.60 [0.76] |
| candidate_videoframe_full | 1.20 [1.58] | 3.48 [3.86] |
| candidate_videoframe_damage10 | 0.08 [0.18] | 0.16 [0.24] |
| surface_upload_draw_full | 1.22 [1.54] | 3.46 [4.12] |
| surface_upload_draw_damage10 | 0.12 [0.16] | 0.22 [0.28] |
| candidate_damage10_fast_put | 0.30 [0.50] | 0.86 [0.96] |
| candidate_createImageBitmap | 3.72 [5.08] | 10.44 [12.30] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.35 [1.00] | 0.24 [0.94] | 1.18 [1.80] | 1.00 [2.55] |
| presenter_bgraToRGBA | 1.22 [1.27] | 0.95 [1.13] | 2.61 [3.62] | 3.92 [4.44] |
| candidate_u32_opaque_fast_path | 0.75 [1.12] | 0.90 [0.91] | 2.57 [3.37] | 3.69 [4.33] |
| baseline_bgraToRGBA | 1.21 [1.28] | 0.95 [1.15] | 2.46 [3.29] | 3.87 [4.42] |
