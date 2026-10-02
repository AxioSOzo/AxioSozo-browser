# tools

- `axiosozo-notify`: a POSIX `sh` script that agents' hooks call to report
  `started | needs_input | done | failed` to the running AxioSozo browser over
  the local agent channel (`contracts/agent-channel-v1.md` §3). It always
  exits 0 and prints nothing, within about 1.5 s.

  ```sh
  axiosozo-notify claude-code <Event>      # Claude Code hook; hook JSON on stdin
  axiosozo-notify codex '<json>'           # Codex notify; JSON as the last argument
  axiosozo-notify status done "Title"      # manual report
  ```

  Hook configuration, doc sources and tests:
  [`packages/agent-bridge/README.md`](../packages/agent-bridge/README.md).
  The script must be committed with mode `100755`. This checkout is on exFAT
  with `core.fileMode=false`, so set it with
  `git add --chmod=+x tools/axiosozo-notify`.
