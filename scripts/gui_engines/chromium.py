"""Chromium (CEF host) plug-in; owned by the cloud/linux-cef workstream.

The fixture first loads in a normal Zen/Gecko tab. The gated development facade
(`window.AxioSozo.engineProbe`, fixture mode: AXIOSOZO_ENGINE_PROBE=1 plus the exact
fixture origin) then switches that tab to Chromium:
- the page renders in the out-of-process, sandboxed CEF host
  (native/chromium-host, AXCF BGRA pipe on Linux);
- Zen's CEFPresenter draws it inside its own content area;
- the Gecko browser of the tab is hidden.

Rendering is asserted only from engine-reported state: the presenter's frame
counter and render path, and the tab title set from the host's title events. The
harness screenshot is the pixel evidence. Gecko's DOM is never used for this.

The host must be built in the same build root first:
`python3 native/chromium-host/probe.py setup` and, where unprivileged user
namespaces are blocked, `probe.py install-sandbox`. Without it every scenario
reports BLOCKED_ENV.

Not covered: the harness `input` scenario. It locates targets through Gecko's
content DOM, which a Chromium tab does not have.
"""
import os
from pathlib import Path
import subprocess
import sys

import storage
from . import EngineUnavailable, GuiEngine

ROOT = Path(__file__).resolve().parents[2]

ENGINE_STATE = """
const probe = window.AxioSozo?.engineProbe;
if (!probe) return null;
const diagnostics = probe.diagnostics();
const tab = gBrowser.selectedTab, browser = tab?.linkedBrowser;
return {pending: diagnostics.pending, failure: diagnostics.failure, activeEngine: diagnostics.activeEngine,
        browsingMode: diagnostics.browsingMode, native: diagnostics.native,
        tabLabel: tab?.label ?? null, tabEngine: probe.engineOf(tab),
        geckoBrowserHidden: browser?.style?.visibility === 'hidden',
        geckoURL: browser?.currentURI?.spec ?? null};
"""


class ChromiumEngine(GuiEngine):
    name = 'chromium'
    owner = 'cloud/linux-cef'

    def binary(self):
        # probe.py setup's architecture-neutral runtime alias (<build root>/cef/linux).
        return storage.BUILD_ROOT / 'cef' / 'linux' / 'AxioCEFProbe'

    def browser_environment(self, harness):
        root = str(storage.BUILD_ROOT)
        return {
            # Fixture mode of the development facade: one strict host per tab, bound
            # to the harness's loopback fixture origin (contracts/cef-v1.md).
            'AXIOSOZO_ENGINE_PROBE': '1',
            'AXIOSOZO_ENGINE_FIXTURE_ORIGIN': harness.fixture.origin,
            'AXIOSOZO_CEF_ROOT': root,
            'AXIOSOZO_CEF_BINARY': str(self.binary()),
            # The owned session whose gecko/ directory is the harness profile.
            'AXIOSOZO_SESSION_RUNTIME': harness.result['session'],
        }

    def prepare(self, harness):
        if not self.binary().is_file():
            raise EngineUnavailable('CEF host not built in ' + str(storage.BUILD_ROOT)
                                    + ': run python3 native/chromium-host/probe.py setup')
        check = subprocess.run([sys.executable, str(ROOT / 'native/chromium-host/probe.py'), 'check'],
                               capture_output=True, text=True, timeout=120,
                               env={**os.environ, 'AXIOSOZO_BUILD_ROOT': str(storage.BUILD_ROOT)})
        harness.result['cef_check'] = (check.stdout.strip().splitlines() or [''])[-1][:2000]
        if check.returncode:
            raise EngineUnavailable('probe.py check: ' + (check.stdout + check.stderr).strip()[-600:])
        state = harness.wait(lambda: harness.chrome_script(ENGINE_STATE), 'window.AxioSozo.engineProbe (fixture mode)',
                             timeout=30)
        if state['browsingMode'] != 'fixture':
            raise EngineUnavailable('engine probe is not in fixture mode: ' + repr(state))

    def show(self, harness, url):
        handle = harness.open_tab(url)
        # The Gecko tab must hold the exact fixture URL before the switch is admitted.
        harness.wait(lambda: harness.chrome_script(
            'return gBrowser.selectedBrowser.currentURI.spec === arguments[0]'
            ' && (gBrowser.selectedBrowser.contentTitle || "").startsWith("AxioSozo fixture");', [url]),
            'the fixture loaded in the Gecko tab before switching')
        switched = harness.chrome_script(
            'return window.AxioSozo.engineProbe.switchToChromium().then('
            ' target => ({ok: true, target}),'
            ' error => ({ok: false, error: String(error?.message ?? error)}));')
        if not switched or not switched.get('ok'):
            raise AssertionError('switch to Chromium failed: ' + repr(switched))
        return {'window_handle': handle, 'switched': switched, 'state': harness.chrome_script(ENGINE_STATE)}

    def content_title(self, harness):
        # The tab label follows the host's `title` events while Chromium presents the tab.
        return harness.chrome_script('return gBrowser.selectedTab.label;')

    def assert_rendered(self, harness, expected_title_prefix):
        def rendered():
            state = harness.chrome_script(ENGINE_STATE)
            native = (state or {}).get('native') or {}
            ready = (state and not state['pending'] and state['tabEngine'] == 'chromium'
                     and native.get('engine') == 'chromium' and (native.get('frames') or 0) >= 1
                     and str(state['tabLabel'] or '').startswith(expected_title_prefix))
            return state if ready else None
        state = harness.wait(rendered, 'Chromium frames presented in the Zen tab with title '
                             + repr(expected_title_prefix))
        native = state['native']
        if state['failure']:
            raise AssertionError('engine probe reported a failure: ' + repr(state['failure']))
        if native.get('renderPath') != 'native-osr-bgra' or native.get('pipeFallback') is not True:
            raise AssertionError('unexpected Linux render path: ' + repr(native))
        if not state['geckoBrowserHidden']:
            raise AssertionError('the Gecko browser is still visible behind Chromium: ' + repr(state))
        return {'engine': 'chromium', 'title': state['tabLabel'], 'frames': native.get('frames'),
                'firstFrameMilliseconds': native.get('firstFrameMilliseconds'),
                'meanDrawMilliseconds': native.get('meanDrawMilliseconds'),
                'uploadedPixelShare': native.get('uploadedPixelShare'), 'surface': native.get('surface'),
                'target': native.get('target'), 'geckoURL': state['geckoURL']}


ENGINE = ChromiumEngine()
