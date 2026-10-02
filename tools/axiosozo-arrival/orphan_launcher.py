"""Owned fake native parent; its death exercises helper parent-loss cleanup."""
import json
import os
from pathlib import Path
import subprocess
import sys
import secrets
import stat
import time


def publish_ready(path, document):
    """Publish a complete invented marker in this test's private directory."""
    path = Path(path).absolute()
    parent = path.parent
    info = parent.lstat()
    if (parent.resolve() != parent or not stat.S_ISDIR(info.st_mode)
            or info.st_uid != os.getuid() or stat.S_IMODE(info.st_mode) != 0o700
            or not parent.name.startswith("arrival-supervisor-")
            or path.name not in {"deadline.json", "sentinel.json", "abrupt.json",
                                 "orphan-child.json", "orphan-helper.json"}
            or path.exists() or path.is_symlink()):
        raise RuntimeError("SYNTHETIC_MARKER_ADMISSION_REFUSED")
    temporary = parent / (path.name + ".pending-" + secrets.token_hex(8))
    descriptor = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
    with os.fdopen(descriptor, "wb") as stream:
        stream.write((json.dumps(document) + "\n").encode("ascii"))
        stream.flush()
        os.fsync(stream.fileno())
    if path.exists() or path.is_symlink():
        raise RuntimeError("SYNTHETIC_MARKER_ALREADY_PRESENT")
    # The final path becomes visible only after the complete file is closed.
    # An interrupted publisher leaves its unique pending file as evidence.
    os.replace(temporary, path)


child = subprocess.Popen([sys.executable, "-I", "-S", "-B", str(Path(__file__).with_name("synthetic_driver.py")), "hang", sys.argv[1]],
                         stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         env={"PATH": "/usr/bin:/bin:/usr/sbin", "LANG": "C", "LC_ALL": "C"}, cwd="/", close_fds=True)
publish_ready(Path(sys.argv[2]), {"helper": child.pid})
while True:
    time.sleep(1)
