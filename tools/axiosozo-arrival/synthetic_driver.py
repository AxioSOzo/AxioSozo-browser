"""Import-level fake injection; never shipped or called by the native adapter."""
import importlib.util
import json
from pathlib import Path
import signal
import sys

spec = importlib.util.spec_from_file_location("arrival_lsof", Path(__file__).with_name("arrival_lsof.py"))
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)
signal.signal(signal.SIGTERM, helper._stop)
signal.signal(signal.SIGINT, helper._stop)
if sys.argv[1] in ("main-signal", "main-signal9"):
    original = helper.supervise
    mode = "signal" if sys.argv[1] == "main-signal" else "signal9"
    helper.validate_self = lambda: None  # separately tested synthetic metadata admission
    helper.supervise = lambda _argv: original([sys.executable, "-I", "-S", "-B", str(Path(__file__).with_name("synthetic_child.py")), mode])
    raise SystemExit(helper.main(["listen", "44000", str(__import__("os").getuid())]))
status, output, error = helper.supervise([sys.executable, "-I", "-S", "-B", str(Path(__file__).with_name("synthetic_child.py")), *sys.argv[1:]])
print(json.dumps({"status": status, "output": output.decode("ascii"), "error": error}))
