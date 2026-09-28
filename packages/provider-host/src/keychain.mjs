import { spawn } from 'node:child_process';
import { ProviderError, requireValue } from './validation.mjs';
export class MacKeychain {
  constructor(executable) { this.executable = executable; }
  #run(operation, secret) {
    requireValue(process.platform === 'darwin', 'BLOCKED_ENV', 'macOS Keychain is required');
    return new Promise((resolve, reject) => {
      const child = spawn(this.executable, [operation], { shell: false, env: { PATH: '/usr/bin:/bin' }, stdio: ['pipe', 'pipe', 'pipe'] });
      let data = ''; let settled = false;
      const finish = (error, value) => { if (settled) return; settled = true; clearTimeout(timer); error ? reject(error) : resolve(value); };
      const timer = setTimeout(() => { child.kill('SIGKILL'); finish(new ProviderError('KEYCHAIN_ERROR', 'Keychain operation timed out')); }, 5000);
      child.stdout.on('data', chunk => { data += chunk.toString('utf8'); if (data.length > 4096) { child.kill('SIGKILL'); finish(new ProviderError('KEYCHAIN_ERROR', 'Invalid Keychain response')); } });
      child.stdin.on('error', () => {}); child.stderr.resume();
      child.on('error', () => finish(new ProviderError('KEYCHAIN_ERROR', 'Keychain helper unavailable')));
      child.on('close', code => { if (code === 44 && operation === 'read') finish(null, null); else if (operation === 'exists' && (code === 0 || code === 44)) finish(null, code === 0); else if (code !== 0) finish(new ProviderError('KEYCHAIN_ERROR', 'Keychain refused operation')); else finish(null, operation === 'read' ? data : undefined); });
      child.stdin.end(secret);
    });
  }
  read() { return this.#run('read'); }
  store(secret) { requireValue(typeof secret === 'string' && secret.length >= 8 && secret.length <= 4096 && !/[\r\n\0]/.test(secret), 'INVALID_INPUT', 'Invalid key'); return this.#run('store', secret); }
  /** Presence only (true/false); the helper returns no secret or attribute data. */
  exists() { return this.#run('exists'); }
  remove() { return this.#run('remove'); }
}
