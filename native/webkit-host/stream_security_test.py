#!/usr/bin/env python3
"""Negative tests against the actual WebKit host (never a mock engine when run by probe.py test).

core_test.py reuses these cases against the TEST-ONLY scripted engine; that run is labelled
engine "fake" and only proves the engine-neutral core.
"""
import importlib.util
import json
from pathlib import Path
import signal
import time

spec = importlib.util.spec_from_file_location('webkit_stream_test', Path(__file__).with_name('stream_test.py'))
stream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stream)
probe = stream.probe

CASES = ['wrong_token', 'duplicate_frame_ack', 'unknown_frame_ack', 'duplicate_target_id', 'replayed_request_id',
         'unknown_key', 'malformed_json', 'overlong_line', 'denied_navigation_url', 'web_mode_hello',
         'surface_hello', 'clean_pipe_eof', 'shutdown']


def pending(session, origin, tab='fixture-tab'):
    return dict(tab_id=tab, engine_instance=session.instance, identity=origin,
                document_generation=1, navigation_generation=1, private_mode=False)


def create(session, origin):
    session.command('create', target=pending(session, origin), url=origin + '/engine.html', width=900, height=650, device_scale=1)
    return session.until(lambda kind, _: kind == 2)


def expect_exit(session, code):
    session.process.wait(timeout=20)
    assert session.process.returncode == code, (session.process.returncode, code)


def case(kind, binary, origin, directory, server):
    hello_extra = {'web_mode_hello': {'browsing_mode': 'web'},
                   'surface_hello': {'surface_service': 'dev.axiosozo.surface.' + '0' * 32, 'surface_token': '1' * 64}}.get(kind)
    session = stream.Session(binary, origin, directory, hello_extra=hello_extra)
    try:
        if kind in ('web_mode_hello', 'surface_hello'):
            # The fixture host offers neither profile: the hello itself is refused.
            expect_exit(session, 64)
            return session
        session.until(lambda _, item: item.get('event') == 'ready')
        if kind == 'wrong_token':
            before = server.request_log.read_text()
            session.write(dict(version=1, method='shutdown', request_id='unauthorized', token='00' * 32))
            expect_exit(session, 64)
            assert server.request_log.read_text() == before  # no page was requested
        elif kind == 'duplicate_frame_ack':
            first = create(session, origin)
            # until() has already acknowledged this exact frame once.
            session.command('frame_ack', target=first['target'], frame_id=first['frame_id'])
            expect_exit(session, 64)
        elif kind == 'unknown_frame_ack':
            first = create(session, origin)
            session.command('frame_ack', target=first['target'], frame_id=first['frame_id'] + 1000)
            expect_exit(session, 64)
        elif kind == 'duplicate_target_id':
            create(session, origin)
            live = dict(session.target)
            again = session.command('create', target=pending(session, origin), url=origin + '/engine.html', width=900, height=650, device_scale=1)
            session.until(lambda _, item: item.get('request_id') == again and item.get('code') == 'invalid_lifecycle')
            focus = session.command('focus', focused=True)
            session.completed(focus)
            assert session.target == live
            session.process.stdin.close()
            expect_exit(session, 0)
        elif kind == 'replayed_request_id':
            create(session, origin)
            item = dict(version=1, method='focus', request_id='same-id', token=session.token, target=session.target, focused=True)
            session.write(item)
            session.completed('same-id')
            session.write(item)  # a replay is never executed twice
            expect_exit(session, 64)
        elif kind == 'unknown_key':
            create(session, origin)
            session.write(dict(version=1, method='focus', request_id='extra', token=session.token, target=session.target,
                               focused=True, unexpected=1))
            expect_exit(session, 64)
        elif kind == 'malformed_json':
            session.process.stdin.write(b'{"version":1,\n')
            expect_exit(session, 64)
        elif kind == 'overlong_line':
            session.process.stdin.write(b'"' + b'a' * 20000 + b'"\n')
            expect_exit(session, 64)
        elif kind == 'denied_navigation_url':
            create(session, origin)
            before = server.request_log.read_text()
            session.command('navigate', url='http://127.0.0.1:1/other.html')
            expect_exit(session, 64)
            assert server.request_log.read_text() == before
        elif kind == 'shutdown':
            create(session, origin)
            request = session.command('shutdown')
            session.until(lambda _, item: item.get('event') == 'accepted' and item.get('request_id') == request)
            session.completed(request, seconds=25)
            expect_exit(session, 0)
        else:  # clean_pipe_eof
            create(session, origin)
            session.process.stdin.close()
            expect_exit(session, 0)
        return session
    finally:
        session.close()


def run(binary=None, engine='webkit', port='wpe'):
    binary = Path(binary or probe.BINARY)
    if engine == 'webkit' and port == 'wpe':
        probe.check()
    subreaper = probe.become_subreaper()
    directory = probe.new_evidence(('webkit-' + port if engine == 'webkit' else 'core-fake') + '-security-')
    result = dict(status='FAIL', engine=engine, port=port if engine == 'webkit' else None, started_at=time.time(),
                  tests=[], profiles=[], test_subreaper=subreaper, E1='NOT_TESTED', E2='NOT_TESTED')
    if engine != 'webkit':
        result['label'] = 'TEST-ONLY scripted engine; proves the core and harness, never WebKit'
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        with probe.fixture_server(directory) as (server, origin):
            for kind in CASES:
                case_dir = directory / kind
                case_dir.mkdir()
                session = case(kind, binary, origin, case_dir, server)
                result['profiles'].append(str(session.profile))
                entry = dict(name=kind, status='PASS', native_exit_code=session.exit_code,
                             orphans=session.orphans, profile_removed=session.profile_removed)
                result['tests'].append(entry)
                assert not session.orphans, (kind, session.orphans)
                assert session.profile_removed, (kind, 'profile not removed')
        assert len(set(result['profiles'])) == len(CASES)
        result.update(status='PASS', profile_isolation=f'{len(CASES)} distinct fresh private profile directories, all removed')
    except (Exception, KeyboardInterrupt) as error:
        result['error'] = type(error).__name__ + ': ' + str(error)
    finally:
        signal.signal(signal.SIGTERM, previous_term)
        result.update(finished_at=time.time(), evidence=str(directory))
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
