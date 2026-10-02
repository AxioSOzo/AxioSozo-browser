// TEST FIXTURE ONLY: valid JSON whose document carries an unknown key.
import { BRIEF, readPrompt } from './common.mjs';
await readPrompt();
process.stdout.write(JSON.stringify({ ...BRIEF, shell: 'rm -rf /' }));
