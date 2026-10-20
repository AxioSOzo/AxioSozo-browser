#!/usr/bin/env python3
"""WebKit tabs inside the Linux Zen app: the native-feel matrix (workstream webkit-feel).

    python3 scripts/webkit_feel_e2e.py --app fetched [--evidence-dir DIR] [--scenario a,b,...]

Runs the GUI harness of scripts/gui_test.py (Xvfb, owned profile, Marionette in chrome
context, xdotool input, xwd screenshots) with the WebKit plug-in (scripts/gui_engines/webkit.py).
The owned loopback fixture serves tests/fixtures/webkit-feel.html as /engine.html, the only page
the WebKit fixture policy admits (engine-stream-v1 §7; nothing is widened). The page opens in a
Gecko tab, Zen's tab menu moves it to WebKit, and every gate is driven with real X11 input:
favicon, address-bar engine indicator and tab-menu notes; typing; drag/double/triple-click
selection; Ctrl+C/X/V with Zen's clipboard; X11 PRIMARY and middle-click paste; notch vs
precise wheel (with the Gecko tab of the same page as baseline); CSS cursors; the <select>
popup drawn by Zen; Zen's context menu; JS alert/confirm/prompt and beforeunload in Zen's
dialogs; a permission request in Zen's doorhanger (denied); the file picker; a refused
download; find in page through Zen's findbar; zoom; IME composition with preedit (Gecko's
TextInputProcessor on Zen's proxy editor); shortcut ownership; HiDPI 1x/2x; a killed host
with the "Try again in WebKit" notice. Page state comes from the page's own title
("AxioSozo feel {json}"), which Zen receives from WebKit's title events.

Results: <evidence>/result.json with `scenarios` and `matrix` (PASS / EXPERIMENTAL / FAIL /
BLOCKED_ENV / NOT_VERIFIED per gate). Exit 0 PASS, 1 FAIL, 2 BLOCKED_ENV. Test-only switches:
the harness's own, the WebKit enable pref, Marionette unhandledPromptBehavior=ignore, and the
layout.css.devPixelsPerPx pref for the 2x step. TLS, sandboxes and origin isolation are untouched.
"""
import argparse
import datetime
import hashlib
import http.server
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import threading
import time
import urllib.parse

import storage
import gui_test
from gui_engines import EngineUnavailable
from gui_engines.webkit import ENGINE as WEBKIT

ROOT = Path(__file__).resolve().parents[1]
FEEL = ROOT / 'tests/fixtures/webkit-feel.html'
SCENARIOS = ('launch', 'chrome', 'switch', 'polish', 'typing', 'selection', 'clipboard', 'middle_click', 'wheel', 'cursor',
             'select_popup', 'dialogs', 'beforeunload', 'permission', 'file_dialog', 'download', 'find', 'zoom', 'ime',
             'context_menu', 'shortcuts', 'hidpi', 'crash_retry')
HOST = 'AxioWebKitHost --stream'
# Fixed CSS-pixel geometry of tests/fixtures/webkit-feel.html (centres).
AT = {'text': (170, 38), 'count': (410, 38), 'link': (520, 38), 'area': (170, 150), 'select': (420, 138),
      'dl': (680, 138), 'd-alert': (80, 276), 'd-confirm': (210, 276), 'd-prompt': (340, 276), 'd-unload': (470, 276),
      'edit': (220, 330), 'perm': (100, 436), 'file': (330, 436), 'dl-link': (500, 436), 'img': (644, 436), 'blank': (700, 560)}
CURSORS = {'c-pointer': (60, 'pointer'), 'c-text': (150, 'text'), 'c-move': (240, 'move'), 'c-wait': (330, 'wait'),
           'c-crosshair': (420, 'crosshair'), 'c-not-allowed': (510, 'not-allowed'), 'c-grab': (600, 'grab'),
           'c-col-resize': (690, 'col-resize'), 'c-default': (780, 'default')}
SEL_TOP = 92        # vertical centre of #sel ("alpha beta gamma delta", 16px monospace, left 20px)

STATE = """
const probe = window.AxioSozo?.engineProbe;
const tab = gBrowser.selectedTab, browser = tab.linkedBrowser, stack = browser.parentNode;
const overlay = stack?.querySelector?.('[data-axiosozo-engine-view="webkit"]'), canvas = overlay?.querySelector('canvas');
const r = canvas?.getBoundingClientRect(), b = browser.getBoundingClientRect();
const d = probe?.diagnostics?.();
const native = d?.webkit?.native ?? null;
const active = document.activeElement;
const notice = overlay ? [...overlay.children].find(n => n.getAttribute('role') === 'status' && !n.hidden) : null;
const indicator = document.getElementById('axiosozo-webkit-indicator');
const ir = indicator?.getBoundingClientRect();
return JSON.parse(JSON.stringify({engine: probe?.engineOf?.(tab) ?? 'gecko', native, failure: d?.failure ?? null,
  pending: d?.pending ?? null, geckoHidden: browser.style.visibility === 'hidden', geckoURL: browser.currentURI?.spec ?? null,
  geckoTitle: browser.contentTitle ?? null, overlay: overlay ? {display: overlay.style.display} : null,
  view: r && overlay?.style.display === 'block'
    ? {x: mozInnerScreenX + r.left, y: mozInnerScreenY + r.top, w: r.width, h: r.height, cursor: canvas.style.cursor}
    : {x: mozInnerScreenX + b.left, y: mozInnerScreenY + b.top, w: b.width, h: b.height, cursor: null},
  notice: notice?.textContent ?? null, scale: devicePixelRatio, tabs: gBrowser.tabs.length, tabId: tab.linkedPanel,
  label: tab.label, icon: (() => { try { return gBrowser.getIcon(tab) ?? null; } catch { return null; } })(),
  urlbarFocused: !!gURLBar.focused, urlbar: gURLBar.value,
  indicator: indicator ? {hidden: indicator.hidden, label: indicator.getAttribute('label'), text: indicator.textContent,
    inUrlbar: !!indicator.closest('#urlbar'), width: ir.width, height: ir.height, title: indicator.getAttribute('title')} : null,
  probe: (p => p ? {display: getComputedStyle(p).display, engine: p.getAttribute('engine')} : null)(document.getElementById('axiosozo-engine-probe')),
  focus: active === canvas ? 'canvas' : (overlay?.contains(active) ? 'proxy-' + active.localName : (active?.id || active?.localName || null))}));
"""
CLIPBOARD_READ = """
const which = arguments[0] ? Ci.nsIClipboard.kSelectionClipboard : Ci.nsIClipboard.kGlobalClipboard;
if (arguments[0] && !Services.clipboard.isClipboardTypeSupported(which)) return {error: 'no PRIMARY'};
const trans = Cc['@mozilla.org/widget/transferable;1'].createInstance(Ci.nsITransferable);
trans.init(null); trans.addDataFlavor('text/plain');
try { Services.clipboard.getData(trans, which, window.browsingContext.currentWindowContext); }
catch (e) { try { Services.clipboard.getData(trans, which); } catch (e2) { return {error: String(e2)}; } }
const out = {};
try { trans.getTransferData('text/plain', out); } catch (e) { return {error: String(e)}; }
return {text: out.value?.QueryInterface(Ci.nsISupportsString).data ?? null};
"""
CLIPBOARD_WRITE = """
Cc['@mozilla.org/widget/clipboardhelper;1'].getService(Ci.nsIClipboardHelper).copyString(arguments[0]);
return true;
"""
FINDBAR_STATE = """
const tab = gBrowser.selectedTab;
const bar = gBrowser.isFindBarInitialized(tab) ? gBrowser.getCachedFindBar(tab) : null;
if (!bar) return {open: false};
const matches = bar._foundMatches ?? bar.querySelector('.found-matches');
return {open: !bar.hidden, value: bar._findField?.value ?? null,
        matches: matches?.textContent || matches?.value || null, matchesArgs: matches?.getAttribute('data-l10n-args') ?? null,
        status: bar._findStatusDesc?.textContent ?? null};
"""
CONTEXT_MENU = """
const popup = document.getElementById('axiosozo-chromium-context-menu');
if (!popup) return {open: false};
return {open: popup.state === 'open', state: popup.state, label: popup.getAttribute('aria-label'),
  items: [...popup.children].filter(n => n.localName === 'menuitem').map(n => ({label: n.getAttribute('label'),
    action: n.dataset.action, disabled: n.getAttribute('disabled') === 'true'}))};
"""
SELECT_POPUP = """
const popup = document.getElementById('axiosozo-webkit-select-popup');
if (!popup) return {open: false};
return {open: popup.state === 'open', items: [...popup.children].map(n => ({tag: n.localName, label: n.getAttribute('label'),
  selected: n.getAttribute('selected') === 'true', disabled: n.getAttribute('disabled') === 'true',
  box: (r => ({x: mozInnerScreenX + r.left + r.width / 2, y: mozInnerScreenY + r.top + r.height / 2}))(n.getBoundingClientRect())})),
  scale: devicePixelRatio};
"""
NOTIFICATIONS = """
const box = gBrowser.getNotificationBox(gBrowser.selectedBrowser);
const item = box?.getNotificationWithValue?.(arguments[0]);
if (!item) return null;
const buttons = [...(item.buttonContainer?.querySelectorAll?.('button') ?? item.querySelectorAll?.('button') ?? [])]
  .map(b => ({label: b.label ?? b.textContent, box: (r => ({x: mozInnerScreenX + r.left + r.width / 2, y: mozInnerScreenY + r.top + r.height / 2,
    w: r.width}))(b.getBoundingClientRect())}));
return {label: String(item.messageText?.textContent ?? item.label ?? ''), buttons, scale: devicePixelRatio};
"""
DOORHANGER = """
const panel = document.getElementById('notification-popup');
const n = panel?.querySelector('popupnotification');
if (!panel || panel.state !== 'open' || !n) return null;
const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return {x: mozInnerScreenX + b.left + b.width / 2,
  y: mozInnerScreenY + b.top + b.height / 2, w: b.width}; };
return {id: n.id, message: n.getAttribute('label'), name: n.getAttribute('name'),
  primary: {label: n.getAttribute('buttonlabel'), box: r(n.button)},
  secondary: {label: n.getAttribute('secondarybuttonlabel'), box: r(n.secondaryButton)}, scale: devicePixelRatio};
"""
IME = """
const [step, text] = arguments;
if (step === 'begin') {
  const tip = window.__feelTip = Cc['@mozilla.org/text-input-processor;1'].createInstance(Ci.nsITextInputProcessor);
  if (!tip.beginInputTransactionForTests(window)) return {error: 'no input transaction'};
  tip.setPendingCompositionString(text);
  tip.appendClauseToPendingComposition(text.length, tip.ATTR_RAW_CLAUSE);
  tip.setCaretInPendingComposition(text.length);
  tip.flushPendingComposition();
  const a = document.activeElement;
  return {composing: tip.hasComposition, focus: a?.localName ?? null, proxy: !!a?.closest?.('[data-axiosozo-engine-view]')};
}
const tip = window.__feelTip;
if (!tip) return {error: 'no composition'};
if (step === 'commit') tip.commitCompositionWith(text); else tip.cancelComposition();
window.__feelTip = null;
return {committed: step === 'commit'};
"""


def parse_feel(title):
    if not isinstance(title, str) or not title.startswith('AxioSozo feel {'):
        return None
    try:
        return json.loads(title[len('AxioSozo feel '):])
    except ValueError:
        return None


class FeelServer:
    """Owned loopback HTTP fixture: the feel page as /engine.html (and ?page=2). GET only."""

    def __init__(self):
        self.payload = FEEL.read_bytes()
        payload = self.payload

        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.0'

            def log_message(self, *_):
                pass

            def reply(self, code, body=b'', content_type='text/plain; charset=utf-8'):
                self.send_response(code)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(body)))
                self.send_header('Cache-Control', 'no-store')
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; "
                                 "style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'")
                self.end_headers()
                self.wfile.write(body)
                self.close_connection = True

            def do_GET(self):
                if self.headers.get_all('Host', []) != [f'127.0.0.1:{self.server.server_port}']:
                    return self.reply(400)
                url = urllib.parse.urlsplit(self.path)
                if url.path == '/engine.html' and url.query in ('', 'page=2') and not url.fragment:
                    return self.reply(200, payload, 'text/html; charset=utf-8')
                if url.path == '/favicon.ico':
                    return self.reply(204)
                return self.reply(404)

            def do_POST(self):
                self.reply(405)

        self.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.server.daemon_threads = True
        self.origin = f'http://127.0.0.1:{self.server.server_port}'
        self.url = self.origin + '/engine.html'
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={'poll_interval': .05}, daemon=True)

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *_):
        self.server.shutdown()
        self.server.server_close()

    def identity(self):
        return {'origin': self.origin, 'url': self.url, 'fixture': 'tests/fixtures/webkit-feel.html',
                'fixture_sha256': hashlib.sha256(self.payload).hexdigest(), 'privileged_endpoints': False}


class FeelHarness(gui_test.Harness):
    def __init__(self, args, engine, evidence):
        super().__init__(args, engine, evidence)
        self.matrix = {}
        self.result['matrix'] = self.matrix
        self.gecko_tab = None      # Gecko baseline tab of the same page
        self.wk_tab = None         # the tab moved to WebKit

    def launch(self, session, executable, profile):
        super().launch(session, executable, profile)
        # Zen's dialogs over the page must stay open for the user (and this test).
        self.marionette.call('WebDriver:DeleteSession')
        try:
            self.marionette.call('WebDriver:NewSession', {'strictFileInteractability': True,
                                                          'unhandledPromptBehavior': {'default': 'ignore', 'beforeUnload': 'ignore'}})
        except gui_test.MarionetteError:
            self.marionette.call('WebDriver:NewSession', {'strictFileInteractability': True, 'unhandledPromptBehavior': 'ignore'})
        self.marionette.call('WebDriver:SetTimeouts', {'script': int(self.timeout * 1000), 'pageLoad': int(self.timeout * 1000)})
        self.result['test_only_switches'].append('Marionette unhandledPromptBehavior=ignore')

    def run_one(self, name):
        outcome = super().run_one(name)
        if outcome['status'] == 'FAIL':
            # Evidence for the failure, then leave nothing open for the next scenario.
            try:
                native = (self.state().get('native') or {})
                outcome['webkit'] = {k: native.get(k) for k in ('uiLog', 'uiFailures', 'focus', 'cursor', 'frames', 'title')}
            except (gui_test.MarionetteError, OSError, KeyError, TypeError):
                pass
            for method in ('WebDriver:DismissAlert',):
                try:
                    self.marionette.call(method)
                    outcome.setdefault('recovery', []).append(method)
                except (gui_test.MarionetteError, OSError):
                    pass
            try:
                self.key('Escape')
                self.chrome_script('for (const p of document.querySelectorAll("menupopup")) if (p.state === "open") p.hidePopup();'
                                   'try { FullZoom.reset(); } catch {} return true;')
            except (gui_test.MarionetteError, OSError, subprocess.SubprocessError):
                pass
            # A page left blocked (a dialog nobody can see) would fail every later gate: restart WebKit.
            if self.wk_tab and name not in ('crash_retry',):
                try:
                    if self.state()['tabId'] == self.wk_tab and self.webkit_ready():
                        self.live('the failed scenario')
                except (AssertionError, gui_test.MarionetteError, OSError, subprocess.SubprocessError, KeyError, TypeError):
                    try:
                        for pid in self.host_pids():
                            os.kill(pid, signal.SIGKILL)
                        self.wait(lambda: (lambda st: st if st['engine'] == 'gecko' and not st['geckoHidden'] else None)(self.state()),
                                  'the Gecko tab after the recovery kill', timeout=30)
                        self.chrome_script('const box = gBrowser.getNotificationBox(gBrowser.selectedBrowser);'
                                           'const n = box?.getNotificationWithValue?.("axiosozo-webkit-stopped"); if (n) box.removeNotification(n);'
                                           'return true;')
                        self.ensure_webkit('recover-' + name)
                        outcome.setdefault('recovery', []).append('webkit restarted')
                    except (AssertionError, gui_test.MarionetteError, OSError, subprocess.SubprocessError, KeyError, TypeError) as error:
                        outcome.setdefault('recovery', []).append('restart failed: ' + str(error)[:160])
        return outcome

    def live(self, name):
        """The WebKit page still takes input: one click on Increment is counted."""
        before = self.page()['c']
        self.click_at(*AT['count'])
        return self.wait_page(lambda page: page['c'] > before, f'the WebKit page still takes input after {name}', timeout=10)['c']

    # -- state and geometry ---------------------------------------------------------------
    def state(self):
        return self.chrome_script(STATE)

    def page(self, state=None):
        state = state or self.state()
        if state['engine'] == 'webkit':
            return parse_feel((state.get('native') or {}).get('title'))
        return parse_feel(state.get('geckoTitle'))

    def wait_page(self, predicate, description, timeout=None):
        def probe():
            page = self.page()
            return page if page is not None and predicate(page) else None
        try:
            return self.wait(probe, description, timeout=timeout or 20)
        except AssertionError as error:
            raise AssertionError(f'{error}; last page state {self.page()!r}') from None

    def at(self, x, y, state=None):
        view = (state or self.state())['view']
        scale = self.chrome_script('return window.devicePixelRatio;')
        return [round((view['x'] + x) * scale), round((view['y'] + y) * scale)]

    def move(self, x, y):
        point = self.at(x, y)
        self.xdotool('mousemove', '--sync', *point)
        return point

    def click_at(self, x, y, button=1, repeat=1):
        point = self.move(x, y)
        time.sleep(0.05)
        if repeat > 1:
            self.xdotool('click', '--repeat', repeat, '--delay', 70, button)
        else:
            self.xdotool('click', button)
        return point

    def click_screen(self, box, scale):
        point = [round(box['x'] * scale), round(box['y'] * scale)]
        self.xdotool('mousemove', '--sync', *point)
        time.sleep(0.1)
        self.xdotool('click', '1')
        return point

    def key(self, *keys):
        self.xdotool('key', '--clearmodifiers', *keys)

    def type_text(self, text):
        self.xdotool('type', '--delay', '70', text)

    def focus_window(self):
        self.xdotool('windowraise', self.window)
        self.xdotool('windowfocus', '--sync', self.window)

    def select_tab(self, panel):
        self.chrome_script('gBrowser.selectedTab = gBrowser.tabs.find(tab => tab.linkedPanel === arguments[0]); return true;', [panel])
        self.wait(lambda: self.state()['tabId'] == panel, f'tab {panel} selected', timeout=10)
        time.sleep(0.3)

    def gate(self, name, status, **details):
        self.matrix[name] = {'status': status, **details}
        return self.matrix[name]

    def webkit_ready(self, state=None):
        state = state or self.state()
        native = state.get('native') or {}
        return (state['engine'] == 'webkit' and not state['pending'] and native.get('engine') == 'webkit'
                and (native.get('frames') or 0) >= 1 and state['overlay'] and state['overlay']['display'] == 'block'
                and state['geckoHidden'] and self.page(state) is not None)

    def require_webkit(self):
        if self.wk_tab and self.state()['tabId'] != self.wk_tab:
            self.select_tab(self.wk_tab)
        state = self.state()
        if not self.webkit_ready(state):
            raise gui_test.Blocked('needs the WebKit tab: ' + repr({k: state.get(k) for k in ('engine', 'failure', 'pending')}))
        return state

    def clipboard(self, primary=False):
        return self.chrome_script(CLIPBOARD_READ, [primary])

    @staticmethod
    def host_pids():
        return [int(pid) for pid in subprocess.run(['pgrep', '-f', HOST], capture_output=True, text=True).stdout.split()]

    def tab_menu(self, label, name):
        """Zen's tab context menu with real pointer clicks (the "Open in" submenu with three engines)."""
        return WEBKIT.tab_menu_switch(self, label, name)

    def ensure_webkit(self, name):
        if self.wk_tab and self.state()['tabId'] != self.wk_tab:
            self.select_tab(self.wk_tab)
        if not self.webkit_ready():
            if self.state()['engine'] != 'webkit':
                self.focus_window()
                self.tab_menu('Open in WebKit', name)
            self.wait(lambda: self.webkit_ready(), 'the test tab presented in WebKit', timeout=60)
        return self.state()

    def char_x(self, index):
        # DejaVu Sans Mono / Liberation Mono 16px advance ~9.6px; centre of character `index`.
        return 20 + 9.6 * index + 4.8

    def alert_text(self):
        """Text of the user prompt Marionette sees (Zen's commonDialog), or None (scripts are refused while one is open)."""
        try:
            return self.marionette.call('WebDriver:GetAlertText')['value']
        except gui_test.MarionetteError:
            return None

    def answer_prompt(self, key_sequence, accept, text=None):
        for item in key_sequence:
            if item.startswith('type:'):
                self.type_text(item[5:])
            else:
                self.key(item)
        try:
            self.wait(lambda: self.alert_text() is None, 'dialog closed by the keyboard', timeout=6)
            return 'keyboard'
        except AssertionError:
            if text is not None:
                self.marionette.call('WebDriver:SendAlertText', {'text': text})
            self.marionette.call('WebDriver:AcceptAlert' if accept else 'WebDriver:DismissAlert')
            return 'webdriver (keyboard did not reach the dialog)'

    def clear_field(self, name):
        self.click_at(*AT[name])
        self.key('ctrl+a')
        self.key('BackSpace')

    # -- scenarios -----------------------------------------------------------------------
    def scenario_switch(self):
        url = self.fixture.url
        self.open_tab(url)
        self.wait_page(lambda page: page['p'] == '1', 'feel page in the Gecko baseline tab')
        self.gecko_tab = self.state()['tabId']
        self.open_tab(url)
        gecko = self.wait_page(lambda page: page['p'] == '1', 'feel page in Gecko before the switch')
        self.focus_window()
        time.sleep(1)
        self.screenshot('01-gecko')
        started = time.monotonic()
        menu = self.tab_menu('Open in WebKit', '02-to-webkit')
        state = self.wait(lambda: (lambda s: s if self.webkit_ready(s) else None)(self.state()), 'WebKit frames of the feel page', timeout=60)
        seconds = round(time.monotonic() - started, 2)
        self.wk_tab = state['tabId']
        native = state['native']
        if not (native.get('inputFeatures') or {}).get('ime'):
            raise AssertionError('the WebKit host did not negotiate browser UI (ime): ' + repr(native.get('inputFeatures')))
        self.wait(lambda: 'AxioSozo feel' in self.window_title(), 'X11 window title from the WebKit page', timeout=10)
        time.sleep(1)
        self.screenshot('02-webkit')
        self.gate('e1_render_in_content_area', 'PASS', screenshot='02-webkit.png', seconds=seconds,
                  first_frame_ms=native.get('firstFrameMilliseconds'), surface=native.get('surface'))
        return {'menu': menu, 'seconds': seconds, 'gecko_page': gecko, 'native': {k: native.get(k) for k in (
            'renderPath', 'frames', 'surface', 'firstFrameMilliseconds', 'inputFeatures', 'frameTransport')}}

    def scenario_polish(self):
        state = self.require_webkit()
        icon = self.wait(lambda: (lambda s: s['icon'] if str(s['icon'] or '').startswith('data:image/png;base64,') else None)(self.state()),
                         'the page icon on the WebKit tab (host favicon → Zen setIcon)', timeout=15)
        state = self.state()
        indicator = state['indicator'] or {}
        visible = indicator and not indicator['hidden'] and indicator['width'] > 0 and indicator['inUrlbar'] and indicator['label'] == 'WebKit'
        probe_hidden = not state['probe'] or state['probe']['display'] == 'none'
        self.screenshot('03-favicon-indicator')
        # The tab menu of the WebKit tab: engine entries and their notes.
        rect = self.chrome_script('const r = gBrowser.selectedTab.getBoundingClientRect();'
                                  'return {x: mozInnerScreenX + r.left + Math.min(r.width / 2, 60), '
                                  'y: mozInnerScreenY + r.top + r.height / 2, scale: devicePixelRatio};')
        self.xdotool('mousemove', '--sync', round(rect['x'] * rect['scale']), round(rect['y'] * rect['scale']))
        self.xdotool('click', '3')
        menu = self.wait(lambda: self.chrome_script("""
            const menu = document.getElementById('tabContextMenu');
            if (menu.state !== 'open') return null;
            const item = document.getElementById('axiosozo-context-engine'), sub = document.getElementById('axiosozo-context-engine-menu');
            return {item: item.hidden ? null : {label: item.getAttribute('label'), note: item.getAttribute('acceltext')},
              submenu: sub.hidden ? null : [...sub.querySelectorAll('menuitem')].map(e => ({label: e.getAttribute('label'),
                note: e.getAttribute('acceltext'), checked: e.getAttribute('checked') === 'true'}))};"""), 'tab menu', timeout=10)
        time.sleep(0.6)
        self.screenshot('03-tab-menu', settle=False)
        self.key('Escape')
        status = 'PASS' if visible and probe_hidden else 'FAIL'
        self.gate('favicon_title', 'PASS', screenshot='03-favicon-indicator.png', icon_prefix=icon[:40], icon_bytes=len(icon),
                  tab_label=state['label'])
        self.gate('engine_indicator', status, screenshot='03-favicon-indicator.png', indicator=indicator, probe=state['probe'])
        self.gate('tab_menu_engine_labels', 'PASS', screenshot='03-tab-menu.png', menu=menu)
        if status == 'FAIL':
            raise AssertionError('engine indicator: ' + repr({'indicator': indicator, 'probe': state['probe']}))
        return {'icon_bytes': len(icon), 'indicator': indicator, 'menu': menu, 'label': state['label']}

    def scenario_typing(self):
        self.require_webkit()
        self.focus_window()
        self.click_at(*AT['text'])
        self.wait_page(lambda page: page['f'] == 'text', 'the text field focused in WebKit')
        self.type_text('zen feel 1')
        self.wait_page(lambda page: page['t'] == 'zen feel 1', 'typed text in the WebKit field')
        self.key('BackSpace')
        page = self.wait_page(lambda page: page['t'] == 'zen feel ', 'Backspace in the WebKit field')
        self.key('ctrl+BackSpace')
        try:
            page = self.wait_page(lambda page: page['t'] in ('zen ', 'zen feel'), 'Ctrl+Backspace deletes a word', timeout=6)
            word = 'PASS'
        except AssertionError:
            word = 'got ' + repr(self.page()['t'])
        self.key('Tab')
        tab = self.wait_page(lambda page: page['f'] == 'count', 'Tab moves page focus to the button', timeout=8)['f']
        self.screenshot('04-typed-focus-ring')
        self.gate('typing', 'PASS', screenshot='04-typed-focus-ring.png', value=page['t'], ctrl_backspace=word, tab_focus=tab)
        return {'page': page, 'ctrl_backspace': word}

    def scenario_selection(self):
        self.require_webkit()
        self.move(self.char_x(0) - 3, SEL_TOP)
        self.xdotool('mousedown', '1')
        for index in (2, 5, 8, 9):
            self.move(self.char_x(index) + 4, SEL_TOP)
            time.sleep(0.06)
        self.xdotool('mouseup', '1')
        drag = self.wait_page(lambda page: page['s'].startswith('alpha b'), 'drag selection of "alpha b…"')
        self.screenshot('05-drag-selection')
        self.click_at(self.char_x(13), SEL_TOP, repeat=2)
        double = self.wait_page(lambda page: page['s'].strip() == 'gamma', 'double-click selects "gamma"')
        self.screenshot('05-double-click')
        try:
            self.click_at(self.char_x(13), SEL_TOP, repeat=3)
            triple = self.wait_page(lambda page: 'alpha beta gamma delta' in page['s'], 'triple-click selects the line', timeout=6)['s']
        except AssertionError as error:
            triple = 'not observed: ' + str(error)[:160]
        self.gate('selection_drag_double_click', 'PASS', drag=drag['s'], double=double['s'], triple=triple,
                  screenshots=['05-drag-selection.png', '05-double-click.png'])
        return {'drag': drag['s'], 'double': double['s'], 'triple': triple}

    def scenario_clipboard(self):
        self.require_webkit()
        steps = {}
        self.click_at(self.char_x(13), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'gamma', '"gamma" selected')
        self.key('ctrl+c')
        steps['copied'] = self.wait(lambda: (lambda v: v if (v.get('text') or '').strip() == 'gamma' else None)(self.clipboard()),
                                    'Zen clipboard holds WebKit\'s copy "gamma"', timeout=10)['text']
        self.clear_field('area')
        self.key('ctrl+v')
        steps['pasted_in_webkit'] = self.wait_page(lambda page: page['a'].strip() == 'gamma', 'Ctrl+V in WebKit')['a']
        self.select_tab(self.gecko_tab)
        self.clear_field('area')
        self.key('ctrl+v')
        steps['pasted_in_gecko'] = self.wait_page(lambda page: page['a'].strip() == 'gamma', 'WebKit copy pasted in the Gecko tab')['a']
        self.click_at(self.char_x(19), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'delta', '"delta" selected in Gecko')
        self.key('ctrl+c')
        self.wait(lambda: (lambda v: v if (v.get('text') or '').strip() == 'delta' else None)(self.clipboard()), 'Gecko copy "delta"', timeout=10)
        self.select_tab(self.wk_tab)
        self.wait(lambda: self.webkit_ready(), 'WebKit tab presented', timeout=15)
        self.clear_field('text')
        self.key('ctrl+v')
        steps['gecko_to_webkit'] = self.wait_page(lambda page: page['t'].strip() == 'delta', 'Gecko copy pasted in WebKit')['t']
        self.chrome_script(CLIPBOARD_WRITE, ['from zen'])
        self.clear_field('area')
        self.key('ctrl+v')
        steps['zen_to_webkit'] = self.wait_page(lambda page: page['a'] == 'from zen', 'Zen chrome copy pasted in WebKit')['a']
        self.key('ctrl+a')
        self.key('ctrl+x')
        steps['cut'] = self.wait_page(lambda page: page['a'] == '', 'Ctrl+X empties the field')['a']
        steps['cut_clipboard'] = self.wait(lambda: (lambda v: v if v.get('text') == 'from zen' else None)(self.clipboard()),
                                           'Ctrl+X put the text on Zen\'s clipboard', timeout=10)['text']
        self.key('ctrl+z')
        try:
            steps['undo'] = self.wait_page(lambda page: page['a'] == 'from zen', 'Ctrl+Z restores the cut text', timeout=6)['a']
        except AssertionError as error:
            steps['undo'] = 'not observed: ' + str(error)[:160]
        self.screenshot('06-clipboard')
        self.gate('clipboard_ctrl_c_v', 'PASS', screenshot='06-clipboard.png', **{k: v for k, v in steps.items() if isinstance(v, str)})
        return steps

    def scenario_middle_click(self):
        self.require_webkit()
        out = {}
        self.click_at(self.char_x(19), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'delta', 'WebKit: "delta" selected')
        out['primary_after_webkit_selection'] = self.wait(
            lambda: (lambda v: v if (v.get('text') or '').strip() == 'delta' else None)(self.clipboard(primary=True)),
            'WebKit selection published as PRIMARY', timeout=10).get('text')
        self.select_tab(self.gecko_tab)
        self.clear_field('area')
        self.click_at(*AT['area'], button=2)
        try:
            out['gecko_pastes_webkit_primary'] = self.wait_page(lambda page: 'delta' in page['a'], 'Gecko middle-click pastes it', timeout=8)['a']
        except AssertionError:
            out['gecko_pastes_webkit_primary'] = None
        self.click_at(self.char_x(1), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'alpha', 'Gecko: "alpha" selected (PRIMARY)')
        time.sleep(0.4)
        self.select_tab(self.wk_tab)
        self.wait(lambda: self.webkit_ready(), 'WebKit tab presented', timeout=15)
        self.clear_field('area')
        self.move(*AT['area'])
        time.sleep(0.4)  # the text cursor over the field comes from the host's hit test
        self.click_at(*AT['area'], button=2)
        try:
            out['webkit_pastes_gecko_primary'] = self.wait_page(lambda page: 'alpha' in page['a'], 'WebKit middle-click pastes PRIMARY', timeout=8)['a']
        except AssertionError:
            out['webkit_pastes_gecko_primary'] = None
        out['middle_event'] = self.page()['mb']
        self.screenshot('07-middle-click')
        ok = out['webkit_pastes_gecko_primary'] and out['primary_after_webkit_selection']
        self.gate('primary_selection_middle_click', 'PASS' if ok else 'FAIL', screenshot='07-middle-click.png', **out)
        if not ok:
            raise AssertionError('PRIMARY: ' + repr(out))
        return out

    def measure_wheel(self):
        results = {}
        for kind in ('notch', 'precise'):
            self.scroll_top()
            before = self.page()
            self.move(*AT['blank'])
            if kind == 'notch':
                self.xdotool('click', '5')
            else:
                view = self.state()['view']
                self.chrome_script("""
                    const [x, y] = arguments;
                    window.windowUtils.sendWheelEvent(x - mozInnerScreenX, y - mozInnerScreenY, 0, 120, 0, 0, 0, 0, 0, 0);
                    return true;""", [view['x'] + AT['blank'][0], view['y'] + AT['blank'][1]])
            page = self.wait_page(lambda page: page['ws'] is not None and page['ws'] != before['ws'] and page['y'] > 0,
                                  f'{kind} wheel scroll measured by the page')
            results[kind] = page['ws']
        self.scroll_top()
        return results

    def scroll_top(self):
        if self.page()['y'] == 0:
            return
        self.move(*AT['blank'])
        for _ in range(60):
            self.xdotool('click', '4')
            if self.page()['y'] == 0:
                break
        self.wait_page(lambda page: page['y'] == 0, 'page scrolled back to the top', timeout=15)
        time.sleep(0.8)

    def scenario_wheel(self):
        self.require_webkit()
        webkit = self.measure_wheel()
        self.move(*AT['blank'])
        for _ in range(6):
            self.xdotool('click', '5')
            time.sleep(0.05)
        scrolled = self.wait_page(lambda page: page['y'] > 150, 'six notches scroll the WebKit page')
        self.screenshot('08-scrolled')
        self.scroll_top()
        self.select_tab(self.gecko_tab)
        gecko = self.measure_wheel()
        self.select_tab(self.wk_tab)
        self.wait(lambda: self.webkit_ready(), 'WebKit tab presented', timeout=15)
        animated = webkit['notch']['n'] >= 3
        immediate = webkit['precise']['n'] <= 2
        distance = webkit['notch']['y'] / max(1, gecko['notch']['y'])
        status = 'PASS' if animated and immediate and 0.8 <= distance <= 1.25 else 'EXPERIMENTAL'
        self.gate('wheel_precise_vs_notch', status, webkit=webkit, gecko=gecko, notch_distance_ratio=round(distance, 2),
                  screenshot='08-scrolled.png', note='precise = widget wheel event in pixels; notch = X11 button 5')
        return {'webkit': webkit, 'gecko': gecko, 'six_notches_y': scrolled['y']}

    def scenario_cursor(self):
        self.require_webkit()
        seen, wrong = {}, {}
        for element, (x, expected) in CURSORS.items():
            self.move(x, 220)
            try:
                seen[element] = self.wait(lambda: (lambda c: c if c == expected else None)(self.state()['view']['cursor']),
                                          f'cursor {expected} over #{element}', timeout=6)
            except AssertionError:
                wrong[element] = {'expected': expected, 'seen': self.state()['view']['cursor']}
        for name, expected in (('text', 'text'), ('link', 'pointer'), ('blank', 'default')):
            self.move(*AT[name])
            try:
                seen[name] = self.wait(lambda: (lambda c: c if c == expected else None)(self.state()['view']['cursor']),
                                       f'{expected} cursor over {name}', timeout=6)
            except AssertionError:
                wrong[name] = {'expected': expected, 'seen': self.state()['view']['cursor']}
        self.gate('cursor_shapes', 'PASS' if not wrong else 'FAIL', seen=seen, wrong=wrong,
                  note='X11 screenshots do not include the pointer; asserted on the engine view\'s CSS cursor')
        if wrong:
            raise AssertionError('cursor mismatch: ' + repr(wrong))
        return {'seen': seen}

    def scenario_select_popup(self):
        self.require_webkit()
        self.click_at(*AT['select'])
        popup = self.wait(lambda: (lambda p: p if p['open'] else None)(self.chrome_script(SELECT_POPUP)), 'Zen-drawn <select> popup', timeout=15)
        time.sleep(0.8)
        self.screenshot('09-select-open', settle=False)
        three = next(item for item in popup['items'] if item['label'] == 'three')
        self.click_screen(three['box'], popup['scale'])
        picked = self.wait_page(lambda page: page['sel'] == 'three', '<select> choice by pointer')['sel']
        self.click_at(*AT['select'])
        self.wait(lambda: self.chrome_script(SELECT_POPUP)['open'], 'popup again', timeout=15)
        time.sleep(0.4)
        self.key('Up')
        self.key('Return')
        keyboard = self.wait_page(lambda page: page['sel'] == 'two', '<select> choice by keyboard', timeout=10)['sel']
        self.click_at(*AT['select'])
        self.wait(lambda: self.chrome_script(SELECT_POPUP)['open'], 'popup a third time', timeout=15)
        self.key('Escape')
        self.wait(lambda: not self.chrome_script(SELECT_POPUP)['open'], 'Escape closes it', timeout=10)
        kept = self.page()['sel']
        self.screenshot('09-select-closed')
        self.gate('select_popup', 'PASS' if kept == 'two' else 'FAIL', screenshot='09-select-open.png', pointer=picked,
                  keyboard=keyboard, escape_keeps=kept, items=[i['label'] for i in popup['items']])
        # <datalist>: WPE 2.48 has no suggestion API for embedders.
        self.click_at(*AT['dl'])
        self.type_text('ap')
        time.sleep(1.0)
        self.screenshot('09-datalist')
        self.gate('datalist_popup', 'NOT_VERIFIED', screenshot='09-datalist.png', value=self.page()['dl'],
                  note='WPE WebKit 2.48 (libwpe API) exposes no datalist suggestion hook to the embedder; typing reaches the field')
        return {'pointer': picked, 'keyboard': keyboard, 'popup': [i['label'] for i in popup['items']]}

    def scenario_context_menu(self):
        self.require_webkit()
        self.key('Escape')
        self.click_at(self.char_x(7), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'beta', '"beta" selected')
        self.click_at(self.char_x(7), SEL_TOP, button=3)
        menu = self.wait(lambda: (lambda m: m if m['open'] else None)(self.chrome_script(CONTEXT_MENU)),
                         'Zen-drawn context menu for the WebKit selection', timeout=15)
        time.sleep(0.8)
        self.screenshot('10-context-menu', settle=False)
        actions = [item['action'] for item in menu['items']]
        if 'copy' not in actions or 'open_in_firefox' not in actions:
            raise AssertionError('context menu lacks the selection items: ' + repr(menu))
        self.chrome_script("""const popup = document.getElementById('axiosozo-chromium-context-menu');
            popup.activateItem([...popup.children].find(n => n.dataset?.action === 'copy')); return true;""")
        copied = self.wait(lambda: (lambda v: v if (v.get('text') or '').strip() == 'beta' else None)(self.clipboard()),
                           'context-menu Copy put "beta" on Zen\'s clipboard', timeout=10)
        self.click_at(*AT['link'], button=3)
        link_menu = self.wait(lambda: (lambda m: m if m['open'] else None)(self.chrome_script(CONTEXT_MENU)), 'link menu', timeout=15)
        time.sleep(0.8)
        self.screenshot('10-link-menu', settle=False)
        self.key('Escape')
        self.wait(lambda: not self.chrome_script(CONTEXT_MENU)['open'], 'closed', timeout=10)
        self.click_at(*AT['img'], button=3)
        image_menu = self.wait(lambda: (lambda m: m if m['open'] else None)(self.chrome_script(CONTEXT_MENU)), 'image menu', timeout=15)
        time.sleep(0.8)
        self.screenshot('10-image-menu', settle=False)
        self.key('Escape')
        self.wait(lambda: not self.chrome_script(CONTEXT_MENU)['open'], 'closed', timeout=10)
        self.click_at(*AT['blank'], button=3)
        page_menu = self.wait(lambda: (lambda m: m if m['open'] else None)(self.chrome_script(CONTEXT_MENU)), 'page menu', timeout=15)
        time.sleep(0.8)
        self.screenshot('10-page-menu', settle=False)
        self.key('Escape')
        self.wait(lambda: not self.chrome_script(CONTEXT_MENU)['open'], 'context menu closed by Escape', timeout=10)
        alive = self.live('the context menus')
        link_actions = [i['action'] for i in link_menu['items']]
        image_actions = [i['action'] for i in image_menu['items']]
        ok = 'open_link_new_tab' in link_actions and 'copy_link' in link_actions and 'copy_image_link' in image_actions
        self.gate('context_menu', 'PASS' if ok else 'FAIL', screenshots=['10-context-menu.png', '10-link-menu.png', '10-image-menu.png',
                  '10-page-menu.png'], aria_label=menu['label'], selection_items=[i['label'] for i in menu['items']],
                  link_items=[i['label'] for i in link_menu['items']], image_items=[i['label'] for i in image_menu['items']],
                  page_items=[i['label'] for i in page_menu['items']], copied=copied.get('text'), input_after=alive,
                  note='xwd may capture XUL popups black under software WebRender (as Firefox\'s own); items are asserted from the open menupopup')
        if not ok:
            raise AssertionError('link/image items missing: ' + repr({'link': link_actions, 'image': image_actions}))
        return {'selection': actions, 'link': link_actions, 'image': image_actions, 'page_contextmenu_events': self.page()['cm']}

    def dialog(self, button, key_sequence, expect, name, accept, text=None):
        self.click_at(*AT[button])
        shown = self.wait(lambda: self.alert_text(), f'Zen dialog for {button}', timeout=15)
        time.sleep(0.6)
        self.screenshot(name, settle=False)
        via = self.answer_prompt(key_sequence, accept, text)
        page = self.wait_page(lambda page: expect in page['d'], f'page saw {expect}')
        return {'dialog_text': shown, 'via': via, 'result': page['d'][-1]}

    def scenario_dialogs(self):
        self.require_webkit()
        out = {'alert': self.dialog('d-alert', ['Return'], 'alert', '11-alert', True)}
        time.sleep(3.5)  # Firefox's successive-dialog window (dom.successive_dialog_time_limit)
        out['confirm'] = self.dialog('d-confirm', ['Escape'], 'confirm=false', '11-confirm', False)
        time.sleep(3.5)
        out['prompt'] = self.dialog('d-prompt', ['ctrl+a', 'type:zen', 'Return'], 'prompt=zen', '11-prompt', True, text='zen')
        keyboard = all(item['via'] == 'keyboard' for item in out.values())
        self.gate('js_dialogs', 'PASS' if keyboard else 'EXPERIMENTAL', screenshots=['11-alert.png', '11-confirm.png', '11-prompt.png'],
                  via={k: v['via'] for k, v in out.items()}, results=self.page()['d'])
        return out

    def scenario_beforeunload(self):
        self.require_webkit()
        time.sleep(3.5)
        self.click_at(*AT['d-unload'])
        self.wait_page(lambda page: 'armed' in page['d'], 'beforeunload armed')
        self.click_at(*AT['link'])
        try:
            shown = self.wait(lambda: self.alert_text() is not None or None, 'Zen beforeunload dialog', timeout=12)
        except AssertionError:
            shown = None
        if not shown:
            page = self.page()
            self.gate('beforeunload', 'FAIL', reason='no dialog', page=page)
            raise AssertionError('no beforeunload dialog; page ' + repr(page))
        time.sleep(0.6)
        self.screenshot('12-beforeunload', settle=False)
        via = self.answer_prompt(['Escape'], False)
        time.sleep(1.5)
        stayed = self.page()
        frames_before = (self.state()['native'] or {}).get('frames', 0)
        self.click_at(*AT['count'])
        live = self.wait_page(lambda page: page['c'] > stayed['c'], 'the page still renders after Stay', timeout=10)
        frames_after = (self.state()['native'] or {}).get('frames', 0)
        self.click_at(*AT['link'])
        self.wait(lambda: self.alert_text() is not None or None, 'beforeunload dialog again', timeout=12)
        self.answer_prompt(['Return'], True)
        left = self.wait_page(lambda page: page['p'] == '2', 'Leave goes to page 2', timeout=20)
        self.gate('beforeunload', 'PASS' if stayed['p'] == '1' and left['p'] == '2' else 'FAIL', screenshot='12-beforeunload.png',
                  via=via, stayed_on=stayed['p'], frames_after_stay=[frames_before, frames_after], left_to=left['p'])
        # Back to page 1 for the next scenarios.
        self.chrome_script('BrowserCommands.back(); return true;')
        self.wait_page(lambda page: page['p'] == '1', 'back to page 1', timeout=20)
        return {'stayed': stayed['p'], 'live_count': live['c'], 'left': left['p']}

    def scenario_permission(self):
        self.require_webkit()
        self.click_at(*AT['perm'])
        hanger = self.wait(lambda: self.chrome_script(DOORHANGER), 'Zen permission doorhanger for the WebKit page', timeout=15)
        time.sleep(0.8)
        self.screenshot('13-permission', settle=False)
        self.click_screen(hanger['secondary']['box'], hanger['scale'])
        result = self.wait_page(lambda page: page['perm'] not in ('',), 'the page saw the decision', timeout=10)['perm']
        self.gate('permission_prompt', 'PASS' if result == 'geo:1' else 'FAIL', screenshot='13-permission.png', doorhanger={
            k: hanger[k] for k in ('message', 'name')}, buttons=[hanger['primary']['label'], hanger['secondary']['label']], page=result,
            note='fixture mode: decisions are never remembered; Block → PERMISSION_DENIED (code 1)')
        if result != 'geo:1':
            raise AssertionError('permission result ' + repr(result))
        return {'result': result, 'doorhanger': hanger}

    def scenario_file_dialog(self):
        self.require_webkit()
        sample = Path(self.result['session']) / 'feel-upload.txt'
        sample.write_text('webkit feel upload\n')
        before = set(self.xdotool('search', '--onlyvisible', '--name', '.').split())
        self.click_at(*AT['file'])
        def dialog_window():
            ids = set(self.xdotool('search', '--onlyvisible', '--name', '.').split()) - before
            return list(ids) or None
        try:
            windows = self.wait(dialog_window, 'Zen\'s (GTK) file picker window', timeout=15)
        except AssertionError:
            self.gate('file_dialog', 'FAIL', reason='no picker window')
            raise
        time.sleep(1.5)
        self.screenshot('14-file-picker', settle=False)
        self.key('ctrl+l')
        time.sleep(0.3)
        self.xdotool('type', '--delay', '30', str(sample))
        time.sleep(0.3)
        self.xdotool('key', 'Return')
        try:
            chosen = self.wait_page(lambda page: page['file'] == 'feel-upload.txt', 'the page got the chosen file', timeout=15)['file']
        except AssertionError:
            chosen = self.page()['file']
        self.gate('file_chooser', 'PASS' if chosen == 'feel-upload.txt' else 'EXPERIMENTAL', screenshot='14-file-picker.png',
                  windows=windows, chosen=chosen)
        return {'chosen': chosen}

    def scenario_download(self):
        self.require_webkit()
        self.click_at(*AT['dl-link'])
        notice = self.wait(lambda: self.state()['notice'], 'a Zen notice for the refused download', timeout=10)
        self.screenshot('15-download-refused')
        self.gate('downloads_refused', 'PASS' if 'Download' in notice or 'download' in notice else 'EXPERIMENTAL',
                  screenshot='15-download-refused.png', notice=notice)
        return {'notice': notice}

    def scenario_find(self):
        self.require_webkit()
        self.click_at(*AT['blank'])
        self.key('ctrl+f')
        self.wait(lambda: (lambda b: b if b['open'] else None)(self.chrome_script(FINDBAR_STATE)), 'Zen findbar open', timeout=10)
        self.type_text('needle')
        found = self.wait(lambda: (lambda b: b if b['value'] == 'needle' and ('3' in str(b['matches']) + str(b['matchesArgs'])) else None)(
            self.chrome_script(FINDBAR_STATE)), 'findbar reports 3 matches from WebKit', timeout=15)
        self.key('Return')
        time.sleep(0.6)
        second = self.chrome_script(FINDBAR_STATE)
        self.screenshot('16-find')
        self.key('Escape')
        self.wait(lambda: not self.chrome_script(FINDBAR_STATE)['open'], 'findbar closed', timeout=10)
        self.gate('find_in_page', 'PASS', screenshot='16-find.png', findbar=found, after_enter=second)
        return {'found': found, 'next': second}

    def zoom_cycle(self):
        self.click_at(*AT['blank'])
        # Page zoom narrows the CSS viewport in both engines (Gecko also raises devicePixelRatio, WebKit does not).
        base = self.page()['z'][1]
        out = {'base': base, 'dpr': self.page()['z'][0]}
        self.key('ctrl+equal')
        out['ctrl_equal'] = self.wait_page(lambda page: page['z'][1] < base * 0.95, 'Ctrl+= zooms', timeout=10)['z'][1]
        self.screenshot(f'17-zoomed-{self.state()["engine"]}')
        out['urlbar_zoom_button'] = self.chrome_script('const b = document.getElementById("urlbar-zoom-button");'
                                                       'return b ? {hidden: b.hidden, label: b.getAttribute("label")} : null;')
        self.key('ctrl+0')
        try:
            out['ctrl_0'] = self.wait_page(lambda page: page['z'][1] == base, 'Ctrl+0 resets', timeout=6)['z'][1]
        except AssertionError:
            out['ctrl_0'] = self.page()['z'][1]
        self.chrome_script('FullZoom.reset(); return true;')
        self.wait_page(lambda page: page['z'][1] == base, "Zen's FullZoom.reset", timeout=10)
        self.key('ctrl+minus')
        out['ctrl_minus'] = self.wait_page(lambda page: page['z'][1] > base * 1.05, 'Ctrl+- zooms out', timeout=10)['z'][1]
        self.chrome_script('FullZoom.reset(); return true;')
        self.wait_page(lambda page: page['z'][1] == base, 'back to 100%', timeout=10)
        if self.state()['engine'] == 'webkit':
            self.move(*AT['blank'])
            self.xdotool('keydown', 'ctrl')
            self.xdotool('click', '4')
            self.xdotool('keyup', 'ctrl')
            try:
                out['ctrl_wheel'] = self.wait_page(lambda page: page['z'][1] < base * 0.95, 'Ctrl+wheel zooms', timeout=8)['z'][1]
            except AssertionError:
                out['ctrl_wheel'] = self.page()['z'][1]
            self.chrome_script('FullZoom.reset(); return true;')
            self.wait_page(lambda page: page['z'][1] == base, 'back to 100%', timeout=10)
        return out

    def scenario_zoom(self):
        self.require_webkit()
        self.select_tab(self.gecko_tab)
        gecko = self.zoom_cycle()
        self.select_tab(self.wk_tab)
        self.wait(lambda: self.webkit_ready(), 'WebKit tab presented', timeout=15)
        webkit = self.zoom_cycle()
        same_ctrl_0 = (webkit['ctrl_0'] == webkit['base']) == (gecko['ctrl_0'] == gecko['base'])
        status = 'PASS' if same_ctrl_0 and webkit.get('ctrl_wheel', webkit['base']) < webkit['base'] else 'EXPERIMENTAL'
        self.gate('page_zoom', status, screenshot='17-zoomed-webkit.png', webkit=webkit, gecko=gecko)
        return {'webkit': webkit, 'gecko': gecko}

    def compose(self, engine, field):
        self.clear_field(field)
        self.wait_page(lambda page: page[{'text': 't', 'edit': 'e'}[field]] == '', f'{engine} {field} cleared')
        time.sleep(0.5)
        begun = self.chrome_script(IME, ['begin', 'にほん'])
        time.sleep(1.0)
        self.screenshot(f'18-preedit-{engine}-{field}', settle=False)
        state = self.state()
        self.chrome_script(IME, ['commit', '日本'])
        key = {'text': 't', 'edit': 'e'}[field]
        try:
            committed = self.wait_page(lambda page: page[key] == '日本', f'{engine}: composition committed', timeout=8)[key]
        except AssertionError:
            committed = 'got ' + repr(self.page()[key])
        return {'begin': begun, 'focus_during': state['focus'], 'committed': committed}

    def scenario_ime(self):
        self.require_webkit()
        self.select_tab(self.gecko_tab)
        gecko = self.compose('gecko', 'text')
        self.select_tab(self.wk_tab)
        self.wait(lambda: self.webkit_ready(), 'WebKit tab presented', timeout=15)
        webkit = self.compose('webkit', 'text')
        editable = self.compose('webkit', 'edit')
        self.screenshot('18-ime-committed')
        ok = webkit['committed'] == '日本' and editable['committed'] == '日本' and str(webkit['focus_during']).startswith('proxy-')
        self.gate('ime_composition_preedit', 'PASS' if ok else 'FAIL', screenshots=['18-preedit-webkit-text.png', '18-preedit-webkit-edit.png',
                  '18-ime-committed.png'], gecko=gecko, webkit=webkit, contenteditable=editable,
                  note="composition from Gecko's nsITextInputProcessor on Zen's proxy editor (no IBus/Fcitx daemon under Xvfb); "
                       'the preedit screenshots show WebKit\'s underlined composition')
        if not ok:
            raise AssertionError('IME: ' + repr({'webkit': webkit, 'edit': editable}))
        return {'gecko': gecko, 'webkit': webkit, 'edit': editable}

    def scenario_shortcuts(self):
        self.ensure_webkit('19-to-webkit')
        out = {}
        self.click_at(*AT['text'])
        self.key('ctrl+Return')
        out['ctrl_enter_reaches_page'] = self.wait_page(lambda page: page['k'].startswith('C:Enter'), 'Ctrl+Enter reaches the page', timeout=8)['k']
        self.key('Escape')
        out['escape_reaches_page'] = self.wait_page(lambda page: ':Escape:' in page['k'], 'Escape reaches the page', timeout=8)['k']
        key_before = self.page()['k']
        self.click_at(*AT['blank'])
        self.key('ctrl+Tab')
        out['ctrl_tab'] = self.wait(lambda: (lambda s: s['tabId'] if s['tabId'] != self.wk_tab else None)(self.state()),
                                    'Ctrl+Tab leaves the WebKit tab', timeout=10)
        self.key('ctrl+shift+Tab')
        self.wait(lambda: self.state()['tabId'] == self.wk_tab, 'Ctrl+Shift+Tab returns', timeout=10)
        self.wait(lambda: self.webkit_ready(), 'WebKit tab presented again', timeout=15)
        self.click_at(*AT['blank'])
        loads = self.page()['l']
        self.key('F5')
        out['f5'] = self.wait_page(lambda page: page['l'] == loads + 1, 'F5 reloads the WebKit page', timeout=20)['l']
        self.click_at(*AT['blank'])
        loads = self.page()['l']
        self.key('ctrl+r')
        out['ctrl_r'] = self.wait_page(lambda page: page['l'] == loads + 1, 'Ctrl+R reloads the WebKit page', timeout=20)['l']
        last = self.page()['k']
        out['page_last_key'] = last
        out['page_saw_chrome_keys'] = last != key_before and any(last.startswith(p) for p in ('C:Tab:', 'C:r:', ':F5:'))
        self.gate('shortcut_ownership', 'FAIL' if out['page_saw_chrome_keys'] else 'PASS', details=out,
                  checked=['Ctrl+Enter, Escape → page', 'Ctrl+Tab, Ctrl+Shift+Tab, F5, Ctrl+R → Zen', 'Ctrl+F/Ctrl+=/-/0 (find, zoom)'])
        if out['page_saw_chrome_keys']:
            raise AssertionError('the page received a Zen shortcut: ' + last)
        return out

    def scenario_hidpi(self):
        self.ensure_webkit('20-to-webkit')
        one = self.page()['z']
        self.chrome_script('Services.prefs.setCharPref("layout.css.devPixelsPerPx", "2"); return true;')
        try:
            two = self.wait_page(lambda page: page['z'][0] == 2, 'WebKit page at devicePixelRatio 2', timeout=30)
            surface = self.wait(lambda: (lambda n: n if (n.get('surface') or {}).get('device_scale') == 2 and n.get('frames') else None)(
                self.state()['native'] or {}), 'a 2x surface', timeout=20)['surface']
            time.sleep(1.5)
            self.screenshot('21-hidpi-2x')
        finally:
            self.chrome_script('Services.prefs.clearUserPref("layout.css.devPixelsPerPx"); return true;')
        back = self.wait_page(lambda page: page['z'][0] == 1, 'back to devicePixelRatio 1', timeout=30)
        self.click_at(*AT['count'])
        clicked = self.wait_page(lambda page: page['c'] >= 1, 'input lands at 1x again', timeout=10)['c']
        self.gate('hidpi_1x_2x', 'PASS', screenshot='21-hidpi-2x.png', one=one, two=two['z'], surface=surface, back=back['z'], click=clicked)
        return {'one': one, 'two': two['z'], 'surface': surface}

    def scenario_crash_retry(self):
        self.ensure_webkit('22-to-webkit')
        pids = self.host_pids()
        if len(pids) != 1:
            raise AssertionError(f'expected one WebKit host, found {pids}')
        os.kill(pids[0], signal.SIGKILL)
        self.wait(lambda: (lambda s: s if s['engine'] == 'gecko' and not s['geckoHidden'] else None)(self.state()),
                  'the Gecko tab shown again after the host died', timeout=30)
        self.wait(lambda: self.chrome_script(NOTIFICATIONS, ['axiosozo-webkit-stopped']), 'the stopped notice', timeout=10)
        # Zen slides the notice in: click once its button is laid out and has stopped moving.
        def settled():
            first = self.chrome_script(NOTIFICATIONS, ['axiosozo-webkit-stopped'])
            time.sleep(0.4)
            second = self.chrome_script(NOTIFICATIONS, ['axiosozo-webkit-stopped'])
            pick = lambda n: next((b for b in (n or {}).get('buttons', []) if 'Try again' in str(b['label'])), None)
            a, b = pick(first), pick(second)
            return second if a and b and b['box']['w'] > 0 and a['box'] == b['box'] else None
        notice = self.wait(settled, 'the notice and its retry button in place', timeout=15)
        self.screenshot('22-crash-notice')
        retry = next(b for b in notice['buttons'] if 'Try again' in str(b['label']))
        self.click_screen(retry['box'], notice['scale'])
        self.wait(lambda: self.webkit_ready(), 'back in WebKit after "Try again in WebKit"', timeout=60)
        time.sleep(1)
        self.screenshot('22-retried')
        gone = self.chrome_script(NOTIFICATIONS, ['axiosozo-webkit-stopped'])
        self.gate('crash_recovery_retry', 'PASS' if gone is None else 'EXPERIMENTAL', screenshots=['22-crash-notice.png', '22-retried.png'],
                  notice=notice['label'], buttons=[b['label'] for b in notice['buttons']], notice_after_retry=gone)
        return {'notice': notice['label'], 'retried': True}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--app', default='auto')
    parser.add_argument('--scenario', default=','.join(SCENARIOS))
    parser.add_argument('--evidence-dir')
    parser.add_argument('--size', default='1280x800')
    parser.add_argument('--timeout', type=float, default=45)
    parser.add_argument('--launch-timeout', type=float, default=180)
    parser.add_argument('--hold', type=int, default=0)
    parser.add_argument('--screenshot')
    args = parser.parse_args()
    scenarios = [item for item in args.scenario.split(',') if item]
    if any(item not in SCENARIOS for item in scenarios):
        parser.error('--scenario takes: ' + ','.join(SCENARIOS))
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    evidence = Path(args.evidence_dir).resolve() if args.evidence_dir else storage.BUILD_ROOT / 'gui-evidence' / f'webkit-feel-{stamp}'
    gui_test.FixtureServer = FeelServer  # the feel page as /engine.html (the harness owns its lifetime)
    harness = FeelHarness(args, WEBKIT, evidence)
    harness.result['harness'] = 'axiosozo-linux-gui+webkit-feel'
    harness.result['test_only_switches'].append('profile pref axiosozo.engines.webkit.enabled=true')
    code = 0
    try:
        if not storage.LINUX:
            raise gui_test.Blocked('Linux only (Xvfb, WPE WebKit host)')
        storage.ensure()
        evidence.mkdir(parents=True, exist_ok=True)
        executable, app_info = gui_test.resolve_app(args.app)
        harness.run(executable, app_info, scenarios)
        statuses = [item['status'] for item in harness.result['scenarios'].values()]
        missing = [name for name in scenarios if name not in harness.result['scenarios']]
        status = 'FAIL' if 'FAIL' in statuses or missing else 'BLOCKED_ENV' if 'BLOCKED_ENV' in statuses else 'PASS'
        if missing:
            harness.result['not_run'] = missing
        code = {'PASS': 0, 'FAIL': 1, 'BLOCKED_ENV': 2}[status]
    except gui_test.Blocked as error:
        status, code = 'BLOCKED_ENV', 2
        harness.result['reason'] = str(error)
    except (RuntimeError, OSError, subprocess.SubprocessError, AssertionError) as error:
        status, code = 'FAIL', 1
        harness.result['reason'] = f'{type(error).__name__}: {error}'
    harness.result['status'] = status
    harness.result['evidence_dir'] = str(evidence)
    if evidence.is_dir():
        (evidence / 'result.json').write_text(json.dumps(harness.result, indent=2, ensure_ascii=False) + '\n')
    print(json.dumps({'status': status, 'matrix': {k: v['status'] for k, v in harness.matrix.items()},
                      'scenarios': {k: v['status'] for k, v in harness.result['scenarios'].items()}}, indent=2), flush=True)
    return code


if __name__ == '__main__':
    sys.exit(main())
