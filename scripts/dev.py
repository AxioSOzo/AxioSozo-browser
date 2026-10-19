#!/usr/bin/env python3
"""Single entrypoint for the actual native project, with truthful prerequisite gates."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import platform
import signal
import shutil
import subprocess
import sys
import threading

from session import OwnedSession, SessionBusy, private_directory
import storage

ROOT = Path(__file__).resolve().parents[1]
# Linux uses storage.py's plain build root and never calls a macOS helper.
LINUX = storage.LINUX
EXTERNAL = Path("/Volumes/DevStorage")
MOUNT = "/Users/wout/.local/bin/mount-dev-storage"
WRAPPER = "/Users/wout/.local/bin/dev-external"
PROJECT_ID = hashlib.sha256(str(ROOT).encode()).hexdigest()[:16]
# dev-external hashes `pwd -P` including its trailing newline.
BUILD_ID = hashlib.sha256((str(ROOT) + "\n").encode()).hexdigest()[:16]
CORE = storage.BUILD_ROOT / "cargo-target" / "debug" / "browser-core"
SESSION_ROOT = storage.BUILD_ROOT / "runtime" / PROJECT_ID
# Crate registry cache and pinned toolchains are shared across build roots on the volume.
CARGO_HOME_DIR = storage.VOLUME / "cargo-home"
# In a sub build root (another worktree) the CEF component belongs to the engine
# workstream's volume-root build; its gates are reported as skipped, never passed.
SUBROOT = storage.BUILD_ROOT != storage.VOLUME
os.environ["AXIOSOZO_BUILD_ROOT"] = str(storage.BUILD_ROOT)
ZEN = ROOT / "scripts" / "zen.py"
PROJECT_READER = ROOT / "scripts" / "project_reader.py"
ARRIVAL_SUBPROCESS = ROOT / "scripts" / "arrival_subprocess.py"
AGENT_SOCKET_INSTALL = ROOT / "scripts" / "agent_socket_install.py"
AGENT_NOTIFY_INSTALL = ROOT / "scripts" / "agent_notify_install.py"
AGENT_BRIDGE_INSTALL = ROOT / "scripts" / "agent_bridge_install.py"
AGENT_BRIDGE_NODE = Path("/Volumes/AxioSozoBuild/toolchains/zen/node/bin/node")
MANIFEST_ACCEPT = ROOT / "scripts" / "manifest_accept.py"
AGENT_SOCKET_PYTHON = Path("/Volumes/AxioSozoBuild/toolchains/zen/python/bin/python3.11")
CEF = ROOT / "native" / "chromium-host" / "probe.py"
PROVIDER = ROOT / "packages" / "provider-host" / "cli.mjs"
RELEASE = ROOT / "scripts" / "release" / "preview.py"
GUI_TEST = ROOT / "scripts" / "gui_test.py"
LINUX_BUILD = ROOT / "scripts" / "linux_build.py"
# Setup components, in order; `./dev setup --only a,b` selects a subset.
SETUP_COMPONENTS = ("upstreams", "cargo", "core", "provider", "cef", "zen", "tools")
# Per-gate results of this invocation: (label, PASS | FAIL | BLOCKED_ENV, exit code).
RESULTS = []


def gate_summary(title):
    """Print every gate result. On Linux a component that reports BLOCKED_ENV for
    its platform (for example a macOS-only fixture, or the CEF host before the
    linux-cef workstream lands) is listed, never counted as a pass, and does not
    fail the run unless AXIOSOZO_STRICT=1. macOS exit codes are unchanged."""
    if not RESULTS:
        return
    print(f"{title} gate summary ({platform.system()} {platform.machine()}):", flush=True)
    for label, status, code in RESULTS:
        print(f"  {status:<11} exit={code:<3} {label}", flush=True)
    counts = {name: sum(1 for _, status, _ in RESULTS if status == name) for name in ("PASS", "FAIL", "BLOCKED_ENV")}
    print(f"{title}: {counts['PASS']} PASS, {counts['FAIL']} FAIL, {counts['BLOCKED_ENV']} BLOCKED_ENV", flush=True)


def outcome(codes):
    """Combined exit status. macOS: any nonzero gate fails (unchanged). Linux:
    BLOCKED_ENV gates are reported but tolerated unless AXIOSOZO_STRICT=1."""
    if not LINUX or os.environ.get("AXIOSOZO_STRICT") == "1":
        return any(codes)
    failed = any(status == "FAIL" for _, status, _ in RESULTS)
    blocked = sum(1 for _, status, _ in RESULTS if status == "BLOCKED_ENV")
    # A nonzero result without a matching BLOCKED_ENV record is always a failure.
    return failed or sum(1 for code in codes if code) > blocked


def provider_node():
    # Setup already verifies this project-local runtime. Do not make normal
    # browser use depend on the developer's global Node installation.
    pinned = storage.VOLUME / "toolchains/zen/node/bin/node"
    return str(pinned) if pinned.is_file() else shutil.which("node") or ""


def core_fingerprint():
    digest = hashlib.sha256()
    paths = [ROOT / "Cargo.toml", ROOT / "Cargo.lock", *sorted((ROOT / "crates").rglob("*.rs")),
             *sorted((ROOT / "crates").rglob("Cargo.toml"))]
    for path in paths:
        if path.name.startswith("._"):
            continue
        digest.update(str(path.relative_to(ROOT)).encode())
        digest.update(path.read_bytes())
    return digest.hexdigest()


def build_core():
    code = run(["cargo", "build", "--locked", "--offline", "--workspace", "--jobs", "2"], build=True)
    if code == 0 and CORE.is_file():
        CORE.with_suffix(".build.json").write_text(json.dumps({"fingerprint": core_fingerprint(),
            "binary_sha256": hashlib.sha256(CORE.read_bytes()).hexdigest()}))
    return code


def core_ready():
    stamp = CORE.with_suffix(".build.json")
    if not CORE.is_file() or not stamp.is_file():
        return False
    try:
        data = json.loads(stamp.read_text())
        return (data.get("fingerprint") == core_fingerprint()
                and data.get("binary_sha256") == hashlib.sha256(CORE.read_bytes()).hexdigest())
    except (OSError, ValueError):
        return False


def record(label, code, blocked=False):
    RESULTS.append((label, "PASS" if code == 0 else "BLOCKED_ENV" if blocked else "FAIL", code))
    return code


def run(argv, build=False, env=None, label=None):
    if signal.getsignal(signal.SIGCHLD) != signal.SIG_DFL:
        raise RuntimeError("DEFAULT_SIGCHLD_REQUIRED")
    label = label or " ".join(Path(str(item)).name if index == 0 else str(item)
                              for index, item in enumerate(argv[:4]))
    if build and LINUX:
        # No mount helper or dev-external on Linux: storage.py creates the
        # build root and routes temporary/cache/Cargo output into it.
        storage.ensure()
        CARGO_HOME_DIR.mkdir(parents=True, exist_ok=True)
        argv = [sys.executable, ROOT / "scripts/storage.py", "exec", "--", *argv]
    elif build:
        mounted = subprocess.run([MOUNT], cwd=ROOT)
        if mounted.returncode:
            return mounted.returncode
        if not storage.mounted():
            storage.ensure()
        # Never let a fresh native command populate the user's default Cargo
        # registry. The project cache is created before even an offline probe.
        CARGO_HOME_DIR.mkdir(parents=True, exist_ok=True)
        argv = [WRAPPER, sys.executable, ROOT / "scripts/storage.py", "exec", "--", *argv]
    if CARGO_HOME_DIR.is_dir():
        env = {**(os.environ if env is None else env), "CARGO_HOME": str(CARGO_HOME_DIR)}
    # Linux reads the child's output to classify a BLOCKED_ENV report; it is
    # copied through unchanged. macOS keeps inherited stdio.
    classify = LINUX
    process = subprocess.Popen([str(item) for item in argv], cwd=ROOT, env=env, start_new_session=True,
                               **({"stdout": subprocess.PIPE, "stderr": subprocess.STDOUT} if classify else {}))
    blocked = []
    reader = None
    if classify:
        def copy():
            for raw in iter(process.stdout.readline, b""):
                sys.stdout.buffer.write(raw)
                sys.stdout.flush()
                line = raw.decode("utf-8", "replace")
                if line.startswith("BLOCKED_ENV") or '"status": "BLOCKED_ENV"' in line or '"status":"BLOCKED_ENV"' in line:
                    blocked.append(line)
        reader = threading.Thread(target=copy, daemon=True)
        reader.start()
    try:
        code = process.wait()
        if reader:
            # Output of descendants that outlive the leader is not waited for.
            reader.join(timeout=5)
        return record(label, code, blocked=bool(blocked))
    finally:
        # This function is the sole waiter. Default SIGCHLD and an unreaped
        # original leader reserve its PID and prevent reuse of its group ID.
        # A successful wait sets returncode; no group signal follows a reap.
        if process.returncode is None:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            finally:
                try:
                    # Nested native components own their descendants and have
                    # time to complete their own cleanup before escalation.
                    process.wait(timeout=15)
                except subprocess.TimeoutExpired:
                    if process.returncode is None:
                        try:
                            os.killpg(process.pid, signal.SIGKILL)
                        except ProcessLookupError:
                            pass
                        finally:
                            process.wait(timeout=5)


def component(script, *args):
    label = f"{script.relative_to(ROOT)} {' '.join(args)}".strip()
    if SUBROOT and script == CEF:
        print(f"SKIPPED_ENGINE_WORKSTREAM: CEF {' '.join(args)} is not run in sub build root {storage.BUILD_ROOT}", flush=True)
        return 0
    if not script.is_file():
        print("BLOCKED_ENV: component entrypoint missing:", script.relative_to(ROOT), flush=True)
        return record(label, 2, blocked=True)
    command = provider_node() if script.suffix == ".mjs" else sys.executable
    return run([command, script, *args], label=label)


def total_memory_gib():
    if LINUX:
        try:
            for line in Path("/proc/meminfo").read_text().splitlines():
                if line.startswith("MemTotal:"):
                    return round(int(line.split()[1]) / 2**20, 1)
        except (OSError, ValueError, IndexError):
            pass
        return "unavailable"
    try:
        memory = subprocess.run(["/usr/sbin/sysctl", "-n", "hw.memsize"], capture_output=True, text=True)
        return round(int(memory.stdout) / 2**30) if memory.returncode == 0 else "unavailable under current permissions"
    except (OSError, ValueError):
        return "unavailable"


def linux_host():
    """Read-only Linux facts for doctor: distribution, CPUs, GUI test tools."""
    release = {}
    try:
        for line in Path("/etc/os-release").read_text().splitlines():
            key, _, value = line.partition("=")
            release[key] = value.strip('"')
    except OSError:
        pass
    tools = {name: shutil.which(name) for name in ("Xvfb", "xdotool", "xwininfo", "xwd", "xauth", "dbus-run-session",
                                                   "bwrap", "secret-tool", "node", "cargo", "clang", "gh")}
    return {"distribution": release.get("PRETTY_NAME", "unknown"), "kernel": platform.release(),
            "cpus": os.cpu_count(), "display": os.environ.get("DISPLAY") or None,
            "wayland_display": os.environ.get("WAYLAND_DISPLAY") or None, "tools": tools}


def doctor():
    # No mkdir, mount, dependency bootstrap, provider execution, auth reads, or login.
    usage = os.statvfs(EXTERNAL) if EXTERNAL.is_dir() and not LINUX else None
    data = {
        "os": "linux" if LINUX else "macos" if platform.system() == "Darwin" else platform.system().lower(),
        "platform": platform.platform(), "architecture": platform.machine(),
        "devstorage_free_gib": round(usage.f_bavail * usage.f_frsize / 2**30, 2) if usage else None,
        "coordinator_built": CORE.is_file(), "coordinator_build_current": core_ready(),
        "live_provider_authorized": False,
        "coordinator_browser_bridge": "IMPLEMENTED_GUI_UNVERIFIED",
        "overall": "PARTIAL_ENGINE_BLOCKED",
        "project_storage": storage.report(),
    }
    data["ram_gib"] = total_memory_gib()
    if LINUX:
        data["linux"] = linux_host()
    print(json.dumps(data, indent=2), flush=True)
    results = [component(ZEN, "doctor"), component(PROVIDER, "discover")]
    return 2 if any(results) or data["overall"] != "READY" else 0


def setup_components(only=SETUP_COMPONENTS):
    results = []
    # Source retrieval is separate from installing or executing upstream packages.
    if "upstreams" in only:
        results.append(run([sys.executable, ROOT / "scripts" / "upstreams.py"]))
    # Reuse existing cached crates read-only. On a clean machine fetch the exact lock
    # into a task-specific external Cargo home, never ~/.cargo's registry cache.
    if "cargo" in only and run(["cargo", "fetch", "--locked", "--offline"], build=True, label="cargo fetch --offline (cache probe)"):
        RESULTS.pop()  # an empty cache is expected on a clean machine; the online fetch decides
        CARGO_HOME_DIR.mkdir(parents=True, exist_ok=True)
        results.append(run(["cargo", "fetch", "--locked"], build=True))
    # Each component completes independently; do not make CEF/core depend on Gecko build.
    if "core" in only:
        results.append(build_core())
    if "provider" in only:
        results.append(component(PROVIDER, "setup"))
        results.append(component(PROVIDER, "keychain-positive-setup"))
    if "cef" in only:
        results.append(component(CEF, "setup"))
    if "zen" in only:
        results.append(component(ZEN, "setup"))
    if "tools" in only:
        results.append(component(PROJECT_READER, "setup"))
        results.append(component(ARRIVAL_SUBPROCESS, "setup"))
        results.append(component(AGENT_SOCKET_INSTALL, "setup"))
        results.append(component(AGENT_NOTIFY_INSTALL, "setup"))
        results.append(component(AGENT_BRIDGE_INSTALL, "setup"))
        results.append(component(MANIFEST_ACCEPT, "setup"))
    gate_summary("SETUP")
    failed = outcome(results)
    print("SETUP: " + ("completed" if not failed else "incomplete; see component results"), flush=True)
    return 2 if failed else 0


def setup(only=SETUP_COMPONENTS):
    # The whole native bootstrap has one owner; concurrent setup never modifies
    # another process's extraction, package install or bundle signature.
    storage.ensure()
    try:
        with OwnedSession(SESSION_ROOT / "setup"):
            return setup_components(only)
    except SessionBusy:
        print("BLOCKED_ENV: an AxioSozo setup already owns this build session", flush=True)
        return 2


def check():
    results = [run(["cargo", "fmt", "--all", "--", "--check"]),
               run(["cargo", "clippy", "--locked", "--offline", "--workspace", "--all-targets", "--jobs", "2", "--", "-D", "warnings"], build=True),
               component(PROVIDER, "check"), component(ZEN, "check"), component(CEF, "check"),
               component(PROJECT_READER, "check"), component(ARRIVAL_SUBPROCESS, "check"),
               component(AGENT_SOCKET_INSTALL, "check"), component(AGENT_NOTIFY_INSTALL, "check"),
               component(AGENT_BRIDGE_INSTALL, "check"),
               component(MANIFEST_ACCEPT, "check")]
    for path in [*ROOT.glob("scripts/*.py"), *ROOT.glob("scripts/release/*.py"), *ROOT.glob("tests/test_*.py")]:
        if path.name.startswith("._"):
            continue
        compile(path.read_bytes(), str(path), "exec")
    gate_summary("CHECK")
    return 1 if outcome(results) else 0


def test():
    policy_tests = run(["cargo", "test", "--locked", "--offline", "--workspace", "--jobs", "2"], build=True)
    build_result = build_core()
    results = [policy_tests, build_result,
               component(PROVIDER, "test"),
               component(PROVIDER, "sandbox-test"),
               component(PROVIDER, "keychain-negative-test"),
               component(PROVIDER, "keychain-positive-test"),
               component(ZEN, "check"),
               run([sys.executable, "-I", "-S", "-B", ROOT / "tools/axiosozo-project-reader/project_reader_test.py"], build=True),
               run([sys.executable, "-I", "-S", "-B", ROOT / "tools/axiosozo-arrival/arrival_lsof_test.py"], build=True),
               run([sys.executable, "-I", "-S", "-B", ROOT / "tools/axiosozo-manifest/manifest_accept_test.py"], build=True),
               run(["node", "--test", ROOT / "apps/browser/tests/cef-adapter.test.mjs"]),
               run(["node", "--test", ROOT / "apps/browser/tests/saved-pages.test.mjs"]),
               # Handoff 3 contexts core: DOM-free logic and fixture repositories.
               run(["node", "--test", *sorted(path for path in (ROOT / "packages/contexts/tests").glob("*.test.mjs")
                                             if not path.name.startswith("._"))]),
               component(CEF, "test-native")]
    if storage.BUILD_ROOT == Path("/Volumes/AxioSozoBuild/workstation"):
        results.append(run([AGENT_SOCKET_PYTHON, "-I", "-S", "-B",
                            ROOT / "tools/axiosozo-agent/tests/socket-posix.test.py"], build=True))
        results.append(run([AGENT_SOCKET_PYTHON, "-I", "-S", "-B",
                            ROOT / "tools/axiosozo-agent/tests/bridge-install.test.py"], build=True))
        # Verify the fixed source Node before any shipped bridge/notify fixture.
        bridge_check = component(AGENT_BRIDGE_INSTALL, "check")
        results.append(bridge_check)
        if bridge_check == 0:
            bridge_tests = [ROOT / "packages/agent-bridge/tests" / name for name in
                            ("bridge.test.mjs", "channel.test.mjs", "notify.test.mjs")]
            bridge_tmp = private_directory(storage.BUILD_ROOT / "tmp" / "agent-bridge-tests")
            bridge_env = {**os.environ, "AXIOSOZO_TEST_TMP": str(bridge_tmp)}
            results.append(run([AGENT_BRIDGE_NODE, "--test", "--test-timeout=10000",
                                "--test-reporter=spec", *bridge_tests], build=True, env=bridge_env))
        else:
            print("BLOCKED_ENV: agent bridge package tests require verified installed/source Node", flush=True)
    else:
        print("SKIPPED_WORKSTATION_FIXTURE: agent socket POSIX tests require the workstation root", flush=True)
        print("SKIPPED_WORKSTATION_FIXTURE: agent bridge installer/stdio tests require the workstation root", flush=True)
    env = {**os.environ, "AXIOSOZO_CORE_BINARY": str(CORE), "PYTHONDONTWRITEBYTECODE": "1"}
    if build_result == 0 and core_ready():
        results.append(run([sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py", "-v"], build=True, env=env))
        results.append(run(["node", "--test", ROOT / "apps/browser/tests/coordinator.test.mjs"], build=True, env=env))
    else:
        print("FAIL: current coordinator build unavailable; lifecycle tests were not run against a stale executable")
        results.append(record("coordinator lifecycle tests (stale or missing build)", 1))
    results.append(run([sys.executable, ROOT / "native/chromium-host/test_probe.py"], build=True))
    # Real CEF OSR fixture/input/lifecycle coverage is a component gate. A PASS
    # here still does not establish E1 in the Zen content area.
    if SUBROOT:
        print("SKIPPED_ENGINE_WORKSTREAM: native/chromium-host/stream_test.py (needs the volume-root CEF build)", flush=True)
    else:
        results.append(run([sys.executable, ROOT / "native/chromium-host/stream_test.py"], build=True))
    gate_summary("TEST")
    return 1 if outcome(results) else 0


def browser_environment():
    return {**os.environ, "AXIOSOZO_COORDINATOR_BINARY": str(CORE),
            "AXIOSOZO_BUILD_ROOT": str(storage.BUILD_ROOT),
            "AXIOSOZO_STATIC_READER_ROOT": str(storage.BUILD_ROOT),
            "AXIOSOZO_PROVIDER_HOST": str(PROVIDER),
            "AXIOSOZO_PROVIDER_NODE": provider_node(),
            # A location only: the provider host must never inspect personal
            # credentials. The audited official client owns authentication.
            "AXIOSOZO_PROVIDER_HOME": str(Path.home()),
            "AXIOSOZO_DISCOVERY_PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "AXIOSOZO_ENGINE_SWITCHING": "0",
            # The CEF component is built only at the volume root; sub build roots share it.
            "AXIOSOZO_CEF_ROOT": str(storage.VOLUME),
            "AXIOSOZO_CEF_BINARY": cef_binary(),
            "AXIOSOZO_PYTHON": sys.executable}


def cef_binary():
    """macOS: the signed probe bundle at the volume root. Linux: the CEF host of the
    cloud/linux-cef workstream, `<build root>/cef/linux/AxioCEFProbe` unless that
    workstream's launcher exports AXIOSOZO_CEF_BINARY."""
    if LINUX:
        return os.environ.get("AXIOSOZO_CEF_BINARY") or str(storage.VOLUME / "cef/linux/AxioCEFProbe")
    return str(storage.VOLUME / "cef/AxioCEFProbe.app/Contents/MacOS/AxioCEFProbe")


def browser_probe(kind):
    # E0 is a real native render test in this invocation, never a cached claim.
    if kind in {"engine-probe", "web-probe"} and component(CEF, "run"):
        print("PARTIAL_ENGINE_BLOCKED: E0 did not pass; no Zen embedding test was started.", flush=True)
        return 2
    if not core_ready() or component(ZEN, "ready"):
        print("BLOCKED_ENV: current coordinator and custom Zen builds are required for GUI inspection", flush=True)
        return 2
    from browser_probe import inspect_browser
    storage.ensure()
    return inspect_browser(kind=kind, project=ROOT, session_root=SESSION_ROOT,
                           zen_script=ZEN, environment=browser_environment())


def daily(profile):
    storage.ensure()
    if not core_ready():
        print("BLOCKED_ENV: coordinator build missing or changed. Run ./dev setup", flush=True)
        return 2
    # The Zen adapter owns source/build fingerprints, bundle identity and update-channel gates.
    if component(ZEN, "ready"):
        print("BLOCKED_ENV: no verified AxioSozo Zen build; services were not started", flush=True)
        return 2
    def interrupted(_signum, _frame):
        raise KeyboardInterrupt
    signal.signal(signal.SIGTERM, interrupted)
    try:
        with OwnedSession(SESSION_ROOT / profile) as session:
            gecko_profile = private_directory(session.path / "gecko")
            (gecko_profile / ".axiosozo-dev-profile").touch(mode=0o600)
            # Trusted Gecko chrome creates its own authenticated Subprocess pipes.
            # This supervisor supplies executable locations only, never a root token.
            env = browser_environment()
            # CEF's fixture profile is a child of this locked, app-owned session.
            # The native adapter validates this path against Gecko's actual ProfD.
            env["AXIOSOZO_SESSION_RUNTIME"] = str(session.path)
            # Each tab chooses its engine from Zen's tab menu. Chromium starts only
            # when a tab is switched and uses its own profile beside this one.
            env["AXIOSOZO_ENGINE_SWITCHING"] = "1"
            env["AXIOSOZO_ENGINE_PROBE"] = "0"
            env.pop("AXIOSOZO_ENGINE_FIXTURE_ORIGIN", None)
            env.pop("AXIOSOZO_TLS_FIXTURE_URL", None)
            browser = session.spawn([sys.executable, str(ZEN), "run", "--profile", str(gecko_profile)], cwd=ROOT, env=env)
            return browser.wait()
    except SessionBusy as error:
        print(str(error) + "; existing session retained", flush=True)
        return 0
    except KeyboardInterrupt:
        return 130


def passthrough(script, argv):
    """GUI harness and Linux build helpers own their own arguments."""
    return run([sys.executable, script, *argv], label=script.name)


def main():
    if sys.argv[1:2] == ["gui-test"]:
        return passthrough(GUI_TEST, sys.argv[2:])
    if sys.argv[1:2] == ["fetch-build"]:
        return passthrough(LINUX_BUILD, sys.argv[1:])
    if sys.argv[1:] == ["package"]:
        # Linux: relocatable tar.xz of the verified build plus axiosozo-build-info.json.
        return component(ZEN, "package")
    parser = argparse.ArgumentParser(description=__doc__, epilog="Also: ./dev gui-test --help, ./dev fetch-build --help, ./dev package (Linux)")
    parser.add_argument("command", nargs="?", default="run", choices=["run", "doctor", "setup", "check", "test", "smoke", "engine-probe", "web-probe", "provider-test", "jev-test", "release-check"])
    parser.add_argument("provider", nargs="?", choices=["codex", "claude-code", "antigravity"])
    parser.add_argument("--profile", default="development")
    parser.add_argument("--authorized", action="store_true", help="explicit operator authorization for a synthetic live diagnostic; never used by setup/test")
    parser.add_argument("--only", help="setup only these components (comma separated): " + ",".join(SETUP_COMPONENTS))
    args = parser.parse_args()
    only = SETUP_COMPONENTS
    if args.only is not None:
        only = tuple(item for item in args.only.split(",") if item)
        if args.command != "setup" or not only or any(item not in SETUP_COMPONENTS for item in only):
            parser.error("--only applies to setup and takes: " + ",".join(SETUP_COMPONENTS))
    if not args.profile or any(c not in "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-" for c in args.profile) or len(args.profile) > 48:
        parser.error("profile must be a short safe name")
    if args.command == "provider-test":
        if not args.provider:
            parser.error("provider-test needs a provider")
        return component(PROVIDER, "live", args.provider, *(["--authorized"] if args.authorized else []))
    if args.authorized and args.command != "jev-test":
        parser.error("--authorized only applies to explicit live diagnostics")
    if args.provider:
        parser.error("provider argument is only valid with provider-test")
    commands = {"doctor": doctor, "setup": lambda: setup(only), "check": check, "test": test,
                "engine-probe": lambda: browser_probe("engine-probe"),
                "web-probe": lambda: browser_probe("web-probe"),
                "jev-test": lambda: component(PROVIDER, "jev-test", *(["--authorized"] if args.authorized else [])),
                "run": lambda: daily(args.profile),
                # Preview packaging plan only: never signs, notarizes or uploads.
                "release-check": lambda: run([sys.executable, RELEASE, "--dry-run"], build=True),
                "smoke": lambda: browser_probe("smoke")}
    return commands[args.command]()


if __name__ == "__main__":
    try:
        def interrupt(_signum, _frame):
            raise KeyboardInterrupt
        signal.signal(signal.SIGTERM, interrupt)
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("Interrupted; owned command processes stopped", file=sys.stderr)
        raise SystemExit(130)
    except (OSError, RuntimeError) as error:
        print("BLOCKED_ENV:", str(error), file=sys.stderr)
        raise SystemExit(2)
