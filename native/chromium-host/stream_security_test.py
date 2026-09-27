#!/usr/bin/env python3
"""Negative tests against the actual sandboxed CEF host, never a mock engine."""
import contextlib
import http.server
import importlib.util
import json
from pathlib import Path
import signal
import tempfile
import threading
import time

spec = importlib.util.spec_from_file_location('stream_test', Path(__file__).with_name('stream_test.py'))
stream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stream)
probe = stream.probe


def run():
    probe.check()
    directory = Path(tempfile.mkdtemp(prefix='cef-stream-security-', dir=probe.EVIDENCE))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), probe.FixtureHandler)
    server.request_log = directory / 'fixture-requests.jsonl'
    server.request_log.write_text('')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    result = dict(status='FAIL', started_at=time.time(), tests=[], profiles=[], native_pids=[],
                  E1='NOT_TESTED', E2='NOT_TESTED')
    session = None
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        for kind in ['wrong_token', 'duplicate_frame_ack', 'duplicate_target_id', 'clean_pipe_eof']:
            case = directory / kind
            case.mkdir()
            session = stream.Session(origin, case)
            result['profiles'].append(str(session.profile))
            result['native_pids'].append(session.process.pid)
            session.until(lambda _, item: item.get('event') == 'ready')
            if kind == 'wrong_token':
                before = server.request_log.read_text()
                session.write(dict(version=1, method='shutdown', request_id='unauthorized', token='00' * 32))
                session.process.wait(timeout=15)
                assert session.process.returncode == 64
                assert server.request_log.read_text() == before  # No page was requested.
            elif kind == 'duplicate_frame_ack':
                pending = dict(tab_id='fixture-tab', engine_instance=session.instance, identity=origin,
                               document_generation=1, navigation_generation=1, private_mode=False)
                session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
                first = session.until(lambda kind, _: kind == 2)
                # until() has already acknowledged this exact live frame once.
                session.command('frame_ack', target=first['target'], frame_id=first['frame_id'])
                session.process.wait(timeout=15)
                assert session.process.returncode == 64
            elif kind == 'duplicate_target_id':
                pending = dict(tab_id='fixture-tab', engine_instance=session.instance, identity=origin,
                               document_generation=1, navigation_generation=1, private_mode=False)
                session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
                session.until(lambda kind, _: kind == 2)
                live = dict(session.target)
                # A second target may never claim a live tab's identity.
                again = session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
                session.until(lambda _, item: item.get('request_id') == again and item.get('code') == 'invalid_lifecycle')
                focus = session.command('focus', focused=True)
                session.until(lambda _, item: item.get('event') == 'completed' and item.get('request_id') == focus)
                assert session.target == live
                session.process.stdin.close()
                session.process.wait(timeout=15)
                assert session.process.returncode == 0
            else:
                session.process.stdin.close()
                session.process.wait(timeout=15)
                assert session.process.returncode == 0
            result['tests'].append(dict(name=kind, status='PASS', native_exit_code=session.process.returncode))
            session.close()
            session = None
        assert len(set(result['profiles'])) == 4
        result.update(status='PASS', profile_isolation='four distinct fresh native profile directories')
    except (Exception, KeyboardInterrupt) as error:
        result['error'] = type(error).__name__ + ': ' + str(error)
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
        signal.signal(signal.SIGTERM, previous_term)
        result.update(finished_at=time.time(), evidence=str(directory))
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
