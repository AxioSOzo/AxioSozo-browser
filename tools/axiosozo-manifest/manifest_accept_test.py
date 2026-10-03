#!/usr/bin/env python3
"""Synthetic descriptor-bound acceptance checks in owned external fixtures only."""
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).with_name('manifest_accept.py')
spec = importlib.util.spec_from_file_location('manifest_accept', SOURCE)
writer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(writer)
FIXTURES = Path('/Volumes/AxioSozoBuild/workstation/manifest-accept-fixtures')
BASE = {'version': 2, 'name': 'Harbor Suite', 'kind': 'web', 'environments': [{'name': 'local', 'app': 'web', 'base_url': 'http://127.0.0.1:44123/'}], 'services': [], 'surfaces': []}


class AcceptanceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not Path('/Volumes/AxioSozoBuild').is_mount() or not FIXTURES.parent.is_dir():
            raise RuntimeError('EXTERNAL_WORKSTATION_FIXTURE_VOLUME_REQUIRED')
        FIXTURES.mkdir(mode=0o700, exist_ok=True)
        info = FIXTURES.lstat()
        if not stat.S_ISDIR(info.st_mode) or FIXTURES.resolve() != FIXTURES or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700:
            raise RuntimeError('FIXTURE_DIRECTORY_REFUSED')

    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='owned-', dir=FIXTURES)
        self.top = Path(self.temp.name)
        self.root = self.top / 'harbor-suite'
        self.root.mkdir(mode=0o700)
        self.outside = self.top / 'unrelated'
        self.outside.mkdir(mode=0o700)
        self.sentinel = self.outside / 'untouched.json'
        self.sentinel.write_bytes(b'synthetic-unrelated-sentinel\n')
        self.directory = self.root / '.axiosozo'
        self.target = self.directory / 'project.json'

    def tearDown(self):
        self.assertEqual(self.sentinel.read_bytes(), b'synthetic-unrelated-sentinel\n')
        self.temp.cleanup()

    def expected(self):
        value = writer.operation('snapshot', {'root': str(self.root)})
        return {k: value[k] for k in ('rootIdentity', 'directoryIdentity', 'target')}

    def put(self, value=BASE, mode=0o644):
        self.directory.mkdir(mode=0o700, exist_ok=True)
        self.target.write_text(json.dumps(value, indent=2) + '\n')
        self.target.chmod(mode)

    def refuse(self, expected, value=None, code=None, boundary=lambda _stage: None):
        with self.assertRaises(writer.Refused) as result:
            writer.accept(str(self.root), expected, value or copy.deepcopy(BASE), boundary)
        if code:
            self.assertEqual(result.exception.code, code)
        return result.exception

    def test_missing_manifest_creates_only_fixed_target(self):
        expected = self.expected()
        result = writer.accept(str(self.root), expected, copy.deepcopy(BASE))
        self.assertTrue(result['committed'])
        self.assertEqual(json.loads(self.target.read_text()), BASE)
        self.assertEqual(stat.S_IMODE(self.target.stat().st_mode), 0o600)
        self.assertEqual(list(self.directory.iterdir()), [self.target])
        self.assertEqual(result['digest'], hashlib.sha256(self.target.read_bytes()).hexdigest())

    def test_existing_name_kind_changes_preserve_all_other_fields_and_mode(self):
        self.put(mode=0o640)
        expected = self.expected()
        value = copy.deepcopy(BASE)
        value.update(name='Harbor Desktop', kind='desktop')
        writer.accept(str(self.root), expected, value)
        self.assertEqual(json.loads(self.target.read_text()), value)
        self.assertEqual(stat.S_IMODE(self.target.stat().st_mode), 0o640)

    def test_unknown_existing_field_preserved_by_refusal(self):
        value = {**BASE, 'future_field': {'keep': True}}
        self.put(value)
        before = self.target.read_bytes()
        with self.assertRaises(writer.Refused):
            self.expected()
        self.assertEqual(self.target.read_bytes(), before)
        self.assertEqual(list(self.directory.iterdir()), [self.target])

    def test_duplicate_json_keys_preserved_by_refusal(self):
        self.put()
        self.target.write_text('{"version":2,"version":1}')
        before = self.target.read_bytes()
        with self.assertRaises(writer.Refused):
            self.expected()
        self.assertEqual(self.target.read_bytes(), before)

    def test_manifest_symlink_refused_without_open(self):
        self.directory.mkdir(mode=0o700)
        self.target.symlink_to(self.sentinel)
        with patch.object(writer.os, 'read', side_effect=AssertionError('content must not be opened')):
            with self.assertRaises(writer.Refused):
                self.expected()
        self.assertTrue(self.target.is_symlink())

    def test_manifest_hardlink_refused(self):
        self.directory.mkdir(mode=0o700)
        os.link(self.sentinel, self.target)
        with self.assertRaises(writer.Refused):
            self.expected()
        self.assertEqual(self.target.stat().st_ino, self.sentinel.stat().st_ino)

    def test_fifo_refused_before_open(self):
        self.directory.mkdir(mode=0o700)
        os.mkfifo(self.target, 0o600)
        with self.assertRaises(writer.Refused):
            self.expected()

    def test_directory_symlink_refused(self):
        self.directory.symlink_to(self.outside)
        with self.assertRaises(writer.Refused):
            self.expected()
        self.assertEqual(list(self.outside.iterdir()), [self.sentinel])

    def test_root_symlink_refused(self):
        alias = self.top / 'alias'
        alias.symlink_to(self.root)
        with self.assertRaises(writer.Refused):
            writer.operation('snapshot', {'root': str(alias)})

    def test_owned_root_uid_refusal(self):
        original = writer.os.fstat
        def foreign(fd):
            info = original(fd)
            if info.st_ino == self.root.stat().st_ino:
                values = list(info)
                values[4] = info.st_uid + 1
                return os.stat_result(values)
            return info
        with patch.object(writer.os, 'fstat', side_effect=foreign):
            with self.assertRaises(writer.Refused):
                self.expected()
        self.assertFalse(self.directory.exists())

    def test_writable_directory_refused(self):
        self.put()
        self.directory.chmod(0o777)
        with self.assertRaises(writer.Refused):
            self.expected()
        self.directory.chmod(0o700)

    def test_existing_readonly_file_mode_preserved(self):
        self.put(mode=0o400)
        expected = self.expected()
        writer.accept(str(self.root), expected, {**BASE, 'name': 'Read-only Harbor'})
        self.assertEqual(stat.S_IMODE(self.target.stat().st_mode), 0o400)

    def test_stale_file_content_refuses_before_temp(self):
        self.put()
        expected = self.expected()
        self.target.write_text(json.dumps({**BASE, 'name': 'Concurrent edit'}))
        before = self.target.read_bytes()
        self.refuse(expected, code='MANIFEST_CHANGED')
        self.assertEqual(self.target.read_bytes(), before)
        self.assertEqual(list(self.directory.iterdir()), [self.target])

    def test_stale_absence_refuses_before_temp(self):
        expected = self.expected()
        self.put()
        self.refuse(expected, code='IDENTITY_CHANGED')
        self.assertEqual(list(self.directory.iterdir()), [self.target])

    def test_unconfirmed_environment_edit_refuses_before_temp(self):
        self.put()
        expected = self.expected()
        value = copy.deepcopy(BASE)
        value['environments'][0]['base_url'] = 'https://harbor.invalid/'
        self.refuse(expected, value, 'UNCONFIRMED_FIELDS')
        self.assertEqual(list(self.directory.iterdir()), [self.target])

    def test_invalid_and_secret_values_refuse_before_any_open(self):
        expected = self.expected()
        for value in ({**BASE, 'brief': {}}, {**BASE, 'name': 'sk-syntheticcredentials123456789'}, {**BASE, 'name': '/Users/invented/private'}):
            with patch.object(writer.os, 'open', side_effect=AssertionError('invalid request must refuse before I/O')):
                self.refuse(expected, value)

    def test_oversized_manifest_refuses_before_any_open(self):
        value = copy.deepcopy(BASE)
        value['surfaces'] = [{'name': 'Dashboard', 'kind': 'dashboard', 'url': 'https://harbor.invalid/' + 'x' * 1900} for _ in range(64)]
        expected = self.expected()
        with patch.object(writer.os, 'open', side_effect=AssertionError('size refusal before I/O')):
            self.refuse(expected, value, 'TOO_LARGE')

    def test_root_replaced_before_directory_mutation_no_writes_to_replacement(self):
        expected = self.expected()
        moved = self.top / 'old-root'
        def swap(stage):
            if stage == 'before_directory':
                self.root.rename(moved)
                self.root.mkdir(mode=0o700)
        self.refuse(expected, code='IDENTITY_CHANGED', boundary=swap)
        self.assertFalse((self.root / '.axiosozo').exists())
        self.assertFalse((moved / '.axiosozo').exists())

    def test_directory_swap_before_temp_refused_without_new_target(self):
        self.put()
        expected = self.expected()
        moved = self.root / 'old-axiosozo'
        def swap(stage):
            if stage == 'before_temp':
                self.directory.rename(moved)
                self.directory.symlink_to(self.outside)
        self.refuse(expected, boundary=swap)
        self.assertEqual(list(moved.iterdir()), [moved / 'project.json'])
        self.assertEqual(list(self.outside.iterdir()), [self.sentinel])

    def test_directory_swap_before_commit_cleans_owned_temp_only(self):
        self.put()
        expected = self.expected()
        moved = self.root / 'old-axiosozo'
        def swap(stage):
            if stage == 'before_commit':
                self.directory.rename(moved)
                self.directory.symlink_to(self.outside)
        self.refuse(expected, boundary=swap)
        self.assertEqual(list(moved.iterdir()), [moved / 'project.json'])
        self.assertEqual(list(self.outside.iterdir()), [self.sentinel])

    def test_target_swap_before_commit_preserved(self):
        self.put()
        expected = self.expected()
        def swap(stage):
            if stage == 'before_commit':
                self.target.unlink()
                self.target.symlink_to(self.sentinel)
        self.refuse(expected, boundary=swap)
        self.assertTrue(self.target.is_symlink())
        self.assertEqual(len(list(self.directory.iterdir())), 1)

    def test_unrelated_file_and_temp_name_collision_preserved(self):
        self.put()
        unrelated = self.directory / 'unknown.future'
        unrelated.write_bytes(b'keep invented future metadata')
        collision = self.directory / ('.project.json.' + 'a' * 32 + '.tmp')
        collision.write_bytes(b'pre-existing unrelated file')
        with patch.object(writer.secrets, 'token_hex', return_value='a' * 32):
            with self.assertRaises(FileExistsError):
                writer.accept(str(self.root), self.expected(), BASE)
        self.assertEqual(collision.read_bytes(), b'pre-existing unrelated file')
        self.assertEqual(unrelated.read_bytes(), b'keep invented future metadata')

    def test_foreign_temp_replacement_never_unlinked(self):
        self.put()
        expected = self.expected()
        def swap(stage):
            if stage == 'before_commit':
                temporary = next(p for p in self.directory.iterdir() if p.suffix == '.tmp')
                temporary.unlink()
                temporary.write_bytes(b'foreign replacement')
        self.refuse(expected, code='IDENTITY_CHANGED', boundary=swap)
        temporaries = [p for p in self.directory.iterdir() if p.suffix == '.tmp']
        self.assertEqual(len(temporaries), 1)
        self.assertEqual(temporaries[0].read_bytes(), b'foreign replacement')

    def test_temp_hardlink_before_commit_refuses_before_publication(self):
        self.put()
        before = self.target.read_bytes()
        expected = self.expected()
        def change(stage):
            if stage == 'before_commit':
                temporary = next(p for p in self.directory.iterdir() if p.suffix == '.tmp')
                os.link(temporary, self.outside / 'synthetic-temp-alias')
        self.refuse(expected, code='MANIFEST_REFUSED', boundary=change)
        self.assertEqual(self.target.read_bytes(), before)
        self.assertEqual(list(self.directory.iterdir()), [self.target])

    def test_temp_mode_change_before_commit_refuses_before_publication(self):
        self.put()
        before = self.target.read_bytes()
        expected = self.expected()
        def change(stage):
            if stage == 'before_commit':
                temporary = next(p for p in self.directory.iterdir() if p.suffix == '.tmp')
                temporary.chmod(0o666)
        self.refuse(expected, code='MANIFEST_REFUSED', boundary=change)
        self.assertEqual(self.target.read_bytes(), before)
        self.assertEqual(list(self.directory.iterdir()), [self.target])

    def test_post_commit_parent_swap_reports_uncertain_without_rollback(self):
        self.put()
        expected = self.expected()
        moved = self.root / 'old-axiosozo'
        def swap(stage):
            if stage == 'after_commit':
                self.directory.rename(moved)
                self.directory.symlink_to(self.outside)
        error = self.refuse(expected, {**BASE, 'name': 'Committed Harbor'}, 'WRITE_OUTCOME_UNKNOWN', swap)
        self.assertTrue(error.committed)
        self.assertEqual(json.loads((moved / 'project.json').read_text())['name'], 'Committed Harbor')

    def test_actual_fixed_cli_private_install_snapshot_and_accept(self):
        installed = self.top / 'installed'
        installed.mkdir(mode=0o700)
        helper = installed / 'manifest-accept.py'
        shutil.copyfile(SOURCE, helper)
        helper.chmod(0o400)
        args = [sys.executable, '-I', '-S', '-B', str(helper)]
        environment = {'PATH': '/usr/bin:/bin', 'LANG': 'C', 'LC_ALL': 'C'}
        run = lambda operation, payload: subprocess.run([*args, operation], input=json.dumps(payload), text=True, capture_output=True,
                                                       timeout=5, cwd='/', env=environment, check=True)
        before = run('snapshot', {'root': str(self.root)})
        self.assertEqual(before.stderr, '')
        answer = json.loads(before.stdout)
        self.assertTrue(answer['ok'])
        expected = {k: answer['result'][k] for k in ('rootIdentity', 'directoryIdentity', 'target')}
        result = json.loads(run('accept', {'root': str(self.root), 'expected': expected, 'manifest': BASE}).stdout)
        self.assertTrue(result['ok'])
        self.assertTrue(result['result']['committed'])
        self.assertEqual(json.loads(self.target.read_text()), BASE)

    def test_cli_untrusted_self_and_unknown_operation_refuse(self):
        installed = self.top / 'installed'
        installed.mkdir(mode=0o700)
        helper = installed / 'manifest-accept.py'
        shutil.copyfile(SOURCE, helper)
        helper.chmod(0o644)
        for operation in ('snapshot', 'arbitrary-write'):
            result = subprocess.run([sys.executable, '-I', '-S', '-B', str(helper), operation], input='{}', text=True,
                                    capture_output=True, timeout=5, cwd='/', env={'LANG': 'C', 'LC_ALL': 'C'}, check=True)
            answer = json.loads(result.stdout)
            self.assertFalse(answer['ok'])
            self.assertFalse(answer['committed'])
        self.assertFalse(self.directory.exists())


if __name__ == '__main__':
    unittest.main()
