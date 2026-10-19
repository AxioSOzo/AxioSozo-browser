# Engine bench summary — run 39303324088

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 1.25 [6.24] | 2.60 [7.36] |
| presenter_bgraToRGBA | 3.77 [6.16] | 15.08 [17.07] |
| candidate_u32_fast_path | 1.61 [3.05] | 6.46 [6.56] |
| putImageData_full | 0.07 [0.09] | 0.30 [0.39] |
| presenter_draw_full | 3.85 [4.36] | 15.62 [18.02] |
| candidate_damage10_fast_put | 0.28 [3.83] | 0.78 [1.52] |
| candidate_createImageBitmap | 3.96 [4.51] | 12.85 [16.98] |
| candidate_webgl_full | 3.29 [6.42] | 12.15 [15.91] |
| candidate_webgl_damage10 | 3.10 [5.21] | 11.52 [15.01] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.58 [1.54] | 1.90 [2.58] |
| presenter_bgraToRGBA | 2.12 [3.62] | 9.82 [16.48] |
| candidate_u32_fast_path | 1.22 [1.82] | 4.28 [4.84] |
| putImageData_full | 0.18 [0.20] | 0.46 [0.48] |
| presenter_draw_full | 2.46 [3.94] | 9.20 [11.98] |
| candidate_damage10_fast_put | 0.28 [0.44] | 1.22 [1.60] |
| candidate_createImageBitmap | 3.96 [7.36] | 11.34 [19.62] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.17 [1.26] | 0.14 [1.18] | 0.80 [1.26] | 0.81 [1.33] |
| presenter_bgraToRGBA | 2.10 [2.16] | 3.14 [3.17] | 12.01 [12.34] | 12.72 [12.89] |
| candidate_u32_opaque_fast_path | 1.47 [2.45] | 1.29 [1.32] | 3.88 [3.95] | 5.16 [5.27] |
