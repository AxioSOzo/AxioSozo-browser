/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Contexts core: pure, DOM-free logic shared by Node tests and privileged chrome
// (chrome://browser/content/axiosozo/contexts/). See contracts/contexts-api-v1.md §2.
// Internal helpers (parsers, freezing) stay reachable only through their module.
export { ContextsError } from './errors.mjs';
export {
  validateContextMetadata, validateProject, validateManifest, validateContextStore, validateDetectionDraft,
  validateSiteRule, validateRuleStore, validateLedger, validateLedgerRecord, validateEvaluation, validateSuppression,
  validateHostPattern, validateBaseUrl, validateWebUrl, stripQueryAndFragment, isWorkspaceUuid, isRuleId, newRule,
  DEFAULT_CONTEXT_STORE, DEFAULT_RULE_STORE, DEFAULT_LEDGER, EFFECTS, OUTCOMES, REASON_CODES, JEV_REASON_CODES,
  CONTEXT_TYPES, PROJECT_KINDS, SURFACE_KINDS, OBSERVATIONS, OVERRIDES, AGENT_ACCESS, REFUSAL_REASONS, MANIFEST_STATES,
  SURFACE_PROMINENCE, PRIMARY_SURFACE_KINDS, MANIFEST_VERSIONS, CONTEXT_STORE_VERSION, surfaceProminence, environmentKey,
  needsManifestV2, migrateContextStore, projectsInContext,
} from './schema.mjs';
export {
  MAX_FILE_BYTES, DETECTION_FILES, isAllowedPath, detectionRefusal, detectProject,
  MAX_WORKSPACE_PACKAGES, PACKAGE_DETECTION_FILES, CONVENTIONAL_WORKSPACES, isPackageDir, isAllowedPackagePath,
  packageDetectionRefusal, normalizeWorkspacePattern, workspaceCandidates, expandWorkspaceGlobs,
} from './detect.mjs';
export {
  MANIFEST_PATH, draftToManifest, parseManifest, serializeManifest, assertNoSecrets, draftManifestState, withProductionUrl, mainWebApp,
} from './manifest.mjs';
export { ENV_ORDER, orderedEnvironments, matchEnvironment, switchEnvironment, isDeclaredLocalOrigin, matchProjectForUrl } from './environments.mjs';
export {
  hostMatches, ruleMatches, rulesFor, evaluateDeterministic, applyJevOutcome, effectiveObservation, isSensitiveHost,
  insideAllowedHours, suppress, activeSuppressions, SENSITIVE_HOSTS, SENSITIVE_HOSTS_VERSION, OVERRIDE_DELAY_MS,
} from './rules.mjs';
export { localDay, recordForeground, usageFor, prune, summarize, exportLedger, clearLedger } from './ledger.mjs';
export {
  DEFAULT_INTERVAL_MINUTES, DEFAULT_HOURLY_BUDGET, MAX_DEADLINE_MS, OUTLINE_KINDS,
  createBudget, takeBudget, nextCheckpoint, buildSiteRuleRequest,
} from './checkpoints.mjs';
