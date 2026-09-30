#!/usr/bin/env python3
"""Headless registration smoke for the engine-view XPCOM component.

Runs xpcshell_smoke.js inside the built AxioSozo Dev app's own XUL (the
bundle's `-xpcshell` mode: parent process, no profile, no window). HOME and
TMPDIR point at a fresh throwaway directory on the project build volume, so no
personal profile, keychain item or credential is read. Run it as:

  /Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- \
      python3 apps/browser/native/engine-view/tests/run_smoke.py

Exit 0 only when every check in the script passed in this very run.
"""
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
BUILD_ROOT = Path(os.environ.get('AXIOSOZO_BUILD_ROOT', '/Volumes/AxioSozoBuild'))
APP = BUILD_ROOT / 'zen/obj/dist/AxioSozo Dev.app'
MARKER = 'AXIO_ENGINE_VIEW_SMOKE '


def main():
    executable = APP / 'Contents/MacOS/axiosozo-dev'
    resources = APP / 'Contents/Resources'
    if not executable.is_file():
        print(json.dumps({'status': 'BLOCKED_ENV', 'reason': 'APP_EXECUTABLE_MISSING', 'path': str(executable)}))
        return 20
    (BUILD_ROOT / 'tmp').mkdir(exist_ok=True)
    scratch = Path(tempfile.mkdtemp(prefix='engine-view-smoke-', dir=BUILD_ROOT / 'tmp'))
    try:
        home = scratch / 'home'
        home.mkdir(mode=0o700)
        env = {'HOME': str(home), 'TMPDIR': str(scratch) + '/', 'PATH': '/usr/bin:/bin',
               'MOZ_HEADLESS': '1', 'MOZ_CRASHREPORTER_DISABLE': '1',
               'MOZ_DISABLE_NONLOCAL_CONNECTIONS': '1',
               'MOZ_LOG': 'AxioEngineView:5'}
        command = [str(executable), '-xpcshell', '-g', str(resources), '-a', str(resources / 'browser'),
                   str(HERE / 'xpcshell_smoke.js')]
        result = subprocess.run(command, env=env, cwd=scratch, capture_output=True, text=True, timeout=120)
    finally:
        shutil.rmtree(scratch, ignore_errors=True)
    lines = [line[len(MARKER):] for line in (result.stdout + result.stderr).splitlines() if line.startswith(MARKER)]
    if not lines:
        print(json.dumps({'status': 'FAIL', 'reason': 'NO_SMOKE_RESULT', 'exit_code': result.returncode,
                          'stdout_tail': result.stdout[-2000:], 'stderr_tail': result.stderr[-4000:]}, indent=2))
        return 1
    report = json.loads(lines[-1])
    report['exit_code'] = result.returncode
    report['executable'] = str(executable)
    print(json.dumps(report, indent=2))
    return 0 if report.get('status') == 'PASS' and result.returncode == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
