/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. https://mozilla.org/MPL/2.0/ */

// One window's live view of the user's agent sessions, for the presence
// experiments: every ctx.agents session (runs started from this browser,
// including the ones other Lab experiments start with ctx.agents.startTask,
// and sessions started elsewhere: watchExternal polls `claude agents --json`
// and reads the axiosozo-notify hooks while this view lives), the projects
// they belong to (and so their space), and the hub's dismissals. Listeners
// hear { items, session } after any change, batched to one call per tick;
// `session` is the snapshot that changed (null for a project, dismissal or
// expiry change) so the attention rule can see every transition.
//
// Everything ends with dispose() or ctx.signal (the experiment went off or
// the window closed): the subscription, external watching and the timer.
import { DAY_MS, presenceItems, strongestFor } from "./model.sys.mjs";

/** How often finished sessions are checked against their day. */
export const EXPIRY_CHECK_MS = 5 * 60 * 1000;

export function watchPresence(window, ctx, { hub, clock = () => Date.now(), timers = window, keepMs = DAY_MS, external = true } = {}) {
  const sessions = new Map(); // id → snapshot
  let projects = [];
  let projectsLoaded = false;
  let items = [];
  let lastSignature = null;
  let disposed = false;
  let timer = null;
  let pending = null; // sessions changed since the last emit
  const listeners = new Set();
  const offs = [];

  const projectById = id => projects.find(project => project?.id === id) ?? null;
  const spaceOf = id => { const space = projectById(id)?.context_uuid; return typeof space === "string" ? space : null; };
  const compute = () => presenceItems([...sessions.values()], { now: clock(), hidden: session => hub.isHidden(session), spaceOf, keepMs });
  const signature = list => JSON.stringify(list.map(item => [item.id, item.subtitle, item.title, item.spaceUuid, hub.isSeen(item.session),
    item.session.files?.byRun?.length ?? 0, item.session.canStop, item.session.updatedAt]));

  function emit() {
    if (disposed) return;
    const changed = pending ?? [];
    pending = null;
    const next = compute();
    // The last signature as it was then (seen and dismissed are read now, so the old items cannot be re-signed).
    const nextSignature = signature(next);
    const moved = nextSignature !== lastSignature;
    lastSignature = nextSignature;
    items = next;
    if (!moved && !changed.length) return;
    for (const listener of [...listeners]) {
      try { listener({ items, sessions: changed }); } catch (error) { console.error("AxioSozo Lab: presence view failed", error); }
    }
  }
  let scheduled = false;
  function schedule(session = null) {
    if (disposed) return;
    if (session) (pending ??= []).push(session);
    else pending ??= [];
    if (scheduled) return;
    scheduled = true;
    Promise.resolve().then(() => { scheduled = false; emit(); });
  }

  async function loadProjects() {
    let list = [];
    try { const result = await ctx.services?.listProjects?.(); list = Array.isArray(result) ? result : []; } catch { list = projects; }
    if (disposed) return;
    projects = list;
    projectsLoaded = true;
    schedule();
  }

  function onAgents(event) {
    if (disposed || !event) return;
    if (event.type === "changed" && typeof event.session?.id === "string") {
      sessions.set(event.session.id, event.session);
      schedule(event.session);
    } else if (event.type === "removed" && typeof event.id === "string") {
      sessions.delete(event.id);
      hub.forget(event.id);
      schedule();
    }
  }

  function tick() {
    timer = null;
    if (disposed) return;
    schedule();
    timer = timers.setTimeout(tick, EXPIRY_CHECK_MS);
  }

  // Start: what ctx.agents already knows, then every change.
  try { for (const session of ctx.agents.list() ?? []) if (typeof session?.id === "string") sessions.set(session.id, session); }
  catch (error) { console.error("AxioSozo Lab: agent sessions unavailable", error); }
  hub.baseline([...sessions.values()]);
  try { offs.push(ctx.agents.subscribe(onAgents)); } catch (error) { console.error("AxioSozo Lab: agent sessions not followed", error); }
  if (external) { try { offs.push(ctx.agents.watchExternal()); } catch (error) { console.error("AxioSozo Lab: other sessions not watched", error); } }
  offs.push(hub.onChange(() => schedule()));
  try { const off = ctx.services?.on?.("projects", () => { loadProjects(); }); if (typeof off === "function") offs.push(off); } catch {}
  items = compute();
  lastSignature = signature(items);
  loadProjects();
  timer = timers.setTimeout(tick, EXPIRY_CHECK_MS);

  function dispose() {
    if (disposed) return;
    disposed = true;
    if (timer !== null) { try { timers.clearTimeout(timer); } catch {} timer = null; }
    for (const off of offs.splice(0)) { try { off?.(); } catch {} }
    listeners.clear();
  }
  ctx.signal?.addEventListener?.("abort", dispose, { once: true });

  return Object.freeze({
    /** Visible items, most urgent first (model.sys.mjs presenceItems). */
    items: () => items,
    item: id => items.find(item => item.id === id) ?? null,
    itemsOfSpace: uuid => items.filter(item => item.spaceUuid === uuid),
    strongestFor: projectId => strongestFor(items, projectId),
    /** The latest snapshot of a session, shown or not. */
    session: id => sessions.get(id) ?? null,
    projects: () => projects,
    projectById,
    /** Whether the projects were read at least once (until then no item knows its space). */
    projectsLoaded: () => projectsLoaded,
    /** listener({ items, sessions }) after changes. Returns off(). */
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    refresh: () => schedule(),
    dispose,
    get disposed() { return disposed; },
  });
}
