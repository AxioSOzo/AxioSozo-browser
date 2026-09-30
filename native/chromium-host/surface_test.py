#!/usr/bin/env python3
"""Real CEF Mach/IOSurface transport tests with a standalone Zen stand-in.

Compiles tests/surface_receiver.mm, serves a synthetic animated fixture and runs
the signed host in stream mode under several configurations. A PASS proves the
native component and wire protocol only, never E1/E2 inside Zen.
"""
import argparse
import contextlib
import http.server
import importlib.util
import json
import os
from pathlib import Path
import signal
import subprocess
import tempfile
import threading
import time

spec = importlib.util.spec_from_file_location('probe', Path(__file__).with_name('probe.py'))
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)

HERE = Path(__file__).resolve().parent
RECEIVER = probe.BASE / 'surface-receiver'

# Synthetic page: a rAF-animated bar (continuous damage), a keydown-toggled
# probe block at CSS (0,0)-(200,200) for input latency, and a <select> whose
# dropdown is a real CEF PET_POPUP widget.
PAGE = b'''<!doctype html><html lang="en"><meta charset="utf-8"><title>AxioSozo surface fixture</title>
<style>html,body{margin:0;background:#edf2f5;color:#163247;font:24px system-ui}
#probe{position:absolute;left:0;top:0;width:200px;height:200px;background:rgb(255,0,0)}
#bar{position:absolute;left:0;top:260px;width:120px;height:120px;background:#257d65;border-radius:16px}
select{position:absolute;left:300px;top:140px;width:120px;height:40px;font:20px system-ui}
h1{position:absolute;left:300px;top:20px;margin:0;font-size:34px}
#count{position:absolute;left:40px;top:420px}.badge{position:absolute;left:40px;top:470px;font:14px ui-monospace;color:#596772}</style>
<div id="probe"></div><h1>Surface transport fixture</h1>
<select><option>One</option><option>Two</option><option>Three</option><option>Four</option></select>
<div id="bar"></div><p id="count">rAF 0</p><p class="badge">SYNTHETIC LOCAL FIXTURE - NO ACCOUNTS</p>
<script>let n=0,k=0;const bar=document.querySelector('#bar'),count=document.querySelector('#count'),probe=document.querySelector('#probe');
function tick(t){n++;bar.style.transform=`translateX(${(t*0.4)%700}px)`;count.textContent=`rAF ${n}`;requestAnimationFrame(tick);}
requestAnimationFrame(tick);
addEventListener('keydown',e=>{if(e.key==='Escape')return;k++;probe.style.background=k%2?'rgb(0,0,255)':'rgb(255,0,0)';document.title='keys='+k;});</script></html>'''


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


def build():
    probe.host_check()
    for directory in [probe.BASE / 'tmp', probe.BASE / 'clang-cache']:
        directory.mkdir(parents=True, exist_ok=True)
    probe.run_command([probe.EXTERNAL, 'env', 'TMPDIR=' + str(probe.BASE / 'tmp'),
                       'CLANG_MODULE_CACHE_PATH=' + str(probe.BASE / 'clang-cache'),
                       'xcrun', 'clang++', '-std=c++20', '-fobjc-arc', '-arch', 'arm64', '-mmacosx-version-min=14.5',
                       '-Wall', '-Wextra', HERE / 'tests/surface_receiver.mm',
                       '-framework', 'Foundation', '-framework', 'CoreGraphics', '-framework', 'ImageIO',
                       '-framework', 'IOSurface', '-framework', 'UniformTypeIdentifiers', '-lbsm', '-o', RECEIVER])


def run_case(name, directory, origin, seconds, **options):
    case = directory / name
    case.mkdir()
    profile = Path(tempfile.mkdtemp(prefix='cef-profile-surface-', dir=probe.BASE))
    os.chmod(profile, 0o700)
    args = [str(RECEIVER), '--host', str(probe.BINARY), '--profile', str(profile), '--evidence', str(case),
            '--origin', origin, '--seconds', str(seconds)]
    for key, value in options.items():
        args += ['--' + key.replace('_', '-'), str(value)]
    process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True,
                               env={'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'TMPDIR': str(profile)})
    try:
        out, err = process.communicate(timeout=180)
        try:
            result = json.loads(out)
        except json.JSONDecodeError:
            result = dict(status='FAIL', failures=['receiver_output_invalid'], stdout=out.decode(errors='replace')[-2000:])
    except subprocess.TimeoutExpired:
        result = dict(status='BLOCKED_ENV', failures=['receiver_timeout_180s'])
        with contextlib.suppress(subprocess.TimeoutExpired, OSError):
            subprocess.run(['/usr/bin/sample', str(process.pid), '1', '1', '-file', str(case / 'receiver.sample.txt')],
                           capture_output=True, timeout=5)
        err = b''
    finally:
        probe.cleanup_group(process)
    (case / 'receiver-stderr.log').write_bytes(err or b'')
    result['profile_removed'] = probe.remove_created_profile(profile, process, prefix='cef-profile-surface-')
    # Known environment gate (README "Keychain gate"): Chromium's teardown reads
    # "Chromium Safe Storage" for this rebuilt ad hoc binary, macOS waits for the
    # user, and Chromium's 10 s teardown watchdog exits 2. Classified only when
    # the owned teardown sample proves the Keychain wait; never approved here.
    sample = case / 'host-teardown.sample.txt'
    exit_failures = {'host_exit_nonzero', 'bogus_release_exit_code'}
    failures = set(result.get('failures') or [])
    if (result.get('status') == 'FAIL' and failures and failures <= exit_failures
            and result.get('host_exit_code') == 2 and sample.exists()
            and 'SecKeychainItemCopyContent' in sample.read_text(errors='replace')):
        result['status'] = 'PASS_TEARDOWN_KEYCHAIN_BLOCKED'
        result['teardown'] = 'BLOCKED_KEYCHAIN: SecItemCopyMatching/SecKeychainItemCopyContent during cef_shutdown'
    if not result['profile_removed']:
        result['status'] = 'FAIL'
        result.setdefault('failures', []).append('profile_not_removed')
    (case / 'result.json').write_text(json.dumps(result, indent=2, sort_keys=True) + '\n')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--seconds', type=float, default=5)
    parser.add_argument('--only', help='comma-separated case names')
    args = parser.parse_args()
    probe.check()
    build()
    directory = Path(tempfile.mkdtemp(prefix='cef-surface-', dir=probe.EVIDENCE))
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    cases = {
        'surface-internal-60': dict(mode='surface', begin_frames='internal', rate=60),
        'surface-external-60': dict(mode='surface', begin_frames='external', rate=60),
        'surface-internal-120': dict(mode='surface', begin_frames='internal', rate=120),
        'surface-external-120': dict(mode='surface', begin_frames='external', rate=120),
        'pipe-60-baseline': dict(mode='pipe', rate=60),
        'negative-no-connected': dict(mode='surface', negative='no_connected'),
        'negative-bogus-release': dict(mode='surface', negative='bogus_release'),
    }
    wanted = set(args.only.split(',')) if args.only else set(cases)
    summary = dict(started_at=time.time(), cef=probe.VERSION, E1='NOT_TESTED', E2='NOT_TESTED', cases={})
    previous = signal.signal(signal.SIGTERM, lambda *_: (_ for _ in ()).throw(KeyboardInterrupt()))
    try:
        for name, options in cases.items():
            if name in wanted:
                summary['cases'][name] = run_case(name, directory, origin, args.seconds, **options)
                print(json.dumps(dict(case=name, status=summary['cases'][name].get('status'),
                                      failures=summary['cases'][name].get('failures'))), flush=True)
    finally:
        server.shutdown()
        server.server_close()
        signal.signal(signal.SIGTERM, previous)
    statuses = [case.get('status') for case in summary['cases'].values()]
    if statuses and all(s == 'PASS' for s in statuses):
        summary['status'] = 'PASS'
    elif statuses and all(s in ('PASS', 'PASS_TEARDOWN_KEYCHAIN_BLOCKED') for s in statuses):
        summary['status'] = 'PASS_TEARDOWN_KEYCHAIN_BLOCKED'
    else:
        summary['status'] = 'BLOCKED_ENV' if 'BLOCKED_ENV' in statuses else 'FAIL'
    summary['finished_at'] = time.time()
    (directory / 'result.json').write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n')
    print(json.dumps(dict(status=summary['status'], evidence=str(directory))), flush=True)
    return 0 if summary['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
