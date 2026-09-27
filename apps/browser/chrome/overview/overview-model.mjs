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
export const OBSERVATIONS = Object.freeze(["none", "address", "outline"]);
export const AGENT_ACCESS = Object.freeze(["none", "read", "act_with_confirmation"]);
export const WEEKDAYS = Object.freeze(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
export const LEDGER_RETENTION_DAYS = 90;
export const MAX_HOSTS = 32;
export const MAX_WINDOWS = 8;
export const MAX_INSTRUCTION = 2000;

export const OBSERVATION_TEXT = Object.freeze({
  none: "Nothing leaves this machine. Only the local limits and allowed hours apply.",
  address: "When Jev is consulted: the site origin, the path (never the query or fragment) and the page title, with this rule's instruction and effects.",
  outline: "Reserved for page outlines (headings, link texts and form labels with opaque IDs; never form values, passwords, cross-origin frames, selections or private windows). This build sends the Address level only.",
});
export const SENSITIVE_CAP_TEXT = "Banking, government, health, identity and password-manager sites are capped at Address unless you raise the level for that host below.";
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
    createdAt: null,
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
    createdAt: rule.created_at ?? null,
  };
}

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
  const raised = form.observation === "outline"
    ? [...new Set(form.raisedHosts ?? [])].filter(host => hosts.includes(host)) : [];

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
    },
  };
}

export function describeRule(rule) {
  const parts = [];
  parts.push(rule.limits?.daily_minutes ? `${rule.limits.daily_minutes} min per day` : "no daily limit");
  const windows = rule.limits?.allowed_hours;
  if (windows?.length) parts.push("allowed " + windows.map(describeWindow).join(", "));
  parts.push(`observation: ${rule.observation}`);
  parts.push(rule.effects?.length ? "effects: " + rule.effects.join(", ").replaceAll("_", " ") : "no effects");
  if (rule.contexts !== "all") {
    const scope = [...(rule.contexts?.types ?? [])];
    const count = rule.contexts?.workspaces?.length ?? 0;
    if (count) scope.push(`${count} context${count === 1 ? "" : "s"}`);
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

function reviewRow(item, keys) {
  const row = {};
  for (const key of keys) row[key] = item[key] == null ? "" : String(item[key]);
  row.source = item.source ?? "";
  row.guess = item.guess === true;
  return row;
}

export function draftToReview(draft) {
  return {
    name: draft.name ?? "",
    kind: draft.kind ?? "web",
    kindSource: { source: draft.kind_source?.source ?? "", guess: draft.kind_source?.guess === true },
    environments: (draft.environments ?? []).map(item => reviewRow(item, ["name", "base_url"])),
    services: (draft.services ?? []).map(item => reviewRow(item, ["name", "url", "port"])),
    surfaces: (draft.surfaces ?? []).map(item => reviewRow(item, ["name", "url", "kind"])),
    frameworks: [...(draft.frameworks ?? [])],
    filesRead: [...(draft.files_read ?? [])],
    refused: (draft.refused ?? []).map(item => ({ path: item.path, reason: item.reason })),
    warnings: [...(draft.warnings ?? [])],
  };
}

export function projectToReview(project) {
  const manifest = project.manifest;
  const confirmed = item => ({ ...item, source: "confirmed", guess: false });
  return {
    ...draftToReview({
      name: manifest.name, kind: manifest.kind, kind_source: { source: "confirmed", guess: false },
      environments: manifest.environments.map(confirmed),
      services: manifest.services.map(confirmed),
      surfaces: manifest.surfaces.map(confirmed),
    }),
    contextUuid: project.context_uuid ?? null,
  };
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

// → { manifest, errors }. Empty rows are dropped; everything else must be valid.
export function reviewToManifest(review) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });
  const name = String(review.name ?? "").trim();
  if (!validName(name)) add("name", "Project name must be 1 to 80 characters.");
  if (!PROJECT_KINDS.includes(review.kind)) add("kind", "Choose a project kind.");

  const environments = [];
  (review.environments ?? []).forEach((row, index) => {
    if (isBlank(row, ["name", "base_url"])) return;
    const envName = String(row.name ?? "").trim();
    const baseUrl = normalizeBaseUrl(String(row.base_url ?? "").trim());
    if (!ENV_NAME.test(envName)) add("environments", `Environment ${index + 1}: use a lower-case name such as local, preview or production.`);
    else if (environments.some(env => env.name === envName)) add("environments", `Environment ${index + 1}: "${envName}" is listed twice.`);
    if (!baseUrl) add("environments", `Environment ${index + 1}: enter an http or https address without query or fragment.`);
    if (ENV_NAME.test(envName) && baseUrl) environments.push({ name: envName, base_url: baseUrl });
  });
  if (environments.length > 16) add("environments", "Use at most 16 environments.");

  const services = [];
  (review.services ?? []).forEach((row, index) => {
    if (isBlank(row, ["name", "url", "port"])) return;
    const serviceName = String(row.name ?? "").trim();
    const url = normalizeWebUrl(String(row.url ?? "").trim());
    const port = parseInteger(row.port, 1, 65535);
    if (!validName(serviceName)) add("services", `Service ${index + 1}: enter a name.`);
    if (!url) add("services", `Service ${index + 1}: enter an http or https address without query or fragment.`);
    if (port === null) add("services", `Service ${index + 1}: port must be 1 to 65535.`);
    if (validName(serviceName) && url && port !== null) services.push({ name: serviceName, url, port });
  });
  if (services.length > 32) add("services", "Use at most 32 services.");

  const surfaces = [];
  (review.surfaces ?? []).forEach((row, index) => {
    if (isBlank(row, ["name", "url"])) return;
    const surfaceName = String(row.name ?? "").trim();
    const url = normalizeWebUrl(String(row.url ?? "").trim());
    const kind = SURFACE_KINDS.includes(row.kind) ? row.kind : null;
    if (!validName(surfaceName)) add("surfaces", `Surface ${index + 1}: enter a name.`);
    if (!url) add("surfaces", `Surface ${index + 1}: enter an http or https address without query or fragment.`);
    if (!kind) add("surfaces", `Surface ${index + 1}: choose a kind.`);
    if (validName(surfaceName) && url && kind) surfaces.push({ name: surfaceName, url, kind });
  });
  if (surfaces.length > 64) add("surfaces", "Use at most 64 surfaces.");

  if (errors.length) return { manifest: null, errors };
  return { errors, manifest: { version: 1, name, kind: review.kind, environments, services, surfaces } };
}

export const REFUSAL_TEXT = Object.freeze({
  not_allowlisted: "not on the detection allowlist",
  too_large: "larger than 256 KiB",
  symlink_outside_root: "a link that leaves the project folder",
  not_regular_file: "not a regular file",
  unreadable: "could not be read",
  invalid_utf8: "not valid text",
});

// ---------------------------------------------------------------- contexts

export function contextRows(contexts, projects) {
  const organizations = contexts.filter(context => context.type === "organization")
    .map(context => ({ uuid: context.uuid, name: context.name }));
  const projectOptions = projects.map(project => ({ id: project.id, name: project.manifest?.name ?? project.id }));
  return contexts.map(context => ({
    ...context,
    showLinks: context.type === "project",
    organizationOptions: organizations.filter(org => org.uuid !== context.uuid),
    projectOptions,
  }));
}

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
      contextName: entry.context_uuid == null ? "No context"
        : names.get(entry.context_uuid) ?? "Deleted context",
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
