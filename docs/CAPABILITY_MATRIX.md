# First-experience capability matrix

| Capability | Gecko | Chromium/CEF | Provider agent | Jev |
| --- | --- | --- | --- | --- |
| Navigate ordinary web URL/search | Implemented; fixture UI tested | Blocked outside local GET fixture | No automatic route | Off |
| Open/search saved pages | Implemented; fixture UI tested | Browser chrome only; fixture target not persisted privately | No access | Off |
| Separate browser environments | Firefox container creation and current label tested in native GUI; cookie and same-URL GUI matrix pending | Distinct native profile only for fixture; cookie audit pending | No access | Suggestion not wired |
| Read selection/page | Existing coordinator grant contract, adapter unsupported | Unsupported | No exposed tool | Off |
| Mutating browser actions | Native user input only | Fixture native input only | No exposed tool | No authority |
| Contextual answer/stream | Not connected | Not connected | Live auth/sandbox blocked | Off |
| TLS, extensions, accessibility, devtools | Native Zen/Firefox inherited; this slice did not run the full regression matrix | Full safety matrix blocked | No override | No override |

The `enabled` provider setting is an explicit local policy preference, not a
claim of authenticated or billed access. Disabled and unverified routes cannot
pass the admission check. No fallback retries a mutating action.
