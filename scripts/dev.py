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

from session import OwnedSession, SessionBusy, private_directory
import storage

ROOT = Path(__file__).resolve().parents[1]
EXTERNAL = Path("/Volumes/DevStorage")
MOUNT = "/Users/wout/.local/bin/mount-dev-storage"
WRAPPER = "/Users/wout/.local/bin/dev-external"
PROJECT_ID = hashlib.sha256(str(ROOT).encode()).hexdigest()[:16]
# dev-external hashes `pwd -P` including its trailing newline.
BUILD_ID = hashlib.sha256((str(ROOT) + "\n").encode()).hexdigest()[:16]
CORE = storage.BUILD_ROOT / "cargo-target" / "debug" / "browser-core"
SESSION_ROOT = storage.BUILD_ROOT / "runtime" / PROJECT_ID
CARGO_HOME_DIR = storage.BUILD_ROOT / "cargo-home"
os.environ["AXIOSOZO_BUILD_ROOT"] = str(storage.BUILD_ROOT)
ZEN = ROOT / "scripts" / "zen.py"
CEF = ROOT / "native" / "chromium-host" / "probe.py"
PROVIDER = ROOT / "packages" / "provider-host" / "cli.mjs"
RELEASE = ROOT / "scripts" / "release" / "preview.py"


def provider_node():
    # Setup already verifies this project-local runtime. Do not make normal
    # browser use depend on the developer's global Node installation.
    pinned = storage.BUILD_ROOT / "toolchains/zen/node/bin/node"
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


def run(argv, build=False, env=None):
    if build:
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
    process = subprocess.Popen([str(item) for item in argv], cwd=ROOT, env=env, start_new_session=True)
    try:
        return process.wait()
    finally:
        if process.poll() is None:
            try:
                os.killpg(process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                # Nested native probe owns its own children and has an eight-second
                # graceful shutdown window. Let it finish before killing its group.
                process.wait(timeout=15)
            except subprocess.TimeoutExpired:
                pass
        try:
            os.killpg(process.pid, signal.SIGKILL)
        except ProcessLookupError:
            pass
        process.wait(timeout=5)


def component(script, *args):
    if not script.is_file():
        print("BLOCKED_ENV: component entrypoint missing:", script.relative_to(ROOT), flush=True)
        return 2
    command = provider_node() if script.suffix == ".mjs" else sys.executable
    return run([command, script, *args])


def doctor():
    # No mkdir, mount, dependency bootstrap, provider execution, auth reads, or login.
    usage = os.statvfs(EXTERNAL) if EXTERNAL.is_dir() else None
    data = {
        "platform": platform.platform(), "architecture": platform.machine(),
        "devstorage_free_gib": round(usage.f_bavail * usage.f_frsize / 2**30, 2) if usage else None,
        "coordinator_built": CORE.is_file(), "coordinator_build_current": core_ready(),
        "live_provider_authorized": False,
        "coordinator_browser_bridge": "IMPLEMENTED_GUI_UNVERIFIED",
        "overall": "PARTIAL_ENGINE_BLOCKED",
        "project_storage": storage.report(),
    }
    try:
        memory = subprocess.run(["/usr/sbin/sysctl", "-n", "hw.memsize"], capture_output=True, text=True)
        data["ram_gib"] = round(int(memory.stdout) / 2**30) if memory.returncode == 0 else "unavailable under current permissions"
    except (OSError, ValueError):
        data["ram_gib"] = "unavailable"
    print(json.dumps(data, indent=2), flush=True)
    results = [component(ZEN, "doctor"), component(PROVIDER, "discover")]
    return 2 if any(results) or data["overall"] != "READY" else 0


def setup_components():
    results = []
    # Source retrieval is separate from installing or executing upstream packages.
    results.append(run([sys.executable, ROOT / "scripts" / "upstreams.py"]))
    # Reuse existing cached crates read-only. On a clean machine fetch the exact lock
    # into a task-specific external Cargo home, never ~/.cargo's registry cache.
    if run(["cargo", "fetch", "--locked", "--offline"], build=True):
        CARGO_HOME_DIR.mkdir(parents=True, exist_ok=True)
        results.append(run(["cargo", "fetch", "--locked"], build=True))
    # Each component completes independently; do not make CEF/core depend on Gecko build.
    results.append(build_core())
    results.append(component(PROVIDER, "setup"))
    results.append(component(PROVIDER, "keychain-positive-setup"))
    results.append(component(CEF, "setup"))
    results.append(component(ZEN, "setup"))
    print("SETUP: " + ("completed" if not any(results) else "incomplete; see component results"), flush=True)
    return 2 if any(results) else 0


def setup():
    # The whole native bootstrap has one owner; concurrent setup never modifies
    # another process's extraction, package install or bundle signature.
    storage.ensure()
    try:
        with OwnedSession(SESSION_ROOT / "setup"):
            return setup_components()
    except SessionBusy:
        print("BLOCKED_ENV: an AxioSozo setup already owns this build session", flush=True)
        return 2


def check():
    results = [run(["cargo", "fmt", "--all", "--", "--check"]),
               run(["cargo", "clippy", "--locked", "--offline", "--workspace", "--all-targets", "--jobs", "2", "--", "-D", "warnings"], build=True),
               component(PROVIDER, "check"), component(ZEN, "check"), component(CEF, "check")]
    for path in [*ROOT.glob("scripts/*.py"), *ROOT.glob("scripts/release/*.py"), *ROOT.glob("tests/test_*.py")]:
        if path.name.startswith("._"):
            continue
        compile(path.read_bytes(), str(path), "exec")
    return 1 if any(results) else 0


def test():
    policy_tests = run(["cargo", "test", "--locked", "--offline", "--workspace", "--jobs", "2"], build=True)
    build_result = build_core()
    results = [policy_tests, build_result,
               component(PROVIDER, "test"),
               component(PROVIDER, "sandbox-test"),
               component(PROVIDER, "keychain-negative-test"),
               component(PROVIDER, "keychain-positive-test"),
               component(ZEN, "check"),
               run(["node", "--test", ROOT / "apps/browser/tests/cef-adapter.test.mjs"]),
               run(["node", "--test", ROOT / "apps/browser/tests/saved-pages.test.mjs"]),
               # Handoff 3 contexts core: DOM-free logic and fixture repositories.
               run(["node", "--test", *sorted(path for path in (ROOT / "packages/contexts/tests").glob("*.test.mjs")
                                             if not path.name.startswith("._"))]),
               component(CEF, "test-native")]
    env = {**os.environ, "AXIOSOZO_CORE_BINARY": str(CORE), "PYTHONDONTWRITEBYTECODE": "1"}
    if build_result == 0 and core_ready():
        results.append(run([sys.executable, "-m", "unittest", "discover", "-s", "tests", "-p", "test_*.py", "-v"], build=True, env=env))
        results.append(run(["node", "--test", ROOT / "apps/browser/tests/coordinator.test.mjs"], build=True, env=env))
    else:
        print("FAIL: current coordinator build unavailable; lifecycle tests were not run against a stale executable")
        results.append(1)
    results.append(run([sys.executable, ROOT / "native/chromium-host/test_probe.py"], build=True))
    # Real CEF OSR fixture/input/lifecycle coverage is a component gate. A PASS
    # here still does not establish E1 in the Zen content area.
    results.append(run([sys.executable, ROOT / "native/chromium-host/stream_test.py"], build=True))
    return 1 if any(results) else 0


def browser_environment():
    return {**os.environ, "AXIOSOZO_COORDINATOR_BINARY": str(CORE),
            "AXIOSOZO_BUILD_ROOT": str(storage.BUILD_ROOT),
            "AXIOSOZO_PROVIDER_HOST": str(PROVIDER),
            "AXIOSOZO_PROVIDER_NODE": provider_node(),
            # A location only: the provider host must never inspect personal
            # credentials. The audited official client owns authentication.
            "AXIOSOZO_PROVIDER_HOME": str(Path.home()),
            "AXIOSOZO_DISCOVERY_PATH": os.environ.get("PATH", "/usr/bin:/bin"),
            "AXIOSOZO_ENGINE_SWITCHING": "0",
            "AXIOSOZO_CEF_BINARY": str(storage.BUILD_ROOT / "cef/AxioCEFProbe.app/Contents/MacOS/AxioCEFProbe"),
            "AXIOSOZO_PYTHON": sys.executable}


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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", nargs="?", default="run", choices=["run", "doctor", "setup", "check", "test", "smoke", "engine-probe", "web-probe", "provider-test", "jev-test", "release-check"])
    parser.add_argument("provider", nargs="?", choices=["codex", "claude-code", "antigravity"])
    parser.add_argument("--profile", default="development")
    parser.add_argument("--authorized", action="store_true", help="explicit operator authorization for a synthetic live diagnostic; never used by setup/test")
    args = parser.parse_args()
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
    commands = {"doctor": doctor, "setup": setup, "check": check, "test": test,
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
