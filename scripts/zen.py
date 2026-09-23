#!/usr/bin/env python3
"""Audited Zen source adapter. Never substitutes a stock app for a missing build."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import re
import plistlib
import shutil
import subprocess
import sys
import urllib.request
import zen_toolchain
import zen_import

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = ROOT / 'upstream/zen'
BUILD_ROOT = Path(os.environ.get('AXIOSOZO_BUILD_ROOT', '/Volumes/AxioSozoBuild'))
BUILD = BUILD_ROOT / 'zen'
STAGE = BUILD / 'source'
OBJECT = BUILD / 'obj'
EXTERNAL = '/Users/wout/.local/bin/dev-external'
MOUNT = '/Users/wout/.local/bin/mount-dev-storage'
ZEN_SHA = 'f0f21cdade1fd519a660d756942f7032a8c7a518'
FIREFOX_REVISION = 'a80bd15ddee3b4bf3679aeba340e9d2db933c467'
FIREFOX_SHA512 = '0463304a0898670d248114f66f7c235166ae2397c3989a7c878c96f0c589fbbba1f1c87432daa22633b9fadd94394adf1dc37f0e67d22b066c75efe5eead75ce'
FIREFOX_URL = 'https://archive.mozilla.org/pub/firefox/candidates/156.0-candidates/build1/source/firefox-156.0.source.tar.xz'
BUNDLE_ID = 'nl.axiosozo.browser.dev'


def capture(args, cwd=None, env=None):
    try:
        result = subprocess.run(args, cwd=cwd, text=True, capture_output=True, timeout=30, env=env)
        return result.stdout.strip() if result.returncode == 0 else None
    except (OSError, subprocess.TimeoutExpired):
        return None


def file_hash(path, algorithm='sha512'):
    digest = hashlib.new(algorithm)
    with Path(path).open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def chrome_sources():
    return sorted(path for path in (ROOT / 'apps/browser/chrome').iterdir()
                  if path.is_file() and not path.name.startswith('._')
                  and path.suffix in ['.mjs', '.xhtml', '.css'])


def unexpected_source_changes(destination=UPSTREAM):
    """Reject changes that the pinned build clone would silently omit or overwrite."""
    tracked = capture(['git', '--no-optional-locks', '-c', 'core.hooksPath=/dev/null',
                       'diff', '--name-only', '-z', 'HEAD', '--'], destination)
    untracked = capture(['git', '--no-optional-locks', '-c', 'core.hooksPath=/dev/null',
                         'ls-files', '--others', '--exclude-standard', '-z'], destination)
    if tracked is None or untracked is None:
        return ['SOURCE_STATUS_UNAVAILABLE']
    records = {}
    for item in json.loads((ROOT / 'patches/zen/overlay.json').read_text()):
        records.setdefault(item['path'], set()).update((item['before_sha256'], item['after_sha256']))
    generated = {'prefs/axiosozo.yaml': ROOT / 'apps/browser/chrome/defaults.yaml'}
    for source in chrome_sources():
        generated['src/zen/common/axiosozo/' + source.name] = source
    state_path = destination / '.axiosozo-overlay-state.json'
    previous = {}
    if state_path.exists():
        try:
            state = json.loads(state_path.read_text())
            previous = state['files']
            if state['version'] != 1 or not isinstance(previous, dict) or not all(path in generated and isinstance(value, str) and re.fullmatch(r'[0-9a-f]{64}', value) for path, value in previous.items()):
                return ['INVALID_OVERLAY_STATE']
        except (ValueError, KeyError, TypeError):
            return ['INVALID_OVERLAY_STATE']
    unknown = []
    for relative in sorted(set((tracked + '\0' + untracked).split('\0'))):
        if not relative or any(part.startswith('._') for part in Path(relative).parts):
            continue
        if relative == '.axiosozo-overlay-state.json':
            continue
        path = destination / relative
        if relative in records and path.is_file():
            if file_hash(path, 'sha256') in records[relative]:
                continue
        if relative in generated and path.is_file():
            if path.read_bytes() == generated[relative].read_bytes() or file_hash(path, 'sha256') == previous.get(relative):
                continue
        unknown.append(relative)
    # This ignored input is particularly easy to lose when cloning a generated build stage.
    if (destination / 'mozconfig').exists():
        unknown.append('mozconfig (ignored upstream input; export to maintained build configuration)')
    return unknown


def doctor():
    issues = []
    if platform.system() != 'Darwin' or platform.machine() != 'arm64':
        issues.append('macOS Apple Silicon required for this build')
    if not Path('/Volumes/DevStorage').is_mount() or not BUILD_ROOT.is_mount():
        issues.append('Project APFS build storage is not mounted')
        free = 0
    else:
        free = shutil.disk_usage(BUILD_ROOT).free // (1024**3)
        if free < 30:
            issues.append(f'Project storage has {free} GiB free; Zen requires at least 30 GB')
    actual = capture(['git', 'rev-parse', 'HEAD'], UPSTREAM)
    if actual != ZEN_SHA:
        issues.append('Zen checkout missing or does not match pin')
    else:
        unexpected = unexpected_source_changes()
        if unexpected:
            issues.append('UNEXPORTED_SOURCE_CHANGES: ' + ', '.join(unexpected[:10]))
    tool_environment = zen_toolchain.environment()
    versions = {name: capture([name, '--version'], ROOT, tool_environment) for name in ['node', 'rustc', 'python3', 'gtar', 'cbindgen']}
    versions['npm_path'] = shutil.which('npm', path=tool_environment['PATH'])  # Do not invoke npm merely for discovery.
    if not versions['node'] or not versions['node'].startswith('v22.'):
        issues.append('Select Node 22 from upstream .nvmrc before setup')
    if not versions['rustc'] or not versions['rustc'].startswith('rustc 1.95.0 '):
        issues.append('Select Rust 1.95.0 from upstream .rust-toolchain before setup')
    if not versions['gtar']:
        issues.append('GNU tar (gtar) is required by pinned Surfer')
    if versions['cbindgen'] != 'cbindgen 0.29.4':
        issues.append('Project-local cbindgen0.29.4 required by pinned Firefox')
    if not versions['python3'] or not versions['python3'].startswith('Python 3.11.'):
        issues.append('Project-local Python3.11 required by pinned upstream')
    sdk_roots = [Path('/Library/Developer/CommandLineTools/SDKs'), Path('/Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs')]
    if not any(list(path.glob('MacOSX*.sdk')) for path in sdk_roots):
        issues.append('macOS SDK unavailable')
    native_build_verified = False
    stamp = BUILD / 'build-stamp.json'
    if stamp.is_file():
        try:
            saved = json.loads(stamp.read_text())
            native_build_verified = (saved.get('fingerprint') == fingerprint()
                                     and saved.get('executable') == str(validate_application()))
        except (OSError, ValueError, KeyError, RuntimeError):
            pass
    return {'status': 'BLOCKED_ENV' if issues else 'PASS', 'issues': issues,
            'free_gib': free, 'versions': versions, 'upstream_sha': actual,
            'upstream_python': '3.11', 'build_jobs': 2, 'build_root': str(BUILD),
            'application': str(OBJECT / 'dist/AxioSozo Dev.app'),
            'bundle_id': BUNDLE_ID, 'native_build_verified': native_build_verified}


def overlay(destination):
    """Strict idempotent patch application; unknown source changes are rejected."""
    manifest = json.loads((ROOT / 'patches/zen/overlay.json').read_text())
    apply_records(destination, manifest)
    target_dir = destination / 'src/zen/common/axiosozo'
    target_dir.mkdir(parents=True, exist_ok=True)
    for source in chrome_sources():
        shutil.copyfile(source, target_dir / source.name)
    shutil.copyfile(ROOT / 'apps/browser/chrome/defaults.yaml', destination / 'prefs/axiosozo.yaml')
    copied = [destination / 'prefs/axiosozo.yaml', *[target_dir / source.name for source in chrome_sources()]]
    (destination / '.axiosozo-overlay-state.json').write_text(json.dumps({'version': 1, 'files': {str(path.relative_to(destination)): file_hash(path, 'sha256') for path in copied}}, indent=2) + '\n')


def apply_records(destination, manifest):
    for index, item in enumerate(manifest):
        target = destination / item['path']
        text = target.read_text()
        current_hash = hashlib.sha256(text.encode()).hexdigest()
        later_results = {later['after_sha256'] for later in manifest[index + 1:]
                         if later['path'] == item['path']}
        if current_hash == item['after_sha256'] or current_hash in later_results:
            continue
        if current_hash != item['before_sha256']:
            raise RuntimeError(f'PATCH_CONFLICT: {item["path"]}')
        for old, new in item['replacements']:
            if text.count(old) != 1:
                raise RuntimeError(f'PATCH_AMBIGUOUS: {item["path"]}')
            text = text.replace(old, new, 1)
        target.write_text(text)


def fingerprint():
    digest = hashlib.sha256()
    for folder in [ROOT / 'apps/browser/chrome', ROOT / 'patches/zen']:
        for path in sorted(folder.rglob('*')):
            if path.is_file() and not path.name.startswith('._'):
                digest.update(str(path.relative_to(ROOT)).encode())
                digest.update(path.read_bytes())
    digest.update(Path(__file__).read_bytes())
    digest.update((ROOT / 'scripts/zen_toolchain.py').read_bytes())
    digest.update((ROOT / 'scripts/zen_import.py').read_bytes())
    return digest.hexdigest()


def run_command(args, cwd=STAGE, env=None):
    print('+ ' + ' '.join(str(arg) for arg in args), flush=True)
    subprocess.run([EXTERNAL, sys.executable, str(ROOT / 'scripts/storage.py'), 'exec', '--', *map(str, args)],
                   cwd=cwd, env=env or zen_toolchain.environment(), check=True)


def fetch_firefox(env=None):
    BUILD.mkdir(parents=True, exist_ok=True)
    archive = BUILD / 'firefox-156.0.source.tar.xz'
    if not archive.exists():
        partial = archive.with_suffix('.partial')
        run_command(['/usr/bin/curl', '--fail', '--location', '--retry', '3', '--continue-at', '-', '--output', partial, FIREFOX_URL], ROOT, env)
        if file_hash(partial) != FIREFOX_SHA512:
            raise RuntimeError('FIREFOX_CHECKSUM_MISMATCH')
        partial.rename(archive)
    if file_hash(archive) != FIREFOX_SHA512:
        raise RuntimeError('FIREFOX_CHECKSUM_MISMATCH')
    return archive


def setup(build_native=True):
    subprocess.run([MOUNT], check=True)
    if not BUILD_ROOT.is_mount():
        raise RuntimeError('PROJECT_STORAGE_NOT_MOUNTED')
    unexpected = unexpected_source_changes()
    if unexpected:
        raise RuntimeError('UNEXPORTED_SOURCE_CHANGES: ' + ', '.join(unexpected[:10]))
    zen_toolchain.setup()
    result = doctor()
    print(json.dumps(result, indent=2), flush=True)
    if result['issues']:
        return 20
    BUILD.mkdir(parents=True, exist_ok=True)
    if not STAGE.exists():
        # Independent generated build checkout on APFS; never relocate authoritative source.
        # Use Git transport even for this local clone, avoiding exFAT AppleDouble
        # files in .git/objects and sharing no mutable object storage.
        run_command(['git', '-c', 'core.hooksPath=/dev/null', 'clone', '--no-local', UPSTREAM, STAGE], ROOT)
    if capture(['git', 'rev-parse', 'HEAD'], STAGE) != ZEN_SHA:
        raise RuntimeError('BUILD_STAGE_PIN_MISMATCH')
    build_fingerprint = fingerprint()
    overlay(STAGE)
    env = zen_toolchain.environment()
    env.update({'MOZBUILD_STATE_PATH': str(BUILD / 'mozbuild'), 'npm_config_cache': str(BUILD / 'npm-cache'),
                'PIP_CACHE_DIR': str(BUILD / 'pip-cache'), 'PYTHONDONTWRITEBYTECODE': '1',
                'MACHRC': '/dev/null', 'DISABLE_TELEMETRY': '1',
                'MACH_BUILD_PYTHON_NATIVE_PACKAGE_SOURCE': 'none',
                'WASM_CC': str(zen_toolchain.TOOLS / 'wasi/bin/clang'),
                'WASM_CXX': str(zen_toolchain.TOOLS / 'wasi/bin/clang++'),
                'WASI_SYSROOT': str(zen_toolchain.TOOLS / 'wasi/share/wasi-sysroot'),
                'SURFER_NO_BRANDING_PATCH': 'true', 'ZEN_DISABLE_BOOTSTRAP': '1', 'MOZ_AUTOMATION': '1'})
    # No upstream lifecycle hooks, global package installation, or implicit toolchain bootstrap.
    dependencies_hash = file_hash(STAGE / 'package-lock.json', 'sha256')
    dependencies_stamp = STAGE / 'node_modules/.axiosozo-lock'
    if not dependencies_stamp.exists() or dependencies_stamp.read_text() != dependencies_hash:
        run_command(['npm', 'ci', '--ignore-scripts', '--no-audit', '--no-fund'], env=env)
        dependencies_stamp.write_text(dependencies_hash)
    # Pinned Surfer eagerly loads sharp even when branding is disabled; this reviewed
    # one-line lazy import avoids running native dependency install scripts.
    apply_records(STAGE, [json.loads((ROOT / 'patches/zen/surfer-no-branding.json').read_text())])
    apply_records(STAGE, [json.loads((ROOT / 'patches/zen/surfer-forward-import.json').read_text())])
    archive = fetch_firefox(env)
    engine = STAGE / 'engine'
    extraction = BUILD / 'firefox-extraction.json'
    if not engine.exists():
        extraction.write_text(json.dumps({'sha512': FIREFOX_SHA512, 'destination': str(engine)}))
        engine.mkdir()
    if not (engine / '.axiosozo-source-pin').exists():
        if not extraction.exists() or json.loads(extraction.read_text()) != {'sha512': FIREFOX_SHA512, 'destination': str(engine)} or (engine / '.git').exists():
            raise RuntimeError('UNOWNED_OR_MODIFIED_PARTIAL_FIREFOX_SOURCE')
        # Resume only our recorded incomplete extraction; never reset an active source checkout.
        # macOS libarchive has built-in xz support; GNU tar delegates to an
        # external xz executable absent from a clean system toolchain PATH.
        run_command(['/usr/bin/tar', '--strip-components=1', '-xf', archive, '-C', engine], env=env)
        (engine / '.axiosozo-source-pin').write_text(FIREFOX_REVISION)
    if not (engine / '.axiosozo-source-pin').exists() or (engine / '.axiosozo-source-pin').read_text() != FIREFOX_REVISION:
        raise RuntimeError('FIREFOX_STAGE_NOT_VERIFIED')
    if not (engine / '.git').exists():
        run_command(['git', '-c', 'core.hooksPath=/dev/null', 'init'], engine, env)
    # A large pristine import must not spawn an unowned background pack process
    # that overlaps the subsequent native compiler on this 16 GiB machine.
    run_command(['git', 'config', '--local', 'gc.auto', '0'], engine, env)
    if not capture(['git', 'rev-parse', 'HEAD'], engine):
        # Surfer's patch engine expects a pristine source commit. Local fixed identity only.
        run_command(['git', '-c', 'core.hooksPath=/dev/null', 'add', '.'], engine, env)
        run_command(['git', '-c', 'core.hooksPath=/dev/null', '-c', 'user.name=AxioSozo Local Build',
                     '-c', 'user.email=build@invalid', '-c', 'commit.gpgsign=false', 'commit', '-qm',
                     'Pinned Firefox 156.0 source'], engine, env)
    brand = engine / 'browser/branding/axiosozo-dev'
    if not brand.exists():
        shutil.copytree(engine / 'browser/branding/unofficial', brand)
    (brand / 'configure.sh').write_text('# MPL-2.0: development branding.\nMOZ_APP_DISPLAYNAME="AxioSozo Dev"\nMOZ_MACBUNDLE_ID=browser.dev\n')
    for name in ['brand.ftl', 'brand.properties']:
        relative = Path('locales/en-US') / name
        text = (engine / 'browser/branding/unofficial' / relative).read_text()
        text = text.replace('= Nightly', '= AxioSozo Dev').replace('=Nightly', '=AxioSozo Dev')
        text = text.replace('-brand-product-name = Firefox', '-brand-product-name = AxioSozo')
        text = text.replace('-vendor-short-name = Mozilla', '-vendor-short-name = AxioSozo')
        (brand / relative).write_text(text)
    # Rust ffprefs generates the exact preference patches used by this checkout.
    run_command(['npm', 'run', 'ffprefs'], env=env)
    # Zen's import:dumps filters the signed Mozilla search-config-v2 fallback
    # without re-signing it. Preserve exactly the pinned Mozilla data instead.
    signed_dump = json.loads((ROOT / 'patches/zen/signed-search-dump.json').read_text())
    if zen_import.restore_signed_search_dump(engine, signed_dump, env):
        print('PASS: restored pristine signed Mozilla search-config-v2 fallback', flush=True)
    native_patches = json.loads((ROOT / 'patches/zen/firefox-native.json').read_text())
    import_key, imported_files, needs_import = zen_import.prepare(STAGE, BUILD, env, native_patches)
    if needs_import:
        run_command(['npm', 'run', 'surfer', '--', 'import'], env=env)
        zen_import.finish(STAGE, BUILD, import_key, imported_files)
    zen_import.refresh_links(STAGE)
    installed_locales = zen_import.install_zen_locales(STAGE)
    print(f'PASS: verified 13 Zen en-US Fluent files ({installed_locales} installed)', flush=True)
    apply_records(engine, native_patches)
    run_command(['npm', 'run', 'surfer', '--', 'config', 'brand', 'axiosozo-dev'], env=env)
    run_command(['npm', 'run', 'surfer', '--', 'config', 'buildMode', 'dev'], env=env)
    (STAGE / 'mozconfig').write_text(f'''# AxioSozo development configuration, MPL-2.0.
mk_add_options MOZ_OBJDIR={OBJECT}
mk_add_options MOZ_MAKE_FLAGS="-j2"
ac_add_options --with-app-basename=AxioSozo
ac_add_options --with-distribution-id=nl.axiosozo
ac_add_options --disable-updater
ac_add_options --disable-debug-symbols
export MOZ_MACBUNDLE_ID=browser.dev
export MOZ_APP_REMOTINGNAME=AxioSozoDev
''')
    if not build_native:
        run_command(['npm', 'run', 'build', '--', '--jobs', '2'], env={**env, 'SURFER_MOZCONFIG_ONLY': '1'})
        print('PASS: pinned Firefox/Zen source imported and mozconfig generated; native compilation not started', flush=True)
        return 0
    run_command(['npm', 'run', 'build', '--', '--jobs', '2'], env=env)
    materialized = zen_import.materialize_zen_content_resources(
        STAGE, OBJECT / 'dist/AxioSozo Dev.app')
    print(f'PASS: verified 9 sandbox-readable Zen content resources ({materialized} materialized)', flush=True)
    executable = validate_application()
    (BUILD / 'build-stamp.json').write_text(json.dumps({'zen_sha': ZEN_SHA, 'firefox_revision': FIREFOX_REVISION,
                                                     'fingerprint': build_fingerprint, 'executable': str(executable)}))
    if fingerprint() != build_fingerprint:
        raise RuntimeError('SOURCE_CHANGED_DURING_BUILD: repeat setup to package the current chrome')
    return 0


def validate_application():
    app = OBJECT / 'dist/AxioSozo Dev.app'
    with (app / 'Contents/Info.plist').open('rb') as source:
        info = plistlib.load(source)
    if info.get('CFBundleIdentifier') != BUNDLE_ID:
        raise RuntimeError('BUNDLE_ID_NOT_ISOLATED')
    executable = app / 'Contents/MacOS' / info['CFBundleExecutable']
    if not executable.is_file():
        raise RuntimeError('APP_EXECUTABLE_MISSING')
    return executable


def describe():
    stamp = BUILD / 'build-stamp.json'
    if not stamp.exists():
        return {'status': 'BLOCKED_ENV', 'reason': 'CUSTOM_ZEN_BUILD_MISSING', 'setup': './dev setup'}
    unexpected = unexpected_source_changes()
    if unexpected:
        return {'status': 'BLOCKED_ENV', 'reason': 'UNEXPORTED_SOURCE_CHANGES', 'paths': unexpected[:10]}
    saved = json.loads(stamp.read_text())
    if saved.get('fingerprint') != fingerprint():
        return {'status': 'BLOCKED_ENV', 'reason': 'NATIVE_REBUILD_REQUIRED', 'setup': './dev setup'}
    return {'status': 'PASS', 'executable': str(validate_application()), 'bundle_id': BUNDLE_ID,
            'engine': 'gecko', 'cef_embedding': 'experimental_local_fixture_only',
            'fingerprint': saved['fingerprint']}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['doctor', 'setup', 'setup-source', 'prepare', 'check', 'describe', 'ready', 'run', 'smoke'])
    parser.add_argument('--profile', type=Path)
    parser.add_argument('--url', default='about:blank')
    args = parser.parse_args()
    if args.command == 'setup':
        return setup()
    if args.command == 'setup-source':
        return setup(build_native=False)
    if args.command == 'prepare':
        unexpected = unexpected_source_changes()
        if unexpected:
            raise RuntimeError('UNEXPORTED_SOURCE_CHANGES: ' + ', '.join(unexpected[:10]))
        overlay(UPSTREAM)
        print('PASS: privileged chrome overlay applied to pinned Zen source; native build not performed')
        return 0
    if args.command == 'check':
        for path in sorted((ROOT / 'apps/browser/chrome').glob('*.mjs')):
            if path.name.startswith('._'):
                continue
            subprocess.run(['node', '--check', path], check=True)
        subprocess.run(['node', '--test', ROOT / 'apps/browser/tests/gecko-adapter.test.mjs'], check=True)
        subprocess.run(['node', '--test', ROOT / 'apps/browser/tests/engine-probe-controls.test.mjs'], check=True)
        subprocess.run([sys.executable, '-B', ROOT / 'apps/browser/tests/test_bootstrap.py'], check=True)
        return 0
    if args.command == 'smoke':
        result = describe()
        if result['status'] == 'PASS':
            result = {'status': 'BLOCKED_ENV', 'reason': 'NATIVE_GUI_SMOKE_HARNESS_NOT_YET_VERIFIED'}
        print(json.dumps(result, indent=2))
        return 20
    if args.command == 'run':
        result = describe()
        if result['status'] != 'PASS':
            print(json.dumps(result, indent=2))
            return 20
        # Root dev owns profile locking and child process groups. No fallback to personal profiles.
        if not args.profile or not args.profile.is_absolute() or not args.profile.is_dir():
            raise RuntimeError('EXPLICIT_EXISTING_DEVELOPMENT_PROFILE_REQUIRED')
        profile = args.profile.resolve()
        namespace = BUILD_ROOT / 'runtime' / hashlib.sha256(str(ROOT).encode()).hexdigest()[:16]
        if profile.parent.parent != namespace or profile.name != 'gecko' or not re.fullmatch(r'[A-Za-z0-9-]+', profile.parent.name):
            raise RuntimeError('DEVELOPMENT_PROFILE_NAMESPACE_MISMATCH')
        if not (profile / '.axiosozo-dev-profile').is_file():
            raise RuntimeError('PROFILE_NOT_OWNED_BY_AXIOSOZO')
        os.execv(result['executable'], [result['executable'], '-no-remote', '-profile', str(profile), args.url])
    result = doctor() if args.command == 'doctor' else describe()
    print(json.dumps(result, indent=2))
    return 0 if result['status'] == 'PASS' else 20


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({'status': 'BLOCKED_ENV', 'error': str(error)}), file=sys.stderr)
        sys.exit(20)
