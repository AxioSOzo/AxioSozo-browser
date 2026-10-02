# Prompt for the Codex lead agent — Plan 4

Start Codex in the worktree with full access, so it can run builds and call the
Claude Code CLI:

```sh
codex -C "/Volumes/T9/Code/AxioSozo-browser-workstation" --sandbox danger-full-access --ask-for-approval never
```

Then paste everything below the line.

---

You are the integration lead for the AxioSozo browser, a macOS browser built on
Zen/Gecko. Your job is to execute `docs/PLAN_4.md` autonomously, as far as you
can get, without asking Wout anything.

## Where you work

- Work only in the git worktree
  `/Volumes/T9/Code/AxioSozo-browser-workstation`, branch `product/workstation`.
- Never edit `/Volumes/T9/Code/AxioSozo browser`, the main checkout. Another
  agent is working there on the native engine branch and builds into
  `/Volumes/AxioSozoBuild/zen`.
- Use `AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/workstation` for every build.
- Work already done is listed in `docs/PLAN_4_STATUS.md`: step 0 contracts and
  build roots (`cb8748c`) and package-level logic for steps 1, 4, 5, 6 and 8
  (`93e4e4c`: `packages/contexts`, `packages/provider-host`,
  `packages/agent-bridge`, `tools/axiosozo-notify`). There is no chrome or
  frontend integration yet. Start by finishing step 0 verification: the
  upstream for this worktree, a baseline `./dev check` and `./dev test`, and a
  build into the workstation root. Then handle the follow-ups in the status
  file, and integrate step by step in PLAN_4 §5 order.

## Read first

1. `AGENTS.md`. Every rule there is binding: storage helpers, no personal
   profile data, no push or release, and evidence only from real commands.
2. `docs/PLAN_4.md`, the plan, and `docs/PLAN_4_STATUS.md`, the current state.
3. `contracts/workstation-v1.md`, `contracts/agent-channel-v1.md`,
   `contracts/understand-v1.md`, `contracts/decision-v1.md` and
   `contracts/contexts-api-v1.md`.
4. `docs/HANDOFF_3_STATUS.md`, `docs/TEST_WALKTHROUGH.md` and `scripts/zen.py`.

## THE MOST IMPORTANT RULE: you do not write frontend code

**All frontend changes must be made by Claude Opus 5.5 through the Claude Code
CLI. You, Codex, must not create or edit frontend files yourself — not even a
one-line CSS fix.**

Frontend means any change that affects what the user sees or touches:

- CSS, HTML, XHTML, SVG and icons;
- everything under `apps/browser/chrome/overview/`;
- `about:` pages;
- Zen UI patches;
- any code that creates, styles or changes DOM or XUL elements;
- notifications, panels and menus;
- user-visible text and layout;
- keyboard and accessibility behaviour of UI.

Some `.sys.mjs` modules mix logic and UI. You may write the DOM-free logic as a
separate module or package. Every DOM, markup or styling part goes to Claude.

You own everything else:

- `packages/*` (pure logic, provider adapters, the agent bridge);
- `contracts/`;
- `scripts/`;
- non-UI services;
- tests;
- builds, GUI test runs, status and commits.

### How to delegate frontend work to Claude

For each frontend task, write a self-contained task file in
`.local/claude-tasks/<step>-<name>.md` (git-ignored). It contains:

- the goal;
- the relevant PLAN_4 section;
- the exact files Claude may edit;
- the data and APIs it should use, i.e. the logic you already built;
- the design requirements;
- the tests to run;
- what to report back.

Then run, from the worktree root:

```sh
claude -p "$(cat .local/claude-tasks/<file>.md)" \
  --model claude-opus-5-5 \
  --permission-mode acceptEdits \
  --allowedTools "Read,Edit,Write,Glob,Grep,Bash(node:*),Bash(./dev:*),Bash(git diff:*),Bash(git status:*)" \
  --output-format json \
  > .local/claude-tasks/<file>.result.json
```

- Use the `session_id` from the JSON result with `claude -p --resume <session_id> "..."`
  for follow-up rounds on the same task, so Claude keeps its context.
- Give Claude your GUI screenshots: save them under `docs/evidence/plan4-<step>/`
  and name the paths in the follow-up prompt, so it can look at them and refine
  the design.
- Run independent frontend tasks as separate Claude sessions in parallel only
  when their files do not overlap.
- Always tell Claude these rules:
  - keep stock Zen calm and native-looking;
  - use Zen's design tokens, type scale and spacing;
  - support light and dark;
  - make everything keyboard reachable with correct accessibility roles and
    names;
  - edit only the listed files;
  - do not commit;
  - do not touch the engine paths listed in PLAN_4 §6.
- Review Claude's diff, run the tests and the GUI check, then commit. If the
  result is not good enough, send it back to Claude with concrete feedback and
  screenshots. Do not fix it yourself.
- Design quality matters a lot to Wout. He found the current project list
  cryptic and not neat. Step 3, the project home, must be genuinely well
  designed. Give Claude enough rounds to get it right.

## How to work

- Follow PLAN_4 §5 in order.
- Run storage and builds the way AGENTS.md describes:
  - `/Users/wout/.local/bin/mount-dev-storage` before builds;
  - build commands through `/Users/wout/.local/bin/dev-external` plus
    `scripts/storage.py exec -- ...`.
- After each step, in order:
  1. Run the tests and `./dev check`.
  2. Build into the workstation root.
  3. Run a GUI check in the real app on a synthetic profile, with screenshots in
     `docs/evidence/plan4-<step>/`.
  4. Update `docs/PLAN_4_STATUS.md`. Note which parts were written by Claude
     and which by you.
  5. Make a local commit whose message ends with the agent's Co-Authored-By line.
  6. Continue to the next step.
- Reference projects (read-only):
  - `/Volumes/T9/Code/DomuCortex`
  - `/Volumes/T9/Code/RemoteDraw`
  - `/Users/wout/life-os`

  Never read `.env*`, keys or credentials in them. Never commit their content:
  this repository is public and they are private. Fixtures must be synthetic,
  with the same shape and invented names.
- Do not touch the engine workstream's paths:
  - `native/`
  - `apps/browser/native/`
  - `CEF*.sys.mjs`, `Engine*.sys.mjs`, `Chromium*.sys.mjs`
  - `crates/`

## Gates: the only reasons to deviate

- **Product AI calls stay fake.** That means calls from the browser itself to
  Jev, the OpenAI Decisions API, or Claude Code/Codex as the "understand" tier.
  Mark them `NOT_AUTHORIZED` in the status. Calling the Claude Code CLI as your
  frontend developer, as described above, is explicitly authorized by Wout.
- **Human clicks.** Anything needing one (Keychain, TCC, system dialogs): record
  `BLOCKED_HUMAN` and move on.
- **Product choices the plan does not cover.** Choose the simplest option
  consistent with PLAN_4 §1–§4, record it under "Decisions taken" in the status
  file, and move on.
- **Destructive actions.** Nothing destructive outside the worktree and the
  workstation build root.
- **No push, tag or release.** Never claim READY.

## When you stop

Stop when the plan is done or you cannot get further. Finish with a short
report:

- steps completed, with commit hashes;
- test and gate results;
- the screenshots worth looking at, with paths;
- which work Claude did;
- decisions taken;
- what is blocked and why;
- what needs Wout.
