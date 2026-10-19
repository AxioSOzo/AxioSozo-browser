#!/usr/bin/env python3
"""Linux GUI test harness: the AxioSozo (Zen/Gecko) app under Xvfb.

    ./dev gui-test [--engine gecko] [--scenario all|launch,chrome,about,fixture,input]
                   [--screenshot out.png] [--app auto|local|fetched|PATH]

Starts a private Xvfb display, a private D-Bus session bus (when available),
the owned loopback fixture server and the app with a fresh owned development
profile, all inside one OwnedSession (process groups are stopped afterwards).
Assertions use the app's own Marionette server in chrome context plus X11
facts (xdotool, xwininfo); screenshots are X root-window captures (xwd).

Test-only switches, never used by product launches (`./dev run`): the harness
passes `-marionette --remote-allow-system-access` to this one process, with
Marionette bound to a random loopback port of a throwaway profile. TLS,
origin isolation and the content/GPU sandboxes are left exactly as built.

Exit codes: 0 every selected scenario PASS; 1 a scenario FAIL; 2 BLOCKED_ENV
(missing display tools, app or engine). Results are JSON (stdout and
<evidence-dir>/result.json). Engines are plug-ins in scripts/gui_engines/.
"""
import argparse
import base64
import datetime
import hashlib
import json
import os
from pathlib import Path
import platform
import secrets
import shutil
import socket
import struct
import subprocess
import sys
import time
import zlib

import storage
from fixtures import FixtureServer
from session import OwnedSession, private_directory
import gui_engines
from gui_engines import EngineUnavailable

ROOT = Path(__file__).resolve().parents[1]
PROJECT_ID = hashlib.sha256(str(ROOT).encode()).hexdigest()[:16]
SESSION_ROOT = storage.BUILD_ROOT / 'runtime' / PROJECT_ID
FETCHED = storage.BUILD_ROOT / 'linux-app' / 'current.json'
SCENARIOS = ('launch', 'chrome', 'about', 'fixture', 'input')
APP_NAME = 'axiosozo-dev'
# Throwaway test profile only: quiet first-run UI and enable Marionette on a
# random loopback port. No security, TLS, sandbox or isolation preference.
TEST_PREFS = {
    'marionette.port': 0,
    'browser.shell.checkDefaultBrowser': False,
    'browser.startup.homepage_override.mstone': 'ignore',
    'startup.homepage_welcome_url': '',
    'browser.aboutwelcome.enabled': False,
    'zen.welcome-screen.seen': True,
    'zen.updates.show-update-notification': False,
    'datareporting.policy.dataSubmissionEnabled': False,
    'toolkit.telemetry.reportingpolicy.firstRun': False,
    'browser.tabs.warnOnClose': False,
    'browser.sessionstore.resume_from_crash': False,
    'network.captive-portal-service.enabled': False,
}
CHROME_STATE = """
const owner = window.AxioSozo;
let surface = false;
try { surface = !!Cc["@axiosozo.nl/engine-surface-service;1"]; } catch {}
return {title: document.title, windowtype: document.documentElement.getAttribute("windowtype"),
        axiosozo: !!owner && typeof owner === "object", version: owner?.version ?? null,
        engineAdapter: owner?.engine?.constructor?.name ?? null,
        toolsEntry: !!document.getElementById("axiosozo-tools-home"),
        spaceSwitcher: !!document.getElementById("axiosozo-space-switcher"),
        zenWorkspaces: !!window.gZenWorkspaces, tabs: gBrowser.tabs.length,
        foundationPref: Services.prefs.getBoolPref("axiosozo.foundation.enabled", false),
        engineSurfaceService: surface,
        appName: Services.appinfo.name, appVersion: Services.appinfo.version,
        platformVersion: Services.appinfo.platformVersion, os: Services.appinfo.OS,
        widget: Services.appinfo.widgetToolkit,
        contentSandboxLevel: Services.prefs.getIntPref("security.sandbox.content.level", -1),
        compositor: (() => { try { return window.windowUtils.layerManagerType; } catch (e) { return String(e); } })(),
        webrenderNativeCompositorPref: Services.prefs.getBoolPref("gfx.webrender.compositor", false),
        gfx: (() => {
          const info = {};
          try {
            const gfx = Cc["@mozilla.org/gfx/info;1"].getService(Ci.nsIGfxInfo);
            for (const key of ["adapterDescription", "adapterVendorID", "adapterDriver", "adapterDriverVersion",
                               "windowProtocol", "desktopEnvironment"]) {
              try { info[key] = gfx[key]; } catch {}
            }
          } catch (e) { info.error = String(e); }
          return info;
        })()};
"""


class Blocked(RuntimeError):
    """The environment cannot run this harness or scenario (BLOCKED_ENV)."""


class MarionetteError(RuntimeError):
    pass


class Marionette:
    """Minimal Marionette (protocol 3) client: `<length>:<json>` frames."""

    def __init__(self, port, timeout):
        self.socket = socket.create_connection(('127.0.0.1', port), timeout=timeout)
        self.buffer = b''
        self.sequence = 0
        self.hello = self._read()

    def _receive(self):
        data = self.socket.recv(1 << 16)
        if not data:
            raise ConnectionError('Marionette closed the connection')
        return data

    def _read(self):
        while b':' not in self.buffer:
            self.buffer += self._receive()
        length, _, rest = self.buffer.partition(b':')
        size = int(length)
        while len(rest) < size:
            rest += self._receive()
        self.buffer = rest[size:]
        return json.loads(rest[:size])

    def call(self, name, params=None):
        self.sequence += 1
        payload = json.dumps([0, self.sequence, name, params or {}]).encode()
        self.socket.sendall(str(len(payload)).encode() + b':' + payload)
        while True:
            message = self._read()
            if message[0] == 1 and message[1] == self.sequence:
                if message[2]:
                    raise MarionetteError(f"{name}: {message[2].get('error')}: {message[2].get('message')}")
                return message[3]

    def close(self):
        try:
            self.socket.close()
        except OSError:
            pass


def xwd_to_png(data):
    """Convert an X Window Dump (ZPixmap, TrueColor, 24/32 bpp) to PNG bytes."""
    fields = struct.unpack('>25I', data[:100])
    header_size, _version, pixmap_format, _depth, width, height = fields[:6]
    byte_order, bits_per_pixel, bytes_per_line, visual_class = fields[7], fields[11], fields[12], fields[13]
    masks, colors = fields[14:17], fields[19]
    if pixmap_format != 2 or visual_class not in (4, 5) or bits_per_pixel not in (24, 32):
        raise RuntimeError(f'UNSUPPORTED_XWD format={pixmap_format} class={visual_class} bpp={bits_per_pixel}')
    offset = header_size + colors * 12
    step = bits_per_pixel // 8
    endian = '<' if byte_order == 0 else '>'
    shifts = [(mask & -mask).bit_length() - 1 for mask in masks]
    rows = bytearray()
    for y in range(height):
        line = data[offset + y * bytes_per_line: offset + y * bytes_per_line + width * step]
        rows.append(0)
        if step == 4 and masks == (0xff0000, 0xff00, 0xff):
            # Fast path: B,G,R,X (LSB) or X,R,G,B (MSB) per pixel.
            rgb = bytearray(width * 3)
            order = (2, 1, 0) if byte_order == 0 else (1, 2, 3)
            for channel, source in enumerate(order):
                rgb[channel::3] = line[source::4]
            rows += rgb
            continue
        for x in range(width):
            raw = line[x * step:(x + 1) * step]
            pixel = int.from_bytes(raw, 'little' if endian == '<' else 'big')
            rows += bytes(((pixel & mask) >> shift) & 0xff for mask, shift in zip(masks, shifts))

    def chunk(kind, body):
        return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body) & 0xffffffff)
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(bytes(rows), 9)) + chunk(b'IEND', b''))


def which(name):
    return shutil.which(name, path=os.environ.get('PATH', '') + ':/usr/bin:/bin')


def resolve_app(spec):
    """(executable, description) for --app auto|local|fetched|PATH."""
    import zen  # the Zen adapter owns build identity; imported lazily (heavy)
    tried = []
    if spec in ('auto', 'local'):
        described = zen.describe()
        if described.get('status') == 'PASS':
            return Path(described['executable']), {'source': 'local-build', 'fingerprint': described['fingerprint'],
                                                    'fingerprint_matches_checkout': True}
        tried.append('local build: ' + described.get('reason', described.get('status', 'unavailable')))
    if spec in ('auto', 'fetched'):
        if FETCHED.is_file():
            current = json.loads(FETCHED.read_text())
            directory = Path(current['directory'])
            executable = zen.validate_linux_application(directory)
            info = current.get('build_info', {})
            return executable, {'source': 'fetched-artifact', 'run_id': current.get('run_id'),
                                'repository_commit': info.get('repository_commit'),
                                'fingerprint': info.get('fingerprint'),
                                'fingerprint_matches_checkout': info.get('fingerprint') == zen.fingerprint()}
        tried.append('fetched build: none (./dev fetch-build)')
    if spec not in ('auto', 'local', 'fetched'):
        path = Path(spec).resolve()
        directory = path if path.is_dir() else path.parent
        # Accept the unpacked archive's parent too (it contains axiosozo-dev/axiosozo-dev).
        if not (directory / APP_NAME).is_file() and (directory / APP_NAME / APP_NAME).is_file():
            directory = directory / APP_NAME
        executable = zen.validate_linux_application(directory)
        return executable, {'source': 'path', 'path': str(directory)}
    raise Blocked('NO_APP: ' + '; '.join(tried) + '. Build with ./dev setup --only zen or fetch with ./dev fetch-build')


class Harness:
    def __init__(self, args, engine, evidence):
        self.args = args
        self.engine = engine
        self.evidence = evidence
        self.timeout = args.timeout
        self.result = {'harness': 'axiosozo-linux-gui', 'version': 1, 'engine': engine.name,
                       'started_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
                       'host': {'platform': platform.platform(), 'machine': platform.machine(), 'cpus': os.cpu_count()},
                       'test_only_switches': ['-marionette', '--remote-allow-system-access', 'loopback Marionette port',
                                              'throwaway owned profile'],
                       'scenarios': {}, 'screenshots': []}
        self.marionette = None
        self.context = None
        self.window = None
        self.x_env = None
        self.browser = None
        self.fixture = None

    # -- utilities -----------------------------------------------------------------
    def wait(self, probe, description, timeout=None):
        deadline = time.monotonic() + (timeout or self.timeout)
        last = None
        while time.monotonic() < deadline:
            try:
                value = probe()
                if value:
                    return value
            except (MarionetteError, subprocess.SubprocessError, OSError) as error:
                last = error
            if self.browser is not None and self.browser.poll() is not None:
                raise AssertionError(f'browser exited ({self.browser.returncode}) while waiting for {description}')
            time.sleep(0.25)
        raise AssertionError(f'timed out waiting for {description}' + (f' (last error: {last})' if last else ''))

    def set_context(self, context):
        if self.context != context:
            self.marionette.call('Marionette:SetContext', {'value': context})
            self.context = context

    def chrome_script(self, script, args=()):
        self.set_context('chrome')
        return self.marionette.call('WebDriver:ExecuteScript', {'script': script, 'args': list(args)})['value']

    def content_script(self, script, args=()):
        self.set_context('content')
        return self.marionette.call('WebDriver:ExecuteScript', {'script': script, 'args': list(args)})['value']

    def open_tab(self, url):
        """A new selected tab of the main window, navigated to url."""
        self.set_context('content')
        handle = self.marionette.call('WebDriver:NewWindow', {'type': 'tab', 'focus': True})['handle']
        self.marionette.call('WebDriver:SwitchToWindow', {'handle': handle, 'focus': True})
        try:
            self.marionette.call('WebDriver:Navigate', {'url': url})
        except MarionetteError as error:
            # Privileged about: pages may refuse WebDriver navigation; load them
            # as the browser UI would, with the system principal.
            self.chrome_script('gBrowser.selectedBrowser.fixupAndLoadURIString(arguments[0], '
                               '{triggeringPrincipal: Services.scriptSecurityManager.getSystemPrincipal()}); return true;',
                               [url])
            self.result.setdefault('notes', []).append(f'navigate fallback for {url}: {error}')
        return handle

    def xdotool(self, *args):
        result = subprocess.run(['xdotool', *map(str, args)], env=self.x_env, capture_output=True, text=True, timeout=30)
        if result.returncode:
            raise subprocess.SubprocessError(f'xdotool {" ".join(map(str, args))}: {result.stderr.strip()}')
        return result.stdout.strip()

    def window_title(self):
        return self.xdotool('getwindowname', self.window)

    def settle(self):
        """Let the selected page and the chrome paint before a capture: two
        animation frames in content (when reachable) and in chrome, then a short
        pause for the compositor to present them to X."""
        frames = 'return new Promise(done => requestAnimationFrame(() => requestAnimationFrame(() => done(true))));'
        for run in (self.content_script, self.chrome_script):
            try:
                run(frames)
            except (MarionetteError, OSError):
                pass
        time.sleep(0.5)

    def screenshot(self, name, settle=True):
        if settle and self.marionette and self.browser is not None and self.browser.poll() is None:
            self.settle()
        path = self.evidence / f'{name}.png'
        dump = subprocess.run(['xwd', '-root', '-silent'], env=self.x_env, capture_output=True, timeout=60)
        if dump.returncode:
            raise RuntimeError('xwd failed: ' + dump.stderr.decode(errors='replace'))
        path.write_bytes(xwd_to_png(dump.stdout))
        self.result['screenshots'].append(str(path))
        return path

    # -- display and app ------------------------------------------------------------
    def start_display(self, session):
        for tool in ('Xvfb', 'xdotool', 'xwininfo', 'xwd'):
            if not which(tool):
                raise Blocked(f'{tool} missing; install the GUI packages in docs/LINUX.md')
        width, height = self.args.size.split('x')
        auth = session.path / 'Xauthority'
        for number in range(90, 190):
            if not Path(f'/tmp/.X11-unix/X{number}').exists() and not Path(f'/tmp/.X{number}-lock').exists():
                break
        else:
            raise Blocked('no free X display number in :90-:189')
        display = f':{number}'
        command = ['Xvfb', display, '-screen', '0', f'{width}x{height}x24', '-nolisten', 'tcp', '-noreset']
        if which('xauth'):
            subprocess.run(['xauth', '-f', str(auth), 'add', display, '.', secrets.token_hex(16)], check=True,
                           capture_output=True, timeout=10)
            command += ['-auth', str(auth)]
        log = (self.evidence / 'xvfb.log').open('w')
        session.spawn(command, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL)
        self.x_env = {**os.environ, 'DISPLAY': display}
        if auth.exists():
            self.x_env['XAUTHORITY'] = str(auth)
        self.x_env.pop('WAYLAND_DISPLAY', None)
        self.wait(lambda: subprocess.run(['xdotool', 'getdisplaygeometry'], env=self.x_env,
                                         capture_output=True, timeout=10).returncode == 0,
                  'Xvfb ' + display, timeout=30)
        self.result['display'] = {'server': 'Xvfb', 'display': display, 'size': self.args.size,
                                  'xauth': auth.exists(), 'geometry': self.xdotool('getdisplaygeometry')}

    def start_bus(self, session):
        """A private D-Bus session bus for the app, or `disabled:` (never the user's bus)."""
        if not which('dbus-daemon'):
            self.result['dbus'] = 'disabled (dbus-daemon missing)'
            return 'disabled:'
        bus = session.spawn(['dbus-daemon', '--session', '--nofork', '--nopidfile', '--print-address=1'],
                            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, stdin=subprocess.DEVNULL, text=True)
        address = bus.stdout.readline().strip()
        if not address:
            self.result['dbus'] = 'disabled (private bus did not start)'
            return 'disabled:'
        self.result['dbus'] = 'private session bus'
        return address

    def launch(self, session, executable, profile):
        prefs = ''.join(f'user_pref({json.dumps(name)}, {json.dumps(value)});\n' for name, value in TEST_PREFS.items())
        (profile / 'user.js').write_text(prefs)
        env = {**self.x_env, 'MOZ_ENABLE_WAYLAND': '0', 'MOZ_CRASHREPORTER_DISABLE': '1',
               'DBUS_SESSION_BUS_ADDRESS': self.start_bus(session), 'AXIOSOZO_GUI_TEST': '1',
               'AXIOSOZO_BUILD_ROOT': str(storage.BUILD_ROOT)}
        env.update(self.engine.browser_environment(self))
        command = [str(executable), '-no-remote', '-profile', str(profile), '-marionette',
                   '--remote-allow-system-access', 'about:blank']
        self.result['command'] = command
        stdout = (self.evidence / 'browser-stdout.log').open('w')
        stderr = (self.evidence / 'browser-stderr.log').open('w')
        started = time.monotonic()
        self.browser = session.spawn(command, env=env, stdout=stdout, stderr=stderr, stdin=subprocess.DEVNULL,
                                     cwd=str(executable.parent))
        port_file = profile / 'MarionetteActivePort'
        port = self.wait(lambda: port_file.is_file() and port_file.read_text().strip().isdigit()
                         and int(port_file.read_text().strip()), 'Marionette port file', timeout=self.args.launch_timeout)
        self.marionette = self.wait(lambda: Marionette(port, self.timeout), 'Marionette connection', timeout=30)
        session_info = self.marionette.call('WebDriver:NewSession', {'strictFileInteractability': True})
        self.marionette.call('WebDriver:SetTimeouts', {'script': int(self.timeout * 1000), 'pageLoad': int(self.timeout * 1000)})
        self.result['browser'] = {'pid': self.browser.pid, 'marionette_port': port,
                                  'capabilities': {key: session_info.get('capabilities', {}).get(key) for key in
                                                   ('browserName', 'browserVersion', 'platformName')},
                                  'seconds_to_marionette': round(time.monotonic() - started, 2)}

    def find_window(self):
        def probe():
            ids = self.xdotool('search', '--onlyvisible', '--pid', self.browser.pid).split()
            best = None
            for wid in ids:
                info = subprocess.run(['xwininfo', '-id', wid], env=self.x_env, capture_output=True, text=True, timeout=10).stdout
                fields = dict(line.strip().split(':', 1) for line in info.splitlines() if ':' in line and line.startswith('  '))
                size = int(fields.get('Width', '0')) * int(fields.get('Height', '0'))
                if 'IsViewable' in fields.get('Map State', '') and (best is None or size > best[1]):
                    best = (wid, size, {key: fields.get(key, '').strip() for key in ('Width', 'Height', 'Map State', 'Absolute upper-left X', 'Absolute upper-left Y')})
            return best
        wid, _, info = self.wait(probe, 'a mapped, viewable browser window', timeout=self.args.launch_timeout)
        self.window = wid
        return {'window_id': wid, 'xwininfo': info, 'title': self.window_title()}

    # -- scenarios --------------------------------------------------------------------
    def scenario_launch(self):
        window = self.find_window()
        chrome = self.wait(lambda: (lambda state: state if state['windowtype'] == 'navigator:browser' else None)(
            self.chrome_script(CHROME_STATE)), 'browser window chrome')
        return {'window': window, 'app': {key: chrome[key] for key in ('appName', 'appVersion', 'platformVersion', 'os', 'widget')}}

    def scenario_chrome(self):
        state = self.wait(lambda: (lambda value: value if value['axiosozo'] else None)(self.chrome_script(CHROME_STATE)),
                          'window.AxioSozo (AxioSozo chrome startup)')
        if not state['foundationPref'] or not state['zenWorkspaces']:
            raise AssertionError('Zen/AxioSozo chrome incomplete: ' + repr(state))
        if state['engineAdapter'] != 'GeckoEngineAdapter':
            raise AssertionError('Gecko engine adapter missing: ' + repr(state))
        # Linux has no IOSurface engine-view component: chrome must take the pipe fallback.
        state['engine_view'] = 'surface service present' if state['engineSurfaceService'] else 'absent (AXCF pipe fallback)'
        self.screenshot('chrome')
        return state

    def scenario_about(self):
        handle = self.open_tab('about:axiosozo')
        def loaded():
            tab = self.chrome_script('const b = gBrowser.selectedBrowser; return {title: b.contentTitle, '
                                     'url: b.currentURI.spec, document: b.documentURI?.spec ?? null, remoteType: b.remoteType ?? null};')
            return tab if tab['title'] == 'AxioSozo' and tab['url'].startswith('about:axiosozo') else None
        tab = self.wait(loaded, 'about:axiosozo with title "AxioSozo"')
        if tab['document'] and tab['document'].startswith(('about:neterror', 'about:certerror')):
            raise AssertionError('about:axiosozo shows an error page: ' + repr(tab))
        page = None
        try:
            page = self.wait(lambda: self.content_script(
                "const h = document.querySelector('h1'); const r = h?.getBoundingClientRect();"
                "return h && r.width > 0 ? {h1: h.textContent.trim(), width: Math.round(r.width), height: Math.round(r.height),"
                " views: [...document.querySelectorAll('nav.views a')].map(a => a.textContent.trim())} : null;"),
                'rendered <h1> in about:axiosozo', timeout=15)
        except (AssertionError, MarionetteError) as error:
            self.result.setdefault('notes', []).append(f'about:axiosozo content query unavailable: {error}')
        if page is not None and page['h1'] != 'AxioSozo':
            raise AssertionError('unexpected about:axiosozo heading: ' + repr(page))
        self.screenshot('about-axiosozo')
        return {'window_handle': handle, 'tab': tab, 'rendered': page}

    def scenario_fixture(self):
        shown = self.engine.show(self, self.fixture.url)
        rendered = self.engine.assert_rendered(self, 'AxioSozo fixture')
        self.wait(lambda: 'AxioSozo fixture' in self.window_title(), 'X11 window title showing the fixture')
        self.screenshot('fixture-' + self.engine.name)
        return {'fixture': self.fixture.identity(), 'shown': shown, 'rendered': rendered,
                'x11_window_title': self.window_title()}

    def scenario_input(self):
        if 'fixture' not in self.result['scenarios']:
            self.result['scenarios']['fixture'] = self.run_one('fixture')
        if self.result['scenarios']['fixture']['status'] != 'PASS':
            raise Blocked('input needs a passing fixture scenario')
        self.xdotool('windowraise', self.window)
        self.xdotool('windowfocus', '--sync', self.window)
        self.chrome_script('window.focus(); gBrowser.selectedBrowser.focus(); return true;')
        # 1. Click the page's text field and type: the page mirrors input into its title.
        target = self.element_screen_point('#text')
        self.xdotool('mousemove', '--sync', target[0], target[1])
        self.xdotool('click', '1')
        self.xdotool('type', '--delay', '60', 'axio')
        typed = self.wait(lambda: (lambda title: title if 'input=axio' in title else None)(self.window_title()),
                          'typed text reflected in the X11 window title')
        # 2. Click the Increment button.
        button = self.element_screen_point('#count')
        self.xdotool('mousemove', '--sync', button[0], button[1])
        self.xdotool('click', '1')
        clicked = self.wait(lambda: (lambda title: title if 'count=1' in title else None)(self.window_title()),
                            'button click reflected in the X11 window title')
        # 3. Keyboard navigation through the address bar. Each step is recorded
        # so a crash or hang names the input that preceded it.
        progress = self.result.setdefault('input_progress', ['typed', 'clicked'])
        self.xdotool('key', '--clearmodifiers', 'ctrl+l')
        progress.append('ctrl+l')
        self.xdotool('type', '--delay', '20', self.fixture.url + '?page=2')
        progress.append('typed url')
        time.sleep(0.5)
        if self.browser.poll() is not None:
            raise AssertionError(f'browser exited ({self.browser.returncode}) after typing into the address bar')
        progress.append('alive before Return')
        self.xdotool('key', 'Return')
        progress.append('Return')
        navigated = self.wait(lambda: (lambda title: title if 'page=2' in title else None)(self.engine.content_title(self)),
                              'address-bar navigation to page=2')
        self.screenshot('input-' + self.engine.name)
        return {'typed_title': typed, 'clicked_title': clicked, 'navigated_title': navigated,
                'pointer_targets': {'text': target, 'button': button}}

    def element_screen_point(self, selector):
        """Screen pixel at the centre of a content element (chrome geometry + content rect)."""
        origin = self.chrome_script('const r = gBrowser.selectedBrowser.getBoundingClientRect();'
                                    'return {x: window.mozInnerScreenX + r.left, y: window.mozInnerScreenY + r.top,'
                                    ' scale: window.devicePixelRatio};')
        box = self.content_script('const r = document.querySelector(arguments[0]).getBoundingClientRect();'
                                  'return {x: r.left + r.width / 2, y: r.top + r.height / 2};', [selector])
        return [round((origin['x'] + box['x']) * origin['scale']), round((origin['y'] + box['y']) * origin['scale'])]

    def run_one(self, name):
        started = time.monotonic()
        try:
            details = getattr(self, 'scenario_' + name)()
            outcome = {'status': 'PASS', 'details': details}
        except (Blocked, EngineUnavailable) as error:
            outcome = {'status': 'BLOCKED_ENV', 'reason': str(error)}
        except (AssertionError, MarionetteError, subprocess.SubprocessError, OSError, KeyError, TypeError) as error:
            outcome = {'status': 'FAIL', 'reason': f'{type(error).__name__}: {error}'}
            try:
                self.screenshot('failure-' + name, settle=False)
            except (RuntimeError, OSError, subprocess.SubprocessError):
                pass
        outcome['seconds'] = round(time.monotonic() - started, 2)
        print(f"gui-test {self.engine.name}/{name}: {outcome['status']}" + (f" ({outcome.get('reason')})" if outcome.get('reason') else ''),
              flush=True)
        return outcome

    def run(self, executable, app_info, scenarios):
        self.result['app'] = {'executable': str(executable), **app_info}
        SESSION_ROOT.mkdir(parents=True, exist_ok=True)
        with OwnedSession(SESSION_ROOT / ('gui-' + secrets.token_hex(8))) as session:
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
                        try:
                            self.engine.prepare(self)
                        except EngineUnavailable as error:
                            self.result['engine_prepare'] = {'status': 'BLOCKED_ENV', 'reason': str(error)}
                        for name in scenarios:
                            if name != 'launch' and name not in self.result['scenarios']:
                                self.result['scenarios'][name] = self.run_one(name)
                    if self.args.screenshot:
                        final = self.screenshot('final')
                        target = Path(self.args.screenshot).resolve()
                        target.parent.mkdir(parents=True, exist_ok=True)
                        shutil.copyfile(final, target)
                        self.result['screenshot'] = str(target)
                    if self.args.hold:
                        print(f'Holding the session for {self.args.hold}s on {self.x_env["DISPLAY"]}', flush=True)
                        time.sleep(self.args.hold)
            finally:
                self.shutdown()
        self.result['cleanup'] = session.cleanup_report

    def shutdown(self):
        if self.marionette:
            try:
                self.marionette.call('Marionette:Quit', {'flags': ['eForceQuit']})
            except (MarionetteError, OSError, ValueError):
                pass
            self.marionette.close()
        if self.browser is not None:
            try:
                self.result.setdefault('browser', {})['exit_code'] = self.browser.wait(timeout=20)
            except subprocess.TimeoutExpired:
                self.result.setdefault('browser', {})['exit_code'] = 'did not quit within 20s; session stops its group'


def main():
    engines = gui_engines.engines()
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--engine', default='gecko', choices=sorted(engines))
    parser.add_argument('--scenario', default='all', help='all or a comma list of: ' + ','.join(SCENARIOS))
    parser.add_argument('--screenshot', help='also copy the final root-window screenshot (PNG) here')
    parser.add_argument('--app', default='auto', help='auto (local build, else fetched), local, fetched, or a path to an unpacked app')
    parser.add_argument('--evidence-dir', help='default: <build root>/gui-evidence/<engine>-<time>')
    parser.add_argument('--size', default='1280x800', help='Xvfb screen size (default 1280x800)')
    parser.add_argument('--timeout', type=float, default=45, help='seconds per assertion wait')
    parser.add_argument('--launch-timeout', type=float, default=180, help='seconds for first window and Marionette')
    parser.add_argument('--hold', type=int, default=0, help='keep the session open this many seconds before teardown')
    parser.add_argument('--list', action='store_true', help='list engines and scenarios')
    args = parser.parse_args()
    if args.list:
        print(json.dumps({'engines': {name: engine.owner for name, engine in engines.items()},
                          'scenarios': list(SCENARIOS)}, indent=2))
        return 0
    scenarios = list(SCENARIOS) if args.scenario == 'all' else [item for item in args.scenario.split(',') if item]
    if not scenarios or any(item not in SCENARIOS for item in scenarios):
        parser.error('--scenario takes all or: ' + ','.join(SCENARIOS))
    engine = engines[args.engine]
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    evidence = Path(args.evidence_dir).resolve() if args.evidence_dir else storage.BUILD_ROOT / 'gui-evidence' / f'{engine.name}-{stamp}'
    harness = Harness(args, engine, evidence)
    code = 0
    try:
        if not storage.LINUX:
            raise Blocked('the GUI harness targets Linux (Xvfb); macOS GUI evidence uses ./dev smoke')
        storage.ensure()
        evidence.mkdir(parents=True, exist_ok=True)
        executable, app_info = resolve_app(args.app)
        harness.run(executable, app_info, scenarios)
        statuses = [item['status'] for item in harness.result['scenarios'].values()]
        missing = [name for name in scenarios if name not in harness.result['scenarios']]
        status = ('FAIL' if 'FAIL' in statuses or missing else 'BLOCKED_ENV' if 'BLOCKED_ENV' in statuses else 'PASS')
        if missing:
            harness.result['not_run'] = missing
        code = {'PASS': 0, 'FAIL': 1, 'BLOCKED_ENV': 2}[status]
    except Blocked as error:
        status, code = 'BLOCKED_ENV', 2
        harness.result['reason'] = str(error)
    except (RuntimeError, OSError, subprocess.SubprocessError, AssertionError) as error:
        status, code = 'FAIL', 1
        harness.result['reason'] = f'{type(error).__name__}: {error}'
    harness.result['status'] = status
    harness.result['evidence_dir'] = str(evidence)
    if evidence.is_dir():
        (evidence / 'result.json').write_text(json.dumps(harness.result, indent=2) + '\n')
    print(json.dumps(harness.result, indent=2), flush=True)
    return code


if __name__ == '__main__':
    sys.exit(main())
