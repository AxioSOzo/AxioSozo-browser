#!/usr/bin/env python3
"""Product-owned POSIX metadata seam. No content reads, shell, or TCP sockets.

Invoke with a trusted, explicitly configured interpreter: python -I -S -B
agent_socket.py <operation> <JSON>. The browser never searches PATH for it.
Directory traversal is relative to no-follow directory fds. Only an exact
current-user socket in a 0700 parent can be probed or conditionally removed.
"""
import errno
import fcntl
import json
import os
import socket
import stat
import sys

MAX_ARGUMENT = 16384
OPS = {"uid", "lstat", "mkdir", "probe", "remove", "lock"}


class Refused(Exception):
    def __init__(self, code):
        self.code = code


def path_value(value):
    if (not isinstance(value, str) or not value.startswith("/") or
            value.endswith("/") or "//" in value or
            any(part in {".", ".."} for part in value.split("/")) or
            any(ord(char) < 32 or 127 <= ord(char) <= 159 for char in value) or
            len(value.encode("utf-8")) > 100):
        raise Refused("INVALID_SOCKET_PATH")
    return value


def info(value):
    mode = value.st_mode
    kind = ("socket" if stat.S_ISSOCK(mode) else "directory" if stat.S_ISDIR(mode)
            else "regular" if stat.S_ISREG(mode) else "symlink" if stat.S_ISLNK(mode) else "other")
    return {"kind": kind, "uid": value.st_uid, "mode": stat.S_IMODE(mode),
            "device": str(value.st_dev), "inode": str(value.st_ino)}


def same(left, right):
    return all(left.get(key) == right.get(key) for key in ("kind", "uid", "device", "inode"))


def directory_allowed(value):
    return (stat.S_ISDIR(value.st_mode) and value.st_uid in {0, os.getuid()} and
            (not stat.S_IMODE(value.st_mode) & 0o022 or bool(value.st_mode & stat.S_ISVTX)))


def parent_fd(path):
    """Open every directory without following symlinks; no recursive mkdir."""
    flags = os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC
    current = os.open("/", flags)
    try:
        if not directory_allowed(os.fstat(current)):
            raise Refused("SOCKET_PATH_BLOCKED")
        for component in path.split("/")[1:-1]:
            prior = os.stat(component, dir_fd=current, follow_symlinks=False)
            if not directory_allowed(prior):
                raise Refused("SOCKET_PATH_BLOCKED")
            child = os.open(component, flags, dir_fd=current)
            actual = os.fstat(child)
            if not same(info(prior), info(actual)) or not directory_allowed(actual):
                os.close(child)
                raise Refused("SOCKET_PATH_BLOCKED")
            os.close(current)
            current = child
        return current
    except BaseException:
        os.close(current)
        raise


def leaf_info(fd, leaf):
    try:
        return info(os.stat(leaf, dir_fd=fd, follow_symlinks=False))
    except FileNotFoundError:
        return None


def protected_socket(fd, leaf):
    parent = info(os.fstat(fd))
    value = leaf_info(fd, leaf)
    if (parent["kind"] != "directory" or parent["uid"] != os.getuid() or parent["mode"] != 0o700 or
            value is None or value["kind"] != "socket" or value["uid"] != os.getuid() or value["mode"] != 0o600):
        raise Refused("SOCKET_PATH_BLOCKED")
    return value, parent


def probe(path):
    # AF_UNIX is the only family created by this helper. No application bytes
    # are sent; establishing the connection suffices to prove a live listener.
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
        client.settimeout(0.25)
        try:
            client.connect(path)
            return {"state": "live"}
        except OSError as cause:
            name = errno.errorcode.get(cause.errno, "UNKNOWN")
            return {"state": "refused" if cause.errno == errno.ECONNREFUSED else "unknown", "rawErrno": name}


def lifetime_lock(payload):
    """Hold one product-wide lock until the browser closes our stdin.

    The lock file stays in place after release. Unlinking advisory lock files
    would let concurrent instances lock different inodes at the same name.
    """
    if set(payload) != {"path", "parent"} or not isinstance(payload["parent"], dict):
        raise Refused("INVALID_PARAMS")
    path = path_value(payload["path"])
    fd = parent_fd(path)
    lock_fd = None
    try:
        parent = info(os.fstat(fd))
        if (parent["uid"] != os.getuid() or parent["mode"] != 0o700 or
                not same(parent, payload["parent"])):
            raise Refused("SOCKET_PATH_BLOCKED")
        leaf = path.rsplit("/", 1)[-1] + ".lock"
        existing = leaf_info(fd, leaf)
        if existing is not None:
            named = os.stat(leaf, dir_fd=fd, follow_symlinks=False)
            if (existing["kind"] != "regular" or existing["uid"] != os.getuid() or
                    existing["mode"] != 0o600 or named.st_nlink != 1):
                raise Refused("SOCKET_PATH_BLOCKED")
        # Reject nonregular entries before opening and remain nonblocking if
        # an entry changes before open. Every opened fd is checked again below.
        flags = os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK
        lock_fd = os.open(leaf, flags, 0o600, dir_fd=fd)
        value = os.fstat(lock_fd)
        named = os.stat(leaf, dir_fd=fd, follow_symlinks=False)
        if (not stat.S_ISREG(value.st_mode) or value.st_uid != os.getuid() or
                stat.S_IMODE(value.st_mode) != 0o600 or value.st_nlink != 1 or
                not same(info(value), info(named))):
            raise Refused("SOCKET_PATH_BLOCKED")
        try:
            fcntl.flock(lock_fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError as cause:
            if cause.errno in {errno.EAGAIN, errno.EWOULDBLOCK, errno.EACCES}:
                raise Refused("SOCKET_IN_USE") from None
            raise
        # Lock before probing/binding and retain it through listener shutdown.
        # A browser crash closes stdin, exits this process, and releases flock.
        sys.stdout.write('{"ok":true,"result":true}\n')
        sys.stdout.flush()
        sys.stdin.buffer.read(1)
        return
    finally:
        if lock_fd is not None:
            os.close(lock_fd)
        os.close(fd)


def operation(name, payload):
    if name == "uid":
        if payload != {}:
            raise Refused("INVALID_PARAMS")
        return os.getuid()
    path = path_value(payload.get("path"))
    allowed = {"path", "identity", "parent"} if name == "remove" else {"path", "mode"} if name == "mkdir" else {"path"}
    if set(payload) != allowed:
        raise Refused("INVALID_PARAMS")
    fd = parent_fd(path)
    leaf = path.rsplit("/", 1)[-1]
    try:
        if name == "lstat":
            return leaf_info(fd, leaf)
        if name == "mkdir":
            if payload["mode"] != 0o700:
                raise Refused("INVALID_PARAMS")
            try:
                os.mkdir(leaf, 0o700, dir_fd=fd)
            except FileExistsError:
                pass
            created = leaf_info(fd, leaf)
            if not created or created["kind"] != "directory" or created["uid"] != os.getuid() or created["mode"] != 0o700:
                raise Refused("SOCKET_PATH_BLOCKED")
            return True
        if name == "probe":
            protected_socket(fd, leaf)
            return probe(path)
        if name == "remove":
            expected, expected_parent = payload["identity"], payload["parent"]
            if not isinstance(expected, dict) or not isinstance(expected_parent, dict):
                raise Refused("INVALID_PARAMS")
            actual, parent = protected_socket(fd, leaf)
            if not same(expected, actual) or not same(expected_parent, parent):
                return False
            # Recheck immediately before unlink; an ambiguous type, owner,
            # mode, inode or parent never authorizes removal. Protected parent
            # prevents another uid from swapping the directory entry.
            latest, latest_parent = protected_socket(fd, leaf)
            if not same(actual, latest) or not same(parent, latest_parent):
                return False
            os.unlink(leaf, dir_fd=fd)
            return True
        raise Refused("INVALID_PARAMS")
    finally:
        os.close(fd)


def main():
    try:
        if len(sys.argv) != 3 or sys.argv[1] not in OPS or len(sys.argv[2].encode("utf-8")) > MAX_ARGUMENT:
            raise Refused("INVALID_PARAMS")
        if (not hasattr(os, "O_NOFOLLOW") or not hasattr(socket, "AF_UNIX") or
                not {os.stat, os.mkdir, os.unlink, os.open}.issubset(os.supports_dir_fd) or
                os.stat not in os.supports_follow_symlinks):
            raise Refused("EXACT_SOCKET_METADATA_UNAVAILABLE")
        payload = json.loads(sys.argv[2])
        if not isinstance(payload, dict):
            raise Refused("INVALID_PARAMS")
        if sys.argv[1] == "lock":
            lifetime_lock(payload)
            return 0
        result = {"ok": True, "result": operation(sys.argv[1], payload)}
    except Refused as cause:
        result = {"ok": False, "error": cause.code}
    except (OSError, ValueError, TypeError, UnicodeError):
        # Do not expose filesystem paths or platform diagnostics to clients.
        result = {"ok": False, "error": "SOCKET_PATH_BLOCKED"}
    encoded = json.dumps(result, ensure_ascii=True, separators=(",", ":"))
    if len(encoded) > MAX_ARGUMENT:
        encoded = '{"ok":false,"error":"EXACT_SOCKET_METADATA_UNAVAILABLE"}'
    sys.stdout.write(encoded + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
