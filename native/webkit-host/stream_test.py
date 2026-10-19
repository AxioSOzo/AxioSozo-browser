#!/usr/bin/env python3
"""Real WebKit host pipe/render/input/navigation test (engine-stream-v1, fixture profile).

Run against the real WPE host this is component evidence, never E1/E2. core_test.py runs the
same scenario against the TEST-ONLY scripted engine (tests/fake_host.cc) to prove the harness
and the engine-neutral core; that run is labelled engine "fake" and is never WebKit evidence.
"""
import contextlib
import importlib.util
import json
import os
from pathlib import Path
import platform
import secrets
import select
import signal
import struct
import subprocess
import tempfile
import time
import zlib

spec = importlib.util.spec_from_file_location('webkit_probe', Path(__file__).with_name('probe.py'))
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


FRAME_KEYS = {'version', 'target', 'frame_id', 'width', 'height', 'stride', 'device_scale', 'format'}


def read_packet(pipe, deadline, damage=False):
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
        # Exactly the cef-v1 frame keys; `damage` only when negotiated in hello.
        if set(metadata) != (FRAME_KEYS | {'damage'} if damage else FRAME_KEYS):
            raise ValueError('unexpected AXCF frame keys ' + ','.join(sorted(metadata)))
        if (not isinstance(width, int) or not isinstance(height, int)
                or not 1 <= width <= 4096 or not 1 <= height <= 4096
                or metadata['stride'] != width * 4 or size != width * height * 4
                or metadata['format'] != 'BGRA8'):
            raise ValueError('invalid AXCF frame geometry')
    return kind, metadata, read_exact(pipe, size, deadline)


def png(path, width, height, bgra):
    # Lossless encoding of the actual engine pixels, not generated/simulated evidence.
    rgba = bytearray(bgra)
    rgba[0::4], rgba[2::4] = bgra[2::4], bgra[0::4]
    def chunk(name, data):
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', zlib.crc32(name + data))
    rows = b''.join(b'\0' + rgba[y * width * 4:(y + 1) * width * 4] for y in range(height))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
                     + chunk(b'IDAT', zlib.compress(rows, 9)) + chunk(b'IEND', b''))


def outside_damage_equal(previous, current, width, height, rect):
    """Every pixel outside the reported damage rectangle is byte-identical to the previous frame."""
    x, y, w, h = rect
    row = width * 4
    for line in range(height):
        start = line * row
        if line < y or line >= y + h:
            if previous[start:start + row] != current[start:start + row]:
                return False
        else:
            if previous[start:start + x * 4] != current[start:start + x * 4]:
                return False
            if previous[start + (x + w) * 4:start + row] != current[start + (x + w) * 4:start + row]:
                return False
    return True


def region(pixels, width, rect):
    """Bytes of a physical-pixel rectangle (x, y, w, h) of a BGRA frame."""
    x, y, w, h = rect
    return b''.join(pixels[(row * width + x) * 4:(row * width + x + w) * 4] for row in range(y, y + h))


# Interior of the fixture's text field at 2x (tests/fixtures/engine.html), right of the caret
# and inside the focus ring: changes only when the field's text (or placeholder) changes.
INPUT_TEXT_2X = (240, 325, 530, 75)
# Tail of the status line ("input=<typed>") at 2x: empty on a fresh document.
STATUS_TAIL_2X = (630, 595, 400, 65)


class Session:
    def __init__(self, binary, origin, directory, frame_damage=False, timeout=30, hello_extra=None):
        self.origin, self.directory = origin, directory
        probe.BASE.mkdir(parents=True, exist_ok=True)
        self.profile = Path(tempfile.mkdtemp(prefix='webkit-profile-', dir=probe.BASE))
        os.chmod(self.profile, 0o700)
        (self.profile / 'tmp').mkdir(mode=0o700)
        self.error = (directory / 'stderr.log').open('wb')
        env = {'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'HOME': str(self.profile), 'LANG': 'C.UTF-8',
               'TMPDIR': str(self.profile / 'tmp'), 'AXIOSOZO_WEBKIT_TRACE': '1'}
        self.started = time.monotonic()
        self.process = subprocess.Popen([str(binary), '--stream', str(self.profile), str(directory)],
                                        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=self.error,
                                        start_new_session=True, bufsize=0, env=env)
        self.token = secrets.token_hex(32)
        self.instance = 'webkit-fixture-' + secrets.token_hex(8)
        self.counter = 0
        self.timeout = timeout
        self.target = None
        self.events, self.frames = [], 0
        self.frame_log = []  # (monotonic, frame_id, width, height, device_scale)
        self.frame_damage = frame_damage
        self.damage_checked = self.damage_violations = 0
        self.damage_area = []
        self.last = None  # (metadata, pixels) of the newest frame
        hello = dict(version=1, method='hello', token=self.token, engine_instance=self.instance, fixture_origin=origin)
        if frame_damage:
            hello['frame_damage'] = True
        hello.update(hello_extra or {})
        self.write(hello)

    def write(self, item):
        data = (json.dumps(item, separators=(',', ':')) + '\n').encode()
        with (self.directory / 'commands.jsonl').open('a') as log:
            log.write(json.dumps(dict(t=round(time.monotonic(), 4), method=item.get('method'), request_id=item.get('request_id'))) + '\n')
        if len(data) > 16384:
            raise ValueError('test request exceeds native bound')
        self.process.stdin.write(data)

    def command(self, method, target=None, **fields):
        self.counter += 1
        request_id = 'request-' + str(self.counter)
        item = dict(version=1, method=method, request_id=request_id, token=self.token, **fields)
        if method != 'shutdown':
            item['target'] = self.target if target is None else target
        self.write(item)
        return request_id

    def until(self, predicate, seconds=None, capture=None):
        deadline = time.monotonic() + (self.timeout if seconds is None else seconds)
        while True:
            kind, item, pixels = read_packet(self.process.stdout, deadline, self.frame_damage)
            if kind == 1:
                self.events.append(item)
                target = item.get('target')
                if target and (self.target is None or target['tab_id'] == self.target['tab_id']):
                    self.target = target
            else:
                self.frames += 1
                self.frame_log.append((time.monotonic(), item['frame_id'], item['width'], item['height'], item['device_scale']))
                with (self.directory / 'frames.jsonl').open('a') as log:
                    log.write(json.dumps(dict(t=round(time.monotonic(), 4), frame_id=item['frame_id'], width=item['width'],
                                              generations=[item['target']['document_generation'], item['target']['navigation_generation']],
                                              crc=zlib.crc32(pixels))) + '\n')
                if self.frame_damage:
                    self.check_damage(item, pixels)
                self.last = (item, bytes(pixels))
                self.command('frame_ack', target=item['target'], frame_id=item['frame_id'])
                if capture:
                    png(capture, item['width'], item['height'], pixels)
            if predicate(kind, item):
                return item

    def frame_after(self, count, predicate=lambda item: True, capture=None, **kwargs):
        """A frame delivered after the first `count` frames. Events are written before frames,
        but a frame flushed earlier can precede a later title event, so it may already be here."""
        if self.frames > count and predicate(self.last[0]):
            item, pixels = self.last
            if capture:
                png(capture, item['width'], item['height'], pixels)
            return item
        return self.until(lambda kind, item: kind == 2 and predicate(item), capture=capture, **kwargs)

    def current_frame(self, count, **kwargs):
        """A frame of the current target generation (after navigation, back or forward)."""
        return self.frame_after(count, lambda item: item['target'] == self.target, **kwargs)

    def check_damage(self, item, pixels):
        rects = item['damage']
        assert isinstance(rects, list) and len(rects) == 1, rects
        x, y, w, h = rects[0]
        assert 0 <= x and 0 <= y and w >= 1 and h >= 1 and x + w <= item['width'] and y + h <= item['height'], rects
        self.damage_area.append(round(w * h / (item['width'] * item['height']), 4))
        if self.last and self.last[0]['width'] == item['width'] and self.last[0]['height'] == item['height'] \
                and self.last[0]['target'] == item['target']:
            self.damage_checked += 1
            if not outside_damage_equal(self.last[1], pixels, item['width'], item['height'], (x, y, w, h)):
                self.damage_violations += 1

    def title(self, text, **kwargs):
        return self.until(lambda kind, item: item.get('event') == 'title' and text in item.get('title', ''), **kwargs)

    def completed(self, request_id, **kwargs):
        for item in self.events:
            if item.get('event') == 'completed' and item.get('request_id') == request_id:
                return item
        return self.until(lambda kind, item: item.get('event') == 'completed' and item.get('request_id') == request_id, **kwargs)

    def close(self):
        with contextlib.suppress(OSError):
            self.process.stdin.close()
        try:
            with contextlib.suppress(subprocess.TimeoutExpired):
                self.process.wait(timeout=20)
        finally:
            self.exit_code = self.process.poll()
            self.cleanup_error = None
            try:
                self.group_cleanup_required = probe.cleanup_group(self.process)
            except OSError as error:
                self.group_cleanup_required = None
                self.cleanup_error = type(error).__name__ + ': ' + str(error)
            # No WebKit helper may outlive the host (we are a subreaper on Linux).
            deadline = time.monotonic() + 5
            self.orphans = probe.orphans(str(self.profile))
            while self.orphans and time.monotonic() < deadline:
                time.sleep(.1)
                self.orphans = probe.orphans(str(self.profile))
            self.process.stdout.close()
            self.error.close()
            (self.directory / 'events.json').write_text(json.dumps(self.events, indent=2) + '\n')
            self.profile_removed = False
            if self.cleanup_error is None and not self.orphans:
                self.profile_removed = probe.remove_profile(self.profile, self.process, 'webkit-profile-')


def check_heartbeat(session, ready):
    """Liveness: ~1 s UI-thread heartbeats that stop while the host process is frozen."""
    assert ready['capabilities'].get('heartbeat_interval_ms') == 1000, ready['capabilities']
    beats = []
    def collect(kind, item):
        if kind == 1 and item.get('event') == 'heartbeat':
            assert set(item) == {'version', 'event', 'sequence'}, item
            beats.append((time.monotonic(), item['sequence']))
        return len(beats) >= 4
    session.until(collect, seconds=8)
    sequences = [sequence for _, sequence in beats]
    assert sequences == sorted(set(sequences)) and sequences[0] >= 1, sequences
    gaps = [later[0] - earlier[0] for earlier, later in zip(beats, beats[1:])]
    assert all(0.5 <= gap <= 2.0 for gap in gaps), gaps
    os.kill(session.process.pid, signal.SIGSTOP)
    try:
        time.sleep(3.5)
        buffered = 0
        while select.select([session.process.stdout], [], [], 0)[0]:
            kind, item, _ = read_packet(session.process.stdout, time.monotonic() + 2, session.frame_damage)
            if kind == 1:
                session.events.append(item)
                buffered += item.get('event') == 'heartbeat'
            else:
                session.command('frame_ack', target=item['target'], frame_id=item['frame_id'])
        assert buffered <= 1, f'{buffered} heartbeats from a SIGSTOPped host'
    finally:
        os.kill(session.process.pid, signal.SIGCONT)
    last = max(item['sequence'] for item in session.events if item.get('event') == 'heartbeat')
    resumed = session.until(lambda kind, item: kind == 1 and item.get('event') == 'heartbeat' and item['sequence'] > last, seconds=5)
    return dict(heartbeat_gaps=[round(gap, 3) for gap in gaps], heartbeats_while_stopped=buffered, resumed_sequence=resumed['sequence'])


def expect_ready(ready, engine, port='wpe'):
    caps = ready['capabilities']
    assert ready['engine'] == engine and ready['engine_instance'], ready
    assert caps['fixture_only'] is True and caps['surface'] is False and caps['devtools'] is False, caps
    assert caps['popups'] is False and caps['downloads'] is False and caps['permissions'] is False, caps
    assert caps['ime_commit'] is True and caps['key_verdict'] is False and caps['private_mode'] is False, caps
    if engine == 'webkit' and port == 'wkwebview':
        # macOS scaffold: system WebKit, snapshot frames; never product evidence.
        assert ready['webkit_port'] == 'wkwebview' and ready['render_path'] == 'wkwebview-snapshot-bgra', ready
        assert ready['scaffold'] is True and ready['sandbox'] == 'macos-webkit-xpc', ready
    elif engine == 'webkit':
        pinned = probe.lock()
        assert ready['webkit_port'] == 'wpe' and ready['render_path'] == 'wpe-fdo-shm-bgra', ready
        assert ready['webkit'] == probe.expected_webkit() and ready['runtime_webkit'] == probe.expected_webkit(), ready
        assert ready['libwpe'] == pinned['libwpe']['version'] and ready['wpebackend_fdo'] == pinned['wpebackend_fdo']['version'], ready
        assert ready['sandbox_configured'] is True and ready['sandbox'] == 'bubblewrap', ready


def generations(target):
    return target['document_generation'], target['navigation_generation']


def scenario(session, origin, directory, engine, port='wpe'):
    timings = {}
    ready = session.until(lambda kind, item: item.get('event') == 'ready')
    timings['ready_s'] = round(time.monotonic() - session.started, 3)
    expect_ready(ready, engine, port)
    pending = dict(tab_id='fixture-tab', engine_instance=session.instance, identity=origin,
                   document_generation=1, navigation_generation=1, private_mode=False)
    start = time.monotonic()
    session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
    created = session.until(lambda kind, item: item.get('event') == 'created')
    assert created['target']['engine'] == engine and created['target']['native_target_id'], created
    initial = session.until(lambda kind, item: kind == 2, capture=directory / 'initial.png')
    timings['create_to_first_frame_s'] = round(time.monotonic() - start, 3)
    assert initial['width'] == 1800 and initial['height'] == 1300 and initial['device_scale'] == 2, initial
    initial_pixels = session.last[1]
    sandbox = probe.sandbox_observation(session.process.pid)
    if engine == 'webkit' and port == 'wpe':
        # The web process must actually run inside bubblewrap, not merely be configured to.
        assert sandbox['web_process'] and sandbox['bwrap_processes'] >= 1, sandbox
    # Typed input reaches the page through the text commit path and is visible in title and pixels.
    focus = session.command('focus', focused=True)
    session.completed(focus)
    count = session.frames
    session.command('key', type='char', native_key_code=0, windows_key_code=0, modifiers=0, text='WPE')
    session.title('input=WPE |')
    real = engine == 'webkit' and port == 'wpe'  # region checks are calibrated on WPE frames
    # The frame must show the typed text inside the field, not merely differ somewhere.
    typed = session.frame_after(count, lambda item: region(session.last[1], 1800, INPUT_TEXT_2X) != region(initial_pixels, 1800, INPUT_TEXT_2X)
                                if real else session.last[1] != initial_pixels, capture=directory / 'input.png', seconds=5)
    assert session.last[1] != initial_pixels, 'typed text changed no pixel'
    # CEF-style down/char/up inserts the character once.
    for key_type in ('down', 'char', 'up'):
        session.command('key', type=key_type, native_key_code=0, windows_key_code=75, modifiers=0, text='K')
    session.title('input=WPEK |')
    session.command('ime_commit_text', text='é')
    session.title('input=WPEKé |')
    stale = dict(session.target)
    # Resize and device scale: 2x, then 1x, each delivered at exact physical size.
    session.command('resize', width=1000, height=700, device_scale=2)
    session.until(lambda kind, item: kind == 2 and item['width'] == 2000 and item['height'] == 1400, capture=directory / 'resize-2x.png')
    session.command('resize', width=800, height=600, device_scale=1)
    one = session.until(lambda kind, item: kind == 2 and item['width'] == 800 and item['height'] == 600, capture=directory / 'resize-1x.png')
    assert one['device_scale'] == 1
    session.command('resize', width=900, height=650, device_scale=2)
    session.until(lambda kind, item: kind == 2 and item['width'] == 1800)
    for key_type in ('down', 'up'):
        tab = session.command('key', type=key_type, native_key_code=23, windows_key_code=9, modifiers=0, text='')
        session.completed(tab)
    # GET navigation: exactly one generation step, then the new document's frame.
    before = generations(session.target)
    start = time.monotonic()
    count = session.frames
    nav = session.command('navigate', url=origin + '/engine.html?page=2')
    session.title('page=2')
    page2 = session.current_frame(count, capture=directory / 'page-2.png')
    if real:
        # A fresh document: its field is empty again. Old-document pixels never carry the new generation.
        assert page2['width'] == 1800 and region(session.last[1], 1800, STATUS_TAIL_2X) == region(initial_pixels, 1800, STATUS_TAIL_2X), \
            'page-2 frame shows the previous document'
    timings['navigate_to_frame_s'] = round(time.monotonic() - start, 3)
    assert session.completed(nav)['status'] == 'success'
    assert generations(session.target) == (before[0] + 1, before[1] + 1), (before, session.target)
    stale_request = session.command('focus', target=stale, focused=True)
    session.until(lambda kind, item: item.get('request_id') == stale_request and item.get('code') == 'stale_target')
    # Back: exactly one generation step and an explicit history restore label.
    before_back = dict(session.target)
    start = time.monotonic()
    count = session.frames
    back = session.command('back')
    session.title('page=1')
    session.current_frame(count, capture=directory / 'back.png')
    assert session.completed(back)['status'] == 'success'
    timings['back_to_frame_s'] = round(time.monotonic() - start, 3)
    assert generations(session.target) == (before_back['document_generation'] + 1, before_back['navigation_generation'] + 1)
    back_load = [e for e in session.events if e.get('event') == 'load' and e.get('target', {}).get('document_generation') == session.target['document_generation']]
    assert back_load and back_load[-1]['restored_from_history'] is True and back_load[-1]['http_status'] in (0, 200), back_load
    if real:
        # Restored from WebKit's back/forward cache, not re-fetched: the status line keeps the typed
        # text (WebKit clears the autocomplete=off field itself on restore, as Safari does).
        assert region(session.last[1], 1800, STATUS_TAIL_2X) != region(initial_pixels, 1800, STATUS_TAIL_2X), 'back frame lost page-1 state'
        pages = [r['path'] for r in [json.loads(line) for line in Path(session.directory / 'fixture-requests.jsonl').read_text().splitlines()]]
        assert pages == ['/engine.html', '/engine.html?page=2'], pages
    back_stale = session.command('focus', target=before_back, focused=True)
    session.until(lambda kind, item: item.get('request_id') == back_stale and item.get('code') == 'stale_target')
    before_forward = generations(session.target)
    count = session.frames
    forward = session.command('forward')
    session.title('page=2')
    session.current_frame(count)
    assert generations(session.target) == (before_forward[0] + 1, before_forward[1] + 1)
    boundary = session.command('forward')
    session.until(lambda kind, item: item.get('request_id') == boundary and item.get('reason') == 'history_boundary')
    heartbeat = check_heartbeat(session, ready)
    close_id = session.command('close')
    session.until(lambda kind, item: item.get('event') == 'closed')
    session.completed(close_id)
    session.process.wait(timeout=20)
    assert session.process.returncode == 0, session.process.returncode
    del typed, forward
    return dict(ready={k: ready[k] for k in ready if k not in ('capabilities', 'event', 'version')},
                capabilities=ready['capabilities'], frames=session.frames, timings=timings, heartbeat=heartbeat,
                sandbox=sandbox, native_pid=session.process.pid, native_exit_code=session.process.returncode,
                tests=['real_frame_1800x1300_at_2x', 'typed_text_in_title_and_pixels', 'down_char_up_inserts_once',
                       'ime_commit_text', 'resize_2x', 'resize_1x', 'tab_key', 'GET_navigation_exact_generation',
                       'stale_target_rejected', 'back_exact_generation_restored_from_history', 'stale_after_back',
                       'forward_exact_generation', 'history_boundary', 'heartbeat_cadence_and_frozen_host',
                       'close_completed_exit_0'])


def damage_scenario(binary, origin, directory, engine):
    """Negotiated frame_damage: every pixel outside the reported rectangle is unchanged."""
    session = Session(binary, origin, directory, frame_damage=True)
    try:
        session.until(lambda kind, item: item.get('event') == 'ready')
        pending = dict(tab_id='damage-tab', engine_instance=session.instance, identity=origin,
                       document_generation=1, navigation_generation=1, private_mode=False)
        session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=1)
        session.until(lambda kind, item: kind == 2)
        session.command('focus', focused=True)
        count = session.frames
        for character in 'damage':
            session.command('key', type='char', native_key_code=0, windows_key_code=0, modifiers=0, text=character)
        session.title('input=damage |')
        session.frame_after(count, seconds=10)
        session.command('close')
        session.until(lambda kind, item: item.get('event') == 'closed')
        session.process.wait(timeout=20)
        assert session.damage_checked >= 1 and session.damage_violations == 0, (session.damage_checked, session.damage_violations)
        return dict(status='PASS', frames=session.frames, damage_checked=session.damage_checked,
                    damage_violations=session.damage_violations, damage_area_fraction=session.damage_area)
    finally:
        session.close()
        assert not session.orphans, session.orphans


def run(binary=None, engine='webkit', port='wpe'):
    binary = Path(binary or probe.BINARY)
    if engine == 'webkit' and port == 'wpe':
        probe.check()
    subreaper = probe.become_subreaper()
    directory = probe.new_evidence(('webkit-' + port if engine == 'webkit' else 'core-fake') + '-stream-')
    result = {'status': 'FAIL', 'engine': engine, 'port': port if engine == 'webkit' else None, 'E1': 'NOT_TESTED',
              'E2': 'NOT_TESTED', 'started_at': time.time(), 'platform': platform.platform(), 'test_subreaper': subreaper}
    if engine != 'webkit':
        result['label'] = 'TEST-ONLY scripted engine; proves the core and harness, never WebKit'
    session = None
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        with probe.fixture_server(directory) as (server, origin):
            session = Session(binary, origin, directory)
            result.update(scenario(session, origin, directory, engine, port))
            session.close()
            result.update(profile_removed=session.profile_removed, orphans=session.orphans,
                          group_cleanup_required=session.group_cleanup_required)
            assert not session.orphans, session.orphans
            assert session.profile_removed, 'profile not removed'
            session = None
            damage_dir = directory / 'damage'
            damage_dir.mkdir()
            result['damage'] = damage_scenario(binary, origin, damage_dir, engine)
            result['fixture_requests'] = [json.loads(line) for line in server.request_log.read_text().splitlines()]
            assert all(r['method'] == 'GET' and r['status'] == 200 for r in result['fixture_requests']), result['fixture_requests']
            assert engine != 'webkit' or result['fixture_requests'], 'WebKit fetched no fixture page'
        result['status'] = 'PASS'
    except (Exception, KeyboardInterrupt) as exc:
        result['error'] = type(exc).__name__ + ': ' + str(exc)
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
            result.update(profile_removed=session.profile_removed, orphans=session.orphans)
        signal.signal(signal.SIGTERM, previous_term)
        result['finished_at'] = time.time()
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(dict(result, evidence=str(directory))), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
