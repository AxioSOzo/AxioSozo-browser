# WebKit native-feel evidence (Linux)

Curated from linux-webkit-zen run 39376244911 (`ci-results:cloud_webkit-feel/39376244911-1-webkit-zen-e2e/feel/`,
all screenshots and logs there). `result.json` is that run's `scripts/webkit_feel_e2e.py` result: scenarios,
the gate matrix and the test-only switches. Real Zen app (build 39337785340) under Xvfb with software
WebRender, WPE WebKit 2.48.3 in bubblewrap, fixture page only. XUL popups (menus, the select popup)
capture black under SWGL; their items are asserted from the menu DOM.
