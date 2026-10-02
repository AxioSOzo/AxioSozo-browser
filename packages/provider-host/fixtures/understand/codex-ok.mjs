// TEST FIXTURE ONLY: fake `codex exec … -` success: stdout is only the final message.
import { documentFor, readPrompt, record } from './common.mjs';
const prompt = await readPrompt(); record(prompt);
process.stdout.write(`${JSON.stringify(documentFor(prompt))}\n`);
