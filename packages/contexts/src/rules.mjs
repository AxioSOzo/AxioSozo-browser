/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
import { ContextsError } from './errors.mjs';
import { EFFECTS, JEV_REASON_CODES, OUTCOMES, deepFreeze, isRuleId, isWorkspaceUuid, validateSiteRule, validateSuppression } from './schema.mjs';

// Deterministic site-rule evaluation (handoff 3 §6.2 layer 1), the Jev outcome
// filter and the sensitive-category observation cap (§6.3). No per-site code:
// the sensitive list below is versioned data and can only lower observation.

export const OVERRIDE_DELAY_MS = 10000;
export const SENSITIVE_HOSTS_VERSION = 'sensitive-hosts-v1';
const SUPPRESS_MS = Object.freeze({ nudge: 5 * 60000, suggest_leave: 15 * 60000, pause_site: 15 * 60000 });

// Registrable suffixes: a host matches when it equals the entry or ends with
// "." + entry. Patterns are whole-suffix classes (".gov.<cc>" and similar).
export const SENSITIVE_HOSTS = deepFreeze({
  version: SENSITIVE_HOSTS_VERSION,
  suffixes: {
    government: [
      'gov', 'mil', 'gouv.fr', 'service-public.fr', 'bund.de', 'admin.ch', 'gv.at', 'belgium.be', 'fgov.be',
      'europa.eu', 'gc.ca', 'canada.ca', 'overheid.nl', 'rijksoverheid.nl', 'mijnoverheid.nl', 'belastingdienst.nl',
      'toeslagen.nl', 'kvk.nl', 'digid.nl', 'uwv.nl', 'svb.nl', 'duo.nl', 'rdw.nl', 'cjib.nl', 'politie.nl', 'rvo.nl',
    ],
    banking: [
      'bank', 'ing.nl', 'ing.com', 'abnamro.nl', 'abnamro.com', 'rabobank.nl', 'rabobank.com', 'asnbank.nl', 'snsbank.nl',
      'regiobank.nl', 'triodos.nl', 'knab.nl', 'bunq.com', 'revolut.com', 'wise.com', 'paypal.com', 'americanexpress.com',
    ],
    health: ['nhs.uk', 'rivm.nl'],
    identity: [
      'accounts.google.com', 'myaccount.google.com', 'login.microsoftonline.com', 'login.live.com', 'account.microsoft.com',
      'appleid.apple.com', 'account.apple.com', 'idin.nl', 'itsme-id.com', 'okta.com', 'auth0.com', 'login.gov', 'id.me',
    ],
    password_manager: [
      '1password.com', '1password.eu', 'bitwarden.com', 'bitwarden.eu', 'lastpass.com', 'dashlane.com', 'keepersecurity.com',
      'nordpass.com', 'pass.proton.me', 'account.proton.me', 'roboform.com',
    ],
  },
  // Country-code government second levels such as gov.uk, gob.mx, gouv.ci, go.jp, govt.nz, mil.br.
  patterns: { government: [/(^|\.)(gov|gob|gouv|go|govt|mil)\.[a-z]{2}$/] },
});

const normHost = h => typeof h === 'string' ? h.replace(/[A-Z]/g, c => c.toLowerCase()).replace(/\.$/, '') : '';

export function isSensitiveHost(host) {
  const h = normHost(host);
  if (!h) return Object.freeze({ sensitive: false, category: null });
  for (const [category, list] of Object.entries(SENSITIVE_HOSTS.suffixes)) {
    if (list.some(s => h === s || h.endsWith(`.${s}`))) return Object.freeze({ sensitive: true, category });
  }
  for (const [category, list] of Object.entries(SENSITIVE_HOSTS.patterns)) {
    if (list.some(re => re.test(h))) return Object.freeze({ sensitive: true, category });
  }
  return Object.freeze({ sensitive: false, category: null });
}

// "*.x.com" matches subdomains only; anything else matches exactly.
export function hostMatches(pattern, host) {
  const p = normHost(pattern), h = normHost(host);
  if (!p || !h) return false;
  return p.startsWith('*.') ? h.endsWith(p.slice(1)) && h.length > p.length - 1 : p === h;
}

function contextMatches(contexts, { contextUuid, contextType }) {
  if (contexts === 'all') return true;
  return !!(contexts?.types?.includes(contextType) || (contextUuid != null && contexts?.workspaces?.includes(contextUuid)));
}
export function ruleMatches(rule, { host, contextUuid = null, contextType } = {}) {
  return !!rule?.enabled && Array.isArray(rule.match?.hosts) && rule.match.hosts.some(p => hostMatches(p, host)) && contextMatches(rule.contexts, { contextUuid, contextType });
}
export function rulesFor(rules, query) {
  return Object.freeze((Array.isArray(rules) ? rules : []).filter(r => ruleMatches(r, query)));
}

const minutesOf = t => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
// A window starts on its listed days; end <= start wraps past midnight into the next day.
export function insideAllowedHours(windows, { minutes, weekday }) {
  return windows.some(w => {
    const start = minutesOf(w.start), end = minutesOf(w.end);
    const on = d => !w.days || w.days.includes(d);
    if (end > start) return minutes >= start && minutes < end && on(weekday);
    return (minutes >= start && on(weekday)) || (minutes < end && on((weekday + 6) % 7));
  });
}

const evaluation = (rule, effect, source, reason) => Object.freeze({ rule_id: rule.id, effect, source, reason_code: effect === 'none' ? null : reason });

function activeSuppression(suppressions, { ruleId, contextUuid, effect, now }) {
  return (Array.isArray(suppressions) ? suppressions : []).some(s => s && s.rule_id === ruleId && (s.context_uuid ?? null) === (contextUuid ?? null) && s.effect === effect && Number.isFinite(s.until) && s.until > now);
}

// Layer 1. See README "Deterministic evaluation" for the exact semantics.
export function evaluateDeterministic({ rule, usageTodayMs = 0, local, contextUuid = null, suppressions = [], now, host, contextType } = {}) {
  const r = validateSiteRule(rule);
  if (!Number.isFinite(usageTodayMs) || usageTodayMs < 0) throw new ContextsError('INVALID_INPUT', '$.usageTodayMs: expected a non-negative number', '$.usageTodayMs');
  if (!Number.isSafeInteger(now) || now < 0) throw new ContextsError('INVALID_INPUT', '$.now: expected epoch ms', '$.now');
  if (!Number.isInteger(local?.minutes) || local.minutes < 0 || local.minutes > 1439 || !Number.isInteger(local?.weekday) || local.weekday < 0 || local.weekday > 6) {
    throw new ContextsError('INVALID_INPUT', '$.local: expected { minutes: 0–1439, weekday: 0–6 }', '$.local');
  }
  if (!r.enabled) return evaluation(r, 'none', 'deterministic', null);
  if (host !== undefined && !ruleMatches(r, { host, contextUuid, contextType })) return evaluation(r, 'none', 'deterministic', null);
  let reason = null;
  if (r.limits.daily_minutes !== null && usageTodayMs >= r.limits.daily_minutes * 60000) reason = 'daily_limit_reached';
  else if (r.limits.allowed_hours !== null && !insideAllowedHours(r.limits.allowed_hours, local)) reason = 'outside_allowed_hours';
  if (!reason) return evaluation(r, 'none', 'deterministic', null);
  const effect = r.effects.includes('pause_site') ? 'pause_site' : r.effects.includes('nudge') ? 'nudge' : 'none';
  if (effect === 'none' || activeSuppression(suppressions, { ruleId: r.id, contextUuid, effect, now })) return evaluation(r, 'none', 'deterministic', null);
  return evaluation(r, effect, 'deterministic', reason);
}

// Layer 2 filter: a Jev outcome counts only if the (current) rule lists it.
export function applyJevOutcome(rule, outcome, reasonCode = null) {
  const r = validateSiteRule(rule);
  const effect = r.enabled && OUTCOMES.includes(outcome) && outcome !== 'none' && r.effects.includes(outcome) ? outcome : 'none';
  return evaluation(r, effect, 'jev', JEV_REASON_CODES.includes(reasonCode) ? reasonCode : null);
}

// The level that may leave the machine for this host: the rule's level, capped
// at address for sensitive hosts unless the user raised it for a matching
// pattern; none when the host is not covered by the rule at all.
export function effectiveObservation(rule, host) {
  const r = validateSiteRule(rule);
  if (!r.match.hosts.some(p => hostMatches(p, host))) return 'none';
  if (r.observation !== 'outline' || !isSensitiveHost(host).sensitive) return r.observation;
  return r.observation_raised_hosts.some(p => hostMatches(p, host)) ? 'outline' : 'address';
}

export function suppress({ ruleId, contextUuid = null, effect, now } = {}) {
  if (!isRuleId(ruleId)) throw new ContextsError('INVALID_INPUT', '$.ruleId: invalid rule id', '$.ruleId');
  if (contextUuid !== null && !isWorkspaceUuid(contextUuid)) throw new ContextsError('INVALID_INPUT', '$.contextUuid: invalid workspace uuid', '$.contextUuid');
  if (!EFFECTS.includes(effect)) throw new ContextsError('INVALID_INPUT', '$.effect: expected an effect', '$.effect');
  if (!Number.isSafeInteger(now) || now < 0) throw new ContextsError('INVALID_INPUT', '$.now: expected epoch ms', '$.now');
  return validateSuppression({ rule_id: ruleId, context_uuid: contextUuid, effect, until: now + SUPPRESS_MS[effect] });
}
export const activeSuppressions = (suppressions, now) => Object.freeze((Array.isArray(suppressions) ? suppressions : []).filter(s => s?.until > now));
