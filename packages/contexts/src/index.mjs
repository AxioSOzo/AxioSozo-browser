/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Contexts core: pure, DOM-free logic shared by Node tests and privileged chrome
// (chrome://browser/content/axiosozo/contexts/). See contracts/contexts-api-v1.md §2
// and contracts/workstation-v1.md §1–§5.
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
  // workstation-v1 §1–§2: detection draft v2, project record v2, context store v3.
  CONTEXT_STORE_VERSIONS, PROJECT_RECORD_VERSIONS, INTEGRATION_IDS, PLATFORM_KINDS, DOMAIN_ORIGINS, AGENT_FILES, AGENT_DIRS, DEFAULT_SHARED_SITES,
  BRIEF_APP_KINDS, UNDERSTAND_CLIS, MAX_USER_CONTEXT_ID, EMPTY_AGENT_PRESENCE, validateBriefRecord, upgradeProject, isProjectId,
} from './schema.mjs';
export {
  MAX_FILE_BYTES, DETECTION_FILES, isAllowedPath, detectionRefusal, detectProject,
  MAX_WORKSPACE_PACKAGES, PACKAGE_DETECTION_FILES, CONVENTIONAL_WORKSPACES, isPackageDir, isAllowedPackagePath,
  packageDetectionRefusal, normalizeWorkspacePattern, workspaceCandidates, expandWorkspaceGlobs,
  // workstation-v1 §1: inventory and documented-domains phases, integrations, domains.
  MAX_INVENTORY_LIST, MAX_INVENTORY_CHECK, MAX_DOCUMENT_CHILDREN, inventoryPlan, inventoryRefusal, isInventoryListPath, isInventoryCheckPath,
  documentFiles, documentRefusal, isDocumentPath, INTEGRATIONS, integrationForPackage, VENDOR_HOST_SUFFIXES, isProductHost, documentedHosts,
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
// workstation-v1 §3–§5: containers and routing, arrival, agent status.
export {
  CONTAINER_COLORS, CONTAINER_ICON, INTEGRATION_HOSTS, projectContainerStyle, isSharedSite, routeForUrl, accountKeyForHost, validateAccountLabel,
} from './containers.mjs';
export {
  loopbackPort, LSOF_LISTEN_ARGS, LSOF_CWD_ARGS, parseLsofListen, parseLsofCwd, rootCandidates, chooseArrivalRoot, arrivalOffer, matchSurfaceForUrl,
} from './arrival.mjs';
export {
  STATUS_STATES, STATUS_AGENTS, HOOK_SOURCES, MAX_HOOK_PAYLOAD_BYTES, STATUS_KEEP_MS, STATUS_HISTORY,
  parseHookEvent, validateStatusRecord, statusBoard, hookConfig,
} from './agent-status.mjs';
