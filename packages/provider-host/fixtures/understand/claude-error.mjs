// TEST FIXTURE ONLY: fake Claude in-run failure (result envelope with is_error, exit 1) plus stderr noise.
import { readPrompt } from './common.mjs';
await readPrompt();
process.stderr.write('synthetic-secret-looking-stderr '.repeat(2000));
process.stdout.write(JSON.stringify({ type: 'result', subtype: 'error_during_execution', is_error: true, result: 'Not logged in' }));
process.exitCode = 1;
