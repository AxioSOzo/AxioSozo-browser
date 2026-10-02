# Plan 4 — status

**Overall: IN PROGRESS. Not READY.** Nothing pushed, tagged or published.

## Done so far (Claude, before the Codex hand-over)

| Commit | What |
| --- | --- |
| `cb8748c` | Step 0 contracts and isolated build roots. Workstation upstream, baseline checks, native build and real-app GUI verification are now verified below. |
| `93e4e4c` | Package-level logic for steps 1, 4, 5, 6 and 8, built by three Claude sub-agents. No chrome or frontend integration yet. |

Package logic and tests, re-run on 2 October 2026 with the pinned Node via
`dev-external` + `storage.py exec`:

- **`packages/contexts`: 141/141 pass.** Covers workstation-v1 §1–§5:
  - detection v2 (inventory and docs phases, integrations, platforms, domains,
    agent presence);
  - store v3 and project record v2 with migration, plus
    `contracts/context-v2.schema.json`;
  - project containers and shared-site routing;
  - port-to-folder arrival (lsof argument arrays and parsers);
  - agent status hook parsing.

  Fixtures are synthetic (`harbor-suite`, `inkline`); no reference repo was
  opened.
- **`packages/provider-host`: 108/108 pass.**
  - Decision provider choice: `jev` or `openai`.
  - `screen` image input with PNG checks.
  - `confidence` on every result, and `watch_v1`.
  - Key entry for both providers via `keys/status`, `keys/store` and
    `keys/remove`, with a separate Keychain item for OpenAI.
  - The understand tier (`src/understand.mjs`): a queued, cancellable runner
    for the Claude Code or Codex CLI with a read-only argument array.
- **`packages/agent-bridge` + `tools/axiosozo-notify`: 53/53 pass**, against a
  fake browser channel only. They provide:
  - a stdio MCP server with read tools;
  - act tools behind approval;
  - a hook script for Claude Code and Codex.

## Step 0 verification — completed by Codex, 2 October 2026

Local verification commit: `da2977b`.

All commands ran in `/Volumes/T9/Code/AxioSozo-browser-workstation` on
`product/workstation`; the main checkout and engine paths were not edited.
Every build used `AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/workstation`,
`mount-dev-storage`, `dev-external` and `scripts/storage.py exec`.

- Worktree Zen upstream pin: `f0f21cdade1fd519a660d756942f7032a8c7a518`.
  `zen.py doctor` and `zen.py describe`: **PASS**. The independent generated
  APFS checkout, object directory, dependencies and synthetic runtime are under
  the workstation root; shared checksum-pinned toolchains remain under the
  project volume's toolchain directory.
- `./dev check`: **PASS** (exit 0). Browser Node 391/391; bootstrap Python 33/33;
  Cargo fmt/clippy and provider check passed. CEF check was explicitly
  `SKIPPED_ENGINE_WORKSTREAM`.
- `./dev test`: **PASS** (exit 0). Cargo 10; provider 108; sandbox OS 5;
  negative Keychain 8; positive synthetic Keychain 3; browser Node 391;
  bootstrap Python 33; CEF adapter Node 38; saved-pages Python 3;
  contexts 141; root Python 40; coordinator Python 4; probe Python 14.
  CEF native/stream gates were `SKIPPED_ENGINE_WORKSTREAM`, not passes.
- Direct package suites on Node 24.14.0: **302/302 PASS** (contexts 141,
  provider-host 108, agent-bridge/notify 53).
- `./dev setup`: **PASS** (exit 0). Native Gecko build completed and verified
  9 sandbox-readable Zen content resources and all 53 AxioSozo chrome files.
  App: `/Volumes/AxioSozoBuild/workstation/zen/obj/dist/AxioSozo Dev.app`;
  bundle `nl.axiosozo.browser.dev`; source fingerprint
  `854ceec83b62d3faa350034bfa02c6875547d3a8ba5ee10dd543d660705c3fdd`.
- Real macOS GUI: **PASS** on a newly created owned synthetic profile. Overview
  actor, process-wide services, normal projects view and keyboard entry button
  were present; no product provider host or engine switcher ran. Native exit 0,
  process reaped, owned Marionette listener gone. TLS verification stayed on.
  Screenshots were inspected; this is a functional baseline, not the step 3
  design review or a VoiceOver audit.

Evidence (git-ignored):

- `docs/evidence/plan4-0/baseline-20261002-a/session.json`
- `docs/evidence/plan4-0/baseline-20261002-a/overview-window.png`
- `docs/evidence/plan4-0/baseline-20261002-a/overview-content.png`
- `.local/logs/plan4-step0-check-pass.log`
- `.local/logs/plan4-step0-test-complete.log`
- `.local/logs/plan4-step0-build.log`
- `.local/logs/plan4-step0-packages-node24.log`

Baseline repairs by Codex: stale tests now assert context store v3/project v2
and the shared pinned toolchain cache. The positive Keychain fixture now accepts
one validated named build root and rejects traversal, symlink/prefix spoofing,
invalid ownership/permissions and reused files. Its three tests use only fresh
synthetic Keychains with interaction disabled; no personal profile or credential
was read. Initial failing logs were retained, and both baseline commands were
rerun to exit 0 after repairs.

Claude Opus 5.5 CLI developer readiness: **PASS**, session
`3ba061a1-ca62-4273-bb91-f1a3ca60c330`. It read the instruction set and made
no changes. No frontend code was created or edited by Codex; actual frontend
integration remains delegated to Claude in later steps.

Step 1 integration is in progress below. Steps 2–9 remain unintegrated; their
ignored pure-logic preparation and fake tests do not establish GUI gate passes. E1/E2 remain
**NOT_VERIFIED**, the app is **not READY**, and nothing was pushed or released.

## Step 1 — integrated source; interactive GUI BLOCKED_HUMAN

Codex integrated the DOM-free detection/arrival/record/migration adapters and a
checksum-pinned containment reader. Claude Opus 5.5 (session
`7c769e60-ffb6-4f30-9143-2c89510567b7`) owns every frontend change: service and
actor glue, startup, native arrival notification/runtime, detection preview and
its overview styling. No frontend code was created or edited by Codex.

The service now creates project record v2 in store v3, validates legacy stores
before atomic migration, retains privileged detection snapshots, re-detects on
confirmation, preserves manual fields on refresh, and admits `/Volumes/T9/Code`
for arrival. An opaque arrival offer is bound to the exact normal window, tab,
URL and lifetime; navigation, tab closure and window removal revoke acceptance.
Canonical root policy is checked before metadata/content access and again before
returning the result. Independent fake probes reproduce and verify the fixes
for root aliases changing during reader startup and acceptance revoked mid-read.

Actual verification, including the pinned native subprocess repair:

- `./dev test` and `./dev check`: exit 0, with browser tests 627/627 passing,
  provider-host 122, contexts 141 and containment reader
  Python 22 and arrival supervisor Python 18. The other root suites passed; CEF native gates stayed skipped.
- Warm `./dev setup`: exit 0; fingerprint
  `c14bde3bb9c95d38e82c329f94fcf9b60671e816fd9cb2ab5edb6ee24df6f916`.
- Real app runs A and B used newly owned synthetic profiles and fixture servers.
  Product provider hosts, the agent endpoint, key-entry prefs and engine switching
  stayed off; TLS checks remained enabled. Both owned apps and fixture servers
  were reaped and their Marionette listeners closed. Fixture metadata hashes
  were unchanged. Run A expired without completing its UI gate. Run B finished
  cleanly, but its functional arrival/picker gate did not pass.
- Native containment-reader detection of both synthetic projects passed. Actual
  native read-only detection of all three authorized reference folders passed
  with fixed metadata allowlists, `.git/config` excluded, and aggregate-only
  evidence. This does not establish native picker/actor admission or a project
  home GUI pass. No private reference content was copied into this repository.
- Native GUI showed no arrival notification. A fixed read-only diagnostic then
  observed `/usr/bin/id` exit 0 and `/usr/sbin/lsof` exit -9, before any filesystem
  inspection. Run C measured the lsof failure at 2 ms, not a deadline expiry. Pinned Gecko uses inherited FD3 as an exit sentinel; Apple's lsof
  closes descriptors above 2. A checksum-pinned, fixed-operation Python supervisor now preserves
  that sentinel without engine changes. Its 18 actual synthetic process tests
  cover deadline, cancellation, abrupt outer death, stream bounds and reaping.
  Claude wired its lazy native adapter with retry and no direct-lsof fallback;
  36 arrival/adapter Node tests and independent service wiring review passed.
  Run E verified actual native discovery through this supervisor: id and three
  fixed lsof operations exited 0, all four children waited once with zero kills,
  and the exact owned Harbor folder was found in 229 ms. No UI token, acceptance,
  profile write or fixture write occurred. Receipt:
  `docs/evidence/plan4-1/supervisor-native-20261002-e/c7fd87d785ac10b2-arrival_diagnostics.json`.
  Run E finished with native exit 0, owned children reaped, listener closed
  and metadata unchanged. Interactive arrival remains a separate human gate.
- The native picker showed the owned fixture folder selected while Open remained
  disabled. A third owned run reproduced the same behavior with the stock
  Firefox Downloads folder chooser in the same build. Cancel worked; no
  TCC/Keychain prompt appeared and no download preference was changed. Claude
  found no supported product wiring bug and made no speculative repair. Native
  confirmation needs human reproduction; it remains unverified and is not
  bypassed with fabricated picker provenance.

Evidence (ignored): `docs/evidence/plan4-1/cua-observer-20261002-a/` and
`docs/evidence/plan4-1/cua-observer-20261002-b/`, plus the fixed native
diagnostic and stock-picker comparison in `cua-observer-20261002-c/`; root test/check/build logs are
`.local/logs/plan4-step1-lead-test-privacy.log`,
`plan4-step1-lead-check-privacy.log` and `plan4-step1-build-privacy.log`.
- Rebuilt native run D verified the current fingerprint, runtime installation,
  provider/endpoint/engine gates and rendered Projects overview. Both bounded
  synthetic listeners had exact owned PID/UID/CWD admission. The actual CUA
  call reported that the Mac was locked and automatic unlock failed. Native
  arrival Keep, folder confirmation and reference-project UI are therefore
  **BLOCKED_HUMAN**. No UI admission was fabricated. The plan's human-click gate
  permits continuing to Step 2. Overview screenshots were inspected; lower
  content is visibly faded/clipped, reserved for Claude's Step 3 redesign.
  Run D finished with native exit 0, both fixture children reaped, both owned
  listeners closed, and unchanged metadata hashes.

Current logs: `.local/logs/plan4-step1-lead-test-supervisor.log`,
`plan4-step1-lead-check-supervisor.log`, `plan4-step1-build-supervisor.log`.
Evidence: `docs/evidence/plan4-1/cua-observer-20261002-d/`, including
`lead-observations.json` and `startup-startup-window.png`. No interactive arrival
pass is claimed. Step 1 is locally committed with this record; its hash is recorded in the next step.

## Follow-ups handled in current source

- Decision results retain and validate provider/confidence/shape status,
  `IMAGE_UNSUPPORTED`, `UNVERIFIED_SHAPE`, and watch-1. Contracts now define
  the understand reason and watch context. Legacy Jev replies may omit both
  provider and confidence only for the existing site-rule context; current
  results and watches retain strict provider/confidence validation.
- Decision and understand product calls remain `NOT_AUTHORIZED`; direct live
  decision-host service is refused. No real product provider was called.
- Key entry enforces separate Jev/OpenAI prefs, fixed trusted helper paths,
  stdin-only secret input, bounded output/deadlines and cancellation cleanup.
  Missing prefs are false; removal remains allowed. Focused fake tests passed
  100/100. Native entry UI is Step 5, not yet integrated.
- Project records and external arrival roots are integrated as described above.
- Buffered channel EOF handling and 55-second approval timing are prepared for
  Step 4 only. Codex bridge guidance remains `tool_timeout_sec = 90`.
- Git executable modes were staged explicitly for `dev` and the new reader
  installer; exFAT file permissions are not used as Git mode evidence.

## Original follow-ups (retained for traceability)

1. **Blocker:** `apps/browser/chrome/ProviderDecision.sys.mjs` drops any reply
   with keys outside `RESULT_KEYS`. Fix this before integrating, along with:
   - adding `provider`, `confidence` and `shape_status`;
   - the new reasons `IMAGE_UNSUPPORTED` and `UNVERIFIED_SHAPE`;
   - validating `watch_v1` results;
   - updating the reason list in `decision-v1.md`.
2. `AxioSozoServices.sys.mjs` (around line 485) still creates version 1 project
   records. New code should use `upgradeProject` or write version 2. Loading
   keeps working through `migrateContextStore`.
3. **Unspecified fields.** The understand results gained a `reason` field that
   `understand-v1` does not define. The watch decision uses
   `context_version: "watch-1"`, which `decision-v1` does not name either.
   Confirm both or adjust the contracts.
4. Proposed pref `axiosozo.openai.keyEntry.enabled`. Chrome must enforce it,
   because the host cannot read prefs.
5. **Reference repos outside home.** `rootCandidates` takes an optional `roots`
   list because the reference repos live on `/Volumes/T9`, outside home.
   Configure `/Volumes/T9/Code` there.
6. **Agent bridge behaviour:**
   - The browser side must process every buffered line even if the `nc` client
     disconnects early (macOS `nc` behaviour; see the agent-bridge README).
   - For Codex, recommend `tool_timeout_sec = 90`.
7. **Executable bits.** `/Volumes/T9` is exFAT, so executable bits live only in
   git; they were committed with `git add --chmod=+x`.

## NOT_AUTHORIZED

None of these were run:

- live Jev;
- live OpenAI Decisions;
- live Claude Code or Codex understand runs.

The three specific OpenAI Decisions documentation URLs checked on 2 October
2026 returned 404. That limited check does not prove no documentation exists.
The adapter is marked `UNVERIFIED_SHAPE` and never sends data. The Claude
Code and Codex argument arrays have never been run against the real CLIs. Codex
has no per-path read deny, so `.env*` is excluded only by the prompt.

## Decisions taken

See the sub-agent choices recorded in `packages/contexts/README.md` and
`packages/agent-bridge/README.md`:

- The bridge waits at most 55 s for session approval, then returns
  `NOT_APPROVED`.
- After a denial there is a 30 s quiet period.
- iOS vs macOS platform naming follows a folder-name heuristic.
- Documented domains are "found in docs, unconfirmed".
