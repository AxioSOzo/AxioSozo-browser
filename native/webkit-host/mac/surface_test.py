#!/usr/bin/env python3
"""Real WKWebView host Mach/IOSurface transport tests with a standalone Zen stand-in.

usage: surface_test.py <AxioWebKitMacHost-binary> <evidence-dir> [--seconds N] [--only a,b]

Compiles tests/surface_receiver.mm, serves a synthetic animated fixture (as /engine.html
and /engine.html?page=2) and runs the host in stream mode under several configurations
(engine-surface-v1 internal/external pacing at 60/120 Hz, a zero-copy in-use stand-in,
the AXCF pipe baseline and two negative cases). A PASS proves the native component and
wire protocol only, never E1/E2 inside Zen.
"""
import argparse
import contextlib
import ctypes
import http.server
import json
import os
from pathlib import Path
import shutil
import signal
import subprocess
import tempfile
import threading
import time

HERE = Path(__file__).resolve().parent

# rAF-animated bar (continuous change), a keydown-toggled probe block at CSS (0,0)-(200,200)
# for input latency, and the page number in the heading.
PAGE = '''<!doctype html><html lang="en"><meta charset="utf-8"><title>AxioSozo WebKit surface fixture</title>
<style>html,body{margin:0;background:#edf2f5;color:#163247;font:24px -apple-system,system-ui}
#probe{position:absolute;left:0;top:0;width:200px;height:200px;background:rgb(255,0,0)}
#bar{position:absolute;left:0;top:260px;width:120px;height:120px;background:#257d65;border-radius:16px}
h1{position:absolute;left:300px;top:20px;margin:0;font-size:34px}
#count{position:absolute;left:40px;top:420px}.badge{position:absolute;left:40px;top:470px;font:14px ui-monospace;color:#596772}</style>
<div id="probe"></div><h1>WebKit surface fixture, page PAGE_NUMBER</h1>
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
        if hosts != [f'127.0.0.1:{self.server.server_port}'] or self.path not in ('/engine.html', '/engine.html?page=2'):
            self.send_error(404 if hosts else 403)
            return
        data = PAGE.replace('PAGE_NUMBER', '2' if self.path.endswith('?page=2') else '1').encode()
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(data)


def build(out):
    receiver = out / 'surface-receiver'
    subprocess.run(['xcrun', 'clang++', '-std=c++20', '-fobjc-arc', '-O2', '-arch', 'arm64', '-mmacosx-version-min=14.5',
                    '-Wall', '-Wextra', str(HERE / 'tests/surface_receiver.mm'), '-framework', 'Foundation',
                    '-framework', 'CoreGraphics', '-framework', 'ImageIO', '-framework', 'IOSurface',
                    '-framework', 'UniformTypeIdentifiers', '-lbsm', '-o', str(receiver)], check=True)
    return receiver


def responsible_pid(pid):
    """launchd's responsible pid for an XPC service (libquarantine), or None."""
    try:
        function = ctypes.CDLL('/usr/lib/system/libquarantine.dylib').responsibility_get_pid_responsible_for_pid
    except (OSError, AttributeError):
        return None
    function.argtypes, function.restype = [ctypes.c_int], ctypes.c_int
    value = function(pid)
    return value if value > 0 else None


def webkit_helpers():
    done = subprocess.run(['/bin/ps', '-axo', 'pid=,comm='], capture_output=True, text=True)
    out = {}
    for line in done.stdout.splitlines():
        pid, _, comm = line.strip().partition(' ')
        if pid.isdigit() and comm.strip().rsplit('/', 1)[-1].startswith('com.apple.WebKit.'):
            out[int(pid)] = comm.strip().rsplit('/', 1)[-1]
    return out


def run_case(receiver, host, name, directory, origin, seconds, **options):
    case = directory / name
    case.mkdir()
    base = Path(os.environ.get('AXIOSOZO_BUILD_ROOT', str(HERE.parents[2] / '.local/build'))) / 'webkit'
    base.mkdir(parents=True, exist_ok=True)
    profile = Path(tempfile.mkdtemp(prefix='webkit-profile-surface-', dir=base))
    os.chmod(profile, 0o700)
    before = set(webkit_helpers())
    args = [str(receiver), '--host', str(host), '--profile', str(profile), '--evidence', str(case),
            '--origin', origin, '--seconds', str(seconds)]
    for key, value in options.items():
        args += ['--' + key.replace('_', '-'), str(value)]
    process = subprocess.Popen(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, start_new_session=True,
                               env={'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'TMPDIR': str(profile)})
    try:
        out, err = process.communicate(timeout=240)
        try:
            result = json.loads(out)
        except json.JSONDecodeError:
            result = dict(status='FAIL', failures=['receiver_output_invalid'], stdout=out.decode(errors='replace')[-2000:])
    except subprocess.TimeoutExpired:
        result = dict(status='FAIL', failures=['receiver_timeout_240s'])
        with contextlib.suppress(OSError):
            os.killpg(process.pid, signal.SIGKILL)
        err = b''
    (case / 'receiver-stderr.log').write_bytes(err or b'')
    # Process cleanup: no WebKit XPC helper launchd attributes to this host may outlive it
    # (other runner processes use WebKit too, so "new since start" is not ownership).
    # The host inherits our launchd responsibility; helpers that existed before the case are not its.
    owners = {result.get('host_pid'), responsible_pid(os.getpid())} - {None}
    attributed = responsible_pid(os.getpid()) is not None
    def ours():
        return {p: n for p, n in webkit_helpers().items() if p not in before and (not attributed or responsible_pid(p) in owners)}
    deadline = time.monotonic() + 8
    leaked = ours()
    while leaked and time.monotonic() < deadline:
        time.sleep(.2)
        leaked = ours()
    result['helper_attribution'] = 'launchd_responsible_pid' if attributed else 'new_since_case_start'
    result['orphan_helpers'] = [dict(pid=p, comm=n) for p, n in leaked.items()]
    if leaked:
        result['status'] = 'FAIL'
        result.setdefault('failures', []).append('webkit_helpers_outlived_host')
    shutil.rmtree(profile, ignore_errors=True)
    result['profile_removed'] = not profile.exists()
    (case / 'result.json').write_text(json.dumps(result, indent=2, sort_keys=True) + '\n')
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('host')
    parser.add_argument('evidence')
    parser.add_argument('--seconds', type=float, default=5)
    parser.add_argument('--only', help='comma-separated case names')
    args = parser.parse_args()
    directory = Path(args.evidence)
    directory.mkdir(parents=True, exist_ok=True)
    receiver = build(directory)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    origin = f'http://127.0.0.1:{server.server_port}'
    cases = {
        'surface-internal-60': dict(mode='surface', begin_frames='internal', rate=60),
        'surface-external-60': dict(mode='surface', begin_frames='external', rate=60),
        'surface-internal-120': dict(mode='surface', begin_frames='internal', rate=120),
        'surface-external-120': dict(mode='surface', begin_frames='external', rate=120),
        # Zero-copy stand-in: the receiver keeps each IOSurface's use count 40 ms past its
        # RELEASE, like Gecko's compositor; the host must never overwrite a surface in use.
        'surface-zero-copy-inuse-60': dict(mode='surface', begin_frames='external', rate=60, hold_use_ms=40),
        'pipe-60-baseline': dict(mode='pipe', rate=60),
        'negative-no-connected': dict(mode='surface', negative='no_connected'),
        'negative-bogus-release': dict(mode='surface', negative='bogus_release'),
    }
    wanted = set(args.only.split(',')) if args.only else set(cases)
    summary = dict(started_at=time.time(), engine='webkit', port='wkwebview', E1='NOT_TESTED', E2='NOT_TESTED', cases={})
    try:
        for name, options in cases.items():
            if name in wanted:
                summary['cases'][name] = run_case(receiver, Path(args.host).resolve(), name, directory, origin, args.seconds, **options)
                print(json.dumps(dict(case=name, status=summary['cases'][name].get('status'),
                                      failures=summary['cases'][name].get('failures'))), flush=True)
    finally:
        server.shutdown()
        server.server_close()
    statuses = [case.get('status') for case in summary['cases'].values()]
    summary['status'] = 'PASS' if statuses and all(s == 'PASS' for s in statuses) else 'FAIL'
    summary['finished_at'] = time.time()
    (directory / 'result.json').write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n')
    print(json.dumps(dict(status=summary['status'], evidence=str(directory))), flush=True)
    return 0 if summary['status'] == 'PASS' else 1


if __name__ == '__main__':
    raise SystemExit(main())
