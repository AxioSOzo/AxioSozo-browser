"""Entrypoint failure gates; these tests do not launch or simulate a browser."""
import os
from pathlib import Path
import re
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import dev
import browser_probe


class EntrypointGates(unittest.TestCase):
    def test_component_environment_does_not_inherit_daily_engine_switch(self):
        with patch.dict(os.environ, {"AXIOSOZO_ENGINE_SWITCHING": "1"}):
            self.assertEqual(dev.browser_environment()["AXIOSOZO_ENGINE_SWITCHING"], "0")

    def test_failed_build_does_not_test_stale_binary(self):
        with patch.object(dev, "run", return_value=0) as run, \
             patch.object(dev, "build_core", return_value=1), \
             patch.object(dev, "core_ready", return_value=True), \
             patch.object(dev, "component", return_value=0):
            self.assertEqual(dev.test(), 1)
        commands = [list(map(str, call.args[0])) for call in run.call_args_list]
        self.assertFalse(any("unittest" in command for command in commands))
        self.assertFalse(any(any("coordinator.test.mjs" in arg for arg in command) for command in commands))

    def test_failed_e0_never_launches_zen_inspection(self):
        with patch.object(dev, "component", return_value=2) as component, \
             patch.object(dev, "core_ready") as ready, \
             patch.object(dev.storage, "ensure") as ensure:
            self.assertEqual(dev.browser_probe("engine-probe"), 2)
        component.assert_called_once_with(dev.CEF, "run")
        ready.assert_not_called()
        ensure.assert_not_called()

    def test_web_probe_also_requires_actual_native_e0(self):
        with patch.object(dev, "component", return_value=2) as component, \
             patch.object(dev, "core_ready") as ready:
            self.assertEqual(dev.browser_probe("web-probe"), 2)
        component.assert_called_once_with(dev.CEF, "run")
        ready.assert_not_called()

    def test_missing_custom_zen_never_creates_probe_profile(self):
        with patch.object(dev, "component", side_effect=[0, 20]) as component, \
             patch.object(dev, "core_ready", return_value=True), \
             patch.object(dev.storage, "ensure") as ensure:
            self.assertEqual(dev.browser_probe("engine-probe"), 2)
        self.assertEqual(component.call_args_list[-1].args, (dev.ZEN, "ready"))
        ensure.assert_not_called()

    def test_fixture_session_name_matches_native_profile_guard(self):
        with tempfile.TemporaryDirectory(prefix="axiosozo-probe-test-") as temporary:
            root = Path(temporary)
            (root / "docs/evidence").mkdir(parents=True)
            evidence = browser_probe.new_evidence_directory(root, "smoke")
            self.assertRegex(evidence.name, re.compile(r"^smoke-[a-f0-9]{16}$"))
            self.assertTrue(evidence.is_dir())

    def test_cef_profile_audit_ignores_links_and_unrelated_directories(self):
        with tempfile.TemporaryDirectory(prefix="axiosozo-profile-audit-") as temporary:
            root = Path(temporary)
            owned = root / "cef-01234567-89ab-cdef-0123-456789abcdef"
            owned.mkdir()
            outside = root / "outside"
            outside.mkdir()
            os.symlink(outside, root / "cef-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee")
            (root / "cef-invalid").mkdir()
            self.assertEqual(browser_probe.cef_profile_names(root), {owned.name})
            os.symlink(root, root / "linked-root")
            self.assertEqual(browser_probe.cef_profile_names(root / "linked-root"), set())


if __name__ == "__main__":
    unittest.main(verbosity=2)
