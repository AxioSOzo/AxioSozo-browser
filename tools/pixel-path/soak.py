#!/usr/bin/env python3
"""Soak and multi-tab measurement of the engine-tab pixel path in the Linux Zen app.

docs/perf/pixel-path.md ("memfd soak", "multi-tab"). One Zen window with three tabs: a Gecko tab
(rAF fixture), a WebKit tab and a Chromium tab (each opened in Gecko, then switched with Zen's own
engine switch in fixture mode, as tools/engine-bench/zen_bench.py does). For --minutes it cycles:

  each engine tab: select it, navigate to the rAF fixture and measure a 3 s presented-frame window,
  navigate to the scroll fixture and measure a wheel window (XTest, explicit cadence), navigate to
  the static fixture (navigate -> visible), navigate to the text fixture and measure key -> frame;
  the Gecko tab: select it and measure a 2 s in-page rAF window.

Every cycle records fps, p99 frame interval, CPU of the whole app tree (and per process kind),
RSS per kind, the engine hosts' open descriptor counts and each engine presenter's diagnostics
(frame transport, memfd fallback, failures). Hidden engine tabs keep their hosts (visibility off).

PASS when: every engine window presented frames (rAF fps >= --min-fps), no presenter failure, the
frame transport stayed --expect-transport with no memfd fallback, the hosts' descriptor counts
stayed within --max-fd-growth and the whole tree's RSS grew at most --max-rss-growth-mb from the
second cycle (the first warms caches) to the last.

Test-only switches are zen_bench's (throwaway profile, fixture mode, --pref/--device-scale, the
TEST-ONLY chrome overlay); nothing touches TLS, sandboxes or isolation. Never E1/E2, never READY.

usage: soak.py --app fetched --out DIR [--minutes 10] [--engines webkit,chromium] [--pref NAME=VALUE]
"""
import argparse
import importlib.util
import json
import os
from pathlib import Path
import secrets
import statistics
import subprocess
import sys
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
_spec = importlib.util.spec_from_file_location('zen_bench', ROOT / 'tools/engine-bench/zen_bench.py')
zen_bench = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(zen_bench)  # puts scripts/ on sys.path (gui_test, gui_engines, session)
bench, gui_test, gui_engines = zen_bench.bench, zen_bench.gui_test, zen_bench.gui_engines
from session import OwnedSession, private_directory  # noqa: E402

HOST_COMMS = {'chromium': 'AxioCEFProbe', 'webkit': 'AxioWebKitHost'}
DIAGNOSTICS = """
const probe = window.AxioSozo?.engineProbe;
const state = probe?.diagnostics?.() ?? {};
const n = state.native ?? state.webkit?.native ?? {};
return {engine: n.engine ?? null, frames: n.frames ?? null, title: n.title ?? gBrowser.selectedTab.label,
        failure: state.failure ?? state.chromium?.failure ?? null, failures: n.failures ?? null,
        frameTransport: n.frameTransport ?? null, memfdFallback: n.memfdFallback ?? null, frameUpload: n.frameUpload ?? null,
        tabEngine: probe?.engineOf?.(gBrowser.selectedTab) ?? null, surface: n.surface ?? null};
"""
LATCH = """
try {
  const m = ChromeUtils.importESModule('chrome://browser/content/axiosozo/EngineFrameSurface.sys.mjs');
  return {disabled: m.memfdFramesDisabled?.() ?? null, wanted: m.memfdFramesWanted?.() ?? null};
} catch (error) { return {error: String(error)}; }
"""


def median(values):
    values = [v for v in values if v is not None]
    return round(statistics.median(values), 2) if values else None


class Soak(zen_bench.ZenBench):
    def __init__(self, args, engine, evidence):
        super().__init__(args, engine, evidence)
        self.result.update(harness='axiosozo-pixel-path-soak', soak={})
        self.handles = {}

    def assign(self, server, fixture):
        self.loads = getattr(self, 'loads', 0) + 1
        path = bench.FixtureServer.PATHS[self.loads % 2]
        server.assign(path, fixture)
        return server.origin + path

    def select(self, name):
        self.set_context('content')
        self.marionette.call('WebDriver:SwitchToWindow', {'handle': self.handles[name], 'focus': True})
        if name != 'gecko':
            self.wait(lambda: self.chrome_script(DIAGNOSTICS)['engine'] == name, f'the {name} tab selected')

    def open_engine(self, server, engine):
        url = self.assign(server, 'raf')
        self.handles[engine] = self.open_tab(url)
        self.wait(lambda: (self.chrome_script('return gBrowser.selectedBrowser.contentTitle;') or '').startswith('bench:raf'),
                  'the rAF fixture in the Gecko tab before the switch')
        switch_ms = self.switch_engine(engine)
        state = self.wait(lambda: (lambda d: d if d['engine'] == engine and (d['frames'] or 0) > 0 else None)(
            self.chrome_script(DIAGNOSTICS)), f'{engine} frames')
        return dict(switch_ms=switch_ms, transport=state['frameTransport'])

    def host_fds(self):
        table = bench.proc_table()
        out = {}
        for pid in bench.tree(self.browser.pid, table):
            comm = table[pid]['comm']
            for engine, name in HOST_COMMS.items():
                if comm.startswith(name[:15]):
                    try:
                        out.setdefault(engine, []).append(len(os.listdir(f'/proc/{pid}/fd')))
                    except OSError:
                        out.setdefault(engine, []).append(None)
        return out

    def engine_cycle(self, server, engine):
        self.select(engine)
        out = {}
        out['raf_load'] = self.engine_load(self.assign(server, 'raf'), 'raf')
        out['raf'] = self.engine_window(3.0)
        out['scroll_load'] = self.engine_load(self.assign(server, 'scroll'), 'scroll')
        out['scroll'] = self.engine_window(0, during=self.wheel)
        out['static_load'] = self.engine_load(self.assign(server, 'static'), 'static')
        # Pixel content of the engine view on screen (the static page: dark text on a light page),
        # so a path that delivers frames but shows black (cef-feel-2's memfd regression) fails.
        box = self.chrome_script(self.ENGINE_VIEW_BOX)
        shot = self.screenshot(f'soak-{engine}-static')
        out['pixels'] = {**gui_test.view_pixels(shot, [box['x'], box['y'], box['w'], box['h']]), 'view_engine': box['engine']}
        out['key_load'] = self.engine_load(self.assign(server, 'text'), 'text')
        out['key'] = self.engine_key_latency(self.args.samples)
        out['diagnostics'] = self.chrome_script(DIAGNOSTICS)
        return out

    def gecko_cycle(self):
        self.select('gecko')
        self.content_script(zen_bench.RAF_START)
        time.sleep(2.0)
        data = self.content_script(zen_bench.RAF_STOP)
        iv = data['intervals']
        return dict(fps=round((data['frames'] - 1) / data['seconds'], 2) if data['seconds'] else None,
                    interval_p99_ms=bench.pct(iv, 99))

    def check(self, cycle, engine, record, problems):
        d = record['diagnostics']
        fps = record['raf'].get('fps')
        if not fps or fps < self.args.min_fps:
            problems.append(f'cycle {cycle} {engine}: rAF fps {fps} < {self.args.min_fps}')
        if not record['scroll'].get('frames'):
            problems.append(f'cycle {cycle} {engine}: no frame in the scroll window')
        if d.get('failure') or d.get('failures'):
            problems.append(f'cycle {cycle} {engine}: presenter failure {d.get("failure") or d.get("failures")}')
        if self.args.expect_transport and d.get('frameTransport') != self.args.expect_transport:
            problems.append(f'cycle {cycle} {engine}: transport {d.get("frameTransport")} != {self.args.expect_transport}')
        if d.get('memfdFallback'):
            problems.append(f'cycle {cycle} {engine}: memfd fallback {d["memfdFallback"]}')
        pixels = record.get('pixels') or {}
        if not pixels.get('content') or pixels.get('view_engine') != engine:
            problems.append(f'cycle {cycle} {engine}: no page content on screen {pixels}')
        if record['key']['keys_without_frame']:
            problems.append(f'cycle {cycle} {engine}: {record["key"]["keys_without_frame"]} keys without a frame')

    def soak(self, executable, app_info):
        self.result['app'] = {'executable': str(executable), **app_info}
        gui_test.SESSION_ROOT.mkdir(parents=True, exist_ok=True)
        server = bench.FixtureServer()
        engines = [e for e in self.args.engines.split(',') if e]
        problems, cycles = [], []
        try:
            with OwnedSession(gui_test.SESSION_ROOT / ('soak-' + secrets.token_hex(8))) as session:
                self.fixture = server
                self.result['session'] = str(session.path)
                profile = private_directory(session.path / 'gecko')
                (profile / '.axiosozo-dev-profile').touch(mode=0o600)
                try:
                    self.start_display(session)
                    self.launch(session, executable, profile)
                    self.find_window()
                    self.result['soak']['parent_kind'] = bench.proc_table().get(self.browser.pid, {}).get('comm')
                    self.engine.prepare(self)
                    self.xdotool('windowraise', self.window)
                    self.xdotool('windowfocus', '--sync', self.window)
                    self.handles['gecko'] = self.open_tab(self.assign(server, 'raf'))
                    self.wait(lambda: (self.chrome_script('return gBrowser.selectedBrowser.contentTitle;') or '').startswith('bench:raf'),
                              'the Gecko rAF tab')
                    self.result['soak']['opened'] = {engine: self.open_engine(server, engine) for engine in engines}
                    self.result['soak']['memfd_latch_at_start'] = self.chrome_script(LATCH)
                    started = time.monotonic()
                    while time.monotonic() - started < self.args.minutes * 60 or len(cycles) < 2:
                        index = len(cycles) + 1
                        print(f'soak cycle {index} at {round(time.monotonic() - started)} s', flush=True)
                        cycle = dict(index=index, t=round(time.monotonic() - started, 1))
                        try:
                            for engine in engines:
                                cycle[engine] = self.engine_cycle(server, engine)
                                self.check(index, engine, cycle[engine], problems)
                            cycle['gecko'] = self.gecko_cycle()
                        except (AssertionError, gui_test.MarionetteError, subprocess.SubprocessError, OSError, KeyError,
                                TypeError) as error:
                            problems.append(f'cycle {index}: {type(error).__name__}: {error}')
                            cycle['error'] = f'{type(error).__name__}: {error}'
                        cycle['memory'] = self.memory()
                        cycle['host_fds'] = self.host_fds()
                        cycles.append(cycle)
                        if cycle.get('error'):
                            break
                    self.result['soak']['memfd_latch_at_end'] = self.chrome_script(LATCH)
                    self.screenshot('soak-end')
                finally:
                    if getattr(self, 'xtest', None):
                        self.xtest.close()
                    self.shutdown()
            self.result['cleanup'] = session.cleanup_report
        finally:
            server.close()
        self.result['soak']['cycles'] = cycles
        self.result['soak']['minutes'] = self.args.minutes
        # Leak checks: from the second cycle (warm) to the last.
        if len(cycles) >= 3:
            rss = [c['memory']['rss_mb'] for c in cycles]
            growth = round(rss[-1] - rss[1], 1)
            self.result['soak']['rss_growth_mb'] = growth
            if growth > self.args.max_rss_growth_mb:
                problems.append(f'RSS grew {growth} MB (> {self.args.max_rss_growth_mb}) from cycle 2 to {len(cycles)}')
            for engine in engines:
                counts = [sum(v for v in c['host_fds'].get(engine, []) if v is not None) for c in cycles[1:]]
                if counts:
                    self.result['soak'].setdefault('host_fds', {})[engine] = dict(min=min(counts), max=max(counts), last=counts[-1])
                    if max(counts) - min(counts) > self.args.max_fd_growth:
                        problems.append(f'{engine} host descriptors {min(counts)} -> {max(counts)}')
        self.result['soak']['problems'] = problems
        self.result['soak']['summary'] = summarize(cycles, engines, self.result['soak'].get('parent_kind'))
        return not problems and len(cycles) >= 2


def summarize(cycles, engines, parent_kind=None):
    """Medians over the cycles: the multi-tab numbers (2 engine tabs + 1 Gecko tab in one window)."""
    out = {}
    for engine in engines:
        rows = [c[engine] for c in cycles if engine in c]
        out[engine] = dict(
            cycles=len(rows),
            raf_fps=median([r['raf'].get('fps') for r in rows]),
            raf_interval_p99_ms=median([r['raf'].get('interval_p99_ms') for r in rows]),
            raf_cpu_percent=median([r['raf']['usage']['cpu_percent'] for r in rows]),
            raf_parent_cpu_percent=median([(r['raf']['usage']['cpu_percent_by_kind'] or {}).get(parent_kind) for r in rows]),
            raf_draw_ms=median([r['raf']['presenter'].get('meanDrawMilliseconds') for r in rows]),
            scroll_fps=median([r['scroll'].get('fps_input', r['scroll'].get('fps')) for r in rows]),
            scroll_interval_p99_ms=median([r['scroll'].get('interval_p99_input_ms', r['scroll'].get('interval_p99_ms')) for r in rows]),
            scroll_input_span_s=median([(r['scroll'].get('input_pacing') or {}).get('send_span_s') for r in rows]),
            static_navigate_to_visible_ms=median([r['static_load']['timing'].get('navigate_to_visible_ms') for r in rows]),
            key_to_frame_ms=median([(r['key']['keydown_to_presented_frame_ms'] or {}).get('median') for r in rows]),
            transport=sorted({r['diagnostics'].get('frameTransport') for r in rows} - {None}),
            upload=sorted({r['diagnostics'].get('frameUpload') for r in rows} - {None}))
    gecko = [c['gecko'] for c in cycles if 'gecko' in c]
    out['gecko'] = dict(cycles=len(gecko), raf_fps=median([g['fps'] for g in gecko]),
                        raf_interval_p99_ms=median([g['interval_p99_ms'] for g in gecko]))
    if cycles:
        out['rss_mb_first_last'] = [cycles[0]['memory']['rss_mb'], cycles[-1]['memory']['rss_mb']]
        out['rss_mb_by_kind_last'] = cycles[-1]['memory'].get('rss_mb_by_kind')
    return out


def markdown(result):
    s = result.get('soak', {})
    lines = [f"# Pixel-path soak: {result.get('status')} ({result.get('label')})", '',
             f"{len(s.get('cycles', []))} cycles over {s.get('minutes')} min; test prefs: "
             f"{json.dumps((result.get('test_prefs') or {}).get('prefs'))}; RSS growth (cycle 2 -> last): "
             f"{s.get('rss_growth_mb')} MB; host fds: {json.dumps(s.get('host_fds'))}", '',
             '| Engine tab (median over cycles) | rAF fps | rAF p99 ms | rAF CPU % | parent CPU % | draw ms | scroll fps | '
             'scroll p99 ms | static nav->visible ms | key->frame ms | transport |',
             '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |']
    for engine, row in (s.get('summary') or {}).items():
        if engine in ('gecko', 'rss_mb_first_last', 'rss_mb_by_kind_last'):
            continue
        lines.append(f"| {engine} | {row['raf_fps']} | {row['raf_interval_p99_ms']} | {row['raf_cpu_percent']} | "
                     f"{row['raf_parent_cpu_percent']} | {row['raf_draw_ms']} | {row['scroll_fps']} | {row['scroll_interval_p99_ms']} | "
                     f"{row['static_navigate_to_visible_ms']} | {row['key_to_frame_ms']} | {','.join(row['transport'])} {','.join(row.get('upload', []))} |")
    gecko = (s.get('summary') or {}).get('gecko')
    if gecko:
        lines.append(f"| gecko (in-page) | {gecko['raf_fps']} | {gecko['raf_interval_p99_ms']} | | | | | | | | |")
    lines += ['', 'Problems: ' + ('none' if not s.get('problems') else '; '.join(s['problems'][:20]))]
    return '\n'.join(lines) + '\n'


def main():
    engines = gui_engines.engines()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--app', default='fetched')
    parser.add_argument('--out', required=True)
    parser.add_argument('--minutes', type=float, default=10)
    parser.add_argument('--engines', default='webkit,chromium', help='engine tabs, in cycle order')
    parser.add_argument('--label', default='soak')
    parser.add_argument('--samples', type=int, default=5, help='keys per key-latency window')
    parser.add_argument('--size', default='1280x800')
    parser.add_argument('--timeout', type=float, default=60)
    parser.add_argument('--launch-timeout', type=float, default=240)
    parser.add_argument('--min-fps', type=float, default=15)
    parser.add_argument('--max-rss-growth-mb', type=float, default=400)
    parser.add_argument('--max-fd-growth', type=int, default=16)
    parser.add_argument('--expect-transport', choices=('memfd', 'pipe'), help='every engine tab must keep this frame transport')
    parser.add_argument('--wheel', choices=('xtest', 'xdotool'), default='xtest')
    parser.add_argument('--chrome-overlay', help='report of scripts/webkit_package.py overlay-chrome (TEST-ONLY), recorded')
    parser.add_argument('--device-scale', type=float, help='TEST-ONLY layout.css.devPixelsPerPx (recorded)')
    parser.add_argument('--pref', action='append', default=[], metavar='NAME=VALUE',
                        help='TEST-ONLY pref (axiosozo.engines.* only), recorded')
    args = parser.parse_args()
    extra_prefs = {}
    for item in args.pref:
        name, _, value = item.partition('=')
        if not name.startswith('axiosozo.engines.'):
            parser.error(f'--pref {name}: not an engine test pref')
        extra_prefs[name] = {'true': True, 'false': False}.get(value, int(value) if value.isdigit() else value)
    gui_test.TEST_PREFS.update(extra_prefs)
    if args.device_scale:
        gui_test.TEST_PREFS['layout.css.devPixelsPerPx'] = str(args.device_scale)
    args.screenshot, args.hold, args.reps = None, 0, 1
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    # The WebKit plug-in adds the Chromium facade when the CEF host is built (three engines in one window).
    harness = Soak(args, engines['webkit' if 'webkit' in args.engines else 'chromium'], out)
    status = 'FAIL'
    try:
        if not gui_test.storage.LINUX:
            raise gui_test.Blocked('Linux only (Xvfb)')
        gui_test.storage.ensure()
        executable, info = gui_test.resolve_app(args.app)
        status = 'PASS' if harness.soak(executable, info) else 'FAIL'
    except gui_engines.EngineUnavailable as error:
        status, harness.result['reason'] = 'BLOCKED_ENV', str(error)
    except gui_test.Blocked as error:
        status, harness.result['reason'] = 'BLOCKED_ENV', str(error)
    except (RuntimeError, OSError, subprocess.SubprocessError, AssertionError, gui_test.MarionetteError) as error:
        harness.result['reason'] = f'{type(error).__name__}: {error}'
    if args.chrome_overlay and Path(args.chrome_overlay).is_file():
        overlay = json.loads(Path(args.chrome_overlay).read_text())
        harness.result['chrome_overlay'] = {key: overlay.get(key) for key in ('label', 'overlay_commit', 'app_build_commit')}
    if extra_prefs:
        harness.result['test_prefs'] = {'prefs': extra_prefs, 'label': 'TEST-ONLY prefs (soak --pref)'}
    if args.device_scale:
        harness.result['device_scale_pref'] = {'layout.css.devPixelsPerPx': str(args.device_scale), 'size': args.size,
                                               'label': 'TEST-ONLY rendering scale pref'}
    harness.result.update(status=status, schema='axiosozo-pixel-path-soak-v1', label=args.label, E1='NOT_TESTED',
                          E2='NOT_TESTED', machine=bench.machine())
    (out / f'soak-{args.label}.json').write_text(json.dumps(harness.result, indent=1) + '\n')
    (out / f'soak-{args.label}.md').write_text(markdown(harness.result))
    print(json.dumps(dict(component='pixel-path-soak', status=status, reason=harness.result.get('reason'),
                          problems=harness.result.get('soak', {}).get('problems', [])[:10])))
    return {'PASS': 0, 'BLOCKED_ENV': 2}.get(status, 1)


if __name__ == '__main__':
    sys.exit(main())
