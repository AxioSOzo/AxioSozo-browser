#!/usr/bin/env python3
"""End-to-end WebKit-in-Zen GUI test on Linux (Xvfb): the GUI harness of
scripts/gui_test.py with one more scenario, `roundtrip`:

    roundtrip:     Gecko tab with the loopback fixture → Zen tab menu "Open in WebKit" →
                   WebKit frames in Zen's own content area → type, click, the page's link to
                   page 2, Zen's toolbar Back, wheel-scroll → tab menu "Open in Firefox" → the
                   Gecko tab again, no WebKit host left. (No address-bar typing: the Linux
                   parent crashes on Return after it, owned by cloud/linux-platform.)
    host_failure:  the WebKit host is killed (SIGKILL) while presenting: the same Gecko tab
                   (same content process, same address) is shown again and takes typing.
    three_engines: optional; Gecko → WebKit → Gecko → Chromium → Gecko on one tab when the
                   CEF host is built in the same build root. Reported, never counted in the
                   exit status (BLOCKED_ENV without the CEF host).

    python3 scripts/webkit_zen_e2e.py --app PATH [--evidence-dir DIR] [--scenario launch,chrome,roundtrip,host_failure]

Needs the Linux app and <build root>/webkit/AxioWebKitHost (native/webkit-host/probe.py
setup, Debian 13 pins). Exit codes and JSON as gui_test.py: 0 PASS, 1 FAIL, 2 BLOCKED_ENV.
Test-only switches are exactly the harness's own plus the WebKit enable pref.
"""
import argparse
import datetime
import json
from pathlib import Path
import subprocess
import sys

import storage
import gui_test
from gui_engines import EngineUnavailable
from gui_engines.webkit import ENGINE as WEBKIT

SCENARIOS = ('launch', 'chrome', 'roundtrip', 'host_failure', 'three_engines')
OPTIONAL = ('three_engines',)


class WebKitHarness(gui_test.Harness):
    def scenario_roundtrip(self):
        if self.result.get('engine_prepare', {}).get('status') == 'BLOCKED_ENV':
            raise EngineUnavailable(self.result['engine_prepare']['reason'])
        return WEBKIT.roundtrip(self)

    def scenario_host_failure(self):
        if self.result.get('engine_prepare', {}).get('status') == 'BLOCKED_ENV':
            raise EngineUnavailable(self.result['engine_prepare']['reason'])
        return WEBKIT.host_failure(self)

    def scenario_three_engines(self):
        if self.result.get('engine_prepare', {}).get('status') == 'BLOCKED_ENV':
            raise EngineUnavailable(self.result['engine_prepare']['reason'])
        return WEBKIT.three_engines(self)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--app', default='auto')
    parser.add_argument('--scenario', default=','.join(SCENARIOS))
    parser.add_argument('--evidence-dir')
    parser.add_argument('--size', default='1280x800')
    parser.add_argument('--timeout', type=float, default=45)
    parser.add_argument('--launch-timeout', type=float, default=180)
    parser.add_argument('--hold', type=int, default=0)
    parser.add_argument('--screenshot')
    args = parser.parse_args()
    scenarios = [item for item in args.scenario.split(',') if item]
    if any(item not in SCENARIOS for item in scenarios):
        parser.error('--scenario takes: ' + ','.join(SCENARIOS))
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    evidence = Path(args.evidence_dir).resolve() if args.evidence_dir else storage.BUILD_ROOT / 'gui-evidence' / f'webkit-roundtrip-{stamp}'
    harness = WebKitHarness(args, WEBKIT, evidence)
    harness.result['harness'] = 'axiosozo-linux-gui+webkit-roundtrip'
    harness.result['test_only_switches'].append('profile pref axiosozo.engines.webkit.enabled=true')
    code = 0
    try:
        if not storage.LINUX:
            raise gui_test.Blocked('Linux only (Xvfb, WPE WebKit host)')
        storage.ensure()
        evidence.mkdir(parents=True, exist_ok=True)
        executable, app_info = gui_test.resolve_app(args.app)
        harness.run(executable, app_info, scenarios)
        statuses = [item['status'] for name, item in harness.result['scenarios'].items() if name not in OPTIONAL]
        harness.result['optional_scenarios'] = {name: harness.result['scenarios'][name]['status']
                                                for name in OPTIONAL if name in harness.result['scenarios']}
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
    harness.result['status'] = status
    harness.result['evidence_dir'] = str(evidence)
    if evidence.is_dir():
        (evidence / 'result.json').write_text(json.dumps(harness.result, indent=2) + '\n')
    print(json.dumps(harness.result, indent=2), flush=True)
    return code


if __name__ == '__main__':
    sys.exit(main())
