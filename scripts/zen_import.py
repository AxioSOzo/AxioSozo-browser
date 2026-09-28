"""Verify Surfer's ordered patch result without reapplying overlapping patches."""
import hashlib
import json
import os
from pathlib import Path
import stat
import subprocess
import tempfile


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest() if path.is_file() else None


def restore_signed_search_dump(engine, record, env=None):
    """Keep Mozilla's signed fallback data intact after Zen's dump import.

    Zen's import:dumps filters search-config-v2.json but does not re-sign it.
    Only the exact transformed bytes for this pinned source may be restored;
    an unrelated local edit is never discarded.
    """
    relative = record['path']
    if relative != 'services/settings/dumps/main/search-config-v2.json':
        raise RuntimeError('UNEXPECTED_SIGNED_DUMP_PATH')
    target = engine / relative
    if target.is_symlink() or not target.is_file():
        raise RuntimeError('SIGNED_SEARCH_DUMP_MISSING_OR_SYMLINK')
    pristine = subprocess.check_output(
        ['git', 'show', 'HEAD:' + relative], cwd=engine, env=env)
    pristine_hash = hashlib.sha256(pristine).hexdigest()
    if pristine_hash != record['mozilla_sha256']:
        raise RuntimeError('SIGNED_SEARCH_DUMP_BASELINE_MISMATCH')
    current_hash = digest(target)
    if current_hash == pristine_hash:
        return False
    if current_hash != record['zen_filtered_sha256']:
        raise RuntimeError('UNREVIEWED_SIGNED_SEARCH_DUMP_CHANGE')
    with tempfile.NamedTemporaryFile(prefix='.axiosozo-signed-search-', dir=target.parent,
                                     delete=False) as temporary:
        temporary.write(pristine)
        temporary_path = Path(temporary.name)
    try:
        os.replace(temporary_path, target)
    finally:
        temporary_path.unlink(missing_ok=True)
    if digest(target) != pristine_hash:
        raise RuntimeError('SIGNED_SEARCH_DUMP_RESTORE_FAILED')
    return True


def install_zen_locales(stage, expected_count=14):
    """Install pinned en-US Zen Fluent files without deleting existing data.

    Subfolders count: about:preferences links the required
    browser/preferences/zen-preferences.ftl, and Fluent drops the whole en-US
    bundle of a document when one required resource is missing (a text-less page).
    """
    source = stage / 'locales/en-US/browser/browser'
    destination = stage / 'engine/browser/locales/en-US/browser'
    files = sorted(source.rglob('zen-*.ftl'))
    if len(files) != expected_count or any(path.is_symlink() or not path.is_file() for path in files):
        raise RuntimeError('ZEN_LOCALE_INPUTS_CHANGED')
    installed = 0
    for path in files:
        relative = path.relative_to(source)
        target = destination / relative
        if any((destination / Path(*relative.parts[:depth])).is_symlink() for depth in range(1, len(relative.parts) + 1)):
            raise RuntimeError('ZEN_LOCALE_TARGET_SYMLINK: ' + relative.as_posix())
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if not target.is_file() or target.read_bytes() != path.read_bytes():
                raise RuntimeError('ZEN_LOCALE_TARGET_MODIFIED: ' + relative.as_posix())
        else:
            target.write_bytes(path.read_bytes())
            installed += 1
    return installed


ZEN_CONTENT_RESOURCES = {
    # JSWindowActor children run inside a macOS sandbox. Development-build
    # symlinks into the generated source checkout escape the app read grant.
    'browser/actors/ZenBoostsChild.sys.mjs': 'zen/boosts/actors/ZenBoostsChild.sys.mjs',
    'browser/actors/ZenGlanceChild.sys.mjs': 'zen/glance/actors/ZenGlanceChild.sys.mjs',
    'browser/actors/ZenModsMarketplaceChild.sys.mjs': 'zen/mods/actors/ZenModsMarketplaceChild.sys.mjs',
    'browser/actors/ZenWindowDragChild.sys.mjs': 'zen/window-drag/actors/ZenWindowDragChild.sys.mjs',
    # Boosts load these lazily after the actor starts; styles are fetched by
    # the content document as chrome resources.
    'browser/modules/zen/boosts/ZenSelectorComponent.sys.mjs': 'zen/boosts/ZenSelectorComponent.sys.mjs',
    'browser/modules/zen/boosts/ZenZapDissolve.sys.mjs': 'zen/boosts/ZenZapDissolve.sys.mjs',
    'browser/modules/zen/boosts/ZenZapOverlayChild.sys.mjs': 'zen/boosts/ZenZapOverlayChild.sys.mjs',
    'browser/chrome/browser/content/browser/zen-styles/content/zen-selector.css': 'zen/boosts/zen-selector.css',
    'browser/chrome/browser/content/browser/zen-styles/content/zen-zap.css': 'zen/boosts/zen-zap.css',
}


def materialize_zen_content_resources(stage, app):
    """Put reviewed Zen child resources inside the dev bundle, preserving sandbox.

    `mach build` uses symlinks for local development. The content sandbox can
    read the bundle but not the second symlink hop into `stage/src/zen`.
    Never broaden sandbox grants and never replace an unknown file or link.
    """
    source_root = stage / 'src'
    bundle_root = app / 'Contents/Resources'
    if not source_root.is_dir() or not bundle_root.is_dir():
        raise RuntimeError('ZEN_CONTENT_BUNDLE_MISSING')
    replacements = []
    for destination_relative, source_relative in ZEN_CONTENT_RESOURCES.items():
        source = source_root / source_relative
        target = bundle_root / destination_relative
        if source.is_symlink() or not source.is_file() or not target.parent.is_dir():
            raise RuntimeError('ZEN_CONTENT_RESOURCE_MISSING: ' + destination_relative)
        if not target.parent.resolve().is_relative_to(bundle_root.resolve()):
            raise RuntimeError('ZEN_CONTENT_DESTINATION_ESCAPE: ' + destination_relative)
        if target.is_symlink():
            if target.resolve(strict=True) != source.resolve(strict=True):
                raise RuntimeError('ZEN_CONTENT_UNEXPECTED_LINK: ' + destination_relative)
            replacements.append((source, target))
        elif not target.is_file() or target.read_bytes() != source.read_bytes():
            raise RuntimeError('ZEN_CONTENT_RESOURCE_MODIFIED: ' + destination_relative)
    for source, target in replacements:
        with tempfile.NamedTemporaryFile(prefix='.axiosozo-zen-content-',
                                         dir=target.parent, delete=False) as temporary:
            temporary.write(source.read_bytes())
            temporary_path = Path(temporary.name)
        try:
            os.chmod(temporary_path, stat.S_IMODE(source.stat().st_mode))
            os.replace(temporary_path, target)
        finally:
            temporary_path.unlink(missing_ok=True)
    if any(target.is_symlink() or target.read_bytes() != source.read_bytes()
           for source, target in replacements):
        raise RuntimeError('ZEN_CONTENT_MATERIALIZATION_FAILED')
    return len(replacements)


def patch_inputs(stage):
    patches = sorted((stage / 'src').rglob('*.patch'))
    files = set()
    for patch in patches:
        for line in patch.read_text().splitlines():
            if line.startswith('--- a/') or line.startswith('+++ b/'):
                relative = line[6:].split('\t', 1)[0]
                if Path(relative).is_absolute() or '..' in Path(relative).parts:
                    raise RuntimeError('UNSAFE_PATCH_TARGET')
                files.add(relative)
    return patches, sorted(files), {str(path.relative_to(stage)): digest(path) for path in patches}


def hashes(engine, files):
    result = {}
    for relative in files:
        path = engine / relative
        if path.is_symlink():
            raise RuntimeError('UNEXPECTED_PATCH_TARGET_SYMLINK: ' + relative)
        result[relative] = digest(path)
    return result


def normalized_hashes(engine, files, expected, post_import):
    """Recognize only exact reviewed post-import results, never arbitrary edits."""
    actual = hashes(engine, files)
    for record in post_import:
        name = record['path']
        if (name in actual and expected.get(name) == record['before_sha256']
                and actual[name] == record['after_sha256']):
            actual[name] = record['before_sha256']
    return actual


def prepare(stage, build, env, post_import=()):
    """Return expected hashes and whether the stage still needs its first import.

    Every initial import is checked against an independent reconstruction of only
    its 266 target files. A failed/partial import is never automatically reset.
    """
    engine = stage / 'engine'
    patches, files, inputs = patch_inputs(stage)
    baseline = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=engine, env=env, text=True).strip()
    receipt = build / 'zen-import.json'
    key = {'version': 1, 'baseline': baseline, 'patches': inputs}
    if receipt.exists():
        saved = json.loads(receipt.read_text())
        if any(saved.get(name) != value for name, value in key.items()):
            raise RuntimeError('PATCH_INPUTS_CHANGED: preserve this stage and create a new pinned stage')
        expected = saved['files']
    else:
        # Read all original blobs in one Git process. Missing originals are valid
        # for patches that introduce new files; git apply checks the distinction.
        result = subprocess.run(['git', 'cat-file', '--batch'], cwd=engine, env=env,
                                input=''.join('HEAD:' + name + '\n' for name in files).encode(),
                                capture_output=True, check=True)
        offset = 0
        originals = {}
        with tempfile.TemporaryDirectory(prefix='verify-import-', dir=build) as directory:
            scratch = Path(directory)
            for relative in files:
                end = result.stdout.index(b'\n', offset)
                header = result.stdout[offset:end].split()
                offset = end + 1
                if header[-1] == b'missing':
                    originals[relative] = None
                    continue
                if len(header) != 3 or header[1] != b'blob':
                    raise RuntimeError('UNEXPECTED_BASELINE_OBJECT: ' + relative)
                length = int(header[2])
                content = result.stdout[offset:offset + length]
                offset += length + 1
                destination = scratch / relative
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(content)
                originals[relative] = hashlib.sha256(content).hexdigest()
            for patch in patches:
                subprocess.run(['git', '-c', 'core.hooksPath=/dev/null', 'apply',
                                '--ignore-space-change', '--ignore-whitespace', str(patch)],
                               cwd=scratch, env=env, check=True, capture_output=True)
            expected = hashes(scratch, files)
        actual = hashes(engine, files)
        if actual == originals:
            return key, expected, True
        actual = normalized_hashes(engine, files, expected, post_import)
        if actual != expected:
            changed = [name for name in files if actual[name] != expected[name]]
            raise RuntimeError('PARTIAL_OR_MODIFIED_IMPORT: ' + ', '.join(changed[:12]))
        receipt.write_text(json.dumps({**key, 'files': expected}, indent=2) + '\n')
    actual = normalized_hashes(engine, files, expected, post_import)
    changed = [name for name in files if actual[name] != expected[name]]
    if changed:
        raise RuntimeError('IMPORTED_SOURCE_CHANGED: ' + ', '.join(changed[:12]))
    print('PASS: ordered Zen patch result verified; skipping unsafe repeat import', flush=True)
    return key, expected, False


def finish(stage, build, key, expected):
    if hashes(stage / 'engine', expected) != expected:
        raise RuntimeError('UPSTREAM_IMPORT_RESULT_MISMATCH')
    (build / 'zen-import.json').write_text(json.dumps({**key, 'files': expected}, indent=2) + '\n')


def refresh_links(stage):
    """Refresh only source-file links, preserving any unexpected real files."""
    engine = stage / 'engine'
    for source in sorted((stage / 'src').rglob('*')):
        if not source.is_file() or source.suffix == '.patch' or 'node_modules' in source.parts:
            continue
        relative = source.relative_to(stage / 'src')
        target = engine / relative
        if target.is_symlink():
            if Path(os.readlink(target)) != source:
                raise RuntimeError('UNEXPECTED_IMPORTED_LINK: ' + str(relative))
        elif target.exists():
            raise RuntimeError('UNEXPECTED_IMPORTED_FILE: ' + str(relative))
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.symlink_to(source)
