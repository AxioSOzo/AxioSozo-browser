#!/usr/bin/env python3
"""Real CEF pipe/render/input tests. Passing these proves a component, never E1."""
import contextlib
import http.server
import importlib.util
import json
import os
from pathlib import Path
import secrets
import select
import signal
import struct
import subprocess
import tempfile
import threading
import time
import zlib

spec = importlib.util.spec_from_file_location('probe', Path(__file__).with_name('probe.py'))
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


def read_exact(pipe, size, deadline):
    output = bytearray()
    while len(output) < size:
        left = deadline - time.monotonic()
        if left <= 0 or not select.select([pipe], [], [], left)[0]:
            raise TimeoutError('AXCF read deadline')
        part = os.read(pipe.fileno(), min(size - len(output), 1024 * 1024))
        if not part:
            raise EOFError('native AXCF stream closed')
        output.extend(part)
    return output


def read_packet(pipe, deadline):
    header = read_exact(pipe, 16, deadline)
    magic, version, kind, metadata_size, size = struct.unpack('>4sHHII', header)
    if magic != b'AXCF' or version != 1 or kind not in (1, 2):
        raise ValueError('invalid AXCF header')
    if not 1 <= metadata_size <= 8192 or not 0 <= size <= 33554432:
        raise ValueError('invalid AXCF lengths')
    if kind == 1 and size:
        raise ValueError('event has binary payload')
    metadata = json.loads(read_exact(pipe, metadata_size, deadline))
    if kind == 2:
        width, height = metadata['width'], metadata['height']
        if (not isinstance(width, int) or not isinstance(height, int)
                or not 1 <= width <= 4096 or not 1 <= height <= 4096
                or metadata['stride'] != width * 4 or size != width * height * 4
                or metadata['format'] != 'BGRA8'):
            raise ValueError('invalid AXCF frame geometry')
    return kind, metadata, read_exact(pipe, size, deadline)


def png(path, width, height, bgra):
    # Lossless encoding of actual OnPaint bytes, not generated/simulated evidence.
    rgba = bytearray(bgra)
    rgba[0::4], rgba[2::4] = bgra[2::4], bgra[0::4]
    def chunk(name, data):
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', zlib.crc32(name + data))
    rows = b''.join(b'\0' + rgba[y * width * 4:(y + 1) * width * 4] for y in range(height))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
                     + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b''))


class Session:
    def __init__(self, origin, directory, browsing_mode=None, timeout=15):
        self.origin, self.directory = origin, directory
        self.profile = Path(tempfile.mkdtemp(prefix='cef-profile-stream-', dir=probe.BASE))
        os.chmod(self.profile, 0o700)
        self.error = (directory / 'stderr.log').open('wb')
        self.process = subprocess.Popen([str(probe.BINARY), '--stream', str(self.profile), str(directory)],
                                        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=self.error,
                                        start_new_session=True, bufsize=0,
                                        env={'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'TMPDIR': str(self.profile)})
        self.token = secrets.token_hex(32)
        self.instance = 'cef-fixture-' + secrets.token_hex(8)
        self.counter = 0
        self.browsing_mode = browsing_mode
        self.timeout = timeout
        self.target = None
        self.events, self.frames = [], 0
        hello = dict(version=1, method='hello', token=self.token, engine_instance=self.instance,
                     fixture_origin=origin)
        if browsing_mode:
            hello['browsing_mode'] = browsing_mode
        self.write(hello)

    def write(self, item):
        data = (json.dumps(item, separators=(',', ':')) + '\n').encode()
        if len(data) > 16384:
            raise ValueError('test request exceeds native bound')
        self.process.stdin.write(data)

    def command(self, method, target=None, **fields):
        self.counter += 1
        request_id = ('cef-' if self.browsing_mode == 'web' else 'request-') + str(self.counter)
        item = dict(version=1, method=method, request_id=request_id, token=self.token, **fields)
        if method != 'shutdown':
            item['target'] = self.target if target is None else target
        self.write(item)
        return request_id

    def until(self, predicate, seconds=None, capture=None):
        deadline = time.monotonic() + (self.timeout if seconds is None else seconds)
        while True:
            kind, item, pixels = read_packet(self.process.stdout, deadline)
            if kind == 1:
                self.events.append(item)
                if item.get('target'):
                    self.target = item['target']
            else:
                self.frames += 1
                self.command('frame_ack', target=item['target'], frame_id=item['frame_id'])
                if capture:
                    png(capture, item['width'], item['height'], pixels)
            if predicate(kind, item):
                return item

    def close(self):
        with contextlib.suppress(OSError):
            self.process.stdin.close()
        try:
            with contextlib.suppress(subprocess.TimeoutExpired):
                self.process.wait(timeout=12)
        finally:
            self.cleanup_error = None
            try:
                probe.cleanup_group(self.process)
            except OSError as error:
                # Keep failure evidence even if macOS refuses a signal during
                # helper teardown. Never remove a possibly live profile.
                self.cleanup_error = type(error).__name__ + ': ' + str(error)
            self.process.stdout.close()
            self.error.close()
            (self.directory / 'events.json').write_text(json.dumps(self.events, indent=2) + '\n')
            self.profile_removed = False
            if self.cleanup_error is None:
                try:
                    self.profile_removed = probe.remove_created_profile(self.profile, self.process,
                                                                        prefix='cef-profile-stream-')
                except OSError as error:
                    self.cleanup_error = type(error).__name__ + ': ' + str(error)


def run():
    probe.check()
    directory = Path(tempfile.mkdtemp(prefix='cef-stream-', dir=probe.EVIDENCE))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), probe.FixtureHandler)
    server.request_log = directory / 'fixture-requests.jsonl'
    server.request_log.write_text('')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    session = None
    result = {'status': 'FAIL', 'E1': 'NOT_TESTED', 'E2': 'NOT_TESTED', 'started_at': time.time()}
    def interrupted(_signal, _frame):
        raise KeyboardInterrupt
    previous_term = signal.signal(signal.SIGTERM, interrupted)
    try:
        origin = f'http://127.0.0.1:{server.server_port}'
        session = Session(origin, directory)
        ready = session.until(lambda kind, item: item.get('event') == 'ready')
        assert ready['cef'] == probe.VERSION and ready['render_path'] == 'native-osr-bgra'
        pending = dict(tab_id='fixture-tab', engine_instance=session.instance, identity=origin,
                       document_generation=1, navigation_generation=1, private_mode=False)
        session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
        initial = session.until(lambda kind, item: kind == 2, capture=directory / 'initial.png')
        assert initial['width'] == 1800 and initial['height'] == 1300
        session.command('focus', focused=True)
        session.command('key', type='char', native_key_code=0, windows_key_code=0, modifiers=0, text='CEF')
        session.until(lambda kind, item: item.get('event') == 'title' and 'input=CEF' in item.get('title', ''))
        session.until(lambda kind, item: kind == 2, capture=directory / 'input.png')
        stale = dict(session.target)
        session.command('resize', width=1000, height=700, device_scale=2)
        session.until(lambda kind, item: kind == 2 and item['width'] == 2000 and item['height'] == 1400,
                      capture=directory / 'resize.png')
        # A 5K fullscreen logical viewport cannot fit at 2x in the bounded
        # transport. The presenter selects 1.5x without reducing page/input
        # coordinates or raising the native pipe's memory cap.
        session.command('resize', width=2560, height=1440, device_scale=1.5)
        capped = session.until(lambda kind, item: kind == 2 and item['width'] == 3840 and item['height'] == 2160,
                               capture=directory / 'fullscreen-capped.png')
        assert capped['device_scale'] == 1.5
        focus_id = session.command('focus', focused=True)
        session.until(lambda kind, item: item.get('event') == 'completed' and item.get('request_id') == focus_id)
        for key_type in ('down', 'up'):
            tab_id = session.command('key', type=key_type, native_key_code=0x30,
                                     windows_key_code=9, modifiers=0, text='')
            session.until(lambda kind, item: item.get('event') == 'completed' and item.get('request_id') == tab_id)
        session.command('navigate', url=origin + '/engine.html?page=2')
        session.until(lambda kind, item: item.get('event') == 'title' and 'page=2' in item.get('title', ''))
        session.until(lambda kind, item: kind == 2, capture=directory / 'page-2.png')
        stale_request = session.command('focus', target=stale, focused=True)
        session.until(lambda kind, item: item.get('request_id') == stale_request and item.get('code') == 'stale_target')
        before_back = dict(session.target)
        session.command('back')
        session.until(lambda kind, item: item.get('event') == 'title' and 'page=1' in item.get('title', ''))
        session.until(lambda kind, item: kind == 2)
        assert session.target['document_generation'] == before_back['document_generation'] + 1
        assert session.target['navigation_generation'] == before_back['navigation_generation'] + 1
        assert any(item.get('event') == 'load' and item.get('http_status') == 0 and item.get('restored_from_history') is True for item in session.events)
        back_stale = session.command('focus', target=before_back, focused=True)
        session.until(lambda kind, item: item.get('request_id') == back_stale and item.get('code') == 'stale_target')
        close_id = session.command('close')
        session.until(lambda kind, item: item.get('event') == 'completed' and item.get('request_id') == close_id)
        session.process.wait(timeout=8)
        assert session.process.returncode == 0
        result.update(status='PASS', cef=ready['cef'], chromium=ready['chromium'], frames=session.frames,
                      native_pid=session.process.pid, native_exit_code=0,
                      tests=['real_OSR_frame', 'input', 'retina_resize', 'fullscreen_size_capped_1_5x',
                             'fullscreen_focus_and_tab', 'GET_navigation', 'back',
                             'stale_target_rejected', 'BFCache_generation_revoked', 'HTTP0_explicit_history_only', 'native_close_completed'])
    except (Exception, KeyboardInterrupt) as exc:
        result['error'] = type(exc).__name__ + ': ' + str(exc)
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
            result['profile_removed'] = session.profile_removed
            if not session.profile_removed:
                result.update(status='FAIL', error='Owned native fixture profile was not removed after process exit')
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
        signal.signal(signal.SIGTERM, previous_term)
        result['finished_at'] = time.time()
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(dict(result, evidence=str(directory))), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
