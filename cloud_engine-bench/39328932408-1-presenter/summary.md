# Engine bench summary — run 39328932408

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.39

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.66 [4.42] | 1.30 [3.66] |
| presenter_bgraToRGBA | 1.85 [3.57] | 7.33 [7.93] |
| candidate_u32_fast_path | 0.83 [1.91] | 4.73 [6.77] |
| putImageData_full | 0.04 [0.05] | 0.17 [0.19] |
| presenter_draw_full | 1.81 [2.35] | 7.74 [9.55] |
| candidate_damage10_fast_put | 0.17 [3.01] | 0.43 [0.89] |
| candidate_createImageBitmap | 2.23 [4.96] | 7.16 [10.34] |
| candidate_webgl_full | 2.04 [4.61] | 7.60 [9.94] |
| candidate_webgl_damage10 | 1.95 [3.18] | 7.50 [9.48] |

## Presenter pixel path — firefox Mozilla Firefox 157.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.32 [1.70] | 1.42 [4.06] |
| presenter_bgraToRGBA | 1.04 [1.86] | 4.60 [7.42] |
| candidate_u32_fast_path | 0.70 [1.00] | 2.82 [4.36] |
| putImageData_full | 0.08 [0.10] | 0.30 [0.32] |
| presenter_draw_full | 1.30 [2.06] | 4.26 [4.62] |
| candidate_damage10_fast_put | 0.18 [0.22] | 0.62 [0.74] |
| candidate_createImageBitmap | 2.86 [3.76] | 6.92 [8.02] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.08 [1.03] | 0.07 [0.67] | 0.47 [1.27] | 0.51 [0.79] |
| presenter_bgraToRGBA | 1.10 [1.13] | 1.54 [1.56] | 5.74 [5.94] | 6.05 [6.26] |
| candidate_u32_opaque_fast_path | 0.80 [0.82] | 0.71 [0.72] | 2.03 [2.05] | 2.88 [2.92] |
