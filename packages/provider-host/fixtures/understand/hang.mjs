// TEST FIXTURE ONLY: never answers, and starts a grandchild in the same process group so tests
// can prove the whole group is killed. Pids are written into the temporary project folder.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
writeFileSync('fixture-pids.json', JSON.stringify({ child: process.pid, grandchild: grandchild.pid }));
process.stdin.resume();
setInterval(() => {}, 1000);
