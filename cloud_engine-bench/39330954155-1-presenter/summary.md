# Engine bench summary — run 39330954155

Component benchmark over the AXCF pipe (tools/engine-bench). Median over repetitions, [p95]. Never Zen E1/E2 evidence. GitHub-hosted runners have no GPU: every engine renders in software.


## Presenter pixel path — chromium Google Chrome 155.0.8059.84

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.93 [1.11] | 3.88 [4.96] |
| presenter_bgraToRGBA | 2.95 [4.49] | 5.80 [5.93] |
| candidate_u32_fast_path | 0.67 [0.70] | 2.65 [2.79] |
| putImageData_full | 0.06 [0.07] | 0.20 [0.26] |
| presenter_draw_full | 1.51 [1.58] | 6.25 [13.27] |
| candidate_damage10_fast_put | 0.18 [0.21] | 0.74 [1.12] |
| candidate_createImageBitmap | 2.57 [2.81] | 10.57 [12.97] |
| candidate_webgl_full | 3.67 [5.96] | 10.60 [12.44] |
| candidate_webgl_damage10 | 2.96 [6.28] | 9.42 [10.95] |

## Presenter pixel path — firefox Mozilla Firefox 158.0

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs`; WebGL renderer: None

| Step | 900×650 | 1800×1300 |
| --- | --- | --- |
| alloc_copy | 0.86 [1.22] | 3.58 [6.96] |
| presenter_bgraToRGBA | 1.64 [3.26] | 7.00 [13.40] |
| candidate_u32_fast_path | 0.84 [1.22] | 3.30 [3.76] |
| putImageData_full | 0.14 [0.16] | 0.36 [0.38] |
| presenter_draw_full | 1.72 [3.32] | 6.86 [8.48] |
| candidate_damage10_fast_put | 0.24 [0.34] | 0.80 [0.86] |
| candidate_createImageBitmap | 4.52 [6.06] | 17.70 [22.98] |

## Presenter pixel path — v8 v22.23.3

Status PASS; ms per frame, median [p95]; source `apps/browser/chrome/CEFPresenter.sys.mjs bgraToRGBA (imported)`

| Step | 900×650 | 900×650 (10% translucent) | 1800×1300 | 1800×1300 (10% translucent) |
| --- | --- | --- | --- | --- |
| copy | 0.12 [1.07] | 0.12 [1.04] | 0.71 [4.21] | 0.74 [4.32] |
| presenter_bgraToRGBA | 1.62 [1.73] | 2.44 [2.55] | 9.34 [9.43] | 9.88 [10.05] |
| candidate_u32_opaque_fast_path | 1.12 [1.17] | 1.01 [1.04] | 3.01 [4.50] | 4.04 [4.11] |
