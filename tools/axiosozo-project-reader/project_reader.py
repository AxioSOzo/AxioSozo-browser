#!/usr/bin/env python3
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. https://mozilla.org/MPL/2.0/
"""Product-owned, descriptor-bound static project reads. No project execution.

Run only through a configured trusted interpreter with -I -S. Directory
components never follow links; content is read only from a regular single-link
file descriptor matching checked root/file device+inode identities.
"""
import base64
from contextlib import ExitStack
import errno
import json
import os
import re
import stat
import sys

MAX_FILE_BYTES = 262144
MAX_READ_BYTES = MAX_FILE_BYTES + 1
MAX_ARGUMENT_BYTES = 16384
MAX_LISTING_ENTRIES = 512
DETECTION_FILES = frozenset({
    "package.json", ".vercel/project.json", "vercel.json", "netlify.toml", "wrangler.toml", "wrangler.json",
    "fly.toml", "docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml",
    "src-tauri/tauri.conf.json", "tauri.conf.json", "electron-builder.json", "electron-builder.yml",
    "Cargo.toml", "pyproject.toml", "go.mod", ".git/config", ".axiosozo/project.json",
    "pnpm-workspace.yaml", "lerna.json", "turbo.json", "nx.json", "convex.json",
    "README.md", "Makefile", "justfile", "Procfile.dev", "project.json",
})
PACKAGE_DETECTION_FILES = frozenset({
    "package.json", ".vercel/project.json", "vercel.json", "netlify.toml", "wrangler.toml", "wrangler.json",
    "src-tauri/tauri.conf.json", "tauri.conf.json",
})
INV_LIST_FIXED = frozenset({"docs", ".agent-worktrees", "ios", "macos"})
INV_LIST_SUFFIXES = ("", "/ios", "/macos")
INV_CHECK_FIXED = frozenset({
    "AGENTS.md", "CLAUDE.md", ".claude", ".codex", ".agent-worktrees", "convex", "convex/schema.ts", "convex/http.ts",
    "android", "build.gradle", "build.gradle.kts", "android/build.gradle", "android/build.gradle.kts",
    "dev", "bin/dev", "script/dev", "scripts/dev", "script/server", "dev.sh", "start.sh", "run.sh", "scripts/dev.sh",
    "pnpm-lock.yaml", "yarn.lock", "bun.lockb", "bun.lock", "package-lock.json",
})
INV_CHECK_SUFFIXES = ("/convex", "/build.gradle", "/build.gradle.kts", "/android/build.gradle", "/android/build.gradle.kts")
SKIP_DIRS = frozenset({"node_modules", "dist", "build", "out", "target", "coverage"})
# Project icon search (workstation-v1 §1.5): names of folders whose entries may
# be listed, logo folders inside brand folders, and image files whose metadata
# and bytes (at most MAX_FILE_BYTES) may be read. Mirrors packages/contexts/src/setup.mjs.
ICON_DIR_NAMES = frozenset({"public", "static", "assets", "branding", "brand", "icons", "images", "img", "logo", "logos",
                            "resources", "media", "app", "src", "src-tauri"})
BRAND_DIR_NAMES = frozenset({"brand", "branding", "logo", "logos", "icons"})
BRAND_CHILD = re.compile(r"logo|icon|brand|mark|symbol", re.IGNORECASE)
ICON_EXTENSIONS = frozenset({"png", "svg", "ico", "webp", "jpg", "jpeg"})
MAX_ICON_DEPTH = 8
BAD_KEYS = frozenset({"__proto__", "constructor", "prototype"})
SEGMENT = re.compile(r"[A-Za-z0-9_@+][A-Za-z0-9._@+-]{0,99}\Z", re.ASCII)
DEVICE_DECIMAL = re.compile(r"(?:0|[1-9][0-9]{0,19})\Z", re.ASCII)
INODE_DECIMAL = re.compile(r"[1-9][0-9]{0,19}\Z", re.ASCII)
UNSUPPORTED_ERRNOS = frozenset(value for value in (
    getattr(errno, "ENOSYS", None), getattr(errno, "ENOTSUP", None),
    getattr(errno, "EOPNOTSUPP", None), errno.EINVAL,
) if value is not None)


class Refused(Exception):
    def __init__(self, code):
        super().__init__(code)
        self.code = code


def capabilities(listing=False):
    required = ("O_NOFOLLOW", "O_DIRECTORY", "O_CLOEXEC", "O_NONBLOCK")
    if (os.name != "posix" or any(not isinstance(getattr(os, key, None), int) or getattr(os, key) == 0 for key in required)
            or os.open not in os.supports_dir_fd or os.stat not in os.supports_dir_fd
            or os.stat not in os.supports_follow_symlinks):
        raise Refused("READ_CONTAINMENT_UNAVAILABLE")
    if listing and os.scandir not in os.supports_fd:
        raise Refused("READ_CONTAINMENT_UNAVAILABLE")


def safe_segment(value):
    return bool(SEGMENT.fullmatch(value)) and value.lower() not in SKIP_DIRS and value not in BAD_KEYS


def package_dir(value):
    parts = value.split("/")
    return 1 <= len(parts) <= 4 and len(value) <= 200 and all(safe_segment(part) for part in parts)


def icon_segments(value, skip=True):
    if not isinstance(value, str) or not 0 < len(value) <= 400:
        return None
    parts = value.split("/")
    if len(parts) > MAX_ICON_DEPTH or not all(SEGMENT.fullmatch(part) and part not in BAD_KEYS for part in parts):
        return None
    if any(part.lower() == "node_modules" or (skip and part.lower() in SKIP_DIRS) for part in parts):
        return None
    return parts


def icon_dir(value):
    parts = icon_segments(value)
    if parts is None:
        return False
    last = parts[-1].lower()
    return last in ICON_DIR_NAMES or (len(parts) >= 2 and parts[-2].lower() in BRAND_DIR_NAMES and bool(BRAND_CHILD.search(last)))


def icon_file(value, readable):
    parts = icon_segments(value, skip=False)
    if parts is None or "." not in parts[-1]:
        return False
    extension = parts[-1].rsplit(".", 1)[1].lower()
    return extension in ICON_EXTENSIONS or (not readable and extension == "icns")


def allowed_relative(value):
    if not isinstance(value, str):
        return False
    if value in DETECTION_FILES or value == "docs/domains.md" or icon_file(value, readable=True):
        return True
    parts = value.split("/")
    if len(parts) == 3 and parts[0] == "docs" and parts[2] == "domains.md" and safe_segment(parts[1]):
        return True
    return any(value.endswith("/" + leaf) and package_dir(value[:-len(leaf) - 1]) for leaf in PACKAGE_DETECTION_FILES)


def plan_path(value, fixed, suffixes):
    if not isinstance(value, str):
        return False
    if value in fixed:
        return True
    return any((package_dir(value) if not suffix else value.endswith(suffix) and package_dir(value[:-len(suffix)])) for suffix in suffixes)


def allowed_list(value):
    return value == "" or plan_path(value, INV_LIST_FIXED, INV_LIST_SUFFIXES) or icon_dir(value)


def allowed_presence(value):
    return (plan_path(value, INV_LIST_FIXED, INV_LIST_SUFFIXES) or plan_path(value, INV_CHECK_FIXED, INV_CHECK_SUFFIXES)
            or icon_dir(value) or icon_file(value, readable=False))


def child_name(value):
    return (isinstance(value, str) and 0 < len(value) <= 255 and value not in {".", ".."}
            and not any(char in "/\\" or ord(char) < 32 or 127 <= ord(char) <= 159 or 0xd800 <= ord(char) <= 0xdfff for char in value))


def root_value(value):
    if (not isinstance(value, str) or not value.startswith("/") or value == "/"
            or value.endswith("/") or "//" in value
            or any(part in {".", ".."} for part in value.split("/"))
            or any(ord(char) < 32 or 127 <= ord(char) <= 159 for char in value)
            or len(value.encode("utf-8")) > 4096):
        raise Refused("INVALID_PARAMS")
    return value


def exact_identity(value):
    if (not isinstance(value, dict) or set(value) != {"device", "inode"}
            or not isinstance(value.get("device"), str) or not DEVICE_DECIMAL.fullmatch(value["device"])
            or not isinstance(value.get("inode"), str) or not INODE_DECIMAL.fullmatch(value["inode"])):
        raise Refused("READ_CONTAINMENT_UNAVAILABLE")
    return value


def identity(value):
    return {"device": str(value.st_dev), "inode": str(value.st_ino)}


def same_identity(left, right):
    return identity(left) == right


def info(value):
    mode = value.st_mode
    kind = "directory" if stat.S_ISDIR(mode) else "regular" if stat.S_ISREG(mode) else "symlink" if stat.S_ISLNK(mode) else "other"
    return {"type": kind, "size": value.st_size, "identity": identity(value)}


def directory_flags():
    return os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC


def open_directory(component, parent, stack):
    prior = os.stat(component, dir_fd=parent, follow_symlinks=False)
    if not stat.S_ISDIR(prior.st_mode):
        raise Refused("READ_CONTAINMENT_REFUSED")
    child = os.open(component, directory_flags(), dir_fd=parent)
    stack.callback(os.close, child)
    opened = os.fstat(child)
    if not stat.S_ISDIR(opened.st_mode) or identity(opened) != identity(prior):
        raise Refused("IDENTITY_CHANGED")
    return child


def open_root(root, expected, stack):
    current = os.open("/", directory_flags())
    stack.callback(os.close, current)
    if not stat.S_ISDIR(os.fstat(current).st_mode):
        raise Refused("READ_CONTAINMENT_UNAVAILABLE")
    for component in root.split("/")[1:]:
        current = open_directory(component, current, stack)
    if expected is not None and not same_identity(os.fstat(current), expected):
        raise Refused("IDENTITY_CHANGED")
    return current


def parent_for_relative(root_fd, relative, stack):
    current = root_fd
    parts = relative.split("/")
    for component in parts[:-1]:
        current = open_directory(component, current, stack)
    return current, parts[-1]


def checked_regular(value, expected=None):
    if not stat.S_ISREG(value.st_mode):
        raise Refused("NOT_REGULAR_FILE")
    if value.st_nlink != 1:
        raise Refused("READ_CONTAINMENT_REFUSED")
    if expected is not None and not same_identity(value, expected):
        raise Refused("IDENTITY_CHANGED")


def metadata(root, relative=None, expected_root=None):
    with ExitStack() as stack:
        root_fd = open_root(root, expected_root, stack)
        if relative is None:
            return info(os.fstat(root_fd))
        parent, leaf = parent_for_relative(root_fd, relative, stack)
        value = os.stat(leaf, dir_fd=parent, follow_symlinks=False)
        if stat.S_ISLNK(value.st_mode) or (stat.S_ISREG(value.st_mode) and value.st_nlink != 1):
            raise Refused("READ_CONTAINMENT_REFUSED")
        return info(value)


def read_contained(root, relative, expected_root, expected_file, max_bytes):
    with ExitStack() as stack:
        root_fd = open_root(root, expected_root, stack)
        parent, leaf = parent_for_relative(root_fd, relative, stack)
        prior = os.stat(leaf, dir_fd=parent, follow_symlinks=False)
        checked_regular(prior, expected_file)
        # NONBLOCK prevents a FIFO replacement hanging before fstat. It does
        # not change reads from the regular descriptor authorized below.
        flags = os.O_RDONLY | os.O_NOFOLLOW | os.O_CLOEXEC | os.O_NONBLOCK
        file_fd = os.open(leaf, flags, dir_fd=parent)
        stack.callback(os.close, file_fd)
        opened = os.fstat(file_fd)
        checked_regular(opened, expected_file)
        if not same_identity(os.fstat(root_fd), expected_root):
            raise Refused("IDENTITY_CHANGED")
        if opened.st_size > MAX_FILE_BYTES:
            raise Refused("TOO_LARGE")
        chunks, remaining = [], max_bytes
        while remaining:
            chunk = os.read(file_fd, min(65536, remaining))
            if not chunk:
                break
            chunks.append(chunk)
            remaining -= len(chunk)
        final = os.fstat(file_fd)
        checked_regular(final, expected_file)
        if (final.st_size != opened.st_size or final.st_mtime_ns != opened.st_mtime_ns
                or final.st_ctime_ns != opened.st_ctime_ns):
            raise Refused("IDENTITY_CHANGED")
        return {"encoding": "base64", "data": base64.b64encode(b"".join(chunks)).decode("ascii"), "identity": identity(final)}


def list_contained(root, relative, expected_root, expected_directory, limit):
    with ExitStack() as stack:
        directory_fd = open_root(root, expected_root, stack)
        if relative:
            for component in relative.split("/"):
                directory_fd = open_directory(component, directory_fd, stack)
        opened = os.fstat(directory_fd)
        if not stat.S_ISDIR(opened.st_mode) or not same_identity(opened, expected_directory):
            raise Refused("IDENTITY_CHANGED")
        entries = []
        # Count raw entries, including omitted links/AppleDouble/bad names.
        # Never allocate an unbounded list and then slice it.
        with os.scandir(directory_fd) as scanned:
            examined = 0
            while examined < limit:
                try:
                    entry = next(scanned)
                except StopIteration:
                    break
                examined += 1
                name = entry.name
                if not child_name(name) or name.startswith("._"):
                    continue
                try:
                    value = os.stat(name, dir_fd=directory_fd, follow_symlinks=False)
                except FileNotFoundError:
                    continue
                if stat.S_ISLNK(value.st_mode):
                    continue
                entries.append({"name": name, "type": info(value)["type"]})
        final = os.fstat(directory_fd)
        if (not same_identity(final, expected_directory) or final.st_mtime_ns != opened.st_mtime_ns
                or final.st_ctime_ns != opened.st_ctime_ns):
            raise Refused("IDENTITY_CHANGED")
        return {"entries": entries, "identity": identity(final)}


def operation(name, payload):
    capabilities(listing=name == "list")
    if not isinstance(payload, dict) or name not in {"metadata", "read", "presence", "list"}:
        raise Refused("INVALID_PARAMS")
    root = root_value(payload.get("root"))
    if name == "metadata" and set(payload) == {"root"}:
        return metadata(root)
    if name == "list":
        if set(payload) != {"root", "relative", "expectedRoot", "expectedDirectory", "limit"}:
            raise Refused("INVALID_PARAMS")
        relative, limit = payload.get("relative"), payload.get("limit")
        if not allowed_list(relative):
            raise Refused("NOT_ALLOWLISTED")
        if type(limit) is not int or not 1 <= limit <= MAX_LISTING_ENTRIES:
            raise Refused("INVALID_PARAMS")
        return list_contained(root, relative, exact_identity(payload.get("expectedRoot")), exact_identity(payload.get("expectedDirectory")), limit)
    keys = {"root", "relative", "expectedRoot"} if name in {"metadata", "presence"} else {"root", "relative", "expectedRoot", "expectedFile", "maxBytes"}
    if set(payload) != keys:
        raise Refused("INVALID_PARAMS")
    relative = payload.get("relative")
    if not (allowed_presence(relative) if name == "presence" else allowed_relative(relative)):
        raise Refused("NOT_ALLOWLISTED")
    expected_root = exact_identity(payload.get("expectedRoot"))
    if name in {"metadata", "presence"}:
        return metadata(root, relative, expected_root)
    expected_file = exact_identity(payload.get("expectedFile"))
    max_bytes = payload.get("maxBytes")
    if type(max_bytes) is not int or not 1 <= max_bytes <= MAX_READ_BYTES:
        raise Refused("INVALID_PARAMS")
    return read_contained(root, relative, expected_root, expected_file, max_bytes)


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise Refused("INVALID_PARAMS")
        value[key] = item
    return value


def reject_constant(_value):
    raise Refused("INVALID_PARAMS")


def main(argv):
    try:
        if len(argv) != 3 or len(argv[2].encode("utf-8")) > MAX_ARGUMENT_BYTES:
            raise Refused("INVALID_PARAMS")
        payload = json.loads(argv[2], object_pairs_hook=unique_object, parse_constant=reject_constant)
        result = operation(argv[1], payload)
        answer = {"ok": True, "result": result}
    except Refused as cause:
        answer = {"ok": False, "error": cause.code}
    except OSError as cause:
        code = "READ_CONTAINMENT_UNAVAILABLE" if cause.errno in UNSUPPORTED_ERRNOS else "NOT_FOUND" if cause.errno == errno.ENOENT else "READ_CONTAINMENT_REFUSED"
        answer = {"ok": False, "error": code}
    except (ValueError, TypeError, UnicodeError):
        answer = {"ok": False, "error": "INVALID_PARAMS"}
    sys.stdout.write(json.dumps(answer, ensure_ascii=False, separators=(",", ":")) + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
