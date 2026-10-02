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

- `kind` ∈ `brief`, `explain_errors`. `cli` ∈ `claude-code`, `codex`.
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
- Process group is killed on timeout, cancel or host exit.

## 3. Result

```jsonc
{ "version": 1, "request_id": "…", "kind": "brief", "cli": "claude-code",
  "status": "ok" | "failed" | "cancelled" | "timeout" | "unavailable" | "invalid_output" | "busy",
  "reason": null | <fixed reason below>,
  "document": <brief | error_explanation> | null,
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

Validation is strict (unknown keys rejected, strings trimmed and capped,
hosts validated). Anything else → `invalid_output`, `document: null`.

## 4. Storage in the browser

The brief is stored in the profile on the project record (`brief`, context
store v3): `{ "version": 1, "cli": "claude-code", "generated_at": "<timestamp>", "accepted": false, "document": <brief> }`.
"Accept into manifest" writes only `name`/`kind` changes the user confirms;
the brief itself is never written to `.axiosozo/project.json`.

## 5. Changelog

- 2 October 2026 — created for Plan 4.
