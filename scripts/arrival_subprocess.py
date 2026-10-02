#!/usr/bin/env python3
"""Install the fixed lsof supervisor in the isolated external build root."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import storage

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "tools/axiosozo-arrival/arrival_lsof.py"
CONFIG = ROOT / "apps/browser/chrome/ProjectArrivalSubprocess.sys.mjs"
PYTHON = Path("/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11")


def expected_digest():
    match = re.search(r'ARRIVAL_LSOF_SHA256 = "([a-f0-9]{64})"', CONFIG.read_text())
    if not match:
        raise RuntimeError("ARRIVAL_SUBPROCESS_CONFIG_INVALID")
    return match.group(1)


def checked_file(path, digest=None, executable=False):
    info = path.lstat()
    if (not stat.S_ISREG(info.st_mode) or path.resolve() != path
            or info.st_uid != os.getuid() or info.st_nlink != 1 or info.st_mode & 0o022
            or executable and not os.access(path, os.X_OK)):
        raise RuntimeError("ARRIVAL_SUBPROCESS_FILE_REFUSED")
    if digest is not None and (stat.S_IMODE(info.st_mode) != 0o400 or info.st_size > 128 * 1024
            or hashlib.sha256(path.read_bytes()).hexdigest() != digest):
        raise RuntimeError("ARRIVAL_SUBPROCESS_HASH_MISMATCH")


def run(command):
    if not storage.mounted():
        raise RuntimeError("PROJECT_STORAGE_NOT_MOUNTED")
    root = storage.BUILD_ROOT
    digest = expected_digest()
    if SOURCE.is_symlink() or not SOURCE.is_file() or hashlib.sha256(SOURCE.read_bytes()).hexdigest() != digest:
        raise RuntimeError("ARRIVAL_SUBPROCESS_SOURCE_CHANGED")
    checked_file(PYTHON, executable=True)
    directory = root / "contexts"
    target = directory / ("arrival-lsof-" + digest + ".py")
    if command == "setup":
        directory.mkdir(mode=0o700, exist_ok=True)
    info = directory.lstat()
    if (not stat.S_ISDIR(info.st_mode) or directory.resolve() != directory
            or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700):
        raise RuntimeError("ARRIVAL_SUBPROCESS_DIRECTORY_REFUSED")
    if command == "setup" and not target.exists() and not target.is_symlink():
        descriptor = os.open(target, os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o400)
        with os.fdopen(descriptor, "wb") as out:
            out.write(SOURCE.read_bytes())
            out.flush()
            os.fsync(out.fileno())
    checked_file(target, digest)
    print(json.dumps({"status": "PASS", "build_root": str(root), "helper": str(target),
                      "sha256": digest, "interpreter": str(PYTHON)}, indent=2))
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=("setup", "check"))
    raise SystemExit(run(parser.parse_args().command))
