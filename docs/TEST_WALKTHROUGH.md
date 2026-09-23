# Manual first-experience verification

Use the root commands on the Apple Silicon Mac. Before a native build, run
`/Users/wout/.local/bin/mount-dev-storage`; `./dev setup` invokes the required
`dev-external` and project storage broker. Do not use personal profiles.

1. Run `./dev check`, `./dev test`, then `./dev setup` after source changes.
2. Start `./dev smoke` for an owned HTTP fixture and fresh profile. Inspect the
   exact run in the actual AxioSozo Dev window. The driver deliberately exits
   20 until automated GUI assertions exist.
3. On the fixture page, press `Cmd+T`, then Escape. Confirm no blank tab and
   content focus. Press `Cmd+T` again, enter the printed fixture URL with
   `?page=2`, and Return. Confirm page 2 in a second tab.
4. Press `Cmd+K`, filter `Save`, Return. Confirm page 2 closes. Press `Cmd+T`,
   type `page=2`, confirm the result is marked `Saved`, press ArrowDown to
   select it below `Web search`, then Return to reopen.
   Check `Cmd+Delete` removal and `Undo save and close` in a separate run.
5. Press `Cmd+,` and inspect metadata-only provider settings. Try zero, one,
   two and three configured instances in a disposable development profile;
   enabling cannot start a client before live gates pass.
6. Use `Environment` to make a test container; verify it is marked as the
   current browser environment. The same-URL container search and private
   window exclusion are still manual regression cases, not recorded GUI PASS.
7. Use `./dev engine-probe` separately for the strict local CEF fixture. Never
   treat that as proof of general Chromium browsing. `Ask` and Jev remain
   blocked unless their separate live authorization and safety gates pass.

Record the exact session directory, UI screenshots, app stderr, tab counts,
focus, process counts and clock measurements. Do not mark a gate PASS from an
offline fixture or from `./dev smoke` starting successfully.
