"""Injected only: native child, loader and signal APIs are guarded by the base."""
import errno
import json
from pathlib import Path
import signal
from unittest.mock import Mock, patch
import unittest
from test_terminal_handoff_cleanup import InjectedTest, FakeProcess, FakeObserver, FakeClock, handoff

SOURCE = (Path(__file__).resolve().parents[1] / 'tools/axiosozo-handoff/fake_handoff.py').read_bytes()
POINTER = json.dumps({'version': 1, 'context_file': handoff.ROOT + '/launch-' + 'a' * 32 + '/context.json'})


class FixtureLeafTests(InjectedTest):
    def leaf(self, exited=False, term_exits=False):
        events = []
        process = FakeProcess(events)
        observer = FakeObserver(process, events, exited)
        clock = FakeClock(events)
        def send(pid, signum):
            self.assertFalse(process.reaped)
            self.assertEqual(events[-1], ('observe', pid, False))
            events.append(('signal', pid, signum))
            if signum == signal.SIGKILL or term_exits:
                observer.is_exited = True
        child = handoff.OwnedFixtureLeaf(process, observer, handoff._GUI_LEAF_AUTHORITY,
                                        clock=clock, sleep=clock.sleep, send=send)
        return child, process, observer, clock, events

    def test_exited_fixed_leaf_reaps_without_signal(self):
        child, process, _, clock, events = self.leaf(exited=True)
        self.assertTrue(child.stop())
        self.assertEqual(self.signals(events), [])
        self.assertEqual(events[-1], ('wait', 0))
        self.assertEqual(clock.at, 0)
        self.assertTrue(process.reaped)
        self.assertFalse(child.authority)

    def test_running_leaf_terminated_by_term_skips_kill(self):
        child, _, _, _, events = self.leaf(term_exits=True)
        self.assertTrue(child.stop(grace=0.05))
        self.assertEqual([item[2] for item in self.signals(events)], [signal.SIGTERM])
        self.assertEqual(events[-1], ('wait', 0))

    def test_term_ignoring_leaf_is_killed_then_reaped(self):
        child, _, _, _, events = self.leaf()
        self.assertTrue(child.stop(grace=0.02))
        self.assertEqual([item[2] for item in self.signals(events)], [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(events[-1], ('wait', 0))

    def test_exit_between_initial_and_presignal_observation_skips_term(self):
        child, process, observer, _, events = self.leaf()
        def race(pid):
            result = len(events) != 0
            events.append(('observe', pid, result))
            return result
        observer.observe = race
        self.assertTrue(child.stop())
        self.assertEqual(self.signals(events), [])
        self.assertTrue(process.reaped)

    def test_repeated_stop_after_reap_has_no_observation_or_signal(self):
        child, process, _, _, events = self.leaf(exited=True)
        self.assertTrue(child.stop())
        before = list(events)
        process.pid = 7654
        self.assertTrue(child.stop())
        self.assertEqual(events, before)

    def test_already_reaped_refused_without_observation_or_signal(self):
        child, process, _, _, events = self.leaf()
        process.returncode, process.reaped = 0, True
        self.assertFalse(child.stop())
        self.assertEqual(events, [])

    def test_live_permission_denial_stays_failure_and_never_retries(self):
        child, _, _, _, events = self.leaf()
        child.send = Mock(side_effect=PermissionError(errno.EPERM, 'denied'))
        self.assertFalse(child.stop())
        self.assertFalse(child.stop())
        self.assertEqual(child.send.call_count, 1)
        self.assertFalse(any(item[0] == 'wait' for item in events))

    def test_lost_child_authority_after_term_never_escalates(self):
        child, _, observer, _, events = self.leaf()
        send = child.send
        def lose(pid, signum):
            send(pid, signum)
            observer.error = handoff.Rejected('HELPER_UNAVAILABLE')
        child.send = lose
        self.assertFalse(child.stop())
        self.assertEqual([item[2] for item in self.signals(events)], [signal.SIGTERM])
        self.assertFalse(child.authority)

    def test_final_wait_failure_never_restores_authority(self):
        child, process, _, _, events = self.leaf(exited=True)
        process.wait_error = handoff.subprocess.TimeoutExpired('owned', 0)
        self.assertFalse(child.stop())
        before = list(events)
        self.assertFalse(child.stop())
        self.assertEqual(events, before)

    def test_caller_boolean_or_fake_token_cannot_construct_leaf(self):
        for token in (True, False, None, {}, object()):
            self.expect_rejected(lambda: handoff.OwnedFixtureLeaf(FakeProcess([]), object(), token))
        handoff.subprocess.Popen.assert_not_called()

    def test_modified_or_nonbytes_source_rejected_before_spawn(self):
        for source in (SOURCE + b'\n', b'pass\n', bytearray(SOURCE), SOURCE.decode()):
            self.expect_rejected(lambda: handoff.spawn_gui_leaf(source, POINTER, object()), 'POLICY_CHANGED')
        handoff.subprocess.Popen.assert_not_called()

    def test_pointer_is_closed_and_fixed_owned_launch_scope(self):
        values = ({'version': True, 'context_file': handoff.ROOT + '/launch-' + 'a' * 32 + '/context.json'},
                  {'version': 1, 'context_file': '/tmp/context.json'},
                  {'version': 1, 'context_file': handoff.ROOT + '/launch-' + 'a' * 32 + '/context.json', 'leaf': True})
        for value in values:
            self.expect_rejected(lambda: handoff.spawn_gui_leaf(SOURCE, json.dumps(value), object()), 'INVALID_REQUEST')
        handoff.subprocess.Popen.assert_not_called()

    def test_spawn_executes_verified_snapshot_not_mutable_script_path(self):
        process = FakeProcess([])
        with patch.object(handoff.signal, 'getsignal', return_value=signal.SIG_DFL), \
             patch.object(handoff.subprocess, 'Popen', return_value=process) as spawn:
            child = handoff.spawn_gui_leaf(SOURCE, POINTER, object())
        self.assertIsInstance(child, handoff.OwnedFixtureLeaf)
        self.assertIs(child.process, process)
        self.assertIs(child.send, handoff.os.kill)
        spawn.assert_called_once_with([handoff.PYTHON, '-I', '-S', '-B', '-c', SOURCE.decode(), POINTER],
            env=handoff.child_env(), stdin=handoff.subprocess.DEVNULL, stdout=handoff.subprocess.DEVNULL,
            stderr=handoff.subprocess.DEVNULL, start_new_session=True, close_fds=True)
        handoff.os.killpg.assert_not_called()

    def test_cancelled_before_leaf_spawn_is_refused(self):
        handoff._CANCELLED = True
        self.expect_rejected(lambda: handoff.spawn_gui_leaf(SOURCE, POINTER, object()), 'CANCELLED')
        handoff.subprocess.Popen.assert_not_called()

    def test_flag_only_cancellation_during_spawn_retains_leaf_owner(self):
        child, process, observer, _, events = self.leaf(exited=True)
        def spawn(*_args, **_kwargs):
            handoff.request_cancel(signal.SIGTERM, None)
            return process
        with patch.object(handoff.signal, 'getsignal', return_value=signal.SIG_DFL), \
             patch.object(handoff.subprocess, 'Popen', side_effect=spawn):
            adopted = handoff.spawn_gui_leaf(SOURCE, POINTER, observer)
        self.assertIs(adopted.process, process)
        self.assertTrue(handoff._CANCELLED)
        self.assertTrue(adopted.stop())
        self.assertEqual(self.signals(events), [])

    def test_nondefault_sigchld_is_refused_before_leaf_spawn(self):
        with patch.object(handoff.signal, 'getsignal', return_value=signal.SIG_IGN):
            self.expect_rejected(lambda: handoff.spawn_gui_leaf(SOURCE, POINTER, object()))
        handoff.subprocess.Popen.assert_not_called()

    def test_bounded_exit_uncertainty_is_failure(self):
        child, _, _, clock, events = self.leaf()
        child.send = lambda pid, signum: events.append(('signal', pid, signum))
        self.assertFalse(child.stop(grace=0))
        self.assertGreaterEqual(clock.at, 0.5)
        self.assertLess(clock.at, 0.52)
        before = list(events)
        self.assertFalse(child.stop())
        self.assertEqual(events, before)


if __name__ == '__main__':
    unittest.main(verbosity=2)
