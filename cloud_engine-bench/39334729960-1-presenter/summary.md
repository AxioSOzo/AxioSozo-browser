# Engine bench summary — run 39334729960

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.02 [4.99] | 1.93 [4.93] |
| presenter_bgraToRGBA | 3.54 [5.84] | 14.31 [28.55] |
| candidate_u32_fast_path | 1.49 [2.83] | 5.94 [6.12] |
| putImageData_full | 0.11 [0.14] | 0.27 [0.41] |
| presenter_draw_full | 3.65 [3.98] | 14.87 [17.09] |
| candidate_damage10_fast_put | 0.26 [3.69] | 0.80 [1.26] |
| candidate_createImageBitmap | 3.69 [4.04] | 12.24 [16.03] |
| candidate_webgl_full | 3.19 [6.61] | 13.13 [17.07] |
| candidate_webgl_damage10 | 2.88 [3.81] | 11.75 [14.16] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.56 [1.90] | 1.60 [3.00] |
| presenter_bgraToRGBA | 2.70 [4.38] | 7.88 [13.90] |
| candidate_u32_fast_path | 1.12 [1.78] | 3.92 [6.02] |
| putImageData_full | 0.16 [0.18] | 0.42 [0.44] |
| presenter_draw_full | 2.88 [4.34] | 8.06 [8.42] |
| candidate_damage10_fast_put | 0.34 [0.52] | 0.86 [1.26] |
| candidate_createImageBitmap | 3.78 [6.58] | 9.40 [12.08] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.25 [0.99] | 0.23 [1.10] | 1.07 [1.93] | 1.17 [2.09] |
| presenter_bgraToRGBA | 1.96 [2.09] | 3.05 [3.25] | 11.54 [12.63] | 12.26 [12.34] |
| candidate_u32_opaque_fast_path | 1.28 [1.35] | 1.27 [1.32] | 3.67 [3.82] | 5.21 [5.28] |
