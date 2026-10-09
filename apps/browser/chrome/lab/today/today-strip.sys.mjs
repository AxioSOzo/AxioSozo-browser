/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// "Today" as a strip (AxioSozo Lab, variant of today-sheet;
// docs/lab/experiments/today-strip.md): no page at all. One quiet line at the
// top of the sidebar's Projects section, "2 need you · 1 failed · 1 errand
// due", that opens in place into the lines behind it. Nothing opens by
// itself, nothing moves, nothing makes a sound: it is a sentence the eye
// passes on the way to the tabs.
//
// The facts are the same as the sheet's (today-model composeToday, gathered
// by today-data): agent sessions waiting for you, failed and finished since
// you last looked; servers that stopped with an error; errands due (when
// Errands is on). Opening the strip counts as looking. A line leads to its
// project's home in about:axiosozo, or to the errand's page in its space.
//
// Placement: the first child of the Projects section (#axiosozo-projects,
// ProjectSidebar.sys.mjs) when this space has one; otherwise right under the
// (hidden) space header, where that section would be (DevLoop's place()). It
// reads only the section's id; ProjectSidebar never reorders or clears
// children it did not make. Hidden in Zen's collapsed (icon) sidebar.

import { el, useStylesheet } from "../kit.sys.mjs";
import { todayData, TODAY_PREFS } from "./today-data.sys.mjs";
import { allLines, stripText, stripTone, GROUP_TONES } from "./today-model.sys.mjs";
import { errandStore } from "../errands/errand-store.sys.mjs";
import { errandActions, openErrandPage } from "../errands/errands.sys.mjs";

export const TODAY_STYLESHEET = "chrome://browser/content/axiosozo/lab/today/today.css";
export const STRIP_ID = "axiosozo-lab-today-strip";
const PROJECTS_SECTION = "axiosozo-projects";
/** Facts change between events (a date rolls over, an errand falls due): read again this often. */
export const STRIP_REFRESH_MS = 5 * 60 * 1000;
const RENDER_DELAY_MS = 120;

export function installTodayStrip(window, ctx) {
  return createTodayStrip(window, ctx, { data: todayData({ services: ctx.services }), errands: errandStore() });
}

/**
 * The strip in one window. deps: data (today-data), errands (the errand
 * store), prefs, timers ({ setTimeout, clearTimeout }) and now() for tests.
 */
export function createTodayStrip(window, ctx, { data, errands, prefs = globalThis.Services?.prefs ?? null, timers = null } = {}) {
  const { document } = window;
  const clock = timers ?? { setTimeout: (fn, ms) => window.setTimeout(fn, ms), clearTimeout: id => window.clearTimeout(id) };
  const release = useStylesheet(document, TODAY_STYLESHEET);
  const cleanups = [release];
  let disposed = false, timer = null, refresh = null, generation = 0;
  let open = null; // { since } while the list is open: what "since you last looked" meant when it opened
  let digest = null;

  const node = el(document, "div", { id: STRIP_ID, class: "axiosozo-lab-today", "data-tone": "quiet" });
  const line = el(document, "button", { type: "button", class: "axiosozo-lab-today-line", "aria-expanded": "false",
    "aria-controls": `${STRIP_ID}-list` });
  const dot = el(document, "span", { class: "axiosozo-lab-today-dot", "aria-hidden": "true" });
  const text = el(document, "span", { class: "axiosozo-lab-today-text", text: "Today" });
  const chevron = el(document, "span", { class: "axiosozo-lab-today-chevron", "aria-hidden": "true" });
  line.append(dot, text, chevron);
  const list = el(document, "ul", { id: `${STRIP_ID}-list`, class: "axiosozo-lab-today-list", "aria-label": "Today", hidden: true });
  node.append(line, list);
  cleanups.push(() => node.remove());

  // ---- placement ------------------------------------------------------------------------
  function place() {
    const uuid = (() => { try { return ctx.adapter?.activeWorkspaceUuid?.() ?? null; } catch { return null; } })();
    const workspace = uuid ? (() => { try { return ctx.adapter.workspaceElement?.(uuid) ?? null; } catch { return null; } })() : null;
    const section = document.getElementById(PROJECTS_SECTION);
    if (section && (!workspace || workspace.contains(section))) {
      if (section.firstChild !== node) section.insertBefore(node, section.firstChild);
      return true;
    }
    let header = null;
    try { header = uuid ? ctx.adapter.workspaceHeader?.(uuid) ?? null : null; } catch { header = null; }
    const parent = header?.parentNode ?? workspace;
    if (!parent) { node.remove(); return false; }
    const after = header?.parentNode === parent ? header : null;
    // Right after the space header (or first in the space), like the Projects section.
    const reference = after ? after.nextSibling ?? null : parent.firstChild;
    if (reference !== node && !(node.parentNode === parent && (after ? after.nextSibling === node : parent.firstChild === node))) {
      parent.insertBefore(node, reference ?? null);
    }
    return true;
  }

  // ---- drawing ----------------------------------------------------------------------------
  function lineItem(item) {
    const target = item.errand ? "Open its page" : item.project ? "Open the project" : null;
    const li = el(document, "li", { class: "axiosozo-lab-today-item", "data-group": item.group, "data-key": item.key });
    const main = el(document, "button", { type: "button", class: "axiosozo-lab-today-row", disabled: !target,
      "aria-label": [item.title, item.detail, target].filter(Boolean).join(". "), title: item.detail || item.title,
      "data-tone": GROUP_TONES[item.group] },
    el(document, "span", { class: "axiosozo-lab-today-row-dot", "aria-hidden": "true" }),
    el(document, "span", { class: "axiosozo-lab-today-row-text" },
      el(document, "span", { class: "axiosozo-lab-today-row-title", text: item.title }),
      item.detail ? el(document, "span", { class: "axiosozo-lab-today-row-detail", text: item.detail }) : null));
    main.addEventListener("click", event => { if (event.isTrusted !== false) follow(item); });
    li.append(main);
    if (item.errand) {
      const actions = el(document, "span", { class: "axiosozo-lab-today-row-actions" });
      for (const [action, label, words] of [["done", "Done", `Mark ${item.title} done`], ["snooze", "Tomorrow", `Snooze ${item.title} to tomorrow`]]) {
        const button = el(document, "button", { type: "button", class: "axiosozo-lab-today-chip", "data-action": action, "aria-label": words,
          title: label === "Done" ? "Done" : "Tomorrow", text: label });
        button.addEventListener("click", event => { if (event.isTrusted !== false) errandActions(window, ctx, errands).run(item.errand.id, action, { title: item.title }); });
        actions.append(button);
      }
      li.append(actions);
    }
    return li;
  }

  function follow(item) {
    if (item.errand) { openErrandPage(window, ctx, errands, item.errand.id).catch(() => {}); return; }
    if (item.project && typeof ctx.openOverview === "function") ctx.openOverview(`#project=${item.project.id}`);
  }

  function draw() {
    if (disposed || !digest) return;
    const counts = digest.counts;
    // Status where the eye already goes, only when there is something: a quiet
    // day shows no line at all (finished work waits in the sheet, the rows).
    const something = !!(counts.waiting || counts.failed || counts.due);
    node.hidden = !something && !open;
    const sentence = stripText(counts);
    node.setAttribute("data-tone", stripTone(counts));
    text.textContent = sentence;
    const expanded = !!open;
    line.setAttribute("aria-expanded", String(expanded));
    line.setAttribute("aria-label", `Today: ${sentence.replaceAll(" · ", ", ")}. ${expanded ? "Hide" : "Show"} the details`);
    node.toggleAttribute("data-open", expanded);
    list.hidden = !expanded;
    if (!expanded) { list.replaceChildren(); return; }
    const items = allLines(digest).map(lineItem);
    const hidden = Object.values(digest.more ?? {}).reduce((sum, count) => sum + count, 0);
    if (!items.length) items.push(el(document, "li", { class: "axiosozo-lab-today-empty", text: "Nothing waiting, failed or due. Nothing new finished." }));
    if (hidden) items.push(el(document, "li", { class: "axiosozo-lab-today-note", text: `${hidden} more not shown.` }));
    items.push(el(document, "li", { class: "axiosozo-lab-today-note", text: sinceText(digest.since) }));
    // Keep focus on the same row across a redraw.
    const focused = document.activeElement?.closest?.(".axiosozo-lab-today-item")?.getAttribute?.("data-key") ?? null;
    list.replaceChildren(...items);
    if (focused) list.querySelector(`.axiosozo-lab-today-item[data-key="${focused.replace(/["\\]/gu, "")}"] button`)?.focus?.();
  }

  function sinceText(since) {
    const date = new Date(since);
    const time = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const today = new Date(); const day = date.toDateString() === today.toDateString() ? "today" : date.toLocaleDateString("en-GB", { weekday: "long" });
    return `Finished and failed since you last looked (${day} ${time}). Composed on this Mac; nothing was sent.`;
  }

  async function render() {
    timer = null;
    if (disposed) return;
    const ticket = ++generation;
    let next;
    try { next = await data.digest({ since: open?.since ?? null }); } catch (error) { console.error("AxioSozo Lab: today could not be read", error); return; }
    if (disposed || ticket !== generation) return;
    digest = next;
    place();
    draw();
  }
  function schedule(delay = RENDER_DELAY_MS) {
    if (disposed || timer !== null) return;
    timer = clock.setTimeout(render, delay);
  }

  async function toggle() {
    if (open) { open = null; draw(); schedule(0); return; }
    let since = null;
    try { since = await data.since(); } catch { since = null; }
    if (disposed) return;
    open = { since };
    data.markSeen().catch(() => {});
    schedule(0);
  }
  line.addEventListener("click", event => { if (event.isTrusted !== false) toggle(); });
  node.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !open) return;
    event.preventDefault();
    open = null;
    draw();
    line.focus();
  });

  // ---- what makes it read again ----------------------------------------------------------------
  cleanups.push(data.acquire());
  try { ctx.agents?.watchExternal?.(); } catch {} // ends with ctx.signal
  try { ctx.agents?.subscribe?.(() => schedule()); } catch {}
  cleanups.push(data.subscribe(() => schedule()));
  try { cleanups.push(errands.subscribe(() => schedule())); } catch {}
  for (const name of ["attention", "projects", "contexts"]) {
    try { const off = ctx.services?.on?.(name, () => schedule()); if (typeof off === "function") cleanups.push(off); } catch {}
  }
  try { const off = ctx.adapter?.onUpdate?.(() => schedule()); if (typeof off === "function") cleanups.push(off); } catch {}
  const observer = { observe: () => schedule() };
  try { prefs?.addObserver?.(TODAY_PREFS.errands, observer); cleanups.push(() => prefs.removeObserver(TODAY_PREFS.errands, observer)); } catch {}
  const tick = () => { refresh = clock.setTimeout(() => { schedule(0); tick(); }, STRIP_REFRESH_MS); };
  tick();
  schedule(0);

  return {
    /** For tests: the strip element and what it last drew. */
    node, list, line,
    whenRendered: async () => { while (timer !== null) await new Promise(resolve => setTimeout(resolve, 5)); },
    dispose() {
      if (disposed) return;
      disposed = true;
      if (timer !== null) clock.clearTimeout(timer);
      if (refresh !== null) clock.clearTimeout(refresh);
      for (const cleanup of cleanups.reverse()) { try { cleanup(); } catch {} }
      data.forgetIfOff();
    },
  };
}

