// TEST_FIXTURE: parent exits without a graceful broker close. Native fd-lifetime
// supervision must reap the owned sandboxed child independently of this JS.
import { launchSandboxProbe } from '../src/sandbox.mjs';
const owned = launchSandboxProbe({ runDirectory: process.argv[2], mode: 'hold', deadlineMs: 5000 });
let buffer = '';
owned.child.stdout.on('data', chunk => {
  buffer += chunk;
  if (!buffer.includes('\n')) return;
  const child = JSON.parse(buffer.split('\n')[0]);
  process.stdout.write(`${JSON.stringify({ broker_pid: owned.child.pid, child_pid: child.pid })}\n`, () => process.exit(0));
});
owned.exit.then(result => { if (result.code) process.exit(result.code); });
