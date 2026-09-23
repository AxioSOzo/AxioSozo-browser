"""Owned development processes. No global daemon, TCP control socket or pid-file killing."""
import fcntl
import contextlib
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import signal
import stat
import subprocess
import time


def private_directory(path):
    path = Path(path)
    if not path.is_absolute() or ".." in path.parts:
        raise RuntimeError("session directory must be absolute")
    # Never follow a symlink in the runtime namespace to another profile/project.
    current = Path(path.anchor)
    for part in path.parts[1:]:
        current = current / part
        try:
            info = current.lstat()
        except FileNotFoundError:
            current.mkdir(mode=0o700)
            info = current.lstat()
        if not stat.S_ISDIR(info.st_mode):
            raise RuntimeError("unsafe session directory ancestor")
    info = path.lstat()
    if not stat.S_ISDIR(info.st_mode) or info.st_uid != os.getuid():
        raise RuntimeError("unsafe session directory")
    path.chmod(0o700)
    return path


class SessionBusy(RuntimeError):
    pass


def cef_profile_names(directory):
    """Inventory UUID-named CEF profiles without following links."""
    names = set()
    try:
        if not stat.S_ISDIR(directory.lstat().st_mode):
            return names
    except FileNotFoundError:
        return names
    for path in directory.iterdir():
        if not re.fullmatch(r"cef-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}", path.name):
            continue
        try:
            if stat.S_ISDIR(path.lstat().st_mode):
                names.add(path.name)
        except FileNotFoundError:
            pass
    return names


class OwnedSession:
    def __init__(self, path):
        self.path = private_directory(path)
        self.processes = []
        self.lock = None
        self.session_id = secrets.token_hex(16)
        self.token = secrets.token_hex(32)
        self.cef_profiles_before = set()
        self._path_identity = None

    def __enter__(self):
        fd = os.open(self.path / "owner.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
        info = os.fstat(fd)
        if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_nlink != 1:
            os.close(fd)
            raise RuntimeError("unsafe session lock")
        self.lock = os.fdopen(fd, "r+")
        try:
            fcntl.flock(self.lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            self.lock.close()
            self.lock = None
            raise SessionBusy("This development profile already has an owner") from None
        self.lock.seek(0)
        self.lock.truncate()
        json.dump({"pid": os.getpid(), "session_id": self.session_id}, self.lock)
        self.lock.flush()
        info = self.path.lstat()
        self._path_identity = (info.st_dev, info.st_ino)
        self.cef_profiles_before = cef_profile_names(self.path)
        return self

    def spawn(self, argv, **kwargs):
        if self.lock is None:
            raise RuntimeError("session ownership required")
        process = subprocess.Popen(argv, start_new_session=True, **kwargs)
        self.processes.append(process)
        return process

    def start_coordinator(self, binary):
        reader, writer = os.pipe()
        env = {"PATH": "/usr/bin:/bin", "AXIOSOZO_BOOTSTRAP_FD": str(reader),
               "AXIOSOZO_SESSION_ID": self.session_id}
        try:
            process = self.spawn([str(binary)], env=env, pass_fds=(reader,),
                                 stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, text=True, bufsize=1)
            os.close(reader)
            reader = None
            os.write(writer, self.token.encode("ascii"))
            return process
        finally:
            if reader is not None:
                os.close(reader)
            os.close(writer)

    def message(self, request_id, method="capabilities", **body):
        return {"version": 1, "request_id": request_id, "session_id": self.session_id,
                "token": self.token, "body": {"method": method, **body}}

    def close(self):
        for process in reversed(self.processes):
            # Groups were created by this object. Terminate descendants too if their
            # direct parent exited; never discover/kill processes by executable name.
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
        for process in reversed(self.processes):
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.wait(timeout=5)
            # A child can outlive a direct parent which already exited on SIGTERM.
            # Escalation therefore also covers that session-owned process group.
            try:
                os.killpg(process.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            for stream in (process.stdin, process.stdout, process.stderr):
                if stream:
                    with contextlib.suppress(OSError):
                        stream.close()
        self.processes.clear()
        if self.lock is not None:
            try:
                # Remove only CEF profiles created in this owned session.
                info = self.path.lstat()
                if (stat.S_ISDIR(info.st_mode) and info.st_uid == os.getuid()
                        and (info.st_dev, info.st_ino) == self._path_identity):
                    for name in cef_profile_names(self.path) - self.cef_profiles_before:
                        child = self.path / name
                        try:
                            child_info = child.lstat()
                            if stat.S_ISDIR(child_info.st_mode) and child_info.st_uid == os.getuid():
                                shutil.rmtree(child)
                        except FileNotFoundError:
                            # Gecko also removes this exact session-owned profile
                            # after its native child exits; concurrent removal wins.
                            pass
            finally:
                fcntl.flock(self.lock, fcntl.LOCK_UN)
                self.lock.close()
                self.lock = None

    def __exit__(self, *_):
        self.close()
