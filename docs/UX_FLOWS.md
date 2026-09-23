# First browser experience · interaction map

The site is the main view. AxioSozo controls live in privileged Zen chrome and
do not enter the website DOM. The action button and `Cmd+K` expose the same
command registry. The browser's standard close, restore, history and back/forward
commands remain native. Compact mode does not force macOS fullscreen.

| Input | Current behavior |
| --- | --- |
| `Cmd+T` | Opens a temporary new-tab panel over the current page; no tab until Return on a URL/search result. Escape cancels and returns focus to content. |
| `Cmd+L` | Opens the same field for the current tab. |
| `Cmd+K` or Actions button | Lists registered actions, with keyboard filtering and selection. |
| `Cmd+,` | Opens the chrome-only provider settings window. |
| `Cmd+W`, `Cmd+Shift+T`, back/forward | Upstream Zen/Firefox behavior. |

In the navigation panel, a typed URL routes directly and other text goes to the
configured web search engine; the route is displayed before confirmation. Open
tabs and saved pages are separate result types. Results are restricted to the
current Firefox container, so a matching URL in another environment is never
selected by accident. Private windows do not query the persistent saved index.
`Cmd+Delete` on a selected saved result removes it. Native recent history is
currently omitted because its entries do not retain the container identifier
needed for this result list.

`Save and close` waits for the native beforeunload decision, commits the local
record, then closes. A storage error leaves the tab open. The command palette
offers `Undo save and close` for the most recent action; it reopens the URL in
the recorded container and removes the saved record. This does not promise
restoration of form contents. Saved records hold URL, original tab title, time,
container ID and optional note/fragment fields. There is no automatic archive
or background content capture.

`Environment` lists the default and public Firefox containers and can create a
named container. It opens a new tab there; it does not move cookies or infer a
website account. `Engine` delegates only to the existing strict CEF fixture
contract. Outside that verified local origin, it reports that Chromium is
unavailable. `Ask` currently reports the provider safety gate and sends no
selection or page content.
