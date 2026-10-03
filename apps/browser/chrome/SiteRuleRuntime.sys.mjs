/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// F5 site rules at runtime (HANDOFF_3 §4.3, §4.4, §6.2, §6.3; decision-v1).
//
// - Usage ledger recorder: foreground time of the selected http(s) tab in a
//   focused, visible, non-private window while the user is not idle, per host and
//   context, flushed through services.recordForeground. Private windows record nothing.
// - Deterministic layer (always on): contexts core evaluates limits and allowed
//   hours on commit, tab switch and periodically.
// - Chrome-owned effects only: a notification-box notice (nudge / suggest_leave)
//   and an interstitial over the tab's browser stack (pause_site) with the rule's
//   override friction. No network blocking, no page rewriting, the user can always continue.
// - Optional Jev layer: only for enabled rules with observation != none and
//   effects, with jev.consent, at commit/interval checkpoints of the foreground
//   tab, within the browser-wide hourly budget. Every call shows the outgoing-data
//   indicator; without a mounted, visible indicator no call is made. The commit
//   checkpoint waits for the committed document's load to finish so the title is
//   that document's own (never the tab label of the previous page). Revoking
//   consent aborts calls in flight. M1 sends `address` only (see OUTLINE_SUPPORTED).
// - The budget is the one process DecisionBudget and the host the one shared
//   provider host (AxioSozoServices.getDecisionRuntime). Each call is reserved
//   once at its admitted checkpoint and handed off only through this window's
//   own registered sending lease, whose synchronous guard checks this exact
//   tab, document, policy, space, rule, provider, consent, key and indicator.
// - Rules that choose OpenAI (site-rule-v1 `provider`) are never dispatched from
//   here: OpenAI has no native admission or consent yet, and Jev's key, consent
//   and outcome provenance are never reused for it. Screen rules send nothing:
//   no native capture exists (SCREEN_SUPPORTED).
import * as defaultCore from "./contexts/index.mjs";
import { WPL, webURL, defaultTimers, prefEnabled, ensureRuntimeStylesheet, addTabsProgressListener,
  element, browserStackOf } from "./DevLoop.sys.mjs";

export const TICK_INTERVAL_MS = 30000;
export const FLUSH_INTERVAL_MS = 60000;
export const MAX_SEGMENT_MS = 2 * TICK_INTERVAL_MS; // clamps sleep/suspend gaps
export const IDLE_SECONDS = 120;
export const SENT_INDICATOR_MS = 6000;
export const OVERVIEW_URL = "about:axiosozo";
// Outline collection needs a read-only child actor that this workstream does not
// own yet; until it exists every request is capped at `address`.
export const OUTLINE_SUPPORTED = false;
// No native capture of the visible tab exists yet: a screen rule is never
// relabelled as another level, and the request builder is never told a
// screenshot is available.
export const SCREEN_SUPPORTED = false;
// Decision providers this runtime may dispatch. A rule without a provider is Jev.
export const NATIVE_DECISION_PROVIDERS = Object.freeze(["jev"]);
const PROVIDER_NAMES = Object.freeze({ jev: "Jev", openai: "OpenAI", other: "Judgement" });
// Anything but an absent or explicit Jev is never treated as Jev.
const providerOf = rule => (rule?.provider === undefined || rule.provider === "jev" ? "jev"
  : rule.provider === "openai" ? "openai" : "other");
const LEDGER_HOST = /^[a-z0-9.-]{1,253}$/u;
const RANK = Object.freeze({ none: 0, nudge: 1, suggest_leave: 2, pause_site: 3 });
const INERT = Object.freeze({ dispose() {} });
const NOTICE_INSTRUCTION_CHARS = 160;

// Process-wide: a dismissal in one window suppresses that rule/context
// everywhere. Suppressions are in-memory only. The browser-wide budget is the
// injected process DecisionBudget (decision-v1), never per window.
const SHARED = { suppressions: [] };

/** Ledger host for an http(s) URL: lower-case ASCII (punycode) hostname, no IPv6 literals. */
export function ledgerHost(spec) {
  const url = webURL(spec);
  if (!url) return null;
  const host = url.hostname.toLowerCase().replace(/\.$/u, "");
  return LEDGER_HOST.test(host) ? host : null;
}

export function defaultLocalTime(now) {
  const date = new Date(now);
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(),
    minutes: date.getHours() * 60 + date.getMinutes(), weekday: date.getDay() };
}

function minutes(ms) { return Math.floor(ms / 60000); }
function clip(text, limit) {
  const value = String(text ?? "").replace(/\s+/gu, " ").trim();
  return value.length > limit ? value.slice(0, limit - 1) + "…" : value;
}

/** Fixed templates only; the rule's own instruction is shown verbatim beside them. */
export function effectMessage(effect, reasonCode, rule, host) {
  if (reasonCode === "daily_limit_reached") {
    const limit = rule.limits?.daily_minutes;
    return `You have used your ${limit} ${limit === 1 ? "minute" : "minutes"} on ${host} today.`;
  }
  if (reasonCode === "outside_allowed_hours") return `${host} is outside the hours you set for it.`;
  if (effect === "suggest_leave") return `Your rule for ${host} suggests you are done here.`;
  if (effect === "pause_site") return `Your rule for ${host} pauses this site now.`;
  return `A reminder from your rule for ${host}.`;
}

function defaultIdle(window) {
  return {
    subscribe(seconds, callback) {
      let service = null;
      try { service = window.Cc?.["@mozilla.org/widget/useridleservice;1"]?.getService(window.Ci.nsIUserIdleService); } catch {}
      if (!service) return () => {};
      const observer = { observe(_subject, topic) { if (topic === "idle") callback(true); else if (topic === "active") callback(false); } };
      service.addIdleObserver(observer, seconds);
      return () => { try { service.removeIdleObserver(observer, seconds); } catch {} };
    },
  };
}

async function defaultSaveBookmark(window, { url, title }) {
  const places = window.PlacesUtils;
  if (!places?.bookmarks) throw new Error("BOOKMARKS_UNAVAILABLE");
  if (await places.bookmarks.fetch({ url })) return { existing: true };
  await places.bookmarks.insert({ parentGuid: places.bookmarks.unfiledGuid, url, title });
  return { existing: false };
}

function randomRequestId() {
  const bytes = new Uint8Array(12);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256); // ids are opaque, not secrets
  return "req_" + Array.from(bytes, b => b.toString(16).padStart(2, "0")).join("");
}

/** Usage for `day` in one summary row, tolerant of the by_day shape. */
function rowUsage(row, day) {
  const byDay = row?.by_day;
  if (Array.isArray(byDay)) {
    const entry = byDay.find(item => item?.day === day);
    return Number(entry?.foreground_ms ?? entry?.ms ?? entry?.total_ms) || 0;
  }
  if (byDay && typeof byDay === "object") return Number(byDay[day]) || 0;
  return Number(row?.total_ms) || 0;
}

/**
 * F5. `services`: listRules, getJevSettings, listContexts, usageSummary,
 * recordForeground, on, and for decisions getDecisionPolicySnapshot and
 * subscribeDecisionPolicyInvalidation. `adapter`: isPrivateWindow, workspaceForTab.
 * `decisions`: the process decision runtime { budget, registerLease, decide }
 * (AxioSozoServices.getDecisionRuntime); its decide(request, { signal }) never
 * rejects (contexts-api-v1 §3.5). Without it, or without the process policy
 * snapshot and invalidation registration, no request is ever made.
 * Optional injections for tests: core, clock, timers, localTime, idle,
 * shared ({ suppressions }), saveBookmark, openOverview, requestId, hasJevKey.
 */
export function installSiteRuleRuntime(window, { services, adapter, decisions = null, core = defaultCore,
  clock = () => Date.now(), timers = defaultTimers(window), localTime = defaultLocalTime, idle = defaultIdle(window),
  shared = SHARED, saveBookmark = info => defaultSaveBookmark(window, info),
  openOverview = url => (typeof window.switchToTabHavingURI === "function"
    ? window.switchToTabHavingURI(url, true, { ignoreFragment: "whenComparingAndReplace" })
    : window.openTrustedLinkIn(url, "tab")), requestId = randomRequestId,
  hasJevKey = null } = {}) {
  if (!services || !adapter || !window?.gBrowser || !prefEnabled(window, "axiosozo.contexts.enabled", true)) return INERT;
  // Private windows: no ledger, no evaluation, no Jev, no UI.
  if (adapter.isPrivateWindow()) return INERT;
  const offered = typeof decisions?.decide === "function" && typeof decisions.registerLease === "function"
    && typeof decisions.budget?.reserve === "function" && typeof decisions.budget.limit === "function" ? decisions : null;
  const document = window.document;
  const gBrowser = window.gBrowser;
  const cleanups = [];
  let disposed = false;
  cleanups.push(ensureRuntimeStylesheet(document));

  let rules = [];
  let contexts = [];
  let jev = { consent: false, interval_minutes: 5, hourly_budget: 30 };
  let jevKeyMissing = false;
  let summary = { day: null, rows: [] };
  const pending = new Map(); // "day\thost\tcontext" → ms not yet handed to services
  const inFlight = new Map(); // handed to services, not yet reflected in the summary
  let segment = null; // { tab, host, contextUuid, day, start, sessionStart }
  let focused = document.hasFocus?.() ?? true;
  let minimized = window.windowState === window.STATE_MINIMIZED && window.STATE_MINIMIZED !== undefined;
  let userIdle = false;
  const displayed = new Map(); // tab → effect entry
  let overlaySerial = 0;
  const jevTabs = new WeakMap(); // tab → { lastAt, controller }
  const controllers = new Set(); // every in-flight decide() controller, for consent revocation
  const pendingCommits = new Map(); // tab → { spec } until that document's top-level load stops
  const documentEpochs = new WeakMap(); // tab → count of its committed top-level documents
  const documentOf = tab => documentEpochs.get(tab) ?? 0;
  const diagnostics = { decideCalls: 0, dataSent: 0, budgetSkipped: 0, outlineCapped: 0, indicatorSkipped: 0,
    providerUnavailable: 0, screenUnavailable: 0, policyUnsettled: 0, leaseRefused: 0, sendingRefused: 0, effects: [], flushed: 0 };

  // Optional decisions follow one settled policy snapshot: the rules with the Jev
  // settings, and the contexts. Starting a reload of either makes decisions
  // unavailable at once, before its first await, and revokes decision work under
  // the old snapshot (policyEpoch). Only the latest reload of that source, read
  // completely and successfully, makes them available again: a superseded (late)
  // or failed read never restores them. Deterministic limits keep using the last
  // installed rules and contexts.
  let policyEpoch = 0;
  // rules.revision: the ready process revision the settled rules were read
  // under, begun and finished (see loadRules); null when not exactly one.
  const policyLoads = { rules: { latest: 0, settled: false, revision: null }, contexts: { latest: 0, settled: false } };
  const policySettled = () => !disposed && policyLoads.rules.settled && policyLoads.contexts.settled;
  function beginPolicyLoad(source) {
    const load = policyLoads[source];
    load.settled = false;
    if (source === "rules") load.revision = null;
    policyEpoch++;
    for (const controller of [...controllers]) controller.abort(); // answers under the old snapshot are dropped
    return ++load.latest;
  }

  // The process decision policy (AxioSozoServices): this runtime's own
  // synchronous invalidation registration and the exact current snapshot. An
  // invalidation (a rule or Jev settings write beginning in any window) voids
  // this window's decision work at once: requests in flight are cancelled
  // (their disclosure stays), the rules snapshot is unsettled until the write's
  // own "rules" reload, and a checkpoint, key probe or rules read that began
  // before it never continues, even once a new revision is published. Without
  // the registration and the snapshot, this window makes no decision request.
  let processGeneration = 0;
  /** The current process revision when it is ready, else null. */
  const processRevision = () => {
    try {
      const snapshot = services.getDecisionPolicySnapshot();
      return snapshot?.ready === true && Number.isSafeInteger(snapshot.revision) ? snapshot.revision : null;
    } catch { return null; }
  };
  let runtime = null;
  if (offered && typeof services.getDecisionPolicySnapshot === "function" && typeof services.subscribeDecisionPolicyInvalidation === "function") {
    let unsubscribe = null;
    try {
      unsubscribe = services.subscribeDecisionPolicyInvalidation(() => {
        processGeneration++;
        policyEpoch++;
        policyLoads.rules.settled = false;
        policyLoads.rules.revision = null;
        for (const controller of [...controllers]) controller.abort();
      });
    } catch { unsubscribe = null; }
    // Only this exact registration is removed at teardown.
    if (typeof unsubscribe === "function") { cleanups.push(unsubscribe); runtime = offered; }
  }
  // The process publishes a ready revision without telling listeners (its
  // first hydration, or the one after a write, which can finish before or
  // after this window's "rules" reload of that write). Settled rules read
  // under another or no ready revision are therefore read once more, fresh,
  // under the exact revision a checkpoint found ready: at most one read per
  // revision, shared by every checkpoint that needs it, never repeated.
  let reread = { revision: null, done: null };
  function rulesUnder(revision) {
    // Like a "rules" reload, the fresh rules also apply to the local limits.
    if (reread.revision !== revision) reread = { revision, done: loadRules().then(reevaluate) };
    return reread.done;
  }

  const today = now => core.localDay(localTime(now));
  const contextType = uuid => contexts.find(c => c.uuid === uuid)?.type ?? "personal";
  const foreground = () => focused && !minimized && !userIdle && !document.hidden;
  const observationOf = (rule, host) => { try { return core.effectiveObservation(rule, host); } catch { return "none"; } };

  // ---- Targets ------------------------------------------------------------------
  function targetFor(tab) {
    const host = ledgerHost(tab?.linkedBrowser?.currentURI?.spec);
    if (!host) return null;
    const contextUuid = adapter.workspaceForTab(tab) ?? null;
    const type = contextType(contextUuid);
    const matching = core.rulesFor(rules, { host, contextUuid, contextType: type }).filter(rule => rule.enabled !== false);
    return { tab, host, contextUuid, contextType: type, rules: matching };
  }

  // ---- Ledger ---------------------------------------------------------------------
  const key = (day, host, contextUuid) => `${day}\t${host}\t${contextUuid ?? ""}`;
  function add(day, host, contextUuid, ms) {
    if (ms <= 0) return;
    const k = key(day, host, contextUuid);
    pending.set(k, (pending.get(k) ?? 0) + ms);
  }
  function closeSegment(now) {
    if (!segment) return;
    add(segment.day, segment.host, segment.contextUuid, Math.min(Math.max(0, now - segment.start), MAX_SEGMENT_MS));
    segment = null;
  }
  /** Accumulates the running segment and starts the next one for the current state. */
  function syncSegment() {
    const now = clock();
    const previous = segment;
    closeSegment(now);
    if (disposed || !foreground()) return;
    const tab = gBrowser.selectedTab;
    const host = ledgerHost(tab?.linkedBrowser?.currentURI?.spec);
    if (!host) return;
    const contextUuid = adapter.workspaceForTab(tab) ?? null;
    const continued = previous && previous.tab === tab && previous.host === host && previous.contextUuid === contextUuid;
    segment = { tab, host, contextUuid, day: today(now), start: now, sessionStart: continued ? previous.sessionStart : now };
  }

  function unflushedFor(rule, day) {
    let ms = 0;
    for (const map of [pending, inFlight]) {
      for (const [k, value] of map) {
        const [d, host] = k.split("\t");
        if (d === day && rule.match.hosts.some(pattern => core.hostMatches(pattern, host))) ms += value;
      }
    }
    if (segment && segment.day === day && rule.match.hosts.some(pattern => core.hostMatches(pattern, segment.host)))
      ms += Math.min(Math.max(0, clock() - segment.start), MAX_SEGMENT_MS);
    return ms;
  }
  /** Today's foreground time on the rule's hosts across contexts (flushed + unflushed). */
  function usageToday(rule, day) {
    let ms = 0;
    if (summary.day === day) {
      for (const row of summary.rows) {
        if (typeof row?.host === "string" && rule.match.hosts.some(pattern => core.hostMatches(pattern, row.host))) ms += rowUsage(row, day);
      }
    }
    return ms + unflushedFor(rule, day);
  }

  async function loadSummary() {
    const day = today(clock());
    try {
      const rows = await services.usageSummary({ days: 1 });
      summary = { day, rows: Array.isArray(rows) ? rows : [] };
    } catch { /* keep the previous summary */ }
  }

  let flushing = null;
  function flush() {
    syncSegment();
    if (flushing || pending.size === 0) return flushing ?? Promise.resolve();
    const batch = [...pending]; pending.clear();
    for (const [k, ms] of batch) inFlight.set(k, (inFlight.get(k) ?? 0) + ms);
    flushing = (async () => {
      for (const [k, ms] of batch) {
        const [day, host, context] = k.split("\t");
        try {
          await services.recordForeground({ day, host, contextUuid: context || null, ms: Math.round(ms) });
          diagnostics.flushed += ms;
        } catch { pending.set(k, (pending.get(k) ?? 0) + ms); }
      }
      await loadSummary();
      for (const [k] of batch) inFlight.delete(k);
    })().finally(() => { flushing = null; });
    return flushing;
  }

  // ---- Suppressions ------------------------------------------------------------------
  function activeSuppressions(now) {
    shared.suppressions = shared.suppressions.filter(s => s.until > now);
    return shared.suppressions;
  }
  function suppressed(ruleId, contextUuid, effect, now) {
    return activeSuppressions(now).some(s => s.rule_id === ruleId && s.context_uuid === contextUuid && s.effect === effect);
  }
  function suppressEntry(entry) {
    shared.suppressions = [...activeSuppressions(clock()),
      core.suppress({ ruleId: entry.ruleId, contextUuid: entry.contextUuid, effect: entry.effect, now: clock() })];
  }

  // ---- Address-bar indicator, panel and outgoing-data indicator --------------------------
  const indicator = element(document, "button", { className: "axiosozo-rule-indicator",
    attrs: { id: "axiosozo-rule-indicator", "aria-haspopup": "dialog" } });
  indicator.hidden = true;
  const outgoing = element(document, "span", { className: "axiosozo-jev-outgoing",
    attrs: { id: "axiosozo-jev-outgoing", role: "status", "aria-live": "polite" } });
  outgoing.hidden = true;
  const outgoingText = element(document, "span", { className: "axiosozo-jev-outgoing-label" }, outgoing);
  const panel = document.createXULElement("panel");
  panel.id = "axiosozo-rule-panel";
  panel.setAttribute("type", "arrow");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-labelledby", "axiosozo-rule-panel-title");
  const panelBody = element(document, "div", { className: "axiosozo-rule-panel-body" }, panel);
  let indicatorTarget = null;
  let lastJev = null; // { at, level, dataSent }
  let sentTimer = null;
  let sendingCount = 0;

  const identity = document.getElementById("identity-box");
  if (identity) {
    identity.after(indicator);
    indicator.after(outgoing);
    (document.getElementById("mainPopupSet") ?? document.documentElement).appendChild(panel);
    cleanups.push(() => { indicator.remove(); outgoing.remove(); panel.remove(); });
  }

  function updateIndicator(target) {
    indicatorTarget = target?.rules.length ? target : null;
    indicator.hidden = !indicatorTarget;
    if (!indicatorTarget) return;
    const day = today(clock());
    const rule = indicatorTarget.rules[0];
    const used = minutes(usageToday(rule, day));
    const limit = rule.limits?.daily_minutes;
    const usage = limit ? `${used} of ${limit} minutes today` : `${used} minutes today`;
    const more = indicatorTarget.rules.length > 1 ? ` and ${indicatorTarget.rules.length - 1} more` : "";
    indicator.setAttribute("aria-label", `Site rule for ${indicatorTarget.host}${more}: ${usage}. Show rule`);
    indicator.setAttribute("title", `Site rule for ${indicatorTarget.host}: ${usage}`);
  }

  // Fail closed: a Jev call needs the outgoing-data indicator in this window's
  // address bar. checkVisibility() covers a hidden toolbar or collapsed urlbar.
  const visible = node => {
    if (!node?.isConnected || node.hidden) return false;
    try {
      if (typeof node.checkVisibility === "function" && !node.checkVisibility({ checkVisibilityCSS: true, visibilityProperty: true })) return false;
    } catch { return false; }
    return true;
  };
  const indicatorMounted = () => !!identity && outgoing.isConnected && visible(outgoing.parentNode);

  function showOutgoing(state) {
    if (sentTimer !== null) { timers.clearTimeout(sentTimer); sentTimer = null; }
    if (state === "sending") {
      outgoing.hidden = false; outgoing.setAttribute("data-state", "sending");
      outgoingText.textContent = "Sending to Jev";
      outgoing.setAttribute("aria-label", "Sending the page address to Jev");
    } else if (state === "sent") {
      outgoing.hidden = false; outgoing.setAttribute("data-state", "sent");
      outgoingText.textContent = "Sent to Jev";
      outgoing.setAttribute("aria-label", "The page address was sent to Jev");
      sentTimer = timers.setTimeout(() => { sentTimer = null; if (!sendingCount) outgoing.hidden = true; }, SENT_INDICATOR_MS);
    } else if (!sendingCount) outgoing.hidden = true;
  }

  function buildPanel() {
    while (panelBody.firstChild) panelBody.firstChild.remove();
    const target = indicatorTarget;
    if (!target) return false;
    const day = today(clock());
    element(document, "h2", { className: "axiosozo-rule-panel-title", attrs: { id: "axiosozo-rule-panel-title" },
      text: `Site rule for ${target.host}` }, panelBody);
    for (const rule of target.rules) {
      const section = element(document, "section", { className: "axiosozo-rule-panel-rule" }, panelBody);
      element(document, "p", { className: "axiosozo-rule-hosts", text: rule.match.hosts.join(", ") }, section);
      if (rule.instruction) element(document, "blockquote", { className: "axiosozo-rule-instruction", text: rule.instruction }, section);
      const facts = element(document, "dl", { className: "axiosozo-rule-facts" }, section);
      const fact = (label, value) => {
        element(document, "dt", { text: label }, facts);
        element(document, "dd", { text: value }, facts);
      };
      const used = minutes(usageToday(rule, day));
      fact("Today", rule.limits?.daily_minutes ? `${used} of ${rule.limits.daily_minutes} minutes` : `${used} minutes`);
      if (rule.limits?.allowed_hours?.length) {
        fact("Allowed hours", rule.limits.allowed_hours.map(w => `${w.start}–${w.end}`).join(", "));
      }
      fact("Effects", rule.effects.length ? rule.effects.map(e => e.replace("_", " ")).join(", ") : "none");
      const level = observationOf(rule, target.host);
      const provider = providerOf(rule);
      const asked = level !== "none" && rule.effects.length > 0;
      const jevActive = provider === "jev" && jev.consent && asked && (level !== "screen" || SCREEN_SUPPORTED);
      const sent = jevActive ? (OUTLINE_SUPPORTED ? level : "address") : null;
      fact(PROVIDER_NAMES[provider], sent ? `may see the page ${sent === "address" ? "address and title" : "outline"}`
        : asked && !NATIVE_DECISION_PROVIDERS.includes(provider) ? "not available in this build; nothing leaves this Mac"
          : asked && level === "screen" ? "screenshots are not available in this build; nothing leaves this Mac"
            : "off; nothing leaves this Mac");
      if (lastJev && jevActive) {
        fact("Last Jev check", `${lastJev.dataSent ? "sent" : "not sent"} at ${new Date(lastJev.at).toLocaleTimeString()}`);
      }
      const edit = element(document, "button", { className: "axiosozo-rule-edit", text: "Edit rule…",
        attrs: { "data-rule-id": rule.id } }, section);
      edit.addEventListener("click", () => {
        panel.hidePopup?.();
        openOverview(`${OVERVIEW_URL}#rule=${rule.id}`);
      });
    }
    return true;
  }

  const onIndicatorClick = event => {
    event.stopPropagation?.();
    if (buildPanel()) panel.openPopup?.(indicator, "bottomleft topleft");
  };
  const onIndicatorMouseDown = event => event.stopPropagation?.();
  indicator.addEventListener("click", onIndicatorClick);
  indicator.addEventListener("mousedown", onIndicatorMouseDown);
  cleanups.push(() => {
    indicator.removeEventListener("click", onIndicatorClick);
    indicator.removeEventListener("mousedown", onIndicatorMouseDown);
    if (sentTimer !== null) timers.clearTimeout(sentTimer);
  });

  // ---- Effects --------------------------------------------------------------------------
  function clearEffect(tab) {
    const entry = displayed.get(tab);
    if (!entry) return;
    displayed.delete(tab);
    entry.closed = true;
    if (entry.pause) removePause(entry);
    if (entry.notification) {
      try { gBrowser.getNotificationBox(tab.linkedBrowser).removeNotification(entry.notification); } catch {}
    }
  }

  function applyEffect(tab, rule, evaluation, target) {
    const effect = evaluation.effect;
    if (!RANK[effect] || !rule.effects.includes(effect)) return false;
    if (suppressed(rule.id, target.contextUuid, effect, clock())) return false;
    const current = displayed.get(tab);
    if (current && current.ruleId === rule.id && current.effect === effect) return false;
    if (current && RANK[current.effect] > RANK[effect]) return false;
    if (current) clearEffect(tab);
    const entry = { ruleId: rule.id, effect, contextUuid: target.contextUuid, host: target.host,
      source: evaluation.source, reasonCode: evaluation.reason_code ?? null, closed: false };
    displayed.set(tab, entry);
    diagnostics.effects.push({ rule_id: rule.id, effect, source: evaluation.source, reason_code: entry.reasonCode });
    if (effect === "pause_site") showPause(tab, rule, entry);
    else showNotice(tab, rule, entry).catch(() => { if (displayed.get(tab) === entry) displayed.delete(tab); });
    return true;
  }

  async function showNotice(tab, rule, entry) {
    const box = gBrowser.getNotificationBox(tab.linkedBrowser);
    const instruction = rule.instruction ? ` “${clip(rule.instruction, NOTICE_INSTRUCTION_CHARS)}”` : "";
    const label = effectMessage(entry.effect, entry.reasonCode, rule, entry.host) + instruction;
    const buttons = entry.effect === "suggest_leave" ? [
      // Returning true keeps the notice open while saving; success closes the tab, failure leaves both.
      { label: "Save and close", accessKey: "S", callback: () => { saveAndClose(tab, entry).catch(() => {}); return true; } },
      { label: "Not now", accessKey: "N", callback: () => { suppressEntry(entry); return false; } },
    ] : [];
    const notification = await box.appendNotification(`axiosozo-rule-${entry.effect}`, {
      label, priority: box.PRIORITY_INFO_MEDIUM,
      eventCallback: event => {
        if (event === "dismissed") suppressEntry(entry);
        if ((event === "removed" || event === "dismissed") && displayed.get(tab) === entry) displayed.delete(tab);
      },
    }, buttons);
    entry.notification = notification;
    // Keep the notice across same-host navigations; clearEffect removes it when the host no longer matches.
    if (notification && "persistence" in notification) notification.persistence = 1000;
    if (entry.closed) { try { box.removeNotification(notification); } catch {} }
  }

  async function saveAndClose(tab, entry) {
    const url = webURL(tab.linkedBrowser?.currentURI?.spec);
    if (!url) return;
    try {
      await saveBookmark({ url: url.href, title: clip(tab.linkedBrowser?.contentTitle || url.host, 256) });
    } catch {
      // Nothing was saved, so the tab stays open.
      entry.saveFailed = true;
      return;
    }
    clearEffect(tab);
    gBrowser.removeTab(tab);
  }

  function showPause(tab, rule, entry) {
    const stack = browserStackOf(window, tab);
    if (!stack) { displayed.delete(tab); return; }
    const serial = ++overlaySerial; // ids stay unique when several tabs are paused
    const titleId = `axiosozo-pause-title-${serial}`, messageId = `axiosozo-pause-message-${serial}`;
    const overlay = element(document, "div", { className: "axiosozo-pause",
      attrs: { role: "dialog", "aria-modal": "true", "aria-labelledby": titleId, "aria-describedby": messageId,
        "data-axiosozo-pause": rule.id, "data-override": rule.override } });
    const card = element(document, "div", { className: "axiosozo-pause-card" }, overlay);
    element(document, "h1", { attrs: { id: titleId }, text: `${entry.host} is paused` }, card);
    element(document, "p", { className: "axiosozo-pause-message", attrs: { id: messageId }, text: effectMessage("pause_site", entry.reasonCode, rule, entry.host) }, card);
    if (rule.instruction) element(document, "blockquote", { className: "axiosozo-rule-instruction", text: rule.instruction }, card);
    const status = element(document, "p", { className: "axiosozo-pause-status", attrs: { "aria-live": "polite" } }, card);
    const actions = element(document, "div", { className: "axiosozo-pause-actions" }, card);
    const close = element(document, "button", { className: "axiosozo-pause-close primary", text: "Close tab" }, actions);
    const proceed = element(document, "button", { className: "axiosozo-pause-continue", text: "Continue anyway" }, actions);
    const confirmRow = element(document, "div", { className: "axiosozo-pause-confirm" }, card);
    confirmRow.hidden = true;
    element(document, "span", { text: `Continue on ${entry.host} anyway?` }, confirmRow);
    const confirmYes = element(document, "button", { className: "axiosozo-pause-confirm-yes", text: "Yes, continue" }, confirmRow);
    const confirmNo = element(document, "button", { className: "axiosozo-pause-confirm-no", text: "Stay paused" }, confirmRow);
    const pause = { overlay, stack, tab, countdown: null, listeners: [], restorePosition: null };
    entry.pause = pause;
    const on = (node, type, fn) => { node.addEventListener(type, fn); pause.listeners.push(() => node.removeEventListener(type, fn)); };

    const continueNow = () => {
      if (entry.closed) return;
      suppressEntry(entry); // 15 minutes for this rule in this context (core.suppress)
      clearEffect(tab);
      if (gBrowser.selectedTab === tab) tab.linkedBrowser.focus?.();
    };
    if (rule.override === "delay_10s") {
      const readyAt = clock() + core.OVERRIDE_DELAY_MS;
      const tick = () => {
        const remaining = Math.ceil((readyAt - clock()) / 1000);
        if (remaining > 0) {
          proceed.disabled = true;
          proceed.textContent = `Continue in ${remaining} s`;
          return;
        }
        proceed.disabled = false;
        proceed.textContent = "Continue anyway";
        status.textContent = "You can continue now.";
        if (pause.countdown !== null) { timers.clearInterval(pause.countdown); pause.countdown = null; }
      };
      tick();
      pause.countdown = timers.setInterval(tick, 1000);
      on(proceed, "click", () => { if (!proceed.disabled) continueNow(); });
    } else if (rule.override === "confirm") {
      on(proceed, "click", () => { actions.hidden = true; confirmRow.hidden = false; confirmYes.focus?.(); });
      on(confirmYes, "click", continueNow);
      on(confirmNo, "click", () => { confirmRow.hidden = true; actions.hidden = false; proceed.focus?.(); });
    } else {
      on(proceed, "click", continueNow);
    }
    on(close, "click", () => { clearEffect(tab); gBrowser.removeTab(tab); });
    // Focus stays inside the interstitial while it is shown (not a trap: Continue is always offered).
    on(overlay, "keydown", event => {
      // Ctrl/Cmd/Alt+Tab belong to the browser (tab switching) and the OS.
      if (event.key !== "Tab" || event.ctrlKey || event.metaKey || event.altKey) return;
      const focusables = [close, proceed, confirmYes, confirmNo].filter(node => !node.disabled && !node.hidden && !node.parentNode?.hidden);
      if (!focusables.length) return;
      const index = focusables.indexOf(document.activeElement);
      const next = focusables[(index + (event.shiftKey ? -1 : 1) + focusables.length) % focusables.length];
      event.preventDefault?.();
      next.focus?.();
    });
    if (window.getComputedStyle?.(stack)?.position === "static") {
      pause.restorePosition = stack.style.position ?? "";
      stack.style.position = "relative";
    }
    stack.appendChild(overlay);
    pause.focus = () => close.focus?.();
    if (gBrowser.selectedTab === tab) pause.focus();
  }

  function removePause(entry) {
    const pause = entry.pause;
    entry.pause = null;
    if (!pause) return;
    if (pause.countdown !== null) timers.clearInterval(pause.countdown);
    for (const off of pause.listeners) off();
    pause.overlay.remove();
    if (pause.restorePosition !== null) pause.stack.style.position = pause.restorePosition;
  }

  // ---- Deterministic evaluation -----------------------------------------------------------
  function evaluate(tab, { effects = true } = {}) {
    if (disposed) return null;
    const target = targetFor(tab);
    const current = displayed.get(tab);
    // An effect belongs to its host: navigating away (or the rule going away) removes it.
    if (current && (!target || !target.rules.some(rule => rule.id === current.ruleId) || target.host !== current.host)) clearEffect(tab);
    if (tab === gBrowser.selectedTab) updateIndicator(target);
    if (!target || !target.rules.length || !effects) return target;
    const now = clock();
    const time = localTime(now);
    const local = { day: core.localDay(time), minutes: time.minutes, weekday: time.weekday };
    let best = null;
    for (const rule of target.rules) {
      let evaluation = null;
      try {
        evaluation = core.evaluateDeterministic({ rule, usageTodayMs: usageToday(rule, local.day), local,
          contextUuid: target.contextUuid, suppressions: activeSuppressions(now), now,
          host: target.host, contextType: target.contextType });
      } catch { continue; } // an invalid stored rule never breaks browsing
      if (!evaluation || !RANK[evaluation.effect] || !rule.effects.includes(evaluation.effect)) continue;
      if (!best || RANK[evaluation.effect] > RANK[best.evaluation.effect]) best = { rule, evaluation };
    }
    if (best) applyEffect(tab, best.rule, best.evaluation, target);
    return target;
  }

  // ---- Optional Jev layer ------------------------------------------------------------------
  /** A rule that may be sent at all: enabled, with effects and a level above none. */
  const askable = (rule, host) => rule.enabled !== false && rule.effects.length > 0 && observationOf(rule, host) !== "none";
  /** Only a Jev rule this runtime can serve: never an OpenAI rule, never a screenshot. */
  const servable = (rule, host) => NATIVE_DECISION_PROVIDERS.includes(providerOf(rule))
    && (SCREEN_SUPPORTED || observationOf(rule, host) !== "screen");
  function jevRule(target) {
    if (!policySettled() || !jev.consent || jevKeyMissing || !(jev.hourly_budget > 0) || !runtime) return null;
    return target.rules.find(rule => askable(rule, target.host) && servable(rule, target.host)) ?? null;
  }
  /** Local, truthful refusal: no key probe, budget, indicator or decide() for these. */
  function countUnservable(target) {
    for (const rule of target.rules) {
      if (!askable(rule, target.host) || servable(rule, target.host)) continue;
      if (!NATIVE_DECISION_PROVIDERS.includes(providerOf(rule))) diagnostics.providerUnavailable++;
      else diagnostics.screenUnavailable++;
    }
  }

  async function checkpoint(tab, kind) {
    if (disposed || tab !== gBrowser.selectedTab || !foreground()) return; // background tabs never call
    // Only a settled policy snapshot may admit a decision; while rules, Jev
    // settings or contexts reload (or after a failed read) nothing is sent.
    if (!policySettled()) { diagnostics.policyUnsettled++; return; }
    let epoch = policyEpoch;
    let target = targetFor(tab);
    if (!target) return;
    countUnservable(target);
    let rule = jevRule(target);
    if (!rule) return;
    // Bound to the exact process revision ready now, to no invalidation since,
    // and to settled rules read under that very revision.
    const generation = processGeneration;
    const revision = processRevision();
    if (revision === null) { diagnostics.policyUnsettled++; return; }
    const processCurrent = () => generation === processGeneration && processRevision() === revision;
    const bound = () => processCurrent() && policyLoads.rules.revision === revision;
    if (policyLoads.rules.revision !== revision) {
      // The rules in hand were read under another or no ready revision: the
      // one fresh read under this revision first, then everything is resolved
      // again from it, for the same document (never the earlier read).
      const readDocument = documentOf(tab);
      await rulesUnder(revision);
      if (!policySettled() || !bound()) { diagnostics.policyUnsettled++; return; }
      if (disposed || tab !== gBrowser.selectedTab || !foreground() || documentOf(tab) !== readDocument) return;
      epoch = policyEpoch;
      const current = targetFor(tab);
      if (!current || current.host !== target.host) return;
      target = current;
      rule = jevRule(target);
      if (!rule) return;
    }
    if (typeof hasJevKey === "function") {
      const probedDocument = documentOf(tab);
      if (!(await hasJevKey())) return;
      // The probe awaited: rules, Jev settings, the tab's document or its space may
      // have changed meanwhile. A reload or a process invalidation that started
      // meanwhile voids this checkpoint, even if it already settled or a new
      // revision is published (a fresh checkpoint follows the new snapshot).
      // Otherwise only the policy in force now may be sent, for the
      // same document: the target and the rule are resolved again from current
      // state (provider, effective observation, enabled, effects, space, consent and
      // budget settings). A rule that now chooses OpenAI or a screenshot, or no
      // longer asks at all, sends nothing; it is never reinterpreted as Jev/address.
      if (policyEpoch !== epoch || !policySettled() || !bound()) { diagnostics.policyUnsettled++; return; }
      if (disposed || tab !== gBrowser.selectedTab || !foreground() || documentOf(tab) !== probedDocument) return;
      const current = targetFor(tab);
      if (!current || current.host !== target.host) return;
      target = current;
      rule = jevRule(target);
      if (!rule) return;
    }
    // From here to decide() nothing is awaited: the request, the budget and the
    // outgoing-data indicator all use this current target and rule.
    const now = clock();
    const state = jevTabs.get(tab) ?? { lastAt: null, controller: null };
    jevTabs.set(tab, state);
    if (kind === "interval" && !core.nextCheckpoint({ lastAt: state.lastAt, intervalMinutes: jev.interval_minutes,
      now, foreground: true, isPrivate: false })) return;
    // M1 observation: address (origin, path, title) only. An `outline` rule is
    // capped by building the request from a copy whose level is `address`, so
    // the request never claims an outline it does not carry. The builder is never
    // given screenAvailable or an image: no screenshot is taken here.
    const level = observationOf(rule, target.host);
    const capped = level === "outline" && !OUTLINE_SUPPORTED;
    const day = today(now);
    let request = null;
    try {
      request = core.buildSiteRuleRequest({ rule: capped ? { ...rule, observation: "address" } : rule,
        contextType: target.contextType, checkpoint: kind,
        elapsed: { today_ms: Math.round(usageToday(rule, day)),
          foreground_session_ms: segment?.tab === tab ? Math.max(0, now - segment.sessionStart) : 0 },
        // Only the current document's own title (browser.contentTitle is the
        // current window global's documentTitle); never tab.label, which can
        // still show the previous page while a new document loads.
        observation: { url: tab.linkedBrowser.currentURI.spec, title: String(tab.linkedBrowser.contentTitle ?? "") },
        requestId: requestId(), now });
    } catch { request = null; }
    if (!request) return;
    if (!indicatorMounted()) { diagnostics.indicatorSkipped++; return; }
    const requestLevel = request.state.observation.level;
    const documentEpoch = documentOf(tab);
    const controller = new AbortController();
    // This request's own sending checkpoint, run synchronously by the shared
    // host right before the hand-off: still this window's foreground tab and
    // document, the same settled policy, space, rule, provider and level, Jev
    // consent and key, a nonzero process limit and the visible indicator.
    const stillCurrent = () => {
      try {
        if (disposed || controller.signal.aborted || epoch !== policyEpoch || !policySettled() || !bound()
          || adapter.isPrivateWindow() !== false || tab !== gBrowser.selectedTab || !foreground() || documentOf(tab) !== documentEpoch) return false;
        const now = targetFor(tab);
        const current = now && now.host === target.host && now.contextUuid === target.contextUuid ? jevRule(now) : null;
        return !!current && current.id === rule.id && providerOf(current) === "jev" && observationOf(current, target.host) === level
          && indicatorMounted() && runtime.budget.limit() > 0;
      } catch { return false; }
    };
    const beforeSending = handoff => {
      if (handoff?.request_id !== request.request_id || handoff?.level !== requestLevel || !stillCurrent()) {
        diagnostics.sendingRefused++;
        return false;
      }
      showOutgoing("sending");
      return visible(outgoing) && stillCurrent();
    };
    // A lease is only ever registered under the revision this checkpoint read.
    if (!bound()) { diagnostics.policyUnsettled++; return; }
    let lease;
    try { lease = runtime.registerLease({ requestId: request.request_id, level: requestLevel, beforeSending }); }
    catch { diagnostics.leaseRefused++; return; } // process policy unready or invalidated: nothing is charged
    // Charged once, here; never again at sending and never refunded.
    let reserved = null;
    try { reserved = runtime.budget.reserve(); } catch { reserved = null; }
    if (!reserved?.ok) { lease.revoke(); diagnostics.budgetSkipped++; return; } // no queue, no retry
    if (capped) diagnostics.outlineCapped++;
    state.lastAt = now;
    state.controller?.abort(); // one in-flight request per tab
    state.controller = controller;
    // Cancelling this request revokes its lease, also when already aborted.
    const forward = () => lease.revoke();
    controller.signal.addEventListener("abort", forward, { once: true });
    // Pre-call notice: shown before anything can leave chrome, for every call.
    sendingCount++;
    showOutgoing("sending");
    if (!visible(outgoing)) {
      sendingCount--; showOutgoing("idle");
      controller.signal.removeEventListener("abort", forward);
      lease.revoke();
      if (state.controller === controller) state.controller = null;
      diagnostics.indicatorSkipped++;
      return;
    }
    diagnostics.decideCalls++;
    controllers.add(controller);
    let result = null, leaseLost = true;
    try {
      // The lease is kept through the host's reply or cancellation grace.
      result = await runtime.decide(request, { signal: lease.signal });
      // A process policy invalidation (a rule or Jev settings write that began
      // meanwhile, before this window's own reload) or this request's own
      // cancellation revoked the lease: the answer is no longer current.
      leaseLost = lease.signal.aborted;
    } catch { result = null; } finally {
      controller.signal.removeEventListener("abort", forward);
      lease.revoke();
    }
    controllers.delete(controller);
    sendingCount--;
    lastJev = { at: clock(), level: request.state.observation.level, dataSent: result?.data_sent === true };
    if (result?.data_sent === true) { diagnostics.dataSent++; showOutgoing("sent"); } else showOutgoing("idle");
    if (state.controller === controller) state.controller = null;
    if (result?.reason === "disabled") { jevKeyMissing = true; return; } // no key: stop until settings change
    // Disclosure above is kept; a stale answer applies no effect.
    if (disposed || controller.signal.aborted || leaseLost || !jev.consent || !result || result.request_id !== request.request_id) return;
    // Jev provenance only: an answer naming another provider never applies a Jev outcome.
    if (result.provider !== undefined && result.provider !== "jev") return;
    applyJevResult(tab, rule.id, target, result, epoch);
  }

  function applyJevResult(tab, ruleId, target, result, epoch) {
    // Re-validate at apply time (decision-v1 §Result): the snapshot the request was
    // sent under must still be the settled one (a reload meanwhile, pending or
    // done, drops the answer even if the rule ID remains), and the rule must still
    // be one this runtime would ask Jev about. A switch to OpenAI, a screenshot,
    // level none or no effects meanwhile drops the answer too.
    if (epoch !== policyEpoch || !policySettled()) return;
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || tab !== gBrowser.selectedTab || !foreground()
      || !askable(rule, target.host) || !servable(rule, target.host)) return;
    const now = targetFor(tab);
    if (!now || now.host !== target.host || now.contextUuid !== target.contextUuid || !now.rules.some(r => r.id === ruleId)) return;
    let evaluation = null;
    try { evaluation = core.applyJevOutcome(rule, result.outcome, result.reason_code ?? null); } catch { return; }
    if (!evaluation || evaluation.effect === "none") return;
    applyEffect(tab, rule, evaluation, now);
  }

  // ---- Wiring ------------------------------------------------------------------------------
  const progress = {
    onLocationChange(browser, webProgress, _request, _location, flags) {
      if (!webProgress?.isTopLevel || (flags & WPL.LOCATION_CHANGE_SAME_DOCUMENT)) return;
      const tab = gBrowser.getTabForBrowser(browser);
      if (!tab) return;
      documentEpochs.set(tab, documentOf(tab) + 1); // a checkpoint awaiting for the previous document is void
      jevTabs.get(tab)?.controller?.abort();
      pendingCommits.delete(tab); // a new document replaces any commit still waiting
      if (tab === gBrowser.selectedTab) syncSegment();
      const target = evaluate(tab);
      // The commit checkpoint runs once this document has loaded (onStateChange),
      // only if the tab is still in front and still on this document.
      if (target?.rules.length && !(flags & WPL.LOCATION_CHANGE_ERROR_PAGE) && tab === gBrowser.selectedTab)
        pendingCommits.set(tab, { spec: browser.currentURI?.spec ?? null });
    },
    onStateChange(browser, webProgress, _request, flags, status) {
      if (!webProgress?.isTopLevel || !(flags & WPL.STATE_STOP) || !(flags & WPL.STATE_IS_WINDOW)) return;
      const tab = gBrowser.getTabForBrowser(browser);
      const pendingCommit = tab && pendingCommits.get(tab);
      if (!pendingCommit) return;
      pendingCommits.delete(tab);
      if (status !== 0 || tab !== gBrowser.selectedTab || !pendingCommit.spec || browser.currentURI?.spec !== pendingCommit.spec) return;
      checkpoint(tab, "commit").catch(() => {});
    },
  };
  cleanups.push(addTabsProgressListener(window, progress));

  const onTabSelect = () => {
    syncSegment();
    const tab = gBrowser.selectedTab;
    for (const waiting of [...pendingCommits.keys()]) if (waiting !== tab) pendingCommits.delete(waiting); // went background
    evaluate(tab);
    displayed.get(tab)?.pause?.focus(); // a paused tab brought forward gets focus in its interstitial
    checkpoint(tab, "interval").catch(() => {});
  };
  const onTabClose = event => {
    const tab = event.target;
    jevTabs.get(tab)?.controller?.abort();
    pendingCommits.delete(tab);
    clearEffect(tab);
    if (segment?.tab === tab) syncSegment();
  };
  gBrowser.tabContainer.addEventListener("TabSelect", onTabSelect);
  gBrowser.tabContainer.addEventListener("TabClose", onTabClose);
  const onActivate = () => { focused = true; syncSegment(); };
  const onDeactivate = () => { focused = false; syncSegment(); };
  const onSizeMode = () => {
    minimized = window.STATE_MINIMIZED !== undefined && window.windowState === window.STATE_MINIMIZED;
    syncSegment();
  };
  const onVisibility = () => syncSegment();
  window.addEventListener("activate", onActivate);
  window.addEventListener("deactivate", onDeactivate);
  window.addEventListener("sizemodechange", onSizeMode);
  document.addEventListener("visibilitychange", onVisibility);
  cleanups.push(() => {
    gBrowser.tabContainer.removeEventListener("TabSelect", onTabSelect);
    gBrowser.tabContainer.removeEventListener("TabClose", onTabClose);
    window.removeEventListener("activate", onActivate);
    window.removeEventListener("deactivate", onDeactivate);
    window.removeEventListener("sizemodechange", onSizeMode);
    document.removeEventListener("visibilitychange", onVisibility);
  });
  cleanups.push(idle.subscribe(IDLE_SECONDS, value => { userIdle = value; syncSegment(); }));
  cleanups.push(adapter.onChange(() => { syncSegment(); evaluate(gBrowser.selectedTab); }));

  // Each load is the latest of its source only until another starts; a superseded
  // (late) answer publishes nothing, and a failed or incomplete read keeps the
  // decision layer unavailable (deterministic limits keep the last installed data).
  async function loadRules() {
    const id = beginPolicyLoad("rules");
    const generation = processGeneration;
    const revision = processRevision();
    let list = null, settings = null, listRead = false, settingsRead = false;
    try { list = await services.listRules(); listRead = true; } catch {}
    try { settings = await services.getJevSettings(); settingsRead = true; } catch {}
    if (disposed || id !== policyLoads.rules.latest) return;
    const validSettings = settingsRead && !!settings && typeof settings === "object";
    if (listRead) rules = Array.isArray(list) ? list : [];
    if (validSettings) jev = { ...jev, ...settings };
    jevKeyMissing = false;
    // A process invalidation during this read: it may predate that write, so
    // decisions wait for the write's own "rules" reload.
    policyLoads.rules.settled = listRead && Array.isArray(list) && validSettings && generation === processGeneration;
    // Decisions also need the exact ready revision this read began and ended
    // under; begun while unready, or across a publication, it binds none.
    policyLoads.rules.revision = policyLoads.rules.settled && revision !== null && processRevision() === revision ? revision : null;
    // Consent revoked: calls already in flight are cancelled and their answers dropped.
    if (!jev.consent) for (const controller of [...controllers]) controller.abort();
  }
  async function loadContexts() {
    const id = beginPolicyLoad("contexts");
    let list = null, listRead = false;
    try { list = await services.listContexts(); listRead = true; } catch {}
    if (disposed || id !== policyLoads.contexts.latest) return;
    if (listRead) contexts = Array.isArray(list) ? list : [];
    policyLoads.contexts.settled = listRead && Array.isArray(list);
  }
  const reevaluate = () => { if (!disposed) for (const tab of new Set([gBrowser.selectedTab, ...displayed.keys()])) evaluate(tab); };
  cleanups.push(services.on("rules", () => { loadRules().then(reevaluate); }));
  cleanups.push(services.on("contexts", () => { loadContexts().then(reevaluate); }));
  cleanups.push(services.on("ledger", () => { loadSummary().then(() => updateIndicator(indicatorTarget && targetFor(gBrowser.selectedTab))); }));

  const tickTimer = timers.setInterval(() => {
    if (disposed) return;
    syncSegment();
    if (summary.day !== today(clock())) loadSummary().catch(() => {});
    if (!foreground()) return;
    const tab = gBrowser.selectedTab;
    evaluate(tab);
    checkpoint(tab, "interval").catch(() => {});
  }, TICK_INTERVAL_MS);
  const flushTimer = timers.setInterval(() => { flush().catch(() => {}); }, FLUSH_INTERVAL_MS);
  cleanups.push(() => { timers.clearInterval(tickTimer); timers.clearInterval(flushTimer); });

  const ready = Promise.all([loadRules(), loadContexts(), loadSummary()]).then(() => {
    if (disposed) return;
    syncSegment();
    evaluate(gBrowser.selectedTab);
  });

  return Object.freeze({
    ready,
    flush,
    evaluate: (tab = gBrowser.selectedTab) => evaluate(tab),
    checkpoint: (kind = "interval", tab = gBrowser.selectedTab) => checkpoint(tab, kind),
    diagnostics: () => ({ ...diagnostics, effects: [...diagnostics.effects], pendingMs: [...pending.values()].reduce((a, b) => a + b, 0),
      segment: segment ? { host: segment.host, contextUuid: segment.contextUuid } : null,
      displayed: [...displayed.values()].map(e => ({ rule_id: e.ruleId, effect: e.effect, source: e.source })),
      suppressions: activeSuppressions(clock()).map(s => ({ ...s })) }),
    async dispose() {
      if (disposed) return;
      disposed = true; // flush() below closes the running segment without opening a new one
      for (const controller of [...controllers]) controller.abort();
      pendingCommits.clear();
      const done = (async () => { await flushing?.catch(() => {}); await flush(); })().catch(() => {});
      for (const tab of [...displayed.keys()]) clearEffect(tab);
      for (const cleanup of cleanups.reverse()) { try { cleanup?.(); } catch {} }
      await done;
    },
  });
}
