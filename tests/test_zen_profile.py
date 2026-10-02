"""Fake namespace admission and small owned marker files only; no app/profile launch."""
import argparse
import ast
import hashlib
import json
import os
import re
from pathlib import Path
import stat
import sys
import tempfile
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1] / 'scripts/zen.py'
FUNCTIONS = {'_legacy_run_profile', '_synthetic_directory_identity',
             '_read_synthetic_profile_marker', 'validate_run_profile'}
# Compile only these DOM-free validation functions; never import or execute
# Zen discovery, build hooks, application checks, or the launcher main.
source_tree = ast.parse(SOURCE.read_text())
selected = [node for node in source_tree.body if isinstance(node, ast.FunctionDef) and node.name in FUNCTIONS]
assert {node.name for node in selected} == FUNCTIONS
validator = ModuleType('zen_profile_validation_only')
validator.__dict__.update({'hashlib': hashlib, 'json': json, 'os': os,
                          'Path': Path, 're': re, 'stat': stat})
exec(compile(ast.Module(body=selected, type_ignores=[]), '<Zen validation functions only>', 'exec'), validator.__dict__)
ROOT = Path('/Volumes/T9/Code/AxioSozo-browser-workstation')
WORKSTATION = Path('/Volumes/AxioSozoBuild/workstation')
RUN_ID = '0123456789abcdef'
PROFILE = WORKSTATION / ('p4c-' + RUN_ID) / 'gecko'
ENV = {'AXIOSOZO_SYNTHETIC_TEST': '1', 'AXIOSOZO_AGENT_GUI': '1', 'AXIOSOZO_AGENT_GUI_RUN': RUN_ID}


def marker_record(**changes):
    return {'version': 1, 'kind': 'plan4-agent-gui', 'run_id': RUN_ID,
            'worktree_sha256': hashlib.sha256(str(ROOT).encode()).hexdigest(), **changes}


class NamespaceAdmission(unittest.TestCase):
    def setUp(self):
        validator.ROOT = ROOT
        validator.BUILD_ROOT = WORKSTATION

    def directory(self, path):
        return SimpleNamespace(st_mode=stat.S_IFDIR | 0o700, st_uid=501,
            st_dev=7, st_ino=1 if path == PROFILE.parent else 2)

    def synthetic(self, value=str(PROFILE), env=None, resolve=None, lstat=None):
        with patch.dict(os.environ, ENV if env is None else env, clear=True), \
             patch.object(Path, 'resolve', resolve or (lambda path, **kw: path)), \
             patch.object(Path, 'lstat', lstat or (lambda path: self.directory(path))), \
             patch.object(os, 'getuid', return_value=501), \
             patch.object(validator, '_read_synthetic_profile_marker') as marker:
            result = validator.validate_run_profile(value)
            marker.assert_called_once_with(PROFILE / '.axiosozo-dev-profile', RUN_ID, 501)
            return result

    def test_exact_short_profile_is_admitted(self):
        self.assertEqual(self.synthetic(), PROFILE)

    def test_each_environment_gate_is_required_before_metadata_read(self):
        for name in ENV:
            for value in (None, '', '0', '2'):
                with self.subTest(name=name, value=value):
                    env = dict(ENV)
                    if value is None:
                        env.pop(name)
                    else:
                        env[name] = value
                    with patch.dict(os.environ, env, clear=True), patch.object(Path, 'resolve') as resolve:
                        with self.assertRaisesRegex(RuntimeError, '^DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH$'):
                            validator.validate_run_profile(str(PROFILE))
                        resolve.assert_not_called()

    def test_wrong_build_root_is_refused_before_metadata(self):
        validator.BUILD_ROOT = Path('/Volumes/AxioSozoBuild/other')
        with patch.dict(os.environ, ENV, clear=True), patch.object(Path, 'resolve') as resolve:
            with self.assertRaisesRegex(RuntimeError, '^DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH$'):
                validator.validate_run_profile(str(PROFILE))
            resolve.assert_not_called()

    def test_run_id_and_exact_raw_spelling_are_required(self):
        for value in (str(PROFILE).replace(RUN_ID, 'fedcba9876543210'), str(PROFILE).replace('/p4c-', '//p4c-'),
                      str(PROFILE).replace('/p4c-', '/./p4c-'), str(PROFILE) + '/',
                      str(PROFILE).replace('/gecko', '/GECKO')):
            with self.subTest(value=value), patch.dict(os.environ, ENV, clear=True):
                with self.assertRaisesRegex(RuntimeError, '^DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH$'):
                    validator.validate_run_profile(value)
        for run_id in ('0123456789ABCDEF', '0123456789abcde', '0123456789abcdef0', 'g' * 16):
            env = {**ENV, 'AXIOSOZO_AGENT_GUI_RUN': run_id}
            with self.subTest(run_id=run_id), patch.dict(os.environ, env, clear=True):
                with self.assertRaisesRegex(RuntimeError, '^DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH$'):
                    validator.validate_run_profile(str(PROFILE))

    def test_canonical_alias_is_refused(self):
        with self.assertRaisesRegex(RuntimeError, '^DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH$'):
            self.synthetic(resolve=lambda path, **kw: Path('/invented/alias/gecko'))

    def test_parent_and_profile_must_be_owned_private_directories(self):
        for target in (PROFILE.parent, PROFILE):
            for kind, mode, uid in ((stat.S_IFLNK, 0o700, 501), (stat.S_IFREG, 0o700, 501),
                                    (stat.S_IFDIR, 0o750, 501), (stat.S_IFDIR, 0o700, 502)):
                def bad(path):
                    info = self.directory(path)
                    if path == target:
                        info.st_mode, info.st_uid = kind | mode, uid
                    return info
                with self.subTest(target=str(target), mode=mode, uid=uid):
                    with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                        self.synthetic(lstat=bad)

    def test_directory_identity_change_during_marker_read_is_refused(self):
        calls = 0
        def changed(path):
            nonlocal calls
            calls += 1
            info = self.directory(path)
            if calls > 2:
                info.st_ino += 10
            return info
        with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
            self.synthetic(lstat=changed)

    def test_legacy_namespace_checks_and_errors_are_preserved(self):
        namespace = WORKSTATION / 'runtime' / hashlib.sha256(str(ROOT).encode()).hexdigest()[:16]
        legacy = namespace / 'existing-session-1' / 'gecko'
        with patch.object(Path, 'is_dir', return_value=True), patch.object(Path, 'resolve', lambda path: path), \
             patch.object(Path, 'is_file', return_value=True), patch.dict(os.environ, {}, clear=True):
            self.assertEqual(validator.validate_run_profile(str(legacy)), legacy)
            with self.assertRaisesRegex(RuntimeError, '^DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH$'):
                validator.validate_run_profile(str(namespace / 'bad_name' / 'gecko'))
        with patch.object(Path, 'is_dir', return_value=True), patch.object(Path, 'resolve', lambda path: path), \
             patch.object(Path, 'is_file', return_value=False):
            with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                validator.validate_run_profile(str(legacy))
        for value in (None, '', 'relative/gecko'):
            with self.subTest(value=value):
                with self.assertRaisesRegex(RuntimeError, '^EXPLICIT_EXISTING_DEVELOPMENT_PROFILE_REQUIRED$'):
                    validator.validate_run_profile(value)

    def test_cli_parser_preserves_alias_spelling_for_admission(self):
        tree = ast.parse(SOURCE.read_text())
        main = next(node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name == 'main')
        prefix = []
        for node in main.body:
            prefix.append(node)
            if isinstance(node, ast.Assign) and any(isinstance(target, ast.Name) and target.id == 'args' for target in node.targets):
                break
        main.name = 'parse_profile'
        main.body = prefix + [ast.Return(value=ast.Attribute(value=ast.Name(id='args', ctx=ast.Load()), attr='profile', ctx=ast.Load()))]
        module = ast.fix_missing_locations(ast.Module(body=[main], type_ignores=[]))
        namespace = {'argparse': argparse}
        exec(compile(module, '<candidate argparse prefix only>', 'exec'), namespace)
        for raw in (str(PROFILE), str(PROFILE).replace('/p4c-', '//p4c-'), str(PROFILE).replace('/p4c-', '/./p4c-')):
            with self.subTest(raw=raw), patch.object(sys, 'argv', ['zen.py', 'run', '--profile', raw]):
                self.assertIs(type(namespace['parse_profile']()), str)
                self.assertEqual(namespace['parse_profile'](), raw)

    def test_short_socket_byte_length(self):
        socket = (str(PROFILE) + '/.a/s').encode('utf-8')
        self.assertEqual(len(socket), 66)
        self.assertLessEqual(len(socket), 100)


class MarkerAdmission(unittest.TestCase):
    def setUp(self):
        validator.ROOT = ROOT
        self.temporary = tempfile.TemporaryDirectory(prefix='plan4-short-marker-', dir=os.environ['TMPDIR'])
        self.addCleanup(self.temporary.cleanup)
        self.directory = Path(self.temporary.name)
        self.marker = self.directory / 'invented-marker'
        self.uid = os.getuid()
        self.write(json.dumps(marker_record()).encode())

    def write(self, payload):
        self.marker.write_bytes(payload)
        self.marker.chmod(0o600)

    def admit(self):
        return validator._read_synthetic_profile_marker(self.marker, RUN_ID, self.uid)

    def test_valid_exact_json_marker_and_no_follow_bounded_fd(self):
        real_open, real_read, real_close = os.open, os.read, os.close
        with patch.object(os, 'open', wraps=real_open) as opened, \
             patch.object(os, 'read', wraps=real_read) as read, \
             patch.object(os, 'close', wraps=real_close) as closed:
            self.admit()
        flags = opened.call_args.args[1]
        self.assertTrue(flags & os.O_NOFOLLOW)
        self.assertTrue(flags & os.O_NONBLOCK)
        self.assertEqual(flags & os.O_ACCMODE, os.O_RDONLY)
        self.assertEqual(read.call_args.args[1], 512)
        closed.assert_called_once()

    def test_symlink_and_hardlink_are_refused_without_open(self):
        target = self.directory / 'invented-target'
        self.marker.rename(target)
        self.marker.symlink_to(target)
        with patch.object(os, 'open') as opened:
            with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                self.admit()
            opened.assert_not_called()
        self.marker.unlink()
        os.link(target, self.marker)
        with patch.object(os, 'open') as opened:
            with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                self.admit()
            opened.assert_not_called()

    def test_wrong_marker_mode_uid_type_and_oversize_are_refused(self):
        self.marker.chmod(0o640)
        with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
            self.admit()
        self.marker.chmod(0o600)
        with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
            validator._read_synthetic_profile_marker(self.marker, RUN_ID, self.uid + 1)
        self.write(b'x' * 513)
        with patch.object(os, 'open') as opened:
            with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                self.admit()
            opened.assert_not_called()
        self.marker.unlink()
        self.marker.mkdir(mode=0o700)
        with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
            self.admit()

    def test_exact_json_fields_and_types_are_required(self):
        values = [marker_record(version=True), marker_record(version=1.0), marker_record(version=2),
            marker_record(kind='other'), marker_record(run_id='fedcba9876543210'),
            marker_record(worktree_sha256='0' * 64), {**marker_record(), 'extra': True},
            {key: value for key, value in marker_record().items() if key != 'run_id'}, []]
        for value in values:
            with self.subTest(value=value):
                self.write(json.dumps(value).encode())
                with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                    self.admit()
        for payload in (b'', b'invalid', b'\xff', b'{"version":1,"version":1}'):
            with self.subTest(payload=payload):
                self.write(payload)
                with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                    self.admit()

    def test_fd_is_closed_on_read_error(self):
        real_close = os.close
        with patch.object(os, 'read', side_effect=OSError('invented read failure')), \
             patch.object(os, 'close', wraps=real_close) as closed:
            with self.assertRaises(OSError):
                self.admit()
            closed.assert_called_once()

    def test_marker_identity_replacement_before_open_is_refused(self):
        real_fstat = os.fstat
        def replaced(fd):
            info = real_fstat(fd)
            values = SimpleNamespace(**{name: getattr(info, name) for name in
                ('st_mode', 'st_uid', 'st_nlink', 'st_size', 'st_dev', 'st_ino', 'st_mtime_ns', 'st_ctime_ns')})
            values.st_ino += 1
            return values
        with patch.object(os, 'fstat', side_effect=replaced), patch.object(os, 'read') as read:
            with self.assertRaisesRegex(RuntimeError, '^PROFILE_NOT_OWNED_BY_AXIOSOZO$'):
                self.admit()
            read.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)
