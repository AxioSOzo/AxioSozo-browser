#!/usr/bin/env python3
"""Where the Zen parent process spends its time in Gecko, Chromium and WebKit tabs.

Runs the zen_bench.py scenarios (the same fixtures, Zen engine switch, chrome-side frame
sampler, real X11 wheel/key input) on the real Linux app, in up to three passes, each in
a fresh tab of one browser session:

  plain    no instrumentation: zen_bench's metrics + per-thread CPU of every process of
           the app tree from /proc/<pid>/task/*/stat (the cheap system view)
  trace    + TEST-ONLY chrome-side timing hooks (hooks.js: Subprocess spawn/stdin/stdout,
           ImageData, putImageData, MozAfterPaint, keydown) -> per-frame receive/convert/
           upload times, a key -> send -> host -> frame -> draw -> paint breakdown and a
           Gecko -> engine switch timeline
  profile  + the Gecko profiler (Services.profiler, started and dumped per window from
           chrome over Marionette) on the parent's main, IPC I/O, Renderer/WebRender,
           worker (Subprocess I/O) and content main threads; one profile per window

Each window's record names the pass, so the instrumentation overhead is visible
(plain vs trace vs profile). Profiles are summarized offline by gecko_profile.py.

Test-only pieces are the GUI harness's and zen_bench's (Marionette, throwaway profile,
fixture mode, the WebKit pref, the labelled chrome overlay) plus the runtime hooks of the
trace/profile passes, which change no product file. TLS, sandboxes and isolation are
untouched.

usage: zen_profile.py --engine gecko|chromium|webkit --app fetched|PATH --out DIR
       [--passes plain,trace,profile] [--chrome-overlay overlay.json] [--label NAME]
"""
import argparse
import json
import os
from pathlib import Path
import re
import statistics
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
BENCH_DIR = HERE.parent
ROOT = BENCH_DIR.parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

import importlib.util  # noqa: E402
_spec = importlib.util.spec_from_file_location('zen_bench', BENCH_DIR / 'zen_bench.py')
zen_bench = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(zen_bench)
bench = zen_bench.bench
gui_test = zen_bench.gui_test
gui_engines = zen_bench.gui_engines
EngineUnavailable = zen_bench.EngineUnavailable

HOOKS = (HERE / 'hooks.js').read_text()
PASSES = ('plain', 'trace', 'profile')

# Gecko profiler settings (nsIProfiler.StartProfiler). Thread filters are case-insensitive
# substrings: the parent's and content processes' main threads (GeckoMain), Subprocess's
# ChromeWorker (DOM Worker), IPC I/O, the compositor and WebRender threads (software WR:
# Renderer, WRSceneBuilder, WRRenderBackend, WRWorker, SwComposite), image decoding, sockets.
PROFILER_FEATURES = ['js', 'stackwalk', 'cpu', 'processcpu', 'ipcmessages']
PROFILER_THREADS = ['GeckoMain', 'DOM Worker', 'IPC I/O', 'Compositor', 'Renderer', 'WR', 'SwComposite',
                    'Canvas', 'ImageIO', 'Socket Thread', 'Timer', 'BackgroundThreadPool']
PROFILER_ENTRIES = 16 * 1024 * 1024  # 8-byte entries: 128 MiB, enough for the longest window at 1 ms
PROFILER_INTERVAL_MS = 1.0

PROFILER_START = """
const [entries, interval, features, threads, done] = arguments;
if (!Services.profiler) { done({ok: false, error: 'no Services.profiler (MOZ_GECKO_PROFILER off in this build)'}); return; }
Promise.resolve(Services.profiler.StartProfiler(entries, interval, features, threads)).then(
  () => done({ok: Services.profiler.IsActive(), features: Services.profiler.GetFeatures?.() ?? null,
              epoch: performance.timeOrigin + performance.now()}),
  error => done({ok: false, error: String(error)}));
"""
PROFILER_DUMP = """
const [path, done] = arguments; const t0 = performance.now();
Services.profiler.dumpProfileToFileAsync(path).then(() => Services.profiler.StopProfiler()).then(
  () => done({ok: true, dump_ms: performance.now() - t0}),
  error => { try { Services.profiler.StopProfiler(); } catch {} done({ok: false, error: String(error)}); });
"""
EPOCH = 'return performance.timeOrigin + performance.now();'
NOW = 'return performance.now();'


# ---- Per-thread CPU (/proc) --------------------------------------------------------------
def thread_name(comm):
    """Pool threads collapse to one name: WRWorker#3 -> WRWorker#, ThreadPoolForeg -> as is."""
    return re.sub(r'#\d+$', '#', re.sub(r'\s*\d+$', '', comm)) or comm


def thread_snapshot(root):
    table = bench.proc_table()
    threads = {}
    for pid in bench.tree(root, table):
        kind = 'zen-parent' if pid == root else bench.process_kind(pid, table[pid]['comm'])
        try:
            tids = os.listdir(f'/proc/{pid}/task')
        except OSError:
            continue
        for tid in tids:
            try:
                stat = Path(f'/proc/{pid}/task/{tid}/stat').read_text()
            except OSError:
                continue
            rest = stat[stat.rindex(')') + 2:].split()
            comm = stat[stat.index('(') + 1:stat.rindex(')')]
            threads[(pid, int(tid))] = (kind, comm, int(rest[11]) + int(rest[12]))
    return dict(t=time.monotonic(), threads=threads)


def thread_window(start, end, top=25):
    seconds = max(1e-6, end['t'] - start['t'])
    rows = {}
    for key, (kind, comm, ticks) in end['threads'].items():
        delta = ticks - start['threads'].get(key, (None, None, 0))[2]
        if delta <= 0:
            continue
        name = (kind, 'main' if key[0] == key[1] else thread_name(comm))
        row = rows.setdefault(name, dict(process=kind, thread=name[1], threads=0, ticks=0))
        row['threads'] += 1
        row['ticks'] += delta
    out = sorted(rows.values(), key=lambda r: -r['ticks'])
    for row in out:
        row['cpu_percent'] = round(100 * row.pop('ticks') / bench.CLK_TCK / seconds, 1)
    by_process = {}
    for row in out:
        by_process[row['process']] = round(by_process.get(row['process'], 0) + row['cpu_percent'], 1)
    parent = [r for r in out if r['process'] == 'zen-parent']
    return dict(measured_in='/proc/<pid>/task/<tid>/stat utime+stime delta (CLK_TCK resolution)', seconds=round(seconds, 3),
                cpu_percent_by_process=dict(sorted(by_process.items(), key=lambda kv: -kv[1])),
                zen_parent_threads=parent[:top], top_threads=out[:top])


# ---- Hook event analysis ---------------------------------------------------------------
def describe(values):
    return zen_bench.describe_list(values)


def frames_from_events(events):
    """One record per frame the host delivered, anchored on its `frame_ack` write.

    Per tag (spawned host), the reads before an ack are AXCF header (16 B), metadata, payload
    (none for memfd/empty frames). Then, in chrome: damage payload assembly, EngineFrameSurface
    accept, the next rAF-paced surface paint (convert + putImageData of the damage union; a frame
    whose paint also covers a newer accept is `superseded`) and the next chrome MozAfterPaint.
    Pre-EngineFrameSurface presenters (no accept events) fall back to ImageData/putImageData.
    """
    reads_by_tag, acks = {}, []
    for e in events:
        if e[0] == 'read':
            reads_by_tag.setdefault(e[1], []).append(e)
        elif e[0] == 'write' and e[2] == 'frame_ack':
            acks.append((e[3], e[1]))
    for items in reads_by_tag.values():
        items.sort(key=lambda e: e[4])
    accepts = sorted(e[1] for e in events if e[0] == 'accept')
    accept_damage = {e[1]: (e[2], e[3]) for e in events if e[0] == 'accept'}
    fpaints = sorted((e[1], e[2]) for e in events if e[0] == 'fpaint' and e[3])
    assembles = sorted((e[1], e[2]) for e in events if e[0] == 'assemble')
    images = sorted(e[1] for e in events if e[0] == 'imagedata')
    puts = sorted((e[1], e[2], e[3]) for e in events if e[0] == 'put')
    paints = sorted(e[1] for e in events if e[0] == 'paint')

    frames = []
    used_reads = set()
    for ack_time, tag in sorted(acks):
        reads = [r for r in reads_by_tag.get(tag, []) if r[4] <= ack_time and id(r) not in used_reads]
        header_index = next((i for i in range(len(reads) - 1, -1, -1) if reads[i][2] == 16), None)
        if header_index is None:
            continue
        mine = reads[header_index:]
        used_reads.update(id(r) for r in reads)
        header = mine[0]
        payload = mine[2] if len(mine) >= 3 else None
        received = (payload or mine[-1])[4]
        frame = dict(tag=tag, ack=ack_time, header_call=header[3], header_done=header[4],
                     header_wait_ms=header[4] - header[3], payload_bytes=payload[5] if payload else 0,
                     pixel_done=received, pixel_read_ms=(payload[4] - payload[3]) if payload else 0.0,
                     received_to_ack_ms=ack_time - received)
        assemble = next((a for a in assembles if a[0] >= received - 0.01 and a[0] <= ack_time), None)
        if assemble:
            frame['assemble_ms'] = assemble[1] - assemble[0]
        accept = next((t for t in accepts if received - 0.01 <= t <= ack_time), None)
        if accept is not None:
            frame['accept'] = accept
            frame['damage_pixels'], frame['frame_pixels'] = accept_damage.get(accept, (None, None))
            paint = next((fp for fp in fpaints if fp[0] >= accept), None)
            if paint is not None and paint[0] - accept < 1000:
                newer = next((t for t in accepts if accept < t <= paint[0]), None)
                frame['superseded'] = newer is not None
                frame['accept_to_paint_start_ms'] = paint[0] - accept   # waiting for the refresh tick
                frame['surface_paint_ms'] = paint[1] - paint[0]         # convert + putImageData
                put = next((q for q in puts if paint[0] <= q[0] <= paint[1]), None)
                if put is not None:
                    frame['put_start'], frame['put_end'], frame['put_pixels'] = put
                    frame['put_ms'] = put[1] - put[0]
                    frame['convert_ms'] = (paint[1] - paint[0]) - frame['put_ms']
                frame['paint_end'] = paint[1]
        else:
            # Older presenters: ImageData construction ends the conversion, then putImageData.
            image = next((t for t in images if t >= received), None)
            put = next((q for q in puts if q[0] >= received), None)
            if image is not None and image - received < 100:
                frame['convert_ms'] = image - received
            if put is not None and put[0] - received < 100:
                frame['put_start'], frame['put_end'], frame['put_pixels'] = put
                frame['put_ms'] = put[1] - put[0]
                frame['paint_end'] = put[1]
        if 'paint_end' in frame:
            chrome_paint = next((t for t in paints if t >= frame['paint_end']), None)
            if chrome_paint is not None and chrome_paint - frame['paint_end'] < 200:
                frame['chrome_paint'] = chrome_paint
                frame['paint_to_chrome_paint_ms'] = chrome_paint - frame['paint_end']
        frames.append(frame)
    frames.sort(key=lambda f: f['pixel_done'])
    return frames


def frame_summary(events, seconds):
    frames = frames_from_events(events)
    if not frames:
        return None
    done = [f['pixel_done'] for f in frames]
    gaps = [b - a for a, b in zip(done, done[1:])]
    painted = [f for f in frames if 'surface_paint_ms' in f and not f.get('superseded')]
    reads = [e for e in events if e[0] == 'read']
    total_bytes = sum(max(0, e[5]) for e in reads)
    paint_ms = [e[2] - e[1] for e in events if e[0] == 'fpaint' and e[3]]
    pipeline = [f['pixel_read_ms'] + f.get('assemble_ms', 0) for f in frames] + paint_ms
    def share(values):
        return round(sum(v for v in values if v) / (seconds * 1000), 4) if seconds else None
    return dict(measured_in='zen-chrome TEST-ONLY hooks (hooks.js)', frames_received=len(frames),
                frames_painted=len(painted), surface_paints=len(paint_ms),
                frames_superseded=sum(1 for f in frames if f.get('superseded')),
                received_fps=round(len(frames) / seconds, 2) if seconds else None,
                painted_fps=round(len(paint_ms) / seconds, 2) if seconds else None,
                payload_bytes_per_frame=describe([f['payload_bytes'] for f in frames]),
                damage_share=describe([f['damage_pixels'] / f['frame_pixels'] for f in frames if f.get('frame_pixels')]),
                received_mb_per_s=round(total_bytes / seconds / 1e6, 1) if seconds else None,
                stdout_reads=len(reads),
                header_wait_ms=describe([f['header_wait_ms'] for f in frames]),
                pixel_read_ms=describe([f['pixel_read_ms'] for f in frames]),
                assemble_ms=describe([f.get('assemble_ms') for f in frames]),
                received_to_ack_ms=describe([f['received_to_ack_ms'] for f in frames]),
                accept_to_paint_start_ms=describe([f.get('accept_to_paint_start_ms') for f in painted]),
                surface_paint_ms=describe(paint_ms),
                convert_ms=describe([f.get('convert_ms') for f in frames]),
                put_ms=describe([f.get('put_ms') for f in frames]),
                paint_to_chrome_paint_ms=describe([f.get('paint_to_chrome_paint_ms') for f in painted]),
                receive_to_receive_ms=describe(gaps),
                main_thread_frame_work_share=share(pipeline),
                main_thread_frame_work_note='pixel read call->resolve (includes waiting on the Subprocess worker) + assembly + surface paints, as a share of the window')


def key_breakdown(events):
    """Per chrome keydown: -> host `key` request written -> next frame header -> payload -> accept -> rAF paint -> MozAfterPaint."""
    keys = sorted((e[1], e[2]) for e in events if e[0] == 'key')
    writes = sorted((e[3], e[2]) for e in events if e[0] == 'write')
    frames = frames_from_events(events)
    rows = []
    for stamp, handler in keys:
        send = next((t for t, method in writes if t >= stamp and method == 'key'), None)
        row = dict(keydown=stamp, chrome_handler_ms=handler - stamp)
        if send is None:
            rows.append(row)
            continue
        row['keydown_to_send_ms'] = send - stamp
        # The first frame whose header arrived after the send (the host's response to the key).
        frame = next((f for f in frames if f['header_done'] >= send), None)
        if frame is None:
            rows.append(row)
            continue
        row['send_to_frame_header_ms'] = frame['header_done'] - send   # host input + render + first bytes seen by the parent
        row['pixel_transport_ms'] = frame['pixel_done'] - frame['header_done']
        if 'accept' in frame:
            row['received_to_accept_ms'] = frame['accept'] - frame['pixel_done']
        for field in ('accept_to_paint_start_ms', 'surface_paint_ms', 'convert_ms', 'put_ms', 'paint_to_chrome_paint_ms'):
            if field in frame:
                row[field] = frame[field]
        if 'paint_end' in frame:
            row['keydown_to_surface_paint_end_ms'] = frame['paint_end'] - stamp
        if 'chrome_paint' in frame:
            row['keydown_to_chrome_paint_ms'] = frame['chrome_paint'] - stamp
        rows.append(row)
    fields = ['chrome_handler_ms', 'keydown_to_send_ms', 'send_to_frame_header_ms', 'pixel_transport_ms', 'received_to_accept_ms',
              'accept_to_paint_start_ms', 'surface_paint_ms', 'convert_ms', 'put_ms', 'paint_to_chrome_paint_ms',
              'keydown_to_surface_paint_end_ms', 'keydown_to_chrome_paint_ms']
    return dict(measured_in='zen-chrome TEST-ONLY hooks (hooks.js); chrome event timeStamp and performance.now share one clock',
                keys=len(keys), keys_with_frame=sum(1 for r in rows if 'pixel_transport_ms' in r),
                **{field: describe([r.get(field) for r in rows]) for field in fields})


def switch_timeline(events, start):
    """First occurrence (ms after the switch call) of each step, with counts."""
    steps = {}
    def note(name, t):
        item = steps.setdefault(name, dict(first_ms=round(t - start, 1), count=0))
        item['count'] += 1
    def when(event):
        return event[3] if event[0] in ('spawn', 'read', 'write') else event[1]
    for event in sorted(events, key=when):
        kind = event[0]
        if kind == 'spawn':
            note(f'spawn {event[2]} called', event[3])
            note(f'spawn {event[2]} resolved', event[4])
        elif kind == 'write':
            note(f'write {event[2]}', event[3])
        elif kind == 'read':
            note('first stdout read resolved' if event[5] < 65536 else 'first large (>=64 KiB) read resolved', event[4])
        elif kind == 'accept':
            note('first frame accepted (EngineFrameSurface)', event[1])
        elif kind == 'fpaint' and event[3]:
            note('first surface paint end', event[2])
        elif kind == 'imagedata':
            note('first ImageData', event[1])
        elif kind == 'put':
            note('first putImageData end', event[2])
    return dict(sorted(steps.items(), key=lambda kv: kv[1]['first_ms']))


# ---- Harness -------------------------------------------------------------------------------
class ZenProfile(zen_bench.ZenBench):
    def __init__(self, args, engine, evidence):
        super().__init__(args, engine, evidence)
        self.result.update(harness='axiosozo-zen-profile')
        self.profiles = evidence / 'profiles'
        self.pass_name = 'plain'
        self.hooks_installed = False

    def hooks(self, command):
        return self.chrome_script(HOOKS, [command, None])

    def launch(self, session, executable, profile):
        super().launch(session, executable, profile)
        if any(p in ('trace', 'profile') for p in self.args.passes):
            # Before any engine host is spawned: the Subprocess.call wrapper must see the spawn.
            self.result['hooks'] = self.hooks('install')
            self.hooks_installed = True

    def measured(self, name, fn):
        """Run fn() as one measured window of the current pass."""
        record = dict(window=name, pass_=self.pass_name)
        tracing = self.pass_name in ('trace', 'profile') and self.hooks_installed
        profiling = self.pass_name == 'profile'
        if profiling:
            started = self.async_chrome(PROFILER_START, [PROFILER_ENTRIES, PROFILER_INTERVAL_MS, PROFILER_FEATURES, PROFILER_THREADS])
            record['profiler'] = started
            profiling = bool(started.get('ok'))
        if tracing:
            self.hooks('enable')
        chrome_t0 = self.chrome_script(NOW)
        epoch0 = self.chrome_script(EPOCH)
        snap0 = thread_snapshot(self.browser.pid)
        try:
            record['result'] = fn()
        finally:
            snap1 = thread_snapshot(self.browser.pid)
            epoch1 = self.chrome_script(EPOCH)
            record['window_epoch_ms'] = [round(epoch0, 3), round(epoch1, 3)]
            record['threads'] = thread_window(snap0, snap1)
            if tracing:
                self.hooks('disable')
                drained = self.hooks('drain')
                events = drained['events']
                record['hook_events'] = len(events)
                record['hook_events_dropped'] = drained['dropped']
                seconds = (epoch1 - epoch0) / 1000
                if name == 'key':
                    record['key_breakdown'] = key_breakdown(events)
                elif name.startswith('switch'):
                    record['switch_timeline'] = switch_timeline(events, chrome_t0)
                frames = frame_summary(events, seconds)
                if frames:
                    record['frames'] = frames
                if self.args.keep_events:
                    (self.evidence / 'events').mkdir(exist_ok=True)
                    (self.evidence / 'events' / f'{self.pass_name}-{name}.json').write_text(json.dumps(events))
            if profiling:
                self.profiles.mkdir(parents=True, exist_ok=True)
                path = self.profiles / f'{self.label}-{name}.json'
                dumped = self.async_chrome(PROFILER_DUMP, [str(path)])
                record['profiler'].update(dump=dumped, file=str(path.relative_to(self.evidence)) if path.is_file() else None,
                                          parent_pid=self.browser.pid)
        self.windows.append(record)
        return record

    def engine_tab(self, server):
        """New Gecko tab with the static fixture, then the measured Gecko -> engine switch."""
        self.loads = getattr(self, 'loads', 0) + 1
        path = bench.FixtureServer.PATHS[self.loads % 2]
        server.assign(path, 'static')
        url = server.origin + path
        self.open_tab(url)
        self.wait(lambda: (self.chrome_script('return gBrowser.selectedBrowser.contentTitle;') or '').startswith('bench:static'),
                  'the static fixture in the Gecko tab before the switch')
        def switch():
            ms = self.switch_engine(self.engine.name)
            state = self.wait(lambda: (lambda p: p if p['engine'] == self.engine.name and str(p['title'] or '').startswith('bench:static')
                                       and (p['frames'] or 0) > 0 else None)(self.presented()), self.engine.name + ' frames')
            return dict(gecko_to_engine_switch_ms=ms, presenter=state)
        return self.measured('switch-to-engine', switch)

    def one_pass(self, server):
        out = dict(pass_=self.pass_name)
        try:
            if self.native_engine:
                out['switch'] = self.engine_tab(server)['result']
            else:
                out['static'] = self.load(server, 'static')
            self.measured('idle', lambda: self.raf_window(2.0))
            out['raf_load'] = self.load(server, 'raf')
            self.measured('raf', lambda: self.raf_window(3.0))
            out['scroll_load'] = self.load(server, 'scroll')
            self.measured('scroll', lambda: self.raf_window(0, during=self.wheel))
            out['text_load'] = self.load(server, 'text')
            self.measured('key', lambda: self.key_latency(self.args.samples))
            if self.native_engine:
                self.measured('switch-to-gecko', lambda: dict(engine_to_gecko_switch_ms=self.switch_engine('gecko')))
                time.sleep(1)
                self.close_bench_tab()
            out['status'] = 'PASS'
        except EngineUnavailable as error:
            out.update(status='BLOCKED_ENV', reason=str(error))
        except (AssertionError, gui_test.MarionetteError, subprocess.SubprocessError, OSError, KeyError, TypeError) as error:
            out.update(status='FAIL', reason=f'{type(error).__name__}: {error}')
        return out

    def run_profile(self, executable, app_info):
        self.result['app'] = {'executable': str(executable), **app_info}
        self.windows = self.result['windows'] = []
        passes = self.result['passes'] = []
        gui_test.SESSION_ROOT.mkdir(parents=True, exist_ok=True)
        server = bench.FixtureServer()
        try:
            with zen_bench.OwnedSession(gui_test.SESSION_ROOT / ('profile-' + zen_bench.secrets.token_hex(8))) as session:
                self.fixture = server
                self.result['session'] = str(session.path)
                profile = zen_bench.private_directory(session.path / 'gecko')
                (profile / '.axiosozo-dev-profile').touch(mode=0o600)
                try:
                    self.start_display(session)
                    self.launch(session, executable, profile)
                    self.result['window_info'] = self.find_window()
                    try:
                        self.engine.prepare(self)
                    except EngineUnavailable as error:
                        self.result['engine_prepare'] = {'status': 'BLOCKED_ENV', 'reason': str(error)}
                    self.xdotool('windowraise', self.window)
                    self.xdotool('windowfocus', '--sync', self.window)
                    time.sleep(2)  # let startup work settle before the first window
                    for name in self.args.passes:
                        self.pass_name = name
                        print(f'zen-profile {self.label} pass {name}', flush=True)
                        passes.append(self.one_pass(server))
                        print('  ->', passes[-1]['status'], passes[-1].get('reason', ''), flush=True)
                        if passes[-1]['status'] == 'BLOCKED_ENV':
                            break
                    if self.hooks_installed:
                        self.result['hooks_end'] = self.hooks('status')  # spawns > 0: the Subprocess wrapper saw the hosts
                    self.screenshot('zen-profile-' + self.label)
                finally:
                    self.shutdown()
            self.result['cleanup'] = session.cleanup_report
        finally:
            server.close()


def compact(windows):
    """One row per (pass, window): the numbers the findings table uses."""
    rows = []
    for w in windows:
        r = w.get('result') or {}
        threads = w.get('threads') or {}
        parent = threads.get('zen_parent_threads') or []
        row = dict(pass_=w['pass_'], window=w['window'],
                   fps=r.get('fps'), interval_p99_ms=r.get('interval_p99_ms'), input_wall_s=r.get('input_wall_s'),
                   cpu_by_process=threads.get('cpu_percent_by_process'),
                   zen_parent_top_threads={t['thread']: t['cpu_percent'] for t in parent[:8]},
                   presenter_draw_ms=(r.get('presenter') or {}).get('meanDrawMilliseconds'))
        for key in ('keydown_to_presented_frame_ms', 'keydown_to_second_raf_ms'):
            if key in r:
                row[key] = r[key].get('median') if isinstance(r[key], dict) else r[key]
        for key in ('gecko_to_engine_switch_ms', 'engine_to_gecko_switch_ms'):
            if key in r:
                row[key] = r[key]
        if 'frames' in w:
            f = w['frames']
            row['frames'] = {k: (f[k].get('median') if isinstance(f[k], dict) else f[k]) for k in
                             ('received_fps', 'painted_fps', 'frames_superseded', 'received_mb_per_s', 'stdout_reads',
                              'payload_bytes_per_frame', 'damage_share', 'header_wait_ms', 'pixel_read_ms', 'assemble_ms',
                              'received_to_ack_ms', 'accept_to_paint_start_ms', 'surface_paint_ms', 'convert_ms', 'put_ms',
                              'paint_to_chrome_paint_ms', 'main_thread_frame_work_share') if k in f}
        if 'key_breakdown' in w:
            k = w['key_breakdown']
            row['key_breakdown_median'] = {key: value.get('median') for key, value in k.items() if isinstance(value, dict)}
        if 'switch_timeline' in w:
            row['switch_timeline'] = {key: value['first_ms'] for key, value in w['switch_timeline'].items()}
        if w.get('profiler'):
            row['profile'] = w['profiler'].get('file')
        rows.append(row)
    return rows


def main():
    engines = gui_engines.engines()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--engine', default='gecko', choices=sorted(engines))
    parser.add_argument('--app', default='fetched')
    parser.add_argument('--out', required=True)
    parser.add_argument('--passes', default='plain,trace,profile')
    parser.add_argument('--chrome-overlay')
    parser.add_argument('--label')
    parser.add_argument('--samples', type=int, default=20)
    parser.add_argument('--keep-events', action='store_true', help='also write the raw hook events per window')
    parser.add_argument('--size', default='1280x800')
    parser.add_argument('--device-scale', type=float,
                        help="TEST-ONLY layout.css.devPixelsPerPx (zen_bench.py's 2x mode; use with --size 2304x1440)")
    parser.add_argument('--timeout', type=float, default=120)
    parser.add_argument('--launch-timeout', type=float, default=240)
    args = parser.parse_args()
    args.passes = [p for p in args.passes.split(',') if p]
    if not args.passes or any(p not in PASSES for p in args.passes):
        parser.error('--passes: a comma list of ' + ','.join(PASSES))
    args.screenshot, args.hold = None, 0
    if args.device_scale:
        gui_test.TEST_PREFS['layout.css.devPixelsPerPx'] = str(args.device_scale)
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    harness = ZenProfile(args, engines[args.engine], out)
    harness.label = args.label or args.engine
    status = 'FAIL'
    try:
        if not gui_test.storage.LINUX:
            raise gui_test.Blocked('Linux only (Xvfb)')
        gui_test.storage.ensure()
        executable, info = gui_test.resolve_app(args.app)
        harness.run_profile(executable, info)
        statuses = {p['status'] for p in harness.result.get('passes', [])}
        status = 'PASS' if statuses == {'PASS'} else 'BLOCKED_ENV' if 'BLOCKED_ENV' in statuses else 'FAIL'
    except gui_test.Blocked as error:
        status, harness.result['reason'] = 'BLOCKED_ENV', str(error)
    except (RuntimeError, OSError, subprocess.SubprocessError, AssertionError, gui_test.MarionetteError) as error:
        harness.result['reason'] = f'{type(error).__name__}: {error}'
    if args.chrome_overlay and Path(args.chrome_overlay).is_file():
        overlay = json.loads(Path(args.chrome_overlay).read_text())
        harness.result['chrome_overlay'] = {key: overlay.get(key) for key in ('label', 'overlay_commit', 'app_build_commit')} | {
            'replaced': len(overlay.get('replaced') or []), 'added': len(overlay.get('added') or [])}
    harness.result['compact'] = compact(harness.result.get('windows', []))
    harness.result.update(status=status, schema='axiosozo-zen-profile-v1', label=harness.label, engine=args.engine,
                          device_scale=args.device_scale,
                          test_only=['GUI harness (Marionette, throwaway profile)', 'engine fixture mode',
                                     'TEST-ONLY chrome overlay' if args.chrome_overlay else None,
                                     'runtime timing hooks (trace/profile passes)', 'Gecko profiler (profile pass)'],
                          E1='NOT_TESTED', E2='NOT_TESTED', machine=bench.machine())
    (out / f'zen-profile-{harness.label}.json').write_text(json.dumps(harness.result, indent=1) + '\n')
    print(json.dumps(dict(component='zen-profile', engine=args.engine, status=status, reason=harness.result.get('reason'))))
    return {'PASS': 0, 'BLOCKED_ENV': 2}.get(status, 1)


if __name__ == '__main__':
    sys.exit(main())
