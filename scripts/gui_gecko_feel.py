#!/usr/bin/env python3
"""Linux "native feel" checks for Zen/Gecko on the real Linux app (GUI harness).

    python3 scripts/gui_gecko_feel.py [--app fetched] [--evidence-dir DIR] [--label before|after]
        [--wm auto|metacity|openbox|none] [--theme system|light|dark] [--scale 1|2]
        [--first-run] [--scenario all|window,prefs,...] [--strict]

Built on scripts/gui_test.py (same private Xvfb, private D-Bus bus, owned
throwaway profile, loopback fixture, Marionette test-only switches; TLS,
origin isolation and the sandboxes are left as built). Additions, all for
this test process only:

- a window manager on the private display (metacity, else openbox), because a
  bare Xvfb has none: GTK's maximize/fullscreen requests and window
  decorations only mean something under an EWMH window manager;
- GTK_THEME (Adwaita / Adwaita:dark) and GDK_SCALE for the light/dark and
  1x/2x passes; GSETTINGS_BACKEND=memory so nothing writes the user's dconf.

Scenarios: window (maximized first window, X geometry, WM_CLASS/app id, CSD
window controls), prefs (Firefox-on-Linux defaults: middle-click paste,
autoscroll, smooth/kinetic scrolling, overlay scrollbars, file picker portal,
GPU prefs), theme (prefers-color-scheme in chrome and content), fonts
(fontconfig defaults), strings (about:axiosozo copy has no Mac-isms; each view
screenshotted), scroll (px per wheel notch, smooth-scroll frame pacing), tabs
(tab switch time), startup (process → first paint → session restored),
firstrun (Zen welcome at this scale), desktop (.desktop file vs WM_CLASS).

Never types into the address bar (WebRender crash owned by cloud/linux-platform).
Exit: 0 when the harness ran (or every check passed with --strict), 1 FAIL,
2 BLOCKED_ENV. Results: <evidence>/feel.json and screenshots.
"""
import argparse
import datetime
import json
import os
from pathlib import Path
import secrets
import shutil
import statistics
import subprocess
import sys
import time

import gui_test
from gui_test import Blocked, Harness, MarionetteError, resolve_app
from gui_engines.gecko import GeckoEngine
import linux_desktop
import storage
from fixtures import FixtureServer
from session import OwnedSession, private_directory

SCENARIOS = ('window', 'prefs', 'theme', 'fonts', 'strings', 'scroll', 'tabs', 'startup', 'firstrun', 'desktop')
MAC_WORDS = ('this Mac', 'This Mac', 'the Mac ', 'macOS Keychain', 'Keychain', '⌘', 'Finder')

# Expected on Linux: what stock Firefox 156 ships there (StaticPrefList.yaml,
# all.js, firefox.js), plus AxioSozo's Linux choice for Zen's window controls.
EXPECTED_PREFS = {
    'middlemouse.paste': True,
    'general.autoScroll': False,
    'general.smoothScroll': True,
    'widget.gtk.overlay-scrollbars.enabled': True,
    'apz.gtk.kinetic_scroll.enabled': True,
    'apz.gtk.pangesture.enabled': True,
    'widget.use-xdg-desktop-portal.file-picker': 2,
    'general.smoothScroll.msdPhysics.enabled': False,
    'general.smoothScroll.currentVelocityWeighting': '0.25',
    'general.smoothScroll.stopDecelerationWeighting': '0.4',
    'general.smoothScroll.mouseWheel.durationMinMS': 50,
    'mousewheel.min_line_scroll_amount': 5,
    'mousewheel.default.delta_multiplier_y': 100,
    'zen.view.hide-window-controls': False,
}
# Recorded only (GPU and theme prefs follow the hardware and the desktop).
RECORDED_PREFS = (
    'browser.tabs.inTitlebar', 'zen.view.window.scheme', 'zen.view.use-single-toolbar', 'zen.view.compact.hide-tabbar',
    'zen.widget.linux.transparency', 'widget.gtk.rounded-bottom-corners.enabled', 'layout.css.prefers-color-scheme.content-override',
    'widget.non-native-theme.scrollbar.style', 'gfx.webrender.all', 'gfx.webrender.software', 'gfx.webrender.compositor',
    'widget.dmabuf.force-enabled', 'widget.dmabuf-webgl.enabled', 'media.ffmpeg.vaapi.enabled',
    'media.hardware-video-decoding.enabled', 'gfx.x11-egl.force-enabled', 'layers.acceleration.disabled',
    'font.name.sans-serif.x-western', 'font.name.monospace.x-western', 'gfx.font_rendering.fontconfig.max_generic_substitutions',
    'browser.shell.checkDefaultBrowser', 'general.smoothScroll.msdPhysics.continuousMotionMaxDeltaMS',
)

PREFS_SCRIPT = """
const names = arguments[0];
const out = {};
const branch = Services.prefs.getDefaultBranch("");
const read = (b, name) => {
  try {
    switch (b.getPrefType(name)) {
      case b.PREF_BOOL: return b.getBoolPref(name);
      case b.PREF_INT: return b.getIntPref(name);
      case b.PREF_STRING: return b.getStringPref(name);
      default: return null;
    }
  } catch { return null; }
};
for (const name of names) out[name] = {value: read(Services.prefs, name), default: read(branch, name),
                                       user: Services.prefs.prefHasUserValue(name)};
return out;
"""
WINDOW_SCRIPT = """
const box = node => { if (!node) return null; const r = node.getBoundingClientRect(); const s = getComputedStyle(node);
  return {x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height),
          display: s.display, visibility: s.visibility, opacity: s.opacity}; };
const buttons = [...document.querySelectorAll(".titlebar-buttonbox-container")].map(box);
const visible = buttons.filter(b => b && b.width > 0 && b.height > 0 && b.display !== "none" && b.visibility !== "hidden" && Number(b.opacity) > 0);
const names = [...document.querySelectorAll(".titlebar-buttonbox-container .titlebar-button")]
  .filter(n => n.getBoundingClientRect().width > 0).map(n => n.className.replace(/\\s+/g, " ").trim());
return {windowState: window.windowState, maximized: window.windowState === window.STATE_MAXIMIZED,
        fullscreen: window.fullScreen, sizemode: document.documentElement.getAttribute("sizemode"),
        outer: [window.outerWidth, window.outerHeight], inner: [window.innerWidth, window.innerHeight],
        screen: {width: screen.width, height: screen.height, availWidth: screen.availWidth, availHeight: screen.availHeight},
        devicePixelRatio: window.devicePixelRatio,
        customTitlebar: (() => { try { return window.CustomTitlebar?.enabled ?? window.TabsInTitlebar?.enabled ?? null; } catch { return null; } })(),
        chromemargin: document.documentElement.getAttribute("chromemargin"),
        windowControls: {containers: buttons.length, visible: visible.length, buttons: names},
        gtkCsd: matchMedia("(-moz-gtk-csd-available)").matches,
        reversedButtons: document.documentElement.getAttribute("zen-window-buttons-reversed"),
        title: document.title};
"""
THEME_SCRIPT = """
return {dark: matchMedia("(prefers-color-scheme: dark)").matches,
        contrast: matchMedia("(prefers-contrast: more)").matches,
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        background: getComputedStyle(document.documentElement).backgroundColor,
        toolbarColor: (() => { const n = document.getElementById("nav-bar"); return n ? getComputedStyle(n).color : null; })()};
"""
FONTS_SCRIPT = """
const style = node => node ? (s => ({family: s.fontFamily, size: s.fontSize, weight: s.fontWeight}))(getComputedStyle(node)) : null;
return {root: style(document.documentElement), urlbar: style(document.getElementById("urlbar-input")),
        tab: style(document.querySelector(".tab-label")), devicePixelRatio: window.devicePixelRatio};
"""
STARTUP_SCRIPT = """
const info = Services.startup.getStartupInfo();
const at = key => info[key] instanceof Date ? info[key].getTime() : null;
const process = at("process");
const out = {};
for (const key of ["main", "firstPaint", "firstPaint2", "sessionRestored", "createTopLevelWindow", "delayedStartupFinished"])
  if (at(key) !== null && process !== null) out[key + "_ms"] = at(key) - process;
out.processUptime_ms = process !== null ? Date.now() - process : null;
return out;
"""
TAB_SWITCH_SCRIPT = """
return (async ([count]) => {
  const tabs = gBrowser.visibleTabs.filter(t => !t.pinned).slice(-2);
  if (tabs.length < 2) return {error: "need two tabs", tabs: gBrowser.visibleTabs.length};
  const times = [];
  for (let i = 0; i < count; i++) {
    const target = tabs.find(tab => tab !== gBrowser.selectedTab);
    const done = new Promise(resolve => window.addEventListener("TabSwitchDone", () => resolve(true), {once: true, capture: true}));
    const start = performance.now();
    gBrowser.selectedTab = target;
    const finished = await Promise.race([done, new Promise(resolve => setTimeout(() => resolve(false), 5000))]);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    times.push({ms: Math.round((performance.now() - start) * 10) / 10, switchDone: finished});
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  return {times};
})(arguments);
"""
SMOOTH_SCROLL_SCRIPT = """
return (async () => {
// A long synthetic page inside the fixture tab (DOM only, nothing fetched),
// then one smooth scroll; frame times come from requestAnimationFrame.
if (!document.getElementById("feel-long")) {
  const long = document.createElement("div");
  long.id = "feel-long";
  for (let i = 0; i < 400; i++) {
    const row = document.createElement("p");
    row.textContent = `Row ${i}: the quick brown fox jumps over the lazy dog. `.repeat(3);
    row.style.cssText = `margin:0;padding:8px;background:hsl(${(i * 13) % 360} 40% 92%)`;
    long.append(row);
  }
  document.body.append(long);
}
window.scrollTo({top: 0, behavior: "instant"});
await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
const distance = Math.min(6000, document.documentElement.scrollHeight - innerHeight - 10);
const frames = [];
let last = performance.now();
const start = last;
let stableSince = null;
window.scrollTo({top: distance, behavior: "smooth"});
await new Promise(resolve => {
  const tick = now => {
    frames.push(now - last); last = now;
    if (Math.abs(scrollY - distance) < 2) { stableSince ??= now; if (now - stableSince > 100) return resolve(); }
    if (now - start > 5000) return resolve();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
frames.shift();
const sorted = [...frames].sort((a, b) => a - b);
const pct = p => sorted.length ? Math.round(sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] * 10) / 10 : null;
return {distance, reached: Math.round(scrollY), duration_ms: Math.round(last - start), frames: frames.length,
        mean_frame_ms: frames.length ? Math.round(frames.reduce((a, b) => a + b, 0) / frames.length * 10) / 10 : null,
        p50_frame_ms: pct(0.5), p95_frame_ms: pct(0.95), max_frame_ms: pct(1),
        long_frames_over_33ms: frames.filter(f => f > 33.4).length};
})();
"""


def which(name):
    return shutil.which(name, path=os.environ.get('PATH', '') + ':/usr/bin:/bin')


class FeelEngine(GeckoEngine):
    """Gecko plug-in plus this run's GTK environment (theme, scale)."""

    def __init__(self, extra_env):
        self.extra_env = extra_env

    def browser_environment(self, harness):
        return dict(self.extra_env)


class FeelHarness(Harness):
    def __init__(self, args, engine, evidence):
        super().__init__(args, engine, evidence)
        self.result.update({'harness': 'axiosozo-linux-gecko-feel', 'label': args.label,
                            'mode': {'wm': args.wm, 'desktop': args.desktop, 'compositor': args.compositor, 'theme': args.theme, 'scale': args.scale,
                                     'first_run': args.first_run},
                            'checks': {}})
        self.wm = None

    # -- environment ----------------------------------------------------------------
    def start_display(self, session):
        super().start_display(session)
        wanted = ['metacity', 'openbox'] if self.args.wm == 'auto' else [] if self.args.wm == 'none' else [self.args.wm]
        env = {**self.x_env, 'GSETTINGS_BACKEND': 'memory'}
        for name in wanted:
            if not which(name):
                continue
            log = (self.evidence / f'wm-{name}.log').open('w')
            process = session.spawn([name], env=env, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
            time.sleep(2)
            if process.poll() is None:
                self.wm = name
                break
        self.result['wm'] = self.wm or 'none'
        if self.args.wm not in ('none', 'auto') and not self.wm:
            raise Blocked(f'window manager {self.args.wm} not available')
        # metacity composites by itself; xcompmgr is for openbox.
        self.compositor = None
        if self.wm and self.args.compositor != 'none' and which('xcompmgr'):
            log = (self.evidence / 'compositor.log').open('w')
            process = session.spawn(['xcompmgr', '-n'], env=env, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
            time.sleep(1)
            if process.poll() is None:
                self.compositor = 'xcompmgr'
        elif self.args.compositor == 'xcompmgr':
            raise Blocked('xcompmgr not available')
        self.result['compositor'] = self.compositor or 'none'

    def xprop(self, *args):
        if not which('xprop'):
            return None
        result = subprocess.run(['xprop', *map(str, args)], env=self.x_env, capture_output=True, text=True, timeout=15)
        return result.stdout.strip() if result.returncode == 0 else None

    def check(self, name, ok, observed, expected=None):
        self.result['checks'][name] = {'ok': bool(ok), 'observed': observed,
                                       **({'expected': expected} if expected is not None else {})}
        return ok

    def open_about(self, fragment=''):
        self.open_tab('about:axiosozo' + fragment)
        return self.wait(lambda: self.content_script(
            "const h = document.querySelector('h1'); return h && h.getBoundingClientRect().width > 0 && "
            "document.readyState === 'complete' ? true : null;"), 'about:axiosozo rendered', timeout=30)

    # -- scenarios ----------------------------------------------------------------------
    def scenario_window(self):
        def settled():
            state = self.chrome_script(WINDOW_SCRIPT)
            return state if (not self.wm or state['maximized']) else None
        try:
            state = self.wait(settled, 'the first window maximized by the window manager', timeout=20)
        except AssertionError:
            state = self.chrome_script(WINDOW_SCRIPT)
        geometry = self.find_window()
        wm_class = self.xprop('-id', self.window, 'WM_CLASS')
        net_state = self.xprop('-id', self.window, '_NET_WM_STATE')
        gtk_id = self.xprop('-id', self.window, '_GTK_APPLICATION_ID')
        # The top-level frame (the WM reparents the client window).
        root_geometry = self.xdotool('getdisplaygeometry').split()
        state.update({'x11': geometry, 'wm_class': wm_class, 'net_wm_state': net_state, 'gtk_application_id': gtk_id,
                      'display_geometry': root_geometry})
        width, height = (int(value) for value in root_geometry)
        scale = state['devicePixelRatio'] or 1
        fills = (state['outer'][0] * scale >= width * 0.97 and state['outer'][1] * scale >= height * 0.9)
        if self.wm:
            self.check('window.maximized_under_wm', state['maximized'] and fills,
                       {'windowState': state['windowState'], 'outer': state['outer'], 'display': root_geometry}, 'maximized, fills the screen')
        self.check('window.wm_class', bool(wm_class) and linux_desktop.WM_CLASS in (wm_class or ''), wm_class,
                   f'WM_CLASS contains "{linux_desktop.WM_CLASS}" (StartupWMClass of the .desktop file)')
        prefs = self.chrome_script(PREFS_SCRIPT, [['zen.view.hide-window-controls']])
        hidden = prefs['zen.view.hide-window-controls']['value']
        extents = self.xprop('-id', self.window, '_NET_FRAME_EXTENTS') or ''
        frame = [int(value) for value in extents.split('=', 1)[1].replace(' ', '').split(',')] if '=' in extents else []
        state['frame_extents'] = frame
        # Who draws close/minimize/maximize: Zen (client-side decorations,
        # customTitlebar) or the window manager's frame (server-side).
        owner = 'zen' if state['customTitlebar'] else 'window-manager' if frame and frame[2] > 0 else 'nobody'
        state['controls_owner'] = owner
        if self.wm:
            self.check('window.controls_visible', state['windowControls']['visible'] > 0 if owner == 'zen' else owner == 'window-manager',
                       {**state['windowControls'], 'owner': owner, 'frame_extents': frame, 'gtk_csd': state['gtkCsd'],
                        'zen.view.hide-window-controls': hidden}, 'close/minimize/maximize visible (GNOME/KDE)')
        self.screenshot('window')
        return state

    def scenario_prefs(self):
        values = self.chrome_script(PREFS_SCRIPT, [list(EXPECTED_PREFS) + list(RECORDED_PREFS)])
        mismatches = {name: {'observed': values[name]['value'], 'expected': expected}
                      for name, expected in EXPECTED_PREFS.items() if values[name]['value'] != expected}
        self.check('prefs.firefox_linux_defaults', not mismatches, mismatches or 'all match', 'stock Firefox 156 on Linux')
        return {'values': values, 'mismatches': mismatches}

    def scenario_theme(self):
        chrome = self.chrome_script(THEME_SCRIPT)
        self.engine.show(self, self.fixture.url)
        self.engine.assert_rendered(self, 'AxioSozo fixture')
        content = self.content_script('return {dark: matchMedia("(prefers-color-scheme: dark)").matches};')
        self.open_about()
        about = self.content_script(THEME_SCRIPT.replace('document.getElementById("nav-bar")', 'null'))
        self.screenshot(f'theme-{self.args.theme}-about')
        expected_dark = {'dark': True, 'light': False}.get(self.args.theme)
        if expected_dark is not None:
            self.check('theme.follows_gtk', chrome['dark'] == expected_dark and about['dark'] == expected_dark,
                       {'chrome': chrome['dark'], 'about': about['dark'], 'fixture_content': content['dark']},
                       f'prefers-color-scheme dark={expected_dark} in chrome and about:axiosozo')
        return {'chrome': chrome, 'fixture_content': content, 'about': about}

    def scenario_fonts(self):
        chrome = self.chrome_script(FONTS_SCRIPT)
        fc = {}
        if which('fc-match'):
            for generic in ('sans-serif', 'monospace', 'system-ui'):
                fc[generic] = subprocess.run(['fc-match', generic], capture_output=True, text=True, timeout=10).stdout.strip()
        if which('fc-match'):
            fc['hinting'] = subprocess.run(['fc-match', '-v', 'sans-serif', 'hintstyle', 'antialias', 'rgba', 'lcdfilter'],
                                           capture_output=True, text=True, timeout=10).stdout.strip()
        # Chrome text uses the GTK system font (the "menu" system font family), not a macOS font name.
        family = (chrome['root'] or {}).get('family', '')
        self.check('fonts.no_mac_family', not any(name in family for name in ('SF Pro', '-apple-system', 'BlinkMacSystemFont')),
                   family, 'GTK/fontconfig system font')
        return {'chrome': chrome, 'fontconfig': fc}

    def scenario_strings(self):
        texts = {}
        for view in ('projects', 'rules', 'ai', 'lab'):
            self.open_about('#' + view)
            self.wait(lambda: self.content_script(
                'const v = document.querySelector(`section.view[data-view="${arguments[0]}"]`); return v && !v.hidden ? true : null;',
                [view]), f'about:axiosozo#{view} shown', timeout=20)
            time.sleep(0.5)
            texts[view] = self.content_script(
                'const v = document.querySelector(`section.view[data-view="${arguments[0]}"]`);'
                'const attrs = [...document.querySelectorAll("[title],[aria-label],[placeholder]")]'
                '.map(n => [n.getAttribute("title"), n.getAttribute("aria-label"), n.getAttribute("placeholder")].filter(Boolean).join(" "));'
                'return document.querySelector("header")?.innerText + "\\n" + v.innerText + "\\n" + attrs.join("\\n");', [view])
            self.screenshot(f'about-{view}')
        found = {view: sorted({word for word in MAC_WORDS if word in text}) for view, text in texts.items()}
        found = {view: words for view, words in found.items() if words}
        self.check('strings.no_mac_wording', not found, found or 'none', 'no "this Mac", Keychain, ⌘ or Finder on Linux')
        (self.evidence / 'about-text.json').write_text(json.dumps(texts, indent=2, ensure_ascii=False) + '\n')
        return {'mac_words': found, 'characters': {view: len(text) for view, text in texts.items()}}

    def scenario_scroll(self):
        self.engine.show(self, self.fixture.url)
        self.engine.assert_rendered(self, 'AxioSozo fixture')
        smooth = self.content_script(SMOOTH_SCROLL_SCRIPT)
        # One wheel notch through X (button 5) over the page: px per notch is
        # what delta_multiplier_y and min_line_scroll_amount decide.
        self.content_script('window.scrollTo({top: 0, behavior: "instant"}); return true;')
        time.sleep(0.3)
        self.xdotool('windowfocus', '--sync', self.window)
        origin = self.chrome_script('const r = gBrowser.selectedBrowser.getBoundingClientRect();'
                                    'return {x: window.mozInnerScreenX + r.left + r.width / 2, y: window.mozInnerScreenY + r.top + r.height / 2,'
                                    ' scale: window.devicePixelRatio};')
        self.xdotool('mousemove', '--sync', round(origin['x'] * origin['scale']), round(origin['y'] * origin['scale']))
        notches = []
        for _ in range(3):
            before = self.content_script('return scrollY;')
            self.xdotool('click', '5')
            def settled(previous=[None]):
                now = self.content_script('return scrollY;')
                done = previous[0] is not None and now == previous[0] and now != before
                previous[0] = now
                return now if done else None
            try:
                after = self.wait(settled, 'wheel scroll settled', timeout=5)
            except AssertionError:
                after = self.content_script('return scrollY;')
            notches.append(round(after - before, 1))
        self.screenshot('scroll')
        return {'smooth_scroll': smooth, 'wheel_px_per_notch': notches, 'devicePixelRatio': origin['scale']}

    def scenario_tabs(self):
        self.engine.show(self, self.fixture.url)
        self.engine.assert_rendered(self, 'AxioSozo fixture')
        self.open_tab(self.fixture.url + '?page=2')
        self.wait(lambda: 'page=2' in (self.engine.content_title(self) or ''), 'second fixture tab')
        result = self.chrome_script(TAB_SWITCH_SCRIPT, [12])
        if 'times' in result:
            values = [item['ms'] for item in result['times']]
            result.update({'median_ms': statistics.median(values), 'max_ms': max(values),
                           'all_switch_done': all(item['switchDone'] for item in result['times'])})
        return result

    def scenario_startup(self):
        info = self.chrome_script(STARTUP_SCRIPT)
        info['seconds_to_marionette'] = self.result['browser'].get('seconds_to_marionette')
        return info

    def scenario_firstrun(self):
        if not self.args.first_run:
            raise Blocked('run with --first-run (Zen welcome not suppressed) for this scenario')
        state = self.chrome_script("""
            const root = document.documentElement;
            const page = document.querySelector("#zen-welcome-page-content > .zen-welcome-page:not([exiting])");
            const r = page?.getBoundingClientRect();
            return {stage: root.getAttribute("zen-welcome-stage"), page: r ? [Math.round(r.width), Math.round(r.height)] : null,
                    start: !!document.getElementById("zen-welcome-start-button"), dpr: window.devicePixelRatio,
                    text: (page?.innerText ?? "").slice(0, 400),
                    video: (v => v ? {readyState: v.readyState, paused: v.paused, error: v.error?.code ?? null,
                                      canPlayH264: v.canPlayType('video/mp4; codecs="avc1.42E01E"')} : null)(
                      document.getElementById("zen-welcome-video")),
                    backdrop: (w => w ? getComputedStyle(w).backgroundColor : null)(document.getElementById("zen-welcome"))};""")
        time.sleep(1.5)
        self.screenshot(f'firstrun-{self.args.scale}x')
        self.check('firstrun.welcome_shown', bool(state['stage'] is not None or state['start']), state, 'Zen welcome is on screen')
        state['during'] = self.chrome_script(WINDOW_SCRIPT)
        # Through the welcome as a new user who keeps the defaults: Start, then
        # "Next" on every page, then "Start browsing" (never "set as default").
        steps = []
        self.chrome_script('document.getElementById("zen-welcome-start-button")?.click(); return true;')
        deadline = time.monotonic() + 60
        while time.monotonic() < deadline:
            time.sleep(1.2)
            step = self.chrome_script("""
                if (!document.documentElement.hasAttribute("zen-welcome-stage")) return "done";
                const buttons = [...document.querySelectorAll("#zen-welcome-page-sidebar-buttons button")];
                const pick = buttons.find(b => b.getAttribute("data-l10n-id") === "zen-welcome-start-browsing")
                  ?? buttons.find(b => b.getAttribute("data-l10n-id") === "zen-generic-next")
                  ?? buttons.find(b => /skip|later|next/i.test(b.getAttribute("data-l10n-id") ?? ""));
                if (!pick) return "waiting:" + buttons.map(b => b.getAttribute("data-l10n-id")).join(",");
                pick.click();
                return pick.getAttribute("data-l10n-id");""")
            steps.append(step)
            if step == 'done':
                break
            if len(steps) == 3:
                self.screenshot(f'firstrun-{self.args.scale}x-page')
        state['welcome_steps'] = steps
        time.sleep(2.5)
        after = self.chrome_script(WINDOW_SCRIPT)
        state['after_welcome'] = after
        state['linux_window_sizing'] = self.chrome_script(
            'try { return ChromeUtils.importESModule("chrome://browser/content/axiosozo/LinuxDesktop.sys.mjs")'
            '.linuxWindowSizingState?.(window) ?? null; } catch (e) { return String(e); }')
        state['axiosozo_started'] = self.chrome_script('return !!window.AxioSozo;')
        self.screenshot(f'firstrun-{self.args.scale}x-done')
        width, height = (int(value) for value in self.xdotool('getdisplaygeometry').split())
        scale = after['devicePixelRatio'] or 1
        fills = after['outer'][0] * scale >= width * 0.97 and after['outer'][1] * scale >= height * 0.9
        self.check('firstrun.welcome_finished', steps[-1:] == ['done'], steps, 'the welcome ends with Start browsing')
        if self.wm:
            # Screens below 1280x1040 CSS px: Firefox's first window is maximized.
            small = after['screen']['availWidth'] * 0.9 < 1280 and after['screen']['availHeight'] * 0.9 < 1040
            self.check('firstrun.window_after_welcome', (after['maximized'] and fills) if small else not after['maximized'],
                       {'windowState': after['windowState'], 'outer': after['outer'], 'screen': after['screen']},
                       'the size stock Firefox gives a first window on this screen')
        return state

    def scenario_desktop(self):
        executable = Path(self.result['app']['executable'])
        entry = linux_desktop.render(executable)
        path = self.evidence / linux_desktop.DESKTOP_FILE
        path.write_text(entry)
        validate = None
        if which('desktop-file-validate'):
            run = subprocess.run(['desktop-file-validate', str(path)], capture_output=True, text=True, timeout=20)
            validate = {'exit': run.returncode, 'output': (run.stdout + run.stderr).strip()}
        icons = linux_desktop.icon_sources(executable.parent)
        wm_class = (self.result['checks'].get('window.wm_class') or {}).get('observed')
        self.check('desktop.file_valid', validate is None or validate['exit'] == 0, validate, 'desktop-file-validate passes')
        self.check('desktop.icons', len(icons) >= 4, sorted(icons), 'hicolor icon sizes from the app bundle')
        return {'desktop_file': entry, 'validate': validate, 'icons': sorted(icons), 'x11_wm_class': wm_class,
                'startup_wm_class': linux_desktop.WM_CLASS}

    # -- run ------------------------------------------------------------------------------
    def run(self, executable, app_info, scenarios):
        self.result['app'] = {'executable': str(executable), **app_info}
        gui_test.SESSION_ROOT.mkdir(parents=True, exist_ok=True)
        with OwnedSession(gui_test.SESSION_ROOT / ('feel-' + secrets.token_hex(8))) as session:
            self.result['session'] = str(session.path)
            profile = private_directory(session.path / 'gecko')
            (profile / '.axiosozo-dev-profile').touch(mode=0o600)
            try:
                self.start_display(session)
                with FixtureServer() as fixture:
                    self.fixture = fixture
                    self.launch(session, executable, profile)
                    self.result['scenarios']['launch'] = self.run_one('launch')
                    if self.result['scenarios']['launch']['status'] == 'PASS':
                        if self.args.first_run and 'firstrun' in scenarios:
                            self.result['scenarios']['firstrun'] = self.run_one('firstrun')
                        for name in scenarios:
                            if name not in self.result['scenarios']:
                                self.result['scenarios'][name] = self.run_one(name)
                    final = self.screenshot('final')
                    self.result['final_screenshot'] = str(final)
            finally:
                self.shutdown()
        self.result['cleanup'] = session.cleanup_report


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--app', default='auto')
    parser.add_argument('--evidence-dir')
    parser.add_argument('--label', default='local', help='before/after (recorded only)')
    parser.add_argument('--wm', default='auto', choices=('auto', 'metacity', 'openbox', 'none'))
    parser.add_argument('--compositor', default='none', choices=('auto', 'xcompmgr', 'none'),
                        help='extra compositor (metacity composites by itself; for openbox)')
    parser.add_argument('--desktop', default='GNOME', choices=('GNOME', 'KDE', 'none'),
                        help='XDG_CURRENT_DESKTOP for the app, as a desktop session sets it; on X11 Gecko draws '
                             'client-side decorations (Zen\'s titlebar buttons) only when it is set')
    parser.add_argument('--theme', default='light', choices=('system', 'light', 'dark'))
    parser.add_argument('--scale', type=int, default=1, choices=(1, 2))
    parser.add_argument('--first-run', action='store_true', help='keep the Zen welcome (do not mark it seen)')
    parser.add_argument('--scenario', default='all')
    parser.add_argument('--size', default=None, help='Xvfb size (default 1280x800, or 2560x1600 at --scale 2)')
    parser.add_argument('--timeout', type=float, default=45)
    parser.add_argument('--launch-timeout', type=float, default=180)
    parser.add_argument('--strict', action='store_true', help='exit 1 when any check fails')
    args = parser.parse_args()
    args.size = args.size or ('2560x1600' if args.scale == 2 else '1280x800')
    args.screenshot, args.hold = None, 0
    scenarios = [name for name in SCENARIOS if name != 'firstrun' or args.first_run] if args.scenario == 'all' \
        else [item for item in args.scenario.split(',') if item]
    if any(item not in SCENARIOS for item in scenarios):
        parser.error('--scenario takes all or: ' + ','.join(SCENARIOS))
    extra_env = {'GSETTINGS_BACKEND': 'memory'}
    if args.desktop != 'none' and args.wm != 'none':
        extra_env['XDG_CURRENT_DESKTOP'] = args.desktop
    if args.theme != 'system':
        extra_env['GTK_THEME'] = 'Adwaita:dark' if args.theme == 'dark' else 'Adwaita'
    if args.scale != 1:
        extra_env['GDK_SCALE'] = str(args.scale)
    if args.first_run:
        # Throwaway test profile: show Zen's welcome as a new user sees it.
        gui_test.TEST_PREFS['zen.welcome-screen.seen'] = False
        gui_test.TEST_PREFS.pop('browser.startup.homepage_override.mstone', None)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    evidence = Path(args.evidence_dir).resolve() if args.evidence_dir else storage.BUILD_ROOT / 'gui-evidence' / f'feel-{stamp}'
    harness = FeelHarness(args, FeelEngine(extra_env), evidence)
    harness.result['browser_environment'] = extra_env
    try:
        if not storage.LINUX:
            raise Blocked('Linux only (Xvfb)')
        storage.ensure()
        evidence.mkdir(parents=True, exist_ok=True)
        executable, app_info = resolve_app(args.app)
        harness.run(executable, app_info, scenarios)
        statuses = [item['status'] for item in harness.result['scenarios'].values()]
        failed_checks = [name for name, item in harness.result['checks'].items() if not item['ok']]
        harness.result['failed_checks'] = failed_checks
        status = 'FAIL' if 'FAIL' in statuses or (args.strict and failed_checks) else 'PASS'
        code = 1 if status == 'FAIL' else 0
    except Blocked as error:
        status, code = 'BLOCKED_ENV', 2
        harness.result['reason'] = str(error)
    except (RuntimeError, OSError, subprocess.SubprocessError, AssertionError, MarionetteError) as error:
        status, code = 'FAIL', 1
        harness.result['reason'] = f'{type(error).__name__}: {error}'
    harness.result['status'] = status
    harness.result['evidence_dir'] = str(evidence)
    if evidence.is_dir():
        (evidence / 'feel.json').write_text(json.dumps(harness.result, indent=2, ensure_ascii=False) + '\n')
    summary = {key: harness.result.get(key) for key in ('status', 'label', 'mode', 'wm', 'compositor', 'failed_checks', 'reason')}
    summary['scenarios'] = {name: item['status'] for name, item in harness.result['scenarios'].items()}
    print(json.dumps(summary, indent=2, ensure_ascii=False), flush=True)
    return code


if __name__ == '__main__':
    sys.exit(main())
