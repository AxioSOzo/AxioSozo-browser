"""Real synthetic subprocess tests; never invokes lsof, a reference or profile."""
import importlib.util
import json
import os
from pathlib import Path
import select
import signal
import stat
import subprocess
import sys
import tempfile
import time
import unittest

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("arrival_lsof", HERE / "arrival_lsof.py")
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
ENV = {"PATH": "/usr/bin:/bin:/usr/sbin", "LANG": "C", "LC_ALL": "C"}


def alive(pid):
    # Presence observation only. A receipt PID never authorizes a signal.
    if pid is None:
        return False
    try:
        os.kill(pid, 0)
        return True
    except ProcessLookupError:
        return False
    except OSError:
        return True  # Unknown ownership/presence also fails closed, never signals.


class FixedSelectors(unittest.TestCase):
    def test_fixed_listen(self):
        self.assertEqual(helper.selector("listen", "44000", "501", own_uid=501),
                         ["-nP", "-a", "-iTCP:44000", "-sTCP:LISTEN", "-F", "pun", "-u", "501"])

    def test_fixed_cwd(self):
        self.assertEqual(helper.selector("cwd", "123", "501", own_uid=501),
                         ["-nP", "-a", "-p", "123", "-d", "cwd", "-F", "pn", "-u", "501"])

    def test_refuses_bad_ports_and_pids(self):
        for operation, value in [("listen", "0"), ("listen", "65536"), ("listen", "01"),
                                 ("listen", "-iTCP:80"), ("listen", "80;id"), ("listen", "８０"),
                                 ("cwd", "0"), ("cwd", "2147483648"), ("cwd", "1\n2")]:
            with self.subTest(operation=operation, value=value), self.assertRaises(ValueError):
                helper.selector(operation, value, "501", own_uid=501)

    def test_refuses_other_owner_and_operations(self):
        for operation, uid in [("listen", "502"), ("cwd", "0"), ("all", "501"), ("listen", "0501")]:
            with self.subTest(operation=operation, uid=uid), self.assertRaises(ValueError):
                helper.selector(operation, "123", uid, own_uid=501)

    def test_bad_cli_never_spawns(self):
        original = helper.supervise
        helper.supervise = lambda *_args, **_kwargs: self.fail("bad CLI started a supervisor")
        try:
            from contextlib import redirect_stderr
            import io
            output = io.StringIO()
            with redirect_stderr(output):
                self.assertEqual(helper.main(["listen", "0", str(os.getuid())]), 125)
                self.assertEqual(helper.main(["listen", "80", str(os.getuid()), "extra"]), 125)
            self.assertEqual(output.getvalue(), "ARRIVAL_INPUT_REFUSED\nARRIVAL_INPUT_REFUSED\n")
        finally:
            helper.supervise = original


class RealSyntheticProcesses(unittest.TestCase):
    def setUp(self):
        root = Path(os.environ.get("TMPDIR", ""))
        if not str(root).startswith("/Volumes/AxioSozoBuild/workstation/"):
            self.fail("external workstation TMPDIR required")
        self.directory = Path(tempfile.mkdtemp(prefix="arrival-supervisor-", dir=root))
        self.children = []  # Retained Popen handles are the only signal authority.
        self.receipt_pids = set()  # Assertions only, including possible PID reuse.
        self.created_paths = {}  # Registered paths plus admitted inode identities.
        info = self.directory.lstat()
        self.directory_identity = (info.st_dev, info.st_ino)

    def fixture_path(self, name):
        path = self.directory / name
        self.created_paths.setdefault(path, None)
        return path

    def remember_fixture_path(self, path, info=None):
        if path not in self.created_paths:
            self.fail("unregistered synthetic fixture path")
        current = path.lstat()
        if info is not None and (current.st_dev, current.st_ino) != (info.st_dev, info.st_ino):
            self.fail("synthetic fixture changed during admission")
        if current.st_uid != os.getuid():
            self.fail("synthetic fixture ownership changed")
        self.created_paths[path] = (current.st_dev, current.st_ino, stat.S_IFMT(current.st_mode))

    def has_test_failure(self):
        outcome = self._outcome
        if outcome is None:
            return False
        if not outcome.success:
            return True
        result = outcome.result
        return any(test is self or getattr(test, "test_case", None) is self
                   for test, _details in (*result.failures, *result.errors))

    def tearDown(self):
        problems = []
        for child in self.children:
            try:
                # Popen retains the direct child/reap relationship. Receipt
                # integers below are never used by terminate/kill/wait.
                if child.poll() is None:
                    child.terminate()
                    try:
                        child.wait(timeout=0.3)
                    except subprocess.TimeoutExpired:
                        child.kill()
                        child.wait(timeout=1)
                if child.returncode is None:
                    problems.append("OWNED_SUPERVISOR_NOT_REAPED")
            except (OSError, subprocess.TimeoutExpired):
                problems.append("OWNED_SUPERVISOR_CLEANUP_FAILED")
            finally:
                for stream in (child.stdout, child.stderr):
                    if stream:
                        try:
                            stream.close()
                        except OSError:
                            problems.append("OWNED_SUPERVISOR_PIPE_CLOSE_FAILED")
        # A number from an earlier marker may now identify another process.
        # Presence fails the assertion and preserves evidence; it never signals.
        if any(alive(pid) for pid in self.receipt_pids):
            problems.append("RECEIPT_PID_STILL_PRESENT_OR_REUSED")
        try:
            info = self.directory.lstat()
            if ((info.st_dev, info.st_ino) != self.directory_identity
                    or not stat.S_ISDIR(info.st_mode) or self.directory.resolve() != self.directory
                    or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700):
                problems.append("FIXTURE_DIRECTORY_CHANGED")
                entries = []
            else:
                entries = list(self.directory.iterdir())
                if any(path not in self.created_paths for path in entries):
                    problems.append("UNKNOWN_FIXTURE_ENTRIES_RETAINED")
                elif any(self.created_paths[path] is None
                         or (path.lstat().st_dev, path.lstat().st_ino, stat.S_IFMT(path.lstat().st_mode)) != self.created_paths[path]
                         or path.lstat().st_uid != os.getuid()
                         or not (stat.S_ISREG(path.lstat().st_mode) or stat.S_ISLNK(path.lstat().st_mode))
                         for path in entries):
                    problems.append("FIXTURE_ENTRY_CHANGED")
        except OSError:
            problems.append("FIXTURE_INSPECTION_FAILED")
            entries = []
        if problems or self.has_test_failure():
            print("SYNTHETIC_FIXTURE_RETAINED " + str(self.directory), file=sys.stderr)
            if problems:
                self.fail(", ".join(problems))
            return
        # Delete only registered entries after successful owned cleanup and no
        # remaining receipt presence. Unknown entries are never recursively removed.
        try:
            for path in entries:
                info = self.directory.lstat()
                current = path.lstat()
                if ((info.st_dev, info.st_ino) != self.directory_identity
                        or (current.st_dev, current.st_ino, stat.S_IFMT(current.st_mode)) != self.created_paths[path]):
                    raise RuntimeError("FIXTURE_CHANGED_BEFORE_DELETE")
                path.unlink()
            if (self.directory.lstat().st_dev, self.directory.lstat().st_ino) != self.directory_identity:
                raise RuntimeError("FIXTURE_DIRECTORY_CHANGED_BEFORE_DELETE")
            self.directory.rmdir()
        except (OSError, RuntimeError):
            print("SYNTHETIC_FIXTURE_RETAINED " + str(self.directory), file=sys.stderr)
            self.fail("FIXTURE_DELETE_FAILED_OR_CHANGED")

    def spawn(self, *args, sentinel=False):
        sentinel_read = None
        extra = {}
        command = [sys.executable, "-I", "-S", "-B", str(HERE / "synthetic_driver.py"), *map(str, args)]
        if sentinel:
            sentinel_read, sentinel_write = os.pipe()
            command = [sys.executable, "-I", "-S", "-B", str(HERE / "sentinel_launcher.py"), str(sentinel_write), *command[4:]]
            extra["pass_fds"] = (sentinel_write,)
        child = subprocess.Popen(command, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, cwd="/", env=ENV, **extra)
        self.children.append(child)
        if sentinel:
            os.close(sentinel_write)
        return child, sentinel_read

    def result(self, *args):
        child, _sentinel = self.spawn(*args)
        stdout, stderr = child.communicate(timeout=3)
        self.assertEqual(child.returncode, 0)
        self.assertEqual(stderr, b"")
        return json.loads(stdout)

    def ready(self, path):
        limit = time.monotonic() + 2
        while time.monotonic() < limit:
            if path.exists():
                descriptor = os.open(path, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
                with os.fdopen(descriptor, "rb") as stream:
                    info = os.fstat(stream.fileno())
                    if (not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid()
                            or info.st_nlink != 1 or stat.S_IMODE(info.st_mode) != 0o600
                            or not 0 < info.st_size <= 4096):
                        self.fail("invented readiness marker metadata invalid")
                    data = json.loads(stream.read(4097))
                if (not isinstance(data, dict)
                        or set(data) not in ({"child", "supervisor", "descendant"}, {"helper"})
                        or any(pid is not None and (type(pid) is not int or not 1 <= pid <= 2147483647)
                               for pid in data.values())):
                    self.fail("invented readiness marker shape invalid")
                self.remember_fixture_path(path, info)
                self.receipt_pids.update(pid for pid in data.values() if pid is not None)
                return data
            time.sleep(0.005)
        self.fail("invented child did not become ready")

    def assert_gone(self, data, timeout=0.4):
        expires = time.monotonic() + timeout
        while time.monotonic() < expires:
            if not any(alive(pid) for pid in data.values() if pid is not None):
                return
            time.sleep(0.005)
        self.assertFalse(any(alive(pid) for pid in data.values() if pid is not None), "receipt PID remains present after owned cleanup (or may have been reused)")

    def test_fixed_helper_self_admission_and_exact_modes(self):
        path = self.fixture_path("helper.py")
        path.write_text("# synthetic file metadata only\n")
        path.chmod(0o400)
        self.remember_fixture_path(path)
        original = helper.__file__
        try:
            helper.__file__ = str(path)
            helper.validate_self()
            path.chmod(0o600)
            with self.assertRaises(ValueError):
                helper.validate_self()
            path.chmod(0o400)
            self.directory.chmod(0o755)
            with self.assertRaises(ValueError):
                helper.validate_self()
        finally:
            self.directory.chmod(0o700)
            helper.__file__ = original

    def test_fixed_helper_rejects_symlink_and_hardlink(self):
        path = self.fixture_path("helper.py")
        path.write_text("# synthetic file metadata only\n")
        path.chmod(0o400)
        self.remember_fixture_path(path)
        original = helper.__file__
        try:
            alias = self.fixture_path("alias.py")
            alias.symlink_to(path)
            self.remember_fixture_path(alias)
            helper.__file__ = str(alias)
            with self.assertRaises(ValueError):
                helper.validate_self()
            alias.unlink()
            os.link(path, alias)
            self.remember_fixture_path(alias)
            helper.__file__ = str(path)
            with self.assertRaises(ValueError):
                helper.validate_self()
        finally:
            helper.__file__ = original

    def test_raw_output_and_private_stderr_discarded(self):
        result = self.result("echo")
        self.assertEqual(result, {"status": 0, "output": "p123\nu501\nn127.0.0.1:44000\n", "error": None})

    def test_exact_nonzero_child_status(self):
        result = self.result("exit37")
        self.assertEqual(result, {"status": 37, "output": "p123\nfcwd\nn/invented-project\n", "error": None})

    def test_child_signal_status(self):
        self.assertEqual(self.result("signal"), {"status": -15, "output": "", "error": None})

    def test_main_preserves_actual_term_and_kill_child_status_without_traceback(self):
        for mode, status in [("main-signal", -15), ("main-signal9", -9)]:
            child, _sentinel = self.spawn(mode)
            stdout, stderr = child.communicate(timeout=1)
            self.assertEqual(child.returncode, status)
            self.assertEqual(stdout, b"")
            self.assertEqual(stderr, b"")

    def test_minimal_environment_and_fixed_cwd(self):
        result = self.result("env")
        self.assertEqual(result["status"], 0)
        self.assertIsNone(result["error"])
        self.assertEqual(json.loads(result["output"]), {"keys": ["LANG", "LC_ALL", "PATH", "__CF_USER_TEXT_ENCODING"],
                                                       "fixed_matches": True, "cwd_root": True})

    def test_stdout_exact_cap_and_overflow(self):
        exact = self.result("stdout", helper.STDOUT_LIMIT)
        self.assertEqual(exact["status"], 0)
        self.assertEqual(len(exact["output"]), helper.STDOUT_LIMIT)
        self.assertEqual(self.result("stdout", helper.STDOUT_LIMIT + 1),
                         {"status": 125, "output": "", "error": "ARRIVAL_OUTPUT_LIMIT"})

    def test_stderr_exact_cap_and_overflow(self):
        self.assertEqual(self.result("stderr", helper.STDERR_LIMIT), {"status": 0, "output": "", "error": None})
        self.assertEqual(self.result("stderr", helper.STDERR_LIMIT + 1),
                         {"status": 125, "output": "", "error": "ARRIVAL_OUTPUT_LIMIT"})

    def test_deadline_reaps_child_and_descendant(self):
        marker = self.fixture_path("deadline.json")
        child, _sentinel = self.spawn("descendant", marker)
        owned = self.ready(marker)
        stdout, stderr = child.communicate(timeout=3)
        self.assertEqual(stderr, b"")
        self.assertEqual(json.loads(stdout), {"status": 124, "output": "", "error": "ARRIVAL_DEADLINE"})
        self.assert_gone(owned)

    def test_fd3_retained_until_signal_cleanup_under_250ms(self):
        marker = self.fixture_path("sentinel.json")
        child, sentinel = self.spawn("descendant", marker, sentinel=True)
        try:
            owned = self.ready(marker)
            self.assertEqual(select.select([sentinel], [], [], 0.05)[0], [], "FD3 closed while child was running")
            started = time.monotonic()
            child.terminate()
            stdout, stderr = child.communicate(timeout=0.25)
            elapsed = time.monotonic() - started
            self.assertLess(elapsed, 0.25)
            self.assertEqual(stderr, b"")
            self.assertEqual(json.loads(stdout), {"status": 130, "output": "", "error": "ARRIVAL_CANCELLED"})
            self.assertEqual(os.read(sentinel, 1), b"")
            self.assert_gone(owned, timeout=0.25)
        finally:
            os.close(sentinel)

    def test_abrupt_helper_death_reaps_child_and_descendant(self):
        marker = self.fixture_path("abrupt.json")
        child, _sentinel = self.spawn("descendant", marker)
        owned = self.ready(marker)
        child.kill()
        child.wait(timeout=0.25)
        self.assert_gone(owned, timeout=0.25)

    def test_native_parent_loss_ends_helper_and_child(self):
        marker = self.fixture_path("orphan-child.json")
        native_marker = self.fixture_path("orphan-helper.json")
        native = subprocess.Popen([sys.executable, "-I", "-S", "-B", str(HERE / "orphan_launcher.py"), str(marker), str(native_marker)],
                                  stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                                  cwd="/", env=ENV)
        self.children.append(native)
        own_helper = self.ready(native_marker)
        owned = self.ready(marker)
        native.kill()
        native.wait(timeout=0.25)
        self.assert_gone({**own_helper, **owned}, timeout=0.3)


if __name__ == "__main__":
    unittest.main(verbosity=2)
