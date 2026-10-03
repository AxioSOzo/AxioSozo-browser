/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */
// The same src bytes load in privileged Firefox chrome: no Node, DOM, chrome
// globals, network, timers or ambient time/randomness, and relative imports only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import * as api from '../src/index.mjs';

const SRC = new URL('../src/', import.meta.url);
const EXPECTED_MODULES = ['agent-config.mjs', 'agent-status.mjs', 'ai-admission.mjs', 'arrival.mjs', 'checkpoints.mjs', 'containers.mjs', 'detect.mjs', 'environments.mjs', 'errors.mjs', 'index.mjs', 'ledger.mjs', 'manifest.mjs', 'rules.mjs', 'safety-choice.mjs', 'schema.mjs', 'watches.mjs'];
const FORBIDDEN = [
  [/['"]node:/, 'node: specifier'], [/\brequire\s*\(/, 'require()'], [/\bimport\s*\(/, 'dynamic import()'], [/\bimport\.meta\b/, 'import.meta'],
  [/\bprocess\s*[.[]/, 'process'], [/\bBuffer\s*[.(]/, 'Buffer'], [/\bfetch\s*\(/, 'fetch'],
  [/\bXMLHttpRequest\b|\bWebSocket\b|\bEventSource\b|\bnavigator\s*\./, 'network'],
  [/\bset(Timeout|Interval|Immediate)\s*\(|\bqueueMicrotask\s*\(|\brequestAnimationFrame\s*\(|\brequestIdleCallback\s*\(/, 'timers'],
  [/\bDate\s*\.\s*now\b/, 'Date.now'], [/\bnew\s+Date\b/, 'new Date'], [/\bperformance\s*\./, 'performance'],
  [/\bMath\s*\.\s*random\b/, 'Math.random'], [/\bcrypto\s*\./, 'crypto'],
  [/\bwindow\s*[.[]|\bdocument\s*[.[]|\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b/, 'DOM'],
  [/\b(Services|ChromeUtils|IOUtils|PathUtils|Components|Cu|Cc|Ci)\s*\./, 'chrome globals'],
  [/\bglobalThis\b|\beval\s*\(|\bFunction\s*\(/, 'dynamic code / global object'],
  [/\bfs\s*\.|\bchild_process\b|\bSubprocess\b/, 'file or process access'],
];
export function violations(source) {
  const found = FORBIDDEN.filter(([re]) => re.test(source)).map(([, label]) => label);
  for (const m of source.matchAll(/\b(?:import|export)\b[^'"`;]*?\bfrom\s*(['"])([^'"]+)\1|\bimport\s*(['"])([^'"]+)\3/g)) {
    const spec = m[2] ?? m[4];
    if (!/^\.\/[a-z-]+\.mjs$/.test(spec)) found.push(`non-relative import ${spec}`);
  }
  return found;
}
const sources = async () => (await readdir(SRC)).filter(f => f.endsWith('.mjs') && !f.startsWith('._')).sort();

test('src contains exactly the contract modules', async () => {
  assert.deepEqual(await sources(), EXPECTED_MODULES);
});

test('src has no forbidden tokens, only relative imports, and an MPL header', async () => {
  for (const file of await sources()) {
    const text = await readFile(new URL(file, SRC), 'utf8');
    assert.deepEqual(violations(text), [], file);
    assert.match(text, /^\/\* This Source Code Form is subject to the terms of the Mozilla Public\n \* License, v\. 2\.0\. https:\/\/mozilla\.org\/MPL\/2\.0\/ \*\//, `${file} header`);
    for (const m of text.matchAll(/\bfrom\s*'(\.\/[a-z-]+\.mjs)'/g)) await access(new URL(m[1], SRC));
  }
});

test('the scanner itself catches violations', () => {
  for (const bad of ["import fs from 'node:fs';", 'const t = Date.now();', 'new Date()', "import x from 'lodash';", 'setTimeout(f, 1)',
    'Services.prefs.getBoolPref("x")', 'IOUtils.read(p)', 'await fetch(u)', 'process.env.X', 'Buffer.from(s)', 'window.open()',
    'document.title', 'Math.random()', 'globalThis.x', "const m = await import('./x.mjs')", 'crypto.randomUUID()', "export * from '../other/x.mjs';"]) {
    assert.notDeepEqual(violations(bad), [], bad);
  }
  assert.deepEqual(violations("import { a } from './schema.mjs';\nexport { b } from './rules.mjs';\n// private windows and a window of time\nDate.UTC(2026, 0, 1)"), []);
});

test('index exports the contexts-api-v1 §2 surface', () => {
  const required = [
    'ContextsError',
    'validateContextMetadata', 'validateProject', 'validateManifest', 'validateContextStore', 'validateSiteRule', 'validateRuleStore',
    'validateLedger', 'validateLedgerRecord', 'validateHostPattern', 'validateBaseUrl', 'newRule', 'DEFAULT_RULE_STORE', 'DEFAULT_LEDGER',
    'EFFECTS', 'OUTCOMES', 'REASON_CODES',
    'MAX_FILE_BYTES', 'DETECTION_FILES', 'isAllowedPath', 'detectProject',
    'MANIFEST_PATH', 'draftToManifest', 'parseManifest', 'serializeManifest', 'assertNoSecrets',
    'ENV_ORDER', 'orderedEnvironments', 'matchEnvironment', 'switchEnvironment', 'isDeclaredLocalOrigin',
    'hostMatches', 'ruleMatches', 'rulesFor', 'evaluateDeterministic', 'applyJevOutcome', 'effectiveObservation', 'isSensitiveHost',
    'SENSITIVE_HOSTS_VERSION', 'suppress', 'OVERRIDE_DELAY_MS',
    'localDay', 'recordForeground', 'usageFor', 'prune', 'summarize', 'exportLedger', 'clearLedger',
    'DEFAULT_INTERVAL_MINUTES', 'DEFAULT_HOURLY_BUDGET', 'createBudget', 'takeBudget', 'nextCheckpoint', 'buildSiteRuleRequest',
    // Monorepos, projects in any space, prominence, tab linking (contexts-api-v1 §2.2–§2.4).
    'MAX_WORKSPACE_PACKAGES', 'PACKAGE_DETECTION_FILES', 'isPackageDir', 'isAllowedPackagePath', 'packageDetectionRefusal', 'normalizeWorkspacePattern',
    'workspaceCandidates', 'expandWorkspaceGlobs', 'detectionRefusal', 'migrateContextStore', 'projectsInContext', 'CONTEXT_STORE_VERSION',
    'surfaceProminence', 'SURFACE_PROMINENCE', 'PRIMARY_SURFACE_KINDS', 'environmentKey', 'withProductionUrl', 'mainWebApp', 'matchProjectForUrl',
    // workstation-v1 §1 detection v2.
    'inventoryPlan', 'inventoryRefusal', 'documentFiles', 'documentRefusal', 'INTEGRATIONS',
    // §2 project record v2, context store v3.
    'DEFAULT_SHARED_SITES', 'upgradeProject', 'INTEGRATION_IDS', 'PLATFORM_KINDS', 'DOMAIN_ORIGINS',
    // §3 containers.
    'CONTAINER_COLORS', 'projectContainerStyle', 'isSharedSite', 'routeForUrl', 'INTEGRATION_HOSTS', 'accountKeyForHost', 'validateAccountLabel',
    // §4 arrival and §4.1 surface matching.
    'loopbackPort', 'LSOF_LISTEN_ARGS', 'LSOF_CWD_ARGS', 'parseLsofListen', 'parseLsofCwd', 'rootCandidates', 'chooseArrivalRoot', 'arrivalOffer', 'matchSurfaceForUrl',
    // §5 agent status.
    'parseHookEvent', 'validateStatusRecord', 'STATUS_STATES', 'statusBoard', 'hookConfig', 'bridgeConfig',
    // Plan4 step9 package contract; timed/controller/native lifecycles stay in chrome.
    'DEFAULT_WATCH_STORE', 'validateWatch', 'validateWatchStore', 'createWatch', 'saveWatch', 'removeWatch',
    'effectiveWatchObservation', 'watchCheckDue', 'prepareWatchCheck', 'applyWatchResult',
    'DEFAULT_SAFETY_STATE', 'validateSafetyState', 'validateSafetySnapshot', 'safetyOffer', 'safetyStatus', 'planSafetyChoice', 'aiAdmission',
  ];
  for (const name of required) assert.ok(name in api, name);
  assert.equal(api.MAX_FILE_BYTES, 262144);
  assert.equal(api.MANIFEST_PATH, '.axiosozo/project.json');
  assert.deepEqual(api.ENV_ORDER, ['local', 'preview', 'production']);
  assert.equal(api.SENSITIVE_HOSTS_VERSION, 'sensitive-hosts-v1');
  assert.equal(api.OVERRIDE_DELAY_MS, 10000);
  assert.equal(api.DEFAULT_INTERVAL_MINUTES, 5);
  assert.equal(api.DEFAULT_HOURLY_BUDGET, 30);
  assert.equal(api.CONTEXT_STORE_VERSION, 3);
  assert.deepEqual(api.STATUS_STATES, ['started', 'needs_input', 'done', 'failed']);
  const e = new api.ContextsError('INVALID_RULE', 'bad', '$.id');
  assert.ok(e instanceof Error); assert.equal(e.code, 'INVALID_RULE'); assert.equal(e.path, '$.id'); assert.equal(e.name, 'ContextsError');
});
