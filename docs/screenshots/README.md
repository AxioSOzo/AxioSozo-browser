# Native app screenshots

Captured on the Apple Silicon Mac from the actual AxioSozo Dev app and synthetic
loopback fixture on 23 September 2026. The first five images are from final
Gecko smoke session `smoke-2061071c3d39a3b3`; the last image is the strictly
local CEF experiment `engine-probe-0ba0b8665fa2c8da`.

| View | Screenshot |
| --- | --- |
| Ordinary page, no provider selector | [01-ordinary-page.png](01-ordinary-page.png) |
| New-tabmodal above the retained page | [02-new-tab-modal.png](02-new-tab-modal.png) |
| Local saved result beside web search | [03-local-retrieval.png](03-local-retrieval.png) |
| Provider settings and verified metadata-only discovery | [04-provider-settings.png](04-provider-settings.png) |
| Explicit browser environment picker | [05-environment.png](05-environment.png) |
| Experimental local CEF fixture switch | [06-chromium-fixture-experimental.png](06-chromium-fixture-experimental.png) |

There is no compact-answer or expanded-help screenshot because those live
provider surfaces are blocked and have not been implemented. The CEF image is
not evidence of general Chromium support; the app accessibility state showed
Chromium 154.0.8037.17 during the fixture test and Gecko after returning.
