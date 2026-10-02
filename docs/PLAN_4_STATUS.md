# Plan 4 — status

**Overall: IN PROGRESS. Not READY.** Nothing pushed, tagged or published.

## Done so far (Claude, before the Codex hand-over)

| Commit | What |
| --- | --- |
| `cb8748c` | Step 0, partial: isolated build roots (`AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/<name>`), contracts `workstation-v1`, `agent-channel-v1`, `understand-v1`, and the `decision-v1` extensions. The upstream for this worktree, a baseline `./dev check`/`./dev test` and a build into the workstation root are **not yet verified**. |
| (next commit) | Package-level logic for steps 1, 4, 5, 6 and 8, built by three Claude sub-agents. No chrome or frontend integration yet. |

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
