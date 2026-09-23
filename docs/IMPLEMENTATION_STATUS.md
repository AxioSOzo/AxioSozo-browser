# Browser experience implementation status — 23 September 2026

**PARTIAL_ENGINE_BLOCKED. Not READY.** The pinned Zen/Firefox 156.0 app runs on
this Apple Silicon Mac. The independent Gecko navigation, local save and
environment slices are usable. General Chromium browsing, live provider help,
provider browser tools and Jev decisions are not implemented or verified.
The local CEF fixture is an explicit experiment, never a substitute for E1/E2.

| Flow | Implemented | Actually verified | Remaining work or blocker |
| --- | --- | --- | --- |
| A · open/search | One trusted chrome command registry and inline temporary new/current-tab layer. URL, configured web search, open tabs and saved pages are distinct keyboard results, scoped to the current container. | Final native GUI: Cmd+T, Escape with unchanged tab count and content focus; URL confirmation opens a second tab; saved result selected by ArrowDown and reopened by Return. Fast Escape then Cmd+K keeps focus in the new layer. | Recent history is omitted because native history entries do not carry the container identity required by this list. Search engine variants, IME and VoiceOver remain untested. |
| C · settings | Existing privileged settings window; metadata-only discovery; local per-instance enabled/default/ordered fallback policy. Disabled or unverified instances cannot be admitted. | Final native GUI displayed Codex, Claude Code and Antigravity metadata and no default provider. One initial metadata request failed; manual Refresh succeeded without a provider client. Offline routing tests cover zero, one, two and three enabled instances. | No live auth, paid route, sandbox or Keychain browser round-trip. Installed Codex 0.156.1 and Claude Code 2.1.280 differ from pinned fixture versions; Antigravity version is unknown. A later accessibility close request timed out once, although the app main thread sampled idle. |
| B · contextual help | Ask is registered but explains the blocked live boundary; it sends no selection/page data. | Blocked status in the command surface only. | No compact answer, streaming, stop, expansion, provider session or selection-scope UI. Separate live authorization plus client/version/sandbox proof are required. |
| D · save/close | Serialized atomic local JSON, URL/title/time/container, lexical search, delete and undo commands; private save rejected; beforeunload runs before commit/close. | Offline tests verify reload, identity distinction and failed write. Final native GUI saved and closed a fixture tab, found it in the same modal, and reopened it with the keyboard. | GUI restart, undo/delete, beforeunload on complex sites and selected-fragment/note capture remain unverified or unfinished. |
| E · environment/engine | Firefox container picker/create with current environment label and unknown website account. Existing CEF action is restricted to the owned local GET fixture. | Final native GUI created “Fixture test” container and showed it as current. In a separate `./dev engine-probe`, the command palette switched the local fixture to CEF Chromium 154.0.8037.17 and back to the retained Gecko tab. | General URLs, OAuth/POST/signed URL safety, TLS, permissions, downloads, accessibility, IME and crash recovery are E1/E2 blockers. Container cookie/history isolation was not exercised with two logged-in identities. |
| F · Jev | Existing typed synthetic handoff 1 module stays off; no decision route affects the browser. | Synthetic fixture tests only. | No Jev key or authorized network call; three optional browser decisions are not wired. |
| Agent browser tools | Handoff 1 coordinator/grant boundary retained. | Existing real-process IPC and fixture tests. | No provider-facing official tool endpoint or authorized mutating browser task. |

Status by flow: **A IMPLEMENTED/UI_TESTED**, **B BLOCKED**, **C EXPERIMENTAL**,
**D IMPLEMENTED/UI_TESTED**, **E EXPERIMENTAL**, **F BLOCKED**. These labels
apply to the first-experience request, not to all inherited upstream browser
capabilities.

## Native evidence

- Final source fingerprint: `99410281173182718e6ec81df3c6ddad9e655879debdfe88fdc50652a9bd2cf6`.
  `./dev setup`, `./dev check` and `./dev test` exited 0 on that source;
  logs are `/Volumes/AxioSozoBuild/axiosozo-handoff2-{build,check,test}-final4.log`.
- Final Gecko UI session: `docs/evidence/smoke-2061071c3d39a3b3/`.
  Real app PNGs: `01-ordinary-page.png`, `02-new-tab-modal.png`,
  `03-local-retrieval.png`, `04-provider-settings.png`,
  `05-environment.png`. Review copies are in [screenshots](screenshots/README.md).
  The run was stopped by the inspector; its driver
  records `EXPERIMENTAL` and exit 130 because it does not automate GUI PASS.
  The actual GUI observations above were made separately through macOS
  accessibility and app screenshots.
- Experimental engine session: `docs/evidence/engine-probe-0ba0b8665fa2c8da/`.
  `01-chromium-fixture-switch.png` and
  `02-chromium-fixture-with-engine-label.png` record the real app image;
  accessibility showed Chromium 154.0.8037.17 and later Gecko again.
  E0 passed before the Zen fixture session; general E1/E2 acceptance remains
  blocked despite the local fixture switch.
- Compact-answer and expanded-help screenshots cannot be supplied: those
  surfaces are not functional. No mock image is presented as app evidence.
- Seven modal openings in the final Gecko smoke run logged 86.5, 7.0, 18.9,
  16.6, 9.7, 21.4 and 10.4 ms from command handler to the second chrome
  animation frame. This is an instrumented paint proxy, not a camera latency
  measurement. One idle `ps` snapshot of the app and descendants showed
  15 processes, summed RSS 440.4 MiB, 0.0% sampled CPU, and zero provider or
  CEF processes. Summed RSS can double-count shared pages.
- No provider, Jev, login, paid task or external website was invoked. GUI
  navigation used owned loopback fixtures and fresh synthetic profiles. No
  personal browser profile was read.

Upstream SHA pins and license obligations remain in [UPSTREAMS](UPSTREAMS.md)
and the root lockfile. Exact pins here: Zen
`f0f21cdade1fd519a660d756942f7032a8c7a518`, Firefox
`a80bd15ddee3b4bf3679aeba340e9d2db933c467`, CEF
`062ebe433bf6575a71cac2dc71c405617202e3d7`, T3
`b5a0f810108d42ca8635b5a3d75a6e885bb3a254`.
