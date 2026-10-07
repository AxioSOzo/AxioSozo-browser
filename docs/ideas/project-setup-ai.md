# Project setup with an assistant, Jev and decisions

Status: investigation, 5 October 2026. Not a change in authorization.

## What runs now

- Static detection (workstation-v1 §1.5) is the reliable base:
  - type;
  - start commands from scripts, the README, make/just targets and `./dev`-style files;
  - the icon;
  - services with commands.

  It runs offline through the pinned reader.
- The assistant check (understand-v1 §3.3, §5.1) is implemented end to end and
  tested with fake clients. Product runs stay **NOT_AUTHORIZED**. Opening
  them for the setup kind is a separate, explicit decision: the production
  facade has no runtime opener, and `cli.mjs` keeps `liveAuthorized: false`.
- Provider choice is automatic: Codex, then Claude Code. Models are the
  cheapest suitable ones:

  | Provider | Model |
  | --- | --- |
  | Codex | `gpt-6-luna`, low reasoning effort |
  | Claude Code | `claude-sonnet-5-5` |
  | Antigravity | `gemini-3.8-flash-low` (planned, no Understand route yet) |

## Jev and the OpenAI Decisions API

Neither fits setup today:

- **Observation:** a decision needs a web-page observation (`address`,
  `outline` or `screen` with an http(s) origin). A project folder is not one,
  and faking an address would break the admission and watch gates.
- **Choices:** at most 6 outcomes (plus `unknown`), with ids
  `^[a-z][a-z0-9_]{0,31}$` and labels of at most 80 characters. Commands and
  paths do not fit.
- **Images:** Jev takes no images. OpenAI Decisions is `UNVERIFIED_SHAPE`.
- **Authorization:** decisions are NOT_AUTHORIZED as well.

Static, project-specific tasks that *could* become a closed decision kind
(`project_setup_v1`, no observation, folder names only, never contents):

1. **Type tie-break** when detection only guessed: choose among the five project
   kinds from file and folder names, script names and frameworks.
2. **Start command choice** when several candidates exist (README commands,
   make targets, scripts): choose one of at most 6 candidate ids.
3. **Icon choice** among at most 6 candidate paths by name. Choosing by the
   pixels would need images, which Jev lacks.

Each would need:

- a new validator with fixed instructions;
- host and chrome routing;
- the shared budget, consent and key gates;
- `suggestion_only` results that only pre-fill the review.

Static detection already settles most cases, so the value is small. The
Understand setup check covers the rest better.
