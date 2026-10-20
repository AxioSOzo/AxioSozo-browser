#!/usr/bin/env python3
"""WPE WebKit host: pinned setup, native build, run and tests (Linux).

Subcommands (all print one JSON status line per step; exit 0 only on PASS):
  setup         verify the pinned Debian packages (optionally install them with --apt), build the host
  check         verify build fingerprint, pinned runtime and sandbox prerequisites
  run           one real stream session (frames, input, navigation, back, close) with evidence
  test          unit tests + stream, input, damage and security tests against the real host
  test-native   engine-free unit tests only (strict JSON, AXCF transport, stream core); any POSIX host
  syntax-check  cross-compile check of host_wpe.cpp against an extracted pinned header sysroot

Component evidence only: a PASS here is never Zen E1/E2 evidence.
"""
import argparse
import contextlib
import ctypes
import hashlib
import http.server
import inspect
import json
import os
from pathlib import Path
import platform
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
# Bulky output stays under a gitignored project build root (override: AXIOSOZO_BUILD_ROOT).
BUILD_ROOT = Path(os.environ.get('AXIOSOZO_BUILD_ROOT', str(ROOT / '.local/build')))
BASE = Path(os.path.abspath(BUILD_ROOT / 'webkit'))  # mkdtemp() returns normalized paths
BINARY = BASE / 'AxioWebKitHost'
# Run output is gitignored (docs/evidence/*); small curated copies are committed explicitly.
EVIDENCE = ROOT / 'docs/evidence' / ('linux' if platform.system() == 'Linux' else platform.system().lower()) / 'webkit/runs'
LOCK = ROOT / 'upstreams.lock.json'
SOURCES = ['host_wpe.cpp', 'stream_core.hpp', 'json.hpp', 'transport.hpp']
PKG_CONFIG = ['wpe-webkit-2.0', 'wpebackend-fdo-1.0', 'wayland-server']


def emit(status, **fields):
    print(json.dumps(dict(component='webkit-host', status=status, **fields)), flush=True)


def lock():
    return json.loads(LOCK.read_text())['webkit']


# Evaluation mode (ADR 004): an upstream WPE WebKit built from the pinned wpewebkit.org
# tarball and installed under this prefix replaces the Debian libwpewebkit packages.
UPSTREAM_PREFIX = os.environ.get('AXIOSOZO_WEBKIT_UPSTREAM_PREFIX')
UPSTREAM_REPLACES = {'libwpewebkit-2.0-1', 'libwpewebkit-2.0-dev'}


def expected_webkit():
    return lock()['upstream']['version'] if UPSTREAM_PREFIX else lock()['version']


def pkg_config_env():
    if not UPSTREAM_PREFIX:
        return None
    paths = [f'{UPSTREAM_PREFIX}/lib/x86_64-linux-gnu/pkgconfig', f'{UPSTREAM_PREFIX}/lib/pkgconfig']
    return dict(os.environ, PKG_CONFIG_PATH=':'.join(paths + [os.environ.get('PKG_CONFIG_PATH', '')]))


def run_command(args, timeout=None, **kwargs):
    command = [str(arg) for arg in args]
    print('+ ' + ' '.join(command), flush=True)
    process = subprocess.Popen(command, start_new_session=True, **kwargs)
    try:
        code = process.wait(timeout=timeout)
    except subprocess.TimeoutExpired as error:
        cleanup_group(process)
        raise RuntimeError('BLOCKED_ENV: command exceeded ' + str(timeout) + ' s: ' + command[0]) from error
    if code:
        raise subprocess.CalledProcessError(code, command)


def linux_check():
    if platform.system() != 'Linux':
        raise RuntimeError('BLOCKED_ENV: the WPE host needs Linux (this is ' + platform.system() + ')')


def pinned_packages(kind):
    return lock()['debian']['packages'][kind]


def installed_version(package):
    done = subprocess.run(['dpkg-query', '-W', '-f=${Status}|${Version}', package], capture_output=True, text=True)
    if done.returncode or not done.stdout.startswith('install ok installed|'):
        return None
    return done.stdout.split('|', 1)[1]


def package_report():
    report, missing = {}, []
    for kind in ('runtime', 'build'):
        for name, version in pinned_packages(kind).items():
            if UPSTREAM_PREFIX and name in UPSTREAM_REPLACES:
                continue
            actual = installed_version(name)
            report[name] = dict(pinned=version, installed=actual)
            if actual != version:
                missing.append(f'{name}={version}')
    return report, missing


def userns_sandbox_probe():
    """Can bubblewrap create the user namespace WebKit's sandbox needs here?"""
    bwrap = shutil.which('bwrap')
    if not bwrap:
        return dict(bwrap=None, user_namespaces=False, reason='bwrap not installed')
    done = subprocess.run([bwrap, '--ro-bind', '/', '/', '--unshare-user', '--unshare-pid', '--dev', '/dev',
                           '--proc', '/proc', '--die-with-parent', '/bin/true'], capture_output=True, text=True, timeout=20)
    return dict(bwrap=bwrap, user_namespaces=done.returncode == 0, reason=done.stderr.strip()[:300])


def fingerprint():
    h = hashlib.sha256()
    for name in SOURCES:
        h.update((HERE / name).read_bytes())
    h.update(json.dumps(lock(), sort_keys=True).encode())
    h.update(inspect.getsource(build).encode())
    h.update(subprocess.check_output(['g++', '--version']))
    h.update(str(UPSTREAM_PREFIX).encode())
    return h.hexdigest()


def build():
    flags = subprocess.check_output(['pkg-config', '--cflags', '--libs'] + PKG_CONFIG, text=True, env=pkg_config_env()).split()
    if UPSTREAM_PREFIX:
        flags += [f'-Wl,-rpath,{UPSTREAM_PREFIX}/lib/x86_64-linux-gnu', f'-Wl,-rpath,{UPSTREAM_PREFIX}/lib']
    BASE.mkdir(parents=True, exist_ok=True)
    started = time.monotonic()
    run_command(['g++', '-std=c++20', '-O2', '-g', '-Wall', '-Wextra', '-fstack-protector-strong', '-D_FORTIFY_SOURCE=2',
                 '-fPIE', '-pie', '-Wl,-z,relro,-z,now', HERE / 'host_wpe.cpp', '-o', BINARY, *flags, '-pthread'], timeout=600)
    return round(time.monotonic() - started, 2)


APT_ARCHIVES = Path('/var/cache/apt/archives')


def verify_downloaded(missing):
    """Every pinned .deb apt fetched must match the lockfile sha256 (on top of apt's signed-index check)."""
    files = lock()['debian']['files']
    checked = {}
    for spec in missing:
        name = spec.split('=', 1)[0]
        entry = files[name]
        # apt names cached files <name>_<version with ':' as %3a>_<arch>.deb.
        prefix = f'{name}_{entry["version"].replace(":", "%3a")}_'
        found = [p for p in APT_ARCHIVES.glob('*.deb') if p.name.startswith(prefix)]
        if len(found) != 1:
            raise RuntimeError(f'FAIL: apt did not download the pinned {Path(entry["filename"]).name}')
        deb = found[0]
        digest = hashlib.sha256(deb.read_bytes()).hexdigest()
        if digest != entry['sha256']:
            raise RuntimeError(f'FAIL: {deb.name} sha256 {digest} != pinned {entry["sha256"]}')
        checked[name] = digest
    return checked


def apt_install(missing):
    sudo = [] if os.geteuid() == 0 else ['sudo', '-n']
    env = dict(os.environ, DEBIAN_FRONTEND='noninteractive')
    run_command(sudo + ['apt-get', 'update'], timeout=900)
    # An explicit pin may be older than what another step installed (e.g. build-dep): allow it.
    flags = ['-y', '--no-install-recommends', '--allow-downgrades']
    run_command(sudo + ['apt-get', 'install', *flags, '--download-only', *missing], timeout=3600, env=env)
    checked = verify_downloaded(missing)
    run_command(sudo + ['apt-get', 'install', *flags, *missing], timeout=3600, env=env)
    emit('PASS', action='pinned_debs_verified', sha256=checked)


def setup(apt=False):
    linux_check()
    report, missing = package_report()
    if missing and apt:
        apt_install(missing)
        report, missing = package_report()
    if missing:
        raise RuntimeError('BLOCKED_ENV: pinned Debian 13 packages missing or at another version: ' + ' '.join(missing)
                           + ' (install with: apt-get install --no-install-recommends ' + ' '.join(missing)
                           + ', or run `probe.py setup --apt`)')
    stamp = BASE / 'build.json'
    identity = fingerprint()
    if BINARY.exists() and stamp.exists() and json.loads(stamp.read_text()).get('fingerprint') == identity:
        emit('PASS', action='reused_build', binary=str(BINARY))
        return 0
    seconds = build()
    stamp.write_text(json.dumps(dict(fingerprint=identity, built_at=time.time(), build_seconds=seconds,
                                     packages=report), indent=2) + '\n')
    emit('PASS', action='native_build', binary=str(BINARY), build_seconds=seconds)
    return 0


def check():
    linux_check()
    report, missing = package_report()
    if missing:
        raise RuntimeError('BLOCKED_ENV: pinned packages missing: ' + ' '.join(missing))
    stamp = BASE / 'build.json'
    if not BINARY.exists() or not stamp.exists() or json.loads(stamp.read_text()).get('fingerprint') != fingerprint():
        raise RuntimeError('BLOCKED_ENV: WebKit host is not built for these sources; run probe.py setup')
    sandbox = userns_sandbox_probe()
    if os.environ.get('WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS'):
        raise RuntimeError('FAIL: WEBKIT_DISABLE_SANDBOX_THIS_IS_DANGEROUS is set; the host refuses to run without its sandbox')
    if not sandbox['user_namespaces']:
        raise RuntimeError('BLOCKED_ENV: bubblewrap cannot create user namespaces here (' + sandbox['reason']
                           + '); the WebKit sandbox stays enabled, so live runs are blocked in this container')
    emit('PASS', action='check', binary=str(BINARY), packages=report, sandbox=sandbox)
    return 0


# ---- Shared runtime helpers (also imported by the tests) -----------------------------
FIXTURE = ROOT / 'tests/fixtures/engine.html'
INPUT_FIXTURE = HERE / 'fixtures/input.html'


class FixtureHandler(http.server.BaseHTTPRequestHandler):
    """Only the synthetic page (as /engine.html and ?page=2); GET only; never directory serving."""
    fixture = FIXTURE

    def log_message(self, *_):
        pass

    def setup(self):
        super().setup()
        self.connection.settimeout(3)

    def record(self, status):
        hosts = self.headers.get_all('Host', [])
        item = dict(timestamp=time.time(), method=self.command, status=status,
                    path=self.path if self.path in ['/engine.html', '/engine.html?page=2'] else 'REJECTED_PATH',
                    host=hosts[0] if hosts == [f'127.0.0.1:{self.server.server_port}'] else 'REJECTED_HOST')
        log = getattr(self.server, 'request_log', None)
        if log:
            with log.open('a') as out:
                out.write(json.dumps(item) + '\n')

    def do_GET(self):
        if self.headers.get_all('Host', []) != [f'127.0.0.1:{self.server.server_port}']:
            self.record(403); self.send_error(403); return
        if self.path not in ['/engine.html', '/engine.html?page=2']:
            self.record(404); self.send_error(404); return
        data = self.fixture.read_bytes()
        self.record(200)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(data)

    def denied(self):
        self.record(405); self.send_error(405)

    do_HEAD = do_POST = do_PUT = do_DELETE = do_OPTIONS = do_TRACE = denied


class InputFixtureHandler(FixtureHandler):
    fixture = INPUT_FIXTURE


@contextlib.contextmanager
def fixture_server(directory, handler=FixtureHandler):
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), handler)
    server.request_log = directory / 'fixture-requests.jsonl'
    server.request_log.write_text('')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield server, f'http://127.0.0.1:{server.server_port}'
    finally:
        server.shutdown(); server.server_close(); thread.join(timeout=3)


def become_subreaper():
    """Orphaned WebKit helpers re-parent to this test process, so leaks are visible."""
    if platform.system() != 'Linux':
        return False
    libc = ctypes.CDLL(None, use_errno=True)
    return libc.prctl(36, 1, 0, 0, 0) == 0  # PR_SET_CHILD_SUBREAPER


def proc_table():
    """pid -> (ppid, comm, cmdline) for every live, non-zombie process (Linux /proc)."""
    table = {}
    for entry in Path('/proc').iterdir() if Path('/proc').is_dir() else []:
        if not entry.name.isdigit():
            continue
        try:
            stat = (entry / 'stat').read_text()
            cmd = (entry / 'cmdline').read_bytes().replace(b'\0', b' ').decode(errors='replace').strip()
        except OSError:
            continue
        rest = stat[stat.rindex(')') + 2:].split()
        if rest[0] == 'Z':
            continue
        table[int(entry.name)] = (int(rest[1]), stat[stat.index('(') + 1:stat.rindex(')')], cmd)
    return table


def descendants(pid, table=None):
    table = proc_table() if table is None else table
    found, frontier = [], [pid]
    while frontier:
        parent = frontier.pop()
        for child, (ppid, comm, cmd) in table.items():
            if ppid == parent:
                found.append(dict(pid=child, comm=comm, cmdline=cmd[:300]))
                frontier.append(child)
    return found


def mac_webkit_helpers():
    """pid -> name of every live system WebKit XPC helper (com.apple.WebKit.*), macOS only."""
    if platform.system() != 'Darwin':
        return {}
    done = subprocess.run(['/bin/ps', '-axo', 'pid=,comm='], capture_output=True, text=True, timeout=10)
    helpers = {}
    for line in done.stdout.splitlines():
        pid, _, comm = line.strip().partition(' ')
        name = comm.strip().rsplit('/', 1)[-1]
        if pid.isdigit() and name.startswith('com.apple.WebKit.'):
            helpers[int(pid)] = name
    return helpers


# WebKit helpers that existed before any host of this test process started (other apps).
MAC_HELPER_BASELINE = set(mac_webkit_helpers())
# Hosts this test process started (stream_test.Session) and their launchd responsible pids;
# other runner processes (e.g. Quick Look) use WebKit too.
MAC_HOST_PIDS = set()


def mac_responsible_pid(pid):
    """The pid launchd holds responsible for an XPC service (libquarantine), or None."""
    try:
        quarantine = ctypes.CDLL('/usr/lib/system/libquarantine.dylib')
        function = quarantine.responsibility_get_pid_responsible_for_pid
    except (OSError, AttributeError):
        return None
    function.argtypes = [ctypes.c_int]
    function.restype = ctypes.c_int
    value = function(pid)
    return value if value > 0 else None


def track_mac_host(pid):
    """Remember a spawned host and the process launchd holds responsible for it (inherited)."""
    if platform.system() == 'Darwin':
        MAC_HOST_PIDS.update(p for p in (pid, mac_responsible_pid(pid)) if p)


def mac_host_helpers(host_pids):
    """WebKit helpers started after this test process began whose launchd responsible pid is a
    tracked host or that host's own responsible process. Without the responsibility API: every
    helper that appeared since this process started."""
    helpers = {pid: name for pid, name in mac_webkit_helpers().items() if pid not in MAC_HELPER_BASELINE}
    if mac_responsible_pid(os.getpid()) is None:
        return helpers
    return {pid: name for pid, name in helpers.items() if mac_responsible_pid(pid) in host_pids}


def mac_sandboxed(pid):
    """sandbox_check(pid, NULL, SANDBOX_FILTER_NONE) == 1: the process runs under a Seatbelt profile."""
    libsystem = ctypes.CDLL('/usr/lib/libSystem.B.dylib')
    check = libsystem.sandbox_check
    check.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int]
    check.restype = ctypes.c_int
    return check(pid, None, 0) == 1


def sandbox_observation(host_pid):
    """Which WebKit helpers run, and whether each one runs under bubblewrap (Linux) or Seatbelt (macOS)."""
    if platform.system() == 'Darwin':
        # System WebKit's helpers are launchd XPC services, not our children: attribute them
        # by launchd's responsible pid (other runner processes use WebKit too).
        helpers = mac_host_helpers({host_pid, mac_responsible_pid(host_pid)} - {None})
        processes = [dict(pid=pid, comm=name, sandboxed=mac_sandboxed(pid), responsible_pid=mac_responsible_pid(pid))
                     for pid, name in sorted(helpers.items())]
        web = [p for p in processes if p['comm'].startswith('com.apple.WebKit.WebContent')]
        network = [p for p in processes if p['comm'].startswith('com.apple.WebKit.Networking')]
        return dict(observed=True, processes=processes, bwrap_processes=0, web_process=bool(web), network_process=bool(network),
                    web_process_sandboxed=bool(web) and all(p['sandboxed'] for p in web),
                    all_helpers_sandboxed=bool(processes) and all(p['sandboxed'] for p in processes), sandbox='seatbelt')
    if platform.system() != 'Linux':
        return dict(observed=False, reason='not Linux')
    tree = descendants(host_pid)
    helpers = [p for p in tree if 'WPEWebProcess' in p['cmdline'] or 'WPENetworkProcess' in p['cmdline'] or p['comm'].startswith('WPE')]
    bwrap = [p for p in tree if p['comm'] == 'bwrap' or p['cmdline'].startswith('bwrap') or '/bwrap ' in p['cmdline']]
    web = [p for p in helpers if 'WebProcess' in p['cmdline'] or p['comm'] == 'WPEWebProcess']
    network = [p for p in helpers if 'NetworkProcess' in p['cmdline'] or p['comm'] == 'WPENetworkProce']  # comm is 15 chars
    return dict(observed=True, processes=[dict(pid=p['pid'], comm=p['comm']) for p in tree],
                bwrap_processes=len(bwrap), web_process=bool(web), network_process=bool(network),
                web_process_sandboxed=bool(web) and bool(bwrap))


def orphans(marker):
    """Live processes that are our re-parented children or mention this run's private profile.
    macOS: WebKit XPC helpers that launchd attributes to a host this test process started."""
    if platform.system() == 'Darwin':
        return [dict(pid=pid, comm=name) for pid, name in mac_host_helpers(MAC_HOST_PIDS).items()]
    me = os.getpid()
    table = proc_table()
    return [dict(pid=pid, comm=comm, cmdline=cmd[:300]) for pid, (ppid, comm, cmd) in table.items()
            if pid != me and (ppid == me or (marker and marker in cmd))]


def cleanup_group(process):
    if process is None:
        return False
    def exists():
        process.poll()
        try:
            os.killpg(process.pid, 0)
            return True
        except ProcessLookupError:
            return False
        except PermissionError:
            return False
    remained = exists()
    if remained:
        with contextlib.suppress(ProcessLookupError):
            os.killpg(process.pid, signal.SIGTERM)
        deadline = time.monotonic() + 2
        while exists() and time.monotonic() < deadline:
            time.sleep(.1)
        if exists():
            with contextlib.suppress(ProcessLookupError):
                os.killpg(process.pid, signal.SIGKILL)
    if process.poll() is None:
        process.wait(timeout=4)
    return remained


def remove_profile(profile, process, prefix):
    if profile.parent != BASE or not profile.name.startswith(prefix) or profile.is_symlink():
        return False
    if process is not None and process.poll() is None:
        return False
    try:
        shutil.rmtree(profile)
    except OSError:
        return False
    return not profile.exists()


def new_evidence(prefix):
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    return Path(tempfile.mkdtemp(prefix=prefix, dir=EVIDENCE))


# ---- Native unit tests ---------------------------------------------------------------
def compiler():
    for name in ('g++', 'clang++'):
        if shutil.which(name):
            return [name]
    if shutil.which('xcrun'):
        return ['xcrun', 'clang++']
    raise RuntimeError('BLOCKED_ENV: no C++20 compiler')


def native_test():
    """Engine-free: strict JSON, AXCF transport (copied from chromium-host), stream core harness."""
    out = BASE / 'unit'
    out.mkdir(parents=True, exist_ok=True)
    cxx = compiler()
    results = {}
    for name, source in [('json-test', HERE / 'tests/test_json.cc'), ('transport-test', HERE / 'test_transport.cc')]:
        run_command(cxx + ['-std=c++20', '-O1', '-Wall', '-Wextra', '-pthread', source, '-o', out / name], timeout=300)
        run_command([out / name], timeout=30)
        results[name] = 'PASS'
    run_command(cxx + ['-std=c++20', '-O1', '-Wall', '-Wextra', '-pthread', HERE / 'tests/fake_host.cc', '-o', out / 'fake_host'], timeout=300)
    run_command([sys.executable, HERE / 'tests/core_test.py', out / 'fake_host'], timeout=300)
    results['core-harness'] = 'PASS'
    emit('PASS', action='native_unit_tests', results=results, engine='none (engine-free)')
    return 0


def syntax_check(sysroot):
    """Header-level proof only: host_wpe.cpp against an extracted pinned header sysroot."""
    sysroot = Path(sysroot).resolve()
    arch = 'x86_64-linux-gnu'
    include = sysroot / 'usr/include'
    cxx = ['xcrun', 'clang++'] if shutil.which('xcrun') else ['clang++']
    args = cxx + [f'--target={arch}', f'--sysroot={sysroot}', '-std=c++20', '-fsyntax-only', '-Wall', '-Wextra', '-nostdinc++',
                  '-isystem', include / 'c++/14', '-isystem', include / arch / 'c++/14', '-isystem', include / 'c++/14/backward',
                  '-I', include / 'wpe-webkit-2.0', '-I', include / 'wpe-1.0', '-DWPE_ENABLE_XKB=1', '-I', include / 'wpe-fdo-1.0',
                  '-I', include / 'glib-2.0', '-I', sysroot / 'usr/lib' / arch / 'glib-2.0/include', '-I', include / 'libsoup-3.0',
                  '-I', include / 'gio-unix-2.0', '-I', include / 'sysprof-6', HERE / 'host_wpe.cpp']
    run_command(args, timeout=300)
    emit('PASS', action='syntax_check', sysroot=str(sysroot), note='compile-only; never linked or run')
    return 0


def full_test():
    check()
    # Every suite runs even after a failure, so one run reports all of them.
    suites = {}
    try:
        native_test()
        suites['test-native'] = 'PASS'
    except (RuntimeError, subprocess.CalledProcessError) as error:
        suites['test-native'] = 'FAIL: ' + str(error)[:200]
    for script in ('stream_test.py', 'input_test.py', 'stream_security_test.py'):
        try:
            run_command([sys.executable, HERE / script], timeout=900)
            suites[script] = 'PASS'
        except (RuntimeError, subprocess.CalledProcessError) as error:
            suites[script] = 'FAIL: ' + str(error)[:200]
    if any(value != 'PASS' for value in suites.values()):
        raise RuntimeError('FAIL: ' + json.dumps(suites))
    emit('PASS', action='test', suites=suites, tests=['unit', 'stream', 'input', 'damage', 'security', 'process_cleanup'])
    return 0


def run():
    check()
    run_command([sys.executable, HERE / 'stream_test.py'], timeout=900)
    return 0


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('command', choices=['setup', 'check', 'run', 'test', 'test-native', 'syntax-check'])
    parser.add_argument('--apt', action='store_true', help='setup: install the pinned packages with apt-get')
    parser.add_argument('--sysroot', help='syntax-check: extracted header sysroot')
    args = parser.parse_args()
    try:
        if args.command == 'setup':
            code = setup(args.apt)
        elif args.command == 'syntax-check':
            if not args.sysroot:
                raise RuntimeError('FAIL: --sysroot is required')
            code = syntax_check(args.sysroot)
        else:
            code = {'check': check, 'run': run, 'test': full_test, 'test-native': native_test}[args.command]()
        sys.exit(code or 0)
    except (RuntimeError, subprocess.CalledProcessError, OSError) as exc:
        emit('BLOCKED_ENV' if 'BLOCKED_ENV' in str(exc) else 'FAIL', message=str(exc))
        sys.exit(2)
