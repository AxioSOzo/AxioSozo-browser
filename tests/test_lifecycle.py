"""Real macOS child-process and IPC tests, explicitly NOT browser GUI evidence."""
import json
import os
from pathlib import Path
import selectors
import signal
import subprocess
import sys
import tempfile
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
from session import OwnedSession, SessionBusy

BINARY = os.environ.get("AXIOSOZO_CORE_BINARY")


def interrupt(_signum, _frame):
    # Let active OwnedSession contexts reap their children on dev-command cancellation.
    raise KeyboardInterrupt


signal.signal(signal.SIGTERM, interrupt)


def response(process, timeout=5):
    with selectors.DefaultSelector() as selector:
        selector.register(process.stdout, selectors.EVENT_READ)
        if not selector.select(timeout=timeout):
            raise AssertionError("IPC response deadline exceeded")
    return json.loads(process.stdout.readline())


def ready_coordinator(session):
    process = session.start_coordinator(BINARY)
    process.stdin.write(json.dumps(session.message("fixture-bootstrap")) + "\n")
    process.stdin.flush()
    # Native startup is separate from a per-request IPC deadline. In particular,
    # never fill a pipe with a malformed frame before the child can read it.
    initial = response(process, timeout=30)
    if initial.get("status") != "completed":
        raise AssertionError("coordinator bootstrap did not complete")
    return process


class CefProfileCleanup(unittest.TestCase):
    def test_only_new_owned_session_profiles_are_removed(self):
        with tempfile.TemporaryDirectory(prefix="axiosozo-cef-cleanup-") as root:
            path = Path(root).resolve() / "session"
            path.mkdir()
            historical = path / "cef-11111111-1111-1111-1111-111111111111"
            historical.mkdir()
            external = Path(root) / "external"
            external.mkdir()
            (external / "keep").write_text("untouched")
            with OwnedSession(path):
                fresh = path / "cef-22222222-2222-2222-2222-222222222222"
                fresh.mkdir()
                (fresh / "cache").write_text("session-owned")
                (path / "cef-33333333-3333-3333-3333-333333333333").symlink_to(
                    external, target_is_directory=True)
                (path / "gecko").mkdir()
            self.assertFalse(fresh.exists())
            self.assertTrue(historical.is_dir())
            self.assertTrue((path / "gecko").is_dir())
            self.assertEqual((external / "keep").read_text(), "untouched")


@unittest.skipUnless(BINARY and Path(BINARY).is_file(), "built coordinator required")
class Lifecycle(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="axiosozo-ipc-")
        self.path = Path(self.temp.name).resolve()

    def tearDown(self):
        self.temp.cleanup()

    def test_two_starts_stops_no_orphan_or_profile_double_owner(self):
        seen = []
        for _ in range(2):
            with OwnedSession(self.path) as session:
                with self.assertRaises(SessionBusy):
                    with OwnedSession(self.path):
                        pass
                process = ready_coordinator(session)
                seen.append(process.pid)
                process.stdin.write(json.dumps(session.message("caps")) + "\n")
                process.stdin.flush()
                reply = response(process)
                self.assertEqual(reply["status"], "completed")
                self.assertFalse(reply["result"]["engine_execution"])
            self.assertIsNotNone(process.poll())
            with self.assertRaises(ProcessLookupError):
                os.kill(process.pid, 0)
        self.assertEqual(len(set(seen)), 2)

    def test_foreign_token_rejected_without_leaking_secret(self):
        with OwnedSession(self.path) as session:
            process = ready_coordinator(session)
            message = session.message("wrong-token")
            message["token"] = "b" * 64
            process.stdin.write(json.dumps(message) + "\n")
            process.stdin.flush()
            reply = response(process)
            self.assertEqual(reply["result"]["reason"], "unauthenticated")
            self.assertNotIn(session.token, json.dumps(reply))

    def test_oversized_and_malformed_frames_close_owned_process(self):
        for data in ("x" * 65537 + "\n", '{"body":{"method":"shell"}}\n'):
            with OwnedSession(self.path) as session:
                process = ready_coordinator(session)
                try:
                    process.stdin.write(data)
                    process.stdin.flush()
                except BrokenPipeError:
                    pass
                self.assertEqual(process.wait(timeout=5), 2)
                self.assertNotIn(session.token, process.stderr.read())

    def test_no_bootstrap_and_no_inherited_secret(self):
        result = subprocess.run([BINARY], env={"PATH": "/usr/bin:/bin"}, capture_output=True, timeout=30)
        self.assertEqual(result.returncode, 2)

    def test_chrome_stdio_bootstrap_and_invalid_bootstrap(self):
        env = {"PATH": "/usr/bin:/bin", "AXIOSOZO_BOOTSTRAP_MODE": "stdin-v1"}
        token = "c" * 64
        bootstrap = {"version": 1, "session_id": "chrome-fixture", "token": token}
        message = {"version": 1, "session_id": "chrome-fixture", "token": token,
                   "request_id": "caps", "body": {"method": "capabilities"}}
        result = subprocess.run([BINARY], env=env, input=json.dumps(bootstrap) + "\n" + json.dumps(message) + "\n",
                                capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(json.loads(result.stdout)["status"], "completed")
        for invalid in ({**bootstrap, "version": 2}, {**bootstrap, "origin": "https://website.invalid"}):
            result = subprocess.run([BINARY], env=env, input=json.dumps(invalid) + "\n",
                                    capture_output=True, text=True, timeout=10)
            self.assertEqual(result.returncode, 2)
            self.assertNotIn(token, result.stderr)

    def test_cleanup_after_partial_start_failure(self):
        process = None
        with self.assertRaises(FileNotFoundError):
            with OwnedSession(self.path) as session:
                process = session.start_coordinator(BINARY)
                session.spawn(["/nonexistent/axiosozo-child"])
        self.assertIsNotNone(process.poll())
        with OwnedSession(self.path):
            pass

    def test_symlink_lock_rejected(self):
        victim = self.path / "unrelated"
        victim.write_text("keep")
        (self.path / "owner.lock").symlink_to(victim)
        with self.assertRaises(OSError):
            with OwnedSession(self.path):
                pass
        self.assertEqual(victim.read_text(), "keep")

    def test_symlink_ancestor_rejected_without_creating_outside_namespace(self):
        victim = self.path / "unrelated"
        victim.mkdir()
        alias = self.path / "alias"
        alias.symlink_to(victim, target_is_directory=True)
        with self.assertRaises(RuntimeError):
            with OwnedSession(alias / "profile"):
                pass
        self.assertFalse((victim / "profile").exists())

    def test_descendant_ignoring_term_receives_group_kill(self):
        # Observe the exact owned process-group calls without inspecting unrelated PIDs.
        # The direct child exits on TERM while its descendant ignores TERM.
        from unittest.mock import patch
        import signal
        original = os.killpg
        calls = []
        def observe(pgid, sig):
            calls.append((pgid, sig))
            return original(pgid, sig)
        child_code = "import signal,time; signal.signal(signal.SIGTERM, signal.SIG_IGN); print('ready', flush=True); time.sleep(60)"
        parent_code = "import subprocess,sys,time; subprocess.Popen([sys.executable,'-c',sys.argv[1]]); time.sleep(60)"
        with patch("session.os.killpg", side_effect=observe):
            with OwnedSession(self.path) as session:
                process = session.spawn([sys.executable, "-c", parent_code, child_code], stdout=subprocess.PIPE, text=True)
                with selectors.DefaultSelector() as selector:
                    selector.register(process.stdout, selectors.EVENT_READ)
                    self.assertTrue(selector.select(timeout=5))
                self.assertEqual(process.stdout.readline().strip(), "ready")
                output_fd = os.dup(process.stdout.fileno())
        self.assertIn((process.pid, signal.SIGTERM), calls)
        self.assertIn((process.pid, signal.SIGKILL), calls)
        # EOF proves the actual descendant exited; its code keeps stdout open forever.
        try:
            with selectors.DefaultSelector() as selector:
                selector.register(output_fd, selectors.EVENT_READ)
                self.assertTrue(selector.select(timeout=5), "owned descendant survived cleanup")
            self.assertEqual(os.read(output_fd, 64), b"")
        finally:
            os.close(output_fd)
        self.assertIsNotNone(process.poll())


if __name__ == "__main__":
    unittest.main(verbosity=2)
