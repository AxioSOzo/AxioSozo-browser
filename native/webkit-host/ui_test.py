#!/usr/bin/env python3
"""Real WPE WebKit browser-UI profile test (engine-stream-v1 §8.2, hello `browser_ui`):
JavaScript dialogs, the <select> option menu, the context menu, permission requests and
their single-use replies (stale and navigation-closed prompts included), find, zoom,
paste_text, clipboard_text / text_selection, IME preedit and commit, CSS cursors and the
page favicon, observed through the page's own title and the host's events. Component
evidence only, never E1/E2.
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

UI_FIXTURE = Path(__file__).with_name('fixtures') / 'ui.html'
# Fixed CSS-pixel centres of fixtures/ui.html (device_scale 1).
AT = {'alert': (70, 35), 'confirm': (190, 35), 'prompt': (310, 35), 'perm': (440, 35), 't': (170, 95), 'sel': (420, 95),
      'mv': (70, 260), 'ed': (170, 320), 'unload': (570, 35), 'link': (520, 152)}
P_TOP, CHAR = 152, 12.04   # "alpha beta gamma", 20px monospace at x=20


class UiFixtureHandler(probe.FixtureHandler):
    fixture = UI_FIXTURE


def state(session):
    titles = [e['title'] for e in session.events if e.get('event') == 'title' and e.get('title', '').startswith('ui|')]
    return dict(part.split('=', 1) for part in titles[-1].split('|')[1:-1]) if titles else {}


def wait_state(session, check, seconds=10):
    if check(state(session)):
        return state(session)
    session.until(lambda kind, item: kind == 1 and item.get('event') == 'title' and item.get('title', '').startswith('ui|')
                  and check(state(session)), seconds=seconds)
    return state(session)


def event(session, name, check=lambda item: True, seconds=10):
    """The next not-yet-taken `name` event matching `check`, from history or the stream."""
    taken = session.__dict__.setdefault('ui_taken', set())
    for index, item in enumerate(session.events):
        if index not in taken and item.get('event') == name and check(item):
            taken.add(index)
            return item
    item = session.until(lambda kind, item: kind == 1 and item.get('event') == name and check(item), seconds=seconds)
    taken.add(len(session.events) - 1)
    return item


def click(session, x, y, button='left', clicks=1):
    session.command('mouse', type='move', x=x, y=y, modifiers=0, button='left', click_count=1, mouse_leave=False)
    for count in range(1, clicks + 1):
        session.command('mouse', type='down', x=x, y=y, modifiers=0, button=button, click_count=count, mouse_leave=False)
        session.command('mouse', type='up', x=x, y=y, modifiers=0, button=button, click_count=count, mouse_leave=False)


def text_event(session, name, seconds=10):
    """The whole text of one chunked clipboard_text / text_selection event."""
    parts = []
    while True:
        item = event(session, name, seconds=seconds)
        parts.append(item['text'])
        if item['part'] == item['parts']:
            return ''.join(parts)


def scenario(session, origin, directory):
    ready = session.until(lambda kind, item: item.get('event') == 'ready')
    caps = ready['capabilities']
    results = {'capabilities': {k: caps.get(k) for k in ('browser_ui', 'javascript_dialogs', 'context_menu', 'option_menu',
               'permissions', 'file_dialogs', 'find', 'zoom', 'favicon', 'clipboard', 'ime', 'text_input', 'cursor_set',
               'downloads', 'popups', 'http_auth')}}
    assert caps['browser_ui'] is True and caps['downloads'] is False and caps['popups'] is False, results
    pending = dict(tab_id='ui-tab', engine_instance=session.instance, identity=origin,
                   document_generation=1, navigation_generation=1, private_mode=False)
    session.command('create', target=pending, url=origin + '/engine.html', width=900, height=650, device_scale=1)
    session.until(lambda kind, item: kind == 2, capture=directory / 'ui-initial.png')
    wait_state(session, lambda s: s.get('vw') == '900')
    session.command('focus', focused=True)
    icon = event(session, 'favicon', seconds=10)['icon']
    results['favicon'] = icon[:30] + f'… ({len(icon)} chars)'
    assert icon.startswith('data:image/png;base64,'), icon[:60]

    def dialog(button, check):
        click(session, *AT[button])
        prompt = event(session, 'prompt')
        assert prompt['kind'] == 'dialog' and prompt['prompt_id'].startswith('prompt-'), prompt
        return prompt
    alert = dialog('alert', None)
    assert alert['details']['dialog_type'] == 'alert' and alert['details']['message'] == 'ui alert', alert
    reply = session.command('dialog_reply', prompt_id=alert['prompt_id'], accept=True, text='')
    assert session.completed(reply)['status'] == 'success'
    event(session, 'prompt_closed', lambda item: item['prompt_id'] == alert['prompt_id'] and item['reason'] == 'answered')
    wait_state(session, lambda s: s.get('d') == 'alert')
    # A second reply to the same prompt is refused, not fatal (cef-v1 stale_prompt).
    again = session.command('dialog_reply', prompt_id=alert['prompt_id'], accept=True, text='')
    assert event(session, 'error', lambda item: item.get('request_id') == again)['code'] == 'stale_prompt'
    confirm = dialog('confirm', None)
    session.completed(session.command('dialog_reply', prompt_id=confirm['prompt_id'], accept=False, text=''))
    wait_state(session, lambda s: s.get('d') == 'confirm=false')
    asked = dialog('prompt', None)
    assert asked['details']['default_text'] == 'dflt', asked
    session.completed(session.command('dialog_reply', prompt_id=asked['prompt_id'], accept=True, text='wk'))
    results['dialogs'] = wait_state(session, lambda s: s.get('d') == 'prompt=wk')['d']

    # <select>: WebKit's option menu as a prompt; Zen's choice is applied by index.
    click(session, *AT['sel'])
    menu = event(session, 'prompt', lambda item: item['kind'] == 'option_menu')
    labels = [item['label'] for item in menu['details']['items']]
    assert labels == ['one', 'two', 'three'] and menu['details']['items'][0]['selected'], menu
    session.completed(session.command('option_menu_reply', prompt_id=menu['prompt_id'], index=2))
    results['select'] = wait_state(session, lambda s: s.get('sel') == 'three')['sel']

    # Double-click a word: the selection reaches Zen as text_selection (X11 PRIMARY).
    x = 20 + CHAR * 7.5
    click(session, round(x), P_TOP, clicks=2)
    results['double_click_selection'] = text_event(session, 'text_selection').strip()
    assert results['double_click_selection'] == 'beta', results
    # Drag across "alpha": text selection by dragging.
    session.command('mouse', type='move', x=21, y=P_TOP, modifiers=0, button='left', click_count=1, mouse_leave=False)
    session.command('mouse', type='down', x=21, y=P_TOP, modifiers=0, button='left', click_count=1, mouse_leave=False)
    for step in (30, 40, 50, 60, 70, 80):
        time.sleep(0.03)  # a hand's pace: WebKit coalesces moves that arrive together
        session.command('mouse', type='move', x=step, y=P_TOP, modifiers=1 << 4, button='left', click_count=1, mouse_leave=False)
    time.sleep(0.05)
    session.command('mouse', type='up', x=80, y=P_TOP, modifiers=0, button='left', click_count=1, mouse_leave=False)
    try:
        results['drag_selection'] = text_event(session, 'text_selection', seconds=4).strip()
    except TimeoutError:
        results['drag_selection'] = 'NOT_OBSERVED'

    # Find: three matches of "needle".
    find = session.command('find', text='needle', forward=True, match_case=False, find_next=False)
    session.completed(find)
    found = event(session, 'find_result')
    assert found['count'] == 3 and found['active'] == 1 and found['final'], found
    session.completed(session.command('find', text='needle', forward=True, match_case=False, find_next=True))
    following = event(session, 'find_result')
    assert following['active'] == 2, following
    session.completed(session.command('stop_finding', clear_selection=True))
    results['find'] = [found, following]

    # paste_text into the focused field; IME preedit then commit.
    click(session, *AT['t'])
    text_input = event(session, 'text_input', lambda item: item['mode'] == 'text')
    session.completed(session.command('paste_text', text='pasted'))
    wait_state(session, lambda s: s.get('t') == 'pasted')
    frames = session.frames
    session.completed(session.command('ime_set_composition', text='にほん', selection_start=3, selection_end=3))
    session.frame_after(frames, capture=directory / 'ui-preedit.png')
    session.command('ime_commit_text', text='日本')
    results['ime'] = wait_state(session, lambda s: s.get('t') == 'pasted日本')['t']
    results['text_input'] = text_input
    click(session, *AT['ed'])
    # Pointer input queues in WebKit's UI process while input-method signals do not: compose once
    # the caret is in the contenteditable (as a user does).
    event(session, 'text_input', lambda item: item['mode'] == 'text' and item['caret_y'] >= 290)
    session.completed(session.command('ime_set_composition', text='かな', selection_start=2, selection_end=2))
    session.command('ime_commit_text', text='仮名')
    results['ime_contenteditable'] = wait_state(session, lambda s: s.get('e') == '仮名')['e']

    # CSS cursors from the element's computed style.
    session.command('mouse', type='move', x=AT['mv'][0], y=AT['mv'][1], modifiers=0, button='left', click_count=1, mouse_leave=False)
    results['cursor_move'] = event(session, 'cursor', lambda item: item['cursor'] == 'move')['cursor']

    # Zoom: level 1 (factor 1.2) narrows the CSS viewport.
    session.completed(session.command('zoom', level=1))
    results['zoom_vw'] = wait_state(session, lambda s: s.get('vw') == '750')['vw']
    session.completed(session.command('zoom', level=0))
    wait_state(session, lambda s: s.get('vw') == '900')

    # Permission request: denied by Zen's reply.
    click(session, *AT['perm'])
    permission = event(session, 'prompt', lambda item: item['kind'] == 'permission')
    assert permission['details']['origin'] == origin, permission
    session.completed(session.command('permission_reply', prompt_id=permission['prompt_id'], decision='deny'))
    results['permission'] = {'asked': permission['details']['permissions'], 'page': wait_state(session, lambda s: s.get('perm') != '')['perm']}
    assert results['permission']['page'] == 'denied', results

    # Context menu over a selection (WebKit's signal or the host's fallback), then Copy.
    click(session, round(20 + CHAR * 2.5), P_TOP, clicks=2)
    assert text_event(session, 'text_selection').strip() == 'alpha'
    click(session, round(20 + CHAR * 2.5), P_TOP, button='right')
    context = event(session, 'prompt', lambda item: item['kind'] == 'context_menu')
    details = context['details']
    assert details['selection_text'].strip() == 'alpha' and details['type_flags'] & 16 and details['edit_flags'] & 8, details
    session.completed(session.command('context_menu_command', prompt_id=context['prompt_id'], command='copy', index=0))
    results['context_copy'] = text_event(session, 'clipboard_text').strip()
    assert results['context_copy'] == 'alpha', results
    results['context_menu'] = {k: details[k] for k in ('x', 'y', 'type_flags', 'edit_flags', 'editable', 'media_type')}
    # Input still reaches the page after the menu (no engine-side menu state left behind).
    click(session, *AT['t'])
    event(session, 'text_input', lambda item: item['mode'] == 'text' and item['caret_y'] < 120)
    session.completed(session.command('paste_text', text='!'))
    results['input_after_context_menu'] = wait_state(session, lambda s: s.get('t', '').endswith('!'))['t']

    # beforeunload: WebKit asks after its navigation policy; the generation advances only once the
    # user leaves, so "Stay" keeps the same document (and its target) live.
    click(session, *AT['unload'])
    wait_state(session, lambda s: s.get('d') == 'armed')
    before = dict(session.target)
    click(session, *AT['link'])
    unload = event(session, 'prompt', lambda item: item['kind'] == 'before_unload')
    navigations = [e for e in session.events if e.get('event') == 'navigation']
    session.completed(session.command('dialog_reply', prompt_id=unload['prompt_id'], accept=False, text=''))
    time.sleep(1)
    assert session.target == before and len([e for e in session.events if e.get('event') == 'navigation']) == len(navigations), \
        'Stay changed the target'
    click(session, *AT['t'])
    event(session, 'text_input', lambda item: item['mode'] == 'text' and item['caret_y'] < 120)
    session.completed(session.command('paste_text', text='?'))
    stayed = wait_state(session, lambda s: s.get('t', '').endswith('?'))['t']
    click(session, *AT['link'])
    unload = event(session, 'prompt', lambda item: item['kind'] == 'before_unload')
    session.completed(session.command('dialog_reply', prompt_id=unload['prompt_id'], accept=True, text=''))
    event(session, 'navigation')
    session.until(lambda kind, item: item.get('event') == 'load', seconds=15)
    left = wait_state(session, lambda s: s.get('d') == '')  # page 2 is a new document
    results['beforeunload'] = {'stayed_input': stayed, 'left_generation': session.target['document_generation'],
                               'before_generation': before['document_generation']}
    assert session.target['document_generation'] == before['document_generation'] + 1, results

    # A navigation closes an open prompt with its safe default before generations advance.
    click(session, *AT['alert'])
    open_prompt = event(session, 'prompt')
    session.command('navigate', url=origin + '/engine.html?page=2')
    closed = event(session, 'prompt_closed', lambda item: item['prompt_id'] == open_prompt['prompt_id'])
    assert closed['reason'] == 'navigation', closed
    results['navigation_closes_prompt'] = closed['reason']
    session.until(lambda kind, item: item.get('event') == 'load', seconds=15)

    close = session.command('close')
    session.until(lambda kind, item: item.get('event') == 'closed')
    session.completed(close)
    session.process.wait(timeout=20)
    assert session.process.returncode == 0
    return results


def run(binary=None):
    binary = Path(binary or probe.BINARY)
    probe.check()
    subreaper = probe.become_subreaper()
    directory = probe.new_evidence('webkit-wpe-ui-')
    result = dict(status='FAIL', engine='webkit', E1='NOT_TESTED', E2='NOT_TESTED', started_at=time.time(), test_subreaper=subreaper)
    session = None
    previous_term = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        with probe.fixture_server(directory, UiFixtureHandler) as (server, origin):
            session = stream.Session(binary, origin, directory, hello_extra={'browser_ui': True})
            result['ui'] = scenario(session, origin, directory)
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
        (directory / 'result.json').write_text(json.dumps(result, indent=2, ensure_ascii=False) + '\n')
        print(json.dumps(dict(result, evidence=str(directory)), ensure_ascii=False), flush=True)
    return 0 if result['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(run())
