#!/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11
"""Install the reviewed fake handoff into an explicitly owned APFS fixture."""
import argparse
from contextlib import ExitStack
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import sys

# Sources stay in this worktree; installed copies stay in the owned fixture.
HERE = Path(os.path.abspath(__file__)).parent
REPO = HERE.parent
sys.path.insert(0, str(REPO / 'scripts'))
import storage

BUILD = Path('/Volumes/AxioSozoBuild/workstation')
BASE = BUILD / 'handoff-terminal'
PYTHON = Path('/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11')
HELPER = REPO / 'tools/axiosozo-handoff/terminal_handoff.py'
FIXTURE = REPO / 'tools/axiosozo-handoff/fake_handoff.py'
CONFIG = REPO / 'apps/browser/chrome/TerminalHandoffConfig.sys.mjs'


def refuse(condition):
    if not condition:
        raise RuntimeError('TERMINAL_FIXTURE_UNAVAILABLE')


def identity(info):
    return info.st_dev, info.st_ino


def stable_metadata(info):
    return (info.st_dev, info.st_ino, info.st_uid, info.st_mode, info.st_nlink,
            info.st_size, info.st_mtime_ns, info.st_ctime_ns)


class Directory:
    """Hold every no-follow ancestor descriptor and check its name binding."""
    def __init__(self, path, private=False, create_last=False):
        text = str(path)
        refuse(text.startswith('/') and text == os.path.normpath(text)
               and all(part not in ('', '.', '..') for part in text.split('/')[1:]))
        self.path = Path(text)
        self.private = private
        self.descriptors = []
        self.bindings = []
        try:
            parent = os.open('/', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
            self.descriptors.append(parent)
            self.fd = parent
            parts = text.split('/')[1:]
            for index, name in enumerate(parts):
                self.check(private_final=False)
                if create_last and index == len(parts) - 1:
                    try:
                        os.mkdir(name, 0o700, dir_fd=parent)
                    except FileExistsError:
                        pass
                child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=parent)
                self.descriptors.append(child)
                self.bindings.append((parent, name, child))
                parent = child
                self.fd = parent
            self.fd = parent
            self.check()
        except BaseException:
            self.close()
            raise

    def check(self, private_final=True):
        for descriptor in self.descriptors:
            info = os.fstat(descriptor)
            refuse(stat.S_ISDIR(info.st_mode) and info.st_uid in (0, os.getuid())
                   and not info.st_mode & 0o022)
        for parent, name, descriptor in self.bindings:
            actual = os.stat(name, dir_fd=parent, follow_symlinks=False)
            refuse(stat.S_ISDIR(actual.st_mode) and identity(actual) == identity(os.fstat(descriptor)))
        info = os.fstat(self.fd)
        if self.private and private_final:
            refuse(info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == 0o700)

    def close(self):
        for descriptor in reversed(self.descriptors):
            os.close(descriptor)
        self.descriptors.clear()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()


def read_file_at(directory, name, limit, digest=None, mode=None, executable=False):
    refuse(isinstance(name, str) and re.fullmatch(r'[A-Za-z0-9_.-]+', name) is not None and name not in ('.', '..'))
    directory.check()
    descriptor = os.open(name, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory.fd)
    try:
        before = os.fstat(descriptor)
        refuse(stat.S_ISREG(before.st_mode) and before.st_uid == os.getuid()
               and before.st_nlink == 1 and not before.st_mode & 0o022)
        if mode is not None:
            refuse(stat.S_IMODE(before.st_mode) == mode)
        if executable:
            refuse(bool(before.st_mode & 0o100))
        refuse(before.st_size <= limit)
        data = bytearray()
        while len(data) <= limit:
            chunk = os.read(descriptor, min(65536, limit + 1 - len(data)))
            if not chunk:
                break
            data.extend(chunk)
        after = os.fstat(descriptor)
        actual = os.stat(name, dir_fd=directory.fd, follow_symlinks=False)
        refuse(len(data) == before.st_size and stable_metadata(before) == stable_metadata(after)
               and identity(actual) == identity(before) and not stat.S_ISLNK(actual.st_mode))
        directory.check()
        snapshot = bytes(data)
        if digest is not None:
            refuse(hashlib.sha256(snapshot).hexdigest() == digest)
        return snapshot
    finally:
        os.close(descriptor)


def source_snapshot(path, limit=65536):
    with Directory(path.parent) as parent:
        return read_file_at(parent, path.name, limit)


def expected(config_snapshot, name):
    match = re.search(name + r' = "([a-f0-9]{64})"', config_snapshot.decode('utf-8'))
    refuse(match is not None)
    return match.group(1)


def publish(directory, name, data, mode):
    directory.check()
    try:
        descriptor = os.open(name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, mode, dir_fd=directory.fd)
    except FileExistsError:
        descriptor = None
    if descriptor is not None:
        try:
            os.fchmod(descriptor, mode)
            view = memoryview(data)
            while view:
                count = os.write(descriptor, view)
                refuse(count > 0)
                view = view[count:]
            os.fsync(descriptor)
        finally:
            os.close(descriptor)
    directory.check()
    read_file_at(directory, name, max(65536, len(data)), hashlib.sha256(data).hexdigest(), mode)


def checked_directory(path):
    with Directory(path, private=True):
        pass


def run(command, fixture_id, profile, project_names, timeout_s):
    refuse(command in ('setup', 'check') and storage.BUILD_ROOT == BUILD and storage.mounted()
           and os.environ.get('AXIOSOZO_SYNTHETIC_TEST') == '1'
           and os.environ.get('AXIOSOZO_HANDOFF_GUI_FIXTURE') == '1'
           and isinstance(fixture_id, str) and re.fullmatch(r'[0-9a-f]{32}', fixture_id) is not None)
    root = BASE / ('config-' + fixture_id)
    refuse(os.environ.get('AXIOSOZO_HANDOFF_GUI_FIXTURE_ROOT') == str(root))
    refuse(isinstance(profile, str) and re.fullmatch(re.escape(str(BUILD))
           + r'/runtime/[0-9a-f]{16}/plan4-handoff-' + fixture_id + r'/gecko', profile) is not None)
    checked_directory(Path(profile))
    refuse(isinstance(project_names, list) and 1 <= len(project_names) <= 32
           and len(set(project_names)) == len(project_names)
           and all(isinstance(name, str) and re.fullmatch(r'[a-z0-9][a-z0-9-]{0,63}', name) for name in project_names)
           and type(timeout_s) is int and 1 <= timeout_s <= 60)
    project_root = BUILD / 'gui-fixtures' / ('handoff-' + fixture_id) / 'projects'
    for path in [project_root.parent, project_root] + [project_root / name for name in project_names]:
        checked_directory(path)
    # Each descriptor returns one immutable verified snapshot, reused for writes.
    config_source = source_snapshot(CONFIG, 128 * 1024)
    helper_source = source_snapshot(HELPER)
    fixture_source = source_snapshot(FIXTURE)
    helper_digest = expected(config_source, 'TERMINAL_HANDOFF_SHA256')
    fixture_digest = expected(config_source, 'TERMINAL_HANDOFF_FAKE_SHA256')
    refuse(hashlib.sha256(helper_source).hexdigest() == helper_digest
           and hashlib.sha256(fixture_source).hexdigest() == fixture_digest)
    with Directory(PYTHON.parent) as parent:
        read_file_at(parent, PYTHON.name, 128 * 1024 * 1024, executable=True)
    policy_bytes = (json.dumps({'version': 1, 'fake_script': str(root / 'fixture.py'), 'fake_script_sha256': fixture_digest,
                              'projects': [str(project_root / name) for name in project_names], 'timeout_s': timeout_s},
                             sort_keys=True, separators=(',', ':')) + '\n').encode()
    with ExitStack() as stack:
        base = stack.enter_context(Directory(BASE, private=True, create_last=command == 'setup'))
        config = stack.enter_context(Directory(root, private=True, create_last=command == 'setup'))
        base.check()
        if command == 'setup':
            for name, data, mode in [('terminal-handoff-' + helper_digest + '.py', helper_source, 0o400),
                                     ('fixture.py', fixture_source, 0o600), ('policy.json', policy_bytes, 0o600)]:
                publish(config, name, data, mode)
            config.check()
            os.fsync(config.fd)
        read_file_at(config, 'terminal-handoff-' + helper_digest + '.py', 65536, helper_digest, 0o400)
        read_file_at(config, 'fixture.py', 65536, fixture_digest, 0o600)
        read_file_at(config, 'policy.json', 32768, hashlib.sha256(policy_bytes).hexdigest(), 0o600)
        base.check()
    # Only fixture metadata; never task/context, key or profile content.
    return {'status': 'PASS', 'root': str(root), 'interpreter': str(PYTHON),
            'helper_sha256': helper_digest, 'fixture_sha256': fixture_digest,
            'policy_sha256': hashlib.sha256(policy_bytes).hexdigest(), 'project_count': len(project_names)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('setup', 'check'))
    parser.add_argument('--fixture-id', required=True)
    parser.add_argument('--profile', required=True)
    parser.add_argument('--project', action='append', required=True)
    parser.add_argument('--timeout-s', type=int, default=30)
    args = parser.parse_args()
    try:
        print(json.dumps(run(args.command, args.fixture_id, args.profile, args.project, args.timeout_s), indent=2))
    except (RuntimeError, OSError, ValueError, UnicodeError):
        print('TERMINAL_FIXTURE_UNAVAILABLE', file=sys.stderr)
        raise SystemExit(2)
