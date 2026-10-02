# Synthetic fixture only. Never execute a provider or install hooks.
import hashlib
import json
import os
import stat
import sys

pointer = json.loads(sys.argv[1])
assert set(pointer) == {"version", "context_file"} and pointer["version"] == 1
fd = os.open(pointer["context_file"], os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK)
try:
    info = os.fstat(fd)
    assert stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and info.st_nlink == 1
    assert stat.S_IMODE(info.st_mode) == 0o600 and info.st_size <= 2097152
    with os.fdopen(fd, "rb", closefd=False) as stream:
        raw = stream.read(2097153)
    assert len(raw) <= 2097152
finally:
    os.close(fd)
context = json.loads(raw)
assert context["project"]["root"] == os.getcwd()
proof = {"version": 1, "fixture": True, "context_sha256": hashlib.sha256(raw).hexdigest(),
         "project_id": context["project"]["id"], "cwd_matches": True,
         "selection_present": context["page"]["selection"] is not None,
         "screen_present": context["page"]["screen"] is not None,
         "console_count": len(context["console_errors"]), "argv_count": len(sys.argv)}
# Refuse overwrite; this proof contains only synthetic metadata, never context text.
fd = os.open("handoff-fixture-proof.json", os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
try:
    data = json.dumps(proof, separators=(",", ":")).encode()
    while data:
        data = data[os.write(fd, data):]
    os.fsync(fd)
finally:
    os.close(fd)
