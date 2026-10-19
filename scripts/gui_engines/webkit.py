"""WebKit plug-in point; owned by the cloud/webkit-host workstream.

Implement `browser_environment`, `prepare`, `show`, `assert_rendered` and
`content_title` the same way as the Chromium plug-in describes, using the
WebKit host's own launcher and engine-reported state. Until then every
scenario that needs this engine reports BLOCKED_ENV.
"""
from . import GuiEngine


class WebKitEngine(GuiEngine):
    name = 'webkit'
    owner = 'cloud/webkit-host'


ENGINE = WebKitEngine()
