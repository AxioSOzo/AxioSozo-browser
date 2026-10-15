# Admin watches in an organization space (`space-admin-watch`): proposal, not built

Status: **written up instead of built**. No switch, no code. This explains why,
and what a clean version would be.

## The idea

An organization space (Zen space of type "Organization", e.g. "Company admin")
holds a Zen live folder, "Watches", whose items are the user's own watches of
signed-in pages: "a new message in the tax portal", "the September
invoice is ready on the Vercel billing page", "a failed payment in Stripe".
Each item is a lazy tab that opens the page in the space (its container,
its accounts); a changed watch shows on the item, and on the space's dot.
Humans read, pay, sign and submit; the watch only says "look here".

Research fit: landscape direction 6 and pattern 24 (watches as live-folder
items), pattern 3 (results as tabs in a live folder), users pain #11 (founder
admin) and #7 (change, not dashboards).

## Why it is not built tonight

I read `WatchController.sys.mjs`, `contexts/watches.mjs`, contract
`workstation-v1.md §8`, `decision-v1.md` (`watch_v1`) and Zen's live folders
(`src/zen/live-folders/`, `notes/lab/zen-live-folders.md`). Re-using them
cleanly is not possible without decisions that are not mine to take:

1. **Production watch checks are closed by contract.** The one WatchController
   is constructed with immutable `liveAuthorized: false`: an eligible check
   records "unknown / NOT_AUTHORIZED, data_sent: false" and opens, captures and
   asks nothing. An admin watch on top of it would never say anything true.
2. **Watches belong to a project, not a space.** Each record has a
   `project_id`; creation is a trusted click on the project's home through the
   actor's private messages. An organization space has no project. Widening
   the store (a `context_uuid`) is a contract change for the integration lead.
3. **The judgement is an AI decision** (`jev` or `openai` keys, `watch_v1`
   choice set) over an observation of the page. For a tax portal that means
   loading a signed-in government page in the background and sending what it
   shows to a model: the contract caps sensitive hosts to `address`
   observation, hidden tabs in the right container are an unverified native
   capability, and "an agent acting with my logins" is the trust line users
   draw (pain #18). eHerkenning sessions also expire, so a background check of
   the tax office would mostly see a login page.
4. **A custom Zen live-folder provider** is possible at runtime
   (`ZenLiveFoldersManager.registry.set(...)`), but Zen restores live folders
   from `zen-live-folders.jsonlz4` before a Lab experiment registers its type,
   so the experiment must re-adopt its folders (`adoptSyncedFolder`) and delete
   them on switch-off. Doable, but not "simple" on top of points 1-3.

## What a clean version would be (in this order)

1. **Recurring errands first, no polling.** Errands (built tonight) gain a
   repeat ("every month on the 5th", "each quarter, by the end of the next
   month" for the Dutch VAT return). That covers most founder admin with no
   background loading at all: the date is known, the page is known, the space
   is known.
2. **"Changed since my last visit", checked only while I am there.** When the
   user opens a watched page themselves (foreground, signed in, present), the
   browser compares the area they once marked (a capture of the inbox count,
   the invoice list) with the last visit, deterministically (text or pixels),
   and marks the live-folder item "changed" for next time. Nothing loads
   without the user; nothing leaves the Mac.
3. **Only then, if wanted, a background check** for non-sensitive billing pages
   (Vercel, Stripe, Google Cloud) through the watch contract, once the
   integration lead authorizes live checks, hidden tabs in the space's
   container, and space-owned (not project-owned) watches.
4. **The folder itself**: a provider type `axiosozo-watches`, registered before
   Zen restores (in `AxioSozoStartup`, outside the Lab) or re-adopted after;
   items `{ title, subtitle: "Changed since Tuesday", url }`; dismissing a tab
   marks it seen; switching off deletes the folders.

## Honest expectation

Step 1 (recurring errands) would give the owner most of the value next week and is
a small change to the errand store. Step 2 is the interesting, safe novelty.
Step 3 is where products like this go wrong (acting with the user's identity
in the background) and should stay out until a real need is shown.
