// TEST FIXTURE ONLY: fake `claude -p --output-format json --json-schema …` success.
import { documentFor, readPrompt, record } from './common.mjs';
const prompt = await readPrompt(); record(prompt);
process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, result: '', session_id: 'synthetic', structured_output: documentFor(prompt) }));
