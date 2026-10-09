/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// Lab experiment "agents-on-rows" (docs/lab/experiments/agents-on-rows.md),
// one of two takes on agent presence (the other: agents-folder). The project
// rows of the sidebar carry what their agents do, where the eye already goes:
//
//   - a mark on the row: a slow ring while an agent works, an amber dot when
//     one needs you, a check when one is done (quieter once its result was
//     seen), red when one failed. Beside the row (expanded sidebar) it is a
//     small button that opens the result card; on the icon (Zen's collapsed
//     sidebar) it is a corner badge;
//   - a small "Needs you" stack above the project list, only while an agent
//     of this space waits on you, one line per agent, each opening its card;
//   - the attention rule: entering needs_you raises one calm toast in one
//     window; done never interrupts.
//
// Sessions: every ctx.agents session of a project added to AxioSozo (runs
// started here, by any Lab experiment, and sessions found elsewhere). The
// rows are drawn by ProjectSidebar through its decoration hook
// (decorateProjectRows); this module never touches the sidebar's DOM, and
// turning it off removes the marks, the stack and its stylesheets.
import { decorateProjectRows } from "../../ProjectSidebar.sys.mjs";
import { el, useStylesheet } from "../kit.sys.mjs";
import { installAttention } from "../presence/attention.sys.mjs";
import { presenceHub } from "../presence/hub.sys.mjs";
import { agentIcon } from "../presence/icons.sys.mjs";
import { clientLabel, line, projectName, taskOf } from "../presence/model.sys.mjs";
import { besideSidebar, openResultCard } from "../presence/result-card.sys.mjs";
import { watchPresence } from "../presence/source.sys.mjs";

export const PRESENCE_STYLESHEET = "chrome://browser/content/axiosozo/lab/presence/presence.css";
export const ROWS_STYLESHEET = "chrome://browser/content/axiosozo/lab/agents-on-rows/agents-on-rows.css";
/** Lines in the Needs you stack before "N more". */
export const STACK_LIMIT = 4;

/** The row mark for a project's most urgent item, as ProjectSidebar's hook takes it. */
export function rowMarkOf(item, { seen = false } = {}) {
  if (!item) return null;
  return { state: item.state, label: item.label, title: item.subtitle, quiet: seen && (item.state === "done" || item.state === "stopped") };
}

export function installAgentsOnRows(window, ctx, { hub = presenceHub, decorate = decorateProjectRows, clock = undefined, timers = undefined } = {}) {
  const document = window.document;
  const sheets = [useStylesheet(document, PRESENCE_STYLESHEET), useStylesheet(document, ROWS_STYLESHEET)];
  const source = watchPresence(window, ctx, { hub, ...(clock ? { clock } : {}), ...(timers ? { timers } : {}) });
  let disposed = false;
  let expanded = false; // the stack shows all its lines

  const overPage = () => ({ browser: window.gBrowser?.selectedBrowser ?? null });
  function showCard(session, event, error = null, place = null) {
    const where = place ?? overPage();
    if (!where?.browser && !where?.anchor) return null;
    return openResultCard(window, ctx, { source, hub, sessionId: session.id, place: where, overTab: where.browser ? window.gBrowser?.selectedTab ?? null : null,
      focus: true, error });
  }
  const attention = installAttention(window, ctx, { source, hub, showCard: (session, event, error) => showCard(session, event, error), ...(clock ? { clock } : {}) });

  // ---- the Needs you stack ---------------------------------------------------------------------
  const headId = `axiosozo-agents-stack-head-${Math.random().toString(36).slice(2, 8)}`;
  const stack = el(document, "div", { class: "axiosozo-agents-stack", role: "group", "aria-labelledby": headId, hidden: true });
  const head = el(document, "div", { class: "axiosozo-agents-stack-head", id: headId, text: "Needs you" });
  const list = el(document, "ul", { class: "axiosozo-agents-stack-list" });
  stack.append(head, list);
  let stackSignature = null;

  const activeSpace = () => { try { return ctx.adapter?.activeWorkspaceUuid?.() ?? null; } catch { return null; } };
  const waiting = () => {
    const space = activeSpace();
    return source.items().filter(item => item.state === "needs_you" && (space === null || item.spaceUuid === space));
  };

  function renderStack() {
    const items = waiting();
    const shown = expanded ? items : items.slice(0, STACK_LIMIT);
    const signature = JSON.stringify([shown.map(item => [item.id, item.title, item.session.reason]), items.length, expanded]);
    if (signature === stackSignature) return;
    stackSignature = signature;
    stack.hidden = !items.length;
    list.replaceChildren(...shown.map(item => {
      const session = item.session;
      const reason = line(session.reason, 120) || "Waiting for your answer.";
      const node = el(document, "button", { type: "button", class: "axiosozo-agents-stack-item", title: `${item.subtitle}\n${reason}`,
        "aria-label": `${clientLabel(session)} needs you in ${projectName(session)}: ${taskOf(session)}. ${reason} Show`, "aria-haspopup": "dialog" },
      el(document, "img", { class: "axiosozo-agents-stack-icon", src: agentIcon(session.client, "needs_you"), alt: "", role: "presentation" }),
      el(document, "span", { class: "axiosozo-agents-stack-text" },
        el(document, "span", { class: "axiosozo-agents-stack-title", text: item.title }),
        el(document, "span", { class: "axiosozo-agents-stack-sub", text: reason })));
      node.addEventListener("click", event => { event.stopPropagation?.(); showCard(session, event, null, besideSidebar(window, node)); });
      return el(document, "li", {}, node);
    }));
    if (items.length > shown.length || expanded && items.length > STACK_LIMIT) {
      const more = el(document, "button", { type: "button", class: "axiosozo-agents-stack-more",
        text: expanded ? "Show fewer" : `${items.length - shown.length} more`, "aria-expanded": String(expanded) });
      more.addEventListener("click", event => { event.stopPropagation?.(); expanded = !expanded; renderStack(); });
      list.append(el(document, "li", {}, more));
    }
  }

  // ---- the rows, through ProjectSidebar's hook ------------------------------------------------
  const decoration = decorate(window, {
    top: stack,
    mark(project) {
      const item = source.strongestFor(project?.id);
      return rowMarkOf(item, { seen: item ? hub.isSeen(item.session) : false });
    },
    activate(project, anchor, event) {
      const item = source.strongestFor(project?.id);
      if (!item) return;
      const rowNode = anchor?.closest?.(".axiosozo-project") ?? anchor;
      showCard(item.session, event, null, besideSidebar(window, rowNode));
    },
  });

  function update() {
    if (disposed) return;
    renderStack();
    decoration.update();
  }
  const offSource = source.subscribe(update);
  let offSpaces = null;
  try { offSpaces = ctx.adapter?.onUpdate?.(update) ?? null; } catch { offSpaces = null; }
  update();

  function dispose() {
    if (disposed) return;
    disposed = true;
    offSource();
    try { offSpaces?.(); } catch {}
    attention.dispose();
    decoration.remove();
    stack.remove();
    source.dispose();
    for (const release of sheets) release();
  }
  ctx.signal?.addEventListener?.("abort", dispose, { once: true });
  return Object.freeze({ dispose, source, stack });
}
