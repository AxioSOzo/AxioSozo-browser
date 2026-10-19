# Engine bench summary — run 39301948003

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| copy | 1.00 [1.50] | 3.20 [4.10] |
| presenter_bgraToRGBA | 4.20 [5.40] | 3.10 [3.90] |
| candidate_u32_fast_path | 0.70 [1.00] | 1.90 [2.00] |
| putImageData_full | 0.10 | 0.20 |
| presenter_draw_full | 1.00 [1.70] | 3.50 [3.80] |
| candidate_damage10_fast_put | 0.20 [0.40] | 0.60 [1.70] |
| candidate_createImageBitmap | 1.90 [2.10] | 7.80 [8.70] |
| candidate_webgl_full | 1.90 [3.20] | 7.70 [9.50] |
| candidate_webgl_damage10 | 2.00 [2.30] | 10.60 [22.00] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| copy | 1.00 [2.00] | 4.00 [12.00] |
| presenter_bgraToRGBA | 1.00 [2.00] | 4.00 [8.00] |
| candidate_u32_fast_path | 1.00 [2.00] | 3.00 [4.00] |
| putImageData_full | 0.00 [1.00] | 0.00 [1.00] |
| presenter_draw_full | 1.00 [2.00] | 5.00 [8.00] |
| candidate_damage10_fast_put | 0.00 [1.00] | 1.00 [2.00] |
| candidate_createImageBitmap | 3.00 [6.00] | 15.00 [41.00] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.09 [0.79] | 0.09 [0.73] | 0.54 [3.01] | 0.71 [2.98] |
| presenter_bgraToRGBA | 1.09 [1.12] | 1.58 [1.74] | 5.91 [6.64] | 6.41 [6.76] |
| candidate_u32_opaque_fast_path | 0.79 [0.81] | 0.74 [0.80] | 2.01 [2.10] | 2.88 [2.98] |
