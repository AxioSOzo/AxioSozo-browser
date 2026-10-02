"""Entrypoint ownership regression tests; every process and signal is injected."""
from pathlib import Path
import signal
import subprocess
from types import SimpleNamespace
import unittest
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import dev as candidate


class FakeProcess:
    pid = 45117

    def __init__(self, actions):
        self.returncode = None
        self.actions = list(actions)
        self.waits = []

    def poll(self):
        raise AssertionError("poll must never reap the original leader")

    def wait(self, timeout=None):
        self.waits.append(timeout)
        action, code = self.actions.pop(0)
        if action == "exit":
            self.returncode = code
            return code
        if action == "interrupt_reaped":
            self.returncode = code
            raise KeyboardInterrupt()
        if action == "timeout_reaped":
            self.returncode = code
            raise subprocess.TimeoutExpired("invented", timeout)
        if action == "interrupt":
            raise KeyboardInterrupt()
        if action == "timeout":
            raise subprocess.TimeoutExpired("invented", timeout)
        if action == "error":
            raise OSError("invented initial wait error")
        raise AssertionError(action)


class OwnedRunCleanupTests(unittest.TestCase):
    def setUp(self):
        names = ("signal", "subprocess", "os", "ROOT", "CARGO_HOME_DIR", "MOUNT")
        original = {name: getattr(candidate, name) for name in names}
        self.addCleanup(lambda: [setattr(candidate, name, value) for name, value in original.items()])

    def configure(self, actions, signal_errors=None, disposition=signal.SIG_DFL):
        self.process = FakeProcess(actions)
        self.signals = []
        self.spawns = []
        self.mounts = []
        errors = signal_errors or {}

        def popen(argv, **kwargs):
            self.spawns.append((argv, kwargs))
            self.assertTrue(kwargs["start_new_session"])
            return self.process

        def killpg(pid, sig):
            self.assertIsNone(self.process.returncode, "group signal after original leader was reaped")
            self.assertEqual(pid, self.process.pid)
            self.signals.append(sig)
            if sig in errors:
                raise errors[sig]

        def mount(*args, **kwargs):
            self.mounts.append((args, kwargs))
            raise AssertionError("fixture must never mount or launch")

        candidate.signal = SimpleNamespace(SIGCHLD=signal.SIGCHLD, SIG_DFL=signal.SIG_DFL,
            SIGTERM=signal.SIGTERM, SIGKILL=signal.SIGKILL, getsignal=lambda unused: disposition)
        candidate.subprocess = SimpleNamespace(Popen=popen, run=mount, TimeoutExpired=subprocess.TimeoutExpired)
        candidate.os = SimpleNamespace(killpg=killpg, environ={})
        candidate.ROOT = Path("/invented/owned/root")
        candidate.CARGO_HOME_DIR = SimpleNamespace(is_dir=lambda: False)
        candidate.MOUNT = "/invented/no-launch"

    def test_normal_exit_has_no_cleanup_signal_or_extra_wait(self):
        self.configure([("exit", 0)])
        self.assertEqual(candidate.run(["invented"]), 0)
        self.assertEqual(self.signals, [])
        self.assertEqual(self.process.waits, [None])

    def test_nonzero_exit_is_preserved_without_cleanup(self):
        self.configure([("exit", 7)])
        self.assertEqual(candidate.run(["invented"]), 7)
        self.assertEqual(self.signals, [])
        self.assertEqual(self.process.waits, [None])

    def test_initial_interrupt_already_reaped_has_no_signals(self):
        self.configure([("interrupt_reaped", -15)])
        with self.assertRaises(KeyboardInterrupt):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [])
        self.assertEqual(self.process.waits, [None])

    def test_interrupted_unreaped_leader_gets_term_then_grace_wait(self):
        self.configure([("interrupt", None), ("exit", 0)])
        with self.assertRaises(KeyboardInterrupt):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM])
        self.assertEqual(self.process.waits, [None, 15])

    def test_grace_timeout_escalates_before_reap(self):
        self.configure([("interrupt", None), ("timeout", None), ("exit", -9)])
        with self.assertRaises(KeyboardInterrupt):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(self.process.waits, [None, 15, 5])

    def test_timeout_with_reaped_status_never_resignals_or_rewaits(self):
        self.configure([("interrupt", None), ("timeout_reaped", 0)])
        with self.assertRaises(KeyboardInterrupt):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM])
        self.assertEqual(self.process.waits, [None, 15])

    def test_missing_term_group_still_reaps_direct_child(self):
        self.configure([("interrupt", None), ("exit", 0)], {signal.SIGTERM: ProcessLookupError()})
        with self.assertRaises(KeyboardInterrupt):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM])
        self.assertEqual(self.process.waits, [None, 15])

    def test_missing_kill_group_still_reaps_direct_child(self):
        self.configure([("interrupt", None), ("timeout", None), ("exit", -9)],
            {signal.SIGKILL: ProcessLookupError()})
        with self.assertRaises(KeyboardInterrupt):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(self.process.waits, [None, 15, 5])

    def test_term_permission_error_propagates_after_wait(self):
        self.configure([("interrupt", None), ("exit", 0)], {signal.SIGTERM: PermissionError("invented")})
        with self.assertRaises(PermissionError):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM])
        self.assertEqual(self.process.waits, [None, 15])

    def test_kill_permission_error_propagates_after_wait(self):
        self.configure([("interrupt", None), ("timeout", None), ("exit", -9)],
            {signal.SIGKILL: PermissionError("invented")})
        with self.assertRaises(PermissionError):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(self.process.waits, [None, 15, 5])

    def test_final_timeout_does_not_retry_signals(self):
        self.configure([("interrupt", None), ("timeout", None), ("timeout", None)])
        with self.assertRaises(subprocess.TimeoutExpired):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(self.process.waits, [None, 15, 5])

    def test_initial_wait_error_still_uses_owned_cleanup(self):
        self.configure([("error", None), ("exit", 0)])
        with self.assertRaises(OSError):
            candidate.run(["invented"])
        self.assertEqual(self.signals, [signal.SIGTERM])
        self.assertEqual(self.process.waits, [None, 15])

    def test_nondefault_sigchld_rejected_before_build_mount_or_popen(self):
        self.configure([], disposition=signal.SIG_IGN)
        with self.assertRaisesRegex(RuntimeError, "^DEFAULT_SIGCHLD_REQUIRED$"):
            candidate.run(["invented"], build=True)
        self.assertEqual(self.spawns, [])
        self.assertEqual(self.mounts, [])
        self.assertEqual(self.signals, [])


if __name__ == "__main__":
    unittest.main(verbosity=2)
