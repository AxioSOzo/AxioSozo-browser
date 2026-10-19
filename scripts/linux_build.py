#!/usr/bin/env python3
"""Fetch a ready Linux AxioSozo (Zen) build produced by CI instead of rebuilding.

    ./dev fetch-build [--run RUN_ID] [--branch BRANCH] [--repo OWNER/NAME]
    ./dev fetch-build --from-dir DIR   # an artifact already downloaded (CI)

Uses the GitHub CLI (`gh`, authenticated; artifacts of public repositories
still need a login) to download the `axiosozo-zen-linux-<arch>` workflow
artifact of a successful `.github/workflows/linux-zen-build.yml` run, verifies
the archive against its axiosozo-build-info.json (sha256, host, executable),
unpacks it into `<build root>/linux-app/<run>/` and records it in
`<build root>/linux-app/current.json`, which `./dev gui-test --app fetched`
(and `--app auto` without a local build) uses. Nothing is installed globally.
"""
import argparse
import hashlib
import json
from pathlib import Path
import platform
import shutil
import subprocess
import sys
import tempfile

import storage

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = 'linux-zen-build.yml'
DEFAULT_REPO = 'AxioSOzo/AxioSozo-browser'


def host():
    machine = platform.machine().lower()
    return 'linux-' + {'amd64': 'x86_64', 'arm64': 'aarch64'}.get(machine, machine)


def sha256(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as source:
        for chunk in iter(lambda: source.read(1 << 20), b''):
            digest.update(chunk)
    return digest.hexdigest()


def gh(*args):
    if not shutil.which('gh'):
        raise RuntimeError('BLOCKED_ENV: the GitHub CLI (gh) is required; see docs/LINUX.md')
    result = subprocess.run(['gh', *args], capture_output=True, text=True, timeout=600)
    if result.returncode:
        raise RuntimeError('gh ' + ' '.join(args[:3]) + ' failed: ' + result.stderr.strip()[-500:])
    return result.stdout


def latest_run(repo, branch):
    query = ['run', 'list', '--repo', repo, '--workflow', WORKFLOW, '--status', 'success', '--limit', '30',
             '--json', 'databaseId,headBranch,headSha,createdAt,event']
    if branch:
        query += ['--branch', branch]
    runs = json.loads(gh(*query))
    if not runs:
        raise RuntimeError('NO_SUCCESSFUL_BUILD: no successful ' + WORKFLOW + ' run'
                           + (' on ' + branch if branch else '') + ' in ' + repo)
    return runs[0]


def fetch(args):
    storage.ensure()
    artifact = 'axiosozo-zen-linux-' + host().removeprefix('linux-')
    if args.from_dir:
        run_id = args.run or 'local'
    else:
        run = {'databaseId': int(args.run)} if args.run else latest_run(args.repo, args.branch)
        run_id = str(run['databaseId'])
    if not run_id.replace('-', '').isalnum():
        raise RuntimeError('INVALID_RUN_ID: ' + run_id)
    base = storage.BUILD_ROOT / 'linux-app'
    destination = base / run_id
    base.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='fetch-', dir=base) as temporary:
        if args.from_dir:
            download = Path(args.from_dir).resolve()
        else:
            download = Path(temporary) / 'artifact'
            gh('run', 'download', run_id, '--repo', args.repo, '--name', artifact, '--dir', str(download))
        info = json.loads((download / 'axiosozo-build-info.json').read_text())
        archive = download / info['archive']
        if Path(info['archive']).name != info['archive'] or not archive.is_file():
            raise RuntimeError('ARTIFACT_INCOMPLETE: ' + info['archive'])
        if info.get('host') != host():
            raise RuntimeError(f"ARTIFACT_HOST_MISMATCH: built for {info.get('host')}, this is {host()}")
        if sha256(archive) != info['archive_sha256']:
            raise RuntimeError('ARTIFACT_CHECKSUM_MISMATCH: ' + archive.name)
        unpacked = Path(temporary) / 'unpacked'
        unpacked.mkdir()
        # The archive is our own CI output, verified above; still refuse unsafe members.
        listing = subprocess.run(['tar', '-tJf', str(archive)], capture_output=True, text=True, check=True).stdout.split('\n')
        if any(name.startswith('/') or '..' in Path(name).parts for name in listing if name):
            raise RuntimeError('UNSAFE_ARCHIVE_MEMBER')
        subprocess.run(['tar', '-xJf', str(archive), '-C', str(unpacked)], check=True)
        if destination.exists():
            shutil.rmtree(destination)
        shutil.move(str(unpacked), str(destination))
        (destination / 'axiosozo-build-info.json').write_text(json.dumps(info, indent=2) + '\n')
    sys.path.insert(0, str(ROOT / 'scripts'))
    import zen
    application = destination / 'axiosozo-dev'
    executable = zen.validate_linux_application(application)
    current = {'version': 1, 'run_id': run_id, 'repository': args.repo, 'directory': str(application),
               'executable': str(executable), 'build_info': info,
               'fingerprint_matches_checkout': info.get('fingerprint') == zen.fingerprint()}
    (base / 'current.json').write_text(json.dumps(current, indent=2) + '\n')
    print(json.dumps({'status': 'PASS', **current, 'next': './dev gui-test --app fetched --screenshot out.png'}, indent=2))
    if not current['fingerprint_matches_checkout']:
        print('NOTE: this build was made from different chrome/patch inputs than this checkout '
              f"(commit {info.get('repository_commit')}); native code may still match.", file=sys.stderr)
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('command', choices=['fetch-build'])
    parser.add_argument('--run', help='workflow run id (default: newest successful run)')
    parser.add_argument('--branch', help='only runs of this branch')
    parser.add_argument('--repo', default=DEFAULT_REPO)
    parser.add_argument('--from-dir', help='verify and unpack an already downloaded artifact directory')
    args = parser.parse_args()
    if not storage.LINUX:
        print('BLOCKED_ENV: Linux builds run on Linux only', file=sys.stderr)
        return 2
    return fetch(args)


if __name__ == '__main__':
    try:
        sys.exit(main())
    except (RuntimeError, OSError, ValueError, KeyError, subprocess.SubprocessError) as error:
        print(json.dumps({'status': 'BLOCKED_ENV' if 'BLOCKED_ENV' in str(error) else 'FAIL', 'error': str(error)}),
              file=sys.stderr)
        sys.exit(2)
