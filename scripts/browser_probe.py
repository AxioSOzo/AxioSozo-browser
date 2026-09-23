"""Owned native GUI inspection sessions; launching is never a rendering PASS."""
import datetime
import json
from pathlib import Path
import secrets
import subprocess
import time

from fixtures import FixtureServer
from session import OwnedSession, cef_profile_names, private_directory


def new_evidence_directory(project, kind):
    evidence = project / "docs/evidence" / f"{kind}-{secrets.token_hex(8)}"
    evidence.mkdir(mode=0o700)
    return evidence


def inspect_browser(*, kind, project, session_root, zen_script, environment, duration=600):
    if kind not in {"smoke", "engine-probe"}:
        raise ValueError("unknown browser probe")
    # zen.py accepts only [A-Za-z0-9-] for owned session profile names.
    # mkdtemp's random suffix may contain underscores, so use fixed hex here.
    evidence = new_evidence_directory(project, kind)
    result = {"status": "EXPERIMENTAL", "kind": kind,
              "started_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "reason": "GUI assertions require observation of this exact run",
              "gui_verified": False, "E1": "NOT_VERIFIED", "E2": "NOT_VERIFIED"}
    code = 20
    session_path = session_root / evidence.name
    legacy_cef_before = cef_profile_names(session_root.parent)
    try:
        with OwnedSession(session_path) as session:
            profile = private_directory(session.path / "gecko")
            (profile / ".axiosozo-dev-profile").touch(mode=0o600)
            certificates = private_directory(session.path / "tls")
            with FixtureServer() as fixture, FixtureServer(certificates) as tls:
                env = {**environment, "AXIOSOZO_SESSION_RUNTIME": str(session.path),
                       "AXIOSOZO_ENGINE_FIXTURE_ORIGIN": fixture.origin,
                       "AXIOSOZO_TLS_FIXTURE_URL": tls.url,
                       "AXIOSOZO_ENGINE_PROBE": "1" if kind == "engine-probe" else "0"}
                result.update(fixture=fixture.identity(), certificate_fixture=tls.identity(),
                              profile=str(profile), session_id=session.session_id,
                              developer_engine_action=kind == "engine-probe")
                with (evidence / "browser-stdout.log").open("w") as out, (evidence / "browser-stderr.log").open("w") as err:
                    process = session.spawn([environment["AXIOSOZO_PYTHON"], str(zen_script), "run",
                                             "--profile", str(profile), "--url", fixture.url],
                                            cwd=project, env=env, stdout=out, stderr=err)
                    result["native_pid"] = process.pid
                    print(f"{kind}: native fixture session; evidence {evidence}", flush=True)
                    print(f"TLS warning fixture: {tls.url}", flush=True)
                    print(f"Inspection window: {duration}s. Closing the browser or Ctrl+C stops only this session.", flush=True)
                    # No acceptance follows from process creation, an elapsed timer,
                    # or a clean exit. Screenshots and live input must be verified.
                    started = time.monotonic()
                    try:
                        result["browser_exit_code"] = process.wait(timeout=duration)
                    except subprocess.TimeoutExpired:
                        result["inspection_timeout"] = True
                    result["elapsed_seconds"] = round(time.monotonic() - started, 3)
            # OwnedSession reaps the browser group and its inherited-stdio children.
        result["owned_session_stopped"] = True
        if result.get("browser_exit_code", 0) != 0:
            result.update(status="FAIL", reason="Native browser exited with an error")
            code = 1
    except KeyboardInterrupt:
        result.update(status="EXPERIMENTAL", reason="Inspection interrupted; no GUI PASS inferred")
        code = 130
    except (OSError, RuntimeError, subprocess.SubprocessError) as error:
        result.update(status="BLOCKED_ENV", reason=str(error))
        code = 2
    finally:
        session_cef_after = cef_profile_names(session_path)
        legacy_cef_new = cef_profile_names(session_root.parent) - legacy_cef_before
        result["cef_profile_audit"] = {
            "session_profiles_remaining": len(session_cef_after),
            "new_legacy_global_profiles": len(legacy_cef_new),
            "note": "Cleanup boundary only; absence does not prove CEF was launched"
        }
        if session_cef_after or legacy_cef_new:
            result.update(status="FAIL", reason="CEF_PROFILE_ARTIFACT_AFTER_SESSION")
            code = 1
        result["exit_code"] = code
        (evidence / "session.json").write_text(json.dumps(result, indent=2) + "\n")
    print(json.dumps(result, indent=2), flush=True)
    return code
