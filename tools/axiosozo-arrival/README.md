# Fixed native arrival subprocess

The browser uses this supervisor for the two fixed own-UID lsof operations in
ProjectArrival. Gecko inherits FD3 as an exit sentinel; Darwin lsof closes extra
descriptors during startup. The outer pinned Python process retains that FD3
while its internal owner spawns lsof, drains bounded output and reaps the child.
No engine files, shell, discovered executable, project cwd or inherited user
environment are used.

`listen PORT UID` and `cwd PID UID` are the only CLI operations. UID must match
`os.getuid()`. The native adapter verifies fixed paths, exact 0400 helper mode,
0700 parent and SHA256 before launch. The installer and the fixed Python helper
also validate ownership and link count; pinned Gecko file APIs cannot assert
those fields. The helper handles cancellation, native-parent loss and abrupt
outer-process death through a control pipe and an isolated owned process group.
Its 2.60-second operation deadline fits inside arrival's existing 3-second gate.
Stdout is capped at 1 MiB; stderr at 16 KiB, counted and discarded. Failure emits no
partial stdout and only fixed machine error codes.

Install/check through `scripts/arrival_subprocess.py` using the external storage
wrappers. Unknown existing files are preserved. The helper is checksum-named
under the private workstation contexts directory, and pinned Python is invoked
with `-I -S -B` and cwd `/`. The synthetic test drivers are tests only; the native
adapter never executes them.

Actual integrated verification: 36/36 Node tests (arrival 26 plus adapter 10), and
18/18 real synthetic Python subprocess tests passed on 2 October 2026. They cover
fixed selectors, trust refusal, no late spawn, FD3 retention, both output caps,
signal/deadline cleanup, parent loss, abrupt SIGKILL and descendant cleanup.
These tests invoke invented processes, never real lsof, reference projects,
providers, Keychain or personal profiles. Native GUI arrival remains a separate
gate owned by the integration lead.

Primary evidence for lsof descriptor closure:
[Apple lsof main.c](https://github.com/apple-oss-distributions/lsof/blob/main/lsof/main.c).
Pinned Gecko source: toolkit/modules/subprocess/Subprocess_unix.worker.js,
initPipes FD3 and onReady process termination.
