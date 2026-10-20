head 408abfea4ad8 vs base (dev) a3ab14e6ac95: FIXED_OR_NEW_PASS 5, OK 19, PRE_EXISTING 5

| gate | head | base (dev) | verdict |
| --- | --- | --- | --- |
| python:test_release_preview.py | FAIL | FAIL | PRE_EXISTING |
| python:test_understand_fixture_install.py | FAIL | FAIL | PRE_EXISTING |
| python:tools/axiosozo-arrival/arrival_lsof_test.py | FAIL | NOT_RUN | PRE_EXISTING |
| python:tools/axiosozo-manifest/manifest_accept_test.py | FAIL | NOT_RUN | PRE_EXISTING |
| python:tools/axiosozo-project-reader/project_reader_test.py | FAIL | NOT_RUN | PRE_EXISTING |
| node:apps/browser/tests/about-axiosozo-model.test.mjs | PASS | NOT_RUN | FIXED_OR_NEW_PASS |
| node:apps/browser/tests/about-axiosozo-page.test.mjs | PASS | NOT_RUN | FIXED_OR_NEW_PASS |
| python:apps/browser/tests/test_bootstrap.py | PASS | NOT_RUN | FIXED_OR_NEW_PASS |
| python:test_gui_engine_chromium.py | PASS | NOT_RUN | FIXED_OR_NEW_PASS |
| python:test_linux_desktop.py | PASS | NOT_RUN | FIXED_OR_NEW_PASS |
| cargo-build | PASS | PASS | OK |
| cargo-clippy | PASS | PASS | OK |
| cargo-fmt | PASS | PASS | OK |
| cargo-test | PASS | PASS | OK |
| dev-doctor | EXPECTED_NONZERO | EXPECTED_NONZERO | OK |
| python-compile | PASS | PASS | OK |
| python:test_agent_notify_install.py | PASS | PASS | OK |
| python:test_dev.py | PASS | PASS | OK |
| python:test_dev_cleanup.py | PASS | PASS | OK |
| python:test_fixtures.py | PASS | PASS | OK |
| python:test_key_fixture.py | PASS | PASS | OK |
| python:test_key_fixture_lock.py | PASS | PASS | OK |
| python:test_lifecycle.py | PASS | PASS | OK |
| python:test_manifest_accept_install.py | PASS | PASS | OK |
| python:test_session_cleanup.py | PASS | PASS | OK |
| python:test_storage.py | PASS | PASS | OK |
| python:test_terminal_handoff_cleanup.py | PASS | PASS | OK |
| python:test_terminal_handoff_leaf.py | PASS | PASS | OK |
| python:test_zen_profile.py | PASS | PASS | OK |
