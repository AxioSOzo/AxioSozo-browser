// TEST FIXTURE ONLY: floods stdout far beyond the 256 KiB cap and never exits by itself.
const chunk = 'x'.repeat(65536);
const write = () => { while (process.stdout.write(chunk)); };
process.stdout.on('drain', write); write();
setInterval(() => {}, 1000);
