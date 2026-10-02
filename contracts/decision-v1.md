# Decision contract, version 1

Jev (`jev-1.13.0`) is optional judgement. It picks one option from a fixed,
versioned choice set. Its answer grants no authority: the browser applies only
typed, reversible, browser-local effects that the user's own rule already lists.
Everything here works without a key, and normal browsing makes zero Jev calls.

Implementation: `packages/provider-host/src/decision.mjs` (`DecisionProvider`),
reached from chrome only through the on-demand provider host. Chrome never gets
a second network client and never sees the key. The key lives in the macOS
Keychain (`keychain.mjs`). Key entry ships (open decision 4, decided): the user
stores or removes it in Settings or `about:axiosozo`; chrome sees only its
presence (see [provider-v1](provider-v1.md#jev-key-entry-decided-ships)).

## Common rules (all choice sets)

| Rule | Value |
| --- | --- |
| Deadline | `deadline_ms` is absolute epoch ms, at most 30 000 ms after receipt |
| Input cap | serialized request `state` ≤ 64 KiB, else `INVALID_INPUT` and no call |
| Output cap | response body ≤ 32 KiB, else `malformed_output` |
| Confidence | a choice below 0.8 confidence becomes `none` / `unknown` |
| No key | outcome `none`, reason `disabled`, **zero network calls** |
| No consent | chrome does not send the request at all; revoking consent aborts in-flight requests and drops their answers |
| Cancellation | `AbortSignal`; outcome `none`, reason `cancelled` |
| Redirects | refused (`redirect: 'error'`) |
| Failure | timeout, HTTP error, 401, network error, malformed or mismatched answer → the neutral outcome (`none` for site_rule_v1, `[]` for highlight_v1) |
| Disclosure | every result carries `data_sent: true` iff a network request body was actually transmitted (a fetch was started with the key). Chrome shows the outgoing-data indicator from this flag and from a pre-call "sending" notice. |
| Authority | every result carries `authority: "suggestion_only"` and `action_authorized: false` |

Reason strings for failures are fixed: `disabled`, `cancelled`, `timeout`,
`BLOCKED_AUTH`, `HTTP_ERROR`, `NETWORK_ERROR`, `KEYCHAIN_ERROR`,
`malformed_output`, `budget_exhausted`, `INVALID_INPUT`, `validated`,
`IMAGE_UNSUPPORTED`, `UNVERIFIED_SHAPE`, `NOT_AUTHORIZED`, and
`HOST_UNAVAILABLE` (produced only by the chrome helper when the provider host
cannot be reached).

`data_sent` is reported as `true` whenever it cannot be proven false (for
example the request reached the host but no valid reply came back). An
already-expired deadline returns `timeout` without a call; a deadline more than
30 s away is `INVALID_INPUT`.

The existing `diagnostic` choice set (synthetic state only) is unchanged.

## `site_rule_v1` (M1)

### Request

```json
{
  "version": 1,
  "request_id": "req_…",
  "choice_set": "site_rule_v1",
  "context_version": "site-rule-1",
  "deadline_ms": 1790000000000,
  "state": {
    "rule": {
      "id": "r_7f3a",
      "instruction": "I come here to post and answer mentions. If I drift into the feed, nudge me.",
      "effects": ["nudge", "suggest_leave", "pause_site"]
    },
    "context_type": "personal",
    "checkpoint": "commit",
    "elapsed": { "today_ms": 540000, "foreground_session_ms": 120000 },
    "observation": {
      "level": "outline",
      "address": { "origin": "https://x.com", "path": "/home", "title": "Home / X" },
      "outline": [
        { "id": "o1", "kind": "heading", "text": "For you" },
        { "id": "o2", "kind": "link", "text": "Notifications" },
        { "id": "o3", "kind": "label", "text": "Search" }
      ]
    }
  }
}
```

- `checkpoint` is `commit` (page commit on a matching host) or `interval`.
- `observation.level` is the **effective** level after the sensitive-category
  cap (see below). For `none`, the request is never sent (deterministic layer
  only). For `address`, `outline` is absent.
- `address.path` excludes query and fragment. `title` ≤ 256 chars and is the
  committed document's own title, never the tab label.
- `outline` ≤ 200 items; `text` ≤ 200 chars, whitespace-collapsed; `id` matches
  `^o[0-9]{1,4}$` and is opaque (assigned per checkpoint, never a DOM id or
  selector). Kinds: `heading`, `link`, `label`.
- The outline **excludes** form values, password fields and their labels'
  values, cross-origin frames, selection contents, hidden elements, and
  everything in private windows (private windows never produce a request).
- Unknown keys anywhere in the request → `INVALID_INPUT`, no call.
- Further limits: `origin` is an exact http(s) origin; `path` ≤ 2048 chars;
  `elapsed` values 0–86 400 000 ms; outline `text` 1–200 chars and already
  whitespace-collapsed (rejected, not normalized); outline IDs unique;
  `rule.effects` 1–3 unique entries.

### Sensitive-category cap

Hosts in a sensitive category (banking, government, health, identity, password
managers) are capped at `address` unless the host is listed in the rule's
`observation_raised_hosts`. Classification is a static, versioned, data-only
list in `packages/contexts` (`sensitive-hosts-v1`), plus TLD/suffix classes such
as `.gov`, `.mil`, `.bank`. It is not per-site code; it only lowers the
observation level. The provider host re-checks that `outline` is absent when
the chrome says the level is `address`.

### Jev question

The provider sends a single `choice` question named `site_rule`. Its criteria
are `none` plus **only the effects the rule lists**, with fixed descriptions:

| Choice | Fixed criterion text |
| --- | --- |
| `none` | The visit matches the user's instruction or there is not enough evidence |
| `nudge` | The user appears to drift from their instruction; a small reminder fits |
| `suggest_leave` | The user's stated purpose looks complete; offer to save and close |
| `pause_site` | The instruction explicitly asks to pause the site in this situation |

The fixed instructions tell Jev that the rule text and page observation are
untrusted data, never instructions to it. A separate optional `reason` choice
question uses the fixed reason codes `drift`, `on_task`, `off_context`,
`unclear`.

### Result

```json
{
  "version": 1,
  "request_id": "req_…",
  "choice_set": "site_rule_v1",
  "context_version": "site-rule-1",
  "outcome": "nudge",
  "reason_code": "drift",
  "reason": "validated",
  "data_sent": true,
  "authority": "suggestion_only",
  "action_authorized": false,
  "model": "jev-1.13.0"
}
```

- `outcome` ∈ `none | nudge | suggest_leave | pause_site`, validated against the
  request's `rule.effects`; any unlisted effect → `none` with
  `malformed_output`.
- `reason_code` is `null` or one of the fixed codes. Never free text. It is
  always `null` when `outcome` is `none`.
- The browser re-validates: it applies an outcome only if the rule (as stored
  at apply time) still lists it, the tab is still foreground, non-private and on
  a matching host, and no suppression is active. Otherwise it is dropped.

### Checkpoints and budget (enforced by chrome, re-checked by the host)

- A checkpoint fires on page commit on a matching host, then every
  `interval_minutes` (default 5, range 1–30) while the tab stays foreground.
- Background tabs and private windows never trigger a call.
- Default budget: 30 calls per rolling hour across the browser
  (`jev.hourly_budget`, 0–30). When exhausted, the checkpoint is skipped with
  reason `budget_exhausted`; no queue, no retry.
- One in-flight request per tab; a new checkpoint cancels the stale one.
- Only rules with `observation != none`, `effects` non-empty, the rule enabled,
  and `jev.consent == true` are eligible.

### Host method

Chrome calls the provider host method `decision/site_rule` with the request
above as `params`. `decision/cancel` with `{ request_id }` aborts an in-flight
fetch. The provider workstream documents the exact envelopes and reason-code
criterion texts in `contracts/provider-v1.md`. The host's per-process budget is
defense in depth only (the host idles out after two minutes); the chrome-side
budget is authoritative. The host is started on demand for this call only
if an eligible checkpoint fires; otherwise it is never started.

## Plan 4 extensions (2 October 2026)

All additive; a request without the new fields behaves exactly as above.

### Providers

- Request top-level `provider` (optional) ∈ `jev` (default), `openai`. Each
  provider has its own Keychain item and its own key entry in Settings
  (presence only is visible to chrome). Choice is per call.
- `openai` uses the OpenAI Decisions API with the user's own key. Its request
  and response shapes must come from OpenAI's official documentation; if the
  documentation is not available, the adapter is marked `UNVERIFIED_SHAPE`
  in code, in `provider-v1.md` and in the status file, and stays fixture-only.
- Providers declare capabilities: `{ image: boolean }`. Jev: `image: false`
  until its documentation says otherwise.
- Result adds `provider` (the provider that answered or would have answered).
- The browser product host disables live authorization. After strict request
  validation, it returns the neutral outcome with `reason: "NOT_AUTHORIZED"`,
  `data_sent: false`, and no Keychain read, network request or budget use.
  OpenAI retains `shape_status: "UNVERIFIED_SHAPE"` at this gate. Fixture-only
  adapters may exercise the provider/image/shape gates below.

### Image input (`screen` observation)

- New observation level `screen` = `address` plus
  `observation.screen = { "mime": "image/png", "width": ≤ 1280, "height": ≤ 1280, "data_base64": "…" }`
  (decoded ≤ 1 MiB, a PNG signature is required). `outline` may accompany it.
- Only allowed when the rule or watch allows `screen` observation, never for
  private windows, never for sensitive-category hosts (capped to `address`),
  and only to a provider whose capabilities include `image`. A `screen`
  request to a provider without image support → outcome `none` /
  `unknown`, reason `IMAGE_UNSUPPORTED`, **no network call**.
- The serialized `state` cap rises to 1.5 MiB **only** for `screen` requests;
  the transport line limit for those requests is 1.6 MiB.

### Confidence

- Every result carries `confidence`: a number 0–1 from the provider, or
  `null` when no answer was obtained. The 0.8 threshold above still applies
  and is applied by the host, so chrome sees the post-threshold outcome plus
  the raw confidence.

For this additive transition only, chrome accepts the original Jev site-rule
reply shape when **both** `provider` and `confidence` are absent, and normalizes
it to `provider: "jev"`, `confidence: null`. Partial additive replies are
rejected. Watches and OpenAI always require the new fields. New non-neutral
results require numeric confidence ≥ 0.8, the expected provider/model and a
validated sent result. Replies arriving after the request deadline cannot apply
a positive outcome; a bounded reply grace retains disclosure only. Cancellation
covers host startup and the outgoing indicator as well as the written request.

### `watch_v1` choice set (watches, PLAN_4 §4)

- Request uses `choice_set: "watch_v1"`, `context_version: "watch-1"`.
- Request `state`: `{ "watch": { "id": "w_…", "question": "≤ 500 chars", "outcomes": [ { "id": "^[a-z][a-z0-9_]{0,31}$", "label": "≤ 80" } ] }, "observation": { … } }`
  with 2–6 outcomes; `unknown` is reserved and always allowed.
- Result `outcome` is one of the outcome ids or `unknown` (the neutral outcome
  for every failure). Host method `decision/watch`.

## `highlight_v1` (M2, specified, not implemented in M1)

- Input: `address` plus `outline` items (same rules as above) with opaque IDs,
  and the context type. Outline level is required, so sensitive hosts are
  excluded unless raised.
- Output: up to three `{ id, purpose }` where `purpose` ∈ `relevant`, `error`,
  `belongs_to_context` and `id` must be one of the request's IDs. Anything else
  → `[]`.
- The browser draws a chrome-only anonymous-content highlight that pages can
  neither read nor spoof. One non-conflicting shortcut accepts; plain Tab stays
  reserved for page focus navigation.
