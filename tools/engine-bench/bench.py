#!/usr/bin/env python3
"""Component benchmark for out-of-process engine hosts (engine-stream-v1 / cef-v1 AXCF pipe).

Drives one host directly over its authenticated stdin/stdout stream, exactly as Zen's
adapter does (hello, create, navigate, resize, key, wheel, frame_ack, close), against
local loopback fixtures (tools/engine-bench/fixtures) and measures:

  spawn -> ready, create -> first frame, navigation -> first painted frame,
  key and wheel input -> first changed frame, sustained frame rate and frame-interval
  jitter (rAF and scroll fixtures, 1x and 2x), bytes per frame and pipe MB/s, damage
  (host-reported with hello.frame_damage, and a client-side changed-row band), idle
  frames, CPU% and RSS/PSS of the host and every engine helper process, teardown time.

Every repetition spawns a fresh host. Results: one JSON file (all samples + summary
with median/p95) and lossless PNGs of real 1x frames. This measures a component; it is
never Zen E1/E2 evidence, and it never changes a host: it only speaks the public pipe
protocol. The client acknowledges every frame immediately after reading it, so the
numbers are an upper bound of what a presenter that also converts and paints can get.

usage:
  bench.py --engine webkit [--webkit-root DIR] [--binary PATH] --out DIR [--reps 5]
  bench.py --engine chromium --cef-root DIR --out DIR [--reps 5]
  bench.py --engine fake --binary .local/build/webkit/unit/fake_host --out DIR   # harness self-test only
"""
import argparse
import contextlib
import ctypes
import fcntl
import http.server
import importlib.util
import json
import math
import os
from pathlib import Path
import platform
import resource
import secrets
import select
import shutil
import signal
import statistics
import struct
import subprocess
import sys
import tempfile
import threading
import time
import zlib

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
FIXTURES = HERE / 'fixtures'
F_SETPIPE_SZ, F_GETPIPE_SZ = 1031, 1032
CLK_TCK = os.sysconf('SC_CLK_TCK')
PAGE_KB = os.sysconf('SC_PAGE_SIZE') // 1024
VIEW_W, VIEW_H = 900, 650  # logical CSS px of the content area (same as the host tests)


def log(*parts):
    print('[bench]', *parts, file=sys.stderr, flush=True)


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


# ---- Engines ---------------------------------------------------------------------------
class Engine:
    """How to start one host. The bench never passes anything the product adapter wouldn't."""
    name = 'base'
    label = None

    def __init__(self, args):
        self.args = args

    def binary(self):
        raise NotImplementedError

    def profile_parent(self):
        root = Path(os.environ.get('AXIOSOZO_BUILD_ROOT', str(ROOT / '.local/build'))) / 'engine-bench'
        root.mkdir(parents=True, exist_ok=True)
        return root

    def environment(self, profile):
        raise NotImplementedError

    def check(self):
        pass


class WebKitEngine(Engine):
    name = 'webkit'

    def __init__(self, args):
        super().__init__(args)
        root = Path(args.webkit_root or ROOT)
        self.probe = load_module('webkit_probe', root / 'native/webkit-host/probe.py')

    def binary(self):
        return Path(self.args.binary) if self.args.binary else self.probe.BINARY

    def check(self):
        if not self.args.binary:
            self.probe.check()  # pins, build fingerprint, bubblewrap user namespaces (never disables the sandbox)

    def environment(self, profile):
        # Same minimal environment as native/webkit-host/stream_test.py (without the trace flag).
        (profile / 'tmp').mkdir(mode=0o700, exist_ok=True)
        return {'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'HOME': str(profile), 'LANG': 'C.UTF-8',
                'TMPDIR': str(profile / 'tmp')}


class FakeEngine(WebKitEngine):
    """TEST-ONLY scripted engine (native/webkit-host/tests/fake_host.cc): validates this harness, never a result."""
    name = 'fake'
    label = 'TEST-ONLY scripted engine; validates the bench harness, never engine evidence'

    def check(self):
        if not self.args.binary:
            raise RuntimeError('FAIL: --engine fake needs --binary <fake_host>')


class ChromiumEngine(Engine):
    name = 'chromium'

    def __init__(self, args):
        super().__init__(args)
        if not args.cef_root:
            raise RuntimeError('FAIL: --engine chromium needs --cef-root (a checkout with the Linux CEF host)')
        self.probe = load_module('cef_probe', Path(args.cef_root) / 'native/chromium-host/probe.py')

    def binary(self):
        return Path(self.args.binary) if self.args.binary else self.probe.BINARY

    def check(self):
        if not self.args.binary:
            self.probe.check()

    def environment(self, profile):
        return self.probe.host_environment(profile)  # PATH, TMPDIR, HOME=profile, DISPLAY/XAUTHORITY


ENGINES = {'webkit': WebKitEngine, 'chromium': ChromiumEngine, 'fake': FakeEngine}


# ---- Fixture server ----------------------------------------------------------------------
class FixtureServer:
    """Loopback only; serves the scenario page currently assigned to each allowed path."""
    PATHS = ('/engine.html', '/engine.html?page=2')

    def __init__(self):
        pages = {}
        self.pages = pages
        self.requests = []
        requests = self.requests

        class Handler(http.server.BaseHTTPRequestHandler):
            def log_message(self, *_):
                pass

            def do_GET(self):
                host_ok = self.headers.get_all('Host', []) == [f'127.0.0.1:{self.server.server_port}']
                body = pages.get(self.path) if host_ok else None
                requests.append(dict(t=time.monotonic(), path=self.path if self.path in FixtureServer.PATHS else 'OTHER',
                                     status=200 if body else 404))
                if body is None:
                    self.send_error(404)
                    return
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.end_headers()
                self.wfile.write(body)

            def denied(self):
                self.send_error(405)

            do_HEAD = do_POST = do_PUT = do_DELETE = do_OPTIONS = denied

        self.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.origin = f'http://127.0.0.1:{self.server.server_port}'
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def assign(self, path, fixture):
        self.pages[path] = (FIXTURES / (fixture + '.html')).read_bytes()

    def close(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=3)


# ---- Processes ---------------------------------------------------------------------------
def proc_table():
    table = {}
    for entry in os.listdir('/proc'):
        if not entry.isdigit():
            continue
        try:
            stat = Path(f'/proc/{entry}/stat').read_text()
        except OSError:
            continue
        rest = stat[stat.rindex(')') + 2:].split()
        if rest[0] in ('Z', 'X'):
            continue
        table[int(entry)] = dict(ppid=int(rest[1]), comm=stat[stat.index('(') + 1:stat.rindex(')')],
                                 ticks=int(rest[11]) + int(rest[12]), rss_kb=int(rest[21]) * PAGE_KB)
    return table


def tree(root, table):
    found, frontier = [root] if root in table else [], [root]
    while frontier:
        parent = frontier.pop()
        for pid, row in table.items():
            if row['ppid'] == parent and pid not in found:
                found.append(pid)
                frontier.append(pid)
    return found


def process_kind(pid, comm):
    try:
        cmd = Path(f'/proc/{pid}/cmdline').read_bytes().replace(b'\0', b' ').decode(errors='replace')
    except OSError:
        cmd = ''
    marker = ' --type='
    if marker in ' ' + cmd:
        return 'cef:' + (' ' + cmd).split(marker, 1)[1].split(' ', 1)[0]
    return comm


def pss_kb(pid):
    try:
        for line in Path(f'/proc/{pid}/smaps_rollup').read_text().splitlines():
            if line.startswith('Pss:'):
                return int(line.split()[1])
    except (OSError, ValueError, IndexError):
        return None
    return None


class Usage:
    """CPU ticks and memory of the host process tree (host + every engine helper)."""

    def __init__(self, root):
        self.root = root
        self.seen = {}  # pid -> (kind, last ticks) so helpers that exit keep their CPU time

    def snapshot(self, memory=False):
        table = proc_table()
        pids = tree(self.root, table)
        processes = []
        for pid in pids:
            row = table[pid]
            kind = self.seen.get(pid, (None,))[0] or process_kind(pid, row['comm'])
            self.seen[pid] = (kind, row['ticks'])
            item = dict(pid=pid, kind=kind, ticks=row['ticks'], rss_kb=row['rss_kb'])
            if memory:
                item['pss_kb'] = pss_kb(pid)
            processes.append(item)
        return dict(t=time.monotonic(), processes=processes, ticks={pid: ticks for pid, (_, ticks) in self.seen.items()},
                    client=resource.getrusage(resource.RUSAGE_SELF))

    @staticmethod
    def window(start, end):
        seconds = max(1e-6, end['t'] - start['t'])
        by_kind = {}
        kinds = {p['pid']: p['kind'] for p in end['processes']}
        total = 0
        for pid, ticks in end['ticks'].items():
            delta = ticks - start['ticks'].get(pid, 0)  # helpers born in the window count from zero
            total += delta
            kind = kinds.get(pid, 'exited')
            by_kind[kind] = by_kind.get(kind, 0) + delta
        client = (end['client'].ru_utime + end['client'].ru_stime) - (start['client'].ru_utime + start['client'].ru_stime)
        pss = [p.get('pss_kb') for p in end['processes']]
        return dict(cpu_percent=round(100 * total / CLK_TCK / seconds, 1),
                    cpu_percent_by_kind={k: round(100 * v / CLK_TCK / seconds, 1) for k, v in sorted(by_kind.items())},
                    client_cpu_percent=round(100 * client / seconds, 1),
                    processes=len(end['processes']),
                    rss_mb=round(sum(p['rss_kb'] for p in end['processes']) / 1024, 1),
                    pss_mb=round(sum(pss) / 1024, 1) if pss and all(v is not None for v in pss) else None,
                    rss_mb_by_kind={k: round(sum(p['rss_kb'] for p in end['processes'] if p['kind'] == k) / 1024, 1)
                                    for k in sorted({p['kind'] for p in end['processes']})})


def become_subreaper():
    if platform.system() != 'Linux':
        return False
    return ctypes.CDLL(None, use_errno=True).prctl(36, 1, 0, 0, 0) == 0  # PR_SET_CHILD_SUBREAPER


# ---- Pixels -------------------------------------------------------------------------------
def png(path, width, height, bgra):
    rgba = bytearray(bgra)
    rgba[0::4], rgba[2::4] = bgra[2::4], bgra[0::4]
    def chunk(name, data):
        return struct.pack('>I', len(data)) + name + data + struct.pack('>I', zlib.crc32(name + data))
    rows = b''.join(b'\0' + rgba[y * width * 4:(y + 1) * width * 4] for y in range(height))
    path.write_bytes(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
                     + chunk(b'IDAT', zlib.compress(rows, 6)) + chunk(b'IEND', b''))


def painted(bgra):
    """Not one flat colour (a document's first, not yet painted frame is flat)."""
    step = 4 * 211
    return len({bytes(bgra[i:i + 4]) for i in range(0, len(bgra) - 3, step)}) > 1


def changed_rows(previous, current, width, height):
    """(first, last) changed row between two same-size frames, or None if identical."""
    if previous == current:
        return None
    row = width * 4
    top = 0
    while top < height and previous[top * row:(top + 1) * row] == current[top * row:(top + 1) * row]:
        top += 1
    bottom = height - 1
    while bottom > top and previous[bottom * row:(bottom + 1) * row] == current[bottom * row:(bottom + 1) * row]:
        bottom -= 1
    return top, bottom


# ---- Session ---------------------------------------------------------------------------------
class ProtocolError(RuntimeError):
    pass


class Session:
    def __init__(self, engine, origin, directory, frame_damage=False, damage_payload=False):
        self.engine, self.origin, self.directory = engine, origin, directory
        self.profile = Path(tempfile.mkdtemp(prefix=engine.name + '-bench-profile-', dir=engine.profile_parent()))
        os.chmod(self.profile, 0o700)
        self.stderr = (directory / f'stderr-{engine.name}.log').open('ab')
        self.frame_damage = frame_damage
        # hello.damage_payload (engine-stream-v1 §6.2): payloads are the damage rectangle's rows,
        # patched into one whole frame per size here (as Zen's DamagePayloadAssembler does).
        self.damage_payload = damage_payload and frame_damage
        self.whole = {}
        self.t_spawn = time.monotonic()
        self.process = subprocess.Popen([str(engine.binary()), '--stream', str(self.profile), str(directory)],
                                        stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=self.stderr,
                                        start_new_session=True, bufsize=0, env=engine.environment(self.profile))
        self.out = self.process.stdout
        self.fd = self.out.fileno()
        self.token = secrets.token_hex(32)
        self.instance = 'bench-' + secrets.token_hex(8)
        self.counter = 0
        self.target = None
        self.events = []
        self.event_bytes = 0
        self.frames = []          # every frame record of this session
        self.recorder = None      # list collecting frame records of the current measurement window
        self.buffers = {}
        self.current = None       # bytearray of the newest frame
        self.previous = None
        self.meta = None
        self.band = False         # compute the changed-row band per frame (sustained windows only)
        self.usage = Usage(self.process.pid)
        hello = dict(version=1, method='hello', token=self.token, engine_instance=self.instance, fixture_origin=origin)
        if frame_damage:
            hello['frame_damage'] = True
        if self.damage_payload:
            hello['damage_payload'] = True
        self.write(hello)

    # -- output
    def write(self, item):
        data = (json.dumps(item, separators=(',', ':')) + '\n').encode()
        if len(data) > 16384:
            raise ValueError('request exceeds the 16 KiB line bound')
        self.process.stdin.write(data)

    def command(self, method, target=None, **fields):
        self.counter += 1
        request_id = 'bench-' + str(self.counter)
        item = dict(version=1, method=method, request_id=request_id, token=self.token, **fields)
        if method != 'shutdown':
            item['target'] = self.target if target is None else target
        self.write(item)
        return request_id

    # -- input
    def read_into(self, view, deadline):
        got = 0
        while got < len(view):
            left = deadline - time.monotonic()
            if left <= 0 or not select.select([self.fd], [], [], left)[0]:
                raise TimeoutError('AXCF read deadline')
            n = self.out.readinto(view[got:])
            if not n:
                raise EOFError('host closed its AXCF stream (exit %s)' % self.process.poll())
            got += n

    def packet(self, deadline):
        header = bytearray(16)
        self.read_into(memoryview(header), deadline)
        t_header = time.monotonic()
        magic, version, kind, meta_size, size = struct.unpack('>4sHHII', header)
        if magic != b'AXCF' or version != 1 or kind not in (1, 2) or not 1 <= meta_size <= 8192 or size > 33554432:
            raise ProtocolError('invalid AXCF header')
        raw = bytearray(meta_size)
        self.read_into(memoryview(raw), deadline)
        meta = json.loads(raw)
        if kind == 1:
            if size:
                raise ProtocolError('event with payload')
            self.event_bytes += 16 + meta_size
            return kind, meta, t_header
        whole_size = meta['width'] * meta['height'] * 4
        expected = meta['damage'][0][2] * meta['damage'][0][3] * 4 if self.damage_payload else whole_size
        if size != expected or meta['stride'] != meta['width'] * 4 or meta['format'] != 'BGRA8':
            raise ProtocolError('invalid frame geometry')
        if self.damage_payload:
            return self.payload_packet(meta, size, meta_size, whole_size, t_header, deadline)
        # Two rotating buffers per size: no allocation per frame, previous frame kept for diffs.
        pair = self.buffers.setdefault(size, [bytearray(size), bytearray(size)])
        buffer = pair[0] if self.current is not pair[0] else pair[1]
        self.read_into(memoryview(buffer), deadline)
        t_done = time.monotonic()
        self.command('frame_ack', target=meta['target'], frame_id=meta['frame_id'])  # credit back at once
        previous, previous_meta = self.current, self.meta
        self.previous, self.current, self.meta = previous, buffer, meta
        record = dict(t=t_done, read_ms=round((t_done - t_header) * 1000, 3), id=meta['frame_id'], w=meta['width'],
                      h=meta['height'], scale=meta['device_scale'], bytes=size + 16 + meta_size,
                      gen=meta['target']['document_generation'])
        if 'damage' in meta:
            x, y, w, h = meta['damage'][0]
            record['damage'] = round(w * h / (meta['width'] * meta['height']), 4)
        if self.band and previous is not None and previous_meta and len(previous) == size \
                and previous_meta['target'] == meta['target']:
            rows = changed_rows(previous, buffer, meta['width'], meta['height'])
            record['band'] = 0.0 if rows is None else round((rows[1] - rows[0] + 1) / meta['height'], 4)
        self.frames.append(record)
        if self.recorder is not None:
            self.recorder.append(record)
        return kind, meta, t_done

    def payload_packet(self, meta, size, meta_size, whole_size, t_header, deadline):
        payload = self.buffers.setdefault(('payload', size), bytearray(size))
        self.read_into(memoryview(payload), deadline)
        t_done = time.monotonic()
        self.command('frame_ack', target=meta['target'], frame_id=meta['frame_id'])  # credit back at once
        x, y, w, h = meta['damage'][0]
        key = (meta['target']['native_target_id'], meta['width'], meta['height'])
        if (x, y, w, h) == (0, 0, meta['width'], meta['height']):
            self.whole[key] = bytearray(payload)
        else:
            frame = self.whole.get(key)
            if frame is None:
                raise ProtocolError('partial damage payload without a whole frame of its size')
            row = w * 4
            for line in range(h):
                start = ((y + line) * meta['width'] + x) * 4
                frame[start:start + row] = payload[line * row:(line + 1) * row]
        self.previous, self.current, self.meta = None, self.whole[key], meta
        record = dict(t=t_done, read_ms=round((t_done - t_header) * 1000, 3), id=meta['frame_id'], w=meta['width'],
                      h=meta['height'], scale=meta['device_scale'], bytes=size + 16 + meta_size,
                      gen=meta['target']['document_generation'],
                      damage=round(w * h / (meta['width'] * meta['height']), 4))
        self.frames.append(record)
        if self.recorder is not None:
            self.recorder.append(record)
        return 2, meta, t_done

    def handle_event(self, item):
        item = dict(item, _t=time.monotonic())
        self.events.append(item)
        target = item.get('target')
        if target and (self.target is None or target.get('tab_id') == self.target.get('tab_id')):
            self.target = target
        if item.get('event') == 'error' and item.get('code') not in ('stale_target',):
            log('host error event', json.dumps(item)[:300])
        return item

    def until(self, predicate, seconds, schedule=None):
        """Pump packets until predicate(kind, meta, t) is true. `schedule` is an optional
        (next_due_fn, fire_fn) pair for commands sent on a timetable while reading."""
        deadline = time.monotonic() + seconds
        while True:
            now = time.monotonic()
            if schedule:
                due = schedule[0]()
                if due is not None and now >= due:
                    schedule[1]()
                    continue
                wait = min(deadline, due if due is not None else deadline) - now
            else:
                wait = deadline - now
            if now >= deadline:
                raise TimeoutError('bench wait deadline (%.1f s)' % seconds)
            if not select.select([self.fd], [], [], max(0.0, wait))[0]:
                continue
            kind, meta, t = self.packet(time.monotonic() + 30)
            if kind == 1:
                meta = self.handle_event(meta)
            if predicate(kind, meta, t):
                return kind, meta, t

    def run_for(self, seconds, schedule=None):
        end = time.monotonic() + seconds
        with contextlib.suppress(TimeoutError):
            self.until(lambda *_: time.monotonic() >= end, seconds + 0.001, schedule)

    def completed(self, request_id, seconds=30):
        for item in self.events:
            if item.get('event') == 'completed' and item.get('request_id') == request_id:
                return item
        return self.until(lambda kind, meta, t: kind == 1 and meta.get('event') == 'completed'
                          and meta.get('request_id') == request_id, seconds)[1]

    def pipe_size(self, size=None):
        if size:
            fcntl.fcntl(self.fd, F_SETPIPE_SZ, size)
        return fcntl.fcntl(self.fd, F_GETPIPE_SZ)

    def teardown(self):
        """close -> closed event -> host exit -> no helper process left."""
        result = {}
        t0 = time.monotonic()
        try:
            close = self.command('close')
            self.until(lambda kind, meta, t: kind == 1 and meta.get('event') == 'closed', 20)
            result['close_to_closed_ms'] = round((time.monotonic() - t0) * 1000, 1)
            with contextlib.suppress(TimeoutError, EOFError):
                self.completed(close, 5)
        except (TimeoutError, EOFError, ProtocolError) as error:
            result['close_error'] = type(error).__name__ + ': ' + str(error)
        with contextlib.suppress(OSError):
            self.process.stdin.close()
        try:
            self.process.wait(timeout=20)
        except subprocess.TimeoutExpired:
            result['host_exit_timeout'] = True
        result['close_to_exit_ms'] = round((time.monotonic() - t0) * 1000, 1)
        result['exit_code'] = self.process.poll()
        # Orphaned helpers re-parent to this subreaper; wait until none is left.
        deadline, left = time.monotonic() + 10, []
        while time.monotonic() < deadline:
            left = [pid for pid, row in proc_table().items() if row['ppid'] == os.getpid() and pid != os.getpid()]
            if not left:
                break
            time.sleep(0.02)
        result['close_to_no_helpers_ms'] = round((time.monotonic() - t0) * 1000, 1)
        result['helpers_left'] = len(left)
        return result

    def kill(self):
        with contextlib.suppress(Exception):
            self.process.stdin.close()
        with contextlib.suppress(Exception):
            if self.process.poll() is None:
                os.killpg(self.process.pid, signal.SIGTERM)
                self.process.wait(timeout=5)
        with contextlib.suppress(Exception):
            if self.process.poll() is None:
                os.killpg(self.process.pid, signal.SIGKILL)
                self.process.wait(timeout=5)
        with contextlib.suppress(Exception):
            self.out.close()
        self.stderr.close()
        shutil.rmtree(self.profile, ignore_errors=True)


# ---- Statistics -------------------------------------------------------------------------------
def pct(values, q):
    """Nearest-rank percentile (q in 0..100); with 5 values p95 is the maximum."""
    values = sorted(v for v in values if v is not None)
    if not values:
        return None
    rank = max(1, math.ceil(q / 100 * len(values)))
    return values[rank - 1]


def describe(values):
    values = [v for v in values if v is not None]
    if not values:
        return dict(n=0)
    return dict(n=len(values), median=round(statistics.median(values), 3), p95=round(pct(values, 95), 3),
                min=round(min(values), 3), max=round(max(values), 3),
                mean=round(statistics.fmean(values), 3), stdev=round(statistics.pstdev(values), 3))


def frame_window_stats(records, seconds, target_hz=60):
    frames = len(records)
    out = dict(frames=frames, window_s=round(seconds, 3), fps=round(frames / seconds, 2) if seconds else None)
    if frames >= 2:
        intervals = [(b['t'] - a['t']) * 1000 for a, b in zip(records, records[1:])]
        budget = 1000 / target_hz
        out.update(interval_ms=describe(intervals), interval_p99_ms=round(pct(intervals, 99), 3),
                   long_intervals_share=round(sum(1 for i in intervals if i > 1.5 * budget) / len(intervals), 4))
    if frames:
        total = sum(r['bytes'] for r in records)
        out.update(bytes_per_frame=round(total / frames), pipe_mb_s=round(total / seconds / 1e6, 2) if seconds else None,
                   read_ms=describe([r['read_ms'] for r in records]))
        damage = [r['damage'] for r in records if 'damage' in r]
        if damage:
            out['damage_area_share'] = describe(damage)
            out['damage_bytes_share'] = round(sum(damage) / len(damage), 4)
        band = [r['band'] for r in records if 'band' in r]
        if band:
            out['changed_row_band_share'] = describe(band)
            out['identical_frames'] = sum(1 for b in band if b == 0.0)
    return out


# ---- Scenarios ------------------------------------------------------------------------------------
class Bench:
    def __init__(self, engine, args, out):
        self.engine, self.args, self.out = engine, args, out
        self.server = FixtureServer()
        self.next_path = 0
        self.samples = 20 if not args.quick else 5
        self.window = 5.0 if not args.quick else 2.0

    # navigation alternates between the two admitted fixture URLs so every load is a new document
    def url_for(self, fixture):
        path = FixtureServer.PATHS[self.next_path % 2]
        self.next_path += 1
        self.server.assign(path, fixture)
        return self.server.origin + path

    def wait_frame(self, session, predicate, seconds=30):
        """Newest frame already matching, else the next one that does."""
        if session.meta is not None and predicate(session.meta, session.current):
            return time.monotonic()
        return session.until(lambda kind, meta, t: kind == 2 and predicate(meta, session.current), seconds)[2]

    def title(self, session, prefix, seconds=10):
        for item in reversed(session.events):
            if item.get('event') == 'title' and item.get('title', '').startswith(prefix):
                return item['_t']
        try:
            return session.until(lambda kind, meta, t: kind == 1 and meta.get('event') == 'title'
                                 and meta.get('title', '').startswith(prefix), seconds)[2]
        except TimeoutError:
            return None

    def navigate(self, session, fixture, capture=None):
        """navigate -> navigation event (new generation) -> first frame of it -> first painted frame."""
        url = self.url_for(fixture)
        before = session.target['document_generation']
        t0 = time.monotonic()
        request = session.command('navigate', url=url)
        gen = lambda meta: meta['target']['document_generation'] > before
        t_first = self.wait_frame(session, lambda meta, px: gen(meta))
        t_painted = self.wait_frame(session, lambda meta, px: gen(meta) and painted(px))
        done = session.completed(request)
        t_done = done['_t'] if '_t' in done else time.monotonic()
        t_title = self.title(session, 'bench:' + fixture, 10) if self.engine.name != 'fake' else None
        if capture and session.meta['device_scale'] == 1:
            png(self.out / capture, session.meta['width'], session.meta['height'], session.current)
        ms = lambda t: round((t - t0) * 1000, 1) if t else None
        return dict(navigate_to_first_frame_ms=ms(t_first), navigate_to_painted_frame_ms=ms(t_painted),
                    navigate_to_completed_ms=ms(t_done), navigate_to_title_ms=ms(t_title), status=done.get('status'))

    def resize(self, session, scale):
        width, height = int(math.ceil(VIEW_W * scale)), int(math.ceil(VIEW_H * scale))
        t0 = time.monotonic()
        session.command('resize', width=VIEW_W, height=VIEW_H, device_scale=scale)
        t = self.wait_frame(session, lambda meta, px: meta['width'] == width and meta['height'] == height)
        return round((t - t0) * 1000, 1)

    def idle(self, session, seconds=2.0):
        records = session.recorder = []
        session.run_for(seconds)
        session.recorder = None
        return dict(idle_frames=len(records), idle_fps=round(len(records) / seconds, 2))

    def sustained(self, session, fixture, wheel=False):
        """Settle, then measure a window: frames, intervals, bytes, damage, CPU, memory."""
        nav = self.navigate(session, fixture)
        session.run_for(1.0)
        session.band = True
        schedule = None
        if wheel:
            interval = 1 / 60
            state = dict(next=time.monotonic(), sent=0)
            def due():
                return state['next']
            def fire():
                session.command('wheel', x=VIEW_W // 2, y=VIEW_H // 2, modifiers=0, delta_x=0, delta_y=-12)
                state['sent'] += 1
                state['next'] += interval
            schedule = (due, fire)
        events_before, event_bytes_before = len(session.events), session.event_bytes
        start = session.usage.snapshot()
        records = session.recorder = []
        t0 = time.monotonic()
        session.run_for(self.window, schedule)
        seconds = time.monotonic() - t0
        session.recorder = None
        session.band = False
        end = session.usage.snapshot(memory=True)
        stats = frame_window_stats(records, seconds)
        stats.update(usage=Usage.window(start, end), load=nav,
                     events=len(session.events) - events_before,
                     event_bytes_per_s=round((session.event_bytes - event_bytes_before) / seconds))
        if wheel:
            stats['wheel_commands'] = state['sent']
        return stats

    def input_latency(self, session, kind):
        """Command written -> first frame whose pixels differ from the frame shown before it."""
        fixture = 'text' if kind == 'key' else 'scroll'
        nav = self.navigate(session, fixture)
        if kind == 'key':
            session.completed(session.command('focus', focused=True))
        session.run_for(0.8)
        latencies, titles, misses = [], [], 0
        for i in range(self.samples):
            session.run_for(0.12)  # quiet gap; also drains late frames
            reference = bytes(session.current)
            size = len(reference)
            t0 = time.monotonic()
            if kind == 'key':
                for key_type in ('down', 'char', 'up'):
                    session.command('key', type=key_type, native_key_code=38, windows_key_code=65, modifiers=0, text='a')
            else:
                session.command('wheel', x=VIEW_W // 2, y=VIEW_H // 2, modifiers=0, delta_x=0, delta_y=-40)
            try:
                t = session.until(lambda k, meta, t: k == 2 and len(session.current) == size and session.current != reference, 2.0)[2]
                latencies.append(round((t - t0) * 1000, 2))
            except TimeoutError:
                misses += 1
            if kind == 'key':
                for item in reversed(session.events):
                    if item.get('event') == 'title' and item['_t'] >= t0 and '|len=' in item.get('title', ''):
                        titles.append(round((item['_t'] - t0) * 1000, 2))
                        break
        out = dict(samples=latencies, latency_ms=describe(latencies), misses=misses, load=nav)
        if kind == 'key':
            out['title_latency_ms'] = describe(titles)
        return out

    def repetition(self, index):
        directory = self.out
        session = Session(self.engine, self.server.origin, directory, frame_damage=self.args.frame_damage,
                          damage_payload=self.args.damage_payload)
        rep = dict(index=index, frame_damage=self.args.frame_damage, damage_payload=session.damage_payload)
        try:
            kind, ready, t = session.until(lambda kind, meta, t: kind == 1 and meta.get('event') == 'ready', 60)
            rep['spawn_to_ready_ms'] = round((t - session.t_spawn) * 1000, 1)
            rep['pipe_size_bytes'] = session.pipe_size()
            if index == 0:
                self.ready = {k: v for k, v in ready.items() if k not in ('event', 'version')}
            # create -> first frame (static fixture, 1x)
            url = self.url_for('static')
            pending = dict(tab_id='bench-tab', engine_instance=session.instance, identity=self.server.origin,
                           document_generation=1, navigation_generation=1, private_mode=False)
            t0 = time.monotonic()
            request = session.command('create', target=pending, url=url, width=VIEW_W, height=VIEW_H, device_scale=1)
            t_created = session.until(lambda kind, meta, t: kind == 1 and meta.get('event') == 'created', 60)[2]
            t_first = self.wait_frame(session, lambda meta, px: True, 60)
            t_painted = self.wait_frame(session, lambda meta, px: painted(px), 60)
            session.completed(request, 60)
            rep['create'] = dict(create_to_created_ms=round((t_created - t0) * 1000, 1),
                                 create_to_first_frame_ms=round((t_first - t0) * 1000, 1),
                                 create_to_painted_frame_ms=round((t_painted - t0) * 1000, 1))
            snap = session.usage.snapshot(memory=True)
            rep['after_create_usage'] = Usage.window(snap, snap)
            if index == 0:
                png(directory / f'{self.engine.name}-static-1x.png', session.meta['width'], session.meta['height'], session.current)
            rep['static_idle'] = self.idle(session)
            rep['navigation'] = self.navigate(session, 'static', capture=f'{self.engine.name}-static-page2-1x.png' if index == 0 else None)
            scales = {}
            for scale in self.args.scales:
                label = f'{scale:g}x'
                s = scales[label] = dict(resize_to_frame_ms=self.resize(session, scale))
                s['raf'] = self.sustained(session, 'raf')
                s['scroll'] = self.sustained(session, 'scroll', wheel=True)
                s['key'] = self.input_latency(session, 'key')
                s['wheel'] = self.input_latency(session, 'wheel')
                for fixture in ('image', 'dom'):
                    load = self.navigate(session, fixture, capture=f'{self.engine.name}-{fixture}-1x.png' if index == 0 and scale == 1 else None)
                    load.update(self.idle(session))
                    s[fixture] = load
                    s[fixture + '_scroll'] = self.sustained(session, fixture, wheel=True)
            rep['scales'] = scales
            if self.args.pipe_experiment:
                # Bench-only A/B: the same 2x windows with the stdout pipe enlarged from the reader side
                # (F_SETPIPE_SZ, ≤ /proc/sys/fs/pipe-max-size). No host change; shows the pipe-capacity cost.
                top = max(self.args.scales)
                self.resize(session, top)
                got = session.pipe_size(1 << 20)
                rep['pipe_1mib'] = dict(pipe_size_bytes=got, scale=top, raf=self.sustained(session, 'raf'),
                                        scroll=self.sustained(session, 'scroll', wheel=True))
            rep['frames_total'] = len(session.frames)
            rep['teardown'] = session.teardown()
            rep['status'] = 'PASS'
        except (Exception, KeyboardInterrupt) as error:  # noqa: BLE001 - one failed repetition is recorded, not fatal
            rep['status'] = 'FAIL'
            rep['error'] = type(error).__name__ + ': ' + str(error)[:500]
            log('repetition', index, 'failed:', rep['error'])
        finally:
            session.kill()
        return rep


def machine():
    info = dict(platform=platform.platform(), machine=platform.machine(), nproc=os.cpu_count(), python=platform.python_version())
    with contextlib.suppress(OSError):
        cpu = [l.split(':', 1)[1].strip() for l in Path('/proc/cpuinfo').read_text().splitlines() if l.startswith('model name')]
        info['cpu_model'] = cpu[0] if cpu else None
    with contextlib.suppress(OSError):
        info['mem_total_mb'] = int(Path('/proc/meminfo').read_text().split()[1]) // 1024
    with contextlib.suppress(OSError):
        info['os'] = [l.split('=', 1)[1].strip('"') for l in Path('/etc/os-release').read_text().splitlines() if l.startswith('PRETTY_NAME=')][0]
    info['gpu_dri'] = sorted(os.listdir('/dev/dri')) if os.path.isdir('/dev/dri') else []
    with contextlib.suppress(OSError):
        info['pipe_max_size'] = int(Path('/proc/sys/fs/pipe-max-size').read_text())
    with contextlib.suppress(OSError):
        info['loadavg_start'] = Path('/proc/loadavg').read_text().split()[:3]
    return info


def collect(reps, path):
    """Values at a dotted path across repetitions."""
    values = []
    for rep in reps:
        value = rep
        for key in path.split('.'):
            value = value.get(key) if isinstance(value, dict) else None
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            values.append(value)
    return values


def summarize(reps, scales):
    ok = [r for r in reps if r.get('status') == 'PASS']
    keys = ['spawn_to_ready_ms', 'create.create_to_first_frame_ms', 'create.create_to_painted_frame_ms',
            'navigation.navigate_to_first_frame_ms', 'navigation.navigate_to_painted_frame_ms',
            'navigation.navigate_to_completed_ms', 'static_idle.idle_fps', 'after_create_usage.rss_mb',
            'after_create_usage.pss_mb', 'after_create_usage.processes',
            'teardown.close_to_closed_ms', 'teardown.close_to_exit_ms', 'teardown.close_to_no_helpers_ms']
    for scale in scales:
        s = f'scales.{scale:g}x'
        keys += [f'{s}.resize_to_frame_ms']
        for sc in ('raf', 'scroll', 'image_scroll', 'dom_scroll'):
            keys += [f'{s}.{sc}.fps', f'{s}.{sc}.interval_ms.median', f'{s}.{sc}.interval_ms.p95', f'{s}.{sc}.interval_p99_ms',
                     f'{s}.{sc}.interval_ms.stdev', f'{s}.{sc}.long_intervals_share', f'{s}.{sc}.bytes_per_frame',
                     f'{s}.{sc}.pipe_mb_s', f'{s}.{sc}.read_ms.median', f'{s}.{sc}.damage_bytes_share',
                     f'{s}.{sc}.changed_row_band_share.median', f'{s}.{sc}.identical_frames',
                     f'{s}.{sc}.usage.cpu_percent', f'{s}.{sc}.usage.client_cpu_percent', f'{s}.{sc}.usage.rss_mb',
                     f'{s}.{sc}.usage.pss_mb', f'{s}.{sc}.usage.processes', f'{s}.{sc}.load.navigate_to_painted_frame_ms']
        keys += [f'{s}.key.latency_ms.median', f'{s}.key.latency_ms.p95', f'{s}.key.title_latency_ms.median', f'{s}.key.misses',
                 f'{s}.wheel.latency_ms.median', f'{s}.wheel.latency_ms.p95', f'{s}.wheel.misses']
        for fixture in ('image', 'dom'):
            keys += [f'{s}.{fixture}.navigate_to_first_frame_ms', f'{s}.{fixture}.navigate_to_painted_frame_ms',
                     f'{s}.{fixture}.navigate_to_completed_ms', f'{s}.{fixture}.idle_fps']
    for sc in ('raf', 'scroll'):
        keys += [f'pipe_1mib.{sc}.fps', f'pipe_1mib.{sc}.pipe_mb_s', f'pipe_1mib.{sc}.read_ms.median',
                 f'pipe_1mib.{sc}.usage.cpu_percent', f'pipe_1mib.{sc}.interval_ms.p95']
    summary = {key: describe(collect(ok, key)) for key in keys}
    # Input latencies pooled over every sample of every repetition.
    for scale in scales:
        for kind in ('key', 'wheel'):
            pooled = [v for r in ok for v in r.get('scales', {}).get(f'{scale:g}x', {}).get(kind, {}).get('samples', [])]
            summary[f'scales.{scale:g}x.{kind}.pooled_latency_ms'] = describe(pooled)
    return {k: v for k, v in summary.items() if v.get('n')}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--engine', choices=sorted(ENGINES), required=True)
    parser.add_argument('--binary', help='host binary (default: the engine probe.py build output)')
    parser.add_argument('--webkit-root', help='checkout holding native/webkit-host (default: this repository)')
    parser.add_argument('--cef-root', help='checkout holding the Linux native/chromium-host')
    parser.add_argument('--out', required=True)
    parser.add_argument('--reps', type=int, default=5)
    parser.add_argument('--scales', type=float, nargs='+', default=[1.0, 2.0])
    parser.add_argument('--frame-damage', action='store_true', help='negotiate hello.frame_damage (host-reported damage)')
    parser.add_argument('--damage-payload', action='store_true',
                        help='with --frame-damage: negotiate hello.damage_payload (payload = damage rectangle only)')
    parser.add_argument('--pipe-experiment', action='store_true', help='also measure 2x windows with a 1 MiB stdout pipe')
    parser.add_argument('--quick', action='store_true', help='short windows and fewer samples (harness checks only)')
    args = parser.parse_args()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    result = dict(schema='axiosozo-engine-bench-v1', engine=args.engine, status='FAIL', E1='NOT_TESTED', E2='NOT_TESTED',
                  started_at=time.time(), machine=machine(), args=vars(args),
                  note='Component benchmark over the AXCF pipe; client acks each frame immediately (presenter cost excluded).')
    engine = ENGINES[args.engine](args)
    if engine.label:
        result['label'] = engine.label
    result['subreaper'] = become_subreaper()
    previous = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    bench = None
    try:
        engine.check()
        result['binary'] = str(engine.binary())
        bench = Bench(engine, args, out)
        reps = []
        for index in range(args.reps):
            log(f'{args.engine} repetition {index + 1}/{args.reps}')
            reps.append(bench.repetition(index))
            log('  ->', reps[-1]['status'], reps[-1].get('error', ''))
        result['ready'] = getattr(bench, 'ready', None)
        result['repetitions'] = reps
        result['summary'] = summarize(reps, args.scales)
        passed = sum(r['status'] == 'PASS' for r in reps)
        result['passed_repetitions'] = passed
        result['status'] = 'PASS' if passed == args.reps else ('PARTIAL' if passed else 'FAIL')
        result['fixture_requests'] = len(bench.server.requests)
        result['fixture_rejected'] = sum(1 for r in bench.server.requests if r['status'] != 200 and r['path'] != 'OTHER')
    except (Exception, KeyboardInterrupt) as error:  # noqa: BLE001
        result['error'] = type(error).__name__ + ': ' + str(error)[:1000]
        if 'BLOCKED_ENV' in str(error):
            result['status'] = 'BLOCKED_ENV'
    finally:
        signal.signal(signal.SIGTERM, previous)
        if bench:
            bench.server.close()
        result['finished_at'] = time.time()
        with contextlib.suppress(OSError):
            result['machine']['loadavg_end'] = Path('/proc/loadavg').read_text().split()[:3]
        name = f'bench-{args.engine}' + ('-damage' if args.frame_damage else '') + \
            ('-payload' if args.frame_damage and args.damage_payload else '') + '.json'
        (out / name).write_text(json.dumps(result, indent=1) + '\n')
        print(json.dumps(dict(component='engine-bench', engine=args.engine, status=result['status'],
                              passed=result.get('passed_repetitions'), out=str(out / name), error=result.get('error'))), flush=True)
    return 0 if result['status'] == 'PASS' else 2


if __name__ == '__main__':
    raise SystemExit(main())
