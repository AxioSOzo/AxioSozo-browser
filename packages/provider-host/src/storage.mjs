import path from 'node:path';
import { existsSync, realpathSync, statSync } from 'node:fs';
import { requireValue } from './validation.mjs';

export function providerBuildRoot() {
  const configured = process.env.AXIOSOZO_BUILD_ROOT ?? '/Volumes/AxioSozoBuild';
  requireValue(path.isAbsolute(configured), 'BLOCKED_ENV', 'AXIOSOZO_BUILD_ROOT must be absolute');
  const resolved = path.resolve(configured);
  const mount = ['/Volumes/AxioSozoBuild', '/Volumes/DevStorage'].find(candidate => resolved === candidate || resolved.startsWith(`${candidate}/`));
  requireValue(mount && existsSync(mount) && realpathSync(mount) === mount && statSync(mount).dev !== statSync(path.dirname(mount)).dev, 'BLOCKED_ENV', 'Provider builds require the mounted T9-backed project storage');
  let existing = resolved;
  while (!existsSync(existing)) existing = path.dirname(existing);
  requireValue(realpathSync(existing) === mount || realpathSync(existing).startsWith(`${mount}/`), 'BLOCKED_ENV', 'Provider build path resolves outside external storage');
  return path.join(resolved, 'providers');
}
