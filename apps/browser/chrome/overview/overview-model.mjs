/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Pure, DOM-free logic for about:axiosozo. Loaded by the page and by Node
// tests. It converts between editor form state and contract records
// (site-rule-v1, context-v1 manifest). The services layer validates again
// with the contexts core; this module only gives early, readable feedback.
// No network, no clock, no randomness: callers pass them in.

export const CONTEXT_TYPES = Object.freeze(["personal", "organization", "project"]);
export const PROJECT_KINDS = Object.freeze(["web", "desktop", "library", "cli", "mobile"]);
export const ENGINES = Object.freeze(["firefox", "chromium"]);
export const SURFACE_KINDS = Object.freeze(["repository", "issues", "ci", "releases", "hosting",
  "analytics", "payments", "package", "docs", "dashboard", "store", "crash_reports", "other"]);
export const EFFECTS = Object.freeze(["nudge", "suggest_leave", "pause_site"]);
export const OVERRIDES = Object.freeze(["none", "confirm", "delay_10s"]);
export const OBSERVATIONS = Object.freeze(["none", "address", "outline", "screen"]);
// site-rule-v1 `provider`; a rule without one is judged by Jev.
export const DECISION_PROVIDERS = Object.freeze(["jev", "openai"]);
export const PROVIDER_LABELS = Object.freeze({ jev: "Jev", openai: "OpenAI" });
export const AGENT_ACCESS = Object.freeze(["none", "read", "act_with_confirmation"]);
export const WEEKDAYS = Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
export const LEDGER_RETENTION_DAYS = 90;
export const MAX_HOSTS = 32;
export const MAX_WINDOWS = 8;
export const MAX_INSTRUCTION = 2000;

export const OBSERVATION_LABELS = Object.freeze({
  none: "Nothing", address: "The address", outline: "An outline of the page", screen: "A screenshot of the tab",
});
export const OBSERVATION_TEXT = Object.freeze({
  none: "Nothing leaves this machine. Only the local limits and allowed hours apply.",
  address: "When Jev is consulted: the site origin, the path (never the query or fragment) and the page title, with this rule's instruction and effects.",
  outline: "Reserved for page outlines (headings, link texts and form labels with opaque IDs; never form values, passwords, cross-origin frames, selections or private windows). This build sends the Address level only.",
  screen: "For OpenAI only: the address plus a screenshot of the visible tab. Not available in this build: no screenshot is taken and nothing is sent for this level.",
});
export const SENSITIVE_CAP_TEXT = "Banking, government, health, identity and password-manager sites are capped at Address unless you raise the level for that host below.";
export const SCREEN_CAP_TEXT = "A screenshot is never taken on banking, government, health, identity and password-manager sites: at most the address is used there, even where Outline was raised.";
export const PROVIDER_TEXT = Object.freeze({
  jev: "Uses your Jev key and the Jev consent under AI & keys.",
  openai: "Not available in this build: OpenAI has no consent setting yet and its decision format is not verified, so this rule sends nothing to OpenAI.",
});
// Product decision calls are NOT_AUTHORIZED in this build (decision-v1).
export const DECISIONS_UNAVAILABLE = "Decision calls are not available in this build, so nothing leaves this Mac for judgement yet.";
export const RULE_DATA_TEXT = `Data can only leave this Mac for Jev when Jev consent is on in AI & keys, a Jev key is stored in the macOS Keychain, and this rule has a level above Nothing and at least one effect; every call shows the outgoing-data indicator in the address bar. ${DECISIONS_UNAVAILABLE}`;
export const EFFECT_TEXT = Object.freeze({
  nudge: "Nudge: a small notice you can dismiss.",
  suggest_leave: "Suggest leaving: offers to save the page and close the tab.",
  pause_site: "Pause site: a browser-owned pause page with the continue friction below.",
});
export const OVERRIDE_TEXT = Object.freeze({
  none: "Continue immediately",
  confirm: "Confirm before continuing",
  delay_10s: "Wait 10 seconds before continuing",
});
// Exactly the conditions SiteRuleRuntime and the provider host enforce; keep in step with them.
export const JEV_STATEMENT = "Jev is called only when all three are true: you turned on consent below, a Jev key is stored in the macOS Keychain, and a site rule has an observation level above None and at least one effect. Otherwise site rules run on this machine only (limits and allowed hours) and nothing is sent. Consent is off until you turn it on.";
export const JEV_SENT_TEXT = "What leaves this machine on each Jev call: the page origin and path (never the query or fragment), the page title, the rule's id, instruction and effects, the context type, today's time on the site and the length of the current visit. Only for the tab in front of a focused, non-private window, within the hourly limit, and only while the outgoing-data indicator is shown in the address bar.";

/** Key status line for the Jev settings. The Overview cannot read the Keychain;
 * keyPresent is true/false only when a trusted source reported it. */
export function jevKeyNote({ keyEntryEnabled = false, keyPresent } = {}) {
  if (keyPresent === true) return "A Jev key is stored in the macOS Keychain, so Jev is called whenever consent is on and a rule allows it.";
  if (keyPresent === false) return "No Jev key is stored in the macOS Keychain, so no Jev calls are made even with consent on.";
  return keyEntryEnabled
    ? "This page cannot see whether a Jev key is stored in the macOS Keychain. If one is, Jev is called whenever consent is on and a rule allows it."
    : "Jev key entry is not available in this build. A Jev key that is already stored in the macOS Keychain is still used whenever consent is on and a rule allows it.";
}

const LOOPBACK_SERVICE_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
/** Only services on this machine are checked (AxioSozoServices.serviceStatus). */
export function isCheckedService(url) {
  try { return LOOPBACK_SERVICE_HOSTS.has(new URL(url).hostname); } catch { return false; }
}
export function serviceStatusText(service, status) {
  if (!isCheckedService(service?.url)) return "not checked (only services on this Mac are checked)";
  return status === "up" || status === "down" ? status : "not checked";
}
export const SERVICES_HELP = "Check services opens one connection to the declared port on this Mac (localhost, 127.0.0.1 or [::1]) and sends nothing. Remote services are never contacted.";

const HOST_PATTERN = /^(\*\.[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})+|[a-z0-9-]{1,63}(\.[a-z0-9-]{1,63})*)$/;
const TIME_OF_DAY = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
const ENV_NAME = /^[a-z][a-z0-9-]{0,31}$/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const WORKSPACE_UUID = /^\{?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}?$/;

export function isWorkspaceUuid(value) {
  return typeof value === "string" && WORKSPACE_UUID.test(value);
}

export function isHttpUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return false;
  let url;
  try { url = new URL(value); } catch { return false; }
  return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password;
}

function validName(value) {
  return typeof value === "string" && value.length >= 1 && value.length <= 80 && !CONTROL.test(value);
}

// ---------------------------------------------------------------- hosts

export function isHostPattern(value) {
  if (typeof value !== "string" || value.length > 253 || !HOST_PATTERN.test(value)) return false;
  const labels = value.replace(/^\*\./, "").split(".");
  return labels.every(label => !label.startsWith("-") && !label.endsWith("-"));
}

// Accepts "x.com", "*.x.com", "https://www.X.com/path" or "Bücher.example";
// returns a lower-case punycode host pattern, or null.
export function normalizeHost(input) {
  let text = String(input ?? "").trim().toLowerCase();
  if (!text) return null;
  let wildcard = false;
  if (text.startsWith("*.")) { wildcard = true; text = text.slice(2); }
  if (!/^[a-z][a-z0-9+.-]*:\/\//.test(text)) text = "http://" + text;
  let url;
  try { url = new URL(text); } catch { return null; }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;
  let host = url.hostname.replace(/\.$/, "");
  if (host.startsWith("[") || /^[0-9.]+$/.test(host)) return null;
  if (wildcard) host = "*." + host;
  return isHostPattern(host) ? host : null;
}

export function parseHosts(text) {
  const hosts = []; const errors = [];
  for (const part of String(text ?? "").split(/[\s,]+/)) {
    if (!part) continue;
    const host = normalizeHost(part);
    if (!host) errors.push(`"${part}" is not a host name such as example.com or *.example.com.`);
    else if (!hosts.includes(host)) hosts.push(host);
  }
  if (!hosts.length && !errors.length) errors.push("Add at least one host.");
  if (hosts.length > MAX_HOSTS) errors.push(`Use at most ${MAX_HOSTS} hosts per rule.`);
  return { hosts, errors };
}

// ---------------------------------------------------------------- site rules

export function newRuleId(randomBytes) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = Array.from(randomBytes ?? []);
  if (bytes.length < 8) throw new Error("newRuleId needs at least 8 random bytes");
  return "r_" + bytes.slice(0, 12).map(byte => alphabet[byte % alphabet.length]).join("");
}

export function emptyRuleForm() {
  return {
    id: null, enabled: true, hostsText: "", contextsMode: "all", contextTypes: [], contextWorkspaces: [],
    instruction: "", dailyMinutes: "", windows: [], observation: "none", raisedHosts: [],
    effects: ["nudge"], override: "confirm", agents: { access: "none", instruction: "" },
    provider: "jev", savedProvider: null, createdAt: null,
  };
}

export function ruleToForm(rule) {
  const contexts = rule.contexts === "all" || !rule.contexts ? null : rule.contexts;
  return {
    id: rule.id,
    enabled: rule.enabled !== false,
    hostsText: (rule.match?.hosts ?? []).join("\n"),
    contextsMode: contexts ? "selected" : "all",
    contextTypes: [...(contexts?.types ?? [])],
    contextWorkspaces: [...(contexts?.workspaces ?? [])],
    instruction: rule.instruction ?? "",
    dailyMinutes: rule.limits?.daily_minutes == null ? "" : String(rule.limits.daily_minutes),
    windows: (rule.limits?.allowed_hours ?? []).map(window => ({
      start: window.start, end: window.end, days: [...(window.days ?? [])],
    })),
    observation: rule.observation ?? "none",
    raisedHosts: [...(rule.observation_raised_hosts ?? [])],
    effects: [...(rule.effects ?? [])],
    override: rule.override ?? "confirm",
    agents: { access: rule.agents?.access ?? "none", instruction: rule.agents?.instruction ?? "" },
    // Shown as chosen; a rule saved without a provider (Jev) stays without one.
    provider: rule.provider === "openai" ? "openai" : "jev",
    savedProvider: DECISION_PROVIDERS.includes(rule.provider) ? rule.provider : null,
    createdAt: rule.created_at ?? null,
  };
}

// Manifest v3 shapes, checked again by the contexts core when the project is saved.
const validCommand = text => typeof text === "string" && text.length >= 1 && [...text].length <= 200 && !/[\u0000-\u001f\u007f-\u009f]/u.test(text);
const validFolder = text => typeof text === "string" && text.length <= 200 && !text.startsWith("/") && !text.includes("\\")
  && text.split("/").length <= 16 && text.split("/").every(part => part && part !== "." && part !== ".." && !/[\u0000-\u001f\u007f]/u.test(part));
const validIcon = text => validFolder(text) && !text.split("/").some(part => part.startsWith(".")) && /\.(png|svg|ico|webp|jpe?g)$/iu.test(text);

function parseInteger(text, min, max) {
  const trimmed = String(text ?? "").trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) && value >= min && value <= max ? value : null;
}

// → { rule, errors: [{ field, message }] }. `rule` is null when errors exist.
export function formToRule(form, { now, id }) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  const { hosts, errors: hostErrors } = parseHosts(form.hostsText);
  for (const message of hostErrors) add("hosts", message);

  let contexts = "all";
  if (form.contextsMode === "selected") {
    const types = CONTEXT_TYPES.filter(type => (form.contextTypes ?? []).includes(type));
    const workspaces = [...new Set(form.contextWorkspaces ?? [])];
    if (workspaces.some(uuid => !isWorkspaceUuid(uuid))) add("contexts", "A selected context is no longer valid.");
    if (!types.length && !workspaces.length) add("contexts", "Choose at least one context type or context, or apply the rule everywhere.");
    if (workspaces.length > 64) add("contexts", "Choose at most 64 contexts.");
    contexts = {};
    if (types.length) contexts.types = types;
    if (workspaces.length) contexts.workspaces = workspaces;
  }

  const instruction = String(form.instruction ?? "");
  if (instruction.length > MAX_INSTRUCTION) add("instruction", `Keep the instruction under ${MAX_INSTRUCTION} characters.`);

  let dailyMinutes = null;
  if (String(form.dailyMinutes ?? "").trim() !== "") {
    dailyMinutes = parseInteger(form.dailyMinutes, 1, 1440);
    if (dailyMinutes === null) add("daily_minutes", "Daily minutes must be a whole number from 1 to 1440, or empty for no limit.");
  }

  const windows = [];
  if ((form.windows ?? []).length > MAX_WINDOWS) add("allowed_hours", `Use at most ${MAX_WINDOWS} time windows.`);
  (form.windows ?? []).forEach((window, index) => {
    if (!TIME_OF_DAY.test(window.start ?? "") || !TIME_OF_DAY.test(window.end ?? "")) {
      add("allowed_hours", `Window ${index + 1}: enter a start and end time (HH:MM).`);
      return;
    }
    if (window.start === window.end) {
      add("allowed_hours", `Window ${index + 1}: start and end are the same.`);
      return;
    }
    const days = [...new Set((window.days ?? []).map(Number))]
      .filter(day => Number.isInteger(day) && day >= 0 && day <= 6).sort((a, b) => a - b);
    const record = { start: window.start, end: window.end };
    if (days.length && days.length < 7) record.days = days;
    windows.push(record);
  });

  if (!OBSERVATIONS.includes(form.observation)) add("observation", "Choose what may leave the machine.");
  const effects = EFFECTS.filter(effect => (form.effects ?? []).includes(effect));
  if (!OVERRIDES.includes(form.override)) add("override", "Choose how continuing works.");
  // Raising a sensitive host is for Outline only; it never allows a screenshot.
  const raised = form.observation === "outline"
    ? [...new Set(form.raisedHosts ?? [])].filter(host => hosts.includes(host)) : [];
  const provider = form.provider ?? "jev";
  if (!DECISION_PROVIDERS.includes(provider)) add("provider", "Choose Jev or OpenAI.");

  const access = AGENT_ACCESS.includes(form.agents?.access) ? form.agents.access : "none";
  const agentInstruction = String(form.agents?.instruction ?? "");
  if (agentInstruction.length > MAX_INSTRUCTION) add("agents", "The agent instruction is too long.");

  if (errors.length) return { rule: null, errors };
  if (!Number.isSafeInteger(now)) throw new Error("formToRule needs now");
  const ruleId = form.id ?? id;
  if (!/^r_[a-z0-9]{4,32}$/.test(ruleId ?? "")) throw new Error("formToRule needs a rule id");
  return {
    errors: [],
    rule: {
      version: 1,
      id: ruleId,
      enabled: form.enabled !== false,
      match: { hosts },
      contexts,
      instruction,
      limits: { daily_minutes: dailyMinutes, allowed_hours: windows.length ? windows : null },
      observation: form.observation,
      observation_raised_hosts: raised,
      effects,
      override: form.override,
      agents: { access, instruction: agentInstruction },
      created_at: form.createdAt ?? now,
      updated_at: now,
      // Written only when chosen or already saved: an omitted provider would be
      // kept from the stored rule, and a legacy rule keeps its exact v1 shape.
      ...(provider !== "jev" || form.savedProvider ? { provider } : {}),
    },
  };
}

export function describeRule(rule) {
  const parts = [];
  parts.push(rule.limits?.daily_minutes ? `${rule.limits.daily_minutes} min per day` : "no daily limit");
  const windows = rule.limits?.allowed_hours;
  if (windows?.length) parts.push("allowed " + windows.map(describeWindow).join(", "));
  parts.push(`observation: ${rule.observation}${rule.provider === "openai" && rule.observation !== "none" ? " (OpenAI)" : ""}`);
  parts.push(rule.effects?.length ? "effects: " + rule.effects.join(", ").replaceAll("_", " ") : "no effects");
  if (rule.contexts !== "all") {
    const scope = [...(rule.contexts?.types ?? [])];
    const count = rule.contexts?.workspaces?.length ?? 0;
    if (count) scope.push(`${count} space${count === 1 ? "" : "s"}`);
    parts.push("in " + scope.join(", "));
  }
  return parts.join(" · ");
}

export function describeWindow(window) {
  const days = window.days?.length ? " " + window.days.map(day => WEEKDAYS[day]).join("/") : "";
  return `${window.start}–${window.end}${days}`;
}

export function jevToForm(settings) {
  return {
    consent: settings?.consent === true,
    intervalMinutes: String(settings?.interval_minutes ?? 5),
    hourlyBudget: String(settings?.hourly_budget ?? 30),
  };
}

export function formToJevPatch(form) {
  const errors = [];
  const interval = parseInteger(form.intervalMinutes, 1, 30);
  const budget = parseInteger(form.hourlyBudget, 0, 30);
  if (interval === null) errors.push({ field: "interval_minutes", message: "Checkpoint interval must be 1 to 30 minutes." });
  if (budget === null) errors.push({ field: "hourly_budget", message: "Hourly budget must be 0 to 30 calls." });
  if (errors.length) return { patch: null, errors };
  return { errors, patch: { consent: form.consent === true, interval_minutes: interval, hourly_budget: budget } };
}

// ---------------------------------------------------------------- projects

export const PRIMARY_SURFACE_KINDS = Object.freeze(["repository", "package", "store"]);
const APP_NAME = /^[a-z0-9][a-z0-9._-]{0,39}$/;
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** "primary" (shown in the sidebar) or "secondary" (behind "…"), as the core decides. */
export function surfaceProminence(surface) {
  if (surface?.prominence === "primary" || surface?.prominence === "secondary") return surface.prominence;
  return PRIMARY_SURFACE_KINDS.includes(surface?.kind) ? "primary" : "secondary";
}

function portOf(text) {
  try {
    const url = new URL(text);
    return Number(url.port) || (url.protocol === "https:" ? 443 : 80);
  } catch { return null; }
}
function isLoopback(text) {
  try { return LOOPBACK_HOSTS.has(new URL(text).hostname); } catch { return false; }
}
const appOrNull = value => (typeof value === "string" && value ? value : null);
const trimSlash = text => String(text ?? "").replace(/\/+$/, "");

function reviewRow(item, keys) {
  const row = {};
  for (const key of keys) row[key] = item[key] == null ? "" : String(item[key]);
  row.source = item.source ?? "";
  row.guess = item.guess === true;
  return row;
}

function environmentRow(item) {
  const row = reviewRow(item, ["name"]);
  row.app = appOrNull(item.app);
  row.base_url = trimSlash(item.base_url);
  row.enabled = item.enabled !== false;
  // The port a declared local service followed at detection time: editing the
  // address moves that service along; unticking the environment drops it.
  row.servicePort = isLoopback(item.base_url) ? portOf(item.base_url) : null;
  return row;
}

// A service row: its address (optional since manifest v3), its start command
// and the folder that runs in, and whether it is kept.
function serviceRow(item) {
  return { ...reviewRow(item, ["name", "url", "port", "command", "cwd"]), app: appOrNull(item.app), enabled: item.enabled !== false };
}

/** Review state for the add-project sheet. contextUuid: the space it will live in. */
export function draftToReview(draft, { contextUuid = null } = {}) {
  const icon = typeof draft.icon?.path === "string" ? draft.icon : null;
  return {
    name: draft.name ?? "",
    kind: draft.kind ?? "web",
    kindSource: { source: draft.kind_source?.source ?? "", guess: draft.kind_source?.guess === true },
    icon: icon ? { path: icon.path, source: icon.source ?? "", guess: icon.guess === true } : null,
    contextUuid,
    productionUrl: "",
    environments: (draft.environments ?? []).map(environmentRow),
    services: (draft.services ?? []).map(serviceRow),
    surfaces: (draft.surfaces ?? []).map(item => ({ ...reviewRow(item, ["name", "url", "kind"]),
      prominence: surfaceProminence(item), enabled: true })),
    frameworks: [...(draft.frameworks ?? [])],
    filesRead: [...(draft.files_read ?? [])],
    refused: (draft.refused ?? []).map(item => ({ path: item.path, reason: item.reason })),
    warnings: [...(draft.warnings ?? [])],
    findings: detectionSummary(draft),
  };
}

// ---------------------------------------------------------------- detected (workstation-v1 §1)

export const PLATFORM_LABELS = Object.freeze({ tauri: "Desktop (Tauri)", electron: "Desktop (Electron)",
  macos: "macOS", ios: "iOS", android: "Android" });
export const DOCUMENTED_DOMAIN_NOTE = "Found in docs, unconfirmed";
export const PRESENCE_NOTE = "Agent files and app folders are noted by name only; they are not opened.";

const textOr = (value, fallback = "") => (typeof value === "string" ? value : fallback);
const listOf = value => (Array.isArray(value) ? value : []);

/** What static detection found besides environments and links: services
 * (integrations), native and mobile apps, production domains (documented ones
 * kept apart as unconfirmed) and agent presence. Takes a detection draft or a
 * project's `detected` snapshot; tolerant of null and partial data. Every
 * string is shown as text only. */
export function detectionSummary(detected) {
  const integrations = listOf(detected?.integrations).filter(item => textOr(item?.name)).map(item => ({
    id: textOr(item.id), name: item.name, url: isHttpUrl(item.dashboard_url) ? item.dashboard_url : null,
    sources: listOf(item.sources).filter(source => typeof source === "string"),
  }));
  const platforms = listOf(detected?.platforms).filter(item => Object.hasOwn(PLATFORM_LABELS, item?.kind)).map(item => {
    const name = textOr(item.name);
    return { kind: item.kind, label: name ? `${PLATFORM_LABELS[item.kind]} · ${name}` : PLATFORM_LABELS[item.kind],
      path: textOr(item.path), source: textOr(item.source) };
  });
  const domains = listOf(detected?.domains).filter(item => textOr(item?.host));
  const domainRow = item => ({ host: item.host, source: textOr(item.source) });
  const configuredDomains = domains.filter(item => item.origin !== "docs").map(domainRow);
  const documentedDomains = domains.filter(item => item.origin === "docs").map(domainRow);
  const worktrees = Number.isSafeInteger(detected?.agents?.worktrees) && detected.agents.worktrees > 0 ? detected.agents.worktrees : 0;
  const agents = [...listOf(detected?.agents?.files), ...listOf(detected?.agents?.dirs)]
    .filter(name => typeof name === "string" && name)
    .map(name => (name === ".agent-worktrees" && worktrees ? `${worktrees} agent worktree${worktrees === 1 ? "" : "s"}` : name));
  return {
    integrations, platforms, configuredDomains, documentedDomains, agents,
    empty: !integrations.length && !platforms.length && !domains.length && !agents.length,
  };
}

/** Readable text for service and actor error codes the page can show. */
export const ERROR_TEXT = Object.freeze({
  READ_CONTAINMENT_UNAVAILABLE: "This build cannot read project folders safely, so nothing was read.",
  ROOT_DENIED: "AxioSozo does not read this folder: it holds settings, keys or a browser profile, not a project.",
  ROOT_CHANGED: "The folder changed while it was being read. Try again.",
  ROOT_NOT_FOUND: "That folder no longer exists.",
  ROOT_NOT_DIRECTORY: "That is not a folder.",
  INVALID_ROOT: "That folder cannot be used.",
  PROJECT_EXISTS: "This folder is already a project.",
  UNKNOWN_PROJECT: "That project no longer exists.",
  ROOT_NOT_PICKED: "Choose the folder with the folder picker first.",
  // P2: project containers, account labels and shared sites.
  PROJECT_CHANGED: "The project or its container changed meanwhile. Nothing was opened; try again.",
  IDENTITY_UNAVAILABLE: "The project's container is not available right now. Nothing was opened; try again.",
  IDENTITY_RESET_PENDING: "Containers were just reset and are still being cleaned up. Nothing was opened; try again shortly.",
  CONTAINERS_UNAVAILABLE: "Project containers are not available in this build, so the link was not opened.",
  BUSY: "Too many project containers are being prepared. Try again in a moment.",
  NO_WINDOW: "Open this page in a browser window first.",
  INVALID_INPUT: "Check the account label: 1 to 80 characters on one line.",
  INVALID_HOST_PATTERN: "That is not a site such as example.com or *.example.com.",
  INVALID_PROJECT: "That would not fit the project: at most 32 sites and 32 account labels, each listed once.",
  // P3: agents.
  PRIVATE_WINDOW: "Agents are managed from a normal window, never a private one.",
  DOCUMENT_GONE: "This page changed while AxioSozo answered. Nothing was shown; try again.",
  AGENT_CHANNEL_UNAVAILABLE: "Agent status is not available in this build.",
});
export function errorMessage(code) {
  return typeof code === "string" && Object.hasOwn(ERROR_TEXT, code) ? ERROR_TEXT[code] : null;
}

export function projectToReview(project) {
  const manifest = project.manifest;
  const confirmed = item => ({ ...item, source: "confirmed", guess: false });
  return draftToReview({
    name: manifest.name, kind: manifest.kind, kind_source: { source: "confirmed", guess: false },
    icon: typeof manifest.icon === "string" ? { path: manifest.icon, source: "confirmed", guess: false } : null,
    environments: manifest.environments.map(confirmed),
    services: manifest.services.map(confirmed),
    surfaces: manifest.surfaces.map(confirmed),
  }, { contextUuid: project.context_uuid ?? null });
}

/** Apps of a review in first-seen order (null = project-wide). */
export function reviewApps(review) {
  return [...new Set((review.environments ?? []).map(row => appOrNull(row.app)))];
}

/** Environment rows grouped per app for the sheet; `index` points into review.environments. */
export function environmentGroups(review) {
  const apps = reviewApps(review);
  const multi = apps.filter(Boolean).length > 1;
  return apps.map(app => ({
    app,
    label: !multi ? null : app === null ? "Whole project" : app === "desktop" ? "Desktop app (desktop)" : `App ${app}`,
    rows: (review.environments ?? []).map((row, index) => ({ row, index })).filter(({ row }) => appOrNull(row.app) === app),
  }));
}

/** The app a single "Production URL" belongs to (same rule as the core's mainWebApp). */
export function productionApp(environments) {
  if (!environments.some(env => env.app)) return null;
  const local = environments.filter(env => env.name === "local" && env.app);
  return (local.find(env => env.app !== "desktop") ?? local[0])?.app ?? null;
}

function normalizeBaseUrl(text) {
  if (!isHttpUrl(text)) return null;
  const url = new URL(text);
  if (url.search || url.hash || text.includes("?") || text.includes("#")) return null;
  const path = url.pathname.replace(/\/+$/, "");
  return url.origin + path;
}

function normalizeWebUrl(text) {
  if (!isHttpUrl(text) || text.includes("#") || text.includes("?")) return null;
  return new URL(text).href;
}

const isBlank = (row, keys) => keys.every(key => String(row[key] ?? "").trim() === "");
const withApp = (record, app) => (app ? { ...record, app } : record);

// → { manifest, errors }. Unticked and empty rows are dropped; everything else
// must be valid. Local services follow their environments (see environmentRow);
// every local environment gets a service so the sidebar can show its dot.
export function reviewToManifest(review) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  const name = String(review.name ?? "").trim();
  if (!validName(name)) add("name", "Project name must be 1 to 80 characters.");
  if (!PROJECT_KINDS.includes(review.kind)) add("kind", "Choose a project kind.");

  const environments = [];
  const moved = []; // { app, from, to: { port, origin } | null }
  const key = (app, envName) => `${app ?? ""}\u0000${envName}`;
  (review.environments ?? []).forEach((row, index) => {
    const app = appOrNull(row.app);
    if (row.enabled === false) {
      if (row.servicePort) moved.push({ app, from: row.servicePort, to: null });
      return;
    }
    if (isBlank(row, ["name", "base_url"])) return;
    const envName = String(row.name ?? "").trim();
    const baseUrl = normalizeBaseUrl(String(row.base_url ?? "").trim());
    if (app !== null && !APP_NAME.test(app)) add("environments", `Environment ${index + 1}: the app name is not valid.`);
    if (!ENV_NAME.test(envName)) add("environments", `Environment ${index + 1}: use a lower-case name such as local, preview or production.`);
    else if (environments.some(env => key(env.app, env.name) === key(app, envName))) {
      add("environments", `Environment ${index + 1}: "${app ? `${app} · ` : ""}${envName}" is listed twice.`);
    }
    if (!baseUrl) add("environments", `Environment ${index + 1}: enter an http or https address without query or fragment.`);
    if (ENV_NAME.test(envName) && baseUrl) {
      environments.push(withApp({ name: envName, base_url: baseUrl }, app));
      if (row.servicePort && isLoopback(baseUrl)) moved.push({ app, from: row.servicePort, to: { port: portOf(baseUrl), origin: new URL(baseUrl).origin } });
      else if (row.servicePort) moved.push({ app, from: row.servicePort, to: null });
    }
  });

  const production = String(review.productionUrl ?? "").trim();
  if (production) {
    const baseUrl = normalizeBaseUrl(production);
    if (!baseUrl) add("production_url", "Production URL: enter an http or https address without query or fragment, or leave it empty.");
    else {
      // The app is chosen from every detected environment, ticked or not, so
      // unticking the web app's local server keeps production on the web app.
      const app = productionApp((review.environments ?? []).map(row => ({ name: String(row.name ?? "").trim(), app: appOrNull(row.app) })));
      const record = withApp({ name: "production", base_url: baseUrl }, app);
      const at = environments.findIndex(env => key(env.app, env.name) === key(app, "production"));
      if (at >= 0) environments[at] = record; else environments.push(record);
    }
  }
  if (environments.length > 16) add("environments", "Use at most 16 environments.");

  const services = [];
  (review.services ?? []).forEach((row, index) => {
    if (row.enabled === false || isBlank(row, ["name", "url", "port", "command"])) return;
    const app = appOrNull(row.app);
    const serviceName = String(row.name ?? "").trim();
    const label = validName(serviceName) ? serviceName : `Service ${index + 1}`;
    const command = String(row.command ?? "").trim().replace(/\s+/g, " ");
    const cwd = String(row.cwd ?? "").trim().replace(/^\.\/+/, "").replace(/\/+$/, "");
    if (!validName(serviceName)) add("services", `Service ${index + 1}: enter a name.`);
    if (command && !validCommand(command)) add("services", `${label}: the start command must be one line of at most 200 characters.`);
    if (cwd && !validFolder(cwd)) add("services", `${label}: the folder must be a path inside the project, such as apps/web.`);
    const start = command ? { command, ...(cwd ? { cwd } : {}) } : {};
    if (isBlank(row, ["url", "port"])) {
      // Manifest v3: a service with a start command only (a desktop app, a worker).
      if (!command) add("services", `${label}: enter a start command or an address.`);
      else if (validName(serviceName) && validCommand(command) && (!cwd || validFolder(cwd))) services.push(withApp({ name: serviceName, ...start }, app));
      return;
    }
    const url = normalizeWebUrl(String(row.url ?? "").trim());
    const port = isBlank(row, ["port"]) && url ? portOf(url) : parseInteger(row.port, 1, 65535);
    if (!url) add("services", `${label}: enter an http or https address without query or fragment.`);
    if (port === null) add("services", `${label}: port must be 1 to 65535.`);
    if (!validName(serviceName) || !url || port === null || (command && !validCommand(command)) || (cwd && !validFolder(cwd))) return;
    const move = moved.find(item => item.app === app && item.from === port)
      ?? (app === null ? null : moved.find(item => item.app === null && item.from === port));
    if (move && !move.to) return; // its address was unticked
    if (move && move.to.port !== port) {
      services.push(withApp({ name: serviceName, url: `${move.to.origin}/`, port: move.to.port, ...start }, app));
      return;
    }
    services.push(withApp({ name: serviceName, url, port, ...start }, app));
  });
  for (const env of environments) {
    if (!isLoopback(env.base_url)) continue;
    const port = portOf(env.base_url);
    if (services.some(service => service.port === port && (service.app ?? null) === (env.app ?? null))) continue;
    if (services.some(service => service.port === port)) continue;
    services.push(withApp({ name: env.app ? `${env.app} dev server` : "Dev server", url: `${new URL(env.base_url).origin}/`, port }, env.app));
  }
  if (services.length > 32) add("services", "Use at most 32 services.");

  const surfaces = [];
  (review.surfaces ?? []).forEach((row, index) => {
    if (row.enabled === false || isBlank(row, ["name", "url"])) return;
    const surfaceName = String(row.name ?? "").trim();
    const url = normalizeWebUrl(String(row.url ?? "").trim());
    const kind = SURFACE_KINDS.includes(row.kind) ? row.kind : null;
    if (!validName(surfaceName)) add("surfaces", `Surface ${index + 1}: enter a name.`);
    if (!url) add("surfaces", `Surface ${index + 1}: enter an http or https address without query or fragment.`);
    if (!kind) add("surfaces", `Surface ${index + 1}: choose a kind.`);
    if (validName(surfaceName) && url && kind) {
      const surface = { name: surfaceName, url, kind };
      // Written only where it differs from the default for the kind.
      const prominence = row.prominence === "primary" || row.prominence === "secondary" ? row.prominence : null;
      if (prominence && prominence !== surfaceProminence({ kind })) surface.prominence = prominence;
      surfaces.push(surface);
    }
  });
  if (surfaces.length > 64) add("surfaces", "Use at most 64 surfaces.");

  const icon = typeof review.icon?.path === "string" && review.icon.enabled !== false ? review.icon.path : null;
  if (icon !== null && !validIcon(icon)) add("icon", "The icon must be an image file inside the project folder.");
  if (errors.length) return { manifest: null, errors };
  const v2 = [...environments, ...services].some(item => item.app) || surfaces.some(item => item.prominence);
  const v3 = icon !== null || services.some(item => item.command || !item.url);
  return { errors, manifest: { version: v3 ? 3 : v2 ? 2 : 1, name, kind: review.kind, ...(icon !== null ? { icon } : {}),
    environments, services, surfaces } };
}

// ---------------------------------------------------------------- project setup (workstation-v1 §1.5, understand-v1 §3.3)

/** The project types, as the setup sheet offers them. */
export const KIND_CHOICES = Object.freeze([["web", "Web app"], ["desktop", "Desktop app"], ["mobile", "Mobile app"],
  ["cli", "Command line"], ["library", "Library"]]);
export const SETUP_CLI_LABELS = Object.freeze({ codex: "Codex", "claude-code": "Claude Code" });
// Service names detection gives when it knows nothing better; an assistant's names replace them.
const GENERIC_SERVICE_NAMES = new Set(["Dev server", "Dev command", "Desktop app", "Mobile app", "Command line", "service"]);

/** The folder's last segment (the name shown while it is being read). */
export function folderName(root) {
  const parts = String(root ?? "").split("/").filter(Boolean);
  return parts.at(-1) ?? "";
}

/** A long path shortened in the middle for one line: the start and the last two folders. */
export function shortPath(root, max = 56) {
  const text = String(root ?? "");
  if ([...text].length <= max) return text;
  const parts = text.split("/");
  const tail = parts.slice(-2).join("/");
  return `${parts.slice(0, 3).join("/")}/…/${tail}`;
}

/** One line for the sheet's setup status, or null to show nothing. `check` is
 * { phase: "reading" | "checking" | "done" | "failed" | "off", cli, changes }. */
export function setupStatus(check) {
  const who = SETUP_CLI_LABELS[check?.cli] ?? "The assistant";
  switch (check?.phase) {
    case "reading": return { tone: "busy", text: "Reading the folder…" };
    case "checking": return { tone: "busy", text: check.cli ? `${who} is checking how this project starts…` : "Checking how this project starts…" };
    case "done": return { tone: "good", text: check.changes > 0 ? `Checked by ${who}. ${check.changes} ${check.changes === 1 ? "suggestion" : "suggestions"} applied.` : `Checked by ${who}. Nothing to change.` };
    case "failed": return { tone: "quiet", text: `${who} could not check this folder. What was found is below.` };
    default: return null;
  }
}

/**
 * Applies an assistant's setup document to the review, leaving every field the
 * user already changed (`touched`: "name", "kind", "icon", "service:<index>")
 * alone. Returns what changed, for the status line. The document is inert data:
 * commands are text the user may keep or edit, never run.
 */
export function applySetup(review, doc, { touched = new Set(), cli = null } = {}) {
  const changes = [];
  if (!doc || typeof doc !== "object") return changes;
  const who = SETUP_CLI_LABELS[cli] ?? "assistant";
  const source = `${who} setup check`;
  if (!touched.has("kind") && PROJECT_KINDS.includes(doc.kind)) {
    if (doc.kind !== review.kind) changes.push("kind");
    review.kind = doc.kind;
    review.kindSource = { source: doc.kind_reason ? `${who}: ${doc.kind_reason}` : source, guess: false };
  }
  if (!touched.has("name") && validName(doc.name ?? "") && doc.name !== review.name) { review.name = doc.name; changes.push("name"); }
  if (!touched.has("icon") && typeof doc.icon === "string" && validIcon(doc.icon) && doc.icon !== review.icon?.path) {
    review.icon = { path: doc.icon, source, guess: false, previous: review.icon ?? null };
    changes.push("icon");
  }
  for (const item of Array.isArray(doc.services) ? doc.services : []) {
    if (!validCommand(item?.command ?? "")) continue;
    const port = item.url && isLoopback(item.url) ? portOf(item.url) : null;
    const index = review.services.findIndex(row => (port !== null && Number(row.port) === port) || (row.command && row.command === item.command));
    if (index >= 0) {
      if (touched.has(`service:${index}`)) continue;
      const row = review.services[index];
      const before = JSON.stringify([row.name, row.command, row.cwd]);
      if (GENERIC_SERVICE_NAMES.has(row.name) && validName(item.name)) row.name = item.name;
      row.command = item.command;
      row.cwd = item.cwd ?? "";
      row.guess = false;
      if (JSON.stringify([row.name, row.command, row.cwd]) !== before) changes.push("service");
      continue;
    }
    if (review.services.length >= 32) break;
    review.services.push({ name: validName(item.name) ? item.name : "Service", url: port !== null ? new URL(item.url).origin + "/" : "",
      port: port !== null ? String(port) : "", command: item.command, cwd: item.cwd ?? "", app: null, source, guess: false, enabled: true, suggested: true });
    changes.push("service");
    // A local address the assistant found also links tabs on it to the project.
    if (port !== null && !review.environments.some(row => isLoopback(row.base_url) && portOf(row.base_url) === port)) {
      const taken = new Set(review.environments.filter(row => row.app === null).map(row => row.name));
      const base = String(item.name).toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^[^a-z]+|-+$/g, "").slice(0, 32) || "local";
      const name = !taken.has("local") ? "local" : !taken.has(base) ? base : `local-${port}`;
      if (ENV_NAME.test(name) && !taken.has(name)) review.environments.push({ app: null, name, base_url: new URL(item.url).origin,
        source, guess: false, enabled: true, servicePort: port });
    }
  }
  return changes;
}

export const REFUSAL_TEXT = Object.freeze({
  not_allowlisted: "not on the detection allowlist",
  too_large: "larger than 256 KiB",
  symlink_outside_root: "a link that leaves the project folder",
  not_regular_file: "not a regular file",
  unreadable: "could not be read",
  invalid_utf8: "not valid text",
});

// ---------------------------------------------------------------- accounts per project (workstation-v1 §2–§3)

// Same lists as the contexts core (DEFAULT_SHARED_SITES, INTEGRATIONS); the page
// does not load the core. overview-model.test.mjs keeps them equal.
export const DEFAULT_SHARED_SITES = Object.freeze(["github.com", "*.github.com", "gitlab.com", "bitbucket.org",
  "npmjs.com", "*.npmjs.com", "stackoverflow.com", "developer.mozilla.org"]);
export const INTEGRATION_NAMES = Object.freeze({ vercel: "Vercel", convex: "Convex", clerk: "Clerk", stripe: "Stripe",
  supabase: "Supabase", firebase: "Firebase", cloudflare: "Cloudflare", netlify: "Netlify", fly: "Fly.io", sentry: "Sentry" });
// Firefox's canonical container colours (usercontext.css .identity-color-*).
export const CONTAINER_COLORS = Object.freeze(["gray", "yellow", "orange", "red", "pink", "purple", "violet", "blue", "cyan", "green"]);
export const MAX_ACCOUNTS = 32;
export const MAX_SHARED_SITES = 32;
export const ACCOUNT_LABEL_MAX = 80;
export const ACCOUNTS_NOTE = "Only you type these labels. AxioSozo never reads accounts, cookies or passwords from pages.";
export const SHARED_SITES_NOTE = "These sites use the space's own sign-ins instead of the project's container, for example GitHub with one account everywhere. Nothing is shared until you turn sharing on.";
export const CHROMIUM_SIGN_INS_NOTE = "Firefox tabs only. Chromium tabs do not have per-project sign-ins yet.";

/** The Sign-ins line of a project card, from listProjectContainers(); null
 * when nothing is known (the row is left out). */
export function containerSummary(info) {
  const quiet = text => ({ state: info.state, text, name: null, color: null });
  switch (info?.state) {
    case "own": return { state: "own", text: "Own container", name: textOr(info.name) || null,
      color: CONTAINER_COLORS.includes(info.color) ? info.color : null };
    case "pending": return quiet("Own container, made when you first open one of its links");
    case "off": return quiet("Containers are off in this browser, so links use the space's sign-ins");
    case "unavailable": return quiet("Containers are being reset; project links open again shortly");
    default: return null;
  }
}

const hostList = (hosts, shown = 3) => (hosts.length <= shown ? hosts.join(", ")
  : `${hosts.slice(0, shown).join(", ")} and ${hosts.length - shown} more`);

/** A project's shared sites: stored hosts (a record without them has the
 * unconfirmed defaults), whether the user turned sharing on, and a line. */
export function sharedSites(project) {
  const stored = project?.shared_sites;
  const hosts = stored ? listOf(stored.hosts).filter(host => typeof host === "string") : [...DEFAULT_SHARED_SITES];
  const confirmed = stored?.confirmed === true;
  const text = !hosts.length ? "None: every site uses the project's container"
    : confirmed ? `Shared with the space: ${hostList(hosts)}` : `Not shared yet. Suggested: ${hostList(hosts)}`;
  return { hosts, confirmed, text };
}

export function sharedSitesForm(project) {
  const { hosts, confirmed } = sharedSites(project);
  return { hostsText: hosts.join("\n"), confirmed };
}

/** → { sites: { hosts, confirmed }, errors }; sites is null when errors exist.
 * An empty list is fine (nothing shared). */
export function formToSharedSites(form) {
  const hosts = []; const errors = [];
  for (const part of String(form?.hostsText ?? "").split(/[\s,]+/)) {
    if (!part) continue;
    const host = normalizeHost(part);
    if (!host) errors.push(`"${part}" is not a site such as github.com or *.github.com.`);
    else if (!hosts.includes(host)) hosts.push(host);
  }
  if (hosts.length > MAX_SHARED_SITES) errors.push(`Share at most ${MAX_SHARED_SITES} sites.`);
  return errors.length ? { sites: null, errors } : { sites: { hosts, confirmed: form?.confirmed === true }, errors };
}

/** Rows of the account editor: services found in the folder or already
 * labelled (in the core's order), then labelled sites. */
export function accountRows(project) {
  const accounts = listOf(project?.accounts).filter(item => typeof item?.key === "string" && typeof item?.label === "string");
  const detected = listOf(project?.detected?.integrations).map(item => item?.id);
  const labelOf = key => accounts.find(item => item.key === key)?.label ?? "";
  const services = Object.keys(INTEGRATION_NAMES).filter(id => detected.includes(id) || accounts.some(item => item.key === id))
    .map(id => ({ key: id, name: INTEGRATION_NAMES[id], label: labelOf(id), kind: "service", added: false }));
  const sites = accounts.filter(item => !Object.hasOwn(INTEGRATION_NAMES, item.key))
    .map(item => ({ key: item.key, name: item.key, label: item.label, kind: "site", added: false }));
  return [...services, ...sites];
}

/** Editor rows → the label changes to save ({ key, label | null }, null
 * removes) or errors. Added rows name a site (a host with a dot); an empty
 * added row is ignored. */
export function accountChanges(rows, project) {
  const before = new Map(listOf(project?.accounts).filter(item => typeof item?.key === "string").map(item => [item.key, item.label]));
  const errors = []; const next = new Map();
  for (const row of rows ?? []) {
    const label = String(row.label ?? "").trim();
    let key = row.key;
    if (row.added) {
      const typed = String(row.key ?? "").trim();
      if (!typed && !label) continue;
      key = normalizeHost(typed);
      if (!key || !key.includes(".")) { errors.push(`"${typed}" is not a site such as example.com or *.example.com.`); continue; }
      if (!label) { errors.push(`Type the account you use on ${key}.`); continue; }
    }
    if (label && ([...label].length > ACCOUNT_LABEL_MAX || /[\u0000-\u001f\u007f-\u009f]/u.test(label))) {
      errors.push(`${row.name || key}: use at most ${ACCOUNT_LABEL_MAX} characters on one line.`);
      continue;
    }
    if (next.has(key)) { errors.push(`${key} is listed twice.`); continue; }
    next.set(key, label || null);
  }
  const changes = [...next].filter(([key, label]) => (before.get(key) ?? null) !== label).map(([key, label]) => ({ key, label }));
  const after = new Set(before.keys());
  for (const { key, label } of changes) { if (label === null) after.delete(key); else after.add(key); }
  if (after.size > MAX_ACCOUNTS) errors.push(`Keep at most ${MAX_ACCOUNTS} account labels per project.`);
  return errors.length ? { changes: null, errors } : { changes, errors };
}

/** A note after a project link opened, when it did not get the project's
 * container or Firefox kept the current tab in front. */
export function openedNote(result) {
  if (result?.container === "off") return "Opened without a project container: containers are off in this browser.";
  if (result?.container === "private") return "Opened in this private window, without a project container.";
  if (result?.selected === false) return "Opened in a new tab behind this one: the browser kept the current tab in front.";
  return null;
}

// ---------------------------------------------------------------- spaces

export const TYPE_LABELS = Object.freeze({ personal: "Personal", organization: "Organization", project: "Project" });

/** Projects grouped by the space they live in, in Zen's space order, then the
 * projects that are in no (live) space. Every space is listed, with or without
 * projects, so any space can take one. */
export function projectGroups(contexts, projects) {
  const live = new Set((contexts ?? []).map(context => context.uuid));
  const groups = (contexts ?? []).map(context => ({
    context,
    projects: (projects ?? []).filter(project => project.context_uuid === context.uuid),
  }));
  const loose = (projects ?? []).filter(project => !project.context_uuid || !live.has(project.context_uuid));
  if (loose.length) groups.push({ context: null, projects: loose });
  return groups;
}

/** Where a project now lives, in one sentence for the page after saving. */
export function placementMessage(project, contexts) {
  const name = project?.manifest?.name ?? "The project";
  const space = (contexts ?? []).find(context => context.uuid === project?.context_uuid);
  if (space) return `${name} was added to the space ${space.name}. It is in that space's sidebar, under the space name.`;
  return `${name} was added, but not to a space yet. Choose a space below to show it in the sidebar.`;
}

// ---------------------------------------------------------------- deep links

export const VIEWS = Object.freeze(["projects", "rules", "ai"]);
const LEGACY_VIEWS = Object.freeze({ home: "projects", time: "rules", settings: "ai" });
const PROJECT_ID = /^p_[a-z0-9]{4,32}$/;
const RULE_ID = /^r_[a-z0-9]{4,32}$/;

/** True for exactly the experimental start page's address fragment. */
export function isHomeHash(hash) {
  let text = String(hash ?? "").replace(/^#/, "");
  try { text = decodeURIComponent(text); } catch { return false; }
  return text === "home";
}

/** "#projects", "#rules", "#ai"; old "#home", "#time", "#settings" redirect;
 * "#project=<id>" (the project's home, see homeIdFromRoute), "#edit-project=<id>",
 * "#add-project=<space uuid>", "#rule=<id>". With the experimental start page
 * on (home: true, P6) "#home" is that page instead of the old Projects link. */
export function routeFromHash(hash, { home = false } = {}) {
  let text = String(hash ?? "").replace(/^#/, "");
  try { text = decodeURIComponent(text); } catch { return { view: "projects" }; }
  const [name, value] = text.split("=", 2);
  if (VIEWS.includes(text)) return { view: text };
  if (text === "home" && home === true) return { view: "home" };
  if (Object.hasOwn(LEGACY_VIEWS, text)) return { view: LEGACY_VIEWS[text], legacy: true };
  // A project home: everything after "project=" (decoded) must be one valid id;
  // a tail such as "=x", "%3Dx" or "=/" is not a home, only the list.
  if (name === "project") {
    const whole = text.slice("project=".length);
    return PROJECT_ID.test(whole) ? { view: "projects", project: whole } : { view: "projects" };
  }
  if (name === "edit-project" && PROJECT_ID.test(value ?? "")) return { view: "projects", project: value, edit: true };
  if (name === "add-project" && isWorkspaceUuid(value ?? "")) return { view: "projects", addTo: value };
  if (name === "rule" && RULE_ID.test(value ?? "")) return { view: "rules", rule: value };
  return { view: "projects" };
}

// ---------------------------------------------------------------- project list and home (Plan 4 step 3)

// The home of one project is about:axiosozo#project=<id>. The id is the only
// route key: never a folder, a container or anything else the page could name.
export const KIND_LABELS = Object.freeze({ web: "Web project", desktop: "Desktop app", library: "Library",
  cli: "Command-line tool", mobile: "Mobile app" });

export function homeHash(id) {
  return typeof id === "string" && PROJECT_ID.test(id) ? `#project=${id}` : "#projects";
}

/** The project a route shows as its home, or null (the list, an editor, another view). */
export function homeIdFromRoute(route) {
  return route?.view === "projects" && !route.edit && typeof route.project === "string" && PROJECT_ID.test(route.project)
    ? route.project : null;
}

export function projectName(project) {
  return textOr(project?.manifest?.name) || textOr(project?.id) || "Project";
}

/** One capital letter for the project's tile; "?" when the name has none. */
export function monogram(name) {
  const first = [...String(name ?? "").trim()].find(char => /[\p{L}\p{N}]/u.test(char));
  return first ? first.toUpperCase() : "?";
}

const listText = (items, shown = 3) => (items.length <= shown ? items.join(", ")
  : `${items.slice(0, shown).join(", ")} and ${items.length - shown} more`);
const capitalize = text => (text ? text[0].toUpperCase() + text.slice(1) : "");

/** Host plus a path other than "/", for showing an address; "" for anything that is not http(s). */
export function displayAddress(url) {
  if (!isHttpUrl(url)) return "";
  const parsed = new URL(url);
  const path = parsed.pathname.replace(/\/+$/, "");
  return parsed.host + path;
}

export const STATUS_TEXT = Object.freeze({ up: "Running", down: "Not running", checking: "Checking…",
  unchecked: "Not checked yet", unknown: "Could not check", remote: "Not checked" });
export const STATUS_NOTE = "Only servers on this Mac are checked, with one connection to the declared port. Preview and production addresses are never contacted.";

// The declared local service an environment's address points at (same port; its app first).
function serviceForEnvironment(project, env) {
  if (!isLoopback(env?.base_url)) return null;
  const port = portOf(env.base_url);
  const services = listOf(project?.manifest?.services).filter(service => isLoopback(service?.url) && service.port === port);
  const app = appOrNull(env.app);
  return services.find(service => appOrNull(service.app) === app) ?? services.find(service => !service.app) ?? services[0] ?? null;
}

// The last result of serviceStatus() for a declared service: "up", "down", "unknown" or null (not checked).
function statusOf(service, statuses) {
  const entry = listOf(statuses).find(item => item?.url === service.url && item?.port === service.port)
    ?? listOf(statuses).find(item => item?.name === service.name && item?.port === service.port);
  return entry?.status === "up" || entry?.status === "down" || entry?.status === "unknown" ? entry.status : null;
}

/** "up" | "down" | "unknown" | "checking" | "unchecked" for a local address; "remote" otherwise. */
export function environmentStatus(project, env, statuses = [], { checking = false } = {}) {
  if (!isLoopback(env?.base_url)) return "remote";
  const service = serviceForEnvironment(project, env);
  const status = service ? statusOf(service, statuses) : null;
  if (status) return status;
  return service && checking ? "checking" : "unchecked";
}

const ENV_RANK = Object.freeze({ local: 0, dev: 1, development: 1, preview: 2, staging: 2, production: 4, prod: 4 });
const envRank = name => (Object.hasOwn(ENV_RANK, name) ? ENV_RANK[name] : 3);

/** A project's environments per app for the home: local first, production last,
 * each with its address and the status the page may honestly show. */
export function homeEnvironments(project, statuses = [], { checking = false } = {}) {
  const envs = listOf(project?.manifest?.environments).filter(env => typeof env?.name === "string" && env.name && isHttpUrl(env.base_url));
  const apps = [...new Set(envs.map(env => appOrNull(env.app)))];
  const multi = apps.filter(Boolean).length > 1;
  return apps.map(app => ({
    app,
    label: multi ? (app ?? "Whole project") : null,
    rows: envs.map((env, index) => ({ env, index })).filter(({ env }) => appOrNull(env.app) === app)
      .sort((a, b) => envRank(a.env.name) - envRank(b.env.name) || a.index - b.index)
      .map(({ env }) => {
        const status = environmentStatus(project, env, statuses, { checking });
        const label = capitalize(env.name);
        const address = displayAddress(env.base_url);
        return { app, name: env.name, label, url: env.base_url, address, local: isLoopback(env.base_url),
          status, statusText: STATUS_TEXT[status], openLabel: `Open ${multi && app ? `${app} ` : ""}${label} at ${address}` };
      }),
  }));
}

/** The local-server line of a project card, or null when it declares none. A
 * check that was made but could not tell (status "unknown") is said so; it is
 * never shown as running, down or not yet checked. */
export function localSummary(project, statuses = []) {
  const services = listOf(project?.manifest?.services).filter(service => isLoopback(service?.url));
  if (!services.length) return null;
  const states = services.map(service => statusOf(service, statuses));
  const count = value => states.filter(state => state === value).length;
  const up = count("up");
  const down = count("down");
  const failed = count("unknown");
  const unchecked = count(null);
  if (services.length === 1) {
    if (up) return { tone: "up", text: "Local server running" };
    if (down) return { tone: "down", text: "Local server not running" };
    if (failed) return { tone: "unknown", text: "Local server could not be checked" };
    return { tone: "unknown", text: "Local server not checked yet" };
  }
  if (unchecked === services.length) return { tone: "unknown", text: "Local servers not checked yet" };
  if (failed === services.length) return { tone: "unknown", text: "Local servers could not be checked" };
  const tone = down ? (up ? "warn" : "down") : failed || unchecked ? "unknown" : "up";
  if (!failed && !unchecked) return { tone, text: `${up} of ${services.length} local servers running` };
  return { tone, text: [up ? `${up} running` : null, down ? `${down} not running` : null,
    failed ? `${failed} could not be checked` : null, unchecked ? `${unchecked} not checked yet` : null].filter(Boolean).join(", ") };
}

/** App names of the manifest (first seen), else the native and mobile apps detection found. */
export function projectApps(project) {
  const manifest = project?.manifest;
  const apps = [...new Set([...listOf(manifest?.environments), ...listOf(manifest?.services)]
    .map(item => appOrNull(item?.app)).filter(Boolean))];
  if (apps.length) return apps;
  return [...new Set(detectionSummary(project?.detected).platforms.map(item => PLATFORM_LABELS[item.kind]))];
}

/** What a project card in the list says: labelled phrases, never bare chips. */
export function projectCard(project, { statuses = [], container = null } = {}) {
  const name = projectName(project);
  const summary = containerSummary(container);
  const apps = projectApps(project);
  const services = detectionSummary(project?.detected).integrations.map(item => item.name);
  return {
    id: project?.id ?? null, name, monogram: monogram(name), href: homeHash(project?.id),
    color: summary?.state === "own" ? summary.color : null,
    kind: KIND_LABELS[project?.manifest?.kind] ?? "Project",
    folder: textOr(project?.root),
    inRepo: project?.manifest_state === "written" || project?.manifest_state === "external",
    local: localSummary(project, statuses),
    facts: [apps.length ? { label: "Apps", text: listText(apps) } : null,
      services.length ? { label: "Services", text: listText(services) } : null].filter(Boolean),
  };
}

/** Services found in the folder or given an account label, then the labelled
 * sites. Only the fixed integration names are shown for found services. */
export function homeServices(project) {
  const found = new Map(detectionSummary(project?.detected).integrations.map(item => [item.id, item]));
  const accounts = listOf(project?.accounts).filter(item => typeof item?.key === "string" && typeof item?.label === "string");
  const labelOf = key => accounts.find(item => item.key === key)?.label ?? null;
  const services = Object.keys(INTEGRATION_NAMES).filter(id => found.has(id) || labelOf(id) !== null).map(id => ({
    key: id, name: INTEGRATION_NAMES[id], account: labelOf(id), url: found.get(id)?.url ?? null, found: found.has(id),
    sources: found.get(id)?.sources ?? [] }));
  const sites = accounts.filter(item => !Object.hasOwn(INTEGRATION_NAMES, item.key))
    .map(item => ({ key: item.key, name: item.key, account: item.label, url: null, found: false, sources: [] }));
  return [...services, ...sites];
}

export const AGENT_LABELS = Object.freeze({ "claude-code": "Claude Code", codex: "Codex", other: "Agent" });
export const AGENT_STATE_TEXT = Object.freeze({ started: "Working", needs_input: "Needs you", done: "Done", failed: "Failed" });
export const AGENTS_UNAVAILABLE = "Agent activity cannot be shown right now. It comes back once your projects have finished saving.";
export const AGENTS_OFF = "Your agents can report here when they need you or are done. Agent status is off; turn it on under AI & keys.";
export const AGENTS_EMPTY = "No agent reported on this project in the last day.";
export const PRESENCE_TEXT = "These show the folder is set up for agents, not that one is running.";
const STATUS_RECORD_ID = /^as_[0-9a-f]{16}$/u;
const ONE_LINE = /^[^\u0000-\u001f\u007f-\u009f]+$/u;

const within = (path, root) => typeof path === "string" && typeof root === "string" && root.startsWith("/")
  && (path === root || path.startsWith(`${root}/`));

// workstation-v1 §5 status records; anything else is not shown.
function validStatusRecord(record, root) {
  return record?.version === 1 && STATUS_RECORD_ID.test(record.id ?? "") && Object.hasOwn(AGENT_LABELS, record.agent)
    && Object.hasOwn(AGENT_STATE_TEXT, record.state) && typeof record.title === "string" && record.title.length <= 120
    && ONE_LINE.test(record.title) && Number.isSafeInteger(record.at) && record.at > 0
    && (root === null || within(record.project_path, root));
}

export function timeAgo(ms) {
  if (!Number.isFinite(ms) || ms < 60_000) return "just now";
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

const SESSION_ID = /^s_[0-9a-f]{16}$/u;

/** Recent agent activity on the home (P3, step 4). `activity` is null while the
 * browser cannot read it; otherwise `{ records, reporting, sessions }`. Only
 * valid records of this project's folder are shown, newest first; with none,
 * the line says whether agent status is off or nothing was reported. Browser
 * sessions of the agent bridge are listed by agent and state only. */
export function homeAgentActivity(activity, { root = null, now = null } = {}) {
  if (!activity || !Array.isArray(activity.records)) return { state: "unavailable", text: AGENTS_UNAVAILABLE, items: [], sessions: [] };
  const items = activity.records.filter(record => validStatusRecord(record, root)).sort((a, b) => b.at - a.at).slice(0, 5)
    .map(record => ({ agent: AGENT_LABELS[record.agent], state: record.state, stateText: AGENT_STATE_TEXT[record.state],
      title: record.title, at: record.at, ago: Number.isSafeInteger(now) ? timeAgo(now - record.at) : null }));
  const sessions = listOf(activity.sessions).filter(item => SESSION_ID.test(item?.session ?? "") && (item.state === "approved" || item.state === "pending"))
    .slice(0, 8).map(item => ({ session: item.session, agent: AGENT_LABELS[item.agent] ?? AGENT_LABELS.other,
      state: item.state, stateText: item.state === "approved" ? "Allowed" : "Waiting for you" }));
  if (items.length) return { state: "list", text: null, items, sessions };
  return activity.reporting === false ? { state: "off", text: AGENTS_OFF, items: [], sessions }
    : { state: "empty", text: AGENTS_EMPTY, items: [], sessions };
}

// ---------------------------------------------------------------- agent status (AI & keys)

export const AGENT_HOOKS = Object.freeze([
  Object.freeze({ agent: "claude-code", name: "Claude Code",
    where: "Merge it into ~/.claude/settings.json, or into a project's .claude/settings.json. It adds the Stop, Notification and UserPromptSubmit hooks." }),
  Object.freeze({ agent: "codex", name: "Codex",
    where: "Add it to ~/.codex/config.toml. Codex reads notify only from your own settings, and only one notify line counts." }),
]);
export const AGENT_HOOKS_NOTE = "AxioSozo never installs, edits or runs these. Each one calls the small notify script that ships with AxioSozo, through this profile's private connection point.";
// Only what this build's tools do: nothing here says whether Chromium tabs are listed.
export const AGENT_TOOLS_NOTE = "Agents never see private windows. Console errors are read from Firefox tabs only, never from Chromium tabs. Clicking, typing and opening pages are not available in this build.";

// ---------------------------------------------------------------- browser tools (P4)

// Plugin settings for the agent bridge that ships with AxioSozo (stdio MCP).
export const AGENT_BRIDGES = Object.freeze([
  Object.freeze({ agent: "claude-code", name: "Claude Code",
    where: "Merge it into the .mcp.json of a project folder. Claude Code then offers AxioSozo's browser tools in that project." }),
  Object.freeze({ agent: "codex", name: "Codex",
    where: "Add it to ~/.codex/config.toml. Codex then offers AxioSozo's browser tools." }),
]);
export const AGENT_BRIDGE_NOTE = "AxioSozo never installs, edits or runs these. Each one starts the agent bridge that ships with AxioSozo, through this profile's private connection point. Every agent session still asks you here first.";
const AGENT_TOOL_LABELS = Object.freeze({
  "tabs.list": "See your open tabs: address and title",
  "tabs.active": "See which tab is in front",
  "project.info": "Read the project's name, folder and environment links",
  "console.errors": "Read console errors of a Firefox tab in the project",
  "tabs.screenshot": "Take a screenshot of a tab",
  "tabs.open": "Open a page in a new background tab",
  "tabs.navigate": "Go to another page in a tab",
  "page.click": "Click on a page",
  "page.type": "Type into a page",
});
// Only reasons that add something to the tag; the footnote covers acting on pages.
const AGENT_TOOL_REASONS = Object.freeze({
  CAPTURE_NOT_ENABLED: "Not in this build yet: screenshots wait for their privacy checks.",
  CLEANUP_PENDING: "Paused while AxioSozo finishes closing earlier agent work.",
});

/**
 * The browser tools this build offers an agent you allow, from the browser's
 * own capabilities (never a list of modules). With agent status on, a tool
 * counts only when the live endpoint also offers it. Unknown entries and
 * methods are left out; an empty answer is "unknown", never "none".
 */
export function agentToolsView(endpoint) {
  const listening = endpoint?.state === "listening";
  const live = new Map(listOf(endpoint?.methods).filter(item => typeof item?.method === "string").map(item => [item.method, item.available === true]));
  const rows = listOf(endpoint?.capabilities).filter(item => Object.hasOwn(AGENT_TOOL_LABELS, item?.method)).map(item => {
    const available = item.available === true && (!listening || live.get(item.method) === true);
    const reason = typeof item.reason === "string" ? item.reason : null;
    return { method: item.method, label: AGENT_TOOL_LABELS[item.method], available,
      state: available ? "Available" : "Not available",
      note: available ? null : AGENT_TOOL_REASONS[reason] ?? (listening && item.available === true ? "Not offered right now." : null) };
  });
  if (!rows.length) return { state: "unknown", text: "AxioSozo could not tell which browser tools are available.", rows };
  const count = rows.filter(row => row.available).length;
  const text = !count ? "No browser tools are available to agents in this build."
    : listening ? "An agent you allow for its session can use the available tools until it disconnects or you end its session."
      : "Once agent status is on, an agent you allow for its session can use the available tools.";
  return { state: count ? "some" : "none", text, rows };
}

/** Why plugin settings cannot be shown; a fixed sentence per refusal. */
export function agentBridgeErrorText(code) {
  switch (code) {
    case "AGENT_BRIDGE_CONFIG_UNAVAILABLE": case "CONFIG_UNAVAILABLE":
      return "Not available in this build: AxioSozo found no verified copy of its agent bridge.";
    case "ENDPOINT_UNAVAILABLE": return "Shown while agent status is on.";
    case "TIMEOUT": return "Preparing these took too long. Try again in a moment.";
    case "PRIVATE_WINDOW": return "Managed from a normal window.";
    default: return "These settings could not be prepared. Try again in a moment.";
  }
}

const ENDPOINT_PROBLEMS = Object.freeze({
  in_use: { label: "In use", text: "Something is already listening at this profile's connection point, so AxioSozo did not replace it." },
  blocked: { label: "Blocked", text: "Something that is not AxioSozo's is in the way of the connection point. Nothing was replaced or removed." },
});
function unavailableText(reason) {
  switch (reason) {
    case "PROJECT_CACHE_UNAVAILABLE": case "PROJECT_CACHE_BUSY":
      return "Your projects were changing, so agent status did not start. Try again.";
    case "LISTENER_STOPPED": case "SOCKET_LOCK_LOST": return "Agent status stopped unexpectedly. Nothing is listening now.";
    case "TIMEOUT": return "Agent status did not start in time. Nothing is listening.";
    default: return "This build cannot open a private connection point for this profile, so nothing was started.";
  }
}

/**
 * What the agent status setting shows, from getAgentEndpointState (or the
 * code it refused with). The switch follows the browser's own state, never a
 * preference. Reason codes stay out of the sentences; `detail` keeps one.
 * `action`/`secondary`: { kind: "enable" | "disable", label } or null.
 */
export function agentEndpointView(endpoint, { error = null } = {}) {
  const view = (tone, label, text, extra = {}) => ({ tone, label, text, detail: null, action: null, secondary: null,
    listening: false, busy: false, ...extra });
  if (error === "PRIVATE_WINDOW") return view("off", "Not in private windows", "Agent status is managed from a normal window.");
  if (error) return view("unknown", "Unknown", "AxioSozo could not read the agent status. Reload this page to try again.");
  if (!endpoint || typeof endpoint !== "object") return view("unknown", "Checking…", "");
  const enable = label => ({ kind: "enable", label });
  const disable = { kind: "disable", label: "Turn off" };
  const reason = typeof endpoint.reason === "string" && /^[A-Z][A-Z0-9_]{0,63}$/u.test(endpoint.reason) ? endpoint.reason : null;
  if (endpoint.state === "listening") {
    return view("ok", "On", "Agents on this Mac can report to AxioSozo until you turn this off or quit AxioSozo.",
      { action: disable, listening: true });
  }
  // Asked to start but not begun yet (projects are read first): starting too.
  if (endpoint.state === "starting" || (endpoint.enabled === true && endpoint.state === "disabled" && endpoint.cleanup_blocked !== true)) {
    return view("info", "Starting…", "Opening this profile's private connection point.", { action: disable, busy: true });
  }
  if (endpoint.cleanup_pending === true && endpoint.enabled !== true) return view("info", "Closing…", "Closing the connection point.", { busy: true });
  if (endpoint.cleanup_blocked === true || reason === "CLEANUP_INCOMPLETE") {
    return view("warn", "Not closed", "AxioSozo could not finish closing its previous connection point. Nothing new starts until that succeeds; trying again finishes it first.",
      { detail: reason ?? "CLEANUP_INCOMPLETE", action: enable("Try again"), secondary: endpoint.enabled === true ? disable : null });
  }
  if (endpoint.enabled !== true) {
    return view("off", "Off", "Turn this on to let Claude Code or Codex tell AxioSozo when they start, need you, finish or fail. It stays on until you turn it off or quit AxioSozo.",
      { action: enable("Turn on") });
  }
  const problem = ENDPOINT_PROBLEMS[endpoint.state];
  return view("warn", problem?.label ?? "Not started", problem?.text ?? unavailableText(reason),
    { detail: reason, action: enable("Try again"), secondary: disable });
}

/** Why hook settings cannot be shown; a fixed sentence per refusal. */
export function agentHookErrorText(code) {
  switch (code) {
    case "AGENT_HOOK_CONFIG_UNAVAILABLE": case "CONFIG_UNAVAILABLE":
      return "Not available in this build: AxioSozo found no verified copy of its notify script.";
    case "ENDPOINT_UNAVAILABLE": return "Shown while agent status is on.";
    case "PRIVATE_WINDOW": return "Managed from a normal window.";
    default: return "These settings could not be prepared. Try again in a moment.";
  }
}

// Null while the browser cannot read them now (its projects are changing, the
// window is not a normal one); never a claim about private or Chromium tabs.
export const ERRORS_UNAVAILABLE = "Console errors cannot be shown right now.";
export const ERRORS_NOTE = "Errors and warnings of this project's Firefox tabs in this window, kept in memory until the page navigates. Nothing is saved or sent.";
export const SEND_ERRORS_HELP = "You choose one of this project's tabs; AxioSozo switches to it and opens Send to agent with its console errors ticked. Nothing is copied until you choose Copy for agent.";
const clipText = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

/** Console errors on the home (P5, step 7). `errors` is null while they
 * cannot be read; otherwise `{ count, recent: [{ level, text }] }`: every
 * retained message of the project's tabs and the five newest. */
export function homeConsoleErrors(errors) {
  if (!errors || !Number.isSafeInteger(errors.count) || errors.count < 0) {
    return { state: "unavailable", text: ERRORS_UNAVAILABLE, count: null, items: [] };
  }
  const items = listOf(errors.recent).filter(item => typeof item?.text === "string" && item.text.trim()).slice(0, 5)
    .map(item => ({ level: item.level === "warning" ? "warning" : "error",
      text: clipText(item.text.replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩\s]+/gu, " ").trim(), 300) }));
  if (!errors.count) return { state: "empty", text: "No console errors in this project's tabs.", count: 0, items: [] };
  return { state: "list", text: `${errors.count} console error${errors.count === 1 ? "" : "s"} in this project's tabs`, count: errors.count, items };
}

export const BRIEF_ABOUT = "A brief is a short document your own Claude Code or Codex can write about this folder.";
export const BRIEF_UNAVAILABLE = `${BRIEF_ABOUT} Writing one is not available in this build.`;
export const BRIEF_CLIS = Object.freeze({ "claude-code": "Claude Code", codex: "Codex" });

/** A stored brief (understand-v1 §4) as a document, or null. Text only; its
 * domains are what the assistant wrote, so they stay unconfirmed. */
export function briefView(brief) {
  const doc = brief?.document;
  if (brief?.version !== 1 || doc?.version !== 1 || !textOr(doc.product)) return null;
  const rows = (list, keys) => listOf(list).filter(item => keys.every(key => item?.[key] === null || typeof item?.[key] === "string"))
    .filter(item => textOr(item[keys[0]]));
  return {
    product: doc.product,
    apps: rows(doc.apps, ["name", "kind", "summary"]).map(item => ({ name: item.name, kind: textOr(item.kind),
      path: textOr(item.path) || null, summary: textOr(item.summary) })),
    domains: rows(doc.domains, ["host", "purpose"]).map(item => ({ host: item.host, purpose: textOr(item.purpose) })),
    services: rows(doc.services, ["name", "purpose"]).map(item => ({ name: item.name, purpose: textOr(item.purpose) })),
    start: rows(doc.start, ["label", "command"]).map(item => ({ label: item.label, command: textOr(item.command), cwd: textOr(item.cwd) || null })),
    risks: listOf(doc.risks).filter(item => typeof item === "string" && item),
    by: BRIEF_CLIS[brief.cli] ?? "an assistant",
    accepted: brief.accepted === true,
    generatedAt: Number.isSafeInteger(brief.generated_at) ? brief.generated_at : null,
  };
}

// ---------------------------------------------------------------- Understand (Plan 4 step 6)

// Reading a project runs the user's own Claude Code or Codex (understand-v1).
// Product reads are NOT_AUTHORIZED in this build; only the explicit synthetic
// fixture mode (state.mode OFFLINE_FIXTURE) offers Read. Nothing here infers
// authorization from an installed CLI, a version, a key or an earlier result.
export const UNDERSTAND_CLIS = Object.freeze(["claude-code", "codex"]);
export const UNDERSTAND_INTRO = Object.freeze({
  fixture: "Synthetic test mode: a stand-in for your own Claude Code or Codex reads this folder on this Mac and writes a brief here. No assistant or provider is contacted. Switching tabs or leaving this page stops it.",
  production: "Your own Claude Code or Codex could read this folder on this Mac and write a brief here. Reading is not available in this build, so nothing is sent.",
  unknown: "Reading this project is not available right now. Nothing is sent.",
});
export const BRIEF_EMPTY_FIXTURE = "No brief yet. Read the project below to write one; it shows here once it is saved.";
const READING_STATES = new Set(["queued", "running", "persisting"]);
const cliName = cli => BRIEF_CLIS[cli] ?? "The assistant";

/** The mode a getUnderstandState answer reports: "fixture" only for the
 * explicit synthetic capability, "production" for the closed product path,
 * "unknown" when there is no answer. Authorization stays NOT_AUTHORIZED in all. */
export function understandMode(reply) {
  if (reply?.authorization !== "NOT_AUTHORIZED") return "unknown";
  return reply.mode === "OFFLINE_FIXTURE" ? "fixture" : reply.mode === "PRODUCTION" ? "production" : "unknown";
}

/** This page's read still under way: the latest queued, running or saving
 * job of its own owner, or null. `persisting` (status null) is not success. */
export function activeUnderstandJob(reply) {
  const jobs = listOf(reply?.jobs).filter(job => typeof job?.request_id === "string" && READING_STATES.has(job.state));
  return jobs.length ? { requestId: jobs.at(-1).request_id, state: jobs.at(-1).state } : null;
}

const JOB_TEXT = Object.freeze({
  queued: () => "Waiting to start. It begins when the reader is free.",
  running: cli => (Object.hasOwn(BRIEF_CLIS, cli ?? "") ? `Reading the folder with ${BRIEF_CLIS[cli]}…` : "Reading the folder…"),
  persisting: () => "Saving the brief…",
});

/** One finished read as a calm sentence (never a raw code): a result of
 * readProject, or a fixed code it refused with. Only a saved brief is success. */
export function understandOutcome(outcome, { mode = "production" } = {}) {
  if (!outcome) return null;
  if (outcome.code) {
    switch (outcome.code) {
      case "BRIEF_SAVE_FAILED": return { tone: "bad", text: "The brief could not be saved. Any earlier brief is unchanged." };
      // A save already under way cannot be undone: the brief shown is what the browser saved.
      case "OWNER_REVOKED": case "DOCUMENT_GONE":
        return { tone: "warn", text: "It stopped because another tab was selected or this page was left. The brief shown is the one that is saved." };
      case "PROJECT_CHANGED": case "STALE_PROJECT": case "INVALID_PROJECT":
        return { tone: "warn", text: "This project is changing right now, so it was not read. Try again in a moment." };
      case "PRIVATE_WINDOW": return { tone: "warn", text: "Projects are read only from a normal window, never a private one." };
      case "SERVICE_CLOSED": return { tone: "warn", text: "AxioSozo is closing, so nothing was read." };
      default: return { tone: "warn", text: "The reader is not available right now, so nothing was read." };
    }
  }
  const { status, reason } = outcome.result ?? {};
  const name = cliName(outcome.result?.cli);
  switch (status) {
    case "ok": return { tone: "ok", text: "Brief saved. It is shown above." };
    case "cancelled":
      if (reason === "STALE_PROJECT") return { tone: "warn", text: "It stopped because the project changed while it was read. The brief shown is the one that is saved." };
      if (reason === "HOST_CLOSED") return { tone: "warn", text: "Stopped because the reader closed. Nothing was saved." };
      return { tone: "info", text: "Stopped. Nothing was saved, and any earlier brief is unchanged." };
    case "timeout": return { tone: "warn", text: "It took too long and was stopped. Nothing was saved." };
    case "unavailable":
      if (reason === "NOT_AUTHORIZED") return { tone: "info", text: "Reading projects is not available in this build, so nothing was sent." };
      if (reason === "CLI_NOT_INSTALLED") return { tone: "warn", text: `${name} is not available to read with${mode === "fixture" ? " in this test setup" : ""}, so nothing was sent.` };
      return { tone: "warn", text: "The reader is not available right now, so nothing was sent." };
    case "invalid_output": return { tone: "warn", text: "The answer was not a valid brief, so nothing was saved." };
    case "busy": return { tone: "warn", text: "Too many reads are waiting. Try again in a moment." };
    case "failed": return { tone: "bad", text: `${name} could not finish reading this project. Nothing was saved.` };
    default: return { tone: "warn", text: "The read ended without a brief. Nothing was saved." };
  }
}

/** Whether a finished read may have saved a brief that its answer does not
 * show (saved, or stopped around its save): the home is then read again. */
export function understandMaySave(outcome) {
  return outcome?.result?.status === "ok" || outcome?.result?.reason === "STALE_PROJECT"
    || outcome?.code === "OWNER_REVOKED" || outcome?.code === "DOCUMENT_GONE";
}

/** Whether a finished read started the assistant, as a fact (never a permission). */
export function understandDataFact(result, { mode = "production" } = {}) {
  if (typeof result?.data_sent !== "boolean") return null;
  if (!result.data_sent) return "The assistant was not started; nothing was sent.";
  return mode === "fixture" ? "The synthetic test reader was started for this read; it reads only this folder."
    : `${cliName(result.cli)} was started for this read, so it may have contacted its provider.`;
}

/**
 * What the Read part of a home shows, from this page's latest state answer
 * (or its refusal code), its own read under way ({ cli } while readProject is
 * out) and the last outcome. Read is offered only in fixture mode; while a
 * read, its admission or its save is pending, Read is inactive (no duplicate)
 * and Stop is offered for a queued or running job.
 */
export function understandView({ reply = null, error = null, pending = null, outcome = null, checking = false, replyStale = false } = {}) {
  const mode = error ? "unknown" : understandMode(reply);
  // A state answer asked for before the read's own result arrived still lists it as under way.
  const job = replyStale && !pending ? null : activeUnderstandJob(reply);
  const busy = !!pending || !!job;
  let status = null;
  if (job) status = { tone: "info", text: JOB_TEXT[job.state](pending?.cli) };
  else if (pending) status = { tone: "info", text: "Starting…" };
  else if (outcome) status = understandOutcome(outcome, { mode });
  const clis = listOf(reply?.clis);
  const versions = clis.length ? UNDERSTAND_CLIS.map(cli => {
    const found = clis.find(item => item?.cli === cli);
    return `${cliName(cli)}: ${found ? found.version ?? "version unknown" : "not found"}`;
  }).join(" · ") : null;
  return {
    mode, intro: UNDERSTAND_INTRO[mode], canRead: mode === "fixture" && !busy, offered: mode === "fixture",
    busy, job, canStop: !!job && job.state !== "persisting", status,
    fact: !busy && outcome?.result ? understandDataFact(outcome.result, { mode }) : null,
    versions, checking,
  };
}

/** Readable sentence for an acceptance outcome ({ status, committed, reason }).
 * Only ACCEPTED is success; a changed disk or project is never called one. */
export function acceptanceOutcome(outcome) {
  switch (outcome?.status) {
    case "ACCEPTED": return { tone: "ok", text: "Accepted. The project file has the name and kind you confirmed, and the brief is marked accepted." };
    case "REFUSED": return { tone: "warn", text: `Nothing was written: ${refusalText(outcome.reason)}` };
    case "REINSPECTION_REQUIRED": return { tone: "warn", inspect: true,
      text: "AxioSozo could not confirm whether the project file was written. Check the project file before anything else is written." };
    case "INSPECTED": return { tone: "info",
      text: "Checked. The write could not be confirmed, so the brief is not marked accepted. Review and accept again to write it." };
    case "CHANGED": return { tone: "warn", text: outcome.reason === "STALE_PROJECT"
      ? "The project file was written, but the project changed meanwhile, so the brief is not marked accepted."
      : "The project file changed right after it was written, so the brief is not marked accepted. Nothing else was changed." };
    case "UNCHANGED": return { tone: "info", text: "Nothing to check: no project file write is waiting to be confirmed." };
    default: return { tone: "warn", text: "The outcome is unknown. Check the project file before accepting again." };
  }
}

function refusalText(reason) {
  switch (reason) {
    case "MANIFEST_CHANGED": case "IDENTITY_CHANGED": case "STALE_ACCEPTANCE":
      return "the project file changed since you opened the review. Open Accept again to review it.";
    case "DIRECTORY_REFUSED": case "MANIFEST_REFUSED": case "WRITE_CONTAINMENT_REFUSED":
      return "AxioSozo does not write a project file at this place.";
    case "MANIFEST_SECRET": return "the project file would hold something that looks like a secret.";
    case "TOO_LARGE": case "INVALID_MANIFEST": case "UNCONFIRMED_FIELDS": return "the project file would not be valid.";
    case "BUSY": return "another change to the project file is running.";
    case "WRITE_CONTAINMENT_UNAVAILABLE": return "this build cannot write the project file safely.";
    default: return "the project file could not be written.";
  }
}

/** Refusals of an acceptance after which the write's outcome is owed an inspection. */
export const ACCEPTANCE_INSPECT_CODES = Object.freeze(["MANIFEST_REINSPECTION_REQUIRED", "WRITE_OUTCOME_UNKNOWN"]);

/** Why a preview, acceptance or inspection was refused before any outcome. */
export function acceptanceErrorText(code) {
  switch (code) {
    case "STALE_ACCEPTANCE": return "This review is no longer valid: it expired, was already used or the project changed. Nothing was written; open Accept again.";
    case "MANIFEST_REINSPECTION_REQUIRED": return "An earlier write still has to be checked first. Check the project file.";
    // Authority ended after the write may have reached the file: never "nothing was written".
    case "WRITE_OUTCOME_UNKNOWN":
      return "This page changed while the project file was being written, so AxioSozo cannot confirm whether it was. Check the project file before anything else is written.";
    case "BRIEF_UNAVAILABLE": return "There is no saved brief to accept.";
    case "WRITE_CONTAINMENT_UNAVAILABLE": return "This build cannot write the project file safely, so nothing was written.";
    case "BUSY": return "Another change to the project file is running. Try again in a moment.";
    case "PROJECT_CHANGED": case "STALE_PROJECT": case "INVALID_PROJECT": return "This project is changing right now. Nothing was written; try again in a moment.";
    case "OWNER_REVOKED": case "DOCUMENT_GONE": return "This page changed meanwhile. Nothing was written.";
    case "PRIVATE_WINDOW": return "Project files are changed only from a normal window.";
    default: return "The project file could not be reviewed right now. Nothing was written.";
  }
}

/** The acceptance review: only the name and kind, starting from the project
 * file (or the stored manifest) the browser just read. Nothing from the brief. */
export function acceptanceForm(manifest) {
  const name = textOr(manifest?.name);
  const kind = PROJECT_KINDS.includes(manifest?.kind) ? manifest.kind : "web";
  return { name, kind, currentName: name, currentKind: kind };
}

/** → { edits: { name, kind }, errors }: both confirmed values, checked like the
 * manifest's own name (1–80 characters, one line) and kind. */
export function acceptanceEdits(form) {
  const name = String(form?.name ?? "").trim();
  const errors = [];
  if (!validName(name)) errors.push("The name must be 1 to 80 characters on one line.");
  if (!PROJECT_KINDS.includes(form?.kind)) errors.push("Choose a project kind.");
  return errors.length ? { edits: null, errors } : { edits: { name, kind: form.kind }, errors };
}

/** Folder, project file and last read, for the About part of the home. */
export function folderFacts(project) {
  const state = project?.manifest_state;
  return {
    root: textOr(project?.root),
    projectFile: state === "written" ? "Saved in .axiosozo/project.json"
      : state === "external" ? "Read from .axiosozo/project.json" : "Kept in this browser only",
    inRepo: state === "written" || state === "external",
    lastRead: Number.isSafeInteger(project?.detected?.at) ? project.detected.at : null,
  };
}

/** Section order of the home: activity moves up only when it has something to
 * show; the project's watches always sit just above what the project is. */
export function homeSections({ agents, errors } = {}) {
  const busy = agents?.state === "list" || errors?.state === "list";
  return busy ? ["open", "activity", "accounts", "watches", "about"] : ["open", "accounts", "activity", "watches", "about"];
}

/** A calm explanation when a project home cannot be shown. */
export function homeProblem(code) {
  switch (code) {
    case "UNKNOWN_PROJECT": return { title: "This project is not here anymore",
      text: "It may have been removed from AxioSozo. Its folder is not touched. Your other projects are under Projects." };
    case "PRIVATE_WINDOW": return { title: "Project homes open in normal windows",
      text: "A private window does not show project homes or open project containers." };
    case "NO_WINDOW": return { title: "Open this page in a browser window", text: "A project home needs a normal browser window." };
    case "PROJECT_CHANGED": return { title: "This project is changing",
      text: "It changed while this page was reading it. Open it again in a moment, or go back to all projects." };
    default: return { title: "This project could not be shown", text: errorMessage(code) ?? "Try again, or go back to all projects." };
  }
}

// ---------------------------------------------------------------- page admission

/** Waits (ms) before asking again when the actor did not admit this page as a
 * sender. While the browser is still attaching a new tab it can refuse the first
 * messages; the read-only check is asked at most this many more times while the
 * page is shown, then the page stays not connected. */
export const ADMISSION_RETRY_MS = Object.freeze([100, 200, 400, 800, 1600]);

/** What a failed admission read means. Only a successful answer admits a page.
 * A sender refusal or a missing actor is "retry" (not admitted, maybe not yet:
 * a new tab can still be attaching). Any other failure, known or not, is
 * "refused": the page stays not connected and asks nothing more. */
export function admissionFailure(code) {
  return code === "SENDER_REJECTED" || code === "ACTOR_ERROR" ? "retry" : "refused";
}

// ---------------------------------------------------------------- AI & keys

const PROVIDER_TONES = Object.freeze({ ready: "ok", "key-stored": "ok", unverified: "info", "not-installed": "off",
  unavailable: "warn", "needs-key": "off", disabled: "off", unknown: "unknown" });

/** Cards for the AI & keys view from getProviderStatus(); texts are shown as the
 * providers workstream wrote them (honest state_label and detail). */
export function providerCards(status) {
  const providers = Array.isArray(status?.providers) ? status.providers : [];
  return providers.map(provider => ({
    id: String(provider.id ?? ""),
    label: String(provider.label ?? provider.id ?? "Provider"),
    state: String(provider.state ?? "unknown"),
    stateLabel: String(provider.state_label ?? "Status unknown"),
    detail: String(provider.detail ?? ""),
    version: provider.version ? String(provider.version) : null,
    expectedVersion: provider.expected_version ? String(provider.expected_version) : null,
    tone: PROVIDER_TONES[provider.state] ?? "unknown",
    isJev: provider.id === "jev",
    keyEntryEnabled: provider.key_entry_enabled === true,
    key: provider.key ?? null,
  }));
}

export function providerSummary(status) {
  if (!status) return "Checking which assistants are installed…";
  if (status.discovery !== "ok") return "Could not read which assistants are installed. No client was started.";
  return "Read from installation metadata only: no assistant was started and nothing was sent. Answers through this browser have not been verified yet.";
}

/** Can the Jev key form be used, and why not. */
export function jevKeyForm(jev, { isPrivate = false } = {}) {
  if (isPrivate) return { enabled: false, reason: "Keys cannot be changed from a private window." };
  if (!jev) return { enabled: false, reason: "Checking the macOS Keychain…" };
  if (!jev.keyEntryEnabled) return { enabled: false, reason: "Jev key entry is turned off in this build (axiosozo.jev.keyEntry.enabled)." };
  if (jev.key === "unavailable") return { enabled: false, reason: "The Keychain helper is not available in this build." };
  return { enabled: true, reason: null, canRemove: jev.key === "stored" || jev.key === "unknown" };
}

/** Same sentences as ProviderStatus.keychainErrorText (the page cannot load chrome
 * modules). Only refusals before any helper work say nothing changed; anything
 * that can follow the dispatch says the change could not be confirmed. */
export function keychainErrorText(code) {
  switch (code) {
    case "INVALID_KEY": return "Key not stored. Paste the whole key on one line: 8 to 4096 bytes.";
    case "KEY_ENTRY_DISABLED":
    case "JEV_KEY_ENTRY_DISABLED": return "Key not stored. Adding a key is turned off in this build.";
    case "INVALID_PROVIDER": return "That provider is not supported. Nothing was changed.";
    case "KEYCHAIN_HELPER_UNAVAILABLE": return "The Keychain helper was not available or did not finish, so the change could not be confirmed.";
    case "KEYCHAIN_REFUSED": return "The macOS Keychain refused the change. Unlock the Keychain and try again.";
    case "HELPER_TIMEOUT": return "The macOS Keychain did not respond in time, so the change could not be confirmed.";
    case "HELPER_OUTPUT_LIMIT": return "The Keychain helper answered unexpectedly, so the change could not be confirmed.";
    case "SETTINGS_CLOSED": return "Cancelled before it finished, so the change could not be confirmed.";
    case "BUSY": return "A change to this key is still running. Wait for it to finish.";
    case "PRIVATE_WINDOW": return "Keys are managed from a normal window, never a private one.";
    case "NO_WINDOW": return "Open this page in a browser window first.";
    case "DOCUMENT_GONE": return "This page changed before the Keychain answered, so the change could not be confirmed. Check again.";
    default: return "The Keychain change could not be confirmed.";
  }
}

/** A key typed by the user, checked like ProviderKeys does (8–4096 UTF-8 bytes,
 * no control characters) before anything is sent. */
export function checkDecisionKey(text) {
  if (typeof text !== "string" || CONTROL.test(text)) return { ok: false, code: "INVALID_KEY" };
  const bytes = new TextEncoder().encode(text).length;
  return bytes >= 8 && bytes <= 4096 ? { ok: true } : { ok: false, code: "INVALID_KEY" };
}
export const checkJevKey = checkDecisionKey;

// A stored key is not a working provider: decision calls stay unavailable.
const KEY_TONES = Object.freeze({ "key-stored": "info", "needs-key": "off", disabled: "off", unavailable: "warn", unknown: "unknown" });
const KEY_PREFS = Object.freeze({ jev: "axiosozo.jev.keyEntry.enabled", openai: "axiosozo.openai.keyEntry.enabled" });
const KEY_WORKING = Object.freeze({ check: "Checking…", store: "Storing…", remove: "Removing…" });
const KEY_CODE = /^[A-Z][A-Z0-9_]{2,63}$/u;

/** One getDecisionKeyStatus answer as the page shows it, or null when it is not one. */
export function decisionKeyCard(entry) {
  if (!entry || !DECISION_PROVIDERS.includes(entry.id)) return null;
  const state = Object.hasOwn(KEY_TONES, entry.state) ? entry.state : "unknown";
  return {
    provider: entry.id,
    label: PROVIDER_LABELS[entry.id],
    state,
    stateLabel: String(entry.state_label ?? "Status unknown"),
    detail: String(entry.detail ?? ""),
    tone: KEY_TONES[state],
    key: ["stored", "missing"].includes(entry.key) ? entry.key : "unknown",
    error: typeof entry.error === "string" && KEY_CODE.test(entry.error) ? entry.error : null,
    keyEntryEnabled: entry.key_entry_enabled === true,
    canStore: entry.can_store === true,
    canRemove: entry.can_remove === true,
  };
}

/** Why a provider's key cannot be checked from this page at all. */
export function keyRefusalText(code) {
  if (code === "PRIVATE_WINDOW" || code === "NO_WINDOW" || code === "DOCUMENT_GONE") return keychainErrorText(code);
  if (code === "NOT_CONNECTED" || code === "SENDER_REJECTED" || code === "ACTOR_ERROR") return "This page is not connected to AxioSozo.";
  return "The macOS Keychain could not be checked from this page. Use Check again.";
}

/** What one provider's key form shows and allows. Storing follows the
 * provider's key-entry pref; removal never does. While an operation runs the
 * controls stay focusable and the page ignores further presses. */
export function decisionKeyView(provider, card, { busy = null, refused = null } = {}) {
  const label = PROVIDER_LABELS[provider];
  const stored = card?.key === "stored";
  const canStore = !refused && card?.canStore === true;
  const canRemove = !refused && card?.canRemove === true;
  let help = `Stored only in the macOS Keychain; this page never shows it again. Storing sends nothing to ${label} and does not turn on consent.`;
  if (refused) help = "";
  else if (!card) help = "Checking the macOS Keychain…";
  else if (card.state === "unavailable") help = "The Keychain helper is not available in this build.";
  else if (!card.keyEntryEnabled) help = `Adding ${provider === "openai" ? "an" : "a"} ${label} key is turned off in this build (${KEY_PREFS[provider]}).${canRemove ? " You can still remove the stored key." : ""}`;
  return {
    tagLabel: busy ? KEY_WORKING[busy] : refused ? "Not available here" : card?.stateLabel ?? KEY_WORKING.check,
    tone: busy || refused ? "unknown" : card?.tone ?? "unknown",
    detail: refused ? keyRefusalText(refused) : card?.detail ?? "",
    note: !busy && !refused && card?.error ? `Detail: ${card.error}` : null,
    inputLabel: stored ? `Replace the ${label} key` : `${label} API key`,
    placeholder: stored ? "Paste a new key to replace it" : `Paste your ${label} key`,
    storeLabel: stored ? "Replace key" : "Store key",
    storeName: `${stored ? "Replace" : "Store"} key for ${label}`,
    removeName: `Remove key for ${label}`,
    canStore, canRemove, help, busy: !!busy,
  };
}

export function keyChangedText(provider, change) {
  const label = PROVIDER_LABELS[provider];
  return change === "stored"
    ? `${label} key stored in the macOS Keychain. Nothing was sent and consent did not change.`
    : `${label} key removed from the macOS Keychain.`;
}
// These failures leave the outcome unknown, so presence is read again.
export const KEY_RECHECK = Object.freeze(["KEYCHAIN_HELPER_UNAVAILABLE", "KEYCHAIN_REFUSED", "HELPER_TIMEOUT", "HELPER_OUTPUT_LIMIT"]);

// ---------------------------------------------------------------- ledger

function normalizeByDay(byDay) {
  if (Array.isArray(byDay)) {
    return byDay.map(entry => ({ day: entry.day, ms: entry.ms ?? entry.foreground_ms ?? entry.total_ms ?? 0 }));
  }
  return Object.entries(byDay ?? {}).map(([day, ms]) => ({ day, ms: Number(ms) || 0 }));
}

export function formatDuration(ms) {
  const minutes = Math.floor((Number(ms) || 0) / 60000);
  if (minutes < 1) return "under 1 min";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} h ${String(rest).padStart(2, "0")} min` : `${hours} h`;
}

export function ledgerRows(summary, contexts = []) {
  const names = new Map(contexts.map(context => [context.uuid, context.name]));
  return (summary ?? []).map(entry => {
    const days = normalizeByDay(entry.by_day).filter(day => day.ms > 0)
      .sort((a, b) => (a.day < b.day ? 1 : a.day > b.day ? -1 : 0));
    const total = Number(entry.total_ms) || days.reduce((sum, day) => sum + day.ms, 0);
    return {
      host: entry.host,
      contextUuid: entry.context_uuid ?? null,
      contextName: entry.context_uuid == null ? "No space"
        : names.get(entry.context_uuid) ?? "Deleted space",
      totalMs: total,
      totalText: formatDuration(total),
      days: days.map(day => ({ ...day, text: formatDuration(day.ms) })),
    };
  }).sort((a, b) => b.totalMs - a.totalMs || a.host.localeCompare(b.host));
}

export function ledgerDays(summary) {
  const byDay = new Map();
  for (const entry of summary ?? []) {
    for (const { day, ms } of normalizeByDay(entry.by_day)) {
      if (!(ms > 0)) continue;
      const bucket = byDay.get(day) ?? { day, totalMs: 0, hosts: new Map() };
      bucket.totalMs += ms;
      bucket.hosts.set(entry.host, (bucket.hosts.get(entry.host) ?? 0) + ms);
      byDay.set(day, bucket);
    }
  }
  return [...byDay.values()].sort((a, b) => (a.day < b.day ? 1 : -1)).map(bucket => ({
    day: bucket.day,
    totalMs: bucket.totalMs,
    totalText: formatDuration(bucket.totalMs),
    hosts: [...bucket.hosts].map(([host, ms]) => ({ host, ms, text: formatDuration(ms) }))
      .sort((a, b) => b.ms - a.ms || a.host.localeCompare(b.host)),
  }));
}

export function exportFileName({ year, month, day }) {
  const pad = value => String(value).padStart(2, "0");
  return `axiosozo-usage-${year}-${pad(month)}-${pad(day)}.json`;
}

/** Same matching as the core's hostMatches: "*.x.com" matches subdomains only. */
export function hostMatches(pattern, host) {
  const p = String(pattern ?? "").toLowerCase().replace(/\.$/, "");
  const h = String(host ?? "").toLowerCase().replace(/\.$/, "");
  if (!p || !h) return false;
  return p.startsWith("*.") ? h.endsWith(p.slice(1)) && h.length > p.length - 1 : p === h;
}

/** Time on a rule's sites from usageSummary() results (all spaces). */
export function ruleUsage(rule, { today = [], week = [] } = {}) {
  const hosts = rule?.match?.hosts ?? [];
  const sum = summary => (summary ?? []).filter(entry => hosts.some(pattern => hostMatches(pattern, entry.host)))
    .reduce((total, entry) => total + (Number(entry.total_ms) || 0), 0);
  const todayMs = sum(today); const weekMs = sum(week);
  const limit = rule?.limits?.daily_minutes ?? null;
  const parts = [`Today ${formatDuration(todayMs)}${limit ? ` of ${limit} min` : ""}`, `7 days ${formatDuration(weekMs)}`];
  return { todayMs, weekMs, text: parts.join(" · "), overLimit: !!limit && todayMs >= limit * 60000 };
}

/** Top sites over a period, summed over spaces, marked when a rule covers them. */
export function siteUsageRows(summary, rules = [], limit = 8) {
  const byHost = new Map();
  for (const entry of summary ?? []) byHost.set(entry.host, (byHost.get(entry.host) ?? 0) + (Number(entry.total_ms) || 0));
  return [...byHost].map(([host, ms]) => ({ host, ms, text: formatDuration(ms),
    rule: rules.find(rule => rule.match?.hosts?.some(pattern => hostMatches(pattern, host)))?.id ?? null }))
    .filter(row => row.ms > 0)
    .sort((a, b) => b.ms - a.ms || a.host.localeCompare(b.host))
    .slice(0, limit);
}

// ---------------------------------------------------------------- attention

// Maps a needsAttention() item to one page action, or null.
export function attentionAction(item) {
  const target = item?.target;
  const pick = value => {
    if (typeof value !== "string") return null;
    if (/^r_[a-z0-9]{4,32}$/.test(value)) return { kind: "rule", id: value };
    if (/^p_[a-z0-9]{4,32}$/.test(value)) return { kind: "project", id: value };
    if (isHttpUrl(value)) return { kind: "url", url: value };
    return null;
  };
  if (typeof target === "string") return pick(target);
  if (target && typeof target === "object") {
    // AxioSozoServices.needsAttention emits { type: "rule"|"project", id } (contexts-api-v1 §3.3).
    const typed = target.type === "rule" || target.type === "project" ? pick(target.id) : null;
    if (typed && typed.kind === target.type) return typed;
    return pick(target.rule_id) ?? pick(target.project_id) ?? pick(target.url) ?? null;
  }
  return null;
}

// ---------------------------------------------------------------- watches (Plan 4 §4)

// A watch is a page, a plain-language question and a fixed set of answers.
// The browser checks it only on an explicit "Check now"; live checks are not
// authorized in this build, so a check records exactly that and sends nothing.
export const WATCH_OBSERVATIONS = Object.freeze(["none", "address", "outline", "screen"]);
export const WATCH_OBSERVATION_LABELS = Object.freeze({ none: "Nothing yet", address: "The address and title",
  outline: "An outline of the page", screen: "A screenshot (OpenAI only)" });
export const WATCH_INTERVALS = Object.freeze([1, 2, 5, 10, 15, 30]);
export const WATCH_DEFAULT_INTERVAL = 5;
export const WATCH_LIMITS = Object.freeze({ question: 500, label: 80, outcomesMin: 2, outcomesMax: 6, url: 2048, records: 256 });
export const WATCH_NOTE = "A watch asks one question about one page and answers with one of your own answers. You create every watch yourself; nothing else does.";
export const WATCH_LIVE_NOTE = "Live checks are not authorized in this build. Check now records that nothing was checked, and nothing leaves this Mac.";
export const WATCH_CONSENT_TEXT = "Allow this watch to send what it observes to the provider when live checks become available. Nothing is sent in this build.";
const WATCH_CONTROL_CHARS = /[\u0000-\u001f\u007f]/u;
const WATCH_OUTCOME_ID = /^[a-z][a-z0-9_]{0,31}$/u;

/** A new watch: observes nothing, Jev, no consent, on, the default interval. */
export function emptyWatchForm() {
  return { id: null, url: "", question: "", outcomes: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }],
    observation: "none", provider: "jev", consent: false, enabled: true, intervalMinutes: WATCH_DEFAULT_INTERVAL };
}

/** The editable fields of a saved watch (its id, project and history stay the browser's). */
export function watchToForm(watch) {
  return { id: watch.id, url: watch.url, question: watch.question,
    outcomes: listOf(watch.outcomes).map(item => ({ id: item.id, label: item.label })),
    observation: watch.observation, provider: watch.provider, consent: watch.consent === true, enabled: watch.enabled !== false,
    intervalMinutes: watch.schedule?.interval_minutes ?? WATCH_DEFAULT_INTERVAL };
}

/** What one Save asks the browser to store, as the browser stores it (the
 * address reduced to its origin and path), to recognise that save afterwards. */
export function watchSaveIntent(form) {
  let url = null;
  try {
    const parsed = new URL(String(form?.url ?? ""));
    parsed.username = ""; parsed.password = ""; parsed.search = ""; parsed.hash = "";
    url = parsed.href;
  } catch { url = null; }
  return Object.freeze({ url, question: String(form?.question ?? ""),
    outcomes: listOf(form?.outcomes).map(item => Object.freeze({ id: String(item?.id ?? ""), label: String(item?.label ?? "") })),
    observation: form?.observation ?? null, provider: form?.provider ?? null, consent: form?.consent === true, enabled: form?.enabled === true,
    intervalMinutes: Number(form?.intervalMinutes) });
}

/** True only when a stored watch has exactly the fields of that intent. */
export function watchMatchesIntent(watch, intent) {
  if (!watch || !intent || intent.url === null) return false;
  const outcomes = listOf(watch.outcomes);
  return watch.url === intent.url && watch.question === intent.question && outcomes.length === intent.outcomes.length
    && outcomes.every((item, index) => item?.id === intent.outcomes[index].id && item?.label === intent.outcomes[index].label)
    && watch.observation === intent.observation && watch.provider === intent.provider && watch.consent === intent.consent
    && watch.enabled === intent.enabled && watch.schedule?.interval_minutes === intent.intervalMinutes;
}

/** A short lowercase answer id from its label: unique among `taken`, never
 * "unknown" (reserved for no answer), at most 32 characters. */
export function outcomeKey(label, taken = []) {
  let base = String(label ?? "").normalize("NFKD").replace(/[̀-ͯ]/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/gu, "_").replace(/^_+|_+$/gu, "");
  if (!/^[a-z]/u.test(base)) base = base ? `answer_${base}` : "answer";
  base = base.slice(0, 28).replace(/_+$/u, "") || "answer";
  if (base === "unknown") base = "unknown_answer";
  let key = base;
  for (let n = 2; taken.includes(key); n++) key = `${base}_${n}`;
  return key;
}

/** Answer ids for the current labels, in order (the form keeps them in step). */
export function outcomeKeys(labels) {
  const taken = [];
  for (const label of labels) taken.push(outcomeKey(label, taken));
  return taken;
}

/** What is wrong with the form, as sentences; [] when it can be saved. Same
 * limits as the browser's own validation (contexts core watches). */
export function watchFormErrors(form) {
  const errors = [];
  const url = String(form?.url ?? "");
  if (!isHttpUrl(url) || /\s/u.test(url)) errors.push("Enter the page's address, starting with https:// or http://.");
  else if (url.length > WATCH_LIMITS.url) errors.push("The address is too long.");
  const question = String(form?.question ?? "");
  if (!question.trim()) errors.push("Write the question this watch asks.");
  else if (question.length > WATCH_LIMITS.question) errors.push(`Keep the question under ${WATCH_LIMITS.question} characters.`);
  else if (WATCH_CONTROL_CHARS.test(question)) errors.push("Write the question on one line.");
  const outcomes = listOf(form?.outcomes);
  if (outcomes.length < WATCH_LIMITS.outcomesMin || outcomes.length > WATCH_LIMITS.outcomesMax) errors.push("Give 2 to 6 possible answers.");
  const labels = outcomes.map(item => String(item?.label ?? ""));
  if (labels.some(label => !label.trim())) errors.push("Every answer needs a short label.");
  else if (labels.some(label => label.length > WATCH_LIMITS.label || WATCH_CONTROL_CHARS.test(label))) errors.push(`Keep each answer under ${WATCH_LIMITS.label} characters, on one line.`);
  else if (new Set(labels.map(label => label.trim().toLowerCase())).size !== labels.length) errors.push("Each answer needs its own label.");
  const ids = outcomes.map(item => item?.id);
  if (ids.some(id => typeof id !== "string" || !WATCH_OUTCOME_ID.test(id) || id === "unknown") || new Set(ids).size !== ids.length) {
    if (!errors.length) errors.push("The answers could not be named. Change a label and try again.");
  }
  if (!WATCH_OBSERVATIONS.includes(form?.observation)) errors.push("Choose what the watch may observe.");
  if (!DECISION_PROVIDERS.includes(form?.provider)) errors.push("Choose who would answer.");
  if (!Number.isInteger(form?.intervalMinutes) || form.intervalMinutes < 1 || form.intervalMinutes > 30) errors.push("Choose how often it may be checked.");
  return errors;
}

const WATCH_REASON_TEXT = Object.freeze({
  validated: "No clear answer", disabled: "The watch was off", cancelled: "Cancelled", timeout: "No answer in time",
  BLOCKED_AUTH: "The provider refused the key", HTTP_ERROR: "The provider could not be reached", NETWORK_ERROR: "The provider could not be reached",
  KEYCHAIN_ERROR: "The key could not be read", malformed_output: "The answer could not be read", budget_exhausted: "The hourly limit was reached",
  INVALID_INPUT: "The page could not be described", HOST_UNAVAILABLE: "The decision helper was not available",
  IMAGE_UNSUPPORTED: "Screenshots need OpenAI", UNVERIFIED_SHAPE: "OpenAI's answer format is not verified",
  NOT_AUTHORIZED: "Not checked: live checks are not authorized in this build",
});

/** The saved historical result of a watch: what it answered (or why not),
 * when, and whether anything was sent. Never a current observation; while a
 * check runs (busy) an earlier answer is not presented as a current one. */
export function watchResultView(latest, watch, { now = null, busy = false } = {}) {
  if (!latest) return { tone: "none", text: "Not checked yet", detail: null, ago: null };
  const ago = Number.isSafeInteger(now) && Number.isSafeInteger(latest.checked_at) ? timeAgo(now - latest.checked_at) : null;
  const sent = latest.data_sent === true ? `Data was sent to ${PROVIDER_LABELS[latest.provider] ?? "the provider"}.` : "Nothing was sent.";
  if (latest.reason === "validated" && latest.outcome !== "unknown") {
    const label = listOf(watch?.outcomes).find(item => item.id === latest.outcome)?.label ?? latest.outcome;
    const confidence = typeof latest.confidence === "number" ? ` · ${Math.round(latest.confidence * 100)}% sure` : "";
    return busy ? { tone: "none", text: `Earlier answer: ${label}${confidence}`, detail: sent, ago }
      : { tone: "ok", text: `Answer: ${label}${confidence}`, detail: sent, ago };
  }
  return { tone: latest.reason === "NOT_AUTHORIZED" ? "info" : "warn", text: WATCH_REASON_TEXT[latest.reason] ?? "No answer", detail: sent, ago };
}

/** Why a watch is or is not checked, from its saved fields only. */
export function watchScheduleView(watch, { now = null } = {}) {
  if (watch?.enabled === false) return { state: "off", text: "Turned off" };
  if (watch?.observation === "none") return { state: "unobserved", text: "Observes nothing yet, so it is never checked" };
  if (watch?.consent !== true) return { state: "no-consent", text: "Not checked until you allow it to send" };
  const interval = watch.schedule?.interval_minutes ?? WATCH_DEFAULT_INTERVAL;
  const last = watch.schedule?.last_checked_at ?? null;
  const every = `every ${interval} ${interval === 1 ? "minute" : "minutes"} at most`;
  if (last === null || !Number.isSafeInteger(now)) return { state: "due", text: `Can be checked now · ${every}` };
  const due = last + interval * 60_000;
  return now >= due ? { state: "due", text: `Can be checked now · ${every}` }
    : { state: "waiting", text: `Can be checked again in ${Math.max(1, Math.ceil((due - now) / 60_000))} min · ${every}` };
}

/** One watch row: question, page, what it may observe and who would answer. */
export function watchRow(watch, { now = null, projectName: owner = null, busy = false } = {}) {
  const schedule = watchScheduleView(watch, { now });
  return { id: watch.id, question: watch.question, url: watch.url, address: displayAddress(watch.url), project: owner,
    observation: WATCH_OBSERVATION_LABELS[watch.observation] ?? watch.observation,
    provider: PROVIDER_LABELS[watch.provider] ?? watch.provider, answers: listOf(watch.outcomes).map(item => item.label),
    schedule, checkable: schedule.state === "due" || schedule.state === "waiting",
    result: watchResultView(watch.latest_result, watch, { now, busy }) };
}

/** A project's own watches, newest first (the saved list is profile-wide). */
export function projectWatches(watches, projectId) {
  return listOf(watches).filter(watch => watch?.project_id === projectId).sort((a, b) => b.created_at - a.created_at || (a.id < b.id ? -1 : 1));
}

const WATCH_ACTION_TEXT = Object.freeze({
  NOT_DUE: "Not checked: it was checked less than its interval ago.",
  disabled: "Not checked: the watch is off, observes nothing or may not send.",
  BUSY: "Not checked: another check is still running.",
  NOT_FOUND: "That watch is not here anymore.", UNKNOWN_WATCH: "That watch is not here anymore.",
  CLEANUP_REQUIRED: "Not checked: an earlier check still needs its cleanup.",
  RECOVERY_REQUIRED: "Not checked: an earlier result still needs to be cleared.",
  CHECK_CANCELLED: "The check was cancelled when the page changed.",
  INVALID_INPUT: "The watch could not be saved. Check the address, the question and the answers.",
  INVALID_WATCH: "The watch could not be saved. Check the address, the question and the answers.",
  UNKNOWN_PROJECT: "This project is not here anymore.", PROJECT_CHANGED: "The project was changing. Try again in a moment.",
  PROJECT_MISMATCH: "That watch belongs to another project.", WATCH_ID_CONFLICT: "The watch could not be saved. Try again.",
  WATCH_LIMIT: `There are already ${WATCH_LIMITS.records} watches. Remove one first.`,
  // Neither of these knows whether the change reached the saved list.
  DOCUMENT_GONE: "The page changed before that finished, so it cannot be confirmed here. The list shows what AxioSozo has now.",
  NO_WINDOW: "Watches are managed from a normal browser window.", PRIVATE_WINDOW: "Watches are managed from a normal browser window.",
  STORAGE_ERROR: "Saving the watches on this Mac failed, so the change is not confirmed. The list shows what AxioSozo has now.",
  INVALID_STORE: "The saved watches could not be read, so nothing was changed.",
  CLOSED: "Watches are closing with AxioSozo.", NOTHING_TO_RETRY: "There was nothing left to retry.",
});
export function watchActionText(code) {
  return WATCH_ACTION_TEXT[code] ?? "That did not work. Try again.";
}

/** One finished check as the browser reported it, with its disclosure: a
 * check that may have sent data says so even when it was cancelled. */
export function watchReportText(report) {
  if (report?.code === "NOT_AUTHORIZED") return "Recorded: not checked, because live checks are not authorized in this build. Nothing was sent.";
  const sent = report?.data_sent === true
    ? report.disclosure === "conservative" ? "Data may have left this Mac." : "Data was sent." : "Nothing was sent.";
  const what = report?.code === "APPLIED" ? "Checked; the answer is shown above."
    : WATCH_ACTION_TEXT[report?.code] ?? (WATCH_REASON_TEXT[report?.reason] ? `${WATCH_REASON_TEXT[report.reason]}.` : "The check did not finish.");
  return `${what} ${sent}`;
}
// Manual outcomes that are not failures, only "nothing was checked".
const WATCH_NOTICES = Object.freeze(["NOT_DUE", "disabled", "BUSY"]);

const WATCH_PHASE_TEXT = Object.freeze({ starting: "A check is starting…", opening: "Opening the page…", capture: "Looking at the page…",
  indicator: "Showing the sending notice…", provider: "Waiting for the answer…", cleanup: "Cleaning up after a check…",
  compensation: "Clearing a stale answer…" });

/** The controller's fixed status for a page: one quiet line, the problem that
 * blocks further checks (and whether Retry may be offered), the latest manual
 * outcome and an honest disclosure while an answer is still owed. */
export function watchStatusView(status, { error = null } = {}) {
  if (!status) return { state: error ? "unavailable" : "loading", text: error ? "Watch status cannot be shown right now." : null,
    problem: null, retry: false, notice: null, busy: false, disclosure: null };
  const problem = status.recovery_required ? "A stale answer could not be cleared from a watch. No other check runs until it is."
    : status.cleanup_required ? "A check could not finish its cleanup. No other check runs until it does." : null;
  const failure = status.last_error && typeof status.last_error.code === "string" ? status.last_error : null;
  return {
    state: problem ? "blocked" : status.busy ? "busy" : "idle",
    text: status.busy ? WATCH_PHASE_TEXT[status.phase] ?? "A check is running…" : null,
    problem, retry: !!problem && status.retry_allowed === true,
    notice: failure ? { action: failure.action ?? null, code: failure.code, watchId: failure.watch_id ?? null,
      tone: WATCH_NOTICES.includes(failure.code) ? "info" : "warn", text: watchActionText(failure.code) } : null,
    busy: status.busy === true,
    disclosure: status.pending_disclosure ? "Data may have left this Mac for the running check; its answer has not arrived."
      : status.last?.data_sent === true && status.last?.disclosure === "conservative"
        ? "The last check may have sent data to the provider before it ended." : null,
  };
}

// ---------------------------------------------------------------- safety (P7)

export const SAFETY_TITLE = "Block adult and malicious sites";
// What the setting does, and no more: it only chooses the DNS resolver.
export const SAFETY_TEXT = "When on, this profile looks up site addresses with DNS over HTTPS through Cloudflare's family resolver (family.cloudflare-dns.com), which declines sites on Cloudflare's adult and malware lists. It is not a complete filter, and AxioSozo does not look at pages to decide.";
// The first-run offer: a proposal that changes nothing until it is saved.
export const SAFETY_OFFER_HELP = "One choice for this profile. The box starts checked; nothing changes until you save your choice.";
export const SAFETY_LATER = "You can change this later under AI & keys, or in Firefox Settings under Privacy & Security.";
export const SAFETY_OUTCOME_LABELS = Object.freeze({
  RESTORED: "My earlier settings are back", EXTERNAL_CHANGED: "I changed them myself", ACCEPTED: "Keep them as they are now" });
export const SAFETY_OUTCOMES = Object.freeze(["RESTORED", "EXTERNAL_CHANGED", "ACCEPTED"]);
const SAFETY_REASON_TEXT = Object.freeze({
  PREF_LOCKED: "DNS over HTTPS is locked by a policy on this Mac, so AxioSozo changed nothing.",
  EXTERNAL_DOH_CONFIGURATION: "Another DNS over HTTPS setup is in place, so AxioSozo changed nothing.",
  PREF_READ_FAILED: "The DNS settings could not be read, so nothing was changed.",
  PREFS_CHANGED: "The DNS settings changed meanwhile, so AxioSozo left them as they are.",
  RESTORED: "Your earlier DNS settings are back.",
  RESOLUTION_REJECTED: "That answer does not match the current settings. Check them again.",
  RESOLVED: "Thanks. The unfinished change is closed.",
});
const SAFETY_ERROR_TEXT = Object.freeze({
  SAFETY_WRITER_BUSY: "Another AxioSozo window is using the safety setting. Try again in a moment.",
  SAFETY_NATIVE_CLEANUP_REQUIRED: "A DNS setting change could not be cleaned up. Restart AxioSozo before choosing again.",
  SAFETY_SEQUENCE_MISMATCH: "That question is out of date. The current one is shown.",
  PRIVATE_WINDOW: "This setting is changed from a normal window.", NO_WINDOW: "This setting is changed from a normal window.",
});
/** Why the setting cannot be shown; a failed read says nothing about changes. */
export function safetyErrorText(code) {
  return SAFETY_ERROR_TEXT[code] ?? "The safety setting cannot be read right now.";
}

// The owner's own answers for a settled, acknowledged state.
const SAFETY_SETTLED = Object.freeze(["CURRENT", "INITIALIZED"]);
// The owner's record cannot be read (STORE_UNAVAILABLE), or the browser's
// answer had no known code at all (the actor's SAFETY_UNAVAILABLE).
const SAFETY_UNREADABLE = Object.freeze(["STORE_UNAVAILABLE", "SAFETY_UNAVAILABLE"]);
const SAFETY_UNREADABLE_VIEW = Object.freeze({ state: "unavailable", tone: "warn", form: false, checked: true, recovery: null, note: null,
  text: "AxioSozo could not read its record of this choice, so it changes nothing. Restart AxioSozo to try again." });

/**
 * What the page shows for the safety choice, from the browser's latest
 * categorical answer only: loading, unavailable (also whenever the latest read
 * failed, whatever an older answer said), a blocked state (an unfinished change
 * to acknowledge only when the owner itself answers RECOVERY_REQUIRED, a
 * cleanup, or a record that cannot be read), the first-run offer (a checked
 * proposal awaiting Save), or the saved choice with what is set now. Nothing is
 * shown as configured unless the owner's settled answer says so.
 */
export function safetyView(reply, { error = null } = {}) {
  if (!reply || error) return { state: error ? "unavailable" : "loading", tone: error ? "warn" : "none",
    text: error ? safetyErrorText(error) : "Reading the current setting…", form: false, checked: true, recovery: null, note: null };
  const note = SAFETY_REASON_TEXT[reply.reason] ?? SAFETY_ERROR_TEXT[reply.reason] ?? null;
  const cleanup = { state: "cleanup", tone: "warn", form: false, checked: true, recovery: null, note: null,
    text: "A DNS setting change could not be cleaned up. Restart AxioSozo before choosing again." };
  if (reply.code === "NATIVE_CLEANUP_REQUIRED") return cleanup;
  // A record that cannot be read is that, whatever the unknown cleanup fact
  // projects as: never a claim that a DNS change failed its cleanup.
  if (SAFETY_UNREADABLE.includes(reply.code)) return { ...SAFETY_UNREADABLE_VIEW };
  if (reply.cleanup_blocked) return cleanup;
  if (reply.code === "RECOVERY_REQUIRED") {
    return { state: "recovery", tone: "warn", form: false, checked: true, note: null,
      text: "A change to DNS over HTTPS did not finish, so AxioSozo changes nothing until you tell it what you see. Open Firefox Settings → Privacy & Security → DNS over HTTPS, then choose. Your answer is only recorded; it changes no setting.",
      recovery: Number.isSafeInteger(reply.sequence) && reply.sequence > 0 ? { sequence: reply.sequence, outcomes: SAFETY_OUTCOMES.map(outcome =>
        ({ outcome, label: SAFETY_OUTCOME_LABELS[outcome] })) } : null };
  }
  // Anything else blocked or unsettled stays unavailable, with or without a
  // sequence; only the owner's own code above asks for recovery.
  if (reply.blocked || !SAFETY_SETTLED.includes(reply.code)) return { ...SAFETY_UNREADABLE_VIEW };
  const offer = reply.offer, status = reply.status;
  const now = !status ? "The current DNS setting could not be read, so it is shown as unknown."
    : status.active ? (status.owned ? "On: AxioSozo set Cloudflare's family filter." : "On: the family filter is set, outside AxioSozo.")
      : "Off: DNS over HTTPS does not use the family filter.";
  if (offer?.offer === true) {
    return { state: "offer", tone: "none", form: true, checked: offer.checked !== false, recovery: null, note, text: now };
  }
  return { state: "chosen", tone: status?.active ? "ok" : "none", form: true, checked: offer ? offer.checked === true : status?.active === true,
    recovery: null, note, text: now };
}

// ---------------------------------------------------------------- start page (P6, experimental)

export const START_PAGE_NOTE = "Experimental. Turned on with axiosozo.home.enabled; only Firefox's own new-tab page is replaced.";

/** The start page from data the page already reads: what needs you (attention
 * and watch problems), agents that finished or are working, projects with
 * their local servers, and every watch with its saved result, newest first.
 * `homes` maps a project id to its home answer (null: not readable now). */
export function startPageView({ attention = [], projects = [], watches = [], watchStatus = null, homes = new Map(), statuses = new Map(), now = null } = {}) {
  const names = new Map(listOf(projects).map(project => [project.id, projectName(project)]));
  const status = watchStatusView(watchStatus);
  const needs = listOf(attention).map(item => ({ kind: item?.kind ?? "other", title: item?.title ?? "Needs attention",
    detail: item?.detail ?? "", action: attentionAction(item) }));
  if (status.problem) needs.unshift({ kind: "watch", title: "A watch needs you", detail: status.problem, action: null });
  const agents = [];
  let agentsUnavailable = false;
  for (const project of listOf(projects)) {
    if (!homes.has(project.id)) continue;
    const home = homes.get(project.id);
    const view = homeAgentActivity(home?.agent_activity ?? null, { root: project.root, now });
    if (view.state === "unavailable") { agentsUnavailable = true; continue; }
    for (const item of view.items) if (item.state === "done" || item.state === "started") agents.push({ ...item, project: names.get(project.id), projectId: project.id });
  }
  agents.sort((a, b) => b.at - a.at);
  const rows = listOf(watches).map(watch => watchRow(watch, { now, projectName: names.get(watch.project_id) ?? null }));
  const at = id => listOf(watches).find(watch => watch.id === id)?.latest_result?.checked_at ?? -1;
  rows.sort((a, b) => at(b.id) - at(a.id) || (a.id < b.id ? -1 : 1));
  return {
    needs,
    agents: agents.slice(0, 8), agentsUnavailable: agentsUnavailable && !agents.length,
    projects: listOf(projects).map(project => ({ id: project.id, name: names.get(project.id), href: homeHash(project.id),
      local: localSummary(project, statuses.get(project.id) ?? []) })),
    watches: rows.slice(0, 12), moreWatches: Math.max(0, rows.length - 12), status,
  };
}
