import { spawn } from 'node:child_process';
import { ProviderError, requireValue } from './validation.mjs';

// One Keychain item per decision provider (decision-v1 "Plan 4 extensions"). The native
// helper selects a fixed service per provider; `jev` keeps the original argv (no selector)
// so helpers and chrome callers built before Plan 4 still address the same Jev item.
export const KEYCHAIN_PROVIDERS = Object.freeze(['jev', 'openai']);
export const KEY_LIMITS = Object.freeze({ minBytes: 8, maxBytes: 4096 });

/** Same rule as the native helper and chrome: 8–4096 bytes, no control characters. */
export function validKey(secret) {
  return typeof secret === 'string' && Buffer.byteLength(secret) >= KEY_LIMITS.minBytes && Buffer.byteLength(secret) <= KEY_LIMITS.maxBytes
    && !/[\u0000-\u001f\u007f]/u.test(secret);
}

export class MacKeychain {
  constructor(executable, provider = 'jev') {
    requireValue(KEYCHAIN_PROVIDERS.includes(provider), 'INVALID_INPUT', 'Unknown Keychain provider');
    this.executable = executable; this.provider = provider;
  }
  #run(operation, secret) {
    requireValue(process.platform === 'darwin', 'BLOCKED_ENV', 'macOS Keychain is required');
    const args = this.provider === 'jev' ? [operation] : [operation, this.provider];
    return new Promise((resolve, reject) => {
      const child = spawn(this.executable, args, { shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe'] });
      let data = ''; let settled = false;
      const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); error ? reject(error) : resolve(value); };
      const timer = setTimeout(() => { child.kill('SIGKILL'); finish(new ProviderError('KEYCHAIN_ERROR', 'Keychain operation timed out')); }, 5000);
      child.stdout.on('data', chunk => { data += chunk.toString('utf8'); if (data.length > 4096) { child.kill('SIGKILL'); finish(new ProviderError('KEYCHAIN_ERROR', 'Invalid Keychain response')); } });
      child.stdin.on('error', () => {}); child.stderr.resume();
      child.on('error', () => finish(new ProviderError('KEYCHAIN_ERROR', 'Keychain helper unavailable')));
      child.on('close', code => {
        if (code === 44 && operation === 'read') finish(null, null);
        else if ((operation === 'exists' || operation === 'remove') && (code === 0 || code === 44)) finish(null, code === 0);
        else if (code !== 0) finish(new ProviderError('KEYCHAIN_ERROR', 'Keychain refused operation'));
        else finish(null, operation === 'read' ? data : undefined);
      });
      child.stdin.end(secret);
    });
  }
  read() { return this.#run('read'); }
  store(secret) { requireValue(validKey(secret), 'INVALID_INPUT', 'Invalid key'); return this.#run('store', secret); }
  /** Presence only (true/false); the helper returns no secret or attribute data. */
  exists() { return this.#run('exists'); }
  /** Resolves true when an item was deleted, false when none existed (helper exit 44). */
  remove() { return this.#run('remove'); }
}
