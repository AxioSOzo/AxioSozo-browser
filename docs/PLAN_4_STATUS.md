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

Steps 1–9 remain unintegrated. Their ignored pure-logic preparation and fake
tests are not claims that those steps or their GUI gates passed. E1/E2 remain
**NOT_VERIFIED**, the app is **not READY**, and nothing was pushed or released.

## Open follow-ups for the integration lead

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

The OpenAI Decisions API has no public documentation yet (all docs URLs return
404). Its adapter is marked `UNVERIFIED_SHAPE` and never sends data. The Claude
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
