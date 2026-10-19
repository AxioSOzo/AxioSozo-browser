#!/usr/bin/env python3
"""Desktop integration for an unpacked Linux AxioSozo app (per user, XDG).

    python3 scripts/linux_desktop.py render  [--app PATH|fetched]
    python3 scripts/linux_desktop.py install [--app PATH|fetched] [--dry-run]
    python3 scripts/linux_desktop.py uninstall [--dry-run]

`./dev package` makes a development tar.xz with no .desktop file, so GNOME and
KDE show a generic icon and do not group the window under a launcher. This
writes, for the current user only:

  $XDG_DATA_HOME/applications/AxioSozoDev.desktop
  $XDG_DATA_HOME/icons/hicolor/<N>x<N>/apps/axiosozo-dev.png   (from the app bundle)

The file name and StartupWMClass match what Gecko gives the window: X11
WM_CLASS res_class and the Wayland app id both fall back to the GTK program
name, which nsAppRunner sets from application.ini RemotingName (AxioSozoDev).
It never makes AxioSozo the default browser; the MimeType line only lists it
in "Open with". `xdg-settings set default-web-browser AxioSozoDev.desktop` is
the user's own choice. Nothing outside $XDG_DATA_HOME is written.
"""
import argparse
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys

REMOTING_NAME = 'AxioSozoDev'
WM_CLASS = REMOTING_NAME
DESKTOP_FILE = REMOTING_NAME + '.desktop'
ICON_NAME = 'axiosozo-dev'
APP_NAME = 'axiosozo-dev'
ICON_DIR = Path('browser/chrome/icons/default')
MIME_TYPES = ('text/html', 'text/xml', 'application/xhtml+xml', 'application/vnd.mozilla.xul+xml',
              'x-scheme-handler/http', 'x-scheme-handler/https')


def data_home():
    value = os.environ.get('XDG_DATA_HOME', '')
    return Path(value) if value.startswith('/') else Path.home() / '.local/share'


def exec_path(executable):
    """Desktop Entry Exec quoting: reserved characters need double quotes."""
    text = str(executable)
    if re.search(r'[\s"\'\\><~|&;$*?#()`]', text):
        return '"' + text.replace('\\', '\\\\').replace('"', '\\"').replace('`', '\\`').replace('$', '\\$') + '"'
    return text


def render(executable):
    command = exec_path(Path(executable).resolve())
    return '\n'.join([
        '[Desktop Entry]',
        'Version=1.5',
        'Type=Application',
        'Name=AxioSozo Dev',
        'GenericName=Web Browser',
        'Comment=Browse the web with AxioSozo (development build)',
        f'Exec={command} %u',
        f'Icon={ICON_NAME}',
        'Terminal=false',
        'Categories=Network;WebBrowser;',
        'MimeType=' + ';'.join(MIME_TYPES) + ';',
        'StartupNotify=true',
        f'StartupWMClass={WM_CLASS}',
        'Actions=new-window;new-private-window;',
        '',
        '[Desktop Action new-window]',
        'Name=New Window',
        f'Exec={command} --new-window %u',
        '',
        '[Desktop Action new-private-window]',
        'Name=New Private Window',
        f'Exec={command} --private-window %u',
        '',
    ])


def icon_sources(app_directory):
    """{size: path} of the brand icons in an unpacked app (default<N>.png)."""
    found = {}
    folder = Path(app_directory) / ICON_DIR
    for path in sorted(folder.glob('default*.png')) if folder.is_dir() else []:
        match = re.fullmatch(r'default(\d+)\.png', path.name)
        if match:
            found[int(match.group(1))] = path
    return found


def resolve_executable(spec):
    if spec == 'fetched':
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        import storage
        current = json.loads((storage.BUILD_ROOT / 'linux-app' / 'current.json').read_text())
        spec = current['directory']
    path = Path(spec).resolve()
    if path.is_dir():
        path = path / APP_NAME if (path / APP_NAME).is_file() else path / APP_NAME / APP_NAME
    if not path.is_file() or not os.access(path, os.X_OK):
        raise SystemExit(f'NO_APP: {path} is not an executable AxioSozo app')
    return path


def planned(executable):
    root = data_home()
    files = {root / 'applications' / DESKTOP_FILE: render(executable)}
    for size, source in icon_sources(executable.parent).items():
        files[root / f'icons/hicolor/{size}x{size}/apps/{ICON_NAME}.png'] = source
    return files


def install(executable, dry_run=False):
    files = planned(executable)
    for target, content in files.items():
        if dry_run:
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        if isinstance(content, Path):
            shutil.copyfile(content, target)
        else:
            target.write_text(content)
    refreshed = []
    if not dry_run:
        for command in (['update-desktop-database', str(data_home() / 'applications')],
                        ['gtk-update-icon-cache', '-q', '-t', str(data_home() / 'icons/hicolor')]):
            if shutil.which(command[0]):
                refreshed.append({'command': command[0], 'exit': subprocess.run(command, capture_output=True).returncode})
    return {'status': 'PASS', 'dry_run': dry_run, 'written': [str(path) for path in files], 'refreshed': refreshed}


def uninstall(dry_run=False):
    root = data_home()
    targets = [root / 'applications' / DESKTOP_FILE, *sorted(root.glob(f'icons/hicolor/*/apps/{ICON_NAME}.png'))]
    removed = [str(path) for path in targets if path.is_file()]
    if not dry_run:
        for path in removed:
            Path(path).unlink()
    return {'status': 'PASS', 'dry_run': dry_run, 'removed': removed}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('command', choices=['render', 'install', 'uninstall'])
    parser.add_argument('--app', default='fetched', help='unpacked app directory, its executable, or "fetched"')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    if sys.platform != 'linux':
        print(json.dumps({'status': 'BLOCKED_ENV', 'reason': 'Linux desktop integration only'}))
        return 2
    if args.command == 'uninstall':
        print(json.dumps(uninstall(args.dry_run), indent=2))
        return 0
    executable = resolve_executable(args.app)
    if args.command == 'render':
        sys.stdout.write(render(executable))
        return 0
    print(json.dumps(install(executable, args.dry_run), indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
