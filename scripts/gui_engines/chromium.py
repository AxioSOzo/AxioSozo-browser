"""Chromium (CEF host) plug-in point; owned by the cloud/linux-cef workstream.

To implement on Linux: return the host binary in `browser_environment`
(AXIOSOZO_CEF_BINARY, AXIOSOZO_ENGINE_SWITCHING=1), then in `show` open the
fixture in a Gecko tab and switch that tab to Chromium through the privileged
chrome facade (`window.AxioSozo.engineProbe`, see docs/zen-notes.md) and wait
for presenter frames; `assert_rendered` must use engine-reported state (frame
counters, title from the host) plus the harness screenshot, never Gecko's DOM.
Until then every scenario that needs this engine reports BLOCKED_ENV.
"""
from . import GuiEngine


class ChromiumEngine(GuiEngine):
    name = 'chromium'
    owner = 'cloud/linux-cef'


ENGINE = ChromiumEngine()
