"""Checksums, the in-app/in-DMG Preview notice and the release notes template.

Every artifact is labelled Preview. Nothing here says READY.
"""
import hashlib
from pathlib import Path

REPOSITORY = 'https://github.com/AxioSOzo/AxioSozo-browser'


def sha256_file(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def write_checksums(files, output):
    """`shasum -a 256 -c` compatible file with basenames; returns {name: hex}."""
    sums = {}
    lines = []
    for path in sorted(map(Path, files), key=lambda item: item.name):
        sums[path.name] = sha256_file(path)
        lines.append(f'{sums[path.name]}  {path.name}\n')
    Path(output).write_text(''.join(lines))
    return sums


def safe_browsing_sentence(state):
    if state == 'PRESENT':
        return 'Safe Browsing: a Safe Browsing key is built in; phishing and malware protection is available.'
    return ('Safe Browsing: this build ships WITHOUT phishing and malware protection '
            '(no Safe Browsing key is built in).')


def chromium_sentence(chromium):
    return ('Chromium mode: off by default and experimental. ' + chromium['label'] + '. '
            'Engine gates E1/E2 have not passed. Standard CEF builds have no proprietary '
            'codecs and no Widevine, so some media sites will not play in Chromium mode.')


def preview_notice(context):
    """Plain text shipped inside the app and at the DMG root."""
    return f'''AxioSozo {context["version"]} - Preview
{"=" * (len(context["version"]) + 22)}

This is a Preview build. It is not a finished or READY release.

Source commit: {context["commit"]}
Source code (MPL-2.0): {REPOSITORY}

Updates: manual. This build has no automatic updater and never contacts the
Zen or Mozilla update servers. Download new Previews yourself from the
GitHub Releases page of the repository above.

{safe_browsing_sentence(context["safe_browsing"])}

{chromium_sentence(context["chromium"])}

Licenses: AxioSozo's own code is MPL-2.0. Firefox/Gecko and Zen notices are
available at about:license. Additional notices are in
AxioSozo.app/Contents/Resources/axiosozo-notices/.
'''


def release_notes(context):
    """Markdown draft for a GitHub Release. The operator reviews it; nothing is published."""
    signing = context.get('signing', 'NOT SIGNED (Developer ID identity not provided; decision #3 open)')
    checksum_lines = ''.join(f'{digest}  {name}\n' for name, digest in sorted(context.get('checksums', {}).items()))
    checksums = checksum_lines or '(SHA-256 filled in after the DMG is built; also in SHA256SUMS.txt)\n'
    dmg = context.get('dmg_name', 'AxioSozo-<version>-preview-<commit>-macos-arm64.dmg')
    return f'''# AxioSozo {context["version"]} Preview

> **Preview.** Not READY. For people who want to try AxioSozo early and accept
> rough edges. Wout authorizes each publication separately; this file is a draft.

- Source commit: `{context["commit"]}` ({REPOSITORY}/tree/{context["commit"]})
- Platform: macOS on Apple Silicon (arm64)
- Signing and notarization: {signing}

## Updates are manual

This Preview has no automatic updater. It never contacts Zen's or Mozilla's
update servers. AxioSozo's own update channel (MAR signing keys and update
host) does not exist yet. To update, download the next Preview from GitHub
Releases and replace the app.

## Safe Browsing

{safe_browsing_sentence(context["safe_browsing"])}

## Chromium mode

{chromium_sentence(context["chromium"])}

## Known limitations

- Codex, Claude Code and Jev live connections are not part of this Preview.
- Platform passkeys (WebAuthn via macOS) are unavailable: the restricted
  entitlements they need are not granted to this build.
- Status of the underlying project: PARTIAL_ENGINE_BLOCKED (see
  docs/SETUP_STATUS.md at the commit above).

## Licenses

AxioSozo's own code is MPL-2.0; the corresponding source is at the commit
above. Firefox/Gecko and Zen notices are at `about:license`. The app contains
`Contents/Resources/axiosozo-notices/` with the MPL-2.0 text, third-party
notices and this Preview notice.

## Verify your download

```
{checksums}```

    shasum -a 256 -c SHA256SUMS.txt
    spctl --assess --type open --context context:primary-signature -v {dmg}
'''
