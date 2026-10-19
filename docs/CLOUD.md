# Working on AxioSozo from Claude Code cloud sessions

Cloud sessions (claude.ai/code, `claude --cloud`) run on Ubuntu 24.04 x86_64 with
4 vCPU, ~15 GiB RAM and ~29 GiB free disk, as root with sudo. Xvfb and the `gh`
client are installed; the Docker daemon is not running. Measured 19 Oct 2026.

## Network

The session's network policy is an allowlist. Reachable: GitHub git + REST API,
npm, PyPI, crates.io, static.rust-lang.org, nodejs.org and the Ubuntu apt mirrors.
Blocked (HTTP 403 / no connection): archive.mozilla.org, hg/ftp.mozilla.org,
cef-builds.spotifycdn.com, deb.debian.org, Actions log/artifact blob storage.
So the pinned Firefox source, CEF distributions and Debian WPE packages cannot
be fetched inside a session. The owner can widen this per cloud environment
(environment menu → Edit → Network access / Allowed domains).

## Heavy builds and Linux evidence run on GitHub Actions

GitHub-hosted `ubuntu-24.04` runners have full network access. Trigger workflows
by pushing your branch (`on: push` with path filters) or by adding a label to a PR
through the REST API. `workflow_dispatch` only works once a workflow exists on the
default branch (`main`), which this program does not touch.

Cloud sessions cannot download Actions logs or artifacts. Every workflow that
produces evidence must end with:

```yaml
    permissions:
      contents: write          # job-level, for publish-ci-results
    ...
      - if: always()
        uses: ./.github/actions/publish-ci-results
        with:
          path: ${{ env.EVIDENCE_OUT }}   # logs, result JSON, small PNGs
```

Then read results from the session:

```sh
git fetch origin ci-results
git ls-tree -r --name-only origin/ci-results -- "<branch with / replaced by _>/"
git show origin/ci-results:<path>          # or: git worktree add /tmp/ci origin/ci-results
```

Run status without logs: `gh run list -R AxioSOzo/AxioSozo-browser -b <branch>` and
`gh api repos/AxioSOzo/AxioSozo-browser/actions/runs/<id>/jobs` (steps + conclusions).

## GitHub from a session

GraphQL is blocked, so `gh pr create/list/view` fail. Use REST:

```sh
gh api repos/AxioSOzo/AxioSozo-browser/pulls -f title='…' -f head='cloud/<name>' \
  -f base=cloud/integration -F draft=true -f body="$(cat pr-body.md)"
gh api 'repos/AxioSOzo/AxioSozo-browser/pulls?head=AxioSOzo:cloud/<name>&state=all'
gh api repos/AxioSOzo/AxioSozo-browser/issues/<n>/labels -f 'labels[]=linux-build'
```

## Handoff convention

Sessions end by committing `docs/handoff/<workstream>.md` whose first line is
`Status: DONE`, `Status: PARTIAL` or `Status: BLOCKED`, followed by the final
report. The orchestrator watches branches for that file.
