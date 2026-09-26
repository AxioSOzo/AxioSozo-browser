# Provider and engine implementation — 26 September 2026

Status: **PARTIAL_ENGINE_BLOCKED; not READY**. This continuation prioritizes a
small Zen-based browser with direct official-client AI conversations and explicit
Firefox/Chromium switching. It does not embed the T3 application or start an AI
service with every browser window.

## Implemented

- **AI conversations:** Ask AI opens a compact privileged panel with provider
  selection, streaming answers, Stop, and new-conversation controls. Page title
  and address sharing is explicitly opt-in; page contents are not captured.
  The on-demand provider host uses private stdio, bounded sessions and output,
  and official-client-owned authentication. Codex 0.157.1 and Claude Code 2.1.283
  have reviewed live launch paths. Antigravity remains unavailable until its
  startup/tool isolation can be established; its fixture is not a live route.
  This first route supports conversations. Repository editing and agent tool
  execution are not yet wired into the browser.
- **Engine switching:** the ordinary development launcher exposes a per-tab
  Firefox/Chromium action. Chromium starts lazily, owns a separate temporary
  in-memory browsing context, and preserves the retained Firefox page. A switch
  cannot replay POST, query/fragment-bearing, or unverified navigation state;
  those cases start Chromium blank. Address entry, focus and page references
  route to the visible engine. Clipboard editing and native select-popup pixels
  are bridged. Failed transitions retain Firefox.
- **Quiet defaults:** Zen Boosts, Glance, background-tab toasts, workspace swipe
  actions and several animations are disabled. Zen's update-complete/donation
  popup and decorative window sweep are also suppressed in minimal mode.
  System colors are used, extension
  controls remain accessible, and theme/mod marketplace categories are removed
  from the main settings navigation. Browser privacy/security settings remain
  available. This is a maintained defaults/overlay layer, not removal of Gecko
  security or accessibility infrastructure.
- **Startup and background work:** provider discovery is explicit, the optional
  Rust coordinator is lazy, and no provider or Chromium process starts on an
  ordinary idle window. Background/minimized Chromium surfaces are hidden
  natively; retained Firefox rendering is inactive while Chromium is visible.
  Native transport queues remain bounded and web-mode request deduplication uses
  constant memory. At most four Chromium hosts are admitted per browser window.

## Authentication and remaining runtime gates

Codex uses a separate app-owned `CODEX_HOME` for each provider configuration.
The settings panel exposes its safely quoted official `codex login` command.
The official client writes and owns its credentials; the browser/host does not
read tokens. Existing personal Codex configuration and hooks are not imported.

Claude uses an isolated customization directory and the official client's
authentication route. Its launch boundary admits only the reviewed executable
and its required native credential helper, blocks shell/file tooling, and rejects
managed/API account policy until separately supported. Actual account compatibility
and model responses require explicit live validation.

The user-authorized fixed-prompt diagnostics on 26 September stopped before any
model request. Codex reported `CODEX_LOGIN_REQUIRED` for its dedicated diagnostic
profile. That profile is separate from configurations created in the browser;
use the login command shown for the intended browser configuration. Claude's
official auth status reported no available login under confinement. This does
not establish that the user's normal Claude client is signed out: a denied
credential lookup can produce the same result. Additional Keychain file access
was rejected by automatic approval review and was reverted without retrying.
No live model response has been verified.

The pinned CEF runtime stalls on HTTP while macOS requests the shared **Chromium
Safe Storage** key, even with fresh in-memory contexts. Blank rendering succeeds;
HTTP/TLS/interaction acceptance has not passed in this continuation. No shared
Keychain approval, plaintext password-store fallback, mock Keychain, certificate
bypass, or credential migration is inferred or performed. The newest inspected
official stable CEF build also lacks the upstream experimental per-application
Keychain-name fields. Runtime validation remains blocked pending an explicitly
authorized system prompt or a suitable isolated upstream runtime.

Chromium permissions, downloads, new windows, file selectors and JavaScript
dialogs currently fail closed. IME, native accessibility, extensions and developer
tools are not integrated. These are material limitations: HTTP(S) mode does not
constitute full E1/E2 or daily-browser readiness. Save and close remains unavailable
while a Chromium tab is active because native beforeunload confirmation is missing.

## Verification and entrypoints

The provider backend passed 61 module tests on the pinned Node 22.22.3 runtime
and ten real native sandbox/lifecycle boundary tests without starting a provider
or accessing Keychain. Seven root entrypoint tests also passed.
The current browser check passed 62 JavaScript integration tests and 13 source/
launch tests. Focused provider-panel tests also cover explicitly labelled offline
fixtures, setup errors, turn/session binding, cancellation and late responses.
Native CEF compilation, signature verification, transport tests and six lifecycle/
boundary tests passed. These results do not substitute for a live model response
or the unfinished native web-mode test.

The final custom Zen build passed with source fingerprint
`7cd6230c703494f392878dbc657667ecfad41bc667d8d899e6ba4b1edc980ad8`, including
the quiet update UI overlay. An earlier owned GUI session visibly showed the
experimental engine switch, Ask AI panel, and unchecked page-sharing control.
The final GUI run could not reliably bind the UI automation to the owned profile;
the app selector opened a second process instead. No interactive streaming pass
or final quiet-startup GUI pass is claimed. An owned idle process-tree observation
found only Gecko processes, with no provider, coordinator, or CEF child. Startup
latency, memory savings, and general-site rendering performance are not benchmarked.

- `./dev setup` builds the current source on the project T9-backed volume.
- `./dev --profile <name>` starts a separate owned development profile.
- `./dev check` includes all browser JavaScript suites except the separately
  verified real Rust coordinator process tests.
- `./dev web-probe` runs actual E0 and opens an owned HTTP/TLS fixture using the
  new web-mode engine switch. `./dev engine-probe` retains strict fixture mode.
- `./dev provider-test codex --authorized` and the equivalent `claude-code`
  command send only the fixed `AXIOSOZO_OK` diagnostic after explicit authorization.
  They print safe result flags, never raw authentication data or client stderr.

Transport contracts: [provider JSONL](../contracts/provider-v1.md) and
[native Chromium](../contracts/cef-v1.md). Client audit and launch details remain
in [PROVIDERS](PROVIDERS.md).
