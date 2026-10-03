"""FAKE OS METADATA AND IN-MEMORY FILES ONLY; no Keychain or subprocess."""
import importlib.util
import io
import os
from pathlib import Path
import stat
import types
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1] / "tools/axiosozo-key-fixture/key_fixture.py"
spec = importlib.util.spec_from_file_location("key_fixture", SOURCE)
f = importlib.util.module_from_spec(spec)
spec.loader.exec_module(f)


def info(mode, size=0, links=1, uid=None, inode=5):
    return types.SimpleNamespace(st_mode=mode, st_uid=os.getuid() if uid is None else uid,
        st_size=size, st_nlink=links, st_dev=2, st_ino=inode)


class FakeFS:
    def __init__(self):
        self.files = {}
        self.fds = {7: {"info": info(stat.S_IFDIR | 0o700), "data": b"", "name": None}}
        self.serial = 10
        self.closes = []
        self.unlinks = []
        self.writes = []

    def open(self, name, flags, mode=0o777, dir_fd=None):
        if dir_fd != 7:
            raise AssertionError("fixed owned dirfd required")
        if not flags & os.O_NOFOLLOW:
            raise AssertionError("nofollow required")
        existing = self.files.get(name)
        if existing and stat.S_ISLNK(existing["info"].st_mode):
            raise OSError("synthetic symlink refused")
        if existing is None:
            if not flags & os.O_CREAT:
                raise FileNotFoundError(name)
            existing = {"info": info(stat.S_IFREG | mode, inode=self.serial), "data": b"", "name": name}
            self.files[name] = existing
        elif flags & os.O_CREAT and flags & os.O_EXCL:
            raise FileExistsError(name)
        fd = self.serial
        self.serial += 1
        self.fds[fd] = existing
        return fd

    def fstat(self, fd):
        return self.fds[fd]["info"]

    def read(self, fd, count):
        return self.fds[fd]["data"][:count]

    def write(self, fd, data):
        self.writes.append(data)
        target = self.fds[fd]
        target["data"] = data
        target["info"].st_size = len(data)
        return len(data)

    def close(self, fd):
        self.closes.append(fd)
        del self.fds[fd]

    def unlink(self, name, dir_fd):
        self.unlinks.append(name)
        del self.files[name]

    def stat_entry(self, name, dir_fd, follow_symlinks):
        if dir_fd != 7 or follow_symlinks:
            raise AssertionError("fixed nofollow stat required")
        return self.files[name]["info"]

    def marker(self, name="jev.presence", data=f.MARKER, mode=stat.S_IFREG | 0o600, links=1, uid=None):
        self.files[name] = {"data": data, "name": name, "info": info(mode, len(data), links, uid)}


class FixtureTests(unittest.TestCase):
    def setUp(self):
        self.fs = FakeFS()
        self.patches = [patch.object(f.os, method, getattr(self.fs, method))
            for method in ("open", "fstat", "read", "write", "close", "unlink")]
        self.patches.append(patch.object(f.os, "stat", self.fs.stat_entry))
        self.patches += [patch.object(f.os, "fsync"), patch.object(f.fcntl, "flock")]
        for item in self.patches:
            item.start()
        self.state = f.PresenceState(7)

    def tearDown(self):
        for item in reversed(self.patches):
            item.stop()

    def test_missing_has_exit_44_and_no_marker_mutation(self):
        self.assertEqual(self.state.operate("exists", "jev"), 44)
        self.assertEqual(self.state.operate("remove", "jev"), 44)
        self.assertEqual(self.fs.writes, [])
        self.assertEqual(self.fs.unlinks, [])

    def test_two_providers_stay_separate_and_store_only_literal_marker(self):
        for provider in ("jev", "openai"):
            key = ("synthetic-gui-key-" + provider + "-plan4").encode()
            self.assertEqual(self.state.operate("store", provider, key), 0)
            self.assertEqual(self.state.operate("exists", provider), 0)
        self.assertEqual(self.fs.writes, [f.MARKER, f.MARKER])
        self.assertEqual(self.state.operate("remove", "jev"), 0)
        self.assertEqual(self.state.operate("exists", "jev"), 44)
        self.assertEqual(self.state.operate("exists", "openai"), 0)

    def test_repeat_store_does_not_rewrite_existing_marker(self):
        key = b"synthetic-gui-key-jev-plan4"
        self.assertEqual(self.state.operate("store", "jev", key), 0)
        self.assertEqual(self.state.operate("store", "jev", key), 0)
        self.assertEqual(self.fs.writes, [f.MARKER])

    def test_only_exact_invented_placeholders_are_accepted(self):
        for data in (b"different-but-valid-looking", b"synthetic-gui-key-openai-plan4", b"", b"x" * 4097,
                     b"synthetic-gui-key-jev-plan4\n", "synthetic-gui-key-jev-plan4"):
            self.assertEqual(self.state.operate("store", "jev", data), 2)
        self.assertEqual(self.fs.files, {})

    def test_read_and_unknown_operations_selectors_are_never_implemented(self):
        for operation, provider in (("read", "jev"), ("setup", "openai"), ("exists", "other"),
                                     ("store", "jev/../openai"), ("remove", "")):
            self.assertEqual(self.state.operate(operation, provider), 2)
        self.assertEqual(self.fs.files, {})

    def test_exists_remove_cannot_receive_secret_data(self):
        for operation in ("exists", "remove"):
            self.assertEqual(self.state.operate(operation, "openai", b"not-accepted"), 2)
        self.assertEqual(self.fs.files, {})

    def test_corrupt_presence_data_is_refused_without_deletion(self):
        for data in (b"", b"stored", b"stored\nX", b"synthetic-gui-key-jev-plan4"):
            self.fs.marker(data=data)
            with self.assertRaises(ValueError):
                self.state.operate("remove", "jev")
            self.assertEqual(self.fs.unlinks, [])

    def test_marker_owner_type_permissions_links_are_fail_closed(self):
        variants = [(stat.S_IFREG | 0o644, 1, None), (stat.S_IFREG | 0o600, 2, None),
            (stat.S_IFREG | 0o600, 1, os.getuid() + 1), (stat.S_IFIFO | 0o600, 1, None),
            (stat.S_IFLNK | 0o600, 1, None)]
        for mode, links, uid in variants:
            self.fs.marker(mode=mode, links=links, uid=uid)
            with self.assertRaises((OSError, ValueError)):
                self.state.operate("exists", "jev")
        self.assertEqual(self.fs.unlinks, [])

    def test_owned_directory_required(self):
        for directory in (info(stat.S_IFDIR | 0o755), info(stat.S_IFREG | 0o700),
                          info(stat.S_IFDIR | 0o700, uid=os.getuid() + 1)):
            self.fs.fds[7]["info"] = directory
            with self.assertRaises(ValueError):
                f.PresenceState(7)

    def test_busy_lock_refuses_and_closes_without_mutating_marker(self):
        with patch.object(f.fcntl, "flock", side_effect=BlockingIOError("synthetic busy lock")):
            with self.assertRaises(BlockingIOError):
                self.state.operate("store", "jev", b"synthetic-gui-key-jev-plan4")
        self.assertEqual(self.fs.writes, [])
        self.assertEqual(len(self.fs.closes), 1)

    def test_lock_owner_mode_and_nlink_are_checked(self):
        self.fs.marker(name="presence.lock", data=b"", links=2)
        with self.assertRaises(ValueError):
            self.state.operate("exists", "openai")
        self.assertEqual(self.fs.writes, [])
        self.assertEqual(len(self.fs.closes), 1)

    def test_no_unlink_after_marker_identity_changes(self):
        self.fs.marker()
        original_stat = self.fs.stat_entry
        def replaced(*args, **kwargs):
            metadata = original_stat(*args, **kwargs)
            return info(metadata.st_mode, metadata.st_size, inode=metadata.st_ino + 1)
        with patch.object(f.os, "stat", replaced):
            with self.assertRaises(ValueError):
                self.state.operate("remove", "jev")
        self.assertEqual(self.fs.unlinks, [])

    def test_exact_external_hash_named_path_only(self):
        good = f.BASE / ("keys-" + "a" * 32) / ("key-helper-" + "b" * 64 + ".py")
        self.assertTrue(f.allowed_path(good))
        for bad in (Path("relative.py"), f.BASE / "keys-a" / good.name,
                    f.BASE / ("keys-" + "a" * 32) / "key_helper.py",
                    Path(str(good).replace("workstation/", "zen/")),
                    f.BASE / ("keys-" + "a" * 32) / ".." / good.name):
            self.assertFalse(f.allowed_path(bad))

    def test_main_rejects_bad_argv_before_any_filesystem_admission(self):
        for argv in (["helper", "read"], ["helper", "store", "wrong"], ["helper"],
                     ["helper", "exists", "jev", "extra"]):
            with patch.object(f, "admitted_directory", side_effect=AssertionError("must not run")):
                self.assertEqual(f.main(argv, io.BytesIO()), 2)


if __name__ == "__main__":
    unittest.main()
