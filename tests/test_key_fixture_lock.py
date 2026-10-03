"""Owned temporary POSIX lock fixtures only; no subprocess, Keychain or provider."""
import fcntl
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

SOURCE = Path(__file__).resolve().parents[1] / "tools/axiosozo-key-fixture/key_fixture.py"
spec = importlib.util.spec_from_file_location("key_fixture_lock_target", SOURCE)
f = importlib.util.module_from_spec(spec)
spec.loader.exec_module(f)


class PresenceLockTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="axiosozo-key-lock-")
        self.root = Path(self.temp.name)
        self.directory = os.open(self.root, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
        self.state = f.PresenceState(self.directory)
        self.assertEqual(self.state.operate("store", "jev", b"synthetic-gui-key-jev-plan4"), 0)
        self.lock = os.open("presence.lock", os.O_RDWR | os.O_NOFOLLOW, dir_fd=self.directory)

    def tearDown(self):
        os.close(self.lock)
        os.close(self.directory)
        self.temp.cleanup()

    def test_presence_reads_coexist_with_another_owned_shared_reader(self):
        fcntl.flock(self.lock, fcntl.LOCK_SH | fcntl.LOCK_NB)
        for provider, expected in (("jev", 0), ("openai", 44)):
            self.assertEqual(self.state.operate("exists", provider), expected)
        self.assertEqual((self.root / "jev.presence").read_bytes(), b"stored\n")
        self.assertFalse((self.root / "openai.presence").exists())

    def test_shared_reader_excludes_store_and_remove_without_changes(self):
        fcntl.flock(self.lock, fcntl.LOCK_SH | fcntl.LOCK_NB)
        for operation, provider, data in (("store", "openai", b"synthetic-gui-key-openai-plan4"), ("remove", "jev", b"")):
            with self.assertRaises(BlockingIOError):
                self.state.operate(operation, provider, data)
        self.assertEqual((self.root / "jev.presence").read_bytes(), b"stored\n")
        self.assertFalse((self.root / "openai.presence").exists())
        fcntl.flock(self.lock, fcntl.LOCK_UN)
        self.assertEqual(self.state.operate("remove", "jev"), 0)
        self.assertEqual(self.state.operate("store", "openai", b"synthetic-gui-key-openai-plan4"), 0)

    def test_exclusive_writer_excludes_presence_and_mutation(self):
        fcntl.flock(self.lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        for operation, provider, data in (("exists", "jev", b""), ("exists", "openai", b""),
                ("store", "openai", b"synthetic-gui-key-openai-plan4"), ("remove", "jev", b"")):
            with self.assertRaises(BlockingIOError):
                self.state.operate(operation, provider, data)
        self.assertEqual((self.root / "jev.presence").read_bytes(), b"stored\n")
        self.assertFalse((self.root / "openai.presence").exists())


if __name__ == "__main__":
    unittest.main()
