"""WebKit (WPE host) plug-in; owned by the cloud/webkit-zen workstream.

The fixture page is opened in a normal Zen/Gecko tab, then that tab is switched to
WebKit through Zen's own engine switch (the tab context menu, or the privileged
chrome facade `window.AxioSozo.engineProbe` for the standard harness scenarios).
WebKit pixels are presented by WebKitPresenter in a canvas inside the tab's own
browserStack; assertions use the presenter's engine-reported state (frames,
title, URL, generations), the X11 window title and root-window screenshots, never
the hidden Gecko document's DOM as proof of WebKit rendering.

Needs the host built by `native/webkit-host/probe.py setup` at
<build root>/webkit/AxioWebKitHost (Linux, pinned Debian 13 WPE libraries) and a
Linux x86_64 app. Test-only: the throwaway profile gets
`axiosozo.engines.webkit.enabled=true`; no TLS, sandbox or isolation setting.
"""
import base64
import json
import os
import signal
import subprocess
import time

import storage
from . import GuiEngine, EngineUnavailable
from .gecko import ENGINE as GECKO
from .chromium import ENGINE as CHROMIUM

PREF = 'axiosozo.engines.webkit.enabled'
HOST = storage.BUILD_ROOT / 'webkit' / 'AxioWebKitHost'
XHTML = 'http://www.w3.org/1999/xhtml'

DIAGNOSTICS = """
const probe = window.AxioSozo?.engineProbe;
const state = probe?.diagnostics?.() ?? null;
const browser = gBrowser.selectedBrowser, stack = browser.parentNode;
const view = stack?.querySelector?.('[data-axiosozo-engine-view="webkit"]');
return {facade: !!probe?.switchTo, state: state && JSON.parse(JSON.stringify(state)),
        engineOf: probe?.engineOf?.(gBrowser.selectedTab) ?? null,
        geckoVisibility: browser.style.visibility, geckoURL: browser.currentURI?.spec ?? null,
        overlay: view ? {display: view.style.display, inBrowserStack: stack.classList.contains('browserStack'),
          canvas: view.querySelector('canvas') ? {width: view.querySelector('canvas').width,
            height: view.querySelector('canvas').height} : null} : null,
        tabEngineAttribute: gBrowser.selectedTab.getAttribute('axiosozo-engine'),
        tabLabel: gBrowser.selectedTab.label, urlbar: gURLBar.value,
        indicator: (b => b ? {hidden: b.hidden, label: b.getAttribute('label')} : null)(document.getElementById('axiosozo-webkit-indicator'))};
"""

# Pixels of the presented WebKit canvas compared in chrome: fraction of changed pixels.
CANVAS_DIFF = """
const [a, b] = arguments;
async function pixels(url) {
  const image = new Image(); image.src = url; await image.decode();
  const canvas = document.createElementNS('%s', 'canvas'); canvas.width = image.width; canvas.height = image.height;
  const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}
return Promise.all([pixels(a), pixels(b)]).then(([x, y]) => {
  if (x.length !== y.length) return 1;
  let changed = 0;
  for (let i = 0; i < x.length; i += 4) if (x[i] !== y[i] || x[i + 1] !== y[i + 1] || x[i + 2] !== y[i + 2]) changed++;
  return changed / (x.length / 4);
});
""" % XHTML


class WebKitEngine(GuiEngine):
    name = 'webkit'
    owner = 'cloud/webkit-zen'

    # -- harness hooks ---------------------------------------------------------------
    def browser_environment(self, harness):
        session = harness.result.get('session')
        if not HOST.is_file() or not os.access(HOST, os.X_OK):
            harness.result.setdefault('notes', []).append(f'WebKit host missing at {HOST} (native/webkit-host/probe.py setup)')
            return {}
        # The harness wrote user.js for this throwaway profile just before; add the test-only pref.
        profile = session and os.path.join(session, 'gecko')
        if profile and os.path.isdir(profile):
            with open(os.path.join(profile, 'user.js'), 'a') as prefs:
                prefs.write(f'user_pref({json.dumps(PREF)}, true);\n')
        environment = {'AXIOSOZO_WEBKIT_BINARY': str(HOST), 'AXIOSOZO_SESSION_RUNTIME': session or '',
                       'AXIOSOZO_ENGINE_FIXTURE_ORIGIN': harness.fixture.origin}
        if CHROMIUM.binary().is_file():
            # Three engines in one window: the Chromium facade (fixture mode) beside WebKit.
            environment = {**CHROMIUM.browser_environment(harness), **environment}
        return environment

    def prepare(self, harness):
        if not HOST.is_file():
            raise EngineUnavailable(f'WebKit host not built ({HOST}); run native/webkit-host/probe.py setup in Debian 13')
        state = harness.wait(lambda: harness.chrome_script(DIAGNOSTICS), 'AxioSozo engine controls')
        harness.result['webkit_prepare'] = state
        webkit = (state.get('state') or {}).get('webkit') or {}
        if not state.get('facade') or not webkit.get('available'):
            raise EngineUnavailable('WebKit unavailable in this app: ' + str(webkit.get('reason') or 'no three-engine controls'))

    def diagnostics(self, harness):
        return harness.chrome_script(DIAGNOSTICS)

    def show(self, harness, url):
        handle = harness.open_tab(url)
        harness.wait(lambda: harness.chrome_script('return gBrowser.selectedBrowser.contentTitle;').startswith('AxioSozo fixture'),
                     'fixture loaded in the Gecko tab first')
        started = time.monotonic()
        switched = harness.chrome_script('return window.AxioSozo.engineProbe.switchToWebKit()'
                                         '.then(target => ({ok: true, target}), error => ({ok: false, error: String(error?.message ?? error)}));')
        if not switched.get('ok'):
            raise AssertionError('switch to WebKit failed: ' + repr(switched))
        return {'window_handle': handle, 'switch_seconds': round(time.monotonic() - started, 2), 'target': switched['target']}

    def content_title(self, harness):
        state = self.diagnostics(harness)
        native = ((state.get('state') or {}).get('webkit') or {}).get('native') or {}
        return native.get('title') if native.get('engine') == 'webkit' else harness.chrome_script(
            'return gBrowser.selectedBrowser.contentTitle;')

    def assert_rendered(self, harness, expected_title_prefix):
        def ready():
            state = self.diagnostics(harness)
            native = ((state.get('state') or {}).get('webkit') or {}).get('native') or {}
            ok = (native.get('engine') == 'webkit' and native.get('frames', 0) > 0
                  and str(native.get('title') or '').startswith(expected_title_prefix))
            return state if ok else None
        state = harness.wait(ready, 'WebKit frames and title in the Zen tab')
        if state['geckoVisibility'] != 'hidden' or not state['overlay'] or state['overlay']['display'] != 'block' \
                or not state['overlay']['inBrowserStack']:
            raise AssertionError('WebKit is not presented in the tab content area: ' + repr(state))
        return {'engine': 'webkit', **state, 'canvas_png': self.save_canvas(harness, 'webkit-canvas')}

    # -- evidence helpers ------------------------------------------------------------------
    def canvas_data_url(self, harness):
        return harness.chrome_script('return window.AxioSozo.engineProbe.captureWebKitFrame().png;')

    def save_canvas(self, harness, name):
        url = self.canvas_data_url(harness)
        path = harness.evidence / f'{name}.png'
        path.write_bytes(base64.b64decode(url.split(',', 1)[1]))
        harness.result['screenshots'].append(str(path))
        return str(path)

    def native(self, harness):
        return ((self.diagnostics(harness).get('state') or {}).get('webkit') or {}).get('native') or {}

    def wait_native(self, harness, predicate, description):
        return harness.wait(lambda: (lambda native: native if predicate(native) else None)(self.native(harness)), description)

    def screen_point(self, harness, selector):
        """Screen pixel of an element's centre, from the (hidden, same-size) Gecko copy of the fixture."""
        return harness.element_screen_point(selector)

    def tab_menu_switch(self, harness, label, name):
        """Open Zen's tab context menu with a real right click, then pick the engine item."""
        rect = harness.chrome_script('const r = gBrowser.selectedTab.getBoundingClientRect();'
                                     'return {x: window.mozInnerScreenX + r.left + Math.min(r.width / 2, 60), '
                                     'y: window.mozInnerScreenY + r.top + r.height / 2, scale: window.devicePixelRatio};')
        harness.xdotool('mousemove', '--sync', round(rect['x'] * rect['scale']), round(rect['y'] * rect['scale']))
        harness.xdotool('click', '3')
        opened = harness.wait(lambda: harness.chrome_script("""
            const menu = document.getElementById('tabContextMenu');
            if (menu.state !== 'open') return null;
            const item = document.getElementById('axiosozo-context-engine');
            const submenu = document.getElementById('axiosozo-context-engine-menu');
            return {item: item && !item.hidden ? item.getAttribute('label') : null,
                    submenu: submenu && !submenu.hidden ? [...submenu.querySelectorAll('menuitem')].map(entry => ({
                      label: entry.getAttribute('label'), disabled: entry.getAttribute('disabled') === 'true'})) : null};
        """), 'tab context menu open', timeout=15)
        harness.screenshot(name + '-menu')
        if opened.get('submenu') is not None:
            return {'menu': opened, 'picked': self.submenu_pick(harness, label, name)}
        picked = harness.chrome_script("""
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

    def submenu_pick(self, harness, label, name):
        """Three engines: Zen's "Open in" submenu. Real pointer: hover the submenu, click the entry."""
        def screen_box(selector):
            return harness.chrome_script("""
                const node = document.querySelector(arguments[0]);
                if (!node || node.hidden) return null;
                const r = node.getBoundingClientRect();
                if (!(r.width > 0 && r.height > 0)) return null;
                return {x: window.mozInnerScreenX + r.left + Math.min(r.width / 2, 40), y: window.mozInnerScreenY + r.top + r.height / 2,
                        scale: window.devicePixelRatio, open: document.querySelector('#axiosozo-context-engine-menu > menupopup')?.state};
            """, [selector])
        menu_box = harness.wait(lambda: screen_box('#axiosozo-context-engine-menu'), '"Open in" submenu laid out', timeout=10)
        harness.xdotool('mousemove', '--sync', round(menu_box['x'] * menu_box['scale']), round(menu_box['y'] * menu_box['scale']))
        harness.xdotool('click', '1')
        submenu_open = "return document.querySelector('#axiosozo-context-engine-menu > menupopup')?.state === 'open';"
        how = 'submenu'
        try:
            harness.wait(lambda: harness.chrome_script(submenu_open) or None, '"Open in" submenu open', timeout=10)
        except Exception:
            # Recorded: the submenu was opened by script; the entry itself is still a real click.
            how = 'submenu (opened by script)'
            harness.chrome_script("document.getElementById('axiosozo-context-engine-menu').openMenu(true);")
            harness.wait(lambda: harness.chrome_script(submenu_open) or None, '"Open in" submenu open (script)', timeout=10)
        engine = label.removeprefix('Open in ')
        selector = f'#axiosozo-context-engine-menu menuitem[label="{engine}"]:not([disabled="true"])'
        entry = harness.wait(lambda: screen_box(selector), f'enabled "{engine}" entry in the submenu', timeout=10)
        harness.screenshot(name + '-submenu')
        harness.xdotool('mousemove', '--sync', round(entry['x'] * entry['scale']), round(entry['y'] * entry['scale']))
        harness.xdotool('click', '1')
        harness.wait(lambda: harness.chrome_script("return document.getElementById('tabContextMenu').state === 'closed';") or None,
                     'tab menu closed after the pick', timeout=10)
        return how

    # -- the full round trip -----------------------------------------------------------------
    def roundtrip(self, harness):
        """Gecko → WebKit → Gecko on the fixture tab, with typing, click, scroll, page 2 and back."""
        steps = {}
        fixture = harness.fixture.url
        harness.open_tab(fixture)
        steps['gecko'] = GECKO.assert_rendered(harness, 'AxioSozo fixture')
        harness.screenshot('01-gecko')
        harness.xdotool('windowraise', harness.window)
        harness.xdotool('windowfocus', '--sync', harness.window)

        started = time.monotonic()
        steps['to_webkit'] = self.tab_menu_switch(harness, 'Open in WebKit', '02-to-webkit')
        rendered = self.assert_rendered(harness, 'AxioSozo fixture')
        steps['to_webkit']['seconds'] = round(time.monotonic() - started, 2)
        steps['webkit'] = {key: rendered[key] for key in ('geckoVisibility', 'overlay', 'tabEngineAttribute', 'indicator', 'canvas_png')}
        first = self.native(harness)
        steps['webkit']['native'] = first
        harness.wait(lambda: 'AxioSozo fixture' in harness.window_title(), 'X11 title from the WebKit page')
        harness.screenshot('02-webkit')

        # Type into the field (click focuses it in WebKit), then click Increment.
        point = self.screen_point(harness, '#text')
        harness.xdotool('mousemove', '--sync', *point)
        harness.xdotool('click', '1')
        harness.xdotool('type', '--delay', '80', 'webkit')
        typed = self.wait_native(harness, lambda n: 'input=webkit' in str(n.get('title')), 'typed text in the WebKit title')
        steps['typed'] = {'title': typed['title'], 'x11_title': harness.wait(
            lambda: (lambda t: t if 'input=webkit' in t else None)(harness.window_title()), 'typed text in the X11 title'),
            'pointer': point}
        harness.screenshot('03-typed')
        self.save_canvas(harness, '03-typed-canvas')
        button = self.screen_point(harness, '#count')
        harness.xdotool('mousemove', '--sync', *button)
        harness.xdotool('click', '1')
        clicked = self.wait_native(harness, lambda n: 'count=1' in str(n.get('title')), 'button click in the WebKit title')
        steps['clicked'] = {'title': clicked['title'], 'pointer': button}
        harness.screenshot('04-clicked')

        # Page 2 through the page's own link (a real click in WebKit), then Zen's toolbar
        # Back button (a real click). The address bar is not typed into: the Linux parent
        # process crashes on Return after address-bar typing (owned by cloud/linux-platform).
        generation = self.native(harness)['target']['document_generation']
        link = self.screen_point(harness, 'a[href="?page=2"]')
        harness.xdotool('mousemove', '--sync', *link)
        harness.xdotool('click', '1')
        page2 = self.wait_native(harness, lambda n: str(n.get('url', '')).endswith('?page=2') and 'page=2' in str(n.get('title'))
                                 and n.get('frames', 0) > 0, 'page 2 in WebKit (link click)')
        steps['page2'] = {'via': 'link click', 'pointer': link, 'url': page2['url'], 'title': page2['title'],
                          'generation_before': generation, 'generation_after': page2['target']['document_generation'],
                          'urlbar': self.diagnostics(harness)['urlbar']}
        if page2['target']['document_generation'] <= generation:
            raise AssertionError('navigation did not advance the generation: ' + repr(steps['page2']))
        if not steps['page2']['urlbar'].endswith('?page=2'):
            raise AssertionError('Zen address bar does not show the WebKit address: ' + repr(steps['page2']))
        harness.screenshot('05-page2')
        steps['back_button'] = self.click_toolbar(harness, 'back-button', 'toolbar Back enabled for the WebKit history')
        back = self.wait_native(harness, lambda n: str(n.get('url', '')).endswith('/engine.html') and 'page=1' in str(n.get('title')),
                                'back to page 1 in WebKit (toolbar Back)')
        steps['back'] = {'url': back['url'], 'title': back['title'], 'generation': back['target']['document_generation'],
                         'can_go_forward': (back.get('loading') or {}).get('canGoForward'),
                         'urlbar': self.diagnostics(harness)['urlbar']}
        harness.screenshot('06-back')

        # Scroll with the mouse wheel over the WebKit view: the presented pixels move.
        # (Last WebKit step: the click targets above come from the unscrolled Gecko copy.)
        before = self.canvas_data_url(harness)
        frames_before = self.native(harness).get('frames', 0)
        harness.xdotool('mousemove', '--sync', button[0], button[1] + 120)
        for _ in range(5):
            harness.xdotool('click', '5')
            time.sleep(0.08)
        def scrolled():
            changed = harness.chrome_script(CANVAS_DIFF, [before, self.canvas_data_url(harness)])
            return changed if changed > 0.05 else None
        steps['scrolled'] = {'changed_fraction': round(harness.wait(scrolled, 'scrolled WebKit pixels', timeout=20), 3),
                             'frames_before': frames_before, 'frames_after': self.native(harness).get('frames')}
        harness.screenshot('07-scrolled')
        self.save_canvas(harness, '07-scrolled-canvas')

        # Back to Gecko through the same tab menu; the Gecko tab is shown again.
        steps['to_gecko'] = self.tab_menu_switch(harness, 'Open in Firefox', '08-to-gecko')
        state = self.wait_gecko_again(harness, 'the tab back in Gecko')
        steps['gecko_again'] = {'state': {key: state[key] for key in ('engineOf', 'geckoVisibility', 'overlay', 'geckoURL', 'tabEngineAttribute')},
                                'rendered': GECKO.assert_rendered(harness, 'AxioSozo fixture')}
        harness.screenshot('09-gecko-again')
        time.sleep(1)
        hosts = self.host_pids()
        steps['host_processes_after_return'] = len(hosts)
        if hosts:
            raise AssertionError(f'{len(hosts)} WebKit host process(es) still running after the switch back')
        steps['failures'] = ((self.diagnostics(harness).get('state') or {}).get('webkit') or {}).get('native', {}).get('failures')
        return steps


    def click_toolbar(self, harness, element_id, description):
        """A real pointer click on a Zen toolbar button, once the button is shown and enabled."""
        def ready():
            box = harness.chrome_script("""
                const node = document.getElementById(arguments[0]);
                if (!node) return {missing: true};
                const r = node.getBoundingClientRect();
                return {x: window.mozInnerScreenX + r.left + r.width / 2, y: window.mozInnerScreenY + r.top + r.height / 2,
                        width: r.width, height: r.height, scale: window.devicePixelRatio,
                        disabled: node.disabled === true || node.getAttribute('disabled') === 'true',
                        command: document.getElementById('Browser:Back')?.getAttribute('disabled') ?? null};
            """, [element_id])
            return box if box.get('width', 0) > 0 and box.get('height', 0) > 0 and not box.get('disabled') else None
        box = harness.wait(ready, description, timeout=15)
        point = [round(box['x'] * box['scale']), round(box['y'] * box['scale'])]
        harness.xdotool('mousemove', '--sync', *point)
        harness.xdotool('click', '1')
        return {'button': element_id, 'pointer': point, 'size': [round(box['width']), round(box['height'])]}

    @staticmethod
    def host_pids():
        return [int(pid) for pid in subprocess.run(['pgrep', '-f', 'AxioWebKitHost --stream'],
                                                   capture_output=True, text=True).stdout.split()]

    def wait_gecko_again(self, harness, description):
        return harness.wait(lambda: (lambda s: s if s['engineOf'] == 'gecko' and s['geckoVisibility'] != 'hidden'
                                     and not s['overlay'] else None)(self.diagnostics(harness)), description)

    # -- deliberate host failure ------------------------------------------------------------
    def host_failure(self, harness):
        """Kill the WebKit host (SIGKILL) while it presents a tab: the Gecko tab stays intact and usable."""
        steps = {}
        harness.open_tab(harness.fixture.url)
        steps['gecko_before'] = GECKO.assert_rendered(harness, 'AxioSozo fixture')
        steps['to_webkit'] = self.tab_menu_switch(harness, 'Open in WebKit', '10-failure-to-webkit')
        self.assert_rendered(harness, 'AxioSozo fixture')
        pids = self.host_pids()
        if len(pids) != 1:
            raise AssertionError(f'expected one WebKit host process, found {pids}')
        harness.screenshot('10-webkit-before-kill')
        os.kill(pids[0], signal.SIGKILL)
        steps['killed'] = {'pid': pids[0], 'signal': 'SIGKILL'}
        state = self.wait_gecko_again(harness, 'the Gecko tab shown again after the host died')
        steps['after_kill'] = {key: state[key] for key in ('engineOf', 'geckoVisibility', 'overlay', 'geckoURL',
                                                          'tabEngineAttribute', 'tabLabel', 'indicator')}
        steps['after_kill']['failures'] = ((state.get('state') or {}).get('webkit') or {}).get('native', {}).get('failures') \
            or (state.get('state') or {}).get('failure')
        if state['geckoURL'] != harness.fixture.url:
            raise AssertionError('the Gecko tab changed address: ' + repr(steps['after_kill']))
        steps['gecko_after'] = GECKO.assert_rendered(harness, 'AxioSozo fixture')
        if steps['gecko_after']['tab']['contentPid'] != steps['gecko_before']['tab']['contentPid']:
            raise AssertionError('the Gecko tab was reloaded into another content process')
        harness.screenshot('11-gecko-after-kill')
        # Still a working Gecko tab: real typing reaches its page.
        harness.xdotool('windowfocus', '--sync', harness.window)
        point = harness.element_screen_point('#text')
        harness.xdotool('mousemove', '--sync', *point)
        harness.xdotool('click', '1')
        harness.xdotool('type', '--delay', '60', 'kept')
        steps['gecko_input'] = harness.wait(lambda: (lambda t: t if 'input=kept' in t else None)(GECKO.content_title(harness)),
                                            'typing in the preserved Gecko tab')
        harness.screenshot('12-gecko-typed-after-kill')
        time.sleep(1)
        steps['host_processes_after'] = len(self.host_pids())
        if steps['host_processes_after']:
            raise AssertionError('WebKit host processes left after the kill')
        return steps

    # -- three engines on one tab ----------------------------------------------------------
    def three_engines(self, harness):
        """Gecko → WebKit → Gecko → Chromium → Gecko on one fixture tab, through Zen's tab menu."""
        if not CHROMIUM.binary().is_file():
            raise EngineUnavailable('CEF host not built in this job (native/chromium-host/probe.py setup)')
        engines = {entry['id']: entry for entry in ((self.diagnostics(harness).get('state') or {}).get('engines') or [])}
        if not (engines.get('chromium') or {}).get('available'):
            raise EngineUnavailable('Chromium unavailable in this app: ' + repr(engines.get('chromium')))
        steps = {}
        harness.open_tab(harness.fixture.url)
        steps['gecko'] = GECKO.assert_rendered(harness, 'AxioSozo fixture')['tab']
        harness.screenshot('20-three-gecko')
        steps['webkit'] = self.tab_menu_switch(harness, 'Open in WebKit', '21-three-to-webkit')
        steps['webkit']['native'] = {k: v for k, v in self.assert_rendered(harness, 'AxioSozo fixture').items()
                                     if k in ('engineOf', 'overlay', 'tabEngineAttribute')}
        harness.screenshot('21-three-webkit')
        steps['gecko_2'] = self.tab_menu_switch(harness, 'Open in Firefox', '22-three-to-gecko')
        self.wait_gecko_again(harness, 'Gecko after WebKit')
        steps['gecko_2']['rendered'] = GECKO.assert_rendered(harness, 'AxioSozo fixture')['tab']
        harness.screenshot('22-three-gecko')
        steps['chromium'] = self.tab_menu_switch(harness, 'Open in Chromium', '23-three-to-chromium')
        steps['chromium']['rendered'] = CHROMIUM.assert_rendered(harness, 'AxioSozo fixture')
        harness.screenshot('23-three-chromium')
        steps['gecko_3'] = self.tab_menu_switch(harness, 'Open in Firefox', '24-three-to-gecko')
        harness.wait(lambda: (lambda s: s if s['engineOf'] == 'gecko' and s['geckoVisibility'] != 'hidden' else None)(
            self.diagnostics(harness)), 'Gecko after Chromium')
        steps['gecko_3']['rendered'] = GECKO.assert_rendered(harness, 'AxioSozo fixture')['tab']
        harness.screenshot('24-three-gecko')
        return steps


ENGINE = WebKitEngine()
