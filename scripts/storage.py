#!/usr/bin/env python3
"""Project-only APFS build volume on T9; never create, resize or detach disk images.

The build volume `AxioSozoBuild` lives inside the shared `Dev.sparsebundle`
image next to the `AxioSozo` source volume. Detaching that image would take
down the source volume, so this script only ever attaches and mounts.
"""
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
IMAGE = Path('/Volumes/T9/Dev.sparsebundle')
# APFS volume name of the build volume inside IMAGE.
VOLUME_NAME = 'AxioSozoBuild'
# The mounted project volume. Several worktrees may build side by side on it,
# each in its own build root (AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/<name>).
VOLUME = Path('/Volumes/AxioSozoBuild')
# Top-level names on the volume that belong to the default (volume-root) build
# or are shared; a sub-root may never alias them.
RESERVED_SUBROOTS = {'zen', 'toolchains', 'cargo-home', 'cargo-target', 'caches', 'runtime', 'tmp',
                     'cef', 'providers', 'logs', 'release', 'diag', 'diagnostics', 'gui-fixtures'}
MOUNT_SHARED = '/Users/wout/.local/bin/mount-dev-storage'
# System helper that mounts every Dev.sparsebundle volume (build volume -nobrowse).
MOUNT_HELPER = Path('/Users/wout/.local/bin/mount-axiosozo')


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


def image_entities():
    """System entities of IMAGE if attached, else None."""
    result = subprocess.run(['/usr/bin/hdiutil', 'info', '-plist'], capture_output=True, check=True)
    data = plistlib.loads(result.stdout)
    for item in data.get('images', []):
        if item.get('image-path') == str(IMAGE):
            return item.get('system-entities', [])
    return None


def image_mounts():
    return [entity.get('mount-point') for entity in image_entities() or [] if entity.get('mount-point')]


def disk_info(target):
    result = subprocess.run(['/usr/sbin/diskutil', 'info', '-plist', str(target)],
                            capture_output=True, check=True, timeout=30)
    return plistlib.loads(result.stdout)


def volume_verified():
    """VOLUME is the APFS volume named VOLUME_NAME inside IMAGE."""
    if not (VOLUME.is_mount() and str(VOLUME) in image_mounts()):
        return False
    info = disk_info(VOLUME)
    return (info.get('VolumeName') == VOLUME_NAME and info.get('MountPoint') == str(VOLUME)
            and str(info.get('FilesystemType', '')).lower() == 'apfs')


def mounted():
    """The verified project volume is mounted and this build root exists on it."""
    if not volume_verified():
        return False
    if BUILD_ROOT != VOLUME:
        BUILD_ROOT.mkdir(exist_ok=True)
        if BUILD_ROOT.is_symlink() or BUILD_ROOT.resolve() != BUILD_ROOT:
            return False
    return True


def report():
    active = mounted()
    return {'image': str(IMAGE), 'volume_name': VOLUME_NAME, 'mountpoint': str(VOLUME),
            'build_root': str(BUILD_ROOT), 'mounted': active, 'image_exists': IMAGE.exists(),
            't9_free_gib': round(shutil.disk_usage('/Volumes/T9').free / 2**30, 2)
                if Path('/Volumes/T9').is_mount() else None,
            'build_free_gib': round(shutil.disk_usage(BUILD_ROOT).free / 2**30, 2)
                if active else None}


def attach_and_mount():
    """Fallback without the helper: attach IMAGE without mounting (if needed) and
    mount only the APFS volume named VOLUME_NAME, hidden from Finder."""
    if image_entities() is None:
        subprocess.run(['/usr/bin/hdiutil', 'attach', '-nomount', str(IMAGE)],
                       check=True, timeout=180)
    candidates = []
    for entity in image_entities() or []:
        device = entity.get('dev-entry')
        if not device or entity.get('mount-point'):
            continue
        info = disk_info(device)
        if (info.get('VolumeName') == VOLUME_NAME
                and str(info.get('FilesystemType', '')).lower() == 'apfs'):
            candidates.append(device)
    if len(candidates) != 1:
        raise RuntimeError('Expected exactly one unmounted APFS volume named ' + VOLUME_NAME
                           + ' in ' + str(IMAGE) + ', found ' + repr(candidates))
    # The default mountpoint for this volume name is VOLUME (/Volumes/AxioSozoBuild).
    subprocess.run(['/usr/sbin/diskutil', 'mount', 'nobrowse', candidates[0]],
                   check=True, timeout=180)


def ensure():
    subprocess.run([MOUNT_SHARED], check=True)
    # This lock only serializes this project's build-volume attachment.
    local = ROOT / '.local'
    local.mkdir(exist_ok=True)
    fd = os.open(local / 'storage.lock', os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX)
        if mounted():
            return report()
        if VOLUME.is_mount():
            raise RuntimeError('Unexpected filesystem mounted at ' + str(VOLUME) + '; expected APFS volume '
                               + VOLUME_NAME + ' from ' + str(IMAGE) + ' (unmount any legacy build image manually)')
        if not Path('/Volumes/T9').is_mount():
            raise RuntimeError('T9 is unavailable; no internal-storage fallback')
        if IMAGE.is_symlink():
            raise RuntimeError('Refusing symlink at project disk-image path')
        if not IMAGE.is_dir():
            # Never create a substitute image; the build volume must already exist in Dev.sparsebundle.
            raise RuntimeError(str(IMAGE) + ' is missing; it must contain the APFS volume ' + VOLUME_NAME
                               + '. This script never creates disk images')
        if VOLUME.exists() and any(VOLUME.iterdir()):
            raise RuntimeError('Refusing to obscure files underneath the project mountpoint')
        if MOUNT_HELPER.is_file() and os.access(MOUNT_HELPER, os.X_OK):
            subprocess.run([str(MOUNT_HELPER)], check=True, timeout=300)
        else:
            attach_and_mount()
        if not mounted():
            raise RuntimeError('Build volume ' + VOLUME_NAME + ' from ' + str(IMAGE) + ' could not be verified at '
                               + str(VOLUME) + '; mount it with ' + str(MOUNT_HELPER))
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
