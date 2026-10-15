# Errands (`errands`)

Lab switch `axiosozo.lab.errands.enabled` (group "Your day"). Code:
`apps/browser/chrome/lab/errands/` (`errands.sys.mjs`, `errand-store.sys.mjs`,
`errands.css`).

## What it is

The non-code to-dos that live on the signed-in web (an invoice to pay, a VAT
return to file, a message in a portal, a form to send), kept with the page
they belong to and its space.

- **Remember this…** in the page's context menu (normal windows; never in a
  private one), or **Remember this link…** on a link. A small card over the
  page: the page title (editable), the address and space ("billing.example.com/
  invoices/42 · in Work"), a due date (No date, Today, Tomorrow, Next week, or
  any day), then Remember. A toast "Remembered: Pay invoice 42 · In Work, due
  tomorrow." with Undo.
- **Find the date**, only on a click: one answer from the user's own AI
  (Claude Code, or Codex) with the date the page states and the exact words it
  came from: "Saturday 31 October 2026 / “Pay before 31 October 2026.” /
  Read by Claude Code. Check it on the page." with Use this date / Not this. The card says what goes before the click ("The page title
  and address go to Claude Code."). From the page menu that is the title and
  the origin + path only (never the query or fragment); from a capture (below)
  also the marked area. Not offered on sensitive sites (banking, health,
  government sign-ins): the card says so, and the errand is still kept locally.
- **Remember…** in the capture bar: right-drag over the part of a page with
  the date, choose Remember…, and Find the date reads that area
  (RegionCapture's extension point; no page text is read otherwise).
- **A count beside the space's name** in the space switcher: this space's open
  errands, tinted with Zen's accent when one is due today or earlier;
  gone at zero. It opens the space's list: each errand opens its page in its
  space (selecting the tab that shows it, if one does), Done (with Undo) and
  Tomorrow (snoozed until the next day; its due date stays).
- The today experiments ([sheet](today-sheet.md), [strip](today-strip.md))
  list the errands that are due.

An errand only points at the page. Humans pay, sign and submit; nothing here
fills, submits or reloads anything.

## Why

- Research (users, pain #11 and JTBD 7; landscape gap 4 and direction 6):
  founder admin is a real share of the week, it happens on billing pages and
  government portals behind logins, and nobody serves it with the same calm and
  hand-back safety. AxioSozo is already signed in, per space.
- Pain #6 ("my management is a text file in Notepad") and #9 (the right
  account): the errand opens in its own space, so in its container.
- Principles: deterministic first (an errand is useful without a model), AI
  as one optional, checkable step with its source shown, humans sign.

## How to try

1. about:axiosozo → Lab → Your day → turn on "Errands".
2. On a page (Harbor's "Billing settings", or any invoice page), right-click
   → Remember this…, pick Tomorrow or click Find the date, then Remember.
   Or right-drag over a date on a page and choose Remember… in the bar.
3. Click the count next to the space's name; open, Done (then Undo), Tomorrow.

## What to look at

- The card: does it feel like Zen (the capture bar's material), is it small
  enough, is the date choice fast? Light and dark, keyboard (Enter in the
  title remembers; Escape closes; the chips are toggles), VoiceOver.
- The count: is it legible next to the space name without crowding the dots?
  Is the due tint calm enough?
- Find the date: is the quoted sentence enough to trust the date? Does the
  title-only version (page menu) ever find anything (it does when the title
  says the date, as Dutch tax pages often do)?

## Privacy and safety

- Stored on this Mac only: `<profile>/axiosozo/lab/errands.json` (one list,
  each errand with its space; at most 200 open; done ones are forgotten after
  two weeks). Errands stay when the switch is off (they are yours), but nothing
  shows or runs.
- The stored address drops credentials; what may go to an AI is origin + path
  only. No AI on sensitive sites; never in private windows; only on a click.

## Live check (synthetic, 2026-10-09)

Real `ctx.ai` backend in Node, Claude Code Haiku: the title "Btw-aangifte 3e
kwartaal 2026: uiterlijk 31 oktober 2026 indienen" → 2026-10-31 with that
sentence (3.6 s, $0.0008); "Invoice 42 · Example Billing" → found false
(3.9 s); a synthetic invoice area image "Please pay before 23 October 2026 to
avoid a late fee." → 2026-10-23 with that exact sentence (3.8 s, $0.0003).

## Open questions

- Per space, or one list? Today: one list, each errand in its space; the count
  is per space, the today experiments show all spaces.
- Should Find the date read the visible page by itself (a capture without the
  drag)? Not done: RegionCapture exposes the capture bar, not a free capture,
  and a capture the user marks is the more honest input.
- Recurring errands (monthly invoices, quarterly VAT) are the obvious next
  step, and the bridge to the organization-space watches proposal
  ([space-admin-watch](space-admin-watch.md)).

## Honest expectation

The deterministic part (remember a page with its space and a date, see it
again when due, open it in the right account) is the valuable and simple
part, and I expect it to survive. Find the date is a nice touch when it reads
a marked area and nearly useless from a title. The count on the space switcher
is the right place for "this space has things for you", but it may compete
with the dots for room in narrow sidebars.
