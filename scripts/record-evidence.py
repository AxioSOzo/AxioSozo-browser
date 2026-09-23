#!/usr/bin/env python3
"""Record actual deterministic command output and exit code, never invented results."""
import datetime
import hashlib
import json
import os
from pathlib import Path
import subprocess
import platform
import sys
import time
import signal

root = Path(__file__).resolve().parents[1]
def interrupt(_signum, _frame):
    raise KeyboardInterrupt
signal.signal(signal.SIGTERM, interrupt)
name = sys.argv[1]
if not name or any(c not in "abcdefghijklmnopqrstuvwxyz0123456789-_" for c in name):
    raise SystemExit("invalid evidence name")
command = sys.argv[2:]
if not command:
    raise SystemExit("command required")
start = datetime.datetime.now(datetime.timezone.utc)
epoch = time.monotonic()
log = root / "docs/evidence" / (name + ".log")
with log.open("w") as output:
    output.write("Command: " + repr(command) + "\n")
    output.write("UTC: " + start.isoformat() + "\n")
    output.flush()
    process = subprocess.Popen(command, cwd=root, stdout=subprocess.PIPE,
                               stderr=subprocess.STDOUT, text=True, start_new_session=True)
    code = None
    try:
        for line in process.stdout:
            output.write(line)
            output.flush()
            print(line, end="", flush=True)
        code = process.wait()
    except KeyboardInterrupt:
        code = 130
        output.write("Inspection interrupted; terminating only this recorder's child process group.\n")
        output.flush()
    finally:
        if process.poll() is None:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                process.wait(timeout=20)
            except subprocess.TimeoutExpired:
                try:
                    os.killpg(process.pid, signal.SIGKILL)
                except ProcessLookupError:
                    pass
                process.wait(timeout=5)
        process.stdout.close()
        if code is None:
            code = process.returncode if process.returncode is not None else 1
        output.write(f"\nExit code: {code}\n")
summary = {"command": command, "platform_tested": platform.platform(), "architecture": platform.machine(), "utc": start.isoformat(),
           "duration_seconds": round(time.monotonic() - epoch, 3), "exit_code": code,
           "log_sha256": hashlib.sha256(log.read_bytes()).hexdigest(), "log": log.name}
(root / "docs/evidence" / (name + ".json")).write_text(json.dumps(summary, indent=2) + "\n")
raise SystemExit(code)
