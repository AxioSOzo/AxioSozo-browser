#!/usr/bin/env python3
"""Project-only build storage.

macOS: the APFS build volume on T9; never create, resize or detach disk images.
The build volume `AxioSozoBuild` lives inside the shared `Dev.sparsebundle`
image next to the `AxioSozo` source volume. Detaching that image would take
down the source volume, so this script only ever attaches and mounts.

Linux: a plain, user-owned directory. By default the gitignored `.build/`
directory of this checkout; `AXIOSOZO_BUILD_ROOT` may name another absolute
directory (for example a larger disk). No volume, image, mount helper or
macOS path is used or required.
"""
import argparse
import contextlib
import fcntl
import json
import os
from pathlib import Path
import platform
import plistlib
import re
import shutil
import stat
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
# Platform selection. Every macOS path below stays as it was; Linux uses
# linux_build_root() and never calls a macOS helper, hdiutil or diskutil.
LINUX = platform.system() == 'Linux'
# Gitignored default Linux build root of this checkout (see .gitignore).
LINUX_DEFAULT_ROOT = ROOT / '.build'
# Linux build roots never live in kernel/virtual filesystems.
LINUX_FORBIDDEN = (Path('/proc'), Path('/sys'), Path('/dev'))
IMAGE = Path('/Volumes/T9/Dev.sparsebundle')
# APFS volume name of the build volume inside IMAGE.
VOLUME_NAME = 'AxioSozoBuild'
# The mounted project volume. Several worktrees may build side by side on it,
# each in its own build root (AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/<name>).
VOLUME = Path('/Volumes/AxioSozoBuild')
DARWIN_VOLUME = VOLUME  # VOLUME becomes the build root on Linux (below)
# Top-level names on the volume that belong to the default (volume-root) build
# or are shared; a sub-root may never alias them.
RESERVED_SUBROOTS = {'zen', 'toolchains', 'cargo-home', 'cargo-target', 'caches', 'runtime', 'tmp',
                     'cef', 'providers', 'logs', 'release', 'diag', 'diagnostics', 'gui-fixtures'}
# Per-user helpers of this development layout (not part of this repository).
MOUNT_SHARED = Path.home() / '.local/bin/mount-dev-storage'
# System helper that mounts every Dev.sparsebundle volume (build volume -nobrowse).
MOUNT_HELPER = Path.home() / '.local/bin/mount-axiosozo'
# Machine-wide lock that both helpers hold while they attach or mount. This
# script holds it only for its own fallback attach/mount, never while it runs
# a helper (the helper takes it itself).
MOUNT_LOCK = Path.home() / 'Library/Caches/axiosozo-mount.lock'
# The helper exits 0 without doing anything while another mount holds
# MOUNT_LOCK, and nonzero when any of its other volumes fails, so its exit
# status says nothing about the build volume: rerun it at most every
# HELPER_RETRY seconds until the volume is verified or HELPER_WAIT has passed.
HELPER_WAIT = 120
HELPER_RETRY = 15
# One helper run; a pending macOS removable-volume prompt can block it.
HELPER_TIMEOUT = 300
MOUNT_LOCK_WAIT = 120
POLL_INTERVAL = 1


def linux_build_root(value=None):
    """Linux: AXIOSOZO_BUILD_ROOT (absolute, normalized, outside the source tree
    except the gitignored default) or the default `<checkout>/.build`."""
    raw = os.environ.get('AXIOSOZO_BUILD_ROOT') if value is None else value
    if not raw:
        return LINUX_DEFAULT_ROOT
    path = Path(raw)
    if (not path.is_absolute() or os.path.normpath(raw) != str(path) or path == Path('/')
            or any(path == forbidden or forbidden in path.parents for forbidden in LINUX_FORBIDDEN)):
        raise RuntimeError('INVALID_AXIOSOZO_BUILD_ROOT: ' + str(raw))
    # Never put build output into tracked source, or make the checkout part of
    # the build root; only the gitignored default lives inside the checkout.
    if path != LINUX_DEFAULT_ROOT and (path == ROOT or ROOT in path.parents or path in ROOT.parents):
        raise RuntimeError('INVALID_AXIOSOZO_BUILD_ROOT: ' + str(raw) + ' (inside or above the checkout)')
    return path


def build_root(value=None):
    """The volume root, or one named build root directly below it. Anything
    else (relative, nested, `..`, a shared top-level name) is refused."""
    if LINUX:
        return linux_build_root(value)
    return darwin_build_root(value)


def darwin_build_root(value=None):
    """macOS policy of build_root (pure; tests exercise it on every platform)."""
    raw = os.environ.get('AXIOSOZO_BUILD_ROOT') if value is None else value
    if not raw or Path(raw) == DARWIN_VOLUME:
        return DARWIN_VOLUME
    path = Path(raw)
    if (not path.is_absolute() or path.parent != DARWIN_VOLUME or path.name in RESERVED_SUBROOTS
            or not re.fullmatch(r'[a-z0-9][a-z0-9-]{0,39}', path.name)):
        raise RuntimeError('INVALID_AXIOSOZO_BUILD_ROOT: ' + str(raw))
    return path


BUILD_ROOT = build_root()
if LINUX:
    # No shared volume on Linux: the build root also holds the pinned
    # toolchains, the Cargo home and the engine components.
    VOLUME = BUILD_ROOT


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


def linux_ready():
    """Linux: the build root is an existing, user-owned real directory."""
    try:
        info = BUILD_ROOT.lstat()
    except FileNotFoundError:
        return False
    return (stat.S_ISDIR(info.st_mode) and info.st_uid == os.getuid()
            and BUILD_ROOT.resolve() == BUILD_ROOT)


def linux_free_gib():
    existing = BUILD_ROOT
    while not existing.exists() and existing != existing.parent:
        existing = existing.parent
    return round(shutil.disk_usage(existing).free / 2**30, 2)


def mounted():
    """The verified project volume is mounted and this build root exists on it."""
    if LINUX:
        return linux_ready()
    if not volume_verified():
        return False
    if BUILD_ROOT != VOLUME:
        BUILD_ROOT.mkdir(exist_ok=True)
        if BUILD_ROOT.is_symlink() or BUILD_ROOT.resolve() != BUILD_ROOT:
            return False
    return True


def report():
    if LINUX:
        ready = linux_ready()
        return {'platform': 'linux', 'build_root': str(BUILD_ROOT),
                'default_build_root': str(LINUX_DEFAULT_ROOT),
                'configured_by': 'AXIOSOZO_BUILD_ROOT' if os.environ.get('AXIOSOZO_BUILD_ROOT') else 'default',
                'mounted': ready, 'build_free_gib': linux_free_gib()}
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


def run_helper(helper):
    """Run one mount helper and return its exit status. After HELPER_TIMEOUT it
    gets SIGTERM, which the helpers turn into a clean exit that stops their own
    hdiutil/diskutil commands; SIGKILL only if that does not end it. Its output
    goes to stderr so that `setup` prints only the JSON report on stdout."""
    process = subprocess.Popen([str(helper)], stdout=2)
    try:
        return process.wait(timeout=HELPER_TIMEOUT)
    except subprocess.TimeoutExpired:
        process.terminate()
        try:
            process.wait(timeout=10)
        except subprocess.TimeoutExpired:
            process.kill()
            process.wait()
        raise RuntimeError(helper.name + ' did not finish within ' + str(HELPER_TIMEOUT) + ' s; a pending '
                           'macOS removable-volume permission prompt can block it') from None


def mount_shared():
    """Mount the shared DevStorage volume. Builds need it as well (dev-external
    puts their temporary files there), so a DevStorage problem stops setup
    here, before the build volume is touched."""
    try:
        status = run_helper(MOUNT_SHARED)
    except OSError as error:
        raise RuntimeError('Cannot run ' + str(MOUNT_SHARED) + ' to mount the shared DevStorage volume: '
                           + str(error)) from error
    if status:
        raise RuntimeError(MOUNT_SHARED.name + ' exited ' + str(status) + ' (see its message above): the shared '
                           'DevStorage volume is not available, which builds need, so the build volume was not '
                           'set up either. Fix DevStorage, then rerun storage.py setup')


def preflight():
    """Refuse every state in which mounting could hide files or pick the wrong
    volume. Read-only; run again under MOUNT_LOCK before a fallback mount."""
    if VOLUME.is_mount():
        if volume_verified():
            raise RuntimeError('Build root ' + str(BUILD_ROOT) + ' on ' + str(VOLUME)
                               + ' is not a plain directory (symlink or redirected path)')
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
    try:
        populated = VOLUME.exists() and any(VOLUME.iterdir())
    except PermissionError:
        # A mountpoint folder left behind by Disk Arbitration (mode 0111).
        raise RuntimeError('Cannot read the leftover mountpoint folder ' + str(VOLUME) + '; if it is empty, '
                           'remove it with `sudo rmdir ' + str(VOLUME) + '` and rerun storage.py setup') from None
    if populated:
        raise RuntimeError('Refusing to obscure files underneath the project mountpoint')


def wait_for_helper():
    """Run MOUNT_HELPER until the build volume is verified, rerunning it at most
    every HELPER_RETRY seconds, for up to HELPER_WAIT seconds (a run already in
    progress may finish, up to HELPER_TIMEOUT). Its exit status is ignored, and
    no lock is held here: the helper takes MOUNT_LOCK itself, and an older
    helper also took the main checkout's former .local/storage.lock, so holding
    either here would make it skip the build volume."""
    deadline = time.monotonic() + HELPER_WAIT
    next_run = time.monotonic()
    while True:
        if time.monotonic() >= next_run:
            run_helper(MOUNT_HELPER)
            next_run = time.monotonic() + HELPER_RETRY
        if mounted():
            return True
        remaining = deadline - time.monotonic()
        if remaining <= 0:
            return False
        time.sleep(min(POLL_INTERVAL, remaining))


@contextlib.contextmanager
def mount_lock():
    """Hold MOUNT_LOCK so a fallback attach/mount never races the helpers;
    wait for it at most MOUNT_LOCK_WAIT seconds."""
    MOUNT_LOCK.parent.mkdir(parents=True, exist_ok=True)
    fd = os.open(MOUNT_LOCK, os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'w') as lock:
        deadline = time.monotonic() + MOUNT_LOCK_WAIT
        while True:
            try:
                fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                break
            except BlockingIOError:
                if time.monotonic() >= deadline:
                    raise RuntimeError('Another mount still holds ' + str(MOUNT_LOCK) + ' after '
                                       + str(MOUNT_LOCK_WAIT) + ' s; rerun storage.py setup later') from None
                time.sleep(POLL_INTERVAL)
        yield


def linux_ensure():
    """Create the Linux build root (private) and refuse links or foreign owners."""
    BUILD_ROOT.parent.mkdir(parents=True, exist_ok=True)
    try:
        BUILD_ROOT.mkdir(mode=0o700)
    except FileExistsError:
        pass
    if not linux_ready():
        raise RuntimeError('UNSAFE_AXIOSOZO_BUILD_ROOT: ' + str(BUILD_ROOT)
                           + ' must be a real directory owned by this user (no symlink)')
    return report()


def ensure():
    if LINUX:
        return linux_ensure()
    mount_shared()
    if mounted():
        return report()
    preflight()
    if MOUNT_HELPER.is_file() and os.access(MOUNT_HELPER, os.X_OK):
        if not wait_for_helper():
            raise RuntimeError('Build volume ' + VOLUME_NAME + ' from ' + str(IMAGE) + ' was still not verified at '
                               + str(VOLUME) + ' ' + str(HELPER_WAIT) + ' s after starting ' + str(MOUNT_HELPER)
                               + ' (see its messages above); rerun storage.py setup once it can mount the volume')
        return report()
    with mount_lock():
        # A helper run may have mounted the volume while this one waited.
        if not mounted():
            preflight()
            attach_and_mount()
    if not mounted():
        raise RuntimeError('Build volume ' + VOLUME_NAME + ' from ' + str(IMAGE) + ' could not be verified at '
                           + str(VOLUME) + ' after mounting it')
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
    # macOS: run this via dev-external. Its inherited defaults are overridden only
    # for this owned command; no global helper or user configuration is modified.
    # Linux: there is no wrapper; the build root is created on demand.
    if LINUX:
        linux_ensure()
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
