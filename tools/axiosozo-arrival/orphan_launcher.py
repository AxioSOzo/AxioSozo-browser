"""Owned fake native parent; its death exercises helper parent-loss cleanup."""
import json
import os
from pathlib import Path
import subprocess
import sys
import time

child = subprocess.Popen([sys.executable, "-I", "-S", "-B", str(Path(__file__).with_name("synthetic_driver.py")), "hang", sys.argv[1]],
                         stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
                         env={"PATH": "/usr/bin:/bin:/usr/sbin", "LANG": "C", "LC_ALL": "C"}, cwd="/", close_fds=True)
Path(sys.argv[2]).write_text(json.dumps({"helper": child.pid}))
while True:
    time.sleep(1)
