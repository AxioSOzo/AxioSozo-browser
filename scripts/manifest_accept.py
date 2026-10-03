#!/usr/bin/env python3
"""Install/check the fixed manifest acceptance helper in the external build root.

Intended active destination: scripts/manifest_accept.py. No generic install
paths, PATH discovery, project execution, profile access or cleanup sweep.
"""
from contextlib import ExitStack
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import storage

ROOT = Path(__file__).resolve().parents[1]
SOURCE_RELATIVE = Path('tools/axiosozo-manifest/manifest_accept.py')
CONFIG_RELATIVE = Path('apps/browser/chrome/ProjectManifestAccept.sys.mjs')
PYTHON = Path('/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11')
EXPECTED_DIGEST = '53b0768151ec6ac403fa5ef3e8119dd25ee6c569e5db55acdc60580e3772df86'
MAX_HELPER_BYTES = 128 * 1024


def refuse(code):
    raise RuntimeError(code)


def require(condition, code):
    if not condition:
        refuse(code)


def identifier(info):
    return (info.st_dev, info.st_ino)


def version(info):
    return (identifier(info), info.st_uid, info.st_mode, info.st_nlink, info.st_size, info.st_mtime_ns, info.st_ctime_ns)


def absolute(path):
    value = str(path)
    require(value.startswith('/') and value != '/' and not value.endswith('/') and '//' not in value
            and '\\' not in value and not any(p in {'.', '..'} for p in value.split('/'))
            and not any(ord(c) < 32 or 127 <= ord(c) <= 159 for c in value), 'MANIFEST_ACCEPT_PATH_REFUSED')
    return value


def capabilities(io):
    require(io.name == 'posix' and all(isinstance(getattr(io, key, None), int) and getattr(io, key) for key in ('O_NOFOLLOW', 'O_DIRECTORY', 'O_CLOEXEC', 'O_NONBLOCK', 'O_CREAT', 'O_EXCL', 'O_WRONLY'))
            and all(fn in io.supports_dir_fd for fn in (io.open, io.stat, io.mkdir, io.unlink))
            and io.stat in io.supports_follow_symlinks, 'MANIFEST_ACCEPT_CONTAINMENT_UNAVAILABLE')


def directory_flags(io):
    return io.O_RDONLY | io.O_DIRECTORY | io.O_NOFOLLOW | io.O_CLOEXEC


def checked_directory(info, io, private=False, owned=False):
    require(stat.S_ISDIR(info.st_mode), 'MANIFEST_ACCEPT_DIRECTORY_REFUSED')
    if private or owned:
        require(info.st_uid == io.getuid() and not info.st_mode & 0o022, 'MANIFEST_ACCEPT_DIRECTORY_REFUSED')
    if private:
        require(stat.S_IMODE(info.st_mode) == 0o700, 'MANIFEST_ACCEPT_DIRECTORY_REFUSED')


def checked_file(info, io, private=False, executable=False):
    require(stat.S_ISREG(info.st_mode) and info.st_uid == io.getuid() and info.st_nlink == 1
            and not info.st_mode & 0o022 and not info.st_mode & 0o7000, 'MANIFEST_ACCEPT_FILE_REFUSED')
    if private:
        require(stat.S_IMODE(info.st_mode) == 0o400, 'MANIFEST_ACCEPT_FILE_REFUSED')
    if executable:
        require(bool(info.st_mode & 0o111), 'MANIFEST_ACCEPT_INTERPRETER_REFUSED')


def open_child(parent, leaf, io, stack, private=False, owned=False):
    before = io.stat(leaf, dir_fd=parent, follow_symlinks=False)
    checked_directory(before, io, private, owned)
    child = io.open(leaf, directory_flags(io), dir_fd=parent)
    stack.callback(io.close, child)
    after = io.fstat(child)
    checked_directory(after, io, private, owned)
    require(identifier(before) == identifier(after), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
    return child


def open_directory(path, io, stack, owned=False):
    path = absolute(path)
    current = io.open('/', directory_flags(io))
    stack.callback(io.close, current)
    for part in path.split('/')[1:]:
        current = open_child(current, part, io, stack)
    checked_directory(io.fstat(current), io, owned=owned)
    return current


def read_file(path, io, private=False, executable=False):
    path = Path(absolute(path))
    with ExitStack() as stack:
        parent = open_directory(path.parent, io, stack)
        before = io.stat(path.name, dir_fd=parent, follow_symlinks=False)
        checked_file(before, io, private, executable)
        if not executable:
            require(before.st_size <= MAX_HELPER_BYTES, 'MANIFEST_ACCEPT_FILE_TOO_LARGE')
        fd = io.open(path.name, io.O_RDONLY | io.O_NOFOLLOW | io.O_CLOEXEC | io.O_NONBLOCK, dir_fd=parent)
        stack.callback(io.close, fd)
        opened = io.fstat(fd)
        checked_file(opened, io, private, executable)
        require(version(before) == version(opened), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
        if executable:
            # Do not read interpreter bytes; verify its fixed canonical entry.
            require(io.access(str(path), io.X_OK), 'MANIFEST_ACCEPT_INTERPRETER_REFUSED')
            data = None
        else:
            chunks, size = [], 0
            while True:
                chunk = io.read(fd, min(65536, MAX_HELPER_BYTES + 1 - size))
                if not chunk:
                    break
                size += len(chunk)
                require(size <= MAX_HELPER_BYTES, 'MANIFEST_ACCEPT_FILE_TOO_LARGE')
                chunks.append(chunk)
            data = b''.join(chunks)
        final = io.fstat(fd)
        checked_file(final, io, private, executable)
        require(version(opened) == version(final), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
        require(version(io.stat(path.name, dir_fd=parent, follow_symlinks=False)) == version(final), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
        # Rewalk the absolute spelling before accepting pinned descriptor data.
        found = open_directory(path.parent, io, stack)
        require(identifier(io.fstat(found)) == identifier(io.fstat(parent)), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
        require(version(io.stat(path.name, dir_fd=found, follow_symlinks=False)) == version(final), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
        return data


def javascript_code_mask(text):
    """Conservative lexical mask, never evaluate a repository module.

    Strings, comments, templates (including nested interpolation) and regex
    literals cannot impersonate an exported declaration. A slash that cannot
    be parsed as a closed regex is unsupported and refuses; the current pinned
    adapter uses no division operators outside string/template expressions.
    This is not a general JavaScript syntax validator.
    """
    size = len(text)
    masked = list(text)

    def blank(start, end):
        for at in range(start, end):
            if text[at] not in '\r\n':
                masked[at] = ' '

    def quoted(at):
        quote = text[at]
        at += 1
        while at < size:
            if text[at] == '\\':
                at += 2
            elif text[at] == quote:
                return at + 1
            else:
                at += 1
        refuse('MANIFEST_ACCEPT_CONFIG_INVALID')

    def regex(at):
        # Division is outside this narrow supported lexical subset. Refuse it
        # rather than letting a slash in a later quoted value end a fake regex.
        prior = text[:at].rstrip()
        require(not prior or prior[-1] in '=([{,:;!&|?+*%^~<>'
                or re.search(r'\b(?:return|throw|case|yield|await|typeof|void|delete|in|instanceof|else|do)\Z', prior), 'MANIFEST_ACCEPT_CONFIG_INVALID')
        at += 1
        bracket = False
        while at < size:
            char = text[at]
            if char in '\r\n':
                refuse('MANIFEST_ACCEPT_CONFIG_INVALID')
            if char == '\\':
                at += 2
                continue
            if char == '[':
                bracket = True
            elif char == ']':
                bracket = False
            elif char == '/' and not bracket:
                return at + 1
            at += 1
        refuse('MANIFEST_ACCEPT_CONFIG_INVALID')

    def skipped(at, depth):
        char = text[at]
        if char in {"'", '"'}:
            return quoted(at)
        if char == '`':
            return template(at, depth + 1)
        if text.startswith('//', at):
            end = text.find('\n', at + 2)
            return size if end < 0 else end
        if text.startswith('/*', at):
            end = text.find('*/', at + 2)
            require(end >= 0, 'MANIFEST_ACCEPT_CONFIG_INVALID')
            return end + 2
        if char == '/':
            return regex(at)
        return None

    def expression(at, depth):
        require(depth <= 32, 'MANIFEST_ACCEPT_CONFIG_INVALID')
        braces = 1
        while at < size:
            end = skipped(at, depth)
            if end is not None:
                at = end
                continue
            if text[at] == '{':
                braces += 1
            elif text[at] == '}':
                braces -= 1
                if braces == 0:
                    return at + 1
            at += 1
        refuse('MANIFEST_ACCEPT_CONFIG_INVALID')

    def template(at, depth):
        require(depth <= 32, 'MANIFEST_ACCEPT_CONFIG_INVALID')
        at += 1
        while at < size:
            if text[at] == '\\':
                at += 2
            elif text[at] == '`':
                return at + 1
            elif text.startswith('${', at):
                at = expression(at + 2, depth)
            else:
                at += 1
        refuse('MANIFEST_ACCEPT_CONFIG_INVALID')

    at = 0
    while at < size:
        end = skipped(at, 0)
        if end is None:
            at += 1
        else:
            blank(at, end)
            at = end
    return ''.join(masked)


def expected_digest(config_bytes):
    try:
        text = config_bytes.decode('utf-8')
    except UnicodeError:
        refuse('MANIFEST_ACCEPT_CONFIG_INVALID')
    mask = javascript_code_mask(text)
    require(len(re.findall(r'\bMANIFEST_ACCEPT_SHA256\s*=', mask)) == 1, 'MANIFEST_ACCEPT_CONFIG_INVALID')
    pattern = r'^[ \t]*export[ \t]+const[ \t]+MANIFEST_ACCEPT_SHA256[ \t]*=[ \t]*([\'\"])([a-f0-9]{64})\1[ \t]*;[ \t]*(?://[^\r\n]*)?$'
    matches = [match for match in re.finditer(pattern, text, re.MULTILINE)
               if re.match(r'^[ \t]*export[ \t]+const[ \t]+MANIFEST_ACCEPT_SHA256[ \t]*=', mask[match.start():match.end()])]
    require(len(matches) == 1 and matches[0].group(2) == EXPECTED_DIGEST, 'MANIFEST_ACCEPT_CONFIG_INVALID')
    return EXPECTED_DIGEST


def current_directory(root, root_id, directory, io):
    with ExitStack() as stack:
        found_root = open_directory(root, io, stack, owned=True)
        require(identifier(io.fstat(found_root)) == root_id, 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
        if directory is not None:
            found = open_child(found_root, 'contexts', io, stack, private=True)
            require(identifier(io.fstat(found)) == identifier(io.fstat(directory)), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')


def maybe_stat(parent, leaf, io):
    try:
        return io.stat(leaf, dir_fd=parent, follow_symlinks=False)
    except FileNotFoundError:
        return None


def checked_target(directory, leaf, digest, io, stack):
    before = io.stat(leaf, dir_fd=directory, follow_symlinks=False)
    checked_file(before, io, private=True)
    require(before.st_size <= MAX_HELPER_BYTES, 'MANIFEST_ACCEPT_FILE_TOO_LARGE')
    fd = io.open(leaf, io.O_RDONLY | io.O_NOFOLLOW | io.O_CLOEXEC | io.O_NONBLOCK, dir_fd=directory)
    stack.callback(io.close, fd)
    opened = io.fstat(fd)
    checked_file(opened, io, private=True)
    require(version(before) == version(opened), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
    chunks, size = [], 0
    while True:
        chunk = io.read(fd, min(65536, MAX_HELPER_BYTES + 1 - size))
        if not chunk:
            break
        size += len(chunk)
        require(size <= MAX_HELPER_BYTES, 'MANIFEST_ACCEPT_FILE_TOO_LARGE')
        chunks.append(chunk)
    final = io.fstat(fd)
    checked_file(final, io, private=True)
    require(version(opened) == version(final), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
    require(version(io.stat(leaf, dir_fd=directory, follow_symlinks=False)) == version(final), 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
    require(hashlib.sha256(b''.join(chunks)).hexdigest() == digest, 'MANIFEST_ACCEPT_HASH_MISMATCH')


def remove_owned(directory, leaf, identity, io):
    entry = maybe_stat(directory, leaf, io)
    if entry is not None and stat.S_ISREG(entry.st_mode) and entry.st_uid == io.getuid() and identifier(entry) == identity:
        io.unlink(leaf, dir_fd=directory)


def run(command, *, source_root=None, storage_api=None, io=None, emit=print):
    # Keyword-only seams are for in-memory tests; argparse exposes only setup/check.
    require(command in {'setup', 'check'}, 'MANIFEST_ACCEPT_COMMAND_INVALID')
    io = os if io is None else io
    store = storage if storage_api is None else storage_api
    source_root = ROOT if source_root is None else Path(source_root)
    capabilities(io)
    root = store.build_root(str(store.BUILD_ROOT))
    require(store.mounted() is True, 'PROJECT_STORAGE_NOT_MOUNTED')
    config = read_file(source_root / CONFIG_RELATIVE, io)
    digest = expected_digest(config)
    content = read_file(source_root / SOURCE_RELATIVE, io)
    require(hashlib.sha256(content).hexdigest() == digest, 'MANIFEST_ACCEPT_SOURCE_CHANGED')
    read_file(PYTHON, io, executable=True)
    leaf = 'manifest-accept-' + digest + '.py'
    target = root / 'contexts' / leaf
    with ExitStack() as stack:
        root_fd = open_directory(root, io, stack, owned=True)
        root_id = identifier(io.fstat(root_fd))
        entry = maybe_stat(root_fd, 'contexts', io)
        if entry is None and command == 'setup':
            current_directory(root, root_id, None, io)
            io.mkdir('contexts', mode=0o700, dir_fd=root_fd)
        directory = open_child(root_fd, 'contexts', io, stack, private=True)
        current_directory(root, root_id, directory, io)
        if maybe_stat(directory, leaf, io) is None and command == 'setup':
            current_directory(root, root_id, directory, io)
            fd = io.open(leaf, io.O_WRONLY | io.O_CREAT | io.O_EXCL | io.O_NOFOLLOW | io.O_CLOEXEC, 0o400, dir_fd=directory)
            stack.callback(io.close, fd)
            own_id = identifier(io.fstat(fd))
            try:
                view = memoryview(content)
                while view:
                    count = io.write(fd, view)
                    require(type(count) is int and count > 0, 'MANIFEST_ACCEPT_WRITE_FAILED')
                    view = view[count:]
                io.fchmod(fd, 0o400)
                io.fsync(fd)
                checked_file(io.fstat(fd), io, private=True)
                require(identifier(io.stat(leaf, dir_fd=directory, follow_symlinks=False)) == own_id, 'MANIFEST_ACCEPT_IDENTITY_CHANGED')
                current_directory(root, root_id, directory, io)
                checked_target(directory, leaf, digest, io, stack)
                io.fsync(directory)
                io.fsync(root_fd)
            except (RuntimeError, OSError):
                # Remove only our matching entry, not an unknown replacement.
                remove_owned(directory, leaf, own_id, io)
                raise
        checked_target(directory, leaf, digest, io, stack)
        current_directory(root, root_id, directory, io)
    emit(json.dumps({'status': 'PASS', 'build_root': str(root), 'helper': str(target), 'sha256': digest, 'interpreter': str(PYTHON)}, indent=2))
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=('setup', 'check'))
    try:
        raise SystemExit(run(parser.parse_args().command))
    except (RuntimeError, OSError) as cause:
        print(json.dumps({'status': 'BLOCKED_ENV', 'error': str(cause)}))
        raise SystemExit(20)
