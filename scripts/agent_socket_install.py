#!/usr/bin/env python3
"""Install/check the fixed checksum-pinned product socket helper. Lead review first.

Candidate destination: scripts/agent_socket_install.py. The helper source belongs
at tools/axiosozo-agent/agent_socket.py; helper and interpreter are never executed
by this installer. Never replace a failed/mismatched existing checksum target.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import storage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools/axiosozo-agent/agent_socket.py"
CONFIG = ROOT / "apps/browser/chrome/AgentChannelConfig.sys.mjs"
PYTHON = Path("/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11")
MAX_HELPER = 128 * 1024


def refused():
    raise RuntimeError("AGENT_SOCKET_INSTALL_REFUSED")


def expected_digest():
    matches = re.findall(r'^export const AGENT_SOCKET_SHA256 = "([a-f0-9]{64})";', CONFIG.read_text(), re.M)
    if len(matches) != 1:
        refused()
    return matches[0]


def identity(info):
    return info.st_dev, info.st_ino, info.st_uid, info.st_mode, info.st_nlink, info.st_size


def regular(info, mode=None):
    return (stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid()
            and info.st_nlink == 1 and not info.st_mode & 0o022
            and (mode is None or stat.S_IMODE(info.st_mode) == mode))


def open_parent(path):
    """Anchor every component with no-follow dirfds; reject mutable ancestors."""
    if not path.is_absolute() or path.resolve() != path:
        refused()
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
    current = os.open("/", flags)
    try:
        for component in path.parts[1:-1]:
            before = os.stat(component, dir_fd=current, follow_symlinks=False)
            if (not stat.S_ISDIR(before.st_mode) or before.st_uid not in {0, os.getuid()}
                    or before.st_mode & 0o022 and not before.st_mode & stat.S_ISVTX):
                refused()
            child = os.open(component, flags, dir_fd=current)
            actual = os.fstat(child)
            if identity(before) != identity(actual):
                os.close(child)
                refused()
            os.close(current)
            current = child
        return current
    except BaseException:
        os.close(current)
        raise


def checked_bytes(path, *, mode=None, executable=False, digest=None):
    parent = open_parent(path)
    descriptor = None
    try:
        named = os.stat(path.name, dir_fd=parent, follow_symlinks=False)
        if not regular(named, mode) or executable and not named.st_mode & 0o111:
            refused()
        # O_NONBLOCK prevents a swapped FIFO from blocking before fstat.
        descriptor = os.open(path.name, os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK, dir_fd=parent)
        actual = os.fstat(descriptor)
        if identity(named) != identity(actual) or not regular(actual, mode):
            refused()
        if digest is None:
            return None
        if actual.st_size > MAX_HELPER:
            refused()
        value = bytearray()
        while len(value) <= MAX_HELPER:
            part = os.read(descriptor, min(8192, MAX_HELPER + 1 - len(value)))
            if not part:
                break
            value.extend(part)
        latest = os.stat(path.name, dir_fd=parent, follow_symlinks=False)
        if (len(value) > MAX_HELPER or identity(actual) != identity(os.fstat(descriptor))
                or identity(actual) != identity(latest)
                or hashlib.sha256(value).hexdigest() != digest):
            refused()
        return bytes(value)
    finally:
        if descriptor is not None:
            os.close(descriptor)
        os.close(parent)


def install_directory(root, setup):
    # The active storage policy allows only the mounted volume or one admitted
    # direct child. No actor/project/profile data changes this namespace.
    if storage.build_root(str(root)) != root:
        refused()
    directory = root / "contexts"
    parent = open_parent(directory)
    try:
        if setup:
            try:
                os.mkdir(directory.name, 0o700, dir_fd=parent)
            except FileExistsError:
                pass
        named = os.stat(directory.name, dir_fd=parent, follow_symlinks=False)
        if (not stat.S_ISDIR(named.st_mode) or named.st_uid != os.getuid()
                or stat.S_IMODE(named.st_mode) != 0o700):
            refused()
        descriptor = os.open(directory.name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=parent)
        actual = os.fstat(descriptor)
        if identity(named) != identity(actual):
            os.close(descriptor)
            refused()
        return directory, descriptor
    finally:
        os.close(parent)


def run(command):
    if not storage.mounted():
        raise RuntimeError("PROJECT_STORAGE_NOT_MOUNTED")
    digest = expected_digest()
    source = checked_bytes(SOURCE, digest=digest)
    checked_bytes(PYTHON, executable=True)
    directory, descriptor = install_directory(storage.BUILD_ROOT, command == "setup")
    target = directory / ("agent-socket-" + digest + ".py")
    try:
        if command == "setup":
            try:
                output = os.open(target.name, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW | os.O_CLOEXEC,
                                 0o400, dir_fd=descriptor)
            except FileExistsError:
                pass
            else:
                # An incomplete new target remains fail-closed on later checks;
                # no existing file is replaced or unlinked by this installer.
                with os.fdopen(output, "wb") as out:
                    out.write(source)
                    out.flush()
                    os.fsync(out.fileno())
        # Bind the named parent to our directory fd before pathname verification.
        if identity(os.fstat(descriptor)) != identity(directory.lstat()):
            refused()
        checked_bytes(target, mode=0o400, digest=digest)
    finally:
        os.close(descriptor)
    print(json.dumps({"status": "PASS", "build_root": str(storage.BUILD_ROOT), "helper": str(target),
                      "sha256": digest, "interpreter": str(PYTHON)}, indent=2))
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("setup", "check"))
    raise SystemExit(run(parser.parse_args().command))
