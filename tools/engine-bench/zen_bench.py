#!/usr/bin/env python3
"""Integrated benchmark: the bench fixtures in tabs of the real Linux AxioSozo (Zen/Gecko) app.

Reuses the GUI harness (scripts/gui_test.py: Xvfb, owned throwaway profile, Marionette,
xdotool) and its engine plug-ins (scripts/gui_engines). Per fixture and repetition, in a
fresh tab: page-load-to-visible (navigation timing + first-contentful-paint, and the
harness wall time to the page title), rAF cadence, scroll cadence under real X11 wheel
input (xdotool button 5), key-to-next-frame latency under real X11 key input, tab
switch time, CPU% of the whole app process tree (engine hosts included) during each
window, and total RSS/PSS of every app process.

Gecko tabs measure in-page (performance.now, rAF, navigation timing). Chromium and WebKit
tabs are switched with Zen's own engine switch (the fixture-mode facade
`window.AxioSozo.engineProbe` that the GUI plug-ins use); their pages are not reachable
from Gecko, so they measure from Zen's chrome side: the presenter's engine-reported state
(frame counter, title) sampled every 2 ms by a chrome timer, chrome keydown timestamps
for keys routed to the presenter canvas, and the switch promises' durations. Both views
are labelled in the JSON (`measured_in`). An engine whose plug-in or host is missing
reports BLOCKED_ENV. Test-only switches are the harness's (-marionette,
--remote-allow-system-access, throwaway profile) and the plug-ins' (fixture mode, the
WebKit pref); nothing else changes.

usage: zen_bench.py --engine gecko|chromium|webkit --app fetched|PATH --out DIR [--reps 5]
"""
import argparse
import ctypes
import ctypes.util
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

# ---- Engine (Chromium/WebKit) tabs: Zen chrome-side view of the presenter ----------------------
# Engine-reported state of the selected tab's presenter: frame counter and title.
PRESENTED = """
const probe = window.AxioSozo?.engineProbe;
const n = probe?.diagnostics?.().native ?? {};
return {engine: n.engine ?? null, frames: n.frames ?? null, title: n.title ?? gBrowser.selectedTab.label,
        tabEngine: probe?.engineOf?.(gBrowser.selectedTab) ?? null, renderPath: n.renderPath ?? null,
        meanDrawMilliseconds: n.meanDrawMilliseconds ?? null, uploadedPixelShare: n.uploadedPixelShare ?? null,
        firstFrameMilliseconds: n.firstFrameMilliseconds ?? null,
        // Pipe presenters (EngineFrameSurface): frames replaced before a paint, and the render surface.
        supersededFrames: n.supersededFrames ?? null, surface: n.surface ?? null,
        frameTransport: n.frameTransport ?? null, memfdFallback: n.memfdFallback ?? null,
        frameUpload: n.frameUpload ?? null};
"""
# A 2 ms chrome timer records every change of the presenter's frame counter (the canvas got
# a new engine frame) and every chrome keydown (keys routed to the presenter canvas).
SAMPLER_START = """
const probe = window.AxioSozo.engineProbe;
const read = () => { const n = probe.diagnostics().native ?? {};
  return {frames: n.frames ?? 0, title: n.title ?? gBrowser.selectedTab.label}; };
if (window.__axioSampler) clearInterval(window.__axioSampler.timer);
const first = read();
const state = window.__axioSampler = {t0: performance.now(), frames0: first.frames, last: first.frames, title: first.title,
  changes: [], titles: [], keys: [], marks: {}};
state.onkey = event => { if (event.type === 'keydown') state.keys.push({stamp: event.timeStamp, now: performance.now(), frames: state.last}); };
window.addEventListener('keydown', state.onkey, true);
state.timer = setInterval(() => {
  const now = performance.now(), value = read();
  if (value.frames !== state.last) { state.changes.push([now, value.frames - state.last]); state.last = value.frames; }
  if (value.title !== state.title) { state.titles.push([now, value.title]); state.title = value.title; }
}, 2);
return {t0: state.t0, frames: first.frames, title: first.title};
"""
SAMPLER_MARK = 'window.__axioSampler.marks[arguments[0]] = performance.now(); return window.__axioSampler.marks[arguments[0]];'
SAMPLER_STOP = """
const state = window.__axioSampler; clearInterval(state.timer);
window.removeEventListener('keydown', state.onkey, true); window.__axioSampler = null;
return {t0: state.t0, t1: performance.now(), frames0: state.frames0, frames1: state.last, changes: state.changes,
        titles: state.titles, keys: state.keys, marks: state.marks};
"""
# Navigate the engine tab (fixture URLs only, enforced by the presenter) without awaiting it.
ENGINE_NAVIGATE = """
const [url] = arguments; const mark = performance.now();
window.__axioNavigate = window.AxioSozo.engineProbe.navigate(url).then(() => null, error => String(error?.message ?? error));
return mark;
"""
# Duration of a Zen engine switch of the selected tab (the promise resolves once the target
# engine shows the tab: for WebKit/Chromium, after the first presented frame).
SWITCH = """
const [engine, done] = arguments; const t0 = performance.now();
// switchToX exists on both facades: the Chromium-only one (EngineProbeControls) and the
// three-engine one (WebKitEngineControls); switchTo(engine) only on the latter.
const probe = window.AxioSozo.engineProbe;
probe[{gecko: 'switchToGecko', chromium: 'switchToChromium', webkit: 'switchToWebKit'}[engine]]().then(
  () => done({ok: true, ms: performance.now() - t0}),
  error => done({ok: false, ms: performance.now() - t0, error: String(error?.message ?? error)}));
"""
# Tab switch: select a tab; records when Firefox's TabSwitchDone fires (the tab's content
# layers are shown; vsync-quantized) and the first chrome MozAfterPaint after the selection
# (what shows an engine presenter's canvas, which lives in the chrome document). TabSwitchDone
# does not fire for a tab whose Gecko browser is hidden behind an engine presenter.
TAB_SWITCH = """
const [index, done] = arguments; const tab = gBrowser.tabs[index]; const t0 = performance.now();
const out = {tabSwitchDone: null, chromePaint: null, engine: null};
let settled = false;
const finish = how => { if (settled) return; settled = true; window.removeEventListener('MozAfterPaint', paint);
  out.engine = window.AxioSozo?.engineProbe?.engineOf?.(tab) ?? 'gecko'; out.signal = how; done(out); };
const paint = () => { if (out.chromePaint === null) out.chromePaint = performance.now() - t0;
  if (out.engine === 'presented') finish('MozAfterPaint'); };
gBrowser.addEventListener('TabSwitchDone', () => { out.tabSwitchDone = performance.now() - t0; finish('TabSwitchDone'); }, {once: true});
window.addEventListener('MozAfterPaint', paint);
setTimeout(() => finish('timeout-1s'), 1000);
const presented = (window.AxioSozo?.engineProbe?.engineOf?.(tab) ?? 'gecko') !== 'gecko';
gBrowser.selectedTab = tab;
if (presented) out.engine = 'presented';
"""


def describe_list(values):
    return bench.describe([v for v in values if v is not None])


class XTestWheel:
    """Wheel clicks injected with XTest at an explicit cadence (docs/PERFORMANCE.md bottleneck 3).

    `xdotool click --repeat` took 1.95 s for 120 clicks in a first window and 17.03 s in later
    ones (in Gecko too), so scroll windows were not a render measure. Here every press/release
    pair is scheduled against the monotonic clock from the window start (no drift), flushed at
    once, and its actual send time is recorded, so the result shows the input pacing that the
    frames were measured under. Same X server, same pointer position as xdotool.
    """

    def __init__(self, display):
        def load(name, soname):
            return ctypes.CDLL(ctypes.util.find_library(name) or soname)
        self.x11, self.xtst = load('X11', 'libX11.so.6'), load('Xtst', 'libXtst.so.6')
        self.x11.XOpenDisplay.restype = ctypes.c_void_p
        self.x11.XOpenDisplay.argtypes = [ctypes.c_char_p]
        self.x11.XFlush.argtypes = [ctypes.c_void_p]
        self.x11.XSync.argtypes = [ctypes.c_void_p, ctypes.c_int]
        self.x11.XCloseDisplay.argtypes = [ctypes.c_void_p]
        self.xtst.XTestFakeButtonEvent.argtypes = [ctypes.c_void_p, ctypes.c_uint, ctypes.c_int, ctypes.c_ulong]
        self.display = self.x11.XOpenDisplay(display.encode())
        if not self.display:
            raise OSError('XOpenDisplay failed for ' + display)

    def wheel(self, count, interval_s, button=5):
        sent, t0 = [], time.monotonic()
        for index in range(count):
            delay = t0 + index * interval_s - time.monotonic()
            if delay > 0:
                time.sleep(delay)
            self.xtst.XTestFakeButtonEvent(self.display, button, 1, 0)
            self.xtst.XTestFakeButtonEvent(self.display, button, 0, 0)
            self.x11.XFlush(self.display)
            sent.append(time.monotonic() - t0)
        self.x11.XSync(self.display, 0)
        return sent

    def close(self):
        if self.display:
            self.x11.XCloseDisplay(self.display)
            self.display = None


class ZenBench(gui_test.Harness):
    def __init__(self, args, engine, evidence):
        super().__init__(args, engine, evidence)
        self.result.update(harness='axiosozo-zen-bench', bench={})

    @property
    def native_engine(self):
        """Chromium/WebKit tabs are measured from Zen's chrome side; Gecko tabs in-page."""
        return self.engine.name != 'gecko'

    def async_content(self, script, args=()):
        self.set_context('content')
        return self.marionette.call('WebDriver:ExecuteAsyncScript', {'script': script, 'args': list(args)})['value']

    def async_chrome(self, script, args=()):
        self.set_context('chrome')
        return self.marionette.call('WebDriver:ExecuteAsyncScript', {'script': script, 'args': list(args)})['value']

    def presented(self):
        return self.chrome_script(PRESENTED)

    def switch_engine(self, engine):
        result = self.async_chrome(SWITCH, [engine])
        if not result.get('ok'):
            raise AssertionError(f'switch to {engine} failed: {result}')
        return round(result['ms'], 1)

    def close_bench_tab(self):
        """Close the selected tab and re-attach Marionette to a remaining one."""
        self.set_context('content')
        self.marionette.call('WebDriver:CloseWindow')
        handles = self.marionette.call('WebDriver:GetWindowHandles')
        handles = handles.get('value', handles) if isinstance(handles, dict) else handles
        self.marionette.call('WebDriver:SwitchToWindow', {'handle': handles[0], 'focus': True})

    def tab_switches(self, count=3):
        """Away to the first (Gecko, about:blank) tab and back, `count` times each way."""
        index = self.chrome_script('return gBrowser.tabs.indexOf(gBrowser.selectedTab);')
        away, back = [], []
        for _ in range(count):
            away.append(self.async_chrome(TAB_SWITCH, [0]))
            time.sleep(0.3)
            back.append(self.async_chrome(TAB_SWITCH, [index]))
            time.sleep(0.5)
        def ms(record):
            return record['tabSwitchDone'] if record['tabSwitchDone'] is not None else record['chromePaint']
        return dict(measured_in='zen-chrome: TabSwitchDone, else the first chrome MozAfterPaint (engine presenter tabs)',
                    to_gecko_blank_tab_ms=describe_list([ms(r) for r in away]),
                    back_to_bench_tab_ms=describe_list([ms(r) for r in back]),
                    back_chrome_paint_ms=describe_list([r['chromePaint'] for r in back]),
                    signals=sorted({r['signal'] for r in away + back}), engine_after=back[-1]['engine'], raw=away + back)

    def app_usage(self):
        return bench.Usage(self.browser.pid)

    def usage_window(self, start, end):
        """bench.Usage.window plus the Zen parent process's own share (its process kind)."""
        usage = bench.Usage.window(start, end)
        if getattr(self, 'parent_kind', None) is None:
            self.parent_kind = bench.proc_table().get(self.browser.pid, {}).get('comm')
            self.result['bench']['parent_kind'] = self.parent_kind
        usage['parent_cpu_percent'] = (usage.get('cpu_percent_by_kind') or {}).get(self.parent_kind)
        return usage

    def load(self, server, fixture):
        # Alternate the two admitted fixture URLs (the engine hosts' fixture policy), one new document per load.
        self.loads = getattr(self, 'loads', 0) + 1
        path = bench.FixtureServer.PATHS[self.loads % 2]
        server.assign(path, fixture)
        url = server.origin + path
        if self.native_engine:
            return self.engine_load(url, fixture)
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

    def open_engine_tab(self, server, fixture):
        """A new Gecko tab with the fixture, then Zen's engine switch of that tab (timed)."""
        self.loads = getattr(self, 'loads', 0) + 1
        path = bench.FixtureServer.PATHS[self.loads % 2]
        server.assign(path, fixture)
        url = server.origin + path
        self.open_tab(url)
        self.wait(lambda: (self.chrome_script('return gBrowser.selectedBrowser.contentTitle;') or '').startswith('bench:' + fixture),
                  'the ' + fixture + ' fixture in the Gecko tab before the switch')
        t0 = time.monotonic()
        switch_ms = self.switch_engine(self.engine.name)
        state = self.wait(lambda: (lambda p: p if p['engine'] == self.engine.name and str(p['title'] or '').startswith('bench:' + fixture)
                                   and (p['frames'] or 0) > 0 else None)(self.presented()),
                          self.engine.name + ' frames of the ' + fixture + ' fixture')
        return dict(gecko_to_engine_switch_ms=switch_ms, switch_to_title_wall_ms=round((time.monotonic() - t0) * 1000, 1),
                    presenter=state)

    def engine_load(self, url, fixture):
        """Navigate the engine tab; page-load-to-visible from the chrome-side sampler."""
        self.chrome_script(SAMPLER_START)
        t0 = time.monotonic()
        start = self.chrome_script(ENGINE_NAVIGATE, [url])
        self.wait(lambda: str(self.presented()['title'] or '').startswith('bench:' + fixture), 'title of the ' + fixture + ' fixture')
        wall = round((time.monotonic() - t0) * 1000, 1)
        time.sleep(0.4)  # frames that follow the title event
        data = self.chrome_script(SAMPLER_STOP)
        error = self.async_chrome('const done = arguments[arguments.length - 1]; window.__axioNavigate.then(done);')
        title_at = next((t for t, title in data['titles'] if str(title).startswith('bench:' + fixture)), None)
        frames = [t for t, _ in data['changes'] if t >= start]
        after = [t for t in frames if title_at is not None and t >= title_at]
        before = [t for t in frames if title_at is not None and t < title_at]
        visible, basis = (after[0], 'first frame after the title event') if after else \
            ((before[-1], 'last frame before the title event') if before else (None, 'no frame'))
        return dict(navigate_to_title_wall_ms=wall, title=self.presented()['title'], measured_in='zen-chrome',
                    timing=dict(navigate_to_title_ms=round(title_at - start, 1) if title_at is not None else None,
                                navigate_to_visible_ms=round(visible - start, 1) if visible is not None else None,
                                visible_basis=basis, frames_after_navigate=len(frames)), error=error)

    def engine_window(self, seconds, during=None):
        """Presented-frame cadence of the engine tab (frame-counter changes seen by the 2 ms sampler)."""
        self.chrome_script(SAMPLER_START)
        usage = self.app_usage()
        start = usage.snapshot()
        t0 = time.monotonic()
        pacing = during() if during else time.sleep(seconds)
        input_wall_s = round(time.monotonic() - t0, 3)
        end = usage.snapshot(memory=True)
        data = self.chrome_script(SAMPLER_STOP)
        window_s = (data['t1'] - data['t0']) / 1000
        times = [t for t, _ in data['changes']]
        iv = [b - a for a, b in zip(times, times[1:])]
        frames = data['frames1'] - data['frames0']
        # Over the active part only (first to last new frame), as the in-page rAF window does.
        active = (times[-1] - times[0]) / 1000 if len(times) > 1 else 0
        return dict(measured_in='zen-chrome (presenter frame counter, 2 ms sampler)', frames=frames, input_wall_s=input_wall_s,
                    canvas_updates=len(times), fps=round((len(times) - 1) / active, 2) if active else None,
                    fps_whole_window=round(frames / window_s, 2) if window_s else None,
                    interval_ms=describe_list(iv), interval_p99_ms=bench.pct(iv, 99),
                    long_intervals_share=round(sum(1 for v in iv if v > 25) / len(iv), 4) if iv else None,
                    multi_frame_updates=sum(1 for _, n in data['changes'] if n > 1),
                    presenter=self.presented(), usage=self.usage_window(start, end),
                    **({'input_pacing': pacing} if pacing else {}))

    def raf_window(self, seconds, during=None):
        if self.native_engine:
            return self.engine_window(seconds, during)
        self.content_script(RAF_START)
        usage = self.app_usage()
        start = usage.snapshot()
        t0 = time.monotonic()
        pacing = during() if during else time.sleep(seconds)
        input_wall_s = round(time.monotonic() - t0, 3)
        end = usage.snapshot(memory=True)
        data = self.content_script(RAF_STOP)
        iv = data['intervals']
        out = dict(frames=data['frames'], input_wall_s=input_wall_s, fps=round((data['frames'] - 1) / data['seconds'], 2) if data['seconds'] else None,
                   interval_ms=describe_list(iv), interval_p99_ms=bench.pct(iv, 99),
                   long_intervals_share=round(sum(1 for v in iv if v > 25) / len(iv), 4) if iv else None,
                   scrolled_css_px=data['scrolled'], usage=self.usage_window(start, end),
                   **({'input_pacing': pacing} if pacing else {}))
        return out

    def wheel(self, count=120, delay_ms=16):
        """`count` wheel-down clicks every `delay_ms` over the tab's content; returns the pacing."""
        point = self.chrome_script('const r = gBrowser.selectedBrowser.getBoundingClientRect();'
                                   'return [Math.round((window.mozInnerScreenX + r.left + r.width / 2) * devicePixelRatio),'
                                   ' Math.round((window.mozInnerScreenY + r.top + r.height / 2) * devicePixelRatio)];')
        self.xdotool('mousemove', '--sync', point[0], point[1])
        if getattr(self.args, 'wheel', 'xtest') == 'xtest':
            try:
                if getattr(self, 'xtest', None) is None:
                    self.xtest = XTestWheel(self.x_env['DISPLAY'])
                sent = self.xtest.wheel(count, delay_ms / 1000)
                gaps = [(b - a) * 1000 for a, b in zip(sent, sent[1:])]
                return dict(method='xtest', events=count, target_interval_ms=delay_ms,
                            send_span_s=round(sent[-1], 3) if sent else 0, send_interval_ms=describe_list(gaps),
                            late_events=sum(1 for g in gaps if g > 2 * delay_ms))
            except OSError as error:
                self.result.setdefault('notes', []).append(f'XTest wheel unavailable ({error}); xdotool click --repeat used')
        t0 = time.monotonic()
        self.xdotool('click', '--repeat', count, '--delay', delay_ms, '5')
        return dict(method='xdotool', events=count, target_interval_ms=delay_ms, send_span_s=round(time.monotonic() - t0, 3))

    def engine_key_latency(self, samples):
        """Chrome keydown (routed to the presenter canvas) -> next presented engine frame."""
        self.chrome_script('return window.AxioSozo.engineProbe.focus();')
        self.chrome_script(SAMPLER_START)
        for _ in range(samples):
            self.xdotool('key', 'a')
            time.sleep(0.15)
        time.sleep(0.3)
        data = self.chrome_script(SAMPLER_STOP)
        latencies = []
        for key in data['keys']:
            nxt = next((t for t, _ in data['changes'] if t >= key['stamp']), None)
            latencies.append(None if nxt is None else nxt - key['stamp'])
        return dict(samples=len(data['keys']), measured_in='zen-chrome', title=self.presented()['title'],
                    keydown_to_presented_frame_ms=describe_list(latencies),
                    keys_without_frame=sum(1 for v in latencies if v is None))

    def key_latency(self, samples):
        if self.native_engine:
            return self.engine_key_latency(samples)
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
            if self.native_engine:
                rep['switch'] = self.open_engine_tab(server, 'static')
            for fixture in ('static', 'image', 'dom'):
                rep[fixture] = self.load(server, fixture)
                rep[fixture]['idle_raf'] = self.raf_window(1.5)
            rep['raf'] = dict(load=self.load(server, 'raf'), window=self.raf_window(3.0))
            rep['scroll'] = dict(load=self.load(server, 'scroll'), window=self.raf_window(0, during=self.wheel))
            rep['image_scroll'] = dict(load=self.load(server, 'image'), window=self.raf_window(0, during=self.wheel))
            rep['key'] = dict(load=self.load(server, 'text'), **self.key_latency(samples))
            rep['memory_all_processes'] = self.memory()
            rep['tab_switch'] = self.tab_switches()
            if self.native_engine:
                rep['switch']['engine_to_gecko_switch_ms'] = self.switch_engine('gecko')
                time.sleep(1)
                rep['memory_after_switch_back'] = self.memory()
                self.close_bench_tab()
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
                # The engine plug-ins bind fixture mode to this origin and read the session path.
                self.fixture = server
                self.result['session'] = str(session.path)
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
                    if getattr(self, 'xtest', None):
                        self.xtest.close()
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
            'raf.window.long_intervals_share', 'raf.window.usage.cpu_percent', 'raf.window.usage.parent_cpu_percent',
            'scroll.window.usage.parent_cpu_percent', 'key.keydown_to_presented_frame_ms.p99',
            'scroll.window.fps', 'scroll.window.interval_p99_ms', 'scroll.window.long_intervals_share',
            'scroll.window.scrolled_css_px', 'scroll.window.usage.cpu_percent', 'scroll.window.input_wall_s',
            'image_scroll.window.input_wall_s', 'scroll.window.input_pacing.send_span_s',
            'scroll.window.input_pacing.send_interval_ms.p99', 'scroll.window.input_pacing.late_events',
            'image_scroll.window.fps', 'image_scroll.window.interval_p99_ms', 'image_scroll.window.usage.cpu_percent',
            'key.keydown_to_second_raf_ms.median', 'key.keydown_to_second_raf_ms.p95', 'key.event_to_handler_ms.median',
            'memory_all_processes.rss_mb', 'memory_all_processes.pss_mb', 'memory_all_processes.processes',
            'tab_switch.to_gecko_blank_tab_ms.median', 'tab_switch.back_to_bench_tab_ms.median']
    # Engine (Chromium/WebKit) tabs, measured from Zen's chrome side.
    keys += ['switch.gecko_to_engine_switch_ms', 'switch.engine_to_gecko_switch_ms',
             'static.timing.navigate_to_title_ms', 'static.timing.navigate_to_visible_ms',
             'image.timing.navigate_to_title_ms', 'image.timing.navigate_to_visible_ms',
             'dom.timing.navigate_to_title_ms', 'dom.timing.navigate_to_visible_ms',
             'raf.window.fps_whole_window', 'scroll.window.fps_whole_window', 'image_scroll.window.fps_whole_window',
             'raf.window.presenter.meanDrawMilliseconds', 'scroll.window.presenter.meanDrawMilliseconds',
             'raf.window.presenter.supersededFrames', 'scroll.window.presenter.supersededFrames',
             'raf.window.presenter.uploadedPixelShare', 'scroll.window.presenter.uploadedPixelShare',
             'raf.window.multi_frame_updates', 'scroll.window.multi_frame_updates',
             'key.keydown_to_presented_frame_ms.median', 'key.keydown_to_presented_frame_ms.p95',
             'memory_after_switch_back.rss_mb', 'memory_after_switch_back.processes']
    return {key: bench.describe(bench.collect(ok, key)) for key in keys if bench.collect(ok, key)}


def main():
    engines = gui_engines.engines()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--engine', default='gecko', choices=sorted(engines))
    parser.add_argument('--app', default='fetched')
    parser.add_argument('--out', required=True)
    parser.add_argument('--reps', type=int, default=5)
    parser.add_argument('--chrome-overlay', help='report of scripts/webkit_package.py overlay-chrome (TEST-ONLY), recorded in the result')
    parser.add_argument('--label', help='result name (default: the engine), e.g. gecko-debian')
    parser.add_argument('--samples', type=int, default=20)
    parser.add_argument('--size', default='1280x800')
    parser.add_argument('--wheel', choices=('xtest', 'xdotool'), default='xtest',
                        help='wheel injection: XTest at an explicit cadence (default; pacing recorded) or xdotool click --repeat')
    parser.add_argument('--timeout', type=float, default=60)
    parser.add_argument('--launch-timeout', type=float, default=240)
    parser.add_argument('--device-scale', type=float,
                        help='TEST-ONLY: layout.css.devPixelsPerPx in the throwaway profile (e.g. 2 with --size 2304x1440 '
                             'for a 2x content area like the component bench); recorded in the result')
    parser.add_argument('--pref', action='append', default=[], metavar='NAME=VALUE',
                        help='TEST-ONLY extra pref in the throwaway profile (true/false/int/string), recorded in the result; '
                             'only axiosozo.engines.* and layout.css.devPixelsPerPx are accepted')
    args = parser.parse_args()
    extra_prefs = {}
    for item in args.pref:
        name, _, value = item.partition('=')
        if not (name.startswith('axiosozo.engines.') or name == 'layout.css.devPixelsPerPx'):
            parser.error(f'--pref {name}: not an engine/scale test pref')
        extra_prefs[name] = {'true': True, 'false': False}.get(value, int(value) if value.isdigit() else value)
    gui_test.TEST_PREFS.update(extra_prefs)
    if args.device_scale:
        # A rendering-scale test pref only (no security, TLS, sandbox or isolation setting).
        gui_test.TEST_PREFS['layout.css.devPixelsPerPx'] = str(args.device_scale)
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
    label = args.label or args.engine
    if args.chrome_overlay and Path(args.chrome_overlay).is_file():
        overlay = json.loads(Path(args.chrome_overlay).read_text())
        harness.result['chrome_overlay'] = {key: overlay.get(key) for key in ('label', 'overlay_commit', 'app_build_commit')} | {
            'replaced': len(overlay.get('replaced') or []), 'added': len(overlay.get('added') or [])}
    if extra_prefs:
        harness.result['test_prefs'] = {'prefs': extra_prefs, 'label': 'TEST-ONLY prefs (zen_bench --pref)'}
    if args.device_scale:
        harness.result['device_scale_pref'] = {'layout.css.devPixelsPerPx': str(args.device_scale), 'size': args.size,
                                               'label': 'TEST-ONLY rendering scale pref'}
    harness.result.update(status=status, schema='axiosozo-zen-bench-v1', label=label, E1='NOT_TESTED', E2='NOT_TESTED',
                          machine=bench.machine())
    (out / f'zen-bench-{label}.json').write_text(json.dumps(harness.result, indent=1) + '\n')
    print(json.dumps(dict(component='zen-bench', engine=args.engine, status=status, reason=harness.result.get('reason'))))
    return {'PASS': 0, 'BLOCKED_ENV': 2}.get(status, 1)


if __name__ == '__main__':
    sys.exit(main())
