# macOS regression lane (GitHub-hosted macos-15, arm64)

The cloud program (Linux build, WebKit, engine feel, performance) changed shared
scripts, chrome modules and native hosts. Every change was meant to keep macOS
behaviour intact; this lane checks that on real Apple Silicon instead of by reading.
It does **not** build Zen, start the app or prove E1/E2; those stay local steps
(below) and nothing here makes the browser READY.

## What runs

`.github/workflows/macos-ci.yml` (push to `cloud/macos-ci`, PRs into
`cloud/integration`) runs `scripts/macos_ci.py run` twice on `macos-15` runners
(3 CPU, 7 GiB, macOS 15.7, Xcode CLT, `/usr/bin/python3` 3.9.6 — the owner's
`./dev` interpreter):

- **head**: the branch under test;
- **base**: a worktree of `origin/dev`, the pre-program baseline.

A `compare` job (ubuntu) diffs both result sets and fails only on a
**REGRESSION** (gate passes on dev, fails on head) or a removed gate. It publishes
everything to `ci-results:<branch>/<run>-<attempt>-macos/{head,base,compare.md,compare.json}`
(per-gate logs under `head/logs/`, `base/logs/`).

| Gate group | Command (cwd = checkout) |
| --- | --- |
| `dev-doctor` | `./dev doctor` — must exit 0 or the documented NOT-READY 2, never a traceback |
| `cargo-*` | `cargo fmt --check`, `clippy -D warnings`, `test`, `build` (Rust 1.94.0, workspace) |
| `python-compile` | every script compiled by `/usr/bin/python3` 3.9 (catches 3.10+ syntax) |
| `python:*` | each `tests/test_*.py` module, `apps/browser/tests/test_bootstrap.py`, the three `tools/*` tests |
| `node:*` | each `apps/browser/tests`, `packages/contexts/tests`, `packages/provider-host/tests` `*.test.mjs` (Node 24.14.0 pinned) |
| `provider:*` | `cli.mjs check`, `setup` (Keychain helper + Seatbelt broker build), `keychain-negative-test` (empty search list, invalid input — no secret), `sandbox-test` |
| `cef:*` | `probe.py setup` (pinned macosarm64 CEF 154, sha256-checked, compile + ad hoc sign), `check`, `test-native` (transport/crash-guard/a11y), `test_probe.py`, `stream_test.py` (real OSR on the runner), `surface_test.py` (Mach/IOSurface engine-surface-v1 transport + receiver), portable `transport_damage_test`/`core_test` |
| `webkit:*` | engine-neutral core (`test_transport`, `test_json`, fake-host `core_test`), WKWebView scaffold build and `mac_test.py stream/input/security` |
| `dev-setup-cargo-provider`, `dev-check`, `dev-test` | the whole `./dev` entry points through the CI build root (informational: a full PASS needs a Zen build and owner-only fixtures) |

Nothing contacts a provider, opens a login UI, reads a credential or personal
profile, or calls a model.

## macOS CI build root

The owner's Mac needs the T9 `AxioSozoBuild` volume, `mount-dev-storage` and
`dev-external`; none exist on a runner. `AXIOSOZO_MACOS_CI=1` together with an
explicit absolute `AXIOSOZO_BUILD_ROOT` makes `scripts/storage.py`, `scripts/dev.py`,
`native/chromium-host/probe.py` and the provider host (`cli.mjs`, `src/storage.mjs`)
use a plain user-owned directory, exactly like Linux, and run the same compile
commands without the two helpers (`env` instead of `dev-external`, nothing to mount).

The mode is accepted only when **all** hold, otherwise it raises (never a silent fallback):

- macOS, `AXIOSOZO_MACOS_CI=1`, `GITHUB_ACTIONS=true`, `AXIOSOZO_BUILD_ROOT` set;
- none of `/Volumes/T9`, `~/.local/bin/mount-dev-storage`, `~/.local/bin/dev-external`
  (`/Users/wout/...` in probe.py and the provider host) exists.

So on the owner's Mac nothing changes: without the variable every path is the
previous code, and with it the scripts refuse to start. Unit tests:
`tests/test_storage.py` `MacosCiBuildRoot`.

### Baseline shim

`origin/dev` predates the mode. `macos_ci.py base-shim` (base job only, on a
throwaway worktree) applies the equivalent edits to dev's `storage.py`, `dev.py`,
`cli.mjs` and `src/storage.mjs`, each anchored on exact text so a changed baseline
fails loudly, and copies this branch's `probe.py` (its macOS functions are dev's
plus the mode; the rest is Linux code that macOS never reaches). Without it every
provider/CEF/`./dev` gate would fail on dev for environment reasons and hide
regressions.

## Results

See [evidence/macos/ci/STATUS.md](evidence/macos/ci/STATUS.md) for the latest
run ids, the head-vs-dev table and the pre-existing failures.

## Full Zen build: not in this lane

Not attempted on runners. The macOS Zen path (`scripts/zen.py`, `zen_toolchain.py`)
runs every step through `dev-external`, requires the mounted DevStorage volume and
has sccache wired for Linux only; a cold Firefox 156 build on a 3-CPU/7 GiB runner
would also have no compiler cache to make later runs fit. Porting that path to the CI
build root would touch the owner's primary build and needs its own review.
Verify locally on the owner's Mac instead (T9 attached):

```sh
/Users/wout/.local/bin/mount-dev-storage
git fetch origin && git checkout cloud/integration      # or the branch under review
./dev doctor            # read-only; exits 2 (NOT READY) — check no traceback, storage mounted
./dev setup             # pinned sources, coordinator, provider helpers, CEF host, Zen build
./dev check             # Rust fmt/clippy, provider/Zen/CEF checks; expect exit 0
./dev test              # Rust/IPC/provider/fixture tests and the real CEF stream test; expect exit 0
./dev engine-probe      # fresh E0, then the owned Zen fixture session (inspect the window)
python3 native/chromium-host/surface_test.py            # IOSurface transport on the volume-root build
/Users/wout/.local/bin/dev-external python3 scripts/storage.py exec -- \
    python3 apps/browser/native/engine-view/tests/run_smoke.py   # engine-view XPCOM smoke in the built app
```

Compare `./dev check` / `./dev test` with the same commands on `dev` if anything
fails; the lane's pre-existing list (STATUS.md) names the failures already present
on runners before the cloud program.

## Running the lane yourself

```sh
python3 scripts/macos_ci.py run --side head --checkout . --out /tmp/lane-head --only 'cargo-*,python-compile'
python3 scripts/macos_ci.py compare --head /tmp/lane-head --base /tmp/lane-base --out /tmp/lane-cmp
```

`--only` takes gate names or `prefix*` patterns. On a Mac with the owner's layout
leave `AXIOSOZO_MACOS_CI` unset: `ci_root` gates then use the T9 volume as usual.
