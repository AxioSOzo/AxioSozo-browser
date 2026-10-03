#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. https://mozilla.org/MPL/2.0/
"""Fixed descriptor-bound snapshot/accept operations; no project execution.

Only .axiosozo/project.json is read or published. Accepted changes to an
existing manifest are limited to name/kind. This is cooperative CAS, not an
atomic compare-and-replace against a hostile process of the same OS user.
"""
from contextlib import ExitStack
import errno
import fcntl
import hashlib
import json
import os
import re
import secrets
import stat
import sys
from urllib.parse import urlsplit

MAX_MANIFEST_BYTES = 65536
MAX_REQUEST_BYTES = 131072
KINDS = frozenset({'web', 'desktop', 'library', 'cli', 'mobile'})
SURFACES = frozenset({'repository', 'issues', 'ci', 'releases', 'hosting', 'analytics', 'payments', 'package', 'docs', 'dashboard', 'store', 'crash_reports', 'other'})
IDENTITY_NUMBER = re.compile(r'(?:0|[1-9][0-9]{0,19})\Z', re.ASCII)
ENV_NAME = re.compile(r'[a-z][a-z0-9-]{0,31}\Z', re.ASCII)
APP = re.compile(r'[a-z0-9][a-z0-9._-]{0,39}\Z', re.ASCII)
HASH = re.compile(r'[a-f0-9]{64}\Z', re.ASCII)
SECRET_PATTERNS = tuple(re.compile(v) for v in (
    r'-----BEGIN [A-Z ]*PRIVATE KEY-----', r'\bgh[pousr]_[A-Za-z0-9]{20,}',
    r'\bgithub_pat_[A-Za-z0-9_]{20,}', r'\bglpat-[A-Za-z0-9_-]{16,}',
    r'\bsk-[A-Za-z0-9_-]{16,}', r'\bxox[abprs]-[A-Za-z0-9-]{10,}',
    r'\bAKIA[0-9A-Z]{16}\b', r'\beyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.',
    r'\b(sk|rk)_(live|test)_[A-Za-z0-9]{10,}', r'\bnpm_[A-Za-z0-9]{30,}',
))
LOCAL_PATH = re.compile(r'^(/(Users|home|root|private|var|tmp|Volumes)/|~[/\\]|[A-Za-z]:[/\\]|file:)')


class Refused(Exception):
    def __init__(self, code, committed=False):
        super().__init__(code)
        self.code = code
        self.committed = committed


def require(condition, code='INVALID_PARAMS'):
    if not condition:
        raise Refused(code)


def keys(value, required, optional=()):
    require(type(value) is dict and set(required) <= set(value) <= set(required) | set(optional))


def identity(info):
    return {'device': str(info.st_dev), 'inode': str(info.st_ino)}


def exact_identity(value):
    keys(value, ('device', 'inode'))
    require(all(isinstance(value[k], str) and IDENTITY_NUMBER.fullmatch(value[k]) for k in value) and value['inode'] != '0')
    return value


def text(value, maximum, minimum=1, pattern=None):
    require(isinstance(value, str) and minimum <= len(value) <= maximum and not any(ord(c) < 32 or 127 <= ord(c) <= 159 or 0xd800 <= ord(c) <= 0xdfff for c in value))
    require(pattern is None or pattern.fullmatch(value) is not None)
    require(not LOCAL_PATH.search(value) and not any(p.search(value) for p in SECRET_PATTERNS), 'MANIFEST_SECRET')
    return value


def url(value):
    text(value, 2048)
    require(not any(c.isspace() for c in value) and not any(c in value for c in '\\?#'))
    try:
        parsed = urlsplit(value)
        require(parsed.scheme in {'http', 'https'} and bool(parsed.netloc) and bool(parsed.hostname) and '@' not in parsed.netloc)
        require(parsed.port is None or 1 <= parsed.port <= 65535)
    except ValueError:
        raise Refused('INVALID_MANIFEST') from None
    return value


def manifest(value):
    try:
        keys(value, ('version', 'name', 'kind', 'environments', 'services', 'surfaces'))
        require(type(value['version']) is int and value['version'] in {1, 2})
        text(value['name'], 80)
        require(value['kind'] in KINDS)
        for key, limit in (('environments', 16), ('services', 32), ('surfaces', 64)):
            require(type(value[key]) is list and len(value[key]) <= limit)
        seen = set()
        for item in value['environments']:
            keys(item, ('name', 'base_url'), ('app',) if value['version'] == 2 else ())
            text(item['name'], 32, pattern=ENV_NAME)
            url(item['base_url'])
            if 'app' in item:
                text(item['app'], 40, pattern=APP)
            pair = (item.get('app', ''), item['name'])
            require(pair not in seen)
            seen.add(pair)
        for item in value['services']:
            keys(item, ('name', 'url', 'port'), ('app',) if value['version'] == 2 else ())
            text(item['name'], 80)
            url(item['url'])
            require(type(item['port']) is int and 1 <= item['port'] <= 65535)
            if 'app' in item:
                text(item['app'], 40, pattern=APP)
        for item in value['surfaces']:
            keys(item, ('name', 'url', 'kind'), ('prominence',) if value['version'] == 2 else ())
            text(item['name'], 80)
            url(item['url'])
            require(item['kind'] in SURFACES)
            if 'prominence' in item:
                require(item['prominence'] in {'primary', 'secondary'})
        encoded = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
        require(len(encoded) <= MAX_MANIFEST_BYTES, 'TOO_LARGE')
        return encoded
    except (TypeError, KeyError, ValueError, UnicodeError):
        raise Refused('INVALID_MANIFEST') from None
    except Refused as cause:
        if cause.code == 'INVALID_PARAMS':
            raise Refused('INVALID_MANIFEST') from None
        raise


def root_value(value):
    require(isinstance(value, str) and value.startswith('/') and value != '/' and not value.endswith('/')
            and '//' not in value and '\\' not in value and not any(p in {'.', '..'} for p in value.split('/'))
            and not any(ord(c) < 32 or 127 <= ord(c) <= 159 or 0xd800 <= ord(c) <= 0xdfff for c in value)
            and len(value.encode('utf-8')) <= 4096)
    return value


def checked_directory(info, owned=False):
    require(stat.S_ISDIR(info.st_mode), 'DIRECTORY_REFUSED')
    if owned:
        require(info.st_uid == os.getuid() and not info.st_mode & 0o022, 'DIRECTORY_REFUSED')


def checked_file(info):
    require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1 and info.st_uid == os.getuid()
            and not info.st_mode & 0o022 and not info.st_mode & 0o7111, 'MANIFEST_REFUSED')
    require(info.st_size <= MAX_MANIFEST_BYTES, 'TOO_LARGE')


def directory_flags():
    return os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC


def open_child(parent_fd, leaf, stack, owned=False):
    before = os.stat(leaf, dir_fd=parent_fd, follow_symlinks=False)
    checked_directory(before, owned)
    child = os.open(leaf, directory_flags(), dir_fd=parent_fd)
    stack.callback(os.close, child)
    after = os.fstat(child)
    checked_directory(after, owned)
    require(identity(after) == identity(before), 'IDENTITY_CHANGED')
    return child


def open_root(root, stack, expected=None):
    current = os.open('/', directory_flags())
    stack.callback(os.close, current)
    for part in root.split('/')[1:]:
        current = open_child(current, part, stack)
    opened = os.fstat(current)
    checked_directory(opened, owned=True)
    require(expected is None or identity(opened) == expected, 'IDENTITY_CHANGED')
    return current


def maybe_stat(parent, leaf):
    try:
        return os.stat(leaf, dir_fd=parent, follow_symlinks=False)
    except FileNotFoundError:
        return None


def stable_version(info):
    return (identity(info), info.st_uid, info.st_mode, info.st_nlink, info.st_size, info.st_mtime_ns, info.st_ctime_ns)


def read_target(directory, stack):
    prior = maybe_stat(directory, 'project.json')
    if prior is None:
        return None, None
    checked_file(prior)
    fd = os.open('project.json', os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK, dir_fd=directory)
    stack.callback(os.close, fd)
    opened = os.fstat(fd)
    checked_file(opened)
    require(stable_version(opened) == stable_version(prior), 'MANIFEST_CHANGED')
    chunks, total = [], 0
    while True:
        chunk = os.read(fd, min(65536, MAX_MANIFEST_BYTES + 1 - total))
        if not chunk:
            break
        total += len(chunk)
        require(total <= MAX_MANIFEST_BYTES, 'TOO_LARGE')
        chunks.append(chunk)
    final = os.fstat(fd)
    checked_file(final)
    require(stable_version(final) == stable_version(opened), 'MANIFEST_CHANGED')
    require(stable_version(os.stat('project.json', dir_fd=directory, follow_symlinks=False)) == stable_version(final), 'MANIFEST_CHANGED')
    raw = b''.join(chunks)
    try:
        value = parse(raw)
        manifest(value)
    except (ValueError, UnicodeError):
        raise Refused('INVALID_MANIFEST') from None
    target = {'identity': identity(final), 'digest': hashlib.sha256(raw).hexdigest(), 'size': final.st_size, 'mode': stat.S_IMODE(final.st_mode)}
    return target, value


def snapshot(root):
    with ExitStack() as stack:
        root_fd = open_root(root, stack)
        root_id = identity(os.fstat(root_fd))
        directory = maybe_stat(root_fd, '.axiosozo')
        if directory is None:
            return {'rootIdentity': root_id, 'directoryIdentity': None, 'target': None, 'manifest': None}
        directory_fd = open_child(root_fd, '.axiosozo', stack, owned=True)
        target, value = read_target(directory_fd, stack)
        assert_paths(root, root_id, directory_fd)
        return {'rootIdentity': root_id, 'directoryIdentity': identity(os.fstat(directory_fd)), 'target': target, 'manifest': value}


def expected_snapshot(value):
    keys(value, ('rootIdentity', 'directoryIdentity', 'target'))
    exact_identity(value['rootIdentity'])
    if value['directoryIdentity'] is not None:
        exact_identity(value['directoryIdentity'])
    target = value['target']
    if target is not None:
        require(value['directoryIdentity'] is not None)
        keys(target, ('identity', 'digest', 'size', 'mode'))
        exact_identity(target['identity'])
        require(isinstance(target['digest'], str) and HASH.fullmatch(target['digest']) is not None)
        require(type(target['size']) is int and 0 <= target['size'] <= MAX_MANIFEST_BYTES)
        require(type(target['mode']) is int and 0 <= target['mode'] <= 0o777 and not target['mode'] & 0o133)
    return value


def assert_paths(root, root_id, directory_fd=None):
    # A fresh descriptor walk checks the current spelling; pinned descriptors
    # are used for every mutation, so replaced links are never followed.
    with ExitStack() as check:
        current = open_root(root, check, root_id)
        if directory_fd is not None:
            found = open_child(current, '.axiosozo', check, owned=True)
            require(identity(os.fstat(found)) == identity(os.fstat(directory_fd)), 'IDENTITY_CHANGED')


def compare_target(directory_fd, expected, stack):
    target, existing = read_target(directory_fd, stack)
    require(target == expected, 'MANIFEST_CHANGED')
    return existing


def owned_remove(directory_fd, leaf, file_id):
    # Never unlink an entry merely because we once created its name.
    current = maybe_stat(directory_fd, leaf)
    if current is not None and stat.S_ISREG(current.st_mode) and current.st_uid == os.getuid() and identity(current) == file_id:
        os.unlink(leaf, dir_fd=directory_fd)


def accept(root, expected, value, boundary=lambda _stage: None):
    encoded = manifest(value)  # Invalid values refuse before any filesystem operation.
    expected = expected_snapshot(expected)
    root = root_value(root)
    committed = False
    with ExitStack() as stack:
        root_fd = open_root(root, stack, expected['rootIdentity'])
        try:
            fcntl.flock(root_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise Refused('BUSY') from None
        prior_dir = maybe_stat(root_fd, '.axiosozo')
        require((identity(prior_dir) if prior_dir is not None else None) == expected['directoryIdentity'], 'IDENTITY_CHANGED')
        directory_fd = None
        if prior_dir is not None:
            directory_fd = open_child(root_fd, '.axiosozo', stack, owned=True)
            existing = compare_target(directory_fd, expected['target'], stack)
            if existing is not None:
                require(all(value[k] == existing[k] for k in ('version', 'environments', 'services', 'surfaces')), 'UNCONFIRMED_FIELDS')
        else:
            require(expected['target'] is None)
        boundary('before_directory')
        assert_paths(root, expected['rootIdentity'], directory_fd)
        if directory_fd is None:
            os.mkdir('.axiosozo', mode=0o700, dir_fd=root_fd)
            directory_fd = open_child(root_fd, '.axiosozo', stack, owned=True)
        # Snapshot identity checks happen before either mkdir or temp creation.
        boundary('before_temp')
        assert_paths(root, expected['rootIdentity'], directory_fd)
        compare_target(directory_fd, expected['target'], stack)
        temp = '.project.json.' + secrets.token_hex(16) + '.tmp'
        temp_fd, temp_id = None, None
        try:
            temp_fd = os.open(temp, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=directory_fd)
            stack.callback(os.close, temp_fd)
            temp_id = identity(os.fstat(temp_fd))
            view = memoryview(encoded)
            while view:
                count = os.write(temp_fd, view)
                require(count > 0, 'WRITE_FAILED')
                view = view[count:]
            mode = expected['target']['mode'] if expected['target'] else 0o600
            os.fchmod(temp_fd, mode)
            os.fsync(temp_fd)
            checked_file(os.fstat(temp_fd))
            boundary('before_commit')
            assert_paths(root, expected['rootIdentity'], directory_fd)
            compare_target(directory_fd, expected['target'], stack)
            temporary = os.stat(temp, dir_fd=directory_fd, follow_symlinks=False)
            require(identity(temporary) == temp_id, 'IDENTITY_CHANGED')
            checked_file(temporary)
            checked_file(os.fstat(temp_fd))
            os.rename(temp, 'project.json', src_dir_fd=directory_fd, dst_dir_fd=directory_fd)
            committed = True
            # Post-commit checks diagnose uncertainty; they do not roll back
            # and risk overwriting another process's newer entry.
            boundary('after_commit')
            assert_paths(root, expected['rootIdentity'], directory_fd)
            published = os.stat('project.json', dir_fd=directory_fd, follow_symlinks=False)
            checked_file(published)
            require(identity(published) == temp_id and published.st_size == len(encoded), 'IDENTITY_CHANGED')
            os.fsync(directory_fd)
            os.fsync(root_fd)
            return {'path': root + '/.axiosozo/project.json', 'digest': hashlib.sha256(encoded).hexdigest(), 'committed': True}
        except (Refused, OSError) as cause:
            if committed:
                raise Refused('WRITE_OUTCOME_UNKNOWN', committed=True) from None
            raise cause
        finally:
            if not committed and temp_id is not None:
                owned_remove(directory_fd, temp, temp_id)


def capabilities():
    require(os.name == 'posix' and all(isinstance(getattr(os, k, None), int) and getattr(os, k) for k in ('O_NOFOLLOW', 'O_DIRECTORY', 'O_CLOEXEC', 'O_NONBLOCK'))
            and all(fn in os.supports_dir_fd for fn in (os.open, os.stat, os.mkdir, os.rename, os.unlink))
            and os.stat in os.supports_follow_symlinks, 'WRITE_CONTAINMENT_UNAVAILABLE')


def operation(name, payload):
    capabilities()
    if name == 'snapshot':
        keys(payload, ('root',))
        return snapshot(root_value(payload['root']))
    require(name == 'accept')
    keys(payload, ('root', 'expected', 'manifest'))
    return accept(payload['root'], payload['expected'], payload['manifest'])


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        require(key not in value)
        value[key] = item
    return value


def reject_constant(_value):
    raise Refused('INVALID_PARAMS')


def parse(raw):
    return json.loads(raw.decode('utf-8'), object_pairs_hook=unique_object, parse_constant=reject_constant)


def trusted_self(path):
    require(isinstance(path, str) and os.path.isabs(path) and os.path.realpath(path) == path, 'WRITE_CONTAINMENT_UNAVAILABLE')
    info, parent = os.lstat(path), os.lstat(os.path.dirname(path))
    require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1 and info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == 0o400
            and stat.S_ISDIR(parent.st_mode) and parent.st_uid == os.getuid() and stat.S_IMODE(parent.st_mode) == 0o700, 'WRITE_CONTAINMENT_UNAVAILABLE')


def main(argv):
    try:
        require(len(argv) == 2 and argv[1] in {'snapshot', 'accept'})
        trusted_self(os.path.abspath(argv[0]))
        raw = sys.stdin.buffer.read(MAX_REQUEST_BYTES + 1)
        require(len(raw) <= MAX_REQUEST_BYTES)
        result = operation(argv[1], parse(raw))
        answer = {'ok': True, 'result': result}
    except Refused as cause:
        answer = {'ok': False, 'error': cause.code, 'committed': cause.committed}
    except OSError as cause:
        code = 'BUSY' if cause.errno in {errno.EAGAIN, errno.EWOULDBLOCK} else 'WRITE_CONTAINMENT_REFUSED'
        answer = {'ok': False, 'error': code, 'committed': False}
    except (TypeError, ValueError, UnicodeError):
        answer = {'ok': False, 'error': 'INVALID_PARAMS', 'committed': False}
    sys.stdout.write(json.dumps(answer, ensure_ascii=False, separators=(',', ':')) + '\n')
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
