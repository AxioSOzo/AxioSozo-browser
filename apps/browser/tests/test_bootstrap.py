"""Small security tests for the source overlay and build launch gate; no GUI claims."""
import importlib.util
import hashlib
import json
import os
from pathlib import Path
import tempfile
import subprocess
import unittest
import sys
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('zen', ROOT / 'scripts/zen.py')
zen = importlib.util.module_from_spec(spec)
spec.loader.exec_module(zen)


class BootstrapTests(unittest.TestCase):
    def test_overlapping_import_is_verified_once_and_rejects_later_edits(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-import-test-') as directory:
            build = Path(directory)
            stage = build / 'source'
            engine = stage / 'engine'
            engine.mkdir(parents=True)
            source = stage / 'src'
            source.mkdir()
            env = zen.zen_toolchain.environment()
            for command in [['git', 'init', '-q'], ['git', 'config', 'gc.auto', '0']]:
                subprocess.run(command, cwd=engine, env=env, check=True, capture_output=True)
            target = engine / 'sample.txt'
            target.write_text('alpha\nbeta\ngamma\n')
            subprocess.run(['git', 'add', 'sample.txt'], cwd=engine, env=env, check=True)
            subprocess.run(['git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@invalid',
                            '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false',
                            'commit', '-qm', 'synthetic pristine source'], cwd=engine, env=env, check=True)
            for index, (old, new) in enumerate([('beta', 'first'), ('first', 'second')]):
                (source / f'{index}.patch').write_text(
                    'diff --git a/sample.txt b/sample.txt\n--- a/sample.txt\n+++ b/sample.txt\n'
                    f'@@ -1,3 +1,3 @@\n alpha\n-{old}\n+{new}\n gamma\n')
            target.write_text('alpha\nsecond\ngamma\n')
            _, expected, needs_import = zen.zen_import.prepare(stage, build, env)
            self.assertFalse(needs_import)
            self.assertEqual(expected['sample.txt'], hashlib.sha256(target.read_bytes()).hexdigest())
            self.assertFalse(zen.zen_import.prepare(stage, build, env)[2])
            target.write_text('alpha\nsecond\nreviewed comment\ngamma\n')
            post = [{'path': 'sample.txt', 'before_sha256': expected['sample.txt'],
                     'after_sha256': hashlib.sha256(target.read_bytes()).hexdigest()}]
            with self.assertRaisesRegex(RuntimeError, 'IMPORTED_SOURCE_CHANGED'):
                zen.zen_import.prepare(stage, build, env)
            self.assertFalse(zen.zen_import.prepare(stage, build, env, post)[2])
            bad_base = [{**post[0], 'before_sha256': '0' * 64}]
            with self.assertRaisesRegex(RuntimeError, 'IMPORTED_SOURCE_CHANGED'):
                zen.zen_import.prepare(stage, build, env, bad_base)
            self.assertEqual(json.loads((build / 'zen-import.json').read_text())['files'], expected)
            target.write_text('user edit must survive\n')
            with self.assertRaisesRegex(RuntimeError, 'IMPORTED_SOURCE_CHANGED'):
                zen.zen_import.prepare(stage, build, env, post)
            self.assertEqual(target.read_text(), 'user edit must survive\n')

    def test_signed_search_dump_restore_accepts_only_pinned_zen_transform(self):
        relative = 'services/settings/dumps/main/search-config-v2.json'
        with tempfile.TemporaryDirectory(prefix='axiosozo-signed-dump-') as directory:
            engine = Path(directory)
            target = engine / relative
            target.parent.mkdir(parents=True)
            pristine = b'{"data":[{"identifier":"fixture"}],"timestamp":1}\n'
            transformed = b'{"data":[],"timestamp":1}'
            target.write_bytes(pristine)
            subprocess.run(['git', 'init', '-q'], cwd=engine, check=True, capture_output=True)
            subprocess.run(['git', 'add', relative], cwd=engine, check=True, capture_output=True)
            subprocess.run(['git', '-c', 'user.name=Fixture', '-c', 'user.email=fixture@invalid',
                            '-c', 'core.hooksPath=/dev/null', '-c', 'commit.gpgsign=false',
                            'commit', '-qm', 'synthetic signed baseline'], cwd=engine,
                           check=True, capture_output=True)
            record = {'path': relative,
                      'mozilla_sha256': hashlib.sha256(pristine).hexdigest(),
                      'zen_filtered_sha256': hashlib.sha256(transformed).hexdigest()}
            self.assertFalse(zen.zen_import.restore_signed_search_dump(engine, record))
            target.write_bytes(b'user edit must survive')
            with self.assertRaisesRegex(RuntimeError, 'UNREVIEWED_SIGNED_SEARCH_DUMP_CHANGE'):
                zen.zen_import.restore_signed_search_dump(engine, record)
            self.assertEqual(target.read_bytes(), b'user edit must survive')
            target.write_bytes(transformed)
            self.assertTrue(zen.zen_import.restore_signed_search_dump(engine, record))
            self.assertEqual(target.read_bytes(), pristine)
            with self.assertRaisesRegex(RuntimeError, 'SIGNED_SEARCH_DUMP_BASELINE_MISMATCH'):
                zen.zen_import.restore_signed_search_dump(engine,
                    {**record, 'mozilla_sha256': '0' * 64})

    def test_zen_fluent_install_is_complete_and_preserves_unowned_edits(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-zen-locales-') as directory:
            stage = Path(directory)
            source = stage / 'locales/en-US/browser/browser'
            source.mkdir(parents=True)
            (source / 'zen-general.ftl').write_text('zen-general = Fixture\n')
            (source / 'zen-library.ftl').write_text('zen-library = Fixture\n')
            with self.assertRaisesRegex(RuntimeError, 'ZEN_LOCALE_INPUTS_CHANGED'):
                zen.zen_import.install_zen_locales(stage, expected_count=3)
            self.assertEqual(zen.zen_import.install_zen_locales(stage, expected_count=2), 2)
            self.assertEqual(zen.zen_import.install_zen_locales(stage, expected_count=2), 0)
            target = stage / 'engine/browser/locales/en-US/browser/zen-library.ftl'
            target.write_text('user edit must survive\n')
            with self.assertRaisesRegex(RuntimeError, 'ZEN_LOCALE_TARGET_MODIFIED'):
                zen.zen_import.install_zen_locales(stage, expected_count=2)
            self.assertEqual(target.read_text(), 'user edit must survive\n')

    def test_zen_child_resources_stay_inside_bundle_without_sandbox_exception(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-zen-child-') as directory:
            stage = Path(directory) / 'stage'
            app = Path(directory) / 'AxioSozo Dev.app'
            links = []
            for relative, source_relative in zen.zen_import.ZEN_CONTENT_RESOURCES.items():
                source = stage / 'src' / source_relative
                source.parent.mkdir(parents=True, exist_ok=True)
                source.write_text('fixture resource: ' + source_relative)
                target = app / 'Contents/Resources' / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                target.symlink_to(source)
                links.append(target)
            self.assertEqual(len(links), 9)
            # Preflight must reject an unexpected target without rewriting any
            # earlier link in the manifest.
            links[-1].unlink()
            links[-1].write_text('unowned edit')
            with self.assertRaisesRegex(RuntimeError, 'ZEN_CONTENT_RESOURCE_MODIFIED'):
                zen.zen_import.materialize_zen_content_resources(stage, app)
            self.assertTrue(links[0].is_symlink())
            self.assertEqual(links[-1].read_text(), 'unowned edit')
            links[-1].unlink()
            last_source = stage / 'src' / list(zen.zen_import.ZEN_CONTENT_RESOURCES.values())[-1]
            links[-1].symlink_to(last_source)
            self.assertEqual(zen.zen_import.materialize_zen_content_resources(stage, app), 9)
            self.assertEqual(zen.zen_import.materialize_zen_content_resources(stage, app), 0)
            self.assertTrue(all(path.is_file() and not path.is_symlink() for path in links))
            self.assertTrue(all(path.read_bytes() == (stage / 'src' / source).read_bytes()
                                for path, source in zip(links, zen.zen_import.ZEN_CONTENT_RESOURCES.values())))

    def test_development_default_browser_prompt_is_off(self):
        defaults = (ROOT / 'apps/browser/chrome/defaults.yaml').read_text()
        self.assertIn('- name: browser.shell.checkDefaultBrowser\n  value: false', defaults)

    def test_build_environment_cannot_inherit_private_fetch_or_shell_hooks(self):
        unsafe = {'TASKCLUSTER_ROOT_URL': 'https://untrusted.invalid',
                  'TASKCLUSTER_ACCESS_TOKEN': 'synthetic-test-secret',
                  'TOOLTOOL_URL': 'https://untrusted.invalid',
                  'BASH_ENV': '/synthetic/hook', 'RUSTC_WRAPPER': '/synthetic/hook',
                  'MOZ_FETCHES_DIR': '/synthetic/artifacts', 'MOZCONFIG': '/synthetic/config'}
        with patch.dict(os.environ, unsafe):
            environment = zen.zen_toolchain.environment()
        for name in unsafe:
            self.assertNotIn(name, environment)
        self.assertEqual(environment['GIT_CONFIG_GLOBAL'], '/dev/null')
        self.assertEqual(environment['npm_config_userconfig'], '/dev/null')
        self.assertTrue(environment['CARGO_HOME'].startswith(str(zen.BUILD_ROOT)))

    def test_overlay_refuses_unknown_local_edit(self):
        record = json.loads((ROOT / 'patches/zen/overlay.json').read_text())[0]
        with tempfile.TemporaryDirectory(prefix='axiosozo-zen-security-') as directory:
            root = Path(directory)
            path = root / record['path']
            path.parent.mkdir(parents=True)
            path.write_text('existing work must survive')
            with self.assertRaisesRegex(RuntimeError, 'PATCH_CONFLICT'):
                zen.apply_records(root, [record])
            self.assertEqual(path.read_text(), 'existing work must survive')

    def test_source_guard_rejects_unexported_native_file(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-zen-source-') as directory:
            with patch.object(zen, 'capture', side_effect=['src/widget/local.cpp\0', '._sidecar\0']):
                self.assertEqual(zen.unexpected_source_changes(Path(directory)), ['src/widget/local.cpp'])

    def test_managed_mirror_refresh_distinguishes_user_edits(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-zen-source-') as directory:
            root = Path(directory)
            relative = 'src/zen/common/axiosozo/GeckoEngineAdapter.sys.mjs'
            mirror = root / relative
            mirror.parent.mkdir(parents=True)
            mirror.write_text('previous generated module')
            digest = hashlib.sha256(mirror.read_bytes()).hexdigest()
            (root / '.axiosozo-overlay-state.json').write_text(json.dumps({'version': 1, 'files': {relative: digest}}))
            with patch.object(zen, 'capture', side_effect=['', relative + '\0.axiosozo-overlay-state.json\0']):
                self.assertEqual(zen.unexpected_source_changes(root), [])
            mirror.write_text('unexported local user edit')
            with patch.object(zen, 'capture', side_effect=['', relative + '\0.axiosozo-overlay-state.json\0']):
                self.assertEqual(zen.unexpected_source_changes(root), [relative])

    def test_source_guard_catches_ignored_mozconfig(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-zen-source-') as directory:
            root = Path(directory)
            (root / 'mozconfig').write_text('local config must survive')
            with patch.object(zen, 'capture', side_effect=['', '']):
                self.assertTrue(zen.unexpected_source_changes(root)[0].startswith('mozconfig '))
            self.assertEqual((root / 'mozconfig').read_text(), 'local config must survive')

    def test_toolchain_extraction_preserves_unowned_existing_directory(self):
        with tempfile.TemporaryDirectory(prefix='axiosozo-toolchain-guard-') as directory:
            root = Path(directory)
            archive = root / 'tool.tar'
            archive.write_bytes(b'fixture archive')
            destination = root / 'tool'
            destination.mkdir()
            existing = destination / 'user-file'
            existing.write_text('preserve me')
            with self.assertRaisesRegex(RuntimeError, 'UNOWNED_TOOLCHAIN_DESTINATION'):
                zen.zen_toolchain.extract(archive, destination)
            self.assertEqual(existing.read_text(), 'preserve me')

    def test_missing_custom_build_does_not_substitute_installed_browser(self):
        original = zen.BUILD
        try:
            with tempfile.TemporaryDirectory(prefix='axiosozo-zen-gate-') as directory:
                zen.BUILD = Path(directory)
                self.assertEqual(zen.describe()['reason'], 'CUSTOM_ZEN_BUILD_MISSING')
        finally:
            zen.BUILD = original

    def test_changed_chrome_requires_controlled_rebuild(self):
        original = zen.BUILD
        try:
            with tempfile.TemporaryDirectory(prefix='axiosozo-zen-gate-') as directory:
                zen.BUILD = Path(directory)
                (zen.BUILD / 'build-stamp.json').write_text(json.dumps({'fingerprint': 'stale'}))
                with patch.object(zen, 'unexpected_source_changes', return_value=[]):
                    self.assertEqual(zen.describe()['reason'], 'NATIVE_REBUILD_REQUIRED')
        finally:
            zen.BUILD = original


if __name__ == '__main__':
    unittest.main()
