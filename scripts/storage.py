#!/usr/bin/env python3
"""Project-only APFS storage physically backed by T9; never resize shared images."""
import argparse
import fcntl
import json
import os
from pathlib import Path
import plistlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
IMAGE = Path('/Volumes/T9/AxioSozoBuild.sparsebundle')
# The mounted project volume. Several worktrees may build side by side on it,
# each in its own build root (AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/<name>).
VOLUME = Path('/Volumes/AxioSozoBuild')
# Top-level names on the volume that belong to the default (volume-root) build
# or are shared; a sub-root may never alias them.
RESERVED_SUBROOTS = {'zen', 'toolchains', 'cargo-home', 'cargo-target', 'caches', 'runtime', 'tmp',
                     'cef', 'providers', 'logs', 'release', 'diag', 'diagnostics', 'gui-fixtures'}
MOUNT_SHARED = '/Users/wout/.local/bin/mount-dev-storage'


def build_root(value=None):
    """The volume root, or one named build root directly below it. Anything
    else (relative, nested, `..`, a shared top-level name) is refused."""
    raw = os.environ.get('AXIOSOZO_BUILD_ROOT') if value is None else value
    if not raw or Path(raw) == VOLUME:
        return VOLUME
    path = Path(raw)
    if (not path.is_absolute() or path.parent != VOLUME or path.name in RESERVED_SUBROOTS
            or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,39}', path.name)):
        raise RuntimeError('INVALID_AXIOSOZO_BUILD_ROOT: ' + str(raw))
    return path


BUILD_ROOT = build_root()


def image_mounts():
    result = subprocess.run(['/usr/bin/hdiutil', 'info', '-plist'], capture_output=True, check=True)
    data = plistlib.loads(result.stdout)
    return [entity.get('mount-point') for item in data.get('images', [])
            if item.get('image-path') == str(IMAGE)
            for entity in item.get('system-entities', []) if entity.get('mount-point')]


def mounted():
    """The verified project volume is mounted and this build root exists on it."""
    if not (VOLUME.is_mount() and str(VOLUME) in image_mounts()):
        return False
    if BUILD_ROOT != VOLUME:
        BUILD_ROOT.mkdir(exist_ok=True)
        if BUILD_ROOT.is_symlink() or BUILD_ROOT.resolve() != BUILD_ROOT:
            return False
    return True


def report():
    active = mounted()
    return {'image': str(IMAGE), 'mountpoint': str(VOLUME), 'build_root': str(BUILD_ROOT), 'mounted': active,
            'image_exists': IMAGE.exists(), 'virtual_capacity_gib': 200,
            't9_free_gib': round(shutil.disk_usage('/Volumes/T9').free / 2**30, 2)
                if Path('/Volumes/T9').is_mount() else None,
            'build_free_gib': round(shutil.disk_usage(BUILD_ROOT).free / 2**30, 2)
                if active else None}


def ensure():
    subprocess.run([MOUNT_SHARED], check=True)
    # This lock only serializes this project's image creation/attachment.
    local = ROOT / '.local'
    local.mkdir(exist_ok=True)
    fd = os.open(local / 'storage.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if mounted():
            return report()
        if VOLUME.is_mount():
            raise RuntimeError('Unexpected mounted filesystem at project build path')
        if not Path('/Volumes/T9').is_mount():
            raise RuntimeError('T9 is unavailable; no internal-storage fallback')
        if IMAGE.is_symlink():
            raise RuntimeError('Refusing symlink at project disk-image path')
        if not IMAGE.exists():
            if shutil.disk_usage('/Volumes/T9').free < 50 * 2**30:
                raise RuntimeError('T9 needs at least 50 GiB free before native setup')
            subprocess.run(['/usr/bin/hdiutil', 'create', '-size', '200g', '-type', 'SPARSEBUNDLE',
                            '-fs', 'APFS', '-volname', 'AxioSozoBuild', '-nospotlight', str(IMAGE)],
                           check=True, timeout=180)
        if VOLUME.exists() and any(VOLUME.iterdir()):
            raise RuntimeError('Refusing to obscure files underneath the project mountpoint')
        mounts = image_mounts()
        if mounts:
            raise RuntimeError('Project image already mounted elsewhere: ' + repr(mounts))
        # macOS allows the standard /Volumes mount but denies a nested mountpoint
        # under another user-mounted APFS volume without administrator privileges.
        # The backing image remains on T9; never change global mount permissions.
        subprocess.run(['/usr/bin/hdiutil', 'attach', str(IMAGE), '-nobrowse'],
                       check=True, timeout=180)
        if not mounted():
            raise RuntimeError('Project image mount could not be verified')
        return report()


def environment(temporary):
    env = os.environ.copy()
    env.update({'AXIOSOZO_BUILD_ROOT': str(BUILD_ROOT), 'TMPDIR': str(temporary) + '/',
                'CARGO_TARGET_DIR': str(BUILD_ROOT / 'cargo-target'),
                'CLANG_MODULE_CACHE_PATH': str(BUILD_ROOT / 'caches/clang'),
                'SWIFTPM_MODULECACHE_OVERRIDE': str(BUILD_ROOT / 'caches/swiftpm'),
                'PIP_CACHE_DIR': str(BUILD_ROOT / 'caches/pip'),
                'npm_config_cache': str(BUILD_ROOT / 'caches/npm'),
                'PYTHONDONTWRITEBYTECODE': '1'})
    for key in ('CARGO_TARGET_DIR', 'CLANG_MODULE_CACHE_PATH', 'SWIFTPM_MODULECACHE_OVERRIDE',
                'PIP_CACHE_DIR', 'npm_config_cache'):
        Path(env[key]).mkdir(parents=True, exist_ok=True)
    return env


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['doctor', 'setup', 'exec'])
    parser.add_argument('argv', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    if args.command == 'doctor':
        info = report()
        print(json.dumps(info, indent=2))
        return 0 if info['mounted'] else 2
    if args.command == 'setup':
        print(json.dumps(ensure(), indent=2))
        return 0
    # Run this via dev-external. Its inherited defaults are overridden only for
    # this owned command; no global helper or user configuration is modified.
    if not mounted():
        raise RuntimeError('Project APFS volume is not mounted; run storage.py setup')
    argv = args.argv[1:] if args.argv[:1] == ['--'] else args.argv
    if not argv:
        parser.error('exec requires a command')
    (BUILD_ROOT / 'tmp').mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='command-', dir=BUILD_ROOT / 'tmp') as temporary:
        return subprocess.call(argv, env=environment(temporary))


if __name__ == '__main__':
    try:
        raise SystemExit(main())
    except (OSError, RuntimeError, subprocess.SubprocessError) as error:
        print('BLOCKED_ENV: ' + str(error), file=sys.stderr)
        raise SystemExit(2)
