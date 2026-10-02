# Contexts core (`@axiosozo/contexts`)

Pure, DOM-free logic for contexts, projects, site rules and the usage ledger
(handoff 3 §4, §6.1–6.3). The same `src/*.mjs` bytes run under Node tests and in
privileged chrome as `chrome://browser/content/axiosozo/contexts/*.mjs`. The
module seams are fixed by [contexts-api-v1](../../contracts/contexts-api-v1.md) §2
and [workstation-v1](../../contracts/workstation-v1.md) §1–§5; data shapes by
[context-v1](../../contracts/context-v1.schema.json),
[context-v2](../../contracts/context-v2.schema.json),
[site-rule-v1](../../contracts/site-rule-v1.schema.json) and
[decision-v1](../../contracts/decision-v1.md).

## Rules for `src/`

- ES modules with relative imports only; no `node:` imports, file system,
  `process`, `Buffer`, `fetch`, timers, DOM, `Services`, `Date.now()`, argument-less
  `new Date()` or `Math.random()`. `tests/purity.test.mjs` scans for these.
- No file access and nothing is executed. Callers pass file contents and time in.
- Errors are `ContextsError(code, message, path)` with upper-snake codes.
- Validators return frozen, normalized copies and reject unknown keys.
- No dependencies. Nothing here makes a network request.

## Modules

| Module | Purpose |
| --- | --- |
| `errors.mjs` | `ContextsError` |
| `schema.mjs` | hand-written validators for both schemas, `newRule`, defaults, enums |
| `detect.mjs` | static detection from supplied file contents; minimal TOML, YAML-subset and git-config readers; `detectionRefusal` reader policy |
| `manifest.mjs` | `.axiosozo/project.json` draft → manifest, parse, stable serialize, secret check |
| `environments.mjs` | environment ordering, URL matching and the F4 switch |
| `rules.mjs` | host matching, deterministic evaluation, Jev outcome filter, sensitive-host cap, suppressions |
| `ledger.mjs` | foreground-time ledger: record, query, prune, summarize, export |
| `checkpoints.mjs` | Jev checkpoint pacing, rolling-hour budget, `site_rule_v1` request builder |
| `containers.mjs` | per-project container style, shared sites, URL → container routing, integration hosts, account keys and labels |
| `arrival.mjs` | loopback ports, fixed `lsof` argument arrays and output parsers, root candidates, arrival offers, GitHub/Vercel surface matching |
| `agent-status.mjs` | Claude Code / Codex / manual hook payloads → status records, the status board, copyable hook snippets |
| `index.mjs` | public re-exports |

## Detection (§6.1)

`detectProject({ rootName, files, refused })` reads only `files`, an object of
relative path to text that the chrome reader actually read, plus the reader's
own refusals. Keys not in `DETECTION_FILES` are recorded as `not_allowlisted`
and their values are never accessed. Contents above 256 KiB are refused as
`too_large`. Every parser tolerates hostile input: problems become warnings
and never throw.

The chrome reader should call `detectionRefusal({ path, resolvedPath, isFile,
size })` for each allowlisted path after `lstat`/`realpath`. `resolvedPath` is
the real path relative to the real root, or `null` when it resolves outside the
root. A symlink is followed only when it points to **another allowlisted path
inside the root**, so `package.json -> .env` is refused too. `tests/fixture-reader.mjs`
is the reference implementation, written with Node `fs` and used only in tests.

What is detected:

- `package.json` scripts: framework and explicit `--port`, `--port=`, `-p` or
  `PORT=` (only inside the dev command's own segment); `npm/pnpm/yarn/bun run`
  indirection, with cycle protection. Framework default ports are used as a
  `guess: true` fallback: Vite and SvelteKit 5173, Next 3000, Astro 4321, Nuxt
  3000, Remix 3000 (5173 with `vite:dev`), CRA 3000, Parcel 1234, Angular 4200,
  webpack-dev-server 8080, Gatsby 8000, Wrangler 8787 and others.
  Storybook becomes a service. `bin` gives a CLI; `main`/`exports` gives a library;
  a public package also gets an npm surface.
- Vercel (`.vercel/project.json`, `vercel.json`): a hosting surface pointing to
  the Vercel dashboard. This never yields a production URL.
- Netlify: a hosting surface and the `[dev] port`. Wrangler: declared
  `route`/`routes` (also per `[env.*]`) and the Pages default domain as a guess.
  Fly: the app dashboard and `<app>.fly.dev` as a guess.
- Compose: only published loopback/any-address TCP ports; ranges, UDP,
  non-loopback binds and unresolved `${VAR}` are skipped with a warning.
- Tauri v2 `build.devUrl` or v1 `build.devPath` (URL only), `productName`, and
  plain updater endpoints. Electron through `electron-builder.*`, `package.json`
  `build`, an `electron` dependency or script, and GitHub `publish` gives a
  releases surface.
- `Cargo.toml` (`[[bin]]` gives CLI, `[lib]` gives library; otherwise library
  as a guess), `pyproject.toml` (scripts give CLI, `[project.urls]` give
  surfaces), `go.mod` (library as a guess; `package main` cannot be seen without
  reading `.go` sources, which are not allowlisted).
- `.git/config`: only `[remote "…"] url` (origin preferred). Userinfo is
  dropped before anything is stored, and scp-style `git@host:owner/repo.git`
  becomes `https://host/owner/repo`. GitHub, GitLab (subgroups included),
  Codeberg/Gitea/Forgejo and Bitbucket get repository, issues, CI and releases
  surfaces. Unknown hosts get a guessed repository surface.
- An existing valid `.axiosozo/project.json` wins outright, and
  `draftManifestState(draft)` returns `"external"` for it. An invalid one is
  ignored with a warning.

### Monorepos, apps and projects in any space

Workspace packages are detected in a second, equally static phase
(contexts-api-v1 §2.2): `workspaceCandidates(rootFiles)` gives patterns and the
parent directories whose child directory *names* the reader may list,
`expandWorkspaceGlobs(patterns, listing)` gives at most 24 package dirs, and
the reader passes the `PACKAGE_DETECTION_FILES` it read per dir as
`detectProject({ …, packages })`. `**`, `..`, absolute paths, hidden dirs,
`node_modules` and build output are refused. With more than one app,
environments and services carry `app` (`web · local`, `desktop · local`); a
Tauri dev URL is always the desktop app, never the generic web dev server.
Surfaces carry `prominence` (repository/package/store primary, the rest
secondary). Manifest v2 and context store v2, `migrateContextStore`,
`withProductionUrl` and `matchProjectForUrl` are described in §2.3–§2.5.
Fixtures: `tauri-plus-web`, `pnpm-monorepo`, `npm-workspaces`
(`tests/workspace.test.mjs`, `tests/projects.test.mjs`).

### Detection v2: inventory, documented domains (workstation-v1 §1)

Two more phases follow the workspace phase, again with a dumb reader:
`inventoryPlan({ packageDirs })` names the directories whose child directory
*names* may be listed (`docs`, `.agent-worktrees`, `ios`, `macos`, each package
dir and its `ios`/`macos`) and the exact paths that may only be `lstat`'ed
(`AGENTS.md`, `.claude`, `convex`, Gradle files, …); `inventoryRefusal` is the
reader policy (in the plan, inside the root, file or dir). `documentFiles(inventory)`
then allows `docs/domains.md` and `docs/<child>/domains.md` (≤ 8 children) under
`documentRefusal`. `convex.json` joins the root allowlist (only `functions` is used).
`detectProject({ …, inventory, docs })` returns a **version 2** draft that adds:

- `integrations` from the fixed `INTEGRATIONS` table: dependency names (exact or
  `@scope/`), `vercel.json`/`.vercel`, `convex.json`/`convex/`, `wrangler.*`,
  `netlify.toml`, `fly.toml`; generic dashboard URLs, never keys or env names;
- `platforms`: Tauri and Electron from the existing detection, macOS/iOS from
  `.xcodeproj`/`.xcworkspace` names in listed dirs, Android from Gradle presence;
- `domains`: `vercel.json` redirects/rewrites, Wrangler routes, Netlify redirects,
  then hosts in backticks or URLs in `domains.md` (unconfirmed). IPs, `localhost`,
  single labels, wildcards and vendor hosts (`VENDOR_HOST_SUFFIXES`) are excluded;
- `agents`: which of `AGENTS.md`, `CLAUDE.md`, `.claude`, `.codex`,
  `.agent-worktrees` exist, and how many worktrees (names are never stored).

Integrations, Tauri/Electron and config domains come from the files alone, so a
caller without the new phases still gets them; inventory and docs add the rest.
Fixtures: `harbor-suite` and `inkline` (invented monorepos with Convex, Clerk,
Stripe, Vercel, Tauri and native apps; `tests/workstation-detect.test.mjs`).

### Project record v2 and context store v3 (workstation-v1 §2)

Project records of version 2 add `detected`, `container.user_context_id`,
`shared_sites` (`DEFAULT_SHARED_SITES`, unconfirmed by default), `accounts`
(`{ key, label }`, the label typed by the user) and the stored `brief`
(understand-v1 §4). Store version 3 holds only version 2 records;
`migrateContextStore` turns v1, v2 (and v3 documents that still carry v1
records) into v3 with `upgradeProject`. Versions 1 and 2 keep validating.

## Deterministic evaluation (§6.2 layer 1)

`evaluateDeterministic({ rule, usageTodayMs, local: { minutes, weekday }, contextUuid, suppressions, now, host?, contextType? })`:

1. If the rule is disabled, the result is `none`. If `host` is given and the
   rule does not match `host` and the context, the result is `none`. Callers
   normally pre-filter with `rulesFor`.
2. If `limits.daily_minutes` is set and `usageTodayMs >= daily_minutes * 60000`,
   the reason is `daily_limit_reached`.
3. Otherwise, if `limits.allowed_hours` is set and the local time is outside
   every window, the reason is `outside_allowed_hours`. A window covers
   `[start, end)` on its listed `days` (0 = Sunday; omitted means every day). When
   `end <= start` it wraps past midnight: the part after midnight belongs to
   the listed day before (Friday 22:00–02:00 covers Saturday 01:30).
   `start == end` covers 24 hours.
4. With no reason, the result is `none`. With a reason, the effect is
   `pause_site` if the rule lists it, else `nudge` if listed, else `none`.
   `suggest_leave` is never chosen deterministically.
5. An active suppression (`until > now`) for the same rule, context
   (`null` matches `null`) and effect turns the result into `none`.
   `suppress()` lasts 5 minutes for `nudge` and 15 minutes for `pause_site` and
   `suggest_leave`.

An effect of `none` always has `reason_code: null`. `applyJevOutcome(rule,
outcome, reasonCode)` keeps a Jev outcome only if the rule is enabled and
lists it. It keeps only the Jev reason codes (`drift`, `on_task`,
`off_context`, `unclear`).

## Observation cap (§6.3)

`effectiveObservation(rule, host)` returns `none` for hosts the rule does not
cover. It caps `outline` at `address` for hosts in a sensitive category unless
a matching `observation_raised_hosts` pattern exists. `isSensitiveHost` uses the
static, versioned data list `SENSITIVE_HOSTS` (`sensitive-hosts-v1`). The list
holds suffixes such as `.gov`, `.mil`, `.bank`, `gov.<cc>`, `gouv.fr`,
`overheid.nl`, `belastingdienst.nl`, `kvk.nl` and `digid.nl`, plus a short list
of banks, identity providers and password managers. It can only lower the
level.

## Ledger and checkpoints

- The ledger holds one record per (day, host, context), clamped to 24 h.
  `usageFor` understands host patterns. `prune` keeps `retention_days` days
  including today. `summarize` groups by host and context. `exportLedger`
  produces stable JSON.
- `takeBudget` uses a rolling hour. `nextCheckpoint` returns false for
  background tabs, private windows and unknown privacy.
- `buildSiteRuleRequest({ rule, contextType, checkpoint, elapsed, observation: { url, title, outline: [{ kind, text }] }, requestId, now, timeoutMs? })`
  returns `null` in any of these cases: the rule is disabled, it has no
  effects, the page is not http(s), the host is not covered, or the effective
  level is `none`. Otherwise the request meets the provider host's strict
  validator:
  - exact origin
  - path without query or fragment
  - title at most 256 UTF-16 units
  - outline items only of kind heading, link or label
  - outline text whitespace-collapsed, 1–200 UTF-16 units, empty items dropped
  - at most 200 items with fresh opaque ids `o1…`
  - integer elapsed times clamped to 24 h
  - deadline at most 30 s ahead
  - `state` at most 64 KiB, trimming outline items from the end if needed

## Tests

```sh
node --test packages/contexts/tests/*.test.mjs   # from the repo root
cd packages/contexts && npm test                 # same thing
```

The fixture repos are in `tests/fixtures/`, and their reviewed drafts are in
`tests/expected/`. Git cannot track a `.git` directory and the root `.gitignore`
excludes `.env*`, so fixtures keep `_git/config`. `materializeFixture` copies
each fixture into `tests/.tmp/` (gitignored and removed after each test),
renames `_git` to `.git`, and plants `.env`, `.env.local` and a key-file trap.
The tests then prove these are never opened. The inventory and docs readers also
record every path they hand to the file system, and the tests check that each is
in the plan; Xcode, Gradle, `AGENTS.md`, `.claude` and worktree files in the
fixtures contain `TRAP` markers that must never reach a draft.
