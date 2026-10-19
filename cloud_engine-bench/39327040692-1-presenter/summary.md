# Engine bench summary — run 39327040692

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.99 [4.04] | 2.52 [4.79] |
| presenter_bgraToRGBA | 3.81 [9.32] | 15.34 [26.55] |
| candidate_u32_fast_path | 1.65 [3.44] | 6.38 [6.96] |
| putImageData_full | 0.17 [0.18] | 0.64 [0.71] |
| presenter_draw_full | 4.00 [4.75] | 16.77 [17.86] |
| candidate_damage10_fast_put | 0.28 [2.22] | 0.95 [1.34] |
| candidate_createImageBitmap | 3.75 [4.50] | 13.09 [16.09] |
| candidate_webgl_full | 3.56 [5.17] | 13.73 [16.30] |
| candidate_webgl_damage10 | 3.23 [4.67] | 12.39 [14.16] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.94 [1.28] | 2.48 [3.58] |
| presenter_bgraToRGBA | 1.88 [2.64] | 8.86 [15.86] |
| candidate_u32_fast_path | 1.28 [1.60] | 5.10 [7.64] |
| putImageData_full | 0.20 [0.22] | 0.68 [0.70] |
| presenter_draw_full | 2.22 [3.84] | 8.52 [9.40] |
| candidate_damage10_fast_put | 0.28 [0.46] | 1.00 [1.14] |
| candidate_createImageBitmap | 4.08 [4.86] | 12.00 [14.22] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.31 [0.97] | 0.34 [1.04] | 1.54 [2.48] | 1.53 [2.52] |
| presenter_bgraToRGBA | 2.13 [2.24] | 3.03 [3.11] | 11.28 [11.54] | 12.17 [12.40] |
| candidate_u32_opaque_fast_path | 1.47 [1.50] | 1.18 [1.20] | 3.41 [3.48] | 4.78 [4.84] |
