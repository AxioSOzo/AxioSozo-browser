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
        self._cleanup_uncertain = False
        self.cleanup_report = {"state": "NOT_CLOSED", "direct_children_reaped": False,
                               "groups": "NOT_VERIFIED"}

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
        # SIGCHLD must remain default and each Popen must have a sole waiter
        # throughout its lifetime; an unreaped leader reserves its group ID.
        if signal.getsignal(signal.SIGCHLD) != signal.SIG_DFL:
            raise RuntimeError("DEFAULT_SIGCHLD_REQUIRED")
        if self._cleanup_uncertain:
            raise RuntimeError("SESSION_CLEANUP_UNCERTAIN")
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
        uncertain = self._cleanup_uncertain
        pending = [process for process in reversed(self.processes)
                   if process.returncode is None]

        def signal_unreaped(process, sig):
            nonlocal uncertain
            if (process.returncode is not None
                    or signal.getsignal(signal.SIGCHLD) != signal.SIG_DFL):
                uncertain = True
                return
            try:
                os.killpg(process.pid, sig)
            except ProcessLookupError:
                pass
            except (Exception, KeyboardInterrupt):
                # EPERM can occur for a zombie-only group. It does not prove
                # that unknown descendants or profiles are inactive.
                uncertain = True

        if pending:
            if signal.getsignal(signal.SIGCHLD) != signal.SIG_DFL:
                uncertain = True
            else:
                for process in pending:
                    signal_unreaped(process, signal.SIGTERM)
                # Do not poll or wait during grace. Even an exited original
                # leader must remain unreaped until every group signal ends.
                deadline = time.monotonic() + 5
                try:
                    while True:
                        remaining = deadline - time.monotonic()
                        if remaining <= 0:
                            break
                        time.sleep(remaining)
                except (Exception, KeyboardInterrupt):
                    uncertain = True
                for process in pending:
                    signal_unreaped(process, signal.SIGKILL)
                # All group signals precede the first reap. Callers that already
                # reaped a leader grant no authority to sweep its descendants.
                for process in pending:
                    if process.returncode is None:
                        if signal.getsignal(signal.SIGCHLD) != signal.SIG_DFL:
                            uncertain = True
                            continue
                        try:
                            process.wait(timeout=5)
                        except (Exception, KeyboardInterrupt):
                            uncertain = True

        direct_children_reaped = all(process.returncode is not None
                                     for process in self.processes)
        if not direct_children_reaped:
            # Retain the lease and streams while any direct leader is unreaped.
            uncertain = True
        else:
            for process in reversed(self.processes):
                for stream in (process.stdin, process.stdout, process.stderr):
                    if stream:
                        try:
                            stream.close()
                        except (Exception, KeyboardInterrupt):
                            uncertain = True
            self.processes.clear()
            # CEF UUID names and a before/after inventory cannot prove inactive
            # ownership. Preserve all profile directories; never infer deletion.
            if self.lock is not None:
                try:
                    fcntl.flock(self.lock, fcntl.LOCK_UN)
                except (Exception, KeyboardInterrupt):
                    uncertain = True
                try:
                    self.lock.close()
                except (Exception, KeyboardInterrupt):
                    uncertain = True
                else:
                    self.lock = None
        self._cleanup_uncertain = uncertain
        self.cleanup_report = {
            "state": "UNCERTAIN" if uncertain else "DIRECT_CHILDREN_REAPED",
            "direct_children_reaped": direct_children_reaped,
            "groups": "NOT_VERIFIED",
        }
        if not direct_children_reaped:
            raise RuntimeError("SESSION_CLEANUP_UNCERTAIN")
        return self.cleanup_report

    def __exit__(self, *_):
        self.close()
