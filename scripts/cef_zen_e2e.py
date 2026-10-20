#!/usr/bin/env python3
"""Chromium (CEF) tabs inside the Linux Zen app: E1/E2 and the native-feel matrix.

    python3 scripts/cef_zen_e2e.py --app fetched --mode web     [--scale 1|2] [--evidence-dir DIR]
    python3 scripts/cef_zen_e2e.py --app fetched --mode fixture [--evidence-dir DIR]

Runs the GUI harness of scripts/gui_test.py (Xvfb, owned profile, Marionette in chrome
context, xdotool input, xwd screenshots) with the Chromium plug-in, plus:

web      the daily Chromium switch (AXIOSOZO_ENGINE_SWITCHING=1, the existing developer gate;
         nothing is widened): an owned loopback page tests/fixtures/cef-zen-feel.html opens in
         a Gecko tab, Zen's tab menu moves it to Chromium, then every gate of the matrix is
         driven with real X11 input (typing, clicks, wheel, drag/double-click selection,
         Ctrl+C/V across engines, cursors, focus, <select>/datalist/colour popups, context
         menu, JS dialogs, beforeunload, dead keys/compose, shortcuts, find, zoom, middle
         click, history via the toolbar), the tab returns to Firefox, and a killed host is
         recovered. Gecko tabs of the same page give the parity baseline.
fixture  the strict fixture probe (AXIOSOZO_ENGINE_PROBE=1, tests/fixtures/engine.html): the
         toolbar probe button switches the tab, input reaches Chromium, page 2/back work, and
         a killed host returns the tab to its preserved Gecko document.

Page state comes from the page's own title ("AxioSozo feel {json}"), which Zen receives from
Chromium's title events; positions are the fixture's fixed CSS pixels plus the engine view's
screen origin. Results: <evidence>/result.json with `scenarios` and `matrix`
(PASS / EXPERIMENTAL / BLOCKED_ENV / FAIL / NOT_VERIFIED per gate). Exit 0 PASS, 1 FAIL,
2 BLOCKED_ENV. Test-only switches are the harness's own (+ layout.css.devPixelsPerPx for
--scale 2, in the throwaway profile); TLS, sandboxes and origin isolation are untouched.
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
from gui_engines.chromium import ChromiumEngine, ENGINE_STATE

ROOT = Path(__file__).resolve().parents[1]
FEEL = ROOT / 'tests/fixtures/cef-zen-feel.html'
ENGINE_FIXTURE = ROOT / 'tests/fixtures/engine.html'
# Address-bar focus checks run last: the Linux parent process has a known WebRender crash around
# address-bar input (owned by cloud/linux-platform), and a crash ends the session.
WEB_SCENARIOS = ('launch', 'chrome', 'switch', 'typing', 'click', 'focus', 'selection', 'clipboard', 'wheel',
                 'cursor', 'popups', 'context_menu', 'dialogs', 'find', 'zoom', 'ime', 'middle_click',
                 'history', 'beforeunload', 'to_gecko', 'host_kill', 'shortcuts', 'urlbar_gecko', 'urlbar_chromium')
SCALE_SCENARIOS = ('launch', 'chrome', 'switch', 'typing', 'click', 'selection', 'wheel', 'to_gecko')
FIXTURE_SCENARIOS = ('launch', 'chrome', 'fixture_roundtrip', 'fixture_host_kill')
HOST = 'AxioCEFProbe --stream'
# Fixed CSS-pixel geometry of tests/fixtures/cef-zen-feel.html (centres).
AT = {'text': (170, 38), 'count': (410, 38), 'link': (520, 38), 'area': (170, 150), 'select': (420, 138),
      'color': (550, 138), 'dl': (680, 138), 'd-alert': (80, 276), 'd-confirm': (210, 276), 'd-prompt': (340, 276),
      'd-unload': (470, 276), 'edit': (220, 330), 'blank': (700, 560)}
CURSORS = {'c-pointer': (60, 'pointer'), 'c-text': (150, 'text'), 'c-move': (240, 'move'), 'c-wait': (330, 'wait'),
           'c-crosshair': (420, 'crosshair'), 'c-not-allowed': (510, 'not-allowed'), 'c-grab': (600, 'grab'),
           'c-col-resize': (690, 'ew-resize'), 'c-default': (780, 'default')}
SEL_TOP = 92        # vertical centre of #sel ("alpha beta gamma delta", 16px monospace, left 20px)

WEB_STATE = """
const probe = window.AxioSozo?.engineProbe;
const tab = gBrowser.selectedTab, browser = tab.linkedBrowser, stack = browser.parentNode;
const overlay = stack?.querySelector?.('[data-axiosozo-cef]'), canvas = overlay?.querySelector('canvas');
const r = canvas?.getBoundingClientRect(), b = browser.getBoundingClientRect();
const panel = overlay?.querySelector('.axiosozo-cef-panel');
const d = probe?.diagnostics?.();
const active = document.activeElement;
return JSON.parse(JSON.stringify({engine: probe?.engineOf?.(tab) ?? 'gecko', native: d?.native ?? null,
  failure: d?.failure ?? null, pending: d?.pending ?? null, mode: d?.browsingMode ?? null,
  page: probe?.currentPage?.(tab) ?? null, geckoHidden: browser.style.visibility === 'hidden',
  geckoURL: browser.currentURI?.spec ?? null, geckoTitle: browser.contentTitle ?? null,
  overlay: overlay ? {display: overlay.style.display, mode: overlay.getAttribute('data-axiosozo-cef')} : null,
  view: r && overlay?.style.display === 'block'
    ? {x: mozInnerScreenX + r.left, y: mozInnerScreenY + r.top, w: r.width, h: r.height, cursor: canvas.style.cursor}
    : {x: mozInnerScreenX + b.left, y: mozInnerScreenY + b.top, w: b.width, h: b.height, cursor: null},
  panel: panel && !panel.hidden ? {title: panel.querySelector('h1')?.textContent ?? null,
    buttons: [...panel.querySelectorAll('button')].map(n => n.textContent)} : null,
  notice: (n => n && !n.hidden ? n.textContent : null)(overlay?.querySelector('.axiosozo-cef-notice')),
  scale: devicePixelRatio, tabs: gBrowser.tabs.length, tabIndex: gBrowser.tabs.indexOf(tab), tabId: tab.linkedPanel,
  label: tab.label, urlbarFocused: !!gURLBar.focused, urlbar: gURLBar.value,
  focus: active === canvas ? 'canvas' : (overlay?.contains(active) ? 'proxy-' + active.localName : (active?.id || active?.localName || null))}));
"""
CLIPBOARD_READ = """
const trans = Cc['@mozilla.org/widget/transferable;1'].createInstance(Ci.nsITransferable);
trans.init(null); trans.addDataFlavor('text/plain');
try { Services.clipboard.getData(trans, Ci.nsIClipboard.kGlobalClipboard, window.browsingContext.currentWindowContext); }
catch (e) { try { Services.clipboard.getData(trans, Ci.nsIClipboard.kGlobalClipboard); } catch (e2) { return {error: String(e2)}; } }
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
return {open: !bar.hidden, value: bar._findField?.value ?? null, fieldFocused: document.activeElement === bar._findField?.inputField
          || bar._findField?.matches?.(':focus-within') || false,
        matches: matches?.textContent || matches?.value || null, matchesArgs: matches?.getAttribute('data-l10n-args') ?? null,
        status: bar._findStatusDesc?.textContent ?? null};
"""
CONTEXT_MENU = """
const popup = document.getElementById('axiosozo-chromium-context-menu');
if (!popup) return {open: false};
return {open: popup.state === 'open', state: popup.state,
  items: [...popup.children].filter(n => n.localName === 'menuitem').map(n => ({label: n.getAttribute('label'),
    action: n.dataset.action, disabled: n.getAttribute('disabled') === 'true'}))};
"""


class FeelServer:
    """Owned loopback HTTP fixture: /feel.html and /engine.html, each with ?page=2. GET only."""

    def __init__(self):
        pages = {'/feel.html': FEEL.read_bytes(), '/engine.html': ENGINE_FIXTURE.read_bytes()}
        self.hashes = {name: hashlib.sha256(data).hexdigest() for name, data in pages.items()}

        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.0'

            def log_message(self, *_):
                pass

            def reply(self, code, payload=b'', content_type='text/plain; charset=utf-8'):
                self.send_response(code)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(payload)))
                self.send_header('Cache-Control', 'no-store')
                self.send_header('X-Content-Type-Options', 'nosniff')
                self.send_header('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; "
                                 "style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'")
                self.end_headers()
                self.wfile.write(payload)
                self.close_connection = True

            def do_GET(self):
                if self.headers.get_all('Host', []) != [f'127.0.0.1:{self.server.server_port}']:
                    return self.reply(400)
                url = urllib.parse.urlsplit(self.path)
                if url.path in pages and url.query in ('', 'page=2') and not url.fragment:
                    return self.reply(200, pages[url.path], 'text/html; charset=utf-8')
                if url.path == '/favicon.ico':
                    return self.reply(204)
                return self.reply(404)

            def do_POST(self):
                self.reply(405)

        self.server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.server.daemon_threads = True
        self.origin = f'http://127.0.0.1:{self.server.server_port}'
        self.url = self.origin + '/feel.html'
        self.thread = threading.Thread(target=self.server.serve_forever, kwargs={'poll_interval': .05}, daemon=True)

    def __enter__(self):
        self.thread.start()
        return self

    def __exit__(self, *_):
        self.server.shutdown()
        self.server.server_close()


class ChromiumWeb(ChromiumEngine):
    """The Chromium plug-in in the daily web mode instead of the fixture probe."""
    name = 'chromium'
    owner = 'cloud/cef-zen-feel'

    def __init__(self, mode, scale):
        self.mode, self.scale = mode, scale

    def browser_environment(self, harness):
        env = super().browser_environment(harness)
        if self.scale != 1:
            with open(os.path.join(harness.result['session'], 'gecko', 'user.js'), 'a') as prefs:
                prefs.write(f'user_pref("layout.css.devPixelsPerPx", "{self.scale}");\n')
        if self.mode == 'web':
            for name in ('AXIOSOZO_ENGINE_PROBE', 'AXIOSOZO_ENGINE_FIXTURE_ORIGIN'):
                env.pop(name, None)
            env['AXIOSOZO_ENGINE_SWITCHING'] = '1'
        return env

    def prepare(self, harness):
        if self.mode != 'web':
            return super().prepare(harness)
        if not self.binary().is_file():
            raise EngineUnavailable('CEF host not built in ' + str(storage.BUILD_ROOT))
        check = subprocess.run([sys.executable, str(ROOT / 'native/chromium-host/probe.py'), 'check'],
                               capture_output=True, text=True, timeout=120,
                               env={**os.environ, 'AXIOSOZO_BUILD_ROOT': str(storage.BUILD_ROOT)})
        harness.result['cef_check'] = (check.stdout.strip().splitlines() or [''])[-1][:2000]
        if check.returncode:
            raise EngineUnavailable('probe.py check: ' + (check.stdout + check.stderr).strip()[-600:])
        state = harness.wait(lambda: harness.chrome_script(ENGINE_STATE), 'window.AxioSozo.engineProbe (web mode)', timeout=30)
        if state['browsingMode'] != 'web':
            raise EngineUnavailable('engine probe is not in web mode: ' + repr(state))


def parse_feel(title):
    if not isinstance(title, str) or not title.startswith('AxioSozo feel {'):
        return None
    try:
        return json.loads(title[len('AxioSozo feel '):])
    except ValueError:
        return None


class CEFZenHarness(gui_test.Harness):
    def __init__(self, args, engine, evidence, feel):
        super().__init__(args, engine, evidence)
        self.feel = feel
        self.matrix = {}
        self.result['matrix'] = self.matrix
        # Tabs by their linkedPanel id: Zen may reorder the tab strip.
        self.gecko_tab = None      # the Gecko baseline tab
        self.cef_tab = None        # the tab moved to Chromium

    def launch(self, session, executable, profile):
        super().launch(session, executable, profile)
        # Zen's dialogs over a Chromium page must stay open for the user (and for this test):
        # Marionette's default user-prompt handler ("dismiss and notify") would answer them first.
        self.marionette.call('WebDriver:DeleteSession')
        self.marionette.call('WebDriver:NewSession', {'strictFileInteractability': True, 'unhandledPromptBehavior': 'ignore'})
        self.marionette.call('WebDriver:SetTimeouts', {'script': int(self.timeout * 1000), 'pageLoad': int(self.timeout * 1000)})
        self.result['test_only_switches'].append('Marionette unhandledPromptBehavior=ignore')

    # -- state and geometry ---------------------------------------------------------------
    def web(self):
        return self.chrome_script(WEB_STATE)

    def page(self, state=None):
        state = state or self.web()
        if state['engine'] == 'chromium':
            return parse_feel((state.get('page') or {}).get('title'))
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
        view = (state or self.web())['view']
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

    def key(self, *keys):
        self.xdotool('key', '--clearmodifiers', *keys)

    def type_text(self, text):
        self.xdotool('type', '--delay', '70', text)

    def focus_window(self):
        self.xdotool('windowraise', self.window)
        self.xdotool('windowfocus', '--sync', self.window)

    def select_tab(self, panel):
        self.chrome_script('gBrowser.selectedTab = gBrowser.tabs.find(tab => tab.linkedPanel === arguments[0]); return true;', [panel])
        self.wait(lambda: self.web()['tabId'] == panel, f'tab {panel} selected', timeout=10)
        time.sleep(0.3)

    def gate(self, name, status, **details):
        self.matrix[name] = {'status': status, **details}
        return self.matrix[name]

    def chromium_ready(self, state=None):
        state = state or self.web()
        native = state.get('native') or {}
        return (state['engine'] == 'chromium' and not state['pending'] and native.get('engine') == 'chromium'
                and (native.get('frames') or 0) >= 1 and state['overlay'] and state['overlay']['display'] == 'block'
                and state['geckoHidden'] and self.page(state) is not None)

    def require_chromium(self):
        state = self.web()
        if not self.chromium_ready(state):
            raise gui_test.Blocked('needs the Chromium tab: ' + repr({k: state.get(k) for k in ('engine', 'failure', 'panel')}))
        return state

    # -- tab menu ------------------------------------------------------------------------
    def tab_menu(self, label, name):
        rect = self.chrome_script('const r = gBrowser.selectedTab.getBoundingClientRect();'
                                  'return {x: mozInnerScreenX + r.left + Math.min(r.width / 2, 60), '
                                  'y: mozInnerScreenY + r.top + r.height / 2, scale: devicePixelRatio};')
        self.xdotool('mousemove', '--sync', round(rect['x'] * rect['scale']), round(rect['y'] * rect['scale']))
        self.xdotool('click', '3')
        opened = self.wait(lambda: self.chrome_script("""
            const menu = document.getElementById('tabContextMenu');
            if (menu.state !== 'open') return null;
            const item = document.getElementById('axiosozo-context-engine');
            const submenu = document.getElementById('axiosozo-context-engine-menu');
            return {item: item && !item.hidden ? item.getAttribute('label') : null,
                    submenu: submenu && !submenu.hidden ? [...submenu.querySelectorAll('menuitem')].map(entry =>
                      entry.getAttribute('label')) : null};
        """), 'tab context menu open', timeout=15)
        time.sleep(0.6)
        self.screenshot(name + '-menu', settle=False)
        picked = self.chrome_script("""
            const [label] = arguments;
            const menu = document.getElementById('tabContextMenu');
            const item = document.getElementById('axiosozo-context-engine');
            if (item && !item.hidden && item.getAttribute('label') === label) { menu.activateItem(item); return 'item'; }
            const entry = [...document.querySelectorAll('#axiosozo-context-engine-menu menuitem')]
              .find(node => 'Open in ' + node.getAttribute('label') === label && node.getAttribute('disabled') !== 'true');
            if (entry) { menu.activateItem(entry); return 'submenu'; }
            menu.hidePopup(); return null;
        """, [label])
        if not picked:
            raise AssertionError(f'tab menu has no enabled "{label}": ' + repr(opened))
        return {'menu': opened, 'picked': picked}

    def click_toolbar(self, element_id, description):
        def ready():
            box = self.chrome_script("""
                const node = document.getElementById(arguments[0]);
                if (!node) return {missing: true};
                const r = node.getBoundingClientRect();
                return {x: mozInnerScreenX + r.left + r.width / 2, y: mozInnerScreenY + r.top + r.height / 2,
                        width: r.width, height: r.height, scale: devicePixelRatio,
                        disabled: node.disabled === true || node.getAttribute('disabled') === 'true'};
            """, [element_id])
            return box if box.get('width', 0) > 0 and not box.get('disabled') else None
        box = self.wait(ready, description, timeout=15)
        point = [round(box['x'] * box['scale']), round(box['y'] * box['scale'])]
        self.xdotool('mousemove', '--sync', *point)
        self.xdotool('click', '1')
        return {'button': element_id, 'pointer': point}

    @staticmethod
    def host_pids():
        return [int(pid) for pid in subprocess.run(['pgrep', '-f', HOST], capture_output=True, text=True).stdout.split()]

    def clipboard(self):
        value = self.chrome_script(CLIPBOARD_READ)
        if shutil.which('xclip'):
            done = subprocess.run(['xclip', '-o', '-selection', 'clipboard'], env=self.x_env, capture_output=True,
                                  text=True, timeout=10)
            value['xclip'] = done.stdout if done.returncode == 0 else None
        return value

    # -- web scenarios ---------------------------------------------------------------------
    def scenario_switch(self):
        url = self.feel.url
        # Tab A: the Gecko baseline, kept in Gecko for parity and as the E2 survivor.
        self.open_tab(url)
        self.wait_page(lambda page: page['p'] == '1', 'feel page in the Gecko baseline tab')
        self.gecko_tab = self.web()['tabId']
        # Tab B: the same page, moved to Chromium through Zen's own tab menu.
        self.open_tab(url)
        gecko = self.wait_page(lambda page: page['p'] == '1', 'feel page in Gecko before the switch')
        self.focus_window()
        self.screenshot('01-gecko')
        started = time.monotonic()
        menu = self.tab_menu('Open in Chromium', '02-to-chromium')
        state = self.wait(lambda: (lambda s: s if self.chromium_ready(s) else None)(self.web()),
                          'Chromium frames of the feel page in the Zen tab', timeout=60)
        seconds = round(time.monotonic() - started, 2)
        self.cef_tab = state['tabId']
        native = state['native']
        if native.get('renderPath') != 'native-osr-bgra' or not native.get('pipeFallback'):
            raise AssertionError('unexpected Linux render path: ' + repr(native))
        try:
            self.wait(lambda: 'AxioSozo feel' in self.window_title(), 'X11 window title from the Chromium page', timeout=10)
        except AssertionError as error:
            raise AssertionError(f'{error}; X11 title is {self.window_title()!r}') from None
        time.sleep(1)
        self.screenshot('02-chromium')
        self.gate('window_title', 'PASS', x11_title=self.window_title())
        self.gate('e1_render_in_content_area', 'PASS', screenshot='02-chromium.png', seconds=seconds,
                  surface=native.get('surface'), first_frame_ms=native.get('firstFrameMilliseconds'))
        return {'menu': menu, 'seconds': seconds, 'gecko_page': gecko, 'state': {k: state[k] for k in
                ('engine', 'mode', 'view', 'geckoHidden', 'geckoURL', 'overlay', 'label', 'tabs', 'focus')},
                'native': {k: native.get(k) for k in ('renderPath', 'frames', 'surface', 'firstFrameMilliseconds',
                                                      'meanDrawMilliseconds', 'uploadedPixelShare', 'inputFeatures')}}

    def scenario_typing(self):
        self.require_chromium()
        self.focus_window()
        point = self.click_at(*AT['text'])
        focused = self.wait_page(lambda page: page['f'] == 'text', 'the text field focused in Chromium')
        self.type_text('zen feel 1')
        page = self.wait_page(lambda page: page['t'] == 'zen feel 1', 'typed text in the Chromium field')
        self.key('BackSpace')
        page = self.wait_page(lambda page: page['t'] == 'zen feel ', 'Backspace in the Chromium field')
        self.key('ctrl+BackSpace')
        page = self.wait_page(lambda page: page['t'] in ('zen ', 'zen feel'.rsplit(' ', 1)[0] + ' ', ''),
                              'Ctrl+Backspace (word delete) stays with the page')
        self.type_text('feel')
        page = self.wait_page(lambda page: page['t'].endswith('feel'), 'typing after word delete')
        self.screenshot('03-typed')
        self.gate('typing', 'PASS', screenshot='03-typed.png', value=page['t'])
        return {'pointer': point, 'focused': focused['f'], 'page': page, 'x11_title': self.window_title()}

    def scenario_click(self):
        self.require_chromium()
        point = self.click_at(*AT['count'])
        page = self.wait_page(lambda page: page['c'] >= 1, 'button click counted in Chromium')
        self.click_at(*AT['count'])
        page = self.wait_page(lambda page: page['c'] >= 2, 'second click counted')
        self.screenshot('04-clicked')
        self.gate('click', 'PASS', screenshot='04-clicked.png', count=page['c'])
        return {'pointer': point, 'count': page['c']}

    def scenario_focus(self):
        self.require_chromium()
        self.click_at(*AT['text'])
        self.wait_page(lambda page: page['f'] == 'text', 'text field focused')
        state = self.web()
        self.screenshot('05-caret')
        self.key('Tab')
        forward = self.wait_page(lambda page: page['f'] == 'count', 'Tab moves page focus to the button')
        self.screenshot('05-focus-ring')
        self.key('shift+Tab')
        back = self.wait_page(lambda page: page['f'] == 'text', 'Shift+Tab moves page focus back')
        self.gate('focus_ring_caret', 'PASS', screenshots=['05-caret.png', '05-focus-ring.png'],
                  chrome_focus=state['focus'], note='focus ring and caret are Chromium-drawn pixels; screenshots inspected')
        return {'chrome_focus': state['focus'], 'tab': forward['f'], 'shift_tab': back['f']}

    def char_x(self, index):
        # DejaVu Sans Mono / Liberation Mono 16px advance ~9.6px; centre of character `index`.
        return 20 + 9.6 * index + 4.8

    def scenario_selection(self):
        self.require_chromium()
        # Drag across "alpha beta".
        self.move(self.char_x(0) - 3, SEL_TOP)
        self.xdotool('mousedown', '1')
        for index in (2, 5, 8, 9):
            self.move(self.char_x(index) + 4, SEL_TOP)
            time.sleep(0.06)
        self.xdotool('mouseup', '1')
        drag = self.wait_page(lambda page: page['s'].startswith('alpha b'), 'drag selection of "alpha b…"')
        self.screenshot('06-drag-selection')
        # Double-click "gamma" (characters 11-15).
        self.click_at(self.char_x(13), SEL_TOP, repeat=2)
        double = self.wait_page(lambda page: page['s'].strip() == 'gamma', 'double-click selects the word "gamma"')
        self.screenshot('06-double-click')
        triple = None
        try:
            self.click_at(self.char_x(13), SEL_TOP, repeat=3)
            triple = self.wait_page(lambda page: 'alpha beta gamma delta' in page['s'], 'triple-click selects the line',
                                    timeout=6)['s']
        except AssertionError as error:
            triple = 'not observed: ' + str(error)[:160]
        self.gate('selection_drag_double_click', 'PASS', drag=drag['s'], double=double['s'], triple=triple,
                  screenshots=['06-drag-selection.png', '06-double-click.png'])
        return {'drag': drag['s'], 'double': double['s'], 'triple': triple}

    def scenario_clipboard(self):
        self.require_chromium()
        steps = {}
        # Chromium → clipboard (Ctrl+C on a double-clicked word).
        self.click_at(self.char_x(13), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'gamma', '"gamma" selected')
        self.key('ctrl+c')
        steps['copied'] = self.wait(lambda: (lambda v: v if (v.get('text') or '').strip() == 'gamma' else None)(self.clipboard()),
                                    'Zen clipboard holds Chromium\'s copy "gamma"', timeout=10)
        # Clipboard → Chromium (Ctrl+V into the textarea).
        self.click_at(*AT['area'])
        self.key('ctrl+a')
        self.key('ctrl+v')
        steps['pasted_in_chromium'] = self.wait_page(lambda page: page['a'].strip() == 'gamma', 'Ctrl+V in Chromium')['a']
        # Chromium → Gecko tab: paste into the Gecko baseline page.
        self.select_tab(self.gecko_tab)
        self.click_at(*AT['area'])
        self.key('ctrl+a')
        self.key('ctrl+v')
        steps['pasted_in_gecko'] = self.wait_page(lambda page: page['a'].strip() == 'gamma', 'Ctrl+V in the Gecko tab')['a']
        # Gecko → Chromium: copy "delta" in Gecko, paste in Chromium.
        self.click_at(self.char_x(19), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'delta', '"delta" selected in Gecko')
        self.key('ctrl+c')
        self.wait(lambda: (lambda v: v if (v.get('text') or '').strip() == 'delta' else None)(self.clipboard()),
                  'Zen clipboard holds Gecko\'s copy "delta"', timeout=10)
        self.select_tab(self.cef_tab)
        self.click_at(*AT['text'])
        self.key('ctrl+a')
        self.key('ctrl+v')
        steps['gecko_to_chromium'] = self.wait_page(lambda page: page['t'].strip() == 'delta', 'Gecko copy pasted in Chromium')['t']
        # Zen chrome → Chromium (a chrome-side copy, as Zen's own "Copy Link" does).
        self.chrome_script(CLIPBOARD_WRITE, ['from zen'])
        self.click_at(*AT['area'])
        self.key('ctrl+a')
        self.key('ctrl+v')
        steps['zen_to_chromium'] = self.wait_page(lambda page: page['a'] == 'from zen', 'Zen chrome copy pasted in Chromium')['a']
        # Cut.
        self.key('ctrl+a')
        self.key('ctrl+x')
        steps['cut'] = self.wait_page(lambda page: page['a'] == '', 'Ctrl+X empties the field')['a']
        steps['cut_clipboard'] = self.clipboard()
        self.key('ctrl+z')
        try:
            steps['undo'] = self.wait_page(lambda page: page['a'] == 'from zen', 'Ctrl+Z restores the cut text', timeout=6)['a']
        except AssertionError as error:
            steps['undo'] = 'not observed: ' + str(error)[:160]
        self.screenshot('07-clipboard')
        self.gate('clipboard_ctrl_c_v', 'PASS', screenshot='07-clipboard.png', **{k: v for k, v in steps.items() if isinstance(v, str)})
        return steps

    def measure_wheel(self):
        results = {}
        for kind in ('notch', 'precise'):
            self.scroll_top()
            before = self.page()
            self.move(*AT['blank'])
            if kind == 'notch':
                self.xdotool('click', '5')
            else:
                view = self.web()['view']
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
        page = self.page()
        if page['y'] == 0:
            return
        self.move(*AT['blank'])
        for _ in range(60):
            self.xdotool('click', '4')
            if self.page()['y'] == 0:
                break
        self.wait_page(lambda page: page['y'] == 0, 'page scrolled back to the top', timeout=15)
        time.sleep(0.8)  # let the page's wheel window close

    def scenario_wheel(self):
        self.require_chromium()
        chromium = self.measure_wheel()
        self.move(*AT['blank'])
        for _ in range(6):
            self.xdotool('click', '5')
            time.sleep(0.05)
        scrolled = self.wait_page(lambda page: page['y'] > 150, 'six notches scroll the Chromium page')
        self.screenshot('08-scrolled')
        self.scroll_top()
        self.select_tab(self.gecko_tab)
        gecko = self.measure_wheel()
        self.select_tab(self.cef_tab)
        animated = chromium['notch']['n'] >= 3
        immediate = chromium['precise']['n'] <= 2
        distance = chromium['notch']['y'] / max(1, gecko['notch']['y'])
        status = 'PASS' if animated and immediate and 0.5 <= distance <= 2 else 'EXPERIMENTAL'
        self.gate('wheel_precise_vs_notch', status, chromium=chromium, gecko=gecko, notch_distance_ratio=round(distance, 2),
                  screenshot='08-scrolled.png',
                  note='precise = widget wheel event in pixels (Xvfb has no smooth-scroll device); notch = X11 button 5')
        return {'chromium': chromium, 'gecko': gecko, 'six_notches_y': scrolled['y']}

    def scenario_cursor(self):
        self.require_chromium()
        seen, wrong = {}, {}
        for element, (x, expected) in CURSORS.items():
            self.move(x, 220)
            try:
                seen[element] = self.wait(lambda: (lambda c: c if c == expected else None)(self.web()['view']['cursor']),
                                          f'cursor {expected} over #{element}', timeout=6)
            except AssertionError:
                wrong[element] = {'expected': expected, 'seen': self.web()['view']['cursor']}
        self.move(*AT['text'])
        try:
            seen['input'] = self.wait(lambda: (lambda c: c if c == 'text' else None)(self.web()['view']['cursor']),
                                      'text cursor over the input', timeout=6)
        except AssertionError:
            wrong['input'] = {'expected': 'text', 'seen': self.web()['view']['cursor']}
        self.gate('cursor_shapes', 'PASS' if not wrong else 'FAIL', seen=seen, wrong=wrong,
                  note='X11 screenshots do not include the pointer; asserted on the engine view\'s CSS cursor')
        if wrong:
            raise AssertionError('cursor mismatch: ' + repr(wrong))
        return {'seen': seen}

    def scenario_popups(self):
        self.require_chromium()
        out = {}
        # <select>: Chromium's popup widget (OnPopupShow), composited by the host into the tab's frame.
        self.click_at(*AT['select'])
        time.sleep(1.0)
        self.screenshot('09-select-open')
        self.key('Down')
        self.key('Return')
        try:
            out['select'] = self.wait_page(lambda page: page['sel'] == 'two', '<select> choice via its popup')['sel']
            self.gate('select_popup', 'PASS', screenshot='09-select-open.png', value=out['select'],
                      note='popup drawn by Chromium and composited into the engine frame (host OnPopupShow), not a Zen widget')
        except AssertionError as error:
            out['select'] = str(error)[:300]
            self.gate('select_popup', 'FAIL', screenshot='09-select-open.png', reason=out['select'])
        # <datalist>: autofill-style suggestions.
        self.click_at(*AT['dl'])
        self.type_text('ap')
        time.sleep(1.0)
        self.screenshot('09-datalist')
        self.key('Down')
        self.key('Return')
        try:
            out['datalist'] = self.wait_page(lambda page: page['dl'] in ('apple', 'apricot'), 'datalist suggestion chosen', timeout=8)['dl']
            self.gate('datalist_popup', 'PASS', screenshot='09-datalist.png', value=out['datalist'])
        except AssertionError:
            out['datalist'] = self.page()['dl']
            self.gate('datalist_popup', 'EXPERIMENTAL', screenshot='09-datalist.png', value=out['datalist'],
                      note='typed text reaches the field; no suggestion popup could be chosen in OSR')
        # <input type=color>: Chromium's colour chooser.
        self.click_at(*AT['color'])
        time.sleep(1.5)
        self.screenshot('09-color')
        # Chromium's chooser opens below the swatch (page x 520..753, y 156..): click near its
        # top-left (white) corner of the saturation/value area.
        self.click_at(528, 166)
        try:
            picked = self.wait_page(lambda page: page['col'] != '#336699', 'a colour picked in Chromium\'s chooser', timeout=8)['col']
        except AssertionError:
            picked = None
        self.screenshot('09-color-picked')
        self.key('Escape')
        out['color'] = {'picked': picked, 'value': self.page()['col']}
        self.gate('color_popup', 'PASS' if picked else 'EXPERIMENTAL', screenshots=['09-color.png', '09-color-picked.png'],
                  observed=out['color'], note="Chromium's own colour chooser, composited into the engine frame (no Zen/GTK dialog)")
        if self.matrix['select_popup']['status'] == 'FAIL':
            raise AssertionError('select popup: ' + out['select'])
        return out

    def scenario_context_menu(self):
        self.require_chromium()
        self.key('Escape')
        self.click_at(self.char_x(7), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'beta', '"beta" selected')
        self.click_at(self.char_x(7), SEL_TOP, button=3)
        menu = self.wait(lambda: (lambda m: m if m['open'] else None)(self.chrome_script(CONTEXT_MENU)),
                         'Zen-drawn context menu for the Chromium selection', timeout=15)
        time.sleep(0.8)  # the menu is its own X window; let it paint
        self.screenshot('10-context-menu', settle=False)
        geometry = self.chrome_script("""const p = document.getElementById('axiosozo-chromium-context-menu');
            const r = p.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height, state: p.state,
            screen: [p.screenX, p.screenY]};""")
        # Hovering the first item makes the menu repaint (paint timing evidence under Xvfb).
        first = geometry
        self.xdotool('mousemove', '--sync', round((first['screen'][0] + 30)), round(first['screen'][1] + 12))
        time.sleep(1.5)
        self.screenshot('10-context-menu-hover', settle=False)
        actions = [item['action'] for item in menu['items']]
        if 'copy' not in actions or 'open_in_firefox' not in actions:
            raise AssertionError('context menu lacks engine items: ' + repr(menu))
        self.chrome_script("""const popup = document.getElementById('axiosozo-chromium-context-menu');
            popup.activateItem([...popup.children].find(n => n.dataset?.action === 'copy')); return true;""")
        copied = self.wait(lambda: (lambda v: v if (v.get('text') or '').strip() == 'beta' else None)(self.clipboard()),
                           'context-menu Copy put "beta" on the clipboard', timeout=10)
        # A page (non-selection) menu, dismissed with Escape.
        self.click_at(*AT['blank'], button=3)
        page_menu = self.wait(lambda: (lambda m: m if m['open'] else None)(self.chrome_script(CONTEXT_MENU)),
                              'page context menu', timeout=15)
        time.sleep(0.8)
        self.screenshot('10-page-menu', settle=False)
        self.key('Escape')
        self.wait(lambda: not self.chrome_script(CONTEXT_MENU)['open'], 'context menu closed by Escape', timeout=10)
        # Parity: Firefox's own content context menu on the Gecko tab, same environment.
        self.select_tab(self.gecko_tab)
        self.click_at(self.char_x(7), SEL_TOP, button=3)
        try:
            self.wait(lambda: self.chrome_script("return document.getElementById('contentAreaContextMenu').state === 'open';"),
                      'Firefox content context menu on the Gecko tab', timeout=10)
            time.sleep(0.8)
            self.screenshot('10-gecko-context-menu', settle=False)
        finally:
            self.key('Escape')
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        self.gate('context_menu', 'PASS', screenshots=['10-context-menu.png', '10-context-menu-hover.png', '10-page-menu.png',
                                                       '10-gecko-context-menu.png'], geometry=geometry,
                  selection_items=[i['label'] for i in menu['items']], page_items=[i['label'] for i in page_menu['items']])
        return {'selection_menu': menu, 'copied': copied, 'page_menu': page_menu, 'page_contextmenu_events': self.page()['cm']}

    def alert_text(self):
        """Text of the user prompt Marionette sees on the test tab (Zen's own commonDialog), or None.
        While it is open Marionette refuses scripts, so the prompt is read through WebDriver's alert API."""
        try:
            return self.marionette.call('WebDriver:GetAlertText')['value']
        except gui_test.MarionetteError:
            return None

    def answer_prompt(self, key_sequence, accept, text=None):
        """Answer Zen's dialog with real keys; WebDriver's accept/dismiss only if the keys did not reach it."""
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

    def dialog(self, button, key_sequence, expect, name, accept, text=None):
        self.click_at(*AT[button])
        shown = self.wait(lambda: self.alert_text(), f'Zen dialog for {button}', timeout=15)
        time.sleep(0.6)
        self.screenshot(name)
        via = self.answer_prompt(key_sequence, accept, text)
        page = self.wait_page(lambda page: expect in page['d'], f'page saw {expect}')
        return {'dialog_text': shown, 'via': via, 'result': page['d'][-1]}

    def scenario_dialogs(self):
        self.require_chromium()
        out = {'alert': self.dialog('d-alert', ['Return'], 'alert', '11-alert', True)}
        time.sleep(3.5)  # Firefox's successive-dialog window (dom.successive_dialog_time_limit)
        out['confirm'] = self.dialog('d-confirm', ['Escape'], 'confirm=false', '11-confirm', False)
        time.sleep(3.5)
        out['prompt'] = self.dialog('d-prompt', ['ctrl+a', 'type:zen', 'Return'], 'prompt=zen', '11-prompt', True, text='zen')
        keyboard = all(item['via'] == 'keyboard' for item in out.values())
        self.gate('js_dialogs', 'PASS' if keyboard else 'EXPERIMENTAL', screenshots=['11-alert.png', '11-confirm.png', '11-prompt.png'],
                  via={k: v['via'] for k, v in out.items()}, results=self.page()['d'])
        return out

    def scenario_find(self):
        self.require_chromium()
        self.click_at(*AT['blank'])
        self.key('ctrl+f')
        bar = self.wait(lambda: (lambda b: b if b['open'] else None)(self.chrome_script(FINDBAR_STATE)), 'Zen findbar open', timeout=10)
        self.type_text('needle')
        found = self.wait(lambda: (lambda b: b if b['value'] == 'needle' and ('3' in str(b['matches']) + str(b['matchesArgs'])) else None)(
            self.chrome_script(FINDBAR_STATE)), 'findbar reports 3 matches from Chromium', timeout=15)
        self.screenshot('12-find')
        self.key('Escape')
        closed = self.wait(lambda: not self.chrome_script(FINDBAR_STATE)['open'], 'findbar closed', timeout=10)
        self.gate('find_in_page', 'PASS', screenshot='12-find.png', findbar=found)
        return {'opened': bar, 'found': found, 'closed': closed}

    ZOOM_KEYS = """
        return [...document.querySelectorAll('key')].filter(k => ['0', '=', '+', '-'].includes(k.getAttribute('key'))
          || ['VK_ADD', 'VK_SUBTRACT'].includes(k.getAttribute('keycode'))).map(k => ({id: k.id, key: k.getAttribute('key'),
          modifiers: k.getAttribute('modifiers'), command: k.getAttribute('command'), oncommand: k.getAttribute('oncommand'),
          disabled: k.getAttribute('disabled')}));"""

    def zoom_cycle(self):
        """Ctrl+=, Ctrl+0, Ctrl+-, then Zen's reset command, on the selected tab: page zoom factors."""
        self.click_at(*AT['blank'])
        base = self.page()['z'][0]
        out = {'base': base}
        self.key('ctrl+equal')
        out['ctrl_equal'] = self.wait_page(lambda page: page['z'][0] > base * 1.05, 'Ctrl+= zooms', timeout=10)['z'][0]
        self.screenshot(f'13-zoomed-{self.web()["engine"]}')
        self.key('ctrl+0')
        try:
            out['ctrl_0'] = self.wait_page(lambda page: abs(page['z'][0] - base) < 0.01, 'Ctrl+0 resets', timeout=6)['z'][0]
        except AssertionError:
            out['ctrl_0'] = self.page()['z'][0]
        self.chrome_script('FullZoom.reset(); return true;')
        out['zen_reset'] = self.wait_page(lambda page: abs(page['z'][0] - base) < 0.01, "Zen's FullZoom.reset", timeout=10)['z'][0]
        self.key('ctrl+minus')
        out['ctrl_minus'] = self.wait_page(lambda page: page['z'][0] < base * 0.95, 'Ctrl+- zooms out', timeout=10)['z'][0]
        self.chrome_script('FullZoom.reset(); return true;')
        self.wait_page(lambda page: abs(page['z'][0] - base) < 0.01, 'back to 100%', timeout=10)
        out['urlbar_zoom_button'] = self.chrome_script('const b = document.getElementById("urlbar-zoom-button");'
                                                       'return b ? {hidden: b.hidden, label: b.getAttribute("label")} : null;')
        return out

    def scenario_zoom(self):
        self.require_chromium()
        self.select_tab(self.gecko_tab)
        gecko = self.zoom_cycle()
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        chromium = self.zoom_cycle()
        keys = self.chrome_script(self.ZOOM_KEYS)
        same_ctrl_0 = (abs(chromium['ctrl_0'] - chromium['base']) < 0.01) == (abs(gecko['ctrl_0'] - gecko['base']) < 0.01)
        self.gate('page_zoom', 'PASS' if same_ctrl_0 else 'FAIL', screenshot='13-zoomed-chromium.png', chromium=chromium, gecko=gecko,
                  note='Ctrl+0 under xdotool behaves the same in Gecko and Chromium tabs of this build; Zen\'s reset command resets both')
        if not same_ctrl_0:
            raise AssertionError(f'Ctrl+0 differs: chromium {chromium} gecko {gecko}')
        return {'chromium': chromium, 'gecko': gecko, 'zoom_keys': keys}

    def ensure_chromium(self, name):
        """The Chromium test tab selected and presented in Chromium (through the tab menu if needed)."""
        if self.web()['tabId'] != self.cef_tab:
            self.select_tab(self.cef_tab)
        if not self.chromium_ready():
            if self.web()['engine'] != 'chromium':
                self.tab_menu('Open in Chromium', name)
            self.wait(lambda: self.chromium_ready(), 'the test tab presented in Chromium', timeout=60)
        return self.web()

    def scenario_shortcuts(self):
        self.ensure_chromium('20-to-chromium')
        out = {}
        self.click_at(*AT['blank'])
        key_before = self.page()['k']
        tabs = self.web()['tabs']
        self.key('ctrl+t')
        out['ctrl_t'] = self.wait(lambda: (lambda s: s['tabs'] if s['tabs'] == tabs + 1 else None)(self.web()), 'Ctrl+T opens a tab', timeout=10)
        time.sleep(0.8)
        self.key('ctrl+w')
        out['ctrl_w'] = self.wait(lambda: (lambda s: s['tabs'] if s['tabs'] == tabs else None)(self.web()), 'Ctrl+W closes it', timeout=10)
        out['selected_after_ctrl_w'] = self.web()['tabId'] == self.cef_tab
        self.ensure_chromium('20-to-chromium')
        self.click_at(*AT['blank'])
        self.key('ctrl+Tab')
        out['ctrl_tab'] = self.wait(lambda: (lambda s: s['tabId'] if s['tabId'] != self.cef_tab else None)(self.web()),
                                    'Ctrl+Tab leaves the Chromium tab', timeout=10)
        self.key('ctrl+shift+Tab')
        out['ctrl_shift_tab'] = self.wait(lambda: (lambda s: s['tabId'] if s['tabId'] == self.cef_tab else None)(self.web()),
                                          'Ctrl+Shift+Tab returns', timeout=10)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented again', timeout=15)
        self.click_at(*AT['blank'])
        loads = self.page()['l']
        self.key('F5')
        out['f5'] = self.wait_page(lambda page: page['l'] == loads + 1, 'F5 reloads the Chromium page', timeout=20)['l']
        self.click_at(*AT['blank'])
        loads = self.page()['l']
        self.key('ctrl+r')
        out['ctrl_r'] = self.wait_page(lambda page: page['l'] == loads + 1, 'Ctrl+R reloads the Chromium page', timeout=20)['l']
        last = self.page()['k']
        out['page_last_key'] = last
        out['page_saw_chrome_keys'] = last != key_before and any(last.startswith(p) for p in ('C:t:', 'C:w:', 'C:Tab:', 'C:r:', ':F5:'))
        self.gate('shortcut_ownership', 'FAIL' if out['page_saw_chrome_keys'] else 'PASS',
                  checked=['Ctrl+T', 'Ctrl+W', 'Ctrl+Tab', 'Ctrl+Shift+Tab', 'F5', 'Ctrl+R', 'Ctrl+F (find)', 'Ctrl+=/-/0 (zoom)',
                           'Alt+Left (history)', 'Ctrl+L (urlbar_*)'], details=out)
        if out['page_saw_chrome_keys']:
            raise AssertionError('the page received a Zen shortcut: ' + last)
        return out

    def urlbar_focus(self, engine):
        """Ctrl+L focuses Zen's address bar over the page, Escape is Zen's, a click gives the page focus back. No typing in the bar."""
        self.click_at(*AT['blank'])
        self.key('ctrl+l')
        focused = self.wait(lambda: self.web()['urlbarFocused'], f'Ctrl+L focuses the address bar over {engine}', timeout=10)
        time.sleep(0.4)
        self.screenshot(f'21-ctrl-l-{engine}', settle=False)
        self.key('Escape')
        time.sleep(0.4)
        self.key('Escape')
        time.sleep(0.6)
        after_escape = self.web()['urlbarFocused']
        self.click_at(*AT['text'])
        self.type_text('L')
        typed = self.wait_page(lambda page: page['t'].endswith('L'), f'a click returns typing to the {engine} page', timeout=10)['t']
        return {'focused': focused, 'urlbar_focused_after_escape': after_escape, 'typed_after_click': typed, 'focus': self.web()['focus']}

    def scenario_urlbar_gecko(self):
        self.select_tab(self.gecko_tab)
        out = self.urlbar_focus('gecko')
        self.result['urlbar_gecko'] = out
        self.gate('ctrl_l_gecko_baseline', 'PASS', **out)
        return out

    def scenario_urlbar_chromium(self):
        self.ensure_chromium('22-to-chromium')
        out = self.urlbar_focus('chromium')
        gecko = self.result.get('urlbar_gecko') or {}
        same = gecko.get('urlbar_focused_after_escape') == out['urlbar_focused_after_escape']
        self.gate('ctrl_l_escape', 'PASS' if same else 'FAIL', screenshot='21-ctrl-l-chromium.png', gecko=gecko, **out)
        if not same:
            raise AssertionError(f'address-bar focus after Escape differs from Gecko: {out} vs {gecko}')
        return out

    def compose_keys(self, engine):
        """Dead keys (us intl layout) and GTK's Ctrl+Shift+U Unicode entry into the selected tab's text field."""
        out = {}
        self.click_at(*AT['text'])
        self.key('ctrl+a')
        self.key('BackSpace')
        self.wait_page(lambda page: page['t'] == '', f'{engine} field cleared')
        out['focus'] = self.web()['focus']
        layout = subprocess.run(['setxkbmap', '-layout', 'us', '-variant', 'intl'], env=self.x_env, capture_output=True, text=True)
        if layout.returncode:
            raise gui_test.Blocked('setxkbmap us intl: ' + layout.stderr.strip())
        try:
            time.sleep(0.5)
            out['keymap_apostrophe'] = subprocess.run(['xmodmap', '-pke'], env=self.x_env, capture_output=True, text=True).stdout \
                .count('dead_acute') if shutil.which('xmodmap') else None
            self.xdotool('key', '--delay', '120', 'dead_acute', 'e')
            try:
                out['dead_acute'] = self.wait_page(lambda page: page['t'] == 'é', f'{engine}: dead acute + e', timeout=6)['t']
            except AssertionError:
                out['dead_acute'] = 'got ' + repr(self.page()['t'])
        finally:
            subprocess.run(['setxkbmap', '-layout', 'us'], env=self.x_env, capture_output=True)
        time.sleep(0.5)
        self.key('ctrl+a')
        self.key('BackSpace')
        self.wait_page(lambda page: page['t'] == '', f'{engine} field cleared')
        self.xdotool('key', 'ctrl+shift+u')
        self.xdotool('type', '--delay', '100', '20ac')
        time.sleep(0.3)
        self.screenshot(f'15-compose-preedit-{engine}', settle=False)
        self.xdotool('key', 'space')
        try:
            out['ctrl_shift_u'] = self.wait_page(lambda page: page['t'] == '€', f'{engine}: Ctrl+Shift+U 20ac', timeout=6)['t']
        except AssertionError:
            out['ctrl_shift_u'] = 'got ' + repr(self.page()['t'])
        return out

    def scenario_ime(self):
        self.require_chromium()
        if not shutil.which('setxkbmap'):
            self.gate('ime_dead_keys_compose', 'BLOCKED_ENV', reason='setxkbmap missing')
            raise gui_test.Blocked('setxkbmap missing (x11-xkb-utils)')
        self.select_tab(self.gecko_tab)
        gecko = self.compose_keys('gecko')
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        chromium = self.compose_keys('chromium')
        self.screenshot('15-ime')
        checks = {name: (gecko[name] == expected, chromium[name] == expected)
                  for name, expected in (('dead_acute', 'é'), ('ctrl_shift_u', '€'))}
        if all(c and g for g, c in checks.values()):
            status = 'PASS'
        elif not any(g for g, _ in checks.values()):
            status = 'BLOCKED_ENV'   # the Gecko baseline does not compose under this Xvfb/xdotool setup either
        elif all(c or not g for g, c in checks.values()):
            status = 'PASS'          # Chromium matches Gecko on every sequence Gecko composes here
        else:
            status = 'FAIL'
        self.gate('ime_dead_keys_compose', status, screenshot='15-ime.png', gecko=gecko, chromium=chromium,
                  im_module='GTK built-in (gtk-im-context-simple); no IBus/Fcitx under Xvfb')
        if status == 'FAIL':
            raise AssertionError(f'compose differs from Gecko: chromium {chromium} gecko {gecko}')
        if status == 'BLOCKED_ENV':
            raise gui_test.Blocked(f'compose does not work in the Gecko baseline here either: {gecko}')
        return {'gecko': gecko, 'chromium': chromium}

    def scenario_middle_click(self):
        self.require_chromium()
        out = {}
        for engine, tab in (('chromium', self.cef_tab), ('gecko', self.gecko_tab)):
            self.select_tab(tab)
            if engine == 'chromium':
                self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
            self.click_at(*AT['area'])
            self.key('ctrl+a')
            self.key('BackSpace')
            self.wait_page(lambda page: page['a'] == '', f'{engine} textarea cleared')
            self.click_at(self.char_x(19), SEL_TOP, repeat=2)
            self.wait_page(lambda page: page['s'].strip() == 'delta', f'{engine}: "delta" selected (PRIMARY)')
            time.sleep(0.3)
            self.click_at(*AT['area'], button=2)
            try:
                out[engine] = {'pasted': self.wait_page(lambda page: 'delta' in page['a'], f'{engine}: middle-click pastes PRIMARY',
                                                        timeout=8)['a']}
            except AssertionError:
                out[engine] = {'pasted': None}
            page = self.page()
            out[engine].update({'middle_event': page['mb'], 'y': page['y']})
        self.select_tab(self.cef_tab)
        same = bool(out['chromium']['pasted']) == bool(out['gecko']['pasted'])
        self.gate('middle_click_paste_autoscroll', 'PASS' if same and out['chromium']['pasted'] else 'EXPERIMENTAL', **out,
                  autoscroll='general.autoScroll is off by default on Linux in Firefox; Chromium-on-Linux scroll after middle click recorded as y')
        return out

    def scenario_history(self):
        self.require_chromium()
        self.click_at(*AT['link'])
        page2 = self.wait_page(lambda page: page['p'] == '2', 'link click opens page 2 in Chromium')
        self.screenshot('16-page2')
        back = self.click_toolbar('back-button', 'toolbar Back enabled for Chromium history')
        page1 = self.wait_page(lambda page: page['p'] == '1', 'toolbar Back returns to page 1')
        self.screenshot('16-back')
        forward = None
        try:
            forward = self.click_toolbar('forward-button', 'toolbar Forward enabled')
            self.wait_page(lambda page: page['p'] == '2', 'toolbar Forward to page 2')
        except AssertionError as error:
            forward = 'forward button not usable in this Zen layout: ' + str(error)[:120]
            self.chrome_script('BrowserCommands.forward(); return true;')
            self.wait_page(lambda page: page['p'] == '2', 'Forward command to page 2')
        self.click_at(*AT['blank'])
        self.key('alt+Left')
        alt_left = self.wait_page(lambda page: page['p'] == '1', 'Alt+Left goes back')
        self.gate('history_toolbar_and_alt_left', 'PASS', screenshots=['16-page2.png', '16-back.png'],
                  back=back, forward=forward)
        return {'page2': page2, 'back': back, 'page1': page1, 'forward': forward, 'alt_left': alt_left['p'],
                'urlbar': self.web()['urlbar']}

    def scenario_beforeunload(self):
        self.require_chromium()
        self.click_at(*AT['d-unload'])
        self.wait_page(lambda page: 'armed' in page['d'], 'beforeunload armed (with a user gesture)')
        self.click_at(*AT['link'])
        opened = self.wait(lambda: self.alert_text(), 'Zen "leave page?" dialog', timeout=15)
        time.sleep(0.6)
        self.screenshot('17-beforeunload')
        via = self.answer_prompt(['Return'], True)
        page = self.wait_page(lambda page: page['p'] == '2', 'leaving the page after confirming')
        self.chrome_script('BrowserCommands.back(); return true;')
        self.wait_page(lambda page: page['p'] == '1', 'back to page 1')
        self.gate('beforeunload', 'PASS' if via == 'keyboard' else 'EXPERIMENTAL', screenshot='17-beforeunload.png', dialog=opened, via=via)
        return {'dialog': opened, 'via': via, 'page': page['p']}

    def scenario_to_gecko(self):
        self.require_chromium()
        url = self.web()['page']['url']
        menu = self.tab_menu('Open in Firefox', '18-to-gecko')
        state = self.wait(lambda: (lambda s: s if s['engine'] == 'gecko' and not s['geckoHidden'] and not s['overlay']
                                   and parse_feel(s['geckoTitle']) else None)(self.web()), 'the tab back in Gecko', timeout=30)
        if state['geckoURL'] != url:
            raise AssertionError(f'Gecko loaded {state["geckoURL"]}, Chromium was at {url}')
        self.screenshot('18-gecko-again')
        self.click_at(*AT['text'])
        self.type_text('gecko')
        typed = self.wait_page(lambda page: page['t'] == 'gecko', 'typing in the returned Gecko tab')
        time.sleep(1)
        self.gate('return_to_gecko', 'PASS', screenshot='18-gecko-again.png', url=state['geckoURL'],
                  hosts_after=len(self.host_pids()), note='web mode keeps one shared host per Zen profile while Zen runs')
        return {'menu': menu, 'url': state['geckoURL'], 'typed': typed['t'], 'host_processes': len(self.host_pids())}

    def scenario_host_kill(self):
        # Back to Chromium, then SIGKILL the shared host: the Chromium tab explains itself
        # (Firefox-style crashed page), every Gecko tab is untouched, and "Open in Firefox"
        # brings this tab back to Gecko at the same address.
        if self.web()['engine'] != 'chromium':
            self.tab_menu('Open in Chromium', '19-to-chromium')
            self.wait(lambda: self.chromium_ready(), 'Chromium again before the kill', timeout=60)
        url = self.web()['page']['url']
        pids = self.host_pids()
        if len(pids) != 1:
            raise AssertionError(f'expected one CEF host process, found {pids}')
        self.screenshot('19-before-kill')
        os.kill(pids[0], signal.SIGKILL)
        panel = self.wait(lambda: (lambda s: s if s['panel'] else None)(self.web()), 'crashed-page panel in the Chromium tab', timeout=30)
        self.screenshot('19-after-kill')
        self.select_tab(self.gecko_tab)
        gecko = self.wait_page(lambda page: True, 'Gecko baseline tab still renders')
        gecko_state = self.web()
        if gecko_state['engine'] != 'gecko' or gecko_state['geckoHidden']:
            raise AssertionError('the Gecko tab changed: ' + repr(gecko_state))
        self.screenshot('19-gecko-tab-after-kill')
        self.select_tab(self.cef_tab)
        # The panel's "Open in Firefox" button, clicked for real.
        point = self.chrome_script("""
            const overlay = gBrowser.selectedBrowser.parentNode.querySelector('[data-axiosozo-cef]');
            const button = [...overlay.querySelectorAll('.axiosozo-cef-panel button')].find(n => n.textContent === 'Open in Firefox');
            const r = button.getBoundingClientRect();
            return [Math.round((mozInnerScreenX + r.left + r.width / 2) * devicePixelRatio),
                    Math.round((mozInnerScreenY + r.top + r.height / 2) * devicePixelRatio)];""")
        self.xdotool('mousemove', '--sync', *point)
        self.xdotool('click', '1')
        state = self.wait(lambda: (lambda s: s if s['engine'] == 'gecko' and not s['overlay'] and parse_feel(s['geckoTitle'])
                                   else None)(self.web()), 'tab reopened in Gecko after the host died', timeout=30)
        self.screenshot('19-gecko-after-kill')
        left = self.host_pids()
        self.gate('e2_host_kill_preserves_gecko', 'PASS' if state['geckoURL'] == url else 'FAIL',
                  screenshots=['19-after-kill.png', '19-gecko-tab-after-kill.png', '19-gecko-after-kill.png'],
                  panel=panel['panel'], url=url, gecko_url=state['geckoURL'], hosts_left=len(left))
        if state['geckoURL'] != url:
            raise AssertionError(f'Gecko reopened {state["geckoURL"]}, expected {url}')
        return {'killed': pids[0], 'panel': panel['panel'], 'gecko_baseline': gecko, 'url': state['geckoURL'], 'hosts_left': left}

    # -- fixture-mode scenarios -----------------------------------------------------------------
    def fixture_state(self):
        return self.chrome_script(ENGINE_STATE)

    def scenario_fixture_roundtrip(self):
        url = self.fixture.url
        self.open_tab(url)
        self.wait(lambda: self.chrome_script('return gBrowser.selectedBrowser.contentTitle;').startswith('AxioSozo fixture'),
                  'fixture in the Gecko tab')
        self.focus_window()
        self.screenshot('f01-gecko')
        probe = self.click_toolbar('axiosozo-engine-probe', 'the fixture probe toolbar button')
        state = self.wait(lambda: (lambda s: s if s and not s['pending'] and (s['native'] or {}).get('frames', 0) >= 1
                                   and str(s['tabLabel']).startswith('AxioSozo fixture') else None)(self.fixture_state()),
                          'Chromium frames of the fixture', timeout=60)
        self.screenshot('f02-chromium')
        # Targets from the hidden (same-size) Gecko copy of the fixture.
        point = self.element_screen_point('#text')
        self.xdotool('mousemove', '--sync', *point)
        self.xdotool('click', '1')
        self.type_text('cef')
        typed = self.wait(lambda: (lambda t: t if 'input=cef' in t else None)(self.fixture_state()['tabLabel']), 'typed in Chromium')
        self.xdotool('mousemove', '--sync', *self.element_screen_point('#count'))
        self.xdotool('click', '1')
        clicked = self.wait(lambda: (lambda t: t if 'count=1' in t else None)(self.fixture_state()['tabLabel']), 'click in Chromium')
        self.screenshot('f03-typed')
        self.xdotool('mousemove', '--sync', *self.element_screen_point('a'))
        self.xdotool('click', '1')
        page2 = self.wait(lambda: (lambda t: t if 'page=2' in t else None)(self.fixture_state()['tabLabel']), 'page 2 in Chromium')
        self.screenshot('f04-page2')
        back = self.click_toolbar('back-button', 'toolbar Back for the fixture')
        page1 = self.wait(lambda: (lambda t: t if 'page=1' in t else None)(self.fixture_state()['tabLabel']), 'back to page 1')
        self.gate('fixture_e1', 'PASS', screenshots=['f02-chromium.png', 'f03-typed.png', 'f04-page2.png'],
                  native={k: state['native'].get(k) for k in ('renderPath', 'surface', 'frames', 'firstFrameMilliseconds')})
        return {'probe_button': probe, 'typed': typed, 'clicked': clicked, 'page2': page2, 'back': back, 'page1': page1}

    def scenario_fixture_host_kill(self):
        state = self.fixture_state()
        if state['tabEngine'] != 'chromium':
            raise gui_test.Blocked('needs the fixture tab in Chromium')
        before = self.chrome_script('const b = gBrowser.selectedBrowser; return {url: b.currentURI.spec, title: b.contentTitle,'
                                    ' pid: b.browsingContext?.currentWindowGlobal?.osPid ?? null};')
        pids = self.host_pids()
        if len(pids) != 1:
            raise AssertionError(f'expected one fixture host, found {pids}')
        os.kill(pids[0], signal.SIGKILL)
        after = self.wait(lambda: (lambda s: s if s['tabEngine'] == 'gecko' and not s['geckoBrowserHidden'] else None)(
            self.fixture_state()), 'the preserved Gecko document shown again', timeout=30)
        geck = self.chrome_script('const b = gBrowser.selectedBrowser; return {url: b.currentURI.spec, title: b.contentTitle,'
                                  ' pid: b.browsingContext?.currentWindowGlobal?.osPid ?? null};')
        self.screenshot('f05-gecko-after-kill')
        self.xdotool('mousemove', '--sync', *self.element_screen_point('#text'))
        self.xdotool('click', '1')
        self.type_text('gecko')
        typed = self.wait(lambda: (lambda t: t if 'input=gecko' in t else None)(
            self.chrome_script('return gBrowser.selectedBrowser.contentTitle;')), 'typing in the preserved Gecko document')
        preserved = geck['url'] == before['url'] and geck['pid'] == before['pid']
        self.gate('fixture_e2_host_kill', 'PASS' if preserved else 'FAIL', screenshot='f05-gecko-after-kill.png',
                  before=before, after=geck, failure=after['failure'])
        if not preserved:
            raise AssertionError(f'Gecko document not preserved: {before} -> {geck}')
        return {'killed': pids[0], 'before': before, 'after': geck, 'failure': after['failure'], 'typed': typed}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--app', default='auto')
    parser.add_argument('--mode', choices=('web', 'fixture'), default='web')
    parser.add_argument('--scale', type=int, choices=(1, 2), default=1)
    parser.add_argument('--scenario', help='comma list (default: all of the mode)')
    parser.add_argument('--evidence-dir')
    parser.add_argument('--size', default=None)
    parser.add_argument('--timeout', type=float, default=30)
    parser.add_argument('--launch-timeout', type=float, default=180)
    parser.add_argument('--hold', type=int, default=0)
    parser.add_argument('--screenshot')
    args = parser.parse_args()
    available = FIXTURE_SCENARIOS if args.mode == 'fixture' else (SCALE_SCENARIOS if args.scale == 2 else WEB_SCENARIOS)
    scenarios = [item for item in (args.scenario or ','.join(available)).split(',') if item]
    if any(item not in available for item in scenarios):
        parser.error('--scenario takes: ' + ','.join(available))
    args.size = args.size or ('2560x1600' if args.scale == 2 else '1280x800')
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    evidence = Path(args.evidence_dir).resolve() if args.evidence_dir else storage.BUILD_ROOT / 'gui-evidence' / f'cef-zen-{args.mode}-{stamp}'
    code = 0
    with FeelServer() as feel:
        harness = CEFZenHarness(args, ChromiumWeb(args.mode, args.scale), evidence, feel)
        harness.result.update(harness='axiosozo-linux-gui+cef-zen', mode=args.mode, scale=args.scale,
                              feel_fixture={'origin': feel.origin, 'sha256': feel.hashes})
        harness.result['test_only_switches'] += (['AXIOSOZO_ENGINE_SWITCHING=1 (existing developer gate)'] if args.mode == 'web'
                                                 else ['AXIOSOZO_ENGINE_PROBE=1 fixture probe'])
        if args.scale != 1:
            harness.result['test_only_switches'].append(f'profile pref layout.css.devPixelsPerPx={args.scale}')
        try:
            if not storage.LINUX:
                raise gui_test.Blocked('Linux only (Xvfb, CEF host)')
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
    for name, outcome in harness.result['scenarios'].items():
        if outcome['status'] == 'FAIL':
            harness.matrix.setdefault(name, {'status': 'FAIL', 'reason': outcome.get('reason')})
    harness.result['status'] = status
    harness.result['evidence_dir'] = str(evidence)
    if evidence.is_dir():
        (evidence / 'result.json').write_text(json.dumps(harness.result, indent=2) + '\n')
    print(json.dumps({'status': status, 'scenarios': {k: v['status'] for k, v in harness.result['scenarios'].items()},
                      'matrix': {k: v['status'] for k, v in harness.matrix.items()}, 'reason': harness.result.get('reason')},
                     indent=2), flush=True)
    return code


if __name__ == '__main__':
    sys.exit(main())
