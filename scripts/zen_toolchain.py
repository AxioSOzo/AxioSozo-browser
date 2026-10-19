#!/usr/bin/env python3
"""Project-local, checksum-pinned build tools. Never installs into HOME or system paths."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tarfile

import storage

ROOT = Path(__file__).resolve().parents[1]
BUILD_ROOT = storage.build_root()
# Pinned, checksum-verified tools are shared by every build root on the volume.
TOOLS = storage.VOLUME / 'toolchains/zen'
DOWNLOADS = TOOLS / 'downloads'
STORAGE = ROOT / 'scripts/storage.py'
EXTERNAL = '/Users/wout/.local/bin/dev-external'
LINUX = storage.LINUX


def host_tag():
    """darwin-arm64 (the original macOS pins), linux-x86_64 or linux-aarch64."""
    machine = platform.machine().lower()
    if LINUX:
        return 'linux-' + {'amd64': 'x86_64', 'arm64': 'aarch64'}.get(machine, machine)
    return 'darwin-' + machine


# macOS keeps its original pin file; each Linux architecture has its own.
PIN_FILE = (ROOT / ('patches/zen/toolchains-' + host_tag() + '.json') if LINUX
            else ROOT / 'patches/zen/toolchains.json')
# Optional pins are fetched only when their feature is enabled.
OPTIONAL_FEATURES = {'sccache': 'AXIOSOZO_SCCACHE'}
# Linux: pinned Firefox needs clang/LLVM >= 19 (build/moz.configure/toolchain.configure).
# Distribution packages install it versioned under /usr/lib/llvm-<N> (Ubuntu 24.04:
# clang-19 lld-19 llvm-19 libclang-19-dev); AXIOSOZO_LLVM_VERSION selects one.
LINUX_MIN_LLVM = 19


def linux_llvm():
    """(version, /usr/lib/llvm-<N>) of the selected system LLVM, or None."""
    if not LINUX:
        return None
    requested = os.environ.get('AXIOSOZO_LLVM_VERSION', '')
    candidates = []
    for directory in Path('/usr/lib').glob('llvm-*'):
        suffix = directory.name.removeprefix('llvm-')
        if suffix.isdigit() and (directory / 'bin/clang').is_file():
            candidates.append((int(suffix), directory))
    if requested:
        if not requested.isdigit():
            raise RuntimeError('INVALID_AXIOSOZO_LLVM_VERSION: ' + requested)
        candidates = [item for item in candidates if item[0] == int(requested)]
    candidates = [item for item in candidates if item[0] >= LINUX_MIN_LLVM]
    return max(candidates) if candidates else None


def hash_file(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def pins():
    if not PIN_FILE.is_file():
        raise RuntimeError('UNSUPPORTED_TOOLCHAIN_HOST: ' + host_tag() + ' has no pinned toolchain')
    result = json.loads(PIN_FILE.read_text())
    for name, pin in result.items():
        if not pin.get('sha256') or len(pin['sha256']) != 64 or not pin['url'].startswith('https://'):
            raise RuntimeError('UNVERIFIED_TOOLCHAIN_PIN: ' + name)
    return result


def enabled(name, pin):
    """A pin is used unless it is optional and its feature switch is off."""
    if not pin.get('optional'):
        return True
    return LINUX and os.environ.get(OPTIONAL_FEATURES.get(name, ''), '') == '1'


def system_tar():
    return '/usr/bin/tar' if Path('/usr/bin/tar').is_file() else '/bin/tar'


def environment():
    env = os.environ.copy()
    # A desktop terminal may carry another project's release/cross-compile flags.
    # Only this repository's maintained configuration selects native build mode.
    for key in ['ZEN_RELEASE', 'ZEN_CROSS_COMPILING', 'SCCACHE_GHA_ENABLED',
                'SURFER_MOZCONFIG_ONLY', 'MOZCONFIG', 'MOZ_ARTIFACT_BUILDS',
                'CC', 'CXX', 'CFLAGS', 'CXXFLAGS', 'CPPFLAGS', 'LDFLAGS',
                'RUSTC', 'RUSTC_WRAPPER', 'RUSTFLAGS',
                'CARGO_ENCODED_RUSTFLAGS', 'RUSTUP_TOOLCHAIN', 'BASH_ENV', 'ENV',
                'CDPATH', 'MAKEFLAGS', 'MFLAGS', 'DESTDIR', 'MOZ_FETCHES_DIR',
                'MOZBUILD_STATE_PATH', 'MACHRC', 'TASK_ID', 'MOZ_SCM_LEVEL',
                'MACH_USE_SYSTEM_PYTHON', 'MACH_BUILD_PYTHON_NATIVE_PACKAGE_SOURCE']:
        env.pop(key, None)
    for key in list(env):
        if key.startswith(('TASKCLUSTER_', 'TOOLTOOL_', 'SURFER_', 'WASM_', 'WASI_')):
            env.pop(key)
    tool_path = ':'.join(str(TOOLS / name / 'bin') for name in ['node', 'rust', 'python', 'tar', 'cbindgen'])
    if LINUX:
        # Pinned sccache (optional, AXIOSOZO_SCCACHE=1) ships its binary at the top level.
        tool_path += ':' + str(TOOLS / 'sccache')
        # The selected system LLVM (clang, clang++, ld.lld, llvm-config) precedes /usr/bin.
        llvm = linux_llvm()
        if llvm:
            tool_path += ':' + str(llvm[1] / 'bin')
    env.update({
        'PATH': tool_path + ':/usr/bin:/bin:/usr/sbin:/sbin',
        'CARGO_HOME': str(TOOLS / 'cargo-home'), 'RUSTUP_HOME': str(TOOLS / 'rustup-home'),
        'CARGO_BUILD_JOBS': '2', 'CMAKE_BUILD_PARALLEL_LEVEL': '2',
        'PIP_CACHE_DIR': str(TOOLS / 'pip-cache'), 'PYTHONDONTWRITEBYTECODE': '1',
        'npm_config_cache': str(TOOLS / 'npm-cache'), 'npm_config_userconfig': '/dev/null',
        'npm_config_globalconfig': str(TOOLS / 'npm-global-emptyrc'), 'npm_config_audit': 'false', 'npm_config_fund': 'false',
        'GIT_CONFIG_NOSYSTEM': '1', 'GIT_CONFIG_GLOBAL': '/dev/null',
        'CONFIG_SITE': '/dev/null',
        'npm_config_update_notifier': 'false',
    })
    return env


def wrapped(args):
    """macOS: dev-external + storage exec. Linux: storage exec only (no wrapper exists)."""
    command = [sys.executable, str(STORAGE), 'exec', '--', *map(str, args)]
    return command if LINUX else [EXTERNAL, *command]


def run(args, cwd=None, env=None):
    print('+ ' + ' '.join(map(str, args)), flush=True)
    subprocess.run(wrapped(args), cwd=cwd or ROOT, env=env or environment(), check=True)


def download(pin):
    path = DOWNLOADS / pin['filename']
    if path.is_file() and hash_file(path) == pin['sha256']:
        return path
    if path.exists():
        raise RuntimeError('ARCHIVE_CHECKSUM_MISMATCH: ' + str(path))
    partial = path.with_name(path.name + '.partial')
    run(['/usr/bin/curl', '--fail', '--location', '--retry', '3', '--continue-at', '-', '--output', partial, pin['url']])
    if hash_file(partial) != pin['sha256']:
        raise RuntimeError('DOWNLOAD_CHECKSUM_MISMATCH: ' + str(partial))
    partial.rename(path)
    return path


def extract(archive, destination):
    archive_hash = hash_file(archive)
    if (destination / '.extracted').is_file():
        if (destination / '.extracted').read_text().strip() != archive_hash:
            raise RuntimeError('EXTRACTED_TOOLCHAIN_PIN_MISMATCH: ' + str(destination))
        return
    receipt = destination.parent / (destination.name + '.extraction.json')
    expected = {'sha256': archive_hash, 'destination': str(destination)}
    if destination.exists():
        if not receipt.is_file() or json.loads(receipt.read_text()) != expected:
            raise RuntimeError('UNOWNED_TOOLCHAIN_DESTINATION: ' + str(destination))
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        receipt.write_text(json.dumps(expected) + '\n')
    destination.mkdir(parents=True, exist_ok=True)
    with tarfile.open(archive) as package:
        for member in package:
            if member.name.startswith('/') or '..' in Path(member.name).parts:
                raise RuntimeError('UNSAFE_ARCHIVE_PATH')
    # BSD tar (macOS) or the system GNU tar (Linux) is sufficient for tool
    # extraction. The pinned GNU tar is used by Surfer.
    # GNU tar run as root (containers) keeps archive modes such as 0775, which
    # the installers' "no group/other write" checks then refuse; apply the umask.
    owner_flags = ['--no-same-owner', '--no-same-permissions'] if LINUX else []
    run([system_tar(), '-xf', archive, '--strip-components=1', *owner_flags, '-C', destination])
    (destination / '.extracted').write_text(archive_hash + '\n')


def installed(name, pin):
    marker = TOOLS / name / '.installed'
    if not marker.is_file():
        return False
    if marker.read_text().strip() != pin['sha256']:
        raise RuntimeError('INSTALLED_TOOLCHAIN_PIN_MISMATCH: ' + name)
    return True


def fetch(only=None):
    if LINUX:
        storage.ensure()
    if not storage.mounted():
        raise RuntimeError('PROJECT_STORAGE_NOT_MOUNTED')
    DOWNLOADS.mkdir(parents=True, exist_ok=True)
    empty_npm_config = TOOLS / 'npm-global-emptyrc'
    if empty_npm_config.exists() and empty_npm_config.read_bytes():
        raise RuntimeError('UNEXPECTED_NPM_BUILD_CONFIG')
    if not empty_npm_config.exists():
        empty_npm_config.write_bytes(b'')
    for name, pin in pins().items():
        if only is not None and name not in only:
            continue
        if not enabled(name, pin):
            continue
        archive = download(pin)
        destination = TOOLS / name if name in ['node', 'python', 'wasi', 'sccache'] else TOOLS / 'sources' / name
        extract(archive, destination)
    print('Tool archives verified and extracted; source installer execution requires recorded audit hashes.')


def setup():
    fetch()
    locked = pins()
    for name, relative in [('rust', 'install.sh'), ('tar', 'configure'), ('cbindgen', 'build.rs')]:
        source = TOOLS / 'sources' / name
        expected = locked[name].get('audited_installer_sha256')
        if not expected or hash_file(source / relative) != expected:
            raise RuntimeError('INSTALLER_AUDIT_REQUIRED: ' + str(source / relative))
    if not installed('rust', locked['rust']):
        std = locked['rust'].get('std_component', 'rust-std-aarch64-apple-darwin')
        run(['/bin/bash', 'install.sh', '--prefix=' + str(TOOLS / 'rust'), '--disable-ldconfig',
             '--components=rustc,' + std + ',cargo'], TOOLS / 'sources/rust')
        (TOOLS / 'rust/.installed').write_text(locked['rust']['sha256'] + '\n')
    if not installed('tar', locked['tar']):
        source = TOOLS / 'sources/tar'
        tar_env = environment()
        if LINUX and os.geteuid() == 0:
            # GNU configure refuses root unless told; containers often run as root.
            tar_env['FORCE_UNSAFE_CONFIGURE'] = '1'
        run(['/bin/sh', 'configure', '--prefix=' + str(TOOLS / 'tar'), '--program-prefix=g', '--disable-nls'], source, tar_env)
        # GNU tar 1.35 detects Darwin libiconv but omits it from tar_LDADD
        # when NLS is disabled. The configure link probe verified -liconv.
        # glibc provides iconv itself, so Linux needs no extra library.
        libs = [] if LINUX else ['LIBS=-liconv']
        run(['/usr/bin/make', '-j2', *libs], source, tar_env)
        run(['/usr/bin/make', 'install', *libs], source, tar_env)
        (TOOLS / 'tar/.installed').write_text(locked['tar']['sha256'] + '\n')
    source = TOOLS / 'sources/cbindgen'
    if hash_file(source / 'Cargo.lock') != locked['cbindgen']['cargo_lock_sha256']:
        raise RuntimeError('CBINDGEN_LOCK_MISMATCH')
    if not installed('cbindgen', locked['cbindgen']):
        target = TOOLS / 'build/cbindgen'
        run(['cargo', 'build', '--locked', '--release', '--bin', 'cbindgen',
             '--target-dir', target, '--jobs', '2'], source)
        destination = TOOLS / 'cbindgen/bin'
        destination.mkdir(parents=True, exist_ok=True)
        shutil.copy2(target / 'release/cbindgen', destination / 'cbindgen')
        (TOOLS / 'cbindgen/.installed').write_text(locked['cbindgen']['sha256'] + '\n')
    binaries = ['node/bin/node', 'rust/bin/rustc', 'rust/bin/cargo', 'python/bin/python3', 'tar/bin/gtar', 'cbindgen/bin/cbindgen', 'wasi/bin/clang']
    if 'sccache' in locked and enabled('sccache', locked['sccache']):
        binaries.append('sccache/sccache')
    for binary in binaries:
        run([TOOLS / binary, '--version'])
    (TOOLS / 'installed.json').write_text(json.dumps({'pins': locked, 'scope': str(TOOLS), 'host': host_tag()}, indent=2) + '\n')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=['fetch', 'setup', 'host'])
    parser.add_argument('--only', help='fetch: only these pins (comma separated), e.g. node,python for CI')
    args = parser.parse_args()
    try:
        if args.command == 'host':
            print(json.dumps({'host': host_tag(), 'pin_file': str(PIN_FILE.relative_to(ROOT)),
                              'tools': str(TOOLS), 'supported': PIN_FILE.is_file()}, indent=2))
            sys.exit(0 if PIN_FILE.is_file() else 20)
        if args.only and args.command != 'fetch':
            parser.error('--only applies to fetch')
        if args.command == 'fetch':
            fetch(set(args.only.split(',')) if args.only else None)
        else:
            globals()[args.command]()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print('BLOCKED_ENV:', error, file=sys.stderr)
        sys.exit(20)
