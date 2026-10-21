#!/usr/bin/env python3
"""macOS WKWebView SCAFFOLD smoke: the same stream and security harness as the Linux host.

usage: mac_test.py <AxioWebKitMacHost-binary>

Results are labelled port "wkwebview" (scaffold, snapshot frames). They are never Linux WPE
evidence, never engine-surface-v1 evidence and never Zen E1/E2 evidence. macOS has no
/proc, so the helper-orphan check only covers the host's own process group here.
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
    which = sys.argv[2] if len(sys.argv) > 2 else 'all'
    codes = []
    if which in ('all', 'stream'):
        codes.append(load('stream_test').run(binary, engine='webkit', port='wkwebview'))
    if which in ('all', 'input'):
        codes.append(load('input_test').run(binary, port='wkwebview'))
    if which in ('all', 'security'):
        codes.append(load('stream_security_test').run(binary, engine='webkit', port='wkwebview'))
    raise SystemExit(0 if all(code == 0 for code in codes) else 1)
