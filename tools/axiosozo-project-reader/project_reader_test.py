#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. https://mozilla.org/MPL/2.0/
"""Synthetic external-TMPDIR containment, race and descriptor-lifecycle tests."""
import base64
from contextlib import contextmanager
import errno
import importlib.util
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

HERE = Path(__file__).resolve().parent
SPEC = importlib.util.spec_from_file_location("project_reader", HERE / "project_reader.py")
reader = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(reader)


class ReaderTests(unittest.TestCase):
    def setUp(self):
        temporary = os.environ.get("TMPDIR", "")
        if not str(Path(temporary).resolve()).startswith("/Volumes/AxioSozoBuild/workstation/tmp/"):
            raise RuntimeError("tests require the external workstation TMPDIR")
        self.temp = tempfile.TemporaryDirectory(prefix="project-reader-", dir=temporary)
        self.addCleanup(self.temp.cleanup)
        self.base = Path(self.temp.name).resolve()
        self.root = self.base / "project"
        self.outside = self.base / "outside"
        self.root.mkdir()
        self.outside.mkdir()
        self.file = self.root / "package.json"
        self.file.write_bytes(b'{"name":"synthetic"}')
        self.trap = self.outside / "package.json"
        self.trap.write_bytes(b'{"outside":"TRAP"}')
        self.trap_identity = reader.identity(self.trap.stat())

    def payload(self, relative="package.json", **over):
        root_identity = reader.operation("metadata", {"root": str(self.root)})["identity"]
        file_info = reader.operation("metadata", {"root": str(self.root), "relative": relative, "expectedRoot": root_identity})
        return {"root": str(self.root), "relative": relative, "expectedRoot": root_identity,
                "expectedFile": file_info["identity"], "maxBytes": reader.MAX_READ_BYTES, **over}

    def result_bytes(self, payload):
        value = reader.operation("read", payload)
        self.assertEqual(set(value), {"encoding", "data", "identity"})
        self.assertEqual(value["encoding"], "base64")
        self.assertEqual(value["identity"], payload["expectedFile"])
        return base64.b64decode(value["data"], validate=True)

    @contextmanager
    def audit(self, before_open=None, before_read=None):
        real_open, real_close, real_read = os.open, os.close, os.read
        active, content_opens, reads, calls = set(), [], [], []

        def opened(path, flags, mode=0o777, *, dir_fd=None):
            calls.append((path, flags, dir_fd))
            if before_open:
                before_open(path, flags, dir_fd)
            fd = real_open(path, flags, mode, dir_fd=dir_fd)
            active.add(fd)
            value = os.fstat(fd)
            if stat.S_ISREG(value.st_mode):
                content_opens.append(reader.identity(value))
            return fd

        def closed(fd):
            active.remove(fd)
            return real_close(fd)

        def read(fd, count):
            if before_read:
                before_read(fd, count)
            reads.append((reader.identity(os.fstat(fd)), count))
            return real_read(fd, count)

        supports = os.supports_dir_fd | {opened}
        with patch.object(os, "open", opened), patch.object(os, "close", closed), patch.object(os, "read", read), patch.object(os, "supports_dir_fd", supports):
            try:
                yield content_opens, reads, calls
            finally:
                self.assertEqual(active, set(), "all opened descriptors closed on every exit")

    def assert_refused(self, call, codes=("IDENTITY_CHANGED", "READ_CONTAINMENT_REFUSED", "NOT_REGULAR_FILE")):
        try:
            call()
        except reader.Refused as cause:
            self.assertIn(cause.code, codes)
        except OSError as cause:
            self.assertIn(cause.errno, {errno.ELOOP, errno.ENOTDIR, errno.ENOENT})
        else:
            self.fail("unsafe operation was accepted")

    def test_metadata_exact_identity_and_content_read(self):
        payload = self.payload()
        self.assertEqual(payload["expectedRoot"], reader.identity(self.root.stat()))
        self.assertEqual(payload["expectedFile"], reader.identity(self.file.stat()))
        self.assertTrue(all(isinstance(value, str) for value in payload["expectedFile"].values()))
        with self.audit() as (opens, reads, calls):
            self.assertEqual(self.result_bytes(payload), b'{"name":"synthetic"}')
        self.assertEqual(opens, [payload["expectedFile"]])
        self.assertTrue(reads)
        for path, flags, parent in calls:
            self.assertTrue(flags & os.O_NOFOLLOW)
            self.assertTrue(flags & os.O_CLOEXEC)
            if path == "package.json":
                self.assertTrue(flags & os.O_NONBLOCK)
            else:
                self.assertTrue(flags & os.O_DIRECTORY)
            self.assertEqual(path == "/", parent is None)

    def test_metadata_never_content_opens_leaf(self):
        expected = reader.identity(self.root.stat())
        with self.audit() as (opens, reads, _calls):
            value = reader.operation("metadata", {"root": str(self.root), "relative": "package.json", "expectedRoot": expected})
        self.assertEqual(value, {"type": "regular", "size": self.file.stat().st_size, "identity": reader.identity(self.file.stat())})
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_leaf_symlink_swap_after_metadata_opens_reads_zero_outside_content(self):
        payload = self.payload()
        def swap(path, flags, _parent):
            if path == "package.json" and not flags & os.O_DIRECTORY:
                self.file.unlink()
                self.file.symlink_to(self.trap)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_ancestor_symlink_swap_after_metadata_opens_reads_zero_outside_content(self):
        target = self.root / "apps" / "web" / "package.json"
        target.parent.mkdir(parents=True)
        target.write_bytes(b'{"inside":"apps"}')
        outside_web = self.outside / "web"
        outside_web.mkdir()
        (outside_web / "package.json").write_bytes(b'{"outside":"TRAP"}')
        payload = self.payload("apps/web/package.json")
        def swap(path, _flags, _parent):
            if path == "apps":
                (self.root / "apps").rename(self.root / "parked-apps")
                (self.root / "apps").symlink_to(self.outside, target_is_directory=True)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_root_symlink_swap_after_metadata_opens_reads_zero_outside_content(self):
        payload = self.payload()
        def swap(path, _flags, _parent):
            if path == self.root.name:
                self.root.rename(self.base / "parked-project")
                self.root.symlink_to(self.outside, target_is_directory=True)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_regular_leaf_inode_replacement_is_not_read(self):
        payload = self.payload()
        replacement = self.outside / "replacement.json"
        replacement.write_bytes(b'{"replacement":"TRAP"}')
        replacement_id = reader.identity(replacement.stat())
        def swap(path, flags, _parent):
            if path == "package.json" and not flags & os.O_DIRECTORY:
                self.file.unlink()
                replacement.rename(self.file)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload), ("IDENTITY_CHANGED",))
        self.assertEqual(opens, [replacement_id])
        self.assertEqual(reads, [])

    def test_regular_root_inode_replacement_does_not_open_leaf(self):
        payload = self.payload()
        def swap(path, _flags, _parent):
            if path == self.root.name:
                self.root.rename(self.base / "parked-project")
                self.root.mkdir()
                (self.root / "package.json").write_bytes(b'{"replacement":"TRAP"}')
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload), ("IDENTITY_CHANGED",))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_regular_ancestor_inode_replacement_does_not_open_leaf(self):
        (self.root / "apps").mkdir()
        (self.root / "apps" / "package.json").write_bytes(b'{}')
        payload = self.payload("apps/package.json")
        def swap(path, _flags, _parent):
            if path == "apps":
                (self.root / "apps").rename(self.root / "parked-apps")
                (self.root / "apps").mkdir()
                (self.root / "apps" / "package.json").write_bytes(b'{"replacement":"TRAP"}')
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload), ("IDENTITY_CHANGED",))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_open_root_retains_authorized_tree_after_root_name_swap(self):
        (self.root / "apps").mkdir()
        (self.root / "apps" / "package.json").write_bytes(b'{"authorized":"ORIGINAL"}')
        (self.outside / "apps").mkdir()
        (self.outside / "apps" / "package.json").write_bytes(b'{"outside":"TRAP"}')
        payload = self.payload("apps/package.json")
        def swap(path, _flags, _parent):
            if path == "apps":
                self.root.rename(self.base / "parked-project")
                self.root.symlink_to(self.outside, target_is_directory=True)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assertEqual(self.result_bytes(payload), b'{"authorized":"ORIGINAL"}')
        self.assertEqual(opens, [payload["expectedFile"]])
        self.assertTrue(all(value == payload["expectedFile"] for value, _count in reads))
        self.assertNotIn(self.trap_identity, opens)

    def test_fifo_replacement_does_not_block_or_read(self):
        payload = self.payload()
        def swap(path, flags, _parent):
            if path == "package.json" and not flags & os.O_DIRECTORY:
                self.file.unlink()
                os.mkfifo(self.file)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload), ("NOT_REGULAR_FILE",))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_hardlinked_content_is_refused(self):
        self.file.unlink()
        os.link(self.trap, self.file)
        with self.audit() as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("metadata", {"root": str(self.root), "relative": "package.json", "expectedRoot": reader.identity(self.root.stat())}))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_size_cap_and_in_place_change_are_refused(self):
        self.file.write_bytes(b"x" * reader.MAX_FILE_BYTES)
        payload = self.payload()
        with self.audit() as (_opens, reads, _calls):
            self.assertEqual(len(self.result_bytes(payload)), reader.MAX_FILE_BYTES)
        self.assertLessEqual(sum(count for _identity, count in reads), reader.MAX_READ_BYTES)
        self.file.write_bytes(b"x" * (reader.MAX_FILE_BYTES + 1))
        with self.audit() as (_opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload), ("TOO_LARGE",))
        self.assertEqual(reads, [])
        self.file.write_bytes(b"original")
        payload = self.payload()
        changed = [False]
        def mutate(_fd, _count):
            if not changed[0]:
                changed[0] = True
                self.file.write_bytes(b"replacement-longer")
        with self.audit(before_read=mutate) as (_opens, _reads, _calls):
            self.assert_refused(lambda: reader.operation("read", payload), ("IDENTITY_CHANGED",))

    def test_allowlist_parity_with_core_and_strict_package_document_shapes(self):
        source = (HERE.parents[1] / "packages" / "contexts" / "src" / "detect.mjs").read_text()
        for name in ("DETECTION_FILES", "PACKAGE_DETECTION_FILES", "INV_LIST_FIXED", "INV_LIST_SUFFIXES", "INV_CHECK_FIXED", "INV_CHECK_SUFFIXES"):
            body = re.search(r"(?:export )?const " + name + r" = Object.freeze\(\[(.*?)\]\);", source, re.S).group(1)
            exported = set(re.findall(r"'([^']*)'", body))
            self.assertEqual(set(getattr(reader, name)), exported)
        for path in [".git/config", ".axiosozo/project.json", "apps/web/package.json", "apps/@scope/name/vercel.json", "docs/domains.md", "docs/customer-app/domains.md", "apps/web/.vercel/project.json"]:
            self.assertTrue(reader.allowed_relative(path), path)
        for path in [".env", "AGENTS.md", "CLAUDE.md", ".codex/package.json", "apps/.hidden/package.json", "apps/node_modules/package.json", "a/b/c/d/e/package.json", "docs/a/b/domains.md", "docs/constructor/domains.md", "docs/node_modules/domains.md", "../package.json", "/package.json", "apps//package.json", "apps/../package.json", "convex/schema.ts", "ios/project.pbxproj", "package.json/anything"]:
            self.assertFalse(reader.allowed_relative(path), path)

    def test_setup_icon_policy_parity_with_core(self):
        setup = (HERE.parents[1] / "packages" / "contexts" / "src" / "setup.mjs").read_text()
        schema = (HERE.parents[1] / "packages" / "contexts" / "src" / "schema.mjs").read_text()
        for name, source in (("ICON_DIR_NAMES", setup), ("BRAND_DIR_NAMES", setup), ("ICON_EXTENSIONS", schema)):
            body = re.search(r"export const " + name + r" = Object.freeze\(\[(.*?)\]\);", source, re.S).group(1)
            self.assertEqual(set(getattr(reader, name)), set(re.findall(r"'([^']*)'", body)), name)
        for path in ["README.md", "Makefile", "justfile", "Procfile.dev", "project.json", "icon.png", "public/favicon.svg",
                     "assets/brand/logo-v2/app-icon.SVG", "src-tauri/icons/128x128.png", "build/icon.png", "apps/web/public/logo.webp"]:
            self.assertTrue(reader.allowed_relative(path), path)
        for path in ["readme.md", "docs/README.md", "dev", "icon.gif", "branding/app.icns", ".github/logo.png", "a/../icon.png", "node_modules/x/icon.png",
                     "a/b/c/d/e/f/g/h/i/icon.png", ".env.png", "public/.env.png", "apps//icon.png"]:
            self.assertFalse(reader.allowed_relative(path), path)
        for path in ["public", "apps/web/public", "assets/brand", "assets/brand/browser-logo-v2", "src-tauri", "src/app"]:
            self.assertTrue(reader.allowed_list(path), path)
        # Package-shaped folders were already listable (names only); icon folders add deeper brand/logo folders.
        for path in ["node_modules/public", ".github", "dist/assets", "a/b/c/d/e/f/g/h/public", "../public", "x/y/z/w/logo-v2", "public/.hidden"]:
            self.assertFalse(reader.allowed_list(path), path)
        for path in ["dev", "bin/dev", "pnpm-lock.yaml", "branding/app.icns", "public/icon.png", "assets/brand"]:
            self.assertTrue(reader.allowed_presence(path), path)
        for path in [".env.icns", "public/.env.png", "a/b/c/d/e/f/g/h/i/icon.png", "../x.png", "node_modules/x/icon.png"]:
            self.assertFalse(reader.allowed_presence(path), path)

    def test_icon_bytes_are_read_through_the_same_descriptor_checks(self):
        (self.root / "public").mkdir()
        image = self.root / "public" / "icon.png"
        image.write_bytes(b"\x89PNG\r\n\x1a\nicon")
        self.assertEqual(self.result_bytes(self.payload("public/icon.png")), b"\x89PNG\r\n\x1a\nicon")
        (self.root / "public" / "logo.png").symlink_to(self.outside)
        self.assert_refused(lambda: reader.operation("presence", {"root": str(self.root), "relative": "public/logo.png",
                                                                   "expectedRoot": self.payload()["expectedRoot"]}), ("READ_CONTAINMENT_REFUSED",))

    def test_unallowlisted_content_has_zero_descriptor_opens(self):
        payload = self.payload()
        for relative in [".env", "AGENTS.md", "../package.json", str(self.trap), "docs/notes.md"]:
            with self.audit() as (opens, reads, calls):
                self.assert_refused(lambda: reader.operation("read", {**payload, "relative": relative}), ("NOT_ALLOWLISTED",))
            self.assertEqual(opens, [])
            self.assertEqual(reads, [])
            self.assertEqual(calls, [])

    def test_missing_capability_or_unsupported_flags_never_fall_back(self):
        payload = self.payload()
        for change in [{"O_NOFOLLOW": 0}, {"O_DIRECTORY": 0}, {"O_CLOEXEC": 0}, {"O_NONBLOCK": 0}, {"supports_dir_fd": set()}, {"supports_follow_symlinks": set()}]:
            with patch.multiple(os, **change):
                self.assert_refused(lambda: reader.operation("read", payload), ("READ_CONTAINMENT_UNAVAILABLE",))
        def unsupported(*_args, **_kwargs):
            raise OSError(errno.EOPNOTSUPP, "unsupported")
        with patch.object(os, "open", unsupported), patch.object(os, "supports_dir_fd", os.supports_dir_fd | {unsupported}), patch("sys.stdout") as output:
            reader.main(["helper", "read", json.dumps(payload)])
            answer = json.loads(output.write.call_args[0][0])
        self.assertEqual(answer, {"ok": False, "error": "READ_CONTAINMENT_UNAVAILABLE"})

    def cli_json(self, operation, payload):
        proc = subprocess.run([sys.executable, "-I", "-S", "-B", str(HERE / "project_reader.py"), operation,
                               payload if isinstance(payload, str) else json.dumps(payload)], cwd="/", env={"LANG": "C", "LC_ALL": "C"},
                              capture_output=True, check=True, timeout=3)
        self.assertEqual(proc.stderr, b"")
        return json.loads(proc.stdout)

    def test_cli_strict_json_and_fixed_error_envelopes(self):
        payload = self.payload()
        value = self.cli_json("read", payload)
        self.assertTrue(value["ok"])
        self.assertEqual(base64.b64decode(value["result"]["data"]), self.file.read_bytes())
        for operation, bad in [("shell", {}), ("read", {**payload, "maxBytes": True}), ("read", {**payload, "maxBytes": reader.MAX_READ_BYTES + 1}), ("read", {**payload, "extra": True}), ("read", '{"root":"/a","root":"/b"}'), ("read", "NaN")]:
            answer = self.cli_json(operation, bad)
            self.assertEqual(answer, {"ok": False, "error": "INVALID_PARAMS"})
        for identity in [None, {"device": 1, "inode": "2"}, {"device": "01", "inode": "2"}, {"device": "1", "inode": "0"}, {"device": "1", "inode": "9" * 21}, {"device": "1", "inode": "2", "extra": True}]:
            self.assertEqual(self.cli_json("read", {**payload, "expectedFile": identity}), {"ok": False, "error": "READ_CONTAINMENT_UNAVAILABLE"})
        for root in ["/", "relative", str(self.root) + "/", str(self.root) + "/../project", str(self.root) + "//child", "\ud800"]:
            self.assertEqual(self.cli_json("read", {**payload, "root": root}), {"ok": False, "error": "INVALID_PARAMS"})
        missing = {**payload, "relative": "vercel.json"}
        self.assertEqual(self.cli_json("read", missing), {"ok": False, "error": "NOT_FOUND"})

    def test_common_single_link_git_config_is_readable(self):
        git = self.root / ".git"
        git.mkdir()
        (git / "config").write_bytes(b"[core]\nrepositoryformatversion = 0\n")
        payload = self.payload(".git/config")
        self.assertEqual(self.result_bytes(payload), (git / "config").read_bytes())


    def list_payload(self, relative="", **over):
        root_identity = reader.operation("metadata", {"root": str(self.root)})["identity"]
        directory_identity = reader.identity((self.root / relative).stat())
        return {"root": str(self.root), "relative": relative, "expectedRoot": root_identity,
                "expectedDirectory": directory_identity, "limit": 512, **over}

    def test_contained_listing_and_presence_have_no_content_opens(self):
        (self.root / "docs").mkdir()
        (self.root / ".agent-worktrees").mkdir()
        (self.root / "AGENTS.md").write_bytes(b"presence only")
        (self.root / "outside-link").symlink_to(self.outside, target_is_directory=True)
        (self.root / "._appledouble").write_bytes(b"omit")
        payload = self.list_payload()
        with self.audit() as (opens, reads, _calls):
            result = reader.operation("list", payload)
            presence = reader.operation("presence", {"root": str(self.root), "relative": "AGENTS.md", "expectedRoot": payload["expectedRoot"]})
        self.assertEqual(result["identity"], payload["expectedDirectory"])
        self.assertEqual({entry["name"] for entry in result["entries"]}, {"package.json", "AGENTS.md", "docs", ".agent-worktrees"})
        self.assertEqual(presence["type"], "regular")
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])
        for path in ["AGENTS.md", "CLAUDE.md", "convex/schema.ts", "apps/web/convex", "apps/web/android/build.gradle", ".codex", ".agent-worktrees", "apps/web"]:
            self.assertTrue(reader.allowed_presence(path), path)
        for path in [".env", "docs/deep/private/secrets/file.md", "apps/.hidden", "../apps", "convex/arbitrary/deep/path/file.ts", "node_modules"]:
            self.assertFalse(reader.allowed_presence(path), path)

    def test_listing_ancestor_swap_cannot_return_outside_names(self):
        (self.root / "apps" / "web").mkdir(parents=True)
        (self.root / "apps" / "web" / "inside").mkdir()
        (self.outside / "web").mkdir()
        (self.outside / "web" / "OUTSIDE_TRAP_NAME").mkdir()
        payload = self.list_payload("apps/web")
        def swap(path, _flags, _parent):
            if path == "apps":
                (self.root / "apps").rename(self.root / "parked-apps")
                (self.root / "apps").symlink_to(self.outside, target_is_directory=True)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            self.assert_refused(lambda: reader.operation("list", payload))
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_listing_open_descriptor_retains_authorized_names_after_swap(self):
        (self.root / "apps" / "web").mkdir(parents=True)
        (self.root / "apps" / "web" / "inside").mkdir()
        (self.outside / "apps" / "web").mkdir(parents=True)
        (self.outside / "apps" / "web" / "OUTSIDE_TRAP_NAME").mkdir()
        payload = self.list_payload("apps/web")
        def swap(path, _flags, _parent):
            if path == "web":
                self.root.rename(self.base / "parked-project")
                self.root.symlink_to(self.outside, target_is_directory=True)
        with self.audit(before_open=swap) as (opens, reads, _calls):
            result = reader.operation("list", payload)
        self.assertEqual(result["entries"], [{"name": "inside", "type": "directory"}])
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_listing_counts_raw_omitted_entries_without_unbounded_allocation(self):
        payload = self.list_payload(limit=512)
        class Scan:
            count = 0
            closed = False
            def __enter__(self):
                return self
            def __exit__(self, *_args):
                self.closed = True
            def __next__(self):
                self.count += 1
                if self.count > 512:
                    raise AssertionError("raw scan exceeded cap")
                return type("Entry", (), {"name": "._omit" + str(self.count)})()
        scan = Scan()
        def scanned(fd):
            self.assertEqual(reader.identity(os.fstat(fd)), payload["expectedDirectory"])
            return scan
        with patch.object(os, "scandir", scanned), patch.object(os, "supports_fd", os.supports_fd | {scanned}), self.audit() as (opens, reads, _calls):
            result = reader.operation("list", payload)
        self.assertEqual(result["entries"], [])
        self.assertEqual(scan.count, 512)
        self.assertTrue(scan.closed)
        self.assertEqual(opens, [])
        self.assertEqual(reads, [])

    def test_listing_missing_fd_capability_and_invalid_requests_fail_closed(self):
        payload = self.list_payload()
        with patch.object(os, "supports_fd", set()):
            self.assert_refused(lambda: reader.operation("list", payload), ("READ_CONTAINMENT_UNAVAILABLE",))
        for values in [{"limit": True}, {"limit": 513}, {"extra": True}]:
            self.assert_refused(lambda: reader.operation("list", {**payload, **values}), ("INVALID_PARAMS",))
        for relative in [".env", "../outside", "apps/.hidden", "node_modules", "convex/schema.ts"]:
            self.assert_refused(lambda: reader.operation("list", {**payload, "relative": relative}), ("NOT_ALLOWLISTED",))
        expected = {**payload["expectedDirectory"], "inode": "999999999"}
        self.assert_refused(lambda: reader.operation("list", {**payload, "expectedDirectory": expected}), ("IDENTITY_CHANGED",))
        result = self.cli_json("list", payload)
        self.assertTrue(result["ok"])
        self.assertEqual(result["result"]["entries"], [{"name": "package.json", "type": "regular"}])


if __name__ == "__main__":
    unittest.main(verbosity=2)
