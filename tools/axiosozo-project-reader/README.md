# Descriptor-bound project reader

This product-owned standard-library Python helper provides exact metadata and
bounded static file reads. It lists only capped authorized directory names and does not execute project code,
read arbitrary documents or provider/profile data, or fall back to path reads.
It has no frontend code. `./dev setup` installs a checksum-named copy in the
selected external build root; `./dev check` verifies it.

The privileged integration supplies `configuredTrusted === true`, an explicit
trusted absolute interpreter path and product helper path, and an authorized
canonical project root. Missing configuration/capabilities or missing exact
identities must raise `READ_CONTAINMENT_UNAVAILABLE`; they must never use
`fs.read(path)` as a fallback. The browser ProjectReader.sys.mjs exports createProjectReader and belongs to the integration lead. Native trust configuration is supplied by the root-owned ProjectReaderConfig.sys.mjs, never frontend data. The reviewed launcher uses:

```js
Subprocess.call({
  command: interpreter,
  arguments: ['-I', '-S', '-B', helperPath, operation, JSON.stringify(payload)],
  environmentAppend: false,
  environment: {
    LANG: 'C', LC_ALL: 'C', PYTHONNOUSERSITE: '1', PYTHONDONTWRITEBYTECODE: '1',
  },
  workdir: '/',
  stderr: 'pipe',
});
```

There is no PATH search, shell, interpreter discovery, project cwd, project
lifecycle hook, site initialization, or project-controlled helper. The launcher
must enforce one short deadline, cap stdout at 400 KiB by default (hard maximum 512 KiB) and stderr at 16 KiB,
close stdin, drain pipes concurrently, and kill/reap on failure or cancellation.
Validate the complete JSON response and only accept a successful read result
with the requested exact identity, `encoding === 'base64'`, canonical valid
base64 and decoded length at most the requested cap. Return a `Uint8Array`.
Do not log payloads, paths or file contents. Base64 is transport encoding; the
existing detector owns strict UTF-8 decoding and the 256 KiB file limit.

## Fixed operations

Every response is `{"ok":true,"result":...}` or
`{"ok":false,"error":"CODE"}`. Errors do not include file paths or OS details.
Arguments are limited to 16 KiB and unknown/duplicate keys are invalid.

- `metadata` with `{root}` returns `{type,size,identity}` for the root directory.
- `metadata` with `{root,relative,expectedRoot}` returns `{type,size,identity}`
  from no-follow leaf metadata below the exact checked root. `relative` must be
  in the static read allowlist.
- `presence` with `{root,relative,expectedRoot}` returns the same metadata shape
  for the core's exact inventory list/check path shapes. It never content-opens
  presence files. The service must additionally enforce its current actual
  `inventoryPlan`, as it already does for planned detection.
- `list` with `{root,relative,expectedRoot,expectedDirectory,limit}` returns
  `{entries:[{name,type}],identity}`. The empty relative string names the root;
  other directories must satisfy the core's inventory-list shape or safe
  package-dir shape. `limit` is 1–512. The loop counts raw entries before
  omitting symlinks, AppleDouble names and invalid names. It uses lazy
  `os.scandir(fd)` and refuses unsupported fd listing rather than retry a path.
- `read` with `{root,relative,expectedRoot,expectedFile,maxBytes}` returns
  `{encoding:'base64',data,identity}`. `maxBytes` is an integer 1–262145.

`identity` is exactly `{device:'decimal',inode:'decimal'}`. Device/inode strings
are canonical ASCII decimal of 1–20 characters; device zero is allowed and inode
must be positive. Use strings in the
browser to preserve integers beyond JavaScript's safe-integer range. File
metadata requests also bind the root identity, so a root swap cannot silently
produce metadata for another tree. Example adapter seam:

```js
reader.readContained({
  root: canonicalRoot,
  relative: resolvedRelative,
  expectedRoot: trustedRootMetadata.identity,
  expectedFile: fileStat.identity,
  maxBytes: core.MAX_FILE_BYTES + 1,
}) // -> Uint8Array or rejection
```

`DETECTION_FILES` and `PACKAGE_DETECTION_FILES` exactly mirror the contexts core.
Package prefixes are 1–4 unhidden safe segments, at most 200 characters, and
exclude dependency/build and prototype names. Only `docs/domains.md` and
`docs/<safe-child>/domains.md` are additionally allowed. AGENTS.md, CLAUDE.md,
`.env*`, native source, arbitrary docs, and inventory-presence files cannot be
content-opened. Presence/list constants also mirror the core inventory policy.
The parity test detects future allowlist drift. Broad static path shapes are a
helper ceiling; the service must restrict every operation to its current
workspace/inventory/document plan.

Project setup (workstation-v1 §1.5) adds, mirrored from `setup.mjs` and
checked by the parity test:

- **Read:** the root files `README.md`, `Makefile`, `justfile`, `Procfile.dev`
  and `project.json`.
- **Presence only:** start scripts and lockfiles.
- **Icon folders:** listing of folders whose last segment is an icon-folder
  name, or a logo/icon/brand/mark/symbol folder inside a brand folder.
- **Icon files:** presence and metadata of image files, plus content reads of
  readable images (`png`, `svg`, `ico`, `webp`, `jpg`, `jpeg`, at most the
  usual 256 KiB). `icns` is presence only.

Image paths have at most 8 unhidden safe segments and never `node_modules`.
The browser validates image bytes before anything is shown.

## Containment and failure behavior

Every root ancestor and every relative directory is opened from a retained
parent descriptor with `O_DIRECTORY | O_NOFOLLOW | O_CLOEXEC`, then compared
with checked no-follow metadata. The file is opened with
`O_NOFOLLOW | O_NONBLOCK | O_CLOEXEC`; `fstat` must prove a regular single-link
file with the expected device/inode before the first read. A changed inode,
symlink, hard link or special file is refused. There is no permissive fallback
if these flags or dirfd/no-follow primitives are unavailable. All descriptors
are closed on both success and exceptions.

The race tests distinguish the guarantees precisely: leaf/ancestor symlink
swaps cause zero outside regular-file descriptor opens and zero outside reads.
Regular file replacement may open the replacement descriptor inside the bound
root, but it fails identity checking before any content read. Renaming a root
that is already open retains the authorized original tree; it never redirects
reads into a replacement tree. The detector's post-read canonical-root/path
checks remain necessary to reject changed path names at the service boundary.

Local tests use synthetic files only under the external helper's `TMPDIR`:

```sh
AXIOSOZO_BUILD_ROOT=/Volumes/AxioSozoBuild/workstation \
  /Users/wout/.local/bin/dev-external /usr/bin/python3 scripts/storage.py exec -- \
  /usr/bin/python3 -I -S -B tools/axiosozo-project-reader/project_reader_test.py
```
