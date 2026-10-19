#!/usr/bin/env python3
"""Integrated benchmark: the bench fixtures in tabs of the real Linux AxioSozo (Zen/Gecko) app.

Reuses the GUI harness (scripts/gui_test.py: Xvfb, owned throwaway profile, Marionette,
xdotool) and its engine plug-ins (scripts/gui_engines). Per fixture and repetition, in a
fresh tab: page-load-to-visible (navigation timing + first-contentful-paint, and the
harness wall time to the page title), rAF cadence, scroll cadence under real X11 wheel
input (xdotool button 5), key-to-next-frame latency under real X11 key input, CPU% of
the whole app process tree during the scroll window, and total RSS/PSS of every app
process. Gecko tabs measure in-page (performance.now, rAF); an engine whose plug-in is
not implemented yet reports BLOCKED_ENV. Test-only switches are the harness's
(-marionette, --remote-allow-system-access, throwaway profile); nothing else changes.

usage: zen_bench.py --engine gecko --app fetched|PATH --out DIR [--reps 5]
"""
import argparse
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
sys.path.insert(0, str(ROOT / 'scripts'))  # gui_test imports scripts/fixtures.py; never shadow it with ./fixtures

import importlib.util  # noqa: E402
_spec = importlib.util.spec_from_file_location('engine_bench', HERE / 'bench.py')
bench = importlib.util.module_from_spec(_spec)  # fixture server, process accounting, statistics
_spec.loader.exec_module(bench)
import gui_test  # noqa: E402
import gui_engines  # noqa: E402
from gui_engines import EngineUnavailable  # noqa: E402
from session import OwnedSession, private_directory  # noqa: E402

TIMING = """
const nav = performance.getEntriesByType('navigation')[0] || {};
const fcp = performance.getEntriesByName('first-contentful-paint')[0];
return {title: document.title, responseStart: nav.responseStart ?? null, domContentLoaded: nav.domContentLoadedEventEnd ?? null,
        loadEventEnd: nav.loadEventEnd ?? null, firstContentfulPaint: fcp ? fcp.startTime : null,
        elements: document.getElementsByTagName('*').length, devicePixelRatio: devicePixelRatio,
        viewport: [innerWidth, innerHeight]};
"""
# Starts an in-page rAF recorder (window.__axioBench) and returns immediately.
RAF_START = """
const state = window.__axioBench = {times: [], scroll0: scrollY, keys: [], running: true};
function tick(t) { state.times.push(t); if (state.running) requestAnimationFrame(tick); }
requestAnimationFrame(tick);
return true;
"""
RAF_STOP = """
const state = window.__axioBench; state.running = false;
const t = state.times, iv = t.slice(1).map((v, i) => v - t[i]);
return {frames: t.length, seconds: t.length > 1 ? (t[t.length - 1] - t[0]) / 1000 : 0, intervals: iv,
        scrolled: scrollY - state.scroll0};
"""
# Key -> next frames: keydown handler time, then the second rAF after the event (the frame
# that contains the DOM change has been handed to the compositor by then).
KEY_START = """
const keys = window.__axioKeys = [];
addEventListener('keydown', event => {
  const item = {stamp: event.timeStamp, handler: performance.now()};
  keys.push(item);
  requestAnimationFrame(() => requestAnimationFrame(t => { item.frame = performance.now(); item.raf = t; }));
}, true);
return true;
"""
KEY_READ = 'return window.__axioKeys || [];'


def describe_list(values):
    return bench.describe([v for v in values if v is not None])


class ZenBench(gui_test.Harness):
    def __init__(self, args, engine, evidence):
        super().__init__(args, engine, evidence)
        self.result.update(harness='axiosozo-zen-bench', bench={})

    def async_content(self, script, args=()):
        self.set_context('content')
        return self.marionette.call('WebDriver:ExecuteAsyncScript', {'script': script, 'args': list(args)})['value']

    def app_usage(self):
        return bench.Usage(self.browser.pid)

    def load(self, server, fixture):
        # Alternate the two admitted fixture URLs (the engine hosts' fixture policy), one new document per load.
        self.loads = getattr(self, 'loads', 0) + 1
        path = bench.FixtureServer.PATHS[self.loads % 2]
        server.assign(path, fixture)
        url = server.origin + path
        t0 = time.monotonic()
        if self.engine.name == 'gecko' and getattr(self, 'bench_tab', None):
            self.set_context('content')  # reuse one tab: navigation, not tab creation, is measured
            self.marionette.call('WebDriver:Navigate', {'url': url})
            shown = True
        else:
            shown = self.engine.show(self, url)
            self.bench_tab = True
        title = self.wait(lambda: (lambda value: value if value and value.startswith('bench:' + fixture) else None)(
            self.engine.content_title(self)), 'title of the ' + fixture + ' fixture')
        wall = round((time.monotonic() - t0) * 1000, 1)
        timing = self.content_script(TIMING) if self.engine.name == 'gecko' else {}
        return dict(navigate_to_title_wall_ms=wall, title=title, timing=timing, shown=bool(shown))

    def raf_window(self, seconds, during=None):
        self.content_script(RAF_START)
        usage = self.app_usage()
        start = usage.snapshot()
        if during:
            during()
        else:
            time.sleep(seconds)
        end = usage.snapshot(memory=True)
        data = self.content_script(RAF_STOP)
        iv = data['intervals']
        out = dict(frames=data['frames'], fps=round((data['frames'] - 1) / data['seconds'], 2) if data['seconds'] else None,
                   interval_ms=describe_list(iv), interval_p99_ms=bench.pct(iv, 99),
                   long_intervals_share=round(sum(1 for v in iv if v > 25) / len(iv), 4) if iv else None,
                   scrolled_css_px=data['scrolled'], usage=bench.Usage.window(start, end))
        return out

    def wheel(self, count=120, delay_ms=16):
        point = self.chrome_script('const r = gBrowser.selectedBrowser.getBoundingClientRect();'
                                   'return [Math.round((window.mozInnerScreenX + r.left + r.width / 2) * devicePixelRatio),'
                                   ' Math.round((window.mozInnerScreenY + r.top + r.height / 2) * devicePixelRatio)];')
        self.xdotool('mousemove', '--sync', point[0], point[1])
        self.xdotool('click', '--repeat', count, '--delay', delay_ms, '5')

    def key_latency(self, samples):
        target = self.element_screen_point('#t')
        self.xdotool('mousemove', '--sync', target[0], target[1])
        self.xdotool('click', '1')
        self.content_script(KEY_START)
        for _ in range(samples):
            self.xdotool('key', 'a')
            time.sleep(0.15)
        time.sleep(0.3)
        keys = self.content_script(KEY_READ)
        return dict(samples=len(keys),
                    keydown_to_second_raf_ms=describe_list([k['frame'] - k['stamp'] for k in keys if 'frame' in k]),
                    event_to_handler_ms=describe_list([k['handler'] - k['stamp'] for k in keys]))

    def memory(self):
        snap = self.app_usage().snapshot(memory=True)
        return bench.Usage.window(snap, snap)

    def repetition(self, server, index, samples):
        rep = dict(index=index)
        try:
            for fixture in ('static', 'image', 'dom'):
                rep[fixture] = self.load(server, fixture)
                rep[fixture]['idle_raf'] = self.raf_window(1.5)
            rep['raf'] = dict(load=self.load(server, 'raf'), window=self.raf_window(3.0))
            rep['scroll'] = dict(load=self.load(server, 'scroll'), window=self.raf_window(0, during=self.wheel))
            rep['image_scroll'] = dict(load=self.load(server, 'image'), window=self.raf_window(0, during=self.wheel))
            rep['key'] = dict(load=self.load(server, 'text'), **self.key_latency(samples))
            rep['memory_all_processes'] = self.memory()
            rep['status'] = 'PASS'
        except EngineUnavailable as error:
            rep.update(status='BLOCKED_ENV', reason=str(error))
        except (AssertionError, gui_test.MarionetteError, subprocess.SubprocessError, OSError, KeyError, TypeError) as error:
            rep.update(status='FAIL', reason=f'{type(error).__name__}: {error}')
        return rep

    def bench(self, executable, app_info, reps, samples):
        self.result['app'] = {'executable': str(executable), **app_info}
        gui_test.SESSION_ROOT.mkdir(parents=True, exist_ok=True)
        server = bench.FixtureServer()
        try:
            with OwnedSession(gui_test.SESSION_ROOT / ('bench-' + secrets.token_hex(8))) as session:
                profile = private_directory(session.path / 'gecko')
                (profile / '.axiosozo-dev-profile').touch(mode=0o600)
                try:
                    self.start_display(session)
                    t0 = time.monotonic()
                    self.launch(session, executable, profile)
                    self.result['bench']['launch_to_marionette_ms'] = round((time.monotonic() - t0) * 1000)
                    self.result['bench']['window'] = self.find_window()
                    self.result['bench']['launch_to_window_ms'] = round((time.monotonic() - t0) * 1000)
                    self.result['bench']['memory_at_start'] = self.memory()
                    try:
                        self.engine.prepare(self)
                    except EngineUnavailable as error:
                        self.result['bench']['engine_prepare'] = {'status': 'BLOCKED_ENV', 'reason': str(error)}
                    self.xdotool('windowraise', self.window)
                    self.xdotool('windowfocus', '--sync', self.window)
                    reps_out = []
                    for index in range(reps):
                        print(f'zen-bench {self.engine.name} repetition {index + 1}/{reps}', flush=True)
                        reps_out.append(self.repetition(server, index, samples))
                        print('  ->', reps_out[-1]['status'], reps_out[-1].get('reason', ''), flush=True)
                        if reps_out[-1]['status'] == 'BLOCKED_ENV':
                            break
                    self.result['bench']['repetitions'] = reps_out
                    self.result['bench']['memory_at_end'] = self.memory()
                    self.screenshot('zen-bench-' + self.engine.name)
                finally:
                    self.shutdown()
            self.result['cleanup'] = session.cleanup_report
        finally:
            server.close()


def summarize(reps):
    ok = [r for r in reps if r.get('status') == 'PASS']
    keys = ['static.timing.firstContentfulPaint', 'static.timing.loadEventEnd', 'static.navigate_to_title_wall_ms',
            'image.timing.firstContentfulPaint', 'image.timing.loadEventEnd', 'image.navigate_to_title_wall_ms',
            'dom.timing.firstContentfulPaint', 'dom.timing.loadEventEnd', 'dom.navigate_to_title_wall_ms',
            'static.idle_raf.fps', 'raf.window.fps', 'raf.window.interval_ms.median', 'raf.window.interval_p99_ms',
            'raf.window.long_intervals_share', 'raf.window.usage.cpu_percent',
            'scroll.window.fps', 'scroll.window.interval_p99_ms', 'scroll.window.long_intervals_share',
            'scroll.window.scrolled_css_px', 'scroll.window.usage.cpu_percent',
            'image_scroll.window.fps', 'image_scroll.window.interval_p99_ms', 'image_scroll.window.usage.cpu_percent',
            'key.keydown_to_second_raf_ms.median', 'key.keydown_to_second_raf_ms.p95', 'key.event_to_handler_ms.median',
            'memory_all_processes.rss_mb', 'memory_all_processes.pss_mb', 'memory_all_processes.processes']
    return {key: bench.describe(bench.collect(ok, key)) for key in keys if bench.collect(ok, key)}


def main():
    engines = gui_engines.engines()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--engine', default='gecko', choices=sorted(engines))
    parser.add_argument('--app', default='fetched')
    parser.add_argument('--out', required=True)
    parser.add_argument('--reps', type=int, default=5)
    parser.add_argument('--samples', type=int, default=20)
    parser.add_argument('--size', default='1280x800')
    parser.add_argument('--timeout', type=float, default=60)
    parser.add_argument('--launch-timeout', type=float, default=240)
    args = parser.parse_args()
    args.screenshot, args.hold = None, 0
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    harness = ZenBench(args, engines[args.engine], out)
    status = 'FAIL'
    try:
        if not gui_test.storage.LINUX:
            raise gui_test.Blocked('Linux only (Xvfb)')
        gui_test.storage.ensure()
        executable, info = gui_test.resolve_app(args.app)
        harness.bench(executable, info, args.reps, args.samples)
        reps = harness.result['bench'].get('repetitions', [])
        statuses = {r['status'] for r in reps}
        status = 'PASS' if reps and statuses == {'PASS'} else 'BLOCKED_ENV' if 'BLOCKED_ENV' in statuses else 'FAIL'
        harness.result['summary'] = summarize(reps)
    except gui_test.Blocked as error:
        status, harness.result['reason'] = 'BLOCKED_ENV', str(error)
    except (RuntimeError, OSError, subprocess.SubprocessError, AssertionError, gui_test.MarionetteError) as error:
        harness.result['reason'] = f'{type(error).__name__}: {error}'
    harness.result.update(status=status, schema='axiosozo-zen-bench-v1', E1='NOT_TESTED', E2='NOT_TESTED',
                          machine=bench.machine())
    (out / f'zen-bench-{args.engine}.json').write_text(json.dumps(harness.result, indent=1) + '\n')
    print(json.dumps(dict(component='zen-bench', engine=args.engine, status=status, reason=harness.result.get('reason'))))
    return {'PASS': 0, 'BLOCKED_ENV': 2}.get(status, 1)


if __name__ == '__main__':
    sys.exit(main())
