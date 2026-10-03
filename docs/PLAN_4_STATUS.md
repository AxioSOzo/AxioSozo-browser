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

Steps 1–3 have integrated source and verified builds below. Interactive arrival,
cookie isolation and reference-home admission remain unverified behind the
recorded human gates. Step 3 synthetic light/dark rendering is verified. Step 5 source/build and light initial key presence are verified below; dark
startup and interactive key flows remain limited. Step 6 source/build and initial light/dark rendering are verified below;
steps 7–9 remain unintegrated. Step 4
source/build and status GUI are verified below.
Clipboard/Terminal interaction is BLOCKED_HUMAN because the Mac locked. Ignored preparation does not establish GUI passes. E1/E2 remain
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
pass is claimed. Step 1 local commit: `108c107`. Interactive gates remain as recorded above.

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
- Forgetting a project retains its native container and sign-in data; Firefox
  container removal remains a separate explicit action.
- A new tab whose selection is vetoed stays open and is reported unselected.

## Step 2 — integrated source; cookie GUI BLOCKED_HUMAN

Codex integrated the DOM-free process-wide container controller, public-ID and
confirmed-sharing boundaries, contracts and pure tests. Claude Opus 5.5, session
`eb1dce1b-2e3c-4206-8fda-851e4aa1c8ef`, owns every service, actor, tab-opening,
manual account/shared-site editor, native indicator and frontend test change.
Codex created or edited no frontend code.

Each project obtains its own public Gecko identity before a project link opens;
assignment is serialized and saved with compare-and-set. Shared sites use the
space's default container only after explicit confirmation. Manual account labels
never read pages, cookies or account names. Firefox deletion/reset clears mappings
and stops in-flight routing; failed cleanup blocks until retried. Renaming changes
only the identity presentation. Forgetting a project retains its native container
and sign-in data; removing those remains a separate Firefox action. Chromium
request contexts remain a requirement for the CEF workstream, unimplemented here.

Independent fake reproductions found and Claude corrected stale routing during an
awaited workspace switch, missing live tab container identity, selection veto
reporting, stale project menus and same-document URL changes. Routing now checks
per-project mutation marks and current hostname policy at dispatch, rejecting
changed or pending records before any tab exists. Commands bind to the live
originating tab, address and model generation. A created tab that Firefox leaves
in the background is reported honestly; it is retained. No unrelated tab is closed.
The exact three race probes and fresh-route controls passed after the fixes.

A Step 1 transport follow-up is included: Codex integrated a DOM-free shared raw
UTF-8 reader and arrival drain. Pinned Gecko readString may return an empty string
for a partial code point before EOF. Only a zero-byte raw ArrayBuffer now ends
arrival output; split Unicode, malformed/incomplete UTF-8 and exact raw byte caps
have meaningful regression coverage. Native supervisor/helper pins are unchanged.

Actual verification on 2 October 2026:

- Final `./dev test` and `./dev check`: exit 0. Browser 751/751, contexts 143,
  provider-host 122, containment reader Python 22, arrival supervisor Python 18;
  all other repository suites passed. CEF native/check/stream gates remained
  `SKIPPED_ENGINE_WORKSTREAM`. Focused integrated arrival/service/raw-reader suite
  passed 125/125; independent final menu regressions passed 6/6.
- Warm `./dev setup`: exit 0; 65 chrome files and 9 sandbox-readable Zen content
  resources verified. Native source fingerprint
  `9f35c040d85c8afe2e3cd5a948e6381c29635a775309fe78c0cdc7191992ab01`.
- Fresh owned real app profile, PID/executable/UID and two fixture listeners/CWDs
  admitted. Overview actor/runtime and Projects rendering passed. TLS checks
  remained on; provider hosts, key-entry prefs, endpoint and engine switching
  stayed off. The actual CUA call reported the Mac locked and unable to unlock.
  Arrival Keep, actual project-link tab creation and same-origin cookie isolation
  are **BLOCKED_HUMAN / NOT_VERIFIED**; no UI acceptance or cookie observation was
  fabricated. The explicitly requested cookie observer exits 1 for missing proof;
  this is recorded separately from native app exit 0 and successful cleanup.
- Read-only native raw-pipe arrival diagnostic passed: id plus three supervised
  lsof operations exited 0, raw EOF observed, all four children waited once with
  zero kills; exact owned Harbor folder found in 277 ms. No UI token, profile or
  fixture write occurred. This proves backend discovery, not native UI admission.
- Owned app and both fixtures reaped, both listeners closed, metadata hashes
  unchanged. The inspected overview screenshot still clips/fades lower content;
  Claude's Step 3 redesign must resolve that layout.

Evidence (ignored): `docs/evidence/plan4-2/raw-cookie-20261002-a/`, including
`observer-report.json`, `lead-observations.json`,
`33601efb670b5aad-arrival_diagnostics.json` and
`741c52d40cf3b29e-overview-window.png`. Logs:
`.local/logs/plan4-step2-lead-test-final.log`,
`plan4-step2-lead-check-final.log`, `plan4-step2-build.log`,
`plan4-step2-arrival-utf8-test.log` and `plan4-step2-raw-cookie-gui.log`.
Independent closure proof: `.local/plan4-prepared/contexts/step2-final-closure.md`.

Step 2 local commit: `b7d5baf`. The plan's
human gate permits proceeding to Step 3. E1/E2 are NOT_VERIFIED, product AI calls
are NOT_AUTHORIZED, and the app is not READY.

## Step 3 — project home integrated; synthetic light/dark GUI verified

Claude Opus 5.5, session `c270941e-860a-48ba-afb9-099231bf7daa`, made every
frontend and mixed service/actor change across six review rounds. Codex owns
contracts, independent review, process-fixture and cleanup repairs, tests,
builds, owned GUI runs, status and commits. Codex created or edited no frontend.

The project list leads to a dedicated home with app/environment links, manual
service account labels, a brief document, activity and console sections. Later
step capabilities are shown as unavailable. Editing, Spaces, site rules, ledger
and arrival remain reachable. Native Zen token imports, type and spacing support
light and dark. The previous fading/clipped layout is gone; ordinary scrolling
reaches the full About section.

The actor accepts only a known project ID in a registered normal window. Its
closed home projection excludes native container IDs and performs no creation,
detection, probe or AI call. Current records and routing generations are checked
after awaits. Independent actual-page fake probes found and Claude fixed stale
route/status results, late initial loads after pagehide, timer/subscription
cleanup and persisted-page restoration. Late initialization now makes zero
container/home/probe calls after pagehide; a fresh restoration does load again.

Actual verification on 2 October 2026:

- Final `./dev test` and `./dev check`: exit 0, browser 790/790. Other root
  suites pass, including contexts 143, provider-host 122, bootstrap Python 33,
  reader Python 22, arrival Python 18 and root Python 72. CEF native/check/stream
  gates remain `SKIPPED_ENGINE_WORKSTREAM`.
- Final warm `./dev setup`: exit 0, 65 chrome files and 9 sandbox-readable Zen
  content resources. Built app fingerprint
  `976a119439cfa68138062302c5d285177fbb91e878e8eba491c989a43db0816f`.
- Native startup exposed an incorrect contextual-identity module URL. Claude
  switched to the URL actually packaged by the pinned Gecko build. The first
  actual Harbor home also exposed native `replaceChildren` converting an absent
  brief into visible `null`; Claude fixed optional-child filtering. The valid
  brief and absent brief actual-page regressions pass. Final PNG inspection and
  direct-root text guards pass for all four homes.
- Six final owned synthetic captures pass: Projects light/dark, Harbor home
  light/dark and Inkline home light/dark. Source pins, exact loaded route/native
  document binding, known-normal window and both chrome/content themes are
  verified. Each app exits 0, its direct child and fixture child are reaped,
  its owned Marionette listener closes, and all 31 fixture metadata files and
  the seeded store retain their hashes. Process-group inactivity is not inferred.
- Actual CUA sees the native app and clicks the project links. The heading
  receives focus; Tab reaches Edit and More; Return opens the menu. Page Down
  reveals the full About section without fading or clipping, and Page Up returns
  to the header. The mouse-scroll API returned an error while the app remained
  live. Escape dismissal was not verified before bounded sessions ended.
  VoiceOver is `NOT_RUN`; this is a limited keyboard/accessibility smoke check.
- Arrival test receipts now publish atomically. Teardown signals retained Popen
  handles only; receipt PIDs are observation-only. Exact created file identity
  gates cleanup and preserves uncertainty. The product arrival helper is unchanged.
- Root dev/session cleanup no longer signals process groups after reaping their
  original leader. Session TERM and shared non-reaping grace precede all KILLs,
  then waits. Already-reaped leaders receive no sweep. Unreaped leaders retain
  their lease, streams and handles; uncertainty blocks reuse even after direct
  reaping. Every CEF profile is preserved. The 32
  injected active cleanup regressions pass. The actual owned TERM-ignoring
  descendant test confirms EOF after KILL, without claiming universal group proof.

Evidence (ignored): `docs/evidence/plan4-3/*-20261002-final/` contains all six
native PNGs and full receipts; `lead-observations.json` records the lead's pixel
and actual CUA checks. The observer's fixed `CUA=BLOCKED_HUMAN` template field is
stale; the lead's actual checks override it. Earlier refused startup runs A/B
and the rejected Harbor-null capture remain preserved. Final logs are
`.local/logs/plan4-step3-lead-{test,check,build}-complete.log` and
`plan4-step3-*-final.log`.

These are `SEEDED_RENDER_ONLY / ADMISSION_NOT_RUN` runs using invented metadata.
Actual reference-home admission/screenshots and cookie isolation remain
unverified behind the earlier unresolved native-picker/human gates; current Mac
accessibility alone does not prove admission. Product AI is `NOT_AUTHORIZED`,
E1/E2 remain `NOT_VERIFIED`, and the app is not READY. No push, tag or release.


Step 3 local commit: `47c7d0932f1b6d0d83d58c799133dff2afe01daf`.

## Step 4 — integrated; status GUI verified; handoff GUI BLOCKED_HUMAN

Codex integrated the DOM-free handoff, Terminal fixture/configuration,
channel transport/core/service, activity, path/lease/subprocess ownership,
hook configuration, notifier/socket/Terminal installers and tests. Claude
Opus 5.5 session `6271d45a-5ce2-4284-911b-ffe3b6616404` wrote every frontend
and mixed actor/service change in four implementation/review rounds: native
shortcut/context menu, clipboard composer, explicit synthetic Terminal action,
Settings, notifications, return actions and project activity. Codex created or
edited no frontend code. Claude reviewed the four saved status/Settings PNGs.

Review findings corrected by Claude: focused-frame/depth ambiguity; selected-tab
replacement during awaits; engine/frame-loader changes and selection vetoes on
return; project mutation during home/activity reads; and late old handoff feedback
replacing a newer result. Final dispatch rechecks native identity and project
authority. Unknown privacy, engine, frame or stale project state refuses.
Superseded feedback cannot disturb a newer composer/result; uncertain launches
are deferred until no newer result is present. All product agents remain
NOT_AUTHORIZED; undocumented desktop schemes are UNVERIFIED_CAPABILITY.

Final verification on 3 October 2026:

- `./dev test` and `./dev check`: exit 0. Browser 1162/1162; contexts 153/153;
  provider-host 122; root Python 165 (including 55 Terminal cleanup/leaf cases);
  bootstrap 33, containment reader 22, arrival 18 and socket POSIX 11 passed.
  Other repository suites passed; CEF native/check/stream remain
  SKIPPED_ENGINE_WORKSTREAM. Final logs:
  `.local/logs/plan4-step4-reviewed-final-{test,check}.log`.
- Storage mounted, external-wrapper `./dev setup`: exit 0; `zen.py describe`:
  PASS. Verified 85 packaged chrome files and 9 sandbox-readable Zen resources.
  Final fingerprint `1c68a500c488707b6aec67d5d7b14421c09a143319dd1dee09d48d4d62709b60`.
  Build/describe logs: `.local/logs/plan4-step4-reviewed-final-build.log` and
  `plan4-step4-reviewed-final-describe.json`.
- Clean native status run D: CUA enabled the endpoint, a separate fixed synthetic
  reporter sent Harbor Suite completion, and the app showed activity/notification.
  Light PNG inspected. CUA disabled it; one persistent helper wait and lease exit
  observed, socket/listener removed, native exit 0, app/fixture reaped, all 31
  fixture metadata files unchanged. All phase and 38 final checks passed.
- Clean native status run E: Inkline needs_input in dark mode plus Settings On
  and Off captures. All three PNGs inspected. From Projects, CUA Go to project
  returned to exact Inkline home and focused its heading. This proves known-home
  fallback; result-tab reload remains untested. Native exit 0/all final checks
  passed. D/E use the prior verified status build fingerprint `1ce12178…`; the
  subsequent Terminal rounds changed only handoff runtime/tests and added its
  DOM-free modules, preserving the reviewed status UI.
- Earlier status A failed before app launch; B/C were stopped/reaped after the
  observer incorrectly expected zero live endpoint claims. Corrected expectation:
  exactly one verified live claim, zero after disablement. C had a corrected
  address-entry error and is not clean acceptance evidence. No hook, provider,
  MCP or P4 action ran.
- Actual native Terminal-leaf diagnostic: live-child TERM works, while signalling
  a zombie-only process group returns EPERM. The fixture-only repair executes
  immutable checksum-pinned source with exact retained-child WNOWAIT ownership,
  no descendant/group claim and no signal after reap. Final actual leaf probe
  exited 0, produced the expected proof and was reaped. Helper SHA
  `082dba3a2f91febe98d77cbb57112fc710ab2267949ee1a1e9479f8afdb79986`.
  This is backend proof, not a Terminal GUI launch.
- Real handoff GUI attempt B reached OWNED_HANDOFF_CUA_READY on a fresh owned
  profile with both synthetic Projects rendered, normal window, TLS defaults,
  endpoint/providers off and zero handoff counters. CUA then reported the Mac
  locked and automatic unlock unavailable. Per the plan, interaction stopped:
  clipboard/context-menu/shortcut/fake Terminal and their light/dark captures
  are BLOCKED_HUMAN, not passed. Only this owned app and fixture were stopped;
  both reaped, both listeners closed, source/build/original metadata and store
  bytes unchanged. Native graceful exit 0 was not established after that stop.
  Prior attempt A refused before app launch because two retained diagnostic
  directories existed; they were preserved. The repaired observer compares their
  exact immediate metadata baseline and claims only absence of new launch state.
  Its 137 preparation/audit cases passed. No Terminal, provider or clipboard
  action occurred in these two attempts.

Accepted status evidence (ignored):
`docs/evidence/plan4-4/status-harbor-done-20261003-d/` and
`docs/evidence/plan4-4/status-inkline-input-dark-20261003-e/`, each with native
report and lead review. Worth inspecting: `harbor-suite-done-light-window.png`,
`inkline-needs_input-dark-window.png`, `settings-on-dark-window.png` and
`settings-off-dark-window.png`. Handoff gate/cleanup evidence:
`docs/evidence/plan4-4/handoff-harbor-light-20261003-b/lead-review.json`.
All data is invented/seeded; reference admission remains ADMISSION_NOT_RUN.

Decisions taken for Step 4:

- Endpoint disabled each process; normal Settings enables that session. Its
  current-profile `/.a/s` must fit 100 bytes; no alias paths.
- Native status profiles use owned `p4c-<16hex>/gecko`; Terminal fixtures use
  owned `runtime/<worktree-hash>/plan4-handoff-<32hex>/gecko`, with exact flags,
  private roots and verified ownership. No personal profile fallback.
- Ordinary Send to agent defaults to clipboard. Only an explicitly configured
  synthetic profile offers the fixed fake Terminal action. Merely opening the
  composer does not construct a fixture. Trusted activation passes AbortSignal
  and synchronous current-tab/project authority through metadata, dispatch,
  adoption and context write. Uncertain launch never retries or auto-copies.
- Hook snippets bind actual socket/checksum-pinned notify script; copyable only.
  Browser never installs or executes them. Official Claude exec-form and Codex
  user-level notify-array schemas were checked on 2 October 2026.
- Screenshots/console capture await their own privacy proof, P4 awaits Step 8,
  live AI stays NOT_AUTHORIZED. VoiceOver and full Terminal GUI stay unverified.

Continue to Step 5 under the explicit human gate. E1/E2 remain NOT_VERIFIED and
this app is not READY. No push, tag or release.


Step 4 local commit: `5017c4c5749e07bd03059f40d5991aa403ac06a5`.

## Step 5 — integrated; light key presence verified; interaction BLOCKED_HUMAN

Local integration commit: `30bda52`.

Codex integrated provider-qualified DOM-free key APIs, fixed synthetic presence
fixture/native admission, additive per-rule provider/screen policy, contracts,
tests and the owned GUI observer. Claude Opus 5.5 CLI, session
`4f494ba6-bdea-411e-8ad2-dc257b598ee6`, owns every frontend change: both key-entry
surfaces, actor/dialog lifetime wiring, rule choices, presentation and native
site-rule runtime changes. Codex created or edited no frontend code.

Product AI remains **NOT_AUTHORIZED**. OpenAI stays **UNVERIFIED_SHAPE**: the
official Decisions guide/resource URLs returned 404 on 3 October 2026; the
[DevDay announcement](https://openai.com/index/devday-2026-recap/) gives no wire
schema. Native screenshot observation remains unavailable until Step 8 privacy
admission is implemented and proved. No provider API call was made.

Final verification after bounded startup, native stdin EOF and fixture reader-lock corrections:

- `./dev test` and `./dev check`: exit 0. Browser 1290/1290, contexts165,
  root Python182, bootstrap33, containment reader22, arrival supervisor18,
  socket11, coordinator4, probe14 and Cargo10 passed; provider-host118 and provider checks passed.
  CEF native/check/stream gates remain SKIPPED_ENGINE_WORKSTREAM.
- `./dev setup` and `zen.py describe`: PASS, 87 packaged chrome files and
  9 sandbox-readable Zen resources. Workstation fingerprint
  `22d9d2cdd1b2377d6ab8bb34e1161124e48266e45cced75acd68dff6cc034918`.
- Focused key/raw suites90/90 and Python presence fixture14/14 plus actual
  POSIX lock cases3/3 passed.
  Selected contexts checkpoint/rule/image policy cases28/28 passed.
- Final native backend gate15/15 passed. Revocation during an actual metadata
  read started zero key-operation children. All310 direct runtime children
  exited/reaped,619 waits completed, and all pipes closed. Natural raw EOF:
  stdout307/stderr309; deliberately stalled/late cleanup cases are separately
  recorded. Both final presence markers were absent. Root independently matched
  the active source hashes and asserted the lifecycle receipts. This proves
  the DOM-free native boundary, not Gecko UI or production Keychain behavior.
- Source review and20 new injected regressions reproduced a Gecko stdin-close
  race (13 failed/7 passed before repair). Gecko closes stdin on process exit;
  only its numeric EOF close error is now tolerated. Successful writes, genuine
  output EOF, accepted wait results, deadlines and authority remain mandatory.
  Other close errors and incomplete children still refuse. Independent review
  is clear. Native15-case reruns after the EOF and later fixture change each
  used fresh owned fixtures and passed; final gate is the lock-check receipt.
- Three actual POSIX tests reproduced exclusive-lock contention between two
  presence readers. The synthetic helper now uses shared nonblocking locks for
  presence and exclusive nonblocking locks for mutations. Busy mutations still
  refuse with unchanged markers. Helper SHA256
  `82e11f794ab48cd0b29a28e65a560e876dca88406c3fc8d96fc851c300365d71`;
  installer, runtime and observer pins were updated and verified. No production
  Keychain helper or frontend code changed in these two backend corrections.
- Independent authority reproductions now reject lost/unknown actor and dialog
  authority before dispatch. The browser-owned synchronous `isActive` callback
  is checked through async fixture admission and immediately before input or
  removal dispatch. Unknown late mutation outcomes no longer claim rollback.
- Four immutable decision-race reproductions now measure zero requests, budget
  calls and sending indicators. A rule/settings/context reload closes admission
  synchronously; changed epochs, superseded reads, failed reads and stale
  completions cannot restore it. Fresh checkpoints require settled policy.

Actual native GUI attempts:

- RunA used a new owned light profile but Zen selected its empty startup tab.
  Initial AI readiness timed out, no screenshots or key operations; no pass.
- RunB used another new profile with source-verified native homepage startup
  preferences. Selected/current/normal AI document, strict native identity,
  fixture, TLS defaults, theme, two key-panel structures and provider cards all
  passed. Both key forms remained disabled with unknown/refused status. Startup
  logged two `not a top-level tab` actor refusals. The inferred page connection
  latch is under Claude review; no sender check has been weakened. Initial
  usable-key readiness timed out and no screenshot was accepted.
- Both attempts reaped their owned app/installer children, closed the owned
  Marionette listener, preserved source/build/profile/fixture identities and
  left both presence markers absent. Graceful native exit0 was not observed;
  these are failed GUI gates, not successful clean interactive runs.
- Claude added a bounded, cancellable initial flags handshake. Only an actual
  successful response admits the page; sender/actor failures retry on a fixed
  schedule, while other failures stay disconnected. Existing sender checks
  remain intact. Full tests/check/build above cover this correction.
- RunC on the rebuilt source still failed strict functional readiness: both
  key forms remained disabled, without sender refusals in its log. Exact
  native/source/build/fixture binding passed; no key operation or PNG was
  accepted. Its owned child/listener cleanup passed, graceful exit0 unobserved.
- Separate diagnostic-only runs D light and E dark captured native window and
  full-content PNGs. Root inspected all four: both providers show
  KEYCHAIN_HELPER_UNAVAILABLE. Existing actor lookup proved exact selected
  current/top-level/normal privileged-about identity and embedder; it created
  no actor, sent no message and called no service. All diagnostic lifecycle
  checks passed, including native exit0, owned child reaping, closed listener,
  unchanged identities, absent endpoint and both markers absent. These are
  **DIAGNOSTIC_RENDER_ONLY**, explicitly **NOT_PASSED** functional key gates.
  Root is isolating native fixture admission; Claude reviews screenshots and
  frontend wiring separately. No authorization check has been relaxed.
- Diagnostic runF light added a single metadata-only native factory probe with
  an instrumented native-equivalent runtime. Admission resolved in69ms, with
  eight metadata children/eight completed waits and genuine stdout/stderr EOF.
  Pipe close after EOF rejected; natural EOF and completed waits establish
  those children's completion. The probe called no returned runtime/key method.
  Its PNGs and full receipt show a partial improvement: Jev reached missing-key
  status with an enabled form; OpenAI remained unavailable. The fixture lock
  existed, so the UI did reach the synthetic helper; observer execution counts
  of zero must not be read as a global no-helper claim. Both presence markers
  remained absent, all final lifecycle checks passed, and native exit0 was
  observed. This diagnostic is not a functional key gate. Root inspected both
  PNGs and is distinguishing startup/default runtime and downstream failures.
- Claude separately reviewed D light and E dark without source edits. Content
  layout is contained and readable; dark native sidebar/vibrancy contrast is
  unverified by the WebDriver snapshot. Keyboard/focus remain unverified.
- Claude's ninth Step5 CLI round reviewed final lightI PNGs, historical darkE
  PNGs and final darkJ report without edits. It found no concrete frontend
  wiring flaw and accepted the light layout. Unknown presence deliberately
  leaves Store enabled and offers Remove; that is not missing-key success.
  Minor copy polish and native dialog evidence remain follow-ups, not passes.
- Final light runI on the final build: both provider status reads reached
  missing, both forms enabled, all fixed structure/label/native/source/build
  checks passed. Root inspected the native window and full-content PNGs; layout
  is contained and readable. Native exit0, direct owned app/installer reaping,
  listener closure, unchanged identities and absent markers/endpoint all passed.
  This is **INITIAL_PRESENCE_RENDER_PASS**, not store/remove interaction. The
  browser exposes no direct helper wait receipt; the separate native backend
  gate remains the child-process lifecycle evidence.
- Dark runsH (after EOF repair) andJ (final helper) failed strict initial
  readiness with one provider missing/ready and the other status unresolved.
  Both native forms had enabled inputs; the unknown-status remove control did
  not match the missing-key capture gate. Their exact reason was not read, so
  neither earlier race is claimed as the proved cause. No PNG was accepted.
  Their owned children were reaped/listeners closed/identities preserved and
  markers absent; graceful native exit0 was not observed. Final dark initial
  presence remains **NOT_VERIFIED**. Historical dark E verifies only its stated
  diagnostic rendering on the same frontend source, before backend corrections.
- Bounded dark runK added a read-only allowlisted status-code observation.
  Jev reported `KEYCHAIN_REFUSED`; OpenAI reached missing/ready. The final
  source already includes both backend repairs, so neither is claimed as this
  failure's cause. The 60-second owned-app deadline ended the strict capture
  attempt; no PNG was accepted. Owned reaping/listener closure/identity and
  absent-marker checks passed; graceful native exit0 was not observed.
- A fresh CUA `getState` reported the Mac locked and automatic unlock
  unavailable. Per the plan, Check again/store/remove/native Settings dialog/
  keyboard GUI are **BLOCKED_HUMAN**; no bypass was attempted. The unresolved
  dark startup remains a separate failed gate, not a human-gate pass. Actual
  macOS Keychain behavior and VoiceOver remain **NOT_VERIFIED**. Continue to
  Step6 under the explicit interaction gate; preserve these follow-ups.

Evidence (ignored):
`.local/logs/plan4-step5-lock-{test,check,build}.log`,
`.local/logs/plan4-step5-lock-build-identity.json`,
`.local/logs/plan4-step5-{stdin,lock}-{before,focused}.log`,
`.local/logs/plan4-step5-cua-blocked-20261003.json`,
`.local/plan4-prepared/step5-key-native-lock-check/` (final),
`.local/plan4-prepared/step5-key-native-authority-check/` (receipt SHA256
`d2ef4961497f7f8c998def5cc128695c08188fadaa924400163137565641ef5d`),
`.local/plan4-prepared/step5-review-bidi/final-rule-review-receipt.json`, and
`docs/evidence/plan4-5/keys-light-20261003-{a,b,c}/`,
`docs/evidence/plan4-5/keys-diagnostic-light-20261003-d/`, and
`docs/evidence/plan4-5/keys-diagnostic-dark-20261003-e/`, and
`docs/evidence/plan4-5/keys-admission-light-20261003-f/`. Final useful light PNGs:
`docs/evidence/plan4-5/keys-light-20261003-i/both_missing-light-window.png` and
`both_missing-light-full-content.png`. G is the earlier passing EOF-only light
run; H/J/K retain failed dark reports. The final light lead review records scope.
The earlier14-case/301-child receipt remains historical evidence for its
pre-guard source snapshot, not the final backend or frontend boundary.

Decisions taken for Step5: keep Jev entry default true; give OpenAI its own entry
pref default true. Entry never grants consent or live calls; unknown prefs refuse
entry and removal remains available. Preserve omitted legacy provider and stored
screen policy. During policy reload/failure, deterministic local limits retain
last installed rules while optional decisions remain unavailable. Native capture
stays off until the later privacy gate. Fresh synthetic GUI profiles use only
public invented key strings and presence markers; they never access real keys.

Step5 source, final tests/check/build and scoped real GUI review are complete for
local commit under the stated interaction gate. Dark initial key presence,
store/remove and dialog/keyboard tests remain follow-ups. Steps6–9 preparations
remain ignored until this commit; they establish no native or GUI pass. Not READY.


## Step 6 — integrated source/build and initial light/dark render; interactions BLOCKED_HUMAN

Codex owns the DOM-free runner, transport, private-owner facade, pinned offline
fixture and manifest helper, contracts, tests, builds and observation harness.
Claude Opus 5.5 CLI session `c2a11ccc-533e-45cb-984c-08818ac46390` wrote all
mixed Services/actor/startup and Overview/UI changes. Codex created or edited no
frontend code. The original task, source-review round and screenshot round are
retained under `.local/claude-tasks/06-understand-tier*`.

The process service creates an offline facade only for the exact native fixture
request. Product Read, state and availability remain **NOT_AUTHORIZED**, before
project lookup, filesystem admission or client discovery. Fake Claude Code/Codex
reads are explicit; queued/running/saving status and cancellation are separate
from success. Only a durably stored schema-validated brief is rendered. Its
commands, paths and unconfirmed domains are inert text.

Every read/preview/acceptance has a private native owner bound to the registered
normal window, selected browser, current document and exact project-home route.
Tab selection, native top-level location changes, destruction or privacy loss
end it. Native URI identity detects A→list→A even before a cooperative page
cleanup request. Root checked the pinned Gecko URI replacement and tab progress
sources; this is source evidence, not an interactive navigation pass.

Settled project snapshots carry monotonic revisions. External changes withdraw
authority before their first await, including detection refresh and the legacy
manifest write. The facade's serialized own commit stays separate. Acceptance
uses a one-use expiring preview token and writes only the explicitly confirmed
name/kind through the pinned containment helper. Recognizable own tokens are
spent on malformed attempts, including wrong/missing project IDs; another
owner's token stays protected. Uncertain write outcomes require inspection
before another write. No automatic retry or copied AI command/domain grants
filesystem or execution authority.

Actual verification:

- `./dev test` and `./dev check`: **PASS**, exit 0. Browser 1,593; provider-host
  133; contexts 165; root Python 237; Cargo 10; bootstrap 33; reader 22; arrival
  18; manifest helper 28; socket 11; coordinator 4; probe 14. Provider sandbox 5,
  negative Keychain 8, positive synthetic Keychain 3, CEF adapter 38 and saved
  pages 3 also passed. Native/stream CEF gates stayed `SKIPPED_ENGINE_WORKSTREAM`.
- Claude's relevant in-memory suites: 402/402, including 43 Services integration
  and 30 Overview cases. Eighteen added regressions cover route/ABA lifetime,
  held admission/preview/write guards, own-token consumption and synchronous
  mutation entry. Root reviewed these changes and ran the full suites above.
- Focused DOM-free suites: 191/191 on pinned Node 22.22.3; active native stdin
  close/known-exit regressions: 40/40. The manifest helper installed and its
  28 actual synthetic filesystem tests passed.
- Owned native backend fixture `5614c42be0474c71aa51c49667e6153b`: 12/12,
  zero skips, exit 0. Both canned briefs, explanation, queued/active cancellation,
  EOF, crash and bounded cleanup ran. Sixteen launch records (9 host/7 CLI)
  contain 32 unique PIDs; all were absent in read-only post-run observations.
  These launch records are not aggregate wait/EOF or universal descendant proof.
  No Gecko app or real provider ran in this separate backend gate.
- `./dev setup`: **PASS**, exit 0, workstation-only native build. Fingerprint
  `3745d93affe20d5001430203524364bd11a3ef984fa71064048d6303feaea92b`.
- Actual Gecko initial render: Harbor light and Inkline dark **PASS**. Four
  screenshots were captured and inspected by the lead and Claude; Claude
  accepted the initial visual surface in its same-session read-only review. Both exact owned runs
  had native exit 0, direct children reaped, listener closed, unchanged seeded
  store and nine installed fixture inputs, matching source/build/profile
  identities and no agent endpoint. Renderer fakes 75 and native-object fakes
  24 passed; their checks do not establish interactive functionality.

GUI evidence (ignored):

- `docs/evidence/plan4-6/understand-harbor-light-20261003-a/initial-light-window.png`
- `docs/evidence/plan4-6/understand-harbor-light-20261003-a/initial-light-full-content.png`
- `docs/evidence/plan4-6/understand-inkline-dark-20261003-b/initial-dark-window.png`
- `docs/evidence/plan4-6/understand-inkline-dark-20261003-b/initial-dark-full-content.png`

The corresponding `step6-render-report.json` files retain native identity,
read-only assertions, hashes and cleanup. These are **SEEDED_RENDER_ONLY /
ADMISSION_NOT_RUN**, with zero observer actor/service/provider operations.
No Read, Stop, Accept, reinspection or persistence interaction was performed.
Fresh `cua.getState` again reported the Mac locked and automatic unlock failed:
`.local/logs/plan4-step6-cua-after-review-20261003.json`. Those interactions are
**BLOCKED_HUMAN**; VoiceOver, actual route-change timing and reference-project
admission remain **NOT_VERIFIED**. The human gate permits the next plan step.

Logs: `.local/logs/plan4-step6-{test,check,build}.log`,
`plan4-step6-build-identity.json`, `plan4-step6-gui-lead-review.json`,
`plan4-step6-route-primary-source.json`, and
`.local/plan4-prepared/step6-native-integrated-check/`. The 30-file integrated
backend manifest stayed unchanged through its native gate. Product AI remains
**NOT_AUTHORIZED**. E1/E2 are not verified; no READY claim, push, tag or release.

Decisions taken for Step 6: retain selected-tab cancellation and state this in
its fixture explanation; keep product Read controls unavailable while showing
previously saved briefs; explicit acceptance always confirms both name and kind;
known non-writes report refusal, while uncertain writes require inspection.
