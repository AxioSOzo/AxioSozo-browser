"""scripts/linux_desktop.py: the .desktop entry and icons for an unpacked app,
written only under a temporary XDG_DATA_HOME. No real desktop is touched."""
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import linux_desktop  # noqa: E402


class LinuxDesktop(unittest.TestCase):
    def setUp(self):
        self.temp = Path(tempfile.mkdtemp())
        self.addCleanup(shutil.rmtree, self.temp)
        self.app = self.temp / 'my apps' / 'axiosozo-dev'
        icons = self.app / 'browser/chrome/icons/default'
        icons.mkdir(parents=True)
        for size in (16, 32, 48, 128):
            (icons / f'default{size}.png').write_bytes(b'\x89PNG fake ' + str(size).encode())
        (icons / 'README').write_text('not an icon')
        self.executable = self.app / 'axiosozo-dev'
        self.executable.write_text('#!/bin/sh\n')
        self.executable.chmod(0o755)
        self.data = self.temp / 'data'
        patcher = patch.dict(os.environ, {'XDG_DATA_HOME': str(self.data)})
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_entry_matches_gecko_window_class_and_quotes_exec(self):
        entry = linux_desktop.render(self.executable)
        self.assertIn('StartupWMClass=AxioSozoDev\n', entry)
        self.assertEqual(linux_desktop.DESKTOP_FILE, 'AxioSozoDev.desktop')
        self.assertIn(f'Exec="{self.executable}" %u\n', entry, 'a path with a space is quoted')
        self.assertIn('Categories=Network;WebBrowser;\n', entry)
        self.assertIn('x-scheme-handler/https;', entry)
        self.assertIn('[Desktop Action new-private-window]', entry)
        self.assertNotIn('NoDisplay', entry)
        if shutil.which('desktop-file-validate'):
            path = self.temp / linux_desktop.DESKTOP_FILE
            path.write_text(entry)
            run = subprocess.run(['desktop-file-validate', str(path)], capture_output=True, text=True)
            self.assertEqual(run.returncode, 0, run.stdout + run.stderr)

    def test_icons_are_the_bundle_sizes(self):
        self.assertEqual(sorted(linux_desktop.icon_sources(self.app)), [16, 32, 48, 128])
        self.assertEqual(linux_desktop.icon_sources(self.temp / 'missing'), {})

    def test_install_writes_only_under_xdg_data_home_and_uninstall_removes_it(self):
        dry = linux_desktop.install(self.executable, dry_run=True)
        self.assertFalse(self.data.exists(), 'dry run writes nothing')
        self.assertEqual(len(dry['written']), 5)
        result = linux_desktop.install(self.executable)
        for path in result['written']:
            self.assertTrue(Path(path).is_file())
            self.assertTrue(Path(path).resolve().is_relative_to(self.data.resolve()))
        self.assertEqual((self.data / 'icons/hicolor/48x48/apps/axiosozo-dev.png').read_bytes(), b'\x89PNG fake 48')
        removed = linux_desktop.uninstall()
        self.assertEqual(len(removed['removed']), 5)
        self.assertFalse((self.data / 'applications' / linux_desktop.DESKTOP_FILE).exists())

    def test_resolve_accepts_the_directory_or_the_executable(self):
        self.assertEqual(linux_desktop.resolve_executable(str(self.app)), self.executable.resolve())
        self.assertEqual(linux_desktop.resolve_executable(str(self.app.parent)), self.executable.resolve())
        self.assertEqual(linux_desktop.resolve_executable(str(self.executable)), self.executable.resolve())
        with self.assertRaises(SystemExit):
            linux_desktop.resolve_executable(str(self.temp / 'nothing'))


if __name__ == '__main__':
    unittest.main()
