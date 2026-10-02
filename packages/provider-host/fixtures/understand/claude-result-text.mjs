// TEST FIXTURE ONLY: fake Claude result whose JSON document is in the `result` string.
import { documentFor, readPrompt } from './common.mjs';
const prompt = await readPrompt();
process.stdout.write(JSON.stringify({ type: 'result', subtype: 'success', is_error: false, result: JSON.stringify(documentFor(prompt)) }));
