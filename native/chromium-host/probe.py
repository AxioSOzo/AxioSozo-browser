#!/usr/bin/env python3
"""Reproducible CEF E0 component build/probe. E1/E2 are never inferred from E0."""
import argparse
import contextlib
import hashlib
import http.server
import inspect
import json
import os
from pathlib import Path
import platform
import plistlib
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import threading
import time

ROOT = Path(__file__).resolve().parents[2]
# Linux (cloud) hosts build under a gitignored project build root; macOS keeps the
# mounted project APFS volume. Both are overridable with AXIOSOZO_BUILD_ROOT.
IS_LINUX = platform.system() == 'Linux'
if IS_LINUX:
    # The same default as scripts/storage.py (./dev): the gitignored <checkout>/.build.
    BUILD_ROOT = Path(os.environ.get('AXIOSOZO_BUILD_ROOT') or ROOT / '.build')
else:
    BUILD_ROOT = Path(os.environ.get('AXIOSOZO_BUILD_ROOT', '/Volumes/AxioSozoBuild'))
BASE = BUILD_ROOT / 'cef'
LEGACY_ARCHIVE = Path('/Volumes/DevStorage/builds/axiosozo-cef-handoff1/cef-minimal.tar.bz2')
VERSION = '154.0.23+g062ebe4+chromium-154.0.8037.17'
# Official CEF minimal distributions of the same pinned version (upstreams.lock.json
# cef.platforms). sha1 is the value published in cef-builds.spotifycdn.com/index.json;
# sha256 was computed from the downloaded archive whose sha1 matched it.
LINUX_ARCHES = {'x86_64': 'linux64', 'aarch64': 'linuxarm64'}
LINUX_PINS = {
    'linux64': dict(sha256='8beed3410b79aa4ae964bb7f955f08ac550eb2a377a6d12090be8bdb7de1369d',
                    sha1='01c4df39ce79c441950cd8bf2f385c0b886bd5d3', bytes=326915001),
    'linuxarm64': dict(sha256='0d52ceed3ec40244ad2d330a370968cd1fa1442191edb762cd8e3f2dd20e045f',
                       sha1='08c08229946992685b90b50ee08e7a59e192b601', bytes=424499168),
}
LINUX_ARCH = LINUX_ARCHES.get(platform.machine()) if IS_LINUX else None
if IS_LINUX:
    ARCHIVE_NAME = f'cef_binary_{VERSION}_{LINUX_ARCH or "linux64"}_minimal.tar.bz2'
    CEF = BASE / ARCHIVE_NAME.removesuffix('.tar.bz2')
    ARCHIVE = BASE / ARCHIVE_NAME
    URL = 'https://cef-builds.spotifycdn.com/' + ARCHIVE_NAME.replace('+', '%2B')
    SHA256 = LINUX_PINS[LINUX_ARCH or 'linux64']['sha256']
    # One runtime directory: both host executables, libcef.so, resources, chrome-sandbox.
    APP = BASE / (LINUX_ARCH or 'linux64')
    BINARY = APP / 'AxioCEFProbe'
else:
    ARCHIVE_NAME = f'cef_binary_{VERSION}_macosarm64_minimal.tar.bz2'
    CEF = BASE / ARCHIVE_NAME.removesuffix('.tar.bz2')
    ARCHIVE = BASE / 'cef-minimal.tar.bz2'
    URL = 'https://cef-builds.spotifycdn.com/' + ARCHIVE_NAME.replace('+', '%2B')
    SHA256 = '5b9c248b30db8d41dd2cf5c6f920ef4991c60e514f863413db542d0448ddf777'
    APP = BASE / 'AxioCEFProbe.app'
    BINARY = APP / 'Contents/MacOS/AxioCEFProbe'
EVIDENCE = ROOT / 'docs/evidence'
EXTERNAL = '/Users/wout/.local/bin/dev-external'
MOUNT = '/Users/wout/.local/bin/mount-dev-storage'


def macos_ci():
    """scripts/storage.py's macOS CI build root rule (GitHub-hosted runners only;
    docs/MACOS_CI.md). Refused wherever the owner's layout exists, so on the owner's
    Mac the T9 volume, DevStorage and both helpers stay required."""
    if platform.system() != 'Darwin' or os.environ.get('AXIOSOZO_MACOS_CI') != '1':
        return False
    if os.environ.get('GITHUB_ACTIONS') != 'true':
        raise RuntimeError('BLOCKED_ENV: AXIOSOZO_MACOS_CI=1 is only for GitHub Actions macOS runners')
    if any(Path(path).exists() for path in ('/Volumes/T9', EXTERNAL, MOUNT)):
        raise RuntimeError('BLOCKED_ENV: AXIOSOZO_MACOS_CI=1 refused: the owner macOS layout exists')
    if not os.environ.get('AXIOSOZO_BUILD_ROOT'):
        raise RuntimeError('BLOCKED_ENV: AXIOSOZO_MACOS_CI=1 requires an explicit AXIOSOZO_BUILD_ROOT')
    return True


MACOS_CI = macos_ci()
if MACOS_CI:
    # Same commands without the owner's helpers: `env` runs the wrapped command
    # (every call site already sets TMPDIR/CLANG_MODULE_CACHE_PATH into BASE) and
    # there is no volume to mount.
    EXTERNAL = '/usr/bin/env'
    MOUNT = '/usr/bin/true'
SECURITY = '/usr/bin/security'
IDENTITY_ENV = 'AXIOSOZO_CODESIGN_IDENTITY'
ADHOC_HINT = ('signing: ad hoc (no ' + IDENTITY_ENV + '); macOS Keychain will ask about '
              '"Chromium Safe Storage" again after every rebuild. See README, '
              '"Stable local signing identity".')


def emit(status, **fields):
    print(json.dumps(dict(component='cef', status=status, **fields)), flush=True)


def run_command(args, **kwargs):
    command = list(map(str, args))
    print('+ ' + ' '.join(command), flush=True)
    # CEF is a small prebuilt component: a compiler/signer stalled for ten
    # minutes is an environment blocker, not permission to weaken protections.
    bounded = any(Path(arg).name in {'clang++', 'codesign', 'c++', 'g++', 'cmake'} for arg in command)
    limit = kwargs.pop('timeout_seconds', 600 if bounded else None)
    process = None
    previous_term = signal.getsignal(signal.SIGTERM)
    previous_int = signal.getsignal(signal.SIGINT)
    def interrupted(_signum, _frame):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, interrupted)
    try:
        process = subprocess.Popen(command, start_new_session=True, **kwargs)
        code = process.wait(timeout=limit)
        if code:
            raise subprocess.CalledProcessError(code, command)
    except subprocess.TimeoutExpired as exc:
        raise RuntimeError('BLOCKED_ENV: native compiler/signature command exceeded '
                           + str(limit) + ' seconds; owned process group stopped') from exc
    finally:
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        cleanup_group(process)
        signal.signal(signal.SIGTERM, previous_term)
        signal.signal(signal.SIGINT, previous_int)


def host_check():
    if platform.system() != 'Darwin' or platform.machine() != 'arm64':
        raise RuntimeError('BLOCKED_ENV: the pinned binary needs macOS arm64')
    if MACOS_CI:
        # CI runner: an existing, user-owned, real build directory replaces the volume.
        info = BUILD_ROOT.lstat() if BUILD_ROOT.exists() else None
        if (info is None or not BUILD_ROOT.is_dir() or BUILD_ROOT.is_symlink() or info.st_uid != os.getuid()
                or BUILD_ROOT.resolve() != BUILD_ROOT):
            raise RuntimeError('BLOCKED_ENV: macOS CI build root must be a real directory owned by this user')
        if not shutil.which('xcrun'):
            raise RuntimeError('BLOCKED_ENV: Xcode command line tools missing')
        return
    if not Path('/Volumes/DevStorage').is_mount():
        raise RuntimeError('BLOCKED_ENV: DevStorage is not mounted')
    if not BUILD_ROOT.is_mount():
        raise RuntimeError('BLOCKED_ENV: AXIOSOZO_BUILD_ROOT must be the mounted project APFS volume')
    info = plistlib.loads(subprocess.check_output(['/usr/bin/hdiutil', 'info', '-plist']))
    verified = any(image.get('image-path') == '/Volumes/T9/Dev.sparsebundle'
                   and any(entity.get('mount-point') == str(BUILD_ROOT)
                           for entity in image.get('system-entities', []))
                   for image in info.get('images', []))
    if verified:
        # Other volumes of the same image (source, DevStorage) must not pass.
        disk = plistlib.loads(subprocess.check_output(['/usr/sbin/diskutil', 'info', '-plist', str(BUILD_ROOT)]))
        verified = (disk.get('VolumeName') == 'AxioSozoBuild' and disk.get('MountPoint') == str(BUILD_ROOT)
                    and str(disk.get('FilesystemType', '')).lower() == 'apfs')
    if not verified:
        raise RuntimeError('BLOCKED_ENV: project build root is not the AxioSozoBuild APFS volume of the verified T9 image')
    if not shutil.which('xcrun'):
        raise RuntimeError('BLOCKED_ENV: Xcode command line tools missing')


def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def plist(bundle, executable, helper=False, suffix=''):
    path = bundle / 'Contents'
    (path / 'MacOS').mkdir(parents=True, exist_ok=True)
    info = dict(CFBundleIdentifier='dev.axiosozo.cef-probe' + suffix,
                CFBundleExecutable=executable, CFBundleName=executable,
                CFBundlePackageType='APPL', CFBundleVersion='1',
                CFBundleShortVersionString='0.1', NSHighResolutionCapable=True,
                NSPrincipalClass='NSApplication', LSMinimumSystemVersion='14.5')
    if helper:
        info['LSUIElement'] = True
    (path / 'Info.plist').write_bytes(plistlib.dumps(info))
    (path / 'PkgInfo').write_bytes(b'APPL????')


def parse_identities(listing):
    """(SHA-1, common name) pairs from `security find-identity -p codesigning` text."""
    found = {}
    for line in listing.splitlines():
        match = re.match(r'^\s*\d+\)\s+([0-9A-Fa-f]{40})\s+"([^"]*)"', line)
        if match:
            found.setdefault(match.group(1).upper(), match.group(2))
    return list(found.items())


def resolve_identity(spec, valid, every=None):
    """Map a certificate common name or SHA-1 to one (SHA-1, name) that can sign.

    `valid` and `every` are `find-identity` outputs with and without `-v`; the second
    only sharpens the error when the certificate exists but is not trusted for code
    signing. The hash, never the name, is what codesign receives, so two certificates
    with the same name cannot be confused.
    """
    spec = (spec or '').strip()
    if not spec:
        raise RuntimeError('FAIL: ' + IDENTITY_ENV + ' is empty; unset it for ad hoc signing')
    pool = parse_identities(valid)
    if re.fullmatch(r'[0-9A-Fa-f]{40}', spec):
        matches = [item for item in pool if item[0] == spec.upper()]
    else:
        matches = [item for item in pool if item[1] == spec]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        raise RuntimeError('FAIL: ' + IDENTITY_ENV + ' matches several identities; use one SHA-1: '
                           + ', '.join(sorted(h for h, _ in matches)))
    listed = parse_identities(every or '')
    if any(h == spec.upper() or n == spec for h, n in listed):
        raise RuntimeError('FAIL: identity "' + spec + '" exists but is not valid for code signing '
                           '(untrusted, expired or missing its private key); in Keychain Access set '
                           'the certificate trust for Code Signing to Always Trust')
    raise RuntimeError('FAIL: no valid code-signing identity "' + spec + '" in `security '
                       'find-identity -v -p codesigning`')


def current_signing(env=None, runner=subprocess.run):
    """Signing mode for this build. Read-only: it never creates or changes a certificate."""
    spec = (os.environ if env is None else env).get(IDENTITY_ENV)
    if spec is None:
        return dict(mode='adhoc', identity=None, name=None)
    def listing(*flags):
        done = runner([SECURITY, 'find-identity', *flags, '-p', 'codesigning'],
                      capture_output=True, text=True, timeout=30)
        return done.stdout
    valid = listing('-v')
    try:
        digest_, name = resolve_identity(spec, valid)
    except RuntimeError:
        # Distinguish "untrusted" from "absent" for the error message only.
        resolve_identity(spec, valid, listing())
        raise
    return dict(mode='identity', identity=digest_, name=name)


def signing_label(signing):
    if signing['mode'] == 'adhoc':
        return 'adhoc'
    return 'identity:' + signing['identity']


def designated_requirement(identifier, identity_hash):
    """Stable across rebuilds: bundle identifier plus this exact certificate leaf."""
    return f'designated => identifier "{identifier}" and certificate leaf = H"{identity_hash.lower()}"'


def sign_command(target, signing, identifier=None):
    """One codesign invocation; ad hoc keeps the historical bare form."""
    if signing['mode'] == 'adhoc':
        return ['codesign', '--force', '--sign', '-', target]
    command = ['codesign', '--force', '--sign', signing['identity'], '--timestamp=none']
    if identifier:
        command.append('-r=' + designated_requirement(identifier, signing['identity']))
    return command + [target]


def bundle_identifier(bundle):
    return plistlib.loads((bundle / 'Contents/Info.plist').read_bytes())['CFBundleIdentifier']


def fingerprint(signing=None):
    h = hashlib.sha256()
    h.update(SHA256.encode())
    for name in ['host.mm', 'stream.inc', 'input.inc', 'transport.hpp', 'engine_surface_v1.h',
                 'surface_transport.hpp', 'surface_transport.mm', 'crash_guard.hpp',
                 'a11y.inc', 'a11y_forward.inc', 'a11y_core.hpp']:
        h.update((ROOT / 'native/chromium-host' / name).read_bytes())
    # Runner-only lifecycle changes do not change the native build recipe.
    h.update(inspect.getsource(setup).encode())
    h.update(inspect.getsource(plist).encode())
    h.update(inspect.getsource(sign_command).encode())
    # A different identity (or ad hoc) must re-sign; the SHA-1 is a public cert digest.
    h.update(signing_label(signing or current_signing()).encode())
    h.update(subprocess.check_output(['xcrun', 'clang++', '--version']))
    return h.hexdigest()


def setup():
    run_command([MOUNT])
    host_check()
    signing = current_signing()
    if signing['mode'] == 'adhoc':
        print(ADHOC_HINT, file=sys.stderr, flush=True)
    if not BUILD_ROOT.exists():
        raise RuntimeError('BLOCKED_ENV: AXIOSOZO_BUILD_ROOT is not ready')
    BASE.mkdir(parents=True, exist_ok=True)
    if not ARCHIVE.exists() and LEGACY_ARCHIVE.exists():
        # Copy, never move, the previously verified archive. Recheck the copy.
        shutil.copy2(LEGACY_ARCHIVE, ARCHIVE)
    if not ARCHIVE.exists() or ARCHIVE.stat().st_size != 132223579:
        run_command(['curl', '--fail', '--location', '--max-time', '180',
                     '--speed-time', '20', '--speed-limit', '1024', '--continue-at', '-',
                     URL, '--output', ARCHIVE])
    if digest(ARCHIVE) != SHA256:
        raise RuntimeError('FAIL: CEF archive SHA256 differs; never extracting it')
    # The verified upstream archive is immutable. Extraction has no lifecycle hooks.
    if not (CEF / 'libcef_dll/wrapper/cef_scoped_sandbox_context_mac.mm').exists():
        run_command([EXTERNAL, 'tar', '-xjf', ARCHIVE, '-C', BASE])
    stamp = BASE / 'build.json'
    identity = fingerprint(signing)
    if BINARY.exists() and stamp.exists() and json.loads(stamp.read_text()).get('fingerprint') == identity:
        emit('PASS', action='reused_build', binary=str(BINARY), signing=signing_label(signing))
        return
    plist(APP, 'AxioCEFProbe')
    resources = APP / 'Contents/Resources'
    resources.mkdir(exist_ok=True)
    for notice in ['LICENSE.txt', 'CREDITS.html']:
        shutil.copy2(CEF / notice, resources / notice)
    frameworks = APP / 'Contents/Frameworks'
    frameworks.mkdir(exist_ok=True)
    framework = frameworks / 'Chromium Embedded Framework.framework'
    # Clone on the external APFS volume where possible; avoid a second large copy.
    if not framework.exists():
        run_command(['cp', '-cR', CEF / 'Release/Chromium Embedded Framework.framework', framework])
    # Xcode 26 requires a versioned framework. Preserve official contents and notices.
    if not (framework / 'Versions/A').exists():
        entries = list(framework.iterdir())
        (framework / 'Versions/A').mkdir(parents=True)
        for entry in entries:
            entry.rename(framework / 'Versions/A' / entry.name)
            (framework / entry.name).symlink_to('Versions/A/' + entry.name)
        (framework / 'Versions/Current').symlink_to('A')
    # Upstream README explicitly permits shipping only the configured locale.
    # E0 uses CEF's default English locale; retain ICU and every non-locale asset.
    for locale in (framework / 'Versions/A/Resources').glob('*.lproj'):
        if locale.name != 'en.lproj':
            shutil.rmtree(locale)
    source = ROOT / 'native/chromium-host/host.mm'
    sandbox = CEF / 'libcef_dll/wrapper/cef_scoped_sandbox_context_mac.mm'
    for directory in [BASE / 'tmp', BASE / 'clang-cache']:
        directory.mkdir(exist_ok=True)
    common = [EXTERNAL, 'env', 'TMPDIR=' + str(BASE / 'tmp'),
              'CLANG_MODULE_CACHE_PATH=' + str(BASE / 'clang-cache'), 'xcrun', 'clang++', '-std=c++20', '-fobjc-arc',
              '-arch', 'arm64', '-mmacosx-version-min=14.5', '-DCEF_USE_SANDBOX=1', '-DCEF_API_VERSION=15400',
              '-I', CEF, '-framework', 'Cocoa', source]
    # Only the browser process links the Mach/IOSurface transport. Helpers compile
    # inert stubs (AXIO_CEF_HELPER) and never link Metal or IOSurface.
    run_command(common + [ROOT / 'native/chromium-host/surface_transport.mm', '-framework', 'Metal',
                          '-framework', 'IOSurface', '-lbsm', '-o', BINARY])
    helper_name = 'AxioCEFProbe Helper'
    helper = frameworks / (helper_name + '.app')
    plist(helper, helper_name, True, '.helper')
    run_command(common + ['-DAXIO_CEF_HELPER=1', sandbox, '-o', helper / 'Contents/MacOS' / helper_name])
    # Chromium requires these role-specific helper bundle names even with one codebase.
    for role in ['GPU', 'Renderer', 'Plugin', 'Alerts']:
        name = f'{helper_name} ({role})'
        bundle = frameworks / (name + '.app')
        plist(bundle, name, True, '.helper.' + role.lower())
        shutil.copy2(helper / 'Contents/MacOS' / helper_name, bundle / 'Contents/MacOS' / name)
    # Local development only: ad hoc, or a user-created self-signed identity that keeps
    # the Keychain ACL stable across rebuilds. No account, notarization or distribution.
    for lib in (framework / 'Versions/A/Libraries').glob('*.dylib'):
        run_command(sign_command(lib, signing))
    run_command(sign_command(framework, signing))
    for helper_bundle in sorted(frameworks.glob('*Helper*.app')):
        run_command(sign_command(helper_bundle, signing, bundle_identifier(helper_bundle)))
    run_command(sign_command(APP, signing, bundle_identifier(APP)))
    stamp.write_text(json.dumps(dict(fingerprint=identity, cef=VERSION, archive_sha256=SHA256,
                                     built_at=time.time(),
                                     signing=signing_label(signing),
                                     signing_name=signing['name']), indent=2) + '\n')
    emit('PASS', action='native_build', binary=str(BINARY), signing=signing_label(signing))


def check():
    if IS_LINUX:
        return linux_check()
    host_check()
    if not BINARY.exists():
        raise RuntimeError('BLOCKED_ENV: CEF native component is not built; run ./dev setup')
    signing = current_signing()
    stamp = BASE / 'build.json'
    if not stamp.exists() or json.loads(stamp.read_text()).get('fingerprint') != fingerprint(signing):
        raise RuntimeError('BLOCKED_ENV: native CEF rebuild required (signing mode now '
                           + signing_label(signing) + ')')
    run_command(['codesign', '--verify', '--deep', '--strict', APP])
    # codesign prints the requirement on stdout; its other notes go to stderr.
    requirement = subprocess.run(['codesign', '--display', '--requirements', '-', APP],
                                 capture_output=True, text=True, timeout=60).stdout.strip()
    print(requirement, flush=True)
    if signing['mode'] == 'adhoc':
        print(ADHOC_HINT, file=sys.stderr, flush=True)
    emit('PASS', action='native_build_check', version=VERSION, signing=signing_label(signing),
         signing_name=signing['name'], designated_requirement=requirement)


def native_test():
    """Exercise actual native framing/credit threads, without pretending to run CEF."""
    if IS_LINUX:
        return linux_native_test()
    host_check()
    BASE.mkdir(parents=True, exist_ok=True)
    for directory in [BASE / 'tmp', BASE / 'clang-cache']:
        directory.mkdir(exist_ok=True)
    binary = BASE / 'transport-test'
    run_command([EXTERNAL, 'env', 'TMPDIR=' + str(BASE / 'tmp'),
                 'CLANG_MODULE_CACHE_PATH=' + str(BASE / 'clang-cache'),
                 'xcrun', 'clang++', '-std=c++20', '-Wall', '-Wextra',
                 ROOT / 'native/chromium-host/test_transport.cc', '-o', binary])
    run_command([binary], timeout_seconds=15)
    # Crash/hang robustness (crash_guard.hpp) against a Breakpad-like inherited
    # exception port, in real child processes. No CEF, no Keychain.
    guard = BASE / 'crash-guard-test'
    run_command([EXTERNAL, 'env', 'TMPDIR=' + str(BASE / 'tmp'),
                 'CLANG_MODULE_CACHE_PATH=' + str(BASE / 'clang-cache'),
                 'xcrun', 'clang++', '-std=c++20', '-Wall', '-Wextra',
                 ROOT / 'native/chromium-host/tests/crash_guard_test.cc', '-o', guard])
    run_command([guard], timeout_seconds=30)
    # Accessibility mirror (a11y_core.hpp): tree, redaction, chunking, credits. No CEF.
    a11y = BASE / 'a11y-core-test'
    run_command([EXTERNAL, 'env', 'TMPDIR=' + str(BASE / 'tmp'),
                 'CLANG_MODULE_CACHE_PATH=' + str(BASE / 'clang-cache'),
                 'xcrun', 'clang++', '-std=c++20', '-Wall', '-Wextra',
                 '-I', ROOT / 'native/chromium-host',
                 ROOT / 'native/chromium-host/tests/a11y_core_test.cc', '-o', a11y])
    run_command([a11y], timeout_seconds=30)


# ---- Linux (cloud) host ---------------------------------------------------------------------
# Portable C++ core (core/) + Linux platform layer (linux/), built with CMake against the
# pinned minimal distribution. Runtime layout: BASE/<linux64|linuxarm64>/ holds
# AxioCEFProbe, AxioCEFProbeHelper, libcef.so, resources and chrome-sandbox.
LINUX_SOURCES = ['CMakeLists.txt', 'transport.hpp', 'a11y_core.hpp', 'core/json.hpp', 'core/url.hpp',
                 'core/cef_util.hpp', 'core/platform.hpp', 'core/png.hpp', 'core/host_core.hpp',
                 'core/host_core.cc', 'core/delegation.inc', 'core/input.inc', 'core/a11y_bridge.inc',
                 'core/handlers.inc', 'linux/main_linux.cc', 'linux/helper_linux.cc', 'linux/platform_linux.cc']
LINUX_RUNTIME = ['libcef.so', 'libEGL.so', 'libGLESv2.so', 'libvk_swiftshader.so', 'libvulkan.so.1',
                 'v8_context_snapshot.bin', 'vk_swiftshader_icd.json']
LINUX_RESOURCES = ['chrome_100_percent.pak', 'chrome_200_percent.pak', 'resources.pak', 'icudtl.dat']


def linux_compiler():
    return os.environ.get('CXX') or shutil.which('g++') or shutil.which('clang++') or shutil.which('c++')


def linux_host_check():
    if not IS_LINUX or LINUX_ARCH is None:
        raise RuntimeError('BLOCKED_ENV: the pinned Linux CEF distributions need x86_64 or aarch64 Linux')
    if os.geteuid() == 0:
        raise RuntimeError('BLOCKED_ENV: run as an unprivileged user; Chromium refuses to sandbox a root '
                           'browser process and this host never passes --no-sandbox')
    for tool in ['cmake', 'tar', 'bzip2', 'curl']:
        if not shutil.which(tool):
            raise RuntimeError(f'BLOCKED_ENV: {tool} is missing (README "Linux": apt packages)')
    if not linux_compiler():
        raise RuntimeError('BLOCKED_ENV: no C++20 compiler (g++ or clang++)')
    BUILD_ROOT.mkdir(parents=True, exist_ok=True)


def linux_fingerprint():
    h = hashlib.sha256()
    h.update(SHA256.encode())
    for name in LINUX_SOURCES:
        h.update(name.encode() + b'\0' + (ROOT / 'native/chromium-host' / name).read_bytes())
    h.update(inspect.getsource(linux_setup).encode())
    h.update(subprocess.check_output([linux_compiler(), '--version']))
    h.update(subprocess.check_output(['cmake', '--version']))
    return h.hexdigest()


def link_or_copy(source, target):
    """Hard-link an unchanged upstream runtime file into the runtime directory."""
    if target.exists() or target.is_symlink():
        if not target.is_symlink() and target.stat().st_ino == source.stat().st_ino:
            return
        target.unlink()
    try:
        os.link(source, target)
    except OSError:
        shutil.copy2(source, target)


def linux_alias():
    """`<build root>/cef/linux` -> `<linux64|linuxarm64>`: the architecture-neutral path
    ./dev exports as AXIOSOZO_CEF_BINARY; the adapter accepts both spellings."""
    alias = BASE / 'linux'
    if alias.is_symlink() and os.readlink(alias) == LINUX_ARCH:
        return
    if alias.is_symlink():
        alias.unlink()
    elif alias.exists():
        raise RuntimeError(f'FAIL: {alias} exists and is not the runtime alias; refusing to replace it')
    alias.symlink_to(LINUX_ARCH, target_is_directory=True)


def linux_setup():
    linux_host_check()
    BASE.mkdir(parents=True, exist_ok=True)
    linux_alias()
    pin = LINUX_PINS[LINUX_ARCH]
    if not ARCHIVE.exists() or ARCHIVE.stat().st_size != pin['bytes']:
        run_command(['curl', '--fail', '--location', '--max-time', '1800', '--speed-time', '30',
                     '--speed-limit', '1024', '--continue-at', '-', URL, '--output', ARCHIVE])
    if digest(ARCHIVE) != SHA256:
        raise RuntimeError('FAIL: CEF archive SHA256 differs; never extracting it')
    # The verified upstream archive is immutable. Extraction has no lifecycle hooks.
    if not (CEF / 'cmake/FindCEF.cmake').exists():
        run_command(['tar', '-xjf', ARCHIVE, '-C', BASE])
    stamp = BASE / f'build-{LINUX_ARCH}.json'
    identity = linux_fingerprint()
    helper = APP / 'AxioCEFProbeHelper'
    if BINARY.exists() and helper.exists() and stamp.exists() and json.loads(stamp.read_text()).get('fingerprint') == identity:
        emit('PASS', action='reused_build', binary=str(BINARY), platform=LINUX_ARCH, sandbox=linux_sandbox_status())
        return
    APP.mkdir(parents=True, exist_ok=True)
    build = BASE / f'cmake-{LINUX_ARCH}'
    generator = ['-G', 'Ninja'] if shutil.which('ninja') else ['-G', 'Unix Makefiles']
    run_command(['cmake', '-S', ROOT / 'native/chromium-host', '-B', build, *generator, '-DCMAKE_BUILD_TYPE=Release',
                 '-DCMAKE_CXX_COMPILER=' + linux_compiler(), '-DCEF_ROOT=' + str(CEF), '-DAXIO_OUT=' + str(APP)])
    run_command(['cmake', '--build', build, '--parallel', str(max(1, os.cpu_count() or 1))])
    for name in LINUX_RUNTIME:
        link_or_copy(CEF / 'Release' / name, APP / name)
    for name in LINUX_RESOURCES:
        link_or_copy(CEF / 'Resources' / name, APP / name)
    # The distribution README permits shipping only the configured locale (en-US).
    (APP / 'locales').mkdir(exist_ok=True)
    link_or_copy(CEF / 'Resources/locales/en-US.pak', APP / 'locales/en-US.pak')
    # chrome-sandbox is copied (never hard-linked) so that `install-sandbox` changes only
    # this copy; an already installed identical root:root 4755 helper is kept.
    sandbox_source, sandbox_target = CEF / 'Release/chrome-sandbox', APP / 'chrome-sandbox'
    if not sandbox_target.exists() or digest(sandbox_target) != digest(sandbox_source):
        if sandbox_target.exists():
            sandbox_target.unlink()
        shutil.copy2(sandbox_source, sandbox_target)
    for notice in ['LICENSE.txt', 'CREDITS.html']:
        shutil.copy2(CEF / notice, APP / notice)
    stamp.write_text(json.dumps(dict(fingerprint=identity, cef=VERSION, platform=LINUX_ARCH, archive_sha256=SHA256,
                                     built_at=time.time()), indent=2) + '\n')
    emit('PASS', action='native_build', binary=str(BINARY), platform=LINUX_ARCH, sandbox=linux_sandbox_status())


def read_int(path):
    try:
        return int(Path(path).read_text().strip())
    except (OSError, ValueError):
        return None


def suid_helper_installed():
    helper = APP / 'chrome-sandbox'
    if not helper.exists():
        return False
    info = helper.stat()
    return info.st_uid == 0 and info.st_gid == 0 and (info.st_mode & 0o7777) == 0o4755


def linux_sandbox_status():
    """Which Chromium layer-1 sandbox this machine can provide. Read-only."""
    suid = suid_helper_installed()
    status = dict(suid_helper_installed=suid,
                  apparmor_restrict_unprivileged_userns=read_int('/proc/sys/kernel/apparmor_restrict_unprivileged_userns'),
                  unprivileged_userns_clone=read_int('/proc/sys/kernel/unprivileged_userns_clone'),
                  max_user_namespaces=read_int('/proc/sys/user/max_user_namespaces'))
    userns = False
    if shutil.which('unshare'):
        with contextlib.suppress(OSError, subprocess.SubprocessError):
            userns = subprocess.run(['unshare', '--user', '--map-root-user', '--pid', '--net', '--fork', 'true'],
                                    capture_output=True, timeout=10).returncode == 0
    status['unprivileged_userns'] = userns
    namespace = (userns and status['apparmor_restrict_unprivileged_userns'] != 1
                 and status['unprivileged_userns_clone'] != 0 and (status['max_user_namespaces'] or 0) > 0)
    status['expected'] = 'namespace' if namespace else ('suid' if suid else None)
    status['usable'] = status['expected'] is not None
    return status


def install_sandbox():
    """Explicit privileged step: the unchanged pinned chrome-sandbox becomes root:root 4755."""
    linux_host_check()
    helper = APP / 'chrome-sandbox'
    if not helper.is_file() or digest(helper) != digest(CEF / 'Release/chrome-sandbox'):
        raise RuntimeError('BLOCKED_ENV: run `probe.py setup` first; chrome-sandbox must equal the pinned file')
    print('Installing the pinned Chromium SUID sandbox helper (sudo chown root:root, chmod 4755): ' + str(helper),
          flush=True)
    for command in (['sudo', 'chown', 'root:root', str(helper)], ['sudo', 'chmod', '4755', str(helper)]):
        subprocess.run(command, check=True, timeout=300)
    status = linux_sandbox_status()
    emit('PASS' if status['suid_helper_installed'] else 'FAIL', action='install_sandbox', sandbox=status)
    return 0 if status['suid_helper_installed'] else 1


def linux_check():
    linux_host_check()
    if not BINARY.exists() or not (APP / 'AxioCEFProbeHelper').exists():
        raise RuntimeError('BLOCKED_ENV: CEF native component is not built; run probe.py setup')
    stamp = BASE / f'build-{LINUX_ARCH}.json'
    if not stamp.exists() or json.loads(stamp.read_text()).get('fingerprint') != linux_fingerprint():
        raise RuntimeError('BLOCKED_ENV: native CEF rebuild required; run probe.py setup')
    status = linux_sandbox_status()
    if not status['usable']:
        raise RuntimeError('BLOCKED_ENV: no usable Chromium sandbox (unprivileged user namespaces are unavailable '
                           'and chrome-sandbox is not root:root 4755). Run `python3 native/chromium-host/probe.py '
                           'install-sandbox` (sudo). The host never runs without its sandbox.')
    emit('PASS', action='native_build_check', version=VERSION, platform=LINUX_ARCH, sandbox=status)
    return status


def linux_native_test():
    if not IS_LINUX or LINUX_ARCH is None:
        raise RuntimeError('BLOCKED_ENV: Linux native tests need x86_64 or aarch64 Linux')
    compiler = linux_compiler()
    if not compiler:
        raise RuntimeError('BLOCKED_ENV: no C++20 compiler (g++ or clang++)')
    here = ROOT / 'native/chromium-host'
    out = BASE / 'tests'
    out.mkdir(parents=True, exist_ok=True)
    tests = [('transport-test', [here / 'test_transport.cc'], [], 15),
             ('transport-damage-test', [here / 'tests/transport_damage_test.cc'], ['-I', here], 15),
             ('transport-damage-payload-test', [here / 'tests/transport_damage_payload_test.cc'], ['-I', here], 15),
             ('transport-memfd-test', [here / 'tests/transport_memfd_test.cc'], ['-I', here], 15),
             ('a11y-core-test', [here / 'tests/a11y_core_test.cc'], ['-I', here], 30),
             ('core-test', [here / 'tests/core_test.cc'], ['-I', here], 15)]
    if (CEF / 'include').is_dir():
        # Bounded exit of a stuck host: kills every descendant, then exits (no CEF runtime).
        tests.append(('exit-watchdog-test', [here / 'tests/exit_watchdog_test.cc', here / 'linux/platform_linux.cc'],
                      ['-I', here, '-I', CEF, '-DCEF_API_VERSION=15400'], 30))
    else:
        emit('SKIPPED', test='exit_watchdog_test', reason='needs the pinned CEF headers; run probe.py setup first')
    for name, sources, flags, limit in tests:
        run_command([compiler, '-std=c++20', '-Wall', '-Wextra', '-pthread', *flags, *sources, '-o', out / name])
        run_command([out / name], timeout_seconds=limit)
    emit('SKIPPED', test='crash_guard_test', reason='macOS only: inherited Mach exception ports (Breakpad); '
         'the Linux bounded exit is covered by exit_watchdog_test')
    emit('PASS', action='native_tests', platform=LINUX_ARCH, tests=[name for name, *_ in tests])


def host_environment(profile):
    """The only environment an owned host process receives (no secrets, no personal paths).

    macOS: unchanged PATH/TMPDIR. Linux adds HOME=profile (Chromium's NSS database,
    font and cache paths stay inside the owned profile, never the user's ~/.pki) and the
    X display variables when present (X11 ozone backend for the shared clipboard).
    """
    env = {'PATH': '/usr/bin:/bin:/usr/sbin:/sbin', 'TMPDIR': str(profile)}
    if IS_LINUX:
        env['HOME'] = str(profile)
        for name in ('DISPLAY', 'XAUTHORITY'):
            if os.environ.get(name):
                env[name] = os.environ[name]
    return env


def linux_proc_stat(pid):
    try:
        text = Path(f'/proc/{pid}/stat').read_text()
    except OSError:
        return None
    fields = text[text.rfind(')') + 2:].split()
    return dict(state=fields[0], ppid=int(fields[1]), pgrp=int(fields[2]))


def linux_descendants(root):
    children = {}
    for entry in os.listdir('/proc'):
        if entry.isdigit():
            stat = linux_proc_stat(int(entry))
            if stat:
                children.setdefault(stat['ppid'], []).append(int(entry))
    found, pending = [], [root]
    while pending:
        for child in children.get(pending.pop(), []):
            if child not in found:
                found.append(child)
                pending.append(child)
    return found


def linux_process_type(argv):
    """Chromium process type from /proc/<pid>/cmdline. Chromium rewrites its process title
    (setproctitle) into one space-separated string, so `--type=` is searched in the whole
    command line, not only as a separate argument."""
    text = b' '.join(argv).decode(errors='replace')
    found = re.search(r'(?:^|\s)--type=([A-Za-z0-9_-]+)', text)
    if found:
        return found.group(1)
    return Path(text.split(' ', 1)[0]).name


def linux_process_snapshot(root):
    """Sandbox state of this host's own processes (process type and kernel status only)."""
    own_user_ns = os.readlink('/proc/self/ns/user')
    rows = []
    for pid in [root] + linux_descendants(root):
        try:
            argv = Path(f'/proc/{pid}/cmdline').read_bytes().split(b'\0')
            status = Path(f'/proc/{pid}/status').read_text()
        except OSError:
            continue
        kind = 'browser' if pid == root else linux_process_type(argv)
        fields = dict(line.split(':', 1) for line in status.splitlines() if ':' in line)
        user_ns = None
        with contextlib.suppress(OSError):
            user_ns = os.readlink(f'/proc/{pid}/ns/user')
        rows.append(dict(pid=pid, type=kind, seccomp=read_int_value(fields.get('Seccomp')),
                         pid_namespace_depth=len(fields.get('NSpid', '').split()),
                         user_namespace='same' if user_ns == own_user_ns else ('new' if user_ns else 'unreadable')))
    renderers = [row for row in rows if row['type'] == 'renderer']
    observation = dict(processes=rows,
                       renderers=len(renderers),
                       renderer_seccomp_bpf=bool(renderers) and all(row['seccomp'] == 2 for row in renderers),
                       renderer_pid_namespace=bool(renderers) and all(row['pid_namespace_depth'] >= 2 for row in renderers),
                       suid_helper_process=any(row['type'] == 'chrome-sandbox' for row in rows))
    # Layer 1 (Chromium docs/linux/sandboxing.md): the namespace sandbox puts renderers in a
    # new user namespace; the SUID helper keeps our user namespace but a new PID namespace.
    # SUID-sandboxed processes are not dumpable, so their namespace links are unreadable;
    # they count as SUID only when the installed root:root 4755 helper is the one available.
    if any(row['user_namespace'] == 'new' for row in renderers):
        observation['layer1'] = 'namespace'
    elif observation['suid_helper_process'] or (
            observation['renderer_pid_namespace'] and all(row['user_namespace'] == 'same' for row in renderers)) or (
            observation['renderer_pid_namespace'] and suid_helper_installed()
            and all(row['user_namespace'] in ('same', 'unreadable') for row in renderers)):
        observation['layer1'] = 'suid'
    else:
        observation['layer1'] = 'unknown' if observation['renderer_pid_namespace'] else 'none'
    return observation


def read_int_value(text):
    try:
        return int((text or '').strip())
    except ValueError:
        return None


def linux_orphans():
    """Live processes started from this host's runtime directory (after it should be gone)."""
    marker = str(APP).encode() + b'/'
    orphans = []
    for entry in os.listdir('/proc'):
        if not entry.isdigit() or int(entry) == os.getpid():
            continue
        with contextlib.suppress(OSError):
            argv0 = Path(f'/proc/{entry}/cmdline').read_bytes().split(b'\0')[0]
            stat = linux_proc_stat(int(entry))
            if argv0.startswith(marker) and stat and stat['state'] != 'Z':
                orphans.append(dict(pid=int(entry), program=Path(argv0.decode(errors='replace')).name))
    return orphans


class FixtureHandler(http.server.BaseHTTPRequestHandler):
    """Only one synthetic file; never directory serving, HEAD, or proxy requests."""
    def log_message(self, *_):
        pass

    def setup(self):
        super().setup()
        self.connection.settimeout(3)

    def record_request(self, status):
        # Record only known synthetic URL/Host values; rejected input is not logged.
        hosts = self.headers.get_all('Host', [])
        item = dict(timestamp=time.time(), method=self.command, status=status,
                    path=self.path if self.path in ['/engine.html', '/engine.html?page=2'] else 'REJECTED_PATH',
                    host=hosts[0] if hosts == [f'127.0.0.1:{self.server.server_port}'] else 'REJECTED_HOST')
        log = getattr(self.server, 'request_log', None)
        if log:
            with log.open('a') as out:
                out.write(json.dumps(item) + '\n')

    def do_GET(self):
        hosts = self.headers.get_all('Host', [])
        if hosts != [f'127.0.0.1:{self.server.server_port}']:
            self.record_request(403)
            self.send_error(403)
            return
        if self.path not in ['/engine.html', '/engine.html?page=2']:
            self.record_request(404)
            self.send_error(404)
            return
        data = (ROOT / 'tests/fixtures/engine.html').read_bytes()
        self.record_request(200)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        self.wfile.write(data)

    def denied_method(self):
        self.record_request(405)
        self.send_error(405)

    do_HEAD = do_POST = do_PUT = do_DELETE = do_OPTIONS = do_TRACE = denied_method


def archive_previous_run():
    """Keep actual prior logs/frames immutable when the root re-runs the probe."""
    if not (EVIDENCE / 'cef-probe-result.json').exists():
        return
    archive = Path(tempfile.mkdtemp(prefix='cef-run-', dir=EVIDENCE))
    names = ['cef-e0.jsonl', 'cef-stderr.log', 'cef-runtime.log',
             'cef-probe-result.json', 'cef-launch-sample.txt',
             'cef-fixture-requests.jsonl', 'cef-owned-helpers.txt']
    paths = [EVIDENCE / name for name in names]
    paths += list(EVIDENCE.glob('cef-e0-*.png'))
    for path in paths:
        if path.is_file():
            shutil.copy2(path, archive / path.name)
    # A failed next run must not present a previous run's PNG as fresh evidence.
    for path in paths:
        if path.is_file():
            path.unlink()
    emit('ARCHIVED_EVIDENCE', path=str(archive))


def cleanup_group(process):
    """The group is session-owned even when the original parent already exited."""
    if process is None:
        return False
    def exists():
        process.poll()  # Reap the owned parent if it has exited.
        try:
            os.killpg(process.pid, 0)
            return True
        except ProcessLookupError:
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


def remove_created_profile(profile, process, prefix='cef-profile-'):
    """Remove only this invocation's mkdtemp directory after its owned group exits."""
    if profile.parent != BASE or not profile.name.startswith(prefix) or profile.is_symlink():
        return False
    if process is not None:
        if process.poll() is None:
            return False
        deadline = time.monotonic() + 2
        while True:
            try:
                os.killpg(process.pid, 0)
            except ProcessLookupError:
                break
            if time.monotonic() >= deadline:
                return False
            time.sleep(.1)
    try:
        shutil.rmtree(profile)
    except OSError:
        return False
    return not profile.exists()


def diagnose_unpainted(process, stop, output):
    """One bounded sample of this native session, only when no paint arrived."""
    if stop.wait(5) or process.poll() is not None:
        return
    output.flush()
    if 'native_frame' in (EVIDENCE / 'cef-e0.jsonl').read_text():
        return
    try:
        group = subprocess.run(['pgrep', '-g', str(process.pid)], capture_output=True,
                               text=True, timeout=3)
        pids = [int(value) for value in group.stdout.split()]
        if not pids:
            return
        rows = subprocess.run(['ps', '-p', ','.join(map(str, pids)), '-o',
                               'pid=,ppid=,pgid=,stat=,etime=,command='],
                              capture_output=True, text=True, timeout=3)
        (EVIDENCE / 'cef-owned-helpers.txt').write_text(rows.stdout)
        if IS_LINUX:
            # Where each owned process waits in the kernel (no root needed for wchan;
            # syscall/stack are read only where permitted).
            lines = []
            for pid in pids:
                fields = {}
                for name in ('wchan', 'syscall', 'stack'):
                    with contextlib.suppress(OSError):
                        fields[name] = Path(f'/proc/{pid}/{name}').read_text().strip().replace('\n', ' | ')[:400]
                lines.append(json.dumps(dict(pid=pid, **fields)))
            (EVIDENCE / 'cef-owned-helpers-wait.jsonl').write_text('\n'.join(lines) + '\n')
        for pid in ([] if IS_LINUX else pids[:5]):  # /usr/bin/sample is macOS-only
            if stop.is_set():
                break
            with contextlib.suppress(subprocess.TimeoutExpired):
                subprocess.run(['/usr/bin/sample', str(pid), '1', '1', '-file',
                                str(EVIDENCE / f'cef-helper-{pid}.sample.txt')],
                               capture_output=True, timeout=5)
    except (OSError, subprocess.SubprocessError, ValueError) as error:
        (EVIDENCE / 'cef-helper-diagnostic-error.txt').write_text(type(error).__name__ + '\n')


def observe_linux_sandbox(process, stop, holder):
    """Linux: once the fixture painted, record the kernel sandbox state of the owned processes."""
    deadline = time.monotonic() + 20
    while not stop.wait(.5) and process.poll() is None and time.monotonic() < deadline:
        with contextlib.suppress(OSError):
            if 'native_frame' in (EVIDENCE / 'cef-e0.jsonl').read_text():
                break
    if process.poll() is None:
        with contextlib.suppress(OSError, ValueError, IndexError):
            holder['sandbox_observation'] = linux_process_snapshot(process.pid)


def run():
    check()
    EVIDENCE.mkdir(exist_ok=True)
    archive_previous_run()
    # A unique, non-personal profile on every component run. No global browser process lookup.
    profile = Path(tempfile.mkdtemp(prefix='cef-profile-', dir=BASE))
    os.chmod(profile, 0o700)
    server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), FixtureHandler)
    server.request_log = EVIDENCE / 'cef-fixture-requests.jsonl'
    server.request_log.write_text('')
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    started = time.time()
    code = 75
    process = None
    group_cleanup_required = False
    timed_out = False
    diagnostic_stop = threading.Event()
    diagnostic = None
    observer, observed = None, {}
    def interrupted(_signum, _frame):
        raise KeyboardInterrupt
    previous_int = signal.getsignal(signal.SIGINT)
    previous_term = signal.signal(signal.SIGTERM, interrupted)
    try:
        url = f'http://127.0.0.1:{server.server_port}/engine.html'
        with (EVIDENCE / 'cef-e0.jsonl').open('w') as out, (EVIDENCE / 'cef-stderr.log').open('w') as err:
            process = subprocess.Popen([str(BINARY), url, str(profile), str(EVIDENCE)],
                                       stdout=out, stderr=err, start_new_session=True,
                                       env=host_environment(profile))
            emit('RUNNING', native_pid=process.pid, profile=str(profile))
            diagnostic = threading.Thread(target=diagnose_unpainted,
                                          args=(process, diagnostic_stop, out), daemon=True)
            diagnostic.start()
            if IS_LINUX:
                observer = threading.Thread(target=observe_linux_sandbox, args=(process, diagnostic_stop, observed),
                                            daemon=True)
                observer.start()
            try:
                code = process.wait(timeout=95)
            except subprocess.TimeoutExpired:
                timed_out = True
                code = 75
                if not IS_LINUX:  # /usr/bin/sample is macOS-only
                    with contextlib.suppress(subprocess.TimeoutExpired, OSError):
                        subprocess.run(['/usr/bin/sample', str(process.pid), '1', '1',
                                        '-file', str(EVIDENCE / 'cef-launch-sample.txt')],
                                       timeout=5, capture_output=True)
    except KeyboardInterrupt:
        code = 130
    finally:
        # Ignore another termination signal only during bounded owned-process cleanup.
        signal.signal(signal.SIGTERM, signal.SIG_IGN)
        signal.signal(signal.SIGINT, signal.SIG_IGN)
        diagnostic_stop.set()
        if diagnostic:
            diagnostic.join(timeout=8)
        if observer:
            observer.join(timeout=8)
        group_cleanup_required = cleanup_group(process)
        server.shutdown()
        server.server_close()
        thread.join(timeout=3)
        signal.signal(signal.SIGTERM, previous_term)
        signal.signal(signal.SIGINT, previous_int)
    profile_removed = remove_created_profile(profile, process)
    if not profile_removed and code == 0:
        code = 76
    records = []
    log = EVIDENCE / 'cef-e0.jsonl'
    for line in (log.read_text() if log.exists() else '').splitlines():
        with contextlib.suppress(json.JSONDecodeError):
            records.append(json.loads(line))
    status = 'PASS' if code == 0 and any(x.get('event') == 'result' and x.get('E0') == 'PASS' for x in records) else 'FAIL'
    if timed_out and not records:
        status = 'BLOCKED_ENV'
    result = dict(E0=status, E1='BLOCKED_ENV', E2='BLOCKED_ENV', exit_code=code,
                  elapsed_seconds=round(time.time()-started,3), platform=platform.platform(),
                  cef=VERSION, archive_sha256=SHA256, profile=str(profile),
                  native_pid=process.pid if process else None,
                  profile_removed=profile_removed,
                  fixture_requests=[json.loads(line) for line in server.request_log.read_text().splitlines()],
                  timed_out=timed_out, group_cleanup_required=group_cleanup_required,
                  reason='Native launch timed out before any host event' if timed_out and not records else
                         'Native fixture rendering/input failed; inspect load events and fixture requests' if status != 'PASS' else
                         'CEF component only; Zen embedding and user switching are separate unverified gates')
    if IS_LINUX:
        # Clean shutdown: nothing of this host may outlive it, and its renderers ran sandboxed.
        orphans = linux_orphans()
        sandbox = observed.get('sandbox_observation')
        result.update(linux_arch=LINUX_ARCH, orphan_processes=orphans, sandbox_observation=sandbox,
                      sandbox_status=linux_sandbox_status())
        if result['E0'] == 'PASS' and (orphans or group_cleanup_required or not sandbox
                                       or not sandbox['renderer_seccomp_bpf'] or not sandbox['renderer_pid_namespace']):
            result.update(E0='FAIL', reason='Rendering passed, but helpers outlived the host or a renderer was not '
                                            'observed inside the seccomp-bpf + PID-namespace sandbox')
            status = 'FAIL'
            code = code or 1
            result['exit_code'] = code
    (EVIDENCE / 'cef-probe-result.json').write_text(json.dumps(result, indent=2)+'\n')
    emit(status, **result)
    return code


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['setup', 'check', 'run', 'test-native', 'install-sandbox'])
    args = parser.parse_args()
    try:
        if args.command == 'install-sandbox' and not IS_LINUX:
            raise RuntimeError('BLOCKED_ENV: install-sandbox is the Linux SUID sandbox step; macOS uses its own seatbelt')
        commands = {'setup': linux_setup if IS_LINUX else setup, 'check': check, 'run': run,
                    'test-native': native_test, 'install-sandbox': install_sandbox}
        result = commands[args.command]()
        # linux_check() returns the sandbox status for in-process callers (stream_test.py);
        # only an int is an exit code.
        sys.exit(result if isinstance(result, int) else 0)
    except (RuntimeError, subprocess.CalledProcessError, OSError) as exc:
        emit('BLOCKED_ENV' if 'BLOCKED_ENV' in str(exc) else 'FAIL', message=str(exc))
        sys.exit(2)
