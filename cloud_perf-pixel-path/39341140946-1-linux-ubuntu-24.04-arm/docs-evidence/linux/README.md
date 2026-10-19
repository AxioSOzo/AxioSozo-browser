# Linux GUI evidence

Screenshots of the real Linux AxioSozo (Zen/Gecko) app, captured by
`./dev gui-test --engine gecko` under Xvfb (1280x800, no window manager) on a
GitHub-hosted ubuntu-24.04 runner.

| File | Source |
| --- | --- |
| `linux-about-axiosozo.png` | Actions run 39319467677 (linux-gui.yml), app artifact of build run 39314199236 (commit 412de34), scenario `about` |
| `linux-gecko-fixture.png` | same run, scenario `fixture`: the owned loopback fixture in a `webIsolated` Gecko content process (content sandbox level 6) |

Full results (result.json, logs, all screenshots) are on the `ci-results`
branch under `cloud_linux-platform/39319467677-1-gui-gui-gecko/`. That run's
`input` scenario FAILED (main-process SIGSEGV in the WebRender renderer thread
after Return in the address bar); see docs/handoff/linux-platform.md.
