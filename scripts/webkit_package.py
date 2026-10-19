#!/usr/bin/env python3
"""WebKit next to the Linux Zen app.

    python3 scripts/webkit_package.py host               # where Zen expects the WebKit host; its build record
    python3 scripts/webkit_package.py overlay-chrome --app DIR [--out overlay.json]

`host` reports <build root>/webkit/AxioWebKitHost (built by `native/webkit-host/probe.py
setup` against the pinned Debian 13 WPE packages) and the environment the app needs
(AXIOSOZO_WEBKIT_BINARY, pref axiosozo.engines.webkit.enabled). The host is not copied
into the app: it links the Debian WPE libraries and runs where those are installed.

`overlay-chrome` is a CI/TEST-ONLY step: it rewrites an unpacked prebuilt Linux app's
browser/omni.ja so its AxioSozo chrome files (chrome://browser/content/axiosozo/...)
are exactly this checkout's apps/browser/chrome, and drops precompiled script caches so
the new sources load. It changes no compiled code. Evidence produced this way is
labelled `chrome-overlay` with both commits; a full build of the same commit replaces it.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile

import storage

ROOT = Path(__file__).resolve().parents[1]
HOST = storage.BUILD_ROOT / 'webkit' / 'AxioWebKitHost'
MARKER = 'content/browser/axiosozo/AxioSozoStartup.mjs'
# Precompiled script caches inside omni.ja would keep serving the old chrome sources.
CACHE_PREFIXES = ('jsloader/', 'jssubloader/', 'startupCache/')


def emit(status, **fields):
    print(json.dumps(dict(component='webkit-package', status=status, **fields), indent=2), flush=True)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def git_commit():
    done = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', 'HEAD'], capture_output=True, text=True)
    return done.stdout.strip() or None


def host_report():
    record = HOST.parent / 'build.json'
    info = json.loads(record.read_text()) if record.is_file() else None
    present = HOST.is_file() and os.access(HOST, os.X_OK)
    return dict(host=str(HOST), present=present, build=info,
                environment={'AXIOSOZO_BUILD_ROOT': str(storage.BUILD_ROOT), 'AXIOSOZO_WEBKIT_BINARY': str(HOST)},
                prefs={'axiosozo.engines.webkit.enabled': True}, platform='linux-x86_64 (Debian 13 WPE pins)')


def overlay_chrome(app, out=None):
    import zen  # packaged_files(): the exact list the Zen build ships
    jar = Path(app) / 'browser' / 'omni.ja'
    if not jar.is_file():
        raise RuntimeError(f'NO_OMNI_JA: {jar}')
    files = zen.packaged_files()
    with zipfile.ZipFile(jar) as source:
        names = source.namelist()
        hits = [name for name in names if name.endswith(MARKER)]
        if len(hits) != 1:
            raise RuntimeError('AXIOSOZO_CHROME_NOT_FOUND_IN_OMNI_JA')
        prefix = hits[0][:-len('AxioSozoStartup.mjs')]
        wanted = {prefix + name: path.read_bytes() for name, path in files}
        replaced, added, unchanged, dropped = [], [], 0, []
        handle, temporary = tempfile.mkstemp(dir=jar.parent, prefix='.omni-overlay-')
        os.close(handle)
        try:
            with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_DEFLATED) as target:
                for info in source.infolist():
                    if info.filename.startswith(CACHE_PREFIXES):
                        dropped.append(info.filename)
                        continue
                    data = source.read(info.filename)
                    if info.filename in wanted:
                        fresh = wanted.pop(info.filename)
                        if fresh != data:
                            replaced.append({'name': info.filename, 'before': sha256(data), 'after': sha256(fresh)})
                        else:
                            unchanged += 1
                        data = fresh
                    target.writestr(info.filename, data, compress_type=zipfile.ZIP_DEFLATED)
                for name, data in sorted(wanted.items()):
                    target.writestr(name, data, compress_type=zipfile.ZIP_DEFLATED)
                    added.append({'name': name, 'after': sha256(data)})
            before = sha256(jar.read_bytes())
            os.replace(temporary, jar)
        finally:
            if os.path.exists(temporary):
                os.unlink(temporary)
    build_info = None
    for candidate in (Path(app).parent / 'axiosozo-build-info.json', Path(app) / 'axiosozo-build-info.json'):
        if candidate.is_file():
            build_info = json.loads(candidate.read_text())
    report = dict(label='chrome-overlay (TEST-ONLY: prebuilt Zen app, chrome JS from this checkout)',
                  app=str(app), omni_ja=str(jar), chrome_prefix=prefix, overlay_commit=git_commit(),
                  app_build_commit=(build_info or {}).get('repository_commit'), omni_ja_sha256_before=before,
                  omni_ja_sha256_after=sha256(jar.read_bytes()), replaced=replaced, added=added,
                  unchanged=unchanged, dropped_precompiled=len(dropped))
    if out:
        Path(out).write_text(json.dumps(report, indent=2) + '\n')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    sub.add_parser('host')
    overlay = sub.add_parser('overlay-chrome')
    overlay.add_argument('--app', required=True, help='unpacked app directory (contains axiosozo-dev and browser/omni.ja)')
    overlay.add_argument('--out')
    args = parser.parse_args()
    try:
        if args.command == 'host':
            report = host_report()
            emit('PASS' if report['present'] else 'BLOCKED_ENV', **report)
            return 0 if report['present'] else 2
        emit('PASS', **overlay_chrome(args.app, args.out))
        return 0
    except (RuntimeError, OSError, zipfile.BadZipFile) as error:
        emit('FAIL', reason=f'{type(error).__name__}: {error}')
        return 1


if __name__ == '__main__':
    sys.exit(main())
