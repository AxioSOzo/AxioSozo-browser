#!/usr/bin/env python3
"""Engine-free proof of the stream core and of the stream/security harness.

usage: core_test.py <fake_host-binary>

Runs stream_test.py's scenario and every stream_security_test.py case against the
TEST-ONLY scripted engine (tests/fake_host.cc). Results are labelled engine "fake":
they prove the shared protocol core, never WebKit rendering or sandboxing.
"""
import importlib.util
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent.parent


def load(name):
    spec = importlib.util.spec_from_file_location('webkit_' + name, HERE / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


if __name__ == '__main__':
    binary = Path(sys.argv[1]).resolve()
    stream = load('stream_test')
    security = load('stream_security_test')
    codes = [stream.run(binary, engine='fake'), security.run(binary, engine='fake')]
    raise SystemExit(0 if codes == [0, 0] else 1)
