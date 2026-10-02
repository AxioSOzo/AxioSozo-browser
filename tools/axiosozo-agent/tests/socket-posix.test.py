"""Actual POSIX fixtures for the staged product-owned Unix socket helper.

Only owned synthetic Unix sockets are bound/listened. No browser, TCP,
provider, MCP, profile or personal file is accessed. Run via the workstation
external-storage broker with an explicitly trusted Python interpreter.
"""
import importlib.util
import json
import os
from pathlib import Path
import select
import socket
import stat
import subprocess
import sys
import tempfile
import time
import unittest

HELPER_PATH = Path(__file__).resolve().parents[1] / "agent_socket.py"
SPEC = importlib.util.spec_from_file_location("owned_agent_socket_helper", HELPER_PATH)
HELPER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(HELPER)
BUILD_ROOT = Path("/Volumes/AxioSozoBuild/workstation")
ENV = {"LANG": "C", "LC_ALL": "C"}


class ActualPosixSocketTests(unittest.TestCase):
    def setUp(self):
        self.assertEqual(os.environ.get("AXIOSOZO_BUILD_ROOT"), str(BUILD_ROOT))
        self.assertTrue(BUILD_ROOT.is_dir())
        self.temporary = tempfile.TemporaryDirectory(prefix="ap-", dir=BUILD_ROOT / "tmp")
        self.base = Path(self.temporary.name)
        self.run = self.base / "r"
        self.run.mkdir(mode=0o700)
        self.path = self.run / "s"
        self.assertLessEqual(len(str(self.path).encode()), 100)
        self.children = []
        self.sockets = []

    def tearDown(self):
        for child in self.children:
            self.release(child)
        for item in self.sockets:
            item.close()
        self.temporary.cleanup()

    def argv(self, operation, payload):
        return [sys.executable, "-I", "-S", "-B", str(HELPER_PATH), operation, json.dumps(payload)]

    def cli(self, operation, payload):
        result = subprocess.run(self.argv(operation, payload), input="", text=True,
                                capture_output=True, cwd="/", env=ENV, timeout=3)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stderr, "")
        self.assertLessEqual(len(result.stdout.encode()), HELPER.MAX_ARGUMENT + 1)
        return json.loads(result.stdout)

    def result(self, operation, payload):
        value = self.cli(operation, payload)
        self.assertEqual(value.get("ok"), True, value)
        return value["result"]

    def metadata(self, path=None):
        return self.result("lstat", {"path": str(path or self.path)})

    def lock(self, path=None, parent=None):
        path = path or self.path
        parent = parent or self.metadata(path.parent)
        child = subprocess.Popen(self.argv("lock", {"path": str(path), "parent": parent}),
                                 stdin=subprocess.PIPE, stdout=subprocess.PIPE,
                                 stderr=subprocess.PIPE, cwd="/", env=ENV)
        self.children.append(child)
        output = b""
        deadline = time.monotonic() + 3
        while b"\n" not in output:
            remaining = deadline - time.monotonic()
            self.assertGreater(remaining, 0, "lock acknowledgement timeout")
            ready, _, _ = select.select([child.stdout], [], [], remaining)
            self.assertTrue(ready, "lock acknowledgement timeout")
            chunk = os.read(child.stdout.fileno(), 4096)
            self.assertTrue(chunk, "lock process ended without acknowledgement")
            output += chunk
            self.assertLessEqual(len(output), HELPER.MAX_ARGUMENT + 1)
        return child, json.loads(output)

    def release(self, child):
        if child.stdin and not child.stdin.closed:
            child.stdin.close()
        try:
            child.wait(timeout=2)
        except subprocess.TimeoutExpired:
            child.kill()
            child.wait(timeout=2)
            self.fail("owned helper did not stop after stdin EOF")
        finally:
            for stream in (child.stdout, child.stderr):
                if stream and not stream.closed:
                    stream.close()

    def synthetic_socket(self, path=None, listen=False, mode=0o600):
        path = path or self.path
        value = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        self.sockets.append(value)
        value.bind(str(path))
        os.chmod(path, mode)
        if listen:
            value.listen(1)
        return value

    def remove_payload(self, identity=None, parent=None):
        return {"path": str(self.path), "identity": identity or self.metadata(),
                "parent": parent or self.metadata(self.run)}

    def test_exact_kernel_uid_type_mode_and_directory_creation(self):
        self.assertEqual(self.result("uid", {}), os.getuid())
        self.synthetic_socket()
        value = self.metadata()
        raw = os.lstat(self.path)
        self.assertEqual(value, {"kind": "socket", "uid": os.getuid(), "mode": 0o600,
                                 "device": str(raw.st_dev), "inode": str(raw.st_ino)})
        child = self.base / "new"
        self.assertTrue(self.result("mkdir", {"path": str(child), "mode": 0o700}))
        self.assertEqual(stat.S_IMODE(os.lstat(child).st_mode), 0o700)
        self.assertEqual(os.lstat(child).st_uid, os.getuid())

    def test_long_lived_lock_excludes_second_instance_until_stdin_eof(self):
        first, answer = self.lock()
        self.assertEqual(answer, {"ok": True, "result": True})
        self.assertIsNone(first.poll())
        lock_path = Path(str(self.path) + ".lock")
        initial = os.lstat(lock_path)
        self.assertTrue(stat.S_ISREG(initial.st_mode))
        self.assertEqual((initial.st_uid, stat.S_IMODE(initial.st_mode), initial.st_nlink), (os.getuid(), 0o600, 1))
        second, denied = self.lock()
        self.assertEqual(denied, {"ok": False, "error": "SOCKET_IN_USE"})
        self.release(second)
        self.assertIsNone(first.poll())
        started = time.monotonic()
        self.release(first)
        self.assertLess(time.monotonic() - started, 2)
        third, allowed = self.lock()
        self.assertEqual(allowed, {"ok": True, "result": True})
        self.assertEqual(os.lstat(lock_path).st_ino, initial.st_ino)
        self.release(third)
        self.assertTrue(lock_path.is_file())

    def test_lock_is_released_after_owned_helper_crash_and_file_remains_linked(self):
        first, answer = self.lock()
        self.assertTrue(answer["ok"])
        inode = os.lstat(str(self.path) + ".lock").st_ino
        first.kill()
        first.wait(timeout=2)
        second, answer = self.lock()
        self.assertTrue(answer["ok"])
        self.assertEqual(os.lstat(str(self.path) + ".lock").st_ino, inode)
        self.release(second)

    def test_live_owned_socket_answers_probe_without_application_bytes_or_unlink(self):
        owner, answer = self.lock()
        self.assertTrue(answer["ok"])
        listener = self.synthetic_socket(listen=True)
        initial = self.metadata()
        self.assertEqual(self.result("probe", {"path": str(self.path)}), {"state": "live"})
        listener.settimeout(1)
        accepted, _ = listener.accept()
        with accepted:
            accepted.settimeout(1)
            self.assertEqual(accepted.recv(1), b"")
        self.assertEqual(self.metadata(), initial)
        self.release(owner)

    def test_owned_0600_stale_socket_returns_raw_refusal_and_exact_cleanup(self):
        owner, answer = self.lock()
        self.assertTrue(answer["ok"])
        endpoint = self.synthetic_socket()
        endpoint.close()
        initial = self.metadata()
        self.assertEqual(self.result("probe", {"path": str(self.path)}),
                         {"state": "refused", "rawErrno": "ECONNREFUSED"})
        self.assertEqual(self.metadata(), initial)
        self.assertTrue(self.result("remove", self.remove_payload(identity=initial)))
        self.assertIsNone(self.metadata())
        self.release(owner)

    def test_raw_enoent_and_eacces_are_ambiguous_and_preserve_path(self):
        self.assertEqual(HELPER.probe(str(self.path)), {"state": "unknown", "rawErrno": "ENOENT"})
        self.synthetic_socket()
        initial = self.metadata()
        self.assertNotEqual(os.getuid(), 0, "EACCES fixture requires unprivileged test user")
        os.chmod(self.run, 0o000)
        try:
            self.assertEqual(HELPER.probe(str(self.path)), {"state": "unknown", "rawErrno": "EACCES"})
        finally:
            os.chmod(self.run, 0o700)
        self.assertEqual(self.metadata(), initial)

    def test_regular_symlink_fifo_and_socket_mode_fail_closed_without_mutation(self):
        target = self.base / "target"
        target.write_bytes(b"owned synthetic sentinel")
        target.chmod(0o600)
        for kind in ("regular", "symlink", "fifo", "permissive-socket"):
            with self.subTest(kind=kind):
                if kind == "regular":
                    self.path.write_bytes(b"keep")
                    self.path.chmod(0o600)
                elif kind == "symlink":
                    self.path.symlink_to(target)
                elif kind == "fifo":
                    os.mkfifo(self.path, 0o600)
                else:
                    self.synthetic_socket(mode=0o666)
                before = os.lstat(self.path)
                value = self.cli("probe", {"path": str(self.path)})
                self.assertEqual(value, {"ok": False, "error": "SOCKET_PATH_BLOCKED"})
                value = self.cli("remove", self.remove_payload())
                self.assertEqual(value, {"ok": False, "error": "SOCKET_PATH_BLOCKED"})
                self.assertEqual(os.lstat(self.path).st_ino, before.st_ino)
                self.assertEqual(target.read_bytes(), b"owned synthetic sentinel")
                self.path.unlink()

    def test_parent_symlink_broad_permissions_and_foreign_uid_claims_are_blocked(self):
        alias = self.base / "alias"
        alias.symlink_to(self.run, target_is_directory=True)
        self.assertEqual(self.cli("lstat", {"path": str(alias / "s")}),
                         {"ok": False, "error": "SOCKET_PATH_BLOCKED"})
        self.synthetic_socket()
        initial = self.metadata()
        os.chmod(self.run, 0o755)
        try:
            self.assertEqual(self.cli("probe", {"path": str(self.path)}),
                             {"ok": False, "error": "SOCKET_PATH_BLOCKED"})
        finally:
            os.chmod(self.run, 0o700)
        foreign = dict(initial, uid=os.getuid() + 1)
        self.assertFalse(self.result("remove", self.remove_payload(identity=foreign)))
        self.assertEqual(self.metadata(), initial)
        foreign_parent = dict(self.metadata(self.run), uid=os.getuid() + 1)
        child, answer = self.lock(parent=foreign_parent)
        self.assertEqual(answer, {"ok": False, "error": "SOCKET_PATH_BLOCKED"})
        self.release(child)
        self.assertFalse(Path(str(self.path) + ".lock").exists())

    def test_lock_symlink_fifo_permissive_and_hardlink_entries_are_preserved(self):
        lock_path = Path(str(self.path) + ".lock")
        target = self.base / "lock-target"
        target.write_bytes(b"keep")
        target.chmod(0o600)
        for kind in ("symlink", "fifo", "permissive", "hardlink"):
            with self.subTest(kind=kind):
                if kind == "symlink":
                    lock_path.symlink_to(target)
                elif kind == "fifo":
                    os.mkfifo(lock_path, 0o600)
                elif kind == "permissive":
                    lock_path.write_bytes(b"keep")
                    lock_path.chmod(0o666)
                else:
                    os.link(target, lock_path)
                before = os.lstat(lock_path)
                started = time.monotonic()
                child, answer = self.lock()
                self.assertEqual(answer, {"ok": False, "error": "SOCKET_PATH_BLOCKED"})
                self.release(child)
                self.assertLess(time.monotonic() - started, 3)
                self.assertEqual(os.lstat(lock_path).st_ino, before.st_ino)
                self.assertEqual(target.read_bytes(), b"keep")
                lock_path.unlink()

    def test_changed_socket_inode_and_parent_identity_are_preserved_at_cleanup(self):
        self.synthetic_socket()
        initial = self.metadata()
        alternate = self.run / "alternate"
        self.synthetic_socket(path=alternate)
        alternate_info = self.metadata(alternate)
        self.assertNotEqual(alternate_info["inode"], initial["inode"])
        alternate.replace(self.path)
        self.assertFalse(self.result("remove", self.remove_payload(identity=initial)))
        self.assertEqual(self.metadata(), alternate_info)
        wrong_parent = dict(self.metadata(self.run), inode="wrong-inode")
        self.assertFalse(self.result("remove", self.remove_payload(parent=wrong_parent)))
        self.assertEqual(self.metadata(), alternate_info)

    def test_malformed_oversized_and_traversal_arguments_are_bounded_without_mutation(self):
        for payload in ({"path": "relative"}, {"path": str(self.run) + "/../s"},
                        {"path": str(self.path), "extra": True}, {"path": "/" + "x" * 17000}):
            with self.subTest(payload_length=len(json.dumps(payload))):
                answer = self.cli("lstat", payload)
                self.assertFalse(answer["ok"])
                self.assertFalse(self.path.exists())
                self.assertLessEqual(len(json.dumps(answer)), 100)
        self.assertEqual(self.cli("mkdir", {"path": str(self.path), "mode": 0o755}),
                         {"ok": False, "error": "INVALID_PARAMS"})
        self.assertFalse(self.path.exists())


if __name__ == "__main__":
    unittest.main(verbosity=2)
