#!/usr/bin/env python3
"""In-memory installer checks only: no real setup/check or helper launch."""
from dataclasses import dataclass, field
import importlib.util
import json
import os
from pathlib import Path
import stat
import sys
from types import SimpleNamespace
import unittest

WORKTREE = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(WORKTREE / 'scripts'))
spec = importlib.util.spec_from_file_location('agent_notify_install_prepared', WORKTREE / 'scripts/agent_notify_install.py')
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)
# Read only the frozen, product-owned candidate. It is never executed here.
HELPER = (WORKTREE / 'tools/axiosozo-notify').read_bytes()
SOURCE_ROOT = Path('/synthetic/worktree')
BUILD_ROOT = Path('/Volumes/AxioSozoBuild/workstation')
SOURCE = str(SOURCE_ROOT / installer.SOURCE_RELATIVE)
CONTEXTS = str(BUILD_ROOT / 'contexts')
TARGET = CONTEXTS + '/axiosozo-notify-' + installer.EXPECTED_DIGEST + '.sh'


@dataclass
class Entry:
    inode: int
    kind: str = 'directory'
    mode: int = 0o755
    uid: int = 1000
    nlink: int = 1
    content: bytes = b''
    children: dict = field(default_factory=dict)
    stamp: int = 0


class MemoryOS:
    name = 'posix'
    for key in ('O_RDONLY', 'O_WRONLY', 'O_DIRECTORY', 'O_NOFOLLOW', 'O_CLOEXEC', 'O_NONBLOCK', 'O_CREAT', 'O_EXCL', 'X_OK'):
        locals()[key] = getattr(os, key)

    def __init__(self):
        self.sequence = 1
        self.root = Entry(1, uid=0)
        self.handles = {}
        self.next_fd = 0
        self.events = []
        self.hooks = {}
        self.supports_dir_fd = {self.open, self.stat, self.mkdir, self.unlink}
        self.supports_follow_symlinks = {self.stat}
        self.access_denied = set()
        self.maximum_write = None
        self.zero_write = False
        self.fail_sync = False

    def getuid(self):
        return 1000

    def node(self, path, dir_fd=None):
        parts = str(path).split('/')
        current = self.root if dir_fd is None else self.handles[dir_fd]['node']
        for part in parts:
            if not part:
                continue
            if current.kind != 'directory':
                raise NotADirectoryError(str(path))
            if part not in current.children:
                raise FileNotFoundError(str(path))
            current = current.children[part]
        return current

    def new_entry(self, **values):
        self.sequence += 1
        return Entry(self.sequence, **values)

    def put(self, path, kind='regular', content=b'', mode=0o644, uid=1000, nlink=1):
        parts = str(path).split('/')
        current = self.root
        for part in parts[1:-1]:
            if part not in current.children:
                current.children[part] = self.new_entry()
            current = current.children[part]
        result = self.new_entry(kind=kind, content=content, mode=mode, uid=uid, nlink=nlink)
        current.children[parts[-1]] = result
        return result

    def hook(self, stage, path, **details):
        callback = self.hooks.get(stage)
        if callback:
            callback(str(path), **details)

    def path(self, name, dir_fd):
        return str(name) if dir_fd is None else self.handles[dir_fd]['path'].rstrip('/') + '/' + str(name)

    @staticmethod
    def info(node):
        types = {'regular': stat.S_IFREG, 'directory': stat.S_IFDIR, 'symlink': stat.S_IFLNK, 'fifo': stat.S_IFIFO}
        return SimpleNamespace(st_dev=1, st_ino=node.inode, st_uid=node.uid, st_mode=types[node.kind] | node.mode,
                               st_nlink=node.nlink, st_size=len(node.content), st_mtime_ns=node.stamp, st_ctime_ns=node.stamp)

    def stat(self, name, *, dir_fd=None, follow_symlinks=True):
        if follow_symlinks is not False:
            raise AssertionError('Every installer stat must be no-follow')
        path = self.path(name, dir_fd)
        self.events.append(('stat', path))
        return self.info(self.node(name, dir_fd))

    def open(self, name, flags, mode=0o777, *, dir_fd=None):
        path = self.path(name, dir_fd)
        self.events.append(('open', path, flags))
        self.hook('before_open', path, flags=flags)
        if not flags & self.O_NOFOLLOW:
            raise AssertionError('Every installer open must be no-follow')
        if flags & self.O_CREAT:
            if not flags & self.O_EXCL:
                raise AssertionError('Installer creation must be exclusive')
            parent = self.handles[dir_fd]['node']
            if str(name) in parent.children:
                raise FileExistsError(path)
            node = self.new_entry(kind='regular', mode=mode)
            parent.children[str(name)] = node
            self.events.append(('create', path))
        else:
            node = self.node(name, dir_fd)
            if node.kind == 'symlink':
                raise OSError('synthetic no-follow refusal')
        if flags & self.O_DIRECTORY and node.kind != 'directory':
            raise NotADirectoryError(path)
        self.next_fd += 1
        self.handles[self.next_fd] = {'node': node, 'path': path, 'offset': 0}
        self.hook('after_open', path, fd=self.next_fd, flags=flags)
        return self.next_fd

    def fstat(self, fd):
        return self.info(self.handles[fd]['node'])

    def close(self, fd):
        self.events.append(('close', self.handles[fd]['path']))
        del self.handles[fd]

    def access(self, path, flags):
        self.events.append(('access', str(path)))
        return str(path) not in self.access_denied and bool(self.node(path).mode & 0o111)

    def read(self, fd, amount):
        handle = self.handles[fd]
        self.events.append(('read', handle['path']))
        start = handle['offset']
        value = handle['node'].content[start:start + amount]
        handle['offset'] += len(value)
        self.hook('after_read', handle['path'], fd=fd)
        return value

    def write(self, fd, value):
        handle = self.handles[fd]
        self.events.append(('write', handle['path']))
        self.hook('before_write', handle['path'], fd=fd)
        if self.zero_write:
            return 0
        value = bytes(value)
        if self.maximum_write is not None:
            value = value[:self.maximum_write]
        start = handle['offset']
        node = handle['node']
        node.content = node.content[:start] + value + node.content[start + len(value):]
        handle['offset'] += len(value)
        node.stamp += 1
        return len(value)

    def fchmod(self, fd, mode):
        self.events.append(('chmod', self.handles[fd]['path'], mode))
        self.handles[fd]['node'].mode = mode
        self.handles[fd]['node'].stamp += 1

    def fsync(self, fd):
        self.events.append(('fsync', self.handles[fd]['path']))
        if self.fail_sync:
            raise OSError('synthetic fsync failure')

    def mkdir(self, name, *, mode, dir_fd):
        path = self.path(name, dir_fd)
        self.events.append(('mkdir', path, mode))
        self.hook('before_mkdir', path)
        parent = self.handles[dir_fd]['node']
        if str(name) in parent.children:
            raise FileExistsError(path)
        parent.children[str(name)] = self.new_entry(mode=mode)

    def unlink(self, name, *, dir_fd):
        self.events.append(('unlink', self.path(name, dir_fd)))
        parent = self.handles[dir_fd]['node']
        if str(name) not in parent.children:
            raise FileNotFoundError(str(name))
        del parent.children[str(name)]


class InstallTest(unittest.TestCase):
    def setUp(self):
        self.io = MemoryOS()
        self.io.put(SOURCE, content=HELPER)
        self.io.put(str(BUILD_ROOT), kind='directory', mode=0o755)
        self.store = SimpleNamespace(BUILD_ROOT=BUILD_ROOT, build_root=installer.storage.build_root, mounted=lambda: True)
        self.output = []

    def tearDown(self):
        self.assertEqual(self.io.handles, {}, 'Every in-memory descriptor must close')

    def run_command(self, command='setup'):
        return installer.run(command, source_root=SOURCE_ROOT, storage_api=self.store, io=self.io, emit=self.output.append)

    def actions(self):
        return [event for event in self.io.events if event[0] in {'mkdir', 'create', 'write', 'chmod', 'fsync', 'unlink'}]

    def refusal(self, code, command='setup'):
        with self.assertRaisesRegex(RuntimeError, code):
            self.run_command(command)

    def existing(self, content=HELPER, mode=0o400, uid=1000, kind='regular', nlink=1):
        self.io.put(CONTEXTS, kind='directory', mode=0o700)
        return self.io.put(TARGET, content=content, mode=mode, uid=uid, kind=kind, nlink=nlink)

    def test_setup_fixed_source_and_private_checksum_target(self):
        self.assertEqual(self.run_command(), 0)
        self.assertEqual(self.io.node(TARGET).content, HELPER)
        self.assertEqual(self.io.node(TARGET).mode, 0o400)
        self.assertEqual(self.io.node(CONTEXTS).mode, 0o700)
        answer = json.loads(self.output[0])
        self.assertEqual(answer, {'status': 'PASS', 'build_root': str(BUILD_ROOT), 'helper': TARGET,
                                  'sha256': installer.EXPECTED_DIGEST})
        flags = next(e[2] for e in self.io.events if e[0] == 'open' and e[1] == TARGET)
        self.assertTrue(flags & self.io.O_EXCL)
        self.assertTrue(flags & self.io.O_NOFOLLOW)
        self.assertEqual([e[1] for e in self.io.events if e[0] == 'fsync'], [TARGET, CONTEXTS, str(BUILD_ROOT)])

    def test_valid_existing_setup_and_check_are_readonly(self):
        entry = self.existing()
        self.assertEqual(self.run_command('setup'), 0)
        self.assertEqual(self.run_command('check'), 0)
        self.assertEqual(self.actions(), [])
        self.assertIs(self.io.node(TARGET), entry)

    def test_unknown_existing_hash_preserved(self):
        entry = self.existing(b'invented unrecognized installed entry')
        self.refusal('AGENT_NOTIFY_HASH_MISMATCH')
        self.assertIs(self.io.node(TARGET), entry)
        self.assertEqual(entry.content, b'invented unrecognized installed entry')
        self.assertEqual(self.actions(), [])

    def test_missing_check_does_not_create_directory_or_helper(self):
        with self.assertRaises(FileNotFoundError):
            self.run_command('check')
        self.assertEqual(self.actions(), [])

    def test_source_hash_mismatch_before_build_mutations(self):
        self.io.node(SOURCE).content = b'invented wrong source'
        self.refusal('AGENT_NOTIFY_SOURCE_CHANGED')
        self.assertEqual(self.actions(), [])

    def test_source_symlink_hardlink_foreign_uid_and_group_write_refuse_without_read(self):
        for change in ({'kind': 'symlink'}, {'nlink': 2}, {'uid': 1001}, {'mode': 0o664}):
            original = self.io.node(SOURCE)
            for key, value in change.items():
                setattr(original, key, value)
            self.refusal('AGENT_NOTIFY_FILE_REFUSED')
            self.assertFalse(any(e[0] == 'read' and e[1] == SOURCE for e in self.io.events))
            for key, value in {'kind': 'regular', 'nlink': 1, 'uid': 1000, 'mode': 0o644}.items():
                setattr(original, key, value)
        self.assertEqual(self.actions(), [])

    def test_source_ancestor_symlink_refuses_before_content_read(self):
        self.io.node(str(SOURCE_ROOT / 'tools')).kind = 'symlink'
        self.refusal('AGENT_NOTIFY_DIRECTORY_REFUSED')
        self.assertFalse(any(e[0] == 'read' and e[1] == SOURCE for e in self.io.events))
        self.assertEqual(self.actions(), [])

    def test_source_replacement_before_open_refuses(self):
        once = [False]
        def swap(path, flags):
            if path == SOURCE and not once[0]:
                once[0] = True
                self.io.put(SOURCE, content=HELPER)
        self.io.hooks['before_open'] = swap
        self.refusal('AGENT_NOTIFY_IDENTITY_CHANGED')
        self.assertEqual(self.actions(), [])

    def test_source_same_inode_edit_during_read_refuses(self):
        def edit(path, fd):
            if path == SOURCE:
                self.io.node(SOURCE).stamp += 1
        self.io.hooks['after_read'] = edit
        self.refusal('AGENT_NOTIFY_IDENTITY_CHANGED')
        self.assertEqual(self.actions(), [])

    def test_source_too_large_before_read_refuses(self):
        self.io.node(SOURCE).content = b'x' * (installer.MAX_HELPER_BYTES + 1)
        self.refusal('AGENT_NOTIFY_FILE_TOO_LARGE')
        self.assertFalse(any(e[0] == 'read' and e[1] == SOURCE for e in self.io.events))
        self.assertEqual(self.actions(), [])

    def test_private_directory_refuses_wrong_mode_foreign_uid_and_symlink(self):
        for change in ({'mode': 0o755}, {'uid': 1001}, {'kind': 'symlink'}):
            node = self.io.put(CONTEXTS, kind='directory', mode=0o700)
            for key, value in change.items():
                setattr(node, key, value)
            self.refusal('AGENT_NOTIFY_DIRECTORY_REFUSED')
            self.assertEqual(self.actions(), [])

    def test_private_helper_mode_uid_link_or_special_refuse_without_repair(self):
        for parameters in ({'mode': 0o644}, {'uid': 1001}, {'nlink': 2}, {'kind': 'symlink'}, {'kind': 'fifo'}):
            entry = self.existing(**parameters)
            self.refusal('AGENT_NOTIFY_FILE_REFUSED')
            self.assertIs(self.io.node(TARGET), entry)
            self.assertEqual(self.actions(), [])

    def test_mounted_image_unavailable_refuses_before_source_or_writes(self):
        self.store.mounted = lambda: False
        self.refusal('PROJECT_STORAGE_NOT_MOUNTED')
        self.assertEqual(self.io.events, [])

    def test_invalid_storage_roots_use_existing_policy(self):
        for root in ('/tmp/installer', '/Volumes/AxioSozoBuild/zen', '/Volumes/AxioSozoBuild/workstation/nested'):
            self.store.BUILD_ROOT = Path(root)
            self.refusal('INVALID_AXIOSOZO_BUILD_ROOT')
        self.assertEqual(self.io.events, [])

    def test_invalid_command_and_missing_os_primitive_refuse(self):
        self.refusal('AGENT_NOTIFY_COMMAND_INVALID', command='delete')
        self.io.O_NOFOLLOW = 0
        self.refusal('AGENT_NOTIFY_CONTAINMENT_UNAVAILABLE')
        self.assertEqual(self.io.events, [])

    def test_short_writes_complete_exact_source(self):
        self.io.maximum_write = 1000
        self.assertEqual(self.run_command(), 0)
        self.assertEqual(self.io.node(TARGET).content, HELPER)
        self.assertGreater(len([e for e in self.io.events if e[0] == 'write']), 1)

    def test_zero_write_cleans_only_own_partial_entry(self):
        self.io.zero_write = True
        self.refusal('AGENT_NOTIFY_WRITE_FAILED')
        with self.assertRaises(FileNotFoundError):
            self.io.node(TARGET)
        self.assertEqual([e for e in self.io.events if e[0] == 'unlink'], [('unlink', TARGET)])

    def test_fsync_failure_cleans_only_own_partial_entry(self):
        self.io.fail_sync = True
        with self.assertRaisesRegex(OSError, 'synthetic fsync failure'):
            self.run_command()
        with self.assertRaises(FileNotFoundError):
            self.io.node(TARGET)
        self.assertEqual([e for e in self.io.events if e[0] == 'unlink'], [('unlink', TARGET)])

    def test_foreign_replacement_after_create_is_preserved_on_failure(self):
        foreign = []
        def replace(path, fd):
            if path == TARGET and not foreign:
                foreign.append(self.io.put(TARGET, content=b'unknown concurrent entry', mode=0o400))
        self.io.hooks['before_write'] = replace
        self.refusal('AGENT_NOTIFY_IDENTITY_CHANGED')
        self.assertIs(self.io.node(TARGET), foreign[0])
        self.assertEqual(foreign[0].content, b'unknown concurrent entry')
        self.assertFalse(any(e[0] == 'unlink' for e in self.io.events))

    def test_parent_swap_after_create_does_not_write_or_delete_replacement(self):
        self.io.put(CONTEXTS, kind='directory', mode=0o700)
        old = self.io.node(CONTEXTS)
        replacement = []
        def swap(path, fd):
            if path == TARGET and not replacement:
                replacement.append(self.io.put(CONTEXTS, kind='directory', mode=0o700))
                replacement[0].children['unknown.future'] = self.io.new_entry(kind='regular', content=b'preserved')
        self.io.hooks['before_write'] = swap
        self.refusal('AGENT_NOTIFY_IDENTITY_CHANGED')
        self.assertEqual(set(replacement[0].children), {'unknown.future'})
        self.assertEqual(old.children, {})

    def test_collision_between_absence_and_create_is_preserved(self):
        collision = []
        def race(path, flags):
            if path == TARGET and flags & self.io.O_CREAT and not collision:
                collision.append(self.io.put(TARGET, content=b'unknown collision', mode=0o400))
        self.io.hooks['before_open'] = race
        with self.assertRaises(FileExistsError):
            self.run_command()
        self.assertIs(self.io.node(TARGET), collision[0])
        self.assertEqual(collision[0].content, b'unknown collision')
        self.assertFalse(any(e[0] == 'unlink' for e in self.io.events))

    def test_product_pin_matches_native_module_literal(self):
        module = (WORKTREE / 'apps/browser/chrome/AgentHookConfig.sys.mjs').read_text()
        expected = 'export const AGENT_NOTIFY_SHA256 = "' + installer.EXPECTED_DIGEST + '";'
        self.assertEqual(module.count(expected), 1)
        self.assertEqual(__import__('hashlib').sha256(HELPER).hexdigest(), installer.EXPECTED_DIGEST)


if __name__ == '__main__':
    unittest.main()
