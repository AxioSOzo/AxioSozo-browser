`codex-0.155.1.json` was generated locally using the installed OpenAI Codex CLI
0.155.1 command `codex app-server generate-json-schema`. The consolidated generated
schema is retained; the temporary per-message generated files were removed.

Upstream: https://github.com/openai/codex (Apache-2.0).
License: https://github.com/openai/codex/blob/main/LICENSE
No Codex executable or provider credentials are redistributed here.

Regenerate only from an audited exact version, in a task-owned external directory;
keep the consolidated schema and update `docs/provider-provenance.json`. An installed
client with a different version is not automatically compatible.

`codex-0.157.1-requests.json` contains the unmodified per-method schemas for
InitializeParams, ThreadStartParams, ThreadResumeParams, TurnStartParams,
TurnInterruptParams and GetAccountParams from the official `rust-v0.157.1` tag:
https://github.com/openai/codex/tree/rust-v0.157.1/codex-rs/app-server-protocol/schema/json
They were downloaded without executing a Codex client on 26 September 2026.
The host separately validates the exact-source experimental `environments: []`
and `dynamicTools: []` fields as empty arrays; stable generated schemas omit them.
Apache-2.0 attribution above applies to these schemas too.
