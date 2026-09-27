# Trusted contracts, version 1

`ipc-v1.schema.json` describes the Rust coordinator wire format. The executable
also validates every message with deny-unknown-fields Rust types and policy checks.
The transport is inherited stdio. The dev supervisor uses a parent-created anonymous
pipe for a 256-bit token on a separate fd. The privileged Gecko Subprocess integration
uses a bounded initial stdin bootstrap frame, because that API exposes only standard
pipes. Both modes keep tokens off argv, environment and disk. Ambiguous bootstrap
modes are rejected.
There is no HTTP/WebSocket IPC listener, content bridge or debugging port.

Only the trusted chrome/native bridge may create/register targets, advance generations, or
issue grants. `BrowserCoordinator.sys.mjs` implements the Gecko-owned subprocess
channel; its actual browser launch is still awaiting the first native Zen build.
Providers must
never receive its token, inherit its descriptors, or call grant-issuance methods.
The initial supervisor ran the coordinator as an isolated component; the new chrome
integration will own its subprocess and synchronize the adapter's actual target IDs.
Automatic provider browser control remains disabled until separate restricted
capabilities and the actual chrome bridge are proven by end-to-end negative tests.

Targets bind the browser-minted logical tab id, actual engine and engine instance,
native target id, identity, document and navigation generation, and private mode.
Each engine must advance generations on redirects, reload, history changes and
document replacement before any action can execute. The implemented coarse
`advance_document` increments both and invalidates all grants. No engine result is
inferred from a coordinator result. `authorized` expressly means `executed:false`.

Grants bind the entire current target, separate observation from navigation and
control, expire at a monotonic coordinator time, and are single-use. Private targets
are denied by default. All request ids are deduplicated, including rejected requests.
No request replay queue exists. A new process has a new session, token and registry.

EngineAdapter implementations expose capabilities; create/navigate/back/forward/
reload/close/devtools; and target-scoped title/url/loading events. Missing actions
return `unsupported`. Engine switching must create a separate candidate instance,
preserve the original until the candidate reports successful navigation, and use
only a user-approved safe local GET for the initial proof. No cookie migration.
See the actual Gecko module and CEF component; neither is represented by a fake engine.

Provider drivers and account instances are separate. Normalized provider events
carry version, request_id, session_id, turn_id and event_id. Accepted is distinct
from completed; interrupt, timeout, crash and uncertain outcomes are distinct.
Cancellation never authorizes replay. Fixture tests are not live-provider evidence.

DecisionProvider receives explicit synthetic state, typed questions, schema/context
version, deadline and AbortSignal. Unknown/no_op are valid outcomes; responses grant
no authority. No key means zero Jev requests. See provider-host's runtime validators.

## Handoff 3 contracts (contexts, projects, site rules)

- `context-v1.schema.json`: context metadata keyed by Zen workspace UUID,
  profile-local projects, the repository manifest `.axiosozo/project.json` and
  the static detection draft.
- `site-rule-v1.schema.json`: site rules, Jev consent/pacing, the usage ledger,
  the M1 effect menu, evaluations and suppressions.
- `decision-v1.md`: Jev choice sets `site_rule_v1` (M1) and `highlight_v1`
  (M2), inputs, limits, disclosure and failure semantics.
- `contexts-api-v1.md`: the module seams between contexts core, chrome
  services, `about:axiosozo`, runtime modules, providers and CEF.

Everything is local-first: no account, server or telemetry. A Jev answer is a
suggestion only; the browser applies only effects the user's rule lists.
