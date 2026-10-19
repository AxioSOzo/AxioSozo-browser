#!/usr/bin/env python3
"""Run presenter/page.html in a real browser engine (headless) and save its JSON result.

The page measures the Zen presenter's pipe-fallback pixel path (the real bgraToRGBA,
extracted verbatim from apps/browser/chrome/CEFPresenter.sys.mjs, + putImageData) and
candidate replacements. Gecko numbers use the Firefox that ships on GitHub's ubuntu-24.04
runner image (not a new download; version recorded). Loopback only, throwaway profile.

usage: run_browser.py --browser firefox|chromium --binary PATH --out result.json [--iter 30]
"""
import argparse
import hashlib
import http.server
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
PRESENTER = ROOT / 'apps/browser/chrome/CEFPresenter.sys.mjs'
FIREFOX_PREFS = {
    'browser.shell.checkDefaultBrowser': False, 'browser.aboutwelcome.enabled': False,
    'datareporting.policy.dataSubmissionEnabled': False, 'toolkit.telemetry.reportingpolicy.firstRun': False,
    'app.update.disabledForTesting': True, 'browser.safebrowsing.malware.enabled': False,
    'browser.safebrowsing.phishing.enabled': False, 'network.connectivity-service.enabled': False,
    'browser.startup.homepage_override.mstone': 'ignore', 'extensions.update.enabled': False,
    'app.normandy.enabled': False, 'browser.newtabpage.enabled': False,
}


def extract_function(source, name):
    start = source.index(f'export function {name}(')
    depth, i = 0, source.index('{', start)
    while True:
        depth += {'{': 1, '}': -1}.get(source[i], 0)
        i += 1
        if depth == 0:
            return source[start + len('export '):i]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--browser', choices=['firefox', 'chromium'], required=True)
    parser.add_argument('--binary', required=True)
    parser.add_argument('--out', required=True)
    parser.add_argument('--iter', type=int, default=30)
    parser.add_argument('--timeout', type=int, default=300)
    args = parser.parse_args()
    function = extract_function(PRESENTER.read_text(), 'bgraToRGBA')
    page = (HERE / 'page.html').read_text().replace('/*BGRA_TO_RGBA*/', function).encode()
    done = threading.Event()
    box = {}

    class Handler(http.server.BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass

        def do_GET(self):
            if not self.path.startswith('/bench.html'):
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(page)))
            self.end_headers()
            self.wfile.write(page)

        def do_POST(self):
            body = self.rfile.read(int(self.headers.get('Content-Length', 0)))
            box['result'] = json.loads(body)
            self.send_response(204)
            self.end_headers()
            done.set()

    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/bench.html?iter={args.iter}'
    profile = Path(tempfile.mkdtemp(prefix='presenter-bench-'))
    version = subprocess.run([args.binary, '--version'], capture_output=True, text=True, timeout=60).stdout.strip()
    if args.browser == 'firefox':
        (profile / 'user.js').write_text(''.join(f'user_pref({json.dumps(k)}, {json.dumps(v)});\n' for k, v in FIREFOX_PREFS.items()))
        command = [args.binary, '--headless', '--no-remote', '--profile', str(profile), url]
    else:
        command = [args.binary, '--headless=new', f'--user-data-dir={profile}', '--no-first-run', '--no-default-browser-check', url]
    env = dict(os.environ, HOME=str(profile), MOZ_HEADLESS='1')
    started = time.monotonic()
    process = subprocess.Popen(command, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, env=env, start_new_session=True)
    ok = done.wait(args.timeout)
    process.terminate()
    try:
        _, stderr = process.communicate(timeout=20)
    except subprocess.TimeoutExpired:
        process.kill()
        _, stderr = process.communicate()
    server.shutdown()
    shutil.rmtree(profile, ignore_errors=True)
    result = box.get('result') or {'error': 'no result within %d s' % args.timeout}
    result.update(browser=args.browser, browser_version=version, wall_s=round(time.monotonic() - started, 1),
                  bgraToRGBA_source_sha256=hashlib.sha256(function.encode()).hexdigest(),
                  source=str(PRESENTER.relative_to(ROOT)), stderr_tail=stderr.decode(errors='replace')[-1500:] if not ok else None)
    result['status'] = 'PASS' if ok and 'error' not in result else 'FAIL'
    Path(args.out).write_text(json.dumps(result, indent=1) + '\n')
    print(json.dumps(dict(component='presenter-bench', browser=args.browser, status=result['status'], out=args.out)))
    return 0 if result['status'] == 'PASS' else 2


if __name__ == '__main__':
    sys.exit(main())
