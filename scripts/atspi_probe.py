#!/usr/bin/python3
"""Read (and optionally act on) an application's AT-SPI tree, as a screen reader would.

    DBUS_SESSION_BUS_ADDRESS=... /usr/bin/python3 scripts/atspi_probe.py --app-pid PID \
        --root-name REGEX [--root-role ROLE] [--press ROLE=NAME]

Used by scripts/cef_zen_e2e.py --a11y on the throwaway session bus of the Linux GUI
harness: finds the first accessible whose name matches --root-name (and role, if given)
in the application with that pid, then prints JSON with that subtree's interesting
nodes (role, name, text, focused, actions), bounded in size and depth. --press runs the
first action of the first node with that role and name. Needs python3-gi and
gir1.2-atspi-2.0 (system Python). Reads only the test app's accessibility tree.
"""
import argparse
import json
import re
import sys
import time

import gi
gi.require_version('Atspi', '2.0')
from gi.repository import Atspi  # noqa: E402

MAX_NODES = 6000
INTERESTING = {'push button', 'toggle button', 'entry', 'password text', 'link', 'heading', 'check box', 'radio button',
               'combo box', 'document web', 'document frame', 'paragraph', 'text', 'static', 'label', 'list', 'list item',
               'panel', 'section', 'image', 'slider', 'spin button', 'internal frame', 'canvas', 'status bar'}


def text_of(node):
    try:
        if node.get_text_iface() is None:
            return None
        return Atspi.Text.get_text(node, 0, min(Atspi.Text.get_character_count(node), 400))
    except Exception:  # noqa: BLE001 - a dying accessible
        return None


def actions_of(node):
    try:
        if node.get_action_iface() is None:
            return []
        return [Atspi.Action.get_action_name(node, i) for i in range(Atspi.Action.get_n_actions(node))]
    except Exception:  # noqa: BLE001
        return []


def walk(node, visit, depth=0, budget=None):
    budget = budget if budget is not None else [MAX_NODES]
    if budget[0] <= 0 or depth > 80:
        return None
    budget[0] -= 1
    found = visit(node, depth)
    if found is not None:
        return found
    try:
        count = node.get_child_count()
    except Exception:  # noqa: BLE001
        return None
    for index in range(min(count, 2000)):
        try:
            child = node.get_child_at_index(index)
        except Exception:  # noqa: BLE001
            continue
        if child is not None:
            found = walk(child, visit, depth + 1, budget)
            if found is not None:
                return found
    return None


def describe(node):
    try:
        role, name = node.get_role_name(), node.get_name()
        states = node.get_state_set()
        focused = states.contains(Atspi.StateType.FOCUSED)
        showing = states.contains(Atspi.StateType.SHOWING)
    except Exception:  # noqa: BLE001
        return None
    return {'role': role, 'name': name, 'text': text_of(node) if role in ('entry', 'text', 'static', 'paragraph', 'heading', 'link',
                                                                              'section', 'label') else None,
            'focused': focused, 'showing': showing, 'actions': actions_of(node)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--app-pid', type=int, required=True)
    parser.add_argument('--app-name', default=r'(?i)firefox|zen|axiosozo', help='fallback when no app has that pid')
    parser.add_argument('--root-name', required=True)
    parser.add_argument('--root-role')
    parser.add_argument('--press')
    parser.add_argument('--timeout', type=float, default=20)
    args = parser.parse_args()
    Atspi.set_timeout(5000, 30000)
    pattern = re.compile(args.root_name)
    out = {'apps': [], 'root': None, 'nodes': [], 'pressed': None}
    deadline = time.monotonic() + args.timeout
    while time.monotonic() < deadline:
        desktop = Atspi.get_desktop(0)
        app = None
        out['apps'] = []
        for index in range(desktop.get_child_count()):
            candidate = desktop.get_child_at_index(index)
            if candidate is None:
                continue
            try:
                pid = candidate.get_process_id()
                out['apps'].append({'name': candidate.get_name(), 'pid': pid})
            except Exception:  # noqa: BLE001
                continue
            if pid == args.app_pid or (app is None and re.search(args.app_name, candidate.get_name() or '')):
                app = candidate
        root = None
        if app is not None:
            def match(node, _depth):
                try:
                    if pattern.search(node.get_name() or '') and (not args.root_role or node.get_role_name() == args.root_role):
                        return node
                except Exception:  # noqa: BLE001
                    pass
                return None
            root = walk(app, match)
        if root is not None:
            break
        time.sleep(1)
    else:
        print(json.dumps({**out, 'error': 'no accessible matching the root name in the app'}))
        return 1
    out['root'] = describe(root)
    nodes = out['nodes']

    def collect(node, depth):
        info = describe(node)
        if info and (info['role'] in INTERESTING or info['name']):
            nodes.append({**info, 'depth': depth})
        return None
    walk(root, collect)
    if args.press:
        role, _, name = args.press.partition('=')

        def target(node, _depth):
            try:
                return node if node.get_role_name() == role and node.get_name() == name else None
            except Exception:  # noqa: BLE001
                return None
        node = walk(root, target)
        if node is None:
            out['pressed'] = {'error': f'no {role} named {name!r}'}
        else:
            names = actions_of(node)
            try:
                done = Atspi.Action.do_action(node, 0) if names else False
            except Exception as error:  # noqa: BLE001
                done = 'error: ' + str(error)
            out['pressed'] = {'role': role, 'name': name, 'actions': names, 'result': done}
    print(json.dumps(out))
    return 0


if __name__ == '__main__':
    sys.exit(main())
