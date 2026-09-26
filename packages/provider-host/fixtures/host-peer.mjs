// TEST FIXTURE ENTRYPOINT ONLY. Browser harnesses may explicitly select this file;
// the product CLI never has a fixture mode or switches to synthetic answers.
import { serveStdio } from '../src/host.mjs';
import { createFixtureAdapter } from '../src/adapters.mjs';
await serveStdio({ createAdapter: createFixtureAdapter, ...(process.argv.includes('--idle-test') ? { limits: { idleMs: 80 } } : {}) });
