# Engine bench summary — run 39334995906

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.00 [1.84] | 4.02 [8.28] |
| presenter_bgraToRGBA | 2.98 [4.43] | 11.63 [13.45] |
| candidate_u32_fast_path | 1.25 [2.46] | 5.15 [9.31] |
| baseline_bgraToRGBA | 3.00 [4.49] | 11.65 [11.79] |
| putImageData_full | 0.06 [0.07] | 0.21 [0.23] |
| presenter_draw_full | 2.98 [3.63] | 12.29 [17.43] |
| baseline_draw_full | 2.98 [3.36] | 12.22 [17.77] |
| candidate_damage10_fast_put | 0.24 [3.57] | 0.62 [7.20] |
| candidate_createImageBitmap | 3.19 [3.44] | 13.80 [24.28] |
| candidate_webgl_full | 2.59 [4.20] | 12.96 [19.68] |
| candidate_webgl_damage10 | 2.56 [5.37] | 11.62 [18.16] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.96 [1.48] | 3.36 [6.52] |
| presenter_bgraToRGBA | 1.86 [2.98] | 7.06 [7.44] |
| candidate_u32_fast_path | 1.16 [1.44] | 3.32 [4.54] |
| baseline_bgraToRGBA | 1.74 [3.34] | 6.44 [6.74] |
| putImageData_full | 0.12 [0.14] | 0.36 [0.38] |
| presenter_draw_full | 1.98 [3.76] | 7.46 [7.60] |
| baseline_draw_full | 3.26 [5.50] | 6.84 [7.46] |
| candidate_damage10_fast_put | 0.32 [0.42] | 0.82 [1.26] |
| candidate_createImageBitmap | 5.00 [6.04] | 16.10 [22.02] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.10 [1.06] | 0.11 [0.82] | 0.67 [3.85] | 0.69 [3.94] |
| presenter_bgraToRGBA | 1.64 [1.68] | 2.43 [2.47] | 9.34 [10.26] | 9.87 [10.43] |
| candidate_u32_opaque_fast_path | 1.13 [1.15] | 1.00 [1.01] | 3.01 [4.95] | 4.03 [4.08] |
| baseline_bgraToRGBA | 1.64 [1.67] | 2.43 [2.46] | 9.34 [10.22] | 9.86 [9.97] |
