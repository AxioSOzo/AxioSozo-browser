#!/usr/bin/env python3
"""Fixed lsof supervisor; Gecko's inherited FD3 stays open in this process.

The detached internal supervisor alone owns and reaps lsof. Closing the control
pipe (including abrupt outer-process death) cancels that child before exit. No
operation reads files, profiles or credentials. Only literal lsof selectors run.
"""
import json
import os
import selectors
import signal
import stat
import sys
import time

STDOUT_LIMIT = 1048576
STDERR_LIMIT = 16384
DEADLINE_SECONDS = 2.60
POLL_SECONDS = 0.01
REAP_SECONDS = 0.08
RESULT_LIMIT = STDOUT_LIMIT + 128
FIXED_ENV = {"PATH": "/usr/bin:/bin:/usr/sbin", "LANG": "C", "LC_ALL": "C"}
FIXED_LSOF = "/usr/sbin/lsof"
_ERRORS = {"ARRIVAL_CANCELLED", "ARRIVAL_DEADLINE", "ARRIVAL_OUTPUT_LIMIT",
           "ARRIVAL_CHILD_UNAVAILABLE", "ARRIVAL_SUPERVISOR_UNAVAILABLE"}
_stopped = False


def _stop(_number, _frame):
    global _stopped
    _stopped = True


def selector(operation, number, uid, *, own_uid=None):
    """Validate decimal CLI values and build exactly one of two fixed arrays."""
    own_uid = os.getuid() if own_uid is None else own_uid
    def decimal(value, maximum, minimum=0):
        if (not isinstance(value, str) or not value or len(value) > 10
                or not value.isascii() or not value.isdecimal()
                or (len(value) > 1 and value[0] == "0")):
            raise ValueError("ARRIVAL_INPUT_REFUSED")
        parsed = int(value)
        if not minimum <= parsed <= maximum:
            raise ValueError("ARRIVAL_INPUT_REFUSED")
        return parsed
    owner = decimal(uid, 4294967295)
    if owner != own_uid:
        raise ValueError("ARRIVAL_INPUT_REFUSED")
    if operation == "listen":
        port = decimal(number, 65535, 1)
        return ["-nP", "-a", "-iTCP:" + str(port), "-sTCP:LISTEN", "-F", "pun", "-u", str(owner)]
    if operation == "cwd":
        pid = decimal(number, 2147483647, 1)
        return ["-nP", "-a", "-p", str(pid), "-d", "cwd", "-F", "pn", "-u", str(owner)]
    raise ValueError("ARRIVAL_INPUT_REFUSED")


def _kill_and_reap(pid, *, group=False):
    # SIGKILL is deliberate: after cancellation no lsof state is preserved.
    if group:
        try:
            os.killpg(pid, signal.SIGKILL)
        except (ProcessLookupError, OSError):
            pass
    # The direct child remains owned until waitpid reaps it.
    try:
        os.kill(pid, signal.SIGKILL)
    except ProcessLookupError:
        pass
    expires = time.monotonic() + REAP_SECONDS
    while True:
        try:
            observed, _status = os.waitpid(pid, os.WNOHANG)
        except ChildProcessError:
            return True
        if observed == pid:
            return True
        if time.monotonic() >= expires:
            return False
        time.sleep(0.001)


def _spawn(argv):
    """No exec handshake can stall the supervisor's cancellation loop."""
    out_read, out_write = os.pipe()
    err_read, err_write = os.pipe()
    try:
        pid = os.fork()
    except OSError:
        for fd in (out_read, out_write, err_read, err_write):
            os.close(fd)
        raise
    if pid == 0:
        try:
            with open("/dev/null", "rb", buffering=0) as empty:
                os.dup2(empty.fileno(), 0)
            os.dup2(out_write, 1)
            os.dup2(err_write, 2)
            # Python-created pipe descriptors are non-inheritable. The fixed
            # child receives only stdin/stdout/stderr, including no Gecko FD3.
            for fd in (out_read, out_write, err_read, err_write):
                if fd > 2:
                    os.close(fd)
            os.chdir("/")
            os.execve(argv[0], argv, FIXED_ENV.copy())
        except BaseException:
            os._exit(126)
    os.close(out_write)
    os.close(err_write)
    return pid, out_read, err_read


def collect(argv, control_fd, *, deadline_seconds=DEADLINE_SECONDS):
    """Own, bound and reap a child. argv injection is import-only for tests."""
    global _stopped
    _stopped = False
    started = time.monotonic()
    parent = os.getppid()
    pid = None
    stdout = bytearray()
    stderr_bytes = 0
    error = None
    status = None
    read_fds = []
    monitor = selectors.DefaultSelector()
    try:
        if not 0 < deadline_seconds <= DEADLINE_SECONDS:
            raise ValueError("ARRIVAL_INPUT_REFUSED")
        os.set_blocking(control_fd, False)
        monitor.register(control_fd, selectors.EVENT_READ, "control")
        pid, out_read, err_read = _spawn(argv)
        read_fds = [out_read, err_read]
        for descriptor, kind in ((out_read, "stdout"), (err_read, "stderr")):
            os.set_blocking(descriptor, False)
            monitor.register(descriptor, selectors.EVENT_READ, kind)
        streams = 2
        while True:
            if _stopped or os.getppid() != parent:
                error = "ARRIVAL_CANCELLED"
                break
            if time.monotonic() - started >= deadline_seconds:
                error = "ARRIVAL_DEADLINE"
                break
            events = monitor.select(POLL_SECONDS)
            for key, _mask in events:
                try:
                    chunk = os.read(key.fd, 65536)
                except BlockingIOError:
                    continue
                if key.data == "control":
                    # No command data is accepted: any byte or EOF cancels.
                    error = "ARRIVAL_CANCELLED"
                    break
                if not chunk:
                    monitor.unregister(key.fileobj)
                    os.close(key.fd)
                    read_fds.remove(key.fd)
                    streams -= 1
                    continue
                if key.data == "stdout":
                    if len(stdout) + len(chunk) > STDOUT_LIMIT:
                        error = "ARRIVAL_OUTPUT_LIMIT"
                        break
                    stdout.extend(chunk)
                else:
                    stderr_bytes += len(chunk)
                    if stderr_bytes > STDERR_LIMIT:
                        error = "ARRIVAL_OUTPUT_LIMIT"
                        break
            if error:
                break
            if status is None:
                observed, raw_status = os.waitpid(pid, os.WNOHANG)
                if observed == pid:
                    status = os.waitstatus_to_exitcode(raw_status)
            if status is not None and streams == 0:
                # The detached supervisor destroys its entire owned group
                # after delivering this result, including any descendants.
                return status, bytes(stdout), None
    except (OSError, ValueError):
        error = "ARRIVAL_CHILD_UNAVAILABLE"
    finally:
        if pid is not None and status is None:
            _kill_and_reap(pid)
        monitor.close()
        for descriptor in read_fds:
            try:
                os.close(descriptor)
            except OSError:
                pass
    return 130 if error == "ARRIVAL_CANCELLED" else 124 if error == "ARRIVAL_DEADLINE" else 125, b"", error


def _write_result(fd, status, output, error):
    header = json.dumps({"status": status, "error": error}, separators=(",", ":")).encode("ascii") + b"\n"
    data = memoryview(header + output)
    try:
        while data:
            wrote = os.write(fd, data)
            data = data[wrote:]
    except (BrokenPipeError, OSError):
        pass


def supervise(argv, *, deadline_seconds=DEADLINE_SECONDS):
    """Keep inherited descriptors (notably FD3) in the outer Gecko child."""
    global _stopped
    _stopped = False
    control_read, control_write = os.pipe()
    result_read, result_write = os.pipe()
    started = time.monotonic()
    original_parent = os.getppid()
    try:
        supervisor = os.fork()
    except OSError:
        for fd in (control_read, control_write, result_read, result_write):
            os.close(fd)
        return 125, b"", "ARRIVAL_SUPERVISOR_UNAVAILABLE"
    if supervisor == 0:
        os.close(control_write)
        os.close(result_read)
        # Do not keep Gecko's sentinel or native stdout/stderr alive here.
        # These pipes were allocated while FD3 was open, so none aliases 3.
        for fd in (0, 1, 2, 3):
            if fd not in (control_read, result_write):
                try:
                    os.close(fd)
                except OSError:
                    pass
        signal.signal(signal.SIGTERM, _stop)
        signal.signal(signal.SIGINT, _stop)
        owned_group = False
        try:
            os.setsid()
            owned_group = os.getpgrp() == os.getpid()
            if not owned_group:
                raise OSError("ARRIVAL_SUPERVISOR_UNAVAILABLE")
            status, output, error = collect(argv, control_read, deadline_seconds=deadline_seconds)
            _write_result(result_write, status, output, error)
        except BaseException:
            _write_result(result_write, 125, b"", "ARRIVAL_SUPERVISOR_UNAVAILABLE")
        finally:
            os.close(control_read)
            os.close(result_write)
            # This owned group contains only this supervisor and its fixed
            # operation. End it even after abrupt outer-helper death.
            if owned_group:
                os.killpg(os.getpid(), signal.SIGKILL)
            os._exit(0)
    os.close(control_read)
    os.close(result_write)
    os.set_blocking(result_read, False)
    monitor = selectors.DefaultSelector()
    monitor.register(result_read, selectors.EVENT_READ)
    result = bytearray()
    cancelled = False
    cancelled_at = None
    completed = False
    try:
        while True:
            if not cancelled and (_stopped or os.getppid() != original_parent
                    or time.monotonic() - started >= deadline_seconds + 0.15):
                os.close(control_write)
                control_write = None
                cancelled = True
                cancelled_at = time.monotonic()
            if cancelled_at is not None and time.monotonic() - cancelled_at > 0.12:
                _kill_and_reap(supervisor, group=True)
                return 130, b"", "ARRIVAL_CANCELLED"
            for key, _mask in monitor.select(POLL_SECONDS):
                try:
                    chunk = os.read(key.fd, 65536)
                except BlockingIOError:
                    continue
                if not chunk:
                    completed = True
                    break
                result.extend(chunk)
                if len(result) > RESULT_LIMIT:
                    raise ValueError("ARRIVAL_OUTPUT_LIMIT")
            if completed:
                break
        _kill_and_reap(supervisor, group=True)
        first, delimiter, output = bytes(result).partition(b"\n")
        if not delimiter or len(first) > 128 or len(output) > STDOUT_LIMIT:
            raise ValueError("ARRIVAL_SUPERVISOR_UNAVAILABLE")
        parsed = json.loads(first)
        if (set(parsed) != {"status", "error"} or type(parsed["status"]) is not int
                or not -127 <= parsed["status"] <= 255
                or parsed["error"] is not None and parsed["error"] not in _ERRORS):
            raise ValueError("ARRIVAL_SUPERVISOR_UNAVAILABLE")
        if cancelled:
            return 130, b"", "ARRIVAL_CANCELLED"
        return parsed["status"], output, parsed["error"]
    except (OSError, ValueError, json.JSONDecodeError):
        if control_write is not None:
            os.close(control_write)
            control_write = None
        # First allow normal EOF cleanup, then bound a faulty internal worker.
        until = time.monotonic() + 0.12
        while time.monotonic() < until:
            try:
                observed, _status = os.waitpid(supervisor, os.WNOHANG)
                if observed == supervisor:
                    break
            except ChildProcessError:
                break
            time.sleep(0.001)
        else:
            _kill_and_reap(supervisor, group=True)
        return 125, b"", "ARRIVAL_SUPERVISOR_UNAVAILABLE"
    finally:
        if control_write is not None:
            os.close(control_write)
        os.close(result_read)
        monitor.close()


def validate_self():
    """Fixed file admission; no CLI path or interpreter override is accepted."""
    path = os.path.abspath(__file__)
    info = os.lstat(path)
    parent = os.path.dirname(path)
    directory = os.lstat(parent)
    if (not stat.S_ISREG(info.st_mode) or os.path.realpath(path) != path
            or info.st_uid != os.getuid() or info.st_nlink != 1
            or stat.S_IMODE(info.st_mode) != 0o400
            or not stat.S_ISDIR(directory.st_mode) or os.path.realpath(parent) != parent
            or directory.st_uid != os.getuid() or stat.S_IMODE(directory.st_mode) != 0o700):
        raise ValueError("ARRIVAL_SUPERVISOR_UNAVAILABLE")


def main(values):
    if len(values) != 3:
        sys.stderr.write("ARRIVAL_INPUT_REFUSED\n")
        return 125
    try:
        args = selector(*values)
    except ValueError:
        sys.stderr.write("ARRIVAL_INPUT_REFUSED\n")
        return 125
    try:
        validate_self()
    except (OSError, ValueError):
        sys.stderr.write("ARRIVAL_SUPERVISOR_UNAVAILABLE\n")
        return 125
    signal.signal(signal.SIGTERM, _stop)
    signal.signal(signal.SIGINT, _stop)
    status, output, error = supervise([FIXED_LSOF, *args])
    if error:
        sys.stderr.write(error + "\n")
    else:
        sys.stdout.buffer.write(output)
        sys.stdout.buffer.flush()
    if status < 0:
        signum = -status
        if signum not in (signal.SIGKILL, signal.SIGSTOP):
            signal.signal(signum, signal.SIG_DFL)
        os.kill(os.getpid(), signum)
        return 125
    return status


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
