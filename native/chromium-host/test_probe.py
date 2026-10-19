#!/usr/bin/env python3
"""Lifecycle unit tests; these do not claim a Chromium render or E1 result."""
import importlib.util
import io
from email.message import Message
from types import SimpleNamespace
import os
from pathlib import Path
import plistlib
import signal
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('probe', Path(__file__).with_name('probe.py'))
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


class LifecycleTests(unittest.TestCase):
    def test_cleanup_includes_descendant_after_parent_exit(self):
        # A controlled process fixture, not a provider client or engine mock.
        source = '''import os,time,signal,sys
child=os.fork()
if child==0:
    signal.signal(signal.SIGTERM,signal.SIG_DFL)
    time.sleep(90)
else:
    print(child,flush=True)
'''
        process = subprocess.Popen([sys.executable, '-c', source], stdout=subprocess.PIPE,
                                   text=True, start_new_session=True)
        try:
            child = int(process.stdout.readline())
            process.wait(timeout=8)
            self.assertTrue(probe.cleanup_group(process))
            deadline = time.monotonic() + 3
            while time.monotonic() < deadline:
                try:
                    os.kill(child, 0)
                except ProcessLookupError:
                    break
                time.sleep(.1)
            else:
                self.fail('owned descendant remained after group cleanup')
        finally:
            probe.cleanup_group(process)
            process.stdout.close()

    def test_sigterm_routes_through_owned_cleanup(self):
        with tempfile.TemporaryDirectory(prefix='axio-cef-lifecycle-') as directory:
            root = Path(directory)
            (root / 'evidence').mkdir()
            ready = root / 'ready.pid'
            fixture = root / 'fixture-host'
            fixture.write_text('#!' + sys.executable + '\nimport os,time\n'
                               + 'open(' + repr(str(ready)) + ", 'w').write(str(os.getpid()))\n"
                               + 'time.sleep(90)\n')
            fixture.chmod(0o700)
            harness = ('import importlib.util,sys;from pathlib import Path;'
                       + 's=importlib.util.spec_from_file_location("p",' + repr(str(Path(probe.__file__))) + ');'
                       + 'p=importlib.util.module_from_spec(s);s.loader.exec_module(p);'
                       + 'p.check=lambda:None;'
                       # This test checks SIGTERM ownership, not HTTP or rendering.
                       # A no-network server fixture avoids requiring bind rights.
                       + 'p.http.server.ThreadingHTTPServer=lambda *_:type("ControlledNoNetworkFixtureServer",(),'
                       + '{"server_port":1,"serve_forever":lambda self:None,"shutdown":lambda self:None,"server_close":lambda self:None})();'
                       + 'p.BASE=Path(' + repr(str(root)) + ');'
                       + 'p.EVIDENCE=Path(' + repr(str(root / 'evidence')) + ');'
                       + 'p.BINARY=Path(' + repr(str(fixture)) + ');sys.exit(p.run())')
            process = subprocess.Popen([sys.executable, '-c', harness], stdout=subprocess.PIPE,
                                       stderr=subprocess.PIPE, text=True, start_new_session=True)
            try:
                deadline = time.monotonic() + 20
                while not ready.exists() and time.monotonic() < deadline:
                    time.sleep(.05)
                if not ready.exists():
                    probe.cleanup_group(process)
                    out, err = process.communicate(timeout=5)
                    self.fail('controlled fixture did not start: ' + repr((out, err)))
                native_pid = int(ready.read_text())
                process.send_signal(signal.SIGTERM)
                out, err = process.communicate(timeout=12)
                self.assertEqual(process.returncode, 130, (out, err))
                with self.assertRaises(ProcessLookupError):
                    os.kill(native_pid, 0)
            finally:
                probe.cleanup_group(process)

    def test_cleanup_has_no_global_process_lookup(self):
        self.assertFalse(probe.cleanup_group(None))

    @unittest.skipUnless(sys.platform == 'darwin', 'macOS recipe fingerprint queries xcrun clang++')
    def test_runner_changes_do_not_invalidate_native_recipe(self):
        first = probe.fingerprint()
        original = probe.run
        probe.run = lambda: None
        try:
            self.assertEqual(first, probe.fingerprint())
        finally:
            probe.run = original


class FixtureBoundaryTests(unittest.TestCase):
    def request(self, method, path, hosts):
        handler = probe.FixtureHandler.__new__(probe.FixtureHandler)
        handler.server = SimpleNamespace(server_port=41231)
        handler.command, handler.path = method, path
        handler.headers = Message()
        for host in hosts:
            handler.headers['Host'] = host
        handler.wfile = io.BytesIO()
        statuses = []
        handler.send_error = statuses.append
        handler.send_response = statuses.append
        handler.send_header = lambda *_: None
        handler.end_headers = lambda: None
        getattr(handler, 'do_' + method)()
        return statuses, handler.wfile.getvalue()

    def test_only_exact_synthetic_get_is_served(self):
        for path in ['/engine.html', '/engine.html?page=2']:
            status, body = self.request('GET', path, ['127.0.0.1:41231'])
            self.assertEqual(status, [200])
            self.assertIn(b'SYNTHETIC LOCAL ENGINE FIXTURE', body)
        for path in ['/', '/../README.md', 'http://127.0.0.1:41231/engine.html', '/engine.html?secret=x']:
            self.assertEqual(self.request('GET', path, ['127.0.0.1:41231']), ([404], b''))

    def test_host_and_other_methods_fail_closed(self):
        for hosts in [[], ['localhost:41231'], ['evil.test'], ['127.0.0.1:41231', '127.0.0.1:41231']]:
            self.assertEqual(self.request('GET', '/engine.html', hosts), ([403], b''))
        for method in ['HEAD', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'TRACE']:
            self.assertEqual(self.request(method, '/engine.html', ['127.0.0.1:41231']), ([405], b''))


LISTING = '''  1) B15DFA306504B61B9183D8A6A2F78D4D1541BC12 "AxioSozo Local Development"
  2) BD7F9BB12BC200E1068A2D8F6E039B24CF393ACA "Duplicate Name"
  3) 071289FDD0379CE9F537CA251A4F87C962D2FD5D "Duplicate Name"
     3 valid identities found
'''
HASH = 'B15DFA306504B61B9183D8A6A2F78D4D1541BC12'


class SigningIdentityTests(unittest.TestCase):
    def runner(self, valid, every=''):
        def run(command, **_):
            return SimpleNamespace(stdout=valid if '-v' in command else every)
        return run

    def test_parse_identities_ignores_summary_and_dedupes(self):
        self.assertEqual(probe.parse_identities(LISTING + LISTING.splitlines()[0]),
                         [(HASH, 'AxioSozo Local Development'),
                          ('BD7F9BB12BC200E1068A2D8F6E039B24CF393ACA', 'Duplicate Name'),
                          ('071289FDD0379CE9F537CA251A4F87C962D2FD5D', 'Duplicate Name')])
        self.assertEqual(probe.parse_identities('     0 valid identities found\n'), [])

    def test_resolve_by_name_and_case_insensitive_hash(self):
        self.assertEqual(probe.resolve_identity('AxioSozo Local Development', LISTING),
                         (HASH, 'AxioSozo Local Development'))
        self.assertEqual(probe.resolve_identity(HASH.lower(), LISTING)[0], HASH)

    def test_resolve_rejects_empty_missing_ambiguous_and_untrusted(self):
        for spec in ['', '   ', None]:
            with self.assertRaisesRegex(RuntimeError, 'empty'):
                probe.resolve_identity(spec, LISTING)
        with self.assertRaisesRegex(RuntimeError, 'no valid code-signing identity'):
            probe.resolve_identity('Nope', LISTING)
        with self.assertRaisesRegex(RuntimeError, 'several identities'):
            probe.resolve_identity('Duplicate Name', LISTING)
        with self.assertRaisesRegex(RuntimeError, 'not valid for code signing'):
            probe.resolve_identity('Untrusted', '', '  1) ' + 'A' * 40 + ' "Untrusted" (CSSMERR_TP_NOT_TRUSTED)\n')

    def test_current_signing_modes(self):
        self.assertEqual(probe.current_signing({}, self.runner(LISTING))['mode'], 'adhoc')
        got = probe.current_signing({probe.IDENTITY_ENV: 'AxioSozo Local Development'}, self.runner(LISTING))
        self.assertEqual((got['mode'], got['identity']), ('identity', HASH))
        with self.assertRaises(RuntimeError):
            probe.current_signing({probe.IDENTITY_ENV: 'Nope'}, self.runner(LISTING))

    def test_current_signing_uses_read_only_security_query(self):
        calls = []
        def run(command, **_):
            calls.append(command)
            return SimpleNamespace(stdout=LISTING)
        probe.current_signing({probe.IDENTITY_ENV: HASH}, run)
        self.assertEqual(calls, [['/usr/bin/security', 'find-identity', '-v', '-p', 'codesigning']])

    def test_adhoc_command_is_unchanged(self):
        adhoc = dict(mode='adhoc', identity=None, name=None)
        self.assertEqual(probe.sign_command('/x.app', adhoc, 'id'),
                         ['codesign', '--force', '--sign', '-', '/x.app'])

    def test_identity_command_uses_hash_no_timestamp_and_stable_requirement(self):
        identity = dict(mode='identity', identity=HASH, name='n')
        command = probe.sign_command('/x.app', identity, 'dev.axiosozo.cef-probe')
        self.assertEqual(command[:5], ['codesign', '--force', '--sign', HASH, '--timestamp=none'])
        self.assertEqual(command[-1], '/x.app')
        self.assertEqual(command[5], '-r=designated => identifier "dev.axiosozo.cef-probe" '
                         'and certificate leaf = H"' + HASH.lower() + '"')
        self.assertEqual(probe.sign_command('/lib.dylib', identity),
                         ['codesign', '--force', '--sign', HASH, '--timestamp=none', '/lib.dylib'])

    @unittest.skipUnless(sys.platform == 'darwin', 'macOS recipe fingerprint queries xcrun clang++')
    def test_fingerprint_changes_with_identity_only(self):
        adhoc = dict(mode='adhoc', identity=None, name=None)
        one = dict(mode='identity', identity=HASH, name='n')
        two = dict(mode='identity', identity='0' * 40, name='n')
        prints = {probe.fingerprint(item) for item in (adhoc, one, two)}
        self.assertEqual(len(prints), 3)
        self.assertEqual(probe.fingerprint(one), probe.fingerprint(dict(one, name='renamed')))


class HostCheckTests(unittest.TestCase):
    """Mocked OS metadata only; no real hdiutil/diskutil query or volume."""
    def check(self, image_path, disk):
        image = {'images': [{'image-path': image_path,
                             'system-entities': [{'mount-point': str(probe.BUILD_ROOT)}]}]}
        def check_output(argv, **_kwargs):
            return plistlib.dumps(image if Path(argv[0]).name == 'hdiutil' else disk)
        with patch.object(probe.platform, 'system', return_value='Darwin'), \
             patch.object(probe.platform, 'machine', return_value='arm64'), \
             patch.object(Path, 'is_mount', return_value=True), \
             patch.object(probe.shutil, 'which', return_value='/usr/bin/xcrun'), \
             patch.object(probe.subprocess, 'check_output', side_effect=check_output):
            probe.host_check()

    def test_only_the_build_volume_of_the_dev_image_passes(self):
        good = {'VolumeName': 'AxioSozoBuild', 'MountPoint': str(probe.BUILD_ROOT), 'FilesystemType': 'apfs'}
        self.check('/Volumes/T9/Dev.sparsebundle', good)
        for image_path, disk in (('/Volumes/T9/AxioSozoBuild.sparsebundle', good),
                                 ('/Volumes/T9/Dev.sparsebundle', dict(good, VolumeName='DevStorage')),
                                 ('/Volumes/T9/Dev.sparsebundle', dict(good, VolumeName='AxioSozo')),
                                 ('/Volumes/T9/Dev.sparsebundle', dict(good, FilesystemType='exfat')),
                                 ('/Volumes/T9/Dev.sparsebundle', dict(good, MountPoint='/Volumes/Other'))):
            with self.assertRaisesRegex(RuntimeError, 'BLOCKED_ENV'):
                self.check(image_path, disk)


class LinuxPortTests(unittest.TestCase):
    """Platform-independent checks of the Linux additions (no download, no CEF run)."""
    def test_linux_pins_match_lockfile(self):
        import json
        platforms = json.loads((probe.ROOT / 'upstreams.lock.json').read_text())['cef']['platforms']
        for arch, pin in probe.LINUX_PINS.items():
            entry = platforms[arch]
            self.assertEqual((entry['sha256'], entry['sha1'], entry['bytes']), (pin['sha256'], pin['sha1'], pin['bytes']))
            self.assertEqual(entry['distribution'], arch + '_minimal')
            self.assertTrue(entry['url'].endswith(f'cef_binary_{probe.VERSION.replace("+", "%2B")}_{arch}_minimal.tar.bz2'))
        # The macOS pin keeps its historical top-level fields; the platform table repeats them.
        lock = json.loads((probe.ROOT / 'upstreams.lock.json').read_text())['cef']
        self.assertEqual(platforms['macosarm64']['sha256'], lock['sha256'])

    def test_host_environment_is_minimal(self):
        base = {'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'TMPDIR': '/owned/profile'}
        noisy = {'DISPLAY': ':99', 'XAUTHORITY': '/tmp/x', 'DBUS_SESSION_BUS_ADDRESS': 'unix:path=/run/bus',
                 'HOME': '/home/someone', 'SSH_AUTH_SOCK': '/tmp/agent', 'WAYLAND_DISPLAY': 'wayland-0'}
        with patch.object(probe, 'IS_LINUX', False), patch.dict(os.environ, noisy):
            self.assertEqual(probe.host_environment('/owned/profile'), base)
        with patch.object(probe, 'IS_LINUX', True), patch.dict(os.environ, noisy):
            self.assertEqual(probe.host_environment('/owned/profile'),
                             dict(base, HOME='/owned/profile', DISPLAY=':99', XAUTHORITY='/tmp/x'))

    @unittest.skipUnless(sys.platform.startswith('linux'), 'reads /proc')
    def test_process_snapshot_of_a_plain_process(self):
        child = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(30)'])
        try:
            snapshot = probe.linux_process_snapshot(child.pid)
            self.assertEqual(snapshot['processes'][0]['type'], 'browser')
            self.assertEqual(snapshot['renderers'], 0)
            self.assertEqual(snapshot['layer1'], 'none')
        finally:
            child.kill()
            child.wait()


if __name__ == '__main__':
    unittest.main()
