# Idea (later): playful browser-owned error pages

Status: parked idea, not scheduled. Owner when picked up: Zen workstream.

## Scope

Only pages the browser renders itself because no site response exists:

- Offline / no network
- DNS failure / server not found
- Connection refused / timeout
- HTTP error with an empty body (e.g. blank 404/500) — our equivalent of
  Chrome's "This page isn't working"
- Tab crash (`about:tabcrashed`)

Out of scope: a site's own 404/500 page. If the server sends a body, it belongs
to the site owner and is shown untouched. No per-site variants.

## Principles

1. Calm first, playful second: a small Zen-style illustration or subtle
   animation; an optional mini-game (à la Chrome dino) at most.
2. Clarity wins: error cause and "Try again" stay on top and fully accessible;
   the fun part sits below.
3. Security pages stay serious: `about:certerror` and other TLS/safety warnings
   get no jokes and no tempting bypass affordances.
4. One universal mechanism: an error-page style setting (e.g. calm / playful)
   that applies identically everywhere.

## Implementation sketch

Keep Gecko's `about:neterror` machinery as the base and add only a CSS /
illustration layer, so upstream localization, retry logic and security
warnings keep working.
