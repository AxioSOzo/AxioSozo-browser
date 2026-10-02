"""Invented child, executed only by the import-level supervisor tests."""
import json
import os
from pathlib import Path
import signal
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


mode = sys.argv[1]
# Mirror lsof's closefrom(3), without calling lsof or reading any project.
os.closerange(3, 1024)
if mode == "echo":
    os.write(1, b"p123\nu501\nn127.0.0.1:44000\n")
    os.write(2, b"INVENTED_DIAGNOSTIC_MUST_NOT_ESCAPE")
elif mode == "exit37":
    os.write(1, b"p123\nfcwd\nn/invented-project\n")
    raise SystemExit(37)
elif mode in ("signal", "signal9"):
    os.kill(os.getpid(), signal.SIGTERM if mode == "signal" else signal.SIGKILL)
elif mode in ("stdout", "stderr"):
    remaining = int(sys.argv[2])
    while remaining:
        size = min(remaining, 65536)
        os.write(1 if mode == "stdout" else 2, b"x" * size)
        remaining -= size
elif mode in ("hang", "descendant"):
    marker = Path(sys.argv[2])
    descendant = None
    if mode == "descendant":
        descendant = os.fork()
        if descendant == 0:
            os.close(0)
            os.close(1)
            os.close(2)
            while True:
                time.sleep(1)
    publish_ready(marker, {"child": os.getpid(), "supervisor": os.getppid(), "descendant": descendant})
    while True:
        time.sleep(1)
elif mode == "env":
    expected = {"PATH": "/usr/bin:/bin:/usr/sbin", "LANG": "C", "LC_ALL": "C"}
    # Python may synthesize LC_CTYPE as part of locale initialization.
    actual = {key: val for key, val in os.environ.items() if key != "LC_CTYPE"}
    os.write(1, json.dumps({"keys": sorted(actual), "fixed_matches": all(actual.get(key) == value for key, value in expected.items()), "cwd_root": os.getcwd() == "/"}).encode("ascii"))
else:
    raise SystemExit(99)
