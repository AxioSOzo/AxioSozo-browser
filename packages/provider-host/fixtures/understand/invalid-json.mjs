// TEST FIXTURE ONLY: writes output that is not JSON.
import { readPrompt } from './common.mjs';
await readPrompt();
process.stdout.write('Here is your brief: {"version":1,');
