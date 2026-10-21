# Engine bench summary — run 39645825889

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.07 [1.29] | 4.45 [7.04] |
| presenter_bgraToRGBA | 0.89 [1.53] | 3.66 [3.85] |
| candidate_u32_fast_path | 0.95 [1.14] | 3.52 [3.67] |
| putImageData_full | 0.18 [0.21] | 0.66 [0.70] |
| presenter_draw_full | 1.14 [1.20] | 4.95 [5.15] |
| surface_draw_full | 1.50 [1.60] | 6.46 [6.72] |
| surface_draw_damage10 | 0.18 [0.23] | 0.68 [0.94] |
| candidate_videoframe_full | 1.60 [1.86] | 5.52 [6.30] |
| candidate_videoframe_damage10 | 0.23 [0.31] | 0.81 [2.12] |
| surface_upload_draw_full | 1.57 [1.84] | 5.90 [6.75] |
| surface_upload_draw_damage10 | 0.26 [0.33] | 0.89 [2.23] |
| candidate_damage10_fast_put | 0.23 [0.31] | 0.94 [1.46] |
| candidate_createImageBitmap | 3.06 [3.56] | 13.23 [16.59] |
| candidate_webgl_full | 4.03 [4.71] | 15.38 [16.41] |
| candidate_webgl_damage10 | 3.67 [7.47] | 13.88 [18.02] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.34 [1.72] | 4.28 [5.74] |
| presenter_bgraToRGBA | 1.60 [2.46] | 6.30 [6.38] |
| candidate_u32_fast_path | 1.30 [2.22] | 5.06 [5.78] |
| putImageData_full | 0.18 [0.20] | 0.66 [0.70] |
| presenter_draw_full | 2.68 [3.08] | 7.64 [9.44] |
| surface_draw_full | 2.22 [3.54] | 7.64 [9.18] |
| surface_draw_damage10 | 0.24 [0.38] | 0.80 [1.70] |
| candidate_videoframe_full | 1.36 [1.88] | 5.22 [7.06] |
| candidate_videoframe_damage10 | 0.08 [0.12] | 0.24 [0.40] |
| surface_upload_draw_full | 1.76 [2.96] | 5.12 [5.54] |
| surface_upload_draw_damage10 | 0.12 [0.18] | 0.26 [0.48] |
| candidate_damage10_fast_put | 0.40 [0.58] | 1.10 [1.28] |
| candidate_createImageBitmap | 5.22 [9.38] | 19.00 [28.42] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.38 [1.06] | 0.33 [1.06] | 1.58 [4.06] | 1.59 [4.38] |
| presenter_bgraToRGBA | 1.56 [1.59] | 1.37 [1.40] | 3.78 [3.90] | 5.47 [5.55] |
| candidate_u32_opaque_fast_path | 1.47 [1.52] | 1.18 [1.22] | 3.47 [3.57] | 4.80 [4.86] |
