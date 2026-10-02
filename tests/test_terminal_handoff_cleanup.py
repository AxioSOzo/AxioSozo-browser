"""Injected-only ownership tests. Never create a process, load libSystem or signal a PID."""
import contextlib
import ctypes
import errno
import importlib.util
import io
import json
from pathlib import Path
import signal
import sys
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

SOURCE = Path(__file__).resolve().parents[1] / 'tools/axiosozo-handoff/terminal_handoff.py'
spec = importlib.util.spec_from_file_location('owned_handoff_candidate', SOURCE)
handoff = importlib.util.module_from_spec(spec)
sys.modules['owned_handoff_candidate'] = handoff
spec.loader.exec_module(handoff)


def forbidden(*_args, **_kwargs):
    raise AssertionError('Native process, dynamic loader or signal operation forbidden in injected tests')


class FakeWaitid:
    def __init__(self, outcomes):
        self.outcomes = list(outcomes)
        self.calls = []
        self.argtypes = None
        self.restype = None

    def __call__(self, kind, pid, pointer, flags):
        info = ctypes.cast(pointer, ctypes.POINTER(handoff.DarwinSigInfo)).contents
        # Darwin WNOHANG may leave the caller's structure completely untouched.
        if bytes(info) != bytes(ctypes.sizeof(handoff.DarwinSigInfo)):
            raise AssertionError('Observation reused nonzero status memory')
        self.calls.append((kind, pid, flags))
        outcome = self.outcomes.pop(0)
        if 'errno' in outcome:
            ctypes.set_errno(outcome['errno'])
            return outcome.get('return', -1)
        for name, value in outcome.items():
            setattr(info, name, value)
        return 0


class FakeClock:
    def __init__(self, events):
        self.at = 0.0
        self.events = events

    def __call__(self):
        return self.at

    def sleep(self, seconds):
        self.events.append(('sleep', seconds))
        self.at += seconds


class FakeProcess:
    def __init__(self, events, pid=4321):
        self.pid = pid
        self.returncode = None
        self.events = events
        self.reaped = False
        self.wait_error = None

    def wait(self, timeout):
        self.events.append(('wait', timeout))
        if self.wait_error:
            raise self.wait_error
        self.reaped = True
        self.returncode = 0
        return 0

    poll = communicate = send_signal = terminate = kill = forbidden


class FakeObserver:
    def __init__(self, process, events, exited=False):
        self.process = process
        self.events = events
        self.is_exited = exited
        self.error = None

    def observe(self, pid):
        if self.process.reaped:
            raise AssertionError('Kernel observation attempted after reap')
        self.events.append(('observe', pid, self.is_exited))
        if self.error:
            raise self.error
        return self.is_exited


class InjectedTest(unittest.TestCase):
    def setUp(self):
        handoff._CANCELLED = False
        handoff._MAY_HAVE_LAUNCHED = False
        self.stack = contextlib.ExitStack()
        self.addCleanup(self.stack.close)
        # These guards cover every process/signalling entry used by the candidate.
        for target in ('subprocess.Popen', 'subprocess.run', 'subprocess.call',
                       'os.kill', 'os.killpg', 'os.fork', 'os.posix_spawn',
                       'os.execv', 'os.execve', 'ctypes.CDLL', 'signal.signal'):
            self.stack.enter_context(patch('owned_handoff_candidate.' + target, side_effect=forbidden))

    def patch(self, target, *args, **kwargs):
        return self.stack.enter_context(patch.object(handoff, target, *args, **kwargs))

    def expect_rejected(self, callback, code='HELPER_UNAVAILABLE'):
        with self.assertRaises(handoff.Rejected) as caught:
            callback()
        self.assertEqual(caught.exception.code, code)
        return caught.exception

    def observer(self, outcomes):
        waitid = FakeWaitid(outcomes)
        with patch.object(handoff.sys, 'platform', 'darwin'):
            result = handoff.DarwinChildObserver(SimpleNamespace(waitid=waitid))
        return result, waitid

    def owned(self, exited=False):
        events = []
        process = FakeProcess(events)
        observer = FakeObserver(process, events, exited)
        clock = FakeClock(events)

        def send(pid, signum):
            self.assertFalse(process.reaped)
            self.assertEqual(pid, process.pid)
            self.assertEqual(events[-1][0:2], ('observe', pid))
            events.append(('signal', pid, signum))
            if signum == signal.SIGKILL:
                observer.is_exited = True

        child = handoff.OwnedChild(process, observer, clock=clock, sleep=clock.sleep, send=send)
        return child, process, observer, clock, events

    def signals(self, events):
        return [item for item in events if item[0] == 'signal']


class ObserverTests(InjectedTest):
    def test_exact_darwin_lp64_layout_and_c_signature(self):
        observer, function = self.observer([{}])
        self.assertEqual(ctypes.sizeof(handoff.DarwinSigInfo), 104)
        self.assertEqual(handoff.DarwinSigInfo.si_pid.offset, 12)
        self.assertEqual(handoff.DarwinSigInfo.si_uid.offset, 16)
        self.assertEqual(handoff.DarwinSigInfo.si_status.offset, 20)
        self.assertEqual(handoff.DarwinSigInfo.si_addr.offset, 24)
        self.assertEqual(handoff.DarwinSigInfo.si_value.offset, 32)
        self.assertEqual(handoff.DarwinSigInfo.si_band.offset, 40)
        self.assertEqual(handoff.DarwinSigInfo.padding.offset, 48)
        self.assertEqual(function.argtypes, [ctypes.c_int, ctypes.c_uint,
                         ctypes.POINTER(handoff.DarwinSigInfo), ctypes.c_int])
        self.assertIs(function.restype, ctypes.c_int)
        self.assertFalse(observer.observe(4321))
        self.assertEqual(function.calls, [(1, 4321, 0x25)])

    def test_running_child_requires_all_zero_untouched_result(self):
        observer, _ = self.observer([{}, {'si_signo': signal.SIGCHLD}])
        self.assertFalse(observer.observe(4321))
        self.expect_rejected(lambda: observer.observe(4321))

    def test_exited_child_uid_zero_is_valid_direct_child_metadata(self):
        observer, _ = self.observer([{'si_pid': 4321, 'si_signo': signal.SIGCHLD,
                                    'si_code': 1, 'si_status': 0, 'si_uid': 0}])
        self.assertTrue(observer.observe(4321))

    def test_all_three_darwin_exit_codes_preserve_nonreaping_observation(self):
        for code in (1, 2, 3):
            with self.subTest(code=code):
                observer, _ = self.observer([{'si_pid': 4321, 'si_signo': signal.SIGCHLD, 'si_code': code}])
                self.assertTrue(observer.observe(4321))

    def test_fresh_structure_on_every_call_including_eintr(self):
        observer, function = self.observer([{'errno': errno.EINTR}, {},
            {'si_pid': 4321, 'si_signo': signal.SIGCHLD, 'si_code': 1}, {}])
        self.assertFalse(observer.observe(4321))
        self.assertTrue(observer.observe(4321))
        self.assertFalse(observer.observe(4321))
        self.assertEqual(len(function.calls), 4)

    def test_eintr_has_four_attempt_bound(self):
        observer, function = self.observer([{'errno': errno.EINTR}] * 4)
        self.expect_rejected(lambda: observer.observe(4321))
        self.assertEqual(len(function.calls), 4)

    def test_echild_enosys_einval_eperm_and_unknown_return_fail_closed(self):
        for outcome in ({'errno': errno.ECHILD}, {'errno': errno.ENOSYS}, {'errno': errno.EINVAL},
                        {'errno': errno.EPERM}, {'errno': 0, 'return': 1}):
            with self.subTest(outcome=outcome):
                observer, function = self.observer([outcome])
                self.expect_rejected(lambda: observer.observe(4321))
                self.assertEqual(len(function.calls), 1)

    def test_unrelated_or_unknown_exit_metadata_fails_closed(self):
        valid = {'si_pid': 4321, 'si_signo': signal.SIGCHLD, 'si_code': 1}
        for field, value in (('si_pid', 9988), ('si_signo', signal.SIGTERM),
                             ('si_code', 0), ('si_code', 5), ('si_errno', errno.ECHILD)):
            with self.subTest(field=field, value=value):
                observer, _ = self.observer([{**valid, field: value}])
                self.expect_rejected(lambda: observer.observe(4321))

    def test_pid_input_is_exact_positive_32bit_integer(self):
        observer, function = self.observer([])
        for pid in (0, -1, 2147483648, True, '4321', 4321.0):
            with self.subTest(pid=pid):
                self.expect_rejected(lambda: observer.observe(pid))
        self.assertEqual(function.calls, [])

    def test_non_darwin_fails_without_library_or_process(self):
        with patch.object(handoff.sys, 'platform', 'linux'):
            self.expect_rejected(handoff.DarwinChildObserver)
        handoff.ctypes.CDLL.assert_not_called()
        handoff.subprocess.Popen.assert_not_called()

    def test_wrong_abi_fails_without_library_or_process(self):
        sizeof = ctypes.sizeof
        with patch.object(handoff.sys, 'platform', 'darwin'), \
             patch.object(handoff.ctypes, 'sizeof', side_effect=lambda item: 103 if item is handoff.DarwinSigInfo else sizeof(item)):
            self.expect_rejected(handoff.DarwinChildObserver)
        handoff.ctypes.CDLL.assert_not_called()
        handoff.subprocess.Popen.assert_not_called()

    def test_missing_fixed_library_or_waitid_symbol_fails_before_spawn(self):
        with patch.object(handoff.sys, 'platform', 'darwin'), \
             patch.object(handoff.ctypes, 'CDLL', side_effect=OSError('unavailable')) as load:
            self.expect_rejected(handoff.DarwinChildObserver)
            load.assert_called_once_with('/usr/lib/libSystem.B.dylib', use_errno=True)
        with patch.object(handoff.sys, 'platform', 'darwin'):
            self.expect_rejected(lambda: handoff.DarwinChildObserver(SimpleNamespace()))
        handoff.subprocess.Popen.assert_not_called()


class OwnershipTests(InjectedTest):
    def test_group_signals_precede_only_reap_and_each_has_fresh_authority(self):
        child, process, _, _, events = self.owned()
        self.assertTrue(child.stop(grace=0.02))
        self.assertEqual([event[2] for event in self.signals(events)], [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(events[-1], ('wait', 0))
        self.assertTrue(process.reaped)
        self.assertFalse(child.authority)
        for index, event in enumerate(events):
            if event[0] == 'signal':
                self.assertEqual(events[index - 1][0:2], ('observe', process.pid))

    def test_exited_leader_remains_unreaped_through_entire_descendant_grace(self):
        child, process, _, clock, events = self.owned(exited=True)
        self.assertTrue(child.stop(grace=0.5))
        self.assertGreaterEqual(clock.at, 0.5)
        self.assertEqual([event[2] for event in self.signals(events)], [signal.SIGTERM, signal.SIGKILL])
        self.assertEqual(events[-1], ('wait', 0))
        self.assertTrue(process.reaped)

    def test_repeated_finally_cannot_signal_reused_pid_after_reap(self):
        child, process, _, _, events = self.owned(exited=True)
        self.assertTrue(handoff.stop_owned(child, grace=0))
        snapshot = list(events)
        # The injected PID now refers to a different process. No new observation
        # or group signal is permitted from the old child or its receipt.
        process.pid = 9999
        self.assertTrue(handoff.stop_owned(child))
        self.assertTrue(handoff.stop_owned(child))
        self.assertEqual(events, snapshot)

    def test_already_reaped_popen_never_authorizes_any_group_signal(self):
        child, process, _, _, events = self.owned()
        process.returncode = 0
        process.reaped = True
        self.assertFalse(child.stop())
        self.assertEqual(events, [])
        self.assertFalse(child.authority)

    def test_raw_popen_or_receipt_pid_is_not_signal_authority(self):
        process = FakeProcess([])
        self.assertFalse(handoff.stop_owned(process))
        self.assertFalse(handoff.stop_owned({'pid': process.pid}))
        self.assertFalse(handoff.stop_owned(process.pid))
        self.assertTrue(handoff.stop_owned(None))
        handoff.os.killpg.assert_not_called()

    def test_unknown_observation_before_term_never_signals(self):
        child, _, observer, _, events = self.owned()
        observer.error = handoff.Rejected('HELPER_UNAVAILABLE')
        self.assertFalse(child.stop())
        self.assertEqual(self.signals(events), [])
        self.assertFalse(child.stop())
        self.assertEqual(self.signals(events), [])

    def test_ownership_lost_between_term_and_kill_never_escalates(self):
        child, _, observer, _, events = self.owned()
        send = child.send

        def lose_after_term(pid, signum):
            send(pid, signum)
            observer.error = handoff.Rejected('HELPER_UNAVAILABLE')

        child.send = lose_after_term
        self.assertFalse(child.stop(grace=0))
        self.assertEqual([event[2] for event in self.signals(events)], [signal.SIGTERM])
        self.assertFalse(child.stop())
        self.assertEqual([event[2] for event in self.signals(events)], [signal.SIGTERM])
        self.assertFalse(any(event[0] == 'wait' for event in events))

    def test_signal_permission_error_revokes_future_authority(self):
        child, _, _, _, events = self.owned()
        child.send = Mock(side_effect=PermissionError('denied'))
        self.assertFalse(child.stop(grace=0))
        self.assertFalse(child.stop())
        self.assertEqual(child.send.call_count, 1)
        self.assertFalse(any(event[0] == 'wait' for event in events))

    def test_empty_owned_group_esrch_does_not_imply_pid_reuse(self):
        child, _, _, _, events = self.owned(exited=True)
        child.send = Mock(side_effect=ProcessLookupError('group empty'))
        self.assertTrue(child.stop(grace=0))
        self.assertEqual(child.send.call_count, 2)
        self.assertEqual(events[-1], ('wait', 0))

    def test_post_kill_exit_deadline_revokes_future_group_signals(self):
        child, process, _, clock, events = self.owned()

        def never_exit(pid, signum):
            self.assertEqual(events[-1][0:2], ('observe', pid))
            events.append(('signal', pid, signum))

        child.send = never_exit
        self.assertFalse(child.stop(grace=0))
        self.assertGreaterEqual(clock.at, 0.5)
        self.assertLess(clock.at, 0.52)
        snapshot = list(events)
        self.assertFalse(child.stop())
        self.assertEqual(events, snapshot)
        self.assertFalse(process.reaped)

    def test_final_wait_failure_cannot_restore_group_authority(self):
        child, process, _, _, events = self.owned(exited=True)
        process.wait_error = handoff.subprocess.TimeoutExpired('owned', 0)
        self.assertFalse(child.stop(grace=0))
        snapshot = list(events)
        self.assertFalse(child.stop())
        self.assertEqual(events, snapshot)
        self.assertFalse(child.authority)

    def test_cleanup_reentry_during_signal_does_not_signal_twice(self):
        child, _, _, _, events = self.owned()
        send = child.send
        reentries = []

        def reenter(pid, signum):
            reentries.append(child.stop(grace=0))
            send(pid, signum)

        child.send = reenter
        self.assertTrue(child.stop(grace=0))
        self.assertEqual(reentries, [False, False])
        self.assertEqual(len(self.signals(events)), 2)

    def test_successful_independent_driver_release_revokes_signalling(self):
        child, _, _, _, events = self.owned()
        child.release()
        self.assertFalse(child.stop())
        self.assertEqual(events, [])

    def test_cancel_signal_during_cleanup_sets_flag_without_reentering_wait(self):
        child, _, _, _, events = self.owned()
        send = child.send

        def cancel_then_send(pid, signum):
            handoff.request_cancel(signal.SIGTERM, None)
            send(pid, signum)

        child.send = cancel_then_send
        self.assertTrue(child.stop(grace=0))
        self.assertTrue(handoff._CANCELLED)
        self.assertEqual(len(self.signals(events)), 2)
        self.assertEqual(events[-1], ('wait', 0))


class CancellationAndSpawnTests(InjectedTest):
    def test_cancellation_handler_only_sets_flag_for_term_int_hup(self):
        for signum in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
            handoff._CANCELLED = False
            self.assertIsNone(handoff.request_cancel(signum, None))
            self.assertTrue(handoff._CANCELLED)
            self.expect_rejected(handoff.check_cancelled, 'CANCELLED')
        handoff.subprocess.Popen.assert_not_called()
        handoff.os.killpg.assert_not_called()

    def test_cancellation_before_spawn_creates_no_child(self):
        handoff.request_cancel(signal.SIGTERM, None)
        self.expect_rejected(lambda: handoff.spawn_owned(['fixed'], object()), 'CANCELLED')
        handoff.subprocess.Popen.assert_not_called()

    def test_nondefault_sigchld_fails_before_popen(self):
        with patch.object(handoff.signal, 'getsignal', return_value=signal.SIG_IGN):
            self.expect_rejected(lambda: handoff.spawn_owned(['fixed'], object()))
        handoff.subprocess.Popen.assert_not_called()

    def test_term_int_hup_during_popen_do_not_interrupt_ownership_adoption(self):
        for signum in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP):
            with self.subTest(signum=signum):
                handoff._CANCELLED = False
                child, process, observer, _, events = self.owned()

                def during_popen(*_args, **_kwargs):
                    handoff.request_cancel(signum, None)
                    return process

                with patch.object(handoff.signal, 'getsignal', return_value=signal.SIG_DFL), \
                     patch.object(handoff.subprocess, 'Popen', side_effect=during_popen) as spawn, \
                     patch.object(handoff.os, 'killpg', side_effect=child.send):
                    adopted = handoff.spawn_owned(['fixed', '--argument'], observer)
                    self.assertIs(adopted.process, process)
                    self.expect_rejected(handoff.check_cancelled, 'CANCELLED')
                    self.assertTrue(adopted.stop(grace=0))
                spawn.assert_called_once_with(['fixed', '--argument'], env=handoff.child_env(),
                    stdin=handoff.subprocess.DEVNULL, stdout=handoff.subprocess.DEVNULL,
                    stderr=handoff.subprocess.DEVNULL, start_new_session=True, close_fds=True)
                self.assertEqual([event[2] for event in self.signals(events)], [signal.SIGTERM, signal.SIGKILL])
                self.assertEqual(events[-1], ('wait', 0))

    def test_driver_checks_observer_before_any_descriptor_or_child(self):
        self.patch('__file__', handoff.ROOT + '/launch-' + 'a' * 32 + '/driver.py')
        self.patch('DarwinChildObserver', side_effect=handoff.Rejected('HELPER_UNAVAILABLE'))
        directories = self.patch('open_dir', side_effect=forbidden)
        self.expect_rejected(handoff.driver)
        directories.assert_not_called()
        handoff.subprocess.Popen.assert_not_called()

    def test_driver_second_directory_failure_closes_owned_root_descriptor(self):
        self.patch('__file__', handoff.ROOT + '/launch-' + 'a' * 32 + '/driver.py')
        self.patch('DarwinChildObserver', return_value=object())
        self.patch('open_dir', side_effect=[10, OSError('unavailable')])
        with patch.object(handoff.os, 'close') as close:
            with self.assertRaises(OSError):
                handoff.driver()
        close.assert_called_once_with(10)
        handoff.subprocess.Popen.assert_not_called()


class MemoryOnlyIntegrationTests(InjectedTest):
    def memory_launch(self, write_hook=None):
        child, process, observer, _, events = self.owned()
        request = {'version': 1, 'agent': 'fake', 'mode': 'headless', 'cwd': '/invented/project',
                   'context': {'invented': True}, 'live_authorized': False, 'test_only': True}
        self.patch('policy_data', return_value=({'projects': [request['cwd']], 'timeout_s': 1}, 'b' * 64, b''))
        self.patch('validate_context')
        self.patch('DarwinChildObserver', return_value=observer)
        self.patch('open_dir', return_value=12)
        self.patch('ensure_root', return_value=10)
        self.patch('read_path', return_value=b'injected source only')
        self.patch('spawn_owned', return_value=child)
        self.patch('wait_record', side_effect=[{'version': 1, 'status': 'prepared'}, {'version': 1, 'status': 'started'}])
        self.patch('clean_state', side_effect=lambda *_: events.append(('clean_state',)))
        writes = []

        def write(_fd, name, value, _mode=0o600):
            writes.append(name)
            if write_hook:
                write_hook(name)

        self.patch('write_file', side_effect=write)
        self.stack.enter_context(patch.object(handoff.os, 'fstat', return_value=SimpleNamespace(st_dev=1, st_ino=2)))
        self.stack.enter_context(patch.object(handoff.os, 'mkdir'))
        self.stack.enter_context(patch.object(handoff.os, 'open', side_effect=[11, 20]))
        self.stack.enter_context(patch.object(handoff.os, 'close'))
        self.stack.enter_context(patch.object(handoff.os, 'urandom', return_value=b'a' * 16))
        self.stack.enter_context(patch.object(handoff.fcntl, 'flock'))
        return request, child, process, events, writes

    def test_cancellation_after_proceed_latches_uncertain_and_cleans_only_owned_child(self):
        request, child, _, events, writes = self.memory_launch(
            write_hook=lambda name: handoff.request_cancel(signal.SIGTERM, None) if name == 'proceed' else None)
        error = self.expect_rejected(lambda: handoff.launch(request, 'injected-policy'), 'LAUNCH_UNCERTAIN')
        self.assertTrue(error.may_have_launched)
        self.assertTrue(handoff._MAY_HAVE_LAUNCHED)
        self.assertIn('cancel', writes)
        self.assertNotIn('received', writes)
        self.assertTrue(child.cleaned)
        self.assertEqual(events[-2:], [('wait', 0), ('clean_state',)])
        self.assertEqual(len(self.signals(events)), 2)

    def test_success_receipt_releases_driver_authority_without_group_signal(self):
        request, child, _, events, writes = self.memory_launch()
        receipt = handoff.launch(request, 'injected-policy')
        self.assertEqual(receipt['status'], 'handed_off')
        self.assertTrue(receipt['may_have_launched'])
        self.assertIn('received', writes)
        self.assertFalse(child.authority)
        self.assertEqual(events, [])
        self.assertFalse(child.stop())
        self.assertEqual(events, [])

    def test_real_agent_denial_precedes_policy_process_or_path_access(self):
        policy = self.patch('policy_data', side_effect=forbidden)
        observer = self.patch('DarwinChildObserver', side_effect=forbidden)
        for agent in ('codex', 'claude-code'):
            with self.subTest(agent=agent):
                self.expect_rejected(lambda: handoff.launch({'agent': agent, 'live_authorized': False}, '/forbidden'), 'NOT_AUTHORIZED')
        self.expect_rejected(lambda: handoff.launch({'agent': 'fake', 'live_authorized': True}, '/forbidden'), 'NOT_AUTHORIZED')
        policy.assert_not_called()
        observer.assert_not_called()
        handoff.subprocess.Popen.assert_not_called()

    def test_main_postlaunch_signal_preserves_uncertain_receipt_and_flag_only_handlers(self):
        def result_then_cancel(*_args):
            handoff._MAY_HAVE_LAUNCHED = True
            handoff.request_cancel(signal.SIGTERM, None)
            return {'version': 1, 'status': 'handed_off', 'may_have_launched': True}

        self.patch('launch', side_effect=result_then_cancel)
        self.stack.enter_context(patch.object(handoff.sys, 'argv', ['helper', '--policy', 'injected-policy']))
        self.stack.enter_context(patch.object(handoff.sys, 'stdin', SimpleNamespace(buffer=io.BytesIO(b'{}'))))
        self.stack.enter_context(patch.object(handoff.os, 'umask'))
        output = io.StringIO()
        with patch.object(handoff.signal, 'signal') as handlers, contextlib.redirect_stdout(output):
            self.assertEqual(handoff.main(), 1)
        receipt = json.loads(output.getvalue())
        self.assertEqual(receipt, {'version': 1, 'status': 'denied', 'reason': 'LAUNCH_UNCERTAIN', 'may_have_launched': True})
        self.assertEqual(handlers.call_args_list[:3], [unittest.mock.call(signum, handoff.request_cancel)
            for signum in (signal.SIGTERM, signal.SIGINT, signal.SIGHUP)])
        self.assertEqual(handlers.call_args_list[3], unittest.mock.call(signal.SIGCHLD, signal.SIG_DFL))
        handoff.subprocess.Popen.assert_not_called()

    def test_main_stdin_eof_cancellation_prevents_launch(self):
        class Buffer:
            def read(self, _limit):
                handoff.request_cancel(signal.SIGTERM, None)
                return b'{}'

        launch = self.patch('launch', side_effect=forbidden)
        self.stack.enter_context(patch.object(handoff.sys, 'argv', ['helper', '--policy', 'injected-policy']))
        self.stack.enter_context(patch.object(handoff.sys, 'stdin', SimpleNamespace(buffer=Buffer())))
        self.stack.enter_context(patch.object(handoff.os, 'umask'))
        output = io.StringIO()
        with patch.object(handoff.signal, 'signal'), contextlib.redirect_stdout(output):
            self.assertEqual(handoff.main(), 1)
        self.assertEqual(json.loads(output.getvalue()), {'version': 1, 'status': 'denied', 'reason': 'CANCELLED', 'may_have_launched': False})
        launch.assert_not_called()
        handoff.subprocess.Popen.assert_not_called()

    def test_main_postmetadata_signal_is_cancelled_without_dispatch(self):
        def metadata_then_cancel(*_args):
            handoff.request_cancel(signal.SIGTERM, None)
            return {'version': 1, 'status': 'verified'}

        self.patch('verify_gui_policy', side_effect=metadata_then_cancel)
        self.stack.enter_context(patch.object(handoff.sys, 'argv', ['helper', '--verify-policy', 'injected-policy']))
        self.stack.enter_context(patch.object(handoff.os, 'umask'))
        output = io.StringIO()
        with patch.object(handoff.signal, 'signal'), contextlib.redirect_stdout(output):
            self.assertEqual(handoff.main(), 1)
        self.assertEqual(json.loads(output.getvalue()), {'version': 1, 'status': 'denied', 'reason': 'CANCELLED', 'may_have_launched': False})
        handoff.subprocess.Popen.assert_not_called()


if __name__ == '__main__':
    unittest.main(verbosity=2)
