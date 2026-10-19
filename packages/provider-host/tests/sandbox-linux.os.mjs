// Linux has no provider sandbox broker yet (macOS uses Seatbelt; a bubblewrap or
// Landlock/seccomp broker is future work). Until it exists every path that would
// start a provider client must fail closed. TEST FIXTURES ONLY: no client runs.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import path from 'node:path';
import { launchSandboxProbe, sandboxArtifacts } from '../src/sandbox.mjs';
import { createLaunchPlan, createLiveAdapter, liveBroker } from '../src/live.mjs';
import { providerBuildRoot } from '../src/storage.mjs';

test('Linux: the sandbox proof refuses to run without a sandbox (BLOCKED_ENV)', t => {
  assert.equal(process.platform, 'linux');
  const base = path.join(providerBuildRoot(), 'sandbox-runs'); mkdirSync(base, { recursive: true, mode: 0o700 });
  const runDirectory = mkdtempSync(path.join(base, 'linux-fail-closed-'));
  try {
    mkdirSync(path.join(runDirectory, 'workspace'), { mode: 0o700 });
    assert.throws(() => launchSandboxProbe({ runDirectory }), { code: 'BLOCKED_ENV' });
    assert.throws(() => sandboxArtifacts(), { code: 'BLOCKED_ENV' });
  } finally { rmSync(runDirectory, { recursive: true, force: true }); }
  t.diagnostic('LINUX_PROVIDER_SANDBOX: UNSUPPORTED (fail closed); no broker artifact is admitted');
});

test('Linux: live provider launches are refused before any client lookup', async () => {
  assert.throws(() => liveBroker(), { code: 'BLOCKED_ENV' });
  const binding = { instance_id: '00000000-0000-4000-8000-000000000001', session_id: 'synthetic', account_identity: 'synthetic' };
  for (const driver of ['codex', 'claude-code']) {
    await assert.rejects(createLaunchPlan(driver, binding, { searchPath: '/nonexistent' }), { code: 'BLOCKED_ENV' });
    await assert.rejects(createLiveAdapter(driver, binding, { searchPath: '/nonexistent' }), { code: 'BLOCKED_ENV' });
  }
});
