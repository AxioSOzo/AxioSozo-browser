#!/usr/bin/env python3
"""macOS regression lane for GitHub-hosted macos-15 (arm64) runners.

The same gate list runs against two checkouts of the repository: the branch under
test ("head") and the pre-program baseline `dev` ("base"). `compare` then tells
cloud-introduced regressions (PASS on base, FAIL on head) from pre-existing
failures (FAIL on both). See docs/MACOS_CI.md.

  macos_ci.py node --dest DIR                      pinned Node (upstreams.lock.json ci_node)
  macos_ci.py run --checkout DIR --out DIR --side head|base [--only a,b]
  macos_ci.py compare --head DIR --base DIR --out DIR

`run` never needs the owner's macOS layout: gates that build native code use the
macOS CI build root (AXIOSOZO_MACOS_CI=1 + AXIOSOZO_BUILD_ROOT, see
scripts/storage.py), which the scripts refuse wherever that layout exists.
No provider client, login UI, live model call, credential or personal profile is
touched by any gate. Python 3.9 compatible (/usr/bin/python3 on macOS).
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time

LANE = Path(__file__).resolve().parents[1]
# Statuses: PASS, FAIL, BLOCKED_ENV (environment cannot run it), ABSENT (gate's
# entrypoint does not exist in this checkout), EXPECTED_NONZERO (doctor).
OK = {'PASS', 'EXPECTED_NONZERO'}


def sha256(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as source:
        for chunk in iter(lambda: source.read(1 << 20), b''):
            digest.update(chunk)
    return digest.hexdigest()


def node(dest):
    """Pinned Node for this host from upstreams.lock.json `ci_node` (sha256-checked)."""
    lock = json.loads((LANE / 'upstreams.lock.json').read_text())['ci_node']
    machine = platform.machine().lower()
    key = ('darwin-' if sys.platform == 'darwin' else 'linux-') + machine
    pin = lock.get(key)
    if not pin:
        raise SystemExit('UNSUPPORTED_HOST: no pinned CI Node for ' + key)
    dest = Path(dest)
    target = dest / ('node-' + lock['version'])
    marker = target / '.axiosozo-sha256'
    if not (marker.is_file() and marker.read_text().strip() == pin['sha256']):
        dest.mkdir(parents=True, exist_ok=True)
        archive = dest / pin['filename']
        subprocess.run(['curl', '--fail', '--location', '--retry', '3', '--silent', '--show-error',
                        '--output', str(archive), pin['url']], check=True)
        if sha256(archive) != pin['sha256']:
            archive.unlink()
            raise SystemExit('DOWNLOAD_CHECKSUM_MISMATCH: ' + pin['url'])
        if target.exists():
            shutil.rmtree(target)
        target.mkdir()
        subprocess.run(['tar', '-xJf', str(archive), '--strip-components=1', '-C', str(target)], check=True)
        marker.write_text(pin['sha256'] + '\n')
    print(target / 'bin')


class Lane:
    def __init__(self, checkout, out, side, only):
        self.checkout = Path(checkout).resolve()
        self.out = Path(out).resolve()
        self.side = side
        self.only = set(only.split(',')) if only else None
        self.logs = self.out / 'logs'
        self.logs.mkdir(parents=True, exist_ok=True)
        self.results = {}
        # Outside both checkouts: storage.py refuses build roots inside tracked source.
        self.build = Path(os.environ.get('AXIOSOZO_BUILD_ROOT') or
                          tempfile.mkdtemp(prefix='axiosozo-ci-')).resolve()
        self.build.mkdir(parents=True, exist_ok=True)
        self.target = self.build / 'cargo-target'
        self.core = self.target / 'debug' / 'browser-core'

    def env(self, ci_root=False, extra=None):
        """Plain gates run like the owner's shell would (no build root override);
        `ci_root` gates get the explicit macOS CI build root."""
        env = {key: value for key, value in os.environ.items()
               if key not in ('AXIOSOZO_BUILD_ROOT', 'AXIOSOZO_MACOS_CI')}
        env.update(PYTHONDONTWRITEBYTECODE='1', CARGO_TARGET_DIR=str(self.target),
                   AXIOSOZO_CORE_BINARY=str(self.core))
        if ci_root:
            env.update(AXIOSOZO_MACOS_CI='1', AXIOSOZO_BUILD_ROOT=str(self.build))
        env.update(extra or {})
        return env

    def wanted(self, name):
        return self.only is None or name in self.only or any(name.startswith(p.rstrip('*'))
                                                             for p in self.only if p.endswith('*'))

    def gate(self, name, argv, requires=(), ci_root=False, timeout=600, expect=(0,), extra=None,
             classify=None):
        if not self.wanted(name):
            return None
        missing = [path for path in requires if not (self.checkout / path).exists()]
        if missing:
            self.results[name] = dict(status='ABSENT', missing=missing)
            print(f'[{self.side}] {name}: ABSENT ({", ".join(missing)})', flush=True)
            return None
        log = self.logs / (re.sub(r'[^A-Za-z0-9_.-]+', '_', name) + '.log')
        started = time.monotonic()
        print(f'[{self.side}] {name}: {" ".join(map(str, argv))}', flush=True)
        try:
            with log.open('wb') as handle:
                # Own process group: a timeout stops every descendant, not only the leader.
                process = subprocess.Popen([str(item) for item in argv], cwd=self.checkout,
                                           env=self.env(ci_root, extra), stdout=handle,
                                           stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL,
                                           start_new_session=True)
                try:
                    code = process.wait(timeout=timeout)
                except subprocess.TimeoutExpired:
                    code = 'timeout'
                    for sig in (signal.SIGTERM, signal.SIGKILL):
                        try:
                            os.killpg(process.pid, sig)
                        except ProcessLookupError:
                            break
                        try:
                            process.wait(timeout=10)
                            break
                        except subprocess.TimeoutExpired:
                            pass
                    with log.open('a') as note:
                        note.write(f'\nLANE: timeout after {timeout} s; process group stopped\n')
                finally:
                    # Leftover members of the group (daemonized helpers) never outlive a gate.
                    try:
                        os.killpg(process.pid, signal.SIGKILL)
                    except (ProcessLookupError, PermissionError):
                        pass
        except OSError as error:
            log.write_text(f'cannot start: {error}\n')
            code = 'oserror'
        text = log.read_text(errors='replace')
        status = 'PASS' if code in expect and code == 0 else 'EXPECTED_NONZERO' if code in expect else 'FAIL'
        if status in OK and 'Traceback (most recent call last)' in text:
            status = 'FAIL'
        if classify:
            status = classify(code, text, status)
        elif status == 'FAIL' and re.search(r'^BLOCKED_ENV|"status": ?"BLOCKED_ENV"', text, re.M):
            status = 'BLOCKED_ENV'
        self.results[name] = dict(status=status, exit=code, seconds=round(time.monotonic() - started, 1),
                                  log=str(log.relative_to(self.out)), tail=text[-1500:])
        print(f'[{self.side}] {name}: {status} (exit {code}, {self.results[name]["seconds"]} s)', flush=True)
        # Incremental: a job killed by its time limit still leaves every finished gate.
        write_results(self.out, self.side, self.checkout, self.results, quiet=True)
        return status

    def tests(self, pattern):
        return sorted(path.relative_to(self.checkout) for path in self.checkout.glob(pattern)
                      if not path.name.startswith('._'))

    def run(self):
        py = '/usr/bin/python3'  # the owner's ./dev interpreter on macOS
        node = shutil.which('node') or 'node'
        # 1. ./dev doctor: read-only, documented NOT-READY exit 2; never a traceback.
        self.gate('dev-doctor', ['./dev', 'doctor'], requires=['dev'], expect=(0, 2), timeout=300)
        # 2. Rust (coordinator workspace).
        self.gate('cargo-fmt', ['cargo', 'fmt', '--all', '--', '--check'], requires=['Cargo.toml'])
        self.gate('cargo-clippy', ['cargo', 'clippy', '--locked', '--workspace', '--all-targets', '--', '-D', 'warnings'],
                  requires=['Cargo.toml'], timeout=1800)
        self.gate('cargo-test', ['cargo', 'test', '--locked', '--workspace'], requires=['Cargo.toml'], timeout=1800)
        self.gate('cargo-build', ['cargo', 'build', '--locked', '--workspace'], requires=['Cargo.toml'], timeout=1800)
        # 3. Python: script syntax under the owner's interpreter, then every unittest module.
        self.gate('python-compile', [py, '-c', COMPILE_ALL], requires=['scripts'])
        for path in self.tests('tests/test_*.py'):
            self.gate('python:' + path.name, [py, '-m', 'unittest', 'discover', '-s', 'tests', '-p', path.name, '-v'],
                      requires=[str(path)], timeout=600)
        for path in ['apps/browser/tests/test_bootstrap.py', 'tools/axiosozo-project-reader/project_reader_test.py',
                     'tools/axiosozo-arrival/arrival_lsof_test.py', 'tools/axiosozo-manifest/manifest_accept_test.py']:
            self.gate('python:' + path, [py, '-I', '-S', '-B', path] if path.startswith('tools/') else [py, path],
                      requires=[path], timeout=600)
        # 4. Node suites, one file per gate so a regression names its file.
        for pattern in ['apps/browser/tests/*.test.mjs', 'packages/contexts/tests/*.test.mjs',
                        'packages/provider-host/tests/*.test.mjs']:
            for path in self.tests(pattern):
                self.gate('node:' + str(path), [node, '--test', '--test-timeout=120000', path],
                          requires=[str(path)], timeout=300)
        # 5. Provider host on macOS: native Keychain/broker build, then negative-only
        #    Keychain tests (empty search list, invalid input) and the Seatbelt broker test.
        cli = 'packages/provider-host/cli.mjs'
        for command in ['check', 'setup', 'keychain-negative-test', 'sandbox-test']:
            self.gate('provider:' + command, [node, cli, command], requires=[cli], ci_root=True, timeout=600)
        # 6. CEF macOS host: pinned macosarm64 CEF, compile + ad hoc sign, native tests.
        probe = 'native/chromium-host/probe.py'
        self.gate('cef:setup', [py, probe, 'setup'], requires=[probe], ci_root=True, timeout=2400)
        self.gate('cef:check', [py, probe, 'check'], requires=[probe], ci_root=True)
        self.gate('cef:test-native', [py, probe, 'test-native'], requires=[probe], ci_root=True)
        self.gate('cef:test_probe.py', [py, 'native/chromium-host/test_probe.py'],
                  requires=['native/chromium-host/test_probe.py'], ci_root=True)
        # Portable units shared with the macOS host (transport.hpp is linked into it).
        cef_tests = self.build / 'cef-units'
        cef_tests.mkdir(exist_ok=True)
        for unit in ['transport_damage_test', 'core_test']:
            source = f'native/chromium-host/tests/{unit}.cc'
            self.gate('cef:' + unit, ['/bin/sh', '-c',
                      f'xcrun clang++ -std=c++20 -Wall -Wextra -I native/chromium-host {source} -o "{cef_tests}/{unit}"'
                      f' && "{cef_tests}/{unit}"'], requires=[source], timeout=300)
        # Real Chromium OSR on the runner (headless session): component evidence only.
        self.gate('cef:stream_test.py', [py, 'native/chromium-host/stream_test.py'],
                  requires=['native/chromium-host/stream_test.py'], ci_root=True, timeout=900)
        self.gate('cef:surface_test.py', [py, 'native/chromium-host/surface_test.py', '--seconds', '3'],
                  requires=['native/chromium-host/surface_test.py'], ci_root=True, timeout=900)
        # 7. WebKit: engine-neutral core (fake host) and the macOS WKWebView scaffold.
        webkit = self.build / 'webkit'
        webkit.mkdir(exist_ok=True)
        self.gate('webkit:test_transport', ['/bin/sh', '-c',
                  f'xcrun clang++ -std=c++20 -Wall -Wextra native/webkit-host/test_transport.cc -o "{webkit}/test_transport"'
                  f' && "{webkit}/test_transport"'], requires=['native/webkit-host/test_transport.cc'])
        self.gate('webkit:test_json', ['/bin/sh', '-c',
                  f'xcrun clang++ -std=c++20 -Wall -Wextra -I native/webkit-host native/webkit-host/tests/test_json.cc'
                  f' -o "{webkit}/test_json" && "{webkit}/test_json"'], requires=['native/webkit-host/tests/test_json.cc'])
        self.gate('webkit:core_test', ['/bin/sh', '-c',
                  f'xcrun clang++ -std=c++20 -Wall -Wextra -I native/webkit-host native/webkit-host/tests/fake_host.cc'
                  f' -o "{webkit}/fake_host" && {py} native/webkit-host/tests/core_test.py "{webkit}/fake_host"'],
                  requires=['native/webkit-host/tests/core_test.py'], timeout=600)
        self.gate('webkit:mac-build', ['xcrun', 'clang++', '-std=c++20', '-fobjc-arc', '-Wall', '-Wextra',
                  '-framework', 'Cocoa', '-framework', 'WebKit', 'native/webkit-host/mac/host_mac.mm',
                  '-o', webkit / 'AxioWebKitMacHost'], requires=['native/webkit-host/mac/host_mac.mm'])
        for part in ['stream', 'input', 'security']:
            self.gate('webkit:mac-' + part, [py, 'native/webkit-host/mac/mac_test.py', webkit / 'AxioWebKitMacHost', part],
                      requires=['native/webkit-host/mac/mac_test.py'], timeout=300)
        # 8. The whole ./dev check / ./dev test through the macOS CI build root.
        #    Informational: both need a built Zen and owner-only fixtures for a full PASS.
        self.gate('dev-setup-cargo-provider', ['./dev', 'setup', '--only', 'cargo,provider'], requires=['dev'],
                  ci_root=True, timeout=1200)
        self.gate('dev-check', ['./dev', 'check'], requires=['dev'], ci_root=True, timeout=1500)
        self.gate('dev-test', ['./dev', 'test'], requires=['dev'], ci_root=True, timeout=2400)
        return self.results


COMPILE_ALL = r'''
import pathlib, sys
bad = 0
for pattern in ("scripts/*.py", "scripts/*/*.py", "tests/test_*.py", "native/*/*.py", "native/*/*/*.py", "tools/*/*.py"):
    for path in sorted(pathlib.Path(".").glob(pattern)):
        if path.name.startswith("._"):
            continue
        try:
            compile(path.read_bytes(), str(path), "exec")
        except SyntaxError as error:
            bad += 1
            print("SYNTAX", path, error.lineno, error.msg)
print(sys.version)
sys.exit(1 if bad else 0)
'''


def write_results(out, side, checkout, results, quiet=False):
    head = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=checkout, capture_output=True, text=True).stdout.strip()
    counts = {}
    for item in results.values():
        counts[item['status']] = counts.get(item['status'], 0) + 1
    data = dict(side=side, commit=head, platform=platform.platform(), machine=platform.machine(),
                python=sys.version.split()[0], counts=counts, gates=results)
    (Path(out) / 'results.json').write_text(json.dumps(data, indent=2) + '\n')
    lines = [f'{side} {head[:12]} {platform.platform()}: ' + ', '.join(f'{k} {v}' for k, v in sorted(counts.items()))]
    lines += [f'  {item["status"]:<16} {name}' for name, item in results.items()]
    (Path(out) / 'summary.txt').write_text('\n'.join(lines) + '\n')
    if not quiet:
        print('\n'.join(lines), flush=True)


def compare(head_dir, base_dir, out):
    def load(directory):
        path = Path(directory) / 'results.json'
        # A lane that died before its first gate left nothing: every gate is NOT_RUN.
        return json.loads(path.read_text()) if path.is_file() else dict(commit='missing-results', gates={})
    head, base = load(head_dir), load(base_dir)
    rows = []
    for name in list(dict.fromkeys([*head['gates'], *base['gates']])):
        h = head['gates'].get(name, {}).get('status', 'NOT_RUN')
        b = base['gates'].get(name, {}).get('status', 'NOT_RUN')
        if h in OK and b in OK:
            verdict = 'OK'
        elif h in OK:
            verdict = 'FIXED_OR_NEW_PASS'
        elif h == 'ABSENT':
            verdict = 'REMOVED' if b != 'ABSENT' else 'ABSENT'
        elif b in OK:
            verdict = 'REGRESSION'
        elif b == 'ABSENT':
            verdict = 'NEW_GATE_NOT_PASSING'
        else:
            verdict = 'PRE_EXISTING'
        rows.append(dict(gate=name, head=h, base=b, verdict=verdict))
    summary = {}
    for row in rows:
        summary[row['verdict']] = summary.get(row['verdict'], 0) + 1
    data = dict(head_commit=head['commit'], base_commit=base['commit'], summary=summary, rows=rows)
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    (out / 'compare.json').write_text(json.dumps(data, indent=2) + '\n')
    lines = [f'head {head["commit"][:12]} vs base (dev) {base["commit"][:12]}: '
             + ', '.join(f'{k} {v}' for k, v in sorted(summary.items())), '',
             '| gate | head | base (dev) | verdict |', '| --- | --- | --- | --- |']
    order = ['REGRESSION', 'NEW_GATE_NOT_PASSING', 'REMOVED', 'PRE_EXISTING', 'FIXED_OR_NEW_PASS', 'ABSENT', 'OK']
    for row in sorted(rows, key=lambda r: (order.index(r['verdict']), r['gate'])):
        lines.append(f'| {row["gate"]} | {row["head"]} | {row["base"]} | {row["verdict"]} |')
    (out / 'compare.md').write_text('\n'.join(lines) + '\n')
    print('\n'.join(lines), flush=True)
    return 1 if summary.get('REGRESSION') or summary.get('REMOVED') else 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest='command', required=True)
    n = sub.add_parser('node')
    n.add_argument('--dest', required=True)
    r = sub.add_parser('run')
    r.add_argument('--checkout', required=True)
    r.add_argument('--out', required=True)
    r.add_argument('--side', required=True, choices=['head', 'base'])
    r.add_argument('--only')
    c = sub.add_parser('compare')
    c.add_argument('--head', required=True)
    c.add_argument('--base', required=True)
    c.add_argument('--out', required=True)
    args = parser.parse_args()
    if args.command == 'node':
        node(args.dest)
        return 0
    if args.command == 'run':
        lane = Lane(args.checkout, args.out, args.side, args.only)
        write_results(args.out, args.side, lane.checkout, lane.run())
        return 0  # the verdict is compare's; every gate result is in results.json
    return compare(args.head, args.base, args.out)


if __name__ == '__main__':
    sys.exit(main())
