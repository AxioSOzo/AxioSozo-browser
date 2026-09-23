# T3 provider extraction

The sparse `upstream/t3code` checkout is unchanged, detached at the SHA in
`docs/provider-provenance.json`, with remote `upstream`. There is no T3 patch to apply
and no full T3 process to start. The maintenance surface is the small MIT-licensed
TypeScript extraction under `packages/provider-host/vendor/t3` plus its tests.

To review an update: fetch an explicitly selected upstream SHA, inspect root and
package scripts plus provider/auth/protocol changes before running anything, compare
the exact manifest source paths, then update extracted files and hashes. Preserve
the original copyright and license. Run `node packages/provider-host/cli.mjs test`
and validate the protocol schema for every supported client version. Do not silently
install/upgrade providers, enable live capabilities, or widen auth/configuration scope.

On this exFAT workspace, Git AppleDouble `._*.idx` metadata was incorrectly treated
as pack indexes after clone. Only the newly created metadata files in this checkout's
`.git/objects/pack` were removed. `core.filemode=false`, an index refresh, and sparse
reapply then produced a clean 186 MiB checkout instead of a 6.6 GiB full working tree.
Use `git clone --no-checkout` and explicit sparse paths for reconstruction; do not run
upstream package lifecycle hooks. The full Git pack retains upstream provenance.
