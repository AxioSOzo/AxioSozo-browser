"""Injected safety regressions for the active session cleanup; no real signals."""
import sys
from pathlib import Path
import signal
import subprocess
from types import SimpleNamespace
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))
import session as candidate


class FakeProcess:
    def __init__(self, owner, pid, returncode=None, wait_error=None):
        self.owner = owner
        self.pid = pid
        self.returncode = returncode
        self.wait_error = wait_error
        self.stdin = SimpleNamespace(close=lambda: owner.close_stream(self))
        self.stdout = None
        self.stderr = None

    def poll(self):
        self.owner.violations.append("poll")
        raise AssertionError("poll would destroy original leader authority")

    def wait(self, timeout=None):
        self.owner.events.append(("wait", self.pid, timeout))
        if timeout != 5:
            self.owner.violations.append("unexpected wait timeout")
        self.owner.assertEqual(timeout, 5)
        if self.wait_error is not None:
            raise self.wait_error
        self.returncode = -15
        return self.returncode


class CleanupTests(unittest.TestCase):
    def setUp(self):
        names = ("os", "signal", "time", "subprocess", "fcntl", "cef_profile_names", "shutil")
        original = {name: getattr(candidate, name) for name in names}
        def restore():
            for name, value in original.items():
                setattr(candidate, name, value)
        self.addCleanup(restore)

    def configure(self, specs, disposition=signal.SIG_DFL):
        self.events = []
        self.violations = []
        self.errors = {}
        self.sleep_hook = None
        self.stream_error = None
        self.lock_error = None
        self.disposition = disposition
        self.clock = 0
        self.session = candidate.OwnedSession.__new__(candidate.OwnedSession)
        self.session._cleanup_uncertain = False
        self.session.processes = [FakeProcess(self, **spec) for spec in specs]
        self.all_processes = list(self.session.processes)
        self.session.lock = SimpleNamespace(close=self.close_lock)
        self.original_lock = self.session.lock

        def signal_group(pid, sig):
            process = next(p for p in self.all_processes if p.pid == pid)
            if process.returncode is not None:
                self.violations.append("signal after reap")
            if any(e[0] == "wait" for e in self.events):
                self.violations.append("signal after first wait")
            self.assertIsNone(process.returncode, "group signal after original leader reaped")
            self.assertFalse(any(e[0] == "wait" for e in self.events), "signals must all precede first reap")
            self.events.append(("signal", pid, sig))
            if (pid, sig) in self.errors:
                raise self.errors[(pid, sig)]

        def sleep(seconds):
            self.assertFalse(any(e[0] == "wait" for e in self.events))
            self.events.append(("sleep", seconds))
            self.clock += seconds
            if self.sleep_hook:
                self.sleep_hook()

        def forbidden(*args, **kwargs):
            self.violations.append("forbidden process or filesystem action")
            raise AssertionError("real process or filesystem action forbidden")

        def unlock(lock, operation):
            if any(p.returncode is None for p in self.all_processes):
                self.violations.append("unlock before direct reap")
            self.assertTrue(all(p.returncode is not None for p in self.all_processes))
            self.events.append(("unlock",))
            if self.lock_error:
                raise self.lock_error

        candidate.os = SimpleNamespace(killpg=signal_group)
        candidate.signal = SimpleNamespace(SIGCHLD=signal.SIGCHLD, SIG_DFL=signal.SIG_DFL,
            SIGTERM=signal.SIGTERM, SIGKILL=signal.SIGKILL, getsignal=lambda unused: self.disposition)
        candidate.time = SimpleNamespace(monotonic=lambda: self.clock, sleep=sleep)
        candidate.subprocess = SimpleNamespace(Popen=forbidden)
        candidate.fcntl = SimpleNamespace(LOCK_UN=8, flock=unlock)
        candidate.cef_profile_names = forbidden
        candidate.shutil = SimpleNamespace(rmtree=forbidden)

    def close_stream(self, process):
        if any(p.returncode is None for p in self.all_processes):
            self.violations.append("stream close before direct reap")
        self.assertTrue(all(p.returncode is not None for p in self.all_processes))
        self.events.append(("stream", process.pid))
        if self.stream_error:
            raise self.stream_error

    def close_lock(self):
        if any(p.returncode is None for p in self.all_processes):
            self.violations.append("lock close before direct reap")
        self.assertTrue(all(p.returncode is not None for p in self.all_processes))
        self.events.append(("lock_close",))

    def tearDown(self):
        self.assertEqual(self.violations, [], "cleanup must not swallow fake safety violations")

    def uncertain(self, incomplete=False):
        if incomplete:
            with self.assertRaisesRegex(RuntimeError, "^SESSION_CLEANUP_UNCERTAIN$"):
                self.session.close()
        else:
            self.assertIs(self.session.close(), self.session.cleanup_report)
        self.assertEqual(self.session.cleanup_report, {
            "state": "UNCERTAIN", "direct_children_reaped": not incomplete,
            "groups": "NOT_VERIFIED"})
        self.assertTrue(self.session._cleanup_uncertain)

    def signal_events(self):
        return [e for e in self.events if e[0] == "signal"]

    def test_reaped_handles_receive_no_signal_wait_or_grace(self):
        self.configure([{"pid": 45117, "returncode": 0}, {"pid": 45118, "returncode": 7}])
        self.session.close()
        self.assertFalse(any(e[0] in ("signal", "wait", "sleep") for e in self.events))
        self.assertIsNone(self.session.lock)
        self.assertEqual(self.session.cleanup_report, {"state": "DIRECT_CHILDREN_REAPED",
            "direct_children_reaped": True, "groups": "NOT_VERIFIED"})

    def test_unreaped_leader_kept_through_grace_and_kill_before_wait(self):
        self.configure([{"pid": 45117}])
        self.session.close()
        self.assertEqual(self.events[:4], [("signal", 45117, signal.SIGTERM), ("sleep", 5),
            ("signal", 45117, signal.SIGKILL), ("wait", 45117, 5)])
        self.assertIsNone(self.session.lock)

    def test_all_groups_escalated_before_any_reap(self):
        self.configure([{"pid": 45117}, {"pid": 45118}])
        self.session.close()
        self.assertEqual(self.signal_events(), [("signal", 45118, signal.SIGTERM),
            ("signal", 45117, signal.SIGTERM), ("signal", 45118, signal.SIGKILL),
            ("signal", 45117, signal.SIGKILL)])
        self.assertEqual(sum(e[0] == "sleep" for e in self.events), 1)

    def test_missing_term_group_still_escalates_before_reap(self):
        self.configure([{"pid": 45117}])
        self.errors[(45117, signal.SIGTERM)] = ProcessLookupError()
        self.session.close()
        self.assertEqual(len(self.signal_events()), 2)
        self.assertIsNone(self.session.lock)

    def test_missing_kill_group_still_waits_direct_leader(self):
        self.configure([{"pid": 45117}])
        self.errors[(45117, signal.SIGKILL)] = ProcessLookupError()
        self.session.close()
        self.assertIn(("wait", 45117, 5), self.events)

    def test_term_permission_error_reports_uncertain_after_reap(self):
        self.configure([{"pid": 45117}])
        self.errors[(45117, signal.SIGTERM)] = PermissionError("invented")
        self.uncertain()
        self.assertIsNone(self.session.lock)
        self.assertIsNotNone(self.all_processes[0].returncode)

    def test_zombie_group_kill_permission_error_is_uncertain(self):
        self.configure([{"pid": 45117}])
        self.errors[(45117, signal.SIGKILL)] = PermissionError("invented zombie-only group")
        self.uncertain()
        self.assertIsNone(self.session.lock)

    def test_wait_timeout_retains_lease_streams_and_handles(self):
        self.configure([{"pid": 45117, "wait_error": subprocess.TimeoutExpired("invented", 5)}])
        self.uncertain(incomplete=True)
        self.assertIs(self.session.lock, self.original_lock)
        self.assertEqual(self.session.processes, self.all_processes)
        self.assertFalse(any(e[0] in ("stream", "unlock", "lock_close") for e in self.events))

    def test_wait_error_continues_other_direct_reaps_without_unlock(self):
        self.configure([{"pid": 45117}, {"pid": 45118, "wait_error": OSError("invented")}])
        self.uncertain(incomplete=True)
        self.assertIsNotNone(self.all_processes[0].returncode)
        self.assertIsNone(self.all_processes[1].returncode)
        self.assertIs(self.session.lock, self.original_lock)
        self.assertFalse(any(e[0] == "stream" for e in self.events))

    def test_nondefault_sigchld_close_never_signals_or_waits(self):
        self.configure([{"pid": 45117}], disposition=signal.SIG_IGN)
        self.uncertain(incomplete=True)
        self.assertEqual(self.events, [])
        self.assertIs(self.session.lock, self.original_lock)

    def test_nondefault_sigchld_spawn_rejected_before_popen(self):
        self.configure([], disposition=signal.SIG_IGN)
        with self.assertRaisesRegex(RuntimeError, "^DEFAULT_SIGCHLD_REQUIRED$"):
            self.session.spawn(["invented"])
        self.assertEqual(self.events, [])

    def test_sigchld_change_during_grace_retains_leader_and_lease(self):
        self.configure([{"pid": 45117}])
        self.sleep_hook = lambda: setattr(self, "disposition", signal.SIG_IGN)
        self.uncertain(incomplete=True)
        self.assertEqual(self.signal_events(), [("signal", 45117, signal.SIGTERM)])
        self.assertFalse(any(e[0] == "wait" for e in self.events))
        self.assertIs(self.session.lock, self.original_lock)

    def test_unexpected_external_reap_during_grace_never_resignals(self):
        self.configure([{"pid": 45117}])
        self.sleep_hook = lambda: setattr(self.all_processes[0], "returncode", 0)
        self.uncertain()
        self.assertEqual(self.signal_events(), [("signal", 45117, signal.SIGTERM)])
        self.assertFalse(any(e[0] == "wait" for e in self.events))

    def test_interrupted_grace_finishes_owned_signals_and_waits_but_reports_uncertain(self):
        self.configure([{"pid": 45117}])
        def interrupt():
            raise KeyboardInterrupt()
        self.sleep_hook = interrupt
        self.uncertain()
        self.assertEqual(len(self.signal_events()), 2)
        self.assertIsNotNone(self.all_processes[0].returncode)
        self.assertIsNone(self.session.lock)

    def test_stream_error_continues_lock_release_and_reports_uncertain(self):
        self.configure([{"pid": 45117, "returncode": 0}])
        self.stream_error = OSError("invented")
        self.uncertain()
        self.assertIn(("lock_close",), self.events)
        self.assertIsNone(self.session.lock)

    def test_unlock_error_still_closes_owned_lock_after_reap(self):
        self.configure([{"pid": 45117, "returncode": 0}])
        self.lock_error = OSError("invented")
        self.uncertain()
        self.assertIn(("lock_close",), self.events)
        self.assertIsNone(self.session.lock)

    def test_uncertain_session_cannot_spawn_new_process(self):
        self.configure([])
        self.session._cleanup_uncertain = True
        with self.assertRaisesRegex(RuntimeError, "^SESSION_CLEANUP_UNCERTAIN$"):
            self.session.spawn(["invented"])
        self.assertEqual(self.events, [])

    def test_all_reaped_uncertainty_does_not_mask_body_exception(self):
        self.configure([{"pid": 45117}])
        self.errors[(45117, signal.SIGKILL)] = PermissionError("invented zombie-only group")
        session = self.session
        class ExistingOwnedContext:
            def __enter__(self):
                return session
            def __exit__(self, *args):
                return session.__exit__(*args)
        with self.assertRaisesRegex(ValueError, "^invented body failure$"):
            with ExistingOwnedContext():
                raise ValueError("invented body failure")
        self.assertEqual(session.cleanup_report, {"state": "UNCERTAIN",
            "direct_children_reaped": True, "groups": "NOT_VERIFIED"})
        self.assertIsNone(session.lock)
        with self.assertRaisesRegex(RuntimeError, "^SESSION_CLEANUP_UNCERTAIN$"):
            session.spawn(["invented"])

    def test_profile_namespace_not_inspected_or_deleted_even_without_processes(self):
        self.configure([])
        self.session.close()
        self.assertIsNone(self.session.lock)


if __name__ == "__main__":
    unittest.main(verbosity=2)
