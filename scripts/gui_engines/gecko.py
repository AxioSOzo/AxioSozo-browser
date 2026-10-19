"""Gecko: the page renders in a normal Zen/Gecko tab (remote web content process)."""
from . import GuiEngine

TAB_STATE = """
const browser = gBrowser.selectedBrowser;
const global = browser.browsingContext?.currentWindowGlobal;
return {remote: browser.isRemoteBrowser, remoteType: browser.remoteType ?? null,
        url: browser.currentURI?.spec ?? null, documentURI: browser.documentURI?.spec ?? null,
        contentTitle: browser.contentTitle ?? null, contentPid: global?.osPid ?? null,
        // An engine tab (CEF/WebKit) would be presented by the AxioSozo engine
        // layer instead of this browser; the Gecko tab must be the visible one.
        hidden: browser.hidden ?? null, selected: gBrowser.selectedTab?.linkedBrowser === browser};
"""


class GeckoEngine(GuiEngine):
    name = 'gecko'
    owner = 'cloud/linux-platform'

    def show(self, harness, url):
        handle = harness.open_tab(url)
        return {'window_handle': handle, **harness.chrome_script(TAB_STATE)}

    def content_title(self, harness):
        return harness.chrome_script('return gBrowser.selectedBrowser.contentTitle;')

    def assert_rendered(self, harness, expected_title_prefix):
        title = harness.wait(lambda: (lambda value: value if value and value.startswith(expected_title_prefix) else None)(
            self.content_title(harness)), 'Gecko tab title starting with ' + repr(expected_title_prefix))
        tab = harness.chrome_script(TAB_STATE)
        page = harness.content_script("""
            const box = document.documentElement.getBoundingClientRect();
            return {title: document.title, readyState: document.readyState, url: location.href,
                    width: Math.round(box.width), height: Math.round(box.height),
                    text: (document.body?.innerText ?? '').slice(0, 160)};
        """)
        if not tab['remote'] or not str(tab['remoteType'] or '').startswith(('web', 'privilegedabout', 'file')):
            raise AssertionError('page is not in a Gecko content process: ' + repr(tab))
        if page['readyState'] != 'complete' or page['width'] <= 0 or page['height'] <= 0 or not page['text']:
            raise AssertionError('page did not render content: ' + repr(page))
        return {'title': title, 'tab': tab, 'page': page, 'engine': 'gecko'}


ENGINE = GeckoEngine()
