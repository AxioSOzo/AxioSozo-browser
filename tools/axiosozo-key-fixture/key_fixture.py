#!/usr/bin/env python3
"""TEST FIXTURE ONLY: presence markers; no Keychain, network, provider or secret storage.

The CLI is admitted only from its hash-named copy in one new owned workstation
fixture directory. Imported PresenceState is testable with an invented private
fixture directory. Its state is the literal marker b"stored\n", never key data.
"""
import fcntl
import hashlib
import os
from pathlib import Path
import re
import stat
import sys

BASE = Path("/Volumes/AxioSozoBuild/workstation/gui-fixtures")
ROOT_NAME = re.compile(r"keys-[0-9a-f]{32}\Z")
HELPER_NAME = re.compile(r"key-helper-([0-9a-f]{64})\.py\Z")
MAX_INPUT = 4096
MARKER = b"stored\n"
PROVIDERS = ("jev", "openai")
OPERATIONS = ("exists", "store", "remove")
NOFOLLOW = os.O_NOFOLLOW | os.O_NONBLOCK


def allowed_path(path):
    return (isinstance(path, Path) and path.is_absolute() and path.parent.parent == BASE
            and ROOT_NAME.fullmatch(path.parent.name) is not None
            and HELPER_NAME.fullmatch(path.name) is not None)


def private(info, kind):
    return (kind(info.st_mode) and info.st_uid == os.getuid()
            and stat.S_IMODE(info.st_mode) == (0o700 if kind is stat.S_ISDIR else 0o600)
            and (kind is stat.S_ISDIR or info.st_nlink == 1))


def require_private_file(fd):
    if not private(os.fstat(fd), stat.S_ISREG):
        raise ValueError("REFUSED")


class PresenceState:
    """Only relative fixed filenames are accepted after an owned directory fd."""
    def __init__(self, directory_fd):
        self.directory_fd = directory_fd
        if not private(os.fstat(directory_fd), stat.S_ISDIR):
            raise ValueError("REFUSED")

    def _read_marker(self, provider):
        try:
            fd = os.open(provider + ".presence", os.O_RDONLY | NOFOLLOW, dir_fd=self.directory_fd)
        except FileNotFoundError:
            return None
        try:
            require_private_file(fd)
            info = os.fstat(fd)
            if info.st_size != len(MARKER) or os.read(fd, len(MARKER) + 1) != MARKER:
                raise ValueError("REFUSED")
            return info
        finally:
            os.close(fd)

    def operate(self, operation, provider, data=b""):
        if provider not in PROVIDERS or operation not in OPERATIONS:
            return 2
        if operation == "store":
            expected = ("synthetic-gui-key-" + provider + "-plan4").encode("ascii")
            # Exact invented placeholders only; the helper refuses real keys.
            if not isinstance(data, bytes) or len(data) > MAX_INPUT or data != expected:
                return 2
        elif data:
            return 2
        lock = os.open("presence.lock", os.O_RDWR | os.O_CREAT | NOFOLLOW, 0o600, dir_fd=self.directory_fd)
        try:
            require_private_file(lock)
            # Presence checks may run together for the two providers. Mutations
            # still exclude all readers and writers and refuse rather than wait.
            kind = fcntl.LOCK_SH if operation == "exists" else fcntl.LOCK_EX
            fcntl.flock(lock, kind | fcntl.LOCK_NB)
            current = self._read_marker(provider)
            if operation == "exists":
                return 44 if current is None else 0
            if operation == "remove":
                if current is None:
                    return 44
                latest = os.stat(provider + ".presence", dir_fd=self.directory_fd, follow_symlinks=False)
                if (current.st_dev, current.st_ino) != (latest.st_dev, latest.st_ino):
                    raise ValueError("REFUSED")
                os.unlink(provider + ".presence", dir_fd=self.directory_fd)
                os.fsync(self.directory_fd)
                return 0
            if current is None:
                fd = os.open(provider + ".presence", os.O_WRONLY | os.O_CREAT | os.O_EXCL | NOFOLLOW,
                             0o600, dir_fd=self.directory_fd)
                try:
                    require_private_file(fd)
                    if os.write(fd, MARKER) != len(MARKER):
                        raise ValueError("REFUSED")
                    os.fsync(fd)
                finally:
                    os.close(fd)
                os.fsync(self.directory_fd)
            return 0
        finally:
            os.close(lock)


def admitted_directory(path):
    if not allowed_path(path):
        raise ValueError("REFUSED")
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW
    fd = os.open("/", flags)
    try:
        for component in path.parent.parts[1:]:
            child = os.open(component, flags, dir_fd=fd)
            os.close(fd)
            fd = child
        if not private(os.fstat(fd), stat.S_ISDIR):
            raise ValueError("REFUSED")
        source = os.open(path.name, os.O_RDONLY | NOFOLLOW, dir_fd=fd)
        try:
            info = os.fstat(source)
            if (not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_nlink != 1
                    or stat.S_IMODE(info.st_mode) != 0o400 or info.st_size > 65536):
                raise ValueError("REFUSED")
            content = os.read(source, 65537)
            if hashlib.sha256(content).hexdigest() != HELPER_NAME.fullmatch(path.name).group(1):
                raise ValueError("REFUSED")
        finally:
            os.close(source)
        result = fd
        fd = -1
        return result
    finally:
        if fd != -1:
            os.close(fd)


def main(argv, input_stream):
    if len(argv) not in (2, 3):
        return 2
    operation = argv[1]
    provider = argv[2] if len(argv) == 3 else "jev"
    if provider not in PROVIDERS or operation not in OPERATIONS:
        return 2
    # In particular, "read" is never implemented.
    data = input_stream.read(MAX_INPUT + 1) if operation == "store" else b""
    fd = admitted_directory(Path(__file__))
    try:
        return PresenceState(fd).operate(operation, provider, data)
    finally:
        data = b""
        os.close(fd)


if __name__ == "__main__":
    try:
        result = main(sys.argv, sys.stdin.buffer)
    except (OSError, ValueError, TypeError):
        result = 1
    # No output on stdout or stderr, including failed operations.
    raise SystemExit(result)
