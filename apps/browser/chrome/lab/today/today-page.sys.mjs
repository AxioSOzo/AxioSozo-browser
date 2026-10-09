/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// The today sheet's side of the about:axiosozo actor (AboutAxioSozoParent
// getToday, setTodayErrand, openTodayErrand, suggestTodayFirst). The actor
// checks the sender, the window and the params, and rebuilds every reply from
// closed primitives; this module does the work, and refuses (LAB_OFF) unless
// the today sheet is on. Errand lines and actions also need Errands on.
//
// Only "Suggest a first thing" reaches the user's AI, once per click, with
// the numbered lines of the sheet (titles and details, never an address).

import { TODAY_PREFS, todayData } from "./today-data.sys.mjs";
import { SUGGESTION_SCHEMA, allLines, readSuggestion, suggestionPrompt } from "./today-model.sys.mjs";
import { errandStore } from "../errands/errand-store.sys.mjs";
import { aiErrorText, createLabAi } from "../ai.sys.mjs";
import { labPlatform } from "../platform.sys.mjs";

export const SUGGEST_TIMEOUT_MS = 60 * 1000;
const AI_LABELS = Object.freeze({ "claude-code": "Claude Code", codex: "Codex" });

export class TodayPageError extends Error {
  constructor(code, message = code) { super(message); this.name = "TodayPageError"; this.code = code; }
}

const on = (prefs, name) => { try { return prefs?.getBoolPref?.(name, false) === true; } catch { return false; } };
function requireSheet(prefs) {
  if (!on(prefs, TODAY_PREFS.sheet)) throw new TodayPageError("LAB_OFF", "Today is a Lab experiment that is off.");
}
function requireErrands(prefs) {
  requireSheet(prefs);
  if (!on(prefs, TODAY_PREFS.errands)) throw new TodayPageError("LAB_OFF", "Errands is a Lab experiment that is off.");
}

/** The sheet: the digest since `since` (default: the last look). `look`: this is you looking now. */
export async function todayForPage({ services = null, prefs, since = null, look = false, data = todayData({ services }) } = {}) {
  requireSheet(prefs);
  const from = Number.isSafeInteger(since) ? since : await data.since();
  const digest = await data.digest({ since: from });
  if (look) await data.markSeen();
  return { ...digest, errands: on(prefs, TODAY_PREFS.errands) };
}

/** Done, Tomorrow or Undo for one errand from the sheet. */
export async function errandForPage({ prefs, id, action, store = errandStore() } = {}) {
  requireErrands(prefs);
  const run = { done: store.done, snooze: store.snooze, reopen: store.reopen }[action];
  if (!run) throw new TodayPageError("INVALID_PARAMS");
  try { await run(id); }
  catch (error) { throw new TodayPageError(error?.code === "UNKNOWN_ERRAND" ? "UNKNOWN_ERRAND" : "ERRAND_UNAVAILABLE"); }
  return { ok: true };
}

/** Opens an errand's page in its space, in the window of the sheet (a space that is gone: the current one). */
export async function openErrandForPage({ services, prefs, window, id, store = errandStore() } = {}) {
  requireErrands(prefs);
  const errand = await store.get(id);
  if (!errand) throw new TodayPageError("UNKNOWN_ERRAND");
  if (typeof services?.openUrl !== "function") throw new TodayPageError("UNSUPPORTED");
  try { await services.openUrl({ window, url: errand.url, contextUuid: errand.space ?? null }); }
  catch {
    if (!errand.space) throw new TodayPageError("OPEN_FAILED");
    await services.openUrl({ window, url: errand.url, contextUuid: null });
  }
  return { ok: true };
}

/**
 * "Suggest a first thing": one answer from the user's own AI (Claude Code, or
 * Codex when Claude Code is not ready) that picks one line of the sheet.
 * Resolves { status: "ok", client, model, key, why } or { status: "failed",
 * client, text } (an honest sentence); never throws for an AI failure.
 * `ai` is a Lab ai facade for the sheet's window (createLabAi).
 */
export async function suggestForPage({ services = null, prefs, since = null, ai, data = todayData({ services }) } = {}) {
  requireSheet(prefs);
  const digest = await data.digest({ since: Number.isSafeInteger(since) ? since : await data.since() });
  if (!allLines(digest).length) return { status: "failed", client: null, text: "There is nothing on the sheet to choose from." };
  let answer;
  try {
    answer = await ai.runTurn({ client: "auto", prompt: suggestionPrompt(digest), json: SUGGESTION_SCHEMA, timeoutMs: SUGGEST_TIMEOUT_MS });
  } catch (error) {
    return { status: "failed", client: null, text: error?.reason ?? aiErrorText(error?.code ?? "TURN_FAILED") };
  }
  const client = AI_LABELS[answer.client] ? answer.client : null;
  try {
    const pick = readSuggestion(answer.json, digest);
    return { status: "ok", client, model: typeof answer.model === "string" ? answer.model : null, key: pick.key, why: pick.why };
  } catch {
    return { status: "failed", client, text: `${AI_LABELS[client] ?? "The assistant"} answered in a form the sheet cannot use. Try again.` };
  }
}

/** The Lab ai facade for one window (the real platform's backend). */
export function aiForWindow({ window, isPrivate, services }) {
  return createLabAi({ window, isPrivate, getBackend: () => labPlatform({ services }).backend,
    getStatus: options => labPlatform({ services }).statuses(options) });
}
