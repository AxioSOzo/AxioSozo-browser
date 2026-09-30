#!/usr/bin/env python3
"""Real CEF input checks: key verdicts, IME, text_input, wheel phases, pinch, frame rate.

Runs the signed host in fixture stream mode (BGRA pipe) against a synthetic page that
records its DOM keyboard, composition, wheel, touch and visual-viewport state in
document.title. Functional results are asserted before teardown; a teardown stalled
on the "Chromium Safe Storage" Keychain item is reported separately. A PASS proves
the native component only, never E1/E2 inside Zen.
"""
import contextlib
import http.server
import importlib.util
import json
from pathlib import Path
import signal
import subprocess
import tempfile
import threading
import time

spec = importlib.util.spec_from_file_location('stream', Path(__file__).with_name('stream_test.py'))
stream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stream)
probe = stream.probe

PAGE = b'''<!doctype html><html lang="en"><meta charset="utf-8"><title>input fixture</title>
<style>html,body{margin:0}body{height:3000px;font:16px system-ui;background:#edf2f5;color:#163247}
input{position:absolute;left:40px;width:300px;height:30px;font:16px system-ui}#t{top:40px}#p{top:120px}
#blank{position:absolute;left:500px;top:300px;width:200px;height:100px;background:#c4dfd8}
.badge{position:absolute;left:40px;top:200px;font:12px ui-monospace}</style>
<input id="t" autofocus autocomplete="off"><input id="p" type="password" autocomplete="off">
<div id="blank">not editable</div><p class="badge">SYNTHETIC LOCAL INPUT FIXTURE - NO ACCOUNTS</p>
<script>
const t=document.querySelector('#t'),s={kd:[],kp:[],v:'',p:0,c:[],w:0,sy:0,pt:0,tt:0,vv:1,f:''};
function out(){s.v=t.value;s.p=document.querySelector('#p').value.length;s.sy=Math.round(scrollY);
  s.vv=Math.round(visualViewport.scale*100)/100;document.title=JSON.stringify(s).slice(0,1000);}
addEventListener('keydown',e=>{s.kd.push(e.key+(e.metaKey?'+meta':''));if(e.key==='b')e.preventDefault();out();},true);
addEventListener('keypress',e=>{s.kp.push(e.key);out();},true);
for(const [n,k] of [['compositionstart','s'],['compositionupdate','u'],['compositionend','e']])
  addEventListener(n,e=>{s.c.push(k+':'+e.data);out();},true);
addEventListener('wheel',e=>{s.w+=e.deltaY;out();},{passive:true});
addEventListener('scroll',out);
addEventListener('pointerdown',e=>{if(e.pointerType==='touch')s.pt++;out();},true);
addEventListener('touchstart',()=>{s.tt++;out();},{passive:true});
visualViewport.addEventListener('resize',out);
addEventListener('focusin',e=>{s.f=e.target.id||e.target.tagName;out();});
addEventListener('input',out);addEventListener('load',out);
</script></html>'''

# macOS virtual key codes (Carbon kVK_*) and CEF modifier flags.
KEY_A, KEY_B, KEY_L, KEY_LEFT, KEY_ESCAPE = 0x00, 0x0B, 0x25, 0x7B, 0x35
COMMAND = 1 << 7


class Fixture(http.server.BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass

    def do_GET(self):
        hosts = self.headers.get_all('Host', [])
        if hosts != [f'127.0.0.1:{self.server.server_port}'] or self.path != '/engine.html':
            self.send_error(404 if hosts else 403)
            return
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(PAGE)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(PAGE)


class InputSession(stream.Session):
    state = None

    def until(self, predicate, seconds=None, capture=None):
        def watch(kind, item):
            if kind == 1 and item.get('event') == 'title':
                with contextlib.suppress(ValueError):
                    self.state = json.loads(item['title'])
            return predicate(kind, item)
        return super().until(watch, seconds, capture)

    def done(self, request_id, seconds=None):
        return self.until(lambda kind, item: kind == 1 and item.get('request_id') == request_id
                          and item.get('event') in ('completed', 'error'), seconds)

    def page(self, check, seconds=None):
        """Wait until the fixture's recorded DOM state satisfies `check`."""
        if self.state is not None and check(self.state):
            return self.state
        self.until(lambda kind, item: kind == 1 and item.get('event') == 'title'
                   and self.state is not None and check(self.state), seconds)
        return self.state

    def text_input(self, check, seconds=None, after=0):
        for item in self.events[after:]:
            if item.get('event') == 'text_input' and check(item):
                return item
        return self.until(lambda kind, item: kind == 1 and item.get('event') == 'text_input' and check(item), seconds)

    def key(self, code, text='', modifiers=0, char=True):
        """One keystroke as the presenter sends it; returns (down completion, ms)."""
        started = time.monotonic()
        down = self.command('key', type='down', native_key_code=code, windows_key_code=0, modifiers=modifiers, text=text)
        if char and text:
            self.command('key', type='char', native_key_code=code, windows_key_code=0, modifiers=modifiers, text=text)
        verdict = self.done(down)
        elapsed = round((time.monotonic() - started) * 1000, 1)
        up = self.command('key', type='up', native_key_code=code, windows_key_code=0, modifiers=modifiers, text=text)
        self.done(up)
        return verdict, elapsed

    def click(self, x, y):
        for kind in ('down', 'up'):
            request = self.command('mouse', type=kind, x=x, y=y, modifiers=0, button='left', click_count=1, mouse_leave=False)
            self.done(request)


def check(results, name, condition, detail=None):
    results[name] = dict(passed=bool(condition), detail=detail)
    return condition


def run():
    probe.check()
    directory = Path(tempfile.mkdtemp(prefix='cef-input-', dir=probe.EVIDENCE))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    session = None
    checks = {}
    result = dict(status='FAIL', E1='NOT_TESTED', E2='NOT_TESTED', started_at=time.time(), checks=checks)
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        origin = f'http://127.0.0.1:{server.server_port}'
        session = InputSession(origin, directory, timeout=30)
        ready = session.until(lambda kind, item: item.get('event') == 'ready', 60)
        caps = ready['capabilities']
        check(checks, 'capabilities', all(caps.get(name) is True for name in
              ('ime', 'key_verdict', 'wheel_phases', 'pinch', 'frame_rate_command')),
              {name: caps.get(name) for name in ('ime', 'key_verdict', 'wheel_phases', 'pinch', 'frame_rate_command')})
        pending = dict(tab_id='input-tab', engine_instance=session.instance, identity=origin,
                       document_generation=1, navigation_generation=1, private_mode=False)
        session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
        session.until(lambda kind, item: kind == 2, 60, capture=directory / 'loaded.png')
        session.done(session.command('focus', focused=True))
        focused = session.text_input(lambda item: item['mode'] == 'text', 10)
        check(checks, 'text_input_autofocus', focused['mode'] == 'text' and 30 <= focused['caret_x'] <= 60
              and 30 <= focused['caret_y'] <= 70, focused)

        # Key verdicts: printable into an editable is not consumed by keydown;
        # a page preventDefault consumes it and still suppresses its keypress.
        verdict_a, ms_a = session.key(KEY_A, 'a')
        state = session.page(lambda s: s['v'] == 'a')
        check(checks, 'key_not_consumed_typing', verdict_a.get('reason') == 'key_not_consumed' and state['v'] == 'a',
              dict(reason=verdict_a.get('reason'), ms=ms_a, value=state['v']))
        verdict_b, ms_b = session.key(KEY_B, 'b')
        state = session.page(lambda s: 'b' in s['kd'])
        time.sleep(0.2)
        session.done(session.command('focus', focused=True))  # drain title events
        state = session.state
        check(checks, 'key_consumed_prevent_default', verdict_b.get('reason') == 'key_consumed'
              and state['v'] == 'a' and 'b' not in state['kp'],
              dict(reason=verdict_b.get('reason'), ms=ms_b, value=state['v'], keypress=state['kp']))
        verdict_meta, ms_meta = session.key(KEY_L, 'l', modifiers=COMMAND, char=False)
        check(checks, 'key_not_consumed_shortcut', verdict_meta.get('reason') == 'key_not_consumed',
              dict(reason=verdict_meta.get('reason'), ms=ms_meta))
        verdict_left, ms_left = session.key(KEY_LEFT, char=False)
        checks['key_arrow_in_editable_info'] = dict(passed=True, detail=dict(reason=verdict_left.get('reason'), ms=ms_left))
        verdict_escape, ms_escape = session.key(KEY_ESCAPE, char=False)
        checks['key_escape_info'] = dict(passed=True, detail=dict(reason=verdict_escape.get('reason'), ms=ms_escape))
        state = session.state
        # The inert probes never reach the page: only the keys sent above appear.
        check(checks, 'probe_invisible_to_page', state['kd'] == ['a', 'b', 'l+meta', 'ArrowLeft', 'Escape']
              and state['kp'] == ['a'], dict(keydown=state['kd'], keypress=state['kp']))

        # IME: composition, commit, optional fields, cancel. ArrowLeft left the caret at 0.
        before_composition = len(session.events)
        session.done(session.command('ime_set_composition', text='ni', selection_start=2, selection_end=2))
        state = session.page(lambda s: 'u:ni' in s['c'])
        # Chromium's composition character bounds replace the field-start estimate.
        caret = session.text_input(lambda item: item['mode'] == 'text' and item['caret_width'] > 1, 5, after=before_composition)
        check(checks, 'text_input_composition_bounds', caret is not None, caret)
        session.done(session.command('ime_commit_text', text='\u4f60'))
        state = session.page(lambda s: s['v'] == '\u4f60a' and 'e:\u4f60' in s['c'])
        check(checks, 'ime_commit_text', state['v'] == '\u4f60a' and 'e:\u4f60' in state['c'], dict(value=state['v'], events=state['c']))
        session.done(session.command('ime_set_composition', text='ka', selection_start=2, selection_end=2,
                                     underlines=[dict(start=0, end=2, thick=True)], replacement_range=dict(start=1, end=1)))
        session.done(session.command('ime_finish_composing', keep_selection=False))
        state = session.page(lambda s: s['v'] == '\u4f60kaa')
        check(checks, 'ime_underlines_and_finish', state['v'] == '\u4f60kaa', dict(value=state['v']))
        session.done(session.command('ime_set_composition', text='x', selection_start=1, selection_end=1))
        session.page(lambda s: 'u:x' in s['c'])
        session.done(session.command('ime_cancel_composition'))
        state = session.page(lambda s: s['c'][-1].startswith('e:'))
        check(checks, 'ime_cancel', state['v'] == '\u4f60kaa', dict(value=state['v'], events=state['c'][-3:]))

        # Editable kind follows focus: password field, then a non-editable area.
        session.click(100, 135)
        password = session.text_input(lambda item: item['mode'] == 'password', 5)
        check(checks, 'text_input_password', password['mode'] == 'password' and 110 <= password['caret_y'] + password['caret_height'] <= 160, password)
        session.click(600, 350)
        none = session.text_input(lambda item: item['mode'] == 'none' and item['caret_height'] == 0, 5)
        check(checks, 'text_input_none', none['mode'] == 'none', none)

        # Wheel with trackpad phases; zero-delta boundary events are accepted and dropped.
        wheel = dict(x=450, y=500, modifiers=0, delta_x=0, precise=True)
        for phase, momentum, dy in (('may_begin', 'none', 0), ('began', 'none', -100), ('changed', 'none', -100),
                                    ('ended', 'none', 0), ('none', 'began', -60), ('none', 'changed', -40),
                                    ('none', 'ended', 0)):
            session.done(session.command('wheel', phase=phase, momentum_phase=momentum, delta_y=dy, **wheel))
        session.done(session.command('wheel', x=450, y=500, modifiers=0, delta_x=0, delta_y=-50))  # legacy shape
        state = session.page(lambda s: s['w'] >= 350 and s['sy'] > 0)
        check(checks, 'wheel_phases_delta', state['w'] >= 350 and state['sy'] > 0, dict(wheel_delta_y=state['w'], scroll_y=state['sy']))

        # Pinch: a two-point touch sequence zooms the visual viewport.
        session.done(session.command('pinch', x=450, y=325, modifiers=0, phase='began', magnification=0))
        for _ in range(6):
            session.done(session.command('pinch', x=450, y=325, modifiers=0, phase='changed', magnification=0.2))
            time.sleep(0.03)
        session.done(session.command('pinch', x=450, y=325, modifiers=0, phase='ended', magnification=0))
        state = session.page(lambda s: s['vv'] > 1.05, 5)
        check(checks, 'pinch_visual_viewport', state['vv'] > 1.05,
              dict(visual_viewport_scale=state['vv'], touch_pointerdowns=state['pt'], touchstarts=state['tt']))
        session.until(lambda kind, item: kind == 2, 5, capture=directory / 'pinched.png')

        rate = session.done(session.command('frame_rate', frame_rate=120))
        check(checks, 'frame_rate_command', rate.get('status') == 'success', rate)

        result['functional'] = 'PASS' if all(item['passed'] for item in checks.values()) else 'FAIL'
        close_id = session.command('close')
        session.until(lambda kind, item: item.get('event') == 'completed' and item.get('request_id') == close_id)
        try:
            session.process.wait(timeout=15)
            result['native_exit_code'] = session.process.returncode
        except subprocess.TimeoutExpired:
            result['native_exit_code'] = None
            result['teardown'] = 'host still running 15 s after close (Keychain gate suspected; see README)'
            with contextlib.suppress(subprocess.TimeoutExpired, OSError):
                subprocess.run(['/usr/bin/sample', str(session.process.pid), '1', '1', '-file',
                                str(directory / 'host-teardown.sample.txt')], capture_output=True, timeout=5)
        result['status'] = result['functional'] if result.get('native_exit_code') == 0 else (
            'PASS_TEARDOWN_BLOCKED' if result['functional'] == 'PASS' else 'FAIL')
        result.update(cef=ready['cef'], chromium=ready['chromium'], frames=session.frames)
    except (Exception, KeyboardInterrupt) as exc:
        result['error'] = type(exc).__name__ + ': ' + str(exc)
        result['page_state'] = session.state if session else None
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
            result['profile_removed'] = session.profile_removed
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
        signal.signal(signal.SIGTERM, previous_term)
        result['finished_at'] = time.time()
        (directory / 'result.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
        print(json.dumps(dict(status=result['status'], functional=result.get('functional'), error=result.get('error'),
                              failed=[name for name, item in checks.items() if not item['passed']],
                              evidence=str(directory))), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
