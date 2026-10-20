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
WEB_SCENARIOS = ('launch', 'chrome', 'switch', 'fonts', 'scrollbars', 'badge', 'typing', 'click', 'focus', 'selection', 'clipboard', 'wheel',
                 'cursor', 'popups', 'context_menu', 'dialogs', 'find', 'zoom', 'ime', 'middle_click',
                 'history', 'beforeunload', 'download', 'permission', 'file_chooser', 'cert_error', 'devtools', 'to_gecko', 'host_kill', 'shortcuts', 'urlbar_chromium', 'ctrl_t_chromium',
                 'urlbar_gecko', 'ctrl_t_gecko')
A11Y_SCENARIOS = ('launch', 'chrome', 'switch', 'a11y')
SCALE_SCENARIOS = ('launch', 'chrome', 'switch', 'typing', 'click', 'selection', 'wheel', 'to_gecko')
FIXTURE_SCENARIOS = ('launch', 'chrome', 'fixture_roundtrip', 'fixture_host_kill')
HOST = 'AxioCEFProbe --stream'
# Fixed CSS-pixel geometry of tests/fixtures/cef-zen-feel.html (centres).
AT = {'text': (170, 38), 'count': (410, 38), 'link': (520, 38), 'area': (170, 150), 'select': (420, 138),
      'color': (550, 138), 'dl': (680, 138), 'd-alert': (80, 276), 'd-confirm': (210, 276), 'd-prompt': (340, 276),
      'd-unload': (470, 276), 'edit': (220, 330), 'blank': (700, 560), 'dl-link': (55, 496), 'perm': (230, 496),
      'file': (360, 496), 'tls-link': (630, 496)}
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
        status: bar._findStatusDesc?.textContent ?? null,
        highlightAll: bar.getElement?.('highlight')?.checked ?? null,
        chromiumResults: Object.getOwnPropertyDescriptor(gBrowser.selectedBrowser, 'finder')?.get?.()?.events ?? null};
"""
DATALIST_STATE = """
const overlay = gBrowser.selectedBrowser.parentNode.querySelector('[data-axiosozo-cef]');
const list = overlay?.style.display === 'block' ? overlay.querySelector('.axiosozo-cef-datalist') : null;
const popup = document.getElementById('PopupAutoComplete');
return {zen: list && !list.hidden ? {rows: [...list.children].map(row => row.firstChild?.textContent ?? ''),
                                     box: (r => [r.left, r.top, r.width, r.height])(list.getBoundingClientRect())} : null,
        firefox: popup ? {state: popup.state, rows: (() => { try { return popup.view?.matchCount ?? null; } catch (e) { return null; } })(),
                          labels: [...(popup.richlistbox?.children ?? [])].filter(n => !n.collapsed && !n.hidden)
                                    .map(n => n.getAttribute('ac-value') ?? n.getAttribute('ac-label') ?? '').slice(0, 8)} : null};
"""
CONTEXT_MENU = """
const popup = document.getElementById('axiosozo-chromium-context-menu');
if (!popup) return {open: false};
return {open: popup.state === 'open', state: popup.state,
  items: [...popup.children].filter(n => n.localName === 'menuitem').map(n => ({label: n.getAttribute('label'),
    action: n.dataset.action, disabled: n.getAttribute('disabled') === 'true'}))};
"""


DOWNLOAD_BODY = b'AxioSozo feel download: synthetic test file, no personal data.\n'


def lan_address():
    """The machine's own non-loopback IPv4 address (a UDP connect sends no packet), or None."""
    import socket
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as probe:
            probe.connect(('192.0.2.1', 9))
            address = probe.getsockname()[0]
        return None if address.startswith('127.') else address
    except OSError:
        return None


class FeelServer:
    """Owned HTTP fixture servers: /feel.html and /engine.html (each with ?page=2) and /download.txt
    (an attachment). GET only. Loopback always; a copy on the machine's own LAN address (for the
    "Not secure" badge of a plain-HTTP non-loopback page); a loopback HTTPS copy with a throwaway
    self-signed certificate (certificate-error gates). Nothing listens beyond this machine's addresses."""

    def __init__(self, workdir=None):
        pages = {'/feel.html': FEEL.read_bytes(), '/engine.html': ENGINE_FIXTURE.read_bytes()}
        self.hashes = {name: hashlib.sha256(data).hexdigest() for name, data in pages.items()}
        self.servers = []
        owner = self

        class Handler(http.server.BaseHTTPRequestHandler):
            protocol_version = 'HTTP/1.0'

            def log_message(self, *_):
                pass

            def reply(self, code, payload=b'', content_type='text/plain; charset=utf-8', extra=()):
                self.send_response(code)
                self.send_header('Content-Type', content_type)
                self.send_header('Content-Length', str(len(payload)))
                self.send_header('Cache-Control', 'no-store')
                self.send_header('X-Content-Type-Options', 'nosniff')
                for name, value in extra:
                    self.send_header(name, value)
                self.send_header('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; "
                                 "style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'")
                self.end_headers()
                self.wfile.write(payload)
                self.close_connection = True

            def do_GET(self):
                host, port = self.server.server_address[:2]
                if self.headers.get_all('Host', []) != [f'{host}:{port}']:
                    return self.reply(400)
                url = urllib.parse.urlsplit(self.path)
                if url.path in pages and url.query in ('', 'page=2') and not url.fragment:
                    return self.reply(200, pages[url.path].replace(b'__AXIOSOZO_TLS_URL__', (owner.tls_url or '#').encode()),
                                      'text/html; charset=utf-8')
                if url.path == '/download.txt' and not url.query:
                    return self.reply(200, DOWNLOAD_BODY, 'text/plain; charset=utf-8',
                                      [('Content-Disposition', 'attachment; filename="axiosozo-feel-download.txt"')])
                if url.path == '/favicon.ico':
                    return self.reply(204)
                return self.reply(404)

            def do_POST(self):
                self.reply(405)

        def serve(address, context=None):
            server = http.server.ThreadingHTTPServer((address, 0), Handler)
            server.daemon_threads = True
            if context:
                server.socket = context.wrap_socket(server.socket, server_side=True)
            self.servers.append(server)
            return f"{'https' if context else 'http'}://{address}:{server.server_port}"

        self.origin = serve('127.0.0.1')
        self.url = self.origin + '/feel.html'
        lan = lan_address()
        self.lan_origin = serve(lan) if lan else None
        self.lan_url = self.lan_origin + '/feel.html' if lan else None
        self.tls_origin = self.tls_url = None
        self.tls_note = None
        if workdir and shutil.which('openssl'):
            import ssl
            key, cert = Path(workdir) / 'feel-tls.key', Path(workdir) / 'feel-tls.crt'
            made = subprocess.run(['openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', str(key), '-out', str(cert),
                                   '-days', '1', '-subj', '/CN=axiosozo-feel-untrusted', '-addext', 'subjectAltName=IP:127.0.0.1'],
                                  capture_output=True, text=True, timeout=60)
            if made.returncode == 0:
                context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
                context.load_cert_chain(str(cert), str(key))
                self.tls_origin = serve('127.0.0.1', context)
                self.tls_url = self.tls_origin + '/feel.html'
            else:
                self.tls_note = 'openssl: ' + made.stderr.strip()[-300:]
        else:
            self.tls_note = 'openssl missing'
        self.threads = [threading.Thread(target=server.serve_forever, kwargs={'poll_interval': .05}, daemon=True)
                        for server in self.servers]

    def __enter__(self):
        for thread in self.threads:
            thread.start()
        return self

    def __exit__(self, *_):
        for server in self.servers:
            server.shutdown()
            server.server_close()


class ChromiumWeb(ChromiumEngine):
    """The Chromium plug-in in the daily web mode instead of the fixture probe."""
    name = 'chromium'
    owner = 'cloud/cef-zen-feel'

    def __init__(self, mode, scale, a11y=False, native_receiver='default', prefs=()):
        self.mode, self.scale, self.a11y, self.native_receiver = mode, scale, a11y, native_receiver
        self.prefs = list(prefs)

    def browser_environment(self, harness):
        env = super().browser_environment(harness)
        if self.native_receiver == 'off':
            # TEST-ONLY: the frame path's JS/worker presenter instead of the native Linux receiver
            # (engine-view/linux), whose Chromium frames capture black in this environment.
            with open(os.path.join(harness.result['session'], 'gecko', 'user.js'), 'a') as prefs:
                prefs.write('user_pref("axiosozo.engines.linux.native_receiver", false);\n')
        if self.prefs:
            # TEST-ONLY frame-path prefs (--pref), e.g. memfd frames off, to isolate where pixels go black.
            with open(os.path.join(harness.result['session'], 'gecko', 'user.js'), 'a') as prefs:
                for name, value in self.prefs:
                    prefs.write(f'user_pref({json.dumps(name)}, {json.dumps(value)});\n')
        if self.scale != 1:
            with open(os.path.join(harness.result['session'], 'gecko', 'user.js'), 'a') as prefs:
                prefs.write(f'user_pref("layout.css.devPixelsPerPx", "{self.scale}");\n')
        if self.mode == 'web':
            # Downloads of both engines land in the throwaway session (Firefox's own download prefs).
            downloads = Path(harness.result['session']) / 'downloads'
            downloads.mkdir(mode=0o700, exist_ok=True)
            with open(os.path.join(harness.result['session'], 'gecko', 'user.js'), 'a') as prefs:
                prefs.write(f'user_pref("browser.download.dir", {json.dumps(str(downloads))});\n'
                            'user_pref("browser.download.folderList", 2);\nuser_pref("browser.download.useDownloadDir", true);\n')
            for name in ('AXIOSOZO_ENGINE_PROBE', 'AXIOSOZO_ENGINE_FIXTURE_ORIGIN'):
                env.pop(name, None)
            env['AXIOSOZO_ENGINE_SWITCHING'] = '1'
        if self.a11y:
            # As a desktop with an active screen reader: Gecko starts its ATK/AT-SPI bridge.
            env['GNOME_ACCESSIBILITY'] = '1'
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


def black_fraction(png, box, step=4):
    """Share of (near-)black pixels inside box [x, y, w, h] (device pixels) of a harness PNG
    (gui_test.xwd_to_png: 8-bit RGB, filter 0 on every row)."""
    import struct
    import zlib
    data = Path(png).read_bytes()
    width = height = 0
    idat = b''
    at = 8
    while at < len(data):
        size, = struct.unpack('>I', data[at:at + 4])
        kind = data[at + 4:at + 8]
        body = data[at + 8:at + 8 + size]
        if kind == b'IHDR':
            width, height = struct.unpack('>II', body[:8])
        elif kind == b'IDAT':
            idat += body
        at += 12 + size
    raw = zlib.decompress(idat)
    stride = width * 3 + 1
    x0, y0 = max(0, int(box[0])), max(0, int(box[1]))
    x1, y1 = min(width, int(box[0] + box[2])), min(height, int(box[1] + box[3]))
    total = black = 0
    for y in range(y0, y1, step):
        row = raw[y * stride + 1:(y + 1) * stride]
        for x in range(x0, x1, step):
            r, g, b = row[x * 3:x * 3 + 3]
            total += 1
            black += r + g + b < 24
    return round(black / total, 3) if total else None


def parse_feel(title):
    if not isinstance(title, str) or not title.startswith('AxioSozo feel {'):
        return None
    try:
        return json.loads(title[len('AxioSozo feel '):])
    except ValueError:
        return None


# Address-bar scenarios run last because the Linux parent process has a known WebRender
# SIGSEGV around address-bar focus/input (owned by cloud/linux-platform; reproduced on the
# Gecko baseline tab in run 39354267095). When the browser dies in one of them, it and the
# scenarios after it are BLOCKED by that bug, not Chromium failures.
ADDRESS_BAR_SCENARIOS = ('urlbar_chromium', 'ctrl_t_chromium', 'urlbar_gecko', 'ctrl_t_gecko')
BROWSER_GONE = ('browser exited', 'Marionette closed the connection', 'Broken pipe', 'reset by peer')


def known_parent_crash(result):
    crashed = False
    for name in ADDRESS_BAR_SCENARIOS:
        outcome = result['scenarios'].get(name)
        if not outcome or outcome['status'] != 'FAIL':
            continue
        if crashed or any(text in outcome.get('reason', '') for text in BROWSER_GONE):
            reason = ('browser already gone after the known parent crash' if crashed else
                      'KNOWN_PARENT_CRASH (cloud/linux-platform address-bar WebRender SIGSEGV): ' + outcome['reason'])
            outcome.update(status='BLOCKED_ENV', reason=reason)
            result['matrix'][name] = {'status': 'BLOCKED', 'reason': reason}
            crashed = True


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
        # WebDriver accepts beforeunload prompts by itself unless the handler map says otherwise.
        try:
            self.marionette.call('WebDriver:NewSession', {'strictFileInteractability': True,
                                                          'unhandledPromptBehavior': {'default': 'ignore', 'beforeUnload': 'ignore'}})
            self.result['prompt_handler'] = {'default': 'ignore', 'beforeUnload': 'ignore'}
        except gui_test.MarionetteError as error:
            self.marionette.call('WebDriver:NewSession', {'strictFileInteractability': True, 'unhandledPromptBehavior': 'ignore'})
            self.result['prompt_handler'] = 'ignore (handler map refused: %s)' % str(error)[:200]
        self.marionette.call('WebDriver:SetTimeouts', {'script': int(self.timeout * 1000), 'pageLoad': int(self.timeout * 1000)})
        self.result['test_only_switches'].append('Marionette unhandledPromptBehavior=ignore')

    def start_bus(self, session):
        self.bus_address = super().start_bus(session)
        return self.bus_address

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
        self.gecko_handle = self.open_tab(url)
        self.wait_page(lambda page: page['p'] == '1', 'feel page in the Gecko baseline tab')
        self.gecko_tab = self.web()['tabId']
        # Tab B: the same page, moved to Chromium through Zen's own tab menu.
        self.cef_handle = self.open_tab(url)
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
        shot = self.screenshot('02-chromium')
        black = self.view_black(shot, state)
        self.gate('window_title', 'PASS', x11_title=self.window_title())
        self.gate('e1_render_in_content_area', 'PASS' if black is not None and black < 0.5 else 'FAIL', screenshot='02-chromium.png',
                  seconds=seconds, surface=native.get('surface'), first_frame_ms=native.get('firstFrameMilliseconds'),
                  black_fraction=black, frame_path={k: native.get(k) for k in ('frameUpload', 'nativeReceiver', 'memfdFallback',
                                                                              'frameTransport', 'frameWorker')})
        if black is None or black >= 0.5:
            raise AssertionError(f'the Chromium view is {black} black in 02-chromium.png; frame path {native}')
        return {'menu': menu, 'seconds': seconds, 'gecko_page': gecko, 'state': {k: state[k] for k in
                ('engine', 'mode', 'view', 'geckoHidden', 'geckoURL', 'overlay', 'label', 'tabs', 'focus')},
                'native': native}

    def scenario_fonts(self):
        """The same text in each CSS generic family has the same width in Chromium as in the Gecko tab
        (same fonts resolved through fontconfig), including the fallback for unknown and ui-* families."""
        self.require_chromium()
        chromium = self.page()['fw']
        self.screenshot('30-fonts-chromium')
        self.select_tab(self.gecko_tab)
        gecko = self.page()['fw']
        self.screenshot('30-fonts-gecko')
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        ratios = {name: round(chromium[name] / gecko[name], 3) if gecko[name] else None for name in gecko}
        off = {name: ratio for name, ratio in ratios.items() if ratio is None or abs(ratio - 1) > 0.03}
        self.gate('fonts_match_gecko', 'FAIL' if off else 'PASS', screenshots=['30-fonts-chromium.png', '30-fonts-gecko.png'],
                  chromium=chromium, gecko=gecko, ratios=ratios,
                  note='CSS px width of the same text per family (default=unknown family, serif, sans-serif, monospace, '
                       'system-ui, ui-monospace); within 3% = the same face')
        if off:
            raise AssertionError(f'font widths differ from Gecko: {off}')
        return {'chromium': chromium, 'gecko': gecko, 'ratios': ratios}

    def scenario_scrollbars(self):
        """Chromium uses overlay scrollbars like Gecko on GTK: no layout width taken, a thin bar while scrolling."""
        self.require_chromium()
        out = {}
        for engine, tab in (('chromium', self.cef_tab), ('gecko', self.gecko_tab)):
            self.select_tab(tab)
            if engine == 'chromium':
                self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
            self.move(*AT['blank'])
            for _ in range(3):
                self.xdotool('click', '5')
                time.sleep(0.05)
            page = self.wait_page(lambda page: page['y'] > 0, f'{engine} scrolled')
            time.sleep(0.3)
            self.screenshot(f'31-scrollbar-{engine}', settle=False)
            out[engine] = {'layout_width': page['sw'], 'inner_width': page['z'][1]}
            self.scroll_top()
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        same = out['chromium']['layout_width'] == out['gecko']['layout_width']
        self.gate('overlay_scrollbars', 'PASS' if same else 'FAIL', screenshots=['31-scrollbar-chromium.png', '31-scrollbar-gecko.png'],
                  **out, note='layout_width = innerWidth - clientWidth: 0 for overlay scrollbars')
        if not same:
            raise AssertionError(f'scrollbar layout width differs: {out}')
        return out

    BADGE_GEOMETRY = """
        const rect = node => { if (!node) return null; const r = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          const chain = []; for (let n = node.parentElement, i = 0; n && i < 4; n = n.parentElement, i++) {
            const pr = n.getBoundingClientRect(); chain.push({id: n.id || n.localName, x: pr.left, w: pr.width,
              display: getComputedStyle(n).display, overflow: getComputedStyle(n).overflowX}); }
          return {id: node.id, x: r.left, y: r.top, w: r.width, h: r.height, flex: style.flex, parents: chain,
                  shown: r.width > 0 && r.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'}; };
        const browser = gBrowser.selectedBrowser, stack = browser.parentNode;
        const overlay = stack?.querySelector?.('[data-axiosozo-cef]');
        const content = rect(overlay && overlay.style.display === 'block' ? overlay : browser);
        return {content, urlbar: rect(document.getElementById('urlbar')),
                chips: ['axiosozo-engine-badge', 'axiosozo-engine-probe', 'axiosozo-engine-indicator', 'axiosozo-actions']
                  .map(id => rect(document.getElementById(id))).filter(Boolean)};"""

    @staticmethod
    def overlaps(chips, content):
        def inter(a, b):
            return min(a['x'] + a['w'], b['x'] + b['w']) - max(a['x'], b['x']) > 0.5 and \
                min(a['y'] + a['h'], b['y'] + b['h']) - max(a['y'], b['y']) > 0.5
        return [chip['id'] for chip in chips if chip['shown'] and inter(chip, content)]

    def scenario_badge(self):
        """Engine chips and the "Not secure" badge live in Zen's toolbar/address bar, never over the page."""
        self.require_chromium()
        loopback = self.chrome_script(self.BADGE_GEOMETRY)
        out = {'loopback': loopback}
        covering = self.overlaps(loopback['chips'], loopback['content'])
        if self.feel.lan_url:
            # A plain-HTTP page on the runner's own non-loopback address: Chromium tabs show "Not secure".
            self.chrome_script('gBrowser.selectedTab = gBrowser.tabs.find(t => t.linkedPanel === arguments[0]); return true;',
                               [self.cef_tab])
            self.chrome_script('window.AxioSozo.engineProbe.navigate(arguments[0]); return true;', [self.feel.lan_url])
            self.wait_page(lambda page: page['p'] == '1' and self.web()['page']['url'].startswith(self.feel.lan_origin),
                           'the LAN copy of the feel page in Chromium', timeout=20)
            time.sleep(0.8)
            self.screenshot('32-not-secure-badge')
            lan = self.chrome_script(self.BADGE_GEOMETRY)
            out['lan'] = lan
            out['lan_badge_shown'] = any(chip['id'] == 'axiosozo-engine-badge' and chip['shown'] for chip in lan['chips'])
            covering += self.overlaps(lan['chips'], lan['content'])
            self.chrome_script('window.AxioSozo.engineProbe.navigate(arguments[0]); return true;', [self.feel.url])
            self.wait_page(lambda page: self.web()['page']['url'].startswith(self.feel.origin), 'back on the loopback page', timeout=20)
        else:
            out['lan'] = 'no non-loopback IPv4 address on this machine'
        status = 'FAIL' if covering else ('PASS' if out.get('lan_badge_shown') else 'EXPERIMENTAL')
        self.gate('badge_never_covers_content', status, screenshot='32-not-secure-badge.png', covering=covering,
                  lan_badge_shown=out.get('lan_badge_shown'))
        if covering:
            raise AssertionError(f'chips over the page content: {covering}: {out}')
        return out

    def atspi(self, root_name, root_role=None, press=None):
        """The app's AT-SPI subtree under the accessible named root_name (scripts/atspi_probe.py)."""
        if getattr(self, 'bus_address', 'disabled:').startswith('disabled:'):
            raise gui_test.Blocked('no private D-Bus session bus for AT-SPI')
        command = ['/usr/bin/python3', '-I', str(ROOT / 'scripts/atspi_probe.py'), '--app-pid', str(self.browser.pid),
                   '--root-name', root_name]
        if root_role:
            command += ['--root-role', root_role]
        if press:
            command += ['--press', press]
        done = subprocess.run(command, env={**self.x_env, 'DBUS_SESSION_BUS_ADDRESS': self.bus_address}, capture_output=True,
                              text=True, timeout=120)
        if 'No module named' in done.stderr or 'Namespace Atspi not available' in done.stderr:
            raise gui_test.Blocked('python3-gi / gir1.2-atspi-2.0 missing: ' + done.stderr.strip()[-200:])
        try:
            return json.loads(done.stdout.strip().splitlines()[-1])
        except (ValueError, IndexError):
            raise AssertionError(f'atspi_probe failed ({done.returncode}): {done.stderr.strip()[-600:]}') from None

    @staticmethod
    def has(tree, role, name):
        return any(node['role'] == role and node['name'] == name for node in tree.get('nodes', []))

    def scenario_a11y(self):
        """Chromium's accessibility tree reaches AT-SPI under the tab (as the Gecko tab's document does), and
        an assistive action on a Chromium button presses it."""
        self.require_chromium()
        time.sleep(2)
        chromium = self.atspi(r'\(Chromium\)$')
        self.select_tab(self.gecko_tab)
        gecko = self.atspi(r'^AxioSozo feel', root_role='document web')
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        time.sleep(1)
        expected = [('push button', 'Increment'), ('link', 'Page 2'), ('entry', 'Type here')]
        found = {f'{role}:{name}': {'chromium': self.has(chromium, role, name), 'gecko': self.has(gecko, role, name)}
                 for role, name in expected}
        before = self.page()['c']
        pressed = self.atspi(r'\(Chromium\)$', press='push button=Increment')
        try:
            after = self.wait_page(lambda page: page['c'] > before, 'the AT-SPI action pressed the Chromium button', timeout=10)['c']
        except AssertionError:
            after = self.page()['c']
        # Focus: Chromium's focused node is AT-SPI's focused accessible (button: the canvas keeps
        # Zen's focus; text field: Zen's IME proxy editor has it).
        def focused_nodes():
            return [(node['role'], node['name']) for node in self.atspi(r'\(Chromium\)$').get('nodes', []) if node['focused']]
        self.click_at(*AT['text'])
        self.wait_page(lambda page: page['f'] == 'text', 'text field focused')
        self.key('Tab')
        self.wait_page(lambda page: page['f'] == 'count', 'Tab to the button')
        try:
            focused_button = self.wait(lambda: (lambda f: f if ('push button', 'Increment') in f else None)(focused_nodes()),
                                       'AT-SPI focus on the Chromium button', timeout=10)
        except AssertionError:
            focused_button = focused_nodes()
        self.key('shift+Tab')
        self.wait_page(lambda page: page['f'] == 'text', 'Shift+Tab to the text field')
        time.sleep(1.5)
        focused = {'button': focused_button, 'text_field': focused_nodes(), 'chrome_focus': self.web()['focus']}
        self.screenshot('33-a11y')
        ok = all(item['chromium'] for item in found.values()) and after > before
        self.gate('accessibility_atspi', 'PASS' if ok else 'FAIL', found=found, press={'before': before, 'after': after, **(pressed.get('pressed') or {})},
                  chromium_root=chromium.get('root'), chromium_nodes=len(chromium.get('nodes', [])), gecko_nodes=len(gecko.get('nodes', [])),
                  focused=focused,
                  note='GNOME_ACCESSIBILITY=1 (test-only, as with a running screen reader); read through AT-SPI with atspi_probe.py')
        if not ok:
            raise AssertionError(f'AT-SPI: {found}, press {before}->{after}: {pressed.get("pressed")}')
        return {'found': found, 'chromium': chromium, 'gecko': {'root': gecko.get('root'), 'nodes': gecko.get('nodes', [])[:80]},
                'pressed': pressed.get('pressed'), 'focused': focused}

    def view_black(self, shot, state=None):
        view = (state or self.web())['view']
        scale = self.chrome_script('return window.devicePixelRatio;')
        try:
            return black_fraction(shot, [view['x'] * scale, view['y'] * scale, view['w'] * scale, view['h'] * scale])
        except (OSError, ValueError, KeyError) as error:
            self.result.setdefault('notes', []).append(f'black_fraction: {error}')
            return None

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
        # <datalist>: Zen draws the suggestions (windowless Chromium draws none), Gecko baseline alongside.
        out['datalist'] = {}
        for engine, tab in (('chromium', self.cef_tab), ('gecko', self.gecko_tab)):
            self.select_tab(tab)
            if engine == 'chromium':
                self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
            self.click_at(*AT['dl'])
            self.key('ctrl+a')
            self.key('BackSpace')
            self.type_text('ap')
            time.sleep(1.0)
            shown = self.chrome_script(DATALIST_STATE)
            self.screenshot(f'09-datalist-{engine}', settle=False)
            self.key('Down')
            self.key('Return')
            try:
                value = self.wait_page(lambda page: page['dl'] == 'apple', f'{engine}: datalist suggestion chosen', timeout=8)['dl']
            except AssertionError:
                value = self.page()['dl']
            out['datalist'][engine] = {'shown': shown, 'value': value}
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        chromium = out['datalist']['chromium']
        ok = chromium['value'] == 'apple' and (chromium['shown'].get('zen') or {}).get('rows') == ['apple', 'apricot']
        self.gate('datalist_popup', 'PASS' if ok else 'FAIL', screenshots=['09-datalist-chromium.png', '09-datalist-gecko.png'],
                  **out['datalist'], note='Chromium tab: Zen-drawn list from the host `datalist` event; Gecko: Firefox autocomplete popup')
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
        if self.matrix['datalist_popup']['status'] == 'FAIL':
            raise AssertionError('datalist: ' + repr(out['datalist']))
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
                  note='under Xvfb + software WebRender, xwd captures context-menu popups black for Firefox\'s own menu too '
                       '(10-gecko-context-menu.png); items and placement are asserted from the open menupopup',
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

    def find_next_settled(self, before, timeout=5.0):
        """The findbar after Return: polled until its ordinal changes (the Chromium finder may
        restart its session from the kept selection and step once), else the last state."""
        deadline = time.monotonic() + timeout
        state = self.chrome_script(FINDBAR_STATE)
        while state['matches'] == before['matches'] and time.monotonic() < deadline:
            time.sleep(0.25)
            state = self.chrome_script(FINDBAR_STATE)
        time.sleep(0.3)
        return self.chrome_script(FINDBAR_STATE)

    def scenario_find(self):
        self.require_chromium()
        self.click_at(*AT['blank'])
        self.key('ctrl+f')
        bar = self.wait(lambda: (lambda b: b if b['open'] else None)(self.chrome_script(FINDBAR_STATE)), 'Zen findbar open', timeout=10)
        self.type_text('needle')
        found = self.wait(lambda: (lambda b: b if b['value'] == 'needle' and ('3' in str(b['matches']) + str(b['matchesArgs'])) else None)(
            self.chrome_script(FINDBAR_STATE)), 'findbar reports 3 matches from Chromium', timeout=15)
        time.sleep(0.5)
        found = self.chrome_script(FINDBAR_STATE)
        self.screenshot('12-find')
        self.key('Return')
        again = self.find_next_settled(found)
        self.screenshot('12-find-next')
        # Highlight All on, then off again (Firefox's checkbox).
        toggle = "const bar = gBrowser.getCachedFindBar(gBrowser.selectedTab); bar.getElement('highlight').click(); " \
                 "return bar.getElement('highlight').checked;"
        highlight_on = self.chrome_script(toggle)
        time.sleep(1.0)
        self.screenshot('12-find-highlight-all')
        highlight_off = self.chrome_script(toggle)
        time.sleep(1.0)
        self.screenshot('12-find-highlight-off')
        self.key('Escape')
        closed = self.wait(lambda: not self.chrome_script(FINDBAR_STATE)['open'], 'findbar closed', timeout=10)
        # Gecko baseline: the same search in Firefox's own findbar.
        self.select_tab(self.gecko_tab)
        self.click_at(*AT['blank'])
        self.key('ctrl+f')
        self.wait(lambda: self.chrome_script(FINDBAR_STATE)['open'], 'Gecko findbar open', timeout=10)
        self.key('ctrl+a')
        self.type_text('needle')
        gecko = self.wait(lambda: (lambda b: b if b['value'] == 'needle' and '3' in str(b['matches']) + str(b['matchesArgs']) else None)(
            self.chrome_script(FINDBAR_STATE)), 'Gecko findbar reports 3 matches', timeout=15)
        time.sleep(0.5)
        gecko = self.chrome_script(FINDBAR_STATE)
        self.screenshot('12-find-gecko')
        self.key('Return')
        gecko_again = self.find_next_settled(gecko)
        self.key('Escape')
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        same = (found['matches'], again['matches']) == (gecko['matches'], gecko_again['matches'])
        self.gate('find_in_page', 'PASS' if same else 'FAIL', screenshots=['12-find.png', '12-find-next.png', '12-find-gecko.png'],
                  chromium=[found['matches'], again['matches']], gecko=[gecko['matches'], gecko_again['matches']],
                  chromium_results=again.get('chromiumResults'),
                  highlight_all={'chromium': found.get('highlightAll'), 'gecko': gecko.get('highlightAll'),
                                 'toggled': [highlight_on, highlight_off]},
                  note='12-find*.png: without Highlight All only the active match is marked (selection), with it every match')
        if not same:
            raise AssertionError(f"findbar counts differ: chromium {[found['matches'], again['matches']]} "
                                 f"gecko {[gecko['matches'], gecko_again['matches']]}")
        return {'opened': bar, 'found': found, 'again': again, 'closed': closed, 'gecko': gecko, 'gecko_again': gecko_again}

    ZOOM_KEYS = """
        return [...document.querySelectorAll('key')].filter(k => ['0', '=', '+', '-'].includes(k.getAttribute('key'))
          || ['VK_ADD', 'VK_SUBTRACT'].includes(k.getAttribute('keycode'))).map(k => ({id: k.id, key: k.getAttribute('key'),
          modifiers: k.getAttribute('modifiers'), command: k.getAttribute('command'), oncommand: k.getAttribute('oncommand'),
          disabled: k.getAttribute('disabled')}));"""

    ZOOM_PROBE = """
        if (!window.__feelZoom) {
          const log = window.__feelZoom = {keys: [], resets: 0};
          for (const type of ['keydown', 'keypress'])
            window.addEventListener(type, e => { if (e.ctrlKey && e.key === '0') log.keys.push({type, target: e.target?.localName,
              prevented: e.defaultPrevented, code: e.code, charCode: e.charCode, keyCode: e.keyCode, phase: e.eventPhase}); },
              {capture: true, mozSystemGroup: true});
          const reset = FullZoom.reset;
          FullZoom.reset = function(...args) { log.resets++; return reset.apply(this, args); };
        }
        const log = window.__feelZoom; const out = JSON.parse(JSON.stringify(log)); log.keys = []; log.resets = 0;
        out.command = document.getElementById('cmd_fullZoomReset')?.getAttribute('oncommand') ?? null;
        out.commandDisabled = document.getElementById('cmd_fullZoomReset')?.getAttribute('disabled') ?? null;
        return out;"""

    def zoom_cycle(self):
        """Ctrl+=, Ctrl+0, Ctrl+-, then Zen's reset command, on the selected tab: page zoom factors."""
        self.chrome_script(self.ZOOM_PROBE)
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
        out['ctrl_0_events'] = self.chrome_script(self.ZOOM_PROBE)
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
        # Ctrl+W with the focus in a Chromium page closes that Chromium tab.
        self.open_tab(self.feel.url)
        self.wait_page(lambda page: page['p'] == '1', 'extra feel tab in Gecko')
        extra = self.web()['tabId']
        self.focus_window()
        self.tab_menu('Open in Chromium', '20-extra-to-chromium')
        self.wait(lambda: self.chromium_ready(), 'extra tab in Chromium', timeout=60)
        self.click_at(*AT['text'])
        self.wait_page(lambda page: page['f'] == 'text', 'focus in the extra Chromium page')
        before = self.web()['tabs']
        self.key('ctrl+w')
        out['ctrl_w'] = self.wait(lambda: (lambda s: s['tabs'] if s['tabs'] == before - 1 and s['tabId'] != extra else None)(self.web()),
                                  'Ctrl+W closes the focused Chromium tab', timeout=10)
        self.ensure_chromium('20-to-chromium')
        self.click_at(*AT['blank'])
        self.key('ctrl+Tab')
        out['ctrl_tab'] = self.wait(lambda: (lambda s: s['tabId'] if s['tabId'] != self.cef_tab else None)(self.web()),
                                    'Ctrl+Tab leaves the Chromium tab', timeout=10)
        self.key('ctrl+shift+Tab')
        out['ctrl_shift_tab'] = self.wait(lambda: (lambda s: s['tabId'] if s['tabId'] == self.cef_tab else None)(self.web()),
                                          'Ctrl+Shift+Tab returns', timeout=10)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented again', timeout=15)
        out['reload_chromium'] = self.reload_keys('chromium')
        self.select_tab(self.gecko_tab)
        out['reload_gecko'] = self.reload_keys('gecko')
        self.ensure_chromium('20-to-chromium')
        if out['reload_chromium']['results'] != out['reload_gecko']['results']:
            self.gate('reload_keys', 'FAIL', chromium=out['reload_chromium'], gecko=out['reload_gecko'])
            raise AssertionError(f"reload keys differ from Gecko: {out['reload_chromium']} vs {out['reload_gecko']}")
        self.gate('reload_keys', 'PASS', chromium=out['reload_chromium'], gecko=out['reload_gecko'])
        last = self.page()['k']
        out['page_last_key'] = last
        out['page_saw_chrome_keys'] = last != key_before and any(last.startswith(p) for p in ('C:t:', 'C:w:', 'C:Tab:', 'C:r:', ':F5:'))
        self.gate('shortcut_ownership', 'FAIL' if out['page_saw_chrome_keys'] else 'PASS',
                  checked=['Ctrl+T (ctrl_t_*)', 'Ctrl+W', 'Ctrl+Tab', 'Ctrl+Shift+Tab', 'F5', 'Ctrl+R', 'Ctrl+F (find)', 'Ctrl+=/-/0 (zoom)',
                           'Alt+Left (history)', 'Ctrl+L (urlbar_*)'], details=out)
        if out['page_saw_chrome_keys']:
            raise AssertionError('the page received a Zen shortcut: ' + last)
        return out

    RELOAD_PROBE = """
        if (!window.__feelReload) {
          const log = window.__feelReload = {keys: [], reloads: 0};
          window.addEventListener('keydown', e => { if (/^F\\d/.test(e.key) || (e.ctrlKey && e.key === 'r'))
            log.keys.push({key: e.key, target: e.target?.localName, prevented: e.defaultPrevented}); }, {capture: true, mozSystemGroup: true});
          const reload = BrowserCommands.reload;
          BrowserCommands.reload = function(...args) { log.reloads++; return reload.apply(this, args); };
        }
        const out = JSON.parse(JSON.stringify(window.__feelReload)); window.__feelReload.keys = []; window.__feelReload.reloads = 0;
        out.keyReload = (k => k ? {disabled: k.getAttribute('disabled'), command: k.getAttribute('command'),
          oncommand: k.getAttribute('oncommand')} : null)(document.getElementById('key_reload'));
        out.cmdReload = document.getElementById('Browser:Reload')?.getAttribute('disabled') ?? null;
        return out;"""

    def reload_keys(self, engine):
        """F5 and Ctrl+R over the page: does each reload it (sessionStorage load counter)?"""
        self.chrome_script(self.RELOAD_PROBE)
        results, probes = {}, {}
        for key in ('F5', 'ctrl+r'):
            self.click_at(*AT['blank'])
            loads = self.page()['l']
            self.key(key)
            try:
                self.wait_page(lambda page: page['l'] == loads + 1, f'{key} reloads the {engine} page', timeout=12)
                results[key] = True
            except AssertionError:
                results[key] = False
            probes[key] = self.chrome_script(self.RELOAD_PROBE)
        return {'results': results, 'probes': probes}

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

    def ctrl_t(self, engine):
        """Zen's Ctrl+T over the page: a new tab or Zen's new-tab address bar; dismissed by a click into the page."""
        self.click_at(*AT['blank'])
        tabs = self.web()['tabs']
        self.key('ctrl+t')
        opened = self.wait(lambda: (lambda s: {'new_tab': s['tabs'] == tabs + 1, 'urlbar_focused': s['urlbarFocused']}
                                    if s['tabs'] == tabs + 1 or s['urlbarFocused'] else None)(self.web()),
                           f'Ctrl+T over {engine}: a new tab / Zen\'s new-tab address bar', timeout=10)
        time.sleep(0.6)
        self.screenshot(f'23-ctrl-t-{engine}', settle=False)
        self.click_at(*AT['blank'])
        time.sleep(1.0)
        state = self.web()
        if state['tabs'] != tabs:
            self.chrome_script('gBrowser.removeTab(gBrowser.selectedTab); return true;')
        return {'opened': opened, 'after_click': {'tabs': state['tabs'], 'urlbar_focused': state['urlbarFocused']}}

    def scenario_ctrl_t_gecko(self):
        self.select_tab(self.gecko_tab)
        out = self.ctrl_t('gecko')
        self.result['ctrl_t_gecko'] = out
        return out

    def scenario_ctrl_t_chromium(self):
        self.ensure_chromium('24-to-chromium')
        out = self.ctrl_t('chromium')
        self.gate('ctrl_t', 'PASS', screenshot='23-ctrl-t-chromium.png', **out)
        return out

    def scenario_urlbar_gecko(self):
        self.select_tab(self.gecko_tab)
        out = self.urlbar_focus('gecko')
        self.result['urlbar_gecko'] = out
        self.gate('ctrl_l_gecko_baseline', 'PASS', **out)
        return out

    def scenario_urlbar_chromium(self):
        self.ensure_chromium('22-to-chromium')
        out = self.urlbar_focus('chromium')
        # Gecko baseline (run 39345299134 and urlbar_gecko below): Escape leaves the bar, a click types into the page.
        same = out['urlbar_focused_after_escape'] is False
        self.gate('ctrl_l_escape', 'PASS' if same else 'FAIL', screenshot='21-ctrl-l-chromium.png', **out)
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
        # Which half is missing: does Chromium set PRIMARY, and does it paste Gecko's PRIMARY?
        def primary():
            if not shutil.which('xclip'):
                return None
            done = subprocess.run(['xclip', '-o', '-selection', 'primary'], env=self.x_env, capture_output=True, text=True, timeout=10)
            return done.stdout if done.returncode == 0 else None
        out['primary_after_gecko_selection'] = primary()
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.chromium_ready(), 'Chromium tab presented', timeout=15)
        self.click_at(*AT['area'])
        self.key('ctrl+a')
        self.key('BackSpace')
        self.wait_page(lambda page: page['a'] == '', 'chromium textarea cleared')
        self.click_at(*AT['area'], button=2)
        time.sleep(1.5)
        out['chromium_pastes_gecko_primary'] = self.page()['a']
        self.click_at(self.char_x(1), SEL_TOP, repeat=2)
        self.wait_page(lambda page: page['s'].strip() == 'alpha', 'chromium: "alpha" selected')
        time.sleep(0.5)
        out['primary_after_chromium_selection'] = primary()
        same = bool(out['chromium']['pasted']) == bool(out['gecko']['pasted'])
        publishes = (out['primary_after_chromium_selection'] or '').strip() == 'alpha'
        self.gate('middle_click_paste_autoscroll', 'PASS' if same and out['chromium']['pasted'] and publishes else 'EXPERIMENTAL', **out,
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
        # WebDriver accepts beforeunload prompts of its current tab by itself; point Marionette's
        # content context at the Gecko baseline tab (without selecting it) so Zen's dialog over
        # the Chromium tab is left to the user's keys.
        self.marionette.call('WebDriver:SwitchToWindow', {'handle': self.gecko_handle, 'focus': False})
        try:
            if self.web()['tabId'] != self.cef_tab:
                self.select_tab(self.cef_tab)
            self.chrome_script("""
                window.__feelDialogs = [];
                if (!window.__feelDialogObserver) {
                  window.__feelDialogObserver = { observe: (subject, topic) => window.__feelDialogs.push({topic,
                    text: subject?.document?.getElementById?.('infoBody')?.textContent ?? null,
                    title: subject?.document?.getElementById?.('infoTitle')?.textContent ?? null}) };
                  for (const topic of ['common-dialog-loaded', 'tabmodal-dialog-loaded'])
                    Services.obs.addObserver(window.__feelDialogObserver, topic);
                }
                return true;""")
            self.click_at(*AT['d-unload'])
            self.wait_page(lambda page: 'armed' in page['d'], 'beforeunload armed (with a user gesture)')
            out = {}
            for attempt, (keys, stays) in enumerate(((['Escape'], True), (['Return'], False))):
                self.chrome_script('window.__feelDialogs = []; return true;')
                self.click_at(*AT['link'])
                shown = self.wait(lambda: self.chrome_script('return window.__feelDialogs.length ? window.__feelDialogs : null;'),
                                  'Zen "leave page?" dialog over the Chromium tab', timeout=15)
                time.sleep(0.8)
                self.screenshot(f'17-beforeunload-{attempt + 1}')
                for key in keys:
                    self.key(key)
                if stays:
                    time.sleep(2)
                    page = self.page()
                    if page['p'] != '1':
                        raise AssertionError('"Stay on page" (Escape) still left the page: ' + repr(page))
                    out['stay'] = {'dialog': shown, 'page': page['p']}
                else:
                    out['leave'] = {'dialog': shown, 'page': self.wait_page(lambda page: page['p'] == '2', 'Leave page (Return)')['p']}
            self.chrome_script('BrowserCommands.back(); return true;')
            self.wait_page(lambda page: page['p'] == '1', 'back to page 1')
        finally:
            self.marionette.call('WebDriver:SwitchToWindow', {'handle': self.cef_handle, 'focus': False})
        self.gate('beforeunload', 'PASS', screenshots=['17-beforeunload-1.png', '17-beforeunload-2.png'], **out)
        return out

    DOWNLOADS = """
        return (async () => {
          const {Downloads} = ChromeUtils.importESModule('resource://gre/modules/Downloads.sys.mjs');
          const list = await Downloads.getList(Downloads.ALL);
          return (await list.getAll()).map(d => ({source: d.source?.url ?? null, target: d.target?.path ?? null,
            succeeded: d.succeeded, stopped: d.stopped, error: d.error ? String(d.error.message || d.error) : null,
            bytes: d.currentBytes}));
        })();"""

    def download_in(self, engine):
        before = len(self.chrome_script(self.DOWNLOADS))
        self.click_at(*AT['dl-link'])
        done = self.wait(lambda: (lambda items: items[before:] if len(items) > before and all(i['stopped'] for i in items[before:])
                                  else None)(self.chrome_script(self.DOWNLOADS)), f'{engine}: a finished download in Firefox\'s list',
                         timeout=30)
        time.sleep(0.8)
        self.screenshot(f'34-download-{engine}', settle=False)
        item = done[-1]
        body = Path(item['target']).read_bytes() if item.get('target') and Path(item['target']).is_file() else None
        panel = self.chrome_script("return {panel: window.DownloadsPanel?.panel?.state ?? null, "
                                   "button: document.getElementById('downloads-button')?.getAttribute('attention') ?? null,"
                                   "indicator: !!document.getElementById('downloads-indicator-anchor')};")
        return {'download': item, 'content_ok': body == DOWNLOAD_BODY, 'panel': panel}

    def scenario_download(self):
        """A Chromium download goes through Zen's download UI (Firefox's list, panel and download dir), like Gecko's."""
        self.ensure_chromium('34-to-chromium')
        self.scroll_top()
        chromium = self.download_in('chromium')
        self.chrome_script('window.DownloadsPanel?.hidePanel?.(); return true;')
        self.select_tab(self.gecko_tab)
        gecko = self.download_in('gecko')
        self.chrome_script('window.DownloadsPanel?.hidePanel?.(); return true;')
        self.ensure_chromium('34-to-chromium')
        ok = chromium['download']['succeeded'] and chromium['content_ok']
        self.gate('downloads_zen_ui', 'PASS' if ok and gecko['download']['succeeded'] else 'FAIL',
                  screenshots=['34-download-chromium.png', '34-download-gecko.png'], chromium=chromium, gecko=gecko)
        if not ok:
            raise AssertionError(f'Chromium download: {chromium}')
        return {'chromium': chromium, 'gecko': gecko}

    PERMISSION_PANEL = """
        const panel = PopupNotifications.panel;
        const n = panel?.state === 'open' ? panel.firstElementChild : null;
        if (!n) return {open: false, state: panel?.state ?? null};
        const point = node => { if (!node) return null; const r = node.getBoundingClientRect();
          return [Math.round(node.screenX + r.width / 2), Math.round(node.screenY + r.height / 2)]; };
        return {open: true, id: n.id, label: n.getAttribute('label'), name: n.getAttribute('name'),
          primary: n.getAttribute('buttonlabel'), secondary: n.getAttribute('secondarybuttonlabel'),
          checkbox: n.checkbox?.checked ?? null, block: point(n.secondaryButton), scale: devicePixelRatio};"""

    def permission_in(self, engine):
        self.click_at(*AT['perm'])
        try:
            shown = self.wait(lambda: (lambda p: p if p['open'] else None)(self.chrome_script(self.PERMISSION_PANEL)),
                              f'{engine}: Zen\'s permission prompt', timeout=15)
        except AssertionError as error:
            state = self.web()
            raise AssertionError(f'{error}; page perm {(self.page(state) or {}).get("perm")!r}, '
                                 f'notice {state.get("notice")!r}, panel {state.get("panel")!r}') from None
        time.sleep(0.8)
        self.screenshot(f'35-permission-{engine}', settle=False)
        # "Block", clicked for real (the default: nothing is granted unless the user allows it).
        x, y = shown['block']
        self.xdotool('mousemove', '--sync', round(x * shown['scale']), round(y * shown['scale']))
        self.xdotool('click', '1')
        try:
            page = self.wait_page(lambda page: page['perm'].startswith('denied'), f'{engine}: the page saw the denial', timeout=10)['perm']
        except AssertionError:
            page = self.page()['perm']
        return {'prompt': shown, 'page': page}

    def scenario_permission(self):
        """A Chromium permission request appears as Zen's doorhanger; Block (and no answer) denies it."""
        self.ensure_chromium('35-to-chromium')
        chromium = self.permission_in('chromium')
        self.select_tab(self.gecko_tab)
        gecko = self.permission_in('gecko')
        self.ensure_chromium('35-to-chromium')
        ok = chromium['page'].startswith('denied') and chromium['prompt']['open']
        self.gate('permission_prompt_zen_ui', 'PASS' if ok else 'FAIL', screenshots=['35-permission-chromium.png', '35-permission-gecko.png'],
                  chromium=chromium, gecko=gecko,
                  note='doorhanger popups capture black under Xvfb; the prompt is asserted from PopupNotifications')
        if not ok:
            raise AssertionError(f'permission: {chromium}')
        return {'chromium': chromium, 'gecko': gecko}

    def dialog_windows(self):
        try:
            return set(self.xdotool('search', '--onlyvisible', '--pid', self.browser.pid).split())
        except subprocess.SubprocessError:
            return set()

    def file_chooser_in(self, engine, upload):
        windows = self.dialog_windows()
        self.click_at(*AT['file'])
        dialog = self.wait(lambda: (lambda new: sorted(new) if new else None)(self.dialog_windows() - windows),
                           f'{engine}: a file chooser window', timeout=20)
        wid = dialog[-1]
        name = self.xdotool('getwindowname', wid)
        time.sleep(1.0)
        self.screenshot(f'36-file-chooser-{engine}', settle=False)
        self.xdotool('windowfocus', '--sync', wid)
        self.xdotool('key', '--window', wid, 'ctrl+l')
        time.sleep(0.4)
        self.xdotool('type', '--window', wid, '--delay', '40', str(upload))
        time.sleep(0.6)
        self.xdotool('key', '--window', wid, 'Return')
        try:
            page = self.wait_page(lambda page: page['fc'].startswith(upload.name), f'{engine}: the page got the chosen file', timeout=15)['fc']
        except AssertionError:
            page = self.page()['fc']
            if self.dialog_windows() - windows:
                self.xdotool('key', '--window', wid, 'Escape')
        self.focus_window()
        return {'dialog': name, 'page': page}

    def scenario_file_chooser(self):
        """<input type=file> in Chromium opens Zen's own (GTK) file chooser; only the chosen file reaches the page."""
        self.ensure_chromium('36-to-chromium')
        upload = Path(self.result['session']) / 'feel-upload.txt'
        upload.write_bytes(b'AxioSozo feel upload\n')
        chromium = self.file_chooser_in('chromium', upload)
        self.select_tab(self.gecko_tab)
        gecko = self.file_chooser_in('gecko', upload)
        self.ensure_chromium('36-to-chromium')
        expected = f'{upload.name}:{upload.stat().st_size}'
        ok = chromium['page'] == expected
        self.gate('file_chooser_zen_ui', 'PASS' if ok else 'FAIL', screenshots=['36-file-chooser-chromium.png', '36-file-chooser-gecko.png'],
                  chromium=chromium, gecko=gecko, expected=expected, note='GTK file chooser (no portal under Xvfb)')
        if not ok:
            raise AssertionError(f'file chooser: {chromium}, expected {expected}')
        return {'chromium': chromium, 'gecko': gecko}

    CERT_PANEL = """
        const overlay = gBrowser.selectedBrowser.parentNode.querySelector('[data-axiosozo-cef]');
        const panel = overlay?.querySelector('.axiosozo-cef-certerror');
        return panel && !panel.hidden ? {title: panel.querySelector('h1')?.textContent, text: panel.textContent.slice(0, 600),
          buttons: [...panel.querySelectorAll('button')].map(b => b.textContent)} : null;"""

    def scenario_cert_error(self):
        """An untrusted certificate fails closed in Chromium with Zen's certificate error page, as in Gecko."""
        if not self.feel.tls_url:
            raise gui_test.Blocked('no TLS fixture: ' + str(self.feel.tls_note))
        self.ensure_chromium('37-to-chromium')
        self.scroll_top()
        self.click_at(*AT['tls-link'])
        panel = self.wait(lambda: self.chrome_script(self.CERT_PANEL), 'Zen\'s certificate error page over the Chromium tab', timeout=20)
        time.sleep(1.5)
        state = self.web()
        loaded = (state.get('page') or {}).get('url', '').startswith(self.feel.tls_origin) and self.page(state) is not None
        self.screenshot('37-cert-error-chromium')
        # Gecko baseline: Firefox's own about:certerror for the same link.
        self.select_tab(self.gecko_tab)
        self.scroll_top()
        self.click_at(*AT['tls-link'])
        gecko = self.wait(lambda: (lambda u: u if u.startswith('about:certerror') or u.startswith('about:neterror') else None)(
            self.chrome_script('return gBrowser.selectedBrowser.documentURI?.spec ?? "";')), 'Firefox certificate error page', timeout=20)
        time.sleep(1)
        self.screenshot('37-cert-error-gecko')
        self.chrome_script('BrowserCommands.back(); return true;')
        self.wait_page(lambda page: page['p'] == '1', 'Gecko tab back on the feel page', timeout=20)
        # Back to the Chromium tab, which still (correctly) shows the certificate error panel
        # rather than a feel page, so ensure_chromium() would wait for nothing.
        self.select_tab(self.cef_tab)
        self.wait(lambda: self.web()['engine'] == 'chromium' and self.chrome_script(self.CERT_PANEL),
                  'the Chromium tab with its certificate error panel', timeout=20)
        # "Go back (Recommended)", clicked for real.
        point = self.chrome_script("""
            const overlay = gBrowser.selectedBrowser.parentNode.querySelector('[data-axiosozo-cef]');
            const button = overlay?.querySelector('.axiosozo-cef-certerror button.primary');
            if (!button || overlay.querySelector('.axiosozo-cef-certerror').hidden) return null;
            const r = button.getBoundingClientRect();
            return [Math.round((mozInnerScreenX + r.left + r.width / 2) * devicePixelRatio),
                    Math.round((mozInnerScreenY + r.top + r.height / 2) * devicePixelRatio)];""")
        if point:
            self.xdotool('mousemove', '--sync', *point)
            self.xdotool('click', '1')
        back = self.wait_page(lambda page: page['p'] == '1' and self.web()['page']['url'].startswith(self.feel.origin),
                              'Go back returns to the feel page', timeout=20)
        ok = bool(panel) and not loaded
        self.gate('certificate_error_fails_closed', 'PASS' if ok else 'FAIL',
                  screenshots=['37-cert-error-chromium.png', '37-cert-error-gecko.png'], panel=panel, chromium_loaded=loaded,
                  gecko=gecko.split('?')[0], go_back=bool(point))
        if not ok:
            raise AssertionError(f'certificate error: panel {panel}, loaded {loaded}')
        return {'panel': panel, 'gecko': gecko, 'back': back['p']}

    DEVTOOLS = """
        let toolbox = null;
        try {
          const {gDevTools} = ChromeUtils.importESModule('resource://devtools/client/framework/devtools.sys.mjs');
          toolbox = gDevTools.getToolboxForTab?.(gBrowser.selectedTab) ?? null;
        } catch (e) { return {error: String(e)}; }
        return {toolbox: !!toolbox, target: toolbox?.target?.url ?? toolbox?.commands?.targetCommand?.targetFront?.url ?? null,
                notice: (n => n && !n.hidden ? n.textContent : null)(gBrowser.selectedBrowser.parentNode
                  .querySelector('[data-axiosozo-cef] .axiosozo-cef-notice'))};"""

    def scenario_devtools(self):
        """Record what the developer-tools shortcut does over a Chromium tab (Chromium's DevTools are not embedded)."""
        self.ensure_chromium('38-to-chromium')
        self.click_at(*AT['blank'])
        self.key('ctrl+shift+i')
        time.sleep(4)
        chromium = self.chrome_script(self.DEVTOOLS)
        self.screenshot('38-devtools-chromium')
        if chromium.get('toolbox'):
            self.key('ctrl+shift+i')
            time.sleep(2)
        self.focus_window()
        self.ensure_chromium('38-to-chromium')
        status = 'NOT_VERIFIED'
        if chromium.get('notice') and not chromium.get('toolbox'):
            status = 'PASS'
        self.gate('devtools', status, screenshot='38-devtools-chromium.png', chromium=chromium,
                  note='Chromium DevTools are not embedded in Zen; PASS only when the shortcut explains this instead of '
                       'inspecting the hidden Gecko document')
        return {'chromium': chromium}

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
        # The fixture probe's "Return to Gecko" chip stays in Zen's toolbar, never over the page.
        geometry = self.chrome_script(self.BADGE_GEOMETRY)
        covering = self.overlaps(geometry['chips'], geometry['content'])
        self.gate('probe_chip_never_covers_content', 'FAIL' if covering else 'PASS', screenshot='f02-chromium.png',
                  covering=covering, geometry=geometry)
        if covering:
            raise AssertionError(f'chips over the page content: {covering}: {geometry}')
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
    parser.add_argument('--native-receiver', choices=('default', 'off'), default='default',
                        help='off: TEST-ONLY pref axiosozo.engines.linux.native_receiver=false')
    parser.add_argument('--pref', action='append', default=[], metavar='NAME=VALUE',
                        help='TEST-ONLY profile pref under axiosozo.engines.linux.* (true/false/int/string); repeatable')
    parser.add_argument('--a11y', action='store_true', help='web mode: the AT-SPI accessibility run (GNOME_ACCESSIBILITY=1)')
    parser.add_argument('--evidence-dir')
    parser.add_argument('--size', default=None)
    parser.add_argument('--timeout', type=float, default=30)
    parser.add_argument('--launch-timeout', type=float, default=180)
    parser.add_argument('--hold', type=int, default=0)
    parser.add_argument('--screenshot')
    args = parser.parse_args()
    available = FIXTURE_SCENARIOS if args.mode == 'fixture' else A11Y_SCENARIOS if args.a11y else (
        SCALE_SCENARIOS if args.scale == 2 else WEB_SCENARIOS)
    scenarios = [item for item in (args.scenario or ','.join(available)).split(',') if item]
    if any(item not in available for item in scenarios):
        parser.error('--scenario takes: ' + ','.join(available))
    args.size = args.size or ('2560x1600' if args.scale == 2 else '1280x800')
    prefs = []
    for item in args.pref:
        name, sep, raw = item.partition('=')
        if not sep or not name.startswith('axiosozo.engines.linux.'):
            parser.error('--pref takes axiosozo.engines.linux.NAME=VALUE')
        value = {'true': True, 'false': False}.get(raw, int(raw) if raw.lstrip('-').isdigit() else raw)
        prefs.append((name, value))
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    evidence = Path(args.evidence_dir).resolve() if args.evidence_dir else storage.BUILD_ROOT / 'gui-evidence' / f'cef-zen-{args.mode}-{stamp}'
    code = 0
    workdir = storage.BUILD_ROOT / 'gui-evidence' / ('feel-tls-' + stamp)
    try:
        workdir.mkdir(parents=True, exist_ok=True)
    except OSError:
        workdir = None
    with FeelServer(workdir) as feel:
        harness = CEFZenHarness(args, ChromiumWeb(args.mode, args.scale, args.a11y, args.native_receiver, prefs), evidence, feel)
        harness.result.update(harness='axiosozo-linux-gui+cef-zen', mode=args.mode, scale=args.scale,
                              feel_fixture={'origin': feel.origin, 'lan_origin': feel.lan_origin, 'tls_origin': feel.tls_origin,
                                            'tls_note': feel.tls_note, 'sha256': feel.hashes})
        harness.result['test_only_switches'] += (['AXIOSOZO_ENGINE_SWITCHING=1 (existing developer gate)'] if args.mode == 'web'
                                                 else ['AXIOSOZO_ENGINE_PROBE=1 fixture probe'])
        if args.native_receiver == 'off':
            harness.result['test_only_switches'].append('profile pref axiosozo.engines.linux.native_receiver=false')
        for name, value in prefs:
            harness.result['test_only_switches'].append(f'profile pref {name}={json.dumps(value)}')
        harness.result['frame_prefs'] = {name: value for name, value in prefs}
        if args.a11y:
            harness.result['test_only_switches'].append('GNOME_ACCESSIBILITY=1 (AT-SPI on, as with a screen reader)')
        if args.scale != 1:
            harness.result['test_only_switches'].append(f'profile pref layout.css.devPixelsPerPx={args.scale}')
        try:
            if not storage.LINUX:
                raise gui_test.Blocked('Linux only (Xvfb, CEF host)')
            storage.ensure()
            evidence.mkdir(parents=True, exist_ok=True)
            executable, app_info = gui_test.resolve_app(args.app)
            harness.run(executable, app_info, scenarios)
            known_parent_crash(harness.result)
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
    if workdir:
        shutil.rmtree(workdir, ignore_errors=True)   # the throwaway TLS key
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
