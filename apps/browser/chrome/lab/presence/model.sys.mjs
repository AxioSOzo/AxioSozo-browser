/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Agent presence, the pure part (docs/lab/experiments/agents-folder.md,
// agents-on-rows.md, proof-tab.md): what one agent session looks like where
// the eye already goes. A session is a ctx.agents snapshot (chrome/lab/
// agents.sys.mjs): started from the browser, or found elsewhere (the
// `claude agents --json` poll, the axiosozo-notify hooks).
//
//   title      "Harbor · fix the retry button"
//   subtitle   "Claude Code · working: editing index.html", "Claude Code · needs you",
//              "Claude Code · done: Fixed the retry handler", "Codex · failed: …"
//   state      working (starting counts as working) | needs_you | done | failed | stopped
//   phase      run | wait | end: a dismissal hides a session until it reaches a
//              later phase, so a hidden run still comes back when it needs you
//              or when it finished; a dismissed result stays gone
//
// One attention rule lives on top of this (attention.sys.mjs): only entering
// needs_you interrupts. Finished sessions stay a day (DAY_MS), then expire.
// No DOM, no timers: the tests drive it directly.

export const PRESENCE_STATES = Object.freeze(["working", "needs_you", "done", "failed", "stopped"]);
export const DAY_MS = 24 * 60 * 60 * 1000;
export const WAITING_FOR_REPLY = "Waiting for your reply.";
const PHASES = Object.freeze({ working: "run", needs_you: "wait", done: "end", failed: "end", stopped: "end" });
const PHASE_RANK = Object.freeze({ run: 0, wait: 1, end: 2 });
// Needs you first, then what went wrong, then what is running, then results.
const ORDER = Object.freeze({ needs_you: 0, failed: 1, working: 2, done: 3, stopped: 4 });
const LABELS = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", antigravity: "Antigravity" });

/** One line of plain text, at most `max` characters (an ellipsis when cut). */
export function line(value, max = 120) {
  if (typeof value !== "string") return "";
  const text = value.replace(/[\s\u0000-\u001f\u007f-\u009f]+/gu, " ").trim();
  const chars = [...text];
  return chars.length <= max ? text : `${chars.slice(0, max - 1).join("").trimEnd()}…`;
}
const noPeriod = text => text.replace(/[.。]+$/u, "");
// Step lines start with a verb ("Editing index.html", "Running npm test"); a reason may start with a name.
const lowerVerb = text => (/^[A-Z][a-z]+ing\b/u.test(text) || text === "Thinking" ? `${text[0].toLowerCase()}${text.slice(1)}` : text);

/** The state a session shows as: starting counts as working; anything unknown as working too. */
export function presenceState(session) {
  const state = session?.state;
  return PRESENCE_STATES.includes(state) ? state : "working";
}
export const phaseOf = state => PHASES[state] ?? "run";
export const isFinished = state => phaseOf(state) === "end";
export const clientLabel = session => line(session?.clientLabel, 40) || LABELS[session?.client] || "Your agent";
export const projectName = session => line(session?.projectName, 60) || "A project";
const isWaitingForReply = session => session?.state === "done" && session?.summary === WAITING_FOR_REPLY;

/** What the session works on, without the "AxioSozo: " its own name carries. */
export function taskOf(session) {
  const text = line(session?.title, 80).replace(/^AxioSozo:\s*/u, "");
  return text || `${clientLabel(session)} session`;
}

/** "Harbor · fix the retry button". */
export const titleOf = session => `${projectName(session)} · ${taskOf(session)}`;

/** The state in words, after the agent's name: "working: editing index.html", "needs you", "done: Fixed the retry handler". */
export function stateLine(session) {
  const state = presenceState(session);
  if (session?.state === "starting") return "starting";
  if (state === "working") {
    const step = line(session?.step, 70);
    return step && step !== "Working" ? `working: ${lowerVerb(noPeriod(step))}` : "working";
  }
  if (state === "needs_you") return "needs you";
  if (state === "done") {
    if (isWaitingForReply(session)) return "waiting for your reply";
    const summary = noPeriod(line(session?.summary, 100));
    return summary && summary !== `${clientLabel(session)} finished` ? `done: ${summary}` : "done";
  }
  if (state === "failed") {
    const reason = noPeriod(line(session?.reason, 100));
    return reason ? `failed: ${reason}` : "failed";
  }
  return "stopped";
}

/** The state alone: "starting", "working", "needs you", "done", "waiting for your reply", "failed", "stopped". */
export function stateWord(session) {
  if (session?.state === "starting") return "starting";
  const state = presenceState(session);
  if (state === "needs_you") return "needs you";
  if (state === "done" && isWaitingForReply(session)) return "waiting for your reply";
  return state;
}

/** "Claude Code · working: editing index.html". */
export const subtitleOf = session => line(`${clientLabel(session)} · ${stateLine(session)}`, 110);

/** A short sentence for screen readers and tooltips: "Claude Code needs you", "Codex is working". */
export function markLabel(session) {
  const name = clientLabel(session);
  switch (presenceState(session)) {
    case "needs_you": return `${name} needs you`;
    case "done": return isWaitingForReply(session) ? `${name} is waiting for your reply` : `${name} is done`;
    case "failed": return `${name} failed`;
    case "stopped": return `${name} stopped`;
    default: return `${name} is working`;
  }
}

/** The sentence the result card leads with: the agent's own words when done, the honest reason otherwise. */
export function leadText(session) {
  const state = presenceState(session);
  if (state === "done") return line(session?.summary, 240) || `${clientLabel(session)} finished.`;
  if (state === "working") {
    const step = line(session?.step, 120);
    return step && step !== "Working" ? `${step}…` : "Working…";
  }
  if (state === "needs_you") return line(session?.reason, 240) || `${clientLabel(session)} is waiting for your answer.`;
  return line(session?.reason, 240) || (state === "failed" ? "It did not finish." : "Stopped.");
}

/** Files this run changed, in words: "Changed index.html", "Changed index.html and styles.css", "Changed 4 files: a, b and 2 more". */
export function filesText(files) {
  const changed = Array.isArray(files?.byRun) ? files.byRun.filter(path => typeof path === "string" && path) : [];
  if (!changed.length) return null;
  const names = changed.map(path => line(path, 80));
  if (names.length === 1) return `Changed ${names[0]}`;
  if (names.length === 2) return `Changed ${names[0]} and ${names[1]}`;
  if (names.length === 3) return `Changed ${names[0]}, ${names[1]} and ${names[2]}`;
  return `Changed ${names.length} files: ${names[0]}, ${names[1]} and ${names.length - 2} more`;
}
export const changedFiles = files => (Array.isArray(files?.byRun) ? files.byRun.filter(path => typeof path === "string" && path).length : 0);

/** "$0.0010 · 3.6 s", "12 s", "1 min 5 s"; null when nothing is known. */
export function costTimeText(session) {
  const parts = [];
  const cost = session?.costUsd;
  // Nothing spent (a run that failed before its first answer) is not worth a "$0.0000".
  if (typeof cost === "number" && Number.isFinite(cost) && cost > 0) parts.push(`$${cost < 0.01 ? cost.toFixed(4) : cost.toFixed(2)}`);
  const ms = session?.durationMs;
  if (typeof ms === "number" && Number.isFinite(ms) && ms >= 0) {
    const seconds = ms / 1000;
    if (seconds < 60) parts.push(`${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)} s`);
    else parts.push(`${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} s`);
  }
  return parts.length ? parts.join(" · ") : null;
}

/** When a finished session ended, as far as the snapshot says. */
const endedAt = session => (Number.isFinite(session?.endedAt) ? session.endedAt : Number.isFinite(session?.updatedAt) ? session.updatedAt : 0);

/** Whether a session is past its day: finished (or waiting) and older than DAY_MS. A working one never expires here. */
export function isExpired(session, now, keepMs = DAY_MS) {
  const state = presenceState(session);
  if (state === "working") return false;
  return now - endedAt(session) > keepMs;
}

/**
 * The sessions to show, as items, most urgent first: { id, session, state,
 * phase, title, subtitle, label, projectId, spaceUuid }. `hidden(session)`
 * (the hub's dismissals) and the day limit leave sessions out; so does a
 * session that names no project. `spaceOf(projectId)` gives its space.
 */
export function presenceItems(sessions, { now = Date.now(), hidden = () => false, spaceOf = () => null, keepMs = DAY_MS } = {}) {
  const items = [];
  for (const session of Array.isArray(sessions) ? sessions : []) {
    if (!session || typeof session.id !== "string" || typeof session.projectId !== "string") continue;
    if (isExpired(session, now, keepMs)) continue;
    let gone = false;
    try { gone = hidden(session) === true; } catch { gone = false; }
    if (gone) continue;
    const state = presenceState(session);
    let spaceUuid = null;
    try { spaceUuid = spaceOf(session.projectId) ?? null; } catch { spaceUuid = null; }
    items.push(Object.freeze({ id: session.id, session, state, phase: phaseOf(state), title: titleOf(session), subtitle: subtitleOf(session),
      label: markLabel(session), projectId: session.projectId, spaceUuid }));
  }
  return items.sort((a, b) => ORDER[a.state] - ORDER[b.state] || (b.session.updatedAt ?? 0) - (a.session.updatedAt ?? 0));
}

/** The one item a project row shows: the most urgent of that project's (items come sorted). */
export function strongestFor(items, projectId) {
  return (Array.isArray(items) ? items : []).find(item => item.projectId === projectId) ?? null;
}

/** Whether a dismissal ({ phase, at }) still hides a session in `state`: until a later phase, or a new wait. */
export function dismissalHides(dismissal, state, { waitingSince = null } = {}) {
  if (!dismissal) return false;
  const phase = phaseOf(state);
  if (PHASE_RANK[phase] > PHASE_RANK[dismissal.phase]) return false;
  // Waiting again after it was dismissed (an external session answered, worked and asks again): show it.
  if (phase === "wait" && Number.isFinite(waitingSince) && waitingSince > dismissal.at) return false;
  return true;
}

/** "1 agent needs you", "2 agents need you". */
export const needsYouHeading = count => (count === 1 ? "Needs you" : `${count} need you`);
