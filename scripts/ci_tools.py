#!/usr/bin/env python3
"""Pinned tools for Linux CI (and Linux machines without them).

`python3 scripts/ci_tools.py node` downloads the Node release pinned in
upstreams.lock.json (`ci_node`), verifies its sha256, unpacks it into
`<build root>/ci-tools/node-<version>` and prints that bin directory. Nothing
is installed into HOME or system paths. Linux only.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile

import storage

ROOT = Path(__file__).resolve().parents[1]


def host():
    machine = platform.machine().lower()
    return 'linux-' + {'amd64': 'x86_64', 'arm64': 'aarch64'}.get(machine, machine)


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def node():
    lock = json.loads((ROOT / 'upstreams.lock.json').read_text())['ci_node']
    pin = lock.get(host())
    if not pin:
        raise RuntimeError('UNSUPPORTED_HOST: no pinned CI Node for ' + host())
    storage.ensure()
    base = storage.BUILD_ROOT / 'ci-tools'
    destination = base / ('node-' + lock['version'])
    marker = destination / '.axiosozo-sha256'
    if marker.is_file() and marker.read_text().strip() == pin['sha256']:
        return destination / 'bin'
    if destination.exists():
        raise RuntimeError('UNOWNED_OR_PARTIAL_DESTINATION: ' + str(destination))
    downloads = base / 'downloads'
    downloads.mkdir(parents=True, exist_ok=True)
    archive = downloads / pin['filename']
    if not archive.is_file() or sha256(archive) != pin['sha256']:
        partial = archive.with_name(archive.name + '.partial')
        subprocess.run(['curl', '--fail', '--location', '--retry', '3', '--silent', '--show-error',
                        '--output', str(partial), pin['url']], check=True)
        if sha256(partial) != pin['sha256']:
            partial.unlink()
            raise RuntimeError('DOWNLOAD_CHECKSUM_MISMATCH: ' + pin['url'])
        partial.rename(archive)
    with tempfile.TemporaryDirectory(prefix='node-', dir=base) as temporary:
        subprocess.run(['tar', '-xJf', str(archive), '--strip-components=1', '-C', temporary], check=True)
        shutil.move(temporary, destination)
        os.makedirs(temporary, exist_ok=True)  # TemporaryDirectory cleanup expects it
    marker.write_text(pin['sha256'] + '\n')
    return destination / 'bin'


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('tool', choices=['node'])
    args = parser.parse_args()
    if not storage.LINUX:
        print('BLOCKED_ENV: ci_tools.py is for Linux; macOS uses the documented local toolchain', file=sys.stderr)
        return 2
    print({'node': node}[args.tool]())
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (OSError, RuntimeError, subprocess.CalledProcessError) as error:
        print('BLOCKED_ENV: ' + str(error), file=sys.stderr)
        sys.exit(2)
