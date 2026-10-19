#!/usr/bin/env python3
"""Real WPE WebKit input test: mouse buttons, move/drag, wheel pixel deltas, keys, cursor,
device scale 1x/2x and visibility, observed through the page's own DOM state (its title)
and the delivered pixels. Component evidence only, never E1/E2.
"""
import importlib.util
import json
from pathlib import Path
import signal
import time

spec = importlib.util.spec_from_file_location('webkit_stream_test', Path(__file__).with_name('stream_test.py'))
stream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stream)
probe = stream.probe

LEFT_BUTTON_FLAG = 1 << 4


def state(session):
    """The page's latest `wk|key=value|...` title as a dict."""
    titles = [e['title'] for e in session.events if e.get('event') == 'title' and e.get('title', '').startswith('wk|')]
    return dict(part.split('=', 1) for part in titles[-1].split('|')[1:-1]) if titles else {}


def wait_state(session, check, seconds=10):
    def done(kind, item):
        return kind == 1 and item.get('event') == 'title' and item.get('title', '').startswith('wk|') and check(state(session))
    if check(state(session)):
        return state(session)
    session.until(done, seconds=seconds)
    return state(session)


def mouse(session, kind, x, y, button='left', modifiers=0, clicks=1):
    return session.command('mouse', type=kind, x=x, y=y, modifiers=modifiers, button=button, click_count=clicks, mouse_leave=False)


def key(session, kind, native, windows, text=''):
    return session.command('key', type=kind, native_key_code=native, windows_key_code=windows, modifiers=0, text=text)


# Steps the macOS snapshot scaffold cannot model are recorded, never failed, for that port only.
SOFT = {'wpe': set(), 'wkwebview': {'page_scale', 'drag', 'keys', 'wheel'}}


def scenario(session, origin, directory, port='wpe'):
    ready = session.until(lambda kind, item: item.get('event') == 'ready')
    results = {}

    def step(name, action):
        try:
            results[name] = action()
        except (TimeoutError, AssertionError) as error:
            if name not in SOFT[port]:
                raise
            results[name] = 'NOT_OBSERVED (' + port + ' scaffold): ' + type(error).__name__

    pending = dict(tab_id='input-tab', engine_instance=session.instance, identity=origin,
                   document_generation=1, navigation_generation=1, private_mode=False)
    session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=2)
    first = session.until(lambda kind, item: kind == 2, capture=directory / 'input-initial.png')
    assert first['width'] == 1800
    step('page_scale', lambda: wait_state(session, lambda s: s.get('dpr') == '2' and s.get('vw') == '900')['dpr'])
    session.command('focus', focused=True)

    def buttons():
        # Left then right press/release, reported by the page's own listeners.
        mouse(session, 'move', 100, 100)
        mouse(session, 'down', 100, 100); mouse(session, 'up', 100, 100)
        wait_state(session, lambda s: s.get('d') == '1' and s.get('u') == '1' and s.get('b') == '0')
        mouse(session, 'down', 120, 120, 'right'); mouse(session, 'up', 120, 120, 'right')
        return wait_state(session, lambda s: s.get('b') == '02' and s.get('u') == '2')['b']
    step('buttons', buttons)

    def cursor():
        # Cursor follows WebKit's hit test: editable -> text, link -> pointer.
        if not ready['capabilities']['cursor']:
            return 'capability false (not tested)'
        mouse(session, 'move', 150, 280)
        session.until(lambda kind, item: item.get('event') == 'cursor' and item.get('cursor') == 'text')
        mouse(session, 'move', 520, 35)
        session.until(lambda kind, item: item.get('event') == 'cursor' and item.get('cursor') == 'pointer')
        return ['text', 'pointer']
    step('cursor', cursor)

    def click_and_type():
        # Click into the field, then type through the text commit path.
        mouse(session, 'down', 150, 280); mouse(session, 'up', 150, 280)
        wait_state(session, lambda s: s.get('f') == '1')
        session.command('key', type='char', native_key_code=0, windows_key_code=0, modifiers=0, text='abc')
        wait_state(session, lambda s: s.get('v') == 'abc')
        session.until(lambda kind, item: kind == 2, capture=directory / 'input-typed.png')
        return 'abc'
    step('click_focus_and_type', click_and_type)

    def drag():
        mouse(session, 'down', 100, 400)
        for index in range(1, 6):
            mouse(session, 'move', 100 + index * 20, 400 + index * 10, modifiers=LEFT_BUTTON_FLAG)
        mouse(session, 'up', 200, 450)
        return int(wait_state(session, lambda s: int(s.get('dr', '0')) >= 1, seconds=4)['dr'])
    step('drag', drag)

    def keys():
        # Non-text keys reach the page with their DOM key names (native codes are XKB keycodes on Linux).
        codes = ((9, 27, 'Escape'), (113, 37, 'ArrowLeft'), (23, 9, 'Tab')) if port == 'wpe' else ((0x35, 27, 'Escape'), (0x7B, 37, 'ArrowLeft'), (0x30, 9, 'Tab'))
        for native, windows, name in codes:
            key(session, 'down', native, windows); key(session, 'up', native, windows)
            wait_state(session, lambda s, name=name: name in s.get('k', '').split(','), seconds=4)
        return state(session)['k']
    step('keys', keys)

    def wheel():
        # Pixel deltas; cef-v1 delta_y < 0 scrolls the page down.
        before = int(state(session).get('sy', '0'))
        session.command('wheel', x=450, y=300, modifiers=0, delta_x=0, delta_y=-400)
        scrolled = wait_state(session, lambda s: int(s.get('sy', '0')) > before, seconds=4)
        assert int(scrolled['w']) > 0, scrolled
        session.until(lambda kind, item: kind == 2, capture=directory / 'input-scrolled.png')
        return dict(delta_y=-400, scroll_y=int(scrolled['sy']), dom_delta_y=int(scrolled['w']))
    step('wheel', wheel)

    # Device scale 1x and back to 2x: exact physical frames (and, on WPE, the page's devicePixelRatio).
    session.command('resize', width=800, height=600, device_scale=1)
    session.until(lambda kind, item: kind == 2 and item['width'] == 800 and item['height'] == 600)
    step('page_scale_1x', lambda: wait_state(session, lambda s: s.get('vw') == '800' and (port != 'wpe' or s.get('dpr') == '1'))['dpr'])
    session.command('resize', width=900, height=650, device_scale=2)
    session.until(lambda kind, item: kind == 2 and item['width'] == 1800 and item['height'] == 1300)
    step('page_scale_2x', lambda: wait_state(session, lambda s: s.get('vw') == '900' and (port != 'wpe' or s.get('dpr') == '2'))['dpr'])
    # Hidden targets present nothing; showing again delivers a frame.
    hidden = session.command('visibility', visible=False)
    session.completed(hidden)
    frames = session.frames
    session.command('wheel', x=450, y=300, modifiers=0, delta_x=0, delta_y=-200)
    deadline = time.monotonic() + 1.5
    while time.monotonic() < deadline:
        try:
            session.until(lambda kind, item: kind == 2, seconds=max(.05, deadline - time.monotonic()))
        except TimeoutError:
            break
    results['frames_while_hidden'] = session.frames - frames
    assert results['frames_while_hidden'] == 0, results
    session.command('visibility', visible=True)
    session.until(lambda kind, item: kind == 2)
    close = session.command('close')
    session.until(lambda kind, item: item.get('event') == 'closed')
    session.completed(close)
    session.process.wait(timeout=20)
    assert session.process.returncode == 0
    results['frames'] = session.frames
    return results


def run(binary=None, port='wpe'):
    binary = Path(binary or probe.BINARY)
    if port == 'wpe':
        probe.check()
    subreaper = probe.become_subreaper()
    directory = probe.new_evidence('webkit-' + port + '-input-')
    result = dict(status='FAIL', engine='webkit', port=port, E1='NOT_TESTED', E2='NOT_TESTED', started_at=time.time(),
                  test_subreaper=subreaper)
    session = None
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        with probe.fixture_server(directory, probe.InputFixtureHandler) as (server, origin):
            session = stream.Session(binary, origin, directory)
            result['input'] = scenario(session, origin, directory, port)
            session.close()
            result.update(orphans=session.orphans, profile_removed=session.profile_removed)
            assert not session.orphans and session.profile_removed, result
            session = None
        result['status'] = 'PASS'
    except (Exception, KeyboardInterrupt) as error:
        result['error'] = type(error).__name__ + ': ' + str(error)
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        if session:
            session.close()
            result.update(orphans=session.orphans, profile_removed=session.profile_removed)
        signal.signal(signal.SIGTERM, previous_term)
        result['finished_at'] = time.time()
        (directory / 'result.json').write_text(json.dumps(result, indent=2) + '\n')
        print(json.dumps(dict(result, evidence=str(directory))), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
