"""Invented child, executed only by the import-level supervisor tests."""
import json
import os
from pathlib import Path
import signal
import sys
import time

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
    marker.write_text(json.dumps({"child": os.getpid(), "supervisor": os.getppid(), "descendant": descendant}))
    while True:
        time.sleep(1)
elif mode == "env":
    expected = {"PATH": "/usr/bin:/bin:/usr/sbin", "LANG": "C", "LC_ALL": "C"}
    # Python may synthesize LC_CTYPE as part of locale initialization.
    actual = {key: val for key, val in os.environ.items() if key != "LC_CTYPE"}
    os.write(1, json.dumps({"keys": sorted(actual), "fixed_matches": all(actual.get(key) == value for key, value in expected.items()), "cwd_root": os.getcwd() == "/"}).encode("ascii"))
else:
    raise SystemExit(99)
