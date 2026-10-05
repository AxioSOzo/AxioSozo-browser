# Understand tier, version 1 (PLAN_4 §4)

Owner: integration lead; implementation: providers workstream
(`packages/provider-host`). AI in the browser produces a choice, a status or a
document, never a conversation. This tier runs the **user's own installed**
Claude Code or Codex CLI headless, read-only, scoped to one project folder,
and returns schema-validated JSON that the browser renders as a document.

Live runs are **NOT_AUTHORIZED** until Wout authorizes them. Tests use fake CLI
executables only (`packages/provider-host/fixtures/understand/`).

## 1. Host methods

Reached from chrome over the existing provider-host stdio transport
(provider-v1). The host is started on demand.

| Method | Params | Result |
| --- | --- | --- |
| `understand/run` | `{ request_id, kind, cli, project_root, input?, timeout_ms? }` | understand result (§3) |
| `understand/cancel` | `{ request_id }` | `{ cancelled: boolean }` |
| `understand/available` | `{}` | `{ clis: [{ cli, path, version }] }` from metadata discovery only (no auth or process launch, including `--version`) |

- `kind` ∈ `brief`, `explain_errors`, `setup`. `cli` ∈ `claude-code`, `codex`.
  `setup` is used while the user adds a project folder (§3.3); it takes no
  `input`, like `brief`.
- `project_root`: absolute, existing directory, not `/`, not `$HOME`.
- `input` (`explain_errors` only): `{ url, errors: [{ level, text, source, line }] }`
  (≤ 50 errors, text ≤ 1000 chars, url http(s) without query/fragment).
- `timeout_ms`: 10 000–300 000, default 180 000.
- Requests are queued (one running at a time per host, queue ≤ 4, else
  `BUSY`) and cancellable. Chrome shows a visible indicator while one runs.

## 2. Process rules

- Spawned with an **argument array**, never a shell string; `cwd` =
  `project_root`; stdin carries the prompt; stdout capped at 256 KiB (more →
  `invalid_output`, child killed); stderr capped at 16 KiB and never shown.
- Environment: `PATH`, `HOME`, `LANG`, `TERM=dumb`, plus nothing else from the
  browser (no `AXIOSOZO_*`, no tokens).
- Read-only flags: the CLI's documented read-only/plan mode, file-write and
  shell tools disallowed, network tools (web fetch/search) disallowed where the
  CLI allows that, and deny rules for `.env*` reads where the CLI supports
  permission rules. The exact argument arrays live in `src/understand.mjs`
  with a reference to the documentation they came from.
- The prompt states: read-only, do not open `.env*` or credential files, answer
  with one JSON object matching the schema, nothing else.
- Timeout, cancellation and host exit attempt group/direct signals only while
  the retained direct child still records live state. Known exit suppresses
  numeric signals. A stopped request closes owned streams and settles after
  known direct-child exit; this does not prove descendant termination or reaping.
  Ordinary results continue draining output until close.

## 3. Result

```jsonc
{ "version": 1, "request_id": "…", "kind": "brief", "cli": "claude-code",
  "status": "ok" | "failed" | "cancelled" | "timeout" | "unavailable" | "invalid_output" | "busy",
  "reason": null | <fixed reason below>,
  "document": <brief | error_explanation | setup> | null,
  "data_sent": true | false,       // true once the CLI was started (it may contact its provider)
  "duration_ms": 1234 }
```

`reason` is `null` only for `ok`. Other statuses use one of
`NOT_AUTHORIZED`, `CLI_NOT_INSTALLED`, `SPAWN_FAILED`, `EXIT_NONZERO`,
`CLI_REPORTED_ERROR`, `OUTPUT_LIMIT`, `SCHEMA_MISMATCH`, `TIMEOUT`,
`CANCELLED`, `QUEUE_FULL`, `HOST_CLOSED`. The product host explicitly uses
`liveAuthorized: false`; a valid run returns `unavailable` / `NOT_AUTHORIZED`
with `data_sent: false` before any CLI launch. Fake-only tests may use the
explicit test launch seam.

### 3.1 `brief` document

```jsonc
{ "version": 1,
  "product": "≤ 600 chars: what the product is",
  "apps": [ { "name": "≤ 64", "kind": "web|desktop|mobile|api|docs|cli|library|other", "path": "relative ≤ 200 | null", "summary": "≤ 200" } ],   // ≤ 16
  "domains": [ { "host": "hostname", "purpose": "≤ 120" } ],                  // ≤ 32
  "services": [ { "name": "≤ 64", "purpose": "≤ 120" } ],                     // ≤ 16
  "start": [ { "label": "≤ 64", "command": "≤ 200", "cwd": "relative ≤ 200 | null" } ],  // ≤ 8
  "risks": [ "≤ 200" ] }                                                       // ≤ 8
```

### 3.2 `explain_errors` document

```jsonc
{ "version": 1, "summary": "≤ 400", "items": [ { "error": "≤ 200", "likely_cause": "≤ 400", "where": "relative path ≤ 200 | null" } ] }  // ≤ 10
```

### 3.3 `setup` document

The agent reads the folder (read-only) and reports the project type, its most
likely logo/icon file, and the services with their development start commands.

```jsonc
{ "version": 1,
  "name": "1–80, single line | null",          // product name as the project presents itself; null if unclear
  "kind": "web|desktop|mobile|cli|library",     // a browser or other native app is desktop, even in Rust/C++
  "kind_reason": "0–160, single line",          // e.g. "Custom Firefox/Zen desktop browser started with ./dev"
  "icon": "relative image path | null",
  "services": [ { "name": "1–64, single line",
                  "kind": "web|desktop|mobile|api|worker|docs|other",
                  "command": "1–200, single line",   // exact dev start command typed in a terminal, e.g. "./dev", "pnpm dev"
                  "cwd": "relative directory | null", // null = project root
                  "url": "local URL | null" } ] }    // ≤ 8; null when nothing is served (desktop apps, workers)
```

- Single line: no U+0000–U+001F or U+007F. Strings are trimmed, then
  length-checked.
- Relative path (`icon`, `cwd`): ≤ 200 chars; not starting with `/` or `~`; no
  `\`, `?`, `#` or URL scheme (`^[a-z][a-z0-9+.-]*:`); ≤ 16 `/`-separated
  segments, each non-empty, not `.`/`..`, not matching `^\.env` (any case).
  `icon` additionally: no segment starting with `.`, and the extension is one
  of `png`, `svg`, `ico`, `webp`, `jpg`, `jpeg` (any case).
- `url`: ≤ 200 chars, `http:`/`https:`, hostname exactly `localhost`,
  `127.0.0.1` or `[::1]`, explicit port, no credentials, query or fragment (the
  raw string contains no `?` or `#`). Normalized to the URL's `href`, without
  the trailing `/` when the path is `/` (`http://localhost:5173`).
- Service names need not be unique. One invalid item makes the whole document
  invalid; nothing is dropped silently. The validated document is frozen.

#### Models and provider selection (`setup` only)

`setup` uses the cheapest suitable model per CLI (`SETUP_MODELS`); `brief` and
`explain_errors` keep the CLI's default model and their argument arrays are
unchanged.

| CLI | Model | Arguments |
| --- | --- | --- |
| `codex` | `gpt-6-luna` | `exec -m gpt-6-luna -c model_reasoning_effort="low" --sandbox read-only …` |
| `claude-code` | `claude-sonnet-5-5` | `--print --model claude-sonnet-5-5 --output-format json --json-schema <SETUP_SCHEMA> …` |
| `antigravity` | `gemini-3.8-flash-low` | planned, not runnable: no Understand route in this build |

Source: the model ids were taken from the installed CLIs' own model lists, with
no provider call (Codex 0.160.0 ships `gpt-6-luna`; Claude Code ships
`claude-sonnet-5-5`; agy ships `gemini-3.8-flash-low/medium/high`).

Automatic selection (`pickSetupCli(availableClis)`): the first of `codex`,
`claude-code` present in the given CLI names (Codex preferred), else `null`.

Validation is strict (unknown keys rejected, strings trimmed and capped,
hosts validated). Anything else → `invalid_output`, `document: null`.

## 4. Storage in the browser

The brief is stored in the profile on the project record (`brief`, context
store v3): `{ "version": 1, "cli": "claude-code", "generated_at": <safe integer epoch milliseconds>, "accepted": false, "document": <brief> }`.
"Accept into manifest" writes only `name`/`kind` changes the user confirms;
the brief itself is never written to `.axiosozo/project.json`.

## 5. Browser service boundary

The process-wide chrome facade owns a bounded queue and private native caller
identities. Page JSON never supplies an owner, filesystem root, revision, runtime
or authorization flag. Production state/availability/read remain
`NOT_AUTHORIZED` before project lookup, admission, discovery or process launch.
A separately pinned private synthetic fixture may exercise canned clients; its
mode is `OFFLINE_FIXTURE` while authorization remains `NOT_AUTHORIZED`.

Each operation captures the registered project root and monotonic revision,
then requires current native owner and fresh root admission through dispatch
and publication. External mutations invalidate authority synchronously, before
asynchronous storage or detection. Releasing one owner cancels only its work;
process shutdown retires the shared runtime. Queue/running notifications are
not persistence receipts. A successful brief replaces the old saved brief only
through a guarded serialized contexts-store update returning the exact published
record with a new revision. Failed, cancelled or stale work preserves the old
brief. Authority lost after publication cannot promise rollback.

Manifest acceptance is separate from optional live Read authorization. Preview
creates a private owner/project/root/revision/exact-brief-bound token, valid for
120 seconds and one use. Only explicitly confirmed nonempty `name`/`kind` edits
are accepted. Commands, domains and other brief fields are inert data and cannot
be copied into the manifest by this API. The pinned descriptor-based helper
revalidates the root, current static manifest and target identity before its
atomic file replacement; metadata checks do not exclude arbitrary same-UID
filesystem races.

Acceptance returns `{status, committed, reason}`. Only `ACCEPTED` means native
publication was freshly inspected and the exact saved brief was guardedly
reconciled. A lost/uncertain write result retains an inspection debt and returns
`REINSPECTION_REQUIRED`; no automatic write retry or fresh writer is admitted
until explicit inspection. Inspection does not itself retry a write. Page events
contain only the fixed `understand` name; documents, aliases, tokens and paths
never become global event payloads.

## 6. Changelog

- 2 October 2026 — created for Plan 4.
- 3 October 2026 — integrate the guarded browser facade, manifest acceptance and
  accurate direct-child cleanup limits; retain live authorization closed.
- 5 October 2026 — add the `setup` kind (§3.3) with its strict document,
  cheapest-model table and Codex-first automatic CLI selection; live runs
  remain NOT_AUTHORIZED.
