"""The Chromium GUI-harness plug-in (scripts/gui_engines/chromium.py) with a fake
harness: no browser, CEF host, display or Marionette is started."""
from pathlib import Path
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import gui_engines  # noqa: E402
from gui_engines import EngineUnavailable  # noqa: E402
from gui_engines import chromium  # noqa: E402


class FakeHarness:
    def __init__(self, states):
        self.states = list(states)
        self.result = {'session': '/build/runtime/0123456789abcdef/gui-0123456789abcdef'}
        self.fixture = type('Fixture', (), {'origin': 'http://127.0.0.1:43210'})()

    def chrome_script(self, script, args=()):
        return self.states.pop(0) if len(self.states) > 1 else self.states[0]

    def wait(self, probe, description, timeout=None):
        for _ in range(len(self.states) + 1):
            value = probe()
            if value:
                return value
        raise AssertionError('timed out waiting for ' + description)


def state(**changes):
    native = {'engine': 'chromium', 'frames': 3, 'renderPath': 'native-osr-bgra', 'pipeFallback': True,
              'firstFrameMilliseconds': 120, 'meanDrawMilliseconds': 4, 'uploadedPixelShare': 0.4,
              'surface': {'width': 900, 'height': 650, 'device_scale': 1}, 'target': {'tab_id': 't'}}
    value = {'pending': False, 'failure': None, 'activeEngine': 'chromium', 'browsingMode': 'fixture',
             'native': native, 'tabLabel': 'AxioSozo fixture | count=0', 'tabEngine': 'chromium',
             'geckoBrowserHidden': True, 'geckoURL': 'about:blank'}
    native.update(changes.pop('native', {}))
    value.update(changes)
    return value


class ChromiumPlugin(unittest.TestCase):
    def test_registered_with_owner(self):
        self.assertIs(gui_engines.engines()['chromium'], chromium.ENGINE)
        self.assertEqual(chromium.ENGINE.owner, 'cloud/linux-cef')

    def test_environment_is_fixture_mode_bound_to_the_harness(self):
        with patch.object(chromium.storage, 'BUILD_ROOT', Path('/build')):
            env = chromium.ENGINE.browser_environment(FakeHarness([None]))
        self.assertEqual(env, {'AXIOSOZO_ENGINE_PROBE': '1', 'AXIOSOZO_ENGINE_FIXTURE_ORIGIN': 'http://127.0.0.1:43210',
                               'AXIOSOZO_CEF_ROOT': '/build', 'AXIOSOZO_CEF_BINARY': '/build/cef/linux/AxioCEFProbe',
                               'AXIOSOZO_SESSION_RUNTIME': '/build/runtime/0123456789abcdef/gui-0123456789abcdef'})
        self.assertNotIn('AXIOSOZO_ENGINE_SWITCHING', env)

    def test_unbuilt_host_is_blocked_env(self):
        with tempfile.TemporaryDirectory() as root, patch.object(chromium.storage, 'BUILD_ROOT', Path(root)):
            with self.assertRaisesRegex(EngineUnavailable, 'CEF host not built'):
                chromium.ENGINE.prepare(FakeHarness([None]))

    def test_rendered_only_from_engine_reported_state(self):
        harness = FakeHarness([state(native={'frames': 0}), state(pending=True), state()])
        evidence = chromium.ENGINE.assert_rendered(harness, 'AxioSozo fixture')
        self.assertEqual((evidence['engine'], evidence['frames'], evidence['title']), ('chromium', 3, 'AxioSozo fixture | count=0'))

    def test_gecko_still_visible_or_wrong_render_path_fails(self):
        for bad in (state(geckoBrowserHidden=False), state(native={'renderPath': 'native-osr-iosurface', 'pipeFallback': False}),
                    state(failure='CEF_PROBE_FAILED')):
            with self.assertRaises(AssertionError):
                chromium.ENGINE.assert_rendered(FakeHarness([bad]), 'AxioSozo fixture')

    def test_title_must_come_from_the_engine(self):
        with self.assertRaises(AssertionError):
            chromium.ENGINE.assert_rendered(FakeHarness([state(tabLabel='New Tab')]), 'AxioSozo fixture')


if __name__ == '__main__':
    unittest.main()
